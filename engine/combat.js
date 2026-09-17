// 战斗五步：攻击宣告 → Blocker 顶包 → Counter 窗口 → 结算 → 清算
// 游戏王式积分制：角色互斗比较战力、差额扣 LP；对方场上无角色时才可直攻船长（差额扣 LP）
// 响应窗口通过 state.pending 暴露给双方（人或 AI 均以 action 驱动，无回调）
import { powerOfUnit, leaderPower, resolveUnit, logEvent } from './state.js';
import { hasKeyword, runEffect } from './keywords.js';

// 发起攻击：action { t:'attack', attacker:{side,type,idx}, target:'leader'|{type:'char',idx} }
// 目标规则：对方场上有角色 → 必须指定其一（竖=攻击表示，横=守备表示，均可被攻击）；
//           场上无角色 → 只能直攻船长（船长战力为天然防线，伤害=差额）
export function startAttack(state, action) {
  if (state.pending) throw new Error('cannot attack while pending window open');
  const { attacker, target } = action;
  const atk = resolveUnit(state, attacker);
  if (!atk) throw new Error('attacker not found');
  if (atk.rest) throw new Error('attacker is rested');
  if (attacker.type === 'char') {
    const unit = state.players[attacker.side].board[attacker.idx];
    if (unit.playedTurn === state.turn && !hasKeyword(unit, 'rush')) {
      throw new Error('summoning sickness: cannot attack on play turn (no Rush)');
    }
  }
  const defSide = attacker.side === 0 ? 1 : 0;
  const foe = state.players[defSide];

  let targetRef;
  if (target === 'leader' || target.type === 'leader') {
    if (foe.board.length > 0) throw new Error('must attack a character while opponent board is not empty');
    targetRef = { side: defSide, type: 'leader' };
  } else {
    const unit = foe.board[target.idx];
    if (!unit) throw new Error('target not found');
    targetRef = { side: defSide, type: 'char', idx: target.idx };
  }

  atk.rest = true;
  logEvent(state, { t: 'attack', attacker, target: targetRef });

  // When Attacking 效果（横置后、窗口前）
  runEffect(state, atk, 'whenAttacking', { side: attacker.side, self: atk });

  if (state.winner !== null) return; // 效果可能直接终局

  state.pending = {
    kind: 'counter',
    attacker,
    target: targetRef,
    counterBoost: 0,
    countered: [],
  };
  logEvent(state, { t: 'window', kind: 'counter', side: defSide });
}

// 响应窗口：Counter（可多次累加，为防守目标+战力/直攻减伤）：action { t:'counter', cards:[handIdx...] }  |  { t:'passCounter' }
export function respondCounter(state, action) {
  const p = expectPending(state, 'counter');
  const defSide = p.target.side;
  const me = state.players[defSide];
  if (action.t === 'counter') {
    if (!Array.isArray(action.cards) || action.cards.length === 0) {
      throw new Error('counter cards required');
    }
    const uniq = [...new Set(action.cards)];
    if (uniq.length !== action.cards.length) throw new Error('duplicate counter card index');
    // 先整体校验再删除：任何一张非法则整批拒绝，不留半完成状态
    for (const hi of uniq) {
      const card = me.hand[hi];
      if (!card) throw new Error('counter card not in hand');
      if (!card.counter) throw new Error('card has no counter value');
    }
    // 倒序删除：多张时正序 splice 会让后续索引位移删错卡
    const added = [];
    let boost = 0;
    for (const hi of uniq.slice().sort((a, b) => b - a)) {
      const [card] = me.hand.splice(hi, 1);
      me.trash.push(card);
      p.counterBoost += card.counter;
      p.countered.push(card.id);
      added.unshift(card.id); // unshift 恢复原手牌顺序
      boost += card.counter;
    }
    // 增量语义：cards/boost = 本次打出；totalCards/totalBoost = 本次战斗累计（旧消费方差分可用 total 字段）
    logEvent(state, {
      t: 'counter', side: defSide,
      cards: added, boost,
      totalCards: p.countered.slice(), totalBoost: p.counterBoost,
    });
    return; // 窗口保持开放，可继续加或 pass
  }
  resolveAttack(state, p);
}

