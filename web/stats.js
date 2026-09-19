// stats.js — 战绩统计 + 对局回放库（localStorage 经 OPTCG_SAVE extras 通道：随「导出存档」一起备份）
// 依赖顺序：app.bundle.js → save.js → game.js（OPTCG_GAME/record 时才用）→ 本文件
// 契约：OPTCG_STATS.record(entry) / open() / startReplay(rp)（回放播放器在 game.js，经 OPTCG_GAME.startReplay）
/* global OPTCG, OPTCG_GAME, OPTCG_SAVE */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const CAP = () => window.OPTCG_CAPTAINS;
  const UI = () => window.OPTCG_UI || { toast: (m) => console.log('[toast]', m) };
  const MODE_NAME = { ladder: '天梯', survival: '生存', free: '自由' };
  const COLOR_NAME = { red: '红', blue: '蓝', green: '绿', yellow: '黄', purple: '紫', black: '黑' };
  const MAX_RECORDS = 60;   // 战绩条数上限
  const MAX_REPLAYS = 20;   // 回放保留局数上限（体积大头）

  // ===== 存储（走 save.js extras：损坏自愈/版本迁移/导出导入全免）=====
  function load(k, d) {
    try {
      const v = window.OPTCG_SAVE && OPTCG_SAVE.get(k);
      return Array.isArray(v) ? v : d;
    } catch (e) { return d; }
  }
  function persist(k, v) {
    try { window.OPTCG_SAVE && OPTCG_SAVE.set(k, v); } catch (e) { /* 存储不可用：内存态照常展示 */ }
  }
  const records = () => load('stats', []);
  const replays = () => load('replays', []);

  // ===== 终局记录（game.js showEndPanel 调用；entry 见 game.js 组装）=====
  function record(entry) {
    if (!entry || typeof entry !== 'object') return;
    const rs = records();
    rs.unshift({
      ts: entry.ts || Date.now(),
      mode: entry.mode || 'free',
      level: entry.level || 'normal',
      leaderId: entry.leaderId || '',
      leaderName: entry.leaderName || '',
      foeId: entry.foeId || '',
      foeName: entry.foeName || '',
      foeColor: entry.foeColor || '',
      win: !!entry.win,
      turns: entry.turns | 0,
      replayId: entry.replay ? entry.replay.id : null,
    });
    persist('stats', rs.slice(0, MAX_RECORDS));
    if (entry.replay) {
      const rps = replays().filter((x) => x.id !== entry.replay.id);
      rps.unshift(entry.replay);
      persist('replays', rps.slice(0, MAX_REPLAYS));
    }
  }

  // ===== 统计聚合 =====
  function aggregate() {
    const rs = records();
    const byLeader = new Map(); // leaderId -> {name, w, n}
    const byFoeColor = new Map();
    let w = 0, streak = 0, best = 0;
    for (const r of rs) {
      if (r.win) w++;
      // 当前连胜 = 从最新往回数到第一场败为止；best = 全历史最大连胜
      if (r.win) { streak++; best = Math.max(best, streak); } else streak = 0;
      if (r.leaderId) {
        const b = byLeader.get(r.leaderId) || { name: r.leaderName || r.leaderId, w: 0, n: 0 };
        b.n++; if (r.win) b.w++;
        byLeader.set(r.leaderId, b);
      }
      if (r.foeColor) {
        const b = byFoeColor.get(r.foeColor) || { w: 0, n: 0 };
        b.n++; if (r.win) b.w++;
        byFoeColor.set(r.foeColor, b);
      }
    }
    // 当前连胜要按时间正序算：重算（上面倒序遍历的 streak 是「历史首个连胜段」，需正序修正）
    let cur = 0;
    for (let i = rs.length - 1; i >= 0; i--) { if (rs[i].win) cur++; else cur = 0; }
    return { total: rs.length, wins: w, curStreak: cur, bestStreak: best, byLeader, byFoeColor };
  }

  // ===== 面板 =====
  function bar(pct, color) {
    return `<span class="st-bar"><i style="width:${Math.max(0, Math.min(100, pct))}%;background:${color}"></i></span>`;
  }
  function render() {
    const rs = records();
    const agg = aggregate();
    const box = $('statsBody');
    if (!box) return;
    if (!rs.length) {
      box.innerHTML = '<p class="st-empty">还没有对局记录——去大厅打一局，胜负与回放都会记在这里。</p>';
      return;
    }
    const rate = agg.total ? Math.round(agg.wins / agg.total * 100) : 0;
    let html = `<div class="st-overview">
      <div class="st-ov"><b>${agg.total}</b><span>总局</span></div>
      <div class="st-ov"><b>${agg.wins}</b><span>胜场</span></div>
      <div class="st-ov"><b>${rate}%</b><span>胜率</span></div>
      <div class="st-ov"><b>${agg.curStreak}</b><span>当前连胜</span></div>
      <div class="st-ov"><b>${agg.bestStreak}</b><span>最佳连胜</span></div>
    </div>`;
    // 按船长胜率（只用我方用过的）
    if (agg.byLeader.size) {
      html += '<h4>按船长胜率</h4><div class="st-rows">';
      for (const [, b] of [...agg.byLeader.entries()].sort((x, y) => y[1].n - x[1].n)) {
        const p = b.n ? Math.round(b.w / b.n * 100) : 0;
        html += `<div class="st-row"><span class="st-name">${b.name}</span>${bar(p, '#7ef0a2')}<span class="st-val">${b.w}/${b.n} · ${p}%</span></div>`;
      }
      html += '</div>';
    }
    // 按对手颜色胜率
    if (agg.byFoeColor.size) {
      html += '<h4>对阵颜色胜率</h4><div class="st-rows">';
      for (const col of ['red', 'blue', 'green', 'yellow', 'purple', 'black']) {
        const b = agg.byFoeColor.get(col);
        if (!b) continue;
        const p = b.n ? Math.round(b.w / b.n * 100) : 0;
        const fc = (CAP().FACTION[col] || {}).color || '#8fa0bd';
        html += `<div class="st-row"><span class="st-name">${COLOR_NAME[col]}色对手</span>${bar(p, fc)}<span class="st-val">${b.w}/${b.n} · ${p}%</span></div>`;
      }
      html += '</div>';
    }
    // 最近对局
    html += '<h4>最近对局（点「回放」重演整局）</h4><div class="st-games">';
    rs.slice(0, 30).forEach((r, i) => {
      const d = new Date(r.ts);
      const when = `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      html += `<div class="st-game ${r.win ? 'win' : 'lose'}">
        <span class="st-g-res">${r.win ? '胜' : '负'}</span>
        <span class="st-g-main"><b>${r.leaderName || '?'}</b> vs ${r.foeName || '?'}<small>${MODE_NAME[r.mode] || r.mode} · ${r.turns} 回合 · ${when}</small></span>
        <span class="st-g-acts">${r.replayId ? `<button type="button" class="btn-ghost st-g-replay" data-i="${i}">${CAP().icon('play')}回放</button><button type="button" class="btn-ghost st-g-export" data-i="${i}" title="导出为 json 分享">${CAP().icon('save')}</button>` : ''}</span>
      </div>`;
    });
    html += '</div>';
    box.innerHTML = html;
    box.querySelectorAll('.st-g-replay').forEach((b) => { b.onclick = () => playByIndex(+b.dataset.i); });
    box.querySelectorAll('.st-g-export').forEach((b) => { b.onclick = () => exportByIndex(+b.dataset.i); });
  }

  function playByIndex(i) {
    const r = records()[i];
    if (!r || !r.replayId) return;
    const rp = replays().find((x) => x.id === r.replayId);
    if (!rp) { UI().toast('回放数据已被清理（最多保留 20 局）', 'error'); return; }
    if (!window.OPTCG_GAME || !OPTCG_GAME.startReplay) { UI().toast('回放播放器未加载', 'error'); return; }
    $('statsPanel').classList.add('hidden');
    OPTCG_GAME.startReplay(rp);
  }

  function exportByIndex(i) {
    const r = records()[i];
    if (!r || !r.replayId) return;
    const rp = replays().find((x) => x.id === r.replayId);
    if (!rp) { UI().toast('回放数据已被清理', 'error'); return; }
    try {
      const blob = new Blob([JSON.stringify({ app: 'optcg-battle', kind: 'replay', v: 1, record: r, replay: rp })], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `optcg-replay-${r.leaderName || 'game'}-${new Date(r.ts).toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    } catch (e) { UI().toast('导出失败：' + (e && e.message), 'error'); }
  }

  function importReplay(file) {
    const rd = new FileReader();
    rd.onload = () => {
      let obj = null;
      try { obj = JSON.parse(rd.result); } catch (e) { obj = null; }
      if (!obj || obj.kind !== 'replay' || !obj.replay || !obj.replay.seed
        || !Array.isArray(obj.replay.actions) || !Array.isArray(obj.replay.deckA) || !Array.isArray(obj.replay.deckB)) {
        UI().toast('导入失败：不是有效的对局回放文件', 'error'); return;
      }
      const rps = replays().filter((x) => x.id !== obj.replay.id);
      rps.unshift(obj.replay);
      persist('replays', rps.slice(0, MAX_REPLAYS));
      if (obj.record) {
        const rs = records().filter((x) => x.ts !== obj.record.ts);
        rs.unshift(obj.record);
        persist('stats', rs.slice(0, MAX_RECORDS));
      }
      render();
      $('statsPanel').classList.add('hidden');
      UI().toast('回放已导入，开始播放');
      OPTCG_GAME.startReplay(obj.replay);
    };
    rd.onerror = () => UI().toast('导入失败：文件读取错误', 'error');
    rd.readAsText(file);
  }

  function open() { render(); $('statsPanel').classList.remove('hidden'); }

  // ===== UI 注入（大厅「战绩」按钮 + 面板）=====
  function injectUI() {
    try {
      const help = document.getElementById('btnHallHelp');
      if (help && !document.getElementById('btnStats')) {
        const btn = document.createElement('button');
        btn.id = 'btnStats'; btn.type = 'button';
        btn.className = 'btn-ghost hall-help-btn';
        btn.textContent = '战绩回放';
        help.parentNode.insertBefore(btn, help.nextSibling);
        btn.onclick = open;
      }
      if (document.getElementById('statsPanel')) return;
      const panel = document.createElement('div');
      panel.id = 'statsPanel'; panel.className = 'modal hidden';
      const card = document.createElement('div');
      card.className = 'modal-card stats-card';
      const h = document.createElement('h3');
      h.textContent = '战绩与回放';
      card.appendChild(h);
      const body = document.createElement('div');
      body.id = 'statsBody'; body.className = 'stats-body';
      card.appendChild(body);
      const acts = document.createElement('div');
      acts.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;';
      const mk = (t, cls) => { const b = document.createElement('button'); b.type = 'button'; b.className = cls; b.textContent = t; return b; };
      const bImp = mk('导入回放', 'btn-ghost');
      const bClear = mk('清空战绩', 'btn-ghost');
      bClear.style.borderColor = 'rgba(232,86,63,.5)'; bClear.style.color = '#ff9d8a';
      const bDone = mk('完成', 'btn-primary');
      acts.appendChild(bImp); acts.appendChild(bClear); acts.appendChild(bDone);
      card.appendChild(acts);
      const file = document.createElement('input');
      file.type = 'file'; file.accept = 'application/json,.json'; file.style.display = 'none';
      card.appendChild(file);
      panel.appendChild(card);
      document.body.appendChild(panel);
      bDone.onclick = () => panel.classList.add('hidden');
      panel.addEventListener('click', (e) => { if (e.target === panel) panel.classList.add('hidden'); });
      bImp.onclick = () => file.click();
      file.onchange = () => { const f = file.files && file.files[0]; file.value = ''; if (f) importReplay(f); };
      bClear.onclick = async () => {
        const ui = UI();
        if (!(await ui.confirm('清空全部战绩与回放记录？（不影响天梯分数/卡组）', { okText: '清空' }))) return;
        persist('stats', []); persist('replays', []);
        render();
        ui.toast('战绩已清空');
      };
    } catch (e) { /* DOM 异常不阻断游戏 */ }
  }

  window.OPTCG_STATS = { record, open, aggregate };
  if (typeof document !== 'undefined') injectUI();
})();
