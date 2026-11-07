import type { Metadata } from "next";
import { Suspense } from "react";

import { FormularioEntrar } from "@/components/loja/formulario-entrar";
import { destinoSeguro } from "@/lib/redirecionar";

export const metadata: Metadata = { title: "Entrar" };

async function Conteudo({ searchParams }: { searchParams: PageProps<"/entrar">["searchParams"] }) {
  const p = await searchParams;
  return <FormularioEntrar voltar={destinoSeguro(p.voltar)} erroLink={p.erro === "link"} />;
}

export default function PaginaEntrar({ searchParams }: PageProps<"/entrar">) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-16 sm:py-24">
      <div className="flex flex-col gap-2">
        <p className="rotulo text-muted-foreground">Sua conta</p>
        <h1 className="font-display text-5xl font-light tracking-tight">Bem-vindo</h1>
      </div>
      <Suspense fallback={<div className="h-80 animate-pulse bg-muted/60" />}>
        <Conteudo searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
