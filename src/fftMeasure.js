// src/fftMeasure.js
// Medição consistente por PSD média (Welch) + percentis de energia.
// Sem dependências externas.

const hann = (N) => {
  const w = new Float32Array(N);
  for (let n = 0; n < N; n++) w[n] = 0.5 * (1 - Math.cos((2 * Math.PI * n) / (N - 1)));
  return w;
};

const nearestPow2 = (n) => 2 ** Math.round(Math.log2(Math.max(32, n)));

function fftRadix2(re, im) {
  const n = re.length;
  // bit-reversal
  let j = 0;
  for (let i = 0; i < n; i++) {
    if (i < j) { const tr = re[i]; const ti = im[i]; re[i] = re[j]; im[i] = im[j]; re[j] = tr; im[j] = ti; }
    let m = n >> 1;
    while (m >= 1 && j >= m) { j -= m; m >>= 1; }
    j += m;
  }
  // Danielson–Lanczos
  for (let size = 2; size <= n; size <<= 1) {
    const half = size >> 1;
    const theta = -2 * Math.PI / size;
    const wpr = Math.cos(theta);
    const wpi = Math.sin(theta);
    for (let start = 0; start < n; start += size) {
      let wr = 1, wi = 0;
      for (let k = 0; k < half; k++) {
        const i = start + k, j = i + half;
        const tr = wr * re[j] - wi * im[j];
        const ti = wr * im[j] + wi * re[j];
        re[j] = re[i] - tr; im[j] = im[i] - ti;
        re[i] += tr; im[i] += ti;
        const tmp = wr;
        wr = tmp * wpr - wi * wpi;
        wi = tmp * wpi + wi * wpr;
      }
    }
  }
}

function toMono(buffer, s0, s1) {
  const sr = buffer.sampleRate || 48000;
  const nCh = buffer.numberOfChannels || 1;
  const len = Math.max(0, s1 - s0);
  const out = new Float32Array(len);
  for (let ch = 0; ch < nCh; ch++) {
    const data = buffer.getChannelData(ch).subarray(s0, s1);
    for (let i = 0; i < len; i++) out[i] += data[i];
  }
  const inv = 1 / Math.max(1, nCh);
  for (let i = 0; i < len; i++) out[i] *= inv;
  return { sr, mono: out };
}

/**
 * Mede métricas estáveis na região [t0, t1].
 * opts:
 *   - fftSize: tamanho NFFT (padrão 4096)
 *   - overlap: sobreposição [0..1) (padrão 0.5)
 *   - winSec: tamanho da janela em segundos (se não passar, usa fftSize/sr)
 *   - bandPercentile: [pLow, pHigh] (padrão [0.05, 0.95])
 */
export function measureRegionFreqs(buffer, t0, t1, opts = {}) {
  const sr = buffer.sampleRate || 48000;
  const s0 = Math.max(0, Math.floor(t0 * sr));
  const s1 = Math.min((buffer.length || 0), Math.max(s0 + 1, Math.floor(t1 * sr)));

  const fftSize = nearestPow2(opts.fftSize || 4096);
  const overlap = Math.min(0.95, Math.max(0, opts.overlap ?? 0.5));
  const hop = Math.max(1, Math.floor(fftSize * (1 - overlap)));
  const win = hann(fftSize);
  const { mono } = toMono(buffer, s0, s1);

  let frames = 0;
  const nBins = (fftSize >> 1) + 1;
  const acc = new Float64Array(nBins);

  if (mono.length < 2) {
    return { lowHz: 0, highHz: 0, peakHz: 0, centroidHz: 0, frames: 0 };
  }

  for (let start = 0; start + fftSize <= mono.length; start += hop) {
    const re = new Float64Array(fftSize);
    const im = new Float64Array(fftSize);
    // janela Hann
    for (let i = 0; i < fftSize; i++) re[i] = mono[start + i] * win[i];
    fftRadix2(re, im);
    // magnitude^2 dos bins positivos
    for (let k = 0; k < nBins; k++) {
      const p = re[k] * re[k] + im[k] * im[k];
      acc[k] += p;
    }
    frames++;
  }

  if (frames === 0) {
    // zero-pad uma janela
    const re = new Float64Array(fftSize);
    const im = new Float64Array(fftSize);
    for (let i = 0; i < Math.min(fftSize, mono.length); i++) re[i] = mono[i] * win[i];
    fftRadix2(re, im);
    for (let k = 0; k < nBins; k++) acc[k] += re[k] * re[k] + im[k] * im[k];
    frames = 1;
  }

  // PSD média (não normalizamos por fatores de janela — objetivos comparativos)
  for (let k = 0; k < nBins; k++) acc[k] /= frames;

  // suavização leve (média móvel 3 bins)
  const psd = new Float64Array(nBins);
  for (let k = 0; k < nBins; k++) {
    const a = acc[Math.max(0, k - 1)];
    const b = acc[k];
    const c = acc[Math.min(nBins - 1, k + 1)];
    psd[k] = (a + b + c) / 3;
  }

  // métricas
  const binHz = sr / fftSize;
  let peakIdx = 0; let peakVal = -Infinity;
  let sumP = 0;
  let sumFP = 0;
  for (let k = 0; k < nBins; k++) {
    const P = psd[k];
    sumP += P;
    sumFP += (k * binHz) * P;
    if (P > peakVal) { peakVal = P; peakIdx = k; }
  }
  const centroidHz = sumP > 0 ? (sumFP / sumP) : 0;
  const peakHz = peakIdx * binHz;

  // percentis de energia
  const [pLow, pHigh] = opts.bandPercentile || [0.05, 0.95];
  let lowIdx = 0, highIdx = nBins - 1;
  if (sumP > 0) {
    let csum = 0;
    for (let k = 0; k < nBins; k++) {
      csum += psd[k];
      const frac = csum / sumP;
      if (frac >= pLow && lowIdx === 0) lowIdx = k;
      if (frac >= pHigh) { highIdx = k; break; }
    }
  }

  return {
    lowHz: lowIdx * binHz,
    highHz: highIdx * binHz,
    peakHz,
    centroidHz,
    frames,
  };
}
