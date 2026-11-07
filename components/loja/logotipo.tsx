import { cn } from "@/lib/utils";

/** Logotipo em texto, no estilo do perfil: "KYANO" fino e espaçado, "COLLETION" pequeno embaixo. */
export function Logotipo({ nome, tamanho = "md", className }: { nome: string; tamanho?: "md" | "xl"; className?: string }) {
  const [principal, ...resto] = nome.split(" ");
  return (
    <span className={cn("inline-flex flex-col items-center leading-none", className)}>
      <span
        className={cn(
          "font-display font-light uppercase",
          tamanho === "xl" ? "pl-[0.32em] text-7xl tracking-[0.32em] sm:text-9xl" : "pl-[0.3em] text-2xl tracking-[0.3em]",
        )}
      >
        {principal}
      </span>
      {resto.length > 0 && (
        <span className={cn("font-sans font-medium uppercase", tamanho === "xl" ? "mt-4 pl-[0.6em] text-xs tracking-[0.6em] sm:text-sm" : "mt-1 pl-[0.5em] text-[8px] tracking-[0.5em]")}>
          {resto.join(" ")}
        </span>
      )}
    </span>
  );
}
