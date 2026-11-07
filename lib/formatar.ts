const reais = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** 8990 → "R$ 89,90" */
export function formatarPreco(centavos: number) {
  return reais.format(centavos / 100);
}
