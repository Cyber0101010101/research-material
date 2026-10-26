// CSBC101 "Мэргэжлийн удиртгал" — 8 лекцийн PPT үүсгэгч
// Ашиглах: SKILL_DIR=<pptx skill dir> node build_pptx.js <out_dir>
const pptxgen = require("pptxgenjs");
const path = require("path");
const fs = require("fs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const Md = require("react-icons/md");
// Theme-ийн өнгийг файлд бичих туслах скрипт (SKILL_DIR орчны хувьсагчаар заана).
// Байхгүй бол слайдууд Office-ийн стандарт өнгөөр гарна.
const applyTheme = process.env.SKILL_DIR
  ? require(path.join(process.env.SKILL_DIR, "scripts/apply_theme.js")).applyTheme
  : async () => console.warn("SKILL_DIR тохируулаагүй тул theme-ийн өнгө бичигдсэнгүй");

const LECTURES = require("./lectures");
const PRACTICES = require("./practices_meta");
const OUT = process.argv[2] || "out";
fs.mkdirSync(OUT, { recursive: true });

const TEACHER = "Дэслэгч Ч.Энхбаатар";
const DEPT = "ҮБХИС · ЦНС · Кибер аюулгүй байдлын тэнхим";

const THEME = {
  name: "CSBC101 Signal",
  headFontFace: "Arial",
  bodyFontFace: "Arial",
  colors: {
    dk1: "17262A", // үндсэн текст
    lt1: "FFFFFF",
    dk2: "0F3B3F", // гүн ногоон-хөх (давамгай)
    lt2: "EAF4F1", // цайвар өнгө
    accent1: "12A37F", // дохионы ногоон
    accent2: "E89B3C", // хув шар (онцлох)
    accent3: "2E6F73",
    accent4: "8FD3C1",
    accent5: "C4553B",
    accent6: "5B6B6E", // бүдэг текст
    hlink: "12A37F",
    folHlink: "2E6F73",
  },
};
const HEX = THEME.colors;
const W = 13.333, H = 7.5, MX = 0.6, CW = W - 2 * MX;

// ── Icon helper ─────────────────────────────────────────────
const iconCache = {};
async function icon(name, color, size = 256) {
  const key = name + color + size;
  if (iconCache[key]) return iconCache[key];
  const Comp = Md[name] || Md.MdCircle;
  if (!Md[name]) console.warn("Icon missing:", name);
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color: "#" + color, size: String(size) }));
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return (iconCache[key] = "image/png;base64," + buf.toString("base64"));
}

async function iconCircle(slide, C, name, x, y, d, fill = C.accent1, iconColor = HEX.lt1, objectName = "icon") {
  slide.addShape("ellipse", { x, y, w: d, h: d, fill: { color: fill }, line: { type: "none" }, objectName: objectName + "-bg" });
  const pad = d * 0.22;
  slide.addImage({ data: await icon(name, iconColor), x: x + pad, y: y + pad, w: d - 2 * pad, h: d - 2 * pad, altText: "", objectName });
}

// Текстийн өндрийг ойролцоогоор тооцох (Arial, word-wrap)
function estH(text, w, pt, bold) {
  const cw = pt * (bold ? 0.58 : 0.53) / 72; // нэг тэмдэгтийн дундаж өргөн (инч)
  const per = Math.max(1, Math.floor(w / cw));
  let lines = 1, cur = 0;
  for (const word of text.split(/\s+/)) {
    const L = word.length;
    if (cur === 0) cur = L;
    else if (cur + 1 + L <= per) cur += 1 + L;
    else { lines++; cur = L; }
  }
  return lines * pt * 1.2 / 72 + 0.05;
}

// Хамгийн урт үг мөрөнд багтахаар фонтын хэмжээг багасгах
function fitPt(text, w, pt, bold, min = 12) {
  const longest = Math.max(...text.split(/\s+/).map((x) => x.length));
  while (pt > min && longest * pt * (bold ? 0.6 : 0.55) / 72 > w) pt -= 1;
  return pt;
}

function txt(slide, text, opts) {
  slide.addText(text, { isTextBox: true, margin: 0, valign: "top", ...opts });
}

