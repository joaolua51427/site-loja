import { z } from "zod";

// Formato dos dados do catálogo. Os mesmos campos existem nas tabelas
// `marcas` e `produtos` do banco (supabase/migrations).

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug inválido").max(80);
const caminhoImagem = z.string().regex(/^\/produtos\/[a-z0-9-]+\.(png|webp|jpg)$/, "caminho de imagem inválido");

export const marcaSchema = z.object({
  id: z.uuid(),
  nome: z.string().min(1).max(60),
  slug,
  descricao: z.string().max(200),
  logo: caminhoImagem.nullable(),
  estilo: z.enum(["serifa", "caixa-alta", "italico"]),
});

export const corSchema = z.object({
  nome: z.string().min(1).max(40),
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

export const produtoSchema = z.object({
  id: z.uuid(),
  slug,
  marcaId: z.uuid(),
  nome: z.string().min(1).max(80),
  categoria: z.enum(["roupa", "calcado"]),
  tipo: z.enum(["camiseta", "malha", "moletom", "jaqueta", "casaco", "tenis", "bota"]),
  precoCentavos: z.number().int().positive(),
  tamanhos: z.array(z.string().min(1).max(8)).min(1),
  cores: z.array(corSchema).min(1),
  descricao: z.string().max(240),
  detalhes: z.array(z.string().max(60)).max(6).default([]),
  imagens: z.object({ frente: caminhoImagem, costas: caminhoImagem.optional(), lado: caminhoImagem.optional() }),
});

export type Marca = z.infer<typeof marcaSchema>;
export type Produto = z.infer<typeof produtoSchema>;
export type Cor = z.infer<typeof corSchema>;
