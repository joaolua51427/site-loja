// Chaves PÚBLICAS do Supabase (podem ir ao navegador; o acesso é limitado pela RLS).
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_CHAVE_PUBLICA = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

/**
 * Falha cedo e com uma mensagem clara quando as variáveis não foram cadastradas
 * (ex.: publicação na Vercel sem "Environment Variables"). Nunca mostra valores.
 */
export function exigirSupabase() {
  const faltando = [
    !SUPABASE_URL && "NEXT_PUBLIC_SUPABASE_URL",
    !SUPABASE_CHAVE_PUBLICA && "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  ].filter(Boolean);
  if (faltando.length) {
    throw new Error(
      `Configuração ausente: ${faltando.join(" e ")}. ` +
        "Localmente, crie o arquivo .env.local (veja .env.example). " +
        "Na Vercel, cadastre em Settings > Environment Variables (Production e Preview) e publique de novo.",
    );
  }
}
