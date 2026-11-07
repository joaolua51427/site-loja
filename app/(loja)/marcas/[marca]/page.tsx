import type { Metadata } from "next";
import { Suspense, ViewTransition } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CardProduto } from "@/components/loja/card-produto";
import { NomeMarca } from "@/components/loja/nome-marca";
import { Varal, type PecaVaral } from "@/components/loja/varal";
import { catalogo } from "@/lib/catalogo";
import { formatarPreco } from "@/lib/formatar";

export async function generateStaticParams() {
  return (await catalogo()).getMarcas().map((m) => ({ marca: m.slug }));
}

export async function generateMetadata({ params }: PageProps<"/marcas/[marca]">): Promise<Metadata> {
  const { marca: slug } = await params;
  const marca = (await catalogo()).getMarca(slug);
  return { title: marca ? marca.nome : "Marca não encontrada" };
}

async function Conteudo({ params }: { params: PageProps<"/marcas/[marca]">["params"] }) {
  const { marca: slug } = await params;
  const c = await catalogo();
  const marca = c.getMarca(slug);
  if (!marca) notFound();
  const produtos = c.getProdutosDaMarca(marca.id);

  const pecas: PecaVaral[] = produtos.map((p) => ({
    id: p.id,
    slug: p.slug,
    nome: p.nome,
    descricao: p.descricao,
    imagem: p.imagens.frente,
    imagemCostas: p.imagens.costas,
    cor: p.cores[0].hex,
    etiqueta: formatarPreco(p.precoCentavos),
  }));

  return (
    <div className="animate-in fade-in [animation-duration:500ms] motion-reduce:animate-none">
      <nav aria-label="Você está em" className="mx-auto w-full max-w-6xl px-4 pt-6 text-sm text-muted-foreground sm:px-6">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href="/marcas" className="underline-offset-4 hover:text-foreground hover:underline">Marcas</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">{marca.nome}</li>
        </ol>
      </nav>

      <div className="mx-auto mt-6 flex w-full max-w-6xl flex-col items-center gap-2 px-4 text-center sm:px-6">
        <h1><ViewTransition name={`marca-${marca.slug}`}><NomeMarca marca={marca} className="inline-block text-5xl sm:text-6xl" /></ViewTransition></h1>
        <p className="max-w-[48ch] text-sm leading-relaxed text-muted-foreground">{marca.descricao}</p>
      </div>

      {pecas.length > 0 ? (
        <Varal marcaSlug={marca.slug} pecas={pecas} titulo={`O varal da ${marca.nome}`} rotuloAcao="Ver coleção" hrefAcao="#colecao" />
      ) : (
        <p className="py-20 text-center text-muted-foreground">Esta marca ainda não tem peças no varal.</p>
      )}

      <section id="colecao" aria-labelledby="titulo-colecao" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 pb-20 pt-6 sm:px-6">
        <h2 id="titulo-colecao" className="mb-6 font-display text-3xl font-light tracking-tight">Coleção completa</h2>
        <ul className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {produtos.map((p, i) => (
            <li key={p.id} className="revelar-cascata" style={{ ["--i" as string]: i % 4 }}><CardProduto produto={p} marcaSlug={marca.slug} precoFormatado={formatarPreco(p.precoCentavos)} /></li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Esqueleto() {
  return (
    <div aria-busy="true" aria-label="Carregando marca" className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-4 py-16 sm:px-6">
      <div className="h-14 w-72 animate-pulse bg-muted" />
      <div className="h-4 w-96 max-w-full animate-pulse bg-muted" />
      <div className="mt-6 h-[420px] w-full animate-pulse bg-muted/60" />
    </div>
  );
}

// A moldura da página aparece na hora; o que depende do endereço carrega dentro do Suspense.
export default function PaginaMarca({ params }: PageProps<"/marcas/[marca]">) {
  return (
    <Suspense fallback={<Esqueleto />}>
      <Conteudo params={params} />
    </Suspense>
  );
}
