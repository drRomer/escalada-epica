// ===== CORE: física y nivel (Cuentos del Medioevo: Escalada Épica) (sin dependencias de render; reutilizable en Node para el verificador) =====
const CORE = (function () {
  const T = 12;            // tamaño de tile en px internos
  const W = 16;            // ancho del nivel en tiles
  const PW = 8, PH = 14;   // hitbox del escalador
  const K = {
    GRAV: 900, MAX_FALL: 240, RUN: 78,
    ACC_G: 1000, DEC_G: 1300, ACC_A: 650, DEC_A: 420,
    ICE_ACC: 220, ICE_DEC: 70,
    JUMP_V: 262, CUT: 2.4, COYOTE: 0.09, BUFFER: 0.12,
    WJ_VX: 105, WJ_VY: 240, WJ_LOCK: 0.16,
    CJ_VY: 230, CJ_COST: 27.5,
    CLIMB_UP: 46, CLIMB_DOWN: 72,
    ST_MAX: 110, ST_HOLD: 10, ST_UP: 28,
    SLIDE_MAX: 55, ICE_SLIDE: 140,
    HOP_VY: 150, HOP_VX: 60,
    ROPE_UP: 55, ROPE_DOWN: 80, ROPE_REGEN: 45,
    CATCH_FALL: 84,
    LEV_T: 1.0, LEV_VY: 38
  };

  function parseLevel(def) {
    const rows = def.map;
    const H = rows.length;
    const grid = [];
    const e = { start: null, flag: null, seguros: [], crystals: [], chalk: [], rocks: [], icicles: [], condors: [], signs: [], goblins: [], vents: [], runes: [], swoops: [], ghosts: [], saws: [], lobbers: [], hearts: [], powers: [] };
    for (let r = 0; r < H; r++) {
      const row = rows[r];
      if (row.length !== W) throw new Error(def.name + ': fila ' + r + ' tiene ' + row.length + ' columnas: "' + row + '"');
      const g = [];
      for (let c = 0; c < W; c++) {
        const ch = row[c];
        let keep = '.';
        const cx = c * T, cy = r * T;
        switch (ch) {
          case 'S': e.start = { c, r, x: cx + T / 2 - PW / 2, y: cy + T - PH }; break;
          case 'F': e.flag = { c, r, x: cx, y: cy }; break;
          case 'P': e.seguros.push({ c, r, x: cx + T / 2 - PW / 2, y: cy + T - PH, ax: cx + T / 2, ay: cy + T - 9 }); break;
          case 'o': e.crystals.push({ c, r, x: cx + 3, y: cy + 3 }); break;
          case 'm': e.chalk.push({ c, r, x: cx + 2, y: cy + 2 }); break;
          case 'R': e.rocks.push({ c, r, x: cx, y: cy }); break;
          case 'V': e.icicles.push({ c, r, x: cx, y: cy }); break;
          case 'Y': e.condors.push({ c, r, x: cx, y: cy }); break;
          case 'T': e.signs.push({ c, r, x: cx, y: cy }); break;
          case 'A': e.goblins.push({ c, r, x: cx, y: cy }); break;
          case 'H': e.vents.push({ c, r, x: cx, y: cy }); break;
          case 'U': e.runes.push({ c, r, x: cx, y: cy }); break;
          case 'W': e.swoops.push({ c, r, x: cx, y: cy }); break;
          case 'G': e.ghosts.push({ c, r, x: cx, y: cy }); break;
          case 'O': e.saws.push({ c, r, x: cx, y: cy }); break;
          case 'M': e.lobbers.push({ c, r, x: cx, y: cy }); break;
          case 'Q': e.hearts.push({ c, r, x: cx, y: cy }); break;
          case 'D': e.powers.push({ c, r, x: cx, y: cy }); break;
          default: keep = ch;
        }
        g.push(keep);
      }
      grid.push(g);
    }
    if (!e.start) throw new Error(def.name + ': falta S');
    if (!e.flag) throw new Error(def.name + ': falta F');
    e.signs.sort((a, b) => b.r - a.r || a.c - b.c);          // de abajo hacia arriba = orden de juego
    e.seguros.sort((a, b) => b.r - a.r);
    return { W, H, grid, e, def, crumble: {}, name: def.name };
  }

  function tile(L, c, r) {
    if (c < 0 || c >= W) return 'Z';
    if (r < 0 || r >= L.H) return '.';
    return L.grid[r][c];
  }
  function crumbleGone(L, c, r) { const s = L.crumble[r * W + c]; return !!(s && s.gone); }
  function solid(L, c, r) {
    const ch = tile(L, c, r);
    if (ch === '#' || ch === 'Z' || ch === 'I') return true;
    if (ch === 'C') return !crumbleGone(L, c, r);
    return false;
  }
  function grabbable(L, c, r) {
    const ch = tile(L, c, r);
    if (ch === '#') return true;
    if (ch === 'C') return !crumbleGone(L, c, r);
    return false;
  }
  function isIce(L, c, r) { return tile(L, c, r) === 'I'; }
  // 'B': plataforma de luz. Filas pares e impares alternan (periodo 3 s, encendida 2 s)
  function blinkPhase(L, r) { return L.clock === undefined ? 0 : (L.clock + (r % 2) * 1.5) % 3; }
  function blinkOn(L, r) { return blinkPhase(L, r) < 2; }
  function oneWay(L, c, r) { const ch = tile(L, c, r); return ch === '=' || (ch === 'B' && blinkOn(L, r)); }
  // 'X': púas retráctiles (ciclo 2,4 s desfasado por columna; salidas de 1,5 a 2,4)
  function spikePhase(L, c) { return L.clock === undefined ? 0 : (L.clock + c * 0.3) % 2.4; }
  function spikeOut(L, c) { return spikePhase(L, c) >= 1.5; }
  function rectAny(L, x, y, w, h, fn) {
    const c0 = Math.floor(x / T), c1 = Math.floor((x + w - 0.001) / T);
    const r0 = Math.floor(y / T), r1 = Math.floor((y + h - 0.001) / T);
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) if (fn(L, c, r)) return true;
    return false;
  }
  function rectEach(L, x, y, w, h, cb) {
    const c0 = Math.floor(x / T), c1 = Math.floor((x + w - 0.001) / T);
    const r0 = Math.floor(y / T), r1 = Math.floor((y + h - 0.001) / T);
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) cb(c, r);
  }

  function newPlayer(x, y) {
    return {
      x, y, vx: 0, vy: 0, state: 'normal', facing: 1, stamina: K.ST_MAX, onGround: false, ice: false,
      coyote: 0, buf: 0, wjLock: 0, hop: 0, ropeCd: 0, drop: 0, regrab: false, apexY: y, lev: false, levT: 0, levUsed: false
    };
  }
  function clonePlayer(p) { return Object.assign({}, p); }

  function approach(v, t, d) { return v < t ? Math.min(v + d, t) : Math.max(v - d, t); }

  function moveX(L, p, dx) {
    if (!dx) return false;
    p.x += dx;
    if (rectAny(L, p.x, p.y, PW, PH, solid)) {
      if (dx > 0) p.x = Math.floor((p.x + PW - 0.001) / T) * T - PW;
      else p.x = (Math.floor(p.x / T) + 1) * T;
      p.vx = 0;
      return true;
    }
    return false;
  }
  function moveY(L, p, dy) {
    if (!dy) return false;
    const oldBottom = p.y + PH;
    p.y += dy;
    if (rectAny(L, p.x, p.y, PW, PH, solid)) {
      if (dy > 0) p.y = Math.floor((p.y + PH - 0.001) / T) * T - PH;
      else p.y = (Math.floor(p.y / T) + 1) * T;
      p.vy = 0;
      return true;
    }
    if (dy > 0 && p.drop <= 0 && p.state !== 'rope') {
      const nb = p.y + PH;
      const r = Math.floor((nb - 0.001) / T);
      const top = r * T;
      if (oldBottom <= top + 0.01 && nb > top) {
        const c0 = Math.floor(p.x / T), c1 = Math.floor((p.x + PW - 0.001) / T);
        for (let c = c0; c <= c1; c++) if (oneWay(L, c, r)) { p.y = top - PH; p.vy = 0; return true; }
      }
    }
    return false;
  }

  // inp: {left,right,up,down,jump,jumpPressed,grab}; env: {wind, onTouch(c,r), ev(name)}
  function step(L, p, inp, dt, env) {
    const ev = env.ev || noop;
    const dirX = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
    const dirY = (inp.down ? 1 : 0) - (inp.up ? 1 : 0);
    p.coyote -= dt; p.buf -= dt; p.wjLock -= dt; p.hop -= dt; p.ropeCd -= dt; p.drop -= dt;
    if (inp.jumpPressed) p.buf = K.BUFFER;

    // --- suelo
    p.onGround = false; p.ice = false;
    let oneWayOnly = true;
    if (p.vy >= 0 && p.state !== 'rope') {
      const feet = p.y + PH;
      const r = Math.round(feet / T);
      if (Math.abs(feet - r * T) < 0.6) {
        const c0 = Math.floor(p.x / T), c1 = Math.floor((p.x + PW - 0.001) / T);
        for (let c = c0; c <= c1; c++) {
          if (solid(L, c, r)) {
            p.onGround = true; oneWayOnly = false;
            if (isIce(L, c, r)) p.ice = true;
            if (tile(L, c, r) === 'C' && env.onTouch) env.onTouch(c, r);
          } else if (oneWay(L, c, r) && p.drop <= 0) p.onGround = true;
        }
      }
    }
    if (p.state === 'rope' && p.vy >= 0) {
      // permitir bajar de la cuerda al suelo
      const feet = p.y + PH, r = Math.round(feet / T);
      if (Math.abs(feet - r * T) < 0.6 && rectAny(L, p.x, feet, PW, 1, solid)) p.onGround = true;
    }

    // --- paredes
    const touchR = rectAny(L, p.x + PW, p.y + 2, 1, PH - 4, solid);
    const touchL = rectAny(L, p.x - 1, p.y + 2, 1, PH - 4, solid);
    const nearR = touchR || rectAny(L, p.x + PW, p.y + 2, 3, PH - 4, solid);
    const nearL = touchL || rectAny(L, p.x - 3, p.y + 2, 3, PH - 4, solid);
    const grabR = rectAny(L, p.x + PW, p.y + 2, 1, PH - 6, grabbable);
    const grabL = rectAny(L, p.x - 1, p.y + 2, 1, PH - 6, grabbable);

    if (p.state === 'normal') {
      if (p.onGround) { p.coyote = K.COYOTE; p.stamina = K.ST_MAX; p.regrab = false; p.levUsed = false; p.levT = 0; }
      // horizontal
      if (p.wjLock <= 0) {
        let acc;
        if (p.onGround) acc = p.ice ? (dirX ? K.ICE_ACC : K.ICE_DEC) : (dirX ? K.ACC_G : K.DEC_G);
        else acc = dirX ? K.ACC_A : K.DEC_A;
        p.vx = approach(p.vx, dirX * K.RUN, acc * dt);
        if (dirX) p.facing = dirX;
      }
      if (env.wind) {
        p.vx += env.wind * (p.onGround ? 0.3 : 1) * dt;
        const lim = K.RUN * 1.7; if (p.vx > lim) p.vx = lim; if (p.vx < -lim) p.vx = -lim;
      }
      // salto
      if (p.buf > 0) {
        if (p.onGround && dirY > 0 && oneWayOnly) { p.drop = 0.2; p.buf = 0; p.onGround = false; }
        else if (p.coyote > 0) { p.vy = -K.JUMP_V; p.coyote = 0; p.buf = 0; p.onGround = false; ev('jump'); }
        else if (nearR || nearL) {
          const away = (nearR && nearL) ? -p.facing : (nearR ? -1 : 1);
          p.vx = away * K.WJ_VX; p.vy = -K.WJ_VY; p.wjLock = K.WJ_LOCK; p.facing = away; p.buf = 0; p.regrab = false;
          ev('walljump');
        } else if (p.lev && !p.levUsed) { p.levT = K.LEV_T; p.levUsed = true; p.buf = 0; ev('lev'); }
      }
      // gravedad
      if (!p.onGround && p.levT > 0) {
        if (inp.jump) { p.vy = approach(p.vy, -K.LEV_VY, 1200 * dt); p.levT -= dt; } else p.levT = 0;
      } else if (!p.onGround) {
        let g = K.GRAV;
        if (p.vy < 0 && !inp.jump && !p.regrab) g *= K.CUT;
        else if (Math.abs(p.vy) < 45 && inp.jump) g *= 0.55;
        p.vy += g * dt;
        let maxF = K.MAX_FALL;
        if (p.vy > 0 && dirX !== 0 && ((dirX > 0 && touchR) || (dirX < 0 && touchL))) {
          const iceWall = dirX > 0 ? rectAny(L, p.x + PW, p.y + 2, 1, PH - 4, isIce) : rectAny(L, p.x - 1, p.y + 2, 1, PH - 4, isIce);
          maxF = iceWall ? K.ICE_SLIDE : K.SLIDE_MAX;
        }
        if (p.vy > maxF) p.vy = approach(p.vy, maxF, 1800 * dt);
      } else if (p.vy > 0) p.vy = 0;
      // agarre
      let side = dirX !== 0 ? dirX : p.facing;
      if (dirX === 0 && dirY < 0) { if (grabR && !grabL) side = 1; else if (grabL && !grabR) side = -1; }
      const canGrab = side > 0 ? grabR : grabL;
      const want = inp.grab || p.regrab || (!p.onGround && dirX === side && dirX !== 0) || dirY < 0;
      if (want && canGrab && p.stamina > 0 && p.hop <= 0 && p.vy >= -40) {
        p.state = 'climb'; p.facing = side; p.vx = 0; p.vy = 0; p.regrab = false; p.levT = 0; p.levUsed = false; ev('grab');
      }
      // cuerda fija
      if (p.state === 'normal' && p.ropeCd <= 0 && (dirY < 0 || (dirY > 0 && !p.onGround))) {
        const cx = p.x + PW / 2, c = Math.floor(cx / T), r = Math.floor((p.y + PH / 2) / T);
        if (tile(L, c, r) === '|' && Math.abs(cx - (c * T + T / 2)) < 6) {
          p.state = 'rope'; p.x = c * T + T / 2 - PW / 2; p.vx = 0; p.vy = 0; p.regrab = false; p.levT = 0; p.levUsed = false; ev('rope');
        }
      }
    } else if (p.state === 'climb') {
      const g = p.facing > 0 ? grabR : grabL;
      p.coyote = 0;
      if (!g || p.stamina <= 0) {
        p.state = 'normal';
        if (p.stamina <= 0) ev('slip');
      } else if (p.buf > 0) {
        p.buf = 0;
        if (dirX === -p.facing) {
          p.vx = -p.facing * K.WJ_VX; p.vy = -K.WJ_VY; p.wjLock = K.WJ_LOCK; p.facing = -p.facing; p.state = 'normal';
          ev('walljump');
        } else {
          p.vy = -K.CJ_VY; p.vx = 0; p.stamina -= K.CJ_COST; p.state = 'normal'; p.regrab = true;
          ev('climbjump');
        }
      } else if (dirX === -p.facing && !inp.grab) {
        p.state = 'normal'; p.vx = -p.facing * 30;
      } else if (p.onGround && dirY > 0) {
        p.state = 'normal';
      } else {
        p.vx = 0;
        if (dirY < 0) {
          const ux = p.facing > 0 ? p.x + PW : p.x - 1;
          if (!rectAny(L, ux, p.y + 1, 1, 4, solid)) {
            p.state = 'normal'; p.vy = -K.HOP_VY; p.vx = p.facing * K.HOP_VX; p.wjLock = 0.14; p.hop = 0.2;
            ev('hop');
          } else { p.vy = -K.CLIMB_UP; p.stamina -= K.ST_UP * dt; }
        } else if (dirY > 0) { p.vy = K.CLIMB_DOWN; }
        else { p.vy = 0; p.stamina -= K.ST_HOLD * dt; }
        if (env.onTouch) {
          const gx = p.facing > 0 ? p.x + PW : p.x - 1;
          rectEach(L, gx, p.y + 2, 1, PH - 6, (c, r) => { if (tile(L, c, r) === 'C') env.onTouch(c, r); });
        }
      }
    } else if (p.state === 'rope') {
      const c = Math.floor((p.x + PW / 2) / T);
      p.vx = 0; p.coyote = 0;
      p.stamina = Math.min(K.ST_MAX, p.stamina + K.ROPE_REGEN * dt);
      if (dirX) p.facing = dirX;
      if (p.buf > 0) {
        p.buf = 0; p.state = 'normal'; p.vy = -K.JUMP_V * 0.85; p.vx = dirX * K.RUN; p.ropeCd = 0.3;
        ev('jump');
      } else {
        const topRope = tile(L, c, Math.floor((p.y + 1) / T)) === '|';
        const midRope = tile(L, c, Math.floor((p.y + PH / 2) / T)) === '|';
        if (!midRope) p.state = 'normal';
        else if (dirY < 0) {
          if (topRope) p.vy = -K.ROPE_UP;
          else { p.state = 'normal'; p.vy = -K.HOP_VY - 40; p.ropeCd = 0.3; ev('hop'); }
        } else if (dirY > 0) { p.vy = K.ROPE_DOWN; if (p.onGround) p.state = 'normal'; }
        else p.vy = 0;
      }
    }

    moveX(L, p, p.vx * dt);
    moveY(L, p, p.vy * dt);

    if (p.state !== 'normal' || p.onGround) p.apexY = p.y;
    else p.apexY = Math.min(p.apexY, p.y);
  }

  function spikeHit(L, x, y, w, h) {
    let hit = false;
    rectEach(L, x, y, w, h, (c, r) => {
      if (hit) return;
      const ch = tile(L, c, r);
      let sx, sy, sw, sh;
      if (ch === '^') { sx = c * T + 1; sy = r * T + T - 5; sw = T - 2; sh = 5; }
      else if (ch === 'v') { sx = c * T + 1; sy = r * T; sw = T - 2; sh = 5; }
      else if (ch === '>') { sx = c * T; sy = r * T + 1; sw = 5; sh = T - 2; }
      else if (ch === '<') { sx = c * T + T - 5; sy = r * T + 1; sw = 5; sh = T - 2; }
      else if (ch === 'L') { sx = c * T; sy = r * T + 4; sw = T; sh = 4; }
      else if (ch === 'X' && L.clock !== undefined && spikeOut(L, c)) { sx = c * T + 1; sy = r * T + T - 6; sw = T - 2; sh = 6; }
      else return;
      if (x + 1 < sx + sw && x + w - 1 > sx && y + 1 < sy + sh && y + h - 1 > sy) hit = true;
    });
    return hit;
  }
  function hazard(L, p) {
    if (p.y > L.H * T + 24) return true;
    return spikeHit(L, p.x, p.y, PW, PH);
  }
  function overlap(ax, ay, aw, ah, bx, by, bw, bh) { return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by; }
  function noop() {}

  return { T, W, PW, PH, K, parseLevel, tile, solid, grabbable, rectAny, newPlayer, clonePlayer, step, hazard, overlap, oneWay, blinkPhase, blinkOn, spikePhase, spikeOut };
})();
if (typeof module !== 'undefined') module.exports = CORE;
