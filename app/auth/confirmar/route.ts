import { NextResponse, type NextRequest } from "next/server";

import { destinoSeguro } from "@/lib/redirecionar";
import { supabaseServidor } from "@/lib/supabase/servidor";

/** Link do e-mail de confirmação: troca o código por uma sessão e volta para a loja. */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const codigo = url.searchParams.get("code");
  const voltar = destinoSeguro(url.searchParams.get("voltar"));
  if (codigo) {
    const supabase = await supabaseServidor();
    const { error } = await supabase.auth.exchangeCodeForSession(codigo);
    if (!error) return NextResponse.redirect(new URL(voltar, url.origin));
  }
  return NextResponse.redirect(new URL("/entrar?erro=link", url.origin));
}
