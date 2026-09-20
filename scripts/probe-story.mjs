// G5 故事之旅通关模拟探针：真实页面 + OPTCG_GAME API 逐关真打 1-10 关
// 骨架抄 probe-fuse.mjs（CHROME_BIN + --headless + 独立 user-data-dir + 随机端口 9300+randint）
// 玩家操作 = normal AI 决策代打（OPTCG_GAME.autoplay 的 level 代打，「普通玩家策略」近似）；
// 演出/AI 延时经 window.__OPTCG_SPEED 测试钩子提速（玩家路径恒 1）。
// 断言（规格 G5）：
//   ① 前 3 关胜率 100%（每关 3 局全胜，必赢教学曲线）
//   ② 4-7 关各关 ≤6 次内取胜（可通关性）——「合计胜率 ≥50%」硬指标由 story-sim.mjs
//      400 局/关大样本执行（本探针每关 ≤6 局 stop-at-1 采样，14-16 局小样本 ±25pp 噪声，
//      既会假失败也会假通过，不作胜率判据；胜率表仅输出参考）
//   ③ 第 10 关在卡组成长后 ≤5 次尝试内通关一次
//   ④ 全程无页面 JS 错误、无卡死（单局 240s 真实时间上限）
//   ⑤ 图鉴/收藏：稀有度角标渲染 + 已收集标记数对账 + 未收集筛选张数对账 + 收藏数增长曲线
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
const prof = mkdtempSync(join(tmpdir(), 'optcg-story-'));
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
    for (let i = 0; i < Math.ceil(timeout / (step || 400)); i++) {
      const v = await ev(expr);
      if (v === true) return true;
      await sleep(step || 400);
    }
    return false;
  };

  await call('Page.enable');
  await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await call('Page.navigate', { url: PAGE });
  await sleep(3500);
  await ev(`(()=>{const ob=document.getElementById('onboard'); if(ob&&!ob.classList.contains('hidden')){const s=ob.querySelector('.ob-skip'); if(s)s.click();} return 1;})()`);
  await sleep(400);

  // 错误捕获（页面级 error + unhandledrejection）
  await ev(`(()=>{
    window.__errs = [];
    window.addEventListener('error', e=>window.__errs.push(String(e.message)));
    window.addEventListener('unhandledrejection', e=>window.__errs.push('rejection:'+String(e.reason)));
    return 1;
  })()`);

  // ===== ① 大厅入口断言：第三模式卡 + 副标题冷启动文案 =====
  const hall = await ev(`(()=>{
    const b=document.getElementById('btnStory');
    return { has: !!b, badge: (document.getElementById('storyBadge')||{}).textContent||'', hidden: b? b.classList.contains('hidden'):true };
  })()`);
  check('大厅第三模式卡「故事之旅」存在且可见', hall && hall.has === true && hall.hidden === false);
  check('冷启动副标题文案（东海篇）', hall && /东海篇/.test(hall.badge || ''), JSON.stringify(hall && hall.badge));

  // ===== ② 图鉴冷启动：稀有度角标 + 收藏筛选行 + 初始收藏对账 =====
  const codex0 = await ev(`(()=>{
    OPTCG_GALLERY.open();
    const p=document.getElementById('codexPanel');
    const cards=[...p.querySelectorAll('.codex-grid .card')];
    const sss=[...p.querySelectorAll('.codex-grid .card[data-card-id="GREEN-46"] .rar-badge')];
    const leaderRar=p.querySelectorAll('.codex-grid .card.leader .rar-badge').length;
    return {
      open: !p.classList.contains('hidden'),
      total: cards.length,
      filters: [...p.querySelectorAll('.codex-filter')].map(b=>b.textContent.trim()),
      sssBadge: sss.length===1 && sss[0].textContent==='SSS',
      leaderRar, // 船长卡不加稀有度角标（=0）
      haveMarks: p.querySelectorAll('.codex-mark.have').length,
      missMarks: p.querySelectorAll('.codex-mark.miss').length,
      collected: OPTCG_STORY.collectedCount(),
      rarAll: p.querySelectorAll('.codex-grid .card .rar-badge').length,
    };
  })()`);
  check('图鉴打开 + 收藏筛选行（全部/已收集/未收集）', codex0 && codex0.open === true && codex0.filters.length === 3, JSON.stringify(codex0 && codex0.filters));
  check('稀有度角标渲染（SSS 金标）且船长卡无角标', codex0 && codex0.sssBadge === true && codex0.leaderRar === 0);
  check('图鉴卡总数 = 12 船长 + 257 卡', codex0 && codex0.total === 269, `total=${codex0 && codex0.total}`);
  // 初始收藏 = 初始卡组去重（10 种低费白板 + 4 种 3-4 费 A = 14 种），动态取值防硬编码漂移
  const initCollected = await ev(`new Set(Object.keys(OPTCG_STORY.initialDeck())).size`);
  check('冷启动收藏对账：已收集标记 = collection 数 = 初始卡组去重', codex0 && codex0.haveMarks === codex0.collected && codex0.collected === initCollected,
    `have=${codex0 && codex0.haveMarks} collected=${codex0 && codex0.collected} 初始组去重=${initCollected}`);
  // 未收集筛选对账：257 - collected 张卡 + 12 船长（恒显）
  const miss0 = await ev(`(()=>{
    const p=document.getElementById('codexPanel');
    [...p.querySelectorAll('.codex-filter')].find(b=>b.dataset.filter==='miss').click();
    return { n: p.querySelectorAll('.codex-grid .card').length, miss: p.querySelectorAll('.codex-mark.miss').length };
  })()`);
  const expectMiss = 257 - (codex0.collected) + 12;
  check('未收集筛选张数对账（含恒显船长组）', miss0 && miss0.n === expectMiss && miss0.miss === 257 - codex0.collected,
    `显示 ${miss0 && miss0.n} 张（预期 ${expectMiss}）`);
  await ev(`OPTCG_GALLERY.close(); 1`);

  // ===== ③ 真实 UI 点击流：点模式卡 → 关卡面板 → 点第 1 关进局 =====
  await ev(`document.getElementById('btnStory').click()`);
  await sleep(300);
  const panelInfo = await ev(`(()=>{
    const p=document.getElementById('storyPanel');
    const stages=[...p.querySelectorAll('.story-stage')];
    return { open: !!p && !p.classList.contains('hidden'), n: stages.length,
      locked: stages.filter(s=>s.classList.contains('locked')).length,
      current: (stages.find(s=>s.classList.contains('current'))||{dataset:{}}).dataset.stage };
  })()`);
  check('关卡面板打开：10 关卡片排布（1 可挑战 / 9 未解锁）', panelInfo && panelInfo.open && panelInfo.n === 10 && panelInfo.locked === 9 && String(panelInfo.current) === '1',
    JSON.stringify(panelInfo));
  await ev(`document.querySelector('#storyGrid .story-stage[data-stage="1"]').click()`);
  const inGame1 = await waitFor(`(OPTCG_GAME.state() && OPTCG_GAME.state().turn >= 1) === true`, 8000);
  check('点击第 1 关真实进局', inGame1 === true);
  const badge1 = await ev(`document.getElementById('phaseBadge').textContent`);
  check('phaseBadge 标注「故事 第1关」', String(badge1 || '').indexOf('故事') >= 0 && String(badge1 || '').indexOf('第1关') >= 0, JSON.stringify(badge1));
  const foeInfo = await ev(`JSON.stringify({
    foeName: document.querySelector('#enemyLeaderSlot .name') ? document.querySelector('#enemyLeaderSlot .name').textContent : '',
    lp: OPTCG_GAME.state().foeLP,
  })`);
  const fi = JSON.parse(foeInfo || '{}');
  check('敌方首领=克比（合成名）· LP 5000 覆写生效', fi.foeName.includes('克比') && fi.lp === 5000, foeInfo);

  // ===== ④ 逐关通关模拟（normal AI 代打我方，串行解锁链：赢一次才进下一关）=====
  // 页面内单局驱动：startStage → autoplay(normal) → 轮询 winner → 等 endPanel 弹出（settle 落地信号）再返回
  const playMatch = (stage) => ev(`(async () => {
    OPTCG_STORY.startStage(${stage});
    window.__OPTCG_SPEED = 8;
    OPTCG_GAME.autoplay(999999, 25, 'normal');
    const t0 = Date.now();
    let st = null;
    for (;;) {
      st = OPTCG_GAME.state();
      if (st && st.winner !== null) break;
      if (!st || Date.now() - t0 > 240000) return { err: !st ? 'no-state' : 'timeout' };
      await new Promise(r => setTimeout(r, 120));
    }
    // 终局 700ms 后弹结算面板（modes.settle→OPTCG_STORY.settle 发卡在此链上）：等到它才允许开下一局
    for (let i = 0; i < 60; i++) {
      const ep = document.getElementById('endPanel');
      if (ep && !ep.classList.contains('hidden')) break;
      await new Promise(r => setTimeout(r, 120));
    }
    return { w: st.winner, myLP: st.myLP, foeLP: st.foeLP, turn: st.turn };
  })()`);

  // 关卡挑战：needWins=1；采样局（sampleAtLeast=3）保证每关胜率统计口径；hardCap=单关总尝试上限
  const results = {};   // { stage: { wins, tries, samples } }
  const collectCurve = []; // [stage, collectedCount]
  for (let stage = 1; stage <= 10; stage++) {
    const cap = stage === 10 ? 5 : (stage <= 3 ? 3 : 6); // 前3关采样3局；4-9关3局+补到赢（≤6）；10关≤5
    let wins = 0, tries = 0;
    const lpLog = [];
    while (tries < cap) {
      tries++;
      const r = await playMatch(stage);
      if (!r || r.err || typeof r.w !== 'number') {
        check(`第${stage}关第${tries}局`, false, `对局异常 ${JSON.stringify(r)}`);
        break;
      }
      if (r.w === 0) { wins++; lpLog.push(r.myLP); }
      else lpLog.push(-1);
      // 前 3 关打满 3 局采样；其余关赢 1 次且 ≥3 局即停（第 10 关赢即停——≤5 次尝试断言）
      const minTries = stage <= 3 ? 3 : 3;
      if (wins >= 1 && tries >= minTries) break;
    }
    results[stage] = { wins, tries };
    const cnt = await ev(`OPTCG_STORY.collectedCount()`);
    const cleared = await ev(`OPTCG_STORY.progress().cleared`);
    collectCurve.push([stage, cnt, cleared]);
    if (wins === 0) {
      check(`第${stage}关在 ${cap} 次尝试内通关`, false, '0 胜（进度卡死）');
      break; // 无法解锁下一关，终止链
    }
  }

  // 胜率表输出
  console.log('\n===== 各关胜率表（normal AI 代打我方）=====');
  let total47w = 0, total47n = 0;
  for (const [st, r] of Object.entries(results)) {
    const rate = r.tries ? Math.round(r.wins / r.tries * 100) : 0;
    console.log(`第${String(st).padStart(2)}关: ${r.wins}胜/${r.tries}局 (${rate}%)`);
    if (+st >= 4 && +st <= 7) { total47w += r.wins; total47n += r.tries; }
  }
  console.log('===== 收藏数增长曲线（通关后）=====');
  console.log(collectCurve.map(([s, c, cl]) => `关${s}: 收藏${c} · cleared=${cl}`).join('\n'));

  // ① 前 3 关 100%
  const t13 = [1, 2, 3].map((s) => results[s]).filter(Boolean);
  check('前 3 关胜率 100%（必赢教学曲线）', t13.length === 3 && t13.every((r) => r.wins === r.tries && r.tries >= 3),
    t13.map((r) => `${r.wins}/${r.tries}`).join(' '));
  // ② 4-7 关可通关性：各关 ≤6 次内取胜（48% 胜率下 6 次内至少 1 胜 >99%，判据可靠）；
  //    合计胜率 ≥50% 的统计门禁在 story-sim.mjs（400 局/关），本表仅参考
  const t47 = [4, 5, 6, 7].map((s) => results[s]).filter(Boolean);
  check('4-7 关各关 ≤6 次尝试内取胜（可通关性）', t47.length === 4 && t47.every((r) => r.wins >= 1 && r.tries <= 6),
    `${t47.map((r) => `${r.wins}/${r.tries}`).join(' ')} · 合计参考 ${total47w}/${total47n}（sim 大样本判据）`);
  // ③ 第 10 关 ≤5 次尝试内通关
  check('第 10 关 ≤5 次尝试内通关一次（卡组成长后）', !!results[10] && results[10].wins >= 1 && results[10].tries <= 5,
    results[10] ? `${results[10].wins}胜/${results[10].tries}局` : '未到达');
  // 全 10 关通关
  check('全 10 关通关（cleared=10）', collectCurve.length === 10 && collectCurve[9][2] >= 10);

  // ===== ⑤ 通关后联动对账：进度键 / 卡组成长 50 张 / 图鉴收集标记 / 结算面板奖励 =====
  const after = await ev(`(()=>{
    const P=OPTCG_STORY.progress();
    // 存储经 OPTCG_SAVE v2 信封（extras 通道，键名剥 optcg_ 前缀——与 decks/ladder 同机制）
    const deck=OPTCG_SAVE.get('story_deck')||{};
    let deckN=0; for(const k in deck) deckN+=deck[k];
    return { cleared: P.cleared, collected: OPTCG_STORY.collectedCount(), deckN,
      keys: ['story_progress','story_collection','story_deck'].every(k=>OPTCG_SAVE.get(k)!==null) };
  })()`);
  check('进度三键落盘（optcg_story_* → OPTCG_SAVE v2 extras）', after && after.keys === true);
  check('通关后 cleared=10 · 卡组自动成长恒 50 张', after && after.cleared === 10 && after.deckN === 50,
    `cleared=${after && after.cleared} deck=${after && after.deckN}`);
  check('收藏数较冷启动增长', after && after.collected > 10, `${10} → ${after && after.collected}`);

  const codex1 = await ev(`(()=>{
    OPTCG_GALLERY.open();
    const p=document.getElementById('codexPanel');
    [...p.querySelectorAll('.codex-filter')].find(b=>b.dataset.filter==='all').click(); // 切回全部再对账
    return { have: p.querySelectorAll('.codex-mark.have').length, collected: OPTCG_STORY.collectedCount(),
      on: (p.querySelector('.codex-filter.on')||{}).textContent||'' };
  })()`);
  check('通关后图鉴已收集标记与收藏数对账', codex1 && codex1.have === codex1.collected && codex1.collected === after.collected,
    `marks=${codex1 && codex1.have} collected=${codex1 && codex1.collected}`);
  await ev(`OPTCG_GALLERY.close(); 1`);

  // 结算演出断言：重访第 1 关打一局（重复通关同渲染路径），验证 endPanel 获得卡列表 + 获得新卡横幅
  const settleCheck = await ev(`(async () => {
    OPTCG_STORY.startStage(1);
    window.__OPTCG_SPEED = 8;
    OPTCG_GAME.autoplay(999999, 25, 'normal');
    const t0 = Date.now();
    let hadBanner = false;
    while (Date.now() - t0 < 240000) {
      const st = OPTCG_GAME.state();
      if (document.querySelector('.story-get')) hadBanner = true;
      const ep = document.getElementById('endPanel');
      if (st && st.winner !== null && ep && !ep.classList.contains('hidden')) {
        return { w: st.winner, banner: hadBanner,
          cards: ep.querySelectorAll('.story-reward .card').length,
          text: (document.getElementById('endDetail')||{textContent:''}).textContent.slice(0, 60) };
      }
      if (!st) return { err: 'no-state' };
      await new Promise(r => setTimeout(r, 100));
    }
    return { err: 'timeout' };
  })()`);
  check('胜利结算面板：获得卡列表渲染 + 「获得新卡」横幅', settleCheck && settleCheck.w === 0 && settleCheck.cards >= 1 && settleCheck.banner === true,
    JSON.stringify(settleCheck));

  // ===== ⑥ 无 JS 错误 =====
  const errs = await ev(`JSON.stringify(window.__errs)`);
  check('全程无页面 JS 错误', errs === '[]', errs.slice(0, 200));

  ws.close();
}
try { await main(); } finally {
  proc.kill();
  try { rmSync(prof, { recursive: true, force: true }); } catch (e) { /* */ }
}
console.log(fail ? 'STORY-PROBE-FAIL' : 'STORY-PROBE-PASS');
process.exit(fail ? 1 : 0);
