import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Renova a sessão do Supabase a cada requisição (cookies HttpOnly, Secure, SameSite).
 * Não faz autorização: cada rota/ação confere o usuário no servidor.
 */
export async function proxy(request: NextRequest) {
  let resposta = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "", process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "", {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (lista) => {
        lista.forEach(({ name, value }) => request.cookies.set(name, value));
        resposta = NextResponse.next({ request });
        lista.forEach(({ name, value, options }) => resposta.cookies.set(name, value, options));
      },
    },
  });
  await supabase.auth.getUser();
  return resposta;
}

export const config = {
  // Pula arquivos estáticos e imagens.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|produtos/|fundos/|.*\\.(?:png|jpg|jpeg|webp|svg|ico)$).*)"],
};
