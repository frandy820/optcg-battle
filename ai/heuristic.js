// 启发式 AI：三档难度（easy=大噪声 / normal=纯启发式 / hard=启发式+浅层前瞻）
// 输入 state + 合法动作列表，输出选中的动作。纯函数式，无引擎副作用。
import { powerOfUnit, leaderPower, usableDons, cloneGame } from '../engine/state.js';
import { hasKeyword } from '../engine/keywords.js';
import { applyAction } from '../engine/phases.js';

export const LEVELS = ['easy', 'normal', 'hard'];

export function createAI(level = 'normal', rng = Math.random) {
  if (!LEVELS.includes(level)) throw new Error('unknown level: ' + level);
  const noise = level === 'easy' ? 25 : level === 'normal' ? 6 : 0;
  const blunder = level === 'easy' ? 0.22 : 0; // easy 概率性纯乱走
  return {
    level,
    choose(state, acts) {
      if (!acts || acts.length === 0) return null;
      if (blunder > 0 && rng() < blunder) {
        // 乱走池排除 takeDon：give/take 互切会造成无限循环（AI 诊断实证）
        const pool = acts.filter((a) => a.t !== 'takeDon');
        const p = pool.length ? pool : acts;
        return p[Math.floor(rng() * p.length)];
      }
      const scored = acts.map((a) => ({ a, s: scoreAction(state, a) + rng() * noise }));
      scored.sort((x, y) => y.s - x.s);
      if (level !== 'hard') return scored[0].a;
      // hard：对 top5 前瞻一步（执行动作+响应全 pass，取局面估值差），叠加启发分
      const me = state.pending ? state.pending.target.side : state.active;
      let best = null;
      let bestV = -Infinity;
      for (const { a, s } of scored.slice(0, 5)) {
        const st = cloneGame(state);
        try {
          applyAction(st, JSON.parse(JSON.stringify(a)));
          // 响应窗口自动 pass 到结算完毕
          let guard = 4;
          while (st.pending && guard-- > 0) {
            applyAction(st, { t: 'passCounter', side: st.pending.target.side });
          }
          const v = s * 1.5 + evaluate(st, me) * 2.0;
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
    v += sign * (pl.lp / 2000) * 2.5; // LP 积分（游戏王式）
    v += sign * usableDons(pl) * 1.2;
    v += sign * leaderPower(pl) / 4000;
    if (pl.stage) v += sign * 2;
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
      return s;
    }
    case 'playEvent': case 'playStage': {
      const c = me.hand[act.idx];
      if (!c) return -99;
      return 32 + c.cost * 5 + effValue(c.effect, state, side);
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
  switch (eff.op.k) {
    case 'draw': return 9 * (eff.op.n || 1);
    case 'gainDon': return 7 * (eff.op.n || 1);
    case 'koWeakest': return foe.board.length ? 24 : 2;
    case 'restEnemy': return foe.board.length ? 8 : 1;
    case 'powerSelf': return 5;
    case 'powerLeader': return 5;
    default: return 4;
  }
}

function scoreAttack(state, act, me, foe) {
  const atkUnit = act.attacker.type === 'leader'
    ? me.leader : me.board[act.attacker.idx];
  if (!atkUnit) return -99;
  let atk = act.attacker.type === 'leader' ? leaderPower(me) : powerOfUnit(atkUnit);
  // whenAttacking 增益预估
  if (atkUnit.effect && atkUnit.effect.hook === 'whenAttacking'
    && atkUnit.effect.op.k === 'powerSelf') atk += atkUnit.effect.op.x;
  const estCounter = foe.hand.filter((c) => c.counter).length * 700; // 反击预期折减

  if (act.target === 'leader' || act.target.type === 'leader') {
    // 直攻：伤害=差额（船长战力为防线）；无角色才可直攻
    const def = leaderPower(foe);
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
  const def = powerOfUnit(victim) + (hasKeyword(victim, 'blocker') ? 1000 : 0)
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
  const atk = p.attacker.type === 'leader' ? leaderPower(foe) : powerOfUnit(atkUnit);

  if (act.t === 'counter') {
    const card = me.hand[act.cards[0]];
    const curDef = (p.target.type === 'leader' ? leaderPower(me) : powerOfUnit(me.board[p.target.idx]))
      + (p.target.type !== 'leader' && hasKeyword(me.board[p.target.idx], 'blocker') ? 1000 : 0)
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
