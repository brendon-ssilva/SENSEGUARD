/* Carga e atualização dos dados do painel. */
import { state } from "./state.js";
import { fetchJson } from "./api.js";
import { renderAll, renderView } from "./view-host.js";

const list = (value) => (Array.isArray(value) ? value : []);

export async function refreshAllData() {
  const data = await fetchJson("api.php?entity=all");
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("A API retornou uma estrutura de dados inválida.");
  }

  state.users = list(data.users);
  state.machines = list(data.machines);
  state.sensors = list(data.sensors);
  state.orders = list(data.orders);
  state.corporations = list(data.corporations);
  state.meta = data.meta && typeof data.meta === "object" ? data.meta : {};
  state.dataLoaded = true;
  renderAll();
}

/** Insere ou substitui um registro numa lista do estado (usado após salvar ordens e usuários). */
export function upsert(listName, record) {
  const id = String(record.id);
  const items = state[listName];
  const index = items.findIndex((item) => String(item.id) === id);
  state[listName] = index === -1 ? [...items, record] : items.map((item, i) => (i === index ? { ...item, ...record } : item));
}

export async function loadAudit() {
  state.audit = list(await fetchJson("api.php?entity=audit&limit=200"));
  renderView();
}
