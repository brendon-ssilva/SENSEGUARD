/* Utilitários de DOM compartilhados por todas as views. */

/** Escapa texto para uso seguro em HTML (inclui aspas simples). */
export function h(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const $ = (id) => document.getElementById(id);

/** Troca o HTML de um contêiner preservando foco e cursor de campos com data-input (ex.: busca). */
export function setHtmlKeepingFocus(container, html) {
  const active = document.activeElement;
  const inputName = active instanceof HTMLInputElement && container.contains(active) ? active.dataset.input : null;
  const selection = inputName ? [active.selectionStart, active.selectionEnd] : null;

  container.innerHTML = html;

  if (inputName) {
    const next = container.querySelector(`[data-input="${CSS.escape(inputName)}"]`);
    if (next instanceof HTMLInputElement) {
      next.focus();
      if (selection && selection[0] !== null) next.setSelectionRange(selection[0], selection[1]);
    }
  }
}
