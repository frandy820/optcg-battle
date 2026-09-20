// 故事之旅模式单测：关卡表完整性 / 敌方卡组强度曲线 / 奖励池 / 卡组成长替换 /
// 进度存储读写 / 满血奖励判定 / 合成敌方首领 / 角色卡名解析（不碰引擎语义，模式层纯逻辑）
// 同构：story.js 挂 globalThis.OPTCG_STORY（node 无 window/document，DOM 分支全部短路）
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { makeRng } from '../engine/rng.js';

const pool = JSON.parse(readFileSync(new URL('../data/cards.json', import.meta.url), 'utf8'));
// 注入浏览器全局（story.js 惰性读 OPTCG.POOL / makeRng）
globalThis.OPTCG = { POOL: pool, makeRng };
await import('../web/story.js');
const S = globalThis.OPTCG_STORY;
const byId = (id) => pool.cards.find((c) => c.id === id);
const totalOf = (counts) => Object.values(counts || {}).reduce((a, b) => a + b, 0);

// 每个用例独立进度：清 story.js 的内存存储（浏览器侧走 OPTCG_SAVE，node 侧只有 mem Map）
function freshStorage() {
  S._storage.mem.clear();
  return S._storage;
}

test('关卡表完整性：10 关 · 字段合法 · LP 递增曲线 · 敌色合法 · AI 档合法', () => {
  assert.equal(S.STAGES.length, 10);
  const lps = [];
  S.STAGES.forEach((st, i) => {
    assert.equal(st.id, i + 1);
    assert.ok(st.name && st.boss, '第' + st.id + '关缺名字/Boss');
    assert.ok(['red', 'blue', 'green', 'yellow', 'purple', 'black'].includes(st.color));
    assert.ok(Number.isInteger(st.lp) && st.lp >= 5000 && st.lp <= 12000);
    assert.ok(['easy', 'normal', 'hard'].includes(st.ai));
    assert.ok(['t1', 't2', 't3', 't4'].includes(st.band));
    // power 3300-4900：sim 百局校准定版（教学关 3300 必赢 · 终关 4900 hard AI）
    assert.ok(Number.isInteger(st.power) && st.power >= 3300 && st.power <= 4900);
    assert.ok(byId === undefined || (pool.leaders || []).some((l) => l.id === st.base), '首领壳 ' + st.base + ' 不存在');
    assert.ok(st.reward && Array.isArray(st.reward.random) && st.reward.random.length >= 1);
    lps.push(st.lp);
  });
  // LP 总体递增（教学关允许持平：1=3 关同为 5000，8=9 关同为 10000）
  for (let i = 1; i < lps.length; i++) assert.ok(lps[i] >= lps[i - 1], `第${i + 1}关 LP 低于前一关`);
  assert.equal(lps[0], 5000); // 教学关调参定版（规格初值 6000，sim 校准「必赢教学」降为 5000）
  assert.equal(lps[9], 12000); // 规格：第 10 关 12000
  // AI 档位规格：1-4 easy / 5-9 normal / 10 hard
  assert.ok(S.STAGES.slice(0, 4).every((s) => s.ai === 'easy'));
  assert.ok(S.STAGES.slice(4, 9).every((s) => s.ai === 'normal'));
  assert.equal(S.STAGES[9].ai, 'hard');
});

test('敌方代表卡与奖励角色卡按名解析：全部命中卡池存活版本', () => {
  for (const st of S.STAGES) {
    const c = S.resolveByName(st.boss);
    assert.ok(c, `第${st.id}关 Boss「${st.boss}」解析失败`);
    assert.equal(c.type, 'char');
    assert.ok(!c.fusion, 'Boss 不能是融合卡');
    assert.equal(c.color, st.color, `第${st.id}关 Boss 应为${st.color}色`);
  }
  // 奖励角色卡（规格名单）：解析非空 + 非融合
  const rewards = [['克比'], ['亚尔丽塔'], ['索隆'], ['乌索普'], ['山治'], ['娜美'], ['达斯琪'], ['克洛克达尔']];
  for (const [nm] of rewards) {
    const c = S.resolveByName(nm);
    assert.ok(c, `奖励卡「${nm}」解析失败`);
    assert.ok(!c.fusion);
  }
  // 同名多版本歧义：「克洛」不得误中「克洛克达尔」（费用最低的同名保留版）
  assert.equal(S.resolveByName('克洛').id, 'RED-13');
  assert.equal(S.resolveByName('克比').id, 'RED-02');
});

