import { Cabecalho } from "@/components/loja/cabecalho";
import { getLoja } from "@/lib/catalogo";

export default function LayoutLoja({ children }: { children: React.ReactNode }) {
  const loja = getLoja();
  return (
    <>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-foreground focus:px-4 focus:py-2 focus:text-background">Pular para o conteúdo</a>
      <Cabecalho nomeLoja={loja.nome} />
      <main id="conteudo" className="flex-1">{children}</main>
      <footer className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-8 text-xs text-muted-foreground sm:px-6">
          <p>© {loja.nome}. Marcas e produtos de exemplo.</p>
        </div>
      </footer>
    </>
  );
}
