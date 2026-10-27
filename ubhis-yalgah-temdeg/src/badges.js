// Generates SVG figures for the sleeve position insignia (service + camouflage variants)
// and renders them to PNG with Playwright.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = process.argv[2];
const FONT = "'Liberation Sans', Arial, sans-serif";
const INK = '#1c2740';

let uid = 0;
const nid = (p) => `${p}${++uid}`;

// ---------- shared defs ----------
function defs() {
  return `
  <defs>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f8e08a"/><stop offset="0.45" stop-color="#d9ad33"/><stop offset="1" stop-color="#9c7414"/>
    </linearGradient>
    <linearGradient id="goldH" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f8e08a"/><stop offset="0.5" stop-color="#d4a52c"/><stop offset="1" stop-color="#9c7414"/>
    </linearGradient>
    <linearGradient id="silver" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/><stop offset="0.5" stop-color="#d9dee7"/><stop offset="1" stop-color="#99a2b3"/>
    </linearGradient>
    <linearGradient id="navy" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2a3a60"/><stop offset="1" stop-color="#172240"/>
    </linearGradient>
    <linearGradient id="olive" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#666d48"/><stop offset="1" stop-color="#555b3b"/>
    </linearGradient>
    <linearGradient id="jacket" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2e3e4e"/><stop offset="1" stop-color="#1f2b38"/>
    </linearGradient>
    <filter id="sh" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="3" dy="5" stdDeviation="5" flood-color="#000" flood-opacity="0.25"/>
    </filter>
    <filter id="shs" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.3"/>
    </filter>
    <pattern id="camo" width="180" height="180" patternUnits="userSpaceOnUse">
      <rect width="180" height="180" fill="#6a6f49"/>
      <path d="M10 20 q30 -18 55 5 t40 30 q-20 25 -55 10 t-40 -45z" fill="#4c5233"/>
      <path d="M100 90 q35 -10 60 12 t-5 45 q-30 10 -45 -10 t-10 -47z" fill="#4c5233"/>
      <path d="M20 110 q25 -15 45 0 t20 35 q-25 18 -50 2 t-15 -37z" fill="#82785a"/>
      <path d="M120 10 q25 0 40 18 t-10 30 q-25 5 -35 -12 t5 -36z" fill="#82785a"/>
      <path d="M70 60 q15 -8 25 4 t-4 18 q-14 4 -20 -6 t-1 -16z" fill="#35391f"/>
      <path d="M150 150 q12 -6 22 4 t-4 16 q-12 3 -18 -6 t0 -14z" fill="#35391f"/>
      <path d="M40 160 q12 -6 22 4 t-4 16 q-12 3 -18 -6 t0 -14z" fill="#35391f"/>
    </pattern>
    <pattern id="velcro" width="6" height="6" patternUnits="userSpaceOnUse">
      <rect width="6" height="6" fill="#4f5536"/><circle cx="3" cy="3" r="1.2" fill="#646a47"/>
    </pattern>
  </defs>`;
}

// ---------- the position patch ----------
// geometry in local units: w=240, h=360 (6 x 9 cm)
const W = 240, H = 360, SH = 70;
const pentagon = (i = 0) => {
  // inset pentagon by i
  const k = i * 1.25; // approx for slanted edges
  return `M${i} ${SH + i * 0.6} L${W / 2} ${k} L${W - i} ${SH + i * 0.6} L${W - i} ${H - i} L${i} ${H - i} Z`;
};

function rhomb(cx, cy, w, h, fill, edge, hl) {
  return `<g>
    <path d="M${cx} ${cy - h / 2} L${cx + w / 2} ${cy} L${cx} ${cy + h / 2} L${cx - w / 2} ${cy} Z" fill="${fill}" stroke="${edge}" stroke-width="2.5"/>
    ${hl ? `<path d="M${cx} ${cy - h / 2 + 6} L${cx + w / 2 - 7} ${cy} L${cx} ${cy}Z" fill="#fff" opacity="0.28"/>` : ''}
  </g>`;
}

function chevron(cx, top, w, t, fill, edge) {
  // inverted V (points up)
  const half = w / 2, drop = w * 0.38;
  return `<path d="M${cx - half} ${top + drop} L${cx} ${top} L${cx + half} ${top + drop} L${cx + half} ${top + drop + t} L${cx} ${top + t} L${cx - half} ${top + drop + t} Z" fill="${fill}" stroke="${edge}" stroke-width="2"/>`;
}

function arc(cx, top, w, t, fill, edge) {
  const half = w / 2, sag = 22;
  return `<path d="M${cx - half} ${top} Q${cx} ${top + sag * 2} ${cx + half} ${top} L${cx + half} ${top + t} Q${cx} ${top + t + sag * 2} ${cx - half} ${top + t} Z" fill="${fill}" stroke="${edge}" stroke-width="2"/>`;
}

function wreath(cx, cy, r, fill) {
  let s = '';
  for (let i = 0; i < 6; i++) {
    const a = (190 + i * 15) * Math.PI / 180; // left side going down
    const b = (-10 - i * 15) * Math.PI / 180;
    for (const ang of [a, b]) {
      const x = cx + r * Math.cos(ang), y = cy - r * Math.sin(ang);
      const rot = (ang * 180 / Math.PI) + 90;
      s += `<ellipse cx="${x}" cy="${y}" rx="4" ry="9" transform="rotate(${-rot} ${x} ${y})" fill="${fill}"/>`;
    }
  }
  return s;
}

