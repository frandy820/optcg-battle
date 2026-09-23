// 船长数据（3 名原创）——docs/02-game-design.md §8 真值源
// passive/斗志技 钩子由 engine/battle.js 在对应时点调用（钩子名即结算点，禁止 UI 实现效果）
export const CAPTAINS = [
  {
    id: 'garan', name: '加兰·红帆', title: '热血船长', hp: 74, color: '#e2543e',
    difficulty: 1, audience: '想爽快砍杀、越打越燃的玩家',
    passive: { k: 'firstAtkBonus', x: 4, desc: '每回合首张攻击卡 +4 伤' },
    skills: [
      { cost: 3, name: '战意沸腾', oncePerTurn: true, ops: [{ k: 'comboAdd', n: 3 }], desc: '本回合连击计数 +3' },
      { cost: 7, name: '全面强袭', oncePerTurn: true, ops: [{ k: 'atkBuffTurn', n: 4 }], desc: '本回合攻击卡全部 +4 伤' },
    ],
    starterDeck: ['sailor_slash', 'sailor_slash', 'sailor_slash', 'sailor_slash', 'tide_guard', 'tide_guard', 'tide_guard', 'ignite', 'ignite', 'fire_round'],
  },
  {
    id: 'sela', name: '塞拉·星图', title: '策略航海士', hp: 60, color: '#4d9bd6',
    difficulty: 2, audience: '喜欢抽牌规划、资源链的玩家',
    passive: { k: 'firstSkillDraw', x: 1, desc: '每回合首张技巧卡抽 1' },
    skills: [
      { cost: 3, name: '灵光一闪', oncePerTurn: true, ops: [{ k: 'costDownNext', n: 2 }], desc: '本回合下一张卡费用 -2' },
      { cost: 7, name: '运筹帷幄', oncePerTurn: true, ops: [{ k: 'costDownHand', n: 1 }], desc: '本回合手牌费用全部 -1' },
    ],
    starterDeck: ['sailor_slash', 'sailor_slash', 'sailor_slash', 'sailor_slash', 'tide_guard', 'tide_guard', 'tide_guard', 'stargaze', 'stargaze', 'chart_course'],
  },
  {
    id: 'tie', name: '铁真·浪脊', title: '坚韧剑士', hp: 80, color: '#5aa878',
    difficulty: 2, audience: '想稳扎稳打、以守转攻的玩家',
    passive: { k: 'guardStart', x: 4, desc: '回合开始若上回合未受击，+4 盾' },
    skills: [
      { cost: 3, name: '铁壁', oncePerTurn: true, ops: [{ k: 'block', x: 8 }, { k: 'thorns', n: 6 }], desc: '+8 盾并获反甲 6（本回合）' },
      { cost: 7, name: '以盾还刃', oncePerTurn: true, ops: [{ k: 'dmgEqualBlock', mult: 0.75 }], desc: '对敌造成当前护盾 75% 的伤害' },
    ],
    starterDeck: ['sailor_slash', 'sailor_slash', 'sailor_slash', 'sailor_slash', 'tide_guard', 'tide_guard', 'tide_guard', 'tide_guard', 'shield_blade', 'charge_slash'],
  },
];

export const captainById = (id) => CAPTAINS.find((c) => c.id === id) || null;
