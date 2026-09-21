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

  // 船长技能：回合开始钩子（DON 阶段后、Main 前——香克斯的加速豆在此生效）
  runEffect(state, pl.leader, 'onTurnStart', { side: state.active, self: null });
  if (state.winner !== null) return; // 效果可能触发 deckout 等终局

  state.phase = 'main';
}

// 结束回合：清 turn 增益 → 换边 → 新回合自动序列
export function endTurn(state) {
  if (state.pending) throw new Error('cannot end turn while pending window open');
  for (const pl of state.players) {
    pl.leader.buffs = pl.leader.buffs.filter((b) => b.until !== 'turn');
    for (const u of pl.board) u.buffs = u.buffs.filter((b) => b.until !== 'turn');
  }
  state.fuseUsed = [false, false]; // F13 每回合限 1 次融合：换边重置（旧快照缺字段=旧局无融合，重置无害）
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
  const unit = { ...card, rest: false, playedTurn: state.turn, dons: 0, buffs: [], gears: [] };
  me.board.push(unit);
  logEvent(state, { t: 'summon', side, cardId: card.id, cost: card.cost });
  runEffect(state, unit, 'onPlay', { side, self: unit });
  // 船长技能：己方角色登场钩子（娜美抽牌/索隆强化——对新登场单位生效）
  runEffect(state, me.leader, 'onSummon', { side, self: unit });
  // 游击阵型（design-system §4.1）：每当第 3 名游击单位登场（场上游击数恰为 3 的倍数）抽 1
  if (card.formation === 'skirmish') {
    let n = (me.leader.formation === 'skirmish' ? 1 : 0);
    for (const u of me.board) if (u.formation === 'skirmish') n++;
    if (n > 0 && n % 3 === 0) {
      if (me.deck.length === 0) { declareDeckOut(state, side); return; }
      me.hand.push(me.deck.pop());
      logEvent(state, { t: 'skirmishDraw', side, n, src: card.id });
    }
  }
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

// ===== 融合（F13）=====
// 融合体登场规则：配方素材（己方场上+手牌各取一份，同名多份取一）全部进墓场 → 融合体直接进 board。
// 融合卡不进卡组（deckOf 跳过 / validateDeck 拒收），只能经 t:'fuse' { side, fusionId } 动作登场。

// 可融合性纯查询（AI 枚举与 UI 按钮共用同一真值源）：返回 null=可融合，否则返回不可融合原因
export function fuseLockReason(state, side, def) {
  const me = state.players[side];
  if (!def || !def.fusion) return '未知融合配方';
  if (me.board.length >= 5) return '场上已满 5 名角色，无法融合';
  if (usableDons(me) < def.fusion.cost) return `融合费用不足：需 ${def.fusion.cost} 枚可用贝里（附着贝里=已消耗）`;
  const used = Array.isArray(state.fuseUsed) ? state.fuseUsed : [false, false]; // 旧快照缺字段兜底
  if (used[side]) return '每回合限融合 1 次';
  for (const id of new Set(def.fusion.from)) { // 同名多份取一（配方内重复 id 只需一份）
    if (!me.board.some((u) => u.id === id) && !me.hand.some((c) => c.id === id)) {
      return `素材不足：缺 ${id}（场上或手牌均可）`;
    }
  }
  return null;
}

// 场上素材摘除：与 combat.koUnit 同规则（装备随葬、其后单位索引前移同步修正附着 DON 记账）；
// 差异：素材自身附着的 DON 直接回收（attached=null 回费用区，可用态）；不触发 onKO/onAllyKO/onKill（融合≠击沉）
function scrapBoardUnit(pl, idx) {
  const [unit] = pl.board.splice(idx, 1);
  if (!unit) return null;
  if (Array.isArray(unit.gears) && unit.gears.length) {
    pl.trash.push(...unit.gears);
    unit.gears = [];
  }
  pl.trash.push(unit);
  for (const d of pl.donArea) {
    if (!d.attached || d.attached.type !== 'char') continue;
    if (d.attached.idx === idx) d.attached = null;    // 素材附着贝里回收（勿留悬空指针）
    else if (d.attached.idx > idx) d.attached.idx--;  // 其后单位索引前移
  }
  return unit;
}

// 融合动作主体：素材判定 → 支付 fusion.cost → 素材进墓场 → 融合体登场（playedTurn=当前回合，rush=当回合可攻）
export function fuse(state, side, fusionId) {
  const me = state.players[side];
  const def = (state.fusions || []).find((c) => c && c.id === fusionId); // 旧快照缺 fusions=无融合可用
  const why = fuseLockReason(state, side, def);
  if (why) throw new Error(why);
  const fromIds = [...new Set(def.fusion.from)];
  // 定位素材（先场后手）；倒序摘除防索引位移删错卡
  const boardPicks = [], handPicks = [];
  for (const id of fromIds) {
    const bi = me.board.findIndex((u) => u.id === id);
    if (bi >= 0) boardPicks.push(bi);
    else handPicks.push(me.hand.findIndex((c) => c.id === id));
  }
  payDons(me, def.fusion.cost);
  for (const bi of boardPicks.sort((a, b) => b - a)) scrapBoardUnit(me, bi);
  for (const hi of handPicks.sort((a, b) => b - a)) {
    const [c] = me.hand.splice(hi, 1);
    if (c) me.trash.push(c);
  }
  const unit = { ...def, rest: false, playedTurn: state.turn, dons: 0, buffs: [], gears: [] };
  me.board.push(unit);
  state.fuseUsed = Array.isArray(state.fuseUsed) ? state.fuseUsed : [false, false];
  state.fuseUsed[side] = true;
  logEvent(state, { t: 'fuse', side, fusionId: def.id, fromIds });
  runEffect(state, unit, 'onPlay', { side, self: unit });        // 融合体登场效果（buffAll/restEnemy/draw 等）
  runEffect(state, me.leader, 'onSummon', { side, self: unit }); // 船长「角色登场」钩子（与 playCharacter 同语义）
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
    case 'fuse': fuse(state, side, action.fusionId); break;
    case 'attack': startAttack(state, action); break;
    case 'endTurn': endTurn(state); break;
    default: throw new Error('unknown action: ' + action.t);
  }
}
