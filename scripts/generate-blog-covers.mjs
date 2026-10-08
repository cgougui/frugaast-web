#!/usr/bin/env node
// Generates 1200x630 abstract covers for blog articles listed in blog/<source>/articles.json.
// Each cover is generative SVG art rendered with headless Chrome (so blur/glow filters look right).
//
// Usage:
//   node scripts/generate-blog-covers.mjs            # only articles whose local image file is missing
//   node scripts/generate-blog-covers.mjs --force    # also regenerate covers previously made by this script
//   node scripts/generate-blog-covers.mjs <id> ...   # (re)generate the given article ids
//
// Variety: motif, palette and theme (dark / light / color) are assigned walking articles.json in order,
// so neighbouring articles never share a motif or palette, and every motif gets used about equally.
// Keywords in the id steer which motifs an article prefers. Appending articles never changes earlier covers;
// inserting or reordering entries can reshuffle the ones after the change.
//
// Pin a look in articles.json with "cover": { "motif": "truchet", "palette": 9, "theme": "light" }.
//
// Output format follows the image extension in articles.json: .jpg (recommended, ~5x smaller) or .png.
// Hand-made images are never overwritten: generated covers carry COVER_MARKER in their comment metadata,
// and only files with that marker (or missing files) are written.
//
// Requires Chrome/Chromium ($CHROME_BIN, otherwise google-chrome / chromium on PATH) and ImageMagick (`convert`, `identify`).

import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const blogDir = path.join(root, 'blog');
const publicDir = path.join(root, 'public');
const W = 1200;
const H = 630;
const TAU = Math.PI * 2;
const COVER_MARKER = 'frugaast-generated-cover';

// Four colours each; the last one is the "deep" colour used as background in the color theme.
const PALETTES = [
  ['#22d3ee', '#a78bfa', '#f0abfc', '#4338ca'], // 0 neon
  ['#f97316', '#f43f5e', '#fde68a', '#7c2d12'], // 1 sunset
  ['#34d399', '#22d3ee', '#d9f99d', '#065f46'], // 2 mint
  ['#818cf8', '#c084fc', '#f9a8d4', '#3730a3'], // 3 indigo
  ['#facc15', '#fb923c', '#fef3c7', '#78350f'], // 4 amber
  ['#2dd4bf', '#3b82f6', '#a5f3fc', '#1e3a8a'], // 5 lagoon
  ['#fb7185', '#a855f7', '#fecdd3', '#581c87'], // 6 rose
  ['#a3e635', '#14b8a6', '#ecfccb', '#134e4a'], // 7 lime
  ['#e63946', '#f1c453', '#a8dadc', '#1d3557'], // 8 bauhaus
  ['#ef476f', '#ffd166', '#06d6a0', '#073b4c'], // 9 retro
  ['#60a5fa', '#c7d2fe', '#ffffff', '#1e40af'], // 10 cobalt
  ['#f59e0b', '#84cc16', '#fde68a', '#3f2a14'], // 11 earth
  ['#ff6b6b', '#4ecdc4', '#ffe66d', '#1a535c'], // 12 memphis
  ['#4ade80', '#a7f3d0', '#bbf7d0', '#052e16'], // 13 phosphor
  ['#38bdf8', '#f97316', '#fef08a', '#0c4a6e'], // 14 fire & ice
  ['#e879f9', '#fb7185', '#fbcfe8', '#4a044e'], // 15 orchid
];

const THEMES = { dark: 0.45, light: 0.3, color: 0.25 }; // target share of covers

// ---------- seeded randomness ----------

function hashString(str) {
  let h = 2166136261;
  for (const ch of str) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 2D Perlin noise, roughly in [-0.7, 0.7].
function makeNoise(rand) {
  const p = [...Array(256).keys()];
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  const perm = p.concat(p);
  const grads = perm.map((v) => [Math.cos((v / 256) * TAU), Math.sin((v / 256) * TAU)]);
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const dot = (h, x, y) => grads[h][0] * x + grads[h][1] * y;
  return (x, y) => {
    const xi = Math.floor(x) & 255, yi = Math.floor(y) & 255;
    const xf = x - Math.floor(x), yf = y - Math.floor(y);
    const u = fade(xf), v = fade(yf);
    const aa = perm[perm[xi] + yi], ab = perm[perm[xi] + yi + 1];
    const ba = perm[perm[xi + 1] + yi], bb = perm[perm[xi + 1] + yi + 1];
    const x1 = dot(aa, xf, yf) + u * (dot(ba, xf - 1, yf) - dot(aa, xf, yf));
    const x2 = dot(ab, xf, yf - 1) + u * (dot(bb, xf - 1, yf - 1) - dot(ab, xf, yf - 1));
    return x1 + v * (x2 - x1);
  };
}

const pick = (rand, arr) => arr[Math.floor(rand() * arr.length)];
const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));

// ---------- colour & svg helpers ----------

