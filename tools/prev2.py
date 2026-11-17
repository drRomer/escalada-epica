import json, sys
from PIL import Image
R = json.load(open('/home/claude/escalada/tools/gemini_sprites2.json'))
keys = sys.argv[2:] if len(sys.argv) > 2 else list(R['spr'])
sc = 3
ims = []
for k in keys:
    s = R['spr'][k]; pal = R['pal'][s['p']]
    h, w = len(s['r']), len(s['r'][0])
    im = Image.new('RGB', (w, h), (90, 110, 140))
    for y, row in enumerate(s['r']):
        for x, c in enumerate(row):
            if c != '.': im.putpixel((x, y), tuple(int(pal[c][i:i + 2], 16) for i in (1, 3, 5)))
    ims.append(im.resize((w * sc, h * sc), Image.NEAREST))
W = 1400; x = y = 0; rowh = 0; pos = []
for im in ims:
    if x + im.width > W: x = 0; y += rowh + 6; rowh = 0
    pos.append((x, y)); x += im.width + 6; rowh = max(rowh, im.height)
out = Image.new('RGB', (W, y + rowh), (40, 40, 50))
for im, p in zip(ims, pos): out.paste(im, p)
out.save(sys.argv[1])
