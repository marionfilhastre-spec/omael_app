/* Interface : rien à l'écran pendant l'exploration.
   Elle apparaît quand on en a besoin, puis disparaît. */
(function () {
  const $ = (s) => document.querySelector(s);
  const UI = {};

  UI.init = function () {
    UI.sub = $('#subtitle'); UI.subWho = UI.sub.querySelector('.who'); UI.subLine = UI.sub.querySelector('.line');
    UI.choicesEl = $('#choices'); UI.choicesEl.hidden = true;
    UI.promptsEl = $('#prompts'); UI.promptNodes = {};
    UI.portraitEl = $('#portrait'); UI.portraitImgs = UI.portraitEl.querySelectorAll('img'); UI.portraitFront = 0;
    UI.strip = $('#carnet-strip');
    UI.res = $('#resonance'); UI.resFill = UI.res.querySelector('.fill');
    UI.fadeEl = $('#fade');
  };

  /* ——— Sous-titres ——— */
  UI.showLine = function (who, text, kind) {
    UI.sub.className = kind || '';
    UI.subWho.textContent = who || '';
    UI.subLine.textContent = text;
    void UI.sub.offsetWidth; UI.sub.classList.add('show');
  };
  UI.hideLine = function () { UI.sub.classList.remove('show'); };
  UI.readTime = (t) => Math.max(2200, 1100 + t.length * 58);

  /* ——— Choix ——— */
  UI.showChoices = function (opts, onPick) {
    const ol = UI.choicesEl; ol.innerHTML = '';
    UI.choiceSel = opts.findIndex((o) => !o.asked);
    if (UI.choiceSel < 0) UI.choiceSel = 0;
    opts.forEach((o, i) => {
      const li = document.createElement('li'), b = document.createElement('button');
      b.type = 'button'; b.textContent = o.t;
      if (o.asked) b.classList.add('asked');
      if (o.type === 'silence') b.classList.add('silence');
      b.addEventListener('click', (e) => { e.stopPropagation(); onPick(i); });
      b.addEventListener('pointerenter', () => UI.selectChoice(i));
      li.appendChild(b); ol.appendChild(li);
    });
    ol.hidden = false; UI.choiceCount = opts.length; UI.onPick = onPick;
    UI.selectChoice(UI.choiceSel);
  };
  UI.selectChoice = function (i) {
    UI.choiceSel = (i + UI.choiceCount) % UI.choiceCount;
    UI.choicesEl.querySelectorAll('button').forEach((b, j) => b.classList.toggle('sel', j === UI.choiceSel));
  };
  UI.hideChoices = function () { UI.choicesEl.hidden = true; UI.choicesEl.innerHTML = ''; UI.onPick = null; };
  UI.choiceKey = function (key) {
    if (!UI.onPick) return false;
    if (key === 'ArrowUp' || key === 'w' || key === 'z') { UI.selectChoice(UI.choiceSel - 1); return true; }
    if (key === 'ArrowDown' || key === 's') { UI.selectChoice(UI.choiceSel + 1); return true; }
    if (key === 'Enter' || key === ' ' || key === 'e') { UI.onPick(UI.choiceSel); return true; }
    const n = parseInt(key, 10); if (n >= 1 && n <= UI.choiceCount) { UI.onPick(n - 1); return true; }
    return false;
  };

  /* ——— Invites d'interaction ancrées dans le monde ——— */
  UI.renderPrompts = function (list) {
    const seen = {};
    list.forEach((p) => {
      seen[p.id] = true;
      let el = UI.promptNodes[p.id];
      if (!el) {
        el = document.createElement('button'); el.type = 'button'; el.className = 'prompt' + (p.memory ? ' memory' : '');
        el.innerHTML = '<kbd>E</kbd><span class="verb"></span><span class="sep">·</span><span class="name"></span>';
        el.addEventListener('pointerdown', (e) => e.stopPropagation());
        el.addEventListener('click', (e) => { e.stopPropagation(); if (el.onclickHandler) el.onclickHandler(); });
        UI.promptsEl.appendChild(el); UI.promptNodes[p.id] = el;
      }
      el.querySelector('.verb').textContent = p.verb; el.querySelector('.name').textContent = p.name;
      const half = (el.offsetWidth || 160) / 2, vw = window.innerWidth;
      el.style.left = Math.min(Math.max(p.x, half + 8), vw - half - 8) + 'px'; el.style.top = Math.max(p.y - 18, 70) + 'px';
      el.classList.toggle('show', !!p.show);
      el.onclickHandler = p.onClick;
    });
    Object.keys(UI.promptNodes).forEach((id) => { if (!seen[id]) { UI.promptNodes[id].remove(); delete UI.promptNodes[id]; } });
  };
  UI.clearPrompts = function () { UI.renderPrompts([]); };

  /* ——— Plan rapproché d'Elya ——— */
  UI.portrait = function (face, on) {
    if (on === false) { UI.portraitEl.classList.remove('show'); return; }
    const src = ELY.ELYA_FACES[face] || ELY.ELYA_FACES.calme;
    const cur = UI.portraitImgs[UI.portraitFront];
    if (cur.getAttribute('src') !== src) {
      const next = UI.portraitImgs[1 - UI.portraitFront];
      next.src = src; next.style.opacity = 1; cur.style.opacity = 0; UI.portraitFront = 1 - UI.portraitFront;
    }
    UI.portraitEl.classList.add('show');
  };

  /* ——— Bandes cinéma, fondu, cadre d'Écho ——— */
  UI.bars = (on) => $('#bars').classList.toggle('on', on);
  UI.fade = function (opacity, ms, gold) {
    UI.fadeEl.style.transitionDuration = (ms === undefined ? 1200 : ms) + 'ms';
    UI.fadeEl.classList.toggle('gold', !!gold);
    UI.fadeEl.style.opacity = opacity;
  };
  UI.echoFrame = (on) => $('#echo-frame').classList.toggle('on', on);
  UI.echoDots = function (n) { document.querySelectorAll('#echo-frame .dots i').forEach((d, i) => d.classList.toggle('on', i < n)); };
  UI.echoDotPos = function (i) {
    const d = document.querySelectorAll('#echo-frame .dots i')[i]; if (!d) return { x: innerWidth / 2, y: 30 };
    const r = d.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };

  /* ——— Carnet : bande brève à chaque nouvelle entrée ——— */
  UI.carnetStrip = function (text, ms) {
    UI.strip.querySelector('span').textContent = text;
    UI.strip.classList.add('show');
    clearTimeout(UI.stripT); UI.stripT = setTimeout(() => UI.strip.classList.remove('show'), ms || 3800);
  };

  /* ——— Jauge de Résonance ——— */
  UI.resonance = function (k, show) {
    UI.res.classList.toggle('show', !!show);
    UI.resFill.style.strokeDashoffset = 326.7 * (1 - Math.max(0, Math.min(1, k)));
  };

  /* ——— Inspection ——— */
  UI.inspect = function (o) {
    const el = $('#inspect');
    el.querySelector('img').src = o.img; el.querySelector('img').alt = o.name;
    el.querySelector('.inspect-name').textContent = o.name;
    el.querySelector('.inspect-text').textContent = o.text;
    el.hidden = false;
  };
  UI.closeInspect = () => { $('#inspect').hidden = true; };

  /* ——— Sauvegarde ——— */
  UI.saved = function () { const s = $('#save-icon'); s.classList.remove('on'); void s.offsetWidth; s.classList.add('on'); setTimeout(() => s.classList.remove('on'), 2300); };

  /* ——— Carnet complet ——— */
  UI.openCarnet = function (state, tab, sel) {
    const el = $('#carnet'), list = el.querySelector('.entries'), page = el.querySelector('.book-page');
    tab = tab || 'souvenirs';
    el.querySelectorAll('.tabs button').forEach((b) => b.setAttribute('aria-selected', b.dataset.tab === tab ? 'true' : 'false'));
    list.innerHTML = ''; page.innerHTML = '';
    const items = [];
    if (tab === 'souvenirs') {
      ELY.CARNET.order.forEach((id) => items.push(state.souvenirs.includes(id) ? { id, label: ELY.CARNET.souvenirs[id].title } : { id, label: '???', unknown: true }));
      for (let i = 0; i < 2; i++) items.push({ id: 'x' + i, label: '???', unknown: true });
    } else {
      state.questions.forEach((q) => items.push({ id: q, label: ELY.CARNET.questions[q] }));
      if (!items.length) items.push({ id: 'none', label: 'Aucune question pour l\'instant.', unknown: true });
    }
    let first = sel && items.find((i) => i.id === sel && !i.unknown) ? sel : (items.find((i) => !i.unknown) || {}).id;
    const show = (id) => {
      list.querySelectorAll('button').forEach((b) => b.classList.toggle('sel', b.dataset.id === id));
      page.innerHTML = '';
      if (tab === 'souvenirs') {
        const e = ELY.CARNET.souvenirs[id]; if (!e) return;
        if (e.img) { const im = document.createElement('img'); im.src = e.img; im.alt = ''; page.appendChild(im); }
        const h = document.createElement('h3'); h.textContent = e.title; page.appendChild(h);
        if (e.hand) { const p = document.createElement('p'); p.className = 'hand'; p.textContent = e.hand; page.appendChild(p); }
        if (e.text) { const p = document.createElement('p'); p.textContent = e.text; page.appendChild(p); }
      } else {
        const st = document.createElement('p'); st.className = 'state'; st.textContent = 'Question ouverte'; page.appendChild(st);
        const p = document.createElement('p'); p.className = 'hand'; p.textContent = ELY.CARNET.questions[id] || ''; page.appendChild(p);
      }
    };
    items.forEach((it) => {
      const li = document.createElement('li'), b = document.createElement('button');
      b.type = 'button'; b.textContent = it.label; b.dataset.id = it.id;
      if (it.unknown) { b.classList.add('unknown'); b.disabled = true; }
      b.addEventListener('click', () => show(it.id));
      li.appendChild(b); list.appendChild(li);
    });
    if (first) show(first);
    el.hidden = false;
  };
  UI.closeCarnet = () => { $('#carnet').hidden = true; };

  /* ——— Faits du monde (console de debug, touche F) ——— */
  UI.renderFacts = function () {
    const el = $('#facts'); if (el.hidden) return;
    const f = ELY.WS.facts, list = el.querySelector('.facts-list'), log = el.querySelector('.facts-log');
    list.innerHTML = '';
    const keys = Object.keys(f).sort();
    keys.push('Elya.Bond');
    keys.forEach((k) => {
      const a = document.createElement('span'), b = document.createElement('span');
      a.className = 'k'; b.className = 'v'; a.textContent = k; b.textContent = k === 'Elya.Bond' ? ELY.WS.bond() : f[k];
      list.append(a, b);
    });
    log.innerHTML = '';
    ELY.WS.log.slice(-14).reverse().forEach((l) => {
      const li = document.createElement('li');
      li.textContent = l.event ? l.k : l.k + ' ' + l.from + ' → ' + l.to + '  (' + l.src + ')';
      log.appendChild(li);
    });
  };
  UI.toggleFacts = function (force) {
    const el = $('#facts'); el.hidden = force === undefined ? !el.hidden : !force; UI.renderFacts();
  };

  ELY.UI = UI;
})();
