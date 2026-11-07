"use client";

import * as React from "react";

import { carrinhoSchema, type ItemCarrinho } from "@/lib/carrinho-schema";

// Guarda no navegador só o que o servidor precisa para calcular o carrinho:
// produto, tamanho, cor e quantidade. Nenhum preço fica salvo aqui.
const CHAVE = "varal:carrinho:v1";

type CarrinhoContexto = {
  itens: ItemCarrinho[];
  pronto: boolean;
  totalItens: number;
  adicionar: (item: ItemCarrinho) => void;
  alterarQuantidade: (chave: string, quantidade: number) => void;
  remover: (chave: string) => void;
};

const Contexto = React.createContext<CarrinhoContexto | null>(null);

export function chaveItem(item: Pick<ItemCarrinho, "produtoId" | "tamanho" | "cor">) {
  return `${item.produtoId}|${item.tamanho}|${item.cor}`;
}

const VAZIO: ItemCarrinho[] = [];
let cache: ItemCarrinho[] | null = null;
const ouvintes = new Set<() => void>();

function ler(): ItemCarrinho[] {
  if (cache) return cache;
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    const resultado = carrinhoSchema.safeParse(bruto ? JSON.parse(bruto) : []);
    cache = resultado.success ? resultado.data : VAZIO;
  } catch {
    cache = VAZIO;
  }
  return cache;
}

function gravar(itens: ItemCarrinho[]) {
  cache = itens;
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(itens));
  } catch {
    // Armazenamento bloqueado (aba anônima etc.): o carrinho vale só nesta visita.
  }
  ouvintes.forEach((ouvir) => ouvir());
}

function assinar(ouvir: () => void) {
  ouvintes.add(ouvir);
  // Mantém abas abertas ao mesmo tempo em sincronia.
  const aoMudarOutraAba = (e: StorageEvent) => { if (e.key === CHAVE) { cache = null; ouvir(); } };
  window.addEventListener("storage", aoMudarOutraAba);
  return () => { ouvintes.delete(ouvir); window.removeEventListener("storage", aoMudarOutraAba); };
}

const assinarNada = () => () => {};

export function CarrinhoProvider({ children }: { children: React.ReactNode }) {
  const itens = React.useSyncExternalStore(assinar, ler, () => VAZIO);
  const pronto = React.useSyncExternalStore(assinarNada, () => true, () => false);

  const valor = React.useMemo<CarrinhoContexto>(() => {
    const atualizar = (fn: (atual: ItemCarrinho[]) => ItemCarrinho[]) => gravar(fn(ler()));
    return {
      itens,
      pronto,
      totalItens: itens.reduce((soma, i) => soma + i.quantidade, 0),
      adicionar: (item) => atualizar((atual) => {
        const existente = atual.find((i) => chaveItem(i) === chaveItem(item));
        if (existente) return atual.map((i) => (i === existente ? { ...i, quantidade: Math.min(10, i.quantidade + item.quantidade) } : i));
        return [...atual, item].slice(0, 30);
      }),
      alterarQuantidade: (chave, quantidade) => atualizar((atual) => atual.map((i) => (chaveItem(i) === chave ? { ...i, quantidade: Math.max(1, Math.min(10, quantidade)) } : i))),
      remover: (chave) => atualizar((atual) => atual.filter((i) => chaveItem(i) !== chave)),
    };
  }, [itens, pronto]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useCarrinho() {
  const ctx = React.useContext(Contexto);
  if (!ctx) throw new Error("useCarrinho precisa estar dentro de <CarrinhoProvider>.");
  return ctx;
}
