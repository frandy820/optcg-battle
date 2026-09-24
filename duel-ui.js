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
  foeSpells: $('foeSpells'), mySpells: $('mySpells'),
  rb: $('respondBanner'), rbText: $('rbText'), rbBtns: $('rbBtns'),
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
  els.rb.classList.add('hidden');
  pushLog('与「东海野心家」亚尔丽塔的决斗开始！');
  pushLog('提示：先手第一回合不抽牌；招式/伏笔卡可在主要阶段点击使用。');
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
  els.foeSpells.innerHTML = E.spells.map(() => '<div class="spellback-sm" title="对方盖伏的卡">伏</div>').join('')
    + Array.from({ length: Math.max(0, 3 - E.spells.length) }, () => '<div class="slot-sm"></div>').join('');
  els.mySpells.innerHTML = P.spells.map(s => mySpellCard(s)).join('')
    + Array.from({ length: Math.max(0, 3 - P.spells.length) }, () => '<div class="slot-sm"></div>').join('');
  bindCards();
  renderLog();
  renderHint();
  updateNextBtn();
  renderRespond();
  if (g.winner !== null) showEnd();
  if (g.winner === null && !aiTimer && (g.active === 1 || (g.pending && g.pending.turnPtr === 1))) scheduleAi();
}

function emptySlots(n) { return Array.from({ length: 3 - n }, () => '<div class="slot"></div>').join(''); }

function unitCard(u, mine) {
  const d = cardsById[u.cardId];
  const eqN = (u.equips || []).length;
  const cls = ['card', 'unit', u.pos === 'def' ? 'pos-def' : '', u.attacked ? 'attacked' : '',
    mine && clickable(u) ? 'playable' : '', sel === u.uid ? 'selected' : '',
    !mine && sel ? 'targetable' : ''].join(' ');
  return `<div class="${cls}" data-uid="${u.uid}" title="${d.name} Lv${d.level} ATK${d.atk}/DEF${d.def}${eqN ? `（装备×${eqN}）` : ''}">
    <img class="art" src="art/${d.art}.webp" alt="${d.name}" loading="lazy">
    <span class="lv">${d.level}</span>
    ${eqN ? `<span class="eq-badge">⚒${eqN}</span>` : ''}
    <div class="nm">${d.name}</div><div class="sub">${d.sub}</div>
    <div class="stats"><span class="atk">${d.atk}</span><span class="def">${d.def}</span></div>
  </div>`;
}
// 招式/伏笔效果短描述（手牌/弹层共用）
function shortFx(d) {
  return (d.effect.ops || []).map(o => {
    switch (o.op) {
      case 'damage': return `伤害${o.amount}`;
      case 'atkDelta': return `ATK${o.amount >= 0 ? '+' : ''}${o.amount}`;
      case 'defDelta': return `DEF${o.amount >= 0 ? '+' : ''}${o.amount}`;
      case 'destroy': return '破坏';
      case 'setPosDef': return '改守备';
      case 'negateAttack': return '无效攻击';
      case 'negateMove': return '无效招式';
      case 'equip': return `装备${(o.stat || 'atk').toUpperCase()}+${o.amount}`;
      default: return '';
    }
  }).join('·');
}
function handCard(h) {
  const d = cardsById[h.cardId];
  if (d.type !== 'char') {
    const my = g.players[0];
    const can = myPhaseMain() && (
      d.type === 'trap'
        ? (my.setsThisTurn < 2 && my.spells.length < 3)
        : true); // 招式：发动或盖伏至少一头可行
    return `<div class="card hand-card spell-card t-${d.type} ${can ? 'playable' : ''}" data-huid="${h.uid}" title="${d.name}：${d.desc}">
      <img class="art" src="art/${d.art}.webp" alt="${d.name}" loading="lazy">
      <span class="tbadge">${d.type === 'move' ? '招' : '伏'}</span>
      <div class="nm">${d.name}</div><div class="sub">${d.sub}</div>
      <div class="fx">${shortFx(d)}</div>
    </div>`;
  }
  const can = myPhaseMain() && g.players[0].summoned === 0 && (d.level <= 4 ? g.players[0].board.length < 3 : true);
  return `<div class="card hand-card ${can ? 'playable' : ''}" data-huid="${h.uid}" title="${d.name}">
    <img class="art" src="art/${d.art}.webp" alt="${d.name}" loading="lazy">
    <span class="lv">${d.level}</span>
    <div class="nm">${d.name}</div><div class="sub">${d.sub}</div>
    <div class="stats"><span class="atk">${d.atk}</span><span class="def">${d.def}</span></div>
  </div>`;
}
// 我方招式/伏笔区条目
function mySpellCard(s) {
  const d = cardsById[s.cardId];
  if (s.equipTo) {
    const u = g.players[0].board.find(x => x.uid === s.equipTo);
    return `<div class="spellcard equip" title="${d.name}：${d.desc}">⚒ ${d.name}<span class="fx-sm">${u ? cardsById[u.cardId].name : ''}</span></div>`;
  }
  if (s.set) {
    const clickableSpell = d.type === 'move' && myPhaseMain();
    return `<div class="spellcard set${clickableSpell ? '' : ' locked'}" data-suid="${s.uid}"
      title="${d.name}（已盖伏）${d.type === 'move' ? '·点击可翻开发动' : '·响应窗口自动提示'}">伏·${d.name}</div>`;
  }
  return `<div class="spellcard">${d.name}</div>`;
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
  if (g.pending) {
    if (g.pending.turnPtr === 0) setHint('【响应窗口】在顶部横幅选择：发动伏笔反制 / 不响应', true);
    else setHint('对方正在考虑是否反制…', true);
    return;
  }
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
  if (g.pending) { b.disabled = true; b.textContent = '等待响应…'; return; }
  b.disabled = g.active !== 0 || busy;
  b.textContent = g.phase === 'end' ? '结束回合 ✓' : g.phase === 'main1' ? '进入战斗 ⚔' : '下一步 ›';
}

