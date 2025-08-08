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
  position: relative;                /* importante p/ z-index funcionar */
  width: 100%;
  height: 128px;
  margin-top: 12px;
  cursor: crosshair;

  .spec-overlay {
    position: absolute;
    inset: 0;
    z-index: 5;                      /* fica por cima do heatmap */
    width: 100%;
    height: 100%;
    pointer-events: none;            /* clique passa para o canvas do plugin */
  }
`;


const Overlay = styled.canvas`
  position: absolute;
  inset: 0;
  /* captura clique acima do canvas do plugin */
`;

const SpectrogramOnClick = ({ audioUrl, onReady, onClickTimeFreq }) => {
  const waveformRef    = useRef(null);
  const spectroWrapRef = useRef(null);   // container do plugin
  const overlayRef     = useRef(null);   // canvas overlay
  const wsRef          = useRef(null);
  const srRef          = useRef(44100);  // sample rate fallback

  // cria wavesurfer + plugin apenas 1x
  useEffect(() => {
    const ws = WaveSurfer.create({
      container:     waveformRef.current,
      waveColor:     '#888',
      progressColor: '#5c6bc0',
      cursorColor:   '#fff',
      scrollParent:  true,
      backend:       'WebAudio',
      height:        100,
      responsive:    true,
      plugins: [
        SpectrogramPlugin.create({
          container:    spectroWrapRef.current,
          labels:       true,
          height:       128,
          splitChannels:false,            // evita duplicar por canal
          scale:        'linear',         // mapeamento Y->Hz linear
          // frequencyMin: 0,             // opcional
          // frequencyMax: será sr/2; o plugin já assume isso por padrão
        })
      ],
    });
    wsRef.current = ws;
    onReady && onReady(ws);

    // quando pronto, obtem sampleRate e ajusta overlay
    const onWsReady = () => {
      const sr = ws.backend?.buffer?.sampleRate;
      if (sr) srRef.current = sr;

      resizeOverlay();  // ajusta tamanho do canvas overlay
    };
    ws.on('ready', onWsReady);

    // limpa no unmount
    return () => {
      ws.un('ready', onWsReady);
      try {
        ws.stop();      // pode disparar AbortError internamente
        ws.destroy();
      } catch (err) {
        if (err?.name !== 'AbortError') console.error(err);
      }
    };
  }, [onReady]);

  // carrega o áudio sempre que a URL muda
  useEffect(() => {
    wsRef.current?.load(audioUrl);
  }, [audioUrl]);

  // mantém overlay com DPI correto
  useEffect(() => {
    const ro = new ResizeObserver(resizeOverlay);
    const el = spectroWrapRef.current;
    if (el) ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function resizeOverlay() {
    const overlay = overlayRef.current;
    const wrap    = spectroWrapRef.current;
    if (!overlay || !wrap) return;
    const rect = wrap.getBoundingClientRect();
    const dpr  = window.devicePixelRatio || 1;
    overlay.width  = Math.max(1, Math.floor(rect.width  * dpr));
    overlay.height = Math.max(1, Math.floor(rect.height * dpr));
    overlay.style.width  = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;
    // opcional: limpar overlay
    const ctx = overlay.getContext('2d');
    ctx.clearRect(0, 0, overlay.width, overlay.height);
  }

  function handleClick(e) {
    const ws      = wsRef.current;
    const overlay = overlayRef.current;
    const wrap    = spectroWrapRef.current;
    if (!ws || !overlay || !wrap) return;

    const rect = wrap.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const relX = x / rect.width;
    const relY = y / rect.height;

    // tempo (s): relativo ao comprimento do áudio
    const duration = ws.getDuration() || 0;
    const time = Math.max(0, Math.min(duration, relX * duration));

    // frequência (Hz): linear entre 0 e Nyquist
    const nyquist = srRef.current / 2;
    const freqHz  = (1 - relY) * nyquist;   // topo = nyquist, base = 0 Hz

    // desenha linha horizontal no overlay (opcional)
    const ctx   = overlay.getContext('2d');
    const dpr   = window.devicePixelRatio || 1;
    const yPix  = Math.round(relY * overlay.height);
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    ctx.beginPath();
    ctx.moveTo(0, yPix);
    ctx.lineTo(overlay.width, yPix);
    ctx.lineWidth   = 2 * dpr;
    ctx.strokeStyle = 'yellow';
    ctx.stroke();

    onClickTimeFreq
      ? onClickTimeFreq({ time, freq: freqHz, magnitude: null })
      : console.log(`t=${time.toFixed(2)}s, f=${(freqHz/1000).toFixed(2)} kHz`);
  }

  return (
    <Container>
      <WaveformWrapper ref={waveformRef} />
      <SpectrogramWrapper ref={spectroWrapRef}>
        <Overlay ref={overlayRef} onClick={handleClick} />
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
