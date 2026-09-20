// RC 测试大扩充：初始化全量断言 / 非法动作 battery / KO 边界 / blocker 生死 /
// counter 多张新路径与日志增量契约 / banish 无 trigger / 舞台替换日志 / giveDon-takeDon 可逆 /
// 胜负 win 事件唯一 / AI 三档终局不死循环。全部固定 seed，确定性断言。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { newGame, applyAction, powerOfUnit, leaderPower, usableDons, deckOf as deckOfEngine } from '../engine/index.js';
import { takeDon } from '../engine/phases.js';
import { listActions } from '../ai/actions.js';
import { createAI } from '../ai/heuristic.js';
import { makeRng } from '../engine/rng.js';
import { mkLeader, mkChar, mkEvent, mkStage, mkDeck, setHand } from './fixtures.js';

const pool = JSON.parse(readFileSync(new URL('../data/cards.json', import.meta.url), 'utf8'));

function basicGame(seed = 7) {
  return newGame({
    leaderA: mkLeader('LA', 'red', 4, 5000),
    deckA: mkDeck('red'),
    leaderB: mkLeader('LB', 'blue', 4, 5000),
    deckB: mkDeck('blue'),
    seed,
  });
}

// 场上直接摆单位（绕过出牌动作，聚焦战斗断言）
function putUnit(state, side, id, power, extra = {}) {
  const u = { ...mkChar(id, side === 0 ? 'red' : 'blue', 1, power, extra), rest: false, playedTurn: 0, dons: 0, buffs: [] };
  state.players[side].board.push(u);
  return u;
}

// ===== 1. newGame 初始化 =====
test('newGame 初始化：双方 5 起手/LP=life×2000/DON 基数/牌量守恒/阶段 main', () => {
  const s = newGame({
    leaderA: mkLeader('LA', 'red', 5, 5000),
    deckA: mkDeck('red'),
    leaderB: mkLeader('LB', 'blue', 4, 6000),
    deckB: mkDeck('blue'),
    seed: 11,
  });
  assert.equal(s.turn, 1);
  assert.equal(s.active, 0);
  assert.equal(s.phase, 'main');
  assert.equal(s.winner, null);
  assert.equal(s.pending, null);
  // 双方起手 5 张；先手已自动进入首回合（再抽 1 → 6）
  assert.equal(s.players[0].hand.length, 6);
  assert.equal(s.players[1].hand.length, 5);
  // LP = 领袖 life × 2000（游戏王式积分制）
  assert.equal(s.players[0].lp, 5 * 2000);
  assert.equal(s.players[1].lp, 4 * 2000);
  // DON：先手首回合 +1；后手未行动 0，DON 牌库 10
  assert.equal(s.players[0].donArea.length, 1);
  assert.equal(s.players[0].donDeck, 9);
  assert.equal(s.players[1].donArea.length, 0);
  assert.equal(s.players[1].donDeck, 10);
  // 牌量守恒：LP 制不抽生命卡，deck = 50 - 起手5 - (先手首回合抽1)
  assert.equal(s.players[0].deck.length, 50 - 5 - 1);
  assert.equal(s.players[1].deck.length, 50 - 5);
});

// ===== 2. 非法动作 battery（补充既有未覆盖面）=====
test('非法动作：事件/舞台费用不足、附着不足、附着目标不存在均 throw 且状态不变', () => {
  const s = basicGame(); // 先手只有 1 费
  setHand(s, 0, [mkEvent('E9', 'red', 3, { hook: 'onPlay', op: { k: 'draw', n: 1 } }), mkStage('S9', 'red', 2)]);
  assert.throws(() => applyAction(s, { t: 'playEvent', side: 0, idx: 0 }), /not enough/);
  assert.throws(() => applyAction(s, { t: 'playStage', side: 0, idx: 1 }), /not enough/);
  assert.equal(s.players[0].hand.length, 2); // 未消耗
  assert.equal(s.players[0].trash.length, 0);
  assert.throws(() => applyAction(s, { t: 'giveDon', side: 0, to: { type: 'char', idx: 0 }, count: 1 }), /attach target not found/);
  applyAction(s, { t: 'giveDon', side: 0, to: { type: 'leader' }, count: 1 }); // 唯一 1 费附着掉
  assert.throws(() => applyAction(s, { t: 'giveDon', side: 0, to: { type: 'leader' }, count: 1 }), /not enough usable/);
});

