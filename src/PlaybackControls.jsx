import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  ControlBtn,
  ScrollBarContainer,
  ScrollBar,
  ScrollThumb,
  Time,
} from './App.js';



const PlaybackControls = ({ wavesurfer, onLike, onDislike }) => {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [thumb, setThumb] = useState({ left: 0, width: 100 });

  useEffect(() => {
  if (!wavesurfer) return;

    const update = () => {
  
  if (!wavesurfer.drawer || !wavesurfer.drawer.wrapper) return;

  const t = wavesurfer.getCurrentTime() || 0;
  const d = wavesurfer.getDuration()   || 1;
  setCurrentTime(t);
  setDuration(d);

  const wrapper = wavesurfer.drawer.wrapper;
  const total   = wrapper.scrollWidth;
  const view    = wrapper.clientWidth;
  const left    = wrapper.scrollLeft;
  setThumb({
    left:  (left / (total - view)) * 100,
    width: (view  / total)       * 100,
  });
};

    const onReady = update;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onSeek = update;
    const onFinish = () => setPlaying(false);

    wavesurfer.on('ready', onReady);
    wavesurfer.on('play', onPlay);
    wavesurfer.on('pause', onPause);
    wavesurfer.on('audioprocess', update);
    wavesurfer.on('seek', update);
    wavesurfer.on('finish', onFinish);

    return () => {
      wavesurfer.un('ready', onReady);
      wavesurfer.un('play', onPlay);
      wavesurfer.un('pause', onPause);
      wavesurfer.un('audioprocess', update);
      wavesurfer.un('seek', onSeek);
      wavesurfer.un('finish', onFinish);
    };
  }, [wavesurfer]);

  const togglePlay = () => {
    wavesurfer && wavesurfer.playPause();
  };
  const skip = secs => {
    if (!wavesurfer) return;
    const newTime = Math.max(
      0,
      Math.min((wavesurfer.getCurrentTime() || 0) + secs, duration)
    );
    wavesurfer.seekTo(newTime / duration);
  };
  const handleScroll = e => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    wavesurfer &&
      (wavesurfer.seekAndCenter
        ? wavesurfer.seekAndCenter(ratio)
        : wavesurfer.seekTo(ratio));
  };
  const format = secs => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(Math.floor(secs % 60)).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <>
      <div style={{ display: 'flex', gap: '8px' }}>
        <ControlBtn onClick={() => skip(-5)} title="Previous">
          <img src="/img/previous1.png" alt="Previous" />
        </ControlBtn>
        <ControlBtn onClick={togglePlay} title={playing ? 'Pause' : 'Play'}>
          <img
            src={playing ? '/img/pause1.png' : '/img/play1.png'}
            alt={playing ? 'Pause' : 'Play'}
          />
        </ControlBtn>
        <ControlBtn onClick={() => skip(5)} title="Next">
          <img src="/img/next-button1.png" alt="Next" />
        </ControlBtn>
        <ControlBtn onClick={onLike} title="Like">
          <img src="/img/like1.png" alt="Like" />
        </ControlBtn>
        <ControlBtn onClick={onDislike} title="Dislike">
          <img src="/img/dislike1.png" alt="Dislike" />
        </ControlBtn>
      </div>
      <ScrollBarContainer>
        <ScrollBar onClick={handleScroll}>
          <ScrollThumb
            style={{ left: `${thumb.left}%`, width: `${thumb.width}%` }}
          />
        </ScrollBar>
      </ScrollBarContainer>
      <Time>
        {format(currentTime)} / {format(duration)}
      </Time>
    </>
  );
};

PlaybackControls.propTypes = {
  wavesurfer: PropTypes.object.isRequired,
  onLike: PropTypes.func,
  onDislike: PropTypes.func,
};

PlaybackControls.defaultProps = {
  onLike: () => {},
  onDislike: () => {},
};

export default PlaybackControls;
