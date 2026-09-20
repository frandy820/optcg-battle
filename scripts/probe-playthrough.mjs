// 模拟真实用户全流程探针（file:// + CDP，真实点击，禁用 autoplay 打完整局）
// 与既有资产的关系：
//   probe-branches.mjs（g1-g8 支线）/ probe-stats.mjs（autoplay 打完+回放）/ probe-badge / probe-interact
//   本探针补它们的盲区：① 两整局「纯真实点击」通关（红船长 free + 非红船长天梯，全程不用 autoplay）
//   ② 本会话新交互回归：两段式出牌 / 飞剑 380ms 延迟结算 / 图鉴 lazy loading(opacity)
//   ③ 功能遍历清单（大厅/模式/对局内/回放/PWA），其中回放用真点打完的局。
// 用法：node scripts/probe-playthrough.mjs [--quick]
//   --quick：跳过 survival（autoplay 打底项），缩短总时长；两局真点通关仍完整执行。
// 退出码：0=无 FAIL；1=存在 FAIL（SKIP 不计）；2=环境错误。
// 结果明细另写 output/playthrough-results.json 供报告生成对账。
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ROOT = resolve(new URL('.', import.meta.url).pathname.replace(/^\//, '').replace(/\//g, '\\'), '..');
const PAGE = 'file:///' + join(ROOT, 'web', 'index.html').replace(/\\/g, '/');
const OUT_DIR = join(ROOT, 'output');
const QUICK = process.argv.includes('--quick');

function findChrome() {
  const cands = [
    process.env.CHROME_BIN,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe',
  ].filter(existsSync);
  if (!cands.length) { console.error('chrome not found'); process.exit(2); }
  return cands[0];
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fail = 0, skip = 0;
const results = []; // {name, tag, extra, at}
const check = (name, ok, extra = '') => {
  const tag = ok === true ? 'PASS' : ok === 'SKIP' ? 'SKIP' : 'FAIL';
  if (ok === false) fail++; else if (ok === 'SKIP') skip++;
  results.push({ name, tag, extra: String(extra).slice(0, 300), at: new Date().toISOString() });
  console.log(`${tag} ${name}${extra ? ' | ' + extra : ''}`);
};

// ---------- CDP 会话（整轮共用一个浏览器：战绩/天梯跨局累计需同一 profile） ----------
const port = 9300 + Math.floor(Math.random() * 500);
const prof = mkdtempSync(join(tmpdir(), 'optcg-play-'));
const proc = spawn(findChrome(), [
  '--headless', '--disable-gpu', `--user-data-dir=${prof}`,
  `--remote-debugging-port=${port}`,
  '--mute-audio', '--no-first-run', '--no-proxy-server',
  'about:blank',
], { stdio: 'ignore' });

let call, ev, reload;
async function boot() {
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
  ws.addEventListener('message', (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d.result); pending.delete(d.id); } });
  call = (method, params) => new Promise((res) => { const mid = ++id; pending.set(mid, res); ws.send(JSON.stringify({ id: mid, method, params })); });
  ev = async (expression) => {
    const r = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) return { __err: r.exceptionDetails.exception?.description || r.exceptionDetails.text };
    return r.result.value;
  };
  reload = async () => { await call('Page.reload', {}); await sleep(3500); };
  await call('Page.enable');
  // 环境矫正：headless Chrome 默认强制 prefers-reduced-motion:reduce（实测 matchMedia=true），
  // 会使 game.js motionReduced() 为真 → 飞剑/粒子演出被合法跳过 → 误报「飞剑不出现」。
  // 真实桌面用户默认 no-preference，这里仿真还原后再测（属探针环境矫正，非游戏行为修改）。
  await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await call('Page.navigate', { url: PAGE });
  await sleep(3500);
}

// ---------- 页面侧小工具 ----------
const S = () => ev(`(window.OPTCG_GAME&&OPTCG_GAME.state())||null`); // {winner,turn,active,pending}
async function waitFor(expr, timeout = 15000, every = 600) {
  for (let t = 0; t < timeout; t += every) {
    const v = await ev(expr);
    if (v === true) return true;
    await sleep(every);
  }
  return false;
}
// uiConfirm（自制确认层）：which=ok|cancel
async function answerConfirm(which) {
  return ev(`(()=>{const p=document.getElementById('uiConfirm'); if(!p) return 'NO-DIALOG';
    const b=p.querySelector('button.btn-${which === 'ok' ? 'primary' : 'ghost'}'); if(b)b.click(); return 'CLICKED';})()`);
}
const gameLogs = []; // 每局结果记录（报告数据源）
let evErrStreak = 0;
async function st() {
  const v = await S();
  if (v && v.__err) { if (++evErrStreak > 8) throw new Error('state() 连续异常: ' + v.__err); return { err: 1 }; }
  evErrStreak = 0;
  return v || { none: 1 };
}

// 停滞/超时诊断快照（给报告留根因证据：pending/合法动作/hint/战报尾部）
async function freezeDiag() {
  return ev(`(()=>{try{return JSON.stringify({state:(window.OPTCG_GAME&&OPTCG_GAME.state())||null,
    diag:(window.OPTCG_GAME&&OPTCG_GAME._diag())||null,
    phase:document.getElementById('phaseBadge')?document.getElementById('phaseBadge').textContent:'',
    hint:(document.getElementById('hint')||{textContent:''}).textContent,
    respOpen:!document.getElementById('responsePanel').classList.contains('hidden'),
    endOpen:!document.getElementById('endPanel').classList.contains('hidden'),
    logs:[...document.querySelectorAll('#logBody .log-line')].slice(0,3).map(l=>l.textContent)});}catch(e){return 'DIAG-ERR:'+e;}})()`);
}