test('takeDon 边界：count 0 抛错、无附着抛错（RC 补齐的校验）', () => {
  const s = basicGame();
  applyAction(s, { t: 'giveDon', side: 0, to: { type: 'leader' }, count: 1 });
  // applyAction 分发层 `count || 1` 会把 0 归一为 1——引擎级守卫需直调验证
  assert.throws(() => takeDon(s, 0, { type: 'leader' }, 0), /positive/);
  applyAction(s, { t: 'takeDon', side: 0, from: { type: 'leader' }, count: 1 });
  assert.throws(() => applyAction(s, { t: 'takeDon', side: 0, from: { type: 'char', idx: 3 }, count: 1 }), /not enough attached/);
});

// ===== 3. KO 边界（游戏王式：> 才击沉，= 无战果）=====
test('KO 边界：守备表示攻守恰好相等 → 不 KO（守备 > 才击沉）', () => {
  const s = basicGame();
  putUnit(s, 1, 'VIC', 5000).rest = true; // 守备 5000
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: { type: 'char', idx: 0 } }); // 攻 5000
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[1].board.length, 1); // 相等无战果
  assert.ok(s.log.some((e) => e.t === 'noDamage' && e.reason === 'defense'));
});

test('KO 边界：攻击战力恰高于防守 1000 → KO', () => {
  const s = basicGame();
  putUnit(s, 1, 'VIC', 4000).rest = true;
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: { type: 'char', idx: 0 } });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[1].board.length, 0);
  assert.equal(s.players[1].trash.filter((c) => c.id === 'VIC').length, 1);
  assert.ok(s.log.some((e) => e.t === 'ko' && e.cardId === 'VIC'));
});

// ===== 4. 坚壁（blocker 重定义：被攻击时防御 +1000）=====
test('坚壁互斗：角色攻坚壁失败 → 攻方被反杀沉场', () => {
  const s = basicGame();
  s.players[0].donArea = Array.from({ length: 5 }, (_, i) => ({ id: i, rest: false, attached: null }));
  setHand(s, 0, [mkChar('ATK', 'red', 1, 4000, { keywords: ['rush'] })]);
  applyAction(s, { t: 'playCharacter', side: 0, idx: 0 });
  putUnit(s, 1, 'BLK', 4000, { keywords: ['blocker'] }); // 竖置互斗：4000+1000=5000 > 4000
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'char', idx: 0 }, target: { type: 'char', idx: 0 } });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[0].board.length, 0); // 攻方被反杀
  assert.equal(s.players[1].board.length, 1); // 坚壁存活
  assert.equal(s.players[0].lp, 4 * 2000 - 1000); // 攻方扣差额 5000-4000
});

test('坚壁 + counter 补防：直攻被完全挡下（6000 攻 vs 5000 船长 +2000 反击）', () => {
  const s = basicGame();
  s.players[0].leader.power = 6000;
  setHand(s, 1, [mkChar('CTR', 'blue', 1, 1000, { counter: 2000 })]);
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' });
  applyAction(s, { t: 'counter', side: 1, cards: [0] });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[1].lp, 4 * 2000); // 6000 vs 5000+2000：伤害 0
  assert.equal(s.players[1].hand.length, 0);
});

// ===== 5. Counter：多张一次打出（新引擎路径）与日志契约 =====
test('Counter 多张一次打出：倒序删除不位移、累计正确', () => {
  const s = basicGame();
  setHand(s, 1, [
    mkChar('C0', 'blue', 1, 1000, { counter: 1000 }),
    mkChar('C1', 'blue', 1, 1000, { counter: 1000 }),
    mkChar('C2', 'blue', 1, 1000, { counter: 1000 }),
  ]);
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' }); // 5000 v 5000
  // 一次打出两张（含高索引+低索引混合，倒序删除防位移）
  applyAction(s, { t: 'counter', side: 1, cards: [0, 2] });
  assert.equal(s.pending.counterBoost, 2000);
  assert.equal(s.players[1].hand.length, 1); // 只剩 C1
  assert.equal(s.players[1].hand[0].id, 'C1');
  assert.deepEqual(s.players[1].trash.map((c) => c.id).sort(), ['C0', 'C2']);
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[1].lp, 4 * 2000); // 5000 v 5000+2000：伤害 0
});

