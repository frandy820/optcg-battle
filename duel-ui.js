// 伟大航路决斗 — 决斗桌 UI（Phase 2）
// 与 AI 共用 duel/engine.js 同一 applyAction 入口；非法操作提示原因（规则 §四/§七.5）。
'use strict';
import { DUEL } from './duel/engine.js';
import { DUEL_AI } from './duel/ai.js';
import DUEL_CARDS_DATA from './data/duel-cards.js';

const cardsById = {};
for (const c of DUEL_CARDS_DATA.cards) cardsById[c.id] = c;

const $ = id => document.getElementById(id);
const els = {
  turnChip: $('turnChip'), phaseBar: $('phaseBar'), hint: $('hint'),
  foeName: $('foeName'), foeLpBar: $('foeLpBar'), foeLpNum: $('foeLpNum'),
  foeDeckN: $('foeDeckN'), foeHandN: $('foeHandN'), foeGraveN: $('foeGraveN'),
  foeHand: $('foeHand'), foeBoard: $('foeBoard'),
  myName: $('myName'), myLpBar: $('myLpBar'), myLpNum: $('myLpNum'),
  myDeckN: $('myDeckN'), myGraveN: $('myGraveN'), myBoard: $('myBoard'), myHand: $('myHand'),
  log: $('battleLog'), btnNext: $('btnNext'), btnRestart: $('btnRestart'), btnHelp: $('btnHelp'),
  modal: $('modal'), modalBox: $('modalBox'), toast: $('toast'),
  btnDirect: $('btnDirect'), endOverlay: $('endOverlay'), endTitle: $('endTitle'), endSub: $('endSub'), btnAgain: $('btnAgain'),
};

const PH_CN = { draw: '抽牌', standby: '准备', main1: '主要阶段1', battle: '战斗阶段', main2: '主要阶段2', end: '结束阶段' };
const AI_DELAY = 620;

let g = null;
let sel = null;          // 当前选中攻击者 uid（战斗阶段）
let logShown = 0;
let aiTimer = null;
let busy = false;        // 动画/AI 播放中锁输入（与"等待响应"视觉区分，规则 §七.5）

// ---------- 建局 ----------
function start() {
  stopAi();
  const seed = (Date.now() ^ (Math.random() * 1e9)) >>> 0;
  g = DUEL.newGame(cardsById, {
    seed,
    decks: [DUEL_CARDS_DATA.decks.strawhat_default.cards, DUEL_CARDS_DATA.decks.eastblue_aggro.cards],
    names: ['玩家', '亚尔丽塔（AI）'],
  });
  sel = null; logShown = 0; busy = false;
  els.log.innerHTML = '';
  els.endOverlay.classList.add('hidden');
  els.modal.classList.add('hidden');
  pushLog('与「东海野心家」亚尔丽塔的决斗开始！'); pushLog('提示：先手第一回合不抽牌。');
  // 开局：先手玩家的抽牌阶段无动作 → 快速推进到 main1
  DUEL.applyAction(g, cardsById, 0, { t: 'nextPhase' }); // draw → standby（先手不抽）
  DUEL.applyAction(g, cardsById, 0, { t: 'nextPhase' }); // standby → main1
  render();
}

// ---------- 渲染 ----------
function render() {
  if (!g) return;
  const [P, E] = g.players;
  els.turnChip.textContent = `第 ${g.turn} 回合 · ${g.active === 0 ? '你的回合' : '对方回合'}`;
  document.querySelectorAll('.ph').forEach(el => el.classList.toggle('active', el.dataset.ph === g.phase));
  els.foeLpNum.textContent = Math.max(0, E.lp);
  els.foeLpBar.innerHTML = `<i style="width:${Math.max(0, E.lp) / 4000 * 100}%"></i>`;
  els.myLpNum.textContent = Math.max(0, P.lp);
  els.myLpBar.innerHTML = `<i style="width:${Math.max(0, P.lp) / 4000 * 100}%"></i>`;
  els.foeDeckN.textContent = E.deck.length; els.foeHandN.textContent = E.hand.length; els.foeGraveN.textContent = E.grave.length;
  els.myDeckN.textContent = P.deck.length; els.myGraveN.textContent = P.grave.length;

  els.foeHand.innerHTML = E.hand.map(() => '<div class="cardback"></div>').join('');
  els.foeBoard.innerHTML = E.board.map(u => unitCard(u, false)).join('') || emptySlots(E.board.length);
  els.myBoard.innerHTML = P.board.map(u => unitCard(u, true)).join('') || emptySlots(P.board.length);
  els.myHand.innerHTML = P.hand.map(h => handCard(h)).join('');
  bindCards();
  renderLog();
  renderHint();
  updateNextBtn();
  if (g.winner !== null) showEnd();
  if (g.active === 1 && g.winner === null && !aiTimer) scheduleAi();
}

