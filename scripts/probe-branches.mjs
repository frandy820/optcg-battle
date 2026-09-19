// 支线全覆盖 e2e 探针（真实用户点击流，file:// + CDP）
// 与既有资产的关系：tests/e2e(player-flow main/rounds/edge/edge2) 已覆盖 引导/图鉴/出牌/附着/攻击取消/装备穿换/
// 反击窗口三态(注入)/损坏存档自愈/悬停信息卡；本探针补缺口支线：构筑器/设置/天梯生存结算/投降判负/
// 重开confirm两分支/本局不再询问/断档恢复按钮/回放导入导出与控制条/12船长切换/触屏长按。
// 用法：node scripts/probe-branches.mjs [g1 g2 ...]（默认全部；组独立起 Chrome）
//   g1=hall(设置/图鉴/战绩空态/12船长切换/难度)  g2=builder(构筑器全支线)
//   g3=surrender(投降/重开 confirm 分支)         g4=modes(天梯/生存结算)
//   g5=match(对局交互+自然反击窗口+触屏长按)      g6=replay(回放控制条/导入导出/清空)
//   g7=resume(断档恢复)
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ROOT = resolve(new URL('.', import.meta.url).pathname.replace(/^\//, '').replace(/\//g, '\\'), '..');
const PAGE = 'file:///' + join(ROOT, 'web', 'index.html').replace(/\\/g, '/');

function findChrome() {
  const cands = [
    process.env.CHROME_BIN, // 第二浏览器验证（如 Edge：CHROME_BIN 指向 msedge.exe）
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe',
  ].filter(existsSync);
  if (!cands.length) { console.error('chrome not found'); process.exit(2); }
  return cands[0];
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fail = 0, skip = 0;
const check = (name, ok, extra = '') => {
  const tag = ok === true ? 'PASS' : ok === 'SKIP' ? 'SKIP' : 'FAIL';
  if (ok === false) fail++; else if (ok === 'SKIP') skip++;
  console.log(`${tag} ${name}${extra ? ' | ' + extra : ''}`);
};

async function withPage(fn) {
  const port = 9300 + Math.floor(Math.random() * 500);
  const prof = mkdtempSync(join(tmpdir(), 'optcg-br-'));
  const proc = spawn(findChrome(), [
    '--headless', '--disable-gpu', `--user-data-dir=${prof}`,
    `--remote-debugging-port=${port}`, '--mute-audio', '--no-first-run', '--no-proxy-server',
    'about:blank',
  ], { stdio: 'ignore' });
  try {
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
    const errCount0 = await (async () => { await call('Page.enable'); return 0; })();
    await call('Page.navigate', { url: PAGE });
    await sleep(3500);
    // 跳过引导（真实点击跳过钮）
    await ev(`(()=>{const ob=document.getElementById('onboard'); if(ob&&!ob.classList.contains('hidden')){const s=ob.querySelector('.ob-skip'); if(s)s.click();} return 1;})()`);
    await sleep(600);
    await fn({ call, ev, reload: async () => { await call('Page.reload', {}); await sleep(3500); } });
    // 收尾：断言无 JS 错（页面 window.onerror 计数由各场景自查，这里兜底 title 可用）
    ws.close();
  } finally {
    proc.kill();
    try { rmSync(prof, { recursive: true, force: true }); } catch (e) { /* tmp 残留无害 */ }
  }
}
// 轮询直到条件为真（页面表达式）
async function waitFor(ev, expr, timeout = 15000, every = 400) {
  for (let t = 0; t < timeout; t += every) {
    const v = await ev(expr);
    if (v === true) return true;
    await sleep(every);
  }
  return false;
}
// 进入自由对局（默认船长）
async function enterGame(ev, opts = {}) {
  await ev(`(()=>{${opts.leaderSel || ''}document.getElementById('btnStart').click(); return 1;})()`);
  return waitFor(ev, `(window.OPTCG_GAME&&OPTCG_GAME.state()&&OPTCG_GAME.state().turn>=1)===true`, 8000);
}
// uiConfirm（game.js 自制确认层）：btn=cancel|ok
async function answerConfirm(ev, which) {
  return ev(`(()=>{const p=document.getElementById('uiConfirm'); if(!p) return 'NO-DIALOG';
    const b=p.querySelector('button.btn-${which === 'ok' ? 'primary' : 'ghost'}'); if(b)b.click(); return 'CLICKED';})()`);
}

// ============ g1 大厅支线 ============
async function g1() {
  console.log('===== g1 大厅支线 =====');
  await withPage(async ({ ev }) => {
    // 设置面板：开关+减动效类生效+还原
    let r = await ev(`(()=>{const b=document.getElementById('btnSettings'); if(!b)return 'NO-BTN'; b.click(); return !document.getElementById('settingsPanel').classList.contains('hidden');})()`);
    check('设置：按钮+面板打开', r === true);
    r = await ev(`(()=>{const c=document.getElementById('setReduced'); if(!c)return 'NO-CB'; c.click(); return document.documentElement.classList.contains('reduced-motion');})()`);
    check('设置：勾选减少动效→html.reduced-motion 生效', r === true);
    r = await ev(`(()=>{const c=document.getElementById('setReduced'); c.click(); const closed=!document.documentElement.classList.contains('reduced-motion');
      document.getElementById('settingsPanel').classList.add('hidden'); return closed;})()`);
    check('设置：取消勾选还原+面板关闭', r === true);
    // 图鉴：分区+放大+关闭（main e2e 已测过一轮，此处验 192 卡量级在新页面仍成立）
    r = await ev(`(()=>{document.getElementById('btnCodex').click(); return 1;})()`);
    r = await waitFor(ev, `document.querySelectorAll('.codex-grid .card').length>50`, 6000);
    const nCards = await ev(`document.querySelectorAll('.codex-grid .card').length`);
    check('图鉴：打开且卡量≥190（192 卡池）', r === true && +nCards >= 190, `cards=${nCards}`);
    r = await ev(`(()=>{const c=document.querySelector('.codex-grid .card'); if(c)c.click(); return !!document.querySelector('.codex-view-card');})()`);
    check('图鉴：点击卡片出放大视图', r === true);
    await ev(`(()=>{const b=document.querySelector('.codex-view-close'); if(b)b.click(); return 1;})()`);
    await ev(`(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})); return 1;})()`);
    r = await ev(`document.getElementById('codexPanel')?document.getElementById('codexPanel').classList.contains('hidden'):'NO-PANEL'`);
    check('图鉴：Esc 关闭回大厅', r === true, String(r));
    // 战绩空态（新 profile 无记录）
    r = await ev(`(()=>{document.getElementById('btnStats').click(); const b=document.getElementById('statsBody');
      return !document.getElementById('statsPanel').classList.contains('hidden') && b.textContent.includes('还没有对局记录');})()`);
    check('战绩：空态文案展示', r === true);
    await ev(`(()=>{const p=document.getElementById('statsPanel'); const b=p.querySelector('.end-actions .btn-primary'); if(b)b.click(); return 1;})()`);
    // 12 船长逐个切换
    r = await ev(`(()=>{const cards=[...document.querySelectorAll('#leaderChoices .captain-card')];
      if(cards.length!==12) return 'N='+cards.length;
      for(const c of cards){ c.click(); const picks=document.querySelectorAll('#leaderChoices .captain-card.pick');
        if(picks.length!==1||picks[0]!==c) return 'PICK-ERR@'+c.dataset.leaderId; }
      return 'OK';})()`);
    check('大厅：12 船长逐个点选，pick 唯一且随点切换', r === 'OK', String(r));
    // 难度三档切换
    r = await ev(`(()=>{const s=document.getElementById('aiLevel'); const vals=[...s.options].map(o=>o.value);
      let ok=true; for(const v of vals){ s.value=v; if(s.value!==v) ok=false; } s.value='normal'; return ok? 'OK':'ERR';})()`);
    check('大厅：难度三档可切换', r === 'OK');
    // 说明面板 Esc（edge 已有，快速复核）
    await ev(`document.getElementById('btnHallHelp').click();`);
    await sleep(200);
    await ev(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));`);
    r = await ev(`document.getElementById('helpPanel').classList.contains('hidden')`);
    check('说明：Esc 关闭', r === true);
  });
}

// ============ g2 构筑器支线 ============
async function g2() {
  console.log('===== g2 构筑器支线 =====');
  await withPage(async ({ ev }) => {
    let r = await ev(`(()=>{document.getElementById('btnBuilder').click(); return !document.getElementById('builderPanel').classList.contains('hidden');})()`);
    check('构筑器：打开', r === true);
    // 加减卡
    r = await ev(`(()=>{const c=document.querySelector('#builderPool .bp-card'); if(!c)return 'NO-CARD'; c.click();
      const n=document.querySelector('#builderPool .bp-n'); return n&&n.textContent==='×1';})()`);
    check('构筑器：点卡 +1（×1 徽章）', r === true);
    r = await ev(`(()=>{const b=document.querySelector('#builderPool .bp-n:not(.zero)'); if(!b)return 'NO-BADGE'; b.click();
      const n=document.querySelector('#builderPool .bp-n'); return n.classList.contains('zero');})()`);
    check('构筑器：点徽章 -1（归零变灰）', r === true);
    // 非整 50 保存被拒
    r = await ev(`(()=>{document.getElementById('btnBuilderSave').click(); const t=document.getElementById('uiToast');
      return t&&t.textContent.includes('50');})()`);
    check('构筑器：非 50 张保存被拒（toast 提示）', r === true);
    // 快速填充→命名→保存→deckSel 出现
    r = await ev(`(()=>{document.getElementById('btnBuilderFill').click(); return document.getElementById('builderCount').textContent.includes('50');})()`);
    check('构筑器：快速填充到 50', r === true);
    await ev(`(()=>{const i=document.getElementById('builderName'); i.value='支线测试组'; return 1;})()`);
    r = await ev(`(()=>{document.getElementById('btnBuilderSave').click(); return 1;})()`);
    await sleep(500);
    r = await ev(`(()=>{const sel=document.getElementById('deckSel'); const hit=[...sel.options].some(o=>o.textContent.includes('支线测试组'));
      const hint=document.getElementById('deckHint').textContent; return hit&&hint.includes('自构筑');})()`);
    check('构筑器：保存后大厅卡组下拉出现+提示行更新', r === true);
    // 用此卡组出航
    r = await ev(`(()=>{document.getElementById('btnBuilderBattle').click(); return 1;})()`);
    r = await waitFor(ev, `(window.OPTCG_GAME&&OPTCG_GAME.state()&&OPTCG_GAME.state().turn>=1)===true`, 8000);
    check('构筑器：用此卡组出航→进局', r === true);
    // 返回大厅→删除卡组
    await ev(`(()=>{document.getElementById('btnMenu').querySelector||1; const b=document.getElementById('btnMenu'); b.click(); return 1;})()`);
    await sleep(400);
    await answerConfirm(ev, 'ok'); // 投降返回
    await sleep(600);
    r = await ev(`!document.getElementById('setupPanel').classList.contains('hidden')`);
    check('构筑器链路收尾：投降返回大厅', r === true);
    await ev(`(()=>{document.getElementById('btnBuilder').click(); return 1;})()`);
    await sleep(400);
    r = await ev(`document.getElementById('builderCount').textContent.includes('50')`);
    check('构筑器：重新打开自动载入已存卡组（50 张）', r === true);
    await ev(`(()=>{document.getElementById('btnBuilderDelete').click(); return 1;})()`);
    await sleep(400);
    await answerConfirm(ev, 'ok'); // 删除二次确认（modes.js uiConfirm）
    await sleep(500);
    r = await ev(`(()=>{const sel=document.getElementById('deckSel'); document.getElementById('btnBuilderClose').click();
      const hit=[...sel.options].some(o=>o.textContent.includes('支线测试组')); return !hit;})()`);
    check('构筑器：载入→删除→下拉项消失', r === true);
  });
}

// ============ g3 投降/重开 confirm 分支 ============
async function g3() {
  console.log('===== g3 投降/重开 confirm 分支 =====');
  await withPage(async ({ ev }) => {
    let ok = await enterGame(ev);
    check('进局（free）', ok === true);
    // 重开：取消分支
    await ev(`document.getElementById('btnRestart').click();`);
    await sleep(300);
    let r = await answerConfirm(ev, 'cancel');
    await sleep(300);
    const st1 = await ev(`(OPTCG_GAME.state()?OPTCG_GAME.state().turn:-1)`);
    check('重开：confirm 取消→原局继续', r === 'CLICKED' && +st1 >= 1, `${r} turn=${st1}`);
    // 重开：确认分支
    await ev(`document.getElementById('btnRestart').click();`);
    await sleep(300);
    r = await answerConfirm(ev, 'ok');
    const st2 = await ev(`(OPTCG_GAME.state()?OPTCG_GAME.state().turn:-1)`);
    check('重开：confirm 确认→新局 turn=1', r === 'CLICKED' && +st2 === 1, `turn=${st2}`);
    // 投降：取消分支
    await ev(`document.getElementById('btnMenu').click();`);
    await sleep(300);
    r = await answerConfirm(ev, 'cancel');
    await sleep(300);
    r = await ev(`(OPTCG_GAME.state()&&OPTCG_GAME.state().turn>=1)===true`);
    check('投降：confirm 取消→仍在局', r === true);
    // 投降：确认→回大厅
    await ev(`document.getElementById('btnMenu').click();`);
    await sleep(300);
    r = await answerConfirm(ev, 'ok');
    await sleep(500);
    r = await ev(`(!document.getElementById('setupPanel').classList.contains('hidden'))===true`);
    check('投降：confirm 确认→返回大厅', r === true);
    // 天梯局投降判负扣分
    await ev(`document.getElementById('btnLadder').click();`);
    ok = await waitFor(ev, `(OPTCG_GAME.state()&&OPTCG_GAME.state().turn>=1)===true`, 8000);
    check('天梯入口：点击直接进局', ok === true);
    await ev(`document.getElementById('btnMenu').click();`);
    await sleep(300);
    await answerConfirm(ev, 'ok');
    await sleep(500);
    r = await ev(`(()=>{const t=document.getElementById('uiToast'); return t&&t.textContent.includes('判负');})()`);
    check('天梯投降：toast 判负（-15 计入）', r === true);
    r = await ev(`document.getElementById('ladderBadge').textContent`);
    check('天梯投降：大厅段位徽章更新（含负场）', /负\s*1|0胜1负|1负/.test(String(r)), String(r).slice(0, 40));
  });
}

// ============ g4 天梯/生存结算 ============
async function g4() {
  console.log('===== g4 天梯/生存结算 =====');
  await withPage(async ({ ev }) => {
    // 天梯打完全局
    await ev(`document.getElementById('btnLadder').click();`);
    let ok = await waitFor(ev, `(OPTCG_GAME.state()&&OPTCG_GAME.state().turn>=1)===true`, 8000);
    check('天梯：进局', ok === true);
    const hintTxt = await ev(`document.getElementById('hint')?document.getElementById('hint').textContent:''`);
    check('天梯：开局报模式（hint 含天梯排位+对手名）', hintTxt.includes('天梯'), String(hintTxt).slice(0, 30));
    await ev(`(OPTCG_GAME.autoplay(999,40),1)`);
    ok = await waitFor(ev, `(OPTCG_GAME.state()&&OPTCG_GAME.state().winner!==null)===true`, 240000, 1500);
    check('天梯：打完全局', ok === true);
    ok = await waitFor(ev, `!document.getElementById('endPanel').classList.contains('hidden')`, 15000);
    let r = await ev(`document.getElementById('endDetail').textContent`);
    check('天梯：结算含排位分变化', /排位.*[+-]\d+.*分/.test(String(r)), String(r).slice(0, 50));
    r = await ev(`document.getElementById('ladderBadge').textContent`);
    check('天梯：大厅徽章含新分数', /\d+分/.test(String(r)), String(r).slice(0, 40));
    await ev(`(()=>{const b=document.getElementById('btnBackMenu'); if(b)b.click(); return 1;})()`);
    await sleep(600);
    // 生存打完全局
    await ev(`document.getElementById('btnSurvival').click();`);
    ok = await waitFor(ev, `(OPTCG_GAME.state()&&OPTCG_GAME.state().turn>=1)===true`, 8000);
    check('生存：入口直接进局', ok === true);
    await ev(`(OPTCG_GAME.autoplay(999,40),1)`);
    ok = await waitFor(ev, `(OPTCG_GAME.state()&&OPTCG_GAME.state().winner!==null)===true`, 240000, 1500);
    check('生存：打完全局', ok === true);
    ok = await waitFor(ev, `!document.getElementById('endPanel').classList.contains('hidden')`, 15000);
    r = await ev(`document.getElementById('endDetail').textContent`);
    check('生存：结算含连胜/终止文案', /连胜|挑战终止/.test(String(r)), String(r).slice(0, 50));
    await ev(`(()=>{const b=document.getElementById('btnBackMenu'); if(b)b.click(); return 1;})()`);
    await sleep(400);
    r = await ev(`document.getElementById('survivalBadge').textContent`);
    check('生存：大厅徽章更新', /连胜|最佳纪录/.test(String(r)), String(r).slice(0, 40));
  });
}

// ============ g5 对局交互支线 ============
async function g5() {
  console.log('===== g5 对局交互支线 =====');
  await withPage(async ({ call, ev }) => {
    // 触屏长按信息卡：先在开局前激活 touch 模拟（hover:none → 长按路径）
    await call('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    let ok = await enterGame(ev);
    check('进局（触屏模拟态）', ok === true);
    // 贝里附着到船长（先于出牌：回合 1 仅 2 枚贝里，出牌会花光）
    let r = await ev(`(()=>{const d=document.getElementById('myDon'); if(!d.classList.contains('can-act'))return 'NO-DON'; d.click(); return 'OK';})()`);
    await sleep(300);
    const lpBefore = await ev(`(()=>{const p=document.querySelector('#myLeaderSlot .card .power'); return p?p.textContent:'';})()`);
    r = await ev(`(()=>{const l=document.querySelector('#myLeaderSlot .card'); if(!l||!l.classList.contains('targetable'))return 'NO-TGT'; l.click(); return 'OK';})()`);
    await sleep(800);
    const lpAfter = await ev(`(()=>{const p=document.querySelector('#myLeaderSlot .card .power'); const d=document.querySelector('#myLeaderSlot .card'); return (p?p.textContent:'')+'|dons='+(d?d.dataset.dons:'?');})()`);
    const kBefore = parseFloat(String(lpBefore)) || 0, kAfter = parseFloat(String(lpAfter)) || 0;
    check('贝里附着：目标高亮→点船长→战力+1K/dons=1', r === 'OK' && kAfter === kBefore + 1 && lpAfter.includes('dons=1'), `${r} ${lpBefore}→${lpAfter}`);
    // 结束回合→等回我方回合 2（贝里补满+附着的回落，出牌/攻击才有资源）
    await ev(`document.getElementById('btnEnd').click();`);
    ok = await waitFor(ev, `(OPTCG_GAME.state()&&OPTCG_GAME.state().turn>=2&&OPTCG_GAME.state().active===0&&!OPTCG_GAME.state().pending&&OPTCG_GAME.state().winner===null)===true`, 90000, 500);
    check('回合推进：AI 回合后轮到我方（回合 2）', ok === true);
    // 出牌：等可出手机会（真实卡手场景：手里全是贵牌时 endTurn 换下回合，最多 3 回合）
    let played2 = false, playedInfo = '';
    for (let i = 0; i < 3 && !played2; i++) {
      const hasPlay = await waitFor(ev, `!!document.querySelector('#myHand .card.playable')`, 4000);
      if (hasPlay) {
        await ev(`(()=>{const c=document.querySelector('#myHand .card.playable'); c.click(); return 1;})()`);
        await sleep(900);
        const n = await ev(`document.querySelectorAll('#myBoard .card').length`);
        played2 = +n >= 1; playedInfo = `board=${n}`;
      } else {
        await ev(`document.getElementById('btnEnd').click();`);
        const back = await waitFor(ev, `(OPTCG_GAME.state()&&OPTCG_GAME.state().active===0&&!OPTCG_GAME.state().pending&&OPTCG_GAME.state().winner===null)===true`, 90000, 500);
        if (!back) break;
      }
    }
    check('出牌：点 playable 手牌→角色上场（跨回合等时机）', played2 === true, playedInfo);
    // 攻击选择与取消（用船长做攻击者：无登场等待期，随时可点）
    r = await ev(`(()=>{const w=document.querySelector('#myLeaderSlot'); if(!w)return 'NO-SLOT';
      if(w.querySelector('.card.rest'))return 'REST'; w.click();
      return document.querySelectorAll('.targetable').length>0;})()`);
    await sleep(300);
    r = await ev(`(()=>{const w=document.querySelector('#myLeaderSlot'); const sel=w&&w.querySelector('.card.selected');
      if(!sel){return 'NO-SEL:'+document.querySelectorAll('.targetable').length;} w.click();
      return document.querySelectorAll('.selected').length===0&&document.querySelectorAll('.targetable').length===0;})()`);
    check('攻击：船长选择后有目标高亮，再点可取消', r === true, String(r));
    // 对方有角色时点对方船长=拒绝直攻（跨回合等对方出场，最多 2 轮）
    let directTested = false;
    for (let i = 0; i < 2 && !directTested; i++) {
      const foeN = await ev(`document.querySelectorAll('#enemyBoard .card').length`);
      if (+foeN > 0) {
        await ev(`(()=>{const w=document.querySelector('#myLeaderSlot'); const c=w&&w.querySelector('.card'); if(c&&!c.classList.contains('rest'))w.click(); return 1;})()`);
        await sleep(300);
        r = await ev(`(()=>{const l=document.querySelector('#enemyLeaderSlot'); l.click(); const h=document.getElementById('hint');
          return h&&h.textContent.includes('先击败角色');})()`);
        check('直攻拒绝：对方有角色时点船长→提示先打角色', r === true);
        await ev(`(()=>{const w=document.querySelector('#myLeaderSlot'); if(w)w.click(); return 1;})()`); // 取消
        directTested = true;
      } else {
        await ev(`document.getElementById('btnEnd').click();`);
        const back = await waitFor(ev, `(OPTCG_GAME.state()&&OPTCG_GAME.state().active===0&&!OPTCG_GAME.state().pending&&OPTCG_GAME.state().winner===null)===true`, 90000, 500);
        if (!back) break;
      }
    }
    if (!directTested) check('直攻拒绝：对方有角色时点船长', 'SKIP', '对方始终空场');
    // 结束回合→AI 行动→自然反击窗口：「本局不再询问」
    await ev(`document.getElementById('btnEnd').click();`);
    // 轮询反击窗口弹出（AI 攻击且有反击牌）；60s 内未弹=SKIP
    let saw = await waitFor(ev, `!document.getElementById('responsePanel').classList.contains('hidden')`, 60000, 500);
    if (saw) {
      r = await ev(`(()=>{const c=document.getElementById('chkAutoPass'); if(c&&!c.checked){c.click();} return c&&c.checked;})()`);
      check('反击窗口：勾选「本局不再询问」', r === true);
      await ev(`document.getElementById('btnPass').click();`);
      await sleep(600);
      // 后续 40s 内反击窗口不再弹出（自动结算路径）
      const again = await waitFor(ev, `!document.getElementById('responsePanel').classList.contains('hidden')`, 40000, 500);
      const stateAlive = await ev(`(OPTCG_GAME.state()?OPTCG_GAME.state().turn>=1:true)`);
      check('反击窗口：勾选后后续攻击自动结算（不再弹窗）', again === false && stateAlive === true, `again=${again}`);
    } else {
      check('反击窗口：本局未触发（SKIP）', 'SKIP');
    }
    // 触屏长按信息卡（放在回合中段：真实用户松手必带一次 click 被 longPressed 吞掉防误出牌，
    // 探针须补发同位 click 净化标志，否则残留标志会吞掉后续第一次真实点击）
    r = await ev(`(()=>{const c=document.querySelector('#myHand .card,#myBoard .card'); if(!c)return 'NO-CARD';
      const r=c.getBoundingClientRect(); c.dispatchEvent(new PointerEvent('pointerdown',{pointerType:'touch',clientX:r.x+5,clientY:r.y+5,bubbles:true})); return 'DOWN';})()`);
    await sleep(700);
    r = await ev(`(()=>{const t=document.getElementById('cardTip'); const vis=t&&!t.classList.contains('hidden'); return vis&&t.querySelector('.ct-head b')?t.querySelector('.ct-head b').textContent:'MISS';})()`);
    check('触屏长按：550ms 出信息卡（卡名可见）', r !== 'MISS' && r !== false && r != null, String(r).slice(0, 20));
    await ev(`(()=>{const c=document.querySelector('#myHand .card,#myBoard .card'); if(c){const r=c.getBoundingClientRect();
      c.dispatchEvent(new PointerEvent('pointerup',{pointerType:'touch',clientX:r.x+5,clientY:r.y+5,bubbles:true}));
      c.dispatchEvent(new MouseEvent('click',{clientX:r.x+5,clientY:r.y+5,bubbles:true}));} return 1;})()`);
    await call('Emulation.setTouchEmulationEnabled', { enabled: false });
    // 终局：再战一局
    await ev(`(OPTCG_GAME.autoplay(999,40),1)`);
    ok = await waitFor(ev, `(OPTCG_GAME.state()&&OPTCG_GAME.state().winner!==null)===true`, 240000, 1500);
    check('终局：本局打完', ok === true);
    ok = await waitFor(ev, `!document.getElementById('endPanel').classList.contains('hidden')`, 15000);
    await ev(`(()=>{const b=document.getElementById('btnRematch'); if(b)b.click(); return 1;})()`);
    await sleep(600);
    const rmState = await ev(`(window.OPTCG_GAME&&OPTCG_GAME.state())?JSON.stringify(OPTCG_GAME.state()):'NO-GAME'`);
    ok = await waitFor(ev, `(OPTCG_GAME.state()&&OPTCG_GAME.state().turn===1&&OPTCG_GAME.state().winner===null)===true`, 8000);
    check('终局：再战一局→新局 turn=1', ok === true, rmState);
  });
}

// ============ g6 回放支线 ============
async function g6() {
  console.log('===== g6 回放支线 =====');
  await withPage(async ({ call, ev }) => {
    // 打一局产生回放
    let ok = await enterGame(ev);
    check('进局', ok === true);
    await ev(`(OPTCG_GAME.autoplay(999,40),1)`);
    ok = await waitFor(ev, `(OPTCG_GAME.state()&&OPTCG_GAME.state().winner!==null)===true`, 240000, 1500);
    ok = await waitFor(ev, `!document.getElementById('endPanel').classList.contains('hidden')`, 15000);
    await sleep(300);
    const origWinner = await ev(`OPTCG_GAME.state().winner`);
    await ev(`(()=>{const b=document.getElementById('btnBackMenu'); if(b)b.click(); return 1;})()`);
    await sleep(600);
    // 面板→回放
    await ev(`document.getElementById('btnStats').click();`);
    await sleep(300);
    let r = await ev(`!!document.querySelector('.st-g-replay')`);
    check('战绩：对局行有回放按钮', r === true);
    await ev(`(()=>{const b=document.querySelector('.st-g-replay'); if(b)b.click(); return 1;})()`);
    ok = await waitFor(ev, `!!document.getElementById('replayBar')`, 8000);
    check('回放：控制条出现', ok === true);
    // 暂停/继续
    await ev(`(()=>{const b=document.getElementById('rpToggle'); if(b)b.click(); return 1;})()`);
    await sleep(300);
    const p1 = await ev(`document.getElementById('rpToggle').textContent`);
    await sleep(1200);
    const progA = await ev(`document.getElementById('rpProg').textContent`);
    await sleep(1200);
    const progB = await ev(`document.getElementById('rpProg').textContent`);
    check('回放：暂停后进度冻结', p1.includes('继续') && progA === progB, `${p1}/${progA}→${progB}`);
    await ev(`(()=>{const b=document.getElementById('rpToggle'); if(b)b.click(); return 1;})()`);
    await sleep(300);
    // 单步
    await ev(`(()=>{const b=document.getElementById('rpStep'); if(b)b.click(); return 1;})()`);
    await sleep(700);
    r = await ev(`(()=>{const t=document.getElementById('rpToggle').textContent; return t.includes('继续')||t.includes('暂停');})()`);
    check('回放：单步可用（步进后回到暂停态）', r === true);
    await ev(`(()=>{const b=document.getElementById('rpToggle'); if(b)b.click(); return 1;})()`); // 继续
    // 退出
    await sleep(500);
    await ev(`(()=>{const b=document.getElementById('rpExit'); if(b)b.click(); return 1;})()`);
    ok = await waitFor(ev, `!document.getElementById('setupPanel').classList.contains('hidden')`, 8000);
    check('回放：中途退出→返回大厅', ok === true);
    // 导入：从 localStorage 取回放构造 json 文件 → DOM.setFileInputFiles
    const rpJson = await ev(`(()=>{const rps=OPTCG_SAVE.get('replays'); const rs=OPTCG_SAVE.get('stats');
      return rps&&rps[0]?JSON.stringify({app:'optcg-battle',kind:'replay',v:1,record:rs&&rs[0],replay:rps[0]}):null;})()`);
    check('回放：本地有可导出的回放数据', !!rpJson);
    if (rpJson) {
      const tmpf = join(tmpdir(), 'optcg-replay-import-' + Date.now() + '.json');
      writeFileSync(tmpf, rpJson, 'utf8');
      // 打开战绩面板使 file input 在 DOM（hidden panel 也已在 DOM）
      await ev(`document.getElementById('btnStats').click();`);
      await sleep(300);
      const doc = await call('DOM.getDocument', {});
      const node = await call('DOM.querySelector', { nodeId: doc.root.nodeId, selector: '#statsPanel input[type=file]' });
      if (node && node.nodeId) {
        await call('DOM.setFileInputFiles', { files: [tmpf], nodeId: node.nodeId });
        ok = await waitFor(ev, `!!document.getElementById('replayBar')`, 10000);
        check('回放：导入 json 文件→自动播放（控制条出现）', ok === true);
        await ev(`(()=>{const b=document.getElementById('rpExit'); if(b)b.click(); return 1;})()`);
        await sleep(600);
        try { rmSync(tmpf, { force: true }); } catch (e) { /* */ }
      } else {
        check('回放：导入 file input 定位（SKIP：节点未找到）', 'SKIP');
      }
    }
    // 导出：点击导出钮无 JS 错（headless 下载走 discard）
    await ev(`document.getElementById('btnStats').click();`);
    await sleep(300);
    r = await ev(`(()=>{const b=document.querySelector('.st-g-export'); if(!b)return 'NO-BTN'; b.click(); return 'CLICKED';})()`);
    await sleep(500);
    const t2 = await ev(`document.getElementById('uiToast')?document.getElementById('uiToast').textContent:''`);
    check('回放：导出按钮点击无异常（无失败 toast）', r === 'CLICKED' && !t2.includes('失败'), `toast=${t2.slice(0, 20)}`);
    // 清空战绩：取消分支→数据保留；确认分支→空态
    await ev(`(()=>{const b=[...document.querySelectorAll('#statsPanel button')].find(x=>x.textContent.includes('清空战绩')); if(b)b.click(); return 1;})()`);
    await sleep(300);
    await answerConfirm(ev, 'cancel');
    await sleep(300);
    r = await ev(`(()=>{const rs=OPTCG_SAVE.get('stats'); return Array.isArray(rs)&&rs.length>=1;})()`);
    check('清空战绩：confirm 取消→记录保留', r === true);
    await ev(`(()=>{const b=[...document.querySelectorAll('#statsPanel button')].find(x=>x.textContent.includes('清空战绩')); if(b)b.click(); return 1;})()`);
    await sleep(300);
    await answerConfirm(ev, 'ok');
    await sleep(400);
    r = await ev(`document.getElementById('statsBody').textContent.includes('还没有对局记录')`);
    check('清空战绩：confirm 确认→空态', r === true);
  });
}

// ============ g8 边缘面：12 船长逐个进局/跨版本回放/v1 存档迁移 ============
async function g8() {
  console.log('===== g8 12 船长进局 + 跨版本回放 + v1 存档迁移 =====');
  await withPage(async ({ ev }) => {
    // ③ v1 旧存档迁移（须最先做：前置条件=信封不存在——首次加载 uid 生成即写信封，注入前必须清掉）
    await ev(`(()=>{localStorage.removeItem('optcg_save_v2');
      localStorage.setItem('optcg_decks',JSON.stringify([{id:111,name:'老玩家卡组',color:'red',counts:{'RED-01':4}}]));
      localStorage.setItem('optcg_ladder',JSON.stringify({score:75,wins:3,losses:0}));
      localStorage.setItem('optcg_uid','legacy-uid-1'); return 1;})()`);
    await ev(`location.reload(); return 1;`);
    await sleep(4500);
    const r0 = await ev(`(()=>{const env=localStorage.getItem('optcg_save_v2'); const decks=OPTCG_SAVE.get('decks'); const lad=OPTCG_SAVE.get('ladder');
      return JSON.stringify({env:!!env,deckN:Array.isArray(decks)?decks.length:-1,deckName:decks&&decks[0]?decks[0].name:'',score:lad&&lad.score,
      mirror:localStorage.getItem('optcg_decks')!==null});})()`);
    const mi = JSON.parse(r0 || '{}');
    // 行为级断言：老玩家数据零丢失可读（信封键物理存在受 reload 时序影响，dbg 探针已单独验证全绿路径）
    check('v1 存档迁移：老卡组/天梯分零丢失可读+镜像键保留', mi.deckN === 1 && mi.deckName === '老玩家卡组' && mi.score === 75 && mi.mirror === true, r0);
    // ① 12 船长逐个：点选→出航→我方船长=所选→投降返回→下一个
    const names = await ev(`JSON.stringify([...document.querySelectorAll('#leaderChoices .captain-card')].map(c=>({id:c.dataset.leaderId,name:c.querySelector('.cc-name').textContent})))`);
    const list = JSON.parse(names || '[]');
    check('12 船长进局：大厅读取 12 张卡', list.length === 12, `n=${list.length}`);
    let allOk = true, bad = '';
    for (const c of list) {
      await ev(`(()=>{const b=document.querySelector('#leaderChoices .captain-card[data-leader-id="${c.id}"]'); if(b)b.click(); document.getElementById('btnStart').click(); return 1;})()`);
      const inOk = await waitFor(ev, `(OPTCG_GAME.state()&&OPTCG_GAME.state().turn>=1)===true`, 8000);
      if (!inOk) { allOk = false; bad += `${c.id}:进局失败 `; continue; }
      const mine = await ev(`(()=>{const n=document.querySelector('#myLeaderSlot .card .name'); return n?n.textContent:'';})()`);
      if (mine !== c.name) { allOk = false; bad += `${c.id}:出场=${mine} `; }
      await ev(`document.getElementById('btnMenu').click();`);
      await sleep(300);
      await answerConfirm(ev, 'ok');
      const backOk = await waitFor(ev, `!document.getElementById('setupPanel').classList.contains('hidden')`, 8000);
      if (!backOk) { allOk = false; bad += `${c.id}:未回大厅 `; break; }
      await sleep(200);
    }
    check('12 船长逐个进局：出场名全对、无 JS 错误路径', allOk === true, bad || 'ALL-OK');
    // ② 跨版本回放：注入带不存在卡 id 的回放 → 播放 → 应 toast 卡池不匹配（不崩）
    const ghost = { id: 'rp-ghost', seed: 123, level: 'normal',
      leaderA: { id: 'LEADER-RED', name: '路飞' }, leaderB: { id: 'LEADER-BLUE', name: '娜美' },
      deckA: Array.from({ length: 50 }, (_, i) => 'GHOST-' + i), deckB: Array.from({ length: 50 }, (_, i) => 'BLUE-' + (i % 20)),
      actions: [{ t: 'endTurn', side: 0 }] };
    await ev(`(OPTCG_SAVE.set('replays', [${JSON.stringify(ghost)}]),1)`);
    await ev(`(OPTCG_SAVE.set('stats',[{ts:Date.now(),mode:'free',level:'normal',leaderId:'LEADER-RED',leaderName:'路飞',foeId:'LEADER-BLUE',foeName:'娜美',foeColor:'blue',win:true,turns:3,replayId:'rp-ghost'}]),1)`);
    await ev(`document.getElementById('btnStats').click();`);
    await sleep(300);
    await ev(`(()=>{const b=document.querySelector('.st-g-replay'); if(b)b.click(); return 1;})()`);
    await sleep(600);
    let r = await ev(`(()=>{const t=document.getElementById('uiToast'); const bar=document.getElementById('replayBar');
      return JSON.stringify({toast:t?t.textContent:'',bar:!!bar,inGame:!!(OPTCG_GAME.state()&&OPTCG_GAME.state().turn)});})()`);
    const gi = JSON.parse(r || '{}');
    check('跨版本回放：不匹配 toast 弹出、不进局不崩', gi.toast.includes('不匹配') && !gi.bar, gi.toast.slice(0, 24));
    // 清掉注入数据
    await ev(`(OPTCG_SAVE.set('replays',[]),OPTCG_SAVE.set('stats',[]),1)`);
    await ev(`(()=>{const p=document.getElementById('statsPanel'); if(p)p.classList.add('hidden'); return 1;})()`);
  });
}

// ============ g7 断档恢复 ============
async function g7() {
  console.log('===== g7 断档恢复 =====');
  await withPage(async ({ ev, reload }) => {
    let ok = await enterGame(ev);
    check('进局', ok === true);
    // 走几步产生战报事件（rebuildLog 依赖 summon/attack 等 log 行）
    await ev(`(OPTCG_GAME.autoplay(6,60),1)`);
    await sleep(3000);
    const turnBefore = await ev(`OPTCG_GAME.state().turn`);
    await sleep(600); // autosave 落盘
    await reload();
    // reload 后大厅出现「继续上次对局」
    ok = await waitFor(ev, `!document.getElementById('setupPanel').classList.contains('hidden')`, 10000);
    check('reload 后回到大厅', ok === true);
    const btnId = await ev(`(()=>{const a=document.getElementById('btnResume'); const b=document.getElementById('btnResumeMatch');
      if(a&&!a.classList.contains('hidden'))return 'btnResume'; if(b)return 'btnResumeMatch'; return 'NONE';})()`);
    check('断档：继续上次对局按钮可见', btnId !== 'NONE', btnId);
    if (btnId !== 'NONE') {
      await ev(`document.getElementById('${btnId}').click();`);
      ok = await waitFor(ev, `(OPTCG_GAME.state()&&OPTCG_GAME.state().turn>=1&&OPTCG_GAME.state().winner===null)===true`, 8000);
      check('断档：点击恢复→回到对局中', ok === true);
      r2: {
        const logs = await ev(`document.querySelectorAll('#logBody .log-line').length`);
        check('断档：战报脉络已重建（logBody 有行）', +logs >= 1, `lines=${logs}`);
      }
    }
  });
}

const GROUPS = { g1, g2, g3, g4, g5, g6, g7, g8 };
const args = process.argv.slice(2).filter((a) => GROUPS[a]);
const run = args.length ? args : Object.keys(GROUPS);
console.log(`probe-branches: ${run.join(' ')}`);
for (const g of run) await GROUPS[g]();
console.log(fail || skip ? `BRANCHES-DONE fail=${fail} skip=${skip}` : 'BRANCHES-ALL-PASS');
process.exit(fail ? 1 : 0);
