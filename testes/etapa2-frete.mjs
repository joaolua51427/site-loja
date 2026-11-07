// Testes da Etapa 2 (CEP e frete).
// Uso: node testes/etapa2-frete.mjs            (servidor normal)
//      MODO=api-fora node testes/etapa2-frete.mjs  (servidor iniciado com MELHOR_ENVIO_TOKEN inválido)
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const env = Object.fromEntries(readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]));
const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const MODO = process.env.MODO ?? "normal";
let falhas = 0;
const ok = (c, n) => { console.log(`${c ? "✅" : "❌"} ${n}`); if (!c) falhas++; };
const brl = (c) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(c / 100).replace(/\s/g, " ");
const norm = (t) => t.replace(/\s/g, " ");

const api = async (c) => (await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${c}`, { headers: { apikey: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY } })).json();
const [config] = await api("configuracoes?select=frete_gratis_acima_centavos");
const [tabelaSP] = await api("frete_tabela?select=valor_centavos&uf=eq.SP");
const vars = await api("variacoes?select=id,estoque,produto:produtos(slug,preco_centavos)&estoque=gt.1&limit=200");
const barata = vars.filter((v) => v.produto.preco_centavos < config.frete_gratis_acima_centavos).sort((a, b) => a.produto.preco_centavos - b.produto.preco_centavos)[0];
const cara = vars.find((v) => v.produto.preco_centavos >= config.frete_gratis_acima_centavos);

const nav = await chromium.launch();
const p = await (await nav.newContext()).newPage();

if (MODO === "normal") {
  // Página do produto: CEP inválido e inexistente.
  await p.goto(`${BASE}/marcas/zegna/triple-stitch-camurca-marinho`, { waitUntil: "networkidle" });
  const campo = p.getByLabel("CEP").first();
  await campo.fill("123");
  ok(await p.getByRole("button", { name: "Calcular" }).first().isDisabled(), "CEP incompleto não deixa calcular");
  ok((await campo.inputValue()) === "123", "Máscara aceita só números");
  await campo.fill("99999999"); await p.getByRole("button", { name: "Calcular" }).first().click(); await p.waitForTimeout(2500);
  ok(await p.locator("text=Não encontramos esse CEP").count() > 0, "CEP inexistente mostra erro claro");
  await campo.fill("01310100"); await p.getByRole("button", { name: "Calcular" }).first().click(); await p.waitForTimeout(3000);
  ok((await campo.inputValue()) === "01310-100", "Máscara formata 00000-000");
  ok(await p.locator("text=São Paulo/SP").count() > 0, "Endereço preenchido pelo ViaCEP (São Paulo/SP)");
  ok(await p.locator("text=dias úteis").count() > 0, "Prazo em dias úteis aparece");

  // Carrinho abaixo do limite: frete pago, total = subtotal + frete.
  await p.evaluate((id) => localStorage.setItem("kyano:carrinho:v2", JSON.stringify([{ variacaoId: id, quantidade: 1 }])), barata.id);
  await p.goto(`${BASE}/carrinho`, { waitUntil: "networkidle" }); await p.waitForTimeout(3500);
  const frete = norm(await p.locator("aside dl div:nth-child(2) dd").innerText());
  const total = norm(await p.locator("aside dl div:nth-child(3) dd").innerText());
  ok(frete === brl(tabelaSP.valor_centavos), `Frete SP da tabela aplicado (${frete})`);
  ok(total === brl(barata.produto.preco_centavos + tabelaSP.valor_centavos), `Total = subtotal + frete (${total})`);

  // Adulteração: opção inexistente e "preço" na sessão são ignorados.
  await p.evaluate(() => sessionStorage.setItem("kyano:frete", JSON.stringify({ cep: "01310100", opcaoId: "falsa", precoCentavos: 0 })));
  await p.reload({ waitUntil: "networkidle" }); await p.waitForTimeout(3500);
  ok(norm(await p.locator("aside dl div:nth-child(2) dd").innerText()) === brl(tabelaSP.valor_centavos), "Opção/preço de frete adulterados são ignorados pelo servidor");

  // Acima do limite: frete grátis.
  await p.evaluate((id) => localStorage.setItem("kyano:carrinho:v2", JSON.stringify([{ variacaoId: id, quantidade: 1 }])), cara.id);
  await p.reload({ waitUntil: "networkidle" }); await p.waitForTimeout(3500);
  ok(norm(await p.locator("aside dl div:nth-child(2) dd").innerText()) === "Grátis", `Frete grátis acima de ${brl(config.frete_gratis_acima_centavos)} (configurado no banco)`);

  // Limite de tentativas na calculadora.
  await p.goto(`${BASE}/marcas/zegna/triple-stitch-camurca-marinho`, { waitUntil: "networkidle" });
  let bloqueou = false;
  for (let i = 0; i < 24 && !bloqueou; i++) {
    await p.getByRole("button", { name: /Calcular/ }).first().click();
    await p.waitForTimeout(350);
    bloqueou = (await p.locator("text=Muitas consultas seguidas").count()) > 0;
  }
  ok(bloqueou, "Rate limit bloqueia excesso de consultas de frete");
} else {
  // Servidor com token inválido do Melhor Envio: deve cair na tabela e avisar.
  await p.goto(`${BASE}/marcas/zegna/triple-stitch-camurca-marinho`, { waitUntil: "networkidle" });
  await p.getByLabel("CEP").first().fill("20040002"); await p.getByRole("button", { name: "Calcular" }).first().click(); await p.waitForTimeout(6000);
  ok(await p.locator("text=indisponível agora").count() > 0, "API de frete fora do ar: cliente é avisado");
  ok(await p.locator("text=Entrega padrão").count() > 0, "API de frete fora do ar: usa a tabela por UF (plano B)");
}

await nav.close();
console.log(falhas ? `\n${falhas} teste(s) falharam.` : "\nTodos os testes passaram.");
process.exit(falhas ? 1 : 0);