// battalion colours (service / camouflage)
const BN = {
  1: { svc: '#c8102e', camo: '#6b2a22' },
  2: { svc: '#0a63b8', camo: '#2b4a6b' },
  3: { svc: '#d4a52c', camo: '#a08a4a' },
  c: { svc: '#eef1f5', camo: '#d9d4c0' },   // committee level
};
const HERO = { 1: 'Ц.ОЛЗВОЙ', 5: 'Ж.ЛХАГВАСҮРЭН', 9: 'Д.ХАЯНХЯРВАА' };
const CO_BN = (co) => Math.ceil(co / 4);
const ROMAN = { 1: 'I', 2: 'II', 3: 'III' };

// stylised falcon with spread wings (ҮБХИС symbol), local box ~160 x 70 centred on 0,0
function falcon(x, y, sc, fill, edge) {
  // falcon displayed with raised wings, head turned left, hooked beak (ҮБХИС symbol)
  const wing = 'M-4 -6 C-14 -18 -30 -32 -54 -44 C-51 -36 -48 -31 -45 -27 L-56 -23 C-50 -17 -45 -14 -40 -12 L-49 -6 C-41 -2 -33 0 -26 0 L-32 6 C-22 9 -12 9 -5 6 Z';
  return `<g transform="translate(${x} ${y}) scale(${sc})" fill="${fill}" stroke="${edge}" stroke-width="1.8" stroke-linejoin="round">
    <path d="${wing}"/><path d="${wing}" transform="scale(-1 1)"/>
    <path d="M0 -16 C10 -14 12 0 10 14 L16 34 L6 30 L0 40 L-6 30 L-16 34 L-10 14 C-12 0 -10 -14 0 -16 Z"/>
    <path d="M-4 4 Q0 8 4 4 M-5 12 Q0 16 5 12 M-5 20 Q0 24 5 20" fill="none" stroke="${edge}" stroke-width="1.4"/>
    <circle cx="0" cy="-24" r="9"/>
    <path d="M-7 -27 Q-17 -27 -16 -18 L-11 -21.5 L-7 -21 Z"/>
    <circle cx="-3.5" cy="-26" r="1.9" fill="${edge}" stroke="none"/>
    <path d="M-4 -23 L-5 -17" stroke="${edge}" stroke-width="2" fill="none"/>
  </g>`;
}

/**
 * spec: {line:'off'|'sgt'|'plain', n, frame, wreath, arcs, srhomb, unit}
 * unit: {co:N} | {bn:N} | {cmd:true}
 * variant: 'service' | 'camo'
 */
function patch(spec, variant) {
  const svc = variant === 'service';
  const u = spec.unit || { co: 1 };
  const bnKey = u.cmd ? 'c' : (u.bn || CO_BN(u.co));
  const bcol = svc ? '#c8102e' : '#2f331c';      // one colour for all units
  const ring = svc ? 'url(#gold)' : '#c8b07a';
  const base = svc ? 'url(#navy)' : 'url(#camo)';
  const edge = svc ? bcol : '#2f331c';
  const offFill = svc ? 'url(#gold)' : '#c8b07a';
  const offEdge = svc ? '#7a5a0c' : '#2f331c';
  const sgtFill = svc ? 'url(#silver)' : '#17180f';
  const sgtEdge = svc ? '#6e7686' : '#17180f';
  const frameCol = svc ? 'url(#gold)' : '#c8b07a';
  const textCol = svc ? '#e6c25a' : '#c8b07a';
  const cx = W / 2;
  let g = '';
  g += `<path d="${pentagon(0)}" fill="${base}" stroke="${edge}" stroke-width="9" stroke-linejoin="round"/>`;
  if (!svc) g += `<path d="${pentagon(0)}" fill="#000" opacity="0.08"/>`;
  if (spec.frame) g += `<path d="${pentagon(15)}" fill="none" stroke="${frameCol}" stroke-width="8" stroke-linejoin="miter"/>`;
  // unit marker: top disc (leaders) or big number (ordinary cadet)
  const unitTxt = u.cmd ? 'СХ' : (u.bn ? ROMAN[u.bn] : String(u.co));
  // top = own unit (company: Arabic, battalion: Roman), bottom = parent level
  const bottom = u.cmd ? 'ХОРОО' : (u.bn ? 'БАТАЛЬОН' : `${ROMAN[CO_BN(u.co)]} БАТАЛЬОН`);
  if (spec.line === 'plain') {
    g += `<circle cx="${cx}" cy="185" r="66" fill="none" stroke="${ring}" stroke-width="8"/>`;
    g += `<text x="${cx}" y="215" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="${unitTxt.length > 1 ? 70 : 88}" fill="${textCol}">${unitTxt}</text>`;
    g += `<text x="${cx}" y="282" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="22" letter-spacing="4" fill="${textCol}">РОТ</text>`;
  } else {
    if (spec.falcon) {
      g += falcon(cx, 86, 0.82, svc ? 'url(#gold)' : '#c8b07a', svc ? '#7a5a0c' : '#2f331c');
    } else {
      g += `<circle cx="${cx}" cy="60" r="24" fill="${svc ? '#121a33' : '#3d4228'}" stroke="${ring}" stroke-width="4"/>`;
      g += `<text x="${cx}" y="${unitTxt.length > 2 ? 67 : 69}" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="${unitTxt.length > 2 ? 19 : 25}" fill="${textCol}">${unitTxt}</text>`;
    }
  }
  if (spec.line === 'off') {
    const big = !spec.falcon;
    const rw = big ? 34 : 30, rh = big ? 46 : 40, gap = big ? 4 : 3;
    const n = spec.n;
    const total = n * rh + (n - 1) * gap;
    const top = spec.falcon ? 126 : (spec.wreath ? 90 : 94 + (206 - total) / 2);
    for (let i = 0; i < n; i++) {
      const cy = top + rh / 2 + i * (rh + gap);
      g += rhomb(cx, cy, rw, rh, offFill, offEdge, svc);
      if (spec.wreath && i === n - 1) g += wreath(cx, cy + 2, spec.falcon ? 27 : 31, offFill);
    }
  } else if (spec.line === 'sgt') {
    const cw = 150, t = 15, step = 22, drop = 150 * 0.38;
    const top = 98;
    for (let i = 0; i < spec.n; i++) g += chevron(cx, top + i * step, cw, t, sgtFill, sgtEdge);
    let y = top + (spec.n - 1) * step + drop + t + 8;
    if (spec.srhomb) {
      g += rhomb(cx, y + 14, 22, 28, svc ? 'url(#silver)' : '#17180f', svc ? '#7a5a0c' : '#17180f', svc);
      y += 32;
    }
    for (let i = 0; i < (spec.arcs || 0); i++) g += arc(cx, y + i * 20, cw, 13, sgtFill, sgtEdge);
  }
  const fs = bottom.length > 11 ? 16 : 19;
  g += `<text x="${cx}" y="${H - 26}" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="${fs}" letter-spacing="1.5" fill="${svc ? '#e9edf3' : (spec.line === 'sgt' ? '#17180f' : '#c8b07a')}">${bottom}</text>`;
  return `<g filter="url(#sh)">${g}</g>`;
}

