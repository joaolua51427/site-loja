import Image from "next/image";
import Link from "next/link";

import type { Produto } from "@/lib/catalogo-schema";

export function CardProduto({ produto, marcaSlug, precoFormatado }: { produto: Produto; marcaSlug: string; precoFormatado: string }) {
  return (
    <Link
      href={`/marcas/${marcaSlug}/${produto.slug}`}
      className="group flex flex-col gap-3 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
    >
      <span className="relative block aspect-[200/310] overflow-hidden rounded-2xl bg-muted/60">
        <Image
          src={produto.imagens.frente}
          alt={`${produto.nome}, cor ${produto.cores[0].nome.toLowerCase()}`}
          fill
          sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
          className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
        />
      </span>
      <span className="flex flex-col gap-0.5 px-1">
        <span className="text-sm font-medium">{produto.nome}</span>
        <span className="text-xs text-muted-foreground">{produto.cores.map((c) => c.nome).join(" · ")}</span>
        <span className="mt-1 text-sm tabular-nums">{precoFormatado}</span>
      </span>
    </Link>
  );
}
