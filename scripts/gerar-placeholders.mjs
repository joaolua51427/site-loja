// Gera imagens placeholder (PNG transparente, 400×620 = 2× o canvas 200×310)
// para cada produto em data/produtos.json, nos caminhos de "imagens".
// Uso: node scripts/gerar-placeholders.mjs
// Requer Playwright disponível (já vem no ambiente de desenvolvimento).
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const produtos = JSON.parse(readFileSync(join(raiz, "data/produtos.json"), "utf8"));

// Silhuetas no mesmo sistema de coordenadas do varal (viewBox 200×310, gola em y≈34).
const ROUPAS = {
  camiseta: {
    frente: "M80,34 C88,45 112,45 120,34 C132,36 146,40 156,45 C160,48 163,52 164,57 C158,72 152,88 152,102 L153,236 C128,241 72,241 47,236 L48,102 C48,88 42,72 36,57 C37,52 40,48 44,45 C54,40 68,36 80,34 Z",
    costas: "M80,34 C90,31 110,31 120,34 C132,36 146,40 156,45 C160,48 163,52 164,57 C158,72 152,88 152,102 L153,236 C128,241 72,241 47,236 L48,102 C48,88 42,72 36,57 C37,52 40,48 44,45 C54,40 68,36 80,34 Z",
    mangas: ["M44,45 C38,47 33,50 31,55 C24,64 17,76 13,92 C18,100 24,106 30,110 C35,106 42,102 48,102 C47,84 45,62 44,45 Z", "M156,45 C162,47 167,50 169,55 C176,64 183,76 187,92 C182,100 176,106 170,110 C165,106 158,102 152,102 C153,84 155,62 156,45 Z"],
    gola: "M80,34 C88,45 112,45 120,34 L124,36 C114,50 86,50 76,36 Z",
    barras: ["M50,229 C74,233 126,233 150,229"],
  },
  malha: {
    frente: "M80,34 C88,46 112,46 120,34 L158,46 C162,52 163,60 163,70 L163,226 C140,231 60,231 37,226 L37,70 C37,60 38,52 42,46 Z",
    costas: "M80,34 C90,31 110,31 120,34 L158,46 C162,52 163,60 163,70 L163,226 C140,231 60,231 37,226 L37,70 C37,60 38,52 42,46 Z",
    mangas: ["M42,46 C32,52 27,62 26,76 L20,216 C26,221 36,222 44,219 L47,98 C46,80 45,62 42,46 Z", "M158,46 C168,52 173,62 174,76 L180,216 C174,221 164,222 156,219 L153,98 C154,80 155,62 158,46 Z"],
    gola: "M80,34 C88,46 112,46 120,34 L125,37 C115,53 85,53 75,37 Z",
    ribanas: ["M37,211 L163,211 L163,226 C140,231 60,231 37,226 Z", "M21,203 L45,206 L44,219 C36,222 26,221 20,216 Z", "M179,203 L155,206 L156,219 C164,222 174,221 180,216 Z"],
  },
  moletom: {
    frente: "M80,36 C88,47 112,47 120,36 L160,48 C164,54 165,62 165,72 L165,228 C141,233 59,233 35,228 L35,72 C35,62 36,54 40,48 Z",
    costas: "M80,36 C90,32 110,32 120,36 L160,48 C164,54 165,62 165,72 L165,228 C141,233 59,233 35,228 L35,72 C35,62 36,54 40,48 Z",
    mangas: ["M40,48 C30,54 25,64 24,80 L18,218 C24,223 35,224 43,221 L46,100 C45,82 43,64 40,48 Z", "M160,48 C170,54 175,64 176,80 L182,218 C176,223 165,224 157,221 L154,100 C155,82 157,64 160,48 Z"],
    capuz: "M72,42 C64,28 68,12 86,8 L114,8 C132,12 136,28 128,42 C116,30 84,30 72,42 Z",
    capuzCostas: "M76,36 C66,50 64,82 80,110 C88,120 112,120 120,110 C136,82 134,50 124,36 C112,30 88,30 76,36 Z",
    bolso: "M62,148 L138,148 L150,196 L50,196 Z",
    cordoes: ["M92,50 C91,72 89,88 90,104", "M108,50 C109,72 111,88 110,104"],
    ribanas: ["M35,213 L165,213 L165,228 C141,233 59,233 35,228 Z", "M19,205 L45,208 L43,221 C35,224 24,223 18,218 Z", "M181,205 L155,208 L157,221 C165,224 176,223 182,218 Z"],
  },
  jaqueta: {
    frente: "M80,34 C88,40 112,40 120,34 L162,48 C166,54 167,61 167,72 L166,230 L34,230 L33,72 C33,61 34,54 38,48 Z",
    costas: "M80,34 C90,30 110,30 120,34 L162,48 C166,54 167,61 167,72 L166,230 L34,230 L33,72 C33,61 34,54 38,48 Z",
    mangas: ["M38,48 C28,54 24,64 23,80 L19,218 C26,222 37,222 44,219 L46,100 C45,82 42,64 38,48 Z", "M162,48 C172,54 176,64 177,80 L181,218 C174,222 163,222 156,219 L154,100 C155,82 158,64 162,48 Z"],
    lapelas: ["M100,58 L80,34 C72,40 64,50 58,64 L90,72 Z", "M100,58 L120,34 C128,40 136,50 142,64 L110,72 Z"],
    bolsos: ["M46,152 L88,152 L88,198 L46,198 Z", "M112,152 L154,152 L154,198 L112,198 Z", "M112,86 L142,86 L142,118 L112,118 Z"],
    botoes: [[106, 84], [106, 118], [106, 152], [106, 186], [106, 218]],
    carcela: "M100,58 L100,230",
  },
  casaco: {
    frente: "M80,34 C88,40 112,40 120,34 L164,50 C168,56 169,63 169,74 L174,294 L26,294 L31,74 C31,63 32,56 36,50 Z",
    costas: "M80,34 C90,30 110,30 120,34 L164,50 C168,56 169,63 169,74 L174,294 L26,294 L31,74 C31,63 32,56 36,50 Z",
    mangas: ["M36,50 C26,56 22,66 21,82 L16,240 C23,244 34,244 42,241 L45,104 C44,86 40,66 36,50 Z", "M164,50 C174,56 178,66 179,82 L184,240 C177,244 166,244 158,241 L155,104 C156,86 160,66 164,50 Z"],
    lapelas: ["M100,128 L80,34 C74,44 70,56 66,72 L76,78 L70,90 Z", "M100,128 L120,34 C126,44 130,56 134,72 L124,78 L130,90 Z"],
    bolsos: ["M42,206 L84,206 L84,217 L42,217 Z", "M116,206 L158,206 L158,217 L116,217 Z"],
    botoes: [[112, 146], [112, 180], [112, 214]],
    carcela: "M100,128 L100,294",
  },
};

