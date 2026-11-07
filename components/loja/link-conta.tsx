"use client";

import Link from "next/link";
import { User } from "lucide-react";

import { useCarrinho } from "@/components/loja/carrinho-provider";

export function LinkConta() {
  const { usuario, pronto } = useCarrinho();
  const logado = pronto && usuario;
  return (
    <Link href={logado ? "/conta" : "/entrar"} aria-label={logado ? "Minha conta" : "Entrar"} className="rotulo linha-crescente inline-flex min-h-11 items-center gap-2 px-2 outline-none transition-colors hover:text-egeu hover:[background-size:100%_1px] focus-visible:ring-2 focus-visible:ring-ring">
      <User aria-hidden="true" className="size-4" strokeWidth={1.5} />
      <span className="hidden lg:inline">{logado ? "Conta" : "Entrar"}</span>
    </Link>
  );
}
