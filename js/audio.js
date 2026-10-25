/* Web Audio 即時合成的配樂與音效（沒有任何音檔）。
   瀏覽器規定要使用者互動後才能出聲，所以第一次按按鈕時才 unlock()。 */
(function () {
  const MAJ = [0, 4, 7, 12], MIN = [0, 3, 7, 12];
  // 每個主題：速度、和弦進行（根音 MIDI + 大小調）、琶音型（16 格，數字＝和弦音索引，null＝休止）
  const THEMES = {
    dream:  { bpm: 80,  wave: 'sine',     oct: 24, vol: .07, decay: .9,  prog: [[60, MAJ], [57, MIN], [53, MAJ], [55, MAJ]],
              arp: [0, null, 2, null, 1, null, 3, null, 2, null, 1, null, 3, 2, null, null], pad: true },
    growth: { bpm: 108, wave: 'triangle', oct: 12, vol: .08, decay: .35, prog: [[60, MAJ], [55, MAJ], [57, MIN], [53, MAJ]],
              arp: [0, 2, 1, 3, null, 2, 1, null, 0, 2, 3, 2, 1, null, 2, null] },
    desert: { bpm: 92,  wave: 'triangle', oct: 12, vol: .08, decay: .3,  prog: [[50, MAJ], [51, MAJ], [50, MAJ], [48, MIN]],
              arp: [0, null, 1, 2, null, 1, 0, null, 3, null, 2, 1, null, 0, 1, null] },
    danger: { bpm: 66,  wave: 'sawtooth', oct: 12, vol: .045, decay: .6, lp: 900, prog: [[45, MIN], [45, MIN], [46, MAJ], [44, MIN]],
              arp: [0, null, null, 1, null, null, 0, null, null, 2, null, null, 1, null, null, null], drone: true },
    dawn:   { bpm: 72,  wave: 'sine',     oct: 12, vol: .07, decay: 1.1, prog: [[53, MAJ], [55, MAJ], [52, MIN], [57, MIN]],
              arp: [0, null, 1, null, 2, null, 3, null, 2, null, 1, null, 2, null, 3, null], pad: true },
    gray:   { bpm: 56,  wave: 'sine',     oct: 12, vol: .06, decay: 1.4, prog: [[57, MIN], [53, MAJ], [50, MIN], [52, MAJ]],
              arp: [0, null, null, null, 2, null, null, null, 1, null, null, null, null, null, null, null], rain: true }
  };

  let ctx = null, master, music, sfxBus, noiseBuf;
  let muted = false, theme = null, cfg = null, step = 0, nextTime = 0, timer = null, rainNode = null;

  const freq = (m) => 440 * Math.pow(2, (m - 69) / 12);

  function unlock() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = muted ? 0 : 1; master.connect(ctx.destination);
    music = ctx.createGain(); music.gain.value = 1; music.connect(master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = .9; sfxBus.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    if (theme) start(theme);
  }

  function tone(f, t, dur, wave, vol, out, lp) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = wave; o.frequency.value = f;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + .015);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    let node = o;
    if (lp) { const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = lp; o.connect(fl); node = fl; }
    node.connect(g); g.connect(out || music);
    o.start(t); o.stop(t + dur + .05);
  }

  function playStep(i, t) {
    const s16 = i % 16, bar = Math.floor(i / 16) % 4;
    const [root, type] = cfg.prog[bar];
    const barLen = 60 / cfg.bpm * 4;
    if (s16 === 0) {
      tone(freq(root - 12), t, barLen * .9, cfg.drone ? 'sawtooth' : 'triangle', cfg.vol * .9, music, cfg.drone ? 400 : 0);
      if (cfg.pad) type.slice(0, 3).forEach(iv => tone(freq(root + iv), t, barLen, 'sine', cfg.vol * .35));
    }
    const a = cfg.arp[s16];
    if (a != null) tone(freq(root + type[a] + cfg.oct - 12), t, cfg.decay, cfg.wave, cfg.vol, music, cfg.lp);
  }

  function schedule() {
    if (!ctx || muted || !cfg) return;
    if (nextTime < ctx.currentTime - .2) nextTime = ctx.currentTime + .05;
    while (nextTime < ctx.currentTime + .2) {
      playStep(step, nextTime);
      nextTime += 60 / cfg.bpm / 4;
      step++;
    }
  }

  function setRain(on) {
    if (!ctx) return;
    if (on && !rainNode) {
      const src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = .6;
      const g = ctx.createGain(); g.gain.value = .025;
      src.connect(f); f.connect(g); g.connect(music); src.start();
      rainNode = { src, g };
    } else if (!on && rainNode) {
      rainNode.src.stop(); rainNode = null;
    }
  }

  function start(name) {
    cfg = THEMES[name] || THEMES.dream;
    step = 0;
    nextTime = ctx.currentTime + .1;
    music.gain.cancelScheduledValues(ctx.currentTime);
    music.gain.setValueAtTime(0, ctx.currentTime);
    music.gain.linearRampToValueAtTime(1, ctx.currentTime + .8);
    setRain(!!cfg.rain);
    if (!timer) timer = setInterval(schedule, 60);
  }

  function play(name) {
    if (name === theme) return;
    theme = name;
    if (ctx) start(name);
  }

  function noise(t, dur, from, to, vol) {
    const src = ctx.createBufferSource(); src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.2;
    f.frequency.setValueAtTime(from, t); f.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(sfxBus); src.start(t); src.stop(t + dur);
  }

  function sfx(name) {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    switch (name) {
      case 'tick': tone(1400, t, .03, 'sine', .015, sfxBus); break;
      case 'click': tone(880, t, .08, 'sine', .08, sfxBus); tone(1320, t + .03, .08, 'sine', .05, sfxBus); break;
      case 'choose': [72, 76, 79, 84].forEach((m, i) => tone(freq(m), t + i * .06, .25, 'triangle', .09, sfxBus)); break;
      case 'sparkle': [88, 91, 95, 100].forEach((m, i) => tone(freq(m), t + i * .05, .2, 'sine', .05, sfxBus)); break;
      case 'win': [72, 76, 79, 84, 88].forEach((m, i) => tone(freq(m), t + i * .09, .6, 'triangle', .1, sfxBus)); break;
      case 'danger': tone(freq(40), t, .7, 'sawtooth', .07, sfxBus, 600); tone(freq(41), t, .7, 'sawtooth', .07, sfxBus, 600); break;
      case 'gloom': [45, 48, 52].forEach(m => tone(freq(m), t, 1.6, 'sine', .07, sfxBus)); break;
      case 'whoosh': noise(t, .5, 400, 3000, .08); break;
    }
  }

  function setMuted(m) {
    muted = m;
    if (master) master.gain.value = m ? 0 : 1;
    if (!m && ctx) nextTime = ctx.currentTime + .05;
  }

  window.AudioFX = { unlock, play, sfx, setMuted };
})();
