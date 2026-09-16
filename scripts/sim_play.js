// 模拟认真玩家通关验证：我方 red-hard（路飞+红色默认卡组） vs 随机非红色 easy（新手水手）
// 加载方式与 server/server.js 一致：动态 import web/app.bundle.js → globalThis.OPTCG
// 产出：
//   1) 一局详细战报 → F:/claudecode/output/optcg-battle/sim-battle-log.txt
//   2) 30 局 red-hard vs 随机色-easy 批量统计（stdout）
//   3) 10 局 red-hard vs 随机色-normal 对比统计（stdout）
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { writeFileSync, mkdirSync } from 'node:fs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = 'F:/claudecode/output/optcg-battle';
const OUT_LOG = join(OUT_DIR, 'sim-battle-log.txt');

await import(pathToFileURL(join(ROOT, 'web', 'app.bundle.js')).href); // → globalThis.OPTCG
const O = globalThis.OPTCG;

const MAX_TURNS = 300;    // 单局回合上限（防死循环，任务要求）
const MAX_STEPS = 50000;  // 动作数兜底（正常局 < 1000 步）

const COLOR_CN = { red: '红', blue: '蓝', green: '绿', yellow: '黄', purple: '紫', black: '黑' };
const NON_RED = ['blue', 'green', 'yellow', 'purple', 'black'];

// ===== web/game.js deckOf 同款：该色全部卡各 4 张凑 50 =====
function deckOf(color) {
  const cs = O.POOL.cards.filter((c) => c.color === color);
  const deck = [];
  for (const c of cs) for (let i = 0; i < 4; i++) deck.push(c);
  return deck.slice(0, 50);
}

// ===== 单局驱动：双方 AI 轮流决策（含 pending 响应窗口），结构同 tests/ai.test.js aiGame =====
function playGame({ lvlA = 'hard', lvlB = 'easy', colorB = 'blue', seed = 1, onStep = null }) {
  const leaderA = O.POOL.leaders.find((l) => l.color === 'red');
  const leaderB = O.POOL.leaders.find((l) => l.color === colorB);
  const s = O.newGame({ leaderA, deckA: deckOf('red'), leaderB, deckB: deckOf(colorB), seed });
  const ai0 = O.createAI(lvlA, O.makeRng(seed * 2 + 1));
  const ai1 = O.createAI(lvlB, O.makeRng(seed * 2 + 2));
  let steps = 0;
  let minLifeA = s.players[0].life.length;   // 我方最低生命（逆转检测）
  let minLifeB = s.players[1].life.length;
  while (s.winner === null && s.turn <= MAX_TURNS && steps < MAX_STEPS) {
    const acts = O.listActions(s);
    if (!acts.length) throw new Error(`no legal actions at step ${steps}`);
    const ai = s.pending ? (s.pending.target.side === 0 ? ai0 : ai1) : (s.active === 0 ? ai0 : ai1);
    const before = s.log.length;
    // 动作前快照：单位 id/战力 + 船长战力（战报里攻击/阻挡引用按此解析，动作后 board 可能已位移）
    const pre = [0, 1].map((side) => ({
      leader: O.leaderPower(s.players[side]),
      units: s.players[side].board.map((u) => ({ id: u.id, power: O.powerOfUnit(u) })),
    }));
    const a = ai.choose(s, acts);
    if (!a) throw new Error(`AI returned no action at step ${steps}`);
    O.applyAction(s, a);
    steps++;
    minLifeA = Math.min(minLifeA, s.players[0].life.length);
    minLifeB = Math.min(minLifeB, s.players[1].life.length);
    if (onStep) onStep(s, s.log.slice(before), pre, a);
  }
  return {
    state: s, winner: s.winner, reason: s.winReason, turns: s.turn, steps,
    capped: s.winner === null, minLifeA, minLifeB,
  };
}

