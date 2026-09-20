// F12 微调实验台（dev-only，不落盘）：在内存里给指定卡 ±1000，跑指定 matchup 看敏感度
// 用法：node scripts/tune-f12.mjs "BLUE-07:+1000,GREEN-13:-1000" red:blue red:green ... [games]
//   第一参数 = 覆盖表；其余参数 = colorA:colorB 对（缺省跑 15 非镜像全表）；局数取末尾数字参数
import { pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
await import(pathToFileURL(join(ROOT, 'web', 'app.bundle.js')).href);
const O = globalThis.OPTCG;

const args = process.argv.slice(2);
const overrides = new Map();
if (args[0] && args[0].includes(':')) {
  for (const part of args[0].split(',')) {
    const [id, delta] = part.split(':');
    overrides.set(id, Number(delta));
  }
}
const gamesArg = args.find((a) => /^\d+$/.test(a));
const GAMES = gamesArg ? Number(gamesArg) : 30;
const pairs = args.slice(1).filter((a) => a.includes(':') && !/^\d+$/.test(a)).map((a) => a.split(':'));

// 内存池 + 覆盖（校验：目标必须是 char、调后仍在窗内）
const pool = { leaders: O.POOL.leaders, cards: O.POOL.cards.map((c) => ({ ...c })) };
const byId = new Map(pool.cards.map((c) => [c.id, c]));
for (const [id, delta] of overrides) {
  const c = byId.get(id);
  if (!c) { console.error(`FATAL 覆盖卡 ${id} 不存在`); process.exit(1); }
  if (c.type !== 'char') { console.error(`FATAL ${id} 非 char`); process.exit(1); }
  const nu = c.power + delta;
  const base = (c.cost + 1) * 1000, lo = c.cost * 1000;
  if (nu < lo || nu > base || nu % 1000) { console.error(`FATAL ${id} 调后 ${nu} 越窗 [${lo},${base}]`); process.exit(1); }
  c.power = nu;
}
if (overrides.size) console.log(`覆盖 ${overrides.size} 张：${[...overrides.entries()].map(([i, d]) => i + (d > 0 ? '+' : '') + d / 1000 + 'K').join(' ')}`);

const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'black'];
const CN = { red: '红', blue: '蓝', green: '绿', yellow: '黄', purple: '紫', black: '黑' };
const targets = pairs.length ? pairs : COLORS.flatMap((a, i) => COLORS.slice(i + 1).map((b) => [a, b]));

function fnv(str) { let h = 0x811c9dc5; for (const ch of str) { h ^= ch.charCodeAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h >>> 0; }
const STALL = 900;
function playOnce(c0, c1, seed) {
  const l0 = pool.leaders.find((l) => l.color === c0), l1 = pool.leaders.find((l) => l.color === c1);
  const s = O.newGame({ leaderA: l0, deckA: O.deckOf(pool, c0), leaderB: l1, deckB: O.deckOf(pool, c1), seed });
  const a0 = O.createAI('normal', O.makeRng(seed * 2 + 1)), a1 = O.createAI('normal', O.makeRng(seed * 2 + 2));
  let steps = 0;
  while (s.winner === null && s.turn <= 300 && steps < STALL) {
    const acts = O.listActions(s);
    if (!acts.length) return { winner: null, stalled: true };
    const ai = s.pending ? (s.pending.target.side === 0 ? a0 : a1) : (s.active === 0 ? a0 : a1);
    const a = ai.choose(s, acts);
    if (!a) return { winner: null, stalled: true };
    O.applyAction(s, a); steps++;
  }
  return { winner: s.winner, stalled: s.winner === null };
}
function matchup(a, b, tag) {
  const base0 = fnv(`${tag}:${a}:${b}`) % 100000;
  let w = 0, st = 0;
  for (let g = 0; g < GAMES; g++) {
    const seed = base0 + g * 7 + 1;
    const af = g % 2 === 0;
    const r = af ? playOnce(a, b, seed) : playOnce(b, a, seed);
    if (r.stalled) { st++; continue; }
    const wc = r.winner === 0 ? (af ? a : b) : (af ? b : a);
    if (wc === a) w++;
  }
  return { rate: w / GAMES * 100, st };
}
let oob = 0;
const t0 = Date.now();
for (const [a, b] of targets) {
  const { rate, st } = matchup(a, b, `normal-v1-g${GAMES}`);
  const flag = (rate < 30 || rate > 70) ? ' ⚠越带' : '';
  if (flag && a !== b) oob++;
  console.log(`${CN[a]}v${CN[b]} ${rate.toFixed(1)}% (stall${st})${flag}`);
}
console.log(`越带 ${oob}/${targets.length}，${GAMES}局/组，${((Date.now() - t0) / 1000).toFixed(0)}s`);
