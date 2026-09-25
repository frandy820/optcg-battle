// 海贼王：伟大航路决斗 — AI 决斗者（Phase 3：招式运用 + 伏笔响应）
// 铁律：只用 legalMoves() 给出的合法动作（与玩家同一校验），信息边界=公开信息
// （自己手牌/双方场面/双方 LP/牌组张数/墓场），绝不读玩家手牌（规则 §九）。
'use strict';
import { DUEL } from './engine.js';
const { legalMoves, applyAction, unitAtk, unitDef, def } = DUEL;

// 完整回合执行器（测试/无 UI 用）：跑完当前活跃方这一个回合；
// 中途开响应窗口时，轮到谁就替谁决策（双 AI 对战测试用）。
function aiRunTurn(g, cardsById) {
  const startPi = g.active;
  let guard = 0;
  while (g.winner === null && guard++ < 300) {
    if (!g.pending && g.active !== startPi) break; // 回合已交出
    const pi = g.pending ? g.pending.turnPtr : g.active;
    const step = aiStep(g, cardsById, pi);
    if (!step) break;
    const r = applyAction(g, cardsById, pi, step);
    if (!r.ok) break; // 理论不可达：aiStep 只产出 legalMoves 内动作
  }
  return guard < 300;
}

// 单步决策：pi 默认=窗口轮到方或活跃方；UI 恒传 1（AI 永远是 1 号位）
function aiStep(g, cardsById, pi = (g.pending ? g.pending.turnPtr : g.active)) {
  const p = g.players[pi], e = g.players[1 - pi];
  const A = u => unitAtk(cardsById, u);
  const DF = u => unitDef(cardsById, u) + ((def(cardsById, u).keywords || []).includes('guard') ? 500 : 0);

  // ---- 响应窗口：轮到 AI 时做伏笔决策 ----
  if (g.pending) {
    if (g.pending.turnPtr !== pi) return null;
    return decideRespond(g, cardsById, pi);
  }
  if (g.active !== pi || g.winner !== null) return null;
  const moves = legalMoves(g, cardsById, pi);
  const PROF = g.aiProfile || 'aggro'; // 战术原型（§九.4）：aggro 激进铺场 / control 控制反击 / boss 篇章Boss

  if (g.phase === 'main1' || g.phase === 'main2') {
    // 1) 登场最优人物（总攻击最大化 + 略偏大怪；解放不亏总攻才上）
    const summons = moves.filter(m => m.t === 'summon');
    if (summons.length && p.summoned === 0) {
      let best = null, bestScore = -1e9;
      for (const m of summons) {
        const d = cardsById[p.hand.find(h => h.uid === m.handUid).cardId];
        const loss = (m.tributes || []).reduce((s, uid) => s + A(p.board.find(u => u.uid === uid)), 0);
        const boardAfter = p.board.reduce((s, u) => s + A(u), 0) - loss + d.atk;
        const score = boardAfter + d.level * (PROF === 'boss' ? 90 : 30); // boss 型更贪大怪
        if (score > bestScore) { bestScore = score; best = m; }
      }
      if (best) {
        const curAtk = p.board.reduce((s, u) => s + A(u), 0);
        const d = cardsById[p.hand.find(h => h.uid === best.handUid).cardId];
        const loss = (best.tributes || []).reduce((s, uid) => s + A(p.board.find(u => u.uid === uid)), 0);
        // R2-02：解放「本回合尚可攻击」的怪换登场 = 失去本回合攻击权（新怪登场回合不可攻）。
        // 手牌同名大怪会导致无限解放循环（克利克换克利克，每回合白亏一次攻击）——
        // 解放系登场须净攻提升 >300 才做；无解放登场维持 >=（白赚场攻）。
        const lostAttacks = (best.tributes || []).some(uid => {
          const tu = p.board.find(u => u.uid === uid);
          return tu && !tu.attacked && tu.summonedTurn < g.turn && tu.pos === 'atk';
        });
        const gain = curAtk - loss + d.atk - (lostAttacks ? 300 : 0);
        if (gain > curAtk || (gain >= curAtk && !(best.tributes || []).length)) {
          // control 型：对方场攻压迫时改守备登场（攒伏笔等反击），否则照常攻击表示
          if (PROF === 'control') {
            const foeAtk = e.board.reduce((s, u) => s + A(u), 0);
            if (foeAtk > curAtk - loss + d.atk + 500) return { ...best, pos: 'def' };
          }
          return best;
        }
      }
    }
    // 1.5) 被转守的攻击手切回攻击表示（否则被催眠曲/包围网/赞高永久锁攻空转——R1 逻辑缺口）；
    //      control 型守备是主动战术故不切
    if (PROF !== 'control') {
      const flip = moves.find(m => m.t === 'setPos' && m.pos === 'atk');
      if (flip) return flip;
    }
    // 2) 盖伏伏笔（招式倾向直接发动，符合激进原型）
    const trapSet = moves.find(m => {
      if (m.t !== 'setSpell') return false;
      const h = p.hand.find(x => x.uid === m.handUid);
      return h && cardsById[h.cardId].type === 'trap';
    });
    if (trapSet) return trapSet;
    // 3) 招式发动（按收益择优）
    const mvs = moves.filter(m => m.t === 'activateMove');
    if (mvs.length) {
      const pick = pickMove(g, cardsById, pi, mvs);
      if (pick) return pick;
    }
    return { t: 'nextPhase' };
  }

  if (g.phase === 'battle') {
    const atks = moves.filter(m => m.t === 'attack');
    const margin = PROF === 'control' ? 200 : 0; // 控制型只在明显有利时换血
    const desperate = p.deck.length <= 3; // 终局意识：自己几回合内将抽空——降低门槛换血抢时间（防对墙空转到 deckout）
    for (const m of atks) {
      const u = p.board.find(x => x.uid === m.uid);
      if (!u) continue;
      const a = A(u);
      if (m.target === null) return m; // 直攻永远打
      const t = e.board.find(x => x.uid === m.target);
      if (t.pos === 'atk') {
        const b = A(t);
        if (a > b + margin) return m;                          // 有利：破坏+差额
        if (desperate && a > b - 300) return m;                // 快抽空：小亏也换（可能换掉对方攻手）
        if (a === b && e.board.length === 1 && PROF !== 'control') return m; // 换掉对方唯一怪
      } else {
        if (a > DF(t)) return m;                      // 破守备
        if (desperate && a > DF(t) - 300) return m;   // 快抽空：贴着破防也撞
      }
    }
    return { t: 'nextPhase' }; // 无有利攻击 → 主2
  }

  if (g.phase === 'end') return { t: 'endTurn' };
  return moves[0] || { t: 'nextPhase' };
}

