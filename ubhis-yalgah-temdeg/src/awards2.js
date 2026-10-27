// Award badges built on the existing «Шилдэг төгсөгч» medal: same body (wreath, crossed sabres,
// studded disc, ҮБХИС book plaque, red enamel band). Only the centre symbol and the band name change.
// Usage: node awards2.js <outdir> <medal_cut.png>
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = process.argv[2];
const MEDAL = process.argv[3];
const W = 395, H = 634;           // medal cut-out size
const CX = 197.5, CY = 420;       // disc centre
const BODY_TOP = 240;             // body starts below the falcon + jump ring
const SC = 3;                     // render scale
const SERIF = "'Liberation Serif', 'Times New Roman', serif";
const FONT = "'Liberation Sans', Arial, sans-serif";
const INK = '#1c2740';

const defs = `<defs>
  <linearGradient id="brz" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#e4ddb0"/><stop offset="0.4" stop-color="#b3a874"/>
    <stop offset="0.75" stop-color="#7f7449"/><stop offset="1" stop-color="#4f4628"/>
  </linearGradient>
  <radialGradient id="plate" cx="0.42" cy="0.38" r="0.75">
    <stop offset="0" stop-color="#7d7a57"/><stop offset="0.65" stop-color="#5f5c40"/><stop offset="1" stop-color="#46432c"/>
  </radialGradient>
  <linearGradient id="red" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#8e2a23"/><stop offset="1" stop-color="#6a1b16"/>
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

const R = (inner) => `<g filter="url(#relief)" fill="url(#brz)" stroke="#2e2814" stroke-width="0.8">${inner}</g>`;
const pol = (a, r) => [CX + r * Math.cos(a * Math.PI / 180), CY + r * Math.sin(a * Math.PI / 180)];

function bandAndName(name, fs) {
  // red enamel annular sector (r 176–216, 38°–142°) and the raised name along the arc
  const [ax0, ay0] = pol(142, 216), [ax1, ay1] = pol(38, 216), [bx1, by1] = pol(38, 176), [bx0, by0] = pol(142, 176);
  const sector = `M${ax0} ${ay0} A216 216 0 0 0 ${ax1} ${ay1} L${bx1} ${by1} A176 176 0 0 1 ${bx0} ${by0} Z`;
  const [t0x, t0y] = pol(140, 194), [t1x, t1y] = pol(40, 194);
  return `<path d="${sector}" fill="url(#red)" filter="url(#grain)"/>
    <path id="nm" d="M${t0x} ${t0y} A194 194 0 0 0 ${t1x} ${t1y}" fill="none"/>
    ${R(`<text font-family="${SERIF}" font-weight="700" font-size="${fs}" letter-spacing="0.6" text-anchor="middle" stroke-width="0.4"><textPath href="#nm" startOffset="50%">${name}</textPath></text>`)}`;
}

function plate(symbol) {
  // new plate inside the inner ring (the original «1921» on the ring stays)
  return `<g clip-path="url(#disc)"><rect x="${CX - 90}" y="${CY - 90}" width="180" height="180" fill="url(#plate)" filter="url(#grain)"/>${symbol}` + `</g>`;
}

// ---------- centre symbols (drawn around the disc centre, inside r≈80, above y=488) ----------
function symAthlete() {
  // runner carrying a torch (raised relief)
  const P = (pts) => 'M' + pts.map(p => p.join(' ')).join(' L');
  const fig = `<g transform="translate(${CX - 74} ${CY - 44}) scale(0.56)" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <g stroke="#2e2814" stroke-width="23">
        <path d="${P([[112, 62], [96, 118]])}"/><path d="${P([[110, 70], [146, 56], [162, 28]])}" stroke-width="17"/>
        <path d="${P([[106, 74], [76, 90], [62, 118]])}" stroke-width="17"/><path d="${P([[96, 118], [138, 146], [134, 196]])}"/>
        <path d="${P([[96, 118], [70, 158], [30, 166]])}"/><path d="M156 34 L176 -6" stroke-width="12"/>
      </g>
      <g stroke="url(#brz)" stroke-width="19">
        <path d="${P([[112, 62], [96, 118]])}"/><path d="${P([[110, 70], [146, 56], [162, 28]])}" stroke-width="14"/>
        <path d="${P([[106, 74], [76, 90], [62, 118]])}" stroke-width="14"/><path d="${P([[96, 118], [138, 146], [134, 196]])}"/>
        <path d="${P([[96, 118], [70, 158], [30, 166]])}"/><path d="M156 34 L176 -6" stroke-width="9"/>
      </g>
      <circle cx="122" cy="36" r="15" fill="url(#brz)" stroke="#2e2814" stroke-width="2"/>
      <path d="M168 -8 l24 -4 l-8 18 z" fill="url(#brz)" stroke="#2e2814" stroke-width="2"/>
      <path d="M181 -56 C194 -40 199 -27 191 -15 C187 -9 177 -9 173 -15 C166 -27 171 -40 181 -56 Z" fill="url(#brz)" stroke="#2e2814" stroke-width="2"/>
    </g>`;
  return `<g filter="url(#relief)">${fig}</g>`;
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
  s += `<g fill="none" stroke="#3a3219" stroke-width="1.3">${lines}<path d="M${CX} ${CY + 18} L${CX} ${CY + 56}"/></g>`;
  return s;
}
function symSukhbaatar() {
  // placeholder until the bust portrait image is provided: the equestrian monument
  const L = (d, w) => `<path d="${d}" fill="none" stroke="url(#brz)" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const horse = 'M50 98 C70 90 110 92 128 88 C136 80 142 66 150 56 L152 45 L157 55 C166 58 178 70 186 82 C188 88 184 93 177 91 C170 87 162 81 157 83 C151 93 147 104 146 112 C146 120 142 124 138 127 C120 133 90 133 74 129 C60 127 50 119 48 108 C47 102 48 99 50 98 Z';
  const g = `<path d="${horse}"/>
    ${L('M50 101 Q34 120 40 152', 8)}${L('M62 122 L55 148 L61 173', 10)}${L('M77 127 L81 173', 10)}
    ${L('M133 125 L136 173', 10)}${L('M142 120 L158 140 L150 156', 10)}${L('M101 92 L114 110 L110 128', 11)}
    ${L('M100 93 L97 58', 16)}<circle cx="96" cy="44" r="9"/><path d="M85 41 Q96 27 107 41 Z"/>
    ${L('M100 62 L121 46 L134 25', 7)}${L('M96 67 L113 84 L150 82', 6)}
    <rect x="44" y="173" width="120" height="9" rx="2"/><rect x="34" y="182" width="140" height="12" rx="2"/>`;
  return `<g transform="translate(${CX - 74} ${CY - 84}) scale(0.7)">${R(g)}</g>`;
}

