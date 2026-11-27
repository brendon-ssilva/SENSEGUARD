/* Gráficos SVG simples (rosca e barras) sem bibliotecas externas. */
import { h } from "../utils/dom.js";

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
export function renderDonut(data, size = 160, ro = 68, ri = 48) {
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
export function renderBarChart(data, w = 340, height = 160) {
  if (!data.length) return "";
  const maxV = Math.max(...data.map((d) => d.value), 1);
  const padL = 24, padB = 30, padT = 10, padR = 10;
  const cw = w - padL - padR, ch = height - padB - padT;
  const bw = Math.min(36, cw / data.length - 12);
  const gap = (cw - bw * data.length) / (data.length + 1);
  let bars = "", labels = "", ylines = "";
  const step = Math.max(1, Math.ceil(maxV / 4));
  for (let i = 0; i <= maxV; i += step) {
    const y = padT + ch - (i / maxV) * ch;
    ylines += `<line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="var(--border)" stroke-width=".5"/>`;
    ylines += `<text x="${padL - 4}" y="${y + 4}" text-anchor="end" font-size="10" fill="var(--muted)" font-family="JetBrains Mono,monospace">${i}</text>`;
  }
  data.forEach((d, i) => {
    const x = padL + gap + (bw + gap) * i;
    const bh = Math.max(2, (d.value / maxV) * ch);
    const y = padT + ch - bh;
    bars += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="3" fill="${d.color}"/>`;
    const lx = x + bw / 2;
    const label = d.name.length > 8 ? d.name.slice(0, 8) : d.name;
    labels += `<text x="${lx}" y="${height - 8}" text-anchor="middle" font-size="10" fill="var(--muted)" font-family="JetBrains Mono,monospace">${h(label)}</text>`;
  });
  return `<svg width="${w}" height="${height}" viewBox="0 0 ${w} ${height}">${ylines}${bars}${labels}</svg>`;
}
