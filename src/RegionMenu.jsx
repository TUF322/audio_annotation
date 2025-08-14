
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

const Actions = styled.div`
  display: flex; gap: 6px; margin-top: 8px;
`;

const Btn = styled.button`
  padding: 6px 8px; border-radius: 8px; border: 1px solid #2a2f44;
  background:#1d2142; color:#e3e8ff; cursor:pointer; font-size: .8rem;
  &:hover{ background:#222748; }
`;

export default function RegionMenu({
  visible,
  left,
  top,
  annotation,
  onSetClass,
  onDelete,
  onClose,
}) {
  if (!visible || !annotation) return null;

  const { uid, start, end, lowHz, highHz, className } = annotation;

  return (
    <Menu
      style={{ left, top }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <Header>
        <span>Region</span>
        <CloseBtn type="button" aria-label="Fechar" onClick={onClose}>×</CloseBtn>
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

      <Actions>
        <Btn type="button" onClick={onDelete}>Delete</Btn>
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
  onSetClass: PropTypes.func,
  onDelete: PropTypes.func,
  onClose: PropTypes.func,
};

RegionMenu.defaultProps = {
  visible: false,
  left: 12,
  top: 8,
  annotation: null,
  onSetClass: null,
  onDelete: null,
  onClose: null,
};
