// 领航者数据（东海篇：路飞）——docs/one-piece-lore-and-game-map.md 真值源
// 剧情模式单领航者：草帽一伙的冒险由路飞领航。
// 「未出航」预告槽由 UI 层渲染（西尔巴兹·雷利?否——后续版本：阿拉巴斯坦篇/自由模式）。
export const CAPTAINS = [
  {
    id: 'luffy', name: '蒙奇·D·路飞', title: '草帽', sub: '要成为海贼王的男人',
    hp: 80, color: '#e2543e', difficulty: 1, faction: 'strawhat',
    audience: '橡胶果实能力者：挨得住打、越挫越勇',
    passive: { k: 'lastStand', pct: 30, x: 3, desc: 'HP 低于 30% 时攻击 +3（无论倒下多少次都会站起来）' },
    skills: [
      { cost: 3, name: '橡胶机关枪', oncePerTurn: true,
        ops: [{ k: 'multi', times: 3, x: 4 }],
        desc: '三段快拳连打（共 12 伤）' },
      { cost: 7, name: '橡胶战斧', oncePerTurn: true,
        ops: [{ k: 'dmg', x: 16 }, { k: 'dmgMinions', x: 16 }],
        desc: '一脚踩碎战场：重创敌人及其全部杂兵（拆 Arlong Park 的那一脚）' },
    ],
    starterDeck: ['gum_gum_pistol', 'gum_gum_pistol', 'gum_gum_pistol', 'gum_gum_pistol',
      'gum_gum_balloon', 'gum_gum_balloon', 'gum_gum_balloon',
      'gum_gum_whip', 'gum_gum_whip', 'gum_gum_rocket'],
  },
];

// 预告槽（不可选）：给玩家「后续会有更多航线」的预期，不承诺时间
export const CAPTAIN_TEASERS = [
  { name: '？？？', title: '伟大航路篇', desc: '通过东海篇后解锁预告（后续版本）' },
  { name: '？？？', title: '自由对战（构想）', desc: '跨篇章混战模式，与剧情模式分开（后续版本）' },
];

export const captainById = (id) => CAPTAINS.find((c) => c.id === id) || null;
