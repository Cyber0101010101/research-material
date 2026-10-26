// "Тоон ул мөрийн шинжилгээ" хөтөлбөрийн загвартай ижил хэв маяг:
// A4, Arial 12, захын зай: дээд 1134, баруун 851, доод 1134, зүүн 1701 (DXA)
const d = require("docx");
const {
  Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle,
  ShadingType, VerticalAlign, PageBreak, LevelFormat, Footer, PageNumber, HeadingLevel,
} = d;

const FONT = "Arial";
const PAGE = { size: { width: 11906, height: 16838 }, margin: { top: 1134, right: 851, bottom: 1134, left: 1701 } };
const CONTENT_W = 11906 - 1701 - 851; // 9354
const SHADE = "D9E8E4";

const numbering = {
  config: [
    { reference: "bul", levels: [
      { level: 0, format: LevelFormat.BULLET, text: "-", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 567, hanging: 283 } } } },
      { level: 1, format: LevelFormat.BULLET, text: "◦", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1134, hanging: 283 } } } },
    ] },
    { reference: "num", levels: [
      { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 567, hanging: 340 } } } },
    ] },
  ],
};

const styles = {
  default: { document: { run: { font: FONT, size: 24 }, paragraph: { spacing: { after: 60, line: 276, lineRule: d.LineRuleType.AUTO } } } },
  paragraphStyles: [
    { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { font: FONT, size: 24, bold: true }, paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 } },
    { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { font: FONT, size: 24, bold: true }, paragraph: { spacing: { before: 180, after: 100 }, outlineLevel: 1 } },
    { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { font: FONT, size: 24, bold: true, italics: true }, paragraph: { spacing: { before: 120, after: 80 }, outlineLevel: 2 } },
  ],
};

// runs: string | [{text,bold,italics}]
function runs(t, base = {}) {
  if (typeof t === "string") return [new TextRun({ text: t, ...base })];
  return t.map((r) => (typeof r === "string" ? new TextRun({ text: r, ...base }) : new TextRun({ ...base, ...r })));
}
const P = (t, o = {}) => new Paragraph({ alignment: o.align || AlignmentType.JUSTIFIED, spacing: o.spacing, indent: o.indent, keepNext: o.keepNext, children: runs(t, o.run || {}) });
const C = (t, o = {}) => P(t, { ...o, align: AlignmentType.CENTER });
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, keepNext: true, children: runs(t) });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, keepNext: true, children: runs(t) });
const H3 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_3, keepNext: true, children: runs(t) });
const B = (t, level = 0) => new Paragraph({ numbering: { reference: "bul", level }, alignment: AlignmentType.LEFT, children: runs(t) });
const N = (t, ref = "num") => new Paragraph({ numbering: { reference: ref, level: 0 }, alignment: AlignmentType.LEFT, children: runs(t) });
const BR = () => new Paragraph({ children: [new PageBreak()] });
const SP = (after = 120) => new Paragraph({ spacing: { after }, children: [] });

const border = { style: BorderStyle.SINGLE, size: 4, color: "000000" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

// cell content: string | string[] (multi-paragraph; "- " prefix → bullet) | Paragraph[]
function cellParas(v, o) {
  const arr = Array.isArray(v) ? v : [v];
  return arr.map((x) => {
    if (x instanceof Paragraph) return x;
    const s = String(x);
    if (s.startsWith("- ")) return new Paragraph({ numbering: { reference: "bul", level: 0 }, spacing: { after: 20 }, children: runs(s.slice(2), { size: o.size || 22 }) });
    return new Paragraph({ alignment: o.align || AlignmentType.LEFT, spacing: { after: 20 }, children: runs(s, { size: o.size || 22, bold: o.bold }) });
  });
}

/**
 * table(widths, rows, opts)
 * rows: array of arrays; a cell may be {v, span, bold, shade, align}
 * opts.header: first row is header (shaded, bold, centered)
 */
function table(widths, rows, opts = {}) {
  const total = widths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: widths,
    rows: rows.map((r, ri) => {
      let col = 0;
      const isHead = opts.header && ri === 0;
      return new TableRow({
        tableHeader: isHead,
        cantSplit: opts.cantSplit !== false,
        children: r.map((c) => {
          const cell = c !== null && typeof c === "object" && !Array.isArray(c) && !(c instanceof Paragraph) ? c : { v: c };
          const span = cell.span || 1;
          if (cell.colStart !== undefined) col = cell.colStart;
          const w = widths.slice(col, col + span).reduce((a, b) => a + b, 0);
          col += span;
          const shade = cell.shade || (isHead ? SHADE : null);
          return new TableCell({
            columnSpan: span > 1 ? span : undefined,
            rowSpan: cell.rowSpan,
            width: { size: w, type: WidthType.DXA },
            borders: opts.noBorders ? noBorders : borders,
            verticalAlign: cell.valign || VerticalAlign.CENTER,
            shading: shade ? { fill: shade, type: ShadingType.CLEAR, color: "auto" } : undefined,
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
            children: cellParas(cell.v, { size: opts.size || 22, bold: cell.bold || isHead, align: cell.align || (isHead ? AlignmentType.CENTER : opts.align) }),
          });
        }),
      });
    }),
  });
}

const footer = () => ({
  default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], size: 20 })] })] }),
});

module.exports = { d, P, C, H1, H2, H3, B, N, BR, SP, table, runs, PAGE, CONTENT_W, numbering, styles, footer, noBorders, AlignmentType };
