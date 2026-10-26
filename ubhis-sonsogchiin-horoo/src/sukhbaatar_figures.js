// Д.Сүхбаатар жанжны нэрэмжит шагналын тэмдэг, өргөмжлөлийн загвар (SVG → PNG)
// Ажиллуулах: node src/sukhbaatar_figures.js   → images/sb_*.png
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const OUT_DIR = path.join(__dirname, "..", "images");
const FONT = "Liberation Sans, DejaVu Sans, Arial, sans-serif";
const SERIF = "Liberation Serif, DejaVu Serif, Times New Roman, serif";
const C = { navy: "#1B2A41", red: "#B5121B", blue: "#0B4F9C", gold: "#D4A017", ink: "#1B2A41", gray: "#5B6472" };

const DEFS = `
<defs>
  <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#FBE9A0"/><stop offset=".45" stop-color="#DDAE2A"/><stop offset="1" stop-color="#9A7212"/>
  </linearGradient>
  <linearGradient id="goldH" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#A57B14"/><stop offset=".5" stop-color="#F6DE86"/><stop offset="1" stop-color="#A57B14"/>
  </linearGradient>
  <radialGradient id="goldFlat" cx=".4" cy=".35" r=".8">
    <stop offset="0" stop-color="#F8E39A"/><stop offset=".6" stop-color="#D8A934"/><stop offset="1" stop-color="#A47A16"/>
  </radialGradient>
  <linearGradient id="silver" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#8A929C"/><stop offset=".5" stop-color="#FFFFFF"/><stop offset="1" stop-color="#8A929C"/>
  </linearGradient>
  <radialGradient id="sky" cx=".5" cy=".4" r=".75">
    <stop offset="0" stop-color="#2F73C9"/><stop offset="1" stop-color="#0A3570"/>
  </radialGradient>
  <linearGradient id="enRed" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#D62A33"/><stop offset="1" stop-color="#8E0D14"/>
  </linearGradient>
  <filter id="sh" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="2" dy="3" stdDeviation="2.5" flood-color="#000" flood-opacity=".3"/>
  </filter>
  <pattern id="paper" width="6" height="6" patternUnits="userSpaceOnUse">
    <rect width="6" height="6" fill="#FFFDF6"/><circle cx="1" cy="1" r=".5" fill="#F1E8CF"/>
  </pattern>
</defs>`;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const text = (x, y, s, o = {}) =>
  `<text x="${x}" y="${y}" font-family="${o.serif ? SERIF : FONT}" font-size="${o.size || 13}" font-weight="${o.bold ? 700 : 400}" fill="${o.fill || C.ink}" text-anchor="${o.anchor || "middle"}"${o.ls ? ` letter-spacing="${o.ls}"` : ""}${o.italic ? ' font-style="italic"' : ""}>${esc(s)}</text>`;

// Алхан хээ (Монгол түлхүүр хээ) — хэвтээ тууз
function alhanH(x, y, len, h, stroke, sw = 1.6) {
  const u = h * 1.2;
  let d = "";
  for (let i = 0; i + u <= len + 0.1; i += u) {
    const a = x + i;
    d += `M${a},${y + h} V${y} H${a + u * 0.78} V${y + h * 0.7} H${a + u * 0.38} V${y + h * 0.35}`;
  }
  return `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="square"/>`;
}
const alhanV = (x, y, len, h, stroke, sw) =>
  `<g transform="rotate(90 ${x} ${y})">${alhanH(x, y - h, len, h, stroke, sw)}</g>`;

// ---------- Тэмдгийн хэлбэр (бамбай) ----------
function shieldPath(cx, top, w, side, bottom) {
  const x0 = cx - w / 2, x1 = cx + w / 2;
  return `M${x0},${top} H${x1} V${side} Q${x1},${bottom - 40} ${cx},${bottom} Q${x0},${bottom - 40} ${x0},${side} Z`;
}

