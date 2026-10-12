const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const Fa = require("react-icons/fa");
const { applyTheme } = require(process.env.SKILL_DIR + "/scripts/apply_theme.js");

const heroes = JSON.parse(fs.readFileSync(path.join(__dirname, "heroes.json"), "utf8"));
const OUT = process.argv[2] || "ubhis_11_baatar.pptx";

const THEME = {
  name: "UBHIS Heroes",
  headFontFace: "Cambria",
  bodyFontFace: "Arial",
  colors: {
    dk1: "1B2A41", // deep navy text
    lt1: "FFFFFF",
    dk2: "5B6472", // muted gray text
    lt2: "EEF0F4", // light panel
    accent1: "C8102E", // Mongolian red
    accent2: "D4A017", // gold
    accent3: "2E4A7D", // steel blue
    accent4: "8B1E2D",
    accent5: "9AA3B0",
    accent6: "F6E7B4",
    hlink: "2E4A7D",
    folHlink: "8B1E2D",
  },
};
const H = THEME.colors;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "ҮБХИС-иас төрсөн 11 баатар";
pres.author = "Research material";
pres.lang = "mn-MN";
const C = pres.SchemeColor;
const W = 13.333;

// ---------- icons ----------
async function icon(name, hex, px = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Fa[name], { color: "#" + hex, size: px }));
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

// ---------- layouts ----------
pres.defineSlideMaster({
  title: "TITLE",
  background: { color: H.dk1 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.8, y: 2.1, w: 8.2, h: 1.6, fontSize: 44, bold: true, color: C.background1, valign: "bottom", margin: 0 } } },
    { placeholder: { options: { name: "body", type: "body", x: 0.8, y: 3.85, w: 8.2, h: 1.5, fontSize: 18, color: C.accent6, valign: "top", margin: 0 } } },
  ],
});
pres.defineSlideMaster({
  title: "SECTION",
  background: { color: H.dk1 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.8, y: 2.6, w: 11.7, h: 1.3, fontSize: 40, bold: true, color: C.background1, valign: "middle", margin: 0 } } },
    { placeholder: { options: { name: "body", type: "body", x: 0.8, y: 3.95, w: 11.7, h: 0.8, fontSize: 18, color: C.accent6, valign: "top", margin: 0 } } },
  ],
});
pres.defineSlideMaster({
  title: "CONTENT",
  background: { color: H.lt1 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.4, w: 11.0, h: 0.9, fontSize: 32, bold: true, color: C.text1, valign: "middle", margin: 0 } } },
    { text: { text: "ҮБХИС-иас төрсөн 11 баатар", options: { x: 0.6, y: 7.05, w: 6, h: 0.3, fontSize: 9, color: C.text2, margin: 0 } } },
  ],
  slideNumber: { x: 12.2, y: 7.05, w: 0.6, h: 0.3, fontSize: 9, color: H.dk2, align: "right" },
});
pres.defineSlideMaster({
  title: "HERO",
  background: { color: H.lt1 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.4, w: 11.0, h: 0.85, fontSize: 34, bold: true, color: C.text1, valign: "middle", margin: 0 } } },
    { placeholder: { options: { name: "body", type: "body", x: 0.6, y: 1.25, w: 11.4, h: 0.5, fontSize: 13, color: C.text2, valign: "top", margin: 0 } } },
    { text: { text: "ҮБХИС-иас төрсөн 11 баатар", options: { x: 0.6, y: 7.05, w: 6, h: 0.3, fontSize: 9, color: C.text2, margin: 0 } } },
  ],
  slideNumber: { x: 12.2, y: 7.05, w: 0.6, h: 0.3, fontSize: 9, color: H.dk2, align: "right" },
});

