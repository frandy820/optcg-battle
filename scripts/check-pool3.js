// POOL-3 扩卡门禁：node scripts/check-pool3.js —— 校验 data/cards-pool3.json
// 规格真值源 = docs/pool3-spec.md（生成期快照 308 张）；运营期（删虚卡 2026-09-20）起总量/合计/连续性断言退役，
// G1a（2026-09-20）：event/stage 全删 + 同色同名去重 + G3 稀有度分级后，
// 保留不变量：schema/同步/唯一性/同色同名唯一/禁 event·stage/数值域/rarity/effect 白名单/频率红线/每色采样下限（deckOf 够用）
import { readFileSync } from 'node:fs';

const existing = JSON.parse(readFileSync('./data/cards.json', 'utf8'));
const cards = JSON.parse(readFileSync('./data/cards-pool3.json', 'utf8'));
// F12 平衡微调表（±1000 贴窗，≤10 张额度）：微调卡须与表值一致且仍在窗内；真值源 data/power-tuned.json
const POWER_TUNED = Object.fromEntries(Object.entries(
  JSON.parse(readFileSync('./data/power-tuned.json', 'utf8')).tuned,
).map(([id, t]) => [id, t.power]));
const errs = [], warns = [];
const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'black'];
// F13 融合卡：id 形如 FUSION-{COLOR}{n}，art 指向主素材图≠id，不进 deckOf → 不占频率红线额度
const isFusion = (c) => typeof c.id === 'string' && c.id.startsWith('FUSION-');
const CARD_HOOKS = ['onPlay', 'whenAttacking', 'onKO', 'trigger'];
const OPS = ['draw', 'powerSelf', 'powerLeader', 'gainDon', 'koWeakest', 'restEnemy', 'healLP', 'damageLP', 'buffAll', 'debuffFoeAll', 'discard'];
const KW_CAPS = { doubleAttack: 8, banish: 5 };
const FREQ_CAPS = { draw: 60, gainDon: 25, healLP: 20, damageLP: 30, koWeakest: 10, restEnemy: 30, buffAll: 20, debuffFoeAll: 12 };
const ABSTRACT = ['黎明', '新时代', '羁绊', '梦想', '希望', '时代', '意志'];

// ===== 总量与结构 =====
if (!Array.isArray(cards)) { console.error('FATAL pool3 必须是数组'); process.exit(1); }

// 分色源 ↔ 合并源同步校验（三处同步铁律：cards.json / cards-pool3.json / data/pool3/{color}.json）
{
  const merged = new Map(cards.map(c => [c.id, c]));
  for (const col of COLORS) {
    const src = JSON.parse(readFileSync(`./data/pool3/${col}.json`, 'utf8'));
    const srcIds = new Set(src.map(c => c.id));
    if (src.length !== srcIds.size) errs.push(`${col}.json 存在重复 id`);
    for (const c of src) {
      const m = merged.get(c.id);
      if (!m) { errs.push(`${c.id}: 在 ${col}.json 但不在 cards-pool3.json`); continue; }
      for (const f of ['name', 'sub', 'type', 'cost', 'power', 'counter', 'effect', 'keywords', 'gear', 'fruit', 'rarity']) {
        if (JSON.stringify(m[f]) !== JSON.stringify(c[f])) errs.push(`${c.id}: cards-pool3 与 ${col}.json 不同步（${f}）`);
      }
    }
    for (const c of cards) {
      const inColorFile = c.id.toLowerCase().startsWith(col) || (isFusion(c) && c.color === col);
      if (inColorFile && !srcIds.has(c.id)) errs.push(`${c.id}: 在 cards-pool3.json 但不在 ${col}.json`);
    }
  }
}

const existIds = new Set([...existing.cards.map(c => c.id), ...existing.leaders.map(c => c.id)]);
// 合入后语义：cards.json 已含 308 新卡 → 同 id 不再报「冲突」，改为两处记录一致性校验（防手工只改一处漂移）
const existById = new Map(existing.cards.map(c => [c.id, c]));
const seen = new Map();
const seenName = new Map(); // color|name → G1a 同色同名唯一断言
const perColorType = {}; // color -> {char:0,event:0,stage:0,gear:0}
const kwCount = {};
const opCount = {};
const distinctNames = {}; // color -> Set
const fruitCount = {};
const newIdsBySlot = {}; // 'red:char' -> [nums]

