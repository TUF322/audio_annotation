import React from "react";
import PropTypes from "prop-types";
import {
  SectionLabel,
  CtrlSection,
  CtrlColumn,
  IconBtn,
  Divider,
} from "./App.js";

export default function SidebarControls({
  selectionEnabled,
  onToggleSelection,
  onDeleteSelected,
  onColorSelected,
  // novos controlos já existentes
  onInfoClick,
  playbackRate,
  onCycleSpeed,
  isMuted,
  onToggleMute,
  onForward10,
  // NOVO:
  onToggleView,
}) {
  return (
    <>
      <SectionLabel>SELECT / EDIT</SectionLabel>
      <CtrlSection>
        <CtrlColumn>
          <IconBtn
            title="Box Select (toggle)"
            onClick={onToggleSelection}
            style={{
              outline: selectionEnabled ? "2px solid #79ffe1" : "none",
              outlineOffset: "2px",
            }}
          >
            <img src="/img/text-box1.png" alt="select" />
          </IconBtn>

          <IconBtn title="draw-select" onClick={() => onColorSelected?.("draw-select")}>
            <img src="/img/draw1.png" alt="green" />
          </IconBtn>

          <IconBtn title="box-select" onClick={() => onColorSelected?.("box-select")}>
            <img src="/img/box_select1.png" alt="blue" />
          </IconBtn>

          
          
        </CtrlColumn>
      </CtrlSection>

      <Divider />

      <SectionLabel>INFO / VIEW</SectionLabel>
      <CtrlSection>
        <CtrlColumn>
          <IconBtn title="Info" onClick={onInfoClick}>
            <img src="/img/info1.png" alt="info" />
          </IconBtn>
          {/* Olho -> alterna heatmap/spectrogram */}
          <IconBtn title="View: Heatmap ON/OFF" onClick={onToggleView}>
            <img src="/img/view1.png" alt="view" />
          </IconBtn>
        </CtrlColumn>
      </CtrlSection>

      <Divider />

      <SectionLabel>UTILITIES</SectionLabel>
      <CtrlSection>
        <CtrlColumn>
          <IconBtn title="Upload">
            <img src="/img/scroll1.png" alt="upload" />
          </IconBtn>
          <IconBtn title="Screenshot">
            <img src="/img/print1.png" alt="screenshot" />
          </IconBtn>
          <IconBtn title="Time">
            <img src="/img/clock_plus1.png" alt="time" />
          </IconBtn>
        </CtrlColumn>
      </CtrlSection>

      <Divider />

      <SectionLabel>AUDIO / AI</SectionLabel>
      <CtrlSection>
        <CtrlColumn>
          <IconBtn title={isMuted ? "Unmute" : "Mute"} onClick={onToggleMute}>
            <img src="/img/mute1.png" alt="mute" />
          </IconBtn>
          <IconBtn title={`Speed ${playbackRate}x (cycle)`} onClick={onCycleSpeed}>
            <img src={
              playbackRate === 1 ? "/img/speedometer3.png"
              : playbackRate === 2 ? "/img/speedometer2.png"
              : "/img/speedometer1.png"
            } alt="speed" />
          </IconBtn>
          <IconBtn title="+10s" onClick={onForward10}>
            <img src="/img/forward1.png" alt="forward" />
          </IconBtn>
          <IconBtn title="AI">
            <img src="/img/ai1.png" alt="ai" />
          </IconBtn>
        </CtrlColumn>
      </CtrlSection>
    </>
  );
}

SidebarControls.propTypes = {
  selectionEnabled: PropTypes.bool.isRequired,
  onToggleSelection: PropTypes.func.isRequired,
  onDeleteSelected: PropTypes.func.isRequired,
  onColorSelected: PropTypes.func,
  onInfoClick: PropTypes.func,
  playbackRate: PropTypes.number,
  onCycleSpeed: PropTypes.func,
  isMuted: PropTypes.bool,
  onToggleMute: PropTypes.func,
  onForward10: PropTypes.func,
  onToggleView: PropTypes.func,   // <—— NOVO
};
