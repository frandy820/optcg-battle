// F13 融合机制：12 张融合卡一次性注入三处数据（cards.json / cards-pool3.json / pool3/{color}.json）
// 幂等：已存在 FUSION- 前缀卡则跳过；缩进与既有文件一致（cards.json=1空格，其余=2空格），尾随换行保留
// 用法：node scripts/add-fusion-cards.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// 融合卡定稿（统筹方数据，逐字段照抄）：统一 type char / cost 8 / power 8000 / counter null / fruit null / sub ' 融合 '
// keywords 首词条恒为 rush（融合登场当回合可攻）；art 指向主素材图；fusion={from:[素材id], cost:贝里}
const FUSIONS = [
  { id: 'FUSION-RED1', name: '火之意志 艾斯&萨博', color: 'red', keywords: ['rush', 'doubleAttack'], effect: null, art: 'RED-08', fusion: { from: ['RED-08', 'RED-06'], cost: 3 } },
  { id: 'FUSION-RED2', name: '见闻色觉醒 卡塔库栗', color: 'red', keywords: ['rush'], effect: { hook: 'whenAttacking', op: { k: 'powerSelf', x: 1000, until: 'battle' } }, art: 'RED-18', fusion: { from: ['RED-63', 'RED-18'], cost: 2 } },
  { id: 'FUSION-BLUE1', name: '海军的魂 战国&卡普', color: 'blue', keywords: ['rush', 'blocker'], effect: null, art: 'BLUE-11', fusion: { from: ['BLUE-36', 'BLUE-11'], cost: 3 } },
  { id: 'FUSION-BLUE2', name: '阳光号的伙伴 娜美&弗兰奇', color: 'blue', keywords: ['rush'], effect: { hook: 'onPlay', op: { k: 'buffAll', x: 1000, until: 'turn' } }, art: 'BLUE-08', fusion: { from: ['BLUE-26', 'BLUE-08'], cost: 3 } },
  { id: 'FUSION-GREEN1', name: '鬼岛决战 凯多&大和', color: 'green', keywords: ['rush', 'banish'], effect: null, art: 'GREEN-12', fusion: { from: ['GREEN-12', 'GREEN-36'], cost: 2 } },
  { id: 'FUSION-GREEN2', name: '九刀流·阿修罗 索隆', color: 'green', keywords: ['rush'], effect: { hook: 'whenAttacking', op: { k: 'powerSelf', x: 1000, until: 'battle' } }, art: 'GREEN-25', fusion: { from: ['GREEN-24', 'GREEN-25'], cost: 3 } },
  { id: 'FUSION-YELLOW1', name: '蛇姬的宠爱 汉库珂', color: 'yellow', keywords: ['rush'], effect: { hook: 'onPlay', op: { k: 'restEnemy' } }, art: 'YELLOW-28', fusion: { from: ['YELLOW-28', 'YELLOW-29'], cost: 3 } },
  { id: 'FUSION-YELLOW2', name: '万国的威压 玲玲&斯慕吉', color: 'yellow', keywords: ['rush'], effect: { hook: 'onPlay', op: { k: 'damageLP', x: 1000 } }, art: 'YELLOW-42', fusion: { from: ['YELLOW-20', 'YELLOW-42'], cost: 2 } },
  { id: 'FUSION-PURPLE1', name: '最恶世代 罗与基德', color: 'purple', keywords: ['rush'], effect: { hook: 'onPlay', op: { k: 'draw', n: 1 } }, art: 'PURPLE-26', fusion: { from: ['PURPLE-26', 'PURPLE-35'], cost: 3 } },
  { id: 'FUSION-PURPLE2', name: '剑士的顶点 米霍克&雷利', color: 'purple', keywords: ['rush', 'doubleAttack'], effect: null, art: 'PURPLE-10', fusion: { from: ['PURPLE-10', 'PURPLE-19'], cost: 2 } },
  { id: 'FUSION-BLACK1', name: '黑团双巨头 蒂奇&希留', color: 'black', keywords: ['rush', 'banish'], effect: null, art: 'BLACK-25', fusion: { from: ['BLACK-25', 'BLACK-28'], cost: 3 } },
  { id: 'FUSION-BLACK2', name: '海底监狱的铁壁 麦哲伦&汉尼拔', color: 'black', keywords: ['rush', 'blocker'], effect: null, art: 'BLACK-30', fusion: { from: ['BLACK-30', 'BLACK-12'], cost: 3 } },
].map((c) => ({
  id: c.id, name: c.name, sub: ' 融合 ', type: 'char', color: c.color,
  cost: 8, power: 8000, counter: null, keywords: c.keywords, effect: c.effect,
  art: c.art, fruit: null, fusion: c.fusion,
}));

const writeJson = (path, data, indent) => writeFileSync(path, JSON.stringify(data, null, indent) + '\n', 'utf8');

// 1) 主库 cards.json（1 空格缩进）
const mainPath = join(ROOT, 'data', 'cards.json');
const main = JSON.parse(readFileSync(mainPath, 'utf8'));
if (main.cards.some((c) => c.id.startsWith('FUSION-'))) {
  console.log('SKIP：cards.json 已含融合卡，不重复注入');
} else {
  main.cards.push(...FUSIONS.map((c) => ({ ...c })));
  writeJson(mainPath, main, 1);
  console.log(`cards.json：+${FUSIONS.length}（共 ${main.cards.length} 卡）`);
}

// 2) POOL-3 合并源 cards-pool3.json（2 空格缩进）
const p3Path = join(ROOT, 'data', 'cards-pool3.json');
const p3 = JSON.parse(readFileSync(p3Path, 'utf8'));
if (!p3.some((c) => c.id.startsWith('FUSION-'))) {
  p3.push(...FUSIONS.map((c) => ({ ...c })));
  writeJson(p3Path, p3, 2);
  console.log(`cards-pool3.json：+${FUSIONS.length}（共 ${p3.length} 卡）`);
} else { console.log('SKIP：cards-pool3.json 已含融合卡'); }

// 3) 分色源 pool3/{color}.json（2 空格缩进）
for (const col of ['red', 'blue', 'green', 'yellow', 'purple', 'black']) {
  const colPath = join(ROOT, 'data', 'pool3', `${col}.json`);
  const src = JSON.parse(readFileSync(colPath, 'utf8'));
  if (!src.some((c) => c.id.startsWith('FUSION-'))) {
    const add = FUSIONS.filter((c) => c.color === col).map((c) => ({ ...c }));
    src.push(...add);
    writeJson(colPath, src, 2);
    console.log(`pool3/${col}.json：+${add.length}`);
  } else { console.log(`SKIP：pool3/${col}.json 已含融合卡`); }
}

// 素材存在性自检（24 个素材 id 必须全部在主库且非融合卡）
const byId = new Map(main.cards.map((c) => [c.id, c]));
const miss = [];
for (const f of FUSIONS) {
  for (const id of f.fusion.from) {
    const m = byId.get(id);
    if (!m || m.fusion) miss.push(`${f.id}←${id}`);
  }
}
if (miss.length) { console.error('FATAL 素材缺失/非法：', miss.join(' ')); process.exit(1); }
console.log('素材自检 OK：24 素材 id 全部存在且非融合卡');
