import { Gem, ShieldCheck, Truck } from "lucide-react";

// Somente compromissos que a loja já declara na bio do Instagram.
const SELOS = [
  { icone: Gem, titulo: "Moda masculina refinada", texto: "Peças escolhidas uma a uma." },
  { icone: Truck, titulo: "Envio para todo o Brasil", texto: "Do pedido até a sua porta." },
  { icone: ShieldCheck, titulo: "Segurança e qualidade", texto: "Nossa referência em cada etapa." },
];

export function SelosConfianca({ compacto = false }: { compacto?: boolean }) {
  return (
    <ul className={compacto ? "grid gap-4" : "grid gap-px border border-border bg-border sm:grid-cols-3"}>
      {SELOS.map(({ icone: Icone, titulo, texto }, i) => (
        <li
          key={titulo}
          className={compacto ? "flex items-start gap-3" : "revelar-cascata flex flex-col items-center gap-3 bg-background px-6 py-10 text-center"}
          style={compacto ? undefined : { ["--i" as string]: i }}
        >
          <Icone aria-hidden="true" strokeWidth={1.25} className={compacto ? "mt-0.5 size-4 shrink-0 text-egeu" : "size-7 text-egeu"} />
          <span className="flex flex-col gap-1">
            <span className={compacto ? "text-sm font-medium" : "rotulo"}>{titulo}</span>
            <span className="text-sm text-muted-foreground">{texto}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
