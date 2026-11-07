"use client";

import * as React from "react";
import Link from "next/link";

import { validarItemCarrinho } from "@/app/actions/carrinho";
import { useCarrinho } from "@/components/loja/carrinho-provider";
import type { Cor } from "@/lib/catalogo-schema";
import { cn } from "@/lib/utils";

type Estado = { tipo: "ocioso" } | { tipo: "enviando" } | { tipo: "ok" } | { tipo: "erro"; mensagem: string };

export function SeletorProduto({ produtoId, tamanhos, cores }: { produtoId: string; tamanhos: string[]; cores: Cor[] }) {
  const { adicionar } = useCarrinho();
  const [tamanho, setTamanho] = React.useState<string | null>(null);
  const [cor, setCor] = React.useState(cores[0]?.nome ?? "");
  const [estado, setEstado] = React.useState<Estado>({ tipo: "ocioso" });
  const id = React.useId();

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    if (!tamanho) {
      setEstado({ tipo: "erro", mensagem: "Escolha um tamanho." });
      return;
    }
    setEstado({ tipo: "enviando" });
    try {
      const resposta = await validarItemCarrinho({ produtoId, tamanho, cor, quantidade: 1 });
      if (!resposta.ok) {
        setEstado({ tipo: "erro", mensagem: resposta.erro });
        return;
      }
      adicionar(resposta.item);
      setEstado({ tipo: "ok" });
    } catch {
      setEstado({ tipo: "erro", mensagem: "Não foi possível adicionar este item. Tente novamente." });
    }
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-6" noValidate>
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-sm font-medium">Cor: <span className="font-normal text-muted-foreground">{cor}</span></legend>
        <div className="flex flex-wrap gap-3">
          {cores.map((c) => (
            <label key={c.nome} className="relative cursor-pointer">
              <input type="radio" name={`${id}-cor`} value={c.nome} checked={cor === c.nome} onChange={() => setCor(c.nome)} className="peer sr-only" />
              <span className="flex min-h-11 items-center gap-2 rounded-[2px] border border-border px-3 text-sm transition-colors peer-checked:border-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring hover:border-foreground/40">
                <span aria-hidden="true" className="size-4 rounded-full border border-foreground/15" style={{ background: c.hex }} />
                {c.nome}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-sm font-medium">Tamanho{tamanho && <span className="font-normal text-muted-foreground">: {tamanho}</span>}</legend>
        <div className="flex flex-wrap gap-2">
          {tamanhos.map((t) => (
            <label key={t} className="cursor-pointer">
              <input type="radio" name={`${id}-tamanho`} value={t} checked={tamanho === t} onChange={() => { setTamanho(t); if (estado.tipo === "erro") setEstado({ tipo: "ocioso" }); }} className="peer sr-only" />
              <span className="flex size-12 items-center justify-center rounded-[2px] border border-border text-sm tabular-nums transition-colors peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background peer-focus-visible:ring-2 peer-focus-visible:ring-ring hover:border-foreground/40">
                {t}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={estado.tipo === "enviando"}
          className={cn(
            "inline-flex min-h-12 items-center justify-center rounded-none bg-foreground px-8 rotulo text-background outline-none botao-varredura hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60 motion-reduce:transition-none sm:self-start",
          )}
        >
          {estado.tipo === "enviando" ? "Adicionando…" : "Adicionar ao carrinho"}
        </button>
        <p aria-live="polite" className="min-h-5 text-sm">
          {estado.tipo === "erro" && <span className="text-destructive">{estado.mensagem}</span>}
          {estado.tipo === "ok" && (
            <span>Adicionado ao carrinho. <Link href="/carrinho" className="underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring">Ver carrinho</Link></span>
          )}
        </p>
      </div>
    </form>
  );
}
