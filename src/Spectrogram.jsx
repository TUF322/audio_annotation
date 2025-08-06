import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import WaveSurfer from 'wavesurfer.js';
import SpectrogramPlugin from "wavesurfer.js/dist/plugins/spectrogram.esm.js";
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

/**
 * Spectrogram component using WaveSurfer + Spectrogram plugin.
 * Props:
 *   audioUrl: string – arquivo de áudio
 *   onReady?: fn – recebe a instância do WaveSurfer
 *   onClickTimeFreq?: fn – recebe { time, freq } ao clicar
 */
const Spectrogram = ({ audioUrl, onReady, onClickTimeFreq }) => {
  const waveformRef   = useRef(null);
  const spectrogramRef = useRef(null);

  useEffect(() => {
    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#888',
      progressColor: '#5c6bc0',
      cursorColor: '#fff',
      scrollParent: true,
      backend: 'WebAudio',
      height: 100,
      responsive: true,
      plugins: [
        SpectrogramPlugin.create({
          container: spectrogramRef.current,
          labels: true,
          height: 128,
        }),
      ],
    });

    // passa instância para o pai
    if (typeof onReady === 'function') {
      onReady(wavesurfer);
    }

    // carrega áudio
    wavesurfer.load(audioUrl);

    // listener de clique para calcular t e f
    const specEl = spectrogramRef.current;
    const handleClick = e => {
      const rect   = specEl.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const width  = rect.width;
      const height = rect.height;

      const duration = wavesurfer.getDuration() || 0;
      const time     = (x / width) * duration;

      const sr      = wavesurfer.backend.buffer?.sampleRate || 44100;
      const nyquist = sr / 2;
      const freq    = ((height - y) / height) * nyquist;

      if (typeof onClickTimeFreq === 'function') {
        onClickTimeFreq({ time, freq });
      } else {
        console.log(
          `Clique: t=${time.toFixed(2)}s, f=${freq.toFixed(0)}Hz`
        );
      }
    };

    specEl.addEventListener('click', handleClick);

    // cleanup
    return () => {
      specEl.removeEventListener('click', handleClick);
      wavesurfer.destroy();
    };
  // só refaz quando mudar o áudio
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl]);

  return (
    <Container>
      <WaveformWrapper ref={waveformRef} />
      <SpectrogramWrapper ref={spectrogramRef} />
    </Container>
  );
};

Spectrogram.propTypes = {
  audioUrl: PropTypes.string.isRequired,
  onReady: PropTypes.func,
  onClickTimeFreq: PropTypes.func,
};

Spectrogram.defaultProps = {
  onReady: null,
  onClickTimeFreq: null,
};

export default Spectrogram;
