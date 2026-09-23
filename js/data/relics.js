// 遗物数据（6）——docs/02-game-design.md §10
// hook 钩子由 engine/battle.js 与 game/run.js 调用
export const RELICS = [
  { id: 'warblade', name: '破军之刃', desc: '每场战斗第 1 回合，攻击卡伤害 +4', hook: 'firstTurnAtk', x: 4 },
  { id: 'seamap', name: '海图残页', desc: '每回合开始多抽 1 张牌', hook: 'drawPerTurn', x: 1 },
  { id: 'medbadge', name: '船医徽章', desc: '每场战斗胜利后回复 8 HP', hook: 'healOnWin', x: 8 },
  { id: 'tidecharm', name: '怒涛护符', desc: '斗志获取 +1（上限仍为 10）', hook: 'resolveBonus', x: 1 },
  { id: 'revenge_flask', name: '复仇酒瓶', desc: '受到致命伤害时免死并保留 1 HP（每局一次）', hook: 'deathSave' },
  { id: 'golden_compass', name: '黄金罗盘', desc: '金币获取 +50%', hook: 'goldBonus', x: 0.5 },
];

export const relicById = (id) => RELICS.find((r) => r.id === id) || null;