test('奖励随机池非空：每关涉及的稀有度在非融合卡池中均有卡可抽', () => {
  for (const st of S.STAGES) {
    for (const [rar] of st.reward.random) {
      const p = pool.cards.filter((c) => c.rarity === rar && !c.fusion);
      assert.ok(p.length >= 1, `稀有度 ${rar} 非融合池为空（第${st.id}关）`);
    }
  }
  // 满血奖励池：SSS/SS 非融合必须非空（80/20 分配的两端）
  assert.ok(pool.cards.some((c) => c.rarity === 'SSS' && !c.fusion));
  assert.ok(pool.cards.some((c) => c.rarity === 'SS' && !c.fusion));
});

test('合成敌方首领：教学关白板（无技能）· 名字/Boss 战力覆写 · LP 档位贴血量', () => {
  const s1 = S.mkFoe(S.STAGES[0]);
  assert.equal(s1.name, '克比');
  assert.equal(s1.power, 3300);
  assert.deepEqual(s1.skills, [], '第 1-3 关教学 Boss 必须白板（无技能）');
  assert.equal(S.mkFoe(S.STAGES[2]).skills.length, 0, '第 3 关同为教学白板');
  const s5 = S.mkFoe(S.STAGES[4]); // 第 5 关起技能开启
  assert.ok(Array.isArray(s5.skills) && s5.skills.length >= 1, '第 5 关 Boss 借用船长技能');
  assert.equal(s5.name, '克洛');
  // LP 上限档：life*2000 ≥ Boss LP（LP 条不溢出）
  for (const st of S.STAGES) {
    const f = S.mkFoe(st);
    assert.ok(f.life * 2000 >= st.lp, `第${st.id}关 LP 档溢出`);
  }
});

test('敌方卡组生成：50 张 · 敌色 · 非融合 · 每卡≤4 · 同 seed 可重建', () => {
  for (const st of S.STAGES) {
    const deck = S.enemyDeckOf(st, 12345);
    assert.equal(deck.length, 50, `第${st.id}关敌卡组 ${deck.length} 张`);
    const cnt = {};
    for (const c of deck) {
      assert.equal(c.color, st.color, `第${st.id}关敌卡组混入异色 ${c.id}`);
      assert.ok(!c.fusion, `第${st.id}关敌卡组混入融合卡 ${c.id}`);
      cnt[c.id] = (cnt[c.id] || 0) + 1;
    }
    for (const n of Object.values(cnt)) assert.ok(n <= 4, `第${st.id}关敌卡组单卡超 4 张`);
    // 确定性：同 seed 同卡组（序列逐张相等）
    const again = S.enemyDeckOf(st, 12345);
    assert.deepEqual(deck.map((c) => c.id), again.map((c) => c.id), `第${st.id}关敌卡组不可重建`);
  }
});

test('敌方卡组强度曲线：1-3 关全 A 级低费白板（必赢教学带）', () => {
  for (const st of S.STAGES.slice(0, 3)) {
    const deck = S.enemyDeckOf(st, 777);
    let plain = 0;
    for (const c of deck) {
      assert.equal(c.rarity, 'A', `第${st.id}关教学带出现非 A 卡 ${c.id}`);
      assert.equal(c.type, 'char', `教学带只出角色卡（${c.id}）`);
      assert.ok(c.cost <= 4, `教学带卡费用越界 ${c.id}(${c.cost})`);
      if (!c.effect && c.cost <= 3) plain++;
    }
    // black 等浅色池 1-3 费白板 12×4=48<50：允许 ≤2 张逐级放宽兜底
    assert.ok(plain >= 48, `第${st.id}关教学带白板占比不足（${plain}/50）`);
  }
});