const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const toHex = (rgb) => '#' + rgb.map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => toHex(hexToRgb(a).map((v, i) => v + (hexToRgb(b)[i] - v) * t));
const shade = (hex, k) => toHex(hexToRgb(hex).map((v) => v * k));
const luminance = (hex) => hexToRgb(hex).reduce((s, v, i) => s + (v / 255) * [0.2126, 0.7152, 0.0722][i], 0);
// Darken a colour until it reads clearly on a light background.
const forLight = (hex, maxLum = 0.38) => {
  let c = hex;
  while (luminance(c) > maxLum) c = mix(c, '#000000', 0.12);
  return c;
};
const f = (n) => n.toFixed(1);
const pathFrom = (pts) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f(x)} ${f(y)}`).join('');
const polygon = (cx, cy, r, sides, rotDeg) =>
  Array.from({ length: sides }, (_, k) => {
    const a = ((rotDeg + (k * 360) / sides) * Math.PI) / 180;
    return `${f(cx + r * Math.cos(a))},${f(cy + r * Math.sin(a))}`;
  }).join(' ');

// ---------- motifs ----------
// Each motif receives ctx = { rand, noise, c0, c1, hi, colors, ink, bg, glow } and returns SVG markup.
// `url(#grad)` is a c0 → c1 gradient across the canvas; `glow` is a filter attribute (empty on light themes).

function flow({ rand, noise, hi, glow }) {
  const scale = 0.0016 + rand() * 0.0016;
  const turn = 1 + rand() * 1.4;
  const base = rand() * TAU;
  let out = '';
  for (let i = 0; i < 520; i++) {
    let x = rand() * (W + 200) - 100;
    let y = rand() * (H + 200) - 100;
    const pts = [[x, y]];
    const steps = 40 + Math.floor(rand() * 90);
    for (let s = 0; s < steps; s++) {
      const a = base + noise(x * scale, y * scale) * TAU * turn;
      x += Math.cos(a) * 4;
      y += Math.sin(a) * 4;
      pts.push([x, y]);
    }
    out += rand() < 0.035
      ? `<path d="${pathFrom(pts)}" stroke="${hi}" stroke-width="2.2" stroke-opacity="0.9" ${glow}/>`
      : `<path d="${pathFrom(pts)}" stroke="url(#grad)" stroke-width="${(0.6 + rand() * 1.6).toFixed(2)}" stroke-opacity="${(0.25 + rand() * 0.55).toFixed(2)}"/>`;
  }
  return `<g fill="none" stroke-linecap="round">${out}</g>`;
}

function ridges({ rand, noise, hi, bg, glow }) {
  const lines = 26 + Math.floor(rand() * 10);
  const amp = 70 + rand() * 50;
  // Leave room above the first line for its tallest possible peak.
  const top = 30 + amp * 1.5, bottom = H - 50, x0 = 60, x1 = W - 60;
  const peaks = Array.from({ length: 2 + Math.floor(rand() * 2) }, () => ({ cx: W * (0.3 + rand() * 0.4), sigma: 70 + rand() * 120 }));
  const hiLine = Math.floor(lines * (0.3 + rand() * 0.5));
  let out = '';
  for (let k = 0; k < lines; k++) {
    const y = top + (k * (bottom - top)) / (lines - 1);
    const pts = [];
    for (let x = x0; x <= x1; x += 5) {
      const env = Math.min(1.2, peaks.reduce((s, p) => s + Math.exp(-((x - p.cx) ** 2) / (2 * p.sigma ** 2)), 0));
      const v = (noise(x * 0.011, k * 0.37) + 0.55) * env * amp + noise(x * 0.05, k) * 4;
      pts.push([x, y - Math.max(0, v)]);
    }
    const line = pathFrom(pts);
    const isHi = k === hiLine;
    out += `<path d="${line}L${x1} ${y}L${x0} ${y}Z" fill="${bg}" fill-opacity="0.94"/>`;
    out += `<path d="${line}" fill="none" stroke="${isHi ? hi : 'url(#grad)'}" stroke-width="${isHi ? 2.4 : 1.5}" ${isHi ? glow : ''}/>`;
  }
  return `<g stroke-linejoin="round" mask="url(#edgeFade)">${out}</g>`;
}

function rings({ rand, hi, ink, c0, c1, glow }) {
  const cx = W * (0.38 + rand() * 0.24), cy = H * (0.44 + rand() * 0.12);
  const rot = (-8 - rand() * 26) * (Math.PI / 180);
  const squash = 0.36 + rand() * 0.3;
  const point = (r, a) => {
    const x = r * Math.cos(a), y = r * Math.sin(a) * squash;
    return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)];
  };
  const arc = (r, a0, a1) => {
    const n = Math.max(8, Math.ceil(Math.abs(a1 - a0) * 40));
    return pathFrom(Array.from({ length: n + 1 }, (_, i) => point(r, a0 + ((a1 - a0) * i) / n)));
  };
  let out = '';
  const count = 12;
  for (let i = 0; i < count; i++) {
    const r = 34 + i * (27 + rand() * 4);
    const t = i / (count - 1);
    const color = mix(c0, c1, t);
    out += `<path d="${arc(r, 0, TAU)}" fill="none" stroke="${ink}" stroke-opacity="${(0.06 + (1 - t) * 0.06).toFixed(2)}"/>`;
    for (let k = 0, arcs = 1 + Math.floor(rand() * 3); k < arcs; k++) {
      const a0 = rand() * TAU, a1 = a0 + 0.2 + rand() * 1.4;
      const isHi = rand() < 0.12;
      out += `<path d="${arc(r, a0, a1)}" fill="none" stroke="${isHi ? hi : color}" stroke-width="${f(isHi ? 3 : 2 + rand() * 1.5)}" stroke-linecap="round" ${isHi ? glow : ''}/>`;
      const [dx, dy] = point(r, a1);
      out += `<circle cx="${f(dx)}" cy="${f(dy)}" r="${isHi ? 4.5 : 3}" fill="${isHi ? hi : color}" ${glow}/>`;
    }
  }
  for (let i = 0; i < 70; i++) {
    const [dx, dy] = point(40 + rand() * 340, rand() * TAU);
    out += `<circle cx="${f(dx)}" cy="${f(dy)}" r="${f(0.6 + rand() * 1.4)}" fill="${ink}" fill-opacity="${(0.15 + rand() * 0.45).toFixed(2)}"/>`;
  }
  out += `<circle cx="${f(cx)}" cy="${f(cy)}" r="90" fill="url(#core)"/><circle cx="${f(cx)}" cy="${f(cy)}" r="10" fill="${hi}" ${glow}/>`;
  return out;
}

