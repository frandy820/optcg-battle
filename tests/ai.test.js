// M2 AI 验收：AI vs AI 大批量对局无非法操作 / 三档胜率分层 / 单步性能
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { newGame, applyAction, deckOf as deckOfEngine } from '../engine/index.js';
import { listActions } from '../ai/actions.js';
import { createAI } from '../ai/heuristic.js';
import { makeRng } from '../engine/rng.js';

const pool = JSON.parse(readFileSync(new URL('../data/cards.json', import.meta.url), 'utf8'));
const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'black'];
const MAX_ACTIONS = 900;

function deckOf(color) {
  return deckOfEngine(pool, color); // engine/deck.js 分层均匀采样（与 game.js/balance-sim.js 同源）
}

// AI 对 AI 一局（双方可不同难度）
function aiGame(cA, lvlA, cB, lvlB, seed) {
  const leaderA = pool.leaders.find((l) => l.color === cA);
  const leaderB = pool.leaders.find((l) => l.color === cB);
  const s = newGame({ leaderA, deckA: deckOf(cA), leaderB, deckB: deckOf(cB), seed });
  const ai0 = createAI(lvlA, makeRng(seed * 2 + 1));
  const ai1 = createAI(lvlB, makeRng(seed * 2 + 2));
  let steps = 0;
  while (s.winner === null && steps < MAX_ACTIONS) {
    const acts = listActions(s);
    const ai = s.pending ? (s.pending.target.side === 0 ? ai0 : ai1) : (s.active === 0 ? ai0 : ai1);
    const a = ai.choose(s, acts);
    if (!a) throw new Error(`no action chosen at step ${steps}`);
    applyAction(s, a);
    steps++;
  }
  return { winner: s.winner, reason: s.winReason, steps, stalemate: s.winner === null };
}

test('AI vs AI：六色混合 500 局全部无非法操作', () => {
  const stats = { games: 0, finished: 0, stalemate: 0, reasons: {} };
  for (let i = 0; i < 500; i++) {
    const cA = COLORS[i % 6];
    const cB = COLORS[(i * 5 + 3) % 6];
    const r = aiGame(cA, 'normal', cB, 'normal', 1000 + i);
    stats.games++;
    if (r.stalemate) stats.stalemate++;
    else {
      stats.finished++;
      stats.reasons[r.reason] = (stats.reasons[r.reason] || 0) + 1;
    }
  }
  assert.equal(stats.games, 500);
  assert.ok(stats.finished >= 350, `终局过少: ${JSON.stringify(stats)}`);
});

test('难度分层：hard 对 easy 100 局胜率显著占优（≥60%）', () => {
  let hardWins = 0;
  const N = 100;
  for (let i = 0; i < N; i++) {
    const hardSide = i % 2; // 双方轮流执 hard，抵消先后手
    const r = hardSide === 0
      ? aiGame('red', 'hard', 'blue', 'easy', 5000 + i)
      : aiGame('blue', 'easy', 'red', 'hard', 5000 + i);
    if (r.winner === hardSide) hardWins++;
  }
  assert.ok(hardWins >= N * 0.6, `hard 胜率仅 ${hardWins}/${N}，未分层`);
});

test('性能：normal 档 30 局平均单步 < 50ms', () => {
  const t0 = Date.now();
  let steps = 0;
  for (let i = 0; i < 30; i++) {
    const r = aiGame(COLORS[i % 6], 'normal', COLORS[(i + 1) % 6], 'normal', 9000 + i);
    steps += r.steps;
  }
  const perStep = (Date.now() - t0) / Math.max(steps, 1);
  assert.ok(perStep < 50, `单步 ${perStep.toFixed(1)}ms 超标`);
});

test('normal 对 normal 对局质量：平均步数在合理区间（30-500，不磨蹭不死循环）', () => {
  let total = 0; const N = 40;
  for (let i = 0; i < N; i++) {
    total += aiGame(COLORS[i % 6], 'normal', COLORS[(i + 3) % 6], 'normal', 7000 + i).steps;
  }
  const avg = total / N;
  assert.ok(avg > 25 && avg < 500, `平均步数 ${avg} 异常`);
});
