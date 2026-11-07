"use client";

import * as React from "react";

import { cadastrar, entrar, type EstadoConta } from "@/app/actions/conta";
import { cn } from "@/lib/utils";

export function FormularioEntrar({ voltar, erroLink }: { voltar: string; erroLink: boolean }) {
  const [modo, setModo] = React.useState<"entrar" | "cadastrar">("entrar");
  const [estadoEntrar, acaoEntrar, entrando] = React.useActionState<EstadoConta, FormData>(entrar, {});
  const [estadoCadastro, acaoCadastro, cadastrando] = React.useActionState<EstadoConta, FormData>(cadastrar, {});
  const estado = modo === "entrar" ? estadoEntrar : estadoCadastro;
  const enviando = entrando || cadastrando;
  const id = React.useId();

  return (
    <div className="flex flex-col gap-8">
      <div role="tablist" aria-label="Acesso" className="grid grid-cols-2 border-b border-border">
        {(["entrar", "cadastrar"] as const).map((m) => (
          <button key={m} role="tab" type="button" aria-selected={modo === m} onClick={() => setModo(m)}
            className={cn("rotulo -mb-px border-b py-3 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring", modo === m ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
            {m === "entrar" ? "Entrar" : "Criar conta"}
          </button>
        ))}
      </div>

      {erroLink && <p role="alert" className="text-sm text-destructive">O link de confirmação expirou ou é inválido. Tente entrar ou peça um novo cadastro.</p>}

      <form action={modo === "entrar" ? acaoEntrar : acaoCadastro} className="flex flex-col gap-5" noValidate>
        <input type="hidden" name="voltar" value={voltar} />
        <div className="flex flex-col gap-2">
          <label htmlFor={`${id}-email`} className="text-sm font-medium">E-mail</label>
          <input id={`${id}-email`} name="email" type="email" required autoComplete="email" maxLength={254}
            className="min-h-12 border border-border bg-card px-4 text-base outline-none transition-colors focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring/30" />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor={`${id}-senha`} className="text-sm font-medium">Senha</label>
          <input id={`${id}-senha`} name="senha" type="password" required minLength={8} maxLength={72} autoComplete={modo === "entrar" ? "current-password" : "new-password"} aria-describedby={`${id}-dica`}
            className="min-h-12 border border-border bg-card px-4 text-base outline-none transition-colors focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring/30" />
          <p id={`${id}-dica`} className="text-xs text-muted-foreground">Mínimo de 8 caracteres.</p>
        </div>
        <p aria-live="polite" className="min-h-5 text-sm">
          {estado.erro && <span className="text-destructive">{estado.erro}</span>}
          {estado.mensagem && <span>{estado.mensagem}</span>}
        </p>
        <button type="submit" disabled={enviando} className="rotulo botao-varredura inline-flex min-h-12 items-center justify-center bg-foreground px-8 text-background outline-none disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          {enviando ? "Aguarde…" : modo === "entrar" ? "Entrar" : "Criar conta"}
        </button>
        {modo === "entrar" && <p className="text-xs text-muted-foreground">Ao entrar, o carrinho deste aparelho é somado ao da sua conta.</p>}
      </form>
    </div>
  );
}
