import type { Metadata } from "next";
import Image from "next/image";

import { CardMarca } from "@/components/loja/card-marca";
import { getMarcas, getProdutosDaMarca } from "@/lib/catalogo";

export const metadata: Metadata = { title: "Marcas" };

export default function PaginaMarcas() {
  const marcas = getMarcas();
  return (
    <div className="animate-in fade-in [animation-duration:700ms] motion-reduce:animate-none">
      <section className="relative isolate flex min-h-[46svh] items-end overflow-hidden bg-[oklch(0.2_0_0)] text-white">
        <Image src="/fundos/santorini-oia.webp" alt="" fill priority sizes="100vw" className="-z-20 object-cover object-[50%_45%]" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 pb-12 pt-24 sm:px-6 sm:pb-16">
          <p className="rotulo text-white/80">Nova coleção</p>
          <h1 className="font-display text-5xl font-light tracking-tight text-balance sm:text-7xl">Escolha uma marca</h1>
          <p className="max-w-[46ch] font-display text-xl font-light italic text-white/85">luxo &amp; elegância · atitude &amp; personalidade</p>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-14 sm:px-6 sm:py-20">
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">Cada marca tem o seu varal. Entre, passe pelas peças e abra a que chamar a sua atenção.</p>
        <ul className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {marcas.map((marca) => (
            <li key={marca.id} className="bg-background">
              <CardMarca marca={marca} totalPecas={getProdutosDaMarca(marca.id).length} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
