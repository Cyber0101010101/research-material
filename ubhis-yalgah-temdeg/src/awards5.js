// Gold award badges reproducing the «Шилдэг төгсөгч» medal body in detail (measured on the photo,
// 790 px wide): top cloud-scroll ornament, flame-leaf laurel wreath up to the ornament, straight swords
// crossing behind the disc (tips at the upper corners, D-guard sabre hilts at the lower sides), studded
// disc with double rings and «1921», laurel sprigs and an open book with the «ҮБХИС» plaque, red enamel
// ribbon arc with the badge name. No falcon hanger (kept for the best-graduate medal only).
// Usage: node awards5.js <outdir> [portrait.png]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { defs } = require('./gold_defs.js');
const OUT = process.argv[2];
const PORTRAIT = process.argv[3] && fs.existsSync(process.argv[3]) ? process.argv[3] : null;
const SERIF = "'Liberation Serif', 'Times New Roman', serif";
const CX = 395, CY = 380, R = 240, F = 168;
const G = (inner, fill = 'url(#gold)') => `<g filter="url(#metal)" fill="${fill}" stroke="#6a4610" stroke-width="1">${inner}</g>`;
const pol = (cx, cy, r, a) => [cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180)];
const mx = (x) => 2 * CX - x;

function leaf(x, y, rot, L, Wd) {
  // broad leaf whose base is sunk into the stem (solid joint for casting)
  return `<g transform="translate(${x} ${y}) rotate(${rot})">
    <path d="M-10 -7 C${L * 0.22} ${-Wd * 1.1} ${L * 0.72} ${-Wd * 0.9} ${L} 0 C${L * 0.72} ${Wd * 0.9} ${L * 0.22} ${Wd * 1.1} -10 7 Z"/>
    <path d="M6 0 Q${L * 0.5} -3 ${L - 12} 0" stroke="#7a5212" stroke-width="2.6" fill="none"/></g>`;
}
function smooth(pts, n = 3) {
  // densify the stem (more leaves, overlapping)
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) for (let k = 1; k <= n; k++) {
    const t = k / n; out.push([pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t]);
  }
  return out;
}
function branch(pts0, size, mirror, stemW) {
  const pts = smooth(pts0, 2);
  const P = mirror ? pts.map(([x, y]) => [mx(x), y]) : pts;
  let leaves = '';
  for (let i = 1; i < P.length; i++) {
    const [x0, y0] = P[i - 1], [x1, y1] = P[i];
    const t = Math.atan2(y1 - y0, x1 - x0) * 180 / Math.PI;
    const k = 1 - 0.32 * (i / P.length);
    const L = size * k, Wd = size * 0.46 * k;
    leaves += leaf(x1, y1, t - 30, L, Wd) + leaf(x1, y1, t + 30, L * 0.96, Wd * 0.96);
  }
  const [xa, ya] = P[P.length - 2], [xb, yb] = P[P.length - 1];
  leaves += leaf(xb, yb, Math.atan2(yb - ya, xb - xa) * 180 / Math.PI, size * 0.75, size * 0.32);
  const stem = `<path d="M${P.map(p => p.join(' ')).join(' L')}" fill="none" stroke="url(#gold)" stroke-width="${stemW}" stroke-linecap="round" stroke-linejoin="round"/>`;
  let berries = '';
  P.forEach(([x, y], i) => { if (i % 4 === 2) berries += `<circle cx="${x}" cy="${y}" r="${stemW * 0.62}"/>`; });
  return stem + leaves + berries;
}