// ── Build one lecture ───────────────────────────────────────
async function buildLecture(L) {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  pres.author = TEACHER;
  pres.company = "ҮБХИС";
  pres.subject = "CSBC101 Мэргэжлийн удиртгал";
  pres.title = `Лекц ${L.num}. ${L.title}`;
  const C = pres.SchemeColor;

  const footer = { text: "CSBC101 · Мэргэжлийн удиртгал", options: { x: MX, y: 7.0, w: 6, h: 0.3, fontSize: 10, color: C.accent6, margin: 0 } };
  const slideNum = { x: W - MX - 1, y: 7.0, w: 1, h: 0.3, fontSize: 10, color: C.accent6, align: "right", margin: 0 };

  pres.defineSlideMaster({
    title: "TITLE",
    background: { color: C.text2 },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: MX + 0.1, y: 2.35, w: 8.6, h: 2.1, fontSize: 36, bold: true, color: C.background1, valign: "top", align: "left", margin: 0 }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: MX + 0.1, y: 4.65, w: 8.6, h: 0.5, fontSize: 18, color: C.accent4, margin: 0 }, text: "" } },
    ],
  });
  pres.defineSlideMaster({
    title: "CONTENT",
    background: { color: C.background1 },
    margin: [0.5, 0.6, 0.6, 0.6],
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: MX, y: 0.4, w: CW, h: 0.75, fontSize: 28, bold: true, color: C.text2, valign: "middle", align: "left", margin: 0 }, text: "" } },
      { text: footer },
    ],
    slideNumber: slideNum,
  });
  pres.defineSlideMaster({
    title: "DARK",
    background: { color: C.text2 },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: MX, y: 0.4, w: CW, h: 0.75, fontSize: 28, bold: true, color: C.background1, valign: "middle", align: "left", margin: 0 }, text: "" } },
      { text: { text: "CSBC101 · Мэргэжлийн удиртгал", options: { ...footer.options, color: C.accent4 } } },
    ],
    slideNumber: { ...slideNum, color: C.accent4 },
  });

  pres.defineSlideMaster({
    title: "DARK_BLANK",
    background: { color: C.text2 },
    objects: [{ text: { text: "CSBC101 · Мэргэжлийн удиртгал", options: { ...footer.options, color: C.accent4 } } }],
    slideNumber: { ...slideNum, color: C.accent4 },
  });

  const n2 = String(L.num).padStart(2, "0");

  // 1. Нүүр
  pres.addSection({ title: "Нүүр" });
  {
    const s = pres.addSlide({ masterName: "TITLE", sectionTitle: "Нүүр" });
    txt(s, `> ЛЕКЦ_${n2}`, { x: MX + 0.1, y: 1.55, w: 6, h: 0.5, fontSize: 20, fontFace: "Courier New", bold: true, color: C.accent1, objectName: "kicker" });
    s.addText(L.title, { placeholder: "title" });
    s.addText("CSBC101 · Мэргэжлийн удиртгал · I курс", { placeholder: "body" });
    txt(s, `${TEACHER}\n${DEPT}`, { x: MX + 0.1, y: 5.85, w: 8.5, h: 0.75, fontSize: 14, color: C.background1, objectName: "teacher" });
    // мотив: том дугуй доторх бамбай
    s.addShape("ellipse", { x: 9.55, y: 1.85, w: 3.2, h: 3.2, fill: { color: C.accent3, transparency: 40 }, line: { color: C.accent1, width: 2 }, objectName: "motif-ring" });
    s.addImage({ data: await icon("MdSecurity", HEX.accent1), x: 10.3, y: 2.6, w: 1.7, h: 1.7, altText: "", objectName: "motif-icon" });
    txt(s, `${L.num} / 8`, { x: 9.55, y: 5.3, w: 3.2, h: 0.5, fontSize: 18, fontFace: "Courier New", color: C.accent4, align: "center", objectName: "progress" });
    s.addNotes(`Лекц ${L.num}. ${L.title}. Хичээл 2 цаг (90 минут). Сонсогчдод лекцийн зорилго, дадлагатай уялдааг танилцуулна.`);
  }

  // 2. Зорилго ба агуулга
  pres.addSection({ title: "Зорилго" });
  {
    const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Зорилго" });
    s.addText("Лекцийн зорилго ба агуулга", { placeholder: "title" });
    // CLO chips
    let cx = MX;
    L.clos.forEach((c, i) => {
      s.addShape("roundRect", { x: cx, y: 1.3, w: 1.15, h: 0.36, rectRadius: 0.18, fill: { color: C.accent1 }, line: { type: "none" }, objectName: `clo-chip-${i}` });
      txt(s, c, { x: cx, y: 1.3, w: 1.15, h: 0.36, fontSize: 12, bold: true, color: C.background1, align: "center", valign: "middle", objectName: `clo-text-${i}` });
      cx += 1.3;
    });
    txt(s, "хичээлийн суралцахуйн үр дүнд хамаарна", { x: cx + 0.05, y: 1.3, w: 5, h: 0.36, fontSize: 12, italic: true, color: C.accent6, valign: "middle", objectName: "clo-label" });
    // goals
    txt(s, "Энэ лекцийн дараа та:", { x: MX, y: 2.0, w: 6, h: 0.4, fontSize: 18, bold: true, color: C.text2, objectName: "goals-h" });
    for (let i = 0; i < L.goals.length; i++) {
      const y = 2.6 + i * 1.25;
      await iconCircle(s, C, "MdCheck", MX, y, 0.5, C.accent1, HEX.lt1, `goal-icon-${i}`);
      txt(s, L.goals[i], { x: MX + 0.7, y: y - 0.02, w: 5.3, h: 1.05, fontSize: 16, color: C.text1, objectName: `goal-${i}` });
    }
    // agenda panel
    const px = 7.0, pw = W - MX - px;
    s.addShape("roundRect", { x: px, y: 2.0, w: pw, h: 4.7, rectRadius: 0.12, fill: { color: C.background2 }, line: { type: "none" }, objectName: "agenda-panel" });
    txt(s, "Агуулга", { x: px + 0.35, y: 2.25, w: pw - 0.7, h: 0.4, fontSize: 18, bold: true, color: C.text2, objectName: "agenda-h" });
    const step = Math.min(0.78, 3.7 / L.agenda.length);
    L.agenda.forEach((a, i) => {
      const y = 2.85 + i * step;
      txt(s, String(i + 1).padStart(2, "0"), { x: px + 0.35, y, w: 0.6, h: 0.45, fontSize: 18, bold: true, fontFace: "Courier New", color: C.accent1, objectName: `agenda-n-${i}` });
      txt(s, a, { x: px + 1.0, y: y + 0.02, w: pw - 1.3, h: 0.6, fontSize: 16, color: C.text1, objectName: `agenda-${i}` });
    });
    s.addNotes("Лекцийн зорилго, суралцахуйн үр дүнг (CLO) танилцуулж, агуулгын дарааллыг тайлбарлана.");
  }

  // 3. Агуулгын слайдууд
  pres.addSection({ title: "Агуулга" });
  for (const sd of L.slides) {
    await renderSlide(pres, C, sd);
  }

  // 4. Гол санаа
  pres.addSection({ title: "Дүгнэлт" });
  {
    const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Дүгнэлт" });
    s.addText("Гол санаа", { placeholder: "title" });
    const n = L.takeaways.length, gap = 0.4, w = (CW - gap * (n - 1)) / n;
    L.takeaways.forEach((t, i) => {
      const x = MX + i * (w + gap);
      s.addShape("roundRect", { x, y: 1.6, w, h: 4.9, rectRadius: 0.12, fill: { color: C.background2 }, line: { type: "none" }, objectName: `take-card-${i}` });
      txt(s, String(i + 1).padStart(2, "0"), { x: x + 0.4, y: 1.95, w: w - 0.8, h: 1.0, fontSize: 48, bold: true, fontFace: "Courier New", color: C.accent1, objectName: `take-n-${i}` });
      txt(s, t, { x: x + 0.4, y: 3.2, w: w - 0.8, h: 3.0, fontSize: 18, color: C.text1, objectName: `take-${i}` });
    });
    s.addNotes("Лекцийн гол санааг сонсогчдоор давтуулж хэлүүлнэ: 'Өнөөдөр сурсан хамгийн чухал нэг зүйл юу вэ?'");
  }

  // 5. Бие даалт, дараагийн дадлага
  {
    const s = pres.addSlide({ masterName: "DARK", sectionTitle: "Дүгнэлт" });
    s.addText("Бие даалт ба дараагийн дадлага", { placeholder: "title" });
    // left: homework
    await iconCircle(s, C, "MdAssignment", MX, 1.55, 0.6, C.accent1, HEX.lt1, "hw-icon");
    txt(s, "Бие даалтын даалгавар", { x: MX + 0.8, y: 1.6, w: 5.5, h: 0.5, fontSize: 20, bold: true, color: C.background1, valign: "middle", objectName: "hw-h" });
    s.addText(L.homework.map((h, i) => ({ text: h, options: { bullet: true, breakLine: i < L.homework.length - 1, paraSpaceAfter: 10 } })),
      { isTextBox: true, x: MX, y: 2.35, w: 6.0, h: 2.6, fontSize: 16, color: C.background1, valign: "top", margin: 0, objectName: "hw-list" });
    // right: next practice card
    const px = 7.2, pw = W - MX - px;
    s.addShape("roundRect", { x: px, y: 1.55, w: pw, h: 3.4, rectRadius: 0.12, fill: { color: C.accent3 }, line: { type: "none" }, objectName: "next-card" });
    txt(s, `> ДАДЛАГА_${n2}`, { x: px + 0.4, y: 1.85, w: pw - 0.8, h: 0.45, fontSize: 18, bold: true, fontFace: "Courier New", color: C.accent4, objectName: "next-kicker" });
    txt(s, PRACTICES[L.num - 1], { x: px + 0.4, y: 2.45, w: pw - 0.8, h: 1.5, fontSize: 20, bold: true, color: C.background1, objectName: "next-title" });
    txt(s, "4 цаг · лаборатори · дэлгэрэнгүй төлөвлөгөөг дадлагын гарын авлагаас үзнэ", { x: px + 0.4, y: 4.05, w: pw - 0.8, h: 0.7, fontSize: 14, color: C.accent4, objectName: "next-meta" });
    // sources
    txt(s, "Эх сурвалж", { x: MX, y: 5.3, w: 4, h: 0.35, fontSize: 14, bold: true, color: C.accent4, objectName: "src-h" });
    txt(s, L.sources.join("   ·   "), { x: MX, y: 5.7, w: CW, h: 1.0, fontSize: 12, color: C.background1, objectName: "src" });
    s.addNotes("Бие даалтын шаардлага, хугацааг тодорхой хэлж, дараагийн дадлагад юу бэлтгэж ирэхийг сануулна.");
  }

  const file = path.join(OUT, `CSBC101_Lekts_${n2}.pptx`);
  await pres.writeFile({ fileName: file });
  await applyTheme(file, THEME);
  return file;
}

