import Link from "next/link";

import type { Marca } from "@/lib/catalogo-schema";

/** Nomes das marcas passando devagar, como um letreiro. Pausa ao passar o mouse; parada se o usuário pede menos movimento. */
export function FaixaMarcas({ marcas }: { marcas: Pick<Marca, "nome" | "slug">[] }) {
  const lista = [...marcas, ...marcas]; // duplicada para o loop ficar contínuo
  return (
    <section aria-label="Marcas da loja" className="overflow-hidden border-y border-border py-8">
      <ul className="faixa-deslizante flex w-max items-center gap-16 pr-16">
        {lista.map((m, i) => (
          <li key={`${m.slug}-${i}`} aria-hidden={i >= marcas.length || undefined}>
            <Link
              href={`/marcas/${m.slug}`}
              tabIndex={i >= marcas.length ? -1 : undefined}
              className="linha-crescente whitespace-nowrap font-display text-4xl font-light italic text-foreground/80 outline-none transition-colors duration-300 hover:text-egeu hover:[background-size:100%_1px] focus-visible:ring-2 focus-visible:ring-ring sm:text-5xl"
            >
              {m.nome}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