// narrow flame-shaped wreath leaves (solid joints: bases sunk into a thick stem)
function wreath() {
  // override leaf width for this wreath: narrower than the sprigs
  return G(branchNarrow(wreathPts(), 76, false) + branchNarrow(wreathPts(), 76, true));
}
function wreathPts() {
  const pts = [];
  for (let i = 0; i <= 12; i++) {
    const a = 124 + i * (116 / 12);
    const r = 270 + 16 * Math.sin(i / 12 * Math.PI);
    pts.push(pol(CX, CY, r, a));
  }
  return pts;
}
function branchNarrow(pts0, size, mirror) {
  const pts = smooth(pts0, 2);
  const P = mirror ? pts.map(([x, y]) => [mx(x), y]) : pts;
  let leaves = '';
  for (let i = 1; i < P.length; i++) {
    const [x0, y0] = P[i - 1], [x1, y1] = P[i];
    const t = Math.atan2(y1 - y0, x1 - x0) * 180 / Math.PI;
    const k = 1 - 0.25 * (i / P.length);
    const L = size * k, Wd = size * 0.3 * k;
    // outer leaf flares outward more (flame look), inner leaf hugs the disc
    const out = mirror ? 1 : -1;
    leaves += leaf(x1, y1, t + out * 34, L, Wd) + leaf(x1, y1, t - out * 20, L * 0.8, Wd * 0.9);
  }
  const [xa, ya] = P[P.length - 2], [xb, yb] = P[P.length - 1];
  leaves += leaf(xb, yb, Math.atan2(yb - ya, xb - xa) * 180 / Math.PI, size * 0.8, size * 0.26);
  const stem = `<path d="M${P.map(p => p.join(' ')).join(' L')}" fill="none" stroke="url(#gold)" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>`;
  return stem + leaves;
}
const LOW = [[312, 664], [272, 652], [232, 636], [192, 616], [156, 594]];
function sprigs() { return G(branch(LOW, 60, false, 15) + branch(LOW, 60, true, 15)); }

// ---------- top ornament: symmetric cloud scrolls (ugalz) with a central bud ----------
function topOrnament() {
  const curl = (s) => {
    const x = (v) => CX + s * v;
    return `<path d="M${x(8)} 128 C${x(30)} 128 ${x(40)} 108 ${x(36)} 92 C${x(32)} 74 ${x(54)} 60 ${x(72)} 66
        C${x(92)} 72 ${x(96)} 98 ${x(80)} 108 C${x(70)} 114 ${x(60)} 104 ${x(66)} 96 C${x(70)} 90 ${x(80)} 94 ${x(78)} 100"
        fill="none" stroke="url(#gold)" stroke-width="15" stroke-linecap="round"/>
      <path d="M${x(72)} 66 C${x(104)} 52 ${x(140)} 64 ${x(150)} 92 C${x(156)} 110 ${x(146)} 126 ${x(128)} 126
        C${x(114)} 126 ${x(108)} 112 ${x(116)} 104 C${x(122)} 98 ${x(132)} 102 ${x(130)} 110"
        fill="none" stroke="url(#gold)" stroke-width="14" stroke-linecap="round"/>`;
  };
  const bud = `<path d="M${CX} 34 C${CX + 18} 54 ${CX + 22} 76 ${CX + 10} 94 L${CX + 16} 128 L${CX - 16} 128 L${CX - 10} 94 C${CX - 22} 76 ${CX - 18} 54 ${CX} 34 Z"/>`;
  const base = `<path d="M${CX - 150} 128 Q${CX} 112 ${CX + 150} 128 L${CX + 140} 146 Q${CX} 132 ${CX - 140} 146 Z"/>`;
  return G(`<g>${curl(-1)}${curl(1)}</g>` + base + bud);
}

// ---------- swords ----------
function sword(mirror, part) {
  const tip = mirror ? [mx(40), 168] : [40, 168];
  const guard = mirror ? [mx(660), 482] : [660, 482];
  const ang = Math.atan2(guard[1] - tip[1], guard[0] - tip[0]) * 180 / Math.PI;
  const len = Math.hypot(guard[0] - tip[0], guard[1] - tip[1]);
  if (part === 'blade') {
    return G(`<g transform="translate(${guard[0]} ${guard[1]}) rotate(${ang})">
      <path d="M${-len} 0 L${-len + 50} -15 L-4 -16 L-4 16 L${-len + 50} 15 Z"/>
      <path d="M${-len + 44} 0 L-14 0" stroke="#8d6418" stroke-width="2.4" fill="none"/></g>`, 'url(#blade)');
  }
  const flip = mirror ? -1 : 1;
  return G(`<g transform="translate(${guard[0]} ${guard[1]}) rotate(${ang}) scale(1.2 ${1.2 * flip})">
      <path d="M-6 -30 Q4 -34 10 -26 L10 26 Q4 34 -6 30 Z"/>
      <rect x="8" y="-12" width="84" height="24" rx="11"/>
      ${[20, 34, 48, 62, 76].map(x => `<path d="M${x} -11 L${x + 7} 11" stroke="#6a4610" stroke-width="2" fill="none"/>`).join('')}
      <path d="M94 -3 q16 -2 18 12 q-2 12 -18 10 z"/>
      <path d="M6 24 C26 72 92 76 112 20 L100 16 C84 56 36 54 18 20 Z"/>
    </g>`);
}

