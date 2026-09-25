// 海贼王：伟大航路决斗 — 决斗引擎（规则真值源: docs/duel-rules.md）
// 零 DOM、确定性（seed 驱动洗牌）、玩家与 AI 共用同一动作入口与校验。
// CJS + 浏览器全局双导出（与旧 DEMO 离线 file:// 能力一致）。
'use strict';

const PHASES = ['draw', 'standby', 'main1', 'battle', 'main2', 'end'];
const LP_START = 4000;
const HAND_START = 5;
const HAND_MAX = 8;
const BOARD_MAX = 5;   // 人物区（round3：3→5，对齐游戏王 5 怪位）
const SPELL_MAX = 3;   // 招式/伏笔区
const SUMMON_LIMIT = 1;    // 每回合通常登场次数
const SET_LIMIT = 2;       // 每回合盖伏张数
const CHAIN_MAX = 3;       // 连锁深度上限
const DECK_SIZE = 20;

// ---------- 可复现随机 ----------
function mkRng(seed) {
  let s = seed >>> 0 || 1;
  return () => { // xorshift32
    s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}
function shuffle(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ---------- 建局 ----------
// opts: { seed, decks:[playerDeckIds, aiDeckIds], first: 0|1(默认0=玩家先手), names:[..], aiProfile }
function newGame(cardsById, opts) {
  const rng = mkRng(opts.seed || 20260924);
  const g = {
    v: 1, seed: opts.seed || 20260924, rng,
    aiProfile: opts.aiProfile || 'aggro', // AI 战术原型: 'aggro'|'control'|'boss'（§九.4 权重区分，非规则豁免）
    turn: 1, active: (opts.first === 1 ? 1 : 0), firstTurnDone: false,
    phase: 'draw',
    players: [0, 1].map(i => ({
      name: (opts.names || ['玩家', 'AI'])[i],
      lp: LP_START,
      deck: shuffle(opts.decks[i].slice(), rng),
      hand: [], board: [], spells: [], grave: [],
      summoned: 0, setsThisTurn: 0, // 本回合通常登场次数 / 盖伏张数
    })),
    pending: null,   // 响应窗口（Phase 3 启用；结构留位）
    chain: [],
    log: [],
    winner: null, winReason: null,
    actionSeq: 0,
  };
  // 起手
  for (const p of g.players) for (let i = 0; i < HAND_START; i++) drawCard(g, p, { silent: true });
  return g;
}

function log(g, msg) { g.log.push({ seq: ++g.actionSeq, turn: g.turn, side: g.active, msg }); }

// ---------- 基础查询 ----------
const card = (g, uid) => {
  for (const p of g.players) {
    const u = p.board.find(x => x.uid === uid);
    if (u) return u;
  }
  return null;
};
const def = (cardsById, u) => cardsById[u.cardId];
const me = g => g.players[g.active];
const foe = g => g.players[1 - g.active];
// 战斗力 = 卡面 + 增益/减益（buffs，限时） + 装备（equips，随人物存亡）
const buffSum = (u, stat) => (u.buffs || []).reduce((s, b) => s + (b.stat === stat ? b.amount : 0), 0);
const equipSum = (u, stat) => (u.equips || []).reduce((s, e) => s + (e.stat === stat ? e.amount : 0), 0);
const unitAtk = (cardsById, u) => def(cardsById, u).atk + buffSum(u, 'atk') + equipSum(u, 'atk');
const unitDef = (cardsById, u) => def(cardsById, u).def + buffSum(u, 'def') + equipSum(u, 'def');

// 清除增益：which='battle'（战斗阶段结束）| 'all'（回合结束）；'permanent' 永不清除
function clearBuffs(g, which) {
  for (const p of g.players) for (const u of p.board) {
    if (!u.buffs || !u.buffs.length) continue;
    const keep = u.buffs.filter(b => which === 'all' ? b.until === 'permanent' : b.until !== which);
    if (keep.length !== u.buffs.length) u.buffs = keep;
  }
}

// ---------- 抽牌与胜负 ----------
function drawCard(g, p, { silent } = {}) {
  if (!p.deck.length) { // 规则 §一.3：抽空即时判负，优先于一切
    setWinner(g, 1 - g.players.indexOf(p), 'deckout', '牌组抽空');
    return null;
  }
  const cid = p.deck.shift();
  p.hand.push({ uid: 'h' + (++g.actionSeq) + '_' + p.deck.length, cardId: cid });
  if (!silent) log(g, `${p.name} 抽 1 张牌`);
  return cid;
}

function damageLP(g, pi, amount, why) {
  const p = g.players[pi];
  p.lp -= amount;
  log(g, `${p.name} LP -${amount}（${why}）→ ${Math.max(0, p.lp)}`);
  if (p.lp <= 0 && g.winner === null) {
    const other = g.players[1 - pi];
    if (other.lp <= 0) { setWinner(g, -1, 'lp', '双方 LP 同时归零'); } // 规则 §一.3
    else setWinner(g, 1 - pi, 'lp', 'LP 归零');
  }
}

function setWinner(g, w, reason, why) {
  if (g.winner !== null) return;
  g.winner = w; g.winReason = reason;
  log(g, w === -1 ? `平局（${why}）` : `${g.players[w].name} 获胜（${why}）！`);
}

// ---------- 校验器（玩家与 AI 共用；返回 {ok, reason}） ----------
function canSummon(g, cardsById, pi, handUid, pos, tributeUids) {
  const p = g.players[pi];
  if (g.winner !== null) return no('对局已结束');
  if (g.active !== pi) return no('不是你的回合');
  if (g.phase !== 'main1' && g.phase !== 'main2') return no('只能在主要阶段登场');
  if (p.summoned >= SUMMON_LIMIT) return no('本回合通常登场次数已用完（每回合 1 次）');
  const h = p.hand.find(x => x.uid === handUid);
  if (!h) return no('手牌中不存在该卡');
  const d = cardsById[h.cardId];
  if (d.type !== 'char') return no('只有人物卡可以通常登场');
  if (pos !== 'atk' && pos !== 'def') return no('表示形式非法');
  const need = d.level >= 7 ? 2 : d.level >= 5 ? 1 : 0;
  tributeUids = tributeUids || [];
  const seen = new Set();
  for (const t of tributeUids) {
    if (seen.has(t)) return no('解放对象重复');
    seen.add(t);
    if (!p.board.some(x => x.uid === t)) return no('解放对象不在自己场上');
  }
  if (tributeUids.length !== need) return no(`Lv${d.level} 人物需要解放 ${need} 名场上人物`);
  const slotsAfter = p.board.length - tributeUids.length;
  if (slotsAfter >= BOARD_MAX) return no(`人物区已满（${BOARD_MAX} 格）`);
  return ok();
}
function ok() { return { ok: true }; }
function no(reason) { return { ok: false, reason }; }

function canSetPos(g, pi, uid, pos) {
  const p = g.players[pi];
  if (g.winner !== null) return no('对局已结束');
  if (g.active !== pi) return no('不是你的回合');
  if (g.phase !== 'main1' && g.phase !== 'main2') return no('只能在主要阶段切换表示');
  const u = p.board.find(x => x.uid === uid);
  if (!u) return no('人物不在自己场上');
  if (u.pos === pos) return no('已经是该表示');
  if (u.summonedTurn === g.turn) return no('本回合登场的人物不能切换表示');
  if (u.attacked) return no('本回合已攻击的人物不能切换表示');
  if (u.posChanged) return no('本回合已切换过表示');
  return ok();
}

function canAttack(g, cardsById, pi, uid, targetUid) {
  const p = g.players[pi], e = g.players[1 - pi];
  if (g.winner !== null) return no('对局已结束');
  if (g.active !== pi) return no('不是你的回合');
  if (g.phase !== 'battle') return no('只能在战斗阶段攻击');
  const u = p.board.find(x => x.uid === uid);
  if (!u) return no('人物不在自己场上');
  if (u.pos !== 'atk') return no('守备表示的人物不能攻击');
  if (u.attacked) return no('该人物本回合已攻击');
  if (u.summonedTurn === g.turn && !(def(cardsById, u).keywords || []).includes('rush')) return no('本回合登场的人物不能攻击（速攻除外）');
  if (targetUid === null || targetUid === undefined) {
    if (e.board.length > 0) return no('对方场上有人物时不能直接攻击');
    return ok();
  }
  if (!e.board.some(x => x.uid === targetUid)) return no('攻击目标不在对方场上');
  return ok();
}

// ---------- 动作执行（唯一入口） ----------
// action: {t:'summon',handUid,pos,tributes} | {t:'setPos',uid,pos} |
//         {t:'attack',uid,target} | {t:'nextPhase'} | {t:'endTurn'} |
//         {t:'setSpell',handUid}（盖伏招式/伏笔） |
//         {t:'activateMove',handUid,target?}（直接发动招式） |
//         {t:'activateSpell',spellUid,target?}（翻开已盖伏的招式） |
//         {t:'respond',spellUid,target?}（响应窗口发动伏笔） | {t:'pass'}（窗口跳过）
function applyAction(g, cardsById, pi, action) {
  if (g.winner !== null) return { ok: false, reason: '对局已结束', fatal: false };
  if (g.pending) {
    // 响应窗口期间只接受窗口动作（规则 §七）
    if (action.t === 'respond') return doRespond(g, cardsById, pi, action);
    if (action.t === 'pass') return doPass(g, cardsById, pi);
    return { ok: false, reason: '正在响应窗口——只能发动伏笔或选择不响应' };
  }
  const r = dispatch(g, cardsById, pi, action);
  return r;
}

function dispatch(g, cardsById, pi, a) {
  switch (a.t) {
    case 'summon': return doSummon(g, cardsById, pi, a);
    case 'setPos': return doSetPos(g, pi, a);
    case 'attack': return doAttack(g, cardsById, pi, a);
    case 'nextPhase': return doNextPhase(g, cardsById);
    case 'endTurn': return doEndTurn(g, cardsById, pi);
    case 'setSpell': return doSetSpell(g, cardsById, pi, a);
    case 'activateMove': return doActivateMove(g, cardsById, pi, a);
    case 'activateSpell': return doActivateSpell(g, cardsById, pi, a);
    case 'release': return doRelease(g, cardsById, pi, a);
    default: return no('未知动作 ' + a.t);
  }
}

function doSummon(g, cardsById, pi, a) {
  const c = canSummon(g, cardsById, pi, a.handUid, a.pos, a.tributes);
  if (!c.ok) return c;
  const p = g.players[pi];
  const idx = p.hand.findIndex(x => x.uid === a.handUid);
  const h = p.hand[idx];
  const d = cardsById[h.cardId];
  const names = [];
  for (const t of (a.tributes || [])) {
    const i = p.board.findIndex(x => x.uid === t);
    const u = p.board[i];
    names.push(cardsById[u.cardId].name);
    p.board.splice(i, 1); p.grave.push({ ...u, buffs: [], equips: [] });
    unequipAll(g, p, u, cardsById); // 装备随解放者进墓（§五.5）
  }
  if (names.length) log(g, `${p.name} 解放了 ${names.join('、')}`);
  p.hand.splice(idx, 1);
  p.board.push({ uid: 'u' + (++g.actionSeq), cardId: h.cardId, pos: a.pos,
    attacked: false, summonedTurn: g.turn, posChanged: false, buffs: [], equips: [] });
  p.summoned++;
  log(g, `${p.name} 通常登场「${d.name}」（Lv${d.level} ATK${d.atk}/${a.pos === 'atk' ? '攻' : '守'}表示）`);
  triggerAbility(g, cardsById, pi, p.board[p.board.length - 1], 'onSummon');
  return { ok: true };
}

function doSetPos(g, pi, a) {
  const c = canSetPos(g, pi, a.uid, a.pos);
  if (!c.ok) return c;
  const p = g.players[pi];
  const u = p.board.find(x => x.uid === a.uid);
  u.pos = a.pos; u.posChanged = true;
  log(g, `${p.name} 将「${u.cardId}」切换为${a.pos === 'atk' ? '攻击' : '守备'}表示`);
  return { ok: true };
}

// 攻击：宣言 →（Phase 3 响应窗口）→ 结算
function doAttack(g, cardsById, pi, a) {
  const c = canAttack(g, cardsById, pi, a.uid, a.target);
  if (!c.ok) return c;
  const p = g.players[pi], e = g.players[1 - pi];
  const u = p.board.find(x => x.uid === a.uid);
  const d = def(cardsById, u);
  u.attacked = true; // 宣言即锁定攻击权（无论结算结果，被无效也不返还）
  triggerAbility(g, cardsById, pi, u, 'onAttackDecl'); // 攻击宣言能力先于响应窗口生效（反制方按增强后数值评估）

  // 响应窗口 W1：攻击宣言（规则 §七.2）——对方有可发动伏笔才开窗
  const ev = { kind: 'attack', attackerUid: u.uid, targetUid: (a.target ?? null), direct: a.target == null };
  const wnd = openResponseWindow(g, cardsById, ev);
  if (wnd) return wnd; // 挂起，等待双方响应后 resolvePending 继续

  resolveAttack(g, cardsById, pi, u, a.target);
  return { ok: true };
}

function resolveAttack(g, cardsById, pi, u, targetUid) {
  const p = g.players[pi], e = g.players[1 - pi];
  const d = def(cardsById, u);
  const A = unitAtk(cardsById, u);
  if (targetUid === null || targetUid === undefined) {
    log(g, `${p.name} 的「${d.name}」直接攻击！(${A})`);
    damageLP(g, 1 - pi, A, '直接攻击');
    return;
  }
  const t = e.board.find(x => x.uid === targetUid);
  if (!t) { log(g, `攻击目标已离场，攻击落空`); return; } // 规则 §七.6 目标失效
  const td = def(cardsById, t);
  if (t.pos === 'atk') {
    const B = unitAtk(cardsById, t);
    log(g, `「${d.name}」(${A}) 攻击 「${td.name}」(${B})`);
    if (A > B) { destroy(g, e, t, cardsById); damageLP(g, 1 - pi, A - B, '战斗伤害'); }
    else if (A < B) { destroy(g, p, u, cardsById); damageLP(g, pi, B - A, '战斗伤害'); }
    else { destroy(g, p, u, cardsById); destroy(g, e, t, cardsById); log(g, '同归于尽！'); }
  } else {
    const B = unitDef(cardsById, t) + ((td.keywords || []).includes('guard') ? 500 : 0);
    log(g, `「${d.name}」(${A}) 攻击守备的「${td.name}」(守${B})`);
    if (A > B) {
      destroy(g, e, t, cardsById);
      if ((d.keywords || []).includes('pierce')) damageLP(g, 1 - pi, A - B, '贯通');
    } else if (A < B) damageLP(g, pi, B - A, '攻守逆转伤害');
    else log(g, '势均力敌，无事发生');
  }
}

function destroy(g, p, u, cardsById) {
  const i = p.board.findIndex(x => x.uid === u.uid);
  if (i < 0) return;
  p.board.splice(i, 1);
  p.grave.push({ ...u, buffs: [], equips: [] });
  log(g, `「${cardsById[u.cardId].name}」被破坏，进入墓场`);
  unequipAll(g, p, u, cardsById); // 装备随葬（§五.5）
  triggerAbility(g, cardsById, g.players.indexOf(p), u, 'onDestroyed'); // 触发点在墓场之后（回手类效果可从墓取回）
}

// 卸下某人物的全部装备 → 墓场（人物被破坏/被解放时）
function unequipAll(g, p, u, cardsById) {
  const keeps = [];
  for (const s of p.spells) {
    if (s.equipTo === u.uid) {
      p.grave.push({ uid: s.uid, cardId: s.cardId });
      log(g, `装备「${cardsById[s.cardId].name}」失去对象，进入墓场`);
    } else keeps.push(s);
  }
  p.spells = keeps;
}

// 独立解放（round3：区满腾位的显式入口；与 summon 附带解放同规则——不算破坏、不触发 onDestroyed，装备随葬）
function doRelease(g, cardsById, pi, a) {
  const p = g.players[pi];
  if (g.winner !== null) return no('对局已结束');
  if (g.active !== pi) return no('不是你的回合');
  if (g.phase !== 'main1' && g.phase !== 'main2') return no('只能在主要阶段解放');
  const i = p.board.findIndex(x => x.uid === a.uid);
  if (i < 0) return no('人物不在自己场上');
  const u = p.board[i];
  p.board.splice(i, 1);
  p.grave.push({ ...u, buffs: [], equips: [] });
  log(g, `${p.name} 解放了「${cardsById[u.cardId].name}」（腾出人物区）`);
  unequipAll(g, p, u, cardsById);
  return { ok: true };
}

// ---------- 阶段推进 ----------
function doNextPhase(g, cardsById) {
  if (g.winner !== null) return no('对局已结束');
  const pi = g.active;
  if (g.phase === 'battle' && g.players[pi].board.some(u => u.attacked)) {
    // 战斗收尾提示（无实际清理，attacked 在换边时清）
  }
  const i = PHASES.indexOf(g.phase);
  if (i === PHASES.length - 1) return no('结束阶段请使用 endTurn');
  if (g.phase === 'main1' ) {
    // 主1 → 战斗（可跳过：UI 发两次 nextPhase）
  }
  g.phase = PHASES[i + 1];
  if (PHASES[i] === 'battle') clearBuffs(g, 'battle'); // 战斗阶段结束 → 清「直至战斗阶段结束」增益
  onEnterPhase(g, cardsById);
  return { ok: true };
}

function onEnterPhase(g, cardsById) {
  const p = me(g);
  if (g.phase === 'draw') {
    // 新回合开始由 endTurn 处理换边；此处仅为防御
  }
  if (g.phase === 'standby') {
    log(g, `— ${p.name} 的准备阶段 —`);
    for (const u of [...p.board]) triggerAbility(g, cardsById, g.players.indexOf(p), u, 'onTurnStart');
  }
  if (g.phase === 'main1') log(g, `— ${p.name} 的主要阶段1 —`);
  if (g.phase === 'battle') log(g, `— ${p.name} 的战斗阶段 —`);
  if (g.phase === 'main2') log(g, `— ${p.name} 的主要阶段2 —`);
  if (g.phase === 'end') {
    log(g, `— ${p.name} 的结束阶段 —`);
    if (p.hand.length > HAND_MAX) {
      // 规则 §四：弃至 8。玩家版 UI 弹选择；引擎兜底弃最后抽到的（AI 走 aiChooseDiscard）
      while (p.hand.length > HAND_MAX) {
        const drop = p.hand.pop();
        p.grave.push({ ...drop });
        log(g, `${p.name} 手牌超上限，弃「${cardsById[drop.cardId].name}」`);
      }
    }
  }
}

function doEndTurn(g, cardsById, pi) {
  if (g.winner !== null) return no('对局已结束');
  if (g.active !== pi) return no('不是你的回合');
  if (g.phase !== 'end') {
    // 结束阶段允许从任意阶段直接进入 endTurn？规则要求走完阶段；战斗阶段不可直接结束。
    if (g.phase === 'battle') return no('战斗阶段不能直接结束回合');
    g.phase = 'end';
    onEnterPhase(g, cardsById); // 触发结束阶段效果与手牌上限
    if (g.winner !== null) return { ok: true };
  }
  // 换边
  clearBuffs(g, 'all'); // 回合结束 → 清所有限时增益（双方）
  for (const u of me(g).board) { u.attacked = false; u.posChanged = false; }
  me(g).summoned = 0; me(g).setsThisTurn = 0;
  g.active = 1 - g.active;
  if (g.active === 0) g.turn++;
  g.phase = 'draw';
  onEnterPhase(g, cardsById);
  // 抽牌阶段：先手首回合的"不抽"由开局 newGame 天然保证（开局不经过此处）；
  // 换边而来的每个新回合均抽 1（含后手的第 1 回合）。
  const p = me(g);
  log(g, `— 第 ${g.turn} 回合 · ${p.name} 的抽牌阶段 —`);
  drawCard(g, p);
  if (g.winner !== null) return { ok: true }; // 抽空即负
  g.phase = 'standby'; onEnterPhase(g, cardsById);
  g.phase = 'main1'; onEnterPhase(g, cardsById);
  return { ok: true };
}

// ================= 招式与伏笔（Phase 3；规则 §五.5-6 / §七） =================

// ---- 盖伏（招式或伏息→招式/伏笔区，里侧） ----
function canSetSpell(g, cardsById, pi, handUid) {
  const p = g.players[pi];
  if (g.winner !== null) return no('对局已结束');
  if (g.active !== pi) return no('不是你的回合');
  if (g.phase !== 'main1' && g.phase !== 'main2') return no('只能在主要阶段盖伏');
  const h = p.hand.find(x => x.uid === handUid);
  if (!h) return no('手牌中不存在该卡');
  const d = cardsById[h.cardId];
  if (d.type !== 'move' && d.type !== 'trap') return no('只有招式或伏笔可以盖伏');
  if (p.setsThisTurn >= SET_LIMIT) return no(`每回合最多盖伏 ${SET_LIMIT} 张`);
  if (p.spells.length >= SPELL_MAX) return no(`招式/伏笔区已满（${SPELL_MAX} 格）`);
  return ok();
}
function doSetSpell(g, cardsById, pi, a) {
  const c = canSetSpell(g, cardsById, pi, a.handUid);
  if (!c.ok) return c;
  const p = g.players[pi];
  const i = p.hand.findIndex(x => x.uid === a.handUid);
  const h = p.hand[i];
  p.hand.splice(i, 1);
  p.spells.push({ uid: 's' + (++g.actionSeq), cardId: h.cardId, set: true, setTurn: g.turn, equipTo: null });
  p.setsThisTurn++;
  log(g, `${p.name} 盖伏了 1 张卡`);
  return { ok: true };
}

// ---- 招式发动（手牌直接发动 / 翻开已盖伏的招式） ----
function canActivateMove(g, cardsById, pi, d, targetUid) {
  const p = g.players[pi], e = g.players[1 - pi];
  if (g.phase !== 'main1' && g.phase !== 'main2') return no('只能在主要阶段发动招式');
  if (d.moveKind === 'equip' && p.spells.length >= SPELL_MAX)
    return no(`装备须占 1 格，招式/伏笔区已满（${SPELL_MAX} 格）`);
  const need = d.effect.need;
  if (!need) return ok();
  const t = (targetUid != null)
    ? e.board.find(x => x.uid === targetUid) || p.board.find(x => x.uid === targetUid) : null;
  if (!t) return no('该招式需要选择目标');
  if (need === 'ownUnit' && !p.board.some(x => x.uid === targetUid)) return no('目标须为自己场上人物');
  if (need === 'foeUnitMax1200' || need === 'foeUnitAtkPos') {
    if (!e.board.some(x => x.uid === targetUid)) return no('目标须为对方场上人物');
    if (need === 'foeUnitMax1200' && def(cardsById, t).atk > 1200) return no('该招式只能指定 ATK1200 以下的人物');
    if (need === 'foeUnitAtkPos' && t.pos !== 'atk') return no('目标须为攻击表示的人物');
  }
  return ok();
}
// 该招式的全部合法目标（无目标卡返回 [null]）
function moveTargets(g, cardsById, pi, d) {
  const p = g.players[pi], e = g.players[1 - pi];
  if (d.moveKind === 'equip' && p.spells.length >= SPELL_MAX) return [];
  switch (d.effect.need) {
    case 'ownUnit': return p.board.map(u => u.uid);
    case 'foeUnitMax1200': return e.board.filter(u => def(cardsById, u).atk <= 1200).map(u => u.uid);
    case 'foeUnitAtkPos': return e.board.filter(u => u.pos === 'atk').map(u => u.uid);
    default: return [null];
  }
}

function doActivateMove(g, cardsById, pi, a) {
  const p = g.players[pi];
  const h = p.hand.find(x => x.uid === a.handUid);
  if (!h) return no('手牌中不存在该卡');
  const d = cardsById[h.cardId];
  if (d.type !== 'move') return no('只有招式卡可以发动');
  if (g.active !== pi) return no('不是你的回合');
  const c = canActivateMove(g, cardsById, pi, d, a.target);
  if (!c.ok) return c;
  p.hand.splice(p.hand.indexOf(h), 1);
  return launchMove(g, cardsById, pi, d, a.target);
}

function doActivateSpell(g, cardsById, pi, a) {
  const p = g.players[pi];
  const s = p.spells.find(x => x.uid === a.spellUid);
  if (!s) return no('招式/伏笔区没有该卡');
  if (!s.set) return no('该卡已在场上（装备中）');
  if (g.active !== pi) return no('不是你的回合');
  const d = cardsById[s.cardId];
  if (d.type !== 'move') return no('盖伏的伏笔只能在响应窗口发动');
  const c = canActivateMove(g, cardsById, pi, d, a.target);
  if (!c.ok) return c;
  p.spells.splice(p.spells.indexOf(s), 1);
  return launchMove(g, cardsById, pi, d, a.target);
}

// 发动招式：无窗口 → 立即结算；对方有 onOppMove 伏笔 → 开 W2 窗口
function launchMove(g, cardsById, pi, d, targetUid) {
  const p = g.players[pi];
  // why 默认=卡名（LP 飘字/日志归因用；能力类伤害自带具名 why 不覆盖）
  const ops = (d.effect.ops || []).map(o => ({ why: d.name, ...o, targetUid: targetUid ?? null }));
  log(g, `${p.name} 发动招式「${d.name}」！`);
  let row = null;
  if (d.moveKind === 'equip') {
    row = { uid: 's' + (++g.actionSeq), cardId: d.id, set: false, setTurn: g.turn, equipTo: null };
    p.spells.push(row);
    const eq = ops.find(o => o.op === 'equip');
    if (eq) eq.spellUid = row.uid;
  } else {
    p.grave.push({ uid: 's' + (++g.actionSeq), cardId: d.id }); // 通常招式用后进墓
  }
  const ev = { kind: 'move', cardId: d.id, ops, negated: false, equipRowUid: row ? row.uid : null };
  if (openResponseWindow(g, cardsById, ev)) return { ok: true, pending: true };
  applyOps(g, cardsById, pi, ops, null);
  return { ok: true };
}

// ---- 响应窗口 ----
// 伏笔与窗口是否匹配（不含轮次指针检查）
function trapMatches(g, cardsById, s, ev) {
  const d = cardsById[s.cardId];
  if (!s.set || d.type !== 'trap' || s.setTurn >= g.turn) return false; // §五.6 当回合盖伏不可发
  const trigs = d.triggers || [];
  if (ev.kind === 'attack') {
    if (!(trigs.includes('onAttacked') || (ev.direct && trigs.includes('onDirectAttack')))) return false;
    if (d.effect.requireTarget && !ev.targetUid) return false;
  } else if (ev.kind === 'move') {
    if (!trigs.includes('onOppMove')) return false;
  } else return false;
  return true;
}

function openResponseWindow(g, cardsById, ev) {
  const responder = 1 - g.active;
  const np = g.players[responder];
  if (!np.spells.some(s => trapMatches(g, cardsById, s, ev))) return null;
  g.pending = { kind: ev.kind, actor: g.active, responder, turnPtr: responder, passes: 0, chain: [], ev };
  log(g, ev.kind === 'attack'
    ? `【响应窗口】${np.name} 可发动伏笔响应攻击宣言`
    : `【响应窗口】${np.name} 可发动伏笔响应招式发动`);
  return { ok: true, pending: true };
}

function canRespond(g, cardsById, pi, s) {
  const pd = g.pending;
  if (!pd) return no('当前没有响应窗口');
  if (pd.turnPtr !== pi) return no('还没轮到你响应');
  const d = cardsById[s.cardId];
  if (d.type !== 'trap') return no('响应窗口只能发动伏笔');
  if (!trapMatches(g, cardsById, s, pd.ev)) {
    return no(s.setTurn >= g.turn ? '盖伏的当回合不能发动' : '该伏笔不能在此窗口发动');
  }
  return ok();
}

function doRespond(g, cardsById, pi, a) {
  const pd = g.pending;
  if (!pd) return no('当前没有响应窗口');
  const p = g.players[pi];
  const s = p.spells.find(x => x.uid === a.spellUid);
  if (!s) return no('招式/伏笔区没有该卡');
  const c = canRespond(g, cardsById, pi, s);
  if (!c.ok) return c;
  const d = cardsById[s.cardId];
  p.spells.splice(p.spells.indexOf(s), 1);
  pd.chain.push({ spellUid: s.uid, cardId: s.cardId, owner: pi, ops: (d.effect.ops || []).map(o => ({ why: d.name, ...o })), negated: false, grave: { uid: s.uid, cardId: s.cardId } });
  pd.passes = 0;
  pd.turnPtr = 1 - pi;
  log(g, `${p.name} 发动伏笔「${d.name}」！`);
  if (pd.chain.length >= CHAIN_MAX) return resolvePending(g, cardsById);
  skipAhead(g, cardsById);
  return { ok: true, pending: !!g.pending };
}

function doPass(g, cardsById, pi) {
  const pd = g.pending;
  if (!pd) return no('当前没有响应窗口');
  if (pd.turnPtr !== pi) return no('还没轮到你响应');
  log(g, `${g.players[pi].name} 选择不响应`);
  pd.passes++;
  pd.turnPtr = 1 - pi;
  skipAhead(g, cardsById);
  return { ok: true, pending: !!g.pending };
}

// 轮到的一方若无伏笔可发 → 自动跳过；连续两方不响应 → 结算
function skipAhead(g, cardsById) {
  const pd = g.pending;
  while (pd && pd.passes < 2) {
    const pi = pd.turnPtr;
    if (g.players[pi].spells.some(s => trapMatches(g, cardsById, s, pd.ev))) return; // 等该方决策
    pd.passes++;
    pd.turnPtr = 1 - pi;
  }
  if (pd && pd.passes >= 2) resolvePending(g, cardsById);
}

// 窗口关闭：连锁后发先结算 → 主事件
function resolvePending(g, cardsById) {
  const pd = g.pending;
  g.pending = null;
  for (let i = pd.chain.length - 1; i >= 0; i--) {
    const link = pd.chain[i];
    if (link.negated) { log(g, `「${cardsById[link.cardId].name}」效果被无效，落空`); continue; }
    applyOps(g, cardsById, link.owner, link.ops, pd);
    g.players[link.owner].grave.push(link.grave); // 伏笔用后进墓
  }
  if (pd.kind === 'attack') {
    const actor = g.players[pd.actor];
    const u = actor.board.find(x => x.uid === pd.ev.attackerUid);
    if (pd.ev.negated) {
      log(g, `攻击宣言被无效！${u ? `「${cardsById[u.cardId].name}」` : '攻击方'}本回合不能再攻击`);
    } else if (!u) {
      log(g, '攻击方已离场，攻击落空');
    } else {
      resolveAttack(g, cardsById, pd.actor, u, pd.ev.targetUid);
    }
  } else { // move
    const p = g.players[pd.actor];
    if (pd.ev.negated) {
      log(g, `「${cardsById[pd.ev.cardId].name}」的招式被无效，效果落空（费用不返还）`);
      if (pd.ev.equipRowUid) { // 装备落空 → 进墓（§七.6）
        const i = p.spells.findIndex(s => s.uid === pd.ev.equipRowUid);
        if (i >= 0) { const [row] = p.spells.splice(i, 1); p.grave.push({ uid: row.uid, cardId: row.cardId }); }
      }
    } else {
      applyOps(g, cardsById, pd.actor, pd.ev.ops, pd);
    }
  }
  return { ok: true };
}

// ---- 人物能力（Phase 4；规则 §十：登场时/被破坏时/每回合开始时/攻击宣言时）----
// ability = { onSummon?/onDestroyed?/onTurnStart?/onAttackDecl?: { when?{ally}, text, ops } }
const ABILITY_TARGETS = new Set(['self', 'foeStrongest', 'foeStrongestAtkPos', 'foeWeakestAtkPos', 'foeStrongestUnder']);

function triggerAbility(g, cardsById, pi, unit, hook) {
  const d = cardsById[unit.cardId];
  const ab = d.ability && d.ability[hook];
  if (!ab) return;
  if (ab.when && ab.when.ally) { // 协同条件：自己场上存在指定伙伴（不含自己）
    if (!g.players[pi].board.some(x => x.cardId === ab.when.ally && x.uid !== unit.uid)) return;
  }
  if (ab.text) log(g, `⚡「${d.name}」${ab.text}`);
  applyAbilityOps(g, cardsById, pi, ab.ops || [], unit);
}

// 能力目标 → 具体 uid；无合法目标（如对方空场）的算子静默丢弃
function resolveAbilityTarget(g, cardsById, pi, unit, op) {
  const e = g.players[1 - pi];
  const top = arr => arr.slice().sort((a, b) => unitAtk(cardsById, b) - unitAtk(cardsById, a))[0];
  switch (op.target) {
    case 'self': return unit.uid;
    case 'foeStrongest': { const t = top(e.board); return t ? t.uid : null; }
    case 'foeStrongestAtkPos': { const t = top(e.board.filter(u => u.pos === 'atk')); return t ? t.uid : null; }
    case 'foeWeakestAtkPos': {
      const t = e.board.filter(u => u.pos === 'atk').sort((a, b) => unitAtk(cardsById, a) - unitAtk(cardsById, b))[0];
      return t ? t.uid : null;
    }
    case 'foeStrongestUnder': {
      const t = top(e.board.filter(u => unitAtk(cardsById, u) <= (op.cap || 1200)));
      return t ? t.uid : null;
    }
    default: return null;
  }
}

function applyAbilityOps(g, cardsById, pi, ops, unit) {
  const mapped = [];
  for (const o of ops) {
    const m = { ...o };
    if (m.op === 'returnToHand') m.unitUid = unit.uid;
    if (m.target && ABILITY_TARGETS.has(m.target)) {
      const uid = resolveAbilityTarget(g, cardsById, pi, unit, m);
      if (!uid) continue;
      m.targetUid = uid; delete m.target;
    }
    mapped.push(m);
  }
  applyOps(g, cardsById, pi, mapped, null);
}

// ---- 效果算子 ----
function applyOps(g, cardsById, pi, ops, pd) {
  const p = g.players[pi];
  for (const op of ops) {
    switch (op.op) {
      case 'damage': {
        damageLP(g, op.side === 'self' ? pi : 1 - pi, op.amount, op.why || '招式/伏笔效果');
        break;
      }
      case 'draw': {
        const tp = g.players[op.side === 'self' ? pi : 1 - pi];
        for (let i = 0; i < (op.amount || 1); i++) drawCard(g, tp);
        break;
      }
      case 'returnToHand': { // 复活类（巴基·四分五裂）：从墓场回到手牌
        const tp = g.players[op.side === 'self' ? pi : 1 - pi];
        const i = tp.grave.findIndex(x => x.uid === op.unitUid);
        if (i >= 0) {
          const [row] = tp.grave.splice(i, 1);
          tp.hand.push({ uid: 'h' + (++g.actionSeq) + '_r', cardId: row.cardId });
          log(g, `「${cardsById[row.cardId].name}」分裂重组，回到手牌`);
        }
        break;
      }
      case 'atkDelta': case 'defDelta': {
        const u = resolveOpTarget(g, op, pd);
        if (!u) { log(g, '效果目标已离场，落空'); break; }
        const stat = op.op === 'atkDelta' ? 'atk' : 'def';
        (u.buffs = u.buffs || []).push({ stat, amount: op.amount, until: op.until || 'turn' });
        log(g, `「${cardsById[u.cardId].name}」${stat === 'atk' ? 'ATK' : 'DEF'}${op.amount >= 0 ? '+' : ''}${op.amount}（${op.until === 'battle' ? '直至战斗阶段结束' : op.until === 'permanent' ? '永久' : '直至回合结束'}）`);
        break;
      }
      case 'negateAttack':
        if (pd && pd.kind === 'attack' && !pd.ev.negated) { pd.ev.negated = true; log(g, '攻击宣言被无效化！'); }
        break;
      case 'negateMove':
        if (pd && pd.kind === 'move' && !pd.ev.negated) { pd.ev.negated = true; log(g, '招式发动被无效化！'); }
        break;
      case 'setPosDef': {
        const u = resolveOpTarget(g, op, pd);
        if (!u) { log(g, '效果目标已离场，落空'); break; }
        if (u.pos !== 'def') { u.pos = 'def'; log(g, `「${cardsById[u.cardId].name}」被改为守备表示`); }
        break;
      }
      case 'destroy': {
        const u = resolveOpTarget(g, op, pd);
        if (!u) { log(g, '破坏目标已离场，效果落空'); break; }
        const owner = g.players.find(pp => pp.board.some(x => x.uid === u.uid));
        destroy(g, owner, u, cardsById);
        break;
      }
      case 'equip': {
        const u = resolveOpTarget(g, op, pd);
        const row = p.spells.find(s => s.uid === op.spellUid);
        if (!u || !row) {
          log(g, '装备目标已离场，落空');
          if (row) { p.spells.splice(p.spells.indexOf(row), 1); p.grave.push({ uid: row.uid, cardId: row.cardId }); }
          break;
        }
        row.equipTo = u.uid;
        (u.equips = u.equips || []).push({ stat: op.stat || 'atk', amount: op.amount });
        log(g, `「${cardsById[u.cardId].name}」装备了「${cardsById[row.cardId].name}」${(op.stat || 'atk').toUpperCase()}+${op.amount}`);
        break;
      }
    }
  }
}

// 效果目标：attacker/defender=窗口上下文；chosen=发动时宣言（此时校验仍在）
function resolveOpTarget(g, op, pd) {
  let uid = null;
  if (op.target === 'attacker') uid = pd && pd.ev.attackerUid;
  else if (op.target === 'defender') uid = pd && pd.ev.targetUid;
  else uid = op.targetUid;
  if (!uid) return null;
  return card(g, uid);
}

// ---------- UI/AI 辅助：当前玩家合法动作清单 ----------
function legalMoves(g, cardsById, pi) {
  const moves = [];
  if (g.winner !== null) return moves;
  const p = g.players[pi];
  if (g.pending) { // 响应窗口：轮到的一方可用伏笔 + 跳过
    if (g.pending.turnPtr === pi) {
      for (const s of p.spells) if (canRespond(g, cardsById, pi, s).ok) moves.push({ t: 'respond', spellUid: s.uid });
      moves.push({ t: 'pass' });
    }
    return moves;
  }
  if (g.active !== pi) return moves;
  if (g.phase === 'main1' || g.phase === 'main2') {
    for (const h of p.hand) {
      const d = cardsById[h.cardId];
      if (d.type !== 'char') continue;
      const need = d.level >= 7 ? 2 : d.level >= 5 ? 1 : 0;
      if (p.summoned >= SUMMON_LIMIT) continue;
      if (need === 0) { if (p.board.length < BOARD_MAX) moves.push({ t: 'summon', handUid: h.uid, pos: 'atk', tributes: [] }); }
      else {
        // 枚举解放组合
        const combo = (arr, start, k, acc) => {
          if (k === 0) { moves.push({ t: 'summon', handUid: h.uid, pos: 'atk', tributes: acc.slice() }); return; }
          for (let i = start; i <= arr.length - k; i++) { acc.push(arr[i].uid); combo(arr, i + 1, k - 1, acc); acc.pop(); }
        };
        combo(p.board, 0, need, []);
      }
    }
    for (const u of p.board) {
      if (canSetPos(g, pi, u.uid, u.pos === 'atk' ? 'def' : 'atk').ok) moves.push({ t: 'setPos', uid: u.uid, pos: u.pos === 'atk' ? 'def' : 'atk' });
    }
    // 盖伏（招式/伏笔 → 里侧）
    if (p.setsThisTurn < SET_LIMIT && p.spells.length < SPELL_MAX) {
      for (const h of p.hand) {
        const d = cardsById[h.cardId];
        if (d.type === 'move' || d.type === 'trap') moves.push({ t: 'setSpell', handUid: h.uid });
      }
    }
    // 招式发动（手牌 + 已盖伏招式）
    for (const h of p.hand) {
      const d = cardsById[h.cardId];
      if (d.type !== 'move') continue;
      for (const tgt of moveTargets(g, cardsById, pi, d)) moves.push({ t: 'activateMove', handUid: h.uid, target: tgt });
    }
    for (const s of p.spells) {
      if (!s.set) continue;
      const d = cardsById[s.cardId];
      if (d.type !== 'move') continue;
      for (const tgt of moveTargets(g, cardsById, pi, d)) moves.push({ t: 'activateSpell', spellUid: s.uid, target: tgt });
    }
  }
  if (g.phase === 'battle') {
    for (const u of p.board) {
      if (g.players[1 - pi].board.length === 0) { if (canAttack(g, cardsById, pi, u.uid, null).ok) moves.push({ t: 'attack', uid: u.uid, target: null }); }
      else for (const t of g.players[1 - pi].board) { if (canAttack(g, cardsById, pi, u.uid, t.uid).ok) moves.push({ t: 'attack', uid: u.uid, target: t.uid }); }
    }
  }
  if (g.phase !== 'end') moves.push({ t: 'nextPhase' });
  if (g.phase === 'end') moves.push({ t: 'endTurn' });
  return moves;
}

// ---------- 导出 ----------
const DUEL = {
  PHASES, LP_START, HAND_START, HAND_MAX, BOARD_MAX, SPELL_MAX,
  SUMMON_LIMIT, SET_LIMIT, CHAIN_MAX, DECK_SIZE,
  newGame, applyAction, legalMoves, mkRng,
  canSummon, canSetPos, canAttack,
  canSetSpell, canActivateMove, canRespond, moveTargets,
  drawCard, damageLP, resolveAttack, unitAtk, unitDef, def, destroy,
};
export { DUEL };
