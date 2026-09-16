// audio.js — WebAudio 合成音效（A2 线实现，零音频资源文件）
// 契约：OPTCG_AUDIO.play(name) name ∈ click|summon|attack|clash|ko|win|lose|error
//       OPTCG_AUDIO.setEnabled(bool) / isEnabled() — 与 OPTCG_SAVE.settings.sound 同步
// 规则：默认静音；首次开声在用户手势内 resume AudioContext（自动播放策略）；
//       play() 任何情况不抛异常（AudioContext 不可用 = no-op）；总时长 ≤0.6s，音量 ≤0.15。
/* global */
(function () {
  'use strict';

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
      master.gain.value = 0.15; // 音量上限
      master.connect(ctx.destination);
    } catch (e) { ctx = null; master = null; }
    return ctx;
  }
  function unlock() { // 用户手势内调用：解锁自动播放策略
    const c = ensureCtx();
    if (c && c.state === 'suspended') { try { c.resume().catch(() => {}); } catch (e) { /* */ } }
  }

  // 单音：type 波形 / f0 起始频率 / f1 结束频率（扫频）/ t0 相对起点 / dur 时长 / vol 相对音量
  function tone(type, f0, f1, t0, dur, vol) {
    const c = ctx;
    const start = c.currentTime + t0;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, start);
    if (f1 && f1 !== f0) osc.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), start + dur);
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(vol, start + 0.008);           // 快起音防爆音
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);      // 指数收尾无咔哒
    osc.connect(g); g.connect(master);
    osc.start(start); osc.stop(start + dur + 0.02);
  }
  // 噪声脉冲（clash 用）
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

  // 事件音表（全部 ≤0.6s；vol 为相对 master 的比例，峰值即 0.15 上限）
  const SOUNDS = {
    click:  () => tone('square', 720, 660, 0, 0.06, 0.5),                                    // 短促滴
    summon: () => { tone('sine', 523.25, 0, 0.00, 0.12, 0.55); tone('sine', 659.25, 0, 0.08, 0.12, 0.6); tone('sine', 783.99, 0, 0.16, 0.16, 0.65); }, // 上行琶音
    attack: () => tone('sawtooth', 210, 65, 0, 0.24, 0.55),                                  // 低频冲刺
    clash:  () => { noise(0, 0.16, 0.8, 1900); tone('triangle', 320, 110, 0, 0.14, 0.4); },  // 噪声脉冲
    ko:     () => { tone('triangle', 392, 0, 0.00, 0.14, 0.6); tone('triangle', 262, 0, 0.12, 0.14, 0.6); tone('triangle', 175, 0, 0.24, 0.20, 0.55); }, // 下行音
    win:    () => { tone('square', 523.25, 0, 0.00, 0.11, 0.35); tone('square', 659.25, 0, 0.10, 0.11, 0.35); tone('square', 783.99, 0, 0.20, 0.11, 0.35); tone('square', 1046.5, 0, 0.30, 0.24, 0.4); }, // 小 fanfare
    lose:   () => { tone('sine', 196, 0, 0.00, 0.24, 0.7); tone('sine', 146.8, 0, 0.22, 0.30, 0.7); }, // 低沉双音
    error:  () => { tone('square', 880, 0, 0.00, 0.07, 0.35); tone('square', 880, 0, 0.11, 0.07, 0.35); }, // 短蜂鸣×2
  };

  window.OPTCG_AUDIO = {
    play(name) {
      try {
        if (!enabled || typeof name !== 'string' || !SOUNDS[name]) return;
        const c = ensureCtx();
        if (!c || !master) return;
        if (c.state === 'suspended') { try { c.resume().catch(() => {}); } catch (e) { return; } }
        if (c.state !== 'running') return; // 未解锁（无手势）→ 静默跳过，绝不抛
        SOUNDS[name]();
      } catch (e) { /* 任何音频故障均 no-op */ }
    },
    setEnabled(v) {
      enabled = !!v;
      if (enabled) unlock(); // 手势内的 setEnabled(true) 顺带解锁 AudioContext
      // 与存档设置同步（幂等：面板已写则不重复落盘）
      try {
        const S = window.OPTCG_SAVE;
        if (S && S.settings && S.settings.sound !== enabled) S.set('settings', { ...S.settings, sound: enabled });
      } catch (e) { /* 存档不可用不阻断 */ }
    },
    isEnabled() { return enabled; },
  };

  // 载入时按持久化设置恢复开关（默认关）；真正发声仍需首次用户手势解锁
  try {
    const s = window.OPTCG_SAVE && window.OPTCG_SAVE.settings;
    if (s && s.sound) window.OPTCG_AUDIO.setEnabled(s.sound);
  } catch (e) { /* */ }
})();
