// Sheet with the four award badges (same medal body; falcon hanger only on the best-graduate medal).
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const D = process.argv[2];
const FONT = "'Liberation Sans', Arial, sans-serif", INK = '#1c2740';
const img = (f) => 'data:image/png;base64,' + fs.readFileSync(path.join(D, f)).toString('base64');
const items = [
  ['gold_1_tamirchin.png', '1. Тэргүүний тамирчин тэмдэг', 'гүйж буй тамирчин — тэсвэр, хурд, ялалт'],
  ['gold_2_suraltsagch.png', '2. Тэргүүний суралцагч тэмдэг', 'мэдлэгийн зул, нээлттэй ном — эрдэм'],
  ['gold_3_sukhbaatar.png', '3. Жанжин Сүхбаатарын хүндэт тэмдэг', 'Жанжин Д.Сүхбаатарын хөрөг — эх оронч үзэл'],
  ['award_4_shildeg_tugsugch.png', '4. Шилдэг төгсөгч шонхор тэмдэг', 'одоогийн медаль — хэвээр'],
];
const w = 2400, h = 1150, base = 860, bw = 520;
let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs><filter id="drop" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="4" dy="7" stdDeviation="7" flood-color="#000" flood-opacity="0.28"/></filter></defs>
  <rect width="${w}" height="${h}" fill="#fff"/>
  <text x="${w / 2}" y="62" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="44" fill="${INK}">Шагналын тэмдэг</text>
  <text x="${w / 2}" y="108" text-anchor="middle" font-family="${FONT}" font-size="27" fill="#55607a">ҮБХИС-ийн энгэрийн тэмдгийн хийцээр, алтлаг өнгөтэй — ялгаа нь зөвхөн голын бэлгэдэл ба улаан туузан дээрх нэр</text>`;
items.forEach(([f, t, sub], i) => {
  const cx = 300 + i * 600;
  const sz = JSON.parse(require('child_process').execSync(`python3 -I -c "from PIL import Image;i=Image.open('${path.join(D, f)}');print([i.width,i.height])"`).toString());
  const bwi = i === 3 ? bw * 0.74 : bw;
  const ih = bwi * sz[1] / sz[0];
  s += `<image href="${img(f)}" x="${cx - bwi / 2}" y="${base - 20 - ih}" width="${bwi}" height="${ih}" filter="url(#drop)"/>`;
  s += `<text x="${cx}" y="${base + 62}" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="29" fill="${INK}">${t}</text>`;
  s += `<text x="${cx}" y="${base + 100}" text-anchor="middle" font-family="${FONT}" font-size="24" fill="#55607a">${sub}</text>`;
});
s += `<rect x="60" y="${h - 120}" width="${w - 120}" height="96" rx="14" fill="#f4f6fa" stroke="#d5dae4"/>
  <text x="100" y="${h - 80}" font-family="${FONT}" font-size="25" fill="${INK}"><tspan font-weight="700">Нэгдсэн хийц:</tspan> хадаастай дугуй бамбай, «1921», сүлд навч, загалмайлсан сэлэм, нээлттэй ном, улаан паалантай нэрийн тууз, оройд «ҮБХИС». Алтлаг өнгийн цутгамал металл.</text>
  <text x="100" y="${h - 44}" font-family="${FONT}" font-size="25" fill="${INK}">Шонхортой өлгүүр зөвхөн хамгийн дээд шагнал болох Шилдэг төгсөгч шонхор тэмдэгт байна; бусад нь ар талдаа зүүлттэй энгэрийн тэмдэг.</text></svg>`;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.setViewportSize({ width: w, height: h });
  await p.setContent(`<html><body style="margin:0">${s}</body></html>`);
  await p.locator('svg').screenshot({ path: path.join(D, 'awards_sheet_gold.png') });
  await b.close(); console.log('sheet ok');
})();
