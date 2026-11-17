# Convierte las hojas de Gemini (pixel art "falso", JPEG) a sprites de texto estilo Cumbre:
# recorte por cuadro -> reducción a la grilla real (voto por mayoría) -> paleta corta -> contorno único.
from PIL import Image
import numpy as np, json, math, colorsys
from scipy import ndimage as nd

G = '/home/claude/escalada/gemini/'
OUT = '#140c14'

def rgbh(h): return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], float)
def load(n):
    im = np.asarray(Image.open(G + n + '.jpg').convert('RGB')).astype(float)
    r, g, b = im[..., 0], im[..., 1], im[..., 2]
    bg = (r > 150) & (b > 150) & (r - g > 70) & (b - g > 70)
    return im, ~bg

def nearest(pix, pal):
    # pix: (N,3); pal: list of (ch, hex). Distancia "redmean".
    P = np.array([rgbh(h) for _, h in pal])
    rm = (pix[:, None, 0] + P[None, :, 0]) / 2
    d = (2 + rm / 256) * (pix[:, None, 0] - P[None, :, 0]) ** 2 + 4 * (pix[:, None, 1] - P[None, :, 1]) ** 2 + (2 + (255 - rm) / 256) * (pix[:, None, 2] - P[None, :, 2]) ** 2
    return d.argmin(1)

def downsample(im, fg, box, s, pal, dark=0.07, fgmin=0.45, anchor_bottom=True):
    x0, y0, x1, y1 = box
    w = max(1, int(round((x1 - x0) / s))); h = max(1, int(round((y1 - y0) / s)))
    # alinear la grilla desde abajo (pies) y desde el centro horizontal
    cxp = (x0 + x1) / 2
    gx0 = cxp - w * s / 2; gy0 = y1 - h * s
    grid = []
    for j in range(h):
        row = []
        for i in range(w):
            a = int(round(gx0 + i * s)); b = int(round(gx0 + (i + 1) * s)); c = int(round(gy0 + j * s)); d = int(round(gy0 + (j + 1) * s))
            a, c = max(a, 0), max(c, 0)
            m = fg[c:d, a:b]
            if m.size == 0 or m.mean() < fgmin: row.append('.'); continue
            px = im[c:d, a:b][m]
            lum = (0.299 * px[:, 0] + 0.587 * px[:, 1] + 0.114 * px[:, 2]) / 255
            darkn = (lum < dark).mean()
            if darkn > 0.5: row.append('K'); continue
            px = px[lum >= dark]
            idx = nearest(px, pal)
            row.append(pal[np.bincount(idx, minlength=len(pal)).argmax()][0])
        grid.append(row)
    return grid

def outline(grid, protect=''):
    h, w = len(grid), len(grid[0])
    out = [r[:] for r in grid]
    for y in range(h):
        for x in range(w):
            if grid[y][x] == '.' or grid[y][x] in protect: continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if nx < 0 or ny < 0 or nx >= w or ny >= h or grid[ny][nx] == '.':
                    out[y][x] = 'K'; break
    return out

def clean(grid, minsize=8, frac=0.02):
    # elimina fragmentos sueltos (pixeles aislados que no son parte del personaje)
    h, w = len(grid), len(grid[0])
    occ = np.array([[c != '.' for c in r] for r in grid])
    lab, k = nd.label(occ)
    if k <= 1: return grid
    sizes = nd.sum(occ, lab, range(1, k + 1))
    big = sizes.max()
    out = [r[:] for r in grid]
    for i, sz in enumerate(sizes):
        if sz < minsize or sz < big * frac:
            for y, x in zip(*np.where(lab == i + 1)): out[y][x] = '.'
    return out

def trim(grid):
    rows = [i for i, r in enumerate(grid) if any(c != '.' for c in r)]
    cols = [i for i in range(len(grid[0])) if any(r[i] != '.' for r in grid)]
    return [r[cols[0]:cols[-1] + 1] for r in grid[rows[0]:rows[-1] + 1]]

def anchor_x(grid, r0, r1):
    h = len(grid); xs = []
    for y in range(int(h * r0), max(int(h * r0) + 1, int(h * r1))):
        xs += [x for x, c in enumerate(grid[y]) if c != '.']
    return int(round(np.median(xs))) if xs else len(grid[0]) // 2

def pack(frames, anchors):
    # mismo lienzo para toda la familia: pies abajo, ancla horizontal en el centro (ancho impar)
    half = max(max(a, len(f[0]) - 1 - a) for f, a in zip(frames, anchors))
    W = 2 * half + 1; H = max(len(f) for f in frames)
    out = []
    for f, a in zip(frames, anchors):
        pad_l = half - a
        rows = ['.' * W] * (H - len(f)) + [('.' * pad_l + ''.join(r)).ljust(W, '.') for r in f]
        out.append(rows)
    return out, W, H

