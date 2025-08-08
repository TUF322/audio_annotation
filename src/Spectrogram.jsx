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
  width: 100%;
  height: 128px;
  margin-top: 12px;
  cursor: crosshair;
`;

const Spectrogram = ({ audioUrl, onReady, onClickTimeFreq }) => {
  const waveformRef    = useRef(null);
  const spectrogramRef = useRef(null);
  const wsRef          = useRef(null);
  let freqData         = null;

  useEffect(() => {
    // 1) Cria instância
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

    // 2) Cria plugin de espectrograma
    const spectrogramPlugin = SpectrogramPlugin.create({
      container:     spectrogramRef.current,
      labels:        true,
      height:        128,
      splitChannels: false,
      fftSamples:    1024,
    });
    ws.registerPlugin(spectrogramPlugin);
    wsRef.current = ws;

    if (typeof onReady === 'function') {
      onReady(ws);
    }

    ws.load(audioUrl);

    // 3) Quando pronto, captura dados brutos
    ws.on('ready', async () => {
      try {
        freqData = await spectrogramPlugin.getFrequenciesData();
      } catch (err) {
        console.error('Failed to get spectrogram data:', err);
      }
      // anexa clique após o plugin desenhar o canvas
      const c = spectrogramRef.current.querySelector('canvas');
      if (c) {
        c.addEventListener('click', handleClick);
      }
    });

    // 4) Cleanup
    return () => {
      const c = spectrogramRef.current.querySelector('canvas');
      if (c) {
        c.removeEventListener('click', handleClick);
      }
      try {
        ws.destroy();
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      }
    };
  }, [audioUrl]); // recria instância e plugin se url mudar

  // handler utiliza freqData e wsRef
  function handleClick(e) {
    const ws     = wsRef.current;
    const canvas = spectrogramRef.current.querySelector('canvas');
    if (!canvas || !ws || !freqData) return;

    const { left, top, width, height } = canvas.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    const timeIndex = Math.floor((x / width) * freqData.length);
    const freqIndex = Math.floor(((height - y) / height) * freqData[0].length);
    const ti = Math.max(0, Math.min(freqData.length - 1, timeIndex));
    const fi = Math.max(0, Math.min(freqData[0].length - 1, freqIndex));

    const amp      = freqData[ti][fi];
    const duration = ws.getDuration() || 0;
    const time     = (ti / freqData.length) * duration;
    const sr       = ws.backend.buffer?.sampleRate || 44100;
    const freq     = (fi / freqData[0].length) * (sr / 2);

    const info = { time, freq, amplitude: amp };
    if (typeof onClickTimeFreq === 'function') {
      onClickTimeFreq(info);
    } else {
      console.log(`t=${time.toFixed(2)}s, f=${freq.toFixed(0)}Hz, amp=${amp}`);
    }
  }

  return (
    <Container>
      <WaveformWrapper ref={waveformRef} />
      <SpectrogramWrapper ref={spectrogramRef} />
    </Container>
  );
};

Spectrogram.propTypes = {
  audioUrl:       PropTypes.string.isRequired,
  onReady:        PropTypes.func,
  onClickTimeFreq:PropTypes.func,
};
Spectrogram.defaultProps = {
  onReady:         null,  
  onClickTimeFreq: null,
};

export default Spectrogram;
