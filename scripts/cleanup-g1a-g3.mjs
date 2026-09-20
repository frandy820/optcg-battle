// G1a+G3 卡池清理一次性加工脚本（2026-09-20，任务书三轮反馈定稿）：
//   1) 删全部 event(54)/stage(15) 卡 —— 对战只留角色与武器装备，gear 全保留
//   2) 同色同名 char 去重（101 组）：保留规则 ①effect≠null 优先 ②keywords 数多 ③cost 高；
//      自适应补位：某色 1/2/3 费段保留数 <4 时，改保组内低费版（不动定稿素材组、不拆有余量的低费段）
//   3) 融合配方修复：3 张同角色素材组换定稿配方+更名；其余 9 张素材被去重删掉的换成同角色最终保留版
//   4) G3 稀有度：char A/B/S/SS/SSS、gear A/B/S（+1K/+2K/+3K）、融合卡全部 SSS
//   5) 三处同步写出：data/cards.json(1空格) + data/cards-pool3.json(2空格) + data/pool3/{color}.json(2空格)
// 幂等：重跑结果一致（决策只依赖原主库内容）。跑完必须 node scripts/check-pool3.js + node --test 验证。
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const pool = JSON.parse(readFileSync(join(ROOT, 'data/cards.json'), 'utf8'));
const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'black'];

// ---- 定稿融合素材（任务书 G1a-3）：所在组强制保留此版本，不参与补位挪用 ----
const FINAL_MATS = new Set(['RED-27', 'RED-37', 'GREEN-25', 'GREEN-58', 'YELLOW-29', 'YELLOW-46']);
// ---- 定稿新配方（素材组含同角色重复，按任务书换原作组合贴切素材）+ 更名 ----
const FINAL_RECIPES = {
  'FUSION-RED2': { from: ['RED-27', 'RED-37'], name: '传承之火 路飞&罗杰' },       // 路飞+罗杰→传承组
  'FUSION-GREEN2': { from: ['GREEN-25', 'GREEN-58'], name: '斩铁之魂 索隆&龙马' },   // 原作索隆vs龙马得秋水
  'FUSION-YELLOW1': { from: ['YELLOW-29', 'YELLOW-46'], name: '九蛇岛的守护 汉库珂&玛格丽特' },
};

// ---- 保留规则排序键（①effect≠null ②keywords 多 ③cost 高），小者优 ----
const rankKey = (c) => JSON.stringify([c.effect !== null ? 0 : 1, -(c.keywords || []).length, -c.cost]);
const byRank = (a, b) => (rankKey(a) < rankKey(b) ? -1 : 1);

const chars = pool.cards.filter((c) => c.type === 'char' && !c.fusion);
const groups = new Map(); // color|name -> [cards]
for (const c of chars) {
  const k = `${c.color}|${c.name}`;
  if (!groups.has(k)) groups.set(k, []);
  groups.get(k).push(c);
}

// ---- 每组默认保留 ----
const keepOf = new Map(); // groupKey -> 保留卡
for (const [k, v] of groups) {
  const mat = v.find((c) => FINAL_MATS.has(c.id)); // 定稿素材优先（仅 RED-27/RED-37 组真正改变默认结果）
  keepOf.set(k, mat || [...v].sort(byRank)[0]);
}

// ---- 自适应低费补位：每色 1/2/3 费段各 ≥4（定稿素材组冻结；换出段需有余量）----
const cnt = (col, cost) => [...keepOf.values()].filter((c) => c.color === col && c.cost === cost).length;
const demoted = []; // 补位挪用记录（报告披露）
for (let iter = 0; iter < 20; iter++) {
  let changed = false;
  for (const col of COLORS) {
    for (const f of [1, 2, 3]) {
      if (cnt(col, f) >= 4) continue;
      for (const [k, v] of groups) {
        if (v[0].color !== col) continue;
        const cur = keepOf.get(k);
        if (cur.cost === f) continue;
        if (v.some((c) => FINAL_MATS.has(c.id))) continue;           // 定稿素材组不动
        if (cur.cost <= 3 && cnt(col, cur.cost) <= 4) continue;       // 不拆仅够线的低费段
        const cand = v.filter((c) => c.cost === f).sort(byRank);
        if (!cand.length) continue;
        demoted.push(`${col}|${cur.name}: ${cur.id}(${cur.cost}费) → ${cand[0].id}(${f}费补位)`);
        keepOf.set(k, cand[0]);
        changed = true;
        if (cnt(col, f) >= 4) break;
      }
    }
  }
  if (!changed) break;
}

const keepIds = new Set([...keepOf.values()].map((c) => c.id));
// gear 全保留 + 融合卡全保留（融合卡本就不进同名组）
for (const c of pool.cards) if (c.type === 'gear' || c.fusion) keepIds.add(c.id);

