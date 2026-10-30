const path = require("path");
const pptxgen = require("pptxgenjs");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");
const { applyTheme } = require("/root/.claude/skills/synced/fe019058-29db-493e-af31-ebcad9ee57b5_482cbf05-15ca-47b9-aee3-62803539df89/pptx/scripts/apply_theme.js");

const S = "/tmp/claude-0/-home-user-research-material/1f83c5a9-2d5b-5635-bdc8-6124db927ae1/scratchpad";
const MEDIA = path.join(S, "media");
const OUT = process.argv[2] || path.join(S, "build", "deck.pptx");

const HEX = {
  ink: "1B2333", navy: "14284B", red: "C8102E", gold: "C9A227", slate: "5B6B85",
  green: "2E7D4F", blue: "2B5CA8", light: "EEF1F6", white: "FFFFFF",
};
const TINT = { gold: "F7EFD6", red: "FBE8EB", green: "E3F1E8", step1: "E4E9F1", step2: "C9D3E3" };

const THEME = {
  name: "UBHIS Cadet Corps",
  headFontFace: "Arial",
  bodyFontFace: "Calibri",
  colors: {
    dk1: HEX.ink, lt1: HEX.white, dk2: HEX.navy, lt2: HEX.light,
    accent1: HEX.navy, accent2: HEX.red, accent3: HEX.gold, accent4: HEX.slate,
    accent5: HEX.green, accent6: HEX.blue, hlink: HEX.blue, folHlink: HEX.slate,
  },
};

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "Сонсогчийн хороог шинээр байгуулах нэгдсэн санал";
pres.author = "ЦНС-ийн Кибер аюулгүй байдлын тэнхим";
pres.company = "ҮБХИС";

const C = pres.SchemeColor;
const NAVY = C.accent1, RED = C.accent2, GOLD = C.accent3, SLATE = C.accent4, GREEN = C.accent5;
const WHITE = C.background1, LIGHT = C.background2, INK = C.text1;

const W = 13.333, MX = 0.6, CW = W - 2 * MX;
const shadow = () => ({ type: "outer", color: "000000", opacity: 0.12, blur: 6, offset: 2, angle: 90 });

async function icon(Ic, color = HEX.white) {
  const svg = renderToStaticMarkup(React.createElement(Ic, { color: "#" + color, size: 256 }));
  const buf = await sharp(Buffer.from(svg)).resize(256, 256).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

// ---------- Layouts ----------
const FOOTER = "ҮБХИС · Сонсогчийн хорооны нэгдсэн санал · 2026";
pres.defineSlideMaster({
  title: "TITLE_DARK",
  background: { color: NAVY },
  objects: [
    { placeholder: { options: { name: "kicker", type: "body", x: MX, y: 1.5, w: 7.2, h: 0.4, fontSize: 14, bold: true, color: GOLD, charSpacing: 2, margin: 0 }, text: "" } },
    { placeholder: { options: { name: "title", type: "title", x: MX, y: 2.05, w: 7.2, h: 2.1, fontSize: 40, bold: true, color: WHITE, valign: "top", align: "left", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "subtitle", type: "body", x: MX, y: 4.25, w: 7.0, h: 1.0, fontSize: 20, color: "CADCFC", valign: "top", margin: 0 }, text: "" } },
  ],
});
pres.defineSlideMaster({
  title: "CONTENT",
  background: { color: WHITE },
  margin: [0.5, 0.6, 0.6, 0.6],
  objects: [
    { placeholder: { options: { name: "kicker", type: "body", x: MX, y: 0.35, w: CW, h: 0.32, fontSize: 12, bold: true, color: RED, charSpacing: 2, margin: 0 }, text: "" } },
    { placeholder: { options: { name: "title", type: "title", x: MX, y: 0.68, w: CW, h: 0.8, fontSize: 30, bold: true, color: NAVY, valign: "top", align: "left", margin: 0 }, text: "" } },
    { text: { text: FOOTER, options: { x: MX, y: 7.0, w: 8, h: 0.3, fontSize: 10, color: SLATE, margin: 0 } } },
  ],
  slideNumber: { x: 12.23, y: 7.0, w: 0.5, h: 0.3, fontSize: 10, color: SLATE, align: "right" },
});
pres.defineSlideMaster({
  title: "CLOSING_DARK",
  background: { color: NAVY },
  objects: [
    { placeholder: { options: { name: "kicker", type: "body", x: MX, y: 0.35, w: CW, h: 0.32, fontSize: 12, bold: true, color: GOLD, charSpacing: 2, margin: 0 }, text: "" } },
    { placeholder: { options: { name: "title", type: "title", x: MX, y: 0.68, w: CW, h: 0.8, fontSize: 30, bold: true, color: WHITE, valign: "top", align: "left", margin: 0 }, text: "" } },
  ],
  slideNumber: { x: 12.23, y: 7.0, w: 0.5, h: 0.3, fontSize: 10, color: "CADCFC", align: "right" },
});

function content(section, kicker, title, notes) {
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: section });
  s.addText(kicker, { placeholder: "kicker" });
  s.addText(title, { placeholder: "title" });
  if (notes) s.addNotes(notes);
  return s;
}
function card(s, x, y, w, h, fill, name, extra = {}) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { color: fill, width: 0 }, rectRadius: 0.08, shadow: shadow(), objectName: name, ...extra });
}
function iconCircle(s, x, y, d, fill, data, name) {
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { color: fill, width: 0 }, objectName: name + " circle" });
  const p = d * 0.24;
  s.addImage({ data, x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p, altText: name, objectName: name + " icon" });
}
function txt(s, text, opts) { s.addText(text, { isTextBox: true, margin: 0, ...opts }); }

