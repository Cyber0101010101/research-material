"""Trim the four supplied badge images and lay them out in one figure with captions."""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont
d = sys.argv[1]
items = [
    ('src_4.png', '1. «Тамирчин сонсогч» тэмдэг', 'хөх паалан · гүйж буй тамирчин'),
    ('src_6.png', '2. «Тэргүүний суралцагч» тэмдэг', 'улаан паалан · ном, үзэг'),
    ('src_7.png', '3. «Их жанжин Д.Сүхбаатар» тэмдэг', 'ногоон паалан · Д.Сүхбаатарын хөрөг'),
    ('src_5.png', '4. «Шилдэг төгсөгч» шонхор тэмдэг', 'одоогийн медаль · шонхортой өлгүүр'),
]
def trim(im):
    a = np.asarray(im.convert('L')).astype(int)
    ys, xs = np.where(a < 236)
    return im.crop((max(xs.min() - 10, 0), max(ys.min() - 10, 0), min(xs.max() + 10, im.width), min(ys.max() + 10, im.height)))
ims = [trim(Image.open(f'{d}/{f}').convert('RGB')) for f, _, _ in items]
for (f, _, _), im in zip(items, ims):
    im.save(f'{d}/{f.replace("src_", "badge_")}')
CW, IH = 900, 980
W, H = CW * 2 + 60, 150 + 2 * (IH + 150)
sheet = Image.new('RGB', (W, H), 'white')
dr = ImageDraw.Draw(sheet)
FB = ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf', 54)
F = ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf', 36)
FT = ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf', 36)
FL = ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf', 42)
dr.text((W / 2, 52), 'Шагналын тэмдэг', font=FB, fill='#1c2740', anchor='mm')
dr.text((W / 2, 110), '1–3-р тэмдгийн оройн тоо — сонсогч суралцах хугацаандаа тухайн тэмдгээр шагнагдсан удаа', font=FT, fill='#55607a', anchor='mm')
for i, (im, (_, t, sub)) in enumerate(zip(ims, items)):
    r, c = divmod(i, 2)
    k = min((CW - 60) / im.width, IH / im.height)
    j = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    x0 = 30 + c * CW; y0 = 150 + r * (IH + 150)
    sheet.paste(j, (x0 + (CW - j.width) // 2, y0 + IH - j.height))
    cx = x0 + CW / 2
    dr.text((cx, y0 + IH + 52), t, font=FL, fill='#1c2740', anchor='mm')
    dr.text((cx, y0 + IH + 104), sub, font=F, fill='#55607a', anchor='mm')
sheet.save(f'{d}/awards_final.png')
print(sheet.size)
