"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

const DURACAO_SAIDA = 520;

export function BoasVindas({ nomeLoja, slogan }: { nomeLoja: string; slogan: string }) {
  const router = useRouter();
  const [saindo, setSaindo] = React.useState(false);

  React.useEffect(() => {
    router.prefetch("/marcas");
  }, [router]);

  function entrar() {
    if (saindo) return;
    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduzido) {
      router.push("/marcas");
      return;
    }
    setSaindo(true);
    window.setTimeout(() => router.push("/marcas"), DURACAO_SAIDA);
  }

  return (
    <main
      className={cn(
        "relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background px-6 py-16 text-center text-foreground transition-[opacity,transform,filter] ease-[cubic-bezier(.4,0,.2,1)] motion-reduce:transition-none",
        saindo && "-translate-y-6 opacity-0 blur-[2px]",
      )}
      style={{ transitionDuration: `${DURACAO_SAIDA}ms` }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-0" style={{ background: "radial-gradient(90% 60% at 50% 0%, color-mix(in oklab, var(--color-foreground) 6%, transparent), transparent 70%)" }} />

      <Cabides />

      <div className="relative flex max-w-xl flex-col items-center gap-6">
        <p className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both text-[11px] font-medium uppercase tracking-[0.32em] text-muted-foreground [animation-delay:150ms] [animation-duration:700ms] motion-reduce:animate-none">
          Roupas e calçados
        </p>
        <h1 className="animate-in fade-in slide-in-from-bottom-3 fill-mode-both font-display text-6xl font-medium leading-none tracking-tight [animation-delay:250ms] [animation-duration:800ms] motion-reduce:animate-none sm:text-8xl">
          {nomeLoja}
        </h1>
        <p className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both max-w-[38ch] text-balance text-base leading-relaxed text-muted-foreground [animation-delay:400ms] [animation-duration:800ms] motion-reduce:animate-none sm:text-lg">
          Boas-vindas! {slogan}
        </p>
        <button
          type="button"
          onClick={entrar}
          disabled={saindo}
          className="group mt-4 inline-flex min-h-12 animate-in fade-in fill-mode-both items-center gap-3 rounded-full bg-foreground px-8 text-sm font-medium text-background shadow-sm outline-none transition-[transform,box-shadow] [animation-delay:600ms] [animation-duration:800ms] hover:-translate-y-px hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:animate-none motion-reduce:transition-none"
        >
          Entrar na loja
          <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" />
        </button>
      </div>
    </main>
  );
}

/** Barra com três cabides balançando de leve, no mesmo traço do varal. */
function Cabides() {
  return (
    <svg aria-hidden="true" viewBox="0 0 320 90" className="relative mb-10 w-64 animate-in fade-in fill-mode-both text-muted-foreground [animation-duration:900ms] motion-reduce:animate-none sm:w-80">
      <line x1="10" y1="14" x2="310" y2="14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      {[90, 160, 230].map((x, i) => (
        <g key={x} className="origin-top motion-safe:animate-[balanco_4s_ease-in-out_infinite]" style={{ transformOrigin: `${x}px 14px`, animationDelay: `${i * 0.35}s` }}>
          <path d={`M${x},14 L${x},30 M${x - 28},52 Q${x - 12},36 ${x},34 Q${x + 12},36 ${x + 28},52`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d={`M${x - 3},11 C${x - 3},6 ${x + 4},5 ${x + 4},10`} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  );
}