// Сүлдний жад (зогсоосон), сэлэм, тууз
function sulde(cx, top, s = 1) {
  const g = (d) => d;
  return `<g transform="translate(${cx} ${top}) scale(${s})">
    <!-- голын ир -->
    <path d="M0,0 C7,14 9,30 6,46 L0,58 L-6,46 C-9,30 -7,14 0,0 Z" fill="url(#silver)" stroke="#4A525C" stroke-width="1"/>
    <path d="M0,6 L0,52" stroke="#6F7780" stroke-width="1"/>
    <!-- хажуугийн салаа -->
    <path d="M-6,50 C-20,46 -26,34 -24,20 C-18,30 -12,36 -4,40 Z" fill="url(#silver)" stroke="#4A525C" stroke-width="1"/>
    <path d="M6,50 C20,46 26,34 24,20 C18,30 12,36 4,40 Z" fill="url(#silver)" stroke="#4A525C" stroke-width="1"/>
    <!-- хүзүү, бөмбөлөг -->
    <rect x="-9" y="56" width="18" height="6" rx="2" fill="url(#gold)" stroke="#6E5208" stroke-width=".8"/>
    <circle cx="0" cy="70" r="9" fill="url(#gold)" stroke="#6E5208" stroke-width=".8"/>
    <!-- хар залаа -->
    ${Array.from({ length: 15 }, (_, i) => {
      const a = (-80 + i * (160 / 14)) * (Math.PI / 180);
      const L = 34 + (i % 2) * 6;
      const x2 = Math.sin(a) * L, y2 = 80 + Math.cos(a) * L;
      return `<path d="M0,78 Q${(x2 * 0.4).toFixed(1)},${(84 + L * 0.2).toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}" stroke="#111" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
    }).join("")}
    <!-- иш -->
    <rect x="-3.5" y="80" width="7" height="${120}" fill="#5A3A1A" stroke="#2E1D0C" stroke-width=".8"/>
  </g>`;
}
function saber(cx, cy, len, rot) {
  // муруй илд: ир + бариул
  return `<g transform="translate(${cx} ${cy}) rotate(${rot})">
    <path d="M0,-4 Q${len * 0.55},-14 ${len},-2 Q${len * 0.55},-6 0,4 Z" fill="url(#gold)" stroke="#6E5208" stroke-width=".9"/>
    <rect x="-6" y="-11" width="5" height="22" rx="2" fill="url(#gold)" stroke="#6E5208" stroke-width=".8"/>
    <rect x="-34" y="-3.5" width="28" height="7" rx="3" fill="#3B2410"/>
    <circle cx="-36" cy="0" r="5" fill="url(#gold)" stroke="#6E5208" stroke-width=".8"/>
  </g>`;
}
function scroll(cx, y, w, label, fontSize = 17) {
  const x0 = cx - w / 2, x1 = cx + w / 2;
  return `<path d="M${x0 - 22},${y + 6} L${x0},${y + 6} L${x0},${y + 34} L${x0 - 22},${y + 34} L${x0 - 12},${y + 20} Z" fill="#7E0A10"/>
    <path d="M${x1 + 22},${y + 6} L${x1},${y + 6} L${x1},${y + 34} L${x1 + 22},${y + 34} L${x1 + 12},${y + 20} Z" fill="#7E0A10"/>
    <path d="M${x0},${y} Q${cx},${y - 12} ${x1},${y} L${x1},${y + 30} Q${cx},${y + 18} ${x0},${y + 30} Z" fill="url(#enRed)" stroke="url(#gold)" stroke-width="2.2"/>
    <text font-family="${FONT}" font-size="${fontSize}" font-weight="700" fill="#FFF4C8" text-anchor="middle" letter-spacing="1.2" x="${cx}" y="${y + 20}">${esc(label)}</text>`;
}

// Шагналын тэмдэг — нүүр тал. (cx, y0) — өлгүүрийн дээд ирмэг; s — масштаб
let clipN = 0;
function badgeFront(cx, y0, s = 1) {
  const g = [];
  const clipId = `inner${clipN++}`;
  const T = (v) => v; // локал координат
  // өлгүүр (ҮБХИС бичээстэй хавтан)
  g.push(`<rect x="-62" y="0" width="124" height="34" rx="6" fill="url(#gold)" stroke="#6E5208" stroke-width="1"/>`);
  g.push(`<rect x="-56" y="5" width="112" height="24" rx="4" fill="${C.blue}"/>`);
  g.push(text(0, 23, "ҮБХИС", { size: 16, bold: true, fill: "#F6DE86", ls: 3 }));
  g.push(`<rect x="-10" y="33" width="20" height="14" rx="3" fill="url(#gold)" stroke="#6E5208" stroke-width=".8"/>`);
  // бамбай
  const outer = shieldPath(0, 46, 240, 250, 360);
  const band = shieldPath(0, 46 + 6, 228, 250, 352);
  const inner = shieldPath(0, 46 + 26, 192, 246, 326);
  g.push(`<g filter="url(#sh)"><path d="${outer}" fill="url(#gold)" stroke="#6E5208" stroke-width="1.2"/></g>`);
  g.push(`<path d="${band}" fill="url(#enRed)"/>`);
  // алхан хээ: дээд тал ба хоёр хажуу
  g.push(alhanH(-104, 58, 208, 11, "url(#goldH)", 1.8));
  g.push(alhanV(-112, 76, 168, 11, "#E9C55A", 1.8));
  g.push(alhanV(101, 76, 168, 11, "#E9C55A", 1.8));
  // доод муруй хэсэгт алтан цэг
  g.push(`<path d="M-105,252 Q-105,304 0,341 Q105,304 105,252" fill="none" stroke="#E9C55A" stroke-width="4.4" stroke-linecap="round" stroke-dasharray="0 11"/>`);
  g.push(`<clipPath id="${clipId}"><path d="${inner}"/></clipPath>`);
  g.push(`<path d="${inner}" fill="url(#sky)"/>`);
  // туяа
  g.push(`<g opacity=".28" clip-path="url(#${clipId})">${Array.from({ length: 24 }, (_, i) => {
    const a = (i * 15 * Math.PI) / 180;
    return `<line x1="0" y1="168" x2="${(Math.cos(a) * 130).toFixed(1)}" y2="${(168 + Math.sin(a) * 130).toFixed(1)}" stroke="#F6DE86" stroke-width="${i % 2 ? 1.2 : 2.4}"/>`;
  }).join("")}</g>`);
  // загалмайлсан илд + сүлд
  g.push(`<path d="${inner}" fill="none" stroke="url(#gold)" stroke-width="3"/>`);
  g.push(saber(-58, 238, 150, -52));
  g.push(`<g transform="scale(-1 1)">${saber(-58, 238, 150, -52)}</g>`);
  g.push(sulde(0, 82, 1));
  // тууз ба он
  g.push(scroll(0, 256, 176, "Д.СҮХБААТАР"));
  g.push(text(0, 314, "1921", { size: 15, bold: true, fill: "#F6DE86", ls: 2 }));
  return `<g transform="translate(${cx} ${y0}) scale(${s})">${g.join("")}</g>`;
}

// Ар тал
function badgeBack(cx, y0, s = 1) {
  const g = [];
  g.push(`<rect x="-62" y="0" width="124" height="34" rx="6" fill="url(#goldFlat)" stroke="#6E5208" stroke-width="1"/>`);
  g.push(`<rect x="-10" y="33" width="20" height="14" rx="3" fill="url(#goldFlat)" stroke="#6E5208" stroke-width=".8"/>`);
  const outer = shieldPath(0, 46, 240, 250, 360);
  g.push(`<g filter="url(#sh)"><path d="${outer}" fill="url(#goldFlat)" stroke="#6E5208" stroke-width="1.2"/></g>`);
  g.push(`<path d="${shieldPath(0, 56, 220, 248, 346)}" fill="none" stroke="#9A7212" stroke-width="1.2"/>`);
  const e = (y, t, size = 13, bold = true) => text(0, y, t, { size, bold, fill: "#5C430A", ls: .6 });
  g.push(e(98, "Д.СҮХБААТАР", 17));
  g.push(e(118, "ЖАНЖНЫ НЭРЭМЖИТ"));
  g.push(e(136, "ШАГНАЛ"));
  g.push(`<line x1="-60" y1="150" x2="60" y2="150" stroke="#8A6610" stroke-width="1.2"/>`);
  g.push(e(172, "ҮНДЭСНИЙ БАТЛАН", 11.5, false));
  g.push(e(187, "ХАМГААЛАХЫН", 11.5, false));
  g.push(e(202, "ИХ СУРГУУЛЬ", 11.5, false));
  g.push(e(236, "№ ______", 15));
  // зүү, түгжээ
  g.push(`<rect x="-4" y="252" width="8" height="70" rx="3" fill="url(#silver)" stroke="#555" stroke-width=".8"/>`);
  g.push(`<circle cx="0" cy="256" r="7" fill="url(#silver)" stroke="#555" stroke-width=".8"/>`);
  g.push(`<rect x="-9" y="318" width="18" height="12" rx="3" fill="#8A929C" stroke="#555" stroke-width=".8"/>`);
  return `<g transform="translate(${cx} ${y0}) scale(${s})">${g.join("")}</g>`;
}

// Хэмжээсийн шугам
function dimV(x, y1, y2, label) {
  return `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="${C.gray}" stroke-width="1"/>
    <line x1="${x - 6}" y1="${y1}" x2="${x + 6}" y2="${y1}" stroke="${C.gray}"/><line x1="${x - 6}" y1="${y2}" x2="${x + 6}" y2="${y2}" stroke="${C.gray}"/>
    <g transform="rotate(-90 ${x - 8} ${(y1 + y2) / 2})">${text(x - 8, (y1 + y2) / 2, label, { size: 13, fill: C.gray })}</g>`;
}
function dimH(y, x1, x2, label) {
  return `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${C.gray}" stroke-width="1"/>
    <line x1="${x1}" y1="${y - 6}" x2="${x1}" y2="${y + 6}" stroke="${C.gray}"/><line x1="${x2}" y1="${y - 6}" x2="${x2}" y2="${y + 6}" stroke="${C.gray}"/>
    ${text((x1 + x2) / 2, y + 18, label, { size: 13, fill: C.gray })}`;
}

// ---------- Зургууд ----------
const figures = {};

figures.sb_badge = (() => {
  let s = text(450, 30, "Д.Сүхбаатар жанжны нэрэмжит шагналын тэмдэг", { size: 19, bold: true, fill: C.navy });
  s += badgeFront(230, 60, 1);
  s += badgeBack(670, 60, 1);
  s += dimV(85, 60, 420, "62 мм");
  s += dimH(450, 110, 350, "50 мм");
  s += text(230, 500, "Нүүр тал", { size: 16, bold: true });
  s += text(670, 500, "Ар тал (сийлбэр, зүү)", { size: 16, bold: true });
  return { width: 900, height: 520, body: s };
})();

figures.sb_front = { width: 300, height: 380, body: badgeFront(150, 6, 1) };

figures.sb_mini = (() => {
  let s = text(400, 28, "Үндсэн тэмдэг ба өдөр тутмын жижиг тэмдэг (харьцаа хадгалсан)", { size: 17, bold: true, fill: C.navy });
  s += badgeFront(200, 50, 0.72);
  s += text(200, 335, "Үндсэн тэмдэг · 50 × 62 мм", { size: 14, bold: true });
  s += text(200, 354, "Ёслолын хувцас, ёслолын арга хэмжээнд", { size: 13, fill: C.gray });
  s += badgeFront(470, 170, 0.3);
  s += text(470, 335, "Жижиг тэмдэг · 20 × 25 мм", { size: 14, bold: true });
  s += text(470, 354, "Өдөр тутмын хувцсанд", { size: 13, fill: C.gray });
  // хайрцаг
  s += `<g filter="url(#sh)"><rect x="590" y="90" width="170" height="200" rx="10" fill="#14233D"/></g>
        <rect x="602" y="102" width="146" height="176" rx="6" fill="#1F3557" stroke="url(#gold)" stroke-width="1.5"/>`;
  s += badgeFront(675, 116, 0.38);
  s += text(675, 270, "Д.СҮХБААТАР", { size: 10, bold: true, fill: "#E9C55A", ls: 1 });
  s += text(675, 335, "Хадгалах хайрцаг", { size: 14, bold: true });
  s += text(675, 354, "Хар хөх хилэн, алтан хүрээ", { size: 13, fill: C.gray });
  return { width: 800, height: 375, body: s };
})();

figures.sb_certificate = (() => {
  const W = 1123, H = 794; // A4 хэвтээ (96 dpi)
  let s = `<rect x="0" y="0" width="${W}" height="${H}" fill="url(#paper)"/>`;
  // хүрээ
  s += `<rect x="24" y="24" width="${W - 48}" height="${H - 48}" fill="none" stroke="#B48A1C" stroke-width="3"/>`;
  s += `<rect x="38" y="38" width="${W - 76}" height="${H - 76}" fill="${C.blue}"/>`;
  s += `<rect x="58" y="58" width="${W - 116}" height="${H - 116}" fill="url(#paper)" stroke="#B48A1C" stroke-width="2"/>`;
  s += alhanH(44, 43, W - 88, 11, "#E9C55A", 1.8);
  s += alhanH(44, H - 54, W - 88, 11, "#E9C55A", 1.8);
  s += alhanV(42, 66, H - 132, 11, "#E9C55A", 1.8);
  s += alhanV(W - 53, 66, H - 132, 11, "#E9C55A", 1.8);
  s += `<rect x="70" y="70" width="${W - 140}" height="${H - 140}" fill="none" stroke="#D9BE6A" stroke-width="1"/>`;
  // тэмдэг
  s += badgeFront(W / 2, 82, 0.42);
  s += text(W / 2, 278, "ҮНДЭСНИЙ БАТЛАН ХАМГААЛАХЫН ИХ СУРГУУЛЬ", { size: 18, bold: true, fill: C.navy, ls: 1.5 });
  s += text(W / 2, 334, "ӨРГӨМЖЛӨЛ", { size: 46, bold: true, fill: C.red, ls: 6, serif: true });
  s += text(W / 2, 372, "Д.СҮХБААТАР ЖАНЖНЫ НЭРЭМЖИТ ШАГНАЛ", { size: 20, bold: true, fill: "#8A6610", ls: 2 });
  s += text(W / 2, 422, "Сонсогчийн хорооны ____ дугаар рот, ____ дугаар курсийн сонсогч", { size: 17, serif: true });
  s += `<line x1="${W / 2 - 260}" y1="468" x2="${W / 2 + 260}" y2="468" stroke="#8A6610" stroke-width="1.2"/>`;
  s += text(W / 2, 486, "(овог, нэр)", { size: 12, fill: C.gray, italic: true });
  s += text(W / 2, 522, "та сурлага, манлайлал, сахилга бат, эх оронч үйлсээрээ хамт олондоо онцгой үлгэр жишээ", { size: 17, serif: true });
  s += text(W / 2, 548, "үзүүлсэн тул Д.Сүхбаатар жанжны нэрэмжит шагналаар шагнав.", { size: 17, serif: true });
  // гарын үсэг, тамга, огноо
  s += text(240, 640, "ҮБХИС-ийн захирал", { size: 15, bold: true });
  s += `<line x1="150" y1="680" x2="330" y2="680" stroke="#333" stroke-width="1"/>`;
  s += text(240, 698, "(гарын үсэг)", { size: 11, fill: C.gray, italic: true });
  s += `<circle cx="${W / 2}" cy="650" r="44" fill="none" stroke="#9AA3B0" stroke-width="1.5" stroke-dasharray="5 4"/>`;
  s += text(W / 2, 655, "Тамга", { size: 13, fill: "#9AA3B0" });
  s += text(W - 240, 640, "Улаанбаатар хот", { size: 15, bold: true });
  s += text(W - 240, 666, "20__ оны 3 дугаар сарын 18", { size: 15 });
  s += text(W - 240, 692, "Шагналын № ____", { size: 15 });
  return { width: W, height: H, body: s };
})();

function svgDoc({ width, height, body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${DEFS}<rect width="100%" height="100%" fill="#FFFFFF"/>${body}</svg>`;
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 2.5 });
  const sizesPath = path.join(OUT_DIR, "sizes.json");
  const sizes = fs.existsSync(sizesPath) ? JSON.parse(fs.readFileSync(sizesPath, "utf8")) : {};
  for (const [name, fig] of Object.entries(figures)) {
    const svg = svgDoc(fig);
    fs.writeFileSync(path.join(OUT_DIR, `${name}.svg`), svg);
    await page.setViewportSize({ width: fig.width, height: fig.height });
    await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
    await page.screenshot({ path: path.join(OUT_DIR, `${name}.png`), clip: { x: 0, y: 0, width: fig.width, height: fig.height } });
    sizes[name] = { width: fig.width, height: fig.height };
    console.log("rendered", name);
  }
  fs.writeFileSync(sizesPath, JSON.stringify(sizes, null, 2));
  await browser.close();
})();
