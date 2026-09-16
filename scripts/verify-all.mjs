// verify-all.mjs — RC+ 一键验证流程（R4）：语法 → 引擎测试 → 构建 → selftest → E2E → 断网。
// 用法：node scripts/verify-all.mjs [--stages syntax,engine,build,selftest,e2e,offline] [--timeout 600] [--keep]
//   --stages 逗号分隔，默认全跑；快速档 --stages syntax,engine,build
//   --timeout Chrome 单段真实时间上限秒（默认 600；CPU 拥塞期 300s 实测不够，见 tests/e2e/README.md）
// 退出码 0=全过；每阶段独立计时与结论，失败继续跑完剩余阶段（全景可见）。
// 断网（offline）阶段用 file:// 直开 e2e.html：无任何 HTTP server，modes.js 云探测立即失败→静默离线，
// 完整对局照常打完 = 「断网可玩」的直接证据（所有资源本地，fetch file:// 被 Chrome 禁止→catch 路径）。
import { execFileSync, spawnSync } from 'node:child_process';
import { readdirSync, statSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// Chrome profile 落 C 盘临时目录（本机 TMP 指向拥塞 F 盘的坑，见 tests/e2e/run.mjs 注释）
const TMPD = mkdtempSync(join(tmpdir(), 'optcg-verify-'));
const arg = (name, dflt) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : dflt;
};
const STAGES = (arg('stages', 'syntax,engine,build,selftest,e2e,offline')).split(',');
const CHROME_TIMEOUT = Number(arg('timeout', 600)) * 1000;
const KEEP = process.argv.includes('--keep');

function findChrome() {
  const cands = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.CHROME_BIN, 'chrome', 'google-chrome',
  ].filter(Boolean);
  for (const c of cands) {
    try { execFileSync(c, ['--version'], { stdio: 'pipe' }); return c; }
    catch (e) { /* 下一个 */ }
  }
  throw new Error('Chrome 未找到（可设 CHROME_BIN）');
}
function chromeDump({ url, budget, profile, tag }) {
  return execFileSync(findChrome(), [
    '--headless=new', '--disable-gpu', `--user-data-dir=${profile}`,
    '--window-size=1440,900', `--virtual-time-budget=${budget}`,
    '--no-proxy-server', '--disable-background-networking', '--disable-component-update',
    '--disable-sync', '--metrics-recording-only', '--mute-audio', '--no-first-run',
    '--dump-dom', url,
  ], { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024, encoding: 'utf8', timeout: CHROME_TIMEOUT });
}

const results = [];
function record(stage, ok, ms, note) {
  results.push({ stage, ok, ms, note: String(note || '').slice(0, 300) });
  console.log(`${ok ? 'PASS' : 'FAIL'} [${stage}] ${(ms / 1000).toFixed(1)}s ${note || ''}`);
}

// ①语法：web 全部 JS 过 node --check
function stageSyntax() {
  const t0 = Date.now();
  const files = readdirSync(join(ROOT, 'web')).filter((f) => f.endsWith('.js')).map((f) => join(ROOT, 'web', f));
  const bad = [];
  for (const f of files) {
    const r = spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' });
    if (r.status !== 0) bad.push(f.split('\\').pop() + ': ' + (r.stderr || '').split('\n')[0]);
  }
  record('syntax', bad.length === 0, Date.now() - t0, bad.length ? bad.join(' | ') : `${files.length} 个 JS 全过 node --check`);
}

// ②引擎/规则测试：node --test（含 balance 固定种子回归）
function stageEngine() {
  const t0 = Date.now();
  const r = spawnSync(process.execPath, ['--test'], { cwd: ROOT, encoding: 'utf8', timeout: 300000 });
  const m = (r.stdout || '').match(/ℹ pass (\d+)[\s\S]*?ℹ fail (\d+)/);
  const pass = m ? +m[1] : 0, fail = m ? +m[2] : -1;
  record('engine', r.status === 0 && fail === 0, Date.now() - t0, r.status === 0 ? `node --test ${pass} pass / 0 fail` : `退出码 ${r.status}：${(r.stderr || r.stdout || '').slice(-200)}`);
}

