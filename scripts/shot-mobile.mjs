// 手机视口截图：CDP Emulation.setDeviceMetricsOverride 精确视口（--window-size 不落布局视口，坑在案）
// 用法：node scripts/shot-mobile.mjs [宽] [高] [输出前缀]
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const W = Number(process.argv[2] || 390);
const H = Number(process.argv[3] || 844);
const PREFIX = process.argv[4] || 'mobile';
const ROOT = resolve(dirnameOfImportMeta(), '..');
function dirnameOfImportMeta() { return new URL('.', import.meta.url).pathname.replace(/^\//, '').replace(/\//g, '\\'); }
const PAGE = 'file:///' + join(ROOT, 'web', 'index.html').replace(/\\/g, '/');

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
const prof = mkdtempSync(join(tmpdir(), 'optcg-shot-'));
const proc = spawn(chrome, [
  '--headless', '--disable-gpu', `--user-data-dir=${prof}`,
  `--remote-debugging-port=${port}`,
  '--mute-audio', '--no-first-run', '--no-proxy-server',
  'about:blank',
], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    try {
      const list = JSON.parse(execFileSync('curl', ['-s', `http://127.0.0.1:${port}/json/list`], { encoding: 'utf8' }));
      const page = list.find((t) => t.type === 'page');
      if (page) { wsUrl = page.webSocketDebuggerUrl; break; }
    } catch (e) { /* 重试 */ }
    await sleep(300);
  }
  if (!wsUrl) throw new Error('CDP 未就绪');
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } });
  const call = (method, params) => new Promise((res) => { const mid = ++id; pending.set(mid, res); ws.send(JSON.stringify({ id: mid, method, params })); });
  const shot = async (name) => {
    const r = await call('Page.captureScreenshot', { format: 'png' });
    writeFileSync(`${PREFIX}-${name}.png`, Buffer.from(r.data, 'base64'));
    console.log(`${PREFIX}-${name}.png`);
  };
  await call('Page.enable');
  await call('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true });
  await call('Page.navigate', { url: PAGE });
  await sleep(3500);
  await shot('hall');
  // 跳引导 → 出航进对战
  await call('Runtime.evaluate', { expression: `(async()=>{const ob=document.getElementById('onboard'); if(ob&&!ob.classList.contains('hidden')){const s=ob.querySelector('.ob-skip'); if(s)s.click();} await new Promise(r=>setTimeout(r,400)); document.getElementById('btnStart').click();})()` });
  await sleep(4500);
  await shot('game-early');
  // 多走几回合让场面铺开
  await call('Runtime.evaluate', { expression: `(window.OPTCG_GAME&&OPTCG_GAME.state()&&OPTCG_GAME.autoplay(20,80),1)` });
  await sleep(12000);
  await shot('game-mid');
  // 手牌悬停信息卡（长按等价 hover 不行，直接看图鉴放大）
  ws.close();
}
try { await main(); } finally {
  proc.kill();
  try { rmSync(prof, { recursive: true, force: true }); } catch (e) { /* tmp 残留无害 */ }
}
