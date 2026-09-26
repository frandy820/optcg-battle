// 伟大航路决斗 — 决斗桌 UI（Phase 2）
// 与 AI 共用 duel/engine.js 同一 applyAction 入口；非法操作提示原因（规则 §四/§七.5）。
'use strict';
import { DUEL } from './duel/engine.js?v=23f3fe8';
import { DUEL_AI } from './duel/ai.js?v=23f3fe8';
import DUEL_CARDS_DATA from './data/duel-cards.js?v=23f3fe8';
import POOL_DATA from './data/duel-pool.js?v=23f3fe8'; // round6 R6-D：GLD 转译卡池（阵营对战牌组/全卡池工坊）
import { TUTORIALS, newTutorialGame, tutorialAiStep } from './tutorial.js?v=23f3fe8';
import { FXM } from './fx-manager.js?v=23f3fe8'; // 演出快进终态管理器（round5 C1：任意点击=当前演出跳终态）
import { SND } from './gld-audio.js?v=23f3fe8'; // 八音合成（round5 C7：默认静音 gld_sound 独立键，与动效开关零联动）

const cardsById = {};
for (const c of DUEL_CARDS_DATA.cards) cardsById[c.id] = c;
for (const c of POOL_DATA.cards) cardsById[c.id] = c; // 合并池（GLD 与 DUE 编号不冲突）

const $ = id => document.getElementById(id);
const els = {
  turnChip: $('turnChip'), phaseBar: $('phaseBar'), hint: $('hint'),
  foeName: $('foeName'), foeLpBar: $('foeLpBar'), foeLpNum: $('foeLpNum'),
  foeDeckN: $('foeDeckN'), foeHandN: $('foeHandN'), foeGraveN: $('foeGraveN'),
  foeHand: $('foeHand'), foeBoard: $('foeBoard'),
  myName: $('myName'), myLpBar: $('myLpBar'), myLpNum: $('myLpNum'),
  myDeckN: $('myDeckN'), myGraveN: $('myGraveN'), myBoard: $('myBoard'), myHand: $('myHand'),
  foeSpells: $('foeSpells'), mySpells: $('mySpells'),
  rb: $('respondBanner'), rbText: $('rbText'), rbBtns: $('rbBtns'),
  ldBody: $('ldBody'), logDrawer: $('logDrawer'), ticker: $('ticker'), btnMenu: $('btnMenu'),
  btnNext: $('btnNext'), btnRestart: $('btnRestart'), btnHelp: $('btnHelp'),
  modal: $('modal'), modalBox: $('modalBox'), toast: $('toast'),
  btnDirect: $('btnDirect'), endOverlay: $('endOverlay'), endTitle: $('endTitle'), endSub: $('endSub'), btnAgain: $('btnAgain'),
};

const PH_CN = { draw: '抽牌', standby: '准备', main1: '主要阶段1', battle: '战斗阶段', main2: '主要阶段2', end: '结束阶段' };
const PH_SHORT = { draw: '抽牌', standby: '准备', main1: '出牌', battle: '战斗', main2: '出牌', end: '结束' };
const AI_DELAY = 620;
// round5 C8：E2E 模式（?e2e=1）——会话级强制 reduce-fx（不碰用户 gld_reduce_fx 键）、
// AI 步进恒基线（演出感知间隔在虚拟时钟下无意义且引入不确定性）、?seed=N 确定性开局。
const E2E = /[?&]e2e=1/.test(location.search);

let g = null;
let sel = null;          // 当前选中攻击者 uid（战斗阶段）
let logShown = 0;
let aiTimer = null;
let busy = false;        // 动画/AI 播放中锁输入（与"等待响应"视觉区分，规则 §七.5）
let pendingCampaign = null; // 闯关配置（campaign 页写入 localStorage，本局生效）
let resuming = false;    // 恢复存档流程中（跳过自动保存，防恢复瞬间回写）
let tut = null;          // 当前教学段定义（g.tutorial=id 时有效）
let tutStep = 0;         // 教学步指针
let tutFlags = {};       // 教学观察标志（directDone/turnPassed/responded/attackResolved）

// ---------- 对局中存档（Phase 5；key 与旧 DEMO optcg_save_v2/optcg_match_v2 天然隔离） ----------
const LIVE_KEY = 'gld_live_game';
function saveLive() {
  if (!g || g.winner !== null || resuming || g.tutorial) return; // 教学局=演练，不落档
  try {
    // g 为纯数据（rng 函数被 JSON.stringify 自然丢弃；对局中无 rng 调用——洗牌仅在建局）
    localStorage.setItem(LIVE_KEY, JSON.stringify({ v: 1, savedAt: Date.now(), pendingCampaign, g }));
  } catch (e) { /* 存储满等异常不阻断对局 */ }
}
function clearLive() { localStorage.removeItem(LIVE_KEY); }
function readLive() {
  try {
    const s = JSON.parse(localStorage.getItem(LIVE_KEY));
    if (s && s.v === 1 && s.g && s.g.players && s.g.players.length === 2) return s;
  } catch (e) { /* 损坏走安全路径 */ }
  if (localStorage.getItem(LIVE_KEY)) { // 损坏/版本不符：清理并提示，不白屏
    clearLive();
    return { corrupt: true };
  }
  return null;
}
// 恢复：补 rng 引用与初始派生状态；失败返回 null（调用方走新局）
function restoreLive(saved) {
  try {
    const gg = saved.g;
    gg.rng = DUEL.mkRng(gg.seed || 1); // 对局中不再调用（洗牌仅建局），仅防未来引用
    g = gg;
    pendingCampaign = saved.pendingCampaign || null;
    sel = null; logShown = 0; busy = false;
    endShown = false;
    turnKeyShown = gg.turn + '|' + gg.active; // 恢复对局不弹回合横幅
    els.ldBody.innerHTML = ''; els.ticker.textContent = '';
    els.endOverlay.classList.add('hidden');
    els.modal.classList.add('hidden');
    pushLog(`— 已恢复对局（第 ${gg.turn} 回合 ${PH_CN[gg.phase] || ''}）—`);
    render();
    return true;
  } catch (e) { clearLive(); return false; }
}

// ---------- 建局 ----------
function start() {
  stopAi();
  tut = null; tutEnded = false; // 退出教学态（横幅在 renderTutBanner 自动移除）
  endShown = false;
  clearLive(); // 新局作废旧存档
  // 闯关模式：读取一次性对局配置（campaign.html「开战」写入）
  try { pendingCampaign = JSON.parse(localStorage.getItem('gld_duel_pending')); } catch (e) { pendingCampaign = null; }
  let decks, names, aiProfile = 'aggro', intro;
  if (pendingCampaign && pendingCampaign.foeDeck) {
    localStorage.removeItem('gld_duel_pending'); // 一次性消费；「再战一局」回快速对决
    decks = [pendingCampaign.myDeck, pendingCampaign.foeDeck];
    names = ['玩家', `${pendingCampaign.foeName}（AI）`];
    aiProfile = pendingCampaign.aiProfile || 'aggro';
    intro = pendingCampaign.mode === 'vs'
      ? `【阵营对战】你的牌组 VS ${pendingCampaign.foeName}（${{ aggro: '凶猛', control: '老练', boss: '残暴' }[aiProfile] || '标准'} AI）`
      : `【东海篇·第 ${pendingCampaign.stageId} 关「${pendingCampaign.stageName}」】对手：${pendingCampaign.foeName}`;
  } else {
    pendingCampaign = null;
    decks = [DUEL_CARDS_DATA.decks.strawhat_default.cards, DUEL_CARDS_DATA.decks.eastblue_aggro.cards];
    names = ['玩家', '亚尔丽塔（AI）'];
    intro = '【快速对决】想闯关请点顶部「闯关模式」。';
  }
  const seed = E2E && (location.search.match(/[?&]seed=(\d+)/) || [])[1]
    ? +location.search.match(/[?&]seed=(\d+)/)[1] // 仅 E2E 模式读 ?seed（确定性开局）
    : (Date.now() ^ (Math.random() * 1e9)) >>> 0;
  g = DUEL.newGame(cardsById, {
    seed, decks, names, aiProfile,
  });
  sel = null; logShown = 0; busy = false;
  els.ldBody.innerHTML = ''; els.ticker.textContent = '';
  els.endOverlay.classList.add('hidden');
  els.modal.classList.add('hidden');
  els.rb.classList.add('hidden');
  pushLog(intro);
  pushLog('提示：先手第一回合不抽牌；招式/伏笔卡可在主要阶段点击使用。');
  // 开局：先手玩家的抽牌阶段无动作 → 快速推进到 main1
  DUEL.applyAction(g, cardsById, 0, { t: 'nextPhase' }); // draw → standby（先手不抽）
  DUEL.applyAction(g, cardsById, 0, { t: 'nextPhase' }); // standby → main1
  render();
}

