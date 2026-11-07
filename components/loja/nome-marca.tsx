import { cn } from "@/lib/utils";

import type { Marca } from "@/lib/catalogo-schema";

// Nome da marca em texto estilizado. Não usamos logos oficiais: quando houver
// arquivo próprio e autorizado, basta preencher "logo" nos dados.
const ESTILOS: Record<Marca["estilo"], string> = {
  serifa: "font-display font-medium tracking-tight",
  "caixa-alta": "font-sans font-semibold uppercase tracking-[0.32em]",
  italico: "font-display italic tracking-tight",
};

export function NomeMarca({ marca, className }: { marca: Pick<Marca, "nome" | "estilo">; className?: string }) {
  return <span className={cn(ESTILOS[marca.estilo], className)}>{marca.nome}</span>;
}
