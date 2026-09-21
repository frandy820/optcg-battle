// P2 批量产卡生成器：node scripts/gen-expansion.mjs [--per-color N] [--dry-run] [--seed S]
// 依据 docs/design-system.md 配额 + check-pool3.js 门禁公式同构生成（rarityOf/power 公式严格一致）。
// 产出：三源追加（data/cards.json / cards-pool3.json / pool3/{color}.json），首跑自动备份到 data/backup/pre-expansion/。
// 首件门禁：--per-color 10 先验证全链路，过了再放量全量（目标终态 ~1000）。
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { expandNames } from '../data/name-pool.mjs';

const SEED = Number(new URLSearchParams(process.argv.slice(2).join('&').replace(/--/g, '')).get('seed') || 20260921);
const PER_COLOR = Number((process.argv.join(' ').match(/--per-color[= ](\d+)/) || [])[1] || 0);
const DRY = process.argv.includes('--dry-run');
const TARGET_TOTAL = 1000;

// 确定性 RNG（与 engine/rng.js 同算法——结果可复现可回放）
let _a = SEED >>> 0;
const rng = () => { _a |= 0; _a = (_a + 0x6D2B79F5) | 0; let t = Math.imul(_a ^ (_a >>> 15), 1 | _a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const pick = (arr) => arr[Math.floor(rng() * arr.length)];
const chance = (p) => rng() < p;

const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'black'];
const UPPER = { red: 'RED', blue: 'BLUE', green: 'GREEN', yellow: 'YELLOW', purple: 'PURPLE', black: 'BLACK' };
// 每色 3 archetype [主阵营,副阵营]（design-system §3 D3 表）
const ARCH = {
  red: [['supernova', 'strawhat'], ['strawhat', 'navy'], ['whitebeard', 'strawhat']],
  blue: [['navy', 'revolutionary'], ['revolutionary', 'navy'], ['navy', 'warlord']],
  green: [['strawhat', 'whitebeard'], ['navy', 'strawhat'], ['strawhat', 'supernova']],
  yellow: [['yonko', 'navy'], ['navy', 'warlord'], ['warlord', 'yonko']],
  purple: [['warlord', 'beast'], ['beast', 'warlord'], ['warlord', 'navy']],
  black: [['beast', 'whitebeard'], ['navy', 'beast'], ['revolutionary', 'beast']],
};
const ARC_DEFAULT = { red: 'east_blue', blue: 'enies_lobby', green: 'wano', yellow: 'whole_cake', purple: 'dressrosa', black: 'marineford' };
// 阵营称号（sub 格式：前后各一空格）
const SUB_POOL = {
  strawhat: ['草帽一伙', '冒险者', '扬帆起航', '伙伴之力', '自由之海', '冒险王'],
  navy: ['海军将校', '正义之师', '执法者', '巡逻舰队', '铁律', '缉捕令'],
  warlord: ['王下七武海', '暗流涌动', '孤高之刃', '傀儡师', '夜行', '处刑人'],
  yonko: ['四皇麾下', '皇族血脉', '大海之主', '亲卫队长', '蛋糕城', '破竹之势'],
  supernova: ['最恶世代', '出头天', '乱世枭雄', '野心家', '新星', '结盟'],
  revolutionary: ['革命军干部', '解放战线', '隐密行动', '风之军', '起义者', '疾风'],
  whitebeard: ['白胡子一族', '一番队长', '家族之绊', '残火', '赤鞘武士', '遗志'],
  beast: ['百兽军团', '大看板', '真打', '鬼岛之主', 'SMILE能力者', '狩猎者'],
};
// 词条强度与费率（T1=rush/blocker −1K；T2=banish/doubleAttack −1K 沿用 F12 公式——分级折价 P3 实施时同步升门禁）
const KW_T1 = ['rush', 'blocker'];
const KW_T2 = { banish: { minCost: 5, colors: ['black', 'green'] }, doubleAttack: { minCost: 6, colors: null } };

// ===== 读源 =====
const cardsJson = JSON.parse(readFileSync('./data/cards.json', 'utf8'));
const pool3 = JSON.parse(readFileSync('./data/cards-pool3.json', 'utf8'));
const perColorSrc = Object.fromEntries(COLORS.map((c) => [c, JSON.parse(readFileSync(`./data/pool3/${c}.json`, 'utf8'))]));

// 全局同色唯一集合（主库 + pool3 源，名字含 gear 名）
const usedNameByColor = Object.fromEntries(COLORS.map((c) => [c, new Set()]));
for (const c of cardsJson.cards) usedNameByColor[c.color].add(c.name);
for (const c of pool3) usedNameByColor[c.color].add(c.name);
const usedIds = new Set([...cardsJson.cards.map((c) => c.id), ...pool3.map((c) => c.id)]);
// 各色编号游标
const seq = {};
for (const col of COLORS) {
  let max = 0, maxG = 0;
  for (const id of usedIds) {
    const m = id.match(new RegExp(`^${UPPER[col]}(-G)?-?(\\d+)$`));
    if (m) { if (m[1]) maxG = Math.max(maxG, +m[2]); else max = Math.max(max, +m[2]); }
  }
  seq[col] = { char: max + 1, gear: maxG + 1 };
}

// ===== 配额 =====
const totalNow = cardsJson.cards.length; // 257
const toAddTotal = TARGET_TOTAL - totalNow; // ~743
const curByColor = Object.fromEntries(COLORS.map((c) => [c, cardsJson.cards.filter((x) => x.color === c).length]));
const targetPerColor = Math.round(TARGET_TOTAL / 6); // 167
let quota = {};
for (const col of COLORS) quota[col] = PER_COLOR || Math.max(0, targetPerColor - curByColor[col]);
const grand = Object.values(quota).reduce((a, b) => a + b, 0);
console.log(`现池 ${totalNow} → 目标 ~${TARGET_TOTAL}；本批各色配额: ${COLORS.map((c) => `${c}:${quota[c]}`).join(' ')}（合计 ${grand}）`);

// ===== 频率记账（与门禁同口径：排除融合卡——融合不进 deckOf 不占额度）=====
const isFusionCard = (c) => typeof c.id === 'string' && c.id.startsWith('FUSION-');
const opCnt = {}, kwCnt = {};
const countCard = (c) => {
  if (isFusionCard(c)) return;
  (c.keywords || []).forEach((k) => kwCnt[k] = (kwCnt[k] || 0) + 1);
  if (c.effect) for (const op of (Array.isArray(c.effect.op) ? c.effect.op : [c.effect.op])) opCnt[op.k] = (opCnt[op.k] || 0) + 1;
};
pool3.forEach(countCard);
// ===== 名字预扫（唯一化 → 精确 nActual → FINAL_TOTAL 实算）=====
// 跨 archetype 撞池（同阵营既当主又当副）会产生大量重名，压缩 need 更放大缺口；
// 预扫先唯一化再定每色实际产出，频率预算按真实终量算（虚高 25% 会打爆热门词，实测超限）
const planByColor = {};
let grandActual = 0;
let gearActual = 0;
const GEAR_NAMES = {
  red: ['烈焰短刀', '赤犬军刀', '革命火铳'],
  blue: ['苍波刃', '海军制式铳', '冰河佩剑'],
  green: ['翠林弓', '兽王爪', '巨树大盾'],
  yellow: ['雷光三节棍', '天候棒·改', '琥珀长弓'],
  purple: ['紫电细剑', '傀儡丝线', '暗影匕首'],
  black: ['黑翼斩舰刀', '铁狱锁链', '夜枭钩爪'],
};
for (const col of COLORS) {
  const n = quota[col];
  const nameBag = [];
  if (n > 0) {
    for (let ai = 0; ai < 3; ai++) {
      const [main, sub] = ARCH[col][ai];
      for (const nm of expandNames(main, Math.ceil(n / 3 + 6), rng)) nameBag.push([nm, main]);
      for (const nm of expandNames(sub, Math.ceil(n * 0.15 + 4), rng)) nameBag.push([nm, sub]);
    }
    for (let i = nameBag.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [nameBag[i], nameBag[j]] = [nameBag[j], nameBag[i]]; }
  }
  const uniq = [];
  const seenNm = new Set();
  for (const entry of nameBag) {
    if (seenNm.has(entry[0]) || usedNameByColor[col].has(entry[0])) continue;
    seenNm.add(entry[0]); uniq.push(entry);
  }
  const nActual = Math.min(n, uniq.length);
  planByColor[col] = { n: nActual, nameBag: uniq };
  grandActual += nActual;
}
// gear 新增量（重名跳过=0 张）
for (const col of COLORS) {
  for (let i = 0; i < 3; i++) if (!usedNameByColor[col].has(GEAR_NAMES[col][i])) gearActual++;
}
// 占比红线（与 check-pool3 FREQ_PCT 同值）。预算基准锚定 TARGET_TOTAL（恒定）：
// 实测教训——按「名字池实际容量」估 FINAL_TOTAL 会把预算压小（~700），生成顺序前四色吃光热门 op，
// 紫黑饿死（紫 damageLP=0 → 卡组零终结 → 绿v紫 84%）；0.8 系数对门禁 cap=round(实际量×pct) 留余量
const FREQ_PCT = { draw: 10, gainDon: 4, healLP: 4, damageLP: 5, koWeakest: 2, restEnemy: 5, buffAll: 3.5, debuffFoeAll: 2.5, search: 4, revive: 1, powerSelf: 2 };
const KW_PCT = { doubleAttack: 3, banish: 2 };
const opBudget = (k) => Math.floor(TARGET_TOTAL * (FREQ_PCT[k] || 2) / 100 * 0.8);
const kwBudget = (k) => Math.floor(TARGET_TOTAL * (KW_PCT[k] || 2) / 100 * 0.8);
// 每色伤害类保底（balance-sim 100 局实证：紫池 damageLP=0/DA=0 → 默认卡组零终结 → 绿v紫 84% 全场最宽）。
// 全池预算 + 均匀加权会把伤害额度随机倾斜到 1-2 个色；单一 op 红线（damageLP 5%）也容不下六色各 8——
// 改「终结家族」口径：damageLP+restEnemy+koWeakest+debuffFoeAll 每色合计 ∈ [10,18]（家族红线合计 14.5% 容得下），
// 家族内缺额时从预算内家族词优先发，超额停发；保底判定绕过单 op 预算排序（前色吃满预算会把后色饿死，紫实测）
const perColorOp = Object.fromEntries(COLORS.map((c) => [c, {}]));
const perColorKw = Object.fromEntries(COLORS.map((c) => [c, {}]));
for (const c of pool3) {
  if (isFusionCard(c) || c.type !== 'char') continue;
  (c.keywords || []).forEach((k) => perColorKw[c.color][k] = (perColorKw[c.color][k] || 0) + 1);
  if (c.effect) for (const op of (Array.isArray(c.effect.op) ? c.effect.op : [c.effect.op])) perColorOp[c.color][op.k] = (perColorOp[c.color][op.k] || 0) + 1;
}
const FINISHERS = ['damageLP', 'koWeakest'];              // 真终结（直伤/去除）——restEnemy 是横置软控、debuff 是临时减益，不转化胜势（紫 rest13 仍 17% 胜率实证）
const SOFT_CTRL = ['restEnemy', 'debuffFoeAll'];          // 软控家族：每色上限，堆太多=卡组无火力
const FAMILY_FLOOR = 4, FAMILY_CAP = 7;                   // damageLP 5% 红线 44 ÷ 6 色 ≈ 7.3 → cap7 全池 ≤42 贴线安全
const SOFT_CAP = 10;
const famCount = (col) => FINISHERS.reduce((n, k) => n + (perColorOp[col][k] || 0), 0);
const KW_PER_COLOR = { doubleAttack: [1, 6], banish: [0, 8] }; // 词条每色 [floor, cap]：DA 六色各≥1（紫黑曾 0），防红吃独食（红曾 11）
// 按剩余额度加权选 op（均匀 pick 会让 weak 池热门词承压超限、strong 词缺额）
const pickWeighted = (cands, budgetOf) => {
  const w = cands.map((k) => Math.max(1, budgetOf(k) - (opCnt[k] || 0)));
  let r = rng() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < cands.length; i++) { r -= w[i]; if (r <= 0) return cands[i]; }
  return cands[cands.length - 1];
};

