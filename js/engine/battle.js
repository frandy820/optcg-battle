// 战斗状态机（纯逻辑零 DOM）——docs/02-game-design.md §2-§6 真值源
// 结算顺序铁律：攻击基础值 → 攻方修正 → 易伤/虚弱 → 护盾吸收 → HP → 受伤触发 → 死亡检查
import { makeRng, shuffle, weightedPick } from './rng.js';
import { resolveCard, EMERGENCY_CARD, MATES } from '../data/cards.js';
import { ENEMY_MINIONS } from '../data/enemies.js';
import { execOps, describe } from './effects.js';

export const HAND_MAX = 10;
export const RESOLVE_MAX = 10;
const MATE_SLOTS = 3;

const log = (b, e) => { e.seq = b.log.length; b.log.push(e); }; // 序号字段 seq：不占用业务字段（reshuffle.n=张数）

export function newBattle({ captainId, captain, deck, enemyId, enemyDef, seed, relics = [], runHp, runHpMax }) {
  const cap = captain || null;
  const hpMax = runHpMax != null ? runHpMax : (cap ? cap.hp : 70); // 上限来自局外（遗物/营地不改动它）
  const hp = runHp != null ? Math.min(runHp, hpMax) : hpMax; // 残血入战，上限不缩水
  const b = {
    kind: 'battle', v: 1, seed, turn: 1, over: null, // over: null|'win'|'lose'
    rng: makeRng(seed),
    relics: [...relics],
    captainId, captain: cap,
    player: {
      hp, hpMax, block: 0,
      energy: 3, energyMax: 3,
      resolve: 0,
      hand: [], deck: [...deck], discard: [], exhaust: [],
      mates: [],
      combo: 0, atkBuffTurn: 0, comboAdd: 0,
      firstAtkDone: false, firstSkillDone: false,
      costDownNext: 0, costDownHand: 0,
      skillsUsed: [false, false],
      tookDmgThisTurn: false, tookDmgLastTurn: false,
      gainedResolveThisTurn: false,
      deathSaveUsed: false,
    },
    enemy: {
      id: enemyId, def: enemyDef, hp: enemyDef.hp, hpMax: enemyDef.hp,
      block: 0, atkBuff: 0, minions: [], charged: null, intent: null, phase2On: false,
      statuses: [], // [{k:'weak'|'vulnerable', stacks, turns}]
    },
    log: [],
  };
  shuffle(b.player.deck, b.rng);
  draw(b, 5);
  genIntent(b); // 敌人开局意图（玩家先手）
  return b;
}

// ===== 状态查询 =====
export const status = (unit, k) => (unit.statuses || []).find((s) => s.k === k) || null;
export const statusStacks = (unit, k) => { const s = status(unit, k); return s ? s.stacks : 0; };

export function cardCost(b, card) {
  if (card.cost0) return 0; // fetchTop 取入的卡费用视为 0
  let c = card.cost;
  if (b.player.costDownHand > 0) c -= b.player.costDownHand;
  if (b.player.costDownNext > 0) c -= b.player.costDownNext;
  return Math.max(0, c);
}
export const canPlay = (b, card) => b.over === null && cardCost(b, card) <= b.player.energy;

// ===== 抽/弃/洗 =====
export function draw(b, n) {
  for (let i = 0; i < n; i++) {
    if (b.player.deck.length === 0) {
      if (b.player.discard.length === 0) {
        // 双空兜底：手也空 → 生成应急短刀；手不空 → 无牌可抽（不报错）
        if (b.player.hand.length === 0) {
          b.player.hand.push({ ...EMERGENCY_CARD });
          log(b, { t: 'emergency', side: 'p' });
        }
        continue;
      }
      b.player.deck = shuffle(b.player.discard, b.rng);
      b.player.discard = [];
      log(b, { t: 'reshuffle', side: 'p', n: b.player.deck.length });
    }
    const entry = b.player.deck.pop();
    const card = resolveCard(entry) || entry;
    if (b.player.hand.length >= HAND_MAX) {
      b.player.discard.push(entry); log(b, { t: 'burn', side: 'p', name: card.name });
    } else b.player.hand.push(card);
  }
}
function discardCard(b, card) {
  // 消耗判定以 ops 为准（强化版可去掉消耗，如「完美计算+」）；keywords 仅作卡面展示
  const exhausting = (card.ops || []).some((o) => o.k === 'exhaustSelf');
  if (exhausting) { b.player.exhaust.push({ id: card.id, upgraded: !!card.upgraded }); return; }
  b.player.discard.push({ id: card.id, upgraded: !!card.upgraded });
}

