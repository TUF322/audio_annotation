// src/App.js
import React, { useState, useCallback, useRef } from "react";
import styled from "styled-components";
import SpectrogramOnClick from "./SpectrogramOnClick";
import PlaybackControls from "./PlaybackControls";
import SidebarControls from "./SidebarControls";
import RegionMenu from "./RegionMenu";
import AddDefinitionModal from "./AddDefinitionModal";

/* ================= theme ================= */
const theme = {
  bg: "#0f111a",
  card: "#1f2430",
  border: "#2a2f44",
  text: "#e3e8ff",
  muted: "#8a9bb8",
  controlBg: "#1d2142",
  primary: "#5c6bc0",
};

/* ============== constants ============== */
const REGION_COLOR_CLASSES = [
  "region-green",
  "region-blue",
  "region-red",
  "region-yellow",
  "region-purple",
  "region-orange",
  "region-cyan",
  "region-pink",
];

/* ================= styled ================= */
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
export const Title = styled.div`font-size: 1.1rem; font-weight: 600;`;
export const Actions = styled.div`display: flex; align-items: center;`;
export const Subtitle = styled.div`font-size: 0.8rem; margin-right: 8px;`;
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
export const ContentWrapper = styled.div`flex: 1; display: flex; overflow: hidden;`;

/* left nav */
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

/* ===== estes eram os que faltavam para o SidebarControls ===== */
export const SectionLabel = styled.div`
  font-size: 0.55rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${theme.muted};
`;
export const CtrlSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;
export const CtrlColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
export const Divider = styled.div`
  height: 1px;
  background: ${theme.border};
  margin: 8px 0;
`;
/* export do IconBtn também é necessário para o SidebarControls */
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

/* sidebar (direita do LeftControls) */
export const TagSidebar = styled.aside`
  width: 220px; background: ${theme.card}; padding: 16px;
  display: flex; flex-direction: column; gap: 16px;
  border-right: 1px solid ${theme.border}; overflow: auto;
`;
export const Panel = styled.div`background: ${theme.card}; border-radius: 10px; padding: 10px;`;
export const PanelTitle = styled.div`font-weight: 600; font-size: 0.9rem; margin-bottom: 4px;`;
export const ItemList = styled.div`display: flex; flex-direction: column; gap: 4px;`;
export const Item = styled.div`
  background: rgba(255,255,255,0.05); padding: 6px 10px; border-radius: 6px; font-size: 0.75rem;
`;
export const TagItem = styled(Item)`border: 1px solid ${theme.primary};`;

/* viewer */
export const MainArea = styled.main`flex: 1; display: flex; flex-direction: column; overflow: hidden;`;
export const Viewer = styled.section`padding: 16px; flex: 1; display: flex; flex-direction: column; gap: 12px;`;
export const ViewerHeader = styled.div`display: flex; align-items: center;`;
export const Badge = styled.div`
  background: rgba(255,255,255,0.07); padding: 6px 12px; border-radius: 8px; font-size: 0.65rem;
`;
export const ViewerBox = styled.div`
  flex: 1; background: ${theme.card}; border-radius: 14px; padding: 16px;
  display: flex; flex-direction: column; gap: 12px; box-shadow: inset 0 0 14px rgba(0,0,0,0.5);
`;

/* tabelas / ficheiros */
export const PanelHeader = styled.div`display: flex; justify-content: space-between; align-items: center;`;
export const PanelMeta = styled.div`font-size: 0.65rem; color: ${theme.muted};`;
export const TableWrapper = styled.div`overflow: auto; max-height: 160px;`;
export const Table = styled.table`width: 100%; border-collapse: collapse; font-size: 0.7rem;`;
export const Th = styled.th`
  padding: 8px 10px; text-align: left; border-bottom: 1px solid ${theme.border};
  background: rgba(255,255,255,0.03);
`;
export const Td = styled.td`padding: 8px 10px; border-bottom: 1px solid ${theme.border};`;

