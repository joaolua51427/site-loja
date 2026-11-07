import type { Metadata } from "next";
import Image from "next/image";

import { CardMarca } from "@/components/loja/card-marca";
import { FaixaMarcas } from "@/components/loja/faixa-marcas";
import { Manifesto } from "@/components/loja/manifesto";
import { SelosConfianca } from "@/components/loja/selos-confianca";
import { getMarcas, getProdutosDaMarca } from "@/lib/catalogo";

export const metadata: Metadata = { title: "Marcas" };

export default function PaginaMarcas() {
  const marcas = getMarcas();
  return (
    <div className="animate-in fade-in [animation-duration:700ms] motion-reduce:animate-none">
      <section className="relative isolate flex min-h-[46svh] items-end overflow-hidden bg-[oklch(0.2_0_0)] text-white">
        <Image src="/fundos/santorini-oia.webp" alt="" fill priority sizes="100vw" className="-z-20 object-cover object-[50%_45%] motion-safe:animate-[aproximar_16s_ease-out_both]" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 pb-12 pt-24 sm:px-6 sm:pb-16">
          <p className="rotulo animate-in fade-in fill-mode-both text-white/80 [animation-delay:150ms] [animation-duration:900ms] motion-reduce:animate-none">Nova coleção</p>
          <h1 className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both font-display text-5xl font-light tracking-tight text-balance [animation-delay:300ms] [animation-duration:1100ms] motion-reduce:animate-none sm:text-7xl">Escolha uma marca</h1>
          <p className="max-w-[46ch] animate-in fade-in fill-mode-both font-display text-xl font-light italic text-white/85 [animation-delay:600ms] [animation-duration:1100ms] motion-reduce:animate-none">luxo &amp; elegância · atitude &amp; personalidade</p>
        </div>
      </section>

      <Manifesto
        rotulo="Kyano Colletion"
        texto="Peças que não precisam de explicação. Couro, camurça e algodão escolhidos para o homem que se veste com intenção."
      />

      <FaixaMarcas marcas={marcas} />

      <div id="marcas" className="mx-auto flex w-full max-w-6xl scroll-mt-24 flex-col gap-10 px-4 py-20 sm:px-6 sm:py-24">
        <div className="flex flex-col gap-3">
          <p className="rotulo text-muted-foreground">As marcas</p>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">Cada marca tem o seu varal. Entre, passe pelas peças e abra a que chamar a sua atenção.</p>
        </div>
        <ul className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {marcas.map((marca, i) => (
            <li key={marca.id} className="revelar-cascata bg-background" style={{ ["--i" as string]: i % 3 }}>
              <CardMarca marca={marca} totalPecas={getProdutosDaMarca(marca.id).length} />
            </li>
          ))}
          {/* Preenche a última linha da grade com um convite para o Instagram da loja. */}
          <li
            className="revelar-cascata bg-foreground text-background sm:col-span-[var(--resto-sm)] lg:col-span-[var(--resto-lg)]"
            style={{ ["--i" as string]: marcas.length % 3, ["--resto-sm" as string]: (2 - (marcas.length % 2)) % 2 || 2, ["--resto-lg" as string]: (3 - (marcas.length % 3)) % 3 || 3 }}
          >
            <a
              href="https://www.instagram.com/kyanocolletion/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full min-h-64 flex-col justify-between gap-8 p-8 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-background"
            >
              <span className="rotulo text-background/60">Bastidores</span>
              <span className="font-display text-[clamp(1.75rem,3.2vw,2.75rem)] font-light italic leading-tight">Novas peças chegam primeiro no Instagram.</span>
              <span className="rotulo linha-crescente self-start pb-1 group-hover:[background-size:100%_1px]">Seguir @kyanocolletion</span>
            </a>
          </li>
        </ul>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6">
        <SelosConfianca />
      </div>
    </div>
  );
}
