#!/usr/bin/env bash
# CSBC101 — 8 лекцийн SCORM 1.2 багцыг (.zip) үүсгэнэ.
# Ашиглах: bash build_all.sh <гаралтын хавтас>  (анхдагч: ./dist)
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
OUT="$(cd "$(dirname "${1:-$HERE/dist}")" 2>/dev/null && pwd)/$(basename "${1:-$HERE/dist}")"; [ -z "$OUT" ] && OUT="$HERE/dist"
mkdir -p "$OUT"
rm -f "$OUT"/*.zip 2>/dev/null || true

for n in 1 2 3 4 5 6 7 8; do
  LESSON="$HERE/content/lesson${n}.js"
  [ -f "$LESSON" ] || { echo "АЛГА: $LESSON"; continue; }
  TMP="$(mktemp -d)"
  node "$HERE/build_scorm.js" "$LESSON" "$TMP" >/dev/null
  ZIP="$OUT/CSBC101_Lekts_$(printf '%02d' "$n")_SCORM.zip"
  ( cd "$TMP" && zip -q -X -r "$ZIP" . )
  rm -rf "$TMP"
  echo "✓ $(basename "$ZIP")"
done
echo "Бэлэн: $OUT"
ls -la "$OUT"/*.zip
