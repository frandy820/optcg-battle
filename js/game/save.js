// 存档：localStorage 安全降级（隐私模式/配额满/被禁 → 内存兜底，游戏仍可玩，仅刷新丢失）
import { captainById } from '../data/captains.js';

const KEY = 'gcd_save_v1';
let memStore = null; let storageOk = true;

function ls() {
  try { return window.localStorage; } catch { return null; } // 隐私模式访问即抛
}

export function saveRun(run) {
  if (!run) return false;
  try {
    const s = ls();
    if (s) { s.setItem(KEY, JSON.stringify(run)); storageOk = true; return true; }
  } catch { storageOk = false; }
  memStore = run; // 降级：内存兜底
  return false;
}

export function loadRun() {
  try {
    const s = ls();
    if (s) {
      const raw = s.getItem(KEY);
      if (raw) return revive(JSON.parse(raw));
    }
  } catch { storageOk = false; }
  if (memStore) return revive(JSON.parse(JSON.stringify(memStore)));
  return null;
}

// 结构校验：关键字段缺失/版本不符 → 视为损坏，返回 null（宁可丢档不可白屏）
// 船长 id 必须存在于当前数据（拦截旧版本存档：旧船长 deck 引用已删除的卡 id）
function revive(raw) {
  if (!raw || raw.kind !== 'run' || raw.v !== 1) return null;
  if (typeof raw.nodeIdx !== 'number' || !Array.isArray(raw.deck) || !raw.captainId) return null;
  if (!captainById(raw.captainId)) return null;
  if (raw.nodeIdx >= 9) return null; // ROUTE 长度护栏（旧 5 节点档不会到 9）
  if (typeof raw.hp !== 'number' || typeof raw.hpMax !== 'number') return null;
  raw.stats = raw.stats || { battles: 0, turns: 0, dmgDealt: 0, dmgTaken: 0, cardsPlayed: 0, playCount: {} };
  raw.relics = Array.isArray(raw.relics) ? raw.relics : [];
  return raw;
}

export function clearRun() {
  memStore = null;
  try { const s = ls(); if (s) s.removeItem(KEY); } catch { /* 降级静默 */ }
}
export const storageHealthy = () => storageOk;

// 战斗中存档：run + battle 轻量快照（engine 无函数字段，可直接序列化；rng 状态由 seed+log 长度恢复不可靠 → 战斗中刷新=重开当前战斗，进度不丢）
export function saveFull(run, battle) {
  if (!run) return false;
  const snap = battle ? { battleSnapshot: { enemyId: battle.enemy.id, turn: battle.turn } } : {};
  try {
    const s = ls();
    if (s) { s.setItem(KEY, JSON.stringify({ ...run, ...snap })); return true; }
  } catch { storageOk = false; }
  memStore = { ...run, ...snap };
  return false;
}
