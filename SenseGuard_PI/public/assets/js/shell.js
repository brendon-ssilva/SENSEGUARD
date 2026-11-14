/* Casca do painel: menu lateral, barra superior e navegação entre views. */
import { state, isAdmin } from "./state.js";
import { h, $ } from "./utils/dom.js";
import { I } from "./ui/icons.js";
import { NAV_ITEMS, VIEW_LABEL } from "./constants.js";
import { renderAll, renderView } from "./view-host.js";
import { loadAudit } from "./data.js";
import { toastError } from "./ui/toast.js";

function counters() {
  const alertCount = state.sensors.filter((s) => s.status === "alerta" || s.status === "offline").length;
  const criticalOrders = state.orders.filter(
    (o) => o.priority === "critica" && (o.status === "aberta" || o.status === "em_andamento"),
  ).length;
  return { alertCount, criticalOrders };
}

export function renderNav() {
  const { alertCount, criticalOrders } = counters();
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin());

  $("navigation_menu").innerHTML = items
    .map((item) => {
      let badge = "";
      if (item.id === "sensors" && alertCount > 0) badge = `<span class="nav-badge amber">${alertCount}</span>`;
      if (item.id === "orders" && criticalOrders > 0) badge = `<span class="nav-badge crimson">${criticalOrders}</span>`;
      const active = state.view === item.id ? " active" : "";
      return `<button class="nav-button${active}" data-action="nav.go" data-view="${h(item.id)}">${I[item.icon]}${h(item.label)}${badge}</button>`;
    })
    .join("");

  $("settings_nav_button")?.classList.toggle("active", state.view === "settings");
}

export function renderTopbar() {
  const { alertCount, criticalOrders } = counters();
  const date = new Date().toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

  let chips = "";
  if (alertCount > 0) {
    chips += `<button class="alert-chip amber" data-action="nav.go" data-view="sensors">${I.alert}&nbsp;${alertCount} alerta${alertCount > 1 ? "s" : ""} ativo${alertCount > 1 ? "s" : ""}</button>`;
  }
  if (criticalOrders > 0) {
    chips += `<button class="alert-chip crimson" data-action="nav.go" data-view="orders">${I.alert}&nbsp;${criticalOrders} OS crítica${criticalOrders > 1 ? "s" : ""}</button>`;
  }

  $("topbar_header").innerHTML = `
    <div class="breadcrumb-trail">SenseGuard ${I.chevronR} <span class="current">${h(VIEW_LABEL[state.view] || "")}</span></div>
    <div class="topbar-actions">${chips}<span class="date-display">${h(date)}</span></div>`;
}

export const navActions = {
  async "nav.go"({ view }) {
    const target = VIEW_LABEL[view] ? view : "dashboard";
    if ((target === "users" || target === "audit") && !isAdmin()) return;

    state.view = target;
    state.deleteId = null;
    await renderAll({ animate: true });

    if (target === "audit") {
      try {
        await loadAudit();
      } catch (error) {
        toastError(error.message || "Não foi possível carregar a auditoria.");
      }
    }
  },

  "delete.set"({ id }) {
    state.deleteId = id;
    renderView();
  },

  "delete.clear"() {
    state.deleteId = null;
    renderView();
  },
};