// ---------- 真实点击打完整局（核心） ----------
// 行为策略（模拟进攻型真实用户）：
//   我方回合 = 出牌（两段式，非装备优先）→ 偶尔贝里附着 1 枚 → 全部可攻击单位逐一攻击 → 结束回合
//   反击窗口 = 优先点第一张反击牌垫战力，再放弃结算；无窗口（无反击牌）由游戏自动结算
async function realClickGame({ label, maxTurns = 60, budgetMs = 12 * 60 * 1000, gearOnce = true, donEvery = 2 }) {
  // 每局开局重申媒体仿真（实测冷启动偶发丢失导致飞剑被跳过）并留档
  await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  const t0 = Date.now();
  const c = { plays: 0, gearPlays: 0, attacks: 0, leaderAttacks: 0, dons: 0, counters: 0, passes: 0, turnsMax: 0, flyN: 0, twoStageEv: null, motionAtStart: null, diag: null };
  c.motionAtStart = await ev(`JSON.stringify({rm:matchMedia('(prefers-reduced-motion: reduce)').matches, cls:document.documentElement.className})`);
  // 飞剑观察器（真实点击攻击时 .fly-sword 演出计数）。
  // 注意必须包 IIFE：裸语句序列带顶层 return 在 CDP Runtime.evaluate 是 SyntaxError，
  // 观察器静默不装 → flyN 恒 0（曾连续三轮误报「飞剑不出现」的真因）。
  const obsOk = await ev(`(()=>{window.__flyN=0; if(window.__flyObs)window.__flyObs.disconnect();
    window.__flyObs=new MutationObserver(muts=>{for(const m of muts)for(const n of m.addedNodes){if(n.classList&&n.classList.contains('fly-sword'))window.__flyN++;}});
    window.__flyObs.observe(document.body,{childList:true}); return window.__flyObs instanceof MutationObserver;})()`);
  c.obsOk = obsOk === true;
  let noProgress = 0;
  while (true) {
    const el = Date.now() - t0;
    if (el > budgetMs) { c.diag = await freezeDiag(); return { label, timeout: true, ms: el, ...c }; }
    const g = await st();
    if (g.err || g.none) { await sleep(700); continue; }
    if (g.winner !== null && g.winner !== undefined) {
      const lp = await ev(`(()=>({my:document.querySelector('#myLife .lp-num')?document.querySelector('#myLife .lp-num').textContent:'',
        foe:document.querySelector('#enemyLife .lp-num')?document.querySelector('#enemyLife .lp-num').textContent:''}))()`);
      c.flyN = await ev(`window.__flyN||0`); // 回填页面侧实时计数（结果 JSON 用）
      return { label, done: true, winner: g.winner, turn: g.turn, ms: el, myLP: lp.my, foeLP: lp.foe, ...c };
    }
    if (g.turn > maxTurns) {
      const lp = await ev(`(()=>({my:document.querySelector('#myLife .lp-num')?document.querySelector('#myLife .lp-num').textContent:'',
        foe:document.querySelector('#enemyLife .lp-num')?document.querySelector('#enemyLife .lp-num').textContent:''}))()`);
      c.diag = await freezeDiag();
      return { label, stalemate: true, turn: g.turn, ms: el, myLP: lp.my, foeLP: lp.foe, ...c };
    }
    if (g.turn > c.turnsMax) c.turnsMax = g.turn;

    // ① 反击窗口（对方攻击我方）
    const panel = await ev(`!document.getElementById('responsePanel').classList.contains('hidden')`);
    if (panel === true) {
      const nOpt = await ev(`document.querySelectorAll('#responseOptions .resp-opt').length`);
      if (+nOpt > 0 && c.counters < 3) {
        await ev(`(()=>{const o=document.querySelector('#responseOptions .resp-opt'); if(o)o.click(); return 1;})()`);
        c.counters++; await sleep(1100); // 打出后面板由 doAction 链刷新或收起
        const still = await ev(`!document.getElementById('responsePanel').classList.contains('hidden')`);
        if (still === true) { await ev(`document.getElementById('btnPass').click();`); c.passes++; await sleep(900); }
      } else {
        await ev(`document.getElementById('btnPass').click();`); c.passes++; await sleep(900);
      }
      noProgress = 0;
      continue;
    }
    if (g.pending) { await sleep(700); continue; }           // 自动结算中的 pending
    if (g.active !== 0) { await sleep(800); noProgress = 0; continue; } // AI 回合演出

    // ② 我方回合：出牌（两段式）
    for (let i = 0; i < 6; i++) {
      const gg = await st();
      if (gg.err || gg.none || gg.winner !== null || gg.pending || gg.active !== 0) break;
      const hit = await ev(`(()=>{const c=[...document.querySelectorAll('#myHand .card.playable')].find(el=>{
        const d=(window.OPTCG&&OPTCG.POOL.cards||[]).find(x=>x.id===el.dataset.cardId); return d&&d.type!=='gear';});
        return c?JSON.stringify({idx:c.dataset.handIdx,name:c.querySelector('.name')?c.querySelector('.name').textContent:''}):'';})()`);
      if (!hit) break;
      const card = JSON.parse(hit);
      const before = await ev(`document.querySelectorAll('#myHand .card').length`);
      await ev(`(()=>{const el=[...document.querySelectorAll('#myHand .card')].find(x=>x.dataset.handIdx==='${card.idx}'); if(el)el.click(); return 1;})()`);
      await sleep(520);
      // 两段式证据：首点后=选中态+提示「再点一次」+手牌数不变
      if (!c.twoStageEv) {
        c.twoStageEv = await ev(`JSON.stringify({n:document.querySelectorAll('#myHand .card').length,
          sel:document.querySelectorAll('#myHand .card.selected').length,
          hint:(document.getElementById('hint')||{textContent:''}).textContent})`);
      }
      await ev(`(()=>{const el=document.querySelector('#myHand .card.selected'); if(el)el.click(); return 1;})()`);
      await sleep(1000);
      const after = await ev(`document.querySelectorAll('#myHand .card').length`);
      if (+after === +before - 1) { c.plays++; } else break; // 打出失败/场面变化即停
    }

    // ③ 装备卡两段式（第二击进目标选择）——每局至多一次
    if (gearOnce) {
      const gi = await ev(`(()=>{const c=[...document.querySelectorAll('#myHand .card.playable')].find(el=>{
        const d=(window.OPTCG&&OPTCG.POOL.cards||[]).find(x=>x.id===el.dataset.cardId); return d&&d.type==='gear';});
        return (c&&document.querySelectorAll('#myBoard .card').length>0)?c.dataset.handIdx:'';})()`);
      if (gi !== '' && gi != null) {
        await ev(`(()=>{const el=[...document.querySelectorAll('#myHand .card')].find(x=>x.dataset.handIdx==='${gi}'); if(el)el.click(); return 1;})()`);
        await sleep(500);
        await ev(`(()=>{const el=document.querySelector('#myHand .card.selected'); if(el)el.click(); return 1;})()`);
        await sleep(600);
        const tgtN = await ev(`document.querySelectorAll('#myBoard .card.targetable').length`);
        if (+tgtN > 0) {
          await ev(`(()=>{const t=document.querySelector('#myBoard .card.targetable'); if(t)t.click(); return 1;})()`);
          await sleep(1000); c.gearPlays++;
        } else {
          await ev(`(()=>{const el=document.querySelector('#myHand .card.selected'); if(el)el.click(); return 1;})()`); // 无装备目标：取消选择态
          await sleep(350);
        }
        gearOnce = false;
      }
    }

    // ④ 贝里附着（每 donEvery 回合 1 枚到船长，防拖节奏）
    if (c.turnsMax % donEvery === 0 && c.turnsMax >= 2) {
      const can = await ev(`document.getElementById('myDon').classList.contains('can-act')`);
      if (can === true) {
        await ev(`document.getElementById('myDon').click();`);
        await sleep(450);
        const tgtOk = await ev(`!!document.querySelector('#myLeaderSlot .card.targetable')`);
        if (tgtOk === true) {
          await ev(`document.getElementById('myLeaderSlot').click();`);
          await sleep(850); c.dons++;
        } else {
          await ev(`document.getElementById('myDon').click();`); // 取消附着选择，防 selMode 泄漏干扰后续攻击
          await sleep(350);
        }
      }
    }

    // ⑤ 攻击：场上可攻击单位 + 船长，逐一选攻→选目标（飞剑 380ms 后结算）
    for (let i = 0; i < 8; i++) {
      const gg = await st();
      if (gg.err || gg.none || gg.winner !== null || gg.pending || gg.active !== 0) break;
      const atk = await ev(`(()=>{const b=document.querySelector('#myBoard .card.playable'); if(b)return 'B'+b.dataset.myIdx;
        const L=document.querySelector('#myLeaderSlot .card'); if(L&&!L.classList.contains('rest'))return 'L'; return '';})()`);
      if (!atk) break;
      if (atk === 'L') await ev(`document.getElementById('myLeaderSlot').click();`);
      else await ev(`(()=>{const b=[...document.querySelectorAll('#myBoard .card')].find(x=>x.dataset.myIdx==='${atk.slice(1)}'); if(b)b.click(); return 1;})()`);
      await sleep(450);
      const tgt = await ev(`(()=>{const e=document.querySelector('#enemyBoard .card.targetable'); if(e)return 'E'+e.dataset.foeIdx;
        return document.querySelector('#enemyLeaderSlot .card.targetable')?'L':'';})()`);
      if (!tgt) { // 无目标：取消选择（重点击攻击者）
        if (atk === 'L') await ev(`document.getElementById('myLeaderSlot').click();`);
        else await ev(`(()=>{const b=[...document.querySelectorAll('#myBoard .card')].find(x=>x.dataset.myIdx==='${atk.slice(1)}'); if(b)b.click(); return 1;})()`);
        await sleep(350);
        break;
      }
      if (tgt === 'L') { await ev(`document.getElementById('enemyLeaderSlot').click();`); c.leaderAttacks++; }
      else await ev(`(()=>{const e=[...document.querySelectorAll('#enemyBoard .card')].find(x=>x.dataset.foeIdx==='${tgt.slice(1)}'); if(e)e.click(); return 1;})()`);
      c.attacks++;
      // 飞剑 380ms 演出 + 结算 + 对方可能反击（自动）→ 等局面回到可行动态
      await waitFor(`(window.OPTCG_GAME&&OPTCG_GAME.state()&&(OPTCG_GAME.state().winner!==null||(OPTCG_GAME.state().active===0&&!OPTCG_GAME.state().pending)||!document.getElementById('responsePanel').classList.contains('hidden')))===true`, 12000, 600);
      await sleep(450);
    }

    // ⑥ 结束回合（前先清残留选择态：点任意手牌即离开攻击/贝里/装备选择模式）
    await ev(`(()=>{if(document.querySelector('.targetable,.card.selected,.atk-sword')){const h=document.querySelector('#myHand .card'); if(h)h.click();} return 1;})()`);
    await sleep(250);
    const before = await st();
    await ev(`document.getElementById('btnEnd').click();`);
    await sleep(1500);
    const after = await st();
    if (!after.err && !after.none && after.turn === (before.turn) && after.active === 0 && !after.pending) {
      if (++noProgress > 3) {
        c.diag = await freezeDiag();
        return { label, stall: true, turn: after.turn, ms: Date.now() - t0, ...c };
      }
    } else noProgress = 0;
  }
}

