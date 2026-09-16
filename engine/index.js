// 引擎门面：前后端同构入口
import { createGame } from './state.js';
import { startTurn } from './phases.js';

export { applyAction } from './phases.js';
export { createGame, cloneGame, powerOfUnit, leaderPower, usableDons, resolveUnit } from './state.js';
export { hasKeyword, runEffect } from './keywords.js';
export { validateDeck } from './legality.js';

// 建局并自动推进到先手 Main 阶段（含首回合 Refresh/Draw/DON!!+1）
export function newGame(opts) {
  const state = createGame(opts);
  startTurn(state);
  return state;
}
