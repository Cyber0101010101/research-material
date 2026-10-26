// Сонсогчийн хорооны ялгах тэмдэг, шагналын тэмдгийн загварын зургууд (SVG → PNG)
// Ажиллуулах: node src/insignia_figures.js   → images/*.png
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const OUT_DIR = path.join(__dirname, "..", "images");
const FONT = "Liberation Sans, DejaVu Sans, Arial, sans-serif";
const C = {
  navy: "#1B2A41", navy2: "#24395A", red: "#C8102E", blue: "#0B5394", gold: "#D4A017",
  ink: "#1B2A41", gray: "#5B6472", white: "#FFFFFF", bronze: "#A8662F",
};

// ---------- Нийтлэг тодорхойлолт (градиент) ----------
const DEFS = `
<defs>
  <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#F7E08A"/><stop offset=".45" stop-color="#D9A821"/><stop offset="1" stop-color="#9C7412"/>
  </linearGradient>
  <linearGradient id="silver" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="#C9CED6"/><stop offset="1" stop-color="#7D8590"/>
  </linearGradient>
  <linearGradient id="bronze" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#E9B48A"/><stop offset=".5" stop-color="#B87333"/><stop offset="1" stop-color="#7A4A1E"/>
  </linearGradient>
  <linearGradient id="cloth" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#26395A"/><stop offset="1" stop-color="#15223A"/>
  </linearGradient>
  <filter id="sh" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="1.5" dy="2" stdDeviation="1.6" flood-color="#000" flood-opacity=".28"/>
  </filter>
</defs>`;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const text = (x, y, s, o = {}) =>
  `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${o.size || 13}" font-weight="${o.bold ? 700 : 400}" fill="${o.fill || C.ink}" text-anchor="${o.anchor || "middle"}"${o.ls ? ` letter-spacing="${o.ls}"` : ""}>${esc(s)}</text>`;
const lines = (x, y, arr, o = {}) => arr.map((s, i) => text(x, y + i * (o.lh || 16), s, { ...o, bold: o.bold && i === 0 })).join("");

// ---------- Үндсэн дүрсүүд ----------
const diamond = (cx, cy, w = 26, h = 34, fill = "url(#gold)") =>
  `<polygon points="${cx},${cy - h / 2} ${cx + w / 2},${cy} ${cx},${cy + h / 2} ${cx - w / 2},${cy}" fill="${fill}" stroke="#6E5208" stroke-width="1"/>
   <polygon points="${cx},${cy - h / 2 + 6} ${cx + w / 2 - 5},${cy} ${cx},${cy}" fill="#FFF" opacity=".25"/>`;

// дээшээ харсан шеврон
const chevron = (cx, top, w = 80, h = 26, t = 11, fill = "url(#silver)") =>
  `<polygon points="${cx - w / 2},${top + h} ${cx},${top} ${cx + w / 2},${top + h} ${cx + w / 2},${top + h + t} ${cx},${top + t} ${cx - w / 2},${top + h + t}" fill="${fill}" stroke="#5E6670" stroke-width=".8"/>`;
// доод нуман тууз
const rocker = (cx, top, w = 80, d = 18, t = 10, fill = "url(#silver)") =>
  `<path d="M${cx - w / 2},${top} Q${cx},${top + 2 * d} ${cx + w / 2},${top} L${cx + w / 2},${top + t} Q${cx},${top + 2 * d + t} ${cx - w / 2},${top + t} Z" fill="${fill}" stroke="#5E6670" stroke-width=".8"/>`;

// лаврын мөчир (сүлд навч)
function branch(cx, cy, r, from, to, side, fill = "url(#gold)", n = 7, leaf = 7) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const a = ((from + ((to - from) * i) / (n - 1)) * Math.PI) / 180;
    const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
    const rot = (a * 180) / Math.PI + (side > 0 ? 60 : 120);
    s += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${leaf}" ry="${(leaf * 0.42).toFixed(1)}" transform="rotate(${rot.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${fill}" stroke="#6E5208" stroke-width=".5"/>`;
  }
  return s;
}
const wreath = (cx, cy, r, fill, n = 7, leaf = 7) =>
  branch(cx, cy, r, 100, 205, -1, fill, n, leaf) + branch(cx, cy, r, 80, -25, 1, fill, n, leaf);

