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


const Spectrogram = ({ audioUrl, onReady, onClickTimeFreq }) => {
  const waveformRef    = useRef(null);
  const spectrogramRef = useRef(null);
  const canvasRef      = useRef(null);

  useEffect(() => {
    
    const wavesurfer = WaveSurfer.create({
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
          container: spectrogramRef.current,
          labels:    true,
          height:    128,
        }),
      ],
    });


    if (typeof onReady === 'function') {
      onReady(wavesurfer);
    }

    
    wavesurfer.load(audioUrl);

    const handleClick = e => {
      const c = canvasRef.current;
      if (!c) return;

      const rect   = c.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const width  = rect.width;
      const height = rect.height;

      const duration = wavesurfer.getDuration() || 0;
      const time     = (x / width) * duration;

      const sr      = wavesurfer.backend.buffer?.sampleRate || 44100;
      const freq    = ((height - y) / height) * (sr / 2);

      const ctx  = c.getContext('2d');
      const img  = ctx.getImageData(x, y, 1, 1).data; 
      const rgba = { r: img[0], g: img[1], b: img[2], a: img[3] };

      if (typeof onClickTimeFreq === 'function') {
        onClickTimeFreq({ time, freq, rgba });
      } else {
        console.log(
          `t=${time.toFixed(2)}s, f=${freq.toFixed(0)}Hz, rgba=(${[
            img[0], img[1], img[2], img[3]
          ].join(',')})`
        );
      }
    };

    let canvasEl = null;
    const onWsReady = () => {
      const wrapper = spectrogramRef.current;
      if (!wrapper) return;
      const c = wrapper.querySelector('canvas');
      if (c) {
        canvasRef.current = c;
        c.addEventListener('click', handleClick);
      }
    };
    wavesurfer.on('ready', onWsReady);

    return () => {
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('click', handleClick);
      }
      wavesurfer.un('ready', onWsReady);
      wavesurfer.destroy();
    };
    
  }, [audioUrl]);

  return (
    <Container>
      <WaveformWrapper ref={waveformRef} />
      <SpectrogramWrapper ref={spectrogramRef} />
    </Container>
  );
};

Spectrogram.propTypes = {
  audioUrl:        PropTypes.string.isRequired,
  onReady:         PropTypes.func,
  onClickTimeFreq: PropTypes.func,
};

Spectrogram.defaultProps = {
  onReady:         null,
  onClickTimeFreq: null,
};

export default Spectrogram;
