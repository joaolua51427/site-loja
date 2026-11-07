"use client";

import * as React from "react";
import Image from "next/image";
import { ViewTransition } from "react";

import { cn } from "@/lib/utils";

export type FotoProduto = { src: string; alt: string; rotulo: string };

/** Uma foto com lupa: amplia onde o mouse passa (só com mouse; no toque fica normal). */
function FotoComLupa({ foto, prioridade, marcarOrigem }: { foto: FotoProduto; prioridade?: boolean; marcarOrigem?: boolean }) {
  const [zoom, setZoom] = React.useState(false);
  const caixa = React.useRef<HTMLDivElement>(null);
  function mover(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "touch" || !caixa.current) return;
    const r = caixa.current.getBoundingClientRect();
    caixa.current.style.setProperty("--zx", `${((e.clientX - r.left) / r.width) * 100}%`);
    caixa.current.style.setProperty("--zy", `${((e.clientY - r.top) / r.height) * 100}%`);
  }
  return (
    <div
      ref={caixa}
      data-foto-produto={marcarOrigem || undefined}
      onPointerEnter={(e) => { if (e.pointerType !== "touch") setZoom(true); }}
      onPointerLeave={() => setZoom(false)}
      onPointerMove={mover}
      className={cn("relative aspect-[200/310] w-full overflow-hidden bg-muted/60", zoom && "cursor-zoom-in")}
    >
      <Image
        src={foto.src}
        alt={foto.alt}
        fill
        priority={prioridade}
        sizes="(min-width: 768px) 50vw, 100vw"
        style={{ transformOrigin: "var(--zx, 50%) var(--zy, 50%)" }}
        className={cn("object-contain p-8 transition-transform duration-500 ease-[cubic-bezier(.2,.7,.2,1)] motion-reduce:transition-none", zoom && "scale-[1.9]")}
      />
      <span className={cn("rotulo pointer-events-none absolute bottom-4 left-4 hidden bg-background/85 px-3 py-1.5 text-muted-foreground transition-opacity duration-300 [@media(hover:hover)]:block", zoom && "opacity-0")}>
        {foto.rotulo}
      </span>
    </div>
  );
}

export function GaleriaProduto({ fotos, nomeTransicao }: { fotos: FotoProduto[]; nomeTransicao?: string }) {
  const trilho = React.useRef<HTMLDivElement>(null);
  const [atual, setAtual] = React.useState(0);

  function aoRolar() {
    const el = trilho.current;
    if (!el) return;
    setAtual(Math.round(el.scrollLeft / el.clientWidth));
  }

  return (
    <div>
      {/* Computador: fotos grandes empilhadas */}
      <div className="hidden flex-col gap-4 md:flex">
        {fotos.map((f, i) =>
          i === 0 ? (
            <ViewTransition key={f.src} name={nomeTransicao}>
              <div><FotoComLupa foto={f} prioridade marcarOrigem /></div>
            </ViewTransition>
          ) : (
            <div key={f.src} className="revelar"><FotoComLupa foto={f} /></div>
          ),
        )}
      </div>

      {/* Celular: deslizar para o lado */}
      <div className="md:hidden">
        <div
          ref={trilho}
          onScroll={aoRolar}
          role="group"
          aria-roledescription="carrossel"
          aria-label="Fotos do produto"
          className="-mx-4 flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {fotos.map((f, i) => (
            <div key={f.src} className="w-full shrink-0 snap-center px-4" aria-label={`Foto ${i + 1} de ${fotos.length}: ${f.rotulo}`}>
              {i === 0 ? (
                <ViewTransition name={nomeTransicao ? `${nomeTransicao}-m` : undefined}>
                  <div><FotoComLupa foto={f} prioridade marcarOrigem={false} /></div>
                </ViewTransition>
              ) : (
                <FotoComLupa foto={f} />
              )}
            </div>
          ))}
        </div>
        {fotos.length > 1 && (
          <div className="mt-3 flex items-center justify-center gap-3">
            <span className="rotulo tabular-nums text-muted-foreground" aria-live="polite">{atual + 1} / {fotos.length}</span>
            <div className="flex gap-1.5" aria-hidden="true">
              {fotos.map((f, i) => (
                <span key={f.src} className={cn("h-px transition-[width,background-color] duration-300", i === atual ? "w-8 bg-foreground" : "w-4 bg-foreground/30")} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
