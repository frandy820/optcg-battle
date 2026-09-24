// 模式层：构筑器 / 天梯排位 / 生存挑战（localStorage 持久化，无后端依赖）
// 依赖顺序：app.bundle.js → game.js（OPTCG_GAME）→ 本文件
/* global OPTCG, OPTCG_GAME */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const COLOR_NAME = { red: '红', blue: '蓝', green: '绿', yellow: '黄', purple: '紫', black: '黑' };
  const CAP = () => window.OPTCG_CAPTAINS; // 图标库 + 阵营徽记（captains-data.js）
  const LEVEL_NAME = { easy: '新手水手', normal: '精英船员', hard: '风暴领主' };
  const NEXT_LEVEL = { easy: 'normal', normal: 'hard' };

  // ===== 存取封装（A2：优先走 OPTCG_SAVE v2 存档；未加载 save.js 的页面退回裸 localStorage）=====
  function load(k, d) {
    const S = window.OPTCG_SAVE;
    if (S) {
      const v = S.get(k);
      return v === null || v === undefined ? d : v;
    }
    try { const v = JSON.parse(localStorage.getItem(k)); return v === null || v === undefined ? d : v; }
    catch (e) { return d; }
  }
  function save(k, v) {
    const S = window.OPTCG_SAVE;
    if (S) { S.set(k, v); return; }
    try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 隐私模式等：静默降级，当局仍可玩 */ }
  }
  const decks = () => load('optcg_decks', []);
  const saveDecks = (d) => save('optcg_decks', d);

  // ===== 天梯段位（icon=船长图标库名；渲染处经 CAP().icon 输出 SVG）=====
  function ladderRank(score) {
    if (score >= 2500) return { name: '传说', icon: 'crown', level: 'hard' };
    if (score >= 2000) return { name: '白金', icon: 'sparkles', level: 'hard' };
    if (score >= 1500) return { name: '黄金', icon: 'star', level: 'normal' };
    if (score >= 1000) return { name: '白银', icon: 'medal', level: 'normal' };
    if (score >= 500) return { name: '青铜', icon: 'shield', level: 'easy' };
    return { name: '见习', icon: 'compass', level: 'easy' };
  }

  // ===== 出战卡组解析 =====
  function selectedDeck() {
    const sel = load('optcg_deck_sel', '');
    if (!sel) return null;
    return decks().find((d) => String(d.id) === String(sel)) || null;
  }
  function expandDeck(counts) {
    const byId = Object.fromEntries(OPTCG.POOL.cards.map((c) => [c.id, c]));
    const out = [];
    for (const [id, n] of Object.entries(counts || {})) {
      for (let i = 0; i < n; i++) if (byId[id]) out.push(byId[id]);
    }
    return out;
  }
  const deckTotal = (counts) => Object.values(counts || {}).reduce((a, b) => a + b, 0);

  // ===== 云端同步（M5：由 203 服务时启用；file:// 离线自动降级，行为与纯单机一致）=====
  const cloud = { on: false, user: null, decks: [] };
  function userId() {
    let u = load('optcg_uid', null);
    if (!u || !/^[\w-]{1,64}$/.test(u)) {
      u = 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      save('optcg_uid', u);
    }
    return u;
  }
  async function api(path, opts) {
    const r = await fetch('/api/' + path, Object.assign({
      headers: { 'Content-Type': 'application/json' },
    }, opts));
    if (!r.ok) throw new Error('http ' + r.status);
    return r.json();
  }
  // M5 云端同步域：仅 203 部署场景探测（其余一律离线，不发 /api/health）
  const CLOUD_HOSTS = ['192.168.14.203'];
  async function cloudSync() {
    // 探测条件收紧（v0.9.4）：file:// 直开与 github.io 线上页都无同源 /api（Pages 探测 404 刷
    // console 红错），只有 203 部署域才值得探测，其余直接保持离线
    const protoOk = location.protocol === 'http:' || location.protocol === 'https:';
    if (!protoOk || !CLOUD_HOSTS.includes(location.hostname)) { cloud.on = false; cloud.decks = []; refreshMenu(); return; }
    const uid = userId();
    try {
      const h = await Promise.race([
        api('health'),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 1200)),
      ]);
      if (!h || !h.ok) return;
      const r = await api('decks?user=' + uid);
      cloud.on = true; cloud.user = uid; cloud.decks = (r && r.decks) || [];
    } catch (e) { cloud.on = false; cloud.decks = []; }
    refreshMenu();
  }
  let cloudReady = null; // cloudSync 的 promise：上传/记局等它落地再发，防探测未完成被跳过
  function whenCloud(fn) {
    if (!cloudReady) return;
    cloudReady.then(() => { if (cloud.on) fn(); }).catch(() => {});
  }
  function cloudUpload(name, color, counts) {
    whenCloud(() => {
      api('decks', { method: 'POST', body: JSON.stringify({ user: userId(), name, color, counts }) })
        .catch(() => {}); // 云端失败不影响本地玩法
    });
  }
  function cloudRecordMatch(ctx, win) {
    if (!ctx || ctx.mode === 'free') return; // 自由局不计战绩
    const st = OPTCG_GAME.state() || {};
    whenCloud(() => {
      api('matches', {
        method: 'POST',
        body: JSON.stringify({ user: userId(), mode: ctx.mode, win: !!win, turn: st.turn | 0 }),
      }).catch(() => {});
    });
  }

  // ===== 继续上次对局（A2：大厅入口，快照数据/恢复动作全在 OPTCG_SAVE）=====
  const MODE_NAME = { ladder: '天梯排位', survival: '生存挑战', story: '故事之旅', free: '自由对战' };
  function refreshResumeEntry() {
    const old = document.getElementById('btnResumeMatch');
    if (old) old.remove();
    const S = window.OPTCG_SAVE;
    const has = !!(S && typeof S.hasUnfinished === 'function' && S.hasUnfinished());
    const info = (has && typeof S.matchInfo === 'function' && S.matchInfo()) || null;
    // B 线 index.html 的静态 #btnResume 存在时：只补充「回合N·模式名」文案，不重复造按钮
    const staticBtn = document.getElementById('btnResume');
    if (staticBtn) {
      let span = document.getElementById('btnResumeInfo');
      if (!span) { span = document.createElement('span'); span.id = 'btnResumeInfo'; staticBtn.appendChild(span); }
      span.textContent = info ? `（第 ${info.turn} 回合 · ${MODE_NAME[info.mode] || MODE_NAME.free}）` : '';
      return;
    }
    if (!has) return;
    const row = document.querySelector('#setupPanel .mode-row');
    if (!row) return;
    const b = document.createElement('button');
    b.id = 'btnResumeMatch'; b.type = 'button';
    b.className = 'btn-ghost';
    b.style.cssText = 'width:100%;margin-top:16px;padding:10px 14px;display:flex;align-items:center;justify-content:center;gap:8px;font-size:14px;';
    b.innerHTML = `${CAP().icon('anchor')}<span>继续上次对局${info && info.turn ? ` · 第 ${info.turn} 回合` : ''} · ${MODE_NAME[info && info.mode] || MODE_NAME.free}</span>`;
    b.onclick = () => {
      // 天梯/生存的段位与连胜存在存档层，settle() 终局时重读，恢复对局即自动衔接模式进度
      if (S.resume()) {
        $('setupPanel').classList.add('hidden'); // 收起大厅，牌桌由 restoreFromSnapshot 重建
        const x = document.getElementById('btnResumeMatch'); if (x) x.remove();
      } else {
        UI().toast('对局数据已失效，已自动清除', 'error');
        refreshResumeEntry();
      }
    };
    row.parentNode.insertBefore(b, row);
  }

  // ===== 主菜单刷新 =====
  function refreshMenu() {
    const sel = $('deckSel');
    const cur = String(load('optcg_deck_sel', ''));
    const localDecks = decks();
    // 云端卡组：uid 未变且本地无同名同色副本时，以 [云] 项展示（选中即导入本地）
    const cloudOpts = (cloud.on && cloud.user === load('optcg_uid', null))
      ? cloud.decks
        .filter((d) => !localDecks.some((x) => x.name === d.name && x.color === d.color))
        .map((d) => `<option value="c:${d.id}">[云] ${d.name}（${COLOR_NAME[d.color]}·云端）</option>`)
        .join('')
      : '';
    sel.innerHTML = '<option value="">默认套牌（跟随船长）</option>'
      + localDecks.map((d) => `<option value="${d.id}">${d.name}（${COLOR_NAME[d.color]}·自构筑）</option>`).join('')
      + cloudOpts;
    sel.value = cur;
    if (sel.value !== cur) { sel.value = ''; save('optcg_deck_sel', ''); } // 选中项已被删
    updateDeckHint();
    const L = load('optcg_ladder', { score: 0, wins: 0, losses: 0 });
    const r = ladderRank(L.score);
    $('ladderBadge').innerHTML = `${CAP().icon(r.icon)}${r.name} ${L.score}分 · ${L.wins}胜${L.losses}负`;
    const S = load('optcg_survival', { streak: 0, level: 'easy', best: 0 });
    $('survivalBadge').innerHTML = S.streak > 0
      ? `${CAP().icon('flame')} ${S.streak}连胜 · 敌将:${LEVEL_NAME[S.level]} · 最佳${S.best}`
      : `最佳纪录 ${S.best} 连胜 · 从${LEVEL_NAME[S.level]}敌将开打`;
    // 故事之旅副标题（story.js 缺席的测试页无该元素——防御可选）
    const sb = $('storyBadge');
    if (sb) sb.textContent = (window.OPTCG_STORY && OPTCG_STORY.badgeText()) || '';
    refreshResumeEntry(); // A2：有 <24h 快照时在模式区上方插「继续上次对局」
  }

  // 卡组提示行：默认套牌说明 / 自构筑卡组的张数·均费（真实卡池统计）
  function updateDeckHint() {
    const hint = $('deckHint');
    if (!hint) return;
    const d = selectedDeck();
    if (!d) { hint.textContent = '跟随船长颜色的 50 张默认套牌'; return; }
    const arr = expandDeck(d.counts);
    const avg = arr.length ? (arr.reduce((a, c) => a + (c.cost || 0), 0) / arr.length).toFixed(1) : '0.0';
    hint.textContent = `${arr.length} 张 · 均费 ${avg} · ${COLOR_NAME[d.color]}色自构筑`;
  }

  $('deckSel').onchange = () => {
    const v = $('deckSel').value;
    if (v.indexOf('c:') === 0) { // 云端卡组 → 导入本地副本并选中
      const src = cloud.decks.find((x) => String(x.id) === v.slice(2));
      if (src) {
        const ds = decks();
        ds.push({ id: Date.now(), name: src.name, color: src.color, counts: { ...src.counts } });
        saveDecks(ds);
        save('optcg_deck_sel', String(ds[ds.length - 1].id));
        OPTCG_GAME.setLeaderColor(src.color);
      }
      refreshMenu();
      return;
    }
    save('optcg_deck_sel', v);
    const d = selectedDeck();
    if (d) OPTCG_GAME.setLeaderColor(d.color); // 自定义卡组自带颜色，同步船长
  };

  // ===== 开局入口（天梯/生存：难度由模式决定，卡组用当前选中） =====
  const UI = () => window.OPTCG_UI || { toast: (m) => console.log('[toast]', m), confirm: async () => false };
  // 连点防护：入口按钮在处理期间禁用，防重复开局
  function onceBtn(id, fn) {
    const b = $(id); if (!b) return;
    b.onclick = async () => {
      if (b.disabled) return;
      b.disabled = true;
      try { await fn(); } finally { b.disabled = false; }
    };
  }
  function modeStart() {
    const deck = selectedDeck();
    // 未选船长：默认船长兜底（与自由对战一致，不设前置门槛）
    const leaderColor = deck ? deck.color : (OPTCG_GAME.leaderColor() || (OPTCG.POOL.leaders[0] || {}).color);
    let out;
    if (deck) {
      const total = deckTotal(deck.counts);
      out = expandDeck(deck.counts);
      // 幽灵卡提示（v0.9.4）：卡池演进删卡后旧档 counts 含死 id，expand 过滤后不足 50，
      // game.js 会静默换默认套牌——此前玩家毫无感知（自构筑组「凭空消失」）
      if (out.length < total) UI().toast(`卡组「${deck.name}」含 ${total - out.length} 张已下架卡，本局改用默认套牌（可在构筑器重修）`, 'error');
      if (out.length !== 50) out = undefined;
    }
    return {
      leaderColor,
      deck: out,
      deckId: deck ? deck.id : null,
    };
  }
  function startLadderGame() {
    const m = modeStart(); if (!m) return;
    const L = load('optcg_ladder', { score: 0, wins: 0, losses: 0 });
    const r = ladderRank(L.score);
    OPTCG_GAME.startGame({
      leaderColor: m.leaderColor, deck: m.deck, level: r.level,
      rules: { deckoutByLp: true }, // v2：牌库打空按 LP 裁定（低者负/同分平局）
      ctx: { mode: 'ladder', leaderColor: m.leaderColor, deckId: m.deckId },
    });
  }
  function startSurvivalGame() {
    const m = modeStart(); if (!m) return;
    const S = load('optcg_survival', { streak: 0, level: 'easy', best: 0 });
    OPTCG_GAME.startGame({
      leaderColor: m.leaderColor, deck: m.deck, level: S.level,
      rules: { deckoutByLp: true }, // v2：同上
      ctx: { mode: 'survival', leaderColor: m.leaderColor, deckId: m.deckId },
    });
  }

  // ===== 终局结算（game.js 终局时调用，返回结算文案） =====
  function settle(ctx, win, draw) {
    let line = '';
    if (ctx.mode === 'story') {
      // 故事之旅：发卡/进度/卡组成长全在 story.js（模式层独立实现），此处只透传
      line = (window.OPTCG_STORY && OPTCG_STORY.settle(ctx, win, draw)) || '';
    } else if (ctx.mode === 'ladder') {
      const L = load('optcg_ladder', { score: 0, wins: 0, losses: 0 });
      if (draw) {
        // v2 平局（牌库打空同分）：分数不动，另计平局场数
        L.draws = (L.draws | 0) + 1;
        save('optcg_ladder', L);
        line = `${CAP().icon('flag')} 平局——排位分不变（累计 ${L.draws} 平）`;
      } else {
        const delta = win ? 25 : -15;
        L.score = Math.max(0, L.score + delta);
        if (win) L.wins++; else L.losses++;
        save('optcg_ladder', L);
        const r = ladderRank(L.score);
        line = `${CAP().icon(r.icon)} 排位 ${delta > 0 ? '+' : ''}${delta} 分 → <b>${L.score}</b> 分（${r.name}段位）`;
      }
    } else if (ctx.mode === 'survival') {
      const S = load('optcg_survival', { streak: 0, level: 'easy', best: 0 });
      if (draw) {
        // v2 平局：连胜同样终止（没赢=没活下去），但不按败北文案
        line = `${CAP().icon('flag')} 平局——连胜止于 ${S.streak}（历史最佳 ${S.best}）`;
        S.streak = 0; S.level = 'easy';
        save('optcg_survival', S);
      } else if (win) {
        S.streak++;
        const record = S.streak > S.best;
        S.best = Math.max(S.best, S.streak);
        if (S.streak % 2 === 0 && NEXT_LEVEL[S.level]) S.level = NEXT_LEVEL[S.level];
        save('optcg_survival', S);
        line = `${CAP().icon('flame')} ${S.streak} 连胜${record ? '（新纪录！）' : ''} · 下一敌将：${LEVEL_NAME[S.level]}`;
      } else {
        line = `${CAP().icon('flag')} 挑战终止于 ${S.streak} 连胜（历史最佳 ${S.best}）`;
        S.streak = 0; S.level = 'easy';
        save('optcg_survival', S);
      }
    }
    cloudRecordMatch(ctx, win);
    refreshMenu();
    return line;
  }

  function restart(ctx) {
    if (ctx.mode === 'ladder') return startLadderGame();
    if (ctx.mode === 'survival') return startSurvivalGame();
    if (ctx.mode === 'story' && window.OPTCG_STORY) return OPTCG_STORY.restart(ctx);
    OPTCG_GAME.startGame({ leaderColor: ctx.leaderColor, deck: ctx.deckRef });
  }

  // ===== 构筑器 =====
  let bColor = null, bCounts = {}, bId = null;
  // T4 故事模式构筑上下文（null=对战全池模式，行为不变）：
  //   { story:true, poolIds:Set(收藏卡 id), counts:(初始组), onSave(manual, counts|null) }
  //   onSave：manual=true 且 counts 非空=保存手动组；manual=false=恢复自动成长
  let bCtx = null;
  let bDelText = null, bGoText = null; // 按钮原文案（首次 openBuilder 读取存档；故事模式临时换文案，对战模式还原）

  function openBuilder(opts) {
    bCtx = (opts && opts.story) ? opts : null;
    if (bCtx) {
      // 故事手动构筑：玩家固定路飞（红），池=已收藏 ∩ 红；counts 用当前进度卡组
      bId = null; bColor = 'red'; bCounts = { ...(bCtx.counts || {}) };
    } else {
      const d = selectedDeck();
      if (d) { bId = d.id; bColor = d.color; bCounts = { ...d.counts }; }
      else {
        const lc = OPTCG_GAME.leaderColor();
        bId = null; bColor = lc || OPTCG.POOL.leaders[0].color; bCounts = {};
      }
    }
    // T4：故事模式按钮语义切换（删除→恢复自动成长；保存出航→保存并返回），对战模式还原
    const bDel = $('btnBuilderDelete'), bGo = $('btnBuilderBattle');
    if (bDel) { if (bDelText == null) bDelText = bDel.textContent; bDel.textContent = bCtx ? '恢复自动成长' : bDelText; }
    if (bGo) { if (bGoText == null) bGoText = bGo.textContent; bGo.textContent = bCtx ? '保存并返回' : bGoText; }
    renderBuilder();
    $('builderPanel').classList.remove('hidden');
  }

  function renderBuilder() {
    const box = $('builderLeaders');
    box.innerHTML = '';
    OPTCG.POOL.leaders.forEach((l) => {
      // 故事模式色锁：传 lockLeaderId 只留该船长；缺省退化为只留红色（玩家固定红）
      if (bCtx && (bCtx.lockLeaderId ? l.id !== bCtx.lockLeaderId : l.color !== 'red')) return;
      const f = CAP().FACTION[l.color] || {};
      const b = document.createElement('div');
      b.className = 'bl-pick' + (l.color === bColor ? ' on' : '');
      b.innerHTML = CAP().icon(f.emblem);
      b.style.setProperty('--fc', f.color || '#d4af37');
      b.title = `${l.name}（${COLOR_NAME[l.color]}）`;
      b.onclick = () => { bColor = l.color; bCounts = {}; renderBuilder(); }; // 换色清空
      box.appendChild(b);
    });
    const total = deckTotal(bCounts);
    $('builderCount').innerHTML = `已选 <b style="color:${total === 50 ? '#7ef0a2' : '#ffd98e'}">${total}</b> / 50`
      + (total === 50 ? ` ${CAP().icon('check')} 可保存出航` : `（还差 ${50 - total} 张）`)
      + (bCtx ? ` · <span style="font-size:12px;color:#d8c48a">故事收藏池（${bCtx.poolIds.size} 张已收藏）</span>` : '');
    const pool = $('builderPool');
    pool.innerHTML = '';
    // F13：融合卡不进卡组（经融合动作登场），构筑器池排除；T4 故事模式再交收藏集过滤
    OPTCG.POOL.cards.filter((c) => c.color === bColor && !c.fusion && (!bCtx || bCtx.poolIds.has(c.id)))
      .sort((a, b) => (a.cost - b.cost) || a.id.localeCompare(b.id)).forEach((c) => {
      const n = bCounts[c.id] || 0;
      const w = document.createElement('div');
      w.className = 'bp-card';
      w.appendChild(OPTCG_GAME.cardEl(c));
      const badge = document.createElement('div');
      badge.className = 'bp-n' + (n ? '' : ' zero');
      badge.textContent = '×' + n;
      badge.title = '点击减 1';
      badge.onclick = (e) => {
        e.stopPropagation();
        if (bCounts[c.id]) {
          bCounts[c.id]--;
          if (!bCounts[c.id]) delete bCounts[c.id];
          renderBuilder();
        }
      };
      w.appendChild(badge);
      w.onclick = () => {
        if ((bCounts[c.id] || 0) >= 4) return;
        if (deckTotal(bCounts) >= 50) return;
        bCounts[c.id] = (bCounts[c.id] || 0) + 1;
        renderBuilder();
      };
      pool.appendChild(w);
    });
  }

  function builderSave() {
    const total = deckTotal(bCounts);
    if (total !== 50) { UI().toast('卡组必须正好 50 张（当前 ' + total + ' 张）', 'error'); return false; }
    if (bCtx) {
      // T4 故事手动构筑：合法性校验后交回调落 DKEY+manual 标志（不写对战卡组列表）
      const leader = OPTCG.POOL.leaders.find((l) => l.color === bColor);
      const errs = OPTCG.validateDeck(leader, expandDeck(bCounts));
      if (errs.length) { UI().toast('卡组不合法：' + errs.join('；'), 'error'); return false; }
      try { bCtx.onSave(true, { ...bCounts }); } catch (e) { UI().toast('保存失败：' + e.message, 'error'); return false; }
      UI().toast('故事卡组已保存——手动构筑模式：通关奖励只进收藏，不再自动改组');
      return true;
    }
    const leader = OPTCG.POOL.leaders.find((l) => l.color === bColor);
    const errs = OPTCG.validateDeck(leader, expandDeck(bCounts));
    if (errs.length) { UI().toast('卡组不合法：' + errs.join('；'), 'error'); return false; }
    const name = ($('builderName').value || '').trim() || `${COLOR_NAME[bColor]}色自构筑`;
    const ds = decks();
    if (bId) {
      const d = ds.find((x) => String(x.id) === String(bId));
      if (d) { d.name = name; d.color = bColor; d.counts = { ...bCounts }; }
    } else {
      bId = Date.now();
      ds.push({ id: bId, name, color: bColor, counts: { ...bCounts } });
    }
    saveDecks(ds);
    save('optcg_deck_sel', String(bId));
    cloudUpload(name, bColor, { ...bCounts });
    refreshMenu();
    OPTCG_GAME.setLeaderColor(bColor);
    renderBuilder();
    UI().toast('卡组「' + name + '」已保存并选用');
    return true;
  }

  function builderQuickFill() {
    if (bCtx) {
      // T4 故事版一键补满：不清空已选——收藏池红色按稀有度→战力降序逐卡补足到 50（每卡 ≤4）
      const R = { SSS: 0, SS: 1, S: 2, B: 3, A: 4 };
      const pool = OPTCG.POOL.cards
        .filter((x) => x.color === bColor && !x.fusion && bCtx.poolIds.has(x.id))
        .sort((a, b) => (R[a.rarity] ?? 9) - (R[b.rarity] ?? 9) || b.power - a.power || a.cost - b.cost);
      let left = 50 - deckTotal(bCounts);
      for (const c of pool) {
        if (left <= 0) break;
        const add = Math.min(4 - (bCounts[c.id] || 0), left);
        if (add > 0) { bCounts[c.id] = (bCounts[c.id] || 0) + add; left -= add; }
      }
      if (left > 0) UI().toast('收藏池不足以补满 50 张（还差 ' + left + '）', 'error');
      renderBuilder();
      return;
    }
    bCounts = {};
    let left = 50;
    for (const c of OPTCG.POOL.cards.filter((x) => x.color === bColor && !x.fusion)) {
      const n = Math.min(4, left);
      bCounts[c.id] = n; left -= n;
      if (!left) break;
    }
    renderBuilder();
  }

  async function builderDelete() {
    if (bCtx) {
      // T4 故事模式：删除按钮兼作「恢复自动成长」入口（文案在 openBuilder 时已换）
      if (!(await UI().confirm('恢复自动成长？手动构筑的卡组保留，通关奖励恢复自动入组替换。', { okText: '恢复自动' }))) return;
      try { bCtx.onSave(false, null); } catch (e) { /* 回调异常不阻断 */ }
      $('builderPanel').classList.add('hidden');
      UI().toast('已恢复自动成长——奖励自动入组');
      return;
    }
    if (!bId) { UI().toast('尚未保存为新卡组，无内容可删', 'error'); return; }
    const cur = decks().find((x) => String(x.id) === String(bId));
    if (!(await UI().confirm('删除卡组「' + ((cur && cur.name) || '未命名') + '」？此操作不可撤销。', { okText: '删除' }))) return;
    saveDecks(decks().filter((x) => String(x.id) !== String(bId)));
    if (String(load('optcg_deck_sel', '')) === String(bId)) save('optcg_deck_sel', '');
    bId = null; bCounts = {};
    refreshMenu();
    renderBuilder();
    UI().toast('卡组已删除');
  }

  function builderBattle() {
    if (bCtx) {
      // T4 故事模式：出航按钮=保存卡组并返回关卡面板（不进局——出战走关卡卡片）
      if (!builderSave()) return;
      $('builderPanel').classList.add('hidden');
      try { bCtx.onDone && bCtx.onDone(); } catch (e) { /* 刷新失败不阻断 */ }
      return;
    }
    if (deckTotal(bCounts) !== 50) { UI().toast('先凑满 50 张（当前 ' + deckTotal(bCounts) + ' 张）——可点「快速填充」', 'error'); return; }
    if (!builderSave()) return;
    $('builderPanel').classList.add('hidden');
    OPTCG_GAME.startGame({ leaderColor: bColor, deck: expandDeck(bCounts), rules: { deckoutByLp: true } }); // v2：构筑器试打同规则
  }

  $('btnBuilder').onclick = openBuilder;
  onceBtn('btnLadder', startLadderGame);
  onceBtn('btnSurvival', startSurvivalGame);
  onceBtn('btnBuilderSave', builderSave);
  $('btnBuilderFill').onclick = builderQuickFill;
  $('btnBuilderClear').onclick = () => { bCounts = {}; renderBuilder(); };
  onceBtn('btnBuilderDelete', builderDelete);
  onceBtn('btnBuilderBattle', builderBattle);
  $('btnBuilderClose').onclick = () => $('builderPanel').classList.add('hidden');

  window.OPTCG_MODES = { settle, restart, refreshMenu, openBuilder, startLadderGame, startSurvivalGame };
  refreshMenu();
  cloudReady = cloudSync(); // 异步探测 203：在线则挂云端卡组，离线静默降级

  // 调试钩子：?open=builder[&fill=1] 直接打开构筑器（截图/回归用）
  const qs = new URLSearchParams(location.search);
  if (qs.get('open') === 'builder') {
    openBuilder();
    if (qs.get('fill')) builderQuickFill();
  }
})();
