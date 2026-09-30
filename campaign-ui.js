// 伟大航路闯关（round11 岛屿大地图）+ 牌组工坊 UI
// 进度/牌组存 localStorage；开战写 gld_duel_pending → duel.html 开局；胜利由 duel-ui 回写通关/星级。
'use strict';
import DATA from './data/duel-cards.js?v=d9e7f5a';
import POOL_DATA from './data/duel-pool.js?v=d9e7f5a';
import { ISLANDS, DUEL_STAGES } from './data/duel-stages.js?v=d9e7f5a';

const cardsById = {};
for (const c of DATA.cards) cardsById[c.id] = c;
for (const c of POOL_DATA.cards) cardsById[c.id] = c; // 合并池（DUE 东海 + GLD 千卡池）
const $ = id => document.getElementById(id);
const els = {
  progLine: $('progLine'), stageList: $('stageList'),
  deckSlots: $('deckSlots'), deckStats: $('deckStats'), pool: $('pool'), built: $('built'),
  tabs: [...document.querySelectorAll('.tab')], panes: { stages: $('tab-stages'), deck: $('tab-deck') },
  toast: $('toast'), deckFab: $('deckFab'),
};

const SAVE_KEY = 'gld_campaign_v1';
const PENDING_KEY = 'gld_duel_pending';
// 玩家基础可用卡池：草帽团/伙伴侧 + 招式伏笔；敌方人物须通关解锁（岛通关=阵营整池/关 unlock）
const BASE_POOL = ['DUE-001','DUE-002','DUE-003','DUE-004','DUE-005','DUE-006','DUE-007','DUE-008','DUE-009','DUE-010',
  'DUE-201','DUE-202','DUE-203','DUE-204','DUE-205','DUE-206','DUE-301','DUE-302','DUE-303','DUE-304','DUE-305'];
const CUSTOM_SLOTS = ['custom1', 'custom2', 'custom3'];
// 阵营展示名/主题色（岛卡与工坊分池提示）
const FAC_CN = { strawhat: '草帽同盟', navy: '海军', warlord: '王下七武海', whitebeard: '白胡子海贼团',
  beast: '百兽海贼团', yonko: 'BIG MOM 海贼团', supernova: '极恶世代', revolutionary: '革命军' };
const FAC_COLOR = { strawhat: '#e5484d', navy: '#3d8bfd', warlord: '#2fbf71', whitebeard: '#f5d76e',
  beast: '#9a6dd7', yonko: '#f2994a', supernova: '#4dd4c4', revolutionary: '#e56399' };

// ---------- 存档 ----------
function loadSave() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (s && Array.isArray(s.cleared) && s.decks) {
      // round11 星级迁移：旧档 cleared 内的关无 stars 记录 → 视为 1 星
      if (!s.stars || typeof s.stars !== 'object') s.stars = {};
      for (const id of s.cleared) if (!s.stars[id]) s.stars[id] = 1;
      return s;
    }
  } catch (e) { /* 损坏则重建 */ }
  return { cleared: [], stars: {}, decks: {}, activeDeck: 'default' };
}
let save = loadSave();
const persist = () => localStorage.setItem(SAVE_KEY, JSON.stringify(save));

