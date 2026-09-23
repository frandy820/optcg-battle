// 敌人数据（6+Boss）与意图动作表——docs/02-game-design.md §7 真值源
// acts: 意图动作池（weightedPick 抽取；cond 不满足的动作被过滤）
// 动作算子: atk{x|perMinion,times} / block{x} / weak{n} / vulnerable{n} / charge{x,turns}(蓄力缓冲,
//   下一意图必为蓄力技) / summon{mate,hp} / atkBuff{n} / clearPlayerBlock / enrage（阶段切换专用演出）
export const ENEMIES = [
  {
    id: 'patrol', name: '海军巡查兵', icon: '🎖', hp: 28, tier: 'normal',
    acts: [
      { k: 'atk', x: 7, weight: 50 },
      { k: 'block', x: 5, weight: 20 },
      { k: 'charged_atk', x: 12, weight: 30 }, // 抽中时：本意图显示⚡蓄力，下回合执行攻12
    ],
  },
  {
    id: 'drunk_blade', name: '醉酒刀客', icon: '🍶', hp: 32, tier: 'normal',
    acts: [
      { k: 'block_thorns', x: 6, thorns: 5, weight: 40 },
      { k: 'atk', x: 9, weight: 40 },
      { k: 'weak', n: 2, weight: 20 },
    ],
  },
  {
    id: 'tide_mage', name: '潮汐术士', icon: '🌀', hp: 30, tier: 'normal',
    acts: [
      { k: 'vulnerable', n: 2, weight: 35 },
      { k: 'atk', x: 5, weight: 35 },
      { k: 'weak_atk', weak: 1, x: 4, weight: 30 },
    ],
  },
  {
    id: 'swamp_croc', name: '沼泽巨鳄', icon: '🐊', hp: 36, tier: 'normal',
    acts: [
      { k: 'charged_atk', x: 18, weight: 40 },
      { k: 'atk', x: 6, weight: 40 },
      { k: 'block', x: 4, weight: 20 },
    ],
  },
  {
    id: 'deck_thug', name: '甲板狂徒', icon: '🔪', hp: 34, tier: 'normal',
    acts: [
      { k: 'summon', mate: 'thug_lad', mateHp: 6, weight: 30, cond: { minionsLt: 2 } },
      { k: 'atk_per_minion', x: 5, per: 1, weight: 40 },
      { k: 'atk', x: 8, weight: 30 },
    ],
  },
  {
    id: 'deep_hunter', name: '深海猎手', icon: '🦈', hp: 64, tier: 'elite',
    acts: [
      { k: 'atk', x: 10, weight: 35 },
      { k: 'block_thorns', x: 8, thorns: 6, weight: 25 },
      { k: 'vuln_atk', vuln: 2, x: 6, weight: 20 },
      { k: 'charged_atk', x: 22, weight: 20 },
    ],
  },
  {
    id: 'frost_admiral', name: '海军中将·霜岚', icon: '❄', hp: 150, tier: 'boss',
    acts: [
      { k: 'atk', x: 11, weight: 40 },
      { k: 'block', x: 10, weight: 20 },
      { k: 'summon', mate: 'ice_blade', mateHp: 8, weight: 20, cond: { minionsLt: 2 } },
      { k: 'vulnerable', n: 2, weight: 20 },
    ],
    // P2（HP≤50%）动作表整体替换；切换时清玩家护盾+自身攻击+2（一次性演出）
    phase2: {
      atThresholdPct: 50,
      onEnter: [{ k: 'clearPlayerBlock' }, { k: 'atkBuff', n: 2 }],
      acts: [
        { k: 'atk', x: 16, weight: 45 },
        { k: 'charged_atk', x: 22, weight: 25 },
        { k: 'vuln_weak', vuln: 2, weak: 2, weight: 30 },
      ],
    },
  },
];

// 敌方召唤物定义（与玩家伙伴同构：hp + 简单行动）
export const ENEMY_MINIONS = {
  thug_lad: { name: '狂徒小弟', icon: '🗡', hp: 6, atk: 3 },
  ice_blade: { name: '冰刃兵', icon: '🔸', hp: 8, atk: 5 },
};

export const enemyById = (id) => ENEMIES.find((e) => e.id === id) || null;
