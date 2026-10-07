/* Effets dessinés par-dessus le plan : particules, lucioles de mémoire, créature céleste,
   silhouette lointaine d'Elya, ombres, marque de la paume, silhouettes de l'Écho, fissures. */
(function () {
  const R = () => ELY.R;
  const FX = {
    calm: false, t: 0,
    motes: [], guides: [], bursts: [], waves: [], glints: [],
    moteMode: 'present', moteAlpha: 0,
    eyelids: null, creature: null, elyaFar: null, shadows: null, palm: null, figures: null, cracks: null, leaves: [],
    guideTarget: null
  };

  FX.init = function (canvas) {
    FX.canvas = canvas; FX.ctx = canvas.getContext('2d');
    FX.resize(); window.addEventListener('resize', FX.resize);
    for (let i = 0; i < 70; i++) FX.motes.push(newMote(true));
    FX.figurePts = buildFigures();
  };

  FX.resize = function () {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    FX.dpr = dpr; FX.W = window.innerWidth; FX.H = window.innerHeight;
    FX.canvas.width = Math.round(FX.W * dpr); FX.canvas.height = Math.round(FX.H * dpr);
  };

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function newMote(anywhere) {
    return { x: Math.random(), y: anywhere ? Math.random() : 1.05, r: rnd(0.6, 2.2), s: rnd(0.004, 0.018), ph: rnd(0, 6.28), w: rnd(0.2, 0.8), life: rnd(0.4, 1) };
  }

  /* ——— Silhouettes de l'Écho : nuages de points dorés, visages illisibles ——— */
  function buildFigures() {
    const c = document.createElement('canvas'); c.width = 200; c.height = 400;
    const g = c.getContext('2d', { willReadFrequently: true });
    function sample(draw) {
      g.clearRect(0, 0, 200, 400); g.fillStyle = '#fff'; draw(g);
      const d = g.getImageData(0, 0, 200, 400).data, pts = [];
      for (let i = 0; i < 5200; i++) {
        const x = Math.random() * 200, y = Math.random() * 400;
        if (d[((y | 0) * 200 + (x | 0)) * 4 + 3] > 0) pts.push({ x: x / 200 - 0.5, y: y / 400 - 1, ph: Math.random() * 6.28, r: rnd(0.5, 1.6) });
      }
      return pts;
    }
    const woman = sample((g) => {
      g.beginPath(); g.ellipse(100, 46, 17, 21, 0, 0, 6.29); g.fill();                   // tête
      g.beginPath(); g.moveTo(86, 40); g.quadraticCurveTo(128, 30, 122, 120);            // chevelure longue
      g.quadraticCurveTo(110, 96, 104, 70); g.fill();
      g.fillRect(93, 62, 14, 16);                                                        // cou
      g.beginPath(); g.moveTo(70, 86); g.quadraticCurveTo(100, 74, 130, 86);             // épaules
      g.quadraticCurveTo(128, 150, 116, 190); g.lineTo(84, 190); g.quadraticCurveTo(72, 150, 70, 86); g.fill();
      g.beginPath(); g.moveTo(84, 186); g.lineTo(116, 186);                              // robe
      g.quadraticCurveTo(130, 290, 146, 396); g.lineTo(56, 396); g.quadraticCurveTo(70, 290, 84, 186); g.fill();
      g.beginPath(); g.moveTo(72, 92); g.quadraticCurveTo(58, 160, 74, 214); g.lineTo(82, 210); g.quadraticCurveTo(72, 160, 82, 100); g.fill(); // bras
      g.beginPath(); g.moveTo(128, 92); g.quadraticCurveTo(150, 150, 124, 196); g.lineTo(118, 190); g.quadraticCurveTo(136, 150, 120, 100); g.fill();
    });
    const child = sample((g) => {
      g.beginPath(); g.ellipse(100, 70, 30, 34, 0, 0, 6.29); g.fill();                   // tête
      g.beginPath(); g.moveTo(70, 66); g.quadraticCurveTo(60, 130, 78, 150); g.lineTo(88, 96); g.fill(); // cheveux
      g.beginPath(); g.moveTo(132, 66); g.quadraticCurveTo(142, 130, 122, 150); g.lineTo(112, 96); g.fill();
      g.beginPath(); g.moveTo(66, 122); g.quadraticCurveTo(100, 108, 134, 122);          // buste
      g.quadraticCurveTo(140, 220, 150, 300); g.lineTo(50, 300); g.quadraticCurveTo(60, 220, 66, 122); g.fill();
      g.fillRect(70, 296, 22, 100); g.fillRect(108, 296, 22, 100);                       // jambes
      g.beginPath(); g.moveTo(70, 130); g.quadraticCurveTo(48, 200, 60, 250); g.lineTo(70, 246); g.quadraticCurveTo(62, 200, 80, 140); g.fill(); // bras
      g.beginPath(); g.moveTo(130, 130); g.quadraticCurveTo(150, 190, 136, 236); g.lineTo(128, 232); g.quadraticCurveTo(138, 190, 120, 140); g.fill();
    });
    return { woman, child };
  }

  /* ——— API ——— */
  FX.setMotes = function (mode, alpha) { FX.moteMode = mode; FX.moteTarget = alpha; };
  FX.guide = function (target, on) { FX.guideTarget = on === false ? null : target; };
  FX.burst = function (sx, sy, toX, toY, gold) {
    const parts = [];
    for (let i = 0; i < (FX.calm ? 14 : 34); i++) parts.push({ x: sx, y: sy, vx: rnd(-120, 120), vy: rnd(-140, 60), life: 1, r: rnd(1, 2.6) });
    FX.bursts.push({ parts, toX, toY, t: 0, gold: gold !== false });
  };
  FX.wave = function (x, y, gold) { FX.waves.push({ x, y, t: 0, gold: gold !== false }); };
  FX.leaf = function () {
    FX.leaves.push({ x: FX.W - rnd(60, 110), y: -20, t: 0, rot: rnd(0, 6), sway: rnd(0.8, 1.4) });
  };

  /* ——— Dessin ——— */
  function glow(ctx, x, y, r, col, a) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.29); ctx.fill();
  }

  function drawMotes(ctx, dt) {
    const target = FX.moteTarget === undefined ? 0 : FX.moteTarget;
    FX.moteAlpha += (target - FX.moteAlpha) * Math.min(1, dt * 0.8);
    if (FX.moteAlpha < 0.01) return;
    const gold = FX.moteMode === 'echo', n = FX.calm ? 26 : FX.motes.length;
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) {
      const m = FX.motes[i];
      m.y -= m.s * dt * (gold ? 1.6 : 1); m.x += Math.sin(FX.t * m.w + m.ph) * 0.0004;
      if (m.y < -0.05) Object.assign(m, newMote(false));
      const x = m.x * FX.W, y = m.y * FX.H, tw = 0.55 + 0.45 * Math.sin(FX.t * 2 * m.w + m.ph);
      const a = FX.moteAlpha * tw * m.life * (gold ? 0.9 : 0.55);
      glow(ctx, x, y, m.r * (gold ? 6 : 4), gold ? 'rgba(255,205,120,A)' : 'rgba(205,195,255,A)', a * 0.5);
      ctx.fillStyle = gold ? 'rgba(255,236,190,' + a + ')' : 'rgba(235,232,255,' + a + ')';
      ctx.beginPath(); ctx.arc(x, y, m.r * 0.7, 0, 6.29); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  /* Lucioles de mémoire : particules dorées qui dérivent vers ce qui compte. */
  function drawGuides(ctx, dt) {
    if (FX.guideTarget && FX.guides.length < (FX.calm ? 6 : 14) && Math.random() < dt * 3) {
      const r = R().viewRect();
      FX.guides.push({ x: r[0] + Math.random() * r[2], y: r[1] + r[3] * rnd(0.55, 0.95), ph: rnd(0, 6), sp: rnd(0.05, 0.1), life: 0 });
    }
    ctx.globalCompositeOperation = 'lighter';
    for (let i = FX.guides.length - 1; i >= 0; i--) {
      const g = FX.guides[i]; g.life += dt;
      const tg = FX.guideTarget;
      if (tg) { const dx = tg.x - g.x, dy = tg.y - g.y, d = Math.hypot(dx, dy) || 1; g.x += dx / d * g.sp * dt * 0.5; g.y += dy / d * g.sp * dt * 0.5 + Math.sin(FX.t * 2 + g.ph) * 0.0006; if (d < 0.02) g.life = 99; }
      const fade = Math.min(1, g.life * 1.5) * (g.life > 7 ? Math.max(0, 1 - (g.life - 7)) : 1);
      if (g.life > 8 || (!tg && g.life > 1 && Math.random() < dt)) { FX.guides.splice(i, 1); continue; }
      const p = R().toScreen(g.x, g.y), tw = 0.6 + 0.4 * Math.sin(FX.t * 6 + g.ph);
      glow(ctx, p.x, p.y, 14, 'rgba(255,196,100,A)', 0.55 * fade * tw);
      ctx.fillStyle = 'rgba(255,240,200,' + fade + ')'; ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, 6.29); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  /* Créature céleste : silhouette en contre-jour sur une trajectoire, pas une créature animée complète. */
  FX.startCreature = function (from, to, dur) { FX.creature = { from, to, dur, t: 0 }; };
  function drawCreature(ctx, dt) {
    const c = FX.creature; if (!c) return;
    c.t += dt; const k = c.t / c.dur; if (k > 1) { FX.creature = null; return; }
    const ease = k, nx = c.from.x + (c.to.x - c.from.x) * ease, ny = c.from.y + (c.to.y - c.from.y) * ease + Math.sin(k * 6.28) * 0.01;
    const p = R().toScreen(nx, ny), s = Math.min(FX.W, FX.H) * 0.16 * (c.from.s || 1);
    const fade = Math.min(1, k * 5, (1 - k) * 5), flap = Math.sin(FX.t * 0.9) * 0.22;
    const dir = c.to.x < c.from.x ? -1 : 1, f = 1 + flap;
    ctx.save(); ctx.translate(p.x, p.y); ctx.scale(dir, 1); ctx.rotate(-0.08 + Math.sin(FX.t * 0.4) * 0.03);
    ctx.globalAlpha = fade;
    // Traînée de poussière lumineuse
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 1; i < 18; i++) glow(ctx, -s * (0.55 + i * 0.13), Math.sin(FX.t * 0.8 - i * 0.45) * s * 0.04, s * 0.045 * (1 - i / 18), 'rgba(235,225,255,A)', 0.22);
    ctx.globalCompositeOperation = 'source-over';
    // Vue en contre-plongée, aplatie par la distance : une raie céleste qui plane
    ctx.scale(1, 0.42);
    const body = () => {
      ctx.beginPath();
      ctx.moveTo(s * 0.5, 0);
      ctx.quadraticCurveTo(s * 0.32, s * 0.36 * f, -s * 0.06, s * 0.82 * f);
      ctx.quadraticCurveTo(-s * 0.1, s * 0.34 * f, -s * 0.38, s * 0.12);
      ctx.quadraticCurveTo(-s * 1.1, s * 0.03, -s * 1.85, Math.sin(FX.t * 1.1) * s * 0.06);
      ctx.quadraticCurveTo(-s * 1.1, -s * 0.03, -s * 0.38, -s * 0.12);
      ctx.quadraticCurveTo(-s * 0.1, -s * 0.34 * f, -s * 0.06, -s * 0.82 * f);
      ctx.quadraticCurveTo(s * 0.32, -s * 0.36 * f, s * 0.5, 0);
    };
    ctx.shadowColor = 'rgba(225,215,255,0.6)'; ctx.shadowBlur = s * 0.22;
    body(); const g = ctx.createLinearGradient(0, -s * 0.8, 0, s * 0.8);
    g.addColorStop(0, 'rgba(60,46,104,0.35)'); g.addColorStop(0.5, 'rgba(30,22,62,0.55)'); g.addColorStop(1, 'rgba(60,46,104,0.35)');
    ctx.fillStyle = g; ctx.fill();
    ctx.shadowBlur = 0; ctx.globalCompositeOperation = 'lighter';
    body(); ctx.strokeStyle = 'rgba(255,240,226,0.45)'; ctx.lineWidth = 1.4; ctx.stroke();
    // Points bioluminescents le long des ailes
    for (let i = 0; i < 9; i++) {
      const k2 = i / 8, tw = 0.5 + 0.5 * Math.sin(FX.t * 2 + i);
      [-1, 1].forEach((sg) => glow(ctx, s * (0.42 - k2 * 0.46), sg * s * (0.1 + k2 * 0.62) * f, s * 0.03, 'rgba(255,236,200,A)', 0.55 * tw));
    }
    ctx.restore();
  }

  /* Silhouette aux cheveux clairs, au loin sur les rochers. */
  FX.showElyaFar = function (pos, on) { FX.elyaFar = on === false ? null : { x: pos.x, y: pos.y, a: 0 }; };
  function drawElyaFar(ctx, dt) {
    const e = FX.elyaFar; if (!e) return;
    e.a = Math.min(1, e.a + dt * 0.4);
    const p = R().toScreen(e.x, e.y), h = FX.H * 0.042 * Math.max(0.7, R().cam.zoom), w = h * 0.34;
    const sway = Math.sin(FX.t * 0.9) * w * 0.14;
    ctx.save(); ctx.translate(p.x, p.y); ctx.globalAlpha = e.a;
    ctx.globalCompositeOperation = 'lighter';
    glow(ctx, 0, -h * 0.55, h * 1.1, 'rgba(225,218,255,A)', 0.16 + 0.05 * Math.sin(FX.t * 1.3));
    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowColor = 'rgba(240,235,255,0.9)'; ctx.shadowBlur = h * 0.25;
    // robe claire, tissu léger qui bouge
    const g = ctx.createLinearGradient(0, -h, 0, 0);
    g.addColorStop(0, 'rgba(250,244,235,0.9)'); g.addColorStop(1, 'rgba(205,200,240,0.55)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(-w * 0.14, -h * 0.8); ctx.quadraticCurveTo(0, -h * 0.84, w * 0.14, -h * 0.8);
    ctx.quadraticCurveTo(w * 0.2, -h * 0.42, w * 0.46 + sway, -h * 0.02); ctx.quadraticCurveTo(0, h * 0.03, -w * 0.4 + sway * 0.5, -h * 0.02);
    ctx.quadraticCurveTo(-w * 0.2, -h * 0.42, -w * 0.14, -h * 0.8); ctx.fill();
    // tête et chevelure longue, éclairées par les lunes
    ctx.fillStyle = 'rgba(244,228,196,0.95)';
    ctx.beginPath(); ctx.ellipse(0, -h * 0.89, w * 0.13, h * 0.075, 0, 0, 6.29); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-w * 0.13, -h * 0.93); ctx.quadraticCurveTo(w * 0.18 + sway, -h * 0.78, w * 0.16 + sway * 1.6, -h * 0.5);
    ctx.quadraticCurveTo(w * 0.05, -h * 0.66, -w * 0.12, -h * 0.84); ctx.fill();
    ctx.restore();
  }

  /* Les deux ombres d'Elya, une par lune. Lui n'en a aucune. */
  FX.showShadows = function (on) { FX.shadows = on ? { a: 0 } : null; };
  function drawShadows(ctx, dt) {
    const s = FX.shadows; if (!s) return;
    s.a = Math.min(1, s.a + dt * 0.35);
    const W = FX.W, H = FX.H, ox = W * 1.04, oy = H * 0.5, L = Math.max(W * 0.6, H * 0.42), B = Math.min(W, H) * 0.09;
    const OFF = 10000; // la forme est dessinée hors champ, seule son ombre floue revient à l'écran
    ctx.save();
    ctx.shadowColor = 'rgba(8,6,20,' + (0.92 * s.a) + ')';
    ctx.shadowBlur = Math.min(W, H) * 0.035; ctx.shadowOffsetX = OFF;
    [-0.27, 0.25].forEach((ang, i) => {
      const len = i ? 0.86 : 1;
      ctx.save(); ctx.translate(ox - OFF, oy); ctx.rotate(Math.PI * 0.82 + ang);
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.moveTo(0, -B * 0.35);
      ctx.quadraticCurveTo(L * len * 0.45, -B * 0.85, L * len * 0.8, -B * 0.5);
      ctx.quadraticCurveTo(L * len, -B * 0.2, L * len * 0.97, B * 0.12);
      ctx.quadraticCurveTo(L * len * 0.88, B * 0.5, L * len * 0.6, B * 0.55);
      ctx.quadraticCurveTo(L * len * 0.3, B * 0.8, 0, B * 0.35); ctx.fill();
      ctx.restore();
    });
    ctx.restore();
  }

  /* Marque lumineuse sous la paume. */
  FX.showPalm = function (pos, on) { FX.palm = on === false ? null : { x: pos.x, y: pos.y, t: 0 }; };
  function drawPalm(ctx, dt) {
    const p = FX.palm; if (!p) return;
    p.t += dt;
    const a = Math.min(1, p.t / 1.6) * (p.t > 4.2 ? Math.max(0, 1 - (p.t - 4.2) / 1.8) : 1);
    if (a <= 0) return;
    const s = R().toScreen(p.x, p.y), r = Math.min(FX.W, FX.H) * 0.22, pulse = 0.85 + 0.15 * Math.sin(p.t * 3);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    glow(ctx, s.x, s.y, r * 1.6 * pulse, 'rgba(255,170,70,A)', 0.45 * a);
    glow(ctx, s.x, s.y, r * pulse, 'rgba(255,200,110,A)', 0.8 * a);
    glow(ctx, s.x, s.y, r * 0.35, 'rgba(255,246,215,A)', 0.95 * a);
    ctx.strokeStyle = 'rgba(255,226,160,' + 0.7 * a + ')'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(s.x, s.y, r * 0.22, 0, 6.29); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s.x, s.y + r * 0.16); ctx.lineTo(s.x, s.y - r * 0.12);
    for (let i = -1; i <= 1; i += 2) { ctx.moveTo(s.x, s.y - r * 0.02); ctx.quadraticCurveTo(s.x + i * r * 0.08, s.y - r * 0.1, s.x + i * r * 0.13, s.y - r * 0.12); }
    ctx.stroke(); ctx.restore();
  }

  /* Paupières : 0 fermées, 1 ouvertes. */
  FX.setEyelids = function (v) { FX.eyelids = v; };
  function drawEyelids(ctx) {
    const v = FX.eyelids; if (v === null || v >= 1) return;
    const W = FX.W, H = FX.H;
    ctx.save(); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    if (v > 0) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.translate(W / 2, H / 2); ctx.scale(W * 0.8, Math.max(1, H * 0.8 * v));
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.55, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 1, 0, 6.29); ctx.fill();
    }
    ctx.restore();
  }

  /* Silhouettes figées de l'Écho. */
  FX.showFigures = function (cfg, on) { FX.figures = on === false ? null : { cfg, a: 0, target: 1, frozen: true }; };
  FX.fadeFigures = function (target) { if (FX.figures) FX.figures.target = target; };
  function drawFigures(ctx, dt) {
    const f = FX.figures; if (!f) return;
    f.a += (f.target - f.a) * Math.min(1, dt * 0.9);
    if (f.a < 0.01 && f.target === 0) { FX.figures = null; return; }
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    [['woman', f.cfg.woman], ['child', f.cfg.child]].forEach(([k, c]) => {
      const base = R().toScreen(c.x, c.y), top = R().toScreen(c.x, c.y - c.h), h = base.y - top.y;
      const pts = FX.figurePts[k], step = FX.calm ? 3 : 1;
      glow(ctx, base.x, base.y - h * 0.55, h * 0.6, 'rgba(255,186,100,A)', 0.22 * f.a);
      const sz = Math.max(1.2, h / 160);
      for (let i = 0; i < pts.length; i += step) {
        const p = pts[i], jit = f.frozen ? 0.8 : 3;
        const x = base.x + p.x * h * 0.5 + Math.sin(FX.t * 1.3 + p.ph) * jit, y = base.y + p.y * h + Math.cos(FX.t * 1.1 + p.ph) * jit;
        const tw = 0.5 + 0.5 * Math.sin(FX.t * 2.2 + p.ph * 3);
        ctx.fillStyle = 'rgba(255,226,170,' + (0.45 + 0.55 * tw) * f.a + ')';
        ctx.fillRect(x, y, p.r * sz, p.r * sz);
      }
    });
    ctx.restore();
  }

  /* Points scintillants (traces de Résonance, fragments). */
  FX.setGlints = function (list) { FX.glints = list || []; };
  function drawGlints(ctx) {
    FX.glints.forEach((g) => {
      if (g.a <= 0.01) return;
      const p = R().toScreen(g.x, g.y), tw = 0.75 + 0.25 * Math.sin(FX.t * 3 + g.x * 40);
      const col = g.gold ? 'rgba(255,205,120,A)' : 'rgba(225,220,255,A)', r = (g.big ? 26 : 16) * tw;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      glow(ctx, p.x, p.y, r * 2, col, 0.35 * g.a);
      ctx.strokeStyle = col.replace('A', 0.7 * g.a); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(p.x - r, p.y); ctx.lineTo(p.x + r, p.y); ctx.moveTo(p.x, p.y - r * 1.3); ctx.lineTo(p.x, p.y + r * 1.3); ctx.stroke();
      glow(ctx, p.x, p.y, 4, 'rgba(255,250,235,A)', g.a);
      ctx.restore();
    });
  }

  function drawBursts(ctx, dt) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = FX.bursts.length - 1; i >= 0; i--) {
      const b = FX.bursts[i]; b.t += dt;
      let alive = 0;
      b.parts.forEach((p) => {
        if (p.life <= 0) return; alive++;
        if (b.t < 0.6) { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.94; p.vy *= 0.94; }
        else { p.x += (b.toX - p.x) * Math.min(1, dt * 3.2); p.y += (b.toY - p.y) * Math.min(1, dt * 3.2); if (Math.hypot(b.toX - p.x, b.toY - p.y) < 6) p.life = 0; }
        glow(ctx, p.x, p.y, p.r * 5, b.gold ? 'rgba(255,200,110,A)' : 'rgba(220,215,255,A)', 0.6);
      });
      if (!alive || b.t > 4) FX.bursts.splice(i, 1);
    }
    for (let i = FX.waves.length - 1; i >= 0; i--) {
      const w = FX.waves[i]; w.t += dt; const k = w.t / 1.8;
      if (k > 1) { FX.waves.splice(i, 1); continue; }
      ctx.strokeStyle = (w.gold ? 'rgba(255,205,120,' : 'rgba(220,215,255,') + (1 - k) * 0.6 + ')';
      ctx.lineWidth = 2 * (1 - k) + 0.5; ctx.beginPath(); ctx.arc(w.x, w.y, k * Math.max(FX.W, FX.H) * 0.7, 0, 6.29); ctx.stroke();
    }
    ctx.restore();
  }

  /* Fissures de l'effondrement du souvenir. */
  FX.startCracks = function () {
    const lines = [], cx = FX.W / 2, cy = FX.H / 2;
    for (let i = 0; i < 9; i++) {
      let x = cx + rnd(-40, 40), y = cy + rnd(-40, 40), a = (i / 9) * 6.28 + rnd(-0.3, 0.3); const pts = [[x, y]];
      for (let j = 0; j < 14; j++) { a += rnd(-0.5, 0.5); const l = rnd(20, 70); x += Math.cos(a) * l; y += Math.sin(a) * l; pts.push([x, y]); }
      lines.push(pts);
    }
    FX.cracks = { lines, t: 0 };
  };
  FX.stopCracks = function () { FX.cracks = null; };
  function drawCracks(ctx, dt) {
    const c = FX.cracks; if (!c) return;
    c.t += dt; const k = Math.min(1, c.t / 2.2);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    c.lines.forEach((pts) => {
      const n = Math.floor(pts.length * k);
      for (let pass = 0; pass < 2; pass++) {
        ctx.strokeStyle = pass ? 'rgba(255,248,230,0.9)' : 'rgba(255,190,100,0.35)'; ctx.lineWidth = pass ? 1.2 : 6;
        ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < n; i++) ctx.lineTo(pts[i][0], pts[i][1]);
        ctx.stroke();
      }
    });
    ctx.restore();
  }

  /* Feuille dorée : un choix a été retenu (on ne sait jamais lequel). */
  function drawLeaves(ctx, dt) {
    for (let i = FX.leaves.length - 1; i >= 0; i--) {
      const l = FX.leaves[i]; l.t += dt;
      if (l.t > 5) { FX.leaves.splice(i, 1); continue; }
      const x = l.x + Math.sin(l.t * 1.6 * l.sway) * 26, y = l.y + l.t * 42, a = Math.min(1, l.t) * Math.min(1, (5 - l.t) / 1.5);
      ctx.save(); ctx.translate(x, y); ctx.rotate(l.rot + Math.sin(l.t * 1.6 * l.sway) * 0.7); ctx.globalAlpha = a;
      glow(ctx, 0, 0, 22, 'rgba(255,200,110,A)', 0.35);
      const g = ctx.createLinearGradient(-10, 0, 10, 0); g.addColorStop(0, '#f6d58e'); g.addColorStop(1, '#c48a3c');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -12); ctx.quadraticCurveTo(10, -2, 0, 12); ctx.quadraticCurveTo(-10, -2, 0, -12); ctx.fill();
      ctx.strokeStyle = 'rgba(120,70,20,.6)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(0, 13); ctx.stroke();
      ctx.restore();
    }
  }

  FX.render = function (dt) {
    FX.t += dt;
    const ctx = FX.ctx;
    ctx.setTransform(FX.dpr, 0, 0, FX.dpr, 0, 0);
    ctx.clearRect(0, 0, FX.W, FX.H);
    ctx.filter = 'none'; ctx.globalAlpha = 1;
    drawShadows(ctx, dt);
    drawElyaFar(ctx, dt);
    drawCreature(ctx, dt); ctx.filter = 'none'; ctx.globalAlpha = 1;
    drawFigures(ctx, dt);
    drawMotes(ctx, dt);
    drawGuides(ctx, dt);
    drawGlints(ctx);
    drawPalm(ctx, dt);
    drawBursts(ctx, dt);
    drawCracks(ctx, dt);
    drawLeaves(ctx, dt);
    drawEyelids(ctx);
  };

  ELY.FX = FX;
})();