// fruit 记账（目标能力者 ~25%，paramecia 55-62%）
let fruitCnt = { paramecia: 0, logia: 0, zoan: 0 };
pool3.forEach((c) => { if (c.fruit) fruitCnt[c.fruit]++; });

// ===== rarityOf（与 check-pool3 严格同构——升级点：费8+词条+效果 → SSS，双门禁同步）=====
function rarityOf(c) {
  if (c.fusion) return 'SSS';
  if (c.type === 'gear') return { 1000: 'A', 2000: 'B', 3000: 'S' }[c.gear.atk];
  const kw = (c.keywords || []).length, eff = c.effect !== null;
  if (c.cost === 8 && c.power === 9000) return 'SSS';
  if (c.cost === 8 && kw >= 1 && eff) return 'SSS';
  if (c.cost === 8 || kw >= 2) return 'SS';
  if ((kw > 0 && eff) || c.cost >= 7) return 'S';
  if (kw > 0 || eff) return 'B';
  return 'A';
}

// ===== 单卡生成 =====
const made = [];
function genCard(color, faction, name, forceRarity) {
  // 费用曲线（低费多）：1/2/3/4/5/6/7/8 权重；高稀有度偏移
  const COST_W = { A: [16, 20, 22, 16, 12, 8, 4, 2], B: [10, 16, 20, 20, 14, 10, 6, 4], S: [4, 8, 14, 20, 20, 16, 10, 8], SS: [0, 2, 6, 12, 20, 24, 20, 16], SSS: [0, 0, 0, 0, 0, 0, 0, 10] };
  const weights = COST_W[forceRarity];
  let acc = weights.reduce((a, b) => a + b, 0), r = rng() * acc, cost = 1;
  for (let i = 0; i < 8; i++) { r -= weights[i]; if (r <= 0) { cost = i + 1; break; } }

  const base = (cost + 1) * 1000;
  const kwTarget = { A: rng() < 0.35 ? 1 : 0, B: 1, S: 1, SS: rng() < 0.55 ? 2 : 1, SSS: 1 }[forceRarity];
  const effTarget = { A: 0, B: rng() < 0.5 ? 1 : 0, S: 1, SS: rng() < 0.5 ? 1 : 0, SSS: 1 }[forceRarity];
  // 词条选择（T2 有费/色门槛；频率预算 + 每色 [floor,cap] 均衡）
  const keywords = [];
  for (let i = 0; i < kwTarget; i++) {
    const useT2 = cost >= 5 && chance(0.28);
    if (useT2) {
      // 每色缺额词条绕过预算排序直接发（上限=门禁预估红线：DA 3%×目标量）
      const hardCap = (k) => Math.floor(TARGET_TOTAL * (KW_PCT[k] || 3) / 100 * 0.96);
      const floorCand = Object.entries(KW_T2).find(([k, r2]) => cost >= r2.minCost && (!r2.colors || r2.colors.includes(color))
        && (perColorKw[color][k] || 0) < KW_PER_COLOR[k][0] && kwCnt[k] < hardCap(k));
      if (floorCand) {
        const k = floorCand[0];
        keywords.push(k); kwCnt[k]++; perColorKw[color][k] = (perColorKw[color][k] || 0) + 1; continue;
      }
      const cands = Object.entries(KW_T2).filter(([k, r2]) => cost >= r2.minCost && (!r2.colors || r2.colors.includes(color))
        && kwCnt[k] < kwBudget(k) && (perColorKw[color][k] || 0) < KW_PER_COLOR[k][1]);
      if (cands.length) {
        const k = pick(cands)[0];
        keywords.push(k); kwCnt[k]++; perColorKw[color][k] = (perColorKw[color][k] || 0) + 1; continue;
      }
    }
    keywords.push(pick(KW_T1));
  }
  // 效果（档位+色约束+频率预算+参数域）
  let effect = null;
  if (effTarget) {
    const weak = ['powerSelf', 'healLP', 'damageLP', 'restEnemy'];
    const mid = ['draw', 'gainDon', 'buffAll', 'debuffFoeAll'];
    const strong = ['search', ...(color === 'black' ? ['koWeakest'] : []), ...(['SS', 'SSS'].includes(forceRarity) && cost >= 5 ? ['revive'] : [])];
    const tier = forceRarity === 'B' ? weak : forceRarity === 'S' ? [...weak, ...mid] : [...weak, ...mid, ...strong];
    let cands = tier.filter((k) => opCnt[k] == null || opCnt[k] < opBudget(k));
    // 每色均衡：真终结家族 ∈[4,7]（缺额绕预算排序直发——前色吃满预算会把后色饿死，紫实测 damageLP=0）；
    // 软控每色 ≤10；绕行以门禁预估红线（TARGET×pct×0.96）为绝对上限，写盘前对账阀兜底
    const hardCapOp = (k) => Math.floor(TARGET_TOTAL * FREQ_PCT[k] / 100 * 0.96);
    if (famCount(color) >= FAMILY_CAP) cands = cands.filter((k) => !FINISHERS.includes(k));
    else if (famCount(color) < FAMILY_FLOOR) {
      const fam = cands.filter((k) => FINISHERS.includes(k));
      if (!fam.length) {
        const redlined = FINISHERS.filter((k) => tier.includes(k) && (opCnt[k] || 0) < hardCapOp(k));
        if (redlined.length) cands = redlined;
      }
    }
    for (const k of SOFT_CTRL) {
      if ((perColorOp[color][k] || 0) >= SOFT_CAP) cands = cands.filter((x) => x !== k);
    }
    if (cands.length) {
      const famPrio = famCount(color) < FAMILY_FLOOR ? cands.find((k) => FINISHERS.includes(k)) : null;
      const k = famPrio || pickWeighted(cands, opBudget);
      const op = { k };
      if (k === 'powerSelf') op.x = 1000 * (1 + Math.floor(rng() * 3));
      if (['powerLeader', 'healLP', 'debuffFoeAll', 'buffAll', 'damageLP'].includes(k)) op.x = 1000 * (1 + Math.floor(rng() * 2));
      if (['draw', 'gainDon'].includes(k)) op.n = rng() < 0.25 ? 2 : 1;
      if (k === 'restEnemy' && chance(0.4)) op.target = pick(['last', 'strongest', 'weakest']);
      if (k === 'search') { op.n = 1; if (chance(0.7)) op.faction = faction; }
      if (k === 'revive') op.maxCost = pick([3, 4, 5]);
      if (k === 'powerSelf' && chance(0.5)) op.until = 'battle';
      const hook = chance(0.7) ? 'onPlay' : chance(0.65) ? 'whenAttacking' : 'onKO';
      effect = { hook, op };
      opCnt[k] = (opCnt[k] || 0) + 1;
      perColorOp[color][k] = (perColorOp[color][k] || 0) + 1;
    }
  }
  // 战力（F12 公式：power=base−(kw×1000+eff×1000)，SSS 双白板特例在结构层保证）
  const deduct = keywords.length * 1000 + (effect ? 1000 : 0);
  let power = Math.max(cost * 1000, base - deduct);
  if (forceRarity === 'SSS' && keywords.length === 0 && !effect) power = 9000; // 费8白板天花板（cost=8 时 base=9000 自然成立）
  // 结构回校（rarityOf 必须等于 forceRarity，不满足则降档重试由外层处理）
  const card = {
    id: `${UPPER[color]}-${seq[color].char++}`,
    name, sub: ` ${pick(SUB_POOL[faction])} `, type: 'char', color, cost, power,
    counter: cost <= 5 ? (chance(0.35) ? 1000 : chance(0.15) ? 2000 : null) : null,
    keywords, effect, art: null, // art 末尾统一回填=id
    fruit: null, rarity: forceRarity,
    faction,
    formation: null,
    arc: chance(0.3) ? ARC_DEFAULT[color] : null,
  };
  // formation（色倾向治绿霸权：green 偏 bulwark / purple·red 偏 vanguard / yellow 偏 skirmish）
  const fBias = { green: ['bulwark', 0.42], purple: ['vanguard', 0.4], red: ['vanguard', 0.38], yellow: ['skirmish', 0.4], blue: ['bulwark', 0.36], black: ['bulwark', 0.32] }[color];
  const fr = rng();
  if (fr < fBias[1]) card.formation = fBias[0];
  else if (fr < fBias[1] + 0.28) card.formation = pick(['vanguard', 'bulwark', 'skirmish'].filter((f) => f !== fBias[0]));
  else if (fr < fBias[1] + 0.28 + 0.24) card.formation = 'skirmish' === fBias[0] ? 'vanguard' : 'skirmish';
  // fruit（能力者 ~25%；paramecia 55-62% 记账控比）
  if (chance(0.25)) {
    const pShare = fruitCnt.paramecia / Math.max(1, fruitCnt.paramecia + fruitCnt.logia + fruitCnt.zoan);
    card.fruit = pShare < 0.58 ? 'paramecia' : pick(['paramecia', 'logia', 'zoan', 'zoan']);
    fruitCnt[card.fruit]++;
  }
  card.art = card.id;
  return card;
}

