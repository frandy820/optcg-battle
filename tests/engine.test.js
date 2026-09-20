// M0 引擎单测：阶段流转 / DON!! / 出牌 / 附着 / 战斗五步 / 全词条 / 胜负 / 合法性 / 确定性回放
import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, applyAction, validateDeck, powerOfUnit, leaderPower, usableDons, fruitEdge } from '../engine/index.js';
import { mkLeader, mkChar, mkEvent, mkStage, mkDeck, setHand } from './fixtures.js';

function basicGame(seed = 7) {
  return newGame({
    leaderA: mkLeader('LA', 'red', 4, 5000),
    deckA: mkDeck('red'),
    leaderB: mkLeader('LB', 'blue', 4, 5000),
    deckB: mkDeck('blue'),
    seed,
  });
}

test('建局：双方 50 牌组、起手 5+首回合抽1、LP=life×2000、DON 牌库 10', () => {
  const s = basicGame();
  assert.equal(s.players[0].hand.length, 6); // 先手已进入首回合（抽1）
  assert.equal(s.players[0].deck.length, 50 - 5 - 1); // LP 制不再抽生命卡，50 全在牌库
  assert.equal(s.players[0].donArea.length, 1);
  assert.equal(s.players[0].donDeck, 9);
  // 后手尚未行动
  assert.equal(s.players[1].hand.length, 5);
  assert.equal(s.players[1].lp, 4 * 2000);
  assert.equal(s.players[1].donDeck, 10);
  assert.equal(s.players[1].donArea.length, 0);
});

test('建局：同 seed 洗牌序列一致', () => {
  const a = basicGame(42);
  const b = basicGame(42);
  assert.deepEqual(a.players[0].hand.map((c) => c.id), b.players[0].hand.map((c) => c.id));
  assert.deepEqual(a.players[1].deck.map((c) => c.id), b.players[1].deck.map((c) => c.id));
});

test('建局：不同 seed 洗牌不同', () => {
  const a = basicGame(1);
  const b = basicGame(2);
  assert.notDeepEqual(a.players[0].hand.map((c) => c.id), b.players[0].hand.map((c) => c.id));
});

test('先手全局第一回合 DON!! 只 +1，且抽了 1 张', () => {
  const s = basicGame();
  assert.equal(s.turn, 1);
  assert.equal(s.active, 0);
  assert.equal(s.players[0].donArea.length, 1); // first turn +1
  assert.equal(s.players[0].hand.length, 6);    // 5 + draw 1
  assert.equal(s.players[0].deck.length, 50 - 5 - 1);
});

test('第二回合（后手）DON!! +2', () => {
  const s = basicGame();
  applyAction(s, { t: 'endTurn', side: 0 });
  assert.equal(s.active, 1);
  assert.equal(s.turn, 1);
  assert.equal(s.players[1].donArea.length, 2);
  assert.equal(s.players[1].hand.length, 6);
});

test('多回合 DON!! 累积：1+2+2+2 ... 直至费用区 10 封顶', () => {
  const s = basicGame();
  for (let i = 0; i < 12; i++) applyAction(s, { t: 'endTurn', side: s.active });
  assert.equal(s.players[0].donArea.length, 10);
  assert.equal(s.players[1].donArea.length, 10);
  assert.equal(s.players[0].donDeck, 0);
});

test('Refresh：己方横置单位回正', () => {
  const s = basicGame();
  setHand(s, 0, [mkChar('C1', 'red', 1, 2000, { keywords: ['rush'] })]);
  applyAction(s, { t: 'playCharacter', side: 0, idx: 0 });
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'char', idx: 0 }, target: 'leader' });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[0].board[0].rest, true);
  applyAction(s, { t: 'endTurn', side: 0 });
  applyAction(s, { t: 'endTurn', side: 1 }); // 轮回 0 方 Refresh
  assert.equal(s.players[0].board[0].rest, false);
});

test('出角色：支付费用=横置等量 DON!!，登场进 board', () => {
  const s = basicGame();
  applyAction(s, { t: 'endTurn', side: 0 }); // p1 回合 2 费
  setHand(s, 1, [mkChar('C1', 'blue', 2, 3000)]);
  applyAction(s, { t: 'playCharacter', side: 1, idx: 0 });
  assert.equal(s.players[1].board.length, 1);
  assert.equal(s.players[1].board[0].id, 'C1');
  assert.equal(usableDons(s.players[1]), 0);
  assert.equal(s.players[1].donArea.filter((d) => d.rest).length, 2);
});