const OFF = [
  { t: 'Салааны дарга', s: '1-р рот', spec: { line: 'off', n: 1, frame: true, unit: { co: 1 } } },
  { t: 'Ротын орлогч', s: '5-р рот', spec: { line: 'off', n: 2, unit: { co: 5 } } },
  { t: 'Ротын дарга', s: '9-р рот', spec: { line: 'off', n: 2, frame: true, unit: { co: 9 } } },
  { t: 'Батальоны орлогч,', s: 'штаб (2-р батальон)', spec: { line: 'off', n: 3, unit: { bn: 2 } } },
  { t: 'Батальоны дарга', s: '1-р батальон', spec: { line: 'off', n: 3, frame: true, unit: { bn: 1 } } },
  { t: 'Хорооны хэлтсийн,', s: 'зөвлөлийн дарга', spec: { line: 'off', n: 4, unit: { cmd: true } } },
  { t: 'Хорооны орлогч,', s: 'штабын дарга', spec: { line: 'off', n: 4, frame: true, unit: { cmd: true } } },
  { t: 'Хорооны ахлах', s: 'сонсогч', spec: { line: 'off', n: 4, frame: true, wreath: true, falcon: true, unit: { cmd: true } } },
];
const SGT = [
  { t: 'Багийн ахлагч', s: '1-р рот · 2-р курс', spec: { line: 'sgt', n: 1, unit: { co: 1 } } },
  { t: 'Тасгийн дарга', s: '5-р рот · 3-р курс', spec: { line: 'sgt', n: 2, unit: { co: 5 } } },
  { t: 'Салааны ахлагч', s: '9-р рот · 3-р курс', spec: { line: 'sgt', n: 3, unit: { co: 9 } } },
  { t: 'Хорооны штабын', s: 'туслах', spec: { line: 'sgt', n: 2, arcs: 1, unit: { cmd: true } } },
  { t: 'Ротын ахлах түрүүч', s: '5-р рот', spec: { line: 'sgt', n: 3, arcs: 1, unit: { co: 5 } } },
  { t: 'Батальоны ахлах', s: 'түрүүч (3-р батальон)', spec: { line: 'sgt', n: 3, arcs: 2, unit: { bn: 3 } } },
  { t: 'Хорооны ахлах', s: 'түрүүч', spec: { line: 'sgt', n: 3, arcs: 2, srhomb: true, unit: { cmd: true } } },
];
const PLAIN = [
  { t: '1-р рот', s: 'I батальон', spec: { line: 'plain', unit: { co: 1 } } },
  { t: '5-р рот', s: 'II батальон', spec: { line: 'plain', unit: { co: 5 } } },
  { t: '9-р рот', s: 'III батальон', spec: { line: 'plain', unit: { co: 9 } } },
];

function label(x, y, t, s, size = 30) {
  return `<text x="${x}" y="${y}" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="${size}" fill="${INK}">${t}</text>
  <text x="${x}" y="${y + size * 1.35}" text-anchor="middle" font-family="${FONT}" font-size="${size}" fill="${INK}">${s}</text>`;
}

function title(x, y, txt, size = 36) {
  return `<text x="${x}" y="${y}" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="${size}" fill="${INK}">${txt}</text>`;
}

function gridFigure(items, variant, ttl, sub) {
  const cols = 4, cellW = 400, cellH = 590, w = cols * cellW + 50;
  const rows = Math.ceil(items.length / cols);
  const h = 130 + rows * cellH;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs()}<rect width="${w}" height="${h}" fill="#fff"/>`;
  s += title(w / 2, 55, ttl);
  if (sub) s += `<text x="${w / 2}" y="98" text-anchor="middle" font-family="${FONT}" font-size="25" fill="#55607a">${sub}</text>`;
  items.forEach((it, i) => {
    const r = Math.floor(i / cols), c = i % cols;
    const inRow = Math.min(cols, items.length - r * cols);
    const x0 = 25 + (w - 50 - inRow * cellW) / 2 + c * cellW;
    const y0 = 135 + r * cellH;
    const sc = 1.15;
    s += `<g transform="translate(${x0 + cellW / 2 - W * sc / 2} ${y0}) scale(${sc})">${patch(it.spec, variant)}</g>`;
    s += label(x0 + cellW / 2, y0 + H * sc + 62, it.t, it.s);
  });
  return s + '</svg>';
}

function camoFigure() {
  const all = [...OFF, ...SGT, { t: 'Ротын тэмдэг', s: '(албан тушаалгүй)', spec: PLAIN[0].spec }];
  const cols = 8, cellW = 300, cellH = 460, w = cols * cellW + 40;
  const h = 150 + 2 * cellH + 30;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs()}<rect width="${w}" height="${h}" fill="#fff"/>`;
  s += title(w / 2, 55, 'Эрээн (өнгөлөн далдлах) хувцасны хувилбар — бүдэг өнгө, наалттай');
  s += `<text x="${w / 2}" y="100" text-anchor="middle" font-family="${FONT}" font-size="26" fill="#55607a">Алтлаг → хүрэн шар · Мөнгөлөг → хар · Хөвөө → хар хүрэн · Хэмжээ, тоо, байршил албаны хувилбартай ижил</text>`;
  all.forEach((it, i) => {
    const r = i < 8 ? 0 : 1, c = i < 8 ? i : i - 8;
    const inRow = 8;
    const x0 = 20 + (w - 40 - inRow * cellW) / 2 + c * cellW;
    const y0 = 150 + r * cellH;
    const sc = 0.88;
    s += `<g transform="translate(${x0 + cellW / 2 - W * sc / 2} ${y0}) scale(${sc})">${patch(it.spec, 'camo')}</g>`;
    s += label(x0 + cellW / 2, y0 + H * sc + 45, it.t, it.s, 24);
  });
  return s + '</svg>';
}

