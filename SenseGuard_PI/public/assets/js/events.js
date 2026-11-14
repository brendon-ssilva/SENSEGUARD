/*
 * Delegação de eventos: os elementos declaram o que fazem com data-action="grupo.acao"
 * (e data-id / data-value), sem handlers inline. Isso permite uma CSP sem 'unsafe-inline'
 * em scripts e deixa o comportamento fora do HTML gerado.
 */
import { ApiError } from "./api.js";
import { toastError } from "./ui/toast.js";

const clickActions = new Map();
const inputActions = new Map();

export function registerActions(map) {
  for (const [name, handler] of Object.entries(map)) clickActions.set(name, handler);
}

export function registerInputs(map) {
  for (const [name, handler] of Object.entries(map)) inputActions.set(name, handler);
}

async function run(handler, payload) {
  try {
    await handler(payload);
  } catch (error) {
    // Erros de validação/permissão (4xx) já são mostrados ao usuário; só falhas inesperadas vão ao console.
    if (!(error instanceof ApiError) || error.status >= 500 || error.status === 0) console.error(error);
    toastError(error?.message || "Não foi possível concluir a ação.");
  }
}

export function initEvents(root = document) {
  root.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target.closest("[data-action]") : null;
    if (!target || target.disabled) return;

    const handler = clickActions.get(target.dataset.action);
    if (!handler) return;

    run(handler, { el: target, id: target.dataset.id, value: target.dataset.value, view: target.dataset.view, event });
  });

  root.addEventListener("input", (event) => {
    if (event.target instanceof Element) event.target.classList.remove("is-invalid");

    const target = event.target instanceof Element ? event.target.closest("[data-input]") : null;
    if (!target) return;

    const handler = inputActions.get(target.dataset.input);
    if (handler) run(handler, { el: target, value: target.value, event });
  });

  root.addEventListener("keydown", (event) => {
    // Enter dentro de um campo do modal aciona o botão Salvar.
    if (
      event.key === "Enter" &&
      event.target instanceof HTMLInputElement &&
      event.target.type !== "checkbox" &&
      event.target.closest("#modal_body")
    ) {
      const saveButton = document.querySelector("#modal_footer .button-save");
      if (saveButton) {
        event.preventDefault();
        saveButton.click();
      }
      return;
    }

    if (event.key !== "Escape") return;
    const handler = clickActions.get("modal.close");
    const overlay = document.getElementById("modal_overlay");
    if (handler && overlay?.classList.contains("show")) run(handler, { el: overlay, event });
  });
}
