"""Лекцийн хичээлийг удирдах төлөвлөгөөний загвар (docx)-ыг CSBC101-ийн 8 лекцээр бөглөнө.

Ашиглах: python3 -I fill_lecture_plans.py <template.docx> <plans.json> <out_dir>
Загварын формат (хүснэгт, нүд нэгтгэл, фонт)-ыг өөрчлөхгүй, зөвхөн текстийг солино.
"""
import copy, json, os, re, sys, zipfile
from lxml import etree

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
W14 = "http://schemas.microsoft.com/office/word/2010/wordml"
q = lambda t: "{%s}%s" % (W, t)

TPL, PLANS, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
plans = json.load(open(PLANS, encoding="utf-8"))
PRACTICE_TITLES = [
    "Лабораторийн орчинтой танилцах ба хувийн кибер аюулгүй байдал",
    "Аюул заналыг таних: фишинг ба нууц үгийн аюулгүй байдал",
    "Мэргэших чиглэлүүдийг турших: станцын дадлага",
    "Хөтөлбөрийн зураглал: хичээл, чадамж, карьерын уялдаа",
    "Суралцах хэрэгслээ бүрдүүлэх: виртуал машин, Linux, Git",
    "Хууль, ёс зүйн кейс шинжилгээ ба ангийн ёс зүйн гэрээ",
    "Ажлын зар шинжлэх ба карьерын зураглал боловсруулах",
    "Анхан шатны CTF ба хувийн хөгжлийн төлөвлөгөө хамгаалах",
]

with zipfile.ZipFile(TPL) as z:
    parts = {n: z.read(n) for n in z.namelist()}
doc_xml = parts["word/document.xml"]


def is_bold(r):
    rp = r.find(q("rPr"))
    return rp is not None and rp.find(q("b")) is not None


def set_par(p, segs, fallback=None):
    """p доторх run-уудыг segs=[(text, bold)]-ээр солино; загварын rPr-ийг хадгална."""
    runs = p.findall(q("r")) or ([fallback] if fallback is not None else [])
    bold_rpr = next((copy.deepcopy(r.find(q("rPr"))) for r in runs if is_bold(r) and r.find(q("rPr")) is not None), None)
    norm_rpr = next((copy.deepcopy(r.find(q("rPr"))) for r in runs if not is_bold(r) and r.find(q("rPr")) is not None), None)
    any_rpr = copy.deepcopy(runs[0].find(q("rPr"))) if runs and runs[0].find(q("rPr")) is not None else None
    if norm_rpr is None and any_rpr is not None:
        norm_rpr = copy.deepcopy(any_rpr)
        for tag in ("b", "bCs"):
            e = norm_rpr.find(q(tag))
            if e is not None:
                norm_rpr.remove(e)
    if bold_rpr is None:
        bold_rpr = copy.deepcopy(norm_rpr) if norm_rpr is not None else etree.Element(q("rPr"))
        if bold_rpr.find(q("b")) is None:
            bold_rpr.insert(0, etree.Element(q("b")))
    for ch in list(p):
        if ch.tag != q("pPr"):
            p.remove(ch)
    for text, bold in segs:
        r = etree.SubElement(p, q("r"))
        rp = bold_rpr if bold else norm_rpr
        if rp is not None:
            r.append(copy.deepcopy(rp))
        t = etree.SubElement(r, q("t"))
        t.text = text
        t.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")


def set_cell(tc, segs, fallback=None):
    ps = tc.findall(q("p"))
    set_par(ps[0], segs if isinstance(segs, list) else [(segs, False)], fallback)
    for extra in ps[1:]:
        tc.remove(extra)


def shorten(d):
    """Тайлбарын эхний хэсгийг (хаалтан доторхыг хасаж) авна."""
    return re.sub(r"\s*\([^)]*\)", "", d.split(";")[0]).strip()


def cells(tbl, ri):
    return tbl.findall(q("tr"))[ri].findall(q("tc"))


