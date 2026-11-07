"use client";

import * as React from "react";

/** Inclina o conteúdo em 3D seguindo o mouse, com um brilho de luz. Só com mouse e sem "reduzir movimento". */
export function Inclinar({ children, className, graus = 7 }: { children: React.ReactNode; className?: string; graus?: number }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const ativo = React.useRef(false);

  React.useEffect(() => {
    ativo.current = window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  function mover(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || !ativo.current || e.pointerType === "touch") return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${((0.5 - py) * graus).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${((px - 0.5) * graus).toFixed(2)}deg`);
    el.style.setProperty("--bx", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--by", `${(py * 100).toFixed(1)}%`);
    el.dataset.inclinado = "";
  }
  function soltar() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    delete el.dataset.inclinado;
  }

  return (
    <div ref={ref} onPointerMove={mover} onPointerLeave={soltar} className={`[perspective:900px] ${className ?? ""}`}>
      <div className="relative transition-transform duration-500 ease-[cubic-bezier(.2,.7,.2,1)] [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] [transform-style:preserve-3d]">
        {children}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 [[data-inclinado]_&]:opacity-100"
          style={{ background: "radial-gradient(circle at var(--bx,50%) var(--by,50%), rgb(255 255 255 / 0.45), transparent 55%)", mixBlendMode: "soft-light" }}
        />
      </div>
    </div>
  );
}
