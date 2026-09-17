// expand-pool.mjs — 批1 卡池扩充（一次性迁移脚本，可复现）
// ① 现有 78 色卡 + 6 船长按原作设定打恶魔果实系标签（paramecia 超人 / logia 自然 / zoan 动物，无果实=null）
// ② 追加 72 张新卡（每色 9 角色 + 2 事件 + 1 舞台；东海/司法岛/和之国/德雷斯罗萨/北海/因佩尔等篇章主题）
// ③ 每色按费用 stable 重排——默认卡组是「每卡×4 取前 50」，新卡排尾部将永远进不了默认卡组与平衡模拟
// 克制环（combat.js fruitEdge）：超人→自然→动物→超人，攻击方克制防守方 +1000
// 运行：node scripts/expand-pool.mjs（重跑幂等：以 id 判断已存在的新卡不会重复追加）
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FILE = resolve(ROOT, 'data', 'cards.json');
const pool = JSON.parse(readFileSync(FILE, 'utf8'));

// ---- ① 现有卡果实系映射（原作忠实；毛皮族/鱼人/纯体术=无果实）----
const FRUIT = {
  // leaders
  'LEADER-RED': 'paramecia', 'LEADER-BLUE': null, 'LEADER-GREEN': null,
  'LEADER-YELLOW': null, 'LEADER-PURPLE': 'paramecia', 'LEADER-BLACK': null,
  // red
  'RED-01': null, 'RED-02': null, 'RED-03': null, 'RED-04': 'paramecia',
  'RED-05': 'paramecia', 'RED-06': null, 'RED-07': 'paramecia', 'RED-08': 'logia',
  'RED-09': null, 'RED-10': null,
  // blue
  'BLUE-01': null, 'BLUE-02': null, 'BLUE-03': null, 'BLUE-04': 'paramecia',
  'BLUE-05': null, 'BLUE-06': null, 'BLUE-07': 'logia', 'BLUE-08': null,
  'BLUE-09': null, 'BLUE-10': 'logia',
  // green
  'GREEN-01': 'zoan', 'GREEN-02': null, 'GREEN-03': null, 'GREEN-04': null,
  'GREEN-05': 'zoan', 'GREEN-06': 'zoan', 'GREEN-07': 'zoan', 'GREEN-08': 'zoan',
  'GREEN-09': 'zoan', 'GREEN-10': 'paramecia',
  // yellow
  'YELLOW-01': 'paramecia', 'YELLOW-02': 'zoan', 'YELLOW-03': 'zoan', 'YELLOW-04': 'paramecia',
  'YELLOW-05': null, 'YELLOW-06': 'paramecia', 'YELLOW-07': 'logia', 'YELLOW-08': 'paramecia',
  'YELLOW-09': 'paramecia', 'YELLOW-10': 'logia',
  // purple
  'PURPLE-01': null, 'PURPLE-02': null, 'PURPLE-03': null, 'PURPLE-04': 'paramecia',
  'PURPLE-05': 'paramecia', 'PURPLE-06': null, 'PURPLE-07': 'logia', 'PURPLE-08': 'zoan',
  'PURPLE-09': 'paramecia', 'PURPLE-10': null,
  // black
  'BLACK-01': null, 'BLACK-02': 'zoan', 'BLACK-03': null, 'BLACK-04': null,
  'BLACK-05': null, 'BLACK-06': null, 'BLACK-07': null, 'BLACK-08': null,
  'BLACK-09': null, 'BLACK-10': 'paramecia',
};
// 船长数值 override（平衡杠杆；重放幂等）
// 绿船长批2曾 5000→6000 抬全 matchup，批3 叠加索隆永久 buff 后平均胜率 66.7 全场最强 → 回落 5500
// 紫=罗 6000：抵蓝压、全 matchup 回带
const LEADER_OVERRIDE = { 'LEADER-GREEN': { power: 5500 }, 'LEADER-PURPLE': { power: 6000 } };
// 船长技能（批3：六色差异化，全部走声明式 effect——引擎既有钩子/算子）
const LEADER_SKILL = {
  'LEADER-RED': {
    skill: '橡胶橡胶·机关枪', skillDesc: '船长攻击宣告时，本次战斗战力 +1000',
    effect: { hook: 'whenAttacking', op: { k: 'powerSelf', x: 1000, until: 'battle' } },
  },
  'LEADER-BLUE': {
    skill: '天候棒·雷云', skillDesc: '费用 ≥3 的己方角色登场时，抽 1 张牌',
    effect: { hook: 'onSummon', op: { k: 'draw', n: 1, minCost: 3 } },
  },
  'LEADER-GREEN': {
    skill: '三刀流·鬼气', skillDesc: '费用 ≥6 的角色登场时，该角色永久 +1000',
    effect: { hook: 'onSummon', op: { k: 'powerSelf', x: 1000, minCost: 6, until: 'forever' } },
  },
  'LEADER-YELLOW': {
    skill: '宴会料理', skillDesc: '己方角色被击沉时，回复 1000 积分（不超过上限）',
    effect: { hook: 'onAllyKO', op: { k: 'healLP', x: 1000 } },
  },
  'LEADER-PURPLE': {
    // 三版 onKill 抽牌是强侧滚雪球（紫弱势局互斗吃不掉人=不触发，红v紫78/绿v紫83 打不回来）；
    // 改 onAllyKO 阵亡抽牌=弱侧负反馈稳定器：被打得越狠资源越多，专治速攻爆破（与山治回血镜像成对）
    skill: 'ROOM·回收', skillDesc: '己方角色被击沉时，抽 1 张牌',
    effect: { hook: 'onAllyKO', op: { k: 'draw', n: 1 } },
  },
  'LEADER-BLACK': {
    skill: '霸王的威压', skillDesc: '己方回合开始时，额外翻 1 颗费用豆',
    effect: { hook: 'onTurnStart', op: { k: 'gainDon', n: 1 } },
  },
};
for (const l of pool.leaders) {
  assert.ok(l.id in FRUIT, `leader 未映射: ${l.id}`);
  l.fruit = FRUIT[l.id];
  Object.assign(l, LEADER_OVERRIDE[l.id] || {}, LEADER_SKILL[l.id] || {});
}

