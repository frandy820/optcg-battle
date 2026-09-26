// 演出快进终态管理器（round5 C1）
// 单一注册表收敛所有可中断演出：任意 pointerdown → 全部跳终态（快进≠丢信息——引擎结算
// 早已完成，演出纯滞后层）。无限循环动画（glowDrift/swordIdle）不登记、不可快进。
// finish 优先 el.getAnimations().finish()（CSSAnimation.finish() 跳终态并触发 animationend，
// 天然复用现有自清逻辑）；无动画对象/旧 WebView 缺 getAnimations 时兜底「移除动画类+直调 onDone」。
'use strict';

const registry = new Map(); // id -> { id, el, cls, onDone, timeoutId }
let lastDur = 0;            // 最近一次登记的演出时长（AI 步间取走即清零，防普通步残留等待）
let seq = 0;

function register({ id, el = null, cls = '', dur = 0, onDone = null }) {
  const key = id || 'fx' + (++seq);
  if (registry.has(key)) finish(key); // 同名重播：先终态旧的
  if (cls && el) el.classList.add(cls);
  const e = { id: key, el, cls, onDone, timeoutId: null };
  e.timeoutId = setTimeout(() => finish(e), dur + 500); // 兜底自清（animationend 之外的保险）
  registry.set(key, e);
  lastDur = Math.max(lastDur, dur);
  return key;
}

function finish(entry) {
  const e = typeof entry === 'string' ? registry.get(entry) : entry;
  if (!e || !registry.has(e.id)) return; // 幂等
  registry.delete(e.id);
  clearTimeout(e.timeoutId);
  if (e.el && typeof e.el.getAnimations === 'function') {
    for (const a of e.el.getAnimations()) { try { a.finish(); } catch (err) { /* infinite 动画 finish 会抛错，忽略 */ } }
  }
  if (e.cls && e.el) e.el.classList.remove(e.cls);
  if (e.onDone) { try { e.onDone(); } catch (err) { /* 演出回调不得炸主流程 */ } }
}

function finishAll() { for (const e of [...registry.values()]) finish(e); }

// AI 步进间隔用：返回最近一次登记的 dur 并清零（下一步若没有新演出即回落 620 基线）
function lastDurTake() { const v = lastDur; lastDur = 0; return v; }

// 全局快进：点击（含落在游戏元素上的）即全部演出终态；capture 保证先于游戏处理器也无妨——
// 演出层本就 pointer-events:none，游戏点击不受影响；passive+不 preventDefault。
document.addEventListener('pointerdown', finishAll, { capture: true, passive: true });

export const FXM = { register, finish, finishAll, lastDurTake };
