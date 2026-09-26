// gld-audio — 双层音效（round6 R6-B：CC0 采样 body + 合成 accent 分层）
// 契约：SND.play(name[, delayMs]) name ∈ click|summon|attack|clash|ko|cast|win|lose|error
//       SND.toggle() / SND.isOn() — 开关独立键 gld_sound（默认静音），与动效开关零联动
// 分层：body=web/sfx/*.mp3（Kenney CC0 采样，2012 Pack 公有领域）；accent=轻量合成点缀
//       （琶音/低频冲刺/噪声脉冲）补采样缺失的「重量感」。采样任一环节失败=永久回退纯合成
//       （round5 原音表完整保留为 FALLBACK，行为不劣化）。
// 规则：默认静音；首次开声须在用户手势内（toggle 内 resume AudioContext 解自动播放策略）；
//       play 任何情况不抛异常（AudioContext 不可用 = no-op）；总音量 ≤0.15。
// 快进联动：延迟音效经 FXM 登记——任意点击跳终态时未发声的延迟音效一并取消（不留残响）。
'use strict';
import { FXM } from './fx-manager.js';

const KEY = 'gld_sound';
let enabled = false;
let ctx = null;      // AudioContext（懒建）
let master = null;   // 总增益（上限 0.15）

function ensureCtx() {
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.15;
    master.connect(ctx.destination);
  } catch (e) { ctx = null; master = null; }
  return ctx;
}
function unlock() {
  const c = ensureCtx();
  if (c && c.state === 'suspended') { try { c.resume().catch(() => {}); } catch (e) { /* */ } }
}

// ---------- 合成基元（accent 层与回退层共用） ----------
function tone(type, f0, f1, t0, dur, vol) {
  const c = ctx;
  const start = c.currentTime + t0;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(f0, start);
  if (f1 && f1 !== f0) osc.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), start + dur);
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(vol, start + 0.008);          // 快起音防爆音
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);    // 指数收尾无咔哒
  osc.connect(g); g.connect(master);
  osc.start(start); osc.stop(start + dur + 0.02);
}
function noise(t0, dur, vol, freq) {
  const c = ctx;
  const start = c.currentTime + t0;
  const n = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, n, c.sampleRate);
  const ch = buf.getChannelData(0);
  for (let i = 0; i < n; i++) ch[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = 0.9;
  const g = c.createGain();
  g.gain.setValueAtTime(vol, start);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  src.connect(bp); bp.connect(g); g.connect(master);
  src.start(start); src.stop(start + dur);
}

// ---------- 采样层（round6：Kenney CC0，web/sfx/<key>.mp3 共 80KB） ----------
// 时序：toggle 开声（用户手势）后才 fetch+decode；decode 完成前的几声走 FALLBACK（无感切换）。
// 任一 key 失败（404/decode 异常）→ sampleBroken=true 永久纯合成（不重试不刷请求）。
const SAMPLE_KEYS = ['click', 'summon', 'attack', 'clash', 'ko', 'cast', 'win', 'lose'];
const SAMPLE_VOL = { click: 0.85, summon: 0.9, attack: 0.95, clash: 1.0, ko: 0.95, cast: 0.8, win: 0.95, lose: 0.9 };
let buffers = null;       // null=未加载；{}=加载完成（部分 key 可缺）
let sampleBroken = false; // 永久回退标记
function loadSamples() {
  if (buffers !== null || sampleBroken) return;
  if (!ensureCtx()) { sampleBroken = true; return; }
  buffers = {};
  const dec = (window.AudioContext || window.webkitAudioContext)
    ? (ab) => new Promise((res, rej) => ctx.decodeAudioData(ab, res, rej)) // 旧 Safari 回调签名
    : null;
  if (!dec) { sampleBroken = true; return; }
  Promise.all(SAMPLE_KEYS.map(k =>
    fetch(`sfx/${k}.mp3`).then(r => { if (!r.ok) throw new Error('http ' + r.status); return r.arrayBuffer(); })
      .then(dec)
      .then(buf => { buffers[k] = buf; })
      .catch(() => { sampleBroken = true; })
  ));
}
function playSample(name) {
  const buf = buffers && buffers[name];
  if (!buf) return false;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const g = ctx.createGain();
  g.gain.value = SAMPLE_VOL[name] || 0.9;
  src.connect(g); g.connect(master);
  try { src.start(); } catch (e) { return false; }
  return true;
}