function network({ rand, hi, c0, c1, glow }) {
  const cols = 17, rows = 9, cw = W / cols, ch = H / rows;
  const nodes = [];
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      if (rand() < 0.22) continue;
      nodes.push({ x: (c + 0.5 + (rand() - 0.5) * 0.8) * cw, y: (r + 0.5 + (rand() - 0.5) * 0.8) * ch, r: 1.4 + rand() * 2.4 });
    }
  }
  const maxD = cw * 1.65;
  const adj = nodes.map(() => []);
  let edges = '';
  nodes.forEach((a, i) => {
    for (let j = i + 1; j < nodes.length; j++) {
      const b = nodes[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d > maxD) continue;
      adj[i].push(j);
      adj[j].push(i);
      edges += `<line x1="${f(a.x)}" y1="${f(a.y)}" x2="${f(b.x)}" y2="${f(b.y)}" stroke="url(#grad)" stroke-opacity="${((1 - d / maxD) * 0.6).toFixed(2)}"/>`;
    }
  });
  // A few bright walks through the graph, drifting rightwards.
  let paths = '';
  const lit = new Set();
  for (let w = 0; w < 3; w++) {
    let cur = Math.floor(rand() * nodes.length);
    const pts = [[nodes[cur].x, nodes[cur].y]];
    lit.add(cur);
    for (let s = 0; s < 14; s++) {
      const next = adj[cur].filter((j) => !lit.has(j)).sort((a, b) => nodes[b].x - nodes[a].x + (rand() - 0.5) * cw * 2)[0];
      if (next === undefined) break;
      cur = next;
      lit.add(cur);
      pts.push([nodes[cur].x, nodes[cur].y]);
    }
    paths += `<path d="${pathFrom(pts)}" fill="none" stroke="${w === 0 ? hi : c0}" stroke-width="${w === 0 ? 2.6 : 1.8}" stroke-linejoin="round" ${glow}/>`;
  }
  let dots = '';
  nodes.forEach((n, i) => {
    dots += lit.has(i)
      ? `<circle cx="${f(n.x)}" cy="${f(n.y)}" r="14" fill="${hi}" fill-opacity="0.15"/><circle cx="${f(n.x)}" cy="${f(n.y)}" r="5" fill="${hi}" ${glow}/>`
      : `<circle cx="${f(n.x)}" cy="${f(n.y)}" r="${f(n.r)}" fill="${mix(c0, c1, n.x / W)}"/>`;
  });
  return edges + paths + dots;
}

function blocks({ rand, noise, hi, ink, c0, c1, glow }) {
  const n = 11, a = 34, b = a * 0.58;
  const maxH = 160;
  // Centre the whole stack (tallest tower to front tile) vertically.
  const ox = W / 2, oy = (H - 2 * n * b + maxH) / 2;
  const ns = 0.18 + rand() * 0.12;
  const poly = (pts) => pts.map((p) => p.map(f).join(',')).join(' ');
  let out = '';
  for (let sum = 0; sum <= 2 * (n - 1); sum++) {
    for (let i = Math.max(0, sum - n + 1); i <= Math.min(sum, n - 1); i++) {
      const j = sum - i;
      const raw = noise(i * ns + 3.1, j * ns + 7.7) + 0.2;
      const h = rand() < 0.25 || raw <= 0 ? 0 : Math.round((raw * maxH) / 14) * 14;
      const px = ox + (i - j) * a, py = oy + (i + j) * b;
      const top = [[px, py - h], [px + a, py + b - h], [px, py + 2 * b - h], [px - a, py + b - h]];
      if (h === 0) {
        out += `<polygon points="${poly(top)}" fill="${ink}" fill-opacity="0.03" stroke="${ink}" stroke-opacity="0.1"/>`;
        continue;
      }
      const t = Math.min(1, h / maxH);
      const isHi = t > 0.8 && rand() < 0.45;
      const color = isHi ? hi : mix(c0, c1, Math.min(1, t * 0.8 + rand() * 0.3));
      const left = [[px - a, py + b - h], [px, py + 2 * b - h], [px, py + 2 * b], [px - a, py + b]];
      const right = [[px, py + 2 * b - h], [px + a, py + b - h], [px + a, py + b], [px, py + 2 * b]];
      out += `<polygon points="${poly(left)}" fill="${shade(color, 0.3)}"/>`;
      out += `<polygon points="${poly(right)}" fill="${shade(color, 0.5)}"/>`;
      out += `<polygon points="${poly(top)}" fill="${shade(color, 0.9 + t * 0.1)}" stroke="#ffffff" stroke-opacity="0.3" stroke-width="0.8" ${isHi ? glow : ''}/>`;
    }
  }
  return `<g stroke-linejoin="round">${out}</g>`;
}

function waves({ rand, hi, glow }) {
  const lines = 48;
  const cx = W * (0.35 + rand() * 0.3), cy = H / 2;
  const spread = 260 + rand() * 120;
  const f1 = 0.004 + rand() * 0.004, f2 = 0.009 + rand() * 0.008;
  const p1 = 1.5 + rand() * 3, p2 = 2 + rand() * 4, phase = rand() * TAU;
  const a1 = 50 + rand() * 50, a2 = 15 + rand() * 25;
  const hiLine = Math.floor(lines * (0.2 + rand() * 0.6));
  let out = '';
  for (let k = 0; k < lines; k++) {
    const t = k / (lines - 1);
    const pts = [];
    for (let x = -10; x <= W + 10; x += 6) {
      const env = Math.exp(-((x - cx) ** 2) / (2 * (W * 0.3) ** 2));
      pts.push([x, cy + (t - 0.5) * spread * (0.25 + env) + Math.sin(x * f1 + t * p1) * a1 * env + Math.sin(x * f2 + t * p2 + phase) * a2 * env]);
    }
    out += k === hiLine
      ? `<path d="${pathFrom(pts)}" stroke="${hi}" stroke-width="2.2" ${glow}/>`
      : `<path d="${pathFrom(pts)}" stroke="url(#grad)" stroke-width="1.3" stroke-opacity="${(0.15 + 0.65 * Math.sin(Math.PI * t)).toFixed(2)}"/>`;
  }
  return `<g fill="none">${out}</g>`;
}

// Quarter-circle Truchet tiles: random orientation per cell makes long winding paths.
function truchet({ rand, noise, colors }) {
  const s = pick(rand, [40, 50, 60, 75]);
  const r = s / 2;
  const sw = s * (0.12 + rand() * 0.18);
  const scale = 0.002 + rand() * 0.003;
  let out = '';
  for (let y = 0; y < H; y += s) {
    for (let x = 0; x < W; x += s) {
      const d = rand() < 0.5
        ? `M${x + r} ${y}A${r} ${r} 0 0 1 ${x} ${y + r}M${x + s} ${y + r}A${r} ${r} 0 0 0 ${x + r} ${y + s}`
        : `M${x + r} ${y}A${r} ${r} 0 0 0 ${x + s} ${y + r}M${x} ${y + r}A${r} ${r} 0 0 1 ${x + r} ${y + s}`;
      const v = clamp(noise(x * scale, y * scale) + 0.5, 0, 0.999);
      out += `<path d="${d}" stroke="${colors[Math.floor(v * colors.length)]}" stroke-opacity="${(0.55 + v * 0.45).toFixed(2)}"/>`;
    }
  }
  return `<g fill="none" stroke-width="${f(sw)}" stroke-linecap="round">${out}</g>`;
}

