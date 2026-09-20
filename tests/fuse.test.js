// F13 融合机制单测：合法性矩阵 / 素材进墓 / 装备随迁 / DON 回收记账 / rush 当回合可攻 /
// 融合卡不进 deckOf / 每回合限 1 次 / 旧快照缺字段兼容
// 数据口径：真源 data/cards.json（12 融合卡 + 真实素材），引擎纯数据可任意重构手牌/场上/贝里区
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { newGame, applyAction, validateDeck, usableDons, powerOfUnit, hasKeyword, deckOf as deckOfEngine } from '../engine/index.js';
import { listActions } from '../ai/actions.js';

const pool = JSON.parse(readFileSync(new URL('../data/cards.json', import.meta.url), 'utf8'));
const FUSIONS = pool.cards.filter((c) => c.fusion);
const byId = (id) => pool.cards.find((c) => c.id === id);
const leaderOf = (color) => pool.leaders.find((l) => l.color === color);
// G1a 去重后每色非融合 char 仅 30-45 张不足 50：按每卡×4 轮次补齐（legality 上限同编号 4 张）
const filler = (color) => {
  const cs = pool.cards.filter((c) => c.color === color && !c.fusion && c.type === 'char');
  const deck = [];
  for (let r = 0; r < 4 && deck.length < 50; r++) for (const c of cs) { if (deck.length < 50) deck.push(c); }
  return deck;
};

// 场上单位形态：卡定义 + 运行时字段（engine.test.js 同款直接重构）
const mkUnit = (id, over) => ({ ...byId(id), rest: false, playedTurn: 1, dons: 0, buffs: [], gears: [], ...(over || {}) });
const freshDons = (n) => Array.from({ length: n }, (_, i) => ({ id: i, rest: false, attached: null }));

// 标准融合局：红方手牌 RED-06、场上 RED-08；贝里 5 枚；融合 FUSION-RED1（素材 RED-08+RED-06，费用 3）
function fuseGame() {
  const s = newGame({ leaderA: leaderOf('red'), deckA: filler('red'), leaderB: leaderOf('blue'), deckB: filler('blue'), seed: 7, fusions: FUSIONS });
  const me = s.players[0];
  me.board = [mkUnit('RED-08')];
  me.hand = [byId('RED-06'), byId('RED-11')];
  me.donArea = freshDons(5);
  me.trash = [];
  return s;
}

test('融合数据：12 张融合卡配方素材全部存在、同色、非融合卡', () => {
  assert.equal(FUSIONS.length, 12);
  for (const f of FUSIONS) {
    assert.equal(f.type, 'char');
    assert.equal(f.cost, 8);
    assert.equal(f.power, 8000);
    assert.ok(f.keywords.includes('rush'), `${f.id} 须带 rush（当回合可攻）`);
    assert.equal(f.fusion.from.length, 2);
    for (const mid of f.fusion.from) {
      const m = byId(mid);
      assert.ok(m, `${f.id} 素材 ${mid} 缺失`);
      assert.equal(m.color, f.color, `${f.id} 素材 ${mid} 颜色不符`);
      assert.ok(!m.fusion, `${f.id} 素材 ${mid} 不得为融合卡`);
    }
  }
});

test('融合卡不进卡组：deckOf 六色 50 张、零融合卡、char 恰 46（G1a 后 char46+gear4）', () => {
  for (const color of ['red', 'blue', 'green', 'yellow', 'purple', 'black']) {
    const deck = deckOfEngine(pool, color);
    assert.equal(deck.length, 50, `${color} 卡组须 50 张`);
    assert.equal(deck.filter((c) => c.fusion).length, 0, `${color} 卡组不得含融合卡`);
    assert.equal(deck.filter((c) => c.type === 'char').length, 46, `${color} char 计数不含融合卡须为 46`);
    assert.equal(deck.filter((c) => c.type === 'gear').length, 4, `${color} gear 计数须为 4`);
    assert.ok(deck.every((c) => c.type !== 'event' && c.type !== 'stage'), `${color} 卡组不得含 event/stage（G1a 全删）`);
  }
});

test('融合卡禁入卡组：validateDeck 拒收（防构筑器手工混入）', () => {
  const deck = filler('red').slice(0, 49).concat([byId('FUSION-RED1')]);
  const errs = validateDeck(leaderOf('red'), deck);
  assert.ok(errs.some((e) => e.includes('FUSION-RED1')), errs.join(';'));
});

test('融合：场上+手牌混合素材 → 素材进墓场、融合体登场、支付贝里、fuse 日志', () => {
  const s = fuseGame();
  const me = s.players[0];
  applyAction(s, { t: 'fuse', side: 0, fusionId: 'FUSION-RED1' });
  // 融合体登场（占场上空出的位），素材两份全进墓场
  assert.deepEqual(me.board.map((u) => u.id), ['FUSION-RED1']);
  assert.deepEqual(me.trash.map((c) => c.id).sort(), ['RED-06', 'RED-08']);
  // 支付：5 枚 - 3 融合费 = 2 枚可用
  assert.equal(usableDons(me), 2);
  const ev = [...s.log].reverse().find((e) => e.t === 'fuse');
  assert.ok(ev, 'fuse 日志事件缺失');
  assert.equal(ev.fusionId, 'FUSION-RED1');
  assert.deepEqual(ev.fromIds, ['RED-08', 'RED-06']);
  assert.equal(powerOfUnit(me.board[0]), 8000);
});

