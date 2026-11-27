/* View Máquinas: grade de cards, filtros e formulário. */
import { state, canWrite, metaOptions } from "../state.js";
import { h } from "../utils/dom.js";
import { daysUntil } from "../utils/format.js";
import { I } from "../ui/icons.js";
import { emptyState } from "../ui/components.js";
import { openModal, closeModal, markInvalidField } from "../ui/modal.js";
import { toastError } from "../ui/toast.js";
import { saveEntity, deleteEntity, searchMachines, getMachineById } from "../api.js";
import { refreshAllData } from "../data.js";
import { renderView, renderChrome } from "../view-host.js";
import { MACHINE_STATUS, SENSOR_STATUS, SENSOR_TYPE_LABELS } from "../constants.js";

const FILTERS = [
  ["all", "Todas"],
  ["operando", "Operando"],
  ["alerta", "Alerta"],
  ["manutencao", "Manutenção"],
  ["inativo", "Inativo"],
];

let searchTimer = null;
let searchVersion = 0;
let searchResults = null;
let searchLoading = false;
let searchError = "";

function resetMachineSearch() {
  clearTimeout(searchTimer);
  searchVersion += 1;
  searchResults = null;
  searchLoading = false;
  searchError = "";
  state.machineQuery = "";
}

function matches(machine, query) {
  const q = query.toLowerCase();
  return [machine.name, machine.location, machine.department, machine.serialNumber].some((value) =>
    (value || "").toLowerCase().includes(q),
  );
}

function maintenanceInfo(machine) {
  const days = daysUntil(machine.nextMaintenance);
  const overdue = days !== null && days < 0;
  const soon = days !== null && days >= 0 && days <= 14;
  const text = days === null ? "" : overdue ? `${Math.abs(days)} dias atrasada` : days === 0 ? "Hoje" : `em ${days} dias`;
  return { days, boxClass: overdue ? "over" : soon ? "warn" : "normal", text };
}

function machineCard(machine) {
  const status = MACHINE_STATUS[machine.status] || MACHINE_STATUS.inativo;
  const sensors = state.sensors.filter((s) => (machine.sensorIds || []).includes(s.id));
  const alerting = sensors.some((s) => s.status === "alerta" || s.status === "offline");
  const maint = maintenanceInfo(machine);

  const sensorTags = sensors
    .map((s) => `<div class="sensor-tag"><span class="status-dot tone-${SENSOR_STATUS[s.status]?.tone || "muted"}"></span><span>${h(s.name)}</span></div>`)
    .join("");

  let actions = "";
  if (canWrite()) {
    actions =
      state.deleteId === machine.id
        ? `<div class="confirmation-actions"><button class="link-button-crimson" data-action="machines.confirmDelete" data-id="${h(machine.id)}">Confirmar exclusão</button><button class="link-button-muted" data-action="delete.clear">Cancelar</button></div>`
        : `<div class="machine-card-actions"><button class="action-button-outline edit" data-action="machines.openEdit" data-id="${h(machine.id)}">${I.pencil} Editar</button><button class="action-button-outline delete" data-action="delete.set" data-id="${h(machine.id)}">${I.trash} Excluir</button></div>`;
  }

  const alertIcon = I.alert.replace('width="11"', 'width="13"').replace('height="11"', 'height="13"');

  return `<div class="machine-card">
    <div class="machine-card-header">
      <div>
        <div><span class="status-badge ${status.color}"><span class="status-dot tone-${status.tone}"></span> ${h(status.label)}</span></div>
        <div class="machine-card-title">${h(machine.name)}</div>
        <div class="machine-card-subtitle">${h(machine.model)}</div>
      </div>
      ${alerting ? `<div class="machine-alert-icon">${alertIcon}</div>` : ""}
    </div>
    <div class="machine-card-details">
      ${machine.serialNumber ? `<div class="details-row"><span class="details-label">Nº de série</span><span class="details-value font-mono-style">${h(machine.serialNumber)}</span></div>` : ""}
      <div class="details-row"><span class="details-label">Localização</span><span class="details-value">${h(machine.location)}</span></div>
      <div class="details-row"><span class="details-label">Setor</span><span class="details-value">${h(machine.department)}</span></div>
      <div class="details-row"><span class="details-label">Sensores</span><span class="details-value font-mono-style">${sensors.length} vinculados</span></div>
    </div>
    ${sensorTags ? `<div class="sensor-tags-container">${sensorTags}</div>` : ""}
    <div class="maintenance-status-box ${maint.boxClass}">
      <div class="maintenance-status-row"><span class="maint-label">Próx. manutenção</span><span class="maint-value">${h(machine.nextMaintenance || "—")}</span></div>
      ${maint.days !== null ? `<div class="maintenance-status-sub">${h(maint.text)}</div>` : ""}
    </div>
    ${actions}
    <div class="machine-card-actions">
      <button class="action-button-outline"
        data-action="machines.openDetails"
        data-id="${h(machine.id)}">
        Detalhes
      </button>
    </div>
  </div>`;
}

