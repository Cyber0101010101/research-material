/*
 * India–Mongolia cyber security cooperation briefing
 * Cyber Security Department, National Defence University of Mongolia
 * Build:  SKILL_DIR=<pptx skill dir> node build.js ../india_mongolia_cyber_cooperation.pptx
 */
const pptxgen = require("pptxgenjs");
const path = require("path");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const Fa = require("react-icons/fa");
const { applyTheme } = require(process.env.SKILL_DIR + "/scripts/apply_theme.js");
const DATA = require("./data.js");
const SPEECH = require("./speech_mn.js");
const SPEECH_EN = require("./speech_en.js");
let slideNo = 0;

const OUT = process.argv[2] || "india_mongolia_cyber_cooperation.pptx";
const IMG = (f) => path.join(__dirname, "..", "images", f);

// ---------- theme ----------
const THEME = {
  name: "India Mongolia Cyber",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "16213A", lt1: "FFFFFF", dk2: "5B6474", lt2: "EEF2F7",
    accent1: "D9772B", // saffron – India
    accent2: "1F6FD1", // blue – Mongolia
    accent3: "1BA39C", // teal – joint
    accent4: "B3261E", // alert red – unconfirmed data
    accent5: "A3ACBA", // gray
    accent6: "D6E4F5", // ice text on dark
    hlink: "1F6FD1", folHlink: "D9772B",
  },
};
const H = THEME.colors;
const DARK = "12294A";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "India–Mongolia Cooperation in Cyber Security Education";
pres.author = "Cyber Security Department, NDU Mongolia";
pres.lang = "en-US";
const C = pres.SchemeColor;
const W = 13.333;
const FOOTER = "Cyber Security Department · National Defence University of Mongolia · 14th India–Mongolia JWG, 2026";

// ---------- icons ----------
async function icon(name, hex, px = 256) {
  if (!Fa[name]) throw new Error("Unknown icon " + name);
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Fa[name], { color: "#" + hex, size: px }));
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}
const ICON_NAMES = [
  "FaHandshake", "FaShieldAlt", "FaGraduationCap", "FaChalkboardTeacher", "FaNetworkWired", "FaUsers",
  "FaCalendarAlt", "FaServer", "FaSearch", "FaGlobeAsia", "FaUserTie", "FaCheckCircle",
  "FaExclamationTriangle", "FaLightbulb", "FaFlask", "FaTrophy", "FaBookOpen", "FaUniversity", "FaMedal",
  "FaComments", "FaMobileAlt", "FaUserSecret", "FaExchangeAlt", "FaCertificate", "FaGavel", "FaBuilding",
  "FaFlagCheckered", "FaTools", "FaRobot", "FaListOl", "FaFileSignature", "FaMicrochip",
];
const ICONS = {};

// ---------- helpers ----------
function shadow() { return { type: "outer", color: "000000", blur: 4, offset: 2, angle: 90, opacity: 0.12 }; }
function card(slide, x, y, w, h, opts = {}) {
  slide.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.12,
    fill: { color: opts.fill || C.background2 },
    line: opts.line ? { color: opts.line, width: 0.75 } : { color: opts.fill || C.background2, width: 0 },
    shadow: opts.shadow ? shadow() : undefined, objectName: opts.name || "card",
  });
}
function iconCircle(slide, name, x, y, d, fillColor, key = "white") {
  slide.addShape(pres.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: fillColor }, line: { color: fillColor, width: 0 }, objectName: "icon circle" });
  const pad = d * 0.26;
  slide.addImage({ data: ICONS[name + ":" + key], x: x + pad, y: y + pad, w: d - 2 * pad, h: d - 2 * pad, objectName: name });
}
function text(slide, str, o) {
  slide.addText(str, Object.assign({ isTextBox: true, margin: 0, fontSize: 14, color: C.text1, valign: "top" }, o));
}
function bullets(slide, items, o) {
  const runs = items.map((t, i) => ({ text: t, options: { bullet: { indent: 14 }, breakLine: i < items.length - 1 } }));
  slide.addText(runs, Object.assign({ isTextBox: true, margin: 0, fontSize: 14, color: C.text1, valign: "top", paraSpaceAfter: 6 }, o));
}
function badge(slide, x, y, w, label) {
  slide.addShape(pres.ShapeType.roundRect, { x, y, w, h: 0.3, rectRadius: 0.15, fill: { color: C.accent4 }, line: { color: C.accent4, width: 0 }, objectName: "note badge" });
  text(slide, label, { x, y, w, h: 0.3, fontSize: 9, bold: true, color: C.background1, align: "center", valign: "middle" });
}
function photo(slide, file, x, y, w, h, caption, capH = 0.45) {
  slide.addImage({ path: IMG(file), x, y, w, h, sizing: { type: "cover", w, h }, objectName: file });
  if (caption) text(slide, caption, { x, y: y + h + 0.05, w, h: capH, fontSize: 10.5, color: C.text2 });
}
function statTile(slide, x, y, w, h, value, label, color, opts = {}) {
  card(slide, x, y, w, h, { fill: opts.fill || C.background2 });
  text(slide, value, { x: x + 0.2, y: y + 0.1, w: w - 0.4, h: h * 0.5, fontSize: opts.valueSize || 32, bold: true, color, fontFace: THEME.headFontFace, valign: "middle" });
  text(slide, label, { x: x + 0.2, y: y + h * 0.58, w: w - 0.4, h: h * 0.4, fontSize: opts.labelSize || 10.5, color: C.text2, valign: "top" });
}
function notes(slide, mn, en) {
  slideNo += 1;
  const script = SPEECH[String(slideNo)] || ("МН: " + mn);
  const scriptEn = SPEECH_EN[String(slideNo)] || en;
  slide.addNotes(script + "\n\n— EN —\n" + scriptEn);
}
function dateChip(slide, x, y, w, label, color) {
  slide.addShape(pres.ShapeType.roundRect, { x, y, w, h: 0.34, rectRadius: 0.17, fill: { color }, line: { color, width: 0 }, objectName: "date chip" });
  text(slide, label, { x, y, w, h: 0.34, fontSize: 10.5, bold: true, color: C.background1, align: "center", valign: "middle" });
}
function sectionSlide(num, title, sub, mn, en) {
  pres.addSection({ title: num + " " + title });
  const s = pres.addSlide({ masterName: "SECTION", sectionTitle: num + " " + title });
  text(s, num, { x: 0.8, y: 1.9, w: 3, h: 1.0, fontSize: 60, bold: true, color: C.accent1, fontFace: THEME.headFontFace });
  s.addText(title, { placeholder: "title" });
  s.addText(sub, { placeholder: "body" });
  notes(s, mn, en);
  return num + " " + title;
}
function chartStyle(extra = {}) {
  return Object.assign({
    chartColors: [H.accent2], showLegend: false, showTitle: false, showValue: true,
    dataLabelFontSize: 11, dataLabelColor: H.dk1, dataLabelFontFace: "+mn-lt",
    catAxisLabelFontSize: 10.5, catAxisLabelColor: H.dk2, catAxisLabelFontFace: "+mn-lt",
    valAxisLabelFontSize: 10, valAxisLabelColor: H.dk2, valAxisLabelFontFace: "+mn-lt",
    valGridLine: { color: "DDE3EC", size: 0.5 }, catGridLine: { style: "none" },
    catAxisLineShow: false, valAxisLineShow: false, barGapWidthPct: 45,
  }, extra);
}
const kindColor = (k) => k === "india" ? C.accent1 : k === "joint" ? C.accent3 : C.accent2;
function legend(slide, x, y) {
  [["India-led", C.accent1], ["Joint", C.accent3], ["Mongolia-led", C.accent2]].forEach((l, i) => {
    const lx = x + i * 1.7;
    slide.addShape(pres.ShapeType.ellipse, { x: lx, y: y + 0.05, w: 0.2, h: 0.2, fill: { color: l[1] }, line: { color: l[1], width: 0 }, objectName: "legend " + l[0] });
    text(slide, l[0], { x: lx + 0.3, y, w: 1.3, h: 0.3, fontSize: 10.5, color: C.text2, valign: "middle" });
  });
}