// ---------- 解锁规则（round11） ----------
// 岛解锁：岛 1 恒开；岛 i 解锁=上一岛 Boss 关通关
function islandOpen(isl) {
  if (isl.id === 1) return true;
  const prev = ISLANDS.find(x => x.id === isl.id - 1);
  return !!(prev && save.cleared.includes(prev.bossStage.id));
}
// 岛内关解锁：普通关线性（岛内前序关通）；Boss 关=4 普通关全通；隐藏关=其余 5 关全 3 星
function stageOpen(st) {
  if (!islandOpen(ISLANDS.find(x => x.id === st.islandId))) return false;
  if (st.kind === 'hidden') return islandStars(st.islandId, st.id) >= (st.needStars || 15);
  if (st.kind === 'boss') {
    const isl = ISLANDS.find(x => x.id === st.islandId);
    return isl.stages.every(s => save.cleared.includes(s.id));
  }
  const isl = ISLANDS.find(x => x.id === st.islandId);
  const idx = isl.stages.findIndex(s => s.id === st.id);
  return idx === 0 || save.cleared.includes(isl.stages[idx - 1].id);
}
// 岛内星级和（排除指定关——隐藏关自身不计入解锁条件）
function islandStars(islandId, excludeId) {
  const isl = ISLANDS.find(x => x.id === islandId);
  let sum = 0;
  for (const s of [...isl.stages, isl.bossStage, isl.hiddenStage].filter(Boolean)) {
    if (s.id === excludeId) continue;
    sum += save.stars[s.id] || 0;
  }
  return sum;
}
function islandTotalStars(islandId) {
  const isl = ISLANDS.find(x => x.id === islandId);
  return [...isl.stages, isl.bossStage, isl.hiddenStage].filter(Boolean).length * 3;
}
// 工坊可用池：基础 21 张 + 通关岛=该岛阵营整池（千卡池全解锁通路）+ 各关 unlock 卡
function unlockedCards() {
  const set = new Set(BASE_POOL);
  for (const isl of ISLANDS) {
    if (save.cleared.includes(isl.bossStage.id)) {
      for (const c of POOL_DATA.cards) if (c.faction === isl.faction) set.add(c.id);
      if (isl.id === 1) for (const c of POOL_DATA.cards) if (c.faction === 'strawhat') set.add(c.id); // 东海=草帽池
    }
  }
  for (const st of DUEL_STAGES) if (st.unlock && save.cleared.includes(st.id)) set.add(st.unlock);
  return set;
}

// ---------- 牌组合法性（与规则 §八/附B 同口径） ----------
function validateDeck(cards) {
  const errs = [];
  if (cards.length !== 20) errs.push(`张数 ${cards.length}/20`);
  const cnt = {};
  for (const id of cards) cnt[id] = (cnt[id] || 0) + 1;
  let chars = 0, negates = 0;
  for (const [id, n] of Object.entries(cnt)) {
    if (n > 2) errs.push(`「${(cardsById[id] || {}).name || id}」×${n} 超同名上限 2`);
    const c = cardsById[id];
    if (!c) { errs.push(`未知卡 ${id}`); continue; }
    if (c.type === 'char') chars += n;
    // 无效化判定兼容两池：DUE category / GLD effect.ops（round11 千卡池打通）
    if (c.type === 'trap' && (c.category === 'negate' ||
      (c.effect && c.effect.ops || []).some(o => o.op === 'negateAttack' || o.op === 'negateMove'))) negates += n;
  }
  if (negates > 2) errs.push(`无效化伏笔 ${negates} 超 2`);
  if (chars < 12 || chars > 14) errs.push(`人物 ${chars} 张（须 12-14）`);
  return errs;
}

