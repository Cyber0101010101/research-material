// Award badges built on the existing «Шилдэг төгсөгч» medal: same body (wreath, crossed sabres,
// studded disc, ҮБХИС book plaque, red enamel band). Only the centre symbol and the band name change.
// Usage: node awards2.js <outdir> <medal_cut.png>
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = process.argv[2];
const MEDAL = process.argv[3];
const PORTRAIT = process.argv[4] && fs.existsSync(process.argv[4]) ? process.argv[4] : null;
const W = 395, H = 634;           // medal cut-out size
const CX = 197.5, CY = 420;       // disc centre
const BODY_TOP = 240;             // body starts below the falcon + jump ring
const SC = 3;                     // render scale
const SERIF = "'Liberation Serif', 'Times New Roman', serif";
const FONT = "'Liberation Sans', Arial, sans-serif";
const INK = '#1c2740';

const defs = `<defs>
  <linearGradient id="brz" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#fff0b8"/><stop offset="0.4" stop-color="#e2b453"/>
    <stop offset="0.75" stop-color="#a8761f"/><stop offset="1" stop-color="#6a4a10"/>
  </linearGradient>
  <radialGradient id="plate" cx="0.42" cy="0.38" r="0.75">
    <stop offset="0" stop-color="#c99a3a"/><stop offset="0.65" stop-color="#9c6f1f"/><stop offset="1" stop-color="#6f4c12"/>
  </radialGradient>
  <linearGradient id="red" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#b8241f"/><stop offset="1" stop-color="#861612"/>
  </linearGradient>
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.45  0 0 0 0.22 0" result="g"/>
    <feComposite in="g" in2="SourceAlpha" operator="in" result="gi"/>
    <feBlend in="SourceGraphic" in2="gi" mode="multiply"/>
  </filter>
  <filter id="relief" x="-15%" y="-15%" width="130%" height="130%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="0.9" result="b"/>
    <feSpecularLighting in="b" surfaceScale="2.2" specularConstant="0.8" specularExponent="14" lighting-color="#fff6d8" result="sp">
      <fePointLight x="-120" y="-200" z="220"/>
    </feSpecularLighting>
    <feComposite in="sp" in2="SourceAlpha" operator="in" result="spi"/>
    <feComposite in="SourceGraphic" in2="spi" operator="arithmetic" k1="0" k2="1" k3="0.7" k4="0" result="lit"/>
    <feDropShadow in="lit" dx="0.7" dy="1" stdDeviation="0.6" flood-color="#1c1708" flood-opacity="0.8"/>
  </filter>
  <clipPath id="disc"><circle cx="${CX}" cy="${CY}" r="85.5"/></clipPath>
</defs>`;

const R = (inner) => `<g filter="url(#relief)" fill="url(#brz)" stroke="#4a3006" stroke-width="0.8">${inner}</g>`;
const pol = (a, r) => [CX + r * Math.cos(a * Math.PI / 180), CY + r * Math.sin(a * Math.PI / 180)];

function bandAndName(name, fs) {
  // the band itself comes from the medal photo (old lettering erased); only the raised name is drawn
  const BX = 189.4, BY = 479.4, BR = 135;
  const P = (a) => [BX + BR * Math.cos(a * Math.PI / 180), BY + BR * Math.sin(a * Math.PI / 180)];
  const [t0x, t0y] = P(157), [t1x, t1y] = P(23);
  return `<path id="nm" d="M${t0x} ${t0y} A${BR} ${BR} 0 0 0 ${t1x} ${t1y}" fill="none"/>
    ${R(`<text font-family="${SERIF}" font-weight="700" font-size="${fs}" letter-spacing="0.8" text-anchor="middle" dominant-baseline="middle" stroke-width="0.4"><textPath href="#nm" startOffset="50%">${name}</textPath></text>`)}`;
}

function plate(symbol) {
  // new plate inside the inner ring (the original «1921» on the ring stays)
  return `<g clip-path="url(#disc)"><rect x="${CX - 90}" y="${CY - 90}" width="180" height="180" fill="url(#plate)" filter="url(#grain)"/>${symbol}` + `</g>`;
}