export function renderMachines() {
  const { machines, machineFilter, machineQuery } = state;
  const source = machineQuery.trim() ? (searchResults ?? []) : machines;
  const filtered = source.filter(
    (m) => machineFilter === "all" || m.status === machineFilter,
  );

  const content = machineQuery.trim() && searchLoading
    ? '<div class="panel-card panel-card-padded" role="status">Buscando máquinas...</div>'
    : machineQuery.trim() && searchError
      ? `<div class="panel-card panel-card-padded" role="alert">${h(searchError)}</div>`
    : filtered.length
      ? `<div class="machine-cards-grid">${filtered.map(machineCard).join("")}</div>`
    : emptyState(I.cpu, "Nenhuma máquina encontrada");

  return `<div class="view-wrapper">
    <div class="section-page-header">
      <div><div class="section-page-title">Máquinas</div><div class="section-page-subtitle">${machines.length} cadastradas · ${machines.filter((m) => m.status === "operando").length} em operação</div></div>
      ${canWrite() ? `<button class="button-primary" data-action="machines.openAdd">${I.plus} Nova Máquina</button>` : ""}
    </div>
    <div class="actions-toolbar">
      <div class="search-input-wrapper">${I.search}<input class="search-input-field" data-input="machines.setQuery" placeholder="Buscar por nome, setor, local ou nº de série..." value="${h(machineQuery)}"></div>
      <div class="filter-buttons-group">${FILTERS.map(([value, label]) => `<button class="filter-button${machineFilter === value ? " active" : ""}" data-action="machines.setFilter" data-value="${value}">${h(label)}</button>`).join("")}</div>
    </div>
    ${content}
  </div>`;
}

function machineForm(machine) {
  const available = state.sensors.filter((s) => !s.machineId || s.machineId === machine?.id);
  const checks = available
    .map(
      (s) => `
      <label class="sensor-checkbox-label">
        <input type="checkbox" name="sensorId" value="${h(s.id)}" ${machine && (machine.sensorIds || []).includes(s.id) ? "checked" : ""}>
        <span class="font-mono-style sensor-checkbox-name">${h(s.name)}</span>
        <span class="text-muted">${h(SENSOR_TYPE_LABELS[s.type] || s.type)}</span>
      </label>`,
    )
    .join("");

  const statusOptions = metaOptions("machineStatus", MACHINE_STATUS)
    .map((o) => `<option value="${h(o.value)}" ${machine?.status === o.value ? "selected" : ""}>${h(o.label)}</option>`)
    .join("");

  const text = (key, id, label, value, placeholder, extra = "") =>
    `<div class="form-field-group ${extra}"><label class="form-input-label" for="${id}">${label}</label><input id="${id}" data-field="${key}" class="form-input-field" value="${h(value || "")}" placeholder="${placeholder}"></div>`;
  const date = (key, id, label, value) =>
    `<div class="form-field-group"><label class="form-input-label" for="${id}">${label}</label><input id="${id}" data-field="${key}" type="date" class="form-input-field" value="${h(value || "")}"></div>`;

  return `<div class="form-grid-layout">
    ${text("name", "f-name", "Nome da Máquina", machine?.name, "Ex: Compressor CA-02", "full-width")}
    ${text("model", "f-model", "Modelo", machine?.model, "Ex: Atlas Copco GA-90")}
    ${text("manufacturer", "f-manufacturer", "Fabricante", machine?.manufacturer, "Ex: Atlas Copco")}
    ${text("serialNumber", "f-serial", "Número de Série", machine?.serialNumber, "Ex: SN-2026-0042")}
    ${text("location", "f-location", "Localização", machine?.location, "Ex: Galpão B — Setor 3")}
    ${text("department", "f-department", "Departamento", machine?.department, "Ex: Produção")}
    <div class="form-field-group"><label class="form-input-label" for="f-status">Status</label><select id="f-status" data-field="status" class="form-input-field">${statusOptions}</select></div>
    ${date("installDate", "f-installDate", "Data de Instalação", machine?.installDate)}
    ${date("lastMaintenance", "f-lastMaintenance", "Último Manut.", machine?.lastMaintenance)}
    ${date("nextMaintenance", "f-nextMaintenance", "Próx. Manut.", machine?.nextMaintenance)}
    <div class="form-field-group full-width"><label class="form-input-label">Sensores Vinculados</label>
      <div class="sensor-checkbox-grid">${checks || '<span class="text-muted">Nenhum sensor disponível.</span>'}</div></div>
  </div>`;
}

