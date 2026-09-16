// M1 模糊测试：六色互打随机对局——引擎在任何合法动作序列下不得抛错/死循环
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { newGame, applyAction } from '../engine/index.js';
import { listActions } from '../ai/actions.js';
import { makeRng } from '../engine/rng.js';

const pool = JSON.parse(readFileSync(new URL('../data/cards.json', import.meta.url), 'utf8'));
const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'black'];
const MAX_ACTIONS = 900; // 动作上限，超限判僵局（不计失败但统计）

function deckOf(color) {
  const cs = pool.cards.filter((c) => c.color === color);
  const deck = [];
  for (const c of cs) for (let i = 0; i < 4; i++) deck.push(c);
  return deck.slice(0, 50);
}

function playOnce(colorA, colorB, seed) {
  const leaderA = pool.leaders.find((l) => l.color === colorA);
  const leaderB = pool.leaders.find((l) => l.color === colorB);
  const s = newGame({ leaderA, deckA: deckOf(colorA), leaderB, deckB: deckOf(colorB), seed });
  const rng = makeRng(seed ^ 0x9E37);
  let steps = 0;
  while (s.winner === null && steps < MAX_ACTIONS) {
    const acts = listActions(s);
    if (acts.length === 0) throw new Error('no legal actions but game not over');
    applyAction(s, acts[Math.floor(rng() * acts.length)]);
    steps++;
  }
  return { winner: s.winner, reason: s.winReason, steps, stalemate: s.winner === null };
}

test('六色互打随机对局：15 配对 × 4 局 = 60 局无非法状态', () => {
  const stats = { games: 0, finished: 0, stalemates: 0, byWinner: { 0: 0, 1: 0 }, byReason: {} };
  for (let i = 0; i < COLORS.length; i++) {
    for (let j = i + 1; j < COLORS.length; j++) {
      for (let g = 0; g < 4; g++) {
        const seed = i * 1000 + j * 10 + g;
        const r = playOnce(COLORS[i], COLORS[j], seed);
        stats.games++;
        if (r.stalemate) stats.stalemates++;
        else {
          stats.finished++;
          stats.byWinner[r.winner]++;
          stats.byReason[r.reason] = (stats.byReason[r.reason] || 0) + 1;
        }
      }
    }
  }
  // 硬门禁：60 局全部无异常跑完；僵局允许存在（双方消极）但不得过半
  assert.equal(stats.games, 60);
  assert.ok(stats.stalemates <= stats.games / 2, `too many stalemates: ${stats.stalemates}`);
  assert.ok(stats.finished >= 30, `终局过少: ${JSON.stringify(stats)}`);
});

test('单局确定性：同 seed 同随机策略重放结果一致', () => {
  const a = playOnce('red', 'blue', 77);
  const b = playOnce('red', 'blue', 77);
  assert.deepEqual(a, b);
});
