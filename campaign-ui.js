// 东海篇闯关 + 牌组工坊 UI（Phase 4）
// 进度/牌组存 localStorage；开战写 gld_duel_pending → duel.html 开局；胜利由 duel-ui 回写通关。
'use strict';
import DATA from './data/duel-cards.js';
import STAGES from './data/duel-stages.js';

const cardsById = {};
for (const c of DATA.cards) cardsById[c.id] = c;
const $ = id => document.getElementById(id);
const els = {
  progLine: $('progLine'), stageList: $('stageList'),
  deckSlots: $('deckSlots'), deckStats: $('deckStats'), pool: $('pool'), built: $('built'),
  tabs: [...document.querySelectorAll('.tab')], panes: { stages: $('tab-stages'), deck: $('tab-deck') },
  toast: $('toast'),
};

const SAVE_KEY = 'gld_campaign_v1';
const PENDING_KEY = 'gld_duel_pending';
// 玩家基础可用卡池：草帽团/伙伴侧 + 招式伏笔；敌方人物须通关解锁（stages.unlock）
const BASE_POOL = ['DUE-001','DUE-002','DUE-003','DUE-004','DUE-005','DUE-006','DUE-007','DUE-008','DUE-009','DUE-010',
  'DUE-201','DUE-202','DUE-203','DUE-204','DUE-205','DUE-206','DUE-301','DUE-302','DUE-303','DUE-304','DUE-305'];
const CUSTOM_SLOTS = ['custom1', 'custom2', 'custom3'];

// ---------- 存档 ----------
function loadSave() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (s && Array.isArray(s.cleared) && s.decks) return s;
  } catch (e) { /* 损坏则重建 */ }
  return { cleared: [], decks: {}, activeDeck: 'default' };
}
let save = loadSave();
const persist = () => localStorage.setItem(SAVE_KEY, JSON.stringify(save));

function unlockedCards() {
  const set = new Set(BASE_POOL);
  for (const st of STAGES) if (st.unlock && save.cleared.includes(st.id)) set.add(st.unlock);
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
    if (n > 2) errs.push(`「${cardsById[id].name}」×${n} 超同名上限 2`);
    const c = cardsById[id];
    if (!c) { errs.push(`未知卡 ${id}`); continue; }
    if (c.type === 'char') chars += n;
    if (c.type === 'trap' && c.category === 'negate') negates += n;
  }
  if (negates > 2) errs.push(`无效化伏笔 ${negates} 超 2`);
  if (chars < 12 || chars > 14) errs.push(`人物 ${chars} 张（须 12-14）`);
  return errs;
}

// ---------- 关卡渲染 ----------
function renderStages() {
  const clearedN = save.cleared.length;
  els.progLine.innerHTML = `征程：<b>${clearedN}/8</b> 关通关` + (clearedN >= 8 ? ' · <b>东海篇制霸！</b>' : '');
  els.stageList.innerHTML = STAGES.map(st => {
    const cleared = save.cleared.includes(st.id);
    const open = st.id === 1 || save.cleared.includes(st.id - 1);
    const cls = ['stage', cleared ? 'cleared' : '', open ? '' : 'locked'].join(' ');
    const profCN = { aggro: '激进', control: '控制', boss: 'BOSS' }[st.aiProfile];
    const state = cleared ? '<span class="st-state ok">✅ 已通关</span>'
      : open ? '<span class="st-state" style="color:var(--gold-bright)">⚔ 可挑战</span>'
      : '<span class="st-state lock">🔒 通关上一关解锁</span>';
    const unl = st.unlock
      ? `<div class="unlock-chip">奖励：${save.cleared.includes(st.id) ? `已解锁「${cardsById[st.unlock].name}」` : `<span class="locked-yet">通关解锁「${cardsById[st.unlock].name}」</span>`}</div>`
      : '';
    return `<div class="${cls}">
      <div class="art-wrap"><img src="art/${cardsById[st.foeId].art}.webp" alt="${st.foeName}" loading="lazy"></div>
      <div class="info">
        <div class="st-name"><span class="idx">第 ${st.id} 关</span>${st.name}<span class="badge ${st.aiProfile}">${profCN}</span></div>
        <div class="st-place">${st.place}</div>
        <div class="st-foe">船长：<b>${st.foeName}</b>（${st.foeTitle}）</div>
        <div class="st-intro">${st.intro}</div>
      </div>
      <div class="st-right">${state}
        ${open && !cleared ? `<button class="fight-btn" data-st="${st.id}">开战</button>` : ''}
        ${cleared ? `<button class="fight-btn" data-st="${st.id}" style="background:linear-gradient(180deg,#3d8bfd,#1d4ed8)">再战</button>` : ''}
        ${unl}
      </div>
    </div>`;
  }).join('');
  els.stageList.querySelectorAll('.fight-btn').forEach(b => b.onclick = () => startStage(+b.dataset.st));
}

function startStage(stageId) {
  const st = STAGES.find(s => s.id === stageId);
  if (!st) return;
  const my = currentDeckCards();
  const errs = validateDeck(my);
  if (errs.length) {
    toast(`牌组不合规：${errs[0]}（在牌组工坊调整）`);
    switchTab('deck');
    return;
  }
  localStorage.setItem(PENDING_KEY, JSON.stringify({
    stageId: st.id, stageName: st.name, foeName: st.foeName, aiProfile: st.aiProfile,
    foeDeck: st.deck, myDeck: my, unlockCard: st.unlock || null,
  }));
  location.href = 'duel.html';
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
  els.pool.innerHTML = poolIds.filter(id => filter === 'all' || cardsById[id].type === filter).map(id => {
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
  // 构筑清单
  const order = {};
  cards.forEach(id => order[id] = (order[id] || 0) + 1);
  const rows = Object.entries(order).map(([id, n]) => {
    const c = cardsById[id];
    return `<div class="brow" data-id="${id}"><span class="bn">${c.name}<small>${c.type === 'char' ? `Lv${c.level} ${c.atk}/${c.def}` : (c.type === 'move' ? '招式' : '伏笔')}</small></span><span class="bx">×${n}</span></div>`;
  }).join('');
  els.built.innerHTML = `<h3>当前构筑（点击卡池加入 / 点击条目移除）</h3>` +
    (rows || '<div class="bempty">空——从卡池点击加入</div>') + rows;
  els.built.querySelectorAll('.brow').forEach(el => el.onclick = () => removeCard(el.dataset.id));
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