// Swiss/Bauhaus grid: each cell gets a coloured ground and a rotated primitive shape.
function bauhaus({ rand, colors, ink }) {
  const rows = 4 + Math.floor(rand() * 3);
  const s = H / rows;
  const cols = Math.ceil(W / s);
  const offX = (W - cols * s) / 2;
  const all = [...colors, ink];
  let out = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = offX + c * s, y = r * s, cx = x + s / 2, cy = y + s / 2;
      const ground = rand() < 0.45 ? pick(rand, colors) : null;
      if (ground) out += `<rect x="${f(x)}" y="${f(y)}" width="${f(s + 0.5)}" height="${f(s + 0.5)}" fill="${ground}"/>`;
      const fg = pick(rand, all.filter((col) => col !== ground));
      const k = rand();
      let shape = '';
      if (k < 0.26) shape = `<path d="M${f(x)} ${f(y)}L${f(x + s)} ${f(y)}A${f(s)} ${f(s)} 0 0 1 ${f(x)} ${f(y + s)}Z" fill="${fg}"/>`;
      else if (k < 0.46) shape = `<path d="M${f(x)} ${f(y + s)}A${f(s / 2)} ${f(s / 2)} 0 0 1 ${f(x + s)} ${f(y + s)}Z" fill="${fg}"/>`;
      else if (k < 0.58) shape = `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(s * 0.36)}" fill="${fg}"/>`;
      else if (k < 0.66) shape = `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(s * 0.3)}" fill="none" stroke="${fg}" stroke-width="${f(s * 0.1)}"/>`;
      else if (k < 0.78) shape = `<path d="M${f(x)} ${f(y)}L${f(x + s)} ${f(y)}L${f(x)} ${f(y + s)}Z" fill="${fg}"/>`;
      else if (k < 0.86) shape = [0, 1, 2, 3].map((i) => `<rect x="${f(x)}" y="${f(y + (i * s) / 4 + s / 16)}" width="${f(s)}" height="${f(s / 8)}" fill="${fg}"/>`).join('');
      else if (k < 0.93) shape = [0, 1, 2].flatMap((i) => [0, 1, 2].map((j) => `<circle cx="${f(x + (i + 0.5) * (s / 3))}" cy="${f(y + (j + 0.5) * (s / 3))}" r="${f(s * 0.07)}" fill="${fg}"/>`)).join('');
      if (shape) out += `<g transform="rotate(${Math.floor(rand() * 4) * 90} ${f(cx)} ${f(cy)})">${shape}</g>`;
    }
  }
  return out;
}

// Random circle packing: filled discs, rings and target-style concentric circles.
function circles({ rand, colors, hi, glow }) {
  const placed = [];
  for (let attempt = 0; attempt < 5000 && placed.length < 260; attempt++) {
    const x = rand() * W, y = rand() * H;
    let maxR = 120;
    for (const c of placed) maxR = Math.min(maxR, Math.hypot(x - c.x, y - c.y) - c.r - 5);
    if (maxR < 5) continue;
    placed.push({ x, y, r: Math.min(maxR, 6 + rand() ** 2 * 110) });
  }
  return placed.map(({ x, y, r }) => {
    const color = pick(rand, colors);
    const k = rand();
    if (k < 0.45) return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${color}" fill-opacity="${(0.55 + rand() * 0.45).toFixed(2)}"/>`;
    if (k < 0.75) return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r - 1.5)}" fill="none" stroke="${color}" stroke-width="${f(Math.min(4, r * 0.15) + 1)}"/>`;
    if (k < 0.97) {
      let s = '';
      for (let rr = r; rr > 3; rr -= Math.max(4, r / 5)) s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr - 1)}" fill="none" stroke="${color}" stroke-width="1.5"/>`;
      return s;
    }
    return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${hi}" ${glow}/>`;
  }).join('');
}

// Nested polygons rotating as they grow: a spiral tunnel.
function tunnel({ rand, c0, c1, hi, glow }) {
  const cx = W * (0.3 + rand() * 0.4), cy = H * (0.35 + rand() * 0.3);
  const sides = pick(rand, [3, 4, 4, 5, 6]);
  const growth = 1.07 + rand() * 0.04;
  const rotStep = (2 + rand() * 6) * (rand() < 0.5 ? -1 : 1);
  const n = Math.ceil(Math.log(1100 / 8) / Math.log(growth));
  const hiIndex = Math.floor(n * (0.3 + rand() * 0.4));
  let out = '';
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const isHi = i === hiIndex;
    out += `<polygon points="${polygon(cx, cy, 8 * growth ** i, sides, i * rotStep)}" fill="none" stroke="${isHi ? hi : mix(c0, c1, t)}" stroke-width="${f(isHi ? 3 : 1 + t * 2)}" stroke-opacity="${isHi ? 1 : (0.35 + 0.65 * (1 - t)).toFixed(2)}" stroke-linejoin="round" ${isHi ? glow : ''}/>`;
  }
  return out;
}

// Halftone dot screen driven by noise or by distance to a focal point.
function halftone({ rand, noise, c0, c1, hi }) {
  const step = 12 + rand() * 10;
  const scale = 0.003 + rand() * 0.003;
  const radial = rand() < 0.45;
  const fx = W * (0.25 + rand() * 0.5), fy = H * (0.3 + rand() * 0.4);
  let out = '';
  for (let row = 0, y = step / 2; y < H + step; row++, y += step * 0.866) {
    for (let x = (row % 2) * (step / 2); x < W + step; x += step) {
      const v = radial
        ? clamp(1.15 - Math.hypot(x - fx, y - fy) / 520 + noise(x * scale, y * scale) * 0.5)
        : clamp(noise(x * scale, y * scale) * 1.3 + 0.5);
      const r = step * 0.5 * v ** 1.4;
      if (r < 0.7) continue;
      out += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${v > 0.88 ? hi : mix(c0, c1, x / W)}"/>`;
    }
  }
  return out;
}

