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
    lock: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    user: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    dollar: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`
  };
  
  const DATA = {
    users: [
      { id: "u1", name: "Carlos Mendes", email: "carlos.mendes@industria.com", role: "admin", status: "ativo", phone: "(11) 98765-4321", createdAt: "2024-01-15" },
      { id: "u2", name: "Ana Ribeiro", email: "ana.ribeiro@industria.com", role: "supervisor", status: "ativo", phone: "(11) 91234-5678", createdAt: "2024-02-20" },
      { id: "u3", name: "Marcos Ferreira", email: "marcos.ferreira@industria.com", role: "tecnico", status: "ativo", phone: "(11) 94567-8901", createdAt: "2024-03-10" },
      { id: "u4", name: "Juliana Costa", email: "juliana.costa@industria.com", role: "tecnico", status: "ativo", phone: "(11) 97890-1234", createdAt: "2024-04-05" },
      { id: "u5", name: "Roberto Lima", email: "roberto.lima@industria.com", role: "tecnico", status: "inativo", phone: "(11) 93456-7890", createdAt: "2024-05-18" },
      { id: "u6", name: "Fernanda Oliveira", email: "fernanda.oliveira@industria.com", role: "supervisor", status: "ativo", phone: "(11) 92345-6789", createdAt: "2024-06-22" }
    ],
    sensors: [
      { id: "s1", name: "TMP-001", type: "temperatura", unit: "°C", machineId: "m1", status: "online", currentValue: 72.4, minThreshold: 0, maxThreshold: 85, lastReadingAt: "2026-09-01 08:34:12", location: "Galpão A" },
      { id: "s2", name: "VIB-002", type: "vibracao", unit: "mm/s", machineId: "m1", status: "alerta", currentValue: 12.8, minThreshold: 0, maxThreshold: 10, lastReadingAt: "2026-09-01 08:34:12", location: "Galpão A" },
      { id: "s3", name: "TMP-003", type: "temperatura", unit: "°C", machineId: "m2", status: "online", currentValue: 45.1, minThreshold: 0, maxThreshold: 80, lastReadingAt: "2026-09-01 08:33:55", location: "Galpão B" },
      { id: "s4", name: "PRE-004", type: "pressao", unit: "bar", machineId: "m2", status: "online", currentValue: 3.2, minThreshold: 1, maxThreshold: 6, lastReadingAt: "2026-09-01 08:33:55", location: "Galpão B" },
      { id: "s5", name: "COR-005", type: "corrente", unit: "A", machineId: "m3", status: "offline", currentValue: 0, minThreshold: 0, maxThreshold: 50, lastReadingAt: "2026-08-30 14:22:10", location: "Galpão C" },
      { id: "s6", name: "RPM-006", type: "rpm", unit: "RPM", machineId: "m3", status: "offline", currentValue: 0, minThreshold: 0, maxThreshold: 3600, lastReadingAt: "2026-08-30 14:22:10", location: "Galpão C" },
      { id: "s7", name: "TMP-007", type: "temperatura", unit: "°C", machineId: "m4", status: "online", currentValue: 38.9, minThreshold: 0, maxThreshold: 70, lastReadingAt: "2026-09-01 08:34:01", location: "Galpão A" },
      { id: "s8", name: "UMI-008", type: "umidade", unit: "%RH", machineId: null, status: "online", currentValue: 65.3, minThreshold: 30, maxThreshold: 80, lastReadingAt: "2026-09-01 08:34:05", location: "Sala de Controle" }
    ],
    machines: [
      { id: "m1", name: "Compressor CA-01", model: "Atlas Copco GA-110", manufacturer: "Atlas Copco", location: "Galpão A — Setor 1", department: "Produção", sensorIds: ["s1", "s2"], status: "alerta", lastMaintenance: "2026-07-15", nextMaintenance: "2026-10-15", installDate: "2020-03-10" },
      { id: "m2", name: "Bomba Hidráulica BH-02", model: "Grundfos CM10-2", manufacturer: "Grundfos", location: "Galpão B — Setor 2", department: "Utilidades", sensorIds: ["s3", "s4"], status: "operando", lastMaintenance: "2026-08-01", nextMaintenance: "2026-11-01", installDate: "2019-06-20" },
      { id: "m3", name: "Torno CNC TC-03", model: "Romi D-600", manufacturer: "Romi", location: "Galpão C — Setor 1", department: "Usinagem", sensorIds: ["s5", "s6"], status: "manutencao", lastMaintenance: "2026-08-28", nextMaintenance: "2026-11-28", installDate: "2021-09-15" },
      { id: "m4", name: "Forno Industrial FI-04", model: "Thermex T-500", manufacturer: "Thermex", location: "Galpão A — Setor 3", department: "Tratamento Térmico", sensorIds: ["s7"], status: "operando", lastMaintenance: "2026-06-10", nextMaintenance: "2026-09-10", installDate: "2018-11-05" },
      { id: "m5", name: "Esteira ET-05", model: "FlexLink XS-80", manufacturer: "FlexLink", location: "Galpão D — Setor 2", department: "Logística", sensorIds: [], status: "inativo", lastMaintenance: "2026-05-20", nextMaintenance: "2026-08-20", installDate: "2022-01-30" }
    ],
    orders: [
      { id: "OS-2026-001", title: "Troca de filtro de ar — CA-01", machineId: "m1", type: "preventiva", priority: "media", status: "concluida", assignedToId: "u3", createdAt: "2026-07-10", scheduledFor: "2026-07-15", completedAt: "2026-07-15", description: "Substituição dos filtros de ar do compressor conforme plano de manutenção semestral.", estimatedHours: 2, hourlyCost: 120 },
      { id: "OS-2026-038", title: "Manutenção preventiva — BH-02", machineId: "m2", type: "preventiva", priority: "baixa", status: "aberta", assignedToId: "u4", createdAt: "2026-08-25", scheduledFor: "2026-09-05", completedAt: null, description: "Manutenção trimestral: inspeção de selos, verificação de rolamentos e lubrificação geral.", estimatedHours: 3, hourlyCost: 120 },
      { id: "OS-2026-039", title: "Falha elétrica — TC-03", machineId: "m3", type: "corretiva", priority: "critica", status: "em_andamento", assignedToId: "u3", createdAt: "2026-08-28", scheduledFor: "2026-08-28", completedAt: null, description: "Torno CNC parou inesperadamente. Sensores COR-005 e RPM-006 offline. Investigar sistema elétrico e painéis.", estimatedHours: 8, hourlyCost: 180 },
      { id: "OS-2026-040", title: "Calibração de sensores — FI-04", machineId: "m4", type: "preventiva", priority: "media", status: "aberta", assignedToId: "u4", createdAt: "2026-08-29", scheduledFor: "2026-09-10", completedAt: null, description: "Calibração anual dos sensores de temperatura do forno industrial.", estimatedHours: 2, hourlyCost: 150 },
      { id: "OS-2026-042", title: "Vibração anormal — CA-01", machineId: "m1", type: "preditiva", priority: "alta", status: "em_andamento", assignedToId: "u3", createdAt: "2026-08-30", scheduledFor: "2026-09-01", completedAt: null, description: "Sensor VIB-002 registrando 12.8 mm/s (limite: 10). Verificar rolamentos e alinhamento do eixo.", estimatedHours: 4, hourlyCost: 150 },
      { id: "OS-2026-043", title: "Inspeção termográfica — BH-02", machineId: "m2", type: "preditiva", priority: "baixa", status: "aberta", assignedToId: "u3", createdAt: "2026-09-01", scheduledFor: "2026-09-15", completedAt: null, description: "Análise de vibração e termografia da bomba hidráulica conforme plano preditivo.", estimatedHours: 2, hourlyCost: 150 },
      { id: "OS-2026-035", title: "Revisão geral — ET-05", machineId: "m5", type: "preventiva", priority: "baixa", status: "cancelada", assignedToId: "u4", createdAt: "2026-08-10", scheduledFor: "2026-08-20", completedAt: null, description: "Revisão da correia transportadora e sistema de acionamento elétrico.", estimatedHours: 6, hourlyCost: 100 }
    ]
  };
  
  const isLoggedIn = localStorage.getItem("sg_logged_in") === "true";
  
  const state = {
    view: isLoggedIn ? "dashboard" : "login",
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
    modalContext: null
  };
  
  const MACHINE_STATUS = {
    operando: { dot: "var(--emerald)", color: "emerald", label: "Operando" },
    alerta: { dot: "var(--amber)", color: "amber", label: "Alerta" },
    critico: { dot: "var(--crimson)", color: "crimson", label: "Crítico" },
    manutencao: { dot: "var(--orange)", color: "orange", label: "Manutenção" },
    inativo: { dot: "var(--muted)", color: "muted", label: "Inativo" }
  };
  
  const SENSOR_STATUS = {
    online: { dot: "var(--emerald)", color: "text-emerald", label: "Online" },
    offline: { dot: "var(--muted)", color: "text-muted", label: "Offline" },
    alerta: { dot: "var(--amber)", color: "text-amber", label: "Alerta" }
  };
  
  const MAINT_TYPE = {
    preventiva: { cls: "blue", label: "Preventiva" },
    preditiva: { cls: "violet", label: "Preditiva" },
    corretiva: { cls: "crimson", label: "Corretiva" }
  };
  
  const PRIORITY = {
    baixa: { cls: "muted", label: "Baixa" },
    media: { cls: "blue", label: "Média" },
    alta: { cls: "amber", label: "Alta" },
    critica: { cls: "crimson", label: "Crítica" }
  };
  
  const OS_STATUS = {
    aberta: { dot: "var(--blue)", color: "text-blue", label: "Aberta" },
    em_andamento: { dot: "var(--amber)", color: "text-amber", label: "Em Andamento" },
    concluida: { dot: "var(--emerald)", color: "text-emerald", label: "Concluída" },
    cancelada: { dot: "var(--muted)", color: "text-muted", label: "Cancelada" }
  };
  
  const USER_ROLE = {
    admin: { cls: "violet", label: "Administrador" },
    supervisor: { cls: "blue", label: "Supervisor" },
    tecnico: { cls: "emerald", label: "Técnico" }
  };
  
  const SENSOR_TYPE_LABELS = {
    temperatura: "Temperatura",
    vibracao: "Vibração",
    pressao: "Pressão",
    corrente: "Corrente",
    umidade: "Umidade",
    rpm: "RPM"
  };
  
  const SENSOR_TYPE_CLS = {
    temperatura: "crimson",
    vibracao: "amber",
    pressao: "blue",
    corrente: "violet",
    umidade: "emerald",
    rpm: "orange"
  };
  
  const AVATAR_COLORS = [
    "background:var(--violet-dim);color:var(--violet)",
    "background:var(--blue-dim);color:var(--blue)",
    "background:var(--emerald-dim);color:var(--emerald)",
    "background:var(--amber-dim);color:var(--amber)"
  ];
  
  function h(s) {
    return String(s ?? "")
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
    const o1 = polar(cx, cy, ro, a1), o2 = polar(cx, cy, ro, a2);
    const i1 = polar(cx, cy, ri, a2), i2 = polar(cx, cy, ri, a1);
    const large = a2 - a1 > 180 ? 1 : 0;
    return `M${o1.x} ${o1.y} A${ro} ${ro} 0 ${large} 1 ${o2.x} ${o2.y} L${i1.x} ${i1.y} A${ri} ${ri} 0 ${large} 0 ${i2.x} ${i2.y} Z`;
  }
  
  function renderDonut(data, size = 160, ro = 68, ri = 48) {
    const total = data.reduce((s, d) => s + d.value, 0);
    if (!total) return `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${ro}" fill="none" stroke="var(--border)" stroke-width="${ro - ri}"/></svg>`;
    let angle = -90, paths = "";
    for (const d of data) {
      const sweep = (d.value / total) * 360;
      const a2 = angle + sweep - 2;
      if (sweep > 2) paths += `<path d="${donutArc(size / 2, size / 2, ro, ri, angle, a2)}" fill="${d.color}"/>`;
      angle += sweep;
    }
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${paths}</svg>`;
  }
  
  function renderBarChart(data, w = 360, ch = 160) {
    if (!Array.isArray(data) || data.length === 0) {
      return `<svg width="${w}" height="${ch}"></svg>`;
    }
  
    const padL = 10;
    const padR = 10;
    const padT = 20;
    const padB = 30;
  
    const chartW = w - padL - padR;
    const chartH = ch - padT - padB;
  
    const maxVal = Math.max(...data.map((item) => Number(item.value) || 0)) || 1;
    const gap = 12;
    const totalGaps = (data.length + 1) * gap;
    const barWidth = Math.max(10, Math.floor((chartW - totalGaps) / data.length));
  
    let bars = "";
    let labels = "";
  
    const ylines = `
      <line x1="${padL}" y1="${padT}" x2="${w - padR}" y2="${padT}" stroke="var(--border)" stroke-width="1" stroke-dasharray="3 3"/>
      <line x1="${padL}" y1="${padT + chartH}" x2="${w - padR}" y2="${padT + chartH}" stroke="var(--border)" stroke-width="1"/>
    `;
  
    data.forEach((item, index) => {
      const val = Number(item.value) || 0;
      const bh = Math.max(2, (val / maxVal) * chartH);
      const x = padL + gap + index * (barWidth + gap);
      const y = padT + chartH - bh;
      const color = item.color || "var(--blue)";
  
      bars += `<rect x="${x}" y="${y}" width="${barWidth}" height="${bh}" rx="3" fill="${color}"/>`;
  
      const lx = x + barWidth / 2;
      const rawLabel = String(item.name || "");
      const labelText = rawLabel.length > 8 ? rawLabel.slice(0, 8) + "…" : rawLabel;
  
      labels += `<text x="${lx}" y="${ch - 8}" text-anchor="middle" font-size="10" fill="var(--muted)" font-family="JetBrains Mono,monospace">${h(labelText)}</text>`;
    });
  
    return `<svg width="${w}" height="${ch}" viewBox="0 0 ${w} ${ch}">${ylines}${bars}${labels}</svg>`;
  }
  
  const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard ERP", icon: "dashboard" },
    { id: "machines", label: "Máquinas", icon: "cpu" },
    { id: "sensors", label: "Sensores", icon: "radio" },
    { id: "orders", label: "Ordens de Serviço", icon: "clipboard" },
    { id: "users", label: "Usuários", icon: "users" }
  ];
  
  const VIEW_LABEL = {
    dashboard: "Dashboard ERP / Painel Geral",
    machines: "Gestão de Máquinas",
    sensors: "Monitoramento de Sensores",
    orders: "Ordens de Serviço",
    users: "Gestão de Usuários"
  };
  
  function renderNav() {
    const alertC = state.sensors.filter((s) => s.status === "alerta" || s.status === "offline").length;
    const critC = state.orders.filter((o) => o.priority === "critica" && (o.status === "aberta" || o.status === "em_andamento")).length;
    
    const navContainer = document.getElementById("navigation_menu");
    if (!navContainer) return;
  
    navContainer.innerHTML = NAV_ITEMS.map((item) => {
      const active = state.view === item.id;
      let badgeHtml = "";
      if (item.id === "sensors" && alertC > 0) badgeHtml = `<span class="nav-badge amber">${alertC}</span>`;
      if (item.id === "orders" && critC > 0) badgeHtml = `<span class="nav-badge crimson">${critC}</span>`;
      return `<button class="nav-button${active ? " active" : ""}" onclick="app.navigate('${item.id}')">${I[item.icon]}${h(item.label)}${badgeHtml}</button>`;
    }).join("");
  }
  
  function renderTopbar() {
    const alertC = state.sensors.filter((s) => s.status === "alerta" || s.status === "offline").length;
    const critC = state.orders.filter((o) => o.priority === "critica" && (o.status === "aberta" || o.status === "em_andamento")).length;
    const dateStr = new Date().toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
    
    let chips = "";
    if (alertC > 0) chips += `<button class="alert-chip amber" onclick="app.navigate('sensors')">${I.alert}&nbsp;${alertC} alerta${alertC > 1 ? "s" : ""}</button>`;
    if (critC > 0) chips += `<button class="alert-chip crimson" onclick="app.navigate('orders')">${I.alert}&nbsp;${critC} OS crítica${critC > 1 ? "s" : ""}</button>`;
    
    const topbarContainer = document.getElementById("topbar_header");
    if (!topbarContainer) return;
  
    topbarContainer.innerHTML = `
      <div class="breadcrumb-trail">${h("SenseGuard ERP")} ${I.chevronR} <span class="current">${h(VIEW_LABEL[state.view] || "")}</span></div>
      <div class="topbar-actions">${chips}<span class="date-display">${h(dateStr)}</span></div>`;
  }
  
  /* ==========================================================================
     TELAS DE AUTENTICAÇÃO (LOGIN E CADASTRO)
     ========================================================================== */
  function renderLoginView() {
    document.getElementById("view_container").innerHTML = `
      <div class="auth-wrapper">
        <div class="auth-card">
          <div class="auth-brand">
            <div class="brand-icon lg">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <div>
              <h1 class="auth-title">SenseGuard ERP</h1>
              <span class="auth-subtitle">Industrial v2.1</span>
            </div>
          </div>
  
          <div class="auth-heading">
            <h2>Controle total das suas máquinas e operações.</h2>
            <p>Acesse sua conta para visualizar indicadores e gerenciar a fábrica.</p>
          </div>
  
          <form class="auth-form" onsubmit="event.preventDefault(); app.handleLogin();">
            <div class="form-field-group full-width">
              <label class="form-input-label">E-mail corporativo</label>
              <div class="input-with-icon">
                ${I.user}
                <input type="email" id="login_email" class="form-input-field" placeholder="carlos.mendes@industria.com" value="carlos.mendes@industria.com" required />
              </div>
            </div>
  
            <div class="form-field-group full-width">
              <label class="form-input-label">Senha</label>
              <div class="input-with-icon">
                ${I.lock}
                <input type="password" id="login_password" class="form-input-field" placeholder="••••••••" value="123456" required />
              </div>
            </div>
  
            <button type="submit" class="button-primary full-width auth-submit-btn">
              Acessar ERP
            </button>
          </form>
  
          <div class="auth-footer-link">
            Não tem uma conta? <a href="#" onclick="event.preventDefault(); app.navigate('register');">Cadastre-se</a>
          </div>
        </div>
      </div>
    `;
  }
  
  function renderRegisterView() {
    document.getElementById("view_container").innerHTML = `
      <div class="auth-wrapper">
        <div class="auth-card large">
          <div class="auth-brand">
            <div class="brand-icon lg">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <div>
              <h1 class="auth-title">SenseGuard ERP</h1>
              <span class="auth-subtitle">Industrial v2.1</span>
            </div>
          </div>
  
          <div class="auth-heading">
            <h2>Criar nova conta de acesso</h2>
            <p>Cadastre um novo operador, técnico ou supervisor no sistema.</p>
          </div>
  
          <form class="auth-form" onsubmit="event.preventDefault(); app.handleRegister();">
            <div class="form-grid-layout">
              <div class="form-field-group full-width">
                <label class="form-input-label">Nome Completo</label>
                <input type="text" id="reg_name" class="form-input-field" placeholder="Ex: João da Silva" required />
              </div>
  
              <div class="form-field-group">
                <label class="form-input-label">E-mail Corporativo</label>
                <input type="email" id="reg_email" class="form-input-field" placeholder="joao@industria.com" required />
              </div>
  
              <div class="form-field-group">
                <label class="form-input-label">Telefone</label>
                <input type="tel" id="reg_phone" class="form-input-field" placeholder="(11) 99999-9999" required />
              </div>
  
              <div class="form-field-group">
                <label class="form-input-label">Cargo / Função</label>
                <select id="reg_role" class="form-input-field">
                  <option value="tecnico">Técnico</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
  
              <div class="form-field-group">
                <label class="form-input-label">Senha</label>
                <input type="password" id="reg_pass" class="form-input-field" placeholder="••••••••" required />
              </div>
            </div>
  
            <button type="submit" class="button-primary full-width auth-submit-btn margin-top-16">
              Cadastrar Conta
            </button>
          </form>
  
          <div class="auth-footer-link">
            Já possui uma conta? <a href="#" onclick="event.preventDefault(); app.navigate('login');">Fazer Login</a>
          </div>
        </div>
      </div>
    `;
  }
  
  /* ==========================================================================
     DASHBOARD PRINCIPAL (MÉTRICAS ERP)
     ========================================================================== */
  function renderDashboard() {
    const { sensors, machines, orders } = state;
  
    const activeMachines = machines.filter((m) => m.status === "operando").length;
    const uptimePct = machines.length ? Math.round((activeMachines / machines.length) * 100) : 0;
    
    const openOrders = orders.filter((o) => o.status === "aberta" || o.status === "em_andamento");
    const estimatedCost = openOrders.reduce((sum, o) => sum + (o.estimatedHours * (o.hourlyCost || 120)), 0);
    
    const alertS = sensors.filter((s) => s.status === "alerta");
    const offlineS = sensors.filter((s) => s.status === "offline");
    const totalSensorsOnline = sensors.filter((s) => s.status === "online").length;
  
    const alertsHtml = (alertS.length || offlineS.length) ? `
      <div class="alerts-grid">
        ${alertS.map((s) => `
          <div class="alert-notification amber">
            ${I.alert}
            <div>
              <span style="color:var(--amber);font-weight:600;font-family:'JetBrains Mono',monospace">${h(s.name)}</span>
              <span>Valor ${s.currentValue}${h(s.unit)} excedeu limite operacional de ${s.maxThreshold}${h(s.unit)}</span>
            </div>
          </div>
        `).join("")}
        ${offlineS.map((s) => `
          <div class="alert-notification crimson">
            ${I.alert}
            <div>
              <span style="color:var(--crimson);font-weight:600;font-family:'JetBrains Mono',monospace">${h(s.name)}</span>
              <span>Sensor desconectado — última leitura em ${h(s.lastReadingAt)}</span>
            </div>
          </div>
        `).join("")}
      </div>` : "";
  
    const kpis = [
      { label: "Disponibilidade (Uptime)", val: `${uptimePct}%`, sub: `${activeMachines} de ${machines.length} máquinas operando`, color: "emerald", nav: "machines" },
      { label: "Custo Estimado Manut.", val: `R$ ${estimatedCost.toLocaleString("pt-BR")}`, sub: `${openOrders.length} OS ativas na fábrica`, color: "blue", nav: "orders" },
      { label: "Sensores em Alerta", val: alertS.length + offlineS.length, sub: `${totalSensorsOnline} online de ${sensors.length}`, color: alertS.length || offlineS.length ? "amber" : "emerald", nav: "sensors" },
      { label: "Ordens Abertas / Ação", val: openOrders.length, sub: `${orders.filter(o=>o.priority === 'critica').length} críticas necessitam atenção`, color: "crimson", nav: "orders" }
    ];
  
    const borderColor = { blue: "var(--blue)", emerald: "var(--emerald)", amber: "var(--amber)", crimson: "var(--crimson)" };
  
    const kpiHtml = `<div class="kpi-grid-container">${kpis.map((k) => `
      <button class="kpi-widget" style="border-left-color:${borderColor[k.color]}" onclick="app.navigate('${k.nav}')">
        <div class="kpi-widget-header">
          <div class="kpi-widget-icon" style="background:var(--${k.color}-dim)">
            <svg width="16" height="16" style="color:var(--${k.color})" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>
          </div>
          <span class="kpi-widget-arrow">${I.arrow}</span>
        </div>
        <div class="kpi-widget-value">${k.val}</div>
        <div class="kpi-widget-label">${h(k.label)}</div>
        <div class="kpi-widget-subtitle">${h(k.sub)}</div>
      </button>`).join("")}</div>`;
  
    const maintData = [
      { name: "Preventiva", value: orders.filter((o) => o.type === "preventiva").length, color: "#58a6ff" },
      { name: "Preditiva", value: orders.filter((o) => o.type === "preditiva").length, color: "#a371f7" },
      { name: "Corretiva", value: orders.filter((o) => o.type === "corretiva").length, color: "#f85149" }
    ].filter((d) => d.value > 0);
  
    const machineStatusData = [
      { name: "Operando", value: machines.filter((m) => m.status === "operando").length, color: "#3fb950" },
      { name: "Alerta", value: machines.filter((m) => m.status === "alerta").length, color: "#d29922" },
      { name: "Manutenção", value: machines.filter((m) => m.status === "manutencao").length, color: "#db6d28" },
      { name: "Crítico", value: machines.filter((m) => m.status === "critico").length, color: "#f85149" },
      { name: "Inativo", value: machines.filter((m) => m.status === "inativo").length, color: "#8b949e" }
    ].filter((d) => d.value > 0);
  
    const chartsHtml = `<div class="charts-grid">
      <div class="panel-card panel-card-padded">
        <div class="chart-header-title">${I.trend} Distribuição de Tipos de Manutenção</div>
        <div class="chart-donut-wrapper">
          ${renderDonut(maintData)}
          <div class="chart-legend">
            ${maintData.map((d) => `<div class="legend-item-row"><div class="legend-item-label"><span style="width:10px;height:10px;border-radius:50%;background:${d.color};display:inline-block;flex-shrink:0"></span>${h(d.name)}</div><span class="legend-item-value">${d.value}</span></div>`).join("")}
            <div class="legend-item-row legend-divider"><div class="legend-item-label">Total OS</div><span class="legend-item-value">${orders.length}</span></div>
          </div>
        </div>
      </div>
      <div class="panel-card panel-card-padded">
        <div class="chart-header-title">${I.cpu} Status Operacional das Máquinas</div>
        ${renderBarChart(machineStatusData, 360, 160)}
      </div>
    </div>`;
  
    const recentOrders = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
    const recentHtml = `<div class="panel-card margin-top-24">
      <div class="panel-header-bar">
        <div class="panel-header-title">${I.wrench} Ordens de Serviço Recentes</div>
        <button class="link-button-blue" onclick="app.navigate('orders')">Ver todas as OS ${I.arrow}</button>
      </div>
      <div class="table-responsive-wrapper"><table>
        <thead><tr><th>Código</th><th>Título da Ordem</th><th>Máquina</th><th>Tipo</th><th>Prioridade</th><th>Custo Previsto</th><th>Status</th></tr></thead>
        <tbody>${recentOrders.map((o) => {
          const m = machines.find((x) => x.id === o.machineId);
          const cost = (o.estimatedHours * (o.hourlyCost || 120)).toLocaleString("pt-BR");
          return `<tr>
            <td class="table-cell-mono">${h(o.id)}</td>
            <td class="table-cell-highlight" style="max-width:220px;overflow:hidden;text-overflow:ellipsis">${h(o.title)}</td>
            <td class="text-muted">${m ? h(m.name) : "—"}</td>
            <td>${badge(MAINT_TYPE[o.type].cls, MAINT_TYPE[o.type].label)}</td>
            <td>${badge(PRIORITY[o.priority].cls, PRIORITY[o.priority].label)}</td>
            <td class="table-cell-mono">R$ ${cost}</td>
            <td>${badge(o.status === "concluida" ? "emerald" : o.status === "em_andamento" ? "amber" : o.status === "aberta" ? "blue" : "muted", OS_STATUS[o.status].label)}</td>
          </tr>`;
        }).join("")}</tbody>
      </table></div>
    </div>`;
  
    document.getElementById("view_container").innerHTML = `<div class="view-wrapper">${alertsHtml}${kpiHtml}${chartsHtml}${recentHtml}</div>`;
  }
  
  function renderMachines() {
    const { machines, sensors, machineFilter: flt, machineQuery: q, deleteId } = state;
    const filtered = machines.filter((m) => {
      const mq = m.name.toLowerCase().includes(q.toLowerCase()) || m.location.toLowerCase().includes(q.toLowerCase()) || m.department.toLowerCase().includes(q.toLowerCase());
      return mq && (flt === "all" || m.status === flt);
    });
  
    const filters = ["all", "operando", "alerta", "manutencao", "inativo"];
    const filterLabels = { all: "Todas", operando: "Operando", alerta: "Alerta", manutencao: "Manutenção", inativo: "Inativo" };
  
    const cards = filtered.map((m) => {
      const st = MACHINE_STATUS[m.status];
      const mSensors = sensors.filter((s) => m.sensorIds.includes(s.id));
      const alertS = mSensors.filter((s) => s.status === "alerta" || s.status === "offline");
      const days = daysUntil(m.nextMaintenance);
      const overdue = days !== null && days < 0;
      const soon = days !== null && days >= 0 && days <= 14;
      const boxCls = overdue ? "over" : soon ? "warn" : "normal";
      const maintColor = overdue ? "var(--crimson)" : soon ? "var(--amber)" : "var(--muted)";
      const maintValColor = overdue ? "var(--crimson)" : soon ? "var(--amber)" : "var(--fg)";
      const daysText = days === null ? "" : overdue ? `${Math.abs(days)} dias atrasada` : days === 0 ? "Hoje" : `em ${days} dias`;
  
      const sensorPills = mSensors.map((s) => {
        const dc = s.status === "online" ? "var(--emerald)" : s.status === "alerta" ? "var(--amber)" : "var(--muted)";
        return `<div class="sensor-tag"><span class="status-dot" style="background:${dc}"></span><span>${h(s.name)}</span></div>`;
      }).join("");
  
      const actionsHtml = deleteId === m.id
        ? `<div class="confirmation-actions"><button class="link-button-crimson" onclick="app.machines.confirmDelete('${m.id}')">Confirmar exclusão</button><button class="link-button-muted" onclick="app.clearDelete()">Cancelar</button></div>`
        : `<div class="machine-card-actions"><button class="action-button-outline edit" onclick="app.machines.openEdit('${m.id}')">${I.pencil} Editar</button><button class="action-button-outline delete" onclick="app.setDelete('${m.id}')">${I.trash} Excluir</button></div>`;
  
      return `<div class="machine-card">
        <div class="machine-card-header">
          <div>
            <div><span class="status-badge ${st.color}"><span class="status-dot" style="background:${st.dot};"></span> ${h(st.label)}</span></div>
            <div class="machine-card-title">${h(m.name)}</div>
            <div class="machine-card-subtitle">${h(m.model)}</div>
          </div>
          ${alertS.length ? `<div style="background:var(--amber-dim);border:1px solid var(--amber-bdr);border-radius:8px;padding:6px;flex-shrink:0;color:var(--amber)">${I.alert}</div>` : ""}
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
    }).join("");
  
    document.getElementById("view_container").innerHTML = `<div class="view-wrapper">
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
    const { sensors, machines, sensorFilter: flt, sensorQuery: q, deleteId } = state;
    const filtered = sensors.filter((s) => {
      const mq = s.name.toLowerCase().includes(q.toLowerCase()) || s.location.toLowerCase().includes(q.toLowerCase());
      return mq && (flt === "all" || s.status === flt);
    });
    const statusCounts = {
      all: sensors.length,
      online: sensors.filter((s) => s.status === "online").length,
      alerta: sensors.filter((s) => s.status === "alerta").length,
      offline: sensors.filter((s) => s.status === "offline").length
    };
  
    const rows = filtered.map((s) => {
      const st = SENSOR_STATUS[s.status];
      const machine = machines.find((m) => m.id === s.machineId);
      const pct = s.status === "offline" ? 0 : Math.min(100, Math.max(0, ((s.currentValue - s.minThreshold) / (s.maxThreshold - s.minThreshold)) * 100));
      const barColor = pct >= 90 ? "var(--crimson)" : pct >= 70 ? "var(--amber)" : "var(--emerald)";
      const readingCell = s.status === "offline"
        ? `<span class="text-muted font-mono-style">—</span>`
        : `<div class="reading-progress-container"><div class="reading-progress-track"><div class="reading-progress-fill" style="width:${pct}%;background:${barColor}"></div></div><span class="reading-progress-value">${s.currentValue} ${h(s.unit)}</span></div>`;
      
      const actionCell = deleteId === s.id
        ? `<div style="display:flex;gap:8px;align-items:center"><button class="link-button-crimson" onclick="app.sensors.confirmDelete('${s.id}')">Confirmar</button><button class="link-button-muted" onclick="app.clearDelete()">Cancelar</button></div>`
        : `<div style="display:flex;gap:2px"><button class="icon-action-button edit" onclick="app.sensors.openEdit('${s.id}')">${I.pencil}</button><button class="icon-action-button delete" onclick="app.setDelete('${s.id}')">${I.trash}</button></div>`;
  
      return `<tr>
        <td><span class="font-mono-style" style="font-weight:500;color:var(--fg)">${h(s.name)}</span></td>
        <td>${badge(SENSOR_TYPE_CLS[s.type], SENSOR_TYPE_LABELS[s.type])}</td>
        <td>${readingCell}</td>
        <td class="table-cell-mono">${s.minThreshold}–${s.maxThreshold} ${h(s.unit)}</td>
        <td class="text-muted" style="max-width:160px;overflow:hidden;text-overflow:ellipsis">${machine ? h(machine.name) : '<span style="color:var(--border)">—</span>'}</td>
        <td class="text-muted">${h(s.location)}</td>
        <td>${dot(st.dot, st.label)}</td>
        <td>${actionCell}</td>
      </tr>`;
    }).join("");
  
    document.getElementById("view_container").innerHTML = `<div class="view-wrapper">
      <div class="section-page-header">
        <div><div class="section-page-title">Sensores</div><div class="section-page-subtitle">${sensors.length} cadastrados · ${sensors.filter((s) => s.status === "online").length} online</div></div>
        <button class="button-primary" onclick="app.sensors.openAdd()">${I.plus} Novo Sensor</button>
      </div>
      <div class="actions-toolbar">
        <div class="search-input-wrapper">${I.search}<input class="search-input-field" placeholder="Buscar sensor ou localização..." value="${h(q)}" oninput="app.sensors.setQuery(this.value)"></div>
        <div class="filter-buttons-group">${["all", "online", "alerta", "offline"].map((f) => {
          const labels = { all: "Todos", online: "Online", alerta: "Alerta", offline: "Offline" };
          return `<button class="filter-button${flt === f ? " active" : ""}" onclick="app.sensors.setFilter('${f}')">${labels[f]} <span class="font-mono-style" style="opacity:.6">${statusCounts[f]}</span></button>`;
        }).join("")}</div>
      </div>
      <div class="panel-card">
        <div class="table-responsive-wrapper"><table>
          <thead><tr><th>Nome</th><th>Tipo</th><th>Leitura Atual</th><th>Limites</th><th>Máquina</th><th>Localização</th><th>Status</th><th></th></tr></thead>
          <tbody>${rows || `<tr><td colspan="8" class="table-empty-state">${I.radio}<br><br>Nenhum sensor encontrado</td></tr>`}</tbody>
        </table></div>
      </div>
    </div>`;
  }
  
  function renderOrders() {
    const { orders, machines, users, orderTypeFilter: tf, orderStatusFilter: sf, orderQuery: q, deleteId, expandedId } = state;
    const filtered = orders.filter((o) => {
      const mq = o.title.toLowerCase().includes(q.toLowerCase()) || o.id.toLowerCase().includes(q.toLowerCase());
      return mq && (tf === "all" || o.type === tf) && (sf === "all" || o.status === sf);
    });
  
    const rows = filtered.map((o) => {
      const machine = machines.find((m) => m.id === o.machineId);
      const assignee = users.find((u) => u.id === o.assignedToId);
      const exp = expandedId === o.id;
  
      const actionCell = deleteId === o.id
        ? `<div style="display:flex;gap:8px;align-items:center"><button class="link-button-crimson" onclick="app.orders.confirmDelete('${o.id}')">Confirmar</button><button class="link-button-muted" onclick="app.clearDelete()">Cancelar</button></div>`
        : `<div style="display:flex;gap:2px"><button class="icon-action-button edit" onclick="app.orders.openEdit('${o.id}')">${I.pencil}</button><button class="icon-action-button delete" onclick="app.setDelete('${o.id}')">${I.trash}</button></div>`;
  
      const expandedRow = exp ? `<tr class="expanded-details-row"><td></td><td colspan="8">
        <div class="expanded-details-grid">
          <div><div class="expanded-section-label">Descrição da Manutenção</div><div style="color:var(--fg);line-height:1.6">${h(o.description || "—")}</div></div>
          <div>
            <div class="expanded-key-value-pair"><span class="text-muted">Criada em</span><span class="font-mono-style" style="color:var(--fg)">${h(o.createdAt)}</span></div>
            <div class="expanded-key-value-pair"><span class="text-muted">Horas estimadas</span><span class="font-mono-style" style="color:var(--fg)">${o.estimatedHours}h</span></div>
            <div class="expanded-key-value-pair"><span class="text-muted">Custo Hora</span><span class="font-mono-style" style="color:var(--fg)">R$ ${o.hourlyCost || 120}/h</span></div>
            ${o.completedAt ? `<div class="expanded-key-value-pair"><span class="text-muted">Concluída em</span><span class="font-mono-style" style="color:var(--emerald)">${h(o.completedAt)}</span></div>` : ""}
          </div>
          <div>
            <div class="expanded-key-value-pair"><span class="text-muted">Máquina</span><span style="color:var(--fg)">${machine ? h(machine.name) : "—"}</span></div>
            <div class="expanded-key-value-pair"><span class="text-muted">Localização</span><span style="color:var(--fg)">${machine ? h(machine.location) : "—"}</span></div>
          </div>
        </div>
      </td></tr>` : "";
  
      return `<tr>
        <td style="width:32px"><button class="table-expand-button${exp ? " open" : ""}" onclick="app.toggleExpand('${o.id}')">${I.chevron}</button></td>
        <td><div class="table-cell-mono">${h(o.id)}</div><div style="font-size:12px;font-weight:500;color:var(--fg);max-width:220px;overflow:hidden;text-overflow:ellipsis">${h(o.title)}</div></td>
        <td class="text-muted">${machine ? h(machine.name) : "—"}</td>
        <td>${badge(MAINT_TYPE[o.type].cls, MAINT_TYPE[o.type].label)}</td>
        <td>${badge(PRIORITY[o.priority].cls, PRIORITY[o.priority].label)}</td>
        <td>${dot(OS_STATUS[o.status].dot, OS_STATUS[o.status].label)}</td>
        <td class="text-muted">${assignee ? h(assignee.name) : "—"}</td>
        <td class="table-cell-mono">${h(o.scheduledFor || "—")}</td>
        <td>${actionCell}</td>
      </tr>${expandedRow}`;
    }).join("");
  
    document.getElementById("view_container").innerHTML = `<div class="view-wrapper">
      <div class="section-page-header">
        <div><div class="section-page-title">Ordens de Serviço</div><div class="section-page-subtitle">${orders.filter((o) => o.status === "aberta" || o.status === "em_andamento").length} em aberto de ${orders.length} no total</div></div>
        <button class="button-primary" onclick="app.orders.openAdd()">${I.plus} Nova OS</button>
      </div>
      <div class="actions-toolbar">
        <div class="search-input-wrapper">${I.search}<input class="search-input-field" placeholder="Buscar por ID ou título..." value="${h(q)}" oninput="app.orders.setQuery(this.value)"></div>
      </div>
      <div class="panel-card">
        <div class="table-responsive-wrapper"><table>
          <thead><tr><th></th><th>OS / Título</th><th>Máquina</th><th>Tipo</th><th>Prioridade</th><th>Status</th><th>Responsável</th><th>Previsto</th><th></th></tr></thead>
          <tbody>${rows || `<tr><td colspan="9" class="table-empty-state">${I.clipboard}<br><br>Nenhuma ordem encontrada</td></tr>`}</tbody>
        </table></div>
      </div>
    </div>`;
  }
  
  function renderUsers() {
    const { users, userQuery: q, deleteId } = state;
    const filtered = users.filter((u) => u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()));
  
    const rows = filtered.map((u, i) => {
      const role = USER_ROLE[u.role] || USER_ROLE.tecnico;
      const st = u.status === "ativo"
        ? { dot: "var(--emerald)", label: "Ativo" }
        : { dot: "var(--muted)", label: "Inativo" };
      const av = AVATAR_COLORS[i % AVATAR_COLORS.length];
  
      const actionCell = deleteId === u.id
        ? `<div style="display:flex;gap:8px;align-items:center"><button class="link-button-crimson" onclick="app.users.confirmDelete('${u.id}')">Confirmar</button><button class="link-button-muted" onclick="app.clearDelete()">Cancelar</button></div>`
        : `<div style="display:flex;gap:2px"><button class="icon-action-button edit" onclick="app.users.openEdit('${u.id}')">${I.pencil}</button><button class="icon-action-button delete" onclick="app.setDelete('${u.id}')">${I.trash}</button></div>`;
  
      return `<tr>
        <td><div class="user-cell" style="display:flex;align-items:center;gap:8px"><div class="user-avatar" style="${av}">${avatarInitials(u.name)}</div><span style="font-size:12px;font-weight:500;color:var(--fg)">${h(u.name)}</span></div></td>
        <td class="table-cell-mono">${h(u.email)}</td>
        <td class="table-cell-mono">${h(u.phone)}</td>
        <td>${badge(role.cls, role.label)}</td>
        <td>${dot(st.dot, st.label)}</td>
        <td class="table-cell-mono">${h(u.createdAt)}</td>
        <td>${actionCell}</td>
      </tr>`;
    }).join("");
  
    document.getElementById("view_container").innerHTML = `<div class="view-wrapper">
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
          <tbody>${rows || `<tr><td colspan="7" class="table-empty-state">${I.users}<br><br>Nenhum usuário encontrado</td></tr>`}</tbody>
        </table>
      </div>
    </div>`;
  }
  
  function renderView() {
    const sidebar = document.getElementById("sidebar_container");
    const topbar = document.getElementById("topbar_header");
  
    if (state.view === "login" || state.view === "register") {
      if (sidebar) sidebar.style.display = "none";
      if (topbar) topbar.style.display = "none";
      if (state.view === "login") renderLoginView();
      else renderRegisterView();
    } else {
      if (sidebar) sidebar.style.display = "flex";
      if (topbar) topbar.style.display = "flex";
  
      const renderFn = {
        dashboard: renderDashboard,
        machines: renderMachines,
        sensors: renderSensors,
        orders: renderOrders,
        users: renderUsers
      }[state.view] || renderDashboard;
  
      renderFn();
    }
  }
  
  function renderAll() {
    if (state.view !== "login" && state.view !== "register") {
      renderNav();
      renderTopbar();
    }
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
  }
  
  const app = {
    navigate(view) {
      state.view = view;
      state.deleteId = null;
      renderAll();
    },
    handleLogin() {
      localStorage.setItem("sg_logged_in", "true");
      state.view = "dashboard";
      renderAll();
    },
    handleRegister() {
      const name = document.getElementById("reg_name")?.value;
      const email = document.getElementById("reg_email")?.value;
      const phone = document.getElementById("reg_phone")?.value;
      const role = document.getElementById("reg_role")?.value;
  
      if (name && email) {
        state.users.push({
          id: "u" + Date.now(),
          name,
          email,
          phone: phone || "(11) 90000-0000",
          role: role || "tecnico",
          status: "ativo",
          createdAt: new Date().toISOString().split("T")[0]
        });
      }
      localStorage.setItem("sg_logged_in", "true");
      state.view = "dashboard";
      renderAll();
    },
    logout() {
      localStorage.removeItem("sg_logged_in");
      state.view = "login";
      renderAll();
    },
    closeModal() {
      const overlay = document.getElementById("modal_overlay");
      if (overlay) overlay.style.display = "none";
      state.editingId = null;
      state.modalContext = null;
    },
    setDelete(id) {
      state.deleteId = id;
      renderView();
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
      setQuery(v) { state.machineQuery = v; renderMachines(); },
      setFilter(v) { state.machineFilter = v; renderMachines(); },
      openAdd() {
        state.editingId = null;
        openModal("Nova Máquina", app.machines._form(null), app.machines._footer(), true);
      },
      openEdit(id) {
        state.editingId = id;
        const m = state.machines.find((x) => x.id === id);
        openModal("Editar Máquina", app.machines._form(m), app.machines._footer(), true);
      },
      _form(m) {
        return `<div class="form-grid-layout">
          <div class="form-field-group full-width"><label class="form-input-label">Nome da Máquina</label><input id="f-name" class="form-input-field" value="${h(m?.name || "")}"></div>
          <div class="form-field-group"><label class="form-input-label">Modelo</label><input id="f-model" class="form-input-field" value="${h(m?.model || "")}"></div>
          <div class="form-field-group"><label class="form-input-label">Fabricante</label><input id="f-manufacturer" class="form-input-field" value="${h(m?.manufacturer || "")}"></div>
          <div class="form-field-group"><label class="form-input-label">Localização</label><input id="f-location" class="form-input-field" value="${h(m?.location || "")}"></div>
          <div class="form-field-group"><label class="form-input-label">Departamento</label><input id="f-department" class="form-input-field" value="${h(m?.department || "")}"></div>
        </div>`;
      },
      _footer() {
        return `<button class="button-cancel" onclick="app.closeModal()">Cancelar</button><button class="button-save" onclick="app.machines.save()">Salvar</button>`;
      },
      save() {
        const name = document.getElementById("f-name")?.value?.trim();
        if (!name) return;
        const data = {
          name,
          model: document.getElementById("f-model").value,
          manufacturer: document.getElementById("f-manufacturer").value,
          location: document.getElementById("f-location").value,
          department: document.getElementById("f-department").value,
          status: "operando",
          sensorIds: []
        };
        if (state.editingId) {
          state.machines = state.machines.map((m) => m.id === state.editingId ? { ...m, ...data } : m);
        } else {
          state.machines.push({ ...data, id: "m" + Date.now() });
        }
        app.closeModal();
        renderMachines();
      },
      confirmDelete(id) {
        state.machines = state.machines.filter((m) => m.id !== id);
        state.deleteId = null;
        renderMachines();
      }
    },
  
    sensors: {
      setQuery(v) { state.sensorQuery = v; renderSensors(); },
      setFilter(v) { state.sensorFilter = v; renderSensors(); },
      openAdd() {
        state.editingId = null;
        openModal("Novo Sensor", app.sensors._form(null), app.sensors._footer(), true);
      },
      openEdit(id) {
        state.editingId = id;
        const s = state.sensors.find((x) => x.id === id);
        openModal("Editar Sensor", app.sensors._form(s), app.sensors._footer(), true);
      },
      _form(s) {
        return `<div class="form-grid-layout">
          <div class="form-field-group"><label class="form-input-label">Nome/Código</label><input id="f-name" class="form-input-field" value="${h(s?.name || "")}"></div>
          <div class="form-field-group"><label class="form-input-label">Unidade</label><input id="f-unit" class="form-input-field" value="${h(s?.unit || "")}"></div>
        </div>`;
      },
      _footer() {
        return `<button class="button-cancel" onclick="app.closeModal()">Cancelar</button><button class="button-save" onclick="app.sensors.save()">Salvar</button>`;
      },
      save() {
        const name = document.getElementById("f-name")?.value?.trim();
        if (!name) return;
        if (state.editingId) {
          state.sensors = state.sensors.map((s) => s.id === state.editingId ? { ...s, name } : s);
        } else {
          state.sensors.push({ id: "s" + Date.now(), name, type: "temperatura", unit: "°C", status: "online", currentValue: 25, minThreshold: 0, maxThreshold: 80, location: "Galpão A" });
        }
        app.closeModal();
        renderSensors();
      },
      confirmDelete(id) {
        state.sensors = state.sensors.filter((s) => s.id !== id);
        state.deleteId = null;
        renderSensors();
      }
    },
  
    orders: {
      setQuery(v) { state.orderQuery = v; renderOrders(); },
      openAdd() {
        state.editingId = null;
        openModal("Nova Ordem de Serviço", app.orders._form(null), app.orders._footer(), true);
      },
      openEdit(id) {
        state.editingId = id;
        const o = state.orders.find((x) => x.id === id);
        openModal(`Editar ${o.id}`, app.orders._form(o), app.orders._footer(), true);
      },
      _form(o) {
        return `<div class="form-grid-layout">
          <div class="form-field-group full-width"><label class="form-input-label">Título da OS</label><input id="f-title" class="form-input-field" value="${h(o?.title || "")}"></div>
          <div class="form-field-group"><label class="form-input-label">Horas Estimadas</label><input id="f-hours" type="number" class="form-input-field" value="${o?.estimatedHours || 2}"></div>
        </div>`;
      },
      _footer() {
        return `<button class="button-cancel" onclick="app.closeModal()">Cancelar</button><button class="button-save" onclick="app.orders.save()">Salvar</button>`;
      },
      save() {
        const title = document.getElementById("f-title")?.value?.trim();
        if (!title) return;
        if (state.editingId) {
          state.orders = state.orders.map((o) => o.id === state.editingId ? { ...o, title } : o);
        } else {
          state.orders.push({
            id: "OS-2026-" + Math.floor(100 + Math.random() * 900),
            title,
            machineId: "m1",
            type: "preventiva",
            priority: "media",
            status: "aberta",
            assignedToId: "u3",
            createdAt: new Date().toISOString().split("T")[0],
            scheduledFor: new Date().toISOString().split("T")[0],
            estimatedHours: 4,
            hourlyCost: 120
          });
        }
        app.closeModal();
        renderOrders();
      },
      confirmDelete(id) {
        state.orders = state.orders.filter((o) => o.id !== id);
        state.deleteId = null;
        renderOrders();
      }
    },
  
    users: {
      setQuery(v) { state.userQuery = v; renderUsers(); },
      openAdd() {
        openModal("Novo Usuário", `<div class="form-field-group"><label class="form-input-label">Nome</label><input id="f-uname" class="form-input-field"></div>`, app.users._footer());
      },
      openEdit(id) {
        const u = state.users.find((x) => x.id === id);
        openModal("Editar Usuário", `<div class="form-field-group"><label class="form-input-label">Nome</label><input id="f-uname" class="form-input-field" value="${h(u.name)}"></div>`, app.users._footer());
      },
      _footer() {
        return `<button class="button-cancel" onclick="app.closeModal()">Cancelar</button><button class="button-save" onclick="app.users.save()">Salvar</button>`;
      },
      save() {
        const name = document.getElementById("f-uname")?.value?.trim();
        if (!name) return;
        if (state.editingId) {
          state.users = state.users.map((u) => u.id === state.editingId ? { ...u, name } : u);
        } else {
          state.users.push({ id: "u" + Date.now(), name, email: `${name.toLowerCase().replace(/\s+/g, '.')}@industria.com`, phone: "(11) 99999-0000", role: "tecnico", status: "ativo", createdAt: new Date().toISOString().split("T")[0] });
        }
        app.closeModal();
        renderUsers();
      },
      confirmDelete(id) {
        state.users = state.users.filter((u) => u.id !== id);
        state.deleteId = null;
        renderUsers();
      }
    }
  };
  
  document.addEventListener("DOMContentLoaded", () => {
    renderAll();
  });