// ── Slide renderers ─────────────────────────────────────────
async function renderSlide(pres, C, sd) {
  const dark = sd.type === "quote";
  const s = pres.addSlide({ masterName: dark ? "DARK_BLANK" : "CONTENT", sectionTitle: "Агуулга" });
  if (sd.notes) s.addNotes(sd.notes);
  if (dark) return renderQuote(s, C, sd);
  s.addText(sd.title, { placeholder: "title" });
  let top = 1.45;
  if (sd.lead) {
    txt(s, sd.lead, { x: MX, y: 1.25, w: CW, h: 0.5, fontSize: 16, italic: true, color: C.accent3, valign: "middle", objectName: "lead" });
    top = 2.0;
  }
  const bottom = 6.75;
  switch (sd.type) {
    case "cards": return renderCards(s, C, sd, top, bottom);
    case "stats": return renderStats(s, C, sd, top, bottom);
    case "process": return renderProcess(s, C, sd, top, bottom);
    case "chains": return renderChains(s, C, sd, top, bottom);
    case "table": return renderTable(s, C, sd, top, bottom);
    case "timeline": return renderTimeline(s, C, sd, top, bottom);
    case "twocol": return renderTwoCol(s, C, sd, top, bottom);
    case "recap": return renderRecap(s, C, sd, top, bottom);
    default: throw new Error("Unknown type " + sd.type);
  }
}

