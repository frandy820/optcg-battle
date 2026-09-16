// JSON 文件存储：原子写（tmp+rename）+ 每日快照轮换（保留 7 份）
// 选型说明：放弃 better-sqlite3（203 的 python3.6 无法 node-gyp 源码编译，预编译包网络不可控）；
// 家庭级数据量（卡组几十条/对局几千条）JSON 足够，且 cp 即备份与 SQLite 同等便利。
import {
  readFileSync, writeFileSync, renameSync, mkdirSync, readdirSync, unlinkSync, existsSync,
} from 'node:fs';
import { dirname, join } from 'node:path';

const MAX_MATCHES = 5000;   // 超限截到 4000（防无限膨胀）
const KEEP_BACKUPS = 7;

export function openStore(file) {
  let data = { users: {}, decks: [], matches: [] };
  if (existsSync(file)) {
    try {
      const p = JSON.parse(readFileSync(file, 'utf8'));
      if (p && typeof p === 'object') {
        data = { users: p.users || {}, decks: Array.isArray(p.decks) ? p.decks : [], matches: Array.isArray(p.matches) ? p.matches : [] };
      }
    } catch (e) {
      // 损坏则保尸重建，绝不静默丢档
      try { renameSync(file, `${file}.corrupt-${Date.now()}`); } catch (_) { /* 同目录权限问题时忽略 */ }
      console.error(`[db] store 损坏已隔离: ${e.message}`);
    }
  }

  let seq = Date.now();
  const id = () => (++seq).toString(36) + Math.random().toString(36).slice(2, 6);

  function flush() {
    mkdirSync(dirname(file), { recursive: true });
    const tmp = `${file}.tmp`;
    writeFileSync(tmp, JSON.stringify(data), 'utf8');
    renameSync(tmp, file); // 同目录 rename = 原子替换
  }

  return {
    /** 云卡组：按 (user, name) upsert */
    upsertDeck(user, name, color, counts) {
      let d = data.decks.find((x) => x.user === user && x.name === name);
      if (d) { d.color = color; d.counts = counts; d.updated = Date.now(); }
      else { d = { id: id(), user, name, color, counts, updated: Date.now() }; data.decks.push(d); }
      flush();
      return d;
    },
    deleteDeck(user, deckId) {
      const n = data.decks.length;
      data.decks = data.decks.filter((x) => !(x.user === user && String(x.id) === String(deckId)));
      const removed = n !== data.decks.length;
      if (removed) flush();
      return removed;
    },
    listDecks(user) {
      return data.decks
        .filter((x) => x.user === user)
        .sort((a, b) => b.updated - a.updated)
        .map(({ id, name, color, counts, updated }) => ({ id, name, color, counts, updated }));
    },
    addMatch(m) {
      data.matches.push({ id: id(), ts: Date.now(), ...m });
      if (data.matches.length > MAX_MATCHES) data.matches = data.matches.slice(-4000);
      flush();
    },
    listMatches(user, limit = 20) {
      return data.matches
        .filter((x) => x.user === user)
        .slice(-limit)
        .reverse()
        .map(({ id, mode, win, turn, ts }) => ({ id, mode, win, turn, ts }));
    },
    stats(user) {
      const ms = data.matches.filter((x) => x.user === user);
      const byMode = {};
      for (const m of ms) {
        const k = m.mode || 'free';
        byMode[k] = byMode[k] || { wins: 0, losses: 0 };
        if (m.win) byMode[k].wins++; else byMode[k].losses++;
      }
      const wins = ms.filter((x) => x.win).length;
      return { total: ms.length, wins, losses: ms.length - wins, byMode };
    },
    touchUser(user) {
      if (!data.users[user]) { data.users[user] = { created: Date.now() }; flush(); }
    },
    snapshot(dir) {
      mkdirSync(dir, { recursive: true });
      const name = `store-${new Date().toISOString().slice(0, 10)}.json`;
      writeFileSync(join(dir, name), JSON.stringify(data), 'utf8');
      const files = readdirSync(dir).filter((f) => /^store-\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort();
      while (files.length > KEEP_BACKUPS) unlinkSync(join(dir, files.shift()));
      return name;
    },
  };
}
