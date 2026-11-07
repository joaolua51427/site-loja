"use client";

// CEP e opção de frete escolhida, compartilhados entre a página do produto e o carrinho.
// Guarda só o CEP e o identificador da opção — nunca o valor do frete.
const CHAVE = "kyano:frete";
export type EscolhaFrete = { cep: string; opcaoId?: string };

export function lerEscolhaFrete(): EscolhaFrete | null {
  try {
    const v = JSON.parse(window.sessionStorage.getItem(CHAVE) ?? "null");
    return v && typeof v.cep === "string" && /^\d{8}$/.test(v.cep) ? { cep: v.cep, opcaoId: typeof v.opcaoId === "string" ? v.opcaoId.slice(0, 40) : undefined } : null;
  } catch {
    return null;
  }
}

export function gravarEscolhaFrete(e: EscolhaFrete | null) {
  try {
    if (e) window.sessionStorage.setItem(CHAVE, JSON.stringify(e));
    else window.sessionStorage.removeItem(CHAVE);
  } catch { /* sem armazenamento */ }
  avisarMudancaFrete();
}

const ouvintes = new Set<() => void>();
export function assinarEscolhaFrete(ouvir: () => void) { ouvintes.add(ouvir); return () => { ouvintes.delete(ouvir); }; }
export function avisarMudancaFrete() { ouvintes.forEach((o) => o()); }
/** CEP salvo como texto estável (para useSyncExternalStore). */
export function cepSalvo() { return lerEscolhaFrete()?.cep ?? ""; }
export function opcaoSalva() { return lerEscolhaFrete()?.opcaoId ?? ""; }
