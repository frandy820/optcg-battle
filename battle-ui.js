// battle-ui.js — round6 R6-D：直接对战（阵营选择→对手/强度→牌组工坊→开战）
// 数据：DUEL_CARDS_DATA（32 张东海基础）+ duel-pool（339 张 GLD 转译）→ 全池 371
// 对局交接：gld_duel_pending {mode:'vs', myDeck, foeDeck, aiProfile, foeName,...} → duel.html 一次性消费
'use strict';
import DUEL_CARDS_DATA from './data/duel-cards.js?v=a653202';
import POOL from './data/duel-pool.js?v=a653202';

const FACTION_CN = {
  navy: '海军', warlord: '王下七武海', strawhat: '草帽一伙', beast: '百兽海贼团',
  whitebeard: '白胡子海贼团', supernova: '极恶世代', yonko: '四皇', revolutionary: '革命军',
};
const FACTION_ART = {}; // 阵营代表卡图（取该阵营 atk 最高 char）
const byId = {};
for (const c of [...DUEL_CARDS_DATA.cards, ...POOL.cards]) byId[c.id] = c;

const $ = id => document.getElementById(id);
const LS_CFG = 'gld_vs_cfg';   // 上次配置（阵营/对手/强度/牌组）
const state = {
  my: null, foe: null, ai: 'aggro', deck: [],
  wsFilter: 'all', editing: false,
};
try { Object.assign(state, JSON.parse(localStorage.getItem(LS_CFG) || '{}').state || {}); } catch (e) { /* */ }

// ---------- 阵营数据 ----------
const factions = {};
for (const c of POOL.cards) {
  if (!c.faction) continue;
  (factions[c.faction] = factions[c.faction] || { key: c.faction, chars: [], gears: [] });
  if (c.type === 'char') factions[c.faction].chars.push(c);
  else factions[c.faction].gears.push(c);
}
for (const f of Object.values(factions)) {
  f.chars.sort((a, b) => b.atk - a.atk);
  FACTION_ART[f.key] = f.chars[0].art;
}

// ---------- 推荐牌组：阵营曲线取样（12 种 char 各 1 + 低级补 2 张 + gear 2 = 20） ----------
function autoDeck(fk) {
  const f = factions[fk];
  const lv = n => f.chars.filter(c => c.level === n);
  const pick = [];   // 候选序列（曲线：中坚为主，高低两端适量）
  const bands = [[2, 2], [3, 4], [4, 3], [5, 2], [6, 1], [1, 1], [7, 1]]; // [level, 取几张]
  for (const [n, k] of bands) for (const c of lv(n).slice(0, k)) pick.push(c.id);
  // 不足 18 char 用全阵营补
  for (const c of f.chars) { if (pick.length >= 18) break; if (!pick.includes(c.id)) pick.push(c.id); }
  // 低级卡补第 2 张至 18
  for (const c of f.chars.slice().reverse()) { if (pick.length >= 18) break; if (pick.filter(x => x === c.id).length === 1) pick.push(c.id); }
  const deck = pick.slice(0, 18);
  for (const g of f.gears.slice(0, 2)) deck.push(g.id); // 装备招式 2 张
  while (deck.length < 20) { const c = f.chars[deck.length % f.chars.length]; if (deck.filter(x => x === c.id).length < 2) deck.push(c.id); else break; }
  return deck.slice(0, 20);
}
function deckOk(d) {
  if (d.length !== 20) return `张数 ${d.length}/20`;
  const cnt = {};
  for (const id of d) { cnt[id] = (cnt[id] || 0) + 1; if (cnt[id] > 2) return `${byId[id].name} 超过 2 张`; }
  return null;
}

// ---------- 渲染 ----------
function toast(msg) {
  const t = $('toast'); t.textContent = msg; t.classList.remove('hidden');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.add('hidden'), 2200);
}
function saveCfg() {
  try { localStorage.setItem(LS_CFG, JSON.stringify({ v: 1, state: { my: state.my, foe: state.foe, ai: state.ai, deck: state.deck } })); } catch (e) { /* */ }
}

