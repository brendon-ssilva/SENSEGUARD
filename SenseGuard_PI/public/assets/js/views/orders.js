/* View Ordens de Serviço: tabela expansível, filtros e formulários (completo e do técnico). */
import { state, canWrite, isTechnician, metaOptions } from "../state.js";
import { h } from "../utils/dom.js";
import { I } from "../ui/icons.js";
import { badge, dot, emptyRow, rowActions } from "../ui/components.js";
import { openModal, closeModal, markInvalidField } from "../ui/modal.js";
import { toastError } from "../ui/toast.js";
import { saveEntity, deleteEntity } from "../api.js";
import { upsert } from "../data.js";
import { renderAll, renderView, renderChrome } from "../view-host.js";
import { MAINT_TYPE, OS_STATUS, PRIORITY } from "../constants.js";

const TYPE_FILTERS = [["all", "Todos"], ["preventiva", "Preventiva"], ["preditiva", "Preditiva"], ["corretiva", "Corretiva"]];
const STATUS_FILTERS = [["all", "Todos"], ["aberta", "Aberta"], ["em_andamento", "Em Andamento"], ["concluida", "Concluída"], ["cancelada", "Cancelada"]];

const PRIORITY_ORDER = { critica: 0, alta: 1, media: 2, baixa: 3 };
const STATUS_ORDER = { em_andamento: 0, aberta: 1, concluida: 2, cancelada: 3 };

/** O técnico só edita as ordens atribuídas a ele. */
const isMine = (order) => isTechnician() && String(order.assignedToId) === String(state.currentUser?.id);

function actionCell(order) {
  if (canWrite()) return rowActions("orders", order.id, state.deleteId);
  if (isMine(order)) {
    return `<div class="row-actions"><button class="icon-action-button edit" data-action="orders.openStatusEdit" data-id="${h(order.id)}" aria-label="Atualizar status">${I.pencil}</button></div>`;
  }
  return "—";
}

function expandedRow(order, machine) {
  return `<tr class="expanded-details-row"><td></td><td colspan="8">
    <div class="expanded-details-grid">
      <div><div class="expanded-section-label">Descrição</div><div class="expanded-text">${h(order.description || "—")}</div></div>
      <div>
        <div class="expanded-key-value-pair"><span class="text-muted">Criada em</span><span class="font-mono-style expanded-value">${h(order.createdAt)}</span></div>
        <div class="expanded-key-value-pair"><span class="text-muted">Horas estimadas</span><span class="font-mono-style expanded-value">${h(order.estimatedHours)}h</span></div>
        ${order.completedAt ? `<div class="expanded-key-value-pair"><span class="text-muted">Concluída em</span><span class="font-mono-style expanded-value done">${h(order.completedAt)}</span></div>` : ""}
      </div>
      <div>
        <div class="expanded-key-value-pair"><span class="text-muted">Máquina</span><span class="expanded-value">${machine ? h(machine.name) : "—"}</span></div>
        <div class="expanded-key-value-pair"><span class="text-muted">Localização</span><span class="expanded-value">${machine ? h(machine.location) : "—"}</span></div>
      </div>
    </div>
  </td></tr>`;
}

function orderRow(order) {
  const machine = state.machines.find((m) => m.id === order.machineId);
  const assignee = state.users.find((u) => u.id === order.assignedToId);
  const expanded = state.expandedId === order.id;
  const status = OS_STATUS[order.status];

  return `<tr>
    <td class="table-expand-cell"><button class="table-expand-button${expanded ? " open" : ""}" data-action="orders.toggleExpand" data-id="${h(order.id)}" aria-label="Detalhes">${I.chevron}</button></td>
    <td><div class="table-cell-mono">${h(order.code || order.id)}</div><div class="cell-title">${h(order.title)}</div></td>
    <td class="text-muted">${machine ? h(machine.name) : "—"}</td>
    <td>${badge(MAINT_TYPE[order.type]?.cls || "muted", MAINT_TYPE[order.type]?.label || order.type)}</td>
    <td>${badge(PRIORITY[order.priority]?.cls || "muted", PRIORITY[order.priority]?.label || order.priority)}</td>
    <td>${dot(status?.tone || "muted", status?.label || order.status)}</td>
    <td class="text-muted">${assignee ? h(assignee.name) : "—"}</td>
    <td class="table-cell-mono">${h(order.scheduledFor || "—")}</td>
    <td>${actionCell(order)}</td>
  </tr>${expanded ? expandedRow(order, machine) : ""}`;
}