// ---------- small badges reused on sleeves ----------
function committeeShield(svc, sc = 1) {
  // 100 x 120 local
  const bg = svc ? 'url(#navy)' : 'url(#olive)';
  const rim = svc ? 'url(#gold)' : '#c8b07a';
  const band = svc ? '#c8102e' : '#3b3f26';
  const txt = svc ? '#fff' : '#c8b07a';
  return `<g transform="scale(${sc})" filter="url(#shs)">
    <path d="M0 0 H100 V70 Q100 105 50 120 Q0 105 0 70 Z" fill="${rim}"/>
    <path d="M5 5 H95 V69 Q95 100 50 114 Q5 100 5 69 Z" fill="${bg}"/>
    <rect x="5" y="5" width="90" height="22" fill="${band}"/>
    <text x="50" y="22" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="15" fill="${txt}">ҮБХИС</text>
    <path d="M32 40 L66 82 M68 40 L34 82" stroke="${svc ? '#d6dbe4' : '#17180f'}" stroke-width="5"/>
    <path d="M28 76 Q39 70 50 76 Q61 70 72 76 V90 Q61 84 50 90 Q39 84 28 90Z" fill="${svc ? '#f3ecd9' : '#c8b07a'}" stroke="${svc ? '#d4a52c' : '#17180f'}" stroke-width="1.5"/>
  </g>`;
}
function courseBadge(svc, n, sc = 1) {
  // 90 x 100 local
  const bg = svc ? 'url(#navy)' : 'url(#olive)';
  const rim = svc ? 'url(#gold)' : '#c8b07a';
  const ch = svc ? 'url(#gold)' : '#c8b07a';
  let s = `<g transform="scale(${sc})" filter="url(#shs)"><path d="M0 0 H90 V78 Q45 104 0 78 Z" fill="${rim}"/><path d="M4 4 H86 V75 Q45 98 4 75 Z" fill="${bg}"/>`;
  for (let i = 0; i < n; i++) s += chevron(45, 16 + i * 14, 56, 7, ch, svc ? '#7a5a0c' : '#2f331c');
  return s + '</g>';
}
function companyBadge(svc, sc = 1) {
  // circle r=50, centered at 50,50
  const ring = svc ? '#c8102e' : '#3b3f26';
  const rim = svc ? 'url(#gold)' : '#c8b07a';
  const c = svc ? 'url(#navy)' : 'url(#olive)';
  const num = svc ? '#e6c25a' : '#c8b07a';
  return `<g transform="scale(${sc})" filter="url(#shs)">
    <circle cx="50" cy="50" r="50" fill="${rim}"/><circle cx="50" cy="50" r="46" fill="${ring}"/>
    <circle cx="50" cy="50" r="31" fill="${rim}"/><circle cx="50" cy="50" r="28" fill="${c}"/>
    <text x="50" y="60" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="30" fill="${num}">1</text>
  </g>`;
}
function bestCompany(svc, sc = 1) {
  // oval 60 x 74
  const rim = svc ? 'url(#gold)' : '#c8b07a';
  const c = svc ? 'url(#navy)' : 'url(#olive)';
  return `<g transform="scale(${sc})" filter="url(#shs)">
    <ellipse cx="30" cy="37" rx="30" ry="37" fill="${rim}"/><ellipse cx="30" cy="37" rx="26" ry="33" fill="${c}"/>
    <path d="M22 16 V52" stroke="${rim}" stroke-width="3"/><path d="M23 17 L44 25 L23 33Z" fill="${svc ? '#c8102e' : '#17180f'}"/>
  </g>`;
}

// ---------- sleeve placement scheme ----------
function sleeveShape(x, y, w, h, fill, mirror) {
  // a slightly tapered sleeve, top rounded = shoulder seam
  const t = 0.12 * w;
  return `<path d="M${x} ${y + 30} Q${x + w / 2} ${y - 22} ${x + w} ${y + 30} L${x + w - t} ${y + h} L${x + t} ${y + h} Z" fill="${fill}" stroke="#1e2a1c" stroke-width="4"/>`;
}

function dimV(x, y1, y2, txt, side = 1) {
  const tx = x + side * 14;
  return `<g stroke="#c8102e" stroke-width="2.5" fill="#c8102e">
    <line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}"/>
    <line x1="${x - 8}" y1="${y1}" x2="${x + 8}" y2="${y1}"/><line x1="${x - 8}" y1="${y2}" x2="${x + 8}" y2="${y2}"/>
  </g><text x="${tx}" y="${(y1 + y2) / 2 + 9}" text-anchor="${side > 0 ? 'start' : 'end'}" font-family="${FONT}" font-weight="700" font-size="24" fill="#c8102e">${txt}</text>`;
}

