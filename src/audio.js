// ===== AUDIO: efectos y música medieval chiptune sintetizados (WebAudio, sin archivos) =====
const AUDIO = (function () {
  let ctx = null, master, sfxG, musG, noiseBuf, pulse25, pulse12;
  let muted = false, windGain = null, windFilt = null;
  let song = null, songName = null, step = 0, nextT = 0, timer = null;

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try { ctx = new AC(); } catch (e) { ctx = null; return; }
    master = ctx.createGain(); master.gain.value = muted ? 0 : 0.85; master.connect(ctx.destination);
    sfxG = ctx.createGain(); sfxG.gain.value = 0.55; sfxG.connect(master);
    musG = ctx.createGain(); musG.gain.value = 0.2; musG.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    pulse25 = makePulse(0.25); pulse12 = makePulse(0.125);
    // viento continuo
    const src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    windFilt = ctx.createBiquadFilter(); windFilt.type = 'bandpass'; windFilt.frequency.value = 500; windFilt.Q.value = 0.7;
    windGain = ctx.createGain(); windGain.gain.value = 0;
    src.connect(windFilt); windFilt.connect(windGain); windGain.connect(sfxG); src.start();
    timer = setInterval(schedule, 25);
    if (songName) { const n = songName; songName = null; play(n); }
  }
  function makePulse(duty) {
    const n = 32, re = new Float32Array(n), im = new Float32Array(n);
    for (let i = 1; i < n; i++) im[i] = (2 / (i * Math.PI)) * Math.sin(i * Math.PI * duty);
    return ctx.createPeriodicWave(re, im);
  }
  function setMuted(m) { muted = m; if (master) master.gain.setTargetAtTime(m ? 0 : 0.85, ctx.currentTime, 0.02); }
  function isMuted() { return muted; }

  function osc(type, f0, f1, dur, vol, when, dest, attack) {
    if (!ctx) return;
    const t = ctx.currentTime + (when || 0);
    const o = ctx.createOscillator(), g = ctx.createGain();
    if (type === 'p25') o.setPeriodicWave(pulse25); else if (type === 'p12') o.setPeriodicWave(pulse12); else o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const a = attack || 0.004;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || sfxG);
    o.start(t); o.stop(t + dur + 0.02);
    return o;
  }
  function noise(dur, vol, freq, type, when, dest, f1) {
    if (!ctx) return;
    const t = ctx.currentTime + (when || 0);
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    s.playbackRate.value = 1;
    const f = ctx.createBiquadFilter(); f.type = type || 'bandpass'; f.frequency.setValueAtTime(freq, t);
    if (f1) f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest || sfxG);
    s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.02);
  }

  const S = {
    jump() { osc('p25', 300, 620, 0.11, 0.22); },
    walljump() { osc('p25', 420, 900, 0.1, 0.2); noise(0.06, 0.12, 2500); },
    climbjump() { osc('p25', 380, 720, 0.09, 0.18); },
    hop() { osc('p25', 520, 820, 0.07, 0.14); },
    grab() { noise(0.045, 0.22, 2800, 'highpass'); },
    land() { noise(0.07, 0.22, 500, 'lowpass'); },
    step() { noise(0.025, 0.05, 1400, 'bandpass'); },
    crystal() { [988, 1319, 1760].forEach((f, i) => osc('square', f, f, 0.09, 0.12, i * 0.055)); },
    chalk() { noise(0.3, 0.22, 1600, 'bandpass', 0, null, 600); osc('triangle', 660, 1100, 0.16, 0.18, 0.05); },
    seguro() { osc('square', 1568, 1568, 0.05, 0.14); osc('square', 2093, 2093, 0.09, 0.14, 0.06); },
    death() { osc('sawtooth', 520, 60, 0.45, 0.2); noise(0.45, 0.28, 900, 'lowpass', 0, null, 150); },
    catch() { osc('triangle', 220, 110, 0.3, 0.3); osc('square', 1500, 1500, 0.05, 0.12, 0.02); },
    crumble() { noise(0.3, 0.3, 700, 'lowpass', 0, null, 200); },
    shake() { noise(0.08, 0.08, 900, 'bandpass'); },
    rock() { noise(0.18, 0.22, 400, 'lowpass', 0, null, 120); },
    ice() { noise(0.18, 0.2, 6000, 'highpass'); osc('triangle', 2400, 3200, 0.08, 0.08); },
    condor() { osc('sawtooth', 1500, 820, 0.35, 0.06); },
    screech() { osc('sawtooth', 1800, 900, 0.25, 0.05); osc('square', 2400, 1600, 0.18, 0.03, 0.05); },
    lev() { osc('triangle', 520, 1040, 0.35, 0.14, 0, null, 0.03); osc('sine', 1560, 2080, 0.3, 0.06, 0.05); noise(0.3, 0.06, 5000, 'highpass'); },
    hurt() { osc('square', 660, 220, 0.18, 0.18); noise(0.12, 0.2, 1200, 'bandpass'); },
    slip() { osc('p25', 300, 140, 0.22, 0.16); },
    gust() { noise(0.6, 0.12, 300, 'bandpass', 0, null, 1200); },
    move() { osc('p25', 700, 700, 0.04, 0.1); },
    select() { osc('p25', 880, 1320, 0.09, 0.14); },
    back() { osc('p25', 520, 330, 0.09, 0.11); },
    arrow() { noise(0.12, 0.12, 3000, 'bandpass', 0, null, 6000); osc('triangle', 900, 500, 0.08, 0.05); },
    bow() { osc('triangle', 220, 330, 0.12, 0.08); },
    stomp() { osc('p25', 200, 700, 0.12, 0.2); noise(0.06, 0.15, 900, 'lowpass'); },
    poof() { noise(0.2, 0.18, 1200, 'bandpass', 0, null, 300); osc('square', 600, 200, 0.12, 0.08); },
    vent() { noise(0.5, 0.16, 600, 'lowpass', 0, null, 2500); },
    hiss() { noise(0.3, 0.05, 4000, 'highpass'); },
    rune() { [1047, 1319, 1568, 2093].forEach((f, i) => osc('triangle', f, f, 0.25, 0.12, i * 0.05)); noise(0.4, 0.1, 7000, 'highpass'); },
    roar() { osc('sawtooth', 120, 55, 1.1, 0.28, 0, null, 0.08); osc('sawtooth', 180, 70, 1.0, 0.16, 0.05, null, 0.08); noise(1.0, 0.25, 400, 'lowpass', 0, null, 120); },
    slam() { osc('sine', 90, 30, 0.5, 0.6); noise(0.5, 0.35, 300, 'lowpass', 0, null, 80); },
    throw() { noise(0.25, 0.14, 500, 'bandpass', 0, null, 1500); },
    beam() { noise(0.9, 0.22, 900, 'bandpass', 0, null, 1600); osc('sawtooth', 160, 150, 0.9, 0.1); },
    splash() { noise(0.25, 0.2, 700, 'lowpass', 0, null, 200); },
    freeze() { [2093, 2637, 3136, 2349, 2794].forEach((f, i) => osc('triangle', f, f * 0.98, 0.3, 0.1, i * 0.04)); noise(0.6, 0.15, 6000, 'highpass'); },
    shatter() { noise(1.2, 0.4, 1500, 'lowpass', 0, null, 100); osc('sawtooth', 300, 40, 1.0, 0.18); [784, 988, 1175].forEach((f, i) => osc('triangle', f, f, 0.4, 0.1, 0.6 + i * 0.1)); },
    win() {
      const n = [523, 659, 784, 1047, 784, 1047, 1319];
      n.forEach((f, i) => osc('p25', f, f, i === n.length - 1 ? 0.6 : 0.12, 0.16, i * 0.11));
      [262, 330, 392, 523].forEach((f, i) => osc('triangle', f, f, 0.5, 0.18, i * 0.22));
    },
    summit() {
      const n = [392, 523, 659, 784, 659, 784, 1047, 988, 1047];
      n.forEach((f, i) => osc('triangle', f, f, i === n.length - 1 ? 1.2 : 0.2, 0.2, i * 0.16, null, 0.02));
      n.forEach((f, i) => osc('p25', f * 2, f * 2, 0.08, 0.06, i * 0.16));
    }
  };
  function sfx(n) { if (ctx && S[n]) try { S[n](); } catch (e) { } }
  function setWind(v) { if (windGain) { windGain.gain.setTargetAtTime(v * 0.5, ctx.currentTime, 0.15); windFilt.frequency.setTargetAtTime(350 + v * 700, ctx.currentTime, 0.2); } }

  // ---------- música ----------
  const SC = { maj: [0, 2, 4, 5, 7, 9, 11], min: [0, 2, 3, 5, 7, 8, 10], dor: [0, 2, 3, 5, 7, 9, 10], phr: [0, 1, 3, 5, 7, 8, 10] };
  const SONGS = {
    titulo: { root: 62, sc: 'dor', bpm: 92, lead: 'quena', perc: 1,
      mel: '0...2.3.4...3.2.' + '1...0.....-.....' + '4...5.6.7...6.4.' + '5.......4...-...' + '7...6.5.4...5.6.' + '7...4.5.6...5.4.' + '3.2.1.2.3...1...' + '0.......-...-...',
      ch: [0, 3, 0, 6, 0, 3, 4, 0] },
    faldas: { root: 64, sc: 'dor', bpm: 104, lead: 'quena', perc: 2,
      mel: '0.2.4.....3.2.0.' + '1.....2.3.......' + '4.5.6.7.....6.4.' + '5...4...3...-...' + '7.6.4.6.7...4...' + '5.4.3.4.5...3...' + '2.1.2.3.4...1.2.' + '0.......-...-...',
      ch: [0, 3, 6, 0, 0, 3, 4, 0] },
    ruinas: { root: 57, sc: 'dor', bpm: 98, lead: 'pulse', perc: 2,
      mel: '4...4.5.4.2.0...' + '1.2.3.....-.....' + '4...4.5.4.2.0...' + '6.5.4.....-.....' + '7.6.7.4...5.6...' + '7...6.4.2...4...' + '3.4.5.3.2.1.2...' + '0.......-...-...',
      ch: [0, 0, 6, 3, 0, 0, 6, 4] },
    riscos: { root: 59, sc: 'phr', bpm: 110, lead: 'quena', perc: 2,
      mel: '0.1.0.4.....3.1.' + '0.......-.......' + '0.1.0.4.....5.6.' + '7.......-.......' + '7.6.5.4.5.6.7...' + '8.7.6.5.4.......' + '3.4.5.3.1.0.1...' + '0.......-...-...',
      ch: [0, 1, 0, 6, 0, 1, 5, 0] },
    magma: { root: 52, sc: 'phr', bpm: 120, lead: 'pulse', perc: 2,
      mel: '0.0.1.0.4.3.1...' + '0.0.1.0.6.5.4...' + '4.4.5.4.7.6.5...' + '4.......-.......' + '7.7.8.7.6.5.4...' + '5.5.6.5.4.3.1...' + '0.1.3.4.5.4.3.1.' + '0.......-...-...',
      ch: [0, 1, 0, 6, 0, 1, 6, 0] },
    cueva: { root: 62, sc: 'phr', bpm: 80, lead: 'quena', perc: 0,
      mel: '7.......8.......' + '7...6...4.......' + '5.......4...3...' + '4...............' + '7.......9.......' + '8...7...6.......' + '5...4...3...1...' + '0...............',
      ch: [0, 1, 0, 5, 0, 1, 6, 0] },
    nido: { root: 60, sc: 'phr', bpm: 116, lead: 'pulse', perc: 2,
      mel: '4.3.1.0.1.3.4...' + '6.5.4.3.4...-...' + '4.3.1.0.1.3.4.5.' + '7.......-.......' + '7.8.7.5.4.5.7...' + '8.7.5.4.3.4.5...' + '4.3.1.3.4.3.1...' + '0.......-...-...',
      ch: [0, 1, 0, 6, 0, 1, 5, 0] },
    chimenea: { root: 55, sc: 'min', bpm: 132, lead: 'pulse', perc: 2,
      mel: '4.4.4.5.4.3.2...' + '3.3.3.4.3.2.1...' + '2.2.2.3.4.5.6.7.' + '7.....6.4.......' + '7.7.7.9.7.6.5...' + '6.6.6.7.6.5.4...' + '5.4.3.4.5.6.7.8.' + '7.......4...7...',
      ch: [0, 6, 5, 4, 0, 6, 5, 4] },
    ceniza: { root: 57, sc: 'min', bpm: 108, lead: 'quena', perc: 1,
      mel: '4...3.2.0...2.3.' + '4.......-...-...' + '5...4.3.2...3.4.' + '3.......-...-...' + '7...6.4.5...4.3.' + '4...2.3.4...-...' + '2.3.4.2.1...0.1.' + '0.......-...-...',
      ch: [0, 4, 5, 3, 5, 2, 6, 0] },
    jefe: { root: 52, sc: 'phr', bpm: 146, lead: 'pulse', perc: 3,
      mel: '0.0.0.1.0.0.0.3.' + '0.0.0.1.0.0.4.3.' + '0.0.0.1.0.0.0.3.' + '1.1.1.3.1.0.6.0.' + '7.7.7.8.7.6.5.4.' + '5.5.5.6.5.4.3.1.' + '4.4.3.3.1.1.0.1.' + '0...0...7...0...',
      ch: [0, 1, 0, 1, 6, 5, 1, 0] },
    bosque: { root: 62, sc: 'dor', bpm: 100, lead: 'quena', perc: 2,
      mel: '4.2.0.2.4...5.4.' + '2.......0...-...' + '4.5.7.5.4...2.4.' + '5.......-.......' + '7.6.5.4.5...7...' + '9.7.5.4.2...4...' + '5.4.2.1.2.0.1.2.' + '0.......-...-...',
      ch: [0, 6, 3, 4, 0, 6, 4, 0] },
    corrupto: { root: 57, sc: 'min', bpm: 88, lead: 'quena', perc: 1,
      mel: '0...2.3.2...0...' + '-1..0...-.......' + '3...4.5.4...3...' + '2.......-.......' + '5...4.3.2...3.4.' + '5...7...5.......' + '4.3.2.0.1.2.-1..' + '0.......-...-...',
      ch: [0, 5, 3, 4, 5, 2, 6, 0] },
    nieve: { root: 64, sc: 'min', bpm: 96, lead: 'quena', perc: 1,
      mel: '7...7.6.4...2...' + '4.......-...-...' + '5...5.4.2...0...' + '2.......-...-...' + '4.5.7.9.7...5...' + '7.6.4.2.4.......' + '2.4.5.4.2.1.0...' + '0.......-...-...',
      ch: [0, 5, 2, 6, 0, 5, 4, 0] },
    ventisca: { root: 59, sc: 'min', bpm: 116, lead: 'pulse', perc: 2,
      mel: '0.0.2.3.4.3.2...' + '0.0.2.3.5.4.3...' + '4.4.5.6.7.6.5...' + '4.......-.......' + '7.7.6.5.4.5.6...' + '7.6.5.4.3.4.5...' + '4.3.2.3.4.2.1...' + '0.......-...-...',
      ch: [0, 6, 5, 4, 0, 6, 5, 0] },
    torre: { root: 55, sc: 'phr', bpm: 84, lead: 'pulse', perc: 1,
      mel: '0...1...0...-1..' + '0...........-...' + '3...4...5...4...' + '3...1...0.......' + '7...8...7...5...' + '4...5...3...1...' + '0...1...3...1...' + '0...............',
      ch: [0, 1, 0, 6, 0, 1, 5, 0] },
    cripta: { root: 53, sc: 'phr', bpm: 72, lead: 'quena', perc: 0,
      mel: '0.......1.......' + '0...-1..-2......' + '0.......3.......' + '1...0...-1......' + '4.......5.......' + '4...3...1.......' + '0...1...-1......' + '0...............',
      ch: [0, 1, 0, 6, 0, 1, 6, 0] },
    almenas: { root: 57, sc: 'phr', bpm: 104, lead: 'pulse', perc: 2,
      mel: '0.1.3.1.0...4...' + '3.1.0.-1.0.......' .slice(0, 16) + '0.1.3.4.5...7...' + '5.4.3.1.3.......' + '7.8.7.5.4...5...' + '4.3.1.0.1...3...' + '1.0.-1.0.1.3.4..' .slice(0, 16) + '0.......-...-...',
      ch: [0, 1, 6, 0, 5, 1, 6, 0] },
    astral: { root: 64, sc: 'maj', bpm: 84, lead: 'quena', perc: 0,
      mel: '7.......9.......' + '7...4...2.......' + '4.......5...7...' + '4...............' + '9.......b.......' + '9...7...5.......' + '4...5...2...4...' + '0...............',
      ch: [0, 5, 3, 4, 0, 5, 3, 0] },
    astral2: { root: 67, sc: 'maj', bpm: 96, lead: 'quena', perc: 1,
      mel: '4...5...7...9...' + '7.......4.......' + '5...7...9...b...' + 'a.......9.......' + '9...7...5...4...' + '5...4...2...4...' + '4...2...1...2...' + '0.......-...-...',
      ch: [0, 3, 5, 4, 0, 3, 4, 0] },
    jefe2: { root: 60, sc: 'min', bpm: 140, lead: 'pulse', perc: 3,
      mel: '0.0.4.0.0.0.5.4.' + '0.0.4.0.7.6.5.4.' + '2.2.5.2.2.2.6.5.' + '4.......-.......' + '7.7.9.7.7.7.a.9.' + '7.6.5.4.5.6.7...' + '9.7.5.4.2.4.5.2.' + '0...0...7...0...',
      ch: [0, 5, 3, 4, 0, 5, 6, 0] },
    final: { root: 60, sc: 'maj', bpm: 92, lead: 'quena', perc: 1,
      mel: '4...5...7.......' + '9...8...7...5...' + '4...5...7...4...' + '2...............' + '4...5...7.......' + '9...a...b...9...' + '8...7...5...8...' + '7...............',
      ch: [0, 5, 3, 4, 0, 5, 3, 0] }
  };
  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function degNote(s, deg) { const sc = SC[s.sc]; const o = Math.floor(deg / 7); const d = ((deg % 7) + 7) % 7; return s.root + sc[d] + 12 * o; }
  function charDeg(c) { if (c >= '0' && c <= '9') return c.charCodeAt(0) - 48; if (c >= 'a' && c <= 'e') return c.charCodeAt(0) - 87; return null; }

  function play(name) {
    if (songName === name) return;
    songName = name;
    song = SONGS[name] || null;
    step = 0;
    if (ctx) nextT = ctx.currentTime + 0.08;
  }
  function stop() { songName = null; song = null; }
  function schedule() {
    if (!ctx || !song || ctx.state !== 'running') return;
    const spb = 60 / song.bpm / 4;
    if (nextT < ctx.currentTime - 0.2) nextT = ctx.currentTime + 0.02;
    while (nextT < ctx.currentTime + 0.14) { playStep(song, step, nextT, spb); nextT += spb; step = (step + 1) % song.mel.length; }
  }
  function playStep(s, i, t, spb) {
    const when = t - ctx.currentTime;
    const bar = Math.floor(i / 16), st = i % 16;
    const cd = s.ch[bar % s.ch.length];
    // melodía
    const c = s.mel[i], deg = charDeg(c);
    if (deg !== null) {
      let len = 1; while (s.mel[(i + len) % s.mel.length] === '.' && len < 16) len++;
      const f = mtof(degNote(s, deg) + 12);
      const dur = len * spb * 0.95;
      if (s.lead === 'quena') {
        const o = osc('triangle', f, f, dur, 0.34, when, musG, 0.03);
        if (o && dur > 0.25) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 5.5; lg.gain.value = 10; l.connect(lg); lg.connect(o.detune); l.start(t + 0.12); l.stop(t + dur); }
        osc('sine', f * 2, f * 2, Math.min(dur, 0.12), 0.05, when, musG, 0.01);
      } else osc('p25', f, f, dur, 0.16, when, musG, 0.01);
    }
    // bajo (ritmo de huayno: larga-corta-corta)
    if (st === 0 || st === 6 || st === 8 || st === 14) {
      const n = degNote(s, cd) - 12 + (st === 6 || st === 14 ? 7 : 0);
      osc('triangle', mtof(n), mtof(n), spb * (st % 8 === 0 ? 5 : 1.8), 0.42, when, musG);
    }
    // charango (arpegio)
    const arpEvery = s.perc === 0 ? 4 : 2;
    if (st % arpEvery === 0) {
      const pat = [0, 2, 4, 7, 4, 2, 4, 7];
      const n = degNote(s, cd + pat[(st / arpEvery) % pat.length]);
      osc('p12', mtof(n), mtof(n), spb * 1.4, s.perc === 0 ? 0.06 : 0.07, when, musG);
    }
    // percusión
    if (s.perc >= 3 && (st === 4 || st === 12 || st === 14)) osc('sine', 110, 40, 0.18, 0.55, when, musG);
    if (s.perc >= 1) {
      if (st === 0 || st === 8) osc('sine', 140, 45, 0.14, 0.5, when, musG);
      if (st % 4 === 2) noise(0.03, 0.07, 8000, 'highpass', when, musG);
      if (s.perc >= 2 && (st === 4 || st === 12)) { noise(0.09, 0.12, 1700, 'bandpass', when, musG); osc('triangle', 190, 120, 0.08, 0.15, when, musG); }
    } else if (st % 8 === 4) noise(0.12, 0.035, 9000, 'highpass', when, musG);
  }
  return { init, sfx, play, stop, setMuted, isMuted, setWind };
})();
