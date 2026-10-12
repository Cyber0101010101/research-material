#!/usr/bin/env bash
# Судалгааны материал, илтгэлийн үг (DOCX, PDF) болон илтгэлийн слайд (PPTX) бүтээх скрипт.
# Шаардлага: pandoc, python3 + python-docx, poppler-utils, libreoffice;
# PPTX-д: node + pptxgenjs, react, react-dom, react-icons, sharp (NODE_PATH) ба SKILL_DIR (pptx skill-ийн хавтас).
set -euo pipefail
DIR="$(cd "$(dirname "$0")/.." && pwd)"
TOC="$DIR/src/.toc_pages.json"

build_docx() {  # $1 = md нэр (өргөтгөлгүй), $2 = гарчгийн JSON (хоосон бол гарчиггүй)
  pandoc "$DIR/$1.md" -f markdown+raw_tex -t docx -o "$DIR/$1.docx" --lua-filter "$DIR/src/pagebreak.lua"
  python3 "$DIR/src/style_docx.py" "$DIR/$1.docx" "${2:-}"
  soffice --headless --convert-to pdf --outdir "$DIR" "$DIR/$1.docx" >/dev/null 2>&1
}

# 1. Судалгааны материал: гарчгийн хуудасны дугаарыг гурван давталтаар тогтооно
R="kiber_haldlagyn_ued_AI_ashiglah_bolomj"
build_docx "$R" ""
python3 "$DIR/src/toc_pages.py" "$DIR/$R.pdf" "$DIR/$R.md" > "$TOC"
build_docx "$R" "$TOC"
python3 "$DIR/src/toc_pages.py" "$DIR/$R.pdf" "$DIR/$R.md" > "$TOC"
build_docx "$R" "$TOC"
rm -f "$TOC"
echo "Built: $R.docx / .pdf ($(pdfinfo "$DIR/$R.pdf" | awk '/Pages/{print $2}') хуудас)"

# 2. Илтгэлийн үг (гарчиггүй)
U="kiber_haldlagyn_ued_AI_iltgeliin_ug"
BODY_PT=13 LINE_SP=1.4 build_docx "$U" ""
echo "Built: $U.docx / .pdf ($(pdfinfo "$DIR/$U.pdf" | awk '/Pages/{print $2}') хуудас)"

# 3. Илтгэлийн слайд
if [ -n "${SKILL_DIR:-}" ]; then
  node "$DIR/src/build_pptx.js" "$DIR/kiber_haldlagyn_ued_AI_iltgel.pptx"
else
  echo "SKILL_DIR тодорхойлогдоогүй тул PPTX-ийг алгаслаа (SKILL_DIR=<pptx skill dir> NODE_PATH=<node_modules> bash src/build.sh)"
fi