// ---------- 新手教学（Phase 5；?tutorial=1|2|3 进入） ----------
function startTutorial(id) {
  stopAi();
  clearLive();
  endShown = false;
  pendingCampaign = null;
  const made = newTutorialGame(cardsById, id);
  g = made.g; tut = made.tut;
  tutStep = 0; tutFlags = {}; tutEnded = false;
  sel = null; logShown = 0; busy = false;
  els.ldBody.innerHTML = ''; els.ticker.textContent = '';
  els.endOverlay.classList.add('hidden');
  els.modal.classList.add('hidden');
  els.rb.classList.add('hidden');
  pushLog(`【教学 ${id} · ${tut.name}】${tut.intro}`);
  DUEL.applyAction(g, cardsById, 0, { t: 'nextPhase' }); // draw → standby
  DUEL.applyAction(g, cardsById, 0, { t: 'nextPhase' }); // standby → main1
  render();
}
// 动作观察器：包装 applyAction，成功后更新教学标志（供 steps[].check 的第二参数）
function tutObserve(a) {
  if (!g.tutorial) return;
  if (a.t === 'attack' && a.target === null) tutFlags.directDone = true;
  if (a.t === 'attack') tutFlags.attacked = true;
  if (a.t === 'respond') tutFlags.responded = true;
  if (a.t === 'endTurn') tutFlags.turnPassed = true;
}
// 每步结算完成检查（attackResolved：战斗日志出现「攻击」且不在窗口中）
function tutAttackResolved() {
  if (!g || !g.tutorial) return false;
  if (g.pending) return false;
  return tutFlags.attacked && !g.log.slice(-3).some(l => l.msg.includes('响应窗口'));
}
// 统一动作入口包装：成功后喂给教学观察器 + 捕捉登场/攻击/LP变化/卡牌发动驱动战斗动效
let fxAttack = null, fxSummon = null, fxCast = null;
let fxAtkPend = null; // 攻击宣言快照（响应窗口场景下结算在关闭窗口的 act，时基重置用，C7）
let fxLpQueue = []; // LP 伤害逐笔队列（round5 C5：多笔连跳各自步进+归因）
let fxDissolveQ = []; // 离场溶解队列（round5 C6）
function act(pi, a) {
  const lp0 = [g.players[0].lp, g.players[1].lp];
  const logLen0 = g.log.length;
  const board0 = g.players[pi].board.map(u => u.uid);
  const pend0 = g.pending && g.pending.kind === 'attack' ? g.pending : null; // 攻击窗口关闭=战斗此刻结算（C7）
  // C6：离场溶解快照——applyAction 前全场单位位置/卡面。战斗破坏常发生在「关闭响应窗口的 act」
  // （pass/respond），宣言时判定 destroyed 会漏；统一改「快照后离板→溶解」。仅玩家侧动作结算
  // 才溶解（AI 普攻短链无溶解，M1）；攻方自身阵亡走 ghost 残影，消费时剔除
  const leave0 = [];
  for (const p of g.players) for (const u of p.board) {
    const el = document.querySelector(`[data-uid="${u.uid}"]`);
    if (el) leave0.push({ uid: u.uid, rect: el.getBoundingClientRect(), art: (cardsById[u.cardId] || {}).art || null });
  }
  // 发动卡快照（applyAction 前取——发动后卡即离场进连锁/墓场）
  let castD = null;
  if (a.t === 'respond' || a.t === 'activateSpell' || a.t === 'activateMove') {
    const pool = a.t === 'activateMove' ? g.players[pi].hand : g.players[pi].spells;
    const key = a.t === 'activateMove' ? a.handUid : a.spellUid;
    const row = pool.find(x => x.uid === key);
    if (row) { const cd = cardsById[row.cardId]; if (cd && (cd.type === 'trap' || cd.type === 'move')) castD = cd; }
  }
  const r = DUEL.applyAction(g, cardsById, pi, a);
  if (r.ok) {
    tutObserve(a);
    // C7：攻击响应窗口关闭（pass/respond 落定）= 战斗此刻才结算——重置 fxAttack 时基，
    // 宣言快照由 fxAtkPend 保管（中间 render 的 fxPlay 已把旧 fxAttack 清出 450ms 窗）
    if (pend0 && !g.pending && fxAtkPend) {
      fxAttack = { ...fxAtkPend, t: Date.now() };
      fxAtkPend = null;
    } else if (!g.pending) fxAtkPend = null;
    const nu = g.players[pi].board.find(u => !board0.includes(u.uid));
    if (nu) { fxSummon = { uid: nu.uid, t: Date.now() }; SND.play('summon'); } // 登场动画+琶音
    if (a.t === 'attack') {
      const au = g.players[pi].board.find(u => u.uid === a.uid) || g.players[pi].grave.find(u => u.uid === a.uid);
      const ad = au && cardsById[au.cardId];
      // 目标位置快照（applyAction 前，目标还在场）——破坏性攻击结算后目标 DOM 即被重绘移除，
      // 剑与爆裂须打在目标倒下的原位（round4 用户反馈：剑要飞到攻击的对象）
      let tgtRect = null;
      if (a.target) {
        const tEl = document.querySelector(`[data-uid="${a.target}"]`);
        if (tEl) tgtRect = tEl.getBoundingClientRect();
      }
      const snap = { uid: a.uid, target: a.target, side: pi, t: Date.now(), tgtRect,
        art: ad ? ad.art : null, name: ad ? ad.name : '' }; // 快照：攻方阵亡时渲染冲撞残影
      fxAtkPend = snap; // 宣言快照存档：若开响应窗口，结算在关闭窗口的 act（C7 重置时基用）
      // round6 R4：开了响应窗口=战斗尚未结算（伤害/破坏都没发生）——宣言 act 不播攻击链，
      // 只存快照；关窗 act 落定后由上方 pend0 分支设 fxAttack 唯一播一遍（旧版两遍=「数字对不上爆裂」）
      if (!g.pending) fxAttack = snap;
    }
    if (castD) fxCast = { d: castD, t: Date.now() }; // 发动闪卡演出（伏笔/招式）
    // C6：快照后离板 → 溶解队列（玩家侧动作；上限 3 防连锁刷屏）
    if (pi === 0 && leave0.length) {
      const onBoard = new Set([...g.players[0].board, ...g.players[1].board].map(u => u.uid));
      for (const s0 of leave0) if (!onBoard.has(s0.uid)) fxDissolveQ.push(s0);
      if (fxDissolveQ.length > 3) fxDissolveQ = fxDissolveQ.slice(-3);
    }
    const d0 = lp0[0] - g.players[0].lp, d1 = lp0[1] - g.players[1].lp;
    if (d0 !== 0 || d1 !== 0) {
      // round5 C5：逐笔入队——扫 applyAction 新增日志的 damageLP 归因行（「名字 LP -N（why）→ M」），
      // from/to 链式推算；单笔 max 归因在多笔连跳（登场烧血+攻击差额两连）时只剩一笔，步进须逐笔
      const curs = [lp0[0], lp0[1]];
      const rows = g.log.slice(logLen0).filter(l => / LP -\d+（/.test(l.msg));
      if (rows.length) {
        for (const l of rows) {
          const m = l.msg.match(/^(.+?) LP -(\d+)（(.+?)）/);
          if (!m) continue;
          const side = m[1] === g.players[0].name ? 0 : 1;
          // round6 R7 修正：delta=日志原值，不做「不低于 0」截断——引擎允许 LP 扣成负数
          // （致死过量打击 foeLp=-1100 实测），Math.min 截断=UI 弹 800 而实际扣 1900 的真凶
          const delta = +m[2];
          if (delta <= 0) continue;
          fxLpQueue.push({ side, from: curs[side], to: curs[side] - delta, delta, why: m[3] });
          curs[side] -= delta;
        }
      } else { // 无归因行的新伤害路径：按合计兜底
        for (const side of [0, 1]) {
          const dd = side === 0 ? d0 : d1;
          if (dd > 0) fxLpQueue.push({ side, from: lp0[side], to: g.players[side].lp, delta: dd, why: '' });
        }
      }
      if (fxLpQueue.length > 8) fxLpQueue = fxLpQueue.slice(-8); // 极端连锁防刷屏（3连锁+战斗+双方亡语=5 笔上限，留余量）
    }
  }
  return r;
}
const rectCenter = r => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
// 命中点爆裂演出（M1 580-760ms；AI 短链=单环+单粒 300ms）：挂 #table，入参=页面坐标中心
function spawnBurst(pt, small) {
  const host = document.getElementById('table');
  if (!host || !pt) return;
  const hr = host.getBoundingClientRect();
  const b = document.createElement('div');
  b.className = 'fx-burst' + (small ? ' sm' : '');
  b.style.left = (pt.x - hr.left) + 'px';
  b.style.top = (pt.y - hr.top) + 'px';
  b.innerHTML = small
    ? '<i></i><s style="--a:35deg"></s>'
    : '<i></i><i></i>' + [0, 120, 240].map(a => `<s style="--a:${a}deg"></s>`).join('');
  FXM.register({ el: b, dur: small ? 700 : 1150, onDone: () => b.remove() });
  host.appendChild(b);
}
// 目标原位溶解（M1 650-1050ms）：卡图纵切三片 clip-path 飞散淡出——scale/fade 禁 blur（C3 红线）；
// 片层从 fxPlay 起即静态可见（结算后 render 已移除目标 DOM，切片=连续性替身），650ms 起散开
function spawnDissolve(rect, art) {
  const host = document.getElementById('table');
  if (!host || !rect || !art) return;
  const hr = host.getBoundingClientRect();
  const d = document.createElement('div');
  d.className = 'fx-dissolve';
  d.style.left = (rect.left - hr.left) + 'px';
  d.style.top = (rect.top - hr.top) + 'px';
  d.style.width = rect.width + 'px';
  d.style.height = rect.height + 'px';
  d.innerHTML = Array.from({ length: 3 }, (_, k) =>
    `<i style="--fx:${(k - 1) * 26}px; --fy:${18 + k * 14}px; --fr:${(k - 1) * 16}deg; --fd:${k * 70}ms"><img src="art/${art}.webp" alt=""></i>`).join('');
  FXM.register({ el: d, dur: 1100, onDone: () => d.remove() });
  host.appendChild(d);
}
// 全桌震动（玩家链专属，M1 至 1000ms；AI 短链不震）
function fxQuake() {
  const tb = document.getElementById('table');
  if (!tb || tb.classList.contains('fx-quake')) return;
  FXM.register({ id: 'quake', el: tb, cls: 'fx-quake', dur: 1000, onDone: () => tb.classList.remove('fx-quake') });
}
// round4：飞行光剑（用户设计——选中卡持剑，确认目标后剑飞过去）。剑尖默认朝上，按航向旋转。
const SWORD_SVG = `<svg viewBox="0 0 28 96" xmlns="http://www.w3.org/2000/svg">
  <path d="M14 2 L19 14 L19 62 L14 70 L9 62 L9 14 Z" fill="#eafaff" stroke="#8fd4ff" stroke-width="1"/>
  <rect x="4" y="63" width="20" height="5" rx="2.5" fill="#d4af37"/>
  <rect x="12" y="68" width="4" height="13" rx="2" fill="#7a5c1e"/>
  <circle cx="14" cy="84" r="3.5" fill="#d4af37"/>
</svg>`;
// 端点归一：元素→中心坐标 {x,y}；坐标直接透传（目标被破坏时传攻击前 rect 的中心）
function fxCenter(v) {
  if (!v) return null;
  if (v instanceof Element) { const r = v.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
  if (typeof v.x === 'number') return v;
  return null;
}
function flySword(from, to) {
  const a = fxCenter(from), b = fxCenter(to);
  if (!a || !b || document.querySelector('.fx-sword')) return;
  const dx = b.x - a.x, dy = b.y - a.y;
  const rot = Math.atan2(dy, dx) * 180 / Math.PI + 90; // 剑身坐标 0°=朝上 → 对齐航向
  const s = document.createElement('div');
  s.className = 'fx-sword';
  s.style.left = a.x + 'px'; s.style.top = a.y + 'px';
  s.style.setProperty('--dx', dx + 'px');
  s.style.setProperty('--dy', dy + 'px');
  s.style.setProperty('--rot', rot + 'deg');
  s.innerHTML = SWORD_SVG;
  s.addEventListener('animationend', () => s.remove(), { once: true });
  setTimeout(() => s.remove(), 500); // .30s 航程（M1 0-300ms）+ 兜底
  FXM.register({ el: s, dur: 300 }); // 快进：finish() 跳终态触发 animationend 自清
  document.body.appendChild(s);
}
// round6：命中点伤害数字（round5 C5 LP 余量滚动的替代）——「-N」为唯一伤害语义，
// 归因卡名随数字同体弹出；同侧串行（promise 链）双侧并行，每枚 0.55s 依次弹出。
// 旧版三病根除：R1 基线/滚动两数字并存值不同；R2 飘字同侧一枚吞第二笔；R3 大数字是余量非伤害。
// （lp-num 基线由 render 即时写终值，始终为真值；本层纯演出，跳过零信息损失）
const lpChain = { 0: Promise.resolve(), 1: Promise.resolve() };
const dmgLog = []; // E2E 对账用：每笔 {side,delta,why}（与引擎 LP -N 行同源）
function lpBig(e) { lpChain[e.side] = lpChain[e.side].then(() => runDmgPop(e)); }
function runDmgPop(e) {
  return new Promise(res => {
    dmgLog.push({ side: e.side, delta: e.delta, why: e.why });
    if (dmgLog.length > 40) dmgLog.shift();
    const numEl = e.side === 0 ? els.myLpNum : els.foeLpNum;
    numEl.classList.remove('fx-hit'); void numEl.offsetWidth; // 重排触发同类动画重播
    numEl.classList.add('fx-hit');
    const wrap = numEl.closest('.lp-wrap');
    if (!wrap || e.delta <= 0) return res();
    // reduce-fx / 教学局：无动画弹出（信息不丢——基线与战报都在），直接收场
    if (g.tutorial || document.documentElement.classList.contains('reduce-fx')) return res();
    const el = document.createElement('div');
    el.className = 'fx-dmg';
    el.innerHTML = `<b>-${e.delta}</b>${e.why ? `<small>${e.why}</small>` : ''}`;
    const end = () => { el.remove(); res(); };
    el.addEventListener('animationend', (ev) => { if (ev.target === el) end(); }, { once: true });
    setTimeout(end, 900); // 兜底（后台标签页 animationend 不触发）
    FXM.register({ id: 'dmgpop' + e.side, el, dur: 700, onDone: end }); // 点击快进→立即收场
    wrap.appendChild(el);
  });
}
// render 后注入动效类：攻方冲撞（我打敌=向上/敌打我=向下）、目标受击红闪、LP 数字跳动（450ms 窗口，过窗自清）
function fxPlay() {
  const now = Date.now();
  if (fxAttack) {
    if (now - fxAttack.t < 450) {
      const byAi = fxAttack.side === 1;
      // M1 玩家全链 1.2s：0-300 剑飞+冲撞（lunge 内嵌 hit-stop）→ 390 白闪 → 580 爆裂+桌震至 1000
      // → 650-1050 目标溶解 → 1200 收尾；AI 普攻=短链 ~0.7s（冲撞+白闪+小爆，无剑/无溶解/无震）
      const atkEl = document.querySelector(`[data-uid="${fxAttack.uid}"]`);
      if (atkEl) atkEl.classList.add(byAi ? 'fx-lunge-down' : 'fx-lunge-up');
      else if (fxAttack.art) {
        // 攻方阵亡（撞击反噬/同归于尽）：在其场地渲染冲撞残影
        const host = byAi ? els.foeBoard : els.myBoard;
        if (host && !host.querySelector('.fx-ghost')) {
          const ghost = document.createElement('div');
          ghost.className = `card fx-ghost ${byAi ? 'fx-lunge-down' : 'fx-lunge-up'}`;
          ghost.innerHTML = `<img class="art" src="art/${fxAttack.art}.webp"><div class="nm">${fxAttack.name}</div>`;
          ghost.addEventListener('animationend', () => ghost.remove(), { once: true });
          setTimeout(() => ghost.remove(), 1300);
          FXM.register({ el: ghost, dur: 1040, onDone: () => ghost.remove() });
          host.appendChild(ghost);
        }
      }
      // 目标被破坏时 DOM 已重绘移除 → 用 act() 快照的攻击前位置（剑与爆裂打在目标倒下的原位）
      const tgtEl = fxAttack.target ? document.querySelector(`[data-uid="${fxAttack.target}"]`) : null;
      const tgtC = fxCenter(tgtEl) || (fxAttack.tgtRect ? rectCenter(fxAttack.tgtRect) : null)
        || fxCenter(byAi ? els.myLpNum : els.foeLpNum); // 直攻=LP 区
      const from = atkEl || document.querySelector('.fx-ghost') || (byAi ? els.foeBoard : els.myBoard);
      SND.play('attack');                                             // 低频冲刺（宣言即起）
      SND.play('clash', byAi ? 280 : 390);                            // 命中噪声：AI lunge 58%≈278 / 玩家 --t-hit=390
      if (!byAi) flySword(from, tgtC);
      if (tgtEl) tgtEl.classList.add('fx-hit');
      spawnBurst(tgtC, byAi);
      if (!byAi) fxQuake();
      FXM.register({ id: 'atkchain', dur: byAi ? 700 : 1200 }); // 纯节奏登记：AI 步进间隔感知（无视觉元素）
    } else fxAttack = null;
  }
  if (fxCast) {
    if (now - fxCast.t < 450) {
      if (!document.querySelector('.fx-cast')) {
        SND.play('cast'); // round6：发动采样（switch 咔哒+上扫点缀）
        const d = fxCast.d;
        const c = document.createElement('div');
        c.className = `fx-cast ${d.type === 'trap' ? 't-trap' : 't-move'}`;
        c.innerHTML = `<img src="art/${d.art}.webp" alt=""><b>${d.type === 'trap' ? '伏笔发动！' : '招式发动！'}${d.name}</b>`;
        c.addEventListener('animationend', () => c.remove(), { once: true });
        setTimeout(() => c.remove(), 1150);
        document.body.appendChild(c);
        // 背景暗化一拍（round5 C2 账实修正：CSS 规则一直存在但从未被创建）
        const dim = document.createElement('div');
        dim.className = 'cast-dim';
        dim.addEventListener('animationend', () => dim.remove(), { once: true });
        setTimeout(() => dim.remove(), 1150);
        document.body.appendChild(dim);
      }
    } else fxCast = null;
  }
  if (fxLpQueue.length) {
    const q = fxLpQueue;
    fxLpQueue = [];
    for (const e of q) lpBig(e); // 逐笔步进（队列在 act() 即时填充，此处无 450ms 窗口需求）
  }
  if (fxDissolveQ.length) { // 离场溶解（攻方自身阵亡走 ghost，剔除）
    const q = fxDissolveQ;
    fxDissolveQ = [];
    for (const s0 of q) if (!fxAttack || s0.uid !== fxAttack.uid) { spawnDissolve(s0.rect, s0.art); SND.play('ko', 650); }
  }
  if (fxSummon) {
    if (now - fxSummon.t < 450) {
      const el = document.querySelector(`[data-uid="${fxSummon.uid}"]`);
      if (el) el.classList.add('fx-summon');
    } else fxSummon = null;
  }
}
let tutEnded = false; // 终步已触发（防重复弹完成窗）
// round5 C4：回合切换横幅——render 尾 turnKey 比对，变化才弹（0.8s 自清，FXM 可快进）；
// 教学局/reduce-fx 豁免；恢复存档由 restoreLive 预置 key 不弹
let turnKeyShown = null;
function fxTurnBanner() {
  if (!g || g.winner !== null || g.tutorial) return;
  if (document.documentElement.classList.contains('reduce-fx')) return;
  const key = g.turn + '|' + g.active;
  if (key === turnKeyShown) return;
  turnKeyShown = key;
  const mine = g.active === 0;
  const b = document.createElement('div');
  b.className = 'turn-banner ' + (mine ? 'mine' : 'foe');
  b.textContent = mine ? `第 ${g.turn} 回合 · 你的回合` : `第 ${g.turn} 回合 · 对方回合`;
  b.addEventListener('animationend', () => b.remove(), { once: true });
  document.body.appendChild(b);
  FXM.register({ id: 'turnBanner', el: b, dur: 800, onDone: () => b.remove() });
  setTimeout(() => b.remove(), 1300);
}
function tutCheck() {
  if (!tut || tutEnded) return;
  if (tutFlags.attacked && !tutFlags.attackResolved) tutFlags.attackResolved = tutAttackResolved(); // 结算完成态（窗口关闭后）
  while (!tutEnded) { // 连续推进：恒真终步（如 T2 步5）不再等下一次 render
    const step = tut.steps[tutStep];
    if (!step || !step.check(g, tutFlags)) break; // 终步 check 允许读 g.winner（如 T1 胜利判完成），故不在头部拦截 winner
    tutStep++;
    toast(`✓ 教学 ${tut.id}-${tutStep} 步完成`);
    if (tutStep >= tut.steps.length) { tutEnded = true; tutFinish(); }
    else renderTutBanner();
  }
}
function tutFinish() {
  const done = JSON.parse(localStorage.getItem('gld_tut_done') || '[]');
  if (!done.includes(g.tutorial)) { done.push(g.tutorial); localStorage.setItem('gld_tut_done', JSON.stringify(done)); }
  const next = TUTORIALS.find(t => t.id === g.tutorial + 1);
  els.modalBox.innerHTML = `<h3>🎓 教学 ${g.tutorial}「${tut.name}」完成！</h3>
    <div class="meta" style="margin:8px 0">${next ? '继续下一段教学？' : '三段教学全部完成——去闯东海篇吧！'}</div>
    ${next ? `<button class="opt" id="tNext">▶ 进入教学 ${next.id}：${next.name}</button>` : ''}
    <button class="opt" id="tStage">🗺 前往闯关模式</button>
    <button class="opt" id="tReplay">↺ 重玩本段</button>`;
  els.modal.classList.remove('hidden');
  if (next) $('tNext').onclick = () => { els.modal.classList.add('hidden'); location.href = `?tutorial=${next.id}`; };
  $('tStage').onclick = () => location.href = 'campaign.html';
  $('tReplay').onclick = () => { els.modal.classList.add('hidden'); startTutorial(g.tutorial); };
}
function renderTutBanner() {
  let bar = document.getElementById('tutBanner');
  if (!tut) { if (bar) bar.remove(); return; }
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'tutBanner';
    bar.className = 'tut-banner';
    document.body.appendChild(bar);
  }
  const step = tut.steps[tutStep];
  const done = tutStep, total = tut.steps.length;
  bar.innerHTML = `<div class="tb-head">🎓 教学 ${g.tutorial}「${tut.name}」 <span class="tb-prog">${done}/${total}</span>
      <button class="tb-skip" id="tutSkip">跳过教学</button></div>
    <div class="tb-say">${step ? step.say : '…'}</div>`;
  $('tutSkip').onclick = () => {
    if (confirm('跳过教学？可直接去闯关或快速对决')) location.href = 'campaign.html';
  };
}