for (const c of cards) {
  const where = c.id || '(no-id)';
  // ---- schema ----
  for (const f of ['id', 'name', 'sub', 'type', 'color', 'cost', 'power', 'counter', 'keywords', 'art', 'fruit', 'rarity']) {
    if (!(f in c)) errs.push(`${where}: 缺字段 ${f}`);
  }
  if (errTooMany()) continue;
  if (!isFusion(c) && !/^(RED|BLUE|GREEN|YELLOW|PURPLE|BLACK)(-E|-S|-G)?-?\d+$/.test(c.id)) errs.push(`${where}: id 格式非法`);
  if (isFusion(c) && !/^FUSION-(RED|BLUE|GREEN|YELLOW|PURPLE|BLACK)\d+$/.test(c.id)) errs.push(`${where}: 融合卡 id 格式非法（须 FUSION-{COLOR}{n}）`);
  if (!!c.fusion !== isFusion(c)) errs.push(`${where}: fusion 字段与 id 前缀须一致（FUSION- 卡必带 fusion，普通卡禁带）`);
  if (existById.has(c.id)) {
    const m = existById.get(c.id);
    for (const f of ['name', 'sub', 'type', 'color', 'cost', 'power', 'counter', 'keywords', 'effect', 'fruit', 'rarity']) {
      if (JSON.stringify(m[f]) !== JSON.stringify(c[f])) errs.push(`${where}: 与主库不同步（${f}: pool3=${JSON.stringify(c[f])} 主库=${JSON.stringify(m[f])}）——两处必须同步改`);
    }
  } else if (!/^LEADER/.test(c.id) && existIds.has(c.id)) errs.push(`${where}: 与现有库冲突`);
  // G1a：同色同名唯一（char 非融合；每组只留 1 张，融合卡名自带组合不占组）
  if (c.type === 'char' && !isFusion(c)) {
    const nk = `${c.color}|${c.name}`;
    if (seenName.has(nk)) errs.push(`${where}: 同色同名重复 ${nk}（G1a 去重后每组只留 1 张）`);
    seenName.set(nk, true);
  }
  if (seen.has(c.id)) errs.push(`${where}: 重复 ${seen.get(c.id)}`);
  seen.set(c.id, true);
  if (c.art !== c.id && !isFusion(c)) errs.push(`${where}: art 必须=id`);
  // 融合配方校验：素材 2 张全存在（主库、非融合卡）、cost 2-3、art=主素材图（取自配方内）
  if (isFusion(c)) {
    const f = c.fusion;
    if (!f || !Array.isArray(f.from) || f.from.length !== 2 || f.from.some((x) => typeof x !== 'string')) {
      errs.push(`${where}: fusion.from 须为 2 个素材 id`);
    } else {
      for (const mid of f.from) {
        const m0 = existing.cards.find((x) => x.id === mid);
        if (!m0) errs.push(`${where}: 素材 ${mid} 不在主库`);
        else if (m0.fusion) errs.push(`${where}: 素材 ${mid} 本身是融合卡（禁止套娃）`);
        else if (m0.color !== c.color) errs.push(`${where}: 素材 ${mid} 颜色 ${m0.color} 与融合体 ${c.color} 不符`);
      }
      if (!Number.isInteger(f.cost) || f.cost < 2 || f.cost > 3) errs.push(`${where}: fusion.cost 须 2-3`);
      if (!f.from.includes(c.art)) errs.push(`${where}: art ${c.art} 须为配方内素材图`);
    }
  }
  if (typeof c.name !== 'string' || !c.name.trim()) errs.push(`${where}: name 空`);
  if (typeof c.sub !== 'string' || !/^ .+ $/.test(c.sub)) errs.push(`${where}: sub 须前后各一空格，got "${c.sub}"`);
  // 抽象概念卡红线防「新时代/羁绊」类无角色落点卡；融合卡名=两名具体角色组合（如火之意志 艾斯&萨博），豁免
  if (!isFusion(c) && ABSTRACT.some(w => (c.name + c.sub).includes(w))) errs.push(`${where}: 疑似抽象概念卡 "${c.name}"`);
  const colRaw = isFusion(c)
    ? c.id.slice('FUSION-'.length).replace(/\d+$/, '').toLowerCase()
    : c.id.match(/^(RED|BLUE|GREEN|YELLOW|PURPLE|BLACK)/)[0].toLowerCase();
  if (c.color !== colRaw) errs.push(`${where}: color ${c.color} 与 id 前缀 ${colRaw} 不符`);
  if (!COLORS.includes(c.color)) errs.push(`${where}: color 非法`);
  if (!['char', 'gear'].includes(c.type)) errs.push(`${where}: type 非法 ${c.type}（G1a 后仅 char/gear）`);
  if (c.type === 'event' || c.type === 'stage') errs.push(`${where}: event/stage 已全删（G1a），不得再出现`);
  if (c.type !== 'char' && (c.power !== null || c.counter !== null)) errs.push(`${where}: 非 char 须 power/counter=null`);
  if (c.type !== 'gear' && c.gear) errs.push(`${where}: 非 gear 不许 gear 字段`);
  if (c.type === 'gear' && !c.gear) errs.push(`${where}: gear 须 gear.atk`);

  // ---- G3 稀有度分级（2026-09-20）：取值与推导规则双校验（与 scripts/cleanup-g1a-g3.mjs 同构）----
  {
    const rarityOf = (x) => {
      if (x.fusion) return 'SSS';                                    // 融合卡 12 张全部 SSS
      if (x.type === 'gear') return { 1000: 'A', 2000: 'B', 3000: 'S' }[x.gear.atk]; // +1K=A/+2K=B/+3K=S
      const kw = (x.keywords || []).length, eff = x.effect !== null;
      if (x.cost === 8 && x.power === 9000) return 'SSS';            // 费顶配战力天花板
      if (x.cost === 8 || kw >= 2) return 'SS';                      // cost=8 或 词条≥2
      if ((kw > 0 && eff) || x.cost >= 7) return 'S';                // 词条+效果双全 或 cost≥7
      if (kw > 0 || eff) return 'B';
      return 'A';                                                    // 白板
    };
    if (!['A', 'B', 'S', 'SS', 'SSS'].includes(c.rarity)) errs.push(`${where}: rarity 取值非法 ${JSON.stringify(c.rarity)}`);
    else if (c.rarity !== rarityOf(c)) errs.push(`${where}: rarity ${c.rarity} ≠ 规则推导值 ${rarityOf(c)}`);
  }

  // ---- 数量记账 ----
  perColorType[c.color] = perColorType[c.color] || { char: 0, gear: 0 };
  perColorType[c.color][c.type]++;
  if (c.type === 'char') {
    (distinctNames[c.color] = distinctNames[c.color] || new Set()).add(c.name.replace(/(两年后|霸气|觉醒|五档|月狮|恶灵)?$/, '').replace(/·.*$/, '·'));
  }

  // ---- 编号 ----（融合卡独立序列，不占普通编号槽）
  if (!isFusion(c)) {
    const m = c.id.match(/^(RED|BLUE|GREEN|YELLOW|PURPLE|BLACK)(-E|-S|-G)?-?(\d+)$/);
    const slot = `${colRaw}:${m[2] ? { '-E': 'event', '-S': 'stage', '-G': 'gear' }[m[2]] : 'char'}`;
    (newIdsBySlot[slot] = newIdsBySlot[slot] || []).push(+m[3]);
  }

  // ---- 数值域 ----
  const cost = c.cost;
  if (!Number.isInteger(cost) || cost < 1) errs.push(`${where}: cost 非法`);
  if (c.type === 'char') {
    if (cost > 8) errs.push(`${where}: char cost>8`);
    // F12 战力公式（2026-09-20 定稿，六色统一，绿色高费特权废除）：
    //   base=(cost+1)*1000；扣减=keywords×1000 + (effect!==null)×1000；
    //   power = clamp(base-扣减, max(cost*1000, base-2000), base)，1000 步进
    const base = (cost + 1) * 1000;
    const lo = Math.max(cost * 1000, base - 2000); // base-2000=(cost-1)K ≤ costK，故下限恒为 cost*1000
    if (c.power % 1000 !== 0) errs.push(`${where}: power ${c.power} 须 1000 步进`);
    if (c.power < lo || c.power > base) errs.push(`${where}: power ${c.power} 越窗 [${lo},${base}]`);
    const deduct = (c.keywords || []).length * 1000 + (c.effect ? 1000 : 0);
    const expect = Math.max(lo, Math.min(base, base - deduct));
    if (c.id in POWER_TUNED) {
      if (c.power !== POWER_TUNED[c.id]) errs.push(`${where}: 微调表值 ${POWER_TUNED[c.id]} 与实际 ${c.power} 不符`);
    } else if (c.power !== expect) {
      errs.push(`${where}: power ${c.power} ≠ 公式值 ${expect}（base=${base} 扣减=${deduct}，有词条/效果未扣或白板超基准）`);
    }
    if (![null, 1000, 2000].includes(c.counter)) errs.push(`${where}: counter 非法`);
    if (c.counter === 2000 && cost >= 6) errs.push(`${where}: cost>=6 不得 counter2000`);
    if (!['paramecia', 'logia', 'zoan', null].includes(c.fruit)) errs.push(`${where}: fruit 非法`);
    if (c.fruit) fruitCount[c.fruit] = (fruitCount[c.fruit] || 0) + 1;
  } else if (c.type === 'gear') {
    if (cost < 2 || cost > 3) errs.push(`${where}: gear cost 须 2-3`);
    const atk = c.gear && c.gear.atk;
    if (![1000, 2000, 3000].includes(atk)) errs.push(`${where}: gear.atk 非法`);
    if (atk === 3000 && cost < 3) errs.push(`${where}: atk3000 须 cost3`);
  }

  // ---- keywords ----
  const kws = c.keywords || [];
  if (!Array.isArray(kws)) errs.push(`${where}: keywords 须数组`);
  for (const k of kws) {
    if (!['rush', 'blocker', 'doubleAttack', 'banish'].includes(k)) errs.push(`${where}: keyword 非法 ${k}`);
    if (!isFusion(c)) kwCount[k] = (kwCount[k] || 0) + 1; // 融合卡不进 deckOf：不占频率额度
  }
  if (kws.includes('doubleAttack') && cost < 6) errs.push(`${where}: doubleAttack 须 cost>=6`);
  if (kws.includes('banish') && cost < 5) errs.push(`${where}: banish 须 cost>=5`);
  if (kws.includes('banish') && c.color !== 'black' && c.color !== 'green') warns.push(`${where}: banish 非 black/green`);

  // ---- effect 白名单 ----
  const eff = c.effect;
  if (eff !== null && typeof eff !== 'object') errs.push(`${where}: effect 须对象或 null`);
  if (eff) {
    if (!CARD_HOOKS.includes(eff.hook)) errs.push(`${where}: 卡牌 hook ${eff.hook} 越界（仅 ${CARD_HOOKS.join('/')}）`);
    const ops = Array.isArray(eff.op) ? eff.op : [eff.op];
    if (ops.length > 2) errs.push(`${where}: 复合 op 长度>2`);
    for (const op of ops) {
      if (!op || !OPS.includes(op.k)) { errs.push(`${where}: op.k 越界 ${op && op.k}`); continue; }
      if (!isFusion(c)) opCount[op.k] = (opCount[op.k] || 0) + 1; // 融合卡不进 deckOf：不占频率额度
      const t = typeof op.x === 'number' ? op.x : null;
      if (['powerSelf'].includes(op.k) && (t === null || t < 1000 || t > 3000 || t % 1000)) errs.push(`${where}: powerSelf.x 非法`);
      if (['powerLeader', 'healLP', 'debuffFoeAll'].includes(op.k) && (t === null || t < 1000 || t > 2000 || t % 1000)) errs.push(`${where}: ${op.k}.x 非法`);
      if (['buffAll'].includes(op.k) && (t === null || t < 1000 || t > 2000 || t % 1000)) errs.push(`${where}: buffAll.x 非法`);
      if (['damageLP'].includes(op.k)) { if (t === null || t < 1000 || t > 2000 || t % 1000) errs.push(`${where}: damageLP.x 非法`); if (t === 2000 && c.type === 'event' && cost < 3) errs.push(`${where}: damageLP2000 须 event cost>=3`); }
      if (['draw', 'gainDon', 'discard'].includes(op.k) && (![1, 2].includes(op.n))) errs.push(`${where}: ${op.k}.n 非法`);
      if (op.k === 'draw' && op.n === 3 && cost < 3) errs.push(`${where}: draw3 须 cost>=3`);
      if (op.k === 'koWeakest' && c.color !== 'black') errs.push(`${where}: koWeakest 仅 black`);
      if (op.k === 'restEnemy' && op.target && !['last', 'strongest', 'weakest'].includes(op.target)) errs.push(`${where}: restEnemy.target 非法`);
      if (op.until && !['turn', 'battle'].includes(op.until)) errs.push(`${where}: until 非法`);
    }
    const hasDiscard = ops.some(o => o.k === 'discard');
    if (hasDiscard && ops.length === 1) errs.push(`${where}: discard 不得单独出现`);
  }
  function errTooMany() { return errs.length > 200; }
}

