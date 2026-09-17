// 牌局状态结构与创建。纯数据，无方法——便于克隆/序列化/联机传输。
import { makeRng, shuffle } from './rng.js';

export const START_HAND = 5;   // 起手抽 5
export const DON_DECK_SIZE = 10;
export const BOARD_LIMIT = 5;  // 角色区上限
export const DON_CAP = 10;     // 全场 DON!! 上限

// leaderDef / cardDef 均为 data 层的静态定义（见 data/cards.json）
// 卡上 effect 为声明式对象：{ hook: 'onPlay'|'whenAttacking'|'onKO'|'trigger', op: {...} }
export function createGame({ leaderA, deckA, leaderB, deckB, seed = 1 }) {
  if (deckA.length !== 50 || deckB.length !== 50) throw new Error('deck must be 50 cards');
  const rng = makeRng(seed);
  const players = [
    mkPlayer(0, leaderA, deckA, rng),
    mkPlayer(1, leaderB, deckB, rng),
  ];

  return {
    seed,
    rng: null,             // rng 不可序列化；克隆时外部重建（见 cloneGame）
    turn: 1,
    active: 0,             // 先手固定 0 号（联机时由房间分配）
    firstTurn: true,       // 全局第一回合：先手 DON!! 阶段只 +1
    pending: null,         // 响应窗口 { kind:'block'|'counter', ... }
    winner: null,
    winReason: null,
    players,
    log: [],
  };
}

function mkPlayer(id, leaderDef, deckDefs, rng) {
  let deck = shuffle(deckDefs, rng);
  const hand = deck.slice(0, START_HAND);
  deck = deck.slice(START_HAND);
  return {
    id,
    leader: { ...leaderDef, rest: false, dons: 0, buffs: [] },
    lp: leaderDef.life * 2000, // LP 积分（游戏王式：原生命卡 ×2000 折算，LP≤0 判负）
    deck,                  // 牌组（顶在尾部 pop）
    hand,                  // 手牌
    donDeck: DON_DECK_SIZE,
    donArea: [],           // { id, rest, attached: null|{type:'leader'|'char', idx} }
    board: [],             // { ...cardDef, rest, playedTurn, dons, buffs }
    stage: null,           // { ...cardDef }
    trash: [],
  };
}

// 深克隆（rng 除外——由调用方按需重建并注入）
export function cloneGame(state) {
  const s = JSON.parse(JSON.stringify(state));
  return s;
}

// ===== 查询辅助（纯函数） =====

export function powerOfUnit(unit) {
  if (!unit) return 0;
  const buff = unit.buffs.reduce((n, b) => n + b.x, 0);
  return unit.power + unit.dons * 1000 + buff;
}

export function leaderPower(pl) {
  const buff = pl.leader.buffs.reduce((n, b) => n + b.x, 0);
  return pl.leader.power + pl.leader.dons * 1000 + buff;
}

// 可用（未横置、未附着）DON!! 数量
export function usableDons(pl) {
  return pl.donArea.filter((d) => !d.rest && !d.attached).length;
}

// 场上单位引用统一解析：{ side, type:'leader'|'char', idx }
export function resolveUnit(state, ref) {
  const pl = state.players[ref.side];
  if (ref.type === 'leader') return pl.leader;
  return pl.board[ref.idx];
}

export function logEvent(state, ev) {
  state.log.push(ev);
  return ev;
}
