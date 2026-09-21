// 默认卡组构造：费段配额对齐 + 段内均匀步长采样
// 背景：旧实现「每卡×4 轮次交错后取前 50」在池扩到 82-85 张/色后 = 池序前 50 张各 1 张，
// char 续号把 event/stage/gear 全挤出默认组，且各色进组新卡服从号序段偏移 → 色间失衡被放大。
// P2 扩池至 988 张后实测（balance-sim 100 局）：纯 id 步长采样把各色池的随机 op 倾斜带进卡组
// （紫色卡组 damageLP/doubleAttack/banish 全 0 → 绿v紫 84% 全场最宽带宽）。
// 修法：char46 按固定费段配额构造（1-8 费 = 4/8/10/10/6/4/2/2），段不足向相邻段借；
// 段内步长均匀取样——色间卡组费用曲线强制同构，差异只留词条/效果/阵型风格，确定性（无 rng）。
const COST_PLAN = [[1, 4], [2, 8], [3, 10], [4, 10], [5, 6], [6, 4], [7, 2], [8, 2]]; // 合计 46

export function deckOf(pool, color) {
  // F13：带 fusion 字段的卡不进卡组（只能经 t:'fuse' 动作登场），char46 采样自然不含融合卡
  const cs = pool.cards.filter((c) => c.color === color && !c.fusion);
  const chars = cs.filter((c) => c.type === 'char');
  const byCost = {};
  for (const c of chars) (byCost[c.cost] = byCost[c.cost] || []).push(c);
  // 段内按 id 稳定排序后步长取样（确定性：同池同结果；len<n 时 round-robin 补齐，每卡≤2 份）
  const takeFrom = (arr, n) => {
    const t = [...arr].sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
    const out = [];
    for (let i = 0; i < n && t.length; i++) out.push(t[Math.floor((i * t.length) / n) % t.length]);
    return out;
  };
  const deck = [];
  for (const [cost, want] of COST_PLAN) {
    const seg = byCost[cost] || [];
    deck.push(...takeFrom(seg, Math.min(want, seg.length))); // 段不足先全取（保曲线），缺口下方统一补
  }
  if (deck.length < 46) {
    // 缺口补齐：剩余卡按费用升序（贴近低费缺口优先；高费段池内普遍充足不至缺）
    const have = new Set(deck.map((c) => c.id));
    const rest = chars.filter((c) => !have.has(c.id)).sort((a, b) => a.cost - b.cost || a.id.localeCompare(b.id, 'en', { numeric: true }));
    deck.push(...takeFrom(rest, 46 - deck.length));
  }
  const gears = cs.filter((c) => c.type === 'gear');
  return [...deck.slice(0, 46), ...takeFrom(gears, 4)];
}
