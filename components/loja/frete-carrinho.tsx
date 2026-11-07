"use client";

import * as React from "react";

import type { FreteDoResumo } from "@/app/actions/carrinho";
import { CampoCep } from "@/components/loja/campo-cep";
import { assinarEscolhaFrete, cepSalvo, gravarEscolhaFrete } from "@/components/loja/frete-estado";
import { formatarPreco } from "@/lib/formatar";
import { prazoEmDiasUteis } from "@/lib/frete/formatar";

/** Bloco de frete do carrinho: CEP + opções. O valor vem sempre do resumo calculado no servidor. */
export function FreteCarrinho({ frete, carregando }: { frete: FreteDoResumo | null; carregando: boolean }) {
  const salvo = React.useSyncExternalStore(assinarEscolhaFrete, cepSalvo, () => "");
  const [digitado, setDigitado] = React.useState<string | null>(null);
  const cep = digitado ?? salvo;
  const id = React.useId();

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-4">
      <CampoCep id={`${id}-cep`} valor={cep} aoMudar={setDigitado} aoEnviar={() => gravarEscolhaFrete({ cep })} carregando={carregando} />
      <div aria-live="polite" className="flex flex-col gap-2 text-sm">
        {frete?.erro && <p className="text-destructive">{frete.erro}</p>}
        {frete?.endereco && <p className="text-xs text-muted-foreground">{frete.endereco.cidade}/{frete.endereco.uf}</p>}
        {frete?.aviso && <p className="text-xs text-egeu">{frete.aviso}</p>}
        {frete && frete.opcoes.length > 0 && (
          <fieldset className="flex flex-col gap-1">
            <legend className="sr-only">Opções de frete</legend>
            {frete.opcoes.map((o) => (
              <label key={o.id} className="flex cursor-pointer items-start gap-3 border border-transparent p-2 transition-colors has-[:checked]:border-foreground hover:bg-muted/60">
                <input type="radio" name={`${id}-opcao`} className="mt-1 accent-[var(--egeu)]" checked={frete.escolhida?.id === o.id} onChange={() => gravarEscolhaFrete({ cep: frete.cep, opcaoId: o.id })} />
                <span className="flex flex-1 flex-col">
                  <span>{o.nome}</span>
                  <span className="text-xs text-muted-foreground">{prazoEmDiasUteis(o.prazoMinDias, o.prazoMaxDias)}</span>
                </span>
                <span className="tabular-nums">
                  {o.precoCentavos === 0 ? (
                    <span className="text-egeu">{o.retirada ? "R$ 0,00" : "Grátis"}{o.gratis && !o.retirada && o.precoOriginalCentavos > 0 && <s className="ml-1 text-xs text-muted-foreground">{formatarPreco(o.precoOriginalCentavos)}</s>}</span>
                  ) : formatarPreco(o.precoCentavos)}
                </span>
              </label>
            ))}
          </fieldset>
        )}
      </div>
    </div>
  );
}