test('出角色：费用不足抛错且状态不变', () => {
  const s = basicGame();
  setHand(s, 0, [mkChar('CX', 'red', 5, 5000)]); // 首回合只有 1 费
  assert.throws(() => applyAction(s, { t: 'playCharacter', side: 0, idx: 0 }), /not enough/);
  assert.equal(s.players[0].board.length, 0);
  assert.equal(s.players[0].hand.length, 1);
});

test('出角色：场上第 6 个抛错', () => {
  const s = basicGame();
  s.players[0].donArea = Array.from({ length: 10 }, (_, i) => ({ id: i, rest: false, attached: null }));
  s.players[0].board = Array.from({ length: 5 }, (_, i) => ({ ...mkChar(`B${i}`, 'red', 1, 1000), rest: false, playedTurn: 0, dons: 0, buffs: [] }));
  setHand(s, 0, [mkChar('C6', 'red', 1, 1000)]);
  assert.throws(() => applyAction(s, { t: 'playCharacter', side: 0, idx: 0 }), /board limit/);
});

test('出事件：执行效果后进垃圾场', () => {
  const s = basicGame();
  const before = s.players[0].hand.length;
  const deckBefore = s.players[0].deck.length;
  setHand(s, 0, [mkEvent('E1', 'red', 1, { hook: 'onPlay', op: { k: 'draw', n: 1 } })]);
  const hand0 = s.players[0].hand.length; // = 1
  applyAction(s, { t: 'playEvent', side: 0, idx: 0 });
  assert.equal(s.players[0].trash.filter((c) => c.id === 'E1').length, 1);
  // 效果抽 1：hand = hand0 - 1(打出) + 1(抽) = hand0；deck 少 1
  assert.equal(s.players[0].hand.length, hand0);
  assert.equal(s.players[0].deck.length, deckBefore - (before - hand0) - 1 >= 0 ? s.players[0].deck.length : 0);
  assert.equal(s.players[0].deck.length, deckBefore - 1);
});

test('出舞台：替换旧舞台，旧的进垃圾场', () => {
  const s = basicGame();
  s.players[0].donArea = Array.from({ length: 5 }, (_, i) => ({ id: i, rest: false, attached: null }));
  setHand(s, 0, [mkStage('S1', 'red', 1), mkStage('S2', 'red', 1)]);
  applyAction(s, { t: 'playStage', side: 0, idx: 0 });
  assert.equal(s.players[0].stage.id, 'S1');
  applyAction(s, { t: 'playStage', side: 0, idx: 0 });
  assert.equal(s.players[0].stage.id, 'S2');
  assert.equal(s.players[0].trash.filter((c) => c.id === 'S1').length, 1);
});

test('附着 DON!!：目标 +1000/张，可用费用减少', () => {
  const s = basicGame();
  applyAction(s, { t: 'endTurn', side: 0 }); // p1 2 费
  setHand(s, 1, [mkChar('C1', 'blue', 1, 3000)]);
  applyAction(s, { t: 'playCharacter', side: 1, idx: 0 });
  applyAction(s, { t: 'giveDon', side: 1, to: { type: 'char', idx: 0 }, count: 1 });
  assert.equal(powerOfUnit(s.players[1].board[0]), 4000);
  assert.equal(usableDons(s.players[1]), 0);
});

test('takeDon：收回附着 DON!!，战力回落、费用恢复', () => {
  const s = basicGame();
  applyAction(s, { t: 'endTurn', side: 0 });
  setHand(s, 1, [mkChar('C1', 'blue', 1, 3000)]);
  applyAction(s, { t: 'playCharacter', side: 1, idx: 0 });
  applyAction(s, { t: 'giveDon', side: 1, to: { type: 'char', idx: 0 }, count: 1 });
  applyAction(s, { t: 'takeDon', side: 1, from: { type: 'char', idx: 0 }, count: 1 });
  assert.equal(powerOfUnit(s.players[1].board[0]), 3000);
  assert.equal(usableDons(s.players[1]), 1);
});

test('Refresh：附着在单位上的 DON!! 自动收回费用区', () => {
  const s = basicGame();
  applyAction(s, { t: 'endTurn', side: 0 });
  setHand(s, 1, [mkChar('C1', 'blue', 1, 3000)]);
  applyAction(s, { t: 'playCharacter', side: 1, idx: 0 });
  applyAction(s, { t: 'giveDon', side: 1, to: { type: 'char', idx: 0 }, count: 1 });
  applyAction(s, { t: 'endTurn', side: 1 });
  applyAction(s, { t: 'endTurn', side: 0 }); // 回到 p1 回合，Refresh 收回
  assert.equal(s.players[1].board[0].dons, 0);
  assert.equal(s.players[1].donArea.filter((d) => d.attached).length, 0);
});