function badge(symbol, name, fs, keepFalcon) {
  const top = keepFalcon ? 0 : BODY_TOP;
  const h = H - top;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W * SC}" height="${h * SC}" viewBox="0 ${top} ${W} ${h}">${defs}
    <image href="MEDAL_HREF" x="0" y="0" width="${W}" height="${H}"/>
    ${symbol ? plate(symbol) : ''}${name ? bandAndName(name, fs) : ''}</svg>`;
}

const BADGES = [
  ['award_1_tamirchin.png', symAthlete, 'ТЭРГҮҮНИЙ ТАМИРЧИН', 16.5],
  ['award_2_suraltsagch.png', symScholar, 'ТЭРГҮҮНИЙ СУРАЛЦАГЧ', 16],
  ['award_3_sukhbaatar.png', symSukhbaatar, 'ЖАНЖИН СҮХБААТАР', 18],
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const href = 'data:image/png;base64,' + fs.readFileSync(MEDAL).toString('base64');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const render = async (svg, file) => {
    const m = svg.match(/width="(\d+)" height="(\d+)"/);
    await page.setViewportSize({ width: +m[1], height: +m[2] });
    await page.setContent(`<html><body style="margin:0;background:transparent">${svg.replace('MEDAL_HREF', href)}</body></html>`);
    await page.locator('svg').first().screenshot({ path: file, omitBackground: true });
  };
  for (const [f, sym, name, fs_] of BADGES) await render(badge(sym(), name, fs_, false), path.join(OUT, 'raw_' + f));
  await render(badge('', '', 0, true), path.join(OUT, 'raw_award_4_shildeg_tugsugch.png'));
  await browser.close();
  console.log('ok');
})();