// ---------- centre symbols (drawn around the disc centre, inside r≈80, above y=488) ----------
function symAthlete() {
  const seg = (d, w) => `<path d="${d}" stroke="#4a3006" stroke-width="${w + 3}" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="${d}" stroke="url(#brz)" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  const fig = `<circle cx="60" cy="-88" r="22" fill="url(#brz)" stroke="#4a3006" stroke-width="1.5"/>
    ${seg('M30 -50 L-12 40', 34)}${seg('M24 -38 L64 -8 L96 -40', 20)}${seg('M18 -46 L-30 -40 L-60 -6', 20)}
    ${seg('M-12 40 L44 54 L40 112', 24)}${seg('M-12 40 L-46 92 L-104 96', 24)}`;
  return `<g id="sym"><g transform="translate(${CX} ${CY}) scale(0.5)" filter="url(#relief)">${fig}</g></g>`;
}
function laurelSmall() {
  // small victory laurel sprigs at the lower edge of the disc
  let s = '';
  for (const side of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const a = (side < 0 ? 150 - i * 11 : 30 + i * 11) * Math.PI / 180;
      const x = CX + 70 * Math.cos(a), y = CY + 70 * Math.sin(a);
      const rot = a * 180 / Math.PI + (side < 0 ? 60 : 120);
      s += `<ellipse cx="${x}" cy="${y}" rx="8" ry="3.4" transform="rotate(${rot} ${x} ${y})"/>`;
    }
  }
  return R(s);
}
function symScholar() {
  let s = '';
  // rays of knowledge
  let rays = '';
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 - Math.PI / 2;
    rays += `<line x1="${CX + 20 * Math.cos(a)}" y1="${CY - 32 + 20 * Math.sin(a)}" x2="${CX + 40 * Math.cos(a)}" y2="${CY - 32 + 40 * Math.sin(a)}"/>`;
  }
  s += `<g filter="url(#relief)" stroke="url(#brz)" stroke-width="2.6" stroke-linecap="round">${rays}</g>`;
  // butter lamp (зул) with flame
  s += R(`<path d="M${CX} ${CY - 58} C${CX + 9} ${CY - 46} ${CX + 11} ${CY - 36} ${CX} ${CY - 28} C${CX - 11} ${CY - 36} ${CX - 9} ${CY - 46} ${CX} ${CY - 58} Z"/>
           <path d="M${CX - 20} ${CY - 26} Q${CX} ${CY - 4} ${CX + 20} ${CY - 26} Z"/>
           <rect x="${CX - 4}" y="${CY - 14}" width="8" height="14"/>
           <path d="M${CX - 16} ${CY + 6} Q${CX} ${CY - 6} ${CX + 16} ${CY + 6} Z"/>`);
  // open book
  s += R(`<path d="M${CX - 62} ${CY + 18} Q${CX - 30} ${CY + 6} ${CX} ${CY + 18} Q${CX + 30} ${CY + 6} ${CX + 62} ${CY + 18} L${CX + 62} ${CY + 56} Q${CX + 30} ${CY + 44} ${CX} ${CY + 56} Q${CX - 30} ${CY + 44} ${CX - 62} ${CY + 56} Z"/>`);
  let lines = '';
  for (const dy of [26, 34, 42]) {
    lines += `<path d="M${CX - 54} ${CY + dy} Q${CX - 28} ${CY + dy - 9} ${CX - 6} ${CY + dy + 1}"/><path d="M${CX + 54} ${CY + dy} Q${CX + 28} ${CY + dy - 9} ${CX + 6} ${CY + dy + 1}"/>`;
  }
  s += `<g fill="none" stroke="#5a3a0a" stroke-width="1.3">${lines}<path d="M${CX} ${CY + 18} L${CX} ${CY + 56}"/></g>`;
  return `<g id="sym">${s}</g>`;
}
function symSukhbaatar() {
  if (PORTRAIT) return `<g id="sym"><image href="PORTRAIT_HREF" x="${CX - 84}" y="${CY - 84}" width="168" height="168" preserveAspectRatio="xMidYMid slice"/></g>`;
  return `<g id="sym"><circle cx="${CX}" cy="${CY}" r="64" fill="none" stroke="#5a3a0a" stroke-width="1.6" stroke-dasharray="6 5"/>
    <text x="${CX}" y="${CY - 3}" text-anchor="middle" font-family="${SERIF}" font-weight="700" font-size="15" fill="#5a3a0a">Д.СҮХБААТАРЫН</text>
    <text x="${CX}" y="${CY + 16}" text-anchor="middle" font-family="${SERIF}" font-weight="700" font-size="15" fill="#5a3a0a">ХӨРӨГ</text></g>`;
}
function badge(symbol, name, fs, keepFalcon) {
  const top = keepFalcon ? 0 : BODY_TOP;
  const h = H - top;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W * SC}" height="${h * SC}" viewBox="0 ${top} ${W} ${h}">${defs}
    <image href="MEDAL_HREF" x="0" y="0" width="${W}" height="${H}"/>
    ${symbol ? `<g id="symc">` + '' + `</g>` + plate(symbol) : ''}${name ? bandAndName(name, fs) : ''}</svg>`;
}

const BADGES = [
  ['award_1_tamirchin.png', symAthlete, 'ТЭРГҮҮНИЙ ТАМИРЧИН', 15.5],
  ['award_2_suraltsagch.png', symScholar, 'ТЭРГҮҮНИЙ СУРАЛЦАГЧ', 15],
  ['award_3_sukhbaatar.png', symSukhbaatar, 'ЖАНЖИН СҮХБААТАР', 16.5],
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const href = 'data:image/png;base64,' + fs.readFileSync(MEDAL).toString('base64');
  const portraitHref = PORTRAIT ? 'data:image/png;base64,' + fs.readFileSync(PORTRAIT).toString('base64') : '';
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const render = async (svg, file) => {
    const m = svg.match(/width="(\d+)" height="(\d+)"/);
    await page.setViewportSize({ width: +m[1], height: +m[2] });
    await page.setContent(`<html><body style="margin:0;background:transparent">${svg.replace('MEDAL_HREF', href).replace('PORTRAIT_HREF', portraitHref)}</body></html>`);
    await page.evaluate(([cx, cy]) => {
      const g = document.getElementById('sym'); if (!g) return;
      const b = g.getBBox();
      g.setAttribute('transform', `translate(${cx - (b.x + b.width / 2)} ${cy - (b.y + b.height / 2)})`);
    }, [CX, CY]);
    await page.locator('svg').first().screenshot({ path: file, omitBackground: true });
  };
  for (const [f, sym, name, fs_] of BADGES) await render(badge(sym(), name, fs_, false), path.join(OUT, 'raw_' + f));
  await browser.close();
  console.log('ok');
})();
