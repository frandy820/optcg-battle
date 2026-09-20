// v2 船长分化引擎单测：skills 数组 / oncePerTurn 阀门 / cond 残血觉醒 / whenAttacked / 新算子
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { newGame, applyAction, powerOfUnit, leaderPower } from '../engine/index.js';
import { mkLeader, mkChar, mkDeck, setHand } from './fixtures.js';

function mkGame(skillsA, skillsB = [], lifeA = 5, lifeB = 5) {
  const a = mkLeader('LA', 'red', lifeA, 5000, { skills: skillsA });
  const b = mkLeader('LB', 'blue', lifeB, 5000, { skills: skillsB });
  return newGame({ leaderA: a, deckA: mkDeck('red'), leaderB: b, deckB: mkDeck('blue'), seed: 7 });
}

test('v2: skills 数组多技同钩子全部触发（艾斯火拳复合+觉醒直伤不越线）', () => {
  const s = mkGame([
    { name: '火拳', hook: 'whenAttacking', op: [{ k: 'discard', n: 1 }, { k: 'powerSelf', x: 2000, until: 'battle' }] },
    { name: '觉醒·炎帝', hook: 'whenAttacking', op: { k: 'damageLP', x: 1000 }, cond: { lpMax: 4000 } },
  ]);
  setHand(s, 0, [mkChar('H1', 'red')]);
  s.players[1].board = []; // 空场可直攻
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[0].trash.length, 1, '弃 1 张手牌进墓场');
  // 5000+2000 vs 5000 → 差额 2000;LP 满 10000 不触发觉醒直伤
  assert.equal(s.players[1].lp, 8000, '差额 2000、无觉醒直伤');
});

test('v2: 复合 op 原子性——手牌不足整条跳过（无代价不白给增益）', () => {
  const s = mkGame([
    { name: '火拳', hook: 'whenAttacking', op: [{ k: 'discard', n: 1 }, { k: 'powerSelf', x: 2000, until: 'battle' }] },
  ]);
  setHand(s, 0, []);
  s.players[1].board = [];
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[1].lp, 10000, '无手牌=无增益=零差额零伤害');
});

test('v2: cond lpMax 残血觉醒——LP 高不触发、过线触发', () => {
  const s = mkGame([
    { name: '觉醒·五档', hook: 'onTurnStart', op: { k: 'draw', n: 1 }, cond: { lpMax: 4000 }, oncePerTurn: true },
  ]);
  const lp0 = s.players[0].lp;
  const hand0 = s.players[0].hand.length;
  applyAction(s, { t: 'endTurn', side: 0 });
  applyAction(s, { t: 'endTurn', side: 1 }); // AI 无动作直接结束（无 AI 驱动，纯引擎层）
  assert.equal(s.active, 0);
  assert.equal(s.players[0].hand.length, hand0 + 1, '回合开始常规抽 1，无觉醒抽');
  assert.equal(lp0, 10000);
  s.players[0].lp = 4000;
  const hand1 = s.players[0].hand.length;
  applyAction(s, { t: 'endTurn', side: 0 });
  applyAction(s, { t: 'endTurn', side: 1 });
  assert.equal(s.players[0].hand.length, hand1 + 2, `过线后回合开始抽 2（常规1+觉醒1）`);
});

test('v2: oncePerTurn 阀门——同回合第二次攻击不重复触发，下回合恢复', () => {
  // 用 whenAttacked 测（一回合可被攻多次的真实场景）：汉库珂被攻 +1000，每回合限 1 次
  const s = mkGame([], [
    { name: '霸王色的魅力', hook: 'whenAttacked', op: { k: 'powerLeader', x: 1000, until: 'battle' }, oncePerTurn: true },
  ]);
  const mkAtk = () => { s.players[0].board = [s.players[0].board[0] || { ...mkChar('A1', 'red', 9, 9000), rest: false, playedTurn: 0, dons: 0, buffs: [], gears: [] }]; };
  s.players[0].board = []; // 船长直攻
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' });
  applyAction(s, { t: 'passCounter', side: 1 });
  mkAtk();
  // 第二次攻击（用竖着的高战力角色再打一次）
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'char', idx: 0 }, target: 'leader' });
  const def2 = leaderPower(s.players[1]);
  applyAction(s, { t: 'passCounter', side: 1 });
  // 第二次被攻时 oncePerTurn 已记账：无 +1000（9000 vs 5000+0）
  assert.equal(def2, 5000, '同回合第二次被攻不再 +1000');
  // 过回合后恢复
  applyAction(s, { t: 'endTurn', side: 0 });
  applyAction(s, { t: 'endTurn', side: 1 });
  s.players[0].board = [{ ...mkChar('A2', 'red', 9, 9000), rest: false, playedTurn: 0, dons: 0, buffs: [], gears: [] }];
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'char', idx: 0 }, target: 'leader' });
  assert.equal(leaderPower(s.players[1]), 6000, '新回合阀门重置：再次 +1000');
  applyAction(s, { t: 'passCounter', side: 1 });
});

test('v2: whenAttacked 防御钩子——被攻时船长临时 +1000（battle 后清）', () => {
  const s = mkGame([], [
    { name: '霸王色的魅力', hook: 'whenAttacked', op: { k: 'powerLeader', x: 1000, until: 'battle' }, oncePerTurn: true },
  ]);
  s.players[0].board = [];
  const def0 = leaderPower(s.players[1]);
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' });
  assert.equal(leaderPower(s.players[1]), def0 + 1000, '被攻击时防御战力 +1000');
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(leaderPower(s.players[1]), def0, '战斗结束增益清空');
});

