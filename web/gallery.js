// 卡牌图鉴：全部卡牌浏览 + 点击放大看卡面（试玩反馈：需要一个看全部卡的地方）
// 依赖 app.bundle.js（OPTCG.POOL）、game.js（OPTCG_GAME.cardEl 渲染卡、OPTCG_UI.cardInfoHtml 静态信息）
// 卡片悬停信息卡由 game.js 的 document 级委托自动生效（.card 即触发，状态行走图鉴分支）
/* global OPTCG, OPTCG_GAME, OPTCG_UI */
(function () {
  'use strict';

  const COLOR_NAME = { red: '红', blue: '蓝', green: '绿', yellow: '黄', purple: '紫', black: '黑' };
  let panel = null;
  let viewer = null;

  function buildPanel() {
    if (panel) return panel;
    panel = document.createElement('div');
    panel.id = 'codexPanel';
    panel.className = 'modal codex-panel';
    panel.innerHTML = '<div class="modal-card codex-card">'
      + '<header class="codex-head"><h3>卡牌图鉴</h3>'
      + '<span class="codex-count"></span>'
      + '<button type="button" class="btn-ghost">关闭</button></header>'
      + '<div class="codex-body"></div></div>';
    document.body.appendChild(panel);
    panel.querySelector('.codex-head .btn-ghost').onclick = close;
    panel.addEventListener('click', (e) => { if (e.target === panel) close(); }); // 点遮罩关闭

    const body = panel.querySelector('.codex-body');
    const groups = [];
    if (OPTCG.POOL.leaders.length) groups.push({ key: 'leader', name: '船长卡', list: OPTCG.POOL.leaders.slice() });
    for (const color of ['red', 'blue', 'green', 'yellow', 'purple', 'black']) {
      // cards.json 组内是费用曲线交错序（默认卡组构造用），图鉴展示按费用+id 归序
      const list = OPTCG.POOL.cards.filter((c) => c.color === color)
        .sort((a, b) => (a.cost - b.cost) || a.id.localeCompare(b.id));
      if (list.length) groups.push({ key: color, name: (COLOR_NAME[color] || color) + '阵营', list });
    }
    let total = 0;
    for (const g of groups) {
      total += g.list.length;
      const sec = document.createElement('section');
      sec.className = 'codex-sec';
      const head = document.createElement('div');
      head.className = 'codex-sec-head';
      head.innerHTML = `<span class="codex-sec-dot ${g.key}"></span><b>${g.name}</b><span class="codex-sec-n">${g.list.length} 张</span>`;
      sec.appendChild(head);
      const grid = document.createElement('div');
      grid.className = 'codex-grid';
      for (const def of g.list) {
        const el = OPTCG_GAME.cardEl(def, {});
        el.setAttribute('aria-label', '放大查看 ' + def.name);
        el.addEventListener('click', () => openViewer(def));
        grid.appendChild(el);
      }
      sec.appendChild(grid);
      body.appendChild(sec);
    }
    panel.querySelector('.codex-count').textContent = '共 ' + total + ' 张';
    return panel;
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