// ---------- disc ----------
function disc(centre) {
  let s = G(`<circle cx="${CX}" cy="${CY}" r="${R}"/>`, 'url(#goldV)');
  s += `<g fill="none" stroke="#6a4610" stroke-width="2.4" opacity="0.85"><circle cx="${CX}" cy="${CY}" r="${R - 7}"/><circle cx="${CX}" cy="${CY}" r="${F + 14}"/></g>`;
  s += G(`<circle cx="${CX}" cy="${CY}" r="${F + 7}" fill="none" stroke="url(#gold)" stroke-width="8"/>`);
  s += `<clipPath id="fc"><circle cx="${CX}" cy="${CY}" r="${F}"/></clipPath>`;
  s += `<g clip-path="url(#fc)"><circle cx="${CX}" cy="${CY}" r="${F}" fill="url(#field)" filter="url(#matte)"/><g id="symc"><g id="sym">${centre}</g></g></g>`;
  s += `<circle cx="${CX}" cy="${CY}" r="${F - 6}" fill="none" stroke="#7a5212" stroke-width="1.6" opacity="0.6"/>`;
  let st = '';
  for (const a of [-130, -50, 180, 0, 130, 50]) { const [x, y] = pol(CX, CY, 210, a); st += `<circle cx="${x}" cy="${y}" r="12"/>`; }
  s += G(st);
  const [a0x, a0y] = pol(CX, CY, 208, 114), [a1x, a1y] = pol(CX, CY, 208, 66);
  s += `<path id="yr" d="M${a0x} ${a0y} A208 208 0 0 0 ${a1x} ${a1y}" fill="none"/>`;
  s += G(`<text font-family="${SERIF}" font-weight="700" font-size="40" letter-spacing="9" text-anchor="middle" dominant-baseline="middle"><textPath href="#yr" startOffset="50%">1921</textPath></text>`);
  return s;
}

