// F12 平衡微调落盘（一次性，2026-09-20）：把 data/power-tuned.json 的 10 张微调 power
// 同步写入三处数据源（铁律：cards.json 1空格 / cards-pool3.json 2空格 / pool3/{color}.json 2空格）。
// 微调约束：仅 char、调后仍在 [cost*1000,(cost+1)*1000] 窗内、1000 步进。
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const tuned = JSON.parse(readFileSync(join(ROOT, 'data', 'power-tuned.json'), 'utf8')).tuned;
const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'black'];

function apply(cards, label) {
  let n = 0;
  for (const c of cards) {
    const t = tuned[c.id];
    if (!t) continue;
    if (c.type !== 'char') { console.error(`FATAL ${c.id} 非 char`); process.exit(1); }
    const base = (c.cost + 1) * 1000, lo = c.cost * 1000;
    if (t.power < lo || t.power > base || t.power % 1000) { console.error(`FATAL ${c.id} 微调值 ${t.power} 越窗 [${lo},${base}]`); process.exit(1); }
    console.log(`${label}: ${c.id} ${c.power}→${t.power}`);
    c.power = t.power;
    n++;
  }
  return n;
}

const cardsPath = join(ROOT, 'data', 'cards.json');
const main = JSON.parse(readFileSync(cardsPath, 'utf8'));
const n1 = apply(main.cards, 'cards.json');

const p3Path = join(ROOT, 'data', 'cards-pool3.json');
const p3 = JSON.parse(readFileSync(p3Path, 'utf8'));
const n2 = apply(p3, 'cards-pool3.json');

let n3 = 0;
for (const col of COLORS) {
  const p = join(ROOT, 'data', 'pool3', `${col}.json`);
  const arr = JSON.parse(readFileSync(p, 'utf8'));
  n3 += apply(arr, `pool3/${col}.json`);
  writeFileSync(p, JSON.stringify(arr, null, 2) + '\n', 'utf8');
}
const covered = new Set([...main.cards, ...p3].map((c) => c.id));
for (const id of Object.keys(tuned)) if (!covered.has(id)) { console.error(`FATAL 微调表含未知卡 ${id}`); process.exit(1); }
if (n1 !== Object.keys(tuned).length) { console.error(`FATAL 主库仅命中 ${n1}/${Object.keys(tuned).length} 张`); process.exit(1); }

writeFileSync(cardsPath, JSON.stringify(main, null, 1) + '\n', 'utf8');
writeFileSync(p3Path, JSON.stringify(p3, null, 2) + '\n', 'utf8');
console.log(`落盘完成：主库 ${n1} 张，pool3 合并源 ${n2} 张，分色源 ${n3} 张`);
