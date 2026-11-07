"use client";

import * as React from "react";

/** Esconde o cabeçalho ao rolar para baixo e mostra de novo ao rolar para cima. */
export function CabecalhoRolagem({ children }: { children: React.ReactNode }) {
  const [oculto, setOculto] = React.useState(false);
  const [rolado, setRolado] = React.useState(false);

  React.useEffect(() => {
    let ultimo = window.scrollY;
    let quadro = 0;
    const aoRolar = () => {
      cancelAnimationFrame(quadro);
      quadro = requestAnimationFrame(() => {
        const y = window.scrollY;
        setRolado(y > 8);
        if (Math.abs(y - ultimo) > 6) setOculto(y > ultimo && y > 160);
        ultimo = y;
      });
    };
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => { window.removeEventListener("scroll", aoRolar); cancelAnimationFrame(quadro); };
  }, []);

  return (
    <div
      data-oculto={oculto || undefined}
      data-rolado={rolado || undefined}
      // Se o foco do teclado entrar no cabeçalho, ele volta a aparecer.
      onFocusCapture={() => setOculto(false)}
      className="sticky top-0 z-40 transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(.2,.7,.2,1)] data-[oculto]:-translate-y-full data-[oculto]:duration-300 data-[rolado]:shadow-[0_8px_24px_-18px_color-mix(in_oklab,var(--color-foreground)_40%,transparent)] motion-reduce:transition-none"
    >
      {children}
    </div>
  );
}
