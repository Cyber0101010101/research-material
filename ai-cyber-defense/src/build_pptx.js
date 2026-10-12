// «Кибер халдлагын үед AI ашиглах боломж» илтгэлийн слайд (PPTX) бүтээх скрипт.
// Ажиллуулах: NODE_PATH=<node_modules> SKILL_DIR=<pptx skill dir> node build_pptx.js out.pptx
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const Fa = require("react-icons/fa");
const fs = require("fs");
const path = require("path");
const { applyTheme } = require(path.join(process.env.SKILL_DIR, "scripts/apply_theme.js"));

const OUT = process.argv[2] || "kiber_haldlagyn_ued_AI_iltgel.pptx";
const SPEECH = path.join(__dirname, "..", "kiber_haldlagyn_ued_AI_iltgeliin_ug.md");

// ---------- илтгэгчийн тэмдэглэл: илтгэлийн үгийн текстээс слайд бүрээр ----------
const NOTES = {};
{
  const md = fs.readFileSync(SPEECH, "utf8");
  const re = /^\*\*Слайд (\d+)[^\n]*\*\*\s*\n([\s\S]*?)(?=^\*\*Слайд \d+|\s*$(?![\s\S]))/gm;
  let m;
  while ((m = re.exec(md))) NOTES[+m[1]] = m[2].replace(/\*\*/g, "").trim();
}

// ---------- сэдэв (theme) ----------
const THEME = {
  name: "AI Cyber Defense",
  headFontFace: "Arial",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "0B1F3A", // гүн хөх (navy) – үндсэн текст, бараан дэвсгэр
    lt1: "FFFFFF",
    dk2: "4A5568", // бүдэг текст
    lt2: "EEF2F7", // цайвар карт
    accent1: "0E7C86", // teal – AI, хамгаалалт
    accent2: "C8102E", // улаан – халдлага, эрсдэл
    accent3: "1F4E79", // ган хөх
    accent4: "D4A017", // алтлаг – онцлох
    accent5: "8A94A6", // саарал
    accent6: "D6EEF0", // цайвар teal
    hlink: "0E7C86",
    folHlink: "1F4E79",
  },
};
const X = THEME.colors;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "Кибер халдлагын үед хиймэл оюуныг ашиглах боломж";
pres.author = "ҮБХИС, Кибер аюулгүй байдлын тэнхим";
pres.subject = "Хиймэл оюун – Кибер аюулгүй байдал хэлэлцүүлэг, чиглүүлэх илтгэл-2";
pres.lang = "mn-MN";
const C = pres.SchemeColor;
const W = 13.333;
const M = 0.6; // хуудасны зах
const CW = W - 2 * M; // 12.133
const FOOTER = "«Хиймэл оюун – Кибер аюулгүй байдал» хэлэлцүүлэг • 2026.10.14 • Чиглүүлэх илтгэл-2";

// ---------- дүрс тэмдэг ----------
async function icon(name, hex, px = 256) {
  const Cmp = Fa[name] || Fa.FaCircle;
  if (!Fa[name]) console.warn("icon missing:", name);
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Cmp, { color: "#" + hex, size: px }));
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

// ---------- layout-ууд ----------
pres.defineSlideMaster({
  title: "TITLE",
  background: { color: X.dk1 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.8, y: 1.7, w: 8.3, h: 2.2, fontSize: 36, bold: true, color: C.background1, valign: "bottom", align: "left", margin: 0 } } },
    { placeholder: { options: { name: "body", type: "body", x: 0.8, y: 4.05, w: 8.3, h: 2.4, fontSize: 16, color: C.accent6, valign: "top", margin: 0 } } },
  ],
});
pres.defineSlideMaster({
  title: "CONTENT",
  background: { color: X.lt1 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: M, y: 0.4, w: CW, h: 0.85, fontSize: 28, bold: true, color: C.text1, valign: "middle", margin: 0 } } },
    { text: { text: FOOTER, options: { x: M, y: 7.05, w: 9, h: 0.3, fontSize: 9, color: C.text2, margin: 0 } } },
  ],
  slideNumber: { x: 12.2, y: 7.05, w: 0.55, h: 0.3, fontSize: 9, color: X.dk2, align: "right" },
});
pres.defineSlideMaster({
  title: "DARK",
  background: { color: X.dk1 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: M, y: 0.4, w: CW, h: 0.85, fontSize: 28, bold: true, color: C.background1, valign: "middle", margin: 0 } } },
    { text: { text: FOOTER, options: { x: M, y: 7.05, w: 9, h: 0.3, fontSize: 9, color: C.accent5, margin: 0 } } },
  ],
  slideNumber: { x: 12.2, y: 7.05, w: 0.55, h: 0.3, fontSize: 9, color: X.accent5, align: "right" },
});

// ---------- туслах функцууд ----------
function T(s, text, o) {
  s.addText(text, Object.assign({ isTextBox: true, margin: 0 }, o));
}
function card(s, x, y, w, h, fill, name) {
  s.addShape(pres.ShapeType.roundRect, { x, y, w, h, fill: { color: fill }, line: { color: fill, width: 0 }, rectRadius: 0.08, objectName: name });
}
function circle(s, x, y, d, fill, name) {
  s.addShape(pres.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: fill }, line: { color: fill, width: 0 }, objectName: name });
}
function iconCircle(s, data, x, y, d, fill, name) {
  circle(s, x, y, d, fill, name + " circle");
  const p = d * 0.25;
  s.addImage({ data, x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p, objectName: name + " icon" });
}
function numCircle(s, x, y, d, n, fill, color, name) {
  circle(s, x, y, d, fill, name + " circle");
  T(s, String(n), { x, y, w: d, h: d, fontSize: d >= 0.6 ? 16 : 13, bold: true, color, align: "center", valign: "middle", objectName: name + " number" });
}
// Том тоон үзүүлэлтийн карт
function statTile(s, { x, y, w, h, value, label, source, fill = C.background2, valueColor = C.accent2, labelColor = C.text1, sourceColor = C.text2, valueSize = 40, compact = false }, name) {
  card(s, x, y, w, h, fill, name + " card");
  const pad = 0.22, vh = compact ? 0.65 : 0.95, ly = y + (compact ? 0.78 : 1.08);
  T(s, value, { x: x + pad, y: y + 0.12, w: w - 2 * pad, h: vh, fontSize: valueSize, bold: true, color: valueColor, align: "left", valign: "middle", objectName: name + " value" });
  T(s, label, { x: x + pad, y: ly, w: w - 2 * pad, h: y + h - ly - (source ? 0.38 : 0.12), fontSize: compact ? 12 : 13, color: labelColor, valign: "top", objectName: name + " label" });
  if (source) T(s, source, { x: x + pad, y: y + h - 0.38, w: w - 2 * pad, h: 0.3, fontSize: 10, italic: true, color: sourceColor, valign: "bottom", objectName: name + " source" });
}
// Дүрс тэмдэг + гарчиг + тайлбар мөр
function iconRow(s, { x, y, w, h, data, head, desc, fill = C.accent1, headSize = 14, descSize = 12, d = 0.55 }, name) {
  iconCircle(s, data, x, y + 0.03, d, fill, name);
  const tx = x + d + 0.2;
  T(s, head, { x: tx, y, w: w - d - 0.2, h: 0.32, fontSize: headSize, bold: true, color: C.text1, valign: "top", objectName: name + " head" });
  T(s, desc, { x: tx, y: y + 0.32, w: w - d - 0.2, h: h - 0.32, fontSize: descSize, color: C.text2, valign: "top", objectName: name + " desc" });
}
// Картын доторх гарчиг + текст
function cardText(s, { x, y, w, h, fill = C.background2, head, body, headColor = C.text1, bodySize = 12, bullets = false, headSize = 14 }, name) {
  card(s, x, y, w, h, fill, name + " card");
  const pad = 0.22;
  let ty = y + 0.18;
  if (head) {
    T(s, head, { x: x + pad, y: ty, w: w - 2 * pad, h: 0.34, fontSize: headSize, bold: true, color: headColor, valign: "top", objectName: name + " head" });
    ty += 0.4;
  }
  if (Array.isArray(body)) {
    const items = body.map((t, i) => ({ text: t, options: { bullet: bullets ? { indent: 12 } : false, breakLine: i < body.length - 1 } }));
    s.addText(items, { x: x + pad, y: ty, w: w - 2 * pad, h: y + h - ty - 0.15, fontSize: bodySize, color: C.text1, valign: "top", paraSpaceAfter: 4, isTextBox: true, margin: 0, objectName: name + " body" });
  } else if (body) {
    T(s, body, { x: x + pad, y: ty, w: w - 2 * pad, h: y + h - ty - 0.15, fontSize: bodySize, color: C.text1, valign: "top", objectName: name + " body" });
  }
}
function bullets(s, items, o) {
  const runs = items.map((t, i) => ({ text: t, options: { bullet: { indent: 12 }, breakLine: i < items.length - 1 } }));
  s.addText(runs, Object.assign({ isTextBox: true, margin: 0, paraSpaceAfter: 5, valign: "top" }, o));
}
function notes(s, n) {
  if (NOTES[n]) s.addNotes(NOTES[n]);
}

