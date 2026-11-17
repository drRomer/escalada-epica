// ===== ARTE: tiles procedurales del volcán y fondos =====
const ART = (function () {
  const T = CORE.T;
  function rng(seed) { let a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function cv(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function hex(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function mix(a, b, t) { const A = hex(a), B = hex(b); return 'rgb(' + A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',') + ')'; }
  function mixHex(a, b, t) { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); }

  const WOOD = ['#3a2412', '#6a4422', '#9a6a36'], IRON = ['#3a3a48', '#6a6a7c', '#b4b4c8'];
  const NONE = ['#000000', '#000000', '#000000'];
  const THEMES = {
    // ----- etapa 1: bosque de la montaña -----
    pradera: { rock: ['#1e1a1c', '#3a3236', '#544a4c', '#6e6262', '#948a84'], cap: 'grass', capC: ['#2e5a1e', '#4a8a2a', '#7ac04a'], slab: ['#2a2a30', '#46464e', '#62626a', '#82828a'],
      obs: ['#0e1a2a', '#2a4a6a', '#5a8ab0', '#c0e0f0'], top: '#4a8ad0', bot: '#f4dca0', far: '#6a8aaa', near: '#2a4a36', bg: 'forest', fx: 'leaves', clouds: 4, vine: 1, hz: 'thorn' },
    ruinas: { rock: ['#1c1a1a', '#36302e', '#504844', '#6a6058', '#8e8476'], cap: 'moss', capC: ['#1e3a1e', '#2e5a2a', '#4e8a3a'], slab: ['#2a2a2c', '#46444a', '#626068', '#84828a'],
      obs: ['#0e1a2a', '#2a4a6a', '#5a8ab0', '#c0e0f0'], top: '#3e74b0', bot: '#e8cc94', far: '#5a7690', near: '#24402e', bg: 'forest', fx: 'leaves', clouds: 3, towers: 1, vine: 1, hz: 'thorn' },
    bosque: { rock: ['#1a1a16', '#302e26', '#4a4636', '#645e48', '#868062'], cap: 'moss', capC: ['#1e3a16', '#30582a', '#4e8a36'], slab: ['#26282a', '#404446', '#5a5e60', '#7a7e7e'],
      obs: ['#0e1a2a', '#2a4a6a', '#5a8ab0', '#c0e0f0'], top: '#2e5a7a', bot: '#c8d89a', far: '#3a5a52', near: '#18301e', bg: 'forest', fx: 'leaves', clouds: 2, vine: 1, hz: 'thorn' },
    corrupto: { rock: ['#181420', '#2c2234', '#44344c', '#5c4a64', '#7c6a84'], cap: 'moss', capC: ['#24163a', '#422a5a', '#6e4a8a'], slab: ['#201c28', '#383244', '#524a60', '#6e6680'],
      obs: ['#120a1a', '#2e1a3e', '#5a3a7a', '#b08ad0'], top: '#140a20', bot: '#5a3468', far: '#34204a', near: '#160e20', bg: 'forest', fx: 'spores', clouds: 0, vine: 1, stars: 0.5, hz: 'thorn' },
    claro: { rock: ['#181420', '#2c2234', '#44344c', '#5c4a64', '#7c6a84'], cap: 'moss', capC: ['#24163a', '#422a5a', '#6e4a8a'], slab: ['#201c28', '#383244', '#524a60', '#6e6680'],
      obs: ['#120a1a', '#2e1a3e', '#5a3a7a', '#b08ad0'], top: '#100818', bot: '#7a3a5a', far: '#3a2244', near: '#140c1c', bg: 'forest', fx: 'spores', clouds: 0, vine: 1, stars: 0.8, hz: 'thorn' },
    // ----- etapa 2: cumbres nevadas -----
    nieve: { rock: ['#1a1e2a', '#2e3446', '#465068', '#647090', '#8a98b8'], cap: 'snow', capC: ['#a8c0d8', '#d8e8f4', '#ffffff'], slab: ['#2a3040', '#465068', '#64708a', '#8a96b0'],
      obs: ['#1a3a5a', '#4a8ac0', '#8ad0f0', '#e0f8ff'], top: '#5a7ab0', bot: '#e4ecf6', far: '#8a9cbc', near: '#56688a', bg: 'sky', fx: 'snow', clouds: 4, ice: 1, hz: 'icewater' },
    glaciar: { rock: ['#121a28', '#22304a', '#34486a', '#4e6890', '#7a96bc'], cap: 'snow', capC: ['#8aa8c8', '#c0d8ec', '#f0f8ff'], slab: ['#1a2234', '#2c3a54', '#425476', '#5e7298'],
      obs: ['#0e2a4a', '#3a7ab0', '#7ac0e8', '#e0f8ff'], top: '#08101e', bot: '#1a3050', far: '#1e3654', near: '#10203a', bg: 'cave', fx: 'snow', crystals: '#8ad0f0', ice: 1, hz: 'icewater' },
    ventisca: { rock: ['#1e222c', '#343a4a', '#4e566a', '#6c768c', '#929cb0'], cap: 'snow', capC: ['#b0c4d8', '#dce8f4', '#ffffff'], slab: ['#2c3240', '#485062', '#666e84', '#8a92a8'],
      obs: ['#1a3a5a', '#4a8ac0', '#8ad0f0', '#e0f8ff'], top: '#46566e', bot: '#b4c2d4', far: '#6e7c96', near: '#4a586e', bg: 'sky', fx: 'snowstorm', clouds: 5, ice: 1, hz: 'icewater' },
    cumbre: { rock: ['#1a1e2a', '#2e3446', '#465068', '#647090', '#8a98b8'], cap: 'snow', capC: ['#a8c0d8', '#d8e8f4', '#ffffff'], slab: ['#2a3040', '#465068', '#64708a', '#8a96b0'],
      obs: ['#1a3a5a', '#4a8ac0', '#8ad0f0', '#e0f8ff'], top: '#101a34', bot: '#5a7aa8', far: '#34446a', near: '#1e2a46', bg: 'sky', fx: 'snow', clouds: 2, stars: 0.7, ice: 1, hz: 'icewater' },
    // ----- etapa 3: volcán -----
    faldas: { rock: ['#231c1e', '#3b3034', '#544649', '#6e5e5e', '#94827c'], cap: 'ash', capC: ['#4a4446', '#6e6668', '#948c8a'], slab: ['#2a2430', '#463e4c', '#5e5464', '#7a6e80'],
      obs: ['#0e0a14', '#241a30', '#4a3a64', '#9a86c8'], top: '#3a2a52', bot: '#f0905a', far: '#6a4a6a', near: '#3e2c42', bg: 'sky', fx: 'ash', clouds: 3, smoke: 1, hz: 'lava' },
    riscos: { rock: ['#2a1614', '#48261e', '#6a3a2a', '#8e543a', '#b87a52'], cap: 'none', capC: NONE, slab: ['#2a2028', '#443642', '#5e4c5a', '#7a6676'],
      obs: ['#0e0a14', '#241a30', '#4a3a64', '#9a86c8'], top: '#3a1e32', bot: '#e0703a', far: '#6a3a4a', near: '#3a1e26', bg: 'sky', fx: 'ash', clouds: 2, smoke: 2, hz: 'lava' },
    magma: { rock: ['#1a1214', '#2e2024', '#443034', '#5e4446', '#806060'], cap: 'none', capC: NONE, slab: ['#1e161c', '#34282e', '#4a3a40', '#64505a'],
      obs: ['#0a0608', '#1e1016', '#4a2a3a', '#c88aa0'], top: '#2a0a10', bot: '#d8461e', far: '#5a1e1e', near: '#2a1012', bg: 'sky', fx: 'embers', clouds: 1, veins: 1, smoke: 3, glow: 1, hz: 'lava' },
    cueva: { rock: ['#161420', '#28243a', '#3c3654', '#565070', '#7e769a'], cap: 'none', capC: NONE, slab: ['#1a1824', '#2c2a3c', '#403c54', '#5a5470'],
      obs: ['#08060e', '#1c1428', '#3e2e5a', '#b8a0f0'], top: '#0c0a14', bot: '#1e1830', far: '#2a2440', near: '#1a1628', bg: 'cave', fx: 'drip', crystals: '#b07cff', hz: 'lava' },
    nido: { rock: ['#1e1012', '#361c1e', '#50282a', '#6c3a36', '#94584c'], cap: 'none', capC: NONE, slab: ['#241418', '#3e2428', '#58363a', '#74484c'],
      obs: ['#0a0608', '#1e1016', '#4a2a3a', '#c88aa0'], top: '#1a060c', bot: '#a02a1a', far: '#4a1a1e', near: '#240c10', bg: 'sky', fx: 'embers', clouds: 0, smoke: 2, glow: 1, hz: 'lava' },
    chimenea: { rock: ['#140c0e', '#261618', '#3a2224', '#523030', '#784640'], cap: 'none', capC: NONE, slab: ['#1a1012', '#2e1c20', '#44282c', '#5e383a'],
      obs: ['#0a0406', '#1e0c10', '#4a1e26', '#e0806a'], top: '#0a0406', bot: '#4a1008', far: '#2a0e0e', near: '#1a0808', bg: 'cave', fx: 'embers', veins: 1, crystals: '#fa6a0a', lavaGlow: 1, hz: 'lava' },
    ceniza: { rock: ['#1e1c20', '#343038', '#4c4650', '#68606a', '#908890'], cap: 'ash', capC: ['#6a6468', '#a49ea0', '#d8d2d0'], slab: ['#24222a', '#3a3842', '#524e5a', '#6e6a76'],
      obs: ['#08060e', '#1c1428', '#3e2e5a', '#b8a0f0'], top: '#2a2228', bot: '#8a7068', far: '#4a4044', near: '#2a2428', bg: 'sky', fx: 'ashstorm', clouds: 4, smoke: 2, hz: 'lava' },
    crater: { rock: ['#140c0e', '#2a1a1c', '#402628', '#5a3634', '#7e4c44'], cap: 'none', capC: NONE, slab: ['#1e1214', '#36222a', '#4e3238', '#6a444a'],
      obs: ['#0a0406', '#1e0c10', '#4a1e26', '#e0806a'], top: '#0e0408', bot: '#5a1410', far: '#3a1010', near: '#1a0808', bg: 'sky', fx: 'embers', veins: 1, clouds: 0, smoke: 3, glow: 1, storm: 1, hz: 'lava' },
    // ----- etapa 4: torre fantasma -----
    torre: { rock: ['#16141c', '#2a2632', '#403a4a', '#585064', '#7a7088'], cap: 'none', capC: NONE, slab: ['#1e1a26', '#36303e', '#4e4658', '#6a6278'],
      obs: ['#14141e', '#34344a', '#6e6e90', '#c0c0e0'], top: '#0c0a16', bot: '#241c34', far: '#1c1830', near: '#120e1e', bg: 'castle', fx: 'dust', win: '#7aa0d0', wood: ['#26180e', '#4a3220', '#704c30'], hz: 'mist' },
    cripta: { rock: ['#101412', '#1e2622', '#303a34', '#46524a', '#647068'], cap: 'moss', capC: ['#142218', '#1e3a24', '#2e5a34'], slab: ['#141a18', '#26302c', '#3a4640', '#525e58'],
      obs: ['#0c1410', '#24342c', '#4a6a5a', '#a0c8b4'], top: '#050806', bot: '#122018', far: '#16241c', near: '#0c140f', bg: 'castle', fx: 'mist', win: '#5ac08a', wood: ['#1e180e', '#3a3020', '#5a4a30'], hz: 'mist' },
    almenas: { rock: ['#16141e', '#2a2836', '#403e50', '#5a566c', '#7c7890'], cap: 'none', capC: NONE, slab: ['#1c1a26', '#32303e', '#4a4658', '#666276'],
      obs: ['#14141e', '#34344a', '#6e6e90', '#c0c0e0'], top: '#080a1e', bot: '#34386a', far: '#262a4a', near: '#12142a', bg: 'sky', fx: 'dust', clouds: 3, towers: 1, stars: 1, moon: 1, wood: ['#26180e', '#4a3220', '#704c30'], hz: 'mist' },
    campanario: { rock: ['#16141e', '#2a2836', '#403e50', '#5a566c', '#7c7890'], cap: 'none', capC: NONE, slab: ['#1c1a26', '#32303e', '#4a4658', '#666276'],
      obs: ['#14141e', '#34344a', '#6e6e90', '#c0c0e0'], top: '#06061a', bot: '#2a2450', far: '#201e3e', near: '#0e0e22', bg: 'sky', fx: 'dust', clouds: 2, towers: 1, stars: 1, moon: 1, storm: 1, wood: ['#26180e', '#4a3220', '#704c30'], hz: 'mist' }
  };
  // ----- etapa 5: ascenso espiritual, de la noche (0) a la luz plena (9) -----
  for (let i = 0; i < 10; i++) {
    const t = i / 9, m = (a, b) => mixHex(a, b, t);
    THEMES['astral' + i] = {
      rock: [m('#141430', '#6a4a20'), m('#28284e', '#a07838'), m('#3e3e6e', '#c8a060'), m('#5a5a90', '#e8cc90'), m('#8a8ac0', '#fff0c0')],
      cap: 'none', capC: NONE,
      slab: [m('#1a1a3a', '#7a5a30'), m('#2e2e56', '#a8885a'), m('#46467a', '#d0b080'), m('#6464a0', '#f0dcb0')],
      obs: [m('#101030', '#a07830'), m('#3a3a8a', '#e0b860'), m('#8a8af0', '#fff0b0'), m('#e0e0ff', '#ffffff')],
      top: m('#060818', '#e8b860'), bot: m('#22224a', '#fff0c8'), far: m('#1e1e44', '#e8c080'), near: m('#121230', '#d8a860'),
      bg: 'astral', fx: 'motes', stars: 1 - t, glowT: t, wood: [m('#3a2a5a', '#5a3a14'), m('#6a5a9a', '#a06a20'), m('#a89ae0', '#e0a040')],
      chain: [m('#3a3a6a', '#a07830'), m('#7a7ac0', '#e0b050'), m('#c0c0ff', '#fff4c0')], hz: 'light'
    };
  }

  // ---------- tiles ----------
  function isSolidCh(ch) { return ch === '#' || ch === 'Z' || ch === 'I' || ch === 'C'; }
  function edges(x, ox, oy, exp, dark, light, mid) {
    if (exp.l) { x.fillStyle = mid; x.fillRect(ox, oy, 1, T); }
    if (exp.r) { x.fillStyle = dark; x.fillRect(ox + T - 1, oy, 1, T); }
    if (exp.b) { x.fillStyle = dark; x.fillRect(ox, oy + T - 1, T, 1); }
    if (exp.t) { x.fillStyle = light; x.fillRect(ox, oy, T, 1); }
    if (exp.t && exp.l) x.clearRect(ox, oy, 1, 1);
    if (exp.t && exp.r) x.clearRect(ox + T - 1, oy, 1, 1);
    if (exp.b && exp.l) x.clearRect(ox, oy + T - 1, 1, 1);
    if (exp.b && exp.r) x.clearRect(ox + T - 1, oy + T - 1, 1, 1);
  }
  function vein(x, ox, oy, R) {
    let cx = 1 + Math.floor(R() * 10), cy = 0;
    const dirx = R() < 0.5 ? 1 : -1;
    for (let k = 0; k < 14; k++) {
      x.fillStyle = k % 4 === 1 ? '#ffd541' : '#fa6a0a';
      if (cx >= 0 && cx < T && cy < T) x.fillRect(ox + cx, oy + cy, 1, 1);
      cy++; if (R() < 0.45) cx += dirx;
    }
  }
  function drawRockTile(x, ox, oy, th, R, cols, exp, holds, crack) {
    const [d0, d1, d2, d3, d4] = cols;
    x.fillStyle = d2; x.fillRect(ox, oy, T, T);
    for (let j = 0; j < T; j++) for (let i = 0; i < T; i++) {
      const v = R();
      if (v < 0.17) { x.fillStyle = d1; x.fillRect(ox + i, oy + j, 1, 1); }
      else if (v > 0.93) { x.fillStyle = d3; x.fillRect(ox + i, oy + j, 1, 1); }
    }
    // facetas basálticas
    if (R() < 0.6) { const yy = 2 + Math.floor(R() * 8); x.fillStyle = d1; for (let i = 0; i < T; i++) if (R() < 0.75) x.fillRect(ox + i, oy + yy + (R() < 0.3 ? 1 : 0), 1, 1); }
    if (th.veins && !crack && R() < 0.3) vein(x, ox, oy, R);
    if (holds) {
      const n = 1 + (R() < 0.6 ? 1 : 0);
      for (let k = 0; k < n; k++) {
        const hx = 1 + Math.floor(R() * 8), hy = 1 + Math.floor(R() * 8);
        x.fillStyle = d0; x.fillRect(ox + hx, oy + hy + 2, 3, 1); x.fillRect(ox + hx + 2, oy + hy, 1, 2);
        x.fillStyle = d4; x.fillRect(ox + hx, oy + hy, 2, 2);
        x.fillStyle = d3; x.fillRect(ox + hx, oy + hy + 1, 2, 1);
      }
    }
    if (crack) {
      x.fillStyle = d0;
      for (let k = 0; k < 2; k++) { let cx2 = 3 + Math.floor(R() * 6); for (let j = 0; j < T; j++) { x.fillRect(ox + cx2, oy + j, 1, 1); if (R() < 0.45) cx2 += R() < 0.5 ? -1 : 1; cx2 = Math.max(1, Math.min(10, cx2)); } }
      let cy = 3 + Math.floor(R() * 6);
      for (let i = 0; i < T; i++) { if (R() < 0.8) x.fillRect(ox + i, oy + cy, 1, 1); if (R() < 0.4) cy += R() < 0.5 ? -1 : 1; }
      // brasas en las grietas (solo en el volcán); escarcha en la nieve
      if (th.hz === 'lava') for (let k = 0; k < 3; k++) { x.fillStyle = k ? '#fa6a0a' : '#ffd541'; x.fillRect(ox + 2 + Math.floor(R() * 8), oy + 2 + Math.floor(R() * 8), 1, 1); }
      else if (th.ice) for (let k = 0; k < 3; k++) { x.fillStyle = '#e0f4ff'; x.fillRect(ox + 2 + Math.floor(R() * 8), oy + 2 + Math.floor(R() * 8), 1, 1); }
    }
    edges(x, ox, oy, exp, d0, d4, d3);
  }
  function capOn(x, ox, oy, th, R) {
    if (th.cap === 'none') return;
    const [c0, c1, c2] = th.capC;
    if (th.cap === 'grass' || th.cap === 'moss') {
      const h = th.cap === 'moss' ? 1 : 2;
      x.fillStyle = c1; x.fillRect(ox, oy, T, h);
      x.fillStyle = c2; for (let i = 0; i < T; i++) if (R() < 0.35) x.fillRect(ox + i, oy, 1, 1);
      x.fillStyle = c0; for (let i = 0; i < T; i++) { const d = R() < (th.cap === 'moss' ? 0.5 : 0.35) ? 1 + Math.floor(R() * 2) : 0; if (d) x.fillRect(ox + i, oy + h, 1, d); }
      if (th.cap === 'grass') { x.fillStyle = c2; for (let i = 0; i < T; i += 3 + Math.floor(R() * 3)) x.fillRect(ox + i, oy - 1, 1, 1); }
    } else if (th.cap === 'snow') {
      x.fillStyle = c2; x.fillRect(ox, oy - 2, T, 3);
      x.fillStyle = c1; x.fillRect(ox, oy + 1, T, 1);
      for (let i = 0; i < T; i++) { if (R() < 0.35) { x.fillStyle = c2; x.fillRect(ox + i, oy - 3, 1, 1); } if (R() < 0.3) { x.fillStyle = c1; x.fillRect(ox + i, oy + 2, 1, 1 + Math.floor(R() * 2)); } }
      x.fillStyle = c0; for (let i = 0; i < T; i++) if (R() < 0.18) x.fillRect(ox + i, oy, 1, 1);
    } else {
      x.fillStyle = c2; x.fillRect(ox, oy - 1, T, 2);
      x.fillStyle = c1; x.fillRect(ox, oy + 1, T, 1);
      for (let i = 0; i < T; i++) if (R() < 0.3) { x.fillStyle = c1; x.fillRect(ox + i, oy + 2, 1, 1 + Math.floor(R() * 2)); }
      x.fillStyle = c0; for (let i = 0; i < T; i++) if (R() < 0.2) x.fillRect(ox + i, oy, 1, 1);
    }
  }
  // muro enano: sillares de piedra
  function drawBrick(x, ox, oy, th, R, exp, r, c) {
    const [d0, d1, d2, d3] = th.slab;
    x.fillStyle = d0; x.fillRect(ox, oy, T, T);
    for (let row = 0; row < 2; row++) {
      const off = ((r * 2 + row) % 2) ? 6 : 0;
      for (let k = -1; k < 2; k++) {
        const bx = ox + k * 12 + off - (c % 2 ? 0 : 0), by = oy + row * 6;
        const x0 = Math.max(ox, bx + 1), x1 = Math.min(ox + T, bx + 12);
        if (x1 <= x0) continue;
        const shade = R() < 0.3 ? d1 : d2;
        x.fillStyle = shade; x.fillRect(x0, by + 1, x1 - x0, 5);
        x.fillStyle = d3; x.fillRect(x0, by + 1, x1 - x0, 1);
        for (let i = x0; i < x1; i++) if (R() < 0.12) { x.fillStyle = d1; x.fillRect(i, by + 2 + Math.floor(R() * 4), 1, 1); }
      }
    }
    if (exp.t) { x.fillStyle = d3; x.fillRect(ox, oy, T, 1); }
    if (exp.l) { x.fillStyle = d1; x.fillRect(ox, oy, 1, T); }
    if (exp.r) { x.fillStyle = d0; x.fillRect(ox + T - 1, oy, 1, T); }
  }
  function drawObsidian(x, ox, oy, th, R, exp) {
    const [o0, o1, o2, o3] = th.obs;
    x.fillStyle = o1; x.fillRect(ox, oy, T, T);
    x.fillStyle = o0; for (let j = 0; j < T; j++) for (let i = 0; i < T; i++) if (R() < 0.12) x.fillRect(ox + i, oy + j, 1, 1);
    const s = Math.floor(R() * 10);
    for (let k = 0; k < 12; k++) {
      const px = s + k - 5, py = k;
      if (px >= 0 && px < T) { x.fillStyle = o2; x.fillRect(ox + px, oy + py, 1, 1); }
      if (px + 1 >= 0 && px + 1 < T && k % 3 === 0) { x.fillStyle = o3; x.fillRect(ox + px + 1, oy + py, 1, 1); }
    }
    edges(x, ox, oy, exp, o0, o3, o2);
    if (exp.t) { x.fillStyle = o2; x.fillRect(ox + 1, oy + 1, T - 2, 1); }
  }
  function drawWood(x, ox, oy, R, l, r, th) {
    const [w0, w1, w2] = (th && th.wood) || WOOD;
    x.fillStyle = w1; x.fillRect(ox, oy, T, 4);
    x.fillStyle = w2; x.fillRect(ox, oy, T, 1);
    x.fillStyle = w0; x.fillRect(ox, oy + 3, T, 1);
    x.fillStyle = w0; x.fillRect(ox + 5 + Math.floor(R() * 2), oy + 1, 1, 2);
    x.fillStyle = '#9a9aa8'; x.fillRect(ox + 2, oy + 1, 1, 1); x.fillRect(ox + 9, oy + 1, 1, 1);
    if (l) { x.fillStyle = w0; x.fillRect(ox + 1, oy + 4, 2, 2); x.fillRect(ox + 1, oy + 6, 1, 4); x.fillRect(ox + 2, oy + 9, 2, 1); }
    if (r) { x.fillStyle = w0; x.fillRect(ox + 9, oy + 4, 2, 2); x.fillRect(ox + 10, oy + 6, 1, 4); x.fillRect(ox + 8, oy + 9, 2, 1); }
  }
  function drawVine(x, ox, oy, top, R) {
    // liana del bosque: tallo que serpentea con hojas
    for (let j = 0; j < T; j++) {
      const sx = ox + 5 + Math.round(Math.sin((oy + j) * 0.5) * 1.2);
      x.fillStyle = '#1e3a14'; x.fillRect(sx - 1, oy + j, 1, 1); x.fillStyle = '#3e6a22'; x.fillRect(sx, oy + j, 2, 1); x.fillStyle = '#6a9a3a'; x.fillRect(sx, oy + j, 1, 1);
    }
    for (let k = 0; k < 2; k++) {
      const ly = oy + 2 + k * 6 + Math.floor(R() * 2), lx = k % 2 ? ox + 7 : ox + 2;
      x.fillStyle = '#2e5a1e'; x.fillRect(lx, ly, 3, 2); x.fillStyle = '#7ac04a'; x.fillRect(lx + (k % 2 ? 1 : 0), ly, 2, 1);
    }
    if (top) { x.fillStyle = '#1e3a14'; x.fillRect(ox + 3, oy - 2, 6, 3); x.fillStyle = '#4e8a2a'; x.fillRect(ox + 4, oy - 2, 4, 2); }
  }
  function drawChain(x, ox, oy, top, th) {
    const [i0, i1, i2] = (th && th.chain) || IRON;
    // eslabón frontal (óvalo) + eslabón de canto
    x.fillStyle = i0; x.fillRect(ox + 4, oy, 4, 7); x.fillStyle = i1; x.fillRect(ox + 4, oy + 1, 1, 5); x.fillRect(ox + 7, oy + 1, 1, 5); x.fillRect(ox + 5, oy, 2, 1); x.fillRect(ox + 5, oy + 6, 2, 1);
    x.fillStyle = i2; x.fillRect(ox + 4, oy + 2, 1, 2);
    x.clearRect(ox + 5, oy + 1, 2, 5);
    x.fillStyle = i0; x.fillRect(ox + 5, oy + 6, 2, 6); x.fillStyle = i1; x.fillRect(ox + 5, oy + 7, 1, 4); x.fillStyle = i2; x.fillRect(ox + 5, oy + 8, 1, 1);
    if (top) { x.fillStyle = '#120a14'; x.fillRect(ox + 2, oy - 2, 8, 4); x.fillStyle = i1; x.fillRect(ox + 3, oy - 1, 6, 2); x.fillStyle = i2; x.fillRect(ox + 3, oy - 1, 2, 1); }
  }
  function drawSpikes(x, ox, oy, dir) {
    const [s0, s1, s2] = IRON;
    const b = cv(T, T), bx = b.getContext('2d');
    for (let k = 0; k < 3; k++) {
      const bx0 = k * 4;
      for (let j = 0; j < 6; j++) {
        const w = 1 + Math.floor(j / 3) * 2 + (j % 3 === 2 ? 1 : 0), lx = bx0 + 2 - Math.ceil(w / 2);
        bx.fillStyle = s1; bx.fillRect(lx, T - 6 + j, w, 1); bx.fillStyle = s2; bx.fillRect(lx, T - 6 + j, 1, 1); bx.fillStyle = s0; bx.fillRect(lx + w - 1, T - 6 + j, 1, 1);
      }
    }
    bx.fillStyle = '#5a1a14'; bx.fillRect(1, T - 6, 1, 1); bx.fillRect(5, T - 6, 1, 1);
    x.save(); x.translate(ox + T / 2, oy + T / 2);
    x.rotate({ '^': 0, 'v': Math.PI, '>': Math.PI / 2, '<': -Math.PI / 2 }[dir]); x.drawImage(b, -T / 2, -T / 2); x.restore();
  }
  function buildLevelLayer(L, themeName) {
    const th = THEMES[themeName];
    const W = L.W, H = L.H;
    const c = cv(W * T, H * T), x = c.getContext('2d');
    const at = (cc, r) => CORE.tile(L, cc, r);
    const caps = [];
    for (let r = 0; r < H; r++) for (let cc = 0; cc < W; cc++) {
      const ch = L.grid[r][cc];
      const R = rng((r * 131 + cc * 977 + 7) * 2654435761);
      const ox = cc * T, oy = r * T;
      const exp = { t: !isSolidCh(at(cc, r - 1)), b: !isSolidCh(at(cc, r + 1)) && r < H - 1, l: !isSolidCh(at(cc - 1, r)) && cc > 0, r: !isSolidCh(at(cc + 1, r)) && cc < W - 1 };
      if (ch === '#') { drawRockTile(x, ox, oy, th, R, th.rock, exp, true, false); if (exp.t) caps.push([ox, oy, R]); }
      else if (ch === 'Z') drawBrick(x, ox, oy, th, R, exp, r, cc);
      else if (ch === 'I') drawObsidian(x, ox, oy, th, R, exp);
      else if (ch === '=') drawWood(x, ox, oy, R, at(cc - 1, r) !== '=', at(cc + 1, r) !== '=', th);
      else if (ch === '|') { if (th.vine) drawVine(x, ox, oy, at(cc, r - 1) !== '|', R); else drawChain(x, ox, oy, at(cc, r - 1) !== '|', th); }
      else if (ch === 'X') { x.fillStyle = '#120a14'; x.fillRect(ox + 1, oy + T - 2, T - 2, 2); x.fillStyle = '#4a4a58'; x.fillRect(ox + 2, oy + T - 2, T - 4, 1); }
      else if ('^v<>'.includes(ch)) drawSpikes(x, ox, oy, ch);
    }
    for (const [ox, oy, R] of caps) capOn(x, ox, oy, th, R);
    return c;
  }
  function crumbleTex(themeName, seed) {
    const th = THEMES[themeName];
    const c = cv(T, T), x = c.getContext('2d');
    const cols = th.rock.map((h, i) => i === 0 ? '#120a0c' : mixHex(h, '#e8c8a0', 0.28));
    drawRockTile(x, 0, 0, th, rng(seed), cols, { t: true, b: true, l: true, r: true }, true, true);
    return c;
  }

  // ---------- fondos ----------
  function makeRange(w, h, seed, rough, peaks, jag) {
    const c = cv(w, h), x = c.getContext('2d'), R = rng(seed);
    const ph = [R() * 6, R() * 6, R() * 6];
    x.fillStyle = '#ffffff';
    for (let i = 0; i <= w; i++) {
      let v = 0.5 + 0.22 * Math.sin(i / w * Math.PI * peaks + ph[0]) + 0.12 * Math.sin(i / w * Math.PI * peaks * 2.3 + ph[1]) + (jag || 0.06) * Math.sin(i / w * Math.PI * peaks * 5.1 + ph[2]) + (R() - 0.5) * rough;
      const top = Math.round(h - v * h * 0.95);
      x.fillRect(i, top, 1, h - top);
    }
    return c;
  }
  // silueta de ruinas (torres y almenas), como los castillos de Sendero
  function makeTowers(w, h, seed) {
    const c = cv(w, h), x = c.getContext('2d'), R = rng(seed);
    x.fillStyle = '#ffffff';
    let px = 4;
    while (px < w) {
      const tw = 10 + Math.floor(R() * 10), th = 30 + Math.floor(R() * (h - 40));
      x.fillRect(px, h - th, tw, th);
      for (let k = 0; k < tw; k += 4) x.fillRect(px + k, h - th - 3, 2, 3);
      if (R() < 0.5) { x.beginPath(); x.moveTo(px - 1, h - th); x.lineTo(px + tw / 2, h - th - 10); x.lineTo(px + tw + 1, h - th); x.fill(); }
      const wallH = 14 + Math.floor(R() * 10);
      const gap = 10 + Math.floor(R() * 24);
      x.fillRect(px + tw, h - wallH, gap, wallH);
      for (let k = 0; k < gap; k += 4) x.fillRect(px + tw + k, h - wallH - 2, 2, 2);
      if (R() < 0.4) x.clearRect(px + tw + 3, h - wallH + 4, 3, 6);
      px += tw + gap;
    }
    // ventanas rotas
    for (let k = 0; k < 14; k++) x.clearRect(Math.floor(R() * w), h - 20 - Math.floor(R() * 40), 1, 2);
    return c;
  }
  function makeCloud(seed) {
    const R = rng(seed);
    const w = 28 + Math.floor(R() * 24), h = 12;
    const c = cv(w, h), x = c.getContext('2d');
    x.fillStyle = '#ffffff';
    const n = 4 + Math.floor(R() * 3);
    for (let k = 0; k < n; k++) {
      const cx = 4 + R() * (w - 8), cy = 6 + R() * 3, rr = 3 + R() * 4;
      for (let j = -rr; j <= rr; j++) for (let i = -rr * 1.4; i <= rr * 1.4; i++) if ((i * i) / 1.96 + j * j <= rr * rr) { const px = Math.round(cx + i), py = Math.round(cy + j); if (px >= 0 && px < w && py >= 0 && py < h) x.fillRect(px, py, 1, 1); }
    }
    return c;
  }
  // pared de cueva en paralaje
  function makeCaveWall(w, h, seed, th) {
    const c = cv(w, h), x = c.getContext('2d'), R = rng(seed);
    const cols = [th.near, th.far, mixHex(th.far, '#000000', 0.3)];
    x.fillStyle = cols[2]; x.fillRect(0, 0, w, h);
    for (let k = 0; k < 160; k++) {
      const cx = R() * w, cy = R() * h, r = 3 + R() * 9;
      x.fillStyle = cols[Math.floor(R() * 2)];
      for (let j = -r; j <= r; j++) { const ww = Math.round(Math.sqrt(r * r - j * j) * (1 + R() * 0.2)); x.fillRect(Math.round(cx - ww), Math.round(cy + j), ww * 2, 1); }
    }
    for (let k = 0; k < 40; k++) { x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(Math.floor(R() * w), Math.floor(R() * h), 1 + Math.floor(R() * 3), 6 + Math.floor(R() * 10)); }
    if (th.crystals) {
      for (let k = 0; k < 9; k++) {
        const cx = Math.floor(R() * w), cy = Math.floor(R() * h);
        x.fillStyle = th.crystals; x.fillRect(cx, cy - 3, 1, 4); x.fillRect(cx - 1, cy - 1, 3, 2);
        x.fillStyle = '#ffffff'; x.fillRect(cx, cy - 2, 1, 1);
      }
    }
    return c;
  }
  function makePines(w, h, seed, dense) {
    const c = cv(w, h), x = c.getContext('2d'), R = rng(seed);
    x.fillStyle = '#ffffff';
    const n = dense ? 16 : 11;
    for (let k = 0; k < n; k++) {
      const px = Math.floor(R() * (w + 20)) - 10, th = Math.floor(h * (0.45 + R() * 0.5)), base = h;
      for (let j = 0; j < th; j++) {
        const t = j / th, half = Math.round((1 - t) * (6 + th * 0.12) * (0.75 + 0.25 * ((j % 7) / 7)));
        x.fillRect(px - half, base - j, half * 2 + 1, 1);
      }
      x.fillRect(px - 1, base - 4, 3, 4);
    }
    x.fillRect(0, h - 6, w, 6);
    return c;
  }
  function makeCastleWall(w, h, seed, th) {
    const c = cv(w, h), x = c.getContext('2d'), R = rng(seed);
    const d0 = mixHex(th.far, '#000000', 0.35), d1 = th.far, d2 = mixHex(th.far, th.near, 0.5);
    x.fillStyle = d0; x.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 8) for (let i = -1; i < w / 16 + 1; i++) {
      const bx = i * 16 + ((y / 8) % 2 ? 8 : 0);
      x.fillStyle = R() < 0.3 ? d2 : d1; x.fillRect(bx + 1, y + 1, 14, 6);
    }
    // ventanales con luz de luna y columnas
    for (let k = 0; k < 2; k++) {
      const wx = 30 + k * 104 + Math.floor(R() * 10), wy = 40 + k * 120;
      x.fillStyle = '#0a0810'; x.fillRect(wx - 2, wy - 2, 24, 50);
      x.fillStyle = th.win || '#7aa0d0'; x.globalAlpha = 0.55; x.fillRect(wx, wy + 8, 20, 38);
      for (let j = 0; j < 8; j++) { const ww = Math.round(Math.sqrt(64 - (8 - j) * (8 - j)) * 1.25); x.fillRect(wx + 10 - ww, wy + j, ww * 2, 1); }
      x.globalAlpha = 1; x.fillStyle = '#0a0810'; x.fillRect(wx + 9, wy, 2, 46); x.fillRect(wx, wy + 24, 20, 2);
      x.globalAlpha = 0.12; x.fillStyle = th.win || '#7aa0d0'; x.beginPath(); x.moveTo(wx, wy + 46); x.lineTo(wx + 20, wy + 46); x.lineTo(wx + 44, wy + 110); x.lineTo(wx + 10, wy + 110); x.fill(); x.globalAlpha = 1;
    }
    for (let k = 0; k < 3; k++) { const cx = 10 + k * 86; x.fillStyle = mixHex(d0, '#000000', 0.3); x.fillRect(cx, 0, 8, h); x.fillStyle = d2; x.fillRect(cx + 1, 0, 1, h); }
    // estandartes rasgados
    for (let k = 0; k < 2; k++) { const bx = 70 + k * 90, by = 10 + k * 128; x.fillStyle = '#3a1428'; x.fillRect(bx, by, 12, 30); x.fillStyle = '#5a2040'; x.fillRect(bx + 1, by, 10, 28); x.clearRect(bx + 4, by + 26, 4, 4); x.fillStyle = '#8a7030'; x.fillRect(bx + 4, by + 8, 4, 4); }
    return c;
  }
  function makeIslands(w, h, seed) {
    const c = cv(w, h), x = c.getContext('2d'), R = rng(seed);
    x.fillStyle = '#ffffff';
    for (let k = 0; k < 6; k++) {
      const cx = Math.floor(R() * w), cy = 10 + Math.floor(R() * (h - 30)), rw = 8 + Math.floor(R() * 16);
      for (let j = 0; j < rw; j++) { const ww = Math.round(rw * (1 - j / rw) ** 0.7); x.fillRect(cx - ww, cy + j, ww * 2, 1); }
      x.fillRect(cx - rw - 2, cy - 2, rw * 2 + 4, 3);
    }
    return c;
  }
  return { makePines, makeCastleWall, makeIslands, THEMES, buildLevelLayer, crumbleTex, makeRange, makeTowers, makeCloud, makeCaveWall, rng, mix, mixHex, cv };
})();
