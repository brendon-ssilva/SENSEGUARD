/* Peças de HTML reutilizadas por várias views. */
import { h } from "../utils/dom.js";
import { I } from "./icons.js";

export function badge(cls, label) {
  return `<span class="status-badge ${h(cls)}">${h(label)}</span>`;
}

/** Ponto colorido + texto. $tone: emerald | amber | crimson | orange | blue | violet | muted. */
export function dot(tone, label) {
  return `<div class="status-dot-row"><span class="status-dot tone-${h(tone)}"></span><span>${h(label)}</span></div>`;
}

const bigIcon = (svg) => svg.replace(/width="\d+"/, 'width="32"').replace(/height="\d+"/, 'height="32"');

/** Estado vazio de uma grade/lista (fora de tabelas). */
export function emptyState(iconSvg, text) {
  return `<div class="table-empty-state table-empty-state-lg">${iconSvg}<br><br>${h(text)}</div>`;
}

/** Linha de tabela para "nenhum resultado". */
export function emptyRow(colspan, iconSvg, text) {
  return `<tr><td colspan="${colspan}" class="table-empty-state">${bigIcon(iconSvg)}<br><br>${h(text)}</td></tr>`;
}

/** Botões de ação de uma linha: editar/excluir, ou confirmar/cancelar a exclusão. */
export function rowActions(entity, id, deleteId) {
  if (deleteId === id) {
    return `<div class="row-actions-confirm"><button class="link-button-crimson" data-action="${entity}.confirmDelete" data-id="${h(id)}">Confirmar</button><button class="link-button-muted" data-action="delete.clear">Cancelar</button></div>`;
  }
  return `<div class="row-actions"><button class="icon-action-button edit" data-action="${entity}.openEdit" data-id="${h(id)}" aria-label="Editar">${I.pencil}</button><button class="icon-action-button delete" data-action="delete.set" data-id="${h(id)}" aria-label="Excluir">${I.trash}</button></div>`;
}
