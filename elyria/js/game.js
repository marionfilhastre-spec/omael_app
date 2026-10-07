/* ELYRIA — Prototype 0.1 · le parcours
   Réveil → rive → Elya → ombres → maison → photographie → Écho 001 → retour → carton de fin.
   Le déroulé suit la section 03 du dossier de production, minute par minute. */
(function () {
  const R = ELY.R, FX = ELY.FX, UI = ELY.UI, WS = ELY.WS, A = ELY.Audio;
  const $ = (s) => document.querySelector(s);
  const ABORT = { abort: true };
  const SAVE_KEY = 'elyria.proto01.save', SET_KEY = 'elyria.proto01.settings';
  const touch = matchMedia('(pointer: coarse)').matches;

  const G = {
    token: 0, paused: false, timers: [], tweens: [], pending: new Set(), skipReq: false,
    mode: 'title', explore: null, holding: false, holdTarget: null, pressWaiter: null,
    keys: {}, pointer: { x: -1, y: -1, mouse: false }, revealT: 0,
    carnet: { souvenirs: [], questions: [] },
    settings: { subs: 'm', calm: false, tap: false, leaf: true, vol: 0.8 }
  };

  /* ——————— Temps, attentes et annulation ——————— */
  function guard(exec) {
    const tok = G.token;
    return new Promise((res, rej) => {
      const entry = { rej };
      G.pending.add(entry);
      exec((v) => { if (!G.pending.has(entry)) return; G.pending.delete(entry); if (tok === G.token) res(v); });
    });
  }
  const wait = (ms) => guard((res) => G.timers.push({ left: ms, res }));
  const waitSkip = (ms) => guard((res) => { G.skipReq = false; G.timers.push({ left: ms, res, skip: true }); });
  function tween(obj, key, to, ms, ease) {
    return guard((res) => G.tweens.push({ obj, key, from: obj[key], to, t: 0, d: Math.max(1, ms), ease: ease || 'inout', res }));
  }
  const EASE = { lin: (k) => k, inout: (k) => k * k * (3 - 2 * k), out: (k) => 1 - (1 - k) * (1 - k), in: (k) => k * k };

  function abortAll() {
    G.token++;
    G.pending.forEach((e) => e.rej(ABORT)); G.pending.clear();
    G.timers = []; G.tweens = []; G.explore = null; G.holdTarget = null; G.pressWaiter = null;
    UI.hideLine(); UI.hideChoices(); UI.clearPrompts(); UI.portrait(null, false); UI.bars(false);
    UI.echoFrame(false); UI.resonance(0, false); UI.closeInspect(); $('#photo').hidden = true;
    FX.showShadows(false); FX.showElyaFar(null, false); FX.showPalm(null, false); FX.showFigures(null, false);
    FX.stopCracks(); FX.guide(null, false); FX.setGlints([]); FX.setEyelids(null); FX.creature = null;
    Object.assign(R.p, { mix: 0, blur: 0, flash: 0, warm: 0, cold: 0, expo: 1 });
    R.cam.drift = 1;
  }

  function tick(dt) {
    const ms = dt * 1000 * (G.speed || 1);
    for (let i = G.timers.length - 1; i >= 0; i--) {
      const t = G.timers[i]; t.left -= ms;
      if (t.left <= 0 || (t.skip && G.skipReq)) { G.timers.splice(i, 1); t.res(); }
    }
    for (let i = G.tweens.length - 1; i >= 0; i--) {
      const t = G.tweens[i]; t.t += ms; const k = Math.min(1, t.t / t.d);
      t.obj[t.key] = t.from + (t.to - t.from) * EASE[t.ease](k);
      if (k >= 1) { G.tweens.splice(i, 1); t.res(); }
    }
    G.skipReq = false;
  }

  /* ——————— Briques narratives ——————— */
  async function say(who, text, opts) {
    opts = opts || {};
    if (opts.face) UI.portrait(opts.face);
    UI.showLine(who, text, opts.kind || '');
    await wait(250);
    await waitSkip(opts.ms || UI.readTime(text));
    UI.hideLine();
    await wait(opts.gap === undefined ? 320 : opts.gap);
  }

  function choose(opts) {
    return guard((res) => UI.showChoices(opts, (i) => { UI.hideChoices(); A.sfx('interact'); res(i); }));
  }

  function waitPress(label) {
    UI.sub.className = 'show whisper';
    UI.subWho.textContent = '';
    UI.subLine.innerHTML = '';
    const k = document.createElement('kbd'); k.textContent = touch ? 'Toucher' : 'Espace';
    UI.subLine.append(k, ' ' + label);
    return guard((res) => { G.pressWaiter = () => { G.pressWaiter = null; UI.hideLine(); res(); }; });
  }

  function waitClose(sel) { return guard((res) => { G.closeWaiter = () => { G.closeWaiter = null; res(); }; }); }

  async function inspect(o) {
    A.sfx('interact');
    UI.inspect(o);
    await wait(400);
    await waitClose();
    UI.closeInspect();
  }

  async function shot(id, opts, fadeMs) {
    fadeMs = fadeMs === undefined ? 900 : fadeMs;
    UI.fade(1, fadeMs); await wait(fadeMs);
    await Promise.all([R.load(ELY.SHOTS[id].img), ELY.SHOTS[id].imgB ? R.load(ELY.SHOTS[id].imgB) : null]);
    R.setShot(id, opts);
    UI.fade(0, fadeMs * 1.3);
    await wait(fadeMs * 0.6);
  }

  function retained(fx) {
    if (!(fx || []).some(([, k]) => k.startsWith('Rel.') || k.startsWith('Elya.'))) return;
    if (G.settings.leaf) { FX.leaf(); A.sfx('leaf'); }
  }

  function addSouvenir(id, strip) {
    if (!G.carnet.souvenirs.includes(id)) G.carnet.souvenirs.push(id);
    if (strip) { UI.carnetStrip(strip); A.sfx('carnet'); }
  }
  function addQuestion(id) { if (!G.carnet.questions.includes(id)) G.carnet.questions.push(id); }

  /* ——————— Exploration ——————— */
  function explore(cfg) {
    return guard((res) => {
      const ex = Object.assign({ spots: [], busy: false, t: 0 }, cfg);
      ex.done = (v) => { if (G.explore !== ex) return; G.explore = null; UI.clearPrompts(); FX.setGlints([]); res(v); };
      G.explore = ex;
    });
  }

  async function useSpot(s) {
    const ex = G.explore; if (!ex || ex.busy) return;
    ex.busy = true; UI.clearPrompts(); FX.setGlints([]);
    try { const r = await s.use(s); if (r !== undefined) ex.done(r); }
    catch (e) { if (e !== ABORT) console.error(e); }
    finally { ex.busy = false; }
  }

  function updateExplore(dt) {
    const ex = G.explore;
    // Caméra au clavier
    const vx = (G.keys.ArrowRight || G.keys.d ? 1 : 0) - (G.keys.ArrowLeft || G.keys.a || G.keys.q ? 1 : 0);
    const vy = (G.keys.ArrowDown ? 1 : 0) - (G.keys.ArrowUp ? 1 : 0);
    if (ex && !ex.busy && (vx || vy)) { const b = R.camBounds(); R.cam.tcx += vx * dt * 0.35 * b.fw; R.cam.tcy += vy * dt * 0.35 * b.fh; R.cam.ease = 4; }
    if (G.revealT > 0) G.revealT -= dt;
    if (!ex) return;
    ex.t += dt;
    if (ex.onTick) ex.onTick(dt, ex);
    if (!G.explore || ex.busy) return;
    const W = R.W, H = R.H, cx = W / 2, cy = H * 0.52, rad = Math.min(W, H) * 0.3, b = R.camBounds();
    let best = null, bestD = 1e9;
    const pts = ex.spots.filter((s) => !s.hidden).map((s) => {
      const p = R.toScreen(s.x, s.y);
      // Ce que la caméra ne peut pas rapprocher du centre ne compte pas dans la distance.
      const ux = Math.abs(s.x - Math.min(Math.max(s.x, b.x0), b.x1)) / b.fw * W;
      const uy = Math.abs(s.y - Math.min(Math.max(s.y, b.y0), b.y1)) / b.fh * H;
      let d = Math.hypot(Math.max(0, Math.abs(p.x - cx) - ux), Math.max(0, Math.abs(p.y - cy) - uy) * 1.3);
      if (s.memory) d *= 0.6; // ce qui touche à la mémoire attire le regard
      if (G.pointer.mouse && G.pointer.x >= 0) { const dm = Math.hypot(p.x - G.pointer.x, p.y - G.pointer.y); if (dm < 70) d = Math.min(d, dm * 0.5); }
      const onScreen = p.x > 20 && p.x < W - 20 && p.y > 40 && p.y < H - 40;
      if (onScreen && d < rad && d < bestD) { best = s; bestD = d; }
      return { s, p, d, onScreen };
    });
    // Tab : passer au point d'intérêt suivant parmi ceux à portée
    const near = pts.filter((o) => o.onScreen && o.d < rad * 1.8).sort((a, c) => a.p.x - c.p.x);
    if (G.cycle && near.length) {
      const i = near.findIndex((o) => o.s === (ex.pick || best));
      ex.pick = near[(i + 1) % near.length].s; ex.pickT = 4; G.cycle = false;
    }
    G.cycle = false;
    if (ex.pick) { ex.pickT -= dt; if (ex.pickT <= 0 || ex.pick.hidden || !near.some((o) => o.s === ex.pick)) ex.pick = null; else best = ex.pick; }
    ex.active = best;
    UI.renderPrompts(pts.filter((o) => o.onScreen).map((o) => ({
      id: o.s.id, x: o.p.x, y: o.p.y, verb: o.s.verb, name: o.s.name, memory: o.s.memory || ex.memory,
      show: o.s === best, onClick: () => useSpot(o.s)
    })));
    FX.setGlints(pts.filter((o) => o.onScreen && (o.s !== best)).map((o) => {
      let a = o.s.glint || 0;
      if (o.d < rad * 1.6) a = Math.max(a, 0.35 * (1 - o.d / (rad * 1.6)));
      if (G.revealT > 0) a = Math.max(a, Math.min(1, G.revealT));
      return { x: o.s.x, y: o.s.y, a, gold: !!(o.s.memory || ex.memory), big: !!o.s.memory };
    }));
  }

  /* Résonance libre : une onde révèle les traces proches. */
  function resonate() {
    if (!G.explore || G.explore.busy) return;
    G.revealT = 3; FX.wave(R.W / 2, R.H / 2, !!G.explore.memory); A.sfx('resonance');
  }

  /* ——————— Sauvegarde par checkpoint (jamais dans un Écho) ——————— */
  function save(cp) {
    G.checkpoint = cp;
    const data = { cp, ws: WS.snapshot(), carnet: G.carnet, t: Date.now() };
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); UI.saved(); } catch (e) { /* stockage indisponible */ }
    G.lastSave = data;
  }
  function loadSave() { try { return JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (e) { return null; } }
  function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* rien */ } }

  /* ——————————————————— LE PARCOURS ——————————————————— */

  /* 0:00 — Écran noir. Son de l'eau, respiration. « Tu m'entends ? Ouvre les yeux. » */
  async function seqWake() {
    await R.load('rive');
    R.setShot('rive', { cx: 0.42, cy: 0.97, zoom: 1.75 });
    R.p.blur = 0.01; R.cam.drift = 0.4;
    FX.setEyelids(0); FX.setMotes('present', 0);
    UI.fade(0, 10);
    A.setLayer('eau', 3);
    await wait(1800);
    A.sfx('breath');
    await wait(1600);
    await say('', 'Tu m\'entends ?', { kind: 'whisper', ms: 2600 });
    await wait(700);
    await say('', 'Ouvre les yeux.', { kind: 'whisper', ms: 2400 });
    await waitPress('Ouvrir les yeux');
    A.sfx('breath');
    // Premier geste, déjà un choix minuscule.
    await tween(FX, 'eyelids', 0.28, 900);
    await tween(FX, 'eyelids', 0.06, 450);
    await wait(400);
    tween(R.p, 'blur', 0.004, 2600);
    await tween(FX, 'eyelids', 0.7, 1600);
    await wait(500);
    tween(R.p, 'blur', 0, 2400);
    await tween(FX, 'eyelids', 1, 1400);
    FX.setEyelids(null);
    A.setLayer('lac', 6);
    FX.setMotes('present', 0.8);

    /* 0:30 — Caméra basse au ras de l'eau. Les deux lunes. La créature céleste traverse le ciel. Pas d'interface. */
    await wait(1200);
    R.lookAt(0.6, 0.28, 1.12, 0.32);
    await wait(2600);
    FX.startCreature({ x: 1.02, y: 0.12, s: 1 }, { x: 0.18, y: 0.2 }, 15);
    A.sfx('creature');
    await wait(9500);

    /* 1:00 — La marque lumineuse apparaît dans la paume puis s'efface. */
    await shot('main', { zoom: 1.05 }, 800);
    R.lookAt(0.52, 0.55, 1.15, 0.25);
    await wait(500);
    FX.showPalm({ x: 0.5, y: 0.6 });
    A.sfx('resonance');
    await wait(6200);
    FX.showPalm(null, false);

    /* 1:15 — Le joueur prend le contrôle. */
    await shot('rive', { cx: 0.3, cy: 0.52, zoom: 1 }, 800);
    R.cam.drift = 1;
  }

  /* 1:15 — Déplacement libre sur la rive. Petites découvertes sans enjeu. Une silhouette au loin. */
  async function seqRive() {
    WS.set('Fact.Prologue.Woke', 1, 'réveil');
    addSouvenir('lac');
    FX.showElyaFar(ELY.ELYA_FAR);
    let since = 0, found = 0, hinted = false;
    const spots = ELY.RIVE_SPOTS.map((s) => Object.assign({}, s, {
      use: async (sp) => {
        await inspect(sp);
        if (!WS.get('Fact.Lac.Seen.' + sp.id)) { found++; since = 0; }
        WS.set('Fact.Lac.Seen.' + sp.id, 1, 'rive');
        sp.hidden = true;
      }
    }));
    spots.push({ id: 'elya', x: ELY.ELYA_FAR.x, y: ELY.ELYA_FAR.y - 0.07, verb: 'Approcher', name: 'Silhouette',
      use: async () => { WS.set('Fact.Rencontre.AllaVersElle', 1, 'rive'); return 'vers-elle'; } });

    const how = await explore({
      spots,
      onTick: (dt, ex) => {
        since += dt;
        if (!hinted && ex.t > 1.2) {
          hinted = true;
          const hint = touch ? 'Glisser pour regarder · toucher pour interagir' : '← → ou glisser pour regarder · E interagir · Tab suivant · R résonner';
          UI.showLine('', hint, 'thought');
          setTimeout(() => { if (UI.subLine.textContent === hint) UI.hideLine(); }, 5200);
        }
        // Elya vient vers lui s'il s'attarde : après trois découvertes, ou si le temps passe.
        if (!ex.busy && ((found >= 3 && since > 8) || ex.t > 110)) ex.done('elle-vient');
      }
    });
    UI.hideLine();
    return how;
  }

  /* 3:00 — Elya : « Tu es revenu. » Dialogue à questions. */
  async function seqMeeting() {
    if (R.shotId !== 'rive') { await R.load('rive'); R.setShot('rive', { cx: 0.3, cy: 0.52 }); UI.fade(0, 900); }
    FX.showElyaFar(ELY.ELYA_FAR);
    const vers = WS.get('Fact.Rencontre.AllaVersElle');
    if (!vers) { A.sfx('steps'); await say('', 'Des pas, dans l\'herbe.', { kind: 'thought', ph: true }); }
    R.lookAt(ELY.ELYA_FAR.x, 0.6, 1.25, 1.2);
    await wait(900);
    FX.showElyaFar(null, false);
    UI.bars(true);
    tween(R.p, 'blur', 0.0045, 900);
    tween(R.p, 'expo', 0.82, 900);
    await wait(500);
    WS.event('Event.Dialogue.Start.Elya');
    const D = ELY.DLG_FIRST;
    const play = async (node) => { for (const l of node.lines) await say(l.s, l.t, { face: l.face }); };
    await play(D.nodes[D.start]);
    for (;;) {
      const opts = D.hub.filter((o) => WS.test(o.cond)).map((o) => Object.assign({}, o, { asked: o.asked ? WS.get(o.asked) > 0 : false }));
      const o = opts[await choose(opts)];
      WS.apply(o.fx, 'DA_Elya_FirstMeeting'); retained(o.fx);
      if (o.type !== 'exit') WS.add('Fact.Dlg.Elya.HubVisits', 1, 'DA_Elya_FirstMeeting');
      const node = D.nodes[o.next];
      await play(node);
      if (node.end) break;
    }
    UI.portrait(null, false);
    tween(R.p, 'blur', 0, 900); tween(R.p, 'expo', 1, 900);
    UI.bars(false);
    await wait(600);
  }

  /* 5:30 — La caméra descend vers le sol. Elya a deux ombres, une par lune. Lui n'en a aucune. */
  async function seqShadows() {
    UI.bars(true);
    await shot('ombres', { cx: 0.24, cy: 0.66, zoom: 1.6 }, 900);
    R.lookAt(0.27, 0.86, 2.3, 0.45);
    FX.showShadows(true);
    await wait(3600);
    WS.set('Fact.Prologue.SansOmbre', 1, 'ombres');
    addSouvenir('ombre', 'Je n\'ai pas d\'ombre.');
    addQuestion('ombre');
    await wait(4400);
    FX.showShadows(false);
  }

  /* 6:00 — Elya montre la maison sur l'autre rive. Choix : lui demander de venir, ou y aller seul. */
  async function seqToHouse() {
    await shot('monde', { cx: 0.4, cy: 0.5, zoom: 1.05 }, 900);
    R.lookAt(0.86, 0.6, 1.3, 0.35);
    await wait(1800);
    await say('Elya', 'Là-bas, sur l\'autre rive.', { ph: true });
    await say('Elya', 'Les lieux se souviennent. Il suffit d\'écouter.');
    const opts = [
      { t: 'Viens avec moi.', type: 'position', fx: [['Set', 'Fact.Elya.Accompanied', 1], ['Add', 'Rel.Elya.Confiance', 1]] },
      { t: 'J\'irai seul.', type: 'position', fx: [['Set', 'Fact.Elya.Accompanied', 0], ['Add', 'Rel.Elya.Respect', 1]] }
    ];
    const i = await choose(opts);
    WS.apply(opts[i].fx, 'DA_Elya_Maison'); retained(opts[i].fx);
    if (i === 0) await say('Elya', 'Jusqu\'à la porte, alors.', { ph: true });
    else await say('Elya', 'Alors je t\'attendrai ici.', { ph: true });
    UI.bars(false);
    R.lookAt(0.62, 0.55, 1.05, 0.8);
    // Des lucioles de mémoire guident vers la maison.
    FX.guide({ x: 0.9, y: 0.62 });
    await explore({ spots: [{ id: 'maison', x: 0.905, y: 0.6, verb: 'Aller', name: 'La maison', memory: true, use: async () => 'go' }] });
    FX.guide(null, false);
  }

  /* 7:30 — La maison abandonnée. Exploration lente. La photographie est retournée sur le manteau de la cheminée. */
  async function seqHouse() {
    save('maison');
    await shot('maisonExt', { cx: 0.45, cy: 0.5, zoom: 1 }, 1000);
    A.setLayer('lac', 2);
    FX.setMotes('present', 0.7);
    addSouvenir('maison', 'Une maison sur l\'autre rive.');
    if (WS.get('Fact.Elya.Accompanied')) { await wait(1500); await say('Elya', 'Je reste là. Prends ton temps.', { ph: true }); }
    // Premiers indices : la maison frémit une seconde.
    setTimeout(() => { if (R.shotId === 'maisonExt') { R.p.mix = 0; tween(R.p, 'mix', 0.14, 1400).then(() => tween(R.p, 'mix', 0, 2200)).catch(() => {}); } }, 4200);
    await explore({ spots: [{ id: 'porte', x: 0.775, y: 0.62, verb: 'Entrer', name: 'La maison', use: async () => 'in' }] });
    R.p.mix = 0;

    await shot('interieur', { cx: 0.5, cy: 0.5, zoom: 1 }, 1000);
    A.setLayer('interieur', 2);
    FX.setMotes('present', 0.45);
    let seen = 0;
    const spots = ELY.MAISON_SPOTS.map((s) => Object.assign({}, s, {
      use: async (sp) => {
        await inspect(sp);
        if (!WS.get('Fact.Maison.Objet.' + sp.id)) seen++;
        WS.set('Fact.Maison.Objet.' + sp.id, 1, 'maison');
        sp.hidden = true;
        if (seen >= 3) FX.guide({ x: ELY.PHOTO_SPOT.x, y: ELY.PHOTO_SPOT.y });
      }
    }));
    spots.push(Object.assign({}, ELY.PHOTO_SPOT, { use: async () => 'photo' }));
    await explore({ spots });
    FX.guide(null, false);
  }

  /* 10:00 — Inspection de la photo. On la retourne : « Pour quand tu auras oublié. » Maintenir pour résonner. */
  async function seqPhoto() {
    const el = $('#photo'), card = el.querySelector('.photo-card'), hint = el.querySelector('.photo-hint');
    const key = touch ? 'Toucher' : 'E';
    card.classList.add('recto'); card.classList.remove('glow');
    el.hidden = false; A.sfx('interact');
    WS.set('Fact.Photo.Found', 1, 'BP_EchoPhoto');
    hint.innerHTML = ''; await wait(1400);
    hint.innerHTML = '<kbd>' + key + '</kbd> Retourner';
    await guard((res) => { G.pressWaiter = () => { G.pressWaiter = null; res(); }; });
    hint.innerHTML = '';
    card.classList.remove('recto');
    A.sfx('carnet');
    WS.set('Fact.Photo.Flipped', 1, 'BP_EchoPhoto');
    await wait(3200);
    card.classList.add('glow');
    FX.setMotes('echo', 0.35);
    A.sfx('glint');
    hint.innerHTML = G.settings.tap ? '<kbd>' + key + '</kbd> Résonner' : (touch ? 'Maintenir le doigt · Résonner' : 'Maintenir <kbd>E</kbd> Résonner');
    await holdResonance();
    hint.innerHTML = '';
  }

  /* Maintien d'environ 1,5 s. On peut lâcher : rien n'est forcé. */
  function holdResonance() {
    return guard((res) => {
      G.holdTarget = { k: 0, auto: false, done: () => { G.holdTarget = null; UI.resonance(1, false); res(); } };
    });
  }
  function updateHold(dt) {
    const h = G.holdTarget; if (!h) return;
    const on = G.holding || h.auto;
    h.k += on ? dt / 1.5 : -dt / 0.8;
    h.k = Math.max(0, Math.min(1, h.k));
    UI.resonance(h.k, h.k > 0.001);
    A.setMemory(h.k * 0.4, 0.2);
    if (h.k >= 1) h.done();
  }

  /* 10:45 — Écho. Flash. La maison redevient habitée et dorée autour du joueur. Trois fragments. */
  async function seqEcho() {
    A.sfx('flash');
    const calm = G.settings.calm;
    UI.fade(1, calm ? 900 : 450, true);
    await wait(calm ? 900 : 500);
    $('#photo').hidden = true;
    WS.set('Fact.Echo.001.Entered', 1, 'BP_EchoManager');
    R.p.mix = 0.18; R.p.warm = 0.12;
    A.setMemory(1, 1.5);
    FX.setMotes('echo', 1);
    UI.fade(0, 2000, true);
    await wait(600);
    // Superposition, puis transformation : matières, lumière, son.
    await tween(R.p, 'mix', 0.55, 1800);
    await tween(R.p, 'mix', 1, 2600);
    UI.echoFrame(true); UI.echoDots(0);
    FX.showFigures(ELY.ECHO_FIGURES);
    A.sfx('lullaby');
    await wait(800);
    await say('', 'La même pièce. Vivante.', { kind: 'thought', ph: true });

    let n = 0;
    const spots = ELY.FRAGMENTS.map((f) => ({
      id: f.id, x: f.x, y: f.y, verb: 'Écouter', name: 'Fragment', memory: true, glint: 0.35,
      use: async (sp) => {
        const p = R.toScreen(sp.x, sp.y), to = UI.echoDotPos(n);
        FX.burst(p.x, p.y, to.x, to.y, true); A.sfx('fragment');
        sp.hidden = true;
        await wait(900);
        n++; UI.echoDots(n);
        WS.set('Fact.Echo.001.Fragments', n, 'BP_EchoFragment');
        await say(f.who, f.line, { kind: 'memory' });
        if (n >= 3) return 'climax';
      }
    }));
    let lull = 0;
    await explore({ spots, memory: true, onTick: (dt) => { lull += dt; if (lull > 16) { lull = 0; A.sfx('lullaby'); } } });

    /* Climax : caméra reprise brièvement. L'enfant demande s'il reviendra demain. Il promet. */
    UI.bars(true);
    const fg = ELY.ECHO_FIGURES;
    R.lookAt((fg.woman.x + fg.child.x) / 2, 0.6, 1.3, 0.8);
    FX.figures && (FX.figures.frozen = false);
    await wait(1500);
    await say('Une enfant', 'Tu reviendras demain ?', { kind: 'memory', ms: 3000 });
    await wait(500);
    await say('', '— Je te le promets.', { kind: 'memory', ms: 2600 });
    WS.set('Fact.Echo.001.Promise', 1, 'LS_Echo001_Promise');
    await wait(900);

    /* 13:00 — Le souvenir s'effondre. Retour dans la maison froide, photo en main. */
    A.sfx('collapse');
    FX.startCracks();
    await wait(1600);
    FX.fadeFigures(0);
    UI.fade(1, calm ? 800 : 300, false);
    await wait(calm ? 800 : 350);
    FX.stopCracks(); FX.setMotes('present', 0.35);
    R.p.mix = 0; R.p.warm = 0; R.p.cold = 0.25;
    A.setMemory(0, 0.6);
    UI.echoFrame(false);
    R.lookAt(0.55, 0.5, 1, 0.6);
    WS.set('Fact.Echo.001.Seen', 1, 'BP_EchoManager');
    WS.event('Event.Echo.001.Exit');
    UI.bars(false);
    UI.fade(0, 1800);
    await wait(1600);
    tween(R.p, 'cold', 0, 4000);
  }

  /* Elya l'attend : elle sait qu'il a vu quelque chose. Vérité, mensonge, ou question. */
  async function seqReturn() {
    if (R.shotId !== 'interieur') { await R.load('interieur'); await R.load('interieurEcho'); R.setShot('interieur', { cx: 0.55, cy: 0.5 }); UI.fade(0, 1200); A.setLayer('interieur', 1); }
    save('apres');
    await wait(800);
    A.sfx('steps');
    await wait(1400);
    UI.bars(true);
    tween(R.p, 'blur', 0.004, 900); tween(R.p, 'expo', 0.8, 900);
    WS.event('Event.Dialogue.Start.Elya.Retour');
    if (WS.get('Fact.Elya.CameAnyway')) await say('Elya', 'Je n\'ai pas pu m\'empêcher de venir.', { face: 'inquietude', ph: true });
    await say('Elya', 'Tu es resté longtemps à l\'intérieur.', { face: 'calme' });
    const opts = ELY.DLG_RETOUR.filter((o) => WS.test(o.cond));
    const o = opts[await choose(opts)];
    WS.apply(o.fx, 'DA_Elya_Return'); retained(o.fx);
    for (const l of o.reply) await say(l.s, l.t, { face: l.face });
    const bond = WS.bond();
    WS.set('Fact.Elya.Bond.' + bond, 1, 'Elya.Bond');
    const last = { Warm: ['Viens. Le lac nous attend.', 'douceur'], Guarded: ['Repose-toi. Nous parlerons demain.', 'determination'], Distant: ['Il se fait tard.', 'tristesse'] }[bond];
    await say('Elya', last[0], { face: last[1], ph: true });
    UI.portrait(null, false);
    tween(R.p, 'blur', 0, 900); tween(R.p, 'expo', 1, 900);
    UI.bars(false);

    /* 14:30 — Dernière réplique, carton de fin. Le Carnet montre « Une Promesse » et trois questions ouvertes. */
    addSouvenir('promesse', '« Tu reviendras demain ? » J\'ai promis. Je ne sais pas à qui.');
    addQuestion(WS.get('Fact.Dlg.Elya.AskedIfKnown') ? 'pasEncore' : 'revenu');
    addQuestion('promesse');
    await wait(4600);
    await shot('maisonExt', { cx: 0.55, cy: 0.5, zoom: 1.08 }, 1200);
    A.setLayer('lac', 2);
    R.lookAt(0.66, 0.5, 1.15, 0.2);
    FX.setMotes('present', 0.8);
    await wait(1500);
    // La maison se souvient : un reste de lumière dorée aux fenêtres.
    await tween(R.p, 'mix', 0.12, 2600);
    await tween(R.p, 'mix', 0, 3200);
    await wait(800);
    UI.fade(1, 2200);
    await wait(2400);
    save('fin');
  }

  function seqEnd() {
    G.mode = 'end';
    $('#menu-btn').hidden = true;
    const box = $('#end .end-carnet'), e = ELY.CARNET.souvenirs.promesse;
    box.innerHTML = '';
    const img = document.createElement('img'); img.src = e.img; img.alt = '';
    const q = document.createElement('p'); q.className = 'quote'; q.textContent = e.hand;
    const t = document.createElement('p'); t.textContent = e.text;
    const h = document.createElement('h3'); h.textContent = 'Questions ouvertes · ' + G.carnet.questions.length;
    const ul = document.createElement('ul');
    G.carnet.questions.forEach((id) => { const li = document.createElement('li'); li.textContent = ELY.CARNET.questions[id]; ul.appendChild(li); });
    box.append(img, q, t, h, ul);
    $('#end').hidden = false;
    UI.fade(0, 1500);
    A.setLayer('silence', 4);
  }

  /* ——————— Déroulé complet et reprise aux checkpoints ——————— */
  async function run(from) {
    G.mode = 'game';
    $('#title').hidden = true; $('#end').hidden = true; $('#menu-btn').hidden = false;
    try {
      if (from === 'reveil') {
        save('reveil');
        await seqWake();
        await seqRive();
        from = 'rencontre';
        save('rencontre');
      }
      if (from === 'rencontre') {
        await seqMeeting();
        await seqShadows();
        await seqToHouse();
        from = 'maison';
      }
      if (from === 'maison') { await seqHouse(); await seqPhoto(); await seqEcho(); from = 'apres'; }
      if (from === 'apres') { await seqReturn(); from = 'fin'; }
      if (from === 'fin') seqEnd();
    } catch (e) { if (e !== ABORT) console.error(e); }
  }

  function startNew() {
    A.init(); A.setVolume(G.settings.vol);
    abortAll(); clearSave();
    WS.reset(); G.carnet = { souvenirs: [], questions: [] };
    UI.fade(1, 600);
    setTimeout(() => run('reveil'), 650);
  }

  function continueGame() {
    const s = loadSave(); if (!s) return startNew();
    A.init(); A.setVolume(G.settings.vol);
    abortAll();
    WS.restore(s.ws); G.carnet = s.carnet || { souvenirs: [], questions: [] };
    UI.fade(1, 600);
    const cp = s.cp === 'reveil' ? 'reveil' : s.cp;
    setTimeout(async () => {
      if (cp === 'rencontre') { await R.load('rive'); R.setShot('rive', { cx: 0.3, cy: 0.52 }); A.setLayer('lac', 2); FX.setMotes('present', 0.8); }
      if (cp === 'apres') { await R.load('interieur'); await R.load('interieurEcho'); R.setShot('interieur', { cx: 0.55, cy: 0.5 }); A.setLayer('interieur', 2); }
      UI.fade(0, 1200);
      run(cp);
    }, 650);
  }

  async function toTitle() {
    abortAll();
    closeOverlays();
    G.mode = 'title'; G.paused = false;
    $('#end').hidden = true; $('#menu-btn').hidden = true;
    await R.load('monde');
    R.setShot('monde', { cx: 0.5, cy: 0.45, zoom: 1.04 });
    R.lookAt(0.6, 0.45, 1.1, 0.05);
    FX.setMotes('present', 0.9);
    A.setLayer('lac', 2);
    $('#btn-continue').hidden = !(loadSave() && loadSave().cp !== 'fin');
    $('#title').hidden = false;
    UI.fade(0, 1600);
  }

  /* ——————— Menus ——————— */
  function closeOverlays() { ['#pause', '#settings', '#carnet'].forEach((s) => ($(s).hidden = true)); }
  function pause(on) {
    if (G.mode !== 'game') return;
    G.paused = on;
    if (on) { $('#pause').hidden = false; if (A.ctx) A.ctx.suspend(); }
    else { closeOverlays(); if (A.ctx) A.ctx.resume(); }
  }
  function openCarnet(tab, sel) {
    if (G.mode !== 'game') return;
    G.paused = true; $('#pause').hidden = true;
    UI.openCarnet(G.carnet, tab, sel);
    G.carnetTab = tab || 'souvenirs';
  }
  function openSettings() {
    $('#opt-subs').value = G.settings.subs; $('#opt-calm').checked = G.settings.calm; $('#opt-tap').checked = G.settings.tap;
    $('#opt-leaf').checked = G.settings.leaf; $('#opt-vol').value = G.settings.vol;
    $('#settings').hidden = false;
  }
  function applySettings() {
    document.documentElement.dataset.subs = G.settings.subs;
    FX.calm = G.settings.calm;
    R.p.grain = G.settings.calm ? 0.02 : 0.045;
    A.setVolume(G.settings.vol);
    try { localStorage.setItem(SET_KEY, JSON.stringify(G.settings)); } catch (e) { /* rien */ }
  }

  /* ——————— Entrées ——————— */
  function anyOverlayOpen() { return !$('#pause').hidden || !$('#settings').hidden || !$('#carnet').hidden; }

  function primaryAction() {
    if (!$('#inspect').hidden && G.closeWaiter) { G.closeWaiter(); return; }
    if (G.pressWaiter) { G.pressWaiter(); return; }
    if (G.holdTarget && G.settings.tap) { G.holdTarget.auto = true; return; }
    if (G.explore && !G.explore.busy && G.explore.active) { useSpot(G.explore.active); return; }
    G.skipReq = true;
  }

  function bindInput() {
    window.addEventListener('keydown', (e) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (e.target.closest && e.target.closest('select, input')) return;
      if (k === 'f') { UI.toggleFacts(); e.preventDefault(); return; }
      if (k === 'Escape' || k === 'p') {
        if (!$('#settings').hidden) { $('#settings').hidden = true; if (G.mode === 'game') $('#pause').hidden = false; }
        else if (!$('#carnet').hidden) { closeOverlays(); G.paused = false; }
        else if (!$('#facts').hidden) UI.toggleFacts(false);
        else if (G.mode === 'game') pause(!G.paused);
        e.preventDefault(); return;
      }
      if (anyOverlayOpen()) return;
      if (G.mode === 'title') { if ((k === 'Enter' || k === ' ') && !e.target.closest('button')) { e.preventDefault(); startNew(); } return; }
      if (G.mode !== 'game' || G.paused) return;
      if (k === 'c' || k === 'j') { openCarnet(); e.preventDefault(); return; }
      if (UI.choiceKey(k)) { e.preventDefault(); return; }
      if (k === 'r') { resonate(); return; }
      if (k === 'Tab') { e.preventDefault(); G.cycle = true; return; }
      if (k === 'e' || k === ' ' || k === 'Enter') {
        e.preventDefault();
        if (e.repeat) return;
        G.holding = true;
        primaryAction();
        return;
      }
      G.keys[k] = true;
    });
    window.addEventListener('keyup', (e) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (k === 'e' || k === ' ' || k === 'Enter') G.holding = false;
      G.keys[k] = false;
    });
    window.addEventListener('blur', () => { G.keys = {}; G.holding = false; });

    const app = $('#app');
    let down = null, lastTap = 0;
    const ignore = (t) => t.closest && t.closest('button, select, input, label, .screen, #facts, #choices');
    app.addEventListener('pointerdown', (e) => {
      if (ignore(e.target)) return;
      A.init();
      down = { x: e.clientX, y: e.clientY, cx: R.cam.tcx, cy: R.cam.tcy, moved: false, id: e.pointerId };
      if (G.holdTarget) G.holding = true;
    });
    app.addEventListener('pointermove', (e) => {
      G.pointer = { x: e.clientX, y: e.clientY, mouse: e.pointerType === 'mouse' };
      if (!down || down.id !== e.pointerId) return;
      const dx = e.clientX - down.x, dy = e.clientY - down.y;
      if (Math.hypot(dx, dy) > 8) down.moved = true;
      if (down.moved && G.explore && !G.explore.busy && G.mode === 'game' && !G.paused) {
        const b = R.camBounds();
        R.cam.tcx = down.cx - dx / R.W * b.fw; R.cam.tcy = down.cy - dy / R.H * b.fh; R.cam.ease = 6;
      }
    });
    const up = (e) => {
      if (!down || down.id !== e.pointerId) return;
      const d = down; down = null; G.holding = false;
      if (d.moved || G.mode !== 'game' || G.paused) return;
      if (G.holdTarget && !G.settings.tap) return;
      // Toucher directement un point d'intérêt
      if (G.explore && !G.explore.busy) {
        const near = G.explore.spots.filter((s) => !s.hidden).map((s) => ({ s, p: R.toScreen(s.x, s.y) }))
          .map((o) => ({ s: o.s, d: Math.hypot(o.p.x - e.clientX, o.p.y - e.clientY) })).sort((a, b) => a.d - b.d)[0];
        if (near && near.d < 64) { useSpot(near.s); return; }
        const now = performance.now();
        if (now - lastTap < 320) { resonate(); lastTap = 0; return; }
        lastTap = now;
        if (G.explore.active && touch) return;
      }
      primaryAction();
    };
    app.addEventListener('pointerup', up);
    app.addEventListener('pointercancel', (e) => { if (down && down.id === e.pointerId) down = null; G.holding = false; });
    app.addEventListener('pointerleave', () => { G.pointer.x = -1; });

    // Écrans et menus
    $('#btn-start').addEventListener('click', startNew);
    $('#btn-continue').addEventListener('click', continueGame);
    $('#btn-settings').addEventListener('click', openSettings);
    $('#btn-replay').addEventListener('click', () => { $('#end').hidden = true; startNew(); });
    $('#btn-end-facts').addEventListener('click', () => UI.toggleFacts(true));
    $('#menu-btn').addEventListener('click', () => pause(true));
    $('#pause').addEventListener('click', (e) => {
      const act = e.target.closest('[data-act]'); if (!act) return;
      const a = act.dataset.act;
      if (a === 'resume') pause(false);
      if (a === 'carnet') openCarnet();
      if (a === 'settings') { $('#pause').hidden = true; openSettings(); }
      if (a === 'facts') UI.toggleFacts(true);
      if (a === 'title') { if (A.ctx) A.ctx.resume(); toTitle(); }
    });
    $('#settings').addEventListener('click', (e) => {
      if (e.target.closest('[data-act="close"]')) { $('#settings').hidden = true; if (G.mode === 'game') $('#pause').hidden = false; }
    });
    $('#opt-subs').addEventListener('change', (e) => { G.settings.subs = e.target.value; applySettings(); });
    $('#opt-calm').addEventListener('change', (e) => { G.settings.calm = e.target.checked; applySettings(); });
    $('#opt-tap').addEventListener('change', (e) => { G.settings.tap = e.target.checked; applySettings(); });
    $('#opt-leaf').addEventListener('change', (e) => { G.settings.leaf = e.target.checked; applySettings(); });
    $('#opt-vol').addEventListener('input', (e) => { G.settings.vol = +e.target.value; applySettings(); });
    $('#carnet .close').addEventListener('click', () => { closeOverlays(); G.paused = false; });
    $('#carnet .tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) UI.openCarnet(G.carnet, b.dataset.tab); });
    document.addEventListener('visibilitychange', () => { if (document.hidden && G.mode === 'game' && !G.paused) pause(true); });
  }

  /* ——————— Démarrage ——————— */
  function boot() {
    try { Object.assign(G.settings, JSON.parse(localStorage.getItem(SET_KEY) || '{}')); } catch (e) { /* rien */ }
    UI.init();
    R.init($('#scene'));
    FX.init($('#fx'));
    applySettings();
    WS.onChange(() => UI.renderFacts());
    bindInput();
    // Préchargement de toutes les images du parcours
    Object.keys(ELY.IMG).forEach((k) => R.load(k));
    Object.values(ELY.ELYA_FACES).forEach((s) => { const i = new Image(); i.src = s; });
    ELY.RIVE_SPOTS.concat(ELY.MAISON_SPOTS).forEach((s) => { const i = new Image(); i.src = s.img; });
    let last = performance.now();
    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!G.paused) { tick(dt); updateExplore(dt); updateHold(dt); }
      R.render(G.paused ? 0 : dt);
      FX.render(G.paused ? 0 : dt);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    toTitle();
  }

  ELY.G = G;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
