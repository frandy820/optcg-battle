// 海贼王：伟大航路决斗 — 决斗引擎（规则真值源: docs/duel-rules.md）
// 零 DOM、确定性（seed 驱动洗牌）、玩家与 AI 共用同一动作入口与校验。
// CJS + 浏览器全局双导出（与旧 DEMO 离线 file:// 能力一致）。
'use strict';

const PHASES = ['draw', 'standby', 'main1', 'battle', 'main2', 'end'];
const LP_START = 4000;
const HAND_START = 5;
const HAND_MAX = 8;
const BOARD_MAX = 3;   // 人物区
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
// opts: { seed, decks:[playerDeckIds, aiDeckIds], first: 0|1(默认0=玩家先手), names:[..] }
function newGame(cardsById, opts) {
  const rng = mkRng(opts.seed || 20260924);
  const g = {
    v: 1, seed: opts.seed || 20260924, rng,
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
  log(g, `决斗开始！${g.players[0].name} LP${LP_START} vs ${g.players[1].name} LP${LP_START}`);
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
const unitAtk = (cardsById, u) => def(cardsById, u).atk + (u.buffAtk || 0);
const unitDef = (cardsById, u) => def(cardsById, u).def + (u.buffDef || 0);

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
//         {t:'attack',uid,target} | {t:'nextPhase'} | {t:'endTurn'}
function applyAction(g, cardsById, pi, action) {
  if (g.winner !== null) return { ok: false, reason: '对局已结束', fatal: false };
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
    p.board.splice(i, 1); p.grave.push({ ...u });
  }
  if (names.length) log(g, `${p.name} 解放了 ${names.join('、')}`);
  p.hand.splice(idx, 1);
  p.board.push({ uid: 'u' + (++g.actionSeq), cardId: h.cardId, pos: a.pos,
    attacked: false, summonedTurn: g.turn, posChanged: false });
  p.summoned++;
  log(g, `${p.name} 通常登场「${d.name}」（Lv${d.level} ATK${d.atk}/${a.pos === 'atk' ? '攻' : '守'}表示）`);
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
  u.attacked = true; // 宣言即锁定攻击权（无论结算结果）

  // 响应窗口（Phase 3 实现；当前无伏笔卡类型时直接通过）
  const wnd = openResponseWindow(g, cardsById, { kind: 'attack', attacker: u, target: a.target });
  if (wnd) return wnd; // 挂起等待响应（Phase 3）

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
  p.grave.push({ ...u });
  log(g, `「${cardsById[u.cardId].name}」被破坏，进入墓场`);
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
  onEnterPhase(g, cardsById);
  return { ok: true };
}

function onEnterPhase(g, cardsById) {
  const p = me(g);
  if (g.phase === 'draw') {
    // 新回合开始由 endTurn 处理换边；此处仅为防御
  }
  if (g.phase === 'standby') log(g, `— ${p.name} 的准备阶段 —`);
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

// ---------- 响应窗口（Phase 3 实现；当前无伏笔卡 → 永远无窗口） ----------
function openResponseWindow(g, cardsById, ev) {
  // Phase 2：场上不存在可发动的伏笔（卡池无 trap 类型）→ 不开窗，直接结算。
  const anyTrap = g.players.some(p => p.spells.length > 0);
  if (!anyTrap) return null;
  // Phase 3: g.pending = { kind: ev.kind, chain: [], actor: g.active, ev };
  return null;
}

// ---------- UI/AI 辅助：当前玩家合法动作清单 ----------
function legalMoves(g, cardsById, pi) {
  const moves = [];
  const p = g.players[pi];
  if (g.winner !== null || g.active !== pi) return moves;
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
  newGame, applyAction, legalMoves,
  canSummon, canSetPos, canAttack,
  drawCard, damageLP, resolveAttack, unitAtk, unitDef, def,
};
export { DUEL };
