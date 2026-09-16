// M5 后端 API 测试：起真实 http 服务（临时库临时端口）→ fetch 全链路
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tmp = mkdtempSync(join(tmpdir(), 'optcg-test-'));
let createApp, app, base, pool;

before(async () => {
  ({ createApp } = await import('../server/server.js'));
  app = await createApp({ root: ROOT, db: join(tmp, 'store.json') });
  await new Promise((r) => app.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${app.address().port}`;
  pool = await (await fetch(`${base}/api/pool`)).json();
});

after(() => {
  app.close();
  rmSync(tmp, { recursive: true, force: true });
});

const j = (p, opt) => fetch(base + p, opt).then(async (r) => ({ status: r.status, body: await r.json() }));

test('health: ok + 版本号', async () => {
  const { status, body } = await j('/api/health');
  assert.equal(status, 200);
  assert.equal(body.ok, true);
  assert.match(body.poolVersion, /^[0-9a-f]{12}$/);
});

test('pool: 下发完整卡池', async () => {
  assert.ok(pool.pool.leaders.length >= 6);
  assert.ok(pool.pool.cards.length >= 60);
});

test('静态: / 返回前端页面', async () => {
  const r = await fetch(base + '/');
  assert.equal(r.status, 200);
  const html = await r.text();
  assert.ok(html.includes('航海王'));
});

test('静态: 路径穿越被拒', async () => {
  const r = await fetch(base + '/%2e%2e/package.json');
  assert.ok(r.status === 403 || r.status === 404);
});

test('卡组: 非法 counts（49张/超4张/坏id）三连拒', async () => {
  const cards = pool.pool.cards.filter((c) => c.color === 'red');
  const mk = (f) => {
    const counts = {};
    let left = 50;
    for (const c of cards) { const n = Math.min(4, left); counts[c.id] = f ? f(c, n) ?? n : n; left -= n; if (!left) break; }
    return counts;
  };
  const short = mk(); delete short[Object.keys(short).pop()]; // 49 张
  const r1 = await j('/api/decks', { method: 'POST', body: JSON.stringify({ user: 't1', name: 'A', color: 'red', counts: short }) });
  assert.equal(r1.status, 400);
  const over = mk((c, n) => 5); // 每卡 5 张
  const r2 = await j('/api/decks', { method: 'POST', body: JSON.stringify({ user: 't1', name: 'A', color: 'red', counts: over }) });
  assert.equal(r2.status, 400);
  const bad = { '../../etc': 50 };
  const r3 = await j('/api/decks', { method: 'POST', body: JSON.stringify({ user: 't1', name: 'A', color: 'red', counts: bad }) });
  assert.equal(r3.status, 400);
});

test('卡组: 引擎合法性（蓝卡混入红组）被拒', async () => {
  const blues = pool.pool.cards.filter((c) => c.color === 'blue');
  const counts = {};
  let left = 50;
  for (const c of blues) { const n = Math.min(4, left); counts[c.id] = n; left -= n; if (!left) break; }
  const { status, body } = await j('/api/decks', { method: 'POST', body: JSON.stringify({ user: 't1', name: '蓝混红', color: 'red', counts }) });
  assert.equal(status, 400);
  assert.match(body.error, /mismatch|色|卡组/);
});

test('卡组: 合法保存→列表→更新(upsert)→删除', async () => {
  const reds = pool.pool.cards.filter((c) => c.color === 'red');
  const counts = {};
  let left = 50;
  for (const c of reds) { const n = Math.min(4, left); counts[c.id] = n; left -= n; if (!left) break; }
  const r1 = await j('/api/decks', { method: 'POST', body: JSON.stringify({ user: 't2', name: '红组一号', color: 'red', counts }) });
  assert.equal(r1.status, 200);
  const r2 = await j('/api/decks?user=t2');
  assert.equal(r2.body.decks.length, 1);
  assert.equal(r2.body.decks[0].name, '红组一号');
  // 同名再存 = 更新而非新增
  await j('/api/decks', { method: 'POST', body: JSON.stringify({ user: 't2', name: '红组一号', color: 'red', counts }) });
  const r3 = await j('/api/decks?user=t2');
  assert.equal(r3.body.decks.length, 1);
  const id = r3.body.decks[0].id;
  const r4 = await j(`/api/decks/${id}?user=t2`, { method: 'DELETE' });
  assert.equal(r4.body.ok, true);
  const r5 = await j('/api/decks?user=t2');
  assert.equal(r5.body.decks.length, 0);
});

test('对局: 记录→列表→统计', async () => {
  await j('/api/matches', { method: 'POST', body: JSON.stringify({ user: 't3', mode: 'ladder', win: true, turn: 6 }) });
  await j('/api/matches', { method: 'POST', body: JSON.stringify({ user: 't3', mode: 'ladder', win: false, turn: 9 }) });
  await j('/api/matches', { method: 'POST', body: JSON.stringify({ user: 't3', mode: 'survival', win: true, turn: 4 }) });
  const r1 = await j('/api/matches?user=t3');
  assert.equal(r1.body.matches.length, 3);
  const r2 = await j('/api/stats?user=t3');
  assert.equal(r2.body.total, 3);
  assert.deepEqual(r2.body.byMode.ladder, { wins: 1, losses: 1 });
  assert.equal(r2.body.byMode.survival.wins, 1);
});

test('持久化: 重启（新实例同库文件）数据不丢', async () => {
  app.close();
  const app2 = await createApp({ root: ROOT, db: join(tmp, 'store.json') });
  await new Promise((r) => app2.listen(0, '127.0.0.1', r));
  const b2 = `http://127.0.0.1:${app2.address().port}`;
  const decks = await (await fetch(`${b2}/api/decks?user=t3`)).json();
  const stats = await (await fetch(`${b2}/api/stats?user=t3`)).json();
  app2.close();
  // t3 没存卡组但打了对局；t2 的卡组已被删——用对局统计证持久化
  assert.equal(stats.total, 3);
  // 恢复原实例供后续（无后续用例，仅保险）
  app = await createApp({ root: ROOT, db: join(tmp, 'store.json') });
  await new Promise((r) => app.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${app.address().port}`;
});