test('Counter 日志契约：cards/boost=本次增量，totalCards/totalBoost=累计（跨多次 counter 动作）', () => {
  const s = basicGame();
  setHand(s, 1, [
    mkChar('C0', 'blue', 1, 1000, { counter: 1000 }),
    mkChar('C1', 'blue', 1, 1000, { counter: 2000 }),
  ]);
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' });
  applyAction(s, { t: 'counter', side: 1, cards: [1] });
  const ev1 = s.log[s.log.length - 1];
  assert.equal(ev1.t, 'counter');
  assert.deepEqual(ev1.cards, ['C1']);      // 增量：本次打出
  assert.equal(ev1.boost, 2000);
  assert.equal(ev1.totalBoost, 2000);
  applyAction(s, { t: 'counter', side: 1, cards: [0] });
  const ev2 = s.log[s.log.length - 1];
  assert.deepEqual(ev2.cards, ['C0']);      // 增量
  assert.equal(ev2.boost, 1000);
  assert.deepEqual(ev2.totalCards, ['C1', 'C0']); // 累计
  assert.equal(ev2.totalBoost, 3000);
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[1].lp, 4 * 2000); // 5000 v 8000：伤害 0
});

test('Counter 整批原子性：混入无 counter 值卡 → 整批拒绝、手牌不动', () => {
  const s = basicGame();
  setHand(s, 1, [
    mkChar('OK1', 'blue', 1, 1000, { counter: 1000 }),
    mkChar('NC', 'blue', 1, 1000), // 无 counter
    mkChar('OK2', 'blue', 1, 1000, { counter: 1000 }),
  ]);
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' });
  assert.throws(() => applyAction(s, { t: 'counter', side: 1, cards: [0, 1, 2] }), /no counter/);
  assert.equal(s.players[1].hand.length, 3); // 一张都没动
  assert.equal(s.pending.counterBoost, 0);
  assert.equal(s.players[1].trash.length, 0);
});

test('Counter 重复索引拒绝', () => {
  const s = basicGame();
  setHand(s, 1, [mkChar('C0', 'blue', 1, 1000, { counter: 1000 })]);
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' });
  assert.throws(() => applyAction(s, { t: 'counter', side: 1, cards: [0, 0] }), /duplicate/);
  assert.equal(s.players[1].hand.length, 1);
});

test('Counter 恰好持平：伤害 0（差额=0，>= 不再命中——规则改为差额制）', () => {
  const s = basicGame();
  s.players[0].leader.power = 7000;
  setHand(s, 1, [mkChar('CTR', 'blue', 1, 1000, { counter: 2000 })]);
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' });
  applyAction(s, { t: 'counter', side: 1, cards: [0] });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[1].lp, 4 * 2000); // 7000 v 7000：差额 0
});

test('Counter 反超 1000：直攻伤害归 0（差额制，不反伤攻方）', () => {
  const s = basicGame();
  s.players[0].leader.power = 7000;
  setHand(s, 1, [
    mkChar('CA', 'blue', 1, 1000, { counter: 2000 }),
    mkChar('CB', 'blue', 1, 1000, { counter: 2000 }),
  ]);
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' });
  applyAction(s, { t: 'counter', side: 1, cards: [0, 1] }); // +4000 → 9000 > 7000
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[1].lp, 4 * 2000);   // 守方无伤
  assert.ok(s.log.some((e) => e.t === 'noDamage'));
});

// ===== 6. LP 制无生命卡：攻击不再翻卡/触发 trigger =====
test('LP 制：直攻只扣 LP，不翻卡不进手不触发 trigger', () => {
  const s = basicGame();
  s.players[0].leader.power = 6000;
  s.players[0].leader.keywords = ['banish'];
  const deckBefore = s.players[1].deck.length;
  const handBefore = s.players[1].hand.length;
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[1].lp, 4 * 2000 - 3000); // 1000 差额 + 2000 猛击
  assert.equal(s.players[1].hand.length, handBefore); // 无翻卡补牌
  assert.equal(s.players[1].deck.length, deckBefore);
});

// ===== 7. playStage 替换日志 replaced 值 =====
test('playStage 日志 replaced：首次 false、替换 true（T1 修复回归锁）', () => {
  const s = basicGame();
  s.players[0].donArea = Array.from({ length: 5 }, (_, i) => ({ id: i, rest: false, attached: null }));
  setHand(s, 0, [mkStage('S1', 'red', 1), mkStage('S2', 'red', 1)]);
  applyAction(s, { t: 'playStage', side: 0, idx: 0 });
  const ev1 = s.log[s.log.length - 1];
  assert.equal(ev1.t, 'stage');
  assert.equal(ev1.replaced, false); // 修复前恒为 true
  applyAction(s, { t: 'playStage', side: 0, idx: 0 });
  const ev2 = s.log[s.log.length - 1];
  assert.equal(ev2.cardId, 'S2');
  assert.equal(ev2.replaced, true);
});