// 主要阶段招式取舍（激进型：致死斩杀 > 点杀 > 拆攻势 > 增攻 > 装备 > 烧血）
function pickMove(g, cardsById, pi, mvs) {
  const p = g.players[pi], e = g.players[1 - pi];
  const cardOf = m => {
    if (m.t === 'activateMove') return cardsById[p.hand.find(h => h.uid === m.handUid).cardId];
    return null;
  };
  // 1) 烧血致死（雷光收头）
  const burn = mvs.filter(m => { const d = cardOf(m); return d && d.effect.ops.some(o => o.op === 'damage'); });
  if (burn.length && e.lp <= 700) return burn[0];
  // 2) 点杀（铅星：ATK≤1200 全杀，优先最大目标）
  const dest = mvs.filter(m => { const d = cardOf(m); return d && d.effect.ops.some(o => o.op === 'destroy'); });
  if (dest.length) {
    dest.sort((x, y) => unitAtk(cardsById, e.board.find(u => u.uid === y.target)) -
                     unitAtk(cardsById, e.board.find(u => u.uid === x.target)));
    return dest[0];
  }
  // 3) 拆攻势（包围网：对方攻表示最强者比我方最强者强时压下去）
  const net = mvs.filter(m => { const d = cardOf(m); return d && d.effect.ops.some(o => o.op === 'setPosDef'); });
  if (net.length) {
    const myBest = p.board.reduce((s, u) => Math.max(s, unitAtk(cardsById, u)), 0);
    const bigFoe = e.board.filter(u => u.pos === 'atk')
      .sort((x, y) => unitAtk(cardsById, y) - unitAtk(cardsById, x))[0];
    if (bigFoe && unitAtk(cardsById, bigFoe) > myBest) {
      const m = net.find(mm => mm.target === bigFoe.uid);
      if (m) return m;
    }
  }
  // 4) 增攻（鬼斩：主1 给最强攻击者 +800；目标已有本回合攻增益则不重复叠——R1-04）
  const buff = mvs.filter(m => { const d = cardOf(m); return d && d.effect.ops.some(o => o.op === 'atkDelta' && o.amount > 0); });
  if (buff.length && g.phase === 'main1' && p.board.length) {
    const clean = buff.filter(m => {
      const u = p.board.find(x => x.uid === m.target);
      return u && !(u.buffs || []).some(b => b.stat === 'atk' && b.amount > 0);
    });
    if (clean.length) {
      clean.sort((x, y) => unitAtk(cardsById, p.board.find(u => u.uid === y.target)) -
                       unitAtk(cardsById, p.board.find(u => u.uid === x.target)));
      return clean[0];
    }
  }
  // 5) 装备（给 ATK≥1600 的人物）
  const eq = mvs.filter(m => { const d = cardOf(m); return d && d.moveKind === 'equip'; });
  if (eq.length) {
    eq.sort((x, y) => unitAtk(cardsById, p.board.find(u => u.uid === y.target)) -
                   unitAtk(cardsById, p.board.find(u => u.uid === x.target)));
    const u0 = p.board.find(u => u.uid === eq[0].target);
    if (u0 && unitAtk(cardsById, u0) >= 1600) return eq[0];
  }
  // 6) 普通烧血（雷光：对方 LP 偏低、自己无场面、或自己快抽空须抢斩杀时用——终局意识）
  if (burn.length && (e.lp <= 1800 || p.board.length === 0 || p.deck.length <= 5)) return burn[0];
  return null;
}