test('融合：素材不足抛错（缺一手素材）且状态不变', () => {
  const s = fuseGame();
  s.players[0].hand = [byId('RED-11')]; // RED-06 没了，RED-08 仅场上单份
  const before = JSON.stringify({ b: s.players[0].board.map((u) => u.id), h: s.players[0].hand.length, t: s.players[0].trash.length });
  assert.throws(() => applyAction(s, { t: 'fuse', side: 0, fusionId: 'FUSION-RED1' }), /素材不足/);
  const after = JSON.stringify({ b: s.players[0].board.map((u) => u.id), h: s.players[0].hand.length, t: s.players[0].trash.length });
  assert.equal(after, before);
});

test('融合：素材可在手牌两份（场上不放素材）也成立', () => {
  const s = fuseGame();
  s.players[0].board = [];
  s.players[0].hand = [byId('RED-08'), byId('RED-06')];
  applyAction(s, { t: 'fuse', side: 0, fusionId: 'FUSION-RED1' });
  const me = s.players[0];
  assert.deepEqual(me.board.map((u) => u.id), ['FUSION-RED1']);
  assert.deepEqual(me.trash.map((c) => c.id).sort(), ['RED-06', 'RED-08']);
});

test('融合：贝里不足抛错（usableDons 语义：附着贝里=已消耗）', () => {
  const s = fuseGame();
  const me = s.players[0];
  me.donArea = freshDons(2); // 2 < 融合费 3
  assert.throws(() => applyAction(s, { t: 'fuse', side: 0, fusionId: 'FUSION-RED1' }), /融合费用不足/);
  // 附着贝里不算可用：3 枚中 1 枚已附着到素材上 → 可用 2 < 3
  me.donArea = freshDons(3);
  me.donArea[0].attached = { type: 'char', idx: 0 };
  me.board[0].dons = 1;
  assert.throws(() => applyAction(s, { t: 'fuse', side: 0, fusionId: 'FUSION-RED1' }), /融合费用不足/);
});

test('融合：场上已满 5 名角色不可融合', () => {
  const s = fuseGame();
  const me = s.players[0];
  me.board = ['RED-08', 'RED-12', 'RED-10', 'RED-11', 'RED-12'].map((id) => mkUnit(id));
  assert.equal(me.board.length, 5);
  assert.throws(() => applyAction(s, { t: 'fuse', side: 0, fusionId: 'FUSION-RED1' }), /场上已满/);
});

test('融合：每回合限 1 次；endTurn 换边重置后可再融合', () => {
  const s = fuseGame();
  const me = s.players[0];
  applyAction(s, { t: 'fuse', side: 0, fusionId: 'FUSION-RED1' });
  // 重摆素材与贝里，同回合第二次融合须被拦
  me.board = [mkUnit('RED-08')];
  me.hand = [byId('RED-06')];
  me.donArea.forEach((d) => { d.rest = false; d.attached = null; });
  assert.throws(() => applyAction(s, { t: 'fuse', side: 0, fusionId: 'FUSION-RED1' }), /每回合限/);
  // 两个 endTurn 回到我方回合：可再融合
  applyAction(s, { t: 'endTurn', side: 0 });
  applyAction(s, { t: 'endTurn', side: 1 });
  assert.equal(s.active, 0);
  applyAction(s, { t: 'fuse', side: 0, fusionId: 'FUSION-RED1' });
  assert.deepEqual(me.board.map((u) => u.id), ['FUSION-RED1']);
});

test('融合：场上素材的装备随素材进墓场（与击沉同规则）', () => {
  const s = fuseGame();
  const me = s.players[0];
  const gear = byId('RED-G1');
  me.board[0].gears = [{ ...gear }]; // RED-08 穿装备
  applyAction(s, { t: 'fuse', side: 0, fusionId: 'FUSION-RED1' });
  assert.deepEqual(me.trash.map((c) => c.id), ['RED-G1', 'RED-08', 'RED-06']); // 装备先随葬，再单位，再手牌素材
  assert.deepEqual(me.board[0].gears, []);
});