// ===== 伤害结算（顺序铁律实现）=====
export function dealToEnemy(b, raw, { fromCardType = null } = {}) {
  if (b.over) return 0;
  let x = raw + b.player.atkBuffTurn; // 攻方修正：回合攻击加成
  if (fromCardType === 'atk') {
    if (b.captain && b.captain.passive && b.captain.passive.k === 'firstAtkBonus' && !b.player.firstAtkDone) x += b.captain.passive.x;
    for (const m of b.player.mates) if (m.def.buffFirstAtk && !m.buffedThisTurn) { x += m.def.buffFirstAtk; m.buffedThisTurn = true; }
    if (b.relics.includes('warblade') && b.turn === 1) x += 4;
  }
  const vuln = statusStacks(b.enemy, 'vulnerable');
  if (vuln > 0) x = Math.round(x * 1.5); // 易伤（先）
  if (statusStacks(b.player, 'weak') > 0) x = Math.round(x * 0.75); // 玩家虚弱（后）——目标造成的伤害 ×0.75
  // 护盾吸收 → HP
  let absorbed = 0;
  if (b.enemy.block > 0) { absorbed = Math.min(b.enemy.block, x); b.enemy.block -= absorbed; x -= absorbed; }
  if (x > 0) b.enemy.hp -= x;
  log(b, { t: 'dmg', side: 'e', x: raw, dealt: x + absorbed, blocked: absorbed, hp: Math.max(0, b.enemy.hp) });
  if (fromCardType === 'atk') gainResolve(b, 2); // 攻击命中积累斗志
  // 敌方反甲：玩家攻击命中后被回敬（charged 之外的 block_thorns 来源）
  if (fromCardType === 'atk' && (b.enemy.thorns || 0) > 0 && !b.over) {
    const t = b.enemy.thorns;
    b.player.hp -= t;
    log(b, { t: 'dmg', side: 'p', x: t, dealt: t, blocked: 0, hp: Math.max(0, b.player.hp), thorns: true });
    if (b.player.hp <= 0) {
      if (b.relics.includes('revenge_flask') && !b.player.deathSaveUsed) { b.player.deathSaveUsed = true; b.player.hp = 1; log(b, { t: 'deathSave' }); }
      else { b.player.hp = 0; b.over = 'lose'; log(b, { t: 'lose' }); }
    }
  }
  if (b.enemy.hp <= 0) { b.enemy.hp = 0; b.over = 'win'; log(b, { t: 'win' }); }
  return x;
}
export function dealToPlayer(b, raw, { source = 'enemy' } = {}) {
  if (b.over) return 0;
  let x = raw + (source === 'enemy' ? b.enemy.atkBuff : 0);
  if (source === 'enemy' && statusStacks(b.player, 'vulnerable') > 0) x = Math.round(x * 1.5); // 玩家被施易伤（先易伤）
  if (source === 'enemy' && statusStacks(b.enemy, 'weak') > 0) x = Math.round(x * 0.75); // 施加方虚弱（后虚弱）
  let absorbed = 0;
  if (b.player.block > 0) { absorbed = Math.min(b.player.block, x); b.player.block -= absorbed; x -= absorbed; }
  if (x > 0) b.player.hp -= x;
  log(b, { t: 'dmg', side: 'p', x: raw, dealt: x, blocked: absorbed, hp: Math.max(0, b.player.hp) });
  if (x > 0 && !b.player.tookDmgThisTurn) { b.player.tookDmgThisTurn = true; gainResolve(b, 2); } // 每回合首次承伤+2
  // 反甲：受击后对攻击方回敬
  const thorns = b.player.thornsTurn || 0;
  if (x > 0 && thorns > 0 && source === 'enemy' && !b.over) {
    b.enemy.hp -= thorns;
    log(b, { t: 'thorns', x: thorns, hp: Math.max(0, b.enemy.hp) });
    if (b.enemy.hp <= 0) { b.enemy.hp = 0; b.over = 'win'; log(b, { t: 'win' }); }
  }
  if (b.player.hp <= 0) {
    // 复仇酒瓶免死
    if (b.relics.includes('revenge_flask') && !b.player.deathSaveUsed) {
      b.player.deathSaveUsed = true; b.player.hp = 1;
      log(b, { t: 'deathSave' });
    } else {
      b.player.hp = 0; b.over = 'lose'; log(b, { t: 'lose' });
    }
  }
  return x;
}

