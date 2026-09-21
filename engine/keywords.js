// 词条与效果算子注册表（数据驱动：卡池 JSON 声明式挂载，引擎按表执行）
//
// 静态词条（布尔标记，引擎在规则点检查）：
//   rush          登场回合即可攻击
//   blocker       可横置顶包成为攻击目标（守备表示挡刀）
//   doubleAttack  直攻船长的 LP 伤害 ×2
//   banish        猛击：直攻船长时 LP 伤害额外 +2000（LP 积分制语义）
//
// 触发钩子（卡上 effect: { hook, op }；船长 v2 用 skills: [{hook, op, cond?, oncePerTurn?}]）：
//   onPlay         登场/打出时
//   whenAttacking  攻击宣告时（横置后、Block/Counter 窗口前）
//   onKO           被击倒进垃圾场时
//   trigger        作为 Life 被翻出时（banish 送达的不触发）
//   onSummon       己方角色登场时（船长技能用：娜美抽牌/索隆强化）
//   onAllyKO       己方角色被击沉时（船长技能用：山治回血）
//   onTurnStart    己方回合开始（DON 阶段后；船长技能用：明戈抽牌/香克斯加速）
//   onKill         己方击沉对方角色时（ctx.attacker=击沉发起者 ref；船长技能用：罗抽牌/凯多震伤）
//   whenAttacked   己方单位成为攻击目标时（防御方船长技能用：汉库珂魅惑）
//
// 效果声明（v2 船长分化）：
//   effect/skills 条目：{ hook, op, cond?, oncePerTurn? }
//   cond 条件（触发时校验，不满足=本次不触发）：
//     { lpMax }        我方 LP ≤ x（残血觉醒线）
//     { foeBoardMin }  对方场上角色数 ≥ x
//     { foeBoardMax }  对方场上角色数 ≤ x
//     { myBoardMin }   我方场上角色数 ≥ x
//     { handMin/handMax } 我方手牌数界
//   oncePerTurn: true —— 同一回合同一来源同钩子只触发一次（state.onceMark 记账）
//
// 算子 op（op 可为单对象或数组；数组=复合，discard 代价不可付时整条跳过）：
//   { k:'draw', n, minCost?, reqAttacker? }
//   { k:'powerSelf', x, until, minCost? }  x 为增量（如 +2000 写 2000）；minCost=仅对费用≥该值的单位生效
//   { k:'powerLeader', x, until }
//   { k:'gainDon', n }                 从 DON!! 牌库翻 n 张入费用区
//   { k:'koWeakest' }                  击倒敌方场上战力最低角色
//   { k:'restEnemy', target? }         横置敌方一个角色（last 默认/strongest/weakest）
//   { k:'healLP', x }                  LP 回复（上限=life×2000）
//   { k:'damageLP', x }                对方 LP 直伤（可终局）
//   { k:'buffAll', x, until }          我方全体角色战力+x
//   { k:'debuffFoeAll', x, until }     对方全体角色战力-x
//   { k:'discard', n }                 弃自己手牌 n 张（仅作复合代价段，弃最右）
//   { k:'search', n, faction?, type?, maxCost?, formation? }  从牌组找匹配卡入手牌（P1a archetype 引擎）
//   { k:'revive', maxCost? }           从墓场复活 ≤maxCost 角色回手牌（默认 3；仅 SS+ 卡可用，费率 −3K）

export const HOOKS = ['onPlay', 'whenAttacking', 'onKO', 'trigger', 'onSummon', 'onAllyKO', 'onTurnStart', 'onKill', 'whenAttacked'];

export function hasKeyword(unit, kw) {
  if (Array.isArray(unit.keywords) && unit.keywords.includes(kw)) return true;
  // 装备词条归并（甲胄给 blocker 等）：装备在则视为单位词条
  return Array.isArray(unit.gears) && unit.gears.some((g) => g.gear && Array.isArray(g.gear.gives) && g.gear.gives.includes(kw));
}

