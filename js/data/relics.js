// 遗物数据（6）——东海篇换名保机制：id/hook/x 与 v1.0.0 完全一致（平衡不动），只换名与文案
// docs/one-piece-restoration-plan.md §改造-遗物
export const RELICS = [
  { id: 'warblade', name: '和道一文字', desc: '每场战斗第 1 回合，攻击卡伤害 +4（古伊娜的刀，出鞘必见血）', hook: 'firstTurnAtk', x: 4 },
  { id: 'seamap', name: '娜美的航海图', desc: '每回合开始多抽 1 张牌（画下整个世界的海图）', hook: 'drawPerTurn', x: 1 },
  { id: 'medbadge', name: '梅利号的船帆', desc: '每场战斗胜利后回复 8 HP（在船上安心睡一觉）', hook: 'healOnWin', x: 8 },
  { id: 'tidecharm', name: '可可亚村的橘子', desc: '斗志获取 +1（上限仍为 10）（贝尔梅尔留下的信念）', hook: 'resolveBonus', x: 1 },
  { id: 'revenge_flask', name: '草帽', desc: '受到致命伤害时免死并保留 1 HP（每局一次）（香克斯托付的帽子，绝不能丢）', hook: 'deathSave' },
  { id: 'golden_compass', name: '巴基的宝藏', desc: '金币获取 +50%（从巴基海贼团手里抢来的战利品）', hook: 'goldBonus', x: 0.5 },
];

export const relicById = (id) => RELICS.find((r) => r.id === id) || null;
