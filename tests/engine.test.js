// M0 引擎单测：阶段流转 / DON!! / 出牌 / 附着 / 战斗五步 / 全词条 / 胜负 / 合法性 / 确定性回放
import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, applyAction, validateDeck, powerOfUnit, leaderPower, usableDons } from '../engine/index.js';
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

test('建局：双方 50 牌组、起手 5+首回合抽1、Life=leader.life、DON 牌库 10', () => {
  const s = basicGame();
  assert.equal(s.players[0].hand.length, 6); // 先手已进入首回合（抽1）
  assert.equal(s.players[0].deck.length, 50 - 4 - 5 - 1);
  assert.equal(s.players[0].donArea.length, 1);
  assert.equal(s.players[0].donDeck, 9);
  // 后手尚未行动
  assert.equal(s.players[1].hand.length, 5);
  assert.equal(s.players[1].life.length, 4);
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
  assert.equal(s.players[0].deck.length, 50 - 4 - 5 - 1);
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
  applyAction(s, { t: 'passBlock', side: 1 });
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
  assert.ok(s.pending || s.players[1].life.length < 4 || s.players[0].board[0].rest);
  assert.equal(s.players[0].board[0].rest, true);
});

test('攻击目标：竖直（未横置）角色不可被攻击', () => {
  const s = basicGame();
  s.players[0].donArea = Array.from({ length: 5 }, (_, i) => ({ id: i, rest: false, attached: null }));
  s.players[1].board = [{ ...mkChar('CB', 'blue', 1, 1000), rest: false, playedTurn: 0, dons: 0, buffs: [] }];
  assert.throws(() => applyAction(s, {
    t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: { type: 'char', idx: 0 },
  }), /rested characters/);
});

test('攻击目标：已横置角色可被攻击', () => {
  const s = basicGame();
  s.players[1].board = [{ ...mkChar('CB', 'blue', 1, 1000), rest: true, playedTurn: 0, dons: 0, buffs: [] }];
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: { type: 'char', idx: 0 } });
  assert.equal(s.pending.kind, 'block');
});

test('Leader 攻击后横置（每回合一次的天然限制）', () => {
  const s = basicGame();
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' });
  applyAction(s, { t: 'passBlock', side: 1 });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[0].leader.rest, true);
  assert.throws(() => applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' }), /rested/);
});

test('Blocker：可顶包成为目标并横置', () => {
  const s = basicGame();
  s.players[1].board = [
    { ...mkChar('BLK', 'blue', 1, 4000, { keywords: ['blocker'] }), rest: false, playedTurn: 0, dons: 0, buffs: [] },
  ];
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' });
  applyAction(s, { t: 'block', side: 1, idx: 0 });
  assert.equal(s.pending.target.type, 'char');
  assert.equal(s.pending.target.idx, 0);
  assert.equal(s.players[1].board[0].rest, true);
});

test('非 Blocker 不能顶包', () => {
  const s = basicGame();
  s.players[1].board = [
    { ...mkChar('NB', 'blue', 1, 4000), rest: false, playedTurn: 0, dons: 0, buffs: [] },
  ];
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' });
  assert.throws(() => applyAction(s, { t: 'block', side: 1, idx: 0 }), /Blocker/);
});

test('Counter：弃手牌 counter 卡 +1000 防御力', () => {
  const s = basicGame();
  s.players[1].hand = [mkChar('CTR', 'blue', 1, 1000, { counter: 1000 })];
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' }); // 5000 vs 5000
  applyAction(s, { t: 'passBlock', side: 1 });
  applyAction(s, { t: 'counter', side: 1, cards: [0] });
  assert.equal(s.pending.counterBoost, 1000);
  assert.equal(s.players[1].hand.length, 0);
  assert.equal(s.players[1].trash.length, 1);
  applyAction(s, { t: 'passCounter', side: 1 });
  // 5000 vs 5000+1000：攻击失败，无 Life 流失
  assert.equal(s.players[1].life.length, 4);
  assert.equal(s.players[1].hand.length, 0);
});

test('无 counter 值的卡不能用作 Counter', () => {
  const s = basicGame();
  s.players[1].hand = [mkChar('NC', 'blue', 1, 1000)];
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' });
  applyAction(s, { t: 'passBlock', side: 1 });
  assert.throws(() => applyAction(s, { t: 'counter', side: 1, cards: [0] }), /no counter/);
});

