# Vista previa de sprites de gemini_sprites2.json (x6) sobre fondo gris
import json, sys
from PIL import Image, ImageDraw
R = json.load(open('/home/claude/escalada/tools/gemini_sprites2.json'))
keys = sys.argv[1].split(',')
S = 6; pad = 8
ims = []
for k in keys:
    sp = R['spr'][k]; pal = R['pal'][sp['p']]; rows = [''.join(r) for r in sp['r']]
    w, h = len(rows[0]), len(rows)
    im = Image.new('RGB', (w * S, h * S), (70, 70, 80)); d = ImageDraw.Draw(im)
    for y, r in enumerate(rows):
        for x, c in enumerate(r):
            if c != '.': d.rectangle([x * S, y * S, x * S + S - 1, y * S + S - 1], fill=pal[c])
    ims.append(im)
W = sum(i.width for i in ims) + pad * (len(ims) + 1); H = max(i.height for i in ims) + 2 * pad
out = Image.new('RGB', (W, H), (40, 40, 48)); x = pad
for i in ims: out.paste(i, (x, pad)); x += i.width + pad
out.save(sys.argv[2]); print(out.size)