export function gainResolve(b, n) {
  const bonus = b.relics.includes('tidecharm') ? 1 : 0;
  const before = b.player.resolve;
  b.player.resolve = Math.min(RESOLVE_MAX, b.player.resolve + n + bonus);
  if (b.player.resolve > before) log(b, { t: 'resolve', n: b.player.resolve - before, v: b.player.resolve });
}

// ===== 出牌 =====
export function playCard(b, handIdx) {
  if (b.over) return false;
  const card = b.player.hand[handIdx];
  if (!card) return false;
  const cost = cardCost(b, card);
  if (cost > b.player.energy) return false;
  if (card.type === 'mate' && b.player.mates.length >= MATE_SLOTS) return false; // 伙伴栏满
  b.player.energy -= cost;
  b.player.hand.splice(handIdx, 1);
  if (b.player.costDownNext > 0) b.player.costDownNext = 0; // 「下一张卡」减费已消耗
  // 连击语义：伤害结算用打出前的 combo，攻击卡打出后 combo+1
  execOps(b, card.ops, { self: card, cardType: card.type });
  if (card.type === 'atk') {
    b.player.combo += 1 + b.player.comboAdd;
    b.player.comboAdd = 0;
    b.player.firstAtkDone = true;
  }
  if (card.type === 'skill') {
    b.player.firstSkillDone = true;
    if (b.captain && b.captain.passive && b.captain.passive.k === 'firstSkillDraw' && !b.player._skillDrewThisTurn) {
      b.player._skillDrewThisTurn = true; draw(b, b.captain.passive.x);
    }
  }
  log(b, { t: 'play', side: 'p', name: card.name, cost });
  discardCard(b, card);
  return true;
}

// ===== 船长斗志技 =====
export function useCaptainSkill(b, skillIdx) {
  if (b.over) return false;
  const sk = b.captain && b.captain.skills[skillIdx];
  if (!sk || b.player.skillsUsed[skillIdx] || b.player.resolve < sk.cost) return false;
  b.player.resolve -= sk.cost;
  b.player.skillsUsed[skillIdx] = true;
  execOps(b, sk.ops, { cardType: 'skill', isCaptainSkill: true });
  log(b, { t: 'skill', side: 'p', name: sk.name, cost: sk.cost });
  return true;
}

// ===== 回合流转 =====
export function endPlayerTurn(b) {
  if (b.over) return;
  // 手牌超限弃置（保留牌除外——celestial_budget 族）
  while (b.player.hand.length > HAND_MAX) {
    let idx = b.player.hand.findIndex((c) => !(c.keywords || []).includes('保留'));
    if (idx < 0) idx = 0;
    const [c] = b.player.hand.splice(idx, 1);
    b.player.discard.push({ id: c.id, upgraded: !!c.upgraded });
    log(b, { t: 'discardEnd', side: 'p', name: c.name });
  }
  // 伙伴回合结束效果
  for (const m of b.player.mates) {
    if (m.def.onTurnEnd) execOps(b, [m.def.onTurnEnd], { cardType: 'mate', mate: m });
  }
  enemyTurn(b);
}

