import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import styled, { createGlobalStyle } from "styled-components";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";
import SpectrogramPlugin from "wavesurfer.js/dist/plugins/spectrogram.esm.js";
import { measureRegionFreqs } from "./fftMeasure";

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

/* camada que contém waveform + heatmap sobreposto */
const WaveContainer = styled.div`
  position: relative;
  width: 100%;
  height: 260px;
  background: #0f111a;
  border-radius: 12px;
  overflow: hidden;
`;

/* canvas do spectrogram/heatmap fica por cima do waveform */
const SpectroLayer = styled.div`
  position: absolute;
  inset: 0;
  opacity: ${p => (p.on ? 1 : 0)};
  transition: opacity .15s linear;
  pointer-events: none; /* passa cliques para o waveform (regiões, etc.) */
`;

/* ====== estilos globais (cores + label) ====== */
const GlobalRegionStyles = createGlobalStyle`
  .wavesurfer-region, .region {
    border-radius: 6px;
    box-shadow: inset 0 0 0 2px rgba(0,0,0,.25);
    backdrop-filter: saturate(105%);
    transition: background .12s ease, border-color .12s ease, box-shadow .12s ease;
  }
  .wavesurfer-region.region-selected, .region.region-selected {
    box-shadow: 0 0 0 2px #79ffe1, inset 0 0 0 2px rgba(0,0,0,.25) !important;
  }
  .wavesurfer-handle, .region-handle {
    width: 3px !important;
    background: rgba(255,255,255,0.7) !important;
  }
  /* Verde default */
  .wavesurfer-region.region-green, .region.region-green {
    background: rgba(102,255,102,.35) !important;
    border: 2px solid rgba(102,255,102,.9) !important;
  }

  /* label no canto superior esquerdo da região */
  .wsr-label {
    position: absolute;
    left: 6px;
    top: 6px;
    padding: 2px 8px;
    font-size: 12px;
    line-height: 1;
    border-radius: 12px;
    background: rgba(0,0,0,.6);
    color: #eaffea;
    border: 1px solid rgba(0,0,0,.25);
    pointer-events: none;
    z-index: 3;
    white-space: nowrap;
    user-select: none;
  }
`;

