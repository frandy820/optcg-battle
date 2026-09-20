// 合法动作枚举器：AI 决策与随机模糊测试共用
import { usableDons } from '../engine/state.js';
import { hasKeyword } from '../engine/keywords.js';
import { fuseLockReason } from '../engine/phases.js';

// 返回当前行动权方的全部合法动作（每张 counter 卡按单张出牌枚举）
export function listActions(state) {
  if (state.winner !== null) return [];
  if (state.pending) return defenseActions(state);

  const side = state.active;
  const me = state.players[side];
  const foe = state.players[1 - side];
  const acts = [];
  const dons = usableDons(me);

  // 出牌
  me.hand.forEach((c, i) => {
    if (c.cost > dons) return;
    if (c.type === 'char' && me.board.length >= 5) return;
    if (c.type === 'gear') {
      // 装备：枚举己方每个角色作为目标（每角色限 1 件，替换式）
      me.board.forEach((_, j) => acts.push({ t: 'playGear', side, idx: i, to: { type: 'char', idx: j } }));
      return;
    }
    acts.push({ t: c.type === 'char' ? 'playCharacter' : c.type === 'event' ? 'playEvent' : 'playStage', side, idx: i });
  });

  // 融合（F13）：配方素材齐（场上+手牌）且贝里够、场上未满、本回合未融合 → 逐配方枚举
  // state.fusions 为空（旧调用方未注入）时不产生任何 fuse 动作，行为与 F13 前完全一致
  for (const def of state.fusions || []) {
    if (!def || !def.fusion) continue;
    if (fuseLockReason(state, side, def) === null) acts.push({ t: 'fuse', side, fusionId: def.id });
  }

  // 附着 / 收回 DON!!（按 1 张粒度枚举）
  if (dons >= 1) {
    acts.push({ t: 'giveDon', side, to: { type: 'leader' }, count: 1 });
    me.board.forEach((_, i) => acts.push({ t: 'giveDon', side, to: { type: 'char', idx: i }, count: 1 }));
  }
  if (me.leader.dons > 0) acts.push({ t: 'takeDon', side, from: { type: 'leader' }, count: 1 });
  me.board.forEach((u, i) => {
    if (u.dons > 0) acts.push({ t: 'takeDon', side, from: { type: 'char', idx: i }, count: 1 });
  });

  // 攻击：己方未横置且可行动的单位 × 合法目标
  // 游戏王式：对方场上有角色（竖/横均可）→ 必须指定其一；场上无角色 → 只能直攻船长
  const attackers = [];
  // 船长不横置：每回合限攻一次（attackedTurn 记账，效果横置仍拦）
  if (!me.leader.rest && me.leader.attackedTurn !== state.turn) attackers.push({ side, type: 'leader' });
  me.board.forEach((u, i) => {
    if (u.rest) return;
    if (u.playedTurn === state.turn && !hasKeyword(u, 'rush')) return;
    attackers.push({ side, type: 'char', idx: i });
  });
  const targets = foe.board.length > 0
    ? foe.board.map((_, i) => ({ type: 'char', idx: i }))
    : ['leader'];
  for (const a of attackers) {
    for (const tg of targets) acts.push({ t: 'attack', side, attacker: a, target: tg });
  }

  acts.push({ t: 'endTurn', side });
  return acts;
}

function defenseActions(state) {
  const p = state.pending;
  const side = p.target.side;
  const me = state.players[side];
  const acts = [];
  me.hand.forEach((c, i) => {
    if (c.counter) acts.push({ t: 'counter', side, cards: [i] });
  });
  acts.push({ t: 'passCounter', side });
  return acts;
}
