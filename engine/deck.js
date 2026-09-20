// 默认卡组构造：分层均匀采样（POOL-3 扩池后 deckOf 的顺序敏感问题修复）
// 背景：旧实现「每卡×4 轮次交错后取前 50」在池扩到 82-85 张/色后 = 池序前 50 张各 1 张，
// char 续号把 event/stage/gear 全挤出默认组（koWeakest/damageLP/healLP 等关键 event 永不可达），
// 且各色进组新卡服从号序段偏移 → 色间失衡被放大（500 卡池 balance-sim 9 越带根因）。
// G1a（2026-09-20）：event/stage 全删（对战只留角色与装备），默认组改 char46+gear4=50；
// 类型内均匀步长取样，确定性（无 rng，回放/测试可复现），每色默认组结构一致。
export function deckOf(pool, color) {
  // F13：带 fusion 字段的卡不进卡组（只能经 t:'fuse' 动作登场），char46 采样自然不含融合卡
  const cs = pool.cards.filter((c) => c.color === color && !c.fusion);
  const pick = (type, n) => {
    const t = cs.filter((c) => c.type === type);
    const out = [];
    for (let i = 0; i < n && t.length; i++) {
      out.push(t[Math.floor((i * t.length) / n) % t.length]); // 均匀步长；len<n 时 round-robin 补齐（每卡≤2 份）
    }
    return out;
  };
  return [...pick('char', 46), ...pick('gear', 4)];
}