export default function SpectrogramOnClick({
  audioUrl,
  onReady,
  selectionEnabled,
  onRegionChange,
  heatmapOn,              // <—— NOVO: controla a visibilidade do heatmap
}) {
  const waveRef = useRef(null);
  const spectroRef = useRef(null);

  const wsRef = useRef(null);
  const specPluginRef = useRef(null);
  const regionsRef = useRef(null);

  const selectedIdRef = useRef(null);
  const regionMapRef = useRef(new Map());
  const bufferRef = useRef(null);

  // proxy para callbacks vindos do pai
  const onRegionChangeRef = useRef(onRegionChange);
  useEffect(() => { onRegionChangeRef.current = onRegionChange; }, [onRegionChange]);

  // helpers
  const addClass = (r, cls) => { r?.addClass?.(cls) ?? r?.element?.classList?.add(cls); };
  const removeClass = (r, cls) => { r?.removeClass?.(cls) ?? r?.element?.classList?.remove(cls); };
  const getRegion = (id) => regionMapRef.current.get(id);
  const selectRegion = (id) => {
    const prevId = selectedIdRef.current;
    if (prevId && prevId !== id) removeClass(getRegion(prevId), "region-selected");
    selectedIdRef.current = id;
    addClass(getRegion(id), "region-selected");
  };
  const serializeRegion = (r, metrics) => ({
    id: r.id,
    start: r.start,
    end: r.end,
    data: { ...(r.data || {}), ...(metrics ? { metrics } : {}) },
    className: r.element?.className || "",
  });
  const emit = (payload) => onRegionChangeRef.current?.(payload);

  const paintGreen = (r) => {
    if (!r) return;
    const el = r.element;
    if (el?.classList) {
      [...el.classList].forEach((c) => {
        if (c.startsWith("region-") && c !== "region-green") el.classList.remove(c);
      });
    }
    addClass(r, "region-green");
    try {
      if (typeof r.setOptions === "function") r.setOptions({ color: "rgba(102,255,102,.35)" });
      else if (typeof r.update === "function") r.update({ color: "rgba(102,255,102,.35)" });
    } catch {}
    if (el) {
      el.style.setProperty("background", "rgba(102,255,102,.35)", "important");
      el.style.setProperty("background-color", "rgba(102,255,102,.35)", "important");
      el.style.setProperty("border", "2px solid rgba(102,255,102,.9)", "important");
    }
  };

  /* ===== labels ===== */
  const ensureLabelEl = (r) => {
    const el = r?.element;
    if (!el) return null;
    let lab = el.querySelector(".wsr-label");
    if (!lab) {
      lab = document.createElement("div");
      lab.className = "wsr-label";
      el.appendChild(lab);
    }
    return lab;
  };

  const updateLabelsForItem = (itemName) => {
    const key = String(itemName || "").toLowerCase();
    if (!key) return;
    const list = Array.from(regionMapRef.current.values()).filter(
      (rr) => (rr?.data?.item || "").toLowerCase() === key
    );
    // ordena por início e reatribui numeração 1..n
    list.sort((a, b) => a.start - b.start);
    list.forEach((rr, idx) => {
      const lab = ensureLabelEl(rr);
      if (lab) lab.textContent = `${itemName}${idx >= 1 ? ` ${idx + 1}` : ""}`;
    });
  };

  const updateSingleLabel = (r) => {
    const item = r?.data?.item;
    if (!item) {
      const lab = r?.element?.querySelector(".wsr-label");
      if (lab) lab.textContent = "";
      return;
    }
    updateLabelsForItem(item);
  };

  // cria WaveSurfer + plugins
  useEffect(() => {
    const ws = WaveSurfer.create({
      container: waveRef.current,
      height: 260,
      waveColor: "#b7bec7",
      progressColor: "#15839b",
      cursorWidth: 0,
      normalize: true,
      minPxPerSec: 80,
      fillParent: true,
      partialRender: true,
      dragToSeek: true,
      backend: "WebAudio",
      responsive: true,
    });

    const regions = RegionsPlugin.create({ dragSelection: false });
    ws.registerPlugin(regions);

    // spectrogram/heatmap plugin (renderiza no spectroRef)
    const spectro = SpectrogramPlugin.create({
      container: spectroRef.current,
      labels: false,
      height: 260,
      fftSamples: 2048,
      frequencyMin: 0,
      // colorMap: undefined // default já é "heatmap"
    });
    ws.registerPlugin(spectro);

    ws.on("ready", () => {
      bufferRef.current = ws.getDecodedData();
      onReady?.(ws);
      // atualizar labels em regiões já existentes
      regionMapRef.current.forEach((r) => updateSingleLabel(r));
    });

    const computeAndEmit = (type, r) => {
      const buf = bufferRef.current;
      let metrics = { lowHz: 0, highHz: 0, peakHz: 0, centroidHz: 0, frames: 0 };
      if (buf && (r.end - r.start) > 0) {
        try {
          metrics = measureRegionFreqs(buf, r.start, r.end, { fftSize: 2048, floorDb: -25 });
        } catch (e) {
          console.warn("measureRegionFreqs error:", e);
        }
      }
      const waveRect = waveRef.current?.getBoundingClientRect();
      const elRect = r.element?.getBoundingClientRect();
      const left = waveRect && elRect ? Math.max(8, Math.min(elRect.left - waveRect.left, waveRect.width - 220)) : 12;
      const top = 8;
      emit({ type, region: serializeRegion(r, metrics), menuPos: { left, top } });
    };

    regions.on("region-clicked", (r, e) => {
      e.stopPropagation?.();
      selectRegion(r.id);
      computeAndEmit("selected", r);
    });

    regions.on("region-created", (r) => {
      regionMapRef.current.set(r.id, r);
      paintGreen(r);
      ensureLabelEl(r);
      updateSingleLabel(r);
      computeAndEmit("created", r);
    });

    regions.on("region-updated", (r) => {
      regionMapRef.current.set(r.id, r);
      paintGreen(r);
      ensureLabelEl(r);
      updateSingleLabel(r);
      computeAndEmit("updated", r);
    });

    regions.on("region-removed", (r) => {
      regionMapRef.current.delete(r.id);
      if (selectedIdRef.current === r.id) selectedIdRef.current = null;
      if (r?.data?.item) updateLabelsForItem(r.data.item);
      computeAndEmit("removed", r);
    });

    ws.load(audioUrl);

    wsRef.current = ws;
    regionsRef.current = regions;
    specPluginRef.current = spectro;

    return () => {
      try { ws.destroy(); } catch (err) {
        if (err?.name !== "AbortError") console.error(err);
      }
      wsRef.current = null;
      regionsRef.current = null;
      specPluginRef.current = null;
      regionMapRef.current.clear();
    };
  }, [audioUrl, onReady]);

  // ligar/desligar dragSelection
  useEffect(() => {
    const regions = regionsRef.current;
    if (!regions) return;
    const enable = !!selectionEnabled;

    if (typeof regions.enableDragSelection === "function") {
      if (enable) regions.enableDragSelection({ slop: 1 });
      else if (typeof regions.disableDragSelection === "function") regions.disableDragSelection();
      else if (typeof regions.setOptions === "function") regions.setOptions({ dragSelection: false });
      else regions.dragSelection = false;
    } else if (typeof regions.setOptions === "function") {
      regions.setOptions({ dragSelection: enable ? { slop: 1 } : false });
    } else {
      regions.dragSelection = enable;
    }
  }, [selectionEnabled]);

  return (
    <Container>
      <GlobalRegionStyles />
      <WaveContainer>
        {/* WaveSurfer desenha aqui o waveform + regiões */}
        <div ref={waveRef} style={{ width: "100%", height: "100%" }} />
        {/* Heatmap/Spectrogram sobreposto (visibilidade controlada por prop) */}
        <SpectroLayer ref={spectroRef} as="div" on={!!heatmapOn} />
      </WaveContainer>
    </Container>
  );
}

SpectrogramOnClick.propTypes = {
  audioUrl: PropTypes.string.isRequired,
  onReady: PropTypes.func,
  selectionEnabled: PropTypes.bool,
  onRegionChange: PropTypes.func,
  heatmapOn: PropTypes.bool,
};

SpectrogramOnClick.defaultProps = {
  onReady: null,
  selectionEnabled: false,
  onRegionChange: null,
  heatmapOn: false,
};
