// P1a 扩充测试：search/revive 原语 + 阵型光环（vanguard/bulwark）+ 游击触发
// 断言从 design-system.md §1.3/§4 推导（勿从实现反推）。
import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, powerOfUnit, leaderPower } from '../engine/state.js';
import { playCharacter } from '../engine/phases.js';
import { resolveAttack } from '../engine/combat.js';
import { mkLeader, mkChar, mkDeck, setHand } from './fixtures.js';

function mk(state, side) {
  const pl = state.players[side];
  // 预置满额可用 DON（引擎纯数据，测试任意重构——见 fixtures.js 注释）
  pl.donArea = Array.from({ length: 10 }, (_, i) => ({ id: i, rest: false, attached: null }));
  return {
    // 返回 board 上的实际单位（playCharacter 展开克隆，手牌原卡无 buffs 字段）
    play: (card) => { pl.hand.push(card); playCharacter(state, side, pl.hand.length - 1); return pl.board[pl.board.length - 1]; },
  };
}

test('search：按阵营从牌组找卡入手牌（不足额=有多少拿多少）', () => {
  const target = mkChar('T1', 'red', 2, 3000, { faction: 'navy' });
  const deckA = mkDeck('red');
  deckA[deckA.length - 1] = target; deckA[deckA.length - 2] = target; // 牌顶在尾部（search 自顶向下扫）
  const s = createGame({ leaderA: mkLeader('LA', 'red'), deckA,
    leaderB: mkLeader('LB', 'blue'), deckB: mkDeck('blue'), seed: 7 });
  const searcher = mkChar('S1', 'red', 3, 4000, { effect: { hook: 'onPlay', op: { k: 'search', n: 2, faction: 'navy' } } });
  const h0 = s.players[0].hand.length, d0 = s.players[0].deck.length;
  mk(s, 0).play(searcher);
  // play() 内 push+splice 净 0；填充卡 faction=null → 只有 2 张 navy 目标会被找出
  assert.equal(s.players[0].hand.length, h0 + 2, '净打出0+找2');
  assert.equal(s.players[0].deck.length, d0 - 2, '牌组-2');
  assert.ok(s.players[0].hand.every((c) => c.id !== 'T1' || c.faction === 'navy'));
});

test('search：maxCost 上限过滤（贵卡不被找走）', () => {
  const cheap = mkChar('C1', 'red', 2, 3000, { faction: 'navy' });
  const dear = mkChar('D1', 'red', 6, 7000, { faction: 'navy' });
  const deckA = mkDeck('red');
  deckA[deckA.length - 1] = cheap; deckA[deckA.length - 2] = dear;
  const s = createGame({ leaderA: mkLeader('LA', 'red'), deckA,
    leaderB: mkLeader('LB', 'blue'), deckB: mkDeck('blue'), seed: 7 });
  mk(s, 0).play(mkChar('S2', 'red', 3, 4000, { effect: { hook: 'onPlay', op: { k: 'search', n: 1, faction: 'navy', maxCost: 3 } } }));
  assert.ok(s.players[0].hand.some((c) => c.id === 'C1'), '只找到便宜卡');
  assert.ok(!s.players[0].hand.some((c) => c.id === 'D1'), '贵卡留下');
});

test('revive：从墓场回 ≤maxCost 角色到手牌；墓场清空该卡', () => {
  const s = createGame({ leaderA: mkLeader('LA', 'red'), deckA: mkDeck('red'),
    leaderB: mkLeader('LB', 'blue'), deckB: mkDeck('blue'), seed: 7 });
  const dead = mkChar('R1', 'red', 2, 3000);
  s.players[0].trash.push(dead);
  const h0 = s.players[0].hand.length;
  mk(s, 0).play(mkChar('S3', 'red', 4, 5000, { effect: { hook: 'onPlay', op: { k: 'revive', maxCost: 3 } } }));
  assert.equal(s.players[0].hand.length, h0 + 1, '净打出0+回1');
  assert.ok(s.players[0].hand.some((c) => c.id === 'R1'), 'R1 回手');
  assert.ok(!s.players[0].trash.some((c) => c.id === 'R1'), 'R1 离开墓场');
});

test('revive：超费角色不被复活', () => {
  const s = createGame({ leaderA: mkLeader('LA', 'red'), deckA: mkDeck('red'),
    leaderB: mkLeader('LB', 'blue'), deckB: mkDeck('blue'), seed: 7 });
  s.players[0].trash.push(mkChar('R2', 'red', 5, 6000));
  const h0 = s.players[0].hand.length;
  mk(s, 0).play(mkChar('S4', 'red', 4, 5000, { effect: { hook: 'onPlay', op: { k: 'revive', maxCost: 3 } } }));
  assert.equal(s.players[0].hand.length, h0, '无复活=净0');
});

