"use server";

import { getMarcaPorId, getProdutoPorId } from "@/lib/catalogo";
import { carrinhoSchema, itemCarrinhoSchema, type ItemCarrinho } from "@/lib/carrinho-schema";

// Ações do servidor do carrinho. Não exigem login: o carrinho é anônimo e
// não grava nada no banco. O Next valida a origem (Origin/Host) de toda
// Server Action, o que protege contra CSRF.
// TODO-SEGURANÇA: quando existir checkout, aplicar rate limit nele (regra 5).

const ERRO_GENERICO = "Não foi possível adicionar este item. Tente novamente.";

function variacaoValida(item: ItemCarrinho) {
  const produto = getProdutoPorId(item.produtoId);
  if (!produto) return null;
  if (!produto.tamanhos.includes(item.tamanho)) return null;
  if (!produto.cores.some((c) => c.nome === item.cor)) return null;
  return produto;
}

/** Confere no servidor se produto, tamanho e cor existem antes de ir para o carrinho. */
export async function validarItemCarrinho(entrada: unknown): Promise<{ ok: true; item: ItemCarrinho } | { ok: false; erro: string }> {
  const resultado = itemCarrinhoSchema.safeParse(entrada);
  if (!resultado.success) return { ok: false, erro: ERRO_GENERICO };
  if (!variacaoValida(resultado.data)) return { ok: false, erro: ERRO_GENERICO };
  return { ok: true, item: resultado.data };
}

export type LinhaCarrinho = {
  chave: string;
  produtoId: string;
  nome: string;
  marca: string;
  imagem: string;
  tamanho: string;
  cor: string;
  quantidade: number;
  precoUnitarioCentavos: number;
  subtotalCentavos: number;
};

/** Calcula as linhas e o total com os preços do catálogo do servidor. Itens inválidos são descartados. */
export async function calcularCarrinho(entrada: unknown): Promise<{ linhas: LinhaCarrinho[]; totalCentavos: number; descartados: number }> {
  const resultado = carrinhoSchema.safeParse(entrada);
  if (!resultado.success) return { linhas: [], totalCentavos: 0, descartados: Array.isArray(entrada) ? entrada.length : 0 };

  const linhas: LinhaCarrinho[] = [];
  for (const item of resultado.data) {
    const produto = variacaoValida(item);
    if (!produto) continue;
    const marca = getMarcaPorId(produto.marcaId);
    linhas.push({
      chave: `${item.produtoId}|${item.tamanho}|${item.cor}`,
      produtoId: produto.id,
      nome: produto.nome,
      marca: marca?.nome ?? "",
      imagem: produto.imagens.frente,
      tamanho: item.tamanho,
      cor: item.cor,
      quantidade: item.quantidade,
      precoUnitarioCentavos: produto.precoCentavos,
      subtotalCentavos: produto.precoCentavos * item.quantidade,
    });
  }
  const totalCentavos = linhas.reduce((soma, l) => soma + l.subtotalCentavos, 0);
  return { linhas, totalCentavos, descartados: resultado.data.length - linhas.length };
}
