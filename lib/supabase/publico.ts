import "server-only";

import { createClient } from "@supabase/supabase-js";

import { SUPABASE_CHAVE_PUBLICA, SUPABASE_URL } from "@/lib/supabase/env";

/**
 * Cliente sem sessão (papel "anon"), para dados públicos como o catálogo.
 * Não lê cookies, então pode ser usado dentro de funções com "use cache".
 */
export function supabasePublico() {
  return createClient(SUPABASE_URL, SUPABASE_CHAVE_PUBLICA, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