test('召唤症候群：登场回合不能攻击（无 Rush）', () => {
  const s = basicGame();
  s.players[0].donArea = Array.from({ length: 5 }, (_, i) => ({ id: i, rest: false, attached: null }));
  setHand(s, 0, [mkChar('C1', 'red', 1, 3000)]);
  applyAction(s, { t: 'playCharacter', side: 0, idx: 0 });
  assert.throws(() => applyAction(s, {
    t: 'attack', side: 0, attacker: { side: 0, type: 'char', idx: 0 }, target: 'leader',
  }), /summoning sickness/);
});

test('Rush：登场回合即可攻击', () => {
  const s = basicGame();
  s.players[0].donArea = Array.from({ length: 5 }, (_, i) => ({ id: i, rest: false, attached: null }));
  setHand(s, 0, [mkChar('CR', 'red', 1, 3000, { keywords: ['rush'] })]);
  applyAction(s, { t: 'playCharacter', side: 0, idx: 0 });
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'char', idx: 0 }, target: 'leader' });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.pending, null);       // 结算完毕（3000 vs 5000 伤害 0）
  assert.equal(s.players[0].board[0].rest, true);
});

test('攻击目标：对方场上有角色时不能直攻船长，必须指定角色（竖直也可被攻击）', () => {
  const s = basicGame();
  s.players[0].donArea = Array.from({ length: 5 }, (_, i) => ({ id: i, rest: false, attached: null }));
  s.players[1].board = [{ ...mkChar('CB', 'blue', 1, 1000), rest: false, playedTurn: 0, dons: 0, buffs: [] }];
  assert.throws(() => applyAction(s, {
    t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader',
  }), /must attack a character/);
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: { type: 'char', idx: 0 } });
  assert.equal(s.pending.kind, 'counter');
});

test('攻击目标：已横置角色可被攻击（守备表示）', () => {
  const s = basicGame();
  s.players[1].board = [{ ...mkChar('CB', 'blue', 1, 1000), rest: true, playedTurn: 0, dons: 0, buffs: [] }];
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: { type: 'char', idx: 0 } });
  assert.equal(s.pending.kind, 'counter');
});

test('Leader 攻击后不横置：attackedTurn 限每回合一次，下回合恢复（v2 试玩反馈）', () => {
  const s = basicGame();
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[0].leader.rest, false); // 视觉常立（试玩反馈：横放看着傻）
  assert.equal(s.players[0].leader.attackedTurn, s.turn);
  assert.throws(() => applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' }), /already attacked/);
  applyAction(s, { t: 'endTurn', side: 0 }); // 换边+自动开局 → 回到 0 号
  applyAction(s, { t: 'endTurn', side: 1 });
  // 回合递增后 attackedTurn 不再拦截
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' });
  assert.equal(s.pending.kind, 'counter');
});

test('坚壁（blocker）：被攻击时防御战力 +1000，打不动即无战果', () => {
  const s = basicGame();
  // 5000 攻坚壁 4000（守备）：4000+1000=5000，不 > → 守备无战果，坚壁存活
  s.players[1].board = [
    { ...mkChar('BLK', 'blue', 1, 4000, { keywords: ['blocker'] }), rest: true, playedTurn: 0, dons: 0, buffs: [] },
  ];
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: { type: 'char', idx: 0 } });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[1].board.length, 1);
  assert.equal(s.players[1].lp, 4 * 2000); // 守备无差额伤害
});

test('非坚壁角色无防御加成', () => {
  const s = basicGame();
  s.players[1].board = [
    { ...mkChar('NB', 'blue', 1, 4000), rest: true, playedTurn: 0, dons: 0, buffs: [] },
  ];
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: { type: 'char', idx: 0 } });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[1].board.length, 0); // 5000 > 4000：被击沉
});

test('互斗：攻方战力高 → 守方沉 + 守方扣差额 LP', () => {
  const s = basicGame();
  s.players[1].board = [{ ...mkChar('SM', 'blue', 1, 3000), rest: false, playedTurn: 0, dons: 0, buffs: [] }];
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: { type: 'char', idx: 0 } });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[1].board.length, 0);
  assert.equal(s.players[1].lp, 4 * 2000 - 2000); // 5000-3000 差额
});

