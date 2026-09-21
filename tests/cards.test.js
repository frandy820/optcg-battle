// M1 卡池校验：schema / 六色组牌合法 / 数值 sanity
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateDeck } from '../engine/index.js';

const pool = JSON.parse(readFileSync(new URL('../data/cards.json', import.meta.url), 'utf8'));
const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'black'];
const OPS = ['draw', 'powerSelf', 'powerLeader', 'gainDon', 'koWeakest', 'restEnemy', 'healLP', 'damageLP', 'buffAll', 'debuffFoeAll', 'discard', 'search', 'revive'];
const HOOKS = ['onPlay', 'whenAttacking', 'onKO', 'trigger'];
const KW = ['rush', 'blocker', 'doubleAttack', 'banish'];
const FRUITS = ['paramecia', 'logia', 'zoan'];

test('卡池 schema：id 唯一、类型/颜色合法、字段完整', () => {
  const all = [...pool.leaders, ...pool.cards];
  const ids = new Set(all.map((c) => c.id));
  assert.equal(ids.size, all.length, 'id 必须唯一');
  assert.equal(pool.leaders.length, 12); // OP-01 六船长 + OP-02 六新船长
  for (const c of all) {
    assert.ok(c.fruit === null || FRUITS.includes(c.fruit), `bad fruit ${c.id}: ${c.fruit}`);
  }
  for (const c of pool.cards) {
    assert.ok(COLORS.includes(c.color), `bad color ${c.id}`);
    assert.ok(['char', 'event', 'stage', 'gear'].includes(c.type), `bad type ${c.id}`);
    assert.ok(c.type === 'char' || c.type === 'gear', `G1a 后卡池仅 char/gear，出现 ${c.type} ${c.id}`);
    assert.ok(Number.isInteger(c.cost) && c.cost >= 1 && c.cost <= 8, `bad cost ${c.id}`);
    if (c.type === 'char') {
      assert.ok(Number.isInteger(c.power) && c.power >= 1000 && c.power <= 9000, `bad power ${c.id}`);
    } else {
      assert.equal(c.power, null, `non-char power must be null ${c.id}`);
      assert.equal(c.fruit, null, `non-char fruit must be null ${c.id}`);
    }
    if (c.type === 'gear') {
      assert.ok(c.gear && [1000, 2000, 3000].includes(c.gear.atk), `bad gear.atk ${c.id}`);
      assert.ok(!c.gear.gives || c.gear.gives.every((k) => ['blocker'].includes(k)), `bad gear.gives ${c.id}`);
    }
    if (c.counter !== null) {
      assert.equal(c.type, 'char', `counter only on char ${c.id}`);
      assert.ok([1000, 2000].includes(c.counter), `bad counter ${c.id}`);
    }
    for (const kw of c.keywords || []) assert.ok(KW.includes(kw), `bad keyword ${kw} on ${c.id}`);
    if (c.effect) {
      assert.ok(HOOKS.includes(c.effect.hook), `bad hook ${c.id}`);
      const ops = Array.isArray(c.effect.op) ? c.effect.op : [c.effect.op]; // v2 复合 op（POOL-3）
      for (const op of ops) assert.ok(OPS.includes(op.k), `unimplemented op ${c.id}: ${op.k}`);
    }
  }
});

test('卡池规模：六色各 30+ 张、总量 ≥257（G1a 清池 490→257 为下限；P2 扩池 257→1000 只增不减）', () => {
  for (const col of COLORS) {
    const n = pool.cards.filter((c) => c.color === col).length;
    assert.ok(n >= 30, `${col} only ${n} cards`);
  }
  assert.ok(pool.cards.length >= 257, `total ${pool.cards.length} < 257`);
});

test('G1a 去重：同色同名 char 每组只留 1 张（融合卡不占组）', () => {
  const seen = new Set();
  for (const c of pool.cards.filter((x) => x.type === 'char' && !x.fusion)) {
    const k = `${c.color}|${c.name}`;
    assert.ok(!seen.has(k), `同色同名重复 ${k}`);
    seen.add(k, true);
  }
});

test('装备（批2）：每色 ≥2 件；坚壁甲胄至少覆盖 4 色（黄/紫走纯攻装=设计差异）', () => {
  let armoredColors = 0;
  for (const col of COLORS) {
    const gears = pool.cards.filter((c) => c.color === col && c.type === 'gear');
    assert.ok(gears.length >= 2, `${col} only ${gears.length} gear`);
    if (gears.some((g) => (g.gear.gives || []).includes('blocker'))) armoredColors++;
  }
  assert.ok(armoredColors >= 4, `blocker gear only in ${armoredColors} colors`);
});

test('恶魔果实：三系均有分布（克制体系参与度）', () => {
  for (const f of FRUITS) {
    const n = pool.cards.filter((c) => c.type === 'char' && c.fruit === f).length;
    assert.ok(n >= 8, `${f} 仅 ${n} 张角色卡`);
  }
  // 船长也参与克制（直攻/被直攻时）：至少 2 位船长带果实
  assert.ok(pool.leaders.filter((l) => l.fruit).length >= 2);
});

