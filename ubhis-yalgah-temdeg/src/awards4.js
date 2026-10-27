// Gold award badges drawn to the proportions of the ҮБХИС breast insignia (measured on the photo,
// 790 px wide): studded shield r=245 at (395,425), straight swords crossing behind it with tips at the
// top corners and sabre hilts at the lower sides, laurel branches up both sides, open book at the
// bottom over a red enamel ribbon arc. A small «ҮБХИС» scroll replaces the falcon (falcon is kept for
// the best-graduate medal only).
// Usage: node awards4.js <outdir> [portrait.png]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { defs } = require('./gold_defs.js');

const OUT = process.argv[2];
const PORTRAIT = process.argv[3] && fs.existsSync(process.argv[3]) ? process.argv[3] : null;
const SERIF = "'Liberation Serif', 'Times New Roman', serif";
const CX = 395, CY = 425, R = 245, F = 172;
const G = (inner, fill = 'url(#gold)') => `<g filter="url(#metal)" fill="${fill}" stroke="#6a4610" stroke-width="1">${inner}</g>`;
const pol = (cx, cy, r, a) => [cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180)];
const mx = (x) => 2 * CX - x;

// ---------- leaf / laurel ----------
function leaf(x, y, rot, L, Wd) {
  return `<g transform="translate(${x} ${y}) rotate(${rot})">
    <path d="M0 0 C${L * 0.25} ${-Wd} ${L * 0.7} ${-Wd * 0.85} ${L} 0 C${L * 0.7} ${Wd * 0.85} ${L * 0.25} ${Wd} 0 0 Z"/>
    <path d="M5 0 L${L - 10} 0" stroke="#7a5212" stroke-width="2.2" fill="none"/></g>`;
}
function branch(pts, size, mirror) {
  // pts: stem points from base to tip. Leaves on both sides pointing toward the tip.
  const P = mirror ? pts.map(([x, y]) => [mx(x), y]) : pts;
  let g = `<path d="M${P.map(p => p.join(' ')).join(' L')}" fill="none" stroke="url(#gold)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`;
  for (let i = 1; i < P.length; i++) {
    const [x0, y0] = P[i - 1], [x1, y1] = P[i];
    const t = Math.atan2(y1 - y0, x1 - x0) * 180 / Math.PI;
    const k = 1 - 0.35 * (i / P.length);
    const L = size * k, Wd = size * 0.38 * k;
    g += leaf(x1, y1, t - 34, L, Wd) + leaf(x1, y1, t + 34, L * 0.95, Wd * 0.95);
    if (i % 3 === 0) g += `<circle cx="${(x0 + x1) / 2}" cy="${(y0 + y1) / 2}" r="7"/>`;
  }
  // tip leaf
  const [xa, ya] = P[P.length - 2], [xb, yb] = P[P.length - 1];
  g += leaf(xb, yb, Math.atan2(yb - ya, xb - xa) * 180 / Math.PI, size * 0.7, size * 0.25);
  return g;
}
const SIDE = [[205, 690], [150, 645], [105, 585], [78, 515], [66, 445], [70, 375], [86, 305], [112, 245], [146, 192]];
const LOW = [[330, 700], [285, 692], [240, 680], [195, 664], [152, 648]];
function laurels() {
  return G(branch(SIDE, 86, false) + branch(SIDE, 86, true));
}
function lowSprigs() {
  return G(branch(LOW, 66, false) + branch(LOW, 66, true));
}

