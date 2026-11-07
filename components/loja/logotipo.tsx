import { cn } from "@/lib/utils";

/**
 * Logotipo em texto: "KYANO" em serifa fina e "COLLETION" pequeno entre dois filetes.
 * O espaçamento entre letras deixa uma sobra depois da última letra; a margem negativa
 * igual ao espaçamento (mr-[-…em]) compensa, para o nome ficar exatamente centralizado.
 */
export function Logotipo({ nome, tamanho = "md", animado = false, className }: { nome: string; tamanho?: "md" | "xl"; animado?: boolean; className?: string }) {
  const [principal, ...resto] = nome.split(" ");
  const xl = tamanho === "xl";
  return (
    <span className={cn("inline-flex flex-col items-center leading-none", className)}>
      <span
        className={cn(
          "font-display font-light uppercase",
          xl ? "mr-[-0.2em] text-[clamp(3.75rem,14vw,9.5rem)] tracking-[0.2em]" : "mr-[-0.24em] text-[1.65rem] tracking-[0.24em]",
        )}
      >
        {animado ? (
          <>
            <span className="sr-only">{principal}</span>
            <span aria-hidden="true">
              {principal.split("").map((letra, i) => (
                <span key={i} className="inline-block motion-safe:animate-[letra_1100ms_cubic-bezier(.2,.7,.2,1)_both]" style={{ animationDelay: `${450 + i * 110}ms` }}>
                  {letra}
                </span>
              ))}
            </span>
          </>
        ) : (
          principal
        )}
      </span>
      {resto.length > 0 && (
        <span className={cn("flex items-center", xl ? "mt-5 gap-4" : "mt-1.5 gap-2")}>
          <span aria-hidden="true" className={cn("h-px bg-current opacity-60", xl ? "w-10 sm:w-16" : "w-3")} />
          <span className={cn("font-sans font-medium uppercase", xl ? "mr-[-0.55em] text-[0.7rem] tracking-[0.55em] sm:text-xs" : "mr-[-0.45em] text-[7px] tracking-[0.45em]")}>
            {resto.join(" ")}
          </span>
          <span aria-hidden="true" className={cn("h-px bg-current opacity-60", xl ? "w-10 sm:w-16" : "w-3")} />
        </span>
      )}
    </span>
  );
}
