// 词条与效果算子注册表（数据驱动：卡池 JSON 声明式挂载，引擎按表执行）
//
// 静态词条（布尔标记，引擎在规则点检查）：
//   rush          登场回合即可攻击
//   blocker       可横置顶包成为攻击目标（守备表示挡刀）
//   doubleAttack  直攻船长的 LP 伤害 ×2
//   banish        猛击：直攻船长时 LP 伤害额外 +2000（LP 积分制语义）
//
// 触发钩子（卡上 effect: { hook, op }）：
//   onPlay         登场/打出时
//   whenAttacking  攻击宣告时（横置后、Block/Counter 窗口前）
//   onKO           被击倒进垃圾场时
//   trigger        作为 Life 被翻出时（banish 送达的不触发）
//   onSummon       己方角色登场时（船长技能用：娜美抽牌/索隆强化）
//   onAllyKO       己方角色被击沉时（船长技能用：山治回血）
//   onTurnStart    己方回合开始（DON 阶段后；船长技能用：香克斯加速）
//   onKill         己方击沉对方角色时（ctx.attacker=击沉发起者 ref；船长技能用：罗抽牌）
//
// 算子 op（M0 实现 6 个，M1 卡池只允许引用已实现算子）：
//   { k:'draw', n }
//   { k:'powerSelf', x, until, minCost }  x 为增量（如 +2000 写 2000）；minCost=仅对费用≥该值的单位生效
//   { k:'powerLeader', x, until }
//   { k:'gainDon', n }                 从 DON!! 牌库翻 n 张入费用区
//   { k:'koWeakest' }                  击倒敌方场上战力最低角色
//   { k:'restEnemy', side? }           横置敌方一个角色
//   { k:'healLP', x }                  LP 回复（上限=life×2000）

export const HOOKS = ['onPlay', 'whenAttacking', 'onKO', 'trigger', 'onSummon', 'onAllyKO', 'onTurnStart', 'onKill'];

export function hasKeyword(unit, kw) {
  if (Array.isArray(unit.keywords) && unit.keywords.includes(kw)) return true;
  // 装备词条归并（甲胄给 blocker 等）：装备在则视为单位词条
  return Array.isArray(unit.gears) && unit.gears.some((g) => g.gear && Array.isArray(g.gear.gives) && g.gear.gives.includes(kw));
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
      // minCost 门槛（娜美：仅 3 费+ 登场才抽，防低费连抽滚雪球）
      if (eff.op.minCost && ctx.self && ctx.self.cost != null && ctx.self.cost < eff.op.minCost) break;
      // reqAttacker 门槛（罗 onKill：仅船长发起的击沉才抽，角色互斗吃掉不算）
      if (eff.op.reqAttacker && (!ctx.attacker || ctx.attacker.type !== eff.op.reqAttacker)) break;
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
      if (eff.op.minCost && ctx.self.cost < eff.op.minCost) break; // 费用门槛（索隆：只强化 5 费+）
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
      if (Array.isArray(dead.gears) && dead.gears.length) {
        foe.trash.push(...dead.gears);
        dead.gears = [];
      }
      foe.trash.push(dead);
      // 其后单位索引前移：同步修正附着 DON 记账（与 combat.koUnit 同源）
      for (const d of foe.donArea) {
        if (d.attached && d.attached.type === 'char' && d.attached.idx > mi) d.attached.idx--;
      }
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
    case 'healLP': {
      const cap = me.leader.life * 2000;
      const before = me.lp;
      me.lp = Math.min(cap, me.lp + (eff.op.x || 1000));
      logEvent(state, { t: 'heal', side, x: me.lp - before, lp: me.lp, src: cardOrUnit.id });
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
