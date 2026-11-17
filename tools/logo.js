// Logo provisorio de Escalada Épica, dibujado con el arte del juego (pixel art nativo 192x224, fondo transparente).
// Emblema redondo con el Monte Sagrado y sus 5 etapas (bosque, nieve, volcán, torre y luz), el estandarte en la cima,
// la arquera colgada de su cuerda élfica, dos arcos cruzados detrás y el título con la letra pixelada del juego.
function drawLogo(ctx) {
  const W = 192, CX = 96, CY = 82, RAD = 66;
  const R = ART.rng(20261117);
  const px = (x, y, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), 1, 1); };
  const rect = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); };
  const disc = (cx, cy, r, c) => { ctx.fillStyle = c; for (let y = -r; y <= r; y++) { const w = Math.round(Math.sqrt(r * r - y * y)); ctx.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2 + 1, 1); } };
  ctx.imageSmoothingEnabled = false;

  // ---------- arcos cruzados (detrás del emblema) ----------
  function bow(x0, y0, x1, y1, sag) {
    const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
    const pts = [];
    for (let i = 0; i <= 160; i++) { const t = i / 160, s = Math.sin(t * Math.PI) * sag * (1 - 0.25 * Math.pow(Math.abs(t - 0.5) * 2, 3)); pts.push([x0 + dx * t + nx * s, y0 + dy * t + ny * s, t]); }
    for (let i = 0; i <= 120; i++) { const t = i / 120; px(x0 + dx * t, y0 + dy * t, '#e8dcc0'); }        // cuerda
    for (const [x, y] of pts) disc(x, y, 2, '#140c14');
    for (const [x, y, t] of pts) { const c = (t > 0.45 && t < 0.55) ? '#5a2a1a' : '#6a4422'; disc(x, y, 1, c); }
    for (const [x, y, t] of pts) if ((t > 0.45 && t < 0.55)) { px(x, y, '#c8964e'); } else px(x - nx * 0.6, y - ny * 0.6, '#9a6a36');
    for (const [x, y] of [pts[0], pts[pts.length - 1]]) { disc(x, y, 2, '#140c14'); disc(x, y, 1, '#e0b040'); }  // puntas doradas
  }
  bow(8, 18, 184, 156, -30);
  bow(184, 18, 8, 156, 30);

  // ---------- emblema: cielo nocturno ----------
  ctx.save();
  ctx.beginPath(); ctx.arc(CX + 0.5, CY + 0.5, RAD, 0, Math.PI * 2); ctx.clip();
  for (let y = CY - RAD; y <= CY + RAD; y += 3) rect(CX - RAD, y, RAD * 2 + 1, 3, ART.mix('#0a0c26', '#3e2a5e', (y - (CY - RAD)) / (RAD * 2)));
  for (let i = 0; i < 70; i++) { const x = CX - RAD + R() * RAD * 2, y = CY - RAD + R() * RAD * 1.2; px(x, y, R() < 0.25 ? '#ffffff' : R() < 0.5 ? '#ffe8a0' : '#8a86c0'); }
  // luna creciente
  disc(CX - 36, CY - 40, 7, '#fff2c0'); disc(CX - 32, CY - 43, 6, '#1a1838');
  // resplandor espiritual en la cima
  for (let k = 7; k >= 1; k--) { ctx.globalAlpha = 0.07; disc(CX, CY - 34, 6 + k * 4, '#ffe8a0'); }
  ctx.globalAlpha = 1;

  // ---------- el Monte Sagrado (5 franjas) ----------
  const peakY = CY - 38;
  const top = x => peakY + Math.abs(x - CX) * 1.28 + Math.round(Math.sin(x * 0.9) * 1.2 + Math.sin(x * 0.37) * 1.6);
  const bandY = (f, x) => peakY + f * (CY + RAD - peakY) + Math.round(Math.sin(x * 0.55 + f * 9) * 2);
  const BANDS = [ // [hasta, luz, sombra, detalle]
    [0.17, '#ffe8a0', '#e0b060', '#fff8e0'],     // cima: plano espiritual
    [0.33, '#6e687a', '#4e4858', '#9a94a6'],     // torre fantasma
    [0.52, '#5a1a12', '#3a1010', '#fa6a0a'],     // volcán
    [0.72, '#e8f0ff', '#a8c0d8', '#ffffff'],     // nieve
    [1.01, '#2e5a2a', '#1e3a1e', '#4e8a3a']      // bosque
  ];
  for (let x = CX - RAD; x <= CX + RAD; x++) {
    const t0 = Math.max(CY - RAD, Math.round(top(x)));
    for (let y = t0; y <= CY + RAD; y++) {
      let b = BANDS.length - 1; for (let k = 0; k < BANDS.length; k++) if (y < bandY(BANDS[k][0], x)) { b = k; break; }
      const shade = x > CX + Math.round(Math.sin(y * 0.2) * 2);    // ladera derecha en sombra
      let c = shade ? BANDS[b][2] : BANDS[b][1];
      if (y === t0) c = b === 0 ? '#fff8e0' : BANDS[b][3];            // borde de la silueta
      if (b === 2 && !shade && R() < 0.05) c = '#7a2a18';
      if (b === 3 && shade && R() < 0.06) c = '#8aa0b8';
      rect(x, y, 1, 1, c);
    }
  }
  // ríos de lava en el volcán
  for (const sx of [CX - 14, CX + 6, CX + 22]) {
    let x = sx;
    for (let y = Math.round(bandY(0.34, sx)); y < bandY(0.52, sx) + 1; y++) { if (y >= top(x)) { px(x, y, (y % 4) ? '#fa6a0a' : '#ffd541'); } if (R() < 0.35) x += R() < 0.5 ? -1 : 1; }
  }
  // torre fantasma en la arista
  { const tx = CX + 13, ty = Math.round(bandY(0.2, CX + 13)) - 2;
    rect(tx - 1, ty - 13, 9, 16, '#140c14'); rect(tx, ty - 12, 7, 15, '#3a3448'); rect(tx, ty - 12, 2, 15, '#5a546a');
    for (let k = 0; k < 4; k++) rect(tx - 1 + k * 3, ty - 15, 2, 3, '#140c14'), rect(tx + k * 3 - (k ? 0 : 0), ty - 14, 1, 2, '#3a3448');
    rect(tx + 3, ty - 8, 1, 3, '#7ef3ff'); rect(tx + 3, ty - 2, 1, 2, '#bff4ff'); }
  // copos y pinos
  for (let i = 0; i < 18; i++) { const x = CX - RAD + R() * RAD * 2, y = bandY(0.53, x) + R() * 20; if (y > top(x)) px(x, y, '#ffffff'); }
  function pine(x, y, h, c, d) {
    for (let j = 0; j < h; j++) { const w = Math.floor(j / 2) % 3 + Math.floor(j / 3); rect(x - w - 1, y - h + j, w * 2 + 3, 1, '#0c1a10'); rect(x - w, y - h + j, w * 2 + 1, 1, j % 3 ? c : d); }
    rect(x, y, 1, 2, '#3a2412');
  }
  for (const [x, h] of [[CX - 58, 12], [CX - 47, 16], [CX - 36, 11], [CX - 25, 14], [CX + 26, 13], [CX + 37, 17], [CX + 49, 12], [CX + 60, 15], [CX - 6, 9], [CX + 12, 10]])
    pine(x, CY + RAD - 4 - (x % 3), h, '#2e5a2a', '#4e8a3a');
  ctx.restore();

  // ---------- estandarte en la cima ----------
  const SP = SPR.load();
  { const img = SP.banner[0]; ctx.drawImage(img, Math.round(CX + 1 - (img.width - 1) / 2), Math.round(peakY + 2 - img.height)); }
  // ---------- la arquera en su cuerda élfica ----------
  { const H = SPR.hero(0), img = H.climb[0][0];
    const fx = CX - 28, fy = Math.round(bandY(0.6, CX - 28));
    for (let j = -9; j < 12; j++) { const w = 6 + Math.round(Math.sin(j * 0.8) * 1.5); rect(fx + 4, fy + j, w + 2, 1, '#140c14'); rect(fx + 5, fy + j, w, 1, j % 4 ? '#544649' : '#3b3034'); px(fx + 5, fy + j, '#94827c'); if (j % 5 === 0) rect(fx + 6, fy + j, 2, 1, '#6e5e5e'); }   // risco de roca con presas
    const ax = fx - 10, ay = Math.round(bandY(0.8, fx - 10));
    const a0 = SP.anchor[0]; ctx.drawImage(a0, ax - Math.round(a0.width / 2), ay - a0.height + 2); px(ax, ay - 8, '#7ef3ff'); px(ax, ay - 7, '#7ef3ff');
    for (let i = 0; i <= 26; i++) { const t = i / 26, x = ax + (fx - 2 - ax) * t, y = ay - 10 + (fy - 2 - (ay - 10)) * t + Math.sin(t * Math.PI) * 4; px(x, y, i % 5 ? '#bfeaf0' : '#ffffff'); }
    ctx.drawImage(img, fx + 5 - img.width, fy + 4 - img.height + 4); }

  // ---------- aro del emblema ----------
  ctx.beginPath(); ctx.lineWidth = 1;
  for (let a = 0; a < 720; a++) {
    const t = a / 720 * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
    px(CX + c * (RAD + 3), CY + s * (RAD + 3), '#140c14'); px(CX + c * (RAD + 2), CY + s * (RAD + 2), '#e0b040');
    px(CX + c * (RAD + 1), CY + s * (RAD + 1), '#a87830'); px(CX + c * RAD, CY + s * RAD, '#140c14');
  }
  for (let k = 0; k < 12; k++) { const t = k / 12 * Math.PI * 2; disc(CX + Math.cos(t) * (RAD + 2), CY + Math.sin(t) * (RAD + 2), 1, '#ffe07a'); }

  // ---------- título ----------
  function grad(str, sc, topC, botC) {
    const w = FONT.measure(str) * sc + sc * 4, h = 10 * sc + sc * 4;
    const out = ART.cv(w, h), o = out.getContext('2d');
    FONT.draw(o, str, sc * 2, sc * 2 + 3 * sc, '#2a1206', { scale: sc, outline: '#2a1206' });
    const t = ART.cv(w, h), x = t.getContext('2d');
    FONT.draw(x, str, sc * 2, sc * 2 + 3 * sc, '#ffffff', { scale: sc });
    x.globalCompositeOperation = 'source-in';
    const g = x.createLinearGradient(0, sc * 2 + 3 * sc, 0, sc * 2 + 10 * sc);
    g.addColorStop(0, topC); g.addColorStop(1, botC); x.fillStyle = g; x.fillRect(0, 0, w, h);
    o.drawImage(t, 0, 0);
    return out;
  }
  const put = (img, y) => ctx.drawImage(img, Math.round(W / 2 - img.width / 2), y);
  put(grad('CUENTOS DEL MEDIOEVO', 1, '#ffe8a0', '#d89a40'), 154);
  put(grad('ESCALADA', 3, '#ffe07a', '#e0702a'), 164);
  put(grad('ÉPICA', 3, '#ffd060', '#c84a1a'), 197);
}
