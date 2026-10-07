/* Audio procédural (placeholder des MetaSounds) :
   ambiance du lac la nuit + couche « souvenir » pilotée par un seul paramètre Mémoire (0..1). */
(function () {
  const A = { ctx: null, master: null, vol: 0.8, memory: 0, started: false };

  function noiseBuffer(ctx, type) {
    const len = ctx.sampleRate * 4, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    let last = 0, b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (type === 'brown') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.2; }
      else { b0 = 0.997 * b0 + w * 0.029; b1 = 0.985 * b1 + w * 0.032; b2 = 0.95 * b2 + w * 0.048; d[i] = (b0 + b1 + b2 + w * 0.02) * 0.9; }
    }
    return buf;
  }

  function loopNoise(type) {
    const s = A.ctx.createBufferSource();
    s.buffer = type === 'brown' ? A.brown : A.pink; s.loop = true; s.start();
    return s;
  }

  function lfo(freq, depth, target, offset) {
    const o = A.ctx.createOscillator(), g = A.ctx.createGain();
    o.frequency.value = freq; g.gain.value = depth; o.connect(g); g.connect(target);
    if (offset !== undefined) target.value = offset;
    o.start(); return o;
  }

  A.init = function () {
    if (A.ctx) { if (A.ctx.state === 'suspended') A.ctx.resume(); return; }
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = (A.ctx = new Ctx());
    A.brown = noiseBuffer(ctx, 'brown'); A.pink = noiseBuffer(ctx, 'pink');

    A.master = ctx.createGain(); A.master.gain.value = 0; A.master.connect(ctx.destination);
    const comp = ctx.createDynamicsCompressor(); comp.connect(A.master);
    A.out = comp;

    // Réverbération courte et douce (impulsion synthétique)
    const rev = ctx.createConvolver(), ir = ctx.createBuffer(2, ctx.sampleRate * 3, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.6); }
    rev.buffer = ir; const revG = ctx.createGain(); revG.gain.value = 0.35; rev.connect(revG); revG.connect(comp);
    A.rev = rev;

    // Eau : bruit brun filtré, vagues lentes
    const water = loopNoise('brown'), wf = ctx.createBiquadFilter(), wg = ctx.createGain();
    wf.type = 'lowpass'; wf.frequency.value = 520; wg.gain.value = 0.0;
    water.connect(wf); wf.connect(wg); wg.connect(comp);
    lfo(0.11, 160, wf.frequency, 520);
    A.waterGain = wg;

    // Vent dans les feuilles
    const wind = loopNoise('pink'), bf = ctx.createBiquadFilter(), bg = ctx.createGain();
    bf.type = 'bandpass'; bf.Q.value = 0.6; bf.frequency.value = 700; bg.gain.value = 0.0;
    wind.connect(bf); bf.connect(bg); bg.connect(comp); bg.connect(rev);
    lfo(0.05, 300, bf.frequency, 700);
    A.windGain = bg;

    // Nappe du présent : froide, lunaire (ré, la, mi, fa)
    A.nightGain = ctx.createGain(); A.nightGain.gain.value = 0; A.nightGain.connect(comp); A.nightGain.connect(rev);
    const nf = ctx.createBiquadFilter(); nf.type = 'lowpass'; nf.frequency.value = 900; nf.connect(A.nightGain);
    [146.83, 220, 329.63, 349.23].forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = i % 2 ? 'triangle' : 'sine'; o.frequency.value = f; o.detune.value = (i - 1.5) * 4;
      g.gain.value = 0.05 / (i + 1); o.connect(g); g.connect(nf); o.start();
      lfo(0.07 + i * 0.03, 0.02 / (i + 1), g.gain, 0.05 / (i + 1));
    });

    // Couche souvenir : chaude, dorée (fa, la, do, mi)
    A.memGain = ctx.createGain(); A.memGain.gain.value = 0; A.memGain.connect(comp); A.memGain.connect(rev);
    const mf = ctx.createBiquadFilter(); mf.type = 'lowpass'; mf.frequency.value = 1800; mf.connect(A.memGain);
    [174.61, 220, 261.63, 329.63, 523.25].forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f; o.detune.value = (i - 2) * 5;
      g.gain.value = 0.06 / (i + 1); o.connect(g); g.connect(mf); o.start();
    });

    A.started = true;
    A.setVolume(A.vol);
    A.setLayer('silence', 0);
  };

  A.setVolume = function (v) {
    A.vol = v; if (!A.ctx) return;
    A.master.gain.setTargetAtTime(v * 0.9, A.ctx.currentTime, 0.3);
  };

  /* Couches d'ambiance : 'silence' | 'lac' | 'interieur' */
  A.setLayer = function (name, time) {
    if (!A.ctx) return;
    const t = A.ctx.currentTime, k = (time === undefined ? 2 : time) / 3;
    const lvl = { silence: [0, 0, 0], eau: [0.5, 0, 0], lac: [0.42, 0.22, 1], interieur: [0.08, 0.06, 0.8] }[name] || [0, 0, 0];
    A.waterGain.gain.setTargetAtTime(lvl[0], t, k);
    A.windGain.gain.setTargetAtTime(lvl[1], t, k);
    A.layer = lvl[2];
    A.setMemory(A.memory, time);
  };

  /* Paramètre Mémoire : fondu présent / souvenir */
  A.setMemory = function (m, time) {
    A.memory = m; if (!A.ctx) return;
    const t = A.ctx.currentTime, k = (time === undefined ? 1.5 : time) / 3, base = A.layer === undefined ? 1 : A.layer;
    A.nightGain.gain.setTargetAtTime(base * (1 - m), t, k);
    A.memGain.gain.setTargetAtTime(m * 0.9, t, k);
  };

  function tone(freq, when, dur, gain, type, toRev) {
    const ctx = A.ctx, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0, when); g.gain.linearRampToValueAtTime(gain, when + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(g); g.connect(A.out); if (toRev !== false) g.connect(A.rev);
    o.start(when); o.stop(when + dur + 0.05);
  }

  function noiseHit(when, dur, gain, ftype, freq, q) {
    const ctx = A.ctx, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = A.pink; f.type = ftype; f.frequency.value = freq; f.Q.value = q || 1;
    g.gain.setValueAtTime(0, when); g.gain.linearRampToValueAtTime(gain, when + dur * 0.35);
    g.gain.linearRampToValueAtTime(0, when + dur);
    s.connect(f); f.connect(g); g.connect(A.out); g.connect(A.rev);
    s.start(when, Math.random() * 2); s.stop(when + dur + 0.1);
  }

  /* Berceuse d'Elya / boîte à musique (thème placeholder) */
  const LULLABY = [[659.25, 0], [587.33, .5], [523.25, 1], [587.33, 1.5], [659.25, 2], [659.25, 2.5], [659.25, 3],
    [587.33, 4], [587.33, 4.5], [587.33, 5], [659.25, 6], [783.99, 6.5], [783.99, 7]];

  A.sfx = function (name) {
    if (!A.ctx || !A.started) return;
    const t = A.ctx.currentTime + 0.02;
    switch (name) {
      case 'breath': noiseHit(t, 2.6, 0.22, 'bandpass', 600, 0.7); break;
      case 'interact': tone(1318.5, t, 0.9, 0.04); tone(1975.5, t + 0.06, 1.2, 0.025); break;
      case 'glint': tone(2637, t, 1.4, 0.02); break;
      case 'carnet': noiseHit(t, 0.5, 0.08, 'highpass', 3000, 0.5); tone(880, t + 0.1, 1.2, 0.025); break;
      case 'leaf': tone(1567.98, t, 1.6, 0.025); tone(2093, t + 0.12, 1.6, 0.018); break;
      case 'resonance': tone(220, t, 2.5, 0.06, 'triangle'); tone(330, t + 0.1, 2.5, 0.04); tone(440, t + 0.2, 2.5, 0.03); break;
      case 'flash': noiseHit(t, 2.2, 0.35, 'lowpass', 3500, 0.5); tone(523.25, t + 0.4, 3.5, 0.06); tone(659.25, t + 0.5, 3.5, 0.05); tone(783.99, t + 0.6, 3.5, 0.04); break;
      case 'fragment': [1046.5, 1318.5, 1567.98].forEach((f, i) => tone(f, t + i * 0.09, 1.8, 0.035)); break;
      case 'collapse': noiseHit(t, 3, 0.4, 'highpass', 1200, 0.3); tone(110, t, 3, 0.08, 'sawtooth', true); break;
      case 'lullaby': LULLABY.forEach(([f, d]) => { tone(f, t + d * 0.55, 1.6, 0.045); tone(f * 2, t + d * 0.55, 0.8, 0.012); }); break;
      case 'creature': tone(73.42, t, 6, 0.05, 'sine'); tone(110, t + 1.5, 5, 0.03, 'sine'); noiseHit(t, 6, 0.06, 'lowpass', 300, 0.5); break;
      case 'steps': for (let i = 0; i < 5; i++) noiseHit(t + i * 0.42, 0.18, 0.05, 'bandpass', 900 + Math.random() * 300, 1.2); break;
    }
  };

  ELY.Audio = A;
})();
