// 渲染层：纯函数 DOM 构造（数据→节点），不含游戏流程判断；事件绑定在 main.js
import { CARDS, resolveCard, MATES } from '../data/cards.js';
import { CAPTAINS, CAPTAIN_TEASERS } from '../data/captains.js';
import { ENEMIES, enemyById } from '../data/enemies.js';
import { RELICS } from '../data/relics.js';
import { ROUTE, deckResolved, nodeAt } from '../game/run.js';
import { describe, kwTip } from '../engine/effects.js';
import { cardCost, canPlay, intentLabel, HAND_MAX } from '../engine/battle.js';

const $ = (id) => document.getElementById(id);
export const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

const TYPE_ICON = { atk: '⚔', def: '🛡', skill: '✦', mate: '⚓', finisher: '★' };
const TYPE_NAME = { atk: '攻击', def: '防御', skill: '技巧', mate: '伙伴', finisher: '终结技' };

// ===== 卡牌（手牌/奖励/查看共用）=====
export function cardNode(card, { big = false, playable = false, battle = null, onClick = null } = {}) {
  const n = el('div', `card type-${card.type} rarity-${card.rarity}${big ? ' card-big' : ''}${card.upgraded ? ' upgraded' : ''}`);
  n.dataset.cardId = card.id;
  const cost = el('div', 'card-cost', String(battle ? cardCost(battle, card) : card.cost));
  n.append(cost, el('div', 'card-name', card.name));
  const art = el('div', 'card-art', TYPE_ICON[card.type] || '✦');
  art.title = TYPE_NAME[card.type];
  n.append(art);
  const desc = el('div', 'card-desc');
  desc.textContent = describe(card);
  n.append(desc);
  if (card.keywords && card.keywords.length) {
    const kws = el('div', 'card-kws');
    for (const kw of card.keywords) {
      const k = el('span', 'kw', kw);
      k.title = kwTip(kw);
      kws.append(k);
    }
    n.append(kws);
  }
  if (battle) {
    const afford = canPlay(battle, card) && !(card.type === 'mate' && battle.player.mates.length >= 3);
    n.classList.toggle('disabled', !afford);
    if (afford && playable) n.classList.add('playable');
    if (afford) n.tabIndex = 0; // 可聚焦
  }
  if (onClick) { n.addEventListener('click', onClick); n.classList.add('clickable'); }
  return n;
}

// 卡牌放大悬浮（overlay 层）
export function showCardZoom(card) {
  const ov = $('overlay');
  ov.innerHTML = '';
  ov.append(cardNode(card, { big: true }));
  ov.hidden = false;
  ov.onclick = () => { ov.hidden = true; ov.innerHTML = ''; };
}

// ===== 船长选择 =====
export function renderCaptainList(onPick, onDeckView) {
  const box = $('captain-list');
  box.innerHTML = '';
  for (const cap of CAPTAINS) {
    const c = el('div', 'captain-card');
    const badge = el('div', 'cap-badge cap-' + cap.id, cap.title.slice(0, 1));
    badge.style.setProperty('--cap-color', cap.color);
    c.append(badge);
    c.append(el('h3', 'cap-name', cap.name));
    c.append(el('p', 'cap-style', `${cap.title} · ${cap.audience}`));
    c.append(el('p', 'cap-diff', '难度 ' + '★'.repeat(cap.difficulty)));
    c.append(el('p', 'cap-hp', `生命 ${cap.hp}`));
    c.append(el('p', 'cap-passive', '特质：' + cap.passive.desc));
    const sk = el('div', 'cap-skills');
    for (const s of cap.skills) sk.append(el('p', 'cap-skill', `${s.name}（斗志${s.cost}）：${s.desc}`));
    c.append(sk);
    const btnDeck = el('button', 'btn btn-sm', '预览初始牌组');
    btnDeck.onclick = (e) => { e.stopPropagation(); onDeckView(cap); };
    const btn = el('button', 'btn btn-primary', '选 TA 出航');
    btn.onclick = () => onPick(cap.id);
    const acts = el('div', 'cap-actions');
    acts.append(btnDeck, btn);
    c.append(acts);
    box.append(c);
  }
  // 预告槽（不可选）：东海篇之后还有更多航线
  for (const t of CAPTAIN_TEASERS) {
    const c = el('div', 'captain-card captain-teaser');
    c.append(el('div', 'cap-badge cap-locked', '？'));
    c.append(el('h3', 'cap-name', t.name));
    c.append(el('p', 'cap-style', `${t.title} · ${t.desc}`));
    box.append(c);
  }
}