// ---------- ribbon + book plaque ----------
function ribbon(name, fs) {
  const c = [CX, 478], r0 = 290, r1 = 352, a0 = 155, a1 = 25;
  const P = (r, a) => pol(c[0], c[1], r, a);
  const [o0x, o0y] = P(r1, a0), [o1x, o1y] = P(r1, a1), [i1x, i1y] = P(r0, a1), [i0x, i0y] = P(r0, a0);
  const band = `M${o0x} ${o0y} A${r1} ${r1} 0 0 0 ${o1x} ${o1y} L${i1x} ${i1y} A${r0} ${r0} 0 0 1 ${i0x} ${i0y} Z`;
  const q = 6;
  const [e0x, e0y] = P(r1 - q, a0 - 1), [e1x, e1y] = P(r1 - q, a1 + 1), [f1x, f1y] = P(r0 + q, a1 + 1), [f0x, f0y] = P(r0 + q, a0 - 1);
  const inner = `M${e0x} ${e0y} A${r1 - q} ${r1 - q} 0 0 0 ${e1x} ${e1y} L${f1x} ${f1y} A${r0 + q} ${r0 + q} 0 0 1 ${f0x} ${f0y} Z`;
  const rm = (r0 + r1) / 2;
  const [t0x, t0y] = P(rm, a0 - 3), [t1x, t1y] = P(rm, a1 + 3);
  return G(`<path d="${band}"/>`) + `<path d="${inner}" fill="url(#enamel)"/>` +
    `<path id="rb" d="M${t0x} ${t0y} A${rm} ${rm} 0 0 0 ${t1x} ${t1y}" fill="none"/>` +
    G(`<text font-family="${SERIF}" font-weight="700" font-size="${fs}" letter-spacing="3" text-anchor="middle" dominant-baseline="middle"><textPath href="#rb" startOffset="50%">${name}</textPath></text>`);
}
function bookPlaque() {
  const y = 592, w = 108;
  const pages = `M${CX - w} ${y + 22} Q${CX - 54} ${y - 4} ${CX} ${y + 14} Q${CX + 54} ${y - 4} ${CX + w} ${y + 22} L${CX + w} ${y + 40} L${CX - w} ${y + 40} Z`;
  let s = G(`<path d="${pages}"/>`, 'url(#field)');
  s += `<g stroke="#7a5212" stroke-width="2" fill="none">${[14, 24].map(d => `<path d="M${CX - w + 12} ${y + d + 12} Q${CX - 50} ${y + d - 10} ${CX - 8} ${y + d + 6}"/><path d="M${CX + w - 12} ${y + d + 12} Q${CX + 50} ${y + d - 10} ${CX + 8} ${y + d + 6}"/>`).join('')}</g>`;
  s += G(`<path d="M${CX - w - 8} ${y + 34} L${CX + w + 8} ${y + 34} L${CX + w} ${y + 106} L${CX - w} ${y + 106} Z"/>`, 'url(#goldV)');
  s += `<path d="M${CX - w + 4} ${y + 44} L${CX + w - 4} ${y + 44} L${CX + w - 10} ${y + 96} L${CX - w + 10} ${y + 96} Z" fill="url(#field)" filter="url(#matte)" stroke="#6a4610" stroke-width="2"/>`;
  s += G(`<text x="${CX}" y="${y + 85}" text-anchor="middle" font-family="${SERIF}" font-weight="700" font-size="42" letter-spacing="3">ҮБХИС</text>`);
  return s;
}

