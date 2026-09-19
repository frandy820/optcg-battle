// expand-pool-op02.mjs — OP-02 弹扩充（幂等，可重放调参）
// ① 六色各追加 1 名新船长（LEADER-<COLOR>2；技能全部走既有 hook+算子，不发明新机制）
// ② 每色 4 角色 + 1 事件共 30 张新卡（id <COLOR>-20..23 / <COLOR>-E5）
// ③ 全池按费用交错重排（默认卡组=每卡×4 取前 50，纯费用序会把高费挤出——批1 教训）
// 注意：不修改任何旧卡/旧船长数值（批1 的 expand-pool.mjs 快照已落后于 cards.json 后续手调，
//       本脚本只 upsert 新增 id；旧脚本不可再重放）
// 运行：node scripts/expand-pool-op02.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FILE = resolve(ROOT, 'data', 'cards.json');
const pool = JSON.parse(readFileSync(FILE, 'utf8'));

// ---- ① 新船长 6 名（power 为平衡杠杆，跑 balance-sim 复核后在此调）----
const LEADER2 = [
  {
    id: 'LEADER-RED2', type: 'leader', color: 'red', name: '波特卡斯·D·艾斯', sub: '火拳',
    power: 4000, life: 5, fruit: 'logia', art: 'captains/ace',
    skill: '火拳', skillDesc: '船长攻击宣告时，本次战斗战力 +2000',
    effect: { hook: 'whenAttacking', op: { k: 'powerSelf', x: 2000, until: 'battle' } },
  },
  {
    id: 'LEADER-BLUE2', type: 'leader', color: 'blue', name: '妮可·罗宾', sub: '恶魔之子',
    power: 5000, life: 5, fruit: 'paramecia', art: 'captains/robin',
    skill: '百花缭乱', skillDesc: '费用 ≥4 的己方角色登场时，抽 1 张牌',
    effect: { hook: 'onSummon', op: { k: 'draw', n: 1, minCost: 4 } },
  },
  {
    id: 'LEADER-GREEN2', type: 'leader', color: 'green', name: '凯多', sub: '百兽海贼团总督',
    power: 6000, life: 5, fruit: 'zoan', art: 'captains/kaido',
    skill: '最强生物', skillDesc: '费用 ≥5 的角色登场时，该角色永久 +2000',
    effect: { hook: 'onSummon', op: { k: 'powerSelf', x: 2000, minCost: 5, until: 'forever' } },
  },
  {
    id: 'LEADER-YELLOW2', type: 'leader', color: 'yellow', name: '波雅·汉库珂', sub: '海盗女帝',
    power: 5000, life: 5, fruit: 'paramecia', art: 'captains/hancock',
    skill: '甜美之惠', skillDesc: '己方角色被击沉时，回复 2000 积分（不超过上限）',
    effect: { hook: 'onAllyKO', op: { k: 'healLP', x: 2000 } },
  },
  {
    id: 'LEADER-PURPLE2', type: 'leader', color: 'purple', name: '唐吉诃德·多弗朗明戈', sub: '天夜叉',
    power: 4500, life: 5, fruit: 'paramecia', art: 'captains/doflamingo',
    skill: '天夜叉的情报网', skillDesc: '每回合开始时，抽 1 张牌',
    effect: { hook: 'onTurnStart', op: { k: 'draw', n: 1 } },
  },
  {
    id: 'LEADER-BLACK2', type: 'leader', color: 'black', name: '乔拉可尔·米霍克', sub: '鹰眼',
    power: 4500, life: 5, fruit: null, art: 'captains/mihawk',
    skill: '世界最强剑士', skillDesc: '船长攻击宣告时，本次战斗战力 +2000',
    effect: { hook: 'whenAttacking', op: { k: 'powerSelf', x: 2000, until: 'battle' } },
  },
];
const LEADER2_IDS = new Set(LEADER2.map((l) => l.id));
// 幂等：先剥掉旧 run 追加的（若重跑改了设计），再统一追加
pool.leaders = pool.leaders.filter((l) => !LEADER2_IDS.has(l.id)).concat(LEADER2);

