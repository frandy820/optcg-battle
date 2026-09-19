// PWA 本地验证：node 内置静态 server + CDP（不用 python 子进程——shell:true kill 只杀 shim 会留孤儿占端口，已实测）
// ① SW 注册并 active ② 断网（emulateNetworkConditions offline）reload 后引擎/大厅/卡池仍可玩
// 用法：node scripts/probe-pwa.mjs
import { spawn, execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, extname } from 'node:path';

const ROOT = resolve(new URL('.', import.meta.url).pathname.replace(/^\//, '').replace(/\//g, '\\'), '..');
const WEB = join(ROOT, 'web').replace(/\\/g, '/');
const PORT = 9400 + Math.floor(Math.random() * 300);

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const file = join(WEB, p).replace(/\\/g, '/');
    if (!file.startsWith(WEB)) { res.writeHead(403); res.end(); return; }
    const buf = await readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
    res.end(buf);
  } catch (e) { res.writeHead(404); res.end('nf'); }
});
await new Promise((r) => server.listen(PORT, '127.0.0.1', r));

function findChrome() {
  const cands = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe',
  ].filter(existsSync);
  if (!cands.length) { console.error('chrome not found'); process.exit(2); }
  return cands[0];
}
const chrome = findChrome();
const cport = 9300 + Math.floor(Math.random() * 500);
const prof = mkdtempSync(join(tmpdir(), 'optcg-pwa-'));
const proc = spawn(chrome, [
  '--headless', '--disable-gpu', `--user-data-dir=${prof}`,
  `--remote-debugging-port=${cport}`,
  '--mute-audio', '--no-first-run', '--no-proxy-server',
  'about:blank',
], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fail = 0;
const check = (name, ok, extra = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${extra ? ' | ' + extra : ''}`);
  if (!ok) fail++;
};

async function main() {
  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    try {
      const list = JSON.parse(execFileSync('curl', ['-s', `http://127.0.0.1:${cport}/json/list`], { encoding: 'utf8' }));
      const page = list.find((t) => t.type === 'page');
      if (page) { wsUrl = page.webSocketDebuggerUrl; break; }
    } catch (e) { /* retry */ }
    await sleep(300);
  }
  if (!wsUrl) throw new Error('CDP 未就绪');
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } });
  const call = (method, params) => new Promise((res) => { const mid = ++id; pending.set(mid, res); ws.send(JSON.stringify({ id: mid, method, params })); });

  await call('Page.enable');
  await call('Network.enable');
  await call('Page.navigate', { url: `http://127.0.0.1:${PORT}/index.html` });
  await sleep(5000);

  // ① SW 注册 + active
  let r = await call('Runtime.evaluate', { expression: `(async()=>{const reg=await navigator.serviceWorker.getRegistration();return JSON.stringify({reg:!!reg,act:!!(reg&&reg.active),scope:reg?reg.scope:''});})()`, awaitPromise: true, returnByValue: true });
  const swInfo = JSON.parse(r.result.value);
  check('SW 注册', swInfo.reg, swInfo.scope);
  check('SW active', swInfo.act);

  // 缓存条目
  r = await call('Runtime.evaluate', { expression: `(async()=>{try{const ks=await caches.keys();const c=await caches.open(ks[0]);const n=await c.keys();return JSON.stringify({keys:n.length});}catch(e){return '{"keys":-1}';}})()`, awaitPromise: true, returnByValue: true });
  const cacheInfo = JSON.parse(r.result.value);
  check('shell 缓存条目 ≥10', cacheInfo.keys >= 10, `keys=${cacheInfo.keys}`);

  // ② 断网 reload 后仍可玩
  await call('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
  await call('Page.reload', { ignoreCache: false });
  await sleep(4500);
  r = await call('Runtime.evaluate', { expression: `(function(){return JSON.stringify({engine:!!window.OPTCG,pool:window.OPTCG?OPTCG.POOL.cards.length:0,captains:document.querySelectorAll('#leaderChoices .captain-card').length});})()`, returnByValue: true });
  const off = JSON.parse(r.result.value);
  check('断网 reload：引擎可用', off.engine);
  check('断网 reload：卡池 192', off.pool === 192, `pool=${off.pool}`);
  check('断网 reload：大厅 12 船长', off.captains === 12, `captains=${off.captains}`);
  // 断网下卡图可取（SW cache-first）
  r = await call('Runtime.evaluate', { expression: `(async()=>{try{const r2=await fetch('art/RED-01.webp');return r2.status;}catch(e){return 0;}})()`, awaitPromise: true, returnByValue: true });
  check('断网卡图缓存命中', r.result.value === 200, `status=${r.result.value}`);

  await call('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  ws.close();
}
let exited = false;
try { await main(); } finally {
  if (!exited) {
    proc.kill(); server.close();
    try { rmSync(prof, { recursive: true, force: true }); } catch (e) { /* tmp 残留无害 */ }
    exited = true;
  }
}
console.log(fail ? 'PWA-PROBE-FAIL' : 'PWA-PROBE-PASS');
process.exit(fail ? 1 : 0);
