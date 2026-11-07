import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { SUPABASE_CHAVE_PUBLICA, SUPABASE_URL } from "@/lib/supabase/env";

/**
 * Cliente com a sessão do usuário (cookies HttpOnly do Supabase).
 * Tudo o que ele faz passa pela RLS como o próprio usuário.
 */
export async function supabaseServidor() {
  const loja = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_CHAVE_PUBLICA, {
    cookies: {
      getAll: () => loja.getAll(),
      setAll: (lista) => {
        try {
          lista.forEach(({ name, value, options }) => loja.set(name, value, options));
        } catch {
          // Chamado de um Server Component: o proxy renova os cookies.
        }
      },
    },
  });
}

/** Usuário confirmado pelo servidor do Supabase (não confia só no cookie). */
export async function usuarioAtual() {
  const supabase = await supabaseServidor();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { supabase, usuario: null };
  return { supabase, usuario: data.user };
}
