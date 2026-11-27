/* View Sensores: tabela com leitura atual, limites e status. */
import { state, canWrite } from "../state.js";
import { h } from "../utils/dom.js";
import { localDateTime } from "../utils/format.js";
import { I } from "../ui/icons.js";
import { badge, dot, emptyRow, rowActions } from "../ui/components.js";
import { openModal, closeModal, markInvalidField } from "../ui/modal.js";
import { toastError } from "../ui/toast.js";
import { saveEntity, deleteEntity } from "../api.js";
import { refreshAllData } from "../data.js";
import { renderView, renderChrome } from "../view-host.js";
import { SENSOR_STATUS, SENSOR_TYPE_CLS, SENSOR_TYPE_LABELS } from "../constants.js";
import { metaOptions } from "../state.js";

const FILTERS = [
  ["all", "Todos"],
  ["online", "Online"],
  ["alerta", "Alerta"],
  ["offline", "Offline"],
];

/** Posição da leitura dentro da faixa [mínimo, máximo], em %. */
function readingPercent(sensor) {
  const range = sensor.maxThreshold - sensor.minThreshold;
  if (sensor.status === "offline" || range <= 0) return 0;
  return Math.min(100, Math.max(0, ((sensor.currentValue - sensor.minThreshold) / range) * 100));
}

function sensorRow(sensor) {
  const status = SENSOR_STATUS[sensor.status] || SENSOR_STATUS.offline;
  const machine = state.machines.find((m) => m.id === sensor.machineId);
  const pct = readingPercent(sensor);
  const tone = pct >= 90 ? "crimson" : pct >= 70 ? "amber" : "emerald";

  const reading =
    sensor.status === "offline"
      ? `<span class="text-muted font-mono-style">—</span>`
      : `<div class="reading-progress-container"><div class="reading-progress-track"><div class="reading-progress-fill tone-${tone}" style="width:${pct}%"></div></div><span class="reading-progress-value">${h(sensor.currentValue)}</span></div>`;

  return `<tr>
    <td><span class="font-mono-style sensor-name">${h(sensor.name)}</span></td>
    <td>${badge(SENSOR_TYPE_CLS[sensor.type] || "muted", SENSOR_TYPE_LABELS[sensor.type] || sensor.type)}</td>
    <td>${reading}</td>
    <td class="table-cell-mono">${h(sensor.minThreshold)}–${h(sensor.maxThreshold)} ${h(sensor.unit)}</td>
    <td class="text-muted cell-truncate-sm">${machine ? h(machine.name) : '<span class="cell-faint">—</span>'}</td>
    <td class="text-muted">${h(sensor.location)}</td>
    <td>${dot(status.tone, status.label)}</td>
    <td>${canWrite() ? rowActions("sensors", sensor.id, state.deleteId) : "—"}</td>
  </tr>`;
}

export function renderSensors() {
  const { sensors, sensorFilter, sensorQuery } = state;
  const q = sensorQuery.toLowerCase();
  const filtered = sensors.filter(
    (s) =>
      ((s.name || "").toLowerCase().includes(q) || (s.location || "").toLowerCase().includes(q)) &&
      (sensorFilter === "all" || s.status === sensorFilter),
  );
  const count = (value) => (value === "all" ? sensors.length : sensors.filter((s) => s.status === value).length);

  return `<div class="view-wrapper">
    <div class="section-page-header">
      <div><div class="section-page-title">Sensores</div><div class="section-page-subtitle">${sensors.length} cadastrados · ${count("online")} online</div></div>
      ${canWrite() ? `<button class="button-primary" data-action="sensors.openAdd">${I.plus} Novo Sensor</button>` : ""}
    </div>
    <div class="actions-toolbar">
      <div class="search-input-wrapper">${I.search}<input class="search-input-field" data-input="sensors.setQuery" placeholder="Buscar sensor ou localização..." value="${h(sensorQuery)}"></div>
      <div class="filter-buttons-group">${FILTERS.map(([value, label]) => `<button class="filter-button${sensorFilter === value ? " active" : ""}" data-action="sensors.setFilter" data-value="${value}">${h(label)} <span class="font-mono-style count-pill">${count(value)}</span></button>`).join("")}</div>
    </div>
    <div class="panel-card">
      <div class="table-responsive-wrapper"><table>
        <thead><tr><th>Nome</th><th>Tipo</th><th>Leitura Atual</th><th>Limites</th><th>Máquina</th><th>Localização</th><th>Status</th><th></th></tr></thead>
        <tbody>${filtered.map(sensorRow).join("") || emptyRow(8, I.radio, "Nenhum sensor encontrado")}</tbody>
      </table></div>
    </div>
  </div>`;
}