function renderFactions() {
  const g = $('factionGrid');
  g.innerHTML = Object.values(factions).map(f => {
    const maxA = f.chars[0].atk;
    const stars = Math.min(5, Math.ceil(maxA / 700));
    return `<button class="fc ${state.my === f.key ? 'sel' : ''}" data-f="${f.key}">
      <b>${FACTION_CN[f.key]}</b>
      <span class="n">${f.chars.length} 名角色 · ${f.gears.length} 装备</span>
      <span class="star">${'★'.repeat(stars)}${'☆'.repeat(5 - stars)} 最强 ${maxA}</span>
    </button>`;
  }).join('');
  g.querySelectorAll('.fc').forEach(el => el.onclick = () => {
    state.my = el.dataset.f;
    state.deck = autoDeck(state.my); // 换阵营重置推荐牌组
    saveCfg(); renderFactions(); showStep(2);
  });
}
function renderFoes() {
  const box = $('foeChips');
  const others = Object.values(factions).filter(f => f.key !== state.my);
  box.innerHTML = others.map(f =>
    `<button data-f="${f.key}" class="${state.foe === f.key ? 'sel' : ''}">${FACTION_CN[f.key]}</button>`).join('')
    + `<button data-f="random" class="${state.foe === 'random' || !state.foe ? 'sel' : ''}">🎲 随机</button>`;
  box.querySelectorAll('button').forEach(el => el.onclick = () => { state.foe = el.dataset.f; saveCfg(); renderFoes(); });
  const ai = $('aiChips');
  const AI_CN = { aggro: '凶猛（攻抢）', control: '老练（控场）', boss: '残暴（全力）' };
  ai.innerHTML = Object.keys(AI_CN).map(k => `<button data-a="${k}" class="${state.ai === k ? 'sel' : ''}">${AI_CN[k]}</button>`).join('');
  ai.querySelectorAll('button').forEach(el => el.onclick = () => { state.ai = el.dataset.a; saveCfg(); renderFoes(); });
}
function renderDeck() {
  const ok = deckOk(state.deck);
  const cnt = {}; for (const id of state.deck) cnt[id] = (cnt[id] || 0) + 1;
  $('deckSummary').innerHTML = state.deck.map(id => {
    const c = byId[id];
    return `<div class="mini ${cnt[id] > 1 ? 'dupe' : ''}" title="${c.name}">
      <img src="art/${c.art}.webp" loading="lazy" alt=""><span>${c.name}</span></div>`;
  }).join('');
  const foeK = (state.foe === 'random' || !state.foe) ? randomFoe() : state.foe;
  $('vsLine').innerHTML = `<span class="who"><b>${FACTION_CN[state.my]}</b>（你）</span>
    <span class="vs-badge">VS</span>
    <span class="who"><b>${FACTION_CN[foeK]}</b>（电脑）</span>`;
  const fight = $('btnFight');
  fight.disabled = !!ok; fight.style.opacity = ok ? .5 : 1;
  renderWorkshop();
}
function randomFoe() {
  const ks = Object.keys(factions).filter(k => k !== state.my);
  return ks[Math.floor(Math.random() * ks.length)];
}