async function renderCards(s, C, sd, top, bottom) {
  const n = sd.items.length;
  const gap = 0.3;
  if (n === 6) {
    // 3x2 — icon heading row
    const cols = 3, rows = 2, w = (CW - gap * (cols - 1)) / cols, h = (bottom - top - gap) / rows;
    for (let i = 0; i < n; i++) {
      const it = sd.items[i], x = MX + (i % cols) * (w + gap), y = top + Math.floor(i / cols) * (h + gap);
      s.addShape("roundRect", { x, y, w, h, rectRadius: 0.1, fill: { color: C.background2 }, line: { type: "none" }, objectName: `card-${i}` });
      await iconCircle(s, C, it.icon, x + 0.25, y + 0.25, 0.6, C.accent1, HEX.lt1, `card-icon-${i}`);
      txt(s, it.h, { x: x + 1.0, y: y + 0.22, w: w - 1.2, h: 0.7, fontSize: 18, bold: true, color: C.text2, valign: "middle", objectName: `card-h-${i}` });
      txt(s, it.t, { x: x + 0.25, y: y + 1.05, w: w - 0.5, h: h - 1.2, fontSize: 16, color: C.text1, objectName: `card-t-${i}` });
    }
    return;
  }
  const w = (CW - gap * (n - 1)) / n, h = bottom - top;
  for (let i = 0; i < n; i++) {
    const it = sd.items[i], x = MX + i * (w + gap);
    s.addShape("roundRect", { x, y: top, w, h, rectRadius: 0.1, fill: { color: C.background2 }, line: { type: "none" }, objectName: `card-${i}` });
    await iconCircle(s, C, it.icon, x + 0.3, top + 0.35, 0.8, C.accent1, HEX.lt1, `card-icon-${i}`);
    let y = top + 1.4;
    const hf = fitPt(it.h, w - 0.6, n >= 5 ? 17 : 20, true), hh = estH(it.h, w - 0.6, hf, true);
    txt(s, it.h, { x: x + 0.3, y, w: w - 0.6, h: hh, fontSize: hf, bold: true, color: C.text2, valign: "top", objectName: `card-h-${i}` });
    y += hh + 0.1;
    if (it.sub) {
      txt(s, it.sub, { x: x + 0.3, y, w: w - 0.6, h: 0.35, fontSize: 14, italic: true, color: C.accent3, objectName: `card-sub-${i}` });
      y += 0.45;
    }
    txt(s, it.t, { x: x + 0.3, y, w: w - 0.6, h: top + h - y - 0.25, fontSize: n >= 5 ? 15 : 18, color: C.text1, objectName: `card-t-${i}` });
  }
}

