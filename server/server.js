// OPTCG 后端：零依赖 Node http — 静态前端 + REST API（云卡组/战绩/卡池版本/健康检查）
// 部署：203:/data/optcg + systemd optcg.service（见 deploy/README.md）；内网自玩，不挂公网
// 同构校验：动态 import web/app.bundle.js → globalThis.OPTCG，卡组合法性用同一套引擎判（前后端同 truth）
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join, resolve, normalize, extname, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { openStore } from './db.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const COLORS = new Set(['red', 'blue', 'green', 'yellow', 'purple', 'black']);
const USER_RE = /^[A-Za-z0-9_-]{1,64}$/;
const BODY_LIMIT = 64 * 1024;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
};

function send(res, code, obj, headers = {}) {
  const body = typeof obj === 'string' ? obj : JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', ...headers });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolveBody, reject) => {
    let size = 0; const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > BODY_LIMIT) { reject(new Error('body too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      try { resolveBody(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); }
      catch (e) { reject(new Error('bad json')); }
    });
    req.on('error', reject);
  });
}

/** 卡组 counts 结构校验：{cardId: 1..4} 且总张数=50；返回清洗后的 counts 或 null */
function validCounts(counts) {
  if (!counts || typeof counts !== 'object' || Array.isArray(counts)) return null;
  const out = {};
  let total = 0;
  for (const [k, v] of Object.entries(counts)) {
    if (!/^[\w-]{1,40}$/.test(k)) return null;
    if (!Number.isInteger(v) || v < 1 || v > 4) return null;
    out[k] = v; total += v;
  }
  return total === 50 ? out : null;
}