// 停滞恢复+重试：btnRestart→confirm（startGame 直启会复位 busy），再整局重打；冻结本身单独记 FAIL（产品级发现）
async function playWithRetry(label, opts, retries = 1) {
  let res = await realClickGame({ label, ...opts });
  let freezes = 0;
  while (!res.done && (res.stall || res.timeout) && freezes < retries) {
    freezes++;
    console.log(`WARN ${label} 冻结(${res.stall ? 'stall' : 'timeout'}) turn=${res.turn} 用时${Math.round(res.ms / 1000)}s`);
    console.log(`WARN diag=${String(res.diag).slice(0, 400)}`);
    await ev(`document.getElementById('btnRestart').click();`);
    await sleep(500);
    await answerConfirm('ok');
    const inOk = await waitFor(`(window.OPTCG_GAME&&window.OPTCG_GAME.state()&&window.OPTCG_GAME.state().turn===1&&window.OPTCG_GAME.state().winner===null)===true`, 8000);
    if (!inOk) break;
    res = await realClickGame({ label, ...opts });
  }
  res.freezes = freezes;
  check(`[${label}] 全程无停滞/死锁（结束回合可持续推进）`, freezes === 0,
    freezes === 0 ? '' : `冻结${freezes}次@turn${res.turn} diag=${String(res.diag).slice(0, 260)}`);
  return res;
}

