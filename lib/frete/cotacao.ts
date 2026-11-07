import "server-only";

import { z } from "zod";

import { buscarEndereco, type Endereco } from "@/lib/frete/cep";
import { supabasePublico } from "@/lib/supabase/publico";

// Cálculo de frete 100% no servidor (CLAUDE.md §5). O navegador só envia CEP e a opção escolhida.

export type PacoteFrete = { produtoId: string; quantidade: number; pesoGramas: number; alturaCm: number; larguraCm: number; comprimentoCm: number; valorCentavos: number };
export type OpcaoFrete = { id: string; nome: string; precoCentavos: number; precoOriginalCentavos: number; prazoMinDias: number; prazoMaxDias: number; gratis: boolean; retirada: boolean };
export type Configuracoes = { freteGratisAcimaCentavos: number | null; retiradaAtiva: boolean; retiradaEndereco: string | null; cepOrigem: string; parcelasMax: number; parcelasSemJuros: number; descontoPixPercent: number; prazoReservaMinutos: number };
export type ResultadoFrete =
  | { ok: true; endereco: Endereco; opcoes: OpcaoFrete[]; aviso: string | null }
  | { ok: false; erro: string };

const URL_MELHOR_ENVIO = process.env.MELHOR_ENVIO_URL ?? "https://sandbox.melhorenvio.com.br";

export async function lerConfiguracoes(): Promise<Configuracoes> {
  const { data, error } = await supabasePublico().from("configuracoes").select("*").single();
  if (error || !data) throw new Error("falha_config");
  return {
    freteGratisAcimaCentavos: data.frete_gratis_acima_centavos, retiradaAtiva: data.retirada_loja_ativa, retiradaEndereco: data.retirada_loja_endereco,
    cepOrigem: data.cep_origem, parcelasMax: data.parcelas_max, parcelasSemJuros: data.parcelas_sem_juros, descontoPixPercent: data.desconto_pix_percent,
    prazoReservaMinutos: data.prazo_reserva_minutos,
  };
}

const servicoME = z.object({
  id: z.number(), name: z.string(), price: z.union([z.string(), z.number()]).optional(), custom_price: z.union([z.string(), z.number()]).optional(),
  delivery_time: z.number().optional(), custom_delivery_range: z.object({ min: z.number(), max: z.number() }).optional(),
  company: z.object({ name: z.string() }).optional(), error: z.string().optional(),
});

/** Cotação no Melhor Envio. Devolve null se não houver token, der erro ou demorar. */
async function cotarMelhorEnvio(cepOrigem: string, cepDestino: string, pacotes: PacoteFrete[]): Promise<OpcaoFrete[] | null> {
  const token = process.env.MELHOR_ENVIO_TOKEN;
  if (!token) return null;
  try {
    const r = await fetch(`${URL_MELHOR_ENVIO}/api/v2/me/shipment/calculate`, {
      method: "POST",
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
      headers: {
        Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}`,
        "User-Agent": `Kyano Colletion (${process.env.MELHOR_ENVIO_CONTATO ?? "contato-tecnico"})`,
      },
      body: JSON.stringify({
        from: { postal_code: cepOrigem },
        to: { postal_code: cepDestino },
        products: pacotes.map((p) => ({
          id: p.produtoId, width: p.larguraCm, height: p.alturaCm, length: p.comprimentoCm,
          weight: p.pesoGramas / 1000, insurance_value: p.valorCentavos / 100, quantity: p.quantidade,
        })),
        options: { receipt: false, own_hand: false },
      }),
    });
    if (!r.ok) return null;
    const lista = z.array(servicoME).parse(await r.json());
    const opcoes = lista
      .filter((s) => !s.error && (s.custom_price ?? s.price) !== undefined)
      .map((s) => {
        const preco = Math.round(Number(s.custom_price ?? s.price) * 100);
        const min = s.custom_delivery_range?.min ?? s.delivery_time ?? 0;
        const max = s.custom_delivery_range?.max ?? s.delivery_time ?? min;
        return { id: `me-${s.id}`, nome: `${s.company?.name ? `${s.company.name} ` : ""}${s.name}`.trim(), precoCentavos: preco, precoOriginalCentavos: preco, prazoMinDias: min, prazoMaxDias: max, gratis: false, retirada: false };
      })
      .filter((o) => Number.isFinite(o.precoCentavos) && o.precoCentavos >= 0 && o.prazoMaxDias > 0);
    return opcoes.length ? opcoes.sort((a, b) => a.precoCentavos - b.precoCentavos) : null;
  } catch {
    return null; // detalhes não vão para o cliente nem para o log
  }
}

/** Plano B: tabela fixa por UF (configurada no banco). */
async function cotarTabela(uf: string): Promise<OpcaoFrete[] | null> {
  const { data } = await supabasePublico().from("frete_tabela").select("valor_centavos, prazo_min_dias, prazo_max_dias").eq("uf", uf).maybeSingle();
  if (!data) return null;
  return [{ id: "tabela", nome: "Entrega padrão", precoCentavos: data.valor_centavos, precoOriginalCentavos: data.valor_centavos, prazoMinDias: data.prazo_min_dias, prazoMaxDias: data.prazo_max_dias, gratis: false, retirada: false }];
}

/** Opções de frete para um CEP e um conjunto de pacotes, já com frete grátis e retirada aplicados. */
export async function cotarFrete(cepDestino: string, pacotes: PacoteFrete[], subtotalCentavos: number): Promise<ResultadoFrete> {
  const [endereco, config] = await Promise.all([buscarEndereco(cepDestino), lerConfiguracoes()]);
  if (!endereco) return { ok: false, erro: "Não encontramos esse CEP. Confira os números." };

  let aviso: string | null = null;
  let opcoes = pacotes.length ? await cotarMelhorEnvio(config.cepOrigem, cepDestino, pacotes) : null;
  if (!opcoes) {
    opcoes = await cotarTabela(endereco.uf);
    if (pacotes.length && process.env.MELHOR_ENVIO_TOKEN) aviso = "O cálculo de frete das transportadoras está indisponível agora. Usamos nossa tabela de frete por estado.";
  }
  if (!opcoes) return { ok: false, erro: "Não conseguimos calcular o frete para esse CEP agora. Tente novamente em instantes." };

  // Frete grátis acima do valor configurado: a opção mais barata sai por R$ 0.
  const limite = config.freteGratisAcimaCentavos;
  if (limite !== null && subtotalCentavos >= limite && opcoes.length) {
    const maisBarata = opcoes.reduce((a, b) => (b.precoCentavos < a.precoCentavos ? b : a));
    opcoes = opcoes.map((o) => (o === maisBarata ? { ...o, precoCentavos: 0, gratis: true } : o));
  }

  if (config.retiradaAtiva) {
    opcoes = [...opcoes, { id: "retirada", nome: config.retiradaEndereco ? `Retirar na loja (${config.retiradaEndereco})` : "Retirar na loja", precoCentavos: 0, precoOriginalCentavos: 0, prazoMinDias: 1, prazoMaxDias: 2, gratis: true, retirada: true }];
  }
  return { ok: true, endereco, opcoes: opcoes.sort((a, b) => a.precoCentavos - b.precoCentavos || a.prazoMaxDias - b.prazoMaxDias), aviso };
}
