import React, { useState, useCallback, useRef } from "react";
import styled from "styled-components";
import SpectrogramOnClick from "./SpectrogramOnClick";
import PlaybackControls from "./PlaybackControls";
import SidebarControls from "./SidebarControls";
import RegionMenu from "./RegionMenu"; 




const theme = {
  bg: "#0f111a",
  card: "#1f2430",
  border: "#2a2f44",
  text: "#e3e8ff",
  muted: "#8a9bb8",
  controlBg: "#1d2142",
  primary: "#5c6bc0",
};


// Layout root
export const AppRoot = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: ${theme.bg};
  color: ${theme.text};
  font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
`;

export const Topbar = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  height: 52px;
  background: linear-gradient(90deg, ${theme.border}, ${theme.card});
  flex-shrink: 0;
`;

export const Title = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
`;

export const Subtitle = styled.div`
  font-size: 0.8rem;
  margin-right: 8px;
`;

export const Btn = styled.button`
  background: ${theme.primary};
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
  color: #fff;
  white-space: nowrap;
`;

export const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

// Side controls
export const LeftControls = styled.nav`
  width: 100px;
  background: ${theme.controlBg};
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-right: 1px solid ${theme.border};
  overflow: auto;
`;

export const CtrlSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const SectionLabel = styled.div`
  font-size: 0.55rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${theme.muted};
`;

export const CtrlColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const IconBtn = styled.button`
  background: #22263f;
  border: none;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  &:hover { background: #2f345f; }
  img { max-width: 22px; max-height: 22px; }
`;

export const Divider = styled.div`
  height: 1px;
  background: ${theme.border};
  margin: 8px 0;
`;

// Sidebar panels
export const TagSidebar = styled.aside`
  width: 220px;
  background: ${theme.card};
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-right: 1px solid ${theme.border};
  overflow: auto;
`;

export const Panel = styled.div`
  background: ${theme.card};
  border-radius: 10px;
  padding: 10px;
`;

export const PanelTitle = styled.div`
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 4px;
`;

export const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const Item = styled.div`
  background: rgba(255,255,255,0.05);
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
`;

export const TagItem = styled(Item)`
  border: 1px solid ${theme.primary};
`;

// Main area
export const MainArea = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const Viewer = styled.section`
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const ViewerHeader = styled.div`
  display: flex;
  align-items: center;
`;

export const Badge = styled.div`
  background: rgba(255,255,255,0.07);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.65rem;
`;

export const ViewerBox = styled.div`
  flex: 1;
  background: ${theme.card};
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: inset 0 0 14px rgba(0,0,0,0.5);
`;

export const Placeholder = styled.div`
  position: relative;
  flex: 1;
  background: #1b1f31;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const PlaceholderImg = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  opacity: 0.9;
`;

export const OverlayLabel = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0,0,0,0.6);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
`;

export const Playback = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 14px;
  padding-top: 8px;
  border-top: 1px solid ${theme.border};
  flex-wrap: wrap;
`;

export const ControlsRow = styled.div`
  display: flex;
  gap: 8px;
`;

export const ControlBtn = styled(IconBtn)`
  background: ${theme.controlBg};
`;

export const ProgressWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`;

export const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  position: relative;
  overflow: hidden;
`;

export const ProgressFilled = styled.div`
  position: absolute;
  height: 100%;
  width: 40%;
  background: #2196f3;
  border-radius: 3px;
`;

export const ScrollBarContainer = styled.div`
  width: 100%;
  height: 8px;
`;

export const ScrollBar = styled.div`
  width: 100%;
  height: 10px;
  background: #e0e0e0;
  border-radius: 2px;
  position: relative;
`;

export const ScrollThumb = styled.div`
  position: absolute;
  height: 100%;
  width: 10%;
  left: 0;
  background: #4b0556ff;
  border-radius: 2px;
`;

export const Time = styled.div`
  font-size: 0.75rem;
  color: #666;
  text-align: center;
`;

// Bottom panels
export const Bottom = styled.section`
  padding: 16px;
  background: transparent;
  flex-shrink: 0;
`;

export const BottomGrid = styled.div`
  display: flex;
  gap: 16px;
`;

export const Annotations = styled.div`
  flex: 2;
  background: #0f1228;
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: auto;
`;

export const FilesPanel = styled.div`
  flex: 1;
  background: #0f1228;
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: auto;
`;

export const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const PanelMeta = styled.div`
  font-size: 0.65rem;
  color: ${theme.muted};
`;

export const TableWrapper = styled.div`
  overflow: auto;
  max-height: 160px;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.7rem;
`;

export const Th = styled.th`
  padding: 8px 10px;
  text-align: left;
  border-bottom: 1px solid ${theme.border};
  background: rgba(255,255,255,0.03);
`;

export const Td = styled.td`
  padding: 8px 10px;
  border-bottom: 1px solid ${theme.border};
`;