test('v2: restEnemy target=strongest 精确横置战力最高者', () => {
  const s = mkGame([{ name: '虏之箭', hook: 'whenAttacking', op: { k: 'restEnemy', target: 'strongest' } }]);
  s.players[1].board = [
    { ...mkChar('W1', 'blue', 1, 2000), rest: false, playedTurn: 0, dons: 0, buffs: [], gears: [] },
    { ...mkChar('S1', 'blue', 1, 6000), rest: false, playedTurn: 0, dons: 0, buffs: [], gears: [] },
  ];
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: { type: 'char', idx: 0 } });
  assert.equal(s.players[1].board[1].rest, true, '横置战力最高者 S1');
  assert.equal(s.players[1].board[0].rest, false, 'W1 不受影响');
  applyAction(s, { t: 'passCounter', side: 1 });
});

test('v2: damageLP 直伤可终局（凯多雷鸣八卦·互斗差额+直伤叠加）', () => {
  const s = mkGame([{ name: '雷鸣八卦', hook: 'onKill', op: { k: 'damageLP', x: 1000 }, oncePerTurn: true }]);
  s.players[1].board = [{ ...mkChar('W1', 'blue', 1, 3000), rest: false, playedTurn: 0, dons: 0, buffs: [], gears: [] }];
  s.players[1].lp = 1500;
  // 竖置互斗：5000 vs 3000 → 击沉触发 onKill 直伤 1000（lp→500）+ 差额 2000（→-1500 胜）
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: { type: 'char', idx: 0 } });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.winner, 0, '击沉直伤+差额把 LP 打穿即胜');
  assert.equal(s.winReason, 'lp');
});

test('v2: debuffFoeAll 全体削弱（寄生线·船长攻击宣告触发）', () => {
  const s = mkGame([{ name: '寄生线', hook: 'whenAttacking', op: { k: 'debuffFoeAll', x: 1000, until: 'battle' } }]);
  s.players[0].board = []; // 船长直接进攻对方角色（船长技能语义=船长攻击宣告时）
  s.players[1].board = [{ ...mkChar('W1', 'blue', 1, 3000), rest: false, playedTurn: 0, dons: 0, buffs: [], gears: [] }];
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: { type: 'char', idx: 0 } });
  assert.equal(powerOfUnit(s.players[1].board[0]), 2000, '被寄生线削弱 -1000（窗口期 buff 已挂）');
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[1].board.length, 0, '5000 vs 2000 击沉');
});

test('v2: 旧版单 effect 字段完全兼容（旧回放/旧卡池不受影响）', () => {
  const a = mkLeader('LA', 'red', 5, 5000, { effect: { hook: 'whenAttacking', op: { k: 'powerSelf', x: 1000, until: 'battle' } } });
  const s = newGame({ leaderA: a, deckA: mkDeck('red'), leaderB: mkLeader('LB', 'blue', 5, 5000), deckB: mkDeck('blue'), seed: 3 });
  s.players[1].board = [];
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'leader' }, target: 'leader' });
  applyAction(s, { t: 'passCounter', side: 1 });
  assert.equal(s.players[1].lp, 9000, '旧 effect 单数照常 +1000 打出 1000 差额');
});

test('v2: 真卡池 12 船长 skills 结构与三档分布（3/6/3）', () => {
  const d = JSON.parse(readFileSync('./data/cards.json', 'utf8'));
  const tiers = { 4: [], 5: [], 6: [] };
  for (const l of d.leaders) {
    assert.ok(Array.isArray(l.skills) && l.skills.length >= 1, `${l.id} 有 skills`);
    for (const sk of l.skills) {
      assert.ok(sk.name && sk.desc && sk.hook && sk.op, `${l.id}.${sk.name} 字段齐`);
      if (sk.cond && sk.cond.lpMax) assert.ok(new RegExp('LP≤' + sk.cond.lpMax).test(sk.desc), `${l.id}.${sk.name} desc 与 cond 同步`);
    }
    tiers[l.life].push(l.id);
  }
  assert.equal(tiers[4].length, 3, 'life4×3（低血多技）');
  assert.equal(tiers[5].length, 6, 'life5×6（基准）');
  assert.equal(tiers[6].length, 3, 'life6×3（高血少技）');
  for (const id of tiers[4]) assert.equal(d.leaders.find(l => l.id === id).skills.length, 3, `${id} 3 技`);
  for (const id of tiers[5]) assert.equal(d.leaders.find(l => l.id === id).skills.length, 2, `${id} 2 技`);
  for (const id of tiers[6]) assert.equal(d.leaders.find(l => l.id === id).skills.length, 1, `${id} 1 技`);
  // life4 战力补偿 5500 / 觉醒线 6000;life5/6 觉醒线 4000
  for (const l of d.leaders) {
    if (l.life === 4) assert.equal(l.power, 5500, `${l.id} life4 战力补偿 5500`);
    const aw = l.skills.find(sk => sk.cond && sk.cond.lpMax);
    if (aw) assert.equal(aw.cond.lpMax, l.life === 4 ? 6000 : 4000, `${l.id} 觉醒线档位`);
  }
});
