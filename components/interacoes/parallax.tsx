"use client";

import * as React from "react";

/** Move o conteúdo (uma foto de fundo) alguns pixels com o mouse e com a rolagem. */
export function Parallax({ children, mouse = 14, rolagem = 0.18, className }: { children: React.ReactNode; mouse?: number; rolagem?: number; className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const fino = window.matchMedia("(pointer: fine)").matches;
    let mx = 0, my = 0, sy = 0, quadro = 0;
    const aplicar = () => {
      quadro = 0;
      el.style.transform = `translate3d(${mx.toFixed(1)}px, ${(my + sy).toFixed(1)}px, 0) scale(1.06)`;
    };
    const agendar = () => { if (!quadro) quadro = requestAnimationFrame(aplicar); };
    const aoMover = (e: PointerEvent) => {
      if (!fino || e.pointerType !== "mouse") return;
      mx = (e.clientX / window.innerWidth - 0.5) * -mouse;
      my = (e.clientY / window.innerHeight - 0.5) * -mouse;
      agendar();
    };
    const aoRolar = () => { sy = window.scrollY * rolagem; agendar(); };
    window.addEventListener("pointermove", aoMover, { passive: true });
    window.addEventListener("scroll", aoRolar, { passive: true });
    aplicar();
    return () => { window.removeEventListener("pointermove", aoMover); window.removeEventListener("scroll", aoRolar); cancelAnimationFrame(quadro); };
  }, [mouse, rolagem]);

  return <div ref={ref} className={`transition-transform duration-700 ease-out will-change-transform ${className ?? ""}`}>{children}</div>;
}
