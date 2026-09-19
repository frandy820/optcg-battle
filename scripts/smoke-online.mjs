// 线上冒烟：headless Chrome 常驻 + CDP（node 内置 WebSocket）导航到发布页，注入探针轮询结果。
// 不用 e2e 的 dump-dom+virtual-time 通道（虚拟时钟与真实网络冲突，线上 NO-RESULT 实证）。
// Chrome 合规：--headless（非 =new）+ 独立 user-data-dir + 随机调试端口（9300+rand）；退出按自启 PID 精确杀。
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const URL_BASE = process.argv[2] || 'https://frandy820.github.io/optcg-battle/';
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
const port = 9300 + Math.floor(Math.random() * 500);
const prof = mkdtempSync(join(tmpdir(), 'optcg-smoke-'));
const proc = spawn(chrome, [
  '--headless', '--disable-gpu', `--user-data-dir=${prof}`,
  `--remote-debugging-port=${port}`,
  '--window-size=1440,900', '--mute-audio', '--no-first-run', '--no-proxy-server',
  '--disable-background-networking', '--disable-component-update', '--disable-sync',
  'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function getTargetWs() {
  for (let i = 0; i < 30; i++) {
    try {
      const list = JSON.parse(execFileSync('curl', ['-s', `http://127.0.0.1:${port}/json/list`], { encoding: 'utf8' }));
      const page = list.find((t) => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch (e) { /* 端口未就绪，重试 */ }
    await sleep(300);
  }
  throw new Error('CDP 端口未就绪');
}

// 探针：错误收集 + 大厅/引擎/对战/走步检查，结果写 title
const PROBE = `(window.__smoke = async () => {
  window.__errs = []; addEventListener('error', (e) => window.__errs.push(e.message));
  const out = [];
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const waitFor = async (f, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const v = f(); if (v) return v; await sleep(200); } return null; };
  out.push(['engine', !!window.OPTCG]);
  // PWA 资源：manifest 链接 + SW 注册成功（https 线上才注册；file:// 探针环境跳过）
  const mf = document.querySelector('link[rel="manifest"]');
  out.push(['manifest', !!mf]);
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    out.push(['sw', !!reg, reg ? 'act=' + (reg.active ? 1 : 0) : '']);
  } catch (e) { out.push(['sw', false, 'no-sw-api']); }
  out.push(['pool', !!(window.OPTCG && OPTCG.POOL && OPTCG.POOL.cards.length > 100), window.OPTCG ? OPTCG.POOL.cards.length : 0]);
  out.push(['captains', !!window.OPTCG_CAPTAINS]);
  const ob = document.getElementById('onboard');
  if (ob && !ob.classList.contains('hidden')) { const s = ob.querySelector('.ob-skip'); if (s) s.click(); await sleep(300); }
  const start = document.getElementById('btnStart');
  out.push(['startBtn', !!start]);
  start && start.click();
  const inGame = await waitFor(() => window.OPTCG_GAME && OPTCG_GAME.state(), 8000);
  out.push(['inGame', !!inGame, inGame ? 'turn=' + OPTCG_GAME.state().turn : '']);
  if (inGame) {
    OPTCG_GAME.autoplay(8, 50);
    const adv = await waitFor(() => { const s = OPTCG_GAME.state(); return s && s.turn >= 2; }, 25000);
    out.push(['engineSteps', !!adv, adv ? 'turn=' + OPTCG_GAME.state().turn : '']);
  }
  out.push(['jsErrors', (window.__errs || []).length, (window.__errs || []).slice(0, 2).join(';')]);
  document.title = 'SMOKE ' + out.map((x) => x.filter((v) => v !== '').join(':')).join(' | ');
})();`;

async function cdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0;
  const call = (method, params) => new Promise((res) => {
    const mid = ++id;
    const onmsg = (ev) => { const m = JSON.parse(ev.data); if (m.id === mid) { ws.removeEventListener('message', onmsg); res(m.result); } };
    ws.addEventListener('message', onmsg);
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
  return { ws, call };
}

try {
  const wsUrl = await getTargetWs();
  const { ws, call } = await cdp(wsUrl);
  await call('Page.enable');
  await call('Page.navigate', { url: URL_BASE + 'index.html' });
  await sleep(4000); // 网络加载
  await call('Runtime.evaluate', { expression: PROBE });
  let result = null;
  for (let i = 0; i < 60; i++) {
    await sleep(1000);
    const r = await call('Runtime.evaluate', { expression: 'document.title', returnByValue: true });
    if (r && r.result && String(r.result.value).startsWith('SMOKE ')) { result = r.result.value; break; }
  }
  if (!result) { console.error('SMOKE-NO-RESULT（探针 60s 未产出）'); process.exit(1); }
  console.log(result);
  // PWA 静态资源 HTTP 200 断言（manifest/sw/图标）
  for (const f of ['manifest.webmanifest', 'sw.js', 'icon-192.png', 'icon-512.png']) {
    const r = execFileSync('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', URL_BASE + f], { encoding: 'utf8' }).trim();
    console.log(`pwa ${f}: ${r}`);
    if (r !== '200') { console.error('SMOKE-FAIL（PWA 资源缺失）'); process.exit(1); }
  }
  const bad = /false|jsErrors:[1-9]/.test(result);
  console.log(bad ? 'SMOKE-FAIL' : 'SMOKE-PASS');
  ws.close();
  process.exit(bad ? 1 : 0);
} finally {
  proc.kill(); // 只杀自启 PID，不碰用户浏览器
  try { rmSync(prof, { recursive: true, force: true }); } catch (e) { /* Windows 句柄延迟：tmp 残留无害 */ }
}
