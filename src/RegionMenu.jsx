// RegionMenu.jsx
import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const Menu = styled.div`
  position: absolute;
  min-width: 220px;
  padding: 10px;
  background: #0f1228;
  border: 1px solid #2a2f44;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,.35);
  z-index: 20;
  pointer-events: auto;
`;

const Row = styled.div`
  display: flex; justify-content: space-between; gap: 8px; margin-bottom: 6px; font-size: .8rem;
  b { color: #e3e8ff; font-weight: 600; }
  span { color: #8a9bb8; }
`;

const Actions = styled.div` display: flex; gap: 6px; margin-top: 8px; `;
const Btn = styled.button`
  padding: 6px 8px; border-radius: 6px; border: 1px solid #2a2f44; background:#1d2142; color:#e3e8ff; cursor:pointer;
  &:hover{ background:#222748; }
`;

export default function RegionMenu({
  visible, left, top, annotation,
  onSetClass, onColor, onDelete,
}) {
  if (!visible || !annotation) return null;
  const { uid, start, end, lowHz, highHz, className } = annotation;

  return (
    <Menu style={{ left, top }}>
      <Row><b>ID</b><span>{uid}</span></Row>
      <Row><b>Begin</b><span>{start.toFixed(3)} s</span></Row>
      <Row><b>End</b><span>{end.toFixed(3)} s</span></Row>
      <Row><b>Low</b><span>{(lowHz/1000).toFixed(2)} kHz</span></Row>
      <Row><b>High</b><span>{(highHz/1000).toFixed(2)} kHz</span></Row>

      <Row>
        <b>Class</b>
        <select
          value={className || ""}
          onChange={(e) => onSetClass?.(e.target.value)}
          style={{ background:"#101328", color:"#e3e8ff", border:"1px solid #2a2f44", borderRadius:6 }}
        >
          <option value="">—</option>
          <option value="dolphin">dolphin</option>
          <option value="whale">whale</option>
          <option value="seal">seal</option>
          <option value="turtle">turtle</option>
        </select>
      </Row>

      <Actions>
        <Btn onClick={() => onColor?.("region-green")}>Green</Btn>
        <Btn onClick={() => onColor?.("region-blue")}>Blue</Btn>
        <Btn onClick={onDelete}>Delete</Btn>
      </Actions>
    </Menu>
  );
}

RegionMenu.propTypes = {
  visible: PropTypes.bool,
  left: PropTypes.number,
  top: PropTypes.number,
  annotation: PropTypes.object,
  onSetClass: PropTypes.func,
  onColor: PropTypes.func,
  onDelete: PropTypes.func,
};

RegionMenu.defaultProps = {
  visible: false,
  left: 12,
  top: 8,
  annotation: null,
  onSetClass: null,
  onColor: null,
  onDelete: null,
};
