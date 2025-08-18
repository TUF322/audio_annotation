// src/RegionMenu.jsx
import React, { useMemo } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const Menu = styled.div`
  position: absolute;
  min-width: 260px;
  padding: 12px;
  background: #0f1228;
  border: 1px solid #2a2f44;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,.35);
  z-index: 9999;
  pointer-events: auto;
`;

const Header = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 8px; color: #e3e8ff; font-weight: 600;
`;

const CloseBtn = styled.button`
  background: transparent; border: none; color: #8a9bb8; cursor: pointer;
  font-size: 18px; line-height: 1; padding: 2px 6px; border-radius: 6px;
  &:hover { color: #fff; background: rgba(255,255,255,0.06); }
`;

const Row = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  gap: 8px; margin-bottom: 8px; font-size: .86rem;
  b { color: #e3e8ff; font-weight: 600; }
  span { color: #8a9bb8; }
`;

const Select = styled.select`
  flex: 1;
  background:#101328; color:#e3e8ff; border:1px solid #2a2f44;
  border-radius:8px; padding: 6px 8px; font-size: .85rem;
`;

const Actions = styled.div` display: flex; gap: 6px; margin-top: 10px; `;

const Btn = styled.button`
  padding: 6px 10px; border-radius: 8px; border: 1px solid #2a2f44;
  background:#1d2142; color:#e3e8ff; cursor:pointer; font-size: .85rem;
  &:hover{ background:#222748; }
`;

/* -------- utils -------- */
const normalizeType = (t) => {
  const s = String(t || "").toLowerCase();
  if (s.startsWith("obj")) return "object";
  if (s.startsWith("eve")) return "event";
  if (s.startsWith("tag")) return "tag";
  return "object";
};

export default function RegionMenu({
  visible,
  left,
  top,
  annotation,
  // valores atuais
  typeValue,
  itemValue,
  // definições
  objectDefs,
  eventDefs,
  tagDefs,
  // callbacks
  onTypeChange,
  onItemChange,
  onDelete,
  onClose,
}) {
  // hooks sempre no topo
  const normType = normalizeType(typeValue);
  const items = useMemo(() => {
    if (normType === "object") return objectDefs || [];
    if (normType === "event") return eventDefs || [];
    return tagDefs || [];
  }, [normType, objectDefs, eventDefs, tagDefs]);

  if (!visible || !annotation) return null;

  const { uid, start, end, lowHz, highHz } = annotation;

  return (
    <Menu style={{ left, top }} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
      <Header>
        <span>Region</span>
        <CloseBtn type="button" aria-label="Fechar" onClick={onClose}>×</CloseBtn>
      </Header>

      <Row><b>ID</b><span>{uid}</span></Row>
      <Row><b>Begin</b><span>{(start ?? 0).toFixed(3)} s</span></Row>
      <Row><b>End</b><span>{(end ?? 0).toFixed(3)} s</span></Row>
      <Row><b>Low</b><span>{((lowHz ?? 0)/1000).toFixed(2)} kHz</span></Row>
      <Row><b>High</b><span>{((highHz ?? 0)/1000).toFixed(2)} kHz</span></Row>

      <Row>
        <b>Type</b>
        <Select
          value={normType}
          onChange={(e) => {
            const v = normalizeType(e.target.value);
            onTypeChange?.(v);       // App.js reseta item
          }}
        >
          <option value="object">Objects</option>
          <option value="event">Events</option>
          <option value="tag">Tags</option>
        </Select>
      </Row>

      <Row>
        <b>Item</b>
        <Select
          value={itemValue || ""}
          onChange={(e) => onItemChange?.(e.target.value)}
        >
          <option value="">—</option>
          {items.map((it) => (
            <option key={it} value={it}>{it}</option>
          ))}
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
  }),

  typeValue: PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf(["object","event","tag"])]),
  itemValue: PropTypes.string,

  objectDefs: PropTypes.arrayOf(PropTypes.string),
  eventDefs: PropTypes.arrayOf(PropTypes.string),
  tagDefs: PropTypes.arrayOf(PropTypes.string),

  onTypeChange: PropTypes.func,
  onItemChange: PropTypes.func,
  onDelete: PropTypes.func,
  onClose: PropTypes.func,
};

RegionMenu.defaultProps = {
  visible: false,
  left: 12,
  top: 8,
  annotation: null,

  typeValue: "object",
  itemValue: "",

  objectDefs: [],
  eventDefs: [],
  tagDefs: [],

  onTypeChange: null,
  onItemChange: null,
  onDelete: null,
  onClose: null,
};
