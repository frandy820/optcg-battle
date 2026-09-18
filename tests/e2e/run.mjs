// run.mjs — E2E 一键驱动器（node tests/e2e/run.mjs）
// file:// 直开 web/e2e.html：无 HTTP server（本地 server 在 CPU 拥塞/低优先级下与 Chrome 互相饿死，
// 2026-09-16 实测 http 版 600s 真实时间不够、file:// 同流 7.5s 完赛；后端 http 行为由 tests/server.test.js 覆盖）。
// 用法：node tests/e2e/run.mjs [--only main|rounds|edge] [--keep] [--timeout 600]
//   --timeout Chrome 单模式真实时间上限秒（默认 300，CPU 拥塞期可放宽）
import { execFileSync } from 'node:child_process';
import { existsSync, writeFile, mkdtempSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
// file:// 基址：e2e.html 及其相对引用（../tests/e2e/player-flow.js、art/…）全部本地直读
// E2E_BASE 环境变量可覆盖为线上 URL（发布后线上冒烟：真实网络+CDN 路径走一遍断言流）
const BASE = process.env.E2E_BASE || `file://${join(ROOT, 'web', 'e2e.html').replace(/\\/g, '/')}`;

// ---- Chrome 探测 ----
function findChrome() {
  const cands = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.CHROME_BIN, 'chrome', 'google-chrome',
  ].filter(Boolean);
  // 禁止用「chrome --version」启动探测：裸 chrome.exe 会被正在运行的浏览器实例转发=弹新窗口+
  // execFileSync 永等（用户 Chrome 开着时卡死事故）。改查文件存在性/PATH。
  for (const c of cands) {
    if (/[\\/]/.test(c)) { if (existsSync(c)) return c; continue; }
    try { execFileSync('where', [c], { stdio: 'pipe' }); return c; }
    catch (e) { try { execFileSync('which', [c], { stdio: 'pipe' }); return c; } catch (e2) { /* 下一个 */ } }
  }
  throw new Error('Chrome 未找到（可设 CHROME_BIN）');
}
const CHROME = findChrome();

// ---- 单模式执行 ----
const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;
const keep = process.argv.includes('--keep');
const CHROME_TIMEOUT = Number(process.argv.includes('--timeout') ? process.argv[process.argv.indexOf('--timeout') + 1] : 300) * 1000;
// profile 落 C 盘（SSD）：本机 TMP 指向 F:\Cache\temp，F 盘拥塞时 Chrome profile 读写被拖到亚秒级/操作（2026-09-16 实测）
const tmp = join(process.env.E2E_TMP || 'C:\\Users\\mod\\AppData\\Local\\Temp', 'optcg-e2e-' + Date.now().toString(36));
mkdtempSync(tmp + '-', { recursive: false });
function chromeDump({ mode, budget, profile, url }) {
  const prof = join(tmp, profile);
  const target = url || `${BASE}?e2e=${mode}`;
  const dom = execFileSync(CHROME, [
    '--headless', '--disable-gpu', `--user-data-dir=${prof}`,
    '--window-size=1440,900', `--virtual-time-budget=${budget}`,
    // headless 静音参数：后台网络（GCM/组件更新/同步）在受限网络下重试会拖住虚拟时钟
    '--no-proxy-server', '--disable-background-networking', '--disable-component-update',
    '--disable-sync', '--metrics-recording-only', '--mute-audio', '--no-first-run',
    '--allow-file-access-from-files', // layout 模式：宿主页跨 iframe 读取游戏页 DOM
    '--dump-dom', target,
  ], { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024, encoding: 'utf8', timeout: CHROME_TIMEOUT });
  if (keep) writeFile(join(tmp, `dom-${mode}.html`), dom, () => {});
  return dom;
}
function parseResult(dom, tag, prefix = 'E2E-RESULT') {
  const m = dom.match(new RegExp(`<title>(${prefix} [\\s\\S]*?)<\\/title>`)) || (prefix === 'E2E-RESULT' && dom.match(/<pre id="e2eResult"[^>]*>([\s\S]*?)<\/pre>/));
  if (!m) return { summary: `NO-RESULT(${tag})`, steps: [], dialogs: [], errors: [], timeline: ['页面未产出结果——可能虚拟时间预算不足或 FATAL'] };
  const raw = m[1].replace(new RegExp(`^${prefix} `), '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  try { return JSON.parse(raw); } catch (e) { return { summary: 'PARSE-FAIL ' + e.message, steps: [], dialogs: [], errors: [], timeline: [] }; }
}

const MODES = [
  { mode: 'main', budget: 600000, profile: 'p-main', tag: 'main' },
  { mode: 'rounds', budget: 900000, profile: 'p-rounds', tag: 'rounds' },
  { mode: 'edge', budget: 600000, profile: 'p-edge', tag: 'edge(两段)' },
  // 反击窗口生命周期回归（快照构造窗口→打出反击牌→断言收口不冻死）
  { mode: 'counter', budget: 300000, profile: 'p-counter', tag: 'counter(反击窗)' },
  { mode: 'gear', budget: 300000, profile: 'p-gear', tag: 'gear(装备流)' },
  // 小屏布局回归：固定 390×748 iframe 宿主（--window-size 不可靠，见 layout.html 注释）
  { mode: 'layout', budget: 120000, profile: 'p-layout', tag: 'layout(390)', url: `file://${join(ROOT, 'tests', 'e2e', 'layout.html').replace(/\\/g, '/')}`, prefix: 'LAYOUT-RESULT' },
];
let failed = 0;
try {
  for (const cfg of MODES) {
    if (only && cfg.mode !== only) continue;
    process.stdout.write(`\n===== E2E ${cfg.tag} (${cfg.mode}) =====\n`);
    let dom = '';
    try {
      dom = chromeDump(cfg);
    } catch (e) {
      console.log(`FAIL | Chrome 执行失败 | ${e.killed ? '超时被杀(killed)' : ''} ${e.message || ''} code=${e.status}`);
      failed++;
      continue;
    }
    const R = parseResult(dom, cfg.tag, cfg.prefix);
    console.log('summary:', R.summary, '| dialogs:', JSON.stringify(R.dialogs), '| errors:', JSON.stringify(R.errors));
    for (const s of R.steps) console.log((s.ok ? 'PASS' : 'FAIL') + ' | ' + s.name + (s.detail ? ' | ' + String(s.detail).slice(0, 110) : ''));
    if (R.rounds && R.rounds.length) console.log('rounds:', JSON.stringify(R.rounds.map((r) => ({ tag: r.tag, winner: r.winner, turn: r.turn, played: r.played, atk: r.attacked, durMs: r.durMs }))));
    if (!/^(E2E|LAYOUT)-PASS/.test(R.summary)) failed++;
  }
} finally {
  if (!keep) { try { rmSync(tmp, { recursive: true, force: true }); } catch (e) { /* Windows 文件锁：残留 tmp 可接受 */ } }
  else console.log('\n[keep] dump 产物目录:', tmp);
}
console.log('\n' + (failed === 0 ? 'E2E-ALL-PASS' : `E2E-FAILED-MODES=${failed}`));
process.exit(failed === 0 ? 0 : 1);