(async () => {
  const I = {
    tasks: await icon(fa.FaClipboardList), user: await icon(fa.FaUserCheck), scale: await icon(fa.FaBalanceScale),
    shield: await icon(fa.FaShieldAlt), hands: await icon(fa.FaHandshake), flag: await icon(fa.FaFlag),
    ban: await icon(fa.FaBan), users: await icon(fa.FaUsers), warn: await icon(fa.FaExclamationTriangle),
    chart: await icon(fa.FaChartLine), ruler: await icon(fa.FaRulerCombined), shirt: await icon(fa.FaTshirt),
    swap: await icon(fa.FaExchangeAlt), layers: await icon(fa.FaLayerGroup), grad: await icon(fa.FaGraduationCap),
    award: await icon(fa.FaAward),
  };

  // ================= 1. Title =================
  pres.addSection({ title: "Удиртгал" });
  {
    const s = pres.addSlide({ masterName: "TITLE_DARK", sectionTitle: "Удиртгал" });
    s.addText("ҮНДЭСНИЙ БАТЛАН ХАМГААЛАХЫН ИХ СУРГУУЛЬ", { placeholder: "kicker" });
    s.addText("Сонсогчийн хороог шинээр байгуулах нь", { placeholder: "title" });
    s.addText("Бүтэц, зохион байгуулалт ба ялгах тэмдэг, шагналын тэмдгийн нэгдсэн санал", { placeholder: "subtitle" });
    txt(s, "ЦНС-ийн Кибер аюулгүй байдлын тэнхим · Улаанбаатар, 2026", { x: MX, y: 6.35, w: 7.2, h: 0.4, fontSize: 14, color: WHITE });
    s.addShape(pres.shapes.RECTANGLE, { x: 8.55, y: 0, w: W - 8.55, h: 7.5, fill: { color: WHITE }, line: { color: WHITE, width: 0 }, objectName: "Badge panel" });
    s.addImage({ path: path.join(MEDIA, "eagle.png"), x: 9.38, y: 1.2, w: 3.12, h: 4.32, altText: "Хорооны ахлах сонсогчийн ханцуйн тэмдгийн загвар: шонхор шувуу, 4 алтлаг ромб, алтан хүрээ", objectName: "Senior cadet badge" });
    txt(s, "Хорооны ахлах сонсогчийн ханцуйн тэмдэг (санал)", { x: 8.95, y: 5.75, w: 3.98, h: 0.5, fontSize: 12, color: SLATE, align: "center" });
    s.addNotes("Энэхүү танилцуулга нь ЦНС-ийн Кибер аюулгүй байдлын тэнхимийн боловсруулсан хоёр саналыг нэгтгэв: (1) Сонсогчийн хороог шинээр байгуулах бүтэц, зохион байгуулалтын санал, (2) Сонсогчийн хорооны ялгах тэмдэг, шагналын тэмдгийн загвар, журмын санал.");
  }

  // ================= 2. Summary =================
  {
    const s = content("Удиртгал", "ТОВЧ ХУРААНГУЙ", "Сонсогч удирдана, офицер зааварлаж хянана",
      "Гол санаа: сонсогчдын өөрсдөө удирддаг, цэргийн ангийн бүтэцтэй Сонсогчийн хороо байгуулж, түүний бүтцийг ялгах тэмдэг, шагналын тэмдгээр өдөр тутам харагдахуйц болгоно. Удирдлагаас хүсэх гурван шийдвэрийг доод хэсэгт харуулав.");
    txt(s, "9 орны тэргүүлэх цэргийн академийн туршлагад тулгуурлан ҮБХИС-д сонсогчдын өөрсдөө удирддаг, цэргийн ангийн бүтэцтэй «Сонсогчийн хороо»-г байгуулж, түүний бүтэц, удирдагчдыг ялгах тэмдэг, шагналын тэмдгийн нэгдсэн тогтолцоогоор өдөр тутам харагдахуйц болгохыг санал болгож байна.",
      { x: MX, y: 1.7, w: CW, h: 1.2, fontSize: 18, color: INK, valign: "top" });
    const stats = [
      ["3·12·48", "батальон · рот · салаа\n≈1,200 сонсогчийн жишиг тооцоо", NAVY],
      ["≥ 60%", "4-р курсийн сонсогч офицерын түвшний албан тушаал хашина", RED],
      ["4", "шагналын тэмдэг — нэгдсэн загвар, ил тод шалгуур", NAVY],
      ["2027", "хавар 1 батальонд туршиж, 2027–2028 оноос бүрэн нэвтрүүлэх", RED],
    ];
    const tw = (CW - 3 * 0.27) / 4;
    stats.forEach(([n, l, c], i) => {
      const x = MX + i * (tw + 0.27);
      card(s, x, 3.15, tw, 2.1, LIGHT, "Stat " + (i + 1));
      txt(s, n, { x: x + 0.25, y: 3.35, w: tw - 0.5, h: 0.8, fontSize: 34, bold: true, color: c, fontFace: THEME.headFontFace });
      txt(s, l, { x: x + 0.25, y: 4.2, w: tw - 0.5, h: 0.9, fontSize: 14, color: INK, valign: "top" });
    });
    card(s, MX, 5.6, CW, 1.1, NAVY, "Decision box");
    txt(s, [
      { text: "Шийдвэрлүүлэх: ", options: { bold: true, color: GOLD } },
      { text: "ажлын хэсэг байгуулах · «Сонсогчийн хорооны журам» ба «Ялгах тэмдэг, шагналын тэмдгийн журам»-ыг батлах · 2027 оны хавар туршилт эхлүүлэх", options: { color: WHITE } },
    ], { x: MX + 0.35, y: 5.6, w: CW - 0.7, h: 1.1, fontSize: 16, valign: "middle" });
  }

  // ================= 3. Rationale =================
  {
    const s = content("Удиртгал", "ҮНДЭСЛЭЛ, ЗОРИЛГО", "Төгсөгчид удирдах бодит туршлага дутмаг байна",
      "Офицер төгссөн даруйдаа салаа, ротыг удирддаг ч сургуульд байхдаа удирдах дадлагыг голдуу онолоор авдаг. Баруун талд Сонсогчийн хорооны хүрэх зургаан үр дүнг харуулав.");
    const blocks = [
      ["Асуудал", "Төгсөгч офицер шууд салаа, ротыг удирдаж, дэг журам, сахилга, сургалт, ар талыг бие даан шийддэг. Гэвч 4 жилд удирдах ур чадварыг голдуу онолын хичээл, богино дадлагаар эзэмшдэг."],
      ["Олон улсын шийдэл", "Тэргүүлэх академиуд сонсогчдын өөрсдөө удирддаг байгууллагаар (Corps of Cadets, Brigade of Midshipmen, Cadet Wing, 学生隊) дагагчаас батальоны дарга хүртэл шат дараатай туршлага олгодог."],
      ["Зорилго", "Сонсогчийн хороог «манлайллын лаборатори» болгож, ҮБХИС-ийн 4 жилийн сургалтад нийцүүлэх."],
    ];
    let y = 1.75;
    blocks.forEach(([h, b], i) => {
      txt(s, h, { x: MX, y, w: 4.9, h: 0.35, fontSize: 16, bold: true, color: RED });
      const bh = i === 2 ? 0.85 : 1.25;
      txt(s, b, { x: MX, y: y + 0.38, w: 4.9, h: bh, fontSize: 14, color: INK, valign: "top" });
      y += 0.38 + bh + 0.2;
    });
    txt(s, "Хүрэх үр дүн — сонсогчид бий болох чадвар", { x: 5.9, y: 1.75, w: 6.83, h: 0.35, fontSize: 16, bold: true, color: NAVY });
    const items = [
      [I.tasks, "Өдөр тутмыг удирдах", "Дотоод алба, жижүүр, үзлэг, жагсаалыг зохион байгуулах"],
      [I.user, "Бие даан ажиллах", "Даалгаврыг байнгын хяналтгүйгээр төлөвлөж, гүйцэтгэж, тайлагнах"],
      [I.scale, "Шийдвэр гаргах", "Эрх хэмжээндээ цагтаа шийдвэр гаргаж, хариуцлага хүлээх"],
      [I.shield, "Сахилга", "Дүрэм журмыг өөрөө сахиж, бусдад сахиулах"],
      [I.hands, "Ёс зүй", "Үнэнч шударга, нэр төртэй, эрх мэдлээ зүй зохистой хэрэглэх"],
      [I.flag, "Эх оронч үзэл", "Монгол цэргийн түүх, баатруудын гавьяаг дээдлэх"],
    ];
    const gw = (6.83 - 0.23) / 2, gh = 1.42;
    items.forEach(([ic, h, b], i) => {
      const x = 5.9 + (i % 2) * (gw + 0.23), yy = 2.2 + Math.floor(i / 2) * (gh + 0.15);
      card(s, x, yy, gw, gh, LIGHT, "Outcome " + (i + 1));
      iconCircle(s, x + 0.2, yy + 0.22, 0.6, i % 2 ? RED : NAVY, ic, h);
      txt(s, h, { x: x + 0.95, y: yy + 0.22, w: gw - 1.1, h: 0.4, fontSize: 16, bold: true, color: NAVY });
      txt(s, b, { x: x + 0.95, y: yy + 0.62, w: gw - 1.1, h: 0.7, fontSize: 13, color: INK, valign: "top" });
    });
  }

  // ================= 4. International comparison =================
  pres.addSection({ title: "Олон улсын туршлага" });
  {
    const s = content("Олон улсын туршлага", "ОЛОН УЛСЫН ТУРШЛАГА", "9 академийн 7 нь сонсогч-удирдагчтай, холимог ротой",
      "Судалсан 9 сургуулиас 7 нь бүх курсийн холимог рот, сонсогч удирдагчийн загвартай. ОХУ-ын загварт офицер шууд удирддаг бөгөөд ҮБХИС-ийн одоогийн зохион байгуулалт түүнтэй ойр. Шинэ хороо нь хэвтээ загвараас босоо, сонсогч-удирдагчтай загвар руу шилжих алхам юм.");
    const hdr = ["Сургууль", "Сонсогч", "Бүтэц", "Рот", "Ротаци"].map(t => ({ text: t, options: { bold: true, color: WHITE, fill: { color: NAVY } } }));
    const rows = [
      ["USMA (АНУ)", "4,400", "Бригад → 4 хороо → 12 батальон → 36 рот", "Бүх курс холимог", "Жил / улирал"],
      ["USNA (АНУ)", "4,400", "Бригад → 6 батальон → 30–36 рот", "Бүх курс холимог", "Семестр бүр"],
      ["USAFA (АНУ)", "4,000", "Жигүүр → 4 бүлэг → 40 эскадриль", "Бүх курс холимог", "Семестр бүр"],
      ["RMC (Канад)", "1,100", "Жигүүр → 4 дивиз → 12 эскадриль", "Бүх курс холимог", "Семестр бүр"],
      ["RMAS (Британи)", "Элсэлтээр", "3 коллеж → рот → салаа", "Нэг элсэлт", "Улирал бүр"],
      ["БХА (Япон)", "2,000", "Корпус → 4 батальон → рот → салаа", "Бүх курс холимог", "Жилд 3 удаа"],
      ["KMA (БНСУ)", "1,000", "Хороо → 8 рот", "Холимог", "Семестр бүр"],
      ["NDA (Энэтхэг)", "2,000", "5 батальон → 18 эскадриль", "Бүх курс холимог", "Улирал бүр"],
      ["ОХУ", "Сургуулиар", "Курс (батальон) → рот → салаа → тасаг", "Нэг курс", "Офицер удирдана"],
    ].map((r, i) => r.map((t, j) => ({ text: t, options: { bold: j === 0, color: INK, fill: { color: i === 8 ? TINT.red : (i % 2 ? WHITE : LIGHT) } } })));
    s.addTable([hdr, ...rows], { x: MX, y: 1.7, w: CW, colW: [2.2, 1.45, 4.68, 2.0, 1.8], rowH: 0.4, fontSize: 13, color: INK, valign: "middle", border: { type: "solid", pt: 0.5, color: "D5DBE5" }, margin: [0, 0.08, 0, 0.08] });
    card(s, MX, 5.95, CW, 0.78, TINT.gold, "Takeaway");
    txt(s, [
      { text: "Сургамж: ", options: { bold: true, color: NAVY } },
      { text: "ОХУ-ын хэвтээ загварт сонсогч офицерын түвшний удирдах туршлага олж авдаггүй. ҮБХИС-ийн одоогийн зохион байгуулалт энэ загвартай ойр.", options: { color: INK } },
    ], { x: MX + 0.3, y: 5.95, w: CW - 0.6, h: 0.78, fontSize: 15, valign: "middle" });
  }

  // ================= 5. Principles =================
  {
    const s = content("Олон улсын туршлага", "НИЙТЛЭГ ЗАРЧИМ", "8 нийтлэг зарчмыг ҮБХИС-д нутагшуулна",
      "Олон улсын туршлагаас гаргасан 8 нийтлэг зарчим, тэдгээрийг ҮБХИС-д хэрхэн хэрэгжүүлэх саналыг харуулав.");
    const P = [
      ["Цэргийн ангийн бүтэц", "Хороо → батальон → рот → салаа → тасаг; Монгол цэргийн нэр томъёо"],
      ["Босоо холимог рот", "Ротыг 1–4-р курсээс бүрдүүлж, ахлах нь бага курсээ сургана"],
      ["Шатласан хариуцлага", "4 жилийн «Манлайллын хөгжлийн шат»: дагагч → офицер"],
      ["Сэлгэн томилох", "Семестр бүр солих; 4-р курсийн ≥60% офицерын албан тушаал хашина"],
      ["Сургагч хос", "Рот бүрт сургагч офицер + сургагч ахлагч — зөвлөх, хянагч"],
      ["Нэр төрийн тогтолцоо", "Ёс зүйн (нэр төрийн) зөвлөл, «Нэр төрийн дүрэм» батлах"],
      ["Уламжлал, бэлгэдэл", "Нэрэмжит рот, туг, ялгах ба шагналын тэмдэг"],
      ["Тэнцвэр, хяналт", "Эрх хэмжээний матриц, нууц гомдлын суваг"],
    ];
    const cw = (CW - 3 * 0.25) / 4, ch = 2.3;
    P.forEach(([h, b], i) => {
      const x = MX + (i % 4) * (cw + 0.25), y = 1.75 + Math.floor(i / 4) * (ch + 0.25);
      card(s, x, y, cw, ch, LIGHT, "Principle " + (i + 1));
      s.addShape(pres.shapes.OVAL, { x: x + 0.2, y: y + 0.25, w: 0.5, h: 0.5, fill: { color: i < 4 ? NAVY : RED }, line: { color: WHITE, width: 0 }, objectName: "Number " + (i + 1) });
      txt(s, String(i + 1), { x: x + 0.2, y: y + 0.25, w: 0.5, h: 0.5, fontSize: 16, bold: true, color: WHITE, align: "center", valign: "middle" });
      txt(s, h, { x: x + 0.85, y: y + 0.15, w: cw - 1.0, h: 0.7, fontSize: 15, bold: true, color: NAVY, valign: "middle" });
      txt(s, [{ text: "ҮБХИС-д: ", options: { bold: true, color: RED } }, { text: b, options: { color: INK } }], { x: x + 0.2, y: y + 1.0, w: cw - 0.4, h: 1.15, fontSize: 15, valign: "top" });
    });
  }

  // ================= 6. Structure =================
  pres.addSection({ title: "Бүтэц, зохион байгуулалт" });
  {
    const s = content("Бүтэц, зохион байгуулалт", "БҮТЭЦ", "Цэргийн ангийн бүтэцтэй хороо: ≈1,200 сонсогч",
      "Хорооны захирагч офицер бөгөөд түүний доор сонсогч удирдагчдын командын шугам ажиллана. Хаалтанд буй тоо нь тухайн албан тушаалыг хашихын курсийг заана. Ротыг ≈100 сонсогч (курс бүрээс ≈25) байлгах нь ротын дарга бүх бүрэлдэхүүнээ нэрээр нь мэдэж удирдах оновчтой хэмжээ юм.");
    const line = (x1, y1, x2, y2) => s.addShape(pres.shapes.LINE, { x: x1, y: y1, w: x2 - x1, h: y2 - y1, line: { color: HEX.slate, width: 1.25 }, objectName: "Connector" });
    const box = (x, y, w, h, kind, title, sub, name) => {
      const f = kind === "off" ? NAVY : kind === "cad" ? TINT.gold : TINT.green;
      const lc = kind === "off" ? HEX.navy : kind === "cad" ? HEX.gold : HEX.green;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: f }, line: { color: lc, width: 1 }, rectRadius: 0.06, objectName: name });
      const tc = kind === "off" ? WHITE : NAVY, sc = kind === "off" ? "CADCFC" : INK;
      txt(s, [{ text: title, options: { bold: true, color: tc, fontSize: 14, breakLine: !!sub } }, ...(sub ? [{ text: sub, options: { color: sc, fontSize: 12 } }] : [])],
        { x: x + 0.1, y, w: w - 0.2, h, align: "center", valign: "middle" });
    };
    const cx = W / 2;
    box(cx - 3.6, 1.65, 7.2, 0.5, "off", "ҮБХИС-ийн захирал · Сургалт, цэргийн алба хариуцсан дэд захирал", null, "Rector");
    line(cx, 2.15, cx, 2.35);
    box(cx - 2.9, 2.35, 5.8, 0.7, "off", "СОНСОГЧИЙН ХОРООНЫ ЗАХИРАГЧ (офицер)", "Офицер, ахлагчийн баг · сэтгэл зүйч · хуулийн зөвлөх", "Commandant");
    line(cx, 3.05, cx, 3.25);
    box(cx - 2.25, 3.25, 4.5, 0.75, "cad", "ХОРООНЫ АХЛАХ СОНСОГЧ (4)", "Орлогч (4) · Хорооны ахлах түрүүч (3)", "Senior cadet");
    box(MX, 3.25, 3.6, 0.75, "cad", "Хорооны штаб (4)", "Бие бүрэлдэхүүн · Ажиллагаа · Ар тал · Хүмүүжил", "Staff");
    box(W - MX - 3.6, 3.25, 3.6, 0.75, "cou", "Сонсогчийн 5 зөвлөл", "Ёс зүй · Цэргийн алба · Сургалт · Спорт, соёл · Мэдээлэл", "Councils");
    line(MX + 3.6, 3.625, cx - 2.25, 3.625);
    line(cx + 2.25, 3.625, W - MX - 3.6, 3.625);
    const bw = 3.6, gap = 0.4, bx0 = (W - (3 * bw + 2 * gap)) / 2;
    line(cx, 4.0, cx, 4.2);
    line(bx0 + bw / 2, 4.2, bx0 + 2 * (bw + gap) + bw / 2, 4.2);
    ["1", "2", "3"].forEach((n, i) => {
      const x = bx0 + i * (bw + gap);
      line(x + bw / 2, 4.2, x + bw / 2, 4.35);
      box(x, 4.35, bw, 0.7, "cad", `${n}-р батальон`, `${i * 4 + 1}–${i * 4 + 4}-р рот · ≈400 сонсогч`, "Battalion " + n);
    });
    txt(s, "Батальон бүрийн доторх нэгж (хаалтанд — курс)", { x: bx0, y: 5.15, w: 6, h: 0.3, fontSize: 12, italic: true, color: SLATE });
    const units = [["Рот ≈100 сонсогч", "Ротын дарга (4) · Орлогч (4) · Ахлах түрүүч (3)"], ["Салаа ≈25 · ротод 4", "Салааны дарга (4) · Салааны ахлагч (3)"], ["Тасаг 6–8 · салаанд 3", "Тасгийн дарга (3) · Багийн ахлагч (2) ×2"]];
    units.forEach(([t, sub], i) => {
      const x = bx0 + i * (bw + gap);
      box(x, 5.5, bw, 0.8, "cad", t, sub, "Unit " + (i + 1));
      if (i < 2) s.addShape(pres.shapes.LINE, { x: x + bw + 0.05, y: 5.9, w: gap - 0.1, h: 0, line: { color: HEX.slate, width: 1.5, endArrowType: "triangle" }, objectName: "Arrow" });
    });
    const leg = [[NAVY, "Офицер (байнгын бие бүрэлдэхүүн)"], [TINT.gold, "Сонсогч удирдагч"], [TINT.green, "Өөрөө удирдах зөвлөл"]];
    let lx = bx0;
    leg.forEach(([c, t], i) => {
      s.addShape(pres.shapes.RECTANGLE, { x: lx, y: 6.5, w: 0.25, h: 0.25, fill: { color: c }, line: { color: [HEX.navy, HEX.gold, HEX.green][i], width: 1 }, objectName: "Legend " + (i + 1) });
      txt(s, t, { x: lx + 0.35, y: 6.48, w: 3.2, h: 0.3, fontSize: 12, color: INK, valign: "middle" });
      lx += 3.75;
    });
  }

  // ================= 7. Leadership ladder =================
  {
    const s = content("Бүтэц, зохион байгуулалт", "МАНЛАЙЛЛЫН ХӨГЖЛИЙН ШАТ", "Курс ахих тусам хариуцлага шат дараатай нэмэгдэнэ",
      "Сонсогч 4 жилд өөрийгөө удирдахаас эхлээд байгууллага удирдах хүртэл хөгжинө. Семестр бүрийн ротацийн ачаар 4-р курсийн ≈62% офицерын түвшний албан тушаал (зөвлөл, менторын үүргийг нэмбэл 100%), 3-р курсийн бүх сонсогч түрүүчийн түвшний албан тушаалыг дор хаяж нэг удаа хашина.");
    txt(s, "Өөрийгөө удирдах  →  бусдыг удирдах  →  байгууллагыг удирдах", { x: MX, y: 1.75, w: 8.6, h: 0.4, fontSize: 18, italic: true, color: SLATE });
    const steps = [
      ["1-р курс", "Дагагч", "Дүрэм, жишиг эзэмших, цаг баримтлах, тушаал гүйцэтгэх", 2.2, TINT.step1, false],
      ["2-р курс", "Багийн ахлагч", "1-р курсийн 2–3 сонсогчийг дагалдан сургах (ментор)", 2.7, TINT.step2, false],
      ["3-р курс", "Түрүүч", "Тасгийн дарга, салааны ахлагч, ротын ахлах түрүүч, ротын жижүүр", 3.2, SLATE, true],
      ["4-р курс", "Офицер", "Салаа, рот, батальоны дарга, хорооны ахлах сонсогч, штаб, зөвлөлийн дарга", 3.7, NAVY, true],
    ];
    const sw = 2.05;
    steps.forEach(([c, r, d, h, f, dark], i) => {
      const x = MX + i * (sw + 0.15), y = 6.6 - h;
      s.addShape(pres.shapes.RECTANGLE, { x, y, w: sw, h, fill: { color: f }, line: { color: f, width: 0 }, objectName: "Step " + (i + 1) });
      txt(s, [
        { text: c, options: { bold: true, fontSize: 13, color: dark ? GOLD : RED, breakLine: true } },
        { text: r, options: { bold: true, fontSize: 20, color: dark ? WHITE : NAVY, breakLine: true } },
        { text: d, options: { fontSize: 14, color: dark ? WHITE : INK } },
      ], { x: x + 0.15, y: y + 0.15, w: sw - 0.3, h: h - 0.3, valign: "top", paraSpaceAfter: 4 });
    });
    const px = 9.75, pw = W - MX - px;
    card(s, px, 1.75, pw, 4.85, LIGHT, "Rotation panel");
    txt(s, "Семестр бүр сэлгэн томилно", { x: px + 0.25, y: 1.9, w: pw - 0.5, h: 0.4, fontSize: 16, bold: true, color: NAVY });
    [["≈62%", "4-р курс — офицерын албан тушаал (93 / семестр)"], ["≈100%", "3-р курс — түрүүчийн албан тушаал (212 / семестр)"], ["≈100%", "2-р курс — багийн ахлагч (288 / семестр)"]].forEach(([n, l], i) => {
      const y = 2.4 + i * 1.12;
      txt(s, n, { x: px + 0.25, y, w: pw - 0.5, h: 0.5, fontSize: 28, bold: true, color: RED, fontFace: THEME.headFontFace });
      txt(s, l, { x: px + 0.25, y: y + 0.5, w: pw - 0.5, h: 0.55, fontSize: 13, color: INK, valign: "top" });
    });
    txt(s, "Томилогдсон удирдагч ≈40 цагийн «Сонсогч удирдагчийн сургалт»-д заавал хамрагдана.", { x: px + 0.25, y: 5.75, w: pw - 0.5, h: 0.75, fontSize: 12, italic: true, color: SLATE, valign: "top" });
  }

  // ================= 8. Selection & authority =================
  {
    const s = content("Бүтэц, зохион байгуулалт", "ШАЛГАРУУЛАЛТ, ЭРХ ХЭМЖЭЭ", "Ил тод шалгаруулалт, тодорхой эрх хэмжээ",
      "Удирдах албан тушаалд 5 шалгуурын жинтэй оноогоор сонгоно; сурлагын доод босго (ж.нь 3.0)-оос доош эсвэл нэр төрийн зөрчилтэй бол нэр дэвшихгүй. Эрх хэмжээний матриц нь бие даан шийдвэр гаргах чадварыг хөгжүүлэхийн зэрэгцээ эрх мэдлийн хэтрүүлэлээс сэргийлнэ.");
    s.addChart(pres.charts.BAR, [{ name: "Жин", labels: ["Сурлагын голч дүн", "Цэргийн бэлтгэл, манлайлал", "Бие бялдар", "Сахилга, ёс зүй", "Ярилцлага"], values: [30, 30, 15, 15, 10] }], {
      x: MX, y: 1.7, w: 5.7, h: 3.85, barDir: "bar", chartColors: [HEX.navy],
      showTitle: true, title: "Сонгон шалгаруулалтын шалгуурын жин, %", titleFontSize: 14, titleColor: HEX.navy, titleFontFace: "+mn-lt",
      showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 13, dataLabelColor: HEX.ink, dataLabelFontFace: "+mn-lt", dataLabelFormatCode: "0\"%\"",
      catAxisLabelColor: HEX.ink, catAxisLabelFontSize: 13, catAxisLabelFontFace: "+mn-lt", catAxisOrientation: "maxMin",
      valAxisHidden: true, valAxisMaxVal: 36, valGridLine: { style: "none" }, catGridLine: { style: "none" }, showLegend: false, barGapWidthPct: 60,
    });
    txt(s, "Хорооны ба батальоны түвшний удирдагчийг Хорооны шалгаруулах зөвлөл, ротын болон түүнээс доош түвшнийхийг Ротын шалгаруулах зөвлөл сонгож, захирагчийн тушаалаар томилно.",
      { x: MX, y: 5.7, w: 5.7, h: 1.0, fontSize: 13, color: INK, valign: "top" });
    const tx = 6.75, tw = W - MX - tx;
    const val = t => ({ text: t, options: { bold: t === "Шийднэ", color: t === "Шийднэ" ? RED : INK, align: "center" } });
    const hdr = ["Асуудал", "Сонсогч удирдагч", "Сургагч офицер", "Хорооны захирагч"].map((t, j) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: NAVY }, align: j ? "center" : "left" } }));
    const rows = [
      ["Өдөр тутмын дэг журам, үзлэг", "Шийднэ", "Мэдээлэл", "—"],
      ["Жижүүр, үйлчилгээний хуваарь", "Шийднэ", "Мэдээлэл", "—"],
      ["Бага зөрчилд сахилгын оноо", "Шийднэ", "Батална", "—"],
      ["Амралтын өдрийн чөлөө", "Санал", "Шийднэ", "Мэдээлэл"],
      ["Ноцтой зөрчил, нэр төрийн хэрэг", "Санал", "Санал", "Шийднэ"],
      ["Удирдагчийг томилох, чөлөөлөх", "Санал", "Санал", "Шийднэ"],
    ].map((r, i) => r.map((t, j) => j ? { ...val(t), options: { ...val(t).options, fill: { color: i % 2 ? WHITE : LIGHT } } } : { text: t, options: { color: INK, fill: { color: i % 2 ? WHITE : LIGHT } } }));
    s.addTable([hdr, ...rows], { x: tx, y: 1.7, w: tw, colW: [2.58, 1.15, 1.15, 1.1], rowH: [0.6, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5], fontSize: 13, valign: "middle", border: { type: "solid", pt: 0.5, color: "D5DBE5" }, margin: [0, 0.06, 0, 0.08] });
    card(s, tx, 5.55, tw, 1.15, TINT.red, "Prohibition");
    iconCircle(s, tx + 0.2, 5.8, 0.65, RED, I.ban, "Prohibited");
    txt(s, [{ text: "Хатуу хориглоно: ", options: { bold: true, color: RED } }, { text: "сонсогч удирдагч бие махбодын шийтгэл, доромжлол, хувийн үйлчилгээ шаардах, хоолноос хасах үйлдэл хийх.", options: { color: INK } }],
      { x: tx + 1.05, y: 5.55, w: tw - 1.25, h: 1.15, fontSize: 14, valign: "middle" });
  }

  // ================= 9. Honor & tradition =================
  {
    const s = content("Бүтэц, зохион байгуулалт", "НЭР ТӨР, ЭХ ОРОНЧ ХҮМҮҮЖИЛ", "Нэр төр, уламжлалаар хүмүүжүүлнэ",
      "Нэр төрийн дүрмийг сонсогчид өөрсдөө хэрэгжүүлнэ. 12 ротын 11-д ҮБХИС-иас төрсөн Монгол Улсын баатруудын нэрийг олгож, 12 дахь ротын нэрийг Эрдмийн зөвлөлөөр тогтооно. Ёслол, түүхэн аялал, үндэсний спортын «Аваргын туг»-ийн өрсөлдөөн нь эх оронч хүмүүжлийн хэрэгсэл болно.");
    const lw = 5.6;
    card(s, MX, 1.7, lw, 5.0, NAVY, "Honor code card");
    txt(s, "СОНСОГЧИЙН НЭР ТӨРИЙН ДҮРЭМ (ТӨСӨЛ)", { x: MX + 0.35, y: 1.9, w: lw - 0.7, h: 0.35, fontSize: 13, bold: true, color: GOLD, charSpacing: 1 });
    txt(s, "«ҮБХИС-ийн сонсогч худал хэлэхгүй, хулгай хийхгүй, хууран мэхлэхгүй, эдгээрийг үйлдэгчийг тэвчихгүй.»", { x: MX + 0.35, y: 2.35, w: lw - 0.7, h: 1.35, fontSize: 19, italic: true, color: WHITE, valign: "top", fontFace: THEME.headFontFace });
    txt(s, [
      { text: "Сахилгын онооны цахим бүртгэл: бага зөрчил — сонсогч удирдагч, дунд — сургагч офицер, ноцтой — захирагч", options: { bullet: true, breakLine: true } },
      { text: "Нууц гомдлын суваг (сэтгэл зүйч, хуулийн зөвлөх, цахим хайрцаг), сар бүр нэргүй санал асуулга", options: { bullet: true, breakLine: true } },
      { text: "Сонсогч бүр давж заалдах эрхтэй", options: { bullet: true } },
    ], { x: MX + 0.35, y: 3.9, w: lw - 0.7, h: 2.6, fontSize: 15, color: WHITE, valign: "top", paraSpaceAfter: 12 });
    const rx = 6.6, rw = W - MX - rx;
    txt(s, "Нэрэмжит 12 рот — ҮБХИС-иас төрсөн баатрууд", { x: rx, y: 1.7, w: rw, h: 0.4, fontSize: 16, bold: true, color: NAVY });
    const names = ["Ц.Олзвой", "Л.Гэлэгбаатар", "М.Экей", "Д.Дэмбэрэл", "Ж.Лхагвасүрэн", "В.Шарав", "Д.Данзанваанчиг", "С.Дампил", "Д.Хаянхярваа", "Д.Нянтайсүрэн", "П.Шагдарсүрэн", "Эрдмийн зөвлөл тогтооно"];
    const gw = (rw - 0.6 - 3 * 0.1) / 4, gh = 1.0;
    ["I", "II", "III"].forEach((b, r) => {
      const y = 2.25 + r * (gh + 0.15);
      txt(s, b, { x: rx, y, w: 0.5, h: gh, fontSize: 18, bold: true, color: GOLD, align: "center", valign: "middle", fontFace: THEME.headFontFace });
      for (let c = 0; c < 4; c++) {
        const i = r * 4 + c, x = rx + 0.6 + c * (gw + 0.1);
        card(s, x, y, gw, gh, LIGHT, "Company " + (i + 1));
        txt(s, [{ text: `${i + 1}-р рот`, options: { bold: true, color: RED, fontSize: 13, breakLine: true } }, { text: names[i], options: { bold: i < 11, italic: i === 11, color: i < 11 ? NAVY : SLATE, fontSize: 11 } }],
          { x: x + 0.05, y, w: gw - 0.1, h: gh, align: "center", valign: "middle" });
      }
    });
    txt(s, "Мөр бүр нэг батальон (I–III). Баатрын нэрийг ротын туг, байр, самбарт мөнхжүүлж, ханцуйн тэмдэгт зөвхөн ротын дугаарыг бичнэ.", { x: rx, y: 5.8, w: rw, h: 0.85, fontSize: 13, color: INK, valign: "top" });
  }

  // ================= 10. Rank insignia =================
  pres.addSection({ title: "Ялгах ба шагналын тэмдэг" });
  {
    const s = content("Ялгах ба шагналын тэмдэг", "ЯЛГАХ ТЭМДЭГ", "Албан тушаалыг баруун ханцуйн нэг тэмдгээр ялгана",
      "Ханцуйн тэмдэг нь 6×9 см, оройгоороо шовх таван өнцөгт, хар хөх суурьтай, нэг өнгийн улаан хөвөөтэй. Алтлаг ромб нь сонсогч офицерын шугам (4-р курс), мөнгөлөг шеврон нь сонсогч түрүүчийн шугам (2–3-р курс). Ромбын тоо нэгжийн түвшнийг, алтан хүрээ даргыг, шонхор шувуу хорооны ахлах сонсогчийг заана.");
    const iw = 5.55, ih = iw * 1310 / 1650, gap = 0.3, x0 = (W - (2 * iw + gap)) / 2;
    s.addImage({ path: path.join(MEDIA, "image1.png"), x: x0, y: 1.6, w: iw, h: ih, altText: "Сонсогч офицерын шугамын ханцуйн тэмдгүүд: 1–4 алтлаг ромб, алтан хүрээ, шонхор шувуу", objectName: "Officer line badges" });
    s.addImage({ path: path.join(MEDIA, "image2.png"), x: x0 + iw + gap, y: 1.6, w: iw, h: ih, altText: "Сонсогч түрүүчийн шугамын ханцуйн тэмдгүүд: мөнгөлөг шеврон, нуман тууз", objectName: "Sergeant line badges" });
    card(s, MX, 6.15, CW, 0.62, LIGHT, "Reading rule");
    txt(s, [
      { text: "Унших дүрэм: ", options: { bold: true, color: RED } },
      { text: "ромб 1–4 = салаа → рот → батальон → хороо · алтан хүрээ = дарга · шеврон = түрүүчийн түвшин · нуман тууз = ахлах түрүүч · араб тоо = рот, ром тоо = батальон", options: { color: INK } },
    ], { x: MX + 0.25, y: 6.15, w: CW - 0.5, h: 0.62, fontSize: 14, valign: "middle" });
  }

  // ================= 11. Placement & variants =================
  {
    const s = content("Ялгах ба шагналын тэмдэг", "ЗАГВАР, БАЙРШИЛ", "Албаны ба эрээн хувцсанд нэг загвар, хоёр хувилбар",
      "Одоогийн албан ёсны тэмдгүүд (Төрийн далбаа, курсийн тэмдэг, ханцуйн тэмдэг) байршлаа хадгална. Шинэ тэмдгийг баруун ханцуйнд, албан ёсны тэмдгээс 1.5 см доош зүүнэ. Тоо хэмжээ: нэг семестрт 593 албан тушаал; +20% нөөцтэй 719 албаны, 719 эрээн тэмдэг захиална. Тэмдгийг семестр бүр дахин ашиглах тул жил бүр зөвхөн элэгдсэн ≈15–20%-ийг нөхнө.");
    const iw = 6.7, ih = iw * 1560 / 2600;
    s.addImage({ path: path.join(MEDIA, "image4.png"), x: MX, y: 1.65, w: iw, h: ih, altText: "Ханцуйн тэмдгүүдийн байршил: албаны хувцасны зүүн, баруун ханцуй ба эрээн хувцас", objectName: "Placement diagram" });
    const st = [["593", "албан тушаал / семестр"], ["719 + 719", "албаны + эрээн (+20% нөөц)"], ["15–20%", "жил бүр нөхөх"]];
    const sw = (iw - 0.4) / 3;
    st.forEach(([n, l], i) => {
      const x = MX + i * (sw + 0.2);
      card(s, x, 5.85, sw, 0.9, LIGHT, "Qty " + (i + 1));
      txt(s, [{ text: n, options: { bold: true, fontSize: 20, color: NAVY, breakLine: true, fontFace: THEME.headFontFace } }, { text: l, options: { fontSize: 12, color: INK } }], { x: x + 0.15, y: 5.85, w: sw - 0.3, h: 0.9, valign: "middle" });
    });
    const rx = 7.65, rw = W - MX - rx;
    const pts = [
      [I.ruler, "6 × 9 см, нэг өнгийн улаан хөвөө", "Нэгжийг өнгөөр бус, зөвхөн тоогоор ялгана"],
      [I.shirt, "Албаны ба эрээн хувилбар", "Албаны: хар хөх, дарааст товч. Эрээн: дижитал бор, бүдэг өнгө, наалт"],
      [I.swap, "Салгадаг, хүлээлцдэг", "ҮБХИС-ийн өмч; семестр бүр дараагийн удирдагчид шилжинэ"],
      [I.layers, "Ротын тэмдэг нэгтгэгдэнэ", "Албан тушаалгүй сонсогч ижил хэлбэрийн ротын тэмдэг зүүнэ"],
      [I.grad, "Курсийн тэмдэг — зүүн ханцуй", "Хөндлөн туузын тоо 1–4 нь курсийг заана"],
    ];
    pts.forEach(([ic, h, b], i) => {
      const y = 1.7 + i * 1.0;
      iconCircle(s, rx, y + 0.05, 0.6, i % 2 ? RED : NAVY, ic, h);
      txt(s, h, { x: rx + 0.8, y, w: rw - 0.8, h: 0.35, fontSize: 15, bold: true, color: NAVY });
      txt(s, b, { x: rx + 0.8, y: y + 0.36, w: rw - 0.8, h: 0.6, fontSize: 13, color: INK, valign: "top" });
    });
  }

  // ================= 12. Awards =================
  {
    const s = content("Ялгах ба шагналын тэмдэг", "ШАГНАЛЫН ТЭМДЭГ", "Шагналын тогтолцоо: зөвхөн 4 тэмдэг",
      "Дөрвөн тэмдэг нь одоо хэрэглэж буй «Шилдэг төгсөгч» медалийн хийцтэй нэгдмэл загвартай. Эхний гурвын оройн тоо нь шагнагдсан удааг заана; дахин шагнагдахад өмнөх тэмдгийг хураан авч, дараагийн тоотойг олгоно. Хөргийг одгүй, ногоон паалантай бүсэд дүрсэлж, Сүхбаатарын одонтой андуурахаас сэргийлсэн.");
    const ih = 5.05, iw = ih * 541 / 743;
    s.addImage({ path: path.join(MEDIA, "image7.png"), x: MX, y: 1.65, w: iw, h: ih, altText: "Шагналын 4 тэмдгийн загвар: Тамирчин сонсогч, Тэргүүний суралцагч, Их жанжин Д.Сүхбаатар, Шилдэг төгсөгч", objectName: "Award badges" });
    const rx = MX + iw + 0.4, rw = W - MX - rx;
    const A = [
      [C.accent6, "«Тамирчин сонсогч»", "хөх", "Бие бялдрын оноо ≥ 90%, биеийн тамир «A»; ҮБХИС, ЗХ-ний тэмцээнд 1–3-р байр", "Жил бүр", "≈150 / жил"],
      [RED, "«Тэргүүний суралцагч»", "улаан", "Семестрийн голч дүн ≥ 3.5, «F» үнэлгээгүй, бүх хичээлээ хугацаандаа өгсөн", "Семестр бүр", "≈400 / жил"],
      [GREEN, "«Их жанжин Д.Сүхбаатар»", "ногоон", "ҮБХИС, Монгол Улсын нэрийг олон улсад гаргасан, эх орныхоо төлөө гавьяа байгуулсан", "Тухай бүр", "≈5–15 / жил"],
      [GOLD, "«Шилдэг төгсөгч» шонхор", "медаль", "«Цэргийн хөгжлийн нэгдсэн дүн»-гээр шалгарсан төгсөгч, ҮБХИС-ийн захирлын шийдвэрээр", "Төгсөлтөөр", "≈1–3 / жил"],
    ];
    const ch = 1.07;
    A.forEach(([c, n, col, crit, freq, qty], i) => {
      const y = 1.65 + i * (ch + 0.13);
      card(s, rx, y, rw, ch, LIGHT, "Award " + (i + 1));
      iconCircle(s, rx + 0.2, y + 0.3, 0.47, c, I.award, n);
      txt(s, [{ text: n, options: { bold: true, color: NAVY, fontSize: 15 } }, { text: "  · " + col, options: { color: SLATE, fontSize: 12 } }], { x: rx + 0.85, y: y + 0.1, w: rw - 2.85, h: 0.35 });
      txt(s, crit, { x: rx + 0.85, y: y + 0.45, w: rw - 2.85, h: 0.58, fontSize: 13, color: INK, valign: "top" });
      txt(s, [{ text: freq, options: { bold: true, color: RED, fontSize: 14, breakLine: true } }, { text: qty, options: { color: INK, fontSize: 13 } }], { x: rx + rw - 1.85, y, w: 1.7, h: ch, align: "right", valign: "middle" });
    });
    txt(s, [{ text: "Журам: ", options: { bold: true, color: RED } }, { text: "баруун энгэрт эрэмбээр зүүнэ · хорооны ёслолын жагсаалаар гардуулж, цахим бүртгэлд оруулна · шийтгэлтэй сонсогч хамрагдахгүй · 5 хоногт давж заалдана", options: { color: INK } }],
      { x: rx, y: 6.42, w: rw, h: 0.4, fontSize: 12, valign: "middle" });
  }

  // ================= 13. Roadmap =================
  pres.addSection({ title: "Хэрэгжүүлэлт" });
  {
    const s = content("Хэрэгжүүлэлт", "НЭГДСЭН ТӨЛӨВЛӨГӨӨ", "Хэрэгжүүлэх үе шат: 2026.11 – 2031",
      "Хоёр саналын хэрэгжүүлэх төлөвлөгөөг нэг хуваарьт нэгтгэв. Сонсогчийн хорооны журам болон ялгах тэмдэг, шагналын тэмдгийн журмыг зэрэг боловсруулж батална. Туршилтыг 2027 оны хавар нэг батальонд хийж, 2027–2028 оны хичээлийн жилээс бүрэн нэвтрүүлнэ.");
    const P = [
      ["2026.11–2027.02", "Бэлтгэл, батлах", ["Ажлын хэсэг байгуулах", "Журмын төсөл, тэмдгийн загварыг хэлэлцүүлэх", "ЗХЖШ, БХЯ-тай зөвшилцөж, захирлын тушаалаар батлах"]],
      ["2027.02–03", "Сургагч, багц", ["Сургагч офицер, ахлагчийг сургах", "Удирдагчдыг шалгаруулж сургах (≈40 цаг)", "1 батальоны тэмдгийн багц хийлгэх"]],
      ["2027.03–06", "Туршилт", ["Нэг батальонд турших", "Эрх хэмжээний матриц, сахилгын оноог турших", "Анхны шагналын тэмдэг олгох"]],
      ["2027.08–2028.06", "Бүрэн нэвтрүүлэх", ["3 батальон, 12 рот бүрдүүлэх", "Нэрэмжит рот, туг, ёслол нэвтрүүлэх", "Бүх сонсогчид тэмдэг олгох"]],
      ["2028.06–2029.06", "Үнэлэх, сайжруулах", ["Шинэ журмаар анхны «Шилдэг төгсөгч»", "Хөндлөнгийн үнэлгээ, сэтгэл ханамжийн судалгаа", "Журмыг шинэчлэх"]],
      ["2031", "Бүрэн мөчлөг", ["Анхны бүрэн 4 жилийн төгсөгчид", "Анги, байгууллагын үнэлгээгээр үр нөлөөг нотлох"]],
    ];
    const colw = CW / 6;
    s.addShape(pres.shapes.LINE, { x: MX + colw / 2, y: 2.55, w: CW - colw, h: 0, line: { color: HEX.slate, width: 2 }, objectName: "Timeline" });
    P.forEach(([d, t, bs], i) => {
      const cx = MX + i * colw + colw / 2, hl = i === 2;
      txt(s, d, { x: cx - colw / 2, y: 1.75, w: colw, h: 0.4, fontSize: 14, bold: true, color: hl ? RED : NAVY, align: "center" });
      s.addShape(pres.shapes.OVAL, { x: cx - 0.16, y: 2.39, w: 0.32, h: 0.32, fill: { color: hl ? RED : NAVY }, line: { color: WHITE, width: 2 }, objectName: "Node " + (i + 1) });
      const x = cx - colw / 2 + 0.07, w = colw - 0.14;
      card(s, x, 2.95, w, 3.6, hl ? TINT.red : LIGHT, "Phase " + (i + 1));
      txt(s, t, { x: x + 0.15, y: 3.05, w: w - 0.3, h: 0.65, fontSize: 15, bold: true, color: hl ? RED : NAVY, valign: "middle" });
      txt(s, bs.map((b, k) => ({ text: b, options: { bullet: { indent: 12 }, breakLine: k < bs.length - 1 } })), { x: x + 0.12, y: 3.75, w: w - 0.24, h: 2.7, fontSize: 14, color: INK, valign: "top", paraSpaceAfter: 8 });
    });
  }

  // ================= 14. Resources, risks, KPIs =================
  {
    const s = content("Хэрэгжүүлэлт", "НӨӨЦ, ЭРСДЭЛ, ҮР ДҮН", "Шаардагдах нөөц, эрсдэл ба үр дүнгийн шалгуур",
      "Хүний нөөцийг одоогийн курсын офицер, ахлагч нарын орон тоог дахин хуваарилах замаар бүрдүүлнэ. Хамгийн өндөр магадлалтай эрсдэл нь офицерууд хуучин хандлагаар «бүгдийг өөрсдөө хийх» явдал. Үр дүнг 2029 он гэхэд дараах шалгуураар үнэлнэ.");
    const cw = (CW - 2 * 0.3) / 3;
    const cols = [[I.users, "Шаардагдах нөөц", NAVY], [I.warn, "Эрсдэл → сааруулах арга", RED], [I.chart, "Үр дүнгийн шалгуур (2029)", NAVY]];
    cols.forEach(([ic, h, c], i) => {
      const x = MX + i * (cw + 0.3);
      card(s, x, 1.7, cw, 5.05, LIGHT, "Column " + (i + 1));
      iconCircle(s, x + 0.25, 1.9, 0.55, c, ic, h);
      txt(s, h, { x: x + 0.95, y: 1.9, w: cw - 1.1, h: 0.55, fontSize: 16, bold: true, color: NAVY, valign: "middle" });
    });
    const x1 = MX + 0.25, w1 = cw - 0.5;
    txt(s, [
      { text: "Хүн: ", options: { bold: true, color: NAVY } }, { text: "захирагч 1, батальоны сургагч 3, ротын сургагч офицер 12, сургагч ахлагч 12, сэтгэл зүйч 1–2 (орон тоог дахин хуваарилна)", options: { breakLine: true } },
      { text: "Тэмдэг: ", options: { bold: true, color: NAVY } }, { text: "719 албаны + 719 эрээн ханцуйн тэмдэг, сонсогч бүрт ротын тэмдэг; шагналын тэмдэг жилд ≈570", options: { breakLine: true } },
      { text: "Эрх зүй: ", options: { bold: true, color: NAVY } }, { text: "хорооны журам, нэр төрийн дүрэм, сахилгын онооны журам, тэмдгийн журам", options: { breakLine: true } },
      { text: "Бусад: ", options: { bold: true, color: NAVY } }, { text: "цахим бүртгэл; ротын өрөө, штаб; туг, ёслол, сургалтын төсөв" },
    ], { x: x1, y: 2.65, w: w1, h: 3.95, fontSize: 14, color: INK, valign: "top", paraSpaceAfter: 10 });
    const x2 = MX + cw + 0.3 + 0.25;
    const R = [["Эрх мэдлийг урвуулах, дээрэлхэл", "Дунд", "Эрх хэмжээний матриц, хориг, нууц суваг, зөрчсөн удирдагчийг шууд чөлөөлөх"],
      ["Офицерууд «бүгдийг өөрсдөө хийх»", "Өндөр", "Сургагчийн үүргийг «зөвлөх, хянагч» гэж журамлах, офицеруудыг сургах"],
      ["Сурлагын ачаалал нэмэгдэх", "Дунд", "Ротаци, голч дүнгийн босго, бие даан суралцах цагийг хамгаалах, кредит"]];
    R.forEach(([r, p, m], i) => {
      const y = 2.65 + i * 1.33;
      txt(s, [{ text: r, options: { bold: true, color: NAVY } }, { text: "  " + p, options: { bold: true, color: p === "Өндөр" ? RED : SLATE, fontSize: 12 } }], { x: x2, y, w: w1, h: 0.55, fontSize: 14, valign: "top" });
      txt(s, "→ " + m, { x: x2, y: y + 0.55, w: w1, h: 0.75, fontSize: 13, color: INK, valign: "top" });
    });
    const x3 = MX + 2 * (cw + 0.3) + 0.25;
    const K = [["≥ 60%", "4-р курс удирдах албан тушаал хашсан"], ["−30%", "сахилгын ноцтой зөрчил"], ["0", "батлагдсан дээрэлхэлтийн гомдол"], ["≥ 75%", "сонсогчийн сэтгэл ханамж"], ["≥ 80%", "төгсөгчийг командлагч «сайн»-аас дээш үнэлэх"]];
    K.forEach(([n, l], i) => {
      const y = 2.65 + i * 0.8;
      txt(s, n, { x: x3, y, w: 1.25, h: 0.7, fontSize: 22, bold: true, color: RED, valign: "middle", fontFace: THEME.headFontFace });
      txt(s, l, { x: x3 + 1.3, y, w: w1 - 1.3, h: 0.7, fontSize: 13, color: INK, valign: "middle" });
    });
  }

  // ================= 15. Decisions =================
  {
    const s = pres.addSlide({ masterName: "CLOSING_DARK", sectionTitle: "Хэрэгжүүлэлт" });
    s.addText("ШИЙДВЭРЛҮҮЛЭХ САНАЛ", { placeholder: "kicker" });
    s.addText("Удирдлагаар шийдвэрлүүлэх 8 санал", { placeholder: "title" });
    s.addNotes("Хоёр саналын дүгнэлтийг нэгтгэсэн 8 санал. 1–5 нь Сонсогчийн хорооны бүтэц, хүмүүжлийн тогтолцоо, 6 нь ялгах ба шагналын тэмдэг, 7–8 нь эрх зүй, хэрэгжүүлэх хугацаа.");
    const D = [
      "«Сонсогчийн хороо»-г 3 батальон, 12 рот бүхий босоо холимог бүтэцтэйгээр байгуулах",
      "4 жилийн манлайллын шат, семестрийн ротацийг нэвтрүүлж, манлайллын үнэлгээг төгсөлтийн эрэмбэ, кредиттэй холбох",
      "Рот бүрт сургагч офицер, сургагч ахлагч томилж, үүргийг «зөвлөх, хянагч» гэж тогтоох",
      "Нэр төрийн зөвлөл бүхий 5 зөвлөл байгуулж, эрх хэмжээний матриц, нууц гомдлын сувгийг ажиллуулах",
      "Ротуудад ҮБХИС-иас төрсөн Монгол Улсын баатруудын нэрийг олгох",
      "Баруун ханцуйн албан тушаалын тэмдэг (албаны, эрээн) ба 4 шагналын тэмдгийн тогтолцоог батлах",
      "Ажлын хэсэг байгуулж, хоёр журмыг ЗХЖШ, БХЯ-тай зөвшилцөн 2027.02 гэхэд захирлын тушаалаар батлах",
      "2027 оны хавар 1 батальонд туршиж, 2027–2028 оны хичээлийн жилээс бүрэн нэвтрүүлэх",
    ];
    const cw = (CW - 0.4) / 2;
    D.forEach((t, i) => {
      const x = MX + Math.floor(i / 4) * (cw + 0.4), y = 1.8 + (i % 4) * 1.2;
      s.addShape(pres.shapes.OVAL, { x, y: y + 0.05, w: 0.55, h: 0.55, fill: { color: GOLD }, line: { color: GOLD, width: 0 }, objectName: "Decision " + (i + 1) });
      txt(s, String(i + 1), { x, y: y + 0.05, w: 0.55, h: 0.55, fontSize: 18, bold: true, color: NAVY, align: "center", valign: "middle" });
      txt(s, t, { x: x + 0.8, y, w: cw - 0.8, h: 1.05, fontSize: 16, color: WHITE, valign: "top" });
    });
  }

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
