"use client";

import * as React from "react";
import Link from "next/link";

import type { Marca } from "@/lib/catalogo-schema";

type Item = Pick<Marca, "nome" | "slug">;

/**
 * Nomes das coleções num cilindro 3D que gira devagar.
 * - Arrastar (mouse ou dedo) gira com inércia; passar o mouse pausa.
 * - Tab leva o foco a cada nome e o cilindro gira até ele.
 * - Com "reduzir movimento", vira uma lista simples, sem 3D.
 */
export function CilindroMarcas({ marcas }: { marcas: Item[] }) {
  const palco = React.useRef<HTMLDivElement>(null);
  const anel = React.useRef<HTMLUListElement>(null);
  const itens = React.useRef<(HTMLLIElement | null)[]>([]);
  const estado = React.useRef({ angulo: 0, velocidade: 0, alvo: null as number | null, arrastando: false, ultimoX: 0, pausado: false, raio: 360 });
  const [reduzido, setReduzido] = React.useState(false);
  const passo = 360 / marcas.length;

  React.useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const atualizar = () => setReduzido(m.matches);
    atualizar();
    m.addEventListener("change", atualizar);
    return () => m.removeEventListener("change", atualizar);
  }, []);

  // Raio acompanha a largura da tela, para caber no celular.
  React.useEffect(() => {
    const el = palco.current;
    if (!el) return;
    const medir = () => { estado.current.raio = Math.max(170, Math.min(420, el.clientWidth * 0.36)); };
    medir();
    const obs = new ResizeObserver(medir);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  React.useEffect(() => {
    if (reduzido) return;
    let quadro = 0;
    const s = estado.current;
    const loop = () => {
      if (s.alvo !== null) {
        const diff = ((s.alvo - s.angulo + 540) % 360) - 180;
        s.angulo += diff * 0.12;
        if (Math.abs(diff) < 0.2) s.alvo = null;
      } else if (!s.arrastando) {
        s.velocidade *= 0.94; // inércia depois de soltar
        const base = s.pausado ? 0 : -0.08; // giro automático lento
        s.angulo += Math.abs(s.velocidade) > 0.02 ? s.velocidade : base;
      }
      if (anel.current) anel.current.style.transform = `translateZ(${-s.raio}px) rotateY(${s.angulo}deg)`;
      itens.current.forEach((li, i) => {
        if (!li) return;
        const a = ((i * passo + s.angulo) % 360 + 360) % 360;
        const frente = Math.cos((a * Math.PI) / 180); // 1 = de frente, -1 = atrás
        li.style.transform = `rotateY(${i * passo}deg) translateZ(${s.raio}px)`;
        // De lado ou de costas, o nome some (evita os "riscos" de texto visto de perfil).
        li.style.opacity = frente < 0.25 ? "0" : String(((frente - 0.25) / 0.75) ** 1.4);
        li.style.visibility = frente < 0.25 ? "hidden" : "visible";
        li.style.pointerEvents = frente > 0.55 ? "auto" : "none";
        li.style.filter = frente > 0.7 ? "none" : `blur(${((0.7 - frente) * 2.2).toFixed(2)}px)`;
      });
      quadro = requestAnimationFrame(loop);
    };
    quadro = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(quadro);
  }, [reduzido, passo]);

  function aoPressionar(e: React.PointerEvent) {
    const s = estado.current;
    s.arrastando = true; s.alvo = null; s.ultimoX = e.clientX; s.velocidade = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function aoMover(e: React.PointerEvent) {
    const s = estado.current;
    if (!s.arrastando) return;
    const dx = e.clientX - s.ultimoX;
    s.ultimoX = e.clientX;
    s.angulo += dx * 0.25;
    s.velocidade = dx * 0.25;
  }
  function aoSoltar() { estado.current.arrastando = false; }

  if (reduzido) {
    return (
      <section aria-label="Coleções" className="border-y border-border py-10">
        <ul className="mx-auto flex max-w-5xl flex-wrap justify-center gap-x-10 gap-y-4 px-4">
          {marcas.map((m) => (
            <li key={m.slug}><Link href={`/marcas/${m.slug}`} className="font-display text-3xl font-light italic hover:text-egeu">{m.nome}</Link></li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section aria-label="Coleções" className="relative overflow-hidden border-y border-border py-6">
      <div
        ref={palco}
        onPointerDown={aoPressionar}
        onPointerMove={aoMover}
        onPointerUp={aoSoltar}
        onPointerCancel={aoSoltar}
        onPointerEnter={(e) => { if (e.pointerType === "mouse") estado.current.pausado = true; }}
        onPointerLeave={() => { estado.current.pausado = false; estado.current.arrastando = false; }}
        className="relative mx-auto h-40 cursor-grab touch-pan-y select-none [perspective:1100px] active:cursor-grabbing sm:h-48"
      >
        <ul ref={anel} className="absolute inset-0 [transform-style:preserve-3d]">
          {marcas.map((m, i) => (
            <li
              key={m.slug}
              ref={(el) => { itens.current[i] = el; }}
              className="absolute left-1/2 top-1/2 -ml-[11rem] -mt-8 flex h-16 w-[22rem] items-center justify-center [backface-visibility:hidden]"
            >
              <Link
                href={`/marcas/${m.slug}`}
                draggable={false}
                data-cursor="Entrar"
                onFocus={() => { estado.current.alvo = -i * passo; }}
                className="linha-crescente whitespace-nowrap font-display text-4xl font-light italic text-foreground outline-none transition-colors duration-300 hover:text-egeu hover:[background-size:100%_1px] focus-visible:ring-2 focus-visible:ring-ring sm:text-5xl"
              >
                {m.nome}
              </Link>
            </li>
          ))}
        </ul>
        {/* Esmaece as bordas para dar profundidade */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,var(--background)_0%,transparent_22%,transparent_78%,var(--background)_100%)]" />
      </div>
      <p className="rotulo mt-2 text-center text-muted-foreground">Arraste para girar</p>
    </section>
  );
}
