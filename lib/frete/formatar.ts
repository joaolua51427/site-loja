/** 01310100 → 01310-100 (aceita digitação parcial). */
export function mascaraCep(valor: string) {
  const d = valor.replace(/\D/g, "").slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export function prazoEmDiasUteis(min: number, max: number) {
  if (max <= 1) return "até 1 dia útil";
  if (min === max) return `${max} dias úteis`;
  return `de ${min} a ${max} dias úteis`;
}
