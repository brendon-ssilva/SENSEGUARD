import { test } from "node:test";
import assert from "node:assert/strict";

import { h } from "../../public/assets/js/utils/dom.js";
import { daysUntil, formatDateTime, avatarInitials, localDateTime } from "../../public/assets/js/utils/format.js";
import { renderBarChart, renderDonut } from "../../public/assets/js/ui/charts.js";
import { state } from "../../public/assets/js/state.js";
import { renderDashboard } from "../../public/assets/js/views/dashboard.js";
import { renderMachines } from "../../public/assets/js/views/machines.js";
import { renderSensors } from "../../public/assets/js/views/sensors.js";
import { renderOrders } from "../../public/assets/js/views/orders.js";
import { renderUsers } from "../../public/assets/js/views/users.js";
import { renderAudit } from "../../public/assets/js/views/audit.js";

const month = new Date().toISOString().slice(0, 7);

function seed(role = "admin") {
  Object.assign(state, {
    currentUserRole: role,
    currentUser: { id: "2", name: "Ana", role },
    deleteId: null,
    expandedId: null,
    users: [
      { id: "1", name: "Admin <b>", email: "a@x.com", phone: "", role: "admin", status: "ativo", createdAt: "2026-01-01 10:00:00" },
      { id: "2", name: "Ana", email: "ana@x.com", phone: "", role: "tecnico", status: "ativo", createdAt: "2026-01-02 10:00:00" },
    ],
    machines: [
      { id: "1", name: 'Prensa "X"', serialNumber: "SN-1", model: "M1", manufacturer: "F", location: "A", department: "P", status: "operando", installDate: "", lastMaintenance: "", nextMaintenance: "2020-01-01", sensorIds: ["1", "2"] },
      { id: "2", name: "Torno", serialNumber: "", model: "", manufacturer: "", location: "", department: "", status: "critico", installDate: "", lastMaintenance: "", nextMaintenance: "", sensorIds: [] },
    ],
    sensors: [
      { id: "1", name: "TMP-1", type: "temperatura", unit: "°C", location: "A", minThreshold: 0, maxThreshold: 100, currentValue: 120, status: "alerta", storedStatus: "alerta", machineId: "1", lastReadingAt: "2026-01-01 10:00:00" },
      { id: "2", name: "VIB-1", type: "vibracao", unit: "mm/s", location: "A", minThreshold: 5, maxThreshold: 10, currentValue: 1, status: "alerta", storedStatus: "alerta", machineId: "1", lastReadingAt: "" },
      { id: "3", name: "PRS-1", type: "pressao", unit: "bar", location: "", minThreshold: 0, maxThreshold: 10, currentValue: 0, status: "offline", storedStatus: "offline", machineId: null, lastReadingAt: "" },
    ],
    orders: [
      { id: "7", code: "OS-2026-00007", title: "Trocar <script>", description: "x", type: "corretiva", priority: "critica", status: "concluida", estimatedHours: 2, scheduledFor: "", createdAt: `${month}-01 08:00:00`, completedAt: `${month}-02 08:00:00`, machineId: "1", assignedToId: "2", createdById: "1" },
      { id: "8", code: "OS-2026-00008", title: "Lubrificar", description: "", type: "preventiva", priority: "baixa", status: "aberta", estimatedHours: 1, scheduledFor: "2026-12-01", createdAt: "2026-01-01 08:00:00", completedAt: "", machineId: "2", assignedToId: "1", createdById: null },
    ],
    audit: [
      { id: "1", at: "2026-11-04 10:00:00", userId: "1", userName: "Admin", target: "machines", recordId: "1", action: "atualizar", changes: { nome: { de: "A", para: "B" } }, ip: "127.0.0.1" },
      { id: "2", at: "2026-11-04 10:01:00", userId: "1", userName: "Admin", target: "auth", recordId: "1", action: "login", changes: null, ip: "127.0.0.1" },
    ],
    meta: {},
  });
}

test("h escapa HTML, aspas duplas e simples", () => {
  assert.equal(h(`<a href="x" onclick='y'>&`), "&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;");
  assert.equal(h(null), "");
  assert.equal(h(0), "0");
});

test("utilitários de formato", () => {
  assert.equal(formatDateTime("2026-11-04 18:30:00"), "04/11/2026 18:30");
  assert.equal(avatarInitials("maria  da silva"), "MD");
  assert.equal(daysUntil("não-é-data"), null);
  assert.equal(daysUntil(""), null);
  assert.match(localDateTime(), /^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/);
});

test("gráfico de barras não quebra (regressão do parâmetro h que escondia a função h)", () => {
  const svg = renderBarChart([{ name: "Operando", value: 3, color: "var(--emerald)" }, { name: "Crítico com nome longo", value: 1, color: "var(--crimson)" }], 360, 160);
  assert.match(svg, /<svg width="360" height="160"/);
  assert.match(svg, /Operando/);
  assert.equal(renderBarChart([]), "");
  assert.match(renderDonut([{ name: "a", value: 1, color: "red" }]), /<path/);
});

test("dashboard: KPIs, alertas e escape de HTML", () => {
  seed();
  const { html } = renderDashboard();
  assert.match(html, /abaixo do limite mínimo de 5/, "alerta abaixo do mínimo");
  assert.match(html, /acima do limite máximo de 100/, "alerta acima do máximo");
  assert.match(html, /Concluídas no mês/);
  assert.doesNotMatch(html, /<script>/, "título da OS escapado");
  assert.doesNotMatch(html, /onclick=/, "sem handlers inline");
  assert.match(html, /OS-2026-00007/);
});

test("máquinas, sensores, ordens, usuários e auditoria renderizam sem handlers inline", () => {
  seed("admin");
  for (const render of [renderMachines, renderSensors, renderOrders, renderUsers, renderAudit]) {
    const out = render();
    const html = typeof out === "string" ? out : out.html;
    assert.ok(html.length > 200);
    assert.doesNotMatch(html, /onclick=|oninput=|onchange=/);
  }
  assert.match(renderMachines(), /Nº de série/);
  assert.match(renderMachines(), /Prensa &quot;X&quot;/);
  assert.match(renderAudit(), /nome: A → B/);
});

test("permissões: técnico só edita a própria OS e não vê botões de cadastro", () => {
  seed("tecnico");
  const html = renderOrders();
  assert.doesNotMatch(html, /data-action="orders\.openAdd"/);
  assert.match(html, /data-action="orders\.openStatusEdit" data-id="7"/, "OS atribuída a ele (id 2)");
  assert.doesNotMatch(html, /data-action="orders\.openStatusEdit" data-id="8"/);
  assert.doesNotMatch(renderMachines(), /machines\.openAdd/);
});

test("estado de exclusão mostra confirmar/cancelar", () => {
  seed("admin");
  state.deleteId = "1";
  assert.match(renderSensors(), /data-action="sensors\.confirmDelete" data-id="1"/);
  assert.match(renderSensors(), /data-action="delete\.clear"/);
  state.deleteId = null;
});
