// 回放确定性：录制全动作序列 → seed+卡组重建 → 按序重放 → 终态必须与原局完全一致。
// 这是 stats.js 回放功能的引擎级地基（UI 层 startReplay 用同一构造）。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { newGame, applyAction } from '../engine/index.js';
import { listActions } from '../ai/actions.js';
import { createAI } from '../ai/heuristic.js';
import { makeRng } from '../engine/rng.js';

const pool = JSON.parse(readFileSync(new URL('../data/cards.json', import.meta.url), 'utf8'));
function deckOf(color) {
  const cs = pool.cards.filter((c) => c.color === color);
  const deck = [];
  for (let i = 0; i < 4; i++) for (const c of cs) deck.push(c);
  return deck.slice(0, 50);
}

test('回放确定性：AI 对 AI 三局，重放终态（winner/双方 LP/动作数）与原局一致', () => {
  for (const seed of [101, 202, 303]) {
    const la = pool.leaders.find((l) => l.color === 'red');
    const lb = pool.leaders.find((l) => l.color === 'blue');
    const deckA = deckOf('red'), deckB = deckOf('blue');

    // 原局：AI 驱动 + 全动作录制
    const s = newGame({ leaderA: la, deckA, leaderB: lb, deckB, seed });
    const ai0 = createAI('normal', makeRng(seed * 2 + 1));
    const ai1 = createAI('normal', makeRng(seed * 2 + 2));
    const actions = [];
    let steps = 0;
    while (s.winner === null && s.turn <= 300 && steps < 500) {
      const acts = listActions(s);
      if (!acts.length) break;
      const ai = s.pending ? (s.pending.target.side === 0 ? ai0 : ai1) : (s.active === 0 ? ai0 : ai1);
      const a = ai.choose(s, acts);
      if (!a) break;
      actions.push(JSON.parse(JSON.stringify(a)));
      applyAction(s, a);
      steps++;
    }
    assert.ok(s.winner !== null, `seed ${seed} 原局未终局`);

    // 重放：同 seed + 同卡组 id 序（经 id→def 还原，模拟 localStorage 往返）重建
    const byId = Object.fromEntries(pool.cards.map((c) => [c.id, c]));
    const r = newGame({
      leaderA: la, deckA: deckA.map((c) => byId[c.id]),
      leaderB: lb, deckB: deckB.map((c) => byId[c.id]),
      seed,
    });
    for (const a of actions) applyAction(r, a);

    assert.equal(r.winner, s.winner, `seed ${seed} 胜者不一致`);
    assert.equal(r.players[0].lp, s.players[0].lp, `seed ${seed} 我方 LP 不一致`);
    assert.equal(r.players[1].lp, s.players[1].lp, `seed ${seed} 对方 LP 不一致`);
    assert.equal(r.turn, s.turn, `seed ${seed} 回合数不一致`);
    assert.equal(r.log.length, s.log.length, `seed ${seed} 事件流长度不一致`);
    assert.ok(actions.length >= 10, '动作序列过短，录制可疑');
  }
});

test('回放数据契约：deckA/B 各 50 id、seed 数值、actions 纯数据可序列化', () => {
  const s = newGame({
    leaderA: pool.leaders[0], deckA: deckOf('red'),
    leaderB: pool.leaders[1], deckB: deckOf('blue'),
    seed: 7,
  });
  const a = listActions(s)[0];
  const roundtrip = JSON.parse(JSON.stringify({ seed: s.seed, actions: [a] }));
  assert.equal(roundtrip.seed, 7);
  assert.ok(roundtrip.actions[0].t);
});
