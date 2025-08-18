// src/App.js
import React, { useState, useCallback, useRef, useEffect } from "react";
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

/* -------- helpers para centrar/selecionar -------- */
const centerTimeInView = (ws, tSec) => {
  const wrapper = ws?.drawer?.wrapper;
  const dur = ws?.getDuration?.() || 0;
  if (!wrapper || !dur) return;
  const total = wrapper.scrollWidth;
  const view = wrapper.clientWidth;
  const target = (tSec / dur) * total - view / 2;
  wrapper.scrollLeft = Math.max(0, Math.min(target, total - view));
};

const focusRegion = (ws, region) => {
  if (!ws || !region) return;
  document
    .querySelectorAll(".region-selected")
    .forEach((el) => el.classList.remove("region-selected"));
  region.addClass?.("region-selected") ??
    region.element?.classList?.add("region-selected");

  const dur = ws.getDuration?.() || 0;
  const mid = (region.start + region.end) / 2;
  const ratio = dur ? Math.min(0.999, mid / dur) : 0;

  if (typeof ws.seekAndCenter === "function") ws.seekAndCenter(ratio);
  else {
    ws.seekTo?.(ratio);
    centerTimeInView(ws, mid);
  }
};

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

/* Left controls */
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
  &:hover {
    background: #2f345f;
  }
  img {
    max-width: 22px;
    max-height: 22px;
  }
`;

/* Sidebar definitions */
export const TagSidebar = styled.aside`
  width: 260px;
  background: ${theme.card};
  padding: 10px 12px 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
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
  margin-bottom: 6px;
`;
export const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;
export const Item = styled.div`
  background: rgba(255, 255, 255, 0.04);
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
export const ItemLabel = styled.span``;
export const KeyBadge = styled.button`
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 1px solid ${theme.border};
  background: #0f1228;
  color: #e3e8ff;
  font-size: 0.7rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  &:hover {
    background: #161a36;
  }
`;
export const TagItem = styled(Item)`
  border: 1px solid ${theme.primary};
`;

/* Viewer / playback */
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
  background: rgba(255, 255, 255, 0.07);
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
  box-shadow: inset 0 0 14px rgba(0, 0, 0, 0.5);
`;

/* Tabelas / ficheiros */
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
  background: rgba(255, 255, 255, 0.03);
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
export const LinkBtn = styled.button`
  background: transparent;
  border: none;
  color: ${theme.primary};
  cursor: pointer;
  padding: 0;
  font-size: 0.75rem;
  text-decoration: underline;
`;

/* — usados por PlaybackControls — */
export const ControlBtn = styled(IconBtn)`
  background: ${theme.controlBg};
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

/* Header “Definitions” com o + */
const DefinitionsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 4px 0 4px;
  color: #e3e8ff;
`;
const DefTitle = styled.div`
  font-size: 0.85rem;
  letter-spacing: 0.4px;
  opacity: 0.9;
`;
const PlusBtn = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 8px;
  border: 1px solid ${theme.border};
  background: #1d2142;
  color: #e3e8ff;
  cursor: pointer;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background: #222748;
  }
`;

