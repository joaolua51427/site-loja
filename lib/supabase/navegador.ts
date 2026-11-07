"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let cliente: SupabaseClient | null = null;

/** Cliente do navegador: usado só para saber se há sessão (login/logout). */
export function supabaseNavegador(): SupabaseClient {
  if (!cliente) {
    cliente = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "", process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "");
  }
  return cliente;
}
