/* Ponto de entrada do painel: registra views e ações e carrega os dados iniciais. */
import { initEvents, registerActions, registerInputs } from "./events.js";
import { fetchJson } from "./api.js";
import { refreshAllData } from "./data.js";
import { registerShell, registerView } from "./view-host.js";
import { renderNav, renderTopbar, navActions } from "./shell.js";
import { renderCurrentUser, showProfileError, logout } from "./session.js";
import { closeModal } from "./ui/modal.js";
import { $, h } from "./utils/dom.js";

import { renderDashboard } from "./views/dashboard.js";
import { renderMachines, machineActions, machineInputs } from "./views/machines.js";
import { renderSensors, sensorActions, sensorInputs } from "./views/sensors.js";
import { renderOrders, orderActions, orderInputs } from "./views/orders.js";
import { renderUsers, userActions, userInputs } from "./views/users.js";
import { renderAudit, auditActions } from "./views/audit.js";
import { renderSettings } from "./views/settings.js";

registerShell({ renderNav, renderTopbar });

registerView("dashboard", renderDashboard);
registerView("machines", renderMachines);
registerView("sensors", renderSensors);
registerView("orders", renderOrders);
registerView("users", renderUsers);
registerView("audit", renderAudit);
registerView("settings", renderSettings);

registerActions({
  ...navActions,
  ...machineActions,
  ...sensorActions,
  ...orderActions,
  ...userActions,
  ...auditActions,
  "modal.close": () => closeModal(),
  "session.logout": logout,
});

registerInputs({
  ...machineInputs,
  ...sensorInputs,
  ...orderInputs,
  ...userInputs,
});

initEvents();

async function boot() {
  const profile = fetchJson("api.php?entity=me")
    .then(renderCurrentUser)
    .catch((error) => {
      console.error("Erro ao carregar perfil do usuário:", error);
      showProfileError(error);
    });

  const data = refreshAllData().catch((error) => {
    console.error("Erro ao carregar dados do banco:", error);
    const view = $("view_container");
    if (view) {
      view.innerHTML = `<div class="view-wrapper"><div class="panel-card panel-card-padded">Não foi possível carregar os dados. ${h(error.message)}</div></div>`;
    }
  });

  await Promise.allSettled([profile, data]);
}

boot();