// ---- ② 新卡 72 张（每色 9 角色 + 2 事件 + 1 舞台）----
const ch = (id, name, sub, cost, power, counter, keywords, effect, fruit) =>
  ({ id, name, sub, type: 'char', color: id.split('-')[0].toLowerCase(), cost, power, counter, keywords, effect, fruit, art: id });
const ev = (id, name, sub, cost, k, op) =>
  ({ id, name, sub, type: 'event', color: id.split('-')[0].toLowerCase(), cost, power: null, counter: null, keywords: [], effect: { hook: 'onPlay', op: { k, ...op } }, fruit: null, art: id });
const st = (id, name, sub, cost, k, op) =>
  ({ id, name, sub, type: 'stage', color: id.split('-')[0].toLowerCase(), cost, power: null, counter: null, keywords: [], effect: { hook: 'onPlay', op: { k, ...op } }, fruit: null, art: id });
const P_ = (x, until = 'battle') => ({ k: 'powerSelf', x, until });
const PL = (x, until = 'battle') => ({ k: 'powerLeader', x, until });
const gr = (id, name, sub, cost, gear) =>
  ({ id, name, sub, type: 'gear', color: id.split('-')[0].toLowerCase(), cost, power: null, counter: null, keywords: [], gear, effect: null, fruit: null, art: id });
