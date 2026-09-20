// v2 船长分化探针：LP 三档选将说明 / 技能徽章 / 战斗中「?」按钮 / 悬停技能 tip
// 复用 probe-interact 已验证骨架（CHROME_BIN + IIFE + exceptionDetails 可见）
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
const prof = mkdtempSync(join(tmpdir(), 'optcg-ld-'));
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
  const waitFor = async (expr, timeout, step) => {
    for (let i = 0; i < Math.ceil(timeout / (step || 500)); i++) {
      const v = await ev(expr);
      if (v === true) return true;
      await sleep(step || 500);
    }
    return false;
  };

  await call('Page.enable');
  await call('Page.navigate', { url: PAGE });
  await sleep(3500);
  await ev(`(()=>{const ob=document.getElementById('onboard'); if(ob&&!ob.classList.contains('hidden')){const s=ob.querySelector('.ob-skip'); if(s)s.click();} return 1;})()`);
  await sleep(500);

  // ===== 大厅：选将卡 v2 说明 =====
  let r = await ev(`JSON.stringify((()=>{
    const cards=[...document.querySelectorAll('#leaderChoices .captain-card')];
    const byLp={};
    for(const c of cards){const m=(c.querySelector('.cc-life')||{textContent:''}).textContent.match(/LP (\\d+)/);const lp=m?+m[1]:0;byLp[lp]=(byLp[lp]||0)+1;}
    return {n:cards.length, byLp,
      skillsAll:cards.every(c=>c.querySelector('.cc-skills')&&c.querySelectorAll('.cc-skill').length>=1),
      tierBadges:cards.filter(c=>{const e=c.querySelector('.cc-life');return e&&e.classList.contains('tier');}).length,
      skillCounts:[...cards].map(c=>c.querySelectorAll('.cc-skill').length).sort((a,b)=>a-b).join(','),
      awakenBadges:document.querySelectorAll('#leaderChoices .cc-skill.awaken').length};
  })())`);
  let v = JSON.parse(r || '{}');
  check('选将：12 张卡且 LP 三档 8000×3/10000×6/12000×3',
    v.n === 12 && v.byLp['8000'] === 3 && v.byLp['10000'] === 6 && v.byLp['12000'] === 3,
    `n=${v.n} lp=${JSON.stringify(v.byLp)}`);
  check('选将：每卡都有技能徽章（cc-skills）', v.skillsAll === true);
  check('选将：非基准血量卡带 tier 标记 ×6', v.tierBadges === 6, `tier=${v.tierBadges}`);
  check('选将：技能数分布 1,1,1,2,2,2,2,2,2,3,3,3（低血多技）', v.skillCounts === '1,1,1,2,2,2,2,2,2,3,3,3', v.skillCounts);
  check('选将：觉醒技徽章 ×9（4血3+5血6）', v.awakenBadges === 9, `awaken=${v.awakenBadges}`);

  // hover 选将卡 → cardTip 弹技能说明（mouseover 派发）
  await ev(`(()=>{const c=document.querySelector('#leaderChoices .captain-card');
    c.dispatchEvent(new MouseEvent('mouseover',{bubbles:true,clientX:300,clientY:300})); return 1;})()`);
  await sleep(400);
  r = await ev(`(()=>{const t=document.getElementById('cardTip'); const vis=t&&!t.classList.contains('hidden');
    const txt=vis?t.textContent:'';
    return JSON.stringify({vis, hasSkill:txt.includes('技能·'), hasLp:txt.includes('LP'), hasAwaken:txt.includes('觉醒技')||txt.includes('LP≤'), art:!!(vis&&t.querySelector('.ct-art'))});})()`);
  v = JSON.parse(r || '{}');
  check('选将：悬停弹信息卡（技能说明+LP 档+卡面大图）', v.vis && v.hasSkill && v.hasLp && v.art, r);

  // ===== 进局：船长「?」按钮 + 战斗中技能徽章 =====
  await ev(`(()=>{document.getElementById('btnStart').click(); return 1;})()`);
  const inGame = await waitFor(`(OPTCG_GAME.state()&&OPTCG_GAME.state().turn>=1)===true`, 8000);
  check('进局', inGame === true);
  r = await ev(`JSON.stringify({btn:!!document.querySelector('#myLeaderSlot .card-info-btn'),
    skillDots:document.querySelectorAll('#myLeaderSlot .skill-dots .sdot').length,
    skillDotsAwaken:document.querySelectorAll('#myLeaderSlot .skill-dots .sdot.awaken').length,
    lp:(document.querySelector('#myLP .lp-num')||document.querySelector('.lp-badge .lp-num')||{textContent:'?'}).textContent})`);
  v = JSON.parse(r || '{}');
  check('战斗：船长卡带「?」技能按钮', v.btn === true, r);
  check('战斗：船长卡面技能点渲染（默认路飞 2 技，遮图徽章已退役）', v.skillDots === 2 && v.skillDotsAwaken === 1, `dots=${v.skillDots}/awaken=${v.skillDotsAwaken}`);
  // 点「?」→ tip 弹技能全说明（不触发攻击选择）
  await ev(`(()=>{const b=document.querySelector('#myLeaderSlot .card-info-btn'); if(b)b.click(); return 1;})()`);
  await sleep(400);
  r = await ev(`(()=>{const t=document.getElementById('cardTip'); const vis=t&&!t.classList.contains('hidden');
    return JSON.stringify({vis, txt:vis?t.textContent.slice(0,220):'', sel:document.querySelectorAll('#myLeaderSlot .card.selected').length});})()`);
  v = JSON.parse(r || '{}');
  check('战斗：点「?」弹技能说明卡（含觉醒线且不进入攻击选择）',
    v.vis === true && /技能·/.test(v.txt) && /觉醒/.test(v.txt) && +v.sel === 0, (v.txt || '').slice(0, 60));

  // 对方船长也有「?」与技能点
  r = await ev(`JSON.stringify({foeBtn:!!document.querySelector('#enemyLeaderSlot .card-info-btn'), foeDots:document.querySelectorAll('#enemyLeaderSlot .skill-dots .sdot').length})`);
  v = JSON.parse(r || '{}');
  check('战斗：对方船长同样有「?」按钮与技能点', v.foeBtn === true && v.foeDots >= 1, r);

  ws.close();
}
try { await main(); } finally {
  proc.kill();
  try { rmSync(prof, { recursive: true, force: true }); } catch (e) { /* */ }
}
console.log(fail ? 'LEADERS-PROBE-FAIL' : 'LEADERS-PROBE-PASS');
process.exit(fail ? 1 : 0);