// ===== 航线 =====
export function renderRoute(run, onGo) {
  $('route-captain').textContent = CAPTAINS.find((c) => c.id === run.captainId).name;
  $('route-hp').textContent = `❤ ${run.hp}/${run.hpMax}`;
  $('route-gold').textContent = `◈ ${run.gold}`;
  $('route-relics').innerHTML = '';
  for (const rid of run.relics) {
    const r = RELICS.find((x) => x.id === rid);
    if (r) { const s = el('span', 'relic-chip', r.name); s.title = r.desc; $('route-relics').append(s); }
  }
  const map = $('route-map');
  map.innerHTML = '';
  ROUTE.forEach((node, i) => {
    const nd = el('div', 'route-node' + (i < run.nodeIdx ? ' done' : i === run.nodeIdx ? ' current' : ' future'));
    const ed = node.k === 'battle' ? enemyById(node.enemy) : null;
    nd.append(el('div', 'rn-dot', node.k === 'battle'
      ? (ed ? ed.icon : '☠') : '⛺'));
    nd.append(el('div', 'rn-label', node.label));
    if (ed) nd.append(el('div', 'rn-foe', (i < run.nodeIdx ? '✓ ' : '') + ed.name));
    if (node.joins && i >= run.nodeIdx) {
      const rc = CARDS.find((c) => c.id === node.joins);
      const mate = rc && MATES[rc.ops[0].mate];
      nd.append(el('div', 'rn-join', `+ ${mate ? mate.name : '新伙伴'} 加入`));
    }
    if (i === run.nodeIdx) nd.append(el('div', 'rn-here', '你在这里'));
    map.append(nd);
  });
  // 当前节点剧情（东海篇叙事主线）
  const cur = nodeAt(run);
  const story = $('route-story');
  if (story) {
    story.textContent = cur && cur.story ? cur.story : '';
    story.hidden = !(cur && cur.story);
  }
  const last = run.nodeIdx >= ROUTE.length - 1;
  const go = $('btn-node-go');
  go.textContent = last ? '决战罗格镇！' : '前往下一站';
  go.onclick = onGo;
}