// ---------- 响应窗口横幅（规则 §七：玩家为响应方时操作入口） ----------
function renderRespond() {
  if (!g || !g.pending || g.pending.turnPtr !== 0 || g.winner !== null) {
    els.rb.classList.add('hidden'); return;
  }
  const pd = g.pending;
  let text, sub;
  const chainNames = pd.chain.map(l => `「${cardsById[l.cardId].name}」`).join(' → ');
  if (pd.actor === 1) { // 对方宣言，我首次反制
    if (pd.kind === 'attack') {
      const atkU = g.players[1].board.find(u => u.uid === pd.ev.attackerUid);
      const tU = pd.ev.targetUid ? g.players[0].board.find(u => u.uid === pd.ev.targetUid) : null;
      text = `对方宣言攻击！${atkU ? `「${cardsById[atkU.cardId].name}」` : ''}${tU ? ` → 「${cardsById[tU.cardId].name}」` : ' → 直接攻击！'}`;
      sub = '可发动伏笔反制，或选择不响应';
    } else {
      text = `对方发动招式「${cardsById[pd.ev.cardId].name}」！`;
      sub = '可发动伏笔无效该招式，或选择不响应';
    }
  } else { // 我方宣言，对方已跟链，问我是否继续连锁
    text = pd.kind === 'attack'
      ? `对方以${chainNames}反制你的攻击宣言！`
      : `对方以${chainNames}反制你的招式！`;
    sub = '可继续追加伏笔（后发先结算），或选择不响应';
  }
  if (chainNames) sub = `连锁：${chainNames} · ${sub}`;
  els.rbText.innerHTML = `${text}<small>${sub}</small>`;
  const btns = [];
  for (const s of g.players[0].spells) {
    if (!DUEL.canRespond(g, cardsById, 0, s).ok) continue;
    const d = cardsById[s.cardId];
    btns.push(`<button data-suid="${s.uid}" title="${d.desc}">发动「${d.name}」</button>`);
  }
  btns.push(`<button class="pass" data-suid="">不响应</button>`);
  els.rbBtns.innerHTML = btns.join('');
  els.rbBtns.querySelectorAll('button').forEach(b => b.onclick = () => {
    if (busy) return;
    const a = b.dataset.suid ? { t: 'respond', spellUid: b.dataset.suid } : { t: 'pass' };
    const r = DUEL.applyAction(g, cardsById, 0, a);
    if (!r.ok) return toast(r.reason);
    render();
  });
  els.rb.classList.remove('hidden');
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
  els.mySpells.querySelectorAll('.spellcard.set:not(.locked)').forEach(el => {
    el.onclick = () => onMySpellClick(el.dataset.suid);
  });
}

function onMySpellClick(suid) {
  if (busy || !myPhaseMain()) return toast('只能在你的主要阶段翻开发动');
  const s = g.players[0].spells.find(x => x.uid === suid);
  if (!s) return;
  const d = cardsById[s.cardId];
  if (d.type !== 'move') return toast('伏笔会在响应窗口自动提示发动');
  showSpellModal({ kind: 'spell', uid: suid }, d);
}

function onHandClick(huid) {
  if (busy || !myPhaseMain()) return toast('只能在你的主要阶段操作');
  const h = g.players[0].hand.find(x => x.uid === huid);
  if (!h) return;
  const d = cardsById[h.cardId];
  if (d.type !== 'char') return showSpellModal({ kind: 'hand', uid: h.uid }, d);
  if (g.players[0].summoned >= 1) return toast('本回合通常登场次数已用完（每回合 1 次）');
  const need = d.level >= 7 ? 2 : d.level >= 5 ? 1 : 0;
  if (need === 0 && g.players[0].board.length >= 3) return toast('人物区已满（3 格）——可通过解放腾位');
  if (need > 0 && g.players[0].board.length < need) return toast(`Lv${d.level} 人物需要解放 ${need} 名场上人物，你场上不足`);
  showSummonModal(h, d, need);
}

