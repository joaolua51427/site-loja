/** Aceita só caminhos internos ("/carrinho"), nunca outro site ("//site.com", "https://..."). */
export function destinoSeguro(valor: unknown, padrao = "/marcas") {
  if (typeof valor !== "string") return padrao;
  if (!valor.startsWith("/") || valor.startsWith("//") || valor.includes("\\") || valor.length > 200) return padrao;
  return valor;
}
