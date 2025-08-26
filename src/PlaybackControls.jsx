// src/PlaybackControls.jsx
import React, { useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { ControlBtn } from "./App.js";

export default function PlaybackControls({ wavesurfer, onLike, onDislike }) {
  const canPlay = !!wavesurfer;
  const isPlaying = !!wavesurfer?.isPlaying?.();

  const playPause = useCallback(() => {
    if (!wavesurfer) return;
    try { wavesurfer.playPause(); } catch {}
  }, [wavesurfer]);

  const seekRel = useCallback((secs) => {
    if (!wavesurfer) return;
    const dur = wavesurfer.getDuration?.() || 0;
    const now = wavesurfer.getCurrentTime?.() || 0;
    const t = Math.max(0, Math.min(dur, now + secs));
    if (typeof wavesurfer.setTime === "function") wavesurfer.setTime(t);
    else if (typeof wavesurfer.seekTo === "function") wavesurfer.seekTo(dur ? t / dur : 0);
  }, [wavesurfer]);

  const icons = useMemo(() => ({
    prev: "/img/previous1.png",
    play: "/img/play1.png",
    pause: "/img/pause1.png",
    next: "/img/next-button1.png",
    like: "/img/like1.png",
    dislike: "/img/dislike1.png",
  }), []);

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "center" }}>
      <ControlBtn title="⟸ 5s" onClick={() => seekRel(-5)} disabled={!canPlay}>
        <img src={icons.prev} alt="prev" />
      </ControlBtn>

      <ControlBtn title={isPlaying ? "Pause" : "Play"} onClick={playPause} disabled={!canPlay}>
        <img src={isPlaying ? icons.pause : icons.play} alt="play/pause" />
      </ControlBtn>

      <ControlBtn title="5s ⟹" onClick={() => seekRel(5)} disabled={!canPlay}>
        <img src={icons.next} alt="next" />
      </ControlBtn>

      <ControlBtn title="Like" onClick={onLike}><img src={icons.like} alt="like" /></ControlBtn>
      <ControlBtn title="Dislike" onClick={onDislike}><img src={icons.dislike} alt="dislike" /></ControlBtn>
    </div>
  );
}

PlaybackControls.propTypes = {
  wavesurfer: PropTypes.any,
  onLike: PropTypes.func,
  onDislike: PropTypes.func,
};

PlaybackControls.defaultProps = {
  wavesurfer: null,
  onLike: () => {},
  onDislike: () => {},
};
