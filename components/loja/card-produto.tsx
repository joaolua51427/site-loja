import { ViewTransition } from "react";
import Image from "next/image";
import Link from "next/link";

import type { Produto } from "@/lib/catalogo-schema";

export function CardProduto({ produto, marcaSlug, precoFormatado }: { produto: Produto; marcaSlug: string; precoFormatado: string }) {
  const cor = produto.cores[0].nome.toLowerCase();
  return (
    <Link
      href={`/marcas/${marcaSlug}/${produto.slug}`}
      className="group flex flex-col gap-4 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
    >
      <ViewTransition name={`produto-${produto.id}`}>
        <span className="relative block aspect-[200/310] overflow-hidden rounded-[2px] bg-muted/70">
          <Image
            src={produto.imagens.frente}
            alt={`${produto.nome}, cor ${cor}`}
            fill
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
            className="object-contain p-4 transition-[opacity,transform] duration-700 ease-[cubic-bezier(.4,0,.2,1)] group-hover:scale-[1.04] motion-reduce:transition-none"
          />
          {produto.imagens.costas && (
            // Ao passar o mouse, a peça "vira" e mostra as costas.
            <Image
              src={produto.imagens.costas}
              alt=""
              aria-hidden="true"
              fill
              sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
              className="object-contain p-4 opacity-0 transition-[opacity,transform] duration-700 ease-[cubic-bezier(.4,0,.2,1)] group-hover:scale-[1.04] group-hover:opacity-100 motion-reduce:transition-none"
            />
          )}
          <span aria-hidden="true" className="rotulo absolute inset-x-0 bottom-0 translate-y-full bg-foreground/90 py-3 text-center text-background transition-transform duration-500 ease-[cubic-bezier(.4,0,.2,1)] group-hover:translate-y-0 motion-reduce:transition-none">
            Ver peça
          </span>
        </span>
      </ViewTransition>
      <span className="flex flex-col gap-1 px-1">
        <span className="linha-crescente self-start text-sm font-medium group-hover:[background-size:100%_1px]">{produto.nome}</span>
        <span className="text-xs text-muted-foreground">{produto.cores.map((c) => c.nome).join(" · ")}</span>
        <span className="mt-1 text-sm tabular-nums">{precoFormatado}</span>
      </span>
    </Link>
  );
}