function emptySlots(n) { return Array.from({ length: 3 - n }, () => '<div class="slot"></div>').join(''); }

function unitCard(u, mine) {
  const d = cardsById[u.cardId];
  const cls = ['card', 'unit', u.pos === 'def' ? 'pos-def' : '', u.attacked ? 'attacked' : '',
    mine && clickable(u) ? 'playable' : '', sel === u.uid ? 'selected' : '',
    !mine && sel ? 'targetable' : ''].join(' ');
  return `<div class="${cls}" data-uid="${u.uid}" title="${d.name} Lv${d.level} ATK${d.atk}/DEF${d.def}">
    <img class="art" src="art/${d.art}.webp" alt="${d.name}" loading="lazy">
    <span class="lv">${d.level}</span>
    <div class="nm">${d.name}</div><div class="sub">${d.sub}</div>
    <div class="stats"><span class="atk">${d.atk}</span><span class="def">${d.def}</span></div>
  </div>`;
}
function handCard(h) {
  const d = cardsById[h.cardId];
  const can = myPhaseMain() && g.players[0].summoned === 0 && (d.level <= 4 ? g.players[0].board.length < 3 : true);
  return `<div class="card hand-card ${can ? 'playable' : ''}" data-huid="${h.uid}" title="${d.name}">
    <img class="art" src="art/${d.art}.webp" alt="${d.name}" loading="lazy">
    <span class="lv">${d.level}</span>
    <div class="nm">${d.name}</div><div class="sub">${d.sub}</div>
    <div class="stats"><span class="atk">${d.atk}</span><span class="def">${d.def}</span></div>
  </div>`;
}

function myPhaseMain() { return g.active === 0 && (g.phase === 'main1' || g.phase === 'main2') && g.winner === null; }
function clickable(u) { // 我方场上人物：战斗阶段可攻击者 或 攻击发起选择中
  if (g.active !== 0 || g.winner !== null) return false;
  if (g.phase === 'battle') return DUEL.canAttack(g, cardsById, 0, u.uid, g.players[1].board.length ? g.players[1].board[0].uid : null).ok;
  return false;
}

function renderLog() {
  while (logShown < g.log.length) {
    const l = g.log[logShown++];
    const div = document.createElement('div');
    div.className = 'l' + (/获胜|平局|直接攻击|解放/.test(l.msg) ? ' hl' : '') + (/LP -0|落空/.test(l.msg) ? '' : '');
    div.textContent = l.msg;
    els.log.appendChild(div);
  }
  els.log.scrollTop = els.log.scrollHeight;
}

function renderHint() {
  if (g.winner !== null) { setHint('— 决斗结束 —'); return; }
  if (busy) { setHint('对方思考中…', true); return; }
  if (g.active === 1) { setHint('对方回合', true); return; }
  const who = `${PH_CN[g.phase]}：`;
  const map = {
    draw: '抽牌阶段', standby: '准备阶段',
    main1: '点手牌登场人物 · 点场上人物无操作 · 完成后按「下一步」',
    battle: sel ? '选择攻击目标（高亮的敌方人物）或「直接攻击」' : '点自己的攻击表示人物发起攻击，或「下一步」跳过',
    main2: '还可登场/切换表示，或「下一步」进入结束',
    end: '按「结束回合」交给对方',
  };
  setHint(who + map[g.phase], true);
}
function setHint(t, warn) { els.hint.textContent = t; els.hint.className = warn ? 'warn' : ''; }

function updateNextBtn() {
  const b = els.btnNext;
  if (g.winner !== null) { b.disabled = true; b.textContent = '对决结束'; return; }
  b.disabled = g.active !== 0 || busy;
  b.textContent = g.phase === 'end' ? '结束回合 ✓' : g.phase === 'main1' ? '进入战斗 ⚔' : '下一步 ›';
}

// ---------- 交互绑定 ----------
function bindCards() {
  els.myHand.querySelectorAll('.hand-card').forEach(el => {
    el.onclick = () => onHandClick(el.dataset.huid);
  });
  els.myBoard.querySelectorAll('.unit').forEach(el => {
    el.onclick = () => onMyUnitClick(el.dataset.uid);
  });
  els.foeBoard.querySelectorAll('.unit').forEach(el => {
    el.onclick = () => onFoeUnitClick(el.dataset.uid);
  });
}

