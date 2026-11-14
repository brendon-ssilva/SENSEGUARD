/* View Dashboard: alertas, KPIs, gráficos e ordens recentes. */
import { state } from "../state.js";
import { h } from "../utils/dom.js";
import { I } from "../ui/icons.js";
import { badge } from "../ui/components.js";
import { renderDonut, renderBarChart } from "../ui/charts.js";
import { countUp } from "../ui/motion.js";
import { CHART_TONES, MAINT_TYPE, OS_STATUS, PRIORITY } from "../constants.js";

/** Mensagem do alerta: abaixo do mínimo ou acima do máximo, conforme a leitura. */
function thresholdMessage(sensor) {
  const unit = h(sensor.unit);
  if (sensor.currentValue < sensor.minThreshold) {
    return `Valor ${sensor.currentValue}${unit} abaixo do limite mínimo de ${sensor.minThreshold}${unit}`;
  }
  return `Valor ${sensor.currentValue}${unit} acima do limite máximo de ${sensor.maxThreshold}${unit}`;
}

function renderAlerts(sensors) {
  const alerting = sensors.filter((s) => s.status === "alerta");
  const offline = sensors.filter((s) => s.status === "offline");
  if (!alerting.length && !offline.length) return "";

  return `<div class="alerts-grid">
    ${alerting
      .map(
        (s) => `<div class="alert-notification amber">${I.alert}<div><span class="alert-notification-name">${h(s.name)}</span> <span>${thresholdMessage(s)}</span></div></div>`,
      )
      .join("")}
    ${offline
      .map(
        (s) => `<div class="alert-notification crimson">${I.alert}<div><span class="alert-notification-name">${h(s.name)}</span> <span>Sensor offline — última leitura ${h(s.lastReadingAt)}</span></div></div>`,
      )
      .join("")}
  </div>`;
}

function currentMonthPrefix() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function buildKpis() {
  const { sensors, machines, orders } = state;
  const month = currentMonthPrefix();
  const done = orders.filter((o) => o.status === "concluida");

  return [
    { id: "machines", label: "Máquinas Ativas", val: machines.filter((m) => m.status !== "inativo").length, sub: `${machines.length} cadastradas`, tone: "blue" },
    { id: "sensors", label: "Sensores Online", val: sensors.filter((s) => s.status === "online").length, sub: `${sensors.length} cadastrados`, tone: "emerald" },
    {
      id: "orders-open",
      view: "orders",
      label: "OS Abertas",
      val: orders.filter((o) => o.status === "aberta" || o.status === "em_andamento").length,
      sub: `${orders.filter((o) => o.status === "em_andamento").length} em andamento`,
      tone: "amber",
    },
    {
      id: "orders-done",
      view: "orders",
      label: "Concluídas no mês",
      val: done.filter((o) => String(o.completedAt || "").startsWith(month)).length,
      sub: `${done.length} concluídas no total`,
      tone: "emerald",
    },
  ];
}

function renderKpis(kpis) {
  return `<div class="kpi-grid-container">${kpis
    .map(
      (k) => `
    <button class="kpi-widget tone-${k.tone}" data-action="nav.go" data-view="${h(k.view || k.id)}">
      <div class="kpi-widget-header">
        <div class="kpi-widget-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>
        </div>
        <span class="kpi-widget-arrow">${I.arrow}</span>
      </div>
      <div class="kpi-widget-value" id="kpi-${h(k.id)}">${k.val}</div>
      <div class="kpi-widget-label">${h(k.label)}</div>
      <div class="kpi-widget-subtitle">${h(k.sub)}</div>
    </button>`,
    )
    .join("")}</div>`;
}

function renderCharts() {
  const { machines, orders } = state;

  const maintData = ["preventiva", "preditiva", "corretiva"]
    .map((type) => ({
      name: MAINT_TYPE[type].label,
      value: orders.filter((o) => o.type === type).length,
      color: CHART_TONES[type],
    }))
    .filter((d) => d.value > 0);

  const machineStatusData = [
    ["operando", "Operando"],
    ["alerta", "Alerta"],
    ["manutencao", "Manutenção"],
    ["critico", "Crítico"],
    ["inativo", "Inativo"],
  ]
    .map(([status, name]) => ({
      name,
      value: machines.filter((m) => m.status === status).length,
      color: CHART_TONES[status],
    }))
    .filter((d) => d.value > 0);

  return `<div class="charts-grid">
    <div class="panel-card panel-card-padded">
      <div class="chart-header-title">${I.trend} Ordens por Tipo de Manutenção</div>
      <div class="chart-donut-wrapper">
        ${renderDonut(maintData)}
        <div class="chart-legend">
          ${maintData
            .map(
              (d) => `<div class="legend-item-row"><div class="legend-item-label"><span class="legend-dot" style="background:${d.color}"></span>${h(d.name)}</div><span class="legend-item-value">${d.value}</span></div>`,
            )
            .join("")}
          <div class="legend-item-row legend-divider"><div class="legend-item-label">Total</div><span class="legend-item-value">${orders.length}</span></div>
        </div>
      </div>
    </div>
    <div class="panel-card panel-card-padded">
      <div class="chart-header-title">${I.cpu} Status das Máquinas</div>
      ${renderBarChart(machineStatusData, 360, 160)}
    </div>
  </div>`;
}

function renderRecentOrders() {
  const { orders, machines } = state;
  const recent = [...orders].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")).slice(0, 5);

  const rows = recent
    .map((o) => {
      const machine = machines.find((m) => m.id === o.machineId);
      const status = OS_STATUS[o.status];
      return `<tr>
        <td class="table-cell-mono">${h(o.code || o.id)}</td>
        <td class="table-cell-highlight cell-truncate">${h(o.title)}</td>
        <td class="text-muted">${machine ? h(machine.name) : "—"}</td>
        <td>${badge(MAINT_TYPE[o.type]?.cls || "muted", MAINT_TYPE[o.type]?.label || o.type)}</td>
        <td>${badge(PRIORITY[o.priority]?.cls || "muted", PRIORITY[o.priority]?.label || o.priority)}</td>
        <td>${badge(status?.cls || "muted", status?.label || o.status)}</td>
      </tr>`;
    })
    .join("");

  return `<div class="panel-card margin-top-24">
    <div class="panel-header-bar">
      <div class="panel-header-title">${I.wrench} Ordens de Serviço Recentes</div>
      <button class="link-button-blue" data-action="nav.go" data-view="orders">Ver todas ${I.arrow}</button>
    </div>
    <div class="table-responsive-wrapper"><table>
      <thead><tr><th>Código</th><th>Título</th><th>Máquina</th><th>Tipo</th><th>Prioridade</th><th>Status</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
  </div>`;
}

export function renderDashboard() {
  const kpis = buildKpis();
  const html = `<div class="view-wrapper">${renderAlerts(state.sensors)}${renderKpis(kpis)}${renderCharts()}${renderRecentOrders()}</div>`;

  return {
    html,
    after() {
      for (const kpi of kpis) countUp(document.getElementById(`kpi-${kpi.id}`), kpi.val, { duration: 0.8 });
    },
  };
}
