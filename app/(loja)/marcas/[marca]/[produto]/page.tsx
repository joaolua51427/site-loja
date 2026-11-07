import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GaleriaProduto, type FotoProduto } from "@/components/loja/galeria-produto";
import { NomeMarca } from "@/components/loja/nome-marca";
import { CardProduto } from "@/components/loja/card-produto";
import { CarrosselProdutos } from "@/components/loja/carrossel-produtos";
import { SeletorProduto } from "@/components/loja/seletor-produto";
import { SelosConfianca } from "@/components/loja/selos-confianca";
import { catalogo, getVariacoesDoProduto } from "@/lib/catalogo";
import { formatarPreco } from "@/lib/formatar";

export async function generateStaticParams() {
  const c = await catalogo();
  return c.getMarcas().flatMap((m) => c.getProdutosDaMarca(m.id).map((p) => ({ marca: m.slug, produto: p.slug })));
}

export async function generateMetadata({ params }: PageProps<"/marcas/[marca]/[produto]">): Promise<Metadata> {
  const { marca, produto } = await params;
  const achado = (await catalogo()).getProduto(marca, produto);
  return { title: achado ? `${achado.produto.nome} · ${achado.marca.nome}` : "Produto não encontrado" };
}

async function Conteudo({ params }: { params: PageProps<"/marcas/[marca]/[produto]">["params"] }) {
  const { marca: marcaSlug, produto: produtoSlug } = await params;
  const c = await catalogo();
  const achado = c.getProduto(marcaSlug, produtoSlug);
  if (!achado) notFound();
  const { marca, produto } = achado;
  // Outras peças da mesma marca (até 8). Se a marca só tiver esta peça, a seção não aparece.
  const variacoes = await getVariacoesDoProduto(produto.id);
  const daMarca = c.getProdutosDaMarca(marca.id).filter((p) => p.id !== produto.id);
  const combina = daMarca.slice(0, 8);
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

      <div className="mt-8 grid items-start gap-10 md:grid-cols-[minmax(0,1.25fr)_minmax(0,26rem)] md:gap-16">
        <GaleriaProduto fotos={fotos} nomeTransicao={`produto-${produto.id}`} />

        <div className="flex flex-col gap-6 md:sticky md:top-28 md:self-start">
          <div className="flex flex-col gap-2">
            <Link href={`/marcas/${marca.slug}`} className="self-start text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
              <NomeMarca marca={marca} className="text-lg" />
            </Link>
            <h1 className="font-display text-4xl font-light tracking-tight sm:text-5xl">{produto.nome}</h1>
            <p className="text-xl tabular-nums">{formatarPreco(produto.precoCentavos)}</p>
          </div>
          <p className="leading-relaxed text-muted-foreground">{produto.descricao}</p>
          {produto.detalhes.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Detalhes">
              {produto.detalhes.map((d) => <li key={d} className="rounded-[2px] border border-border px-3 py-1 text-xs text-muted-foreground">{d}</li>)}
            </ul>
          )}
          <SeletorProduto nome={produto.nome} imagem={produto.imagens.frente} tamanhos={produto.tamanhos} cores={produto.cores} variacoes={variacoes} />
          <div className="border-t border-border pt-6">
            <SelosConfianca compacto />
          </div>
        </div>
      </div>

      {combina.length > 0 && (
        <div className="mt-24 border-t border-border pt-14">
          <CarrosselProdutos
            titulo="Combine com"
            acao={<Link href={`/marcas/${marca.slug}`} className="rotulo linha-crescente hidden pb-1 text-muted-foreground hover:text-foreground hover:[background-size:100%_1px] sm:inline-flex">Ver tudo da {marca.nome}</Link>}
          >
            {combina.map((p) => (
              <li key={p.id}>
                <CardProduto produto={p} marcaSlug={marca.slug} precoFormatado={formatarPreco(p.precoCentavos)} />
              </li>
            ))}
          </CarrosselProdutos>
        </div>
      )}
    </div>
  );
}

function Esqueleto() {
  return (
    <div aria-busy="true" aria-label="Carregando produto" className="mx-auto grid w-full max-w-6xl gap-10 px-4 pb-20 pt-14 sm:px-6 md:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
      <div className="mx-auto aspect-[200/310] w-full max-w-md animate-pulse bg-muted" />
      <div className="flex flex-col gap-4">
        <div className="h-5 w-32 animate-pulse bg-muted" />
        <div className="h-12 w-64 animate-pulse bg-muted" />
        <div className="h-6 w-24 animate-pulse bg-muted" />
        <div className="mt-6 h-40 w-full animate-pulse bg-muted/70" />
      </div>
    </div>
  );
}

// A moldura da página aparece na hora; o que depende do endereço carrega dentro do Suspense.
export default function PaginaProduto({ params }: PageProps<"/marcas/[marca]/[produto]">) {
  return (
    <Suspense fallback={<Esqueleto />}>
      <Conteudo params={params} />
    </Suspense>
  );
}