function onHandClick(huid) {
  if (busy || !myPhaseMain()) return toast('只能在你的主要阶段登场');
  const h = g.players[0].hand.find(x => x.uid === huid);
  if (!h) return;
  if (g.players[0].summoned >= 1) return toast('本回合通常登场次数已用完（每回合 1 次）');
  const d = cardsById[h.cardId];
  const need = d.level >= 7 ? 2 : d.level >= 5 ? 1 : 0;
  if (need === 0 && g.players[0].board.length >= 3) return toast('人物区已满（3 格）——可通过解放腾位');
  if (need > 0 && g.players[0].board.length < need) return toast(`Lv${d.level} 人物需要解放 ${need} 名场上人物，你场上不足`);
  showSummonModal(h, d, need);
}

function showSummonModal(h, d, need) {
  const my = g.players[0];
  let tributeSel = [];
  const html = [];
  html.push(`<div class="card-preview">
    <div class="card"><img class="art" src="art/${d.art}.webp"><span class="lv">${d.level}</span>
      <div class="nm">${d.name}</div><div class="sub">${d.sub}</div>
      <div class="stats"><span class="atk">${d.atk}</span><span class="def">${d.def}</span></div></div>
    <div class="meta"><b>${d.name}</b>（Lv${d.level}）<br>攻击力 ${d.atk} / 守备力 ${d.def}<br>${d.role}<br>${d.desc}</div>
  </div>`);
  if (need > 0) {
    html.push(`<h3 style="margin-top:12px">选择解放对象（${need} 名）</h3><div id="triList">`);
    for (const u of my.board) {
      const ud = cardsById[u.cardId];
      html.push(`<button class="opt tri" data-uid="${u.uid}">${ud.name}（ATK${ud.atk}/DEF${ud.def}）</button>`);
    }
    html.push('</div>');
  }
  html.push(`<div id="posOpts" style="margin-top:10px">
    <button class="opt" data-pos="atk">⚔ 攻击表示登场（竖放，可攻击）</button>
    <button class="opt" data-pos="def">🛡 守备表示登场（横放，不易被破）</button>
    <button class="cancel">取消</button>
  </div>`);
  els.modalBox.innerHTML = html.join('');
  els.modal.classList.remove('hidden');

  els.modalBox.querySelectorAll('.tri').forEach(b => b.onclick = () => {
    const uid = b.dataset.uid;
    const i = tributeSel.indexOf(uid);
    if (i >= 0) { tributeSel.splice(i, 1); b.style.borderColor = ''; }
    else {
      if (tributeSel.length >= need) return toast(`最多选择 ${need} 名`);
      tributeSel.push(uid); b.style.borderColor = 'var(--gold-bright)';
    }
    els.modalBox.querySelector('#posOpts').querySelectorAll('.opt[data-pos]').forEach(pb => {
      pb.disabled = need > 0 && tributeSel.length !== need;
      pb.style.opacity = pb.disabled ? .45 : 1;
    });
  });
  els.modalBox.querySelectorAll('.opt[data-pos]').forEach(b => b.onclick = () => {
    if (need > 0 && tributeSel.length !== need) return toast(`先选择 ${need} 名解放对象`);
    const r = DUEL.applyAction(g, cardsById, 0, { t: 'summon', handUid: h.uid, pos: b.dataset.pos, tributes: tributeSel });
    els.modal.classList.add('hidden');
    if (!r.ok) return toast(r.reason);
    render();
  });
  const c = els.modalBox.querySelector('.cancel');
  if (c) c.onclick = () => els.modal.classList.add('hidden');
}

function onMyUnitClick(uid) {
  if (busy || g.winner !== null) return;
  if (g.active !== 0) return;
  if (g.phase === 'battle') {
    const u = g.players[0].board.find(x => x.uid === uid);
    if (!u) return;
    const chk = DUEL.canAttack(g, cardsById, 0, uid, g.players[1].board.length ? g.players[1].board[0].uid : null);
    if (!chk.ok && !DUEL.canAttack(g, cardsById, 0, uid, null).ok) return toast(chk.reason);
    sel = (sel === uid) ? null : uid;
    render();
    positionDirectBtn();
    return;
  }
  if (g.phase === 'main1' || g.phase === 'main2') {
    // 切换表示
    const u = g.players[0].board.find(x => x.uid === uid);
    if (!u) return;
    const to = u.pos === 'atk' ? 'def' : 'atk';
    const r = DUEL.applyAction(g, cardsById, 0, { t: 'setPos', uid, pos: to });
    if (!r.ok) return toast(r.reason);
    render();
  }
}

