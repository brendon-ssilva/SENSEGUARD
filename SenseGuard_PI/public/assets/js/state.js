/* Estado único da interface. Os dados vêm de api.php?entity=all. */

export const state = {
  view: "dashboard",
  currentUserRole: "",
  currentUser: null,
  dataLoaded: false,

  users: [],
  sensors: [],
  machines: [],
  orders: [],
  corporations: [],
  audit: [],
  meta: {},

  machineFilter: "all",
  machineQuery: "",
  sensorFilter: "all",
  sensorQuery: "",
  orderTypeFilter: "all",
  orderStatusFilter: "all",
  orderQuery: "",
  userQuery: "",

  deleteId: null,
  expandedId: null,
  editingId: null,
  modalContext: null,
};

export const canWrite = () => state.currentUserRole === "admin" || state.currentUserRole === "supervisor";
export const isAdmin = () => state.currentUserRole === "admin";
export const isTechnician = () => state.currentUserRole === "tecnico";

/** Opções de um <select>: usa o catálogo do servidor; se faltar, cai para o mapa de apresentação. */
export function metaOptions(metaKey, fallbackMap) {
  const fromServer = state.meta?.[metaKey];
  if (Array.isArray(fromServer) && fromServer.length) return fromServer;
  return Object.entries(fallbackMap).map(([value, info]) => ({ value, label: info.label ?? info }));
}
