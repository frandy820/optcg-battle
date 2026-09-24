// 局外流程：航线/奖励/营地/金币/遗物/统计（纯逻辑，UI 薄壳在 main.js）
// 真值源：docs/one-piece-lore-and-game-map.md §2 东海篇 9 节点航线
// ROUTE 敌人固定（剧情模式，弃随机池）；joins=胜利后免费入组的招募卡；arc=奖励解锁门控
import { makeRng, shuffle } from '../engine/rng.js';
import { CARDS, resolveCard } from '../data/cards.js';
import { captainById } from '../data/captains.js';
import { ENEMIES, enemyById } from '../data/enemies.js';
import { newBattle } from '../engine/battle.js';

export const ROUTE = [
  { k: 'battle', tier: 'normal', label: '风车村', enemy: 'alvida', arc: 1, gold: 60,
    story: '风车村码头，你从酒桶里蹦出来，一拳打飞了欺负克比的铁棒女人——冒险从这里开始。' },
  { k: 'battle', tier: 'normal', label: '谢尔兹镇', enemy: 'morgan', arc: 1, gold: 60, joins: 'recruit_zoro',
    story: '海军基地刑场，你替被绑三周的剑士挡下了处刑刀。「我是索隆，从今天起当你的伙伴。」' },
  { k: 'battle', tier: 'normal', label: '橘子镇', enemy: 'buggy', arc: 1, gold: 70, joins: 'recruit_nami',
    story: '小丑巴基把小镇炸成了废墟。那个偷走伟大航路海图的小贼猫，说要跟你合作——「只是合作而已！」' },
  { k: 'camp', label: '海上露营地', arc: 1, story: '三人和一艘小船，夜里轮流掌舵。谁在打呼噜？' },
  { k: 'battle', tier: 'elite', label: '西罗布村', enemy: 'kuro', arc: 2, gold: 90, joins: 'recruit_usopp',
    story: '雇佣三年的管家露出了黑猫船长的真面目。长鼻子少年喊出谎言成真的那句话：「我也有…8000 部下！」' },
  { k: 'battle', tier: 'elite', label: '海上餐厅巴拉蒂', enemy: 'krieg', arc: 2, gold: 100, joins: 'recruit_sanji',
    story: '克利克舰队来抢这艘海上餐厅。那位卷眉毛厨师完成了那句迟到已久的自我介绍——「我是山治，去找 All Blue 的男人。」' },
  { k: 'camp', label: '可可亚村外海', arc: 2, story: '娜美把刀口对准了自己的肩膀。8 年了，该去接她回家了。' },
  { k: 'battle', tier: 'boss', label: 'Arlong Park', enemy: 'arlong', arc: 2, gold: 150,
    story: '「你们对娜美做了什么！！」踩碎这座公园，把鱼人海贼团的枷锁一并踩碎。' },
  { k: 'battle', tier: 'boss', label: '罗格镇', enemy: 'smoker', arc: 3, gold: 200,
    story: '海贼王哥尔·D·罗杰的起点与终点。处刑台轰然倒塌，白猎人挡在面前——闯过去，就是伟大航路。' },
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

// 进入当前战斗节点：敌人固定（剧情），战斗 seed 按 nodeIdx 派生（同 seed 可复现）
export function startBattle(run) {
  const node = nodeAt(run);
  if (!node || node.k !== 'battle') return null;
  const cap = captainById(run.captainId);
  return newBattle({
    captainId: run.captainId, captain: cap,
    deck: run.deck, enemyId: node.enemy, enemyDef: enemyById(node.enemy),
    seed: (run.seed * 977 + run.nodeIdx * 61) >>> 0,
    relics: run.relics, runHp: run.hp, runHpMax: run.hpMax,
  });
}

// 战斗结算：胜利→金币/伙伴加入/奖励/进度推进；返回 { win, rewards, relicOptions, joinsCard }
export function settleBattle(run, battle) {
  const node = nodeAt(run);
  run.stats.battles += 1;
  run.stats.turns += battle.turn;
  run.stats.dmgDealt += battle.log.filter((e) => e.t === 'dmg' && e.side === 'e').reduce((n, e) => n + (e.dealt || 0), 0);
  run.stats.dmgTaken += battle.log.filter((e) => e.t === 'dmg' && e.side === 'p').reduce((n, e) => n + (e.dealt || 0), 0);
  for (const e of battle.log) if (e.t === 'play') run.stats.cardsPlayed += 1;
  if (battle.goldGain) run.gold += Math.round(battle.goldGain * (run.relics.includes('golden_compass') ? 1.5 : 1));
  const win = battle.over === 'win';
  if (!win) { run.finished = 'defeat'; run.hp = 0; return { win, rewards: null, relicOptions: null, joinsCard: null }; }
  // 同步 HP；梅利号的船帆回血
  run.hp = Math.min(run.hpMax, battle.player.hp + (run.relics.includes('medbadge') ? 8 : 0));
  run.gold += Math.round((node.gold || 60) * (run.relics.includes('golden_compass') ? 1.5 : 1));
  // 伙伴加入：招募卡免费入组（剧情性保证伙伴出场，不占三选一名额）
  let joinsCard = null;
  if (node.joins) {
    joinsCard = node.joins;
    if (!run.deck.find((e) => e.id === node.joins)) run.deck.push({ id: node.joins, upgraded: false });
  }
  const rewards = genRewards(run, node.tier);
  const relicOptions = node.tier === 'elite' ? genRelicOptions(run) : null;
  if (isLastNode(run)) run.finished = 'victory';
  return { win, rewards, relicOptions, joinsCard };
}

// 奖励三选一（稀有度按节点加权；arc 门控：卡牌 arc ≤ 当前节点 arc 才能出现——后期招式不提前）
const RARITY_W = { normal: { R: 70, S: 25, E: 5 }, elite: { R: 45, S: 40, E: 15 }, boss: { R: 40, S: 40, E: 20 } };
export function genRewards(run, tier) {
  const rng = makeRng(run.seed * 313 + run.nodeIdx * 29 + (run.stats.battles * 7));
  const node = nodeAt(run) || { arc: 1 };
  const w = RARITY_W[tier] || RARITY_W.normal;
  const out = [];
  let guard = 0;
  const pool = CARDS.filter((c) => (c.captain == null || c.captain === run.captainId) && c.type !== 'finisher' && (c.arc || 1) <= node.arc);
  const poolF = CARDS.filter((c) => (c.captain == null || c.captain === run.captainId) && (c.arc || 1) <= node.arc);
  while (out.length < 3 && guard++ < 200) {
    const src = (tier !== 'normal' && out.length === 0) ? poolF : pool;
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

// 遗物三选一（精英战后；不重复持有）
export function genRelicOptions(run) {
  const rng = makeRng(run.seed * 733 + run.nodeIdx * 41);
  const RELICS = ['warblade', 'seamap', 'medbadge', 'tidecharm', 'revenge_flask', 'golden_compass'];
  const pool = shuffle(RELICS.filter((r) => !run.relics.includes(r)), rng);
  return pool.slice(0, 3);
}
export function takeRelic(run, relicId) {
  if (relicId && !run.relics.includes(relicId)) run.relics.push(relicId);
  // 不推进 nodeIdx：精英战「遗物+卡牌」双奖励只由 takeReward 推进一次（曾各自 advance → 跳过下一节点）
}

// 营地：免费三选一（每营地一次），金币可加购
export function campOptions(run) {
  return [
    { k: 'heal', label: '甲板休整：回复 25 HP', free: true },
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