test('敌方卡组强度曲线：4-10 关按稀有度带混组', () => {
  const bandCheck = (st, lo) => {
    const deck = S.enemyDeckOf(st, 42);
    const r = { A: 0, B: 0, S: 0, SS: 0, SSS: 0 };
    deck.forEach((c) => { r[c.rarity]++; });
    return r;
  };
  // 4-6 关：A+B 混组（B 占比 40% 附近，容差 ±15pp；SS+ 恒 0）
  for (const st of S.STAGES.slice(3, 6)) {
    const r = bandCheck(st);
    assert.equal(r.S + r.SS + r.SSS, 0, `第${st.id}关不应出现 S 及以上`);
    assert.ok(r.B >= 10 && r.B <= 30, `第${st.id}关 B 卡占比异常：${r.B}/50`);
  }
  // 7-9 关：出现 S（15% 附近），SS 恒 0
  for (const st of S.STAGES.slice(6, 9)) {
    const r = bandCheck(st);
    assert.equal(r.SS + r.SSS, 0, `第${st.id}关不应出现 SS`);
    assert.ok(r.S >= 3 && r.S <= 12, `第${st.id}关 S 卡占比异常：${r.S}/50`);
  }
  // 10 关：S 大怪少量（权重 0.02×50≈1 张——yellow 池 S 全是 7-8 费 7-8K，规格原配比 15%S+10%SS
  // 实测胜率 0-13% 无法满足「≤5 次内通关」断言，sim 校准后压至 2% 维持终关可通性）
  const r10 = bandCheck(S.STAGES[9]);
  assert.ok(r10.S >= 1 && r10.S <= 4, `第 10 关 S 卡占比异常：${r10.S}/50`);
  assert.equal(r10.SS + r10.SSS, 0, '第 10 关敌卡组无 SS/SSS（放宽链兜底也只到 S 池）');
});

test('玩家初始卡组：50 张 · 30 张 1-2 费 + 10 张 3-4 费 · 含克比/亚尔丽塔等基础角色', () => {
  const counts = S.initialDeck();
  assert.equal(totalOf(counts), 50);
  let low = 0, mid = 0;
  const arr = [];
  for (const [id, n] of Object.entries(counts)) {
    const c = byId(id);
    assert.ok(c, `初始组含缺卡 ${id}`);
    assert.ok(!c.fusion, '初始组不含融合卡');
    arr.push(...Array.from({ length: n }, () => c));
    if (c.cost <= 2) low += n;
    else if (c.cost >= 3 && c.cost <= 4) mid += n;
    else assert.fail('初始组出现费外卡 ' + id);
  }
  assert.equal(low, 40, '≤2 费 40 = 30 张白板 + 10 张基础角色卡（规格两段同池合成，每卡≤4）');
  assert.equal(mid, 10, '3-4 费配额 10');
  assert.ok(counts['RED-02'] >= 1, '初始组含克比'); // RED-02=克比
  assert.ok(counts['RED-12'] >= 1, '初始组含亚尔丽塔'); // RED-12=亚尔丽塔
  assert.ok(counts['RED-01'] >= 1, '初始组含乌索普'); // RED-01=乌索普
  // 全红 + 全 A 级（故事模式玩家初始基底）
  assert.ok(arr.every((c) => c.color === 'red' && c.rarity === 'A'));
});

