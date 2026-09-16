// 语法门禁：node --check 全部源码 js（生成物 web/app.bundle.js 除外——它由 bundle.js 产出且自带冒烟测试）
import { readdirSync, statSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_DIRS = new Set(['node_modules', '.git', 'deploy']);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'app.bundle.js' || name.startsWith('.')) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (!SKIP_DIRS.has(name)) walk(p, out);
    } else if (extname(name) === '.js') {
      out.push(p);
    }
  }
  return out;
}

const files = walk(root);
let bad = 0;
for (const f of files) {
  const r = spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' });
  if (r.status !== 0) {
    bad++;
    console.error(`FAIL ${f}\n${r.stderr}`);
  }
}
if (bad > 0) {
  console.error(`\n${bad}/${files.length} files failed syntax check`);
  process.exit(1);
}
console.log(`syntax ok: ${files.length} js files (node --check)`);
