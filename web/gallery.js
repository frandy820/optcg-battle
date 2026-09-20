// 卡牌图鉴：全部卡牌浏览 + 点击放大看卡面（试玩反馈：需要一个看全部卡的地方）
// 依赖 app.bundle.js（OPTCG.POOL）、game.js（OPTCG_GAME.cardEl 渲染卡、OPTCG_UI.cardInfoHtml 静态信息）
// 卡片悬停信息卡由 game.js 的 document 级委托自动生效（.card 即触发，状态行走图鉴分支）
// 故事之旅联动（story.js 存在时）：已收集/未收集筛选 + 收藏标记（收集真值源 OPTCG_STORY.collectedSet）
/* global OPTCG, OPTCG_GAME, OPTCG_UI */
(function () {
  'use strict';

  const COLOR_NAME = { red: '红', blue: '蓝', green: '绿', yellow: '黄', purple: '紫', black: '黑' };
  let panel = null;
  let viewer = null;
  let filter = 'all'; // 'all' | 'have' | 'miss'（故事之旅收藏筛选；无 story.js 时恒 all=旧行为）

  const story = () => window.OPTCG_STORY || null;

  function buildPanel() {
    if (panel) return panel;
    panel = document.createElement('div');
    panel.id = 'codexPanel';
    panel.className = 'modal codex-panel';
    panel.innerHTML = '<div class="modal-card codex-card">'
      + '<header class="codex-head"><h3>卡牌图鉴</h3>'
      + '<span class="codex-count"></span>'
      + '<button type="button" class="btn-ghost">关闭</button></header>'
      + '<div class="codex-filters hidden"></div>'
      + '<div class="codex-body"></div></div>';
    document.body.appendChild(panel);
    panel.querySelector('.codex-head .btn-ghost').onclick = close;
    panel.addEventListener('click', (e) => { if (e.target === panel) close(); }); // 点遮罩关闭
    return panel;
  }

  // 筛选行（仅故事之旅就绪时显示）：全部 / 已收集 / 未收集 + 收藏进度
  function renderFilters(haveN, missN) {
    const box = panel.querySelector('.codex-filters');
    if (!box) return;
    const S = story();
    if (!S) { box.classList.add('hidden'); return; }
    box.classList.remove('hidden');
    const mk = (key, label, n) => `<button type="button" class="codex-filter${filter === key ? ' on' : ''}" data-filter="${key}">${label}${n != null ? ` ${n}` : ''}</button>`;
    box.innerHTML = mk('all', '全部', haveN + missN) + mk('have', '已收集', haveN) + mk('miss', '未收集', missN);
    box.querySelectorAll('.codex-filter').forEach((b) => {
      b.onclick = () => { filter = b.dataset.filter; renderBody(); };
    });
  }

  // 主体渲染（每次 open/切筛选重建——收藏数随故事进度增长）
  function renderBody() {
    const body = panel.querySelector('.codex-body');
    if (!body) return;
    body.innerHTML = '';
    const S = story();
    const have = (S && S.collectedSet()) || null;
    const groups = [];
    if (OPTCG.POOL.leaders.length) groups.push({ key: 'leader', name: '船长卡', list: OPTCG.POOL.leaders.slice() });
    for (const color of ['red', 'blue', 'green', 'yellow', 'purple', 'black']) {
      // cards.json 组内是费用曲线交错序（默认卡组构造用），图鉴展示按费用+id 归序
      const list = OPTCG.POOL.cards.filter((c) => c.color === color)
        .sort((a, b) => (a.cost - b.cost) || a.id.localeCompare(b.id));
      if (list.length) groups.push({ key: color, name: (COLOR_NAME[color] || color) + '阵营', list });
    }
    let total = 0, haveN = 0, missN = 0;
    for (const c of OPTCG.POOL.cards) {
      total++;
      if (!have || have.has(c.id)) haveN++; else missN++;
    }
    for (const g of groups) {
      // 收藏筛选：船长组不参与（无 rarity、不在收藏范围），卡牌组按已收集/未收集过滤
      const list = (filter === 'all' || g.key === 'leader' || !have)
        ? g.list
        : g.list.filter((c) => (filter === 'have') === have.has(c.id));
      if (!list.length) continue;
      const sec = document.createElement('section');
      sec.className = 'codex-sec';
      const head = document.createElement('div');
      head.className = 'codex-sec-head';
      const shown = g.key === 'leader' ? `${g.list.length} 张` : `${list.length}/${g.list.length} 张`;
      head.innerHTML = `<span class="codex-sec-dot ${g.key}"></span><b>${g.name}</b><span class="codex-sec-n">${shown}</span>`;
      sec.appendChild(head);
      const grid = document.createElement('div');
      grid.className = 'codex-grid';
      for (const def of list) {
        const collected = !have || g.key === 'leader' ? null : have.has(def.id);
        const el = OPTCG_GAME.cardEl(def, { cls: collected === false ? 'codex-miss' : (collected ? 'codex-have' : '') });
        if (collected === true) el.appendChild(Object.assign(document.createElement('span'), { className: 'codex-mark have', title: '已收集' }));
        if (collected === false) el.appendChild(Object.assign(document.createElement('span'), { className: 'codex-mark miss', title: '未收集' }));
        el.setAttribute('aria-label', '放大查看 ' + def.name);
        el.addEventListener('click', () => openViewer(def));
        grid.appendChild(el);
      }
      sec.appendChild(grid);
      body.appendChild(sec);
    }
    panel.querySelector('.codex-count').textContent = S ? `共 ${total} 张 · 已收集 ${haveN}` : '共 ' + total + ' 张';
    renderFilters(haveN, missN);
  }

  // 放大视图：左侧卡面原图，右侧完整说明（与悬停信息卡同一信息源）
  function openViewer(def) {
    closeViewer();
    viewer = document.createElement('div');
    viewer.className = 'modal codex-viewer';
    viewer.innerHTML = '<div class="codex-view-card">'
      + '<div class="codex-view-art"><img src="art/' + (def.art || def.id) + '.webp" alt="' + def.name + '" onerror="this.remove()"></div>'
      + '<div class="codex-view-info">' + OPTCG_UI.cardInfoHtml(def) + '</div>'
      + '<button type="button" class="btn-ghost codex-view-close">关闭</button></div>';
    document.body.appendChild(viewer);
    viewer.addEventListener('click', (e) => { if (e.target === viewer) closeViewer(); });
    viewer.querySelector('.codex-view-close').onclick = closeViewer;
    const btn = viewer.querySelector('.codex-view-close');
    try { btn.focus({ preventScroll: true }); } catch (e) { /* 老浏览器 */ }
  }
  function closeViewer() {
    if (viewer) { viewer.remove(); viewer = null; }
  }
  function onKey(e) {
    if (e.key !== 'Escape') return;
    e.stopPropagation(); // 图鉴打开时 Escape 归图鉴（先放大图、再关面板），不透传给全局面板
    if (viewer) closeViewer(); else close();
  }
  function open() {
    buildPanel();
    renderBody();
    panel.classList.remove('hidden');
    document.addEventListener('keydown', onKey, true);
  }
  function close() {
    closeViewer();
    if (panel) panel.classList.add('hidden');
    document.removeEventListener('keydown', onKey, true);
  }

  const btn = document.getElementById('btnCodex');
  if (btn) btn.onclick = open;
  window.OPTCG_GALLERY = { open, close }; // 供测试/大厅扩展调用
})();
