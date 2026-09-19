const I = {
  dashboard: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  cpu: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>`,
  radio: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></svg>`,
  clipboard: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>`,
  users: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  alert: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  pencil: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  trash: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
  plus: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  search: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  arrow: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  chevron: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
  chevronR: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
  wrench: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  trend: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
};

const DATA = {
  users: [
    {
      id: "u1",
      name: "Carlos Mendes",
      email: "carlos.mendes@industria.com",
      role: "admin",
      status: "ativo",
      phone: "(11) 98765-4321",
      createdAt: "2024-01-15",
    },
    {
      id: "u2",
      name: "Ana Ribeiro",
      email: "ana.ribeiro@industria.com",
      role: "supervisor",
      status: "ativo",
      phone: "(11) 91234-5678",
      createdAt: "2024-02-20",
    },
    {
      id: "u3",
      name: "Marcos Ferreira",
      email: "marcos.ferreira@industria.com",
      role: "tecnico",
      status: "ativo",
      phone: "(11) 94567-8901",
      createdAt: "2024-03-10",
    },
    {
      id: "u4",
      name: "Juliana Costa",
      email: "juliana.costa@industria.com",
      role: "tecnico",
      status: "ativo",
      phone: "(11) 97890-1234",
      createdAt: "2024-04-05",
    },
    {
      id: "u5",
      name: "Roberto Lima",
      email: "roberto.lima@industria.com",
      role: "tecnico",
      status: "inativo",
      phone: "(11) 93456-7890",
      createdAt: "2024-05-18",
    },
    {
      id: "u6",
      name: "Fernanda Oliveira",
      email: "fernanda.oliveira@industria.com",
      role: "supervisor",
      status: "ativo",
      phone: "(11) 92345-6789",
      createdAt: "2024-06-22",
    },
  ],
  sensors: [
    {
      id: "s1",
      name: "TMP-001",
      type: "temperatura",
      unit: "°C",
      machineId: "m1",
      status: "online",
      currentValue: 72.4,
      minThreshold: 0,
      maxThreshold: 85,
      lastReadingAt: "2026-09-01 08:34:12",
      location: "Galpão A",
    },
    {
      id: "s2",
      name: "VIB-002",
      type: "vibracao",
      unit: "mm/s",
      machineId: "m1",
      status: "alerta",
      currentValue: 12.8,
      minThreshold: 0,
      maxThreshold: 10,
      lastReadingAt: "2026-09-01 08:34:12",
      location: "Galpão A",
    },
    {
      id: "s3",
      name: "TMP-003",
      type: "temperatura",
      unit: "°C",
      machineId: "m2",
      status: "online",
      currentValue: 45.1,
      minThreshold: 0,
      maxThreshold: 80,
      lastReadingAt: "2026-09-01 08:33:55",
      location: "Galpão B",
    },
    {
      id: "s4",
      name: "PRE-004",
      type: "pressao",
      unit: "bar",
      machineId: "m2",
      status: "online",
      currentValue: 3.2,
      minThreshold: 1,
      maxThreshold: 6,
      lastReadingAt: "2026-09-01 08:33:55",
      location: "Galpão B",
    },
    {
      id: "s5",
      name: "COR-005",
      type: "corrente",
      unit: "A",
      machineId: "m3",
      status: "offline",
      currentValue: 0,
      minThreshold: 0,
      maxThreshold: 50,
      lastReadingAt: "2026-08-30 14:22:10",
      location: "Galpão C",
    },
    {
      id: "s6",
      name: "RPM-006",
      type: "rpm",
      unit: "RPM",
      machineId: "m3",
      status: "offline",
      currentValue: 0,
      minThreshold: 0,
      maxThreshold: 3600,
      lastReadingAt: "2026-08-30 14:22:10",
      location: "Galpão C",
    },
    {
      id: "s7",
      name: "TMP-007",
      type: "temperatura",
      unit: "°C",
      machineId: "m4",
      status: "online",
      currentValue: 38.9,
      minThreshold: 0,
      maxThreshold: 70,
      lastReadingAt: "2026-09-01 08:34:01",
      location: "Galpão A",
    },
    {
      id: "s8",
      name: "UMI-008",
      type: "umidade",
      unit: "%RH",
      machineId: null,
      status: "online",
      currentValue: 65.3,
      minThreshold: 30,
      maxThreshold: 80,
      lastReadingAt: "2026-09-01 08:34:05",
      location: "Sala de Controle",
    },
  ],
  machines: [
    {
      id: "m1",
      name: "Compressor CA-01",
      model: "Atlas Copco GA-110",
      manufacturer: "Atlas Copco",
      location: "Galpão A — Setor 1",
      department: "Produção",
      sensorIds: ["s1", "s2"],
      status: "alerta",
      lastMaintenance: "2026-07-15",
      nextMaintenance: "2026-10-15",
      installDate: "2020-03-10",
    },
    {
      id: "m2",
      name: "Bomba Hidráulica BH-02",
      model: "Grundfos CM10-2",
      manufacturer: "Grundfos",
      location: "Galpão B — Setor 2",
      department: "Utilidades",
      sensorIds: ["s3", "s4"],
      status: "operando",
      lastMaintenance: "2026-08-01",
      nextMaintenance: "2026-11-01",
      installDate: "2019-06-20",
    },
    {
      id: "m3",
      name: "Torno CNC TC-03",
      model: "Romi D-600",
      manufacturer: "Romi",
      location: "Galpão C — Setor 1",
      department: "Usinagem",
      sensorIds: ["s5", "s6"],
      status: "manutencao",
      lastMaintenance: "2026-08-28",
      nextMaintenance: "2026-11-28",
      installDate: "2021-09-15",
    },
    {
      id: "m4",
      name: "Forno Industrial FI-04",
      model: "Thermex T-500",
      manufacturer: "Thermex",
      location: "Galpão A — Setor 3",
      department: "Tratamento Térmico",
      sensorIds: ["s7"],
      status: "operando",
      lastMaintenance: "2026-06-10",
      nextMaintenance: "2026-09-10",
      installDate: "2018-11-05",
    },
    {
      id: "m5",
      name: "Esteira ET-05",
      model: "FlexLink XS-80",
      manufacturer: "FlexLink",
      location: "Galpão D — Setor 2",
      department: "Logística",
      sensorIds: [],
      status: "inativo",
      lastMaintenance: "2026-05-20",
      nextMaintenance: "2026-08-20",
      installDate: "2022-01-30",
    },
  ],
  orders: [
    {
      id: "OS-2026-001",
      title: "Troca de filtro de ar — CA-01",
      machineId: "m1",
      type: "preventiva",
      priority: "media",
      status: "concluida",
      assignedToId: "u3",
      createdAt: "2026-07-10",
      scheduledFor: "2026-07-15",
      completedAt: "2026-07-15",
      description:
        "Substituição dos filtros de ar do compressor conforme plano de manutenção semestral.",
      estimatedHours: 2,
    },
    {
      id: "OS-2026-038",
      title: "Manutenção preventiva — BH-02",
      machineId: "m2",
      type: "preventiva",
      priority: "baixa",
      status: "aberta",
      assignedToId: "u4",
      createdAt: "2026-08-25",
      scheduledFor: "2026-09-05",
      completedAt: null,
      description:
        "Manutenção trimestral: inspeção de selos, verificação de rolamentos e lubrificação geral.",
      estimatedHours: 3,
    },
    {
      id: "OS-2026-039",
      title: "Falha elétrica — TC-03",
      machineId: "m3",
      type: "corretiva",
      priority: "critica",
      status: "em_andamento",
      assignedToId: "u3",
      createdAt: "2026-08-28",
      scheduledFor: "2026-08-28",
      completedAt: null,
      description:
        "Torno CNC parou inesperadamente. Sensores COR-005 e RPM-006 offline. Investigar sistema elétrico e painéis.",
      estimatedHours: 8,
    },
    {
      id: "OS-2026-040",
      title: "Calibração de sensores — FI-04",
      machineId: "m4",
      type: "preventiva",
      priority: "media",
      status: "aberta",
      assignedToId: "u4",
      createdAt: "2026-08-29",
      scheduledFor: "2026-09-10",
      completedAt: null,
      description:
        "Calibração anual dos sensores de temperatura do forno industrial.",
      estimatedHours: 2,
    },
    {
      id: "OS-2026-042",
      title: "Vibração anormal — CA-01",
      machineId: "m1",
      type: "preditiva",
      priority: "alta",
      status: "em_andamento",
      assignedToId: "u3",
      createdAt: "2026-08-30",
      scheduledFor: "2026-09-01",
      completedAt: null,
      description:
        "Sensor VIB-002 registrando 12.8 mm/s (limite: 10). Verificar rolamentos e alinhamento do eixo.",
      estimatedHours: 4,
    },
    {
      id: "OS-2026-043",
      title: "Inspeção termográfica — BH-02",
      machineId: "m2",
      type: "preditiva",
      priority: "baixa",
      status: "aberta",
      assignedToId: "u3",
      createdAt: "2026-09-01",
      scheduledFor: "2026-09-15",
      completedAt: null,
      description:
        "Análise de vibração e termografia da bomba hidráulica conforme plano preditivo.",
      estimatedHours: 2,
    },
    {
      id: "OS-2026-035",
      title: "Revisão geral — ET-05",
      machineId: "m5",
      type: "preventiva",
      priority: "baixa",
      status: "cancelada",
      assignedToId: "u4",
      createdAt: "2026-08-10",
      scheduledFor: "2026-08-20",
      completedAt: null,
      description:
        "Revisão da correia transportadora e sistema de acionamento elétrico.",
      estimatedHours: 6,
    },
  ],
};

const state = {
  view: "dashboard",
  users: JSON.parse(JSON.stringify(DATA.users)),
  sensors: JSON.parse(JSON.stringify(DATA.sensors)),
  machines: JSON.parse(JSON.stringify(DATA.machines)),
  orders: JSON.parse(JSON.stringify(DATA.orders)),
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

const MACHINE_STATUS = {
  operando: { dot: "var(--emerald)", color: "emerald", label: "Operando" },
  alerta: { dot: "var(--amber)", color: "amber", label: "Alerta" },
  critico: { dot: "var(--crimson)", color: "crimson", label: "Crítico" },
  manutencao: { dot: "var(--orange)", color: "orange", label: "Manutenção" },
  inativo: { dot: "var(--muted)", color: "muted", label: "Inativo" },
};
const SENSOR_STATUS = {
  online: { dot: "var(--emerald)", color: "text-emerald", label: "Online" },
  offline: { dot: "var(--muted)", color: "text-muted", label: "Offline" },
  alerta: { dot: "var(--amber)", color: "text-amber", label: "Alerta" },
};
const MAINT_TYPE = {
  preventiva: { cls: "blue", label: "Preventiva" },
  preditiva: { cls: "violet", label: "Preditiva" },
  corretiva: { cls: "crimson", label: "Corretiva" },
};
const PRIORITY = {
  baixa: { cls: "muted", label: "Baixa" },
  media: { cls: "blue", label: "Média" },
  alta: { cls: "amber", label: "Alta" },
  critica: { cls: "crimson", label: "Crítica" },
};
const OS_STATUS = {
  aberta: { dot: "var(--blue)", color: "text-blue", label: "Aberta" },
  em_andamento: {
    dot: "var(--amber)",
    color: "text-amber",
    label: "Em Andamento",
  },
  concluida: {
    dot: "var(--emerald)",
    color: "text-emerald",
    label: "Concluída",
  },
  cancelada: { dot: "var(--muted)", color: "text-muted", label: "Cancelada" },
};
const USER_ROLE = {
  admin: { cls: "violet", label: "Administrador" },
  supervisor: { cls: "blue", label: "Supervisor" },
  tecnico: { cls: "emerald", label: "Técnico" },
};
const SENSOR_TYPE_LABELS = {
  temperatura: "Temperatura",
  vibracao: "Vibração",
  pressao: "Pressão",
  corrente: "Corrente",
  umidade: "Umidade",
  rpm: "RPM",
};
const SENSOR_TYPE_CLS = {
  temperatura: "crimson",
  vibracao: "amber",
  pressao: "blue",
  corrente: "violet",
  umidade: "emerald",
  rpm: "orange",
};
const AVATAR_COLORS = [
  "background:var(--violet-dim);color:var(--violet)",
  "background:var(--blue-dim);color:var(--blue)",
  "background:var(--emerald-dim);color:var(--emerald)",
  "background:var(--amber-dim);color:var(--amber)",
];

function h(s) {
  if (s === null || s === undefined) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function badge(cls, label) {
  return `<span class="status-badge ${cls}">${h(label)}</span>`;
}
function dot(color, label) {
  return `<div style="display:flex;align-items:center;gap:6px"><span class="status-dot" style="background:${color}"></span><span>${h(label)}</span></div>`;
}
function daysUntil(d) {
  if (!d) return null;
  return Math.ceil((new Date(d) - Date.now()) / 86400000);
}
function avatarInitials(name) {
  if (!name) return "";
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function polar(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
function donutArc(cx, cy, ro, ri, a1, a2) {
  const o1 = polar(cx, cy, ro, a1),
    o2 = polar(cx, cy, ro, a2);
  const i1 = polar(cx, cy, ri, a2),
    i2 = polar(cx, cy, ri, a1);
  const large = a2 - a1 > 180 ? 1 : 0;
  return `M${o1.x} ${o1.y} A${ro} ${ro} 0 ${large} 1 ${o2.x} ${o2.y} L${i1.x} ${i1.y} A${ri} ${ri} 0 ${large} 0 ${i2.x} ${i2.y} Z`;
}
function renderDonut(data, size = 160, ro = 68, ri = 48) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total)
    return `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${ro}" fill="none" stroke="var(--border)" stroke-width="${ro - ri}"/></svg>`;
  let angle = -90,
    paths = "";
  for (const d of data) {
    const sweep = (d.value / total) * 360;
    const a2 = angle + sweep - 2;
    if (sweep > 2)
      paths += `<path d="${donutArc(size / 2, size / 2, ro, ri, angle, a2)}" fill="${d.color}"/>`;
    angle += sweep;
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${paths}</svg>`;
}
function renderBarChart(data, w = 340, h = 160) {
  if (!data.length) return "";
  const maxV = Math.max(...data.map((d) => d.value), 1);
  const padL = 24,
    padB = 30,
    padT = 10,
    padR = 10;
  const cw = w - padL - padR,
    ch = h - padB - padT;
  const bw = Math.min(36, cw / data.length - 12);
  const gap = (cw - bw * data.length) / (data.length + 1);
  let bars = "",
    labels = "",
    ylines = "";
  for (let i = 0; i <= maxV; i++) {
    if (i > maxV) break;
    const y = padT + ch - (i / maxV) * ch;
    ylines += `<line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="var(--border)" stroke-width=".5"/>`;
    if (i === 0 || i === Math.ceil(maxV / 2) || i === maxV)
      ylines += `<text x="${padL - 4}" y="${y + 4}" text-anchor="end" font-size="10" fill="var(--muted)" font-family="JetBrains Mono,monospace">${i}</text>`;
  }
  data.forEach((d, i) => {
    const x = padL + gap + (bw + gap) * i;
    const bh = Math.max(2, (d.value / maxV) * ch);
    const y = padT + ch - bh;
    bars += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="3" fill="${d.color}"/>`;
    const lx = x + bw / 2;
    const label = d.name.length > 8 ? d.name.slice(0, 8) : d.name;
    labels += `<text x="${lx}" y="${h - 8}" text-anchor="middle" font-size="10" fill="var(--muted)" font-family="JetBrains Mono,monospace">${h(label)}</text>`;
  });
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${ylines}${bars}${labels}</svg>`;
}

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "machines", label: "Máquinas", icon: "cpu" },
  { id: "sensors", label: "Sensores", icon: "radio" },
  { id: "orders", label: "Ordens de Serviço", icon: "clipboard" },
  { id: "users", label: "Usuários", icon: "users" },
];
const VIEW_LABEL = {
  dashboard: "Dashboard",
  machines: "Máquinas",
  sensors: "Sensores",
  orders: "Ordens de Serviço",
  users: "Usuários",
};

function renderNav() {
  const alertC =
    state.sensors.filter((s) => s.status === "alerta").length +
    state.sensors.filter((s) => s.status === "offline").length;
  const critC = state.orders.filter(
    (o) =>
      o.priority === "critica" &&
      (o.status === "aberta" || o.status === "em_andamento"),
  ).length;
  document.getElementById("navigation_menu").innerHTML = NAV_ITEMS.map(
    (item) => {
      const active = state.view === item.id;
      let badge = "";
      if (item.id === "sensors" && alertC > 0)
        badge = `<span class="nav-badge amber">${alertC}</span>`;
      if (item.id === "orders" && critC > 0)
        badge = `<span class="nav-badge crimson">${critC}</span>`;
      return `<button class="nav-button${active ? " active" : ""}" onclick="app.navigate('${item.id}')">${I[item.icon]}${h(item.label)}${badge}</button>`;
    },
  ).join("");
}

function renderTopbar() {
  const alertC =
    state.sensors.filter((s) => s.status === "alerta").length +
    state.sensors.filter((s) => s.status === "offline").length;
  const critC = state.orders.filter(
    (o) =>
      o.priority === "critica" &&
      (o.status === "aberta" || o.status === "em_andamento"),
  ).length;
  const dateStr = new Date().toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  let chips = "";
  if (alertC > 0)
    chips += `<button class="alert-chip amber" onclick="app.navigate('sensors')">${I.alert}&nbsp;${alertC} alerta${alertC > 1 ? "s" : ""} ativo${alertC > 1 ? "s" : ""}</button>`;
  if (critC > 0)
    chips += `<button class="alert-chip crimson" onclick="app.navigate('orders')">${I.alert}&nbsp;${critC} OS crítica${critC > 1 ? "s" : ""}</button>`;
  document.getElementById("topbar_header").innerHTML = `
    <div class="breadcrumb-trail">${h("MaintPro")} ${I.chevronR} <span class="current">${h(VIEW_LABEL[state.view])}</span></div>
    <div class="topbar-actions">${chips}<span class="date-display">${h(dateStr)}</span></div>`;
}

function renderDashboard() {
  const { sensors, machines, orders } = state;
  const activeMachines = machines.filter((m) => m.status !== "inativo").length;
  const onlineSensors = sensors.filter((s) => s.status === "online").length;
  const openOrders = orders.filter(
    (o) => o.status === "aberta" || o.status === "em_andamento",
  ).length;
  const doneThisMonth = orders.filter((o) => o.status === "concluida").length;
  const alertS = sensors.filter((s) => s.status === "alerta");
  const offlineS = sensors.filter((s) => s.status === "offline");

  const alertsHtml =
    alertS.length || offlineS.length
      ? `
    <div class="alerts-grid">
      ${alertS.map((s) => `<div class="alert-notification amber">${I.alert}<div><span style="color:var(--amber);font-weight:600;font-family:'JetBrains Mono',monospace">${h(s.name)}</span> <span>Valor ${s.currentValue}${h(s.unit)} acima do limite de ${s.maxThreshold}${h(s.unit)}</span></div></div>`).join("")}
      ${offlineS.map((s) => `<div class="alert-notification crimson">${I.alert}<div><span style="color:var(--crimson);font-weight:600;font-family:'JetBrains Mono',monospace">${h(s.name)}</span> <span>Sensor offline — última leitura ${h(s.lastReadingAt)}</span></div></div>`).join("")}
    </div>`
      : "";

  const kpis = [
    {
      label: "Máquinas Ativas",
      val: activeMachines,
      sub: `${machines.length} cadastradas`,
      color: "blue",
      nav: "machines",
    },
    {
      label: "Sensores Online",
      val: onlineSensors,
      sub: `${sensors.length} cadastrados`,
      color: "emerald",
      nav: "sensors",
    },
    {
      label: "OS Abertas",
      val: openOrders,
      sub: `${orders.filter((o) => o.status === "em_andamento").length} em andamento`,
      color: "amber",
      nav: "orders",
    },
    {
      label: "Concluídas",
      val: doneThisMonth,
      sub: `${orders.length} no total`,
      color: "emerald",
      nav: "orders",
    },
  ];
  const borderColor = {
    blue: "var(--blue)",
    emerald: "var(--emerald)",
    amber: "var(--amber)",
    crimson: "var(--crimson)",
  };

  const kpiHtml = `<div class="kpi-grid-container">${kpis
    .map(
      (k) => `
    <button class="kpi-widget" style="border-left-color:${borderColor[k.color]}" onclick="app.navigate('${k.nav}')">
      <div class="kpi-widget-header">
        <div class="kpi-widget-icon" style="background:var(--${k.color}-dim)">
          <svg width="16" height="16" style="color:var(--${k.color})" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>
        </div>
        <span class="kpi-widget-arrow">${I.arrow}</span>
      </div>
      <div class="kpi-widget-value" id="kpi-${k.nav}">${k.val}</div>
      <div class="kpi-widget-label">${h(k.label)}</div>
      <div class="kpi-widget-subtitle">${h(k.sub)}</div>
    </button>`,
    )
    .join("")}</div>`;

  const maintData = [
    {
      name: "Preventiva",
      value: orders.filter((o) => o.type === "preventiva").length,
      color: "#58a6ff",
    },
    {
      name: "Preditiva",
      value: orders.filter((o) => o.type === "preditiva").length,
      color: "#a371f7",
    },
    {
      name: "Corretiva",
      value: orders.filter((o) => o.type === "corretiva").length,
      color: "#f85149",
    },
  ].filter((d) => d.value > 0);

  const machineStatusData = [
    {
      name: "Operando",
      value: machines.filter((m) => m.status === "operando").length,
      color: "#3fb950",
    },
    {
      name: "Alerta",
      value: machines.filter((m) => m.status === "alerta").length,
      color: "#d29922",
    },
    {
      name: "Manutenção",
      value: machines.filter((m) => m.status === "manutencao").length,
      color: "#db6d28",
    },
    {
      name: "Crítico",
      value: machines.filter((m) => m.status === "critico").length,
      color: "#f85149",
    },
    {
      name: "Inativo",
      value: machines.filter((m) => m.status === "inativo").length,
      color: "#8b949e",
    },
  ].filter((d) => d.value > 0);

  const chartsHtml = `<div class="charts-grid">
    <div class="panel-card panel-card-padded">
      <div class="chart-header-title">${I.trend} Ordens por Tipo de Manutenção</div>
      <div class="chart-donut-wrapper">
        ${renderDonut(maintData)}
        <div class="chart-legend">
          ${maintData.map((d) => `<div class="legend-item-row"><div class="legend-item-label"><span style="width:10px;height:10px;border-radius:50%;background:${d.color};display:inline-block;flex-shrink:0"></span>${h(d.name)}</div><span class="legend-item-value">${d.value}</span></div>`).join("")}
          <div class="legend-item-row legend-divider"><div class="legend-item-label">Total</div><span class="legend-item-value">${orders.length}</span></div>
        </div>
      </div>
    </div>
    <div class="panel-card panel-card-padded">
      <div class="chart-header-title">${I.cpu} Status das Máquinas</div>
      ${renderBarChart(
        machineStatusData.map((d) => ({ ...d, name: d.name })),
        360,
        160,
      )}
    </div>
  </div>`;

  const recentOrders = [...orders]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);
  const recentHtml = `<div class="panel-card margin-top-24">
    <div class="panel-header-bar">
      <div class="panel-header-title">${I.wrench} Ordens de Serviço Recentes</div>
      <button class="link-button-blue" onclick="app.navigate('orders')">Ver todas ${I.arrow}</button>
    </div>
    <div class="table-responsive-wrapper"><table>
      <thead><tr><th>ID</th><th>Título</th><th>Máquina</th><th>Tipo</th><th>Prioridade</th><th>Status</th></tr></thead>
      <tbody>${recentOrders
        .map((o) => {
          const m = machines.find((x) => x.id === o.machineId);
          return `<tr>
          <td class="table-cell-mono">${h(o.id)}</td>
          <td class="table-cell-highlight" style="max-width:220px;overflow:hidden;text-overflow:ellipsis">${h(o.title)}</td>
          <td class="text-muted">${m ? h(m.name) : "—"}</td>
          <td>${badge(MAINT_TYPE[o.type]?.cls || "muted", MAINT_TYPE[o.type]?.label || o.type)}</td>
          <td>${badge(PRIORITY[o.priority]?.cls || "muted", PRIORITY[o.priority]?.label || o.priority)}</td>
          <td>${badge(o.status === "concluida" ? "emerald" : o.status === "em_andamento" ? "amber" : o.status === "aberta" ? "blue" : "muted", OS_STATUS[o.status]?.label || o.status)}</td>
        </tr>`;
        })
        .join("")}</tbody>
    </table></div>
  </div>`;

  document.getElementById("view_container").innerHTML =
    `<div class="view-wrapper">${alertsHtml}${kpiHtml}${chartsHtml}${recentHtml}</div>`;

  kpis.forEach((k) => {
    const el = document.getElementById(`kpi-${k.nav}`);
    if (el && typeof gsap !== "undefined") {
      gsap.fromTo(
        { val: 0 },
        { val: k.val },
        {
          val: k.val,
          duration: 0.8,
          ease: "power2.out",
          onUpdate: function () {
            el.textContent = Math.round(this.targets()[0].val);
          },
        },
      );
    }
  });
}

function renderMachines() {
  const {
    machines,
    sensors,
    machineFilter: flt,
    machineQuery: q,
    deleteId,
  } = state;
  const filtered = machines.filter((m) => {
    const mq =
      m.name.toLowerCase().includes(q.toLowerCase()) ||
      m.location.toLowerCase().includes(q.toLowerCase()) ||
      m.department.toLowerCase().includes(q.toLowerCase());
    return mq && (flt === "all" || m.status === flt);
  });

  const filters = ["all", "operando", "alerta", "manutencao", "inativo"];
  const filterLabels = {
    all: "Todas",
    operando: "Operando",
    alerta: "Alerta",
    manutencao: "Manutenção",
    inativo: "Inativo",
  };

  const cards = filtered
    .map((m) => {
      const st = MACHINE_STATUS[m.status] || MACHINE_STATUS.inativo;
      const mSensors = sensors.filter((s) => m.sensorIds.includes(s.id));
      const alertS = mSensors.filter(
        (s) => s.status === "alerta" || s.status === "offline",
      );
      const days = daysUntil(m.nextMaintenance);
      const overdue = days !== null && days < 0;
      const soon = days !== null && days >= 0 && days <= 14;
      const boxCls = overdue ? "over" : soon ? "warn" : "normal";
      const maintColor = overdue
        ? "var(--crimson)"
        : soon
          ? "var(--amber)"
          : "var(--muted)";
      const maintValColor = overdue
        ? "var(--crimson)"
        : soon
          ? "var(--amber)"
          : "var(--fg)";
      const daysText =
        days === null
          ? ""
          : overdue
            ? `${Math.abs(days)} dias atrasada`
            : days === 0
              ? "Hoje"
              : `em ${days} dias`;

      const sensorPills = mSensors
        .map((s) => {
          const dc =
            s.status === "online"
              ? "var(--emerald)"
              : s.status === "alerta"
                ? "var(--amber)"
                : "var(--muted)";
          return `<div class="sensor-tag"><span class="status-dot" style="background:${dc}"></span><span>${h(s.name)}</span></div>`;
        })
        .join("");

      const actionsHtml =
        deleteId === m.id
          ? `<div class="confirmation-actions"><button class="link-button-crimson" onclick="app.machines.confirmDelete('${m.id}')">Confirmar exclusão</button><button class="link-button-muted" onclick="app.clearDelete()">Cancelar</button></div>`
          : `<div class="machine-card-actions"><button class="action-button-outline edit" onclick="app.machines.openEdit('${m.id}')">${I.pencil} Editar</button><button class="action-button-outline delete" onclick="app.setDelete('${m.id}')">${I.trash} Excluir</button></div>`;

      return `<div class="machine-card">
      <div class="machine-card-header">
        <div>
          <div><span class="status-badge ${st.color}"><span class="status-dot" style="background:${st.dot};"></span> ${h(st.label)}</span></div>
          <div class="machine-card-title">${h(m.name)}</div>
          <div class="machine-card-subtitle">${h(m.model)}</div>
        </div>
        ${alertS.length ? `<div style="background:var(--amber-dim);border:1px solid var(--amber-bdr);border-radius:8px;padding:6px;flex-shrink:0;color:var(--amber)">${I.alert.replace('width="11"', 'width="13"').replace('height="11"', 'height="13"')}</div>` : ""}
      </div>
      <div class="machine-card-details">
        <div class="details-row"><span class="details-label">Localização</span><span class="details-value">${h(m.location)}</span></div>
        <div class="details-row"><span class="details-label">Setor</span><span class="details-value">${h(m.department)}</span></div>
        <div class="details-row"><span class="details-label">Sensores</span><span class="details-value font-mono-style">${mSensors.length} vinculados</span></div>
      </div>
      ${sensorPills ? `<div class="sensor-tags-container">${sensorPills}</div>` : ""}
      <div class="maintenance-status-box ${boxCls}">
        <div class="maintenance-status-row"><span style="color:${maintColor}">Próx. manutenção</span><span style="color:${maintValColor};font-family:'JetBrains Mono',monospace;font-weight:500">${h(m.nextMaintenance || "—")}</span></div>
        ${days !== null ? `<div class="maintenance-status-sub" style="color:${maintColor}">${h(daysText)}</div>` : ""}
      </div>
      ${actionsHtml}
    </div>`;
    })
    .join("");

  document.getElementById("view_container").innerHTML =
    `<div class="view-wrapper">
    <div class="section-page-header">
      <div><div class="section-page-title">Máquinas</div><div class="section-page-subtitle">${machines.length} cadastradas · ${machines.filter((m) => m.status === "operando").length} em operação</div></div>
      <button class="button-primary" onclick="app.machines.openAdd()">${I.plus} Nova Máquina</button>
    </div>
    <div class="actions-toolbar">
      <div class="search-input-wrapper">${I.search}<input class="search-input-field" placeholder="Buscar por nome, setor ou local..." value="${h(q)}" oninput="app.machines.setQuery(this.value)"></div>
      <div class="filter-buttons-group">${filters.map((f) => `<button class="filter-button${flt === f ? " active" : ""}" onclick="app.machines.setFilter('${f}')">${h(filterLabels[f])}</button>`).join("")}</div>
    </div>
    ${filtered.length ? `<div class="machine-cards-grid">${cards}</div>` : `<div class="table-empty-state" style="padding:64px 20px">${I.cpu}<br><br>Nenhuma máquina encontrada</div>`}
  </div>`;
}

function renderSensors() {
  const {
    sensors,
    machines,
    sensorFilter: flt,
    sensorQuery: q,
    deleteId,
  } = state;
  const filtered = sensors.filter((s) => {
    const mq =
      s.name.toLowerCase().includes(q.toLowerCase()) ||
      s.location.toLowerCase().includes(q.toLowerCase());
    return mq && (flt === "all" || s.status === flt);
  });
  const statusCounts = {
    all: sensors.length,
    online: sensors.filter((s) => s.status === "online").length,
    alerta: sensors.filter((s) => s.status === "alerta").length,
    offline: sensors.filter((s) => s.status === "offline").length,
  };

  const rows = filtered
    .map((s) => {
      const st = SENSOR_STATUS[s.status] || SENSOR_STATUS.offline;
      const machine = machines.find((m) => m.id === s.machineId);
      const range = s.maxThreshold - s.minThreshold;
      const pct =
        s.status === "offline" || range <= 0
          ? 0
          : Math.min(
              100,
              Math.max(
                0,
                ((s.currentValue - s.minThreshold) / range) * 100,
              ),
            );
      const barColor =
        pct >= 90
          ? "var(--crimson)"
          : pct >= 70
            ? "var(--amber)"
            : "var(--emerald)";
      const readingCell =
        s.status === "offline"
          ? `<span class="text-muted font-mono-style">—</span>`
          : `<div class="reading-progress-container"><div class="reading-progress-track"><div class="reading-progress-fill" style="width:${pct}%;background:${barColor}"></div></div><span class="reading-progress-value">${s.currentValue}</span></div>`;
      const actionCell =
        deleteId === s.id
          ? `<div style="display:flex;gap:8px;align-items:center"><button class="link-button-crimson" onclick="app.sensors.confirmDelete('${s.id}')">Confirmar</button><button class="link-button-muted" onclick="app.clearDelete()">Cancelar</button></div>`
          : `<div style="display:flex;gap:2px"><button class="icon-action-button edit" onclick="app.sensors.openEdit('${s.id}')">${I.pencil}</button><button class="icon-action-button delete" onclick="app.setDelete('${s.id}')">${I.trash}</button></div>`;

      return `<tr>
      <td><span class="font-mono-style" style="font-weight:500;color:var(--fg)">${h(s.name)}</span></td>
      <td>${badge(SENSOR_TYPE_CLS[s.type] || "muted", SENSOR_TYPE_LABELS[s.type] || s.type)}</td>
      <td>${readingCell}</td>
      <td class="table-cell-mono">${s.minThreshold}–${s.maxThreshold} ${h(s.unit)}</td>
      <td class="text-muted" style="max-width:160px;overflow:hidden;text-overflow:ellipsis">${machine ? h(machine.name) : '<span style="color:var(--border)">—</span>'}</td>
      <td class="text-muted">${h(s.location)}</td>
      <td>${dot(st.dot, st.label)}</td>
      <td>${actionCell}</td>
    </tr>`;
    })
    .join("");

  document.getElementById("view_container").innerHTML =
    `<div class="view-wrapper">
    <div class="section-page-header">
      <div><div class="section-page-title">Sensores</div><div class="section-page-subtitle">${sensors.length} cadastrados · ${sensors.filter((s) => s.status === "online").length} online</div></div>
      <button class="button-primary" onclick="app.sensors.openAdd()">${I.plus} Novo Sensor</button>
    </div>
    <div class="actions-toolbar">
      <div class="search-input-wrapper">${I.search}<input class="search-input-field" placeholder="Buscar sensor ou localização..." value="${h(q)}" oninput="app.sensors.setQuery(this.value)"></div>
      <div class="filter-buttons-group">${["all", "online", "alerta", "offline"]
        .map((f) => {
          const labels = {
            all: "Todos",
            online: "Online",
            alerta: "Alerta",
            offline: "Offline",
          };
          return `<button class="filter-button${flt === f ? " active" : ""}" onclick="app.sensors.setFilter('${f}')">${labels[f]} <span class="font-mono-style" style="opacity:.6">${statusCounts[f]}</span></button>`;
        })
        .join("")}</div>
    </div>
    <div class="panel-card">
      <div class="table-responsive-wrapper"><table>
        <thead><tr><th>Nome</th><th>Tipo</th><th>Leitura Atual</th><th>Limites</th><th>Máquina</th><th>Localização</th><th>Status</th><th></th></tr></thead>
        <tbody>${rows || `<tr><td colspan="8" class="table-empty-state">${I.radio.replace('width="15"', 'width="32"').replace('height="15"', 'height="32"')}<br><br>Nenhum sensor encontrado</td></tr>`}</tbody>
      </table></div>
    </div>
  </div>`;
}

function renderOrders() {
  const {
    orders,
    machines,
    users,
    orderTypeFilter: tf,
    orderStatusFilter: sf,
    orderQuery: q,
    deleteId,
    expandedId,
  } = state;
  const filtered = orders.filter((o) => {
    const mq =
      o.title.toLowerCase().includes(q.toLowerCase()) ||
      o.id.toLowerCase().includes(q.toLowerCase());
    return (
      mq && (tf === "all" || o.type === tf) && (sf === "all" || o.status === sf)
    );
  });
  const priOrd = { critica: 0, alta: 1, media: 2, baixa: 3 };
  const staOrd = { em_andamento: 0, aberta: 1, concluida: 2, cancelada: 3 };
  const sorted = [...filtered].sort((a, b) => {
    if (staOrd[a.status] !== staOrd[b.status])
      return staOrd[a.status] - staOrd[b.status];
    return priOrd[a.priority] - priOrd[b.priority];
  });

  const rows = sorted
    .map((o) => {
      const machine = machines.find((m) => m.id === o.machineId);
      const assignee = users.find((u) => u.id === o.assignedToId);
      const exp = expandedId === o.id;
      const actionCell =
        deleteId === o.id
          ? `<div style="display:flex;gap:8px;align-items:center"><button class="link-button-crimson" onclick="app.orders.confirmDelete('${o.id}')">Confirmar</button><button class="link-button-muted" onclick="app.clearDelete()">Cancelar</button></div>`
          : `<div style="display:flex;gap:2px"><button class="icon-action-button edit" onclick="app.orders.openEdit('${o.id}')">${I.pencil}</button><button class="icon-action-button delete" onclick="app.setDelete('${o.id}')">${I.trash}</button></div>`;
      const expandedRow = exp
        ? `<tr class="expanded-details-row"><td></td><td colspan="8">
      <div class="expanded-details-grid">
        <div><div class="expanded-section-label">Descrição</div><div style="color:var(--fg);line-height:1.6">${h(o.description || "—")}</div></div>
        <div>
          <div class="expanded-key-value-pair"><span class="text-muted">Criada em</span><span class="font-mono-style" style="color:var(--fg)">${h(o.createdAt)}</span></div>
          <div class="expanded-key-value-pair"><span class="text-muted">Horas estimadas</span><span class="font-mono-style" style="color:var(--fg)">${o.estimatedHours}h</span></div>
          ${o.completedAt ? `<div class="expanded-key-value-pair"><span class="text-muted">Concluída em</span><span class="font-mono-style" style="color:var(--emerald)">${h(o.completedAt)}</span></div>` : ""}
        </div>
        <div>
          <div class="expanded-key-value-pair"><span class="text-muted">Máquina</span><span style="color:var(--fg)">${machine ? h(machine.name) : "—"}</span></div>
          <div class="expanded-key-value-pair"><span class="text-muted">Localização</span><span style="color:var(--fg)">${machine ? h(machine.location) : "—"}</span></div>
        </div>
      </div>
    </td></tr>`
        : "";
      return `<tr>
      <td style="width:32px"><button class="table-expand-button${exp ? " open" : ""}" onclick="app.toggleExpand('${o.id}')">${I.chevron}</button></td>
      <td><div class="table-cell-mono">${h(o.id)}</div><div style="font-size:12px;font-weight:500;color:var(--fg);max-width:220px;overflow:hidden;text-overflow:ellipsis">${h(o.title)}</div></td>
      <td class="text-muted">${machine ? h(machine.name) : "—"}</td>
      <td>${badge(MAINT_TYPE[o.type]?.cls || "muted", MAINT_TYPE[o.type]?.label || o.type)}</td>
      <td>${badge(PRIORITY[o.priority]?.cls || "muted", PRIORITY[o.priority]?.label || o.priority)}</td>
      <td>${dot(OS_STATUS[o.status]?.dot || "var(--muted)", OS_STATUS[o.status]?.label || o.status)}</td>
      <td class="text-muted">${assignee ? h(assignee.name) : "—"}</td>
      <td class="table-cell-mono">${h(o.scheduledFor || "—")}</td>
      <td>${actionCell}</td>
    </tr>${expandedRow}`;
    })
    .join("");

  const typeCount = (t) =>
    t === "all" ? orders.length : orders.filter((o) => o.type === t).length;
  const staCount = (s) =>
    s === "all" ? orders.length : orders.filter((o) => o.status === s).length;

  document.getElementById("view_container").innerHTML =
    `<div class="view-wrapper">
    <div class="section-page-header">
      <div><div class="section-page-title">Ordens de Serviço</div><div class="section-page-subtitle">${orders.filter((o) => o.status === "aberta" || o.status === "em_andamento").length} em aberto de ${orders.length} total</div></div>
      <button class="button-primary" onclick="app.orders.openAdd()">${I.plus} Nova OS</button>
    </div>
    <div class="actions-toolbar">
      <div class="search-input-wrapper">${I.search}<input class="search-input-field" placeholder="Buscar por ID ou título..." value="${h(q)}" oninput="app.orders.setQuery(this.value)"></div>
      <div class="filter-buttons-group segmented">${[
        "all",
        "preventiva",
        "preditiva",
        "corretiva",
      ]
        .map((t) => {
          const l = {
            all: "Todos",
            preventiva: "Preventiva",
            preditiva: "Preditiva",
            corretiva: "Corretiva",
          };
          return `<button class="filter-button${tf === t ? " active" : ""}" onclick="app.orders.setTypeFilter('${t}')">${l[t]} <span class="font-mono-style" style="opacity:.6">${typeCount(t)}</span></button>`;
        })
        .join("")}</div>
      <div class="filter-buttons-group segmented">${[
        "all",
        "aberta",
        "em_andamento",
        "concluida",
        "cancelada",
      ]
        .map((s) => {
          const l = {
            all: "Todos",
            aberta: "Aberta",
            em_andamento: "Em Andamento",
            concluida: "Concluída",
            cancelada: "Cancelada",
          };
          return `<button class="filter-button${sf === s ? " active" : ""}" onclick="app.orders.setStatusFilter('${s}')">${l[s]} <span class="font-mono-style" style="opacity:.6">${staCount(s)}</span></button>`;
        })
        .join("")}</div>
    </div>
    <div class="panel-card">
      <div class="table-responsive-wrapper"><table>
        <thead><tr><th></th><th>OS / Título</th><th>Máquina</th><th>Tipo</th><th>Prioridade</th><th>Status</th><th>Responsável</th><th>Previsto</th><th></th></tr></thead>
        <tbody>${rows || `<tr><td colspan="9" class="table-empty-state">${I.clipboard.replace('width="15"', 'width="32"').replace('height="15"', 'height="32"')}<br><br>Nenhuma ordem encontrada</td></tr>`}</tbody>
      </table></div>
    </div>
  </div>`;
}

function renderUsers() {
  const { users, userQuery: q, deleteId } = state;
  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(q.toLowerCase()) ||
      u.email.toLowerCase().includes(q.toLowerCase()),
  );

  const rows = filtered
    .map((u, i) => {
      const role = USER_ROLE[u.role] || { cls: "muted", label: u.role };
      const st =
        u.status === "ativo"
          ? { dot: "var(--emerald)", color: "var(--emerald)", label: "Ativo" }
          : { dot: "var(--muted)", color: "var(--muted)", label: "Inativo" };
      const av = AVATAR_COLORS[i % AVATAR_COLORS.length];
      const actionCell =
        deleteId === u.id
          ? `<div style="display:flex;gap:8px;align-items:center"><button class="link-button-crimson" onclick="app.users.confirmDelete('${u.id}')">Confirmar</button><button class="link-button-muted" onclick="app.clearDelete()">Cancelar</button></div>`
          : `<div style="display:flex;gap:2px"><button class="icon-action-button edit" onclick="app.users.openEdit('${u.id}')">${I.pencil}</button><button class="icon-action-button delete" onclick="app.setDelete('${u.id}')">${I.trash}</button></div>`;
      return `<tr>
      <td><div class="user-cell"><div class="user-avatar" style="${av}">${avatarInitials(u.name)}</div><span style="font-size:12px;font-weight:500;color:var(--fg)">${h(u.name)}</span></div></td>
      <td class="table-cell-mono">${h(u.email)}</td>
      <td class="table-cell-mono">${h(u.phone)}</td>
      <td>${badge(role.cls, role.label)}</td>
      <td>${dot(st.dot, st.label)}</td>
      <td class="table-cell-mono">${h(u.createdAt)}</td>
      <td>${actionCell}</td>
    </tr>`;
    })
    .join("");

  document.getElementById("view_container").innerHTML =
    `<div class="view-wrapper">
    <div class="section-page-header">
      <div><div class="section-page-title">Usuários</div><div class="section-page-subtitle">${users.filter((u) => u.status === "ativo").length} ativos de ${users.length} cadastrados</div></div>
      <button class="button-primary" onclick="app.users.openAdd()">${I.plus} Novo Usuário</button>
    </div>
    <div class="actions-toolbar">
      <div class="search-input-wrapper">${I.search}<input class="search-input-field" placeholder="Buscar por nome ou e-mail..." value="${h(q)}" oninput="app.users.setQuery(this.value)"></div>
    </div>
    <div class="panel-card">
      <table>
        <thead><tr><th>Usuário</th><th>E-mail</th><th>Telefone</th><th>Cargo</th><th>Status</th><th>Cadastro</th><th></th></tr></thead>
        <tbody>${rows || `<tr><td colspan="7" class="table-empty-state">${I.users.replace('width="15"', 'width="32"').replace('height="15"', 'height="32"')}<br><br>Nenhum usuário encontrado</td></tr>`}</tbody>
      </table>
    </div>
  </div>`;
}

let isFirstRender = true;

function renderView() {
  const el = document.getElementById("view_container");
  const renderFn =
    {
      dashboard: renderDashboard,
      machines: renderMachines,
      sensors: renderSensors,
      orders: renderOrders,
      users: renderUsers,
    }[state.view] || renderDashboard;

  if (isFirstRender) {
    renderFn();
    isFirstRender = false;
    if (typeof gsap !== "undefined") {
      gsap.fromTo(
        el,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
      );
    }
  } else {
    if (typeof gsap !== "undefined") {
      gsap.to(el, {
        opacity: 0,
        y: 8,
        duration: 0.12,
        onComplete: () => {
          renderFn();
          gsap.fromTo(
            el,
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" },
          );
        },
      });
    } else {
      renderFn();
    }
  }
}

function renderAll() {
  renderNav();
  renderTopbar();
  renderView();
}

function openModal(title, bodyHtml, footerHtml, lg = false) {
  const overlay = document.getElementById("modal_overlay");
  const panel = document.getElementById("modal_panel");
  document.getElementById("modal_title").textContent = title;
  document.getElementById("modal_body").innerHTML = bodyHtml;
  document.getElementById("modal_footer").innerHTML = footerHtml;
  panel.className = "modal-panel " + (lg ? "large" : "");
  overlay.style.display = "flex";
  if (typeof gsap !== "undefined") {
    gsap.fromTo(
      panel,
      { scale: 0.94, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.22, ease: "back.out(1.4)" },
    );
  }
}

const app = {
  navigate(view) {
    state.view = view;
    state.deleteId = null;
    renderAll();
  },
  closeModal() {
    const overlay = document.getElementById("modal_overlay");
    const panel = document.getElementById("modal_panel");
    if (typeof gsap !== "undefined") {
      gsap.to(panel, {
        scale: 0.94,
        opacity: 0,
        duration: 0.15,
        ease: "power2.in",
        onComplete: () => {
          overlay.style.display = "none";
        },
      });
    } else {
      overlay.style.display = "none";
    }
    state.editingId = null;
    state.modalContext = null;
  },
  setDelete(id) {
    state.deleteId = id;
    renderView();
    renderNav();
    renderTopbar();
  },
  clearDelete() {
    state.deleteId = null;
    renderView();
  },
  toggleExpand(id) {
    state.expandedId = state.expandedId === id ? null : id;
    renderOrders();
  },

  machines: {
    setQuery(v) {
      state.machineQuery = v;
      renderMachines();
    },
    setFilter(v) {
      state.machineFilter = v;
      renderMachines();
    },
    openAdd() {
      state.editingId = null;
      state.modalContext = "machine";
      openModal(
        "Nova Máquina",
        app.machines._form(null),
        app.machines._footer(),
        true,
      );
    },
    openEdit(id) {
      state.editingId = id;
      state.modalContext = "machine";
      const m = state.machines.find((x) => x.id === id);
      openModal(
        "Editar Máquina",
        app.machines._form(m),
        app.machines._footer(),
        true,
      );
    },
    _form(m) {
      const avail = state.sensors.filter(
        (s) => !s.machineId || s.machineId === m?.id,
      );
      const checks = avail
        .map(
          (s) => `
        <label class="sensor-checkbox-label">
          <input type="checkbox" name="sensorId" value="${s.id}" ${m && m.sensorIds.includes(s.id) ? "checked" : ""} style="accent-color:var(--blue)">
          <span class="font-mono-style" style="font-weight:500">${h(s.name)}</span>
          <span class="text-muted">${h(SENSOR_TYPE_LABELS[s.type])}</span>
        </label>`,
        )
        .join("");
      return `<div class="form-grid-layout">
        <div class="form-field-group full-width"><label class="form-input-label">Nome da Máquina</label><input id="f-name" class="form-input-field" value="${h(m?.name || "")}" placeholder="Ex: Compressor CA-02"></div>
        <div class="form-field-group"><label class="form-input-label">Modelo</label><input id="f-model" class="form-input-field" value="${h(m?.model || "")}" placeholder="Ex: Atlas Copco GA-90"></div>
        <div class="form-field-group"><label class="form-input-label">Fabricante</label><input id="f-manufacturer" class="form-input-field" value="${h(m?.manufacturer || "")}" placeholder="Ex: Atlas Copco"></div>
        <div class="form-field-group"><label class="form-input-label">Localização</label><input id="f-location" class="form-input-field" value="${h(m?.location || "")}" placeholder="Ex: Galpão B — Setor 3"></div>
        <div class="form-field-group"><label class="form-input-label">Departamento</label><input id="f-department" class="form-input-field" value="${h(m?.department || "")}" placeholder="Ex: Produção"></div>
        <div class="form-field-group"><label class="form-input-label">Status</label><select id="f-status" class="form-input-field">
          ${["operando", "alerta", "critico", "manutencao", "inativo"].map((v) => `<option value="${v}" ${m?.status === v ? "selected" : ""}>${{ operando: "Operando", alerta: "Alerta", critico: "Crítico", manutencao: "Em Manutenção", inativo: "Inativo" }[v]}</option>`).join("")}
        </select></div>
        <div class="form-field-group"><label class="form-input-label">Data de Instalação</label><input id="f-installDate" type="date" class="form-input-field" value="${h(m?.installDate || "")}"></div>
        <div class="form-field-group"><label class="form-input-label">Último Manut.</label><input id="f-lastMaintenance" type="date" class="form-input-field" value="${h(m?.lastMaintenance || "")}"></div>
        <div class="form-field-group"><label class="form-input-label">Próx. Manut.</label><input id="f-nextMaintenance" type="date" class="form-input-field" value="${h(m?.nextMaintenance || "")}"></div>
        <div class="form-field-group full-width"><label class="form-input-label">Sensores Vinculados</label>
          <div class="sensor-checkbox-grid">${checks || '<span class="text-muted">Nenhum sensor disponível.</span>'}</div></div>
      </div>`;
    },
    _footer() {
      return `<button class="button-cancel" onclick="app.closeModal()">Cancelar</button><button class="button-save" onclick="app.machines.save()">Salvar</button>`;
    },
    save() {
      const name = document.getElementById("f-name")?.value?.trim();
      if (!name) return;
      const sensorIds = [
        ...document.querySelectorAll('input[name="sensorId"]:checked'),
      ].map((c) => c.value);
      const data = {
        name,
        model: document.getElementById("f-model")?.value || "",
        manufacturer: document.getElementById("f-manufacturer")?.value || "",
        location: document.getElementById("f-location")?.value || "",
        department: document.getElementById("f-department")?.value || "",
        status: document.getElementById("f-status")?.value || "operando",
        installDate: document.getElementById("f-installDate")?.value || "",
        lastMaintenance: document.getElementById("f-lastMaintenance")?.value || "",
        nextMaintenance: document.getElementById("f-nextMaintenance")?.value || "",
        sensorIds,
      };
      if (state.editingId) {
        state.machines = state.machines.map((m) =>
          m.id === state.editingId ? { ...m, ...data } : m,
        );
      } else {
        state.machines = [...state.machines, { ...data, id: "m" + Date.now() }];
      }
      app.closeModal();
      setTimeout(() => {
        renderMachines();
        renderNav();
        renderTopbar();
      }, 160);
    },
    confirmDelete(id) {
      state.machines = state.machines.filter((m) => m.id !== id);
      state.deleteId = null;
      renderMachines();
      renderNav();
      renderTopbar();
    },
  },

  sensors: {
    setQuery(v) {
      state.sensorQuery = v;
      renderSensors();
    },
    setFilter(v) {
      state.sensorFilter = v;
      renderSensors();
    },
    openAdd() {
      state.editingId = null;
      openModal(
        "Novo Sensor",
        app.sensors._form(null),
        app.sensors._footer(),
        true,
      );
    },
    openEdit(id) {
      state.editingId = id;
      const s = state.sensors.find((x) => x.id === id);
      openModal(
        "Editar Sensor",
        app.sensors._form(s),
        app.sensors._footer(),
        true,
      );
    },
    _form(s) {
      const types = [
        "temperatura",
        "vibracao",
        "pressao",
        "corrente",
        "umidade",
        "rpm",
      ];
      return `<div class="form-grid-layout">
        <div class="form-field-group"><label class="form-input-label">Código / Nome</label><input id="f-name" class="form-input-field" value="${h(s?.name || "")}" placeholder="Ex: TMP-009"></div>
        <div class="form-field-group"><label class="form-input-label">Tipo de Sensor</label><select id="f-type" class="form-input-field">${types.map((t) => `<option value="${t}" ${s?.type === t ? "selected" : ""}>${SENSOR_TYPE_LABELS[t]}</option>`).join("")}</select></div>
        <div class="form-field-group"><label class="form-input-label">Unidade</label><input id="f-unit" class="form-input-field" value="${h(s?.unit || "")}" placeholder="Ex: °C, bar, mm/s"></div>
        <div class="form-field-group"><label class="form-input-label">Localização</label><input id="f-location" class="form-input-field" value="${h(s?.location || "")}" placeholder="Ex: Galpão A"></div>
        <div class="form-field-group"><label class="form-input-label">Valor Mínimo</label><input id="f-min" type="number" class="form-input-field" value="${s?.minThreshold ?? 0}"></div>
        <div class="form-field-group"><label class="form-input-label">Valor Máximo</label><input id="f-max" type="number" class="form-input-field" value="${s?.maxThreshold ?? 100}"></div>
        <div class="form-field-group"><label class="form-input-label">Leitura Atual</label><input id="f-val" type="number" class="form-input-field" value="${s?.currentValue ?? 0}"></div>
        <div class="form-field-group"><label class="form-input-label">Status</label><select id="f-status" class="form-input-field"><option value="online" ${s?.status === "online" ? "selected" : ""}>Online</option><option value="alerta" ${s?.status === "alerta" ? "selected" : ""}>Alerta</option><option value="offline" ${s?.status === "offline" ? "selected" : ""}>Offline</option></select></div>
        <div class="form-field-group full-width"><label class="form-input-label">Máquina Vinculada</label><select id="f-machine" class="form-input-field">
          <option value="">— Nenhuma —</option>
          ${state.machines.map((m) => `<option value="${m.id}" ${s?.machineId === m.id ? "selected" : ""}>${h(m.name)}</option>`).join("")}
        </select></div>
      </div>`;
    },
    _footer() {
      return `<button class="button-cancel" onclick="app.closeModal()">Cancelar</button><button class="button-save" onclick="app.sensors.save()">Salvar</button>`;
    },
    save() {
      const name = document.getElementById("f-name")?.value?.trim();
      if (!name) return;
      const data = {
        name,
        type: document.getElementById("f-type")?.value || "temperatura",
        unit: document.getElementById("f-unit")?.value || "",
        location: document.getElementById("f-location")?.value || "",
        minThreshold: Number(document.getElementById("f-min")?.value || 0),
        maxThreshold: Number(document.getElementById("f-max")?.value || 100),
        currentValue: Number(document.getElementById("f-val")?.value || 0),
        status: document.getElementById("f-status")?.value || "online",
        machineId: document.getElementById("f-machine")?.value || null,
        lastReadingAt: new Date().toISOString().replace("T", " ").slice(0, 19),
      };
      if (state.editingId) {
        state.sensors = state.sensors.map((s) =>
          s.id === state.editingId ? { ...s, ...data } : s,
        );
      } else {
        state.sensors = [...state.sensors, { ...data, id: "s" + Date.now() }];
      }
      app.closeModal();
      setTimeout(() => {
        renderSensors();
        renderNav();
        renderTopbar();
      }, 160);
    },
    confirmDelete(id) {
      state.sensors = state.sensors.filter((s) => s.id !== id);
      state.machines = state.machines.map((m) => ({
        ...m,
        sensorIds: m.sensorIds.filter((s) => s !== id),
      }));
      state.deleteId = null;
      renderSensors();
      renderNav();
      renderTopbar();
    },
  },

  orders: {
    setQuery(v) {
      state.orderQuery = v;
      renderOrders();
    },
    setTypeFilter(v) {
      state.orderTypeFilter = v;
      renderOrders();
    },
    setStatusFilter(v) {
      state.orderStatusFilter = v;
      renderOrders();
    },
    openAdd() {
      state.editingId = null;
      openModal(
        "Nova Ordem de Serviço",
        app.orders._form(null),
        app.orders._footer(),
        true,
      );
    },
    openEdit(id) {
      state.editingId = id;
      const o = state.orders.find((x) => x.id === id);
      openModal(
        `Editar ${o.id}`,
        app.orders._form(o),
        app.orders._footer(),
        true,
      );
    },
    _form(o) {
      const activeUsers = state.users.filter((u) => u.status === "ativo");
      return `<div class="form-grid-layout">
        <div class="form-field-group full-width"><label class="form-input-label">Título da OS</label><input id="f-title" class="form-input-field" value="${h(o?.title || "")}" placeholder="Ex: Troca de rolamentos — CA-01"></div>
        <div class="form-field-group"><label class="form-input-label">Máquina</label><select id="f-machine" class="form-input-field">${state.machines.map((m) => `<option value="${m.id}" ${o?.machineId === m.id ? "selected" : ""}>${h(m.name)}</option>`).join("")}</select></div>
        <div class="form-field-group"><label class="form-input-label">Tipo de Manutenção</label><select id="f-type" class="form-input-field"><option value="preventiva" ${o?.type === "preventiva" ? "selected" : ""}>Preventiva</option><option value="preditiva" ${o?.type === "preditiva" ? "selected" : ""}>Preditiva</option><option value="corretiva" ${o?.type === "corretiva" ? "selected" : ""}>Corretiva</option></select></div>
        <div class="form-field-group"><label class="form-input-label">Prioridade</label><select id="f-priority" class="form-input-field"><option value="baixa" ${o?.priority === "baixa" ? "selected" : ""}>Baixa</option><option value="media" ${o?.priority === "media" ? "selected" : ""}>Média</option><option value="alta" ${o?.priority === "alta" ? "selected" : ""}>Alta</option><option value="critica" ${o?.priority === "critica" ? "selected" : ""}>Crítica</option></select></div>
        <div class="form-field-group"><label class="form-input-label">Status</label><select id="f-status" class="form-input-field"><option value="aberta" ${o?.status === "aberta" ? "selected" : ""}>Aberta</option><option value="em_andamento" ${o?.status === "em_andamento" ? "selected" : ""}>Em Andamento</option><option value="concluida" ${o?.status === "concluida" ? "selected" : ""}>Concluída</option><option value="cancelada" ${o?.status === "cancelada" ? "selected" : ""}>Cancelada</option></select></div>
        <div class="form-field-group"><label class="form-input-label">Responsável</label><select id="f-assigned" class="form-input-field">${activeUsers.map((u) => `<option value="${u.id}" ${o?.assignedToId === u.id ? "selected" : ""}>${h(u.name)}</option>`).join("")}</select></div>
        <div class="form-field-group"><label class="form-input-label">Horas Estimadas</label><input id="f-hours" type="number" min="0.5" step="0.5" class="form-input-field" value="${o?.estimatedHours ?? 2}"></div>
        <div class="form-field-group"><label class="form-input-label">Data Prevista</label><input id="f-scheduled" type="date" class="form-input-field" value="${h(o?.scheduledFor || "")}"></div>
        <div class="form-field-group full-width"><label class="form-input-label">Descrição</label><textarea id="f-desc" class="form-input-field form-textarea-field" placeholder="Descreva o serviço a ser realizado...">${h(o?.description || "")}</textarea></div>
      </div>`;
    },
    _footer() {
      return `<button class="button-cancel" onclick="app.closeModal()">Cancelar</button><button class="button-save" onclick="app.orders.save()">Salvar OS</button>`;
    },
    save() {
      const title = document.getElementById("f-title")?.value?.trim();
      const machineId = document.getElementById("f-machine")?.value;
      if (!title || !machineId) return;
      const status = document.getElementById("f-status")?.value || "aberta";
      const data = {
        title,
        machineId,
        type: document.getElementById("f-type")?.value || "preventiva",
        priority: document.getElementById("f-priority")?.value || "baixa",
        status,
        assignedToId: document.getElementById("f-assigned")?.value || "",
        estimatedHours: Number(document.getElementById("f-hours")?.value || 2),
        scheduledFor: document.getElementById("f-scheduled")?.value || "",
        description: document.getElementById("f-desc")?.value || "",
        createdAt: state.editingId
          ? state.orders.find((o) => o.id === state.editingId).createdAt
          : new Date().toISOString().split("T")[0],
        completedAt:
          status === "concluida"
            ? new Date().toISOString().split("T")[0]
            : null,
      };
      if (state.editingId) {
        state.orders = state.orders.map((o) =>
          o.id === state.editingId ? { ...o, ...data } : o,
        );
      } else {
        const id = `OS-${new Date().getFullYear()}-${String(state.orders.length + 1).padStart(3, "0")}`;
        state.orders = [...state.orders, { ...data, id }];
      }
      app.closeModal();
      setTimeout(() => {
        renderOrders();
        renderNav();
        renderTopbar();
      }, 160);
    },
    confirmDelete(id) {
      state.orders = state.orders.filter((o) => o.id !== id);
      state.deleteId = null;
      renderOrders();
      renderNav();
      renderTopbar();
    },
  },

  users: {
    setQuery(v) {
      state.userQuery = v;
      renderUsers();
    },
    openAdd() {
      state.editingId = null;
      openModal("Novo Usuário", app.users._form(null), app.users._footer());
    },
    openEdit(id) {
      state.editingId = id;
      const u = state.users.find((x) => x.id === id);
      openModal("Editar Usuário", app.users._form(u), app.users._footer());
    },
    _form(u) {
      return `<div class="form-grid-layout">
        <div class="form-field-group full-width"><label class="form-input-label">Nome completo</label><input id="f-name" class="form-input-field" value="${h(u?.name || "")}" placeholder="Ex: João da Silva"></div>
        <div class="form-field-group full-width"><label class="form-input-label">E-mail</label><input id="f-email" type="email" class="form-input-field" value="${h(u?.email || "")}" placeholder="joao@empresa.com"></div>
        <div class="form-field-group"><label class="form-input-label">Telefone</label><input id="f-phone" class="form-input-field" value="${h(u?.phone || "")}" placeholder="(11) 99999-9999"></div>
        <div class="form-field-group"><label class="form-input-label">Cargo</label><select id="f-role" class="form-input-field"><option value="tecnico" ${u?.role === "tecnico" ? "selected" : ""}>Técnico</option><option value="supervisor" ${u?.role === "supervisor" ? "selected" : ""}>Supervisor</option><option value="admin" ${u?.role === "admin" ? "selected" : ""}>Administrador</option></select></div>
        <div class="form-field-group"><label class="form-input-label">Status</label><select id="f-status" class="form-input-field"><option value="ativo" ${u?.status === "ativo" || !u ? "selected" : ""}>Ativo</option><option value="inativo" ${u?.status === "inativo" ? "selected" : ""}>Inativo</option></select></div>
      </div>`;
    },
    _footer() {
      return `<button class="button-cancel" onclick="app.closeModal()">Cancelar</button><button class="button-save" onclick="app.users.save()">Salvar</button>`;
    },
    save() {
      const name = document.getElementById("f-name")?.value?.trim();
      const email = document.getElementById("f-email")?.value?.trim();
      if (!name || !email) return;
      const data = {
        name,
        email,
        phone: document.getElementById("f-phone")?.value || "",
        role: document.getElementById("f-role")?.value || "tecnico",
        status: document.getElementById("f-status")?.value || "ativo",
      };
      if (state.editingId) {
        state.users = state.users.map((u) =>
          u.id === state.editingId ? { ...u, ...data } : u,
        );
      } else {
        state.users = [
          ...state.users,
          {
            ...data,
            id: "u" + Date.now(),
            createdAt: new Date().toISOString().split("T")[0],
          },
        ];
      }
      app.closeModal();
      setTimeout(() => {
        renderUsers();
        renderNav();
        renderTopbar();
      }, 160);
    },
    confirmDelete(id) {
      state.users = state.users.filter((u) => u.id !== id);
      state.deleteId = null;
      renderUsers();
      renderNav();
      renderTopbar();
    },
  },
};

window.app = app;

document.addEventListener("DOMContentLoaded", () => {
  const modalOverlay = document.getElementById("modal_overlay");
  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === e.currentTarget) app.closeModal();
    });
  }

  if (typeof gsap !== "undefined") {
    gsap.from("#sidebar_container", {
      x: -224,
      opacity: 0,
      duration: 0.4,
      ease: "power3.out",
    });
    gsap.from("#topbar_header", {
      y: -40,
      opacity: 0,
      duration: 0.3,
      delay: 0.1,
      ease: "power2.out",
    });
  }

  renderAll();
});