// ---------- 事件音表 ----------
// acc=采样可用时的合成点缀（音量已减薄，补重量感）；full=采样不可用/无采样 key 的完整合成。
// WIN/LOSE 用纯采样（jingle 本身完整）；cast=fx-cast 发动新增挂点。
const SOUNDS = {
  click: {
    acc: null,
    full: () => tone('square', 720, 660, 0, 0.06, 0.5),
  },
  summon: {
    acc: () => { tone('sine', 659.25, 0, 0.08, 0.10, 0.28); tone('sine', 783.99, 0, 0.16, 0.12, 0.30); },
    full: () => { tone('sine', 523.25, 0, 0.00, 0.12, 0.55); tone('sine', 659.25, 0, 0.08, 0.12, 0.6); tone('sine', 783.99, 0, 0.16, 0.16, 0.65); },
  },
  attack: {
    acc: () => tone('sawtooth', 210, 65, 0, 0.24, 0.35), // 低频冲刺点缀（采样=刀刃呼啸）
    full: () => tone('sawtooth', 210, 65, 0, 0.24, 0.55),
  },
  clash: {
    acc: () => { noise(0, 0.14, 0.4, 1900); tone('triangle', 320, 110, 0, 0.12, 0.30); },
    full: () => { noise(0, 0.16, 0.8, 1900); tone('triangle', 320, 110, 0, 0.14, 0.4); },
  },
  ko: {
    acc: () => { tone('triangle', 262, 0, 0, 0.12, 0.30); tone('triangle', 175, 0, 0.10, 0.16, 0.30); },
    full: () => { tone('triangle', 392, 0, 0.00, 0.14, 0.6); tone('triangle', 262, 0, 0.12, 0.14, 0.6); tone('triangle', 175, 0, 0.24, 0.20, 0.55); },
  },
  cast: {
    acc: null,
    full: () => tone('sine', 660, 990, 0, 0.16, 0.35),
  },
  win: {
    acc: null,
    full: () => { tone('square', 523.25, 0, 0.00, 0.11, 0.35); tone('square', 659.25, 0, 0.10, 0.11, 0.35); tone('square', 783.99, 0, 0.20, 0.11, 0.35); tone('square', 1046.5, 0, 0.30, 0.24, 0.4); },
  },
  lose: {
    acc: null,
    full: () => { tone('sine', 196, 0, 0.00, 0.24, 0.7); tone('sine', 146.8, 0, 0.22, 0.30, 0.7); },
  },
  error: {
    acc: null,
    full: () => { tone('square', 880, 0, 0.00, 0.07, 0.35); tone('square', 880, 0, 0.11, 0.07, 0.35); },
  },
};

function now(name) {
  try {
    if (!enabled || typeof name !== 'string' || !SOUNDS[name]) return;
    const c = ensureCtx();
    if (!c || !master) return;
    if (c.state !== 'running') return; // 未解锁（无手势）→ 静默跳过，绝不抛
    const s = SOUNDS[name];
    const sampled = !sampleBroken && buffers && playSample(name);
    if (sampled) { if (s.acc) s.acc(); return; }
    s.full(); // 回退：round5 纯合成
  } catch (e) { /* 任何音频故障均 no-op */ }
}

export const SND = {
  play(name, delay = 0) {
    if (!enabled || delay <= 0) return now(name);
    // 延迟音效（随 hit-stop 等排程）：句柄经 FXM 登记——点击快进时未发声的直接取消
    let fired = false;
    const t = setTimeout(() => { fired = true; now(name); }, delay);
    FXM.register({ id: 'snd', dur: delay, onDone: () => { if (!fired) clearTimeout(t); } });
  },
  toggle() {
    enabled = !enabled;
    try { localStorage.setItem(KEY, enabled ? '1' : '0'); } catch (e) { /* */ }
    if (enabled) { unlock(); loadSamples(); } // 手势内开声：解锁 AudioContext + 拉采样
    return enabled;
  },
  isOn() { return enabled; },
  // E2E/调试：采样层状态（'none'=未加载 'ready' 'broken'）
  sampleState() {
    if (sampleBroken) return 'broken';
    if (!buffers) return 'none';
    return Object.keys(buffers).length ? 'ready' : 'pending';
  },
};

// 载入时按持久化设置恢复（默认关）；真正发声仍需首次用户手势解锁。
// 已开声的回访（enabled=true）也在此拉采样——非手势上下文 fetch 合法，decode 同步可用，
// 之后任意手势触发 play 即有采样。
try {
  enabled = localStorage.getItem(KEY) === '1';
  if (enabled) loadSamples();
} catch (e) { /* */ }