// ===== 详细战报渲染 =====
function fmtDetailed(colorB, lvlB) {
  const lines = [];
  const name = (id) => { const c = O.POOL.cards.find((x) => x.id === id); return c ? `${id}·${c.name}` : id; };
  const sideTag = (side) => (side === 0 ? '我方' : '对手');
  let lastTurn = 0;
  // 单位引用带板位#idx：同名多副本可区分
  const unitRef = (pre, side, idx) => {
    const u = pre[side].units[idx];
    return u ? `${name(u.id)}#${idx}(${u.power})` : `#${idx}(?)`;
  };
  return {
    lines,
    onStep(s, evs, pre) {
      if (s.turn !== lastTurn) {
        lastTurn = s.turn;
        const [a, b] = s.players;
        lines.push('');
        lines.push(`━━━━━━ 回合 ${s.turn} ━━━━━━ 我方[生命${a.life.length} 场${a.board.length} DON${a.donArea.length}] 对手[生命${b.life.length} 场${b.board.length} DON${b.donArea.length}]`);
      }
      for (const e of evs) {
        switch (e.t) {
          case 'refresh': break;
          case 'draw': lines.push(`  ${sideTag(e.side)} 抽牌 ${name(e.cardId)}`); break;
          case 'donGain': lines.push(`  ${sideTag(e.side)} DON!! +${e.n}`); break;
          case 'summon': {
            const hi = e.cost >= 5 ? ' ★高费' : '';
            lines.push(`  ${sideTag(e.side)} 登场 ${name(e.cardId)}（费用${e.cost}）${hi}`);
            break;
          }
          case 'event': lines.push(`  ${sideTag(e.side)} 事件 ${name(e.cardId)}（费用${e.cost}）`); break;
          case 'stage': lines.push(`  ${sideTag(e.side)} 舞台 ${name(e.cardId)}（费用${e.cost}）`); break;
          case 'donAttach': {
            // 附着后战力（本动作内 board 构成不变，可安全解析）
            const pl = s.players[e.side];
            const tg = e.to.type === 'leader'
              ? `船长(${O.leaderPower(pl)})`
              : `${unitRef(pre, e.side, e.to.idx)}`;
            lines.push(`  · ${sideTag(e.side)} 附着 ${e.count} DON → ${tg}`);
            break;
          }
          case 'donTake': {
            const pl = s.players[e.side];
            const tg = e.from.type === 'leader'
              ? '船长'
              : (pre[e.side].units[e.from.idx] ? name(pre[e.side].units[e.from.idx].id) + '#' + e.from.idx : '#' + e.from.idx);
            lines.push(`  · ${sideTag(e.side)} 收回 ${e.count} DON ← ${tg}`);
            break;
          }
          case 'attack': {
            const atkName = e.attacker.type === 'leader'
              ? `${sideTag(e.attacker.side)}船长(${pre[e.attacker.side].leader})`
              : `${sideTag(e.attacker.side)} ${unitRef(pre, e.attacker.side, e.attacker.idx)}`;
            const tg = (e.target === 'leader' || e.target.type === 'leader')
              ? `${sideTag(1 - e.attacker.side)}船长(${pre[1 - e.attacker.side].leader})！`
              : `横置角色 ${unitRef(pre, e.target.side, e.target.idx)}`;
            lines.push(`  ⚔ ${atkName} 攻击 → ${tg}`);
            break;
          }
          case 'window': break;
          case 'block': lines.push(`  🛡 ${sideTag(e.side)} 阻挡：${unitRef(pre, e.side, e.idx)} 顶包`); break;
          case 'counter': {
            // 引擎事件为增量语义：cards/boost=本次打出；totalCards/totalBoost=本次战斗累计
            lines.push(`  ⚡ ${sideTag(e.side)} 反击：弃 ${e.cards.map(name).join('、')}（本次 +${e.boost}，累计 +${e.totalBoost}）`);
            break;
          }
          case 'clash': break; // 结果由 ko/noDamage/life 呈现
          case 'ko': lines.push(`  ✝ KO！${sideTag(e.side)} ${name(e.cardId)} 进垃圾场${e.by ? `（由 ${name(e.by)} 效果击倒）` : ''}`); break;
          case 'noDamage': lines.push(`  · 攻击未破防（战力不足）`); break;
          case 'life': {
            const dst = e.banish ? '直接进垃圾场（banish）' : '加入手牌';
            lines.push(`  💥 ${sideTag(e.side)} 被打掉生命：${name(e.cardId)} → ${dst}（剩 ${s.players[e.side].life.length}）`);
            break;
          }
          case 'effectDraw': lines.push(`  · 效果抽牌 ${sideTag(e.side)} +${e.n}（${name(e.src)}）`); break;
          case 'effectBuff': lines.push(`  · 效果增益 ${sideTag(e.side)} +${e.x}（${name(e.src)}）`); break;
          case 'effectDon': lines.push(`  · 效果 DON ${sideTag(e.side)} +${e.n}（${name(e.src)}）`); break;
          case 'rest': lines.push(`  · 效果横置 ${sideTag(e.side)} ${pre[e.side].units[e.idx] ? name(pre[e.side].units[e.idx].id) + '#' + e.idx : '#' + e.idx}（${name(e.src)}）`); break;
          case 'endTurn': {
            const [a, b] = s.players;
            lines.push(`  —— ${sideTag(e.side)} 回合结束 | 生命 我方${a.life.length}/对手${b.life.length} 场上 我方${a.board.length}/对手${b.board.length}`);
            break;
          }
          case 'win': lines.push(`  🏆 终局：${e.winner === 0 ? '我方' : '对手'}获胜（${e.reason === 'leader' ? '击破船长' : '牌库耗尽'}）`); break;
          default: lines.push(`  ? 未识别事件 ${e.t}: ${JSON.stringify(e)}`);
        }
      }
    },
  };
}

