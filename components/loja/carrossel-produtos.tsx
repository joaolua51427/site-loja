"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

/** Fileira horizontal com encaixe e setas. Os filhos devem ser itens de lista (<li>). */
export function CarrosselProdutos({ titulo, children, acao }: { titulo: string; children: React.ReactNode; acao?: React.ReactNode }) {
  const trilho = React.useRef<HTMLUListElement>(null);
  const [inicio, setInicio] = React.useState(true);
  const [fim, setFim] = React.useState(false);
  const id = React.useId();

  const medir = React.useCallback(() => {
    const el = trilho.current;
    if (!el) return;
    setInicio(el.scrollLeft < 8);
    setFim(el.scrollLeft + el.clientWidth > el.scrollWidth - 8);
  }, []);

  React.useEffect(() => {
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, [medir]);

  function rolar(direcao: 1 | -1) {
    const el = trilho.current;
    if (!el) return;
    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: direcao * el.clientWidth * 0.8, behavior: reduzido ? "auto" : "smooth" });
  }

  const botao = "inline-flex size-11 items-center justify-center border border-border outline-none transition-colors hover:bg-foreground hover:text-background disabled:pointer-events-none disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <section aria-labelledby={`${id}-t`} className="flex flex-col gap-8">
      <div className="flex items-end justify-between gap-4">
        <h2 id={`${id}-t`} className="font-display text-3xl font-light tracking-tight sm:text-4xl">{titulo}</h2>
        <div className="flex items-center gap-4">
          {acao}
          <div className="hidden gap-2 sm:flex">
            <button type="button" onClick={() => rolar(-1)} disabled={inicio} aria-label="Anteriores" className={botao}><ArrowLeft aria-hidden="true" className="size-4" strokeWidth={1.5} /></button>
            <button type="button" onClick={() => rolar(1)} disabled={fim} aria-label="Próximas" className={botao}><ArrowRight aria-hidden="true" className="size-4" strokeWidth={1.5} /></button>
          </div>
        </div>
      </div>
      <ul
        ref={trilho}
        onScroll={medir}
        className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-4 px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:scroll-px-0 sm:px-0 [&::-webkit-scrollbar]:hidden [&>li]:w-[62%] [&>li]:shrink-0 [&>li]:snap-start sm:[&>li]:w-[calc((100%-2.5rem)/3)] lg:[&>li]:w-[calc((100%-3.75rem)/4)]"
      >
        {children}
      </ul>
    </section>
  );
}
