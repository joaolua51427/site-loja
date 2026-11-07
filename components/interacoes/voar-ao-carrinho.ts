/**
 * Anima uma cópia da foto do produto voando até o ícone do carrinho.
 * Puramente visual: não muda nada no carrinho. Respeita "reduzir movimento".
 */
export function voarAoCarrinho(origem: Element | null) {
  if (typeof window === "undefined" || !origem) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const alvo = document.querySelector("[data-alvo-carrinho]");
  if (!alvo) return;
  const de = origem.getBoundingClientRect();
  const para = alvo.getBoundingClientRect();
  if (de.width === 0 || para.width === 0) return;

  const copia = origem.cloneNode(true) as HTMLElement;
  Object.assign(copia.style, {
    position: "fixed", left: `${de.left}px`, top: `${de.top}px`, width: `${de.width}px`, height: `${de.height}px`,
    margin: "0", zIndex: "70", pointerEvents: "none", transformOrigin: "center", borderRadius: "2px",
  });
  copia.setAttribute("aria-hidden", "true");
  document.body.appendChild(copia);

  const dx = para.left + para.width / 2 - (de.left + de.width / 2);
  const dy = para.top + para.height / 2 - (de.top + de.height / 2);
  const animacao = copia.animate(
    [
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      { transform: `translate(${dx * 0.55}px, ${dy * 0.35 - 60}px) scale(0.45) rotate(-6deg)`, opacity: 0.95, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.06) rotate(-12deg)`, opacity: 0.2 },
    ],
    { duration: 900, easing: "cubic-bezier(.5,0,.2,1)", fill: "forwards" },
  );
  animacao.onfinish = () => copia.remove();
}