function athlete() {
  // running-man pictogram (as on the existing sports badge): round head, leaning torso,
  // bent arms, front knee driven up, rear leg pushing off
  const seg = (d, w) => `<path d="${d}" stroke="url(#gold)" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  const fig = `
    <circle cx="60" cy="-88" r="22" fill="url(#gold)"/>
    ${seg('M30 -50 L-12 40', 34)}
    ${seg('M24 -38 L64 -8 L96 -40', 20)}
    ${seg('M18 -46 L-30 -40 L-60 -6', 20)}
    ${seg('M-12 40 L44 54 L40 112', 24)}
    ${seg('M-12 40 L-46 92 L-104 96', 24)}`;
  return `<g transform="translate(${CX + 6} ${CY - 6}) scale(1.05)"><g filter="url(#metal)">${fig}</g></g>`;
}
function scholar() {
  const y0 = CY - 10;
  let rays = '';
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    rays += `<path d="M${CX + 32 * Math.cos(a)} ${y0 - 56 + 32 * Math.sin(a)} L${CX + 72 * Math.cos(a)} ${y0 - 56 + 72 * Math.sin(a)}"/>`;
  }
  let s = `<g filter="url(#metal)" stroke="url(#gold)" stroke-width="5" stroke-linecap="round">${rays}</g>`;
  s += `<path d="M${CX} ${y0 - 106} C${CX + 18} ${y0 - 84} ${CX + 22} ${y0 - 64} ${CX} ${y0 - 50} C${CX - 22} ${y0 - 64} ${CX - 18} ${y0 - 84} ${CX} ${y0 - 106} Z" fill="url(#enamel)" stroke="#6a4610" stroke-width="2"/>`;
  s += `<path d="M${CX} ${y0 - 84} C${CX + 8} ${y0 - 74} ${CX + 9} ${y0 - 64} ${CX} ${y0 - 58} C${CX - 9} ${y0 - 64} ${CX - 8} ${y0 - 74} ${CX} ${y0 - 84} Z" fill="#f6cf55"/>`;
  s += G(`<path d="M${CX - 36} ${y0 - 46} Q${CX} ${y0 - 6} ${CX + 36} ${y0 - 46} Z"/><rect x="${CX - 7}" y="${y0 - 24}" width="14" height="24"/>
          <path d="M${CX - 28} ${y0 + 10} Q${CX} ${y0 - 10} ${CX + 28} ${y0 + 10} Z"/>`);
  s += G(`<path d="M${CX - 110} ${y0 + 32} Q${CX - 55} ${y0 + 12} ${CX} ${y0 + 32} Q${CX + 55} ${y0 + 12} ${CX + 110} ${y0 + 32} L${CX + 110} ${y0 + 98} Q${CX + 55} ${y0 + 78} ${CX} ${y0 + 98} Q${CX - 55} ${y0 + 78} ${CX - 110} ${y0 + 98} Z"/>`);
  s += `<g stroke="#7a5212" stroke-width="2.2" fill="none">${[46, 60, 74, 88].map(d => `<path d="M${CX - 96} ${y0 + d} Q${CX - 50} ${y0 + d - 15} ${CX - 10} ${y0 + d + 2}"/><path d="M${CX + 96} ${y0 + d} Q${CX + 50} ${y0 + d - 15} ${CX + 10} ${y0 + d + 2}"/>`).join('')}<path d="M${CX} ${y0 + 32} L${CX} ${y0 + 98}"/></g>`;
  return s;
}
function sukhbaatar(href) {
  if (href) return `<image href="${href}" x="${CX - F}" y="${CY - F}" width="${2 * F}" height="${2 * F}" preserveAspectRatio="xMidYMid slice"/>`;
  return `<circle cx="${CX}" cy="${CY}" r="${F - 24}" fill="none" stroke="#7a5212" stroke-width="3" stroke-dasharray="12 9"/>
    <text x="${CX}" y="${CY - 4}" text-anchor="middle" font-family="${SERIF}" font-weight="700" font-size="32" fill="#7a5212">Д.СҮХБААТАРЫН</text>
    <text x="${CX}" y="${CY + 34}" text-anchor="middle" font-family="${SERIF}" font-weight="700" font-size="32" fill="#7a5212">ХӨРӨГ</text>`;
}


function badge(centre, name, fs) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="830" viewBox="-5 20 800 830">${defs}
    <g filter="url(#drop)">
      ${sword(false, 'blade')}${sword(true, 'blade')}
      ${wreath()}
      ${ribbon(name, fs)}
      ${disc(centre)}
      ${topOrnament()}
      ${sprigs()}
      ${sword(false, 'hilt')}${sword(true, 'hilt')}
      ${bookPlaque()}
    </g></svg>`;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const ph = PORTRAIT ? 'data:image/png;base64,' + fs.readFileSync(PORTRAIT).toString('base64') : null;
  const jobs = {
    'gold_1_tamirchin.png': badge(athlete(), 'ТЭРГҮҮНИЙ ТАМИРЧИН', 36),
    'gold_2_suraltsagch.png': badge(scholar(), 'ТЭРГҮҮНИЙ СУРАЛЦАГЧ', 36),
    'gold_3_sukhbaatar.png': badge(sukhbaatar(ph), 'ЖАНЖИН СҮХБААТАР', 38),
  };
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1.5 });
  for (const [name, svg] of Object.entries(jobs)) {
    await page.setViewportSize({ width: 800, height: 830 });
    await page.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`);
    // centre the symbol on the disc (by its own bounding box) so nothing sits off-axis
    await page.evaluate(([cx, cy]) => {
      const g = document.getElementById('sym'); if (!g) return;
      const b = g.getBBox();
      const dx = cx - (b.x + b.width / 2), dy = cy - (b.y + b.height / 2);
      document.getElementById('symc').setAttribute('transform', `translate(${dx} ${dy})`);
    }, [CX, CY]);
    await page.locator('svg').first().screenshot({ path: path.join(OUT, name), omitBackground: true });
    console.log(name);
  }
  await browser.close();
})();