(async () => {
  const ic = {
    shield: await icon("FaShieldAlt", X.lt1),
    brain: await icon("FaBrain", X.lt1),
    userSecret: await icon("FaUserSecret", X.lt1),
    userShield: await icon("FaUserShield", X.lt1),
    code: await icon("FaCode", X.lt1),
    robot: await icon("FaRobot", X.lt1),
    bulb: await icon("FaLightbulb", X.lt1),
    search: await icon("FaSearch", X.lt1),
    cogs: await icon("FaCogs", X.lt1),
    envelope: await icon("FaEnvelope", X.lt1),
    bug: await icon("FaBug", X.lt1),
    satellite: await icon("FaSatelliteDish", X.lt1),
    random: await icon("FaRandom", X.lt1),
    crosshairs: await icon("FaCrosshairs", X.lt1),
    server: await icon("FaServer", X.lt1),
    bolt: await icon("FaBolt", X.lt1),
    globe: await icon("FaGlobe", X.lt1),
    lock: await icon("FaLock", X.lt1),
    chart: await icon("FaChartLine", X.lt1),
    userCheck: await icon("FaUserCheck", X.lt1),
    mailOpen: await icon("FaEnvelopeOpenText", X.lt1),
    video: await icon("FaVideo", X.lt1),
    comments: await icon("FaComments", X.lt1),
    stopwatch: await icon("FaStopwatch", X.lt1),
    warning: await icon("FaExclamationTriangle", X.lt1),
    sort: await icon("FaSortAmountUp", X.lt1),
    grad: await icon("FaGraduationCap", X.lt1),
    terminal: await icon("FaTerminal", X.lt1),
    skull: await icon("FaSkullCrossbones", X.lt1),
    mask: await icon("FaMask", X.lt1),
    link: await icon("FaLink", X.lt1),
    key: await icon("FaKey", X.lt1),
    unlock: await icon("FaUnlock", X.lt1),
    flagUsa: await icon("FaFlagUsa", X.lt1),
    globeEu: await icon("FaGlobeEurope", X.lt1),
    landmark: await icon("FaLandmark", X.lt1),
    building: await icon("FaBuilding", X.lt1),
    check: await icon("FaCheckCircle", X.lt1),
    chip: await icon("FaMicrochip", X.lt1),
    db: await icon("FaDatabase", X.lt1),
    users: await icon("FaUsers", X.lt1),
    knight: await icon("FaChessKnight", X.lt1),
    balance: await icon("FaBalanceScale", X.lt1),
    clipboard: await icon("FaClipboardList", X.lt1),
    cart: await icon("FaShoppingCart", X.lt1),
    gavel: await icon("FaGavel", X.lt1),
    handshake: await icon("FaHandshake", X.lt1),
    fileAlt: await icon("FaFileAlt", X.lt1),
    sitemap: await icon("FaSitemap", X.lt1),
    eye: await icon("FaEye", X.lt1),
    sync: await icon("FaSyncAlt", X.lt1),
    shieldBig: await icon("FaShieldAlt", X.accent1),
    brainTeal: await icon("FaBrain", X.accent1),
    question: await icon("FaQuestionCircle", X.accent4),
  };

  // ================= 1. Нүүр =================
  pres.addSection({ title: "Нээлт" });
  {
    const s = pres.addSlide({ masterName: "TITLE", sectionTitle: "Нээлт" });
    s.addText("Кибер халдлагын үед хиймэл оюуныг ашиглах боломж", { placeholder: "title" });
    s.addText(
      [
        { text: "«Хиймэл оюун – Кибер аюулгүй байдал» сэдэвт хэлэлцүүлэг • Чиглүүлэх илтгэл-2", options: { breakLine: true, bold: true } },
        { text: "ҮБХИС-ийн Цэргийн нэгдсэн сургуулийн Кибер аюулгүй байдлын тэнхимийн дарга, ахмад С.Билэгт", options: { breakLine: true } },
        { text: "Улаанбаатар хот, 2026 оны 10 дугаар сарын 14", options: { color: C.accent5, fontSize: 14 } },
      ],
      { placeholder: "body", paraSpaceAfter: 8 }
    );
    // Эмблем: бамбай + тархи
    s.addShape(pres.ShapeType.ellipse, { x: 9.55, y: 1.75, w: 3.3, h: 3.3, fill: { type: "none" }, line: { color: C.accent4, width: 1.5 }, objectName: "emblem ring" });
    circle(s, 9.85, 2.05, 2.7, C.accent1, "emblem circle");
    s.addImage({ data: ic.shield, x: 10.45, y: 2.55, w: 1.5, h: 1.6, objectName: "emblem shield" });
    circle(s, 11.75, 3.75, 0.95, C.text1, "emblem brain circle");
    s.addImage({ data: ic.brainTeal, x: 11.93, y: 3.93, w: 0.6, h: 0.6, objectName: "emblem brain" });
    T(s, "Зэвсэгт хүчний Кибер аюулгүй байдлын цэргийн командлал • Батлан хамгаалахын эрдэм шинжилгээний хүрээлэн", { x: 0.8, y: 6.7, w: 11.8, h: 0.35, fontSize: 11, color: C.accent5, objectName: "organizers" });
    notes(s, 1);
  }

  // ================= 2. Хурдны асимметри =================
  pres.addSection({ title: "Аюул заналын орчин" });
  {
    const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Аюул заналын орчин" });
    s.addText("Хурдны асимметри: халдагч минутаар, хамгаалагч хоногоор", { placeholder: "title" });
    const tw = 3.85, gap = (CW - 3 * tw) / 2;
    statTile(s, { x: M, y: 1.45, w: tw, h: 2.1, value: "51 сек", label: "Хамгийн хурдан «breakout»: нэвтэрснээс хажуу тийш шилжих хүртэл", source: "CrowdStrike Global Threat Report 2025" }, "stat1");
    statTile(s, { x: M + tw + gap, y: 1.45, w: tw, h: 2.1, value: "48 мин", label: "Дундаж breakout хугацаа (2023 онд 62 мин байсан)", source: "CrowdStrike 2025" }, "stat2");
    statTile(s, { x: M + 2 * (tw + gap), y: 1.45, w: tw, h: 2.1, value: "11 хоног", label: "Халдагч сүлжээнд илрэхгүй байх дундаж хугацаа (dwell time)", source: "Mandiant M-Trends 2025", valueColor: C.text1 }, "stat3");

    const cw2 = (CW - 0.4) / 2, cy = 3.85, ch = 2.25;
    card(s, M, cy, cw2, ch, C.background2, "attacker card");
    iconCircle(s, ic.userSecret, M + 0.22, cy + 0.22, 0.6, C.accent2, "attacker");
    T(s, "Халдагч (AI агент)", { x: M + 1.0, y: cy + 0.25, w: cw2 - 1.2, h: 0.5, fontSize: 16, bold: true, color: C.accent2, valign: "middle", objectName: "attacker head" });
    bullets(s, ["Олон агент зэрэгцэн, цаг тутамд мянган хүсэлт", "Минутын дотор хажуу тийш шилжих, эрх ахиулах", "Илрүүлэлтийн 79% нь хортой кодгүй: зөвхөн зан төлөвөөр танигдана"], { x: M + 0.22, y: cy + 0.9, w: cw2 - 0.44, h: ch - 1.0, fontSize: 13, color: C.text1, objectName: "attacker bullets" });

    const x2 = M + cw2 + 0.4;
    card(s, x2, cy, cw2, ch, C.background2, "defender card");
    iconCircle(s, ic.userShield, x2 + 0.22, cy + 0.22, 0.6, C.accent1, "defender");
    T(s, "Хамгаалагч (хүний шинжээч)", { x: x2 + 1.0, y: cy + 0.25, w: cw2 - 1.2, h: 0.5, fontSize: 16, bold: true, color: C.accent1, valign: "middle", objectName: "defender head" });
    bullets(s, ["Сэрэмжлүүлгийг цаг, хоногоор шалгадаг", "Сэрэмжлүүлгийн ядаргаа, Tier-1 давтагдах ажил", "Мэргэшсэн хүний нөөцийн хомсдол"], { x: x2 + 0.22, y: cy + 0.9, w: cw2 - 0.44, h: ch - 1.0, fontSize: 13, color: C.text1, objectName: "defender bullets" });

    T(s, "Илрүүлэлт, анхан шатны хариу үйлдлийг машины хурдтай болгохоос өөр сонголтгүй.", { x: M, y: 6.3, w: CW, h: 0.5, fontSize: 16, italic: true, bold: true, color: C.accent1, valign: "middle", objectName: "key message" });
    notes(s, 2);
  }

  // ================= 3. Халдагч AI ашиглаж байна =================
  {
    const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Аюул заналын орчин" });
    s.addText("Халдагч аль хэдийн AI ашиглаж байна", { placeholder: "title" });
    const tw = 2.85, gap = (CW - 4 * tw) / 3;
    const tiles = [
      ["54%", "AI-аар бичсэн фишингийн клик хийх хувь (гараар бичсэн: 12%)", "Microsoft Digital Defense Report 2025"],
      ["16%", "Мэдээллийн зөрчилд халдагч AI ашигласан (фишинг, deepfake)", "IBM Cost of a Data Breach 2025"],
      ["80–90%", "Кибер тагнуулын кампанит ажлын ажиллагааг AI автономи гүйцэтгэсэн", "Anthropic, GTG-1002, 2025.11"],
      ["+442%", "Дуут фишинг (vishing)-ийн өсөлт, 2024 оны I → II хагас", "CrowdStrike 2025"],
    ];
    tiles.forEach((t, i) => statTile(s, { x: M + i * (tw + gap), y: 1.45, w: tw, h: 2.3, value: t[0], label: t[1], source: t[2], valueSize: 36 }, "tile" + i));

    const cw = 3.85, cgap = (CW - 3 * cw) / 2, cy = 4.0, ch = 2.75;
    const cards = [
      [ic.code, C.accent2, "Өөрийгөө дахин бичдэг хортой код", "PROMPTFLUX: ажиллах явцдаа Gemini API-аар кодоо дахин бичиж, обфускаци хийдэг. PROMPTSTEAL, PROMPTLOCK, QUIETVAULT (Google GTIG, 2025.11)"],
      [ic.robot, C.accent2, "Автономи халдлагын агент", "GTG-1002: Claude Code-ийн олон хувийг оркестратор, агент болгон ~30 байгууллага руу; хүн зөвхөн 4–6 шийдвэрийн цэгт (Anthropic)"],
      [ic.bulb, C.accent1, "Хамгаалагчийн давуу тал", "AI агент нууц үг «олсон» гэж худал мэдээлэх зэрэг алдаа гаргаж, халдагч гараар шалгахад хүрсэн. AI-ийн алдааны хэв маяг = илрүүлэлтийн шинж тэмдэг"],
    ];
    cards.forEach((c, i) => {
      const x = M + i * (cw + cgap);
      card(s, x, cy, cw, ch, C.background2, "card" + i);
      iconCircle(s, c[0], x + 0.22, cy + 0.22, 0.6, c[1], "card" + i);
      T(s, c[2], { x: x + 1.0, y: cy + 0.22, w: cw - 1.2, h: 0.6, fontSize: 14, bold: true, color: C.text1, valign: "middle", objectName: "card" + i + " head" });
      T(s, c[3], { x: x + 0.22, y: cy + 0.95, w: cw - 0.44, h: ch - 1.1, fontSize: 12, color: C.text1, valign: "top", objectName: "card" + i + " body" });
    });
    notes(s, 3);
  }

  // ================= 4. Халдлагын мөчлөг =================
  {
    const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Аюул заналын орчин" });
    s.addText("Халдлагын мөчлөгийн үе шат бүрд: халдагчийн AI ба хамгаалагчийн AI", { placeholder: "title" });
    const steps = [
      ["Тагнуул", ic.search, "AI OSINT: бай хүн, системийн профайл; агент дэд бүтцийг өөрөө судална", ic.eye, "Халдлагын талбайн менежмент (ASM), нээлттэй мэдээллийн хяналт"],
      ["Зэвсэглэл", ic.cogs, "LLM-ээр хортой код бичих, обфускаци; PROMPTFLUX өөрийгөө дахин бичдэг", ic.bug, "ML хортой код ангилал: статик, динамик шинж, зан төлөв"],
      ["Хүргэлт", ic.envelope, "Хувь хүнд чиглэсэн, алдаагүй фишинг (54% клик); дуу хоолой, видео deepfake", ic.mailOpen, "NLP фишинг илрүүлэлт, deepfake аудио/видео forensics"],
      ["Ашиглалт", ic.bug, "AI-аар эмзэг байдал олох, exploit бичих; AIxCC бодит 18 эмзэг байдал", ic.sync, "AI-аар эмзэг байдал урьдчилан олж засах (AIxCC), EPSS эрэмбэ"],
      ["Удирдлага (C2)", ic.satellite, "«Just-in-time» AI: хортой код ажиллах явцдаа LLM-ээс команд авна", ic.chart, "Сүлжээний anomaly, DGA домэйн, C2 урсгалын илрүүлэлт"],
      ["Шилжилт", ic.random, "Агентуудыг «пентест баг» шиг зэрэгцүүлэн; хүн 4–6 шийдвэрийн цэгт", ic.userCheck, "UEBA, график шинжилгээ; SOAR-оор секундын дотор тусгаарлах"],
      ["Зорилго", ic.crosshairs, "Хулгайлсан өгөгдлийг AI-аар ангилах; агент ransomware ~25 мин (симуляци)", ic.lock, "Өгөгдөл гадагшлахыг (exfiltration) илрүүлэх, автомат хязгаарлалт"],
    ];
    const n = steps.length, sw = 1.78, step = (CW - sw) / (n - 1);
    T(s, "ХАЛДАГЧ: AI хэрэглээ", { x: M, y: 2.3, w: 6, h: 0.25, fontSize: 10.5, bold: true, color: C.accent2, objectName: "attack label" });
    T(s, "ХАМГААЛАГЧ: AI хариу", { x: M, y: 4.45, w: 6, h: 0.25, fontSize: 10.5, bold: true, color: C.accent1, objectName: "defense label" });
    steps.forEach((st, i) => {
      const x = M + i * step, cx = x + (sw - 0.55) / 2 - 0.1;
      s.addShape(pres.ShapeType.chevron, { x, y: 1.45, w: sw, h: 0.75, fill: { color: C.text1 }, line: { color: C.background1, width: 1 }, objectName: "chevron " + i });
      T(s, st[0], { x: x + 0.28, y: 1.45, w: sw - 0.5, h: 0.75, fontSize: 10.5, bold: true, color: C.background1, align: "center", valign: "middle", objectName: "chevron text " + i });
      iconCircle(s, st[1], cx, 2.6, 0.55, C.accent2, "attack " + i);
      T(s, st[2], { x: x - 0.05, y: 3.22, w: sw - 0.1, h: 1.18, fontSize: 11, color: C.text1, valign: "top", objectName: "attack desc " + i });
      iconCircle(s, st[3], cx, 4.75, 0.55, C.accent1, "defense " + i);
      T(s, st[4], { x: x - 0.05, y: 5.37, w: sw - 0.1, h: 1.35, fontSize: 11, color: C.text1, valign: "top", objectName: "defense desc " + i });
    });
    s.addShape(pres.ShapeType.line, { x: M, y: 4.38, w: CW, h: 0, line: { color: C.accent5, width: 0.75, dashType: "dash" }, objectName: "divider" });
    notes(s, 4);
  }

  // ================= 5. Дөрвөн чиглэл =================
  pres.addSection({ title: "AI ашиглах дөрвөн чиглэл" });
  {
    const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "AI ашиглах дөрвөн чиглэл" });
    s.addText("Хамгаалалтад AI ашиглах дөрвөн чиглэл (удирдамжийн 1.2)", { placeholder: "title" });
    const cw = 2.85, gap = (CW - 4 * cw) / 3, cy = 1.45, ch = 4.3;
    const dirs = [
      ["01", ic.search, "Илрүүлэх, шинжлэх", "Хэвийн бус үйлдэл, UEBA, хортой код, фишинг, deepfake илрүүлэлт; LLM-ээр лог тайлбарлах"],
      ["02", ic.server, "SIEM / SOC", "Эрэмбэлэлт, хамаарал, баяжуулалт, шинжээчийн copilot, «агент SOC»"],
      ["03", ic.bolt, "Incident Response", "NIST SP 800-61r3 мөчлөг бүрд AI; SOAR playbook; автономийн түвшин"],
      ["04", ic.globe, "Threat Intelligence, урьдчилан сэргийлэлт", "CTI олборлолт, эмзэг байдлын эрэмбэ, AI-аар олж засах, дайсны дуурайлт"],
    ];
    dirs.forEach((d, i) => {
      const x = M + i * (cw + gap);
      card(s, x, cy, cw, ch, C.background2, "dir" + i);
      iconCircle(s, d[1], x + (cw - 1.0) / 2, cy + 0.35, 1.0, C.accent1, "dir" + i);
      T(s, d[0], { x: x + 0.2, y: cy + 1.5, w: cw - 0.4, h: 0.5, fontSize: 24, bold: true, color: C.accent4, align: "center", valign: "middle", objectName: "dir" + i + " num" });
      T(s, d[2], { x: x + 0.2, y: cy + 2.05, w: cw - 0.4, h: 0.8, fontSize: 16, bold: true, color: C.text1, align: "center", valign: "top", objectName: "dir" + i + " head" });
      T(s, d[3], { x: x + 0.25, y: cy + 2.9, w: cw - 0.5, h: ch - 3.0, fontSize: 12, color: C.text2, align: "center", valign: "top", objectName: "dir" + i + " desc" });
    });
    card(s, M, 6.0, CW, 0.8, C.accent6, "basis strip");
    iconCircle(s, ic.lock, M + 0.2, 6.1, 0.6, C.text1, "basis");
    T(s, "Суурь нөхцөл: AI системийг өөрийг нь хамгаалах • хүн шийдвэрийн гогцоонд (human-in-the-loop) • өгөгдлийн бүрэн эрхт байдал • мэргэшсэн хүний нөөц", { x: M + 1.0, y: 6.0, w: CW - 1.2, h: 0.8, fontSize: 13, bold: true, color: C.text1, valign: "middle", objectName: "basis text" });
    notes(s, 5);
  }

  // ================= 6. Илрүүлэх, шинжлэх =================
  {
    const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "AI ашиглах дөрвөн чиглэл" });
    s.addText("1. Илрүүлэх, шинжлэх: гарын үсгээс зан төлөв рүү", { placeholder: "title" });
    const rows = [
      [ic.chart, "Хэвийн бус үйлдлийн илрүүлэлт", "Урсгал, нэвтрэлт, өгөгдлийн хэмжээний хазайлт (autoencoder, Isolation Forest, LSTM)"],
      [ic.userCheck, "UEBA", "Хэрэглэгч, төхөөрөмж бүрийн суурь зан төлөв + эрсдэлийн оноо: эрх ахиулалт, дотоод аюул"],
      [ic.bug, "Хортой код ангилал", "Статик, динамик шинжээр шинэ, өөрчлөгдсөн кодыг таних (GBM, CNN, GNN)"],
      [ic.mailOpen, "Фишинг, домэйн", "NLP transformer: AI-аар бичсэн фишинг, DGA домэйн, typosquatting"],
      [ic.video, "Deepfake, дуу хоолой", "Vishing, видео дуурайлтыг аудио/видео forensics-ээр таних"],
      [ic.comments, "LLM-ээр лог тайлбарлах", "Obfuscated PowerShell, скриптийн зорилгыг хүний хэлээр тайлбарлах (RAG)"],
    ];
    const lw = 6.3, rh = 0.88;
    rows.forEach((r, i) => iconRow(s, { x: M, y: 1.45 + i * rh, w: lw, h: rh - 0.08, data: r[0], head: r[1], desc: r[2] }, "row" + i));
    const rx = M + lw + 0.35, rw = CW - lw - 0.35;
    cardText(s, { x: rx, y: 1.45, w: rw, h: 1.6, fill: C.accent6, head: "Үр нөлөө", body: ["Signature-д байхгүй халдлагыг зан төлөвөөр илрүүлнэ (malware-free 79%)", "Dwell time (11 хоног) богиносно; шинжээч зөвхөн эрсдэлтэйг шалгана"], bullets: true }, "effect");
    cardText(s, { x: rx, y: 3.2, w: rw, h: 1.75, head: "Хязгаарлалт, эрсдэл", body: ["Худал сэрэмжлүүлэг (суурь загварын тохиргоо)", "Загварын эсрэг зайлсхийлт (adversarial evasion, NIST AI 100-2)", "Өгөгдлийн хазайлт → дахин сургалт; тайлбарлах чадвар"], bullets: true }, "limits");
    cardText(s, { x: rx, y: 5.1, w: rw, h: 1.7, head: "Цэргийн орчны онцлог", body: ["Air-gapped сүлжээ → дотоод (on-premise) загвар", "Тогтвортой, тодорхойлогдсон сүлжээ = anomaly detection-д давуу", "Тактикийн сүлжээнд хөнгөн edge загвар"], bullets: true }, "military");
    notes(s, 6);
  }

  // ================= 7. SIEM / SOC =================
  {
    const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "AI ашиглах дөрвөн чиглэл" });
    s.addText("2. SIEM / SOC: шинжээчийн хүчийг үржүүлэх", { placeholder: "title" });
    const boxes = [
      ["Лог цуглуулалт", "ML parser: бүтэцгүй логийг автоматаар бүтэцлэх"],
      ["Нормчлол", "Схем таних, OCSF/ECS стандартад буулгах"],
      ["Хамаарал", "Олон эх сурвалжийг нэг халдлагын «түүх» болгох, ATT&CK"],
      ["Эрэмбэлэлт (triage)", "Эрсдэлийн оноо, давхардал нэгтгэх, худал сэрэмжлүүлэг хаах"],
      ["Баяжуулалт", "CTI, актив мэдээлэл автоматаар татах, товчлол (LLM + RAG)"],
      ["Шинжээч, хариу", "Copilot: энгийн хэлээр хайлт (KQL/SPL), тайлан, hunting"],
    ];
    const bw = 1.75, bgap = (CW - 6 * bw) / 5;
    boxes.forEach((b, i) => {
      const x = M + i * (bw + bgap);
      card(s, x, 1.5, bw, 0.95, C.text1, "box" + i);
      T(s, b[0], { x: x + 0.08, y: 1.5, w: bw - 0.16, h: 0.95, fontSize: 12.5, bold: true, color: C.background1, align: "center", valign: "middle", objectName: "box" + i + " text" });
      if (i < 5) s.addShape(pres.ShapeType.rightArrow, { x: x + bw + 0.04, y: 1.82, w: bgap - 0.08, h: 0.3, fill: { color: C.accent1 }, line: { color: C.accent1, width: 0 }, objectName: "arrow" + i });
      T(s, b[1], { x: x - 0.02, y: 2.55, w: bw + 0.04, h: 1.2, fontSize: 11.5, color: C.accent1, bold: true, align: "center", valign: "top", objectName: "box" + i + " ai" });
    });
    statTile(s, { x: M, y: 3.9, w: 2.9, h: 1.75, value: "–1.9 сая $", label: "нэг зөрчлийн хохирол, AI/автоматжуулалтыг өргөн ашигласан бол", valueSize: 30, valueColor: C.accent1, compact: true }, "ibm1");
    statTile(s, { x: M + 3.1, y: 3.9, w: 2.9, h: 1.75, value: "–80 хоног", label: "зөрчлийн мөчлөг (илрүүлэх + хязгаарлах хугацаа)", valueSize: 30, valueColor: C.accent1, compact: true }, "ibm2");
    T(s, "Эх сурвалж: IBM Cost of a Data Breach Report 2025", { x: M, y: 5.72, w: 6.0, h: 0.3, fontSize: 10, italic: true, color: C.text2, objectName: "ibm source" });
    const rx = M + 6.25, rw = CW - 6.25;
    cardText(s, { x: rx, y: 3.9, w: rw, h: 1.4, fill: C.accent6, head: "«Агент SOC» (2025–2026)", body: "Triage, hunting, IR агентууд ажил хуваарилж, хүн батлах, хянах үүрэгтэй: халдлагын оркестраторын толин тусгал. Анхаарах: AI-тай холбоотой зөрчлийн 1/8 нь агент системтэй (HiddenLayer 2026)" }, "agentic");
    cardText(s, { x: rx, y: 5.45, w: rw, h: 1.4, head: "Цэргийн SOC-ийн эрсдэл", body: "LLM hallucination → эх сурвалж заавал ишлэх • Prompt injection логоор дамжин • Үүлэн copilot-д нууц лог = нууцлалын зөрчил → зөвхөн дотоод байршуулалт • Вендороос хараат байдал" }, "risks");
    notes(s, 7);
  }

  // ================= 8. Incident Response =================
  {
    const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "AI ашиглах дөрвөн чиглэл" });
    s.addText("3. Incident Response: мөчлөг бүрд AI, шийдвэрт хүн", { placeholder: "title" });
    T(s, "NIST SP 800-61 Rev.3 (2025), CSF 2.0-той уялдсан зөрчилд хариу үйлдэл үзүүлэх мөчлөг", { x: M, y: 1.25, w: 9, h: 0.3, fontSize: 11, italic: true, color: C.text2, objectName: "subtitle" });
    const hdr = (t) => ({ text: t, options: { bold: true, color: X.lt1, fill: { color: X.dk1 }, fontSize: 12, valign: "middle" } });
    const cell = (t, b) => ({ text: t, options: { fontSize: 11.5, color: X.dk1, bold: !!b, valign: "top" } });
    const rows = [
      [hdr("Үе шат"), hdr("AI-ийн дэмжлэг"), hdr("Хүний үүрэг")],
      [cell("Бэлтгэл", true), cell("Playbook боловсруулах, дасгалын хувилбар үүсгэх, актив, хамаарлын зураглал"), cell("Playbook батлах, хариуцлага тогтоох")],
      [cell("Илрүүлэлт, шинжилгээ", true), cell("Сэрэмжлүүлгийг зөрчил болгон нэгтгэх, хамрах хүрээ, халдлагын timeline сэргээх, ATT&CK"), cell("Ангилал, хүндийн зэргийг батлах")],
      [cell("Хязгаарлалт", true), cell("SOAR playbook: хост тусгаарлах, нууц үг хүчингүй болгох, домэйн хаах: секундын дотор"), cell("Өндөр эрсдэлтэй үйлдэлд (систем салгах, зогсоох) заавал батлах")],
      [cell("Устгалт, сэргээлт", true), cell("Persistence механизм, бүх хувилбарыг олох; сэргээлтийн дараалал, patch эрэмбэ"), cell("Сэргээлтийн шийдвэр, хүлээн авах тест")],
      [cell("Дараах үйл ажиллагаа", true), cell("Forensic, хортой кодыг урвуу инженерчлэх (LLM), тайлан, сургамж → playbook"), cell("Эцсийн дүгнэлт, хариуцлага, сургамж")],
    ];
    s.addTable(rows, { x: M, y: 1.65, w: 8.5, colW: [1.9, 3.8, 2.8], border: { type: "solid", pt: 0.75, color: X.accent5 }, margin: 0.07, rowH: [0.42, 0.85, 0.85, 0.85, 0.85, 0.85], autoPage: false, objectName: "IR table" });
    const rx = M + 8.85, rw = CW - 8.85;
    card(s, rx, 1.65, rw, 1.95, C.accent6, "speed card");
    iconCircle(s, ic.stopwatch, rx + 0.22, 1.85, 0.6, C.accent1, "speed");
    T(s, "Цагаас секунд руу", { x: rx + 0.95, y: 1.85, w: rw - 1.1, h: 0.6, fontSize: 15, bold: true, color: C.text1, valign: "middle", objectName: "speed head" });
    T(s, "Автомат хязгаарлалт нь 51 секундын breakout-той тэмцэх цорын ганц арга", { x: rx + 0.22, y: 2.55, w: rw - 0.44, h: 0.95, fontSize: 12, color: C.text1, valign: "top", objectName: "speed body" });
    card(s, rx, 3.75, rw, 3.0, C.background2, "risk card");
    iconCircle(s, ic.warning, rx + 0.22, 3.95, 0.6, C.accent2, "ir risk");
    T(s, "Эрсдэл", { x: rx + 0.95, y: 3.95, w: rw - 1.1, h: 0.6, fontSize: 15, bold: true, color: C.text1, valign: "middle", objectName: "risk head" });
    bullets(s, ["Буруу автомат хязгаарлалт өөрөө DoS болж байлдааны бэлэн байдалд нөлөөлнө", "Playbook бүрт эрсдэлийн үнэлгээ, rollback, ажиллах горим заавал", "Халдагч хуурамч сэрэмжлүүлгээр автомат хариу үйлдлийг өдөөж болно"], { x: rx + 0.22, y: 4.65, w: rw - 0.44, h: 2.0, fontSize: 12, color: C.text1, objectName: "risk bullets" });
    notes(s, 8);
  }

  // ================= 9. Автономийн түвшин =================
  {
    const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "AI ашиглах дөрвөн чиглэл" });
    s.addText("Автономийн түвшин: AI-д хэр их эрх өгөх вэ?", { placeholder: "title" });
    const lv = [
      ["0", "Гар ажиллагаа", "AI байхгүй; бүх шинжилгээ, үйлдлийг хүн хийнэ", "Одоогийн суурь", C.accent5, C.background1],
      ["1", "AI туслах", "AI товчилж, баяжуулж, санал болгоно; үйлдлийг хүн хийнэ", "Бүх сүлжээнд нэвтрүүлэх", C.accent6, C.text1],
      ["2", "Хэсэгчилсэн автоматжуулалт", "AI үйлдлийн төлөвлөгөө санал болгож, хүн нэг товчоор батална (human-in-the-loop)", "SOC-ийн үндсэн горим", C.accent1, C.background1],
      ["3", "Нөхцөлт автономи", "Урьдчилан батлагдсан, бага эрсдэлтэй playbook-ийг AI өөрөө гүйцэтгэж, хүн хянана (human-on-the-loop)", "Зөвхөн хязгаарлагдмал хүрээнд", C.accent4, C.text1],
      ["4", "Өндөр автономи", "AI хүний оролцоогүй шийдвэр гаргана", "Онц чухал системд одоогоор ҮГҮЙ", C.accent2, C.background1],
    ];
    const bw = 2.3, gap = (CW - 5 * bw) / 4, base = 5.95;
    lv.forEach((l, i) => {
      const x = M + i * (bw + gap), h = 1.25 + i * 0.6, y = base - h;
      card(s, x, y, bw, h, l[4], "level" + i);
      T(s, l[0], { x: x + 0.15, y: y + 0.08, w: 0.7, h: 0.55, fontSize: 28, bold: true, color: l[5], valign: "middle", objectName: "level" + i + " num" });
      T(s, l[1], { x: x + 0.15, y: y + 0.62, w: bw - 0.3, h: 0.62, fontSize: 13, bold: true, color: l[5], valign: "top", objectName: "level" + i + " name" });
      T(s, l[3], { x: x + 0.15, y: y + h - 0.45, w: bw - 0.3, h: 0.4, fontSize: 11, italic: true, bold: true, color: l[5], valign: "middle", objectName: "level" + i + " rec" });
      T(s, l[2], { x: x, y: 1.4, w: bw, h: y - 1.5, fontSize: 12, color: C.text1, valign: "bottom", objectName: "level" + i + " desc" });
    });
    T(s, "Зарчим: автоматжуулалтын эрх = playbook-ийн эрсдэлийн үнэлгээ + буцаах (rollback) механизм + хариуцлагын тодорхой хуваарилалт", { x: M, y: 6.2, w: CW, h: 0.6, fontSize: 14, italic: true, bold: true, color: C.accent1, valign: "middle", objectName: "principle" });
    notes(s, 9);
  }

  // ================= 10. Threat Intelligence =================
  {
    const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "AI ашиглах дөрвөн чиглэл" });
    s.addText("4. Threat Intelligence, урьдчилан сэргийлэлт", { placeholder: "title" });
    const rows = [
      [ic.globe, "CTI-г AI-аар боловсруулах", "Тайлан, харанхуй веб, нийгмийн сүлжээг олон хэлээр хянах; IOC/TTP олборлож ATT&CK, STIX-д буулгах (MISP, OpenCTI + LLM)"],
      [ic.sort, "Эмзэг байдлыг эрэмбэлэх", "CVSS дээр EPSS (бодитоор ашиглагдах магадлал); халдлагын талбайн тасралтгүй илрүүлэлт (ASM)"],
      [ic.userSecret, "Дайсны дуурайлт, хуурамч орчин", "LLM агентаар улаан багийн халдлагыг автоматжуулж хяналтыг тасралтгүй шалгах; динамик honeypot, хуурамч нууц үг"],
      [ic.grad, "Кибер полигон", "AI дайсантай, AI туслахтай дасгал сургуулилт: ҮБХИС-ийн сургалтад шууд нэвтрүүлэх боломж"],
    ];
    const lw = 6.1, rh = 1.3;
    rows.forEach((r, i) => iconRow(s, { x: M, y: 1.45 + i * rh, w: lw, h: rh - 0.1, data: r[0], head: r[1], desc: r[2], d: 0.6 }, "cti" + i));
    const cx = M + lw + 0.35, cw = CW - lw - 0.35;
    s.addChart(
      pres.ChartType.bar,
      [
        { name: "2024 (хагас финал)", labels: ["Эмзэг байдал илрүүлэлт", "Автомат засвар"], values: [37, 25] },
        { name: "2025 (финал)", labels: ["Эмзэг байдал илрүүлэлт", "Автомат засвар"], values: [77, 61] },
      ],
      {
        x: cx, y: 1.4, w: cw, h: 3.55, barDir: "col", barGrouping: "clustered", barGapWidthPct: 60,
        chartColors: [X.accent5, X.accent1], showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 11, dataLabelColor: X.dk1, dataLabelFontFace: "+mn-lt", dataLabelFormatCode: "0\"%\"",
        showTitle: true, title: "DARPA AI Cyber Challenge: AI системийн үр дүн, %", titleFontSize: 13, titleColor: X.dk1, titleFontFace: "+mj-lt",
        catAxisLabelColor: X.dk2, catAxisLabelFontSize: 11, catAxisLabelFontFace: "+mn-lt", valAxisLabelColor: X.dk2, valAxisLabelFontSize: 10, valAxisLabelFontFace: "+mn-lt",
        valAxisMaxVal: 100, valAxisMinVal: 0, valGridLine: { color: X.lt2, size: 0.75 }, catGridLine: { style: "none" }, valAxisLineShow: false,
        showLegend: true, legendPos: "b", legendFontSize: 10, legendColor: X.dk2, legendFontFace: "+mn-lt",
        objectName: "AIxCC chart",
      }
    );
    cardText(s, { x: cx, y: 5.1, w: cw, h: 1.7, fill: C.accent6, body: "Финал (DEF CON 33, 2025.08): 54 зохиомол эмзэг байдлаас 43-ыг автоматаар зассан; бодит 18 эмзэг байдал олсон; нэг даалгаврын дундаж зардал 152 $. Системүүд нээлттэй эх (Buttercup гэх мэт) → дотоод програм хангамжийг ашиглалтад оруулахаас өмнө AI-аар шалгах боломж", bodySize: 11.5 }, "aixcc note");
    notes(s, 10);
  }

  // ================= 11. AI-г өөрийг нь хамгаалах =================
  pres.addSection({ title: "AI системийн аюулгүй байдал, туршлага" });
  {
    const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "AI системийн аюулгүй байдал, туршлага" });
    s.addText("AI-г өөрийг нь хамгаалахгүйгээр AI-аар хамгаалах боломжгүй", { placeholder: "title" });
    const threats = [
      [ic.terminal, "Prompt injection", "Лог, имэйл, вэб хуудсанд нуусан заавраар SOC-ийн LLM-ийг удирдах"],
      [ic.skull, "Өгөгдөл хордуулах", "Сургалтын өгөгдөлд хортой жишээ → загвар тодорхой халдлагад «сохор»"],
      [ic.mask, "Зайлсхийлт (evasion)", "Оролтыг бага өөрчилж хортой кодыг «цэвэр» гэж ангилуулах"],
      [ic.link, "Нийлүүлэлтийн гинж", "Хордсон нээлттэй загвар, сан, өгөгдлийн багцаар арын хаалга суух"],
      [ic.key, "Агентын эрх хэтрүүлэлт", "Хэт их эрх, хэрэгсэлтэй агентын автомат үйлдлийг халдагч ашиглах"],
      [ic.unlock, "Хамгаалалт тойрох", "«CTF оюутан», «судлаач» дүр, даалгаврыг жижиглэх (Anthropic, Google баримтжуулсан)"],
    ];
    const cw = 2.95, gap = 0.2, ch = 1.6;
    threats.forEach((t, i) => {
      const x = M + (i % 3) * (cw + gap), y = 1.45 + Math.floor(i / 3) * (ch + 0.2);
      card(s, x, y, cw, ch, C.background2, "threat" + i);
      iconCircle(s, t[0], x + 0.18, y + 0.18, 0.5, C.accent2, "threat" + i);
      T(s, t[1], { x: x + 0.8, y: y + 0.15, w: cw - 0.95, h: 0.55, fontSize: 13, bold: true, color: C.text1, valign: "middle", objectName: "threat" + i + " head" });
      T(s, t[2], { x: x + 0.18, y: y + 0.78, w: cw - 0.36, h: ch - 0.85, fontSize: 11.5, color: C.text1, valign: "top", objectName: "threat" + i + " desc" });
    });
    const sx = M + 3 * (cw + gap), sw = CW - 3 * (cw + gap);
    card(s, sx, 1.45, sw, 3.4, C.text1, "shadow card");
    T(s, "Сүүдрийн AI (shadow AI)", { x: sx + 0.2, y: 1.6, w: sw - 0.4, h: 0.4, fontSize: 13, bold: true, color: C.accent4, objectName: "shadow head" });
    T(s, [
      { text: "1/5 ", options: { fontSize: 24, bold: true, color: C.background1 } },
      { text: "байгууллага сүүдрийн AI-аас үүдэлтэй зөрчилд өртсөн", options: { fontSize: 11.5, color: C.background1, breakLine: true } },
      { text: "+670 мянган $ ", options: { fontSize: 20, bold: true, color: C.background1 } },
      { text: "нэг зөрчлийн нэмэлт хохирол", options: { fontSize: 11.5, color: C.background1, breakLine: true } },
      { text: "37% ", options: { fontSize: 24, bold: true, color: C.background1 } },
      { text: "нь л AI ашиглалтын бодлоготой", options: { fontSize: 11.5, color: C.background1 } },
    ], { x: sx + 0.2, y: 2.05, w: sw - 0.4, h: 2.4, valign: "top", paraSpaceAfter: 8, objectName: "shadow stats" });
    T(s, "IBM Cost of a Data Breach 2025", { x: sx + 0.2, y: 4.45, w: sw - 0.4, h: 0.3, fontSize: 10, italic: true, color: C.accent5, objectName: "shadow source" });
    card(s, M, 5.1, CW, 1.7, C.accent6, "frameworks card");
    T(s, "Хамгаалах хүрээ, арга", { x: M + 0.22, y: 5.22, w: 4, h: 0.35, fontSize: 14, bold: true, color: C.text1, objectName: "fw head" });
    T(s, [
      { text: "Стандарт: ", options: { bold: true } },
      { text: "NIST AI RMF 1.0 • NIST AI 100-2e2025 • MITRE ATLAS • OWASP Top 10 for LLM • ISO/IEC 42001", options: {} },
    ], { x: M + 0.22, y: 5.62, w: 5.5, h: 1.1, fontSize: 12, color: C.text1, valign: "top", objectName: "fw standards" });
    T(s, [
      { text: "Техник, зохион байгуулалт: ", options: { bold: true } },
      { text: "оролт/гаралтын шүүлт • агентад хамгийн бага эрх • хэрэгслийн дуудлагыг бүртгэх • AI red team • загварын гарал үүсэл • AI засаглалын бодлого, системийн бүртгэл, зөрчил мэдээлэх журам", options: {} },
    ], { x: M + 6.0, y: 5.62, w: CW - 6.2, h: 1.1, fontSize: 12, color: C.text1, valign: "top", objectName: "fw technical" });
    notes(s, 11);
  }

  // ================= 12. Олон улсын туршлага =================
  {
    const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "AI системийн аюулгүй байдал, туршлага" });
    s.addText("Олон улсын туршлага, сургамж", { placeholder: "title" });
    const cw = 2.85, gap = (CW - 4 * cw) / 3, cy = 1.45, ch = 4.1;
    const items = [
      [ic.flagUsa, "АНУ", "DARPA AIxCC (2023–2025): AI-аар эмзэг байдал олж засах нээлттэй системүүд • CISA AI roadmap • БХЯ-ны CDAO • NIST AI RMF, AI 100-2", "Нээлттэй эхийн CRS турших, стандарт нутагшуулах"],
      [ic.globeEu, "NATO", "2021 AI стратеги, 2024 Хариуцлагатай AI-ийн хэрэгжилтийн стратеги • 2025: AI платформыг бодит цагийн кибер мэдээлэлд", "Хариуцлагатай AI-ийн 6 зарчмыг цэргийн журамд"],
      [ic.landmark, "Европын холбоо", "ENISA ETL 2025: AI = халдлагын оновчлол + шинэ эмзэг байдал (4,875 зөрчил) • AI Act: өндөр эрсдэлтэй AI-д шаардлага", "Эрсдэлд суурилсан ангилал, нэмэлт хяналт"],
      [ic.building, "Технологийн компаниуд", "Anthropic, Google, Microsoft: 2025 оноос AI-ийн хортой хэрэглээний тайлан, бүртгэл хаах, илрүүлэх ангилагч", "AI нийлүүлэгчтэй аюул заналын мэдээлэл солилцох суваг"],
    ];
    items.forEach((it, i) => {
      const x = M + i * (cw + gap);
      card(s, x, cy, cw, ch, C.background2, "intl" + i);
      iconCircle(s, it[0], x + 0.22, cy + 0.22, 0.6, C.accent3, "intl" + i);
      T(s, it[1], { x: x + 0.95, y: cy + 0.22, w: cw - 1.1, h: 0.6, fontSize: 15, bold: true, color: C.text1, valign: "middle", objectName: "intl" + i + " head" });
      T(s, it[2], { x: x + 0.22, y: cy + 0.95, w: cw - 0.44, h: 2.0, fontSize: 11.5, color: C.text1, valign: "top", objectName: "intl" + i + " body" });
      T(s, [{ text: "Сургамж: ", options: { bold: true, color: C.accent1 } }, { text: it[3], options: { color: C.text1 } }], { x: x + 0.22, y: cy + 2.75, w: cw - 0.44, h: 1.2, fontSize: 11.5, valign: "top", objectName: "intl" + i + " lesson" });
    });
    card(s, M, 5.8, CW, 1.0, C.accent6, "common lessons");
    T(s, [
      { text: "Нийтлэг сургамж: ", options: { bold: true } },
      { text: "1) туслахаас автономи руу үе шаттай  2) засаглалын бодлогоос эхлэх  3) өгөгдөл, загварыг дотооддоо  4) хүний нөөцийг «AI-тай хамтран ажиллах» чиглэлээр дахин сургах", options: {} },
    ], { x: M + 0.22, y: 5.8, w: CW - 0.44, h: 1.0, fontSize: 13, color: C.text1, valign: "middle", objectName: "common lessons text" });
    notes(s, 12);
  }

  // ================= 13. Монгол Улсын нөхцөл =================
  pres.addSection({ title: "Монгол Улс, санал зөвлөмж" });
  {
    const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Монгол Улс, санал зөвлөмж" });
    s.addText("Монгол Улсын нөхцөл байдал", { placeholder: "title" });
    T(s, "Институцийн суурь бий; AI-ийн тусгайлсан журам, өгөгдөл, дэд бүтэц, мэргэшсэн хүний нөөц дутмаг", { x: M, y: 1.2, w: CW, h: 0.25, fontSize: 11, italic: true, color: C.text2, objectName: "mn subtitle" });
    const lw = 3.4;
    statTile(s, { x: M, y: 1.45, w: lw, h: 1.65, value: "7,560", label: "кибер гэмт хэрэг 2024 онд; 83% нь залилан", source: "Кибер аюулгүй байдлын зөвлөл", valueSize: 30, compact: true }, "mn1");
    statTile(s, { x: M, y: 3.25, w: lw, h: 1.65, value: "29.4%", label: "төрийн байгууллага халдлагад өртсөн (67 байгууллагын судалгаа, 2021)", valueSize: 30, valueColor: C.text1, compact: true }, "mn2");
    statTile(s, { x: M, y: 5.05, w: lw, h: 1.75, value: "30%", label: "нь эрсдэлийн үнэлгээ огт хийгээгүй; 70.6% нь эрсдэлээ мэдэхгүй", valueSize: 30, valueColor: C.text1, compact: true }, "mn3");
    const mx = M + lw + 0.3, mw = 4.4;
    cardText(s, { x: mx, y: 1.45, w: mw, h: 5.35, head: "Хууль эрх зүй, бодлого", body: [
      "Кибер аюулгүй байдлын тухай хууль (2021.12.17): эрсдэлийн үнэлгээ, аудит, хариу үйлдэл; AI, автомат хариу үйлдлийн заалт байхгүй",
      "«Кибер сөрөн тэсвэрлэх тухай» хуулийн төсөл: AI заалт оруулах боломжит цонх",
      "2026–2030 оны таван жилийн үндсэн чиглэл: «Шинжлэх ухаан, технологи, хиймэл оюун»",
      "«Өгөгдөл, хиймэл оюуны үндэсний стратеги»: боловсруулах, өргөн барих шатанд",
      "Их Британитай хамтарсан үндэсний кибер эрсдэлийн үнэлгээ (2025)",
    ], bullets: true, bodySize: 12 }, "law");
    const rx = mx + mw + 0.3, rw = CW - lw - mw - 0.6;
    card(s, rx, 1.45, rw, 2.5, C.accent6, "strengths card");
    iconCircle(s, ic.check, rx + 0.2, 1.62, 0.5, C.accent1, "strengths");
    T(s, "Давуу тал", { x: rx + 0.85, y: 1.6, w: rw - 1.0, h: 0.55, fontSize: 14, bold: true, color: C.text1, valign: "middle", objectName: "strengths head" });
    bullets(s, ["КАБЦК, ҮБХИС-ийн тэнхим: институцийн суурь", "Хаалттай, тогтвортой сүлжээ", "Нээлттэй эхийн AI, SIEM/SOAR/CTI: бага зардал"], { x: rx + 0.2, y: 2.2, w: rw - 0.4, h: 1.7, fontSize: 11.5, color: C.text1, objectName: "strengths bullets" });
    card(s, rx, 4.1, rw, 2.7, C.background2, "challenges card");
    iconCircle(s, ic.warning, rx + 0.2, 4.27, 0.5, C.accent2, "challenges");
    T(s, "Сорилт", { x: rx + 0.85, y: 4.25, w: rw - 1.0, h: 0.55, fontSize: 14, bold: true, color: C.text1, valign: "middle", objectName: "challenges head" });
    bullets(s, ["ML, өгөгдлийн мэргэжилтэн ховор", "Тэмдэглэгдсэн өгөгдөл, монгол хэлний корпус байхгүй", "GPU, data lake хязгаарлагдмал; үүлэн AI боломжгүй", "AI журам, эрх зүйн үндэс байхгүй; лицензийн зардал"], { x: rx + 0.2, y: 4.85, w: rw - 0.4, h: 1.9, fontSize: 11.5, color: C.text1, objectName: "challenges bullets" });
    notes(s, 13);
  }

  // ================= 14. Лавлагаа архитектур =================
  {
    const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Монгол Улс, санал зөвлөмж" });
    s.addText("Лавлагаа архитектур: Зэвсэгт хүчний AI-д суурилсан SOC", { placeholder: "title" });
    const layers = [
      ["6", "Шинжээчийн туслах (copilot)", "Дотоод LLM + RAG, нууцлалтай сүлжээнд", "Энгийн хэлээр хайлт, тайлан, лог тайлбар"],
      ["5", "Оркестрац, хариу үйлдэл (SOAR)", "TheHive/Cortex, Shuffle; playbook сан", "Эрэмбэлэлт, батлагдсан playbook (түвшин 1–3)"],
      ["4", "CTI платформ", "MISP / OpenCTI; CERT.MN, КАБЗ-тэй солилцоо", "NLP-ээр IOC/TTP олборлох, эрэмбэлэх"],
      ["3", "Шинжилгээний хөдөлгүүр", "Anomaly, UEBA, график шинжилгээ, ATT&CK", "Үндсэн ML загварууд; MLOps, drift хяналт"],
      ["2", "Өгөгдлийн сан / SIEM", "OpenSearch/ELK, Wazuh; OCSF/ECS; 12+ сар", "Лог нормчлол, ML parser"],
      ["1", "Мэдрэгч (sensors)", "EDR, Suricata/Zeek, имэйл шүүлтүүр, IAM лог", "Edge дээр хөнгөн ML (хортой код, DGA)"],
    ];
    const lw = 8.3, lh = 0.76, lgap = 0.09;
    layers.forEach((l, i) => {
      const y = 1.45 + i * (lh + lgap);
      card(s, M, y, lw, lh, i % 2 === 0 ? C.accent6 : C.background2, "layer" + i);
      numCircle(s, M + 0.15, y + (lh - 0.5) / 2, 0.5, l[0], C.text1, C.background1, "layer" + i);
      T(s, l[1], { x: M + 0.8, y, w: 2.55, h: lh, fontSize: 12.5, bold: true, color: C.text1, valign: "middle", objectName: "layer" + i + " name" });
      T(s, l[2], { x: M + 3.4, y, w: 2.6, h: lh, fontSize: 11, color: C.text2, valign: "middle", objectName: "layer" + i + " comp" });
      T(s, l[3], { x: M + 6.1, y, w: lw - 6.2, h: lh, fontSize: 11, italic: true, bold: true, color: C.accent1, valign: "middle", objectName: "layer" + i + " ai" });
    });
    T(s, "Бүрэлдэхүүн (нээлттэй эх)", { x: M + 3.4, y: 1.2, w: 2.6, h: 0.25, fontSize: 9.5, color: C.text2, objectName: "col head comp" });
    T(s, "AI-ийн үүрэг", { x: M + 6.1, y: 1.2, w: 2.0, h: 0.25, fontSize: 9.5, color: C.text2, objectName: "col head ai" });
    const rx = M + lw + 0.3, rw = CW - lw - 0.3;
    card(s, rx, 1.45, rw, 2.5, C.text1, "gov card");
    iconCircle(s, ic.balance, rx + 0.2, 1.62, 0.5, C.accent1, "gov");
    T(s, "Засаглал, AI аюулгүй байдал", { x: rx + 0.85, y: 1.6, w: rw - 1.0, h: 0.55, fontSize: 13, bold: true, color: C.background1, valign: "middle", objectName: "gov head" });
    bullets(s, ["AI засаглалын бодлого, загварын бүртгэл", "AI red team, аудитын лог", "NIST AI RMF / MITRE ATLAS-д нийцэл"], { x: rx + 0.2, y: 2.25, w: rw - 0.4, h: 1.6, fontSize: 11.5, color: C.background1, objectName: "gov bullets" });
    card(s, rx, 4.1, rw, 2.5, C.text1, "people card");
    iconCircle(s, ic.users, rx + 0.2, 4.27, 0.5, C.accent1, "people");
    T(s, "Хүн, сургалт", { x: rx + 0.85, y: 4.25, w: rw - 1.0, h: 0.55, fontSize: 13, bold: true, color: C.background1, valign: "middle", objectName: "people head" });
    bullets(s, ["Tier 1–3 шинжээч, threat hunter, ML инженер, IR баг", "ҮБХИС-ийн кибер полигон", "Хүн шийдвэрийн гогцоонд"], { x: rx + 0.2, y: 4.9, w: rw - 0.4, h: 1.6, fontSize: 11.5, color: C.background1, objectName: "people bullets" });
    T(s, "Бүхэлдээ нээлттэй эх, дотоод (on-premise) байршуулалт боломжтой; автономийн түвшин 1–3", { x: M, y: 6.6, w: lw, h: 0.3, fontSize: 11, italic: true, color: C.accent1, bold: true, objectName: "arch note" });
    notes(s, 14);
  }

  // ================= 15. Замын зураг =================
  {
    const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Монгол Улс, санал зөвлөмж" });
    s.addText("Замын зураг 2026–2030: үе шаттай нэвтрүүлэлт", { placeholder: "title" });
    const cw = 3.85, gap = (CW - 3 * cw) / 2;
    s.addShape(pres.ShapeType.line, { x: M + cw / 2, y: 1.75, w: 2 * (cw + gap), h: 0, line: { color: C.accent5, width: 2, dashType: "dash" }, objectName: "timeline" });
    const phases = [
      ["I", "Суурь", "2026 IV улирал – 2027", C.accent1, ["AI ашиглалтын түр журам (shadow AI хориглох, зөвшөөрөгдсөн хэрэгсэл)", "Нээлттэй эхийн SIEM, CTI (MISP): лог, өгөгдөл хуримтлуулж эхлэх", "Монгол хэлний фишингийн өгөгдлийн багц", "AI SOC-ийн техник, эдийн засгийн үндэслэл"], "КАБЦК, БХЯ, ҮБХИС"],
      ["II", "Туршилт", "2027–2028", C.accent3, ["1–2-р түвшний AI (triage, баяжуулалт, дотоод copilot) тусгаарлагдсан орчинд; худал сэрэмжлүүлэг, MTTD/MTTR хэмжих", "Кибер полигонд AI дайсны дуурайлт", "AIxCC нээлттэй эхээр дотоод кодыг шалгах"], "КАБЦК, ҮБХИС, БХЭШХ"],
      ["III", "Нэвтрүүлэлт", "2028–2030", C.text1, ["AI SOC ашиглалтад; 3-р түвшний playbook хязгаарлагдмал хүрээнд", "CERT, КАБЗ-тэй STIX/TAXII солилцоо", "Үр дүнг хэмжиж журам, сургалтыг шинэчлэх"], "КАБЦК, БХЯ, ЦХИХХЯ"],
    ];
    phases.forEach((p, i) => {
      const x = M + i * (cw + gap);
      circle(s, x + cw / 2 - 0.3, 1.45, 0.6, p[3], "phase" + i + " dot");
      T(s, p[0], { x: x + cw / 2 - 0.3, y: 1.45, w: 0.6, h: 0.6, fontSize: 14, bold: true, color: C.background1, align: "center", valign: "middle", objectName: "phase" + i + " roman" });
      card(s, x, 2.25, cw, 3.65, C.background2, "phase" + i);
      T(s, p[1], { x: x + 0.22, y: 2.38, w: cw - 0.44, h: 0.4, fontSize: 16, bold: true, color: p[3], valign: "middle", objectName: "phase" + i + " name" });
      T(s, p[2], { x: x + 0.22, y: 2.78, w: cw - 0.44, h: 0.3, fontSize: 11.5, italic: true, color: C.text2, objectName: "phase" + i + " period" });
      bullets(s, p[4], { x: x + 0.22, y: 3.15, w: cw - 0.44, h: 2.3, fontSize: 11.5, color: C.text1, objectName: "phase" + i + " bullets" });
      T(s, "Хариуцах: " + p[5], { x: x + 0.22, y: 5.5, w: cw - 0.44, h: 0.3, fontSize: 10.5, italic: true, color: C.text2, objectName: "phase" + i + " owner" });
    });
    card(s, M, 6.05, CW, 0.75, C.accent6, "kpi strip");
    T(s, [{ text: "KPI: ", options: { bold: true } }, { text: "илрүүлэх дундаж хугацаа (MTTD) • хариу үйлдлийн дундаж хугацаа (MTTR) • худал сэрэмжлүүлгийн хувь • нэг шинжээчид ногдох хаасан зөрчил • AI-ийн саналыг хүн буцаасан хувь (override rate)", options: {} }], { x: M + 0.22, y: 6.05, w: CW - 0.44, h: 0.75, fontSize: 12, color: C.text1, valign: "middle", objectName: "kpi text" });
    notes(s, 15);
  }

  // ================= 16. Технологи, чадавх =================
  {
    const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Монгол Улс, санал зөвлөмж" });
    s.addText("Технологи, чадавх хөгжүүлэх санал", { placeholder: "title" });
    const cw = 2.85, gap = (CW - 4 * cw) / 3, cy = 1.45, ch = 4.35;
    const items = [
      [ic.chip, "Дотоод AI дэд бүтэц", ["Нууцлалтай сүлжээнд GPU сервер", "Нээлттэй эхийн LLM + RAG", "MLOps: дахин сургалт, drift хяналт", "Үүлэн AI зөвхөн нээлттэй мэдээлэлд"]],
      [ic.db, "Өгөгдлийн чадавх", ["Цэргийн сүлжээний «хэвийн зан төлөв»-ийн суурь өгөгдөл", "Тэмдэглэгдсэн зөрчлийн архив", "Монгол хэлний NLP корпус", "Өгөгдөлгүйгээр AI үр дүнгүй"]],
      [ic.users, "Хүний нөөц, ҮБХИС", ["«AI ба кибер хамгаалалт» хичээл, магистрын чиглэл", "SOC шинжээчдийг AI хэрэгсэл, агентын аюулгүй байдлаар дахин сургах", "ML инженер, өгөгдлийн эрдэмтний 3–5 орон тоо", "БХЭШХ-тэй хамтарсан судалгаа"]],
      [ic.knight, "Кибер полигон, дасгал", ["AI дайсантай, AI туслахтай сургуулилт", "Жил бүрийн Зэвсэгт хүчний кибер дасгалд AI хувилбар", "Түншлэгч орнуудын дасгалд оролцох"]],
    ];
    items.forEach((it, i) => {
      const x = M + i * (cw + gap);
      card(s, x, cy, cw, ch, C.background2, "cap" + i);
      iconCircle(s, it[0], x + 0.22, cy + 0.22, 0.6, C.accent1, "cap" + i);
      T(s, it[1], { x: x + 0.95, y: cy + 0.22, w: cw - 1.1, h: 0.6, fontSize: 14, bold: true, color: C.text1, valign: "middle", objectName: "cap" + i + " head" });
      bullets(s, it[2], { x: x + 0.22, y: cy + 1.0, w: cw - 0.44, h: ch - 1.1, fontSize: 12, color: C.text1, objectName: "cap" + i + " bullets" });
    });
    card(s, M, 6.0, CW, 0.8, C.accent6, "principle strip");
    T(s, [{ text: "Зарчим: ", options: { bold: true } }, { text: "нээлттэй эх + дотоод байршуулалт + үе шаттай нэвтрүүлэлт; арилжааны платформын лицензээс хараат болохгүй; хэмжигдэх KPI-тай", options: {} }], { x: M + 0.22, y: 6.0, w: CW - 0.44, h: 0.8, fontSize: 13, color: C.text1, valign: "middle", objectName: "principle text" });
    notes(s, 16);
  }

  // ================= 17. Бодлого, журам =================
  {
    const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Монгол Улс, санал зөвлөмж" });
    s.addText("Бодлого, журамд тусгах санал", { placeholder: "title" });
    const items = [
      [ic.clipboard, "Батлан хамгаалах салбарын AI ашиглалтын журам", "БХ-ын сайдын тушаал: зөвшөөрөгдсөн/хориглосон хэрэглээ, мэдээллийн ангилалтай уялдсан хязгаарлалт, AI системийн бүртгэл, хариуцлага"],
      [ic.balance, "Автомат хариу үйлдлийн эрх зүйн үндэс", "Автономийн түвшин бүрт батлах эрх, AI-ийн хийж болох/үл болох үйлдэл; онц чухал системд human-in-the-loop заавал"],
      [ic.fileAlt, "AI-тай холбоотой зөрчлийг мэдээлэх журам", "Prompt injection, poisoning, AI-ийн буруу шийдвэрээс үүдсэн зөрчлийг тусад нь бүртгэж Кибер аюулгүй байдлын зөвлөлд мэдээлэх"],
      [ic.cart, "Худалдан авалтын стандарт", "Дотоод байршуулалт, өгөгдөл гадагш гарахгүй, загварын гарал үүсэл, тайлбарлах чадвар, NIST AI RMF / MITRE ATLAS-д нийцэл"],
      [ic.gavel, "Хууль тогтоомжид нэмэлт", "Кибер аюулгүй байдлын тухай хууль, «Кибер сөрөн тэсвэрлэх» төсөлд: автоматжуулсан хамгаалалтын эрх зүйн статус, AI системийг ОЧМДБ-ийн бүрэлдэхүүн гэж тооцох, CTI солилцооны үүрэг"],
      [ic.handshake, "Үндэсний стратеги, олон улсын хамтын ажиллагаа", "«Өгөгдөл, хиймэл оюуны үндэсний стратеги»-д батлан хамгаалах бүлэг; 2026–2030 чиглэлд AI SOC төслийг санхүүжилттэй; NATO RAI зарчим, NIST стандарт нутагшуулах"],
    ];
    const cw = (CW - 0.4) / 2, rh = 1.65;
    items.forEach((it, i) => {
      const x = M + (i % 2) * (cw + 0.4), y = 1.45 + Math.floor(i / 2) * (rh + 0.1);
      card(s, x, y, cw, rh, i % 2 === 0 ? C.background2 : C.accent6, "pol" + i);
      numCircle(s, x + 0.2, y + 0.2, 0.55, i + 1, C.text1, C.background1, "pol" + i);
      T(s, it[1], { x: x + 0.95, y: y + 0.15, w: cw - 1.15, h: 0.6, fontSize: 13.5, bold: true, color: C.text1, valign: "middle", objectName: "pol" + i + " head" });
      T(s, it[2], { x: x + 0.2, y: y + 0.8, w: cw - 0.4, h: rh - 0.9, fontSize: 11.5, color: C.text1, valign: "top", objectName: "pol" + i + " desc" });
    });
    T(s, "Дэлгэрэнгүй: судалгааны материалын 8-р бүлэг (арга хэмжээний замын зураг, технологи/чадавх, бодлого/журмын 12 санал)", { x: M, y: 6.7, w: CW, h: 0.3, fontSize: 10.5, italic: true, color: C.text2, objectName: "pol note" });
    notes(s, 17);
  }

  // ================= 18. Дүгнэлт =================
  pres.addSection({ title: "Дүгнэлт" });
  {
    const s = pres.addSlide({ masterName: "DARK", sectionTitle: "Дүгнэлт" });
    s.addText("Дүгнэлт", { placeholder: "title" });
    const pts = [
      "Халдагч AI-г мөчлөгийн бүх үе шатад ашиглаж, 2025 оноос автономи агентын түвшинд хүрсэн: хурд, цар хүрээ хүнийг давж байна",
      "AI нь илрүүлэлт, SOC, хариу үйлдэл, аюул заналын мэдээлэл, урьдчилан сэргийлэлтэд хэмжигдэхүйц үр дүн өгч байна (–1.9 сая $, –80 хоног)",
      "AI шинэ эрсдэл дагуулна: hallucination, adversarial халдлага, shadow AI. AI-г хамгаалахгүйгээр AI-аар хамгаалах боломжгүй",
      "Цэргийн зөв зам: дотоод, нээлттэй эх, автономийн зэрэглэл, хүн шийдвэрийн гогцоонд, өгөгдөл + хүний нөөцтэй зэрэгцүүлсэн үе шаттай нэвтрүүлэлт",
      "Монголд институцийн суурь бий; дутагдаж буй журам, өгөгдөл, дэд бүтэц, мэргэшсэн хүний нөөц, санхүүжилтийг 2026–2030 онд шийдвэрлэх боломжтой",
    ];
    pts.forEach((p, i) => {
      const y = 1.5 + i * 1.02;
      numCircle(s, M, y + 0.1, 0.6, i + 1, C.accent1, C.background1, "concl" + i);
      T(s, p, { x: M + 0.85, y, w: 8.9, h: 0.92, fontSize: 14, color: C.background1, valign: "middle", objectName: "concl" + i + " text" });
    });
    circle(s, 10.35, 2.3, 2.5, C.accent1, "concl emblem circle");
    s.addImage({ data: ic.shield, x: 10.9, y: 2.75, w: 1.4, h: 1.5, objectName: "concl emblem" });
    T(s, "AI-аар хамгаалах + AI-г хамгаалах", { x: 9.75, y: 5.0, w: 3.6, h: 0.7, fontSize: 13, bold: true, italic: true, color: C.accent4, align: "center", objectName: "concl motto" });
    notes(s, 18);
  }

  // ================= 19. Асуултууд =================
  {
    const s = pres.addSlide({ masterName: "DARK", sectionTitle: "Дүгнэлт" });
    s.addText("Хэлэлцүүлэгт дэвшүүлэх асуултууд", { placeholder: "title" });
    const qs = [
      "Зэвсэгт хүчний сүлжээнд автономийн ямар түвшнийг, ямар нөхцөлд зөвшөөрөх вэ? Хариуцлагыг хэн хүлээх вэ?",
      "Нууцлалтай сүлжээний AI өгөгдөл, тооцоолох дэд бүтцийг дотооддоо бүхэлд нь байгуулах уу, төрийн дата төвтэй хуваалцах уу?",
      "CERT, Кибер аюулгүй байдлын зөвлөл, хувийн хэвшил, Зэвсэгт хүчний хооронд машин уншигдахуйц CTI солилцох механизм ямар байх вэ?",
      "ҮБХИС-ийн сургалтын хөтөлбөрт AI-кибер хамгаалалтыг хэрхэн, хэзээ оруулах вэ? Ямар орон тоо шаардлагатай вэ?",
      "Арилжааны платформ уу, нээлттэй эх үү, холимог уу? Санхүүжилтийн эх үүсвэр?",
    ];
    qs.forEach((q, i) => {
      const y = 1.45 + i * 0.9;
      numCircle(s, M, y + 0.1, 0.55, i + 1, C.accent4, C.text1, "q" + i);
      T(s, q, { x: M + 0.8, y, w: 11.3, h: 0.8, fontSize: 14, color: C.background1, valign: "middle", objectName: "q" + i + " text" });
    });
    T(s, "Анхаарал хандуулсанд баярлалаа", { x: M, y: 6.05, w: 8, h: 0.6, fontSize: 24, bold: true, color: C.accent4, valign: "middle", objectName: "thanks" });
    T(s, "Судалгааны материал (24 хуудас, 19 эх сурвалж) хэлэлцүүлгийн материалд хавсаргав", { x: M, y: 6.6, w: 10, h: 0.35, fontSize: 11, italic: true, color: C.accent5, objectName: "thanks note" });
    notes(s, 19);
  }

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("Written:", OUT, "slides:", Object.keys(NOTES).length, "notes");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
