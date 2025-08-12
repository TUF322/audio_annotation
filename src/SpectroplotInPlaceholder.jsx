// src/SpectroplotInPlaceholder.jsx
import React, { useEffect, useRef } from 'react';
import { Spectroplot, startWorkers } from 'spectroplot';
import 'spectroplot/lib/styles.css';

// ⚠️ CRA/Webpack 5: gera o URL do worker a partir do pacote
const makeWorker = () =>
  new Worker(
    /* webpackChunkName: "spectroplot-worker" */
    new URL('spectroplot/lib/worker.js', import.meta.url),
    { type: 'module' } // o worker do spectroplot é ESM
  );

export default function SpectroplotInPlaceholder({
  audioUrl = '/audio/whale.mp3',
  onClickTimeFreq,
}) {
  const hostRef = useRef(null);
  const spRef = useRef(null);

  useEffect(() => {
    let canceled = false;

    // 1) garante que o host existe
    const hostEl = hostRef.current;
    if (!hostEl) return;

    // 2) arranque "eager" dos workers (evita o erro 'not a constructor')
    try {
      startWorkers(makeWorker());
    } catch (e) {
      // se já estiverem a correr, ignore
      // console.debug('startWorkers:', e);
    }

    // 3) cria o Spectroplot quando o host existe
    try {
      const sp = new Spectroplot({
        host: hostEl,
        workerOrUrl: makeWorker(), // também podes omitir porque arrancámos em cima
        pixelRatio: window.devicePixelRatio || 1,
        style: {
          background: '#151a27',
          gridColor: '#2a2f44',
          textColor: '#8a9bb8',
          colormap: 'cube1', // o “verde” do demo é outro mapa; troca se quiseres
        },
      });
      spRef.current = sp;

      // 4) carrega o áudio
      (async () => {
        try {
          const buf = await Spectroplot.loadUrl(audioUrl);
          if (canceled) return;
          await sp.renderWholeBuffer(buf);
        } catch (err) {
          console.error('Spectroplot load/render error:', err);
        }
      })();

      // 5) exemplo de click handler: devolve tempo/frequência
      const onClick = (ev) => {
        if (!sp) return;
        const { offsetX, offsetY, target } = ev;
        const rect = target.getBoundingClientRect();
        const x = offsetX ?? ev.clientX - rect.left;
        const y = offsetY ?? ev.clientY - rect.top;

        // mapear X -> tempo e Y -> Hz com as escalas internas
        const t = sp.pxToTime(x);
        const f = sp.pxToHz(y);
        onClickTimeFreq?.({ time: t, freq: f, magnitude: null });
      };
      hostEl.addEventListener('click', onClick);

      return () => {
        canceled = true;
        hostEl.removeEventListener('click', onClick);
        try {
          sp?.destroy?.();
        } catch {}
        spRef.current = null;
      };
    } catch (err) {
      console.error('Spectroplot init error:', err);
    }
  }, [audioUrl, onClickTimeFreq]);

  return (
    // este div é o host que o Spectroplot usa (tem de ser um Element real)
    <div
      ref={hostRef}
      style={{
        width: '100%',
        height: 320,      // ajusta à tua UI
        position: 'relative',
      }}
    />
  );
}