export async function createApp(opts = {}) {
  const root = resolve(opts.root || ROOT);
  const webRoot = join(root, 'web');
  const dbFile = opts.db || join(root, 'data', 'store.json');
  const backupDir = join(root, 'data', 'backup');

  await import(pathToFileURL(join(webRoot, 'app.bundle.js')).href); // → globalThis.OPTCG
  const poolRaw = await readFile(join(root, 'data', 'cards.json'), 'utf8');
  const poolVersion = createHash('sha1').update(poolRaw).digest('hex').slice(0, 12);
  const db = openStore(dbFile);
  try { db.snapshot(backupDir); } catch (e) { console.error('[backup] 启动快照失败:', e.message); }
  const startedAt = Date.now();

  async function serveStatic(pathname, res) {
    const clean = normalize(join(webRoot, pathname));
    if (!clean.startsWith(webRoot)) { send(res, 403, { error: 'forbidden' }); return; }
    try {
      let file = clean;
      if (extname(file) === '') file = join(file, 'index.html');
      const buf = await readFile(file);
      res.writeHead(200, {
        'Content-Type': MIME[extname(file)] || 'application/octet-stream',
        'Cache-Control': 'no-cache',
      });
      res.end(buf);
    } catch (e) {
      send(res, 404, { error: 'not found' });
    }
  }

  async function handleApi(method, url, req, res) {
    const q = url.searchParams;
    const route = `${method} ${url.pathname}`;

    if (route === 'GET /api/health') {
      send(res, 200, { ok: true, app: 'optcg-battle', poolVersion, uptime: Math.floor((Date.now() - startedAt) / 1000) });
      return;
    }
    if (route === 'GET /api/pool') {
      send(res, 200, { version: poolVersion, pool: JSON.parse(poolRaw) });
      return;
    }

    if (route === 'GET /api/decks') {
      const user = q.get('user') || '';
      if (!USER_RE.test(user)) { send(res, 400, { error: 'bad user' }); return; }
      send(res, 200, { decks: db.listDecks(user) });
      return;
    }
    if (route === 'POST /api/decks') {
      const b = await readBody(req);
      const user = String(b.user || ''); const name = String(b.name || '').trim().slice(0, 24);
      if (!USER_RE.test(user)) { send(res, 400, { error: 'bad user' }); return; }
      if (!name) { send(res, 400, { error: 'bad name' }); return; }
      if (!COLORS.has(b.color)) { send(res, 400, { error: 'bad color' }); return; }
      const counts = validCounts(b.counts);
      if (!counts) { send(res, 400, { error: '卡组必须 50 张（每卡 1-4 张）' }); return; }
      // 同构引擎合法性（颜色匹配/Leader 不入组等）
      const leader = globalThis.OPTCG.POOL.leaders.find((l) => l.color === b.color);
      const byId = Object.fromEntries(globalThis.OPTCG.POOL.cards.map((c) => [c.id, c]));
      const cards = Object.entries(counts).flatMap(([id, n]) => Array.from({ length: n }, () => byId[id])).filter(Boolean);
      const errs = globalThis.OPTCG.validateDeck(leader, cards);
      if (errs.length) { send(res, 400, { error: errs.join('; ') }); return; }
      db.touchUser(user);
      const d = db.upsertDeck(user, name, b.color, counts);
      send(res, 200, { ok: true, id: d.id });
      return;
    }
    const mDel = route.match(/^DELETE \/api\/decks\/([\w-]+)$/);
    if (mDel) {
      const user = q.get('user') || '';
      if (!USER_RE.test(user)) { send(res, 400, { error: 'bad user' }); return; }
      send(res, 200, { ok: db.deleteDeck(user, mDel[1]) });
      return;
    }

    if (route === 'GET /api/matches') {
      const user = q.get('user') || '';
      if (!USER_RE.test(user)) { send(res, 400, { error: 'bad user' }); return; }
      const limit = Math.min(100, Math.max(1, parseInt(q.get('limit') || '20', 10) || 20));
      send(res, 200, { matches: db.listMatches(user, limit) });
      return;
    }
    if (route === 'POST /api/matches') {
      const b = await readBody(req);
      const user = String(b.user || '');
      if (!USER_RE.test(user)) { send(res, 400, { error: 'bad user' }); return; }
      const mode = ['free', 'ladder', 'survival'].includes(b.mode) ? b.mode : 'free';
      db.addMatch({ user, mode, win: !!b.win, turn: Math.max(0, Math.min(999, b.turn | 0)) });
      send(res, 200, { ok: true });
      return;
    }
    if (route === 'GET /api/stats') {
      const user = q.get('user') || '';
      if (!USER_RE.test(user)) { send(res, 400, { error: 'bad user' }); return; }
      send(res, 200, db.stats(user));
      return;
    }

    send(res, 404, { error: 'no such api' });
  }

  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x');
    try {
      if (url.pathname.startsWith('/api/')) await handleApi(req.method, url, req, res);
      else if (req.method === 'GET' || req.method === 'HEAD') await serveStatic(url.pathname, res);
      else send(res, 405, { error: 'method not allowed' });
    } catch (e) {
      send(res, 400, { error: e.message || 'bad request' });
    }
  });

  server.db = db;
  server.backupDir = backupDir;
  return server;
}

function parseArgs(argv) {
  const out = { port: 8180 };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--port') out.port = parseInt(argv[++i], 10);
    else if (argv[i] === '--root') out.root = argv[++i];
    else if (argv[i] === '--db') out.db = argv[++i];
  }
  return out;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const args = parseArgs(process.argv);
  createApp(args).then((server) => {
    server.listen(args.port, '0.0.0.0', () => {
      console.log(`[optcg] listening :${args.port}`);
      console.log(`[optcg] db=${args.db || 'data/store.json'} backup=${server.backupDir}`);
    });
    const timer = setInterval(() => {
      try { server.db.snapshot(server.backupDir); } catch (e) { console.error('[backup]', e.message); }
    }, 24 * 3600 * 1000);
    timer.unref();
  }).catch((e) => { console.error('[optcg] 启动失败:', e); process.exit(1); });
}