test('融合：素材附着 DON 回收（可用态）+ 其后单位附着指针前移，无悬空指针', () => {
  const s = fuseGame();
  const me = s.players[0];
  me.board = [mkUnit('RED-08'), mkUnit('RED-12')]; // 素材 idx0，旁观单位 idx1（各挂 1 贝里）
  me.donArea = freshDons(6);
  me.donArea[0].attached = { type: 'char', idx: 0 };
  me.donArea[1].attached = { type: 'char', idx: 1 };
  me.board[0].dons = 1; me.board[1].dons = 1;
  applyAction(s, { t: 'fuse', side: 0, fusionId: 'FUSION-RED1' });
  // 队伍：RED-12（前移到 idx0）+ 融合体（idx1）
  assert.deepEqual(me.board.map((u) => u.id), ['RED-12', 'FUSION-RED1']);
  assert.equal(me.donArea.length, 6); // 贝里总量不变（支付=横置不减少，回收不新增）
  // 6 枚中 2 枚附着 → 可用 4；支付 3 → 1；素材贝里回收 1 → 2
  assert.equal(usableDons(me), 2);
  // 附着指针：仅剩 1 枚附着且指向 RED-12 的新位置 idx0；无任何指针指向越界/悬空位置
  const attached = me.donArea.filter((d) => d.attached);
  assert.equal(attached.length, 1);
  assert.deepEqual(attached[0].attached, { type: 'char', idx: 0 });
  for (const d of me.donArea) {
    if (d.attached && d.attached.type === 'char') {
      assert.ok(d.attached.idx < me.board.length, '附着指针越界');
      assert.ok(me.board[d.attached.idx].dons > 0, '附着指针指向无贝里单位（记账漂移）');
    }
  }
  assert.equal(me.board[0].dons, 1); // RED-12 自身附着贝里保留
});

test('融合：融合体 playedTurn=当前回合，rush 当回合即可攻击', () => {
  const s = fuseGame();
  applyAction(s, { t: 'fuse', side: 0, fusionId: 'FUSION-RED1' });
  const me = s.players[0];
  assert.equal(me.board[0].playedTurn, s.turn);
  assert.ok(hasKeyword(me.board[0], 'rush'));
  assert.ok((me.board[0].keywords || []).includes('doubleAttack'));
  // 对方场上空 → 直攻船长不因召唤症候群被拦（rush 生效）
  applyAction(s, { t: 'attack', side: 0, attacker: { side: 0, type: 'char', idx: 0 }, target: 'leader' });
  assert.equal(s.pending && s.pending.kind, 'counter');
  applyAction(s, { t: 'passCounter', side: 1 }); // 收窗结算
});

test('融合：onPlay 登场效果生效（FUSION-BLUE2 buffAll 全体 +1000）', () => {
  const s = newGame({ leaderA: leaderOf('blue'), deckA: filler('blue'), leaderB: leaderOf('red'), deckB: filler('red'), seed: 7, fusions: FUSIONS });
  const me = s.players[0];
  me.board = [mkUnit('BLUE-25')];          // 素材1（场上）：娜美（G1a 后保留版，原 BLUE-26 已随去重退役）
  me.hand = [byId('BLUE-08')];             // 素材2（手牌）：弗兰奇
  me.donArea = freshDons(5);
  me.trash = [];
  applyAction(s, { t: 'fuse', side: 0, fusionId: 'FUSION-BLUE2' }); // onPlay buffAll x1000 until turn
  assert.deepEqual(me.board.map((u) => u.id), ['FUSION-BLUE2']);
  assert.equal(powerOfUnit(me.board[0]), 8000 + 1000); // 融合体自身也吃到全体增益
});

test('融合：listActions 枚举 fuse 动作（AI 可达），且素材不齐/无配方时不产生', () => {
  const s = fuseGame();
  const acts = listActions(s);
  const fuses = acts.filter((a) => a.t === 'fuse');
  assert.equal(fuses.length, 1);
  assert.equal(fuses[0].fusionId, 'FUSION-RED1'); // RED2 素材（RED-27/RED-37，G1a 传承组）不齐，不枚举
  s.players[0].hand = [byId('RED-11')]; // 拆掉素材
  assert.equal(listActions(s).filter((a) => a.t === 'fuse').length, 0);
});

test('旧快照兼容：state 缺 fusions/fuseUsed 字段不崩（无配方=无融合动作；字段缺失可正常补挂）', () => {
  const s = fuseGame();
  delete s.fusions;   // 模拟 F13 前的旧快照
  delete s.fuseUsed;
  assert.equal(listActions(s).filter((a) => a.t === 'fuse').length, 0); // 无配方=零融合动作
  assert.throws(() => applyAction(s, { t: 'fuse', side: 0, fusionId: 'FUSION-RED1' }), /未知融合配方/);
  // 仅缺 fuseUsed（旧局恢复后注入了配方）：记账字段兜底，融合可用
  const s2 = fuseGame();
  delete s2.fuseUsed;
  applyAction(s2, { t: 'fuse', side: 0, fusionId: 'FUSION-RED1' });
  assert.deepEqual(s2.fuseUsed, [true, false]);
});

test('快照序列化：fusions/fuseUsed 随 JSON 克隆保留，恢复局可继续融合', () => {
  const s = fuseGame();
  const snap = JSON.parse(JSON.stringify(s));
  assert.equal(snap.fusions.length, 12);
  applyAction(snap, { t: 'fuse', side: 0, fusionId: 'FUSION-RED1' });
  assert.deepEqual(snap.players[0].board.map((u) => u.id), ['FUSION-RED1']);
});
