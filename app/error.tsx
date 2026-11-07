"use client";

// Mensagem genérica para o cliente; detalhes técnicos ficam só nos logs do servidor.
export default function Erro({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-display text-5xl font-medium tracking-tight">Algo deu errado</h1>
      <p className="max-w-[40ch] text-muted-foreground">Não conseguimos carregar esta página. Tente de novo em instantes.</p>
      <button type="button" onClick={reset} className="mt-2 inline-flex min-h-11 items-center rounded-full bg-foreground px-6 text-sm font-medium text-background outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">Tentar de novo</button>
    </main>
  );
}