function renderStats(s, C, sd, top, bottom) {
  const n = sd.items.length, gap = 0.3, w = (CW - gap * (n - 1)) / n;
  const h = (sd.note ? bottom - 0.8 : bottom) - top;
  sd.items.forEach((it, i) => {
    const x = MX + i * (w + gap);
    s.addShape("roundRect", { x, y: top, w, h, rectRadius: 0.1, fill: { color: C.background2 }, line: { type: "none" }, objectName: `stat-card-${i}` });
    txt(s, it.n, { x: x + 0.3, y: top + 0.45, w: w - 0.6, h: 1.2, fontSize: n >= 4 ? 44 : 50, bold: true, color: C.accent1, valign: "middle", objectName: `stat-n-${i}` });
    txt(s, it.l, { x: x + 0.3, y: top + 1.85, w: w - 0.6, h: 1.8, fontSize: 20, bold: true, color: C.text2, objectName: `stat-l-${i}` });
    if (it.s) txt(s, it.s, { x: x + 0.3, y: top + h - 1.1, w: w - 0.6, h: 0.85, fontSize: 13, italic: true, color: C.accent6, valign: "bottom", objectName: `stat-s-${i}` });
  });
  if (sd.note) txt(s, sd.note, { x: MX, y: bottom - 0.55, w: CW, h: 0.5, fontSize: 15, italic: true, color: C.accent3, valign: "middle", objectName: "stat-note" });
}

