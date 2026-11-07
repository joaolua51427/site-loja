import "server-only";

import { z } from "zod";

export const cepSchema = z.string().transform((v) => v.replace(/\D/g, "")).pipe(z.string().regex(/^\d{8}$/, "CEP inválido"));

export type Endereco = { cep: string; logradouro: string; bairro: string; cidade: string; uf: string };

const respostaViaCep = z.object({
  cep: z.string().optional(), logradouro: z.string().optional(), bairro: z.string().optional(),
  localidade: z.string().optional(), uf: z.string().optional(), erro: z.union([z.boolean(), z.string()]).optional(),
});

/** Busca o endereço pelo ViaCEP (serviço público e gratuito). null = CEP não existe ou serviço fora do ar. */
export async function buscarEndereco(cep: string): Promise<Endereco | null> {
  try {
    const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal: AbortSignal.timeout(4000), cache: "no-store" });
    if (!r.ok) return null;
    const d = respostaViaCep.parse(await r.json());
    if (d.erro || !d.uf || !d.localidade) return null;
    return { cep, logradouro: d.logradouro ?? "", bairro: d.bairro ?? "", cidade: d.localidade, uf: d.uf.toUpperCase() };
  } catch {
    return null;
  }
}