// ===== 每色生成（archetype 轮转 + 名字全局去重）=====
const RARITY_PLAN = (n) => {
  const out = [];
  out.push(...Array(Math.round(n * 0.40)).fill('A'), ...Array(Math.round(n * 0.30)).fill('B'),
    ...Array(Math.round(n * 0.20)).fill('S'), ...Array(Math.round(n * 0.07)).fill('SS'), ...Array(n - Math.round(n * 0.40) - Math.round(n * 0.30) - Math.round(n * 0.20) - Math.round(n * 0.07)).fill('SSS'));
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
};

for (const col of COLORS) {
  const { n, nameBag } = planByColor[col];
  if (n <= 0) continue;

  const plan = RARITY_PLAN(n);
  let made4color = 0, attempts = 0;
  while (made4color < n && nameBag.length && attempts < n * 30) {
    attempts++;
    const [name, faction] = nameBag.pop();
    if (usedNameByColor[col].has(name)) continue;
    const card = genCard(col, faction, name, plan[made4color]);
    // 结构回校：rarityOf 不达目标档（低费 SS/SSS 结构不可达）→ 降档重标；
    // 降档到 SS 以下时须摘除档位专属 op（revive 仅 SS/SSS），并按新结构重算 power
    const actual = rarityOf(card);
    if (actual !== card.rarity) {
      card.rarity = actual;
      if (card.effect && Array.isArray(card.effect.op) ? card.effect.op.some((o) => o.k === 'revive')
        : card.effect && card.effect.op && card.effect.op.k === 'revive') {
        if (!['SS', 'SSS'].includes(actual)) {
          const ops = Array.isArray(card.effect.op) ? card.effect.op : [card.effect.op];
          const kept = ops.filter((o) => o.k !== 'revive');
          if (kept.length) card.effect.op = kept.length === 1 ? kept[0] : kept;
          else card.effect = null;
          card.power = Math.max(card.cost * 1000, (card.cost + 1) * 1000
            - (card.keywords.length * 1000 + (card.effect ? 1000 : 0)));
          card.rarity = rarityOf(card); // power 变化可能再动档，二次收敛
        }
      }
    }
    usedNameByColor[col].add(name);
    made.push(card); perColorSrc[col].push(card); pool3.push(card);
    made4color++;
  }
  if (made4color < n) console.log(`WARN ${col} 名字池耗尽：只生成 ${made4color}/${n}`);
}

