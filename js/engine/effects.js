// 效果结算器 + 卡面描述生成器（文案与逻辑同源）——docs/02-game-design.md §6/§9
// execOps(b, ops, ctx)：按序结算声明式算子；ctx={ self, cardType, isCaptainSkill, mate }
import { MATES, resolveCard } from '../data/cards.js';
import { dealToEnemy, dealToPlayer, draw, gainResolve, statusStacks } from './battle.js';

export function execOps(b, ops, ctx = {}) {
  for (const op of ops || []) execOp(b, op, ctx);
}

function execOp(b, op, ctx) {
  const p = b.player;
  switch (op.k) {
    case 'dmg': dealToEnemy(b, op.x, { fromCardType: ctx.cardType }); break;
    case 'multi':
      for (let i = 0; i < op.times && !b.over; i++) dealToEnemy(b, op.x, { fromCardType: ctx.cardType });
      break;
    case 'dmgMinions': {
      // 对敌方全部召唤物（主伤害另算）
      for (const m of b.enemy.minions) {
        if (m.hp > 0) { m.hp -= op.x; if (m.hp <= 0) m.hp = 0; }
      }
      break;
    }
    case 'comboHit': dealToEnemy(b, p.combo * op.x, { fromCardType: ctx.cardType }); break; // 连击加伤（打出前计数）
    case 'dmgPerCombo': dealToEnemy(b, p.combo * op.x, { fromCardType: ctx.cardType }); break; // ×连击数
    case 'dmgPerResolve': dealToEnemy(b, p.resolve * op.x, { fromCardType: ctx.cardType }); break;
    case 'dmgEqualBlock': {
      const x = Math.round(p.block * (op.mult || 1));
      p.block = 0;
      dealToEnemy(b, x, { fromCardType: ctx.cardType });
      break;
    }
    case 'block': p.block += op.x; b.log.push({ t: 'block', side: 'p', x: op.x, v: p.block, seq: b.log.length }); break;
    case 'draw': draw(b, op.n); break;
    case 'discardRandom': {
      for (let i = 0; i < op.n && p.hand.length > 0; i++) {
        const idx = Math.floor(b.rng() * p.hand.length);
        const [c] = p.hand.splice(idx, 1);
        p.discard.push({ id: c.id, upgraded: !!c.upgraded });
      }
      break;
    }
    case 'fetchTop': {
      // 取弃牌堆顶（最后弃置的）1 张入手，费用视为 0（临时减费承载）
      if (p.discard.length > 0) {
        const entry = p.discard.pop();
        const card = resolveCard(entry);
        if (card) {
          card.cost0 = true; // cardCost 经 battle.js 检查（cost0 标记优先）
          p.hand.push(card);
          b.log.push({ t: 'fetch', name: card.name, seq: b.log.length });
        }
      }
      break;
    }
    case 'energy': p.energy += op.n; break;
    case 'resolve': gainResolve(b, op.n); break;
    case 'drainResolve': p.resolve = 0; break;
    case 'weak': { // 施加虚弱给敌人
      const cur = p2status(b.enemy, 'weak');
      if (cur) { cur.stacks += op.n; cur.turns = 3; } else b.enemy.statuses.push({ k: 'weak', stacks: op.n, turns: 3 });
      b.log.push({ t: 'status', side: 'e', k: 'weak', stacks: op.n, seq: b.log.length });
      break;
    }
    case 'vulnerable': {
      const cur = p2status(b.enemy, 'vulnerable');
      if (cur) { cur.stacks += op.n; cur.turns = 3; } else b.enemy.statuses.push({ k: 'vulnerable', stacks: op.n, turns: 3 });
      b.log.push({ t: 'status', side: 'e', k: 'vulnerable', stacks: op.n, seq: b.log.length });
      break;
    }
    case 'thorns': p.thornsTurn = (p.thornsTurn || 0) + op.n; break;
    case 'selfDmg': dealToPlayer(b, op.x, { source: 'self' }); break;
    case 'heal': {
      const before = p.hp;
      p.hp = Math.min(p.hpMax, p.hp + op.x);
      if (p.hp > before) b.log.push({ t: 'heal', side: 'p', x: p.hp - before, hp: p.hp, seq: b.log.length });
      break;
    }
    case 'gold': b.goldGain = (b.goldGain || 0) + op.n; break; // run 层结算时取走
    case 'summon': {
      const def = MATES[op.mate];
      if (def && p.mates.length < 3) {
        const m = { def, hp: def.hp, hpMax: def.hp };
        p.mates.push(m);
        if (def.onSummon) execOps(b, [def.onSummon], { cardType: 'mate', mate: m });
        b.log.push({ t: 'summon', side: 'p', name: def.name, seq: b.log.length });
      }
      break;
    }
    case 'costDownNext': p.costDownNext = Math.max(p.costDownNext, op.n); break;
    case 'costDownHand': p.costDownHand = Math.max(p.costDownHand, op.n); break;
    case 'atkBuffTurn': p.atkBuffTurn += op.n; break;
    case 'comboAdd': p.comboAdd += op.n; break; // 斗志技「战意沸腾」
    case 'clearPlayerBlock': p.block = 0; break; // Boss 阶段切换：清玩家护盾
    case 'atkBuff': b.enemy.atkBuff += op.n; break; // Boss 阶段切换：自身攻击 +n
    case 'exhaustSelf': ctx.exhaustSelf = true; break;
    case 'if': {
      if (condOk(b, op.cond)) execOps(b, op.then, ctx);
      break;
    }
    default: break;
  }
}

