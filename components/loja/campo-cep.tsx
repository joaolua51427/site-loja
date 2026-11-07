"use client";

import * as React from "react";

import { mascaraCep } from "@/lib/frete/formatar";

/** Campo de CEP com máscara 00000-000. Validação de verdade acontece no servidor. */
export function CampoCep({ id, valor, aoMudar, aoEnviar, carregando, rotuloBotao = "Calcular" }: {
  id: string; valor: string; aoMudar: (v: string) => void; aoEnviar: () => void; carregando?: boolean; rotuloBotao?: string;
}) {
  const completo = valor.replace(/\D/g, "").length === 8;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">CEP</label>
      <div className="flex gap-2">
        <input
          id={id}
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="00000-000"
          value={mascaraCep(valor)}
          onChange={(e) => aoMudar(e.target.value.replace(/\D/g, "").slice(0, 8))}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (completo) aoEnviar(); } }}
          maxLength={9}
          className="min-h-12 w-36 border border-border bg-card px-4 text-base tabular-nums outline-none transition-colors focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring/30"
        />
        <button type="button" onClick={aoEnviar} disabled={!completo || carregando}
          className="rotulo min-h-12 border border-foreground px-5 outline-none transition-colors hover:bg-foreground hover:text-background disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-ring">
          {carregando ? "Calculando…" : rotuloBotao}
        </button>
      </div>
      <a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noopener noreferrer" className="self-start text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground">Não sei meu CEP</a>
    </div>
  );
}
