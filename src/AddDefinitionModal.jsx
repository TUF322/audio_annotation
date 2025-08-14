import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const Backdrop = styled.div`
  position: fixed; inset: 0;
  background: rgba(0,0,0,.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  width: 360px; max-width: 92vw;
  background: #0f1228;
  border: 1px solid #2a2f44;
  border-radius: 12px;
  box-shadow: 0 12px 28px rgba(0,0,0,.45);
  padding: 14px;
  color: #e3e8ff;
`;

const Header = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 8px; font-weight: 600;
`;

const Close = styled.button`
  background: transparent; border: 0; color: #8a9bb8; cursor: pointer;
  font-size: 18px; padding: 2px 6px; border-radius: 6px;
  &:hover{ color:#fff; background: rgba(255,255,255,.06); }
`;

const Row = styled.div`
  display: grid; grid-template-columns: 90px 1fr; gap: 10px; align-items: center;
  margin: 8px 0; font-size: .9rem;
  label { color: #8a9bb8; }
`;

const Select = styled.select`
  background:#101328; color:#e3e8ff; border:1px solid #2a2f44;
  border-radius:8px; padding: 8px;
`;

const Input = styled.input`
  background:#101328; color:#e3e8ff; border:1px solid #2a2f44;
  border-radius:8px; padding: 8px;
`;

const Actions = styled.div`
  display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px;
`;

const Btn = styled.button`
  padding: 8px 12px; border-radius: 8px; cursor: pointer; border: 1px solid #2a2f44;
  color: #e3e8ff; background: #1d2142;
  &:hover{ background:#222748; }
  &[data-variant="primary"]{ background:#5c6bc0; border-color:#5c6bc0; }
  &:disabled{ opacity:.6; cursor:not-allowed; }
`;

export default function AddDefinitionModal({ open, onClose, onSubmit, initialType }) {
  const [type, setType] = useState(initialType || "object");
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) {
      setType(initialType || "object");
      setName("");
    }
  }, [open, initialType]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = name.trim();
    if (!clean) return;
    onSubmit?.({ type, name: clean });
  };

  return (
    <Backdrop onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <div>Add definition</div>
          <Close onClick={onClose} aria-label="Close">×</Close>
        </Header>

        <form onSubmit={handleSubmit}>
          <Row>
            <label htmlFor="type">Type</label>
            <Select id="type" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="object">Object</option>
              <option value="event">Event</option>
              <option value="tag">Tag</option>
            </Select>
          </Row>

          <Row>
            <label htmlFor="name">Name</label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., dolphin / noise / lorem"
              autoFocus
            />
          </Row>

          <Actions>
            <Btn type="button" onClick={onClose}>Cancel</Btn>
            <Btn data-variant="primary" type="submit" disabled={!name.trim()}>
              Add
            </Btn>
          </Actions>
        </form>
      </Modal>
    </Backdrop>
  );
}

AddDefinitionModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  initialType: PropTypes.oneOf(["object","event","tag"]),
};

AddDefinitionModal.defaultProps = {
  open: false,
  onClose: null,
  onSubmit: null,
  initialType: "object",
};
