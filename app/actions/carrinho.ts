"use server";

import { z } from "zod";

import { carrinhoSchema, type ItemCarrinho } from "@/lib/carrinho-schema";
import { supabasePublico } from "@/lib/supabase/publico";
import { usuarioAtual } from "@/lib/supabase/servidor";

// Ações do carrinho. Regras (CLAUDE.md §4 e §6):
// - Entrada validada com Zod; preço e estoque SEMPRE lidos do banco, nunca do navegador.
// - Erros genéricos para o cliente; nada de detalhes técnicos.
// - Carrinho do usuário logado: só via RLS (o próprio usuário) e função atômica no banco.
// O Next valida a origem de toda Server Action (proteção contra CSRF).

const ERRO = "Não foi possível atualizar o carrinho agora. Tente novamente.";
const MAX_POR_ITEM = 10;

export type StatusLinha = "ok" | "reduzido" | "esgotado" | "indisponivel";

export type LinhaCarrinho = {
  variacaoId: string;
  produtoId: string | null;
  nome: string;
  marca: string;
  href: string | null;
  imagem: string | null;
  tamanho: string;
  cor: string;
  quantidade: number; // quantidade que vale (já limitada pelo estoque)
  quantidadePedida: number;
  maximo: number; // limite por item conforme o estoque
  precoUnitarioCentavos: number;
  subtotalCentavos: number;
  status: StatusLinha;
};

export type ResumoCarrinho = {
  linhas: LinhaCarrinho[];
  subtotalCentavos: number;
  freteCentavos: number | null; // calculado na etapa do CEP
  totalCentavos: number;
  /** Carrinho corrigido pelo servidor (quantidades limitadas, itens inexistentes removidos). */
  itensCorrigidos: ItemCarrinho[];
};

type LinhaBanco = {
  id: string; tamanho: string; cor: string; estoque: number;
  produto: { id: string; slug: string; nome: string; preco_centavos: number; imagem_frente: string; marca: { nome: string; slug: string } | null } | null;
};

/** Lê as variações no banco (sem cache), com produto e marca. RLS esconde o que estiver inativo. */
async function buscarVariacoes(ids: string[]) {
  if (ids.length === 0) return new Map<string, LinhaBanco>();
  const { data, error } = await supabasePublico()
    .from("variacoes")
    .select("id, tamanho, cor, estoque, produto:produtos(id, slug, nome, preco_centavos, imagem_frente, marca:marcas(nome, slug))")
    .in("id", ids);
  if (error) throw new Error("falha_banco");
  return new Map((data as unknown as LinhaBanco[]).map((v) => [v.id, v]));
}

/** Recalcula o carrinho com preços e estoque atuais do banco. */
export async function resumoDoCarrinho(entrada: unknown): Promise<{ ok: true; resumo: ResumoCarrinho } | { ok: false; erro: string }> {
  const r = carrinhoSchema.safeParse(entrada);
  if (!r.success) return { ok: false, erro: ERRO };
  try {
    const mapa = await buscarVariacoes([...new Set(r.data.map((i) => i.variacaoId))]);
    const linhas: LinhaCarrinho[] = r.data.map((item) => {
      const v = mapa.get(item.variacaoId);
      if (!v || !v.produto) {
        return { variacaoId: item.variacaoId, produtoId: null, nome: "Peça indisponível", marca: "", href: null, imagem: null, tamanho: "", cor: "", quantidade: 0, quantidadePedida: item.quantidade, maximo: 0, precoUnitarioCentavos: 0, subtotalCentavos: 0, status: "indisponivel" as const };
      }
      const maximo = Math.min(MAX_POR_ITEM, v.estoque);
      const quantidade = Math.min(item.quantidade, maximo);
      const status: StatusLinha = maximo === 0 ? "esgotado" : quantidade < item.quantidade ? "reduzido" : "ok";
      const p = v.produto;
      return {
        variacaoId: v.id, produtoId: p.id, nome: p.nome, marca: p.marca?.nome ?? "",
        href: p.marca ? `/marcas/${p.marca.slug}/${p.slug}` : null, imagem: p.imagem_frente,
        tamanho: v.tamanho, cor: v.cor, quantidade, quantidadePedida: item.quantidade, maximo,
        precoUnitarioCentavos: p.preco_centavos, subtotalCentavos: p.preco_centavos * quantidade, status,
      };
    });
    const subtotalCentavos = linhas.reduce((s, l) => s + l.subtotalCentavos, 0);
    const itensCorrigidos = linhas
      .filter((l) => l.status !== "indisponivel")
      .map((l) => ({ variacaoId: l.variacaoId, quantidade: l.status === "esgotado" ? l.quantidadePedida : l.quantidade }));
    return { ok: true, resumo: { linhas, subtotalCentavos, freteCentavos: null, totalCentavos: subtotalCentavos, itensCorrigidos } };
  } catch {
    return { ok: false, erro: ERRO };
  }
}

