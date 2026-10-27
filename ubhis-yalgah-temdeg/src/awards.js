// Award badge designs (antique-brass cast metal + enamel), rendered with Playwright.
// (1) Тэргүүний тамирчин  (2) Тэргүүний суралцагч  (3) Жанжин Сүхбаатарын хүндэт тэмдэг
// (4) Шилдэг төгсөгч шонхор тэмдэг — existing medal, shown from the photo cut-out.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = process.argv[2];
const MEDAL = process.argv[3]; // png cut-out of the existing medal
const FONT = "'Liberation Sans', Arial, sans-serif";
const SERIF = "'Liberation Serif', 'Times New Roman', serif";
const INK = '#1c2740';

const RED = 'url(#enRed)', BLUE = 'url(#enBlue)', SKY = 'url(#enSky)', WHITE = '#f4efe2';

function defs() {
  return `<defs>
    <linearGradient id="brass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e6d6a0"/><stop offset="0.35" stop-color="#bba15c"/>
      <stop offset="0.7" stop-color="#8d773c"/><stop offset="1" stop-color="#5e4c22"/>
    </linearGradient>
    <linearGradient id="enRed" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d42a2f"/><stop offset="1" stop-color="#9c1016"/></linearGradient>
    <linearGradient id="enBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a63b0"/><stop offset="1" stop-color="#173f7a"/></linearGradient>
    <linearGradient id="enSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9eef5"/><stop offset="1" stop-color="#b9c7da"/></linearGradient>
    <filter id="metal" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2.2" result="b"/>
      <feSpecularLighting in="b" surfaceScale="3.5" specularConstant="0.85" specularExponent="16" lighting-color="#fff4d6" result="sp">
        <fePointLight x="-250" y="-350" z="380"/>
      </feSpecularLighting>
      <feComposite in="sp" in2="SourceAlpha" operator="in" result="spi"/>
      <feComposite in="SourceGraphic" in2="spi" operator="arithmetic" k1="0" k2="1" k3="0.75" k4="0" result="lit"/>
      <feDropShadow in="lit" dx="1.2" dy="1.6" stdDeviation="1.2" flood-color="#2a1f08" flood-opacity="0.55"/>
    </filter>
    <filter id="drop" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="4" dy="7" stdDeviation="7" flood-color="#000" flood-opacity="0.28"/>
    </filter>
  </defs>`;
}
const M = (inner) => `<g filter="url(#metal)" fill="url(#brass)" stroke="#5a4719" stroke-width="1.2">${inner}</g>`;

