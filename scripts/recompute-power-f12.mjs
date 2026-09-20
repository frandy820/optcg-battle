// F12 战力系统重排（一次性工具，2026-09-20）：全池 char 卡 power 按定稿公式重算
// 公式（规格勿改）：
//   base = (cost + 1) * 1000
//   扣减 = keywords.length * 1000 + (effect !== null ? 1000 : 0)
//   power = clamp(base - 扣减, max(cost*1000, base-2000), base)
// 注：max(cost*1000, base-2000) 中 base-2000=(cost-1)*1000 恒 <= cost*1000，故下限取 cost*1000
//   —— 与执行清单第 2 条窗口 [max(cost*1000,(cost+1)*1000-2000), (cost+1)*1000] 一致。
// 三处同步（铁律）：data/cards.json（1空格） / data/cards-pool3.json（2空格） / data/pool3/{color}.json（2空格）
// 用法：node scripts/recompute-power-f12.mjs --dry   # 只统计不落盘
//       node scripts/recompute-power-f12.mjs         # 重算并写入三个数据源
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DRY = process.argv.includes('--dry');
const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'black'];

// ---- 公式真值源（check-pool3.js 的窗口校验与此同构）----
export function formulaPower(c) {
  const base = (c.cost + 1) * 1000;
  const deduct = (c.keywords || []).length * 1000 + (c.effect ? 1000 : 0);
  const lo = Math.max(c.cost * 1000, base - 2000);
  return Math.max(lo, Math.min(base, base - deduct));
}

const changed = [];   // {id, cost, color, old, nu, kind}
const stats = { files: {}, byCost: {}, byColor: {}, direction: { up: 0, down: 0, same: 0 } };

function recompute(cards, fileLabel) {
  let n = 0;
  for (const c of cards) {
    if (c.type !== 'char') continue;
    const nu = formulaPower(c);
    if (nu !== c.power) {
      changed.push({ id: c.id, cost: c.cost, color: c.color, old: c.power, nu, kw: (c.keywords || []).length, eff: c.effect ? 1 : 0 });
      stats.direction[nu > c.power ? 'up' : 'down']++;
      c.power = nu;
      n++;
    } else {
      stats.direction.same++;
    }
    stats.byCost[c.cost] = stats.byCost[c.cost] || { total: 0, ['0']: 0 };
    stats.byCost[c.cost].total++;
  }
  stats.files[fileLabel] = n;
  return n;
}

// ---- 1. 主库 data/cards.json（1 空格缩进）----
const cardsPath = join(ROOT, 'data', 'cards.json');
const main = JSON.parse(readFileSync(cardsPath, 'utf8'));
const nMain = recompute(main.cards, 'data/cards.json');

// ---- 2/3. pool3 合并源 + 六色分源（2 空格缩进）----
const p3Path = join(ROOT, 'data', 'cards-pool3.json');
const p3 = JSON.parse(readFileSync(p3Path, 'utf8'));
const nP3 = recompute(p3, 'data/cards-pool3.json');

const colorFiles = [];
for (const col of COLORS) {
  const p = join(ROOT, 'data', 'pool3', `${col}.json`);
  const arr = JSON.parse(readFileSync(p, 'utf8'));
  const n = recompute(arr, `data/pool3/${col}.json`);
  colorFiles.push([p, arr]);
  void n;
}

// ---- 一致性自检：pool3 卡与主库重算后必须同值（同公式=确定性，逐 id 对账）----
const mainById = new Map(main.cards.map((c) => [c.id, c.power]));
for (const [c, label] of [...p3.map((c) => [c, 'cards-pool3']), ...colorFiles.flatMap(([p, arr]) => arr.map((c) => [c, p]))]) {
  if (c.type !== 'char') continue;
  if (mainById.get(c.id) !== c.power) { console.error(`FATAL 同步断裂 ${c.id}: ${label}=${c.power} 主库=${mainById.get(c.id)}`); process.exit(1); }
}

// ---- 分布统计 ----
const dist = {};
for (const c of main.cards) {
  if (c.type !== 'char') continue;
  dist[c.cost] = dist[c.cost] || {};
  dist[c.cost][c.power] = (dist[c.cost][c.power] || 0) + 1;
}

console.log(`重算完成（DRY=${DRY}）：主库改动 ${nMain} 张 / pool3 合并源 ${nP3} 张（均在主库内）`);
console.log(`方向：up ${stats.direction.up} / down ${stats.direction.down} / 不变 ${stats.direction.same}`);
for (const cost of Object.keys(dist).sort((a, b) => a - b)) {
  const vals = Object.entries(dist[cost]).map(([p, n]) => `${(+p / 1000).toFixed(0)}K×${n}`).join(' ');
  console.log(`  cost${cost}: ${vals}`);
}
// 每色战力总量变化（平衡方向预判：总量降=该色变弱）
const colorDelta = {};
const raw = JSON.parse(readFileSync(cardsPath, 'utf8'));
for (const c of raw.cards) {
  if (c.type !== 'char') continue;
  colorDelta[c.color] = (colorDelta[c.color] || 0) + (formulaPower(c) - c.power);
}
console.log('每色 char 战力总量变化：', JSON.stringify(colorDelta));

if (!DRY) {
  writeFileSync(cardsPath, JSON.stringify(main, null, 1) + '\n', 'utf8');
  writeFileSync(p3Path, JSON.stringify(p3, null, 2) + '\n', 'utf8');
  for (const [p, arr] of colorFiles) writeFileSync(p, JSON.stringify(arr, null, 2) + '\n', 'utf8');
  console.log(`已写入：cards.json / cards-pool3.json / pool3/{${COLORS.join(',')}}.json`);
  console.log('改动明细（id old→new [kw,eff]）：');
  for (const ch of changed) console.log(`  ${ch.id} ${ch.old}→${ch.nu} kw${ch.kw} eff${ch.eff}`);
}
