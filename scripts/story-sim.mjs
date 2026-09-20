// story-sim.mjs — 故事之旅平衡模拟（dev-only）：引擎+AI 离线直跑，快速验证各关强度曲线
// 与 probe-story.mjs 的关系：本工具调敌方强度参数（power/band/LP），probe 在真实页面复验终值。
// 玩家侧=normal AI 全决策（与 OPTCG_GAME.autoplay(level) 同「普通玩家策略」近似：含 DON 附着与反击）；
// 敌方侧=关卡 AI 档。玩家卡组按真实通关序列自动成长（initialDeck → 每关 rollRewards → growDeck）。
// 用法：node scripts/story-sim.mjs [--games 30] [--runs 5]
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
await import(pathToFileURL(join(ROOT, 'web', 'app.bundle.js')).href); // → globalThis.OPTCG
const O = globalThis.OPTCG;
globalThis.OPTCG = O;
await import(pathToFileURL(join(ROOT, 'web', 'story.js')).href); // → globalThis.OPTCG_STORY（复用真实关卡表/敌组/奖励逻辑）
const S = globalThis.OPTCG_STORY;

const args = process.argv.slice(2);
const argNum = (name, dflt) => { const i = args.indexOf('--' + name); return i >= 0 && /^\d+$/.test(args[i + 1] || '') ? Number(args[i + 1]) : dflt; };
const GAMES = argNum('games', 30); // 每关局数
const RUNS = argNum('runs', 5);     // 独立成长线（不同 seed 的奖励/敌组）
const STALL = 600;                  // 单局动作数上限（防死循环）

const LEADER_RED = O.POOL.leaders.find((l) => l.id === 'LEADER-RED');

// 单局：玩家 normal vs 关卡敌 AI 档，返回胜者与我方 LP
function playGame(stage, deckA, seed) {
  const G = O.newGame({
    leaderA: LEADER_RED, deckA: deckA.slice(),
    leaderB: S.mkFoe(stage), deckB: S.enemyDeckOf(stage, seed),
    seed, fusions: O.POOL.cards.filter((c) => c.fusion),
  });
  G.players[1].lp = stage.lp; // Boss LP 覆写（与 game.js 挂接一致）
  // AI tie-break 随机源固定为 makeRng（引擎 createAI(level, rng) 第二参）：
  // 校准工具必须确定性可复现——Math.random 的尾部 tie-break 会把 100 局口径的胜率
  // 掷出 ±5pp 噪声（教学关 1/300 的偶发败局即此来源），无法用来调参。游戏内行为不变。
  const me = O.createAI('normal', O.makeRng((seed ^ 0x9E3779B9) >>> 0));
  const foe = O.createAI(stage.ai, O.makeRng((seed * 31 + 17) >>> 0));
  let n = 0;
  while (G.winner === null && n++ < STALL) {
    const side = G.pending ? G.pending.target.side : G.active;
    const ai = side === 0 ? me : foe;
    let a = null;
    try { a = ai.choose(G, O.listActions(G)); } catch (e) { a = null; }
    O.applyAction(G, a || (G.pending ? { t: 'passCounter', side } : { t: 'endTurn', side }));
  }
  return { w: G.winner, myLP: G.players[0].lp, stall: G.winner === null };
}

