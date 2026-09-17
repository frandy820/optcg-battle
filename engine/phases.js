// 回合结构与 Main 阶段动作。所有玩家操作统一为 action 对象，经 applyAction 驱动。
// 确定性：无隐藏随机（洗牌只在 createGame），回放 = seed + action 序列。
import { usableDons, logEvent, resolveUnit, DON_CAP } from './state.js';
import { runEffect, declareDeckOut, hasKeyword } from './keywords.js';
import {
  startAttack, respondCounter,
} from './combat.js';

// 回合开始自动序列：Refresh → Draw → DON!!（无决策，引擎自动推进到 Main）
export function startTurn(state) {
  const pl = state.players[state.active];
  // Refresh：己方全部单位回正、附着 DON!! 收回费用区
  pl.leader.rest = false;
  pl.leader.dons = 0;
  for (const u of pl.board) { u.rest = false; u.dons = 0; }
  for (const d of pl.donArea) { d.rest = false; d.attached = null; }
  logEvent(state, { t: 'refresh', side: state.active });

  // Draw
  if (pl.deck.length === 0) { declareDeckOut(state, state.active); return; }
  const drawn = pl.deck.pop();
  pl.hand.push(drawn);
  logEvent(state, { t: 'draw', side: state.active, cardId: drawn.id });

  // DON!!：先手全局第一回合 +1，其余 +2；牌库不足放剩余；费用区 10 张封顶
  const isFirstTurnEver = state.turn === 1 && state.firstTurn;
  const want = isFirstTurnEver ? 1 : 2;
  const room = DON_CAP - pl.donArea.length;
  const n = Math.min(want, pl.donDeck, room);
  for (let i = 0; i < n; i++) {
    pl.donArea.push({ id: pl.donArea.length, rest: false, attached: null });
    pl.donDeck--;
  }
  logEvent(state, { t: 'donGain', side: state.active, n });

  state.phase = 'main';
}

// 结束回合：清 turn 增益 → 换边 → 新回合自动序列
export function endTurn(state) {
  if (state.pending) throw new Error('cannot end turn while pending window open');
  for (const pl of state.players) {
    pl.leader.buffs = pl.leader.buffs.filter((b) => b.until !== 'turn');
    for (const u of pl.board) u.buffs = u.buffs.filter((b) => b.until !== 'turn');
  }
  logEvent(state, { t: 'endTurn', side: state.active });
  state.firstTurn = false;
  state.active = 1 - state.active;
  if (state.active === 0) state.turn++;
  startTurn(state);
}

// 出角色：从手牌支付费用登场
export function playCharacter(state, side, idx) {
  const me = state.players[side];
  const card = me.hand[idx];
  if (!card || card.type !== 'char') throw new Error('not a character card in hand');
  if (me.board.length >= 5) throw new Error('board limit 5 reached');
  payDons(me, card.cost);
  me.hand.splice(idx, 1);
  const unit = { ...card, rest: false, playedTurn: state.turn, dons: 0, buffs: [] };
  me.board.push(unit);
  logEvent(state, { t: 'summon', side, cardId: card.id, cost: card.cost });
  runEffect(state, unit, 'onPlay', { side, self: unit });
}

// 出事件：付费 → 执行效果 → 进垃圾场
export function playEvent(state, side, idx) {
  const me = state.players[side];
  const card = me.hand[idx];
  if (!card || card.type !== 'event') throw new Error('not an event card in hand');
  payDons(me, card.cost);
  me.hand.splice(idx, 1);
  me.trash.push(card);
  logEvent(state, { t: 'event', side, cardId: card.id, cost: card.cost });
  runEffect(state, card, 'onPlay', { side, self: null });
}

// 出舞台：全局唯一，旧的进垃圾场
export function playStage(state, side, idx) {
  const me = state.players[side];
  const card = me.hand[idx];
  if (!card || card.type !== 'stage') throw new Error('not a stage card in hand');
  payDons(me, card.cost);
  me.hand.splice(idx, 1);
  const replaced = !!me.stage; // 必须在赋值新舞台前取值，否则恒为 true
  if (replaced) me.trash.push(me.stage);
  me.stage = card;
  logEvent(state, { t: 'stage', side, cardId: card.id, replaced });
  runEffect(state, card, 'onPlay', { side, self: null });
}