export function renderOrders() {
  const { orders, orderTypeFilter, orderStatusFilter, orderQuery } = state;
  const q = orderQuery.toLowerCase();

  const sorted = orders
    .filter(
      (o) =>
        ((o.title || "").toLowerCase().includes(q) || (o.id || "").toLowerCase().includes(q) || (o.code || "").toLowerCase().includes(q)) &&
        (orderTypeFilter === "all" || o.type === orderTypeFilter) &&
        (orderStatusFilter === "all" || o.status === orderStatusFilter),
    )
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  const typeCount = (t) => (t === "all" ? orders.length : orders.filter((o) => o.type === t).length);
  const statusCount = (s) => (s === "all" ? orders.length : orders.filter((o) => o.status === s).length);
  const group = (items, current, action, counter) =>
    items
      .map(([value, label]) => `<button class="filter-button${current === value ? " active" : ""}" data-action="${action}" data-value="${value}">${h(label)} <span class="font-mono-style count-pill">${counter(value)}</span></button>`)
      .join("");

  return `<div class="view-wrapper">
    <div class="section-page-header">
      <div><div class="section-page-title">Ordens de Serviço</div><div class="section-page-subtitle">${orders.filter((o) => o.status === "aberta" || o.status === "em_andamento").length} em aberto de ${orders.length} total</div></div>
      ${canWrite() ? `<button class="button-primary" data-action="orders.openAdd">${I.plus} Nova OS</button>` : ""}
    </div>
    <div class="actions-toolbar">
      <div class="search-input-wrapper">${I.search}<input class="search-input-field" data-input="orders.setQuery" placeholder="Buscar por código ou título..." value="${h(orderQuery)}"></div>
      <div class="filter-buttons-group segmented">${group(TYPE_FILTERS, orderTypeFilter, "orders.setTypeFilter", typeCount)}</div>
      <div class="filter-buttons-group segmented">${group(STATUS_FILTERS, orderStatusFilter, "orders.setStatusFilter", statusCount)}</div>
    </div>
    <div class="panel-card">
      <div class="table-responsive-wrapper"><table>
        <thead><tr><th></th><th>OS / Título</th><th>Máquina</th><th>Tipo</th><th>Prioridade</th><th>Status</th><th>Responsável</th><th>Previsto</th><th></th></tr></thead>
        <tbody>${sorted.map(orderRow).join("") || emptyRow(9, I.clipboard, "Nenhuma ordem encontrada")}</tbody>
      </table></div>
    </div>
  </div>`;
}

const select = (id, key, label, options, selected) =>
  `<div class="form-field-group"><label class="form-input-label" for="${id}">${label}</label><select id="${id}" data-field="${key}" class="form-input-field">${options
    .map((o) => `<option value="${h(o.value)}" ${selected === o.value ? "selected" : ""}>${h(o.label)}</option>`)
    .join("")}</select></div>`;

function orderForm(order) {
  const activeUsers = state.users.filter((u) => u.status === "ativo").map((u) => ({ value: u.id, label: u.name }));
  const machines = state.machines.map((m) => ({ value: m.id, label: m.name }));

  return `<div class="form-grid-layout">
    <div class="form-field-group full-width"><label class="form-input-label" for="f-title">Título da OS</label><input id="f-title" data-field="title" class="form-input-field" value="${h(order?.title || "")}" placeholder="Ex: Troca de rolamentos — CA-01"></div>
    ${select("f-machine", "machineId", "Máquina", machines, order?.machineId)}
    ${select("f-type", "type", "Tipo de Manutenção", metaOptions("orderType", MAINT_TYPE), order?.type)}
    ${select("f-priority", "priority", "Prioridade", metaOptions("orderPriority", PRIORITY), order?.priority)}
    ${select("f-status", "status", "Status", metaOptions("orderStatus", OS_STATUS), order?.status)}
    ${select("f-assigned", "assignedToId", "Responsável", activeUsers, order?.assignedToId)}
    <div class="form-field-group"><label class="form-input-label" for="f-hours">Horas Estimadas</label><input id="f-hours" data-field="estimatedHours" type="number" min="0" step="0.5" class="form-input-field" value="${h(order?.estimatedHours ?? 2)}"></div>
    <div class="form-field-group"><label class="form-input-label" for="f-scheduled">Data Prevista</label><input id="f-scheduled" data-field="scheduledFor" type="date" class="form-input-field" value="${h(order?.scheduledFor || "")}"></div>
    <div class="form-field-group full-width"><label class="form-input-label" for="f-desc">Descrição</label><textarea id="f-desc" data-field="description" class="form-input-field form-textarea-field" placeholder="Descreva o serviço a ser realizado...">${h(order?.description || "")}</textarea></div>
  </div>`;
}