// ---------- Мөрдөсний бүрээс (албан тушаалын ялгах тэмдэг) ----------
// o: { diamonds, command, wreath, chevrons, rockers, ncoDiamond }
function slide(x, y, o) {
  const W = 100, H = 250;
  const cx = x + W / 2;
  const body = `M${x},${y + 38} L${cx},${y} L${x + W},${y + 38} L${x + W},${y + H} L${x},${y + H} Z`;
  let s = `<g filter="url(#sh)"><path d="${body}" fill="url(#cloth)" stroke="#0E1626" stroke-width="1.2"/></g>`;
  if (o.command) {
    const ins = 6;
    s += `<path d="M${x + ins},${y + 38 + 2} L${cx},${y + ins + 2} L${x + W - ins},${y + 38 + 2} L${x + W - ins},${y + H - ins} L${x + ins},${y + H - ins} Z" fill="none" stroke="url(#gold)" stroke-width="4"/>`;
  }
  s += `<circle cx="${cx}" cy="${y + 27}" r="7.5" fill="url(${o.chevrons ? "#silver" : "#gold"})" stroke="#555" stroke-width=".6"/>`;
  if (o.diamonds) {
    const n = o.diamonds, gap = o.wreath ? 35 : 39;
    const top = y + 125 - ((n - 1) * gap) / 2 + (o.wreath ? -6 : 4);
    if (o.wreath) s += wreath(cx, top + (n - 1) * gap, 27, "url(#gold)", 6, 5.5);
    for (let i = 0; i < n; i++) s += diamond(cx, top + i * gap);
  }
  if (o.chevrons) {
    let t = y + 58;
    for (let i = 0; i < o.chevrons; i++) s += chevron(cx, t + i * 18);
    let after = t + (o.chevrons - 1) * 18 + 37 + 10;
    if (o.ncoDiamond) { s += diamond(cx, after + 14, 20, 26, "url(#silver)"); after += 34; }
    for (let i = 0; i < (o.rockers || 0); i++) s += rocker(cx, after + i * 17);
  }
  s += text(cx, y + H - 13, "ҮБХИС", { size: 11, bold: true, fill: o.chevrons ? "#C9CED6" : "#E2C060", ls: 1 });
  return s;
}

function slideRow(items, title, perRow = 4) {
  const slot = 160, padX = 10, top = 40, rowH = 250 + 74;
  const rows = Math.ceil(items.length / perRow);
  const width = padX * 2 + slot * perRow;
  const height = top + rows * rowH + 6;
  let s = "";
  items.forEach((it, i) => {
    const r = Math.floor(i / perRow), c = i % perRow;
    const inRow = Math.min(perRow, items.length - r * perRow);
    const offset = ((perRow - inRow) * slot) / 2;
    const x = padX + offset + c * slot + (slot - 100) / 2;
    const y = top + r * rowH;
    s += slide(x, y, it);
    s += lines(x + 50, y + 250 + 22, it.label, { size: 14, bold: true, lh: 17 });
  });
  if (title) s = text(width / 2, 24, title, { size: 16, bold: true, fill: C.navy }) + s;
  return { width, height, body: s };
}

// ---------- Курсийн ханцуйн тэмдэг ----------
function yearPatch(x, y, n) {
  const W = 110, H = 130, cx = x + W / 2;
  let s = `<g filter="url(#sh)"><path d="M${x},${y} H${x + W} V${y + H - 30} Q${cx},${y + H + 8} ${x},${y + H - 30} Z" fill="url(#cloth)" stroke="url(#gold)" stroke-width="3"/></g>`;
  // дээшээ харсан угольник (тоо = курс)
  for (let i = 0; i < n; i++) s += chevron(cx, y + 14 + i * 18, 70, 19, 8, "url(#gold)");
  return s;
}

// ---------- Жижүүрийн бугуйвч ----------
function armband(x, y, color, l1, l2) {
  const W = 300, H = 92;
  return `<g filter="url(#sh)"><rect x="${x}" y="${y}" width="${W}" height="${H}" rx="6" fill="${color}"/></g>
    <rect x="${x + 6}" y="${y + 6}" width="${W - 12}" height="${H - 12}" rx="4" fill="none" stroke="#FFF" stroke-width="1.5" stroke-dasharray="5 3" opacity=".8"/>
    <circle cx="${x + 46}" cy="${y + H / 2}" r="26" fill="#FFF" opacity=".95"/>
    ${diamond(x + 46, y + H / 2, 22, 30)}
    ${text(x + 180, y + 42, l1, { size: 21, bold: true, fill: "#FFF", ls: 1 })}
    ${text(x + 180, y + 66, l2, { size: 13, fill: "#FFF" })}`;
}

