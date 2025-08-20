// src/SpectrogramOnClick.jsx
import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import styled, { createGlobalStyle } from "styled-components";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";
import { measureRegionFreqs } from "./fftMeasure";

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const WaveformWrapper = styled.div`
  width: 100%;
  height: 260px;
  background: #0f111a;
  border-radius: 12px;
`;

const GlobalRegionStyles = createGlobalStyle`
  .wavesurfer-region, .region {
    border-radius: 6px;
    box-shadow: inset 0 0 0 2px rgba(0,0,0,.25);
    backdrop-filter: saturate(105%);
    transition: background .12s ease, border-color .12s ease, box-shadow .12s ease;
  }

  .wavesurfer-region.region-selected, .region.region-selected {
    box-shadow: 0 0 0 2px #79ffe1, inset 0 0 0 2px rgba(0,0,0,0.25) !important;
  }

  .wavesurfer-handle, .region-handle {
    width: 3px !important;
    background: rgba(255,255,255,0.7) !important;
  }

  .wavesurfer-region.region-green, .region.region-green {
    background: rgba(102,255,102,.35) !important;
    border: 2px solid rgba(102,255,102,.9) !important;
  }
`;

export default function SpectrogramOnClick({
  audioUrl,
  onReady,
  selectionEnabled,
  onRegionChange,
}) {
  const waveformRef = useRef(null);
  const wsRef = useRef(null);
  const regionsRef = useRef(null);
  const selectedIdRef = useRef(null);
  const regionMapRef = useRef(new Map());
  const bufferRef = useRef(null);

  const onRegionChangeRef = useRef(onRegionChange);
  useEffect(() => { onRegionChangeRef.current = onRegionChange; }, [onRegionChange]);

  const addClass = (r, cls) => { r?.addClass?.(cls) ?? r?.element?.classList?.add(cls); };
  const removeClass = (r, cls) => { r?.removeClass?.(cls) ?? r?.element?.classList?.remove(cls); };
  const getRegion = (id) => regionMapRef.current.get(id);
  const selectRegion = (id) => {
    const prevId = selectedIdRef.current;
    if (prevId && prevId !== id) removeClass(getRegion(prevId), "region-selected");
    selectedIdRef.current = id;
    addClass(getRegion(id), "region-selected");
  };

  const getData = (r) =>
    (typeof r?.getData === "function" ? r.getData() : r?.data) || {};
  const setData = (r, data) => {
    try {
      if (typeof r.setData === "function") r.setData(data);
      else if (typeof r.setOptions === "function") r.setOptions({ data });
      else r.data = data;
    } catch {
      r.data = { ...(r.data || {}), ...data };
    }
  };

  const serializeRegion = (r, metrics) => {
    const d = getData(r);
    return {
      id: r.id,
      start: r.start,
      end: r.end,
      data: { ...d, ...(metrics ? { metrics } : {}) },
      className: r.element?.className || "",
    };
  };
  const emit = (payload) => onRegionChangeRef.current?.(payload);

  const paintGreen = (r) => {
    if (!r) return;
    const el = r.element;
    if (el?.classList) {
      [...el.classList].forEach((c) => { if (c.startsWith("region-") && c !== "region-green") el.classList.remove(c); });
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

  /* ========== LABEL + NUMERAÇÃO ========== not working :,( */

  const computeLabelText = (base, idx) =>
    !base ? "" : idx > 1 ? `${base} ${idx}` : base;

  // Base do nome (vindo de item/labelBase/label)
  const baseOf = (r) => {
    const d = getData(r);
    return (
      d.labelBase ||
      d.item ||
      (d.label ? d.label.replace(/\s+\d+$/, "") : "") ||
      ""
    );
  };

  const ensureRegionLabel = (r) => {
    const el = r?.element;
    if (!el) return;

    const d = getData(r);
    const base = baseOf(r);
    if (!base) return;

    const idx = d.labelIndex || 1;
    const text = computeLabelText(base, idx);

    setData(r, { ...d, labelBase: base, labelIndex: idx, label: text });
    el.dataset.label = text;
    el.style.overflow = "visible";

    let lbl = el.querySelector(".region-label");
    if (!lbl) {
      lbl = document.createElement("div");
      lbl.className = "region-label";
      Object.assign(lbl.style, {
        position: "absolute",
        top: "4px",
        left: "6px",
        zIndex: 5,
        padding: "2px 8px",
        fontSize: "11px",
        lineHeight: "1",
        color: "#fff",
        background: "rgba(0,0,0,0.55)",
        border: "1px solid rgba(255,255,255,0.18)",
        borderRadius: "8px",
        pointerEvents: "none",
        whiteSpace: "nowrap",
      });
      el.appendChild(lbl);
    }
    lbl.textContent = text;
  };

  
  const renumberAll = (base) => {
    if (!base) return;
    const list = [];
    regionMapRef.current.forEach((r) => {
      if (baseOf(r) === base) list.push(r);
    });
    // ordem estável (por start)
    list.sort((a, b) => a.start - b.start);
    list.forEach((r, i) => {
      const idx = i + 1;
      const d = getData(r);
      setData(r, { ...d, labelBase: base, labelIndex: idx, label: computeLabelText(base, idx) });
      ensureRegionLabel(r);
    });
  };

  /* ======================================== */

  useEffect(() => {
    const ws = WaveSurfer.create({
      container: waveformRef.current,
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

    ws.on("ready", () => {
      bufferRef.current = ws.getDecodedData();
      onReady?.(ws);
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
      const waveRect = waveformRef.current?.getBoundingClientRect();
      const elRect = r.element?.getBoundingClientRect();
      const left = waveRect && elRect ? Math.max(8, Math.min(elRect.left - waveRect.left, waveRect.width - 220)) : 12;
      const top = 8;

      emit({ type, region: serializeRegion(r, metrics), menuPos: { left, top } });
    };

    regions.on("region-clicked", (r, e) => {
      e.stopPropagation?.();
      selectRegion(r.id);
      ensureRegionLabel(r);
      computeAndEmit("selected", r);
    });

    regions.on("region-created", (r) => {
      regionMapRef.current.set(r.id, r);
      paintGreen(r);

      // se vier com item do quick-create, usa-o como base
      const d = getData(r);
      const base = d.item || d.labelBase || "";
      if (base) {
        // coloca temporariamente index 1 e renumera todos
        setData(r, { ...d, labelBase: base, labelIndex: 1 });
        renumberAll(base);
      } else {
        ensureRegionLabel(r);
      }

      computeAndEmit("created", r);
    });

    regions.on("region-updated", (r) => {
      regionMapRef.current.set(r.id, r);
      paintGreen(r);
      const base = baseOf(r);
      if (base) renumberAll(base);
      else ensureRegionLabel(r);
      computeAndEmit("updated", r);
    });

    regions.on("region-update-end", (r) => {
      const base = baseOf(r);
      if (base) renumberAll(base);
      else ensureRegionLabel(r);
    });

    regions.on("region-removed", (r) => {
      const base = baseOf(r); // captura antes de remover
      regionMapRef.current.delete(r.id);
      if (selectedIdRef.current === r.id) selectedIdRef.current = null;
      if (base) renumberAll(base);
      computeAndEmit("removed", r);
    });

    ws.load(audioUrl);

    wsRef.current = ws;
    regionsRef.current = regions;

    return () => {
      try { ws.destroy(); } catch (err) {
        if (err?.name !== "AbortError") console.error(err);
      }
      wsRef.current = null;
      regionsRef.current = null;
      regionMapRef.current.clear();
    };
  }, [audioUrl, onReady]);

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
      <WaveformWrapper ref={waveformRef} />
    </Container>
  );
}

SpectrogramOnClick.propTypes = {
  audioUrl: PropTypes.string.isRequired,
  onReady: PropTypes.func,
  selectionEnabled: PropTypes.bool,
  onRegionChange: PropTypes.func,
};

SpectrogramOnClick.defaultProps = {
  onReady: null,
  selectionEnabled: false,
  onRegionChange: null,
};