function renderProcess(s, C, sd, top, bottom) {
  const n = sd.steps.length, arrow = n >= 7 ? 0.2 : 0.28, gap = n >= 7 ? 0.05 : 0.08;
  const w = (CW - (n - 1) * (arrow + 2 * gap)) / n;
  const h = Math.min(bottom - top - 0.2, 4.4), y0 = top + 0.15;
  const big = sd.steps.every((st) => st.h.length <= 2);
  sd.steps.forEach((st, i) => {
    const x = MX + i * (w + arrow + 2 * gap);
    s.addShape("roundRect", { x, y: y0, w, h, rectRadius: 0.1, fill: { color: C.background2 }, line: { type: "none" }, objectName: `step-${i}` });
    if (big) {
      txt(s, st.h, { x, y: y0 + 0.3, w, h: 1.2, fontSize: 60, bold: true, color: C.accent1, align: "center", valign: "middle", objectName: `step-h-${i}` });
      txt(s, st.sub || "", { x: x + 0.15, y: y0 + 1.6, w: w - 0.3, h: 0.45, fontSize: 15, bold: true, color: C.text2, align: "center", objectName: `step-sub-${i}` });
      txt(s, st.t, { x: x + 0.2, y: y0 + 2.2, w: w - 0.4, h: h - 2.4, fontSize: 15, color: C.text1, align: "center", objectName: `step-t-${i}` });
    } else {
      const d = 0.55;
      s.addShape("ellipse", { x: x + 0.2, y: y0 + 0.25, w: d, h: d, fill: { color: C.accent1 }, line: { type: "none" }, objectName: `step-dot-${i}` });
      txt(s, String(i + 1), { x: x + 0.2, y: y0 + 0.25, w: d, h: d, fontSize: 18, bold: true, color: C.background1, align: "center", valign: "middle", objectName: `step-num-${i}` });
      let y = y0 + 1.0;
      const hf = fitPt(st.h, w - 0.35, n >= 7 ? 14 : 18, true), hh = Math.max(0.4, estH(st.h, w - 0.35, hf, true));
      txt(s, st.h, { x: x + 0.2, y, w: w - 0.35, h: hh, fontSize: hf, bold: true, color: C.text2, objectName: `step-h-${i}` });
      y += hh + 0.1;
      if (st.sub) { txt(s, st.sub, { x: x + 0.2, y, w: w - 0.3, h: 0.35, fontSize: n >= 7 ? 11 : 12, italic: true, color: C.accent3, objectName: `step-sub-${i}` }); y += 0.45; }
      txt(s, st.t, { x: x + 0.2, y, w: w - 0.35, h: y0 + h - y - 0.2, fontSize: n >= 7 ? 14 : 16, color: C.text1, objectName: `step-t-${i}` });
    }
    if (i < n - 1) {
      s.addShape("chevron", { x: x + w + gap, y: y0 + h / 2 - 0.25, w: arrow, h: 0.5, fill: { color: C.accent2 }, line: { type: "none" }, objectName: `step-arrow-${i}` });
    }
  });
}

