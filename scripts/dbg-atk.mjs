// 临时诊断：攻击选择态 class 逐步检查（dim/sword/tgt 为何缺失）
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ROOT = resolve(new URL('.', import.meta.url).pathname.replace(/^\//, '').replace(/\//g, '\\'), '..');
const PAGE = 'file:///' + join(ROOT, 'web', 'index.html').replace(/\\/g, '/');
const port = 9300 + Math.floor(Math.random() * 500);
const prof = mkdtempSync(join(tmpdir(), 'optcg-atk-'));
const proc = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless', '--disable-gpu', `--user-data-dir=${prof}`, `--remote-debugging-port=${port}`,
  '--mute-audio', '--no-first-run', '--no-proxy-server', 'about:blank',
], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let wsUrl = null;
for (let i = 0; i < 30; i++) {
  try {
    const p = JSON.parse(execFileSync('curl', ['-s', `http://127.0.0.1:${port}/json/list`], { encoding: 'utf8' })).find((t) => t.type === 'page');
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
// 收集页面错误（进局失败/渲染异常全记录）
await ev(`window.__errs=[]; window.addEventListener('error',e=>window.__errs.push(String(e.message))); return 1;`);
await ev(`(()=>{const ob=document.getElementById('onboard'); if(ob&&!ob.classList.contains('hidden')){const s=ob.querySelector('.ob-skip'); if(s)s.click();} return 1;})()`);
await sleep(300);
await ev(`document.getElementById('btnStart').click(); return 1;`);
// waitFor turn>=1（与 probe-branches enterGame 同款）
let inGame = false;
for (let i = 0; i < 16; i++) { await sleep(500); const t = await ev(`(OPTCG_GAME.state()||{}).turn`); if (+t >= 1) { inGame = true; break; } }
console.log('inGame=', inGame, 'errs=', await ev(`JSON.stringify(window.__errs)`));
// 等 AI 出角色（最多 3 轮）
for (let i = 0; i < 6; i++) {
  const n = await ev(`document.querySelectorAll('#enemyBoard .card').length`);
  if (+n > 0) break;
  await ev(`document.getElementById('btnEnd').click();`);
  // 等 AI 回合结束回我方
  for (let j = 0; j < 40; j++) { await sleep(1000); const st = await ev(`(OPTCG_GAME.state()||{}).active`); if (+st === 0) break; }
}
console.log('foeBoard=', await ev(`document.querySelectorAll('#enemyBoard .card').length`), 'turn=', await ev(`(OPTCG_GAME.state()||{}).turn`), 'active=', await ev(`(OPTCG_GAME.state()||{}).active`), 'pending=', await ev(`(OPTCG_GAME.state()||{}).pending`));
// 点我方船长 → 立即查 class
await ev(`document.querySelector('#myLeaderSlot').click(); return 1;`);
await sleep(200);
const st1 = await ev(`JSON.stringify({
  selMode_attack_sel: document.querySelectorAll('#myLeaderSlot .card.selected').length,
  sword: document.querySelectorAll('.atk-sword').length,
  dim: document.querySelectorAll('#enemyLeaderSlot .card.dimmed').length,
  tgt_board: document.querySelectorAll('#enemyBoard .card.targetable').length,
  tgt_leader: document.querySelectorAll('#enemyLeaderSlot .card.targetable').length,
  leaderHtml: (document.querySelector('#myLeaderSlot .card')||{}).className,
  foeLeaderHtml: (document.querySelector('#enemyLeaderSlot .card')||{}).className,
})`);
console.log('AFTER-CLICK:', st1);
// 手动在页面执行 highlight 等价逻辑诊断（看 handler 是否被正确触发）
const st2 = await ev(`(()=>{ try { return JSON.stringify({hasFn: typeof window.OPTCG==='object'}); } catch(e){ return 'ERR:'+e.message; } })()`);
console.log('DIAG:', st2);
proc.kill();
try { rmSync(prof, { recursive: true, force: true }); } catch (e) { /* */ }