// ===== 战斗 =====
export function renderBattle(b) {
  // 敌人
  const e = b.enemy;
  $('battle-title').textContent = `${e.def.name} · 第 ${b.turn} 回合`;
  $('enemy-name').textContent = e.def.name + (e.phase2On ? '（狂怒）' : '');
  const esub = $('enemy-sub');
  if (esub) { esub.textContent = e.def.sub || ''; esub.hidden = !(e.def.sub); }
  const hpPct = Math.max(0, e.hp / e.hpMax * 100);
  $('enemy-hp-fill').style.width = hpPct + '%';
  $('enemy-hp-fill').classList.toggle('low', hpPct < 30);
  $('enemy-hp-text').textContent = `${e.hp}/${e.hpMax}`;
  const fig = $('enemy-figure');
  fig.textContent = e.def.icon || '☠';
  fig.className = 'enemy-figure' + (e.phase2On ? ' enraged' : '');
  // 意图
  const it = intentLabel(b);
  const itn = $('enemy-intent');
  itn.textContent = `${it.icon} ${it.text}`;
  itn.className = 'enemy-intent ' + (it.cls || '');
  itn.title = '敌人下一步行动';
  // 敌方状态
  const est = $('enemy-statuses');
  est.innerHTML = '';
  if (e.block > 0) est.append(el('span', 'st-chip st-block', `🛡${e.block}`));
  for (const s of e.statuses) est.append(el('span', 'st-chip st-' + s.k, `${s.k === 'weak' ? '虚弱' : '易伤'} ${s.stacks}`));
  // 敌方召唤物
  const em = $('enemy-minions');
  em.innerHTML = '';
  for (const m of e.minions) {
    if (m.hp <= 0) continue;
    const mc = el('div', 'minion-card');
    mc.append(el('div', 'mc-icon', m.def.icon || '⚔'), el('div', 'mc-name', m.def.name), el('div', 'mc-atk', `⚔${m.def.atk}`), el('div', 'mc-hp', `${m.hp}/${m.hpMax}`));
    em.append(mc);
  }
  // 玩家
  const p = b.player;
  const pPct = Math.max(0, p.hp / p.hpMax * 100);
  $('p-hp-fill').style.width = pPct + '%';
  $('p-hp-fill').classList.toggle('low', pPct < 30);
  $('p-hp-text').textContent = `${p.hp}/${p.hpMax}`;
  $('p-block').textContent = `🛡 ${p.block}`;
  $('p-energy-n').textContent = `${p.energy}/${p.energyMax}`;
  $('p-resolve-n').textContent = p.resolve;
  const rb = $('p-resolve-bar');
  rb.innerHTML = '';
  for (let i = 0; i < 10; i++) rb.append(el('span', 'r-seg' + (i < p.resolve ? ' on' : '')));
  $('n-deck').textContent = p.deck.length;
  $('n-discard').textContent = p.discard.length;
  $('n-exhaust').textContent = p.exhaust.length;
  // 船长技
  for (let i = 0; i < 2; i++) {
    const btn = $('btn-skill-' + i);
    const sk = b.captain && b.captain.skills[i];
    if (!sk) { btn.hidden = true; continue; }
    btn.hidden = false;
    btn.textContent = `${sk.name}（${sk.cost}）`;
    btn.title = sk.desc + '（每回合限一次）';
    const usable = !p.skillsUsed[i] && p.resolve >= sk.cost && !b.over;
    btn.classList.toggle('ready', usable);
    btn.disabled = !usable;
  }
  // 伙伴
  const mr = $('mate-row');
  mr.innerHTML = '';
  for (const m of p.mates) {
    if (m.hp <= 0) continue;
    const mc = el('div', 'mate-card');
    mc.append(el('div', 'mc-icon', m.def.icon || '⚓'), el('div', 'mc-name', m.def.name));
    const bar = el('div', 'bar hp-bar mate-hp');
    const fill = el('div', 'bar-fill'); fill.style.width = (m.hp / m.hpMax * 100) + '%';
    bar.append(fill, el('span', 'bar-text', `${m.hp}`));
    mc.append(bar);
    mr.append(mc);
  }
  // 羁绊提示（当前生效的伙伴羁绊）
  const bondRow = $('bond-row');
  if (bondRow) {
    bondRow.innerHTML = '';
    if (p.bondNames && p.bondNames.length) {
      for (const name of p.bondNames) bondRow.append(el('span', 'bond-chip', `🤝 ${name} 攻+${p.bondAtk}`));
      bondRow.hidden = false;
    } else bondRow.hidden = true;
  }
  renderHand(b);
}

export function renderHand(b, onPlay = null) {
  const hand = $('hand');
  hand.innerHTML = '';
  b.player.hand.forEach((card, i) => {
    const n = cardNode(card, { battle: b, playable: true });
    if (onPlay) {
      n.addEventListener('click', () => onPlay(i));
      n.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); onPlay(i); } });
    }
    hand.append(n);
  });
  hand.classList.toggle('over-max', b.player.hand.length > 7);
}

