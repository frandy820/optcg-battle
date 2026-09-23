// 卡牌数据（声明式，47 张）——docs/02-game-design.md §9 为真值源
// 结构：{ id, name, type: 'atk'|'def'|'skill'|'mate'|'finisher', rarity: 'R'|'S'|'E',
//        cost, captain: null|'garan'|'sela'|'tie', keywords: [], ops: [...], up: {...} }
// ops 由 engine/effects.js 统一结算；描述文案由 describe() 从 ops 生成（文案与逻辑同源）
// 强化版 up = { cost?, ops? }（覆盖式）；应急短刀为战斗内生成卡，不在此表
export const CARDS = [
  // ===== 通用攻击 14 =====
  { id: 'sailor_slash', name: '水手挥砍', type: 'atk', rarity: 'R', cost: 1, captain: null,
    ops: [{ k: 'dmg', x: 7 }], up: { ops: [{ k: 'dmg', x: 10 }] } },
  { id: 'twin_cut', name: '双刀连击', type: 'atk', rarity: 'R', cost: 1, captain: null, keywords: ['连击'],
    ops: [{ k: 'dmg', x: 5 }, { k: 'comboHit', x: 1 }], up: { ops: [{ k: 'dmg', x: 7 }, { k: 'comboHit', x: 1 }] } },
  { id: 'weak_pierce', name: '弱点突刺', type: 'atk', rarity: 'R', cost: 0, captain: null,
    ops: [{ k: 'dmg', x: 4 }, { k: 'if', cond: { enemyStatus: 'vulnerable' }, then: [{ k: 'dmg', x: 6 }] }],
    up: { ops: [{ k: 'dmg', x: 6 }, { k: 'if', cond: { enemyStatus: 'vulnerable' }, then: [{ k: 'dmg', x: 6 }] }] } },
  { id: 'reckless_charge', name: '亡命冲锋', type: 'atk', rarity: 'R', cost: 1, captain: null,
    ops: [{ k: 'dmg', x: 11 }, { k: 'selfDmg', x: 3 }], up: { ops: [{ k: 'dmg', x: 14 }, { k: 'selfDmg', x: 3 }] } },
  { id: 'taunt_blade', name: '挑衅刀法', type: 'atk', rarity: 'R', cost: 1, captain: null,
    ops: [{ k: 'dmg', x: 6 }, { k: 'weak', n: 2 }], up: { ops: [{ k: 'dmg', x: 8 }, { k: 'weak', n: 2 }] } },
  { id: 'anchor_smash', name: '重锚击', type: 'atk', rarity: 'S', cost: 2, captain: null,
    ops: [{ k: 'dmg', x: 13 }], up: { ops: [{ k: 'dmg', x: 17 }] } },
  { id: 'armor_pierce', name: '破甲突刺', type: 'atk', rarity: 'S', cost: 2, captain: null,
    ops: [{ k: 'dmg', x: 9 }, { k: 'vulnerable', n: 2 }], up: { ops: [{ k: 'dmg', x: 12 }, { k: 'vulnerable', n: 2 }] } },
  { id: 'triple_slash', name: '三连斩', type: 'atk', rarity: 'S', cost: 2, captain: null,
    ops: [{ k: 'multi', times: 3, x: 6 }], up: { ops: [{ k: 'multi', times: 3, x: 8 }] } },
  { id: 'finishing_blow', name: '乘胜追击', type: 'atk', rarity: 'S', cost: 1, captain: null,
    ops: [{ k: 'dmg', x: 8 }, { k: 'if', cond: { enemyHpBelowPct: 30 }, then: [{ k: 'dmg', x: 8 }] }],
    up: { ops: [{ k: 'dmg', x: 10 }, { k: 'if', cond: { enemyHpBelowPct: 30 }, then: [{ k: 'dmg', x: 10 }] }] } },
  { id: 'fire_round', name: '燃烧炮弹', type: 'atk', rarity: 'S', cost: 2, captain: null, keywords: ['消耗'],
    ops: [{ k: 'dmg', x: 10 }, { k: 'exhaustSelf' }], up: { ops: [{ k: 'dmg', x: 14 }, { k: 'exhaustSelf' }] } },
  { id: 'storm_edge', name: '暴风圈', type: 'atk', rarity: 'E', cost: 2, captain: null,
    ops: [{ k: 'dmg', x: 9 }, { k: 'dmgMinions', x: 9 }], up: { ops: [{ k: 'dmg', x: 12 }, { k: 'dmgMinions', x: 12 }] } },
  { id: 'full_sail', name: '满帆强袭', type: 'atk', rarity: 'E', cost: 3, captain: null,
    ops: [{ k: 'dmg', x: 20 }], up: { ops: [{ k: 'dmg', x: 26 }] } },
  { id: 'flagship_barrage', name: '王牌·旗舰炮', type: 'finisher', rarity: 'E', cost: 4, captain: null, keywords: ['消耗'],
    ops: [{ k: 'multi', times: 3, x: 10 }, { k: 'exhaustSelf' }], up: { ops: [{ k: 'multi', times: 3, x: 12 }, { k: 'exhaustSelf' }] } },
  { id: 'blood_moon', name: '王牌·血月血战', type: 'finisher', rarity: 'E', cost: 3, captain: null, keywords: ['连击', '消耗'],
    ops: [{ k: 'dmg', x: 8 }, { k: 'comboHit', x: 2 }, { k: 'exhaustSelf' }],
    up: { ops: [{ k: 'dmg', x: 10 }, { k: 'comboHit', x: 2 }, { k: 'exhaustSelf' }] } },

  // ===== 通用防御 7 =====
  { id: 'tide_guard', name: '汐声格挡', type: 'def', rarity: 'R', cost: 1, captain: null,
    ops: [{ k: 'block', x: 6 }], up: { ops: [{ k: 'block', x: 8 }] } },
  { id: 'quick_fix', name: '应急修补', type: 'def', rarity: 'R', cost: 0, captain: null, keywords: ['消耗'],
    ops: [{ k: 'block', x: 4 }, { k: 'exhaustSelf' }], up: { ops: [{ k: 'block', x: 5 }, { k: 'exhaustSelf' }] } },
  { id: 'deep_breath', name: '深呼吸', type: 'def', rarity: 'R', cost: 1, captain: null,
    ops: [{ k: 'block', x: 4 }, { k: 'draw', n: 1 }], up: { ops: [{ k: 'block', x: 6 }, { k: 'draw', n: 1 }] } },
  { id: 'ready_up', name: '备战', type: 'def', rarity: 'R', cost: 0, captain: null,
    ops: [{ k: 'block', x: 3 }, { k: 'resolve', n: 1 }], up: { ops: [{ k: 'block', x: 4 }, { k: 'resolve', n: 1 }] } },
  { id: 'counter_stance', name: '反击架势', type: 'def', rarity: 'S', cost: 1, captain: null,
    ops: [{ k: 'block', x: 5 }, { k: 'thorns', n: 6 }], up: { ops: [{ k: 'block', x: 7 }, { k: 'thorns', n: 6 }] } },
  { id: 'iron_wall', name: '铁壁阵', type: 'def', rarity: 'S', cost: 2, captain: null,
    ops: [{ k: 'block', x: 13 }], up: { ops: [{ k: 'block', x: 17 }] } },
  { id: 'unbroken_barricade', name: '不屈壁垒', type: 'def', rarity: 'E', cost: 2, captain: null,
    ops: [{ k: 'block', x: 10 }, { k: 'if', cond: { myHpBelowPct: 50 }, then: [{ k: 'block', x: 8 }] }],
    up: { ops: [{ k: 'block', x: 13 }, { k: 'if', cond: { myHpBelowPct: 50 }, then: [{ k: 'block', x: 8 }] }] } },

  // ===== 通用技巧 8 =====
  { id: 'stargaze', name: '观星', type: 'skill', rarity: 'R', cost: 1, captain: null,
    ops: [{ k: 'draw', n: 2 }], up: { ops: [{ k: 'draw', n: 3 }] } },
  { id: 'supplies', name: '应急物资', type: 'skill', rarity: 'R', cost: 1, captain: null,
    ops: [{ k: 'draw', n: 1 }, { k: 'resolve', n: 1 }], up: { ops: [{ k: 'draw', n: 2 }, { k: 'resolve', n: 1 }] } },
  { id: 'drop_ballast', name: '抛弃压舱石', type: 'skill', rarity: 'R', cost: 0, captain: null,
    ops: [{ k: 'discardRandom', n: 1 }, { k: 'draw', n: 2 }], up: { ops: [{ k: 'discardRandom', n: 1 }, { k: 'draw', n: 3 }] } },
  { id: 'loot', name: '缴获战利品', type: 'skill', rarity: 'R', cost: 0, captain: null, keywords: ['消耗'],
    ops: [{ k: 'gold', n: 15 }, { k: 'exhaustSelf' }], up: { ops: [{ k: 'gold', n: 25 }, { k: 'exhaustSelf' }] } },
  { id: 'chart_course', name: '航线规划', type: 'skill', rarity: 'S', cost: 1, captain: null,
    ops: [{ k: 'draw', n: 1 }, { k: 'energy', n: 1 }], up: { ops: [{ k: 'draw', n: 2 }, { k: 'energy', n: 1 }] } },
  { id: 'tactic_mind', name: '战术演算', type: 'skill', rarity: 'S', cost: 1, captain: null, keywords: ['消耗'],
    ops: [{ k: 'costDownNext', n: 2 }, { k: 'exhaustSelf' }],
    up: { ops: [{ k: 'costDownNext', n: 2 }] } },
  { id: 'war_feast', name: '以战养战', type: 'skill', rarity: 'S', cost: 1, captain: null,
    ops: [{ k: 'resolve', n: 3 }], up: { ops: [{ k: 'resolve', n: 5 }] } },
  { id: 'all_ready', name: '全面备战', type: 'skill', rarity: 'E', cost: 1, captain: null,
    ops: [{ k: 'draw', n: 1 }, { k: 'resolve', n: 3 }], up: { ops: [{ k: 'draw', n: 2 }, { k: 'resolve', n: 3 }] } },

  // ===== 伙伴 5（栏上限 3）=====
  { id: 'gunner_mate', name: '见习炮手', type: 'mate', rarity: 'R', cost: 2, captain: null,
    ops: [{ k: 'summon', mate: 'gunner' }], up: { ops: [{ k: 'summon', mate: 'gunnerPlus' }] } },
  { id: 'crow_mate', name: '望风哨兵', type: 'mate', rarity: 'R', cost: 1, captain: null,
    ops: [{ k: 'summon', mate: 'crow' }], up: { ops: [{ k: 'summon', mate: 'crowPlus' }] } },
  { id: 'med_mate', name: '随船医生', type: 'mate', rarity: 'S', cost: 2, captain: null,
    ops: [{ k: 'summon', mate: 'med' }], up: { ops: [{ k: 'summon', mate: 'medPlus' }] } },
  { id: 'boy_mate', name: '甲板鼓手', type: 'mate', rarity: 'S', cost: 2, captain: null,
    ops: [{ k: 'summon', mate: 'boy' }], up: { ops: [{ k: 'summon', mate: 'boyPlus' }] } },
  { id: 'helm_mate', name: '老练舵手', type: 'mate', rarity: 'E', cost: 3, captain: null,
    ops: [{ k: 'summon', mate: 'helm' }], up: { ops: [{ k: 'summon', mate: 'helmPlus' }] } },

  // ===== 终结技补充（最终航路）=====
  { id: 'final_passage', name: '王牌·最终航路', type: 'finisher', rarity: 'E', cost: 5, captain: null, keywords: ['消耗'],
    ops: [{ k: 'dmg', x: 30 }, { k: 'draw', n: 2 }, { k: 'dmgPerResolve', x: 2 }, { k: 'drainResolve' }, { k: 'exhaustSelf' }],
    up: { ops: [{ k: 'dmg', x: 36 }, { k: 'draw', n: 2 }, { k: 'dmgPerResolve', x: 2 }, { k: 'drainResolve' }, { k: 'exhaustSelf' }] } },

  // ===== 热血船长·加兰专属 4 =====
  { id: 'ignite', name: '点燃', type: 'atk', rarity: 'R', cost: 1, captain: 'garan',
    ops: [{ k: 'dmg', x: 5 }, { k: 'resolve', n: 2 }], up: { ops: [{ k: 'dmg', x: 7 }, { k: 'resolve', n: 2 }] } },
  { id: 'fury_roar', name: '怒涛怒吼', type: 'skill', rarity: 'S', cost: 1, captain: 'garan', keywords: ['消耗'],
    ops: [{ k: 'atkBuffTurn', n: 3 }, { k: 'exhaustSelf' }], up: { ops: [{ k: 'atkBuffTurn', n: 4 }, { k: 'exhaustSelf' }] } },
  { id: 'fist_flurry', name: '双拳乱舞', type: 'atk', rarity: 'S', cost: 2, captain: 'garan',
    ops: [{ k: 'dmgPerCombo', x: 4 }], up: { ops: [{ k: 'dmgPerCombo', x: 5 }] } },
  { id: 'king_of_sea', name: '海上王者', type: 'atk', rarity: 'E', cost: 2, captain: 'garan', keywords: ['蓄力'],
    ops: [{ k: 'dmg', x: 12 }, { k: 'if', cond: { resolveGte: 6 }, then: [{ k: 'dmg', x: 6 }, { k: 'resolve', n: 6 }] }],
    up: { ops: [{ k: 'dmg', x: 16 }, { k: 'if', cond: { resolveGte: 6 }, then: [{ k: 'dmg', x: 6 }, { k: 'resolve', n: 6 }] }] } },

  // ===== 策略航海士·塞拉专属 4 =====
  { id: 'intel_net', name: '情报网', type: 'skill', rarity: 'R', cost: 1, captain: 'sela',
    ops: [{ k: 'draw', n: 2 }, { k: 'discardRandom', n: 1 }], up: { ops: [{ k: 'draw', n: 3 }, { k: 'discardRandom', n: 1 }] } },
  { id: 'perfect_calc', name: '完美计算', type: 'skill', rarity: 'S', cost: 0, captain: 'sela', keywords: ['消耗'],
    ops: [{ k: 'costDownHand', n: 1 }, { k: 'exhaustSelf' }], up: { ops: [{ k: 'costDownHand', n: 1 }] } },
  { id: 'copy_route', name: '复制航线', type: 'skill', rarity: 'S', cost: 2, captain: 'sela',
    ops: [{ k: 'fetchTop' }], up: { ops: [{ k: 'fetchTop' }, { k: 'draw', n: 1 }] } },
  { id: 'celestial_budget', name: '天象预算', type: 'skill', rarity: 'E', cost: 1, captain: 'sela', keywords: ['蓄力', '保留'],
    ops: [{ k: 'energy', n: 2 }, { k: 'draw', n: 2 }, { k: 'if', cond: { resolveGte: 5 }, then: [{ k: 'energy', n: 1 }] }],
    up: { ops: [{ k: 'energy', n: 3 }, { k: 'draw', n: 2 }] } },

  // ===== 坚韧剑士·铁真专属 4 =====
  { id: 'shield_blade', name: '剑盾合璧', type: 'atk', rarity: 'R', cost: 1, captain: 'tie',
    ops: [{ k: 'dmg', x: 5 }, { k: 'block', x: 5 }], up: { ops: [{ k: 'dmg', x: 7 }, { k: 'block', x: 6 }] } },
  { id: 'mountain_stance', name: '不动如山', type: 'def', rarity: 'S', cost: 1, captain: 'tie',
    ops: [{ k: 'block', x: 8 }, { k: 'thorns', n: 4 }], up: { ops: [{ k: 'block', x: 11 }, { k: 'thorns', n: 4 }] } },
  { id: 'charge_slash', name: '蓄力斩', type: 'atk', rarity: 'S', cost: 2, captain: 'tie', keywords: ['蓄力'],
    ops: [{ k: 'dmg', x: 8 }, { k: 'if', cond: { resolveGte: 5 }, then: [{ k: 'dmg', x: 10 }] }],
    up: { ops: [{ k: 'dmg', x: 8 }, { k: 'if', cond: { resolveGte: 5 }, then: [{ k: 'dmg', x: 14 }] }] } },
  { id: 'shield_rend', name: '以盾还刃', type: 'atk', rarity: 'E', cost: 2, captain: 'tie',
    ops: [{ k: 'dmgEqualBlock', mult: 1 }], up: { ops: [{ k: 'dmgEqualBlock', mult: 1.5 }] } },
];

