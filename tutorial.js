// 新手教学（Phase 5）——三段渐进：①登场与战斗 ②招式 ③伏笔与响应窗口
// 设计约束：真实点击驱动（check 验证局面而非按钮点击）；可跳过/重看；教学局不落档不写通关（duel-ui 配合）。
// 教学局仍走 applyAction 合法路径（AI 用剧本而非 aiStep）。
'use strict';
import { DUEL } from './duel/engine.js?v=d3b3635';

// 固定起手：通过注入手牌实现确定性（不走洗牌运气）
const HAND1 = ['DUE-001', 'DUE-003'];            // T1：路飞+娜美
const HAND2 = ['DUE-001', 'DUE-201', 'DUE-202']; // T2：路飞+鬼斩+雷光
const HAND3 = ['DUE-005', 'DUE-301', 'DUE-003']; // T3：山治+狼蛛星+娜美
const AI_T3_ATTACKER = 'DUE-102';                 // T3：AI 蒙卡（1800 攻山治 1500 → 狼蛛星-800 反杀）

export const TUTORIALS = [
  {
    id: 1, name: '登场与战斗', minutes: '约 1 分钟',
    intro: '目标：学会①通常登场 ②推进阶段 ③攻击。按黄色指令条的提示一步步点。',
    myHand: HAND1, foeDeck: Array(20).fill('DUE-006'),
    steps: [
      { say: '点击手牌中的「蒙奇·D·路飞」直接登场（默认攻击表示，点一下就上）。', check: g => g.players[0].board.some(u => u.cardId === 'DUE-001') },
      { say: '登场成功！路飞的能力自动触发了 ⚡橡胶火箭炮（看战报，对方 LP-300）。重要规则：本回合登场的人物不能攻击——点「下一步」进入战斗阶段看看。', check: g => g.phase === 'battle' },
      { say: '战斗阶段中路飞灰着不可点（登场回合不能攻）。没关系：连续点「下一步」→ 主要2 → 结束回合，把回合交给对方。', check: (g, st) => st.turnPassed },
      { say: '对方虚度了回合（陪练不出场）。先点「下一步」进入战斗阶段，再点你场上的路飞——选中后点出现的「⚔ 直接攻击」红色按钮（注意：主要阶段点人物=切换表示，别点错）。', check: (g, st) => st.directDone },
      { say: '直接攻击命中 1900！对方只剩 1800——再连续「下一步」交回合，下回合再直攻一次即可获胜。', check: g => g.winner === 0 },
    ],
  },
  {
    id: 2, name: '招式卡', minutes: '约 2 分钟',
    intro: '目标：学会①发动通常招式 ②装备招式。招式卡有红色「招」角标。',
    myHand: HAND2, foeDeck: Array(20).fill('DUE-104'),
    steps: [
      { say: '先登场路飞（点手牌即可）。登场回合不能攻击，先把回合交出去：连续「下一步」直到「结束回合 ✓」。', check: (g, st) => st.turnPassed && g.players[0].board.some(u => u.cardId === 'DUE-001') },
      { say: '对方登场了总队长阿金（ATK1100）。现在点手牌「三刀流·鬼斩」（红角标招式卡），目标选你自己的路飞——ATK+800（增益到回合结束有效）！', check: g => (g.players[0].board[0]?.buffs || []).some(b => b.stat === 'atk' && b.amount === 800) },
      { say: '招式发动成功！点「下一步」进入战斗阶段，点路飞攻击阿金——2700 碾压 1100。', check: (g, st) => st.attackResolved },
      { say: '战斗获胜，这类「通常招式」用一次进墓场。点「下一步」回到主要阶段2，点手牌「雷光·天候」选「🂠 盖伏」。', check: g => g.players[0].spells.some(s => s.cardId === 'DUE-202' && s.set) },
      { say: '盖伏的招式之后可随时点击翻开发动。教学 2 完成！', check: () => true, final: true },
    ],
  },
  {
    id: 3, name: '伏笔与响应窗口', minutes: '约 2 分钟',
    intro: '目标：学会①盖伏伏笔（紫角标） ②在响应窗口反制。这是以弱胜强的关键！',
    myHand: HAND3, foeDeck: Array(20).fill(AI_T3_ATTACKER),
    steps: [
      { say: '点击手牌「必杀·狼蛛星」（紫角标伏笔卡），选「🂠 盖伏到伏笔区」。', check: g => g.players[0].spells.some(s => s.cardId === 'DUE-301' && s.set) },
      { say: '盖伏完成。注意：盖伏的当回合不能发动。现在登场山治（点手牌即可），然后连续「下一步」结束回合。', check: (g, st) => st.turnPassed },
      { say: '对方登场了斧手蒙卡（ATK1800，比山治 1500 强）——但本回合它不能攻击。把回合交出去，等它动手的瞬间，顶部会弹出红色「响应窗口」横幅！', check: (g, st) => st.responded || g.winner !== null },
      { say: '狼蛛星让蒙卡 ATK-800（1800→1000 < 山治 1500）——攻击被反杀！这就是伏笔的威力。完成教学，去闯东海篇吧！', check: (g, st) => st.attackResolved || g.winner !== null, final: true },
    ],
  },
];

