import type { Metadata } from "next";

import { ListaCarrinho } from "@/components/loja/lista-carrinho";

export const metadata: Metadata = { title: "Carrinho" };

export default function PaginaCarrinho() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="mb-8 font-display text-5xl font-light tracking-tight">Carrinho</h1>
      <ListaCarrinho />
    </div>
  );
}
