// SidebarControls.jsx
import React from "react";
import PropTypes from "prop-types";
import {
  SectionLabel,
  CtrlSection,
  CtrlColumn,
  IconBtn,
  Divider,
} from "./App.js"; // ajusta o caminho se necessário

export default function SidebarControls({
  selectionEnabled,
  onToggleSelection,
  onDeleteSelected,
  onColorSelected,
}) {
  return (
    <>
      <SectionLabel>SELECT / EDIT</SectionLabel>
      <CtrlSection>
        <CtrlColumn>
          {/* Toggle do modo seleção */}
          <IconBtn
            title="Box Select (toggle)"
            onClick={onToggleSelection}
            style={{
              outline: selectionEnabled ? "2px solid #79ffe1" : "none",
              outlineOffset: "2px",
            }}
          >
            <img src="/img/box_select1.png" alt="select" />
          </IconBtn>

          {/* Cores rápidas para a region ativa */}
          <IconBtn
            title="Marcar verde"
            onClick={() => onColorSelected?.("region-green")}
          >
            <img src="/img/draw1.png" alt="green" />
          </IconBtn>

          <IconBtn
            title="Marcar azul"
            onClick={() => onColorSelected?.("region-blue")}
          >
            <img src="/img/view1.png" alt="blue" />
          </IconBtn>

          {/* Apagar region selecionada */}
          <IconBtn title="Delete selection" onClick={onDeleteSelected}>
            <img src="/img/print1.png" alt="delete" />
          </IconBtn>
        </CtrlColumn>
      </CtrlSection>

      <Divider />

      <SectionLabel>INFO / VIEW</SectionLabel>
      <CtrlSection>
        <CtrlColumn>
          <IconBtn title="Info">
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
          <IconBtn title="Mute">
            <img src="/img/mute1.png" alt="mute" />
          </IconBtn>
          <IconBtn title="Speedometer">
            <img src="/img/speedometer1.png" alt="speed" />
          </IconBtn>
          <IconBtn title="+10s">
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
};