export const FileList = styled.ul`list-style: none; padding: 0; margin: 0; flex: 1; overflow: auto;`;
export const FileItem = styled.li`
  display: flex; justify-content: space-between; align-items: center;
  background: #1d2142; padding: 10px; border-radius: 8px; margin-bottom: 8px; font-size: 0.8rem;
`;
export const FileName = styled.div``;
export const FileActions = styled.div`display: flex; gap: 6px;`;

export const SmallBtn = styled(IconBtn)``;
export const BtnFull = styled(Btn)`width: 100%;`;
export const LinkBtn = styled.button`
  background: transparent; border: none; color: ${theme.primary}; cursor: pointer;
  padding: 0; font-size: 0.75rem; text-decoration: underline;
`;

/* — usados por PlaybackControls — */
export const ControlBtn = styled(IconBtn)`background: ${theme.controlBg};`;
export const Playback = styled.div`
  display: flex; justify-content: center; align-items: center; gap: 14px;
  padding-top: 8px; border-top: 1px solid ${theme.border}; flex-wrap: wrap;
`;
export const ScrollBarContainer = styled.div`width: 100%; height: 8px;`;
export const ScrollBar = styled.div`
  width: 100%; height: 10px; background: #e0e0e0; border-radius: 2px; position: relative;
`;
export const ScrollThumb = styled.div`
  position: absolute; height: 100%; width: 10%; left: 0; background: #4b0556ff; border-radius: 2px;
`;
export const Time = styled.div`font-size: 0.75rem; color: #666; text-align: center;`;

/* header de Definitions com botão + */
const DefinitionsHeader = styled.div`
  display:flex; align-items:center; justify-content:space-between;
  padding: 8px 12px 0 12px; color:#e3e8ff;
`;
const DefTitle = styled.div`font-size:.85rem; letter-spacing:.4px; opacity:.9;`;
const PlusBtn = styled.button`
  width: 26px; height: 26px; border-radius:8px; border:1px solid ${theme.border};
  background:#1d2142; color:#e3e8ff; cursor:pointer; line-height:1;
  display:flex; align-items:center; justify-content:center;
  &:hover{ background:#222748; }
`;

