/* 介面：畫面切換、HUD、背景裝飾、彈窗、結局、圖鑑、路徑圖、求助資源 */
(function () {
  const $ = (id) => document.getElementById(id);
  let current = 'title';
  let pathReturn = 'title';
  let chosenGender = null;

  const UI = {
    show(name) {
      document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
      $('screen-' + name).classList.add('active');
      current = name;
      window.scrollTo(0, 0);
      if (name === 'title') this.renderTitle();
      if (name === 'gallery') this.renderGallery();
      if (name === 'help') this.renderHelp();
    },

    /* ---------------- 標題 / 建立角色 ---------------- */
    renderTitle() {
      document.body.dataset.theme = 'dream';
      this.setDeco('dream');
      AudioFX.play('dream');
      $('title-art').innerHTML = SCENES.portrait('hero', 'happy', 'f') + SCENES.portrait('salem', 'happy', 'f') + SCENES.portrait('hero', 'happy', 'm');
      const hasSave = State.hasSave() && State.load() && !State.s.finished;
      $('btn-continue').hidden = !hasSave;
    },

    renderCreate() {
      $('art-f').innerHTML = SCENES.portrait('hero', 'happy', 'f');
      $('art-m').innerHTML = SCENES.portrait('hero', 'happy', 'm');
      chosenGender = null;
      document.querySelectorAll('.gender-card').forEach(b => b.setAttribute('aria-pressed', 'false'));
      $('btn-start').disabled = true;
      $('input-name').value = '';
      this.show('create');
    },

    /* ---------------- HUD ---------------- */
    setChapter(label) { $('hud-chapter').textContent = label; },

    updateHud(changed) {
      const s = State.s;
      $('hud-stats').innerHTML = State.STAT_INFO.map(st => {
        const val = s.stats[st.key];
        const pips = '●'.repeat(Math.min(val, 5)) + '○'.repeat(Math.max(0, 5 - val));
        return `<span class="stat${changed.includes(st.key) ? ' bump' : ''}" title="${st.name}">${st.icon}<span class="sr">${st.name}</span> <span class="pips">${pips}${val > 5 ? '+' : ''}</span><span class="num">${val}</span></span>`;
      }).join('');
      this.updateStone();
    },

    updateStone() {
      const n = State.s ? State.s.stones : 0;
      $('stone-count').textContent = n;
      $('btn-stone').disabled = n <= 0 || !$('choices').children.length;
    },

    /* ---------------- 背景裝飾 ---------------- */
    setDeco(theme) {
      const box = $('bg-deco');
      let html = '';
      const r = (a, b) => a + Math.random() * (b - a);
      if (theme === 'dream' || theme === 'growth') {
        for (let i = 0; i < 6; i++) {
          const w = r(80, 160);
          html += `<div class="deco cloud" style="width:${w}px;height:${w * .35}px;top:${r(4, 70)}vh;animation-duration:${r(50, 90)}s;animation-delay:-${r(0, 80)}s"></div>`;
        }
      }
      if (theme === 'dream') for (let i = 0; i < 10; i++) {
        const sz = r(10, 30);
        html += `<div class="deco bubble" style="width:${sz}px;height:${sz}px;left:${r(0, 100)}vw;animation-duration:${r(14, 26)}s;animation-delay:-${r(0, 26)}s"></div>`;
      }
      if (theme === 'growth') {
        const cols = ['#2fbf71', '#8fdc9f', '#ff6fa5', '#ffd23f', '#6ec6ff'];
        for (let i = 0; i < 14; i++) html += `<div class="deco leaf" style="left:${r(0, 100)}vw;background:${cols[i % 5]};animation-duration:${r(10, 20)}s;animation-delay:-${r(0, 20)}s"></div>`;
      }
      if (theme === 'danger') for (let i = 0; i < 12; i++) {
        const sz = r(40, 140);
        html += `<div class="deco shard" style="width:${sz}px;height:${sz}px;left:${r(-5, 95)}vw;top:${r(-5, 90)}vh;transform:rotate(${r(0, 360)}deg);animation-delay:-${r(0, 3)}s"></div>`;
      }
      if (theme === 'desert') for (let i = 0; i < 20; i++) html += `<div class="deco dust" style="top:${r(10, 95)}vh;animation-duration:${r(20, 40)}s;animation-delay:-${r(0, 40)}s"></div>`;
      if (theme === 'dawn') for (let i = 0; i < 7; i++) html += `<div class="deco ray" style="transform:rotate(${-60 + i * 20}deg)"></div>`;
      if (theme === 'gray') for (let i = 0; i < 50; i++) html += `<div class="deco rain" style="left:${r(0, 100)}vw;animation-duration:${r(.6, 1.2)}s;animation-delay:-${r(0, 1.2)}s"></div>`;
      box.innerHTML = html;
    },

    /* ---------------- 彈窗 ---------------- */
    modal(html, actions) {
      $('modal-body').innerHTML = html;
      const row = $('modal-actions');
      row.innerHTML = '';
      actions.forEach(a => {
        const b = document.createElement('button');
        b.className = 'btn' + (a.primary ? ' primary' : '');
        b.textContent = a.label;
        b.addEventListener('click', () => { this.closeModal(); AudioFX.sfx('click'); a.run && a.run(); });
        row.appendChild(b);
      });
      $('modal').hidden = false;
      row.querySelector('.btn.primary, .btn')?.focus();
    },
    closeModal() { $('modal').hidden = true; },
    modalOpen() { return !$('modal').hidden; },

    factModal(fact, next) {
      const src = fact.src ? `<p class="src">來源：<a href="${fact.src[1]}" target="_blank" rel="noopener">${esc(fact.src[0])}</a></p>` : '';
      this.modal(`<h3>💡 現實小卡：${esc(fact.title)}</h3><p>${esc(fact.text)}</p>${src}`, [{ label: '我知道了，繼續', primary: true, run: next }]);
    },

    menu() {
      this.modal('<h3>選單</h3><p>進度會自動存檔。</p>', [
        { label: '看選擇路徑', run: () => this.showPath('game') },
        { label: '回到標題', run: () => this.show('title') },
        { label: '繼續遊戲', primary: true }
      ]);
    },

    /* ---------------- 結局 ---------------- */
    showEnding(node, info, sceneSpec) {
      this.show('ending');
      $('ending-scene').innerHTML = SCENES.render(node.endScene || sceneSpec, document.body.dataset.theme, State.s.gender);
      $('ending-badge').textContent = info.icon;
      $('ending-title').textContent = `結局：${info.name}`;
      $('ending-text').innerHTML = (node.summary || []).map(p => `<p>${esc(State.fmt(p))}</p>`).join('');
      $('ending-cases').innerHTML = (node.cases || info.cases || []).map(k => caseCard(CASES.cards[k])).join('') + hotlineCard(info.hotlines);
      $('btn-rewind').hidden = !State.s.tpSnap;
    },

    /* ---------------- 圖鑑 ---------------- */
    renderGallery() {
      const keys = Object.keys(STORY.endings);
      const got = keys.filter(k => State.meta.endings[k]).length;
      $('gallery-count').textContent = `${got} / ${keys.length}`;
      $('gallery-grid').innerHTML = keys.map(k => {
        const e = STORY.endings[k];
        const ok = State.meta.endings[k];
        return `<div class="g-slot${ok ? '' : ' locked'}"><div class="g-icon">${ok ? e.icon : '❔'}</div><div class="g-name">${ok ? esc(e.name) : '？？？'}</div><div class="g-hint">${esc(e.hint)}</div></div>`;
      }).join('');
      $('fact-list').innerHTML = Object.keys(CASES.facts).map(k => {
        const f = CASES.facts[k];
        return State.meta.facts[k]
          ? `<div class="fact-item"><b>${esc(f.title)}</b><br>${esc(f.text)}</div>`
          : `<div class="fact-item locked">🔒 通過對應的轉折點後解鎖</div>`;
      }).join('');
    },

    /* ---------------- 路徑圖 ---------------- */
    showPath(from) {
      pathReturn = from;
      const hist = (from === 'game' || from === 'ending') && State.s ? State.s.history
        : (State.meta.lastRun ? State.meta.lastRun.history : []);
      $('path-map').innerHTML = pathSvg(hist);
      document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
      $('screen-path').classList.add('active');
      // 路徑比畫面寬時才提示左右滑動
      const box = document.querySelector('.path-scroll');
      document.querySelector('.swipe-hint').style.display = box.scrollWidth > box.clientWidth + 2 ? 'block' : 'none';
    },

    renderHelp() {
      $('help-list').innerHTML = hotlineCard(CASES.hotlines.map(h => h.num), true)
        + `<div class="case-card"><h4>本遊戲參考的真實案例</h4><ul>${Object.values(CASES.cards).map(c => `<li>${esc(c.title)}：${c.sources.map(s => `<a href="${s[1]}" target="_blank" rel="noopener">${esc(s[0])}</a>`).join('、')}</li>`).join('')}</ul></div>`;
    }
  };

  function caseCard(c) {
    if (!c) return '';
    return `<div class="case-card"><h4>📰 真實案例：${esc(c.title)}</h4>
      ${c.story.map(p => `<p>${esc(p)}</p>`).join('')}
      <p><b>⚖️ 法律與後果</b></p><ul>${c.law.map(l => `<li>${esc(l)}</li>`).join('')}</ul>
      <p class="muted">來源：${c.sources.map(s => `<a href="${s[1]}" target="_blank" rel="noopener">${esc(s[0])}</a>`).join('、')}</p></div>`;
  }

  function hotlineCard(nums, full) {
    const list = CASES.hotlines.filter(h => !nums || nums.includes(h.num));
    if (!list.length) return '';
    return `<div class="case-card"><h4>📞 需要幫忙時</h4>${full
      ? `<ul>${list.map(h => `<li><span class="hotline">${h.num}</span><b>${esc(h.name)}</b>：${esc(h.desc)}</li>`).join('')}</ul>`
      : list.map(h => `<span class="hotline">${h.num} ${esc(h.name)}</span>`).join('')}</div>`;
  }

  const TAG_COLOR = { growth: '#2fbf71', gray: '#8a909a', danger: '#7a3cff', dawn: '#ff9b3d' };
  function pathSvg(hist) {
    const tps = hist.filter(h => h.tp);
    const end = hist.find(h => h.ending);
    if (!tps.length) return '<p class="muted">還沒有走過任何轉折點。</p>';
    const colW = 150, boxW = 134, boxH = 58, gap = 12, top = 34;
    const cols = tps.length + (end ? 1 : 0);
    const width = cols * colW + 20, height = top + 3 * (boxH + gap) + 10;
    let s = `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" font-family="var(--font)">`;
    const cut = (t, n) => (t.length > n ? t.slice(0, n) + '…' : t);
    let prev = null;
    tps.forEach((h, ci) => {
      const x = 10 + ci * colW;
      s += `<text x="${x + boxW / 2}" y="20" text-anchor="middle" font-size="14" style="fill:var(--accent)">${esc(STORY.tpNames[h.tp] || h.tp)}</text>`;
      h.options.forEach((o, ri) => {
        const y = top + ri * (boxH + gap);
        const chosen = o.id === h.chosen;
        const col = TAG_COLOR[o.tag] || '#8a909a';
        if (chosen && prev) s += `<path d="M${prev.x} ${prev.y} C${prev.x + 14} ${prev.y} ${x - 14} ${y + boxH / 2} ${x} ${y + boxH / 2}" stroke="${col}" stroke-width="4" fill="none"/>`;
        s += `<rect x="${x}" y="${y}" width="${boxW}" height="${boxH}" rx="12" fill="${chosen ? col : 'var(--panel)'}" stroke="${col}" stroke-width="${chosen ? 3 : 1.5}" opacity="${chosen ? 1 : .6}"/>`;
        const words = cut(o.text, 22);
        s += `<foreignObject x="${x + 6}" y="${y + 4}" width="${boxW - 12}" height="${boxH - 8}"><div xmlns="http://www.w3.org/1999/xhtml" style="font-size:11.5px;line-height:1.35;color:${chosen ? '#fff' : 'var(--ink)'};font-family:var(--font)">${esc(words)}</div></foreignObject>`;
        if (chosen) prev = { x: x + boxW, y: y + boxH / 2 };
      });
    });
    if (end) {
      const info = STORY.endings[end.ending];
      const x = 10 + tps.length * colW, y = top + boxH + gap;
      const col = info.good ? '#ff9b3d' : '#5c6370';
      if (prev) s += `<path d="M${prev.x} ${prev.y} C${prev.x + 14} ${prev.y} ${x - 14} ${y + boxH / 2} ${x} ${y + boxH / 2}" stroke="${col}" stroke-width="4" fill="none"/>`;
      s += `<text x="${x + boxW / 2}" y="20" text-anchor="middle" font-size="14" style="fill:var(--accent)">結局</text>`;
      s += `<rect x="${x}" y="${y}" width="${boxW}" height="${boxH}" rx="12" fill="${col}"/><text x="${x + boxW / 2}" y="${y + 25}" text-anchor="middle" font-size="18">${info.icon}</text><text x="${x + boxW / 2}" y="${y + 47}" text-anchor="middle" font-size="13" fill="#fff">${esc(info.name)}</text>`;
    }
    return s + '</svg>';
  }

  /* ---------------- 事件綁定 ---------------- */
  function bind() {
    document.querySelectorAll('[data-goto]').forEach(b => b.addEventListener('click', () => { AudioFX.sfx('click'); UI.show(b.dataset.goto); }));
    $('btn-new').addEventListener('click', () => { AudioFX.unlock(); AudioFX.sfx('click'); UI.renderCreate(); });
    $('btn-continue').addEventListener('click', () => { AudioFX.unlock(); if (State.load()) Game.start(true); });
    $('btn-gallery').addEventListener('click', () => { AudioFX.unlock(); UI.show('gallery'); });
    $('btn-help').addEventListener('click', () => { AudioFX.unlock(); UI.show('help'); });

    document.querySelectorAll('.gender-card').forEach(b => b.addEventListener('click', () => {
      chosenGender = b.dataset.gender;
      document.querySelectorAll('.gender-card').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      $('btn-start').disabled = false;
      AudioFX.sfx('sparkle');
    }));
    $('btn-start').addEventListener('click', () => {
      const name = $('input-name').value.trim() || '小星';
      State.newGame(name, chosenGender);
      AudioFX.sfx('choose');
      Game.start(false);
    });
    $('input-name').addEventListener('keydown', e => { if (e.key === 'Enter' && chosenGender) $('btn-start').click(); });

    $('dialog').addEventListener('click', () => Game.advance());
    $('btn-stone').addEventListener('click', () => Game.toggleStone());
    $('btn-mute').addEventListener('click', () => {
      const m = !State.meta.muted;
      State.setMuted(m);
      AudioFX.setMuted(m);
      $('btn-mute').textContent = m ? '🔇' : '🔊';
    });
    $('btn-menu').addEventListener('click', () => UI.menu());
    $('btn-rewind').addEventListener('click', () => Game.rewind());
    $('btn-path').addEventListener('click', () => UI.showPath('ending'));
    $('btn-path-back').addEventListener('click', () => {
      document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
      if (pathReturn === 'title') UI.show('title');
      else $('screen-' + pathReturn).classList.add('active');
    });

    document.addEventListener('keydown', e => {
      if (UI.modalOpen()) { if (e.key === 'Escape') UI.closeModal(); return; }
      if (current !== 'game' || !$('screen-game').classList.contains('active')) return;
      if (e.target.tagName === 'INPUT') return;
      if ((e.key === ' ' || e.key === 'Enter') && !$('choices').children.length) { e.preventDefault(); Game.advance(); }
      if (['1', '2', '3'].includes(e.key)) $('choices').children[+e.key - 1]?.click();
    });

    $('btn-mute').textContent = State.meta.muted ? '🔇' : '🔊';
    AudioFX.setMuted(State.meta.muted);
  }

  window.UI = UI;
  document.addEventListener('DOMContentLoaded', () => { bind(); UI.show('title'); });
})();
