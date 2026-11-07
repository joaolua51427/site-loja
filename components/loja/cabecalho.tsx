import Link from "next/link";

import { CabecalhoRolagem } from "@/components/loja/cabecalho-rolagem";
import { ContadorCarrinho } from "@/components/loja/contador-carrinho";
import { LinkConta } from "@/components/loja/link-conta";
import { Logotipo } from "@/components/loja/logotipo";
import { Navegacao, type ItemBusca, type ItemMenuMarca } from "@/components/loja/navegacao";
import { catalogo } from "@/lib/catalogo";
import { formatarPreco } from "@/lib/formatar";

export async function Cabecalho({ nomeLoja }: { nomeLoja: string }) {
  const { getMarcaPorId, getMarcas, getProdutosDaMarca, getTodosProdutos } = await catalogo();
  // Só dados públicos vão para o navegador: nome, coleção, foto e preço formatado.
  const marcas: ItemMenuMarca[] = getMarcas().map((m) => ({ nome: m.nome, slug: m.slug, total: getProdutosDaMarca(m.id).length }));
  const produtos: ItemBusca[] = getTodosProdutos().map((p) => {
    const marca = getMarcaPorId(p.marcaId);
    return { id: p.id, nome: p.nome, marca: marca?.nome ?? "", href: `/marcas/${marca?.slug}/${p.slug}`, imagem: p.imagens.frente, preco: formatarPreco(p.precoCentavos) };
  });
  // Destaque: a primeira peça de cada uma das três primeiras coleções.
  const destaques = getMarcas().slice(0, 3).map((m) => produtos.find((p) => p.href.startsWith(`/marcas/${m.slug}/`))).filter((p): p is ItemBusca => Boolean(p));

  return (
    <CabecalhoRolagem>
      <header className="relative border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto grid h-20 w-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6">
          <Navegacao marcas={marcas} produtos={produtos} destaques={destaques} />
          <Link href="/" aria-label={`${nomeLoja}, início`} className="outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Logotipo nome={nomeLoja} />
          </Link>
          <div className="flex items-center justify-end gap-1">
            <LinkConta />
            <ContadorCarrinho />
          </div>
        </div>
      </header>
    </CabecalhoRolagem>
  );
}
