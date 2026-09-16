// 战斗五步：攻击宣告 → Blocker 顶包 → Counter 窗口 → 结算 → 清算
// 响应窗口通过 state.pending 暴露给双方（人或 AI 均以 action 驱动，无回调）
import { powerOfUnit, leaderPower, resolveUnit, logEvent } from './state.js';
import { hasKeyword, runEffect } from './keywords.js';

// 发起攻击：action { t:'attack', attacker:{side,type,idx}, target:'leader'|{type:'char',idx} }
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

  // 目标合法性：只能打 Leader，或已横置的角色
  let targetRef;
  if (target === 'leader' || target.type === 'leader') {
    targetRef = { side: defSide, type: 'leader' };
  } else {
    const unit = foe.board[target.idx];
    if (!unit) throw new Error('target not found');
    if (!unit.rest) throw new Error('can only attack rested characters or the leader');
    targetRef = { side: defSide, type: 'char', idx: target.idx };
  }

  atk.rest = true;
  logEvent(state, { t: 'attack', attacker, target: targetRef });

  // When Attacking 效果（横置后、窗口前）
  runEffect(state, atk, 'whenAttacking', { side: attacker.side, self: atk });

  if (state.winner !== null) return; // 效果可能直接终局

  state.pending = {
    kind: 'block',
    attacker,
    target: targetRef,
    counterBoost: 0,
    countered: [],
  };
  logEvent(state, { t: 'window', kind: 'block', side: defSide });
}

// 响应1：Blocker 顶包：action { t:'block', idx }  |  { t:'passBlock' }
export function respondBlock(state, action) {
  const p = expectPending(state, 'block');
  const foe = state.players[p.target.side];
  if (action.t === 'block') {
    const unit = foe.board[action.idx];
    if (!unit) throw new Error('blocker not found');
    if (!hasKeyword(unit, 'blocker')) throw new Error('unit lacks Blocker');
    if (unit.rest) throw new Error('blocker is rested');
    unit.rest = true;
    p.target = { side: p.target.side, type: 'char', idx: action.idx };
    logEvent(state, { t: 'block', side: p.target.side, idx: action.idx });
  }
  p.kind = 'counter';
  logEvent(state, { t: 'window', kind: 'counter', side: p.target.side });
}

// 响应2：Counter（可多次累加）：action { t:'counter', cards:[handIdx...] }  |  { t:'passCounter' }
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

// 步骤4-5：比大小结算 + 清算
export function resolveAttack(state, p) {
  const atk = resolveUnit(state, p.attacker);
  const def = resolveUnit(state, p.target);
  const atkPower = p.attacker.type === 'leader'
    ? leaderPower(state.players[p.attacker.side])
    : powerOfUnit(atk);
  const defPower = (p.target.type === 'leader'
    ? leaderPower(state.players[p.target.side])
    : powerOfUnit(def)) + p.counterBoost;

  logEvent(state, { t: 'clash', atkPower, defPower });

  if (atkPower >= defPower) {
    if (p.target.type === 'leader') {
      const hits = hasKeyword(atk, 'doubleAttack') ? 2 : 1;
      for (let h = 0; h < hits && state.winner === null; h++) {
        dealLeaderDamage(state, p, atk);
      }
    } else {
      // 角色被击倒
      const foe = state.players[p.target.side];
      const [dead] = foe.board.splice(p.target.idx, 1);
      foe.trash.push(dead);
      logEvent(state, { t: 'ko', side: p.target.side, cardId: dead.id });
      // 后续单位 idx 位移：pending 已结束，无需修正
      runEffect(state, dead, 'onKO', { side: p.target.side, self: null });
    }
  } else {
    logEvent(state, { t: 'noDamage', reason: 'power' });
  }

  // 清算：本次战斗的临时增益清空
  clearBattleBuffs(state);
  state.pending = null;
}

function dealLeaderDamage(state, p, atk) {
  const defSide = p.target.side;
  const foe = state.players[defSide];
  if (foe.life.length === 0) {
    state.winner = p.attacker.side;
    state.winReason = 'leader';
    logEvent(state, { t: 'win', winner: state.winner, reason: 'leader' });
    return;
  }
  const flipped = foe.life.shift();
  const banish = hasKeyword(atk, 'banish');
  if (banish) {
    foe.trash.push(flipped);
    logEvent(state, { t: 'life', side: defSide, cardId: flipped.id, banish: true });
  } else {
    foe.hand.push(flipped);
    logEvent(state, { t: 'life', side: defSide, cardId: flipped.id, to: 'hand' });
    // Trigger：翻出即发动（无论去向——官方为入手牌后可选择发动，M0 自动发动）
    runEffect(state, flipped, 'trigger', { side: defSide, self: null });
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