// 教学局构造：固定手牌+教学专用配置（deck 填充至 20 张保证抽牌不空）
export function newTutorialGame(cardsById, tutId) {
  const tut = TUTORIALS.find(t => t.id === tutId);
  if (!tut) throw new Error('unknown tutorial ' + tutId);
  const myDeck = [...tut.myHand, ...Array(20 - tut.myHand.length).fill('DUE-003')];
  const g = DUEL.newGame(cardsById, {
    seed: 20260924 + tutId, decks: [myDeck, tut.foeDeck],
    names: ['你（教学）', '教学陪练'], aiProfile: 'aggro',
  });
  g.tutorial = tutId; // 标记：教学局（duel-ui 依此跳过存档/走剧本 AI）
  // 确定性起手：把 newGame 抽出的 5 张放回牌底，手牌直接替换为设计手牌（教学不靠洗牌运气）
  const p0 = g.players[0];
  p0.deck.push(...p0.hand.map(h => h.cardId));
  p0.hand = tut.myHand.map((cid, i) => ({ uid: 'th' + i, cardId: cid }));
  const p1 = g.players[1];
  p1.deck.push(...p1.hand.map(h => h.cardId));
  p1.hand = [];
  return { g, tut };
}

// 教学 AI 剧本（替代 aiStep）：陪练按段行动
// T1：从不登场，回合直接过（让玩家直攻取胜）
// T2：不登场（foeDeck 全阿金也不登场）——招式教学不需要对手怪……步2 要攻击目标：改成 T2 AI 登场一次阿金(1100) 供路飞 1900+800 打
// T3：第 1 个 AI 回合登场蒙卡（本回合登场不可攻=引擎规则）；下一 AI 回合攻击山治触发窗口
export function tutorialAiStep(g, cardsById) {
  const pi = 1;
  if (g.pending) {
    // 教学段 3 的窗口：AI 永远不响应（让玩家学会反制）
    return { t: 'pass' };
  }
  if (g.active !== pi) return null;
  const tut = g.tutorial;
  if (g.phase === 'main1' || g.phase === 'main2') {
    if (tut === 2 && g.players[1].board.length === 0 && g.players[1].summoned === 0
        && g.players[1].hand.length > 0) {
      const h = g.players[1].hand[0];
      return { t: 'summon', handUid: h.uid, pos: 'atk', tributes: [] };
    }
    if (tut === 3 && g.players[1].board.length === 0 && g.players[1].summoned === 0 && g.players[1].deck.length) {
      const cid = g.players[1].deck[0];
      if (cardsById[cid] && cardsById[cid].type === 'char') {
        const uid = 'tai1';
        g.players[1].hand.push({ uid, cardId: cid });
        g.players[1].deck.shift();
        return { t: 'summon', handUid: uid, pos: 'atk', tributes: [] };
      }
    }
    return { t: 'nextPhase' };
  }
  if (g.phase === 'battle') {
    // T3：优先攻击山治（触发窗口）；攻击者须通过 canAttack（本回合登场者不能攻——引擎规则）
    const tgt = g.players[0].board.find(u => u.cardId === 'DUE-005') || g.players[0].board[0];
    const atkU = tgt && g.players[1].board.find(u => DUEL.canAttack(g, cardsById, 1, u.uid, tgt.uid).ok);
    if (atkU) return { t: 'attack', uid: atkU.uid, target: tgt.uid };
    return { t: 'nextPhase' };
  }
  if (g.phase === 'end') return { t: 'endTurn' };
  return { t: 'nextPhase' };
}

export default TUTORIALS;