function enemyTurn(b) {
  if (b.over) return;
  const e = b.enemy;
  // 蓄力：上回合已蓄力 → 本回合强制执行大攻击
  if (e.charged) {
    dealToPlayer(b, e.charged.x);
    e.charged = null;
  } else if (e.intent) {
    execEnemyAct(b, e.intent);
  }
  if (b.over) return;
  // 敌方召唤物行动：对位规则——玩家有存活伙伴时先打伙伴（肉盾价值），否则打玩家
  for (const m of e.minions) {
    if (m.hp <= 0 || !m.def.atk) continue;
    const alive = b.player.mates.filter((mm) => mm.hp > 0);
    if (alive.length > 0) {
      const tgt = alive[0];
      tgt.hp -= m.def.atk;
      log(b, { t: 'mateDmg', name: tgt.def.name, x: m.def.atk, hp: Math.max(0, tgt.hp) });
      if (tgt.hp <= 0) log(b, { t: 'mateDie', name: tgt.def.name });
    } else {
      dealToPlayer(b, m.def.atk, { source: 'minion' });
    }
    if (b.over) return;
  }
  // Boss 阶段切换检查（HP 阈值）
  if (e.def.phase2 && !e.phase2On && e.hp <= Math.floor(e.def.hp * e.def.phase2.atThresholdPct / 100)) {
    e.phase2On = true;
    execOps(b, e.def.phase2.onEnter, { cardType: 'enemyPhase' });
    log(b, { t: 'phase2', name: e.def.name });
    if (b.over) return;
  }
  // 敌方回合结束：状态递减
  tickStatuses(b.enemy);
  startPlayerTurn(b);
}

export function startPlayerTurn(b) {
  if (b.over) return;
  b.turn += 1;
  const p = b.player;
  p.block = 0; // 护盾清零（保留盾暂无卡使用；如需支持改为逐卡标记）
  p.energy = p.energyMax;
  p.combo = 0; p.comboAdd = 0; p.atkBuffTurn = 0; p.thornsTurn = 0;
  p.firstAtkDone = false; p.firstSkillDone = false; p._skillDrewThisTurn = false;
  p.skillsUsed = [false, false];
  p.costDownHand = 0; p.costDownNext = 0;
  p.tookDmgLastTurn = p.tookDmgThisTurn; p.tookDmgThisTurn = false;
  for (const m of p.mates) m.buffedThisTurn = false;
  tickStatuses(p);
  // 坚韧剑士被动：上回合未受击 +4 盾
  if (b.captain && b.captain.passive && b.captain.passive.k === 'guardStart' && !p.tookDmgLastTurn) {
    p.block += b.captain.passive.x;
    log(b, { t: 'block', side: 'p', x: b.captain.passive.x, v: p.block });
  }
  draw(b, 5 + (b.relics.includes('seamap') ? 1 : 0));
  genIntent(b);
  log(b, { t: 'turnStart', turn: b.turn });
}

// 玩家状态容器（weak 等施加给玩家）——player 用平行字段承载 statuses
export function applyStatusToPlayer(b, k, stacks) {
  // 玩家侧状态：weak（玩家伤害-25%）/vulnerable（玩家承伤+50%）
  b.player.statuses = b.player.statuses || [];
  const cur = status(b.player, k);
  if (cur) { cur.stacks += stacks; cur.turns = Math.max(cur.turns, 3); }
  else b.player.statuses.push({ k, stacks, turns: 3 });
  log(b, { t: 'status', side: 'p', k, stacks });
}
export function applyStatusToEnemy(b, k, stacks) {
  const cur = status(b.enemy, k);
  if (cur) { cur.stacks += stacks; cur.turns = Math.max(cur.turns, 3); }
  else b.enemy.statuses.push({ k, stacks, turns: 3 });
  log(b, { t: 'status', side: 'e', k, stacks });
}
function tickStatuses(unit) {
  if (!unit.statuses) return;
  unit.statuses = unit.statuses.filter((s) => {
    s.turns -= 1;
    if (s.turns <= 0) { s.stacks = Math.floor(s.stacks / 2); return s.stacks > 0 ? (s.turns = 3, true) : false; }
    return true;
  });
}
// 玩家 vulnerable 在 dealToPlayer 中生效（source==='enemy' 时承伤×1.5）
export function playerVulnMult(b) { return statusStacks(b.player, 'vulnerable') > 0 ? 1.5 : 1; }