// ---------- 渲染 ----------
function render() {
  if (!g) return;
  const [P, E] = g.players;
  els.turnChip.textContent = `第 ${g.turn} 回合 · ${g.active === 0 ? '你的回合' : '对方回合'} · ${PH_SHORT[g.phase] || ''}`;
  els.foeName.textContent = E.name;
  els.myName.textContent = P.name;
  document.querySelectorAll('.ph').forEach(el => el.classList.toggle('active', el.dataset.ph === g.phase));
  els.foeLpNum.textContent = Math.max(0, E.lp);
  els.foeLpBar.innerHTML = `<i style="width:${Math.max(0, E.lp) / 4000 * 100}%"></i>`;
  els.myLpNum.textContent = Math.max(0, P.lp);
  els.myLpBar.innerHTML = `<i style="width:${Math.max(0, P.lp) / 4000 * 100}%"></i>`;
  els.foeDeckN.textContent = E.deck.length; els.foeHandN.textContent = E.hand.length; els.foeGraveN.textContent = E.grave.length;
  els.myDeckN.textContent = P.deck.length; els.myGraveN.textContent = P.grave.length;

  els.foeHand.innerHTML = E.hand.map(() => '<div class="cardback"></div>').join('');
  // round3：5 格人物区——已登场卡 + 空槽并存（空位可见=场上格局一目了然）
  els.foeBoard.innerHTML = E.board.map(u => unitCard(u, false)).join('') + emptySlots(E.board.length);
  els.myBoard.innerHTML = P.board.map(u => unitCard(u, true)).join('') + emptySlots(P.board.length);
  els.myHand.innerHTML = P.hand.map(h => handCard(h)).join('');
  els.foeSpells.innerHTML = E.spells.map(() => '<div class="spellback-sm" title="对方盖伏的卡">伏</div>').join('')
    + Array.from({ length: Math.max(0, 3 - E.spells.length) }, () => '<div class="slot-sm"></div>').join('');
  els.mySpells.innerHTML = P.spells.map(s => mySpellCard(s)).join('')
    + Array.from({ length: Math.max(0, 3 - P.spells.length) }, () => '<div class="slot-sm"></div>').join('');
  bindCards();
  renderLog();
  renderHint();
  updateNextBtn();
  renderRespond();
  if (g.winner !== null) showEnd();
  // AI 节奏：仅 AI 自己回合（无窗口）或窗口轮到 AI 时拉起；窗口轮到玩家时绝不重开 timer
  // （否则 stopAi→render→scheduleAi 无限 ping-pong，busy 每拍震荡吞掉玩家点击——R1-P0#1）
  const aiTurn = g.active === 1 && !g.pending;
  const aiRespond = !!g.pending && g.pending.turnPtr === 1;
  if (g.winner === null && !aiTimer && (aiTurn || aiRespond)) scheduleAi();
  tutCheck(); renderTutBanner(); // 教学步进（非教学局为空操作）
  fxPlay(); // 战斗动效注入（攻击冲撞/受击/LP 跳动；reduce-fx 下由 CSS 静默）
  fxTurnBanner(); // 回合切换横幅（turnKey 变化才弹；教学/reduce-fx 豁免）
  saveLive(); // 每次状态渲染后落档（结束局/恢复流程自动跳过）
}