// Topographic contour map via marching squares over fractal noise.
function contours({ rand, noise, c0, c1, hi, glow }) {
  const step = 8;
  const cols = Math.ceil(W / step) + 1, rows = Math.ceil(H / step) + 1;
  const scale = 0.0025 + rand() * 0.002;
  const field = [];
  for (let j = 0; j < rows; j++) {
    field.push([]);
    for (let i = 0; i < cols; i++) {
      const x = i * step, y = j * step;
      field[j].push(noise(x * scale, y * scale) + 0.5 * noise(x * scale * 2.1 + 9, y * scale * 2.1 + 3));
    }
  }
  const levels = 16;
  const hiLevel = Math.floor(levels * (0.55 + rand() * 0.3));
  // Edge ids: 0 top, 1 right, 2 bottom, 3 left. Case index bits: tl=8, tr=4, br=2, bl=1.
  const SEGMENTS = { 1: [[3, 2]], 2: [[2, 1]], 3: [[3, 1]], 4: [[0, 1]], 5: [[0, 1], [3, 2]], 6: [[0, 2]], 7: [[0, 3]],
    8: [[0, 3]], 9: [[0, 2]], 10: [[0, 3], [2, 1]], 11: [[0, 1]], 12: [[3, 1]], 13: [[2, 1]], 14: [[3, 2]] };
  let out = '';
  for (let l = 0; l < levels; l++) {
    const t = -0.75 + (1.5 * (l + 0.5)) / levels;
    let d = '';
    for (let j = 0; j < rows - 1; j++) {
      for (let i = 0; i < cols - 1; i++) {
        const tl = field[j][i], tr = field[j][i + 1], br = field[j + 1][i + 1], bl = field[j + 1][i];
        const idx = (tl > t) * 8 + (tr > t) * 4 + (br > t) * 2 + (bl > t);
        const segs = SEGMENTS[idx];
        if (!segs) continue;
        const x = i * step, y = j * step;
        const edgePoint = (e) => {
          if (e === 0) return [x + (step * (t - tl)) / (tr - tl), y];
          if (e === 1) return [x + step, y + (step * (t - tr)) / (br - tr)];
          if (e === 2) return [x + (step * (t - bl)) / (br - bl), y + step];
          return [x, y + (step * (t - tl)) / (bl - tl)];
        };
        for (const [e1, e2] of segs) {
          const [ax, ay] = edgePoint(e1), [bx, by] = edgePoint(e2);
          d += `M${f(ax)} ${f(ay)}L${f(bx)} ${f(by)}`;
        }
      }
    }
    if (!d) continue;
    const isHi = l === hiLevel, major = l % 4 === 0;
    out += `<path d="${d}" fill="none" stroke="${isHi ? hi : mix(c0, c1, l / (levels - 1))}" stroke-width="${isHi ? 3 : major ? 2.4 : 1.4}" stroke-opacity="${isHi ? 1 : major ? 0.95 : 0.7}" stroke-linecap="round" ${isHi ? glow : ''}/>`;
  }
  return out;
}

// Retro horizon: striped sun, mountain silhouette and a perspective grid.
function synthwave({ rand, noise, c0, c1, hi, ink, bg, glow }) {
  const horizon = H * (0.56 + rand() * 0.08);
  const vx = W / 2 + (rand() - 0.5) * 300;
  const R = 130 + rand() * 60;
  const sunY = horizon - R * (0.35 + rand() * 0.3);
  let out = `<defs><linearGradient id="sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${hi}"/><stop offset="1" stop-color="${c0}"/></linearGradient>
    <clipPath id="sky"><rect width="${W}" height="${f(horizon)}"/></clipPath></defs>`;
  for (let i = 0; i < 90; i++) out += `<circle cx="${f(rand() * W)}" cy="${f(rand() * horizon * 0.8)}" r="${f(0.5 + rand() * 1.3)}" fill="${ink}" fill-opacity="${(0.2 + rand() * 0.6).toFixed(2)}"/>`;
  let sun = `<circle cx="${f(vx)}" cy="${f(sunY)}" r="${f(R)}" fill="url(#sun)" ${glow}/>`;
  for (let k = 0; k < 7; k++) {
    const y = sunY + R * (0.05 + k * 0.14);
    sun += `<rect x="${f(vx - R - 5)}" y="${f(y)}" width="${f(2 * R + 10)}" height="${f(2 + k * 1.8)}" fill="${bg}"/>`;
  }
  out += `<g clip-path="url(#sky)">${sun}</g>`;
  const mountain = [[0, horizon]];
  for (let x = 0; x <= W; x += 10) mountain.push([x, horizon - Math.max(0, noise(x * 0.004, 2.5) + 0.25) * 150 * (0.4 + Math.abs(x - vx) / W)]);
  mountain.push([W, horizon]);
  out += `<path d="${pathFrom(mountain)}Z" fill="${bg}" stroke="${c1}" stroke-width="1.5" stroke-linejoin="round"/>`;
  out += `<rect y="${f(horizon)}" width="${W}" height="${f(H - horizon)}" fill="${bg}" fill-opacity="0.7"/>`;
  let grid = '';
  for (let i = -24; i <= 24; i++) grid += `<line x1="${f(vx + i * 14)}" y1="${f(horizon)}" x2="${f(vx + i * 110)}" y2="${H}"/>`;
  for (let k = 1; k <= 14; k++) {
    const y = horizon + (H - horizon) * (k / 14) ** 2.2;
    grid += `<line x1="0" y1="${f(y)}" x2="${W}" y2="${f(y)}" stroke-opacity="${(0.25 + 0.75 * (k / 14)).toFixed(2)}"/>`;
  }
  out += `<g stroke="${c1}" stroke-width="1.4" ${glow}>${grid}</g>`;
  out += `<line x1="0" y1="${f(horizon)}" x2="${W}" y2="${f(horizon)}" stroke="${hi}" stroke-width="2" ${glow}/>`;
  return out;
}