test('卡池：每色费用曲线铺满 1-8（event/stage 已随 G1a 全删，对战只留角色与装备）', () => {
  for (const col of COLORS) {
    const cs = pool.cards.filter((c) => c.color === col);
    const costs = new Set(cs.filter((c) => c.type === 'char').map((c) => c.cost));
    for (let cost = 1; cost <= 7; cost++) assert.ok(costs.has(cost), `${col} missing cost ${cost}`);
    assert.ok(cs.every((c) => c.type !== 'event' && c.type !== 'stage'), `${col} 残留 event/stage`);
  }
});

test('G3 稀有度：全部 char/gear 带 rarity 且与分级规则推导一致', () => {
  const rarityOf = (c) => {
    if (c.fusion) return 'SSS';
    if (c.type === 'gear') return { 1000: 'A', 2000: 'B', 3000: 'S' }[c.gear.atk];
    const kw = (c.keywords || []).length, eff = c.effect !== null;
    if (c.cost === 8 && c.power === 9000) return 'SSS';
    if (c.cost === 8 && kw >= 1 && eff) return 'SSS'; // P2：费8+词条+效果=传说锚点（与 check-pool3/gen-expansion 同构）
    if (c.cost === 8 || kw >= 2) return 'SS';
    if ((kw > 0 && eff) || c.cost >= 7) return 'S';
    if (kw > 0 || eff) return 'B';
    return 'A';
  };
  for (const c of pool.cards) {
    assert.ok(['A', 'B', 'S', 'SS', 'SSS'].includes(c.rarity), `bad rarity ${c.id}: ${c.rarity}`);
    assert.equal(c.rarity, rarityOf(c), `${c.id} rarity ${c.rarity} ≠ 规则推导 ${rarityOf(c)}`);
  }
});

test('六色均可组出合法 50 卡组（每卡×4 取 50；融合卡不进 deckOf）', () => {
  for (const leader of pool.leaders) {
    const cs = pool.cards.filter((c) => c.color === leader.color && !c.fusion);
    const deck = [];
    for (const c of cs) for (let i = 0; i < 4; i++) deck.push(c);
    const errs = validateDeck(leader, deck.slice(0, 50));
    assert.deepEqual(errs, [], `${leader.color} deck invalid: ${errs.join(';')}`);
  }
});

test('数值 sanity：char power 符合 F12 战力公式（base=(cost+1)K，词条/效果各 -1K，下限 costK）', () => {
  const chars = pool.cards.filter((x) => x.type === 'char');
  // F12 平衡微调表（贴窗 ±1000，≤10 张，真值源 data/power-tuned.json，与 check-pool3.js 同源放行）
  const POWER_TUNED = Object.fromEntries(Object.entries(
    JSON.parse(readFileSync(new URL('../data/power-tuned.json', import.meta.url), 'utf8')).tuned,
  ).map(([id, t]) => [id, t.power]));
  // F12 公式（2026-09-20 定稿，六色统一，绿色高费特权废除）——与 scripts/check-pool3.js 同构：
  //   base=(cost+1)*1000；扣减=keywords×1000+(effect!==null)×1000；
  //   power=clamp(base-扣减, max(cost*1000, base-2000), base)，1000 步进
  for (const c of chars) {
    const base = (c.cost + 1) * 1000;
    const deduct = (c.keywords || []).length * 1000 + (c.effect ? 1000 : 0);
    const lo = Math.max(c.cost * 1000, base - 2000); // base-2000=(cost-1)K≤costK，下限恒为 cost*1000
    const expect = Math.max(lo, Math.min(base, base - deduct));
    assert.equal(c.power % 1000, 0, `${c.id} power 须 1000 步进`);
    if (c.id in POWER_TUNED) {
      assert.ok(c.power >= lo && c.power <= base, `${c.id} 微调值 ${c.power} 越窗 [${lo},${base}]`);
      assert.equal(c.power, POWER_TUNED[c.id], `${c.id} 微调值须与 power-tuned.json 一致`);
    } else {
      assert.equal(c.power, expect, `${c.id} cost${c.cost} kw${(c.keywords || []).length} eff${c.effect ? 1 : 0} 公式值 ${expect}`);
    }
  }
  // 跨费单调性（白板对白板）：cost c 白板 (c+1)K 须 > cost c-1 白板 cK —— 费用越高白板天花板越高
  const vanillaByCost = new Map(); // cost -> power（白板全同值=(cost+1)*1000）
  for (const c of chars) {
    if (c.effect || (c.keywords || []).length) continue;
    vanillaByCost.set(c.cost, c.power);
  }
  for (const [cost, p] of vanillaByCost) {
    const lower = vanillaByCost.get(cost - 1);
    if (lower !== undefined) assert.ok(p > lower, `cost${cost} 白板 ${p} 须 > cost${cost - 1} 白板 ${lower}`);
  }
});
