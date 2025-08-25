// src/SidebarControls.jsx
import React from "react";
import PropTypes from "prop-types";
import {
  SectionLabel,
  CtrlSection,
  CtrlColumn,
  IconBtn,
  Divider,
} from "./App.js";

// ícone do velocímetro conforme velocidade
const speedIconFor = (rate) => {
  if (rate === 1) return "/img/speedometer1.png"; // verde (1x)
  if (rate === 2) return "/img/speedometer2.png"; // laranja (2x)
  return "/img/speedometer3.png";                 // vermelho (4x)
};

export default function SidebarControls({
  selectionEnabled,
  onToggleSelection,
  onDeleteSelected,
  onColorSelected,

  // novos
  onInfoClick,
  playbackRate,
  onCycleSpeed,
  isMuted,
  onToggleMute,
  onForward10,
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

          <IconBtn title="Marcar verde" onClick={() => onColorSelected?.("region-green")}>
            <img src="/img/draw1.png" alt="green" />
          </IconBtn>

          <IconBtn title="Marcar azul" onClick={() => onColorSelected?.("region-blue")}>
            <img src="/img/view1.png" alt="blue" />
          </IconBtn>

          <IconBtn title="Delete selection" onClick={onDeleteSelected}>
            <img src="/img/print1.png" alt="delete" />
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
          <IconBtn title="View">
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
          {/* Mute/unmute */}
          <IconBtn
            title={isMuted ? "Unmute" : "Mute"}
            onClick={onToggleMute}
            style={{
              outline: isMuted ? "2px solid #ef4444" : "none",
              outlineOffset: "2px",
            }}
          >
            <img src="/img/mute1.png" alt="mute" />
          </IconBtn>

          {/* Velocidade 1x→2x→4x */}
          <IconBtn
            title={`Speed ${playbackRate}x (click para alternar)`}
            onClick={onCycleSpeed}
          >
            <img src={speedIconFor(playbackRate)} alt="speed" />
          </IconBtn>

          {/* +10s */}
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
};