// ---------- Хорооны ханцуйн тэмдэг ----------
function regimentPatch(cx, y) {
  const W = 170, H = 205, x = cx - W / 2;
  const shield = `M${x},${y} H${x + W} V${y + 120} Q${x + W},${y + 175} ${cx},${y + H} Q${x},${y + 175} ${x},${y + 120} Z`;
  let s = `<g filter="url(#sh)"><path d="${shield}" fill="url(#cloth)"/></g>`;
  s += `<path d="${shield}" fill="none" stroke="url(#gold)" stroke-width="6"/>`;
  s += `<rect x="${x + 3}" y="${y + 3}" width="${W - 6}" height="34" fill="${C.red}"/>`;
  s += text(cx, y + 26, "ҮБХИС", { size: 19, bold: true, fill: "#FFF", ls: 2 });
  // загалмайлсан сэлэм
  const sword = (rot) => `<g transform="rotate(${rot} ${cx} ${y + 100})">
      <rect x="${cx - 3}" y="${y + 50}" width="6" height="78" fill="url(#silver)" stroke="#555" stroke-width=".6"/>
      <polygon points="${cx - 3},${y + 50} ${cx},${y + 42} ${cx + 3},${y + 50}" fill="url(#silver)"/>
      <rect x="${cx - 14}" y="${y + 126}" width="28" height="5" rx="2" fill="url(#gold)"/>
      <rect x="${cx - 3}" y="${y + 131}" width="6" height="14" fill="url(#gold)"/></g>`;
  s += sword(-32) + sword(32);
  // нээлттэй ном
  s += `<path d="M${cx},${y + 118} Q${cx - 22},${y + 108} ${cx - 44},${y + 114} L${cx - 44},${y + 146} Q${cx - 22},${y + 140} ${cx},${y + 150} Z" fill="#F5F1E6" stroke="url(#gold)" stroke-width="2"/>
        <path d="M${cx},${y + 118} Q${cx + 22},${y + 108} ${cx + 44},${y + 114} L${cx + 44},${y + 146} Q${cx + 22},${y + 140} ${cx},${y + 150} Z" fill="#F5F1E6" stroke="url(#gold)" stroke-width="2"/>`;
  s += text(cx, y + 172, "СОНСОГЧИЙН", { size: 11, bold: true, fill: "#E2C060" });
  s += text(cx, y + 186, "ХОРОО · 1921", { size: 11, bold: true, fill: "#E2C060" });
  return s;
}

// ---------- Ротын тэмдэг (нэрэмжит) ----------
let tpId = 0;
function companyPatch(cx, cy, ring, num, hero) {
  const R = 78, id = `tp${tpId++}`, id2 = `tq${tpId++}`;
  return `<defs>
      <path id="${id}" d="M${cx - 60},${cy} A60,60 0 0 1 ${cx + 60},${cy}"/>
      <path id="${id2}" d="M${cx - 66},${cy} A66,66 0 0 0 ${cx + 66},${cy}"/>
    </defs>
    <g filter="url(#sh)"><circle cx="${cx}" cy="${cy}" r="${R}" fill="${ring}"/></g>
    <circle cx="${cx}" cy="${cy}" r="${R - 3}" fill="none" stroke="url(#gold)" stroke-width="3"/>
    <circle cx="${cx}" cy="${cy}" r="48" fill="url(#cloth)" stroke="url(#gold)" stroke-width="3"/>
    <text font-family="${FONT}" font-size="12.5" font-weight="700" fill="#FFF" letter-spacing="1"><textPath href="#${id}" startOffset="50%" text-anchor="middle">СОНСОГЧИЙН ХОРОО</textPath></text>
    <text font-family="${FONT}" font-size="12.5" font-weight="700" fill="#FFF" letter-spacing=".5"><textPath href="#${id2}" startOffset="50%" text-anchor="middle">${esc(hero)}</textPath></text>
    ${text(cx, cy + 6, num, { size: 34, bold: true, fill: "#E9C34F" })}
    ${text(cx, cy + 26, "РОТ", { size: 12, bold: true, fill: "#E9C34F", ls: 2 })}`;
}