(async () => {
  const ic = {
    user: await icon("FaUser", H.accent5),
    star: await icon("FaStar", H.lt1),
    medal: await icon("FaMedal", H.lt1),
    cap: await icon("FaGraduationCap", H.lt1),
    flag: await icon("FaFlag", H.lt1),
    calendar: await icon("FaCalendarAlt", H.lt1),
    landmark: await icon("FaLandmark", H.lt1),
    users: await icon("FaUsers", H.lt1),
    shield: await icon("FaShieldAlt", H.lt1),
    camera: await icon("FaCamera", H.lt1),
    cross: await icon("FaCrosshairs", H.lt1),
  };

  function iconCircle(slide, data, x, y, d, fill, name) {
    slide.addShape(pres.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: fill }, line: { color: fill }, objectName: name + " circle" });
    const p = d * 0.26;
    slide.addImage({ data, x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p, objectName: name + " icon" });
  }

  // ================= 1. Title =================
  pres.addSection({ title: "Танилцуулга" });
  {
    const s = pres.addSlide({ masterName: "TITLE", sectionTitle: "Танилцуулга" });
    s.addText("ҮБХИС-иас төрсөн 11 баатар", { placeholder: "title" });
    s.addText(
      [
        { text: "Үндэсний батлан хамгаалахын их сургуулийн төгсөгч, Халхын голын дайн ба 1945 оны Чөлөөлөх дайны баатруудын товч танилцуулга", options: { breakLine: true } },
        { text: "Зураг • байгуулсан гавьяа • баатар цол хүртсэн огноо", options: { fontSize: 14, color: C.accent5 } },
      ],
      { placeholder: "body", paraSpaceAfter: 10 }
    );
    // big star emblem
    s.addShape(pres.ShapeType.ellipse, { x: 9.6, y: 1.55, w: 3.1, h: 3.1, fill: { color: C.accent1 }, line: { color: C.accent1 }, objectName: "emblem circle" });
    s.addShape(pres.ShapeType.ellipse, { x: 9.3, y: 1.25, w: 3.7, h: 3.7, fill: { type: "none" }, line: { color: C.accent2, width: 1.5 }, objectName: "emblem ring" });
    s.addImage({ data: ic.star, x: 10.35, y: 2.3, w: 1.6, h: 1.6, objectName: "emblem star" });
    s.addText("1921 оноос хойш • Ардын цэргийн даргын сургуулиас ҮБХИС хүртэл", { x: 0.8, y: 6.5, w: 11.5, h: 0.4, fontSize: 12, color: C.accent5, isTextBox: true, margin: 0, objectName: "footer line" });
    s.addNotes("Эх сурвалж: mn.wikipedia.org (БНМАУ-ын баатар цол, баатруудын нийтлэл), baabar.mn, montsame.mn, mndu.gov.mn (Түүхэн товчоо).");
  }

  // ================= 2. School history =================
  {
    const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Танилцуулга" });
    s.addText("Сургуулийн түүхэн замнал", { placeholder: "title" });
    s.addText("1921 онд жанжин Д.Сүхбаатарын санаачилгаар байгуулагдсан «Ардын цэргийн даргын сургууль» өнөөдрийн ҮБХИС болтлоо өргөжсөн. Энэ танилцуулгын 11 баатар уг сургуулийн түүхэн үеүдэд хүмүүжиж, төгссөн офицер, дайчид юм.", {
      x: 0.6, y: 1.35, w: 12.1, h: 0.8, fontSize: 14, color: C.text2, isTextBox: true, margin: 0, valign: "top", objectName: "intro",
    });

    const steps = [
      ["1921", "Ардын цэргийн даргын сургууль", "10-р сарын 15-нд анхны хичээл; 12-р сарын 25-нд анхны төгсөлт (салааны дарга 15, хагас салааны дарга 6)"],
      ["1932", "Цэргийн ерөнхий сургууль", "3 жилийн сургалттай бүх цэргийн сургууль. Гэлэгбаатар (1938), Шагдарсүрэн (1939) энд төгссөн"],
      ["1966", "Цэргийн ерөнхий дээд сургууль", "Дээд боловсролын статустай болсон"],
      ["1981", "Цэргийн нэгдсэн дээд сургууль", "Олон мэргэжлийн нэгдсэн сургалт"],
      ["1991", "Цэргийн их сургууль", "Ардчилсан шилжилтийн үеийн шинэчлэл"],
      ["1999", "Батлан хамгаалахын их сургууль", "Өнөөдрийн ҮБХИС: офицер, мэргэжилтэн бэлтгэх үндэсний тэргүүлэх их сургууль"],
    ];
    const x0 = 0.6, y0 = 2.55, colW = 12.1 / 6;
    // connector line
    s.addShape(pres.ShapeType.line, { x: x0 + colW / 2, y: y0 + 0.45, w: colW * 5, h: 0, line: { color: H.dk1, width: 1.5 }, objectName: "timeline line" });
    steps.forEach(([yr, name, desc], i) => {
      const cx = x0 + colW * i + colW / 2;
      s.addShape(pres.ShapeType.ellipse, { x: cx - 0.45, y: y0, w: 0.9, h: 0.9, fill: { color: i === 5 ? C.accent1 : C.text1 }, line: { color: C.background1, width: 2 }, objectName: `step ${yr} dot` });
      s.addText(yr, { x: cx - 0.45, y: y0, w: 0.9, h: 0.9, fontSize: 13, bold: true, color: C.background1, align: "center", valign: "middle", isTextBox: true, margin: 0, objectName: `step ${yr} year` });
      s.addText(name, { x: cx - colW / 2 + 0.08, y: y0 + 1.1, w: colW - 0.16, h: 0.8, fontSize: 13, bold: true, color: C.text1, align: "center", valign: "top", isTextBox: true, margin: 0, objectName: `step ${yr} name` });
      s.addText(desc, { x: cx - colW / 2 + 0.08, y: y0 + 1.95, w: colW - 0.16, h: 1.5, fontSize: 10.5, color: C.text2, align: "center", valign: "top", isTextBox: true, margin: 0, objectName: `step ${yr} desc` });
    });

    // stat cards
    const cards = [
      ["11", "баатар энэ танилцуулгад", ic.users],
      ["1936–2014", "баатар цол хүртсэн он жилүүд", ic.calendar],
      ["17-р хороо", "6-р морьт дивизийн 17-р морьт хороонд 4 баатар алба хаасан", ic.shield],
    ];
    const cy = 6.05, cw = 3.9, gap = 0.2;
    cards.forEach(([big, lbl, data], i) => {
      const cx = 0.6 + i * (cw + gap);
      s.addShape(pres.ShapeType.roundRect, { x: cx, y: cy, w: cw, h: 0.85, fill: { color: C.background2 }, line: { color: C.background2 }, rectRadius: 0.08, objectName: `stat ${i} card` });
      iconCircle(s, data, cx + 0.15, cy + 0.17, 0.5, H.accent1, `stat ${i}`);
      s.addText([
        { text: big, options: { fontSize: 18, bold: true, color: C.accent1, breakLine: true } },
        { text: lbl, options: { fontSize: 10, color: C.text2 } },
      ], { x: cx + 0.8, y: cy + 0.05, w: cw - 0.9, h: 0.75, valign: "middle", isTextBox: true, margin: 0, objectName: `stat ${i} text` });
    });
    s.addNotes("Эх сурвалж: mndu.gov.mn «Түүхэн товчоо»; mongoltoli.mn «Ардын цэргийн даргын сургууль». Нэр солигдсон он жилүүд эх сурвалжуудад бага зэрэг зөрүүтэй байдаг.");
  }

  // ================= 3. Overview grid =================
  {
    const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Танилцуулга" });
    s.addText("11 баатар нэг дор", { placeholder: "title" });
    const cols = 4, cw = 2.95, ch = 1.55, gx = 0.1, gy = 0.15, x0 = 0.6, y0 = 1.5;
    heroes.forEach((h, i) => {
      const r = Math.floor(i / cols), c = i % cols;
      const x = x0 + c * (cw + gx), y = y0 + r * (ch + gy);
      s.addShape(pres.ShapeType.roundRect, { x, y, w: cw, h: ch, fill: { color: C.background2 }, line: { color: C.background2 }, rectRadius: 0.08, objectName: `card ${h.n}` });
      s.addShape(pres.ShapeType.ellipse, { x: x + 0.15, y: y + 0.15, w: 0.5, h: 0.5, fill: { color: C.accent1 }, line: { color: C.accent1 }, objectName: `card ${h.n} badge` });
      s.addText(h.n, { x: x + 0.15, y: y + 0.15, w: 0.5, h: 0.5, fontSize: 11, bold: true, color: C.background1, align: "center", valign: "middle", isTextBox: true, margin: 0, objectName: `card ${h.n} num` });
      s.addText([
        { text: h.name, options: { fontSize: 12.5, bold: true, color: C.text1, breakLine: true } },
        { text: h.years, options: { fontSize: 10, color: C.text2 } },
      ], { x: x + 0.75, y: y + 0.1, w: cw - 0.85, h: 0.75, valign: "top", isTextBox: true, margin: 0, objectName: `card ${h.n} name` });
      s.addText([
        { text: "Баатар цол: ", options: { fontSize: 10, color: C.text2 } },
        { text: h.hero_date, options: { fontSize: 11, bold: true, color: C.accent1 } },
      ], { x: x + 0.15, y: y + 0.95, w: cw - 0.3, h: 0.45, valign: "middle", isTextBox: true, margin: 0, objectName: `card ${h.n} date` });
    });
    // 12th slot: legend card
    const x = x0 + 3 * (cw + gx), y = y0 + 2 * (ch + gy);
    s.addShape(pres.ShapeType.roundRect, { x, y, w: cw, h: ch, fill: { color: C.text1 }, line: { color: C.text1 }, rectRadius: 0.08, objectName: "legend card" });
    s.addText([
      { text: "8 баатар — Халхын голын дайн (1939)", options: { breakLine: true } },
      { text: "2 баатар — Чөлөөлөх дайн (1945)", options: { breakLine: true } },
      { text: "1 баатар — 1936 оны хилийн тулаан" },
    ], { x: x + 0.2, y: y + 0.1, w: cw - 0.4, h: ch - 0.2, fontSize: 11, color: C.background1, valign: "middle", isTextBox: true, margin: 0, paraSpaceAfter: 4, objectName: "legend text" });
    s.addNotes("Огноонууд: mn.wikipedia.org «БНМАУ-ын баатар цол» ба «Монгол Улсын баатар цол» жагсаалт, baabar.mn.");
  }

  // ================= Section divider =================
  pres.addSection({ title: "Баатрууд" });
  {
    const s = pres.addSlide({ masterName: "SECTION", sectionTitle: "Баатрууд" });
    s.addText("Баатар бүрийн товч намтар", { placeholder: "title" });
    s.addText("Төрсөн нутаг • цол, алба • байгуулсан гавьяа • баатар цол хүртсэн огноо • дурсгал", { placeholder: "body" });
    s.addShape(pres.ShapeType.ellipse, { x: 0.8, y: 1.3, w: 1.0, h: 1.0, fill: { color: C.accent1 }, line: { color: C.accent1 }, objectName: "section emblem" });
    s.addImage({ data: ic.medal, x: 1.05, y: 1.55, w: 0.5, h: 0.5, objectName: "section icon" });
  }

  // ================= Hero slides =================
  for (const h of heroes) {
    const s = pres.addSlide({ masterName: "HERO", sectionTitle: "Баатрууд" });
    s.addText(h.name, { placeholder: "title" });
    s.addText([
      { text: h.years + "   •   ", options: { bold: true, color: C.accent1 } },
      { text: h.born },
    ], { placeholder: "body" });

    // number badge
    s.addShape(pres.ShapeType.ellipse, { x: 11.95, y: 0.45, w: 0.75, h: 0.75, fill: { color: C.accent1 }, line: { color: C.accent1 }, objectName: "badge" });
    s.addText(h.n, { x: 11.95, y: 0.45, w: 0.75, h: 0.75, fontSize: 16, bold: true, color: C.background1, align: "center", valign: "middle", isTextBox: true, margin: 0, objectName: "badge number" });

    // photo frame (placeholder — photo to be inserted)
    const px = 0.6, py = 1.95, pw = 3.1, ph = 3.55;
    s.addShape(pres.ShapeType.roundRect, { x: px, y: py, w: pw, h: ph, fill: { color: C.background2 }, line: { color: C.accent5, width: 1, dashType: "dash" }, rectRadius: 0.1, objectName: "photo frame" });
    s.addImage({ data: ic.user, x: px + 0.95, y: py + 0.7, w: 1.2, h: 1.2, objectName: "photo silhouette" });
    s.addText([
      { text: "Зураг", options: { fontSize: 13, bold: true, color: C.text2, breakLine: true } },
      { text: h.name, options: { fontSize: 10, color: C.text2 } },
    ], { x: px + 0.15, y: py + 2.05, w: pw - 0.3, h: 0.9, align: "center", valign: "top", isTextBox: true, margin: 0, objectName: "photo label" });
    s.addText("Эх сурвалж: " + h.wiki, { x: px, y: py + ph + 0.05, w: pw, h: 0.45, fontSize: 8.5, color: C.text2, align: "center", valign: "top", isTextBox: true, margin: 0, objectName: "photo source" });

    // hero date card
    const cy = 6.05;
    s.addShape(pres.ShapeType.roundRect, { x: px, y: cy, w: pw, h: 0.9, fill: { color: C.text1 }, line: { color: C.text1 }, rectRadius: 0.08, objectName: "hero date card" });
    s.addImage({ data: ic.star, x: px + 0.18, y: cy + 0.25, w: 0.4, h: 0.4, objectName: "hero date star" });
    s.addText([
      { text: "БААТАР ЦОЛ ХҮРТСЭН", options: { fontSize: 8.5, color: C.accent6, breakLine: true } },
      { text: h.hero_date, options: { fontSize: 20, bold: true, color: C.background1 } },
    ], { x: px + 0.7, y: cy + 0.05, w: pw - 0.8, h: 0.8, valign: "middle", isTextBox: true, margin: 0, objectName: "hero date text" });

    // right column
    const rx = 4.1, rw = 8.6;
    // info rows
    const rows = [
      [ic.medal, "Цол, алба", h.rank],
      [ic.flag, "Анги, нэгтгэл", h.unit],
    ];
    rows.forEach(([data, lbl, val], i) => {
      const y = 1.95 + i * 0.6;
      iconCircle(s, data, rx, y + 0.02, 0.46, H.accent3, `row ${i}`);
      s.addText([
        { text: lbl.toUpperCase() + "  ", options: { fontSize: 8.5, color: C.text2 } },
        { text: val, options: { fontSize: 13, bold: true, color: C.text1 } },
      ], { x: rx + 0.6, y, w: rw - 0.6, h: 0.5, valign: "middle", isTextBox: true, margin: 0, objectName: `row ${i} text` });
    });

    // feats
    s.addText("Байгуулсан гавьяа", { x: rx, y: 3.2, w: rw, h: 0.35, fontSize: 15, bold: true, color: C.accent1, isTextBox: true, margin: 0, objectName: "feats header" });
    s.addText(
      h.feats.map((f, i) => ({ text: f, options: { bullet: { indent: 14 }, breakLine: i < h.feats.length - 1 } })),
      { x: rx, y: 3.6, w: rw, h: 1.95, fontSize: 13, color: C.text1, valign: "top", paraSpaceAfter: 8, isTextBox: true, margin: 0, objectName: "feats" }
    );

    // school / background
    iconCircle(s, ic.cap, rx, 5.62, 0.46, H.accent2, "school");
    s.addText(h.school, { x: rx + 0.6, y: 5.55, w: rw - 0.6, h: 0.62, fontSize: 11, color: C.text2, valign: "middle", isTextBox: true, margin: 0, objectName: "school text" });

    // note + memory
    iconCircle(s, ic.landmark, rx, 6.3, 0.46, H.accent3, "memory");
    s.addText([
      { text: "Үндэслэл: ", options: { bold: true } },
      { text: h.hero_note + ".  ", options: {} },
      { text: "Дурсгал: ", options: { bold: true } },
      { text: h.memory },
    ], { x: rx + 0.6, y: 6.22, w: rw - 0.6, h: 0.72, fontSize: 10.5, color: C.text2, valign: "middle", isTextBox: true, margin: 0, objectName: "memory text" });

    s.addNotes(`${h.name} (${h.years}). Эх сурвалж: ${h.wiki}; mn.wikipedia.org «БНМАУ-ын баатар цол»; baabar.mn «БНМАУ-ын баатрууд». Зураг: дээрх эх сурвалжийн нийтлэл дэх гэрэл зургийг «Зураг» хүрээний оронд оруулна.`);
  }

  // ================= Timeline of titles =================
  pres.addSection({ title: "Дүгнэлт" });
  {
    const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Дүгнэлт" });
    s.addText("Баатар цол хүртсэн он дараалал", { placeholder: "title" });
    s.addText("Гурван баатар дайны жилүүдэд шууд, бусад нь Халхын голын ялалтын ойн жилүүдэд нэхэн (хойноос нь) цол хүртжээ.", { x: 0.6, y: 1.35, w: 12.1, h: 0.45, fontSize: 14, color: C.text2, isTextBox: true, margin: 0, objectName: "intro" });

    const items = heroes.map(h => ({ y: parseInt(h.hero_date.slice(0, 4)), d: h.hero_date, name: h.name.split(" ")[1] ? h.name.split(" ")[0][0] + "." + h.name.split(" ")[1] : h.name, n: h.n })).sort((a, b) => a.d.localeCompare(b.d));
    const minY = 1934, maxY = 2016, lx = 1.0, lw = 11.3, ly = 3.95;
    const X = yr => lx + ((yr - minY) / (maxY - minY)) * lw;
    s.addShape(pres.ShapeType.line, { x: lx, y: ly, w: lw, h: 0, line: { color: H.dk1, width: 2 }, objectName: "axis" });
    [1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010].forEach(yr => {
      s.addShape(pres.ShapeType.line, { x: X(yr), y: ly - 0.08, w: 0, h: 0.16, line: { color: H.dk1, width: 1 }, objectName: `tick ${yr}` });
      s.addText(String(yr), { x: X(yr) - 0.4, y: ly + 0.12, w: 0.8, h: 0.25, fontSize: 9, color: C.text2, align: "center", isTextBox: true, margin: 0, objectName: `tick ${yr} label` });
    });
    // group by date
    const groups = {};
    items.forEach(it => { (groups[it.d] = groups[it.d] || []).push(it); });
    const keys = Object.keys(groups).sort();
    keys.forEach((d, i) => {
      const yr = parseInt(d.slice(0, 4)) + (parseInt(d.slice(5, 7)) - 1) / 12;
      const x = X(yr);
      const lvl = i % 4; // 0 up-near, 1 down-near, 2 up-far, 3 down-far
      const up = lvl % 2 === 0, far = lvl >= 2;
      const g = groups[d];
      s.addShape(pres.ShapeType.ellipse, { x: x - 0.14, y: ly - 0.14, w: 0.28, h: 0.28, fill: { color: C.accent1 }, line: { color: C.background1, width: 1.5 }, objectName: `pt ${d}` });
      const lh = 0.3 + 0.28 * g.length;
      const off = far ? 1.25 : 0.5;
      const ty = up ? ly - off - lh : ly + off;
      s.addShape(pres.ShapeType.line, { x, y: up ? ly - off + 0.05 : ly + 0.14, w: 0, h: off - 0.19, line: { color: H.accent5, width: 1 }, objectName: `stem ${d}` });
      const labelW = 1.75;
      s.addText([
        { text: d, options: { fontSize: 11, bold: true, color: C.accent1, breakLine: true } },
        ...g.map((it, k) => ({ text: it.name, options: { fontSize: 10, color: C.text1, breakLine: k < g.length - 1 } })),
      ], { x: x - labelW / 2, y: ty, w: labelW, h: lh, align: "center", valign: up ? "bottom" : "top", isTextBox: true, margin: 0, objectName: `label ${d}` });
    });
    const tcards = [
      ["3", "баатар дайны жилүүдэд шууд цол хүртсэн (1936, 1939, 1945)", ic.medal],
      ["8", "баатар Халхын голын ялалтын ойн жилүүдэд нэхэн цол хүртсэн", ic.calendar],
      ["78 жил", "анхны (1936) ба сүүлийн (2014) цолны хоорондох хугацаа", ic.landmark],
    ];
    tcards.forEach(([big, lbl, data], i) => {
      const cx = 0.6 + i * 4.1, cy = 6.05, cw = 3.9;
      s.addShape(pres.ShapeType.roundRect, { x: cx, y: cy, w: cw, h: 0.85, fill: { color: C.background2 }, line: { color: C.background2 }, rectRadius: 0.08, objectName: `tstat ${i} card` });
      iconCircle(s, data, cx + 0.15, cy + 0.17, 0.5, H.accent1, `tstat ${i}`);
      s.addText([
        { text: big, options: { fontSize: 18, bold: true, color: C.accent1, breakLine: true } },
        { text: lbl, options: { fontSize: 10, color: C.text2 } },
      ], { x: cx + 0.8, y: cy + 0.05, w: cw - 0.9, h: 0.75, valign: "middle", isTextBox: true, margin: 0, objectName: `tstat ${i} text` });
    });
    s.addNotes("Огноонууд: mn.wikipedia.org «БНМАУ-ын баатар цол», «Монгол Улсын баатар цол»; baabar.mn. Д.Хаянхярваагийн огноог зарим эх сурвалж 1939.10.21 гэж бичдэг; энд Википедиа болон baabar.mn-ийн 1969.08.18-ыг ашиглав.");
  }

  // ================= Conclusion =================
  {
    const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Дүгнэлт" });
    s.addText("Нийтлэг зүйл ба дүгнэлт", { placeholder: "title" });
    const pts = [
      [ic.shield, "Нэг хороо, нэг сургууль", "Ц.Олзвой, М.Экей, Д.Нянтайсүрэн, П.Шагдарсүрэн нар бүгд 6-р морьт дивизийн 17-р морьт хороонд алба хааж, Халхын голд хамт байлдсан."],
      [ic.cross, "Амиа өгсөн дөрвөн баатар", "Л.Гэлэгбаатар (05.28), М.Экей (07.24), В.Шарав (08.03) нар 1939 онд Халхын голд, Д.Дэмбэрэл 1939 онд амь үрэгдсэн."],
      [ic.calendar, "Ойн жилүүдийн нэхэн цол", "1964, 1969, 1979, 1984, 1989, 2014 онуудад Халхын голын ялалтын ойгоор цол нэхэн олгож, дайны гавьяаг төр дахин үнэлсэн."],
      [ic.landmark, "Дурсгал мөнхөрсөн", "Манхан, Өлгий, Бүрэгхангай, Улаанбаатар хотод хөшөө; МАА-ийн 132-р анги Д.Нянтайсүрэнгийн нэрэмжит."],
    ];
    const cw = 5.95, ch = 2.3, x0 = 0.6, y0 = 1.5;
    pts.forEach(([data, head, body], i) => {
      const x = x0 + (i % 2) * (cw + 0.2), y = y0 + Math.floor(i / 2) * (ch + 0.2);
      s.addShape(pres.ShapeType.roundRect, { x, y, w: cw, h: ch, fill: { color: C.background2 }, line: { color: C.background2 }, rectRadius: 0.1, objectName: `pt ${i} card` });
      iconCircle(s, data, x + 0.25, y + 0.25, 0.6, H.accent1, `pt ${i}`);
      s.addText(head, { x: x + 1.05, y: y + 0.25, w: cw - 1.3, h: 0.6, fontSize: 16, bold: true, color: C.text1, valign: "middle", isTextBox: true, margin: 0, objectName: `pt ${i} head` });
      s.addText(body, { x: x + 0.25, y: y + 0.95, w: cw - 0.5, h: ch - 1.1, fontSize: 12, color: C.text2, valign: "top", isTextBox: true, margin: 0, objectName: `pt ${i} body` });
    });
    s.addText("Эх сурвалж: mn.wikipedia.org (БНМАУ-ын баатар цол; баатруудын нийтлэл), baabar.mn, montsame.mn, medee.mn, 24tsag.mn, mndu.gov.mn. Төрсөн он, зарим огноо эх сурвалжуудад зөрүүтэй тул архивын баримтаар нягтлахыг зөвлөнө.", {
      x: 0.6, y: 6.55, w: 12.1, h: 0.45, fontSize: 9.5, color: C.text2, isTextBox: true, margin: 0, valign: "top", objectName: "sources",
    });
  }

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})().catch(e => { console.error(e); process.exit(1); });