// ---------- 大地图渲染（round11：岛屿横轨 + 岛内关卡列表） ----------
let curIsland = 1;
{ // 恢复上次浏览的岛（未存则跳最新解锁岛）
  const saved = save.island;
  if (saved && ISLANDS.some(x => x.id === saved && islandOpen(x))) curIsland = saved;
  else {
    let last = 1;
    for (const isl of ISLANDS) if (islandOpen(isl)) last = isl.id;
    curIsland = last;
  }
}
function starsRow(n, total) {
  return `<span class="stars">${'★'.repeat(n)}${'☆'.repeat(Math.max(0, total - n))}</span>`;
}
function renderStages() {
  const clearedN = save.cleared.length;
  const totalN = DUEL_STAGES.length;
  const starSum = Object.values(save.stars).reduce((a, b) => a + b, 0);
  els.progLine.innerHTML = `征程：<b>${clearedN}/${totalN}</b> 关 · <span class="gold">★${starSum}</span>` +
    (clearedN >= totalN ? ' · <b>伟大航路制霸！</b>' : '');
  renderMap();
  renderTutEntry();
  $('tutEntry').style.display = curIsland === 1 ? '' : 'none'; // 教学入口只在东海显示
  const isl = ISLANDS.find(x => x.id === curIsland);
  const list = [...isl.stages, isl.bossStage, isl.hiddenStage].filter(Boolean);
  els.stageList.innerHTML = list.map(st => {
    const cleared = save.cleared.includes(st.id);
    const open = stageOpen(st);
    const hiddenLocked = st.kind === 'hidden' && !open;
    const cls = ['stage', st.kind === 'boss' ? 'is-boss' : '', st.kind === 'hidden' ? 'is-hidden' : '',
      cleared ? 'cleared' : '', open ? '' : 'locked'].join(' ');
    const profCN = { aggro: '激进', control: '控制', boss: 'BOSS' }[st.aiProfile];
    const kindTag = st.kind === 'boss' ? '<span class="kind-tag boss">决战</span>' : st.kind === 'hidden' ? '<span class="kind-tag hidden">隐藏</span>' : '';
    const myStars = save.stars[st.id] || 0;
    const state = hiddenLocked
      ? `<span class="st-state lock">🔒 全关 3 星解锁（★${islandStars(st.islandId, st.id)}/${st.needStars || 15}）</span>`
      : cleared ? `<span class="st-state ok">✅ 已通关</span>${starsRow(myStars, 3)}`
      : open ? '<span class="st-state" style="color:var(--gold-bright)">⚔ 可挑战</span>'
      : '<span class="st-state lock">🔒 通关上一关解锁</span>';
    const bossLine = st.boss
      ? `<div class="st-boss">船长参战：<b>${st.boss.name}</b>（攻击力 ${st.boss.atk} · 每回合一击）</div>` : '';
    const unl = st.unlock && !hiddenLocked
      ? `<div class="unlock-chip">奖励：${cleared ? `已解锁「${cardsById[st.unlock].name}」` : `<span class="locked-yet">通关解锁「${cardsById[st.unlock].name}」</span>`}</div>`
      : '';
    const art = hiddenLocked
      ? `<div class="art-wrap mystery"><span>?</span></div>`
      : `<div class="art-wrap"><img src="art/${cardsById[st.foeId].art}.webp" alt="${st.foeName}" loading="lazy"></div>`;
    // round12 版面瘦身：intro/船长参战/解锁奖励收进折叠详情（默认一行卡——文字墙主诉）；
    // 点卡片切换展开；隐藏关锁定态保留 ??? 语义文案在主区
    const info = hiddenLocked
      ? `<div class="info">
          <div class="st-name"><span class="idx">第 ${st.id} 关</span>？？？${kindTag}</div>
          <div class="st-place">${isl.name} · 隐秘海域</div>
          <div class="st-intro">岛内其余 5 关全部 3 星（★${islandStars(st.islandId, st.id)}/${st.needStars || 15}），它将现形。</div>
        </div>`
      : `<div class="info">
          <div class="st-name"><span class="idx">第 ${st.id} 关</span>${st.name}${kindTag}<span class="badge ${st.aiProfile}">${profCN}</span></div>
          <div class="st-place"><span class="st-pn">${st.place}</span> · 船长 <b>${st.foeName}</b></div>
          <div class="st-detail">
            ${st.foeTitle ? `<div class="st-foe">${st.foeTitle}</div>` : ''}
            ${bossLine}
            <div class="st-intro">${st.intro}</div>
            ${unl}
          </div>
          <div class="st-toggle">▸ 关卡情报</div>
        </div>`;
    return `<div class="${cls}">
      ${art}
      ${info}
      <div class="st-right">${state}
        ${open && !cleared ? `<button class="fight-btn" data-st="${st.id}">开战</button>` : ''}
        ${cleared ? `<button class="fight-btn" data-st="${st.id}" style="background:linear-gradient(180deg,#3d8bfd,#1d4ed8)">再战</button>` : ''}
      </div>
    </div>`;
  }).join('');
  // 折叠交互（round12）：点卡身切详情（开战按钮/星行等按钮区不触发——stopPropagation 于绑定顺序天然分离）
  els.stageList.querySelectorAll('.stage .info').forEach(el => {
    el.querySelector('.st-toggle')?.addEventListener('click', ev => {
      ev.stopPropagation();
      const card = el.closest('.stage');
      card.classList.toggle('open');
      el.querySelector('.st-toggle').textContent = card.classList.contains('open') ? '▾ 收起情报' : '▸ 关卡情报';
    });
  });
  els.stageList.querySelectorAll('.fight-btn').forEach(b => b.onclick = () => startStage(+b.dataset.st));
}
// 岛屿横轨（点岛切换；锁岛灰态；当前岛金框）
function renderMap() {
  const rail = $('mapRail');
  rail.innerHTML = ISLANDS.map(isl => {
    const open = islandOpen(isl);
    const done = save.cleared.includes(isl.bossStage.id);
    const sum = islandStars(isl.id, -1);
    const tot = islandTotalStars(isl.id);
    const col = FAC_COLOR[isl.faction] || '#d4af37';
    return `<button class="isle ${open ? '' : 'locked'} ${isl.id === curIsland ? 'cur' : ''} ${done ? 'done' : ''}"
      data-isle="${isl.id}" ${open ? '' : 'disabled'} style="--isle-c:${col}">
      <span class="isle-dot"></span>
      <span class="isle-name">${open ? isl.name : '🔒 ???'}</span>
      <span class="isle-fac">${open ? (FAC_CN[isl.faction] || '') : '未探明'}</span>
      <span class="isle-stars">${'★'.repeat(Math.min(3, Math.floor(sum / 6)))}${'☆'.repeat(3 - Math.min(3, Math.floor(sum / 6)))} <i>${sum}/${tot}</i></span>
    </button>`;
  }).join('');
  rail.querySelectorAll('.isle').forEach(b => b.onclick = () => {
    curIsland = +b.dataset.isle;
    save.island = curIsland; persist();
    renderStages();
    rail.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  });
  const cur = rail.querySelector('.cur');
  if (cur) cur.scrollIntoView({ block: 'nearest', inline: 'center' });
}

