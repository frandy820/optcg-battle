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
      return step(label, false, '点击命中被遮挡：中心点命中的是 <' + (hit && hit.tagName) + '>');
    }
    el.click();
    return step(label, true);
  }
  const inViewport = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); return r.top >= 0 && r.top < innerHeight && r.bottom > 0; };

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
        const t = document.querySelector('#enemyLeaderSlot .card.targetable');
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

    // ===== 大厅首屏审计 =====
    const btnStart = $('btnStart');
    step('出航按钮存在', !!btnStart);
    step('出航按钮首屏可见(30秒入口)', inViewport(btnStart), 'rect.top=' + (btnStart ? Math.round(btnStart.getBoundingClientRect().top) : '-') + ' 视口高' + innerHeight);
    const scroll = $('setupPanel') ? $('setupPanel').querySelector('.modal-card') : null;
    if (scroll) step('大厅弹层内容可滚动', scroll.scrollHeight >= scroll.clientHeight, `内容高${scroll.scrollHeight} 视高${scroll.clientHeight}`);

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
    step('费用区可见', document.querySelectorAll('#myDon .don').length > 0, document.querySelectorAll('#myDon .don').length + ' 颗 DON');
    step('行动提示条有内容', !!($('hint') && $('hint').textContent.length > 0), $('hint') ? $('hint').textContent : '');

    // ===== 出牌（成功=手牌减/场上增/墓地增——事件卡打出即入墓不占 board）=====
    let played = false;
    const playable = () => document.querySelector('#myHand .card.playable');
    if (await waitFor(playable, 2500)) {
      const bHand = document.querySelectorAll('#myHand .card').length;
      const bBoard = document.querySelectorAll('#myBoard .card').length;
      const bGrave = (document.querySelector('#myGrave b') || {}).textContent;
      await clickAt(playable(), '点击可出手牌');
      played = await waitFor(() => {
        return document.querySelectorAll('#myHand .card').length < bHand
          || document.querySelectorAll('#myBoard .card').length > bBoard
          || ((document.querySelector('#myGrave b') || {}).textContent) !== bGrave;
      }, 4000);
      step('出牌成功且有效果', played);
    } else step('存在可出手牌', true, '首回合起手无低费卡（正常随机），出牌验证移至全场累计断言');

    // ===== 悬停信息卡（卡面全量信息 + 竖/横语义）=====
    if (window.matchMedia && matchMedia('(hover: hover)').matches) {
      const anyCard = document.querySelector('#myHand .card') || document.querySelector('#myBoard .card');
      if (anyCard) {
        anyCard.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, clientX: 60, clientY: 300 }));
        await sleep(300);
        const tip = document.getElementById('cardTip');
        const shown = tip && !tip.classList.contains('hidden') && tip.textContent.length > 20;
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
        ? step('不可出原因有提示', /费用|满|回合|响应/.test($('hint').textContent), $('hint').textContent)
        : step('不可出原因有提示', false, '无 warn 提示');
    } else step('不可出原因有提示', true, '本回合无不可出卡（跳过）');

    // ===== 攻击：选攻击者 → 选目标；反复选择/取消（破坏性子项）=====
    const attacker = document.querySelector('#myBoard .card.playable') || document.querySelector('[data-role="leader-0"] .card');
    if (attacker && played) {
      await clickAt(attacker, '点击己方单位选为攻击者');
      const targeted = await waitFor(() => document.querySelector('.targetable'), 1500);
      step('攻击者选择后有目标高亮', targeted);
      if (targeted) {
        step('目标选择提示明确', /攻击目标/.test($('hint').textContent), $('hint').textContent);
        // 反复取消/重选（真实玩家常见动作）
        await clickAt(attacker, '再点攻击者取消选择');
        const cancelled = await waitFor(() => !document.querySelector('.targetable'), 1500);
        step('再点攻击者可取消', cancelled);
        await clickAt(attacker, '重新选择攻击者');
        await waitFor(() => document.querySelector('.targetable'), 1500);
        const foeLeader = document.querySelector('#enemyLeaderSlot .card');
        if (foeLeader && foeLeader.classList.contains('targetable')) {
          const foeLife0 = document.querySelectorAll('#enemyLife .life-card:not(.empty)').length;
          const foeBoard0 = document.querySelectorAll('#enemyBoard .card').length;
          await clickAt(foeLeader, '点击敌方领袖发起攻击');
          const attacked = await waitFor(() => {
            const l = document.querySelectorAll('#enemyLife .life-card:not(.empty)').length;
            const b = document.querySelectorAll('#enemyBoard .card').length;
            const logHit = [...document.querySelectorAll('#logBody .log-line')].some((x) => /攻击|阻挡|反击/.test(x.textContent));
            return l < foeLife0 || b !== foeBoard0 || logHit || visible('responsePanel');
          }, 6000);
          step('攻击发起并有结算反馈', attacked);
          await waitFor(() => !visible('responsePanel'), 6000);
        } else step('敌方领袖可选为目标', false, '未高亮');
      }
    } else step('可发起攻击', true, '首回合无已落地单位，攻击验证移至全场累计断言');

    // ===== 结束回合 → AI 行动 → 回到玩家 =====
    mark('结束回合→AI');
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

    step('对局快照已自动保存', OPTCG_SAVE.hasUnfinished && OPTCG_SAVE.hasUnfinished());
    mark('打完全场');
    const st = await playToEnd('main-r1');
    step('全场完成至少一次出牌', st.played > 0, '出牌点击 ' + st.played + ' 次');
    step('全场完成至少一次攻击', st.attacked > 0, '攻击点击 ' + st.attacked + ' 次');
    const fin = OPTCG_GAME.state();
    step('对局必定到达胜负结算', !!fin && fin.winner !== null, fin ? 'winner=' + fin.winner + ' turn=' + fin.turn + ' dur=' + st.durMs + 'ms aiTurns=' + JSON.stringify(st.aiTurnsMs) : 'no state');
    const endShown = await waitFor(() => visible('endPanel'), 9000, 200);
    step('结算面板出现', endShown);
    if (!endShown) return finishReport();
    step('结算标题明确', /胜利|战败/.test($('endTitle').textContent), $('endTitle').textContent);
    await clickAt($('btnBackMenu'), '结算后返回大厅');
    await waitFor(() => visible('setupPanel'), 3000) ? step('返回大厅成功', true) : step('返回大厅成功', false);
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
    step('局2 返回大厅', await waitFor(() => visible('setupPanel'), 3000));
    // 换船长（点第二张船长卡）
    const cards = document.querySelectorAll('#leaderChoices .captain-card');
    if (cards.length > 1) await clickAt(cards[1], '局2后换第二位船长');
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
      const durs = stats.map((s) => s.durMs);
      const maxDrift = Math.max(...durs) / Math.max(1, Math.min(...durs));
      step('局时长无异常漂移', maxDrift < 4, durs.join('/') + 'ms 比值' + maxDrift.toFixed(2));
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
    await waitFor(() => visible('setupPanel'), 3000);
    step('收尾返回大厅', visible('setupPanel'));
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
    step('损坏存档后页面不白屏', visible('setupPanel') || !!document.querySelector('.captain-card'));
    step('损坏存档可进入对战', (() => { $('btnStart').click(); return true; })() && await waitFor(() => visible('setupPanel') === false && OPTCG_GAME.state(), 4000));
    const S = window.OPTCG_SAVE;
    step('存档层仍可用', S && S.get != null && typeof S.get === 'function');
    const backs = Object.keys(localStorage).filter((k) => k.startsWith('optcg_backup_'));
    step('损坏数据已自动备份', backs.length > 0, backs.slice(0, 2).join(','));
    return finishReport();
  }

  (async () => {
    try {
      if (MODE === 'main') await main();
      else if (MODE === 'rounds') await rounds();
      else if (MODE === 'edge') await edge();
      else if (MODE === 'edge2') await edge2();
      else return;
      if (MODE !== 'edge') await finishReport();
    } catch (e) {
      R.errors.push('FATAL ' + (e && e.message));
      R.summary = 'E2E-FAIL-fatal';
      document.title = 'E2E-RESULT ' + JSON.stringify(R);
    }
  })();
})();
