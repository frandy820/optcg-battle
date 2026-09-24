// 主控：页面状态机 + 输入 + 动画回放 + 存档（唯一有副作用的流程层）
import { CAPTAINS } from '../data/captains.js';
import { newRun, startBattle, settleBattle, nodeAt, isLastNode, takeReward, takeRelic, campOptions, campAct, campPick, leaveCamp, genRewards } from './run.js';
import { playCard, useCaptainSkill, endPlayerTurn } from '../engine/battle.js';
import { saveRun, loadRun, clearRun, saveFull } from './save.js';
import {
  renderCaptainList, renderRoute, renderBattle, renderHand, renderReward, renderCamp, renderCampPicker,
  renderEnd, showDeckView, showHelp, showCardZoom, floater, shake, toast, appendLog, logText, renderDebug,
} from '../ui/render.js';
import { resolveCard } from '../data/cards.js';

const $ = (id) => document.getElementById(id);
const show = (id) => {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  $('screen-' + id).classList.add('active');
};

const DEBUG = new URLSearchParams(location.search).has('debug');
const state = { run: null, battle: null, busy: false, rewardRelics: null };

// ===== 存档钩子 =====
function persist() {
  if (!state.run || state.run.finished) return;
  if (state.battle && !state.battle.over) saveFull(state.run, state.battle); // 战斗中：刷新=重开当前战斗
  else saveRun(state.run);
}
function refreshContinueBtn() {
  const r = loadRun();
  $('btn-continue').hidden = !r;
}

// ===== 流程：标题 → 船长 → 航线 =====
$('btn-new').onclick = () => { show('captain'); renderCaptainList(pickCaptain, previewDeck); };
$('btn-continue').onclick = () => {
  const r = loadRun();
  if (!r) { toast('没有可继续的航程'); return; }
  state.run = r;
  if (r.finished) { showEnd(); return; }
  // 战斗中刷新：回到当前节点重开（进度/牌组/HP 不丢）
  enterRoute();
};
$('btn-help').onclick = () => showHelp();

