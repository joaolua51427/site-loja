import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GaleriaProduto, type FotoProduto } from "@/components/loja/galeria-produto";
import { NomeMarca } from "@/components/loja/nome-marca";
import { SeletorProduto } from "@/components/loja/seletor-produto";
import { getMarcas, getProduto, getProdutosDaMarca } from "@/lib/catalogo";
import { formatarPreco } from "@/lib/formatar";

export function generateStaticParams() {
  return getMarcas().flatMap((m) => getProdutosDaMarca(m.id).map((p) => ({ marca: m.slug, produto: p.slug })));
}

export async function generateMetadata({ params }: PageProps<"/marcas/[marca]/[produto]">): Promise<Metadata> {
  const { marca, produto } = await params;
  const achado = getProduto(marca, produto);
  return { title: achado ? `${achado.produto.nome} · ${achado.marca.nome}` : "Produto não encontrado" };
}

export default async function PaginaProduto({ params }: PageProps<"/marcas/[marca]/[produto]">) {
  const { marca: marcaSlug, produto: produtoSlug } = await params;
  const achado = getProduto(marcaSlug, produtoSlug);
  if (!achado) notFound();
  const { marca, produto } = achado;
  const corPrincipal = produto.cores[0].nome.toLowerCase();

  const fotos: FotoProduto[] = [
    { src: produto.imagens.frente, alt: `${produto.nome}, cor ${corPrincipal}, vista de frente`, rotulo: "frente" },
    ...(produto.imagens.costas ? [{ src: produto.imagens.costas, alt: `${produto.nome}, cor ${corPrincipal}, vista de costas`, rotulo: "costas" }] : []),
    ...(produto.imagens.lado ? [{ src: produto.imagens.lado, alt: `${produto.nome}, cor ${corPrincipal}, vista de lado`, rotulo: "lado" }] : []),
  ];

  return (
    <div className="mx-auto w-full max-w-6xl animate-in fade-in px-4 pb-20 pt-6 [animation-duration:500ms] motion-reduce:animate-none sm:px-6">
      <nav aria-label="Você está em" className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href="/marcas" className="underline-offset-4 hover:text-foreground hover:underline">Marcas</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href={`/marcas/${marca.slug}`} className="underline-offset-4 hover:text-foreground hover:underline">{marca.nome}</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">{produto.nome}</li>
        </ol>
      </nav>

      <div className="mt-8 grid items-start gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] md:gap-14">
        <GaleriaProduto fotos={fotos} />

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Link href={`/marcas/${marca.slug}`} className="self-start text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
              <NomeMarca marca={marca} className="text-lg" />
            </Link>
            <h1 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">{produto.nome}</h1>
            <p className="text-xl tabular-nums">{formatarPreco(produto.precoCentavos)}</p>
          </div>
          <p className="leading-relaxed text-muted-foreground">{produto.descricao}</p>
          {produto.detalhes.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Detalhes">
              {produto.detalhes.map((d) => <li key={d} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">{d}</li>)}
            </ul>
          )}
          <SeletorProduto produtoId={produto.id} tamanhos={produto.tamanhos} cores={produto.cores} />
        </div>
      </div>
    </div>
  );
}
