"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

/** Cartão que desliza no canto avisando que a peça foi para o carrinho. Some sozinho em 5 s. */
export function AvisoCarrinho({ aberto, aoFechar, nome, detalhe, imagem }: { aberto: boolean; aoFechar: () => void; nome: string; detalhe: string; imagem: string }) {
  React.useEffect(() => {
    if (!aberto) return;
    const t = window.setTimeout(aoFechar, 5000);
    return () => window.clearTimeout(t);
  }, [aberto, aoFechar]);

  return (
    <div
      className={`fixed right-4 top-24 z-50 w-[min(22rem,calc(100vw-2rem))] transition-[transform,opacity] duration-500 ease-[cubic-bezier(.2,.7,.2,1)] motion-reduce:transition-none ${
        aberto ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-8 opacity-0"
      }`}
      aria-hidden={!aberto}
    >
      <div className="flex gap-4 border border-border bg-background p-4 shadow-[0_24px_48px_-24px_color-mix(in_oklab,var(--color-foreground)_45%,transparent)]">
        <div className="relative aspect-[200/310] w-14 shrink-0 bg-muted/70">
          <Image src={imagem} alt="" fill sizes="3.5rem" className="object-contain p-1" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="rotulo text-egeu">Na sua sacola</p>
          <p className="truncate text-sm font-medium">{nome}</p>
          <p className="text-xs text-muted-foreground">{detalhe}</p>
          <Link href="/carrinho" tabIndex={aberto ? 0 : -1} className="rotulo linha-crescente mt-2 self-start pb-1 hover:[background-size:100%_1px]">Ver carrinho</Link>
        </div>
        <button type="button" onClick={aoFechar} tabIndex={aberto ? 0 : -1} aria-label="Fechar aviso" className="inline-flex size-9 shrink-0 items-center justify-center text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>
    </div>
  );
}