// 一条成长线：按关卡序打（赢了才推进），返回每关 {wins, tries}
function runLine(lineSeed) {
  let deck = O.POOL.cards ? Object.keys(S.initialDeck()).flatMap((id) => Array.from({ length: S.initialDeck()[id] }, () => O.POOL.cards.find((c) => c.id === id))) : [];
  // 重建 counts→卡对象展开（一次性）
  const counts0 = S.initialDeck();
  deck = Object.entries(counts0).flatMap(([id, n]) => Array.from({ length: n }, () => O.POOL.cards.find((c) => c.id === id)));
  let prog = { cleared: 0, wins: {}, seed: lineSeed, ts: 0 };
  let collected = Object.keys(counts0);
  const per = {};
  for (const stage of S.STAGES) {
    let wins = 0, tries = 0;
    let lpLog = [];
    let lastMyLPs = [];
    const cap = 12; // 单关尝试上限（超出记卡关）
    while (tries < Math.max(GAMES, 3) || (wins === 0 && tries < cap)) {
      tries++;
      const r = playGame(stage, deck, (lineSeed * 131 + stage.id * 17 + tries * 7919) >>> 0);
      lpLog.push(r.w === 0 ? r.myLP : -1);
      if (r.w === 0) wins++;
      if (wins === 0 && tries >= cap) break;
      if (tries >= Math.max(GAMES, 3) && wins > 0) break;
    }
    per[stage.id] = { wins, tries };
    lastMyLPs = lpLog.slice();
    if (wins === 0) break; // 卡关：后续关卡不可达
    // 每线只按「一次首通」结算奖励成长（与真实玩家路径一致）
    const lastLP = lastMyLPs.length ? lastMyLPs[lastMyLPs.length-1] : 0; // 该关胜局中最常见的 LP 口径近似（教学关多为满血）
    const rr = S.rollRewards(stage, prog, Number.isFinite(lastLP) ? lastLP : 0, 10000, collected);
    prog = rr.prog; collected = rr.collected;
    const nc = S.growDeck(countsOf(deck), rr.got);
    deck = Object.entries(nc).flatMap(([id, n]) => Array.from({ length: n }, () => O.POOL.cards.find((c) => c.id === id))).filter(Boolean);
  }
  return { per, reached: prog.cleared };
}
function countsOf(deckArr) {
  const c = {};
  for (const c0 of deckArr) c[c0.id] = (c[c0.id] || 0) + 1;
  return c;
}

console.log(`故事之旅平衡模拟：${RUNS} 条成长线 × 每关 ≥${GAMES} 局（normal 玩家代打 vs 关卡 AI）\n`);
const agg = {}; // stage -> {w, t}
for (let r = 1; r <= RUNS; r++) {
  const { per } = runLine(1000 + r * 17);
  for (const [st, v] of Object.entries(per)) {
    agg[st] = agg[st] || { w: 0, t: 0 };
    agg[st].w += v.wins; agg[st].t += v.tries;
  }
}
console.log('关 | 胜/局 | 胜率 | 目标');
const TARGET = { 1: '100%', 2: '100%', 3: '100%', 4: '-', 5: '-', 6: '-', 7: '4-7合计≥50%', 8: '-', 9: '-', 10: '≤5次内可通' };
let bad = 0;
for (let st = 1; st <= 10; st++) {
  const v = agg[st];
  if (!v) { console.log(`第${String(st).padStart(2)}关 | 不可达（前置卡关）`); bad++; continue; }
  const rate = (v.w / v.t * 100).toFixed(0);
  console.log(`第${String(st).padStart(2)}关 | ${v.w}/${v.t} | ${rate}% | ${TARGET[st]}`);
}
const t47 = [4, 5, 6, 7].map((s) => agg[s]).filter(Boolean);
const w47 = t47.reduce((a, v) => a + v.w, 0), n47 = t47.reduce((a, v) => a + v.t, 0);
console.log(`\n4-7 关合计：${w47}/${n47} = ${n47 ? (w47 / n47 * 100).toFixed(0) : '-'}%（目标 ≥50%）`);
const l3 = [1, 2, 3].every((s) => agg[s] && agg[s].w === agg[s].t);
console.log(`前 3 关全胜：${l3 ? '是' : '否'}（目标 100%）`);
console.log(`第 10 关可达：${agg[10] ? `胜率 ${(agg[10].w / agg[10].t * 100).toFixed(0)}%（目标 ≥20% ⇒ ≤5 次内可通）` : '否'}`);
if (!l3 || !agg[10] || agg[10].w / agg[10].t < 0.2 || w47 / Math.max(1, n47) < 0.5) { console.log('\nSTORY-SIM-FAIL'); process.exit(1); }
console.log('\nSTORY-SIM-PASS');
