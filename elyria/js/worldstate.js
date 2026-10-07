/* WorldState : un seul modèle pour tout, des faits.
   Un fait = une clé hiérarchique (Fact.*, Rel.*, Elya.*) associée à un entier.
   Conditions « Clé op Valeur [AND …] », effets Set / Add, règles différées, journal. */
(function () {
  const REL_MIN = -5, REL_MAX = 5;
  const WS = {
    facts: {},
    log: [],
    fired: {},
    listeners: [],

    reset() { this.facts = {}; this.log = []; this.fired = {}; this.emitChange(); },

    get(k) { return this.facts[k] || 0; },

    set(k, v, src) {
      if (k.startsWith('Rel.') || k.startsWith('Elya.')) v = Math.max(REL_MIN, Math.min(REL_MAX, v));
      const old = this.get(k);
      if (old === v && k in this.facts) return;
      this.facts[k] = v;
      this.log.push({ k, from: old, to: v, src: src || '?' });
      if (this.log.length > 200) this.log.shift();
      this.emitChange();
    },

    add(k, d, src) { this.set(k, this.get(k) + d, src); },

    apply(effects, src) {
      (effects || []).forEach(([op, k, v]) => (op === 'Add' ? this.add(k, v, src) : this.set(k, v, src)));
    },

    /* « Fact.A == 1 AND Rel.Elya.Confiance >= 2 » */
    test(cond) {
      if (!cond) return true;
      return cond.split(/\s+AND\s+/).every((part) => {
        const m = part.trim().match(/^([\w.]+)\s*(==|!=|>=|<=|>|<)\s*(-?\d+)$/);
        if (!m) { console.warn('Condition illisible :', part); return false; }
        const a = this.get(m[1]), b = +m[3];
        switch (m[2]) {
          case '==': return a === b; case '!=': return a !== b;
          case '>=': return a >= b; case '<=': return a <= b;
          case '>': return a > b; default: return a < b;
        }
      });
    },

    /* Un événement déclenche les règles différées qui l'écoutent. */
    event(name) {
      this.log.push({ k: name, event: true, src: 'event' });
      (ELY.RULES || []).forEach((r) => {
        if (r.trigger !== name) return;
        if (r.once && this.fired[r.id]) return;
        if (!this.test(r.cond)) return;
        this.fired[r.id] = true;
        this.apply(r.fx, 'règle ' + r.id);
      });
      this.emitChange();
    },

    /* État nommé lisible par les dialogues et l'animation (Elya.Bond.*). */
    bond() {
      const c = this.get('Rel.Elya.Confiance'), a = this.get('Rel.Elya.Affection'), s = this.get('Elya.Suspicion');
      if (s >= 1 && c <= 0) return 'Guarded';
      if (c + a >= 2) return 'Warm';
      return 'Distant';
    },

    snapshot() { return { facts: { ...this.facts }, fired: { ...this.fired }, log: this.log.slice(-60) }; },
    restore(s) { this.facts = { ...(s.facts || {}) }; this.fired = { ...(s.fired || {}) }; this.log = (s.log || []).slice(); this.emitChange(); },

    onChange(fn) { this.listeners.push(fn); },
    emitChange() { this.listeners.forEach((fn) => fn()); }
  };
  ELY.WS = WS;
})();