// 效果条目归一：船长 v2 skills 数组 / 通用 effects 数组 / 旧版单 effect
function effectsOf(cardOrUnit) {
  if (!cardOrUnit) return [];
  if (Array.isArray(cardOrUnit.skills)) return cardOrUnit.skills;
  if (Array.isArray(cardOrUnit.effects)) return cardOrUnit.effects;
  return cardOrUnit.effect ? [cardOrUnit.effect] : [];
}

// 统一执行入口：ctx = { state, side(操作方), self(效果来源单位或卡), rngNotNeeded }
export function runEffect(state, cardOrUnit, hook, ctx = {}) {
  const side = ctx.side !== undefined ? ctx.side : state.active;
  const me = state.players[side];
  const foe = state.players[side === 0 ? 1 : 0];
  state.onceMark = state.onceMark || {}; // 旧回放兼容：缺字段时补挂

  for (const eff of effectsOf(cardOrUnit)) {
    if (!eff || eff.hook !== hook) continue;
    if (!condMet(state, eff.cond, side, me, foe)) continue;
    if (eff.oncePerTurn) {
      const key = `${side}:${cardOrUnit.id || 'anon'}:${hook}:${eff.name || ''}`;
      if (state.onceMark[key] === state.turn) continue;
      state.onceMark[key] = state.turn;
    }
    const ops = Array.isArray(eff.op) ? eff.op : [eff.op];
    // 原子性预检：discard 代价不可付 → 整条跳过（不留半完成状态）
    for (const op of ops) {
      if (op && op.k === 'discard' && me.hand.length < (op.n || 1)) return;
    }
    // 船长技能发动事件（F11 动效驱动源）：仅 skills 来源记，普通卡 effect 不记
    if (Array.isArray(cardOrUnit.skills) && eff.name) {
      logEvent(state, { t: 'skill', side, name: eff.name, awaken: /觉醒/.test(eff.name), src: cardOrUnit.id });
    }
    for (const op of ops) {
      execOp(state, cardOrUnit, eff, op, side, me, foe, ctx);
      if (state.winner !== null) return; // 效果可能直接终局
    }
  }
}

function condMet(state, cond, side, me, foe) {
  if (!cond) return true;
  if (cond.lpMax !== undefined && me.lp > cond.lpMax) return false;
  if (cond.foeBoardMin !== undefined && foe.board.length < cond.foeBoardMin) return false;
  if (cond.foeBoardMax !== undefined && foe.board.length > cond.foeBoardMax) return false;
  if (cond.myBoardMin !== undefined && me.board.length < cond.myBoardMin) return false;
  if (cond.handMin !== undefined && me.hand.length < cond.handMin) return false;
  if (cond.handMax !== undefined && me.hand.length > cond.handMax) return false;
  return true;
}