// ---------- shared ornaments ----------
function laurelBranch(cx, cy, r, a0, a1, side, leafLen = 30) {
  // leaves along an arc from a0 to a1 (degrees, 0 = right, clockwise positive in SVG coords)
  let s = '';
  const N = 12, step = (a1 - a0) / N;
  s += `<path d="${arcPath(cx, cy, r, a0, a1)}" fill="none" stroke="url(#brass)" stroke-width="5"/>`;
  for (let i = 0; i <= N; i++) {
    const a = (a0 + i * step) * Math.PI / 180;
    const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
    const tang = (a * 180 / Math.PI) + (step > 0 ? 90 : -90);
    for (const k of [-1, 1]) {
      const rot = tang + k * 38;
      s += `<ellipse cx="${x}" cy="${y}" rx="${leafLen / 2}" ry="${leafLen / 4.2}" transform="rotate(${rot} ${x} ${y}) translate(${leafLen / 2} 0)"/>`;
    }
  }
  return s;
}
function arcPath(cx, cy, r, a0, a1) {
  const p = (a) => [cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0, sweep = a1 > a0 ? 1 : 0;
  return `M${x0} ${y0} A${r} ${r} 0 ${large} ${sweep} ${x1} ${y1}`;
}
let SCROLL_ID = 0;
function scroll(cx, y, w, h, text, fs = 25) {
  // ribbon banner with folded ends: red enamel inside a brass border
  const x0 = cx - w / 2, x1 = cx + w / 2;
  const tail = 34;
  const band = `M${x0} ${y} Q${cx} ${y + 26} ${x1} ${y} L${x1} ${y + h} Q${cx} ${y + h + 26} ${x0} ${y + h} Z`;
  const lt = `M${x0} ${y + 10} L${x0 - tail} ${y + 16} L${x0 - tail + 14} ${y + h / 2 + 12} L${x0 - tail} ${y + h + 18} L${x0} ${y + h + 6} Z`;
  const rt = `M${x1} ${y + 10} L${x1 + tail} ${y + 16} L${x1 + tail - 14} ${y + h / 2 + 12} L${x1 + tail} ${y + h + 18} L${x1} ${y + h + 6} Z`;
  const id = 'sc' + (++SCROLL_ID);
  return M(`<path d="${lt}"/><path d="${rt}"/><path d="${band}"/>`) +
    `<path d="M${x0 + 8} ${y + 7} Q${cx} ${y + 31} ${x1 - 8} ${y + 7} L${x1 - 8} ${y + h - 7} Q${cx} ${y + h + 19} ${x0 + 8} ${y + h - 7} Z" fill="${RED}"/>` +
    `<path id="${id}" d="M${x0 + 10} ${y + h / 2 + 10} Q${cx} ${y + h / 2 + 36} ${x1 - 10} ${y + h / 2 + 10}" fill="none"/>` +
    `<text font-family="${FONT}" font-weight="700" font-size="${fs}" letter-spacing="1.5" fill="#f3e3ad" text-anchor="middle"><textPath href="#${id}" startOffset="50%">${text}</textPath></text>`;
}
function arcText(cx, cy, r, a0, a1, text, fs, fill, id, ls = 3) {
  return `<path id="${id}" d="${arcPath(cx, cy, r, a0, a1)}" fill="none"/>` +
    `<text font-family="${SERIF}" font-weight="700" font-size="${fs}" letter-spacing="${ls}" fill="${fill}" text-anchor="middle"><textPath href="#${id}" startOffset="50%">${text}</textPath></text>`;
}
function plaque(cx, y, w, h, txt, fs = 22) {
  return M(`<rect x="${cx - w / 2}" y="${y}" width="${w}" height="${h}" rx="6"/>`) +
    `<text x="${cx}" y="${y + h / 2 + fs * 0.36}" text-anchor="middle" font-family="${SERIF}" font-weight="700" font-size="${fs}" letter-spacing="2" fill="#4a3a12">${txt}</text>`;
}
function rays(cx, cy, r0, r1, n, sw = 3) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    s += `<line x1="${cx + r0 * Math.cos(a)}" y1="${cy + r0 * Math.sin(a)}" x2="${cx + r1 * Math.cos(a)}" y2="${cy + r1 * Math.sin(a)}"/>`;
  }
  return `<g stroke="url(#brass)" stroke-width="${sw}" stroke-linecap="round">${s}</g>`;
}
function flame(x, y, s) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M0 -46 C14 -30 22 -16 18 0 C15 12 6 18 0 18 C-6 18 -15 12 -18 0 C-22 -16 -8 -24 0 -46 Z" fill="${RED}" stroke="#5a4719" stroke-width="2"/>
    <path d="M0 -22 C7 -13 10 -5 8 3 C6 9 3 11 0 11 C-3 11 -6 9 -8 3 C-10 -6 -4 -12 0 -22 Z" fill="#f2c64d"/>
  </g>`;
}

// ---------- (1) Тэргүүний тамирчин ----------
function athlete() {
  const cx = 300, cy = 300;
  let s = '';
  // wreath
  s += M(laurelBranch(cx, cy, 228, 100, 262, 'l', 40) + laurelBranch(cx, cy, 228, 80, -82, 'r', 40));
  // medallion
  s += M(`<circle cx="${cx}" cy="${cy}" r="196"/>`);
  s += `<circle cx="${cx}" cy="${cy}" r="178" fill="${BLUE}"/>`;
  s += M(`<circle cx="${cx}" cy="${cy}" r="178" fill="none" stroke-width="6" stroke="url(#brass)"/>`);
  // running athlete carrying a torch (pictogram style)
  const P = (pts) => 'M' + pts.map(p => p.join(' ')).join(' L');
  const fig = `<g transform="translate(${cx - 112} ${cy - 140}) scale(1.18)" stroke="url(#brass)" stroke-width="19" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <path d="${P([[112, 62], [96, 118]])}"/>
      <path d="${P([[110, 70], [146, 56], [162, 28]])}" stroke-width="14"/>
      <path d="${P([[106, 74], [76, 90], [62, 118]])}" stroke-width="14"/>
      <path d="${P([[96, 118], [138, 146], [134, 196]])}"/>
      <path d="${P([[96, 118], [70, 158], [30, 166]])}"/>
      <circle cx="122" cy="36" r="15" fill="url(#brass)" stroke="none"/>
      <path d="M156 34 L176 -6" stroke-width="9"/>
    </g>`;
  s += `<g filter="url(#metal)">${fig}</g>`;
  s += M(`<path d="M${cx + 84} ${cy - 150} l24 -4 l-8 18 z"/>`); // torch cup at the end of the handle
  s += flame(cx + 98, cy - 160, 0.85);
  // texts
  s += arcText(cx, cy, 158, 200, 340, 'ҮБХИС', 30, '#f3e3ad', 'a1top', 6);
  s += scroll(cx, 430, 380, 62, 'ТЭРГҮҮНИЙ ТАМИРЧИН', 24);
  return `<g filter="url(#drop)">${s}</g>`;
}

// ---------- (2) Тэргүүний суралцагч ----------
function scholar() {
  const cx = 300;
  let s = '';
  const shield = (i) => `M${110 + i} ${70 + i} H${490 - i} V${300 - i * 0.2} C${490 - i} ${420 - i} ${400 - i * 0.6} ${490 - i * 0.6} 300 ${530 - i} C${200 + i * 0.6} ${490 - i * 0.6} ${110 + i} ${420 - i} ${110 + i} ${300 - i * 0.2} Z`;
  // side oak/laurel branches behind the shield
  s += M(laurelBranch(300, 300, 222, 160, 255, 'l', 38) + laurelBranch(300, 300, 222, 20, -75, 'r', 38));
  s += M(`<path d="${shield(0)}"/>`);
  s += `<path d="${shield(16)}" fill="${BLUE}"/>`;
  s += M(`<path d="${shield(16)}" fill="none" stroke="url(#brass)" stroke-width="5"/>`);
  // top band
  s += `<path d="M126 86 H474 V140 H126 Z" fill="${RED}"/>`;
  s += M(`<path d="M126 140 H474" fill="none" stroke="url(#brass)" stroke-width="5"/>`);
  s += `<text x="${cx}" y="126" text-anchor="middle" font-family="${SERIF}" font-weight="700" font-size="36" letter-spacing="6" fill="#f3e3ad">ҮБХИС</text>`;
  // rays of knowledge + lamp (зул)
  s += `<g filter="url(#metal)">${rays(cx, 242, 46, 92, 16, 4)}</g>`;
  s += M(`<path d="M262 262 Q300 300 338 262 Z"/><rect x="292" y="282" width="16" height="30"/><path d="M270 330 Q300 306 330 330 Z"/>`);
  s += flame(cx, 252, 0.72);
  // open book
  const book = `<g transform="translate(${cx} 392)">
      <path d="M-120 -26 Q-60 -48 0 -26 Q60 -48 120 -26 L120 44 Q60 22 0 44 Q-60 22 -120 44 Z" />
    </g>`;
  s += M(book);
  s += `<g transform="translate(${cx} 392)">
      <path d="M-110 -20 Q-56 -38 -4 -18 L-4 36 Q-56 16 -110 34 Z" fill="${WHITE}"/>
      <path d="M110 -20 Q56 -38 4 -18 L4 36 Q56 16 110 34 Z" fill="${WHITE}"/>
      <g stroke="#9b8650" stroke-width="2.2" fill="none">
        ${[-6, 6, 18].map(dy => `<path d="M-96 ${dy - 6} Q-56 ${dy - 20} -18 ${dy - 4}"/><path d="M96 ${dy - 6} Q56 ${dy - 20} 18 ${dy - 4}"/>`).join('')}
      </g>
    </g>`;
  s += M(`<path d="M${cx - 3} 366 L${cx + 3} 366 L${cx + 3} 436 L${cx - 3} 436 Z"/>`);
  // quill pen crossing behind the book (right)
  s += scroll(cx, 470, 340, 60, 'ТЭРГҮҮНИЙ СУРАЛЦАГЧ', 24);
  return `<g filter="url(#drop)">${s}</g>`;
}

// ---------- (3) Жанжин Сүхбаатарын хүндэт тэмдэг ----------
function equestrian() {
  // Sükhbaatar monument silhouette (horse walking with a raised foreleg, rider raising his right hand), 200x200 box
  const L = (d, w) => `<path d="${d}" fill="none" stroke="url(#brass)" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const horse = 'M50 98 C70 90 110 92 128 88 C136 80 142 66 150 56 L152 45 L157 55 C166 58 178 70 186 82 C188 88 184 93 177 91 C170 87 162 81 157 83 C151 93 147 104 146 112 C146 120 142 124 138 127 C120 133 90 133 74 129 C60 127 50 119 48 108 C47 102 48 99 50 98 Z';
  return `
    <path d="${horse}"/>
    <path d="M140 84 C146 72 150 62 152 56" fill="none" stroke="#6b5627" stroke-width="2"/>
    ${L('M50 101 Q34 120 40 152', 8)}
    ${L('M62 122 L55 148 L61 173', 10)}
    ${L('M77 127 L81 173', 10)}
    ${L('M133 125 L136 173', 10)}
    ${L('M142 120 L158 140 L150 156', 10)}
    ${L('M101 92 L114 110 L110 128', 11)}
    ${L('M100 93 L97 58', 16)}
    <circle cx="96" cy="44" r="9"/>
    <path d="M85 41 Q96 27 107 41 Z"/>
    ${L('M100 62 L121 46 L134 25', 7)}
    ${L('M96 67 L113 84 L150 82', 6)}
    <rect x="44" y="173" width="120" height="9" rx="2"/>
    <rect x="34" y="182" width="140" height="12" rx="2"/>`;
}
function sukhbaatar() {
  const cx = 300, cy = 290;
  let s = '';
  // oak branches below
  s += M(laurelBranch(cx, cy, 234, 145, 250, 'l', 40) + laurelBranch(cx, cy, 234, 35, -70, 'r', 40));
  // outer rim with beads
  s += M(`<circle cx="${cx}" cy="${cy}" r="214"/>`);
  let beads = '';
  for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2; beads += `<circle cx="${cx + 203 * Math.cos(a)}" cy="${cy + 203 * Math.sin(a)}" r="3.4"/>`; }
  s += `<g fill="#f0e1a8" opacity="0.9">${beads}</g>`;
  // red enamel ring with lettering
  s += `<circle cx="${cx}" cy="${cy}" r="192" fill="${RED}"/>`;
  s += M(`<circle cx="${cx}" cy="${cy}" r="138"/>`);
  s += `<circle cx="${cx}" cy="${cy}" r="126" fill="${SKY}"/>`;
  s += arcText(cx, cy, 158, 178, 362, 'ЖАНЖИН Д.СҮХБААТАР', 27, '#f3e3ad', 'a3top', 2);
  s += arcText(cx, cy, 174, 125, 55, '1921', 30, '#f3e3ad', 'a3bot', 6);
  s += `<g fill="#f3e3ad"><circle cx="${cx + 165 * Math.cos(0.18)}" cy="${cy + 165 * Math.sin(0.18)}" r="5"/><circle cx="${cx + 165 * Math.cos(Math.PI - 0.18)}" cy="${cy + 165 * Math.sin(Math.PI - 0.18)}" r="5"/></g>`;
  // monument
  s += `<g transform="translate(${cx - 112} ${cy - 120}) scale(1.12)">${M(equestrian())}</g>`;
  s += scroll(cx, 470, 300, 58, 'ХҮНДЭТ ТЭМДЭГ', 26);
  return `<g filter="url(#drop)">${s}</g>`;
}