// Layered hypotrochoids (spirograph curves).
function spirograph({ rand, c0, c1, hi, glow }) {
  const cx = W / 2 + (rand() - 0.5) * 360, cy = H / 2;
  const q = pick(rand, [5, 7, 8, 9, 11, 13]);
  let p = 1 + Math.floor(rand() * (q - 1));
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  while (gcd(p, q) !== 1) p = (p % (q - 1)) + 1;
  const R = q, r = p;
  const layers = [[c0, 1.6, 0.9], [c1, 1.3, 0.8], [hi, 2, 1]];
  let out = '';
  layers.forEach(([color, width, opacity], li) => {
    const d = r * (0.5 + rand() * 0.9);
    const scale = (290 / (R - r + d)) * (1 - li * 0.1);
    const rot = rand() * TAU;
    const pts = [];
    const steps = 2400;
    for (let s = 0; s <= steps; s++) {
      const t = (s / steps) * TAU * r;
      const x = (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t);
      const y = (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t);
      pts.push([cx + scale * (x * Math.cos(rot) - y * Math.sin(rot)), cy + scale * (x * Math.sin(rot) + y * Math.cos(rot))]);
    }
    out += `<path d="${pathFrom(pts)}" fill="none" stroke="${color}" stroke-width="${width}" stroke-opacity="${opacity}" ${li === 2 ? glow : ''}/>`;
  });
  return out;
}

// Perfect maze (recursive backtracker) with its solution path lit up.
function maze({ rand, hi, glow }) {
  const s = pick(rand, [30, 35, 42]);
  const cols = Math.floor(W / s), rows = Math.floor(H / s);
  const ox = (W - cols * s) / 2 + s / 2, oy = (H - rows * s) / 2 + s / 2;
  const id = (c, r) => r * cols + c;
  const links = Array.from({ length: cols * rows }, () => []);
  const seen = new Uint8Array(cols * rows);
  const stack = [id(Math.floor(rand() * cols), Math.floor(rand() * rows))];
  seen[stack[0]] = 1;
  let edges = '';
  while (stack.length) {
    const cur = stack[stack.length - 1];
    const c = cur % cols, r = Math.floor(cur / cols);
    const options = [[c + 1, r], [c - 1, r], [c, r + 1], [c, r - 1]].filter(([x, y]) => x >= 0 && y >= 0 && x < cols && y < rows && !seen[id(x, y)]);
    if (!options.length) { stack.pop(); continue; }
    const [nc, nr] = pick(rand, options);
    const next = id(nc, nr);
    seen[next] = 1;
    links[cur].push(next);
    links[next].push(cur);
    edges += `M${f(ox + c * s)} ${f(oy + r * s)}L${f(ox + nc * s)} ${f(oy + nr * s)}`;
    stack.push(next);
  }
  // Breadth-first search from the left edge to the right edge.
  const start = id(0, Math.floor(rand() * rows)), goal = id(cols - 1, Math.floor(rand() * rows));
  const prev = new Int32Array(cols * rows).fill(-1);
  const queue = [start];
  prev[start] = start;
  while (queue.length) {
    const cur = queue.shift();
    if (cur === goal) break;
    for (const n of links[cur]) if (prev[n] === -1) { prev[n] = cur; queue.push(n); }
  }
  const route = [];
  for (let cur = goal; cur !== start; cur = prev[cur]) route.push([ox + (cur % cols) * s, oy + Math.floor(cur / cols) * s]);
  route.push([ox + (start % cols) * s, oy + Math.floor(start / cols) * s]);
  return `<path d="${edges}" fill="none" stroke="url(#grad)" stroke-opacity="0.45" stroke-width="${f(s * 0.42)}" stroke-linecap="square"/>
    <path d="${pathFrom(route)}" fill="none" stroke="${hi}" stroke-width="${f(s * 0.16)}" stroke-linecap="round" stroke-linejoin="round" ${glow}/>`;
}

// Audio-style bars, mirrored around the middle or rising from the bottom as a skyline.
function bars({ rand, noise, c0, c1, hi, glow }) {
  const n = 50 + Math.floor(rand() * 60);
  const bw = (W - 120) / n;
  const mirrored = rand() < 0.6;
  let out = '';
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const env = 0.35 + 0.65 * Math.sin(Math.PI * t) ** 0.8;
    const v = clamp((noise(i * 0.09, 1.3) + 0.6) * env + rand() * 0.12, 0.03, 1);
    const x = 60 + i * bw, w = bw * 0.6;
    const isHi = v > 0.85 && rand() < 0.5;
    const fill = isHi ? hi : mix(c0, c1, t);
    out += mirrored
      ? `<rect x="${f(x)}" y="${f(H / 2 - v * 250)}" width="${f(w)}" height="${f(v * 500)}" rx="${f(w / 2)}" fill="${fill}" ${isHi ? glow : ''}/>`
      : `<rect x="${f(x)}" y="${f(H - 50 - v * 480)}" width="${f(w)}" height="${f(v * 480)}" rx="${f(w / 4)}" fill="${fill}" ${isHi ? glow : ''}/>`;
  }
  return out;
}

// Hexagonal cells, filled where the noise field is high.
function hexgrid({ rand, noise, c0, c1, hi, ink, glow }) {
  const r = 22 + rand() * 18;
  const w = Math.sqrt(3) * r;
  const scale = 0.003 + rand() * 0.003;
  let out = '';
  for (let row = 0, y = 0; y < H + r; row++, y += 1.5 * r) {
    for (let x = (row % 2) * (w / 2); x < W + w; x += w) {
      const v = noise(x * scale, y * scale) + 0.5;
      const pts = polygon(x, y, r * 0.9, 6, 30);
      if (v > 0.6) {
        const isHi = rand() < 0.04;
        out += `<polygon points="${pts}" fill="${isHi ? hi : mix(c0, c1, clamp((v - 0.6) * 2.5))}" fill-opacity="${isHi ? 1 : clamp((v - 0.45) * 1.6, 0.2, 1).toFixed(2)}" ${isHi ? glow : ''}/>`;
      } else {
        out += `<polygon points="${pts}" fill="none" stroke="${ink}" stroke-opacity="0.12"/>`;
      }
    }
  }
  return out;
}

