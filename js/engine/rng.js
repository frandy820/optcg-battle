// 种子随机（mulberry32）：同 seed 同调用序=同结果（可复现测试锚点）
export function makeRng(seed) {
  let a = (seed >>> 0) || 1;
  return function rng() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// Fisher-Yates 洗牌（rng 驱动，可复现）
export function shuffle(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
// 加权抽取：items=[{weight,...}]，返回被选项（rng 可复现）
export function weightedPick(items, rng) {
  const total = items.reduce((n, it) => n + (it.weight || 1), 0);
  let r = rng() * total;
  for (const it of items) { r -= (it.weight || 1); if (r <= 0) return it; }
  return items[items.length - 1];
}
