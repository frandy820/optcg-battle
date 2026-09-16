// 对局 UI：交互流 + 演出播放器 + 粒子特效
// 依赖 app.bundle.js 提供的 window.OPTCG（引擎/AI/卡池）
// 外部契约（均防御式可选调用，缺省为 no-op）：
//   window.OPTCG_SAVE   — autosave(snap|null)/hasUnfinished()/resume()（save.js，A2 线）
//   window.OPTCG_AUDIO  — play(name)（audio.js，A2 线）
//   window.OPTCG_ONBOARDING — active()（onboarding.js；引导层激活时 Escape 让给它处理）
/* global OPTCG */
(function () {
  'use strict';
  const O = OPTCG;
  const $ = (id) => document.getElementById(id);

  const CAP = () => window.OPTCG_CAPTAINS; // captains-data.js：图标库 + 阵营徽记 + 船长配置
  const COLOR_NAME = { red: '红', blue: '蓝', green: '绿', yellow: '黄', purple: '紫', black: '黑' };
  const KW_LABEL = { rush: '速攻', blocker: '阻挡', doubleAttack: '双击', banish: '放逐' };
  const MY = 0, FOE = 1;
  const AI_DELAY = 650;        // AI 每步延时（演出感）
  const FX_TIMEOUT = 4000;     // 演出总兜底：超时强制解锁（防软锁）
  const AI_LEVELS = ['easy', 'normal', 'hard'];

  let G = null;                // 引擎状态
  let ai = null;
  let busy = false;
  let selMode = null;          // 'attack' | 'don' | {attacker} 等
  let logSeen = 0;
  let myLeaderColor = null;
  let hint = null;
  let gameCtx = null;          // { mode:'free'|'ladder'|'survival', ... } 模式层结算用
  let ended = false;           // 终局结算只弹一次
  let gen = 0;                 // 对局代际号：跨局 setTimeout/autoplay 幽灵调用防护
  let autoTimer = null;        // autoplay 调试定时器引用（restart/backToMenu 必清）
  let hintTimer = null;        // 提示条闪现还原定时器

  // ===== 防御式外部调用 =====
  function sfx(name) {
    try { window.OPTCG_AUDIO && typeof window.OPTCG_AUDIO.play === 'function' && window.OPTCG_AUDIO.play(name); } catch (e) { /* 桩缺失/异常：静默 */ }
  }
  function motionReduced() {
    return document.documentElement.classList.contains('reduced-motion')
      || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function autosaveNow() {
    try { window.OPTCG_SAVE && typeof window.OPTCG_SAVE.autosave === 'function' && window.OPTCG_SAVE.autosave(snapshot()); } catch (e) { /* 静默 */ }
  }

  // ===== 统一 UI 反馈层（toast + 模态确认；game/modes/save 共用，替代原生 alert/confirm）=====
  function toast(msg, kind) {
    let t = document.getElementById('uiToast');
    if (!t) {
      t = document.createElement('div'); t.id = 'uiToast';
      t.style.cssText = 'position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:200;'
        + 'max-width:min(520px,92vw);padding:9px 18px;border-radius:10px;font-size:13px;letter-spacing:.5px;'
        + 'background:rgba(10,20,38,.95);border:1px solid rgba(217,170,69,.55);color:#ffe9b8;'
        + 'box-shadow:0 6px 24px rgba(0,0,0,.6);opacity:0;transition:opacity .2s;pointer-events:none;';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.borderColor = kind === 'error' ? 'rgba(232,86,63,.7)' : 'rgba(217,170,69,.55)';
    t.style.color = kind === 'error' ? '#ffb4a6' : '#ffe9b8';
    t.style.opacity = '1';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { t.style.opacity = '0'; }, 2400);
  }
  function uiConfirm(msg, opts) {
    opts = opts || {};
    return new Promise((resolve) => {
      const old = document.getElementById('uiConfirm');
      if (old) old.remove();
      const panel = document.createElement('div');
      panel.id = 'uiConfirm'; panel.className = 'modal';
      const card = document.createElement('div');
      card.className = 'modal-card';
      card.style.maxWidth = '400px';
      const p = document.createElement('p');
      p.style.cssText = 'color:#cbb98a;font-size:13.5px;line-height:1.8;margin:4px 0 16px;white-space:pre-line;';
      p.textContent = msg;
      const acts = document.createElement('div');
      acts.className = 'end-actions';
      const close = (val) => { panel.remove(); document.removeEventListener('keydown', onKey, true); resolve(val); };
      const mk = (label, cls, val) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = cls; b.textContent = label;
        b.onclick = () => close(val);
        return b;
      };
      const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(false); } };
      acts.appendChild(mk(opts.cancelText || '取消', 'btn-ghost', false));
      acts.appendChild(mk(opts.okText || '确认', 'btn-primary', true));
      card.appendChild(p); card.appendChild(acts);
      panel.appendChild(card);
      panel.addEventListener('click', (e) => { if (e.target === panel) close(false); });
      document.addEventListener('keydown', onKey, true); // 捕获阶段：先于全局面板 Escape 处理
      document.body.appendChild(panel);
      const f = card.querySelector('button.btn-ghost');
      if (f) { try { f.focus({ preventScroll: true }); } catch (e) { /* 老浏览器 */ } }
    });
  }

  // ===== 粒子系统 =====
  const fxCanvas = $('fx');
  const fctx = fxCanvas.getContext('2d');
  let particles = [];
  function resizeFx() {
    fxCanvas.width = innerWidth; fxCanvas.height = innerHeight;
  }
  addEventListener('resize', resizeFx); resizeFx();
  function burst(x, y, color, n = 26, spread = 5) {
    if (motionReduced()) return; // 减少动效模式：跳过粒子
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = (0.4 + Math.random()) * spread;
      particles.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1.2,
        life: 1, decay: 0.02 + Math.random() * 0.03,
        size: 1.5 + Math.random() * 3, color,
      });
    }
  }
  (function fxLoop() {
    requestAnimationFrame(fxLoop);
    if (!particles.length) { fctx.clearRect(0, 0, fxCanvas.width, fxCanvas.height); return; }
    fctx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
    particles = particles.filter((p) => p.life > 0);
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life -= p.decay;
      fctx.globalAlpha = Math.max(p.life, 0);
      fctx.fillStyle = p.color;
      fctx.shadowColor = p.color; fctx.shadowBlur = 8;
      fctx.beginPath(); fctx.arc(p.x, p.y, p.size, 0, 7); fctx.fill();
    }
    fctx.globalAlpha = 1; fctx.shadowBlur = 0;
  })();

  // ===== DOM 构造 =====
  function cardEl(def, opts = {}) {
    const el = document.createElement('div');
    el.className = `card ${def.color}` + (opts.cls ? ' ' + opts.cls : '');
    el.dataset.cardId = def.id;
    el.tabIndex = 0; // 键盘可达（Enter/Space 激活，委托见 initFocusManager）
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', def.name + (def.cost != null ? `，费用 ${def.cost}` : '') + (def.power ? `，战力 ${def.power / 1000}K` : ''));
    const kwHtml = (def.keywords || []).map((k) => `<span class="kw-badge kw-${k}">${KW_LABEL[k] || k}</span>`).join('');
    const costHtml = def.type === 'leader' ? '' : `<div class="cost">${def.cost}</div>`;
    const artUrl = `art/${def.art || def.id}.webp`;
    el.innerHTML = `
      ${costHtml}
      <div class="kw-badges">${kwHtml}</div>
      <div class="art">
        <img src="${artUrl}" alt="" style="display:none"
          onload="this.style.display='block';this.parentNode.querySelector('.fallback').style.display='none'"
          onerror="this.remove()">
        <div class="fallback"><span class="glyph">${CAP().icon((CAP().FACTION[def.color] || {}).emblem, 'glyph-emblem')}</span></div>
      </div>
      <div class="name">${def.name}</div>
      <div class="sub">${def.sub || ''}</div>
      ${def.power ? `<div class="power">${def.power / 1000}K</div>` : ''}
      ${def.counter ? `<div class="counter-badge">C ${def.counter / 1000}K</div>` : ''}
    `;
    el.title = opts.tip || `${def.name}${def.power ? ` · ${def.power / 1000}K` : ''}${(def.keywords || []).length ? ' · ' + def.keywords.map((k) => KW_LABEL[k] || k).join('/') : ''}`;
    return el;
  }

  function leaderEl(pl, side) {
    const el = cardEl(pl.leader, { cls: 'leader' + (pl.leader.rest ? ' rest' : '') });
    const pips = Array.from({ length: pl.leader.life }, (_, i) =>
      `<span class="life-pip ${i < pl.life.length ? '' : 'off'}"></span>`).join('');
    const wrap = document.createElement('div');
    wrap.style.position = 'relative';
    wrap.tabIndex = 0;
    wrap.setAttribute('role', 'button');
    wrap.setAttribute('aria-label', pl.leader.name + '（我方船长）');
    wrap.appendChild(el);
    const pipRow = document.createElement('div');
    pipRow.className = 'life-pips';
    pipRow.innerHTML = pips;
    el.appendChild(pipRow);
    wrap.dataset.role = 'leader-' + side;
    return wrap;
  }

  function donEl(d, clickable) {
    const el = document.createElement('span');
    el.className = 'don' + (d.rest ? ' rest' : '') + (d.attached ? ' attached' : '');
    return el;
  }

  // ===== 手牌可玩性判定（渲染灰化与点击提示共用同一真值源）=====
  // 返回 null=可出；否则返回不可出原因文案
  function handLockReason(c) {
    if (!G) return '尚未开始对局';
    if (G.winner !== null) return '对局已结束';
    if (G.pending) return '对方攻击中——请在响应窗口选择阻挡或反击';
    if (G.active !== MY) return '对方回合，暂时无法出牌';
    const me = G.players[MY];
    if (c.type === 'char' && me.board.length >= 5) return '场上已满 5 名角色，无法再召唤';
    if (c.cost > O.usableDons(me)) return `费用不足：还需 ${c.cost - O.usableDons(me)} 颗 DON!!`;
    return null;
  }

  // ===== 主渲染 =====
  function renderAll() {
    if (!G) return;
    const me = G.players[MY], foe = G.players[FOE];
    $('turnNo').textContent = `回合 ${G.turn}`;
    const myTurn = G.active === MY && !G.pending;
    const badge = $('phaseBadge');
    badge.textContent = G.pending ? '响应!' : (G.active === MY ? '你的回合' : '敌方回合');
    badge.className = 'phase-badge' + (G.active === FOE ? ' enemy' : '');

    // 对手
    const foeLeaderSlot = $('enemyLeaderSlot');
    foeLeaderSlot.innerHTML = ''; foeLeaderSlot.appendChild(leaderEl(foe, FOE));
    $('enemyLife').innerHTML = foe.life.map(() => '<span class="life-card"></span>').join('')
      + Array.from({ length: Math.max(0, foe.leader.life - foe.life.length) }, () => '<span class="life-card empty"></span>').join('');
    $('enemyDon').innerHTML = foe.donArea.map((d) => donEl(d).outerHTML).join('');
    $('enemyBoard').innerHTML = '';
    foe.board.forEach((u, i) => {
      const el = cardEl(u, { cls: (u.rest ? 'rest ' : '') });
      el.dataset.foeIdx = i;
      $('enemyBoard').appendChild(el);
    });
    $('enemyStage').innerHTML = '';
    if (foe.stage) $('enemyStage').appendChild(cardEl(foe.stage, { cls: 'stage-mini' }));
    $('enemyHand').innerHTML = foe.hand.map(() => '<span class="card-back"></span>').join('');
    $('enemyGrave').innerHTML = `墓 <b>${foe.trash.length}</b>`;

    // 己方
    const myLeaderSlot = $('myLeaderSlot');
    myLeaderSlot.innerHTML = ''; myLeaderSlot.appendChild(leaderEl(me, MY));
    $('myLife').innerHTML = me.life.map(() => '<span class="life-card"></span>').join('')
      + Array.from({ length: Math.max(0, me.leader.life - me.life.length) }, () => '<span class="life-card empty"></span>').join('');
    $('myDon').innerHTML = me.donArea.map((d) => donEl(d).outerHTML).join('');
    $('myDon').classList.toggle('can-act', myTurn && O.usableDons(me) > 0);
    $('myBoard').innerHTML = '';
    me.board.forEach((u, i) => {
      const canAtk = myTurn && !u.rest && (u.playedTurn < G.turn || (u.keywords || []).includes('rush'));
      const el = cardEl(u, { cls: (u.rest ? 'rest ' : '') + (canAtk ? 'playable' : '') });
      el.dataset.myIdx = i;
      $('myBoard').appendChild(el);
    });
    $('myStage').innerHTML = '';
    if (me.stage) $('myStage').appendChild(cardEl(me.stage, { cls: 'stage-mini' }));
    $('myHand').innerHTML = '';
    me.hand.forEach((c, i) => {
      const canPlay = handLockReason(c) === null;
      const el = cardEl(c, { cls: canPlay ? 'playable' : 'unplayable' });
      el.dataset.handIdx = i;
      $('myHand').appendChild(el);
    });
    $('myGrave').innerHTML = `墓 <b>${me.trash.length}</b>`;

    $('btnEnd').classList.toggle('can-act', myTurn);
    renderHints();
    updateHandFades();
  }

  // 手牌横向滚动渐隐提示（窄屏 6 张以上时可滑动）
  function updateHandFades() {
    const hand = $('myHand'); if (!hand) return;
    const wrap = hand.parentElement;
    if (!wrap || !wrap.classList.contains('hand-wrap')) return;
    const l = wrap.querySelector('.hand-fade-l'), r = wrap.querySelector('.hand-fade-r');
    if (!l || !r) return;
    const over = hand.scrollWidth - hand.clientWidth > 4;
    l.classList.toggle('show', over && hand.scrollLeft > 3);
    r.classList.toggle('show', over && hand.scrollLeft < hand.scrollWidth - hand.clientWidth - 3);
  }

  function renderHints() {
    if (!hint) {
      hint = document.createElement('div'); hint.id = 'hint';
      document.body.appendChild(hint);
    }
    const myTurn = G.active === MY && !G.pending;
    let text;
    if (G.winner !== null) text = G.winner === MY ? '胜利！' : '战败…';
    else if (G.pending && G.pending.target.side === MY) text = '对方攻击——选择阻挡/反击或放弃';
    else if (selMode && selMode.mode === 'attack') text = '选择攻击目标（点敌方领袖或已横置角色，再点攻击者可取消）';
    else if (selMode && selMode.mode === 'don') text = '选择 DON!! 附着目标（点己方单位，再点费用区取消）';
    else if (myTurn) text = '你的回合：点手牌出牌 · 点单位攻击 · 点 DON!! 附着';
    else text = '对方行动中…';
    if (hint.textContent !== text) hint.textContent = text;
    hint.classList.remove('warn');
  }

  // ===== 演出播放器 =====
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  function playEvents() {
    const evs = G.log.slice(logSeen);
    logSeen = G.log.length;
    return new Promise((resolve) => {
      let done = false;
      const finish = () => { if (!done) { done = true; resolve(); } };
      setTimeout(finish, FX_TIMEOUT); // 兜底：演出绝不允许锁死流程
      (async () => {
        for (const ev of evs) { await playOne(ev); if (done) return; }
        finish();
      })();
    });
  }

  async function playOne(ev) {
    switch (ev.t) {
      case 'summon': {
        sfx('summon');
        await sleep(300);
        const boardEl = ev.side === MY ? $('myBoard') : $('enemyBoard');
        const card = boardEl.querySelector(`[data-card-id="${ev.cardId}"]`);
        if (card) {
          card.classList.add('summon-fx');
          const r = card.getBoundingClientRect();
          burst(r.left + r.width / 2, r.top + r.height / 2, '#ffe9a8', 34, 6);
          await sleep(560);
        }
        break;
      }
      case 'attack': {
        sfx('attack');
        const fromMy = ev.attacker.side === MY;
        let card;
        if (ev.attacker.type === 'leader') {
          card = document.querySelector(`[data-role="leader-${fromMy ? MY : FOE}"] .card`);
        } else {
          const boardEl = fromMy ? $('myBoard') : $('enemyBoard');
          card = boardEl.children[ev.attacker.idx];
        }
        if (card) {
          card.classList.add('attack-fx');
          if (!fromMy) card.classList.add('enemy-atk');
          await sleep(380);
        }
        break;
      }
      case 'clash': {
        sfx('clash');
        document.body.classList.remove('shake');
        void document.body.offsetWidth; // 重启动画
        document.body.classList.add('shake');
        spawnRing(ev);
        await sleep(420);
        break;
      }
      case 'life': {
        const target = ev.side === MY ? $('myLife') : $('enemyLife');
        const cardEls = target.querySelectorAll('.life-card:not(.empty)');
        const first = cardEls[0];
        if (first) {
          const r = first.getBoundingClientRect();
          spawnDmg(r.left + r.width / 2, r.top, ev.banish ? '放逐!' : '-1');
          if (!ev.banish) { first.classList.add('flip'); }
          burst(r.left + r.width / 2, r.top + r.height / 2, ev.banish ? '#b18cff' : '#ffd98e', 22, 4);
        }
        await sleep(430);
        break;
      }
      case 'ko': {
        sfx('ko');
        await sleep(200);
        const boards = Object.fromEntries([[MY, $('myBoard')], [FOE, $('enemyBoard')]]);
        const card = boards[ev.side]?.querySelector(`[data-card-id="${ev.cardId}"]`);
        if (card) {
          const r = card.getBoundingClientRect();
          burst(r.left + r.width / 2, r.top + r.height / 2, '#ff8a8a', 30, 7);
          card.classList.add('ko-fx');
          await sleep(620);
        }
        break;
      }
      case 'donGain': case 'effectDon': case 'donAttach': {
        const zone = (ev.side === MY) ? $('myDon') : $('enemyDon');
        const dons = zone.querySelectorAll('.don');
        const last = dons[dons.length - 1];
        if (ev.t === 'donAttach' || last) {
          (ev.t === 'donAttach' ? zone : last)?.classList?.add('pulse');
          if (last) { last.classList.add('pulse'); await sleep(300); last.classList.remove('pulse'); }
        }
        break;
      }
      case 'counter': {
        showBanner('COUNTER!', '');
        burst(innerWidth / 2, innerHeight / 2, '#8fd3ff', 30, 7);
        await sleep(700);
        break;
      }
      case 'block': {
        showBanner('BLOCK!', '');
        await sleep(600);
        break;
      }
      case 'win': {
        sfx(ev.winner === MY ? 'win' : 'lose');
        await sleep(250);
        showBanner(ev.winner === MY ? '胜利！' : '战败', ev.winner === MY ? '' : 'defeat');
        break;
      }
      default: break; // draw/event/stage/refresh/endTurn 等轻事件不阻塞
    }
  }

  function spawnRing() {
    const ring = document.createElement('div');
    ring.className = 'clash-ring';
    ring.style.left = (innerWidth / 2) + 'px';
    ring.style.top = (innerHeight / 2) + 'px';
    document.body.appendChild(ring);
    setTimeout(() => ring.remove(), 600);
  }
  function spawnDmg(x, y, text) {
    const d = document.createElement('div');
    d.className = 'dmg-num';
    d.textContent = text;
    d.style.left = (x - 20) + 'px';
    d.style.top = (y - 30) + 'px';
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 1100);
  }
  function showBanner(text, extraCls) {
    const b = $('banner');
    b.innerHTML = `<div class="banner-text ${extraCls || ''}">${text}</div>`;
    b.classList.remove('hidden');
    setTimeout(() => b.classList.add('hidden'), 1600);
  }

  // ===== 动作执行 =====
  async function doAction(action) {
    if (busy || !G || G.winner !== null) return;
    busy = true;
    selMode = null;
    try {
      O.applyAction(G, action);
      addLogLine(action);
      await playEvents();
      renderAll();
      if (G.winner !== null && !ended) {
        ended = true;
        const g = gen;
        setTimeout(() => { if (g === gen) showEndPanel(); }, 700); // 让终局横幅先演完（跨局代际防护）
        return;
      }
      await afterAction();
    } catch (e) {
      console.warn(e);
      showHintFlash(String(e.message || e));
      aiErrorGuard(); // AI 驱动链异常兜底：绝不允许永久停在"对方行动中"
    } finally {
      busy = false;
      renderAll();
      autosaveNow(); // 有对局存快照；终局/无对局时 snapshot()=null → 清除断档
    }
  }

  // AI 行动异常兜底：AI 发起的动作抛错时驱动链断裂，此处补一步合法兜底动作（弃响应/结束回合）。
  // 兜底永远尝试（否则 pending 卡死无解）；频繁异常时提示玩家，顶部「重新开局/返回港口」始终可用。
  let aiErrs = 0;
  function aiErrorGuard() {
    if (!G || G.winner !== null) return;
    const aiToAct = G.active === FOE || (G.pending && G.pending.target.side === FOE);
    if (!aiToAct) return; // 玩家操作异常：hint 已提示原因，不需兜底
    if (++aiErrs > 3) toast('对方行动连续异常，已自动兜底处理；如仍异常请「重新开局」', 'error');
    try {
      if (G.pending) O.applyAction(G, { t: G.pending.kind === 'block' ? 'passBlock' : 'passCounter', side: FOE });
      else O.applyAction(G, { t: 'endTurn', side: FOE });
      renderAll();
      afterAction();
    } catch (e2) {
      showHintFlash('本局对战发生异常——请点顶部「重新开局」或「返回港口」');
    }
  }

  async function afterAction() {
    if (G.winner !== null) return;
    if (G.pending) {
      if (G.pending.target.side === MY) openResponsePanel();
      else scheduleAI(aiRespond, AI_DELAY);
      return;
    }
    if (G.active === FOE) { scheduleAI(aiStep, AI_DELAY); }
  }

  // 代际号守卫的 AI 调度：旧局的定时回调不允许驱动新局
  function scheduleAI(fn, delay) {
    const g = gen;
    setTimeout(() => { if (g !== gen) return; fn(); }, delay);
  }

  // AI 驱动（busy=演出占用时重新调度自己；决策异常时安全弃权——链在任何情况下不可断）
  function aiStep() {
    if (!G || G.winner !== null) return;
    if (G.pending || G.active !== FOE) return;
    if (busy) { scheduleAI(aiStep, AI_DELAY); return; } // 演出中：稍后重试，驱动链保持
    let a;
    try { a = ai.choose(G, O.listActions(G)); } catch (e) { console.warn('ai choose failed', e); a = null; }
    doAction(a || { t: 'endTurn', side: FOE }); // 决策异常/无动作：安全结束回合
  }
  function aiRespond() {
    if (!G || G.winner !== null) return;
    if (!G.pending || G.pending.target.side !== FOE) return;
    if (busy) { scheduleAI(aiRespond, AI_DELAY); return; } // 同上：响应链不可断
    let a;
    try { a = ai.choose(G, O.listActions(G)); } catch (e) { console.warn('ai choose failed', e); a = null; }
    doAction(a || { t: G.pending.kind === 'block' ? 'passBlock' : 'passCounter', side: FOE }); // 异常兜底：放弃响应
  }

  function addLogLine(action) {
    const body = $('logBody');
    const line = document.createElement('div');
    line.className = 'log-line ' + (action.side === MY ? 'me' : '');
    const names = {
      playCharacter: '召唤角色', playEvent: '发动事件', playStage: '布置舞台',
      attack: '发起攻击', block: '阻挡!', counter: '反击!', giveDon: '附着 DON!!',
      endTurn: '结束回合', passBlock: '放弃阻挡', passCounter: '放弃反击',
    };
    line.textContent = `${action.side === MY ? '我方' : '敌方'} · ${names[action.t] || action.t}`;
    body.prepend(line);
    while (body.children.length > 18) body.lastChild.remove();
  }

  // kind: 'error'（非法操作，配错误音）| 'info'（信息提示，不出声）
  function showHintFlash(msg, kind = 'error') {
    if (!hint) {
      hint = document.createElement('div'); hint.id = 'hint';
      document.body.appendChild(hint);
    }
    if (kind === 'error') sfx('error');
    hint.textContent = msg;
    hint.classList.add('warn');
    if (hintTimer) clearTimeout(hintTimer);
    hintTimer = setTimeout(() => { hintTimer = null; if (G) renderHints(); }, 1600);
  }

  // ===== 响应面板 =====
  function openResponsePanel() {
    const p = G.pending;
    const foe = G.players[FOE];
    const atkUnit = p.attacker.type === 'leader' ? foe.leader : foe.board[p.attacker.idx];
    const defUnit = p.target.type === 'leader' ? G.players[MY].leader : G.players[MY].board[p.target.idx];
    const atkP = p.attacker.type === 'leader' ? O.leaderPower(foe) : O.powerOfUnit(atkUnit);
    const defP = (p.target.type === 'leader' ? O.leaderPower(G.players[MY]) : O.powerOfUnit(defUnit)) + p.counterBoost;
    $('responseTitle').textContent = p.kind === 'block' ? '对方攻击！要阻挡吗？' : '反击窗口';
    $('responseDesc').textContent = `${atkUnit.name} ${atkP} → ${defUnit.name} ${defP}${p.kind === 'counter' ? '（可用反击牌累积战力）' : ''}`;
    const box = $('responseOptions');
    box.innerHTML = '';
    const me = G.players[MY];
    if (p.kind === 'block') {
      me.board.forEach((u, i) => {
        if (!u.rest && (u.keywords || []).includes('blocker')) {
          const o = document.createElement('div');
          o.className = 'resp-opt';
          o.innerHTML = `<div class="lbl">${u.name}</div><div class="detail">战力 ${O.powerOfUnit(u)} · 阻挡</div>`;
          o.onclick = () => { sfx('click'); closeAndAct({ t: 'block', side: MY, idx: i }); };
          box.appendChild(o);
        }
      });
    } else {
      me.hand.forEach((c, i) => {
        if (c.counter) {
          const o = document.createElement('div');
          o.className = 'resp-opt';
          o.innerHTML = `<div class="lbl">${c.name}</div><div class="detail">+${c.counter / 1000}K 反击</div>`;
          o.onclick = () => {
            sfx('click');
            // 窗口保持开放：反击后继续显示，直到放弃
            doAction({ t: 'counter', side: MY, cards: [i] }).then(() => {
              if (G && G.pending && G.pending.kind === 'counter') openResponsePanel();
            });
          };
          box.appendChild(o);
        }
      });
    }
    $('btnPass').textContent = p.kind === 'block' ? '不阻挡，继续' : '放弃反击，结算';
    $('responsePanel').classList.remove('hidden');
  }
  function closeAndAct(a) {
    $('responsePanel').classList.add('hidden');
    doAction(a);
  }
  $('btnPass').onclick = () => {
    const p = G && G.pending;
    if (!p) return;
    sfx('click');
    closeAndAct({ t: p.kind === 'block' ? 'passBlock' : 'passCounter', side: MY });
  };

  // ===== 交互绑定 =====
  $('myHand').addEventListener('click', (e) => {
    const card = e.target.closest('.card'); if (!card) return;
    const idx = +card.dataset.handIdx;
    const c = G && G.players[MY] && G.players[MY].hand[idx];
    if (!c) return;
    const why = handLockReason(c);
    if (why) { showHintFlash(why); return; } // 不可出：给出具体原因
    doAction({ t: c.type === 'char' ? 'playCharacter' : c.type === 'event' ? 'playEvent' : 'playStage', side: MY, idx });
  });

  $('myBoard').addEventListener('click', (e) => {
    const card = e.target.closest('.card'); if (!card) return;
    if (G.pending || G.active !== MY) return;
    if (selMode === 'don') {
      doAction({ t: 'giveDon', side: MY, to: { type: 'char', idx: +card.dataset.myIdx }, count: 1 });
      return;
    }
    const idx = +card.dataset.myIdx;
    const u = G.players[MY].board[idx];
    if (u.rest) { showHintFlash('该单位已横置'); return; }
    // 再次点击同一单位 = 取消攻击选择（明确的取消方式）
    if (selMode && selMode.mode === 'attack' && selMode.attacker.type === 'char' && selMode.attacker.idx === idx) {
      selMode = null; clearHighlights(); renderHints(); return;
    }
    selMode = { attacker: { side: MY, type: 'char', idx }, mode: 'attack' };
    highlightTargets();
    renderHints();
  });

  $('enemyBoard').addEventListener('click', (e) => {
    const card = e.target.closest('.card'); if (!card) return;
    if (!selMode || selMode.mode !== 'attack') return;
    const idx = +card.dataset.foeIdx;
    const u = G.players[FOE].board[idx];
    if (!u.rest) { showHintFlash('只能攻击已横置的单位或领袖'); return; }
    const a = { t: 'attack', side: MY, attacker: selMode.attacker, target: { type: 'char', idx } };
    selMode = null;
    clearHighlights();
    doAction(a);
  });

  $('enemyLeaderSlot').addEventListener('click', () => {
    if (!selMode || selMode.mode !== 'attack') return;
    const a = { t: 'attack', side: MY, attacker: selMode.attacker, target: 'leader' };
    selMode = null;
    clearHighlights();
    doAction(a);
  });

  $('myLeaderSlot').addEventListener('click', () => {
    if (G.pending || G.active !== MY) return;
    if (selMode && selMode.mode === 'don') {
      doAction({ t: 'giveDon', side: MY, to: { type: 'leader' }, count: 1 });
      return;
    }
    const L = G.players[MY].leader;
    if (selMode && selMode.mode === 'attack' && selMode.attacker.type === 'leader') {
      selMode = null; clearHighlights(); renderHints(); return; // 再次点击领袖 = 取消
    }
    if (L.rest) { showHintFlash('领袖已横置'); return; }
    selMode = { attacker: { side: MY, type: 'leader' }, mode: 'attack' };
    highlightTargets();
    renderHints();
  });

  $('myDon').addEventListener('click', () => {
    if (G.pending || G.active !== MY) return;
    if (selMode && selMode.mode === 'don') { selMode = null; clearHighlights(); renderHints(); return; }
    if (O.usableDons(G.players[MY]) < 1) { showHintFlash('没有可用 DON!!'); return; }
    selMode = { mode: 'don' };
    highlightDonTargets();
    renderHints();
  });

  function highlightTargets() {
    clearHighlights();
    const foe = G.players[FOE];
    const leadWrap = $('enemyLeaderSlot');
    leadWrap.querySelector('.card')?.classList.add('targetable');
    foe.board.forEach((u, i) => {
      if (u.rest) $('enemyBoard').children[i]?.classList.add('targetable');
    });
    markSelected();
  }
  function highlightDonTargets() {
    clearHighlights();
    $('myLeaderSlot').querySelector('.card')?.classList.add('targetable');
    G.players[MY].board.forEach((_, i) => $('myBoard').children[i]?.classList.add('targetable'));
  }
  // 攻击者选中标记：选完目标前，攻击者保持明显"已选中"态（可发现性）
  function markSelected() {
    if (!selMode || selMode.mode !== 'attack' || !selMode.attacker) return;
    if (selMode.attacker.type === 'char') $('myBoard').children[selMode.attacker.idx]?.classList.add('selected');
    else $('myLeaderSlot').querySelector('.card')?.classList.add('selected');
  }
  function clearHighlights() {
    document.querySelectorAll('.targetable').forEach((el) => el.classList.remove('targetable'));
    document.querySelectorAll('.card.selected').forEach((el) => el.classList.remove('selected'));
  }

  $('btnEnd').onclick = () => {
    if (G && !G.pending && G.active === MY) { sfx('click'); doAction({ t: 'endTurn', side: MY }); }
  };

  // ===== 键盘与焦点管理 =====
  const MODAL_IDS = ['setupPanel', 'responsePanel', 'helpPanel', 'builderPanel', 'endPanel'];
  let focusReturn = null;
  const isVisible = (id) => { const el = $(id); return !!el && !el.classList.contains('hidden'); };

  function initFocusManager() {
    const observer = new MutationObserver(() => {
      for (const id of MODAL_IDS) {
        const panel = $(id); if (!panel) continue;
        const visible = !panel.classList.contains('hidden');
        if (visible && !panel.dataset.focusManaged) {
          panel.dataset.focusManaged = '1';
          const active = document.activeElement;
          if (active && !panel.contains(active)) focusReturn = active;
          const target = panel.querySelector('button:not([disabled]), select, input, [tabindex]:not([tabindex="-1"])');
          if (target) { try { target.focus({ preventScroll: true }); } catch (e) { /* 老浏览器 */ } }
          if (id === 'setupPanel') refreshResume(); // 大厅出现时重查断档
        } else if (!visible && panel.dataset.focusManaged) {
          delete panel.dataset.focusManaged;
          if (focusReturn) {
            try { focusReturn.focus({ preventScroll: true }); } catch (e) { /* 目标已移除 */ }
          }
          focusReturn = null;
        }
      }
    });
    MODAL_IDS.forEach((id) => {
      const el = $(id);
      if (el) observer.observe(el, { attributes: true, attributeFilter: ['class'] });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      // 引导层激活时 Escape 归 onboarding.js（跳过教程），此处不抢
      const ob = window.OPTCG_ONBOARDING;
      if (ob && typeof ob.active === 'function' && ob.active()) return;
      // 进行中的攻击/DON 选择：Escape 先取消选择（玩家随时可退出半成品操作）
      if (selMode) { selMode = null; clearHighlights(); renderHints(); return; }
      // 只关最上层可关面板：helpPanel > builderPanel；
      // endPanel 不关（防误触丢结算）；responsePanel 不关（响应必须显式选择）
      if (isVisible('helpPanel')) { sfx('click'); $('helpPanel').classList.add('hidden'); }
      else if (isVisible('builderPanel')) { sfx('click'); $('builderPanel').classList.add('hidden'); }
    });
    // 卡牌键盘可达：Tab 聚焦后 Enter/Space 触发点击（与鼠标同一委托链路）
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const el = e.target && e.target.closest && e.target.closest('.card');
      if (el && el.tabIndex === 0) { e.preventDefault(); el.click(); }
    });
  }

  // ===== 开局 =====
  function deckOf(color) {
    const cs = O.POOL.cards.filter((c) => c.color === color);
    const deck = [];
    for (const c of cs) for (let i = 0; i < 4; i++) deck.push(c);
    return deck.slice(0, 50);
  }

  function setupUI() {
    const grid = $('leaderChoices');
    const capList = CAP().LIST;
    capList.forEach((c) => {
      const leader = O.POOL.leaders.find((l) => l.color === c.color);
      if (!leader) return;
      const rar = CAP().RARITY[c.rarity] || CAP().RARITY.common;
      const pick = document.createElement('button');
      pick.type = 'button';
      pick.className = `captain-card r-${c.rarity}`;
      pick.dataset.color = c.color;
      pick.style.setProperty('--fc', c.factionColor);
      pick.style.setProperty('--ac', c.accentColor);
      pick.innerHTML = `
        <span class="cc-top">
          <span class="cc-emblem">${CAP().icon((CAP().FACTION[c.color] || {}).emblem)}</span>
          <span class="cc-faction">${c.faction}</span>
          <span class="cc-rarity" style="--rc:${rar.color}">${rar.name}</span>
        </span>
        <span class="cc-art">
          <img src="${c.image}" alt="${c.name}" loading="lazy" style="object-position:${c.imagePosition || 'center 18%'}"
            onerror="this.src=window.OPTCG_CAPTAINS.fallbackArt('${c.color}')">
          <span class="cc-veil"></span>
          <span class="cc-hp">${CAP().icon('heart')} ${c.hp / 1000}K</span>
        </span>
        <span class="cc-body">
          <span class="cc-name">${c.name}</span>
          <span class="cc-title">${c.title}</span>
          <span class="cc-ability"><b>${c.abilityName}</b>${c.abilityDescription}</span>
        </span>
        <span class="cc-foot">
          <span class="cc-no">${c.cardNumber}</span>
          <span class="cc-life">生命 ${c.life}</span>
          <span class="cc-on">${CAP().icon('check')} 出战</span>
        </span>`;
      pick.onclick = () => { sfx('click'); setLeaderColor(c.color); };
      grid.appendChild(pick);
    });
    $('btnStart').onclick = () => {
      const b = $('btnStart');
      if (b.disabled) return; // 双击防护
      b.disabled = true;
      sfx('click');
      try { startGame(); } finally { b.disabled = false; }
    };
    $('btnHelp').innerHTML = CAP().icon('map') + '<span>说明</span>';
    $('btnRestart').innerHTML = CAP().icon('rotateCcw') + '<span>重新开局</span>';
    $('btnMenu').innerHTML = CAP().icon('undo2') + '<span>返回港口</span>';
    $('btnHelp').title = '玩法说明';
    $('btnRestart').title = '重新开局';
    $('btnRestart').setAttribute('aria-label', '重新开局');
    $('btnMenu').title = '返回港口';
    $('btnMenu').setAttribute('aria-label', '返回港口');
    $('btnRestart').onclick = async () => {
      sfx('click');
      if (G && G.winner === null && !(await uiConfirm('放弃当前对局，重新开局？', { okText: '重新开局' }))) return;
      restartGame();
    };
    $('btnHelp').onclick = () => { sfx('click'); openHelp(); };
    $('btnHallHelp').onclick = () => { sfx('click'); openHelp(); };
    $('btnHelpClose').onclick = () => { sfx('click'); $('helpPanel').classList.add('hidden'); };
    $('btnMenu').onclick = async () => {
      sfx('click');
      // 天梯/生存的投降结算归 OPTCG_MODES（settle）裁量，此处只管回大厅
      if (G && G.winner === null && !(await uiConfirm('投降并返回港口？当前对局将判负', { okText: '投降返回' }))) return;
      backToMenu();
    };
    $('btnRematch').onclick = () => {
      sfx('click');
      const ctx = gameCtx;
      $('endPanel').classList.add('hidden');
      if (!ctx) { startGame(); return; }
      if (ctx.mode === 'free') startGame({ leaderColor: ctx.leaderColor, deck: ctx.deckRef });
      else if (window.OPTCG_MODES) window.OPTCG_MODES.restart(ctx);
      else startGame();
    };
    $('btnBackMenu').onclick = () => { sfx('click'); backToMenu(); };
    const rb = $('btnResume');
    if (rb) rb.onclick = () => {
      sfx('click');
      let okResume = false;
      try {
        okResume = !!(window.OPTCG_SAVE && typeof window.OPTCG_SAVE.resume === 'function' && window.OPTCG_SAVE.resume());
      } catch (e) { okResume = false; }
      if (!okResume) refreshResume(); // 恢复失败（坏档已被 save 层清除）→ 刷新按钮可见性
    };
  }

  // 大厅「继续上次对局」按钮可见性：save 层有断档才显示
  function refreshResume() {
    const b = $('btnResume'); if (!b) return;
    let has = false;
    try {
      has = !!(window.OPTCG_SAVE && typeof window.OPTCG_SAVE.hasUnfinished === 'function' && window.OPTCG_SAVE.hasUnfinished());
    } catch (e) { has = false; }
    b.classList.toggle('hidden', !has);
  }

  function startGame(opts = {}) {
    let color = opts.leaderColor || myLeaderColor;
    if (!color) {
      // 新玩家未选船长：默认船长直接可玩（可玩性优先，不设前置门槛）
      color = (O.POOL.leaders[0] || {}).color || 'red';
      setLeaderColor(color);
      toast('未选船长，已为你出战默认船长');
    }
    const deckA = opts.deck && opts.deck.length === 50 ? opts.deck : deckOf(color);
    const foeColors = O.POOL.leaders.map((l) => l.color).filter((c) => c !== color);
    const foeColor = opts.foeColor || foeColors[Math.floor(Math.random() * foeColors.length)];
    const myLeader = O.POOL.leaders.find((l) => l.color === color);
    const foeLeader = O.POOL.leaders.find((l) => l.color === foeColor);
    G = O.newGame({
      leaderA: myLeader, deckA,
      leaderB: foeLeader, deckB: deckOf(foeColor),
      seed: (Date.now() % 100000) + 1,
    });
    aiErrs = 0;
    ai = O.createAI(opts.level || $('aiLevel').value);
    gameCtx = opts.ctx || { mode: 'free', leaderColor: color, deckRef: deckA };
    ended = false;
    logSeen = G.log.length;
    myLeaderColor = color;
    selMode = null;
    gen++;                 // 新对局代际：旧局定时器/autoplay 全部失效
    stopAutoplayTimer();
    $('logBody').innerHTML = '';
    ['setupPanel', 'endPanel', 'responsePanel', 'helpPanel', 'builderPanel'].forEach((id) => $(id).classList.add('hidden'));
    showBanner('DUEL!', '');
    renderAll();
    showHintFlash(`对手：${foeLeader.name}（${COLOR_NAME[foeColor]}）`, 'info');
    autosaveNow(); // 开局即留档：AI 回合中崩溃/关页也可恢复
    requestAnimationFrame(fitTableView); // 进局后按当前视口重适配（banner/hand 渲染完）
  }

  function backToMenu() {
    gen++;
    stopAutoplayTimer();
    G = null; ai = null; gameCtx = null; ended = false; selMode = null;
    ['endPanel', 'responsePanel', 'helpPanel'].forEach((id) => $(id).classList.add('hidden'));
    $('setupPanel').classList.remove('hidden');
    try { window.OPTCG_SAVE && typeof window.OPTCG_SAVE.autosave === 'function' && window.OPTCG_SAVE.autosave(null); } catch (e) { /* 静默 */ }
    if (window.OPTCG_MODES) window.OPTCG_MODES.refreshMenu();
    refreshResume();
  }

  // 终局结算面板（模式层 settle 在此挂接）
  function showEndPanel() {
    if (!G || G.winner === null) return;
    const win = G.winner === MY;
    let detail = `历时 ${G.turn} 回合 · 我方生命 ${G.players[MY].life.length} 张`;
    if (gameCtx && window.OPTCG_MODES) {
      const s = window.OPTCG_MODES.settle(gameCtx, win);
      if (s) detail = s + '<br>' + detail;
    }
    $('endTitle').innerHTML = (win ? CAP().icon('trophy') + ' 胜利！' : CAP().icon('skull') + ' 战败');
    $('endTitle').className = 'end-title' + (win ? '' : ' defeat');
    $('endDetail').innerHTML = detail;
    $('endPanel').classList.remove('hidden');
    try { window.OPTCG_SAVE && typeof window.OPTCG_SAVE.autosave === 'function' && window.OPTCG_SAVE.autosave(null); } catch (e) { /* 静默 */ }
  }

  function setLeaderColor(c) {
    myLeaderColor = c;
    document.querySelectorAll('#leaderChoices .captain-card')
      .forEach((x) => x.classList.toggle('pick', x.dataset.color === c));
  }

  // ===== 重新开局：按当前配置（船长/难度/模式）再打一局 =====
  function restartGame() {
    if (!myLeaderColor) { backToMenu(); return; }
    if (gameCtx && gameCtx.mode !== 'free' && window.OPTCG_MODES) { window.OPTCG_MODES.restart(gameCtx); return; }
    startGame({ leaderColor: myLeaderColor, level: $('aiLevel').value, ctx: gameCtx });
  }

  // ===== 对局快照（断档恢复契约，save.js 回调）=====
  function snapshot() {
    if (!G || G.winner !== null) return null;
    try {
      return {
        g: JSON.parse(JSON.stringify(G)),
        ctx: gameCtx == null ? null : JSON.parse(JSON.stringify(gameCtx)),
        level: ai ? ai.level : null,
        ts: Date.now(),
      };
    } catch (e) { return null; }
  }

  function restoreFromSnapshot(snap) {
    try {
      if (!snap || !snap.g) return false;
      const g = snap.g;
      if (!Array.isArray(g.players) || g.players.length !== 2) return false;
      if (typeof g.turn !== 'number' || !('winner' in g)) return false;
      if (typeof g.active !== 'number') return false;
      for (const pl of g.players) {
        if (!pl || !pl.leader || !Array.isArray(pl.hand) || !Array.isArray(pl.board) || !Array.isArray(pl.deck)) return false;
      }
      if (g.winner !== null) return false; // 已终局的快照没有恢复意义
      gen++;
      stopAutoplayTimer();
      G = g;
      ai = O.createAI(AI_LEVELS.includes(snap.level) ? snap.level : 'normal');
      gameCtx = snap.ctx == null ? null : JSON.parse(JSON.stringify(snap.ctx));
      ended = false; selMode = null; busy = false;
      logSeen = Array.isArray(g.log) ? g.log.length : 0;
      if (g.players[MY].leader && g.players[MY].leader.color) myLeaderColor = g.players[MY].leader.color;
      $('logBody').innerHTML = '';
      ['setupPanel', 'endPanel', 'responsePanel', 'helpPanel', 'builderPanel'].forEach((id) => $(id).classList.add('hidden'));
      renderAll();
      autosaveNow();
      // 轮到 AI 或有待响应时重新驱动（复用 afterAction 的调度路径）
      if (g.pending) {
        if (g.pending.target.side === MY) openResponsePanel();
        else scheduleAI(aiRespond, AI_DELAY);
      } else if (g.active === FOE) {
        scheduleAI(aiStep, AI_DELAY);
      }
      return true;
    } catch (e) {
      return false; // 坏数据不崩，交由调用方（save.resume）清档
    }
  }

  // ===== 玩法说明（新手友好）=====
  function fillHelp() {
    const secs = [
      { ic: 'trophy', t: '胜利目标', p: '把<b>对方船长的生命扣到 0</b>即获胜。每次攻击对方船长，对方扣 1 张生命卡；对方牌库抽空也会判负。' },
      { ic: 'layers', t: '回合流程', p: '你的回合：<b>补 2 颗 DON!!</b>（费用豆）→ 抽 1 张牌 → 出牌 / 攻击 / 附着 → 点「结束回合」。DON!! 每回合自动补满，附着的算已消耗。' },
      { ic: 'map', t: '出牌', p: '手牌左上角圆标是<b>费用</b>，消耗对应数量 DON!! 即可打出：角色进场（场上最多 5 名）、事件立即生效、舞台持续支援。' },
      { ic: 'swords', t: '攻击', p: '点己方未行动的角色或船长 → 再点<b>对方船长</b>或<b>已横置的角色</b>发起攻击。我方战力 ≥ 对方战力即击沉（KO）对方角色；攻击船长则扣 1 张生命。刚出场的角色下回合才能攻击。' },
      { ic: 'heart', t: '生命与反击', p: '生命被扣时翻入手牌。手牌右下角带 <b>C 标记</b>的可作反击牌：在「反击窗口」打出，为本回合防守 <b>+战力</b>，可能反杀攻方。' },
      { ic: 'shield', t: '阻挡', p: '带<span class="kw">阻挡</span>词条的未横置角色可在响应面板选择挡刀：攻击转由它承受，战力不足则它被击沉、船长无伤。' },
      { ic: 'anchor', t: 'DON!! 附着', p: '点左下费用区 → 点己方角色或船长，附着 1 颗 DON!! <b>+1000 战力</b>，攻防皆受益。附着后的 DON 本回合不可再用，规划好节奏。' },
      { ic: 'sparkles', t: '关键词', p: '<span class="kw">速攻</span>：出场当回合即可攻击；<span class="kw">双击</span>：一回合攻击两次；<span class="kw">放逐</span>：扣的生命直接进墓场不进手牌；<span class="kw">阻挡</span>：可为船长挡刀。' },
      { ic: 'compass', t: '两种模式', p: '<b>天梯排位</b>：胜 +25 分、败 −15 分，分数升段位、敌将变强；<b>生存挑战</b>：连胜不断升档，一败归零、记录最佳连胜。' },
    ];
    $('helpBody').innerHTML = secs.map((s) =>
      `<div class="help-sec"><span class="hs-ic">${CAP().icon(s.ic)}</span><div><h4>${s.t}</h4><p>${s.p}</p></div></div>`).join('');
  }
  function openHelp() { fillHelp(); $('helpPanel').classList.remove('hidden'); }

  // 模式层入口（modes.js 使用；free 局直接用 startGame）
  window.OPTCG_GAME = {
    startGame, backToMenu, setLeaderColor,
    leaderColor: () => myLeaderColor,
    cardEl,
    state: () => (G && {
      winner: G.winner, turn: G.turn, active: G.active,
      pending: G.pending ? { kind: G.pending.kind, targetSide: G.pending.target.side } : null,
    }),
    autoplay, // 调试/自测：自动走 n 步（我方随机、响应自动放弃）
    snapshot, restoreFromSnapshot, // 断档恢复契约（save.js resume 回调）
    _diag: () => { // 调试/测试专用：当前 pending 与合法动作列表（勿在玩法逻辑中使用）
      try { return G && { turn: G.turn, pending: G.pending || null, acts: (O.listActions(G) || []).map((a) => a.t) }; } catch (e) { return null; }
    },
  };
  window.OPTCG_UI = { toast, confirm: uiConfirm }; // 统一反馈层（modes.js/save.js 共用）

  setupUI();
  initFocusManager();
  refreshResume();
  $('myHand').addEventListener('scroll', updateHandFades, { passive: true });
  addEventListener('resize', updateHandFades);

  // ===== 牌桌视口适配（fit-to-viewport）=====
  // body overflow:hidden 下 #app 固定行高布局的 min 内容需求 ~780px：视口更矮（浏览器缩放/小屏/半屏窗）时
  // 底部手牌与结束回合按钮被裁且无法滚动。做法：内容需求超出视口时对 #app 整体等比缩小（origin top center）；
  // 视口足够时 grid 弹性行自然填满（scrollHeight≡clientHeight，k=1 不缩不放大）。
  // toast/模态/战报/提示条/特效层均挂 body（#app 外），不受缩放影响。
  function fitTableView() {
    const app = $('app');
    if (!app) return;
    app.style.transform = 'none';
    const need = app.scrollHeight; // 内容需求高（grid track 被 min-content 撑出的溢出也计入）
    const have = app.clientHeight; // height:100% = 视口分配高
    const k = Math.min(1, have / need);
    app.style.transform = k > 0.995 ? '' : `scale(${k.toFixed(3)})`;
    app.style.transformOrigin = 'top center';
  }
  addEventListener('resize', fitTableView);
  // compact-layout 切换/未来任何 html 级布局类变化 → 卡尺寸变量变 → 重适配
  new MutationObserver(fitTableView).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  fitTableView();

  // ===== 调试钩子：?autostart=red&level=easy&autoplay=8 自动开局并走 N 步（截图/回归用）=====
  function stopAutoplayTimer() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }
  function autoplay(n) {
    stopAutoplayTimer(); // 并发调用只保留最新一个
    let i = 0;
    autoTimer = setInterval(() => {
      if (!G || G.winner !== null) { stopAutoplayTimer(); return; } // 局没了/已终局：自我清理，不空转
      if (busy) return;
      if (G.pending && G.pending.target.side === MY) { doAction({ t: G.pending.kind === 'block' ? 'passBlock' : 'passCounter', side: MY }); return; }
      if (G.active !== MY) return;
      const acts = O.listActions(G).filter((a) => a.t !== 'takeDon' && a.t !== 'giveDon');
      if (!acts.length) return;
      doAction(acts[i % acts.length]);
      if (++i >= n) stopAutoplayTimer();
    }, 420);
  }

  const qs = new URLSearchParams(location.search);
  if (qs.get('open') === 'help') openHelp(); // 截图/回归用
  if (qs.get('autostart')) {
    const level = qs.get('level') || 'normal';
    myLeaderColor = qs.get('autostart');
    $('aiLevel').value = level;
    startGame({ leaderColor: myLeaderColor, level });
    const n = +(qs.get('autoplay') || 0);
    if (n > 0) autoplay(n);
  }
})();
