import Link from "next/link";

export default function NaoEncontrado() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">Erro 404</p>
      <h1 className="font-display text-5xl font-light tracking-tight">Página não encontrada</h1>
      <p className="max-w-[40ch] text-muted-foreground">O endereço pode ter mudado ou a peça saiu do varal.</p>
      <Link href="/marcas" className="mt-2 inline-flex min-h-11 items-center rounded-none bg-foreground px-6 rotulo text-background outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">Ver marcas</Link>
    </main>
  );
}