/** Antes de adicionar (visitante ou logado): a variação existe e tem estoque? Devolve o limite. */
export async function consultarDisponibilidade(entrada: unknown): Promise<{ ok: true; maximo: number } | { ok: false; erro: string }> {
  const r = z.object({ variacaoId: z.uuid() }).safeParse(entrada);
  if (!r.success) return { ok: false, erro: ERRO };
  try {
    const v = (await buscarVariacoes([r.data.variacaoId])).get(r.data.variacaoId);
    if (!v || !v.produto) return { ok: false, erro: "Esta peça não está mais disponível." };
    const maximo = Math.min(MAX_POR_ITEM, v.estoque);
    if (maximo === 0) return { ok: false, erro: "Este tamanho esgotou." };
    return { ok: true, maximo };
  } catch {
    return { ok: false, erro: ERRO };
  }
}

// ----------------------------- Usuário logado -----------------------------

async function lerCarrinhoDoUsuario(): Promise<ItemCarrinho[] | null> {
  const { supabase, usuario } = await usuarioAtual();
  if (!usuario) return null;
  // A RLS garante que só voltam itens do carrinho deste usuário.
  const { data, error } = await supabase.from("itens_carrinho").select("variacao_id, quantidade, criado_em").order("criado_em");
  if (error) throw new Error("falha_banco");
  return (data ?? []).map((i) => ({ variacaoId: i.variacao_id, quantidade: i.quantidade }));
}

export async function carrinhoDoUsuario(): Promise<{ ok: true; itens: ItemCarrinho[] } | { ok: false; erro: string }> {
  try {
    const itens = await lerCarrinhoDoUsuario();
    if (!itens) return { ok: false, erro: "Faça login para ver o seu carrinho salvo." };
    return { ok: true, itens };
  } catch {
    return { ok: false, erro: ERRO };
  }
}

const definirSchema = z.object({ variacaoId: z.uuid(), quantidade: z.number().int().min(0).max(MAX_POR_ITEM), somar: z.boolean() });

/** Define (ou soma) a quantidade de um item no carrinho do usuário. 0 remove. Limitado pelo estoque no banco. */
export async function definirItemDoUsuario(entrada: unknown): Promise<{ ok: true; quantidade: number; itens: ItemCarrinho[] } | { ok: false; erro: string }> {
  const r = definirSchema.safeParse(entrada);
  if (!r.success) return { ok: false, erro: ERRO };
  try {
    const { supabase, usuario } = await usuarioAtual();
    if (!usuario) return { ok: false, erro: "Sua sessão expirou. Entre novamente." };
    const { data, error } = await supabase.rpc("definir_item_carrinho", { p_variacao_id: r.data.variacaoId, p_quantidade: r.data.quantidade, p_somar: r.data.somar });
    if (error) return { ok: false, erro: ERRO };
    return { ok: true, quantidade: Number(data ?? 0), itens: (await lerCarrinhoDoUsuario()) ?? [] };
  } catch {
    return { ok: false, erro: ERRO };
  }
}

/** Ao entrar: soma o carrinho do navegador ao salvo na conta (sempre limitado pelo estoque). */
export async function mesclarCarrinho(entrada: unknown): Promise<{ ok: true; itens: ItemCarrinho[] } | { ok: false; erro: string }> {
  const r = carrinhoSchema.safeParse(entrada);
  if (!r.success) return { ok: false, erro: ERRO };
  try {
    const { supabase, usuario } = await usuarioAtual();
    if (!usuario) return { ok: false, erro: "Sua sessão expirou. Entre novamente." };
    for (const item of r.data) {
      // Itens que não existem mais são ignorados; os demais somam até o limite do estoque.
      await supabase.rpc("definir_item_carrinho", { p_variacao_id: item.variacaoId, p_quantidade: item.quantidade, p_somar: true });
    }
    return { ok: true, itens: (await lerCarrinhoDoUsuario()) ?? [] };
  } catch {
    return { ok: false, erro: ERRO };
  }
}
