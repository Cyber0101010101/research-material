// Gold award badges modelled on the ҮБХИС breast insignia: round shield with studded rim and «1921»,
// laurel branches, crossed sabres, open book, red enamel name ribbon. The falcon is left to the
// best-graduate medal only; a small «ҮБХИС» scroll crowns these badges instead.
// Usage: node awards3.js <outdir> [portrait.png]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = process.argv[2];
const PORTRAIT = process.argv[3] && fs.existsSync(process.argv[3]) ? process.argv[3] : null;
const SERIF = "'Liberation Serif', 'Times New Roman', serif";
const CX = 400, CY = 410, R = 232;      // shield centre / radius
const F = 188;                           // inner field radius

const defs = `<defs>
  <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#fff0b0"/><stop offset="0.22" stop-color="#f1cd62"/>
    <stop offset="0.5" stop-color="#d4a23a"/><stop offset="0.78" stop-color="#a8761f"/><stop offset="1" stop-color="#7a5212"/>
  </linearGradient>
  <linearGradient id="goldV" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fbe49a"/><stop offset="0.5" stop-color="#d9aa42"/><stop offset="1" stop-color="#93661a"/>
  </linearGradient>
  <linearGradient id="blade" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#b68a2c"/><stop offset="0.45" stop-color="#fff2bf"/><stop offset="0.55" stop-color="#f2d27a"/><stop offset="1" stop-color="#9c7020"/>
  </linearGradient>
  <radialGradient id="field" cx="0.4" cy="0.35" r="0.8">
    <stop offset="0" stop-color="#e6bf5c"/><stop offset="0.7" stop-color="#c2922f"/><stop offset="1" stop-color="#9a6d1c"/>
  </radialGradient>
  <linearGradient id="enamel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c5232b"/><stop offset="1" stop-color="#8a1016"/></linearGradient>
  <filter id="metal" x="-12%" y="-12%" width="124%" height="124%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="2.4" result="b"/>
    <feDiffuseLighting in="b" surfaceScale="4" diffuseConstant="1.18" lighting-color="#ffffff" result="diff"><feDistantLight azimuth="235" elevation="52"/></feDiffuseLighting>
    <feSpecularLighting in="b" surfaceScale="4" specularConstant="1.05" specularExponent="24" lighting-color="#fff6d2" result="spec"><feDistantLight azimuth="235" elevation="44"/></feSpecularLighting>
    <feComposite in="SourceGraphic" in2="diff" operator="arithmetic" k1="1.12" k2="0" k3="0" k4="0" result="shaded"/>
    <feComposite in="spec" in2="SourceAlpha" operator="in" result="sp"/>
    <feComposite in="shaded" in2="sp" operator="arithmetic" k1="0" k2="1" k3="0.85" k4="0" result="lit"/>
    <feComposite in="lit" in2="SourceAlpha" operator="in" result="litIn"/>
    <feDropShadow in="litIn" dx="1.6" dy="2.4" stdDeviation="1.8" flood-color="#3a2405" flood-opacity="0.6"/>
  </filter>
  <filter id="matte" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="7" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.42  0 0 0 0 0.15  0 0 0 0.35 0" result="g"/>
    <feComposite in="g" in2="SourceAlpha" operator="in" result="gi"/>
    <feBlend in="SourceGraphic" in2="gi" mode="multiply"/>
  </filter>
  <filter id="drop" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="5" dy="9" stdDeviation="9" flood-color="#000" flood-opacity="0.3"/></filter>
  <clipPath id="fieldClip"><circle cx="${CX}" cy="${CY}" r="${F}"/></clipPath>
</defs>`;

const G = (inner, fill = 'url(#gold)') => `<g filter="url(#metal)" fill="${fill}" stroke="#6a4610" stroke-width="1">${inner}</g>`;
const pol = (cx, cy, r, a) => [cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180)];

