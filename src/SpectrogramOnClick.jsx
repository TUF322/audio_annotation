// SpectrogramOnClick.jsx
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import WaveSurfer from 'wavesurfer.js';
import SpectrogramPlugin from 'wavesurfer.js/dist/plugins/spectrogram.esm.js';
import styled from 'styled-components';

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const WaveformWrapper = styled.div`
  width: 100%;
  height: 100px;
`;

const SpectrogramWrapper = styled.div`
  position: relative;          /* chave: vira âncora do overlay */
  width: 100%;
  height: 128px;
  margin-top: 12px;
`;

const OverlayCanvas = styled.canvas`
  position: absolute;
  inset: 0;
  z-index: 3;                  /* fica por cima do heatmap */
  pointer-events: auto;        /* recebe cliques */
`;

const SpectrogramOnClick = ({ audioUrl, onReady, onClickTimeFreq }) => {
  const waveformRef    = useRef(null);
  const spectrogramRef = useRef(null);      // container onde o plugin desenha
  const overlayRef     = useRef(null);      // nosso canvas por cima
  const wsRef          = useRef(null);
  const specPluginRef  = useRef(null);

  // guardas pra conversão y -> Hz
  const fminRef = useRef(0);
  const fmaxRef = useRef(22050);

  useEffect(() => {
    // 1) cria WaveSurfer
    const ws = WaveSurfer.create({
      container:     waveformRef.current,
      waveColor:     '#888',
      progressColor: '#5c6bc0',
      cursorColor:   '#fff',
      scrollParent:  true,
      backend:       'WebAudio',
      height:        100,
      responsive:    true,
    });
    wsRef.current = ws;

    // 2) cria plugin de espectrograma e registra
    const spec = SpectrogramPlugin.create({
      container:     spectrogramRef.current,
      labels:        true,
      height:        128,
      splitChannels: false,
      fftSamples:    1024,
      scale:         'linear',            // <— linear pra conversão direta
      // frequencyMax será ajustado quando o áudio estiver pronto
    });
    ws.registerPlugin(spec);
    specPluginRef.current = spec;

    // 3) expõe a instância pro pai
    if (typeof onReady === 'function') onReady(ws);

    // 4) quando pronto, ajusta faixa de frequências (0 .. nyquist)
    ws.on('ready', () => {
      const sr = ws.backend?.buffer?.sampleRate || 44100;
      fminRef.current = 0;
      fmaxRef.current = sr / 2;

      // alguns builds do plugin suportam setOptions; se não suportar, ignore.
      try {
        spec.setOptions?.({ frequencyMin: 0, frequencyMax: fmaxRef.current, scale: 'linear' });
      } catch (_) {}

      // sincroniza overlay com o canvas do espectrograma
      syncOverlaySize();
    });

    // 5) carregar áudio
    ws.load(audioUrl);

    // 6) ResizeObserver mantém overlay = mesmo tamanho do canvas do plugin
    const ro = new ResizeObserver(() => syncOverlaySize());
    // observar o container (o canvas do plugin é filho)
    if (spectrogramRef.current) ro.observe(spectrogramRef.current);

    // 7) clique no overlay
    const overlay = overlayRef.current;
    const handleClick = (e) => {
      const ws  = wsRef.current;
      if (!ws || !overlay) return;

      const rect = overlay.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // tempo (largura do overlay corresponde à duração)
      const duration = ws.getDuration() || 0;
      const time = (x / rect.width) * duration;

      // frequência (escala linear definida no plugin)
      const fmin = fminRef.current;
      const fmax = fmaxRef.current;
      const freq = fmin + (1 - y / rect.height) * (fmax - fmin);

      // desenha uma marquinha/label no overlay
      drawMarker(x, y, `${(freq / 1000).toFixed(2)} kHz`);

      if (typeof onClickTimeFreq === 'function') {
        onClickTimeFreq({ time, freq, magnitude: null });
      } else {
        console.log(`Tempo: ${time.toFixed(2)}s, Freq: ${freq.toFixed(0)}Hz, Mag: null`);
      }
    };
    overlay?.addEventListener('click', handleClick);

    // cleanup
    return () => {
      overlay?.removeEventListener('click', handleClick);
      ro.disconnect();
      try {
        ws.destroy();
      } catch (err) {
        if (err?.name !== 'AbortError') console.error(err);
      }
    };
  }, [audioUrl, onReady, onClickTimeFreq]);

  // — helpers —

  // deixa o overlay exatamente no mesmo tamanho “real” do canvas do plugin
  const syncOverlaySize = () => {
    const overlay = overlayRef.current;
    const container = spectrogramRef.current;
    if (!overlay || !container) return;

    // o plugin usa CSS para dimensionar; igualamos o nosso
    const { width, height } = container.getBoundingClientRect();
    overlay.style.width  = `${width}px`;
    overlay.style.height = `${height}px`;

    // e ajustamos o buffer interno pra densidade de pixels (nítido)
    const dpr = window.devicePixelRatio || 1;
    overlay.width  = Math.max(1, Math.floor(width  * dpr));
    overlay.height = Math.max(1, Math.floor(height * dpr));

    const ctx = overlay.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // escala o sistema de coords
    clearOverlay();
  };

  const clearOverlay = () => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext('2d');
    const { width, height } = overlay.getBoundingClientRect();
    ctx.clearRect(0, 0, width, height);
  };

  const drawMarker = (x, y, label) => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext('2d');
    const { width, height } = overlay.getBoundingClientRect();

    clearOverlay();

    // linha horizontal
    ctx.strokeStyle = 'rgba(255,255,0,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();

    // *tooltip* simples
    const pad = 6;
    ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto';
    const tm = ctx.measureText(label);
    const tw = tm.width + pad * 2;
    const th = 18;

    let tx = Math.min(Math.max(4, x + 8), width - tw - 4);
    let ty = Math.max(th + 4, y - 8);

    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(tx, ty - th, tw, th);
    ctx.fillStyle = '#fff';
    ctx.fillText(label, tx + pad, ty - 5);
  };

  return (
    <Container>
      <WaveformWrapper ref={waveformRef} />
      <SpectrogramWrapper ref={spectrogramRef}>
        <OverlayCanvas ref={overlayRef} />
      </SpectrogramWrapper>
    </Container>
  );
};

SpectrogramOnClick.propTypes = {
  audioUrl:        PropTypes.string.isRequired,
  onReady:         PropTypes.func,
  onClickTimeFreq: PropTypes.func,
};
SpectrogramOnClick.defaultProps = {
  onReady:         null,
  onClickTimeFreq: null,
};

export default SpectrogramOnClick;
