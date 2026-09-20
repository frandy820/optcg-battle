// onboarding.js — 新手分步引导（5 步：选船长→出航→认识牌桌→攻击→胜利目标）
// 依赖：captains-data.js 的 OPTCG_CAPTAINS.icon（图标一律 SVG，不用 Emoji）。
// 与 game.js 的协调：window.OPTCG_ONBOARDING.active() 为真时，Escape 由本层消费（=跳过教程）。
// 首次进入自动弹出（localStorage 裸键 optcg_onboarded，读写 try/catch）；
// 调试/回归参数（?autostart= / ?open= / ?autoplay=）下不自动弹，避免干扰截图与 selftest。
// 大厅「分步教程」按钮（index.html #btnOnboarding）可随时重看。
/* global */
(function () {
  'use strict';
  const KEY = 'optcg_onboarded';
  const $ = (id) => document.getElementById(id);
  const CAP = () => window.OPTCG_CAPTAINS;

  const DONE = () => { try { localStorage.setItem(KEY, '1'); } catch (e) { /* 隐私模式：静默 */ } };
  const isDone = () => { try { return localStorage.getItem(KEY) !== null; } catch (e) { return true; } };
  const reduced = () => document.documentElement.classList.contains('reduced-motion')
    || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  const STEPS = [
    {
      icon: 'compass', title: '第 1 步 · 选船长', anchor: '#leaderChoices',
      text: '每位船长对应一种颜色与牌组风格，卡面上标有生命与战队特性。点选一张船长卡，金框亮起即为出战人选。',
    },
    {
      icon: 'gauge', title: '第 2 步 · 选难度并出航', anchor: '#setupVoyageRow',
      text: '下拉选择 AI 难度（新手水手最温和），然后点金色的「出航！」按钮开始第一局。',
    },
    {
      icon: 'layers', title: '第 3 步 · 认识牌桌',
      text: '对局开始后：屏幕下方是你的手牌；左下角的圆点是贝里区，出牌要消耗它；行动完毕点「结束回合」交给对方。',
      map: ['hand', 'don', 'end'],
    },
    {
      icon: 'swords', title: '第 4 步 · 攻击方式',
      text: '点己方未横置的角色或船长，再点对方角色发起攻击（对方场上有角色须先打角色）。互斗战力低者被击沉并按差额扣 LP；角色攻击后横置，船长不横置、每回合限一次。',
    },
    {
      icon: 'trophy', title: '第 5 步 · 胜利目标',
      text: '把对方的 LP 积分扣到 0 即获胜。手牌中带「反击 +NK」角标的牌，可在被攻击时打出反击、垫高防守战力。',
    },
  ];
  const MAP_META = {
    hand: { icon: 'layers', label: '手牌：点卡出牌' },
    don: { icon: 'star', label: '贝里区：出牌的燃料' },
    end: { icon: 'flag', label: '结束回合：行动完毕后点击' },
  };

  let root = null, hole = null, card = null;
  let idx = 0;
  let activeFlag = false;

  function build() {
    root = document.createElement('div');
    root.id = 'onboard';
    root.className = 'hidden';
    root.innerHTML =
      '<div class="ob-mask"></div>' +
      '<div class="ob-hole"></div>' +
      '<div class="ob-card" role="dialog" aria-modal="true" aria-label="新手分步教程">' +
      '  <div class="ob-head"><span class="ob-ic"></span><span class="ob-title"></span></div>' +
      '  <div class="ob-map"></div>' +
      '  <p class="ob-text"></p>' +
      '  <div class="ob-foot"><span class="ob-dots"></span><span class="ob-btns">' +
      '    <button type="button" class="btn-ghost ob-skip">跳过教程</button>' +
      '    <button type="button" class="btn-primary ob-next">下一步</button>' +
      '  </span></div>' +
      '</div>';
    document.body.appendChild(root);
    hole = root.querySelector('.ob-hole');
    card = root.querySelector('.ob-card');
    root.querySelector('.ob-skip').onclick = () => finish();
    root.querySelector('.ob-next').onclick = () => (idx >= STEPS.length - 1 ? finish() : show(idx + 1));
    // 试玩反馈 P2-9：遮罩拦截一切点击，玩家没注意角落教程卡会以为「游戏坏了」——
    // 点遮罩空白=推进到下一步（最后一步=完成），任何点击都有反馈不再「失灵」
    root.querySelector('.ob-mask').onclick = () => (idx >= STEPS.length - 1 ? finish() : show(idx + 1));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && activeFlag) finish();
    });
    addEventListener('resize', () => position());
  }

  function anchorEl(st) {
    if (!st.anchor) return null;
    const el = document.querySelector(st.anchor);
    // 锚点不可见（所在面板隐藏）→ 降级为居中卡片
    if (!el || el.offsetParent === null || el.closest('.hidden')) return null;
    return el;
  }

  function position() {
    if (!activeFlag || !root) return;
    const st = STEPS[idx];
    const el = anchorEl(st);
    if (el) {
      const r = el.getBoundingClientRect();
      const pad = 8;
      root.classList.remove('static');
      hole.style.display = 'block';
      hole.style.left = (r.left - pad) + 'px';
      hole.style.top = (r.top - pad) + 'px';
      hole.style.width = (r.width + pad * 2) + 'px';
      hole.style.height = (r.height + pad * 2) + 'px';
      // 说明卡：优先放锚点下方，放不下翻到上方；水平夹在视口内
      const cw = Math.min(360, innerWidth * 0.94);
      const ch = card.offsetHeight || 220;
      let left = Math.min(Math.max(8, r.left + r.width / 2 - cw / 2), Math.max(8, innerWidth - cw - 8));
      let top = r.bottom + 14;
      if (top + ch + 8 > innerHeight) top = Math.max(8, r.top - ch - 14);
      card.style.left = left + 'px';
      card.style.top = top + 'px';
    } else {
      root.classList.add('static');
      hole.style.display = 'none';
      card.style.left = card.style.top = '';
    }
  }

  function show(i) {
    if (!root) build();
    idx = Math.max(0, Math.min(STEPS.length - 1, i));
    activeFlag = true;
    const st = STEPS[idx];
    root.querySelector('.ob-ic').innerHTML = CAP() ? CAP().icon(st.icon) : '';
    root.querySelector('.ob-title').textContent = st.title;
    root.querySelector('.ob-text').textContent = st.text;
    const map = root.querySelector('.ob-map');
    if (st.map && CAP()) {
      map.innerHTML = st.map.map((k) => {
        const m = MAP_META[k];
        return '<span class="ob-map-item">' + CAP().icon(m.icon) + m.label + '</span>';
      }).join('');
      map.style.display = 'flex';
    } else {
      map.style.display = 'none';
    }
    root.querySelector('.ob-dots').innerHTML = STEPS
      .map((_, j) => '<span class="ob-dot' + (j === idx ? ' on' : '') + '"></span>').join('');
    root.querySelector('.ob-next').textContent = idx >= STEPS.length - 1 ? '完成' : '下一步';
    card.classList.toggle('no-anim', reduced());
    root.classList.remove('hidden');
    position();
    const btn = root.querySelector('.ob-next');
    if (btn) { try { btn.focus({ preventScroll: true }); } catch (e) { /* 静默 */ } }
  }

  function finish() {
    if (!activeFlag) return;
    activeFlag = false;
    DONE(); // 跳过与完成都视为已引导
    if (root) root.classList.add('hidden');
  }

  function start() {
    if (activeFlag) return;
    show(0);
  }

  // 首次进入自动弹（调试参数下不弹；等大厅入场动效落定）
  function maybeAuto() {
    if (isDone()) return;
    if (/[?&](autostart|autoplay|open)=/.test(location.search)) return;
    // 防御（试玩反馈 F2 一次性异常）：对局中绝不弹教程——仅大厅可见时自动弹
    setTimeout(() => {
      if (isDone() || activeFlag) return;
      const hall = document.getElementById('setupPanel');
      if (hall && hall.classList.contains('hidden')) return;
      start();
    }, 800);
  }

  const obBtn = $('btnOnboarding');
  if (obBtn) obBtn.onclick = () => start();

  window.OPTCG_ONBOARDING = { start, finish, active: () => activeFlag };
  maybeAuto();
})();
