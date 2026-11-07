"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { carrinhoDoUsuario, consultarDisponibilidade, definirItemDoUsuario, mesclarCarrinho } from "@/app/actions/carrinho";
import { carrinhoSchema, type ItemCarrinho } from "@/lib/carrinho-schema";
import { supabaseNavegador } from "@/lib/supabase/navegador";

// Carrinho:
// - Visitante: guardado no navegador (só variação + quantidade, nunca preço).
// - Logado: guardado no banco (tabela itens_carrinho, protegida por RLS).
// - Ao entrar: o carrinho do navegador é somado ao da conta e depois limpo do navegador.
const CHAVE = "kyano:carrinho:v2";
const MAX_POR_ITEM = 10;

type Usuario = { id: string; email: string | null };
type Resultado = { ok: true; quantidade: number } | { ok: false; erro: string };

type CarrinhoContexto = {
  itens: ItemCarrinho[];
  pronto: boolean;
  usuario: Usuario | null;
  totalItens: number;
  adicionar: (variacaoId: string, quantidade?: number) => Promise<Resultado>;
  alterarQuantidade: (variacaoId: string, quantidade: number) => Promise<void>;
  remover: (variacaoId: string) => Promise<void>;
  /** Aplica correções do servidor (quantidades limitadas, itens inexistentes removidos). */
  aplicarCorrecoes: (itens: ItemCarrinho[]) => Promise<void>;
};

const Contexto = React.createContext<CarrinhoContexto | null>(null);

// ---------- Armazenamento do visitante (navegador) ----------
const VAZIO: ItemCarrinho[] = [];
let cache: ItemCarrinho[] | null = null;
const ouvintes = new Set<() => void>();

function lerLocal(): ItemCarrinho[] {
  if (cache) return cache;
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    const r = carrinhoSchema.safeParse(bruto ? JSON.parse(bruto) : []);
    cache = r.success ? r.data : VAZIO;
  } catch {
    cache = VAZIO;
  }
  return cache;
}

function gravarLocal(itens: ItemCarrinho[]) {
  cache = itens;
  try {
    if (itens.length) window.localStorage.setItem(CHAVE, JSON.stringify(itens));
    else window.localStorage.removeItem(CHAVE);
  } catch {
    // Armazenamento bloqueado (aba anônima): vale só nesta visita.
  }
  ouvintes.forEach((o) => o());
}

function assinarLocal(ouvir: () => void) {
  ouvintes.add(ouvir);
  const outraAba = (e: StorageEvent) => { if (e.key === CHAVE) { cache = null; ouvir(); } };
  window.addEventListener("storage", outraAba);
  return () => { ouvintes.delete(ouvir); window.removeEventListener("storage", outraAba); };
}

const assinarNada = () => () => {};