function pickCaptain(id) {
  state.run = newRun(id, (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0);
  persist();
  enterRoute();
}
function previewDeck(cap) {
  // 临时构造展示（不建 run）
  showDeckView({ deck: cap.starterDeck.map((id2) => ({ id: id2, upgraded: false })) });
}

function enterRoute() {
  show('route');
  renderRoute(state.run, () => enterNode());
  persist();
}

// ===== 节点分发 =====
function enterNode() {
  const node = nodeAt(state.run);
  if (!node) { showEnd(); return; }
  if (node.k === 'battle') startCombat();
  else if (node.k === 'camp') startCamp();
}

// ===== 战斗 =====
function startCombat() {
  state.battle = startBattle(state.run);
  state.busy = false;
  $('log-body').innerHTML = '';
  show('battle');
  renderBattle(state.battle);
  renderHand(state.battle, onPlayCard);
  appendLog([{ t: 'turnStart', turn: 1 }]);
  persist();
}

function onPlayCard(idx) {
  if (state.busy || !state.battle || state.battle.over) return;
  const before = state.battle.log.length;
  const ok = playCard(state.battle, idx);
  if (!ok) return;
  replay(before, { fast: true });
  renderBattle(state.battle, null);
  renderHand(state.battle, onPlayCard);
  if (state.battle.over) setTimeout(finishBattle, 600);
}

function onSkill(i) {
  if (state.busy || !state.battle || state.battle.over) return;
  const before = state.battle.log.length;
  const ok = useCaptainSkill(state.battle, i);
  if (!ok) return;
  replay(before, { fast: true });
  renderBattle(state.battle);
  renderHand(state.battle, onPlayCard);
  if (state.battle.over) setTimeout(finishBattle, 600); // 技能击杀同样要走结算（曾漏：战斗卡死）
}

$('btn-endturn').onclick = () => {
  const b = state.battle;
  if (state.busy || !b || b.over) return;
  state.busy = true;
  const before = b.log.length;
  endPlayerTurn(b);
  replay(before, { stepMs: 420, done: () => {
    renderBattle(b);
    if (b.over) { setTimeout(finishBattle, 700); return; }
    renderHand(b, onPlayCard);
    state.busy = false;
    persist();
  } });
};

// 回放 log 增量：浮字 + 抖动（fast=玩家行动即时）
function replay(fromIdx, { fast = false, stepMs = 240, done = null } = {}) {
  const b = state.battle;
  const events = b.log.slice(fromIdx);
  appendLog(events);
  const interesting = events.filter((e) => ['dmg', 'heal', 'block', 'resolve', 'summon', 'mateDmg', 'mateDie', 'phase2', 'charge', 'deathSave', 'win', 'lose', 'emergency', 'burn', 'status', 'thorns', 'reshuffle', 'fetch'].includes(e.t));
  for (const e of interesting) {
    if (e.t === 'dmg') {
      if (e.side === 'e') { floater(`-${e.dealt}`, 'dmg', 'enemy'); shake('enemy'); }
      else { floater(`-${e.dealt}${e.blocked ? ` 🛡${e.blocked}` : ''}`, 'dmg', 'player'); shake('player'); }
    } else if (e.t === 'heal') floater(`+${e.x}`, 'heal', 'player');
    else if (e.t === 'mateHeal') floater(`+${e.x}`, 'heal', 'layer');
    else if (e.t === 'block') { if (e.side === 'p') floater(`盾+${e.x}`, 'block', 'player'); }
    else if (e.t === 'resolve') floater(`✦+${e.n}`, 'resolve', 'player');
    else if (e.t === 'summon') toast(e.side === 'e' ? `敌方召唤 ${e.name}！` : `${e.name} 加入战斗！`);
    else if (e.t === 'mateDie') toast(`${e.name} 离场`);
    else if (e.t === 'phase2') toast('☠ Boss 狂怒！', 3000);
    else if (e.t === 'charge') toast(`⚠ 敌人蓄力 ${e.x} 伤害！`, 3000);
    else if (e.t === 'deathSave') toast('👒 草帽护住了你：免死！');
    else if (e.t === 'win') toast('★ 胜利！');
    else if (e.t === 'lose') toast('✖ 战败……');
    else if (e.t === 'emergency') toast('⚠ 牌库耗尽，获得应急短刀');
    else if (e.t === 'burn') toast(`手牌已满，${e.name} 烧掉`);
    else if (e.t === 'status') toast(`${e.side === 'e' ? '敌方' : '我方'}获得 ${e.k === 'weak' ? '虚弱' : '易伤'}`);
    else if (e.t === 'thorns') floater(`反甲-${e.x}`, 'dmg', 'enemy');
  }
  renderBattle(b); // 每次回放后刷整体状态（浮字叠加在最新状态上）
  if (done) {
    if (fast) done();
    else setTimeout(done, Math.max(stepMs, interesting.length * stepMs * 0.4));
  }
}

function finishBattle() {
  const b = state.battle;
  const r = settleBattle(state.run, b);
  state.battle = null;
  if (!r.win) { clearRun(); showEnd(); return; }
  if (state.run.finished === 'victory') { clearRun(); showEnd(); return; }
  // 伙伴加入（剧情节点固定）：招募卡已免费入组
  if (r.joinsCard) {
    const rc = resolveCard({ id: r.joinsCard });
    toast(`🤝 ${rc ? rc.name.replace('招募·', '') : '新伙伴'}加入了！招募卡已放入牌组`, 3200);
  }
  // 奖励屏：先遗物后卡牌（遗物必选，卡牌可跳过）
  show('reward');
  const relicOpts = r.relicOptions;
  const renderRelic = () => renderReward({
    title: '战利品', sub: '选择一件遗物（必选）', cards: null,
    relics: relicOpts, relicPicked: false,
    onPickRelic: (rid) => { takeRelic(state.run, rid); persist(); renderCards(); },
  });
  const renderCards = () => renderReward({
    title: '战利品', sub: '选择 1 张卡加入牌组，或跳过换 30 金币',
    cards: r.rewards, relics: null, relicPicked: true,
    onPickCard: (entry) => { takeReward(state.run, entry); persist(); enterRoute(); },
    onSkip: () => { takeReward(state.run, null); persist(); enterRoute(); },
  });
  if (relicOpts && relicOpts.length) renderRelic();
  else renderCards();
}

$('btn-flee').onclick = () => {
  const btn = $('btn-flee');
  if (btn.dataset.confirm) { // 二次确认：放弃本局
    delete btn.dataset.confirm; btn.textContent = '撤退（放弃本局）';
    clearRun(); state.run = null; state.battle = null;
    show('title'); refreshContinueBtn();
    return;
  }
  btn.dataset.confirm = '1'; btn.textContent = '确认放弃？';
  setTimeout(() => { delete btn.dataset.confirm; btn.textContent = '撤退（放弃本局）'; }, 2600);
};
$('btn-log').onclick = () => {
  const d = $('log-drawer');
  d.hidden = !d.hidden;
};
document.querySelectorAll('[data-back]').forEach((b) => b.onclick = () => {
  if (b.dataset.back === 'title') {
    // 从船长/航线回标题
    if (state.run && !state.run.finished) persist();
    show('title'); refreshContinueBtn();
  }
});

// ===== 营地 =====
function startCamp() {
  show('camp');
  renderCampActions();
  persist();
}
function renderCampActions() {
  const run = state.run;
  const opts = campOptions(run).map((o) => ({
    ...o,
    disabled: (o.k === 'heal' && run.campFreeUsed) || (o.k === 'remove' && run.gold < 40) || (o.k === 'upgrade' && run.campFreeUsed === true && run.gold < 50),
  }));
  renderCamp(run, opts, (k) => {
    const r = campAct(run, k);
    if (!r.ok) { toast(r.err || '不行'); renderCampActions(); return; }
    if (r.needPick) {
      renderCampPicker(r.needPick, run, (idx) => {
        campPick(run, r.needPick, idx);
        $('camp-picker').hidden = true;
        toast(r.needPick === 'upgrade' ? '强化完成' : '已移除');
        renderCampActions();
      }, () => { $('camp-picker').hidden = true; });
    } else {
      persist(); // 回血即时落盘（防不点离开直接关页丢一次休息）
      toast('休息回复 25 HP');
      renderCampActions();
    }
  }, () => { leaveCamp(state.run); persist(); enterRoute(); });
}

// ===== 终局 =====
function showEnd() {
  show('end');
  renderEnd(state.run, () => { // 再来一局：同船长新 seed
    const cap = state.run.captainId;
    state.run = newRun(cap, (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0);
    persist(); enterRoute();
  }, () => { show('title'); refreshContinueBtn(); });
  if (state.run && state.run.finished) clearRun();
}

// ===== 启动 =====
$('btn-skill-0').onclick = () => onSkill(0);
$('btn-skill-1').onclick = () => onSkill(1);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { $('overlay').hidden = true; $('help-modal').hidden = true; $('log-drawer').hidden = true; }
  if (e.key === 'e' || e.key === 'E') { const b = $('btn-endturn'); if (b && $('screen-battle').classList.contains('active')) b.click(); }
});
$('btn-deck-view').onclick = () => state.run && showDeckView(state.run);
if (DEBUG) {
  setInterval(() => renderDebug(state.battle, state.run), 800);
}
refreshContinueBtn();
show('title');
