"use client";

import * as React from "react";

/**
 * Anel que acompanha o mouse e cresce sobre links e botões; mostra um rótulo
 * em elementos com data-cursor="Ver". O cursor normal continua visível (o anel é só um enfeite).
 * Só aparece com mouse e sem "reduzir movimento".
 */
export function CursorKyano() {
  const anel = React.useRef<HTMLDivElement>(null);
  const [ativo, setAtivo] = React.useState(false);
  const [rotulo, setRotulo] = React.useState<string | null>(null);
  const [sobreLink, setSobreLink] = React.useState(false);

  React.useEffect(() => {
    const ok = window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!ok) return;
    let x = -100, y = -100, ax = -100, ay = -100, quadro = 0, visivel = false;
    const loop = () => {
      ax += (x - ax) * 0.2;
      ay += (y - ay) * 0.2;
      if (anel.current) anel.current.style.transform = `translate3d(${ax}px, ${ay}px, 0)`;
      quadro = requestAnimationFrame(loop);
    };
    const mover = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX; y = e.clientY;
      if (!visivel) { visivel = true; ax = x; ay = y; setAtivo(true); }
      const alvo = (e.target as Element | null)?.closest?.("[data-cursor], a, button, label, [role=button]");
      setRotulo(alvo?.getAttribute("data-cursor") ?? null);
      setSobreLink(Boolean(alvo));
    };
    const sair = () => { visivel = false; setAtivo(false); };
    window.addEventListener("pointermove", mover, { passive: true });
    document.documentElement.addEventListener("pointerleave", sair);
    quadro = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", mover);
      document.documentElement.removeEventListener("pointerleave", sair);
      cancelAnimationFrame(quadro);
    };
  }, []);

  return (
    <div ref={anel} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[60] hidden [@media(pointer:fine)]:block">
      <div
        className={`-translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full border transition-[width,height,background-color,border-color,opacity] duration-300 ease-[cubic-bezier(.2,.7,.2,1)] ${
          !ativo ? "opacity-0" : "opacity-100"
        } ${
          rotulo
            ? "size-20 border-transparent bg-foreground/90 text-background"
            : sobreLink
              ? "size-11 border-egeu/60 bg-egeu/5"
              : "size-7 border-foreground/35"
        }`}
      >
        {rotulo && <span className="rotulo text-[9px]">{rotulo}</span>}
      </div>
    </div>
  );
}
