# Hojas de Gemini de la 3.ª tanda: esqueleto arquero, fantasma menor, polilla espiritual, fuego fatuo y objetos.
# Reutiliza las funciones de tools/gconv2.py y agrega/actualiza tools/gemini_sprites2.json.
import json, sys
import numpy as np
src = open('/home/claude/escalada/tools/gconv2.py').read().split('# ---------- JEFES ----------')[0]
exec(src)
from scipy import ndimage as nd2
_load1 = load
def load(n, thr=70):
    # fondo gris plano: umbral bajo + relleno desde los bordes (el fondo conectado), así no se pierden huesos ni piedra gris
    if n in ('esqueleto_fantasma', 'objetos'):
        im = np.asarray(Image.open(G + n + '.jpg').convert('RGB')).astype(float)
        border = np.concatenate([im[0], im[-1], im[:, 0], im[:, -1]]); bg = np.median(border, 0)
        near = np.sqrt(((im - bg) ** 2).sum(2)) < 18
        lab, k = nd2.label(near)
        edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
        sizes = nd2.sum(near, lab, range(1, k + 1))
        big = {i + 1 for i, sz in enumerate(sizes) if sz > 220}          # huecos grandes (dentro del arco) también son fondo
        bgm = np.isin(lab, list(edge | big))
        fg = ~nd2.binary_opening(bgm, iterations=1) if False else ~bgm
        fg = nd2.binary_opening(fg, iterations=1)
        return im, fg
    return _load1(n, thr)
RES = json.load(open('/home/claude/escalada/tools/gemini_sprites2.json'))
DEBUG = '--boxes' in sys.argv

def boxes_of(sheet, band, thr=70, gap=6, minw=25):
    im, fg = load(sheet, thr)
    return colsplit(fg, band[0], band[1], upto=1.0, gap=gap, minw=minw)

if DEBUG:
    for sh, bands in [('esqueleto_fantasma', [(65, 227), (351, 486)]), ('polilla_fuego', [(78, 210), (350, 497)]),
                      ('objetos', [(29, 134), (197, 308), (369, 494)])]:
        for b in bands: print(sh, b, [x[:4] for x in boxes_of(sh, b)])
    sys.exit()

def fam_boxes(sheet, boxes, names, s, ncol, fam, dark=0.07, anchor=(0.0, 1.0), protect='', keep_largest=(), align='bottom', thr=70, minsize=6, frac=0.03):
    im, fg = load(sheet, thr)
    boxes = [list(map(int, b[:4])) for b in boxes]
    pal = palette(im, fg, boxes, ncol, dark)
    pal = [('K', OUT)] + pal
    frames, anchors = [], []
    for b, n in zip(boxes, names):
        g = downsample(im, fg, b, s, pal, dark)
        g = outline(trim(clean(g, minsize, frac, n in keep_largest)), protect)
        frames.append(g); anchors.append(anchor_x(g, *anchor))
    packed, W, H = pack(frames, anchors, align)
    RES['pal'][fam] = dict(pal)
    for k, f in zip(names, packed): RES['spr'][k] = {'p': fam, 'r': f}
    RES['meta'][fam] = [W, H]
    print(fam, 'lienzo', W, 'x', H, '·', len(pal), 'colores ·', ' '.join(names))

B = lambda sh, band, **k: boxes_of(sh, band, **k)
# ---------- ENEMIGOS ----------
sk = B('esqueleto_fantasma', (65, 227))
fam_boxes('esqueleto_fantasma', [sk[0], sk[1], sk[2], sk[4]], ['skel0', 'skelAim', 'skelShot', 'skelDead'], 7.9, 9, 'skel', anchor=(0.0, 0.3), minsize=4, frac=0.02)
gh = B('esqueleto_fantasma', (351, 486))
fam_boxes('esqueleto_fantasma', gh, ['ghost0', 'ghost1', 'ghost2', 'ghost3', 'ghostDead'], 6.6, 6, 'ghost', anchor=(0.0, 0.5), keep_largest=('ghost0', 'ghost1', 'ghost2', 'ghost3'), align='center', minsize=1, frac=0.0)
mo = B('polilla_fuego', (78, 210)); mo = [mo[2], mo[1], mo[2], mo[3], mo[4]]   # el 1.er cuadro trae un halo que ensucia: se usa el de alas abiertas
fam_boxes('polilla_fuego', mo, ['moth0', 'moth1', 'moth2', 'moth3', 'mothDead'], 7.6, 8, 'moth', anchor=(0.0, 1.0), keep_largest=('moth0', 'moth1', 'moth2', 'moth3'), align='center', minsize=1, frac=0.0)
wi = B('polilla_fuego', (350, 497))
fam_boxes('polilla_fuego', wi, ['wisp0', 'wisp1', 'wisp2', 'wisp3', 'wispDead'], 8.3, 6, 'wisp', anchor=(0.3, 1.0), keep_largest=('wisp0', 'wisp1', 'wisp2', 'wisp3'), align='center', minsize=1, frac=0.0)
# ---------- OBJETOS ----------
r1 = B('objetos', (29, 134)); r2 = B('objetos', (197, 308)); r3 = B('objetos', (369, 494))
fam_boxes('objetos', r1[0:3], ['gemG0', 'gemG1', 'gemG2'], 6.8, 7, 'gemG', keep_largest=('gemG0', 'gemG1', 'gemG2'), protect='')
fam_boxes('objetos', [r1[3]], ['potion'], 8.0, 7, 'potion', keep_largest=('potion',))
fam_boxes('objetos', r1[5:7], ['anchor0', 'anchor1'], 6.0, 8, 'anchor', keep_largest=('anchor0', 'anchor1'))
fam_boxes('objetos', r2[0:2], ['rune_luz0', 'rune_luz1'], 6.4, 8, 'runeLuz', keep_largest=('rune_luz0', 'rune_luz1'))
fam_boxes('objetos', r2[2:4], ['rune_fuego0', 'rune_fuego1'], 6.4, 8, 'runeFuego', keep_largest=('rune_fuego0', 'rune_fuego1'))
fam_boxes('objetos', r3[0:2], ['rune_escarcha0', 'rune_escarcha1'], 6.4, 8, 'runeEscarcha', keep_largest=('rune_escarcha0', 'rune_escarcha1'))
fam_boxes('objetos', [r3[2], r3[4]], ['rune_alma0', 'rune_alma1'], 6.4, 8, 'runeAlma', keep_largest=('rune_alma0', 'rune_alma1'))
bn = [b for b in B('objetos', (300, 494)) if b[0] > 670]
fam_boxes('objetos', bn, ['banner0', 'banner1', 'banner2'], 6.3, 8, 'banner', anchor=(0.6, 1.0), keep_largest=('banner0', 'banner1', 'banner2'))
# ---------- CARCELERO DE ALMAS (rediseño: carcelero de hierro con cabeza de candado) ----------
family('carcelero2', [(5, 281), (294, 569)], ['carcelero_idle0', 'carcelero_throw', 'carcelero_slamUp', 'carcelero_slamDown', 'carcelero_idle1', 'carcelero_beam', 'carcelero_roar', 'carcelero_stone'],
       2.85, 13, 'carcelero', 4000, split=True, anchor=(0.0, 0.3))
json.dump(RES, open('/home/claude/escalada/tools/gemini_sprites2.json', 'w'))
