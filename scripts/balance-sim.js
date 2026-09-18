// balance-sim.js — dev-only 平衡模拟工具（不暴露给玩家）
// 6色×6色 全 15 个 matchup（含镜像），固定 seed（makeRng 注入）批量 AI vs AI。
//   - 主矩阵：normal vs normal，每 matchup --games 局（默认 30），双方交替先后手抵消先手优势
//   - 抽样组：hard vs hard，每 matchup --hard-games 局（默认 8）
// 卡死检测：单局动作数 > STALL_ACTIONS(500) 判 stall（驱动层 guard，AI 本身不改）。
// 产出：docs/balance-report.json + docs/balance-report.md（--baseline 可叠加调池前后对比）。
// 依赖 web/app.bundle.js：改 engine/ai/data 后先 node scripts/bundle.js 再跑本工具。
//
// 用法：
//   node scripts/balance-sim.js                       # 15×30 normal + 15×8 hard
//   node scripts/balance-sim.js --games 60            # 加大样本
//   node scripts/balance-sim.js --baseline docs/balance-report.before.json   # 前后对比报告
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { writeFileSync, readFileSync, mkdirSync, statSync } from 'node:fs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// ---- bundle 新鲜度守卫：源码比 bundle 新则提醒（数据改了忘重打包会让结论失真）----
function fresherThan(a, b) {
  try { return statSync(a).mtimeMs > statSync(b).mtimeMs + 500; } catch { return false; }
}
const bundlePath = join(ROOT, 'web', 'app.bundle.js');
for (const src of ['engine', 'ai', 'data/cards.json'].map((p) => join(ROOT, p))) {
  if (fresherThan(src, bundlePath)) console.warn(`⚠ ${src} 比 web/app.bundle.js 新，先跑 node scripts/bundle.js`);
}

await import(pathToFileURL(bundlePath).href); // → globalThis.OPTCG
const O = globalThis.OPTCG;

// ---- 参数 ----
const args = process.argv.slice(2);
function argNum(name, dflt) {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && /^\d+$/.test(args[i + 1]) ? Number(args[i + 1]) : dflt;
}
function argStr(name, dflt) {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : dflt;
}
const GAMES = argNum('games', 30);
const HARD_GAMES = argNum('hard-games', 8);
const BASELINE = argStr('baseline', null);

const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'black'];
const COLOR_CN = { red: '红', blue: '蓝', green: '绿', yellow: '黄', purple: '紫', black: '黑' };
const STALL_ACTIONS = 900; // 卡死判定：驱动层 guard，超过即停并记数（对峙局每回合~15步×60回合，deckout 兜底在 STALL 前终局）
const MAX_TURNS = 300;     // 回合上限兜底（正常局 < 30 回合）