// ---------- crossed sabres (behind everything) ----------
function sabre(flip) {
  // straight blade from the hilt (bottom) to the tip (top, outside the wreath)
  const s = flip ? -1 : 1;
  const hx = CX + s * 300, hy = 640, tx = CX - s * 345, ty = 195;
  const ang = Math.atan2(ty - hy, tx - hx), len = Math.hypot(tx - hx, ty - hy);
  const deg = ang * 180 / Math.PI;
  const blade = `<g transform="translate(${hx} ${hy}) rotate(${deg})">
      <path d="M0 -13 L${len - 40} -10 L${len} 0 L${len - 40} 10 L0 13 Z" fill="url(#blade)"/>
      <path d="M10 0 L${len - 46} 0" stroke="#8d6418" stroke-width="2" fill="none"/>
    </g>`;
  // sabre hilt: cross-guard, knuckle bow and grip below the blade root
  const hilt = `<g transform="translate(${hx} ${hy}) rotate(${deg})">
      <rect x="-8" y="-24" width="16" height="48" rx="6"/>
      <path d="M-6 -22 C-40 -40 -86 -36 -98 -6 L-84 -2 C-74 -24 -40 -26 -8 -10 Z"/>
      <rect x="-90" y="-11" width="82" height="22" rx="10"/>
      ${[-80, -66, -52, -38, -24].map(x => `<path d="M${x} -10 L${x + 6} 10" stroke="#6a4610" stroke-width="2" fill="none"/>`).join('')}
      <circle cx="-100" cy="0" r="13"/>
    </g>`;
  return G(blade, 'url(#blade)') + G(hilt);
}

// ---------- laurel branches ----------
function leaf(x, y, rot, L = 74, Wd = 26) {
  return `<g transform="translate(${x} ${y}) rotate(${rot})">
    <path d="M0 0 C${L * 0.3} ${-Wd} ${L * 0.75} ${-Wd * 0.8} ${L} 0 C${L * 0.75} ${Wd * 0.8} ${L * 0.3} ${Wd} 0 0 Z"/>
    <path d="M4 0 L${L - 8} 0" stroke="#7a5212" stroke-width="2" fill="none"/></g>`;
}
function laurel(side) {
  const s = side;
  let g = '';
  const N = 13;
  const pts = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const a = (s < 0 ? 122 + t * 122 : 58 - t * 122);
    const rr = R + 34 + 8 * Math.sin(t * Math.PI);
    pts.push(pol(CX, CY, rr, a).concat([a]));
  }
  g += `<path d="M${pts.map(p => p[0] + ' ' + p[1]).join(' L')}" fill="none" stroke="url(#gold)" stroke-width="10" stroke-linecap="round"/>`;
  pts.forEach(([x, y, a], i) => {
    if (i === 0) return;
    const tang = a + (s < 0 ? 90 : -90);
    const size = 92 - i * 3.2;
    g += leaf(x, y, tang + (s < 0 ? 28 : -28) + 180 * 0, size, size * 0.42);
    g += leaf(x, y, tang + (s < 0 ? -30 : 30), size * 0.9, size * 0.4);
  });
  pts.filter((_, i) => i % 3 === 2).forEach(([x, y]) => { g += `<circle cx="${x}" cy="${y}" r="7.5"/>`; });
  return G(g);
}

// ---------- shield ----------
function shield(centre) {
  let s = '';
  s += G(`<circle cx="${CX}" cy="${CY}" r="${R}"/>`, 'url(#goldV)');
  s += `<circle cx="${CX}" cy="${CY}" r="${F + 6}" fill="none" stroke="#7a5212" stroke-width="3" opacity="0.8"/>`;
  s += `<g clip-path="url(#fieldClip)"><circle cx="${CX}" cy="${CY}" r="${F}" fill="url(#field)" filter="url(#matte)"/>${centre}</g>`;
  s += `<circle cx="${CX}" cy="${CY}" r="${F}" fill="none" stroke="#fff0b8" stroke-width="1.5" opacity="0.6"/>`;
  // studs
  let st = '';
  for (const a of [-140, -40, 180, 0, 140, 40]) { const [x, y] = pol(CX, CY, (R + F) / 2 + 3, a); st += `<circle cx="${x}" cy="${y}" r="10"/>`; }
  s += G(st);
  // «1921» on the rim
  const [a0x, a0y] = pol(CX, CY, R - 30, 118), [a1x, a1y] = pol(CX, CY, R - 30, 62);
  s += `<path id="yr" d="M${a0x} ${a0y} A${R - 30} ${R - 30} 0 0 0 ${a1x} ${a1y}" fill="none"/>`;
  s += G(`<text font-family="${SERIF}" font-weight="700" font-size="34" letter-spacing="6" text-anchor="middle"><textPath href="#yr" startOffset="50%">1921</textPath></text>`);
  return s;
}