def build_plan(P):
    root = etree.fromstring(doc_xml)
    body = root.find(q("body"))
    els = list(body)
    n = P["num"]
    # Толгой хэсэг
    set_par(els[3], [("2026 оны …… дугаар сарын …… -ны өдөр", False)])
    set_par(els[5], [("“МЭРГЭЖЛИЙН УДИРТГАЛ”", True)])
    # Зорилго, үр дүн
    t6 = els[6]
    set_cell(cells(t6, 0)[0], [("Хичээлийн зорилго:  ", True), (P["goal"], False)])
    outs = "; ".join("%d) %s" % (i + 1, o) for i, o in enumerate(P["outcomes"])) + "."
    set_cell(cells(t6, 1)[0], [("Хичээлийн төгсгөлд хүрэх үр дүн:  ", True), (outs, False)])
    # Зохион байгуулалт
    t8 = els[8]
    set_cell(cells(t8, 0)[2], [("Сэдэв %d Хичээл 1" % n, True)])
    set_cell(cells(t8, 1)[2], "Х%d. %s" % (n, P["title"]))
    for k in range(3):
        iss = P["issues"][k]
        set_cell(cells(t8, 2 + k)[-1], "%s — %s" % (iss["h"], shorten(iss["d"])))
    set_cell(cells(t8, 5)[2], "2026 оны …… сарын ……, …… гараг")
    set_cell(cells(t8, 6)[2], "90 минут")
    set_cell(cells(t8, 7)[2], "ЦНС-ийн КАБТ-ийн I дамжаа")
    set_cell(cells(t8, 8)[2], "…… сонсогч")
    set_cell(cells(t8, 9)[2], "Кибер аюулгүй байдлын тэнхимийн 100 тоот")
    set_cell(cells(t8, 10)[2], P["summary"])
    set_cell(cells(t8, 11)[2], P["refs"])
    set_cell(cells(t8, 12)[2], "Проектор, компьютер, PowerPoint үзүүлэн (CSBC101_Lekts_%02d), самбар, маркер, наалт цаас." % n)
    fb = copy.deepcopy(cells(t8, 12)[2].find(q("p")).find(q("r")))
    set_cell(cells(t8, 13)[2], fallback=fb, segs="Лекц нь Дадлага %d «%s»-тай уялдана. Лекцийн дараах бие даалт 6 цаг." % (n, PRACTICE_TITLES[n - 1]))
    # Дэлгэрэнгүй төлөвлөлт
    t10 = els[10]
    def row(ri, minutes, issue, method, assess):
        cs = cells(t10, ri)
        off = len(cs) - 5  # vMerge-тэй мөрөнд эхний нүд «Хэсэг»
        set_cell(cs[off + 0], str(minutes))
        set_cell(cs[off + 1], issue)
        set_cell(cs[off + 2], method)
        set_cell(cs[off + 3], assess)
    o = P["open1"]
    row(1, 10, o["t"], o["m"], o["a"])
    row(2, 5, "Хичээлийн зорилго, төгсгөлд хүрэх үр дүн, үнэлгээний журамтай танилцуулах", "Ярилцах арга", "Оношлох үнэлгээ")
    for k in range(3):
        iss = P["issues"][k]
        row(3 + k, iss["min"], iss["h"], iss["method"], iss["assess"])
    c = P["close1"]
    row(6, 10, c["t"], c["m"], c["a"])
    row(7, 5, "Гэрийн даалгавар өгөх", "Даалгавар танилцуулах", "Даалгаврыг ойлгосон эсэхийг асуулт-хариултаар шалгах")
    assert 10 + 5 + sum(i["min"] for i in P["issues"]) + 10 + 5 == 90, n
    # Гэрийн даалгавар, төлөвлөсөн
    set_par(els[11], [("Гэрийн даалгавар: " + P["homework"], False)])
    set_par(els[13], [("КИБЕР АЮУЛГҮЙ БАЙДЛЫН ТЭНХИМИЙН АХЛАХ БАГШ", False)])
    set_par(els[14], [("ДЭСЛЭГЧ" + " " * 41 + "Ч.ЭНХБААТАР", False)])
    # paraId давхардлаас сэргийлэх
    for e in root.iter():
        for a in ("{%s}paraId" % W14, "{%s}textId" % W14):
            if a in e.attrib:
                del e.attrib[a]
    return root


def write(root, path):
    data = etree.tostring(root, xml_declaration=True, encoding="UTF-8", standalone=True)
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as z:
        for name, blob in parts.items():
            z.writestr(name, data if name == "word/document.xml" else blob)


os.makedirs(OUT, exist_ok=True)
roots = []
for P in plans:
    r = build_plan(P)
    roots.append(r)
    write(r, os.path.join(OUT, "CSBC101_Lekts_%02d_udirdah_tuluvluguu.docx" % P["num"]))

# Нэгтгэсэн файл: 8 төлөвлөгөө, тус бүр шинэ хуудсаас
combined = copy.deepcopy(roots[0])
cbody = combined.find(q("body"))
sect = cbody.find(q("sectPr"))
def strip_trailing_empty(body):
    """sectPr-ийн өмнөх хоосон параграфуудыг хасна (илүү хоосон хуудаснаас сэргийлнэ)."""
    kids = [e for e in body if e.tag != q("sectPr")]
    while kids and kids[-1].tag == q("p") and not "".join(kids[-1].itertext()).strip():
        body.remove(kids.pop())


strip_trailing_empty(cbody)
for r in roots[1:]:
    els = [copy.deepcopy(e) for e in r.find(q("body")) if e.tag != q("sectPr")]
    while els and els[-1].tag == q("p") and not "".join(els[-1].itertext()).strip():
        els.pop()
    ppr = els[0].find(q("pPr"))
    if ppr is None:
        ppr = etree.Element(q("pPr"))
        els[0].insert(0, ppr)
    ppr.insert(0, etree.Element(q("pageBreakBefore")))
    for el in els:
        sect.addprevious(el)
write(combined, os.path.join(OUT, "CSBC101_Lektsiin_udirdah_tuluvluguu_NIIT.docx"))
print("ok", len(roots))
