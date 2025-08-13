// src/RegionMenu.jsx
import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const Menu = styled.div`
  position: absolute;
  min-width: 240px;
  padding: 10px;
  background: #0f1228;
  border: 1px solid #2a2f44;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,.35);
  z-index: 20;
  pointer-events: auto;
`;

const Header = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 6px; color: #e3e8ff; font-weight: 600;
`;

const CloseBtn = styled.button`
  background: transparent; border: none; color: #8a9bb8; cursor: pointer;
  font-size: 18px; line-height: 1; padding: 2px 6px; border-radius: 6px;
  &:hover { color: #fff; background: rgba(255,255,255,0.06); }
`;

const Row = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  gap: 8px; margin-bottom: 6px; font-size: .82rem;
  b { color: #e3e8ff; font-weight: 600; }
  span { color: #8a9bb8; }
`;

const Select = styled.select`
  background:#101328; color:#e3e8ff; border:1px solid #2a2f44;
  border-radius:8px; padding: 6px 8px; font-size: .8rem;
`;

const Actions = styled.div` display: flex; gap: 6px; margin-top: 8px; `;

const Btn = styled.button`
  padding: 6px 8px; border-radius: 8px; border: 1px solid #2a2f44;
  background:#1d2142; color:#e3e8ff; cursor:pointer; font-size: .8rem;
  &:hover{ background:#222748; }
`;

/* ---- Paleta de cores ---- */
const Palette = styled.div`
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 6px;
`;

const Swatch = styled.button`
  height: 22px; border-radius: 6px; border: 1px solid #2a2f44; cursor: pointer;
  background: ${(p) => p.$bg};
  outline: none;
  &[data-active="true"] {
    box-shadow: 0 0 0 2px #79ffe1;
  }
`;

const COLOR_OPTIONS = [
  { label: "default", className: "",          bg: "linear-gradient(135deg,#1d2142,#101328)" },
  { label: "green",   className: "region-green",  bg: "rgba(102,255,102,.65)" },
  { label: "blue",    className: "region-blue",   bg: "rgba(15,131,155,.75)" },
  { label: "red",     className: "region-red",    bg: "rgba(255,99,132,.75)" },
  { label: "yellow",  className: "region-yellow", bg: "rgba(255,206,86,.75)" },
  { label: "purple",  className: "region-purple", bg: "rgba(153,102,255,.75)" },
  { label: "orange",  className: "region-orange", bg: "rgba(255,159,64,.75)" },
  { label: "cyan",    className: "region-cyan",   bg: "rgba(75,192,192,.75)" },
  { label: "pink",    className: "region-pink",   bg: "rgba(255,105,180,.75)" },
];

export default function RegionMenu({
  visible,
  left,
  top,
  annotation,
  colorClass,
  onSetClass,
  onColor,
  onDelete,
  onClose,
}) {
  if (!visible || !annotation) return null;

  const { uid, start, end, lowHz, highHz, className } = annotation;

  const handlePick = (classNameToApply) => {
    try {
      onColor?.(classNameToApply);   // <— aplica cor na region
    } catch (e) {
      // evita crash do menu se quem chamou não existir
      console.warn("onColor error:", e);
    }
  };

  return (
    <Menu style={{ left, top }}>
      <Header>
        <span>Region</span>
        <CloseBtn aria-label="Fechar" onClick={onClose}>×</CloseBtn>
      </Header>

      <Row><b>ID</b><span>{uid}</span></Row>
      <Row><b>Begin</b><span>{start.toFixed(3)} s</span></Row>
      <Row><b>End</b><span>{end.toFixed(3)} s</span></Row>
      <Row><b>Low</b><span>{(lowHz/1000).toFixed(2)} kHz</span></Row>
      <Row><b>High</b><span>{(highHz/1000).toFixed(2)} kHz</span></Row>

      <Row>
        <b>Class</b>
        <Select value={className || ""} onChange={(e) => onSetClass?.(e.target.value)}>
          <option value="">—</option>
          <option value="dolphin">dolphin</option>
          <option value="whale">whale</option>
          <option value="seal">seal</option>
          <option value="turtle">turtle</option>
        </Select>
      </Row>

      <Row style={{ alignItems: "flex-start" }}>
        <b style={{ lineHeight: "22px" }}>Color</b>
        <div style={{ flex: 1 }}>
          <Palette>
            {COLOR_OPTIONS.map((opt) => (
              <Swatch
                key={opt.className || "default"}
                $bg={opt.bg}
                data-active={opt.className === (colorClass || "")}
                title={opt.label}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePick(opt.className);   // <— aqui mandamos "region-blue", etc.
                }}
              />
            ))}
          </Palette>
        </div>
      </Row>

      <Actions>
        <Btn onClick={onDelete}>Delete</Btn>
      </Actions>
    </Menu>
  );
}

RegionMenu.propTypes = {
  visible: PropTypes.bool,
  left: PropTypes.number,
  top: PropTypes.number,
  annotation: PropTypes.shape({
    uid: PropTypes.number,
    start: PropTypes.number,
    end: PropTypes.number,
    lowHz: PropTypes.number,
    highHz: PropTypes.number,
    className: PropTypes.string,
  }),
  colorClass: PropTypes.string,
  onSetClass: PropTypes.func,
  onColor: PropTypes.func,
  onDelete: PropTypes.func,
  onClose: PropTypes.func,
};

RegionMenu.defaultProps = {
  visible: false,
  left: 12,
  top: 8,
  annotation: null,
  colorClass: "",
  onSetClass: null,
  onColor: null,
  onDelete: null,
  onClose: null,
};
