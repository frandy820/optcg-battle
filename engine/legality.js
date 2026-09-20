// 牌组合法性校验（构筑器与后端共用）
// 规则：正好 50 张；颜色全部与 Leader 一致（无色卡不存在于 M1 卡池）；
//       同编号卡最多 4 张；Leader 卡不可入组；融合卡不进卡组（F13：经 t:'fuse' 动作登场）；
//       类型/字段合法性由卡池 schema 保证。
export function validateDeck(leaderDef, deckDefs) {
  const errs = [];
  if (!leaderDef || leaderDef.type !== 'leader') errs.push('invalid leader');
  if (!Array.isArray(deckDefs) || deckDefs.length !== 50) {
    errs.push(`deck size must be 50, got ${deckDefs ? deckDefs.length : 'null'}`);
    return errs;
  }
  const counts = new Map();
  for (const c of deckDefs) {
    if (!c || !c.id) { errs.push('null card in deck'); continue; }
    if (c.type === 'leader') errs.push(`leader card ${c.id} cannot be in deck`);
    if (c.fusion) errs.push(`fusion card ${c.id} cannot be in deck (融合卡经融合动作登场，不进卡组)`);
    if (leaderDef && c.color !== leaderDef.color) {
      errs.push(`card ${c.id} color ${c.color} mismatches leader color ${leaderDef.color}`);
    }
    counts.set(c.id, (counts.get(c.id) || 0) + 1);
  }
  for (const [id, n] of counts) {
    if (n > 4) errs.push(`card ${id} appears ${n} times (max 4)`);
  }
  return errs;
}
