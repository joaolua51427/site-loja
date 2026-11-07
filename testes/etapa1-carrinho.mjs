// Testes da Etapa 1 (carrinho). Tentam quebrar as regras do CLAUDE.md.
// Uso:  BASE_URL=http://localhost:3100 EMAIL_A=... EMAIL_B=... SENHA_TESTE=... node testes/etapa1-carrinho.mjs
// Requer Playwright (já disponível no ambiente de desenvolvimento) e as variáveis do .env.local.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const env = Object.fromEntries(readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]));
const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const { EMAIL_A, EMAIL_B, SENHA_TESTE } = process.env;
const SB = env.NEXT_PUBLIC_SUPABASE_URL, CHAVE = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const CHAVE_CARRINHO = "kyano:carrinho:v2";

let falhas = 0;
const ok = (cond, nome) => { console.log(`${cond ? "✅" : "❌"} ${nome}`); if (!cond) falhas++; };

async function rest(caminho) {
  const r = await fetch(`${SB}/rest/v1/${caminho}`, { headers: { apikey: CHAVE, Authorization: `Bearer ${CHAVE}` } });
  return { status: r.status, dados: await r.json().catch(() => null) };
}

// Variações reais, lidas da API pública (só leitura).
const { dados: vars } = await rest("variacoes?select=id,tamanho,cor,estoque,produto:produtos(slug,preco_centavos,marca:marcas(slug))&limit=200");
const ultima = vars.find((v) => v.produto.slug === "triple-stitch-camurca-marinho" && v.tamanho === "42");
const comEstoque = vars.find((v) => v.estoque >= 3 && v.id !== ultima.id);
const precoUltima = ultima.produto.preco_centavos;

const navegador = await chromium.launch();
const brl = (c) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(c / 100).replace(/\s/g, " ");
const texto = async (p, sel) => (await p.locator(sel).innerText()).replace(/\s/g, " ");

// 1) Visitante: adiciona a última unidade e tenta passar do estoque.
{
  const ctx = await navegador.newContext(); const p = await ctx.newPage();
  await p.goto(`${BASE}/marcas/zegna/triple-stitch-camurca-marinho`, { waitUntil: "networkidle" });
  await p.locator("label", { hasText: /^42$/ }).first().click();
  await p.getByRole("button", { name: "Adicionar ao carrinho" }).click();
  await p.waitForSelector("text=Adicionado ao carrinho");
  await p.getByRole("button", { name: "Adicionar ao carrinho" }).click(); // segunda vez: estoque é 1
  await p.waitForTimeout(800);
  const salvo = await p.evaluate((k) => JSON.parse(localStorage.getItem(k)), CHAVE_CARRINHO);
  ok(salvo.length === 1 && salvo[0].quantidade === 1, "Visitante não passa do estoque (1 unidade) ao adicionar duas vezes");
  ok(!JSON.stringify(salvo).includes("preco"), "Carrinho no navegador não guarda preço");

  // 2) Adulteração: quantidade 10, campo de preço falso e variação inexistente.
  await p.evaluate(([k, id]) => localStorage.setItem(k, JSON.stringify([
    { variacaoId: id, quantidade: 10, precoCentavos: 1 },
    { variacaoId: "00000000-0000-4000-8000-000000000000", quantidade: 1 },
  ])), [CHAVE_CARRINHO, ultima.id]);
  await p.goto(`${BASE}/carrinho`, { waitUntil: "networkidle" }); await p.waitForTimeout(1500);
  const subtotal = await texto(p, 'aside dl div:first-child dd');
  ok(subtotal === brl(precoUltima), `Preço adulterado ignorado: subtotal ${subtotal} = preço do banco ${brl(precoUltima)}`);
  ok(await p.locator("text=só temos 1 em estoque").count() > 0, "Avisa que a quantidade foi limitada pelo estoque");
  ok(await p.locator("text=não está mais disponível").count() > 0, "Avisa e remove variação inexistente");
  const corrigido = await p.evaluate((k) => JSON.parse(localStorage.getItem(k)), CHAVE_CARRINHO);
  ok(corrigido.length === 1 && corrigido[0].quantidade === 1, "Carrinho do navegador corrigido pelo servidor (1 item, quantidade 1)");
  ok(await p.getByRole("button", { name: "Quantidade máxima em estoque" }).isDisabled(), "Botão + desativado no limite do estoque");
  await ctx.close();
}