/* ============== componente ============== */
function AppLayout() {
  const [audioUrl] = useState("/audio/10hz.mp3");
  const [wavesurfer, setWavesurfer] = useState(null);

  const [selectionEnabled, setSelectionEnabled] = useState(false);
  const selectedRegionIdRef = useRef(null);

  // ids/tabela
  const idMapRef = useRef(new Map()); // region.id -> uid
  const [nextUid, setNextUid] = useState(1);
  const [annotations, setAnnotations] = useState([]);

  // popup (region menu)
  const [menuState, setMenuState] = useState({
    visible: false,
    left: 12,
    top: 8,
    selectedUid: null,
  });

  // DEFINITIONS + modal
  const [objectDefs, setObjectDefs] = useState([
    "dolphin",
    "whale",
    "seal",
    "turtle",
  ]);
  const [eventDefs, setEventDefs] = useState(["noise", "nothing"]);
  const [tagDefs, setTagDefs] = useState(["lorem", "ipsum", "dolor", "uter"]);
  const [defModalOpen, setDefModalOpen] = useState(false);

  const handleAddDefinition = useCallback(({ type, name }) => {
    if (!name) return;
    if (type === "object")
      setObjectDefs((p) => (p.includes(name) ? p : [...p, name]));
    else if (type === "event")
      setEventDefs((p) => (p.includes(name) ? p : [...p, name]));
    else setTagDefs((p) => (p.includes(name) ? p : [...p, name]));
    setDefModalOpen(false);
  }, []);

  const viewerBoxRef = useRef(null);

  const handleToggleSelection = useCallback(() => {
    setSelectionEnabled((v) => !v);
  }, []);

  const handleReady = useCallback((ws) => setWavesurfer(ws), []);

  /* ----- Regions plugin (robusto para v6/v7) ----- */
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

  // procura região de forma robusta em várias coleções internas
  const findRegionById = useCallback(
    (id) => {
      const regions = getRegionsPlugin();
      if (!regions || id == null) return null;

      if (typeof regions.getRegion === "function") {
        const r = regions.getRegion(id);
        if (r) return r;
      }

      const pools = [
        regions.regions,
        regions.list,
        regions._regions,
        regions._list,
      ];
      for (const pool of pools) {
        if (!pool) continue;
        if (Array.isArray(pool)) {
          const r = pool.find((x) => x && (x.id === id || String(x.id) === String(id)));
          if (r) return r;
        } else if (pool instanceof Map) {
          const r = pool.get(id) || [...pool.values()].find((x) => String(x.id) === String(id));
          if (r) return r;
        } else if (typeof pool === "object") {
          const r = pool[id];
          if (r) return r;
        }
      }
      return null;
    },
    [getRegionsPlugin]
  );

  /* ----- eventos vindos do SpectrogramOnClick ----- */
  const handleRegionChange = useCallback(
    (evt) => {
      const { type, region } = evt;
      const rid = region.id;

      if (type === "selected") selectedRegionIdRef.current = rid;
      if (type === "removed" && selectedRegionIdRef.current === rid) {
        selectedRegionIdRef.current = null;
      }

      // UID estável
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
          // defaults sem sobrescrever os já escolhidos
          type: idx >= 0 ? prev[idx].type : "object",
          item: idx >= 0 ? prev[idx].item : "",
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

      // posicionar popup quando seleciona
      if (type === "selected") {
        const r = findRegionById(rid);
        const boxRect = viewerBoxRef.current?.getBoundingClientRect();
        const elRect = r?.element?.getBoundingClientRect();
        const left =
          boxRect && elRect
            ? Math.max(
                8,
                Math.min(elRect.left - boxRect.left, boxRect.width - 240)
              )
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
    [nextUid, findRegionById]
  );

  /* ----- ações sidebar ----- */
  const handleDeleteSelected = useCallback(() => {
    const id = selectedRegionIdRef.current;
    const r = findRegionById(id);
    r?.remove?.();
  }, [findRegionById]);

  const handleColorSelected = useCallback(
    (className) => {
      const id = selectedRegionIdRef.current;
      const r = findRegionById(id);
      if (!r) return;
      const el = r.element;
      REGION_COLOR_CLASSES.forEach((c) =>
        r.removeClass?.(c) ?? el?.classList?.remove(c)
      );
      if (className) r.addClass?.(className) ?? el?.classList?.add(className);
    },
    [findRegionById]
  );

  /* ----- focar/editar pelo UID (tabela) ----- */
  const handleOpenMenuForUid = useCallback(
    (uid) => {
      const row = annotations.find((a) => a.uid === uid);
      if (!row) return;

      const r = findRegionById(row.regionId);

      if (r && wavesurfer) {
        selectedRegionIdRef.current = row.regionId;
        focusRegion(wavesurfer, r);

        const boxRect = viewerBoxRef.current?.getBoundingClientRect?.();
        const elRect = r.element?.getBoundingClientRect?.();
        const left =
          boxRect && elRect
            ? Math.max(
                8,
                Math.min(elRect.left - boxRect.left, boxRect.width - 240)
              )
            : 16;
        const top =
          boxRect && elRect ? Math.max(8, elRect.top - boxRect.top - 56) : 12;

        setMenuState({ visible: true, left, top, selectedUid: uid });
      } else {
        // Abrir mesmo assim, perto do topo do viewer
        setMenuState({
          visible: true,
          left: 16,
          top: 12,
          selectedUid: uid,
        });
      }
    },
    [annotations, findRegionById, wavesurfer]
  );

  /* ----- callbacks do popup ----- */
  const handleTypeChange = useCallback((type) => {
    setAnnotations((prev) => {
      const idx = prev.findIndex((a) => a.uid === menuState.selectedUid);
      if (idx === -1) return prev;
      const clone = prev.slice();
      // reset do item quando troca type
      clone[idx] = { ...clone[idx], type, item: "" };
      return clone;
    });
  }, [menuState.selectedUid]);

  const handleItemChange = useCallback((item) => {
    setAnnotations((prev) => {
      const idx = prev.findIndex((a) => a.uid === menuState.selectedUid);
      if (idx === -1) return prev;
      const clone = prev.slice();
      clone[idx] = { ...clone[idx], item };
      return clone;
    });
  }, [menuState.selectedUid]);

  // Apagar a região atual (robusto)
  const handleMenuDelete = useCallback(() => {
    const row = annotations.find((a) => a.uid === menuState.selectedUid);
    const rid = row?.regionId;
    const r = findRegionById(rid);

    if (r && typeof r.remove === "function") {
      r.remove(); // vai disparar "removed" e sincronizar a tabela
    } else {
      // fallback: remover da tabela mesmo assim
      setAnnotations((prev) => prev.filter((a) => a.uid !== menuState.selectedUid));
    }

    setMenuState((m) => ({ ...m, visible: false }));
  }, [annotations, menuState.selectedUid, findRegionById]);

  /* ----- Hotkeys por primeira letra dos Objects ----- */
  const classCycleRef = useRef(new Map());
  const jumpToClass = useCallback(
    (firstLetter) => {
      const key = String(firstLetter || "").toLowerCase();
      if (!key) return;

      const list = annotations.filter(
        (a) => (a.item || "").toLowerCase().startsWith(key) && a.type === "object"
      );
      if (!list.length) return;

      const prev = classCycleRef.current.get(key) ?? -1;
      const next = (prev + 1) % list.length;
      classCycleRef.current.set(key, next);

      const ann = list[next];
      const r = findRegionById(ann.regionId);
      if (!r || !wavesurfer) return;

      selectedRegionIdRef.current = ann.regionId;
      focusRegion(wavesurfer, r);
      setMenuState((m) => ({ ...m, visible: false, selectedUid: ann.uid }));
    },
    [annotations, findRegionById, wavesurfer]
  );

  // hotkeys globais
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
      )
        return;

      const k = e.key?.toLowerCase();
      if (!k || k.length !== 1) return;

      const obj = objectDefs.find((o) => o?.[0]?.toLowerCase() === k);
      if (obj) {
        e.preventDefault();
        jumpToClass(obj[0]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [objectDefs, jumpToClass]);

  /* ----- cor atual (apenas se um dia voltares a usar) ----- */
  const selectedRow =
    annotations.find((a) => a.uid === menuState.selectedUid) || null;
  let colorClass = "";
  if (selectedRow) {
    const r = findRegionById(selectedRow.regionId);
    const el = r?.element;
    if (el?.classList) {
      colorClass =
        REGION_COLOR_CLASSES.find((c) => el.classList.contains(c)) || "";
    }
  }

  // valores do popup (type/item)
  const popupType = selectedRow?.type || "object";
  const popupItem = selectedRow?.item || "";

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
            <PlusBtn
              type="button"
              title="Add definition"
              onClick={() => setDefModalOpen(true)}
            >
              +
            </PlusBtn>
          </DefinitionsHeader>

          <Panel>
            <PanelTitle>Objects</PanelTitle>
            <ItemList>
              {objectDefs.map((o) => (
                <Item key={o}>
                  <ItemLabel>{o}</ItemLabel>
                  <KeyBadge
                    type="button"
                    title={`Jump to next "${o}" (tecla "${o[0]?.toUpperCase()}")`}
                    onClick={() => jumpToClass(o[0])}
                  >
                    {o[0]?.toUpperCase() || "?"}
                  </KeyBadge>
                </Item>
              ))}
            </ItemList>
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
            <ViewerHeader>
              <Badge>Waveform</Badge>
            </ViewerHeader>
            <ViewerBox ref={viewerBoxRef}>
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
                typeValue={popupType}
                itemValue={popupItem}
                objectDefs={objectDefs}
                eventDefs={eventDefs}
                tagDefs={tagDefs}
                onTypeChange={handleTypeChange}
                onItemChange={handleItemChange}
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
              <div
                style={{
                  flex: 2,
                  background: "#0f1228",
                  borderRadius: 10,
                  padding: 14,
                }}
              >
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
                        <Th>Type</Th>
                        <Th>Item</Th>
                        <Th>Ações</Th>
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
                          <Td>{a.type}</Td>
                          <Td>{a.item || "-"}</Td>
                          <Td>
                            <LinkBtn
                              type="button"
                              onClick={() => handleOpenMenuForUid(a.uid)}
                            >
                              Editar
                            </LinkBtn>
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </TableWrapper>
              </div>

              <div
                style={{
                  flex: 1,
                  background: "#0f1228",
                  borderRadius: 10,
                  padding: 14,
                }}
              >
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