// ---- 融合配方修复 ----
const fusionChanges = [];
for (const f of pool.cards.filter((c) => c.fusion)) {
  const old = JSON.stringify(f.fusion.from);
  if (FINAL_RECIPES[f.id]) {
    f.fusion.from = [...FINAL_RECIPES[f.id].from];
    f.name = FINAL_RECIPES[f.id].name;
  } else {
    // 其余 9 张：素材被去重删掉的换成同角色（同色）最终保留版
    f.fusion.from = f.fusion.from.map((mid) => {
      if (keepIds.has(mid)) return mid;
      const mat = pool.cards.find((x) => x.id === mid);
      const rep = [...keepOf.values()].find((x) => x.color === mat.color && x.name === mat.name);
      if (!rep) throw new Error(`${f.id} 素材 ${mid} 被删且无同角色保留版`);
      return rep.id;
    });
  }
  if (old !== JSON.stringify(f.fusion.from)) {
    f.art = f.fusion.from[0]; // art=配方内素材图（与新素材同步；check-pool3 校验 art∈from）
    fusionChanges.push(`${f.id} ${f.name}: ${old} → ${JSON.stringify(f.fusion.from)}（art=${f.art}）`);
  }
}

// ---- 删卡 + 稀有度 ----
const rarityOf = (c) => {
  if (c.fusion) return 'SSS'; // 融合卡 12 张全部 SSS
  if (c.type === 'gear') return { 1000: 'A', 2000: 'B', 3000: 'S' }[c.gear.atk];
  const kw = (c.keywords || []).length, eff = c.effect !== null;
  if (c.cost === 8 && c.power === 9000) return 'SSS';  // 费顶配战力天花板
  if (c.cost === 8 || kw >= 2) return 'SS';
  if ((kw > 0 && eff) || c.cost >= 7) return 'S';      // 词条+效果双全 或 cost≥7
  if (kw > 0 || eff) return 'B';
  return 'A';                                          // 白板
};

const before = pool.cards.length;
const removed = { event: [], stage: [], dup: [] };
const survivors = [];
for (const c of pool.cards) {
  if (c.type === 'event') { removed.event.push(c.id); continue; }
  if (c.type === 'stage') { removed.stage.push(c.id); continue; }
  if (c.type === 'char' && !c.fusion && !keepIds.has(c.id)) { removed.dup.push(`${c.id} ${c.name}`); continue; }
  c.rarity = rarityOf(c);
  survivors.push(c);
}
pool.cards = survivors;

// ---- 写出三处（cards.json 1空格；pool3 源 2空格；pool3 源同步补 rarity）----
writeFileSync(join(ROOT, 'data/cards.json'), JSON.stringify(pool, null, 1) + '\n', 'utf8');
const p3old = JSON.parse(readFileSync(join(ROOT, 'data/cards-pool3.json'), 'utf8'));
const newIds = new Set(survivors.map((c) => c.id));
const byId = new Map(survivors.map((c) => [c.id, c]));
// pool3 源对象与主库为不同实例：融合卡改名/换配方与 rarity 一并自主库同步（三处同步铁律）
const syncCard = (c) => {
  const m = byId.get(c.id);
  c.name = m.name; c.fusion = m.fusion; c.art = m.art; c.rarity = m.rarity;
  return c;
};
const p3new = p3old.filter((c) => newIds.has(c.id)).map(syncCard);
writeFileSync(join(ROOT, 'data/cards-pool3.json'), JSON.stringify(p3new, null, 2) + '\n', 'utf8');
for (const col of COLORS) {
  const src = JSON.parse(readFileSync(join(ROOT, `data/pool3/${col}.json`), 'utf8'));
  writeFileSync(join(ROOT, `data/pool3/${col}.json`), JSON.stringify(src.filter((c) => newIds.has(c.id)).map(syncCard), null, 2) + '\n', 'utf8');
}

// ---- 报告 ----
console.log(`=== G1a 删卡统计 ===`);
console.log(`event 删 ${removed.event.length} / stage 删 ${removed.stage.length} / 同名去重删 ${removed.dup.length}`);
console.log(`卡池 ${before} → ${survivors.length}（char${survivors.filter((c) => c.type === 'char').length} 含融合${survivors.filter((c) => c.fusion).length} / gear${survivors.filter((c) => c.type === 'gear').length}）`);
console.log(`\n=== 补位挪用（低费降级）===\n` + (demoted.join('\n') || '无'));
console.log(`\n=== 融合配方变更 ===\n` + fusionChanges.join('\n'));
console.log(`\n=== 去重后每色费段（char，1-8 费）===`);
console.log('color   1  2  3  4  5  6  7  8  gear');
for (const col of COLORS) {
  const kept = survivors.filter((c) => c.color === col && c.type === 'char');
  console.log(col.padEnd(7), [1, 2, 3, 4, 5, 6, 7, 8].map((k) => String(kept.filter((c) => c.cost === k).length).padStart(2)).join(' '),
    String(survivors.filter((c) => c.color === col && c.type === 'gear').length).padStart(4));
}
const rar = {};
for (const c of survivors) rar[c.rarity] = (rar[c.rarity] || 0) + 1;
console.log(`\n=== 稀有度分布 ===`, JSON.stringify(rar));
const shortFall = COLORS.filter((col) => [1, 2, 3].some((f) => survivors.filter((c) => c.color === col && c.type === 'char' && c.cost === f).length < 4));
console.log(`低费段(<4)未达标色: ${shortFall.join(',') || '无'}`);
