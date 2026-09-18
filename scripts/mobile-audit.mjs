// 手机布局几何审计：CDP 手机视口下量 DOM rect，定位偏移/裁切/重叠（数字比 VLM 截图可靠）
// 用法：node scripts/mobile-audit.mjs [宽] [高]
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const W = Number(process.argv[2] || 390);
const H = Number(process.argv[3] || 844);
const PAGE = 'file:///' + join(ROOT, 'web', 'index.html').replace(/\\/g, '/');

function findChrome() {
  const cands = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe',
  ].filter(existsSync);
  if (!cands.length) { console.error('chrome not found'); process.exit(2); }
  return cands[0];
}
const chrome = findChrome();
const port = 9300 + Math.floor(Math.random() * 500);
const prof = mkdtempSync(join(tmpdir(), 'optcg-audit-'));
const proc = spawn(chrome, [
  '--headless', '--disable-gpu', `--user-data-dir=${prof}`,
  `--remote-debugging-port=${port}`,
  '--mute-audio', '--no-first-run', '--no-proxy-server',
  'about:blank',
], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 页内探针：跳引导→进对战→autoplay 铺场面→量几何
const PROBE = `(window.__audit = async () => {
  const out = { vw: innerWidth, vh: innerHeight };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const ob = document.getElementById('onboard');
  if (ob && !ob.classList.contains('hidden')) { const s = ob.querySelector('.ob-skip'); if (s) s.click(); await sleep(400); }
  // 进局重试：onboard 关闭竞态/首击被吞时补点（最多 4 轮）
  for (let i = 0; i < 4 && !(window.OPTCG_GAME && OPTCG_GAME.state()); i++) {
    document.getElementById('btnStart').click();
    for (let j = 0; j < 20 && !(window.OPTCG_GAME && OPTCG_GAME.state()); j++) await sleep(200);
  }
  out.inGame = !!(window.OPTCG_GAME && OPTCG_GAME.state());
  if (out.inGame) OPTCG_GAME.autoplay(24, 60);
  await sleep(15000);
  const r = (el) => { const b = el.getBoundingClientRect(); return { l: +b.left.toFixed(1), t: +b.top.toFixed(1), r: +b.right.toFixed(1), b: +b.bottom.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) }; };
  const app = document.getElementById('app');
  out.app = r(app);
  out.appTransform = app.style.transform || '(none)';
  // 横向溢出
  out.docOverflowX = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  // 每行容器：中心偏移 + 内容溢出
  for (const id of ['enemyBoard', 'myBoard', 'myHand', 'enemyHand']) {
    const el = document.getElementById(id);
    if (!el) continue;
    const info = { rect: r(el) };
    const cards = [...el.querySelectorAll('.card, .card-back')].filter((c) => c.offsetParent !== null);
    if (cards.length) {
      const first = cards[0].getBoundingClientRect(), last = cards[cards.length - 1].getBoundingClientRect();
      info.n = cards.length;
      info.contentSpan = { l: +first.left.toFixed(1), r: +last.right.toFixed(1) };
      info.contentCenter = +((first.left + last.right) / 2).toFixed(1);
      info.containerCenter = +((el.getBoundingClientRect().left + el.getBoundingClientRect().right) / 2).toFixed(1);
    }
    info.scrollOverX = el.scrollWidth - el.clientWidth;
    out[id] = info;
  }
  // 视口中心
  out.viewportCenterX = innerWidth / 2;
  // 手牌顶部裁切：cost 徽章 top vs 手牌容器 top（overflow 裁切判定）
  const handRow = document.querySelector('.hand-row');
  if (handRow) {
    out.handRowRect = r(handRow);
    const cost = document.querySelector('#myHand .card .cost');
    if (cost) out.handCostTop = +cost.getBoundingClientRect().top.toFixed(1);
    const card = document.querySelector('#myHand .card');
    if (card) out.handCardTop = +card.getBoundingClientRect().top.toFixed(1);
  }
  // 场面卡顶部裁切：board 卡 cost 徽章 vs 容器/board-row top
  const bCard = document.querySelector('#myBoard .card') || document.querySelector('#enemyBoard .card');
  if (bCard) {
    const bCost = bCard.querySelector('.cost');
    out.boardCardRect = r(bCard);
    if (bCost) out.boardCostTop = +bCost.getBoundingClientRect().top.toFixed(1);
    const row = bCard.closest('.board-row');
    if (row) out.boardRowRect = r(row);
    // 文字重叠：name vs sub
    const name = bCard.querySelector('.name'), sub = bCard.querySelector('.sub'), pw = bCard.querySelector('.power');
    if (name) out.nameRect = r(name);
    if (sub) out.subRect = r(sub);
    if (pw) out.powerRect = r(pw);
    if (name && sub) out.nameSubOverlap = name.getBoundingClientRect().bottom - sub.getBoundingClientRect().top;
    if (sub && pw) out.subPowerGap = sub.getBoundingClientRect().bottom - pw.getBoundingClientRect().top;
  }
  // 敌我信息行（top-row）占据宽度：是否右侧大量空白
  for (const id of ['enemyLeaderSlot', 'myLeaderSlot', 'myDon']) {
    const el = document.getElementById(id);
    if (el) out[id] = r(el);
  }
  // 结束回合按钮可见性
  const btnEnd = document.getElementById('btnEnd');
  if (btnEnd) { out.btnEnd = r(btnEnd); out.btnEndVisible = btnEnd.getBoundingClientRect().bottom <= innerHeight && btnEnd.getBoundingClientRect().right <= innerWidth; }
  document.title = 'AUDIT ' + JSON.stringify(out);
})();`;

async function main() {
  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    try {
      const list = JSON.parse(execFileSync('curl', ['-s', `http://127.0.0.1:${port}/json/list`], { encoding: 'utf8' }));
      const page = list.find((t) => t.type === 'page');
      if (page) { wsUrl = page.webSocketDebuggerUrl; break; }
    } catch (e) { /* 重试 */ }
    await sleep(300);
  }
  if (!wsUrl) throw new Error('CDP 未就绪');
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } });
  const call = (method, params) => new Promise((res) => { const mid = ++id; pending.set(mid, res); ws.send(JSON.stringify({ id: mid, method, params })); });
  await call('Page.enable');
  await call('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true });
  await call('Page.navigate', { url: PAGE });
  await sleep(3500);
  await call('Runtime.evaluate', { expression: PROBE });
  let result = null;
  for (let i = 0; i < 40; i++) {
    await sleep(1000);
    const rr = await call('Runtime.evaluate', { expression: 'document.title', returnByValue: true });
    if (rr && rr.result && String(rr.result.value).startsWith('AUDIT ')) { result = rr.result.value; break; }
  }
  ws.close();
  if (!result) { console.error('AUDIT-NO-RESULT'); process.exitCode = 1; return; }
  console.log(`===== ${W}x${H} =====`);
  console.log(JSON.stringify(JSON.parse(result.slice(6)), null, 1));
}
try { await main(); } finally {
  proc.kill();
  try { rmSync(prof, { recursive: true, force: true }); } catch (e) { /* 残留无害 */ }
}
