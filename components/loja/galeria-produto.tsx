"use client";

import * as React from "react";
import Image from "next/image";
import { ViewTransition } from "react";

import { cn } from "@/lib/utils";

export type FotoProduto = { src: string; alt: string; rotulo: string };

export function GaleriaProduto({ fotos, nomeTransicao }: { fotos: FotoProduto[]; nomeTransicao?: string }) {
  const [atual, setAtual] = React.useState(0);
  const foto = fotos[atual] ?? fotos[0];
  return (
    <div className="flex flex-col gap-4">
      <ViewTransition name={nomeTransicao}>
      <div className="relative mx-auto aspect-[200/310] w-full max-w-md overflow-hidden rounded-[2px] bg-muted/60">
        <Image key={foto.src} src={foto.src} alt={foto.alt} fill priority sizes="(min-width: 768px) 28rem, 90vw" className="animate-in fade-in object-contain p-6 [animation-duration:300ms] motion-reduce:animate-none" />
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