// 战斗内兜底生成卡（双堆空+手空时每回合自动入手 1 张）
export const EMERGENCY_CARD = { id: 'emergency_knife', name: '应急短刀', type: 'atk', rarity: 'R', cost: 0,
  keywords: ['消耗'], ops: [{ k: 'dmg', x: 4 }, { k: 'block', x: 4 }, { k: 'exhaustSelf' }] };

// 伙伴定义（召唤物实体，非手牌卡）
export const MATES = {
  gunner: { id: 'gunner', name: '见习炮手', hp: 10, onTurnEnd: { k: 'dmg', x: 4 } },
  gunnerPlus: { id: 'gunnerPlus', name: '见习炮手+', hp: 14, onTurnEnd: { k: 'dmg', x: 6 } },
  crow: { id: 'crow', name: '望风哨兵', hp: 8, buffFirstAtk: 2 },
  crowPlus: { id: 'crowPlus', name: '望风哨兵+', hp: 10, buffFirstAtk: 3 },
  med: { id: 'med', name: '随船医生', hp: 12, onTurnEnd: { k: 'heal', x: 3 } },
  medPlus: { id: 'medPlus', name: '随船医生+', hp: 12, onTurnEnd: { k: 'heal', x: 5 } },
  boy: { id: 'boy', name: '甲板鼓手', hp: 9, onTurnEnd: { k: 'resolve', n: 1 } },
  boyPlus: { id: 'boyPlus', name: '甲板鼓手+', hp: 9, onTurnEnd: { k: 'resolve', n: 2 } },
  helm: { id: 'helm', name: '老练舵手', hp: 14, onSummon: { k: 'block', x: 10 }, onTurnEnd: { k: 'block', x: 4 } },
  helmPlus: { id: 'helmPlus', name: '老练舵手+', hp: 18, onSummon: { k: 'block', x: 10 }, onTurnEnd: { k: 'block', x: 5 } },
};

export const byId = (id) => CARDS.find((c) => c.id === id) || null;
// 实例化卡组条目：{ id, upgraded } → 完整定义（强化版合并）
export function resolveCard(entry) {
  const base = byId(entry.id) || (entry.id === 'emergency_knife' ? EMERGENCY_CARD : null);
  if (!base) return null;
  if (!entry.upgraded) return { ...base };
  return { ...base, ...(base.up || {}), name: base.name + '+', upgraded: true };
}
