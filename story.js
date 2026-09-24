// 故事之旅模式：跟着海贼王剧情过关收集卡片（20 关四章主线，模式层实现）
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

  // ===== 关卡表（20 关按漫画主线：东海篇 1-7 → 罗格镇 8 → 阿拉巴斯坦 9-11 → 空岛/司法岛 12-15 → 新世界 16-20）=====
  // base=敌方首领借用的船长定义（技能壳/果实），useSkills=false 时技能清空（教学关白板首领）
  // power=Boss 首领战力（模式层参数，随难度曲线爬升）；band=敌方卡组强度带（见 BANDS）
  // big=大关（章末 Boss）：首次通关主角攻击力 +400（progress.atk，开局挂接到玩家船长 power）
  // 船长壳 20 关用 10 个（RED/RED2/BLACK2/BLUE2/GREEN/PURPLE/YELLOW2/GREEN2/PURPLE2/BLUE）且相邻不重复；
  // 1-8 关强度参数沿用东海篇定版（story-sim 百局校准），9-20 为新一轮校准值
  // BIG_ATK：大关首通的主角攻击力成长值（船长 base power 5000，6 大关满成长 +6000）
  // v0.9.5 整数化：400→1000 粒度——400 档成长产生 5400/6200 等 x.2K/x.4K 小数显示（用户「不要小数」）
  const BIG_ATK = 1000;

  // ===== v2 成长进阶：路飞形态 5 档（阶梯展示层；阈值随 BIG_ATK 整千化重排）=====
  const FORMS = [
    { atk: 0, name: '出航·风车村', icon: 'anchor' },
    { atk: 1000, name: '集结·草帽一伙', icon: 'flag' },
    { atk: 2000, name: '威名·伟大航路', icon: 'crown' },
    { atk: 4000, name: '司法岛之怒', icon: 'swords' },
    { atk: 6000, name: '和之国·黎明', icon: 'sparkles' },
  ];
  const formOf = (atk) => FORMS.reduce((f, cur) => ((atk | 0) >= cur.atk ? cur : f), FORMS[0]);
  const formIdxOf = (atk) => FORMS.indexOf(formOf(atk));

  // ===== v2 航海等级：经验只涨荣誉+解锁收藏包（不动战斗数值，防平衡漂移）=====
  const XP_FIRST = 100, XP_REPEAT = 20, XP_PER_LV = 100;
  const lvOf = (xp) => Math.floor((xp | 0) / XP_PER_LV) + 1;
  const LEVEL_PACKS = [5, 10, 15, 20]; // 等级达标一次性收藏包（S×2+SS×1）
  const STAGES = [
    { id: 1, name: '出航·风车村', boss: '克比', color: 'red', lp: 5000, ai: 'easy', band: 't1', power: 3000, base: 'LEADER-RED', useSkills: false,
      reward: { fixed: ['克比'], random: [['A', 3]] }, story: '每个传奇都从一句「我要成为海贼王」开始。风车村的海边，少年推离了岸边——第一位拦路的，是追着出海梦跑来的见习海军克比。' },
    { id: 2, name: '铁锤亚尔丽塔', boss: '亚尔丽塔', color: 'red', lp: 5000, ai: 'easy', band: 't1', power: 3000, base: 'LEADER-RED2', useSkills: false,
      reward: { fixed: ['亚尔丽塔'], random: [['A', 3]] }, story: '小船出海第一战：自称「东海最美」的铁锤亚尔丽塔横在航路上。铁锤很重，但梦想更重。' },
    { id: 3, name: '谢尔兹镇·大刀蒙卡', boss: '蒙卡', color: 'black', lp: 5000, ai: 'easy', band: 't1', power: 3000, base: 'LEADER-BLACK2', useSkills: false,
      reward: { fixed: ['索隆'], random: [['A', 2]] }, story: '谢尔兹镇的练兵场上海军横行。为了救下被绑在海边的三刀剑士，先过大刀蒙卡这一关——索隆正在等你。' },
    { id: 4, name: '橘子镇·小丑巴基', boss: '巴基', color: 'red', lp: 8000, ai: 'easy', band: 't2', power: 4000, base: 'LEADER-RED', useSkills: true,
      reward: { fixed: [], random: [['B', 2], ['A', 2]] }, story: '橘子镇的爆炸声连成一片。四分五裂的果实能力者、小丑巴基，东海扩张路上的第一块硬骨头。' },
    { id: 5, name: '西罗布村·克洛船长', boss: '克洛', color: 'red', lp: 8000, ai: 'normal', band: 't2', power: 4000, base: 'LEADER-RED2', useSkills: true,
      reward: { fixed: ['乌索普'], random: [['B', 2]] }, story: '西罗布村的谎言少年喊了多年「海贼来了」。这一次海贼真的来了——三年布局的克洛船长，盯上了可雅家的财产。' },
    { id: 6, name: '海上餐厅·顿·克利克', boss: '顿·克利克', color: 'blue', lp: 9000, ai: 'normal', band: 't2', power: 4000, base: 'LEADER-BLUE2', useSkills: true,
      reward: { fixed: ['山治'], random: [['B', 2]] }, story: '东海霸主带着五十艘舰队的残骸闯进海上餐厅。铁甲与毒gas齐发——而厨师的踢技只对浪费食物的人出鞘。' },
    { id: 7, name: '可可亚村·阿龙', boss: '阿龙', color: 'red', lp: 10000, ai: 'normal', band: 't3', power: 4000, base: 'LEADER-RED2', useSkills: true, big: true,
      reward: { fixed: ['娜美'], random: [['S', 1]] }, story: '八年前的谎言在可可亚村揭穿。锯齿鲨鱼人阿龙和他的乐园——这一次，帽子借给了航海士的刀。东海篇的终点，草帽一伙集结完毕。' },
    { id: 8, name: '罗格镇·白猎人斯摩格', boss: '斯摩格', color: 'blue', lp: 10000, ai: 'normal', band: 't3', power: 4000, base: 'LEADER-BLUE2', useSkills: true,
      reward: { fixed: ['达斯琪'], random: [['S', 1]] }, story: '处刑台的风吹过罗格镇——海贼王死去的地方，新的时代在这里起跑。海雾里裹着白猎人斯摩格的冒烟果实，还有快刀达斯琪的雪走。' },
    { id: 9, name: '小花园·蜡笔Mr.3', boss: 'Mr.3', color: 'green', lp: 10000, ai: 'normal', band: 't3', power: 4000, base: 'LEADER-GREEN', useSkills: true,
      reward: { fixed: ['Mr.3', '罗宾'], random: [['B', 2], ['S', 1]] }, story: '伟大航路的第一站威士忌山峰，酒杯背后藏着巴洛克工作社的刀。小花园里，蜡烛果实的艺术家要把巨人百年决斗做成蜡像——而神秘女子罗宾，在暗中留下了第一个谜。' },
    { id: 10, name: '磁鼓岛·铁桶暴君', boss: '瓦波尔', color: 'purple', lp: 10000, ai: 'normal', band: 't3', power: 4000, base: 'LEADER-PURPLE', useSkills: true,
      reward: { fixed: ['乔巴'], random: [['S', 1]] }, story: '雪山之国的医生被驱逐，篡位的暴君吞下了整个王宫。樱花刀旗在磁鼓山飘起之前——蓝鼻子的驯鹿医生，会是你见过最温柔的怪物。' },
    { id: 11, name: '阿拉巴斯坦·沙漠之王', boss: '克洛克达尔', color: 'yellow', lp: 12000, ai: 'hard', band: 't4', power: 4000, base: 'LEADER-YELLOW2', useSkills: true, big: true,
      reward: { fixed: ['克洛克达尔', '薇薇'], random: [['SSS', 1], ['SS', 1]] }, story: '王国在旱魃中燃烧了三年，真相沉在雨地的赌场底下。王下七武海、沙沙果实的沙漠之王——为了白鸽少女的祖国，这一战没有退路。' },
    { id: 12, name: '加亚·鬣狗贝拉米', boss: '贝拉米', color: 'red', lp: 11000, ai: 'normal', band: 't4', power: 5000, base: 'LEADER-RED2', useSkills: true,
      reward: { fixed: ['贝拉米'], random: [['SS', 1]] }, story: '魔谷镇的新时代崇拜金钱与现势。嘲笑梦想的鬣狗一拳被打上天井——有些东西，只有去过的人才看得见。' },
    { id: 13, name: '空岛·雷神艾涅尔', boss: '艾涅尔', color: 'green', lp: 12000, ai: 'hard', band: 't4', power: 5000, base: 'LEADER-GREEN2', useSkills: true, big: true,
      reward: { fixed: ['艾涅尔', '甘福尔'], random: [['SSS', 1]] }, story: '冲击帆把船抬上一万米。神的领域里，响雷果实的自封神明俯瞰人间——黄金钟敲响的时刻，香狄亚四百年的钟声有了回音。' },
    { id: 14, name: '七水之都·船匠卡库', boss: '卡库', color: 'green', lp: 13000, ai: 'normal', band: 't4', power: 5000, base: 'LEADER-GREEN', useSkills: true,
      reward: { fixed: ['卡库'], random: [['SS', 1]] }, story: '水之都的运河里漂着冰山的枪声与罗宾的告别。长鼻子的船匠卸下面具——CP9 的鬼牌，在司法岛的影子下先行亮爪。' },
    { id: 15, name: '司法岛·CP9路奇', boss: '罗布·路奇', color: 'black', lp: 14000, ai: 'hard', band: 't4', power: 5000, base: 'LEADER-BLACK2', useSkills: true, big: true,
      reward: { fixed: ['罗布·路奇', '弗兰奇'], random: [['SSS', 1], ['SS', 1]] }, story: '世界政府正义之门缓缓开启，罗宾终于喊出了想活下去。CP9 最强杀手、豹果实的六式之王——对着正义之塔，放声呐喊吧。' },
    { id: 16, name: '魔鬼三角·月光莫利亚', boss: '莫利亚', color: 'purple', lp: 15000, ai: 'hard', band: 't4', power: 5000, base: 'LEADER-PURPLE2', useSkills: true,
      reward: { fixed: ['莫利亚', '布鲁克'], random: [['SS', 1]] }, story: '魔鬼海域里飘来一艘幽灵船，骷髅绅士的笑声穿过十年孤独。影子果实的傀儡大军深处——宾克斯的美酒，再唱一遍。' },
    { id: 17, name: '香波地·和平主义者', boss: '战桃丸', color: 'red', lp: 15000, ai: 'normal', band: 't4', power: 5000, base: 'LEADER-RED2', useSkills: true,
      reward: { fixed: ['战桃丸', '雷利'], random: [['SS', 1]] }, story: '世界贵族的一声枪响，引来大将黄猿与和平主义者军团。泡沫群岛的逃亡路上，冥王雷利的剑，替时代挡下一刀。' },
    { id: 18, name: '马林梵多·赤犬', boss: '萨卡斯基', color: 'red', lp: 16000, ai: 'hard', band: 't4', power: 5000, base: 'LEADER-RED', useSkills: true, big: true,
      reward: { fixed: ['萨卡斯基', '艾斯'], random: [['SSS', 1]] }, story: '顶上战争。白胡子的时代在岩浆与烈火中落幕，火拳把最后的笑容留给弟弟——你以为的失去一切，恰恰是全世界开始注视你的时刻。' },
    { id: 19, name: '鱼人岛·霍迪·琼斯', boss: '霍迪·琼斯', color: 'blue', lp: 17000, ai: 'hard', band: 't4', power: 5000, base: 'LEADER-BLUE', useSkills: true,
      reward: { fixed: ['霍迪·琼斯'], random: [['SS', 1]] }, story: '一万米海底的阳光承载着鱼人岛的两代仇恨。被憎恨养大的獠牙，终究咬不断乙姬王妃留下的那封信。' },
    { id: 20, name: '和之国·百兽凯多', boss: '凯多', color: 'green', lp: 17000, ai: 'hard', band: 't4', power: 5000, base: 'LEADER-GREEN2', useSkills: true, big: true,
      reward: { fixed: ['凯多', '光月桃之助'], random: [['SSS', 2]] }, story: '鬼岛的天空烧成赤红，「海贼王」与世界最强的战斗同夜打响。二十年的开国夙愿、御田的家臣、以及雷鸣八卦——把黎明带到和之国！' },
  ];

  // 章节分组（关卡面板小节标题；1 起始 id → 章名）
  const CHAPTERS = [
    [1, '第一章 · 东海篇'],
    [8, '第二章 · 伟大航路与阿拉巴斯坦'],
    [12, '第三章 · 空岛与司法岛'],
    [16, '第四章 · 顶上战争与新世界'],
  ];

  // 敌方卡组强度带：list = [稀有度, 权重, 费用上限]（费用上限压制高档卡的中后期碾压；
  // 浅色池耗尽时逐级放宽费用上限兜底，权重同比例转移）
  const BANDS = {
    t1: { list: [['A', 1, 2]] }, // 教学带：全 A 低费白板（白板约束在生成器内）
    t2: { list: [['A', 0.72, 4], ['B', 0.28, 4]] },
    t3: { list: [['A', 0.68, 4], ['B', 0.22, 5], ['S', 0.10, 5]] },
    t4: { list: [['A', 0.66, 4], ['B', 0.32, 4], ['S', 0.02, 4]] }, // 终关带（20 关 sim 校准终态：稀有度权重才是有效杠杆，费用上限对浅色池是摆设）
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
      // manual=T4 手动构筑标志：true=奖励只进收藏不自动改组（旧档缺字段=false=自动成长）
      return { cleared: p.cleared | 0, wins: (p.wins && typeof p.wins === 'object') ? p.wins : {}, seed: p.seed, ts: p.ts | 0, atk: p.atk | 0, xp: p.xp | 0, packs: (p.packs && typeof p.packs === 'object') ? p.packs : {}, manual: !!p.manual };
    }
    return newProgress();
  }
  function collected() {
    const v = rawLoad(CKEY);
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  }
  // 读取入口先确保状态初始化（幂等）：图鉴冷启动/大厅副标题在未开过局时也能看到初始收藏
  const collectedLive = () => collected().filter((id) => byId(id)); // 幽灵过滤：已删卡的收藏 id 不计数（v0.9.4）
  const collectedSet = () => { ensureState(); return new Set(collectedLive()); };
  const collectedCount = () => { ensureState(); return collectedLive().length; };
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
  function resolveByName(name, preferColor) {
    if (!name) return null;
    let cands = allCards().filter((c) => !c.fusion && c.type === 'char' && c.name === name);
    if (!cands.length) cands = allCards().filter((c) => !c.fusion && c.type === 'char' && c.name.includes(name));
    if (!cands.length) return null;
    // 色偏好优先（故事模式 Boss 与关卡敌色绑定——P2 扩池后同名牌跨色共存，红优先旧序会抢错色）
    const pref = (c) => (preferColor ? (c.color === preferColor ? 0 : 1) : (c.color === 'red' ? 0 : 1));
    cands.sort((a, b) => pref(a) - pref(b) || (a.cost - b.cost) || a.id.localeCompare(b.id));
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

  // 幽灵卡治愈（v0.9.4）：卡池演进删卡后，旧档 counts 里的死 id 计数仍占着张数——totalOf 恰 50
  // 时永不触发重建，expand 后实际缺张进局；startStage 兜底还会把成长组整组重置（攒的 S/SS 清零）。
  // 治愈=剔除死 id 后按初始组逻辑补足缺口，存活卡全部保留
  function healDeck(counts) {
    const cs = { ...(counts || {}) };
    for (const id of Object.keys(cs)) if (!byId(id)) delete cs[id];
    if (totalOf(cs) >= 50) return cs;
    const init = initialDeck();
    for (let r = 1; r <= 4 && totalOf(cs) < 50; r++) {
      for (const id of Object.keys(init)) {
        if (totalOf(cs) >= 50) break;
        if ((cs[id] || 0) < Math.min(r, init[id])) cs[id] = (cs[id] || 0) + 1;
      }
    }
    return cs;
  }

  // 冷启动：无进度时落初始卡组 + 初始收藏（初始卡组卡视为已收集）
  function ensureState() {
    let p = rawLoad(PKEY);
    let deck = deckCounts();
    if (!deck || totalOf(deck) !== 50) {
      deck = initialDeck();
      rawSave(DKEY, deck);
    } else {
      const healed = healDeck(deck); // 幽灵治愈落盘（幂等：治愈后再调零变化）
      if (JSON.stringify(healed) !== JSON.stringify(deck)) rawSave(DKEY, healed);
    }
    if (!collected().length) {
      rawSave(CKEY, Object.keys(deck).filter((id) => byId(id)));
    }
    if (!p) { p = newProgress(); rawSave(PKEY, p); }
    else if (p && typeof p === 'object' && Number.isInteger(p.seed) && p.seed > 0 && !('atk' in p)) {
      // v0.8.4 旧档迁移：无 atk 字段=大关成长上线前的档案，按已通大关数回填
      //（cleared≥7 → 第 7 关大关已通 +400；防老玩家终身少 400、面板「+主角攻击力↑」永不兑现）
      p.atk = STAGES.filter((s) => s.big && (p.cleared | 0) >= s.id).length * BIG_ATK;
      rawSave(PKEY, p);
    }
    return true;
  }

  // ===== 敌方首领合成：借 12 船长的数值/技能壳，名字/称号/Boss 战力按关卡覆写 =====
  // useSkills=false（教学关）：技能清空 = 白板首领（最弱一档）；id 保留原船长（悬停信息卡/技能说明可查）
  // 皮壳分离（v0.9.2）：立绘 art/果实 fruit 换成 Boss 自己的角色卡（resolveByName）——壳只出技能/数值，
  // 否则「克洛克达尔点开资料是波雅」穿帮（19/20 关皮≠壳；瓦波尔池内无卡=保留壳立绘降级）
  function mkFoe(stage) {
    const base = (POOL().leaders || []).find((l) => l.id === stage.base)
      || (POOL().leaders || []).find((l) => l.color === stage.color) || {};
    const face = resolveByName(stage.boss, stage.color);
    return {
      ...base,
      ...(face ? { art: face.art || face.id, fruit: face.fruit || null } : {}),
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
    // 大关首通：主角攻击力 +400（成长随进度持久化，开局挂接到玩家船长 power）
    const atkGain = (stage.big && first) ? BIG_ATK : 0;
    // v2 航海等级：胜利得经验（首通 100 / 重玩 20），等级只涨荣誉
    const next = {
      ...prog,
      wins: { ...prog.wins, [stage.id]: winN + 1 },
      cleared: Math.max(prog.cleared, stage.id),
      ts: Date.now(),
      atk: (prog.atk | 0) + atkGain,
      xp: (prog.xp | 0) + (first ? XP_FIRST : XP_REPEAT),
    };
    // v2 成长收藏包（一次性，packs 记账防重发）：
    //   等级包 Lv5/10/15/20 各 S×2+SS×1；形态跳升包 S×2+SS×1（成长的实质奖励，不进卡组也进收藏）
    const packs = { ...(prog.packs || {}) };
    // v2.1 收藏包独立子 rng：主 rng 只走 v1 原有消耗路径（fixed/random/满血/重复通关），
    // 主奖励序列与 v1 逐字节对齐（v2 首发版 drawPack 借用主 rng，每包多耗 3 次致后续关卡奖励变位）
    const packRng = ((W.OPTCG && W.OPTCG.makeRng) || ((s) => () => s))((prog.seed * 7717 + stage.id * 13 + winN) >>> 0);
    const drawPack = (tag) => {
      for (const [rar, n] of [['S', 2], ['SS', 1]]) {
        let pool = poolOf(rar).filter((c) => c.color === 'red');
        if (!pool.length) pool = poolOf(rar);
        for (let i = 0; i < n && pool.length; i++) got.push(pool[Math.floor(packRng() * pool.length)]);
      }
      packs[tag] = 1;
    };
    const beforeLv = lvOf(prog.xp), afterLv = lvOf(next.xp);
    for (const lv of LEVEL_PACKS) {
      if (beforeLv < lv && afterLv >= lv && !packs['lv' + lv]) drawPack('lv' + lv);
    }
    const beforeForm = formIdxOf(prog.atk), afterForm = formIdxOf(next.atk);
    if (afterForm > beforeForm && !packs['form' + afterForm]) drawPack('form' + afterForm);
    next.packs = packs;
    const formUp = afterForm > beforeForm ? FORMS[afterForm] : null; // settle 演出用
    for (const c of got) owned.add(c.id);
    return { got, prog: next, collected: [...owned], first, formUp };
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
      myLeaderAtk: prog.atk | 0, // 大关成长：主角攻击力（挂接到玩家船长 power）
      deck,
      level: stage.ai,
      foeLeader: mkFoe(stage),
      deckB: enemyDeckOf(stage, (prog.seed * 131 + stage.id * 17) >>> 0),
      foeLP: stage.lp,
      rules: { deckoutByLp: true }, // v2：牌库打空按 LP 裁定——同分平局=本关未过，再战一局
      ctx: { mode: 'story', stage: stage.id, badge: `故事 第${stage.id}关`, deckRef: deck, themeColor: stage.color },
    });
    if (DOC) closePanel();
  }

  // ===== 终局结算（game.js showEndPanel → modes.settle 分发到此；返回结算文案 HTML）=====
  function settle(ctx, win, draw) {
    const stage = STAGES[(ctx && ctx.stage) - 1];
    if (!stage) return '';
    ensureState();
    if (draw) {
      // v2 平局：牌库打空且双方同分=本关未过（不算失败，也不发奖励）
      refreshBadge();
      return `⚖ 平局——牌库打空时双方积分相同。「${stage.name}」尚未通关，再战一局分出胜负！`;
    }
    if (!win) {
      refreshBadge();
      return `⚔ 挑战失败——「${stage.name}」奖励不变，点「再战一局」随时重试`;
    }
    const st = (GAME() && GAME().state()) || {};
    const leader = (POOL().leaders || []).find((l) => l.id === MY_LEADER_ID) || {};
    const fullLP = (leader.life || 5) * 2000;
    const prog = progress();
    const r = rollRewards(stage, prog, st.myLP, fullLP, collectedLive()); // 传活收藏：幽灵 id 不再随结算写回 CKEY
    const atkGained = r.prog.atk - (prog.atk | 0); // 大关首通的成长增量（结算行提示用）
    rawSave(PKEY, r.prog);
    rawSave(CKEY, r.collected);
    // T4 手动构筑模式：奖励只进收藏不自动改组（自动成长=现状行为不变）
    if (!r.prog.manual) {
      const deck = growDeck(deckCounts(), r.got);
      if (totalOf(deck) === 50) rawSave(DKEY, deck);
    }
    refreshBadge();
    showGetBanner(r.got, r.prog.cleared >= STAGES.length);
    // v2 形态跳升横幅（演进定格 2.2s；与发卡横幅错峰）
    if (r.formUp) {
      try {
        const fb = document.createElement('div');
        fb.className = 'story-formup';
        fb.innerHTML = `<span class="sf-icon">${(W.OPTCG_CAPTAINS ? OPTCG_CAPTAINS.icon(r.formUp.icon) : '⬆')}</span>`
          + `<span class="sf-txt"><b>形态进阶 · ${r.formUp.name}</b><i>主角攻击力 +${r.prog.atk} · 成长收藏包已发放</i></span>`;
        document.body.appendChild(fb);
        setTimeout(() => fb.remove(), 2200);
      } catch (e) { /* 演出失败不阻断结算 */ }
    }
    // 结算行：满血加冕 + 大关成长提示 + 获得卡列表（飞入演出在 CSS 层）
    const perfect = Number.isFinite(st.myLP) && st.myLP >= fullLP;
    const cardsHtml = r.got.length
      ? `<div class="story-reward">${r.got.map((c) => miniCardHtml(c)).join('')}</div>`
      : '';
    const lvNow = lvOf(r.prog.xp);
    const formNow = formOf(r.prog.atk);
    const formLine = r.formUp
      ? `<b class="story-form-up">◈ 形态进阶「${r.formUp.name}」！附赠成长收藏包（S×2+SS×1）</b>`
      : '';
    const head = r.first
      ? `🗺 「${stage.name}」通关！${perfect ? '<b class="story-perfect">满血加冕！</b>' : ''}${atkGained > 0 ? `<b class="story-atk-up">主角攻击力 +${atkGained}（当前 +${r.prog.atk}）！</b>` : ''}获得：${formLine}<span class="story-lv">航海日志 Lv.${lvNow} · ${formNow.name}</span>`
      : `🗺 重访旧关，获得：<span class="story-lv">航海日志 Lv.${lvNow} · ${formNow.name}</span>`;
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
      b.innerHTML = `<span class="sg-name">${allClear ? '伟大航路全线制霸！' : '获得新卡'}</span><span class="sg-sub">${got.length} 张卡片入手</span>`;
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
        + '<header class="story-head"><h3>故事之旅 · 伟大航路</h3>'
        + '<span class="story-prog" id="storyProg"></span>'
        + '<button type="button" class="btn-ghost">关闭</button></header>'
        + '<p class="story-sub">跟着海贼王剧情过关斩将（东海→阿拉巴斯坦→空岛→司法岛→顶上战争→和之国）——章末大关通关后主角攻击力上升，卡组自动成长，无需手动组牌</p>'
        + '<div class="story-grid" id="storyGrid"></div>'
        + '<footer class="story-foot"><span id="storyDeckInfo"></span>'
        + '<button type="button" class="btn-ghost" id="btnStoryDeckEdit">手动构筑</button>'
        + '<button type="button" class="btn-ghost" id="btnStoryCodex">查看收藏册</button></footer>'
        + '</div>';
      document.body.appendChild(p);
      p.querySelector('.story-head .btn-ghost').onclick = closePanel;
      p.addEventListener('click', (e) => { if (e.target === p) closePanel(); });
      p.querySelector('#btnStoryCodex').onclick = () => {
        closePanel();
        if (W.OPTCG_GALLERY) W.OPTCG_GALLERY.open();
      };
      p.querySelector('#btnStoryDeckEdit').onclick = () => openStoryBuilder(); // T4：收藏过滤版构筑器
    }
    return p;
  }

  function renderPanel() {
    const p = panelEl();
    if (!p) return;
    ensureState();
    const prog = progress();
    const col = collectedCount();
    const total = allCards().length;
    document.getElementById('storyProg').textContent = `已通关 ${prog.cleared}/20 · Lv.${lvOf(prog.xp)} ${formOf(prog.atk).name}${(prog.atk | 0) > 0 ? ` · 攻击+${prog.atk | 0}` : ''} · 收藏 ${col}/${total}`;
    const grid = document.getElementById('storyGrid');
    grid.innerHTML = '';
    STAGES.forEach((st) => {
      // 章节小节标题（跨全宽）
      const chap = CHAPTERS.find(([id]) => id === st.id);
      if (chap) {
        const h = document.createElement('div');
        h.className = 'story-chapter';
        // 「已制霸」按章末关判定（下一章首-1）：章首一通就亮会与同屏未通关卡自相矛盾
        const ci = CHAPTERS.indexOf(chap);
        const chapEnd = (ci + 1 < CHAPTERS.length ? CHAPTERS[ci + 1][0] : STAGES.length + 1) - 1;
        h.innerHTML = `<b>${chap[1]}</b><span>${prog.cleared >= chapEnd ? '已制霸' : chap[1].includes('一') && prog.cleared === 0 ? '从这里起航' : ''}</span>`;
        grid.appendChild(h);
      }
      const cleared = prog.cleared >= st.id;
      const current = prog.cleared + 1 === st.id;
      const locked = !cleared && !current;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'story-stage' + (cleared ? ' cleared' : '') + (current ? ' current' : '') + (locked ? ' locked' : '') + (st.big ? ' big' : '');
      b.dataset.stage = st.id;
      b.style.setProperty('--sc', `var(--c-${st.color})`);
      const bossCard = resolveByName(st.boss, st.color);
      const stars = `<span class="st-stars" title="已通关">${'★'.repeat(Math.min(3, 1 + Math.floor(((prog.wins && prog.wins[st.id]) || 0) / 2)))}</span>`;
      const rewardTxt = st.reward.fixed.map((n) => { const c = resolveByName(n); return c ? c.name : n; }).join('、')
        + (st.reward.random.length ? (st.reward.fixed.length ? ' + ' : '') + st.reward.random.map(([r, n]) => `${n}×${r}`).join(' + ') : '');
      b.innerHTML = `
        <span class="st-top"><b class="st-no">第${st.id}关</b>${st.big ? '<b class="st-big" title="章末大关：首次通关主角攻击力 +400">⚔ 大关</b>' : ''}<span class="st-state">${cleared ? stars : current ? '可挑战' : '🔒 未解锁'}</span></span>
        <span class="st-name">${st.name}</span>
        <span class="st-boss">${bossCard ? `<img src="art/${bossCard.art || bossCard.id}.webp" alt="" loading="lazy" onerror="this.remove()">` : ''}<b>${st.boss}</b></span>
        <span class="st-meta">${COLOR_NAME[st.color]}色 · LP ${st.lp / 1000}K · ${AI_NAME[st.ai]}</span>
        <span class="st-reward" title="通关奖励">${cleared || current ? '🎁 ' + rewardTxt + (st.big ? ' + 主角攻击力↑' : '') : '🎁 ？？？'}</span>
        ${current ? '<span class="st-go">出发 →</span>' : ''}`;
      b.onclick = () => {
        if (locked) { (W.OPTCG_UI && W.OPTCG_UI.toast || ((m) => console.log(m)))('先通过前面的关卡才能解锁', 'error'); return; }
        startStage(st.id);
      };
      grid.appendChild(b);
    });
    // 卡组概览（张数/均费——收集视角在收藏册；T4 手动构筑时标注并换按钮文案）
    const deck = deckCounts();
    const arr = expand(deck);
    const avg = arr.length ? (arr.reduce((a, c) => a + (c.cost || 0), 0) / arr.length).toFixed(1) : '0.0';
    document.getElementById('storyDeckInfo').textContent = prog.manual
      ? `当前卡组 ${arr.length} 张 · 均费 ${avg} · 手动构筑（奖励只进收藏）`
      : `当前卡组 ${arr.length} 张 · 均费 ${avg} · 奖励卡自动入组`;
    const eb = document.getElementById('btnStoryDeckEdit');
    if (eb) eb.textContent = prog.manual ? '✎ 编辑卡组（手动）' : '⚙ 手动构筑';
  }

  // ===== T4 手动构筑：modes.js 构筑器的收藏过滤版（一套 UI 两种池）=====
  function openStoryBuilder() {
    const M = W.OPTCG_MODES;
    if (!M || typeof M.openBuilder !== 'function') {
      (W.OPTCG_UI && W.OPTCG_UI.toast || ((m) => console.log(m)))('构筑器不可用（modes.js 未加载）', 'error');
      return;
    }
    ensureState();
    let counts = deckCounts();
    if (!counts || totalOf(counts) !== 50) counts = initialDeck(); // 防御：残组不给进编辑器
    M.openBuilder({
      story: true,
      lockLeaderId: MY_LEADER_ID, // 玩家固定路飞：色选择器只留这一位（无同色船长误点清空）
      poolIds: collectedSet(),
      counts,
      onSave: (manual, saved) => {
        const p = progress();
        if (manual && saved) {
          rawSave(DKEY, saved);
          p.manual = true;
        } else {
          p.manual = false; // 恢复自动成长（手动组保留在 DKEY，之后奖励自动改组）
        }
        rawSave(PKEY, p);
        renderPanel();
        refreshBadge();
      },
      onDone: renderPanel,
    });
  }

  function openPanel() {
    renderPanel(); const p = panelEl(); if (p) p.classList.remove('hidden');
    try { W.OPTCG_GAME && W.OPTCG_GAME.onStoryPanel && W.OPTCG_GAME.onStoryPanel(true); } catch (e) { /* game.js 缺席（selftest 页） */ }
  }
  function closePanel() {
    const p = document.getElementById('storyPanel'); if (p) p.classList.add('hidden');
    try { W.OPTCG_GAME && W.OPTCG_GAME.onStoryPanel && W.OPTCG_GAME.onStoryPanel(false); } catch (e) { /* 同上 */ }
  }

  // 大厅模式卡副标题（modes.js refreshMenu 调用；冷启动先落初始收藏）
  function badgeText() {
    ensureState();
    const prog = progress();
    const col = collectedCount();
    const total = STAGES.length;
    const st = STAGES[Math.min(prog.cleared, total - 1)];
    if (prog.cleared >= total) return `全线制霸 · Lv.${lvOf(prog.xp)} ${formOf(prog.atk).name} · 攻击+${prog.atk | 0} · 收藏 ${col}`; // 20 关全通：无「下一关」可指
    return prog.cleared > 0
      ? `第 ${Math.min(prog.cleared + 1, total)} 关 · ${st ? st.boss : ''} · Lv.${lvOf(prog.xp)} ${formOf(prog.atk).name} · 收藏 ${col}`
      : `伟大航路 20 关 · 从风车村到和之国 · 收藏 ${col}`;
  }
  function refreshBadge() {
    if (!DOC) return;
    const txt = badgeText();
    const el = document.getElementById('storyBadge');
    if (el) el.textContent = txt;
    const ms = document.getElementById('msStoryBadge'); // 模式选择首页（G6）同步副标题
    if (ms) ms.textContent = txt;
  }

  // ===== 挂接入口（index.html 有 #btnStory 时绑定；selftest/e2e 页无该按钮则静默跳过）=====
  function init() {
    if (!DOC) return;
    const btn = document.getElementById('btnStory');
    if (btn) btn.onclick = openPanel;
    refreshBadge(); // 首屏刷模式选择页副标题（msStoryBadge）
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
    collectedCount,
    // 纯逻辑（单测/probe 直接驱动）
    initialDeck,
    enemyDeckOf,
    growDeck,
    rollRewards,
    resolveByName,
    mkFoe,
    progress,
    // v2 成长进阶（单测/probe 用）：形态与等级换算
    formOf,
    formIdxOf,
    lvOf,
    FORMS,
    openStoryBuilder, // T4 手动构筑入口（probe：组 50 张自定义组进局）
    // 存储读写封装（单测用）
    _storage: { load: rawLoad, save: rawSave, keys: { PKEY, CKEY, DKEY }, mem, ensure: ensureState },
  };
})(typeof window !== 'undefined' ? window : globalThis);
