// gen-test-pages.mjs — 从 index.html 骨架自动生成测试宿主页（selftest.html / e2e.html）。
// 背景：v0.8.0 模式选择首页/F13 融合按钮等 UI 加进 index.html 后测试页未同步，
//   game.js $('btnFuse').onclick 对 null 崩 → OPTCG_GAME 未挂 → selftest/e2e/offline 三段连环 FAIL。
//   手工拷贝必漂移，改为单一真值源：index.html 是唯一骨架，测试页=骨架+变体注入，每次构建重生成。
// 变体：
//   selftest：去 onboarding.js（清 localStorage 的断言不希望首访引导层干扰）+ SW 块 → tests/pages/selftest-body.html
//   e2e：     全链保留（onboarding 试玩需覆盖真实首访引导）+ SW 块 → player-flow.js，title 标 [TEST-ONLY]
// 幂等：内容不变不写盘（防 mtime 抖动触发 bundle 新鲜度误报）。
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// CRLF→LF 规范化：index.html 可能 CRLF，多行块匹配与幂等比较都按 LF 处理
const rd = (p) => readFileSync(join(ROOT, p), 'utf8').replace(/\r\n/g, '\n');

const SW_BLOCK = `  <script>
    // PWA：https/localhost 注册 SW（file:// 直开与协议不支持处静默跳过，不影响游玩）
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js').catch(function () { /* 注册失败：在线模式照常玩 */ });
      });
    }
  </script>`;

function gen({ title, scripts, body }) {
  let html = rd('web/index.html');
  html = html.replace('<title>航海王 · 卡牌对战</title>', `<title>${title}</title>`);
  // script 链变换：按变体增删（index 链为基准）
  if (scripts.remove) for (const s of scripts.remove) {
    // 不含行尾符匹配：index.html 可能 CRLF，行首两空格缩进足够唯一
    const line = `  <script src="${s}"></script>`;
    if (!html.includes(line)) throw new Error(`骨架缺少待删 script 行：${s}（index.html 加载链变了？）`);
    html = html.replace(line, '');
  }
  if (scripts.add) html = html.replace(SW_BLOCK, scripts.add.map((s) => `  <script src="${s}"></script>`).join('\n'));
  // SW 注册块 → 测试注入体（selftest 内联块 / e2e 由 add 阶段已换）
  if (body !== undefined) {
    if (!html.includes(SW_BLOCK)) throw new Error('找不到 SW 注册块（index.html 结构变了？）');
    html = html.replace(SW_BLOCK, body);
  }
  return html;
}

function emit(file, content) {
  let same = false;
  try { same = readFileSync(join(ROOT, file), 'utf8').replace(/\r\n/g, '\n') === content; } catch { /* 首次生成 */ }
  if (!same) { writeFileSync(join(ROOT, file), content, 'utf8'); console.log(`gen-test-pages: ${file} 已重生成`); }
}

// selftest：r 面板+42 断言四局串行（原 selftest.html 内联块原样迁移）
emit('web/selftest.html', gen({
  title: '航海王 · 卡牌对战',
  scripts: { remove: ['onboarding.js'] },
  body: rd('tests/pages/selftest-body.html'),
}));

// e2e：player-flow.js 宿主（加载链与 index 一致，含 onboarding）
emit('web/e2e.html', gen({
  title: 'E2E [TEST-ONLY] 航海王 · 卡牌对战',
  scripts: { add: ['../tests/e2e/player-flow.js'] },
}));
