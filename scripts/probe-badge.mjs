// 反击徽章 vs 战力徽章重叠检测（用户手机实测反馈：雷藏 4K 被「反击 1K」遮住）
// 图鉴面板渲染全卡池，逐卡量 .power 与 .counter-badge 的 getBoundingClientRect 相交面积；
// 桌面 1280 与手机 390 两视口各测一轮。
// 用法：node scripts/probe-badge.mjs
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ROOT = resolve(new URL('.', import.meta.url).pathname.replace(/^\//, '').replace(/\//g, '\\'), '..');
const PAGE = 'file:///' + join(ROOT, 'web', 'index.html').replace(/\\/g, '/');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fail = 0;
const check = (name, ok, extra = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${extra ? ' | ' + extra : ''}`);
  if (!ok) fail++;
};

const port = 9300 + Math.floor(Math.random() * 500);
const prof = mkdtempSync(join(tmpdir(), 'optcg-badge-'));
const proc = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless', '--disable-gpu', `--user-data-dir=${prof}`,
  `--remote-debugging-port=${port}`,
  '--mute-audio', '--no-first-run', 'about:blank',
], { stdio: 'ignore' });

async function main() {
  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    try {
      const out = execFileSync('curl', ['-s', `http://127.0.0.1:${port}/json/list`], { encoding: 'utf8' });
      const p = JSON.parse(out).find((t) => t.type === 'page');
      if (p) { wsUrl = p.webSocketDebuggerUrl; break; }
    } catch (e) { /* retry */ }
    await sleep(300);
  }
  const ws = new WebSocket(wsUrl);
  await new Promise((r) => { ws.onopen = r; });
  let id = 0; const pending = new Map();
  ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } });
  const call = (m, p) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  const ev = async (e) => (await call('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true })).result.value;

  await call('Page.enable');
  await call('Page.navigate', { url: PAGE });
  await sleep(3500);
  await ev(`(()=>{const ob=document.getElementById('onboard'); if(ob&&!ob.classList.contains('hidden')){const s=ob.querySelector('.ob-skip'); if(s)s.click();} return 1;})()`);
  await sleep(400);

  for (const [w, h, tag] of [[1280, 800, '桌面'], [390, 844, '手机390']]) {
    await call('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w <= 640 });
    await sleep(600);
    await ev(`document.getElementById('btnCodex').click();`);
    await sleep(600);
    await ev(`(()=>{const b=document.querySelector('.codex-body'); if(b)b.scrollTop=b.scrollHeight; return 1;})()`);
    await sleep(900);
    const res = await ev(`(()=>{
      const out=[];
      document.querySelectorAll('.codex-grid .card').forEach(c=>{
        const p=c.querySelector('.power'), b=c.querySelector('.counter-badge');
        if(!p||!b) return;
        const r1=p.getBoundingClientRect(), r2=b.getBoundingClientRect();
        const ox=Math.max(0,Math.min(r1.right,r2.right)-Math.max(r1.left,r2.left));
        const oy=Math.max(0,Math.min(r1.bottom,r2.bottom)-Math.max(r1.top,r2.top));
        if(ox>1&&oy>1) out.push(c.dataset.cardId+':'+p.textContent+'x'+b.textContent+'('+Math.round(ox)+'x'+Math.round(oy)+')');
      });
      return JSON.stringify({overlap:out,n:document.querySelectorAll('.codex-grid .card').length});})()`);
    const j = JSON.parse(res || '{}');
    check(`[${tag}] 图鉴全卡 power×counter 零重叠`, !(j.overlap && j.overlap.length), j.overlap && j.overlap.length ? j.overlap.slice(0, 5).join(' ') : `cards=${j.n}`);
    const rz = await ev(`(()=>{const c=document.querySelector('.codex-grid .card[data-card-id="GREEN-02"]'); if(!c)return JSON.stringify({err:'NOT-IN-VIEW'});
      const p=c.querySelector('.power'), b=c.querySelector('.counter-badge');
      const r1=p.getBoundingClientRect(), r2=b.getBoundingClientRect();
      const ox=Math.max(0,Math.min(r1.right,r2.right)-Math.max(r1.left,r2.left));
      const oy=Math.max(0,Math.min(r1.bottom,r2.bottom)-Math.max(r1.top,r2.top));
      return JSON.stringify({pw:p.textContent,cb:b.textContent,ox:Math.round(ox),oy:Math.round(oy)});})()`);
    const rj = JSON.parse(rz || '{}');
    check(`[${tag}] 雷藏(GREEN-02) 战力与反击徽章分离`, rj.err ? false : (rj.ox <= 1 || rj.oy <= 1), rz);
    await ev(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})); return 1;`);
    await sleep(300);
  }
  ws.close();
}
try { await main(); } finally {
  proc.kill();
  try { rmSync(prof, { recursive: true, force: true }); } catch (e) { /* */ }
}
console.log(fail ? 'BADGE-PROBE-FAIL' : 'BADGE-PROBE-PASS');
process.exit(fail ? 1 : 0);
