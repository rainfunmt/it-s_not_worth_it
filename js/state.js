/* 遊戲狀態與存檔。localStorage 可能在無痕模式或被封鎖時拋錯，全部包 try/catch。 */
(function () {
  const SAVE_KEY = 'star-spring-save-v1';
  const META_KEY = 'star-spring-meta-v1';

  const STAT_INFO = [
    { key: 'heart', icon: '💗', name: '心之聲' },
    { key: 'alert', icon: '🛡️', name: '警覺' },
    { key: 'bond', icon: '🤝', name: '羈絆' },
    { key: 'coin', icon: '💰', name: '金幣' }
  ];

  const clone = (o) => JSON.parse(JSON.stringify(o));

  function read(key) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* 存不了就算了，遊戲照玩 */ }
  }
  function remove(key) {
    try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
  }

  const State = {
    s: null,
    meta: Object.assign({ endings: {}, facts: {}, muted: false, lastRun: null }, read(META_KEY) || {}),
    STAT_INFO,

    newGame(name, gender) {
      this.s = {
        name, gender,
        stats: { heart: 1, alert: 1, bond: 1, coin: 1, shadow: 0 },
        flags: {},
        stones: 2,
        node: window.STORY.start,
        history: [],
        tpSnap: null
      };
      this.save();
    },

    hasSave() { return !!read(SAVE_KEY); },
    load() { this.s = read(SAVE_KEY); return !!this.s; },
    save() { if (this.s) write(SAVE_KEY, this.s); },
    clearSave() { remove(SAVE_KEY); },
    saveMeta() { write(META_KEY, this.meta); },

    // 進入轉折點時存一份快照，結局畫面可以「回到上一個轉折點」
    snapshotTP(nodeId) {
      const copy = clone(Object.assign({}, this.s, { tpSnap: null }));
      this.s.tpSnap = { node: nodeId, data: copy };
    },
    rewind() {
      if (!this.s || !this.s.tpSnap) return null;
      const snap = this.s.tpSnap;
      this.s = clone(snap.data);
      this.s.tpSnap = clone(snap);
      return snap.node;
    },

    apply(effects, flags) {
      const changed = [];
      if (effects) for (const k in effects) {
        this.s.stats[k] = Math.max(0, (this.s.stats[k] || 0) + effects[k]);
        changed.push(k);
      }
      if (flags) Object.assign(this.s.flags, flags);
      return changed;
    },

    unlockEnding(key) {
      this.meta.endings[key] = true;
      this.meta.lastRun = { name: this.s.name, history: clone(this.s.history) };
      this.saveMeta();
    },
    unlockFact(key) {
      if (!this.meta.facts[key]) { this.meta.facts[key] = true; this.saveMeta(); }
    },
    setMuted(m) { this.meta.muted = m; this.saveMeta(); },

    // 文字代換：{name}、{ta}（他/她）、{g:男生用字|女生用字}
    fmt(str) {
      if (!str || !this.s) return str || '';
      const male = this.s.gender === 'm';
      return str
        .replace(/\{name\}/g, this.s.name)
        .replace(/\{ta\}/g, male ? '他' : '她')
        .replace(/\{g:([^|}]*)\|([^}]*)\}/g, (_, m, f) => (male ? m : f));
    }
  };

  window.State = State;
})();