// ===== 每色数量（运营期：pool3 源保底结构——deckOf 采样走主库不受此限） =====
// G1a 后实际结构：char 每色 16-25（blue 最少 16）、gear 每色 2-4（black/purple/yellow 最少 2），下限按实际收紧
const MIN = { char: 16, gear: 2 };
const sums = { char: 0, gear: 0 };
for (const col of COLORS) {
  const pc = perColorType[col] || { char: 0, gear: 0 };
  for (const t of Object.keys(MIN)) {
    if (pc[t] < MIN[t]) errs.push(`${col}.${t}=${pc[t]} < 源结构下限 ${MIN[t]}`);
    sums[t] += pc[t];
  }
  const names = distinctNames[col] || new Set();
  // G1a 去重后 pool3 源每色具名 16-25（blue/purple 最少 16），下限按运营期实际结构调整
  if (names.size < 16) errs.push(`${col} 具名角色数 ${names.size} <16（多版本归并后）`);
}
// 编号连续性断言已退役：运营期删卡=跳号合法（官方卡表惯例）

// ===== 全库频率红线 =====
for (const [k, cap] of Object.entries(FREQ_CAPS)) if ((opCount[k] || 0) > cap) errs.push(`op ${k} 共 ${opCount[k]} 张 > 上限 ${cap}`);
for (const [k, cap] of Object.entries(KW_CAPS)) if ((kwCount[k] || 0) > cap) errs.push(`keyword ${k} 共 ${kwCount[k]} 张 > 上限 ${cap}`);

// ===== fruit 分布（WARN） =====
const fr = Object.entries(fruitCount);
const frTotal = fr.reduce((n, [, v]) => n + v, 0);
if (frTotal) {
  const pct = Object.fromEntries(fr.map(([k, v]) => [k, (v / frTotal * 100).toFixed(0) + '%']));
  if (fruitCount.paramecia / frTotal < 0.45 || fruitCount.paramecia / frTotal > 0.65) warns.push(`fruit paramecia 占比 ${pct.paramecia} 偏离 55%±10`);
  console.log(`fruit 分布: ${JSON.stringify(pct)}（能力者 ${frTotal} 张）`);
}

console.log(`keywords: ${JSON.stringify(kwCount)} | ops: ${JSON.stringify(opCount)}`);
for (const w of warns) console.log('WARN', w);
if (errs.length) { for (const e of errs.slice(0, 60)) console.log('ERR', e); console.log(`POOL3-CHECK FAIL：${errs.length} 错误`); process.exit(1); }
console.log(`POOL3-CHECK PASS：${cards.length} 卡（char${sums.char}/gear${sums.gear}），角色覆盖 ${[...COLORS].map(c => c + ':' + (distinctNames[c] || new Set()).size).join(' ')}`);
