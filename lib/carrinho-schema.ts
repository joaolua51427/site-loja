import { z } from "zod";

// O que o navegador pode enviar sobre o carrinho: só IDs, variação e quantidade.
// Preço, total, frete e desconto NUNCA vêm daqui; o servidor calcula.
export const itemCarrinhoSchema = z.object({
  produtoId: z.uuid(),
  tamanho: z.string().min(1).max(8),
  cor: z.string().min(1).max(40),
  quantidade: z.number().int().min(1).max(10),
});

export const carrinhoSchema = z.array(itemCarrinhoSchema).max(30);

export type ItemCarrinho = z.infer<typeof itemCarrinhoSchema>;
