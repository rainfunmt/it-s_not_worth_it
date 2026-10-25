/* SVG 插畫組件：場景 = 天空 + 主題裝飾 + 地點 + 道具 + 角色
   同一個地點會依主題改變形狀（圓角屋頂 ↔ 尖角屋頂），顏色全部來自 CSS 變數。 */
(function () {
  const W = 800, H = 450, GROUND = 395;
  const LINE = '#4a3048';
  const v = (name) => `style="fill:var(--${name})"`;
  const rnd = (seed) => { let s = seed; return () => (s = (s * 9301 + 49297) % 233280) / 233280; };

  /* ---------------- 天空與裝飾 ---------------- */
  function sky(theme) {
    let s = `<defs>
      <linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" style="stop-color:var(--sky1)"/><stop offset=".7" style="stop-color:var(--sky2)"/><stop offset="1" style="stop-color:var(--sky3)"/>
      </linearGradient>
      <radialGradient id="g-glow"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    </defs><rect width="${W}" height="${H}" fill="url(#g-sky)"/>`;
    return s;
  }

  function cloud(x, y, k = 1, cls = '') {
    return `<g class="${cls}" transform="translate(${x} ${y}) scale(${k})" ${v('deco1')} opacity=".95">
      <ellipse cx="0" cy="0" rx="46" ry="22"/><circle cx="-20" cy="-12" r="22"/><circle cx="14" cy="-18" r="27"/><circle cx="38" cy="-4" r="18"/></g>`;
  }

  function deco(theme) {
    const r = rnd(7);
    let s = '';
    if (theme === 'dream') {
      s += cloud(120, 80, 1.1, 'float-slow') + cloud(560, 60, .9, 'float-slow') + cloud(700, 140, .6, 'float-slow') + cloud(330, 130, .5, 'float-slow');
      for (let i = 0; i < 10; i++) s += `<circle cx="${r() * W}" cy="${r() * 220}" r="${2 + r() * 3}" fill="#fff" class="twinkle" style="animation-delay:-${r() * 2}s"/>`;
    } else if (theme === 'danger') {
      for (let i = 0; i < 7; i++) {
        const x = r() * W, y = r() * 230, k = 20 + r() * 50;
        s += `<polygon points="${x},${y} ${x + k * .4},${y + k} ${x - k * .5},${y + k * .7}" ${v('deco2')} opacity=".35" class="twinkle" style="animation-delay:-${r() * 2}s"/>`;
      }
      s += `<polyline points="0,60 90,90 140,40 260,110 300,70 420,120" fill="none" stroke="var(--accent2)" stroke-width="2" opacity=".35"/>`;
      s += `<path d="M640 70 a26 26 0 1 0 22 40 a20 20 0 1 1 -22 -40z" fill="#c9c3ff" opacity=".7"/>`;
    } else if (theme === 'growth') {
      s += `<path d="M60 300 A340 340 0 0 1 740 300" fill="none" stroke="#ff6f91" stroke-width="10" opacity=".35"/>
            <path d="M80 300 A320 320 0 0 1 720 300" fill="none" stroke="#ffd23f" stroke-width="10" opacity=".35"/>
            <path d="M100 300 A300 300 0 0 1 700 300" fill="none" stroke="#2fbf71" stroke-width="10" opacity=".35"/>
            <path d="M120 300 A280 280 0 0 1 680 300" fill="none" stroke="#6ec6ff" stroke-width="10" opacity=".35"/>`;
      s += cloud(140, 70, .8, 'float-slow') + cloud(620, 90, .7, 'float-slow');
      s += `<circle cx="700" cy="60" r="30" fill="#ffd23f"/>`;
    } else if (theme === 'desert') {
      s += `<circle cx="640" cy="120" r="56" fill="#fff3c4" opacity=".9"/><circle cx="640" cy="120" r="80" fill="#fff3c4" opacity=".3"/>`;
      for (let i = 0; i < 14; i++) s += `<circle cx="${r() * W}" cy="${100 + r() * 220}" r="2" ${v('deco1')} opacity=".7" class="twinkle" style="animation-delay:-${r() * 2}s"/>`;
    } else if (theme === 'dawn') {
      for (let i = 0; i < 9; i++) {
        const a = -80 + i * 20;
        s += `<polygon points="400,330 ${400 + Math.tan(a * Math.PI / 180) * 400 - 30},-60 ${400 + Math.tan(a * Math.PI / 180) * 400 + 30},-60" fill="#fff6d6" opacity=".35"/>`;
      }
      s += `<circle cx="400" cy="330" r="90" fill="#fff1b8" opacity=".9"/>`;
    } else if (theme === 'gray') {
      s += `<g class="svg-rain" stroke="var(--deco1)" stroke-width="2" opacity=".4">`;
      for (let i = 0; i < 40; i++) {
        const x = r() * W, y = -460 + r() * 460;
        s += `<line x1="${x}" y1="${y}" x2="${x - 4}" y2="${y + 18}" style="animation-delay:-${r()}s"/>`;
      }
      s += `</g>`;
    }
    return s;
  }

  /* ---------------- 建築：依主題變形 ---------------- */
  function house(x, w, h, theme, i = 0) {
    const y = GROUND - h;
    if (theme === 'danger') {
      const lean = i % 2 ? 6 : -6;
      return `<g><polygon points="${x},${GROUND} ${x},${y} ${x + w / 2 + lean},${y - h * .7} ${x + w},${y} ${x + w},${GROUND}" ${v('house')} stroke="var(--deco2)" stroke-width="2"/>
        <polygon points="${x - 8},${y + 4} ${x + w / 2 + lean},${y - h * .75} ${x + w + 8},${y + 4}" ${v('roof')}/>
        <rect x="${x + w * .2}" y="${y + h * .2}" width="${w * .14}" height="${h * .35}" ${v('window')} opacity=".85"/>
        <rect x="${x + w * .62}" y="${y + h * .2}" width="${w * .14}" height="${h * .35}" ${v('window')} opacity=".5"/></g>`;
    }
    if (theme === 'gray') {
      return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" ${v('house')}/>
        <rect x="${x - 4}" y="${y - 8}" width="${w + 8}" height="10" ${v('roof')}/>
        <rect x="${x + w * .2}" y="${y + h * .25}" width="${w * .2}" height="${w * .2}" ${v('window')}/>
        <rect x="${x + w * .6}" y="${y + h * .25}" width="${w * .2}" height="${w * .2}" ${v('window')}/></g>`;
    }
    if (theme === 'desert') {
      return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" ${v('house')}/>
        <path d="M${x + w * .25} ${y} a${w * .25} ${w * .22} 0 0 1 ${w * .5} 0z" ${v('roof')}/>
        <path d="M${x + w * .38} ${GROUND} v-${h * .4} a${w * .12} ${w * .12} 0 0 1 ${w * .24} 0 v${h * .4}z" ${v('window')} opacity=".7"/></g>`;
    }
    // dream / growth / dawn：軟綿綿圓角
    const roof = theme === 'growth'
      ? `<path d="M${x - 10} ${y + 6} L${x + w / 2} ${y - h * .45} L${x + w + 10} ${y + 6}z" ${v('roof')} stroke="var(--roof)" stroke-width="14" stroke-linejoin="round"/>`
      : `<path d="M${x - 8} ${y + 12} a${w / 2 + 8} ${h * .45} 0 0 1 ${w + 16} 0z" ${v('roof')}/>`;
    const flowers = theme === 'growth'
      ? `<circle cx="${x + 8}" cy="${GROUND - 6}" r="6" fill="#ff6fa5"/><circle cx="${x + w - 8}" cy="${GROUND - 6}" r="6" fill="#ffd23f"/><circle cx="${x + w / 2 + 22}" cy="${GROUND - 5}" r="5" fill="#6ec6ff"/>` : '';
    return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" ${v('house')} stroke="var(--panel-line)" stroke-width="3"/>${roof}
      <circle cx="${x + w * .3}" cy="${y + h * .38}" r="${w * .11}" ${v('window')}/>
      <circle cx="${x + w * .72}" cy="${y + h * .38}" r="${w * .11}" ${v('window')}/>
      <path d="M${x + w * .4} ${GROUND} v-${h * .28} a${w * .1} ${w * .1} 0 0 1 ${w * .2} 0 v${h * .28}z" ${v('roof')} opacity=".8"/>${flowers}</g>`;
  }

  function ground(theme, y = GROUND) {
    if (theme === 'danger') return `<polygon points="0,${y} 120,${y - 6} 260,${y + 4} 400,${y - 8} 560,${y + 2} 700,${y - 6} 800,${y} 800,450 0,450" ${v('ground')}/>
      <polyline points="0,${y} 120,${y - 6} 260,${y + 4} 400,${y - 8} 560,${y + 2} 700,${y - 6} 800,${y}" fill="none" stroke="var(--deco2)" stroke-width="2"/>`;
    if (theme === 'desert') return `<path d="M0 ${y - 20} Q200 ${y - 60} 400 ${y - 10} T800 ${y - 25} V450 H0z" ${v('ground2')}/><path d="M0 ${y} Q250 ${y - 30} 500 ${y} T800 ${y} V450 H0z" ${v('ground')}/>`;
    if (theme === 'gray') return `<rect x="0" y="${y}" width="800" height="${450 - y}" ${v('ground')}/>`;
    return `<path d="M0 ${y} Q200 ${y - 18} 400 ${y} T800 ${y} V450 H0z" ${v('ground')}/><path d="M0 ${y + 18} Q220 ${y + 4} 420 ${y + 18} T800 ${y + 16} V450 H0z" ${v('ground2')} opacity=".7"/>`;
  }

  function tree(x, theme, k = 1) {
    let crown;
    if (theme === 'danger' || theme === 'gray') {
      crown = `<polygon points="0,-230 50,-150 30,-150 70,-90 -70,-90 -30,-150 -50,-150" ${v('roof')}/>`;
    } else {
      const c1 = theme === 'growth' ? '#5ccf7e' : 'var(--roof)';
      const c2 = theme === 'growth' ? '#8fe3a3' : 'var(--deco2)';
      crown = `<g style="fill:${c1}"><circle cx="-40" cy="-150" r="42"/><circle cx="35" cy="-155" r="46"/><circle cx="0" cy="-195" r="48"/></g>
        <g style="fill:${c2}" opacity=".8"><circle cx="-20" cy="-185" r="18"/><circle cx="40" cy="-170" r="14"/></g>`;
      if (theme === 'growth') crown += `<circle cx="-30" cy="-140" r="7" fill="#ff6f91"/><circle cx="25" cy="-200" r="7" fill="#ffd23f"/><circle cx="50" cy="-140" r="7" fill="#ff8a65"/>`;
    }
    return `<g transform="translate(${x} ${GROUND}) scale(${k})"><path d="M-12 0 Q-8 -60 -16 -120 L16 -120 Q8 -60 12 0z" fill="#a8745a"/>${crown}</g>`;
  }

  /* ---------------- 地點 ---------------- */
  const places = {
    town(t) {
      return house(40, 110, 120, t, 0) + house(190, 90, 95, t, 1) + tree(380, t) + house(500, 100, 110, t, 2) + house(640, 120, 135, t, 3) + ground(t);
    },
    room(t) {
      const night = t === 'danger' || t === 'gray';
      return `<rect x="0" y="0" width="800" height="${GROUND}" ${v('sky2')} opacity=".55"/>
        <rect x="470" y="60" width="200" height="150" rx="${t === 'danger' ? 0 : 30}" fill="${night ? '#141833' : '#bfe6ff'}" stroke="var(--panel-line)" stroke-width="8"/>
        ${night ? '<circle cx="620" cy="100" r="16" fill="#e8e4ff"/>' : cloud(560, 140, .55)}
        <line x1="570" y1="60" x2="570" y2="210" stroke="var(--panel-line)" stroke-width="6"/>
        <rect x="60" y="${GROUND - 70}" width="260" height="70" rx="${t === 'danger' ? 0 : 26}" ${v('roof')}/>
        <rect x="60" y="${GROUND - 100}" width="80" height="40" rx="20" ${v('house')}/>
        ${ground(t)}`;
    },
    shop(t) {
      let crystals = '';
      const cols = ['#b896ff', '#7fd3ff', '#ff9cc6', '#8fe3a3', '#ffd23f'];
      for (let i = 0; i < 10; i++) {
        const x = 90 + (i % 5) * 120, y = i < 5 ? 120 : 210;
        crystals += `<polygon points="${x},${y} ${x + 14},${y - 34} ${x + 28},${y}" fill="${cols[i % 5]}" opacity=".9"/><polygon points="${x + 22},${y} ${x + 32},${y - 22} ${x + 42},${y}" fill="${cols[(i + 2) % 5]}" opacity=".8"/>`;
      }
      return `<rect x="0" y="0" width="800" height="${GROUND}" ${v('house')} opacity=".6"/>
        <rect x="60" y="120" width="680" height="10" rx="5" ${v('roof')}/><rect x="60" y="210" width="680" height="10" rx="5" ${v('roof')}/>${crystals}
        <rect x="430" y="${GROUND - 90}" width="320" height="90" rx="16" ${v('roof')}/>
        <rect x="440" y="${GROUND - 104}" width="300" height="18" rx="9" ${v('house')}/>
        ${ground(t)}`;
    },
    city(t, label = '霓虹港') {
      let s = '';
      const r = rnd(3);
      for (let i = 0; i < 9; i++) {
        const x = i * 92 - 10, h = 160 + r() * 170, w = 80;
        s += t === 'danger' || t === 'gray'
          ? `<polygon points="${x},${GROUND} ${x},${GROUND - h} ${x + w / 2},${GROUND - h - 40} ${x + w},${GROUND - h} ${x + w},${GROUND}" ${v('house')} stroke="var(--deco2)" stroke-width="2"/>`
          : `<rect x="${x}" y="${GROUND - h}" width="${w}" height="${h}" rx="18" ${v('house')} stroke="var(--panel-line)" stroke-width="3"/>`;
        for (let j = 0; j < 5; j++) s += `<rect x="${x + 14 + (j % 2) * 30}" y="${GROUND - h + 20 + j * 28}" width="16" height="12" rx="3" ${v('window')} opacity="${.4 + r() * .6}"/>`;
      }
      s += `<rect x="520" y="150" width="150" height="46" rx="${t === 'danger' ? 0 : 23}" fill="none" stroke="var(--accent2)" stroke-width="4"/><text x="595" y="182" text-anchor="middle" font-size="22" fill="var(--accent2)" font-family="var(--font)">${label}</text>`;
      return s + ground(t);
    },
    street(t) {
      return places.city(t) + `<g transform="translate(560 ${GROUND - 150})"><rect width="110" height="150" rx="8" fill="#3d4466"/><rect x="15" y="18" width="80" height="50" fill="#7fd3ff"/><text x="55" y="50" text-anchor="middle" font-size="18" fill="#123">ATM</text><rect x="25" y="85" width="60" height="8" fill="#111"/><rect x="20" y="105" width="70" height="30" rx="4" fill="#59628a"/></g>`;
    },
    airport(t) {
      return `<rect x="0" y="40" width="800" height="${GROUND - 40}" ${v('house')} opacity=".5"/>
        <rect x="40" y="60" width="460" height="200" rx="${t === 'danger' ? 0 : 20}" fill="#bfe6ff" opacity=".85" stroke="var(--panel-line)" stroke-width="6"/>
        <g transform="translate(270 150)"><ellipse rx="130" ry="20" fill="#fff"/><path d="M-20 0 L-70 -60 L-40 -60 L30 0z" fill="#e8ecff"/><path d="M-20 0 L-70 60 L-40 60 L30 0z" fill="#e8ecff"/><path d="M-120 0 L-140 -36 L-110 -36 L-90 0z" fill="var(--accent)"/></g>
        <rect x="550" y="70" width="210" height="130" rx="10" fill="#1f2340"/><text x="655" y="100" text-anchor="middle" font-size="18" fill="#ffd23f" font-family="var(--font)">出境 DEPARTURE</text>
        <text x="570" y="132" font-size="15" fill="#9fe8ff" font-family="var(--font)">沙之城 SND 準時</text><text x="570" y="160" font-size="15" fill="#9fe8ff" font-family="var(--font)">遠方 FAR  登機中</text>
        ${ground(t)}`;
    },
    desert(t) {
      const camel = (x, k) => `<g transform="translate(${x} ${GROUND - 40}) scale(${k})" fill="#8a5a3a"><ellipse cx="0" cy="-30" rx="40" ry="20"/><circle cx="-10" cy="-50" r="14"/><rect x="-34" y="-20" width="7" height="40"/><rect x="24" y="-20" width="7" height="40"/><path d="M36 -36 Q60 -60 56 -80 L66 -80 Q72 -50 44 -26z"/></g>`;
      return ground('desert', GROUND) + camel(560, 1) + camel(680, .8) + camel(90, .7);
    },
    oasis(t) {
      const palm = (x) => `<g transform="translate(${x} ${GROUND})"><path d="M-6 0 Q0 -80 -8 -150 L4 -150 Q10 -80 6 0z" fill="#a8745a"/>
        <g fill="#3fbf6e"><path d="M0 -150 Q-60 -170 -90 -130 Q-50 -150 0 -145z"/><path d="M0 -150 Q60 -175 95 -130 Q50 -150 0 -145z"/><path d="M0 -150 Q-20 -200 -60 -205 Q-20 -180 0 -148z"/><path d="M0 -150 Q30 -200 70 -200 Q30 -175 0 -148z"/></g></g>`;
      return ground(t) + `<ellipse cx="400" cy="${GROUND + 22}" rx="170" ry="26" fill="#6ec6ff" opacity=".85"/>` + palm(170) + palm(630) + palm(720)
        + `<path d="M40 ${GROUND} L100 ${GROUND - 90} L160 ${GROUND}z" fill="#ffb347"/>`;
    },
    party(t) {
      let s = `<rect x="0" y="0" width="800" height="${GROUND}" fill="#140d2a" opacity=".55"/>`;
      const cols = ['#ff3d7f', '#9b5cff', '#3dd6ff', '#ffd23f'];
      for (let i = 0; i < 6; i++) s += `<polygon points="${100 + i * 120},0 ${60 + i * 120},${GROUND} ${160 + i * 120},${GROUND}" fill="${cols[i % 4]}" opacity=".12" class="twinkle" style="animation-delay:-${i * .4}s"/>`;
      s += `<circle cx="400" cy="40" r="26" fill="#c9c3ff" opacity=".7"/>`;
      s += `<rect x="300" y="${GROUND - 60}" width="200" height="16" rx="6" fill="#3b2a66"/><rect x="390" y="${GROUND - 44}" width="20" height="44" fill="#3b2a66"/>`;
      return s + ground(t);
    },
    spring(t) {
      let s = '';
      for (let i = 0; i < 5; i++) s += house(30 + i * 160, 100, 90 + (i % 2) * 40, t === 'dream' ? 'desert' : t, i);
      s += `<g transform="translate(400 ${GROUND - 10})"><ellipse rx="120" ry="22" fill="#6ec6ff"/><ellipse rx="90" ry="14" fill="#bfe6ff"/>
        <polygon points="0,-110 12,-80 44,-80 18,-60 28,-28 0,-46 -28,-28 -18,-60 -44,-80 -12,-80" fill="#ffe36e" class="twinkle"/></g>`;
      return ground('desert') + s;
    },
    cell(t) {
      let s = `<rect x="0" y="0" width="800" height="${GROUND}" fill="#565c66" opacity=".6"/><rect x="560" y="70" width="110" height="80" fill="#2c3038"/>`;
      for (let i = 0; i < 4; i++) s += `<rect x="${572 + i * 26}" y="70" width="6" height="80" fill="#9aa3b2"/>`;
      for (let i = 0; i < 12; i++) s += `<rect x="${i * 70}" y="0" width="10" height="${H}" fill="#2c3038" opacity=".85"/>`;
      return s + ground('gray');
    },
    station(t) {
      return `<rect x="0" y="0" width="800" height="${GROUND}" ${v('house')} opacity=".55"/>
        <rect x="260" y="40" width="280" height="60" rx="30" fill="#2f5fbf"/><text x="400" y="80" text-anchor="middle" font-size="28" fill="#fff" font-family="var(--font)">警察局 ★ 110</text>
        <rect x="80" y="${GROUND - 90}" width="640" height="90" rx="18" ${v('roof')} opacity=".8"/>${ground(t)}`;
    },
    plaza(t) {
      return places.city(t, '綠洲夜市') + `<rect x="330" y="${GROUND - 140}" width="12" height="140" fill="#59628a"/><circle cx="336" cy="${GROUND - 146}" r="16" fill="#ffd23f" opacity=".85"/>`;
    },
    tree(t) {
      return house(40, 100, 110, t, 0) + house(660, 110, 120, t, 1) + tree(400, t, 1.35) + ground(t)
        + `<path d="M370 ${GROUND + 4} q30 -16 60 0" stroke="#a8745a" stroke-width="6" fill="none"/>`;
    },
    void(t) { return ground(t); }
  };

  /* ---------------- 道具 ---------------- */
  const props = {
    phone: (o) => `<g transform="translate(${o.x} ${o.y}) rotate(-8)"><rect x="-26" y="-46" width="52" height="92" rx="10" fill="#2c2440"/><rect x="-21" y="-38" width="42" height="72" rx="4" fill="${o.screen || '#ffd6ea'}"/>
      ${o.icon === 'chart' ? '<polyline points="-15,20 -5,8 4,14 16,-14" fill="none" stroke="#2fbf71" stroke-width="4"/><text x="0" y="-18" text-anchor="middle" font-size="11" fill="#2fbf71">+38%</text>' : '<path d="M0 10 l-12 -12 a7 7 0 0 1 12 -10 a7 7 0 0 1 12 10z" fill="#ff5c9a"/>'}</g>`,
    suitcase: (o) => `<g transform="translate(${o.x} ${o.y})"><rect x="-40" y="-70" width="80" height="70" rx="10" fill="${o.dark ? '#3b2a66' : '#ff9b3d'}"/><rect x="-14" y="-84" width="28" height="16" rx="6" fill="none" stroke="#4a3048" stroke-width="5"/><rect x="-40" y="-45" width="80" height="8" fill="#00000033"/>
      ${o.dark ? '<circle cx="24" cy="-20" r="5" fill="#ff3d7f" class="twinkle"/>' : ''}</g>`,
    card: (o) => `<g transform="translate(${o.x} ${o.y}) rotate(10)"><rect x="-34" y="-22" width="68" height="44" rx="6" fill="#7fd3ff"/><rect x="-26" y="-10" width="16" height="12" rx="2" fill="#ffd23f"/><rect x="-26" y="8" width="44" height="5" fill="#2c2440" opacity=".5"/></g>`,
    money: (o) => `<g transform="translate(${o.x} ${o.y})"><path d="M-30 0 Q-36 -40 -12 -50 L12 -50 Q36 -40 30 0z" fill="#ffd23f"/><rect x="-14" y="-60" width="28" height="12" rx="4" fill="#e8a93a"/><text y="-14" text-anchor="middle" font-size="22" fill="#8a5a1a">$</text></g>`,
    stones: (o) => `<g transform="translate(${o.x} ${o.y})"><circle cx="-14" r="13" fill="#fff" stroke="#b896ff" stroke-width="3"/><circle cx="16" r="13" fill="#3b2a66" stroke="#b896ff" stroke-width="3"/><circle cx="-18" cy="-4" r="4" fill="#fff" opacity=".9"/><circle cx="12" cy="-4" r="4" fill="#9b8cff" opacity=".8"/></g>`,
    coffee: (o) => `<g transform="translate(${o.x} ${o.y})">${[0, 1, 2].map(i => `<g transform="translate(${i * 30 - 30} 0) rotate(${i * 8 - 8})"><rect x="-12" y="-30" width="24" height="30" rx="3" fill="${['#ff9cc6', '#ffd23f', '#7fd3ff'][i]}"/><circle cy="-15" r="6" fill="#fff"/><circle cx="-2" cy="-16" r="1.4" fill="#4a3048"/><circle cx="2" cy="-16" r="1.4" fill="#4a3048"/></g>`).join('')}</g>`,
    stick: (o) => `<g transform="translate(${o.x} ${o.y}) rotate(-30)"><rect x="-4" y="-70" width="8" height="70" rx="3" fill="#2c3038"/><rect x="-6" y="-20" width="12" height="22" rx="3" fill="#59628a"/></g>`,
    ticket: (o) => `<g transform="translate(${o.x} ${o.y}) rotate(-6)"><rect x="-44" y="-22" width="88" height="44" rx="8" fill="#fff" stroke="var(--accent)" stroke-width="3"/><text y="6" text-anchor="middle" font-size="14" fill="#6b3b5a" font-family="var(--font)">沙之城 ✦</text></g>`,
    box: (o) => `<g transform="translate(${o.x} ${o.y})"><rect x="-40" y="-40" width="80" height="40" rx="6" fill="#c98a4b"/><rect x="-44" y="-52" width="88" height="16" rx="6" fill="#e0a565"/><circle cy="-30" r="6" fill="#ffd23f"/>
      <g class="twinkle"><circle cx="-30" cy="-70" r="4" fill="#ffe36e"/><circle cx="26" cy="-80" r="5" fill="#ffe36e"/><circle cx="0" cy="-92" r="3" fill="#fff"/></g></g>`,
    letter: (o) => `<g transform="translate(${o.x} ${o.y}) rotate(4)"><rect x="-34" y="-24" width="68" height="48" rx="4" fill="#fff8ea" stroke="#e0a565" stroke-width="2"/><path d="M-34 -24 L0 4 L34 -24" fill="none" stroke="#e0a565" stroke-width="2"/><path d="M0 -2 l-6 -6 a4 4 0 0 1 6 -5 a4 4 0 0 1 6 5z" fill="#ff6f91"/></g>`,
    camera: (o) => `<g transform="translate(${o.x} ${o.y})"><rect x="-30" y="-20" width="60" height="40" rx="8" fill="#2c2440"/><circle r="12" fill="#7fd3ff"/><circle cx="20" cy="-12" r="4" fill="#ff3d7f" class="twinkle"/></g>`,
    heart: (o) => `<g transform="translate(${o.x} ${o.y})" class="twinkle"><path d="M0 14 l-16 -16 a10 10 0 0 1 16 -14 a10 10 0 0 1 16 14z" fill="#ff6f91"/></g>`
  };

  /* ---------------- 角色 ---------------- */
  const CAST = {
    hero_f: { hair: 'long', hairC: '#8a5a44', top: '#ff9cc6', bottom: '#7a6cc9', name: '主角' },
    hero_m: { hair: 'short', hairC: '#4a3a5a', top: '#7fb2ff', bottom: '#4a4f7a', name: '主角' },
    grandma: { hair: 'bun', hairC: '#d9d4e0', top: '#b896ff', bottom: '#8a76c9', acc: 'glasses', skin: '#ffe6d6' },
    owner: { hair: 'short', hairC: '#7a6a5a', top: '#8fdc9f', bottom: '#6b5a4a', acc: 'beard' },
    ash: { hair: 'long', hairC: '#dfe6ff', top: '#ffffff', bottom: '#cfd8ff', holo: true },
    tima: { hair: 'long', hairC: '#3a2a2a', top: '#2fbf71', bottom: '#ffb347', acc: 'hat', skin: '#f0c8a8' },
    che: { hair: 'cap', hairC: '#2c2440', top: '#3b2a66', bottom: '#20243d' },
    max: { hair: 'short', hairC: '#1c1c28', top: '#2c3038', bottom: '#1c1c28', acc: 'shades' },
    hao: { hair: 'short', hairC: '#3a2a20', top: '#ff8a65', bottom: '#4a4f7a', acc: 'band' },
    lulu: { hair: 'long', hairC: '#c98a5a', top: '#ffd23f', bottom: '#ff9cc6', acc: 'deer' },
    alchemist: { hair: 'hood', hairC: '#6a3fc0', top: '#6a3fc0', bottom: '#4a2a8a', acc: 'flask' },
    officer: { hair: 'police', hairC: '#2f5fbf', top: '#2f5fbf', bottom: '#20356b' },
    stranger: { hair: 'hood', hairC: '#59628a', top: '#59628a', bottom: '#3d4466' },
    crowd: { hair: 'cap', hairC: '#20243d', top: '#20243d', bottom: '#151a2e', silhouette: true }
  };

  function face(mood, cx, cy) {
    const L = LINE;
    let eyes, mouth, brows = '', extra = '';
    switch (mood) {
      case 'happy':
        eyes = `<path d="M${cx - 22} ${cy} q8 -10 16 0 M${cx + 6} ${cy} q8 -10 16 0" stroke="${L}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
        mouth = `<path d="M${cx - 8} ${cy + 16} q8 10 16 0" stroke="${L}" stroke-width="3.5" fill="#ff8fa8" stroke-linecap="round"/>`;
        break;
      case 'worried':
        eyes = `<ellipse cx="${cx - 14}" cy="${cy + 2}" rx="6" ry="8" fill="${L}"/><ellipse cx="${cx + 14}" cy="${cy + 2}" rx="6" ry="8" fill="${L}"/><circle cx="${cx - 12}" cy="${cy - 1}" r="2.2" fill="#fff"/><circle cx="${cx + 16}" cy="${cy - 1}" r="2.2" fill="#fff"/>`;
        brows = `<path d="M${cx - 22} ${cy - 16} l12 4 M${cx + 22} ${cy - 16} l-12 4" stroke="${L}" stroke-width="3" stroke-linecap="round"/>`;
        mouth = `<path d="M${cx - 8} ${cy + 20} q4 -4 8 0 t8 0" stroke="${L}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
        extra = `<path d="M${cx + 34} ${cy - 18} q4 8 0 12 q-4 -4 0 -12z" fill="#7fd3ff"/>`;
        break;
      case 'sad':
        eyes = `<path d="M${cx - 22} ${cy + 2} q8 6 16 0 M${cx + 6} ${cy + 2} q8 6 16 0" stroke="${L}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
        brows = `<path d="M${cx - 22} ${cy - 10} l12 -4 M${cx + 22} ${cy - 10} l-12 -4" stroke="${L}" stroke-width="3" stroke-linecap="round"/>`;
        mouth = `<path d="M${cx - 7} ${cy + 22} q7 -8 14 0" stroke="${L}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
        extra = `<path d="M${cx - 16} ${cy + 8} q-3 10 0 14 q3 -4 0 -14z" fill="#7fd3ff"/>`;
        break;
      case 'shock':
        eyes = `<circle cx="${cx - 14}" cy="${cy}" r="7" fill="#fff" stroke="${L}" stroke-width="3"/><circle cx="${cx + 14}" cy="${cy}" r="7" fill="#fff" stroke="${L}" stroke-width="3"/><circle cx="${cx - 14}" cy="${cy}" r="2.5" fill="${L}"/><circle cx="${cx + 14}" cy="${cy}" r="2.5" fill="${L}"/>`;
        mouth = `<ellipse cx="${cx}" cy="${cy + 20}" rx="6" ry="8" fill="${L}"/>`;
        break;
      case 'smirk':
        eyes = `<path d="M${cx - 22} ${cy} h14 M${cx + 8} ${cy} h14" stroke="${L}" stroke-width="4" stroke-linecap="round"/>`;
        mouth = `<path d="M${cx - 8} ${cy + 18} q10 4 16 -6" stroke="${L}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
        break;
      default:
        eyes = `<ellipse cx="${cx - 14}" cy="${cy}" rx="6" ry="8" fill="${L}"/><ellipse cx="${cx + 14}" cy="${cy}" rx="6" ry="8" fill="${L}"/><circle cx="${cx - 12}" cy="${cy - 3}" r="2.4" fill="#fff"/><circle cx="${cx + 16}" cy="${cy - 3}" r="2.4" fill="#fff"/>`;
        mouth = `<path d="M${cx - 6} ${cy + 17} q6 6 12 0" stroke="${L}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    }
    const blush = mood === 'sad' || mood === 'smirk' ? '' : `<ellipse cx="${cx - 26}" cy="${cy + 12}" rx="7" ry="4" fill="#ff8fb3" opacity=".6"/><ellipse cx="${cx + 26}" cy="${cy + 12}" rx="7" ry="4" fill="#ff8fb3" opacity=".6"/>`;
    return brows + eyes + blush + mouth + extra;
  }

  function chibi(def, mood) {
    const skin = def.skin || '#ffe1cf';
    const hy = -128; // 頭中心
    let back = '', front = '';
    switch (def.hair) {
      case 'long':
        back = `<path d="M-46 ${hy} q0 -50 46 -50 q46 0 46 50 v70 q-10 10 -20 0 v-40 h-52 v40 q-10 10 -20 0z" fill="${def.hairC}"/>`;
        front = `<path d="M-46 ${hy - 2} q4 -48 46 -48 q42 0 46 48 q-20 -8 -30 -26 q-12 18 -34 20 q-16 2 -28 6z" fill="${def.hairC}"/>`;
        break;
      case 'short':
        front = `<path d="M-46 ${hy - 4} q2 -46 46 -46 q44 0 46 46 q-14 -10 -24 -22 q-6 12 -22 14 q-20 2 -46 8z" fill="${def.hairC}"/><path d="M0 ${hy - 50} q6 -18 18 -14 q-12 4 -10 16z" fill="${def.hairC}"/>`;
        break;
      case 'bun':
        back = `<circle cx="0" cy="${hy - 50}" r="20" fill="${def.hairC}"/>`;
        front = `<path d="M-46 ${hy - 2} q2 -46 46 -46 q44 0 46 46 q-24 -16 -46 -18 q-22 2 -46 18z" fill="${def.hairC}"/>`;
        break;
      case 'cap':
        front = `<path d="M-48 ${hy - 10} q4 -42 48 -42 q44 0 48 42z" fill="${def.hairC}"/><rect x="-6" y="${hy - 16}" width="70" height="10" rx="5" fill="${def.hairC}"/>`;
        break;
      case 'police':
        front = `<path d="M-46 ${hy - 14} q0 -36 46 -36 q46 0 46 36z" fill="${def.hairC}"/><rect x="-50" y="${hy - 18}" width="100" height="10" rx="5" fill="#20356b"/><circle cx="0" cy="${hy - 32}" r="7" fill="#ffd23f"/>`;
        break;
      case 'hood':
        back = `<path d="M-56 ${hy + 30} q-6 -88 56 -88 q62 0 56 88z" fill="${def.hairC}"/>`;
        front = `<path d="M-50 ${hy + 10} q0 -62 50 -62 q50 0 50 62 q-8 -40 -50 -42 q-42 2 -50 42z" fill="${def.hairC}"/>`;
        break;
    }
    let acc = '';
    if (def.acc === 'glasses') acc = `<circle cx="-14" cy="${hy}" r="11" fill="none" stroke="${LINE}" stroke-width="2.5"/><circle cx="14" cy="${hy}" r="11" fill="none" stroke="${LINE}" stroke-width="2.5"/><line x1="-3" y1="${hy}" x2="3" y2="${hy}" stroke="${LINE}" stroke-width="2.5"/>`;
    if (def.acc === 'shades') acc = `<rect x="-30" y="${hy - 8}" width="26" height="14" rx="5" fill="#111"/><rect x="4" y="${hy - 8}" width="26" height="14" rx="5" fill="#111"/><line x1="-4" y1="${hy - 2}" x2="4" y2="${hy - 2}" stroke="#111" stroke-width="3"/>`;
    if (def.acc === 'beard') acc = `<path d="M-30 ${hy + 18} q30 36 60 0 q-10 8 -30 8 q-20 0 -30 -8z" fill="${def.hairC}"/>`;
    if (def.acc === 'band') acc = `<rect x="-46" y="${hy - 26}" width="92" height="10" rx="5" fill="#ff3d3d"/>`;
    if (def.acc === 'hat') acc = `<ellipse cx="0" cy="${hy - 38}" rx="54" ry="10" fill="#2fbf71"/><path d="M-30 ${hy - 38} q0 -30 30 -30 q30 0 30 30z" fill="#2fbf71"/><circle cx="22" cy="${hy - 48}" r="6" fill="#ff6f91"/>`;
    if (def.acc === 'deer') acc = `<path d="M-30 ${hy - 40} l-8 -22 l6 4 l2 -10 l6 12z M30 ${hy - 40} l8 -22 l-6 4 l-2 -10 l-6 12z" fill="#a8745a"/>`;
    const flask = def.acc === 'flask' ? `<g transform="translate(40 -60)"><rect x="-5" y="-26" width="10" height="12" fill="#cfd8ff"/><path d="M-5 -14 L-16 6 Q-16 12 -10 12 L10 12 Q16 12 16 6 L5 -14z" fill="#8fe3a3" stroke="#fff" stroke-width="2"/><circle cx="0" cy="-36" r="4" fill="#ffe36e" class="twinkle"/></g>` : '';

    const body = `
      <rect x="-22" y="-34" width="16" height="34" rx="7" fill="${def.bottom}"/><rect x="6" y="-34" width="16" height="34" rx="7" fill="${def.bottom}"/>
      <ellipse cx="-14" cy="0" rx="13" ry="6" fill="${LINE}"/><ellipse cx="14" cy="0" rx="13" ry="6" fill="${LINE}"/>
      <rect x="-30" y="-86" width="60" height="58" rx="22" fill="${def.top}"/>
      <ellipse cx="-36" cy="-58" rx="9" ry="17" fill="${def.top}"/><ellipse cx="36" cy="-58" rx="9" ry="17" fill="${def.top}"/>
      <circle cx="-38" cy="-42" r="7" fill="${skin}"/><circle cx="38" cy="-42" r="7" fill="${skin}"/>`;
    const head = `<circle cx="0" cy="${hy}" r="46" fill="${skin}"/>`;
    const inner = back + body + head + face(mood, 0, hy + 6) + front + acc + flask;
    if (def.silhouette) return `<g opacity=".85" style="filter:brightness(.25)">${inner}</g>`;
    if (def.holo) return `<g class="holo" opacity=".85">${inner}<circle cx="-50" cy="-170" r="4" fill="#bfe6ff"/><circle cx="54" cy="-120" r="3" fill="#bfe6ff"/><circle cx="40" cy="-190" r="5" fill="#fff"/></g>`;
    return inner;
  }

  function robot(mood) {
    const eyes = mood === 'sad'
      ? `<path d="M-20 -94 q8 6 16 0 M6 -94 q8 6 16 0" stroke="#7fffd4" stroke-width="4" fill="none" stroke-linecap="round"/>`
      : `<path d="M-20 -92 q8 -10 16 0 M6 -92 q8 -10 16 0" stroke="#7fffd4" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    return `<g>
      <circle cx="-26" cy="-6" r="10" fill="#6b5a8a"/><circle cx="26" cy="-6" r="10" fill="#6b5a8a"/>
      <circle cx="0" cy="-58" r="56" fill="#d8ccff" stroke="#9a86d6" stroke-width="4"/>
      <rect x="-36" y="-112" width="72" height="44" rx="18" fill="#2c2440"/>${eyes}
      <path d="M-10 -78 q10 6 20 0" stroke="#7fffd4" stroke-width="3" fill="none"/>
      <line x1="0" y1="-114" x2="0" y2="-138" stroke="#9a86d6" stroke-width="4"/>
      <polygon points="0,-152 4,-142 14,-142 6,-136 9,-126 0,-132 -9,-126 -6,-136 -14,-142 -4,-142" fill="#ffe36e" class="twinkle"/>
      <circle cx="-30" cy="-30" r="5" fill="#9a86d6"/><circle cx="34" cy="-40" r="4" fill="#b8a64a"/>
      <ellipse cx="-58" cy="-56" rx="10" ry="18" fill="#c4b6f5"/><ellipse cx="58" cy="-56" rx="10" ry="18" fill="#c4b6f5"/></g>`;
  }

  function character(c, gender) {
    const id = c.id === 'hero' ? `hero_${gender}` : c.id;
    const art = id === 'salem' ? robot(c.mood) : chibi(CAST[id] || CAST.stranger, c.mood || 'normal');
    const k = c.scale || 1;
    const flip = c.flip ? -1 : 1;
    return `<g transform="translate(${c.x} ${c.y != null ? c.y : GROUND + 6}) scale(${k * flip} ${k})"><g class="bob${c.delay ? ' d2' : ''}">${art}</g></g>`;
  }

  function render(spec, theme, gender) {
    const t = theme;
    const place = places[spec.place] || places.void;
    const chars = (spec.chars || []);
    const n = chars.length;
    let charSvg = '';
    chars.forEach((c, i) => {
      const x = c.x != null ? c.x : (n === 1 ? 400 : 230 + i * (340 / Math.max(1, n - 1)));
      charSvg += character(Object.assign({ delay: i % 2 }, c, { x }), gender);
    });
    const propSvg = (spec.props || []).map(p => (props[p.id] ? props[p.id](p) : '')).join('');
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${spec.alt || '場景插畫'}">
      ${sky(t)}${deco(t)}${place(t)}${propSvg}${charSvg}</svg>`;
  }

  // 單獨角色（標題、角色選擇用）
  function portrait(id, mood, gender) {
    return `<svg viewBox="-80 -200 160 210" xmlns="http://www.w3.org/2000/svg">${character({ id, mood, x: 0, y: 0 }, gender)}</svg>`;
  }

  window.SCENES = { render, portrait, CAST };
})();