function callout(n, x, y, tx, ty, txt, anchor = 'start') {
  return `<line x1="${x}" y1="${y}" x2="${tx}" y2="${ty}" stroke="#c8102e" stroke-width="2.5"/>
  <circle cx="${tx}" cy="${ty}" r="20" fill="#c8102e"/><text x="${tx}" y="${ty + 8}" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="22" fill="#fff">${n}</text>
  <text x="${anchor === 'start' ? tx + 30 : tx - 30}" y="${ty + 8}" text-anchor="${anchor}" font-family="${FONT}" font-size="24" fill="${INK}">${txt}</text>`;
}

// existing official patches (schematic only)
function flagPatch(svc, sc = 1) {
  // 70 x 46
  const o = svc ? 1 : 0.55;
  return `<g transform="scale(${sc})" filter="url(#shs)" opacity="${svc ? 1 : 0.9}">
    <rect width="70" height="46" rx="3" fill="${svc ? '#c8102e' : '#5a3b2c'}" stroke="${svc ? '#e6c25a' : '#2f331c'}" stroke-width="2"/>
    <rect x="23.3" y="0" width="23.4" height="46" fill="${svc ? '#0066b3' : '#3b4430'}"/>
    <rect x="7" y="9" width="9" height="28" rx="2" fill="${svc ? '#f5c518' : '#c8b07a'}" opacity="${o + 0.2}"/>
  </g>`;
}
function officialEmblem(svc, sc = 1) {
  // 90 x 110 shield
  const rim = svc ? '#c8102e' : '#2f331c';
  const ring = svc ? '#0d5aa7' : '#3d4228';
  const c = svc ? 'url(#gold)' : '#c8b07a';
  return `<g transform="scale(${sc})" filter="url(#shs)">
    <path d="M0 0 H90 V62 Q90 96 45 110 Q0 96 0 62 Z" fill="${rim}"/>
    <path d="M6 6 H84 V61 Q84 90 45 103 Q6 90 6 61 Z" fill="${ring}"/>
    <circle cx="45" cy="52" r="25" fill="${c}"/><circle cx="45" cy="52" r="15" fill="none" stroke="${svc ? '#7a5a0c' : '#2f331c'}" stroke-width="3"/>
  </g>`;
}
function existingCourse(svc, n, sc = 1) {
  // 80 x 96 red shield with gold bars
  const bg = svc ? '#d2232a' : '#3d4228';
  const bar = svc ? 'url(#gold)' : '#c8b07a';
  let s = `<g transform="scale(${sc})" filter="url(#shs)"><path d="M0 0 H80 V58 Q80 86 40 96 Q0 86 0 58 Z" fill="${bg}" stroke="${svc ? '#e6c25a' : '#2f331c'}" stroke-width="3"/>`;
  for (let i = 0; i < n; i++) s += `<rect x="14" y="${22 + i * 13}" width="52" height="7" rx="2" fill="${bar}"/>`;
  return s + '</g>';
}

