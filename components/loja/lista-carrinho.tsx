"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, Minus, Plus, X } from "lucide-react";

import { resumoDoCarrinho, type ResumoCarrinho } from "@/app/actions/carrinho";
import { useCarrinho } from "@/components/loja/carrinho-provider";
import { formatarPreco } from "@/lib/formatar";

// Últimos preços vistos, só para avisar "o preço mudou". Fica na aba (sessionStorage),
// separado do carrinho, e NUNCA é enviado ao servidor nem usado para calcular nada.
const CHAVE_PRECOS = "kyano:precos-vistos";

function lerPrecosVistos(): Record<string, number> {
  try { return JSON.parse(window.sessionStorage.getItem(CHAVE_PRECOS) ?? "{}"); } catch { return {}; }
}
function gravarPrecosVistos(p: Record<string, number>) {
  try { window.sessionStorage.setItem(CHAVE_PRECOS, JSON.stringify(p)); } catch { /* sem armazenamento */ }
}

export function ListaCarrinho() {
  const { itens, pronto, alterarQuantidade, remover, aplicarCorrecoes, usuario } = useCarrinho();
  const [resumo, setResumo] = React.useState<ResumoCarrinho | null>(null);
  const [erro, setErro] = React.useState(false);
  const [avisos, setAvisos] = React.useState<string[]>([]);
  const [ocupado, setOcupado] = React.useState<string | null>(null);

  // Sempre que o carrinho muda, o servidor recalcula preço e estoque.
  React.useEffect(() => {
    if (!pronto) return;
    let ativo = true;
    resumoDoCarrinho(itens)
      .then(async (r) => {
        if (!ativo) return;
        if (!r.ok) { setErro(true); return; }
        setErro(false);
        setResumo(r.resumo);

        const novos: string[] = [];
        const vistos = lerPrecosVistos();
        for (const l of r.resumo.linhas) {
          if (l.status === "indisponivel") novos.push("Uma peça do seu carrinho não está mais disponível e foi removida.");
          if (l.status === "reduzido") novos.push(`${l.nome} (${l.tamanho}): só temos ${l.maximo} em estoque. Ajustamos a quantidade.`);
          if (l.status === "esgotado") novos.push(`${l.nome} (${l.tamanho}, ${l.cor}) esgotou. Remova-o para continuar.`);
          const antes = vistos[l.variacaoId];
          if (antes && antes !== l.precoUnitarioCentavos && l.status !== "indisponivel") {
            novos.push(`O preço de ${l.nome} mudou de ${formatarPreco(antes)} para ${formatarPreco(l.precoUnitarioCentavos)}.`);
          }
          if (l.status !== "indisponivel") vistos[l.variacaoId] = l.precoUnitarioCentavos;
        }
        gravarPrecosVistos(vistos);
        if (novos.length) setAvisos((a) => [...new Set([...a, ...novos])]);
        await aplicarCorrecoes(r.resumo.itensCorrigidos);
      })
      .catch(() => { if (ativo) setErro(true); });
    return () => { ativo = false; };
  }, [itens, pronto, aplicarCorrecoes]);

  async function acao(variacaoId: string, fn: () => Promise<void>) {
    setOcupado(variacaoId);
    try { await fn(); } finally { setOcupado(null); }
  }

  if (!pronto || (!resumo && !erro)) return <p className="text-sm text-muted-foreground">Carregando carrinho…</p>;
  if (erro) return <p className="text-sm text-destructive">Não foi possível carregar o carrinho agora. Atualize a página e tente de novo.</p>;
  if (!resumo || resumo.linhas.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 border border-dashed border-border p-8">
        <p className="text-base">Seu carrinho está vazio.</p>
        {!usuario && <p className="text-sm text-muted-foreground">Tem uma conta? <Link href="/entrar?voltar=/carrinho" className="underline underline-offset-4">Entre</Link> para ver o carrinho salvo.</p>}
        <Link href="/marcas" className="rotulo botao-varredura inline-flex min-h-11 items-center bg-foreground px-6 text-background outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">Ver coleções</Link>
      </div>
    );
  }

  const temEsgotado = resumo.linhas.some((l) => l.status === "esgotado");

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="flex flex-col gap-6">
        {avisos.length > 0 && (
          <div role="status" className="flex flex-col gap-2 border border-egeu/30 bg-accent/60 p-4 text-sm">
            {avisos.map((a) => (
              <p key={a} className="flex items-start gap-2"><AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-egeu" />{a}</p>
            ))}
            <button type="button" onClick={() => setAvisos([])} className="rotulo self-start pt-1 text-muted-foreground hover:text-foreground">Entendi</button>
          </div>
        )}
        <ul className="flex flex-col divide-y divide-border">
          {resumo.linhas.filter((l) => l.status !== "indisponivel").map((l) => {
            const esgotado = l.status === "esgotado";
            return (
              <li key={l.variacaoId} className={`flex gap-4 py-5 ${esgotado ? "opacity-60" : ""} ${ocupado === l.variacaoId ? "animate-pulse" : ""}`}>
                <div className="relative aspect-[200/310] w-20 shrink-0 overflow-hidden bg-muted/60">
                  {l.imagem && <Image src={l.imagem} alt={`${l.nome}, cor ${l.cor.toLowerCase()}`} fill sizes="5rem" className="object-contain p-1.5" />}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="rotulo text-muted-foreground">{l.marca}</p>
                      {l.href ? <Link href={l.href} className="font-medium hover:underline">{l.nome}</Link> : <p className="font-medium">{l.nome}</p>}
                      <p className="text-sm text-muted-foreground">Tamanho {l.tamanho} · {l.cor}</p>
                      {esgotado && <p className="rotulo mt-1 text-destructive">Esgotado</p>}
                      {!esgotado && l.maximo <= 3 && <p className="mt-1 text-xs text-egeu">{l.maximo === 1 ? "Última unidade" : `Últimas ${l.maximo} unidades`}</p>}
                    </div>
                    <button type="button" onClick={() => acao(l.variacaoId, () => remover(l.variacaoId))} aria-label={`Remover ${l.nome} do carrinho`} className="inline-flex size-11 shrink-0 items-center justify-center text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
                      <X aria-hidden="true" className="size-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    {!esgotado ? (
                      <div className="flex items-center border border-border" role="group" aria-label={`Quantidade de ${l.nome}`}>
                        <button type="button" onClick={() => acao(l.variacaoId, () => alterarQuantidade(l.variacaoId, l.quantidade - 1))} disabled={l.quantidade <= 1 || ocupado !== null} aria-label="Diminuir quantidade" className="inline-flex size-11 items-center justify-center outline-none disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-ring"><Minus aria-hidden="true" className="size-3.5" /></button>
                        <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">{l.quantidade}</span>
                        <button type="button" onClick={() => acao(l.variacaoId, () => alterarQuantidade(l.variacaoId, l.quantidade + 1))} disabled={l.quantidade >= l.maximo || ocupado !== null} aria-label={l.quantidade >= l.maximo ? "Quantidade máxima em estoque" : "Aumentar quantidade"} className="inline-flex size-11 items-center justify-center outline-none disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-ring"><Plus aria-hidden="true" className="size-3.5" /></button>
                      </div>
                    ) : <span />}
                    <p className="text-sm tabular-nums">{esgotado ? "—" : formatarPreco(l.subtotalCentavos)}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <aside aria-label="Resumo do pedido" className="flex h-fit flex-col gap-4 border border-border p-6 lg:sticky lg:top-28">
        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex items-baseline justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="tabular-nums">{formatarPreco(resumo.subtotalCentavos)}</dd></div>
          <div className="flex items-baseline justify-between"><dt className="text-muted-foreground">Frete</dt><dd className="text-right text-muted-foreground">{resumo.freteCentavos === null ? "Informe o CEP no checkout" : formatarPreco(resumo.freteCentavos)}</dd></div>
          <div className="flex items-baseline justify-between border-t border-border pt-3"><dt className="font-medium">Total</dt><dd className="text-lg font-medium tabular-nums">{formatarPreco(resumo.totalCentavos)}</dd></div>
        </dl>
        <p className="text-xs leading-relaxed text-muted-foreground">Preços e estoque conferidos agora pelo servidor.{!usuario && " Entre na sua conta para salvar o carrinho."}</p>
        <button type="button" disabled className="rotulo inline-flex min-h-12 items-center justify-center bg-foreground px-6 text-background opacity-50" title={temEsgotado ? "Remova os itens esgotados" : "Disponível na próxima etapa"}>
          Finalizar compra (em breve)
        </button>
      </aside>
    </div>
  );
}