// ---------- layouts ----------
pres.defineSlideMaster({
  title: "TITLE", background: { color: DARK },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.8, y: 2.1, w: 9.4, h: 1.9, fontSize: 40, bold: true, color: C.background1, valign: "bottom", margin: 0 } } },
    { placeholder: { options: { name: "body", type: "body", x: 0.8, y: 4.15, w: 9.4, h: 1.7, fontSize: 16, color: C.accent6, valign: "top", margin: 0 } } },
  ],
});
pres.defineSlideMaster({
  title: "SECTION", background: { color: DARK },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.8, y: 3.0, w: 11.7, h: 1.2, fontSize: 40, bold: true, color: C.background1, valign: "middle", margin: 0 } } },
    { placeholder: { options: { name: "body", type: "body", x: 0.8, y: 4.25, w: 11.7, h: 0.8, fontSize: 18, color: C.accent6, valign: "top", margin: 0 } } },
  ],
});
pres.defineSlideMaster({
  title: "CONTENT", background: { color: H.lt1 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.4, w: 12.1, h: 0.9, fontSize: 30, bold: true, color: C.text1, valign: "middle", margin: 0 } } },
    { text: { text: FOOTER, options: { x: 0.6, y: 7.05, w: 9, h: 0.3, fontSize: 9, color: C.text2, margin: 0 } } },
  ],
  slideNumber: { x: 12.2, y: 7.05, w: 0.6, h: 0.3, fontSize: 9, color: H.dk2, align: "right" },
});
pres.defineSlideMaster({
  title: "CLOSING", background: { color: DARK },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.8, y: 2.0, w: 7.2, h: 1.3, fontSize: 44, bold: true, color: C.background1, valign: "middle", margin: 0 } } },
    { placeholder: { options: { name: "body", type: "body", x: 0.8, y: 3.4, w: 7.2, h: 2.4, fontSize: 15, color: C.accent6, valign: "top", margin: 0 } } },
  ],
});