// 教学入口（Phase 5）：三段直达 duel.html?tutorial=N；已完成打 ✓（gld_tut_done 由 duel-ui 写）
function renderTutEntry() {
  const names = ['登场与战斗', '招式卡', '伏笔与响应'];
  let done = [];
  try { done = JSON.parse(localStorage.getItem('gld_tut_done') || '[]'); } catch (e) { done = []; }
  $('tutBtns').innerHTML = names.map((n, i) =>
    `<a class="tut-link" href="duel.html?tutorial=${i + 1}">${i + 1}. ${n}${done.includes(i + 1) ? ' ✓' : ''}</a>`
  ).join('') + `<a class="tut-link all" href="duel.html?tutorial=1">${done.length >= 3 ? '↺ 全部重看' : '▶ 从头开始'}</a>`;
}

function startStage(stageId) {
  const st = DUEL_STAGES.find(s => s.id === stageId);
  if (!st) return;
  const my = currentDeckCards();
  const errs = validateDeck(my);
  if (errs.length) {
    toast(`牌组不合规：${errs[0]}（在牌组工坊调整）`);
    switchTab('deck');
    return;
  }
  localStorage.setItem(PENDING_KEY, JSON.stringify({
    stageId: st.id, stageName: st.name, islandName: st.islandName || '', islandId: st.islandId || 1,
    foeName: st.foeName, foeId: st.foeId, aiProfile: st.aiProfile, boss: st.boss || null,
    aiHandicap: st.aiHandicap || 0,
    foeDeck: st.deck, myDeck: my, unlockCard: st.unlock || null,
  }));
  location.href = 'duel.html' + (new URLSearchParams(location.search).get('e2eSeed') ? `?e2e=1&seed=${new URLSearchParams(location.search).get('e2eSeed')}` : ''); // C8：E2E 种子透传（仅显式带参时）
}

// ---------- 牌组工坊 ----------
let curSlot = save.activeDeck && (save.activeDeck !== 'default' || true) ? save.activeDeck : 'default';
if (curSlot !== 'default' && !CUSTOM_SLOTS.includes(curSlot)) curSlot = 'default';
let filter = 'all';