// ---------- Шагналын тэмдгийн дүрс ----------
const icon = {
  book: (cx, cy, s = 1) => `<g transform="translate(${cx} ${cy}) scale(${s})">
      <path d="M0,-12 Q-14,-19 -28,-14 L-28,14 Q-14,9 0,16 Z" fill="#FFF" stroke="#333" stroke-width="1.2"/>
      <path d="M0,-12 Q14,-19 28,-14 L28,14 Q14,9 0,16 Z" fill="#FFF" stroke="#333" stroke-width="1.2"/>
      <path d="M-22,-6 Q-12,-10 -4,-6 M-22,1 Q-12,-3 -4,1 M4,-6 Q12,-10 22,-6 M4,1 Q12,-3 22,1" stroke="#777" stroke-width="1.2" fill="none"/></g>`,
  sword: (cx, cy, s = 1) => `<g transform="translate(${cx} ${cy}) scale(${s})">
      <polygon points="-3.5,12 -3.5,-24 0,-31 3.5,-24 3.5,12" fill="url(#silver)" stroke="#444" stroke-width=".8"/>
      <rect x="-15" y="11" width="30" height="5" rx="2" fill="url(#gold)" stroke="#6E5208" stroke-width=".6"/>
      <rect x="-3" y="16" width="6" height="12" fill="#5A3A1A"/><circle cx="0" cy="30" r="3.5" fill="url(#gold)"/></g>`,
  flame: (cx, cy, s = 1) => `<g transform="translate(${cx} ${cy}) scale(${s})">
      <path d="M0,-28 C10,-14 20,-8 16,8 C13,20 4,26 0,26 C-4,26 -13,20 -16,8 C-19,-4 -8,-8 -6,-18 C-2,-12 0,-10 0,-28 Z" fill="#E8590C" stroke="#7A2E06" stroke-width="1"/>
      <path d="M0,-6 C6,2 9,8 7,14 C5,20 2,22 0,22 C-2,22 -6,19 -7,14 C-8,8 -3,4 0,-6 Z" fill="#FFD43B"/></g>`,
  shield: (cx, cy, s = 1) => `<g transform="translate(${cx} ${cy}) scale(${s})">
      <path d="M-20,-24 H20 V0 Q20,18 0,28 Q-20,18 -20,0 Z" fill="${C.navy}" stroke="url(#gold)" stroke-width="3"/>
      <path d="M-9,1 L-2,9 L11,-8" fill="none" stroke="#FFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g>`,
  flag: (cx, cy, s = 1) => `<g transform="translate(${cx} ${cy}) scale(${s})">
      <rect x="-27" y="-17" width="18" height="34" fill="${C.red}"/><rect x="-9" y="-17" width="18" height="34" fill="#0066B3"/><rect x="9" y="-17" width="18" height="34" fill="${C.red}"/>
      <rect x="-27" y="-17" width="54" height="34" fill="none" stroke="#333" stroke-width="1"/></g>`,
  pennant: (cx, cy, s = 1) => `<g transform="translate(${cx} ${cy}) scale(${s})">
      <rect x="-20" y="-28" width="3.5" height="58" fill="url(#gold)"/>
      <path d="M-16,-26 L26,-14 L-16,-2 Z" fill="${C.red}" stroke="#7A0A1B" stroke-width="1"/>
      <circle cx="-18" cy="-30" r="4" fill="url(#gold)"/></g>`,
  diamonds3: (cx, cy, s = 1) => `<g transform="translate(${cx} ${cy}) scale(${s})">
      ${diamond(-17, 6, 18, 24)}${diamond(17, 6, 18, 24)}${diamond(0, -10, 20, 28)}</g>`,
};

// Шагналын тэмдэг (хэлбэр: oval/round/bar)
function award(cx, cy, o) {
  const metal = `url(#${o.metal || "gold"})`;
  let s = "";
  if (o.shape === "bar") {
    s += `<g filter="url(#sh)"><rect x="${cx - 70}" y="${cy - 20}" width="140" height="40" rx="5" fill="${metal}"/></g>
          <rect x="${cx - 64}" y="${cy - 14}" width="128" height="28" rx="3" fill="${o.enamel || C.navy}"/>`;
    s += o.inner || "";
    return s;
  }
  const rx = o.shape === "round" ? 48 : 44, ry = 54;
  s += `<g filter="url(#sh)"><ellipse cx="${cx}" cy="${cy}" rx="${rx + 6}" ry="${ry + 6}" fill="${metal}"/></g>`;
  s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${o.enamel || C.navy}" stroke="#00000033" stroke-width="1"/>`;
  if (o.wreath) s += wreath(cx, cy + 2, rx - 6, metal, 7, 6.5);
  s += o.inner || "";
  if (o.caption) s += text(cx, cy + ry - 12, o.caption, { size: 9.5, bold: true, fill: o.capFill || "#F2D675", ls: .5 });
  return s;
}

