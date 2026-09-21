// 启发式 AI：三档难度（easy=大噪声 / normal=纯启发式 / hard=启发式+浅层前瞻）
// 输入 state + 合法动作列表，输出选中的动作。纯函数式，无引擎副作用。
import { powerOfUnit, leaderPower, usableDons, cloneGame } from '../engine/state.js';
import { hasKeyword } from '../engine/keywords.js';
import { applyAction } from '../engine/phases.js';
import { fruitEdge } from '../engine/combat.js';

export const LEVELS = ['easy', 'normal', 'hard'];

export function createAI(level = 'normal', rng = Math.random) {
  if (!LEVELS.includes(level)) throw new Error('unknown level: ' + level);
  const noise = level === 'easy' ? 25 : level === 'normal' ? 6 : 0;
  const blunder = level === 'easy' ? 0.22 : 0; // easy 概率性纯乱走
  return {
    level,
    choose(state, acts) {
      if (!acts || acts.length === 0) return null;
      const scored = acts.map((a) => ({ a, s: scoreAction(state, a) + rng() * noise }));
      if (blunder > 0 && rng() < blunder) {
        // 乱走排除 takeDon（give/take 互切死循环，AI 诊断实证）；反向选最差——
        // 988 池曲线对齐后随机乱走送分不足（hard 仅 57% 分层），新手档语义=可被碾压
        const pool = scored.filter((x) => x.a.t !== 'takeDon');
        const p = pool.length ? pool : scored;
        p.sort((x, y) => x.s - y.s);
        return p[0].a;
      }
      scored.sort((x, y) => y.s - x.s);
      if (level !== 'hard') return scored[0].a;
      // hard：对 top5 前瞻一步（执行动作+响应全 pass，取局面估值差），叠加启发分
      const me = state.pending ? state.pending.target.side : state.active;
      let best = null;
      let bestV = -Infinity;
      for (const { a, s: s0 } of scored.slice(0, 5)) {
        // hard 攻击折减：前瞻把对手响应强制 pass，但高反击手牌的真实局会翻盘互斗/垫防线
        // （normal 靠 6 分噪声偶有回避，hard noise=0 恒选最高分=恒踩激进坑，红v蓝实证）
        const foeNow = state.players[1 - me];
        const s = a.t === 'attack' ? s0 - foeNow.hand.filter((c) => c.counter).length * 3.0 : s0;
        const st = cloneGame(state);
        try {
          applyAction(st, JSON.parse(JSON.stringify(a)));
          // 响应窗口自动 pass 到结算完毕
          let guard = 4;
          while (st.pending && guard-- > 0) {
            applyAction(st, { t: 'passCounter', side: st.pending.target.side });
          }
          const v = s * 1.8 + evaluate(st, me) * 0.35; // 启发分主导：中间局面估值噪声大（红v蓝实证），evaluate 权重微升拉大与乱走的差距（988 池曲线对齐后 top3+0.3 只剩 57% 分层）
          if (v > bestV) { bestV = v; best = a; }
        } catch { /* 模拟异常则跳过该动作 */ }
      }
      return best || scored[0].a;
    },
  };
}

// 局面估值（越大越好，me 视角）
export function evaluate(state, me) {
  if (state.winner === me) return 9999;
  if (state.winner === 1 - me) return -9999;
  let v = 0;
  for (const side of [0, 1]) {
    const pl = state.players[side];
    const sign = side === me ? 1 : -1;
    v += sign * (pl.board.reduce((n, u) => n + powerOfUnit(u) / 1000, 0) * 2);
    v += sign * pl.hand.length * 1.6;
    // 反击牌前瞻盲区补偿：前瞻把对手响应强制 pass，但真实局高 counter 手牌会翻盘互斗/垫高防线
    v += sign * pl.hand.filter((c) => c.counter).length * 0.9;
    v += sign * (pl.lp / 2000) * 2.5; // LP 积分（游戏王式）
    v += sign * usableDons(pl) * 1.2;
    v += sign * leaderPower(pl) / 4000;
    if (pl.stage) v += sign * 2;
    // 阵型聚合度（design-system §4.3）：同阵型单位成簇=光环/触发在线，权重 0.3×单位效用
    const fc = { vanguard: 0, bulwark: 0, skirmish: 0 };
    for (const u of pl.board) if (u.formation && fc[u.formation] != null) fc[u.formation]++;
    if (pl.leader.formation && fc[pl.leader.formation] != null) fc[pl.leader.formation]++;
    for (const n of Object.values(fc)) if (n >= 2) v += sign * (n - 1) * 0.3 * 2;
  }
  return v;
}