export function CarrinhoProvider({ children }: { children: React.ReactNode }) {
  const local = React.useSyncExternalStore(assinarLocal, lerLocal, () => VAZIO);
  const hidratado = React.useSyncExternalStore(assinarNada, () => true, () => false);
  const [usuario, setUsuario] = React.useState<Usuario | null>(null);
  const [itensConta, setItensConta] = React.useState<ItemCarrinho[]>([]);
  const [sessaoVerificada, setSessaoVerificada] = React.useState(false);
  const caminho = usePathname();
  const usuarioRef = React.useRef<Usuario | null>(null);
  const mesclando = React.useRef(false);

  // Entrar: mescla o carrinho do navegador com o da conta (uma vez só, mesmo com eventos repetidos).
  const aoEntrar = React.useCallback(async (u: Usuario) => {
    if (mesclando.current || usuarioRef.current?.id === u.id) return;
    mesclando.current = true;
    try {
      const doNavegador = lerLocal();
      const r = doNavegador.length ? await mesclarCarrinho(doNavegador) : await carrinhoDoUsuario();
      if (r.ok) {
        setItensConta(r.itens);
        if (doNavegador.length) gravarLocal([]); // já está salvo na conta
      }
      usuarioRef.current = u;
      setUsuario(u);
    } finally {
      mesclando.current = false;
      setSessaoVerificada(true);
    }
  }, []);

  // Acompanha login/logout.
  React.useEffect(() => {
    const sb = supabaseNavegador();
    let ativo = true;

    sb.auth.getUser().then(({ data }) => {
      if (!ativo) return;
      if (data.user) aoEntrar({ id: data.user.id, email: data.user.email ?? null });
      else setSessaoVerificada(true);
    });

    const { data: assinatura } = sb.auth.onAuthStateChange((evento, sessao) => {
      if (evento === "SIGNED_IN" && sessao?.user) aoEntrar({ id: sessao.user.id, email: sessao.user.email ?? null });
      if (evento === "SIGNED_OUT") { usuarioRef.current = null; setUsuario(null); setItensConta([]); }
    });
    return () => { ativo = false; assinatura.subscription.unsubscribe(); };
  }, [aoEntrar]);

  // O login e o logout acontecem no servidor (cookies HttpOnly); a cada troca de página
  // o carrinho reconfere a sessão para entrar no modo certo sem esperar.
  React.useEffect(() => {
    let ativo = true;
    supabaseNavegador().auth.getUser().then(({ data }) => {
      if (!ativo) return;
      if (data.user) aoEntrar({ id: data.user.id, email: data.user.email ?? null });
      else if (usuarioRef.current) { usuarioRef.current = null; setUsuario(null); setItensConta([]); }
    });
    return () => { ativo = false; };
  }, [caminho, aoEntrar]);

  const itens = usuario ? itensConta : local;
  const pronto = hidratado && sessaoVerificada;

  const valor = React.useMemo<CarrinhoContexto>(() => {
    const atualizarLocal = (fn: (atual: ItemCarrinho[]) => ItemCarrinho[]) => gravarLocal(fn(lerLocal()));

    async function definirNaConta(variacaoId: string, quantidade: number, somar: boolean) {
      const r = await definirItemDoUsuario({ variacaoId, quantidade, somar });
      if (r.ok) setItensConta(r.itens);
      return r;
    }

    return {
      itens,
      pronto,
      usuario,
      totalItens: itens.reduce((s, i) => s + i.quantidade, 0),

      adicionar: async (variacaoId, quantidade = 1) => {
        if (usuario) {
          const r = await definirNaConta(variacaoId, quantidade, true);
          return r.ok ? { ok: true, quantidade: r.quantidade } : r;
        }
        // Visitante: confere no servidor se há estoque e qual o limite.
        const d = await consultarDisponibilidade({ variacaoId });
        if (!d.ok) return d;
        let nova = 0;
        atualizarLocal((atual) => {
          const existente = atual.find((i) => i.variacaoId === variacaoId);
          nova = Math.min(d.maximo, MAX_POR_ITEM, (existente?.quantidade ?? 0) + quantidade);
          if (existente) return atual.map((i) => (i === existente ? { ...i, quantidade: nova } : i));
          return [...atual, { variacaoId, quantidade: nova }].slice(0, 30);
        });
        return { ok: true, quantidade: nova };
      },

      alterarQuantidade: async (variacaoId, quantidade) => {
        const q = Math.max(1, Math.min(MAX_POR_ITEM, quantidade));
        if (usuario) { await definirNaConta(variacaoId, q, false); return; }
        atualizarLocal((atual) => atual.map((i) => (i.variacaoId === variacaoId ? { ...i, quantidade: q } : i)));
      },

      remover: async (variacaoId) => {
        if (usuario) { await definirNaConta(variacaoId, 0, false); return; }
        atualizarLocal((atual) => atual.filter((i) => i.variacaoId !== variacaoId));
      },

      aplicarCorrecoes: async (corrigidos) => {
        const igual = corrigidos.length === itens.length && corrigidos.every((c, k) => c.variacaoId === itens[k]?.variacaoId && c.quantidade === itens[k]?.quantidade);
        if (igual) return;
        if (usuario) {
          const manter = new Set(corrigidos.map((c) => c.variacaoId));
          for (const i of itens) if (!manter.has(i.variacaoId)) await definirNaConta(i.variacaoId, 0, false);
          for (const c of corrigidos) {
            const atual = itens.find((i) => i.variacaoId === c.variacaoId);
            if (atual && atual.quantidade !== c.quantidade) await definirNaConta(c.variacaoId, c.quantidade, false);
          }
          return;
        }
        gravarLocal(corrigidos);
      },
    };
  }, [itens, pronto, usuario]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useCarrinho() {
  const ctx = React.useContext(Contexto);
  if (!ctx) throw new Error("useCarrinho precisa estar dentro de <CarrinhoProvider>.");
  return ctx;
}