/* ============== component ============== */
function AppLayout() {
  const [audioUrl] = useState("/audio/whale.mp3");
  const [wavesurfer, setWavesurfer] = useState(null);

  const [selectionEnabled, setSelectionEnabled] = useState(false);
  const selectedRegionIdRef = useRef(null);

  const idMapRef = useRef(new Map()); // region.id -> uid
  const [nextUid, setNextUid] = useState(1);
  const [annotations, setAnnotations] = useState([]);

  const [menuState, setMenuState] = useState({
    visible: false,
    left: 12,
    top: 8,
    selectedUid: null,
  });

  // DEFINITIONS dinâmicas + modal
  const [objectDefs, setObjectDefs] = useState(["dolphin", "whale", "seal", "turtle"]);
  const [eventDefs, setEventDefs] = useState(["noise", "nothing"]);
  const [tagDefs, setTagDefs] = useState(["example-tag-1", "example-tag-2"]);
  const [defModalOpen, setDefModalOpen] = useState(false);

  const handleAddDefinition = useCallback(({ type, name }) => {
    if (type === "object") setObjectDefs((p) => (p.includes(name) ? p : [...p, name]));
    else if (type === "event") setEventDefs((p) => (p.includes(name) ? p : [...p, name]));
    else setTagDefs((p) => (p.includes(name) ? p : [...p, name]));
    setDefModalOpen(false);
  }, []);

  const viewerBoxRef = useRef(null);

  const handleToggleSelection = useCallback(() => {
    setSelectionEnabled((v) => !v);
  }, []);

  const handleReady = useCallback((ws) => setWavesurfer(ws), []);

  // encontra o plugin de regions (compat v6/v7)
  const getRegionsPlugin = useCallback(() => {
    const ws = wavesurfer;
    if (!ws || !ws.plugins) return null;
    if (ws.plugins.regions) return ws.plugins.regions;
    for (const key of Object.keys(ws.plugins)) {
      const inst = ws.plugins[key];
      if (
        inst &&
        (typeof inst.getRegion === "function" ||
          typeof inst.addRegion === "function" ||
          typeof inst.enableDragSelection === "function")
      ) {
        return inst;
      }
    }
    return null;
  }, [wavesurfer]);

  // eventos das regions
  const handleRegionChange = useCallback(
    (evt) => {
      const { type, region } = evt;
      const rid = region.id;

      if (type === "selected") selectedRegionIdRef.current = rid;
      if (type === "removed" && selectedRegionIdRef.current === rid) {
        selectedRegionIdRef.current = null;
      }

      if (!idMapRef.current.has(rid)) {
        idMapRef.current.set(rid, nextUid);
        setNextUid((n) => n + 1);
      }
      const uid = idMapRef.current.get(rid);

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
          className: idx >= 0 ? prev[idx].className : "",
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
        const regions = getRegionsPlugin();
        const r = regions?.getRegion?.(rid);
        const boxRect = viewerBoxRef.current?.getBoundingClientRect();
        const elRect = r?.element?.getBoundingClientRect();
        const left =
          boxRect && elRect
            ? Math.max(8, Math.min(elRect.left - boxRect.left, boxRect.width - 240))
            : 16;
        const top =
          boxRect && elRect ? Math.max(8, elRect.top - boxRect.top - 56) : 12;
        setMenuState({ visible: true, left, top, selectedUid: uid });
      }

      if (type === "removed") {
        setMenuState((m) =>
          m.selectedUid === uid ? { ...m, visible: false } : m
        );
      }
    },
    [nextUid, getRegionsPlugin]
  );

  const handleDeleteSelected = useCallback(() => {
    const regions = getRegionsPlugin();
    const id = selectedRegionIdRef.current;
    regions?.getRegion?.(id)?.remove();
  }, [getRegionsPlugin]);

  const handleColorSelected = useCallback(
    (className) => {
      const regions = getRegionsPlugin();
      const id = selectedRegionIdRef.current;
      const r = regions?.getRegion?.(id);
      if (!r) return;
      REGION_COLOR_CLASSES.forEach((c) =>
        r.removeClass?.(c) ?? r.element?.classList?.remove(c)
      );
      if (className)
        r.addClass?.(className) ?? r.element?.classList?.add(className);
    },
    [getRegionsPlugin]
  );

  const handleOpenMenuForUid = useCallback(
    (uid) => {
      const row = annotations.find((a) => a.uid === uid);
      if (!row) return;
      const regions = getRegionsPlugin();
      const r = regions?.getRegion?.(row.regionId);

      if (r) {
        r.addClass?.("region-selected") ??
          r.element?.classList?.add("region-selected");
        selectedRegionIdRef.current = row.regionId;
      }

      const dur = wavesurfer?.getDuration?.() || 0;
      if (dur > 0) wavesurfer.seekTo(Math.min(0.999, row.start / dur));

      const boxRect = viewerBoxRef.current?.getBoundingClientRect();
      const elRect = r?.element?.getBoundingClientRect();
      const left =
        boxRect && elRect
          ? Math.max(8, Math.min(elRect.left - boxRect.left, boxRect.width - 240))
          : 16;
      const top =
        boxRect && elRect ? Math.max(8, elRect.top - boxRect.top - 56) : 12;

      setMenuState({ visible: true, left, top, selectedUid: uid });
    },
    [annotations, wavesurfer, getRegionsPlugin]
  );

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

  const handleMenuDelete = useCallback(() => {
    const regions = getRegionsPlugin();
    const row = annotations.find((a) => a.uid === menuState.selectedUid);
    regions?.getRegion?.(row?.regionId)?.remove();
  }, [annotations, getRegionsPlugin, menuState.selectedUid]);

  const selectedRow =
    annotations.find((a) => a.uid === menuState.selectedUid) || null;
  let colorClass = "";
  if (selectedRow) {
    const regions = getRegionsPlugin();
    const rr = regions?.getRegion?.(selectedRow.regionId);
    const el = rr?.element;
    if (el?.classList) {
      colorClass =
        REGION_COLOR_CLASSES.find((c) => el.classList.contains(c)) || "";
    }
  }

  return (
    <AppRoot>
      <Topbar>
        <Title>Audio Annotations</Title>
        <Actions>
          <Subtitle>Funchal Bay 2022</Subtitle>
          <Btn>Upload</Btn>
        </Actions>
      </Topbar>

      <ContentWrapper>
        <LeftControls>
          <SidebarControls
            selectionEnabled={selectionEnabled}
            onToggleSelection={handleToggleSelection}
            onDeleteSelected={handleDeleteSelected}
            onColorSelected={handleColorSelected}
          />
        </LeftControls>

        <TagSidebar>
          <DefinitionsHeader>
            <DefTitle>Definitions</DefTitle>
            <PlusBtn type="button" title="Add definition" onClick={() => setDefModalOpen(true)}>+</PlusBtn>
          </DefinitionsHeader>

          <Panel>
            <PanelTitle>Objects</PanelTitle>
            <ItemList>{objectDefs.map((o) => <Item key={o}>{o}</Item>)}</ItemList>
          </Panel>

          <Panel>
            <PanelTitle>Events</PanelTitle>
            <ItemList>{eventDefs.map((e) => <Item key={e}>{e}</Item>)}</ItemList>
          </Panel>

          <Panel>
            <PanelTitle>Tags</PanelTitle>
            <ItemList>{tagDefs.map((t) => <TagItem key={t}>{t}</TagItem>)}</ItemList>
          </Panel>
        </TagSidebar>

        <MainArea>
          <Viewer>
            <ViewerHeader><Badge>Waveform</Badge></ViewerHeader>
            <ViewerBox>
              <SpectrogramOnClick
                audioUrl={audioUrl}
                onReady={handleReady}
                selectionEnabled={selectionEnabled}
                onRegionChange={handleRegionChange}
              />

              <RegionMenu
                visible={menuState.visible}
                left={menuState.left}
                top={menuState.top}
                annotation={selectedRow}
                colorClass={colorClass}
                onSetClass={handleSetClass}
                onDelete={handleMenuDelete}
                onClose={() => setMenuState((m) => ({ ...m, visible: false }))}
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

          <section style={{ padding: 16 }}>
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ flex: 2, background: "#0f1228", borderRadius: 10, padding: 14 }}>
                <PanelHeader>
                  <PanelTitle>Annotations</PanelTitle>
                  <PanelMeta>Filter / Search</PanelMeta>
                </PanelHeader>
                <TableWrapper>
                  <Table>
                    <thead>
                      <tr>
                        <Th>ID</Th><Th>Begin (s)</Th><Th>End (s)</Th>
                        <Th>High Freq (Hz)</Th><Th>Low Freq (Hz)</Th>
                        <Th>Class</Th><Th>Ações</Th>
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
                          <Td>
                            <LinkBtn type="button" onClick={() => handleOpenMenuForUid(a.uid)}>
                              Editar
                            </LinkBtn>
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </TableWrapper>
              </div>

              <div style={{ flex: 1, background: "#0f1228", borderRadius: 10, padding: 14 }}>
                <PanelHeader><PanelTitle>Files</PanelTitle></PanelHeader>
                <FileList>
                  <FileItem>
                    <FileName>sound 8 - 2022-06-05_15_26_AMP.wav</FileName>
                    <FileActions><SmallBtn title="Play">▶️</SmallBtn><SmallBtn title="Download">⬇️</SmallBtn></FileActions>
                  </FileItem>
                  <FileItem>
                    <FileName>sound 7 - 2022-06-05_15_26_AMP.wav</FileName>
                    <FileActions><SmallBtn title="Play">▶️</SmallBtn><SmallBtn title="Download">⬇️</SmallBtn></FileActions>
                  </FileItem>
                </FileList>
                <BtnFull>Add File</BtnFull>
              </div>
            </div>
          </section>
        </MainArea>
      </ContentWrapper>

      <AddDefinitionModal
        open={defModalOpen}
        onClose={() => setDefModalOpen(false)}
        onSubmit={handleAddDefinition}
        initialType="object"
      />
    </AppRoot>
  );
}

export default AppLayout;