test('互斗：守方战力高 → 船长攻击不沉、攻方扣差额 LP', () => {
  const s = basicGame();
  s.players[0].leader.power = 4000;
  s.players[1].board = [{ ...mkChar('BIG', 'blue', 1, 6000), rest: false, playedTurn: 0, dons: 0, buffs: [] }];
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: { type: 'char', idx: 0 } });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[1].board.length, 1);   // 守方存活
  assert.equal(s.players[0].lp, 4 * 2000 - 2000); // 攻方扣差额 6000-4000
});

test('互斗：角色攻方被反杀 → 沉+扣差额；相等同归于尽无伤害', () => {
  const s = basicGame();
  s.players[0].donArea = Array.from({ length: 5 }, (_, i) => ({ id: i, rest: false, attached: null }));
  setHand(s, 0, [mkChar('EQ', 'red', 1, 5000, { keywords: ['rush'] })]);
  applyAction(s, { t: 'playCharacter', side: 0, idx: 0 });
  // 攻 5000 互斗守 6000：攻方沉 + 攻方扣 1000
  s.players[1].board = [{ ...mkChar('BIG', 'blue', 1, 6000), rest: false, playedTurn: 0, dons: 0, buffs: [] }];
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'char', idx: 0 }, target: { type: 'char', idx: 0 } });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[0].board.length, 0);
  assert.equal(s.players[1].board.length, 1);
  assert.equal(s.players[0].lp, 4 * 2000 - 1000);
  // 相等：同归于尽（5000 vs 5000）
  s.players[0].donArea = Array.from({ length: 5 }, (_, i) => ({ id: i, rest: false, attached: null }));
  setHand(s, 0, [mkChar('EQ2', 'red', 1, 5000, { keywords: ['rush'] })]);
  applyAction(s, { t: 'playCharacter', side: 0, idx: 0 });
  const lp0 = s.players[0].lp;
  const lp1 = s.players[1].lp;
  s.players[1].board = [{ ...mkChar('EQ3', 'blue', 1, 5000), rest: false, playedTurn: 0, dons: 0, buffs: [] }];
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'char', idx: 0 }, target: { type: 'char', idx: 0 } });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[0].board.length, 0);
  assert.equal(s.players[1].board.length, 0);
  assert.equal(s.players[0].lp, lp0); // 相等无伤害
  assert.equal(s.players[1].lp, lp1);
});

test('Counter：弃手牌 counter 卡抵消直攻伤害', () => {
  const s = basicGame();
  s.players[1].hand = [mkChar('CTR', 'blue', 1, 1000, { counter: 1000 })];
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' }); // 5000 vs 5000
  applyAction(s, { t: 'counter', side: 1, cards: [0] });
  assert.equal(s.pending.counterBoost, 1000);
  assert.equal(s.players[1].hand.length, 0);
  assert.equal(s.players[1].trash.length, 1);
  applyAction(s, { t: 'passCounter', side: 1 });
  // 5000 vs 5000+1000：伤害=差额 0，LP 不动
  assert.equal(s.players[1].lp, 4 * 2000);
  assert.equal(s.players[1].hand.length, 0);
});

test('无 counter 值的卡不能用作 Counter', () => {
  const s = basicGame();
  s.players[1].hand = [mkChar('NC', 'blue', 1, 1000)];
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' });
  assert.throws(() => applyAction(s, { t: 'counter', side: 1, cards: [0] }), /no counter/);
});

test('Counter 可多次累加（+2000 双卡）', () => {
  const s = basicGame();
  s.players[1].hand = [
    mkChar('C1', 'blue', 1, 1000, { counter: 1000 }),
    mkChar('C2', 'blue', 1, 1000, { counter: 1000 }),
  ];
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' });
  applyAction(s, { t: 'counter', side: 1, cards: [1] }); // 注意 splice 后索引位移：先出高索引
  applyAction(s, { t: 'counter', side: 1, cards: [0] });
  assert.equal(s.pending.counterBoost, 2000);
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.pending, null);
});

test('直攻结算：伤害=战力差额扣 LP', () => {
  const s = basicGame();
  s.players[0].leader.power = 6000; // 强攻
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[1].lp, 4 * 2000 - 1000);
});

test('直攻结算：攻方 power < 防守方 → 伤害 0（攻击者不受损但已横置）', () => {
  const s = basicGame();
  s.players[0].leader.power = 4000; // 弱攻 5000 防守
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[1].lp, 4 * 2000);
  assert.equal(s.players[0].leader.attackedTurn, s.turn); // 攻击宣告已成立（leader 不横置，attackedTurn 记账）
});