function tag(x, y, txt, col = '#55607a') {
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="21" fill="${col}">${txt}</text>`;
}
function elbow(x, y, sw, light) {
  return `<line x1="${x + 10}" y1="${y}" x2="${x + sw - 10}" y2="${y}" stroke="${light ? '#c9d2dc' : '#1e2a1c'}" stroke-dasharray="10 8" stroke-width="2" opacity="0.7"/>
  <text x="${x + sw / 2}" y="${y + 30}" text-anchor="middle" font-family="${FONT}" font-size="22" fill="${light ? '#e6ebf1' : '#1e2a1c'}">тохой</text>`;
}
function cuffPiping(x, y, sw) {
  const t = 0.12 * sw;
  return `<line x1="${x + t + 2}" y1="${y}" x2="${x + sw - t - 2}" y2="${y}" stroke="#c8102e" stroke-width="10"/>`;
}

function placementFigure() {
  const w = 2600, h = 1560;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs()}<rect width="${w}" height="${h}" fill="#fff"/>`;
  s += title(w / 2, 58, 'Ханцуйн тэмдгүүдийн байршил (хажуугаас харсан байдал)', 40);
  s += `<text x="${w / 2}" y="100" text-anchor="middle" font-family="${FONT}" font-size="24" fill="#55607a">Саарал бичигтэй нь одоо мөрдөж буй албан ёсны тэмдэг (өөрчлөхгүй) · Улаан дугаартай нь шинээр санал болгож буй тэмдэг</text>`;
  const sw = 330, shh = 1000, top = 230;
  const seamY = top + 4;
  const psc = 0.62;

  // ---- A: service, left sleeve ----
  const ax = 120, cxA = ax + sw / 2;
  s += `<text x="${cxA}" y="${top - 55}" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="30" fill="${INK}">А. Албаны хувцас — зүүн ханцуй</text>`;
  s += sleeveShape(ax, top, sw, shh, 'url(#jacket)') + cuffPiping(ax, top + shh - 40, sw);
  const fY = seamY + 40;
  s += `<g transform="translate(${cxA - 49} ${fY})">${flagPatch(true, 1.4)}</g>`;
  const cY = fY + 64 + 28;
  s += `<g transform="translate(${cxA - 48} ${cY})">${existingCourse(true, 3, 1.2)}</g>`;
  s += elbow(ax, top + 640, sw, true);
  s += dimV(ax - 18, seamY + 10, fY, '2 см', -1);
  s += `<line x1="${cxA + 50}" y1="${fY + 30}" x2="${ax + sw + 50}" y2="${fY + 30}" stroke="#8a93a6" stroke-width="2"/>` + tag(ax + sw + 60, fY + 37, 'Төрийн далбаа (одоогийн)');
  s += `<line x1="${cxA + 45}" y1="${cY + 55}" x2="${ax + sw + 50}" y2="${cY + 55}" stroke="#8a93a6" stroke-width="2"/>` + tag(ax + sw + 60, cY + 62, 'Курсийн тэмдэг (одоогийн)');
  s += tag(ax + sw + 60, cY + 200, 'Нэрэмжит ротын тэмдэг тусдаа', INK) + tag(ax + sw + 60, cY + 232, 'зүүгдэхгүй — баруун ханцуйн', INK) + tag(ax + sw + 60, cY + 264, 'тэмдэгт нэгтгэгдсэн', INK);

  // ---- B: service, right sleeve ----
  const bx = 980, cxB = bx + sw / 2;
  s += `<text x="${cxB}" y="${top - 55}" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="30" fill="${INK}">Б. Албаны хувцас — баруун ханцуй</text>`;
  s += sleeveShape(bx, top, sw, shh, 'url(#jacket)') + cuffPiping(bx, top + shh - 40, sw);
  const eY = seamY + 40;
  s += `<g transform="translate(${cxB - 54} ${eY})">${officialEmblem(true, 1.2)}</g>`;
  const posY = eY + 132 + 30;
  s += `<g transform="translate(${cxB - W * psc / 2} ${posY}) scale(${psc})">${patch({ line: 'off', n: 2, frame: true, unit: { co: 1 } }, 'service')}</g>`;
  const bestY = posY + H * psc + 22;
  s += elbow(bx, top + 640, sw, true);
  s += dimV(bx - 18, seamY + 10, eY, '2 см', -1);
  s += dimV(bx - 18, eY + 132, posY, '1.5 см', -1);
  s += dimV(bx - 18, posY, posY + H * psc, '9 см', -1);
  s += `<line x1="${cxB + 50}" y1="${eY + 60}" x2="${bx + sw + 50}" y2="${eY + 60}" stroke="#8a93a6" stroke-width="2"/>` + tag(bx + sw + 60, eY + 67, 'Ханцуйн албан ёсны тэмдэг (одоогийн)');
  s += callout(1, cxB + 70, posY + 120, bx + sw + 80, posY + 120, 'Ротын ба албан тушаалын тэмдэг');
  s += tag(bx + sw + 60, posY + 160, '6 × 9 см · хар хөх суурь, улаан хөвөө');
  s += tag(bx + sw + 60, posY + 192, 'рот — араб тоо, батальон — ром тоо');
  s += tag(bx + sw + 60, posY + 224, 'хатгамал · 3 нууц дарааст товчоор');
  s += tag(bx + sw + 60, posY + 280, 'Албан тушаалгүй сонсогч ижил байранд', INK);
  s += tag(bx + sw + 60, posY + 312, 'ротын тэмдэг (ромб, шевронгүй) зүүнэ', INK);

  // ---- C: camo, right sleeve ----
  const cx0 = 1840, cxC = cx0 + sw / 2;
  s += `<text x="${cxC}" y="${top - 55}" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="30" fill="${INK}">В. Эрээн хувцас — баруун ханцуй</text>`;
  s += sleeveShape(cx0, top, sw, shh, 'url(#camo)');
  const vpY = seamY + 26, vpH = 132 + 30 + H * psc + 30;
  s += `<rect x="${cxC - 82}" y="${vpY}" width="164" height="${vpH}" rx="8" fill="url(#velcro)" stroke="#2f331c" stroke-width="2.5" stroke-dasharray="7 5"/>`;
  s += `<g transform="translate(${cxC - 54} ${eY})">${officialEmblem(false, 1.2)}</g>`;
  s += `<g transform="translate(${cxC - W * psc / 2} ${posY}) scale(${psc})">${patch({ line: 'off', n: 2, frame: true, unit: { co: 1 } }, 'camo')}</g>`;
  s += elbow(cx0, top + 640, sw, false);
  s += callout(2, cxC + 82, vpY + 25, cx0 + sw + 60, vpY + 10, 'Наалтын зурвас 9 × 21 см');
  s += `<line x1="${cxC + 50}" y1="${eY + 60}" x2="${cx0 + sw + 40}" y2="${eY + 80}" stroke="#8a93a6" stroke-width="2"/>` + tag(cx0 + sw + 50, eY + 87, 'Албан ёсны тэмдэг (одоогийн)');
  s += callout(1, cxC + 70, posY + 120, cx0 + sw + 60, posY + 150, 'Ротын ба албан тушаалын');
  s += tag(cx0 + sw + 40, posY + 190, 'тэмдэг · бүдэг өнгө · дэгээт наалт');
  s += tag(cx0 + sw + 40, posY + 222, 'Ханцуй шамлахад ч харагдана');
  s += tag(cx0 + sw + 40, posY + 290, 'Зүүн ханцуй нь албаны хувцастай', INK);
  s += tag(cx0 + sw + 40, posY + 322, 'ижил байршилтай (бүдэг өнгөөр)', INK);

  // back-side details
  const by = 1350;
  s += `<rect x="40" y="${by - 50}" width="${w - 80}" height="230" rx="14" fill="#f4f6fa" stroke="#d5dae4"/>`;
  s += `<text x="80" y="${by - 8}" font-family="${FONT}" font-weight="700" font-size="28" fill="${INK}">Бэхэлгээ (ар тал)</text>`;
  const bsc = 0.42;
  s += `<g transform="translate(110 ${by + 15}) scale(${bsc})"><path d="${pentagon(0)}" fill="#1a2542" stroke="#c8102e" stroke-width="7"/>
    <circle cx="120" cy="105" r="16" fill="#c9cfd9" stroke="#6e7686" stroke-width="3"/><circle cx="55" cy="300" r="16" fill="#c9cfd9" stroke="#6e7686" stroke-width="3"/><circle cx="185" cy="300" r="16" fill="#c9cfd9" stroke="#6e7686" stroke-width="3"/></g>`;
  s += `<text x="250" y="${by + 60}" font-family="${FONT}" font-weight="700" font-size="25" fill="${INK}">Албаны хувилбар</text>
        <text x="250" y="${by + 98}" font-family="${FONT}" font-size="23" fill="${INK}">3 ширхэг нууц дарааст товч (Ø 10 мм). Ханцуйнд товчны эх хэсгийг</text>
        <text x="250" y="${by + 130}" font-family="${FONT}" font-size="23" fill="${INK}">хар хөх утсаар оёж бэхэлнэ — тэмдэггүй үед бараг үл харагдана.</text>`;
  s += `<g transform="translate(1300 ${by + 15}) scale(${bsc})"><path d="${pentagon(0)}" fill="#3d4228" stroke="#2f331c" stroke-width="7"/>
    <path d="${pentagon(16)}" fill="url(#velcro)"/></g>`;
  s += `<text x="1440" y="${by + 60}" font-family="${FONT}" font-weight="700" font-size="25" fill="${INK}">Эрээн хувилбар</text>
        <text x="1440" y="${by + 98}" font-family="${FONT}" font-size="23" fill="${INK}">Ар тал бүхэлдээ дэгээт наалт (hook). Ханцуйн зөөлөн наалтын</text>
        <text x="1440" y="${by + 130}" font-family="${FONT}" font-size="23" fill="${INK}">зурвас дээр наана; семестр бүр хүлээлцэхэд хялбар.</text>`;
  return s + '</svg>';
}