const NEW = [
  // ===== red：东海篇 + 阿拉巴斯坦 + 推进城（速攻连打）=====
  ch('RED-11', '巴基', ' 四分五裂 ', 2, 5000, 1000, [], null, 'paramecia'),
  ch('RED-12', '亚尔丽塔', ' 滑滑果实 ', 1, 3000, 1000, [], null, 'paramecia'),
  ch('RED-13', '克洛', ' 百计 ', 3, 6000, 1000, [], null, null),
  ch('RED-14', '阿龙', ' 锯齿鲨鱼人 ', 5, 7000, null, [], null, null),
  ch('RED-15', '薇薇', ' 阿拉巴斯坦公主 ', 1, 3000, 2000, [], null, null),
  ch('RED-16', '达兹·波涅斯', ' 快斩果实 ', 6, 6000, null, ['rush'], null, 'paramecia'),
  ch('RED-17', '罗布·路奇', ' 猫猫果实·豹 ', 7, 7000, null, ['rush'], null, 'zoan'),
  ch('RED-18', '卡塔库栗', ' 糯糯果实 ', 8, 8000, null, ['doubleAttack'], null, 'paramecia'),
  ch('RED-19', '萨卡斯基', ' 岩浆果实 ', 8, 8000, null, [], { hook: 'whenAttacking', op: P_(1000) }, 'logia'),
  ev('RED-E3', '斗志昂扬', ' 猛虎之势 ', 1, 'powerLeader', { x: 1000, until: 'battle' }),
  ev('RED-E4', '东海的誓言', ' 出航之约 ', 1, 'draw', { n: 1 }),
  st('RED-S2', '阿拉巴斯坦王宫', ' 沙漠之国 ', 2, 'draw', { n: 1 }),
  // ===== blue：水之都·司法岛 + 鱼人岛 + 海军本部（资源循环）=====
  ch('BLUE-11', '卡普', ' 海军英雄 ', 5, 6000, 1000, [], null, null),
  ch('BLUE-12', '波尔萨利诺', ' 光光果实 ', 7, 6000, null, [], null, 'logia'),
  ch('BLUE-13', '白星', ' 鱼人岛公主 ', 3, 5000, 2000, [], null, null),
  ch('BLUE-14', '尼普顿', ' 龙宫王 ', 6, 6000, null, ['blocker'], null, null),
  ch('BLUE-15', '巴利', ' 卡雷拉一号船坞 ', 4, 6000, 1000, [], null, null),
  ch('BLUE-16', '斯潘达姆', ' CP9 长官 ', 1, 3000, 1000, [], null, null),
  ch('BLUE-17', '加布拉', ' 狗狗果实·狼 ', 5, 6000, null, [], null, 'zoan'),
  ch('BLUE-18', '卡库', ' 牛牛果实·长颈鹿 ', 6, 6000, 1000, [], null, 'zoan'),
  ch('BLUE-19', '战国', ' 大佛 ', 8, 7000, null, ['blocker'], null, 'paramecia'),
  ev('BLUE-E3', '司法岛之战', ' 正义的重量 ', 2, 'draw', { n: 1 }),
  ev('BLUE-E4', '六式·剃', ' 瞬身连击 ', 1, 'restEnemy', {}),
  st('BLUE-S2', '水之都', ' 七水之都 ', 2, 'draw', { n: 1 }),
  // ===== green：空岛 + 和之国 + 顶上战争（巨兽大怪）=====
  ch('GREEN-11', '瓦伊帕', ' 香狄亚战士 ', 3, 5000, 1000, [], null, null),
  ch('GREEN-12', '凯多', ' 鱼鱼果实·青龙 ', 8, 8000, null, [], { hook: 'whenAttacking', op: P_(1000) }, 'zoan'),
  ch('GREEN-13', '锦卫门', ' 狐火流 ', 4, 5000, 1000, [], null, null),
  ch('GREEN-14', '河松', ' 川流 ', 5, 5000, null, ['blocker'], null, null),
  ch('GREEN-15', '藤虎', ' 重力果实 ', 7, 7000, null, [], null, 'paramecia'),
  ch('GREEN-16', '蕾贝卡', ' 不败之女 ', 2, 4000, 2000, [], null, null),
  ch('GREEN-17', '佩罗斯佩罗', ' 糖糖果实 ', 6, 6000, null, [], null, 'paramecia'),
  ch('GREEN-18', '酒天丸', ' 阿修罗童子党 ', 5, 6000, null, [], null, null),
  ch('GREEN-19', '霜月康家', ' 和之国大名 ', 2, 3000, 2000, [], null, null),
  ev('GREEN-E3', '雷迎', ' 神之裁 ', 4, 'koWeakest', {}),
  ev('GREEN-E4', '和之国黎明', ' 开国之路 ', 1, 'gainDon', { n: 1 }),
  st('GREEN-S2', '空岛', ' 神之岛 ', 2, 'gainDon', { n: 1 }),
  // ===== yellow：女儿岛 + 德雷斯罗萨（壁垒生存）=====
  ch('YELLOW-11', '波雅·汉库珂', ' 甜甜果实 ', 6, 6000, null, [], null, 'paramecia'),
  ch('YELLOW-12', '玛格丽特', ' 九蛇战士 ', 2, 4000, 1000, [], null, null),
  ch('YELLOW-13', '塞尼奥尔·皮克', ' 游游果实 ', 4, 5000, null, ['blocker'], null, 'paramecia'),
  ch('YELLOW-14', '迪亚曼蒂', ' 飘飘果实 ', 5, 6000, null, [], null, 'paramecia'),
  ch('YELLOW-15', '皮卡', ' 石石果实 ', 7, 6000, null, ['blocker'], null, 'paramecia'),
  ch('YELLOW-16', '特雷波尔', ' 粘粘果实 ', 3, 4000, 1000, [], null, 'paramecia'),
  ch('YELLOW-17', '维尔戈', ' 鬼竹 ', 5, 4000, null, ['blocker'], null, null),
  ch('YELLOW-18', '莫奈', ' 鸟鸟果实·夜枭 ', 4, 5000, 1000, [], null, 'zoan'),
  ch('YELLOW-19', '阿布萨罗姆', ' 透明果实 ', 3, 4000, null, ['rush'], null, 'paramecia'),
  ev('YELLOW-E3', '铁块', ' 六式防御 ', 1, 'powerLeader', { x: 1000, until: 'battle' }),
  ev('YELLOW-E4', '花儿之舞', ' 冈扇流 ', 2, 'restEnemy', {}),
  st('YELLOW-S2', '德雷斯罗萨', ' 科利亚高原 ', 2, 'draw', { n: 1 }),
  // ===== purple：北海 + 新世界超新星（节奏掌控）=====
  ch('PURPLE-11', '乔艾莉·波妮', ' 年龄果实 ', 3, 4000, 1000, [], null, 'paramecia'),
  ch('PURPLE-12', '卡彭·贝基', ' 坚城果实 ', 4, 5000, null, ['blocker'], null, 'paramecia'),
  ch('PURPLE-13', '乌尔基', ' 因果果实 ', 5, 6000, null, [], null, 'paramecia'),
  ch('PURPLE-14', '佩吉万', ' 龙龙果实·棘背龙 ', 6, 7000, null, [], null, 'zoan'),
  ch('PURPLE-15', '卡里布', ' 沼沼果实 ', 4, 5000, null, [], null, 'logia'),
  ch('PURPLE-16', '柯拉松', ' 唐吉诃德·罗西南迪 ', 4, 5000, null, [], null, null),
  ch('PURPLE-17', '鹤', ' 海军参谋 ', 2, 3000, 2000, [], null, null),
  ch('PURPLE-18', '让·巴特', ' 心脏海贼团 ', 8, 8000, null, [], null, null),
  ch('PURPLE-19', '雷利', ' 冥王 ', 7, 7000, null, ['rush'], null, null),
  ev('PURPLE-E3', '领域·扫描', ' ROOM 展开 ', 1, 'draw', { n: 1 }),
  ev('PURPLE-E4', '心络机动', ' 转移战术 ', 2, 'restEnemy', {}),
  st('PURPLE-S2', '北海航路', ' 斯温·哈根号 ', 2, 'gainDon', { n: 1 }),
  // ===== black：因佩尔 + 黑胡子海贼团 + 红发团（暗黑去除）=====
  ch('BLACK-11', '马歇尔·D·蒂奇', ' 暗暗果实 ', 5, 7000, null, [], null, 'logia'),
  ch('BLACK-12', '汉尼拔', ' 因佩尔副署长 ', 5, 6000, null, ['blocker'], null, null),
  ch('BLACK-13', '布鲁诺', ' 门门果实 ', 3, 5000, 1000, [], null, 'paramecia'),
  ch('BLACK-14', '多米诺', ' 因佩尔看守 ', 2, 4000, 2000, [], null, null),
  ch('BLACK-15', '小萨蒂', ' 地狱看守长 ', 4, 6000, 1000, [], null, null),
  ch('BLACK-16', '本·贝克曼', ' 红发副船长 ', 5, 7000, null, [], null, null),
  ch('BLACK-17', '耶稣布', ' 红发狙击手 ', 3, 5000, null, ['rush'], null, null),
  ch('BLACK-18', '拉基·路', ' 红发干部 ', 2, 5000, null, [], null, null),
  ch('BLACK-19', '钢骨·空', ' 海军元帅 ', 7, 8000, null, [], null, null),
  ev('BLACK-E3', 'LEVEL 6', ' 无限地狱 ', 3, 'koWeakest', {}),
  ev('BLACK-E4', '黑团议事', ' 暗中盘算 ', 1, 'draw', { n: 1 }),
  st('BLACK-S2', '马林梵多', ' 海军本部港 ', 2, 'gainDon', { n: 1 }),
  // ===== 批2 装备（每色 2 件：武器=纯攻 atk，甲胄=atk+坚壁 blocker；每角色限 1 件，替换式）=====
  gr('RED-G1', '三代鬼彻', ' 和之国妖刀 ', 2, { atk: 2000 }),
  gr('RED-G2', '武装色·硬化', ' 全身武装 ', 2, { atk: 1000, gives: ['blocker'] }),
  gr('BLUE-G1', '时雨', ' 良业物 ', 2, { atk: 2000 }),
  gr('BLUE-G2', '六式·铁块', ' 钢铁之躯 ', 2, { atk: 1000, gives: ['blocker'] }),
  gr('GREEN-G1', '天羽羽斩', ' 和之国黑刀 ', 2, { atk: 2000 }),
  gr('GREEN-G2', '电击毛皮', ' 毛皮族静电 ', 2, { atk: 1000, gives: ['blocker'] }),
  gr('YELLOW-G1', '黑刀·夜', ' 世界最强黑刀 ', 3, { atk: 3000 }),
  gr('YELLOW-G2', '霍米兹铁卫', ' 大妈的看门人 ', 3, { atk: 2000, gives: ['blocker'] }),
  gr('PURPLE-G1', '鬼哭', ' 诅咒之刀 ', 2, { atk: 2000 }),
  gr('PURPLE-G2', '北海重甲', ' 带毛皮的披风 ', 2, { atk: 1000, gives: ['blocker'] }),
  gr('BLACK-G1', '狙击镜', ' 红发狙击手 ', 1, { atk: 1000 }),
  gr('BLACK-G2', '黑刀·初代鬼彻', ' 妖刀一文字 ', 3, { atk: 2000, gives: ['blocker'] }),
];

