// Chaves PÚBLICAS do Supabase (podem ir ao navegador; o acesso é limitado pela RLS).
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_CHAVE_PUBLICA = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

if (!SUPABASE_URL || !SUPABASE_CHAVE_PUBLICA) {
  // Mensagem só no servidor/console de desenvolvimento; nunca mostra valores.
  console.warn("Supabase: variáveis NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY não configuradas.");
}