// ---------- 工坊 ----------
function renderWorkshop() {
  if (!state.editing) { $('workshop').classList.add('hidden'); return; }
  $('workshop').classList.remove('hidden');
  const ok = deckOk(state.deck);
  const cnt = {}; for (const id of state.deck) cnt[id] = (cnt[id] || 0) + 1;
  $('wsCount').textContent = `已选 ${state.deck.length}/20` + (ok ? ` · ${ok}` : ' · 合规 ✓');
  $('wsCount').className = 'ws-count' + (ok ? ' bad' : '');
  // 过滤器：all + 阵营 + 类型
  const fbox = $('wsFilter');
  const filters = [['all', '全部'], ['myF', FACTION_CN[state.my] + '（我方）'],
    ...Object.keys(factions).filter(k => k !== state.my).map(k => [k, FACTION_CN[k]]),
    ['char', '人物'], ['equip', '装备'], ['DUE', '东海基础']];
  fbox.innerHTML = filters.map(([k, n]) => `<button data-k="${k}" class="${state.wsFilter === k ? 'on' : ''}">${n}</button>`).join('');
  fbox.querySelectorAll('button').forEach(el => el.onclick = () => { state.wsFilter = el.dataset.k; renderWorkshop(); });
  // 池网格
  let pool = [...DUEL_CARDS_DATA.cards, ...POOL.cards];
  const fk = state.wsFilter;
  if (fk === 'myF') pool = pool.filter(c => c.faction === state.my);
  else if (fk === 'char') pool = pool.filter(c => c.type === 'char');
  else if (fk === 'equip') pool = pool.filter(c => c.moveKind === 'equip');
  else if (fk === 'DUE') pool = pool.filter(c => c.id.startsWith('DUE-'));
  else if (fk !== 'all') pool = pool.filter(c => c.faction === fk);
  pool.sort((a, b) => (b.atk || 0) - (a.atk || 0));
  $('poolGrid').innerHTML = pool.slice(0, 120).map(c => {
    const n = cnt[c.id] || 0;
    return `<div class="pc ${n ? 'picked' : ''} ${n >= 2 ? 'maxed' : ''}" data-id="${c.id}" title="${c.name} ${c.desc || ''}">
      ${n ? `<span class="pickn">${n}</span>` : ''}
      <img src="art/${c.art}.webp" loading="lazy" alt="${c.name}">
      <div class="nm">${c.name}</div>
      <div class="st">${c.type === 'char' ? `Lv${c.level} ${c.atk}/${c.def}` : c.moveKind === 'equip' ? '装备' : (c.type === 'trap' ? '伏笔' : '招式')}</div>
    </div>`;
  }).join('');
  $('poolGrid').querySelectorAll('.pc').forEach(el => el.onclick = () => {
    const id = el.dataset.id;
    const n = state.deck.filter(x => x === id).length;
    if (n >= 2) return toast('同名卡最多 2 张');
    if (state.deck.length >= 20) return toast('牌组已满 20 张，先移除一张');
    state.deck.push(id); saveCfg(); renderDeck();
  });
  // 已选清单
  $('wsPicked').innerHTML = Object.keys(cnt).map(id => {
    const c = byId[id];
    return `<div class="row"><span>${c.name}${cnt[id] > 1 ? ' ×' + cnt[id] : ''}</span>
      <button data-id="${id}">✕</button></div>`;
  }).join('');
  $('wsPicked').querySelectorAll('button').forEach(el => el.onclick = () => {
    const id = el.dataset.id;
    state.deck.splice(state.deck.indexOf(id), 1); saveCfg(); renderDeck();
  });
}

// ---------- 步骤切换 ----------
function showStep(n) {
  $('stepFaction').classList.toggle('hidden', n !== 1);
  $('stepFoe').classList.toggle('hidden', n !== 2);
  $('stepDeck').classList.toggle('hidden', n !== 3);
  if (n >= 2) renderFoes();
  if (n >= 3) renderDeck();
  scrollTo({ top: 0 });
}

// ---------- 事件 ----------
$('btnDeck').onclick = () => showStep(3);
$('btnEdit').onclick = () => {
  state.editing = !state.editing;
  $('btnEdit').textContent = state.editing ? '✓ 完成' : '✎ 编辑';
  renderWorkshop();
};
$('wsSave').onclick = () => {
  const ok = deckOk(state.deck);
  if (ok) return toast(ok);
  state.editing = false; $('btnEdit').textContent = '✎ 编辑';
  saveCfg(); renderDeck(); toast('牌组已保存');
};
$('wsAuto').onclick = () => { state.deck = autoDeck(state.my); saveCfg(); renderDeck(); toast('已生成推荐牌组'); };
$('btnFight').onclick = () => {
  const ok = deckOk(state.deck);
  if (ok) return toast(ok);
  const foeK = state.foe === 'random' || !state.foe ? randomFoe() : state.foe;
  const foeDeck = autoDeck(foeK);
  localStorage.setItem('gld_duel_pending', JSON.stringify({
    mode: 'vs', myFaction: state.my, foeFaction: foeK,
    myDeck: state.deck, foeDeck, aiProfile: state.ai,
    foeName: FACTION_CN[foeK], // duel-ui 拼「（AI）」；阵营名不带军团后缀（防「七武海军团」歧义）
    stageId: 0, stageName: FACTION_CN[foeK], // duel-ui 兼容字段（mode=vs 不消费闯关语义）
  }));
  location.href = 'duel.html';
};

// ---------- 启动 ----------
if (state.deck?.length && state.my && factions[state.my] && !deckOk(state.deck)) {
  // 上次配置完整：直接跳步骤 3（快开一局）
  showStep(3);
} else {
  if (state.my && factions[state.my]) state.deck = autoDeck(state.my); // 阵营在但牌组坏→重置推荐
  showStep(state.my ? 2 : 1);
}
renderFactions();