test('卡组自动成长：奖励入组 · 最弱被替换 · 恒 50 张 · 满 4 张与融合卡不入', () => {
  const init = S.initialDeck();
  const RAR = { A: 0, B: 1, S: 2, SS: 3, SSS: 4 };
  const weakestOf = (list) => list
    .sort((a, b) => (RAR[a.rarity] ?? 9) - (RAR[b.rarity] ?? 9) || a.power - b.power || b.id.localeCompare(a.id))[0];
  // ① 高费奖励卡（无同费段）：6 费克洛克达尔入组 → 替换费用最接近段（4 费）的最弱卡
  const g1 = S.growDeck(init, [byId('YELLOW-38')]);
  assert.equal(totalOf(g1), 50, '成长后恒 50');
  assert.equal(g1['YELLOW-38'], 1, '高费奖励卡应入组（就近费段替换）');
  const weakest4 = weakestOf(Object.keys(init).filter((id) => byId(id).cost === 4).map(byId));
  assert.equal(g1[weakest4.id], init[weakest4.id] - 1, '被换出的应为就近费段最弱卡');
  // ② 同费替换：3 费 B 卡入组 → 3 费段最弱 A 卡（rarity 序）-1，B 卡 +1（S 级 char 最低 5 费，同费用 B 档测）
  const s3 = byId('RED-05'); // 山智之外的红 B 3费 char（3K）
  const beforeA3 = Object.entries(init).filter(([id]) => byId(id).cost === 3).reduce((a, [, n]) => a + n, 0);
  const g2 = S.growDeck(init, [s3]);
  assert.equal(totalOf(g2), 50);
  assert.equal(g2[s3.id], 1, 'B 卡应入组');
  const afterA3 = Object.entries(g2).filter(([id]) => id !== s3.id && byId(id).cost === 3).reduce((a, [, n]) => a + n, 0);
  assert.equal(afterA3, beforeA3 - 1, '同费段应被替换出 1 张');
  const weakest = weakestOf(Object.keys(init).filter((id) => byId(id).cost === 3).map(byId));
  assert.equal(g2[weakest.id], init[weakest.id] - 1, '被换出的应为同费段最弱 A 卡');
  // ③ 满 4 张不入：把某 A 卡灌到 4 再喂同卡
  const aCard = byId('RED-02');
  const full = { ...init, [aCard.id]: 4 };
  const g3 = S.growDeck(full, [aCard]);
  assert.equal(g3[aCard.id], 4);
  assert.equal(totalOf(g3), totalOf(full));
  // ④ 融合卡不入组
  const fusion = pool.cards.find((c) => c.fusion);
  const g4 = S.growDeck(init, [fusion]);
  assert.equal(g4[fusion.id], undefined);
  assert.equal(totalOf(g4), 50);
  // ⑤ 同批多张互不挤兑：两张新卡都入组，总数仍 50
  const s2 = byId('RED-53'); // 另一张红 B 3费 char
  {
    const g5 = S.growDeck(init, [s3, s2]);
    assert.equal(totalOf(g5), 50);
    assert.equal((g5[s3.id] || 0) + (g5[s2.id] || 0), 2);
  }
});

test('奖励结算 rollRewards：首通全额 · 满血加冕 SS/SSS · 重复通关衰减 · 进度推进', () => {
  freshStorage();
  const st = S.STAGES[0]; // 克比 + 3×A
  const prog = { cleared: 0, wins: {}, seed: 7, ts: 0 };
  const fullLP = 10000; // 路飞 life5×2000
  // 非满血首通：1 固定 + 3 随机
  const r1 = S.rollRewards(st, prog, 8000, fullLP, ['RED-01']);
  assert.equal(r1.got.length, 4, '克比 + 3×A');
  assert.ok(r1.got[0].name.includes('克比'));
  assert.ok(r1.got.slice(1).every((c) => c.rarity === 'A'));
  assert.ok(r1.got.every((c) => !c.fusion), '奖励不含融合卡');
  assert.equal(r1.prog.cleared, 1);
  assert.equal(r1.prog.wins[1], 1);
  assert.ok(r1.collected.includes('RED-01') && r1.collected.includes('RED-02'), '收藏并集');
  // 满血首通：额外 +1 张 SS/SSS（叠加在普通奖励之上）
  const r2 = S.rollRewards(st, prog, fullLP, fullLP, []);
  assert.equal(r2.got.length, 5);
  assert.ok(['SS', 'SSS'].includes(r2.got[4].rarity), '满血奖励档');
  // 满血判定边界：差 1000 血不算满血
  const r3 = S.rollRewards(st, prog, fullLP - 1000, fullLP, []);
  assert.equal(r3.got.length, 4, '掉分即无满血奖励');
  // 重复通关：只发 1 张随机 A（防刷终关 SSS）
  const r4 = S.rollRewards(st, { ...prog, cleared: 1, wins: { 1: 1 } }, fullLP, fullLP, []);
  assert.equal(r4.got.length, 1);
  assert.equal(r4.got[0].rarity, 'A');
  // 满血奖励 80/20 分布：种子扫描两种档位都可达（可重建性证据）
  let sss = 0, ss = 0;
  for (let seed = 1; seed <= 200; seed++) {
    const r = S.rollRewards(st, { cleared: 0, wins: {}, seed, ts: 0 }, fullLP, fullLP, []);
    if (r.got[4].rarity === 'SSS') sss++; else ss++;
  }
  assert.ok(sss > 120 && ss > 10, `80/20 分布异常（SSS=${sss}/SS=${ss}）`);
  // 第 9/10 关奖励规格：9 关 1SS+1S；10 关 1SSS+1SS
  const r9 = S.rollRewards(S.STAGES[8], { cleared: 8, wins: {}, seed: 3, ts: 0 }, 0, fullLP, []);
  const r10 = S.rollRewards(S.STAGES[9], { cleared: 9, wins: {}, seed: 3, ts: 0 }, 0, fullLP, []);
  assert.equal(r9.got.filter((c) => c.rarity === 'SS').length, 1);
  assert.equal(r9.got.filter((c) => c.rarity === 'S').length, 1);
  assert.equal(r10.got.filter((c) => c.rarity === 'SSS').length, 1);
  assert.equal(r10.got.filter((c) => c.rarity === 'SS').length, 1);
});

