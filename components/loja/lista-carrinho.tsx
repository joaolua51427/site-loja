"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";

import { calcularCarrinho, type LinhaCarrinho } from "@/app/actions/carrinho";
import { chaveItem, useCarrinho } from "@/components/loja/carrinho-provider";
import { formatarPreco } from "@/lib/formatar";

type Resumo = { linhas: LinhaCarrinho[]; totalCentavos: number; descartados: number };

export function ListaCarrinho() {
  const { itens, pronto, alterarQuantidade, remover } = useCarrinho();
  const [resumo, setResumo] = React.useState<Resumo | null>(null);
  const [erro, setErro] = React.useState(false);
  const [houveDescarte, setHouveDescarte] = React.useState(false);

  // Sempre que o carrinho muda, o servidor recalcula preços e total.
  React.useEffect(() => {
    if (!pronto) return;
    let ativo = true;
    calcularCarrinho(itens)
      .then((r) => {
        if (!ativo) return;
        setResumo(r);
        setErro(false);
        // Tira do navegador o que o servidor recusou (produto inexistente, tamanho/cor inválidos).
        if (r.descartados > 0) {
          setHouveDescarte(true);
          const validas = new Set(r.linhas.map((l) => l.chave));
          itens.filter((i) => !validas.has(chaveItem(i))).forEach((i) => remover(chaveItem(i)));
        }
      })
      .catch(() => { if (ativo) setErro(true); });
    return () => { ativo = false; };
  }, [itens, pronto, remover]);

  if (!pronto || (!resumo && !erro)) return <p className="text-sm text-muted-foreground">Carregando carrinho…</p>;
  if (erro) return <p className="text-sm text-destructive">Não foi possível carregar o carrinho agora. Atualize a página e tente de novo.</p>;
  if (!resumo || resumo.linhas.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-border p-8">
        <p className="text-base">Seu carrinho está vazio.</p>
        <Link href="/marcas" className="inline-flex min-h-11 items-center rounded-full bg-foreground px-6 text-sm font-medium text-background outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">Ver marcas</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <ul className="flex flex-col divide-y divide-border">
        {resumo.linhas.map((l) => (
          <li key={l.chave} className="flex gap-4 py-5">
            <div className="relative aspect-[200/310] w-20 shrink-0 overflow-hidden rounded-xl bg-muted/60">
              <Image src={l.imagem} alt={`${l.nome}, cor ${l.cor.toLowerCase()}`} fill sizes="5rem" className="object-contain p-1.5" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{l.marca}</p>
                  <p className="font-medium">{l.nome}</p>
                  <p className="text-sm text-muted-foreground">Tamanho {l.tamanho} · {l.cor}</p>
                </div>
                <button type="button" onClick={() => remover(l.chave)} aria-label={`Remover ${l.nome} do carrinho`} className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
                  <X aria-hidden="true" className="size-4" />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="flex items-center rounded-full border border-border" role="group" aria-label={`Quantidade de ${l.nome}`}>
                  <button type="button" onClick={() => alterarQuantidade(l.chave, l.quantidade - 1)} disabled={l.quantidade <= 1} aria-label="Diminuir quantidade" className="inline-flex size-11 items-center justify-center rounded-full outline-none disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-ring"><Minus aria-hidden="true" className="size-3.5" /></button>
                  <span className="w-6 text-center text-sm tabular-nums" aria-live="polite">{l.quantidade}</span>
                  <button type="button" onClick={() => alterarQuantidade(l.chave, l.quantidade + 1)} disabled={l.quantidade >= 10} aria-label="Aumentar quantidade" className="inline-flex size-11 items-center justify-center rounded-full outline-none disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-ring"><Plus aria-hidden="true" className="size-3.5" /></button>
                </div>
                <p className="text-sm tabular-nums">{formatarPreco(l.subtotalCentavos)}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside aria-label="Resumo do pedido" className="flex h-fit flex-col gap-4 rounded-2xl border border-border p-6">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Subtotal</span>
          <span className="text-lg font-medium tabular-nums">{formatarPreco(resumo.totalCentavos)}</span>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">Valores conferidos pelo servidor. Frete e pagamento são calculados no checkout.</p>
        {houveDescarte && <p className="text-xs text-destructive">Alguns itens não estão mais disponíveis e foram retirados do cálculo.</p>}
        <button type="button" disabled className="inline-flex min-h-12 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background opacity-50">
          Finalizar compra (em breve)
        </button>
      </aside>
    </div>
  );
}
