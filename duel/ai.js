// 海贼王：伟大航路决斗 — AI 决斗者（Phase 2：激进铺场原型）
// 铁律：只用 legalMoves() 给出的合法动作（与玩家同一校验），信息边界=公开信息
// （自己手牌/双方场面/双方 LP/牌组张数/墓场），绝不读玩家手牌（规则 §九）。
'use strict';
import { DUEL } from './engine.js';
const { legalMoves, applyAction } = DUEL;

// 完整回合执行器：直接在 state 上跑完整 AI 回合（测试/无 UI 用）；
// UI 版用 aiStep 逐步取动作播放。
function aiRunTurn(g, cardsById) {
  const pi = g.active;
  let guard = 0;
  while (g.winner === null && g.active === pi && guard++ < 200) {
    const step = aiStep(g, cardsById);
    if (!step) break;
    const r = applyAction(g, cardsById, pi, step);
    if (!r.ok) break; // 理论不可达：aiStep 只产出 legalMoves 内动作
  }
  return guard < 200;
}

// 单步决策：返回一个动作或 null（回合已结束）
function aiStep(g, cardsById) {
  const pi = g.active;
  const p = g.players[pi], e = g.players[1 - pi];
  const D = u => cardsById[u.cardId];
  const A = u => D(u).atk + (u.buffAtk || 0);
  const DF = u => D(u).def + (u.buffDef || 0) + ((D(u).keywords || []).includes('guard') ? 500 : 0);
  const moves = legalMoves(g, cardsById, pi);

  // 主要阶段：登场最优人物（一次）
  if ((g.phase === 'main1' || g.phase === 'main2')) {
    const summons = moves.filter(m => m.t === 'summon');
    if (summons.length && p.summoned === 0) {
      let best = null, bestScore = -1e9;
      for (const m of summons) {
        const d = cardsById[p.hand.find(h => h.uid === m.handUid).cardId];
        const loss = (m.tributes || []).reduce((s, uid) => s + A(p.board.find(u => u.uid === uid)), 0);
        const boardAfter = p.board.reduce((s, u) => s + A(u), 0) - loss + d.atk;
        // 激进型：总攻击最大化 + 略偏大怪；若解放后总攻反而降则不选
        const score = boardAfter + d.level * 30;
        if (score > bestScore) { bestScore = score; best = m; }
      }
      if (best) {
        const curAtk = p.board.reduce((s, u) => s + A(u), 0);
        const d = cardsById[p.hand.find(h => h.uid === best.handUid).cardId];
        const loss = (best.tributes || []).reduce((s, uid) => s + A(p.board.find(u => u.uid === uid)), 0);
        if (curAtk - loss + d.atk >= curAtk) return best; // 解放不亏总攻才上
      }
    }
    // 表示切换：激进型不切
    return { t: 'nextPhase' };
  }

  if (g.phase === 'battle') {
    const atks = moves.filter(m => m.t === 'attack');
    for (const m of atks) {
      const u = p.board.find(x => x.uid === m.uid);
      if (!u) continue;
      const a = A(u);
      if (m.target === null) return m; // 直攻永远打
      const t = e.board.find(x => x.uid === m.target);
      const td = D(t);
      if (t.pos === 'atk') {
        const b = A(t);
        if (a > b) return m;                       // 有利：破坏+差额
        if (a === b && e.board.length === 1) return m; // 换掉对方唯一怪
        // a < b：激进型也不白给
      } else {
        const b = DF(t);
        if (a > b) return m;                       // 破守备
        // 打不动墙就绕开试下一个攻击者/目标
      }
    }
    return { t: 'nextPhase' }; // 无有利攻击 → 主2
  }

  if (g.phase === 'main2') {
    // 已在主1 登场过；激进型主2 无事可做
    return { t: 'nextPhase' };
  }

  if (g.phase === 'end') return { t: 'endTurn' };
  return moves[0] || { t: 'nextPhase' };
}

export const DUEL_AI = { aiStep, aiRunTurn };