// ---------- front view (replaces old Figure 9) ----------
function frontFigure() {
  const w = 2650, h = 1300, k = 1.325;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs()}<rect width="${w}" height="${h}" fill="#fff"/><g transform="scale(${k})">`;
  s += title(1000, 48, 'Албаны хүрэм (урдаас харсан байдал)', 27);
  s += `<path d="M812 113 L707 131 L603 188 L500 623 L585 651 L660 358 L660 886 L1113 886 L1113 358 L1188 651 L1274 623 L1170 188 L1065 131 L962 113 L887 225 Z" fill="url(#jacket)" stroke="#111a24" stroke-width="3" stroke-linejoin="round"/>
    <path d="M812 113 L887 225 L962 113" fill="none" stroke="#111a24" stroke-width="3"/>
    <path d="M840 113 L887 190 L934 113 Z" fill="#c9d6e6"/><path d="M880 140 L894 140 L900 225 L887 240 L874 225 Z" fill="#1d2733"/>
    <line x1="887" y1="225" x2="887" y2="886" stroke="#111a24" stroke-width="2.5"/>
    <line x1="505" y1="603" x2="590" y2="631" stroke="#c8102e" stroke-width="6"/><line x1="1183" y1="631" x2="1268" y2="603" stroke="#c8102e" stroke-width="6"/>
    ${[311, 452, 594, 735].map(y => `<circle cx="887" cy="${y}" r="9" fill="url(#gold)"/>`).join('')}
    <rect x="698" y="330" width="132" height="104" rx="7" fill="none" stroke="#111a24" stroke-width="2.5"/>
    <rect x="943" y="330" width="132" height="104" rx="7" fill="none" stroke="#111a24" stroke-width="2.5"/>
    <path d="M622 172 L778 135 L786 178 L630 214 Z" fill="#1c2836" stroke="#c8102e" stroke-width="3"/><circle cx="764" cy="150" r="7" fill="url(#gold)"/>
    <path d="M1152 172 L996 135 L988 178 L1144 214 Z" fill="#1c2836" stroke="#c8102e" stroke-width="3"/><circle cx="1010" cy="150" r="7" fill="url(#gold)"/>
    <rect x="707" y="254" width="95" height="15" fill="#c9a43a"/>
    <ellipse cx="732" cy="298" rx="16" ry="20" fill="url(#gold)"/><ellipse cx="777" cy="298" rx="16" ry="20" fill="url(#silver)"/>
    <rect x="962" y="266" width="106" height="24" fill="#c0262c" stroke="#7d0a1d" stroke-width="1.5"/>
    <rect x="968" y="300" width="96" height="20" rx="3" fill="#1f5fb8"/>`;
  // right sleeve (viewer left): official emblem + position insignia
  s += `<g transform="translate(613 236) rotate(13) translate(-22 0) scale(0.5)">${officialEmblem(true, 1)}</g>`;
  s += `<g transform="translate(596 312) rotate(13) translate(-25 0) scale(0.21)">${patch({ line: 'off', n: 2, frame: true, unit: { co: 1 } }, 'service')}</g>`;
  // left sleeve (viewer right): flag + course + company
  s += `<g transform="translate(1160 228) rotate(-13) scale(0.62)">${flagPatch(true, 1)}</g>`;
  s += `<g transform="translate(1176 270) rotate(-13) scale(0.5)">${existingCourse(true, 3, 1)}</g>`;
  const L = (n, x, y, tx, ty, t) => calloutS(n, x, y, tx, ty, t, 'end');
  const R = (n, x, y, tx, ty, t) => calloutS(n, x, y, tx, ty, t, 'start');
  const G = (x, y, tx, ty, t, anchor) => `<line x1="${x}" y1="${y}" x2="${tx}" y2="${ty}" stroke="#8a93a6" stroke-width="1.6"/><text x="${anchor === 'end' ? tx - 8 : tx + 8}" y="${ty + 7}" text-anchor="${anchor}" font-family="${FONT}" font-size="19" fill="#55607a">${t}</text>`;
  s += G(605, 262, 470, 200, 'Ханцуйн албан ёсны тэмдэг (одоогийн)', 'end');
  s += L(1, 586, 350, 470, 320, 'Ротын ба албан тушаалын тэмдэг (баруун ханцуй)');
  s += L(2, 720, 305, 470, 450, 'Шагналын тэмдэг (баруун энгэр)');
  s += G(1070, 165, 1320, 130, 'Сонсогчийн мөрдөс (одоогийн, өөрчлөхгүй)', 'start');
  s += G(1015, 277, 1320, 210, 'Төрийн шагнал (зүүн энгэр)', 'start');
  s += G(1182, 245, 1320, 290, 'Төрийн далбаа (одоогийн)', 'start');
  s += G(1200, 295, 1320, 370, 'Курсийн тэмдэг (одоогийн)', 'start');
  s += G(1020, 310, 1320, 450, 'Нэрийн тууз (одоогийн)', 'start');
  s += `<text x="1000" y="935" text-anchor="middle" font-family="${FONT}" font-size="19" fill="#55607a">Тайлбар: «баруун», «зүүн» гэдэг нь хувцас өмссөн сонсогчийн талыг заана. Саарал — одоогийн албан ёсны тэмдэг, улаан дугаартай — шинэ санал.</text>`;
  return s + '</g></svg>';
}
function calloutS(n, x, y, tx, ty, txt, anchor) {
  return `<line x1="${x}" y1="${y}" x2="${tx}" y2="${ty}" stroke="#c8102e" stroke-width="1.8"/>
  <circle cx="${tx}" cy="${ty}" r="16" fill="#c8102e"/><text x="${tx}" y="${ty + 6}" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="17" fill="#fff">${n}</text>
  <text x="${anchor === 'start' ? tx + 26 : tx - 26}" y="${ty + 7}" text-anchor="${anchor}" font-family="${FONT}" font-size="20" fill="${INK}">${txt}</text>`;
}

function companyFigure() {
  const w = 1950, h = 900;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs()}<rect width="${w}" height="${h}" fill="#fff"/>`;
  s += title(w / 2, 55, 'Ротын ялгах тэмдгийг ханцуйн тэмдэгт нэгтгэсэн нь');
  s += `<text x="${w / 2}" y="98" text-anchor="middle" font-family="${FONT}" font-size="24" fill="#55607a">Нэг өнгийн улаан хөвөө · Рот — араб тоо · Батальон — ром тоо · Албан тушаалд томилогдвол ромб/шеврон бүхий тэмдгээр солино</text>`;
  // committee symbol
  s += `<g transform="translate(110 170) scale(2.6)">${committeeShield(true, 1)}</g>`;
  s += label(240, 535 + 40, 'Сонсогчийн хорооны', 'бэлгэдэл (ханцуйнд зүүхгүй)', 28);
  const sc = 1.05;
  PLAIN.forEach((it, i) => {
    const cx = 700 + i * 420;
    s += `<g transform="translate(${cx - W * sc / 2} 150) scale(${sc})">${patch(it.spec, 'service')}</g>`;
    s += label(cx, 150 + H * sc + 60, it.t, it.s, 28);
  });
  // legend for leader disc
  s += `<rect x="60" y="720" width="${w - 120}" height="150" rx="14" fill="#f4f6fa" stroke="#d5dae4"/>`;
  s += `<text x="100" y="770" font-family="${FONT}" font-weight="700" font-size="26" fill="${INK}">Албан тушаалын тэмдэг дээрх дээд дугуй:</text>`;
  s += `<text x="100" y="815" font-family="${FONT}" font-size="25" fill="${INK}">Ротын түвшин — араб тоо (1–12) · Батальоны түвшин — ром тоо (I, II, III) · Хорооны түвшин — «СХ» · Хорооны ахлах сонсогч — шонхор шувуу</text>`;
  s += `<text x="100" y="852" font-family="${FONT}" font-size="25" fill="${INK}">Доод бичиг нь харьяа дээд нэгжийг заана: ротын түвшинд «II БАТАЛЬОН», батальоны түвшинд «БАТАЛЬОН», хорооны түвшинд «ХОРОО»</text>`;
  return s + '</svg>';
}

