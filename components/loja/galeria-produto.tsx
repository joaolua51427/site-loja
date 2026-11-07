"use client";

import * as React from "react";
import Image from "next/image";
import { ViewTransition } from "react";

import { cn } from "@/lib/utils";

export type FotoProduto = { src: string; alt: string; rotulo: string };

export function GaleriaProduto({ fotos, nomeTransicao }: { fotos: FotoProduto[]; nomeTransicao?: string }) {
  const [atual, setAtual] = React.useState(0);
  const foto = fotos[atual] ?? fotos[0];
  const [zoom, setZoom] = React.useState(false);
  const caixa = React.useRef<HTMLDivElement>(null);

  // Lupa: só com mouse/caneta. Move a origem do zoom para onde o ponteiro está.
  function mover(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "touch" || !caixa.current) return;
    const r = caixa.current.getBoundingClientRect();
    caixa.current.style.setProperty("--zx", `${((e.clientX - r.left) / r.width) * 100}%`);
    caixa.current.style.setProperty("--zy", `${((e.clientY - r.top) / r.height) * 100}%`);
  }

  return (
    <div className="flex flex-col gap-4">
      <ViewTransition name={nomeTransicao}>
      <div
        ref={caixa}
        onPointerEnter={(e) => { if (e.pointerType !== "touch") setZoom(true); }}
        onPointerLeave={() => setZoom(false)}
        onPointerMove={mover}
        className={cn("group/lupa relative mx-auto aspect-[200/310] w-full max-w-md overflow-hidden rounded-[2px] bg-muted/60", zoom && "cursor-zoom-in")}
      >
        <Image
          key={foto.src}
          src={foto.src}
          alt={foto.alt}
          fill
          priority
          sizes="(min-width: 768px) 56rem, 90vw"
          style={{ transformOrigin: "var(--zx, 50%) var(--zy, 50%)" }}
          className={cn(
            "animate-in fade-in object-contain p-6 transition-transform duration-500 ease-[cubic-bezier(.2,.7,.2,1)] [animation-duration:300ms] motion-reduce:animate-none motion-reduce:transition-none",
            zoom && "scale-[1.9]",
          )}
        />
        <span aria-hidden="true" className={cn("rotulo pointer-events-none absolute bottom-3 left-1/2 hidden -translate-x-1/2 whitespace-nowrap bg-background/85 px-3 py-1.5 text-muted-foreground transition-opacity duration-300 [@media(hover:hover)]:block", zoom && "opacity-0")}>
          Passe o mouse para ampliar
        </span>
      </div>
      </ViewTransition>
      {fotos.length > 1 && (
        <div role="group" aria-label="Fotos do produto" className="flex justify-center gap-3">
          {fotos.map((f, i) => (
            <button
              key={f.src}
              type="button"
              aria-pressed={i === atual}
              aria-label={`Ver foto: ${f.rotulo}`}
              onClick={() => setAtual(i)}
              className={cn(
                "relative aspect-[200/310] w-16 overflow-hidden rounded-[2px] border bg-muted/60 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                i === atual ? "border-foreground" : "border-transparent hover:border-foreground/30",
              )}
            >
              <Image src={f.src} alt="" fill sizes="4rem" className="object-contain p-1.5" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
