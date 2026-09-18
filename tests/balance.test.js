// RC+ R3 平衡回归：固定 seed 复跑关键 matchup，锁住「红 vs 黑/绿 在 30%-70% 带内」现状。
// 背景：RC 阶段曾出现红 30% 劣势（数据层修正后回带）；本测试保证后续任何卡池/引擎改动
// 把这两个 matchup 推出带外时立即红灯（seed 固定=确定性，无抖动）。
// 口径与 scripts/balance-sim.js 同构：normal AI 对垒、交替先后手、FNV-1a 散 seed 基数。
// 60 局/matchup 实测 <0.1s（引擎 3500 局/s），不影响测试总时长。
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
  for (let i = 0; i < 4; i++) for (const c of cs) deck.push(c); // 轮次交错：全卡型均入组（旧连块×4 会把池序靠后的装备/舞台截出 50 张外，2026-09-18 三处同源同步修）
  return deck.slice(0, 50);
}

// FNV-1a（与 balance-sim 相同）：把 matchup 名散成 seed 基数，避免连续 seed 首输出相关
function fnv(str) {
  let h = 0x811c9dc5;
  for (const ch of str) { h ^= ch.charCodeAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
}

const STALL_ACTIONS = 500;
function playOnce(color0, color1, seed) {
  const leader0 = pool.leaders.find((l) => l.color === color0);
  const leader1 = pool.leaders.find((l) => l.color === color1);
  const s = newGame({ leaderA: leader0, deckA: deckOf(color0), leaderB: leader1, deckB: deckOf(color1), seed });
  const ai0 = createAI('normal', makeRng(seed * 2 + 1));
  const ai1 = createAI('normal', makeRng(seed * 2 + 2));
  let steps = 0;
  while (s.winner === null && s.turn <= 300 && steps < STALL_ACTIONS) {
    const acts = listActions(s);
    if (!acts.length) return { winner: null, stalled: true };
    const ai = s.pending ? (s.pending.target.side === 0 ? ai0 : ai1) : (s.active === 0 ? ai0 : ai1);
    const a = ai.choose(s, acts);
    if (!a) return { winner: null, stalled: true };
    applyAction(s, a);
    steps++;
  }
  return { winner: s.winner, stalled: s.winner === null };
}

function matchupWinRate(colorA, colorB, games, tag) {
  const seedBase = fnv(`${tag}:${colorA}:${colorB}`) % 100000;
  let winsA = 0, stalls = 0;
  for (let g = 0; g < games; g++) {
    const seed = seedBase + g * 7 + 1;
    const aFirst = g % 2 === 0; // 交替先后手
    const r = aFirst
      ? playOnce(colorA, colorB, seed)
      : playOnce(colorB, colorA, seed);
    if (r.stalled) { stalls++; continue; }
    const winnerColor = r.winner === 0 ? (aFirst ? colorA : colorB) : (aFirst ? colorB : colorA);
    if (winnerColor === colorA) winsA++;
  }
  return { winRateA: winsA / games * 100, stalls };
}

// 与 balance-sim 完全相同的 tag/seed 派生 → 本测试锁定的是跑批报告同一条样本序列
test('平衡回归：红 vs 黑 / 红 vs 绿 normal 各 60 局均在 30%-70% 带内', () => {
  for (const [a, b] of [['red', 'black'], ['red', 'green']]) {
    const { winRateA, stalls } = matchupWinRate(a, b, 60, 'normal-v1-g60');
    assert.equal(stalls, 0, `${a} vs ${b} 出现卡死局`);
    assert.ok(winRateA >= 30 && winRateA <= 70,
      `${a} vs ${b} 胜率 ${winRateA.toFixed(1)}% 超出 30%-70% 目标带（调池需重跑 scripts/balance-sim.js 复核并更新本断言基线）`);
  }
});
