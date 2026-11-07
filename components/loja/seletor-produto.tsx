"use client";

import * as React from "react";
import Link from "next/link";

import { useCarrinho } from "@/components/loja/carrinho-provider";
import { AvisoCarrinho } from "@/components/loja/aviso-carrinho";
import { Magnetico } from "@/components/interacoes/magnetico";
import { voarAoCarrinho } from "@/components/interacoes/voar-ao-carrinho";
import type { Cor } from "@/lib/catalogo-schema";

export type VariacaoSeletor = { id: string; tamanho: string; cor: string; estoque: number };
import { cn } from "@/lib/utils";

type Estado = { tipo: "ocioso" } | { tipo: "enviando" } | { tipo: "ok" } | { tipo: "erro"; mensagem: string };

export function SeletorProduto({ nome, imagem, tamanhos, cores, variacoes }: { nome: string; imagem: string; tamanhos: string[]; cores: Cor[]; variacoes: VariacaoSeletor[] }) {
  const { adicionar } = useCarrinho();
  const [tamanho, setTamanho] = React.useState<string | null>(null);
  const [cor, setCor] = React.useState(cores[0]?.nome ?? "");
  const [estado, setEstado] = React.useState<Estado>({ tipo: "ocioso" });
  const [aviso, setAviso] = React.useState(false);
  const fecharAviso = React.useCallback(() => setAviso(false), []);
  const id = React.useId();
  // Estoque exibido é só informativo; o servidor confere de novo ao adicionar.
  const variacaoDe = (t: string, c: string) => variacoes.find((v) => v.tamanho === t && v.cor === c);
  const escolhida = tamanho ? variacaoDe(tamanho, cor) : undefined;

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    if (!tamanho) {
      setEstado({ tipo: "erro", mensagem: "Escolha um tamanho." });
      return;
    }
    const v = variacaoDe(tamanho, cor);
    if (!v || v.estoque <= 0) {
      setEstado({ tipo: "erro", mensagem: "Este tamanho esgotou nesta cor." });
      return;
    }
    setEstado({ tipo: "enviando" });
    try {
      const resposta = await adicionar(v.id, 1);
      if (!resposta.ok) {
        setEstado({ tipo: "erro", mensagem: resposta.erro });
        return;
      }
      setEstado({ tipo: "ok" });
      voarAoCarrinho(document.querySelector("[data-foto-produto] img"));
      setAviso(true);
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
              <input type="radio" name={`${id}-cor`} value={c.nome} checked={cor === c.nome} onChange={() => { setCor(c.nome); setTamanho(null); setEstado({ tipo: "ocioso" }); }} className="peer sr-only" />
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
          {tamanhos.map((t) => {
            const esgotado = (variacaoDe(t, cor)?.estoque ?? 0) <= 0;
            return (
              <label key={t} className={esgotado ? "cursor-not-allowed" : "cursor-pointer"}>
                <input type="radio" name={`${id}-tamanho`} value={t} disabled={esgotado} checked={tamanho === t} onChange={() => { setTamanho(t); if (estado.tipo === "erro") setEstado({ tipo: "ocioso" }); }} className="peer sr-only" aria-label={esgotado ? `${t}, esgotado` : t} />
                <span className={cn(
                  "relative flex size-12 items-center justify-center overflow-hidden rounded-[2px] border border-border text-sm tabular-nums transition-[transform,colors] peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background peer-focus-visible:ring-2 peer-focus-visible:ring-ring",
                  esgotado ? "text-muted-foreground/60 [background:linear-gradient(to_top_right,transparent_calc(50%-0.5px),var(--border)_50%,transparent_calc(50%+0.5px))]" : "hover:border-foreground/40 active:scale-90",
                )}>
                  {t}
                </span>
              </label>
            );
          })}
        </div>
        <p className="min-h-5 text-xs" aria-live="polite">
          {escolhida && escolhida.estoque > 0 && escolhida.estoque <= 3 && (
            <span className="text-egeu">{escolhida.estoque === 1 ? "Última unidade neste tamanho." : `Últimas ${escolhida.estoque} unidades neste tamanho.`}</span>
          )}
        </p>
      </fieldset>

      <div className="flex flex-col gap-3">
        <Magnetico className="sm:self-start">
        <button
          type="submit"
          disabled={estado.tipo === "enviando"}
          className={cn(
            "inline-flex min-h-12 items-center justify-center rounded-none bg-foreground px-8 rotulo text-background outline-none botao-varredura hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60 motion-reduce:transition-none active:scale-[0.98]",
          )}
        >
          {estado.tipo === "enviando" ? "Adicionando…" : "Adicionar ao carrinho"}
        </button>
        </Magnetico>
        <p aria-live="polite" className="min-h-5 text-sm">
          {estado.tipo === "erro" && <span className="text-destructive">{estado.mensagem}</span>}
          {estado.tipo === "ok" && (
            <span>Adicionado ao carrinho. <Link href="/carrinho" className="underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring">Ver carrinho</Link></span>
          )}
        </p>
      </div>
      <AvisoCarrinho aberto={aviso} aoFechar={fecharAviso} nome={nome} detalhe={`Tamanho ${tamanho ?? ""} · ${cor}`} imagem={imagem} />
    </form>
  );
}