test('Counter 可多次累加（+2000 双卡）', () => {
  const s = basicGame();
  s.players[1].hand = [
    mkChar('C1', 'blue', 1, 1000, { counter: 1000 }),
    mkChar('C2', 'blue', 1, 1000, { counter: 1000 }),
  ];
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' });
  applyAction(s, { t: 'passBlock', side: 1 });
  applyAction(s, { t: 'counter', side: 1, cards: [1] }); // 注意 splice 后索引位移：先出高索引
  applyAction(s, { t: 'counter', side: 1, cards: [0] });
  assert.equal(s.pending.counterBoost, 2000);
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.pending, null);
});

test('结算：攻击方 power ≥ 防守 Leader → 翻 Life 入手牌', () => {
  const s = basicGame();
  s.players[0].leader.power = 6000; // 强攻
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' });
  applyAction(s, { t: 'passBlock', side: 1 });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[1].life.length, 3);
  assert.equal(s.players[1].hand.length, 6); // 5 起手+1 回合抽+1 Life
});

test('结算：攻击方 power < 防守方 → 无事发生（攻击者不受损）', () => {
  const s = basicGame();
  s.players[0].leader.power = 4000; // 弱攻 5000 防守
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' });
  applyAction(s, { t: 'passBlock', side: 1 });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[1].life.length, 4);
  assert.equal(s.players[0].leader.rest, true); // 但攻击宣告已成立
});

test('击倒角色：攻击已横置角色，胜方 K.O. 败方进垃圾场', () => {
  const s = basicGame();
  s.players[1].board = [{ ...mkChar('VIC', 'blue', 1, 1000), rest: true, playedTurn: 0, dons: 0, buffs: [] }];
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: { type: 'char', idx: 0 } });
  applyAction(s, { t: 'passBlock', side: 1 });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[1].board.length, 0);
  assert.equal(s.players[1].trash.filter((c) => c.id === 'VIC').length, 1);
  assert.equal(s.players[1].life.length, 4); // 打角色不伤 Life
});

test('胜利：Life 清空后再伤 Leader 即胜', () => {
  const s = basicGame();
  s.players[1].life = [];
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' });
  applyAction(s, { t: 'passBlock', side: 1 });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.winner, 0);
  assert.equal(s.winReason, 'leader');
  assert.throws(() => applyAction(s, { t: 'endTurn', side: 0 }), /game over/);
});

test('Double Attack：对 Leader 一击翻 2 张 Life', () => {
  const s = basicGame();
  s.players[0].leader.power = 6000;
  s.players[0].leader.keywords = ['doubleAttack'];
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' });
  applyAction(s, { t: 'passBlock', side: 1 });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[1].life.length, 2);
  assert.equal(s.players[1].hand.length, 7);
});

test('Banish：受伤 Life 直接进垃圾场，不入手牌', () => {
  const s = basicGame();
  s.players[0].leader.power = 6000;
  s.players[0].leader.keywords = ['banish'];
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' });
  applyAction(s, { t: 'passBlock', side: 1 });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[1].life.length, 3);
  assert.equal(s.players[1].hand.length, 6 - 1); // 无 Life 补牌：起手5+抽1
  assert.equal(s.players[1].trash.length, 1);
});

test('Trigger：翻出的 Life 卡自动发动触发效果', () => {
  const s = basicGame();
  s.players[0].leader.power = 6000;
  s.players[1].life = [mkChar('TRG', 'blue', 1, 1000, { effect: { hook: 'trigger', op: { k: 'draw', n: 1 } } })];
  const deckBefore = s.players[1].deck.length;
  const handBefore = s.players[1].hand.length;
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' });
  applyAction(s, { t: 'passBlock', side: 1 });
  applyAction(s, { t: 'passCounter', side: 1 });
  // Life 入手(+1) + trigger 抽牌(+1)
  assert.equal(s.players[1].hand.length, handBefore + 2);
  assert.equal(s.players[1].deck.length, deckBefore - 1);
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
  // 4000+2000=6000 vs 5000：命中
  applyAction(s, { t: 'passBlock', side: 1 });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[1].life.length, 3);
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
  applyAction(s, { t: 'passBlock', side: 1 });
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
  assert.throws(() => applyAction(s, { t: 'passBlock', side: 0 }), /not your response/);
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
      { t: 'passBlock', side: 1 },
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