test('守备击沉：攻击已横置角色，打得动即 KO，无 LP 伤害', () => {
  const s = basicGame();
  s.players[1].board = [{ ...mkChar('VIC', 'blue', 1, 1000), rest: true, playedTurn: 0, dons: 0, buffs: [] }];
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: { type: 'char', idx: 0 } });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[1].board.length, 0);
  assert.equal(s.players[1].trash.filter((c) => c.id === 'VIC').length, 1);
  assert.equal(s.players[1].lp, 4 * 2000); // 打角色无 LP 伤害
});

test('胜利：LP 扣到 0 即胜', () => {
  const s = basicGame();
  s.players[0].leader.power = 6000;
  s.players[1].lp = 1000; // 差额 1000 一击致命
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.winner, 0);
  assert.equal(s.winReason, 'lp');
  assert.throws(() => applyAction(s, { t: 'endTurn', side: 0 }), /game over/);
});

test('Double Attack：直攻差额伤害 ×2', () => {
  const s = basicGame();
  s.players[0].leader.power = 6000;
  s.players[0].leader.keywords = ['doubleAttack'];
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[1].lp, 4 * 2000 - 2000); // (6000-5000)×2
});

test('Banish（猛击）：直攻伤害额外 +2000', () => {
  const s = basicGame();
  s.players[0].leader.power = 6000;
  s.players[0].leader.keywords = ['banish'];
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[1].lp, 4 * 2000 - 3000); // 1000+2000
});

test('LP 制：直攻不补手牌（无生命卡机制）', () => {
  const s = basicGame();
  s.players[0].leader.power = 6000;
  const handBefore = s.players[1].hand.length;
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[1].hand.length, handBefore);
  assert.equal(s.players[1].trash.length, 0);
});

test('On Play：登场抽牌', () => {
  const s = basicGame();
  s.players[0].donArea = Array.from({ length: 5 }, (_, i) => ({ id: i, rest: false, attached: null }));
  setHand(s, 0, [mkChar('DRW', 'red', 1, 2000, { effect: { hook: 'onPlay', op: { k: 'draw', n: 1 } } })]);
  const deckBefore = s.players[0].deck.length;
  applyAction(s, { t: 'playCharacter', side: 0, idx: 0 });
  assert.equal(s.players[0].hand.length, 1); // 打出-1，抽+1
  assert.equal(s.players[0].deck.length, deckBefore - 1);
});

test('When Attacking：宣告攻击时给自己 +2000（battle 生效）', () => {
  const s = basicGame();
  s.players[0].donArea = Array.from({ length: 5 }, (_, i) => ({ id: i, rest: false, attached: null }));
  setHand(s, 0, [mkChar('WA', 'red', 1, 4000, {
    keywords: ['rush'],
    effect: { hook: 'whenAttacking', op: { k: 'powerSelf', x: 2000, until: 'battle' } },
  })]);
  applyAction(s, { t: 'playCharacter', side: 0, idx: 0 });
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'char', idx: 0 }, target: 'leader' });
  // 4000+2000=6000 vs 5000：伤害=差额 1000
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[1].lp, 4 * 2000 - 1000);
  // battle buff 已清算
  assert.equal(powerOfUnit(s.players[0].board[0]), 4000);
});

test('On K.O.：被击倒时触发（敌方视角）', () => {
  const s = basicGame();
  const koCard = mkChar('KOD', 'blue', 1, 1000, { effect: { hook: 'onKO', op: { k: 'draw', n: 1 } } });
  s.players[1].board = [{ ...koCard, rest: true, playedTurn: 0, dons: 0, buffs: [] }];
  const deckBefore = s.players[1].deck.length;
  const handBefore = s.players[1].hand.length;
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: { type: 'char', idx: 0 } });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[1].hand.length, handBefore + 1);
  assert.equal(s.players[1].deck.length, deckBefore - 1);
});

test('koWeakest 算子：击倒敌方战力最低角色', () => {
  const s = basicGame();
  s.players[0].donArea = Array.from({ length: 5 }, (_, i) => ({ id: i, rest: false, attached: null }));
  s.players[1].board = [
    { ...mkChar('W1', 'blue', 1, 5000), rest: true, playedTurn: 0, dons: 0, buffs: [] },
    { ...mkChar('W2', 'blue', 1, 1000), rest: true, playedTurn: 0, dons: 0, buffs: [] },
  ];
  setHand(s, 0, [mkEvent('KILL', 'red', 1, { hook: 'onPlay', op: { k: 'koWeakest' } })]);
  applyAction(s, { t: 'playEvent', side: 0, idx: 0 });
  assert.equal(s.players[1].board.length, 1);
  assert.equal(s.players[1].board[0].id, 'W1');
});