// ===== 浮字 / 抖动 / 提示 =====
export function floater(text, type = 'dmg', target = 'enemy') {
  const layer = $('float-layer');
  const f = el('div', 'floater f-' + type, text);
  const host = target === 'enemy' ? $('enemy-block') : target === 'player' ? $('p-hp-fill').closest('.ps-hp') : layer;
  if (target === 'layer' || !host) { layer.append(f); setTimeout(() => f.remove(), 1300); return; }
  const r = host.getBoundingClientRect();
  const lr = layer.getBoundingClientRect();
  f.style.left = (r.left - lr.left + r.width / 2 + (Math.random() * 40 - 20)) + 'px';
  f.style.top = (r.top - lr.top + 20) + 'px';
  layer.append(f);
  setTimeout(() => f.remove(), 1300);
}
export function shake(target = 'enemy') {
  const host = target === 'enemy' ? $('enemy-block') : $('screen-battle');
  host.classList.remove('shake');
  void host.offsetWidth; // 重置动画
  host.classList.add('shake');
}
export function toast(msg, ms = 2200) {
  const t = $('toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { t.hidden = true; }, ms);
}

// ===== 日志 =====
const LOG_TEXT = {
  play: (e) => `▶ 打出 ${e.name}（${e.cost} 能量）`,
  skill: (e) => `◆ 船长技 ${e.name}`,
  dmg: (e) => (e.side === 'e' ? `对敌造成 ${e.dealt} 伤害` : `受到 ${e.dealt} 伤害${e.blocked ? `（护盾挡 ${e.blocked}）` : ''}`),
  thorns: (e) => `反甲回敬 ${e.x}`,
  block: (e) => `${e.side === 'p' ? '获得' : '敌方获得'} ${e.x} 护盾`,
  heal: (e) => `回复 ${e.x} 生命`,
  draw: () => '抽牌', reshuffle: (e) => `弃牌堆洗回（${e.n} 张）`,
  burn: (e) => `手牌已满，${e.name} 被烧掉`,
  emergency: () => '⚠ 无牌可抽，获得应急短刀',
  exhaust: () => '', status: (e) => `施加 ${e.k === 'weak' ? '虚弱' : '易伤'} ${e.stacks}`,
  summon: (e) => (e.side === 'e' ? `敌方召唤 ${e.name}` : `${e.name} 加入战斗！`),
  mateDmg: (e) => `${e.name} 被打 ${e.x}（剩 ${e.hp}）`,
  mateDie: (e) => `${e.name} 离场`,
  mateHeal: (e) => `${e.name} 回复 ${e.x}（${e.hp}）`,
  turnStart: (e) => `—— 第 ${e.turn} 回合 ——`,
  charge: (e) => `⚠ 敌人蓄力中（${e.x} 伤害！）`,
  phase2: () => '☠ Boss 进入狂怒阶段！',
  deathSave: () => '草帽护住了你：免死！',
  win: () => '★ 敌人被击败！', lose: () => '✖ 你倒下了……',
  resolve: (e) => `斗志 +${e.n}（${e.v}）`,
  fetch: (e) => `取回 ${e.name}（费用 0）`,
  discardEnd: (e) => `弃置 ${e.name}`,
};
export function logText(e) { const f = LOG_TEXT[e.t]; return f ? f(e) : ''; }
export function appendLog(events) {
  const body = $('log-body');
  for (const e of events) {
    const txt = logText(e);
    if (!txt) continue;
    const line = el('div', 'log-line log-' + e.t + (e.side ? ' log-side-' + e.side : ''));
    line.textContent = txt;
    body.append(line);
  }
  body.scrollTop = body.scrollHeight;
}

// ===== 奖励屏 =====
export function renderReward({ title, sub, cards, relics, onPickCard, onSkip, onDone, onPickRelic, relicPicked }) {
  $('reward-title').textContent = title;
  $('reward-sub').textContent = sub || '';
  const box = $('reward-cards');
  box.innerHTML = '';
  let picked = false;
  if (cards) {
    for (const entry of cards) {
      const card = resolveCard(entry);
      if (!card) continue;
      box.append(cardNode(card, { big: true, onClick: () => { if (!picked) { picked = true; onPickCard(entry); } } }));
    }
  }
  const rr = $('relic-row');
  rr.innerHTML = '';
  if (relics && relics.length && !relicPicked) {
    rr.append(el('p', 'relic-hint', '选择一件遗物：'));
    for (const rid of relics) {
      const r = RELICS.find((x) => x.id === rid);
      if (!r) continue;
      const chip = el('button', 'relic-option', `◈ ${r.name}`);
      chip.title = r.desc;
      chip.onclick = () => { if (!picked) { picked = true; onPickRelic(rid); } };
      rr.append(chip);
    }
  }
  $('btn-skip-reward').hidden = !!relics && !relicPicked; // 遗物必须选
  $('btn-skip-reward').onclick = () => { if (!picked) { picked = true; onSkip(); } };
  const done = $('btn-reward-done');
  done.hidden = true;
  if (onDone) done.onclick = onDone;
}

// ===== 营地 =====
export function renderCamp(run, options, onAct, onLeave) {
  const box = $('camp-actions');
  box.innerHTML = '';
  for (const o of options) {
    const b = el('button', 'camp-action', o.label);
    b.disabled = !!o.disabled;
    b.onclick = () => onAct(o.k);
    box.append(b);
  }
  $('btn-leave-camp').onclick = onLeave;
}
export function renderCampPicker(kind, run, onPick, onCancel) {
  $('camp-picker').hidden = false;
  $('camp-picker-hint').textContent = kind === 'upgrade' ? '选择 1 张卡强化（获得+版）' : '选择 1 张卡移除';
  const box = $('camp-cards');
  box.innerHTML = '';
  deckResolved(run).forEach((card, i) => {
    if (kind === 'upgrade' && card.upgraded) return; // 已强化跳过
    box.append(cardNode(card, { onClick: () => onPick(i) }));
  });
  const cancel = el('button', 'btn', '取消');
  cancel.onclick = onCancel;
  box.append(cancel);
}

// ===== 终局 =====
export function renderEnd(run, onAgain, onHome) {
  const win = run.finished === 'victory';
  $('end-icon').textContent = win ? '★' : '☠';
  $('end-icon').className = 'end-icon ' + (win ? 'win' : 'lose');
  $('end-title').textContent = win ? '驶入伟大航路！' : '航程终止';
  $('end-sub').textContent = win
    ? '你闯过了罗格镇，白猎人斯摩格目送梅利号消失在暴风雨中。颠倒山就在前方——东海篇，完。'
    : '大海无情。整备牌组，再出航一次。';
  const st = $('end-stats');
  st.innerHTML = '';
  const s = run.stats;
  const rows = [['战斗场次', s.battles], ['总回合', s.turns], ['造成伤害', s.dmgDealt], ['承受伤害', s.dmgTaken], ['打出卡牌', s.cardsPlayed], ['最终金币', run.gold], ['牌组规模', run.deck.length]];
  for (const [k, v] of rows) {
    const row = el('div', 'es-row');
    row.append(el('span', 'es-k', k), el('span', 'es-v', String(v)));
    st.append(row);
  }
  $('btn-again').onclick = onAgain;
  $('btn-end-home').onclick = onHome;
}

// ===== 牌组查看 / 说明 =====
export function showDeckView(run) {
  const ov = $('overlay');
  ov.innerHTML = '';
  const panel = el('div', 'deck-view');
  panel.append(el('h3', null, `牌组（${run.deck.length} 张）`));
  const grid = el('div', 'deck-grid');
  const byIdm = new Map();
  for (const c of deckResolved(run)) {
    const key = c.id + (c.upgraded ? '+' : '');
    byIdm.set(key, (byIdm.get(key) || 0) + 1);
  }
  for (const [key, n] of byIdm) {
    const id = key.replace(/\+$/, '');
    const card = resolveCard({ id, upgraded: key.endsWith('+') });
    if (!card) continue;
    const wrap = el('div', 'deck-cell');
    const cn = cardNode(card, {});
    wrap.append(cn, el('span', 'deck-n', '×' + n));
    grid.append(wrap);
  }
  panel.append(grid);
  const close = el('button', 'btn', '关闭');
  close.onclick = () => { ov.hidden = true; ov.innerHTML = ''; };
  panel.append(close);
  ov.append(panel);
  ov.hidden = false;
}
export function showHelp() {
  const ov = $('help-modal');
  ov.innerHTML = '';
  const box = el('div', 'modal-box');
  box.append(el('h3', null, '航行指南'));
  const items = [
    ['目标', '沿东海航线 9 站：风车村 → 谢尔兹镇 → 橘子镇 → 西罗布村 → 海上餐厅 → Arlong Park → 罗格镇。击败白猎人斯摩格，驶入伟大航路。'],
    ['能量', '每回合 3 点能量，出牌消耗，回合结束回满。没花完不保留。'],
    ['手牌', '开局抽 5 张，每回合开始抽 5 张，上限 10 张。'],
    ['护盾 🛡', '吸收伤害，回合开始清空——防御卡只在当回合有用。'],
    ['斗志 ✦', '攻击命中 +2、首次承伤 +2、部分卡+斗志。攒够驱动路飞的橡胶招式（每回合各限 1 次）与「蓄力」卡强化效果。'],
    ['连击', '每打出 1 张攻击卡连击 +1；带连击的卡按当前连击数加伤（索隆的三刀流多为连击向）。'],
    ['伙伴 ⚓', '招募卡召唤伙伴占 1 个伙伴位（最多 3 位）。索隆每回合斩击、娜美补给斗志、乌索普削弱敌人、山治回复全队。'],
    ['羁绊 🤝', '特定伙伴同时在场时全队攻击获得加成：索隆+山治「死对头的较量」、乌索普+娜美「狙击×天候的连携」。'],
    ['虚弱/易伤', '虚弱：敌方伤害 -25%；易伤：敌方承伤 +50%。给敌人的 debuff，别怕用。'],
    ['意图', '敌人头顶显示下一步行动（巴基会蓄力火箭弹、克洛会无声连击）。大攻击前先叠盾或输出竞速。'],
    ['剧情节点', '部分关卡打完会有伙伴带着招募卡加入草帽一伙——不用选，直接进牌组。'],
    ['营地', '甲板休整回血 / 锻造强化卡 / 花金币移除废卡。'],
    ['战利品', '每场胜利三选一补强牌组；精英战后额外选遗物。招式按进度解锁（后期招式不会提前出现）。'],
  ];
  for (const [k, v] of items) {
    const p = el('p', 'help-item');
    p.append(el('b', null, k + '：'), document.createTextNode(v));
    box.append(p);
  }
  const close = el('button', 'btn btn-primary', '明白了');
  close.onclick = () => { ov.hidden = true; };
  box.append(close);
  ov.append(box);
  ov.hidden = false;
  ov.onclick = (e) => { if (e.target === ov) ov.hidden = true; };
}

// ===== 调试面板 =====
export function renderDebug(b, run) {
  const dp = $('debug-panel');
  if (!b && !run) { dp.hidden = true; return; }
  dp.hidden = false;
  const lines = [];
  if (run) lines.push(`run: seed=${run.seed} node=${run.nodeIdx} gold=${run.gold}`);
  if (b) lines.push(`battle: seed=${b.seed} turn=${b.turn} over=${b.over}`, `p: hp=${b.player.hp} e=${b.player.energy} r=${b.player.resolve} hand=${b.player.hand.length} deck=${b.player.deck.length} disc=${b.player.discard.length} exh=${b.player.exhaust.length}`, `e: hp=${b.enemy.hp}/${b.enemy.hpMax} intent=${b.enemy.intent ? b.enemy.intent.k : '-'} log=${b.log.length}`);
  dp.innerHTML = lines.map((l) => `<div>${l}</div>`).join('');
}
