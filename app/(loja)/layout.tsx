import { Cabecalho } from "@/components/loja/cabecalho";
import { Logotipo } from "@/components/loja/logotipo";
import { getLoja } from "@/lib/catalogo";

export default function LayoutLoja({ children }: { children: React.ReactNode }) {
  const loja = getLoja();
  return (
    <>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-none rotulo focus:bg-foreground focus:px-4 focus:py-2 focus:text-background">Pular para o conteúdo</a>
      <Cabecalho nomeLoja={loja.nome} />
      <main id="conteudo" className="flex-1">{children}</main>
      <footer className="border-t border-border bg-foreground text-background">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-4 py-14 text-center sm:px-6">
          <Logotipo nome={loja.nome} />
          <p className="font-display text-lg font-light italic text-background/80">luxo &amp; elegância · atitude &amp; personalidade</p>
          <ul className="flex flex-col gap-1 text-sm text-background/70">
            <li>Moda masculina refinada.</li>
            <li>Envio para todo o Brasil.</li>
            <li>Referência em segurança e qualidade.</li>
          </ul>
          <p className="rotulo text-background/50">© {loja.nome} · Marcas e produtos de exemplo</p>
        </div>
      </footer>
    </>
  );
}