// ---------- Дүрэмт хувцасны зүүх байршлын схем ----------
function uniform() {
  const W = 1060, H = 520, cx = 470;
  let s = text(W / 2, 26, "Өдөр тутмын/ёслолын хүрэм (урдаас харсан байдал)", { size: 15, bold: true, fill: C.navy });
  // хүрэм
  s += `<path d="M${cx - 95},70 L${cx - 40},60 L${cx},120 L${cx + 40},60 L${cx + 95},70 L${cx + 150},100 L${cx + 205},330 L${cx + 160},345 L${cx + 120},190 L${cx + 120},470 L${cx - 120},470 L${cx - 120},190 L${cx - 160},345 L${cx - 205},330 L${cx - 150},100 Z"
        fill="#3D5A3C" stroke="#1F3020" stroke-width="2"/>`;
  s += `<path d="M${cx - 40},60 L${cx},120 L${cx + 40},60" fill="none" stroke="#1F3020" stroke-width="2"/>`;
  s += `<line x1="${cx}" y1="120" x2="${cx}" y2="470" stroke="#1F3020" stroke-width="2"/>`;
  for (let i = 0; i < 4; i++) s += `<circle cx="${cx}" cy="${165 + i * 75}" r="5" fill="url(#gold)"/>`;
  // халаас
  s += `<rect x="${cx - 100}" y="175" width="70" height="55" rx="4" fill="none" stroke="#1F3020" stroke-width="1.5"/><rect x="${cx + 30}" y="175" width="70" height="55" rx="4" fill="none" stroke="#1F3020" stroke-width="1.5"/>`;
  // мөрдөсний бүрээс (2 мөрөнд)
  const ep = (x1, y1, x2, y2) => `<polygon points="${x1},${y1} ${x2},${y2} ${x2 + 4},${y2 + 22} ${x1 + 4},${y1 + 22}" fill="${C.navy}" stroke="url(#gold)" stroke-width="2"/>`;
  s += ep(cx - 140, 92, cx - 58, 72) + ep(cx + 58, 72, cx + 140, 92);
  s += `<polygon points="${cx - 116},${86} ${cx - 108},${92} ${cx - 116},${98} ${cx - 124},${92}" fill="url(#gold)"/><polygon points="${cx - 96},${81} ${cx - 88},${87} ${cx - 96},${93} ${cx - 104},${87}" fill="url(#gold)"/>`;
  // баруун энгэр (өмсөгчийн) = зурагт зүүн тал: шагналын тэмдэг
  s += `<ellipse cx="${cx - 82}" cy="158" rx="9" ry="11" fill="url(#gold)"/><ellipse cx="${cx - 58}" cy="158" rx="9" ry="11" fill="url(#silver)"/><rect x="${cx - 95}" y="135" width="50" height="8" fill="${C.navy}"/>`;
  // зүүн энгэр: төрийн шагнал, нэрийн тууз
  s += `<rect x="${cx + 40}" y="140" width="56" height="14" fill="#B22" stroke="#611" stroke-width="1"/><rect x="${cx + 42}" y="236" width="56" height="12" fill="#222"/>`;
  // ханцуй — өмсөгчийн зүүн ханцуй (зурагт баруун)
  s += `<path d="M${cx + 156},128 L${cx + 186},120 L${cx + 192},158 L${cx + 166},168 Z" fill="${C.navy}" stroke="url(#gold)" stroke-width="2"/>`; // хорооны тэмдэг
  s += `<rect x="${cx + 170}" y="186" width="34" height="26" fill="${C.red}" transform="rotate(-14 ${cx + 187} ${199})"/>`; // бугуйвч
  s += `<g transform="translate(${cx + 175} 262) rotate(-14)"><rect x="-14" y="-14" width="28" height="30" fill="${C.navy}"/>${chevron(0, -10, 20, 7, 3.5, "url(#gold)")}${chevron(0, -2, 20, 7, 3.5, "url(#gold)")}${chevron(0, 6, 20, 7, 3.5, "url(#gold)")}</g>`; // курсийн тэмдэг
  // өмсөгчийн баруун ханцуй (зурагт зүүн): ротын тэмдэг
  s += `<circle cx="${cx - 160}" cy="160" r="15" fill="${C.red}" stroke="url(#gold)" stroke-width="2"/>`;

  // тайлбар
  const call = (n, x1, y1, x2, y2, label, anchor) => `
    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.red}" stroke-width="1.4"/>
    <circle cx="${x2}" cy="${y2}" r="11" fill="${C.red}"/>${text(x2, y2 + 4.5, n, { size: 12, bold: true, fill: "#FFF" })}
    ${text(anchor === "start" ? x2 + 16 : x2 - 16, y2 + 4.5, label, { size: 12.5, anchor, fill: C.ink })}`;
  const R = 740, L = 235;
  s += call("1", cx + 100, 82, R, 70, "Албан тушаалын бүрээс (хоёр мөрөнд)", "start");
  s += call("2", cx - 70, 158, L, 110, "Шагналын тэмдэг (баруун энгэр)", "end");
  s += call("3", cx + 68, 147, R, 128, "Төрийн шагнал (зүүн энгэр)", "start");
  s += call("4", cx + 174, 144, R, 186, "Хорооны тэмдэг (зүүн ханцуй)", "start");
  s += call("5", cx + 190, 199, R, 244, "Жижүүрийн бугуйвч (жижүүрт)", "start");
  s += call("6", cx + 180, 262, R, 302, "Курсийн тэмдэг (зүүн ханцуй)", "start");
  s += call("7", cx - 160, 160, L, 200, "Ротын тэмдэг (баруун ханцуй)", "end");
  s += call("8", cx + 70, 242, R, 360, "Нэрийн тууз (зүүн халаас)", "start");
  s += text(W / 2, 505, "Тайлбар: «баруун», «зүүн» гэдэг нь хувцас өмссөн сонсогчийн талыг заана.", { size: 12, fill: C.gray });
  return { width: W, height: H, body: s };
}

