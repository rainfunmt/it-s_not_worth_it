// 劇情圖檢查：node tools/validate.js
// 窮舉所有選擇路徑，確認節點連結有效、每個轉折點都剛好 3 個選項、所有結局都能到達。
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ['js/cases.js', 'js/story.js']) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
const { STORY, CASES } = ctx.window;

const errors = [];
const reached = new Set();
const endingCount = {};
const tpOptionIds = {};
let paths = 0;

function apply(s, effects, flags) {
  if (effects) for (const k in effects) s.stats[k] = Math.max(0, (s.stats[k] || 0) + effects[k]);
  if (flags) Object.assign(s.flags, flags);
}
const clone = (o) => JSON.parse(JSON.stringify(o));

function walk(id, s, trail, depth) {
  if (depth > 200) { errors.push(`疑似無限迴圈：${trail.join(' → ')}`); return; }
  const node = STORY.nodes[id];
  if (!node) { errors.push(`找不到節點 "${id}"（路徑：${trail.join(' → ')}）`); return; }
  reached.add(id);
  apply(s, node.effects, node.flags);
  if (node.ending) {
    if (!STORY.endings[node.ending]) errors.push(`節點 ${id} 的結局 "${node.ending}" 沒有定義`);
    endingCount[node.ending] = (endingCount[node.ending] || 0) + 1;
    paths++;
    return;
  }
  if (node.tp) {
    const opts = STORY.resolveOptions(node, s);
    if (opts.length !== 3) errors.push(`${id} 在狀態 ${JSON.stringify(s.stats)} 下有 ${opts.length} 個選項`);
    const ids = new Set();
    for (const o of opts) {
      if (!o || !o.text || !o.next || !o.tag) { errors.push(`${id} 有不完整的選項：${JSON.stringify(o)}`); continue; }
      if (ids.has(o.id)) errors.push(`${id} 選項 id 重複：${o.id}`);
      ids.add(o.id);
      (tpOptionIds[node.tp] = tpOptionIds[node.tp] || new Set()).add(o.id);
      const s2 = clone(s);
      apply(s2, o.effects, o.flags);
      walk(o.next, s2, trail.concat(`${id}[${o.id}]`), depth + 1);
    }
    return;
  }
  const next = STORY.resolveNext(node, s);
  if (!next) { errors.push(`${id} 沒有 next`); return; }
  walk(next, s, trail.concat(id), depth + 1);
}

walk(STORY.start, { stats: { heart: 1, alert: 1, bond: 1, coin: 1, shadow: 0 }, flags: {} }, [], 0);

for (const id of Object.keys(STORY.nodes)) if (!reached.has(id)) errors.push(`節點 ${id} 永遠到不了`);
for (const k of Object.keys(STORY.endings)) {
  if (!endingCount[k]) errors.push(`結局 ${k} 永遠到不了`);
  for (const c of STORY.endings[k].cases) if (!CASES.cards[c]) errors.push(`結局 ${k} 引用不存在的案例卡 ${c}`);
  for (const h of STORY.endings[k].hotlines) if (!CASES.hotlines.find(x => x.num === h)) errors.push(`結局 ${k} 引用不存在的專線 ${h}`);
}
for (const id in STORY.nodes) for (const c of STORY.nodes[id].cases || []) if (!CASES.cards[c]) errors.push(`${id} 引用不存在的案例卡 ${c}`);

console.log(`節點 ${Object.keys(STORY.nodes).length} 個，可到達 ${reached.size} 個，完整路徑 ${paths} 條`);
console.log('各結局路徑數：', endingCount);
console.log('各轉折點出現過的選項：', Object.fromEntries(Object.entries(tpOptionIds).map(([k, v]) => [k, v.size])));
if (errors.length) {
  console.error(`\n❌ ${errors.length} 個問題：`);
  [...new Set(errors)].slice(0, 40).forEach(e => console.error(' - ' + e));
  process.exit(1);
}
console.log('\n✅ 劇情圖檢查通過');