// ---------- ribbon + book + crown ----------
function ribbon(name, fs) {
  const c = [CX, 250], r0 = 520, r1 = 574, a0 = 132, a1 = 48;
  const P = (r, a) => pol(c[0], c[1], r, a);
  const [o0x, o0y] = P(r1, a0), [o1x, o1y] = P(r1, a1), [i1x, i1y] = P(r0, a1), [i0x, i0y] = P(r0, a0);
  const band = `M${o0x} ${o0y} A${r1} ${r1} 0 0 0 ${o1x} ${o1y} L${i1x} ${i1y} A${r0} ${r0} 0 0 1 ${i0x} ${i0y} Z`;
  const [e0x, e0y] = P(r1 - 6, a0 - 1), [e1x, e1y] = P(r1 - 6, a1 + 1), [f1x, f1y] = P(r0 + 6, a1 + 1), [f0x, f0y] = P(r0 + 6, a0 - 1);
  const inner = `M${e0x} ${e0y} A${r1 - 6} ${r1 - 6} 0 0 0 ${e1x} ${e1y} L${f1x} ${f1y} A${r0 + 6} ${r0 + 6} 0 0 1 ${f0x} ${f0y} Z`;
  const [t0x, t0y] = P((r0 + r1) / 2 + 9, a0 - 2), [t1x, t1y] = P((r0 + r1) / 2 + 9, a1 + 2);
  return G(`<path d="${band}"/>`) + `<path d="${inner}" fill="url(#enamel)"/>` +
    `<path id="rb" d="M${t0x} ${t0y} A${(r0 + r1) / 2 + 9} ${(r0 + r1) / 2 + 9} 0 0 0 ${t1x} ${t1y}" fill="none"/>` +
    G(`<text font-family="${SERIF}" font-weight="700" font-size="${fs}" letter-spacing="2" text-anchor="middle"><textPath href="#rb" startOffset="50%">${name}</textPath></text>`);
}
function book() {
  const y = 646;
  return G(`<path d="M${CX - 120} ${y + 12} Q${CX - 60} ${y - 14} ${CX} ${y + 6} Q${CX + 60} ${y - 14} ${CX + 120} ${y + 12} L${CX + 132} ${y + 96} Q${CX + 64} ${y + 80} ${CX} ${y + 100} Q${CX - 64} ${y + 80} ${CX - 132} ${y + 96} Z"/>`) +
    `<g stroke="#7a5212" stroke-width="2" fill="none" opacity="0.9">
      <path d="M${CX} ${y + 6} L${CX} ${y + 100}"/>
      ${[24, 40, 56, 72].map(d => `<path d="M${CX - 108} ${y + d + 4} Q${CX - 56} ${y + d - 14} ${CX - 10} ${y + d + 4}"/><path d="M${CX + 108} ${y + d + 4} Q${CX + 56} ${y + d - 14} ${CX + 10} ${y + d + 4}"/>`).join('')}
    </g>`;
}
function crown() {
  // small «ҮБХИС» scroll above the shield (the falcon stays on the best-graduate medal only)
  const y = 150, w = 210;
  const sc = `M${CX - w / 2} ${y} Q${CX} ${y - 24} ${CX + w / 2} ${y} L${CX + w / 2} ${y + 44} Q${CX} ${y + 20} ${CX - w / 2} ${y + 44} Z`;
  const ends = `M${CX - w / 2} ${y + 6} L${CX - w / 2 - 30} ${y + 2} L${CX - w / 2 - 18} ${y + 26} L${CX - w / 2 - 30} ${y + 50} L${CX - w / 2} ${y + 40} Z
                M${CX + w / 2} ${y + 6} L${CX + w / 2 + 30} ${y + 2} L${CX + w / 2 + 18} ${y + 26} L${CX + w / 2 + 30} ${y + 50} L${CX + w / 2} ${y + 40} Z`;
  return G(`<path d="${ends}"/><path d="${sc}"/>`) +
    `<path id="cr" d="M${CX - w / 2 + 12} ${y + 32} Q${CX} ${y + 8} ${CX + w / 2 - 12} ${y + 32}" fill="none"/>` +
    `<text font-family="${SERIF}" font-weight="700" font-size="30" letter-spacing="5" text-anchor="middle" fill="#6a4610"><textPath href="#cr" startOffset="50%">ҮБХИС</textPath></text>`;
}