def comps(fg, box, dil=3, minpx=120):
    x0, y0, x1, y1 = box
    sub = fg[y0:y1, x0:x1]
    lab, k = nd.label(nd.binary_dilation(sub, iterations=dil))
    res = []
    for i, sl in enumerate(nd.find_objects(lab)):
        m = (lab[sl] == i + 1) & sub[sl]
        if m.sum() < minpx: continue
        res.append([sl[1].start + x0, sl[0].start + y0, sl[1].stop + x0, sl[0].stop + y0, int(m.sum())])
    return sorted(res, key=lambda t: t[0])

def merge_small(cs, big=3000):
    bigs = [c for c in cs if c[4] >= big]; smalls = [c for c in cs if c[4] < big]
    for s in smalls:
        cx = (s[0] + s[2]) / 2
        t = min(bigs, key=lambda b: abs((b[0] + b[2]) / 2 - cx))
        t[0], t[1], t[2], t[3] = min(t[0], s[0]), min(t[1], s[1]), max(t[2], s[2]), max(t[3], s[3])
    return bigs

RES = {'pal': {}, 'spr': {}, 'meta': {}}

# ---------- HEROÍNA ----------
HERO = [('K', OUT), ('d', '#2a6036'), ('c', '#408448'), ('C', '#62ac5c'), ('k', '#664226'), ('l', '#946238'), ('L', '#b8844c'),
        ('p', '#342830'), ('P', '#46383e'), ('s', '#9a5a3e'), ('S', '#e8b07c'), ('R', '#d8333f'), ('F', '#f6f3ea'), ('Y', '#e0b040')]
im, fg = load('heroina')
colfrac = fg.mean(0)
lumc = (0.299 * im[..., 0] + 0.587 * im[..., 1] + 0.114 * im[..., 2]) / 255
for x in np.where((lumc < 0.2).mean(0) > 0.6)[0]: fg[:, max(0, x - 1):x + 2] = False
# primer plano estricto (lejos del magenta) para separar cuadros
mag = np.array([255, 0, 255.])
strict = fg & (np.sqrt(((im - mag) ** 2).sum(2)) > 110)
lab, k = nd.label(strict, structure=np.ones((3, 3)))
objs = nd.find_objects(lab)
SEEDS = [[50, 150, 272, 409, 541, 674, 823, 940], [52, 152, 262, 367, 485, 640, 795, 935]]
names = [['idle0', 'idle1', 'run0', 'run1', 'run2', 'jump0', 'fall0', 'climb0'], [None, None, None, None, 'climb1', 'rope0', 'rope1', 'slide0']]
masks = {}
for i, sl in enumerate(objs):
    m = lab[sl] == i + 1
    n = int(m.sum())
    if n < 12: continue
    ys, xs = np.where(m)
    cy, cx = ys.mean() + sl[0].start, xs.mean() + sl[1].start
    row = 0 if cy < 222 else 1
    j = int(np.argmin([abs(cx - sx) for sx in SEEDS[row]]))
    key = names[row][j]
    if key is None: continue
    full = np.zeros_like(strict); full[sl] = m
    masks[key] = masks.get(key, np.zeros_like(strict)) | full
s_h = 189 / 20.0
frames, anchors, keys = [], [], []
for key in ['idle0', 'idle1', 'run0', 'run1', 'run2', 'jump0', 'fall0', 'climb0', 'climb1', 'rope0', 'rope1', 'slide0']:
    m = nd.binary_dilation(masks[key], iterations=2) & fg
    if key.startswith('rope'):
        mx = im.max(2); mn = im.min(2); sat = (mx - mn) / np.maximum(mx, 1)
        body = m & (sat > 0.28) & (mx > 60)
        bodyd = nd.binary_dilation(body, iterations=6)
        m = m & ~((sat < 0.2) & ~bodyd)
        ys, xs = np.where(body)
        m[:max(0, ys.min() - 3), :] = False; m[ys.max() + 4:, :] = False
    ys, xs = np.where(m)
    box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    g = downsample(im, m, box, s_h, HERO)
    g = outline(trim(clean(g)), protect='FR')
    frames.append(g); anchors.append(anchor_x(g, 0.15, 0.45)); keys.append('hero_' + key)
packed, W, H = pack(frames, anchors)
RES['pal']['hero'] = dict(HERO)
for k, f in zip(keys, packed): RES['spr'][k] = {'p': 'hero', 'r': f}
RES['spr']['hero_run3'] = RES['spr']['hero_run1']
RES['meta']['hero'] = [W, H]
print('heroína lienzo', W, 'x', H)

# ---------- GOBLIN ----------
GOB = [('K', OUT), ('a', '#344a1c'), ('b', '#4e6c2a'), ('c', '#6c923a'), ('e', '#40281a'), ('f', '#664226'), ('g', '#946238'),
       ('h', '#a87c48'), ('i', '#ffe25a'), ('j', '#d8d0b8'), ('m', '#8e6236'), ('n', '#c3cad6'), ('o', '#f6f3ea')]