function renderChains(s, C, sd, top, bottom) {
  const rows = sd.rows.length, rgap = 0.35, rh = (bottom - top - rgap * (rows - 1)) / rows;
  const lw = 1.9, arrow = 0.3, gap = 0.1;
  sd.rows.forEach((r, ri) => {
    const y = top + ri * (rh + rgap);
    s.addShape("roundRect", { x: MX, y, w: lw, h: rh, rectRadius: 0.1, fill: { color: C.text2 }, line: { type: "none" }, objectName: `chain-label-bg-${ri}` });
    txt(s, r.label, { x: MX + 0.1, y, w: lw - 0.2, h: rh, fontSize: 16, bold: true, color: C.background1, align: "center", valign: "middle", objectName: `chain-label-${ri}` });
    const n = r.items.length, x0 = MX + lw + 0.3, avail = W - MX - x0;
    const w = (avail - (n - 1) * (arrow + 2 * gap)) / n;
    r.items.forEach((it, i) => {
      const x = x0 + i * (w + arrow + 2 * gap);
      const last = i === n - 1;
      s.addShape("roundRect", { x, y, w, h: rh, rectRadius: 0.1, fill: { color: last ? C.accent1 : C.background2 }, line: { type: "none" }, objectName: `chain-${ri}-${i}` });
      txt(s, it, { x: x + 0.15, y, w: w - 0.3, h: rh, fontSize: 15, bold: last, color: last ? C.background1 : C.text1, align: "center", valign: "middle", objectName: `chain-t-${ri}-${i}` });
      if (!last) s.addShape("chevron", { x: x + w + gap, y: y + rh / 2 - 0.22, w: arrow, h: 0.44, fill: { color: C.accent2 }, line: { type: "none" }, objectName: `chain-arrow-${ri}-${i}` });
    });
  });
}

function renderTable(s, C, sd, top, bottom) {
  const head = sd.head.map((h) => ({ text: h, options: { bold: true, color: C.background1, fill: { color: C.text2 }, fontSize: 15, valign: "middle" } }));
  const rows = sd.rows.map((r, ri) => r.map((c, ci) => ({
    text: c,
    options: { fontSize: 15, color: C.text1, bold: ci === 0, fill: { color: ri % 2 === 0 ? C.background2 : C.background1 }, valign: "middle" },
  })));
  const rowH = Math.min(0.66, (bottom - top - 0.5) / sd.rows.length);
  s.addTable([head, ...rows], {
    x: MX, y: top + 0.05, w: CW, colW: sd.colW, rowH: [0.5, ...sd.rows.map(() => rowH)],
    border: { type: "solid", color: HEX.lt1, pt: 1.5 }, margin: [0.05, 0.12, 0.05, 0.12], fontFace: "Arial", objectName: "table",
  });
}

function renderTimeline(s, C, sd, top, bottom) {
  const n = sd.items.length, w = CW / n, lineY = top + 1.35;
  s.addShape("line", { x: MX + w / 2, y: lineY, w: CW - w, h: 0, line: { color: HEX.accent4, width: 3 }, objectName: "timeline-axis" });
  sd.items.forEach((it, i) => {
    const cx = MX + i * w + w / 2;
    txt(s, it.y, { x: cx - w / 2 + 0.1, y: top + 0.1, w: w - 0.2, h: 0.7, fontSize: it.y.length > 5 ? 22 : 28, bold: true, color: C.accent1, align: "center", valign: "bottom", objectName: `tl-year-${i}` });
    s.addShape("ellipse", { x: cx - 0.2, y: lineY - 0.2, w: 0.4, h: 0.4, fill: { color: C.text2 }, line: { color: HEX.lt1, width: 3 }, objectName: `tl-dot-${i}` });
    s.addShape("roundRect", { x: cx - w / 2 + 0.12, y: lineY + 0.45, w: w - 0.24, h: bottom - lineY - 0.45, rectRadius: 0.1, fill: { color: C.background2 }, line: { type: "none" }, objectName: `tl-card-${i}` });
    txt(s, it.t, { x: cx - w / 2 + 0.32, y: lineY + 0.7, w: w - 0.64, h: bottom - lineY - 0.9, fontSize: n >= 5 ? 15 : 17, color: C.text1, objectName: `tl-text-${i}` });
  });
}