function slotName(slot) {
  if (slot === 'default') return DATA.decks.strawhat_default.name;
  return (save.decks[slot] && save.decks[slot].name) || ('自建牌组 ' + (CUSTOM_SLOTS.indexOf(slot) + 1));
}
function currentDeckCards() {
  if (curSlot === 'default') return DATA.decks.strawhat_default.cards.slice();
  return save.decks[curSlot] ? save.decks[curSlot].cards.slice() : [];
}
function setDeckCards(cards) {
  if (curSlot === 'default') { toast('默认牌组不可修改——请选择自建方案'); return false; }
  save.decks[curSlot] = { name: slotName(curSlot), cards };
  save.activeDeck = curSlot;
  persist();
  return true;
}

function renderDeck() {
  // 方案槽
  els.deckSlots.innerHTML = ['default', ...CUSTOM_SLOTS].map(s =>
    `<button class="slot-btn ${s === curSlot ? 'active' : ''}" data-slot="${s}">${slotName(s)}${s === 'default' ? '·预组' : ''}</button>`
  ).join('');
  els.deckSlots.querySelectorAll('.slot-btn').forEach(b => b.onclick = () => {
    curSlot = b.dataset.slot;
    save.activeDeck = curSlot; persist();
    renderDeck();
  });
  // 统计
  const cards = currentDeckCards();
  const errs = validateDeck(cards);
  const chars = cards.filter(id => cardsById[id].type === 'char').length;
  els.deckStats.innerHTML = `<div>张数 <b>${cards.length}</b>/20 · 人物 <b>${chars}</b>（12-14）</div>` +
    (errs.length ? `<div class="err">✖ ${errs.join('；')}</div>` : `<div class="okline">✔ 合规，可以出战</div>`) +
    (curSlot === 'default' ? '<div style="color:#7e93ba;font-size:12px">默认预组（不可改）· 在自建方案中自由构筑</div>' : '');
  // 卡池
  const unlocked = unlockedCards();
  const poolIds = Object.keys(cardsById).filter(id => unlocked.has(id));
  const cnt = {};
  for (const id of cards) cnt[id] = (cnt[id] || 0) + 1;
  const baseSet = new Set(BASE_POOL);
  // 过滤按钮带各类计数（一眼看出该类还有多少可选）
  const typeCnt = { all: poolIds.length, char: 0, move: 0, trap: 0 };
  for (const id of poolIds) typeCnt[cardsById[id].type]++;
  document.querySelectorAll('.fbtn').forEach(b => {
    const f = b.dataset.f;
    b.textContent = ({ all: '全部', char: '人物', move: '招式', trap: '伏笔' })[f] + ` ${typeCnt[f]}`;
  });
  const shown = poolIds.filter(id => filter === 'all' || cardsById[id].type === filter);
  els.pool.innerHTML = shown.map(id => {
    const c = cardsById[id];
    const n = cnt[id] || 0;
    const stats = c.type === 'char'
      ? `<div class="stats"><span class="atk">${c.atk}</span><span style="color:#6b5a33">Lv${c.level}</span><span class="def">${c.def}</span></div>`
      : `<div class="stats"><span style="font-size:8.5px;color:#4a3d20;padding:0 2px 3px">${(c.effect.ops || []).length ? shortFx(c) : ''}</span></div>`;
    return `<div class="pool-card ${c.type !== 'char' ? 't-' + c.type : ''}" data-id="${id}" title="${c.desc}">
      <img class="part" src="art/${c.art}.webp" alt="${c.name}" loading="lazy">
      ${c.type !== 'char' ? `<span class="tbadge">${c.type === 'move' ? '招' : '伏'}</span>` : ''}
      ${!baseSet.has(id) ? '<span class="newchip">NEW</span>' : ''}
      ${n ? `<span class="cnt">×${n}</span>` : ''}
      <div class="nm">${c.name}</div><div class="sub">${c.sub}</div>${stats}
    </div>`;
  }).join('');
  els.pool.querySelectorAll('.pool-card').forEach(el => el.onclick = () => addCard(el.dataset.id));
  if (!shown.length) els.pool.innerHTML = '<div class="pool-empty">该类型暂无可选卡</div>';
  // 构筑清单：人物/招式/伏笔分组 + 组头计数 + 20 张进度条
  const order = {};
  cards.forEach(id => order[id] = (order[id] || 0) + 1);
  let rows = `<div class="bclose" id="bClose">▾ 收起构筑</div>
    <h3>当前构筑 <span class="bprog">${cards.length}/20</span></h3>
    <div class="bbar"><i style="width:${Math.min(100, cards.length / 20 * 100)}%"></i></div>
    <div class="bhint">点卡池加入 · 点条目移除</div>`;
  let any = false;
  for (const [t, label] of [['char', '⚔ 人物'], ['move', '✦ 招式'], ['trap', '◈ 伏笔']]) {
    const items = Object.entries(order).filter(([id]) => cardsById[id].type === t);
    if (!items.length) continue;
    any = true;
    const nSum = items.reduce((s, [, n]) => s + n, 0);
    rows += `<div class="bgrp">${label} <span>${nSum}</span></div>` + items.map(([id, n]) => {
      const c = cardsById[id];
      return `<div class="brow" data-id="${id}"><span class="bn">${c.name}<small>${c.type === 'char' ? `Lv${c.level} ${c.atk}/${c.def}` : (c.type === 'move' ? '招式' : '伏笔')}</small></span><span class="bx">×${n}</span></div>`;
    }).join('');
  }
  if (!any) rows += '<div class="bempty">空——从卡池点击加入</div>';
  els.built.innerHTML = rows;
  els.built.querySelectorAll('.brow').forEach(el => el.onclick = () => removeCard(el.dataset.id));
  const bc = $('bClose');
  if (bc) bc.onclick = () => els.built.classList.remove('open');
  if (els.deckFab) els.deckFab.textContent = `构筑 ${cards.length}/20`;
}

