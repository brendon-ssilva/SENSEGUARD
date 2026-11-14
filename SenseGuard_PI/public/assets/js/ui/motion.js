/*
 * Animações com a Web Animations API (nativa). Substitui o GSAP: sem dependência
 * externa, sem CDN e compatível com uma CSP estrita. Respeita "reduzir movimento".
 */

export const EASE = {
  out: "cubic-bezier(0.215, 0.61, 0.355, 1)",
  in: "cubic-bezier(0.55, 0.055, 0.675, 0.19)",
  back: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  inOut: "ease-in-out",
};

function canAnimate(el) {
  if (!el || typeof el.animate !== "function") return false;
  return !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}

/** Anima de um estado inicial (deslocado/transparente) até o estado natural do elemento. */
export function enter(el, { x = 0, y = 0, scale = 1, opacity = 0, duration = 0.3, delay = 0, easing = EASE.out } = {}) {
  if (!canAnimate(el)) return null;
  return el.animate(
    [
      { opacity, transform: `translate(${x}px, ${y}px) scale(${scale})` },
      { opacity: 1, transform: "none" },
    ],
    { duration: duration * 1000, delay: delay * 1000, easing, fill: "backwards" },
  );
}

/** Anima a saída e resolve a promessa ao terminar (ou imediatamente sem suporte). */
export function leave(el, { y = 0, scale = 1, duration = 0.15, easing = EASE.in } = {}) {
  if (!canAnimate(el)) return Promise.resolve();
  const animation = el.animate(
    [
      { opacity: 1, transform: "none" },
      { opacity: 0, transform: `translate(0, ${y}px) scale(${scale})` },
    ],
    { duration: duration * 1000, easing, fill: "forwards" },
  );
  return animation.finished.then(() => animation.cancel()).catch(() => {});
}

/** Flutuação lenta e infinita (ex.: orbe decorativo do login). */
export function floatLoop(el, { x = 0, y = 0, duration = 6 } = {}) {
  if (!canAnimate(el)) return null;
  return el.animate(
    [{ transform: "translate(0, 0)" }, { transform: `translate(${x}px, ${y}px)` }],
    { duration: duration * 1000, iterations: Infinity, direction: "alternate", easing: EASE.inOut },
  );
}

export function shake(el, distance = 6) {
  if (!canAnimate(el)) return null;
  return el.animate(
    [
      { transform: "translateX(0)" },
      { transform: `translateX(${-distance}px)` },
      { transform: `translateX(${distance}px)` },
      { transform: `translateX(${-distance}px)` },
      { transform: `translateX(${distance}px)` },
      { transform: "translateX(0)" },
    ],
    { duration: 360, easing: "linear" },
  );
}

/** Contagem animada de 0 até $target. */
export function countUp(el, target, { duration = 1.4, delay = 0, decimals = 0, suffix = "" } = {}) {
  const format = (value) => `${value.toFixed(decimals)}${suffix}`;
  if (!el) return;
  if (!canAnimate(el)) {
    el.textContent = format(target);
    return;
  }

  el.textContent = format(0);
  const start = performance.now() + delay * 1000;
  const total = duration * 1000;

  const frame = (now) => {
    const progress = Math.min(1, Math.max(0, (now - start) / total));
    const eased = 1 - (1 - progress) ** 2;
    el.textContent = format(target * eased);
    if (progress < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