// Full-bleed low-poly triangulation shaded along a noisy gradient.
function lowpoly({ rand, noise, c0, c1, theme }) {
  const cols = 14, rows = 8;
  const pts = [];
  for (let j = 0; j <= rows; j++) {
    pts.push([]);
    for (let i = 0; i <= cols; i++) {
      const edge = i === 0 || j === 0 || i === cols || j === rows;
      pts[j].push([(i / cols) * W + (edge ? 0 : (rand() - 0.5) * (W / cols) * 0.8), (j / rows) * H + (edge ? 0 : (rand() - 0.5) * (H / rows) * 0.8)]);
    }
  }
  const tilt = rand() * TAU;
  const light = theme === 'light';
  let out = '';
  const tri = (a, b, c) => {
    const mx = (a[0] + b[0] + c[0]) / 3, my = (a[1] + b[1] + c[1]) / 3;
    const g = ((mx - W / 2) * Math.cos(tilt) + (my - H / 2) * Math.sin(tilt)) / W + 0.5;
    const base = mix(c0, c1, clamp(g + noise(mx * 0.004, my * 0.004)));
    const color = light ? mix(base, '#ffffff', 0.3 + rand() * 0.45) : shade(base, 0.3 + rand() * 0.45);
    out += `<polygon points="${[a, b, c].map((p) => p.map(f).join(',')).join(' ')}" fill="${color}" stroke="${color}" stroke-width="0.8"/>`;
  };
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const [a, b, c, d] = [pts[j][i], pts[j][i + 1], pts[j + 1][i + 1], pts[j + 1][i]];
      if (rand() < 0.5) { tri(a, b, c); tri(a, c, d); } else { tri(a, b, d); tri(b, c, d); }
    }
  }
  return out;
}

// Each motif lists keywords that make it a preferred pick for an article.
const MOTIFS = {
  flow: [flow, /vibe|judgment|comprehension|practice|habits|adoption/],
  ridges: [ridges, /token|quota|billing|cost|drain|subscription|spent/],
  rings: [rings, /blast|sandbox|yolo|threat|permission|hooks-enforce/],
  network: [network, /parallel|fan-out|orchestrator|subagent|cross-model|state|mcp/],
  blocks: [blocks, /single-pass|extension|codebase|build|layers|ledger/],
  waves: [waves, /drift|nerf|benchmark|eval|leaderboard|harness/],
  truchet: [truchet, /loop|config|pattern|routing|tool-surface/],
  bauhaus: [bauhaus, /team|norms|roles|vendors|design|kpi|metric/],
  circles: [circles, /sidecar|tools|free-tier|stealth|bubble/],
  tunnel: [tunnel, /hangover|debt|rabbit|depth|month-three/],
  halftone: [halftone, /evidence|claims|productivity|filtering|fidelity/],
  contours: [contours, /local|open-weight|hosted|quality|context|budget/],
  synthwave: [synthwave, /overnight|sleep|unattended|vibe/],
  spirograph: [spirograph, /polling|advisor|driver|cross-model|orchestrator/],
  maze: [maze, /plan|spec|decomposition|handoff|trust|browser|verification/],
  bars: [bars, /token|burn|math|cache|usage|savings/],
  hexgrid: [hexgrid, /agents|parallel|maintainers|slop|contribution/],
  lowpoly: [lowpoly, /switching|lock-in|choosing|career|expertise|judgment/],
};

// ---------- assignment (variety across the article list) ----------

function assignLooks(articles) {
  const names = Object.keys(MOTIFS);
  const motifUse = Object.fromEntries(names.map((n) => [n, 0]));
  const paletteUse = PALETTES.map(() => 0);
  const themeUse = Object.fromEntries(Object.keys(THEMES).map((t) => [t, 0]));
  const recentMotifs = [], recentPalettes = [], recentThemes = [];
  const combos = new Set(); // "motif/palette" and "motif/theme" already used
  const looks = new Map();

  const leastUsed = (pool, use, rand) => {
    const min = Math.min(...pool.map((k) => use[k]));
    return pick(rand, pool.filter((k) => use[k] === min));
  };

  for (const article of articles) {
    const rand = mulberry32(hashString(article.id) ^ 0x9e3779b9);
    const pinned = article.cover || {};

    let motif = MOTIFS[pinned.motif] ? pinned.motif : null;
    if (!motif) {
      const fresh = names.filter((n) => !recentMotifs.includes(n));
      const preferred = fresh.filter((n) => MOTIFS[n][1].test(article.id));
      motif = leastUsed(preferred.length ? preferred : fresh, motifUse, rand);
    }

    let palette = Number.isInteger(pinned.palette) ? pinned.palette % PALETTES.length : null;
    if (palette === null) {
      const fresh = PALETTES.map((_, i) => i).filter((i) => !recentPalettes.includes(i));
      const unseen = fresh.filter((i) => !combos.has(`${motif}/${i}`));
      palette = leastUsed(unseen.length ? unseen : fresh, paletteUse, rand);
    }

    let theme = THEMES[pinned.theme] ? pinned.theme : null;
    if (!theme) {
      const repeated = recentThemes.length >= 2 && recentThemes.at(-1) === recentThemes.at(-2) ? recentThemes.at(-1) : null;
      theme = Object.keys(THEMES)
        .filter((t) => t !== repeated)
        .map((t) => [t, (themeUse[t] + 1) / THEMES[t] + rand() * 1.5 + (combos.has(`${motif}/${t}`) ? 4 : 0)])
        .sort((a, b) => a[1] - b[1])[0][0];
    }

    combos.add(`${motif}/${palette}`).add(`${motif}/${theme}`);
    motifUse[motif]++;
    paletteUse[palette]++;
    themeUse[theme]++;
    recentMotifs.push(motif); if (recentMotifs.length > 8) recentMotifs.shift();
    recentPalettes.push(palette); if (recentPalettes.length > 6) recentPalettes.shift();
    recentThemes.push(theme);
    looks.set(article.id, { motif, palette, theme });
  }
  return looks;
}

// ---------- composition ----------

function makeContext(theme, palette, rand) {
  const [p0, p1, p2, p3] = PALETTES[palette];
  if (theme === 'light') {
    return {
      bg: pick(rand, ['#f4f1ea', '#eef1f4', '#f3eee6', '#f6f6f3']), ink: '#1b1e25',
      c0: forLight(p0), c1: forLight(p1), hi: forLight(p3, 0.2),
      colors: [forLight(p0, 0.5), forLight(p1, 0.5), forLight(p3, 0.3), forLight(p2, 0.55)], glow: '',
    };
  }
  if (theme === 'color') {
    return { bg: mix(p3, '#000000', 0.45), ink: '#ffffff', c0: p0, c1: p1, hi: p2, colors: [p0, p1, p2], glow: 'filter="url(#glow)"' };
  }
  return {
    bg: pick(rand, ['#06080c', '#0b0a10', '#070b0a', '#0c0a08']), ink: '#ffffff',
    c0: p0, c1: p1, hi: p2, colors: [p0, p1, p2, mix(p3, '#ffffff', 0.25)], glow: 'filter="url(#glow)"',
  };
}

