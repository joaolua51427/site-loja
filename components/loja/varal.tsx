"use client";

import { useRouter } from "next/navigation";

import ClothingRailHero, { type RailGarment } from "@/components/ui/product-rail-gallery";

export type PecaVaral = {
  id: string;
  slug: string;
  nome: string;
  descricao: string;
  imagem: string;
  imagemCostas?: string;
  cor: string;
  /** Preço já formatado pelo servidor. É só a etiqueta visual; o carrinho recalcula no servidor. */
  etiqueta: string;
};

/** Varal de uma marca: clicar numa peça abre a página do produto. */
export function Varal({ marcaSlug, pecas, titulo, rotuloAcao, hrefAcao }: {
  marcaSlug: string;
  pecas: PecaVaral[];
  titulo: string;
  rotuloAcao: string;
  hrefAcao: string;
}) {
  const router = useRouter();
  const itens: RailGarment[] = pecas.map((p) => ({
    id: p.slug,
    name: p.nome,
    description: p.descricao,
    image: p.imagem,
    backImage: p.imagemCostas,
    color: p.cor,
    tag: p.etiqueta,
  }));

  return (
    <ClothingRailHero
      items={itens}
      hanger="matte"
      eyebrow="Nova coleção"
      heading={titulo}
      caption="Passe o mouse pelo varal ou deslize. Clique numa peça para ver tamanhos e cores."
      labels={{ front: "Frente", back: "Costas", close: "Fechar", show: "Mostrar" }}
      autoplay
      onItemOpen={(item) => router.push(`/marcas/${marcaSlug}/${item.id}`)}
      action={
        <a href={hrefAcao} className="inline-flex min-h-12 items-center rounded-none bg-foreground px-10 rotulo text-background shadow-sm outline-none transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none">
          {rotuloAcao}
        </a>
      }
    />
  );
}
