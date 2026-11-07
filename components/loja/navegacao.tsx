"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";

export type ItemMenuMarca = { nome: string; slug: string; total: number };
export type ItemBusca = { id: string; nome: string; marca: string; href: string; imagem: string; preco: string };

const linkBase =
  "rotulo linha-crescente inline-flex min-h-11 items-center gap-2 px-2 outline-none transition-colors hover:text-egeu hover:[background-size:100%_1px] focus-visible:ring-2 focus-visible:ring-ring";

/** Remove acentos e caixa para a busca achar "hermes" em "Hermès". */
function normalizar(t: string) {
  return t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function Navegacao({ marcas, produtos, destaques }: { marcas: ItemMenuMarca[]; produtos: ItemBusca[]; destaques: ItemBusca[] }) {
  const [painel, setPainel] = React.useState(false);
  const busca = React.useRef<HTMLDialogElement>(null);
  const campoBusca = React.useRef<HTMLInputElement>(null);
  const gaveta = React.useRef<HTMLDialogElement>(null);
  const caixaPainel = React.useRef<HTMLDivElement>(null);
  const botaoPainel = React.useRef<HTMLButtonElement>(null);
  const caminho = usePathname();

  // Fecha tudo ao trocar de página.
  const [caminhoAnterior, setCaminhoAnterior] = React.useState(caminho);
  if (caminho !== caminhoAnterior) {
    setCaminhoAnterior(caminho);
    setPainel(false);
  }
  React.useEffect(() => {
    busca.current?.close();
    gaveta.current?.close();
  }, [caminho]);

  // Atalhos: "/" ou Ctrl/Cmd+K abrem a busca; Esc fecha o painel de coleções.
  React.useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      const digitando = (e.target as HTMLElement | null)?.closest("input, textarea, [contenteditable]");
      if ((e.key === "/" && !digitando) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        abrirBusca();
      }
      if (e.key === "Escape" && painel) {
        setPainel(false);
        botaoPainel.current?.focus();
      }
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [painel]);

  // Clique fora fecha o painel.
  React.useEffect(() => {
    if (!painel) return;
    const fora = (e: PointerEvent) => {
      if (!caixaPainel.current?.contains(e.target as Node) && !botaoPainel.current?.contains(e.target as Node)) setPainel(false);
    };
    document.addEventListener("pointerdown", fora);
    return () => document.removeEventListener("pointerdown", fora);
  }, [painel]);

  function abrirBusca() {
    gaveta.current?.close();
    setPainel(false);
    if (!busca.current?.open) busca.current?.showModal();
    // Leva o cursor direto para o campo de busca.
    requestAnimationFrame(() => campoBusca.current?.focus());
  }

  return (
    <>
      {/* Computador */}
      <nav aria-label="Principal" className="hidden items-center gap-2 md:flex">
        <button
          ref={botaoPainel}
          type="button"
          aria-expanded={painel}
          aria-controls="painel-colecoes"
          onClick={() => setPainel((v) => !v)}
          className={cn(linkBase, painel && "text-egeu [background-size:100%_1px]")}
        >
          Coleções
        </button>
        <button type="button" onClick={abrirBusca} className={linkBase} aria-label="Buscar peças (atalho: /)">
          <Search aria-hidden="true" className="size-4" strokeWidth={1.5} />
          Buscar
        </button>
      </nav>

      {/* Celular */}
      <div className="flex items-center gap-1 md:hidden">
        <button type="button" onClick={() => gaveta.current?.showModal()} aria-label="Abrir menu" className="inline-flex size-11 items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Menu aria-hidden="true" className="size-5" strokeWidth={1.5} />
        </button>
        <button type="button" onClick={abrirBusca} aria-label="Buscar peças" className="inline-flex size-11 items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Search aria-hidden="true" className="size-5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Painel de coleções (computador) */}
      <div
        id="painel-colecoes"
        ref={caixaPainel}
        hidden={!painel}
        className="absolute inset-x-0 top-full z-40 hidden border-b border-border bg-background shadow-[0_30px_60px_-40px_color-mix(in_oklab,var(--color-foreground)_50%,transparent)] md:block"
      >
        <div className="mx-auto grid w-full max-w-6xl animate-in fade-in slide-in-from-top-2 grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-12 px-6 py-10 [animation-duration:350ms] motion-reduce:animate-none">
          <div className="flex flex-col gap-4">
            <p className="rotulo text-muted-foreground">Coleções</p>
            <ul className="flex flex-col">
              {marcas.map((m, i) => (
                <li key={m.slug} className="animate-in fade-in slide-in-from-left-2 fill-mode-both motion-reduce:animate-none" style={{ animationDelay: `${60 + i * 40}ms`, animationDuration: "400ms" }}>
                  <Link href={`/marcas/${m.slug}`} className="group flex items-baseline justify-between gap-4 border-b border-border/70 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <span className="font-display text-2xl font-light transition-[transform,color] duration-300 group-hover:translate-x-2 group-hover:text-egeu motion-reduce:transition-none">{m.nome}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{m.total} {m.total === 1 ? "peça" : "peças"}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/marcas" className="rotulo linha-crescente mt-2 inline-flex items-center gap-2 self-start pb-1 hover:[background-size:100%_1px]">
              Ver todas <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            <p className="rotulo text-muted-foreground">Em destaque</p>
            <ul className="grid grid-cols-3 gap-4">
              {destaques.map((p, i) => (
                <li key={p.id} className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both motion-reduce:animate-none" style={{ animationDelay: `${120 + i * 70}ms`, animationDuration: "450ms" }}>
                  <Link href={p.href} data-cursor="Ver" className="group flex flex-col gap-2 outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <span className="relative block aspect-[200/310] overflow-hidden bg-muted/70">
                      <Image src={p.imagem} alt="" fill sizes="12rem" className="object-contain p-3 transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none" />
                    </span>
                    <span className="text-xs text-muted-foreground">{p.marca}</span>
                    <span className="text-sm">{p.nome}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Gaveta refDialog={gaveta} marcas={marcas} aoBuscar={abrirBusca} />
      <Busca refDialog={busca} refCampo={campoBusca} produtos={produtos} />
    </>
  );
}

function Gaveta({ refDialog, marcas, aoBuscar }: { refDialog: React.RefObject<HTMLDialogElement | null>; marcas: ItemMenuMarca[]; aoBuscar: () => void }) {
  return (
    <dialog
      ref={refDialog}
      aria-label="Menu"
      onKeyDown={(e) => { if (e.key === "Escape") { e.preventDefault(); refDialog.current?.close(); } }}
      onClick={(e) => { if (e.target === e.currentTarget) e.currentTarget.close(); }}
      className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-[min(22rem,88vw)] max-w-none bg-background p-0 text-foreground backdrop:bg-black/40 backdrop:backdrop-blur-sm open:animate-in open:slide-in-from-left open:[animation-duration:350ms] motion-reduce:open:animate-none"
    >
      <div className="flex h-full flex-col gap-8 p-6">
        <div className="flex items-center justify-between">
          <p className="rotulo text-muted-foreground">Menu</p>
          <button type="button" onClick={() => refDialog.current?.close()} aria-label="Fechar menu" className="inline-flex size-11 items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <X aria-hidden="true" className="size-5" strokeWidth={1.5} />
          </button>
        </div>
        <button type="button" onClick={aoBuscar} className="flex min-h-12 items-center gap-3 border border-border px-4 text-left text-sm text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Search aria-hidden="true" className="size-4" strokeWidth={1.5} /> Buscar peças
        </button>
        <nav aria-label="Coleções" className="flex flex-col">
          <p className="rotulo mb-2 text-muted-foreground">Coleções</p>
          {marcas.map((m) => (
            <Link key={m.slug} href={`/marcas/${m.slug}`} className="flex items-baseline justify-between border-b border-border/70 py-3 outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span className="font-display text-2xl font-light">{m.nome}</span>
              <span className="text-xs text-muted-foreground">{m.total}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2">
          <Link href="/marcas" className="rotulo py-2">Todas as coleções</Link>
          <Link href="/carrinho" className="rotulo py-2">Carrinho</Link>
        </div>
      </div>
    </dialog>
  );
}

function Busca({ refDialog, refCampo, produtos }: { refDialog: React.RefObject<HTMLDialogElement | null>; refCampo: React.RefObject<HTMLInputElement | null>; produtos: ItemBusca[] }) {
  const [termo, setTermo] = React.useState("");
  const id = React.useId();
  const t = normalizar(termo.trim());
  const resultados = t ? produtos.filter((p) => normalizar(`${p.nome} ${p.marca}`).includes(t)).slice(0, 8) : produtos.slice(0, 4);

  return (
    <dialog
      ref={refDialog}
      aria-labelledby={`${id}-titulo`}
      onClick={(e) => { if (e.target === e.currentTarget) e.currentTarget.close(); }}
      onClose={() => setTermo("")}
      onKeyDown={(e) => { if (e.key === "Escape") { e.preventDefault(); refDialog.current?.close(); } }}
      className="fixed inset-x-0 top-0 m-0 mx-auto mt-[8vh] w-[min(40rem,calc(100vw-2rem))] max-w-none bg-background p-0 text-foreground shadow-2xl backdrop:bg-black/45 backdrop:backdrop-blur-sm open:animate-in open:fade-in open:zoom-in-95 open:[animation-duration:250ms] motion-reduce:open:animate-none"
    >
      <h2 id={`${id}-titulo`} className="sr-only">Buscar peças</h2>
      <div className="flex items-center gap-3 border-b border-border px-5">
        <Search aria-hidden="true" className="size-4 text-muted-foreground" strokeWidth={1.5} />
        <input
          ref={refCampo}
          type="search"
          value={termo}
          onChange={(e) => setTermo(e.target.value.slice(0, 60))}
          placeholder="Busque por peça ou coleção"
          aria-label="Busque por peça ou coleção"
          aria-controls={`${id}-lista`}
          className="h-16 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
        />
        <button type="button" onClick={() => refDialog.current?.close()} className="rotulo px-2 py-2 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">Esc</button>
      </div>
      <p className="rotulo px-5 pt-4 text-muted-foreground" aria-live="polite">
        {t ? (resultados.length ? `${resultados.length} ${resultados.length === 1 ? "resultado" : "resultados"}` : "Nenhuma peça encontrada") : "Sugestões"}
      </p>
      <ul id={`${id}-lista`} className="max-h-[60vh] overflow-y-auto p-3">
        {resultados.map((p) => (
          <li key={p.id}>
            <Link href={p.href} onClick={() => refDialog.current?.close()} className="flex items-center gap-4 p-2 outline-none transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
              <span className="relative aspect-[200/310] w-12 shrink-0 bg-muted/70">
                <Image src={p.imagem} alt="" fill sizes="3rem" className="object-contain p-1" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-xs text-muted-foreground">{p.marca}</span>
                <span className="truncate text-sm">{p.nome}</span>
              </span>
              <span className="text-sm tabular-nums">{p.preco}</span>
            </Link>
          </li>
        ))}
      </ul>
    </dialog>
  );
}