// 现有卡（非 NEW）打果实系标签；NEW 卡的 fruit 由下方 ch() 定义，重放时直接 upsert 覆盖
// 旧卡数值调参区（批3 平衡：紫 2 费 3K×2 挡不住绿 2 费 4K 滚雪球 → 对齐绿费线）
const CARD_OVERRIDE = {
  'PURPLE-02': { power: 4000 }, // 夏奇
  'PURPLE-17': { power: 4000 }, // 鹤
};
const NEW_IDS = new Set(NEW.map((c) => c.id));
for (const c of pool.cards) {
  if (NEW_IDS.has(c.id)) continue;
  if (c.type === 'char') {
    assert.ok(c.id in FRUIT, `角色卡未映射: ${c.id}`);
    c.fruit = FRUIT[c.id];
  } else {
    c.fruit = null; // 事件/舞台无果实系
  }
  Object.assign(c, CARD_OVERRIDE[c.id] || {});
}
const idxOf = new Map(pool.cards.map((c, i) => [c.id, i]));
for (const c of NEW) {
  const i = idxOf.get(c.id);
  if (i == null) { idxOf.set(c.id, pool.cards.length); pool.cards.push(c); }
  else pool.cards[i] = c; // upsert：脚本重放即同步数值/词条调整
}

// ---- ③ 每色按费用分桶 round-robin 交错 ----
// 默认卡组=每卡×4 取前 50（≈前 12 张卡）。纯 cost 升序时 c5+ 高费全部挤出默认卡组与平衡模拟
// （2026-09-17 首轮 sim 大崩根因）；交错后前 12 张覆盖全费用曲线，高费大哥自动进组。
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

// ---- 内置校验（与 cards.test 同口径）----
const all = [...pool.leaders, ...pool.cards];
assert.equal(new Set(all.map((c) => c.id)).size, all.length, 'id 唯一');
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
assert.ok(pool.cards.length >= 140 && pool.cards.length <= 180, `总数 ${pool.cards.length}`);

pool.meta.version = '0.2.0';
pool.meta.fruit = {
  cycle: '超人系→自然系→动物系→超人系（攻击方克制防守方，战力+1000）',
  paramecia: '超人系', logia: '自然系', zoan: '动物系',
};
writeFileSync(FILE, JSON.stringify(pool, null, 2) + '\n');
const stat = {};
for (const c of pool.cards) stat[c.fruit || 'none'] = (stat[c.fruit || 'none'] || 0) + 1;
console.log(`OK 总数 ${pool.cards.length} 张 + ${pool.leaders.length} 船长；果实分布(char+event+stage):`, JSON.stringify(stat));