function emptySlots(n) { return Array.from({ length: DUEL.BOARD_MAX - n }, () => '<div class="slot"></div>').join(''); }

function unitCard(u, mine) {
  const d = cardsById[u.cardId];
  const eqN = (u.equips || []).length;
  // round4 P0：显示当前战斗力（卡面+buff+装备）——结算值与显示一致，偏离印刷值时▲▼标注
  const A = DUEL.unitAtk(cardsById, u), D0 = DUEL.unitDef(cardsById, u);
  const aCls = A > d.atk ? 'up' : A < d.atk ? 'down' : '';
  const dCls = D0 > d.def ? 'up' : D0 < d.def ? 'down' : '';
  const cls = ['card', 'unit', u.pos === 'def' ? 'pos-def' : '', u.attacked ? 'attacked' : '',
    mine && clickable(u) ? 'playable' : '', sel === u.uid ? 'selected' : '',
    !mine && sel ? 'targetable' : ''].join(' ');
  return `<div class="${cls}" data-uid="${u.uid}" title="${d.name} Lv${d.level} 攻${A}/守${D0}${eqN ? `（装备×${eqN}）` : ''}">
    <img class="art" src="art/${d.art}.webp" alt="${d.name}" loading="lazy">
    <span class="lv">${d.level}</span>
    ${eqN ? `<span class="eq-badge">⚒${eqN}</span>` : ''}
    <div class="nm">${d.name}</div><div class="sub">${d.sub}</div>
    <div class="stats"><span class="atk ${aCls}"><i>攻</i>${A}${aCls === 'up' ? '▲' : aCls === 'down' ? '▼' : ''}</span><span class="def ${dCls}"><i>守</i>${D0}${dCls === 'up' ? '▲' : dCls === 'down' ? '▼' : ''}</span></div>
  </div>`;
}
// 招式/伏笔效果短描述（手牌/弹层共用）
function shortFx(d) {
  return (d.effect.ops || []).map(o => {
    switch (o.op) {
      case 'damage': return `伤害${o.amount}`;
      case 'atkDelta': return `ATK${o.amount >= 0 ? '+' : ''}${o.amount}`;
      case 'defDelta': return `DEF${o.amount >= 0 ? '+' : ''}${o.amount}`;
      case 'destroy': return '破坏';
      case 'setPosDef': return '改守备';
      case 'negateAttack': return '无效攻击';
      case 'negateMove': return '无效招式';
      case 'equip': return `装备${(o.stat || 'atk').toUpperCase()}+${o.amount}`;
      default: return '';
    }
  }).join('·');
}
function handCard(h) {
  const d = cardsById[h.cardId];
  if (d.type !== 'char') {
    const my = g.players[0];
    const can = myPhaseMain() && (
      d.type === 'trap'
        ? (my.setsThisTurn < 2 && my.spells.length < 3)
        : true); // 招式：发动或盖伏至少一头可行
    return `<div class="card hand-card spell-card t-${d.type} ${can ? 'playable' : ''}" data-huid="${h.uid}" title="${d.name}：${d.desc}">
      <img class="art" src="art/${d.art}.webp" alt="${d.name}" loading="lazy">
      <span class="tbadge">${d.type === 'move' ? '招' : '伏'}</span>
      <div class="nm">${d.name}</div><div class="sub">${d.sub}</div>
      <div class="fx">${shortFx(d)}</div>
    </div>`;
  }
  const can = myPhaseMain() && g.players[0].summoned === 0 && (d.level <= 4 ? g.players[0].board.length < 3 : true);
  return `<div class="card hand-card ${can ? 'playable' : ''}" data-huid="${h.uid}" title="${d.name}">
    <img class="art" src="art/${d.art}.webp" alt="${d.name}" loading="lazy">
    <span class="lv">${d.level}</span>
    <div class="nm">${d.name}</div><div class="sub">${d.sub}</div>
    <div class="stats"><span class="atk"><i>攻</i>${d.atk}</span><span class="def"><i>守</i>${d.def}</span></div>
  </div>`;
}
// 我方招式/伏笔区条目
function mySpellCard(s) {
  const d = cardsById[s.cardId];
  if (s.equipTo) {
    const u = g.players[0].board.find(x => x.uid === s.equipTo);
    return `<div class="spellcard equip" title="${d.name}：${d.desc}">⚒ ${d.name}<span class="fx-sm">${u ? cardsById[u.cardId].name : ''}</span></div>`;
  }
  if (s.set) {
    const clickableSpell = d.type === 'move' && myPhaseMain();
    return `<div class="spellcard set${clickableSpell ? '' : ' locked'}" data-suid="${s.uid}"
      title="${d.name}（已盖伏）${d.type === 'move' ? '·点击可翻开发动' : '·响应窗口自动提示'}">伏·${d.name}</div>`;
  }
  return `<div class="spellcard">${d.name}</div>`;
}