// ③构建：重打包 + 新鲜度（源码比 bundle 旧才算自洽）
function stageBuild() {
  const t0 = Date.now();
  const b = spawnSync(process.execPath, ['scripts/bundle.js'], { cwd: ROOT, encoding: 'utf8' });
  if (b.status !== 0) { record('build', false, Date.now() - t0, 'bundle.js 失败：' + (b.stderr || '').slice(-200)); return; }
  const bundle = join(ROOT, 'web', 'app.bundle.js');
  const stale = ['engine', 'ai', 'data/cards.json'].filter((p) => {
    try { return statSync(join(ROOT, p)).mtimeMs > statSync(bundle).mtimeMs + 500; } catch { return false; }
  });
  record('build', stale.length === 0, Date.now() - t0, stale.length ? `重打包后仍过期: ${stale.join(',')}` : 'bundle 重打包 + 新鲜度一致');
}

// ④selftest：42 断言四局串行（autoplay 已提速，预算 180s 虚拟时间足够）
function stageSelftest() {
  const t0 = Date.now();
  let dom = '';
  try {
    dom = chromeDump({ url: `file://${join(ROOT, 'web', 'selftest.html').replace(/\\/g, '/')}`, budget: 180000, profile: join(TMPD, 'p-selftest'), tag: 'selftest' });
  } catch (e) { record('selftest', false, Date.now() - t0, 'Chrome 失败：' + e.message); return; }
  const m = dom.match(/<title>(SELFTEST-[^<]*)<\/title>/);
  record('selftest', !!m && /^SELFTEST-PASS/.test(m[1]), Date.now() - t0, m ? m[1] : '无结果（预算不足或页面异常）');
}

// ⑤E2E：tests/e2e/run.mjs 全三模式（进程内复用其全部基建）
function stageE2E() {
  const t0 = Date.now();
  const r = spawnSync(process.execPath, ['tests/e2e/run.mjs', '--timeout', String(CHROME_TIMEOUT / 1000)], { cwd: ROOT, encoding: 'utf8', timeout: 3600000 });
  const tail = (r.stdout || '').trim().split('\n').filter(Boolean).slice(-3).join(' ⏎ ');
  record('e2e', r.status === 0, Date.now() - t0, tail);
}

// ⑥断网：file:// 直开 e2e.html 跑 main 模式完整对局（零 HTTP server）
function stageOffline() {
  const t0 = Date.now();
  const url = `file://${join(ROOT, 'web', 'e2e.html').replace(/\\/g, '/')}?e2e=main`;
  let dom = '';
  try {
    dom = chromeDump({ url, budget: 600000, profile: join(TMPD, 'p-offline'), tag: 'offline' });
  } catch (e) { record('offline', false, Date.now() - t0, 'Chrome 失败：' + e.message); return; }
  const m = dom.match(/<title>(E2E-RESULT [\s\S]*?)<\/title>/);
  const raw = m ? m[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'") : '';
  const pass = /"summary":\s*"E2E-PASS/.test(raw);
  record('offline', pass, Date.now() - t0, pass ? 'file:// 完整对局 PASS（无网络依赖）' : (raw.slice(0, 160) || '无结果'));
}

const IMPL = { syntax: stageSyntax, engine: stageEngine, build: stageBuild, selftest: stageSelftest, e2e: stageE2E, offline: stageOffline };
const t0 = Date.now();
console.log(`verify-all：${STAGES.join(' → ')}（Chrome 单段上限 ${CHROME_TIMEOUT / 1000}s）\n`);
for (const s of STAGES) {
  if (!IMPL[s]) { record(s, false, 0, '未知阶段名'); continue; }
  try { IMPL[s](); } catch (e) { record(s, false, Date.now() - t0, '异常：' + e.message); }
}
const failed = results.filter((r) => !r.ok).length;
console.log(`\n===== ${failed === 0 ? 'VERIFY-ALL-PASS' : `VERIFY-FAILED=${failed}`}（总 ${( (Date.now() - t0) / 60000).toFixed(1)} min）=====`);
if (!KEEP) { try { rmSync(TMPD, { recursive: true, force: true }); } catch (e) { /* Windows 文件锁：残留 tmp 可接受 */ } }
process.exit(failed === 0 ? 0 : 1);
