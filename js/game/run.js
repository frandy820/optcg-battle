// 局外流程：航线/奖励/营地/金币/遗物/统计（纯逻辑，UI 薄壳在 main.js）
// docs/02-game-design.md §10 真值源。航线固定 5 节点：战斗→营地→精英战→营地→Boss
import { makeRng, shuffle } from '../engine/rng.js';
import { CARDS, resolveCard } from '../data/cards.js';
import { captainById } from '../data/captains.js';
import { ENEMIES, enemyById } from '../data/enemies.js';
import { newBattle } from '../engine/battle.js';

export const ROUTE = [
  { k: 'battle', tier: 'normal', label: '遭遇战' },
  { k: 'camp', label: '营地' },
  { k: 'battle', tier: 'elite', label: '精英战' },
  { k: 'camp', label: '营地' },
  { k: 'battle', tier: 'boss', label: 'Boss 战' },
];

export function newRun(captainId, seed) {
  const cap = captainById(captainId);
  return {
    kind: 'run', v: 1, seed, captainId,
    hpMax: cap.hp, hp: cap.hp, gold: 0, relics: [],
    deck: cap.starterDeck.map((id) => ({ id, upgraded: false })),
    nodeIdx: 0, battleSeedUsed: {}, finished: null, // null|'victory'|'defeat'
    stats: { battles: 0, turns: 0, dmgDealt: 0, dmgTaken: 0, cardsPlayed: 0, playCount: {} },
  };
}

export const nodeAt = (run) => ROUTE[run.nodeIdx] || null;
export const isLastNode = (run) => run.nodeIdx === ROUTE.length - 1;

// 进入当前战斗节点：敌方选择（normal 5 选 1 / elite 固定 / boss 固定）+ 战斗 seed（nodeIdx 派生）
export function startBattle(run) {
  const node = nodeAt(run);
  if (!node || node.k !== 'battle') return null;
  const cap = captainById(run.captainId);
  let enemyId;
  if (node.tier === 'normal') {
    const pool = ENEMIES.filter((e) => e.tier === 'normal');
    const rng = makeRng(run.seed * 131 + run.nodeIdx * 17);
    enemyId = pool[Math.floor(rng() * pool.length)].id;
  } else if (node.tier === 'elite') enemyId = 'deep_hunter';
  else enemyId = 'frost_admiral';
  return newBattle({
    captainId: run.captainId, captain: cap,
    deck: run.deck, enemyId, enemyDef: enemyById(enemyId),
    seed: (run.seed * 977 + run.nodeIdx * 61) >>> 0,
    relics: run.relics, runHp: run.hp, runHpMax: run.hpMax,
  });
}

// 战斗结算：胜利→金币/遗物/进度推进；返回 { win, rewards }（rewards=null 表示非战斗或失败）
export function settleBattle(run, battle) {
  const node = nodeAt(run);
  run.stats.battles += 1;
  run.stats.turns += battle.turn;
  run.stats.dmgDealt += battle.log.filter((e) => e.t === 'dmg' && e.side === 'e').reduce((n, e) => n + (e.dealt || 0), 0);
  run.stats.dmgTaken += battle.log.filter((e) => e.t === 'dmg' && e.side === 'p').reduce((n, e) => n + (e.dealt || 0), 0);
  for (const e of battle.log) if (e.t === 'play') run.stats.cardsPlayed += 1;
  if (battle.goldGain) run.gold += Math.round(battle.goldGain * (run.relics.includes('golden_compass') ? 1.5 : 1));
  const win = battle.over === 'win';
  if (!win) { run.finished = 'defeat'; run.hp = 0; return { win, rewards: null, relicOptions: null }; }
  // 同步 HP；船医徽章回血
  run.hp = Math.min(run.hpMax, battle.player.hp + (run.relics.includes('medbadge') ? 8 : 0));
  const goldMap = { normal: 60, elite: 90, boss: 150 };
  run.gold += Math.round((goldMap[node.tier] || 60) * (run.relics.includes('golden_compass') ? 1.5 : 1));
  const rewards = genRewards(run, node.tier);
  const relicOptions = node.tier === 'elite' ? genRelicOptions(run) : null;
  if (isLastNode(run)) run.finished = 'victory';
  return { win, rewards, relicOptions };
}