// ---- 响应窗口决策（防守/反制收益评估） ----
function decideRespond(g, cardsById, pi) {
  const pd = g.pending;
  const p = g.players[pi];
  const elig = p.spells.filter(s => DUEL.canRespond(g, cardsById, pi, s).ok);
  if (!elig.length) return { t: 'pass' };

  if (pd.kind === 'move') { // W2：大伤害/点杀招式才值得无效
    const ops = pd.ev.ops || [];
    const dmg = ops.find(o => o.op === 'damage');
    const dest = ops.find(o => o.op === 'destroy');
    if ((dmg && dmg.amount >= 500) || dest) {
      const neg = elig.find(s => (cardsById[s.cardId].effect.ops || []).some(o => o.op === 'negateMove'));
      if (neg) return { t: 'respond', spellUid: neg.uid };
    }
    return { t: 'pass' };
  }

  // W1 攻击宣言：模拟「不响应的损失」，逐伏笔比较改善量
  const atkPi = 1 - pi;
  const attacker = g.players[atkPi].board.find(u => u.uid === pd.ev.attackerUid);
  if (!attacker) return { t: 'pass' };
  const target = pd.ev.targetUid ? p.board.find(u => u.uid === pd.ev.targetUid) : null;
  const base = simulateAttack(g, cardsById, attacker, target, p);
  const baseLoss = base.lp + Math.max(0, base.unit);
  let best = null, bestGain = 0;
  for (const s of elig) {
    const d = cardsById[s.cardId];
    let gain = 0;
    const ops = d.effect.ops || [];
    if (ops.some(o => o.op === 'negateAttack')) {
      gain = baseLoss + (ops.some(o => o.op === 'damage') ? 250 : 0); // 全免 + 反伤折算
    } else {
      const dA = ops.find(o => o.op === 'atkDelta');
      const dD = ops.find(o => o.op === 'defDelta');
      if (dA) {
        const alt = simulateAttack(g, cardsById, attacker, target, p, dA.amount, 0);
        gain = baseLoss - (alt.lp + Math.max(0, alt.unit));
      } else if (dD && target && target.pos === 'def') {
        const alt = simulateAttack(g, cardsById, attacker, target, p, 0, dD.amount);
        gain = baseLoss - (alt.lp + Math.max(0, alt.unit)) + 100; // 反噬潜力略加成
      }
    }
    if (gain > bestGain) { bestGain = gain; best = s; }
  }
  // 阈值：避免为小亏浪费伏笔；致死攻击必然触发（baseLoss ≥ lp）；控制型反制更积极
  const threshold = (g.aiProfile === 'control') ? 250 : 400;
  return (best && (bestGain >= threshold || baseLoss >= p.lp)) ? { t: 'respond', spellUid: best.uid } : { t: 'pass' };
}

// 战斗推演（不改动真实状态）：返回防守方 {lp 损失, 人物价值损失（负=反赚）}
function simulateAttack(g, cardsById, u, t, defP, aAdd = 0, dAdd = 0) {
  const A = Math.max(0, unitAtk(cardsById, u) + aAdd);
  if (!t) return { lp: Math.min(A, defP.lp), unit: 0 };
  const td = def(cardsById, t);
  if (t.pos === 'atk') {
    const B = unitAtk(cardsById, t);
    if (A > B) return { lp: Math.min(A - B, defP.lp), unit: B };
    if (A === B) return { lp: 0, unit: B };
    return { lp: 0, unit: -A }; // 攻方送死
  }
  const B = unitDef(cardsById, t) + ((td.keywords || []).includes('guard') ? 500 : 0) + dAdd;
  if (A > B) return { lp: 0, unit: B };
  if (A < B) return { lp: 0, unit: -Math.min(A, B - A) };
  return { lp: 0, unit: 0 };
}

export const DUEL_AI = { aiStep, aiRunTurn, decideRespond };