// ---------- swords: straight blade, sabre hilt with knuckle bow ----------
function sword(mirror, part) {
  const tip = mirror ? [mx(40), 232] : [40, 232];
  const guard = mirror ? [mx(642), 560] : [642, 560];
  const ang = Math.atan2(guard[1] - tip[1], guard[0] - tip[0]) * 180 / Math.PI;
  const len = Math.hypot(guard[0] - tip[0], guard[1] - tip[1]);
  // local frame: x axis from guard (0) back toward the tip (-len); hilt on +x
  const blade = `<g transform="translate(${guard[0]} ${guard[1]}) rotate(${ang})">
      <path d="M${-len} 0 L${-len + 46} -12 L-4 -14 L-4 14 L${-len + 46} 12 Z" fill="url(#blade)"/>
      <path d="M${-len + 40} 0 L-14 0" stroke="#8d6418" stroke-width="2.2" fill="none"/>
    </g>`;
  const flip = mirror ? -1 : 1; // knuckle bow on the lower side
  const hilt = `<g transform="translate(${guard[0]} ${guard[1]}) rotate(${ang}) scale(1.15 ${1.15 * flip})">
      <path d="M-6 -30 Q4 -34 10 -26 L10 26 Q4 34 -6 30 Z"/>
      <rect x="8" y="-11" width="86" height="22" rx="10"/>
      ${[20, 34, 48, 62, 76].map(x => `<path d="M${x} -10 L${x + 7} 10" stroke="#6a4610" stroke-width="2" fill="none"/>`).join('')}
      <path d="M96 -2 q14 -2 16 10 q-2 12 -16 10 z"/>
      <path d="M8 26 C30 66 86 70 108 22 L98 18 C80 54 38 52 18 22 Z"/>
    </g>`;
  return part === 'blade' ? G(blade, 'url(#blade)') : G(hilt);
}

// ---------- shield ----------
function shield(centre) {
  let s = G(`<circle cx="${CX}" cy="${CY}" r="${R}"/>`, 'url(#goldV)');
  s += `<circle cx="${CX}" cy="${CY}" r="${R - 10}" fill="none" stroke="#7a5212" stroke-width="2.5" opacity="0.7"/>`;
  s += G(`<circle cx="${CX}" cy="${CY}" r="${F + 12}" fill="none" stroke-width="7" stroke="url(#gold)"/>`);
  s += `<clipPath id="fc"><circle cx="${CX}" cy="${CY}" r="${F}"/></clipPath>`;
  s += `<g clip-path="url(#fc)"><circle cx="${CX}" cy="${CY}" r="${F}" fill="url(#field)" filter="url(#matte)"/>${centre}</g>`;
  let st = '';
  for (const a of [-136, -44, 180, 0, 136, 44]) { const [x, y] = pol(CX, CY, 212, a); st += `<circle cx="${x}" cy="${y}" r="12"/>`; }
  s += G(st);
  const [a0x, a0y] = pol(CX, CY, 207, 116), [a1x, a1y] = pol(CX, CY, 207, 64);
  s += `<path id="yr" d="M${a0x} ${a0y} A207 207 0 0 0 ${a1x} ${a1y}" fill="none"/>`;
  s += G(`<text font-family="${SERIF}" font-weight="700" font-size="40" letter-spacing="8" text-anchor="middle" dominant-baseline="middle"><textPath href="#yr" startOffset="50%">1921</textPath></text>`);
  return s;
}