function coverSvg(article, look) {
  const rand = mulberry32(hashString(article.id));
  const noise = makeNoise(rand);
  const ctx = { rand, noise, theme: look.theme, ...makeContext(look.theme, look.palette, rand) };
  const { bg, ink, c0, c1, hi } = ctx;
  const light = look.theme === 'light';

  const blobs = [c0, c1, c0].map((color, i) => {
    const r = 220 + rand() * 180;
    return `<circle cx="${f(W * (0.15 + rand() * 0.7))}" cy="${f(H * (0.1 + rand() * 0.8))}" r="${f(r)}" fill="${color}" fill-opacity="${light ? 0.12 : i === 2 ? 0.12 : 0.22}"/>`;
  }).join('');
  const gradAngle = rand() * TAU;
  const motif = MOTIFS[look.motif][0](ctx);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="grad" gradientUnits="userSpaceOnUse"
      x1="${f(W / 2 - (Math.cos(gradAngle) * W) / 2)}" y1="${f(H / 2 - (Math.sin(gradAngle) * H) / 2)}"
      x2="${f(W / 2 + (Math.cos(gradAngle) * W) / 2)}" y2="${f(H / 2 + (Math.sin(gradAngle) * H) / 2)}">
      <stop offset="0" stop-color="${c0}"/><stop offset="1" stop-color="${c1}"/>
    </linearGradient>
    <radialGradient id="core"><stop offset="0" stop-color="${hi}" stop-opacity="0.55"/><stop offset="1" stop-color="${hi}" stop-opacity="0"/></radialGradient>
    <radialGradient id="vignette" cx="0.5" cy="0.5" r="0.75">
      <stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${light ? 0.12 : 0.6}"/>
    </radialGradient>
    <linearGradient id="edgeFadeGrad"><stop offset="0.05" stop-color="#fff" stop-opacity="0"/><stop offset="0.22" stop-color="#fff"/><stop offset="0.78" stop-color="#fff"/><stop offset="0.95" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <mask id="edgeFade"><rect width="${W}" height="${H}" fill="url(#edgeFadeGrad)"/></mask>
    <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="12" cy="12" r="1" fill="${ink}" fill-opacity="${light ? 0.12 : 0.07}"/></pattern>
    <filter id="blur" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="90"/></filter>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="${bg}"/>
  <g filter="url(#blur)">${blobs}</g>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>
  ${motif}
  <rect width="${W}" height="${H}" filter="url(#grain)" opacity="0.06" style="mix-blend-mode:overlay"/>
  <rect width="${W}" height="${H}" fill="url(#vignette)"/>
</svg>`;
}

const coverHtml = (article, look) => `<!doctype html>
<html><head><meta charset="utf-8">
<style>* { margin: 0; padding: 0; } html, body { width: ${W}px; height: ${H}px; overflow: hidden; } svg { display: block; }</style>
</head><body>${coverSvg(article, look)}</body></html>`;

// ---------- rendering ----------

function findChrome() {
  const candidates = [process.env.CHROME_BIN, 'google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser'].filter(Boolean);
  for (const bin of candidates) {
    try {
      execFileSync(bin, ['--version'], { stdio: 'ignore' });
      return bin;
    } catch {}
  }
  throw new Error('No Chrome/Chromium found. Set CHROME_BIN.');
}

// Headless Chrome reserves part of the window height, so render into a taller window and crop to the cover size.
function render(chrome, html, outFile, tmpDir) {
  const htmlFile = path.join(tmpDir, 'cover.html');
  const shotFile = path.join(tmpDir, 'shot.png');
  fs.writeFileSync(htmlFile, html);
  execFileSync(chrome, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
    `--user-data-dir=${path.join(tmpDir, 'profile')}`,
    '--force-device-scale-factor=1',
    `--window-size=${W},${H + 300}`,
    '--virtual-time-budget=1000',
    `--screenshot=${shotFile}`,
    `file://${htmlFile}`,
  ], { stdio: 'ignore' });
  const format = outFile.endsWith('.png')
    ? ['-define', 'png:exclude-chunks=date,time,iCCP,bKGD']
    : ['-strip', '-quality', '82', '-sampling-factor', '4:4:4', '-interlace', 'Plane'];
  execFileSync('convert', [shotFile, '-crop', `${W}x${H}+0+0`, '+repage', ...format, '-set', 'comment', COVER_MARKER, outFile]);
}

const args = process.argv.slice(2);
const force = args.includes('--force');
const onlyIds = args.filter((a) => !a.startsWith('--'));

// Every blog/<source>/articles.json, sources in name order, articles in file order.
const articles = fs.readdirSync(blogDir, { withFileTypes: true })
  .filter((e) => e.isDirectory() && fs.existsSync(path.join(blogDir, e.name, 'articles.json')))
  .map((e) => e.name)
  .sort()
  .flatMap((source) => JSON.parse(fs.readFileSync(path.join(blogDir, source, 'articles.json'), 'utf-8')).articles || []);
const looks = assignLooks(articles);
const isGeneratedCover = (file) =>
  execFileSync('identify', ['-format', '%c', file], { encoding: 'utf-8' }).includes(COVER_MARKER);

const targets = articles.filter((a) => {
  const image = a.image || `/images/blog/${a.id}.png`;
  if (!/^\/images\/blog\/.+\.(png|jpg)$/.test(image)) return false;
  if (onlyIds.length && !onlyIds.includes(a.id)) return false;
  const file = path.join(publicDir, image);
  if (!fs.existsSync(file)) return true;
  if (!isGeneratedCover(file)) {
    if (onlyIds.length) console.warn(`↷ skipping ${image}: hand-made image, delete it first to replace it`);
    return false;
  }
  return force || onlyIds.length > 0;
});

if (!targets.length) {
  console.log('No covers to generate.');
  process.exit(0);
}

const chrome = findChrome();
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-covers-'));
try {
  for (const article of targets) {
    const look = looks.get(article.id);
    const outFile = path.join(publicDir, article.image || `/images/blog/${article.id}.png`);
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    render(chrome, coverHtml(article, look), outFile, tmpDir);
    console.log(`✓ ${path.relative(root, outFile)}  [${look.motif} · palette ${look.palette} · ${look.theme}]`);
  }
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
