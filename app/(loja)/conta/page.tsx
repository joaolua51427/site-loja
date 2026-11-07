import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { sair } from "@/app/actions/conta";
import { usuarioAtual } from "@/lib/supabase/servidor";

export const metadata: Metadata = { title: "Minha conta" };

async function Conteudo() {
  // Verificação no servidor (não basta esconder o link na tela).
  const { usuario } = await usuarioAtual();
  if (!usuario) redirect("/entrar?voltar=/conta");
  return (
    <div className="flex flex-col gap-6">
      <p className="text-muted-foreground">Você entrou como <span className="text-foreground">{usuario.email}</span>.</p>
      <p className="text-sm text-muted-foreground">Seus pedidos aparecerão aqui (próximas etapas).</p>
      <form action={sair}>
        <button type="submit" className="rotulo linha-crescente pb-1 hover:[background-size:100%_1px]">Sair da conta</button>
      </form>
    </div>
  );
}

export default function PaginaConta() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-16 sm:py-24">
      <h1 className="font-display text-5xl font-light tracking-tight">Minha conta</h1>
      <Suspense fallback={<div className="h-24 animate-pulse bg-muted/60" />}>
        <Conteudo />
      </Suspense>
    </div>
  );
}
