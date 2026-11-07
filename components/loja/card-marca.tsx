import { ViewTransition } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { NomeMarca } from "@/components/loja/nome-marca";
import type { Marca } from "@/lib/catalogo-schema";

export function CardMarca({ marca, totalPecas }: { marca: Marca; totalPecas: number }) {
  return (
    <Link
      href={`/marcas/${marca.slug}`}
      data-cursor="Entrar"
      className="group flex h-full min-h-64 min-w-0 flex-col overflow-hidden justify-between gap-10 bg-background p-8 text-foreground outline-none transition-colors duration-500 hover:bg-card focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-reduce:transition-none"
    >
      <span className="rotulo text-muted-foreground">{totalPecas} {totalPecas === 1 ? "peça" : "peças"}</span>
      <ViewTransition name={`marca-${marca.slug}`}>
        <NomeMarca marca={marca} className="inline-block max-w-full break-words text-[clamp(1.75rem,3.2vw,2.75rem)] leading-tight transition-opacity duration-500 group-hover:opacity-80 motion-reduce:transition-none" />
      </ViewTransition>
      <span className="flex items-end justify-between gap-4">
        <span className="max-w-[30ch] text-sm leading-relaxed text-muted-foreground">{marca.descricao}</span>
        <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-egeu transition-transform duration-500 group-hover:translate-x-2 motion-reduce:transition-none" />
      </span>
    </Link>
  );
}
