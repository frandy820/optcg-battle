// 敌人数据（东海篇 9 敌 + 5 召唤物）——docs/one-piece-lore-and-game-map.md 真值源
// acts: 意图动作池（weightedPick 抽取；cond 不满足的动作被过滤）
// 动作算子: atk{x,times} / block{x} / block_thorns{x,thorns} / weak{n} / vulnerable{n} /
//   charged_atk{x} / summon{mate,hp} / atkBuff{n} / weak_atk / vuln_atk / vuln_weak
// passive: { hitReduce } 每次受击减伤 ｜ { firstHitReduce } 每回合首次受击减伤 ｜
//          { enrage: { pct, atk } } HP 低于 pct% 时攻击 +atk（阿金·鬼人觉醒）
// faction: strawhat | navy | pirate（协同与剧情判定用）
export const ENEMIES = [
  {
    id: 'alvida', name: '亚尔丽塔', icon: '🔨', hp: 26, tier: 'normal', faction: 'pirate',
    sub: '滑溜溜果实', arc: 1,
    passive: { hitReduce: 1 }, // 滑溜溜果实：攻击会滑开
    acts: [
      { k: 'atk', x: 6, weight: 55 },
      { k: 'block', x: 5, weight: 25 },
      { k: 'atk', x: 4, times: 2, weight: 20 }, // 铁棒乱抡
    ],
  },
  {
    id: 'morgan', name: '斧手蒙卡', icon: '🪓', hp: 32, tier: 'normal', faction: 'navy',
    sub: '海军153支部上校', arc: 1,
    acts: [
      { k: 'atk', x: 8, weight: 45 }, // 斧击
      { k: 'charged_atk', x: 14, weight: 30 }, // 「铁腕」蓄力重斧
      { k: 'atkBuff', n: 2, weight: 25 }, // 自我崇拜：给自己加攻
    ],
  },
  {
    id: 'buggy', name: '小丑巴基', icon: '🤡', hp: 36, tier: 'normal', faction: 'pirate',
    sub: '四分五裂果实·巴基海贼团船长', arc: 1,
    passive: { firstHitReduce: 3 }, // 四分五裂：每回合首次攻击打不实
    acts: [
      { k: 'atk', x: 7, weight: 35 }, // 巴基炸弹
      { k: 'summon', mate: 'cabbage', mateHp: 6, weight: 30, cond: { minionsLt: 2 } }, // 召唤卡巴吉/摩迪
      { k: 'charged_atk', x: 13, weight: 35 }, // 巴基火箭弹
    ],
  },
  {
    id: 'kuro', name: '克洛船长', icon: '🐈‍⬛', hp: 58, tier: 'elite', faction: 'pirate',
    sub: '黑猫海贼团·掠影', arc: 2,
    acts: [
      { k: 'atk', x: 3, times: 3, weight: 40 }, // 掠影：无声高频连击
      { k: 'summon', mate: 'jango', mateHp: 8, weight: 25, cond: { minionsLt: 2 } }, // 赞高催眠
      { k: 'charged_atk', x: 16, weight: 35 }, // 「三年计划」收割
    ],
  },
  {
    id: 'krieg', name: '顿·克利克', icon: '💣', hp: 64, tier: 'elite', faction: 'pirate',
    sub: '克利克舰队提督·无敌舰队', arc: 2,
    acts: [
      { k: 'block_thorns', x: 9, thorns: 5, weight: 30 }, // 铁甲护身
      { k: 'vuln_weak', vuln: 2, weak: 2, weight: 25 }, // 毒气弹（MH5）
      { k: 'summon', mate: 'gin', mateHp: 12, weight: 20, cond: { minionsLt: 2 } }, // 召唤鬼人阿金
      { k: 'charged_atk', x: 20, weight: 25 }, // 大战矛·蓄力
    ],
  },
  {
    id: 'arlong', name: '锯齿阿龙', icon: '🦈', hp: 118, tier: 'boss', faction: 'pirate',
    sub: '鱼人海贼团船长·鲨鱼锯', arc: 2,
    acts: [
      { k: 'atk', x: 11, weight: 35 }, // 鲨鱼锯
      { k: 'summon', mate: 'hachi', mateHp: 9, weight: 25, cond: { minionsLt: 2 } }, // 召唤小八/黑带
      { k: 'vuln_atk', vuln: 2, x: 8, weight: 20 }, // 「你们只是人类」
      { k: 'charged_atk', x: 22, weight: 20 }, // 鲨鱼 ON DARTS
    ],
    // P2（HP≤50%）：狂怒——「你们对娜美做了什么」
    phase2: {
      atThresholdPct: 50,
      onEnter: [{ k: 'clearPlayerBlock' }, { k: 'atkBuff', n: 3 }],
      acts: [
        { k: 'atk', x: 14, weight: 40 },
        { k: 'atk', x: 5, times: 3, weight: 30 }, // 狂怒乱锯
        { k: 'summon', mate: 'kuroobi', mateHp: 9, weight: 30, cond: { minionsLt: 2 } },
      ],
    },
  },
  {
    id: 'smoker', name: '白猎人斯摩格', icon: '💨', hp: 148, tier: 'boss', faction: 'navy',
    sub: '海军本部上校·冒烟果实', arc: 3,
    passive: { firstHitReduce: 3 }, // 白雾：每回合首次攻击在烟雾中落空一部分
    acts: [
      { k: 'atk', x: 12, weight: 35 }, // 白色疾风
      { k: 'vuln_weak', vuln: 2, weak: 2, weight: 25 }, // 烟幕
      { k: 'block', x: 10, weight: 15 },
      { k: 'summon', mate: 'marine', mateHp: 8, weight: 25, cond: { minionsLt: 2 } }, // 召唤海军士兵
    ],
    // P2（HP≤50%）：海楼石十手——无视护盾的追击
    phase2: {
      atThresholdPct: 50,
      onEnter: [{ k: 'clearPlayerBlock' }, { k: 'atkBuff', n: 2 }],
      acts: [
        { k: 'atk', x: 16, weight: 45 }, // 海楼石十手
        { k: 'charged_atk', x: 22, weight: 25 }, // 白蛇大击
        { k: 'vuln_weak', vuln: 2, weak: 2, weight: 30 },
      ],
    },
  },
];

// 战斗外节点剧情对手（run.js ROUTE 引用）：西罗布村克洛前的赞高单独小战
// （赞高作为克洛战的召唤物出现即可，不单设节点——克制敌人数量）

// 敌方召唤物定义（与玩家伙伴同构：hp + 简单行动）
export const ENEMY_MINIONS = {
  cabbage: { name: '卡巴吉', icon: '🎪', hp: 6, atk: 3 },   // 巴基团·杂技骑士
  jango: { name: '赞高', icon: '🕶', hp: 8, atk: 4 },        // 黑猫团·催眠师
  gin: { name: '鬼人阿金', icon: '🔗', hp: 12, atk: 5 },     // 克利克舰队·鬼人
  hachi: { name: '小八', icon: '🐙', hp: 9, atk: 4 },        // 鱼人·六刀流章鱼
  kuroobi: { name: '黑带', icon: '🥋', hp: 9, atk: 5 },      // 鱼人空手道
  marine: { name: '海军士兵', icon: '🎖', hp: 8, atk: 4 },   // 斯摩格部下
};

export const enemyById = (id) => ENEMIES.find((e) => e.id === id) || null;
