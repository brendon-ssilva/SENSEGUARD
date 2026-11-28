/*
 * Apresentação dos valores de domínio (cores/tons e rótulos de reserva).
 * Os valores permitidos vêm do servidor (state.meta, endpoint "all"); aqui fica só
 * como cada um é desenhado. "tone" casa com as classes .tone-* do CSS.
 */

export const MACHINE_STATUS = {
  operando: { tone: "emerald", color: "emerald", label: "Operando" },
  alerta: { tone: "amber", color: "amber", label: "Alerta" },
  critico: { tone: "crimson", color: "crimson", label: "Crítico" },
  manutencao: { tone: "orange", color: "orange", label: "Manutenção" },
  inativo: { tone: "muted", color: "muted", label: "Inativo" },
};

export const SENSOR_STATUS = {
  online: { tone: "emerald", color: "text-emerald", label: "Online" },
  offline: { tone: "muted", color: "text-muted", label: "Offline" },
  alerta: { tone: "amber", color: "text-amber", label: "Alerta" },
};

export const MAINT_TYPE = {
  preventiva: { cls: "blue", label: "Preventiva" },
  preditiva: { cls: "violet", label: "Preditiva" },
  corretiva: { cls: "crimson", label: "Corretiva" },
};

export const PRIORITY = {
  baixa: { cls: "muted", label: "Baixa" },
  media: { cls: "blue", label: "Média" },
  alta: { cls: "amber", label: "Alta" },
  critica: { cls: "crimson", label: "Crítica" },
};

export const OS_STATUS = {
  aberta: { tone: "blue", cls: "blue", color: "text-blue", label: "Aberta" },
  em_andamento: { tone: "amber", cls: "amber", color: "text-amber", label: "Em Andamento" },
  concluida: { tone: "emerald", cls: "emerald", color: "text-emerald", label: "Concluída" },
  cancelada: { tone: "muted", cls: "muted", color: "text-muted", label: "Cancelada" },
};

export const USER_ROLE = {
  admin: { cls: "violet", label: "Administrador" },
  supervisor: { cls: "blue", label: "Supervisor" },
  tecnico: { cls: "emerald", label: "Técnico" },
};

export const SENSOR_TYPE_LABELS = {
  temperatura: "Temperatura",
  vibracao: "Vibração",
  pressao: "Pressão",
  corrente: "Corrente",
  umidade: "Umidade",
  rpm: "RPM",
};

export const SENSOR_TYPE_CLS = {
  temperatura: "crimson",
  vibracao: "amber",
  pressao: "blue",
  corrente: "violet",
  umidade: "emerald",
  rpm: "orange",
};

export const AVATAR_TONES = ["violet", "blue", "emerald", "amber"];

export const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "machines", label: "Máquinas", icon: "cpu" },
  { id: "sensors", label: "Sensores", icon: "radio" },
  { id: "readings", label: "Histórico de leituras", icon: "radio" },
  { id: "orders", label: "Ordens de Serviço", icon: "clipboard" },
  { id: "users", label: "Usuários", icon: "users", adminOnly: true },
  { id: "audit", label: "Auditoria", icon: "clipboard", adminOnly: true },
];

export const VIEW_LABEL = {
  dashboard: "Dashboard",
  machines: "Máquinas",
  sensors: "Sensores",
  readings: "Histórico de leituras",
  orders: "Ordens de Serviço",
  users: "Usuários",
  audit: "Auditoria",
  settings: "Configurações",
};

/** Ícone de pílula "Alerta" nos KPIs e cores dos gráficos. */
export const CHART_TONES = {
  preventiva: "var(--blue)",
  preditiva: "var(--violet)",
  corretiva: "var(--crimson)",
  operando: "var(--emerald)",
  alerta: "var(--amber)",
  manutencao: "var(--orange)",
  critico: "var(--crimson)",
  inativo: "var(--muted)",
};