test('gainDon 算子：额外翻 DON!!', () => {
  const s = basicGame();
  s.players[0].donArea = Array.from({ length: 5 }, (_, i) => ({ id: i, rest: false, attached: null }));
  setHand(s, 0, [mkEvent('GD', 'red', 1, { hook: 'onPlay', op: { k: 'gainDon', n: 2 } })]);
  applyAction(s, { t: 'playEvent', side: 0, idx: 0 });
  assert.equal(s.players[0].donArea.length, 7);
  assert.equal(s.players[0].donDeck, 7); // 10 - 1(首回合startTurn) - 2(gainDon)
});

test('抽空判负：deck 空时进入回合即败', () => {
  const s = basicGame();
  s.players[0].deck = [];
  applyAction(s, { t: 'endTurn', side: 0 });
  applyAction(s, { t: 'endTurn', side: 1 }); // 回到 0 方 startTurn：draw 阶段 deck 空
  assert.equal(s.winner, 1);
  assert.equal(s.winReason, 'deckout');
});

test('行动权：非行动方操作抛错', () => {
  const s = basicGame();
  assert.throws(() => applyAction(s, { t: 'playCharacter', side: 1, idx: 0 }), /not your turn/);
});

test('行动权：响应窗口只有防守方能响应', () => {
  const s = basicGame();
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' });
  assert.throws(() => applyAction(s, { t: 'passCounter', side: 0 }), /not your response/);
});

test('行动权：响应窗口未关闭不能 endTurn/出牌', () => {
  const s = basicGame();
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' });
  assert.throws(() => applyAction(s, { t: 'endTurn', side: 0 }), /not your response window/);
  assert.throws(() => applyAction(s, { t: 'playCharacter', side: 0, idx: 0 }), /not your response window/);
});

test('合法性：标准 50 同色卡组通过', () => {
  const leader = mkLeader('LA', 'red', 4, 5000);
  const deck = mkDeck('red');
  assert.deepEqual(validateDeck(leader, deck), []);
});

test('合法性：49 张报错', () => {
  const errs = validateDeck(mkLeader('LA', 'red'), mkDeck('red').slice(1));
  assert.ok(errs.some((e) => /deck size/.test(e)));
});

test('合法性：颜色不匹配报错', () => {
  const deck = mkDeck('blue'); // blue 卡 + red leader
  const errs = validateDeck(mkLeader('LA', 'red'), deck);
  assert.ok(errs.some((e) => /mismatches/.test(e)));
});

test('合法性：同卡超 4 张报错', () => {
  const leader = mkLeader('LA', 'red');
  const deck = Array.from({ length: 50 }, (_, i) => mkChar(`X${i % 5}`, 'red', 1, 1000));
  const errs = validateDeck(leader, deck); // 每张 X0-X4 各 10 张
  assert.ok(errs.some((e) => /max 4/.test(e)));
});

test('合法性：Leader 卡不能入组', () => {
  const leader = mkLeader('LA', 'red');
  const deck = [...mkDeck('red').slice(1), mkLeader('SPY', 'red', 4, 5000)];
  const errs = validateDeck(leader, deck);
  assert.ok(errs.some((e) => /cannot be in deck/.test(e)));
});

test('回放确定性：同 seed 同动作序列 → 终态完全一致', () => {
  const run = () => {
    const s = basicGame(99);
    const script = [
      { t: 'endTurn', side: 0 },
      { t: 'endTurn', side: 1 },
      { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' },
      { t: 'passCounter', side: 1 },
      { t: 'endTurn', side: 0 },
      { t: 'endTurn', side: 1 },
    ];
    for (const a of script) {
      if (s.winner !== null) break;
      applyAction(s, a);
    }
    return s;
  };
  const a = run();
  const b = run();
  delete a.rng; delete b.rng;
  assert.deepEqual(a, b);
});

// ===== 恶魔果实三系克制（批1 战斗体系：超人→自然→动物→超人，攻击方 +1000）=====
test('果实克制环：三向循环成立、反向/同系/无果实均不生效', () => {
  const P = { fruit: 'paramecia' }, L = { fruit: 'logia' }, Z = { fruit: 'zoan' };
  assert.equal(fruitEdge(P, L), 1000, '超人克自然');
  assert.equal(fruitEdge(L, Z), 1000, '自然克动物');
  assert.equal(fruitEdge(Z, P), 1000, '动物克超人');
  assert.equal(fruitEdge(L, P), 0, '反向不克制');
  assert.equal(fruitEdge(P, P), 0, '同系不克制');
  assert.equal(fruitEdge(P, {}), 0, '守方无果实');
  assert.equal(fruitEdge({}, L), 0, '攻方无果实');
});

test('果实克制：互斗按克制后战力结算，clash 事件携带 fruitEdge', () => {
  const s = basicGame();
  const u = (id, color, power, fruit) =>
    ({ ...mkChar(id, color, 1, power, { fruit }), rest: false, playedTurn: 0, dons: 0, buffs: [] });
  s.players[0].board = [u('A1', 'red', 5000, 'paramecia')];
  s.players[1].board = [u('D1', 'blue', 5000, 'logia')];
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'char', idx: 0 }, target: { type: 'char', idx: 0 } });
  applyAction(s, { t: 'passCounter', side: 1 });
  const clash = s.log.find((e) => e.t === 'clash');
  assert.equal(clash.fruitEdge, 1000);
  assert.equal(clash.atkPower, 6000); // 5000 + 克制 1000
  assert.equal(s.players[1].board.length, 0); // 守方被击沉
  assert.equal(s.players[1].lp, 4 * 2000 - 1000); // 差额扣 LP
});