// 出装备：付费附着到己方角色（每角色限 1 件，重复出=替换旧的进垃圾场）
export function playGear(state, side, idx, to) {
  const me = state.players[side];
  const card = me.hand[idx];
  if (!card || card.type !== 'gear') throw new Error('not a gear card in hand');
  const target = me.board[to && to.idx];
  if (!target) throw new Error('gear target not found');
  payDons(me, card.cost);
  me.hand.splice(idx, 1);
  if (target.gears && target.gears.length) me.trash.push(target.gears[0]); // 替换：旧装备随葬
  target.gears = [card];
  logEvent(state, { t: 'gear', side, cardId: card.id, to: { type: 'char', idx: to.idx } });
}

// 附着 DON!!：费用区（未横置未附着）→ 己方 Leader/角色
export function giveDon(state, side, to, count) {
  const me = state.players[side];
  const avail = me.donArea.filter((d) => !d.rest && !d.attached);
  if (avail.length < count) throw new Error('not enough usable DON!!');
  if (count <= 0) throw new Error('count must be positive');
  let target;
  if (to.type === 'leader') target = me.leader;
  else {
    target = me.board[to.idx];
    if (!target) throw new Error('attach target not found');
  }
  for (let i = 0; i < count; i++) { avail[i].attached = { type: to.type, idx: to.idx }; }
  target.dons += count;
  logEvent(state, { t: 'donAttach', side, to, count });
}

// 收回附着 DON!! 回费用区（Main 阶段可逆操作）
export function takeDon(state, side, from, count) {
  if (count <= 0) throw new Error('count must be positive'); // 与 giveDon 对齐，堵 count=0 空操作
  const me = state.players[side];
  const attached = me.donArea.filter((d) => d.attached && d.attached.type === from.type
    && (from.type === 'leader' || d.attached.idx === from.idx));
  if (attached.length < count) throw new Error('not enough attached DON!! on target');
  let target;
  if (from.type === 'leader') target = me.leader;
  else {
    target = me.board[from.idx];
    if (!target) throw new Error('detach target not found'); // 原先缺检：undefined 上 -= 直接 TypeError
  }
  for (let i = 0; i < count; i++) { attached[i].attached = null; }
  target.dons -= count;
  logEvent(state, { t: 'donTake', side, from, count });
}

function payDons(me, cost) {
  if (cost < 0) throw new Error('negative cost');
  if (usableDons(me) < cost) throw new Error('not enough DON!! to pay');
  let left = cost;
  for (const d of me.donArea) {
    if (left === 0) break;
    if (!d.rest && !d.attached) { d.rest = true; left--; }
  }
}

// ===== 动作分发（index.js 调用） =====
export function applyAction(state, action) {
  if (state.winner !== null) throw new Error('game over');
  const side = action.side;
  if (typeof side !== 'number') throw new Error('action.side required');

  // 响应窗口（Counter）：行动权在防守方
  if (state.pending) {
    if (side !== state.pending.target.side) throw new Error('not your response window');
    switch (action.t) {
      case 'counter': case 'passCounter': respondCounter(state, action); return;
      default: throw new Error(`illegal action ${action.t} during response window`);
    }
  }

  if (side !== state.active) throw new Error('not your turn');
  switch (action.t) {
    case 'playCharacter': playCharacter(state, side, action.idx); break;
    case 'playEvent': playEvent(state, side, action.idx); break;
    case 'playStage': playStage(state, side, action.idx); break;
    case 'playGear': playGear(state, side, action.idx, action.to); break;
    case 'giveDon': giveDon(state, side, action.to, action.count || 1); break;
    case 'takeDon': takeDon(state, side, action.from, action.count || 1); break;
    case 'attack': startAttack(state, action); break;
    case 'endTurn': endTurn(state); break;
    default: throw new Error('unknown action: ' + action.t);
  }
}
