// 卡牌数据（东海篇 37 张）——docs/one-piece-lore-and-game-map.md §3 真值源
// 结构：{ id, name, type: 'atk'|'def'|'skill'|'mate'|'finisher', rarity: 'R'|'S'|'E',
//        cost, arc: 1|2|3(解锁篇章), faction, keywords: [], ops: [...], up: {...} }
// 机制数值对齐 v1.0.0 已平衡曲线（docs/04）；文案由 describe() 从 ops 生成（同源）
// arc：1=风车村~橘子镇 2=西罗布村~可可亚村 3=罗格镇（终结技后期出现）
export const CARDS = [
  // ===== 路飞线 6（起始 10 张由此构成）=====
  { id: 'gum_gum_pistol', name: '橡胶枪', type: 'atk', rarity: 'R', cost: 1, arc: 1, faction: 'strawhat',
    ops: [{ k: 'dmg', x: 7 }], up: { ops: [{ k: 'dmg', x: 10 }] } },
  { id: 'gum_gum_balloon', name: '橡胶气球', type: 'def', rarity: 'R', cost: 1, arc: 1, faction: 'strawhat',
    ops: [{ k: 'block', x: 6 }], up: { ops: [{ k: 'block', x: 8 }] } },
  { id: 'gum_gum_whip', name: '橡胶鞭', type: 'atk', rarity: 'R', cost: 1, arc: 1, faction: 'strawhat',
    ops: [{ k: 'dmg', x: 4 }, { k: 'dmgMinions', x: 4 }],
    up: { ops: [{ k: 'dmg', x: 6 }, { k: 'dmgMinions', x: 6 }] } },
  { id: 'gum_gum_rocket', name: '橡胶火箭', type: 'skill', rarity: 'R', cost: 1, arc: 1, faction: 'strawhat',
    ops: [{ k: 'draw', n: 1 }, { k: 'resolve', n: 1 }], up: { ops: [{ k: 'draw', n: 2 }, { k: 'resolve', n: 1 }] } },
  { id: 'gum_gum_bazooka', name: '橡胶火箭炮', type: 'atk', rarity: 'S', cost: 2, arc: 2, faction: 'strawhat',
    ops: [{ k: 'dmg', x: 13 }], up: { ops: [{ k: 'dmg', x: 17 }] } },
  { id: 'luffy_meat', name: '肉！！', type: 'skill', rarity: 'R', cost: 1, arc: 1, faction: 'strawhat',
    ops: [{ k: 'heal', x: 4 }, { k: 'resolve', n: 1 }], up: { ops: [{ k: 'heal', x: 7 }, { k: 'resolve', n: 1 }] } },

  // ===== 索隆线 7 =====
  { id: 'oni_giri', name: '三刀流·鬼斩', type: 'atk', rarity: 'R', cost: 1, arc: 1, faction: 'strawhat', keywords: ['连击'],
    ops: [{ k: 'dmg', x: 6 }, { k: 'comboHit', x: 1 }], up: { ops: [{ k: 'dmg', x: 8 }, { k: 'comboHit', x: 1 }] } },
  { id: 'tiger_hunt', name: '三刀流·虎狩猎', type: 'atk', rarity: 'R', cost: 1, arc: 1, faction: 'strawhat', keywords: ['连击'],
    ops: [{ k: 'dmg', x: 4 }, { k: 'comboHit', x: 2 }], up: { ops: [{ k: 'dmg', x: 5 }, { k: 'comboHit', x: 2 }] } },
  { id: 'iai_giri', name: '一刀流·居合', type: 'atk', rarity: 'S', cost: 2, arc: 1, faction: 'strawhat',
    ops: [{ k: 'dmg', x: 13 }], up: { ops: [{ k: 'dmg', x: 17 }] } },
  { id: 'nitoryu_guard', name: '二刀流·铁壁', type: 'def', rarity: 'S', cost: 1, arc: 1, faction: 'strawhat',
    ops: [{ k: 'block', x: 5 }, { k: 'thorns', n: 4 }], up: { ops: [{ k: 'block', x: 7 }, { k: 'thorns', n: 4 }] } },
  { id: 'wado_spirit', name: '和道一文字的觉悟', type: 'skill', rarity: 'S', cost: 1, arc: 2, faction: 'strawhat',
    ops: [{ k: 'atkBuffTurn', n: 3 }], up: { ops: [{ k: 'atkBuffTurn', n: 4 }] } },
  { id: 'hawk_promise', name: '鹰眼之约', type: 'def', rarity: 'E', cost: 2, arc: 2, faction: 'strawhat',
    ops: [{ k: 'block', x: 10 }, { k: 'if', cond: { myHpBelowPct: 50 }, then: [{ k: 'block', x: 8 }] }],
    up: { ops: [{ k: 'block', x: 13 }, { k: 'if', cond: { myHpBelowPct: 50 }, then: [{ k: 'block', x: 8 }] }] } },
  { id: 'oni_giri_ren', name: '三刀流·鬼斩·连', type: 'finisher', rarity: 'E', cost: 3, arc: 2, faction: 'strawhat',
    keywords: ['连击', '消耗'],
    ops: [{ k: 'dmg', x: 8 }, { k: 'comboHit', x: 2 }, { k: 'exhaustSelf' }],
    up: { ops: [{ k: 'dmg', x: 10 }, { k: 'comboHit', x: 2 }, { k: 'exhaustSelf' }] } },

  // ===== 娜美线 6 =====
  { id: 'nami_theft', name: '窃术', type: 'skill', rarity: 'R', cost: 1, arc: 1, faction: 'strawhat',
    ops: [{ k: 'draw', n: 2 }], up: { ops: [{ k: 'draw', n: 3 }] } },
  { id: 'weather_log', name: '航海日记·气候预判', type: 'skill', rarity: 'R', cost: 1, arc: 1, faction: 'strawhat',
    ops: [{ k: 'draw', n: 2 }, { k: 'discardRandom', n: 1 }], up: { ops: [{ k: 'draw', n: 3 }, { k: 'discardRandom', n: 1 }] } },
  { id: 'happy_punch', name: '幸福的一击', type: 'atk', rarity: 'S', cost: 2, arc: 2, faction: 'strawhat',
    ops: [{ k: 'dmg', x: 8 }, { k: 'if', cond: { enemyHpBelowPct: 30 }, then: [{ k: 'dmg', x: 8 }] }],
    up: { ops: [{ k: 'dmg', x: 10 }, { k: 'if', cond: { enemyHpBelowPct: 30 }, then: [{ k: 'dmg', x: 10 }] }] } },
  { id: 'orange_memory', name: '橘子园的记忆', type: 'skill', rarity: 'R', cost: 1, arc: 2, faction: 'strawhat',
    ops: [{ k: 'heal', x: 5 }, { k: 'draw', n: 1 }], up: { ops: [{ k: 'heal', x: 8 }, { k: 'draw', n: 1 }] } },
  { id: 'cat_trap', name: '小贼猫的陷阱', type: 'skill', rarity: 'S', cost: 1, arc: 2, faction: 'strawhat',
    ops: [{ k: 'weak', n: 2 }, { k: 'draw', n: 1 }], up: { ops: [{ k: 'weak', n: 3 }, { k: 'draw', n: 1 }] } },
  { id: 'weather_read', name: '天候解读', type: 'skill', rarity: 'E', cost: 1, arc: 2, faction: 'strawhat',
    ops: [{ k: 'vulnerable', n: 2 }, { k: 'draw', n: 1 }, { k: 'resolve', n: 1 }],
    up: { ops: [{ k: 'vulnerable', n: 3 }, { k: 'draw', n: 1 }, { k: 'resolve', n: 1 }] } },

  // ===== 乌索普线 6 =====
  { id: 'lead_star', name: '弹弓·铅星', type: 'atk', rarity: 'R', cost: 0, arc: 1, faction: 'strawhat',
    ops: [{ k: 'dmg', x: 4 }, { k: 'if', cond: { enemyStatus: 'vulnerable' }, then: [{ k: 'dmg', x: 4 }] }],
    up: { ops: [{ k: 'dmg', x: 6 }, { k: 'if', cond: { enemyStatus: 'vulnerable' }, then: [{ k: 'dmg', x: 4 }] }] } },
  { id: 'gunpowder_star', name: '火药星', type: 'atk', rarity: 'S', cost: 2, arc: 2, faction: 'strawhat', keywords: ['消耗'],
    ops: [{ k: 'dmg', x: 10 }, { k: 'exhaustSelf' }], up: { ops: [{ k: 'dmg', x: 14 }, { k: 'exhaustSelf' }] } },
  { id: 'smoke_star', name: '烟星', type: 'skill', rarity: 'R', cost: 1, arc: 1, faction: 'strawhat',
    ops: [{ k: 'weak', n: 2 }, { k: 'block', x: 3 }], up: { ops: [{ k: 'weak', n: 3 }, { k: 'block', x: 3 }] } },
  { id: 'stink_star', name: '臭星', type: 'skill', rarity: 'R', cost: 1, arc: 1, faction: 'strawhat',
    ops: [{ k: 'vulnerable', n: 2 }], up: { ops: [{ k: 'vulnerable', n: 3 }] } },
  { id: 'usopp_hammer', name: '必杀·乌索普铁锤', type: 'atk', rarity: 'S', cost: 2, arc: 2, faction: 'strawhat', keywords: ['蓄力'],
    ops: [{ k: 'dmg', x: 8 }, { k: 'if', cond: { resolveGte: 5 }, then: [{ k: 'dmg', x: 8 }] }],
    up: { ops: [{ k: 'dmg', x: 8 }, { k: 'if', cond: { resolveGte: 5 }, then: [{ k: 'dmg', x: 12 }] }] } },
  { id: 'usopp_eight', name: '必杀·八连发火药星', type: 'finisher', rarity: 'E', cost: 3, arc: 2, faction: 'strawhat',
    keywords: ['消耗'],
    ops: [{ k: 'multi', times: 3, x: 8 }, { k: 'exhaustSelf' }], up: { ops: [{ k: 'multi', times: 3, x: 10 }, { k: 'exhaustSelf' }] } },

  // ===== 山治线 6 =====
  { id: 'collier_shoot', name: '首肉·SHOOT', type: 'atk', rarity: 'R', cost: 1, arc: 2, faction: 'strawhat',
    ops: [{ k: 'dmg', x: 6 }, { k: 'weak', n: 2 }], up: { ops: [{ k: 'dmg', x: 8 }, { k: 'weak', n: 2 }] } },
  { id: 'shoulder_shoot', name: '肩肉·SHOOT', type: 'atk', rarity: 'R', cost: 1, arc: 2, faction: 'strawhat',
    ops: [{ k: 'dmg', x: 5 }, { k: 'block', x: 5 }], up: { ops: [{ k: 'dmg', x: 7 }, { k: 'block', x: 6 }] } },
  { id: 'party_dish', name: '宴席料理', type: 'skill', rarity: 'S', cost: 2, arc: 2, faction: 'strawhat',
    ops: [{ k: 'heal', x: 9 }], up: { ops: [{ k: 'heal', x: 13 }] } },
  { id: 'chef_pride', name: '厨师的骄傲', type: 'def', rarity: 'S', cost: 1, arc: 2, faction: 'strawhat',
    ops: [{ k: 'block', x: 4 }, { k: 'healMates', x: 4 }], up: { ops: [{ k: 'block', x: 6 }, { k: 'healMates', x: 6 }] } },
  { id: 'sky_beef_shoot', name: '空中牛肉·SHOOT', type: 'atk', rarity: 'E', cost: 2, arc: 2, faction: 'strawhat',
    ops: [{ k: 'dmg', x: 16 }], up: { ops: [{ k: 'dmg', x: 21 }] } },
  { id: 'party_table_kick', name: '宴会桌·踢飞', type: 'finisher', rarity: 'E', cost: 3, arc: 2, faction: 'strawhat',
    keywords: ['消耗'],
    ops: [{ k: 'multi', times: 3, x: 7 }, { k: 'exhaustSelf' }], up: { ops: [{ k: 'multi', times: 3, x: 9 }, { k: 'exhaustSelf' }] } },

  // ===== 事件 6 =====
  { id: 'recruit_zoro', name: '招募·索隆', type: 'mate', rarity: 'R', cost: 2, arc: 1, faction: 'strawhat',
    ops: [{ k: 'summon', mate: 'zoro' }], up: { ops: [{ k: 'summon', mate: 'zoroPlus' }] } },
  { id: 'recruit_nami', name: '招募·娜美', type: 'mate', rarity: 'R', cost: 2, arc: 2, faction: 'strawhat',
    ops: [{ k: 'summon', mate: 'nami' }], up: { ops: [{ k: 'summon', mate: 'namiPlus' }] } },
  { id: 'recruit_usopp', name: '招募·乌索普', type: 'mate', rarity: 'R', cost: 1, arc: 2, faction: 'strawhat',
    ops: [{ k: 'summon', mate: 'usopp' }], up: { ops: [{ k: 'summon', mate: 'usoppPlus' }] } },
  { id: 'recruit_sanji', name: '招募·山治', type: 'mate', rarity: 'S', cost: 2, arc: 2, faction: 'strawhat',
    ops: [{ k: 'summon', mate: 'sanji' }], up: { ops: [{ k: 'summon', mate: 'sanjiPlus' }] } },
  { id: 'departure_feast', name: '出航之宴', type: 'skill', rarity: 'R', cost: 1, arc: 1, faction: 'strawhat',
    ops: [{ k: 'heal', x: 4 }, { k: 'resolve', n: 2 }], up: { ops: [{ k: 'heal', x: 7 }, { k: 'resolve', n: 2 }] } },
  { id: 'strawhat_bond', name: '草帽一伙', type: 'skill', rarity: 'E', cost: 1, arc: 2, faction: 'strawhat',
    ops: [{ k: 'resolve', n: 3 }, { k: 'draw', n: 1 }], up: { ops: [{ k: 'resolve', n: 3 }, { k: 'draw', n: 2 }] } },
];