// ---- 工具 ----
// FNV-1a：把 matchup 名散成 seed 基数，避免连续 seed 在 mulberry32 下的首输出相关性
function fnv(str) {
  let h = 0x811c9dc5;
  for (const ch of str) { h ^= ch.charCodeAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
}

function deckOf(color) {
  const cs = O.POOL.cards.filter((c) => c.color === color);
  const deck = [];
  for (let i = 0; i < 4; i++) for (const c of cs) deck.push(c); // 轮次交错：全卡型均入组（旧连块×4 会把池序靠后的装备/舞台截出 50 张外，2026-09-18 三处同源同步修）
  return deck.slice(0, 50);
}

// 单局驱动：双 AI 轮流决策（含 pending 响应窗口）。异常不炸批：记 error 后终止该局。
// 附加观测：手牌峰值（满手牌压力）、双方牌库耗尽时刻（空牌库压力）——驱动层采样，不改引擎。
function playGame({ color0, color1, lvl0, lvl1, seed }) {
  const leader0 = O.POOL.leaders.find((l) => l.color === color0);
  const leader1 = O.POOL.leaders.find((l) => l.color === color1);
  const s = O.newGame({ leaderA: leader0, deckA: deckOf(color0), leaderB: leader1, deckB: deckOf(color1), seed });
  const ai0 = O.createAI(lvl0, O.makeRng(seed * 2 + 1));
  const ai1 = O.createAI(lvl1, O.makeRng(seed * 2 + 2));
  let steps = 0;
  let maxHand = 0, deckEmptyTurns = 0; // 满手牌峰值 / 牌库空后仍在打的回合数
  const sample = () => {
    for (const p of s.players) {
      if (p.hand.length > maxHand) maxHand = p.hand.length;
      if (p.deck.length === 0) deckEmptyTurns++;
    }
  };
  while (s.winner === null && s.turn <= MAX_TURNS && steps < STALL_ACTIONS) {
    const acts = O.listActions(s);
    if (!acts.length) return { winner: null, reason: 'noActions', steps, turns: s.turn, stalled: true, maxHand, deckEmptyTurns };
    const ai = s.pending ? (s.pending.target.side === 0 ? ai0 : ai1) : (s.active === 0 ? ai0 : ai1);
    try {
      const a = ai.choose(s, acts);
      if (!a) return { winner: null, reason: 'aiNoChoice', steps, turns: s.turn, stalled: true, maxHand, deckEmptyTurns };
      O.applyAction(s, a);
    } catch (e) {
      return { winner: null, reason: `error:${e.message}`, steps, turns: s.turn, stalled: true, error: e.message, maxHand, deckEmptyTurns };
    }
    steps++;
    if (steps % 5 === 0) sample();
  }
  sample();
  return {
    winner: s.winner, reason: s.winReason, steps, turns: s.turn,
    stalled: s.winner === null, maxHand, deckEmptyTurns,
  };
}

// ---- 单 matchup 聚合 ----
function pct(n, d) { return d ? (n / d * 100).toFixed(1) : '-'; }
function quantile(sorted, q) {
  if (!sorted.length) return 0;
  return sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
}

function runMatchup(colorA, colorB, level, games, tag) {
  const seedBase = fnv(`${tag}:${colorA}:${colorB}`) % 100000;
  const agg = {
    a: colorA, b: colorB, level, games,
    winsA: 0, winsB: 0, draws: 0, stalls: 0, errors: 0,
    firstSideWins: 0, secondSideWins: 0,
    reasons: {},
    turnsAll: [], stepsAll: [],
    maxHandAll: [], deckEmptyAll: [],
    errorDetails: [],
  };
  for (let g = 0; g < games; g++) {
    const seed = seedBase + g * 7 + 1;
    // 交替先后手：g 偶数 A 先手，奇数 B 先手
    const aFirst = g % 2 === 0;
    const r = aFirst
      ? playGame({ color0: colorA, color1: colorB, lvl0: level, lvl1: level, seed })
      : playGame({ color0: colorB, color1: colorA, lvl0: level, lvl1: level, seed });
    if (r.error) { agg.errors++; agg.errorDetails.push({ seed, g, error: r.error }); }
    if (r.stalled) { agg.stalls++; agg.draws++; continue; }
    if (r.winner === 0) agg.firstSideWins++; else agg.secondSideWins++;
    if (colorA === colorB) {
      // 镜像局同色，winsA/B 改记先手/后手胜负（理论应 ≈50/50）
      if (r.winner === 0) agg.winsA++; else agg.winsB++;
    } else {
      const winnerColor = r.winner === 0 ? (aFirst ? colorA : colorB) : (aFirst ? colorB : colorA);
      if (winnerColor === colorA) agg.winsA++; else agg.winsB++;
    }
    agg.reasons[r.reason] = (agg.reasons[r.reason] || 0) + 1;
    agg.turnsAll.push(r.turns);
    agg.stepsAll.push(r.steps);
    agg.maxHandAll.push(r.maxHand || 0);
    agg.deckEmptyAll.push(r.deckEmptyTurns || 0);
  }
  const finished = agg.winsA + agg.winsB;
  const turnsSorted = [...agg.turnsAll].sort((x, y) => x - y);
  const stepsSorted = [...agg.stepsAll].sort((x, y) => x - y);
  agg.turnsAvg = finished ? +(agg.turnsAll.reduce((n, t) => n + t, 0) / finished).toFixed(1) : null;
  agg.turnsMin = turnsSorted.length ? turnsSorted[0] : null;
  agg.turnsMax = turnsSorted.length ? turnsSorted[turnsSorted.length - 1] : null;
  agg.maxHandPeak = agg.maxHandAll.length ? Math.max(...agg.maxHandAll) : null;       // 手牌峰值（满手牌压力观测）
  agg.deckEmptyGames = agg.deckEmptyAll.filter((n) => n > 0).length;                   // 出现过空牌库的对局数
  agg.steps = {
    avg: stepsSorted.length ? Math.round(stepsSorted.reduce((n, x) => n + x, 0) / stepsSorted.length) : null,
    p50: quantile(stepsSorted, 0.5),
    p90: quantile(stepsSorted, 0.9),
    max: stepsSorted.length ? stepsSorted[stepsSorted.length - 1] : null,
  };
  agg.winRateA = finished ? +(agg.winsA / finished * 100).toFixed(1) : null; // 平局不计入分母
  return agg;
}

// ---- 跑批（带后段实测吞吐报告）----
async function runMatrix(level, games, tag) {
  const pairs = [];
  for (let i = 0; i < COLORS.length; i++) {
    for (let j = i; j < COLORS.length; j++) pairs.push([COLORS[i], COLORS[j]]);
  }
  const results = [];
  const t0 = Date.now();
  let done = 0;
  for (const [a, b] of pairs) {
    const r = runMatchup(a, b, level, games, tag);
    results.push(r);
    done++;
    const el = (Date.now() - t0) / 1000;
    console.log(
      `  [${String(done).padStart(2)}/${pairs.length}] ${COLOR_CN[a]}v${COLOR_CN[b]} ${level} ×${games}`
      + ` → ${COLOR_CN[a]}胜率 ${r.winRateA === null ? '-' : r.winRateA + '%'}`
      + ` (${r.winsA}-${r.winsB}${r.draws ? ` 平${r.draws}` : ''})`
      + ` 平均${r.turnsAvg ?? '-'}回合`
      + (r.stalls || r.errors ? ` ⚠stall${r.stalls} err${r.errors}` : '')
      + ` [${el.toFixed(0)}s]`,
    );
  }
  const totalSec = (Date.now() - t0) / 1000;
  return { results, totalSec, gamesPerSec: (pairs.length * games) / totalSec };
}

// ---- 报告 ----
function mdTable(matrixRows) {
  const head = '| 对阵 | 胜率(A) | 战绩 A-B-平 | 平均回合(min~max) | 动作 p50/p90/max | 终局方式 | 压力观测 |';
  const sep = '|---|---|---|---|---|---|---|---|';
  return [head, sep, ...matrixRows].join('\n');
}

function matchupRow(r) {
  const reasons = Object.entries(r.reasons).map(([k, v]) => `${k === 'leader' ? '击破' : k === 'deckout' ? '牌库空' : k}×${v}`).join(' ') || '-';
  const anom = [];
  if (r.stalls) anom.push(`卡死${r.stalls}`);
  if (r.errors) anom.push(`异常${r.errors}`);
  return `| ${COLOR_CN[r.a]} vs ${COLOR_CN[r.b]}${r.a === r.b ? '（镜像=先手胜率）' : ''} | ${r.winRateA === null ? '-' : r.winRateA + '%'} `
    + `| ${r.winsA}-${r.winsB}-${r.draws} | ${r.turnsAvg ?? '-'} (${r.turnsMin ?? '-'}~${r.turnsMax ?? '-'}) `
    + `| ${r.steps.p50 ?? '-'}/${r.steps.p90 ?? '-'}/${r.steps.max ?? '-'} `
    + `| ${reasons} | 手牌峰${r.maxHandPeak ?? '-'} 空库局${r.deckEmptyGames ?? '-'} ${anom.join(' ') || '无'} |`;
}

// 胜率矩阵：cell(i,j) = i 色对 j 色胜率（%），对角线为镜像局先手/后手合计口径
function winMatrix(results) {
  const m = new Map();
  for (const r of results) {
    m.set(`${r.a}|${r.b}`, r.winRateA);
    if (r.a !== r.b) m.set(`${r.b}|${r.a}`, r.winRateA === null ? null : +(100 - r.winRateA).toFixed(1));
  }
  const lines = ['| 攻\\守 | ' + COLORS.map((c) => COLOR_CN[c]).join(' | ') + ' | 平均 |',
    '|---|' + COLORS.map(() => '---').join('|') + '|---|'];
  for (const ci of COLORS) {
    let sum = 0, n = 0;
    const cells = COLORS.map((cj) => {
      const v = m.get(`${ci}|${cj}`);
      if (v === null || v === undefined) return '-';
      if (ci !== cj) { sum += v; n++; } // 对角线是镜像局先手胜率，不计入行平均
      return v;
    });
    lines.push(`| ${COLOR_CN[ci]} | ` + cells.join(' | ') + ` | ${n ? (sum / n).toFixed(1) : '-'} |`);
  }
  return lines.join('\n');
}

function loadBaseline() {
  if (!BASELINE) return null;
  try {
    const j = JSON.parse(readFileSync(resolve(ROOT, BASELINE), 'utf8'));
    return j.matrix || null;
  } catch (e) {
    console.warn(`⚠ baseline 读取失败(${e.message})，跳过对比`);
    return null;
  }
}

// ---- 主流程 ----
mkdirSync(join(ROOT, 'docs'), { recursive: true });
console.log(`平衡模拟：15 个非镜像 matchup + 6 镜像 = 21 组 × ${GAMES} 局 normal vs normal；同规模 × ${HARD_GAMES} 局 hard vs hard 抽样（卡死线 ${STALL_ACTIONS} 动作）`);
const t0 = Date.now();

console.log('\n== 主矩阵 normal vs normal ==');
const main = await runMatrix('normal', GAMES, `normal-v1-g${GAMES}`);
console.log(`  吞吐 ${main.gamesPerSec.toFixed(1)} 局/s，共 ${main.totalSec.toFixed(0)}s（后段实测，全量已实际跑完无需外推）`);

console.log(`\n== 抽样 hard vs hard（每 matchup ${HARD_GAMES} 局）==`);
const hard = await runMatrix('hard', HARD_GAMES, `hard-v1-g${HARD_GAMES}`);
console.log(`  吞吐 ${hard.gamesPerSec.toFixed(1)} 局/s，共 ${hard.totalSec.toFixed(0)}s`);

const totalMin = ((Date.now() - t0) / 60000).toFixed(1);
const out = {
  meta: {
    generatedAt: new Date().toISOString(),
    games: GAMES, hardGames: HARD_GAMES, stallThreshold: STALL_ACTIONS,
    totalMinutes: +totalMin,
    note: 'dev-only 平衡工具；AI 同档对垒、交替先后手；平局（卡死/异常）不计入胜率分母',
  },
  matrix: main.results,
  hardSample: hard.results,
};
const jsonPath = join(ROOT, 'docs', 'balance-report.json');
writeFileSync(jsonPath, JSON.stringify(out, null, 2), 'utf8');

// ---- markdown ----
const baseline = loadBaseline();
const md = [];
md.push('# OP-TCG Battle 平衡模拟报告');
md.push('');
md.push(`> 生成：${out.meta.generatedAt} · \`node scripts/balance-sim.js\` · 样本 ${GAMES} 局/matchup（normal）+ ${HARD_GAMES} 局/matchup（hard） · 卡死线 ${STALL_ACTIONS} 动作/局 · 总耗时 ${totalMin} min`);
md.push('');
md.push('口径：AI 同档对垒；每 matchup 内双方交替先后手；胜率分母不含平局（卡死/异常局）；镜像局胜率=先手方胜率，理论应 ≈50%。');
md.push('');
md.push('## 胜率矩阵（行色 对 列色，%）');
md.push('');
md.push(winMatrix(main.results));
md.push('');
md.push('## 明细：normal vs normal');
md.push('');
md.push(mdTable(main.results.map(matchupRow)));
md.push('');
md.push('## 抽样：hard vs hard');
md.push('');
md.push(`> 注：hard 抽样每 matchup 仅 ${HARD_GAMES} 局（95% 置信区间约 ±35pp），看趋势不看单点；镜像行 = 先手胜率。`);
md.push('');
md.push(mdTable(hard.results.map(matchupRow)));
md.push('');
if (baseline) {
  const bm = new Map();
  for (const r of baseline) {
    bm.set(`${r.a}|${r.b}`, r.winRateA);
    if (r.a !== r.b) bm.set(`${r.b}|${r.a}`, r.winRateA === null ? null : +(100 - r.winRateA).toFixed(1));
  }
  md.push('## 调池前后对比（行=调前 → 调后，%）');
  md.push('');
  md.push('| 对阵 | 调前 | 调后 | Δ |');
  md.push('|---|---|---|---|');
  for (const r of main.results) {
    const key = `${r.a}|${r.b}`;
    const before = bm.get(key);
    if (before === undefined || before === null || r.winRateA === null) continue;
    md.push(`| ${COLOR_CN[r.a]} vs ${COLOR_CN[r.b]} | ${before} | ${r.winRateA} | ${r.winRateA >= before ? '+' : ''}${(r.winRateA - before).toFixed(1)} |`);
  }
  md.push('');
}
const anomalyTotal = main.results.reduce((n, r) => n + r.stalls + r.errors, 0)
  + hard.results.reduce((n, r) => n + r.stalls + r.errors, 0);
md.push(anomalyTotal
  ? `## ⚠ 异常汇总（共 ${anomalyTotal}）\n\n${[...main.results, ...hard.results].filter((r) => r.stalls || r.errors).map((r) => `- ${COLOR_CN[r.a]}v${COLOR_CN[r.b]}(${r.level}): stall×${r.stalls} error×${r.errors}${r.errorDetails.length ? ' — ' + r.errorDetails.map((e) => `seed${e.seed}:${e.error}`).join('; ') : ''}`).join('\n')}`
  : '## 异常：无（0 卡死 / 0 异常）');
md.push('');
const mdPath = join(ROOT, 'docs', 'balance-report.md');
writeFileSync(mdPath, md.join('\n') + '\n', 'utf8');

// 控制台速览：超界 matchup
const outOfBand = main.results.filter((r) => r.winRateA !== null && (r.winRateA < 30 || r.winRateA > 70) && r.a !== r.b);
console.log(`\n产出：${mdPath}\n      ${jsonPath}`);
console.log(outOfBand.length
  ? `⚠ 超出 30%-70% 目标区间的 matchup：${outOfBand.map((r) => `${COLOR_CN[r.a]}v${COLOR_CN[r.b]}=${r.winRateA}%`).join(' ')}`
  : '✓ 全部非镜像 matchup 胜率在 30%-70% 区间内');
