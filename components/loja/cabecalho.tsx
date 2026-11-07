import Link from "next/link";

import { ContadorCarrinho } from "@/components/loja/contador-carrinho";

export function Cabecalho({ nomeLoja }: { nomeLoja: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-display text-2xl tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring">{nomeLoja}</Link>
        <nav aria-label="Principal" className="flex items-center gap-1 text-sm">
          <Link href="/marcas" className="inline-flex min-h-11 items-center rounded-full px-3 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">Marcas</Link>
          <ContadorCarrinho />
        </nav>
      </div>
    </header>
  );
}