test('果实克制：直攻船长同样吃克制（船长带果实时）', () => {
  const s = newGame({
    leaderA: mkLeader('LA', 'red', 4, 5000, { fruit: 'paramecia' }),
    deckA: mkDeck('red'),
    leaderB: mkLeader('LB', 'blue', 4, 5000, { fruit: 'logia' }),
    deckB: mkDeck('blue'),
    seed: 7,
  });
  s.players[0].board = [];
  s.players[1].board = []; // 场空 → 可直攻
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' });
  applyAction(s, { t: 'passCounter', side: 1 });
  const clash = s.log.find((e) => e.t === 'clash');
  assert.equal(clash.fruitEdge, 1000);
  assert.equal(clash.atkPower, 6000);
  assert.equal(s.players[1].lp, 4 * 2000 - 1000); // dmg = 6000 − 5000
});

// ===== 武器装备（批2：附着角色持久增益，每角色限 1 件，替换式）=====
const mkGear = (id, color, cost, gear) =>
  ({ id, name: id, sub: '', type: 'gear', color, cost, power: null, counter: null, keywords: [], gear, effect: null, fruit: null });

test('装备：武器附着战力永久 +，角色被击沉装备随之进墓场', () => {
  const s = basicGame();
  applyAction(s, { t: 'endTurn', side: 0 });
  s.players[1].donArea = Array.from({ length: 10 }, (_, i) => ({ id: i, rest: false, attached: null }));
  setHand(s, 1, [mkChar('C1', 'blue', 1, 3000)]);
  applyAction(s, { t: 'playCharacter', side: 1, idx: 0 });
  setHand(s, 1, [mkGear('W1', 'blue', 2, { atk: 2000 })]);
  applyAction(s, { t: 'playGear', side: 1, idx: 0, to: { type: 'char', idx: 0 } });
  assert.equal(powerOfUnit(s.players[1].board[0]), 5000); // 3000 + 2000
  // 甲方 6000 攻击击沉 → 装备随角色进墓
  s.players[0].leader.power = 6000;
  applyAction(s, { t: 'endTurn', side: 1 });
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: { type: 'char', idx: 0 } });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[1].board.length, 0);
  assert.ok(s.players[1].trash.some((c) => c.id === 'W1'), '装备未随葬');
});

test('装备：甲胄 gives blocker——防御战力 +1K（装备词条归并）', () => {
  const s = basicGame();
  applyAction(s, { t: 'endTurn', side: 0 });
  s.players[1].donArea = Array.from({ length: 10 }, (_, i) => ({ id: i, rest: false, attached: null }));
  setHand(s, 1, [mkChar('C1', 'blue', 1, 4000)]);
  applyAction(s, { t: 'playCharacter', side: 1, idx: 0 });
  setHand(s, 1, [mkGear('A1', 'blue', 2, { atk: 1000, gives: ['blocker'] })]);
  applyAction(s, { t: 'playGear', side: 1, idx: 0, to: { type: 'char', idx: 0 } });
  // 5000 攻 vs 4000+1000(装备)+1000(坚壁)=6000：守方反超 → 攻方扣差额，守方存活
  applyAction(s, { t: 'endTurn', side: 1 });
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: { type: 'char', idx: 0 } });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[1].board.length, 1);
  assert.equal(s.players[0].lp, 4 * 2000 - 1000);
});