test('进度存储读写：save/load 往返 · 冷启动默认 · 损坏数据防御', () => {
  freshStorage();
  const T = S._storage;
  const { PKEY, CKEY, DKEY } = T.keys;
  // 冷启动：无键 → progress() 给默认（seed 正整数）
  const p0 = S.progress();
  assert.ok(Number.isInteger(p0.seed) && p0.seed > 0);
  assert.equal(p0.cleared, 0);
  // 往返
  T.save(PKEY, { cleared: 5, wins: { 1: 2 }, seed: 42, ts: 1 });
  T.save(CKEY, ['RED-01', 'RED-02']);
  T.save(DKEY, { 'RED-01': 3 });
  const p1 = S.progress();
  assert.equal(p1.cleared, 5);
  assert.equal(p1.seed, 42);
  assert.deepEqual(S.collectedSet(), new Set(['RED-01', 'RED-02']));
  // 损坏进度（seed 非法）→ 回默认
  T.save(PKEY, { cleared: 'x', seed: -1 });
  assert.equal(S.progress().cleared, 0);
});

test('settle 全链路（node 无 DOM 短路）：胜利发卡入档 · 失败只提示重试', () => {
  freshStorage();
  const T = S._storage;
  // 注入 GAME.state（满血）——settle 经 game.js 的 myLP 判定
  const prevGame = globalThis.OPTCG_GAME;
  globalThis.OPTCG_GAME = { state: () => ({ myLP: 10000, foeLP: 0 }) };
  try {
    T.save(S._storage.keys.DKEY, S.initialDeck());
    const line = S.settle({ mode: 'story', stage: 1 }, true);
    assert.ok(line.includes('克比') || line.includes('获得'), '结算文案含奖励');
    assert.ok(S.progress().cleared >= 1, '进度推进');
    assert.ok(S.collectedCount() > 0);
    // 失败：无奖励、无进度
    const colBefore = S.collectedCount();
    const clearedBefore = S.progress().cleared;
    const lineLose = S.settle({ mode: 'story', stage: 1 }, false);
    assert.ok(lineLose.includes('重试'));
    assert.equal(S.collectedCount(), colBefore);
    assert.equal(S.progress().cleared, clearedBefore);
  } finally {
    globalThis.OPTCG_GAME = prevGame;
  }
});

test('settle 缺卡进度防御：卡组因删卡不足 50 时（旧档）成长后仍可安全落盘', () => {
  freshStorage();
  const T = S._storage;
  const counts = S.initialDeck();
  counts['RED-DELETED-XX'] = 2; // 旧进度里的死 id（卡池已删）
  delete counts['RED-02'];
  T.save(T.keys.DKEY, counts);
  const prevGame = globalThis.OPTCG_GAME;
  globalThis.OPTCG_GAME = { state: () => ({ myLP: 10000 }) };
  try {
    S.settle({ mode: 'story', stage: 2 }, true); // 不抛错即过
    assert.ok(true);
  } finally {
    globalThis.OPTCG_GAME = prevGame;
  }
});