// ===== 敌人意图（enemy-ai）=====
export function genIntent(b) {
  const e = b.enemy;
  if (b.over) { e.intent = null; return; }
  const pool = (e.phase2On && e.def.phase2 ? e.def.phase2.acts : e.def.acts)
    .filter((a) => !a.cond || enemyCondOk(b, a.cond));
  e.intent = weightedPick(pool.length ? pool : e.def.acts, b.rng);
}
function enemyCondOk(b, cond) {
  if (cond.minionsLt != null && !(b.enemy.minions.filter((m) => m.hp > 0).length < cond.minionsLt)) return false;
  return true;
}
export function intentLabel(b) {
  const e = b.enemy;
  if (e.charged) return { icon: '⚔', text: `蓄力攻击 ${e.charged.x}`, cls: 'big' };
  const it = e.intent;
  if (!it) return { icon: '·', text: '观察', cls: '' };
  const m = {
    atk: (x) => ({ icon: '⚔', text: `攻击 ${x}` }),
    atk_per_minion: (x) => ({ icon: '⚔', text: `攻击 ${x}+${(it.per || 1) * e.minions.filter((mm) => mm.hp > 0).length}` }),
    block: (x) => ({ icon: '🛡', text: `防御 ${x}` }),
    block_thorns: (x) => ({ icon: '🛡', text: `防御 ${x}+反甲` }),
    weak: () => ({ icon: '✦', text: '施压(虚弱)' }),
    vulnerable: () => ({ icon: '✦', text: '施压(易伤)' }),
    weak_atk: (x) => ({ icon: '⚔', text: `攻击 ${x}+虚弱` }),
    vuln_atk: (x) => ({ icon: '⚔', text: `攻击 ${x}+易伤` }),
    vuln_weak: (x) => ({ icon: '✦', text: '易伤+虚弱' }),
    charged_atk: (x) => ({ icon: '⚡', text: `蓄力中→${x}`, cls: 'big' }),
    summon: () => ({ icon: '➕', text: '召唤' }),
  }[it.k];
  const r = m ? m(it.x != null ? it.x : 0) : { icon: '?', text: it.k };
  return r;
}
function execEnemyAct(b, act) {
  const e = b.enemy;
  switch (act.k) {
    case 'atk': dealToPlayer(b, act.x); break;
    case 'atk_per_minion': dealToPlayer(b, act.x + (act.per || 1) * e.minions.filter((m) => m.hp > 0).length); break;
    case 'block': e.block += act.x; log(b, { t: 'block', side: 'e', x: act.x, v: e.block }); break;
    case 'block_thorns': e.block += act.x; e.thorns = (e.thorns || 0) + act.thorns; log(b, { t: 'block', side: 'e', x: act.x, v: e.block }); break;
    case 'weak': applyStatusToPlayer(b, 'weak', act.n); break;
    case 'vulnerable': applyStatusToPlayer(b, 'vulnerable', act.n); break;
    case 'weak_atk': dealToPlayer(b, act.x); if (!b.over) applyStatusToPlayer(b, 'weak', act.weak); break;
    case 'vuln_atk': dealToPlayer(b, act.x); if (!b.over) applyStatusToPlayer(b, 'vulnerable', act.vuln); break;
    case 'vuln_weak': applyStatusToPlayer(b, 'vulnerable', act.vuln); applyStatusToPlayer(b, 'weak', act.weak); break;
    case 'charged_atk': e.charged = { x: act.x }; log(b, { t: 'charge', x: act.x }); break;
    case 'summon': {
      if (e.minions.filter((m) => m.hp > 0).length < 2) {
        const def = ENEMY_MINIONS[act.mate];
        e.minions.push({ def: { ...def }, hp: act.mateHp || def.hp, hpMax: act.mateHp || def.hp });
        log(b, { t: 'summon', side: 'e', name: def.name });
      }
      break;
    }
    default: break;
  }
}

// 敌方反甲（敌人 block_thorns 给的）在玩家攻击敌人时结算
export function enemyThorns(b) { return b.enemy.thorns || 0; }

export { execOps, describe, MATE_SLOTS };