function myPhaseMain() { return g.active === 0 && (g.phase === 'main1' || g.phase === 'main2') && g.winner === null; }
function clickable(u) { // 我方场上人物：战斗阶段可攻击者 或 攻击发起选择中
  if (g.active !== 0 || g.winner !== null) return false;
  if (g.phase === 'battle') return DUEL.canAttack(g, cardsById, 0, u.uid, g.players[1].board.length ? g.players[1].board[0].uid : null).ok;
  return false;
}

function renderLog() {
  // 全量进抽屉；最新一条有效战报进 ticker（过滤「— xx阶段 —」分隔行——低信息噪音不占黄金位）
  let tick = '';
  while (logShown < g.log.length) {
    const l = g.log[logShown++];
    const div = document.createElement('div');
    div.className = 'l' + (/获胜|平局|直接攻击|解放/.test(l.msg) ? ' hl' : '');
    div.textContent = l.msg;
    els.ldBody.appendChild(div);
    if (!/^—.*—$/.test(l.msg)) tick = l.msg;
  }
  els.ldBody.scrollTop = els.ldBody.scrollHeight;
  if (tick) els.ticker.textContent = tick;
  else if (g.winner !== null) els.ticker.textContent = '';
}

function renderHint() {
  if (g.winner !== null) { setHint('— 决斗结束 —'); return; }
  if (g.pending) {
    if (g.pending.turnPtr === 0) setHint('【响应窗口】在顶部横幅选择：发动伏笔反制 / 不响应', true);
    else setHint('对方正在考虑是否反制…', true);
    return;
  }
  if (busy) { setHint('对方思考中…', true); return; }
  if (g.active === 1) { setHint('对方回合', true); return; }
  const who = `${PH_CN[g.phase]}：`;
  const hasPlayableHand = document.querySelectorAll('#myHand .hand-card.playable').length > 0;
  const map = {
    draw: '抽牌阶段', standby: '准备阶段',
    main1: hasPlayableHand ? '点亮的手牌可登场或使用 · 完成后按「进入战斗」' : '没有可出的牌，直接按「进入战斗」',
    battle: sel ? '选择攻击目标（高亮的敌方人物）或「直接攻击」' : '点自己亮起的人物发起攻击，或结束回合',
    main2: '还可登场/盖伏/切换表示，或按「结束回合 ✓」交回合',
    end: '按「结束回合」交给对方',
  };
  setHint(who + map[g.phase], true);
}
function setHint(t, warn) { els.hint.textContent = t; els.hint.className = warn ? 'warn' : ''; }

function updateNextBtn() {
  const b = els.btnNext, sub = $('btnToMain2');
  sub.classList.add('hidden');
  if (g.winner !== null) { b.disabled = true; b.textContent = '对决结束'; return; }
  if (g.pending) { b.disabled = true; b.textContent = '等待响应…'; return; }
  b.disabled = g.active !== 0 || busy;
  if (g.active !== 0) { b.textContent = '对方回合…'; return; }
  if (g.phase === 'battle') {
    b.textContent = '结束回合 ✓';
    if (battleHasActions()) sub.classList.remove('hidden'); // 有攻击手时给「战后出牌」次链接
  }
  else if (g.phase === 'main1') b.textContent = '进入战斗 ⚔';
  else b.textContent = '结束回合 ✓'; // main2/end 一步交回合
}

// ---------- 响应窗口横幅（规则 §七：玩家为响应方时操作入口） ----------
function renderRespond() {
  if (!g || !g.pending || g.pending.turnPtr !== 0 || g.winner !== null) {
    els.rb.classList.add('hidden'); return;
  }
  const pd = g.pending;
  let text, sub;
  const chainNames = pd.chain.map(l => `「${cardsById[l.cardId].name}」`).join(' → ');
  if (pd.actor === 1) { // 对方宣言，我首次反制
    if (pd.kind === 'attack') {
      const atkU = g.players[1].board.find(u => u.uid === pd.ev.attackerUid);
      const tU = pd.ev.targetUid ? g.players[0].board.find(u => u.uid === pd.ev.targetUid) : null;
      text = `对方宣言攻击！${atkU ? `「${cardsById[atkU.cardId].name}」` : ''}${tU ? ` → 「${cardsById[tU.cardId].name}」` : ' → 直接攻击！'}`;
      sub = '可发动伏笔反制，或选择不响应';
    } else {
      text = `对方发动招式「${cardsById[pd.ev.cardId].name}」！`;
      sub = '可发动伏笔无效该招式，或选择不响应';
    }
  } else { // 我方宣言，对方已跟链，问我是否继续连锁
    text = pd.kind === 'attack'
      ? `对方以${chainNames}反制你的攻击宣言！`
      : `对方以${chainNames}反制你的招式！`;
    sub = '可继续追加伏笔（后发先结算），或选择不响应';
  }
  if (chainNames) sub = `连锁：${chainNames} · ${sub}`;
  els.rbText.innerHTML = `${text}<small>${sub}</small>`;
  const btns = [];
  for (const s of g.players[0].spells) {
    if (!DUEL.canRespond(g, cardsById, 0, s).ok) continue;
    const d = cardsById[s.cardId];
    // R2-01：defDelta-only 伏笔在「目标为攻击表示 / 直接攻击」时不改变结算（攻vs攻比 ATK、直攻扣 LP），
    // 按钮上加 ⚠ 警示降透明度（不禁用：规则允许发动，保留老手自由度，但新手不再白点）
    const ops = d.effect.ops || [];
    const defOnly = ops.some(o => o.op === 'defDelta') && !ops.some(o => o.op === 'negateAttack' || o.op === 'atkDelta' || o.op === 'damage' || o.op === 'destroy');
    const tgt = pd.kind === 'attack' && pd.ev.targetUid ? g.players[0].board.find(u => u.uid === pd.ev.targetUid) : null;
    const useless = pd.kind === 'attack' && defOnly && (!tgt || tgt.pos === 'atk');
    btns.push(`<button data-suid="${s.uid}" class="${useless ? 'dim' : ''}" title="${d.desc}${useless ? '\n⚠ 目标为攻击表示（或直接攻击），DEF 增益不会改变本次战斗结果' : ''}">发动「${d.name}」${useless ? ' ⚠' : ''}</button>`);
  }
  btns.push(`<button class="pass" data-suid="">不响应</button>`);
  els.rbBtns.innerHTML = btns.join('');
  els.rbBtns.querySelectorAll('button').forEach(b => b.onclick = () => {
    if (busy) return;
    const a = b.dataset.suid ? { t: 'respond', spellUid: b.dataset.suid } : { t: 'pass' };
    const r = act(0, a);
    if (!r.ok) return toast(r.reason);
    render();
  });
  els.rb.classList.remove('hidden');
}

