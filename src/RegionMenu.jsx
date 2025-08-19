// src/RegionMenu.jsx
import React, { useMemo } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const Menu = styled.div`
  position: absolute;
  min-width: 260px;
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

const Actions = styled.div` display: flex; gap: 8px; margin-top: 8px; `;

const DangerBtn = styled.button`
  padding: 6px 10px; border-radius: 8px; border: 1px solid #5c2330;
  background:#7a2433; color:#fff; cursor:pointer; font-size:.8rem;
  &:hover{ background:#8c2a3a; }
`;

export default function RegionMenu({
  visible,
  left,
  top,
  annotation,
  typeOptions,
  itemsByType,
  onTypeChange,
  onItemChange,
  onDelete,
  onClose,
}) {
  // manter hooks SEM retornos condicionais
  const safeAnn = annotation || {
    uid: 0, start: 0, end: 0, lowHz: 0, highHz: 0, type: "object", item: ""
  };

  const itemsForType = useMemo(() => {
    const list = itemsByType?.[safeAnn.type] || [];
    return Array.isArray(list) ? list : [];
  }, [itemsByType, safeAnn.type]);

  if (!visible || !annotation) return null;

  return (
    <Menu style={{ left, top }} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
      <Header>
        <span>Region</span>
        <CloseBtn type="button" aria-label="Fechar" onClick={onClose}>×</CloseBtn>
      </Header>

      <Row><b>ID</b><span>{safeAnn.uid}</span></Row>
      <Row><b>Begin</b><span>{safeAnn.start.toFixed(3)} s</span></Row>
      <Row><b>End</b><span>{safeAnn.end.toFixed(3)} s</span></Row>
      <Row><b>Low</b><span>{(safeAnn.lowHz/1000).toFixed(2)} kHz</span></Row>
      <Row><b>High</b><span>{(safeAnn.highHz/1000).toFixed(2)} kHz</span></Row>

      <Row>
        <b>Type</b>
        <Select value={safeAnn.type || "object"} onChange={(e) => onTypeChange?.(e.target.value)}>
          {(typeOptions || ["object","event","tag"]).map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </Select>
      </Row>

      <Row>
        <b>Item</b>
        <Select value={safeAnn.item || ""} onChange={(e) => onItemChange?.(e.target.value)}>
          <option value="">—</option>
          {itemsForType.map((it) => (
            <option key={it} value={it}>{it}</option>
          ))}
        </Select>
      </Row>

      {/* Aqui só DELETE (o Seek e Edit ficam na tabela em baixo) */}
      <Actions>
        <DangerBtn type="button" onClick={onDelete}>Delete</DangerBtn>
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
    type: PropTypes.string,
    item: PropTypes.string,
  }),
  typeOptions: PropTypes.arrayOf(PropTypes.string),
  itemsByType: PropTypes.object,
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
  typeOptions: ["object", "event", "tag"],
  itemsByType: { object: [], event: [], tag: [] },
  onTypeChange: null,
  onItemChange: null,
  onDelete: null,
  onClose: null,
};
