# Heroína dibujada a mano (técnica Cumbre), modelo: arquera de Sendero del Orbe. 14x18, mira a la derecha.
# K contorno · C c d capa (se cambia por paleta) · L l k cuero · P p pantalón · S s piel · R F plumas del carcaj · Y hebilla
HEAD = [
    ".....KKKK.....",
    "....KcCCCK....",
    "...KdcCCCCK...",
    "..KddcCCSSSK..",
    "..KdcCCSSKSK..",
    "..FKdcCSSSSK..",
    "..RKddcKsssK..",
]
HEADB = HEAD[:]; HEADB[4] = "..KdcCCSSsSK.."
T_IDLE = [
    "..KdcclllK....",
    ".KddclLlllK...",
    ".KdcclLlkK....",
    ".KdccYkkSK....",
    ".KddclllK.....",
]
T_RUNA = [
    "..KdcclllK....",
    ".KddclLlllKK..",
    ".KdcclLllkSK..",
    ".KdccYkkkK....",
    ".KddclllK.....",
]
T_CL = [
    "..KdcclllK....",
    ".KddclLlllK...",
    ".KdcclLlllK...",
    ".KdccYkkkK....",
    ".KddclllK.....",
]
L_ST = [
    "..KdcPPPPK....",
    "..KdKPpKPpK...",
    "...KKPpKPpK...",
    "....KPpKPpK...",
    "....KklKklLK..",
    "....KKKKKKKK..",
]
L_R1 = [
    "..KdcPPPPK....",
    "..KdKPpKKPpK..",
    "..KKPpK..KPpK.",
    ".KPpK....KPpK.",
    ".KklK....KklLK",
    ".KKK.....KKKK.",
]
L_R2 = [
    "..KdcPPPPK....",
    "..KdKPpPpK....",
    "...KKPpPpK....",
    "....KPpKllK...",
    "....KklKKK....",
    "....KKK.......",
]
L_R3 = [
    "..KdcPPPPK....",
    "..KdKpPKKpPK..",
    "..KKpPK..KpPK.",
    ".KpPK....KpPK.",
    ".KlkK....KlkLK",
    ".KKK.....KKKK.",
]
L_JU = [
    "..KdcPPPPK....",
    "..KdKPPpPPK...",
    "...KKPpKPPK...",
    "....KklKklK...",
    "....KKKKKKK...",
    "..............",
]
L_FA = [
    "..KdcPPPPK....",
    "..KKPpKKPpK...",
    ".KPpK...KPpK..",
    ".KPpK...KPpK..",
    "KklK.....KklK.",
    "KKK.......KKK.",
]
L_CA = [
    "..KdcPPPPK....",
    "..KdKPpKPPPK..",
    "..KdKPpK.KPpK.",
    "...KKPpK..KlLK",
    "....KklK...KK.",
    "....KKK.......",
]
L_CB = [
    "..KdcPPPPK....",
    "..KdKPPPKPpK..",
    "...KKklKKPpK..",
    "....KKK.KPpK..",
    "........KklLK.",
    "........KKKK..",
]
def arm(rows, ax, hy):
    g = [list(r) for r in rows]
    def put(x, y, ch):
        if 0 <= y < 18 and 0 <= x < 14: g[y][x] = ch
    for y in range(hy + 2, 9): put(ax, y, 'k'); put(ax + 1, y, 'l'); put(ax + 2, y, 'K')
    for y in (hy, hy + 1): put(ax, y, 'S'); put(ax + 1, y, 'S'); put(ax + 2, y, 'K')
    put(ax, hy - 1, 'K'); put(ax + 1, hy - 1, 'K')
    return [''.join(r) for r in g]
F = lambda h, t, l: h + t + l
FRAMES = {
    'hero_idle0': F(HEAD, T_IDLE, L_ST), 'hero_idle1': F(HEADB, T_IDLE, L_ST),
    'hero_run0': F(HEAD, T_RUNA, L_R1), 'hero_run1': F(HEAD, T_IDLE, L_R2), 'hero_run2': F(HEAD, T_RUNA, L_R3), 'hero_run3': F(HEAD, T_IDLE, L_R2),
    'hero_jump0': arm(F(HEAD, T_CL, L_JU), 9, 1), 'hero_fall0': arm(F(HEAD, T_CL, L_FA), 9, 0),
    'hero_climb0': arm(F(HEAD, T_CL, L_CA), 10, 1), 'hero_climb1': arm(F(HEAD, T_CL, L_CB), 10, 5),
    'hero_rope0': arm(F(HEAD, T_CL, L_CA), 6, 0), 'hero_rope1': arm(F(HEAD, T_CL, L_CB), 6, 3),
    'hero_slide0': arm(F(HEAD, T_CL, L_FA), 10, 0),
}
for k, v in FRAMES.items():
    assert len(v) == 18, (k, len(v))
    for i, r in enumerate(v): assert len(r) == 14, (k, i, r, len(r))
