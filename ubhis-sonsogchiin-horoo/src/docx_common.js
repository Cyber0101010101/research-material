// Word баримтын нийтлэг туслах функцууд (docx-js)
const fs = require("fs");
const path = require("path");
const {
  Document, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
  AlignmentType, HeadingLevel, WidthType, ShadingType, BorderStyle,
  LevelFormat, PageBreak, Header, Footer, PageNumber, VerticalAlign, ExternalHyperlink,
} = require("docx");

const C = {
  navy: "1B2A41", red: "C8102E", gold: "D4A017", steel: "2E4A7D",
  gray: "5B6472", light: "EEF0F4", pale: "F6E7B4", white: "FFFFFF",
  blueLt: "DCE4F0", redLt: "F8DDE1", greenLt: "E2EFDA",
};
const FONT = "Arial";
const W = 9638; // A4 − 2 × 2 см (DXA)
const PX = 642; // агуулгын өргөн (px)
const IMG = path.join(__dirname, "..", "images");

function runs(text, base = {}) {
  const out = [];
  String(text).split(/(\*\*[^*]+\*\*)/).forEach((part) => {
    if (!part) return;
    if (part.startsWith("**") && part.endsWith("**")) out.push(new TextRun({ ...base, text: part.slice(2, -2), bold: true }));
    else out.push(new TextRun({ ...base, text: part }));
  });
  return out;
}
const P = (text, o = {}) =>
  new Paragraph({
    alignment: o.align || AlignmentType.JUSTIFIED,
    spacing: { after: o.after ?? 120, before: o.before ?? 0, line: 300 },
    children: runs(text, o.run || {}),
  });
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const B = (t, level = 0) =>
  new Paragraph({ numbering: { reference: "bullets", level }, spacing: { after: 60, line: 288 }, children: runs(t) });
const N = (t, ref) => new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 60, line: 288 }, children: runs(t) });
const brk = () => new Paragraph({ children: [new PageBreak()] });
const spacer = (after = 120) => new Paragraph({ spacing: { after }, children: [] });

const thin = { style: BorderStyle.SINGLE, size: 4, color: "A9B1BD" };
const borders = { top: thin, bottom: thin, left: thin, right: thin };
function cell(text, width, o = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders,
    verticalAlign: o.valign || VerticalAlign.TOP,
    shading: o.fill ? { fill: o.fill, type: ShadingType.CLEAR, color: "auto" } : undefined,
    margins: { top: 70, bottom: 70, left: 100, right: 100 },
    children: (Array.isArray(text) ? text : [text]).map(
      (t) =>
        new Paragraph({
          alignment: o.align || AlignmentType.LEFT,
          spacing: { after: 40, line: 264 },
          children: runs(t, { size: 19, bold: o.bold, color: o.color }),
        })
    ),
  });
}
function table(headers, rows, widths, o = {}) {
  const head = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => cell(h, widths[i], { bold: true, color: C.white, fill: C.navy, valign: VerticalAlign.CENTER })),
  });
  const body = rows.map(
    (r, ri) =>
      new TableRow({
        cantSplit: true,
        children: r.map((c, i) =>
          cell(c, widths[i], {
            fill: i === 0 && o.firstColFill ? o.firstColFill : ri % 2 === 1 ? "F7F8FA" : undefined,
            bold: i === 0 && o.firstColBold,
            align: o.center && o.center.includes(i) ? AlignmentType.CENTER : undefined,
          })
        ),
      })
  );
  return new Table({ width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA }, columnWidths: widths, rows: [head, ...body] });
}
const caption = (t) =>
  new Paragraph({ spacing: { before: 160, after: 80 }, keepNext: true, children: [new TextRun({ text: t, bold: true, size: 20, color: C.steel })] });
const note = (t) => new Paragraph({ spacing: { before: 60, after: 160 }, children: runs(t, { size: 17, italics: true, color: C.gray }) });

function box(title, lines, fill = C.blueLt, accent = C.steel) {
  const side = { style: BorderStyle.SINGLE, size: 24, color: accent };
  const none = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  return new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: [W],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: W, type: WidthType.DXA },
            borders: { left: side, top: none, bottom: none, right: none },
            shading: { fill, type: ShadingType.CLEAR, color: "auto" },
            margins: { top: 120, bottom: 120, left: 200, right: 200 },
            children: [
              new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: title, bold: true, color: accent, size: 21 })] }),
              ...lines.map(
                (l) =>
                  new Paragraph({
                    spacing: { after: 60, line: 276 },
                    numbering: l.startsWith("- ") ? { reference: "bullets", level: 0 } : undefined,
                    children: runs(l.replace(/^- /, ""), { size: 20 }),
                  })
              ),
            ],
          }),
        ],
      }),
    ],
  });
}

function figure(name, title, widthPx = PX) {
  const sizes = JSON.parse(fs.readFileSync(path.join(IMG, "sizes.json"), "utf8"));
  const s = sizes[name];
  const w = Math.min(widthPx, PX);
  const h = Math.round((s.height / s.width) * w);
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 40 },
      keepNext: true,
      children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(IMG, `${name}.png`)), transformation: { width: w, height: h } })],
    }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: title, italics: true, size: 18, color: C.gray })] }),
  ];
}
const link = (label, url) =>
  new Paragraph({
    numbering: { reference: "refs", level: 0 },
    spacing: { after: 60, line: 276 },
    children: [
      new TextRun({ text: label + ". ", size: 19 }),
      new ExternalHyperlink({ link: url, children: [new TextRun({ text: url, style: "Hyperlink", size: 17 })] }),
    ],
  });

function makeDoc({ title, headerText, children, numRefs = ["n1", "n2", "n3"] }) {
  return new Document({
    features: { updateFields: true },
    creator: "Судалгааны ажлын хэсэг",
    title,
    styles: {
      default: { document: { run: { font: FONT, size: 22 } } },
      paragraphStyles: [
        {
          id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 30, bold: true, font: FONT, color: C.navy },
          paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 0, keepNext: true, border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: C.red, space: 4 } } },
        },
        {
          id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 25, bold: true, font: FONT, color: C.steel },
          paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1, keepNext: true },
        },
      ],
    },
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [
            { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } },
            { level: 1, format: LevelFormat.BULLET, text: "–", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1080, hanging: 270 } } } },
          ],
        },
        ...numRefs.map((ref) => ({
          reference: ref,
          levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 360 } } } }],
        })),
        {
          reference: "refs",
          levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "[%1]", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 600, hanging: 600 } } } }],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 } },
          titlePage: true,
        },
        headers: {
          default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: headerText, size: 16, color: C.gray })] })] }),
          first: new Header({ children: [new Paragraph({ children: [] })] }),
        },
        footers: {
          default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: C.gray })] })] }),
          first: new Footer({ children: [new Paragraph({ children: [] })] }),
        },
        children,
      },
    ],
  });
}

module.exports = { C, W, PX, runs, P, H1, H2, B, N, brk, spacer, cell, table, caption, note, box, figure, link, makeDoc };
