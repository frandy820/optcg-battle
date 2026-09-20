// 故事之旅模式：跟着海贼王剧情过关收集卡片（东海篇 10 关，模式层实现）
// 依赖顺序：app.bundle.js（OPTCG）→ game.js（OPTCG_GAME）→ 本文件 → gallery.js / modes.js
// 设计约束（红线）：
//   - 引擎零改动：敌方强度全部经「合成敌方首领（借船长数值/技能壳）+ 敌方卡组强度曲线 + LP 覆写」表达，
//     前三关「必赢教学」只靠敌方卡组/LP 设计达成，引擎无任何胜负偏置；
//   - 敌方卡组/奖励抽取确定性可重建（seed 存进度，同 seed 同卡组）；
//   - node 单测同构：全局挂 globalThis.OPTCG_STORY，DOM 访问全部惰性 + 环境守卫。
/* global OPTCG, OPTCG_GAME */
(function (global) {
  'use strict';
  const W = typeof window !== 'undefined' ? window : global; // 浏览器 window / node globalThis
  const DOC = (typeof document !== 'undefined') ? document : null;
  const POOL = () => W.OPTCG && W.OPTCG.POOL; // 惰性取池（node 单测先注入 globalThis.OPTCG）
  const GAME = () => W.OPTCG_GAME;
  const COLOR_NAME = { red: '红', blue: '蓝', green: '绿', yellow: '黄', purple: '紫', black: '黑' };
  const AI_NAME = { easy: '新手水手', normal: '精英船员', hard: '风暴领主' };
  const RAR_ORDER = { A: 0, B: 1, S: 2, SS: 3, SSS: 4 }; // 稀有度强度序（成长替换「最弱」判定用）
  const RAR_NAME = { A: 'A', B: 'B', S: 'S', SS: 'SS', SSS: 'SSS' };
  const MY_LEADER_ID = 'LEADER-RED'; // 玩家固定：蒙奇·D·路飞（东海篇主角线）

  // ===== 关卡表（东海篇：敌色/敌LP/AI档/敌方卡组强度带/奖励，数值来自模式规格定稿）=====
  // base=敌方首领借用的船长定义（技能壳/果实），useSkills=false 时技能清空（教学关白板首领）
  // power=Boss 首领战力（模式层参数，随难度曲线爬升）；band=敌方卡组强度带（见 BANDS）
  // 强度参数经 story-sim.mjs 离线百局校准（教学关必赢曲线 + 4-7 关 ≥50% + 终关可通），非拍脑袋值
  const STAGES = [
    { id: 1, name: '出航·风车村', boss: '克比', color: 'red', lp: 5000, ai: 'easy', band: 't1', power: 3300, base: 'LEADER-RED', useSkills: false,
      reward: { fixed: ['克比'], random: [['A', 3]] }, story: '每个传奇都从一句「我要成为海贼王」开始。风车村的海边，少年推离了岸边——第一位拦路的，是追着出海梦跑来的见习海军克比。' },
    { id: 2, name: '铁锤亚尔丽塔', boss: '亚尔丽塔', color: 'red', lp: 5000, ai: 'easy', band: 't1', power: 3300, base: 'LEADER-RED2', useSkills: false,
      reward: { fixed: ['亚尔丽塔'], random: [['A', 3]] }, story: '小船出海第一战：自称「东海最美」的铁锤亚尔丽塔横在航路上。铁锤很重，但梦想更重。' },
    { id: 3, name: '谢尔兹镇·大刀蒙卡', boss: '蒙卡', color: 'black', lp: 5000, ai: 'easy', band: 't1', power: 3300, base: 'LEADER-BLACK2', useSkills: false,
      reward: { fixed: ['索隆'], random: [['A', 2]] }, story: '谢尔兹镇的练兵场上海军横行。为了救下被绑在海边的三刀剑士，先过大刀蒙卡这一关——索隆正在等你。' },
    { id: 4, name: '橘子镇·小丑巴基', boss: '巴基', color: 'red', lp: 8000, ai: 'easy', band: 't2', power: 4500, base: 'LEADER-RED', useSkills: true,
      reward: { fixed: [], random: [['B', 2], ['A', 2]] }, story: '橘子镇的爆炸声连成一片。四分五裂的果实能力者、小丑巴基，东海扩张路上的第一块硬骨头。' },
    { id: 5, name: '西罗布村·克洛船长', boss: '克洛', color: 'red', lp: 8000, ai: 'normal', band: 't2', power: 4600, base: 'LEADER-RED2', useSkills: true,
      reward: { fixed: ['乌索普'], random: [['B', 2]] }, story: '西罗布村的谎言少年喊了多年「海贼来了」。这一次海贼真的来了——三年布局的克洛船长，盯上了可雅家的财产。' },
    { id: 6, name: '海上餐厅·顿·克利克', boss: '顿·克利克', color: 'blue', lp: 9000, ai: 'normal', band: 't2', power: 4400, base: 'LEADER-BLUE2', useSkills: true,
      reward: { fixed: ['山治'], random: [['B', 2]] }, story: '东海霸主带着五十艘舰队的残骸闯进海上餐厅。铁甲与毒gas齐发——而厨师的踢技只对浪费食物的人出鞘。' },
    { id: 7, name: '可可亚村·阿龙', boss: '阿龙', color: 'red', lp: 10000, ai: 'normal', band: 't3', power: 4400, base: 'LEADER-RED2', useSkills: true,
      reward: { fixed: ['娜美'], random: [['S', 1]] }, story: '八年前的谎言在可可亚村揭穿。锯齿鲨鱼人阿龙和他的乐园——这一次，帽子借给了航海士的刀。' },
    { id: 8, name: '罗格镇·白猎人斯摩格', boss: '斯摩格', color: 'blue', lp: 10000, ai: 'normal', band: 't3', power: 4500, base: 'LEADER-BLUE2', useSkills: true,
      reward: { fixed: ['达斯琪'], random: [['S', 1]] }, story: '处刑台的风吹过罗格镇。海雾里裹着白猎人斯摩格的冒烟果实——自然系，拳头打不中的敌人。' },
    { id: 9, name: '罗格镇·大佐达斯琪', boss: '达斯琪', color: 'blue', lp: 10000, ai: 'normal', band: 't3', power: 4500, base: 'LEADER-BLUE2', useSkills: true,
      reward: { fixed: [], random: [['SS', 1], ['S', 1]] }, story: '军营里戴眼镜的大佐与剑士名字只差一个字。快刀雪走出鞘——这是离开东海前的最后一战。' },
    { id: 10, name: '伟大航路·沙漠之王', boss: '克洛克达尔', color: 'yellow', lp: 12000, ai: 'hard', band: 't4', power: 4700, base: 'LEADER-YELLOW2', useSkills: true,
      reward: { fixed: ['克洛克达尔'], random: [['SSS', 1], ['SS', 1]] }, story: '双子岬的灯塔在身后熄灭。伟大航路第一位王下七武海、沙沙果实的沙漠之王——东海篇的终点，伟大航路的起点。' },
  ];

  // 敌方卡组强度带：list = [稀有度, 权重, 费用上限]（费用上限压制高档卡的中后期碾压；
  // 浅色池耗尽时逐级放宽费用上限兜底，权重同比例转移）
  const BANDS = {
    t1: { list: [['A', 1, 2]] }, // 教学带：全 A 低费白板（白板约束在生成器内）
    t2: { list: [['A', 0.72, 4], ['B', 0.28, 4]] },
    t3: { list: [['A', 0.68, 4], ['B', 0.22, 5], ['S', 0.10, 5]] },
    t4: { list: [['A', 0.66, 4], ['B', 0.32, 4], ['S', 0.02, 4]] },
  };

  // ===== 存储（key 前缀 optcg_story_，经 OPTCG_SAVE extras 通道；node 单测内存 Map 兜底）=====
  const mem = new Map();
  function rawLoad(k) {
    try {
      const S = W.OPTCG_SAVE;
      if (S) { const v = S.get(k); return v === null || v === undefined ? null : v; }
    } catch (e) { /* 落入裸 localStorage / 内存 */ }
    if (typeof localStorage !== 'undefined') {
      try { const v = JSON.parse(localStorage.getItem(k)); return v === null || v === undefined ? null : v; } catch (e) { return null; }
    }
    return mem.has(k) ? JSON.parse(mem.get(k)) : null;
  }
  function rawSave(k, v) {
    try {
      const S = W.OPTCG_SAVE;
      if (S) { S.set(k, v); return; }
    } catch (e) { /* 同上 */ }
    if (typeof localStorage !== 'undefined') {
      try { localStorage.setItem(k, JSON.stringify(v)); return; } catch (e) { /* 隐私模式：内存兜底 */ }
    }
    mem.set(k, JSON.stringify(v));
  }
  const PKEY = 'optcg_story_progress';   // { cleared, wins:{}, seed, ts }
  const CKEY = 'optcg_story_collection'; // [cardId]（去重）
  const DKEY = 'optcg_story_deck';       // { cardId: 1..4 }（自动成长，玩家不手动组）

  function newProgress() {
    // seedBase：敌卡组/奖励抽取的确定性种子基（首局随机一次，之后固定——同 seed 可重建）
    return { cleared: 0, wins: {}, seed: (Date.now() % 100000) + 1, ts: Date.now() };
  }
  function progress() {
    const p = rawLoad(PKEY);
    if (p && typeof p === 'object' && Number.isInteger(p.seed) && p.seed > 0) {
      return { cleared: p.cleared | 0, wins: (p.wins && typeof p.wins === 'object') ? p.wins : {}, seed: p.seed, ts: p.ts | 0 };
    }
    return newProgress();
  }
  function collected() {
    const v = rawLoad(CKEY);
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  }
  // 读取入口先确保状态初始化（幂等）：图鉴冷启动/大厅副标题在未开过局时也能看到初始收藏
  const collectedSet = () => { ensureState(); return new Set(collected()); };
  const collectedCount = () => { ensureState(); return collected().length; };
  function deckCounts() {
    const v = rawLoad(DKEY);
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const out = {};
      for (const [id, n] of Object.entries(v)) if (Number.isInteger(n) && n >= 1 && n <= 4) out[id] = n;
      return out;
    }
    return null;
  }
  const totalOf = (counts) => Object.values(counts || {}).reduce((a, b) => a + b, 0);

  // ===== 卡池查询助手 =====
  const allCards = () => (POOL().cards || []);
  const byId = (id) => allCards().find((c) => c.id === id) || null;
  const poolOf = (rar) => allCards().filter((c) => c.rarity === rar && !c.fusion); // 奖励/随机池：融合卡不作为奖励（不进卡组）

  // 奖励角色卡解析：名字精确匹配优先 → 包含匹配；多候选时优先与玩家同色（red），再费用低，再 id 序
  // （「查池内去重后存活版本」——不硬编码 id，卡池变化自动跟随）
  function resolveByName(name) {
    if (!name) return null;
    let cands = allCards().filter((c) => !c.fusion && c.type === 'char' && c.name === name);
    if (!cands.length) cands = allCards().filter((c) => !c.fusion && c.type === 'char' && c.name.includes(name));
    if (!cands.length) return null;
    cands.sort((a, b) => ((a.color === 'red') ? 0 : 1) - ((b.color === 'red') ? 0 : 1) || (a.cost - b.cost) || a.id.localeCompare(b.id));
    return cands[0];
  }

  // ===== 玩家初始卡组：30 张 1-2 费 A 白板 + 10 张 3-4 费 A + 克比/亚尔丽塔等 10 张基础角色卡 =====
  // 基础角色卡 = 红色 A 级 1-2 费白板 char 按 id 序前 10（含乌索普/克比/亚尔丽塔等），各 1 份；
  // 白板池每卡补到 3 份恰 30 张；3-4 费段轮转补 10。确定性（无 rng）。
  function initialDeck() {
    const redA = allCards().filter((c) => c.color === 'red' && c.rarity === 'A' && c.type === 'char' && !c.fusion);
    const low = redA.filter((c) => c.cost <= 2 && !c.effect); // 1-2 费白板
    const mid = redA.filter((c) => c.cost >= 3 && c.cost <= 4); // 3-4 费（允许带效果——中费段要战力）
    const counts = {};
    const segTotal = (list) => list.reduce((a, c) => a + (counts[c.id] || 0), 0); // 该段当前总张数
    // 轮转补齐到目标张数（每卡 ≤4 份；已入组的基础角色卡计入段配额）
    const fill = (list, target) => {
      for (let r = 1; r <= 4; r++) {
        for (const c of list) {
          if (segTotal(list) >= target) return;
          if ((counts[c.id] || 0) < r) counts[c.id] = (counts[c.id] || 0) + 1;
        }
      }
    };
    // 基础角色卡 10 张先各 1 份（乌索普/克比/亚尔丽塔/巴基等低费主角），再补足白板 30 张配额：
    // 规格三段 30+10+10=50 中前两段共享低费白板池 → 池内合计 40 份（每卡恰好 4 份上限）
    for (const c of low.slice(0, 10)) counts[c.id] = 1;
    fill(low, 40); // 30 张 1-2 费白板 + 10 张基础角色卡（同池合计）
    fill(mid, 10); // 中费段（3-4 费 A）补满 10
    return counts;
  }

  // 冷启动：无进度时落初始卡组 + 初始收藏（初始卡组卡视为已收集）
  function ensureState() {
    let p = rawLoad(PKEY);
    let deck = deckCounts();
    if (!deck || totalOf(deck) !== 50) {
      deck = initialDeck();
      rawSave(DKEY, deck);
    }
    if (!collected().length) {
      rawSave(CKEY, Object.keys(deck).filter((id) => byId(id)));
    }
    if (!p) { p = newProgress(); rawSave(PKEY, p); }
    return true;
  }

  // ===== 敌方首领合成：借 12 船长的数值/技能壳，名字/称号/Boss 战力按关卡覆写 =====
  // useSkills=false（教学关）：技能清空 = 白板首领（最弱一档）；id 保留原船长（悬停信息卡/技能说明可查）
  function mkFoe(stage) {
    const base = (POOL().leaders || []).find((l) => l.id === stage.base)
      || (POOL().leaders || []).find((l) => l.color === stage.color) || {};
    return {
      ...base,
      name: stage.boss,
      sub: stage.name,
      power: stage.power,
      life: Math.max(1, Math.ceil(stage.lp / 2000)), // LP 条上限贴 Boss 血量（lp 覆写在开局挂接处）
      skills: stage.useSkills ? (base.skills || []) : [],
    };
  }

  // ===== 敌方卡组生成（确定性：seed = 进度 seed 与关号混合，同进度同关=同卡组，可重建）=====
  // t1 教学带：全 A 低费白板 char 逐级填满（白板池每卡 4 份优先，不足用下一级差额补）：
  //   A≤2费白板 → A≤3费白板 → A≤3费 → A≤4费 → A 任意（浅色池物理下限兜底）
  // t2-t4：按 band 权重抽稀有度 → 该色该稀有度（费用上限内）池 rng 取卡（每卡 ≤4）；
  //   某档在费用上限内耗尽 → 上限 +1 放宽重试；全部耗尽 → 全色池兜底
  function enemyDeckOf(stage, seed) {
    const rng = ((W.OPTCG && W.OPTCG.makeRng) || ((s) => () => s))(seed); // node 单测注入 makeRng
    const cards = allCards().filter((c) => c.color === stage.color && !c.fusion);
    const used = {};
    const out = [];
    if (stage.band === 't1') {
      const t1Pools = [
        cards.filter((c) => c.rarity === 'A' && c.type === 'char' && c.cost <= 2 && !c.effect),
        cards.filter((c) => c.rarity === 'A' && c.type === 'char' && c.cost <= 3 && !c.effect),
        cards.filter((c) => c.rarity === 'A' && c.type === 'char' && c.cost <= 3),
        cards.filter((c) => c.rarity === 'A' && c.type === 'char' && c.cost <= 4),
        cards.filter((c) => c.rarity === 'A'),
      ];
      const seen = new Set();
      const shuf = (W.OPTCG && W.OPTCG.shuffle) || ((a) => a.slice().sort(() => rng() - 0.5));
      for (let lvl = 0; lvl < t1Pools.length && out.length < 50; lvl++) {
        const inc = t1Pools[lvl].filter((c) => !seen.has(c.id));
        inc.forEach((c) => seen.add(c.id));
        for (const c of shuf(inc, rng)) {
          while (out.length < 50 && (used[c.id] || 0) < 4) {
            used[c.id] = (used[c.id] || 0) + 1;
            out.push(c);
          }
          if (out.length >= 50) break;
        }
      }
      return out;
    }
    const band = BANDS[stage.band] || BANDS.t2;
    const totalW = band.list.reduce((a, [, w]) => a + w, 0);
    let guard = 0;
    while (out.length < 50 && guard++ < 8000) {
      let r = rng() * totalW;
      let pick = band.list[0];
      for (const e of band.list) { r -= e[1]; if (r <= 0) { pick = e; break; } }
      const [rar, , maxCost] = pick;
      const pool = cards.filter((c) => c.rarity === rar && c.cost <= maxCost && (used[c.id] || 0) < 4);
      if (!pool.length) {
        // 该档费用上限内耗尽：全档逐级放宽（+1 一档，封顶 10）；还无则换档重抽
        const wider = cards.filter((c) => c.rarity === rar && (used[c.id] || 0) < 4);
        if (wider.length) {
          const c = wider[Math.floor(rng() * wider.length)];
          used[c.id] = (used[c.id] || 0) + 1;
          out.push(c);
          continue;
        }
        continue; // 该 rarity 彻底抽满：重抽（权重转移到剩余档）
      }
      const c = pool[Math.floor(rng() * pool.length)];
      used[c.id] = (used[c.id] || 0) + 1;
      out.push(c);
    }
    // 兜底：极端池配置下未满 50（不期望发生），用全色池补齐
    while (out.length < 50) {
      const rest = cards.filter((c) => (used[c.id] || 0) < 4);
      if (!rest.length) break;
      const c = rest[Math.floor(rng() * rest.length)];
      used[c.id] = (used[c.id] || 0) + 1;
      out.push(c);
    }
    return out;
  }

  // ===== 卡组自动成长：奖励卡入组（替换最弱卡，保持 50 张恒定）=====
  // 替换段：同费段优先；同费段无候选 → 费用最接近的段（高费奖励卡在低费初始组里也能落位，
  // 否则中后期 S/SS 奖励永远进不了组，卡组成长上限被 1-4 费初始结构压死）
  // 段内最弱判定：稀有度低 → 战力低 → id 大；融合卡不入组；已 4 张跳过
  function growDeck(counts, newCards) {
    const cs = { ...(counts || {}) };
    for (const card of newCards) {
      if (!card || card.fusion) continue; // 融合卡只进收藏不进卡组
      if ((cs[card.id] || 0) >= 4) continue;
      const cands = Object.keys(cs).filter((id) => id !== card.id && byId(id));
      if (!cands.length) continue;
      // 替换段选择：同费 → 费用差最小的段
      const costOf = (id) => byId(id).cost;
      let seg = cands.filter((id) => costOf(id) === card.cost);
      if (!seg.length) {
        let bestDiff = Infinity;
        for (const id of cands) {
          const d = Math.abs(costOf(id) - card.cost);
          if (d < bestDiff) { bestDiff = d; seg = [id]; }
          else if (d === bestDiff) seg.push(id);
        }
      }
      seg.sort((a, b) => {
        const A = byId(a), B = byId(b);
        return (RAR_ORDER[A.rarity] ?? 9) - (RAR_ORDER[B.rarity] ?? 9)
          || A.power - B.power
          || b.localeCompare(a);
      });
      const victim = seg[0];
      cs[card.id] = (cs[card.id] || 0) + 1;
      cs[victim]--;
      if (!cs[victim]) delete cs[victim];
    }
    return cs;
  }

  // ===== 奖励结算（纯逻辑，UI 薄壳在 settle）=====
  // 返回 { got: [cardDef...], prog, deck, first } —— 满血判定 myLP>=fullLP（我方 LP 未扣即战斗中未掉分）
  // 重复通关衰减：已通关的关再胜，只发 1 张随机 A（防反复刷终关 SSS；首次通关发全额）
  function rollRewards(stage, prog, myLP, fullLP, collectedIds) {
    const owned = new Set(collectedIds || []);
    const winN = (prog.wins && prog.wins[stage.id]) || 0;
    const rng = ((W.OPTCG && W.OPTCG.makeRng) || ((s) => () => s))((prog.seed * 977 + stage.id * 61 + winN * 7) >>> 0);
    const got = [];
    const first = !(prog.cleared >= stage.id);
    if (first) {
      for (const nm of (stage.reward.fixed || [])) {
        const c = resolveByName(nm);
        if (c) got.push(c);
      }
      for (const [rar, n] of (stage.reward.random || [])) {
        // 随机池同色优先（玩家 red 组成长有效率），同档同色耗尽再全池（收藏维度不受影响）
        let pool = poolOf(rar).filter((c) => c.color === 'red');
        if (!pool.length) pool = poolOf(rar);
        for (let i = 0; i < n && pool.length; i++) got.push(pool[Math.floor(rng() * pool.length)]);
      }
      // 满血奖励（叠加在普通奖励之上）：80% 1×SSS + 20% 1×SS（全池——彩蛋性质，稀有度优先于可用性）
      if (Number.isFinite(myLP) && Number.isFinite(fullLP) && myLP >= fullLP) {
        const pool = poolOf(rng() < 0.8 ? 'SSS' : 'SS');
        if (pool.length) got.push(pool[Math.floor(rng() * pool.length)]);
      }
    } else {
      let pool = poolOf('A').filter((c) => c.color === 'red');
      if (!pool.length) pool = poolOf('A');
      if (pool.length) got.push(pool[Math.floor(rng() * pool.length)]);
    }
    const next = { ...prog, wins: { ...prog.wins, [stage.id]: winN + 1 }, cleared: Math.max(prog.cleared, stage.id), ts: Date.now() };
    for (const c of got) owned.add(c.id);
    return { got, prog: next, collected: [...owned], first };
  }

  // ===== 开局 / 重开 =====
  function expand(counts) {
    const out = [];
    for (const [id, n] of Object.entries(counts || {})) {
      const c = byId(id);
      for (let i = 0; i < n && c; i++) out.push(c); // 缺卡过滤兜底（卡池演进后旧进度里的 id 可能已删）
    }
    return out;
  }

  function startStage(n) {
    const stage = STAGES[n - 1];
    if (!stage) return;
    ensureState();
    const deck = expand(deckCounts());
    if (deck.length !== 50) { // 进度卡组因删卡不足 50：重建初始组（防御兜底，不崩）
      const init = initialDeck();
      rawSave(DKEY, init);
      deck.length = 0;
      deck.push(...expand(init));
    }
    const prog = progress();
    GAME().startGame({
      leaderId: MY_LEADER_ID,
      deck,
      level: stage.ai,
      foeLeader: mkFoe(stage),
      deckB: enemyDeckOf(stage, (prog.seed * 131 + stage.id * 17) >>> 0),
      foeLP: stage.lp,
      ctx: { mode: 'story', stage: stage.id, badge: `故事 第${stage.id}关`, deckRef: deck },
    });
    if (DOC) closePanel();
  }

  // ===== 终局结算（game.js showEndPanel → modes.settle 分发到此；返回结算文案 HTML）=====
  function settle(ctx, win) {
    const stage = STAGES[(ctx && ctx.stage) - 1];
    if (!stage) return '';
    ensureState();
    if (!win) {
      refreshBadge();
      return `⚔ 挑战失败——「${stage.name}」奖励不变，点「再战一局」随时重试`;
    }
    const st = (GAME() && GAME().state()) || {};
    const leader = (POOL().leaders || []).find((l) => l.id === MY_LEADER_ID) || {};
    const fullLP = (leader.life || 5) * 2000;
    const prog = progress();
    const r = rollRewards(stage, prog, st.myLP, fullLP, collected());
    rawSave(PKEY, r.prog);
    rawSave(CKEY, r.collected);
    const deck = growDeck(deckCounts(), r.got);
    if (totalOf(deck) === 50) rawSave(DKEY, deck);
    refreshBadge();
    showGetBanner(r.got, r.prog.cleared >= 10);
    // 结算行：满血加冕提示 + 获得卡列表（飞入演出在 CSS 层）
    const perfect = Number.isFinite(st.myLP) && st.myLP >= fullLP;
    const cardsHtml = r.got.length
      ? `<div class="story-reward">${r.got.map((c) => miniCardHtml(c)).join('')}</div>`
      : '';
    const head = r.first
      ? `🗺 「${stage.name}」通关！${perfect ? '<b class="story-perfect">满血加冕！</b>' : ''}获得：`
      : `🗺 重访旧关，获得：`;
    return head + cardsHtml;
  }

  // 卡片 mini（结算列表用：卡面 + 稀有度角标，CSS 飞入）
  function miniCardHtml(c) {
    if (!DOC || !GAME() || !GAME().cardEl) {
      return `<span class="story-card-chip">${c.name}·${RAR_NAME[c.rarity] || ''}</span>`;
    }
    const el = GAME().cardEl(c, { cls: 'story-card' });
    return el.outerHTML;
  }

  // 发卡演出：中央横幅「获得新卡」（卡片飞入由 endPanel 内 .story-reward 的 CSS 动画承担）
  function showGetBanner(got, allClear) {
    if (!DOC || !got.length) return;
    try {
      document.querySelectorAll('.story-get').forEach((n) => n.remove());
      const b = document.createElement('div');
      b.className = 'story-get';
      b.innerHTML = `<span class="sg-name">${allClear ? '东海篇制霸！' : '获得新卡'}</span><span class="sg-sub">${got.length} 张卡片入手</span>`;
      document.body.appendChild(b);
      setTimeout(() => b.remove(), 2000);
    } catch (e) { /* 演出失败不阻断结算 */ }
  }

  // ===== 关卡选择面板 =====
  function panelEl() {
    if (!DOC) return null;
    let p = document.getElementById('storyPanel');
    if (!p) {
      p = document.createElement('div');
      p.id = 'storyPanel';
      p.className = 'modal story-panel';
      p.innerHTML = '<div class="modal-card story-card-panel">'
        + '<header class="story-head"><h3>故事之旅 · 东海篇</h3>'
        + '<span class="story-prog" id="storyProg"></span>'
        + '<button type="button" class="btn-ghost">关闭</button></header>'
        + '<p class="story-sub">跟着海贼王剧情过关斩将——胜利获得剧情角色卡与随机卡，卡组自动成长，无需手动组牌</p>'
        + '<div class="story-grid" id="storyGrid"></div>'
        + '<footer class="story-foot"><span id="storyDeckInfo"></span><button type="button" class="btn-ghost" id="btnStoryCodex">查看收藏册</button></footer>'
        + '</div>';
      document.body.appendChild(p);
      p.querySelector('.story-head .btn-ghost').onclick = closePanel;
      p.addEventListener('click', (e) => { if (e.target === p) closePanel(); });
      p.querySelector('#btnStoryCodex').onclick = () => {
        closePanel();
        if (W.OPTCG_GALLERY) W.OPTCG_GALLERY.open();
      };
    }
    return p;
  }

  function renderPanel() {
    const p = panelEl();
    if (!p) return;
    ensureState();
    const prog = progress();
    const col = collected().length;
    const total = allCards().length;
    document.getElementById('storyProg').textContent = `已通关 ${prog.cleared}/10 · 收藏 ${col}/${total}`;
    const grid = document.getElementById('storyGrid');
    grid.innerHTML = '';
    STAGES.forEach((st) => {
      const cleared = prog.cleared >= st.id;
      const current = prog.cleared + 1 === st.id;
      const locked = !cleared && !current;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'story-stage' + (cleared ? ' cleared' : '') + (current ? ' current' : '') + (locked ? ' locked' : '');
      b.dataset.stage = st.id;
      b.style.setProperty('--sc', `var(--c-${st.color})`);
      const bossCard = resolveByName(st.boss);
      const stars = `<span class="st-stars" title="已通关">${'★'.repeat(Math.min(3, 1 + Math.floor(((prog.wins && prog.wins[st.id]) || 0) / 2)))}</span>`;
      const rewardTxt = st.reward.fixed.map((n) => { const c = resolveByName(n); return c ? c.name : n; }).join('、')
        + (st.reward.random.length ? (st.reward.fixed.length ? ' + ' : '') + st.reward.random.map(([r, n]) => `${n}×${r}`).join(' + ') : '');
      b.innerHTML = `
        <span class="st-top"><b class="st-no">第${st.id}关</b><span class="st-state">${cleared ? stars : current ? '可挑战' : '🔒 未解锁'}</span></span>
        <span class="st-name">${st.name}</span>
        <span class="st-boss">${bossCard ? `<img src="art/${bossCard.art || bossCard.id}.webp" alt="" loading="lazy" onerror="this.remove()">` : ''}<b>${st.boss}</b></span>
        <span class="st-meta">${COLOR_NAME[st.color]}色 · LP ${st.lp / 1000}K · ${AI_NAME[st.ai]}</span>
        <span class="st-reward" title="通关奖励">${cleared || current ? '🎁 ' + rewardTxt : '🎁 ？？？'}</span>
        ${current ? '<span class="st-go">出发 →</span>' : ''}`;
      b.onclick = () => {
        if (locked) { (W.OPTCG_UI && W.OPTCG_UI.toast || ((m) => console.log(m)))('先通过前面的关卡才能解锁', 'error'); return; }
        startStage(st.id);
      };
      grid.appendChild(b);
    });
    // 卡组概览（张数/均费——收集视角在收藏册，不在此手动组牌）
    const deck = deckCounts();
    const arr = expand(deck);
    const avg = arr.length ? (arr.reduce((a, c) => a + (c.cost || 0), 0) / arr.length).toFixed(1) : '0.0';
    document.getElementById('storyDeckInfo').textContent = `当前卡组 ${arr.length} 张 · 均费 ${avg} · 奖励卡自动入组`;
  }

  function openPanel() { renderPanel(); const p = panelEl(); if (p) p.classList.remove('hidden'); }
  function closePanel() { const p = document.getElementById('storyPanel'); if (p) p.classList.add('hidden'); }

  // 大厅模式卡副标题（modes.js refreshMenu 调用；冷启动先落初始收藏）
  function badgeText() {
    ensureState();
    const prog = progress();
    const col = collected().length;
    const st = STAGES[Math.min(prog.cleared, 9)];
    return prog.cleared > 0 ? `第 ${Math.min(prog.cleared + 1, 10)} 关 · ${st ? st.boss : ''} · 收藏 ${col}` : `东海篇 10 关 · 从风车村出航 · 收藏 ${col}`;
  }
  function refreshBadge() {
    if (!DOC) return;
    const el = document.getElementById('storyBadge');
    if (el) el.textContent = badgeText();
  }

  // ===== 挂接入口（index.html 有 #btnStory 时绑定；selftest/e2e 页无该按钮则静默跳过）=====
  function init() {
    if (!DOC) return;
    const btn = document.getElementById('btnStory');
    if (btn) btn.onclick = openPanel;
    // 调试钩子：?open=story 直接开关卡面板（probe/回归用）
    try {
      const qs = new URLSearchParams(location.search);
      if (qs.get('open') === 'story') openPanel();
    } catch (e) { /* file:// 等 */ }
  }
  init();

  // ===== 公开 API（gallery/modes/probe/单测共用）=====
  W.OPTCG_STORY = {
    STAGES,
    startStage,
    openPanel,
    closePanel,
    settle,
    restart: (ctx) => startStage(ctx && ctx.stage),
    badgeText,
    refreshBadge,
    collectedSet,
    collectedCount: () => collected().length,
    // 纯逻辑（单测/probe 直接驱动）
    initialDeck,
    enemyDeckOf,
    growDeck,
    rollRewards,
    resolveByName,
    mkFoe,
    progress,
    // 存储读写封装（单测用）
    _storage: { load: rawLoad, save: rawSave, keys: { PKEY, CKEY, DKEY }, mem },
  };
})(typeof window !== 'undefined' ? window : globalThis);