test('装备：替换旧件进墓场；非法目标/非装备卡抛错', () => {
  const s = basicGame();
  applyAction(s, { t: 'endTurn', side: 0 });
  s.players[1].donArea = Array.from({ length: 10 }, (_, i) => ({ id: i, rest: false, attached: null }));
  setHand(s, 1, [mkChar('C1', 'blue', 1, 3000)]);
  applyAction(s, { t: 'playCharacter', side: 1, idx: 0 });
  setHand(s, 1, [mkGear('W1', 'blue', 2, { atk: 1000 }), mkGear('W2', 'blue', 2, { atk: 2000 })]);
  // 非法目标（此时手牌还有装备卡，先校验目标路径）
  assert.throws(() => applyAction(s, { t: 'playGear', side: 1, idx: 0, to: { type: 'char', idx: 5 } }), /not found/);
  setHand(s, 1, [mkChar('NC', 'blue', 1, 1000)]);
  assert.throws(() => applyAction(s, { t: 'playGear', side: 1, idx: 0, to: { type: 'char', idx: 0 } }), /not a gear/);
  setHand(s, 1, [mkGear('W1', 'blue', 2, { atk: 1000 }), mkGear('W2', 'blue', 2, { atk: 2000 })]);
  applyAction(s, { t: 'playGear', side: 1, idx: 0, to: { type: 'char', idx: 0 } });
  applyAction(s, { t: 'playGear', side: 1, idx: 0, to: { type: 'char', idx: 0 } }); // 替换
  assert.equal(powerOfUnit(s.players[1].board[0]), 5000); // 3000 + W2 的 2000
  assert.ok(s.players[1].trash.some((c) => c.id === 'W1'), '旧件未进墓场');
});

// ===== 船长技能（批3：onAllyKO / onKill 钩子）=====
test('船长技能：罗 ROOM·回收——己方角色被击沉时抽 1 张', () => {
  const s = basicGame();
  s.players[1].leader.effect = { hook: 'onAllyKO', op: { k: 'draw', n: 1 } };
  applyAction(s, { t: 'endTurn', side: 0 });
  setHand(s, 1, [mkChar('C1', 'blue', 1, 3000)]);
  applyAction(s, { t: 'playCharacter', side: 1, idx: 0 });
  applyAction(s, { t: 'endTurn', side: 1 });
  // 甲方船长 6000 吃掉 3000 → 乙方阵亡补偿抽 1（弱侧负反馈，SPEC 即此语义）
  s.players[0].leader.power = 6000;
  const hand1 = s.players[1].hand.length, deck1 = s.players[1].deck.length;
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: { type: 'char', idx: 0 } });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[1].board.length, 0, '角色应被击沉');
  assert.equal(s.players[1].hand.length, hand1 + 1, '被击沉方应抽 1');
  assert.equal(s.players[1].deck.length, deck1 - 1);
});

test('onKill 钩子：reqAttacker=leader 门槛——船长击沉触发抽牌、角色击沉不触发', () => {
  const s = basicGame();
  s.players[0].leader.effect = { hook: 'onKill', op: { k: 'draw', n: 1, reqAttacker: 'leader' } };
  // A 出 6000 角色，B 出 3000 角色互送
  setHand(s, 0, [mkChar('K1', 'red', 1, 6000)]);
  applyAction(s, { t: 'playCharacter', side: 0, idx: 0 });
  applyAction(s, { t: 'endTurn', side: 0 });
  setHand(s, 1, [mkChar('V1', 'blue', 1, 3000)]);
  applyAction(s, { t: 'playCharacter', side: 1, idx: 0 });
  applyAction(s, { t: 'endTurn', side: 1 });
  // A 回合：角色 K1 吃掉 V1 —— 攻击者是角色，门槛不满足，不抽
  let hand0 = s.players[0].hand.length, deck0 = s.players[0].deck.length;
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'char', idx: 0 }, target: { type: 'char', idx: 0 } });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[1].board.length, 0);
  assert.equal(s.players[0].hand.length, hand0, '角色击沉不应触发 reqAttacker=leader');
  assert.equal(s.players[0].deck.length, deck0);
  // B 再送一个，A 船长击沉 → 触发抽 1
  applyAction(s, { t: 'endTurn', side: 0 }); // 场景 a 攻完仍在 A 回合，先交回
  setHand(s, 1, [mkChar('V2', 'blue', 1, 3000)]);
  applyAction(s, { t: 'playCharacter', side: 1, idx: 0 });
  applyAction(s, { t: 'endTurn', side: 1 });
  s.players[0].leader.power = 6000;
  hand0 = s.players[0].hand.length; deck0 = s.players[0].deck.length;
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: { type: 'char', idx: 0 } });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[1].board.length, 0);
  assert.equal(s.players[0].hand.length, hand0 + 1, '船长击沉应抽 1');
  assert.equal(s.players[0].deck.length, deck0 - 1);
});
