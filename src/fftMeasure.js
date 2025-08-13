// fftMeasure.js
import FFT from "fft.js";

// janela Hann
function hann(N) {
  const w = new Float32Array(N);
  for (let n = 0; n < N; n++) w[n] = 0.5 * (1 - Math.cos((2 * Math.PI * n) / (N - 1)));
  return w;
}

// mixdown para mono
function mixToMono(buffer) {
  if (buffer.numberOfChannels === 1) return buffer.getChannelData(0);
  const len = buffer.length;
  const out = new Float32Array(len);
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < len; i++) out[i] += data[i] / buffer.numberOfChannels;
  }
  return out;
}

/**
 * Mede low/high/peak/centroid Hz reais numa janela temporal (STFT/Welch).
 * Usa fft.js corretamente (array complexo intercalado).
 * @returns { lowHz, highHz, peakHz, centroidHz, frames }
 */
export function measureRegionFreqs(buffer, startSec, endSec, opts = {}) {
  const sr = buffer.sampleRate;
  const start = Math.max(0, Math.floor(startSec * sr));
  const end = Math.min(buffer.length, Math.ceil(endSec * sr));
  const mono = mixToMono(buffer).subarray(start, end);

  const fftSize = opts.fftSize ?? 2048;    // Δf = sr / N
  const hopSize = opts.hopSize ?? (fftSize >> 2);
  const floorDb = opts.floorDb ?? -25;
  const maxHz = opts.maxHz ?? sr / 2;

  if (mono.length < fftSize) {
    return { lowHz: 0, highHz: 0, peakHz: 0, centroidHz: 0, frames: 0 };
  }

  const win = hann(fftSize);
  const fft = new FFT(fftSize);
  const input = new Float32Array(fftSize);          // buffer de entrada
  const out = fft.createComplexArray();             // <<< array complexo (2*N)
  const mags = new Float32Array(fftSize / 2);

  const binToHz = (bin) => (bin * sr) / fftSize;
  const hzToBin = (hz) => Math.min(mags.length - 1, Math.floor((hz * fftSize) / sr));
  const nyqBin = hzToBin(maxHz);

  let peakSum = 0, frames = 0, centroidSum = 0;
  const lows = [], highs = [];

  for (let i = 0; i + fftSize <= mono.length; i += hopSize) {
    // janela -> input
    for (let n = 0; n < fftSize; n++) input[n] = (mono[i + n] || 0) * win[n];

    // FFT (input ≠ out)
    fft.realTransform(out, input);
    fft.completeSpectrum(out);

    // magnitudes 0..Nyquist
    let maxMag = 0, maxBin = 0, sumMag = 0, sumMagFreq = 0;
    for (let b = 0; b <= nyqBin; b++) {
      const re = out[2 * b];
      const im = out[2 * b + 1];
      const m = Math.hypot(re, im);
      mags[b] = m;
      if (m > maxMag) { maxMag = m; maxBin = b; }
    }

    // banda significativa (pico - floorDb)
    const thresh = maxMag * Math.pow(10, floorDb / 20);
    let lo = maxBin, hi = maxBin;
    for (let b = maxBin; b >= 0; b--) { if (mags[b] >= thresh) lo = b; else break; }
    for (let b = maxBin; b <= nyqBin; b++) { if (mags[b] >= thresh) hi = b; else break; }

    // centroid
    for (let b = 0; b <= nyqBin; b++) {
      const f = binToHz(b), m = mags[b];
      sumMag += m; sumMagFreq += m * f;
    }
    const centroid = sumMag > 0 ? sumMagFreq / sumMag : binToHz(maxBin);

    lows.push(lo); highs.push(hi);
    peakSum += binToHz(maxBin);
    centroidSum += centroid;
    frames++;
  }

  if (!frames) return { lowHz: 0, highHz: 0, peakHz: 0, centroidHz: 0, frames: 0 };

  const pct = (arr, p) => {
    const s = arr.slice().sort((a,b)=>a-b);
    const i = Math.max(0, Math.min(s.length - 1, Math.floor((p/100)*(s.length-1))));
    return s[i];
  };

  return {
    lowHz: binToHz(pct(lows, 10)),
    highHz: binToHz(pct(highs, 90)),
    peakHz: peakSum / frames,
    centroidHz: centroidSum / frames,
    frames,
  };
}