export const FileList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  overflow: auto;
`;

export const FileItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #1d2142;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 8px;
  font-size: 0.8rem;
`;

export const FileName = styled.div``;
export const FileActions = styled.div`
  display: flex;
  gap: 6px;
`;

export const SmallBtn = styled(IconBtn)``;
export const BtnFull = styled(Btn)`
  width: 100%;
`;

export default function AppLayout() {
  const [audioUrl] = useState("/audio/10hz.mp3");
  const [wavesurfer, setWavesurfer] = useState(null);

  // toggle seleção (Sidebar)
  const [selectionEnabled, setSelectionEnabled] = useState(false);
  const selectedRegionIdRef = useRef(null);

  // IDs e tabela
  const idMapRef = useRef(new Map()); // region.id (string) -> uid (num)
  const [nextUid, setNextUid] = useState(1);
  const [annotations, setAnnotations] = useState([]);

  // mini menu da region (se usares RegionMenu.jsx)
  const [menuState, setMenuState] = useState({
    visible: false,
    left: 12,
    top: 8,
    selectedUid: null,
  });

  const handleToggleSelection = useCallback(() => {
    setSelectionEnabled((v) => !v);
  }, []);

  const handleReady = useCallback((ws) => {
    setWavesurfer(ws);
  }, []);

  // receber eventos do viewer (created/updated/selected/removed)
  const handleRegionChange = useCallback(
    (evt) => {
      const { type, region, menuPos } = evt;
      const rid = region.id;

      // manter seleção por id interno do plugin
      if (type === "selected") {
        selectedRegionIdRef.current = rid;
      }
      if (type === "removed" && selectedRegionIdRef.current === rid) {
        selectedRegionIdRef.current = null;
      }

      // atribuir UID estável
      if (!idMapRef.current.has(rid)) {
        idMapRef.current.set(rid, nextUid);
        setNextUid((n) => n + 1);
      }
      const uid = idMapRef.current.get(rid);

      // métricas (medidas reais, se vieram do viewer)
      const lowHz = region?.data?.metrics?.lowHz ?? 0;
      const highHz = region?.data?.metrics?.highHz ?? 0;

      setAnnotations((prev) => {
        const idx = prev.findIndex((a) => a.regionId === rid);
        const base = {
          uid,
          regionId: rid,
          start: region.start,
          end: region.end,
          lowHz,
          highHz,
          className: idx >= 0 ? prev[idx].className : "", // mantém classe se existir
        };

        if (type === "removed") {
          if (idx === -1) return prev;
          const clone = prev.slice();
          clone.splice(idx, 1);
          return clone;
        }

        if (idx === -1) return [...prev, base];
        const clone = prev.slice();
        clone[idx] = { ...clone[idx], ...base };
        return clone;
      });

      if (type === "selected") {
        setMenuState({
          visible: true,
          left: menuPos?.left ?? 12,
          top: menuPos?.top ?? 8,
          selectedUid: uid,
        });
      }
      if (type === "removed") {
        setMenuState((m) =>
          m.selectedUid === uid ? { ...m, visible: false } : m
        );
      }
    },
    [nextUid]
  );

  // Sidebar: apagar region selecionada
  const handleDeleteSelected = useCallback(() => {
    if (!wavesurfer) return;
    const regions = wavesurfer?.plugins?.regions;
    const id = selectedRegionIdRef.current;
    if (!regions || !id) return;
    regions.getRegion?.(id)?.remove();
  }, [wavesurfer]);

  // Sidebar: colorir region selecionada (classe CSS)
  const handleColorSelected = useCallback(
    (className) => {
      if (!wavesurfer) return;
      const regions = wavesurfer?.plugins?.regions;
      const id = selectedRegionIdRef.current;
      if (!regions || !id) return;
      const r = regions.getRegion?.(id);
      if (!r) return;
      r.removeClass?.("region-green");
      r.removeClass?.("region-blue");
      r.addClass?.(className) ?? r.element?.classList?.add(className);
    },
    [wavesurfer]
  );

  // RegionMenu: setar classe na linha + aplicar cor visual
  const handleSetClass = useCallback(
    (value) => {
      setAnnotations((prev) => {
        const idx = prev.findIndex((a) => a.uid === menuState.selectedUid);
        if (idx === -1) return prev;
        const clone = prev.slice();
        clone[idx] = { ...clone[idx], className: value };
        return clone;
      });
    },
    [menuState.selectedUid]
  );

  const handleMenuColor = useCallback(
    (className) => {
      if (!wavesurfer) return;
      const regions = wavesurfer?.plugins?.regions;
      const row = annotations.find((a) => a.uid === menuState.selectedUid);
      if (!regions || !row) return;
      const r = regions.getRegion?.(row.regionId);
      r?.removeClass?.("region-green");
      r?.removeClass?.("region-blue");
      r?.addClass?.(className) ?? r?.element?.classList?.add(className);
    },
    [wavesurfer, annotations, menuState.selectedUid]
  );

  const handleMenuDelete = useCallback(() => {
    if (!wavesurfer) return;
    const regions = wavesurfer?.plugins?.regions;
    const row = annotations.find((a) => a.uid === menuState.selectedUid);
    if (!regions || !row) return;
    regions.getRegion?.(row.regionId)?.remove();
  }, [wavesurfer, annotations, menuState.selectedUid]);

  return (
    <AppRoot>
      {/* Cabeçalho estático */}
      <Topbar>
        <Title>Audio Annotations</Title>
        <Actions>
          <Subtitle>Funchal Bay 2022</Subtitle>
          <Btn>Upload</Btn>
        </Actions>
      </Topbar>

      {/* Conteúdo principal com sidebars */}
      <ContentWrapper>
        {/* LeftControls */}
        <LeftControls>
          <SidebarControls
            selectionEnabled={selectionEnabled}
            onToggleSelection={handleToggleSelection}
            onDeleteSelected={handleDeleteSelected}
            onColorSelected={handleColorSelected}
          />
        </LeftControls>

        {/* Sidebar de tags */}
        <TagSidebar>
          <Panel>
            <PanelTitle>Objects</PanelTitle>
            <ItemList>
              <Item>dolphin</Item>
              <Item>whale</Item>
              <Item>seal</Item>
              <Item>turtle</Item>
            </ItemList>
          </Panel>
          <Panel>
            <PanelTitle>Events</PanelTitle>
            <ItemList>
              <Item>noise</Item>
              <Item>nothing</Item>
            </ItemList>
          </Panel>
          <Panel>
            <PanelTitle>Tags</PanelTitle>
            <ItemList>
              <TagItem>example-tag-1</TagItem>
              <TagItem>example-tag-2</TagItem>
            </ItemList>
          </Panel>
        </TagSidebar>

        {/* Área principal */}
        <MainArea>
          <Viewer>
            <ViewerHeader>
              <Badge>Waveform</Badge>
            </ViewerHeader>

            <ViewerBox>
              <SpectrogramOnClick
                audioUrl={audioUrl}
                onReady={setWavesurfer}
                selectionEnabled={selectionEnabled}
                onRegionChange={handleRegionChange}
              />

              {/* Mini menu da region selecionada (opcional) */}
              <RegionMenu
                visible={menuState.visible}
                left={menuState.left}
                top={menuState.top}
                annotation={
                  annotations.find((a) => a.uid === menuState.selectedUid) || null
                }
                onSetClass={handleSetClass}
                onColor={handleMenuColor}
                onDelete={handleMenuDelete}
              />

              <Playback>
                <PlaybackControls
                  wavesurfer={wavesurfer}
                  onLike={() => console.log("Liked")}
                  onDislike={() => console.log("Disliked")}
                />
              </Playback>
            </ViewerBox>
          </Viewer>

          {/* bottom panels */}
          <Bottom>
            <BottomGrid>
              <Annotations>
                <PanelHeader>
                  <PanelTitle>Annotations</PanelTitle>
                  <PanelMeta>Filter / Search</PanelMeta>
                </PanelHeader>
                <TableWrapper>
                  <Table>
                    <thead>
                      <tr>
                        <Th>ID</Th>
                        <Th>Begin (s)</Th>
                        <Th>End (s)</Th>
                        <Th>High Freq (Hz)</Th>
                        <Th>Low Freq (Hz)</Th>
                        <Th>Class</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {annotations.map((a) => (
                        <tr key={a.uid}>
                          <Td>{a.uid}</Td>
                          <Td>{a.start.toFixed(4)}</Td>
                          <Td>{a.end.toFixed(4)}</Td>
                          <Td>{Math.round(a.highHz)}</Td>
                          <Td>{Math.round(a.lowHz)}</Td>
                          <Td>{a.className || "-"}</Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </TableWrapper>
              </Annotations>

              <FilesPanel>
                <PanelHeader>
                  <PanelTitle>Files</PanelTitle>
                </PanelHeader>
                <FileList>
                  <FileItem>
                    <FileName>sound 8 - 2022-06-05_15_26_AMP.wav</FileName>
                    <FileActions>
                      <SmallBtn title="Play">▶️</SmallBtn>
                      <SmallBtn title="Download">⬇️</SmallBtn>
                    </FileActions>
                  </FileItem>
                  <FileItem>
                    <FileName>sound 7 - 2022-06-05_15_26_AMP.wav</FileName>
                    <FileActions>
                      <SmallBtn title="Play">▶️</SmallBtn>
                      <SmallBtn title="Download">⬇️</SmallBtn>
                    </FileActions>
                  </FileItem>
                </FileList>
                <BtnFull>Add File</BtnFull>
              </FilesPanel>
            </BottomGrid>
          </Bottom>
        </MainArea>
      </ContentWrapper>
    </AppRoot>
  );
}