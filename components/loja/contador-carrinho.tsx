"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { useCarrinho } from "@/components/loja/carrinho-provider";

export function ContadorCarrinho() {
  const { totalItens, pronto } = useCarrinho();
  const rotulo = totalItens === 1 ? "1 item" : `${totalItens} itens`;
  return (
    <Link href="/carrinho" className="inline-flex min-h-11 items-center gap-2 rounded-none px-2 rotulo text-foreground outline-none transition-colors hover:text-egeu focus-visible:ring-2 focus-visible:ring-ring" aria-label={`Carrinho, ${rotulo}`}>
      <ShoppingBag aria-hidden="true" className="size-4" />
      <span className="hidden sm:inline">Carrinho</span>
      {pronto && totalItens > 0 && (
        <span key={totalItens} aria-hidden="true" className="min-w-5 motion-safe:animate-[pulo_450ms_cubic-bezier(.2,.7,.2,1)] rounded-none bg-foreground px-1.5 py-0.5 text-center text-[11px] font-medium leading-none text-background tabular-nums">{totalItens}</span>
      )}
    </Link>
  );
}
