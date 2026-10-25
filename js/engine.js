/* 劇情引擎：節點 → 主題/場景 → 逐字對話 → 三選一 → 下一個節點 */
(function () {
  const $ = (id) => document.getElementById(id);
  const TYPE_MS = 26;

  const Game = {
    node: null,
    nodeId: null,
    lines: [],
    idx: 0,
    typing: false,
    timer: null,
    full: '',
    onLinesDone: null,
    waiting: false,     // 等玩家點擊下一句
    stoneArmed: false,
    sceneSpec: null,

    start(resume) {
      UI.show('game');
      this.goto(State.s.node, { resume });
    },

    goto(id, opts = {}) {
      const node = STORY.nodes[id];
      if (!node) { console.error('找不到節點', id); return; }
      const s = State.s;
      this.node = node;
      this.nodeId = id;
      s.node = id;
      if (!opts.resume) {
        const changed = State.apply(node.effects, node.flags);
        UI.updateHud(changed);
      } else {
        UI.updateHud([]);
      }
      if (node.tp) State.snapshotTP(id);
      State.save();
      window.scrollTo(0, 0);

      this.setTheme(node.theme);
      UI.setChapter(STORY.chapters[node.ch] || '');
      this.sceneSpec = node.scene || this.sceneSpec || { place: 'void' };
      this.drawScene();
      $('choices').innerHTML = '';
      this.disarmStone();

      const lines = (node.lines || []).slice();
      if (node.tp && node.prompt) lines.push(node.prompt);
      this.playLines(lines, () => this.afterLines());
    },

    afterLines() {
      const node = this.node;
      if (node.tp) return this.showChoices();
      if (node.ending) return this.showEnding();
      const next = STORY.resolveNext(node, State.s);
      if (next) this.goto(next);
    },

    setTheme(theme) {
      const t = theme || 'dream';
      if (document.body.dataset.theme !== t) {
        document.body.dataset.theme = t;
        UI.setDeco(t);
        AudioFX.sfx(t === 'danger' ? 'danger' : t === 'gray' ? 'gloom' : 'whoosh');
      }
      AudioFX.play(t);
    },

    drawScene(target = 'scene') {
      $(target).innerHTML = SCENES.render(this.sceneSpec, document.body.dataset.theme, State.s.gender);
    },

    /* ---------------- 對話 ---------------- */
    playLines(lines, done) {
      this.lines = lines;
      this.idx = 0;
      this.onLinesDone = done;
      if (!lines.length) { $('dialog').hidden = true; done(); return; }
      $('dialog').hidden = false;
      this.showLine();
    },

    showLine() {
      let line = this.lines[this.idx];
      let who = '', text = '';
      if (typeof line === 'string') text = line;
      else if (Array.isArray(line)) { who = line[0]; text = line[1]; }
      else {
        who = line.who || ''; text = line.text || '';
        if (line.theme) this.setTheme(line.theme);
        if (line.scene) { this.sceneSpec = Object.assign({}, this.sceneSpec, line.scene); this.drawScene(); }
        if (line.sfx) AudioFX.sfx(line.sfx);
      }
      who = State.fmt(who);
      this.full = State.fmt(text);
      $('speaker').textContent = who;
      const el = $('text');
      el.className = 'text' + (who ? '' : ' narr');
      el.textContent = '';
      $('advance-hint').classList.add('hidden');
      this.typing = true;
      this.waiting = false;
      let i = 0;
      clearInterval(this.timer);
      this.timer = setInterval(() => {
        i++;
        el.textContent = this.full.slice(0, i);
        if (i % 3 === 0) AudioFX.sfx('tick');
        if (i >= this.full.length) this.finishTyping();
      }, TYPE_MS);
    },

    finishTyping() {
      clearInterval(this.timer);
      $('text').textContent = this.full;
      this.typing = false;
      const isLast = this.idx >= this.lines.length - 1;
      // 轉折點的提問句打完就直接出現選項
      if (isLast && this.node.tp) { this.waiting = false; this.onLinesDone(); return; }
      this.waiting = true;
      $('advance-hint').classList.remove('hidden');
    },

    advance() {
      if (this.typing) { this.finishTyping(); return; }
      if (!this.waiting) return;
      this.waiting = false;
      AudioFX.sfx('click');
      this.idx++;
      if (this.idx < this.lines.length) this.showLine();
      else { $('advance-hint').classList.add('hidden'); this.onLinesDone(); }
    },

    /* ---------------- 三選一 ---------------- */
    showChoices() {
      const opts = STORY.resolveOptions(this.node, State.s);
      this.currentOptions = opts;
      const box = $('choices');
      box.innerHTML = '';
      opts.forEach((o, i) => {
        const b = document.createElement('button');
        b.className = 'choice';
        b.innerHTML = `<span class="num">${i + 1}</span>${esc(State.fmt(o.text))}${o.reqLabel ? `<span class="req">✦ ${esc(o.reqLabel)}</span>` : ''}`;
        b.addEventListener('click', () => this.pick(o, b));
        box.appendChild(b);
      });
      UI.updateStone();
      box.querySelector('.choice')?.focus({ preventScroll: true });
      box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    },

    pick(opt, btn) {
      if (this.stoneArmed) return this.revealOmen(opt, btn);
      const node = this.node;
      State.s.history.push({
        tp: node.tp, ch: node.ch,
        options: this.currentOptions.map(o => ({ id: o.id, text: State.fmt(o.text), tag: o.tag })),
        chosen: opt.id
      });
      const changed = State.apply(opt.effects, opt.flags);
      UI.updateHud(changed);
      AudioFX.sfx(opt.tag === 'danger' ? 'danger' : 'choose');
      $('choices').innerHTML = '';
      const factKey = node.fact || node.tp;
      const go = () => this.goto(opt.next);
      if (CASES.facts[factKey]) {
        State.unlockFact(factKey);
        UI.factModal(CASES.facts[factKey], go);
      } else go();
    },

    toggleStone() {
      if (!this.currentOptions || !$('choices').children.length || State.s.stones <= 0) return;
      this.stoneArmed = !this.stoneArmed;
      $('btn-stone').classList.toggle('armed', this.stoneArmed);
      $('choices').classList.toggle('stone-mode', this.stoneArmed);
      AudioFX.sfx('sparkle');
    },
    disarmStone() {
      this.stoneArmed = false;
      $('btn-stone').classList.remove('armed');
      $('choices').classList.remove('stone-mode');
    },
    revealOmen(opt, btn) {
      if (btn.querySelector('.omen')) return;
      State.s.stones--;
      State.save();
      const span = document.createElement('span');
      span.className = 'omen';
      span.textContent = '🔮 ' + State.fmt(opt.omen || '石頭安安靜靜的，沒有特別的徵兆。');
      btn.appendChild(span);
      this.disarmStone();
      UI.updateStone();
      AudioFX.sfx('sparkle');
    },

    /* ---------------- 結局 ---------------- */
    showEnding() {
      const node = this.node;
      const key = node.ending;
      const info = STORY.endings[key];
      State.s.history.push({ ending: key });
      State.s.finished = true;
      State.save();
      State.unlockEnding(key);
      AudioFX.sfx(info.good ? 'win' : 'gloom');
      UI.showEnding(node, info, this.sceneSpec);
    },

    rewind() {
      const nodeId = State.rewind();
      if (!nodeId) return;
      State.s.finished = false;
      UI.show('game');
      this.goto(nodeId, { resume: true });
    }
  };

  function esc(s) {
    return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  window.Game = Game;
  window.esc = esc;
})();
