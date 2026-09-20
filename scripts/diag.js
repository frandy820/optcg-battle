// 诊断：hard vs easy 步数分布 / 胜负 / 循环检测
import { readFileSync } from 'node:fs';
import { newGame, applyAction, deckOf as deckOfEngine } from '../engine/index.js';
import { listActions } from '../ai/actions.js';
import { createAI } from '../ai/heuristic.js';
import { makeRng } from '../engine/rng.js';

const pool = JSON.parse(readFileSync(new URL('../data/cards.json', import.meta.url), 'utf8'));
function deckOf(color) {
  return deckOfEngine(pool, color); // engine/deck.js 分层均匀采样（POOL-3 顺序敏感修复）
}
function aiGame(cA, lvlA, cB, lvlB, seed) {
  const leaderA = pool.leaders.find((l) => l.color === cA);
  const leaderB = pool.leaders.find((l) => l.color === cB);
  const s = newGame({ leaderA, deckA: deckOf(cA), leaderB, deckB: deckOf(cB), seed });
  const ai0 = createAI(lvlA, makeRng(seed * 2 + 1));
  const ai1 = createAI(lvlB, makeRng(seed * 2 + 2));
  let steps = 0;
  const actionCount = {};
  while (s.winner === null && steps < 900) {
    const acts = listActions(s);
    const ai = s.pending ? (s.pending.target.side === 0 ? ai0 : ai1) : (s.active === 0 ? ai0 : ai1);
    const a = ai.choose(s, acts);
    actionCount[a.t] = (actionCount[a.t] || 0) + 1;
    applyAction(s, a);
    steps++;
  }
  return { winner: s.winner, reason: s.winReason, steps, actionCount };
}

for (let i = 0; i < 8; i++) {
  const hardSide = i % 2;
  const r = hardSide === 0
    ? aiGame('red', 'hard', 'blue', 'easy', 5000 + i)
    : aiGame('blue', 'easy', 'red', 'hard', 5000 + i);
  console.log(`#${i} hard@${hardSide} winner=${r.winner} hard赢=${r.winner === hardSide} steps=${r.steps} reason=${r.reason}`, r.steps > 500 ? JSON.stringify(r.actionCount) : '');
}
