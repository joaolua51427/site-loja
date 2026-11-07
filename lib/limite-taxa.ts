import "server-only";

import { createHash } from "node:crypto";
import { headers } from "next/headers";

// Limite de tentativas por visitante (CLAUDE.md §5).
// O IP nunca é guardado puro: vira um hash (LGPD).
// TODO-SEGURANÇA: este contador fica na memória de cada instância do servidor. Na Vercel há
// várias instâncias, então antes de publicar trocar por um armazenamento compartilhado
// (ex.: Upstash Redis) ou criar a regra equivalente no Vercel Firewall (Rate Limiting).

type Janela = { contagem: number; expiraEm: number };
const janelas = new Map<string, Janela>();

async function idVisitante() {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "desconhecido";
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

/** true = pode seguir; false = passou do limite nesta janela. */
export async function dentroDoLimite(rota: string, limite: number, janelaSegundos: number) {
  const agora = Date.now();
  if (janelas.size > 5000) for (const [k, j] of janelas) if (j.expiraEm < agora) janelas.delete(k);
  const chave = `${rota}:${await idVisitante()}`;
  const j = janelas.get(chave);
  if (!j || j.expiraEm < agora) {
    janelas.set(chave, { contagem: 1, expiraEm: agora + janelaSegundos * 1000 });
    return true;
  }
  j.contagem += 1;
  return j.contagem <= limite;
}
