import React, { useEffect, useRef } from 'react';
import WaveSurfer from "wavesurfer.js";
import SpectrogramPlugin from "wavesurfer.js/dist/plugins/spectrogram.esm.js";
import styled from 'styled-components';

const Container = styled.div`
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
`;

/**
 * Spectrogram component using WaveSurfer and its Spectrogram plugin.
 * Props:
 *   audioUrl: string - URL or path to the audio file
 */
const Spectrogram = ({ audioUrl }) => {
  const waveformRef = useRef(null);
  const spectrogramRef = useRef(null);

  useEffect(() => {
    // Initialize wavesurfer
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

    // Load the audio file
    wavesurfer.load(audioUrl);

    // Clean up on unmount
    return () => {
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

export default Spectrogram;