// 招式/伏笔操作弹层：src={kind:'hand'|'spell', uid}
function showSpellModal(src, d) {
  const my = g.players[0], en = g.players[1];
  const parts = [`<div class="card-preview">
    <div class="card t-${d.type}"><img class="art" src="art/${d.art}.webp">
      <span class="tbadge">${d.type === 'move' ? '招式' : '伏笔'}</span>
      <div class="nm">${d.name}</div><div class="sub">${d.sub}</div><div class="fx">${shortFx(d)}</div></div>
    <div class="meta"><b>${d.name}</b>（${d.type === 'move' ? (d.moveKind === 'equip' ? '装备招式' : '通常招式') : '伏笔'}）<br>${d.desc}</div>
  </div>`];
  const act = src.kind === 'hand' ? 'activateMove' : 'activateSpell';
  const key = src.kind === 'hand' ? 'handUid' : 'spellUid';
  if (d.type === 'trap') {
    parts.push(`<div id="posOpts" style="margin-top:10px">
      <button class="opt" data-act="set">🂠 盖伏到伏笔区（下一回合起可在响应窗口发动）</button>
      <button class="cancel">取消</button></div>`);
  } else {
    let body = '';
    if (d.effect.need) {
      const tgts = DUEL.moveTargets(g, cardsById, 0, d);
      if (!tgts.length) body = `<div class="meta" style="margin-top:10px;color:#ff9b9b">当前没有合法目标（${d.effect.need === 'ownUnit' ? '需要自己场上人物' : d.effect.need === 'foeUnitMax1200' ? '需要对方 ATK1200 以下人物' : '需要对方攻击表示人物'}）</div>`;
      else body = `<h3 style="margin-top:10px">选择目标</h3>` + tgts.map(uid => {
        const mine = my.board.some(u => u.uid === uid);
        const u = (mine ? my.board : en.board).find(x => x.uid === uid);
        const ud = cardsById[u.cardId];
        return `<button class="opt" data-act="cast" data-tgt="${uid}">${mine ? '▸ 我方' : '▸ 对方'}「${ud.name}」ATK${ud.atk}${u.pos === 'def' ? '（守备）' : ''}</button>`;
      }).join('');
    } else body = `<div style="margin-top:10px"><button class="opt" data-act="cast">⚡ 立即发动</button></div>`;
    if (src.kind === 'hand') body += `<button class="opt" data-act="set" style="margin-top:6px">🂠 盖伏（之后可随时翻开发动）</button>`;
    parts.push(body + `<button class="cancel">取消</button>`);
  }
  els.modalBox.innerHTML = parts.join('');
  els.modal.classList.remove('hidden');
  els.modalBox.querySelectorAll('[data-act]').forEach(b => b.onclick = () => {
    const a = { t: b.dataset.act === 'set' ? 'setSpell' : act };
    a[key] = src.uid;
    if (b.dataset.tgt !== undefined) a.target = b.dataset.tgt;
    els.modal.classList.add('hidden');
    const r = DUEL.applyAction(g, cardsById, 0, a);
    if (!r.ok) return toast(r.reason);
    render();
  });
  const c = els.modalBox.querySelector('.cancel');
  if (c) c.onclick = () => els.modal.classList.add('hidden');
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
  · 对方场上无人物时可直接攻击（全额 ATK）。本回合登场不能攻击（速攻除外）。<br>
  · <b>招式</b>（红标）：主要阶段发动。通常招式用后进墓；装备招式留场持续增益，装备者离场时随葬。<br>
  · <b>伏笔</b>（紫标）：先盖伏到伏笔区（每回合 2 张），下一回合起在「响应窗口」发动——对方攻击宣言或发动招式时，顶部横幅会提示你反制。<br>
  · 连锁：后发动的伏笔先结算，最多 3 层；被无效的攻击/招式不返还费用。<br>
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
  if (!g || g.winner !== null) { stopAi(); busy = false; render(); return; }
  if (g.pending) {
    if (g.pending.turnPtr !== 1) { stopAi(); busy = false; render(); return; } // 窗口轮到玩家
    const step = DUEL_AI.aiStep(g, cardsById, 1);
    const r = DUEL.applyAction(g, cardsById, 1, step || { t: 'pass' });
    if (!r.ok) { stopAi(); busy = false; render(); return; }
    render();
    if (!g.pending) { stopAi(); busy = false; render(); } // 窗口关闭交回正常节奏
    return;
  }
  if (g.active !== 1) { stopAi(); busy = false; render(); return; }
  const step = DUEL_AI.aiStep(g, cardsById, 1);
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