function escurecer(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v * (1 - f)));
  return `rgb(${c.join(",")})`;
}

function svgRoupa(tipo, lado, cor) {
  const r = ROUPAS[tipo];
  const corpo = lado === "frente" ? r.frente : r.costas;
  const tudo = [corpo, ...r.mangas];
  const sombra = escurecer(cor, 0.12);
  const forte = escurecer(cor, 0.28);
  const partes = [];
  if (tipo === "moletom" && lado === "frente") partes.push(`<path d="${r.capuz}" fill="${forte}"/>`);
  partes.push(...r.mangas.map((d) => `<path d="${d}" fill="${sombra}"/>`));
  partes.push(`<path d="${corpo}" fill="${cor}"/>`);
  const dentro = [];
  if (r.gola && lado === "frente") dentro.push(`<path d="${r.gola}" fill="${sombra}"/>`);
  if (r.ribanas) dentro.push(...r.ribanas.map((d) => `<path d="${d}" fill="${sombra}"/>`));
  if (tipo === "moletom" && lado === "frente") { dentro.push(`<path d="${r.bolso}" fill="${sombra}"/>`); }
  if (tipo === "moletom" && lado === "costas") dentro.push(`<path d="${r.capuzCostas}" fill="${sombra}"/>`);
  if (r.lapelas && lado === "frente") dentro.push(...r.lapelas.map((d) => `<path d="${d}" fill="${sombra}"/>`));
  if (r.bolsos && lado === "frente") dentro.push(...r.bolsos.map((d) => `<path d="${d}" fill="none" stroke="${forte}" stroke-width="0.8" stroke-dasharray="1.6 1.4"/>`));
  if (r.carcela && lado === "frente") dentro.push(`<path d="${r.carcela}" stroke="${forte}" stroke-width="0.9"/>`);
  if (r.barras) dentro.push(...r.barras.map((d) => `<path d="${d}" fill="none" stroke="${forte}" stroke-width="0.6" stroke-dasharray="1.6 1.4"/>`));
  dentro.push(`<rect width="200" height="310" fill="url(#vol)"/>`);
  const extras = [];
  if (r.cordoes && lado === "frente") extras.push(...r.cordoes.map((d) => `<path d="${d}" fill="none" stroke="${escurecer(cor, 0.45)}" stroke-width="1.8" stroke-linecap="round"/>`));
  if (r.botoes && lado === "frente") extras.push(...r.botoes.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="${escurecer(cor, 0.5)}"/>`));
  return `
    <defs>
      <clipPath id="c">${tudo.map((d) => `<path d="${d}"/>`).join("")}</clipPath>
      <linearGradient id="vol" x1="0" x2="1">
        <stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset=".2" stop-color="#000" stop-opacity=".04"/>
        <stop offset=".5" stop-color="#fff" stop-opacity=".08"/><stop offset=".8" stop-color="#000" stop-opacity=".06"/>
        <stop offset="1" stop-color="#000" stop-opacity=".24"/>
      </linearGradient>
    </defs>
    ${partes.join("")}
    <g clip-path="url(#c)">${dentro.join("")}</g>
    ${extras.join("")}`;
}

// Par de calçados pendurado pelos cadarços no gancho do cabide (calcanhar para cima, bico para baixo).
function svgCalcado(tipo, lado, cor) {
  const bota = tipo === "bota";
  const sola = bota ? escurecer(cor, 0.55) : "#F2EFE8";
  const solaBorda = escurecer(cor, 0.35);
  const sombra = escurecer(cor, 0.16);
  const linha = escurecer(cor, 0.5);
  const cano = bota ? 24 : 0; // altura extra do cano da bota
  // Pé desenhado já na vertical: sola à esquerda (x=0), cabedal para a direita, calcanhar em y=0, bico em y=100.
  const contorno = `M0,0 L${40 + cano},0 C${46 + cano},0 ${48 + cano},6 ${48 + cano},14 L${48 + cano},22 C${44 + cano},24 ${40 + cano},28 38,34 C34,52 30,70 24,86 C20,96 12,100 4,100 L0,100 Z`;
  const pe = () => `
    <g>
      <path d="${contorno}" fill="${cor}"/>
      <path d="${contorno}" fill="url(#vol)"/>
      <path d="M${48 + cano},22 C${44 + cano},24 ${40 + cano},28 38,34 C34,52 30,70 24,86" fill="none" stroke="${sombra}" stroke-width="1.6"/>
      <path d="M8,4 L${30 + cano},4" stroke="${sombra}" stroke-width="1"/>
      ${[0, 1, 2, 3].map((k) => `<circle cx="${34 - k * 2.5}" cy="${42 + k * 9}" r="1.3" fill="${linha}"/>`).join("")}
      <path d="M0,-1 L0,101 L-7,101 C-9,101 -10,99 -10,97 L-10,3 C-10,0 -9,-1 -7,-1 Z" fill="${sola}" stroke="${solaBorda}" stroke-width="0.6"/>
    </g>`;
  const escala = bota ? 1.05 : 1.25;
  const largura = (58 + cano) * escala * 0.8;
  const x1 = 100 - largura;
  const x2 = 100 - 6;
  const y1 = 96;
  const y2 = 112;
  const espelho = lado === "costas" ? "translate(200 0) scale(-1 1)" : "";
  return `
    <defs>
      <linearGradient id="vol" x1="0" x2="1">
        <stop offset="0" stop-color="#000" stop-opacity=".18"/><stop offset=".45" stop-color="#fff" stop-opacity=".1"/>
        <stop offset="1" stop-color="#000" stop-opacity=".16"/>
      </linearGradient>
    </defs>
    <g transform="${espelho}">
      <path d="M100,42 C92,60 ${x1 + 10},${y1 - 30} ${x1 + 14 * escala},${y1 + 2}" fill="none" stroke="${linha}" stroke-width="1.5"/>
      <path d="M100,42 C108,60 ${x2 + 6},${y2 - 30} ${x2 + 14 * escala},${y2 + 2}" fill="none" stroke="${linha}" stroke-width="1.5"/>
      <g transform="translate(${x1} ${y1}) scale(${escala})">${pe()}</g>
      <g transform="translate(${x2} ${y2}) scale(${escala})">${pe()}</g>
    </g>`;
}

// Par de sandálias visto de cima, pendurado por um cordão no gancho.
// Estilo "duas tiras com fivela" (padrão) ou "tira em H" (slug com izmir/chypre/oran).
function svgSandalia(produto, lado, cor) {
  const emH = /izmir|chypre|oran/.test(produto.slug);
  const palmilha = emH ? escurecer(cor, 0.55) : "#C9A27A";
  const sola = emH ? "#1C1C1E" : "#3A3330";
  const tira = cor;
  const tiraSombra = escurecer(cor, 0.25);
  const fivela = "#B8B8B8";
  const pe = (espelho) => `
    <g transform="${espelho ? "translate(68 0) scale(-1 1)" : ""}">
      <path d="M34,0 C52,0 60,18 60,44 C60,70 56,92 54,112 C52,132 46,150 34,150 C22,150 14,132 12,112 C10,92 6,70 8,44 C8,18 16,0 34,0 Z" fill="${sola}"/>
      <path d="M34,4 C49,4 55,20 55,44 C55,68 52,90 50,110 C48,128 43,145 34,145 C25,145 19,128 17,110 C15,90 12,68 13,44 C13,20 19,4 34,4 Z" fill="${palmilha}"/>
      ${emH
        ? `<path d="M4,40 L22,40 L22,58 L46,58 L46,40 L64,40 L64,92 L46,92 L46,74 L22,74 L22,92 L4,92 Z" fill="${tira}"/>
           <path d="M22,58 L46,58 L46,74 L22,74 Z" fill="${tiraSombra}"/>`
        : `<rect x="2" y="30" width="64" height="20" rx="4" fill="${tira}"/>
           <rect x="2" y="62" width="64" height="22" rx="4" fill="${tira}"/>
           <rect x="2" y="47" width="64" height="3" fill="${tiraSombra}"/>
           <rect x="2" y="81" width="64" height="3" fill="${tiraSombra}"/>
           <rect x="48" y="33" width="10" height="14" rx="2" fill="none" stroke="${fivela}" stroke-width="2.2"/>
           <rect x="48" y="66" width="10" height="15" rx="2" fill="none" stroke="${fivela}" stroke-width="2.2"/>`}
    </g>`;
  const espelhoGeral = lado === "costas" ? "translate(200 0) scale(-1 1)" : "";
  return `
    <g transform="${espelhoGeral}">
      <path d="M100,40 C94,70 74,96 68,128" fill="none" stroke="#555" stroke-width="1.4"/>
      <path d="M100,40 C106,70 126,96 132,128" fill="none" stroke="#555" stroke-width="1.4"/>
      <g transform="translate(30 112) rotate(-6 34 75)">${pe(false)}</g>
      <g transform="translate(102 112) rotate(6 34 75)">${pe(true)}</g>
    </g>`;
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 400, height: 620 }, deviceScaleFactor: 1 });
for (const p of produtos) {
  const cor = p.cores[0].hex;
  for (const lado of ["frente", "costas"]) {
    const destino = p.imagens[lado];
    if (!destino) continue;
    const corpo = p.tipo === "sandalia" ? svgSandalia(p, lado, cor) : p.categoria === "calcado" ? svgCalcado(p.tipo, lado, cor) : svgRoupa(p.tipo, lado, cor);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 310" width="400" height="620">${corpo}</svg>`;
    await page.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`);
    const arquivo = join(raiz, "public", destino);
    mkdirSync(dirname(arquivo), { recursive: true });
    await page.screenshot({ path: arquivo, omitBackground: true, clip: { x: 0, y: 0, width: 400, height: 620 } });
    console.log("ok", destino);
  }
}
await browser.close();