function execOp(state, cardOrUnit, eff, op, side, me, foe, ctx) {
  const enemySide = side === 0 ? 1 : 0;
  switch (op.k) {
    case 'draw': {
      const n = op.n || 1;
      // minCost 门槛（娜美：仅 3 费+ 登场才抽，防低费连抽滚雪球）
      if (op.minCost && ctx.self && ctx.self.cost != null && ctx.self.cost < op.minCost) break;
      // reqAttacker 门槛（罗 onKill：仅船长发起的击沉才抽，角色互斗吃掉不算）
      if (op.reqAttacker && (!ctx.attacker || ctx.attacker.type !== op.reqAttacker)) break;
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
      if (op.minCost && ctx.self.cost < op.minCost) break; // 费用门槛（索隆：只强化 5 费+）
      ctx.self.buffs.push({ x: op.x, until: op.until || 'turn', src: cardOrUnit.id });
      logEvent(state, { t: 'effectBuff', side, target: unitRefOf(state, side, ctx.self), x: op.x, src: cardOrUnit.id });
      break;
    }
    case 'powerLeader': {
      me.leader.buffs.push({ x: op.x, until: op.until || 'turn', src: cardOrUnit.id });
      logEvent(state, { t: 'effectBuff', side, target: { side, type: 'leader' }, x: op.x, src: cardOrUnit.id });
      break;
    }
    case 'gainDon': {
      const n = Math.min(op.n || 1, me.donDeck, DON_CAP - me.donArea.length);
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
      // target 选择：last 默认（最右）/ strongest / weakest
      let idx = foe.board.length - 1;
      if (op.target === 'strongest' || op.target === 'weakest') {
        idx = 0;
        for (let i = 1; i < foe.board.length; i++) {
          const p = powerOfUnit(foe.board[i]), cur = powerOfUnit(foe.board[idx]);
          if (op.target === 'strongest' ? p > cur : p < cur) idx = i;
        }
      }
      foe.board[idx].rest = true;
      logEvent(state, { t: 'rest', side: enemySide, idx, src: cardOrUnit.id });
      break;
    }
    case 'healLP': {
      const cap = me.leader.life * 2000;
      const before = me.lp;
      me.lp = Math.min(cap, me.lp + (op.x || 1000));
      logEvent(state, { t: 'heal', side, x: me.lp - before, lp: me.lp, src: cardOrUnit.id });
      break;
    }
    case 'damageLP': {
      const x = op.x || 1000;
      foe.lp -= x;
      logEvent(state, { t: 'lp', side: enemySide, dmg: x, lp: foe.lp, src: cardOrUnit.id });
      if (foe.lp <= 0) {
        state.winner = side;
        state.winReason = 'lp';
        logEvent(state, { t: 'win', winner: side, reason: 'lp' });
      }
      break;
    }
    case 'buffAll': {
      for (const u of me.board) {
        u.buffs.push({ x: op.x, until: op.until || 'turn', src: cardOrUnit.id });
      }
      logEvent(state, { t: 'effectBuffAll', side, x: op.x, n: me.board.length, src: cardOrUnit.id });
      break;
    }
    case 'debuffFoeAll': {
      for (const u of foe.board) {
        u.buffs.push({ x: -op.x, until: op.until || 'battle', src: cardOrUnit.id });
      }
      logEvent(state, { t: 'effectDebuffAll', side: enemySide, x: -op.x, n: foe.board.length, src: cardOrUnit.id });
      break;
    }
    case 'search': {
      // 从牌组找匹配卡入手牌（牌组顶在尾部；找不够=有多少拿多少，不洗牌不透牌序）
      // 条件：faction/type/maxCost/formation 任选组合（archetype 引擎的「找牌」核心原语）
      const n = op.n || 1;
      let found = 0;
      for (let i = me.deck.length - 1; i >= 0 && found < n; i--) {
        const c = me.deck[i];
        const ok = (!op.faction || c.faction === op.faction)
          && (!op.type || c.type === op.type)
          && (op.maxCost == null || c.cost <= op.maxCost)
          && (op.formation == null || c.formation === op.formation);
        if (ok) { me.deck.splice(i, 1); me.hand.push(c); found++; }
      }
      logEvent(state, { t: 'effectSearch', side, n: found, src: cardOrUnit.id });
      break;
    }
    case 'revive': {
      // 从墓场复活一张 ≤maxCost 角色回手牌（回场太强，回手仍需付费打出）
      const maxCost = op.maxCost || 3;
      let idx = -1;
      for (let i = me.trash.length - 1; i >= 0; i--) {
        if (me.trash[i].type === 'char' && me.trash[i].cost <= maxCost) { idx = i; break; }
      }
      if (idx >= 0) {
        const [c] = me.trash.splice(idx, 1);
        me.hand.push(c);
        logEvent(state, { t: 'effectRevive', side, cardId: c.id, src: cardOrUnit.id });
      }
      break;
    }
    case 'discard': {
      // 复合代价段：弃手牌最右 n 张（M1 无选择交互；可付性由 runEffect 预检保证）
      const n = op.n || 1;
      for (let i = 0; i < n; i++) {
        const [c] = me.hand.splice(me.hand.length - 1, 1);
        if (c) me.trash.push(c);
      }
      logEvent(state, { t: 'effectDiscard', side, n, src: cardOrUnit.id });
      break;
    }
    default:
      throw new Error('unknown effect op: ' + op.k);
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
