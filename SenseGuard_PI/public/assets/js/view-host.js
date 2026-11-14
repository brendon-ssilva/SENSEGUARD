/*
 * Hospedeiro das views: guarda os renderizadores registrados e sabe redesenhar
 * navegação, barra superior e conteúdo. As views importam daqui (e não de main.js),
 * o que evita dependências circulares.
 *
 * Um renderizador é uma função sem argumentos que devolve HTML; opcionalmente
 * { html, after } quando precisa ligar eventos depois de inserir o HTML.
 */
import { state } from "./state.js";
import { $, setHtmlKeepingFocus } from "./utils/dom.js";
import { enter, leave } from "./ui/motion.js";

const views = new Map();
const shell = { renderNav: () => {}, renderTopbar: () => {} };
let firstRender = true;

export function registerView(name, renderer) {
  views.set(name, renderer);
}

export function registerShell(parts) {
  Object.assign(shell, parts);
}

function paint() {
  const container = $("view_container");
  const renderer = views.get(state.view) || views.get("dashboard");
  if (!container || !renderer) return;

  const result = renderer();
  const html = typeof result === "string" ? result : result.html;
  setHtmlKeepingFocus(container, html);
  if (typeof result !== "string" && typeof result.after === "function") result.after(container);
}

/** Redesenha o conteúdo. Com { animate: true } faz a transição de entrada (usado ao navegar). */
export async function renderView({ animate = false } = {}) {
  const container = $("view_container");
  if (!container) return;

  if (animate && !firstRender) {
    await leave(container, { y: 8, duration: 0.12 });
    paint();
    enter(container, { y: 8, duration: 0.2 });
    return;
  }

  paint();
  if (firstRender) {
    firstRender = false;
    enter(container, { y: 8, duration: 0.3 });
  }
}

export function renderChrome() {
  shell.renderNav();
  shell.renderTopbar();
}

export function renderAll({ animate = false } = {}) {
  renderChrome();
  return renderView({ animate });
}