// ===== 批量 =====
// 对手色随机：FNV-1a(seed) 混合——mulberry32 对连续 seed 的首输出有相关性，直接用会偏色
function pickFoeColor(seed) {
  let h = 0x811c9dc5;
  for (const b of String(seed)) { h ^= b.charCodeAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
  return NON_RED[h % NON_RED.length];
}
function batch(n, lvlB, seedBase, tag) {
  const rows = [];
  let w = 0, l = 0, d = 0, capErr = 0;
  let sumTurns = 0, finished = 0, maxTurns = 0, longest = null;
  const reasons = {};
  const colorCnt = {};
  let comeback = 0; // 我方生命曾到 0 仍获胜
  for (let i = 0; i < n; i++) {
    const seed = seedBase + i;
    const colorB = pickFoeColor(seed);
    const r = playGame({ lvlB, colorB, seed });
    if (r.winner === 0) { w++; if (r.minLifeA === 0) comeback++; }
    else if (r.winner === 1) l++;
    else { d++; if (r.steps >= MAX_STEPS) capErr++; }
    if (!r.capped) { sumTurns += r.turns; finished++; }
    if (r.turns > maxTurns) { maxTurns = r.turns; }
    if (r.reason) reasons[r.reason] = (reasons[r.reason] || 0) + 1;
    colorCnt[colorB] = (colorCnt[colorB] || 0) + 1;
    rows.push({ seed, colorB, winner: r.winner, turns: r.turns, steps: r.steps, minLifeA: r.minLifeA, minLifeB: r.minLifeB, capped: r.capped, reason: r.reason });
  }
  console.log(`\n[${tag}] red-hard vs 随机非红-${lvlB} × ${n} 局（对手色分布 ${Object.entries(colorCnt).map(([c, k]) => COLOR_CN[c] + k).join(' ')}）`);
  console.log('  seed  对手色  结果  回合  我方最低生命  对手最低生命  终局原因');
  for (const r of rows) {
    const res = r.capped ? 'DRAW' : (r.winner === 0 ? 'WIN ' : 'LOSE');
    console.log(`  ${String(r.seed).padEnd(5)} ${COLOR_CN[r.colorB].padEnd(4)}   ${res}  ${String(r.turns).padEnd(4)} ${String(r.minLifeA).padEnd(10)}    ${String(r.minLifeB).padEnd(10)}    ${r.reason || '-'}`);
  }
  const longestRow = rows.reduce((a, b) => (b.turns > a.turns ? b : a));
  const avgSteps = (rows.reduce((n, r) => n + r.steps, 0) / n).toFixed(0);
  const maxSteps = rows.reduce((m, r) => Math.max(m, r.steps), 0);
  console.log(`  —— 胜${w} / 负${l} / 平${d}（胜率 ${(w / n * 100).toFixed(1)}%）；平均回合 ${finished ? (sumTurns / finished).toFixed(1) : '-'}；最长局 ${maxTurns} 回合(seed=${longestRow.seed},${COLOR_CN[longestRow.colorB]})；平均动作 ${avgSteps}/局·最多 ${maxSteps}；终局原因 ${JSON.stringify(reasons)}；我方0生命逆转胜 ${comeback} 局${capErr ? `；⚠动作数爆表 ${capErr} 局` : ''}`);
  return { w, l, d, rows, comeback };
}

// ===== 主流程 =====
mkdirSync(OUT_DIR, { recursive: true });
const t0 = Date.now();

// 1) 批量 30 局 vs easy（先跑，顺便挑一局有逆转的做详细战报）
const easy = batch(30, 'easy', 100, 'BATCH-EASY');
// 详细局挑选：优先 我方0生命逆转胜；否则我方最低生命最小者；同分取回合数最多
const pick = easy.rows
  .filter((r) => r.winner === 0)
  .sort((x, y) => (y.minLifeA === 0) - (x.minLifeA === 0) || x.minLifeA - y.minLifeA || y.turns - x.turns)[0];
const pickRow = pick || easy.rows[0];

// 2) 详细战报（同 seed 同参数完全确定性重放）
const fmt = fmtDetailed(pickRow.colorB, 'easy');
const det = playGame({ lvlB: 'easy', colorB: pickRow.colorB, seed: pickRow.seed, onStep: fmt.onStep });
const header = [
  'OPTCG-Battle 模拟对局详细战报（scripts/sim_play.js 生成，seed=' + pickRow.seed + '）',
  `我方：LEADER-RED 蒙奇·D·路飞（红，power 5000 / life 5）+ 红色默认卡组（web/game.js deckOf），AI=hard（风暴领主）`,
  `对手：${COLOR_CN[pickRow.colorB]}色 AI=easy（新手水手）`,
  `终局：${det.capped ? '未分胜负（触顶）' : (det.winner === 0 ? '我方胜' : '对手胜')}（${det.reason || '-'}），历时 ${det.turns} 回合 / ${det.steps} 个动作；我方最低生命 ${det.minLifeA}，对手最低生命 ${det.minLifeB}`,
  '='.repeat(72),
];
writeFileSync(OUT_LOG, [...header, ...fmt.lines, ''].join('\n'), 'utf8');
console.log(`\n详细战报已写入 ${OUT_LOG}（seed=${pickRow.seed} 对手=${COLOR_CN[pickRow.colorB]}，${det.turns} 回合，我方${det.winner === 0 ? '胜' : det.winner === 1 ? '负' : '平'}）`);

// 3) 10 局 vs normal 对比
const normal = batch(10, 'normal', 700, 'BATCH-NORMAL');

console.log(`\n总耗时 ${((Date.now() - t0) / 1000).toFixed(1)}s`);