test('阵型光环 vanguard：攻击相位每多 1 名突击 +500，防守相位不生效', () => {
  const s = createGame({ leaderA: mkLeader('LA', 'red'), deckA: mkDeck('red'),
    leaderB: mkLeader('LB', 'blue'), deckB: mkDeck('blue'), seed: 7 });
  const m = mk(s, 0);
  const v1 = m.play(mkChar('V1', 'red', 2, 3000, { formation: 'vanguard' }));
  assert.equal(powerOfUnit(v1, s.players[0], 'attack'), 3000, '仅 1 名突击=无加成');
  m.play(mkChar('V2', 'red', 2, 3000, { formation: 'vanguard' }));
  assert.equal(powerOfUnit(v1, s.players[0], 'attack'), 3500, '2 名突击=+500');
  assert.equal(powerOfUnit(v1, s.players[0], 'defense'), 3000, '防守相位突击不加');
  assert.equal(powerOfUnit(v1, null, 'attack'), 3000, '无玩家上下文=无光环（兼容旧调用）');
});

test('阵型光环 bulwark：防守相位每多 1 名铁壁 +500，攻击相位不生效', () => {
  const s = createGame({ leaderA: mkLeader('LA', 'red'), deckA: mkDeck('red'),
    leaderB: mkLeader('LB', 'blue'), deckB: mkDeck('blue'), seed: 7 });
  const m = mk(s, 0);
  const b1 = m.play(mkChar('B1', 'red', 2, 3000, { formation: 'bulwark' }));
  m.play(mkChar('B2', 'red', 2, 3000, { formation: 'bulwark' }));
  m.play(mkChar('N1', 'red', 2, 3000)); // 非铁壁不计数
  assert.equal(powerOfUnit(b1, s.players[0], 'defense'), 3500, '2 名铁壁=+500');
  assert.equal(powerOfUnit(b1, s.players[0], 'attack'), 3000, '攻击相位铁壁不加');
});

test('阵型光环：船长带阵型同享（leaderPower attack 相位）', () => {
  const s = createGame({ leaderA: mkLeader('LA', 'red', 4, 5000, { formation: 'vanguard' }), deckA: mkDeck('red'),
    leaderB: mkLeader('LB', 'blue'), deckB: mkDeck('blue'), seed: 7 });
  assert.equal(leaderPower(s.players[0], 'attack'), 5000, '船长独突=无加成');
  mk(s, 0).play(mkChar('V3', 'red', 2, 3000, { formation: 'vanguard' }));
  assert.equal(leaderPower(s.players[0], 'attack'), 5500, '船长+1 突击单位=+500');
});

test('游击 skirmish：第 3 名游击登场抽 1（第 1/2 名不抽）', () => {
  const s = createGame({ leaderA: mkLeader('LA', 'red'), deckA: mkDeck('red'),
    leaderB: mkLeader('LB', 'blue'), deckB: mkDeck('blue'), seed: 7 });
  const m = mk(s, 0);
  const h = () => s.players[0].hand.length;
  m.play(mkChar('K1', 'red', 1, 2000, { formation: 'skirmish' }));
  const after1 = h(); // play() 内 push+splice 净 0
  m.play(mkChar('K2', 'red', 1, 2000, { formation: 'skirmish' }));
  assert.equal(h(), after1, '第 2 名不抽');
  m.play(mkChar('K3', 'red', 1, 2000, { formation: 'skirmish' }));
  assert.equal(h(), after1 + 1, '第 3 名抽 1');
  assert.ok(s.log.some((e) => e.t === 'skirmishDraw'), '留 skirmishDraw 事件');
});

test('光环进实战结算：resolveAttack 攻防双方各按相位取光环', () => {
  const s = createGame({ leaderA: mkLeader('LA', 'red'), deckA: mkDeck('red'),
    leaderB: mkLeader('LB', 'blue'), deckB: mkDeck('blue'), seed: 7 });
  // 我方 2 突击 3000；对方 2 铁壁 3000（blocker 守备）
  mk(s, 0).play(mkChar('VA', 'red', 2, 3000, { formation: 'vanguard' }));
  mk(s, 0).play(mkChar('VB', 'red', 2, 3000, { formation: 'vanguard' }));
  mk(s, 1).play(mkChar('BA', 'blue', 2, 3000, { formation: 'bulwark', keywords: ['blocker'] }));
  mk(s, 1).play(mkChar('BB', 'blue', 2, 3000, { formation: 'bulwark' }));
  s.players[1].board[0].rest = true; // 守备表示挡刀
  resolveAttack(s, { attacker: { side: 0, type: 'char', idx: 0 }, target: { side: 1, type: 'char', idx: 0 }, counterBoost: 0 });
  const clash = s.log.filter((e) => e.t === 'clash').pop();
  assert.equal(clash.atkPower, 3500, '攻击方 2 突击=3500');
  assert.equal(clash.defPower, 3500 + 1000, '防守方 2 铁壁 3500 + blocker 墙 1000');
});