// ---------- centre symbols ----------
function athlete() {
  // runner carrying a torch, tapered limbs for a cast-relief look
  const limb = (pts, w0, w1) => {
    let s = '';
    for (let i = 0; i < pts.length - 1; i++) {
      const w = w0 + (w1 - w0) * (i / Math.max(1, pts.length - 2));
      s += `<path d="M${pts[i][0]} ${pts[i][1]} L${pts[i + 1][0]} ${pts[i + 1][1]}" stroke="url(#gold)" stroke-width="${w}" stroke-linecap="round" fill="none"/>`;
    }
    return s;
  };
  const fig = `
    ${limb([[150, 96], [168, 46], [176, 6]], 15, 12)}
    ${limb([[126, 100], [96, 128], [82, 160]], 15, 12)}
    <path d="M140 68 C166 68 174 90 168 114 L148 182 C142 194 114 192 110 178 L118 106 C121 84 126 68 140 68 Z" fill="url(#gold)"/>
    ${limb([[128, 176], [176, 214], [168, 282]], 26, 17)}
    ${limb([[124, 176], [92, 232], [40, 246]], 26, 17)}
    <path d="M160 284 L186 286 L182 296 L156 294 Z" fill="url(#gold)"/>
    <path d="M30 238 L40 262 L30 266 L22 244 Z" fill="url(#gold)"/>
    <ellipse cx="150" cy="50" rx="17" ry="20" fill="url(#gold)"/>
    <path d="M172 12 L196 -40" stroke="url(#gold)" stroke-width="10" stroke-linecap="round" fill="none"/>
    <path d="M186 -40 L214 -46 L204 -28 Z" fill="url(#gold)"/>
    <path d="M206 -104 C224 -82 230 -64 220 -48 C214 -38 198 -38 194 -48 C186 -64 194 -82 206 -104 Z" fill="url(#enamel)" stroke="#6a4610" stroke-width="2"/>
    <path d="M206 -78 C214 -68 216 -60 211 -53 C208 -49 202 -49 200 -53 C196 -60 199 -68 206 -78 Z" fill="#f6cf55"/>`;
  return `<g transform="translate(${CX - 120} ${CY - 75}) scale(0.82)"><g filter="url(#metal)">${fig}</g></g>`;
}
function scholar() {
  let s = '';
  let rays = '';
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    rays += `<path d="M${CX + 34 * Math.cos(a)} ${CY - 56 + 34 * Math.sin(a)} L${CX + 78 * Math.cos(a)} ${CY - 56 + 78 * Math.sin(a)}"/>`;
  }
  s += `<g filter="url(#metal)" stroke="url(#gold)" stroke-width="5" stroke-linecap="round">${rays}</g>`;
  s += `<path d="M${CX} ${CY - 108} C${CX + 18} ${CY - 86} ${CX + 22} ${CY - 66} ${CX} ${CY - 52} C${CX - 22} ${CY - 66} ${CX - 18} ${CY - 86} ${CX} ${CY - 108} Z" fill="url(#enamel)" stroke="#6a4610" stroke-width="2"/>`;
  s += `<path d="M${CX} ${CY - 86} C${CX + 8} ${CY - 76} ${CX + 9} ${CY - 66} ${CX} ${CY - 60} C${CX - 9} ${CY - 66} ${CX - 8} ${CY - 76} ${CX} ${CY - 86} Z" fill="#f6cf55"/>`;
  s += G(`<path d="M${CX - 38} ${CY - 48} Q${CX} ${CY - 6} ${CX + 38} ${CY - 48} Z"/><rect x="${CX - 7}" y="${CY - 26}" width="14" height="26"/>
          <path d="M${CX - 30} ${CY + 10} Q${CX} ${CY - 12} ${CX + 30} ${CY + 10} Z"/>`);
  s += G(`<path d="M${CX - 118} ${CY + 34} Q${CX - 58} ${CY + 12} ${CX} ${CY + 34} Q${CX + 58} ${CY + 12} ${CX + 118} ${CY + 34} L${CX + 118} ${CY + 104} Q${CX + 58} ${CY + 82} ${CX} ${CY + 104} Q${CX - 58} ${CY + 82} ${CX - 118} ${CY + 104} Z"/>`);
  s += `<g stroke="#7a5212" stroke-width="2.2" fill="none">${[48, 62, 76, 90].map(d => `<path d="M${CX - 104} ${CY + d} Q${CX - 54} ${CY + d - 16} ${CX - 10} ${CY + d + 2}"/><path d="M${CX + 104} ${CY + d} Q${CX + 54} ${CY + d - 16} ${CX + 10} ${CY + d + 2}"/>`).join('')}<path d="M${CX} ${CY + 34} L${CX} ${CY + 104}"/></g>`;
  return s;
}
function sukhbaatar(href) {
  if (href) {
    // gold relief portrait: grayscale photo toned gold and lit like the metal
    return `<image href="${href}" x="${CX - F}" y="${CY - F}" width="${2 * F}" height="${2 * F}" preserveAspectRatio="xMidYMid slice" filter="url(#metal)"/>`;
  }
  // portrait not supplied yet: leave a clearly marked slot
  return `<circle cx="${CX}" cy="${CY}" r="${F - 26}" fill="none" stroke="#7a5212" stroke-width="3" stroke-dasharray="12 9"/>
    <text x="${CX}" y="${CY - 6}" text-anchor="middle" font-family="${SERIF}" font-weight="700" font-size="34" fill="#7a5212">Д.СҮХБААТАРЫН</text>
    <text x="${CX}" y="${CY + 34}" text-anchor="middle" font-family="${SERIF}" font-weight="700" font-size="34" fill="#7a5212">ХӨРӨГ</text>`;
}

function badge(centre, name, fs) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="880" viewBox="0 60 800 880">${defs}
    <g filter="url(#drop)">
      ${sabre(false)}${sabre(true)}
      ${laurel(-1)}${laurel(1)}
      ${ribbon(name, fs)}
      ${shield(centre)}
      ${book()}
      ${crown()}
    </g></svg>`;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const portraitHref = PORTRAIT ? 'data:image/png;base64,' + fs.readFileSync(PORTRAIT).toString('base64') : null;
  const jobs = {
    'gold_1_tamirchin.png': badge(athlete(), 'ТЭРГҮҮНИЙ ТАМИРЧИН', 36),
    'gold_2_suraltsagch.png': badge(scholar(), 'ТЭРГҮҮНИЙ СУРАЛЦАГЧ', 36),
    'gold_3_sukhbaatar.png': badge(sukhbaatar(portraitHref), 'ЖАНЖИН СҮХБААТАР', 38),
  };
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const [name, svg] of Object.entries(jobs)) {
    await page.setViewportSize({ width: 800, height: 880 });
    await page.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`);
    await page.locator('svg').first().screenshot({ path: path.join(OUT, name), omitBackground: true });
    console.log(name);
  }
  await browser.close();
})();