function onFoeUnitClick(uid) {
  if (busy || g.winner !== null) return;
  if (g.phase !== 'battle' || g.active !== 0 || !sel) return;
  const r = DUEL.applyAction(g, cardsById, 0, { t: 'attack', uid: sel, target: uid });
  if (!r.ok) return toast(r.reason);
  sel = null; hideDirectBtn();
  render();
}

function positionDirectBtn() {
  if (!sel || g.players[1].board.length > 0) { hideDirectBtn(); return; }
  if (!DUEL.canAttack(g, cardsById, 0, sel, null).ok) { hideDirectBtn(); return; }
  const el = els.myBoard.querySelector(`[data-uid="${sel}"]`);
  if (!el) { hideDirectBtn(); return; }
  const r = el.getBoundingClientRect();
  els.btnDirect.style.left = (r.right + 12) + 'px';
  els.btnDirect.style.top = (r.top + r.height / 2 - 18) + 'px';
  els.btnDirect.classList.remove('hidden');
}
function hideDirectBtn() { els.btnDirect.classList.add('hidden'); }

els.btnDirect.onclick = () => {
  if (!sel) return;
  const r = DUEL.applyAction(g, cardsById, 0, { t: 'attack', uid: sel, target: null });
  if (!r.ok) return toast(r.reason);
  sel = null; hideDirectBtn(); render();
};

els.btnNext.onclick = () => {
  if (busy || g.winner !== null || g.active !== 0) return;
  const r = DUEL.applyAction(g, cardsById, 0, { t: g.phase === 'end' ? 'endTurn' : 'nextPhase' });
  if (!r.ok) return toast(r.reason);
  sel = null; hideDirectBtn(); render();
};

els.btnRestart.onclick = () => { if (confirm('重新开局？当前对局作废')) start(); };
els.btnAgain.onclick = () => start();
els.btnHelp.onclick = () => showModal(`
  <h3>决斗规则速览</h3>
  <div class="meta" style="line-height:1.9">
  · 双方 LP 4000，降到 0 获胜；必须抽牌而牌组为空则败。<br>
  · 回合六阶段：抽牌 → 准备 → 主要1 → 战斗 → 主要2 → 结束。先手第一回合不抽牌。<br>
  · 通常登场每回合 1 次：Lv1-4 直接登场；Lv5-6 须解放 1 名场上伙伴；Lv7+ 须解放 2 名。<br>
  · 攻击表示（竖）可攻击；守备表示（横）不能攻击但不易被破。<br>
  · 战斗：攻vs攻击表示=比 ATK，高者破坏低者并按差额扣 LP，相等同归于尽；攻vs守备=ATK 对 DEF，破防无伤害、攻不破则自己扣差额。<br>
  · 对方场上无人物时可直接攻击（全额 ATK）。<br>
  · 本回合登场的人物不能攻击（速攻词条除外）、不能切换表示。<br>
  · 完整规则见 docs/duel-rules.md。
  </div>`);

function showModal(html) {
  els.modalBox.innerHTML = html + '<button class="cancel">关闭</button>';
  els.modal.classList.remove('hidden');
  els.modalBox.querySelector('.cancel').onclick = () => els.modal.classList.add('hidden');
}

let toastTimer = null;
function toast(msg) {
  els.toast.textContent = msg;
  els.toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.add('hidden'), 2200);
}

function pushLog(msg) { g.log.push({ seq: ++g.actionSeq, turn: g.turn, side: g.active, msg }); }

// ---------- AI 回合播放 ----------
function scheduleAi() {
  busy = true;
  updateNextBtn(); renderHint();
  aiTimer = setInterval(() => {
    aiTimerStep();
  }, AI_DELAY);
}
function aiTimerStep() {
  if (!g || g.winner !== null || g.active !== 1) { stopAi(); busy = false; render(); return; }
  const step = DUEL_AI.aiStep(g, cardsById);
  if (!step) { stopAi(); busy = false; render(); return; }
  const r = DUEL.applyAction(g, cardsById, 1, step);
  if (!r.ok) { stopAi(); busy = false; render(); return; }
  render();
  if (g.active === 0 || g.winner !== null) { stopAi(); busy = false; render(); }
}
function stopAi() { if (aiTimer) { clearInterval(aiTimer); aiTimer = null; } }

// ---------- 结束 ----------
function showEnd() {
  stopAi();
  const w = g.winner;
  els.endTitle.textContent = w === -1 ? '平局' : w === 0 ? '胜 利' : '败 北';
  els.endSub.textContent = w === -1 ? '双方同时倒下' :
    (g.winReason === 'lp' ? '生命点数归零' : '牌组抽空') + ` · 历时 ${g.turn} 回合`;
  els.endOverlay.classList.remove('hidden');
}

start();
