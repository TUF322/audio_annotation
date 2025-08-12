// SpectroplotViewer.jsx
import React, { useEffect, useRef } from "react";
import { Spectroplot } from "spectroplot";
import "spectroplot/lib/styles.css";

export default function SpectroplotViewer({ audioBuffer, onClickTimeFreq }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const spRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Cria o worker com sintaxe moderna (serviço padrão Vite/Webpack 5)
    const worker = new Worker(
      new URL("spectroplot/lib/worker.js", import.meta.url),
      { type: "module" }
    );

    // Instancia o Spectroplot
    spRef.current = new Spectroplot({
      element: containerRef.current,
      workerOrUrl: worker,
      scale: "linear",
      crosshair: false,
    });

    // Identifica o canvas interno (spectrograma)
    const canvases = containerRef.current.querySelectorAll("canvas");
    canvasRef.current = canvases[canvases.length - 1] ?? null;

    return () => {
      try { spRef.current?.destroy?.(); } catch {}
      worker.terminate();
    };
  }, []);

  // Desenha espectrograma a partir do AudioBuffer
  useEffect(() => {
    if (audioBuffer && spRef.current) {
      spRef.current.renderWholeBuffer(audioBuffer);
    }
  }, [audioBuffer]);

  // Click: obtém tempo/frequência
  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs || !audioBuffer) return;

    const handleClick = (e) => {
      const rect = cvs.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const time = (x / rect.width) * audioBuffer.duration;
      const freq = (1 - y / rect.height) * (audioBuffer.sampleRate / 2);
      onClickTimeFreq?.({ time, freq });
    };

    cvs.addEventListener("click", handleClick);
    return () => cvs.removeEventListener("click", handleClick);
  }, [audioBuffer, onClickTimeFreq]);

  return <div ref={containerRef} style={{ width: "100%", height: 200 }} />;
}