// 局末通用断言（endPanel 延迟弹出 + 战绩/回放落库）
async function assertGameEnd(res, expect) {
  const label = res.label;
  check(`[${label}] 真点通关到终局`, res.done === true,
    res.done ? `winner=${res.winner === 0 ? '我方胜' : '对方胜'} turn=${res.turn} 用时${Math.round(res.ms / 1000)}s 出牌${res.plays} 攻击${res.attacks}(船长直攻${res.leaderAttacks}) 贝里${res.dons} 反击牌${res.counters} 放弃${res.passes} motion=${String(res.motionAtStart).slice(0, 40)}`
      : `${res.stalemate ? '僵局' : res.timeout ? '超时' : '停滞'} turn=${res.turn} myLP=${res.myLP} foeLP=${res.foeLP} 用时${Math.round((res.ms || 0) / 1000)}s`);
  if (res.twoStageEv) {
    try {
      const m = JSON.parse(res.twoStageEv);
      check(`[${label}] 两段式出牌证据（首点=选中+提示再点一次，手牌不变）`,
        m.n > 0 && m.sel === 1 && m.hint.includes('再点一次'), res.twoStageEv.slice(0, 120));
    } catch (e) { check(`[${label}] 两段式证据解析`, false, String(e)); }
  } else {
    check(`[${label}] 两段式出牌证据`, false, '整局无一次出手机会（卡死）');
  }
  check(`[${label}] 飞剑攻击演出出现（fly-sword ≥1）`, (await ev(`window.__flyN || 0`)) >= 1 || res.attacks === 0,
    `flyN=${await ev(`window.__flyN||0`)} attacks=${res.attacks} obs=${res.obsOk} motion=${String(res.motionAtStart).slice(0, 36)}`);
  if (expect && expect.leaderName) {
    const nm = await ev(`document.querySelector('#myLeaderSlot .card .name')?document.querySelector('#myLeaderSlot .card .name').textContent:''`);
    check(`[${label}] 我方船长=${expect.leaderName}`, String(nm).includes(expect.leaderName), String(nm));
  }
  // 终局面板：winner 置位后延迟弹出（banner 演完 ~700ms），等它
  const t0 = Date.now();
  const shown = await waitFor(`!document.getElementById('endPanel').classList.contains('hidden')`, 15000, 600);
  const delay = Date.now() - t0;
  check(`[${label}] 终局结算面板弹出（含延迟）`, shown === true, `waitMs=${delay}`);
  const detail = await ev(`document.getElementById('endDetail').textContent`);
  check(`[${label}] 结算文案含回合数与剩余 LP`, /回合/.test(String(detail)) && /LP/.test(String(detail)), String(detail).slice(0, 80));
  const title = await ev(`document.getElementById('endTitle').textContent`);
  check(`[${label}] 终局标题与胜负一致`, res.done && (res.winner === 0 ? title.includes('胜利') : title.includes('战败')), String(title).slice(0, 20));
  // 战斗日志：整局跑完必有召唤/攻击行（开局 0 行属正常——日志由动作事件驱动）
  const lines = await ev(`document.querySelectorAll('#logBody .log-line').length`);
  check(`[${label}] 战斗日志有内容`, +lines >= 3, `lines=${lines}`);
  return detail;
}

