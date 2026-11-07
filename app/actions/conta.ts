"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { destinoSeguro } from "@/lib/redirecionar";
import { supabaseServidor } from "@/lib/supabase/servidor";

// Login com o Supabase Auth (CLAUDE.md §3: nada de senha/sessão feita à mão).
// Mensagens genéricas para não revelar se um e-mail tem conta (§5).
// Limite de tentativas: o Supabase Auth já aplica rate limit em login, cadastro e recuperação.
// TODO-SEGURANÇA: revisar os limites em Supabase > Authentication > Rate Limits antes de publicar.

const credenciais = z.object({
  email: z.email().max(254),
  senha: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres.").max(72),
  voltar: z.string().optional(),
});

export type EstadoConta = { erro?: string; mensagem?: string };

export async function entrar(_: EstadoConta, form: FormData): Promise<EstadoConta> {
  const r = credenciais.safeParse({ email: form.get("email"), senha: form.get("senha"), voltar: form.get("voltar") ?? undefined });
  if (!r.success) return { erro: "Confira o e-mail e a senha." };
  const supabase = await supabaseServidor();
  const { error } = await supabase.auth.signInWithPassword({ email: r.data.email, password: r.data.senha });
  if (error) return { erro: "E-mail ou senha incorretos, ou e-mail ainda não confirmado." };
  redirect(destinoSeguro(r.data.voltar));
}

export async function cadastrar(_: EstadoConta, form: FormData): Promise<EstadoConta> {
  const r = credenciais.safeParse({ email: form.get("email"), senha: form.get("senha"), voltar: form.get("voltar") ?? undefined });
  if (!r.success) return { erro: r.error.issues.find((i) => i.path[0] === "senha")?.message ?? "Confira o e-mail e a senha." };
  const supabase = await supabaseServidor();
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  await supabase.auth.signUp({
    email: r.data.email,
    password: r.data.senha,
    options: { emailRedirectTo: `${site}/auth/confirmar?voltar=${encodeURIComponent(destinoSeguro(r.data.voltar))}` },
  });
  // Mesma resposta exista ou não a conta (evita descobrir quem é cliente).
  return { mensagem: "Se o e-mail puder ser usado, enviamos um link de confirmação. Confira sua caixa de entrada." };
}

export async function sair() {
  const supabase = await supabaseServidor();
  await supabase.auth.signOut();
  redirect("/marcas");
}