async function renderTwoCol(s, C, sd, top, bottom) {
  const hasCall = !!sd.callout;
  const gap = 0.35;
  const cw = hasCall ? 2.9 : 0;
  const colW = (CW - cw - gap * (hasCall ? 2 : 1)) / 2;
  const cols = [
    { d: sd.left, x: MX, fill: C.background2, icon: "MdChevronRight" },
    { d: sd.right, x: MX + colW + gap + (hasCall ? cw + gap : 0), fill: C.background2, icon: "MdChevronRight" },
  ];
  for (let k = 0; k < 2; k++) {
    const c = cols[k];
    s.addShape("roundRect", { x: c.x, y: top, w: colW, h: bottom - top, rectRadius: 0.1, fill: { color: c.fill }, line: { type: "none" }, objectName: `col-${k}` });
    await iconCircle(s, C, k === 0 ? "MdLooksOne" : "MdLooksTwo", c.x + 0.3, top + 0.3, 0.55, k === 0 ? C.text2 : C.accent1, HEX.lt1, `col-icon-${k}`);
    txt(s, c.d.h, { x: c.x + 1.05, y: top + 0.3, w: colW - 1.3, h: 0.55, fontSize: 18, bold: true, color: C.text2, valign: "middle", objectName: `col-h-${k}` });
    s.addText(c.d.bullets.map((b, i) => ({ text: b, options: { bullet: { indent: 18 }, breakLine: i < c.d.bullets.length - 1, paraSpaceAfter: 18 } })),
      { isTextBox: true, x: c.x + 0.3, y: top + 1.15, w: colW - 0.6, h: bottom - top - 1.4, fontSize: 18, color: C.text1, valign: "top", margin: 0, objectName: `col-list-${k}` });
  }
  if (hasCall) {
    const x = MX + colW + gap;
    s.addShape("roundRect", { x, y: top, w: cw, h: bottom - top, rectRadius: 0.1, fill: { color: C.text2 }, line: { type: "none" }, objectName: "callout" });
    txt(s, sd.callout.n, { x: x + 0.2, y: top + 0.8, w: cw - 0.4, h: 1.2, fontSize: 54, bold: true, color: C.accent1, align: "center", valign: "middle", objectName: "callout-n" });
    txt(s, sd.callout.l, { x: x + 0.25, y: top + 2.15, w: cw - 0.5, h: 1.6, fontSize: 15, color: C.background1, align: "center", objectName: "callout-l" });
    txt(s, sd.callout.s, { x: x + 0.25, y: bottom - 0.8, w: cw - 0.5, h: 0.5, fontSize: 11, italic: true, color: C.accent4, align: "center", objectName: "callout-s" });
  }
}

function renderRecap(s, C, sd, top, bottom) {
  const cols = 4, rows = 2, gap = 0.3, w = (CW - gap * (cols - 1)) / cols, h = (bottom - top - gap) / rows;
  sd.items.forEach((t, i) => {
    const x = MX + (i % cols) * (w + gap), y = top + Math.floor(i / cols) * (h + gap);
    s.addShape("roundRect", { x, y, w, h, rectRadius: 0.1, fill: { color: C.background2 }, line: { type: "none" }, objectName: `recap-${i}` });
    txt(s, `Л${i + 1}`, { x: x + 0.3, y: y + 0.25, w: 1.2, h: 0.55, fontSize: 22, bold: true, fontFace: "Courier New", color: C.accent1, objectName: `recap-n-${i}` });
    txt(s, t, { x: x + 0.3, y: y + 0.95, w: w - 0.6, h: h - 1.15, fontSize: 16, color: C.text1, objectName: `recap-t-${i}` });
  });
}

async function renderQuote(s, C, sd) {
  txt(s, `// ${sd.kicker.toUpperCase()}`, { x: MX, y: 1.0, w: 8, h: 0.5, fontSize: 20, bold: true, fontFace: "Courier New", color: C.accent1, objectName: "q-kicker" });
  txt(s, sd.text, { x: MX, y: 1.8, w: 8.9, h: 4.4, fontSize: 30, bold: true, color: C.background1, valign: "middle", objectName: "q-text" });
  s.addShape("ellipse", { x: 10.0, y: 2.3, w: 2.6, h: 2.6, fill: { color: C.accent3, transparency: 40 }, line: { color: C.accent1, width: 2 }, objectName: "q-ring" });
  s.addImage({ data: await icon("MdForum", HEX.accent1), x: 10.6, y: 2.9, w: 1.4, h: 1.4, altText: "", objectName: "q-icon" });
}

(async () => {
  for (const L of LECTURES) {
    const f = await buildLecture(L);
    console.log("wrote", f);
  }
})().catch((e) => { console.error(e); process.exit(1); });
