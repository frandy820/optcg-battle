// 战绩+回放 UI 端到端探针（file:// + CDP）
// 链路：选新船长(艾斯) → 进局(验证 leaderId/foeColor 链路) → autoplay 打完全局 →
//       战绩落库 → 大厅战绩面板渲染 → 回放播放(replayBar/步进/终局一致) → 退出回放
// 用法：node scripts/probe-stats.mjs
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ROOT = resolve(new URL('.', import.meta.url).pathname.replace(/^\//, '').replace(/\//g, '\\'), '..');
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
const prof = mkdtempSync(join(tmpdir(), 'optcg-stats-'));
const proc = spawn(chrome, [
  '--headless', '--disable-gpu', `--user-data-dir=${prof}`,
  `--remote-debugging-port=${port}`,
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
      const list = JSON.parse(execFileSync('curl', ['-s', `http://127.0.0.1:${port}/json/list`], { encoding: 'utf8' }));
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
  const ev = async (expression) => {
    const r = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) return { __err: r.exceptionDetails.exception?.description || r.exceptionDetails.text };
    return r.result.value;
  };

  await call('Page.enable');
  await call('Page.navigate', { url: PAGE });
  await sleep(3500);
  // 跳引导
  await ev(`(()=>{const ob=document.getElementById('onboard'); if(ob&&!ob.classList.contains('hidden')){const s=ob.querySelector('.ob-skip'); if(s)s.click();} return 1;})()`);
  await sleep(500);

  // ① 选新船长艾斯 → 进局
  const ace = await ev(`(()=>{const b=document.querySelector('#leaderChoices .captain-card[data-leader-id="LEADER-RED2"]'); if(!b) return 'NO-CARD'; b.click(); return document.querySelectorAll('#leaderChoices .captain-card.pick').length;})()`);
  check('选将：艾斯卡存在且选中唯一', ace === 1, `pick=${ace}`);
  await ev(`(()=>{document.getElementById('btnStart').click(); return 1;})()`);
  await sleep(1200);
  let st = await ev(`(window.OPTCG_GAME&&OPTCG_GAME.state())||null`);
  check('进局成功（foeColor 链路修复）', !!(st && st.turn), JSON.stringify(st));
  const myLeaderOk = await ev(`OPTCG_GAME.state() && document.querySelector('#myLeaderSlot .card .name') ? document.querySelector('#myLeaderSlot .card .name').textContent : ''`);
  check('我方船长=艾斯', myLeaderOk.includes('艾斯'), myLeaderOk);

  // ② autoplay 打完全局
  await ev(`(OPTCG_GAME.autoplay(999, 40), 1)`);
  let winner = null;
  for (let i = 0; i < 200; i++) {
    await sleep(1500);
    st = await ev(`(window.OPTCG_GAME&&OPTCG_GAME.state())||null`);
    if (st && st.winner !== null && st.winner !== undefined) { winner = st.winner; break; }
  }
  check('对局打完（autoplay 终局）', winner !== null, `winner=${winner}`);

  // ③ 等 showEndPanel 弹出（record 在其中调用；过早点返回会被 gen 守卫跳过记录）
  let endShown = false;
  for (let i = 0; i < 20; i++) {
    const vis = await ev(`(!document.getElementById('endPanel').classList.contains('hidden'))`);
    if (vis === true) { endShown = true; break; }
    await sleep(500);
  }
  check('终局结算面板弹出（record 时机已到）', endShown === true);
  const statsData = await ev(`(window.OPTCG_SAVE?OPTCG_SAVE.get('stats'):null)`);
  check('战绩记录 1 条', !!(statsData && statsData.length === 1), `n=${statsData ? statsData.length : -1}`);
  if (statsData && statsData[0]) {
    check('记录含艾斯+胜负+回放引用', statsData[0].leaderId === 'LEADER-RED2' && typeof statsData[0].win === 'boolean' && !!statsData[0].replayId,
      `${statsData[0].leaderName}/${statsData[0].foeName}/${statsData[0].win ? 'win' : 'lose'}`);
  }
  const rpData = await ev(`(window.OPTCG_SAVE?OPTCG_SAVE.get('replays'):null)`);
  check('回放数据 1 份（seed+50+50+actions）', !!(rpData && rpData.length === 1 && rpData[0].seed && rpData[0].deckA.length === 50 && rpData[0].deckB.length === 50 && rpData[0].actions.length > 10),
    `actions=${rpData && rpData[0] ? rpData[0].actions.length : -1}`);

  // ④ 终局面板 → 返回大厅 → 战绩面板
  await sleep(800);
  await ev(`(()=>{const b=document.getElementById('btnBackMenu'); if(b)b.click(); return 1;})()`);
  await sleep(600);
  const statsBtn = await ev(`(()=>{const b=document.getElementById('btnStats'); if(!b) return false; b.click(); return !document.getElementById('statsPanel').classList.contains('hidden');})()`);
  check('大厅「战绩回放」按钮+面板打开', statsBtn === true);
  const panelInfo = await ev(`(()=>{const b=document.getElementById('statsBody'); return JSON.stringify({ov:b.querySelectorAll('.st-ov').length, rows:b.querySelectorAll('.st-row').length, games:b.querySelectorAll('.st-game').length});})()`);
  const pi = JSON.parse(panelInfo || '{}');
  check('面板渲染：总览5+对局列表≥1', pi.ov === 5 && pi.games >= 1, panelInfo);

  // ⑤ 回放播放
  await ev(`(()=>{const b=document.querySelector('.st-g-replay'); if(b)b.click(); return 1;})()`);
  await sleep(1000);
  const barOk = await ev(`(()=>{const b=document.getElementById('replayBar'); return b?b.textContent.includes('回放'):false;})()`);
  check('回放控制条出现', barOk === true);
  // 加速 4x 播完
  await ev(`(()=>{const b=document.getElementById('rpSpeed'); if(b){b.click();b.click();} return 1;})()`);
  let rpDone = null;
  for (let i = 0; i < 150; i++) {
    await sleep(1000);
    const t = await ev(`(document.getElementById('rpProg')?document.getElementById('rpProg').textContent:'')`);
    const stillReplay = await ev(`(!!document.getElementById('replayBar'))`);
    if (t.includes('播完')) { rpDone = t; break; }
    if (!stillReplay) { rpDone = 'BAR-GONE:' + t; break; }
  }
  check('回放播放完成', rpDone !== null && !String(rpDone).startsWith('BAR-GONE'), String(rpDone));
  // 回放终局与原局一致
  const rpWinner = await ev(`(window.OPTCG_GAME&&OPTCG_GAME.state()?OPTCG_GAME.state().winner:null)`);
  check('回放终局 == 原局（确定性）', rpWinner === winner, `replay=${rpWinner} orig=${winner}`);
  // 退出回放
  await ev(`(()=>{const b=document.getElementById('rpExit'); if(b)b.click(); return 1;})()`);
  await sleep(600);
  const backHall = await ev(`(!document.getElementById('setupPanel').classList.contains('hidden'))`);
  check('退出回放返回大厅', backHall === true);

  ws.close();
}
try { await main(); } finally {
  proc.kill();
  try { rmSync(prof, { recursive: true, force: true }); } catch (e) { /* tmp 残留无害 */ }
}
console.log(fail ? 'STATS-PROBE-FAIL' : 'STATS-PROBE-PASS');
process.exit(fail ? 1 : 0);