function p2status(unit, k) { return (unit.statuses || []).find((s) => s.k === k) || null; }
function condOk(b, cond) {
  if (cond.enemyStatus && statusStacks(b.enemy, cond.enemyStatus) <= 0) return false;
  if (cond.enemyHpBelowPct != null && b.enemy.hp > Math.floor(b.enemy.hpMax * cond.enemyHpBelowPct / 100)) return false;
  if (cond.myHpBelowPct != null && b.player.hp > Math.floor(b.player.hpMax * cond.myHpBelowPct / 100)) return false;
  if (cond.resolveGte != null && b.player.resolve < cond.resolveGte) return false;
  return true;
}

// ===== 卡面描述（从 ops 生成，文案与逻辑同源）=====
const OP_TEXT = {
  dmg: (o) => `造成 ${o.x} 点伤害`,
  multi: (o) => `造成 ${o.x} 点伤害×${o.times} 段`,
  dmgMinions: (o) => `对其召唤物各造成 ${o.x} 点伤害`,
  comboHit: (o) => `连击：伤害 +${o.x}×连击数`,
  dmgPerCombo: (o) => `伤害 = ${o.x}×当前连击数`,
  dmgPerResolve: (o) => `耗尽斗志：每点 +${o.x} 伤害`,
  dmgEqualBlock: (o) => `伤害 = 当前护盾×${o.mult === 1.5 ? '1.5' : o.mult === 0.75 ? '75%' : o.mult}（并清空护盾）`,
  block: (o) => `获得 ${o.x} 点护盾`,
  draw: (o) => `抽 ${o.n} 张牌`,
  discardRandom: (o) => `随机弃 ${o.n} 张`,
  fetchTop: () => `取弃牌堆顶 1 张入手（费用 0）`,
  energy: (o) => `能量 +${o.n}`,
  resolve: (o) => `斗志 +${o.n}`,
  drainResolve: () => `耗尽全部斗志`,
  weak: (o) => `施加虚弱 ${o.n}（敌方伤害 -25%）`,
  vulnerable: (o) => `施加易伤 ${o.n}（敌方承伤 +50%）`,
  thorns: (o) => `获得反甲 ${o.n}（受击反弹，本回合）`,
  selfDmg: (o) => `自伤 ${o.x}`,
  heal: (o) => `回复 ${o.x} 点生命`,
  gold: (o) => `获得 ${o.n} 金币`,
  summon: (o) => `召唤伙伴`,
  costDownNext: (o) => `本回合下一张卡费用 -${o.n}`,
  costDownHand: (o) => `本回合手牌费用 -${o.n}`,
  atkBuffTurn: (o) => `本回合攻击卡伤害 +${o.n}`,
  comboAdd: (o) => `连击计数 +${o.n}`,
  exhaustSelf: () => `消耗`,
};
const KW_TEXT = { 连击: '连击：本回合每打出过 1 张攻击卡，此卡伤害 +N', 蓄力: '蓄力：斗志足够时触发强化效果', 护盾: '护盾：吸收伤害，回合开始清空', 虚弱: '虚弱：造成伤害 -25%', 易伤: '易伤：受到伤害 +50%', 抽牌: '抽牌', 保留: '保留：回合结束不弃置', 消耗: '消耗：本战斗移除' };

export function describe(card) {
  const parts = [];
  for (const op of card.ops || []) {
    if (op.k === 'if') {
      const condTxt = op.cond.resolveGte != null ? `蓄力（斗志≥${op.cond.resolveGte}）：`
        : op.cond.enemyStatus === 'vulnerable' ? '目标易伤时：'
        : op.cond.enemyHpBelowPct != null ? '目标生命低于30%时：'
        : op.cond.myHpBelowPct != null ? '自身生命低于50%时：' : '条件：';
      parts.push(condTxt + op.then.map((t) => OP_TEXT[t.k] ? OP_TEXT[t.k](t) : '').filter(Boolean).join('，'));
    } else if (OP_TEXT[op.k]) parts.push(OP_TEXT[op.k](op));
  }
  return parts.join('；');
}
export function kwTip(kw) { return KW_TEXT[kw] || kw; }