function addCard(id) {
  if (curSlot === 'default') return toast('默认牌组不可修改——选择自建方案');
  const cards = currentDeckCards();
  if (cards.length >= 20) return toast('已满 20 张——先移除再添加');
  const n = cards.filter(x => x === id).length;
  if (n >= 2) return toast(`「${cardsById[id].name}」已达同名上限 2`);
  if (!unlockedCards().has(id)) return toast('该卡尚未解锁');
  cards.push(id);
  if (setDeckCards(cards)) renderDeck();
}
function removeCard(id) {
  const cards = currentDeckCards();
  const i = cards.lastIndexOf(id);
  if (i < 0) return;
  cards.splice(i, 1);
  if (setDeckCards(cards)) renderDeck();
}
function shortFx(d) {
  return (d.effect.ops || []).map(o => ({
    damage: `伤${o.amount}`, atkDelta: `攻${o.amount >= 0 ? '+' : ''}${o.amount}`, defDelta: `守${o.amount >= 0 ? '+' : ''}${o.amount}`,
    destroy: '破坏', setPosDef: '转守', negateAttack: '无效攻', negateMove: '无效招', equip: `装备+${o.amount}`,
  }[o.op] || '')).join('·');
}

// ---------- tabs ----------
function switchTab(name) {
  els.tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  for (const [k, pane] of Object.entries(els.panes)) pane.classList.toggle('hidden', k !== name);
}
els.tabs.forEach(t => t.onclick = () => switchTab(t.dataset.tab));
// 过滤按钮（体验 round2 修复：原先无绑定，点击不生效）+ 手机构筑胶囊
document.querySelectorAll('.fbtn').forEach(b => b.onclick = () => {
  filter = b.dataset.f;
  document.querySelectorAll('.fbtn').forEach(x => x.classList.toggle('active', x === b));
  renderDeck();
});
if (els.deckFab) els.deckFab.onclick = () => els.built.classList.toggle('open');

let toastTimer = null;
function toast(msg) {
  els.toast.textContent = msg;
  els.toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.add('hidden'), 2400);
}

// 启动：从对局页胜利返回时可能带 ?tab=deck
const params = new URLSearchParams(location.search);
switchTab(params.get('tab') === 'deck' ? 'deck' : 'stages');
renderStages();
renderDeck();
