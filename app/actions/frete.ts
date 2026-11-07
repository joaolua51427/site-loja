"use server";

import { z } from "zod";

import { buscarEndereco, cepSchema, type Endereco } from "@/lib/frete/cep";
import { cotarFrete, type ResultadoFrete } from "@/lib/frete/cotacao";
import { dentroDoLimite } from "@/lib/limite-taxa";
import { supabasePublico } from "@/lib/supabase/publico";

// CEP e frete. Rate limit em ambos (CLAUDE.md §5). Erros genéricos.
const MUITAS = "Muitas consultas seguidas. Aguarde um minuto e tente de novo.";

export async function consultarCep(entrada: unknown): Promise<{ ok: true; endereco: Endereco } | { ok: false; erro: string }> {
  const r = cepSchema.safeParse(entrada);
  if (!r.success) return { ok: false, erro: "Digite um CEP com 8 números." };
  if (!(await dentroDoLimite("cep", 20, 60))) return { ok: false, erro: MUITAS };
  const endereco = await buscarEndereco(r.data);
  return endereco ? { ok: true, endereco } : { ok: false, erro: "Não encontramos esse CEP. Confira os números." };
}

/** Calculadora da página do produto: 1 unidade daquela peça. */
export async function calcularFreteProduto(entrada: unknown): Promise<ResultadoFrete> {
  const r = z.object({ cep: cepSchema, produtoId: z.uuid() }).safeParse(entrada);
  if (!r.success) return { ok: false, erro: "Digite um CEP com 8 números." };
  if (!(await dentroDoLimite("frete", 20, 60))) return { ok: false, erro: MUITAS };
  const { data: p } = await supabasePublico().from("produtos").select("id, preco_centavos, peso_gramas, altura_cm, largura_cm, comprimento_cm").eq("id", r.data.produtoId).maybeSingle();
  if (!p) return { ok: false, erro: "Produto indisponível." };
  try {
    return await cotarFrete(r.data.cep, [{ produtoId: p.id, quantidade: 1, pesoGramas: p.peso_gramas, alturaCm: p.altura_cm, larguraCm: p.largura_cm, comprimentoCm: p.comprimento_cm, valorCentavos: p.preco_centavos }], p.preco_centavos);
  } catch {
    return { ok: false, erro: "Não conseguimos calcular o frete agora. Tente novamente em instantes." };
  }
}
