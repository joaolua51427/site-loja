import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { z } from "zod";

import lojaJson from "@/data/loja.json";
import { marcaSchema, produtoSchema, type Marca, type Produto } from "@/lib/catalogo-schema";
import { supabasePublico } from "@/lib/supabase/publico";

// Catálogo lido do banco (Supabase, papel anon + RLS). Os preços exibidos vêm
// daqui; o carrinho e o checkout sempre consultam o banco de novo, sem cache.
// "server-only" impede que este arquivo vá para o navegador.

const loja = z.object({ nome: z.string().min(1), slogan: z.string() }).parse(lojaJson);
export function getLoja() {
  return loja;
}

export type Variacao = { id: string; produtoId: string; tamanho: string; cor: string; estoque: number };
export type Catalogo = { marcas: Marca[]; produtos: Produto[] };

const linhaMarca = z.object({ id: z.string(), nome: z.string(), slug: z.string(), descricao: z.string().nullable(), logo: z.string().nullable(), estilo: z.string() });
const linhaProduto = z.object({
  id: z.string(), slug: z.string(), marca_id: z.string(), nome: z.string(), categoria: z.string(), tipo: z.string(),
  preco_centavos: z.number(), tamanhos: z.array(z.string()), cores: z.array(z.object({ nome: z.string(), hex: z.string() })),
  descricao: z.string().nullable(), detalhes: z.array(z.string()), imagem_frente: z.string(), imagem_costas: z.string().nullable(), imagem_lado: z.string().nullable(),
});

/** Busca marcas e produtos ativos. Cache curto (minutos) com a etiqueta "catalogo". */
export async function getCatalogo(): Promise<Catalogo> {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalogo");

  const sb = supabasePublico();
  const [m, p] = await Promise.all([
    sb.from("marcas").select("id, nome, slug, descricao, logo, estilo").order("criado_em"),
    sb.from("produtos").select("id, slug, marca_id, nome, categoria, tipo, preco_centavos, tamanhos, cores, descricao, detalhes, imagem_frente, imagem_costas, imagem_lado").order("criado_em"),
  ]);
  if (m.error || p.error) throw new Error("Falha ao carregar o catálogo."); // detalhes ficam nos logs do Supabase

  const marcas = z.array(linhaMarca).parse(m.data).map((r) =>
    marcaSchema.parse({ id: r.id, nome: r.nome, slug: r.slug, descricao: r.descricao ?? "", logo: r.logo, estilo: r.estilo }),
  );
  const produtos = z.array(linhaProduto).parse(p.data).map((r) =>
    produtoSchema.parse({
      id: r.id, slug: r.slug, marcaId: r.marca_id, nome: r.nome, categoria: r.categoria, tipo: r.tipo, precoCentavos: r.preco_centavos,
      tamanhos: r.tamanhos, cores: r.cores, descricao: r.descricao ?? "", detalhes: r.detalhes,
      imagens: { frente: r.imagem_frente, costas: r.imagem_costas ?? undefined, lado: r.imagem_lado ?? undefined },
    }),
  );
  return { marcas, produtos };
}

/** Variações (tamanho/cor) com estoque, para mostrar tamanhos esgotados. Cache curto. */
export async function getVariacoesDoProduto(produtoId: string): Promise<Variacao[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("estoque");
  const { data, error } = await supabasePublico().from("variacoes").select("id, produto_id, tamanho, cor, estoque").eq("produto_id", produtoId);
  if (error) throw new Error("Falha ao carregar as variações.");
  return (data ?? []).map((v) => ({ id: v.id, produtoId: v.produto_id, tamanho: v.tamanho, cor: v.cor, estoque: v.estoque }));
}

/** Consultas síncronas sobre um catálogo já carregado (mesmos nomes de antes). */
export function consultas({ marcas, produtos }: Catalogo) {
  return {
    getMarcas: () => marcas,
    getMarca: (slug: string) => marcas.find((m) => m.slug === slug),
    getMarcaPorId: (id: string) => marcas.find((m) => m.id === id),
    getTodosProdutos: () => produtos,
    getProdutosDaMarca: (marcaId: string) => produtos.filter((p) => p.marcaId === marcaId),
    getProdutoPorId: (id: string) => produtos.find((p) => p.id === id),
    getProduto: (marcaSlug: string, produtoSlug: string) => {
      const marca = marcas.find((m) => m.slug === marcaSlug);
      const produto = marca && produtos.find((p) => p.marcaId === marca.id && p.slug === produtoSlug);
      return marca && produto ? { marca, produto } : undefined;
    },
  };
}

/** Atalho: carrega o catálogo e devolve as consultas. */
export async function catalogo() {
  return consultas(await getCatalogo());
}