// 步骤4-5：比大小结算（游戏王式）+ 清算
// 坚壁（blocker）：被攻击时防御战力 +1000（横竖皆生效）
const BLOCKER_WALL = 1000;
export function resolveAttack(state, p) {
  const atk = resolveUnit(state, p.attacker);
  const atkPower = p.attacker.type === 'leader'
    ? leaderPower(state.players[p.attacker.side])
    : powerOfUnit(atk);
  const def = resolveUnit(state, p.target);
  const defPower = (p.target.type === 'leader'
    ? leaderPower(state.players[p.target.side])
    : powerOfUnit(def) + (hasKeyword(def, 'blocker') ? BLOCKER_WALL : 0)) + p.counterBoost;

  logEvent(state, { t: 'clash', atkPower, defPower });

  if (p.target.type === 'leader') {
    // 直攻：伤害=差额（船长战力为防线，Counter 可减伤）；双击=差额×2，猛击=+2000 保底
    let dmg = Math.max(0, atkPower - defPower);
    if (dmg > 0 && hasKeyword(atk, 'doubleAttack')) dmg *= 2;
    if (hasKeyword(atk, 'banish')) dmg += 2000;
    if (dmg <= 0) logEvent(state, { t: 'noDamage', reason: 'power' });
    else dealLpDamage(state, p.target.side, dmg, p.attacker.side);
  } else if (!def) {
    // 顶包/效果竞态下目标已不在场：无战果收场
    logEvent(state, { t: 'noDamage', reason: 'gone' });
  } else if (def.rest) {
    // 守备表示（横置）：打得动才击沉，无差额伤害；打不动=无战果
    if (atkPower > defPower) {
      koUnit(state, p.target, p.attacker.side);
    } else {
      logEvent(state, { t: 'noDamage', reason: 'defense' });
    }
  } else {
    // 攻击表示互斗：战力比较，差额扣败方 LP；相等同归于尽（攻击者是船长则船长不沉）
    if (atkPower > defPower) {
      koUnit(state, p.target, p.attacker.side);
      if (state.winner === null) dealLpDamage(state, p.target.side, atkPower - defPower, p.attacker.side);
    } else if (atkPower < defPower) {
      if (p.attacker.type === 'char') koUnit(state, p.attacker, p.target.side);
      if (state.winner === null) dealLpDamage(state, p.attacker.side, defPower - atkPower, p.target.side);
    } else {
      if (p.attacker.type === 'char') koUnit(state, p.attacker, p.target.side);
      koUnit(state, p.target, p.attacker.side);
    }
  }

  // 清算：本次战斗的临时增益清空
  clearBattleBuffs(state);
  state.pending = null;
}

// 击沉角色进墓场（触发 onKO）
function koUnit(state, ref, bySide) {
  const pl = state.players[ref.side];
  if (ref.type !== 'char') return;
  const [dead] = pl.board.splice(ref.idx, 1);
  if (!dead) return;
  pl.trash.push(dead);
  // 其后单位索引前移：同步修正附着 DON 的 board 记账（否则 takeDon 找不到=引擎不一致）
  for (const d of pl.donArea) {
    if (d.attached && d.attached.type === 'char' && d.attached.idx > ref.idx) d.attached.idx--;
  }
  logEvent(state, { t: 'ko', side: ref.side, cardId: dead.id });
  runEffect(state, dead, 'onKO', { side: ref.side, self: null });
}

// LP 伤害与胜负（游戏王式积分制）
function dealLpDamage(state, side, dmg, bySide) {
  const pl = state.players[side];
  pl.lp -= dmg;
  logEvent(state, { t: 'lp', side, dmg, lp: pl.lp });
  if (pl.lp <= 0) {
    state.winner = bySide;
    state.winReason = 'lp';
    logEvent(state, { t: 'win', winner: state.winner, reason: 'lp' });
  }
}

function clearBattleBuffs(state) {
  for (const pl of state.players) {
    pl.leader.buffs = pl.leader.buffs.filter((b) => b.until !== 'battle');
    for (const u of pl.board) u.buffs = u.buffs.filter((b) => b.until !== 'battle');
  }
}

function expectPending(state, kind) {
  if (!state.pending || state.pending.kind !== kind) {
    throw new Error(`expected ${kind} window, got ${state.pending ? state.pending.kind : 'none'}`);
  }
  return state.pending;
}