// ---------- 主流程 ----------
async function main() {
  await boot();
  // 页面 JS 错误收集（真实用户视角的兜底健康检查）
  await ev(`window.__jsErrs=[]; addEventListener('error',e=>window.__jsErrs.push(String(e.message||e))); return 1;`);
  // 跳过引导（真实点击跳过钮）
  await ev(`(()=>{const ob=document.getElementById('onboard'); if(ob&&!ob.classList.contains('hidden')){const s=ob.querySelector('.ob-skip'); if(s)s.click();} return 1;})()`);
  await sleep(600);

  // ============ PHASE 1 大厅遍历 ============
  console.log('===== 大厅 =====');
  // 1) 说明面板：含「船长技能」节
  await ev(`document.getElementById('btnHallHelp').click();`);
  await sleep(400);
  let r = await ev(`(()=>{const b=document.getElementById('helpBody'); const open=!document.getElementById('helpPanel').classList.contains('hidden');
    const secs=[...b.querySelectorAll('h4,b')].map(x=>x.textContent); return JSON.stringify({open,hasSkill:secs.some(t=>String(t).includes('船长技能')),n:secs.length});})()`);
  let j = {}; try { j = JSON.parse(r); } catch (e) { j = { parseErr: 1 }; }
  check('大厅-说明面板：打开且含「船长技能」节', j.open === true && j.hasSkill === true, `节标题数=${j.n}`);
  await ev(`document.getElementById('btnHelpClose').click();`);
  await sleep(300);
  // 2) 设置：动效开关/紧凑布局开关
  r = await ev(`(()=>{const b=document.getElementById('btnSettings'); if(!b)return 'NO-BTN'; b.click(); return !document.getElementById('settingsPanel').classList.contains('hidden');})()`);
  check('大厅-设置：面板打开', r === true);
  r = await ev(`(()=>{const c=document.getElementById('setReduced'); if(!c)return 'NO-CB'; if(!c.checked)c.click();
      return document.documentElement.classList.contains('reduced-motion');})()`);
  check('大厅-设置：减少动效开关→html.reduced-motion', r === true);
  r = await ev(`(()=>{const c=document.getElementById('setCompact'); if(!c)return 'NO-CB'; if(!c.checked)c.click();
      return document.documentElement.classList.contains('compact-layout');})()`);
  check('大厅-设置：紧凑布局开关→html.compact-layout', r === true);
  await ev(`(()=>{document.getElementById('setReduced').click(); document.getElementById('setCompact').click();
      document.getElementById('settingsPanel').classList.add('hidden'); return 1;})()`);
  // 3) 图鉴：全量卡渲染 + lazy loading + 放大视图
  // lazy 初始态必须在「打开图鉴的同一个 JS 任务里」采样：跨 evaluate 采样时视口内图片已 onload
  // 把 opacity 提到 1（首测误报「初始已亮=11」即此因）。
  const lazy0 = await ev(`(()=>{document.getElementById('btnCodex').click();
    const im=[...document.querySelectorAll('.codex-grid .card img')];
    return JSON.stringify({n:im.length,
      lazyAttr:im.filter(i=>i.getAttribute('loading')==='lazy').length,
      op0:im.filter(i=>i.style.opacity==='0'||i.style.opacity==='').length});})()`);
  await sleep(500);
  const codexOpen = await waitFor(`document.querySelectorAll('.codex-grid .card').length>50`, 8000);
  const nCards = await ev(`document.querySelectorAll('.codex-grid .card').length`);
  const cntText = await ev(`document.querySelector('.codex-count')?document.querySelector('.codex-count').textContent:''`);
  // 动态基线：图鉴卡数 = 页面渲染数 = 池卡数+船长数（运营期删卡不硬编码；渲染数与计数徽章互证）
  // 徽章口径=只计卡牌不含船长（G1-G5 卡池清理 490→257 后旧硬编码 ≥460 已失效）
  const poolInfo = JSON.parse(await ev(`JSON.stringify({cards: OPTCG.POOL.cards.length, leaders: OPTCG.POOL.leaders.length})`) || '{}');
  check('大厅-图鉴：全量卡渲染（=池卡+船长，徽章互证）',
    codexOpen === true && +nCards === poolInfo.cards + poolInfo.leaders && cntText.includes(`共 ${poolInfo.cards} 张`),
    `cards=${nCards} pool=${poolInfo.cards}+${poolInfo.leaders} ${cntText}`);
  await sleep(1800); // 等视口内图片 decode → onload 把 opacity 从 0 提到 1
  const lazy1 = await ev(`(()=>{const im=[...document.querySelectorAll('.codex-grid .card img')];
    const vis1=im.filter(i=>i.style.opacity==='1'&&i.complete&&i.naturalWidth>0).length;
    const offNotLoaded=im.filter(i=>i.style.opacity!=='1'&&!i.complete).length;
    const broken=im.filter(i=>i.complete&&i.naturalWidth===0).length; return JSON.stringify({n:im.length,vis1,offNotLoaded,broken});})()`);
  try {
    const l0 = JSON.parse(lazy0), l1 = JSON.parse(lazy1);
    check('图鉴-lazy loading：img 全部 loading=lazy 且初始 opacity=0',
      l0.n === +nCards && l0.lazyAttr === l0.n && l0.op0 === l0.n, `n=${l0.n} lazy=${l0.lazyAttr} 初始op0=${l0.op0}`);
    check('图鉴-lazy loading：视口内加载后 opacity→1、视口外未加载、无损坏图',
      l1.vis1 > 0 && l1.broken === 0, `亮=${l1.vis1} 视口外未加载=${l1.offNotLoaded} 损坏=${l1.broken}`);
  } catch (e) { check('图鉴-lazy loading：数据解析', false, String(lazy1).slice(0, 120)); }
  r = await ev(`(()=>{const c=document.querySelector('.codex-grid .card'); if(c)c.click();
      const v=document.querySelector('.codex-view-card'); const img=v?v.querySelector('img'):null;
      return JSON.stringify({view:!!v, info:v?v.querySelector('.ct-head b').textContent:'', imgLoaded:img?(img.complete&&img.naturalWidth>0):null});})()`);
  try { j = JSON.parse(r); check('图鉴-放大视图：卡名+原图加载', j.view === true && !!j.info && j.imgLoaded !== false, JSON.stringify(j)); }
  catch (e) { check('图鉴-放大视图', false, String(r).slice(0, 120)); }
  await ev(`(()=>{const b=document.querySelector('.codex-view-close'); if(b)b.click(); document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})); return 1;})()`);
  await sleep(300);
  // 4) 战绩空态（新 profile）
  r = await ev(`(()=>{document.getElementById('btnStats').click(); const b=document.getElementById('statsBody');
      return !document.getElementById('statsPanel').classList.contains('hidden') && b.textContent.includes('还没有对局记录');})()`);
  check('大厅-战绩：空态文案', r === true);
  await ev(`(()=>{const p=document.getElementById('statsPanel'); const b=p.querySelector('.end-actions .btn-primary'); if(b)b.click(); return 1;})()`);
  await sleep(300);
  // 5) PWA：manifest 链接 + 文件存在；SW 注册 file:// 下按设计跳过
  r = await ev(`(()=>{const l=document.querySelector('link[rel=manifest]'); return JSON.stringify({href:l?l.getAttribute('href'):null, proto:location.protocol, sw:'serviceWorker' in navigator});})()`);
  try {
    j = JSON.parse(r);
    check('PWA：manifest 链接存在', j.href === 'manifest.webmanifest', JSON.stringify(j));
    check('PWA：sw.js/manifest 文件在盘上', existsSync(join(ROOT, 'web', 'sw.js')) && existsSync(join(ROOT, 'web', 'manifest.webmanifest')));
    check('PWA：SW 注册（file:// 下跳过属正常）', j.proto === 'file:' ? 'SKIP' : false, `proto=${j.proto}`);
  } catch (e) { check('PWA：manifest 检查', false, String(r)); }

  // ============ PHASE 2 局 A：红船长（艾斯）真点通关（free，易） ============
  console.log('===== 局 A：红船长真点通关（自由·易） =====');
  await ev(`(()=>{const b=document.querySelector('#leaderChoices .captain-card[data-leader-id="LEADER-RED2"]'); if(b)b.click();
      const lv=document.getElementById('aiLevel'); if(lv)lv.value='easy'; document.getElementById('btnStart').click(); return 1;})()`);
  let ok = await waitFor(`(window.OPTCG_GAME&&OPTCG_GAME.state()&&OPTCG_GAME.state().turn>=1)===true`, 8000);
  check('局A：进局成功', ok === true);
  // 对局中：触屏长按信息卡 + 补发 click 净化（真实用户手势卫生）
  await call('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  const lpTgt = await ev(`(()=>{const e=document.querySelector('#enemyBoard .card')||document.querySelector('#myHand .card'); return e?e.dataset.cardId:'';})()`);
  await ev(`(()=>{const c=document.querySelector('#enemyBoard .card')||document.querySelector('#myHand .card'); if(!c)return 'NO-CARD';
      const r=c.getBoundingClientRect(); c.dispatchEvent(new PointerEvent('pointerdown',{pointerType:'touch',clientX:r.x+5,clientY:r.y+5,bubbles:true})); return 'DOWN';})()`);
  await sleep(750);
  const tip = await ev(`(()=>{const t=document.getElementById('cardTip'); return (t&&!t.classList.contains('hidden')&&t.querySelector('.ct-head b'))?t.querySelector('.ct-head b').textContent:'MISS';})()`);
  check('局A-触屏长按：信息卡出现（卡名可见）', tip !== 'MISS' && !!tip, `卡=${String(tip).slice(0,16)} 目标=${lpTgt}`);
  await ev(`(()=>{const c=document.querySelector('#enemyBoard .card')||document.querySelector('#myHand .card'); if(c){const r=c.getBoundingClientRect();
      c.dispatchEvent(new PointerEvent('pointerup',{pointerType:'touch',clientX:r.x+5,clientY:r.y+5,bubbles:true}));
      c.dispatchEvent(new MouseEvent('click',{clientX:r.x+5,clientY:r.y+5,bubbles:true}));} return 1;})()`);
  await call('Emulation.setTouchEmulationEnabled', { enabled: false });
  // —— 真点打完整局 ——
  const resA = await playWithRetry('A-红船长(艾斯)', { gearOnce: true, donEvery: 2 });
  gameLogs.push(resA);
  const detailA = await assertGameEnd(resA, { leaderName: '艾斯' });
  const statsA = await ev(`(window.OPTCG_SAVE?OPTCG_SAVE.get('stats'):null)`);
  check('局A：战绩落库 1 条（红船长+胜负+回放引用）',
    !!(statsA && statsA.length === 1 && statsA[0].leaderId === 'LEADER-RED2' && typeof statsA[0].win === 'boolean' && !!statsA[0].replayId),
    statsA && statsA[0] ? `${statsA[0].leaderName} vs ${statsA[0].foeName} ${statsA[0].win ? 'win' : 'lose'} turns=${statsA[0].turns}` : 'no-stats');
  const repA = await ev(`(window.OPTCG_SAVE?OPTCG_SAVE.get('replays'):null)`);
  check('局A：回放数据 1 份（seed+双方 50+actions）',
    !!(repA && repA.length === 1 && repA[0].seed && repA[0].deckA.length === 50 && repA[0].deckB.length === 50 && repA[0].actions.length > 10),
    `actions=${repA && repA[0] ? repA[0].actions.length : -1}`);

  // ============ PHASE 3 回放（真点局的回放：播放+步进+退出） ============
  console.log('===== 回放（局 A 真点局） =====');
  await ev(`(()=>{const b=document.getElementById('btnBackMenu'); if(b)b.click(); return 1;})()`);
  await sleep(700);
  await ev(`document.getElementById('btnStats').click();`);
  await sleep(400);
  r = await ev(`!!document.querySelector('.st-g-replay')`);
  check('回放：战绩行有回放按钮（真点局）', r === true);
  await ev(`(()=>{const b=document.querySelector('.st-g-replay'); if(b)b.click(); return 1;})()`);
  ok = await waitFor(`!!document.getElementById('replayBar')`, 8000);
  check('回放：控制条出现', ok === true);
  // 控制条一出现立即暂停（保持 1x），否则 40 步小局在提速前就播完，步进断言空转（首测教训）
  await ev(`(()=>{const b=document.getElementById('rpToggle'); if(b)b.click(); return 1;})()`); // 暂停
  const prog1 = await ev(`document.getElementById('rpProg')?document.getElementById('rpProg').textContent:''`);
  await sleep(1200);
  const prog2 = await ev(`document.getElementById('rpProg')?document.getElementById('rpProg').textContent:''`);
  check('回放：暂停后进度冻结', prog1 === prog2, `${prog1} == ${prog2}`);
  await ev(`(()=>{const b=document.getElementById('rpStep'); if(b)b.click(); return 1;})()`); // 单步
  await sleep(700);
  const prog3 = await ev(`document.getElementById('rpProg')?document.getElementById('rpProg').textContent:''`);
  check('回放：步进推进 1 步', prog3 !== prog2, `${prog2} → ${prog3}`);
  await ev(`(()=>{const b=document.getElementById('rpSpeed'); if(b){b.click();b.click();} return 1;})()`); // 1x→4x
  await ev(`(()=>{const b=document.getElementById('rpToggle'); if(b)b.click(); return 1;})()`); // 继续
  let rpDone = null;
  for (let i = 0; i < 300; i++) {
    await sleep(1000);
    const t = await ev(`document.getElementById('rpProg')?document.getElementById('rpProg').textContent:''`);
    const bar = await ev(`!!document.getElementById('replayBar')`);
    if (t.includes('播完')) { rpDone = t; break; }
    if (!bar) { rpDone = 'BAR-GONE:' + t; break; }
  }
  check('回放：真点局回放播完', rpDone !== null && !String(rpDone).startsWith('BAR-GONE'), String(rpDone));
  const rpWinner = await ev(`(window.OPTCG_GAME&&OPTCG_GAME.state()?OPTCG_GAME.state().winner:null)`);
  check('回放：终局与原局一致（确定性）', rpWinner === resA.winner, `replay=${rpWinner} orig=${resA.winner}`);
  await ev(`(()=>{const b=document.getElementById('rpExit'); if(b)b.click(); return 1;})()`);
  ok = await waitFor(`!document.getElementById('modeSelectPanel').classList.contains('hidden')`, 8000);
  check('回放：退出返回大厅', ok === true);

  // ============ PHASE 4 局 B：非红船长（天梯）真点通关 ============
  console.log('===== 局 B：非红船长真点通关（天梯） =====');
  const NONRED = ['BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'BLACK'];
  const pick = NONRED[Math.floor(Math.random() * NONRED.length)];
  const ladBefore = await ev(`(window.OPTCG_SAVE?OPTCG_SAVE.get('ladder'):null)`);
  await ev(`(()=>{const b=document.querySelector('#leaderChoices .captain-card[data-leader-id="LEADER-${pick}"]'); if(b)b.click(); return 1;})()`);
  await sleep(300);
  await ev(`document.getElementById('btnLadder').click();`);
  ok = await waitFor(`(window.OPTCG_GAME&&OPTCG_GAME.state()&&OPTCG_GAME.state().turn>=1)===true`, 8000);
  check('局B：天梯入口进局', ok === true, `选色=${pick}`);
  const myColor = await ev(`document.querySelector('#myLeaderSlot .card')?document.querySelector('#myLeaderSlot .card').className:''`);
  check('局B：我方船长为非红色系', /blue|green|yellow|purple|black/.test(String(myColor)) && !/red/.test(String(myColor)), String(myColor).slice(0, 40));
  const myNameB = await ev(`document.querySelector('#myLeaderSlot .card .name')?document.querySelector('#myLeaderSlot .card .name').textContent:''`);
  const resB = await playWithRetry(`B-${pick}(${myNameB})`, { gearOnce: true, donEvery: 2 });
  gameLogs.push(resB);
  const detailB = await assertGameEnd(resB, {});
  check('局B：结算文案含排位分变化', /排位.*[+-]\d+.*分/.test(String(detailB)), String(detailB).slice(0, 60));
  const ladAfter = await ev(`(window.OPTCG_SAVE?OPTCG_SAVE.get('ladder'):null)`);
  // 胜 +25/负 -15，且分数下限 0（0 分再负=0 分但负场+1——首测误报即此因）
  const ladOk = !!(ladBefore && ladAfter && (
    (ladAfter.score === ladBefore.score + 25 && ladAfter.wins === ladBefore.wins + 1) ||
    (ladAfter.score === Math.max(0, ladBefore.score - 15) && ladAfter.losses === ladBefore.losses + 1)));
  check('局B：天梯分数/胜负场结算（+25 或 -15，分数下限 0）', ladOk,
    ladOk ? `${ladBefore.score}分→${ladAfter.score}分 胜${ladBefore.wins}→${ladAfter.wins} 负${ladBefore.losses}→${ladAfter.losses}` : JSON.stringify({ ladBefore, ladAfter }));
  await ev(`(()=>{const b=document.getElementById('btnBackMenu'); if(b)b.click(); return 1;})()`);
  await sleep(700);

  // ============ PHASE 5 天梯投降判负 ============
  console.log('===== 投降判负（天梯扣分） =====');
  const lad0 = await ev(`OPTCG_SAVE.get('ladder')`);
  await ev(`document.getElementById('btnLadder').click();`);
  ok = await waitFor(`(window.OPTCG_GAME&&OPTCG_GAME.state()&&OPTCG_GAME.state().turn>=1)===true`, 8000);
  check('投降：天梯进局', ok === true);
  await ev(`document.getElementById('btnMenu').click();`);
  await sleep(400);
  r = await answerConfirm('ok');
  await sleep(600);
  const toastTxt = await ev(`document.getElementById('uiToast')?document.getElementById('uiToast').textContent:''`);
  const lad1 = await ev(`OPTCG_SAVE.get('ladder')`);
  check('投降：天梯判负扣分（-15 且负场+1）', /判负/.test(String(toastTxt)) && lad1.losses === lad0.losses + 1 && lad1.score === Math.max(0, lad0.score - 15),
    `${lad0.score}→${lad1.score} 负${lad0.losses}→${lad1.losses} toast=${String(toastTxt).slice(0, 20)}`);
  r = await ev(`!document.getElementById('modeSelectPanel').classList.contains('hidden')`);
  check('投降：返回港口（大厅）', r === true);

  // ============ PHASE 6 重新开局 / 返回港口（free 局，confirm 两分支） ============
  console.log('===== 重新开局 / 返回港口 =====');
  await ev(`document.getElementById('btnStart').click();`);
  ok = await waitFor(`(window.OPTCG_GAME&&OPTCG_GAME.state()&&OPTCG_GAME.state().turn>=1)===true`, 8000);
  check('重开：进局', ok === true);
  await ev(`document.getElementById('btnEnd').click();`); // 真点走一步再测重开
  await sleep(1500);
  await ev(`document.getElementById('btnRestart').click();`);
  await sleep(400);
  r = await answerConfirm('cancel');
  await sleep(400);
  r = await ev(`(window.OPTCG_GAME&&OPTCG_GAME.state()&&OPTCG_GAME.state().turn>=1&&OPTCG_GAME.state().winner===null)===true`);
  check('重开：取消→原局继续', r === true);
  await ev(`document.getElementById('btnRestart').click();`);
  await sleep(400);
  await answerConfirm('ok');
  ok = await waitFor(`(window.OPTCG_GAME&&OPTCG_GAME.state()&&OPTCG_GAME.state().turn===1&&OPTCG_GAME.state().winner===null)===true`, 8000);
  check('重开：确认→新局 turn=1', ok === true);
  await ev(`document.getElementById('btnMenu').click();`);
  await sleep(400);
  await answerConfirm('ok');
  await sleep(600);
  r = await ev(`!document.getElementById('modeSelectPanel').classList.contains('hidden')`);
  check('返回港口：确认后回大厅', r === true);

  // ============ PHASE 7 生存模式（允许 autoplay 快速打底；重试至多 4 局以覆盖胜/负两条结算路径） ============
  if (!QUICK) {
    console.log('===== 生存模式（autoplay 打底） =====');
    let svWon = false, svTries = 0, svLast = '';
    const sv0 = await ev(`OPTCG_SAVE.get('survival')`);
    while (svTries < 4) {
      svTries++;
      await ev(`document.getElementById('btnSurvival').click();`);
      ok = await waitFor(`(window.OPTCG_GAME&&OPTCG_GAME.state()&&OPTCG_GAME.state().turn>=1)===true`, 8000);
      if (!ok) break;
      await ev(`(OPTCG_GAME.autoplay(999,40),1)`);
      ok = await waitFor(`(window.OPTCG_GAME.state()&&window.OPTCG_GAME.state().winner!==null)===true`, 240000, 1500);
      await waitFor(`!document.getElementById('endPanel').classList.contains('hidden')`, 15000, 600);
      const win = await ev(`OPTCG_GAME.state().winner===0`);
      svLast = await ev(`document.getElementById('endDetail').textContent`);
      await ev(`(()=>{const b=document.getElementById('btnBackMenu'); if(b)b.click(); return 1;})()`);
      await sleep(500);
      if (win === true) { svWon = true; break; } // 胜局已观察到 streak 变化，足够
      // 负局继续重试（0 连胜再负=状态不变属设计；需要一局胜利验证连胜档位变化）
    }
    check('生存：入口直接进局（autoplay 打底）', svTries > 0, `tries=${svTries}`);
    check('生存：结算含连胜/挑战终止', /连胜|挑战终止/.test(String(svLast)), String(svLast).slice(0, 60));
    const sv1 = await ev(`OPTCG_SAVE.get('survival')`);
    const svBadge = await ev(`document.getElementById('survivalBadge').textContent`);
    // 胜→streak+1（档位变化）；负→连胜归零重开（badge 回「最佳纪录」态）。两路至少一路被实证。
    const winPath = svWon && sv1.streak === sv0.streak + 1 && /连胜/.test(String(svBadge));
    const losePath = !svWon && sv1.streak === 0 && /最佳纪录|连胜/.test(String(svBadge));
    check('生存：连胜档位变化（胜）或归零重开（负）', winPath || losePath,
      `tries=${svTries} won=${svWon} streak ${sv0.streak}→${sv1.streak} best ${sv0.best}→${sv1.best} badge=${String(svBadge).slice(0, 30)}`);
  } else {
    check('生存模式（--quick 跳过）', 'SKIP');
  }

  // ============ PHASE 8 断档恢复（打一半刷新页面） ============
  console.log('===== 断档恢复 =====');
  await ev(`document.getElementById('btnStart').click();`);
  ok = await waitFor(`(window.OPTCG_GAME&&OPTCG_GAME.state()&&OPTCG_GAME.state().turn>=1)===true`, 8000);
  check('断档：进局', ok === true);
  await ev(`document.getElementById('btnEnd').click();`); // 真点结束回合→AI 行动→产生对局事件
  await waitFor(`(window.OPTCG_GAME.state()&&OPTCG_GAME.state().active===0&&!window.OPTCG_GAME.state().pending&&window.OPTCG_GAME.state().winner===null)===true`, 90000, 700);
  await sleep(900); // autosave 落盘
  await reload();
  ok = await waitFor(`!document.getElementById('modeSelectPanel').classList.contains('hidden')`, 10000);
  check('断档：刷新后回大厅', ok === true);
  r = await ev(`(()=>{const a=document.getElementById('btnResume'); return a&&!a.classList.contains('hidden')?'VIS':'HIDDEN';})()`);
  check('断档：btnResume 出现', r === 'VIS', r);
  if (r === 'VIS') {
    await ev(`document.getElementById('btnResume').click();`);
    ok = await waitFor(`(window.OPTCG_GAME&&OPTCG_GAME.state()&&OPTCG_GAME.state().turn>=1&&window.OPTCG_GAME.state().winner===null)===true`, 8000);
    check('断档：恢复进局成功', ok === true);
    const lines = await ev(`document.querySelectorAll('#logBody .log-line').length`);
    check('断档：战报脉络重建', +lines >= 1, `lines=${lines}`);
    await ev(`document.getElementById('btnMenu').click();`);
    await sleep(400);
    await answerConfirm('ok');
    await sleep(500);
  }

  // ============ PHASE 9 收尾：战绩有数据态 + 全程无 JS 错 ============
  console.log('===== 收尾 =====');
  await ev(`document.getElementById('btnStats').click();`);
  await sleep(500);
  r = await ev(`(()=>{const b=document.getElementById('statsBody'); const rs=OPTCG_SAVE.get('stats');
    return JSON.stringify({ov:b.querySelectorAll('.st-ov').length, games:b.querySelectorAll('.st-game').length, n:rs.length});})()`);
  try {
    j = JSON.parse(r);
    check('战绩-有数据态：总览+对局列表渲染（≥3 局）', j.ov >= 5 && j.games >= 3 && j.n >= 3, r);
  } catch (e) { check('战绩-有数据态', false, String(r)); }
  const errs = await ev(`window.__jsErrs||[]`);
  check('全程无未捕获 JS 错误', Array.isArray(errs) && errs.length === 0, errs && errs.length ? JSON.stringify(errs).slice(0, 200) : '0 errors');
}

let crashed = null;
try { await main(); } catch (e) { crashed = String(e && e.stack || e); console.error('PROBE-CRASH', crashed); }
finally {
  proc.kill();
  try { rmSync(prof, { recursive: true, force: true }); } catch (e) { /* tmp 残留无害 */ }
}
// 结果落盘（报告数据源）
try {
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(join(OUT_DIR, 'playthrough-results.json'), JSON.stringify({
    finishedAt: new Date().toISOString(), fail, skip, crashed,
    checks: results, games: gameLogs,
  }, null, 2), 'utf8');
} catch (e) { console.error('write results failed', String(e)); }
console.log(crashed ? 'PLAYTHROUGH-CRASH' : (fail ? `PLAYTHROUGH-FAIL fail=${fail} skip=${skip}` : `PLAYTHROUGH-PASS skip=${skip}`));
process.exit(crashed || fail ? 1 : 0);
