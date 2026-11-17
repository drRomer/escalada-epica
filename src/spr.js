// ===== SPR: arma los sprites de texto (técnica Cumbre) en canvas, con cambio de paleta para capas y variantes =====
const SPR = (function () {
  const RAMPS = {
    cloakG: ['#2a6036', '#408448', '#62ac5c'], cloakU: ['#2a3e70', '#3c5896', '#567ebe'],
    robe: ['#40286a', '#5a3c8e', '#7c5ab6'], gold: ['#b08022', '#e0b040', '#ffe07a']
  };
  const CLOAKS = [
    { id: 'verde', name: 'CAPA DEL BOSQUE', ramp: 'cloakG', need: 0 },
    { id: 'azul', name: 'CAPA DEL RÍO', ramp: 'cloakU', need: 30 },
    { id: 'purpura', name: 'CAPA DEL MAGO', ramp: 'robe', need: 75 },
    { id: 'dorada', name: 'CAPA DEL ORBE', ramp: 'gold', need: 120 }
  ].map(c => Object.assign(c, { cols: RAMPS[c.ramp] }));
  // filas con RLE ("K3a5"): se expanden una vez
  function rows(s) {
    if (s._r) return s._r;
    s._r = s.r.map(r => /\d/.test(r) ? r.replace(/(\D)(\d+)/g, (m, ch, n) => ch.repeat(+n)) : r);
    return s._r;
  }
  function make(name, palOverride, palName) {
    const s = SPRITES[name];
    if (!s) throw new Error('sprite ' + name);
    const pal = Object.assign({}, SPRITES.pal[palName || s.p], palOverride || {});
    const rr = rows(s), h = rr.length, w = rr[0].length;
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d');
    for (let r = 0; r < h; r++) for (let i = 0; i < w; i++) { const ch = rr[r][i]; if (ch !== '.') { x.fillStyle = pal[ch] || '#ff00ff'; x.fillRect(i, r, 1, 1); } }
    return c;
  }
  function flip(src) { const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; const x = c.getContext('2d'); x.translate(src.width, 0); x.scale(-1, 1); x.drawImage(src, 0, 0); return c; }
  const pair = img => [img, flip(img)];
  const heroCache = {};
  function hero(ci) {
    if (heroCache[ci]) return heroCache[ci];
    const r = CLOAKS[ci].cols, o = { d: r[0], c: r[1], C: r[2] };
    const m = n => pair(make('hero_' + n, o));
    heroCache[ci] = {
      idle: [m('idle0'), m('idle1')], run: [m('run0'), m('run1'), m('run2'), m('run3')],
      jump: m('jump0'), fall: m('fall0'), climb: [m('climb0'), m('climb1')], rope: [m('rope0'), m('rope1')], slide: m('slide0')
    };
    return heroCache[ci];
  }
  // esqueleto arquero: el goblin con paleta de hueso (provisorio hasta su hoja de Gemini)
  const SKEL = { a: '#8a8478', b: '#c8c2ae', c: '#e8e2d0', e: '#1e1a22', f: '#322c36', g: '#4a4048', h: '#5e5048', i: '#ff4a3a' };
  // runas de cada jefe (cambio de paleta del cristal)
  const RUNES = {
    luz: { a: '#1a3a0a', d: '#7ad65a', f: '#c8f07a', h: '#f4ffd0' },
    fuego: { a: '#3a0a06', d: '#c8301a', f: '#fa6a0a', h: '#ffd541' },
    escarcha: {},
    sol: { a: '#3a2206', d: '#e0a020', f: '#ffd541', h: '#fff4c0' },
    alma: { a: '#0e1a3a', d: '#4a6aff', f: '#9ab4ff', h: '#e0e8ff' }
  };
  let base = null;
  function load() {
    if (base) return base;
    const fr = (pre, n) => [0, 1, 2, 3].slice(0, n).map(f => make(pre + f));
    base = {
      imp: fr('imp', 4), impDead: make('impDead'),
      goblin: [0, 1].map(f => pair(make('goblin' + f))), goblinAim: pair(make('goblinAim')), goblinShot: pair(make('goblinShot')), goblinDead: pair(make('goblinDead')),
      skel: [pair(make('skel0')), pair(make('skel0'))], skelAim: pair(make('skelAim')), skelShot: pair(make('skelShot')), skelDead: pair(make('skelDead')),
      gem: [0, 1, 2].map(f => make('gem' + f)), gemG: [0, 1, 2].map(f => make('gemG' + f)), potion: make('potion'),
      banner: [0, 1, 2].map(f => make('banner' + f)),
      anchor: [make('anchor0'), make('anchor1')], rune: {},
      // voladores por etapa: [cuadros], muerto
      fly: {
        bat: { f: fr('bat', 4).map(pair), dead: pair(make('batDead')) },
        batT: { f: [0, 1, 2, 3].map(k => pair(make('bat' + k, null, 'batT'))), dead: pair(make('batDead', null, 'batT')) },
        icebat: { f: fr('ibat', 4).map(pair), dead: pair(make('ibatDead')) },
        squirrel: { f: fr('sq', 4).map(pair), dead: pair(make('sqDead')) },
        firesq: { f: fr('fsq', 4).map(pair), dead: pair(make('fsqDead')) },
        moth: { f: fr('moth', 4).map(pair), dead: pair(make('mothDead')) },
        imp: null
      },
      ghost: fr('ghost', 4), ghostDead: make('ghostDead'), wisp: fr('wisp', 4), wispDead: make('wispDead'),
      ape: {}
    };
    base.fly.imp = { f: base.imp.map(pair), dead: pair(base.impDead) };
    for (const k of ['luz', 'fuego', 'escarcha', 'alma']) base.rune[k] = [make('rune_' + k + '0'), make('rune_' + k + '1')];
    base.rune.sol = [make('rune_luz0', null, 'runeSol'), make('rune_luz1')];
    for (const [k, p] of [['N', 'ape'], ['F', 'apeF'], ['V', 'apeV']]) {
      const m = n => pair(make(n, null, p));
      base.ape[k] = { idle: [m('ape0'), m('ape1')], aim: m('apeAim'), shot: m('apeShot'), dead: m('apeDead') };
    }
    return base;
  }
  const bossCache = {};
  function boss(id) {
    id = id || 'golem';
    if (bossCache[id]) return bossCache[id];
    const has = n => !!SPRITES[id + '_' + n];
    const g = n => make(id + '_' + n);
    const o = { idle: [g('idle0')], throw: g('throw'), slamUp: g('slamUp'), slamDown: g('slamDown'), beam: g('beam'), stone: g('stone') };
    if (has('idle1') && id !== 'espectro') o.idle.push(g('idle1'));
    if (id === 'espectro') o.swoop = g('idle1');
    o.roar = has('roar') ? g('roar') : o.slamUp;
    bossCache[id] = o;
    return o;
  }
  return { CLOAKS, hero, load, boss, make, pair };
})();