function badgeSvg(inner, w = 600, h = 600) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 600 600">${defs()}${inner}</svg>`;
}

function sheet(medalHref) {
  const w = 2400, h = 1000;
  const items = [
    ['1. Тэргүүний тамирчин тэмдэг', 'бамбартай гүйгч · ялалтын сүлд навч · Ø 40 мм', athlete()],
    ['2. Тэргүүний суралцагч тэмдэг', 'мэдлэгийн зул · нээлттэй ном · бамбай · 36 × 44 мм', scholar()],
    ['3. Жанжин Сүхбаатарын хүндэт тэмдэг', 'Сүхбаатарын морьт хөшөө · 1921 · Ø 44 мм', sukhbaatar()],
  ];
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs()}<rect width="${w}" height="${h}" fill="#fff"/>`;
  s += `<text x="${w / 2}" y="64" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="44" fill="${INK}">Шагналын тэмдэг</text>`;
  s += `<text x="${w / 2}" y="112" text-anchor="middle" font-family="${FONT}" font-size="27" fill="#55607a">Хуучирсан гуулин өнгийн цутгамал металл, улаан ба хөх паалан · одоогийн «Шилдэг төгсөгч» медальтай ижил хийц</text>`;
  items.forEach(([t, sub, g], i) => {
    const cx = 300 + i * 600;
    s += `<g transform="translate(${cx - 270} 150) scale(0.9)">${g}</g>`;
    s += `<text x="${cx}" y="760" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="30" fill="${INK}">${t}</text>`;
    s += `<text x="${cx}" y="800" text-anchor="middle" font-family="${FONT}" font-size="24" fill="#55607a">${sub}</text>`;
  });
  // (4) existing medal photo
  const mx = 2100;
  s += `<image href="${medalHref}" x="${mx - 175}" y="150" width="350" height="${350 * 634 / 395}" preserveAspectRatio="xMidYMid meet" filter="url(#drop)"/>`;
  s += `<text x="${mx}" y="760" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="30" fill="${INK}">4. Шилдэг төгсөгч шонхор тэмдэг</text>`;
  s += `<text x="${mx}" y="800" text-anchor="middle" font-family="${FONT}" font-size="24" fill="#55607a">одоогийн загвар — хэвээр</text>`;
  s += `<rect x="60" y="860" width="${w - 120}" height="104" rx="14" fill="#f4f6fa" stroke="#d5dae4"/>`;
  s += `<text x="100" y="905" font-family="${FONT}" font-size="25" fill="${INK}"><tspan font-weight="700">Эрэмбэ:</tspan> 4 → 3 → 2, 1 (дээрээс). Шилдэг төгсөгч шонхор тэмдэг нь шонхортой өлгүүртэй цорын ганц тэмдэг; бусад нь өлгүүргүй, ар талдаа зүүлттэй энгэрийн тэмдэг.</text>`;
  s += `<text x="100" y="943" font-family="${FONT}" font-size="25" fill="${INK}">Төрийн одон, медальтай андуурагдахгүйн тулд таван хошуут од, хөрөг, туузан өлгүүр хэрэглээгүй. Баруун энгэрт зүүнэ.</text>`;
  return s + '</svg>';
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const medalHref = 'data:image/png;base64,' + fs.readFileSync(MEDAL).toString('base64');
  const jobs = {
    'award_1_tamirchin.png': badgeSvg(athlete()),
    'award_2_suraltsagch.png': badgeSvg(scholar()),
    'award_3_sukhbaatar.png': badgeSvg(sukhbaatar()),
    'awards_sheet.png': sheet(medalHref),
  };
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const [name, svg] of Object.entries(jobs)) {
    const m = svg.match(/width="(\d+)" height="(\d+)"/);
    await page.setViewportSize({ width: +m[1], height: +m[2] });
    await page.setContent(`<html><body style="margin:0;background:#fff">${svg}</body></html>`);
    await page.locator('svg').first().screenshot({ path: path.join(OUT, name), omitBackground: name !== 'awards_sheet.png' });
    console.log(name);
  }
  await browser.close();
})();
