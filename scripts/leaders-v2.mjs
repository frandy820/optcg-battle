// 船长分化 v2 一次性迁移：life 4/5/6 三档 × 技能负相关（低血多技能，高血少技能）
// 运行一次后即完成数据迁移；重复运行幂等（按 id 整卡替换）。
// 技能结构 skills:[{name,desc,hook,op,cond?,oncePerTurn?}]——UI 展示与引擎执行同源。
import { readFileSync, writeFileSync } from 'node:fs';

const data = JSON.parse(readFileSync('./data/cards.json', 'utf8'));

// 觉醒线统一：LP ≤ 4000（=life5 剩 2 命）触发
const AWAKEN = { lpMax: 4000 };

const v2 = [
  // ===== life 4（LP 8000，3 技：2 主技 + 1 残血觉醒）=====
  {
    id: 'LEADER-PURPLE', name: '特拉法尔加·罗', sub: '死之外科医生', type: 'leader', color: 'purple',
    power: 5000, life: 4, keywords: [], art: 'captains/law', fruit: 'paramecia',
    skills: [
      { name: '手术果实·麻醉枪', desc: '船长攻击宣告时：横置对方战力最高的角色（ROOM 内点穴麻醉）', hook: 'whenAttacking', op: { k: 'restEnemy', target: 'strongest' } },
      { name: 'ROOM·回收', desc: '击沉对方角色时抽 1 张（仅船长发起的击沉）', hook: 'onKill', op: { k: 'draw', n: 1, reqAttacker: 'leader' } },
      { name: '觉醒·死之外科医生', desc: 'LP≤4000 时：船长攻击宣言时本次战斗战力 +2000', hook: 'whenAttacking', op: { k: 'powerSelf', x: 2000, until: 'battle' }, cond: AWAKEN },
    ],
  },
  {
    id: 'LEADER-PURPLE2', name: '唐吉诃德·多弗朗明戈', sub: '天夜叉', type: 'leader', color: 'purple',
    power: 5000, life: 4, keywords: [], art: 'captains/doflamingo', fruit: 'paramecia',
    skills: [
      { name: '天夜叉的情报网', desc: '我方回合开始时抽 1 张牌', hook: 'onTurnStart', op: { k: 'draw', n: 1 } },
      { name: '寄生线', desc: '船长攻击宣告时：对方全体角色本次战斗战力 -1000', hook: 'whenAttacking', op: { k: 'debuffFoeAll', x: 1000, until: 'battle' } },
      { name: '觉醒·鸟笼', desc: 'LP≤4000 时：我方回合开始额外获得 1 张贝里（每回合 1 次）', hook: 'onTurnStart', op: { k: 'gainDon', n: 1 }, cond: AWAKEN, oncePerTurn: true },
    ],
  },
  {
    id: 'LEADER-YELLOW2', name: '波雅·汉库珂', sub: '蛇姬', type: 'leader', color: 'yellow',
    power: 5000, life: 4, keywords: [], art: 'captains/hancock', fruit: 'paramecia',
    skills: [
      { name: '虏之箭', desc: '船长攻击宣告时：横置对方战力最高的角色（甜美魅惑·石化）', hook: 'whenAttacking', op: { k: 'restEnemy', target: 'strongest' } },
      { name: '霸王色的魅力', desc: '己方单位被攻击时：船长本次战斗战力 +1000（每回合 1 次）', hook: 'whenAttacked', op: { k: 'powerLeader', x: 1000, until: 'battle' }, oncePerTurn: true },
      { name: '觉醒·蛇姬之怒', desc: 'LP≤4000 时：船长攻击宣告时对方 LP 直接伤害 1000', hook: 'whenAttacking', op: { k: 'damageLP', x: 1000 }, cond: AWAKEN },
    ],
  },
  // ===== life 5（LP 10000，2 技：1 主技 + 1 残血觉醒）=====
  {
    id: 'LEADER-RED', name: '蒙奇·D·路飞', sub: '草帽盟主', type: 'leader', color: 'red',
    power: 5000, life: 5, keywords: [], art: 'captains/luffy', fruit: 'paramecia',
    skills: [
      { name: '橡胶橡胶·机关枪', desc: '船长攻击宣告时，本次战斗战力 +1000', hook: 'whenAttacking', op: { k: 'powerSelf', x: 1000, until: 'battle' } },
      { name: '觉醒·五档 解放战士', desc: 'LP≤4000 时：我方回合开始抽 1 张（每回合 1 次）', hook: 'onTurnStart', op: { k: 'draw', n: 1 }, cond: AWAKEN, oncePerTurn: true },
    ],
  },
  {
    id: 'LEADER-BLUE', name: '娜美', sub: '航海士', type: 'leader', color: 'blue',
    power: 5000, life: 5, keywords: [], art: 'captains/nami', fruit: null,
    skills: [
      { name: '天候棒·雷云', desc: '己方费用≥2 角色登场时抽 1 张', hook: 'onSummon', op: { k: 'draw', n: 1, minCost: 2 } },
      { name: '觉醒·Zeus 雷云', desc: 'LP≤4000 时：船长攻击宣告时对方 LP 直接伤害 1000', hook: 'whenAttacking', op: { k: 'damageLP', x: 1000 }, cond: AWAKEN },
    ],
  },
  {
    id: 'LEADER-GREEN', name: '罗罗诺亚·索隆', sub: '海贼猎人', type: 'leader', color: 'green',
    power: 5000, life: 5, keywords: [], art: 'captains/zoro', fruit: null,
    skills: [
      { name: '三刀流·鬼气', desc: '己方费用≥7 角色登场时，该角色永久战力 +1000', hook: 'onSummon', op: { k: 'powerSelf', x: 1000, minCost: 7, until: 'forever' } },
      { name: '觉醒·阿修罗 一雾银', desc: 'LP≤4000 时：船长攻击宣告时本次战斗战力 +2000', hook: 'whenAttacking', op: { k: 'powerSelf', x: 2000, until: 'battle' }, cond: AWAKEN },
    ],
  },
  {
    id: 'LEADER-YELLOW', name: '山治', sub: '黑足', type: 'leader', color: 'yellow',
    power: 5000, life: 5, keywords: [], art: 'captains/sanji', fruit: null,
    skills: [
      { name: '宴会料理', desc: '己方角色被击沉时 LP 回复 1000', hook: 'onAllyKO', op: { k: 'healLP', x: 1000 } },
      { name: '觉醒·地狱记忆', desc: 'LP≤4000 时：我方回合开始 LP 回复 1000（每回合 1 次）', hook: 'onTurnStart', op: { k: 'healLP', x: 1000 }, cond: AWAKEN, oncePerTurn: true },
    ],
  },
  {
    id: 'LEADER-RED2', name: '波特卡斯·D·艾斯', sub: '火拳', type: 'leader', color: 'red',
    power: 5000, life: 5, keywords: [], art: 'captains/ace', fruit: 'logia',
    skills: [
      { name: '火拳', desc: '船长攻击宣告时：弃 1 张手牌，本次战斗战力 +2000（手牌不足则不生效）', hook: 'whenAttacking', op: [{ k: 'discard', n: 1 }, { k: 'powerSelf', x: 2000, until: 'battle' }] },
      { name: '觉醒·炎帝', desc: 'LP≤4000 时：船长攻击宣告时对方 LP 直接伤害 1000', hook: 'whenAttacking', op: { k: 'damageLP', x: 1000 }, cond: AWAKEN },
    ],
  },
  {
    id: 'LEADER-BLUE2', name: '妮可·罗宾', sub: '恶魔之子', type: 'leader', color: 'blue',
    power: 5000, life: 5, keywords: [], art: 'captains/robin', fruit: 'paramecia',
    skills: [
      { name: '百花缭乱', desc: '己方费用≥4 角色登场时抽 1 张', hook: 'onSummon', op: { k: 'draw', n: 1, minCost: 4 } },
      { name: '觉醒·万手压制', desc: 'LP≤4000 时：船长攻击宣告时横置对方战力最低的角色', hook: 'whenAttacking', op: { k: 'restEnemy', target: 'weakest' }, cond: AWAKEN },
    ],
  },
  // ===== life 6（LP 12000，1 条件技——高血量技能最少）=====
  {
    id: 'LEADER-GREEN2', name: '凯多', sub: '最强生物', type: 'leader', color: 'green',
    power: 5000, life: 6, keywords: [], art: 'captains/kaido', fruit: 'zoan',
    skills: [
      { name: '雷鸣八卦', desc: '击沉对方角色时：对方 LP 额外伤害 1000（每回合 1 次）', hook: 'onKill', op: { k: 'damageLP', x: 1000 }, oncePerTurn: true },
    ],
  },
  {
    id: 'LEADER-BLACK', name: '香克斯', sub: '红发', type: 'leader', color: 'black',
    power: 5000, life: 6, keywords: [], art: 'captains/shanks', fruit: null,
    skills: [
      { name: '霸王色的威压', desc: '船长攻击宣告时：对方全体角色本次战斗战力 -1000', hook: 'whenAttacking', op: { k: 'debuffFoeAll', x: 1000, until: 'battle' } },
    ],
  },
  {
    id: 'LEADER-BLACK2', name: '乔拉可尔·米霍克', sub: '鹰眼', type: 'leader', color: 'black',
    power: 5000, life: 6, keywords: [], art: 'captains/mihawk', fruit: null,
    skills: [
      { name: '黑刀·一骑讨', desc: '对方场上角色≤1 时：船长攻击宣告时本次战斗战力 +2000', hook: 'whenAttacking', op: { k: 'powerSelf', x: 2000, until: 'battle' }, cond: { foeBoardMax: 1 } },
    ],
  },
];

// 按 id 整卡替换（保留 v1 的 sub/art 字段如上重写；幂等）
const byId = new Map(v2.map(l => [l.id, l]));
let replaced = 0;
data.leaders = data.leaders.map(l => {
  const n = byId.get(l.id);
  if (!n) return l;
  replaced++;
  return n;
});
if (replaced !== 12) { console.error(`FAIL 只替换 ${replaced}/12`); process.exit(1); }

data.meta.pack = 'v2.0 船长分化：LP 三档（8000/10000/12000）× 技能负相关 + 残血觉醒线（2026-09-20）';
data.meta.version = '0.4.0';

writeFileSync('./data/cards.json', JSON.stringify(data, null, 1) + '\n', 'utf8');
console.log('OK 12 船长已迁移 v2：life4×3技 / life5×2技 / life6×1技');
console.log('分布:', v2.map(l => `${l.name.slice(-2)}${l.life}命${l.skills.length}技`).join(' '));
