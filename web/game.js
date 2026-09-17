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
  const KW_LABEL = { rush: '速攻', blocker: '坚壁', doubleAttack: '双击', banish: '猛击' };
  // 恶魔果实三系（克制环：超人→自然→动物→超人，攻击方克制防守方 +1K）
  const FRUIT_LABEL = { paramecia: '超人', logia: '自然', zoan: '动物' };
  const FRUIT_TIP = {
    paramecia: '超人系果实：克自然系——攻击自然系目标（含船长）时战力 +1K',
    logia: '自然系果实：克动物系——攻击动物系目标（含船长）时战力 +1K',
    zoan: '动物系果实：克超人系——攻击超人系目标（含船长）时战力 +1K',
  };
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
  let fxDirty = false; // 画布脏标记：上次已清空且无粒子时跳过 clearRect（空闲帧零成本）
  (function fxLoop() {
    requestAnimationFrame(fxLoop);
    if (!particles.length) {
      if (fxDirty) { fctx.clearRect(0, 0, fxCanvas.width, fxCanvas.height); fxDirty = false; }
      return;
    }
    fxDirty = true;
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
    // 场上单位战力实时化：livePower 由 renderAll 传入（含费用豆/装备/buff）；手牌·图鉴·构筑器显示卡面基础值
    const shownPower = opts.livePower != null ? opts.livePower : def.power;
    const el = document.createElement('div');
    el.className = `card ${def.color}` + (opts.cls ? ' ' + opts.cls : '');
    el.dataset.cardId = def.id;
    el.tabIndex = 0; // 键盘可达（Enter/Space 激活，委托见 initFocusManager）
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', def.name + (def.cost != null ? `，费用 ${def.cost}` : '') + (def.power ? `，战力 ${def.power / 1000}K` : '') + (def.fruit ? `，${FRUIT_LABEL[def.fruit]}系` : ''));
    const fruitHtml = def.fruit ? `<span class="kw-badge fr-${def.fruit}">${FRUIT_LABEL[def.fruit]}系</span>` : '';
    // 船长技能徽章（批3：六色差异化技能，卡面金字标记，悬停看详情）
    const skillHtml = def.type === 'leader' && def.skill ? `<span class="kw-badge kw-skill" title="${def.skill}">${def.skill}</span>` : '';
    // 装备：卡面「装备」徽章 + 增益角标（武器纯攻 / 甲胄含坚壁）；已装上的单位在词条区亮出装备名
    const gearDefHtml = def.type === 'gear' && def.gear
      ? `<span class="kw-badge kw-gear">装备</span>${def.gear.gives ? def.gear.gives.map((k) => `<span class="kw-badge kw-${k}">${KW_LABEL[k] || k}</span>`).join('') : ''}` : '';
    const unitGearHtml = (def.gears || []).map((g) => `<span class="kw-badge kw-gear-on" title="已装备 ${g.name}">⚔${g.name}</span>`).join('');
    const kwHtml = gearDefHtml + unitGearHtml + skillHtml + fruitHtml + (def.keywords || []).map((k) => `<span class="kw-badge kw-${k}">${KW_LABEL[k] || k}</span>`).join('');
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
      ${shownPower ? `<div class="power"${opts.livePower != null && opts.livePower !== def.power ? ' title="含费用豆/装备/增益的当前战力"' : ''}>${shownPower / 1000}K</div>` : ''}
      ${def.type === 'gear' && def.gear ? `<div class="power gear-atk">+${def.gear.atk / 1000}K</div>` : ''}
      ${def.counter ? `<div class="counter-badge">反击 ${def.counter / 1000}K</div>` : ''}
    `;
    // 悬停详情交给 #cardTip（initCardTip）；原生 title 移除避免与富信息卡双弹
    if ((def.keywords || []).length) el.setAttribute('aria-label', el.getAttribute('aria-label') + '，' + def.keywords.map((k) => KW_LABEL[k] || k).join('/'));
    return el;
  }

  function leaderEl(pl, side) {
    const el = cardEl(pl.leader, { cls: 'leader' + (pl.leader.rest ? ' rest' : ''), livePower: O.leaderPower(pl) });
    const wrap = document.createElement('div');
    wrap.style.position = 'relative';
    wrap.tabIndex = 0;
    wrap.setAttribute('role', 'button');
    wrap.setAttribute('aria-label', pl.leader.name + (side === MY ? '（我方船长）' : '（对方船长）'));
    wrap.appendChild(el);
    el.dataset.dons = pl.leader.dons || 0; // 悬停信息卡读（船长附着 DON 数）
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
    if (G.pending) return '对方攻击中——反击窗口处理中，稍候';
    if (G.active !== MY) return '对方回合，暂时无法出牌';
    const me = G.players[MY];
    if (c.type === 'char' && me.board.length >= 5) return '场上已满 5 名角色，无法再召唤';
    if (c.type === 'gear' && me.board.length === 0) return '场上没有角色可装备——先召唤一名角色';
    const usable = O.usableDons(me);
    if (c.cost > usable) return `费用不足：还差 ${c.cost - usable} 颗费用豆（当前能花 ${usable} 颗，附着到卡上的算已消耗）`;
    return null;
  }

  // LP 积分条（游戏王式：扣到 0 判负）
  function lpBar(pl) {
    const max = pl.leader.life * 2000;
    const lp = Math.max(0, pl.lp);
    const pct = Math.max(0, Math.min(100, lp / max * 100));
    const low = lp <= 3000 ? ' low' : '';
    return `<div class="lp-badge${low}" role="meter" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${lp}" aria-label="LP 积分">`
      + `<span class="lp-label">LP</span><b class="lp-num">${lp}</b>`
      + `<div class="lp-bar"><i style="width:${pct}%"></i></div></div>`;
  }

  // ===== 主渲染 =====
  function renderAll() {
    if (!G) return;
    if (cardTipHide) cardTipHide(); // 重渲染会替换卡元素：悬停信息卡先收起，鼠标微动即按新场面重出
    const me = G.players[MY], foe = G.players[FOE];
    $('turnNo').textContent = `回合 ${G.turn}`;
    const myTurn = G.active === MY && !G.pending;
    const badge = $('phaseBadge');
    badge.textContent = G.pending ? '响应!' : (G.active === MY ? '你的回合' : '敌方回合');
    badge.className = 'phase-badge' + (G.active === FOE ? ' enemy' : '');

    // 对手
    const foeLeaderSlot = $('enemyLeaderSlot');
    foeLeaderSlot.innerHTML = ''; foeLeaderSlot.appendChild(leaderEl(foe, FOE));
    $('enemyLife').innerHTML = lpBar(foe);
    $('enemyDon').innerHTML = foe.donArea.map((d) => donEl(d).outerHTML).join('');
    $('enemyBoard').innerHTML = '';
    foe.board.forEach((u, i) => {
      const el = cardEl(u, { cls: (u.rest ? 'rest ' : ''), livePower: O.powerOfUnit(u) });
      el.dataset.foeIdx = i;
      el.dataset.dons = u.dons || 0; // 悬停信息卡读（附着 DON 数）
      $('enemyBoard').appendChild(el);
    });
    $('enemyStage').innerHTML = '';
    if (foe.stage) $('enemyStage').appendChild(cardEl(foe.stage, { cls: 'stage-mini' }));
    // 卡背最多画 8 张（宽度有界：9+ 张时会连数字徽章一起把 sub-row 撑出屏），真实张数看徽章
    $('enemyHand').innerHTML = foe.hand.slice(0, 8).map(() => '<span class="card-back"></span>').join('')
      + `<span class="hand-count" title="对方手牌 ${foe.hand.length} 张">手牌 ${foe.hand.length}</span>`;
    $('enemyGrave').innerHTML = `墓 <b>${foe.trash.length}</b>`;

    // 己方
    const myLeaderSlot = $('myLeaderSlot');
    myLeaderSlot.innerHTML = ''; myLeaderSlot.appendChild(leaderEl(me, MY));
    $('myLife').innerHTML = lpBar(me);
    $('myDon').innerHTML = me.donArea.map((d) => donEl(d).outerHTML).join('');
    $('myDon').classList.toggle('can-act', myTurn && O.usableDons(me) > 0);
    $('myBoard').innerHTML = '';
    me.board.forEach((u, i) => {
      const canAtk = myTurn && !u.rest && (u.playedTurn < G.turn || (u.keywords || []).includes('rush'));
      const el = cardEl(u, { cls: (u.rest ? 'rest ' : '') + (canAtk ? 'playable' : ''), livePower: O.powerOfUnit(u) });
      el.dataset.myIdx = i;
      el.dataset.dons = u.dons || 0; // 悬停信息卡读（附着 DON 数）
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
    else if (G.pending && G.pending.target.side === MY) text = '对方攻击——选择反击牌或放弃（无反击牌时自动结算）';
    else if (selMode && selMode.mode === 'attack') text = '选择攻击目标（对方场上有角色须先打角色；再点攻击者可取消）';
    else if (selMode && selMode.mode === 'don') text = '选择费用豆附着目标（点己方单位，再点费用区取消）';
    else if (selMode && selMode.mode === 'gear') text = '选择要装备的角色（点己方场上单位；半亮=已带装备，再装会替换旧件；再点该装备卡取消）';
    else if (myTurn) text = '你的回合：点手牌出牌 · 点单位攻击 · 点费用豆附着';
    else text = '对方行动中…';
    if (hint.textContent !== text) hint.textContent = text;
    hint.classList.remove('warn');
  }

  // ===== 演出播放器 =====
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let lastClash = null; // clash→lp 链：结算时浮出「攻K−守K=差K」算式（伤害来源透明化）
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
        lastClash = { a: ev.atkPower, d: ev.defPower }; // 供紧随的 lp 事件浮出算式
        document.body.classList.remove('shake');
        void document.body.offsetWidth; // 重启动画
        document.body.classList.add('shake');
        spawnRing(ev);
        if (ev.fruitEdge > 0) spawnDmg(innerWidth / 2 - 44, innerHeight / 2 - 84, '克制 +1K'); // 果实克制提示
        await sleep(420);
        break;
      }
      case 'lp': {
        const target = ev.side === MY ? $('myLife') : $('enemyLife');
        const badge = target.querySelector('.lp-badge');
        if (badge) {
          const r = badge.getBoundingClientRect();
          spawnDmg(r.left + r.width / 2, r.top, `-${Math.round(ev.dmg / 1000)}K`);
          // 结算透明度：数字从哪来的（攻K − 守K，试玩反馈「伤害明细不透明」）；非战斗扣血无算式
          if (lastClash) {
            spawnCalc(r.left + r.width / 2, r.top - 18, `${lastClash.a / 1000}K − ${lastClash.d / 1000}K = ${Math.round(ev.dmg / 1000)}K`);
            lastClash = null;
          }
          badge.classList.remove('hit'); void badge.offsetWidth; // 重启动画
          badge.classList.add('hit');
          burst(r.left + r.width / 2, r.top + r.height / 2, '#ff8a8a', 22, 4);
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
        showBanner('反击！', '');
        burst(innerWidth / 2, innerHeight / 2, '#8fd3ff', 30, 7);
        await sleep(700);
        break;
      }
      case 'noDamage': {
        // 0 伤害/无战果也必须有反馈（试玩反馈：直攻打不穿防线不掉积分，看起来像攻击失效）
        if (ev.reason !== 'power' && ev.reason !== 'defense') break; // gone：目标已不在场，静默
        const msg = ev.reason === 'defense'
          ? `守备坚固：${ev.atkPower / 1000}K 没能击破 ${ev.defPower / 1000}K 的守备——无战果`
          : `攻不破防线：${ev.defPower / 1000}K 防线不低于 ${ev.atkPower / 1000}K 攻势——0 积分伤害（附着费用豆提升战力再打）`;
        showHintFlash(msg, 'info');
        if (ev.reason === 'power') { // 直攻不掉分：防守方徽章上飘 0
          const tgt = ev.side === MY ? $('myLife') : $('enemyLife');
          const badge = tgt && tgt.querySelector('.lp-badge');
          if (badge) { const r = badge.getBoundingClientRect(); spawnDmg(r.left + r.width / 2, r.top, '0'); }
        }
        await sleep(500);
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
  // 浮字统一视口 clamp：absolute 元素右缘超窗会推高 document scrollWidth（e2e layout 曾量到 4px 横滚）
  function clampToViewport(el) {
    const r = el.getBoundingClientRect();
    if (r.right > innerWidth - 4) el.style.left = (el.offsetLeft - (r.right - innerWidth) - 6) + 'px';
    else if (r.left < 4) el.style.left = (el.offsetLeft + (4 - r.left)) + 'px';
  }
  function spawnDmg(x, y, text) {
    const d = document.createElement('div');
    d.className = 'dmg-num';
    d.textContent = text;
    d.style.left = (x - 20) + 'px';
    d.style.top = (y - 30) + 'px';
    document.body.appendChild(d);
    clampToViewport(d);
    setTimeout(() => d.remove(), 1100);
  }
  function spawnCalc(x, y, text) {
    const d = document.createElement('div');
    d.className = 'dmg-calc';
    d.textContent = text;
    d.style.left = (x - 44) + 'px';
    d.style.top = y + 'px';
    document.body.appendChild(d);
    clampToViewport(d);
    setTimeout(() => d.remove(), 1250);
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
      // 反击窗口收口：pending 已不是我方反击窗口（结算完/终局/换手）→ 收起面板。
      // 挂在 doAction 收尾，保证所有结算路径（含打出最后一张反击牌后的自动结算）都会关窗
      if (!(G && G.pending && G.pending.kind === 'counter' && G.pending.target.side === MY)) {
        $('responsePanel').classList.add('hidden');
      }
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
      if (G.pending) O.applyAction(G, { t: 'passCounter', side: FOE });
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
      if (G.pending.target.side === MY) handleMyPending();
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
    doAction(a || { t: 'passCounter', side: FOE }); // 异常兜底：放弃响应
  }

  function addLogLine(action) {
    const body = $('logBody');
    const line = document.createElement('div');
    line.className = 'log-line ' + (action.side === MY ? 'me' : '');
    const names = {
      playCharacter: '召唤角色', playEvent: '发动事件', playStage: '布置舞台', playGear: '装备武器',
      attack: '发起攻击', block: '阻挡!', counter: '反击!', giveDon: '附着费用豆',
      endTurn: '结束回合', passCounter: '放弃反击',
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
    // 2.6s：试玩反馈 1.6s 即逝几乎不可感知（读不完一句原因文案）
    hintTimer = setTimeout(() => { hintTimer = null; if (G) renderHints(); }, 2600);
  }

  // ===== 响应面板（游戏王式：仅反击窗口；无反击手段时自动结算不打扰）=====
  let autoPassSession = false; // 「本局不再询问」：本局所有反击窗口自动放弃结算
  function hasCounterCards() {
    const me = G && G.players[MY];
    return !!(me && me.hand.some((c) => c.counter));
  }
  // 我方待响应入口：无反击牌或已选自动结算 → 跳过弹窗直接 pass
  // （处于 doAction 的 await 链内 busy 占用，须经 setTimeout 延迟一步再走 doAction）
  function handleMyPending() {
    if (autoPassSession || !hasCounterCards()) {
      showHintFlash(autoPassSession ? '本局已选自动结算——反击窗口自动跳过' : '无反击牌，自动结算', 'info');
      scheduleAI(() => { if (G && G.pending && G.pending.target.side === MY) doAction({ t: 'passCounter', side: MY }); }, 140);
      return;
    }
    openResponsePanel();
  }
  function openResponsePanel() {
    const p = G.pending;
    if (!p) return;
    const foe = G.players[FOE];
    const atkUnit = p.attacker.type === 'leader' ? foe.leader : foe.board[p.attacker.idx];
    const defUnit = p.target.type === 'leader' ? G.players[MY].leader : G.players[MY].board[p.target.idx];
    const atkP = p.attacker.type === 'leader' ? O.leaderPower(foe) : O.powerOfUnit(atkUnit);
    const defUnitP = p.target.type === 'leader' ? O.leaderPower(G.players[MY]) : O.powerOfUnit(defUnit);
    const wall = p.target.type === 'char' && (defUnit.keywords || []).includes('blocker') ? 1000 : 0;
    const defP = defUnitP + wall + p.counterBoost;
    $('responseTitle').textContent = '反击窗口';
    // 机制说明随文案给出：反击=垫战力（直攻打不穿=免伤；互斗反超=反杀攻方）
    $('responseDesc').textContent = `${atkUnit.name} ${atkP / 1000}K → ${defUnit.name} ${defP / 1000}K`
      + (p.target.type === 'leader'
        ? '（直攻：打出反击牌垫高船长防线，攻方战力不超防线就免受积分伤害）'
        : '（互斗：打出反击牌垫高守方战力——反超即可反杀攻方并按差额扣其积分）');
    const box = $('responseOptions');
    box.innerHTML = '';
    const me = G.players[MY];
    me.hand.forEach((c, i) => {
      if (c.counter) {
        const o = document.createElement('div');
        o.className = 'resp-opt';
        o.innerHTML = `<div class="lbl">${c.name}</div><div class="detail">反击 +${c.counter / 1000}K</div>`;
        o.onclick = () => {
          sfx('click');
          // 打出反击牌：引擎窗口保持开放（可继续垫）。面板的刷新与收起统一由 doAction 链管理——
          // afterAction→handleMyPending 负责续垫刷新或自动结算，doAction 收尾在窗口结束时统一收窗
          // （旧版在 .then 里自行开/关面板：打出最后一张走自动结算路径时无人收窗→面板冻死且「放弃」失效）
          doAction({ t: 'counter', side: MY, cards: [i] });
        };
        box.appendChild(o);
      }
    });
    const chk = $('chkAutoPass');
    if (chk) { chk.checked = autoPassSession; chk.onchange = () => { autoPassSession = chk.checked; }; }
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
    closeAndAct({ t: 'passCounter', side: MY });
  };

  // ===== 交互绑定 =====
  $('myHand').addEventListener('click', (e) => {
    const card = e.target.closest('.card'); if (!card) return;
    const idx = +card.dataset.handIdx;
    const c = G && G.players[MY] && G.players[MY].hand[idx];
    if (!c) return;
    const why = handLockReason(c);
    if (why) { showHintFlash(why); return; } // 不可出：给出具体原因
    if (c.type === 'gear') {
      // 装备：先进选择模式点己方角色（每角色限 1 件，重复装备=替换旧的进墓场）
      selMode = { mode: 'gear', idx, cardId: c.id };
      highlightGearTargets();
      renderHints();
      return;
    }
    doAction({ t: c.type === 'char' ? 'playCharacter' : c.type === 'event' ? 'playEvent' : 'playStage', side: MY, idx });
  });

  $('myBoard').addEventListener('click', (e) => {
    const card = e.target.closest('.card'); if (!card) return;
    if (G.pending || G.active !== MY) return;
    if (selMode && selMode.mode === 'gear') {
      doAction({ t: 'playGear', side: MY, idx: selMode.idx, to: { type: 'char', idx: +card.dataset.myIdx } });
      return;
    }
    if (selMode && selMode.mode === 'don') { // 附着目标：与 myLeaderSlot 同判法（selMode 是 {mode:'don'} 对象；旧 ==='don' 字符串比较永假→点卡掉进攻击选择，附着死路）
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
    // 游戏王式：对方场上角色横竖均可被攻击（竖=互斗，横=守备表示）
    const a = { t: 'attack', side: MY, attacker: selMode.attacker, target: { type: 'char', idx } };
    selMode = null;
    clearHighlights();
    doAction(a);
  });

  $('enemyLeaderSlot').addEventListener('click', () => {
    if (!selMode || selMode.mode !== 'attack') return;
    if (G.players[FOE].board.length > 0) { showHintFlash('对方场上有角色——先击败角色，才能直攻船长'); return; }
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
    if (O.usableDons(G.players[MY]) < 1) { showHintFlash('没有能花的费用豆了——都已附着或消耗，下回合开始自动补满'); return; }
    selMode = { mode: 'don' };
    highlightDonTargets();
    renderHints();
  });

  function highlightTargets() {
    clearHighlights();
    const foe = G.players[FOE];
    if (foe.board.length > 0) {
      // 对方场上有角色：全部角色可选（竖=互斗，横=守备），船长不可直攻
      foe.board.forEach((_, i) => $('enemyBoard').children[i]?.classList.add('targetable'));
    } else {
      $('enemyLeaderSlot').querySelector('.card')?.classList.add('targetable');
    }
    markSelected();
  }
  function highlightDonTargets() {
    clearHighlights();
    $('myLeaderSlot').querySelector('.card')?.classList.add('targetable');
    G.players[MY].board.forEach((_, i) => $('myBoard').children[i]?.classList.add('targetable'));
  }
  function highlightGearTargets() {
    clearHighlights();
    // 已装备的目标降级提示色（可换装但会弃掉旧件），未装备的正常高亮
    G.players[MY].board.forEach((u, i) => {
      $('myBoard').children[i]?.classList.add(u.gears && u.gears.length ? 'targetable replaceable' : 'targetable');
    });
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
          <span class="cc-life">LP ${c.life * 2000}</span>
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
      if (G && G.winner === null && !(await uiConfirm('投降并返回港口？当前对局将判负', { okText: '投降返回' }))) return;
      // 投降=判负：天梯/生存走 settle 计败局（试玩反馈：投降静默判负，天梯逃过 -15、生存连胜不归零）
      if (G && G.winner === null && gameCtx && gameCtx.mode !== 'free' && window.OPTCG_MODES) {
        try {
          const line = window.OPTCG_MODES.settle(gameCtx, false);
          if (line) toast('已判负 · ' + line.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
        } catch (e) { /* settle 异常不阻断返回 */ }
      } else {
        toast('本局已判负');
      }
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
    autoPassSession = false; // 「本局不再询问」随新局重置
    logSeen = G.log.length;
    myLeaderColor = color;
    selMode = null;
    gen++;                 // 新对局代际：旧局定时器/autoplay 全部失效
    stopAutoplayTimer();
    $('logBody').innerHTML = '';
    ['setupPanel', 'endPanel', 'responsePanel', 'helpPanel', 'builderPanel'].forEach((id) => $(id).classList.add('hidden'));
    showBanner('决斗！', '');
    renderAll();
    // 开局即报模式（试玩反馈：点天梯/生存后无任何反馈，打完一局才知道模式是否生效）
    const MODE_NAME = { ladder: '天梯排位', survival: '生存挑战', free: '自由对战' };
    showHintFlash(`${MODE_NAME[(gameCtx && gameCtx.mode) || 'free']} · 对手：${foeLeader.name}（${COLOR_NAME[foeColor]}）`, 'info');
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
    let detail = `历时 ${G.turn} 回合 · 我方剩余 LP ${Math.max(0, G.players[MY].lp)} · 对方剩余 LP ${Math.max(0, G.players[FOE].lp)}`;
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

  // 断档恢复时按引擎 log 重建最近战报（快照含完整 G.log；UI 战报原本只增量记录——恢复后从零开始丢失脉络）
  function rebuildLog(g) {
    const body = $('logBody');
    if (!body || !Array.isArray(g.log)) return;
    const NAME = { summon: '召唤角色', attack: '发起攻击', counter: '反击!', endTurn: '结束回合' };
    const lines = [];
    for (const ev of g.log) {
      if (!(ev.t in NAME)) continue;
      const side = ev.t === 'attack' ? (ev.attacker && ev.attacker.side) : ev.side; // attack 事件战力方在 attacker
      if (typeof side !== 'number') continue;
      let text = `${side === MY ? '我方' : '敌方'} · ${NAME[ev.t]}`;
      if (ev.t === 'summon' && ev.cardId) {
        const c = O.POOL.cards.find((x) => x.id === ev.cardId);
        if (c) text += `：${c.name}`;
      }
      lines.push(text);
    }
    // 与 addLogLine 同构（最新在上，最多 18 条）
    for (const text of lines.slice(-18).reverse()) {
      const line = document.createElement('div');
      line.className = 'log-line';
      line.textContent = text;
      body.appendChild(line);
    }
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
        if (typeof pl.lp !== 'number') return false; // 旧生命卡制快照无 LP 字段：拒收（save 层清档重来）
      }
      if (g.winner !== null) return false; // 已终局的快照没有恢复意义
      gen++;
      stopAutoplayTimer();
      G = g;
      ai = O.createAI(AI_LEVELS.includes(snap.level) ? snap.level : 'normal');
      gameCtx = snap.ctx == null ? null : JSON.parse(JSON.stringify(snap.ctx));
      ended = false; selMode = null; busy = false; autoPassSession = false;
      logSeen = Array.isArray(g.log) ? g.log.length : 0;
      if (g.players[MY].leader && g.players[MY].leader.color) myLeaderColor = g.players[MY].leader.color;
      $('logBody').innerHTML = '';
      rebuildLog(g); // 恢复战报脉络（简版：最近 18 条动作）
      ['setupPanel', 'endPanel', 'responsePanel', 'helpPanel', 'builderPanel'].forEach((id) => $(id).classList.add('hidden'));
      renderAll();
      autosaveNow();
      // 轮到 AI 或有待响应时重新驱动（复用 afterAction 的调度路径）
      if (g.pending) {
        if (g.pending.target.side === MY) handleMyPending();
        else scheduleAI(aiRespond, AI_DELAY);
      } else if (g.active === FOE) {
        scheduleAI(aiStep, AI_DELAY);
      }
      return true;
    } catch (e) {
      return false; // 坏数据不崩，交由调用方（save.resume）清档
    }
  }

  // ===== 玩法说明（新手友好，游戏王式积分制）=====
  function fillHelp() {
    const secs = [
      { ic: 'trophy', t: '胜利目标（积分制）', p: '双方船长各有 <b>LP 10000 积分</b>。攻击造成的伤害按<b>战力差额</b>扣对方 LP，<b>把对方 LP 扣到 0 即获胜</b>；对方牌库抽空也会判负。' },
      { ic: 'layers', t: '回合流程', p: '你的回合：<b>费用区自动补 2 颗费用豆</b>（上回合附着的自动脱落回来）→ 抽 1 张牌 → 出牌 / 攻击 / 附着 → 点「结束回合」。费用区里<b>未附着的费用豆就是能花的钱</b>，附着到卡上的算已消耗。' },
      { ic: 'map', t: '出牌', p: '手牌左上角圆标是<b>费用</b>，消耗对应数量费用豆即可打出：角色进场（场上最多 5 名）、事件立即生效、舞台持续支援。<b>刚出场的角色要等下回合才能攻击</b>（带速攻词条的当回合即可）。' },
      { ic: 'swords', t: '攻击：卡片互斗', p: '点己方未行动的角色或船长 → 再点对方卡发起攻击。<b>对方场上有角色时必须先打角色</b>（横竖都可被攻击，不能绕过直攻船长）；对方场上没角色才能<b>直攻船长</b>，伤害 = 攻方战力 − 船长战力，<b>攻不破防线（差 ≤ 0）就是 0 伤害</b>（打出反击牌可以垫高防线免伤）。攻击后攻击者横置。' },
      { ic: 'refresh', t: '竖放与横放', p: '场上卡片<b>竖放＝攻击表示</b>：可以攻击，被攻击时进入<b>互斗</b>——战力高者胜，败方被击沉并按差额扣其主人 LP，相等同归于尽。<b>横放＝守备表示</b>：本回合已行动，被攻击时只比战力——攻方战力更高才被击沉，守方不损失 LP。己方回合开始时横放的卡自动转回竖放。鼠标悬停任意卡片（手机长按）可看完整信息。' },
      { ic: 'heart', t: '反击', p: '对方攻击时进入<b>反击窗口</b>：手牌中带<b>「反击 +NK」角标</b>的卡可打出为防守<b>垫战力</b>——直攻时垫高船长防线可免伤，互斗时反超战力可反杀攻方。<b>手里没有反击角标的卡时会自动结算，不打扰你</b>；也可勾选「本局不再询问」永久自动。' },
      { ic: 'shield', t: '坚壁', p: '带<span class="kw">坚壁</span>词条的角色是硬盾：<b>被攻击时防御战力 +1K</b>（横放竖放都生效），更难被击沉——很适合守家。' },
      { ic: 'anchor', t: '费用豆附着', p: '点左下费用区 → 点己方角色或船长，附着 1 颗费用豆 <b>+1000 战力</b>，攻防皆受益（互斗、守备、直攻差额都算）。附着后的费用豆本回合不可再用，规划好节奏。' },
      { ic: 'sparkles', t: '关键词', p: '<span class="kw">速攻</span>：出场当回合即可攻击；<span class="kw">双击</span>：直攻船长的 LP 伤害 ×2；<span class="kw">猛击</span>：直攻船长 LP 伤害额外 +2K；<span class="kw">坚壁</span>：被攻击时防御 +1K。' },
      { ic: 'flame', t: '恶魔果实克制', p: '带果实角标的卡有系别：<b>超人系克自然系、自然系克动物系、动物系克超人系</b>（循环）。<b>攻击被自己克制的目标时战力 +1K</b>（打角色、直攻船长都算）；无果实角标的卡不参与克制。组卡时兼顾「我方输出系别」与「克制对方主力系别」是构筑深度所在。' },
      { ic: 'shield', t: '武器装备', p: '带「装备」徽章的卡：点击手牌后再点己方一名角色即穿上——<b>武器加攻击（+1K~+3K）</b>，<b>甲胄加攻击并获「坚壁」（被攻击时防御 +1K）</b>。每角色限穿 1 件（再穿=替换旧的进墓场），装备加成永久生效（不像费用豆每回合脱落），角色被击沉时装备随之进墓场。' },
      { ic: 'crown', t: '船长技能', p: '六位船长各有专属技能（选将时悬停船长卡可看详情）：<b>路飞</b>船长攻击时战力 +1K；<b>娜美</b>费用 ≥3 的角色登场就抽 1 张；<b>索隆</b>5 费以上的角色登场永久 +1K；<b>山治</b>己方角色阵亡时回复 1K 积分；<b>罗</b>己方角色被击沉时抽 1 张；<b>香克斯</b>每回合开始多翻 1 颗费用豆。' },
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
  window.OPTCG_UI = { toast, confirm: uiConfirm, cardInfoHtml }; // 统一反馈层（modes.js/save.js/gallery.js 共用）

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
  function autoplay(n, stepMs) {
    stopAutoplayTimer(); // 并发调用只保留最新一个
    let i = 0;
    autoTimer = setInterval(() => {
      if (!G || G.winner !== null) { stopAutoplayTimer(); return; } // 局没了/已终局：自我清理，不空转
      if (busy) return;
      if (G.pending && G.pending.target.side === MY) { doAction({ t: 'passCounter', side: MY }); return; }
      if (G.active !== MY) return;
      const acts = O.listActions(G).filter((a) => a.t !== 'takeDon' && a.t !== 'giveDon');
      if (!acts.length) return;
      doAction(acts[i % acts.length]);
      if (++i >= n) stopAutoplayTimer();
    }, stepMs || 420); // stepMs 仅测试加速用（虚拟时间快进），玩家路径不传
  }

  // ===== 卡片悬停信息卡（试玩反馈：卡面信息不全、竖/横语义不明）=====
  // 桌面 hover / 触屏长按 550ms → 显示全量卡信息（类型·费用·战力·反击·关键词解释·效果·竖横状态·附着 DON）
  const KW_TIP = {
    rush: '登场当回合即可攻击（其他角色要等下回合）',
    blocker: '坚壁之盾：被攻击时防御战力 +1K（横放竖放都生效），更难被击沉',
    doubleAttack: '直攻船长时积分（LP）伤害 ×2',
    banish: '猛击：直攻船长时积分（LP）伤害额外 +2K',
  };
  const TYPE_NAME = { leader: '船长卡', char: '角色卡', event: '事件卡', stage: '舞台卡', gear: '装备卡' };
  function effectText(def) {
    const e = def.effect;
    if (!e) return '';
    const op = e.op || {};
    const M = {
      'whenAttacking:powerSelf': `攻击时：本次战斗战力 +${(op.x || 0) / 1000}K`,
      'onPlay:powerLeader': `打出时：船长战力 +${(op.x || 0) / 1000}K（到本次战斗结束）`,
      'onPlay:koWeakest': '打出时：击沉敌方场上战力最低的角色',
      'onPlay:restEnemy': '打出时：横置敌方一名角色（其本回合不能再攻击或阻挡）',
      'onPlay:draw': `打出时：抽 ${op.n || 1} 张牌`,
      'onPlay:gainDon': `打出时：从费用库翻 ${op.n || 1} 颗进费用区（本回合就能花）`,
    };
    return M[e.hook + ':' + op.k] || null;
  }
  let cardTipHide = null; // renderAll 重渲染后强制隐藏（悬停中的卡元素已被替换）
  // 卡牌静态信息（悬停信息卡与图鉴放大视图共用同一真值源）
  function cardInfoHtml(def) {
    const parts = [];
    parts.push(`<div class="ct-head"><b>${def.name}</b><span>${def.sub || ''}</span></div>`);
    parts.push(`<div class="ct-meta">${TYPE_NAME[def.type] || def.type} · ${COLOR_NAME[def.color] || def.color}${def.type === 'leader' ? ` · LP ${def.life * 2000}` : ''}${def.fruit ? ` · ${FRUIT_LABEL[def.fruit]}系` : ''}</div>`);
    if (def.fruit) parts.push(`<div class="ct-kw"><span class="kw-badge fr-${def.fruit}">${FRUIT_LABEL[def.fruit]}系</span><span>${FRUIT_TIP[def.fruit]}</span></div>`);
    if (def.type === 'leader' && def.skill) parts.push(`<div class="ct-kw"><span class="kw-badge kw-skill">船长技能</span><span><b>${def.skill}</b>：${def.skillDesc}</span></div>`);
    if (def.type === 'gear' && def.gear) {
      parts.push(`<div class="ct-kw"><span class="kw-badge kw-gear">装备</span><span>附着到己方一名角色（限 1 件）：战力永久 +${def.gear.atk / 1000}K${(def.gear.gives || []).includes('blocker') ? '，并获「坚壁」——被攻击时防御再 +1K' : ''}；角色被击沉时装备随之进墓场</span></div>`);
    }
    if ((def.gears || []).length) {
      const g = def.gears[0];
      parts.push(`<div class="ct-kw"><span class="kw-badge kw-gear-on">已装备 ${g.name}</span><span>战力 +${(g.gear.atk || 0) / 1000}K${(g.gear.gives || []).includes('blocker') ? ' + 坚壁' : ''}（下方的总战力已含装备）</span></div>`);
    }
    const nums = [];
    if (def.type !== 'leader' && def.cost != null) nums.push(`费用 ${def.cost}`);
    if (def.power) nums.push(`战力 ${def.power / 1000}K`);
    if (def.counter) nums.push(`反击 +${def.counter / 1000}K`);
    if (nums.length) parts.push(`<div class="ct-nums">${nums.join(' · ')}</div>`);
    for (const k of def.keywords || []) parts.push(`<div class="ct-kw"><span class="kw-badge kw-${k}">${KW_LABEL[k] || k}</span><span>${KW_TIP[k] || ''}</span></div>`);
    const et = effectText(def);
    if (et) parts.push(`<div class="ct-eff">${et}</div>`);
    else if (def.type === 'char') parts.push('<div class="ct-eff ct-none">无特殊效果的白板角色，靠战力和费用取胜</div>');
    return parts.join('');
  }
  function tipHtml(el) {
    const id = el.dataset.cardId;
    if (!id) return null;
    const def = O.POOL.cards.find((c) => c.id === id) || O.POOL.leaders.find((l) => l.id === id);
    if (!def) return null;
    const parts = [
      // 卡面大图（试玩反馈：悬停除文字外还要看大图）；缺图时 onerror 自移除不留空洞
      `<img class="ct-art" src="art/${def.art || def.id}.webp" alt="" onerror="this.remove()">`,
      cardInfoHtml(def),
    ];
    // 状态行：竖/横是本游戏核心语义（竖=就绪，横=已休息），每次悬停都解释
    const inCodex = !!el.closest('.codex-panel');
    const rested = el.classList.contains('rest');
    const inHand = !!el.closest('#myHand');
    const isEnemy = !!el.closest('#enemyBoard,#enemyStage,#enemyLeaderSlot');
    const who = isEnemy ? '对方' : '我方';
    const ownerTurn = isEnemy ? '对方回合' : '你的回合';
    const dons = +(el.dataset.dons || 0) || 0;
    const st = [];
    if (inCodex) st.push('<b>图鉴浏览</b>：点击卡片可放大看卡面插画与完整说明');
    else if (inHand) {
      const usable = G ? O.usableDons(G.players[MY]) : 0;
      st.push(`<b>在手牌</b>：点击打出，花费 ${def.cost} 颗费用豆（=费用区未附着的费用豆，当前能花 ${usable} 颗）；带「反击」角标的还可在对方攻击时打出作反击（垫高防守战力：直攻可免伤、互斗可反杀）`);
    }
    else if (def.type === 'stage') st.push(`<b>${who}舞台</b>：打出后持续在场生效，不参与战斗`);
    else if (rested) st.push(`<b>横放＝守备表示</b>：${who}${def.type === 'leader' ? '船长本回合已攻击过' : '角色本回合已行动或被效果横置，不能再攻击'}；被攻击时只比战力——攻方战力更高才被击沉，守方不损失积分${(def.keywords || []).includes('blocker') ? '（坚壁：防御战力仍 +1K）' : ''}；${ownerTurn}开始时转回竖放`);
    else st.push(`<b>竖放＝攻击表示</b>：${who}${def.type === 'leader' ? '船长可发起攻击（对方场上无角色时可直攻，伤害=双方战力差额，攻不破=0 伤害）' : '角色可发起攻击（刚登场要等下回合，速攻词条除外）'}；被攻击时进入互斗——战力低者被击沉并按差额扣积分（LP），相等同归于尽`);
    if (dons > 0) st.push(`<b>已附着 ${dons} 颗费用豆</b>：战力 +${dons}K，攻防都算；${ownerTurn}开始时自动脱落回费用区`);
    parts.push(`<div class="ct-state">${st.map((s) => `<div>${s}</div>`).join('')}</div>`);
    return parts.join('');
  }
  function initCardTip() {
    const tip = document.createElement('div');
    tip.id = 'cardTip';
    tip.className = 'hidden';
    tip.setAttribute('role', 'tooltip');
    document.body.appendChild(tip);
    const canHover = window.matchMedia && matchMedia('(hover: hover)').matches;
    let longTimer = null, longPressed = false, touchXY = null;
    const hide = () => { tip.classList.add('hidden'); tip.innerHTML = ''; lastTipCard = null; };
    cardTipHide = hide;
    let lastTipCard = null; // 同一张卡不重建内容：mousemove 高频重设 innerHTML 会让大图闪烁
    const place = (x, y) => {
      const r = tip.getBoundingClientRect();
      let L = x + 16, T = y + 16;
      if (L + r.width > innerWidth - 8) L = Math.max(8, x - r.width - 16);
      if (T + r.height > innerHeight - 8) T = Math.max(8, y - r.height - 16);
      tip.style.left = L + 'px';
      tip.style.top = T + 'px';
    };
    const show = (el, x, y) => {
      const html = tipHtml(el);
      if (!html) return hide();
      if (el !== lastTipCard) { tip.innerHTML = html; lastTipCard = el; }
      tip.classList.remove('hidden');
      place(x, y);
    };
    if (canHover) {
      document.addEventListener('mouseover', (e) => {
        const el = e.target.closest && e.target.closest('.card');
        if (el && !el.classList.contains('card-back')) show(el, e.clientX, e.clientY);
        else hide();
      });
      document.addEventListener('mousemove', (e) => {
        if (tip.classList.contains('hidden')) return;
        const el = e.target.closest && e.target.closest('.card');
        if (!el || el.classList.contains('card-back')) return hide();
        show(el, e.clientX, e.clientY); // 场面重渲染后也随移动刷新内容
      });
    }
    // 触屏：长按 550ms 看牌；长按后的那次 click 吞掉防误出牌
    document.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'touch') return;
      const el = e.target.closest && e.target.closest('.card');
      if (!el || el.classList.contains('card-back')) return;
      longPressed = false;
      touchXY = [e.clientX, e.clientY];
      longTimer = setTimeout(() => {
        longPressed = true;
        show(el, e.clientX, e.clientY);
        if (navigator.vibrate) { try { navigator.vibrate(15); } catch (err) { /* 无振动权限忽略 */ } }
      }, 550);
    });
    document.addEventListener('pointermove', (e) => {
      if (longTimer && touchXY && (Math.abs(e.clientX - touchXY[0]) > 10 || Math.abs(e.clientY - touchXY[1]) > 10)) { clearTimeout(longTimer); longTimer = null; }
    });
    const cancelTouch = () => { if (longTimer) { clearTimeout(longTimer); longTimer = null; } };
    document.addEventListener('pointerup', cancelTouch);
    document.addEventListener('pointercancel', cancelTouch);
    document.addEventListener('click', (e) => {
      if (longPressed) { e.stopPropagation(); e.preventDefault(); longPressed = false; hide(); }
    }, true);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
    addEventListener('scroll', hide, true);
    addEventListener('blur', hide);
  }

  // 无 URL 调试参数：正式页不响应 ?autostart/?open=help/?autoplay（RC+ 验收审计移除，
  // 测试一律走真实点击流=tests/e2e 或 selftest 页的 OPTCG_GAME API）
  initCardTip();
})();