// ===== gear 补充（每色 3 张：atk 1K/2K/3K → A/B/S）=====
for (const col of COLORS) {
  const atks = [1000, 2000, 3000];
  for (let i = 0; i < 3; i++) {
    const name = GEAR_NAMES[col][i];
    if (usedNameByColor[col].has(name)) continue;
    const g = { id: `${UPPER[col]}-G${seq[col].gear++}`, name, sub: ` ${pick(SUB_POOL[ARCH[col][0][0]])} `, type: 'gear', color: col,
      cost: atks[i] === 3000 ? 3 : 2, power: null, counter: null, keywords: [], effect: null, art: null, fruit: null,
      rarity: { 1000: 'A', 2000: 'B', 3000: 'S' }[atks[i]], gear: { atk: atks[i] }, faction: ARCH[col][0][0], formation: null, arc: null };
    g.art = g.id;
    usedNameByColor[col].add(name);
    made.push(g); perColorSrc[col].push(g); pool3.push(g);
  }
}

// ===== 汇总与写入 =====
const rarDist = {};
made.forEach((c) => rarDist[c.rarity] = (rarDist[c.rarity] || 0) + 1);
const fDist = {};
made.forEach((c) => { const f = c.faction; fDist[f] = (fDist[f] || 0) + 1; });
const fmt = {};
made.forEach((c) => { const f = c.formation || 'null'; fmt[f] = (fmt[f] || 0) + 1; });
console.log(`生成 ${made.length} 张 | 稀有度 ${JSON.stringify(rarDist)} | 阵营 ${JSON.stringify(fDist)} | 阵型 ${JSON.stringify(fmt)}`);
console.log(`op 计数 ${JSON.stringify(opCnt)} | kw ${JSON.stringify(kwCnt)}`);

