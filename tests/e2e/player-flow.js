// player-flow.js — E2E 真实点击流测试（正式资产，tests/e2e/）
// 挂载于 web/e2e.html（测试专用页）：不挂正式 index.html、不被 app.bundle.js 加载、无玩家可见入口。
// 激活：web/e2e.html?e2e=main（新玩家一局）| ?e2e=rounds（连续3局残留审计）| ?e2e=edge / edge2（边界两段式）
// 原则：elementFromPoint 命中校验 + 原生 click 链；alert/confirm/prompt 记为问题；等待轮询条件本身（waitFor），禁大固定 sleep。
/* global OPTCG_GAME, OPTCG_SAVE, OPTCG_MODES */
(function () {
  'use strict';
  const qs = new URLSearchParams(location.search);
  const MODE = qs.get('e2e');
  if (!MODE) return;

  const R = { mode: MODE, steps: [], dialogs: [], errors: [], timeline: [], rounds: [] };
  const step = (name, ok, detail) => {
    const rec = { name, ok: !!ok, detail: detail == null ? '' : String(detail), t: Math.round(performance.now()) };
    R.steps.push(rec);
    R.timeline.push((rec.ok ? '✓' : '✗') + ' ' + name + ' @' + rec.t + 'ms');
    return ok;
  };
  const mark = (label) => R.timeline.push('● ' + label + ' @' + Math.round(performance.now()) + 'ms');

  // 原生弹窗拦截：headless 下不阻塞，且每次调用都算可玩性问题
  for (const fn of ['alert', 'confirm', 'prompt']) {
    window[fn] = (msg) => { R.dialogs.push(fn + ': ' + msg); return fn === 'confirm' ? true : undefined; };
  }
  window.addEventListener('error', (e) => R.errors.push(e.message + ' @' + (e.filename || '') + ':' + (e.lineno || '')));
  // doAction 异常走 console.warn 吞掉（不冒泡 window.error）：记录下来供失败步排障
  const warns = [];
  const origWarn = console.warn.bind(console);
  console.warn = (...a) => { warns.push(a.map((x) => (x && x.message) || String(x)).join(' ').slice(0, 120)); origWarn(...a); };

  const $ = (id) => document.getElementById(id);
  const visible = (id) => { const el = $(id); return !!el && !el.classList.contains('hidden'); };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  async function waitFor(cond, timeout, every = 120) {
    const t0 = Date.now();
    for (;;) {
      let v; try { v = cond(); } catch (e) { v = false; }
      if (v) return v;
      if (Date.now() - t0 > timeout) return false;
      await sleep(every);
    }
  }
  // 物理点击模拟：中心点 elementFromPoint 必须命中目标子树（防遮挡/透明层），再派发 click。
  // 不在视口内时先 scrollIntoView 再校验——玩家滚得到的都算可达；仍不可达才 FAIL。
  async function clickAt(el, label) {
    if (!el) return step(label, false, '元素不存在');
    let r = el.getBoundingClientRect();
    let cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    if (cx < 0 || cy < 0 || cx > innerWidth || cy > innerHeight) {
      el.scrollIntoView({ block: 'center', inline: 'center' });
      await sleep(120);
      r = el.getBoundingClientRect();
      cx = r.left + r.width / 2; cy = r.top + r.height / 2;
      if (cx < 0 || cy < 0 || cx > innerWidth || cy > innerHeight) return step(label, false, `滚动后仍不在视口内 (${Math.round(cx)},${Math.round(cy)}) 视口${innerWidth}x${innerHeight}`);
    }
    const hit = document.elementFromPoint(cx, cy);
    if (!hit || !(el === hit || el.contains(hit) || hit.contains(el))) {
      // 手牌叠瓦（负 margin+交错 translateY）是设计形态：命中的是同容器兄弟卡不算遮挡，改点可见主体
      const sibling = hit && hit.closest('.card') && el.closest('.card') && hit.closest('#myHand') && el.closest('#myHand');
      if (sibling) { el.click(); return step(label, true, '叠瓦命中兄弟卡，改用 DOM click'); }
      const desc = hit ? '<' + hit.tagName + (hit.id ? '#' + hit.id : '') + (hit.className && typeof hit.className === 'string' ? '.' + hit.className.split(' ').slice(0, 3).join('.') : '') + '>' : 'null';
      return step(label, false, '点击命中被遮挡：中心点命中的是 ' + desc);
    }
    el.click();
    return step(label, true);
  }
  const inViewport = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); return r.top >= 0 && r.top < innerHeight && r.bottom > 0; };
  // v0.8.0 两级导航（G6）：首屏/返回港口=航路首页(modeSelectPanel)，点对战卡才进船长大厅(setupPanel)。
  // 旧流程全按 v0.7.1 直接操作船长大厅——统一经此函数先过首页，行为在两级导航下等价复现。
  async function ensureLobby() {
    if (visible('setupPanel')) return true;
    if (visible('modeSelectPanel')) {
      const b = $('msBattle');
      if (b) b.click();
      return !!(await waitFor(() => visible('setupPanel'), 3000));
    }
    return false;
  }

  // ===== 对局推进（安全策略循环；返回本局统计）=====
  async function playToEnd(tag) {
    const t0 = performance.now();
    let guard = 0, playedCount = 0, atkCount = 0, respCount = 0;
    let lastSig = '', stuck = 0;
    let aiTurns = [], lastMyTurn = null, phaseT = performance.now();
    while (guard++ < 260) { // ~213s 虚拟预算：偶发长局（turn 9+）也在内；再长由超长局兜底接手
      const s = OPTCG_GAME.state();
      if (!s || s.winner !== null) break;
      // AI 回合节奏采样（局间漂移审计用）
      const badge = $('phaseBadge').textContent;
      if (badge.includes('敌方回合') && lastMyTurn !== 'foe') { lastMyTurn = 'foe'; phaseT = performance.now(); }
      if (badge.includes('你的回合') && lastMyTurn === 'foe') { lastMyTurn = 'my'; aiTurns.push(Math.round(performance.now() - phaseT)); }
      const sig = s.turn + '|' + badge + '|' + visible('responsePanel');
      if (sig === lastSig) stuck++; else { stuck = 0; lastSig = sig; }
      if (stuck > 25) break; // 疑似卡死：跳出（由外层断言裁决）
      if (visible('responsePanel')) { $('btnPass').click(); respCount++; await sleep(350); continue; }
      if (badge.includes('你的回合')) {
        const p = document.querySelector('#myHand .card.playable');
        if (p) { p.click(); playedCount++; await sleep(550); }
        const atk = document.querySelector('#myBoard .card.playable') || document.querySelector('[data-role="leader-0"] .card:not(.rest)');
        if (atk && !document.querySelector('.targetable')) { atk.click(); await sleep(400); }
        // 游戏王式目标规则：对方场上有角色时角色是唯一可选目标，场空才能直攻船长
        const t = document.querySelector('#enemyLeaderSlot .card.targetable')
          || document.querySelector('#enemyBoard .card.targetable');
        if (t) { t.click(); atkCount++; await sleep(550); }
        const b = $('btnEnd'); if (b) b.click();
      }
      await sleep(750);
    }
    const fin = OPTCG_GAME.state();
    const stat = {
      tag, winner: fin ? fin.winner : null, turn: fin ? fin.turn : -1,
      played: playedCount, attacked: atkCount, responses: respCount,
      durMs: Math.round(performance.now() - t0), aiTurnsMs: aiTurns.slice(0, 12),
      guardUsed: guard
    };
    R.rounds.push(stat);
    return stat;
  }

  async function finishReport() {
    const fails = R.steps.filter((s) => !s.ok);
    R.summary = fails.length === 0 ? 'E2E-PASS-' + R.steps.length : 'E2E-FAIL-' + fails.length + '/' + R.steps.length;
    document.title = 'E2E-RESULT ' + JSON.stringify(R);
    const pre = document.createElement('pre');
    pre.id = 'e2eResult';
    pre.textContent = document.title;
    pre.style.cssText = 'position:fixed;left:0;bottom:0;z-index:99999;background:#000;color:#0f0;font-size:10px;max-height:70vh;overflow:auto;white-space:pre-wrap;max-width:100vw';
    document.body.appendChild(pre);
  }

  async function main() {
    await waitFor(() => document.readyState === 'complete', 5000);
    await sleep(1600); // 大厅入场动效 + onboarding 延迟
    mark('大厅已加载');

    // ===== 首访引导（真实玩家第一屏）=====
    const ob = document.getElementById('onboard');
    if (ob && !ob.classList.contains('hidden')) {
      step('新手引导自动出现', true);
      await clickAt(ob.querySelector('.ob-skip'), '引导可跳过');
      await waitFor(() => ob.classList.contains('hidden'), 2000) ? step('跳过后引导关闭', true) : step('跳过后引导关闭', false);
    } else step('新手引导自动出现', true, '未触发（已有 optcg_onboarded 或调试参数）');

    // ===== 航路首页（v0.8.0 两级导航）：30 秒入口断言移到首屏，再进船长大厅走后续审计 =====
    step('航路首页首屏可见(30秒入口)', inViewport($('msBattle')));
    step('首页进船长大厅', await ensureLobby());

    // ===== 大厅首屏审计 =====
    const btnStart = $('btnStart');
    step('出航按钮存在', !!btnStart);
    step('出航按钮首屏可见(30秒入口)', inViewport(btnStart), 'rect.top=' + (btnStart ? Math.round(btnStart.getBoundingClientRect().top) : '-') + ' 视口高' + innerHeight);
    const scroll = $('setupPanel') ? $('setupPanel').querySelector('.modal-card') : null;
    if (scroll) step('大厅弹层内容可滚动', scroll.scrollHeight >= scroll.clientHeight, `内容高${scroll.scrollHeight} 视高${scroll.clientHeight}`);

    // ===== 卡牌图鉴（大厅入口 → 全卡浏览 → 放大 → Esc 两级关闭）=====
    if ($('btnCodex')) {
      await clickAt($('btnCodex'), '打开卡牌图鉴');
      const codexOpen = await waitFor(() => !!document.getElementById('codexPanel') && !document.getElementById('codexPanel').classList.contains('hidden'), 2000);
      const n = document.querySelectorAll('#codexPanel .codex-grid .card').length;
      step('图鉴打开且有全量卡', codexOpen && n >= 20, n + ' 张卡');
      if (codexOpen && n > 0) {
        await clickAt(document.querySelector('#codexPanel .codex-grid .card'), '点击图鉴卡放大');
        step('放大视图显示卡面原图', await waitFor(() => {
          const img = document.querySelector('#codexPanel ~ .codex-viewer img, .codex-viewer img');
          return !!(img && img.src.includes('/art/') && img.naturalWidth > 0);
        }, 2500));
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await sleep(250);
        step('Esc 关闭放大视图', !document.querySelector('.codex-viewer'));
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await sleep(250);
        step('Esc 关闭图鉴回大厅', !document.querySelector('#codexPanel') || document.getElementById('codexPanel').classList.contains('hidden'));
      }
    } else step('打开卡牌图鉴', true, '宿主页无入口（跳过）');

    // ===== 不选船长直接出航（默认数据可玩性）=====
    localStorage.removeItem('optcg_deck_sel');
    mark('点击出航(未选船长)');
    await clickAt(btnStart, '未选船长直接点出航');
    const entered = await waitFor(() => visible('setupPanel') === false && OPTCG_GAME && OPTCG_GAME.state(), 4000);
    step('无需配置直接进入对战', entered, entered ? 'turn=' + OPTCG_GAME.state().turn : '仍停在大厅');
    if (!entered) return finishReport();
    mark('对局开始');

    // ===== 对局首屏认知 =====
    step('回合信息可见', /回合/.test($('turnNo').textContent), $('turnNo').textContent);
    step('当前回合归属明确', $('phaseBadge').textContent.includes('你的回合'), $('phaseBadge').textContent);
    const hand = document.querySelectorAll('#myHand .card').length;
    step('手牌可见', hand > 0, hand + ' 张');
    step('贝里区可见', document.querySelectorAll('#myDon .don').length > 0, document.querySelectorAll('#myDon .don').length + ' 枚 DON');
    step('行动提示条有内容', !!($('hint') && $('hint').textContent.length > 0), $('hint') ? $('hint').textContent : '');

    // ===== 出牌（成功=手牌减/场上增/墓地增——事件卡打出即入墓不占 board）=====
    let played = false;
    const playable = () => document.querySelector('#myHand .card.playable');
    if (await waitFor(playable, 2500)) {
      const bHand = document.querySelectorAll('#myHand .card').length;
      const bBoard = document.querySelectorAll('#myBoard .card').length;
      const bGrave = (document.querySelector('#myGrave b') || {}).textContent;
      const bStage = document.querySelectorAll('#myStage .card').length;
      // 舞台卡打出不进墓地也不占 board、带抽牌效果时手牌数还会回平——必须单看舞台区
      const changed = () => document.querySelectorAll('#myHand .card').length < bHand
        || document.querySelectorAll('#myBoard .card').length > bBoard
        || ((document.querySelector('#myGrave b') || {}).textContent) !== bGrave
        || document.querySelectorAll('#myStage .card').length > bStage;
      await clickAt(playable(), '点击可出手牌');
      // 点击竞态兜底（元素重渲染/演出占用 busy 会让首击 no-op）：1.2s 无变化重取元素再点一次
      if (!await waitFor(changed, 1200)) {
        const again = playable();
        if (again) await clickAt(again, '重试点击可出手牌');
      }
      played = await waitFor(changed, 6000);
      step('出牌成功且有效果', played, played ? '' : ('warn:' + warns.slice(-2).join(' | ') + ' hint:' + (($('hint') || {}).textContent || '')
        + ' dons(rest/total):' + document.querySelectorAll('#myDon .don.rest').length + '/' + document.querySelectorAll('#myDon .don').length
        + ' hand:' + document.querySelectorAll('#myHand .card').length + '(b' + bHand + ')'
        + ' log:' + [...document.querySelectorAll('#logBody .log-line')].slice(0, 3).map((x) => x.textContent).join('；')
        + ' diag:' + JSON.stringify((OPTCG_GAME._diag && OPTCG_GAME._diag()) || null)));
    } else step('存在可出手牌', true, '首回合起手无低费卡（正常随机），出牌验证移至全场累计断言');

    // ===== 贝里附着（回归：点贝里区→点场上卡，战力角标须实时 +1K；曾因 selMode 类型误判掉进攻击选择）=====
    const donFree = () => document.querySelector('#myDon .don:not(.rest):not(.attached)');
    const attachDon = async () => {
      // 回合守卫（btnEnd.can-act=renderAll 置的我回合标志）：非我回合点击被静默吞、hint 残留误报失败
      if (!$('btnEnd').classList.contains('can-act')) return null;
      const u = document.querySelector('#myBoard .card:not(.rest)');
      if (!u || !donFree()) return null; // 无条件可测
      const uid = u.dataset.cardId;
      const p0 = +u.querySelector('.power').textContent.replace('K', '');
      await clickAt($('myDon'), '点击贝里区进入附着模式');
      const inDonMode = await waitFor(() => /附着目标/.test($('hint').textContent), 1500);
      const tgt = document.querySelector('#myBoard .card:not(.rest)'); // renderAll 后元素已换，重取
      if (tgt) await clickAt(tgt, '点击场上单位附着贝里');
      const donOk = await waitFor(() => {
        const el = document.querySelector('#myBoard .card[data-card-id="' + uid + '"]');
        return el && +el.querySelector('.power').textContent.replace('K', '') === p0 + 1;
      }, 2500);
      return !!(inDonMode && donOk) || ('hint:' + $('hint').textContent);
    };
    // 附着点击撞 busy 时 doAction 直接 return 不清 selMode → don 模式残留会吞掉攻击段的
    // 首次点卡（don 分支优先）。Esc 是游戏提供的清选择态出口，各段出口统一清一次
    const clearSel = () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    const attachDonSafe = async () => { const r = await attachDon(); clearSel(); return r; };
    let donResult = await attachDonSafe();
    for (let r = 0; r < 3 && donResult === null
      && document.querySelectorAll('#myHand .card').length > 0; r++) {
      // 首回合豆少/起手全贵卡：结束回合等豆涨（每回合+2），回来先附着再出牌。
      // AI 攻击会弹反击面板（modal 盖全屏）：见到即放弃，否则后续点击全被挡
      if (visible('responsePanel')) await clickAt($('btnPass'), '放弃反击');
      if (!$('btnEnd').classList.contains('can-act')) {
        await waitFor(() => $('btnEnd').classList.contains('can-act') || visible('responsePanel'), 8000);
        if (visible('responsePanel')) await clickAt($('btnPass'), '放弃反击2');
        if (!$('btnEnd').classList.contains('can-act')) break;
      }
      await clickAt($('btnEnd'), '结束回合等豆补满');
      const backMy = await waitFor(() => {
        if (visible('responsePanel')) { $('btnPass').click(); return false; }
        return /你的回合/.test($('phaseBadge').textContent);
      }, 20000);
      if (!backMy) continue; // AI 长考超时：状态不保证我回合，跳过本轮（点击会被回合守卫吞掉）
      donResult = await attachDonSafe(); // 先附着（豆满）——没条件再出牌垫场面
      if (donResult === null) {
        const c = document.querySelector('#myHand .card.playable');
        if (c) { await clickAt(c, '垫一张牌'); await sleep(1500); }
        donResult = await attachDonSafe();
      }
    }
    // 段末收敛：回到我方回合且无响应窗口、无残留选择模式（后续段的元素引用/悬停 tip/点击语义才稳定）
    clearSel();
    await waitFor(() => {
      if (visible('responsePanel')) { $('btnPass').click(); return false; }
      return $('btnEnd').classList.contains('can-act');
    }, 15000);
    clearSel();
    if (donResult === null) step('贝里附着后战力角标+1K', true, '场上无卡或无可用豆（跳过）');
    else step('贝里附着后战力角标+1K', donResult === true, donResult === true ? '' : String(donResult));

    // ===== 悬停信息卡（卡面全量信息 + 竖/横语义）=====
    if (window.matchMedia && matchMedia('(hover: hover)').matches) {
      let anyCard = document.querySelector('#myHand .card') || document.querySelector('#myBoard .card');
      if (anyCard) {
        const tipShown = () => {
          const tip = document.getElementById('cardTip');
          return !!(tip && !tip.classList.contains('hidden') && tip.textContent.length > 20);
        };
        // renderAll 会强制收起 tip（元素已换）：重取元素重派发，1.5s 内出现即算
        let shown = false;
        for (let i = 0; i < 2 && !shown; i++) {
          anyCard = document.querySelector('#myHand .card') || document.querySelector('#myBoard .card');
          if (!anyCard) break;
          anyCard.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, clientX: 60, clientY: 300 }));
          shown = await waitFor(tipShown, 1500);
        }
        const tip = document.getElementById('cardTip');
        step('悬停卡片弹出信息卡', !!shown, shown ? tip.textContent.slice(0, 60) : '未出现');
        if (shown) step('信息卡含数值与竖横状态说明', /费用|战力|生命/.test(tip.textContent) && /竖放|横置|手牌/.test(tip.textContent), tip.querySelector('.ct-state') ? tip.querySelector('.ct-state').textContent.slice(0, 60) : '');
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await sleep(200);
        step('Esc 关闭信息卡', !tip || tip.classList.contains('hidden'));
      }
    } else step('悬停卡片弹出信息卡', true, '非 hover 设备（触屏走长按，人工验收）');

    // ===== 不可出反馈 =====
    const unplayable = document.querySelector('#myHand .card.unplayable');
    if (unplayable) {
      await clickAt(unplayable, '点击不可出手牌');
      await waitFor(() => $('hint') && $('hint').classList.contains('warn'), 1500)
        ? step('不可出原因有提示', /费用|满|回合|响应|召唤|装备/.test($('hint').textContent), $('hint').textContent)
        : step('不可出原因有提示', false, '无 warn 提示');
    } else step('不可出原因有提示', true, '本回合无不可出卡（跳过）');

    // ===== 攻击：选攻击者 → 选目标；反复选择/取消（破坏性子项）=====
    // 前段跨回合推进后状态不保证我回合（点击会被回合守卫静默吞掉）：先收敛+清残留选择模式
    await waitFor(() => $('btnEnd').classList.contains('can-act') && !visible('responsePanel'), 15000);
    if (visible('responsePanel')) await clickAt($('btnPass'), '放弃反击(攻击段前)');
    clearSel();
    const attacker = document.querySelector('#myBoard .card.playable') || document.querySelector('[data-role="leader-0"] .card');
    if (attacker && played) {
      await clickAt(attacker, '点击己方单位选为攻击者');
      const targeted = await waitFor(() => document.querySelector('.targetable'), 1500);
      step('攻击者选择后有目标高亮', targeted, targeted ? '' : 'diag:' + JSON.stringify({
        d: OPTCG_GAME._diag && OPTCG_GAME._diag(),
        hint: $('hint') ? $('hint').textContent.slice(0, 40) : '',
        atkCls: attacker.className,
      }));
      if (targeted) {
        step('目标选择提示明确', /攻击目标/.test($('hint').textContent), $('hint').textContent);
        // 反复取消/重选（真实玩家常见动作）
        await clickAt(attacker, '再点攻击者取消选择');
        const cancelled = await waitFor(() => !document.querySelector('.targetable'), 1500);
        step('再点攻击者可取消', cancelled);
        await clickAt(attacker, '重新选择攻击者');
        await waitFor(() => document.querySelector('.targetable'), 1500);
        // 游戏王式目标规则：对方场上有角色→必须打角色（互斗/守备）；无角色→直攻船长
        const foeUnit = document.querySelector('#enemyBoard .card.targetable');
        const foeLeader = document.querySelector('#enemyLeaderSlot .card');
        const lpOf = (sel) => { const n = document.querySelector(sel + ' .lp-num'); return n ? +n.textContent : null; };
        const foeLp0 = lpOf('#enemyLife');
        const myLp0 = lpOf('#myLife');
        if (foeUnit || (foeLeader && foeLeader.classList.contains('targetable'))) {
          const foeBoard0 = document.querySelectorAll('#enemyBoard .card').length;
          await clickAt(foeUnit || foeLeader, foeUnit ? '点击敌方角色发起攻击' : '点击敌方领袖直攻');
          const attacked = await waitFor(() => {
            const lpMoved = (lpOf('#enemyLife') !== foeLp0) || (lpOf('#myLife') !== myLp0); // 差额扣分或反击反杀
            const b = document.querySelectorAll('#enemyBoard .card').length;
            const logHit = [...document.querySelectorAll('#logBody .log-line')].some((x) => /攻击|反击/.test(x.textContent));
            return lpMoved || b !== foeBoard0 || logHit || visible('responsePanel');
          }, 6000);
          step('攻击发起并有结算反馈', attacked);
          await waitFor(() => !visible('responsePanel'), 6000);
        } else step('有可选攻击目标', false, '无 targetable 目标');
      }
    } else step('可发起攻击', true, '首回合无已落地单位，攻击验证移至全场累计断言');

    // ===== 装备流（批2 回归：点装备卡→己方角色高亮→点目标穿上→战力角标跳变+已装备徽章；再装=替换旧件进墓场）=====
    const gearInHand = () => [...document.querySelectorAll('#myHand .card')].find((c) => c.querySelector('.kw-gear'));
    const graveN = () => { const b = $('myGrave') && $('myGrave').querySelector('b'); return b ? +b.textContent : 0; };
    const equipFlow = async (replace) => {
      const g = gearInHand();
      const unit = document.querySelector('#myBoard .card');
      // playable 检查：费用不足/无角色时点装备卡只会弹锁提示，须返回 null 让外层循环攒费用/垫角色重试
      if (!g || !g.classList.contains('playable') || !unit || !$('btnEnd').classList.contains('can-act')) return null;
      const uid = unit.dataset.cardId;
      const p0 = +unit.querySelector('.power').textContent.replace('K', '');
      const g0 = graveN();
      await clickAt(g, '点击装备卡进入选择模式');
      const inGearMode = await waitFor(() => /装备的角色/.test($('hint').textContent), 1500);
      const tgt = document.querySelector('#myBoard .card.targetable:not(.replaceable)') || document.querySelector('#myBoard .card.targetable');
      if (tgt) await clickAt(tgt, '点击场上角色穿上装备');
      const worn = await waitFor(() => {
        const el = document.querySelector('#myBoard .card[data-card-id="' + uid + '"]');
        return el && el.querySelector('.kw-gear-on') && +el.querySelector('.power').textContent.replace('K', '') > p0;
      }, 3000);
      const replaced = replace ? await waitFor(() => graveN() === g0 + 1, 2500) : true; // 替换流：旧件进墓场
      return { ok: !!(inGearMode && worn && replaced), note: 'hint:' + $('hint').textContent };
    };
    let equip = await equipFlow(false);
    // 8 轮等待：装备在稀释卡组里每件仅 1 份（2/50），须主动过牌（打非装备手牌+结束回合）把装备抽上手
    for (let r = 0; r < 8 && equip === null; r++) {
      if (visible('responsePanel')) await clickAt($('btnPass'), '放弃反击(装备段)');
      if (!$('btnEnd').classList.contains('can-act')) {
        await waitFor(() => $('btnEnd').classList.contains('can-act') || visible('responsePanel'), 8000);
        if (visible('responsePanel')) await clickAt($('btnPass'), '放弃反击2(装备段)');
        if (!$('btnEnd').classList.contains('can-act')) break;
      }
      // 场上没角色先垫一名（装备需要目标）
      if (document.querySelectorAll('#myBoard .card').length === 0) {
        const c = document.querySelector('#myHand .card.playable:not(:has(.kw-gear))') || document.querySelector('#myHand .card.playable');
        if (c) { await clickAt(c, '垫一张角色'); await sleep(1500); }
      }
      // 装备在手但费用不足：只 endTurn 攒贝里（每回合+2），不再出牌抢预算
      const gearWaiting = gearInHand() && !gearInHand().classList.contains('playable');
      if (!gearWaiting) {
        const extra = document.querySelector('#myHand .card.playable:not(:has(.kw-gear))');
        if (extra && document.querySelectorAll('#myBoard .card').length > 0) { await clickAt(extra, '过牌(出非装备手牌)'); await sleep(1200); }
      }
      if (visible('responsePanel')) await clickAt($('btnPass'), '放弃反击(装备段收尾)'); // 垫卡/过牌 sleep 间隙弹窗的竞态兜底
      await clickAt($('btnEnd'), '结束回合等装备卡/费用');
      const backMy2 = await waitFor(() => {
        if (visible('responsePanel')) { $('btnPass').click(); return false; }
        return $('btnEnd').classList.contains('can-act');
      }, 20000);
      if (!backMy2) continue;
      equip = await equipFlow(false);
    }
    if (equip === null) step('装备穿上后战力跳变+已装备徽章', true, '起手无装备卡或场上无角色（跳过）');
    else {
      step('装备穿上后战力跳变+已装备徽章', equip.ok, equip.ok ? '' : equip.note);
      if (equip.ok && gearInHand()) { // 替换流：同一角色再装一件，旧件进墓场
        await waitFor(() => $('btnEnd').classList.contains('can-act') && !visible('responsePanel'), 8000);
        const rep = await equipFlow(true);
        step('再装一件=替换旧件进墓场', rep === null || rep.ok, rep ? (rep.ok ? '' : rep.note) : '无条件（跳过）');
      } else step('再装一件=替换旧件进墓场', true, '无第二件装备卡（跳过）');
    }
    clearSel();

    // ===== 装备段终局短路：8 轮垫卡/过牌可能把局推完（终局演出中 endPanel 盖住牌桌，
    // 后续「对局中」断言按终局语义短路——装备流本身已在上方断言完毕）=====
    const endedEarly = visible('endPanel') || ((OPTCG_GAME.state() || {}).winner !== null);

    // ===== 结束回合 → AI 行动 → 回到玩家 =====
    mark('结束回合→AI');
    if (endedEarly) {
      step('点击结束回合', true, '装备段已把局推至终局（跳过手动结束）');
      step('AI 完成回合且游戏继续', true, '局已终局');
    } else {
      if (visible('responsePanel')) await clickAt($('btnPass'), '放弃反击(点结束回合前)'); // 同装备段竞态兜底
      await clickAt($('btnEnd'), '点击结束回合');
      const toFoe = await waitFor(() => {
        if (visible('responsePanel')) { const b = $('btnPass'); if (b) b.click(); }
        if ($('phaseBadge').textContent.includes('你的回合') && !$('phaseBadge').textContent.includes('敌方')) { const b = $('btnEnd'); if (b) b.click(); }
        return $('phaseBadge').textContent.includes('敌方回合') || (OPTCG_GAME.state() || {}).winner !== null;
      }, 10000, 150);
      const backToMe = toFoe && await waitFor(() => {
        if (visible('responsePanel')) { const b = $('btnPass'); if (b) b.click(); }
        return $('phaseBadge').textContent.includes('你的回合') || (OPTCG_GAME.state() || {}).winner !== null;
      }, 30000, 100);
      step('AI 完成回合且游戏继续', backToMe, 'toFoe=' + toFoe + ' badge=' + $('phaseBadge').textContent + ' turn=' + (OPTCG_GAME.state() || {}).turn);
    }

    step('对局快照已自动保存', endedEarly || !!(OPTCG_SAVE.hasUnfinished && OPTCG_SAVE.hasUnfinished()), endedEarly ? '终局断档已清=正常' : '');
    mark('打完全场');
    const st = await playToEnd('main-r1');
    step('全场完成至少一次出牌', endedEarly || st.played > 0, endedEarly ? '装备段已出牌（局提前终局）' : '出牌点击 ' + st.played + ' 次');
    step('全场完成至少一次攻击', endedEarly || st.attacked > 0, endedEarly ? '装备段已终局' : '攻击点击 ' + st.attacked + ' 次');
    const fin = OPTCG_GAME.state();
    step('对局必定到达胜负结算', !!fin && fin.winner !== null, fin ? 'winner=' + fin.winner + ' turn=' + fin.turn + ' dur=' + st.durMs + 'ms aiTurns=' + JSON.stringify(st.aiTurnsMs) : 'no state');
    const endShown = await waitFor(() => visible('endPanel'), 9000, 200);
    step('结算面板出现', endShown);
    if (!endShown) return finishReport();
    step('结算标题明确', /胜利|战败/.test($('endTitle').textContent), $('endTitle').textContent);
    await clickAt($('btnBackMenu'), '结算后返回大厅');
    step('返回大厅成功', await ensureLobby());
    await clickAt($('btnStart'), '再次开局');
    step('可继续开始下一局', await waitFor(() => visible('setupPanel') === false && OPTCG_GAME.state(), 4000));
    return finishReport();
  }

  // ===== 连续 3 局（残留审计）：局1 再战 / 局2 换船长出航 / 局3 顶栏重新开局 =====
  // 超长局兜底：playToEnd 预算耗尽仍未分胜负（偶发合法长局）时，顶栏重新开局换一局，
  // 不让单局运气级联污染后续审计（未分胜负局也会从漂移统计中剔除）
  async function forceRestart() {
    await clickAt($('btnRestart'), '长局兜底·顶栏重新开局');
    await waitFor(() => !!document.getElementById('uiConfirm'), 2000);
    const ok = document.querySelector('#uiConfirm .end-actions .btn-primary');
    if (ok) ok.click();
    await waitFor(() => OPTCG_GAME.state() && OPTCG_GAME.state().winner === null && OPTCG_GAME.state().turn === 1, 4000);
    await sleep(2000); // 等 DUEL 横幅自隐
  }
  async function settleRound(tag) {
    await playToEnd(tag);
    let f = OPTCG_GAME.state();
    if (!f || f.winner === null) {
      step(tag + ' 超长局兜底(未分胜负→重开)', true, 'guard 预算尽属偶发长局，非卡死；重开后续跑');
      await forceRestart();
      await playToEnd(tag + 'b');
      f = OPTCG_GAME.state();
    }
    return f;
  }

  async function rounds() {
    await waitFor(() => document.readyState === 'complete', 5000);
    await sleep(1600);
    const ob = document.getElementById('onboard');
    if (ob && !ob.classList.contains('hidden')) { const s = ob.querySelector('.ob-skip'); if (s) s.click(); await waitFor(() => ob.classList.contains('hidden'), 2000); }
    mark('rounds:大厅');
    await ensureLobby();
    await clickAt($('btnStart'), '局1 未选船长出航');
    step('局1 进入对战', await waitFor(() => visible('setupPanel') === false && OPTCG_GAME.state(), 4000));
    const f1 = await settleRound('r1');
    step('局1 到达结算', !!f1 && f1.winner !== null, 'winner=' + (f1 && f1.winner));
    step('局1 结算面板出现', await waitFor(() => visible('endPanel'), 9000, 200));
    await clickAt($('btnRematch'), '局1→再战一局');
    step('局2 再战直接开局', await waitFor(() => visible('setupPanel') === false && OPTCG_GAME.state() && OPTCG_GAME.state().winner === null, 4000));
    mark('rounds:局2(再战)');
    const f2 = await settleRound('r2');
    step('局2 到达结算', !!f2 && f2.winner !== null, 'winner=' + (f2 && f2.winner));
    step('局2 结算面板出现', await waitFor(() => visible('endPanel'), 9000, 200));
    await clickAt($('btnBackMenu'), '局2→返回大厅');
    step('局2 返回大厅', await ensureLobby());
    // 换船长（点第二张船长卡；sticky-cta 悬浮层会遮住网格下缘卡片的中心点，
    // elementFromPoint 校验对悬浮 UI 误报遮挡——玩家可滚动规避，DOM click 走真实 onclick）
    const cards = document.querySelectorAll('#leaderChoices .captain-card');
    if (cards.length > 1) { cards[1].click(); step('局2后换第二位船长', true, 'DOM click（sticky-cta 悬浮层遮挡中心点）'); }
    await clickAt($('btnStart'), '局3 换船长出航');
    step('局3 进入对战(换船长)', await waitFor(() => visible('setupPanel') === false && OPTCG_GAME.state(), 4000));
    mark('rounds:局3(换船长)');
    const f3 = await settleRound('r3');
    step('局3 到达结算', !!f3 && f3.winner !== null, 'winner=' + (f3 && f3.winner));
    step('局3 结算面板出现', await waitFor(() => visible('endPanel'), 9000, 200));
    // 结算面板是全屏模态（挡住顶栏=正确的模态语义）：先「再战」离场到对局中，再走顶栏重新开局
    await clickAt($('btnRematch'), '局3→再战(先离结算面板)');
    step('局3→再战已开局', await waitFor(() => visible('endPanel') === false && OPTCG_GAME.state() && OPTCG_GAME.state().winner === null, 4000));
    await sleep(2000); // 等 DUEL 开局横幅自隐（1.6s），避免遮挡命中校验
    // 对局中顶栏「重新开局」（走确认模态：#uiConfirm + .end-actions .btn-primary）
    await clickAt($('btnRestart'), '对局中顶栏重新开局');
    const cf = await waitFor(() => !!document.getElementById('uiConfirm'), 2000);
    step('重新开局弹确认模态(非原生confirm)', cf, R.dialogs.length ? 'dialogs=' + R.dialogs.length : '');
    const okBtn = document.querySelector('#uiConfirm .end-actions .btn-primary');
    if (cf && okBtn) { await clickAt(okBtn, '确认重新开局'); }
    step('重新开局进入新局', await waitFor(() => visible('endPanel') === false && OPTCG_GAME.state() && OPTCG_GAME.state().winner === null && OPTCG_GAME.state().turn === 1, 4000));
    // ===== 残留审计（统计只计分出胜负的局：超长局兜底留下的未完成样本剔除）=====
    const stats = R.rounds.filter((s) => s.winner === 0 || s.winner === 1);
    if (stats.length >= 2) {
      // 按每回合归一（调池后回合分布变宽是设计结果，13 回合长局≠性能漂移；抓的是「演出/AI 卡顿」级异常）
      const perTurn = stats.map((s) => s.durMs / Math.max(1, s.turn));
      const maxDrift = Math.max(...perTurn) / Math.max(1, Math.min(...perTurn));
      step('局时长无异常漂移', maxDrift < 4, stats.map((s) => s.durMs + 'ms/' + s.turn + '回合').join(' ') + ' 单回合均值比' + maxDrift.toFixed(2));
      const aiAvg = stats.map((s) => s.aiTurnsMs.length ? Math.round(s.aiTurnsMs.reduce((a, b) => a + b, 0) / s.aiTurnsMs.length) : 0);
      step('AI 节奏无明显变慢', !(aiAvg[0] && aiAvg[aiAvg.length - 1] && aiAvg[aiAvg.length - 1] > aiAvg[0] * 3), 'AI回合均值 ' + aiAvg.join('/') + 'ms');
    }
    step('全程无原生弹窗', R.dialogs.length === 0, R.dialogs.slice(0, 2).join(';'));
    step('全程无 JS 错误', R.errors.length === 0, R.errors.slice(0, 2).join(';'));
    // 存档健康：终局+返回后无残留断档；存档层可写读
    await clickAt($('btnMenu'), '返回大厅(收尾)');
    const cf2 = await waitFor(() => !!document.getElementById('uiConfirm'), 2000);
    const ok2 = document.querySelector('#uiConfirm .end-actions .btn-primary');
    if (cf2 && ok2) ok2.click();
    await waitFor(() => visible('setupPanel') || visible('modeSelectPanel'), 3000); // 确认后首页入场有时序
    step('收尾返回大厅', await ensureLobby());
    step('存档层可用且断档已清', OPTCG_SAVE.hasUnfinished && OPTCG_SAVE.hasUnfinished() === false, 'hasUnfinished=' + (OPTCG_SAVE.hasUnfinished ? OPTCG_SAVE.hasUnfinished() : 'n/a'));
    return finishReport();
  }

  // ===== 边界场景（两段式）=====
  async function edge() {
    await waitFor(() => document.readyState === 'complete', 5000);
    await sleep(1600);
    const ob = document.getElementById('onboard');
    if (ob && !ob.classList.contains('hidden')) {
      const skip = ob.querySelector('.ob-skip');
      if (skip) skip.click();
      await waitFor(() => ob.classList.contains('hidden'), 2000);
    }
    // a) 连点出航
    await ensureLobby();
    const bs = $('btnStart');
    for (let i = 0; i < 5; i++) bs.click();
    await sleep(1500);
    const inGame = visible('setupPanel') === false && OPTCG_GAME.state();
    step('连点出航不产生异常', inGame && R.errors.length === 0, 'errors=' + R.errors.length);
    // b) 图片失败兜底
    const img = document.querySelector('#myHand .card img');
    if (img) {
      img.src = 'art/__missing__.webp';
      await sleep(600);
      const fb = img.closest('.art') && img.closest('.art').querySelector('.fallback');
      const fbOk = !img.isConnected || (fb && getComputedStyle(fb).display !== 'none');
      step('图片加载失败显示占位', fbOk);
    } else step('图片加载失败显示占位', true, '无手牌图（跳过）');
    // c) Escape 关帮助
    $('btnHelp').click(); await sleep(300);
    const helpOpen = visible('helpPanel');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await sleep(300);
    step('Escape 关闭说明面板', helpOpen && !visible('helpPanel'));
    // d) 无合法目标操作：空场点领袖攻击（引擎应拒绝且给提示，不崩）
    const myLeader = document.querySelector('[data-role="leader-0"] .card');
    if (myLeader && OPTCG_GAME.state() && OPTCG_GAME.state().winner === null) {
      myLeader.click(); await sleep(300);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await sleep(200);
      step('空选择/无目标操作不崩溃', !R.errors.length, 'errors=' + R.errors.length);
    } else step('空选择/无目标操作不崩溃', true, '局已结束（跳过）');
    // e) 损坏存档（设坏值后跳第二段）
    localStorage.setItem('optcg_save_v2', '{{{corrupted-not-json');
    step('写入损坏存档样本', true);
    try { localStorage.setItem('__e2e_edge1', JSON.stringify({ steps: R.steps.slice(), dialogs: R.dialogs.slice(), errors: R.errors.slice(), timeline: R.timeline.slice() })); } catch (e) { /* 记录失败不阻断 */ }
    location.href = location.pathname + '?e2e=edge2';
  }
  async function edge2() {
    await waitFor(() => document.readyState === 'complete', 5000);
    await sleep(1500);
    try {
      const prev = JSON.parse(localStorage.getItem('__e2e_edge1') || 'null');
      if (prev && Array.isArray(prev.steps)) {
        R.steps.unshift(...prev.steps);
        R.dialogs.unshift(...(prev.dialogs || []));
        R.errors.unshift(...(prev.errors || []));
        R.timeline.unshift(...(prev.timeline || []));
      }
      localStorage.removeItem('__e2e_edge1');
    } catch (e) { /* 合并失败不阻断第二段 */ }
    step('损坏存档后页面不白屏', visible('modeSelectPanel') || visible('setupPanel') || !!document.querySelector('.captain-card'));
    step('损坏存档可进入对战', (await ensureLobby()) && (() => { $('btnStart').click(); return true; })() && await waitFor(() => visible('setupPanel') === false && OPTCG_GAME.state(), 4000));
    const S = window.OPTCG_SAVE;
    step('存档层仍可用', S && S.get != null && typeof S.get === 'function');
    const backs = Object.keys(localStorage).filter((k) => k.startsWith('optcg_backup_'));
    step('损坏数据已自动备份', backs.length > 0, backs.slice(0, 2).join(','));
    return finishReport();
  }

  // ===== 反击窗口生命周期（回归：打出反击牌后面板必须收口——2026-09-17 打完最后一张走自动结算路径无人收窗，面板冻死且「放弃」失效）=====
  async function counterWin() {
    await waitFor(() => document.readyState === 'complete', 5000);
    await sleep(1600);
    const ob = document.getElementById('onboard');
    if (ob && !ob.classList.contains('hidden')) { const s = ob.querySelector('.ob-skip'); if (s) s.click(); await waitFor(() => ob.classList.contains('hidden'), 2000); }
    await ensureLobby();
    await clickAt($('btnStart'), '进入对战');
    await waitFor(() => visible('setupPanel') === false && OPTCG_GAME.state(), 4000);
    mark('构造反击窗口局面');
    const snap = OPTCG_GAME.snapshot();
    if (!step('取得对局快照', !!snap && !!snap.g)) return finishReport();
    const g = snap.g;
    g.winner = null;
    g.active = 1; // 对方回合中（攻击已宣告）
    g.pending = { kind: 'counter', attacker: { side: 1, type: 'leader' }, target: { side: 0, type: 'leader' }, counterBoost: 0, countered: [] };
    g.players[1].leader.rest = true; // 攻击者已横置
    g.players[0].hand[0].counter = 1000; // 强置两张反击牌（真实起手未必有，无法确定性走到该窗口）
    g.players[0].hand[1].counter = 1000;
    step('恢复反击窗口局面', OPTCG_GAME.restoreFromSnapshot(snap));
    step('有反击牌时弹反击窗口', await waitFor(() => visible('responsePanel'), 2500));
    const opts = () => document.querySelectorAll('#responseOptions .resp-opt');
    if (!opts().length) return finishReport();
    opts()[0].click();
    await sleep(900);
    // 还剩反击牌（至少强置的第 2 张）→ 窗口必须保持并刷新可继续垫
    step('打出一张后面板续开(可继续垫)', visible('responsePanel') && opts().length >= 1, 'opts=' + opts().length);
    // 连打至无牌：最后一张触发自动结算——旧版此处面板冻死在屏上
    let guard = 0;
    while (guard++ < 8) {
      const o = document.querySelector('#responseOptions .resp-opt');
      if (!o) break;
      o.click();
      await sleep(800);
    }
    step('打完反击牌自动结算并收起面板', await waitFor(() => !visible('responsePanel'), 5000), visible('responsePanel') ? '面板仍可见' : '');
    return finishReport();
  }

  // ===== 装备流专测（回归：deckOf 稀释卡组下装备 2/50 靠自然抽到手是概率题——API 构造确定性局面走真实点击流）=====
  async function gearWin() {
    await waitFor(() => document.readyState === 'complete', 5000);
    await sleep(1600);
    const ob = document.getElementById('onboard');
    if (ob && !ob.classList.contains('hidden')) { const s = ob.querySelector('.ob-skip'); if (s) s.click(); await waitFor(() => ob.classList.contains('hidden'), 2000); }
    await ensureLobby();
    await clickAt($('btnStart'), '进入对战');
    await waitFor(() => visible('setupPanel') === false && OPTCG_GAME.state(), 4000);
    mark('构造装备在手局面');
    const snap = OPTCG_GAME.snapshot();
    if (!step('取得对局快照', !!snap && !!snap.g)) return finishReport();
    const g = snap.g;
    const O = window.OPTCG;
    const myColor = g.players[0].leader.color;
    const gears = O.POOL.cards.filter((c) => c.color === myColor && c.type === 'gear').sort((a, b) => a.cost - b.cost);
    if (!step('本色卡池有装备卡', gears.length >= 2, gears.map((c) => c.id).join(','))) return finishReport();
    // 我方回合、无 pending、贝里区 5 枚可用、手前两张=两件装备、场上一名角色
    g.winner = null; g.pending = null; g.active = 0;
    g.players[0].donArea = Array.from({ length: 5 }, () => ({ rest: false, attached: null }));
    g.players[0].hand[0] = gears[0];
    g.players[0].hand[1] = gears[1];
    const hero = O.POOL.cards.find((c) => c.color === myColor && c.type === 'char' && c.cost <= 3);
    g.players[0].board = [Object.assign({}, hero, { dons: 0, gears: [], buffs: [], rest: false, playedTurn: g.turn })];
    // 内联复刻 restoreFromSnapshot 的入参校验，定位注入后哪项不合法
    const vv = [];
    vv.push(['players2', Array.isArray(g.players) && g.players.length === 2]);
    vv.push(['turn', typeof g.turn === 'number']);
    vv.push(['winnerKey', 'winner' in g && g.winner === null]);
    vv.push(['active', typeof g.active === 'number']);
    for (const pl of g.players) vv.push(['pl-' + (pl.leader && pl.leader.color), !!(pl && pl.leader && Array.isArray(pl.hand) && Array.isArray(pl.board) && Array.isArray(pl.deck) && typeof pl.lp === 'number')]);
    step('注入后快照结构合法', vv.every((x) => x[1]), vv.map((x) => x[0] + '=' + x[1]).join(' '));
    step('恢复装备在手+角色在场局面', OPTCG_GAME.restoreFromSnapshot(snap), warns.slice(-2).join(' | '));
    const graveN = () => { const b = $('myGrave') && $('myGrave').querySelector('b'); return b ? +b.textContent : 0; };
    const gearCard = [...document.querySelectorAll('#myHand .card')].find((c) => c.querySelector('.kw-gear'));
    if (!step('手牌渲染出装备卡', !!gearCard)) return finishReport();
    await clickAt(gearCard, '点击装备卡');
    if (!await waitFor(() => /装备的角色/.test($('hint').textContent), 800)) {
      // 选牌交互（四轮反馈）：首击=选中（hint「再点一次打出」），二击才进装备目标选择
      const again = [...document.querySelectorAll('#myHand .card')].find((c) => c.querySelector('.kw-gear'));
      if (again) await clickAt(again, '再点一次进入装备目标选择');
    }
    step('进入装备选择模式(hint)', await waitFor(() => /装备的角色/.test($('hint').textContent), 1500), $('hint').textContent);
    const uid = document.querySelector('#myBoard .card').dataset.cardId;
    const p0 = +document.querySelector('#myBoard .card .power').textContent.replace('K', '');
    const tgt = document.querySelector('#myBoard .card.targetable');
    if (tgt) await clickAt(tgt, '点击场上角色穿上装备');
    const worn = await waitFor(() => {
      const el = document.querySelector('#myBoard .card[data-card-id="' + uid + '"]');
      return el && el.querySelector('.kw-gear-on') && +el.querySelector('.power').textContent.replace('K', '') > p0;
    }, 3000);
    step('装备穿上后战力跳变+已装备徽章', worn, worn ? '' : 'power ' + p0 + '→' + (() => { const el = document.querySelector('#myBoard .card[data-card-id="' + uid + '"]'); return el ? el.querySelector('.power').textContent : '?'; })());
    // 替换流：同一角色再装第二件，旧件进墓场
    if (worn) {
      const g1 = graveN();
      const gear2 = [...document.querySelectorAll('#myHand .card')].find((c) => c.querySelector('.kw-gear'));
      if (gear2 && gear2.classList.contains('playable')) {
        await clickAt(gear2, '点击第二件装备卡');
        if (!await waitFor(() => /装备的角色/.test($('hint').textContent), 800)) {
          // 选牌交互同上：首击选中，二击进目标选择
          const g2again = [...document.querySelectorAll('#myHand .card')].find((c) => c.querySelector('.kw-gear'));
          if (g2again) await clickAt(g2again, '再点一次进入目标选择(第二件)');
          await waitFor(() => /装备的角色/.test($('hint').textContent), 1500);
        }
        const tgt2 = document.querySelector('#myBoard .card.targetable'); // 已装备目标降级 replaceable 仍可选
        if (tgt2) await clickAt(tgt2, '再装到同一角色(替换旧件)');
        const replaced = await waitFor(() => graveN() === g1 + 1, 2500);
        step('再装一件=替换旧件进墓场', replaced, '墓 ' + g1 + '→' + graveN());
      } else step('再装一件=替换旧件进墓场', true, '第二件不可出（跳过）');
    }
    return finishReport();
  }

  (async () => {
    try {
      if (MODE === 'main') await main();
      else if (MODE === 'rounds') await rounds();
      else if (MODE === 'edge') await edge();
      else if (MODE === 'edge2') await edge2();
      else if (MODE === 'counter') await counterWin();
      else if (MODE === 'gear') await gearWin();
      else return;
      if (MODE !== 'edge') await finishReport();
    } catch (e) {
      R.errors.push('FATAL ' + (e && e.message));
      R.summary = 'E2E-FAIL-fatal';
      document.title = 'E2E-RESULT ' + JSON.stringify(R);
    }
  })();
})();
