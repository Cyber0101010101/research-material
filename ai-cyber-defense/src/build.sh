#!/usr/bin/env bash
# Судалгааны материалыг Markdown эхээс DOCX, PDF болгон бүтээх скрипт.
# Шаардлага: pandoc, python3 + python-docx, poppler-utils (pdftotext), libreoffice.
set -euo pipefail
DIR="$(cd "$(dirname "$0")/.." && pwd)"
NAME="kiber_haldlagyn_ued_AI_ashiglah_bolomj"
SRC="$DIR/$NAME.md"
OUT="$DIR/$NAME.docx"
PDF="$DIR/$NAME.pdf"

build_docx() {  # $1 = гарчгийн хуудасны дугаарын JSON (байхгүй бол хоосон)
  pandoc "$SRC" -f markdown+raw_tex -t docx -o "$OUT" --lua-filter "$DIR/src/pagebreak.lua"
  python3 "$DIR/src/style_docx.py" "$OUT" "${1:-}"
  soffice --headless --convert-to pdf --outdir "$DIR" "$OUT" >/dev/null 2>&1
}

# 1-р давталт: дугааргүй гарчиг; 2-р давталт: гарчгийн хуудасны тоо тогтворжино;
# 3-р давталт: 2-р давталтын PDF-ээс авсан зөв дугаартай гарчиг.
TOC="$DIR/src/.toc_pages.json"
build_docx ""
python3 "$DIR/src/toc_pages.py" "$PDF" "$SRC" > "$TOC"
build_docx "$TOC"
python3 "$DIR/src/toc_pages.py" "$PDF" "$SRC" > "$TOC"
build_docx "$TOC"
rm -f "$TOC"
echo "Built: $OUT, $PDF ($(pdfinfo "$PDF" | awk '/Pages/{print $2}') хуудас)"