// 战斗内兜底生成卡（双堆空+手空时每回合自动入手 1 张）
export const EMERGENCY_CARD = { id: 'emergency_knife', name: '应急短刀', type: 'atk', rarity: 'R', cost: 0,
  keywords: ['消耗'], ops: [{ k: 'dmg', x: 4 }, { k: 'block', x: 4 }, { k: 'exhaustSelf' }] };

// 伙伴定义（召唤物实体，非手牌卡）——分工：索隆主战/娜美指挥/乌索普干扰/山治守护
export const MATES = {
  zoro: { id: 'zoro', name: '索隆', icon: '🗡', hp: 12, onTurnEnd: { k: 'dmg', x: 5 } },
  zoroPlus: { id: 'zoroPlus', name: '索隆+', icon: '🗡', hp: 16, onTurnEnd: { k: 'dmg', x: 7 } },
  nami: { id: 'nami', name: '娜美', icon: '🍊', hp: 8, buffFirstAtk: 2, onTurnEnd: { k: 'resolve', n: 1 } },
  namiPlus: { id: 'namiPlus', name: '娜美+', icon: '🍊', hp: 10, buffFirstAtk: 3, onTurnEnd: { k: 'resolve', n: 2 } },
  usopp: { id: 'usopp', name: '乌索普', icon: '🎯', hp: 8, onTurnEnd: { k: 'weak', n: 1 } },
  usoppPlus: { id: 'usoppPlus', name: '乌索普+', icon: '🎯', hp: 10, onTurnEnd: { k: 'weak', n: 2 } },
  sanji: { id: 'sanji', name: '山治', icon: '🍳', hp: 12, onTurnEnd: { k: 'heal', x: 3 } },
  sanjiPlus: { id: 'sanjiPlus', name: '山治+', icon: '🍳', hp: 12, onTurnEnd: { k: 'heal', x: 5 } },
};

// 伙伴羁绊（双方/三方在场时玩家攻击获得加成；refreshBonds 每回合/召唤后刷新）
export const MATE_BONDS = [
  { mates: ['zoro', 'sanji'], name: '死对头的较量', atk: 2 },
  { mates: ['usopp', 'nami'], name: '狙击×天候的连携', atk: 2 },
  { mates: ['zoro', 'usopp', 'sanji'], name: '东海三人组', atk: 3 },
];

export const byId = (id) => CARDS.find((c) => c.id === id) || null;
// 实例化卡组条目：{ id, upgraded } → 完整定义（强化版合并）
export function resolveCard(entry) {
  const base = byId(entry.id) || (entry.id === 'emergency_knife' ? EMERGENCY_CARD : null);
  if (!base) return null;
  if (!entry.upgraded) return { ...base };
  return { ...base, ...(base.up || {}), name: base.name + '+', upgraded: true };
}
