import Link from "next/link";

import { CabecalhoRolagem } from "@/components/loja/cabecalho-rolagem";
import { ContadorCarrinho } from "@/components/loja/contador-carrinho";
import { Logotipo } from "@/components/loja/logotipo";

export function Cabecalho({ nomeLoja }: { nomeLoja: string }) {
  return (
    <CabecalhoRolagem>
    <header className="border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto grid h-20 w-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6">
        <nav aria-label="Principal" className="flex items-center gap-1">
          <Link href="/marcas" className="rotulo linha-crescente inline-flex min-h-11 items-center px-2 outline-none transition-colors hover:text-egeu hover:[background-size:100%_1px] focus-visible:ring-2 focus-visible:ring-ring">Marcas</Link>
        </nav>
        <Link href="/" aria-label={`${nomeLoja}, início`} className="outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Logotipo nome={nomeLoja} />
        </Link>
        <div className="flex justify-end">
          <ContadorCarrinho />
        </div>
      </div>
    </header>
    </CabecalhoRolagem>
  );
}
