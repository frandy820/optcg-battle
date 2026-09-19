// 大厅文案 DOM 探针：读 .captain-card 的 hp/能力文案渲染结果（文字类核源串，VLM 不如 DOM 直读）
// 用法：node scripts/probe-hall.mjs
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
const prof = mkdtempSync(join(tmpdir(), 'optcg-probe-'));
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

  await call('Page.enable');
  await call('Page.navigate', { url: PAGE });
  await sleep(3500);
  // 跳过引导遮罩（若在）再读大厅卡片
  await call('Runtime.evaluate', { expression: `(()=>{const ob=document.getElementById('onboard'); if(ob&&!ob.classList.contains('hidden')){const s=ob.querySelector('.ob-skip'); if(s)s.click();} return 1;})()` });
  await sleep(600);
  const r = await call('Runtime.evaluate', {
    returnByValue: true,
    expression: `(()=> {
      const cards = [...document.querySelectorAll('#leaderChoices .captain-card')];
      return JSON.stringify(cards.map(c => ({
        name: (c.querySelector('.cc-name')||{}).textContent,
        hp: (c.querySelector('.cc-hp')||{}).textContent,
        ability: (c.querySelector('.cc-ability')||{}).textContent,
        lp: (c.querySelector('.cc-life')||{}).textContent,
      })));
    })()`,
  });
  const rows = JSON.parse(r.result.value);
  console.log(`大厅卡片数: ${rows.length}`);
  for (const x of rows) console.log(`- ${x.name} | ${x.hp} | ${x.lp}\n  ${x.ability}`);
  // help 面板船长技能段
  await call('Runtime.evaluate', { expression: `document.getElementById('btnHallHelp').click()` });
  await sleep(400);
  const r2 = await call('Runtime.evaluate', {
    returnByValue: true,
    expression: `(()=>{const p=[...document.querySelectorAll('#helpBody .help-sec h4')].map(h=>h.textContent); const skillSec=[...document.querySelectorAll('#helpBody .help-sec')].find(s=>s.querySelector('h4')&&s.querySelector('h4').textContent.includes('船长技能')); return JSON.stringify({secs:p, skill:skillSec?skillSec.querySelector('p').textContent:null});})()`,
  });
  const h = JSON.parse(r2.result.value);
  console.log(`\nhelp 章节 ${h.secs.length} 个；船长技能段：\n${h.skill}`);
  ws.close();
}
try { await main(); } finally {
  proc.kill();
  try { rmSync(prof, { recursive: true, force: true }); } catch (e) { /* tmp 残留无害 */ }
}
