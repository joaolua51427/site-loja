import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { NomeMarca } from "@/components/loja/nome-marca";
import type { Marca } from "@/lib/catalogo-schema";

export function CardMarca({ marca, totalPecas }: { marca: Marca; totalPecas: number }) {
  return (
    <Link
      href={`/marcas/${marca.slug}`}
      className="group flex h-full min-h-56 flex-col justify-between gap-8 rounded-2xl border border-border bg-card p-6 text-card-foreground outline-none transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-[0_12px_32px_-18px_color-mix(in_oklab,var(--color-foreground)_35%,transparent)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">{totalPecas} {totalPecas === 1 ? "peça" : "peças"}</span>
      <NomeMarca marca={marca} className="text-3xl leading-tight sm:text-4xl" />
      <span className="flex items-end justify-between gap-4">
        <span className="max-w-[30ch] text-sm leading-relaxed text-muted-foreground">{marca.descricao}</span>
        <ArrowRight aria-hidden="true" className="size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" />
      </span>
    </Link>
  );
}