im, fg = load('goblin')
cs = merge_small(comps(fg, (0, 0, 1024, 232), dil=3, minpx=200), big=6000)
print('goblin cuadros:', len(cs))
s_g = 197 / 18.0
frames, anchors = [], []
for c in cs[:5]:
    g = outline(trim(clean(downsample(im, fg, c[:4], s_g, GOB))), protect='io')
    frames.append(g); anchors.append(anchor_x(g, 0.0, 0.35))
packed, W, H = pack(frames, anchors)
RES['pal']['goblin'] = dict(GOB)
for k, f in zip(['goblin0', 'goblin1', 'goblinAim', 'goblinShot', 'goblinDead'], packed): RES['spr'][k] = {'p': 'goblin', 'r': f}
RES['meta']['goblin'] = [W, H]
print('goblin lienzo', W, 'x', H)

# ---------- DIABLILLO ----------
IMP = [('K', OUT), ('a', '#4e121a'), ('b', '#7e1e22'), ('c', '#aa3428'), ('d', '#d05a36'), ('w', '#3a1a28'), ('x', '#542638'), ('y', '#6e3448'),
       ('h', '#3a2e36'), ('H', '#5a4a52'), ('e', '#ffe25a'), ('f', '#fa6a0a'), ('g', '#9a96a2'), ('G', '#cfcbd6')]
im, fg = load('diablillo')
cs = merge_small(comps(fg, (0, 0, 1024, 226), dil=3, minpx=150), big=6000)
print('diablillo cuadros:', len(cs))
s_i = 167 / 18.0
frames, anchors = [], []
for c in cs[:5]:
    g = outline(trim(clean(downsample(im, fg, c[:4], s_i, IMP), 3)), protect='efG')
    frames.append(g); anchors.append(anchor_x(g, 0.2, 0.6))
packed, W, H = pack(frames, anchors)
RES['pal']['imp'] = dict(IMP)
for k, f in zip(['imp0', 'imp1', 'imp2', 'imp3', 'impDead'], packed): RES['spr'][k] = {'p': 'imp', 'r': f}
RES['meta']['imp'] = [W, H]
print('diablillo lienzo', W, 'x', H)

# ---------- GÓLEM ----------
im, fg = load('golem')
GOL = [('K', OUT), ('a', '#1a1418'), ('b', '#2a2228'), ('c', '#3a3038'), ('d', '#4e424c'), ('e', '#665a64'),
       ('f', '#5a1406'), ('g', '#a8280c'), ('h', '#e85a0c'), ('i', '#fa9a1a'), ('j', '#ffd541'), ('k', '#fff4c0')]
STONE = [('K', OUT), ('a', '#2a2626'), ('b', '#3e3a3a'), ('c', '#56504e'), ('d', '#706a66'), ('e', '#8c8680'), ('f', '#aaa49c'),
         ('h', '#e85a0c'), ('i', '#fa9a1a'), ('j', '#ffd541')]
s_o = 2.25
gkeys = ['golem_idle1', 'golem_throw', 'golem_slamUp', 'golem_stoneSplash', 'golem_idle0', 'golem_slamDown', 'golem_beam', 'golem_stone']
frames, anchors, keys, pals = [], [], [], []
for j in range(2):
    for i in range(4):
        cell = (i * 256, j * 217, (i + 1) * 256, (j + 1) * 217)
        cs = merge_small(comps(fg, cell, dil=2, minpx=300), big=8000)
        x0 = min(c[0] for c in cs); y0 = min(c[1] for c in cs); x1 = max(c[2] for c in cs); y1 = max(c[3] for c in cs)
        k = gkeys[j * 4 + i]
        if k == 'golem_stoneSplash': continue
        sub = im[y0:y1, x0:x1]; mm = fg[y0:y1, x0:x1]
        rock = mm & (sub.max(2) - sub.min(2) < 60) & (sub.max(2) < 140)
        cols = np.where(rock.sum(0) > 6)[0]
        x0, x1 = x0 + max(0, cols.min() - 8), x0 + min(x1 - x0, cols.max() + 9)
        pal = STONE if 'stone' in k else GOL
        g = outline(trim(clean(downsample(im, fg, (x0, y0, x1, y1), s_o, pal, dark=0.05), 20, 0.06)), protect='hijk')
        frames.append(g); anchors.append(anchor_x(g, 0.05, 0.3)); keys.append(k); pals.append('stone' if 'stone' in k else 'golem')
packed, W, H = pack(frames, anchors)
RES['pal']['golem'] = dict(GOL); RES['pal']['stone'] = dict(STONE)
for k, f, p in zip(keys, packed, pals): RES['spr'][k] = {'p': p, 'r': f}
RES['meta']['golem'] = [W, H]
print('gólem lienzo', W, 'x', H)
json.dump(RES, open('/home/claude/escalada/tools/gemini_sprites.json', 'w'))