function sensorForm(sensor) {
  const typeOptions = metaOptions("sensorType", SENSOR_TYPE_LABELS)
    .map((o) => `<option value="${h(o.value)}" ${sensor?.type === o.value ? "selected" : ""}>${h(o.label)}</option>`)
    .join("");
  const machineOptions = state.machines
    .map((m) => `<option value="${h(m.id)}" ${sensor?.machineId === m.id ? "selected" : ""}>${h(m.name)}</option>`)
    .join("");
  const storedOffline = (sensor?.storedStatus || sensor?.status) === "offline";

  const text = (key, id, label, value, placeholder) =>
    `<div class="form-field-group"><label class="form-input-label" for="${id}">${label}</label><input id="${id}" data-field="${key}" class="form-input-field" value="${h(value || "")}" placeholder="${placeholder}"></div>`;
  const number = (key, id, label, value) =>
    `<div class="form-field-group"><label class="form-input-label" for="${id}">${label}</label><input id="${id}" data-field="${key}" type="number" step="any" class="form-input-field" value="${h(value)}"></div>`;

  return `<div class="form-grid-layout">
    ${text("name", "f-name", "Código / Nome", sensor?.name, "Ex: TMP-009")}
    <div class="form-field-group"><label class="form-input-label" for="f-type">Tipo de Sensor</label><select id="f-type" data-field="type" class="form-input-field">${typeOptions}</select></div>
    ${text("unit", "f-unit", "Unidade", sensor?.unit, "Ex: °C, bar, mm/s")}
    ${text("location", "f-location", "Localização", sensor?.location, "Ex: Galpão A")}
    ${number("minThreshold", "f-min", "Valor Mínimo", sensor?.minThreshold ?? 0)}
    ${number("maxThreshold", "f-max", "Valor Máximo", sensor?.maxThreshold ?? 100)}
    ${number("currentValue", "f-val", "Leitura Atual", sensor?.currentValue ?? 0)}
    <div class="form-field-group"><label class="form-input-label" for="f-status">Status</label><select id="f-status" data-field="status" class="form-input-field">
      <option value="online" ${storedOffline ? "" : "selected"}>Automático (pela leitura e limites)</option>
      <option value="offline" ${storedOffline ? "selected" : ""}>Offline</option>
    </select><div class="form-hint">Alerta é calculado automaticamente comparando a leitura com os limites.</div></div>
    <div class="form-field-group full-width"><label class="form-input-label" for="f-machine">Máquina Vinculada</label><select id="f-machine" data-field="machineId" class="form-input-field">
      <option value="">— Nenhuma —</option>${machineOptions}
    </select></div>
  </div>`;
}

const footer = `<button class="button-cancel" data-action="modal.close">Cancelar</button><button class="button-save" data-action="sensors.save">Salvar</button>`;
const value = (id) => document.getElementById(id)?.value ?? "";

async function save() {
  const name = value("f-name").trim();
  if (!name) {
    toastError("Informe o código ou nome do sensor.");
    markInvalidField("name");
    return;
  }

  const minThreshold = Number(value("f-min") || 0);
  const maxThreshold = Number(value("f-max") || 100);
  const currentValue = Number(value("f-val") || 0);
  if (minThreshold > maxThreshold) {
    toastError("O valor mínimo não pode ser maior que o máximo.");
    markInvalidField("minThreshold");
    return;
  }

  const previous = state.sensors.find((s) => s.id === state.editingId);
  const payload = {
    name,
    type: value("f-type") || "temperatura",
    unit: value("f-unit"),
    location: value("f-location"),
    minThreshold,
    maxThreshold,
    currentValue,
    status: value("f-status") || "online",
    machineId: value("f-machine") || null,
  };
  // Só marca nova data de leitura quando a leitura foi digitada/alterada manualmente.
  if (!previous || Number(previous.currentValue) !== currentValue) payload.lastReadingAt = localDateTime();

  try {
    await saveEntity("sensors", state.editingId, payload);
  } catch (error) {
    markInvalidField(error.field);
    throw error;
  }

  await closeModal();
  await refreshAllData();
}

async function confirmDelete({ id }) {
  await deleteEntity("sensors", id);
  state.sensors = state.sensors.filter((s) => s.id !== id);
  state.machines = state.machines.map((m) => ({ ...m, sensorIds: (m.sensorIds || []).filter((sid) => sid !== id) }));
  state.deleteId = null;
  renderView();
  renderChrome();
}

export const sensorActions = {
  "sensors.setFilter"({ value: filter }) {
    state.sensorFilter = filter;
    renderView();
  },
  "sensors.openAdd"() {
    state.editingId = null;
    openModal("Novo Sensor", sensorForm(null), footer, true);
  },
  "sensors.openEdit"({ id }) {
    state.editingId = id;
    openModal("Editar Sensor", sensorForm(state.sensors.find((s) => s.id === id)), footer, true);
  },
  "sensors.save": save,
  "sensors.confirmDelete": confirmDelete,
};

export const sensorInputs = {
  "sensors.setQuery"({ value: query }) {
    state.sensorQuery = query;
    renderView();
  },
};
