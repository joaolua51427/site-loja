import "server-only";

import { z } from "zod";

import lojaJson from "@/data/loja.json";
import marcasJson from "@/data/marcas.json";
import produtosJson from "@/data/produtos.json";
import { marcaSchema, produtoSchema, type Marca, type Produto } from "@/lib/catalogo-schema";

// Fonte única do catálogo, usada só no servidor ("server-only" quebra o build
// se algum componente do navegador tentar importar este arquivo).
// Hoje os dados vêm de data/*.json. Para usar o banco, troque o corpo destas
// funções por consultas ao Supabase (com a chave anon + RLS); as páginas não mudam.

const loja = z.object({ nome: z.string().min(1), slogan: z.string() }).parse(lojaJson);
const marcas = z.array(marcaSchema).parse(marcasJson);
const produtos = z.array(produtoSchema).parse(produtosJson);

for (const p of produtos) {
  if (!marcas.some((m) => m.id === p.marcaId)) throw new Error(`Produto ${p.slug} aponta para uma marca inexistente.`);
}

export function getLoja() {
  return loja;
}

export function getMarcas(): Marca[] {
  return marcas;
}

export function getMarca(slug: string): Marca | undefined {
  return marcas.find((m) => m.slug === slug);
}

export function getProdutosDaMarca(marcaId: string): Produto[] {
  return produtos.filter((p) => p.marcaId === marcaId);
}

export function getProduto(marcaSlug: string, produtoSlug: string): { marca: Marca; produto: Produto } | undefined {
  const marca = getMarca(marcaSlug);
  if (!marca) return undefined;
  const produto = produtos.find((p) => p.marcaId === marca.id && p.slug === produtoSlug);
  return produto ? { marca, produto } : undefined;
}

export function getProdutoPorId(id: string): Produto | undefined {
  return produtos.find((p) => p.id === id);
}

export function getMarcaPorId(id: string): Marca | undefined {
  return marcas.find((m) => m.id === id);
}