// ---------- Зургуудыг угсрах ----------
function svgDoc({ width, height, body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${DEFS}<rect width="100%" height="100%" fill="#FFFFFF"/>${body}</svg>`;
}

const figures = {};

figures.fig_officer = slideRow([
  { diamonds: 1, command: true, label: ["Салааны дарга", "4-р курс"] },
  { diamonds: 2, label: ["Ротын орлогч,", "ротын штаб"] },
  { diamonds: 2, command: true, label: ["Ротын дарга", "4-р курс"] },
  { diamonds: 3, label: ["Батальоны орлогч,", "батальоны штаб"] },
  { diamonds: 3, command: true, label: ["Батальоны дарга", "4-р курс"] },
  { diamonds: 4, label: ["Хорооны хэлтсийн,", "зөвлөлийн дарга"] },
  { diamonds: 4, command: true, label: ["Хорооны орлогч,", "штабын дарга"] },
  { diamonds: 4, command: true, wreath: true, label: ["Хорооны ахлах", "сонсогч"] },
], "Сонсогч офицерын шугам (4-р курс) — алтлаг ромб");

figures.fig_nco = slideRow([
  { chevrons: 1, label: ["Багийн ахлагч", "2-р курс"] },
  { chevrons: 2, label: ["Тасгийн дарга", "3-р курс"] },
  { chevrons: 3, label: ["Салааны ахлагч", "3-р курс"] },
  { chevrons: 2, rockers: 1, label: ["Штабын туслах", "3-р курс"] },
  { chevrons: 3, rockers: 1, label: ["Ротын ахлах", "түрүүч"] },
  { chevrons: 3, rockers: 2, label: ["Батальоны ахлах", "түрүүч"] },
  { chevrons: 3, rockers: 2, ncoDiamond: true, label: ["Хорооны ахлах", "түрүүч"] },
], "Сонсогч түрүүчийн шугам (2–3-р курс) — мөнгөлөг шеврон");

figures.fig_year = (() => {
  let s = text(380, 24, "Курсийн ханцуйн тэмдэг (алтлаг өнцөгт туузын тоо = курс)", { size: 15, bold: true, fill: C.navy });
  [1, 2, 3, 4].forEach((n, i) => {
    const x = 60 + i * 175;
    s += yearPatch(x, 45, n);
    s += text(x + 55, 205, `${n}-р курс`, { size: 14, bold: true });
  });
  return { width: 760, height: 220, body: s };
})();

figures.fig_patches = (() => {
  let s = text(380, 24, "Хорооны ханцуйн тэмдэг ба нэрэмжит ротын тэмдэг", { size: 15, bold: true, fill: C.navy });
  s += regimentPatch(110, 50);
  s += lines(110, 280, ["Сонсогчийн хорооны", "тэмдэг (бүх сонсогч)"], { size: 12.5, bold: true });
  s += companyPatch(320, 150, C.red, "1", "БААТАР Ц.ОЛЗВОЙ");
  s += lines(320, 260, ["1-р рот · 1-р батальон", "(улаан хүрээ)"], { size: 12.5, bold: true });
  s += companyPatch(500, 150, "#0066B3", "5", "БААТАР Ж.ЛХАГВАСҮРЭН");
  s += lines(500, 260, ["5-р рот · 2-р батальон", "(хөх хүрээ)"], { size: 12.5, bold: true });
  s += companyPatch(680, 150, "#B8860B", "9", "БААТАР Д.ХАЯНХЯРВАА");
  s += lines(680, 260, ["9-р рот · 3-р батальон", "(шар хүрээ)"], { size: 12.5, bold: true });
  return { width: 780, height: 310, body: s };
})();

figures.fig_armband = (() => {
  let s = text(370, 24, "Жижүүрийн бугуйвч (зүүн ханцуйн дээд хэсэгт)", { size: 15, bold: true, fill: C.navy });
  s += armband(20, 45, C.red, "ЖИЖҮҮР", "Сонсогчийн хорооны");
  s += armband(400, 45, "#0066B3", "ЖИЖҮҮР", "Ротын");
  s += armband(210, 160, "#2F7D32", "ҮЙЛЧИЛГЭЭ", "Өдрийн үйлчилгээ, харуул");
  return { width: 740, height: 270, body: s };
})();

figures.fig_awards_list = (() => {
  let s = text(390, 24, "Семестрийн жагсаалтын тэмдэг (дараагийн семестрт зүүнэ)", { size: 15, bold: true, fill: C.navy });
  const items = [
    { x: 95, metal: "silver", enamel: "#0B5394", inner: icon.book(95, 108, 1), caption: "ЭРДЭМ", label: ["Эрдмийн тэмдэг", "(сурлагын жагсаалт)"] },
    { x: 290, metal: "silver", enamel: C.navy, inner: icon.sword(290, 106, 1.05), caption: "УДИРДАХ", label: ["Удирдах тэмдэг", "(захирагчийн жагсаалт)"] },
    { x: 485, metal: "silver", enamel: "#2F7D32", inner: icon.flame(485, 104, 1), caption: "ЧАДАЛ", label: ["Бие бялдрын тэмдэг", "(спортын жагсаалт)"] },
    { x: 680, metal: "gold", enamel: C.red, wreath: true, inner: icon.book(680, 92, .55) + icon.sword(664, 116, .55) + icon.flame(697, 117, .5), label: ["Захирлын жагсаалтын", "тэмдэг (гурвууланг хангасан)"] },
  ];
  items.forEach((it) => {
    s += award(it.x, 110, { metal: it.metal, enamel: it.enamel, inner: it.inner, caption: it.caption, wreath: it.wreath });
    s += lines(it.x, 200, it.label, { size: 12.5, bold: true });
  });
  return { width: 780, height: 240, body: s };
})();

figures.fig_awards_special = (() => {
  let s = text(390, 24, "Жилийн болон тусгай тэмдэг", { size: 15, bold: true, fill: C.navy });
  const row1 = [
    { x: 95, o: { metal: "gold", enamel: C.navy, inner: icon.diamonds3(95, 102, 1.1), caption: "УДИРДАГЧ" }, label: ["Шилдэг сонсогч", "удирдагчийн тэмдэг"] },
    { x: 290, o: { metal: "gold", enamel: "#F3F0E6", inner: icon.shield(290, 102, 1.1), caption: "НЭР ТӨР", capFill: C.navy }, label: ["Нэр төрийн", "тэмдэг"] },
    { x: 485, o: { metal: "gold", enamel: "#F3F0E6", inner: icon.flag(485, 100, 1), caption: "ЭХ ОРОН", capFill: C.navy }, label: ["Эх оронч сонсогчийн", "тэмдэг"] },
    { x: 680, o: { metal: "gold", enamel: C.navy, wreath: true, inner: diamond(668, 84, 14, 18) + diamond(692, 84, 14, 18) + diamond(668, 108, 14, 18) + diamond(692, 108, 14, 18) + text(680, 136, "№ 1", { size: 12, bold: true, fill: "#F2D675" }) }, label: ["Хорооны ахлах", "сонсогч асны тэмдэг"] },
  ];
  row1.forEach((it) => { s += award(it.x, 110, it.o); s += lines(it.x, 200, it.label, { size: 12.5, bold: true }); });
  // Удирдах албаны тэмдэг (bar)
  const bar = (cx, cy, n, lbl) => {
    let inner = "";
    for (let i = 0; i < n; i++) inner += diamond(cx - ((n - 1) * 22) / 2 + i * 22, cy, 13, 18);
    return award(cx, cy, { shape: "bar", metal: "gold", inner }) + lines(cx, cy + 42, lbl, { size: 12, bold: true });
  };
  s += text(390, 262, "Удирдах албаны тэмдэг (хашсан хамгийн дээд түвшнийг ромбын тоогоор)", { size: 13.5, bold: true, fill: C.steel || C.navy });
  s += bar(120, 300, 1, ["Салаа"]);
  s += bar(300, 300, 2, ["Рот"]);
  s += bar(480, 300, 3, ["Батальон"]);
  s += bar(660, 300, 4, ["Хороо"]);
  return { width: 780, height: 360, body: s };
})();

figures.fig_awards_unit = (() => {
  let s = text(390, 24, "Нэгжийн болон төгсөлтийн шагнал", { size: 15, bold: true, fill: C.navy });
  // Шилдэг ротын тэмдэг
  s += award(95, 115, { metal: "gold", enamel: C.navy, inner: icon.pennant(97, 108, 1.1), caption: "ШИЛДЭГ" });
  s += lines(95, 205, ["«Шилдэг рот»-ын", "ханцуйн тэмдэг"], { size: 12.5, bold: true });
  // Аваргын туг дээрх тууз
  s += `<g filter="url(#sh)"><path d="M215,60 H345 L330,92 L345,124 H215 Z" fill="${C.red}"/></g>`;
  s += `<path d="M215,60 H345 L330,92 L345,124 H215 Z" fill="none" stroke="url(#gold)" stroke-width="3"/>`;
  s += text(272, 88, "ШИЛДЭГ РОТ", { size: 13, bold: true, fill: "#FFF" });
  s += text(272, 106, "2027–2028 · 1-р улирал", { size: 10.5, fill: "#FFF" });
  s += lines(280, 160, ["Ротын туган дээрх", "хүндэтгэлийн тууз"], { size: 12.5, bold: true });
  // Хүндэт сэлэм
  s += `<g transform="translate(470 104) rotate(-90) scale(.8)">
      <polygon points="-60,-4 50,-4 62,0 50,4 -60,4" fill="url(#silver)" stroke="#444" stroke-width=".8"/>
      <rect x="-64" y="-15" width="6" height="30" rx="2" fill="url(#gold)"/>
      <rect x="-86" y="-4" width="22" height="8" rx="3" fill="#5A3A1A"/>
      <circle cx="-90" cy="0" r="6" fill="url(#gold)"/>
      <path d="M-90,6 q-6,14 4,26 M-90,6 q6,14 -4,26" stroke="${C.red}" stroke-width="3" fill="none"/></g>`;
  s += lines(470, 222, ["Хүндэт сэлэм", "(шилдэг төгсөгч)"], { size: 12.5, bold: true });
  // Төгсөлтийн гавьяаны тэмдэг
  const medal = (cx, metal, n) => `
    <polygon points="${cx - 14},40 ${cx + 14},40 ${cx + 8},80 ${cx - 8},80" fill="${C.red}"/>
    <rect x="${cx - 5}" y="40" width="10" height="40" fill="#0066B3"/>
    <g filter="url(#sh)"><circle cx="${cx}" cy="112" r="34" fill="url(#${metal})"/></g>
    <circle cx="${cx}" cy="112" r="27" fill="none" stroke="#00000044" stroke-width="1.5"/>
    ${text(cx, 120, n, { size: 22, bold: true, fill: "#3A2A05" })}`;
  s += medal(600, "gold", "I") + medal(680, "silver", "II") + medal(760, "bronze", "III");
  s += lines(680, 175, ["Төгсөлтийн гавьяаны тэмдэг", "(алт · мөнгө · хүрэл)"], { size: 12.5, bold: true });
  return { width: 810, height: 255, body: s };
})();

figures.fig_uniform = uniform();

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 2.5 });
  const sizes = {};
  for (const [name, fig] of Object.entries(figures)) {
    const svg = svgDoc(fig);
    fs.writeFileSync(path.join(OUT_DIR, `${name}.svg`), svg);
    await page.setViewportSize({ width: fig.width, height: fig.height });
    await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
    await page.screenshot({ path: path.join(OUT_DIR, `${name}.png`), clip: { x: 0, y: 0, width: fig.width, height: fig.height } });
    sizes[name] = { width: fig.width, height: fig.height };
    console.log("rendered", name);
  }
  fs.writeFileSync(path.join(OUT_DIR, "sizes.json"), JSON.stringify(sizes, null, 2));
  await browser.close();
})();
