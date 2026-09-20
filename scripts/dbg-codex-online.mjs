// 线上图鉴缺图复测探针（#52 修复验证：lazy 降并发 + SW 重试 + img 自愈重试）
// 打开线上站 → 跳引导 → 开图鉴 → 分段滚动触发懒加载 → 统计真实失败卡数
// 用法：node scripts/dbg-codex-online.mjs [url]   （默认正式站）
// 断言：badN === 0（图片加载完成=complete 且 naturalWidth>0；被 onerror 两次移除=bad）
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const URL = process.argv.find((a) => a.startsWith('http')) || 'https://frandy820.github.io/optcg-battle/';
const USE_PROXY = process.argv.includes('--proxy'); // 本机直连 github.io 会被间歇掐连接（HTML 通、img 挂起）——代理=网络通畅对照组

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
const prof = mkdtempSync(join(tmpdir(), 'optcg-dbg-'));
const proc = spawn(chrome, [
  '--headless', '--disable-gpu', `--user-data-dir=${prof}`,
  `--remote-debugging-port=${port}`,
  '--mute-audio', '--no-first-run',
  USE_PROXY ? '--proxy-server=http://127.0.0.1:10809' : '--no-proxy-server',
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

  await call('Page.enable');
  await call('Page.navigate', { url: URL });
  await sleep(4500);
  await ev(`(()=>{const ob=document.getElementById('onboard'); if(ob&&!ob.classList.contains('hidden')){const s=ob.querySelector('.ob-skip'); if(s)s.click();} return 1;})()`);
  await sleep(500);

  // SW 状态（新 profile 应装上 v0.3.1-artfix）
  const swInfo = await ev(`(async()=>{const r=await navigator.serviceWorker.getRegistration(); return JSON.stringify({active:!!(r&&r.active), scope:r?r.scope:null, src:r&&r.active?r.active.scriptURL:null});})()`);
  console.log('SW:', swInfo);

  await ev(`document.getElementById('btnCodex').click();`);
  await sleep(800);

  // 分段滚动：每步滚 0.8 视口高，步间隔 350ms 触发 lazy 加载；到底后再缓滚回顶
  // （滚到底后顶部图已离开视口，Chrome 会降低其 lazy 优先级——回顶让顶部图重新进入视口）
  const scrollPass = `(async()=>{
    const b=document.querySelector('.codex-body'); if(!b) return 'NO-BODY';
    const step=Math.max(200,b.clientHeight*0.8);
    for(let y=0;y<=b.scrollHeight;y+=step){ b.scrollTop=y; await new Promise(r=>setTimeout(r,300)); }
    for(let y=b.scrollHeight;y>=0;y-=step){ b.scrollTop=y; await new Promise(r=>setTimeout(r,300)); }
    b.scrollTop=0; return 'SCROLLED';
  })()`;
  await ev(scrollPass);

  // 轮询 settle：pend 归零（全部加载完或失败）才统计；上限 90s（直连 github.io 慢）
  // 判定口径（POOL-3 后）：img 被 onerror 自删 ≠ 缺陷——纹章 fallback 接管是 #52 设计内降级
  //（244 新 char 立绘属 #53b 批量换真图待办）；真 bad = 卡壳破损（无 fallback 或无卡名）。
  const stat = `(()=>{
    const out=[]; let pend=0, lazy=0, noimg=0;
    document.querySelectorAll('.codex-grid .card').forEach(c=>{
      const img=c.querySelector('.art img');
      if(!img){
        const fb=c.querySelector('.art .fallback'), nm=c.querySelector('.name');
        if(fb && nm && nm.textContent.trim()) noimg++;
        else out.push(c.dataset.cardId+':broken');
        return;
      }
      if(img.loading==='lazy') lazy++;
      if(!(img.complete&&img.naturalWidth>0)){ pend++; out.push(c.dataset.cardId+':'+(img.complete?'0w':'pend')); }
    });
    return JSON.stringify({total:document.querySelectorAll('.codex-grid .card').length, bad:out, pend, lazy, noimg});})()`;
  let j = null;
  for (let i = 0; i < 45; i++) {
    await sleep(2000);
    j = JSON.parse((await ev(stat)) || '{}');
    if (!j.pend) break;
    if (i % 5 === 4) { // 长等时补一轮滚动，唤醒被降优先级的 lazy 图
      await ev(scrollPass);
    }
  }
  const badN = (j.bad || []).filter((s) => !s.endsWith(':pend')).length;
  console.log(`total=${j.total} lazy=${j.lazy} pend=${j.pend} bad=${badN} fallback纹章=${j.noimg}（#53b 待换真图）`);
  if (j.bad && j.bad.length) console.log('bad:', j.bad.slice(0, 30).join(' '));
  console.log(badN === 0 && j.pend === 0 && j.total >= 200 ? 'DBG-CODEX-PASS' : 'DBG-CODEX-FAIL');
  ws.close();
  process.exit(badN === 0 && j.pend === 0 && j.total >= 200 ? 0 : 1);
}
try { await main(); } finally {
  proc.kill();
  try { rmSync(prof, { recursive: true, force: true }); } catch (e) { /* */ }
}
