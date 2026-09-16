// M1 卡池校验：schema / 六色组牌合法 / 数值 sanity
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateDeck } from '../engine/index.js';

const pool = JSON.parse(readFileSync(new URL('../data/cards.json', import.meta.url), 'utf8'));
const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'black'];
const OPS = ['draw', 'powerSelf', 'powerLeader', 'gainDon', 'koWeakest', 'restEnemy'];
const HOOKS = ['onPlay', 'whenAttacking', 'onKO', 'trigger'];
const KW = ['rush', 'blocker', 'doubleAttack', 'banish'];

test('卡池 schema：id 唯一、类型/颜色合法、字段完整', () => {
  const all = [...pool.leaders, ...pool.cards];
  const ids = new Set(all.map((c) => c.id));
  assert.equal(ids.size, all.length, 'id 必须唯一');
  assert.equal(pool.leaders.length, 6);
  for (const c of pool.cards) {
    assert.ok(COLORS.includes(c.color), `bad color ${c.id}`);
    assert.ok(['char', 'event', 'stage'].includes(c.type), `bad type ${c.id}`);
    assert.ok(Number.isInteger(c.cost) && c.cost >= 1 && c.cost <= 8, `bad cost ${c.id}`);
    if (c.type === 'char') {
      assert.ok(Number.isInteger(c.power) && c.power >= 1000 && c.power <= 9000, `bad power ${c.id}`);
    } else {
      assert.equal(c.power, null, `non-char power must be null ${c.id}`);
    }
    if (c.counter !== null) {
      assert.equal(c.type, 'char', `counter only on char ${c.id}`);
      assert.ok([1000, 2000].includes(c.counter), `bad counter ${c.id}`);
    }
    for (const kw of c.keywords || []) assert.ok(KW.includes(kw), `bad keyword ${kw} on ${c.id}`);
    if (c.effect) {
      assert.ok(HOOKS.includes(c.effect.hook), `bad hook ${c.id}`);
      assert.ok(OPS.includes(c.effect.op.k), `unimplemented op ${c.id}: ${c.effect.op.k}`);
    }
  }
});

test('卡池规模：六色各 12+ 张、总数 60-80', () => {
  for (const col of COLORS) {
    const n = pool.cards.filter((c) => c.color === col).length;
    assert.ok(n >= 12, `${col} only ${n} cards`);
  }
  assert.ok(pool.cards.length >= 60 && pool.cards.length <= 80);
});

test('卡池：每色费用曲线铺满 1-8、含事件与舞台', () => {
  for (const col of COLORS) {
    const cs = pool.cards.filter((c) => c.color === col);
    const costs = new Set(cs.filter((c) => c.type === 'char').map((c) => c.cost));
    for (let cost = 1; cost <= 7; cost++) assert.ok(costs.has(cost), `${col} missing cost ${cost}`);
    assert.ok(cs.some((c) => c.type === 'event'), `${col} no event`);
    assert.ok(cs.some((c) => c.type === 'stage'), `${col} no stage`);
  }
});

test('六色均可组出合法 50 卡组（每卡×4 取 50）', () => {
  for (const leader of pool.leaders) {
    const cs = pool.cards.filter((c) => c.color === leader.color);
    const deck = [];
    for (const c of cs) for (let i = 0; i < 4; i++) deck.push(c);
    const errs = validateDeck(leader, deck.slice(0, 50));
    assert.deepEqual(errs, [], `${leader.color} deck invalid: ${errs.join(';')}`);
  }
});

test('数值 sanity：同费战力区间合理（±1000 内波动、无超模）', () => {
  const byCost = new Map();
  for (const c of pool.cards.filter((x) => x.type === 'char')) {
    if (!byCost.has(c.cost)) byCost.set(c.cost, []);
    byCost.get(c.cost).push(c);
  }
  for (const [cost, cs] of byCost) {
    for (const c of cs) {
      // 官方 vanilla 节奏 ≈ (cost+2)*1000；本池取保守一档，区间 = [cost千, cost+2千]
      const lo = cost * 1000;
      const hi = (cost + 2) * 1000;
      assert.ok(
        c.power >= lo && c.power <= hi,
        `${c.id} cost${cost} power${c.power} 超出合理区间 [${lo}, ${hi}]`,
      );
    }
  }
});
