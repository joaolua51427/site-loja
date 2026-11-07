import type { Metadata } from "next";

import { CardMarca } from "@/components/loja/card-marca";
import { getMarcas, getProdutosDaMarca } from "@/lib/catalogo";

export const metadata: Metadata = { title: "Marcas" };

export default function PaginaMarcas() {
  const marcas = getMarcas();
  return (
    <div className="mx-auto flex w-full max-w-6xl animate-in fade-in slide-in-from-bottom-4 flex-col gap-10 px-4 py-14 [animation-duration:600ms] motion-reduce:animate-none sm:px-6 sm:py-20">
      <header className="flex max-w-2xl flex-col gap-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">Nova coleção</p>
        <h1 className="font-display text-5xl font-medium tracking-tight text-balance sm:text-6xl">Escolha uma marca</h1>
        <p className="text-base leading-relaxed text-muted-foreground">Cada marca tem o seu varal. Entre, passe pelas peças e abra a que chamar sua atenção.</p>
      </header>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {marcas.map((marca) => (
          <li key={marca.id}>
            <CardMarca marca={marca} totalPecas={getProdutosDaMarca(marca.id).length} />
          </li>
        ))}
      </ul>
    </div>
  );
}
