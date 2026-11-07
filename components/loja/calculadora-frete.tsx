"use client";

import * as React from "react";
import { Truck } from "lucide-react";

import { calcularFreteProduto } from "@/app/actions/frete";
import { CampoCep } from "@/components/loja/campo-cep";
import { assinarEscolhaFrete, cepSalvo, gravarEscolhaFrete } from "@/components/loja/frete-estado";
import type { ResultadoFrete } from "@/lib/frete/cotacao";
import { formatarPreco } from "@/lib/formatar";
import { prazoEmDiasUteis } from "@/lib/frete/formatar";

export function CalculadoraFrete({ produtoId, freteGratisAcimaCentavos }: { produtoId: string; freteGratisAcimaCentavos: number | null }) {
  const salvo = React.useSyncExternalStore(assinarEscolhaFrete, cepSalvo, () => "");
  const [digitado, setCep] = React.useState<string | null>(null);
  const cep = digitado ?? salvo;
  const [resultado, setResultado] = React.useState<ResultadoFrete | null>(null);
  const [carregando, setCarregando] = React.useState(false);
  const id = React.useId();

  async function calcular() {
    setCarregando(true);
    try {
      const r = await calcularFreteProduto({ cep, produtoId });
      setResultado(r);
      if (r.ok) gravarEscolhaFrete({ cep });
    } catch {
      setResultado({ ok: false, erro: "Não conseguimos calcular o frete agora." });
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 border border-border p-5">
      <p className="flex items-center gap-2 text-sm font-medium"><Truck aria-hidden="true" className="size-4 text-egeu" strokeWidth={1.5} /> Calcular frete e prazo</p>
      <CampoCep id={`${id}-cep`} valor={cep} aoMudar={setCep} aoEnviar={calcular} carregando={carregando} />
      <div aria-live="polite" className="flex flex-col gap-2 text-sm">
        {resultado && !resultado.ok && <p className="text-destructive">{resultado.erro}</p>}
        {resultado?.ok && (
          <>
            <p className="text-muted-foreground">{resultado.endereco.logradouro && `${resultado.endereco.logradouro}, `}{resultado.endereco.cidade}/{resultado.endereco.uf}</p>
            {resultado.aviso && <p className="text-xs text-egeu">{resultado.aviso}</p>}
            <ul className="flex flex-col divide-y divide-border border-y border-border">
              {resultado.opcoes.map((o) => (
                <li key={o.id} className="flex items-baseline justify-between gap-4 py-2.5">
                  <span>{o.nome}<span className="block text-xs text-muted-foreground">{prazoEmDiasUteis(o.prazoMinDias, o.prazoMaxDias)}</span></span>
                  <span className="tabular-nums">{o.precoCentavos === 0 ? <span className="text-egeu">Grátis</span> : formatarPreco(o.precoCentavos)}</span>
                </li>
              ))}
            </ul>
          </>
        )}
        {freteGratisAcimaCentavos !== null && <p className="text-xs text-muted-foreground">Frete grátis em compras acima de {formatarPreco(freteGratisAcimaCentavos)}.</p>}
      </div>
    </div>
  );
}