// 奖励三选一（稀有度按节点加权；船长专属卡只属于该船长；不含终结技入普通池——终结技只在精英/Boss 奖励出现）
const RARITY_W = { normal: { R: 70, S: 25, E: 5 }, elite: { R: 45, S: 40, E: 15 } };
export function genRewards(run, tier) {
  const rng = makeRng(run.seed * 313 + run.nodeIdx * 29 + (run.stats.battles * 7));
  const cap = captainById(run.captainId);
  const w = RARITY_W[tier] || RARITY_W.normal;
  const out = [];
  let guard = 0;
  const pool = CARDS.filter((c) => (c.captain == null || c.captain === cap.id) && c.type !== 'finisher');
  const poolF = CARDS.filter((c) => (c.captain == null || c.captain === cap.id));
  while (out.length < 3 && guard++ < 200) {
    const src = (tier === 'elite' && out.length === 0) ? poolF : pool;
    // 稀有度先抽
    const r = rng() * 100;
    const rar = r < w.R ? 'R' : r < w.R + w.S ? 'S' : 'E';
    const sub = src.filter((c) => c.rarity === rar);
    if (!sub.length) continue;
    const card = sub[Math.floor(rng() * sub.length)];
    if (!out.find((o) => o.id === card.id)) out.push({ id: card.id, upgraded: false });
  }
  return out;
}
export function takeReward(run, choice /* {id,upgraded}|null=跳过 */) {
  if (choice) run.deck.push({ id: choice.id, upgraded: !!choice.upgraded });
  else run.gold += 30; // 跳过补偿
  advance(run);
}

// 遗物三选一（精英后；不重复持有）
export function genRelicOptions(run) {
  const rng = makeRng(run.seed * 733 + run.nodeIdx * 41);
  const RELICS = ['warblade', 'seamap', 'medbadge', 'tidecharm', 'revenge_flask', 'golden_compass'];
  const pool = shuffle(RELICS.filter((r) => !run.relics.includes(r)), rng);
  return pool.slice(0, 3);
}
export function takeRelic(run, relicId) {
  if (relicId && !run.relics.includes(relicId)) run.relics.push(relicId);
  advance(run);
}

// 营地：免费三选一（每营地一次），金币可加购
export function campOptions(run) {
  return [
    { k: 'heal', label: '休息：回复 25 HP', free: true },
    { k: 'upgrade', label: '锻造：强化 1 张卡（50 金，首次免费）', free: run.gold >= 0 },
    { k: 'remove', label: '告别：移除 1 张卡（40 金）', free: false },
  ];
}
export function campAct(run, k) {
  // 返回 { ok, needPick }：needPick=true 时 UI 需要卡选择（upgrade/remove）
  if (k === 'heal') {
    if (run.campFreeUsed) return { ok: false, err: '免费服务已用' };
    run.campFreeUsed = true;
    run.hp = Math.min(run.hpMax, run.hp + 25);
    return { ok: true };
  }
  if (k === 'upgrade') {
    const free = !run.campFreeUsed;
    if (!free && run.gold < 50) return { ok: false, err: '金币不足' };
    run.campFreeUsed = true; if (!free) run.gold -= 50;
    return { ok: true, needPick: 'upgrade' };
  }
  if (k === 'remove') {
    if (run.gold < 40) return { ok: false, err: '金币不足' };
    run.gold -= 40;
    return { ok: true, needPick: 'remove' };
  }
  return { ok: false, err: '未知操作' };
}
export function campPick(run, kind, cardIdx) {
  if (kind === 'remove') { run.deck.splice(cardIdx, 1); return { ok: true }; }
  if (kind === 'upgrade') {
    const e = run.deck[cardIdx];
    if (!e) return { ok: false, err: '无效卡' };
    e.upgraded = true;
    return { ok: true };
  }
  return { ok: false, err: '未知操作' };
}
export function leaveCamp(run) {
  run.campFreeUsed = false;
  advance(run);
}

export function advance(run) {
  if (run.nodeIdx < ROUTE.length - 1) run.nodeIdx += 1;
}

// 展示用：卡组解析
export const deckResolved = (run) => run.deck.map(resolveCard).filter(Boolean);