// ---------- 交互绑定 ----------
function bindCards() {
  els.myHand.querySelectorAll('.hand-card').forEach(el => {
    el.onclick = () => onHandClick(el.dataset.huid);
  });
  els.myBoard.querySelectorAll('.unit').forEach(el => {
    el.onclick = () => onMyUnitClick(el.dataset.uid);
  });
  els.foeBoard.querySelectorAll('.unit').forEach(el => {
    el.onclick = () => onFoeUnitClick(el.dataset.uid);
  });
  els.mySpells.querySelectorAll('.spellcard.set:not(.locked)').forEach(el => {
    el.onclick = () => onMySpellClick(el.dataset.suid);
  });
}

function onMySpellClick(suid) {
  if (busy || !myPhaseMain()) return toast('只能在你的主要阶段翻开发动');
  const s = g.players[0].spells.find(x => x.uid === suid);
  if (!s) return;
  const d = cardsById[s.cardId];
  if (d.type !== 'move') return toast('伏笔会在响应窗口自动提示发动');
  showSpellModal({ kind: 'spell', uid: suid }, d);
}

function onHandClick(huid) {
  if (busy || !myPhaseMain()) return toast('只能在你的主要阶段操作');
  const h = g.players[0].hand.find(x => x.uid === huid);
  if (!h) return;
  const d = cardsById[h.cardId];
  if (d.type !== 'char') return showSpellModal({ kind: 'hand', uid: h.uid }, d);
  if (g.players[0].summoned >= 1) return toast('本回合通常登场次数已用完（每回合 1 次）');
  const need = d.level >= 7 ? 2 : d.level >= 5 ? 1 : 0;
  if (need === 0) {
    if (g.players[0].board.length >= DUEL.BOARD_MAX)
      return toast(`人物区已满（${DUEL.BOARD_MAX} 格）——点场上人物可解放腾位`);
    // round3 用户反馈：默认攻击表示直接登场，不弹窗；守备=下一回合点场上卡切换
    const r = act(0, { t: 'summon', handUid: h.uid, pos: 'atk', tributes: [] });
    if (!r.ok) return toast(r.reason);
    return render();
  }
  if (g.players[0].board.length < need) return toast(`Lv${d.level} 人物需要解放 ${need} 名场上人物，你场上不足`);
  showSummonModal(h, d, need);
}

// 招式/伏笔操作弹层：src={kind:'hand'|'spell', uid}
function showSpellModal(src, d) {
  const my = g.players[0], en = g.players[1];
  const parts = [`<div class="card-preview">
    <div class="card t-${d.type}"><img class="art" src="art/${d.art}.webp">
      <span class="tbadge">${d.type === 'move' ? '招式' : '伏笔'}</span>
      <div class="nm">${d.name}</div><div class="sub">${d.sub}</div><div class="fx">${shortFx(d)}</div></div>
    <div class="meta"><b>${d.name}</b>（${d.type === 'move' ? (d.moveKind === 'equip' ? '装备招式' : '通常招式') : '伏笔'}）<br>${d.desc}</div>
  </div>`];
  const actKind = src.kind === 'hand' ? 'activateMove' : 'activateSpell'; // 注意勿与全局 act() 同名
  const key = src.kind === 'hand' ? 'handUid' : 'spellUid';
  if (d.type === 'trap') {
    parts.push(`<div id="posOpts" style="margin-top:10px">
      <button class="opt" data-act="set">🂠 盖伏到伏笔区（下一回合起可在响应窗口发动）</button>
      <button class="cancel">取消</button></div>`);
  } else {
    let body = '';
    if (d.effect.need) {
      const tgts = DUEL.moveTargets(g, cardsById, 0, d);
      if (!tgts.length) body = `<div class="meta" style="margin-top:10px;color:#ff9b9b">当前没有合法目标（${d.effect.need === 'ownUnit' ? '需要自己场上人物' : d.effect.need === 'foeUnitMax1200' ? '需要对方 ATK1200 以下人物' : '需要对方攻击表示人物'}）</div>`;
      else body = `<h3 style="margin-top:10px">选择目标</h3>` + tgts.map(uid => {
        const mine = my.board.some(u => u.uid === uid);
        const u = (mine ? my.board : en.board).find(x => x.uid === uid);
        const ud = cardsById[u.cardId];
        return `<button class="opt" data-act="cast" data-tgt="${uid}">${mine ? '▸ 我方' : '▸ 对方'}「${ud.name}」ATK${ud.atk}${u.pos === 'def' ? '（守备）' : ''}</button>`;
      }).join('');
    } else body = `<div style="margin-top:10px"><button class="opt" data-act="cast">⚡ 立即发动</button></div>`;
    if (src.kind === 'hand') body += `<button class="opt" data-act="set" style="margin-top:6px">🂠 盖伏（之后可随时翻开发动）</button>`;
    parts.push(body + `<button class="cancel">取消</button>`);
  }
  els.modalBox.innerHTML = parts.join('');
  els.modal.classList.remove('hidden');
  els.modalBox.querySelectorAll('[data-act]').forEach(b => b.onclick = () => {
    const a = { t: b.dataset.act === 'set' ? 'setSpell' : actKind };
    a[key] = src.uid;
    if (b.dataset.tgt !== undefined) a.target = b.dataset.tgt;
    els.modal.classList.add('hidden');
    const r = act(0, a);
    if (!r.ok) return toast(r.reason);
    render();
  });
  const c = els.modalBox.querySelector('.cancel');
  if (c) c.onclick = () => els.modal.classList.add('hidden');
}

function showSummonModal(h, d, need) {
  const my = g.players[0];
  let tributeSel = [];
  const html = [];
  html.push(`<div class="card-preview">
    <div class="card"><img class="art" src="art/${d.art}.webp"><span class="lv">${d.level}</span>
      <div class="nm">${d.name}</div><div class="sub">${d.sub}</div>
      <div class="stats"><span class="atk"><i>攻</i>${d.atk}</span><span class="def"><i>守</i>${d.def}</span></div></div>
    <div class="meta"><b>${d.name}</b>（Lv${d.level}）<br>攻击力 ${d.atk} / 守备力 ${d.def}<br>${d.role}<br>${d.desc}</div>
  </div>`);
  html.push(`<h3 style="margin-top:12px">选择解放对象（${need} 名）</h3><div id="triList">`);
  for (const u of my.board) {
    const ud = cardsById[u.cardId];
    html.push(`<button class="opt tri" data-uid="${u.uid}">${ud.name}（ATK${ud.atk}/DEF${ud.def}）</button>`);
  }
  html.push('</div>');
  // round3：默认攻击表示——不再二选一（守备=下一回合点场上卡切换）
  html.push(`<div id="posOpts" style="margin-top:10px">
    <button class="opt" data-pos="atk">⚔ 解放并登场（攻击表示）</button>
    <button class="cancel">取消</button>
  </div>`);
  els.modalBox.innerHTML = html.join('');
  els.modal.classList.remove('hidden');

  els.modalBox.querySelectorAll('.tri').forEach(b => b.onclick = () => {
    const uid = b.dataset.uid;
    const i = tributeSel.indexOf(uid);
    if (i >= 0) { tributeSel.splice(i, 1); b.style.borderColor = ''; }
    else {
      if (tributeSel.length >= need) return toast(`最多选择 ${need} 名`);
      tributeSel.push(uid); b.style.borderColor = 'var(--gold-bright)';
    }
    els.modalBox.querySelector('#posOpts').querySelectorAll('.opt[data-pos]').forEach(pb => {
      pb.disabled = need > 0 && tributeSel.length !== need;
      pb.style.opacity = pb.disabled ? .45 : 1;
    });
  });
  els.modalBox.querySelectorAll('.opt[data-pos]').forEach(b => b.onclick = () => {
    if (need > 0 && tributeSel.length !== need) return toast(`先选择 ${need} 名解放对象`);
    const r = act(0, { t: 'summon', handUid: h.uid, pos: b.dataset.pos, tributes: tributeSel });
    els.modal.classList.add('hidden');
    if (!r.ok) return toast(r.reason);
    render();
  });
  const c = els.modalBox.querySelector('.cancel');
  if (c) c.onclick = () => els.modal.classList.add('hidden');
}

function onMyUnitClick(uid) {
  if (busy || g.winner !== null) return;
  if (g.active !== 0) return;
  if (g.phase === 'battle') {
    const u = g.players[0].board.find(x => x.uid === uid);
    if (!u) return;
    const chk = DUEL.canAttack(g, cardsById, 0, uid, g.players[1].board.length ? g.players[1].board[0].uid : null);
    if (!chk.ok && !DUEL.canAttack(g, cardsById, 0, uid, null).ok) return toast(chk.reason);
    sel = (sel === uid) ? null : uid;
    render();
    positionDirectBtn();
    return;
  }
  if (g.phase === 'main1' || g.phase === 'main2') {
    showUnitMenu(uid); // round3：场上卡操作菜单（切换表示/解放腾位）
  }
}

