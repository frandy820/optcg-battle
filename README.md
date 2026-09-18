# 航海王卡牌对战（OP-TCG Battle）

航海王题材、OP-TCG 规则风格的卡牌对战游戏：游戏王式积分制 + 同构 JS 引擎（纯数据状态机、动作驱动、确定性回放）+ 三档启发式 AI + 原生 DOM 前端。零依赖，无构建时编译步骤，离线可玩。

## 在线试玩

**https://frandy820.github.io/optcg-battle/**（手机浏览器直接开，免安装免注册）

## 玩法速览

- **积分制（LP）**：双方船长各 10000 LP，攻击按战力差额扣分，扣到 0 判负
- **贝里**：每回合自动补 2 枚的「钱」，出牌花它、附着到卡上 +1000 战力
- **互斗与守备**：竖放＝攻击表示（互斗比战力），横放＝守备表示（只比战力不掉分）
- **反击**：带「反击 +NK」角标的手牌可在对方攻击时垫高防守
- **恶魔果实克制**：超人→自然→动物→超人循环，攻方克制 +1K
- **装备**：武器/甲胄穿上角色永久增益
- 六位船长各有专属技能 · 150+ 张卡 · 图鉴 / 卡组构筑器 / 天梯排位 / 生存挑战 / 断档续局

## 目录结构

```
engine/   状态机引擎（纯数据无方法，动作驱动，seed 确定性）
ai/       合法动作枚举器 + 三档启发式 AI（easy/normal/hard）
data/     cards.json 卡池（6 领袖 × 6 色）
web/      原生 DOM 前端；app.bundle.js 为打包产物（自动生成勿手改）
scripts/  bundle 打包 / balance-sim 平衡模拟 / verify-all 一键验证 / deploy-pages 发布
tests/    node:test 单测 + selftest + 真实点击流 E2E
docs/     平衡模拟报告
```

## 本地运行

```bash
# 免 server 离线玩——直接用浏览器打开 web/index.html（file:// 协议）
# 或起后端（静态页 + 存档 API）：node server/server.js（默认 8180）
```

## 常用命令

```bash
npm test          # = node --test（注意：node v24/Windows 下不能带 tests/ 目录参数，会 MODULE_NOT_FOUND）
npm run check     # 全部源码 js 过 node --check 语法门禁
npm run bundle    # = node scripts/bundle.js，把 engine+ai+data 打成 web/app.bundle.js
npm run verify    # 一键六阶段：syntax → engine → build → selftest → e2e → offline
node scripts/balance-sim.js --games 30   # 平衡模拟矩阵（15 非镜像+6 镜像 matchup）
node scripts/deploy-pages.mjs            # 构建 gh-pages 孤儿分支并推送（GitHub Pages 发布）
```

**改了 engine/、ai/、data/ 之后必须**：`node scripts/bundle.js` 重新打包 + `npm run verify` 全量回归。

## 平衡模拟工具（dev-only，不暴露给玩家）

- 固定 seed（FNV-1a 按 matchup 散列 + makeRng 注入），同参数完全可复现
- 输出 `docs/balance-report.md` + `docs/balance-report.json`：胜率矩阵、平均/最长回合、动作数分位、终局方式、卡死与异常计数
- 目标门禁：全部非镜像 matchup 胜率落在 30%-70%

## 存档说明（localStorage）

浏览器本地存档全部挂在 `optcg_` 前缀下（对局快照 / 自建卡组 / 天梯积分 / 生存连胜 / 匿名 id），前端设置面板提供导出与清空。

## 测试

103 项 node:test 引擎单测 + 42 项 selftest 页断言 + 真实点击流 E2E（五模式）+ offline 断网可玩验证 + 150 局平衡模拟守门。

## 声明

航海王（ONE PIECE）及其角色版权归尾田荣一郎 / 集英社 / 东映动画所有。本项目为个人学习与粉丝交流用途的非商业作品；规则与数值为自创设计（仅借鉴 OP-TCG 机制思路），角色立绘来自公开网络资料，如有侵权请联系删除。