// ---- ② 新卡 30 张（每色 4 角色 + 1 事件）----
const ch = (id, name, sub, cost, power, counter, keywords, effect, fruit) =>
  ({ id, name, sub, type: 'char', color: id.split('-')[0].toLowerCase(), cost, power, counter, keywords, effect, fruit, art: id });
const ev = (id, name, sub, cost, k, op) =>
  ({ id, name, sub, type: 'event', color: id.split('-')[0].toLowerCase(), cost, power: null, counter: null, keywords: [], effect: { hook: 'onPlay', op: { k, ...op } }, fruit: null, art: id });
const NEW = [
  // red：顶上战争·革命军
  ch('RED-20', '伊万科夫', ' 荷尔蒙果实 ', 6, 6000, 1000, [], null, 'paramecia'),
  ch('RED-21', '克尔拉', ' 革命军参谋 ', 3, 5000, 1000, [], null, null),
  ch('RED-22', '萨奇', ' 白团四番队长 ', 4, 6000, 1000, [], null, null),
  ch('RED-23', '战桃丸', ' 海军科学班 ', 5, 6000, null, ['blocker'], null, null),
  ev('RED-E5', '顶上决战', ' 马林梵多的黎明 ', 3, 'koWeakest', {}),
  // blue：海军·CP9
  ch('BLUE-20', '布鲁克', ' 黄泉果实 ', 5, 6000, 1000, [], null, 'paramecia'),
  ch('BLUE-21', '卡莉法', ' CP9 唯一女性 ', 3, 4000, 2000, [], null, 'paramecia'),
  ch('BLUE-22', '赫尔梅普', ' 海军上校之子 ', 2, 3000, 2000, [], null, null),
  ch('BLUE-23', '赞高', ' 催眠果实 ', 1, 3000, 1000, [], null, 'paramecia'),
  ev('BLUE-E5', '海军本部大集结', ' 正义的总攻 ', 3, 'powerLeader', { x: 2000, until: 'battle' }),
  // green：和之国·空岛
  ch('GREEN-20', '居鲁士', ' 竞技场英雄 ', 4, 5000, 1000, [], null, null),
  ch('GREEN-21', '小玉', ' 的玉妖术 ', 2, 3000, 2000, [], null, null),
  ch('GREEN-22', '菊之丞', ' 花之 Soldiers ', 3, 5000, 1000, [], null, null),
  ch('GREEN-23', '忍', ' 御庭番众女忍 ', 3, 4000, 1000, [], null, null),
  ev('GREEN-E5', '御用炭', ' 财政的命脉 ', 3, 'gainDon', { n: 2 }),
  // yellow：大妈团·唐团
  ch('YELLOW-20', '斯慕吉', ' 榨榨果实 ', 4, 5000, 1000, [], null, 'paramecia'),
  ch('YELLOW-21', '布琳', ' 记忆果实 ', 3, 4000, 2000, [], null, 'paramecia'),
  ch('YELLOW-22', '欧文', ' 热热果实 ', 4, 5000, 1000, [], null, 'paramecia'),
  ch('YELLOW-23', '砂糖', ' 玩具果实 ', 2, 3000, 2000, [], null, 'paramecia'),
  ev('YELLOW-E5', '霍米兹的慰藉', ' 灵魂的呵护 ', 2, 'healLP', { x: 2000 }),
  // purple：科学·德岛
  ch('PURPLE-20', '贝加庞克', ' 世界第一科学家 ', 7, 7000, null, [], null, null),
  ch('PURPLE-21', '夏洛特·布蕾', ' 镜镜果实 ', 4, 5000, 1000, [], null, 'paramecia'),
  ch('PURPLE-22', '甘福尔', ' 空岛神代 ', 3, 4000, 2000, [], null, null),
  ch('PURPLE-23', '维奥莱特', ' 瞪瞪果实 ', 3, 4000, 2000, [], null, 'paramecia'),
  ev('PURPLE-E5', '手术麻醉', ' ROOM 前置处置 ', 2, 'restEnemy', {}),
  // black：海军中将·鱼人岛
  ch('BLACK-20', '鬼蜘蛛', ' 海军中将 ', 5, 6000, 1000, [], null, null),
  ch('BLACK-21', '鼯鼠', ' 海军中将 ', 4, 5000, 1000, [], null, null),
  ch('BLACK-22', '火烧山', ' 海军中将 ', 3, 4000, 2000, [], null, null),
  ch('BLACK-23', '范德戴肯', ' 靶靶果实 ', 5, 5000, 1000, [], null, 'paramecia'),
  ev('BLACK-E5', '王下七武海', ' 政府的棋子 ', 3, 'draw', { n: 2 }),
];
const NEW_IDS = new Set(NEW.map((c) => c.id));
pool.cards = pool.cards.filter((c) => !NEW_IDS.has(c.id));
const idxOf = new Map(pool.cards.map((c, i) => [c.id, i]));
for (const c of NEW) {
  const i = idxOf.get(c.id);
  if (i == null) { idxOf.set(c.id, pool.cards.length); pool.cards.push(c); }
  else pool.cards[i] = c; // upsert：重放即同步数值/词条调整
}

