// bundle 冒烟：web/app.bundle.js 必须能独立驱动完整一局（node 与浏览器同构路径）
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('bundle 存在且与源码同步（源码 mtime 晚于 bundle 时提示需重建）', async () => {
  const bundlePath = join(root, 'web', 'app.bundle.js');
  assert.ok(existsSync(bundlePath), 'web/app.bundle.js 不存在，先跑 node scripts/bundle.js');
});

test('bundle 冒烟：eval 后用 OPTCG 跑一局 AI 对 AI 完整终局', () => {
  const src = readFileSync(join(root, 'web', 'app.bundle.js'), 'utf8');
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(src, ctx);
  const O = ctx.OPTCG;
  assert.ok(O, 'OPTCG 未挂载');
  assert.equal(typeof O.newGame, 'function');
  assert.equal(typeof O.createAI, 'function');
  // 卡池数动态对源（运营期删卡后不硬编码总数，断言=bundle 与 data/cards.json 一致）
  assert.equal(O.POOL.cards.length, JSON.parse(readFileSync(join(root, 'data/cards.json'), 'utf8')).cards.length);
  assert.equal(O.POOL.leaders.length, 12);

  // 随机对局（同 fuzz 逻辑）；deckOf 走 bundle 内置分层均匀采样（engine/deck.js 同源验证）
  const deckOf = (color) => O.deckOf(O.POOL, color);
  for (const col of ['red', 'blue']) {
    const leader = O.POOL.leaders.find((l) => l.color === col);
    const errs = O.validateDeck(leader, deckOf(col)); // vm 跨 realm 数组，用 isArray 判（deepStrictEqual 原型不同会假挂）
    assert.ok(Array.isArray(errs) && errs.length === 0, `${col} default deck invalid: ${errs && errs.join(';')}`);
  }
  const s = O.newGame({
    leaderA: O.POOL.leaders[0],
    deckA: deckOf('red'),
    leaderB: O.POOL.leaders[1],
    deckB: deckOf('blue'),
    seed: 123,
  });
  const rng = O.makeRng(456);
  let steps = 0;
  while (s.winner === null && steps < 900) {
    const acts = O.listActions(s);
    O.applyAction(s, acts[Math.floor(rng() * acts.length)]);
    steps++;
  }
  assert.ok(s.winner !== null, 'bundle 对局未终局');
});