if (DRY) { console.log('DRY-RUN 不写盘'); process.exit(0); }

// ===== 写盘前对账阀：绕行保底可能超门禁实际 cap（round(实际量×pct)），超额定向降级 =====
// 降级=摘除效果并重算 power/rarity（deduct-1K → power+1K → rarityOf 二次收敛；词条侧 DA→rush 同费率免重算）
{
  const realTotal = (extra) => pool3.filter((c) => !isFusionCard(c)).length + made.filter((c) => !isFusionCard(c) && c.type === 'char').length + (extra || 0);
  const realCap = (pct) => Math.round(realTotal() * pct / 100);
  for (const [k, pct] of Object.entries(FREQ_PCT)) {
    let over = (opCnt[k] || 0) - realCap(pct);
    if (over <= 0) continue;
    for (let i = made.length - 1; i >= 0 && over > 0; i--) {
      const c = made[i];
      if (c.type !== 'char' || !c.effect) continue;
      const ops = Array.isArray(c.effect.op) ? c.effect.op : [c.effect.op];
      if (!ops.some((o) => o.k === k)) continue;
      const kept = ops.filter((o) => o.k !== k);
      if (kept.length) c.effect.op = kept.length === 1 ? kept[0] : kept;
      else c.effect = null;
      opCnt[k]--;
      c.power = Math.max(c.cost * 1000, (c.cost + 1) * 1000 - (c.keywords.length * 1000 + (c.effect ? 1000 : 0)));
      c.rarity = rarityOf(c);
      over--;
    }
    if (over > 0) console.log(`WARN op ${k} 对账后仍超 ${over} 张（存量带入，门禁可能 FAIL）`);
  }
  for (const [k, pct] of Object.entries(KW_PCT)) {
    let over = (kwCnt[k] || 0) - realCap(pct);
    if (over <= 0) continue;
    for (let i = made.length - 1; i >= 0 && over > 0; i--) {
      const c = made[i];
      if (c.type !== 'char' || !c.keywords.includes(k)) continue;
      c.keywords = c.keywords.map((x) => (x === k ? 'rush' : x)); // 同费率替换：power/rarity 不动
      kwCnt[k]--; kwCnt.rush = (kwCnt.rush || 0) + 1;
      over--;
    }
    if (over > 0) console.log(`WARN kw ${k} 对账后仍超 ${over} 张`);
  }
}