// ---- ③ 每色按费用分桶 round-robin 交错（与批1 同法）----
const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'black'];
pool.cards = COLORS.flatMap((col) => {
  const cs = pool.cards.filter((c) => c.color === col);
  const buckets = new Map();
  for (const c of cs) {
    if (!buckets.has(c.cost)) buckets.set(c.cost, []);
    buckets.get(c.cost).push(c);
  }
  const costs = [...buckets.keys()].sort((a, b) => a - b);
  const out = [];
  for (let added = true; added;) {
    added = false;
    for (const cost of costs) {
      const b = buckets.get(cost);
      if (b.length) { out.push(b.shift()); added = true; }
    }
  }
  return out;
});

// ---- 内置校验（与 cards.test 同口径，OP-02 后规模）----
const all = [...pool.leaders, ...pool.cards];
assert.equal(new Set(all.map((c) => c.id)).size, all.length, 'id 唯一');
assert.equal(pool.leaders.length, 12, '船长 12 名');
const FRUITS = ['paramecia', 'logia', 'zoan'];
for (const c of pool.cards) {
  assert.ok(c.fruit === null || FRUITS.includes(c.fruit), `bad fruit ${c.id}`);
  if (c.type === 'char') {
    const lo = Math.max(1000, (c.cost - 1) * 1000), hi = (c.cost + 3) * 1000;
    assert.ok(c.power >= lo && c.power <= hi, `${c.id} power ${c.power} 超区间 [${lo},${hi}]`);
  }
}
for (const col of COLORS) {
  const cs = pool.cards.filter((c) => c.color === col);
  assert.ok(cs.length >= 20, `${col} 仅 ${cs.length} 张`);
  for (let cost = 1; cost <= 7; cost++) {
    assert.ok(cs.some((c) => c.type === 'char' && c.cost === cost), `${col} 缺 cost ${cost} 角色`);
  }
}
assert.ok(pool.cards.length >= 140 && pool.cards.length <= 200, `总数 ${pool.cards.length}`);

pool.meta.version = '0.3.0';
pool.meta.pack = 'OP-02 追加：6 新船长 + 30 新卡（2026-09-19）';
writeFileSync(FILE, JSON.stringify(pool, null, 2) + '\n');
const stat = {};
for (const c of pool.cards) stat[c.fruit || 'none'] = (stat[c.fruit || 'none'] || 0) + 1;
console.log(`OK 总数 ${pool.cards.length} 张 + ${pool.leaders.length} 船长；果实分布:`, JSON.stringify(stat));
