// 词条与效果算子注册表（数据驱动：卡池 JSON 声明式挂载，引擎按表执行）
//
// 静态词条（布尔标记，引擎在规则点检查）：
//   rush          登场回合即可攻击
//   blocker       可横置顶包成为攻击目标
//   doubleAttack  对 Leader 伤害变 2
//   banish        造成的伤害使 Life 卡直接进垃圾场（不入手牌、不发 Trigger）
//
// 触发钩子（卡上 effect: { hook, op }）：
//   onPlay         登场/打出时
//   whenAttacking  攻击宣告时（横置后、Block/Counter 窗口前）
//   onKO           被击倒进垃圾场时
//   trigger        作为 Life 被翻出时（banish 送达的不触发）
//
// 算子 op（M0 实现 6 个，M1 卡池只允许引用已实现算子）：
//   { k:'draw', n }
//   { k:'powerSelf', x, until }        x 为增量（如 +2000 写 2000）
//   { k:'powerLeader', x, until }
//   { k:'gainDon', n }                 从 DON!! 牌库翻 n 张入费用区
//   { k:'koWeakest' }                  击倒敌方场上战力最低角色
//   { k:'restEnemy', side? }           横置敌方一个角色

export const HOOKS = ['onPlay', 'whenAttacking', 'onKO', 'trigger'];

export function hasKeyword(unit, kw) {
  return Array.isArray(unit.keywords) && unit.keywords.includes(kw);
}

// 统一执行入口：ctx = { state, side(操作方), self(效果来源单位或卡), rngNotNeeded }
export function runEffect(state, cardOrUnit, hook, ctx = {}) {
  const eff = cardOrUnit && cardOrUnit.effect;
  if (!eff || eff.hook !== hook) return;
  const side = ctx.side !== undefined ? ctx.side : state.active;
  const enemySide = side === 0 ? 1 : 0;
  const me = state.players[side];
  const foe = state.players[enemySide];

  switch (eff.op.k) {
    case 'draw': {
      const n = eff.op.n || 1;
      for (let i = 0; i < n; i++) {
        if (me.deck.length === 0) { declareDeckOut(state, side); return; }
        me.hand.push(me.deck.pop());
      }
      logEvent(state, { t: 'effectDraw', side, n, src: cardOrUnit.id });
      break;
    }
    case 'powerSelf': {
      // self 必须是场上单位；否则退化为无操作
      if (!ctx.self || !ctx.self.power) break;
      ctx.self.buffs.push({ x: eff.op.x, until: eff.op.until || 'turn', src: cardOrUnit.id });
      logEvent(state, { t: 'effectBuff', side, target: unitRefOf(state, side, ctx.self), x: eff.op.x, src: cardOrUnit.id });
      break;
    }
    case 'powerLeader': {
      me.leader.buffs.push({ x: eff.op.x, until: eff.op.until || 'turn', src: cardOrUnit.id });
      logEvent(state, { t: 'effectBuff', side, target: { side, type: 'leader' }, x: eff.op.x, src: cardOrUnit.id });
      break;
    }
    case 'gainDon': {
      const n = Math.min(eff.op.n || 1, me.donDeck, DON_CAP - me.donArea.length);
      for (let i = 0; i < n; i++) {
        me.donArea.push({ id: me.donArea.length, rest: false, attached: null });
        me.donDeck--;
      }
      logEvent(state, { t: 'effectDon', side, n, src: cardOrUnit.id });
      break;
    }
    case 'koWeakest': {
      if (foe.board.length === 0) break;
      let mi = 0;
      for (let i = 1; i < foe.board.length; i++) {
        if (powerOfUnit(foe.board[i]) < powerOfUnit(foe.board[mi])) mi = i;
      }
      const [dead] = foe.board.splice(mi, 1);
      foe.trash.push(dead);
      logEvent(state, { t: 'ko', side: enemySide, idx: mi, cardId: dead.id, by: cardOrUnit.id });
      runEffect(state, dead, 'onKO', { side: enemySide, self: null });
      break;
    }
    case 'restEnemy': {
      if (foe.board.length === 0) break;
      // 默认横置敌方最右（由 AI/玩家选目标的进阶交互二期再做；M1 卡池避免歧义用法）
      const target = foe.board[foe.board.length - 1];
      target.rest = true;
      logEvent(state, { t: 'rest', side: enemySide, idx: foe.board.length - 1, src: cardOrUnit.id });
      break;
    }
    default:
      throw new Error('unknown effect op: ' + eff.op.k);
  }
}

export function declareDeckOut(state, side) {
  state.winner = side === 0 ? 1 : 0;
  state.winReason = 'deckout';
  logEvent(state, { t: 'win', winner: state.winner, reason: 'deckout' });
}

// ===== 内部 =====
import { powerOfUnit, logEvent, DON_CAP } from './state.js';

function unitRefOf(state, side, unit) {
  const idx = state.players[side].board.indexOf(unit);
  return idx >= 0 ? { side, type: 'char', idx } : { side, type: 'leader' };
}
