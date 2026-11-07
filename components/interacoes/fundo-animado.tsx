"use client";

import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

type Cena = { src: string; posicao: string; movimento: "aproximar" | "afastar" | "panoramica" };

/**
 * Fundo em tela cheia: fotos em alta resolução que se fundem uma na outra, cada uma com
 * zoom/deslocamento lento (efeito Ken Burns) e uma textura de filme por cima.
 * Com "reduzir movimento", mostra só a primeira foto, parada.
 */
export function FundoAnimado({ cenas, duracao = 7000, className }: { cenas: Cena[]; duracao?: number; className?: string }) {
  const [atual, setAtual] = React.useState(0);
  const [reduzido, setReduzido] = React.useState(false);

  React.useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const atualizar = () => setReduzido(m.matches);
    atualizar();
    m.addEventListener("change", atualizar);
    return () => m.removeEventListener("change", atualizar);
  }, []);

  React.useEffect(() => {
    if (reduzido || cenas.length < 2) return;
    // Pausa quando a aba não está visível, para não gastar bateria.
    let t = 0;
    const agendar = () => { t = window.setTimeout(() => { setAtual((a) => (a + 1) % cenas.length); agendar(); }, duracao); };
    const visibilidade = () => { window.clearTimeout(t); if (!document.hidden) agendar(); };
    agendar();
    document.addEventListener("visibilitychange", visibilidade);
    return () => { window.clearTimeout(t); document.removeEventListener("visibilitychange", visibilidade); };
  }, [reduzido, cenas.length, duracao]);

  return (
    <div aria-hidden="true" className={cn("absolute inset-0 overflow-hidden", className)}>
      {cenas.map((c, i) => {
        const ativa = i === atual;
        return (
          <div
            key={c.src}
            className={cn("absolute inset-0 transition-opacity duration-[2200ms] ease-in-out", ativa ? "opacity-100" : "opacity-0")}
          >
            <Image
              src={c.src}
              alt=""
              fill
              priority={i === 0}
              quality={85}
              sizes="100vw"
              style={{ objectPosition: c.posicao, animationDuration: `${duracao + 2400}ms` }}
              className={cn(
                "object-cover will-change-transform",
                !reduzido && ativa && (c.movimento === "aproximar" ? "animate-[ken-aproximar_linear_both]" : c.movimento === "afastar" ? "animate-[ken-afastar_linear_both]" : "animate-[ken-panoramica_linear_both]"),
              )}
            />
          </div>
        );
      })}
      {/* Textura de filme (grão) bem sutil */}
      <div
        className="absolute inset-[-50%] opacity-[0.07] mix-blend-overlay motion-safe:animate-[grao_0.9s_steps(4)_infinite]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }}
      />
      {/* Indicador das cenas */}
      {cenas.length > 1 && !reduzido && (
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
          {cenas.map((c, i) => (
            <span key={c.src} className="h-px w-10 overflow-hidden bg-white/25">
              <span
                key={`${atual}-${i}`}
                className={cn("block h-full bg-white/80", i === atual ? "animate-[progresso_linear_both]" : i < atual ? "w-full" : "w-0")}
                style={i === atual ? { animationDuration: `${duracao}ms` } : undefined}
              />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