// 场上人物操作菜单（round3：「解放腾位」显式化——原先只藏在 Lv5+ 登场弹窗里，区满时无处可点）
function showUnitMenu(uid) {
  const u = g.players[0].board.find(x => x.uid === uid);
  if (!u) return;
  const d = cardsById[u.cardId];
  const toPos = u.pos === 'atk' ? 'def' : 'atk';
  const canPos = DUEL.canSetPos(g, 0, uid, toPos);
  els.modalBox.innerHTML = `<div class="card-preview">
      <div class="card ${u.pos === 'def' ? 'pos-def' : ''}"><img class="art" src="art/${d.art}.webp"><span class="lv">${d.level}</span>
        <div class="nm">${d.name}</div><div class="sub">${d.sub}</div>
        <div class="stats"><span class="atk"><i>攻</i>${d.atk}</span><span class="def"><i>守</i>${d.def}</span></div></div>
      <div class="meta"><b>${d.name}</b>（${u.pos === 'atk' ? '攻击表示' : '守备表示'}${u.summonedTurn === g.turn ? ' · 本回合登场' : ''}）<br>${d.desc}</div>
    </div>
    <button class="opt" id="umPos" ${canPos.ok ? '' : 'disabled'}>↔ 切换为${toPos === 'def' ? '守备' : '攻击'}表示${canPos.ok ? '' : `（${canPos.reason}）`}</button>
    <button class="opt" id="umRel">🔥 解放这名人物（送入墓场，腾出人物区）</button>
    <button class="cancel">取消</button>`;
  els.modal.classList.remove('hidden');
  $('umPos').onclick = () => {
    els.modal.classList.add('hidden');
    const r = act(0, { t: 'setPos', uid, pos: toPos });
    if (!r.ok) return toast(r.reason);
    render();
  };
  $('umRel').onclick = () => {
    els.modal.classList.add('hidden');
    const r = act(0, { t: 'release', uid });
    if (!r.ok) return toast(r.reason);
    render();
  };
  els.modalBox.querySelector('.cancel').onclick = () => els.modal.classList.add('hidden');
}

function onFoeUnitClick(uid) {
  if (busy || g.winner !== null) return;
  if (g.phase !== 'battle' || g.active !== 0 || !sel) return;
  const r = act(0, { t: 'attack', uid: sel, target: uid });
  if (!r.ok) return toast(r.reason);
  sel = null; hideDirectBtn();
  render();
}

function positionDirectBtn() {
  if (!sel || g.players[1].board.length > 0) { hideDirectBtn(); return; }
  if (!DUEL.canAttack(g, cardsById, 0, sel, null).ok) { hideDirectBtn(); return; }
  const el = els.myBoard.querySelector(`[data-uid="${sel}"]`);
  if (!el) { hideDirectBtn(); return; }
  const r = el.getBoundingClientRect();
  els.btnDirect.style.left = (r.right + 12) + 'px';
  els.btnDirect.style.top = (r.top + r.height / 2 - 18) + 'px';
  els.btnDirect.classList.remove('hidden');
}
function hideDirectBtn() { els.btnDirect.classList.add('hidden'); }

els.btnDirect.onclick = () => {
  if (!sel) return;
  const r = act(0, { t: 'attack', uid: sel, target: null });
  if (!r.ok) return toast(r.reason);
  sel = null; hideDirectBtn(); render();
};

// 战斗阶段是否还有可攻击动作（空战自动跳过的判据）
function battleHasActions() {
  return g.players[0].board.some(u =>
    DUEL.canAttack(g, cardsById, 0, u.uid, g.players[1].board.length ? g.players[1].board[0].uid : null).ok
    || DUEL.canAttack(g, cardsById, 0, u.uid, null).ok);
}
els.btnNext.onclick = () => {
  SND.play('click');
  if (busy || g.winner !== null || g.active !== 0) return;
  if (g.phase === 'battle' && !g.tutorial) {
    // 战斗阶段一键结束：链式 nextPhase→main2→endTurn（均合法引擎动作；「出牌 ›」次链接保留战后出牌入口）
    let r = act(0, { t: 'nextPhase' });
    if (r.ok && g.active === 0 && g.phase === 'main2' && g.winner === null) r = act(0, { t: 'endTurn' });
    if (!r.ok) { toast(r.reason); render(); return; }
  } else {
    const endIt = g.phase === 'end' || (g.phase === 'main2' && !g.tutorial);
    let r = act(0, { t: endIt ? 'endTurn' : 'nextPhase' });
    if (!r.ok) { toast(r.reason); render(); return; }
    // 空战斗自动跳过（非教学）：进战斗后发现无任何攻击动作 → 推进 main2，省一次空点击
    if (!g.tutorial && g.phase === 'battle' && g.active === 0 && g.winner === null && !battleHasActions()) {
      act(0, { t: 'nextPhase' });
      toast('本回合没有可攻击的人物，跳过战斗');
    }
  }
  sel = null; hideDirectBtn(); render();
};
// 「出牌 ›」：战斗阶段仅推进到主要2（战后盖伏/登场的次链接）
$('btnToMain2').onclick = () => {
  if (busy || g.winner !== null || g.active !== 0 || g.phase !== 'battle') return;
  const r = act(0, { t: 'nextPhase' });
  if (!r.ok) return toast(r.reason);
  sel = null; hideDirectBtn(); render();
};
// 战报抽屉与 ☰ 菜单
els.ticker.onclick = () => els.logDrawer.classList.add('open');
$('ldClose').onclick = () => els.logDrawer.classList.remove('open');
els.btnMenu.onclick = showMenu;

function showRules() {
  showModal(`
  <h3>决斗规则速览</h3>
  <div class="meta" style="line-height:1.9">
  · 双方 LP 4000，降到 0 获胜；必须抽牌而牌组为空则败。<br>
  · 回合六阶段：抽牌 → 准备 → 主要1 → 战斗 → 主要2 → 结束。先手第一回合不抽牌。<br>
  · 通常登场每回合 1 次：Lv1-4 点击手牌直接登场（默认攻击表示）；Lv5-6 须解放 1 名场上伙伴；Lv7+ 须解放 2 名。<br>
  · 人物区 5 格。区满时点场上人物 →「解放」腾位（下一回合点场上卡也可切换攻/守表示）。<br>
  · 战斗：攻vs攻击表示=比 ATK，高者破坏低者并按差额扣 LP，相等同归于尽；攻vs守备=ATK 对 DEF，破防无伤害、攻不破则自己扣差额。<br>
  · 对方场上无人物时可直接攻击（全额 ATK）。本回合登场不能攻击（速攻除外）。<br>
  · <b>招式</b>（红标）：主要阶段发动。通常招式用后进墓；装备招式留场持续增益，装备者离场时随葬。<br>
  · <b>伏笔</b>（紫标）：先盖伏到伏笔区（每回合 2 张），下一回合起在「响应窗口」发动——对方攻击宣言或发动招式时，顶部横幅会提示你反制。<br>
  · 连锁：后发动的伏笔先结算，最多 3 层；被无效的攻击/招式不返还费用。<br>
  · <b>人物能力</b>（⚡）：登场时/被破坏时/每回合开始时/攻击宣言时自动触发——点卡面可看详细。<br>
  · 想闯东海篇 8 关或自组牌组？点顶部「闯关模式」。<br>
  · 完整规则见 docs/duel-rules.md。
  </div>`);
}
// ☰ 菜单（手机顶栏收纳全部入口；桌面 top-actions 直显、☰ 隐藏）
function showMenu() {
  const fxOn = !document.documentElement.classList.contains('reduce-fx');
  showModal(`<h3>菜单</h3>
    <button class="opt" id="mHelp">📖 决斗规则速览</button>
    <button class="opt" id="mFx">✨ 动效：${fxOn ? '开（点击关闭）' : '关（点击开启）'}</button>
    <button class="opt" id="mSnd">🔊 音效：${SND.isOn() ? '开（点击关闭）' : '关（点击开启）'}</button>
    <a class="opt" href="campaign.html">🗺 闯关模式 / 牌组工坊</a>
    <a class="opt" href="battle.html">⚔ 直接对战（选阵营 / 全卡池）</a>
    <button class="opt" id="mRestart">↺ 重新开局</button>
    <a class="opt" href="index.html">⛵ 旧版入口</a>`);
  $('mHelp').onclick = () => { els.modal.classList.add('hidden'); showRules(); };
  $('mFx').onclick = () => { els.btnFx.onclick(); els.modal.classList.add('hidden'); };
  $('mSnd').onclick = () => { SND.toggle(); applySnd(); els.modal.classList.add('hidden'); };
  $('mRestart').onclick = () => { if (confirm('重新开局？当前对局作废')) { els.modal.classList.add('hidden'); start(); } };
}
els.btnRestart.onclick = () => { if (confirm('重新开局？当前对局作废')) start(); };
els.btnAgain.onclick = () => start();
els.btnHelp.onclick = showRules;

function showModal(html) {
  els.modalBox.innerHTML = html + '<button class="cancel">关闭</button>';
  els.modal.classList.remove('hidden');
  els.modalBox.querySelector('.cancel').onclick = () => els.modal.classList.add('hidden');
}

let toastTimer = null;
function toast(msg) {
  els.toast.textContent = msg;
  els.toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.add('hidden'), 2200);
}

function pushLog(msg) { g.log.push({ seq: ++g.actionSeq, turn: g.turn, side: g.active, msg }); }

