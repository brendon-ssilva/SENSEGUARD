/* Modal único reutilizado pelos formulários de cadastro. */
import { state } from "../state.js";
import { $ } from "../utils/dom.js";
import { enter, leave, EASE } from "./motion.js";

let lastFocused = null;

export function openModal(title, bodyHtml, footerHtml, large = false) {
  const overlay = $("modal_overlay");
  const panel = $("modal_panel");
  if (!overlay || !panel) return;

  lastFocused = document.activeElement;
  $("modal_title").textContent = title;
  $("modal_body").innerHTML = bodyHtml;
  $("modal_footer").innerHTML = footerHtml;
  panel.className = `modal-panel${large ? " large" : ""}`;
  overlay.classList.add("show");
  enter(panel, { scale: 0.94, duration: 0.22, easing: EASE.back });

  const firstField = $("modal_body").querySelector("input, select, textarea");
  if (firstField instanceof HTMLElement) firstField.focus();
}

export async function closeModal() {
  const overlay = $("modal_overlay");
  const panel = $("modal_panel");
  if (!overlay || !panel) return;

  await leave(panel, { scale: 0.94, duration: 0.15 });
  overlay.classList.remove("show");
  state.editingId = null;
  state.modalContext = null;
  if (lastFocused instanceof HTMLElement) lastFocused.focus();
  lastFocused = null;
}

/** Destaca o campo que o servidor apontou como inválido (data-field="<chave da API>"). */
export function markInvalidField(field) {
  if (!field) return;
  const input = $("modal_body")?.querySelector(`[data-field="${CSS.escape(field)}"]`);
  if (input instanceof HTMLElement) {
    input.classList.add("is-invalid");
    input.focus();
  }
}