// ===== 8. giveDon / takeDon 可逆性 =====
test('giveDon/takeDon 可逆：附着→收回后战力与费用完全复原', () => {
  const s = basicGame();
  applyAction(s, { t: 'endTurn', side: 0 }); // p1 有 2 费
  putUnit(s, 1, 'U1', 3000);
  const power0 = powerOfUnit(s.players[1].board[0]);
  const usable0 = usableDons(s.players[1]);
  applyAction(s, { t: 'giveDon', side: 1, to: { type: 'char', idx: 0 }, count: 1 });
  assert.equal(powerOfUnit(s.players[1].board[0]), power0 + 1000);
  assert.equal(usableDons(s.players[1]), usable0 - 1);
  applyAction(s, { t: 'takeDon', side: 1, from: { type: 'char', idx: 0 }, count: 1 });
  assert.equal(powerOfUnit(s.players[1].board[0]), power0);
  assert.equal(usableDons(s.players[1]), usable0);
  assert.equal(s.players[1].donArea.filter((d) => d.attached).length, 0);
});

// ===== 9. 胜负 win 事件唯一性 =====
test('win 事件只发一次（LP 归零一击终局）', () => {
  const s = basicGame();
  s.players[0].leader.power = 6000;
  s.players[0].leader.keywords = ['doubleAttack'];
  s.players[1].lp = 1000; // 差额 1000×2=2000 一击致命
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.winner, 0);
  assert.equal(s.winReason, 'lp');
  assert.equal(s.log.filter((e) => e.t === 'win').length, 1);
  assert.throws(() => applyAction(s, { t: 'endTurn', side: 0 }), /game over/); // 终局后任何动作拒绝
});

test('win 事件只发一次（牌库空判负路径）', () => {
  const s = basicGame();
  s.players[1].deck = [];
  applyAction(s, { t: 'endTurn', side: 0 }); // p1 startTurn 抽空 → p1 判负
  assert.equal(s.winner, 0);
  assert.equal(s.winReason, 'deckout');
  assert.equal(s.log.filter((e) => e.t === 'win').length, 1);
  assert.throws(() => applyAction(s, { t: 'endTurn', side: 1 }), /game over/);
});

// ===== 10. AI 三档终局 =====
test('AI 三档各 5 局：全部正常终局、不死循环（动作数上限 guard 900）', () => {
  const deckOf = (color) => deckOfEngine(pool, color); // engine/deck.js 分层均匀采样
  const GUARD = 900;
  for (const lvl of ['easy', 'normal', 'hard']) {
    for (let g = 0; g < 5; g++) {
      const cA = ['red', 'green', 'blue'][g % 3];
      const cB = ['black', 'yellow', 'purple'][g % 3];
      const leaderA = pool.leaders.find((l) => l.color === cA);
      const leaderB = pool.leaders.find((l) => l.color === cB);
      const s = newGame({ leaderA, deckA: deckOf(cA), leaderB, deckB: deckOf(cB), seed: 400 + g });
      const ai0 = createAI(lvl, makeRng(500 + g * 2));
      const ai1 = createAI(lvl, makeRng(501 + g * 2));
      let steps = 0;
      while (s.winner === null && steps < GUARD) {
        const acts = listActions(s);
        assert.ok(acts.length > 0, `${lvl} #${g} step${steps} 无合法动作但未终局`);
        const ai = s.pending ? (s.pending.target.side === 0 ? ai0 : ai1) : (s.active === 0 ? ai0 : ai1);
        const a = ai.choose(s, acts);
        assert.ok(a, `${lvl} #${g} step${steps} AI 无动作`);
        applyAction(s, a);
        steps++;
      }
      assert.notEqual(s.winner, null, `${lvl} #${g} 超过 ${GUARD} 动作未终局（死循环嫌疑）`);
      assert.ok(['lp', 'deckout'].includes(s.winReason), `${lvl} #${g} 异常终局 ${s.winReason}`);
    }
  }
});

// ===== 11. 满场时 listActions 不再枚举出角色（引擎与枚举器一致）=====
test('满场 5 角色：playCharacter throw 且 listActions 无该动作', () => {
  const s = basicGame();
  s.players[0].donArea = Array.from({ length: 10 }, (_, i) => ({ id: i, rest: false, attached: null }));
  for (let i = 0; i < 5; i++) putUnit(s, 0, `B${i}`, 1000);
  setHand(s, 0, [mkChar('C6', 'red', 1, 1000)]);
  assert.throws(() => applyAction(s, { t: 'playCharacter', side: 0, idx: 0 }), /board limit/);
  const acts = listActions(s);
  assert.ok(!acts.some((a) => a.t === 'playCharacter'));
});