// 备份（首跑）
const BAK = './data/backup/pre-expansion';
if (!existsSync(BAK)) {
  mkdirSync(BAK, { recursive: true });
  copyFileSync('./data/cards.json', `${BAK}/cards.json`);
  copyFileSync('./data/cards-pool3.json', `${BAK}/cards-pool3.json`);
  for (const col of COLORS) copyFileSync(`./data/pool3/${col}.json`, `${BAK}/${col}.json`);
  console.log('已备份三源 →', BAK);
}
cardsJson.cards.push(...made);
// 保序追加不排序：全局 id 排序会把 FUSION-* 排到色卡前（F<R 字典序），
// tests/cards.test.js 组卡组 slice(0,50) 会误取融合卡——既有顺序语义（fusion 居尾）保持不动
writeFileSync('./data/cards.json', JSON.stringify(cardsJson, null, 2) + '\n', 'utf8');
writeFileSync('./data/cards-pool3.json', JSON.stringify(pool3, null, 2) + '\n', 'utf8');
for (const col of COLORS) writeFileSync(`./data/pool3/${col}.json`, JSON.stringify(perColorSrc[col], null, 2) + '\n', 'utf8');
console.log(`已写入三源：cards.json 现 ${cardsJson.cards.length} 张；pool3 源 ${pool3.length} 张`);
