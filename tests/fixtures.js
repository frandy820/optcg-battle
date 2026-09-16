// 测试夹具：可控的卡定义与牌局搭建
export function mkLeader(id = 'L0', color = 'red', life = 4, power = 5000, extra = {}) {
  return { id, name: id, type: 'leader', color, life, power, keywords: [], effect: null, ...extra };
}

export function mkChar(id, color = 'red', cost = 1, power = 2000, extra = {}) {
  return { id, name: id, type: 'char', color, cost, power, counter: null, keywords: [], effect: null, ...extra };
}

export function mkEvent(id, color = 'red', cost = 1, effect) {
  return { id, name: id, type: 'event', color, cost, power: null, counter: null, keywords: [], effect };
}

export function mkStage(id, color = 'red', cost = 1, effect) {
  return { id, name: id, type: 'stage', color, cost, power: null, counter: null, keywords: [], effect };
}

// 50 张同色填充牌组（可掺入指定卡）
export function mkDeck(color, extras = []) {
  const fillers = [];
  for (let i = 0; i < 50; i++) {
    fillers.push(mkChar(`F${color}${i}`, color, 1, 2000));
  }
  const deck = [...fillers, ...extras].slice(0, 50);
  return deck;
}

// 直接摆手牌：newGame 后覆盖（引擎是纯数据，测试可任意重构）
export function setHand(state, side, cards) {
  state.players[side].hand = cards.slice();
}