// ---------- AI 回合播放 ----------
// 步间 setTimeout 链（round5 C2，替代 setInterval）：演出期间 AI 让路——
// wait = max(620, FXM.lastDurTake()+180)，无新演出回落基线；教学局固定 620（教学节奏稳定）。
// 两不变量沿用（R1-P0#1 防回归注释保留）：①窗口轮到玩家立即停 ②render 尾仅 !aiTimer 才拉起——
// setTimeout 句柄在链存活期间非空（fired 后不清引用），ping-pong 防护语义自动延续。
function scheduleAi() {
  busy = true;
  updateNextBtn(); renderHint();
  queueAiStep(AI_DELAY);
}
function queueAiStep(wait) {
  clearTimeout(aiTimer); // 防双排（render 尾拉起与本函数竞争）
  aiTimer = setTimeout(aiTimerStep, wait);
}
function aiWait() { return (g.tutorial || E2E) ? AI_DELAY : Math.max(AI_DELAY, FXM.lastDurTake() + 180); }
function aiTimerStep() {
  if (!g || g.winner !== null) { stopAi(); busy = false; render(); return; }
  if (g.pending) {
    if (g.pending.turnPtr !== 1) { stopAi(); busy = false; render(); return; } // 窗口轮到玩家
    const step = g.tutorial ? tutorialAiStep(g, cardsById) : DUEL_AI.aiStep(g, cardsById, 1);
    const r = act(1, step || { t: 'pass' });
    if (!r.ok) { stopAi(); busy = false; render(); return; }
    render();
    if (!g.pending) { stopAi(); busy = false; render(); return; } // 窗口关闭交回正常节奏（render 尾按需重拉）
    queueAiStep(aiWait()); // 窗口仍开且轮 AI：继续响应步
    return;
  }
  if (g.active !== 1) { stopAi(); busy = false; render(); return; }
  const step = g.tutorial ? tutorialAiStep(g, cardsById) : DUEL_AI.aiStep(g, cardsById, 1);
  if (!step) { stopAi(); busy = false; render(); return; }
  const r = act(1, step);
  if (!r.ok) { stopAi(); busy = false; render(); return; }
  render();
  // 开窗轮到玩家（AI 攻击宣言触发 W1）：立即解锁，不等下一 tick——否则窗口弹出后 620ms 内的玩家点击被 busy 吞（R1-P0#1 残留）
  if (g.active === 0 || g.winner !== null || (g.pending && g.pending.turnPtr === 0)) { stopAi(); busy = false; render(); return; }
  queueAiStep(aiWait()); // AI 回合继续：下一步（演出感知间隔）
}
function stopAi() { if (aiTimer) { clearTimeout(aiTimer); aiTimer = null; } }

// ---------- 结束 ----------
let endShown = false; // 遮罩只弹一次（败北后偶发 render 重入）
function showEnd() {
  if (endShown) return;
  endShown = true;
  stopAi();
  clearLive(); // 对局结束，存档使命完成
  const w = g.winner;
  SND.play(w === 0 ? 'win' : 'lose'); // C7：胜负音（平局走 lose 低音）
  els.endTitle.textContent = w === -1 ? '平局' : w === 0 ? '胜 利' : '败 北';
  let sub = w === -1 ? '双方同时倒下' :
    (g.winReason === 'lp' ? '生命点数归零' : '牌组抽空') + ` · 历时 ${g.turn} 回合`;
  // 闯关模式：胜利回写通关进度 + 解锁提示；按钮改为返回闯关（可再战同关）
  if (pendingCampaign) {
    if (pendingCampaign.mode === 'vs') { // round6 R6-D：阵营对战——不写闯关进度，按钮回对战页
      els.btnAgain.textContent = '换个对手再战';
      els.btnAgain.onclick = () => { location.href = 'battle.html'; };
      sub += w === 0 ? ' · 对战胜利！' : ' · 回对战页重整旗鼓';
    } else {
    els.btnAgain.textContent = '返回闯关';
    els.btnAgain.onclick = () => { location.href = 'campaign.html'; };
    if (w === 0) {
      let s = null;
      try { s = JSON.parse(localStorage.getItem('gld_campaign_v1')); } catch (e) { s = null; }
      if (!s || !Array.isArray(s.cleared)) s = { cleared: [], decks: {}, activeDeck: 'default' };
      if (!s.cleared.includes(pendingCampaign.stageId)) {
        s.cleared.push(pendingCampaign.stageId);
        if (!s.decks) s.decks = {};
        localStorage.setItem('gld_campaign_v1', JSON.stringify(s));
        const bits = [`第 ${Math.min(pendingCampaign.stageId + 1, 8)} 关解锁`];
        if (pendingCampaign.unlockCard) bits.push(`新卡「${cardsById[pendingCampaign.unlockCard].name}」入池`);
        sub += ' · 通关！' + bits.join('，');
      } else {
        sub += ' · 再次通关';
      }
    } else if (w === 1) {
      sub += ' · 重整旗鼓，回闯关页再战';
    }
    } // mode!=='vs' 分支闭合
  } else if (g.tutorial) {
    els.btnAgain.textContent = '重玩本段教学';
    els.btnAgain.onclick = () => startTutorial(g.tutorial); // 教学局：不写通关、不落档
  } else {
    els.btnAgain.textContent = '再战一局';
    els.btnAgain.onclick = start;
  }
  els.endSub.textContent = sub;
  // round6 R8：结算遮罩延迟 800ms——末笔伤害数字先弹完（致死一击「-2500」被遮罩立即盖掉，
  // 实测+VLM 双确认）；期间输入已由 winner!==null 拦截，安全
  setTimeout(() => els.endOverlay.classList.remove('hidden'), 800);
}

// ---------- 动效开关（Phase 5 任务6）：手动优先（localStorage），系统 prefers-reduced-motion 自动跟随 ----------
const btnFx = $('btnFx');
function applyFx() {
  const manual = localStorage.getItem('gld_reduce_fx');
  const off = manual === '1' || (manual === null && matchMedia('(prefers-reduced-motion: reduce)').matches);
  document.documentElement.classList.toggle('reduce-fx', off);
  if (btnFx) btnFx.textContent = off ? '动效：关' : '动效：开';
}
if (btnFx) btnFx.onclick = () => {
  localStorage.setItem('gld_reduce_fx', document.documentElement.classList.contains('reduce-fx') ? '0' : '1');
  applyFx();
};

// ---------- 音效开关（round5 C7）：独立键 gld_sound 默认静音，与动效开关零联动 ----------
const btnSnd = $('btnSnd');
function applySnd() { if (btnSnd) btnSnd.textContent = SND.isOn() ? '音效：开' : '音效：关'; }
if (btnSnd) btnSnd.onclick = () => { SND.toggle(); applySnd(); };

// ---------- 启动：教学直达 > 存档恢复 > 新局（campaign 开战的 pending 最优先） ----------
function boot() {
  applyFx();
  if ((navigator.hardwareConcurrency || 8) <= 4) document.documentElement.classList.add('lite-fx'); // round5 C3：弱核设备停常驻循环
  if (E2E) document.documentElement.classList.add('reduce-fx'); // C8：E2E 会话级强制（不写用户键）
  const tm = location.search.match(/[?&]tutorial=([123])/);
  if (tm) { startTutorial(+tm[1]); return; }
  if (localStorage.getItem('gld_duel_pending')) { start(); return; } // 闯关开战直达
  const saved = readLive();
  if (saved && saved.corrupt) {
    start();
    toast('检测到损坏的对局存档，已清理并开新局');
    return;
  }
  if (saved) {
    const meta = `第 ${saved.g.turn} 回合 · ${PH_CN[saved.g.phase] || ''}` +
      (saved.pendingCampaign
        ? (saved.pendingCampaign.mode === 'vs' ? ` · 阵营对战「${saved.pendingCampaign.stageName || ''}」` : ` · 东海篇「${saved.pendingCampaign.stageName}」`)
        : ' · 快速对决');
    els.modalBox.innerHTML = `<h3>发现未完成的对局</h3>
      <div class="meta" style="margin-bottom:10px">${meta}<br>离开页面时的局面已被保留。</div>
      <button class="opt" id="rsYes">▶ 继续对局</button>
      <button class="opt" id="rsNo">🗑 放弃，开新局</button>`;
    els.modal.classList.remove('hidden');
    $('rsYes').onclick = () => {
      els.modal.classList.add('hidden');
      resuming = true;
      const ok = restoreLive(saved);
      resuming = false;
      if (!ok) { toast('存档恢复失败，已开新局'); start(); }
    };
    $('rsNo').onclick = () => { els.modal.classList.add('hidden'); clearLive(); start(); };
    return;
  }
  start();
}
boot();

// round5 C8：E2E 只读快照（JSON 深拷贝天然剥 rng 函数；供 duel-flow 断言与近终局注入采样）
window.__GLD = {
  dmgLog() { return dmgLog.slice(); }, // round6：弹出伤害数字流水（E2E 断言=与引擎日志每笔 LP -N 同源）
  state() {
    if (!g) return null;
    return JSON.parse(JSON.stringify({
      turn: g.turn, phase: g.phase, active: g.active, winner: g.winner,
      myLp: g.players[0].lp, foeLp: g.players[1].lp,
      myBoard: g.players[0].board.length, foeBoard: g.players[1].board.length,
      pendingCampaign, e2e: E2E, g,
    }));
  },
};
