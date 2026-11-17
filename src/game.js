// ===== JUEGO: Cuentos del Medioevo · Escalada Épica =====
(function () {
  const T = CORE.T, PW = CORE.PW, PH = CORE.PH, K = CORE.K;
  const VW = 192;
  let VH = 320;
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  // ---------- las 5 etapas ----------
  const STAGES = [
    { name: 'EL BOSQUE DE LA MONTAÑA', short: 'EL BOSQUE', boss: 'ent', bossName: 'SPRIGGAN CORRUPTO', bcol: '#a8ff5a', rune: 'luz', runeName: 'RUNAS DE LUZ', alt: [600, 1500], scene: 'bosque', grad: ['#d8ff9a', '#4e9a3a'],
      story: ['El Carcelero de Almas descendió sobre el valle y se llevó las almas de tu pueblo a la cima del Monte Sagrado.', 'Solo tú, arquera del bosque, puedes escalar hasta allí.', 'Pero el bosque de la montaña está enfermo: su guardián, un spriggan antiguo, fue corrompido para cerrarte el paso.'],
      end: 'La luz de las runas purificó al Spriggan. Agradecido, te abrió el camino hacia las cumbres nevadas.' },
    { name: 'LAS CUMBRES NEVADAS', short: 'LAS CUMBRES', boss: 'yeti', bossName: 'BESTIA DE LAS NIEVES', bcol: '#bff4ff', rune: 'fuego', runeName: 'RUNAS DE FUEGO', alt: [1500, 3000], scene: 'nieve', grad: ['#ffffff', '#6ab0e0'],
      story: ['Más arriba, la nieve lo cubre todo y el viento corta como un cuchillo.', 'Simios de las nieves lanzan bolas de hielo a quien se acerca, y una bestia antigua guarda el paso de la cumbre.'],
      end: 'Las runas de fuego derrotaron a la Bestia de las Nieves. Pero el aire se vuelve tibio: el volcán despertó y está derritiendo la nieve.' },
    { name: 'EL VOLCÁN', short: 'EL VOLCÁN', boss: 'golem', bossName: 'GÓLEM DE LAVA', bcol: '#fa6a0a', rune: 'escarcha', runeName: 'RUNAS DE ESCARCHA', alt: [3000, 3900], scene: 'magma', grad: ['#ffe07a', '#e0702a'],
      story: ['El calor del volcán derritió los glaciares y la montaña se llenó de ríos de magma.', 'En el cráter, un gólem nacido de la furia del Carcelero vigila la subida.'],
      end: 'El Gólem de Lava quedó convertido en piedra. Sobre el cráter apagado se alza una torre que antes no estaba ahí...' },
    { name: 'LA TORRE FANTASMA', short: 'LA TORRE', boss: 'espectro', bossName: 'FANTASMA DE LA TORRE', bcol: '#9ab4ff', rune: 'sol', runeName: 'RUNAS SOLARES', alt: [3900, 4400], scene: 'almenas', grad: ['#e0e8ff', '#7a6ab0'],
      story: ['La Torre Fantasma flota entre la niebla, sobre el cráter apagado.', 'Sus pasillos están llenos de esqueletos, sierras y espíritus. En lo alto espera un espectro encapuchado.'],
      end: 'La luz de las runas solares disolvió al Fantasma de la Torre. Desde la cima, una escalera de luz sube hacia el cielo.' },
    { name: 'EL ASCENSO ESPIRITUAL', short: 'EL ASCENSO', boss: 'carcelero', bossName: 'CARCELERO DE ALMAS', bcol: '#ffe07a', rune: 'alma', runeName: 'CADENAS DE ALMA', alt: [4400, 5600], scene: 'astral4', grad: ['#ffffff', '#e0b060'],
      story: ['Comienza el ascenso al plano espiritual.', 'La noche se aclara con cada paso, hasta la luz eterna donde el Carcelero guarda las almas de tu pueblo.'],
      end: 'Las cadenas se rompieron. Las almas del pueblo vuelven a casa como luciérnagas, y la arquera desciende del Monte Sagrado convertida en leyenda.' }
  ];
  const stageOf = i => Math.floor(i / 10);
  const ALT = LEVELS.map((d, i) => { const st = STAGES[stageOf(i)], k = i % 10, a = st.alt, step = (a[1] - a[0]) / 10; return [Math.round(a[0] + k * step), Math.round(a[0] + (k + 1) * step)]; });
  // música de cada tema
  const SONG = { pradera: 'faldas', ruinas: 'ruinas', bosque: 'bosque', corrupto: 'corrupto', claro: 'corrupto', nieve: 'nieve', glaciar: 'cueva', ventisca: 'ventisca', cumbre: 'ventisca',
    faldas: 'riscos', riscos: 'riscos', magma: 'magma', cueva: 'cueva', nido: 'nido', chimenea: 'chimenea', ceniza: 'ceniza', crater: 'ceniza',
    torre: 'torre', cripta: 'cripta', almenas: 'almenas', campanario: 'almenas' };
  const songFor = th => SONG[th] || (th.startsWith('astral') ? (+th.slice(6) < 5 ? 'astral' : 'astral2') : 'faldas');
  const COL = { ink: '#120a14', cream: '#fff2d8', gold: '#f2c230', red: '#e84a4a', ember: '#fa6a0a', sky: '#8fd8ff', dim: '#a898c0', green: '#7ad65a', panel: 'rgba(18,10,20,0.9)', wood: '#c8964e', rune: '#7ef3ff' };

  // ---------- guardado ----------
  const SAVE_KEY = 'escalada_epica_v2';
  let save = { unlocked: 1, best: {}, muted: false, cloak: 0, story: {} };
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (s) save = Object.assign(save, s);
    else { const o = JSON.parse(localStorage.getItem('escalada_epica_v1') || 'null'); if (o) { save.muted = !!o.muted; save.cloak = 0; } }
  } catch (e) { }
  // MODO REVISIÓN: todos los niveles abiertos en la vista previa. En la web publicada (web.js define EE_WEB) se juega en orden.
  const REVISION = !window.EE_WEB;
  let realUnlocked = save.unlocked || 1;
  if (REVISION) save.unlocked = LEVELS.length;
  function nextLevel() { const n = Math.min(save.unlocked, LEVELS.length); for (let i = 0; i < n; i++) if (!save.best[i]) return i; return n - 1; }
  const saveHooks = [];
  function writeSave() {
    try { const o = Object.assign({}, save); if (REVISION) o.unlocked = realUnlocked; localStorage.setItem(SAVE_KEY, JSON.stringify(o)); } catch (e) { }
    for (const f of saveHooks) try { f(); } catch (e) { }
  }
  const LINK_KEY = 'escalada_epica_nube';
  const intIn = (v, a, b) => Number.isInteger(v) && v >= a && v <= b;
  function cleanProgress(p) {
    p = p || {}; const o = { unlocked: intIn(p.unlocked, 1, LEVELS.length) ? p.unlocked : 1, best: {}, cloak: intIn(p.cloak, 0, 3) ? p.cloak : 0, story: {}, bossDone: {}, seenCloak: {}, hearts: p.hearts ? 1 : 0, lev: p.lev ? 1 : 0 };
    for (const k in (p.best || {})) { const b = p.best[k], i = +k; if (intIn(i, 0, LEVELS.length - 1) && b && typeof b === 'object') o.best[i] = { time: Math.max(0, Math.round((+b.time || 0) * 10) / 10), falls: intIn(b.falls, 0, 99999) ? b.falls : 0, gems: intIn(b.gems, 0, 3) ? b.gems : 0 }; }
    for (const k in (p.story || {})) if (intIn(+k, 0, 4)) o.story[+k] = 1;
    for (const k in (p.bossDone || {})) if (/^[a-z]{3,10}$/.test(k)) o.bossDone[k] = 1;
    for (const k in (p.seenCloak || {})) if (/^[a-z]{3,10}$/.test(k)) o.seenCloak[k] = 1;
    return o;
  }
  window.EE = {
    progress: () => Object.assign(cleanProgress(Object.assign({}, save, { unlocked: REVISION ? realUnlocked : save.unlocked })), { pt: Math.floor(save.pt || 0) }),
    clean: cleanProgress,
    rank: p => [Object.keys((p && p.best) || {}).length, Object.values((p && p.best) || {}).reduce((n, b) => n + (b.gems || 0), 0), (p && p.unlocked) || 1],
    cmpRank: (a, b) => { for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1; return 0; },
    apply: (d, pt) => { const c = cleanProgress(d); Object.assign(save, c, { pt: +pt || 0 }); realUnlocked = c.unlocked; if (REVISION) save.unlocked = LEVELS.length; hero = SPR.hero(save.cloak || 0); try { const o = Object.assign({}, save, { unlocked: realUnlocked }); localStorage.setItem(SAVE_KEY, JSON.stringify(o)); } catch (e) { } },
    linked: () => { try { return JSON.parse(localStorage.getItem(LINK_KEY) || 'null'); } catch (e) { return null; } },
    setLinked: (uid, base) => { try { localStorage.setItem(LINK_KEY, JSON.stringify({ uid, base })); } catch (e) { } },
    inMenu: () => state !== 'play' && state !== 'pause',
    onChange: f => saveHooks.push(f),
    toast: (msg, ms) => { toastMsg = String(msg); toastT = (ms || 2600) / 1000; }
  };
  let toastMsg = '', toastT = 0;
  function totalGems() { let n = 0; for (const k in save.best) n += save.best[k].gems || 0; return n; }
  AUDIO.setMuted(!!save.muted);

  // ---------- entrada ----------
  const keys = {};
  const touch = { left: false, right: false, up: false, down: false, jump: false, grab: false, diag: 0 };
  let keyDiag = 0;
  const edge = { jump: false, up: false, down: false, left: false, right: false, ok: false, back: false, pause: false };
  let lastDevice = 'kb', touchMode = false;
  const KM = {
    left: ['ArrowLeft', 'KeyA'], right: ['ArrowRight', 'KeyD'], up: ['ArrowUp', 'KeyW'], down: ['ArrowDown', 'KeyS'],
    jump: ['Space', 'KeyZ', 'KeyK', 'KeyC'], grab: ['ShiftLeft', 'ShiftRight', 'KeyX', 'KeyJ', 'KeyL']
  };
  function held(a) { return KM[a].some(k => keys[k]); }
  window.addEventListener('keydown', e => {
    AUDIO.init();
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) e.preventDefault();
    lastDevice = 'kb';
    if (!e.repeat) {
      if (KM.jump.includes(e.code)) edge.jump = true;
      if (KM.up.includes(e.code)) edge.up = true;
      if (KM.down.includes(e.code)) edge.down = true;
      if (KM.left.includes(e.code)) edge.left = true;
      if (KM.right.includes(e.code)) edge.right = true;
      if ((e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyZ') && !cloudLoginGesture()) edge.ok = true;
      if (e.code === 'Escape' || e.code === 'Backspace' || e.code === 'KeyX') edge.back = true;
      if (e.code === 'Escape' || e.code === 'KeyP') edge.pause = true;
      if (e.code === 'KeyQ') { edge.jump = true; keyDiag = -1; }
      if (e.code === 'KeyE') { edge.jump = true; keyDiag = 1; }
      if (e.code === 'KeyM') toggleMute();
      if (e.code === 'KeyR' && state === 'play') restartLevel();
    }
    keys[e.code] = true;
  });
  window.addEventListener('keyup', e => { keys[e.code] = false; if ((e.code === 'KeyQ' && keyDiag < 0) || (e.code === 'KeyE' && keyDiag > 0)) keyDiag = 0; });
  window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; if (state === 'play') openPause(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && state === 'play') openPause(); });

  const padPrev = {};
  function readPad() {
    const gps = navigator.getGamepads ? navigator.getGamepads() : [];
    let g = null; for (const p of gps) if (p && p.connected) { g = p; break; }
    if (!g) return null;
    const b = i => !!(g.buttons[i] && g.buttons[i].pressed);
    const ax = g.axes[0] || 0, ay = g.axes[1] || 0;
    const s = { left: b(14) || ax < -0.4, right: b(15) || ax > 0.4, up: b(12) || ay < -0.4, down: b(13) || ay > 0.4, jump: b(0) || b(3), grab: b(1) || b(2) || b(5) || b(7) || b(4) || b(6), start: b(9), back: b(1) };
    let any = false;
    for (const k of ['left', 'right', 'up', 'down', 'jump', 'grab', 'start']) {
      if (s[k] && !padPrev[k]) {
        any = true;
        if (k === 'jump') { edge.jump = true; edge.ok = true; }
        if (k === 'up') edge.up = true; if (k === 'down') edge.down = true; if (k === 'left') edge.left = true; if (k === 'right') edge.right = true;
        if (k === 'start') edge.pause = true;
      }
      padPrev[k] = s[k];
    }
    if (s.back && !padPrev.back2) edge.back = true;
    padPrev.back2 = s.back;
    if (any) { lastDevice = 'pad'; AUDIO.init(); }
    return s;
  }
  function setupTouch() {
    const dpad = document.getElementById('dpad');
    const pts = new Map();
    function upd() {
      const r = dpad.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      let l = false, rr = false, u = false, d = false;
      for (const p of pts.values()) {
        const dx = (p.x - cx) / (r.width / 2), dy = (p.y - cy) / (r.height / 2);
        if (Math.hypot(dx, dy) < 0.16) continue;
        const ang = Math.atan2(dy, dx) * 180 / Math.PI;
        if (ang > -67.5 && ang < 67.5) rr = true;
        if (ang > 112.5 || ang < -112.5) l = true;
        if (ang > 22.5 && ang < 157.5) d = true;
        if (ang < -22.5 && ang > -157.5) u = true;
      }
      if (u && !touch.up) edge.up = true; if (d && !touch.down) edge.down = true;
      if (l && !touch.left) edge.left = true; if (rr && !touch.right) edge.right = true;
      touch.left = l; touch.right = rr; touch.up = u; touch.down = d;
      dpad.classList.toggle('L', l); dpad.classList.toggle('R', rr); dpad.classList.toggle('U', u); dpad.classList.toggle('D', d);
    }
    const down = e => { e.preventDefault(); AUDIO.init(); lastDevice = 'touch'; try { dpad.setPointerCapture(e.pointerId); } catch (er) { } pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); upd(); };
    const move = e => { if (pts.has(e.pointerId)) { e.preventDefault(); pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); upd(); } };
    const up = e => { pts.delete(e.pointerId); upd(); };
    const releasers = [() => { pts.clear(); upd(); }];
    // red de seguridad: si el navegador pierde un "soltar" (popup, notificación, gesto del sistema), se libera todo
    const releaseAll = () => { for (const f of releasers) f(); };
    const dropPointer = e => { if (pts.delete(e.pointerId)) upd(); for (const f of releasers.slice(1)) f(e.pointerId); };
    window.addEventListener('pointerup', dropPointer, true); window.addEventListener('pointercancel', dropPointer, true);
    window.addEventListener('touchend', e => { if (!e.touches || e.touches.length === 0) releaseAll(); }, true);
    window.addEventListener('touchcancel', e => { if (!e.touches || e.touches.length === 0) releaseAll(); }, true);
    window.addEventListener('blur', releaseAll); window.addEventListener('pagehide', releaseAll);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') releaseAll(); });
    dpad.addEventListener('pointerdown', down); dpad.addEventListener('pointermove', move);
    dpad.addEventListener('pointerup', up); dpad.addEventListener('pointercancel', up); dpad.addEventListener('lostpointercapture', up);
    function btn(id, name, onPress) {
      const el = document.getElementById(id);
      const ids = new Set();
      const set = () => { const v = ids.size > 0; if (v && !touch[name]) { onPress && onPress(); } touch[name] = v; el.classList.toggle('on', v); };
      el.addEventListener('pointerdown', e => { e.preventDefault(); AUDIO.init(); lastDevice = 'touch'; try { el.setPointerCapture(e.pointerId); } catch (er) { } ids.add(e.pointerId); set(); });
      const rel = e => { ids.delete(e.pointerId); set(); };
      el.addEventListener('pointerup', rel); el.addEventListener('pointercancel', rel); el.addEventListener('lostpointercapture', rel);
      releasers.push(pid => { if (pid === undefined) ids.clear(); else ids.delete(pid); set(); });
    }
    // tres botones de salto: ↖ ↑ ↗ (los diagonales mantienen la dirección mientras se presionan)
    const jb = (id, d) => {
      const el = document.getElementById(id), ids = new Set();
      const set = () => { const v = ids.size > 0; el.classList.toggle('on', v); touch.jump = ['bL', 'bU', 'bR'].some(k => document.getElementById(k).classList.contains('on')); if (v) touch.diag = d; else if (touch.diag === d) touch.diag = 0; };
      el.addEventListener('pointerdown', e => { e.preventDefault(); AUDIO.init(); lastDevice = 'touch'; try { el.setPointerCapture(e.pointerId); } catch (er) { } ids.add(e.pointerId); edge.jump = true; edge.ok = true; if (d < 0) edge.left = true; if (d > 0) edge.right = true; set(); });
      const rel = e => { ids.delete(e.pointerId); set(); };
      el.addEventListener('pointerup', e => { rel(e); cloudLoginGesture(); }); el.addEventListener('pointercancel', rel); el.addEventListener('lostpointercapture', rel);
      releasers.push(pid => { if (pid === undefined) ids.clear(); else ids.delete(pid); set(); });
    };
    jb('bL', -1); jb('bU', 0); jb('bR', 1);
    document.getElementById('mPause').addEventListener('pointerdown', e => { e.preventDefault(); AUDIO.init(); if (state === 'play') openPause(); else if (state === 'pause') closePause(); else edge.back = true; });
    document.getElementById('mMute').addEventListener('pointerdown', e => { e.preventDefault(); AUDIO.init(); toggleMute(); });
  }
  function enableTouch() { if (touchMode) return; touchMode = true; lastDevice = 'touch'; layout(); }
  window.addEventListener('touchstart', () => { AUDIO.init(); enableTouch(); }, { passive: true });
  if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) touchMode = true;

  let hits = [];
  // Safari (iPhone) solo abre la ventana de Google si se pide al SOLTAR el dedo, en un clic o al pulsar una tecla
  function cloudLoginGesture() {
    if (state !== 'cloud' || confirmQ || !window.EE_CLOUD || EE_CLOUD.user()) return false;
    if (cloudItems()[menuIdx] !== 'CONECTAR CON GOOGLE') return false;
    AUDIO.sfx('select'); EE_CLOUD.login(); return true;
  }
  canvas.addEventListener('pointerup', e => {
    if (state !== 'cloud') return;
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width * VW, y = (e.clientY - r.top) / r.height * VH;
    for (const h of hits) if (h.login && x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) { menuIdx = h.login - 1; cloudLoginGesture(); return; }
  });
  canvas.addEventListener('pointerdown', e => {
    AUDIO.init();
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width * VW, y = (e.clientY - r.top) / r.height * VH;
    if (e.pointerType === 'touch') { lastDevice = 'touch'; enableTouch(); }
    for (let i = hits.length - 1; i >= 0; i--) { const h = hits[i]; if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) { if (!h.login) h.fn(); return; } }
  });
  function input() {
    const g = readPad() || {};
    const dg = touch.diag || keyDiag;
    const o = {
      left: (held('left') || touch.left || !!g.left || dg < 0) && !(dg > 0), right: (held('right') || touch.right || !!g.right || dg > 0) && !(dg < 0),
      up: held('up') || touch.up || !!g.up, down: held('down') || touch.down || !!g.down,
      jump: held('jump') || touch.jump || keyDiag !== 0 || !!g.jump, grab: held('grab') || !!g.grab,
      jumpPressed: edge.jump
    };
    const m = { up: edge.up, down: edge.down, left: edge.left, right: edge.right, ok: edge.ok, back: edge.back, pause: edge.pause };
    for (const k in edge) edge[k] = false;
    return [o, m];
  }

  // ---------- layout ----------
  function layout() {
    const safeTop = parseFloat(getComputedStyle(document.body).paddingTop) || 0;
    const vw = window.innerWidth, vh = window.innerHeight - safeTop;
    const pad = document.getElementById('pad');
    const land = touchMode && vw > vh * 1.05;
    document.body.classList.toggle('land', land);
    document.body.classList.toggle('touch', touchMode);
    let padH = 0;
    if (touchMode) {
      pad.style.display = 'flex';
      if (!land) { padH = Math.round(Math.min(Math.max(vh * 0.3, 180), 250)); pad.style.height = padH + 'px'; }
      else pad.style.height = '';
    } else pad.style.display = 'none';
    const aw = vw, ah = vh - padH;
    if (touchMode && !land) VH = Math.max(250, Math.min(380, Math.round(VW * ah / aw)));
    else VH = 320;
    canvas.width = VW; canvas.height = VH;
    let s = Math.min(aw / VW, ah / VH);
    const fs = Math.floor(s); if (fs >= 2 && fs / s > 0.82) s = fs;
    canvas.style.width = Math.floor(VW * s) + 'px'; canvas.style.height = Math.floor(VH * s) + 'px';
    ctx.imageSmoothingEnabled = false;
    fx = makeFx();
  }
  window.addEventListener('resize', layout);

  // ---------- estado ----------
  let state = 'title', menuIdx = 0;
  let li = 0, L = null, layer = null, theme = 'faldas', player = null, crTex = {}, hero = null;
  let E = null, anchor = null, clips = [];
  let cam = 0, time = 0, falls = 0, got = 0;
  let deathT = 0, catchT = 0, fadeT = 0, introT = 0, clearT = 0, shakeT = 0, shakeA = 2;
  let parts = [], pops = [], fx = [];
  let windT = 0, windVal = 0, windPhase = 'calm', windDir = 1;
  let hintA = 0, hintShown = -1;
  let animT = 0, climbAnim = 0, runAnim = 0, stepT = 0, blinkT = 0;
  let clearInfo = null, bg = null, titleBg = null, flashT = 0, boltT = 5;
  let runStats = { time: 0, falls: 0, gems: 0 };
  let lavaY = 1e9, lavaHold = 0, B = null, freezeInput = 0;
  let hp = 1, invT = 0, heartMsgT = 0, powMsgT = 0;
  function hpMax() { return 1 + (save.hearts || 0); }
  let noHaz = false, sinceSpawn = 99, quickDeaths = 0, clockT = 0;
  let gradCache = {};
  const SP = SPR.load();
  hero = SPR.hero(save.cloak || 0);

  // ---------- utilidades de dibujo ----------
  function tintCache() { return { col: null, cv: null }; }
  function tinted(mask, color, cache) {
    if (cache.col === color && cache.cv) return cache.cv;
    const c = cache.cv || ART.cv(mask.width, mask.height), x = c.getContext('2d');
    x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, c.width, c.height);
    x.drawImage(mask, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = color; x.fillRect(0, 0, c.width, c.height);
    cache.col = color; cache.cv = c; return c;
  }
  function circle(cx, cy, r) { for (let y = -r; y <= r; y++) { const w = Math.round(Math.sqrt(r * r - y * y)); ctx.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2 + 1, 1); } }
  // texto con degradado dorado y contorno, como el logo de la saga
  function gradText(str, sc, top, bot) {
    const k = str + sc + top + bot;
    if (gradCache[k]) return gradCache[k];
    const w = FONT.measure(str) * sc + sc * 4, h = 10 * sc + sc * 4;
    const out = ART.cv(w, h), o = out.getContext('2d');
    FONT.draw(o, str, sc * 2, sc * 2 + 3 * sc, '#2a1206', { scale: sc, outline: '#2a1206' });
    const t = ART.cv(w, h), x = t.getContext('2d');
    FONT.draw(x, str, sc * 2, sc * 2 + 3 * sc, '#ffffff', { scale: sc });
    x.globalCompositeOperation = 'source-in';
    const g = x.createLinearGradient(0, sc * 2 + 3 * sc, 0, sc * 2 + 10 * sc);
    g.addColorStop(0, top); g.addColorStop(1, bot); x.fillStyle = g; x.fillRect(0, 0, w, h);
    o.drawImage(t, 0, 0);
    gradCache[k] = out; return out;
  }

  // ---------- fondos ----------
  function makeBg(themeName, seed) {
    const th = ART.THEMES[themeName];
    const R = ART.rng(seed + 99);
    const b = { th, far: ART.makeRange(VW, 140, seed, 0.05, 3, 0.1), near: ART.makeRange(VW, 120, seed + 7, 0.12, 2), clouds: [], stars: [], smoke: [],
      cFar: tintCache(), cNear: tintCache(), cCloud: tintCache(), cTow: tintCache() };
    if (th.towers) b.towers = ART.makeTowers(VW, 90, seed + 3);
    if (th.bg === 'cave') b.cave = ART.makeCaveWall(VW, 256, seed + 5, th);
    if (th.bg === 'castle') b.cave = ART.makeCastleWall(VW, 256, seed + 5, th);
    if (th.bg === 'forest') { b.pinesFar = ART.makePines(VW, 110, seed + 11, false); b.pinesNear = ART.makePines(VW, 90, seed + 17, true); b.cPF = tintCache(); b.cPN = tintCache(); }
    if (th.bg === 'astral') { b.isl = ART.makeIslands(VW, 200, seed + 21); b.cIsl = tintCache(); }
    for (let i = 0; i < (th.clouds || 0); i++) b.clouds.push({ img: ART.makeCloud(seed + i * 13), x: R() * 260, y: 20 + R() * 200, sp: 3 + R() * 6, par: 0.15 + R() * 0.2 });
    for (let i = 0; i < 60; i++) b.stars.push({ x: Math.floor(R() * VW), y: Math.floor(R() * 220), b: R() });
    for (let i = 0; i < (th.smoke || 0); i++) b.smoke.push({ x: 20 + R() * 150, r: 10 + R() * 12, sp: 4 + R() * 4, ph: R() * 200 });
    return b;
  }
  function drawBackdrop(b, t, scroll) {
    const th = b.th;
    for (let y = 0; y < VH; y += 3) { ctx.fillStyle = ART.mix(th.top, th.bot, y / VH); ctx.fillRect(0, y, VW, 3); }
    const starA = th.stars !== undefined ? th.stars : (th.top === '#0e0408' || th.top === '#1a060c' || th.top === '#2a0a10') ? 1 : 0;
    if (th.bg === 'castle') {
      const off = Math.floor(scroll * 0.4) % 256;
      for (let y = -off - 256; y < VH; y += 256) ctx.drawImage(b.cave, 0, y);
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(0, 0, VW, VH);
      return;
    }
    if (th.bg === 'cave') {
      const off = Math.floor(scroll * 0.45) % 256;
      ctx.globalAlpha = 0.85;
      for (let y = -off - 256; y < VH; y += 256) ctx.drawImage(b.cave, 0, y);
      ctx.globalAlpha = 1;
      if (th.lavaGlow) { for (let y = 0; y < 90; y += 3) { ctx.globalAlpha = (1 - y / 90) * (0.35 + 0.08 * Math.sin(animT * 3)); ctx.fillStyle = '#e8401a'; ctx.fillRect(0, VH - y - 3, VW, 3); } ctx.globalAlpha = 1; }
      return;
    }
    if (starA > 0) {
      for (const s of b.stars) { ctx.globalAlpha = starA * (0.25 + 0.45 * s.b * (0.5 + 0.5 * Math.sin(animT * 2 + s.b * 9))); ctx.fillStyle = th.bg === 'astral' ? '#ffffff' : '#ffe8d8'; ctx.fillRect(s.x, s.y, 1, 1); }
      ctx.globalAlpha = 1;
    }
    if (th.moon) { const mx = 150, my = 40; ctx.fillStyle = 'rgba(220,230,255,0.12)'; circle(mx, my, 17); ctx.fillStyle = '#e8ecff'; circle(mx, my, 11); ctx.fillStyle = '#c8d0ec'; circle(mx + 3, my - 2, 3); circle(mx - 4, my + 4, 2); }
    if (th.bg === 'astral') {
      // resplandor que crece con la luz y rayos que bajan
      const g = th.glowT || 0;
      ctx.globalAlpha = 0.18 + 0.3 * g; ctx.fillStyle = '#fff4d0'; circle(VW / 2, 10, 40 + g * 40); ctx.globalAlpha = 0.1 + 0.2 * g; circle(VW / 2, 10, 70 + g * 50); ctx.globalAlpha = 1;
      for (let k = 0; k < 4; k++) { const rx = 20 + k * 50 + Math.sin(animT * 0.3 + k) * 10; ctx.globalAlpha = 0.05 + 0.07 * g; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(rx, 0); ctx.lineTo(rx + 14, 0); ctx.lineTo(rx + 40, VH); ctx.lineTo(rx + 10, VH); ctx.fill(); }
      ctx.globalAlpha = 0.5; const iy = Math.round(-((scroll * 0.25) % 200));
      for (let y = iy; y < VH; y += 200) ctx.drawImage(tinted(b.isl, th.far, b.cIsl), Math.round(Math.sin(animT * 0.2) * 6), y);
      ctx.globalAlpha = 1;
      return;
    }
    // humo de fumarolas
    for (const s of b.smoke) {
      for (let k = 0; k < 6; k++) {
        const yy = VH - ((animT * s.sp * 3 + s.ph + k * 34) % (VH + 60)) + 20;
        ctx.globalAlpha = 0.07 + 0.05 * (k % 2); ctx.fillStyle = '#2a1e22';
        circle(s.x + Math.sin(animT * 0.5 + k) * 8 + k * 2, yy, s.r + k * 2);
      }
    }
    ctx.globalAlpha = 1;
    const farY = Math.round(VH - 125 + t * 60), nearY = Math.round(VH - 70 + t * 140);
    ctx.drawImage(tinted(b.far, th.far, b.cFar), 0, farY);
    if (b.towers) ctx.drawImage(tinted(b.towers, ART.mixHex(th.far, th.near, 0.55), b.cTow), 0, Math.round(VH - 95 + t * 100));
    for (const c of b.clouds) {
      const cx = ((c.x + animT * c.sp) % (VW + 70)) - 50, cy = Math.round(c.y + t * 200 * c.par) % (VH + 40) - 20;
      ctx.globalAlpha = 0.45; ctx.drawImage(tinted(c.img, ART.mixHex(th.bot, '#ffffff', 0.25), b.cCloud), Math.round(cx), cy); ctx.globalAlpha = 1;
    }
    if (b.pinesFar) { ctx.drawImage(tinted(b.pinesFar, ART.mixHex(th.far, th.near, 0.4), b.cPF), 0, Math.round(VH - 100 + t * 110)); }
    if (nearY < VH) ctx.drawImage(tinted(b.near, th.near, b.cNear), 0, nearY);
    if (b.pinesNear) { const py = Math.round(VH - 60 + t * 170); if (py < VH) ctx.drawImage(tinted(b.pinesNear, ART.mixHex(th.near, '#000000', 0.25), b.cPN), 0, py); }
    if (th.glow) { for (let y = 0; y < 60; y += 3) { ctx.globalAlpha = (1 - y / 60) * 0.3; ctx.fillStyle = '#e8401a'; ctx.fillRect(0, VH - y - 3, VW, 3); } ctx.globalAlpha = 1; }
    if (th.storm) {
      boltT -= 1 / 60;
      if (boltT <= 0) { boltT = 4 + Math.random() * 5; flashT = 0.18; b.bolt = { x: 20 + Math.random() * 150, seed: Math.random() * 1000 }; }
      if (flashT > 0 && b.bolt) {
        flashT -= 1 / 60;
        ctx.fillStyle = '#ffe8d0'; let x = b.bolt.x, y = 0; const R = ART.rng(b.bolt.seed);
        while (y < VH * 0.55) { ctx.fillRect(Math.round(x), y, 1, 3); y += 3; x += (R() - 0.5) * 6; }
        ctx.globalAlpha = flashT; ctx.fillRect(0, 0, VW, VH); ctx.globalAlpha = 1;
      }
    }
  }
  function makeFx() { const a = []; for (let i = 0; i < 50; i++) a.push({ x: Math.random() * VW, y: Math.random() * VH, s: 6 + Math.random() * 18, d: Math.random() * 6, z: Math.random() < 0.3 ? 2 : 1 }); return a; }
  function drawFx(dt) {
    const kind = ART.THEMES[theme].fx;
    if (!kind) return;
    const n = kind === 'ashstorm' || kind === 'snowstorm' ? 50 : kind === 'drip' ? 12 : kind === 'leaves' ? 14 : kind === 'dust' || kind === 'mist' ? 20 : 34;
    for (let i = 0; i < n; i++) {
      const f = fx[i];
      if (kind === 'leaves') {
        f.y += f.s * dt * 0.7; f.x += Math.sin(animT * 1.5 + f.d) * 14 * dt + 6 * dt;
        if (f.y > VH) { f.y = -2; f.x = Math.random() * VW; } if (f.x > VW) f.x -= VW;
        const flip = Math.floor(animT * 4 + f.d) % 2;
        ctx.fillStyle = ['#7ac04a', '#c8a03a', '#4a8a2a', '#d87a2a'][i % 4]; ctx.globalAlpha = 0.85; ctx.fillRect(Math.round(f.x), Math.round(f.y), flip ? 2 : 1, flip ? 1 : 2);
      } else if (kind === 'snow' || kind === 'snowstorm') {
        const w = kind === 'snowstorm' ? windVal * 0.35 + 30 : 6;
        f.y += f.s * dt * (f.z === 2 ? 1.1 : 0.7); f.x += (Math.sin(animT + f.d) * 8 + w) * dt;
        if (f.y > VH) { f.y = -2; f.x = Math.random() * VW; } if (f.x > VW) f.x -= VW; if (f.x < 0) f.x += VW;
        ctx.globalAlpha = f.z === 2 ? 0.95 : 0.6; ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(f.x), Math.round(f.y), f.z, f.z);
      } else if (kind === 'spores' || kind === 'motes' || kind === 'mist') {
        f.y -= f.s * dt * (kind === 'mist' ? 0.25 : 0.5); f.x += Math.sin(animT * 1.2 + f.d) * 6 * dt;
        if (f.y < -2) { f.y = VH + 2; f.x = Math.random() * VW; }
        ctx.globalAlpha = 0.35 + 0.35 * Math.sin(animT * 3 + f.d * 4);
        ctx.fillStyle = kind === 'spores' ? (i % 3 ? '#b07cff' : '#a8ff5a') : kind === 'mist' ? '#7ad0a0' : (i % 3 ? '#fff0b0' : '#ffffff');
        ctx.fillRect(Math.round(f.x), Math.round(f.y), 1, 1);
      } else if (kind === 'dust') {
        f.y += Math.sin(animT * 0.7 + f.d) * 4 * dt; f.x += (Math.cos(animT * 0.5 + f.d) * 4 + 2) * dt;
        if (f.x > VW) f.x -= VW;
        ctx.globalAlpha = 0.25 + 0.2 * Math.sin(animT * 2 + f.d * 3); ctx.fillStyle = '#c8c0d8'; ctx.fillRect(Math.round(f.x), Math.round(f.y), 1, 1);
      } else if (kind === 'embers') {
        f.y -= f.s * dt * 1.2; f.x += Math.sin(animT * 2 + f.d) * 8 * dt;
        if (f.y < -2) { f.y = VH + 2; f.x = Math.random() * VW; }
        ctx.fillStyle = (Math.floor(animT * 8 + f.d * 3) % 3) ? '#fa6a0a' : '#ffd541'; ctx.globalAlpha = 0.8; ctx.fillRect(Math.round(f.x), Math.round(f.y), 1, 1);
      } else if (kind === 'drip') {
        ctx.globalAlpha = 0.4 + 0.4 * Math.sin(animT * 2 + f.d * 5); ctx.fillStyle = '#b07cff'; ctx.fillRect(Math.round(f.x), Math.round(f.y), 1, 1);
      } else {
        const w = kind === 'ashstorm' ? windVal * 0.3 + 14 : 4;
        f.y += f.s * dt * (f.z === 2 ? 1.4 : 0.9); f.x += (Math.sin(animT + f.d) * 6 + w) * dt;
        if (f.y > VH) { f.y = -2; f.x = Math.random() * VW; } if (f.x > VW) f.x -= VW; if (f.x < 0) f.x += VW;
        ctx.globalAlpha = f.z === 2 ? 0.8 : 0.5; ctx.fillStyle = '#b8b0b0'; ctx.fillRect(Math.round(f.x), Math.round(f.y), f.z, f.z);
      }
    }
    ctx.globalAlpha = 1;
  }

  // ---------- niveles ----------
  // aspecto de los enemigos según la etapa
  const SKIN = [
    { fly: 'bat', swoop: 'squirrel', archer: 'goblin', ape: 'F', rock: 'pine', stal: 'wood', vent: 'spore', ghost: 'ghost', saw: 'iron' },
    { fly: 'icebat', swoop: 'icebat', archer: 'goblin', ape: 'N', rock: 'snow', stal: 'ice', vent: 'steam', ghost: 'ghost', saw: 'iron' },
    { fly: 'imp', swoop: 'firesq', archer: 'goblin', ape: 'V', rock: 'fire', stal: 'obs', vent: 'fire', ghost: 'ghost', saw: 'iron' },
    { fly: 'batT', swoop: 'batT', archer: 'skel', ape: 'V', rock: 'debris', stal: 'iron', vent: 'ghostfire', ghost: 'ghost', saw: 'iron' },
    { fly: 'moth', swoop: 'moth', archer: 'skel', ape: 'V', rock: 'light', stal: 'crystal', vent: 'light', ghost: 'wisp', saw: 'light' }
  ];
  let skin = SKIN[0];
  function startLevel(i) {
    li = i; const def = LEVELS[i];
    L = CORE.parseLevel(def); theme = def.theme; skin = SKIN[def.stage || 0];
    L.clock = 0;
    layer = ART.buildLevelLayer(L, theme);
    crTex = {};
    for (let r = 0; r < L.H; r++) for (let c = 0; c < L.W; c++) if (L.grid[r][c] === 'C') crTex[r * L.W + c] = ART.crumbleTex(theme, r * 7919 + c * 104729);
    E = {
      gems: L.e.crystals.map(o => Object.assign({ got: false }, o)),
      potions: L.e.chalk.map(o => Object.assign({ t: 0 }, o)),
      anchors: L.e.seguros.map(o => Object.assign({ clipped: false, ax: o.c * T + 6, ay: o.r * T + T - 15 }, o)),
      spawners: L.e.rocks.map(o => Object.assign({ t: 0.8 + ((o.c * 0.37 + o.r * 0.11) % 1) * 2.2 }, o)),
      rocks: [], arrows: [], balls: [], tele: [], beams: [], ice: [], lobs: [],
      stal: L.e.icicles.map(o => Object.assign({ st: 'hang', t: 0, y0: o.y, vy: 0, grow: 1 }, o)),
      imps: L.e.condors.map((o, k) => ({ x: o.x - 3, y0: o.y - 3, y: o.y - 3, dir: o.c < 8 ? 1 : -1, t: k * 1.7, alive: true })),
      swoops: L.e.swoops.map((o, k) => ({ hx: o.x + 6, hy: o.y + 6, x: o.x + 6, y: o.y + 6, st: 'idle', t: 1 + k * 0.6, vx: 0, vy: 0, dir: o.c < 8 ? 1 : -1, alive: true, deadT: 0, respT: 0 })),
      ghosts: L.e.ghosts.map((o, k) => ({ hx: o.x + 6, hy: o.y + 6, x: o.x + 6, y: o.y + 6, t: k * 1.3, alive: true, deadT: 0, respT: 0 })),
      saws: L.e.saws.map((o, k) => ({ x: o.x + 6, y: o.y + 6, dir: (o.c + k) % 2 ? 1 : -1, a: 0 })),
      lobbers: L.e.lobbers.map((o, k) => ({ x: o.x, y: o.y, c: o.c, t: 1.2 + k * 0.8, st: 'idle', dir: -1, alive: true, shotT: 0, deadT: 0 })),
      goblins: L.e.goblins.map((o, k) => ({ x: o.x, y: o.y, c: o.c, t: 1 + k * 0.7, st: 'idle', dir: -1, alive: true, shotT: 0, deadT: 0 })),
      vents: L.e.vents.map(o => Object.assign({ ph: ((o.c * 0.7 + o.r * 0.31) % 3.4), on: false }, o)),
      runes: L.e.runes.map(o => Object.assign({ used: false }, o)),
      signs: L.e.signs, flag: L.e.flag, flagOn: !def.boss, flagRise: def.boss ? 0 : 1,
      heart: L.e.hearts.length && !save.hearts ? Object.assign({ got: false }, L.e.hearts[0]) : null,
      power: L.e.powers.length && !save.lev ? Object.assign({ got: false }, L.e.powers[0]) : null
    };
    hp = hpMax(); invT = 0; heartMsgT = 0; powMsgT = 0;
    got = 0;
    const s = L.e.start;
    anchor = { x: s.x, y: s.y, ax: s.x + PW / 2, ay: s.y + PH - 2, start: true };
    clips = [anchor];
    player = CORE.newPlayer(s.x, s.y); player.lev = !!save.lev;
    hero = SPR.hero(save.cloak || 0);
    time = 0; falls = 0; parts = []; pops = []; deathT = 0; catchT = 0; fadeT = 0.4; shakeT = 0; freezeInput = 0;
    windT = 0; windVal = 0; windPhase = 'calm'; hintA = 0; hintShown = -1;
    lavaY = def.rise ? L.H * T + 30 : 1e9; lavaHold = def.rise ? def.rise.delay : 0;
    cam = clampCam(player.y + PH / 2 - VH * 0.6);
    bg = makeBg(theme, 1234 + i * 77);
    B = null;
    if (def.boss) setupBoss();
    introT = 2.4; state = 'play';
    AUDIO.play(songFor(theme));
  }
  function restartLevel() { startLevel(li); introT = 0; }
  function clampCam(y) { return Math.max(0, Math.min(L.H * T - VH, y)); }
  function altitude() { const a = ALT[li]; const tot = L.H * T; const h = (tot - (player.y + PH)) / (tot - T * 3); return Math.round(a[0] + (a[1] - a[0]) * Math.max(0, Math.min(1, h))); }
  function fmtAlt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' M'; }
  function fmtTime(t, dec) { const m = Math.floor(t / 60), s = Math.floor(t % 60), d = Math.floor((t * 10) % 10); return m + ':' + String(s).padStart(2, '0') + (dec ? '.' + d : ''); }
  function onScreen(y, m) { m = m || 20; return y > cam - m && y < cam + VH + m; }
  function shake(t, a) { shakeT = Math.max(shakeT, t); shakeA = a || 2; }

  // ---------- eventos del jugador ----------
  function onEv(n) {
    const p = player;
    if (n === 'jump') { AUDIO.sfx('jump'); dust(p.x + PW / 2, p.y + PH, 4); }
    else if (n === 'walljump') { AUDIO.sfx('walljump'); dust(p.x + (p.facing > 0 ? 0 : PW), p.y + PH / 2, 4); }
    else if (n === 'climbjump') AUDIO.sfx('climbjump');
    else if (n === 'hop') AUDIO.sfx('hop');
    else if (n === 'grab' || n === 'rope') AUDIO.sfx('grab');
    else if (n === 'lev') { AUDIO.sfx('lev'); burst(p.x + PW / 2, p.y + PH, ['#bff4ff', '#ffffff', '#7ef3ff'], 10, 40, -20); }
    else if (n === 'slip') { AUDIO.sfx('slip'); pop(p.x + PW / 2, p.y - 6, '¡SIN VIGOR!', COL.red); }
  }
  function touchCrumble(c, r) { const k = r * L.W + c; if (!L.crumble[k]) { L.crumble[k] = { st: 'shake', t: 0.55, gone: false }; AUDIO.sfx('shake'); } }
  function dust(x, y, n, col) {
    col = col || '#9a8a84';
    for (let i = 0; i < n; i++) parts.push({ x, y, vx: (Math.random() - 0.5) * 50, vy: -Math.random() * 30, life: 0.35 + Math.random() * 0.2, max: 0.5, c: col, s: 1, g: 60 });
  }
  function burst(x, y, cols, n, sp, g) {
    for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = sp * (0.4 + Math.random() * 0.8); parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - sp * 0.3, life: 0.5 + Math.random() * 0.5, max: 1, c: cols[i % cols.length], s: Math.random() < 0.3 ? 2 : 1, g: g === undefined ? 300 : g }); }
  }
  function pop(x, y, text, c) { pops.push({ x, y, text, c: c || COL.cream, life: 1.1 }); }
  function die() {
    if (deathT > 0 || catchT > 0) return;
    deathT = 0.8; falls++; shake(0.3, 3);
    if (sinceSpawn < 1.2) quickDeaths++; else quickDeaths = 0;
    if (quickDeaths >= 2 && clips.length > 1) { clips.pop(); anchor = clips[clips.length - 1]; quickDeaths = 0; }
    const cr = SPR.CLOAKS[save.cloak || 0].cols;
    burst(player.x + PW / 2, player.y + PH / 2, [cr[2], cr[1], '#946238', '#e8b07c', '#fa6a0a'], 22, 110);
    AUDIO.sfx('death');
  }
  function hurt() {
    if (deathT > 0 || catchT > 0) return true;
    if (invT > 0) return false;
    if (hp > 1) {
      hp--; invT = 1.6; shake(0.3, 3); AUDIO.sfx('hurt');
      const p = player;   // sin empujón: solo pierde el corazón y parpadea
      burst(p.x + PW / 2, p.y + 4, ['#ff4a5a', '#ffb0b8', '#ffffff'], 14, 70, 120);
      pop(p.x + PW / 2, p.y - 8, '-1 ♥', '#ff6a7a');
      return false;
    }
    die(); return true;
  }
  function ropeCatch() {
    if (deathT > 0 || catchT > 0) return;
    catchT = 0.65; falls++;
    player.vx *= 0.3; player.vy = Math.min(player.vy, 60);
    AUDIO.sfx('catch'); pop(player.x + PW / 2, player.y - 4, '¡CUERDA!', COL.rune);
  }
  function respawn() {
    player = CORE.newPlayer(anchor.x, anchor.y); player.lev = !!save.lev;
    player.facing = anchor.start ? 1 : (anchor.x < VW / 2 ? 1 : -1);
    L.crumble = {};
    E.rocks = []; E.arrows = []; E.balls = []; E.tele = []; E.beams = []; E.lobs = [];
    for (const w of E.swoops) if (w.alive) { w.st = 'idle'; w.x = w.hx; w.y = w.hy; w.t = 1.2; }
    for (const g of E.ghosts) { g.x = g.hx; g.y = g.hy; }
    for (const m of E.lobbers) { m.st = 'idle'; m.t = 1.5; }
    for (const v of E.stal) { v.st = 'hang'; v.y = v.y0; v.vy = 0; v.grow = 1; }
    for (const m of E.potions) m.t = 0;
    for (const s of E.spawners) s.t = Math.max(s.t, 1.2);
    for (const g of E.goblins) { g.st = 'idle'; g.t = 1.4; }
    if (L.def.rise) { lavaY = Math.max(lavaY, anchor.y + PH + 110); lavaHold = 1.5; }
    if (B) { B.grace = 1.8; if (B.st === 'fight') B.pose = 'idle'; }
    deathT = 0; catchT = 0; fadeT = 0.35; sinceSpawn = 0; hp = hpMax(); invT = 0;
    cam = clampCam(player.y + PH / 2 - VH * 0.6);
    burst(player.x + PW / 2, player.y + PH, [COL.rune, '#ffffff'], 8, 40, 40);
  }
  function levelClear() {
    state = 'clear'; clearT = 0; menuIdx = 0;
    const prev = save.best[li];
    let isRecord = false;
    if (!prev) { save.best[li] = { time, falls, gems: got }; isRecord = true; }
    else { if (time < prev.time) { prev.time = time; isRecord = true; } prev.falls = Math.min(prev.falls, falls); prev.gems = Math.max(prev.gems || 0, got); }
    if (li + 2 > save.unlocked) save.unlocked = Math.min(LEVELS.length, li + 2);
    realUnlocked = Math.max(realUnlocked, Math.min(LEVELS.length, li + 2));
    if (L.def.boss) { save.bossDone = save.bossDone || {}; save.bossDone[L.def.boss] = 1; }
    writeSave();
    runStats.time += time; runStats.falls += falls; runStats.gems += got;
    clearInfo = { time, falls, got, isRecord, boss: !!L.def.boss, last: li === LEVELS.length - 1, unlockedCloak: SPR.CLOAKS.find(c => c.need > 0 && totalGems() >= c.need && !(save.seenCloak || {})[c.id]) };
    if (clearInfo.unlockedCloak) { save.seenCloak = save.seenCloak || {}; save.seenCloak[clearInfo.unlockedCloak.id] = 1; writeSave(); }
    AUDIO.stop();
    AUDIO.sfx(clearInfo.boss ? 'summit' : 'win');
    const f = E.flag;
    for (let i = 0; i < 40; i++) parts.push({ x: f.x + 6, y: f.y, vx: (Math.random() - 0.5) * 160, vy: -60 - Math.random() * 120, life: 1.5 + Math.random(), max: 2.5, c: ['#e84a4a', '#f2c230', '#7ef3ff', '#b07cff', '#ffffff'][i % 5], s: 2, g: 140 });
  }

  // ---------- viento (ventisca de ceniza) ----------
  function updateWind(dt) {
    const W = L.def.wind;
    if (!W || noHaz) { windVal = 0; AUDIO.setWind(0); return; }
    windT += dt;
    const cyc = 6.6, ph = windT % cyc, n = Math.floor(windT / cyc);
    windDir = n % 2 === 0 ? 1 : -1;
    const prev = windPhase;
    windPhase = ph < 3.2 ? 'calm' : ph < 4.3 ? 'warn' : 'gust';
    if (prev !== 'gust' && windPhase === 'gust') AUDIO.sfx('gust');
    const target = windPhase === 'gust' ? windDir * W : 0;
    windVal += (target - windVal) * Math.min(1, dt * 5);
    AUDIO.setWind(Math.min(1, 0.12 + Math.abs(windVal) / W * 0.85 + (windPhase === 'warn' ? 0.15 : 0)));
    if (windPhase !== 'calm' && Math.random() < (windPhase === 'gust' ? 0.9 : 0.3))
      parts.push({ x: windDir > 0 ? -4 : VW + 4, y: cam + Math.random() * VH, vx: windDir * (180 + Math.random() * 120), vy: (Math.random() - 0.5) * 10, life: 1.4, max: 1.4, c: 'rgba(200,190,190,0.55)', s: 1, g: 0, streak: 6 + Math.random() * 8 });
  }

  // ---------- JEFES: un marco común con la configuración de cada uno ----------
  const BOSSES = {
    golem: { ball: ['#7a1a08', '#fa6a0a', '#ffd541'], beam: ['#c8301a', '#fa6a0a', '#ffd541', '#ffffff'], bw: 10, debris: 'fire', hurt: 'rgba(120,210,255,0.65)', runeFx: ['#bff4ff', '#6ad0ff', '#ffffff'],
      death: 'stone', defeat: '¡GÓLEM DERROTADO!', last: '¡CONGELADO!', rise: ['#ffd541', '#fa6a0a', '#c8301a'], shatter: ['#7a6e64', '#a39584', '#544b46', '#cbbca6'], sfx: 'freeze' },
    ent: { ball: ['#2a160a', '#6a4422', '#a8ff5a'], beam: ['#1e3a14', '#3e6a22', '#7ac04a', '#c8f07a'], bw: 8, debris: 'pine', hurt: 'rgba(210,255,150,0.6)', runeFx: ['#f4ffd0', '#a8ff5a', '#ffffff'],
      death: 'purify', defeat: '¡SPRIGGAN PURIFICADO!', last: '¡PURIFICADO!', rise: ['#a8ff5a', '#6a3a86', '#2e5a1e'], shatter: ['#7ac04a', '#a8ff5a', '#4e8a2a', '#fff4c0'], sfx: 'rune' },
    yeti: { ball: ['#5a6a8a', '#e4ecf6', '#ffffff'], beam: ['#6ab0e0', '#bff4ff', '#e0f8ff', '#ffffff'], bw: 14, debris: 'snow', hurt: 'rgba(255,150,60,0.6)', runeFx: ['#ffd541', '#fa6a0a', '#ffffff'],
      death: 'slump', defeat: '¡BESTIA DERROTADA!', last: '¡DERRETIDA!', rise: ['#ffffff', '#bff4ff', '#a8c0d8'], shatter: ['#ffffff', '#e4ecf6', '#bff4ff', '#a8c0d8'], sfx: 'vent' },
    espectro: { ball: ['#0e0a14', '#3a2a5a', '#9ab4ff'], beam: ['#2e2640', '#4a4660', '#8a88a8', '#c0c8e8'], bw: 12, debris: 'debris', hurt: 'rgba(255,230,120,0.65)', runeFx: ['#fff4c0', '#ffd541', '#ffffff'],
      death: 'dissolve', defeat: '¡FANTASMA DISUELTO!', last: '¡LUZ SOLAR!', rise: ['#bfe8ff', '#6a6888', '#1e1828'], shatter: ['#bfe8ff', '#ffffff', '#6ad0ff', '#9ab4ff'], float: 34, homing: 1, sfx: 'rune' },
    carcelero: { ball: ['#1a3a8a', '#6ad0ff', '#ffffff'], beam: ['#1a3a8a', '#6ad0ff', '#bff4ff', '#ffffff'], bw: 10, debris: 'light', hurt: 'rgba(120,160,255,0.6)', runeFx: ['#e0e8ff', '#4a6aff', '#ffffff'],
      death: 'shatter', defeat: '¡ALMAS LIBERADAS!', last: '¡CADENAS ROTAS!', rise: ['#9a94a6', '#bff4ff', '#6e687a'], shatter: ['#4e4858', '#9a94a6', '#bff4ff', '#6ad0ff'], float: 40, cage: 1, sfx: 'shatter' }
  };
  function setupBoss() {
    const id = L.def.boss, cfg = BOSSES[id], G = SPR.boss(id), st = STAGES[L.def.stage];
    // la última repisa = la fila bajo la runa más alta; el jefe flota de fondo, separado de ella
    let lr = L.H - 1; for (const u of L.e.runes) lr = Math.min(lr, u.r + 1);
    B = { id, cfg, G, base: lr * T - 30, ledge: lr * T, name: st.bossName, col: st.bcol, rune: st.rune, hp: 3, st: 'sleep', t: 0, atk: 2, pose: 'idle', poseT: 0, rise: 0, grace: 0, waist: lr * T + 5, x: VW / 2, hurtT: 0, dieT: 0, deadT: 0, last: '' };
  }
  function bossSpawnY(x) {
    let y = Math.max(B.waist + T + 1, cam - 14);
    let r = Math.floor(y / T); const c = Math.floor(x / T);
    while (r < L.H && (CORE.solid(L, c, r) || CORE.tile(L, c, r) === '=')) r++;
    return Math.max(y, r * T + 1);
  }
  function rayDown(x, y0, half) {
    for (let y = y0; y < L.H * T; y += 2) {
      for (const dx of [-half, 0, half]) { const c = Math.floor((x + dx) / T), r = Math.floor(y / T); if (CORE.solid(L, c, r) || CORE.tile(L, c, r) === '=') return y; }
    }
    return L.H * T;
  }
  function updateBoss(dt) {
    if (!B) return;
    const p = player, alive = deathT <= 0 && catchT <= 0, cfg = B.cfg;
    B.t += dt; B.poseT -= dt; if (B.poseT <= 0 && B.st === 'fight') B.pose = 'idle';
    if (cfg.float && (B.st === 'fight' || B.st === 'hurt')) B.x += (VW / 2 + Math.sin(B.t * 0.55) * cfg.float - B.x) * Math.min(1, dt * 2);
    if (B.st === 'sleep') {
      if (B.t > 0.6) { B.st = 'intro'; B.t = 0; freezeInput = 3.6; AUDIO.play(B.id === 'carcelero' ? 'jefe2' : 'jefe'); }
    } else if (B.st === 'intro') {
      if (B.t > 0.9 && B.rise === 0) { AUDIO.sfx('roar'); shake(1.6, 3); }
      if (B.t > 0.9) B.rise = Math.min(1, B.rise + dt / 1.6);
      if (Math.random() < 0.5) burst(B.x + (Math.random() - 0.5) * 80, B.base, cfg.rise, 2, 90, 300);
      if (B.t > 3.6) {
        B.st = 'fight'; B.atk = 1.6;
        pop(VW / 2, cam + VH * 0.4, cfg.cage ? '¡ROMPE LAS CADENAS!' : '¡A LAS RUNAS!', COL.rune);
        if (cfg.cage) { burst(player.x + PW / 2, player.y + PH / 2, ['#9ab4ff', '#e0e8ff', '#ffffff'], 30, 110, 100); AUDIO.sfx('shatter'); }
      }
    } else if (B.st === 'fight') {
      if (B.grace > 0) B.grace -= dt;
      B.atk -= dt;
      if (B.atk <= 0 && alive && B.grace <= 0) {
        const ph = 3 - B.hp;
        const pool = ph === 0 ? ['ball'] : ph === 1 ? ['ball', 'beam'] : ['ball', 'beam', 'slam'];
        let a = pool[Math.floor(Math.random() * pool.length)];
        if (a === B.last && pool.length > 1 && Math.random() < 0.6) a = pool[(pool.indexOf(a) + 1) % pool.length];
        B.last = a;
        const pcx = p.x + PW / 2;
        if (a === 'ball') {
          const n = 1 + ph;
          B.pose = 'throw'; B.poseT = 0.7; AUDIO.sfx('throw');
          for (let k = 0; k < n; k++) E.tele.push({ k: 'ball', x: Math.max(10, Math.min(VW - 10, pcx + (k ? (Math.random() - 0.5) * 70 : 0))), t: 0.8 + k * 0.28 });
        } else if (a === 'beam') {
          B.pose = 'beam'; B.poseT = 1.8;
          E.tele.push({ k: 'beam', x: Math.max(8, Math.min(VW - 8, pcx)), t: 0.95 });
        } else {
          B.pose = 'slamUp'; B.poseT = 0.5;
          E.tele.push({ k: 'slam', t: 0.5 });
        }
        B.atk = [2.6, 2.2, 1.8][ph];
      }
    } else if (B.st === 'hurt') {
      B.hurtT -= dt;
      if (Math.random() < 0.6) parts.push({ x: B.x + (Math.random() - 0.5) * 90, y: B.base - Math.random() * 90, vx: 0, vy: 20, life: 0.6, max: 0.6, c: Math.random() < 0.5 ? cfg.runeFx[0] : '#ffffff', s: 1, g: 30 });
      if (B.hurtT <= 0) {
        if (B.hp > 0) { B.st = 'fight'; B.atk = 1.4; B.pose = 'idle'; AUDIO.sfx('roar'); shake(0.6, 2); }
        else { B.st = 'dying'; B.dieT = 0; }
      }
    } else if (B.st === 'dying') {
      B.dieT += dt; shake(0.1, 1 + B.dieT);
      if (B.dieT > 2.2) {
        B.st = 'dead'; B.deadT = 0; AUDIO.sfx('shatter'); shake(0.8, 4);
        const n = cfg.death === 'stone' ? 90 : 70;
        for (let i = 0; i < n; i++) parts.push({ x: B.x + (Math.random() - 0.5) * 100, y: B.base - Math.random() * 100, vx: (Math.random() - 0.5) * 140, vy: -Math.random() * 160, life: 1.6 + Math.random(), max: 2.6, c: cfg.shatter[i % 4], s: Math.random() < 0.5 ? 2 : 3, g: cfg.death === 'stone' || cfg.death === 'slump' ? 420 : -30 });
        if (cfg.death === 'shatter') for (let i = 0; i < 24; i++) parts.push({ x: B.x + (Math.random() - 0.5) * 60, y: B.base - 40 - Math.random() * 40, vx: (Math.random() - 0.5) * 40, vy: -60 - Math.random() * 80, life: 3, max: 3, c: i % 2 ? '#6ad0ff' : '#bff4ff', s: 2, g: -10 });
        E.flagOn = true; pop(VW / 2, B.base - 20, cfg.defeat, COL.gold);
        AUDIO.play('final');
        L.grid = L.grid.map(row => row.map(ch => ch === 'L' ? '.' : ch));
      }
    } else if (B.st === 'dead') B.deadT += dt;
    // telegrafías y ataques
    for (let i = E.tele.length - 1; i >= 0; i--) {
      const q = E.tele[i]; q.t -= dt;
      if (q.t > 0) continue;
      E.tele.splice(i, 1);
      if (B.st !== 'fight') continue;
      if (q.k === 'ball') { E.balls.push({ x: q.x, y: bossSpawnY(q.x), vy: 60, vx: 0 }); }
      else if (q.k === 'beam') { const y0 = bossSpawnY(q.x); E.beams.push({ x: q.x, y0, y1: rayDown(q.x, y0, cfg.bw / 2 - 1), t: 0.85 }); AUDIO.sfx('beam'); shake(0.85, 1.5); }
      else if (q.k === 'slam') {
        B.pose = 'slamDown'; B.poseT = 0.6; AUDIO.sfx('slam'); shake(0.5, 4);
        const used = [];
        for (let k = 0; k < 5; k++) { let x; do { x = 10 + Math.random() * (VW - 20); } while (used.some(u => Math.abs(u - x) < 18)); used.push(x); E.tele.push({ k: 'rock', x, t: 0.55 + k * 0.08 }); }
      } else if (q.k === 'rock') { E.rocks.push({ x: q.x - 3.5, y: bossSpawnY(q.x), vy: 40, k: cfg.debris }); }
    }
    for (let i = E.balls.length - 1; i >= 0; i--) {
      const b = E.balls[i];
      b.vy = Math.min(b.vy + 520 * dt, 250); b.y += b.vy * dt;
      if (cfg.homing) { b.vx += Math.sign(p.x + PW / 2 - b.x) * 70 * dt; b.vx = Math.max(-40, Math.min(40, b.vx)); b.x += b.vx * dt; }
      if (Math.random() < 0.7) parts.push({ x: b.x + (Math.random() - 0.5) * 4, y: b.y - 4, vx: 0, vy: -10, life: 0.3, max: 0.3, c: Math.random() < 0.5 ? cfg.ball[1] : cfg.ball[2], s: 1, g: 0 });
      const c = Math.floor(b.x / T), r = Math.floor((b.y + 4) / T);
      if (CORE.solid(L, c, r) || CORE.tile(L, c, r) === '=' || b.y > L.H * T) {
        E.balls.splice(i, 1);
        if (onScreen(b.y)) { burst(b.x, b.y, cfg.ball, 12, 80, 300); AUDIO.sfx('splash'); }
        continue;
      }
      if (!noHaz && alive && Math.hypot(b.x - (p.x + PW / 2), b.y - (p.y + PH / 2)) < 7.5) hurt();
    }
    for (let i = E.beams.length - 1; i >= 0; i--) {
      const bm = E.beams[i]; bm.t -= dt;
      if (Math.random() < 0.8) parts.push({ x: bm.x + (Math.random() - 0.5) * cfg.bw, y: bm.y1, vx: (Math.random() - 0.5) * 60, vy: -40 - Math.random() * 60, life: 0.4, max: 0.4, c: Math.random() < 0.5 ? cfg.beam[2] : cfg.beam[1], s: 1, g: 200 });
      if (bm.t <= 0) { E.beams.splice(i, 1); continue; }
      if (!noHaz && alive && CORE.overlap(p.x + 1, p.y + 1, PW - 2, PH - 2, bm.x - cfg.bw / 2 + 1, bm.y0, cfg.bw - 2, bm.y1 - bm.y0)) hurt();
    }
    for (let i = E.ice.length - 1; i >= 0; i--) { E.ice[i].t -= dt; if (E.ice[i].t <= 0) E.ice.splice(i, 1); }
  }
  function hitBoss(u) {
    const cfg = B.cfg;
    u.used = true; AUDIO.sfx('rune'); AUDIO.sfx(cfg.sfx);
    E.ice.push({ x0: u.c * T + 7, y0: u.r * T + 2, x1: B.x, y1: B.base - 45, t: 0.7 });
    burst(u.c * T + 7, u.r * T + 4, cfg.runeFx, 18, 90, 0);
    E.tele = []; E.beams = [];
    if (!B || B.st === 'dead' || B.st === 'dying') return;
    B.hp--; B.st = 'hurt'; B.hurtT = 1.5; B.pose = 'roar'; shake(0.5, 3);
    pop(u.c * T + 7, u.r * T - 10, B.hp > 0 ? (cfg.cage ? '¡CADENA ROTA!' : '¡RUNA ACTIVADA!') : cfg.last, cfg.runeFx[1]);
  }
  // copia del cuadro con bruma del cielo y la base desvanecida (plano de fondo)
  let depthCache = new WeakMap(), depthTheme = null;
  function depthImg(img) {
    if (depthTheme !== theme) { depthCache = new WeakMap(); depthTheme = theme; }
    let c = depthCache.get(img); if (c) return c;
    const th = ART.THEMES[theme], w = img.width, h = img.height;
    c = ART.cv(w, h); const x = c.getContext('2d');
    x.drawImage(img, 0, 0);
    x.globalCompositeOperation = 'source-atop'; x.globalAlpha = 0.28; x.fillStyle = ART.mixHex(th.top, th.bot, 0.3); x.fillRect(0, 0, w, h);
    x.globalAlpha = 1; x.globalCompositeOperation = 'destination-out';
    const f0 = Math.floor(h * 0.7);
    for (let y = f0; y < h; y += 2) { x.fillStyle = 'rgba(0,0,0,' + Math.min(1, (y - f0 + 2) / (h - f0)).toFixed(3) + ')'; x.fillRect(0, y, w, 2); }
    depthCache.set(img, c); return c;
  }
  function drawBoss(cy) {
    if (!B || B.st === 'sleep') return;
    const G = B.G, cfg = B.cfg;
    let alpha = 1, img;
    if (B.st === 'dead') {
      if (cfg.death === 'stone') return;
      img = G.stone;
      if (cfg.death === 'dissolve') alpha = Math.max(0, 1 - B.deadT / 2);
      if (cfg.death === 'shatter') alpha = Math.max(0, 1 - B.deadT / 1.2);
      if (alpha <= 0) return;
    } else {
      img = B.pose === 'idle' ? G.idle[Math.floor(animT * 3) % G.idle.length] : G[B.pose] || G.idle[0];
      if (B.st === 'dying') img = (B.dieT > 1.2 || Math.floor(B.dieT * 10) % 2) ? G.stone : G.idle[0];
    }
    let off = Math.round((1 - B.rise) * (img.height + 12));
    if (B.st === 'dead' && cfg.death === 'slump') off += Math.round(Math.min(1, B.deadT / 3) * 30);
    let sx = 0; if (B.st === 'dying') sx = Math.round((Math.random() - 0.5) * 3);
    const bob = cfg.float && B.st !== 'dead' ? Math.round(Math.sin(animT * 2) * 3) : 0;
    const dimg = depthImg(img);
    const dx = Math.round(B.x - (img.width - 1) / 2) + sx, dy = Math.round(B.base + 3 - img.height) + off - cy + bob;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, VW, B.ledge - cy); ctx.clip();
    ctx.globalAlpha = alpha * (cfg.float && B.st !== 'dead' ? 0.92 : 1);
    ctx.drawImage(dimg, dx, dy);
    ctx.globalAlpha = 1;
    if (B.st === 'hurt') {
      const c = B.cv && B.cv.width === img.width && B.cv.height === img.height ? B.cv : (B.cv = ART.cv(img.width, img.height)), x = c.getContext('2d');
      x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, c.width, c.height); x.drawImage(dimg, 0, 0);
      x.globalCompositeOperation = 'source-atop'; x.fillStyle = cfg.hurt; x.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(c, dx, dy);
    }
    // bruma en la base: el jefe queda detrás, a lo lejos
    if (B.st !== 'dead') {
      const th = ART.THEMES[theme], mc = ART.mixHex(th.top, th.bot, 0.45);
      for (let k = 0; k < 7; k++) {
        const mx = (k * 37 + animT * (6 + k)) % (VW + 60) - 30, my = B.base + 2 + Math.sin(animT + k) * 2 - cy;
        ctx.globalAlpha = 0.22; ctx.fillStyle = mc; circle(Math.round(mx), Math.round(my), 9 + (k % 3) * 3);
      }
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }
  function drawBossFx(cy) {
    if (!B) return;
    const cfg = B.cfg, bw = cfg.bw;
    for (const q of E.tele) {
      if (q.k === 'slam') continue;
      const on = Math.floor(animT * 14) % 2 === 0;
      const sy = Math.max(bossSpawnY(q.x) - cy, 14);
      if (q.k === 'beam') {
        if (on) { ctx.fillStyle = cfg.beam[1]; ctx.globalAlpha = 0.7; const y1 = rayDown(q.x, bossSpawnY(q.x), bw / 2 - 1) - cy; for (let y = sy; y < y1; y += 3) { ctx.fillRect(Math.round(q.x - bw / 2), y, 1, 2); ctx.fillRect(Math.round(q.x + bw / 2), y, 1, 2); } ctx.globalAlpha = 1; }
      }
      if (on) { FONT.draw(ctx, '▼', q.x, sy, q.k === 'rock' ? ROCKC[cfg.debris][1] : cfg.ball[1] === '#e4ecf6' ? '#ffffff' : cfg.beam[2], { align: 'center', outline: COL.ink }); }
    }
    for (const bm of E.beams) {
      const y0 = bm.y0 - cy, y1 = bm.y1 - cy, fl = Math.floor(animT * 20) % 2, h = y1 - y0;
      ctx.fillStyle = cfg.beam[0]; ctx.fillRect(Math.round(bm.x - bw / 2 - fl), y0, bw + fl * 2, h);
      ctx.fillStyle = cfg.beam[1]; ctx.fillRect(Math.round(bm.x - bw / 2 + 2), y0, bw - 3, h);
      ctx.fillStyle = cfg.beam[2]; ctx.fillRect(Math.round(bm.x - 1), y0, 3, h);
      ctx.fillStyle = cfg.beam[3]; ctx.fillRect(Math.round(bm.x), y0, 1, h);
      if (B.id === 'ent') for (let y = y0; y < y1; y += 5) { ctx.fillStyle = '#c8b0e0'; ctx.fillRect(Math.round(bm.x + ((y / 5) % 2 ? -bw / 2 : bw / 2 - 1)), y, 1, 2); }
    }
    for (const b of E.balls) {
      const x = Math.round(b.x), y = Math.round(b.y) - cy;
      ctx.fillStyle = cfg.ball[0]; circle(x, y, 4); ctx.fillStyle = cfg.ball[1]; circle(x, y, 3); ctx.fillStyle = cfg.ball[2]; circle(x - 1, y - 1, 1);
      if (B.id === 'ent') { ctx.fillStyle = '#2a160a'; ctx.fillRect(x - 5, y, 1, 1); ctx.fillRect(x + 4, y - 1, 1, 1); ctx.fillRect(x, y - 5, 1, 1); ctx.fillRect(x - 1, y + 4, 1, 1); }
    }
    for (const q of E.ice) {
      const n = 30; ctx.fillStyle = Math.floor(animT * 20) % 2 ? cfg.runeFx[0] : '#ffffff';
      for (let i = 0; i <= n; i++) { const t = i / n; ctx.fillRect(Math.round(q.x0 + (q.x1 - q.x0) * t + Math.sin(t * 20 + animT * 30) * 1.5), Math.round(q.y0 + (q.y1 - q.y0) * t) - cy, 2, 2); }
    }
    // jaula del Carcelero durante su aparición
    if (cfg.cage && B.st === 'intro' && B.t > 1.0) {
      const px = Math.round(player.x + PW / 2), py = Math.round(player.y) - cy, k = Math.min(1, (B.t - 1.0) / 0.5);
      ctx.globalAlpha = k;
      for (let i = -2; i <= 2; i++) { const x = px + i * 5; ctx.fillStyle = '#4a6aff'; ctx.fillRect(x, py - 8, 1, 26); ctx.fillStyle = '#e0e8ff'; ctx.fillRect(x, py - 8 + Math.floor(animT * 20 + i * 3) % 26, 1, 2); }
      ctx.fillStyle = '#9ab4ff'; ctx.fillRect(px - 12, py - 9, 25, 2); ctx.fillRect(px - 12, py + 17, 25, 2);
      ctx.globalAlpha = 1;
    }
  }

  // ---------- actualización ----------
  function updatePlay(dt, inp, m) {
    animT += dt;
    if (m.pause) { openPause(); return; }
    if (introT > 0) introT -= dt;
    if (fadeT > 0) fadeT -= dt;
    if (shakeT > 0) shakeT -= dt;
    if (freezeInput > 0) { freezeInput -= dt; inp = { left: false, right: false, up: false, down: false, jump: false, grab: false, jumpPressed: false }; }
    clockT += dt; L.clock = noHaz ? undefined : clockT;
    updateWind(dt);
    updateCrumbles(dt);
    updateEntities(dt);
    updateBoss(dt);
    updateParts(dt);
    if (L.def.rise && deathT <= 0 && catchT <= 0) {
      if (lavaHold > 0) lavaHold -= dt; else if (!noHaz) lavaY -= L.def.rise.speed * dt;
      if (Math.random() < 0.3) parts.push({ x: Math.random() * VW, y: lavaY, vx: 0, vy: -30 - Math.random() * 40, life: 0.6, max: 0.6, c: Math.random() < 0.5 ? '#ffd541' : '#fa6a0a', s: 1, g: 60 });
    }
    if (deathT > 0) { deathT -= dt; if (deathT <= 0) respawn(); return; }
    if (catchT > 0) {
      catchT -= dt;
      player.vy += (0 - player.vy) * Math.min(1, dt * 10); player.y += player.vy * dt;
      player.x += Math.sin(animT * 12) * 0.2;
      if (catchT <= 0) respawn();
      return;
    }
    time += dt; save.pt = (save.pt || 0) + dt; sinceSpawn += dt; if (invT > 0) invT -= dt; if (heartMsgT > 0) heartMsgT -= dt; if (powMsgT > 0) powMsgT -= dt;
    if (player.levT > 0 && Math.random() < 0.6) parts.push({ x: player.x + PW / 2 + (Math.random() - 0.5) * 10, y: player.y + PH, vx: (Math.random() - 0.5) * 12, vy: 18 + Math.random() * 20, life: 0.5, max: 0.5, c: Math.random() < 0.5 ? '#bff4ff' : '#ffffff', s: 1, g: 0 });
    const p = player;
    const wasG = p.onGround, vy0 = p.vy;
    CORE.step(L, p, inp, dt, { wind: windVal, onTouch: touchCrumble, ev: onEv });
    if (p.state === 'climb' && windPhase === 'gust') p.stamina -= 6 * dt;
    if (!wasG && p.onGround && vy0 > 140) { dust(p.x + PW / 2, p.y + PH, 5); AUDIO.sfx('land'); }
    if (p.onGround && Math.abs(p.vx) > 40) { stepT -= dt; if (stepT <= 0) { stepT = 0.26; AUDIO.sfx('step'); if (Math.random() < 0.6) dust(p.x + PW / 2, p.y + PH, 1); } }
    if ((p.state === 'climb' || p.state === 'rope') && p.vy !== 0) climbAnim += dt;
    if (p.onGround) runAnim += dt * Math.abs(p.vx) / K.RUN;
    if (p.state === 'climb' && p.stamina < 30 && Math.random() < dt * 6) parts.push({ x: p.x + PW / 2 + (Math.random() - 0.5) * 8, y: p.y, vx: (Math.random() - 0.5) * 20, vy: -20, life: 0.4, max: 0.4, c: '#8fd8ff', s: 1, g: 200 });

    // recolectables
    for (const c of E.gems) if (!c.got && CORE.overlap(p.x, p.y, PW, PH, c.x, c.y, 7, 7)) {
      c.got = true; got++; AUDIO.sfx('crystal');
      burst(c.x + 3, c.y + 3, ['#ff6a5a', '#ffffff', '#ffd541'], 10, 60, 0);
      pop(c.x + 3, c.y - 2, got + '/3', '#ff9a8a');
    }
    for (const mm of E.potions) if (mm.t <= 0 && p.stamina < K.ST_MAX - 1 && CORE.overlap(p.x, p.y, PW, PH, mm.x, mm.y, 8, 9)) {
      p.stamina = K.ST_MAX; mm.t = 2.5; AUDIO.sfx('chalk');
      burst(mm.x + 4, mm.y + 4, ['#8cd05a', '#d8ffb0', '#ffffff'], 14, 40, -20);
      pop(mm.x + 4, mm.y - 4, 'VIGOR', '#a2e07a');
    }
    for (const s of E.anchors) if (!s.clipped && CORE.overlap(p.x, p.y, PW, PH, s.c * T - 2, s.r * T - 6, T + 4, T + 6)) {
      s.clipped = true; clips.push(s); anchor = s; AUDIO.sfx('seguro');
      burst(s.ax, s.ay, [COL.rune, '#ffffff'], 12, 50, 30);
      pop(s.ax, s.ay - 8, 'ANCLAJE', COL.rune);
    }
    if (E.heart && !E.heart.got && CORE.overlap(p.x, p.y, PW, PH, E.heart.x + 1, E.heart.y + 1, 10, 10)) {
      E.heart.got = true; save.hearts = 1; writeSave(); hp = hpMax(); heartMsgT = 4;
      AUDIO.sfx('rune'); AUDIO.sfx('crystal'); shake(0.2, 1);
      burst(E.heart.x + 6, E.heart.y + 6, ['#ff4a5a', '#ffb0b8', '#ffffff', '#ffd541'], 30, 90, 0);
      pop(E.heart.x + 6, E.heart.y - 4, '¡CORAZÓN EXTRA!', '#ff6a7a');
    }
    if (E.power && !E.power.got && CORE.overlap(p.x, p.y, PW, PH, E.power.x, E.power.y - 2, 12, 14)) {
      E.power.got = true; save.lev = 1; writeSave(); p.lev = true; powMsgT = 5;
      AUDIO.sfx('rune'); AUDIO.sfx('crystal'); shake(0.2, 1);
      burst(E.power.x + 6, E.power.y + 6, ['#bff4ff', '#ffffff', '#7ef3ff', '#ffd541'], 30, 90, 0);
      pop(E.power.x + 6, E.power.y - 4, '¡PLUMA DE GRIFO!', COL.rune);
    }
    if (B) for (const u of E.runes) if (!u.used && CORE.overlap(p.x, p.y, PW, PH, u.c * T, u.r * T - 6, T, T + 6)) hitBoss(u);
    // peligros
    if (CORE.hazard(L, p)) { die(); return; }
    if (L.def.rise && p.y + PH - 3 > lavaY) { die(); return; }
    if (!noHaz) {
      for (const r of E.rocks) if (CORE.overlap(p.x + 1, p.y + 1, PW - 2, PH - 2, r.x + 1, r.y + 1, 5, 5)) { if (hurt()) return; }
      for (const a of E.arrows) if (CORE.overlap(p.x, p.y + 1, PW, PH - 2, a.x - 3, a.y - 1, 6, 2)) { if (hurt()) return; }
      for (const v of E.stal) if (v.st !== 'gone' && v.grow > 0.8 && CORE.overlap(p.x + 1, p.y + 1, PW - 2, PH - 2, v.x + 3, v.y, 6, 9)) { if (hurt()) return; }
      for (const v of E.vents) if (v.on && CORE.overlap(p.x + 1, p.y + 1, PW - 2, PH - 2, v.x + 3, v.y + 12 - 32, 6, 32)) { if (hurt()) return; }
      for (const g of E.ghosts) if (g.vis && CORE.overlap(p.x + 1, p.y + 1, PW - 2, PH - 2, g.x - 5, g.y - 6, 10, 12)) { if (hurt()) return; }
      for (const w of E.saws) if (Math.hypot(w.x - (p.x + PW / 2), w.y - (p.y + PH / 2)) < 8.5) { if (hurt()) return; }
      for (const b of E.lobs) if (Math.hypot(b.x - (p.x + PW / 2), b.y - (p.y + PH / 2)) < 6) { if (hurt()) return; }
      if (stompOrHit(E.imps, 4, 5, 10, 8)) return;
      if (stompOrHit(E.swoops, -6, -5, 12, 10)) return;
      if (stompOrHit(E.goblins, 2, -4, 8, 16)) return;
      if (stompOrHit(E.lobbers, 1, -6, 10, 18)) return;
    }
    if (p.state === 'normal' && !p.onGround && (p.y - p.apexY) > K.CATCH_FALL && p.y > anchor.y + 20) { ropeCatch(); return; }
    const f = E.flag;
    if (E.flagOn && E.flagRise >= 1 && CORE.overlap(p.x, p.y, PW, PH, f.x, f.y - 12, T, T + 12)) { levelClear(); return; }
    // cámara
    let target = clampCam(p.y + PH / 2 - VH * 0.6);
    if (B && B.st === 'intro') target = 0;
    cam += (target - cam) * Math.min(1, dt * (B && B.st === 'intro' ? 2.5 : 7));
    // letreros
    let hi = -1;
    for (let i = 0; i < E.signs.length; i++) { const s = E.signs[i]; if (Math.abs(s.x + 6 - (p.x + PW / 2)) < 34 && Math.abs(s.y + 6 - (p.y + PH / 2)) < 30) { hi = i; break; } }
    if (hi >= 0) { hintShown = hi; hintA = Math.min(1, hintA + dt * 5); } else hintA = Math.max(0, hintA - dt * 4);
  }
  function stompOrHit(list, hx, hy, hw, hh) {
    const p = player;
    for (const e of list) {
      if (!e.alive) continue;
      const ex = e.x + hx, ey = (e.y !== undefined ? e.y : 0) + hy;
      if (!CORE.overlap(p.x, p.y, PW, PH, ex, ey, hw, hh)) continue;
      if (p.vy > 30 && p.y + PH - ey < 7 && p.state === 'normal') {
        const flying = list === E.imps || list === E.swoops;
        e.alive = false; e.deadT = flying ? 1.0 : 0.7; e.dvy = -60; p.vy = -230; p.apexY = p.y; p.regrab = false;
        AUDIO.sfx('stomp'); AUDIO.sfx('poof');
        const BC = { imp: ['#aa3428', '#d05a36', '#ffcc44'], bat: ['#3a2a3a', '#6a4a6a', '#d83a3a'], batT: ['#2a2434', '#4a4058', '#d83a3a'], icebat: ['#6ad0ff', '#bff4ff', '#ffffff'],
          squirrel: ['#a0602a', '#d89a50', '#f0dcb0'], firesq: ['#aa3428', '#fa6a0a', '#ffd541'], moth: ['#f4e0a0', '#fff8e0', '#e0b060'] };
        const cols = flying ? BC[list === E.imps ? skin.fly : skin.swoop] : list === E.lobbers ? ['#e8f0ff', '#8aa0b8', '#ffffff'] : skin.archer === 'skel' ? ['#e8e2d0', '#c8c2ae', '#8a8478'] : ['#6c923a', '#94b850', '#946238'];
        burst(ex + hw / 2, ey + hh / 2, cols, 16, 80, 200);
        pop(ex + hw / 2, ey - 6, '¡PISOTÓN!', COL.gold);
        return false;
      }
      if (invT > 0) continue;
      return hurt();
    }
    return false;
  }
  function updateCrumbles(dt) {
    for (const k in L.crumble) {
      const s = L.crumble[k];
      if (s.st === 'shake') {
        s.t -= dt;
        if (s.t <= 0) {
          s.st = 'gone'; s.gone = true; s.t = 2.8;
          const c = k % L.W, r = Math.floor(k / L.W), th = ART.THEMES[theme];
          burst(c * T + 6, r * T + 6, [th.rock[1], th.rock[2], th.rock[3], '#fa6a0a'], 12, 50, 400);
          if (onScreen(r * T)) AUDIO.sfx('crumble');
        }
      } else {
        s.t -= dt;
        if (s.t <= 0) { const c = k % L.W, r = Math.floor(k / L.W); if (!CORE.overlap(player.x, player.y, PW, PH, c * T, r * T, T, T)) { delete L.crumble[k]; burst(c * T + 6, r * T + 6, ['#ffd541'], 5, 20, 0); } }
      }
    }
  }
  function updateEntities(dt) {
    const p = player, alive = deathT <= 0 && catchT <= 0;
    for (const m of E.potions) if (m.t > 0) m.t -= dt;
    if (!E.flagOn) { } else if (E.flagRise < 1) E.flagRise = Math.min(1, E.flagRise + dt * 1.5);
    for (const s of E.spawners) {
      if (!onScreen(s.y, 80)) continue;
      s.t -= dt;
      if (s.t < 0.55 && Math.random() < dt * 30) parts.push({ x: s.x + 3 + Math.random() * 6, y: s.y + 2, vx: (Math.random() - 0.5) * 10, vy: 10 + Math.random() * 20, life: 0.5, max: 0.5, c: Math.random() < 0.5 ? ROCKC[skin.rock][2] : ROCKC[skin.rock][1], s: 1, g: 120 });
      if (s.t <= 0) { s.t += 2.6; E.rocks.push({ x: s.x + 2.5, y: s.y + 2, vy: 30 }); }
    }
    for (let i = E.rocks.length - 1; i >= 0; i--) {
      const r = E.rocks[i];
      r.vy = Math.min(r.vy + 700 * dt, 210); r.y += r.vy * dt;
      if ((skin.rock === 'fire' || skin.rock === 'light') && Math.random() < 0.4) parts.push({ x: r.x + 3, y: r.y, vx: 0, vy: -8, life: 0.25, max: 0.25, c: ROCKC[skin.rock][2], s: 1, g: 0 });
      const c = Math.floor((r.x + 3.5) / T), rr = Math.floor((r.y + 7) / T);
      if (CORE.solid(L, c, rr) || CORE.tile(L, c, rr) === '=' || r.y > L.H * T) {
        E.rocks.splice(i, 1);
        if (onScreen(r.y)) { burst(r.x + 3, r.y + 6, ROCKC[r.k || skin.rock], 8, 60, 400); AUDIO.sfx('rock'); }
      }
    }
    for (const v of E.stal) {
      if (v.st === 'hang') {
        if (v.grow < 1) v.grow = Math.min(1, v.grow + dt * 2);
        const pcx = p.x + PW / 2, pcy = p.y + PH / 2;
        if (alive && v.grow >= 1 && Math.abs(pcx - (v.x + 6)) < 11 && pcy > v.y && pcy - v.y < 120) { v.st = 'shake'; v.t = 0.38; if (onScreen(v.y)) AUDIO.sfx('shake'); }
      } else if (v.st === 'shake') { v.t -= dt; if (v.t <= 0) { v.st = 'fall'; v.vy = 0; } }
      else if (v.st === 'fall') {
        v.vy = Math.min(v.vy + 900 * dt, 320); v.y += v.vy * dt;
        const c = Math.floor((v.x + 6) / T), r = Math.floor((v.y + 10) / T);
        if (CORE.solid(L, c, r) || v.y > L.H * T) { v.st = 'gone'; v.t = 3.5; if (onScreen(v.y)) { burst(v.x + 6, v.y + 8, [...STALC[skin.stal], '#1c1428'], 12, 70, 400); AUDIO.sfx(skin.stal === 'ice' ? 'ice' : 'rock'); } }
      } else if (v.st === 'gone') { v.t -= dt; if (v.t <= 0) { v.st = 'hang'; v.y = v.y0; v.grow = 0; } }
    }
    for (const c of E.imps) {
      if (!c.alive) { if (c.deadT > 0) { c.deadT -= dt; c.dvy = (c.dvy || -60) + 500 * dt; c.y += c.dvy * dt; } continue; }
      c.t += dt;
      const nx = c.x + c.dir * 40 * dt;
      const fx2 = c.dir > 0 ? nx + 15 : nx + 3, row = Math.floor((c.y0 + 9) / T);
      if (nx < -2 || nx > VW - 16 || CORE.solid(L, Math.floor(fx2 / T), row)) c.dir *= -1; else c.x = nx;
      c.y = c.y0 + Math.sin(c.t * 3) * 5;
    }
    const pcx = p.x + PW / 2, pcy = p.y + PH / 2;
    for (const w of E.swoops) {
      if (!w.alive) { if (w.deadT > 0) { w.deadT -= dt; w.dvy = (w.dvy || -60) + 500 * dt; w.y += w.dvy * dt; } continue; }
      w.t -= dt;
      if (w.st === 'idle') {
        w.x = w.hx + Math.sin(animT * 1.5 + w.hx) * 6; w.y = w.hy + Math.sin(animT * 3 + w.hy) * 2;
        if (w.t <= 0 && alive && pcy > w.y + 6 && pcy - w.y < 110 && Math.abs(pcx - w.x) < 80 && onScreen(w.y, 0)) { w.st = 'warn'; w.t = 0.5; AUDIO.sfx('screech'); }
      } else if (w.st === 'warn') {
        w.x += Math.sin(animT * 40) * 0.6;
        if (w.t <= 0) { w.st = 'dive'; const dx = pcx - w.x, dy = pcy - w.y, d = Math.hypot(dx, dy) || 1; w.vx = dx / d * 125; w.vy = dy / d * 125; w.dir = w.vx > 0 ? 1 : -1; w.t = 1.4; }
      } else if (w.st === 'dive') {
        w.x += w.vx * dt; w.y += w.vy * dt;
        if (w.t <= 0 || w.x < 2 || w.x > VW - 2 || CORE.solid(L, Math.floor(w.x / T), Math.floor(w.y / T))) w.st = 'back';
      } else {
        const dx = w.hx - w.x, dy = w.hy - w.y, d = Math.hypot(dx, dy);
        if (d < 2) { w.st = 'idle'; w.t = 1.8; } else { w.x += dx / d * 45 * dt; w.y += dy / d * 45 * dt; w.dir = dx > 0 ? 1 : -1; }
      }
    }
    for (const g of E.ghosts) {
      g.t += dt;
      const cyc = g.t % 4.6; g.vis = cyc < 3.2; g.fade = g.vis ? Math.min(1, cyc / 0.4, (3.2 - cyc) / 0.4) : 0;
      const near = alive && Math.hypot(pcx - g.hx, pcy - g.hy) < 105;
      const tx = near ? pcx : g.hx, ty = near ? pcy : g.hy, dx = tx - g.x, dy = ty - g.y, d = Math.hypot(dx, dy);
      if (d > 1) { const sp = near ? 17 : 12; g.x += dx / d * sp * dt; g.y += dy / d * sp * dt; g.dir = dx > 0 ? 1 : -1; }
      const lx = g.x - g.hx, ly = g.y - g.hy, ld = Math.hypot(lx, ly); if (ld > 90) { g.x = g.hx + lx / ld * 90; g.y = g.hy + ly / ld * 90; }
    }
    for (const w of E.saws) {
      w.a += dt * 14;
      const nx = w.x + w.dir * 42 * dt, ahead = nx + w.dir * 6;
      if (ahead < 4 || ahead > VW - 4 || CORE.solid(L, Math.floor(ahead / T), Math.floor(w.y / T))) w.dir *= -1; else w.x = nx;
    }
    for (const m of E.lobbers) {
      if (m.deadT > 0) m.deadT -= dt;
      if (m.shotT > 0) m.shotT -= dt;
      if (!m.alive) continue;
      const near = alive && Math.abs(pcy - (m.y + 6)) < 90 && Math.abs(pcx - (m.x + 6)) < 150 && onScreen(m.y, 0);
      m.dir = pcx < m.x + 6 ? -1 : 1;
      if (m.st === 'idle') { m.t -= dt; if (m.t <= 0 && near) { m.st = 'aim'; m.t = 0.7; AUDIO.sfx('bow'); } else if (m.t <= 0) m.t = 0.4; }
      else if (m.st === 'aim') {
        m.t -= dt;
        if (m.t <= 0) {
          m.st = 'idle'; m.t = 2.3; m.shotT = 0.35;
          const sx = m.x + 6, sy = m.y - 2, tf = 0.95, g = 420;
          const vx = Math.max(-110, Math.min(110, (pcx - sx) / tf)), vy = Math.max(-300, Math.min(40, ((pcy - sy) - 0.5 * g * tf * tf) / tf));
          E.lobs.push({ x: sx, y: sy, vx, vy, g, k: skin.ape, a: 0 }); AUDIO.sfx('throw');
        }
      }
    }
    for (let i = E.lobs.length - 1; i >= 0; i--) {
      const b = E.lobs[i]; b.vy += b.g * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.a += dt * 10;
      if (b.y > L.H * T || b.x < -10 || b.x > VW + 10 || (b.vy > 0 && CORE.solid(L, Math.floor(b.x / T), Math.floor((b.y + 3) / T)))) {
        E.lobs.splice(i, 1);
        if (onScreen(b.y)) { burst(b.x, b.y, b.k === 'N' ? ['#ffffff', '#d8e8f4', '#a8c0d8'] : b.k === 'F' ? ['#6a4422', '#9a6a36', '#3a2412'] : ['#fa6a0a', '#ffd541', '#5a1a10'], 10, 60, 300); AUDIO.sfx(b.k === 'N' ? 'splash' : 'rock'); }
      }
    }
    for (const g of E.goblins) {
      if (g.deadT > 0) g.deadT -= dt;
      if (g.shotT > 0) g.shotT -= dt;
      if (!g.alive) continue;
      const pcy = p.y + PH / 2, gy = g.y + 6;
      const near = alive && Math.abs(pcy - gy) < 44 && onScreen(g.y, 0);
      g.dir = (p.x + PW / 2) < g.x + 6 ? -1 : 1;
      if (g.st === 'idle') { g.t -= dt; if (g.t <= 0 && near) { g.st = 'aim'; g.t = 0.6; AUDIO.sfx('bow'); } else if (g.t <= 0) g.t = 0.3; }
      else if (g.st === 'aim') {
        g.t -= dt;
        if (g.t <= 0) { g.st = 'idle'; g.t = 1.7; g.shotT = 0.3; E.arrows.push({ x: g.x + 6 + g.dir * 8, y: g.y + 5, vx: g.dir * 130 }); AUDIO.sfx('arrow'); }
      }
    }
    for (let i = E.arrows.length - 1; i >= 0; i--) {
      const a = E.arrows[i]; a.x += a.vx * dt;
      if (a.stuck !== undefined) { a.stuck -= dt; a.x -= a.vx * dt; if (a.stuck <= 0) E.arrows.splice(i, 1); continue; }
      if (a.x < -10 || a.x > VW + 10) { E.arrows.splice(i, 1); continue; }
      if (CORE.solid(L, Math.floor((a.x + (a.vx > 0 ? 3 : -3)) / T), Math.floor(a.y / T))) { a.stuck = 0.8; a.hit = true; }
    }
    for (const v of E.vents) {
      const ph = (animT + v.ph) % 3.4;
      const wasOn = v.on;
      v.warn = ph >= 1.8 && ph < 2.4; v.on = ph >= 2.4;
      if (v.on && !wasOn && onScreen(v.y)) AUDIO.sfx('vent');
      if (v.warn && Math.random() < 0.5) parts.push({ x: v.x + 4 + Math.random() * 4, y: v.y + 9, vx: (Math.random() - 0.5) * 10, vy: -20 - Math.random() * 20, life: 0.5, max: 0.5, c: Math.random() < 0.6 ? 'rgba(120,110,110,0.7)' : VENTC[skin.vent][1], s: 1, g: -10 });
    }
  }
  function updateParts(dt) {
    for (let i = parts.length - 1; i >= 0; i--) { const q = parts[i]; q.life -= dt; if (q.life <= 0) { parts.splice(i, 1); continue; } q.vy += (q.g || 0) * dt; q.x += q.vx * dt; q.y += q.vy * dt; }
    for (let i = pops.length - 1; i >= 0; i--) { const q = pops[i]; q.life -= dt; q.y -= 14 * dt; if (q.life <= 0) pops.splice(i, 1); }
    if (parts.length > 500) parts.splice(0, parts.length - 500);
  }

  // ---------- render del juego ----------
  function drawLavaTile(x, y, seed) {
    ctx.fillStyle = '#a8240e'; ctx.fillRect(x, y + 3, T, T - 3);
    ctx.fillStyle = '#c8381a'; ctx.fillRect(x, y + 5, T, 3);
    for (let i = 0; i < T; i++) {
      const w = Math.sin(animT * 3 + (x + i) * 0.5 + seed) * 1.2;
      ctx.fillStyle = '#fa6a0a'; ctx.fillRect(x + i, Math.round(y + 3 + w), 1, 2);
      if ((i + Math.floor(animT * 6)) % 5 === 0) { ctx.fillStyle = '#ffd541'; ctx.fillRect(x + i, Math.round(y + 3 + w), 1, 1); }
    }
    if (Math.floor(animT * 2 + seed) % 4 === 0) { ctx.fillStyle = '#ffd541'; ctx.fillRect(x + ((seed * 7) % 9) + 1, y + 7, 2, 1); }
  }
  function drawHazTile(x, y, seed) {
    const hz = ART.THEMES[theme].hz || 'lava';
    if (hz === 'lava') return drawLavaTile(x, y, seed);
    if (hz === 'thorn') {
      ctx.fillStyle = '#1a0e1e'; ctx.fillRect(x, y + 4, T, T - 4);
      for (let i = 0; i < T; i += 3) { const h = 3 + ((seed + i) % 3); ctx.fillStyle = '#3a1e46'; ctx.fillRect(x + i, y + 7 - h + 3, 2, h); ctx.fillStyle = '#c8b0e0'; ctx.fillRect(x + i + (i % 2), y + 7 - h + 2, 1, 1); }
      for (let i = 0; i < T; i++) { const w = Math.round(Math.sin(animT * 2 + (x + i) * 0.6 + seed) * 1); ctx.fillStyle = '#5a2a6a'; ctx.fillRect(x + i, y + 6 + w, 1, 2); }
      if (Math.floor(animT * 3 + seed) % 5 === 0) { ctx.fillStyle = '#a8ff5a'; ctx.fillRect(x + (seed * 5) % 10 + 1, y + 8, 1, 1); }
      return;
    }
    if (hz === 'icewater') {
      ctx.fillStyle = '#0a2a4a'; ctx.fillRect(x, y + 4, T, T - 4); ctx.fillStyle = '#1a4a7a'; ctx.fillRect(x, y + 6, T, 2);
      for (let i = 0; i < T; i++) { const w = Math.sin(animT * 2 + (x + i) * 0.4 + seed); ctx.fillStyle = w > 0.6 ? '#ffffff' : '#6ad0ff'; ctx.fillRect(x + i, Math.round(y + 4 + w), 1, 1); }
      ctx.fillStyle = '#bff4ff'; ctx.fillRect(x + (seed * 7) % 8 + 1, y + 9, 3, 1);
      return;
    }
    if (hz === 'mist') {
      for (let i = 0; i < T; i++) { const w = Math.sin(animT * 1.5 + (x + i) * 0.3 + seed) * 1.5; ctx.fillStyle = 'rgba(90,80,140,0.85)'; ctx.fillRect(x + i, Math.round(y + 4 + w), 1, T - 4); ctx.fillStyle = 'rgba(190,210,255,0.7)'; ctx.fillRect(x + i, Math.round(y + 4 + w), 1, 1); }
      if (Math.floor(animT * 2 + seed) % 4 === 0) { ctx.fillStyle = '#bfe8ff'; ctx.fillRect(x + (seed * 3) % 10, y + 7, 1, 1); }
      return;
    }
    // luz
    ctx.fillStyle = '#e0b060'; ctx.fillRect(x, y + 4, T, T - 4);
    for (let i = 0; i < T; i++) { const w = Math.sin(animT * 3 + (x + i) * 0.5 + seed) * 1.2; ctx.fillStyle = '#fff4c0'; ctx.fillRect(x + i, Math.round(y + 4 + w), 1, 2); }
    ctx.fillStyle = '#ffffff'; ctx.fillRect(x + (Math.floor(animT * 8) + seed) % T, y + 6, 1, 1);
  }
  function drawLightPlat(c, r, cy) {
    const ph = CORE.blinkPhase(L, r), on = L.clock === undefined || ph < 2, warn = ph >= 1.35 && ph < 2;
    const x = c * T, y = r * T - cy;
    if (!on || (warn && Math.floor(animT * 14) % 2)) {
      ctx.fillStyle = 'rgba(255,240,200,0.25)'; for (let i = 0; i < T; i += 2) ctx.fillRect(x + i, y + 1, 1, 1);
      if (!on && ph > 2.6) { ctx.fillStyle = 'rgba(255,240,200,0.5)'; ctx.fillRect(x + 1, y + 1, T - 2, 1); }
      return;
    }
    ctx.fillStyle = 'rgba(255,230,150,0.25)'; ctx.fillRect(x, y - 2, T, 7);
    ctx.fillStyle = '#e0b050'; ctx.fillRect(x, y, T, 4); ctx.fillStyle = '#fff4c0'; ctx.fillRect(x, y, T, 1); ctx.fillStyle = '#a07830'; ctx.fillRect(x, y + 3, T, 1);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(x + (Math.floor(animT * 10) + c * 3) % T, y + 1, 1, 1);
  }
  function drawRetract(c, r, cy) {
    const ph = L.clock === undefined ? 0 : CORE.spikePhase(L, c), x = c * T, y = r * T - cy + T;
    const h = ph >= 1.5 ? 6 : ph >= 1.2 ? Math.round((ph - 1.2) / 0.3 * 2) : 0;
    const sky = skin.saw === 'light';
    if (h <= 0) return;
    for (let k = 0; k < 3; k++) for (let j = 0; j < h; j++) {
      const w = Math.max(1, Math.round((j + 1) / h * 3)), lx = x + 1 + k * 4 + Math.floor((3 - w) / 2) + 0;
      ctx.fillStyle = sky ? (j === h - 1 ? '#a07830' : '#fff4c0') : (j === h - 1 ? '#3a3a48' : '#b4b4c8'); ctx.fillRect(lx, y - 2 - h + j, w, 1);
    }
  }
  function renderPlay() {
    const sh = shakeT > 0 ? Math.round((Math.random() - 0.5) * 2 * shakeA) : 0;
    const cy = Math.round(cam) + sh;
    const tlev = 1 - cam / Math.max(1, L.H * T - VH);
    drawBackdrop(bg, tlev, cy);
    drawBoss(cy);
    { const sy = Math.max(0, cy), shh = Math.min(VH, layer.height - sy); if (shh > 0) ctx.drawImage(layer, 0, sy, VW, shh, 0, Math.max(0, -cy), VW, shh); }
    const r0 = Math.max(0, Math.floor(cy / T)), r1 = Math.min(L.H - 1, Math.floor((cy + VH) / T));
    for (let r = r0; r <= r1; r++) for (let c = 0; c < L.W; c++) {
      const ch = L.grid[r][c];
      if (ch === 'L') { drawHazTile(c * T, r * T - cy, r * 3 + c); continue; }
      if (ch === 'B') { drawLightPlat(c, r, cy); continue; }
      if (ch === 'X') { drawRetract(c, r, cy); continue; }
      if (ch !== 'C') continue;
      const s = L.crumble[r * L.W + c];
      if (s && s.gone) continue;
      let dx = 0, dy = 0;
      if (s && s.st === 'shake') { dx = Math.round((Math.random() - 0.5) * 2); dy = Math.round(Math.random()); }
      ctx.drawImage(crTex[r * L.W + c], c * T + dx, r * T - cy + dy);
    }
    for (const s of E.signs) drawSign(s.x, s.y - cy);
    drawBanner(E.flag, cy);
    drawHeartPickup(cy);
    drawPowerPickup(cy);
    for (const s of E.anchors) { const img = SP.anchor[s.clipped ? 1 : 0]; ctx.drawImage(img, s.c * T + 6 - (img.width - 1) / 2, s.r * T + T - img.height + 1 - cy); }
    for (const u of E.runes) { const img = SP.rune[B ? B.rune : 'escarcha'][u.used ? 1 : 0]; ctx.drawImage(img, u.c * T + 6 - (img.width - 1) / 2, u.r * T + T - img.height - cy + (u.used ? 0 : Math.round(Math.sin(animT * 3)))); }
    for (const m of E.potions) { ctx.globalAlpha = m.t > 0 ? 0.25 : 1; ctx.drawImage(SP.potion, Math.round(m.x + 4 - (SP.potion.width - 1) / 2), Math.round(m.y + 10 - SP.potion.height + Math.sin(animT * 3 + m.c) * 1.2) - cy); ctx.globalAlpha = 1; }
    for (const c of E.gems) if (!c.got) { const img = SP.gemG[Math.floor(animT * 4 + c.c) % 3]; ctx.drawImage(img, Math.round(c.x + 3 - (img.width - 1) / 2), Math.round(c.y + 9 - img.height + Math.sin(animT * 3 + c.r) * 1.5) - cy); }
    for (const s of E.spawners) { ctx.fillStyle = 'rgba(20,10,10,0.6)'; ctx.fillRect(s.x + 2, s.y - cy, 8, 2); ctx.fillStyle = ROCKC[skin.rock][2]; ctx.fillRect(s.x + 5, s.y - cy, 2, 1); }
    for (const v of E.vents) drawVent(v, cy);
    for (const g of E.goblins) {
      if (!g.alive && !(g.deadT > 0)) continue;
      const fi = g.dir > 0 ? 0 : 1;
      const A = skin.archer === 'skel' ? { d: SP.skelDead, s: SP.skelShot, a: SP.skelAim, i: SP.skel } : { d: SP.goblinDead, s: SP.goblinShot, a: SP.goblinAim, i: SP.goblin };
      const fr = !g.alive ? A.d : g.shotT > 0 ? A.s : g.st === 'aim' ? A.a : A.i[Math.floor(animT * 2 + g.c) % 2];
      const img = fr[fi];
      if (!g.alive) ctx.globalAlpha = Math.min(1, g.deadT * 2);
      ctx.drawImage(img, Math.round(g.x + 6 - (img.width - 1) / 2), Math.round(g.y + T - img.height + (g.alive ? 0 : (0.7 - g.deadT) * 10)) - cy);
      ctx.globalAlpha = 1;
    }
    drawRope(cy);
    drawPlayer(cy);
    for (const a of E.arrows) { const x = Math.round(a.x), y = Math.round(a.y) - cy, d = a.vx > 0 ? 1 : -1; ctx.fillStyle = '#8e6236'; ctx.fillRect(x - 3, y, 6, 1); ctx.fillStyle = '#c3cad6'; ctx.fillRect(d > 0 ? x + 3 : x - 4, y, 1, 1); ctx.fillStyle = '#f6f3ea'; ctx.fillRect(d > 0 ? x - 4 : x + 3, y - 1, 1, 3); }
    for (const r of E.rocks) { const x = Math.round(r.x), y = Math.round(r.y) - cy, k = ROCKC[r.k || skin.rock]; ctx.fillStyle = k[0]; ctx.fillRect(x, y, 7, 7); ctx.fillStyle = k[1]; ctx.fillRect(x + 1, y + 1, 5, 5); ctx.fillStyle = k[2]; ctx.fillRect(x + 2, y + 2, 2, 1); ctx.fillRect(x + 4, y + 4, 1, 1); if (skin.rock === 'pine') { ctx.fillStyle = k[0]; ctx.fillRect(x + 1, y + 3, 5, 1); } }
    for (const m of E.lobbers) {
      if (!m.alive && !(m.deadT > 0)) continue;
      const S = SP.ape[skin.ape], fi = m.dir > 0 ? 0 : 1;
      const fr = !m.alive ? S.dead : m.shotT > 0 ? S.shot : m.st === 'aim' ? S.aim : S.idle[Math.floor(animT * 2 + m.c) % 2];
      const img = fr[fi];
      if (!m.alive) ctx.globalAlpha = Math.min(1, m.deadT * 2);
      ctx.drawImage(img, Math.round(m.x + 6 - (img.width - 1) / 2), Math.round(m.y + T - img.height + 1) - cy);
      ctx.globalAlpha = 1;
    }
    for (const b of E.lobs) { const x = Math.round(b.x), y = Math.round(b.y) - cy; const k = b.k === 'N' ? ['#8aa0b8', '#ffffff'] : b.k === 'F' ? ['#3a2412', '#9a6a36'] : ['#5a1a10', '#fa6a0a']; ctx.fillStyle = COL.ink; circle(x, y, 3); ctx.fillStyle = k[0]; circle(x, y, 2); ctx.fillStyle = k[1]; ctx.fillRect(x - 1, y - 1, 2, 1); }
    for (const w of E.saws) {
      const x = Math.round(w.x), y = Math.round(w.y) - cy, lt = skin.saw === 'light';
      for (let k = 0; k < 8; k++) { const a = w.a * w.dir + k * Math.PI / 4; ctx.fillStyle = lt ? '#fff4c0' : '#c8c8d8'; ctx.fillRect(Math.round(x + Math.cos(a) * 6) - 1, Math.round(y + Math.sin(a) * 6) - 1, 2, 2); }
      ctx.fillStyle = COL.ink; circle(x, y, 5); ctx.fillStyle = lt ? '#e0b050' : '#7a7a8c'; circle(x, y, 4); ctx.fillStyle = lt ? '#ffffff' : '#b4b4c8'; circle(x, y, 2); ctx.fillStyle = COL.ink; ctx.fillRect(x, y, 1, 1);
    }
    for (const v of E.stal) {
      if (v.st === 'gone') continue;
      const dx = v.st === 'shake' ? Math.round((Math.random() - 0.5) * 2) : 0, h = Math.max(1, Math.round(10 * v.grow));
      const x = v.x + 3 + dx, y = Math.round(v.y) - cy;
      const sc = STALC[skin.stal];
      for (let j = 0; j < h; j++) { const w = Math.max(1, Math.round(6 * (1 - j / 10))); ctx.fillStyle = j === 0 ? '#120a14' : sc[0]; ctx.fillRect(x + Math.floor((6 - w) / 2), y + j, w, 1); if (w > 2) { ctx.fillStyle = sc[1]; ctx.fillRect(x + Math.floor((6 - w) / 2), y + j, 1, 1); } }
    }
    for (const c of E.imps) {
      if (!c.alive && !(c.deadT > 0)) continue;
      const F = SP.fly[skin.fly], fi = c.dir > 0 ? 0 : 1;
      const img = c.alive ? F.f[Math.floor(c.t * 8) % 4][fi] : F.dead[fi];
      if (!c.alive) ctx.globalAlpha = Math.min(1, c.deadT * 2);
      ctx.drawImage(img, Math.round(c.x + 9 - (img.width - 1) / 2), Math.round(c.y + 9 - img.height / 2) - cy);
      ctx.globalAlpha = 1;
    }
    for (const w of E.swoops) {
      if (!w.alive && !(w.deadT > 0)) continue;
      const F = SP.fly[skin.swoop], fi = w.dir > 0 ? 0 : 1;
      const img = w.alive ? F.f[Math.floor(animT * (w.st === 'dive' ? 16 : 7)) % 4][fi] : F.dead[fi];
      if (!w.alive) ctx.globalAlpha = Math.min(1, w.deadT * 2);
      ctx.drawImage(img, Math.round(w.x - (img.width - 1) / 2), Math.round(w.y - img.height / 2) - cy);
      ctx.globalAlpha = 1;
      if (w.st === 'warn' && Math.floor(animT * 12) % 2) FONT.draw(ctx, '!', Math.round(w.x), Math.round(w.y) - 16 - cy, COL.red, { align: 'center', outline: COL.ink });
    }
    for (const g of E.ghosts) {
      const wsp = skin.ghost === 'wisp', G = wsp ? SP.wisp : SP.ghost, img = g.vis ? G[Math.floor(animT * 6 + g.hx) % 4] : (wsp ? SP.wispDead : SP.ghostDead);
      ctx.globalAlpha = g.vis ? 0.35 + 0.55 * g.fade : 0.12;
      ctx.save(); const x = Math.round(g.x), y = Math.round(g.y + Math.sin(animT * 3 + g.hx) * 1.5) - cy;
      if (g.dir < 0) { ctx.translate(x, 0); ctx.scale(-1, 1); ctx.drawImage(img, -Math.round(img.width / 2), y - Math.round(img.height / 2)); }
      else ctx.drawImage(img, x - Math.round(img.width / 2), y - Math.round(img.height / 2));
      ctx.restore(); ctx.globalAlpha = 1;
    }
    drawBossFx(cy);
    if (L.def.rise) drawRisingLava(cy);
    for (const q of parts) {
      ctx.globalAlpha = Math.min(1, q.life / (q.max * 0.5));
      ctx.fillStyle = q.c;
      if (q.streak) ctx.fillRect(Math.round(q.x), Math.round(q.y) - cy, q.streak, 1);
      else ctx.fillRect(Math.round(q.x), Math.round(q.y) - cy, q.s, q.s);
    }
    ctx.globalAlpha = 1;
    drawFx(state === 'play' ? frameDt : 0);
    for (const q of pops) { ctx.globalAlpha = Math.min(1, q.life * 2); FONT.draw(ctx, q.text, Math.max(30, Math.min(VW - 30, q.x)), q.y - cy, q.c, { align: 'center', outline: COL.ink }); }
    ctx.globalAlpha = 1;
    drawHUD();
    drawHint();
    if (L.def.wind && windPhase !== 'calm') {
      const on = windPhase === 'gust' || Math.floor(animT * 6) % 2 === 0;
      const wn = theme === 'ceniza' ? 'CENIZA' : stageOf(li) === 1 ? 'VENTISCA' : 'VIENTO';
      if (on) FONT.draw(ctx, windPhase === 'gust' ? (windDir > 0 ? wn + ' ▶▶' : '◀◀ ' + wn) : '¡RÁFAGA!', VW / 2, 26, windPhase === 'gust' ? '#ffffff' : COL.gold, { align: 'center', outline: COL.ink });
    }
    if (B && B.st === 'intro' && B.t > 1.6) {
      const a = Math.min(1, (B.t - 1.6) / 0.4, (3.6 - B.t) / 0.4);
      ctx.globalAlpha = Math.max(0, a);
      ctx.fillStyle = 'rgba(18,6,8,0.75)'; ctx.fillRect(0, VH * 0.6, VW, 40);
      FONT.draw(ctx, 'JEFE DE LA ETAPA ' + (L.def.stage + 1), VW / 2, VH * 0.6 + 6, COL.dim, { align: 'center' });
      const sc = FONT.measure(B.name) * 2 + 10 <= VW ? 2 : 1, g = gradText(B.name, sc, '#ffffff', B.col);
      ctx.drawImage(g, Math.round(VW / 2 - g.width / 2), Math.round(VH * 0.6 + (sc === 2 ? 13 : 18)));
      ctx.globalAlpha = 1;
    }
    if (introT > 0 && !(B && B.st !== 'sleep')) drawIntro();
    if (fadeT > 0) { ctx.fillStyle = 'rgba(10,6,12,' + Math.min(1, fadeT / 0.35) + ')'; ctx.fillRect(0, 0, VW, VH); }
    if (deathT > 0 && deathT < 0.3) { ctx.fillStyle = 'rgba(10,6,12,' + (1 - deathT / 0.3) + ')'; ctx.fillRect(0, 0, VW, VH); }
    if (catchT > 0 && catchT < 0.25) { ctx.fillStyle = 'rgba(10,6,12,' + (1 - catchT / 0.25) + ')'; ctx.fillRect(0, 0, VW, VH); }
  }
  function drawRisingLava(cy) {
    const y = Math.round(lavaY) - cy;
    for (let k = 0; k < 24; k += 3) { ctx.globalAlpha = (1 - k / 24) * 0.35; ctx.fillStyle = '#fa6a0a'; ctx.fillRect(0, y - k - 3, VW, 3); }
    ctx.globalAlpha = 1;
    if (y < VH) {
      ctx.fillStyle = '#8a1a0a'; ctx.fillRect(0, y + 2, VW, VH - y);
      ctx.fillStyle = '#b8301a'; ctx.fillRect(0, y + 4, VW, 6);
      for (let i = 0; i < VW; i++) {
        const w = Math.sin(animT * 2.5 + i * 0.13) * 2 + Math.sin(animT * 4 + i * 0.31);
        ctx.fillStyle = '#fa6a0a'; ctx.fillRect(i, Math.round(y + w), 1, 3);
        if ((i + Math.floor(animT * 9)) % 7 === 0) { ctx.fillStyle = '#ffd541'; ctx.fillRect(i, Math.round(y + w), 1, 1); }
      }
      for (let k = 0; k < 6; k++) { const bx = (k * 37 + Math.floor(animT * 20) * 13) % VW; ctx.fillStyle = '#ffd541'; ctx.fillRect(bx, y + 12 + (k * 11) % 30, 2, 1); }
    } else if (y - VH < 80 && Math.floor(animT * 4) % 2 === 0) {
      FONT.draw(ctx, '▼ ¡LAVA! ▼', VW / 2, VH - 12, COL.ember, { align: 'center', outline: COL.ink });
    }
  }
  function drawSign(x, y) {
    ctx.fillStyle = '#2a1206'; ctx.fillRect(x + 5, y + 4, 2, 8);
    ctx.fillStyle = '#5a3a1e'; ctx.fillRect(x + 1, y, 10, 6);
    ctx.fillStyle = '#e8d8b0'; ctx.fillRect(x + 2, y + 1, 8, 4);
    ctx.fillStyle = '#8a5a2e'; ctx.fillRect(x + 1, y, 10, 1); ctx.fillRect(x + 1, y + 5, 10, 1);
    ctx.fillStyle = '#5a2a5a'; ctx.fillRect(x + 4, y + 2, 1, 2); ctx.fillRect(x + 6, y + 2, 2, 1); ctx.fillRect(x + 7, y + 3, 1, 1);
  }
  function drawBanner(f, cy) {
    if (!E.flagOn && !(E.flagRise > 0)) return;
    const img = SP.banner[Math.floor(animT * 5) % 3], base = f.y + T - cy;
    const x = Math.round(f.x + 5 - (img.width - 1) / 2), y = Math.round(base - img.height + (1 - E.flagRise) * img.height);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, VW, base); ctx.clip(); ctx.drawImage(img, x, y); ctx.restore();
    if (E.flagRise >= 1 && Math.floor(animT * 2) % 2 === 0) { ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 16 + Math.floor(Math.random() * 8), y + 2 + Math.floor(Math.random() * 8), 1, 1); }
  }

  const ROCKC = { pine: ['#2a160a', '#6a4422', '#c8964e'], snow: ['#5a6a8a', '#e4ecf6', '#ffffff'], fire: ['#2a1a1a', '#5e4446', '#fa6a0a'], debris: ['#1a1620', '#5a5466', '#9a94a8'], light: ['#a07830', '#ffe8a0', '#ffffff'] };
  const STALC = { obs: ['#3e2e5a', '#b8a0f0'], ice: ['#4a8ac0', '#e0f8ff'], wood: ['#4a3220', '#9a6a36'], iron: ['#4a4a58', '#b4b4c8'], crystal: ['#c0a060', '#ffffff'] };
  const VENTC = { fire: ['#ffffff', '#ffd541', '#fa6a0a', '#c8301a'], steam: ['#ffffff', '#e4ecf6', '#a8c0d8', '#6a8ab8'], ghostfire: ['#ffffff', '#bff4ff', '#5ac0c0', '#2a6a8a'],
    light: ['#ffffff', '#fff4c0', '#f0d080', '#c09040'], spore: ['#ffffff', '#c8f07a', '#7ad65a', '#6a3a86'] };
  function drawVent(v, cy) {
    const x = v.x, y = v.y - cy, vc = VENTC[skin.vent];
    ctx.fillStyle = '#1a1012'; ctx.fillRect(x + 2, y + 8, 8, 4); ctx.fillStyle = '#4a3a3a'; ctx.fillRect(x + 3, y + 8, 6, 3); ctx.fillStyle = v.warn || v.on ? '#ffd541' : '#5a1a10'; ctx.fillRect(x + 5, y + 8, 2, 1);
    if (v.on) {
      for (let j = 0; j < 32; j++) {
        const w = Math.max(1, Math.round((4 - j / 10) + Math.sin(animT * 30 + j) * 1.2));
        const c = j < 6 ? vc[0] : j < 14 ? vc[1] : j < 24 ? vc[2] : vc[3];
        ctx.fillStyle = c; ctx.fillRect(x + 6 - w + Math.round(Math.sin(animT * 20 + j * 0.5)), y + 8 - j, w * 2, 1);
      }
    }
  }
  function ropePath(ax, ay, bx, by, sag, cy) {
    const d = Math.hypot(bx - ax, by - ay), n = Math.max(2, Math.ceil(d / 1.5));
    for (let i = 0; i <= n; i++) {
      const t = i / n, x = ax + (bx - ax) * t, y = ay + (by - ay) * t + Math.sin(t * Math.PI) * sag, sy = Math.round(y) - cy;
      if (sy < -2 || sy > VH + 2) continue;
      ctx.fillStyle = (i % 6 < 1) ? '#e8f8ff' : '#bfeaf0'; ctx.fillRect(Math.round(x), sy, 1, 1);
    }
  }
  function drawRope(cy) {
    for (let i = 0; i < clips.length - 1; i++) {
      const a = clips[i], b = clips[i + 1];
      if (Math.max(a.ay, b.ay) < cy - 10 || Math.min(a.ay, b.ay) > cy + VH + 10) continue;
      ropePath(a.ax, a.ay, b.ax, b.ay, Math.min(10, Math.hypot(b.ax - a.ax, b.ay - a.ay) * 0.06), cy);
    }
    if (deathT > 0) return;
    const a = clips[clips.length - 1], px = player.x + PW / 2, py = player.y + 9;
    const d = Math.hypot(px - a.ax, py - a.ay);
    ropePath(a.ax, a.ay, px, py, catchT > 0 ? 0 : Math.min(14, d * 0.12), cy);
    if (a.start) { ctx.fillStyle = '#7ef3ff'; ctx.fillRect(a.ax - 1, a.ay - cy, 3, 2); }
  }
  function drawPlayer(cy) {
    if (deathT > 0) return;
    const p = player, S = hero;
    let img, fi = p.facing > 0 ? 0 : 1;
    if (p.state === 'climb') img = S.climb[Math.floor(climbAnim / 0.16) % 2][fi];
    else if (p.state === 'rope') img = S.rope[Math.floor(climbAnim / 0.16) % 2][fi];
    else if (catchT > 0) img = S.fall[fi];
    else if (p.onGround) {
      if (Math.abs(p.vx) > 12) img = S.run[Math.floor(runAnim / 0.1) % 4][fi];
      else { blinkT += 1 / 60; img = S.idle[(blinkT % 2.4) > 1.2 ? 1 : 0][fi]; }
    } else if (p.vy < 0) img = S.jump[fi];
    else {
      const into = (keys.ArrowRight || keys.KeyD || touch.right) ? 1 : (keys.ArrowLeft || keys.KeyA || touch.left) ? -1 : 0;
      const slide = into !== 0 && CORE.rectAny(L, into > 0 ? p.x + PW : p.x - 1, p.y + 2, 1, PH - 4, CORE.solid);
      img = slide ? S.slide[into > 0 ? 0 : 1] : S.fall[fi];
    }
    const x = Math.round(p.x + PW / 2) - (img.width - 1) / 2, y = Math.round(p.y + PH) - img.height - cy;
    if (p.levT > 0) { ctx.globalAlpha = 0.3 + 0.15 * Math.sin(animT * 20); ctx.fillStyle = '#bff4ff'; circle(Math.round(p.x + PW / 2), Math.round(p.y + PH / 2) - cy, 9); ctx.globalAlpha = 1; }
    if ((fadeT > 0 && Math.floor(fadeT * 20) % 2) || (invT > 0 && Math.floor(invT * 14) % 2)) ctx.globalAlpha = 0.35;
    ctx.drawImage(img, x, y);
    ctx.globalAlpha = 1;
    if (p.stamina < K.ST_MAX - 0.5 || p.state === 'climb') {
      const r = Math.max(0, p.stamina / K.ST_MAX);
      const col = r > 0.5 ? COL.green : r > 0.25 ? COL.gold : (Math.floor(animT * 10) % 2 ? COL.red : '#ffffff');
      const bx = Math.round(p.x + PW / 2) - 7;
      ctx.fillStyle = COL.ink; ctx.fillRect(bx, y - 3, 14, 4);
      ctx.fillStyle = '#3a2a40'; ctx.fillRect(bx + 1, y - 2, 12, 2);
      ctx.fillStyle = col; ctx.fillRect(bx + 1, y - 2, Math.round(12 * r), 2);
    }
  }
  const HEART = ['.KK.KK.', 'KrrKrrK', 'KrwrrrK', 'KrrrrrK', '.KrrrK.', '..KrK..', '...K...'];
  function drawHeart(x, y, full, sc) {
    sc = sc || 1;
    for (let j = 0; j < 7; j++) for (let i = 0; i < 7; i++) {
      const ch = HEART[j][i]; if (ch === '.') continue;
      ctx.fillStyle = ch === 'K' ? COL.ink : !full ? '#4a3040' : ch === 'w' ? '#ffd8dc' : '#e8304a';
      ctx.fillRect(x + i * sc, y + j * sc, sc, sc);
    }
  }
  const FEATHER = ['.......KK', '......KwK', '.....KwwK', '....KwccK', '...KwccK.', '..KwccK..', '.KwccK...', '.KccK....', 'KKKK.....', 'K........'];
  function drawFeather(x, y, sc) {
    sc = sc || 1;
    for (let j = 0; j < FEATHER.length; j++) for (let i = 0; i < 9; i++) {
      const ch = FEATHER[j][i]; if (ch === '.') continue;
      ctx.fillStyle = ch === 'K' ? '#14324a' : ch === 'w' ? '#ffffff' : '#7ef3ff'; ctx.fillRect(x + i * sc, y + j * sc, sc, sc);
    }
  }
  function drawPowerPickup(cy) {
    const h = E.power; if (!h || h.got) return;
    const x = h.x + 1, y = Math.round(h.y - 2 + Math.sin(animT * 3) * 2) - cy;
    ctx.globalAlpha = 0.25 + 0.15 * Math.sin(animT * 5); ctx.fillStyle = '#7ef3ff'; circle(x + 5, y + 6, 9); ctx.globalAlpha = 1;
    drawFeather(x - 4, y - 6, 2);
    if (Math.floor(animT * 3) % 2 === 0) { ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 12, y - 3, 1, 1); ctx.fillRect(x - 5, y + 14, 1, 1); }
  }
  function drawHeartPickup(cy) {
    const h = E.heart; if (!h || h.got) return;
    const x = h.x + 1, y = Math.round(h.y + Math.sin(animT * 3) * 1.5) - cy;
    const g = 0.25 + 0.15 * Math.sin(animT * 5);
    ctx.globalAlpha = g; ctx.fillStyle = '#ff6a7a'; circle(x + 5, y + 5, 8); ctx.globalAlpha = 1;
    drawHeart(x - 2, y - 2, true, 2);
    if (Math.floor(animT * 3) % 2 === 0) { ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 9, y - 3, 1, 1); ctx.fillRect(x - 3, y + 8, 1, 1); }
  }
  function drawHUD() {
    ctx.fillStyle = 'rgba(18,10,20,0.75)'; ctx.fillRect(0, 0, VW, 12);
    ctx.drawImage(SP.gem[0], 2, 1);
    FONT.draw(ctx, got + '/3', 12, 3, '#ff9a8a');
    if (hpMax() > 1) for (let k = 0; k < hpMax(); k++) drawHeart(36 + k * 9, 3, k < hp);
    if (save.lev) { const used = player.levUsed && !player.onGround; ctx.globalAlpha = used ? 0.35 : 1; drawFeather(hpMax() > 1 ? 56 : 36, 1); ctx.globalAlpha = 1; }
    if (powMsgT > 0) {
      ctx.globalAlpha = Math.min(1, powMsgT);
      ctx.fillStyle = 'rgba(8,24,40,0.88)'; ctx.fillRect(8, 40, VW - 16, 50); ctx.fillStyle = COL.rune; ctx.fillRect(8, 40, VW - 16, 1); ctx.fillRect(8, 89, VW - 16, 1);
      FONT.draw(ctx, '¡PLUMA DE GRIFO!', VW / 2, 45, COL.rune, { align: 'center', outline: COL.ink });
      FONT.draw(ctx, 'EN EL AIRE, VUELVE A SALTAR', VW / 2, 57, COL.cream, { align: 'center' });
      FONT.draw(ctx, 'Y MANTÉN: FLOTAS HACIA ARRIBA', VW / 2, 67, COL.cream, { align: 'center' });
      FONT.draw(ctx, 'UNA VEZ POR SALTO · PARA SIEMPRE', VW / 2, 78, COL.dim, { align: 'center' });
      ctx.globalAlpha = 1;
    }
    FONT.draw(ctx, fmtTime(time), VW / 2, 3, COL.cream, { align: 'center' });
    if (heartMsgT > 0) {
      ctx.globalAlpha = Math.min(1, heartMsgT);
      ctx.fillStyle = 'rgba(40,8,16,0.85)'; ctx.fillRect(10, 40, VW - 20, 40); ctx.fillStyle = '#ff6a7a'; ctx.fillRect(10, 40, VW - 20, 1); ctx.fillRect(10, 79, VW - 20, 1);
      FONT.draw(ctx, '¡CORAZÓN EXTRA!', VW / 2, 45, '#ff8a9a', { align: 'center', outline: COL.ink });
      FONT.draw(ctx, 'AHORA RESISTES UN ATAQUE', VW / 2, 57, COL.cream, { align: 'center' });
      FONT.draw(ctx, 'Y LO CONSERVAS SIEMPRE', VW / 2, 67, COL.dim, { align: 'center' });
      ctx.globalAlpha = 1;
    }
    FONT.draw(ctx, '▼' + falls, VW - 18, 3, '#f0a090', { align: 'right' });
    ctx.fillStyle = COL.cream; ctx.fillRect(VW - 11, 3, 2, 7); ctx.fillRect(VW - 7, 3, 2, 7);
    hits.push({ x: VW - 16, y: 0, w: 16, h: 14, fn: openPause });
    if (!B) FONT.draw(ctx, fmtAlt(altitude()), VW - 3, 15, COL.cream, { align: 'right', outline: COL.ink });
    const top = 26, bot = VH - 14, h = bot - top;
    const pr = 1 - (player.y + PH) / (L.H * T), fy = 1 - (E.flag.y + T) / (L.H * T);
    ctx.fillStyle = 'rgba(18,10,20,0.5)'; ctx.fillRect(VW - 3, top, 2, h);
    ctx.fillStyle = '#7ef3ff'; ctx.fillRect(VW - 4, Math.round(bot - h * fy) - 1, 4, 2);
    if (L.def.rise && lavaY < L.H * T) { const lr = Math.max(0, 1 - lavaY / (L.H * T)); ctx.fillStyle = '#fa6a0a'; ctx.fillRect(VW - 3, Math.round(bot - h * lr), 2, Math.round(h * lr)); }
    ctx.fillStyle = COL.gold; ctx.fillRect(VW - 4, Math.round(bot - h * Math.min(pr, fy)) - 1, 4, 3);
    if (B && B.st !== 'sleep' && B.st !== 'dead') {
      FONT.draw(ctx, B.name, VW / 2, 15, B.col, { align: 'center', outline: COL.ink });
      const cf = B.cfg;
      for (let k = 0; k < 3; k++) {
        const x = VW / 2 - 33 + k * 23, done = k >= B.hp;
        ctx.fillStyle = COL.ink; ctx.fillRect(x - 1, 24, 22, 5);
        ctx.fillStyle = done ? cf.runeFx[1] : (B.st === 'hurt' && k === B.hp - 1 ? '#ffffff' : cf.ball[1]); ctx.fillRect(x, 25, 20, 3);
        ctx.fillStyle = done ? cf.runeFx[0] : cf.ball[2]; ctx.fillRect(x, 25, 20, 1);
      }
    }
  }
  function hintText(s) {
    const tp = lastDevice === 'touch' || lastDevice === 'pad';
    if (lastDevice === 'pad') s = s.replace(/\{DIAG\}/g, '◀/▶ + Ⓐ');
    return s.replace(/\{LR\}/g, '◀ ▶').replace(/\{UD\}/g, '▲ ▼').replace(/\{UP\}/g, '▲').replace(/\{JUMP\}/g, tp ? '↑' : 'ESPACIO').replace(/\{JUMPU\}/g, tp ? '↑' : 'ESPACIO')
      .replace(/\{DIAG\}/g, tp ? '↖ / ↗' : 'Q / E').replace(/\{GRAB\}/g, tp ? '▲' : 'SHIFT');
  }
  function drawHint() {
    if (hintA <= 0 || hintShown < 0 || (B && B.st === 'intro')) return;
    const lines = FONT.wrap(hintText(L.def.hints[hintShown] || ''), VW - 22);
    const h = lines.length * 10 + 8, y = (player.y - cam) > VH * 0.5 ? 32 : VH - h - 6;
    ctx.globalAlpha = hintA;
    ctx.fillStyle = '#2a1608'; ctx.fillRect(4, y, VW - 8, h);
    ctx.fillStyle = COL.wood; ctx.fillRect(4, y, VW - 8, 1); ctx.fillRect(4, y + h - 1, VW - 8, 1); ctx.fillRect(4, y, 1, h); ctx.fillRect(VW - 5, y, 1, h);
    ctx.fillStyle = '#5a3a1e'; ctx.fillRect(5, y + 1, VW - 10, 1);
    lines.forEach((ln, i) => FONT.draw(ctx, ln, 11, y + 5 + i * 10, COL.cream, { shadow: '#000000' }));
    ctx.globalAlpha = 1;
  }
  function drawIntro() {
    const a = Math.min(1, introT / 0.5, (2.4 - introT) / 0.3);
    ctx.globalAlpha = Math.max(0, a);
    const y = Math.round(VH * 0.32);
    ctx.fillStyle = 'rgba(18,10,20,0.8)'; ctx.fillRect(0, y, VW, 62);
    ctx.fillStyle = COL.gold; ctx.fillRect(0, y, VW, 1); ctx.fillRect(0, y + 61, VW, 1);
    FONT.draw(ctx, 'ETAPA ' + (stageOf(li) + 1) + ' · NIVEL ' + (li % 10 + 1), VW / 2, y + 7, COL.dim, { align: 'center' });
    const nm = LEVELS[li].name.toUpperCase(), gsc = FONT.measure(nm) * 2 + 10 <= VW ? 2 : 1, gg = STAGES[stageOf(li)].grad;
    const g = gradText(nm, gsc, gg[0], gg[1]);
    ctx.drawImage(g, Math.round(VW / 2 - g.width / 2), y + 15);
    FONT.draw(ctx, LEVELS[li].sub + ' · ' + fmtAlt(ALT[li][1]), VW / 2, y + 46, COL.cream, { align: 'center' });
    ctx.globalAlpha = 1;
  }

  // ---------- menús ----------
  function toggleMute() { save.muted = !save.muted; AUDIO.setMuted(save.muted); writeSave(); document.getElementById('mMute').textContent = save.muted ? '♪ NO' : '♪ SÍ'; }
  function openPause() { if (state !== 'play') return; state = 'pause'; menuIdx = 0; AUDIO.setWind(0); }
  function closePause() { state = 'play'; }
  function goTitle() { state = 'title'; menuIdx = 0; AUDIO.play('titulo'); AUDIO.setWind(0); }
  function menuNav(m, n, act) {
    if (m.up) { menuIdx = (menuIdx + n - 1) % n; AUDIO.sfx('move'); }
    if (m.down) { menuIdx = (menuIdx + 1) % n; AUDIO.sfx('move'); }
    if (m.ok) { AUDIO.sfx('select'); act(menuIdx); }
  }
  function drawMenu(items, cx, y0, gap, sel, onPick) {
    items.forEach((it, i) => {
      const y = y0 + i * gap, w = FONT.measure(it) + 24, on = i === sel;
      if (on) {
        ctx.fillStyle = 'rgba(242,194,48,0.18)'; ctx.fillRect(Math.round(cx - w / 2), y - 4, w, 15);
        ctx.fillStyle = COL.gold; ctx.fillRect(Math.round(cx - w / 2), y - 4, 2, 15); ctx.fillRect(Math.round(cx + w / 2) - 2, y - 4, 2, 15);
        if (Math.floor(animT * 3) % 2 === 0) FONT.draw(ctx, '▶', Math.round(cx - w / 2) + 5, y, COL.gold);
      }
      FONT.draw(ctx, it, cx, y, on ? COL.cream : COL.dim, { align: 'center', outline: COL.ink });
      hits.push({ x: cx - w / 2 - 6, y: y - 6, w: w + 12, h: gap, fn: () => { if (menuIdx !== i) { menuIdx = i; AUDIO.sfx('move'); } else AUDIO.sfx('select'); onPick(i); } });
    });
  }
  function scene(themeName, t) { if (!titleBg || titleBg.th !== ART.THEMES[themeName]) titleBg = makeBg(themeName, 4242); drawBackdrop(titleBg, t, 0); }


  // el Monte Sagrado: bosque abajo, nieve, cráter, la torre y la luz arriba
  function drawMountain(cx, baseY, h, hw) {
    const topY = baseY - h;
    const prof = x => { const d = Math.abs(x - cx) / hw; return topY + Math.round(h * Math.pow(Math.min(1.4, d), 1.25)) + Math.round(Math.sin(x * 0.21) * 2 + Math.sin(x * 0.07) * 3); };
    for (let x = 0; x < VW; x++) {
      const t = prof(x); if (t >= VH) continue;
      for (let y = Math.max(0, t); y < VH; y++) {
        const k = (y - topY) / h;
        let c = k < 0.12 ? '#3a2a30' : k < 0.34 ? '#dce8f4' : k < 0.62 ? '#46506a' : '#1e3a24';
        if (k >= 0.12 && k < 0.34 && (x + y) % 7 === 0) c = '#a8c0d8';
        if (k >= 0.62 && (x * 7 + y * 3) % 11 === 0) c = '#2e5a2a';
        if (x < cx - 2 && k > 0.1) c = ART.mixHex(c, '#000000', 0.22);
        ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1);
      }
    }
    // pinos en la falda
    for (let k = 0; k < 26; k++) { const x = (k * 37) % VW, y = prof(x) + 12 + (k % 3) * 4; if (y > baseY - h * 0.38 && y < VH) { ctx.fillStyle = '#12261a'; for (let j = 0; j < 9; j++) ctx.fillRect(x - Math.floor((9 - j) / 2.5), y - j, Math.floor((9 - j) / 1.25) + 1, 1); } }
    // resplandor del cráter
    for (let x = cx - 9; x <= cx + 9; x++) { ctx.fillStyle = Math.floor(animT * 6 + x) % 5 ? '#fa6a0a' : '#ffd541'; ctx.fillRect(x, topY + 3 + Math.round(Math.abs(x - cx) * 0.25), 1, 1); }
    // la torre fantasma
    const tx = cx - 5, ty = topY - 38;
    ctx.fillStyle = '#16141e'; ctx.fillRect(tx, ty, 11, 40); ctx.fillRect(tx - 2, ty - 2, 15, 3);
    for (let k = 0; k < 4; k++) ctx.fillRect(tx - 2 + k * 4, ty - 5, 2, 3);
    ctx.fillStyle = '#7aa0d0'; ctx.globalAlpha = 0.6 + 0.3 * Math.sin(animT * 2); ctx.fillRect(tx + 4, ty + 8, 3, 4); ctx.fillRect(tx + 4, ty + 20, 3, 4); ctx.globalAlpha = 1;
    // escalera de luz hacia el plano espiritual
    for (let k = 0; k < 12; k++) { const yy = ty - 10 - k * 7, xx = cx + Math.round(Math.sin(k * 0.9) * 10); ctx.globalAlpha = 0.25 + 0.5 * (1 - k / 12) * (0.5 + 0.5 * Math.sin(animT * 3 - k)); ctx.fillStyle = '#fff4c0'; ctx.fillRect(xx - 3, yy, 7, 1); }
    ctx.globalAlpha = 1;
  }

  // título
  function titleItems() { const it = ['JUGAR', 'MAPA DEL MONTE', 'CAPAS', 'CÓMO JUGAR', 'SONIDO: ' + (save.muted ? 'NO' : 'SÍ')]; if (window.EE_CLOUD) it.push('NUBE: ' + (EE_CLOUD.user() ? 'CONECTADA' : 'GOOGLE')); if (Object.keys(save.best).length) it[0] = 'CONTINUAR'; return it; }
  function updateTitle(dt, inp, m) { animT += dt; menuNav(m, titleItems().length, titlePick); }
  function playLevel(i) {
    runStats = { time: 0, falls: 0, gems: 0 };
    if (i % 10 === 0 && !(save.story || {})[stageOf(i)]) { state = 'story'; storyI = stageOf(i); storyT = 0; storyNext = i; AUDIO.play(songFor(STAGES[storyI].scene)); return; }
    startLevel(i);
  }
  function titlePick(i) {
    if (i === 0) playLevel(nextLevel());
    else if (i === 1) { state = 'select'; menuIdx = nextLevel(); }
    else if (i === 2) { state = 'cloaks'; menuIdx = save.cloak || 0; }
    else if (i === 3) { state = 'help'; menuIdx = 0; }
    else if (i === 4) toggleMute();
    else { state = 'cloud'; menuIdx = 0; confirmQ = null; }
  }
  // ---------- nube (cuenta Google; solo en la web publicada) ----------
  let confirmQ = null;
  function cloudItems() {
    if (confirmQ) return [confirmQ.yes, confirmQ.no];
    const u = window.EE_CLOUD && EE_CLOUD.user();
    return u ? ['SALIR DE LA CUENTA', 'BORRAR DATOS DE LA NUBE', 'PRIVACIDAD', 'VOLVER'] : ['CONECTAR CON GOOGLE', 'PRIVACIDAD', 'VOLVER'];
  }
  function cloudPick(i) {
    const C = window.EE_CLOUD;
    if (confirmQ) { const q = confirmQ; confirmQ = null; menuIdx = 0; if (i === 0) q.fn(); return; }
    const it = cloudItems()[i];
    if (it === 'VOLVER') { goTitle(); menuIdx = 5; return; }
    if (it === 'PRIVACIDAD') { location.href = 'privacidad.html'; return; }
    if (!C) return;
    if (it === 'CONECTAR CON GOOGLE') { /* se abre en cloudLoginGesture (al soltar el dedo / clic / tecla) */ }
    else if (it === 'SALIR DE LA CUENTA') { confirmQ = { q: '¿CERRAR SESIÓN?', d: 'Tu progreso sigue guardado en este dispositivo.', yes: 'SALIR', no: 'CANCELAR', fn: () => C.logout() }; menuIdx = 1; }
    else if (it === 'BORRAR DATOS DE LA NUBE') { confirmQ = { q: '¿BORRAR TUS DATOS DE LA NUBE?', d: 'Se elimina tu copia en la nube y tu cuenta del juego. El progreso de este dispositivo se mantiene.', yes: 'BORRAR', no: 'CANCELAR', fn: () => C.wipe() }; menuIdx = 1; }
  }
  function updateCloud(dt, inp, m) { animT += dt; if (m.back) { AUDIO.sfx('back'); if (confirmQ) { confirmQ = null; menuIdx = 0; } else { goTitle(); menuIdx = 5; } return; } menuNav(m, cloudItems().length, cloudPick); }
  function renderCloud() {
    scene('astral3', 0.5);
    ctx.fillStyle = 'rgba(18,10,20,0.82)'; ctx.fillRect(0, 0, VW, VH);
    const tt = gradText('NUBE', 3, '#e0f8ff', '#4a9ad0'); ctx.drawImage(tt, Math.round(VW / 2 - tt.width / 2), 10);
    const C = window.EE_CLOUD, info = C ? C.info() : { text: 'La nube solo está en la versión web.', err: false };
    let y = 60;
    const para = (t, c) => { for (const l of FONT.wrap(t, VW - 24)) { FONT.draw(ctx, l, VW / 2, y, c, { align: 'center' }); y += 10; } y += 4; };
    if (confirmQ) { para(confirmQ.q, COL.gold); para(confirmQ.d, COL.cream); }
    else {
      para('Guarda tu avance en tu cuenta de Google y sigue en otro celular o computador.', COL.cream);
      para(info.text, info.err ? COL.red : info.ok ? COL.green : COL.dim);
      para('Solo se guarda tu progreso (niveles, gemas, capas y poderes), con un identificador interno. Sin nombre ni correo.', COL.dim);
    }
    const h0 = hits.length;
    drawMenu(cloudItems(), VW / 2, Math.max(y + 8, Math.round(VH * 0.55)), 16, menuIdx, cloudPick);
    cloudItems().forEach((it, i) => { if (it === 'CONECTAR CON GOOGLE' && hits[h0 + i]) hits[h0 + i].login = i + 1; });
  }
  function renderTitle() {
    scene('cumbre', 0.95);
    drawMountain(96, VH + 10, Math.round(VH * 0.62), 92);
    // el Carcelero vigila desde la luz
    const G = SPR.boss('carcelero');
    ctx.globalAlpha = 0.16 + 0.05 * Math.sin(animT * 1.5);
    const gi = G.idle[Math.floor(animT * 2) % G.idle.length];
    ctx.drawImage(gi, Math.round(96 - gi.width * 0.35), Math.round(VH * 0.24), Math.round(gi.width * 0.7), Math.round(gi.height * 0.7));
    ctx.globalAlpha = 1;
    // heroína en una saliente
    const H = hero;
    ctx.fillStyle = '#1a1416'; ctx.fillRect(132, VH - 34, 60, 34); ctx.fillStyle = '#3a4a3a'; ctx.fillRect(132, VH - 34, 60, 2);
    { const hi = H.idle[Math.floor(animT * 1.2) % 2][1]; ctx.drawImage(hi, 156 - (hi.width - 1) / 2, VH - 34 - hi.height); }
    const bat = SP.fly.bat.f[Math.floor(animT * 8) % 4][0];
    ctx.drawImage(bat, Math.round((animT * 24) % (VW + 40) - 20), Math.round(VH * 0.52 + Math.sin(animT * 2) * 6));
    // logo de la saga
    const ly = Math.round(VH * 0.06);
    const sag = gradText('CUENTOS DEL MEDIOEVO', 1, '#ffe8a0', '#d89a40');
    ctx.drawImage(sag, Math.round(VW / 2 - sag.width / 2), ly);
    const t1 = gradText('ESCALADA', 3, '#ffe07a', '#e0702a'), t2 = gradText('ÉPICA', 3, '#ffd060', '#c84a1a');
    ctx.drawImage(t1, Math.round(VW / 2 - t1.width / 2), ly + 12);
    ctx.drawImage(t2, Math.round(VW / 2 - t2.width / 2), ly + 40);
    if (REVISION) FONT.draw(ctx, 'MODO REVISIÓN · 50 NIVELES ABIERTOS', VW / 2, ly + 86, '#7ef3ff', { align: 'center', outline: COL.ink });
    const items = titleItems(), my = Math.max(ly + 104, Math.round(VH * 0.5));
    ctx.fillStyle = 'rgba(18,10,20,0.7)'; ctx.fillRect(VW / 2 - 62, my - 8, 124, items.length * 15 + 4);
    drawMenu(items, VW / 2, my, 15, menuIdx, titlePick);
    FONT.draw(ctx, touchMode ? 'TOCA PARA ELEGIR' : 'ENTER ELEGIR · M SONIDO', VW / 2, VH - 12, COL.dim, { align: 'center', outline: COL.ink });
  }

  // historia de cada etapa
  let storyI = 0, storyT = 0, storyNext = 0;
  function updateStory(dt, inp, m) {
    animT += dt; storyT += dt;
    if (m.ok || m.back) {
      const total = STAGES[storyI].story.join(' ').length;
      if (storyT * 40 < total) { storyT = total / 40 + 0.01; return; }
      save.story = save.story || {}; save.story[storyI] = 1; writeSave();
      AUDIO.sfx('select'); startLevel(storyNext);
    }
  }
  function renderStory() {
    const st = STAGES[storyI];
    scene(st.scene, 0.6);
    ctx.fillStyle = 'rgba(12,8,16,0.72)'; ctx.fillRect(0, 0, VW, VH);
    // el jefe que espera arriba, en sombra
    const G = SPR.boss(st.boss), gi = G.idle[0];
    const sw = Math.min(110, gi.width), sh = Math.round(gi.height * sw / gi.width);
    ctx.globalAlpha = 0.22; ctx.drawImage(gi, Math.round(VW / 2 - sw / 2), VH - sh - 18, sw, sh); ctx.globalAlpha = 1;
    FONT.draw(ctx, storyI === 0 ? 'PRÓLOGO · ETAPA 1' : 'ETAPA ' + (storyI + 1), VW / 2, 12, COL.dim, { align: 'center', outline: COL.ink });
    const nm = st.name, sc = FONT.measure(nm) * 2 + 10 <= VW ? 2 : 1, g = gradText(nm, sc, st.grad[0], st.grad[1]);
    ctx.drawImage(g, Math.round(VW / 2 - g.width / 2), 24);
    let y = 24 + g.height + 10, shown = Math.floor(storyT * 40);
    for (const para of st.story) {
      const lines = FONT.wrap(para, VW - 24);
      for (const ln of lines) {
        if (shown <= 0) break;
        FONT.draw(ctx, ln.slice(0, shown), 12, y, COL.cream, { shadow: '#000000' }); shown -= ln.length + 1; y += 11;
      }
      y += 6;
    }
    if (shown > 0 && Math.floor(animT * 2) % 2 === 0) FONT.draw(ctx, touchMode ? 'TOCA PARA SUBIR ▲' : 'ENTER PARA SUBIR ▲', VW / 2, VH - 12, COL.gold, { align: 'center', outline: COL.ink });
    hits.push({ x: 0, y: 0, w: VW, h: VH, fn: () => { edge.ok = true; } });
  }

  // mapa del monte: una página por etapa
  function nodePos(k) {
    const top = 70, bot = VH - 76;
    const y = bot - (bot - top) * (k / 9);
    const spread = 16 + (9 - k) * 5;
    const x = 96 + (k === 9 ? 0 : (k % 2 ? 1 : -1) * spread);
    return [Math.round(x), Math.round(y)];
  }
  function updateSelect(dt, inp, m) {
    animT += dt;
    if (m.back) { AUDIO.sfx('back'); goTitle(); return; }
    const n = LEVELS.length, maxI = Math.min(save.unlocked, n) - 1;
    if (m.up || m.right) { if (menuIdx < maxI) { menuIdx++; AUDIO.sfx('move'); } else AUDIO.sfx('back'); }
    if (m.down || m.left) { if (menuIdx > 0) { menuIdx--; AUDIO.sfx('move'); } }
    if (m.ok) { AUDIO.sfx('select'); selectPick(menuIdx); }
  }
  function selectPick(i) { if (i < save.unlocked) playLevel(i); else AUDIO.sfx('back'); }
  function renderSelect() {
    const si = stageOf(menuIdx), st = STAGES[si], b0 = si * 10;
    scene(st.scene, 0.15);
    // ladera de la etapa
    const th = ART.THEMES[st.scene];
    ctx.fillStyle = ART.mixHex(th.near, '#000000', 0.2);
    for (let x = 0; x < VW; x++) { const d = Math.abs(x - 96); const top = Math.round(52 + d * 1.5 + Math.sin(x * 0.2) * 2); if (top < VH) ctx.fillRect(x, top, 1, VH - top); }
    ctx.fillStyle = 'rgba(0,0,0,0.22)'; for (let x = 0; x < 96; x++) { const top = Math.round(52 + (96 - x) * 1.5 + Math.sin(x * 0.2) * 2); ctx.fillRect(x, top, 1, VH - top); }
    for (let k = 0; k < 9; k++) {
      const [x0, y0] = nodePos(k), [x1, y1] = nodePos(k + 1);
      const n = 24; for (let q = 0; q <= n; q++) { if (q % 3 === 2) continue; const t = q / n; ctx.fillStyle = b0 + k + 1 < save.unlocked ? '#c8964e' : '#4a3a3a'; ctx.fillRect(Math.round(x0 + (x1 - x0) * t), Math.round(y0 + (y1 - y0) * t), 2, 1); }
    }
    // cabecera con flechas de etapa
    FONT.draw(ctx, 'ETAPA ' + (si + 1) + ' DE 5', VW / 2, 5, COL.dim, { align: 'center', outline: COL.ink });
    const sc = FONT.measure(st.name) * 2 + 34 <= VW ? 2 : 1, tt = gradText(st.name, sc, st.grad[0], st.grad[1]);
    ctx.drawImage(tt, Math.round(VW / 2 - tt.width / 2), 14);
    const prevOk = si > 0, nextOk = si < 4 && (si + 1) * 10 < save.unlocked;
    if (prevOk) { FONT.draw(ctx, '◀', 6, 22, COL.gold, { outline: COL.ink }); hits.push({ x: 0, y: 10, w: 22, h: 26, fn: () => { menuIdx = Math.min((si - 1) * 10 + 9, save.unlocked - 1); AUDIO.sfx('move'); } }); }
    if (nextOk) { FONT.draw(ctx, '▶', VW - 12, 22, COL.gold, { outline: COL.ink }); hits.push({ x: VW - 22, y: 10, w: 22, h: 26, fn: () => { menuIdx = Math.min((si + 1) * 10 + 9, save.unlocked - 1); AUDIO.sfx('move'); } }); }
    for (let k = 0; k < 10; k++) {
      const i = b0 + k, [x, y] = nodePos(k), lock = i >= save.unlocked, b = save.best[i], sel = i === menuIdx;
      if (k === 9) {
        const G = SPR.boss(st.boss), gi = G.idle[Math.floor(animT * 3) % G.idle.length];
        const gw = 56, gh = Math.round(gw * gi.height / gi.width);
        ctx.globalAlpha = lock ? 0.35 : 1; ctx.drawImage(gi, x - gw / 2, y - gh + 2, gw, gh); ctx.globalAlpha = 1;
      }
      const r = sel ? 7 : 6;
      ctx.fillStyle = COL.ink; circle(x, y, r + 1);
      ctx.fillStyle = lock ? '#3a3036' : b ? '#3a8a4a' : '#c87a1a'; circle(x, y, r);
      if (sel && Math.floor(animT * 3) % 2 === 0) { ctx.fillStyle = COL.gold; circle(x, y, r); ctx.fillStyle = lock ? '#3a3036' : b ? '#3a8a4a' : '#c87a1a'; circle(x, y, r - 2); }
      FONT.draw(ctx, lock ? '·' : String(i + 1), x, y - 3, COL.cream, { align: 'center' });
      if (b) for (let q = 0; q < 3; q++) { ctx.fillStyle = q < (b.gems || 0) ? '#ff5a4a' : '#3a2a2a'; ctx.fillRect(x - 5 + q * 4, y + 8, 3, 3); }
      hits.push({ x: x - 10, y: y - 10, w: 20, h: 20, fn: () => { if (i >= save.unlocked) { AUDIO.sfx('back'); return; } if (menuIdx !== i) { menuIdx = i; AUDIO.sfx('move'); } else { AUDIO.sfx('select'); selectPick(i); } } });
    }
    // panel del nivel elegido
    const d = LEVELS[menuIdx], b = save.best[menuIdx], py = VH - 56;
    ctx.fillStyle = COL.panel; ctx.fillRect(6, py, VW - 12, 50); ctx.fillStyle = COL.gold; ctx.fillRect(6, py, VW - 12, 1);
    FONT.draw(ctx, (menuIdx + 1) + '. ' + d.name, 12, py + 5, COL.cream);
    FONT.draw(ctx, d.sub + (d.boss ? ' · JEFE' : ''), 12, py + 16, d.boss ? st.bcol : COL.dim);
    if (b) { FONT.draw(ctx, '★ ' + fmtTime(b.time, true), 12, py + 28, COL.gold); FONT.draw(ctx, (b.gems || 0) + '/3', VW - 14, py + 28, '#ff9a8a', { align: 'right' }); ctx.drawImage(SP.gem[0], VW - 46, py + 26); }
    else FONT.draw(ctx, 'SIN COMPLETAR', 12, py + 28, '#9ad0a0');
    FONT.draw(ctx, touchMode ? 'TOCA UN NIVEL · PAUSA VUELVE' : '▲ ▼ ELEGIR · ENTER JUGAR · ESC', VW / 2, py + 40, COL.dim, { align: 'center' });
    hits.push({ x: 6, y: py, w: VW - 12, h: 36, fn: () => selectPick(menuIdx) });
  }

  // capas
  function updateCloaks(dt, inp, m) {
    animT += dt;
    if (m.back) { AUDIO.sfx('back'); goTitle(); return; }
    const n = SPR.CLOAKS.length;
    if (m.left || m.up) { menuIdx = (menuIdx + n - 1) % n; AUDIO.sfx('move'); }
    if (m.right || m.down) { menuIdx = (menuIdx + 1) % n; AUDIO.sfx('move'); }
    if (m.ok) pickCloak(menuIdx);
  }
  function pickCloak(i) {
    const c = SPR.CLOAKS[i];
    if (totalGems() < c.need) { AUDIO.sfx('back'); return; }
    save.cloak = i; writeSave(); hero = SPR.hero(i); AUDIO.sfx('select');
  }
  function renderCloaks() {
    scene('ruinas', 0.3);
    ctx.fillStyle = 'rgba(18,10,20,0.55)'; ctx.fillRect(0, 0, VW, VH);
    const tt = gradText('CAPAS', 3, '#ffe07a', '#e0702a'); ctx.drawImage(tt, Math.round(VW / 2 - tt.width / 2), 8);
    const tg = totalGems();
    ctx.drawImage(SP.gem[0], VW / 2 - 42, 44); FONT.draw(ctx, tg + ' / ' + LEVELS.length * 3 + ' GEMAS', VW / 2 + 6, 46, '#ff9a8a', { align: 'center' });
    const ch = Math.min(52, Math.floor((VH - 92) / 4));
    SPR.CLOAKS.forEach((c, i) => {
      const y = 60 + i * (ch + 3), x = 10, w = VW - 20, lock = tg < c.need, on = menuIdx === i, eq = (save.cloak || 0) === i;
      ctx.fillStyle = on ? 'rgba(242,194,48,0.22)' : 'rgba(18,10,20,0.78)'; ctx.fillRect(x, y, w, ch);
      ctx.fillStyle = on ? COL.gold : '#3a2a40'; ctx.fillRect(x, y, w, 1); ctx.fillRect(x, y + ch - 1, w, 1);
      const H = SPR.hero(i), img = H.idle[0][0];
      if (lock) ctx.globalAlpha = 0.35;
      ctx.drawImage(img, x + 4, y + Math.round(ch / 2 - img.height), img.width * 2, img.height * 2);
      ctx.globalAlpha = 1;
      FONT.draw(ctx, c.name, x + 42, y + 8, lock ? '#6a5a7a' : COL.cream);
      FONT.draw(ctx, lock ? 'NECESITAS ' + c.need + ' GEMAS' : eq ? 'EQUIPADA' : 'DISPONIBLE', x + 42, y + 20, lock ? '#7a6a8a' : eq ? COL.green : COL.dim);
      hits.push({ x, y, w, h: ch, fn: () => { menuIdx = i; pickCloak(i); } });
    });
    drawMenu(['VOLVER'], VW / 2, VH - 16, 16, -1, goTitle);
  }

  // ayuda
  function updateHelp(dt, inp, m) { animT += dt; if (m.back || m.ok) { AUDIO.sfx('back'); goTitle(); } }
  function renderHelp() {
    scene('cueva', 0.5);
    ctx.fillStyle = 'rgba(18,10,20,0.82)'; ctx.fillRect(0, 0, VW, VH);
    const tt = gradText('CÓMO JUGAR', 2, '#ffe07a', '#e0702a'); ctx.drawImage(tt, Math.round(VW / 2 - tt.width / 2), 6);
    let y = 34;
    const line = (a, b, c) => { FONT.draw(ctx, a, 8, y, c || COL.gold); if (b) FONT.draw(ctx, b, VW - 8, y, COL.cream, { align: 'right' }); y += 11; };
    if (lastDevice === 'touch' || touchMode) { line('MOVER Y TREPAR', 'CRUZ'); line('SALTAR', '↑'); line('SALTO DIAGONAL', '↖  ↗'); line('AGARRAR', 'AUTOMÁTICO'); line('PAUSA', 'BOTÓN PAUSA'); }
    else { line('MOVER', '◀ ▶  /  A D'); line('TREPAR', '▲ ▼  /  W S'); line('SALTAR', 'ESPACIO / Z'); line('SALTO DIAGONAL', 'Q / E'); line('AGARRAR', 'AUTOMÁTICO'); line('PAUSA · SONIDO', 'ESC · M'); }
    y += 4;
    const tips = [
      'Salta contra la roca con presas y mantén la dirección (o ▲): te agarras sola.',
      'Junto a una pared, el salto diagonal te lanza al otro lado: sube en zigzag entre dos muros.',
      'Trepar cansa. El vigor vuelve de pie, colgada de una liana o con una poción.',
      'Toca los anclajes rúnicos: si caes, la cuerda élfica te devuelve al último. Cada nivel esconde 3 gemas.'
    ];
    for (const t of tips) { const ls = FONT.wrap(t, VW - 24); FONT.draw(ctx, '·', 8, y, COL.gold); ls.forEach(l => { FONT.draw(ctx, l, 16, y, COL.cream); y += 10; }); y += 3; }
    drawMenu(['VOLVER'], VW / 2, VH - 18, 16, 0, goTitle);
  }

  // pausa
  function updatePause(dt, inp, m) { animT += dt; if (m.pause || m.back) { closePause(); return; } menuNav(m, 4, pausePick); }
  function pausePick(i) { if (i === 0) closePause(); else if (i === 1) restartLevel(); else if (i === 2) goTitle(); else toggleMute(); }
  function renderPause() {
    renderPlay(); hits = [];
    ctx.fillStyle = 'rgba(12,6,14,0.74)'; ctx.fillRect(0, 0, VW, VH);
    const tt = gradText('PAUSA', 3, '#ffe07a', '#e0702a'); ctx.drawImage(tt, Math.round(VW / 2 - tt.width / 2), Math.round(VH * 0.2));
    FONT.draw(ctx, LEVELS[li].name + ' · ' + fmtTime(time), VW / 2, VH * 0.2 + 36, COL.dim, { align: 'center' });
    drawMenu(['CONTINUAR', 'REINICIAR NIVEL', 'MENÚ PRINCIPAL', 'SONIDO: ' + (save.muted ? 'NO' : 'SÍ')], VW / 2, Math.round(VH * 0.46), 17, menuIdx, pausePick);
  }

  // nivel completado
  function updateClear(dt, inp, m) { animT += dt; clearT += dt; updateParts(dt); if (clearT < 1.0) return; menuNav(m, clearInfo.boss ? 2 : 3, clearPick); }
  function clearPick(i) {
    if (clearInfo.boss) { if (i === 0) { state = 'ending'; clearT = 0; menuIdx = 0; endStage = stageOf(li); AUDIO.play('final'); } else restartLevel(); return; }
    if (i === 0) playLevel(li + 1); else if (i === 1) restartLevel(); else { state = 'select'; menuIdx = Math.min(li + 1, LEVELS.length - 1); }
  }
  function renderClear() {
    renderPlay(); hits = [];
    ctx.fillStyle = 'rgba(12,6,14,' + (0.65 * Math.min(1, clearT / 0.6)) + ')'; ctx.fillRect(0, 0, VW, VH);
    if (clearT < 0.4) return;
    const y0 = Math.round(VH * 0.13), gg = STAGES[stageOf(li)].grad;
    const tt = gradText(clearInfo.boss ? '¡JEFE DERROTADO!' : '¡TRAMO SUPERADO!', 2, gg[0], gg[1]); ctx.drawImage(tt, Math.round(VW / 2 - tt.width / 2), y0);
    FONT.draw(ctx, LEVELS[li].name + ' · ' + fmtAlt(ALT[li][1]), VW / 2, y0 + 28, COL.cream, { align: 'center', outline: COL.ink });
    const bx = 22, bw = VW - 44, by = y0 + 42;
    ctx.fillStyle = COL.panel; ctx.fillRect(bx, by, bw, 50); ctx.fillStyle = '#3a2a40'; ctx.fillRect(bx, by, bw, 1); ctx.fillRect(bx, by + 49, bw, 1);
    const row = (k, v, yy, c) => { FONT.draw(ctx, k, bx + 8, yy, COL.dim); FONT.draw(ctx, v, bx + bw - 8, yy, c || COL.cream, { align: 'right' }); };
    row('TIEMPO', fmtTime(clearInfo.time, true), by + 7);
    row('CAÍDAS', String(clearInfo.falls), by + 20);
    FONT.draw(ctx, 'GEMAS', bx + 8, by + 33, COL.dim);
    for (let k = 0; k < 3; k++) { if (k < clearInfo.got) ctx.drawImage(SP.gem[k % 3], bx + bw - 40 + k * 11, by + 31); else { ctx.globalAlpha = 0.25; ctx.drawImage(SP.gem[0], bx + bw - 40 + k * 11, by + 31); ctx.globalAlpha = 1; } }
    let yy = by + 56;
    if (clearInfo.isRecord && Math.floor(animT * 3) % 2 === 0) FONT.draw(ctx, '¡NUEVO RÉCORD!', VW / 2, yy, COL.gold, { align: 'center', outline: COL.ink });
    yy += 12;
    if (clearInfo.unlockedCloak) FONT.draw(ctx, '¡NUEVA ' + clearInfo.unlockedCloak.name + '!', VW / 2, yy, '#b07cff', { align: 'center', outline: COL.ink });
    if (clearT >= 1.0) drawMenu(clearInfo.boss ? ['CONTINUAR ▶', 'REPETIR'] : ['SIGUIENTE ▶', 'REPETIR', 'MAPA'], VW / 2, by + 84, 16, menuIdx, clearPick);
  }

  // fin de cada etapa (y final del juego tras el Carcelero)
  let endStage = 0;
  function stageGems(si) { let n = 0; for (let k = si * 10; k < si * 10 + 10; k++) n += (save.best[k] && save.best[k].gems) || 0; return n; }
  function updateEnding(dt, inp, m) {
    animT += dt; clearT += dt;
    if (clearT > 2.5 && (m.ok || m.back)) {
      AUDIO.sfx('select');
      if (endStage < 4) playLevel((endStage + 1) * 10);
      else goTitle();
    }
  }
  function renderEnding() {
    const st = STAGES[endStage], last = endStage === 4;
    scene(last ? 'astral9' : st.scene, 0.9);
    ctx.fillStyle = 'rgba(12,8,16,0.55)'; ctx.fillRect(0, 0, VW, VH);
    const a = Math.min(1, clearT / 1.2);
    ctx.globalAlpha = a;
    // bloque de texto arriba
    FONT.draw(ctx, 'CUENTOS DEL MEDIOEVO', VW / 2, 6, '#e8c890', { align: 'center', outline: COL.ink });
    let y = 18;
    if (last) {
      const t1 = gradText('¡VICTORIA!', 3, '#ffffff', '#e0b060'); ctx.drawImage(t1, Math.round(VW / 2 - t1.width / 2), y); y += t1.height + 4;
    } else {
      const t1 = gradText('¡ETAPA ' + (endStage + 1), 2, st.grad[0], st.grad[1]), t2 = gradText('COMPLETADA!', 2, st.grad[0], st.grad[1]);
      ctx.drawImage(t1, Math.round(VW / 2 - t1.width / 2), y); y += t1.height; ctx.drawImage(t2, Math.round(VW / 2 - t2.width / 2), y); y += t2.height + 4;
    }
    for (const ln of FONT.wrap(st.end, VW - 24)) { FONT.draw(ctx, ln, VW / 2, y, COL.cream, { align: 'center', outline: COL.ink }); y += 11; }
    y += 6;
    if (clearT > 1.2) {
      ctx.globalAlpha = Math.min(1, (clearT - 1.2) / 1);
      FONT.draw(ctx, 'GEMAS DE LA ETAPA: ' + stageGems(endStage) + '/30', VW / 2, y, '#ff9a8a', { align: 'center', outline: COL.ink }); y += 11;
      FONT.draw(ctx, 'TOTAL: ' + totalGems() + '/' + LEVELS.length * 3, VW / 2, y, '#ffb8a0', { align: 'center', outline: COL.ink }); y += 13;
      if (last) { FONT.draw(ctx, 'GRACIAS POR JUGAR', VW / 2, y, COL.gold, { align: 'center', outline: COL.ink }); y += 11; FONT.draw(ctx, 'LA SAGA CONTINUARÁ...', VW / 2, y, '#b07cff', { align: 'center', outline: COL.ink }); y += 11; }
      else { FONT.draw(ctx, 'SIGUIENTE: ' + STAGES[endStage + 1].name, VW / 2, y, '#b07cff', { align: 'center', outline: COL.ink }); y += 11; }
    }
    ctx.globalAlpha = 1;
    // ilustración abajo, siempre bajo el texto: jefe vencido a la izquierda, heroína con el estandarte a la derecha
    const gy = VH - 22;
    ctx.fillStyle = '#120a0e'; ctx.fillRect(0, gy, VW, 22); ctx.fillStyle = '#3a2a30'; ctx.fillRect(0, gy, VW, 1);
    const G = SPR.boss(st.boss), gi = G.stone;
    const room = Math.max(20, gy - (y + 6)), gh = Math.min(70, room), gw = Math.round(gi.width * gh / gi.height);
    ctx.globalAlpha = last ? 0.5 + 0.3 * Math.sin(animT * 2) : 0.9;
    ctx.drawImage(gi, Math.round(56 - gw / 2), gy - gh, gw, gh);
    ctx.globalAlpha = 1;
    const H = hero, hi = Math.floor(animT * 2) % 2 ? H.jump[0] : H.idle[0][0];
    ctx.drawImage(hi, 140 - (hi.width - 1) / 2, gy - hi.height);
    const bx = 152, top = gy - 30;
    ctx.fillStyle = '#9a6a36'; ctx.fillRect(bx, top, 1, 30);
    for (let i = 0; i < 12; i++) for (let j = 0; j < 9; j++) { const wy = Math.round(Math.sin(animT * 6 - i * 0.6) * 1.3 * (i / 12)); let c = (j === 0 || j === 8) ? '#f2c230' : '#4a2a7a'; if (Math.hypot(i - 6, j - 4) < 2.2) c = Math.hypot(i - 6, j - 4) < 1.2 ? '#ffffff' : '#7ef3ff'; ctx.fillStyle = c; ctx.fillRect(bx + 1 + i, top + j + wy, 1, 1); }
    if (last) for (let k = 0; k < 14; k++) { const t = (animT * 0.3 + k / 14) % 1; ctx.globalAlpha = 1 - t; ctx.fillStyle = k % 2 ? '#bff4ff' : '#6ad0ff'; ctx.fillRect(Math.round(20 + (k * 53) % 150 + Math.sin(animT + k) * 8), Math.round(gy - t * (gy - 10)), 2, 2); }
    ctx.globalAlpha = 1;
    if (clearT > 2.5 && Math.floor(animT * 2) % 2 === 0) FONT.draw(ctx, (touchMode ? 'TOCA PARA ' : 'ENTER PARA ') + (last ? 'VOLVER' : 'SEGUIR SUBIENDO'), VW / 2, VH - 14, COL.cream, { align: 'center', outline: COL.ink });
    if (clearT > 2.5) hits.push({ x: 0, y: 0, w: VW, h: VH, fn: () => { edge.ok = true; } });
  }

  // ---------- bucle ----------
  const STEP = 1 / 60;
  let last = performance.now(), acc = 0, frameDt = 1 / 60;
  function tick() {
    const [inp, m] = input();
    if (state === 'play') updatePlay(STEP, inp, m);
    else if (state === 'title') updateTitle(STEP, inp, m);
    else if (state === 'select') updateSelect(STEP, inp, m);
    else if (state === 'cloaks') updateCloaks(STEP, inp, m);
    else if (state === 'help') updateHelp(STEP, inp, m);
    else if (state === 'pause') updatePause(STEP, inp, m);
    else if (state === 'clear') updateClear(STEP, inp, m);
    else if (state === 'ending') updateEnding(STEP, inp, m);
    else if (state === 'story') updateStory(STEP, inp, m);
    else if (state === 'cloud') updateCloud(STEP, inp, m);
  }
  function render() {
    hits = [];
    ctx.imageSmoothingEnabled = false;
    if (state === 'play') renderPlay();
    else if (state === 'title') renderTitle();
    else if (state === 'select') renderSelect();
    else if (state === 'cloaks') renderCloaks();
    else if (state === 'help') renderHelp();
    else if (state === 'pause') renderPause();
    else if (state === 'clear') renderClear();
    else if (state === 'ending') renderEnding();
    else if (state === 'story') renderStory();
    else if (state === 'cloud') renderCloud();
    if (toastT > 0) { toastT -= 1 / 60; const ls = FONT.wrap(toastMsg, VW - 28), h = ls.length * 10 + 8, y = VH - h - 26; ctx.globalAlpha = Math.min(1, toastT * 3); ctx.fillStyle = 'rgba(10,20,34,0.92)'; ctx.fillRect(8, y, VW - 16, h); ctx.fillStyle = COL.rune; ctx.fillRect(8, y, VW - 16, 1); ls.forEach((l, i) => FONT.draw(ctx, l, VW / 2, y + 5 + i * 10, COL.cream, { align: 'center' })); ctx.globalAlpha = 1; }
  }
  function frame(now) {
    requestAnimationFrame(frame);
    let dt = (now - last) / 1000; last = now;
    if (dt > 0.1) dt = 0.1;
    frameDt = dt; acc += dt;
    let n = 0;
    while (acc >= STEP && n < 6) { tick(); acc -= STEP; n++; }
    if (n === 6) acc = 0;
    render();
  }
  setupTouch();
  layout();
  document.getElementById('mMute').textContent = save.muted ? '♪ NO' : '♪ SÍ';
  AUDIO.play('titulo');
  requestAnimationFrame(frame);

  // gancho para pruebas automáticas
  window.__EE = {
    start: i => { startLevel(i); introT = 0; },
    get state() { return state; }, get player() { return player; }, get L() { return L; }, get B() { return B; }, get E() { return E; },
    teleport: (x, y) => { player.x = x; player.y = y; player.vx = 0; player.vy = 0; player.apexY = y; cam = clampCam(y - VH * 0.6); },
    clear: () => levelClear(), setState: (s, k) => { state = s; clearT = 5; menuIdx = 0; if (k !== undefined) { endStage = k; storyI = k; storyT = 0; storyNext = k * 10; menuIdx = s === 'select' ? k * 10 : 0; } },
    story: k => { state = 'story'; storyI = k; storyT = 0; storyNext = k * 10; }, cam: y => { cam = clampCam(y); },
    sim: (inp, n, nh) => { noHaz = !!nh; for (let k = 0; k < n; k++) { if (state !== 'play') break; if (nh) player.lev = false; updatePlay(STEP, inp, {}); } noHaz = false; return state; },
    powers: (lev, hearts) => { save.lev = lev; save.hearts = hearts; },
    hits: () => hits, touch: () => Object.assign({}, touch),
    get falls() { return falls; }, get time() { return time; }, get got() { return got; },
    unlockAll: () => { save.unlocked = LEVELS.length; writeSave(); }, keys,
    skipBoss: () => { if (B) { B.st = 'fight'; B.rise = 1; B.atk = 2; freezeInput = 0; } }
  };
})();