// ---------- ribbon arc, book, top scroll ----------
function ribbon(name, fs) {
  const c = [CX, 492], r0 = 338, r1 = 388, a0 = 148, a1 = 32;
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
    G(`<text font-family="${SERIF}" font-weight="700" font-size="${fs}" letter-spacing="2.5" text-anchor="middle" dominant-baseline="middle"><textPath href="#rb" startOffset="50%">${name}</textPath></text>`);
}
function book() {
  const y = 694, w = 140;
  const cover = `M${CX - w} ${y + 14} Q${CX - 70} ${y - 8} ${CX} ${y + 8} Q${CX + 70} ${y - 8} ${CX + w} ${y + 14} L${CX + w + 6} ${y + 110} Q${CX + 70} ${y + 92} ${CX} ${y + 112} Q${CX - 70} ${y + 92} ${CX - w - 6} ${y + 110} Z`;
  const pages = `M${CX - w + 12} ${y + 12} Q${CX - 66} ${y - 4} ${CX - 3} ${y + 12} L${CX - 3} ${y + 100} Q${CX - 66} ${y + 84} ${CX - w + 8} ${y + 98} Z
                 M${CX + w - 12} ${y + 12} Q${CX + 66} ${y - 4} ${CX + 3} ${y + 12} L${CX + 3} ${y + 100} Q${CX + 66} ${y + 84} ${CX + w - 8} ${y + 98} Z`;
  return G(`<path d="${cover}"/>`, 'url(#goldV)') + G(`<path d="${pages}"/>`, 'url(#field)') +
    `<g stroke="#7a5212" stroke-width="2" fill="none" opacity="0.85">${[30, 46, 62, 78].map(d => `<path d="M${CX - w + 26} ${y + d + 2} Q${CX - 66} ${y + d - 14} ${CX - 14} ${y + d + 2}"/><path d="M${CX + w - 26} ${y + d + 2} Q${CX + 66} ${y + d - 14} ${CX + 14} ${y + d + 2}"/>`).join('')}</g>`;
}
function topScroll() {
  const y = 150, w = 220;
  const sc = `M${CX - w / 2} ${y} Q${CX} ${y - 22} ${CX + w / 2} ${y} L${CX + w / 2} ${y + 42} Q${CX} ${y + 20} ${CX - w / 2} ${y + 42} Z`;
  const ends = `M${CX - w / 2} ${y + 6} L${CX - w / 2 - 30} ${y + 2} L${CX - w / 2 - 18} ${y + 25} L${CX - w / 2 - 30} ${y + 48} L${CX - w / 2} ${y + 38} Z
                M${CX + w / 2} ${y + 6} L${CX + w / 2 + 30} ${y + 2} L${CX + w / 2 + 18} ${y + 25} L${CX + w / 2 + 30} ${y + 48} L${CX + w / 2} ${y + 38} Z`;
  return G(`<path d="${ends}"/><path d="${sc}"/>`) +
    `<path id="cr" d="M${CX - w / 2 + 12} ${y + 31} Q${CX} ${y + 9} ${CX + w / 2 - 12} ${y + 31}" fill="none"/>` +
    `<text font-family="${SERIF}" font-weight="700" font-size="29" letter-spacing="5" text-anchor="middle" fill="#6a4610"><textPath href="#cr" startOffset="50%">ҮБХИС</textPath></text>`;
}

// ---------- centre symbols (inside r=172 around CX,CY) ----------
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
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="780" viewBox="-5 112 800 780">${defs}
    <g filter="url(#drop)">
      ${laurels()}
      ${sword(false, 'blade')}${sword(true, 'blade')}
      ${ribbon(name, fs)}
      ${shield(centre)}
      ${lowSprigs()}
      ${sword(false, 'hilt')}${sword(true, 'hilt')}
      ${book()}
      ${topScroll()}
    </g></svg>`;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const ph = PORTRAIT ? 'data:image/png;base64,' + fs.readFileSync(PORTRAIT).toString('base64') : null;
  const jobs = {
    'gold_1_tamirchin.png': badge(athlete(), 'ТЭРГҮҮНИЙ ТАМИРЧИН', 34),
    'gold_2_suraltsagch.png': badge(scholar(), 'ТЭРГҮҮНИЙ СУРАЛЦАГЧ', 34),
    'gold_3_sukhbaatar.png': badge(sukhbaatar(ph), 'ЖАНЖИН СҮХБААТАР', 36),
  };
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1.5 });
  for (const [name, svg] of Object.entries(jobs)) {
    await page.setViewportSize({ width: 800, height: 780 });
    await page.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`);
    await page.locator('svg').first().screenshot({ path: path.join(OUT, name), omitBackground: true });
    console.log(name);
  }
  await browser.close();
})();
