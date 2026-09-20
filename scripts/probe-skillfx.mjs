// F11 探针：真实对局中船长技能发动演出（skill-fx 横幅 / skill-glow 光环 / awaken 金闪）
// 复用 probe-leaders 已验证骨架（CHROME_BIN + IIFE + exceptionDetails 可见）
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ROOT = resolve(new URL('.', import.meta.url).pathname.replace(/^\//, '').replace(/\//g, '\\'), '..');
const PAGE = 'file:///' + join(ROOT, 'web', 'index.html').replace(/\\/g, '/');
function findChrome() {
  const cands = [
    process.env.CHROME_BIN,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe',
  ].filter((x) => typeof x === 'string' && existsSync(x));
  if (!cands.length) { console.error('chrome not found'); process.exit(2); }
  return cands[0];
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fail = 0;
const check = (name, ok, extra = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${extra ? ' | ' + extra : ''}`);
  if (!ok) fail++;
};

const port = 9300 + Math.floor(Math.random() * 500);
const prof = mkdtempSync(join(tmpdir(), 'optcg-sk-'));
const proc = spawn(findChrome(), [
  '--headless', '--disable-gpu', `--user-data-dir=${prof}`, `--remote-debugging-port=${port}`,
  '--mute-audio', '--no-first-run', '--no-proxy-server', 'about:blank',
], { stdio: 'ignore' });

async function main() {
  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    try {
      const list = JSON.parse(execFileSync('curl', ['-s', `http://127.0.0.1:${port}/json/list`], { encoding: 'utf8' }));
      const page = list.find((t) => t.type === 'page');
      if (page) { wsUrl = page.webSocketDebuggerUrl; break; }
    } catch (e) { /* retry */ }
    await sleep(300);
  }
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map();
  ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } });
  const call = (method, params) => new Promise((res) => { const mid = ++id; pending.set(mid, res); ws.send(JSON.stringify({ id: mid, method, params })); });
  const ev = async (expression) => {
    const r = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) return { __err: r.exceptionDetails.exception?.description || r.exceptionDetails.text };
    return r.result.value;
  };

  await call('Page.enable');
  await call('Page.navigate', { url: PAGE });
  await sleep(3500);
  await ev(`(()=>{const ob=document.getElementById('onboard'); if(ob&&!ob.classList.contains('hidden')){const s=ob.querySelector('.ob-skip'); if(s)s.click();} return 1;})()`);
  await sleep(400);

  // 观察器：记录三类演出元素出现次数与首例内容（横幅/金闪挂 body；glow 是卡上 class）
  await ev(`(()=>{
    window.__skSeen = { fx:0, glow:0, flash:0, names:[], errs:[] };
    new MutationObserver((muts)=>{
      for(const m of muts){ for(const n of m.addedNodes){
        if(!(n instanceof HTMLElement)) continue;
        if(n.classList.contains('skill-fx')){ window.__skSeen.fx++; const nm=n.querySelector('.sk-name'); if(nm) window.__skSeen.names.push(nm.textContent+(n.classList.contains('awaken')?'(觉醒)':'')); }
        if(n.classList.contains('skill-flash')) window.__skSeen.flash++;
      }}
    }).observe(document.body, { childList:true, subtree:false });
    new MutationObserver((muts)=>{
      for(const m of muts){ if(m.target.classList && m.target.classList.contains('skill-glow')) window.__skSeen.glow++; }
    }).observe(document.body, { attributes:true, attributeFilter:['class'], subtree:true });
    window.addEventListener('error', e=>window.__skSeen.errs.push(String(e.message)));
    return 1;
  })()`);

  // 进局 + autoplay 走 200 步（真实事件流驱动；双方船长技能 onTurnStart/onSummon/whenAttacking 高频触发）
  await ev(`document.getElementById('btnStart').click()`);
  await sleep(1200);
  await ev(`OPTCG_GAME.autoplay(200, 240)`);
  // 轮询等演出出现（最多 ~50s）
  let seen = '{}';
  for (let i = 0; i < 25; i++) {
    await sleep(2000);
    seen = await ev(`JSON.stringify(window.__skSeen)`);
    const v = JSON.parse(seen || '{}');
    if (v.fx >= 1 && v.glow >= 1) break;
  }
  const v = JSON.parse(seen || '{}');
  check('对局中出现技能名横幅（skill-fx）', v.fx >= 1, `fx=${v.fx}`);
  check('船长卡光环脉冲（skill-glow）', v.glow >= 1, `glow=${v.glow}`);
  check('横幅内容=真实技能名', (v.names || []).length >= 1 && v.names.every((n) => n.length >= 2), JSON.stringify(v.names || []).slice(0, 120));
  console.log(`INFO awaken金闪=${v.flash} 次（觉醒技 LP≤4000 条件，非必现）`);
  check('无页面 JS 错误', (v.errs || []).length === 0, JSON.stringify(v.errs || []).slice(0, 160));

  // 演出不阻塞流程：对局状态机仍活着（已终局或回合在推进）
  const st = await ev(`JSON.stringify(OPTCG_GAME.state())`);
  check('演出未阻塞对局驱动', !!st && !st.__err, st);
  ws.close();
}
try { await main(); } finally {
  proc.kill();
  try { rmSync(prof, { recursive: true, force: true }); } catch (e) { /* */ }
}
console.log(fail ? 'SKILLFX-PROBE-FAIL' : 'SKILLFX-PROBE-PASS');
process.exit(fail ? 1 : 0);
