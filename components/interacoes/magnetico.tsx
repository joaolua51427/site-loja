"use client";

import * as React from "react";

/**
 * Puxa levemente o elemento na direção do mouse (força limitada a 0,3, como recomenda a skill).
 * Só com mouse/caneta e sem "reduzir movimento". Use em no máximo 1–2 elementos por tela.
 */
export function Magnetico({ children, forca = 0.3, className }: { children: React.ReactNode; forca?: number; className?: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fino = window.matchMedia("(pointer: fine)").matches;
    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fino || reduzido) return;
    const mover = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * forca;
      const y = (e.clientY - r.top - r.height / 2) * forca;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    };
    const soltar = () => { el.style.transform = ""; };
    el.addEventListener("pointermove", mover);
    el.addEventListener("pointerleave", soltar);
    return () => { el.removeEventListener("pointermove", mover); el.removeEventListener("pointerleave", soltar); };
  }, [forca]);

  return (
    <span ref={ref} className={`inline-flex transition-transform duration-500 ease-[cubic-bezier(.2,.9,.3,1.2)] will-change-transform ${className ?? ""}`}>
      {children}
    </span>
  );
}
