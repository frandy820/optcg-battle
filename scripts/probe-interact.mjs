// 攻击可视化四件套探针（#55）：攻击者高亮+小剑 / 对方可攻高亮 / 不可攻置灰+原因提示 / 飞剑动画
// 基于已验证的 probe-stats 骨架（CHROME_BIN + exceptionDetails 可见）
// 用法：node scripts/probe-interact.mjs
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
const chrome = findChrome();
const port = 9300 + Math.floor(Math.random() * 500);
const prof = mkdtempSync(join(tmpdir(), 'optcg-itx-'));
const proc = spawn(chrome, [
  '--headless', '--disable-gpu', `--user-data-dir=${prof}`, `--remote-debugging-port=${port}`,
  '--mute-audio', '--no-first-run', '--no-proxy-server', 'about:blank',
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
      const list = JSON.parse(execFileSync('curl', ['-s', `http://127.0.0.1:${port}/json/list`], { encoding: 'utf8' }));
      const page = list.find((t) => t.type === 'page');
      if (page) { wsUrl = page.webSocketDebuggerUrl; break; }
    } catch (e) { /* retry */ }
    await sleep(300);
  }
  if (!wsUrl) throw new Error('CDP 未就绪');
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
  const waitFor = async (expr, timeout, step) => {
    for (let i = 0; i < Math.ceil(timeout / (step || 500)); i++) {
      const v = await ev(expr);
      if (v === true) return true;
      await sleep(step || 500);
    }
    return false;
  };

  await call('Page.enable');
  // headless 环境 prefers-reduced-motion 默认可能=reduce（flySword 设计跳过演出）——强制 no-preference 测动画
  await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await call('Page.navigate', { url: PAGE });
  await sleep(3500);
  await ev(`(()=>{const ob=document.getElementById('onboard'); if(ob&&!ob.classList.contains('hidden')){const s=ob.querySelector('.ob-skip'); if(s)s.click();} return 1;})()`);
  await sleep(400);
  const st1 = await ev(`(()=>{document.getElementById('btnStart').click(); return 1;})()`);
  const inGame = await waitFor(`(OPTCG_GAME.state()&&OPTCG_GAME.state().turn>=1)===true`, 8000);
  check('进局', inGame === true && !st1.__err, st1.__err ? String(st1.__err).slice(0, 120) : '');

  // 等对方出角色（最多 4 轮；途中对方攻击我方会弹自然反击窗口——点「放弃」放行，否则死等超时）
  for (let i = 0; i < 4; i++) {
    const n = await ev(`document.querySelectorAll('#enemyBoard .card').length`);
    if (+n > 0) break;
    await ev(`(()=>{document.getElementById('btnEnd').click(); return 1;})()`);
    for (let w = 0; w < 50; w++) {
      // eslint-disable-next-line no-await-in-loop
      await sleep(1500);
      const st = await ev(`JSON.stringify({a:OPTCG_GAME.state().active,p:!!OPTCG_GAME.state().pending,win:OPTCG_GAME.state().winner,foe:document.querySelectorAll('#enemyBoard .card').length})`);
      const o = JSON.parse(st || '{}');
      if (o.win !== null) break;
      if (o.p) {
        // 反击窗口（AI 攻我方）：点放弃继续等 AI 回合收尾
        // eslint-disable-next-line no-await-in-loop
        await ev(`(()=>{const b=document.getElementById('btnPass'); if(b)b.click(); return 1;})()`);
        continue;
      }
      if (o.a === 0) break;
    }
    const ok = await ev(`(OPTCG_GAME.state()&&OPTCG_GAME.state().active===0&&!OPTCG_GAME.state().pending&&OPTCG_GAME.state().winner===null)===true`);
    if (!ok) break;
  }
  const foeN = await ev(`document.querySelectorAll('#enemyBoard .card').length`);
  check('对方场上已有角色', +foeN > 0, `foeN=${foeN}`);

  // ① 点我方船长=选攻击者：高亮+小剑+对方角色高亮+对方船长置灰
  const clickLead = await ev(`(()=>{const w=document.querySelector('#myLeaderSlot'); const c=w&&w.querySelector('.card');
    if(!c) return 'NO-CARD'; if(c.classList.contains('rest')) return 'REST'; w.click(); return 'OK';})()`);
  await sleep(250);
  const vis = await ev(`JSON.stringify({
    sel: document.querySelectorAll('#myLeaderSlot .card.selected').length,
    sword: document.querySelectorAll('.atk-sword').length,
    dim: document.querySelectorAll('#enemyLeaderSlot .card.dimmed').length,
    tgt: document.querySelectorAll('#enemyBoard .card.targetable').length,
  })`);
  const v = JSON.parse(vis || '{}');
  check('攻击者选中+小剑+对方角色高亮+船长置灰', clickLead === 'OK' && v.sel === 1 && v.sword === 1 && v.dim === 1 && v.tgt > 0,
    `click=${clickLead} ${vis}`);

  // ② 点置灰船长=提示原因
  const hintTxt = await ev(`(()=>{document.querySelector('#enemyLeaderSlot').click();
    return (document.getElementById('hint')||{textContent:''}).textContent;})()`);
  check('点置灰船长→提示不可攻原因', String(hintTxt).includes('先击败角色'), String(hintTxt).slice(0, 24));

  // ③ 点对方高亮角色=飞剑演出+攻击结算
  await ev(`(()=>{window.__flyN=0; if(window.__flyObs)window.__flyObs.disconnect();
    window.__flyObs=new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes){if(n.classList&&n.classList.contains('fly-sword'))window.__flyN++;}});
    window.__flyObs.observe(document.body,{childList:true}); return 1;})()`);
  await ev(`(()=>{const t=document.querySelector('#enemyBoard .card.targetable'); if(t)t.click(); return 1;})()`);
  await sleep(1500);
  const flyN = await ev(`window.__flyN||0`);
  const stAfter = await ev(`JSON.stringify(OPTCG_GAME.state())`);
  check('点高亮目标→飞剑动画出现', +flyN >= 1, `flyN=${flyN}`);
  check('飞剑后攻击已结算（状态推进）', (() => { try { const s = JSON.parse(stAfter); return s && s.turn >= 1 && (s.pending !== undefined); } catch (e) { return false; } })(), stAfter && String(stAfter).slice(0, 60));

  // ④ Escape 清攻击选择（无残留）
  await ev(`(()=>{const w=document.querySelector('#myLeaderSlot'); const c=w&&w.querySelector('.card'); if(c&&!c.classList.contains('rest'))w.click(); return 1;})()`);
  await sleep(200);
  const cleaned = await ev(`JSON.stringify({tgt:document.querySelectorAll('.targetable').length,dim:document.querySelectorAll('.dimmed').length,sw:document.querySelectorAll('.atk-sword').length})`);
  await ev(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})); return 1;`);
  await sleep(250);
  const after = JSON.parse(await ev(`JSON.stringify({tgt:document.querySelectorAll('.targetable').length,dim:document.querySelectorAll('.dimmed').length,sw:document.querySelectorAll('.atk-sword').length})`) || '{}');
  check('Escape 取消攻击选择（高亮/置灰/小剑全清）', (after.tgt === 0 && after.dim === 0 && after.sw === 0) || JSON.parse(cleaned).tgt === 0, JSON.stringify(after));

  ws.close();
}
try { await main(); } finally {
  proc.kill();
  try { rmSync(prof, { recursive: true, force: true }); } catch (e) { /* */ }
}
console.log(fail ? 'INTERACT-PROBE-FAIL' : 'INTERACT-PROBE-PASS');
process.exit(fail ? 1 : 0);