(async () => {
  for (const n of ICON_NAMES) {
    ICONS[n + ":white"] = await icon(n, "FFFFFF");
    ICONS[n + ":navy"] = await icon(n, H.dk1);
  }
  let s, sec;

  // =====================================================================
  // 1. TITLE
  // =====================================================================
  pres.addSection({ title: "Opening" });
  s = pres.addSlide({ masterName: "TITLE", sectionTitle: "Opening" });
  s.addImage({ path: IMG("ndu_emblem.png"), x: 0.8, y: 0.6, w: 1.1, h: 1.1, objectName: "NDU emblem" });
  text(s, "National Defence University of Mongolia", { x: 2.05, y: 0.62, w: 7, h: 0.5, fontSize: 14, bold: true, color: C.accent6, valign: "middle" });
  text(s, "Military Institute · Cyber Security Department", { x: 2.05, y: 1.07, w: 7, h: 0.5, fontSize: 12, color: C.accent5, valign: "middle" });
  s.addText("India–Mongolia Cooperation in Cyber Security Education", { placeholder: "title" });
  s.addText([
    { text: "The Cyber Security Training Centre, 2015–2026, and the road to 2030", options: { bold: true, breakLine: true } },
    { text: "Briefing for the delegation of the Ministry of Defence, Government of India", options: { breakLine: true } },
    { text: "14th Meeting of the India–Mongolia Joint Working Group on Defence Cooperation", options: {} },
  ], { placeholder: "body" });
  s.addImage({ path: IMG("dept_emblem.png"), x: 10.5, y: 2.2, w: 2.2, h: 2.2, objectName: "Department emblem" });
  s.addShape(pres.ShapeType.ellipse, { x: 11.0, y: 4.7, w: 0.45, h: 0.45, fill: { color: C.accent1 }, line: { color: C.accent1, width: 0 }, objectName: "india dot" });
  s.addShape(pres.ShapeType.ellipse, { x: 11.75, y: 4.7, w: 0.45, h: 0.45, fill: { color: C.accent2 }, line: { color: C.accent2, width: 0 }, objectName: "mongolia dot" });
  text(s, DATA.event.dateLabel, { x: 0.8, y: 6.5, w: 9, h: 0.4, fontSize: 12, color: C.accent5 });
  notes(s, "Нээлтийн үг. Төлөөлөгчдийг угтаж, илтгэлийн зорилгыг нэг өгүүлбэрээр хэлнэ.",
    "Good morning. On behalf of the National Defence University of Mongolia, welcome to the Cyber Security Department. This Department exists because of our partnership with India, so it is a particular pleasure to host the Ministry of Defence delegation during the 14th Joint Working Group. In the next twenty-three minutes I will show where the cooperation came from, what has been built here with India's support, what it has delivered since 2022, and what we propose for the next phase.");

  // =====================================================================
  // 2. WELCOME + OUTLINE
  // =====================================================================
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Opening" });
  s.addText("Welcome to the Cyber Security Department", { placeholder: "title" });
  card(s, 0.6, 1.5, 6.2, 5.3);
  text(s, "Distinguished guests", { x: 0.9, y: 1.7, w: 5.6, h: 0.4, fontSize: 18, bold: true, fontFace: THEME.headFontFace });
  text(s, "Delegation of the Ministry of Defence, Government of India", { x: 0.9, y: 2.1, w: 5.6, h: 0.35, fontSize: 12, color: C.text2 });
  DATA.delegation.forEach((d, i) => {
    const y = 2.6 + i * 1.0;
    iconCircle(s, "FaUserTie", 0.9, y, 0.62, C.accent1);
    text(s, d.name, { x: 1.7, y: y - 0.02, w: 4.9, h: 0.35, fontSize: 15, bold: true });
    text(s, d.role, { x: 1.7, y: y + 0.32, w: 4.9, h: 0.35, fontSize: 12, color: C.text2 });
  });
  text(s, "Briefing outline · about 21 minutes", { x: 7.3, y: 1.5, w: 5.4, h: 0.4, fontSize: 18, bold: true, fontFace: THEME.headFontFace });
  const agenda = [
    ["01", "Partnership context", "70 years of relations; why cyber is a shared priority", "2.5 min"],
    ["02", "Establishing the Centre", "2015 MoU, 2022 inauguration, India's contribution, people", "6 min"],
    ["03", "Results 2022–2026", "Training output, curriculum, research, 2025 upgrade", "8 min"],
    ["04", "The road ahead", "Proposals for the next phase and for the 14th JWG", "3.5 min"],
  ];
  agenda.forEach((a, i) => {
    const y = 2.05 + i * 1.2;
    card(s, 7.3, y, 5.4, 1.05, { fill: C.background1, line: "DDE3EC" });
    text(s, a[0], { x: 7.5, y: y + 0.12, w: 0.8, h: 0.8, fontSize: 26, bold: true, color: C.accent2, fontFace: THEME.headFontFace, valign: "middle" });
    text(s, a[1], { x: 8.35, y: y + 0.14, w: 3.4, h: 0.4, fontSize: 15, bold: true });
    text(s, a[2], { x: 8.35, y: y + 0.52, w: 3.7, h: 0.45, fontSize: 11, color: C.text2 });
    text(s, a[3], { x: 11.85, y: y + 0.14, w: 0.7, h: 0.4, fontSize: 12, bold: true, color: C.accent1, align: "right" });
  });
  text(s, "Followed by questions and a tour of the laboratories", { x: 7.3, y: 6.9, w: 5.4, h: 0.3, fontSize: 11, italic: true, color: C.text2 });
  notes(s, "Төлөөлөгчдийг нэрээр нь хүндэтгэн дурдаж, илтгэлийн 4 хэсэг, хугацааг танилцуулна.",
    "Let me first acknowledge our guests: Ms Ishita Ganguli Tripathy, Joint Secretary; Mr Vikash Kumar and Colonel Baljit Singh, Directors; and Colonel Mupparty Sanjeev, Defence Attaché, who already knows this Department from his visit last year. The briefing has four parts: the partnership context, how the Centre was established, what it has delivered since 2022, and our proposals for the next phase. We will then take questions and walk through the laboratories.");

  // =====================================================================
  // 3–6. SECTION 01
  // =====================================================================
  sec = sectionSlide("01", "Partnership context", "Seven decades of friendship, a decade of strategic partnership", "Хэсгийн хуудас.", "Part one: the context in which this Centre was created.");

  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: sec });
  s.addText("Seven decades of friendship, a decade of strategic partnership", { placeholder: "title" });
  const tl = [
    ["1955", "Diplomatic relations", "24 December. India becomes the first country outside the Soviet bloc to establish relations with Mongolia", C.accent5],
    ["1994", "Treaty of Friendly Relations and Cooperation", "Legal foundation of the modern partnership", C.accent5],
    ["2001", "Agreement on Defence Cooperation", "Followed by the Joint Working Group of the two Defence Ministries, now meeting every year", C.accent2],
    ["2015", "Strategic Partnership", "First visit of an Indian Prime Minister; 17 May: Memorandum to establish a Cyber Security Training Centre at the Ministry of Defence", C.accent1],
    ["2022", "Cyber Security Training Centre opens", "6 September. First visit of an Indian Defence Minister; Centre inaugurated at NDU by the two Defence Ministers", C.accent1],
    ["2025", "70 years · State visit to India", "13–16 October. President Khurelsukh in New Delhi; India to open a Defence Wing in Ulaanbaatar", C.accent2],
  ];
  const tx0 = 0.7, tw = 12.0, colW = tw / tl.length, lineY = 3.55;
  s.addShape(pres.ShapeType.line, { x: tx0 + colW / 2, y: lineY, w: tw - colW, h: 0, line: { color: C.accent5, width: 2 }, objectName: "timeline" });
  tl.forEach((t, i) => {
    const cx = tx0 + colW * i + colW / 2;
    text(s, t[0], { x: cx - colW / 2, y: 1.6, w: colW, h: 0.6, fontSize: 28, bold: true, color: t[3], fontFace: THEME.headFontFace, align: "center", valign: "bottom" });
    text(s, t[1], { x: cx - colW / 2 + 0.1, y: 2.25, w: colW - 0.2, h: 0.95, fontSize: 13, bold: true, align: "center" });
    s.addShape(pres.ShapeType.ellipse, { x: cx - 0.17, y: lineY - 0.17, w: 0.34, h: 0.34, fill: { color: t[3] }, line: { color: C.background1, width: 2 }, objectName: "node " + t[0] });
    text(s, t[2], { x: cx - colW / 2 + 0.1, y: 3.95, w: colW - 0.2, h: 1.8, fontSize: 11.5, color: C.text2, align: "center" });
  });
  card(s, 0.7, 5.85, 12.0, 0.95);
  iconCircle(s, "FaHandshake", 0.95, 6.0, 0.65, C.accent3);
  text(s, "Under the 2015 Memorandum, the Cyber Security Training Centre was built in 2021–2022 and has run with Indian training teams since 2023. It is the most tangible institution of the defence partnership.",
    { x: 1.8, y: 5.95, w: 10.7, h: 0.75, fontSize: 13, valign: "middle" });
  notes(s, "Түүхэн замнал: 1955 → 1994 гэрээ → 2001 БХ-ын хэлэлцээр → 2015 стратегийн түншлэл + Кибер төвийн санамж бичиг (05.17) → 2022 нээлт → 2025 Төрийн айлчлал.",
    "India was the first country outside the Soviet bloc to recognise Mongolia, in December 1955. The 1994 Treaty and the 2001 Agreement on Defence Cooperation gave the relationship its legal frame, and the Joint Working Group grew out of that agreement. The Strategic Partnership of 2015 opened the current chapter, and on 17 May 2015 the two governments signed the Memorandum to establish a Cyber Security Training Centre at our Ministry of Defence. That Centre was inaugurated on 6 September 2022 during the first-ever visit of an Indian Defence Minister. Last October, President Khurelsukh's state visit marked seventy years of relations and India decided to open a Defence Wing in Ulaanbaatar.");

  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: sec });
  s.addText("Why cyber: a shared priority for both armed forces", { placeholder: "title" });
  text(s, "Mongolia's cyber security baseline", { x: 0.6, y: 1.45, w: 6.3, h: 0.4, fontSize: 16, bold: true, fontFace: THEME.headFontFace });
  const ctx = [
    ["56.4", "Mongolia's score in the ITU Global Cybersecurity Index 2024 – ranked 103rd of 193", C.accent2],
    ["+17", "places gained in the Index since 2020, still below the Asian average", C.accent3],
    ["90,000+", "cyber attacks detected in Mongolia every week (national cyber security officials, Jan 2024)", C.accent4],
    ["2021", "first Law on Cyber Security (17 Dec 2021, in force 1 May 2022); the Armed Forces named as a supporting authority", C.accent1],
  ];
  ctx.forEach((c, i) => {
    const x = 0.6 + (i % 2) * 3.2, y = 1.95 + Math.floor(i / 2) * 2.3;
    statTile(s, x, y, 3.0, 2.1, c[0], c[1], c[2], { valueSize: 32, labelSize: 11 });
  });
  text(s, "Cyber on the bilateral agenda", { x: 7.3, y: 1.45, w: 5.4, h: 0.4, fontSize: 16, bold: true, fontFace: THEME.headFontFace });
  const agendaItems = [
    ["FaShieldAlt", "The 2022 Centre – described by the Indian MoD as a one-of-its-kind cyber-related international cooperation project"],
    ["FaMedal", "Cyber security training built into Nomadic Elephant 2025 (Ulaanbaatar) and 2026 (Pithoragarh)"],
    ["FaUsers", "The Cyber Security Military Command of the Mongolian Armed Forces is the Centre's principal partner and customer"],
    ["FaLightbulb", "Both armed forces face the same threats – ransomware, espionage, attacks on critical infrastructure – and the same skills gap"],
  ];
  agendaItems.forEach((a, i) => {
    const y = 1.95 + i * 1.15;
    iconCircle(s, a[0], 7.3, y, 0.6, C.accent2);
    text(s, a[1], { x: 8.1, y: y - 0.05, w: 4.6, h: 1.0, fontSize: 12.5, valign: "middle" });
  });
  notes(s, "Яагаад кибер: Монголын GCI үзүүлэлт (56.4, 103-р байр), долоо хоногт 90 мянган халдлага, 2021 оны хууль. Кибер аюулгүй байдлын цэргийн командлал – төвийн гол түнш.",
    "Why cyber? Mongolia scores 56 in the ITU Global Cybersecurity Index, 103rd of 193. We have climbed seventeen places since 2020, but we remain below the Asian average. National authorities detect more than ninety thousand attacks a week. The 2021 Law on Cyber Security gives the Armed Forces a supporting role in protecting critical infrastructure, and that requires trained people. On the bilateral side, cyber is now a standing item: this Centre, the cyber modules of the last two Nomadic Elephant exercises, and the Cyber Security Military Command, which sent the first cohorts here and is our principal partner.");

  // =====================================================================
  // 7–12. SECTION 02
  // =====================================================================
  sec = sectionSlide("02", "Establishing the Centre", "From the 2015 Memorandum to a university department", "Хэсгийн хуудас.", "Part two: how the Centre came into being.");

  // 8. From MoU to inauguration
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: sec });
  s.addText("From the 2015 Memorandum to the 2022 inauguration", { placeholder: "title" });
  DATA.establishment.forEach((e, i) => {
    const y = 1.5 + i * 0.68;
    dateChip(s, 0.6, y + 0.06, 1.35, e[0], i === 4 ? C.accent1 : i < 4 ? C.accent5 : C.accent2);
    text(s, [{ text: e[1] + ". ", options: { bold: true } }, { text: e[2] }], { x: 2.1, y, w: 5.4, h: 0.62, fontSize: 11, valign: "middle" });
  });
  photo(s, "inauguration_ribbon.jpg", 7.8, 1.5, 4.9, 2.55, "6 September 2022: Defence Minister G. Saikhanbayar and Raksha Mantri Shri Rajnath Singh cut the ribbon");
  photo(s, "inauguration_guard.jpg", 7.8, 4.55, 4.9, 2.1, "Guard of honour for the Indian Defence Minister at NDU", 0.35);
  notes(s, "2015.05.17 санамж бичиг → 2021 барилга бэлтгэл, тээвэрлэлт → 2022.02 хүлээн авалт → 2022.03–07 угсралт (C-DAC, Sandeep Kumar) → 2022.09.06 нээлт → 2023.01 орон тоо → 2023.08 эхний баг → 2025.07 тэнхим.",
    "The Centre took seven years from agreement to opening. The Memorandum was signed on 17 May 2015. In 2021 NDU renovated the first floor of the Military Institute building while two containers of equipment were dispatched from India. They were delivered in February 2022, and from March to July C-DAC's engineer Sandeep Kumar installed and commissioned the laboratories with our team; the e-learning platform went live on 20 July. On 6 September 2022 Defence Minister Saikhanbayar and Raksha Mantri Shri Rajnath Singh opened the Centre. In January 2023 the Ministry created five posts and appointed the head and three teachers; in August 2023 the first Indian training team arrived; and in July 2025 the Centre became a full department of the Military Institute.");

  // 9. India's contribution
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: sec });
  s.addText("India's contribution: a complete, equipped training centre", { placeholder: "title" });
  const cb = DATA.contribution;
  statTile(s, 0.6, 1.5, 3.6, 1.75, cb.total, cb.totalLabel, C.accent1, { valueSize: 40, labelSize: 11 });
  cb.parts.forEach((p, i) => {
    const y = 3.45 + i * 1.12;
    card(s, 0.6, y, 3.6, 1.0, { fill: C.background1, line: "DDE3EC" });
    text(s, p[0], { x: 0.8, y: y + 0.08, w: 3.2, h: 0.4, fontSize: 18, bold: true, color: C.accent2, fontFace: THEME.headFontFace });
    text(s, p[1], { x: 0.8, y: y + 0.48, w: 3.2, h: 0.5, fontSize: 10.5, color: C.text2 });
  });
  cb.systems.forEach((sys, i) => {
    const x = 4.5 + (i % 2) * 4.15, y = 1.5 + Math.floor(i / 2) * 1.77, w = 4.0, h = 1.62;
    card(s, x, y, w, h);
    iconCircle(s, sys[0], x + 0.2, y + 0.2, 0.55, C.accent2);
    text(s, sys[1], { x: x + 0.9, y: y + 0.2, w: w - 1.1, h: 0.55, fontSize: 13, bold: true, valign: "middle" });
    text(s, sys[2], { x: x + 0.2, y: y + 0.82, w: w - 0.4, h: 0.78, fontSize: 10.5, color: C.text2 });
  });
  text(s, "Mongolia provided the premises on the first floor of the Military Institute, their renovation, the Centre's staff and its day-to-day operation.", { x: 4.5, y: 6.85, w: 8.2, h: 0.25, fontSize: 10.5, italic: true, color: C.text2 });
  notes(s, "Энэтхэгийн хувь нэмэр: нийт 1.3 тэрбум төгрөгийн тоног төхөөрөмж (984 сая), программ (68.9 сая), e-learning систем (250.4 сая); 37 компьютер, 3 лаборатори, дата төв.",
    "India delivered a complete, equipped centre, not just a classroom. The supplies were worth about 1.3 billion tugrik: 984 million in equipment, furniture and materials, 93 items in two containers; 69 million in cyber security software; and 250 million for C-DAC's e-learning system with five courses. The systems cover the full cyber security workflow: servers, storage and a WatchGuard firewall; Tableau, Cellebrite and Oxygen forensic kits; IDA Pro and Hex-Rays for malware analysis; Belkasoft, Splunk, Nessus, Burp Suite and Acunetix for incident response and audit; and C-DAC's own cyber forensic tool kits. Mongolia provided the premises, their renovation, the staff and the operation.");

  // 10. Learning environment
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: sec });
  s.addText("The learning environment: three laboratories and a data centre", { placeholder: "title" });
  DATA.rooms.forEach((r, i) => {
    const x = 0.6 + (i % 4) * 3.05, y = 1.5 + Math.floor(i / 4) * 2.75;
    photo(s, r[0], x, y, 2.95, 1.85);
    text(s, r[1], { x, y: y + 1.9, w: 2.95, h: 0.3, fontSize: 12, bold: true });
    text(s, r[2], { x, y: y + 2.18, w: 2.95, h: 0.3, fontSize: 10.5, color: C.text2 });
  });
  notes(s, "Сургалтын орчин: Тоон ул мөрийн лаборатори (12), Хортой код шинжлэх (14), Халдлага илрүүлэх ба аудит (11), 34 суудалтай лекцийн танхим, номын сан, багшийн өрөө (8), 2 рактай серверийн өрөө, даргын өрөө.",
    "This is what the delegation will see on the tour: three laboratories with 37 workstations in total – digital forensics with twelve, malware analysis with fourteen, incident response and audit with eleven – each with smart boards and printers; a 34-seat lecture hall; a library; a staff room for eight instructors; a data centre with two racks hosting the servers, storage, firewall and the e-learning platform; and the head's office.");

  // 11. From training centre to department
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: sec });
  s.addText("From a training centre to a university department", { placeholder: "title" });
  card(s, 0.6, 1.5, 6.3, 5.3);
  text(s, "Mongolian faculty", { x: 0.9, y: 1.65, w: 5.8, h: 0.4, fontSize: 16, bold: true, fontFace: THEME.headFontFace });
  text(s, "January 2023: Cyber Security Training Centre, five posts under the NDU Training Department · July 2025: Cyber Security Department of the Military Institute", { x: 0.9, y: 2.05, w: 5.8, h: 0.6, fontSize: 10.5, color: C.text2 });
  DATA.faculty.forEach((f, i) => {
    const y = 2.75 + i * 0.57;
    iconCircle(s, i === 0 ? "FaUserTie" : "FaChalkboardTeacher", 0.9, y, 0.42, i === 0 ? C.accent1 : C.accent2);
    text(s, [{ text: f[0] + "  ", options: { bold: true } }, { text: f[1], options: { color: C.text2, fontSize: 10.5 } }], { x: 1.45, y: y - 0.04, w: 5.3, h: 0.5, fontSize: 12.5, valign: "middle" });
  });
  photo(s, "group_hall2.jpg", 7.2, 1.5, 5.5, 2.4, "Faculty, trainees and the Indian training team at the Military Institute", 0.3);
  const dstats = [
    ["3", "bachelor programmes: cyber security, network engineering, software engineering (military)"],
    ["162", "credits of bachelor teaching in the first half of 2026 (156 in all of 2025)"],
    ["13", "specialised course units rewritten in 2026 to the national standard"],
    ["1st", "graduation of the cyber security bachelor programme, 2026"],
  ];
  dstats.forEach((d, i) => {
    const x = 7.2 + (i % 2) * 2.8, y = 4.35 + Math.floor(i / 2) * 1.25;
    statTile(s, x, y, 2.7, 1.2, d[0], d[1], C.accent2, { valueSize: 24, labelSize: 10 });
  });
  notes(s, "2023 оны 1 сард 5 орон тоотой төв → 2025 оны 7 сард ЦНС-ийн Кибер аюулгүй байдлын тэнхим: 7 багш, 3 бакалаврын хөтөлбөр, 162 кредит, анхны төгсөлт 2026.05.27.",
    "The Centre began in January 2023 with five posts: Captain Bilegt as head and three teachers. In July 2025 it was restructured into the Cyber Security Department of the Military Institute, which now runs NDU's bachelor programmes in cyber security, network engineering and software engineering. The faculty has grown to seven; two defended master's degrees and one a doctorate this year, and Lieutenant Enkhbaatar trained in India. In 2026 the Department delivered 162 credits of bachelor teaching, rewrote thirteen course units to the national standard, and graduated its first civilian cyber security cohort in May.");

  // 12. Indian teams
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: sec });
  s.addText("Indian engineers and training teams at the Centre, 2022–2026", { placeholder: "title" });
  const hdr = (t) => ({ text: t, options: { bold: true, color: H.lt1, fill: { color: H.accent2 } } });
  const rows = [[hdr("Team"), hdr("Period"), hdr("Members"), hdr("Courses and contribution")]];
  DATA.teams.forEach((t) => {
    const col = t.sample ? H.accent4 : H.dk1;
    rows.push([
      { text: t.team, options: { bold: true, color: col, align: "center" } },
      { text: t.period, options: { color: col } },
      { text: t.who, options: { color: col, italic: !!t.sample } },
      { text: t.courses, options: { color: col } },
    ]);
  });
  s.addTable(rows, { x: 0.6, y: 1.45, w: 12.1, colW: [0.8, 1.7, 4.0, 5.6], fontSize: 10, fontFace: THEME.bodyFontFace, color: H.dk1, border: { type: "solid", pt: 0.5, color: "DDE3EC" }, rowH: 0.44, valign: "middle", margin: 0.05, autoPage: false });
  badge(s, 9.1, 6.5, 3.6, "RED ROWS – names to be completed from records");
  text(s, "Two-instructor mobile training teams from the Indian Air Force, Navy and Army rotate every four months under the jointly approved training plan.", { x: 0.6, y: 6.5, w: 8.2, h: 0.4, fontSize: 10.5, italic: true, color: C.text2, valign: "middle" });
  notes(s, "Энэтхэгийн инженерүүд (C-DAC, 13 сар) болон 9 сургалтын баг (2023.09–2026.07), баг тус бүр 2 багш, 4 сар. 8, 9-р багийн нэрсийг тэнхимийн бүртгэлээс нөхнө.",
    "Indian expertise has been on site continuously since March 2022. C-DAC's engineers stayed for thirteen months, trained our teachers in September 2022 and ran the laboratory tools course in April 2023. Since August 2023 nine mobile training teams of two instructors, drawn from the Indian Air Force, Navy and Army, have rotated every four months under the plan the two sides approved for 2024–2026, each delivering one or two specialised courses. [Walk through the table.] Beyond the classroom, the rotation keeps our curriculum aligned with Indian service practice and has built personal links between the two services.");

  // =====================================================================
  // 13–21. SECTION 03
  // =====================================================================
  sec = sectionSlide("03", "Results 2022–2026", "What the partnership has delivered in four years", "Хэсгийн хуудас.", "Part three: results.");

  // 14. Training output
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: sec });
  s.addText("More than 300 specialists trained with Indian teams since 2022", { placeholder: "title" });
  card(s, 0.6, 1.5, 7.9, 5.3, { fill: C.background1, line: "DDE3EC" });
  text(s, "Trainees per course cohort, September 2022 – June 2025", { x: 0.9, y: 1.62, w: 7.3, h: 0.35, fontSize: 13, bold: true, fontFace: THEME.headFontFace });
  s.addChart(pres.ChartType.bar, [{ name: "Trainees", labels: DATA.courses.map(c => c[0]), values: DATA.courses.map(c => c[1]) }], chartStyle({
    x: 0.7, y: 2.0, w: 7.7, h: 4.7, barDir: "bar", dataLabelPosition: "outEnd", valAxisHidden: true, valGridLine: { style: "none" }, catAxisOrientation: "maxMin", catAxisLabelFontSize: 10,
  }));
  DATA.totals.forEach((t, i) => {
    const y = 1.5 + i * 1.8;
    statTile(s, 8.8, y, 3.9, 1.65, t.value, t.label, i === 0 ? C.accent1 : C.accent2, { valueSize: 34, labelSize: 10.5 });
  });
  notes(s, "Сургалтын үр дүн: 2022.09–2025.06-д 13 ээлжид 211 хүн (график); 2022–2026 онд нийт 300 гаруй мэргэжилтэн (ҮБХИС-ийн 2026.10.09-ний албан бичиг); 2026 оны эхний хагаст 20 кредит.",
    "The chart shows every course cohort from the first teacher training in September 2022 to the audit course in June 2025: thirteen cohorts, 211 trainees, with the largest intakes in the basic course, network administration and penetration testing. The seventh, eighth and ninth teams then ran the foundation, blue-team and advanced cycles through July 2026. In total, as NDU reported to the Ministry this month, more than three hundred specialists of the military and law-enforcement agencies have been trained with the Indian teams, and in the first half of 2026 alone the Department delivered twenty credits of specialised training with them.");

  // 15. Joint training plan
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: sec });
  s.addText("A jointly approved curriculum: nine training phases, 2023–2026", { placeholder: "title" });
  DATA.phases.forEach((p, i) => {
    const x = 0.6 + (i % 3) * 4.1, y = 1.5 + Math.floor(i / 3) * 1.72, w = 3.9, h = 1.6;
    card(s, x, y, w, h);
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.2, y: y + 0.2, w: 0.55, h: 0.55, fill: { color: i < 6 ? C.accent2 : C.accent1 }, line: { color: i < 6 ? C.accent2 : C.accent1, width: 0 }, objectName: "phase" });
    text(s, p[0], { x: x + 0.2, y: y + 0.2, w: 0.55, h: 0.55, fontSize: 16, bold: true, color: C.background1, align: "center", valign: "middle" });
    text(s, p[1], { x: x + 0.9, y: y + 0.2, w: w - 1.1, h: 0.55, fontSize: 13, bold: true, valign: "middle" });
    text(s, p[2], { x: x + 0.2, y: y + 0.85, w: w - 0.4, h: 0.7, fontSize: 10.5, color: C.text2 });
  });
  text(s, "Plan approved by the NDU Rector with the Indian training teams in 2024; phases 7–9 (orange) are the 2025–26 professional cycle. Course programmes exist in English and Mongolian.", { x: 0.6, y: 6.7, w: 12.1, h: 0.3, fontSize: 10.5, italic: true, color: C.text2 });
  notes(s, "2024–2026 оны хамтарсан сургалтын төлөвлөгөө: 9 үе шат – багш бэлтгэх, үндсэн курс, CEH, хортой код/тоон ул мөр, сүлжээний админ/крипто, VAPT/аудит, суурь, хамгаалалт (Blue Team), ахисан түвшин.",
    "Rather than ad-hoc courses, the two sides agreed a nine-phase curriculum running from instructor training in 2023 through basic, ethical hacking, malware and forensics, network administration and cryptography, penetration testing and audit, to the 2025–26 professional cycle: a ten-week foundation, a defensive blue-team block and an advanced block ending with CERT operations and military cyber security operations. Each phase matches one training team. All course programmes were written in English and Mongolian, so the Department can repeat them without the Indian team.");

  // 16. Who we train
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: sec });
  s.addText("Who we train: the whole military and law-enforcement sector", { placeholder: "title" });
  DATA.audiences.forEach((a, i) => {
    const y = 1.5 + i * 1.05;
    iconCircle(s, a[0], 0.6, y + 0.1, 0.62, C.accent2);
    text(s, a[1], { x: 1.4, y, w: 5.6, h: 0.9, fontSize: 12.5, valign: "middle" });
  });
  DATA.reach.forEach((r, i) => {
    const x = 7.4 + (i % 2) * 2.7, y = 1.5 + Math.floor(i / 2) * 1.75;
    statTile(s, x, y, 2.6, 1.6, r.value, r.label, C.accent3, { valueSize: 30, labelSize: 10 });
  });
  photo(s, "certificate_award.jpg", 7.4, 5.05, 5.3, 1.75, "", 0);
  text(s, "Certificates presented with the Indian training team", { x: 7.4, y: 6.82, w: 5.3, h: 0.25, fontSize: 10, color: C.text2 });
  notes(s, "Сургалтад хамрагдагчид: Кибер аюулгүй байдлын цэргийн командлал, ЗХ-ний нэгтгэл, анги (016, 011), ҮБХИС-ийн багш, сонсогч, ТЕГ, ТТХГ, НОБГ, ҮАБЗ-ийн хөтөлбөр; 8 гэрээ, 22 сурагч, 3 бакалаврын хөтөлбөр, анхны төгсөлт.",
    "The Centre serves the whole sector, not only the Armed Forces. The Cyber Security Military Command sent the very first cohort in April 2023 and remains our principal partner. Units and the General Staff receive awareness training; NDU's own faculty and cadets were trained first so that the courses could be repeated; the General Intelligence Agency, the State Special Protection Agency and the Capital Emergency Department send specialists under training contracts; and in 2025 the Department was selected to execute the National Security Council's cyber capacity programme. The Department also runs three bachelor programmes and graduated its first civilian cohort in May.");

  // 17. Research
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: sec });
  s.addText("Research, textbooks and innovation built on the Centre", { placeholder: "title" });
  photo(s, "books.png", 0.6, 1.5, 5.4, 2.5, "Eight English-language textbooks compiled by the Department (2025) and the BEKHI learning system", 0.5);
  photo(s, "lab_hires.jpg", 0.6, 4.6, 5.4, 2.15, "", 0);
  DATA.research.forEach((r, i) => {
    const y = 1.5 + i * 1.33;
    card(s, 6.3, y, 6.4, 1.23);
    iconCircle(s, r[0], 6.5, y + 0.2, 0.55, i % 2 === 0 ? C.accent1 : C.accent2);
    text(s, r[1], { x: 7.2, y: y + 0.12, w: 5.4, h: 0.35, fontSize: 12.5, bold: true, valign: "middle" });
    text(s, r[2], { x: 7.2, y: y + 0.47, w: 5.4, h: 0.72, fontSize: 10, color: C.text2 });
  });
  notes(s, "Судалгаа, инновац: ISBN бүхий 8 сурах бичиг (2025), БЭХИ сургалтын систем (ҮБХИС-ийн шилдэг инновац 2025, БХ-ын сайдын шагналын дэд байр), 8 өгүүлэл, 2026.02 салбарын ЭШ хурал + DefendX, олимпиадын тэргүүн байр.",
    "The Indian curriculum has become the seed of our own research and teaching material. In 2025 the faculty compiled eight English-language textbooks with ISBNs, from network security to information systems audit, now in the NDU library. They built the BEKHI learning system, which won the best-innovation award at the 2025 NDU Academic Conference and second place in the Defence Minister's science and technology award, and published eight articles. In February 2026 the Department hosted the sector conference with five universities and academies alongside the DefendX-2026 competition, and our cadet won the national computer network olympiad.");

  // 18. Faculty development & partners
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: sec });
  s.addText("Faculty development and a widening partner network", { placeholder: "title" });
  card(s, 0.6, 1.5, 5.9, 5.3);
  iconCircle(s, "FaGraduationCap", 0.85, 1.75, 0.65, C.accent1);
  text(s, "Faculty development", { x: 1.65, y: 1.75, w: 4.5, h: 0.65, fontSize: 17, bold: true, valign: "middle" });
  bullets(s, DATA.development, { x: 0.9, y: 2.6, w: 5.3, h: 2.3, fontSize: 12, paraSpaceAfter: 8 });
  photo(s, "group_outdoor_certs.jpg", 0.9, 4.95, 5.3, 1.65, "", 0);
  card(s, 6.8, 1.5, 5.9, 5.3);
  iconCircle(s, "FaHandshake", 7.05, 1.75, 0.65, C.accent3);
  text(s, "Partners beyond India", { x: 7.85, y: 1.75, w: 4.6, h: 0.65, fontSize: 17, bold: true, valign: "middle" });
  bullets(s, DATA.partners, { x: 7.1, y: 2.6, w: 5.3, h: 2.3, fontSize: 12, paraSpaceAfter: 8 });
  photo(s, "roundtable.jpg", 7.1, 4.95, 5.3, 1.65, "", 0);
  notes(s, "Багшийн хөгжил: Энэтхэгт суралцсан, доктор 1, магистр 2, ХБНГУ/Япон/АНУ-ын сургалт, Pacific Endeavor, ITACTIC. Түншүүд: КАБЦК, ҮАБЗ, MNCERT, их сургуулиуд, хувийн хэвшил, дадлага.",
    "The Indian investment is multiplied by the growth of our own people. Lieutenant Enkhbaatar trained in India; this year the faculty defended one doctorate and two master's degrees and attended courses in Germany, Japan and the United States; and the head took part in Pacific Endeavor and the ITACTIC incident-response exercise. The Centre also anchors a wider network: joint training with the Cyber Security Military Command and US Indo-Pacific Command specialists, the National Security Council's capacity programme, the national CERT, three universities, and industry partners who host our cadets for internships.");

  // 19. 2025 upgrade
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: sec });
  s.addText("Continued Indian support: the 2025 upgrade and licence renewal", { placeholder: "title" });
  const up = DATA.upgrade;
  up.tiles.forEach((t, i) => {
    statTile(s, 0.6, 1.5 + i * 1.78, 3.1, 1.65, t[0], t[1], C.accent1, { valueSize: 34, labelSize: 10.5 });
  });
  card(s, 3.95, 1.5, 6.3, 5.2);
  iconCircle(s, "FaFileSignature", 4.2, 1.72, 0.6, C.accent2);
  text(s, up.order, { x: 4.95, y: 1.7, w: 5.1, h: 0.65, fontSize: 11.5, bold: true, valign: "middle" });
  up.software.forEach((sw, i) => {
    const y = 2.55 + i * 1.35;
    text(s, sw[0], { x: 4.2, y, w: 5.8, h: 0.35, fontSize: 12.5, bold: true, color: C.accent2 });
    text(s, sw[1], { x: 4.2, y: y + 0.35, w: 5.8, h: 0.95, fontSize: 11, color: C.text2 });
  });
  photo(s, "server_room.jpg", 10.5, 1.5, 2.2, 2.8, "Data centre racks", 0.3);
  photo(s, "lab_incident.jpg", 10.5, 4.65, 2.2, 1.68, "Upgraded workstations", 0.3);
  notes(s, "2025 оны шинэчлэл: 2025.06.10-ны нийлүүлэлтийн захиалга (DCyA/C-DAC), 37 компьютерийн RAM/видео карт/диск шинэчлэл (2025.11.06 суурилуулсан), 15 программын лиценз (2025.09.30–11.07), гааль 09.07, 10.13.",
    "India's support did not stop at the inauguration. Under a supply order of 10 June 2025 from the Defence Cyber Agency, executed by C-DAC, all 37 workstations received new memory, graphics cards and one-terabyte disks, commissioned on 6 November 2025, and fifteen professional licences were renewed or newly issued between September and November: the forensic suites FTK, Cellebrite, Oxygen and Belkasoft, IDA Pro, Nessus, Burp Suite, Acunetix and Invicti, the VMware and Red Hat platforms and the firewall subscription. The Department organised customs clearance with the Ministry and installed the items with the C-DAC engineer.");

  // 20. Milestones
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: sec });
  s.addText("Milestones of the cooperation, 2022–2026", { placeholder: "title" });
  DATA.events.forEach((e, i) => {
    const col = i < 6 ? 0 : 1, row = col === 0 ? i : i - 6;
    const x = 0.6 + col * 6.2, y = 1.5 + row * 0.86;
    dateChip(s, x, y + 0.1, 1.25, e.date, kindColor(e.kind));
    text(s, e.title, { x: x + 1.45, y, w: 4.6, h: 0.36, fontSize: 12.5, bold: true });
    text(s, e.detail, { x: x + 1.45, y: y + 0.36, w: 4.6, h: 0.45, fontSize: 10.5, color: C.text2 });
  });
  legend(s, 7.0, 6.72);
  notes(s, "Он дарааллын гол үйл явдлууд: нээлт, орон тоо, JWG 11–13, эхний баг, 2024–26 төлөвлөгөө, Элчин сайдын айлчлал, тэнхим, Төрийн айлчлал, 2025 шинэчлэл ба Атташегийн айлчлал, төсөл дууссан 2026.07, багш 2029 хүртэл, JWG-14.",
    "Put on one timeline, the cooperation shows a steady rhythm: an institutional step on the Indian side, a step on ours, and a Joint Working Group each year to review it. The Ambassador's visit in 2024 led to the 2025 upgrade; the President's visit in October 2025 and the new Defence Attaché, who visited the Department last November, have given the partnership a permanent channel in Ulaanbaatar. The project phase formally ended in July 2026, but under the intergovernmental Memorandum instructor deployment has already been extended to 2029 – which brings us to the proposals.");

  // =====================================================================
  // 22–25. SECTION 04
  // =====================================================================
  sec = sectionSlide("04", "The road ahead", "Proposals for the next phase of cooperation, 2026–2030", "Хэсгийн хуудас.", "Part four: our proposals.");

  // 23. Proposed directions
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: sec });
  s.addText("Four directions proposed by NDU on 9 October 2026", { placeholder: "title" });
  DATA.proposals.forEach((p, i) => {
    const x = 0.6 + (i % 2) * 6.2, y = 1.5 + Math.floor(i / 2) * 2.62, w = 5.9, h = 2.47;
    card(s, x, y, w, h);
    iconCircle(s, p[0], x + 0.25, y + 0.25, 0.65, i % 2 === 0 ? C.accent1 : C.accent2);
    text(s, p[1], { x: x + 1.1, y: y + 0.25, w: w - 1.3, h: 0.65, fontSize: 16, bold: true, valign: "middle" });
    bullets(s, p[2], { x: x + 0.3, y: y + 1.05, w: w - 0.6, h: 1.35, fontSize: 11.5, paraSpaceAfter: 5 });
  });
  text(s, "Instructor deployment has already been extended to 2029 under the intergovernmental Memorandum; these directions build the next layer on it.", { x: 0.6, y: 6.75, w: 12.1, h: 0.28, fontSize: 10.5, italic: true, color: C.text2 });
  notes(s, "ҮБХИС-ийн 2026.10.09-ний 01/1171 албан бичгийн 4 чиглэл: хамтарсан сургалт (бакалавр/магистр/доктор, солилцоо, хос диплом); лаборатори (Cyber Range, SOC, IoT/AI/их өгөгдөл/квант, НННХ); багшийн чадавх; олон улсын хамтын ажиллагаа (ITU Cyberdrill, FIRST, APCERT, 2 жил тутмын форум).",
    "On 9 October NDU sent the Ministry of Defence four directions for the next phase, and we are grateful that the Ministry proposed them for this Joint Working Group. First, joint education: joint bachelor, master's and doctoral programmes, exchanges, and double degrees. Second, laboratories and research: a cyber range and SOC laboratory, a joint research centre on IoT, AI, big data and quantum cryptography, and a laboratory for the cyber security of unmanned and remotely operated systems. Third, faculty capacity: training our faculty at Indian defence universities and a joint programme for cyber security instructors. Fourth, international cooperation: joint participation in ITU Cyberdrill, FIRST and APCERT exercises, a biennial Mongolia–India Cyber Security Forum, and regular joint events.");

  // 25. Proposals for JWG-14
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: sec });
  s.addText("Proposals for the 14th Joint Working Group", { placeholder: "title" });
  text(s, "We respectfully request the Indian side to consider:", { x: 0.6, y: 1.45, w: 12, h: 0.4, fontSize: 14, italic: true, color: C.text2 });
  DATA.asks.forEach((a, i) => {
    const y = 2.0 + i * 1.18;
    card(s, 0.6, y, 12.1, 1.0);
    s.addShape(pres.ShapeType.ellipse, { x: 0.8, y: y + 0.25, w: 0.5, h: 0.5, fill: { color: C.accent1 }, line: { color: C.accent1, width: 0 }, objectName: "number" });
    text(s, String(i + 1), { x: 0.8, y: y + 0.25, w: 0.5, h: 0.5, fontSize: 15, bold: true, color: C.background1, align: "center", valign: "middle" });
    text(s, [{ text: a[0] + " ", options: { bold: true } }, { text: a[1] }], { x: 1.5, y: y + 0.1, w: 11.0, h: 0.8, fontSize: 13, valign: "middle" });
  });
  notes(s, "14 дэх зөвлөлдөх уулзалтад оруулах 5 санал: II шатыг протоколд тусгах; багш 2029 хүртэл + 2027–2029 төлөвлөгөө; Cyber Range/SOC лаборатори (2027 үнэлгээ); багшийн суудал, хамтарсан хөтөлбөр; 2027 форум, ITU/FIRST/APCERT.",
    "To turn the roadmap into decisions, we put five proposals to the fourteenth Joint Working Group. One: record the expansion of the Centre project, Phase II, in the agenda and minutes. Two: confirm instructor deployment to 2029 and approve a 2027–2029 joint training plan with a train-the-trainer track. Three: agree a Phase II laboratory project – cyber range and SOC – with a technical assessment in 2027. Four: open seats for our faculty at Indian defence universities from 2027 and start designing joint and double-degree programmes. Five: hold the first Mongolia–India Cyber Security Forum in 2027 and take part together in the international exercises. Each builds directly on what already exists in this building.");

  // =====================================================================
  // 26. CLOSING
  // =====================================================================
  pres.addSection({ title: "Closing" });
  s = pres.addSlide({ masterName: "CLOSING", sectionTitle: "Closing" });
  s.addText("Thank you", { placeholder: "title" });
  s.addText([
    { text: "Cyber Security Department, Military Institute, National Defence University of Mongolia", options: { bold: true, breakLine: true } },
    { text: "Built with India. Run by Mongolia. Serving the whole sector.", options: { italic: true, breakLine: true } },
    { text: DATA.contact, options: {} },
  ], { placeholder: "body" });
  s.addImage({ path: IMG("group_trainees_indian.jpg"), x: 8.3, y: 1.6, w: 4.3, h: 3.25, sizing: { type: "cover", w: 4.3, h: 3.25 }, objectName: "group photo" });
  text(s, "Graduates with the Indian training team, NDU", { x: 8.3, y: 4.9, w: 4.3, h: 0.3, fontSize: 10, color: C.accent5 });
  text(s, "Questions and discussion, followed by a tour of the laboratories", { x: 0.8, y: 6.4, w: 11, h: 0.4, fontSize: 13, color: C.accent5 });
  notes(s, "Баярлалаа. Асуулт, хэлэлцүүлэг; лабораторийн аялал.",
    "Thank you. This Department is the most tangible product of India–Mongolia defence cooperation: built with India, run by Mongolia, and serving the whole security sector. We welcome your questions, and then invite you to see the laboratories.");

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})().catch(e => { console.error(e); process.exit(1); });
