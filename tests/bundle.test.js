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
  assert.equal(O.POOL.cards.length, 162);
  assert.equal(O.POOL.leaders.length, 6);

  // 随机对局（同 fuzz 逻辑）
  const deckOf = (color) => {
    const cs = O.POOL.cards.filter((c) => c.color === color);
    const deck = [];
    for (const c of cs) for (let i = 0; i < 4; i++) deck.push(c);
    return deck.slice(0, 50);
  };
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