function scoreAction(state, act) {
  const side = state.pending ? state.pending.target.side : state.active;
  const me = state.players[side];
  const foe = state.players[1 - side];

  if (state.pending) return scoreDefense(state, act, me, foe);

  switch (act.t) {
    case 'playCharacter': {
      const c = me.hand[act.idx];
      if (!c) return -99;
      let s = 40 + c.cost * 5 + c.power / 500;
      for (const kw of c.keywords || []) s += { rush: 8, blocker: 6, doubleAttack: 12, banish: 8 }[kw] || 0;
      if (c.effect) s += effValue(c.effect, state, side);
      // 阵型聚合倾向：与场上/船长同阵型成对（光环起点）加值
      if (c.formation) {
        const n = me.board.filter((u) => u.formation === c.formation).length
          + (me.leader.formation === c.formation ? 1 : 0);
        if (n >= 1) s += 6;
      }
      return s;
    }
    case 'playEvent': case 'playStage': {
      const c = me.hand[act.idx];
      if (!c) return -99;
      return 32 + c.cost * 5 + effValue(c.effect, state, side);
    }
    case 'playGear': {
      const c = me.hand[act.idx];
      const target = me.board[act.to && act.to.idx];
      if (!c || !target) return -99;
      if (target.gears && target.gears.length) return -50; // 已装备再装=旧件随葬浪费
      let s = 20 + c.cost * 2;
      if (c.gear && c.gear.atk) s += c.gear.atk / 400 + (c.gear.atk >= 3000 ? 6 : 0);
      if (c.gear && (c.gear.gives || []).includes('blocker')) s += 10; // 甲胄=坚壁防御位
      return s;
    }
    case 'fuse': {
      // F13 融合打分（线性近似）：融合体价值（战力+词条+效果）− 素材当前价值 − 融合费用机会成本
      const def = (state.fusions || []).find((c) => c && c.id === act.fusionId);
      if (!def || !def.fusion) return -99;
      let s = 40 + def.power / 500;
      for (const kw of def.keywords || []) s += { rush: 8, blocker: 6, doubleAttack: 12, banish: 8 }[kw] || 0;
      if (def.effect) s += effValue(def.effect, state, side);
      for (const id of new Set(def.fusion.from)) {
        const bu = me.board.find((u) => u.id === id);
        if (bu) s -= powerOfUnit(bu) / 500;                 // 场上素材离场=场面战力损失
        else {
          const hc = me.hand.find((c) => c.id === id);
          s -= 20 + (hc ? hc.cost * 5 + hc.power / 500 : 0); // 手牌素材进墓=资源损失（近似其打出价值）
        }
      }
      s -= def.fusion.cost * 5; // 融合贝里机会成本（与出牌费用同权）
      return s;
    }
    case 'giveDon': return 6;
    case 'takeDon': return -99; // AI 不倒腾 DON!!（与 give 互切会死循环）
    case 'attack': return scoreAttack(state, act, me, foe);
    case 'endTurn': return 0;
    default: return 0;
  }
}

function effValue(eff, state, side) {
  if (!eff) return 0;
  const foe = state.players[1 - side];
  const ops = Array.isArray(eff.op) ? eff.op : [eff.op]; // v2 复合 op（POOL-3）：逐段求和，不再整条走 default 低估
  let v = 0;
  for (const op of ops) {
    switch (op.k) {
      case 'draw': v += 9 * (op.n || 1); break;
      case 'gainDon': v += 7 * (op.n || 1); break;
      case 'koWeakest': v += foe.board.length ? 24 : 2; break;
      case 'restEnemy': v += foe.board.length ? 8 : 1; break;
      case 'powerSelf': v += 5; break;
      case 'powerLeader': v += 5; break;
      default: v += 4;
    }
  }
  return v;
}