const footer = `<button class="button-cancel" data-action="modal.close">Cancelar</button><button class="button-save" data-action="machines.save">Salvar</button>`;
const value = (id) => document.getElementById(id)?.value || "";

async function save() {
  const name = value("f-name").trim();
  if (!name) {
    toastError("Informe o nome da máquina.");
    markInvalidField("name");
    return;
  }

  const payload = {
    name,
    model: value("f-model"),
    manufacturer: value("f-manufacturer"),
    serialNumber: value("f-serial"),
    location: value("f-location"),
    department: value("f-department"),
    status: value("f-status") || "operando",
    installDate: value("f-installDate"),
    lastMaintenance: value("f-lastMaintenance"),
    nextMaintenance: value("f-nextMaintenance"),
    sensorIds: [...document.querySelectorAll('input[name="sensorId"]:checked')].map((c) => c.value),
  };

  try {
    await saveEntity("machines", state.editingId, payload);
  } catch (error) {
    markInvalidField(error.field);
    throw error;
  }

  await closeModal();
  resetMachineSearch();
  await refreshAllData();
}

async function confirmDelete({ id }) {
  await deleteEntity("machines", id);
  state.machines = state.machines.filter((m) => m.id !== id);
  state.sensors = state.sensors.map((s) => (s.machineId === id ? { ...s, machineId: null } : s));
  state.deleteId = null;
  resetMachineSearch();
  renderView();
  renderChrome();
}

async function showMachineDetails({ id }) {
  const context = `machine-details:${id}`;

  openModal(
    "Detalhes da Máquina",
    '<div class="text-muted" role="status">Carregando detalhes...</div>',
    '<button class="button-cancel" data-action="modal.close">Fechar</button>',
    true,
  );

  state.modalContext = context;

  try {
    const machine = await getMachineById(id);

    // Não modifica outro modal caso o usuário tenha fechado este.
    if (state.modalContext !== context) return;

    const fields = [
      ["ID", machine.id],
      ["Nome", machine.name],
      ["Número de série", machine.serialNumber],
      ["Modelo", machine.model],
      ["Fabricante", machine.manufacturer],
      ["Localização", machine.location],
      ["Departamento", machine.department],
      ["Status", MACHINE_STATUS[machine.status]?.label || machine.status],
      ["Data de instalação", machine.installDate],
      ["Última manutenção", machine.lastMaintenance],
      ["Próxima manutenção", machine.nextMaintenance],
      ["Sensores vinculados", Array.isArray(machine.sensorIds) ? machine.sensorIds.length : 0],
    ];

    const html = fields.map(([label, value]) => `
      <div class="form-field-group">
        <div class="form-input-label">${h(label)}</div>
        <div class="details-value">${h(value === "" || value == null ? "—" : value)}</div>
      </div>
    `).join("");

    const body = document.getElementById("modal_body");
    if (body) body.innerHTML = `<div class="form-grid-layout">${html}</div>`;
  } catch (error) {
    if (state.modalContext !== context) return;

    const body = document.getElementById("modal_body");
    if (body) {
      body.setAttribute("role", "alert");
      body.textContent = error?.message || "Não foi possível carregar os detalhes.";
    }
  }
}

export const machineActions = {
  "machines.openDetails": showMachineDetails,
  "machines.setFilter"({ value: filter }) {
    state.machineFilter = filter;
    renderView();
  },
  "machines.openAdd"() {
    state.editingId = null;
    state.modalContext = "machine";
    openModal("Nova Máquina", machineForm(null), footer, true);
  },
  "machines.openEdit"({ id }) {
    state.editingId = id;
    state.modalContext = "machine";
    openModal("Editar Máquina", machineForm(state.machines.find((m) => m.id === id)), footer, true);
  },
  "machines.save": save,
  "machines.confirmDelete": confirmDelete,
};


export const machineInputs = {
  "machines.setQuery"({ value: query }) {
    const text = String(query ?? "");

    state.machineQuery = text;

    clearTimeout(searchTimer);
    const version = ++searchVersion;

    searchResults = null;
    searchError = "";
    searchLoading = Boolean(text.trim());

    renderView();

    if (!text.trim()) return;

    searchTimer = setTimeout(async () => {
      try {
        const results = await searchMachines(text);

        // Ignora respostas de pesquisas antigas.
        if (version !== searchVersion) return;

        searchResults = results;
      } catch (error) {
        if (version !== searchVersion) return;

        searchError = error instanceof Error
          ? error.message
          : "Não foi possível realizar a pesquisa.";
      } finally {
        if (version === searchVersion) {
          searchLoading = false;
          renderView();
        }
      }
    }, 300);
  },
};