(async () => {
  const figs = {
    'image1.png': gridFigure(OFF, 'service', 'Сонсогч офицерын шугам (4-р курс) — алтлаг ромб · албаны хувцас', 'Баруун ханцуй · 6 × 9 см · улаан хөвөө · дээд дугуй: рот — араб тоо, батальон — ром тоо · доод бичиг: харьяа батальон / хороо'),
    'image2.png': gridFigure(SGT, 'service', 'Сонсогч түрүүчийн шугам (2–3-р курс) — мөнгөлөг шеврон · албаны хувцас', 'Баруун ханцуй · 6 × 9 см · улаан хөвөө · дээд дугуй: рот — араб тоо, батальон — ром тоо · доод бичиг: харьяа батальон / хороо'),
    'sleeve_camo.png': camoFigure(),
    'sleeve_place.png': placementFigure(),
    'image9.png': frontFigure(),
    'image4.png': companyFigure(),
  };
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const [name, svg] of Object.entries(figs)) {
    fs.writeFileSync(path.join(OUT, name.replace('.png', '.svg')), svg);
    const m = svg.match(/width="(\d+)" height="(\d+)"/);
    const w = +m[1], h = +m[2];
    await page.setViewportSize({ width: w, height: h });
    await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
    await page.locator('svg').first().screenshot({ path: path.join(OUT, name) });
    console.log(name, w, h);
  }
  await browser.close();
})();
