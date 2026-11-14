/* View Auditoria (somente administradores): quem fez o quê e quando. */
import { state } from "../state.js";
import { h } from "../utils/dom.js";
import { formatDateTime } from "../utils/format.js";
import { I } from "../ui/icons.js";
import { badge, emptyRow } from "../ui/components.js";
import { loadAudit } from "../data.js";
import { toastError } from "../ui/toast.js";

const ACTIONS = {
  criar: { cls: "emerald", label: "Criou" },
  atualizar: { cls: "blue", label: "Alterou" },
  excluir: { cls: "crimson", label: "Excluiu" },
  login: { cls: "muted", label: "Entrou" },
  logout: { cls: "muted", label: "Saiu" },
};

const TARGETS = {
  machines: "Máquina",
  sensors: "Sensor",
  orders: "Ordem de serviço",
  users: "Usuário",
  me: "Perfil",
  auth: "Acesso",
};

const show = (value) => (value === null || value === undefined || value === "" ? "—" : String(value));

/** Resumo legível das alterações: "campo: antes → depois" (ou o nome do registro criado/excluído). */
function summarize(entry) {
  const changes = entry.changes;
  if (!changes || typeof changes !== "object") return "";

  if (entry.action === "atualizar") {
    return Object.entries(changes)
      .map(([field, diff]) => `${field}: ${show(diff?.de)} → ${show(diff?.para)}`)
      .join(" · ");
  }

  const label = changes.nome || changes.titulo || changes.email;
  return label ? String(label) : "";
}

function auditRow(entry) {
  const action = ACTIONS[entry.action] || { cls: "muted", label: entry.action };
  const summary = summarize(entry);

  return `<tr>
    <td class="table-cell-mono">${h(formatDateTime(entry.at))}</td>
    <td>${h(entry.userName || "—")}</td>
    <td>${badge(action.cls, action.label)}</td>
    <td>${h(TARGETS[entry.target] || entry.target)}</td>
    <td class="table-cell-mono">${h(entry.recordId || "—")}</td>
    <td><div class="audit-changes" title="${h(summary)}">${h(summary || "—")}</div></td>
    <td class="table-cell-mono">${h(entry.ip)}</td>
  </tr>`;
}

export function renderAudit() {
  return `<div class="view-wrapper">
    <div class="section-page-header">
      <div><div class="section-page-title">Auditoria</div><div class="section-page-subtitle">Últimos ${state.audit.length} eventos registrados</div></div>
      <button class="button-primary" data-action="audit.refresh">Atualizar</button>
    </div>
    <div class="panel-card">
      <div class="table-responsive-wrapper"><table>
        <thead><tr><th>Data e hora</th><th>Usuário</th><th>Ação</th><th>Entidade</th><th>Registro</th><th>Alterações</th><th>IP</th></tr></thead>
        <tbody>${state.audit.map(auditRow).join("") || emptyRow(7, I.clipboard, "Nenhum evento registrado")}</tbody>
      </table></div>
    </div>
  </div>`;
}

export const auditActions = {
  async "audit.refresh"() {
    try {
      await loadAudit();
    } catch (error) {
      toastError(error.message || "Não foi possível carregar a auditoria.");
    }
  },
};
