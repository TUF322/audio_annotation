// src/InfoModal.jsx
import React, { useEffect } from "react";
import styled from "styled-components";

const Backdrop = styled.div`
  position: fixed; inset: 0;
  background: rgba(0,0,0,.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999;
`;

const Modal = styled.div`
  width: min(760px, 92vw);
  max-height: min(82vh, 900px);
  background: #1f2430;
  color: #e3e8ff;
  border: 1px solid #2a2f44;
  border-radius: 14px;
  box-shadow: 0 10px 50px rgba(0,0,0,.5);
  overflow: hidden;
  display: flex; flex-direction: column;
`;

const Header = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(90deg, #2a2f44, #1f2430);
`;

const Title = styled.h3`
  margin: 0; font-size: 1rem; letter-spacing: .3px;
`;

const CloseBtn = styled.button`
  border: 1px solid #2a2f44;
  background: #1d2142;
  color: #e3e8ff;
  width: 28px; height: 28px; border-radius: 8px;
  cursor: pointer;
  &:hover { background: #242a55; }
`;

const Body = styled.div`
  padding: 14px 16px;
  overflow: auto;
  line-height: 1.5;
  font-size: .92rem;
`;

const Section = styled.div`
  margin: 10px 0 14px;
  h4 {
    margin: 0 0 6px; font-size: .95rem; color: #bfc8ff; font-weight: 600;
  }
  ul { margin: 0; padding-left: 18px; }
  li + li { margin-top: 6px; }
  code {
    background: #101325; border: 1px solid #2a2f44; padding: 1px 6px; border-radius: 6px;
  }
  kbd {
    background: #101325; border: 1px solid #2a2f44; padding: 1px 6px; border-radius: 6px; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  }
`;

const Footer = styled.div`
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 12px 16px; border-top: 1px solid #2a2f44;
`;

const Btn = styled.button`
  border: 1px solid #2a2f44;
  background: #5c6bc0;
  color: white;
  font-size: .9rem;
  padding: 8px 12px; border-radius: 8px; cursor: pointer;
  &:hover { filter: brightness(1.05); }
`;

export default function InfoModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <Backdrop onMouseDown={onClose}>
      <Modal onMouseDown={(e) => e.stopPropagation()}>
        <Header>
          <Title>Ajuda / Como usar</Title>
          <CloseBtn onClick={onClose} title="Fechar">✕</CloseBtn>
        </Header>

        <Body>
          <Section>
            <h4>Criação rápida (“Quick create”)</h4>
            <ul>
              <li>Clica em qualquer item em <em>Objects</em> ou <em>Events</em> para criar uma região com esse rótulo.</li>
              <li>Também podes usar a tecla mostrada no “badge” ao lado (sem Ctrl/Alt). Em nomes com a mesma inicial, o sistema escolhe a próxima letra livre (p. ex. <code>noise</code> usa <kbd>N</kbd>, <code>nothing</code> usa <kbd>O</kbd>).</li>
            </ul>
          </Section>

          <Section>
            <h4>Seleção / Edição de regiões</h4>
            <ul>
              <li>Clica numa região para a selecionar e abrir o menu de edição.</li>
              <li>No menu podes mudar o <strong>Type</strong> (object/event/tag) e o <strong>Item</strong>. O nome é refletido no topo da região.</li>
              <li><strong>Delete</strong> remove a região do espectrograma e da tabela.</li>
            </ul>
          </Section>

          <Section>
            <h4>Tabela de Anotações</h4>
            <ul>
              <li><strong>Editar</strong> abre o menu dessa região.</li>
              <li><strong>Seek</strong> centra e foca a região no espectrograma.</li>
            </ul>
          </Section>

          <Section>
            <h4>Ficheiros de Áudio</h4>
            <ul>
              <li>A lista “Files” mostra os áudio em <code>/public/audio</code> (com ou sem <code>index.json</code>). Há também <code>whale.mp3</code> por defeito.</li>
              <li><strong>Play</strong> troca o áudio ativo. <strong>Download</strong> descarrega o ficheiro.</li>
              <li><strong>Add File</strong> permite tocar ficheiros locais (sem precisar de adicionar ao projeto).</li>
            </ul>
          </Section>

          {/* ——— NOVO: Zoom & Navegação ——— */}
          <Section>
            <h4>Zoom &amp; Navegação</h4>
            <ul>
              <li>No cabeçalho <em>Waveform</em> tens um <strong>slider de zoom</strong>. Move-o para ajustar o detalhe do sinal (px/s).</li>
              <li>Usa os botões <strong>−</strong> e <strong>＋</strong> ao lado do slider para reduzir/aumentar o zoom em passos fixos.</li>
              <li>Para <strong>navegar</strong> lateralmente, arrasta na horizontal (trackpad/scroll) ou usa o botão <strong>Seek</strong> na tabela para saltares para uma região específica.</li>
              <li>O zoom não altera o áudio — apenas a forma como o vês.</li>
            </ul>
          </Section>

          <Section>
            <h4>Controlo de Reprodução</h4>
            <ul>
              <li>O ícone do velocímetro alterna a <strong>velocidade</strong>: <code>1x → 2x → 4x → 1x</code>.</li>
              <li>O ícone de altifalante ativa o <strong>mute</strong>.</li>
              <li>O botão “+10” avança rapidamente <strong>10 segundos</strong>.</li>
            </ul>
          </Section>

          <Section>
            <h4>Dica</h4>
            <ul>
              <li>Podes ativar a seleção por arrasto com o botão “Select / Edit” na barra lateral, para desenhar regiões manualmente.</li>
            </ul>
          </Section>
        </Body>

        <Footer>
          <Btn onClick={onClose}>Ok, entendi</Btn>
        </Footer>
      </Modal>
    </Backdrop>
  );
}
