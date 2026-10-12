"""pandoc-оор үүсгэсэн DOCX-ийн фонт, хүснэгт, хуудасны тохиргоог засах."""
import sys
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

path = sys.argv[1]
toc_json = sys.argv[2] if len(sys.argv) > 2 and sys.argv[2] else None
doc = Document(path)

BODY_FONT = "Arial"
NAVY = RGBColor(0x1B, 0x2A, 0x41)
RED = RGBColor(0xC8, 0x10, 0x2E)

# Хуудасны хэмжээ, захын зай (A4)
for s in doc.sections:
    s.page_width, s.page_height = Cm(21), Cm(29.7)
    s.left_margin = s.right_margin = Cm(2.5)
    s.top_margin = s.bottom_margin = Cm(2.0)
    # Хөлийн хуудасны дугаар
    footer_p = s.footer.paragraphs[0] if s.footer.paragraphs else s.footer.add_paragraph()
    footer_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = footer_p.add_run()
    for tag, text in (("begin", None), (None, "PAGE"), ("end", None)):
        if tag:
            fc = OxmlElement("w:fldChar"); fc.set(qn("w:fldCharType"), tag); run._r.append(fc)
        else:
            it = OxmlElement("w:instrText"); it.set(qn("xml:space"), "preserve"); it.text = text; run._r.append(it)
    run.font.size = Pt(9); run.font.name = BODY_FONT

def set_font(run, size=None, bold=None, color=None):
    run.font.name = BODY_FONT
    rpr = run._r.get_or_add_rPr()
    rfonts = rpr.find(qn("w:rFonts"))
    if rfonts is None:
        rfonts = OxmlElement("w:rFonts"); rpr.append(rfonts)
    for a in ("w:ascii", "w:hAnsi", "w:cs", "w:eastAsia"):
        rfonts.set(qn(a), BODY_FONT)
    if size: run.font.size = Pt(size)
    if bold is not None: run.font.bold = bold
    if color is not None: run.font.color.rgb = color

# Стилүүд
styles = doc.styles
sizes = {"Normal": 11, "Body Text": 11, "First Paragraph": 11, "Compact": 10,
         "Title": 20, "Subtitle": 13, "Author": 12, "Date": 11,
         "Heading 1": 15, "Heading 2": 13, "Heading 3": 12, "TOC Heading": 14}
for name, size in sizes.items():
    try:
        st = styles[name]
    except KeyError:
        continue
    st.font.name = BODY_FONT
    st.font.size = Pt(size)
    rpr = st.element.get_or_add_rPr()
    rfonts = rpr.find(qn("w:rFonts"))
    if rfonts is None:
        rfonts = OxmlElement("w:rFonts"); rpr.append(rfonts)
    for a in ("w:ascii", "w:hAnsi", "w:cs", "w:eastAsia"):
        rfonts.set(qn(a), BODY_FONT)
    if name.startswith("Heading") or name in ("Title", "TOC Heading"):
        st.font.bold = True
        st.font.color.rgb = NAVY if name != "Title" else RED
    if name in ("Title", "Subtitle", "Author", "Date"):
        st.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    if name in ("Body Text", "First Paragraph", "Normal"):
        st.paragraph_format.space_after = Pt(6)
        st.paragraph_format.line_spacing = 1.15
    if name == "Heading 1":
        st.paragraph_format.space_before = Pt(18)
    st.paragraph_format.alignment = st.paragraph_format.alignment

# Бүх run-д фонт тулгах
for p in doc.paragraphs:
    for r in p.runs:
        set_font(r)

# Хүснэгт: хүрээ, толгойн мөр, фонт
def set_cell_shading(cell, hex_fill):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear"); shd.set(qn("w:color"), "auto"); shd.set(qn("w:fill"), hex_fill)
    tcPr.append(shd)

def set_table_borders(table):
    tbl = table._tbl
    tblPr = tbl.tblPr
    borders = OxmlElement("w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        el = OxmlElement(f"w:{edge}")
        el.set(qn("w:val"), "single"); el.set(qn("w:sz"), "4")
        el.set(qn("w:space"), "0"); el.set(qn("w:color"), "9AA3B0")
        borders.append(el)
    tblPr.append(borders)

for t in doc.tables:
    set_table_borders(t)
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, row in enumerate(t.rows):
        for cell in row.cells:
            for p in cell.paragraphs:
                p.paragraph_format.space_after = Pt(2)
                p.paragraph_format.line_spacing = 1.0
                for r in p.runs:
                    set_font(r, size=9.5, bold=True if i == 0 else None,
                             color=RGBColor(0xFF, 0xFF, 0xFF) if i == 0 else None)
            if i == 0:
                set_cell_shading(cell, "1B2A41")
        # Толгойн мөрийг хуудас бүрд давтах
        if i == 0:
            trPr = row._tr.get_or_add_trPr()
            th = OxmlElement("w:tblHeader"); th.set(qn("w:val"), "true"); trPr.append(th)

# Гарчиг (статик, хуудасны дугаартай): Date мөрийн дараа оруулна
import json, copy
entries = json.load(open(toc_json, encoding="utf-8")) if toc_json else []
if entries:
    from docx.text.paragraph import Paragraph
    from docx.enum.text import WD_BREAK
    anchor_el = doc.tables[0]._tbl  # нүүр хуудасны мэдээллийн хүснэгтийн дараа
    if anchor_el is not None:
        def insert_after(el, text="", style=None):
            new_p = OxmlElement("w:p")
            el.addnext(new_p)
            np_ = Paragraph(new_p, doc._body)
            if style:
                st = next((x for x in doc.styles if x.name.lower() == style.lower()), None)
                if st is not None: np_.style = st
            if text: np_.add_run(text)
            return np_
        last = insert_after(anchor_el)
        last.add_run().add_break(WD_BREAK.PAGE)
        last = last._p
        last = insert_after(last, "ГАРЧИГ", "Heading 1")
        last.paragraph_format.page_break_before = False
        last = last._p
        usable = doc.sections[0].page_width - doc.sections[0].left_margin - doc.sections[0].right_margin
        for e in entries:
            if e["title"].upper().startswith("ГАРЧИГ"):
                continue
            lvl = e["level"]
            par = insert_after(last)
            pf = par.paragraph_format
            pf.left_indent = Cm(0 if lvl == 1 else 0.8)
            pf.space_after = Pt(2 if lvl == 2 else 4)
            pf.space_before = Pt(6 if lvl == 1 else 0)
            # Баруун талд цэгэн tab
            tabs = OxmlElement("w:tabs"); tab = OxmlElement("w:tab")
            tab.set(qn("w:val"), "right"); tab.set(qn("w:leader"), "dot"); tab.set(qn("w:pos"), str(int(usable / 635)))
            tabs.append(tab); par._p.get_or_add_pPr().append(tabs)
            r = par.add_run(e["title"]); set_font(r, size=11 if lvl == 1 else 10, bold=(lvl == 1), color=NAVY if lvl == 1 else None)
            r2 = par.add_run("\t" + (str(e["page"]) if e["page"] else "")); set_font(r2, size=10)
            last = par._p
        # Markdown эх дэх \\newpage таслалт гарчгийн дараа хэвээр үлдэнэ

doc.save(path)
print("styled", path)
