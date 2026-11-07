"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Magnetico } from "@/components/interacoes/magnetico";
import { Parallax } from "@/components/interacoes/parallax";
import { Logotipo } from "@/components/loja/logotipo";
import { cn } from "@/lib/utils";

const DURACAO_SAIDA = 620;

export function BoasVindas({ nomeLoja, slogan }: { nomeLoja: string; slogan: string }) {
  const router = useRouter();
  const [saindo, setSaindo] = React.useState(false);

  React.useEffect(() => {
    router.prefetch("/marcas");
  }, [router]);

  function entrar() {
    if (saindo) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      router.push("/marcas");
      return;
    }
    setSaindo(true);
    window.setTimeout(() => router.push("/marcas"), DURACAO_SAIDA);
  }

  return (
    <main className="relative isolate flex min-h-svh flex-col items-center justify-center overflow-hidden bg-[oklch(0.16_0_0)] px-6 py-16 text-center text-white">
      <Parallax className="absolute inset-0 -z-20">
      <Image
        src="/fundos/santorini-cupulas.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className={cn(
          "object-cover object-[50%_40%] transition-[transform,opacity] ease-[cubic-bezier(.4,0,.2,1)] motion-safe:animate-[aproximar_14s_ease-out_both] motion-reduce:transition-none",
          saindo && "scale-110 opacity-0",
        )}
        style={{ transitionDuration: `${DURACAO_SAIDA}ms` }}
      />
      </Parallax>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-black/45 via-black/35 to-black/65" />
      <div aria-hidden="true" className="absolute inset-0 -z-10" style={{ background: "radial-gradient(60% 45% at 50% 50%, rgb(0 0 0 / 0.35), transparent 75%)" }} />

      <div
        className={cn(
          "flex max-w-2xl flex-col items-center gap-8 transition-[opacity,transform] ease-[cubic-bezier(.4,0,.2,1)] motion-reduce:transition-none",
          saindo && "-translate-y-4 opacity-0",
        )}
        style={{ transitionDuration: `${DURACAO_SAIDA}ms` }}
      >
        <p className="rotulo animate-in fade-in fill-mode-both text-white/80 [animation-delay:200ms] [animation-duration:1200ms] motion-reduce:animate-none">
          Bem-vindo
        </p>
        <h1>
          <Logotipo nome={nomeLoja} tamanho="xl" animado />
        </h1>
        <p className="animate-in fade-in fill-mode-both font-display text-2xl font-light italic text-white/90 [animation-delay:800ms] [animation-duration:1400ms] motion-reduce:animate-none sm:text-3xl">
          luxo &amp; elegância<span className="hidden sm:inline"> · </span><br className="sm:hidden" />atitude &amp; personalidade
        </p>
        <p className="animate-in fade-in fill-mode-both max-w-[36ch] text-sm leading-relaxed text-white/75 [animation-delay:1000ms] [animation-duration:1400ms] motion-reduce:animate-none">
          {slogan}
        </p>
        <Magnetico>
        <button
          type="button"
          onClick={entrar}
          disabled={saindo}
          className="rotulo mt-2 inline-flex min-h-12 animate-in fade-in fill-mode-both items-center border border-white/70 px-10 text-white outline-none transition-colors [animation-delay:1200ms] [animation-duration:1400ms] hover:bg-white hover:text-black focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black motion-reduce:animate-none"
        >
          Entrar na loja
        </button>
        </Magnetico>
      </div>
    </main>
  );
}