// 3) Login mescla o carrinho do navegador com o da conta; outra conta não vê.
if (EMAIL_A && EMAIL_B && SENHA_TESTE) {
  const ctxA = await navegador.newContext(); const a = await ctxA.newPage();
  await a.goto(`${BASE}/marcas`, { waitUntil: "networkidle" });
  await a.evaluate(([k, id]) => localStorage.setItem(k, JSON.stringify([{ variacaoId: id, quantidade: 2 }])), [CHAVE_CARRINHO, comEstoque.id]);
  await a.goto(`${BASE}/entrar?voltar=/carrinho`, { waitUntil: "networkidle" });
  await a.getByLabel("E-mail").fill(EMAIL_A); await a.getByLabel("Senha").fill(SENHA_TESTE);
  await a.getByRole("button", { name: "Entrar", exact: true }).last().click();
  await a.waitForURL("**/carrinho"); await a.waitForTimeout(2500);
  const qtdA = await a.locator('[aria-live="polite"].tabular-nums').first().innerText().catch(() => "");
  ok(qtdA.trim() === "2", "Após login, o item do navegador aparece no carrinho da conta (quantidade 2)");
  ok(await a.evaluate((k) => localStorage.getItem(k), CHAVE_CARRINHO) === null, "Carrinho do navegador limpo após mesclar com a conta");

  const ctxB = await navegador.newContext(); const b = await ctxB.newPage();
  await b.goto(`${BASE}/entrar?voltar=/carrinho`, { waitUntil: "networkidle" });
  await b.getByLabel("E-mail").fill(EMAIL_B); await b.getByLabel("Senha").fill(SENHA_TESTE);
  await b.getByRole("button", { name: "Entrar", exact: true }).last().click();
  await b.waitForURL("**/carrinho"); await b.waitForTimeout(2000);
  ok(await b.locator("text=Seu carrinho está vazio").count() > 0, "Outra conta (B) não vê o carrinho da conta A");

  // Sai e volta: o carrinho continua salvo na conta.
  await a.goto(`${BASE}/conta`, { waitUntil: "networkidle" }); await a.waitForTimeout(800);
  await a.getByRole("button", { name: "Sair da conta" }).click(); await a.waitForURL("**/marcas");
  await a.goto(`${BASE}/carrinho`, { waitUntil: "networkidle" }); await a.waitForTimeout(1200);
  ok(await a.locator("text=Seu carrinho está vazio").count() > 0, "Depois de sair, o carrinho do visitante começa vazio");
  await ctxA.close(); await ctxB.close();
} else {
  console.log("⚠️  Testes de login pulados (defina EMAIL_A, EMAIL_B e SENHA_TESTE).");
}

// 4) API direta sem login: não lê carrinhos nem chama a função.
{
  const r = await rest("itens_carrinho?select=*");
  ok(r.status === 401 || r.status === 403 || (Array.isArray(r.dados) && r.dados.length === 0), `Visitante não lê itens de carrinho pela API (status ${r.status})`);
  const f = await fetch(`${SB}/rest/v1/rpc/definir_item_carrinho`, { method: "POST", headers: { apikey: CHAVE, Authorization: `Bearer ${CHAVE}`, "Content-Type": "application/json" }, body: JSON.stringify({ p_variacao_id: ultima.id, p_quantidade: 1 }) });
  ok(f.status === 401 || f.status === 403 || f.status === 404, `Visitante não chama a função do carrinho pela API (status ${f.status})`);
  const e = await fetch(`${SB}/rest/v1/variacoes?id=eq.${ultima.id}`, { method: "PATCH", headers: { apikey: CHAVE, Authorization: `Bearer ${CHAVE}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify({ estoque: 999 }) });
  const depois = await rest(`variacoes?select=estoque&id=eq.${ultima.id}`);
  ok(depois.dados?.[0]?.estoque === 1, `Ninguém altera estoque pela API pública (PATCH status ${e.status}, estoque segue 1)`);
}

await navegador.close();
console.log(falhas ? `\n${falhas} teste(s) falharam.` : "\nTodos os testes passaram.");
process.exit(falhas ? 1 : 0);