function scoreAttack(state, act, me, foe) {
  const atkUnit = act.attacker.type === 'leader'
    ? me.leader : me.board[act.attacker.idx];
  if (!atkUnit) return -99;
  let atk = act.attacker.type === 'leader' ? leaderPower(me) : powerOfUnit(atkUnit);
  // whenAttacking 增益预估（复合 op 数组时对 powerSelf 段求和）
  if (atkUnit.effect && atkUnit.effect.hook === 'whenAttacking') {
    const ops = Array.isArray(atkUnit.effect.op) ? atkUnit.effect.op : [atkUnit.effect.op];
    for (const op of ops) if (op.k === 'powerSelf') atk += op.x || 0;
  }
  const estCounter = foe.hand.filter((c) => c.counter).length * 700; // 反击预期折减

  if (act.target === 'leader' || act.target.type === 'leader') {
    // 直攻：伤害=差额（船长战力为防线）；无角色才可直攻
    const def = leaderPower(foe) - fruitEdge(atkUnit, foe.leader); // 果实克制抵扣防线
    let dmg = Math.max(0, atk - def - estCounter);
    if (dmg > 0 && hasKeyword(atkUnit, 'doubleAttack')) dmg *= 2;
    if (hasKeyword(atkUnit, 'banish')) dmg += 2000;
    if (dmg >= foe.lp) return 1000; // 致胜一击
    if (dmg > 0) return 24 + dmg / 400;
    return -4; // 打不穿船长防线
  }
  // 打角色（游戏王式互斗/守备；坚壁 blocker 防御 +1000）
  const victim = foe.board[act.target.idx];
  if (!victim) return -99;
  const def = powerOfUnit(victim) + (hasKeyword(victim, 'blocker') ? 1000 : 0) - fruitEdge(atkUnit, victim)
    + (victim.rest ? 0 : estCounter); // 守备表示无 Counter 加值
  if (victim.rest) {
    // 守备：打得动=击沉无伤害，打不动=无战果
    if (atk > def) return 18 + victim.power / 400;
    return -6; // 踩墙白费一次攻击
  }
  // 攻击表示互斗：差额扣 LP，攻方低则被反杀
  if (atk > def) return 20 + (atk - def) / 400 + victim.power / 400;
  if (atk < def) return -10; // 反杀风险（攻方沉+扣差额）
  return -3; // 同归于尽
}

function scoreDefense(state, act, me, foe) {
  const p = state.pending;
  const atkUnit = p.attacker.type === 'leader' ? foe.leader : foe.board[p.attacker.idx];
  const defSelf = p.target.type === 'leader' ? me.leader : me.board[p.target.idx];
  if (p.attacker.type !== 'leader' && !atkUnit) return act.t === 'pass' ? 0 : -99; // 攻击者已离场：不再投入
  const atk = (p.attacker.type === 'leader' ? leaderPower(foe) : powerOfUnit(atkUnit))
    + fruitEdge(atkUnit, defSelf); // 攻方克制我方：威胁值上浮，反击阈值随之抬高

  if (act.t === 'counter') {
    const card = me.hand[act.cards[0]];
    // 目标可能在窗口期被 whenAttacking 效果移走（koWeakest/restEnemy）——离场则防线记 0，resolveAttack 的 !def 分支收场
    const defUnit = p.target.type === 'leader' ? null : me.board[p.target.idx];
    const curDef = (p.target.type === 'leader' ? leaderPower(me) : defUnit ? powerOfUnit(defUnit) : 0)
      + (defUnit && hasKeyword(defUnit, 'blocker') ? 1000 : 0)
      + p.counterBoost;
    if (curDef + card.counter >= atk) {
      // 能翻盘才反：致死攻击必反，一般攻击看价值
      if (p.target.type === 'leader' && me.lp <= atk - curDef) return 800;
      return 22;
    }
    return -8; // 补不够就不补
  }
  // pass：被打角色高价值时不该 pass（分低），给 pass 一个参考值
  if (p.target.type === 'leader' && me.lp <= 3000) return -500;
  if (p.target.type === 'char') {
    const victim = me.board[p.target.idx];
    if (victim) return -victim.power / 800; // 高价值单位受损倾向响应
  }
  return 0;
}