/** Formulário reduzido do técnico: só status e descrição. */
function technicianForm(order) {
  return `<div class="form-grid-layout">
    <div class="form-field-group full-width"><div class="form-input-label">${h(order.code || order.id)} — ${h(order.title)}</div></div>
    ${select("f-status", "status", "Status", metaOptions("orderStatus", OS_STATUS), order.status)}
    <div class="form-field-group full-width"><label class="form-input-label" for="f-desc">Descrição / observações</label><textarea id="f-desc" data-field="description" class="form-input-field form-textarea-field">${h(order.description || "")}</textarea></div>
  </div>`;
}

const footer = (action, label = "Salvar OS") =>
  `<button class="button-cancel" data-action="modal.close">Cancelar</button><button class="button-save" data-action="${action}">${label}</button>`;
const value = (id) => document.getElementById(id)?.value ?? "";

async function persist(payload) {
  let saved;
  try {
    saved = await saveEntity("orders", state.editingId, payload);
  } catch (error) {
    markInvalidField(error.field);
    throw error;
  }
  upsert("orders", saved);
  await closeModal();
  await renderAll();
}

async function save() {
  const title = value("f-title").trim();
  const machineId = value("f-machine");
  if (!title || !machineId) {
    toastError("Informe o título e a máquina da ordem.");
    markInvalidField(title ? "machineId" : "title");
    return;
  }

  await persist({
    title,
    machineId,
    type: value("f-type") || "preventiva",
    priority: value("f-priority") || "baixa",
    status: value("f-status") || "aberta",
    assignedToId: value("f-assigned"),
    estimatedHours: Number(value("f-hours") || 2),
    scheduledFor: value("f-scheduled"),
    description: value("f-desc"),
  });
}

async function saveAsTechnician() {
  await persist({ status: value("f-status") || "aberta", description: value("f-desc") });
}

async function confirmDelete({ id }) {
  await deleteEntity("orders", id);
  state.orders = state.orders.filter((o) => o.id !== id);
  state.deleteId = null;
  renderView();
  renderChrome();
}

export const orderActions = {
  "orders.toggleExpand"({ id }) {
    state.expandedId = state.expandedId === id ? null : id;
    renderView();
  },
  "orders.setTypeFilter"({ value: filter }) {
    state.orderTypeFilter = filter;
    renderView();
  },
  "orders.setStatusFilter"({ value: filter }) {
    state.orderStatusFilter = filter;
    renderView();
  },
  "orders.openAdd"() {
    state.editingId = null;
    openModal("Nova Ordem de Serviço", orderForm(null), footer("orders.save"), true);
  },
  "orders.openEdit"({ id }) {
    state.editingId = id;
    const order = state.orders.find((o) => o.id === id);
    openModal(`Editar ${order ? order.code || order.id : ""}`, orderForm(order), footer("orders.save"), true);
  },
  "orders.openStatusEdit"({ id }) {
    const order = state.orders.find((o) => o.id === id);
    if (!order || !isMine(order)) return;
    state.editingId = id;
    openModal("Atualizar ordem", technicianForm(order), footer("orders.saveStatus", "Salvar"));
  },
  "orders.save": save,
  "orders.saveStatus": saveAsTechnician,
  "orders.confirmDelete": confirmDelete,
};

export const orderInputs = {
  "orders.setQuery"({ value: query }) {
    state.orderQuery = query;
    renderView();
  },
};
