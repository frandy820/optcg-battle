// deploy-pages.mjs — 构建 gh-pages 孤儿分支（仅 web/ 静态资产）并推送 GitHub Pages。
// 用法：node scripts/deploy-pages.mjs [--dry]   （--dry 只构建本地分支不推送）
// 原理：临时 worktree + orphan 分支 = gh-pages 历史干净单提交，不污染 main 历史；
//       web/ 内全部引用是相对路径（art/、*.js），GitHub Pages 子路径 https://<user>.github.io/<repo>/ 直开可用。
import { execSync } from 'node:child_process';
import { cpSync, readdirSync, rmSync, mkdtempSync, readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DRY = process.argv.includes('--dry');
const TMP = mkdtempSync(join(tmpdir(), 'optcg-pages-'));

const git = (args, cwd) => execSync(`git ${args}`, { cwd: cwd || ROOT, stdio: ['ignore', 'pipe', 'pipe'] });

try {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  const msg = `deploy: ${pkg.name || 'optcg-battle'} ${pkg.version || ''} (web static)`.trim();

  // 自愈：上次崩在半路留下的本地 gh-pages 会让 checkout --orphan 必崩（已三次实战）。
  // 先清死链 worktree 再删分支；删不掉（占用）才硬失败暴露问题。
  try { git('worktree prune'); } catch (e) { /* 无残留 */ }
  try { git('branch -D gh-pages'); } catch (e) { /* 无残留分支=正常首跑 */ }

  git(`worktree add --detach "${TMP}"`);          // 临时 worktree（不动当前分支）
  git('checkout --orphan gh-pages', TMP);         // 孤儿分支：无父母单提交历史
  try { git('rm -rf -q .', TMP); } catch (e) { /* 空树 */ }
  for (const e of readdirSync(TMP)) if (e !== '.git') rmSync(join(TMP, e), { recursive: true, force: true });
  cpSync(join(ROOT, 'web'), TMP, { recursive: true }); // 只留玩家可见静态资产

  git('add -A', TMP);
  git(`commit -q -m "${msg}"`, TMP);

  if (DRY) {
    const sha = execSync('git rev-parse --short HEAD', { cwd: TMP, encoding: 'utf8' }).trim();
    console.log(`[dry] gh-pages 本地构建于 ${TMP}（HEAD=${sha}），未推送`);
  } else {
    try {
      git('push -u origin gh-pages --force', TMP);
    } catch (e) {
      // github.com 直连常被墙（Connection reset）；本机 V2Ray HTTP 10809 兜底重试一次
      git('-c http.proxy=http://127.0.0.1:10809 push -u origin gh-pages --force', TMP);
    }
    console.log('gh-pages 已推送 → GitHub Pages');
  }
} finally {
  try { git(`worktree remove "${TMP}" --force`); } catch (e) { /* 主流程已毕 */ }
}
