// save.js — 存档系统 v2（A2 线实现）
// 契约（A2/A3 共同遵守，改名须两线同步）：
//   OPTCG_SAVE.get(key) / set(key, val)      — 带版本/校验的读写
//   OPTCG_SAVE.settings                      — { sound:false, reducedMotion:false, compact:false }
//   OPTCG_SAVE.onSettingsChange(fn)          — 设置变更订阅
//   OPTCG_SAVE.autosave(snap)                — 对局快照 {g, ctx, level, ts} | null（终局传 null 清除）
//   OPTCG_SAVE.hasUnfinished()               — bool
//   OPTCG_SAVE.resume()                      — 恢复对局：内部调 OPTCG_GAME.restoreFromSnapshot(snap)
//   OPTCG_SAVE.exportAll() / importAll(json) — 备份/恢复
//   OPTCG_SAVE.resetAll()                    — 备份后重置（须先 UI 确认）
// 追加（非契约、纯新增）：.degraded / .matchInfo() / .backups() / .VERSION
//
// 存储布局：
//   optcg_save_v2   = { schemaVersion:2, savedAt, data:{ decks, deckSel, ladder, survival, uid, settings, extras } }（唯一真值源）
//   optcg_decks / optcg_deck_sel / optcg_ladder / optcg_survival / optcg_uid
//                    = 原始 JSON 镜像（v1 键，永久保留不删——兼容 selftest.html 等裸读方；每次写入同步刷新）
//   optcg_match_v2  = 对局快照 {g, ctx, level, ts}
//   optcg_backup_<ts> / optcg_backup_reset_<ts> = 损坏键备份 / 重置前全量备份（各保留最近 10/5 份）
/* global */
(function () {
  'use strict';

  const VERSION = '0.1.0'; // package.json
  // 统一反馈层（game.js 提供；加载早于 game.js 时仅点击后才用到，届时已就绪）
  const UI = () => window.OPTCG_UI || { toast: (m) => console.log('[toast]', m), confirm: async () => false };
  const ENVELOPE_KEY = 'optcg_save_v2';
  const MATCH_KEY = 'optcg_match_v2';
  const MATCH_TTL = 24 * 60 * 60 * 1000;   // 快照 24h 视为放弃
  const MATCH_MAX_BYTES = 256 * 1024;      // 快照大小保护
  const PREFIX = 'optcg_';
  const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'black'];
  const LEVELS = ['easy', 'normal', 'hard'];

  const DEFAULT_SETTINGS = { sound: false, reducedMotion: false, compact: false };
  const DEFAULTS = {
    decks: [],                                    // [{id, name, color, counts:{cardId:1..4}}]
    deckSel: '',                                  // 选中卡组 id 字符串
    ladder: { score: 0, wins: 0, losses: 0 },
    survival: { streak: 0, level: 'easy', best: 0 },
    uid: null,                                    // 云端用户 id（首次访问生成）
    settings: { ...DEFAULT_SETTINGS },
  };
  // v1 旧键 → v2 字段（迁移 + 双写镜像）
  const LEGACY = { optcg_decks: 'decks', optcg_deck_sel: 'deckSel', optcg_ladder: 'ladder', optcg_survival: 'survival', optcg_uid: 'uid' };

  // ===== 底层存储（localStorage 不可用 → 内存降级，绝不抛异常）=====
  let degraded = false;
  const mem = new Map();
  function detectStorage() {
    try {
      const k = 'optcg__probe';
      localStorage.setItem(k, '1'); localStorage.removeItem(k);
      return true;
    } catch (e) { return false; }
  }
  degraded = (typeof localStorage !== 'undefined') && !detectStorage();
  function rawGet(k) {
    if (degraded) return mem.has(k) ? mem.get(k) : null;
    try { return localStorage.getItem(k); } catch (e) { degraded = true; return mem.has(k) ? mem.get(k) : null; }
  }
  function rawSet(k, v) {
    if (degraded) { mem.set(k, v); return true; }
    try { localStorage.setItem(k, v); return true; }
    catch (e) { degraded = true; mem.set(k, v); return true; } // 配额满/禁用：内存兜底，流程不断
    // eslint-disable-next-line no-unreachable
    return false;
  }
  function rawRemove(k) {
    if (degraded) { mem.delete(k); return; }
    try { localStorage.removeItem(k); } catch (e) { mem.delete(k); }
    mem.delete(k);
  }
  function rawKeys() {
    let ks = [];
    if (!degraded) { try { ks = Object.keys(localStorage); } catch (e) { degraded = true; } }
    if (degraded) ks = Array.from(mem.keys());
    return ks;
  }

  // ===== 校验器（逐键：结构不对/数值越界 = 损坏 → 备份 + 默认值）=====
  const isInt = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;
  const VALIDATORS = {
    decks(v) {
      if (!Array.isArray(v) || v.length > 200) return null;
      const out = [];
      for (const d of v) {
        if (!d || typeof d !== 'object') return null;
        if (!(typeof d.id === 'number' || (typeof d.id === 'string' && /^[\w-]{1,32}$/.test(d.id)))) return null;
        if (typeof d.name !== 'string' || !d.name || d.name.length > 64) return null;
        if (!COLORS.includes(d.color)) return null;
        if (!d.counts || typeof d.counts !== 'object' || Array.isArray(d.counts)) return null;
        const counts = {};
        let total = 0;
        for (const [cid, n] of Object.entries(d.counts)) {
          if (typeof cid !== 'string' || !cid) return null;
          if (!isInt(n, 1, 4)) return null;
          counts[cid] = n; total += n;
        }
        if (total < 1 || total > 200) return null;
        out.push({ id: d.id, name: d.name, color: d.color, counts });
      }
      return out;
    },
    deckSel(v) {
      if (typeof v !== 'string' || v.length > 64 || !/^[\w:-]*$/.test(v)) return null;
      return v;
    },
    ladder(v) {
      if (!v || typeof v !== 'object' || Array.isArray(v)) return null;
      if (!isInt(v.score, 0, 999999) || !isInt(v.wins, 0, 999999) || !isInt(v.losses, 0, 999999)) return null;
      return { score: v.score, wins: v.wins, losses: v.losses };
    },
    survival(v) {
      if (!v || typeof v !== 'object' || Array.isArray(v)) return null;
      if (!isInt(v.streak, 0, 999999) || !isInt(v.best, 0, 999999) || !LEVELS.includes(v.level)) return null;
      return { streak: v.streak, level: v.level, best: v.best };
    },
    uid(v) {
      if (v === null || v === undefined) return null; // 合法：未生成
      if (typeof v !== 'string' || !/^[\w-]{1,64}$/.test(v)) return null;
      return v;
    },
    settings(v) {
      if (!v || typeof v !== 'object' || Array.isArray(v)) return null;
      const b = (x) => x === true; // 非布尔字段安全忽略，视为 false
      return { sound: b(v.sound), reducedMotion: b(v.reducedMotion), compact: b(v.compact) };
    },
  };

  // ===== 损坏备份 =====
  const corruptEvents = []; // {at, key, reason, backupKey}
  let lastBkTs = 0; // 备份键时间戳单调递增：同毫秒多键损坏时不互相覆盖
  function backupValue(tag, payload) {
    try {
      let ts = Date.now();
      if (ts <= lastBkTs) ts = lastBkTs + 1;
      lastBkTs = ts;
      const key = 'optcg_backup_' + tag + '_' + ts;
      rawSet(key, typeof payload === 'string' ? payload : JSON.stringify(payload));
      pruneBackups();
      return key;
    } catch (e) { return null; }
  }
  function pruneBackups() {
    const fams = [
      { re: /^optcg_backup_\d+$/, keep: 10 },
      { re: /^optcg_backup_reset_\d+$/, keep: 5 },
      { re: /^optcg_backup_corrupt_\d+$/, keep: 10 },
    ];
    for (const f of fams) {
      const ks = rawKeys().filter((k) => f.re.test(k)).sort(); // 时间戳字典序
      while (ks.length > f.keep) rawRemove(ks.shift());
    }
  }

  // ===== 信封（唯一真值源）=====
  let data = structuredCloneData(DEFAULTS); // { decks, deckSel, ..., extras:{} }

  function structuredCloneData(d) {
    return JSON.parse(JSON.stringify({ ...d, extras: {} }));
  }
  function normalizeKey(k) {
    let key = String(k);
    if (LEGACY[key]) key = LEGACY[key];
    else if (key.startsWith(PREFIX)) key = key.slice(PREFIX.length);
    return key;
  }
  function readEnvelope() {
    const raw = rawGet(ENVELOPE_KEY);
    if (raw === null || raw === undefined) return null;
    let env = null;
    try { env = JSON.parse(raw); } catch (e) { env = null; }
    if (!env || typeof env !== 'object' || Array.isArray(env)) {
      backupValue('corrupt', { reason: 'envelope-unparsable', raw: String(raw).slice(0, 4096) });
      corruptEvents.push({ at: Date.now(), key: ENVELOPE_KEY, reason: '信封不可解析', backupKey: null });
      return null;
    }
    if (env.schemaVersion !== 2) {
      backupValue('corrupt', { reason: 'envelope-version:' + env.schemaVersion, env });
      corruptEvents.push({ at: Date.now(), key: ENVELOPE_KEY, reason: 'schemaVersion=' + env.schemaVersion, backupKey: null });
      return null;
    }
    return env;
  }
  // 校验单个字段：通过 → 校验值；损坏 → 备份原值 + 记事件 + 返回 null（由调用方落默认）
  function validateField(field, value) {
    const valid = VALIDATORS[field](value);
    if (valid !== null) return { ok: true, value: valid };
    backupValue('corrupt', { at: Date.now(), key: field, reason: '结构/数值校验失败', value });
    corruptEvents.push({ at: Date.now(), key: field, reason: '校验失败，已恢复默认（原值已备份）' });
    return { ok: false, value: null };
  }
  function sanitizeData(d) {
    const out = structuredCloneData(DEFAULTS);
    out.extras = (d && d.extras && typeof d.extras === 'object' && !Array.isArray(d.extras)) ? d.extras : {};
    if (!d || typeof d !== 'object') return out;
    for (const field of Object.keys(VALIDATORS)) {
      if (!(field in d) || d[field] === undefined) continue; // 缺失字段 → 默认（新增字段自动有默认值）
      const def = DEFAULTS[field];
      const isPlain = def && typeof def === 'object' && !Array.isArray(def);
      // 深合并先于校验：对象型字段缺失的子字段先补默认（"删除的字段安全忽略"），
      // 显式存在的非法值/越界数值仍按损坏处理（备份 + 默认）
      const cand = (isPlain && d[field] && typeof d[field] === 'object' && !Array.isArray(d[field]))
        ? { ...def, ...d[field] } : d[field];
      const r = validateField(field, cand);
      if (r.ok) out[field] = isPlain ? { ...def, ...r.value } : r.value;
    }
    return out;
  }
  let lastEnvRaw; // 上次本模块写入/读到的信封原始串（探测外部改动：他页签写入 / localStorage.clear()）
  function writeEnvelope() {
    const env = { schemaVersion: 2, savedAt: Date.now(), data };
    const str = JSON.stringify(env);
    try { rawSet(ENVELOPE_KEY, str); } catch (e) { /* 已内存兜底 */ }
    lastEnvRaw = str;
    syncMirrors();
  }
  // v1 镜像双写：兼容裸读旧键的外部页面（selftest.html 等）；策略 = 旧键永久保留不删
  function syncMirrors() {
    const m = { optcg_decks: data.decks, optcg_deck_sel: data.deckSel, optcg_ladder: data.ladder, optcg_survival: data.survival, optcg_uid: data.uid };
    for (const [k, v] of Object.entries(m)) {
      if (v === null) { continue; } // uid 未生成时不写镜像
      try { rawSet(k, JSON.stringify(v)); } catch (e) { /* 兜底 */ }
    }
  }
  // v1 → v2 迁移：信封不存在而旧键在 → 迁移入信封；旧键保留为镜像
  function migrateV1() {
    if (rawGet(ENVELOPE_KEY) !== null) return false;
    let migrated = false;
    const d = structuredCloneData(DEFAULTS);
    for (const [lk, field] of Object.entries(LEGACY)) {
      const raw = rawGet(lk);
      if (raw === null || raw === undefined) continue;
      let v = null;
      try { v = JSON.parse(raw); } catch (e) { v = undefined; }
      if (v === undefined) {
        backupValue('corrupt', { at: Date.now(), key: lk, reason: 'v1 键不可解析', raw: String(raw).slice(0, 2048) });
        corruptEvents.push({ at: Date.now(), key: lk, reason: 'v1 数据损坏，已恢复默认（原值已备份）' });
        migrated = true; continue;
      }
      if (v === null) continue;
      const r = validateField(field, v);
      d[field] = r.ok ? r.value : DEFAULTS[field];
      migrated = true;
    }
    if (migrated) { data = sanitizeData(d); writeEnvelope(); }
    return migrated;
  }

  // ===== 设置 =====
  const settings = { ...DEFAULT_SETTINGS }; // 对外活对象（OPTCG_SAVE.settings）
  const listeners = [];
  function applySettingClasses() {
    try {
      const root = document.documentElement;
      root.classList.toggle('reduced-motion', !!settings.reducedMotion); // CSS 由另一线接入
      root.classList.toggle('compact-layout', !!settings.compact);
    } catch (e) { /* 无 DOM 环境 */ }
  }
  function pushSettings(next, changedKey) {
    Object.assign(settings, next);
    try { persistField('settings', { ...settings }); } catch (e) { /* 兜底 */ }
    applySettingClasses();
    for (const fn of listeners) { try { fn({ ...settings }, changedKey); } catch (e) { /* 订阅者异常不外溢 */ } }
    syncSettingsUI();
  }
  function persistField(field, value) {
    data[field] = value;
    writeEnvelope();
  }

  // ===== 对局快照 =====
  function readMatch() {
    const raw = rawGet(MATCH_KEY);
    if (raw === null || raw === undefined) return null;
    let snap = null;
    try { snap = JSON.parse(raw); } catch (e) { return { corrupt: true }; }
    if (!snap || typeof snap !== 'object' || Array.isArray(snap) || !snap.g || typeof snap.g !== 'object') return { corrupt: true };
    return { snap };
  }
  function fresh(snap) {
    const ts = Number(snap && snap.ts);
    if (!Number.isFinite(ts)) return false; // 无有效时间戳按过期处理
    return Date.now() - ts < MATCH_TTL;
  }

  // ===== 对外 API =====
  const api = {
    VERSION,
    get degraded() { return degraded; },
    settings,
    get(key) {
      ensureFresh();
      const k = normalizeKey(key);
      if (k in VALIDATORS) {
        const v = data[k];
        return v === undefined ? null : JSON.parse(JSON.stringify(v));
      }
      return (data.extras && data.extras[k] !== undefined) ? JSON.parse(JSON.stringify(data.extras[k])) : null;
    },
    set(key, val) {
      ensureFresh();
      const k = normalizeKey(key);
      if (k === 'settings') {
        const r = VALIDATORS.settings(val);
        pushSettings(r !== null ? r : { ...DEFAULT_SETTINGS }, 'settings');
        return true;
      }
      if (k in VALIDATORS) {
        const r = validateField(k, val);
        if (!r.ok) return false; // 拒写非法值（不覆盖现有数据）
        persistField(k, r.value);
        return true;
      }
      data.extras = data.extras || {};
      data.extras[k] = JSON.parse(JSON.stringify(val));
      writeEnvelope();
      return true;
    },
    onSettingsChange(fn) { if (typeof fn === 'function') listeners.push(fn); },

    autosave(snap) {
      if (!snap) { rawRemove(MATCH_KEY); return; }
      if (typeof snap !== 'object') return;
      const payload = { ...snap, ts: Number.isFinite(Number(snap.ts)) ? Number(snap.ts) : Date.now() };
      let str = null;
      try { str = JSON.stringify(payload); } catch (e) { return; }
      if (str.length > MATCH_MAX_BYTES) { rawRemove(MATCH_KEY); return; } // 大小保护：超限丢弃，不清既有流程
      if (!rawSet(MATCH_KEY, str)) return;
      if (rawGet(MATCH_KEY) !== str) { rawRemove(MATCH_KEY); rawSet(MATCH_KEY, str); } // 配额竞争 → 清旧重试一次
    },
    hasUnfinished() {
      const m = readMatch();
      return !!(m && !m.corrupt && fresh(m.snap));
    },
    matchInfo() {
      const m = readMatch();
      if (!m || m.corrupt || !fresh(m.snap)) return null;
      const s = m.snap;
      return {
        turn: Number.isFinite(Number(s.g && s.g.turn)) ? Number(s.g.turn) : null,
        mode: (s.ctx && typeof s.ctx.mode === 'string') ? s.ctx.mode : 'free',
        ts: s.ts,
      };
    },
    resume() {
      const m = readMatch();
      if (!m) return false;
      if (m.corrupt) { rawRemove(MATCH_KEY); return false; } // 损坏快照：清键
      if (!fresh(m.snap)) return false; // 超时：视为放弃，保留键供手动清理
      const restore = window.OPTCG_GAME && window.OPTCG_GAME.restoreFromSnapshot;
      if (typeof restore !== 'function') { rawRemove(MATCH_KEY); return false; }
      try {
        if (restore(m.snap)) { rawRemove(MATCH_KEY); return true; }
      } catch (e) { /* 恢复失败按失效处理 */ }
      rawRemove(MATCH_KEY);
      return false;
    },

    exportAll() {
      const entries = {};
      for (const k of rawKeys()) {
        if (k.startsWith(PREFIX)) {
          const v = rawGet(k);
          if (v !== null) entries[k] = v;
        }
      }
      return JSON.stringify({ schemaVersion: 2, app: 'optcg-battle', appVersion: VERSION, exportedAt: new Date().toISOString(), entries });
    },
    importAll(json) {
      let obj = null;
      try { obj = JSON.parse(String(json)); } catch (e) { return false; }
      if (!obj || typeof obj !== 'object' || obj.schemaVersion !== 2) return false;
      const entries = obj.entries;
      if (!entries || typeof entries !== 'object' || Array.isArray(entries)) return false;
      // 先全量预检，后提交：任一键非法 → false，现有数据不动
      for (const [k, v] of Object.entries(entries)) {
        if (typeof k !== 'string' || !k.startsWith(PREFIX) || typeof v !== 'string') return false;
      }
      for (const [k, v] of Object.entries(entries)) rawSet(k, v);
      reloadFromStorage();
      return true;
    },
    resetAll() {
      const dump = api.exportAll(); // 前置全量备份
      backupValue('reset', dump);
      for (const k of rawKeys()) {
        if (k.startsWith(PREFIX) && !/^optcg_backup_(reset_|corrupt_)?\d+$/.test(k)) rawRemove(k);
      }
      data = structuredCloneData(DEFAULTS);
      writeEnvelope();
      pushSettings({ ...DEFAULT_SETTINGS }, 'reset');
      pruneBackups();
    },

    // 非契约辅助
    matchKey: MATCH_KEY,
    backups() {
      return rawKeys()
        .filter((k) => /^optcg_backup_(reset_|corrupt_)?\d+$/.test(k))
        .sort()
        .map((k) => ({ key: k, at: Number(k.match(/(\d+)$/)[1]), reset: k.includes('_reset_') }))
        .reverse();
    },
    corruptEvents,
    clearMatch() { rawRemove(MATCH_KEY); },
  };
  window.OPTCG_SAVE = api;

  function reloadFromStorage() {
    bootFromStorage(true);
  }

  // 从存储重建内存态（启动 / importAll / 外部改动探测共用）
  function bootFromStorage(fireChange) {
    migrateV1();                                   // v1 → v2（旧键保留为镜像）
    let env = readEnvelope();
    if (!env) { writeEnvelope(); env = null; }     // 无信封 → 落一份默认信封
    const before = corruptEvents.length;
    data = sanitizeData(env && env.data);
    if (env && corruptEvents.length > before) writeEnvelope(); // 净化结果回写：避免每次启动重复检测+重复备份
    const prev = { ...settings };
    Object.assign(settings, data.settings);
    applySettingClasses();
    if (fireChange) {
      const changed = Object.keys(DEFAULT_SETTINGS).find((k) => prev[k] !== settings[k]);
      if (changed) for (const fn of listeners) { try { fn({ ...settings }, changed); } catch (e) { /* */ } }
    }
    lastEnvRaw = rawGet(ENVELOPE_KEY);
    syncSettingsUI();
    renderSettingsNotice();
  }
  // 外部改动探测：信封原始串变化（他页签写入选中项 / 开发者工具 clear）→ 重建内存态，避免缓存失同步
  function ensureFresh() {
    if (rawGet(ENVELOPE_KEY) !== lastEnvRaw) bootFromStorage(true);
  }

  // ===== 启动 =====
  bootFromStorage(false);

  // ===== 设置面板（动态注入；样式复用 btn-ghost/btn-primary/modal/modal-card + 少量内联）=====
  function syncSettingsUI() {
    const p = document.getElementById('settingsPanel');
    if (!p) return;
    const c1 = document.getElementById('setSound'), c2 = document.getElementById('setReduced'), c3 = document.getElementById('setCompact');
    if (c1) c1.checked = !!settings.sound;
    if (c2) c2.checked = !!settings.reducedMotion;
    if (c3) c3.checked = !!settings.compact;
    renderSettingsNotice();
  }
  function renderSettingsNotice() {
    const box = document.getElementById('settingsNotice');
    if (!box) return;
    const lines = [];
    if (degraded) lines.push('⚠ 当前浏览器禁用了本地存储（隐私模式？），进度仅保留在本页会话内，刷新即失。');
    if (corruptEvents.length) {
      const ks = Array.from(new Set(corruptEvents.map((e) => e.key))).join('、');
      lines.push('⚠ 检测到 ' + corruptEvents.length + ' 处损坏数据（' + ks + '），已自动恢复默认，原值备份在 optcg_backup_* 键中（设置内可导出）。');
    }
    box.textContent = lines.join('\n');
    box.style.display = lines.length ? 'block' : 'none';
    // 大厅一行提示
    const hall = document.getElementById('saveBackupNotice');
    if (hall) {
      hall.textContent = lines.length ? '⚠ 部分本地存档曾损坏，已恢复默认并备份原值（详见设置）' : '';
      hall.style.display = lines.length ? 'block' : 'none';
    }
  }
  function rowEl(id, label, desc) {
    const row = document.createElement('label');
    row.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px 12px;margin:8px 0;border:1px solid #2c3a55;border-radius:10px;background:rgba(16,29,56,.6);cursor:pointer;';
    const cb = document.createElement('input');
    cb.type = 'checkbox'; cb.id = id;
    cb.style.cssText = 'width:17px;height:17px;accent-color:#d9aa45;cursor:pointer;flex:none;';
    const txt = document.createElement('span');
    txt.innerHTML = '<b style="color:#e8d9a8;font-size:14px;letter-spacing:1px;">' + label + '</b>'
      + '<br><span style="color:#8fa0bd;font-size:12px;">' + desc + '</span>';
    row.appendChild(cb); row.appendChild(txt);
    return row;
  }
  function injectSettingsUI() {
    try {
      const help = document.getElementById('btnHallHelp');
      if (help && !document.getElementById('btnSettings')) {
        const btn = document.createElement('button');
        btn.id = 'btnSettings'; btn.type = 'button';
        btn.className = 'btn-ghost hall-help-btn';
        btn.textContent = '设置';
        help.parentNode.insertBefore(btn, help.nextSibling);
        // 大厅损坏提示行（紧随其后）
        const notice = document.createElement('div');
        notice.id = 'saveBackupNotice';
        notice.style.cssText = 'display:none;margin:8px auto 0;max-width:520px;font-size:12px;color:#ffd98e;letter-spacing:.5px;line-height:1.5;';
        btn.parentNode.insertBefore(notice, btn.nextSibling);
        btn.onclick = () => { syncSettingsUI(); document.getElementById('settingsPanel').classList.remove('hidden'); };
      }
      if (document.getElementById('settingsPanel')) return;
      const panel = document.createElement('div');
      panel.id = 'settingsPanel'; panel.className = 'modal hidden';
      const card = document.createElement('div');
      card.className = 'modal-card';
      card.style.maxWidth = '480px';
      const h = document.createElement('h3');
      h.textContent = '设置';
      card.appendChild(h);
      const notice = document.createElement('div');
      notice.id = 'settingsNotice';
      notice.style.cssText = 'display:none;white-space:pre-line;font-size:12px;color:#ffd98e;background:rgba(232,86,63,.08);border:1px solid rgba(232,86,63,.3);border-radius:8px;padding:8px 10px;margin:8px 0;';
      card.appendChild(notice);

      card.appendChild(rowEl('setSound', '音效', 'WebAudio 合成音（默认关）。开启后立即试听一声。'));
      card.appendChild(rowEl('setReduced', '减少动效', '降低动画与粒子演出（对 prefers-reduced-motion 的手动覆盖）。'));
      card.appendChild(rowEl('setCompact', '紧凑布局', '压缩界面间距，同屏显示更多信息。'));

      const acts = document.createElement('div');
      acts.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 6px;';
      const mkBtn = (t, cls) => { const b = document.createElement('button'); b.type = 'button'; b.className = cls; b.textContent = t; return b; };
      const bExp = mkBtn('导出存档', 'btn-ghost');
      const bImp = mkBtn('导入存档', 'btn-ghost');
      const bRst = mkBtn('重置存档', 'btn-ghost');
      bRst.style.borderColor = 'rgba(232,86,63,.5)'; bRst.style.color = '#ff9d8a';
      acts.appendChild(bExp); acts.appendChild(bImp); acts.appendChild(bRst);
      card.appendChild(acts);

      const file = document.createElement('input');
      file.type = 'file'; file.accept = 'application/json,.json';
      file.style.display = 'none';
      card.appendChild(file);

      const done = mkBtn('完成', 'btn-primary');
      done.style.width = '100%';
      card.appendChild(done);

      const foot = document.createElement('p');
      foot.style.cssText = 'margin:12px 0 0;color:#8fa0bd;font-size:11px;line-height:1.6;';
      foot.innerHTML = '版本 v' + VERSION + ' · 数据保存在本浏览器 localStorage 中，清除浏览器数据会一并丢失，建议定期「导出存档」留底。';
      card.appendChild(foot);

      panel.appendChild(card);
      document.body.appendChild(panel);

      done.onclick = () => panel.classList.add('hidden');
      panel.addEventListener('click', (e) => { if (e.target === panel) panel.classList.add('hidden'); });

      document.getElementById('setSound').onchange = function () {
        pushSettings({ ...settings, sound: this.checked }, 'sound');
        if (window.OPTCG_AUDIO) {
          window.OPTCG_AUDIO.setEnabled(this.checked); // 内部会同步 settings.sound（幂等）
          if (this.checked) window.OPTCG_AUDIO.play('click'); // 用户手势内试听 + 解锁 AudioContext
        }
      };
      document.getElementById('setReduced').onchange = function () {
        pushSettings({ ...settings, reducedMotion: this.checked }, 'reducedMotion');
      };
      document.getElementById('setCompact').onchange = function () {
        pushSettings({ ...settings, compact: this.checked }, 'compact');
      };

      bExp.onclick = () => {
        try {
          const blob = new Blob([api.exportAll()], { type: 'application/json' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'optcg-save-' + new Date().toISOString().slice(0, 10) + '.json';
          document.body.appendChild(a); a.click(); a.remove();
          setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        } catch (e) { UI().toast('导出失败：' + (e && e.message), 'error'); }
      };
      bImp.onclick = () => file.click();
      file.onchange = () => {
        const f = file.files && file.files[0];
        file.value = '';
        if (!f) return;
        const rd = new FileReader();
        rd.onload = () => {
          if (api.importAll(rd.result)) {
            UI().toast('导入成功，存档已恢复');
            if (window.OPTCG_MODES) { try { window.OPTCG_MODES.refreshMenu(); } catch (e) { /* 大厅未初始化 */ } }
          }
          else { UI().toast('导入失败：文件不是有效的 v2 存档备份，现有数据未改动', 'error'); }
        };
        rd.onerror = () => UI().toast('导入失败：文件读取错误', 'error');
        rd.readAsText(f);
      };
      bRst.onclick = async () => {
        const ui = UI();
        if (!(await ui.confirm('确定要重置全部存档吗？重置前会自动在浏览器内留一份全量备份。', { okText: '继续重置' }))) return;
        if (!(await ui.confirm('第二次确认：将清空「卡组与选用记录、天梯排位分数、生存挑战纪录、界面设置、未完成对局」，游戏内无法撤销（浏览器内自动备份可通过导入找回）。真的继续吗？', { okText: '确认重置' }))) return;
        api.resetAll();
        ui.toast('已重置为初始状态（重置前备份已保存）');
        if (window.OPTCG_MODES) { try { window.OPTCG_MODES.refreshMenu(); } catch (e) { /* 大厅未初始化 */ } }
      };

      renderSettingsNotice();
    } catch (e) { /* DOM 异常不阻断游戏 */ }
  }
  if (typeof document !== 'undefined') { injectSettingsUI(); renderSettingsNotice(); }
})();
