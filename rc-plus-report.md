# RC+ 专项报告 — optcg-battle

> 生成：2026-09-16 · 分支 `feature/rc-plus-polish` · 基线 commit `e68b1ec`（RC 交付后）
> 范围红线：不加新模式/卡池/商城/联网/剧情/音效/多人；不覆盖可运行版本；不部署不发布；不让测试通过而关闭规则。

## 0. Git 基线与最终状态

| 项 | 值 |
|---|---|
| 基线 | `e68b1ec`（master，RC 交付态；30 个 JS / 89 测试 / bundle 10 项全过） |
| 分支 | `feature/rc-plus-polish` |
| 最终 commit | `<本报告定稿 commit，见 git log -1>` |
| 改动文件 | 代码 4：`web/game.js`（R1 响应面板机制文案）、`web/style.css`（R5 三处小屏修复）、`web/index.html`/`web/selftest.html`（E2E 宿主同构与 selftest 加速档）；工具 3：`scripts/balance-sim.js`（60 局扩展/峰值观测）、`scripts/verify-all.mjs`（新增一键验证）、`package.json`（verify 脚本）；测试 5：`tests/balance.test.js`（新增）、`tests/e2e/{player-flow.js, run.mjs, layout.html, README.md}`（新增）、`web/e2e.html`（新增 TEST-ONLY 宿主）；数据 3：`docs/balance-report.{md,json}`（60 局再生）+ `before-60.json`（基线副本） |

## 1. R1 三轮真实试玩审计

### 方法
第一轮（默认新玩家）用 headless Chrome 截图序列走关键节点（首访大厅+引导弹出、对局首屏、攻击目标选择、响应面板、结算），VLM 审查 + DOM 探针/像素统计仲裁；第二、三轮（连续 3 局 / 破坏性操作）由固化 E2E 的 `rounds`（状态残留/节奏漂移/弹窗清零/断档清零）与 `edge`/`edge2`（连点/图挂/Escape/坏档/边界）模式程序化覆盖。

### 第一轮发现与处置
| # | 发现 | 级别 | 处置 |
|---|---|---|---|
| 1 | 「引导洞内无船长卡（深蓝空白）」 | P0 候选 | **证伪**：DOM 探针（500→5900ms 四时刻，6 卡在洞内 visible）+ 同参数复现截图（卡区像素 std≈40，正常渲染）均正常；原空白系 F 盘拥塞期虚拟时间预算内资源未落定的截图伪影。记入 §6 验证限制 |
| 2 | 反击/阻挡文案不解释机制（「+1K 反击」新玩家不知是减伤还是反打） | P2 | **已修**：`game.js` openResponsePanel 文案补机制说明（反击=累积防守战力、≥攻方即反杀；阻挡=代替承受、不足则阻挡者沉船长无伤）。E2E rounds 已覆盖面板打开与通过路径 |
| 3 | DON 费用区无可见文字标签（仅金色圆点） | P2 | 引导第 3 步 + hint 条 + title 已覆盖；R5 小屏复查后定 |
| 4 | 引导「跳过教程」按钮视觉偏弱 | P2 | 记录不修（功能可达，非阻断） |
| 5 | VLM 报「提示条错字」 | — | 核源串（`点敌方领袖或已横置角色，再点攻击者可取消`）无错字，小图幻读撤销 |

P0/P1：**0 项**。

### 第二/三轮（E2E 程序化）
- `rounds`（连续 3 局：再战→返回大厅换船长→对局中顶栏重开走确认模态）：**28/28 断言全过**——局间无状态残留（时长漂移比 <4、AI 回合节奏无变慢、原生弹窗 0、JS 错误 0、终局后存档断档清零）。连续局中对局代码含超长局兜底（guard 260 步预算 + 未分胜负局强制重开续跑，审计统计只计分出胜负的局，防单局运气级联污染）。
- `edge`/`edge2`（连点出航×5 / 卡图 404 占位 / Escape 关面板 / 空选择不崩 / 坏档 `{{{corrupted` 后不白屏可进局+自动备份）：**9/9 全过**。
- P0/P1：**0 项**（第一轮的 P0 候选已证伪，见上表）。

## 2. R2 离线可靠性

静态审计（前段完成）：全前端唯一网络点 = `modes.js` 云同步探测（`/api/...`，1.2s 超时 + catch → `cloud.on=false`，上传 `.catch(()=>{})` 不影响本地）；79 张卡图/字体/脚本全部本地；无 CDN/远程字体/SW/外链。存档 local-first（localStorage，save.js 全 try/catch）。

断网实测：`npm run verify` 的 `offline` 阶段用 `file://` 直开 e2e.html（零 HTTP server，fetch file:// 被 Chrome 禁止 → 云探测立即走 catch）跑完整对局 main 模式。
结果：**PASS（E2E-PASS-37，实测 6.8s）**——无网络依赖下完整打完一局全部 37 项断言，云失败路径静默不阻塞（modes.js 1.2s 超时 + catch → `cloud.on=false`），存档全程本地。

## 3. R3 平衡

工具：`scripts/balance-sim.js`（15 非镜像 + 6 镜像 matchup、FNV-1a 固定 seed、交替先后手、STALL=500 卡死检测、`--baseline` 前后对比；本轮已扩展满手牌峰值/空牌库回合观测）。

大样本结论（60 局/matchup，normal AI 对垒，2026-09-16，`docs/balance-report.md`）：

| 对阵 | 胜率 | 对阵 | 胜率 |
|---|---|---|---|
| 红 vs 黑 | 55.0% | 蓝 vs 黑（最高） | 65.0% |
| 红 vs 绿 | 58.3% | 绿 vs 紫（最低） | 36.7% |

- **normal 全矩阵 15 个非镜像 matchup 均在 30%-70% 目标带内**；0 卡死 / 0 异常 / 0 平局；手牌峰 11、空牌库局 0（无满手牌/空库病态）。
- 红色劣势（曾 30%）系 RC 前段数据层修正（30→60），本轮 60 局大样本复核稳定在带内（55%/58.3%）→ **本轮零数值改动**。
- hard 抽样（16 局/matchup，置信 ±25pp）存在超带点（黄 vs 紫 12.5%、紫 vs 黑 75%、蓝 vs 黑 25% 等）→ **样本量不足以支撑数值改动，按指令明确记录不调**；且 hard 为同档 AI 对垒，玩家主路径为 easy/normal。
- 30→60 局同口径对比显示 30 局样本噪声可达 ±18pp（黑镜像 -18.3），印证加大样本必要性。
- **回归固化**：新增 `tests/balance.test.js`（固定 seed 确定性锁「红 vs 黑/绿 带内」，<0.1s，随 `npm test` 跑）——未来调池把两 matchup 推出带外即红灯。

## 4. R4 测试与发布工程化

- E2E 资产固化：`tests/e2e/{player-flow.js, run.mjs, README.md}` + `web/e2e.html`（TEST-ONLY 宿主页，正式页面无入口、不进 bundle、无玩家可见调试口）。三模式：main（34 断言新玩家全流程）/ rounds（连续 3 局残留审计）/ edge+edge2（破坏性 8+ 断言）。
- selftest 300s 预算根因：autoplay 固定 420ms 步进 ×4 局串行 → `autoplay(n, stepMs)` 加速参数（测试传 50/10ms，玩家路径不变）。
- 一键验证：`npm run verify`（`scripts/verify-all.mjs`）六阶段 = 语法（web 全 JS `node --check`）→ 引擎（`node --test` 90 项）→ 构建（bundle 重打包+新鲜度）→ selftest（180s 虚拟预算）→ E2E（三模式）→ 断网（file:// 完整对局）。单阶段失败继续跑完全景报告，退出码非 0。
- 超时口径：Chrome 虚拟时间在 CPU 拥塞期真实执行远慢于虚拟刻度，`--timeout` 参数放宽单段真实上限（默认 300s，拥塞期 600s；2026-09-16 实测 300s 三连 ETIMEDOUT）。

全量验证结果：`VERIFY-ALL-PASS`（六阶段：syntax 7 JS / engine 90 test / build 重打包+新鲜度 / selftest 42 断言 / e2e 四模式 main 37 + rounds 28 + edge 9 + layout 13 / offline file:// 完整对局）。总耗时 <1 min（本机空闲期实测；CPU 拥塞期 e2e 需 `--timeout 600`，见 §6）。

## 5. R5 390/430 小屏

### 方法（真布局视口）
headless Chrome 的 `--window-size` 不落到布局视口（实测 390 物理 → `innerWidth` 504，落在 461-760 断点带 ≠ 390 的 ≤400 带）——本轮所有小屏量测改用**固定尺寸 iframe**（390×748 / 430×748）强制精确视口，媒体查询/innerWidth 以 iframe 为准；断点带宽 640/460/430/400。该手法已固化为正式回归 `tests/e2e/layout.html`（LAYOUT 模式 13 断言）。

### 发现与修复
| # | 发现 | 级别 | 处置 |
|---|---|---|---|
| 1 | 390 下 10+ 手牌把 grid 轨道撑过视口（实测 sw 464 > 390）：页面级横向滚动，顶栏「重新开局/返回港口」被推出屏外 | P1 | **已修**：≤640 下 `#app` 单列 `minmax(0,1fr)` + `#app>*{min-width:0}` + hand-wrap/hand-row `max-width:100%`——横滚收敛进手牌行内。修后 11 张手牌：行内滚动（sw 514/cw 382）、右缘渐隐提示亮、顶栏三钮全回屏 |
| 2 | 战场行 `.row` 无 wrap：7+ 单位把页面撑出 3-6px 横滚（长局随机出现） | P1 | **已修**：≤640 下 `.board-row{flex-wrap:wrap}`；注入 7+7 单位的确定性断言过 |
| 3 | help 关闭钮排在正文流末尾：390 下需滚 353px 正文才可见（触屏无 ESC） | P2 | **已修**：`.help-card` 改 flex 纵列、正文内滚（`overflow-y:auto`）、操作行钉底——关闭钮常驻可见（390/430/1200 三档验证；桌面内容放得下时无多余滚动条，无回归） |
| 4 | 390/430 全场景核验通过项 | — | 大厅首屏出航钮可见（sticky-cta）✓；滚底模式卡→AI 难度→出航全序同屏 ✓；builder 390 整体放得下（642≤711）操作钮可见 ✓；响应面板居中完整 ✓；结算标题/按钮完整（大字 722px 为动画包围盒伪数，渲染无裁）✓；引导洞内船长卡+跳过钮可达 ✓；顶栏/提示/按钮 7 元素文本零截断 ✓；430 各场景较 390 无退步 ✓。设置面板：本项目无设置页（N/A） |
| 5 | 结算标题 `getBoundingClientRect` 宽 722px 超 390 视口 | — | 截图目检标题「战败」完整无裁——入场动画包围盒伪数，非缺陷，撤销 |

回归固化：`tests/e2e/layout.html`（LAYOUT 13 断言，连续 4 次运行全绿）锁死上述 1/2/3 项。

**视觉仲裁记录**：本轮 VLM/截图结论有 3 项经 DOM/像素复核后撤销（引导遮罩暗块=暗色主题误读、hallbottom 模式卡不可见=裁片窗口伪影、endTitle 截断=动画包围盒），与 §6 验证限制一致。

## 6. 验证限制与风险

- **E2E 对系统负载敏感**：虚拟时间预算本质是 CPU 密集快进，多会话并行拥塞期 300s 真实上限不够（已用 `--timeout 600` 与错峰缓解；上午低负载同命令 300s 内全过）。结论解释时须注明当时负载。
- **截图审查的环境伪影**：F 盘拥塞期虚拟时间内图片/渲染可能未落定（§1 发现 1），截图结论一律需 DOM/像素仲裁后才采信；本轮另撤销 3 项 VLM 误报（§5）。
- **headless 视口怪癖**：`--window-size` 不落到布局视口（390 物理 → innerWidth 504）——小屏结论必须走固定尺寸 iframe（已固化 layout 模式），凡基于裸 window-size 的小屏截图/探针结论一律不可采信（本轮早期产物全部重测过）。
- hard 档平衡：样本不足，未调（§3）。
- layout 模式的 scroll 事件断言用手动 dispatchEvent：dump-dom 虚拟时间不泵渲染步、程序赋值 scrollLeft 不派发 scroll 事件——真机触屏滚动走同一路径，不影响结论，但该断言验证的是「scroll→渐隐」接线而非浏览器事件时序。

## 7. Backlog（不属本轮）

- 引导跳过按钮视觉强化；DON 区常驻文字标签；战报字号/密度。
- hard 档平衡大样本审计（需 ≥60 局/matchup）。
- 430 档 E2E 化（当前 layout 模式固定 390；430 已由 iframe 探针逐项核验，机制与 390 同带）；响应面板按钮触屏命中区实测（当前仅几何可见性）。

## 8. 保留测试与清理清单

- 保留（全部可复现）：`tests/e2e/{player-flow.js, run.mjs, layout.html, README.md}`、`web/e2e.html`、`web/selftest.html`、`tests/balance.test.js`、`scripts/verify-all.mjs`、`scripts/balance-sim.js`、`docs/balance-report.{md,json}` + `before-60.json`。
- 已删临时产物（过程用探针/截图，非交付物）：
  - 探针页 6：`web/__shot_r1.html`、`__shot_r5.html`、`__r5h.html`（iframe 量测 harness，其逻辑已固化为 `tests/e2e/layout.html`）、`__probe_r5b/r5c/vp.html`
  - 截图/DOM dump：Temp 下 `p1-*.png`、`r5-390-*.png`(9)、`r5-430-*.png`(2)、`off-main-dom.html`、`_vp_shot.png`、`_r5*`/`_vp*` Chrome profile 目录；`F:\Cache\temp` 下 `p1-states-review.png`、`r5-review-grid.png`、`r5-hallbottom-crop.png`、`r5t-*.png`、`r5t-grid.png`
  - 运行痕迹：`data/backup/store-2026-09-16.json`（E2E 测试用户时间戳）已还原至基线

## 9. 实际命令与结果摘录

- `npm test` → 90 pass / 0 fail（含新增 balance 固定种子回归）
- `node scripts/balance-sim.js --games 60 --hard-games 16 --baseline docs/balance-report.before-60.json` → 全带内 / 0 异常，吞吐 3509 局/s
- `node tests/e2e/run.mjs` → main E2E-PASS-37 / rounds E2E-PASS-28 / edge E2E-PASS-9 / layout LAYOUT-PASS-13（连续 4 次全绿）
- `npm run verify`（终版复跑）→ **VERIFY-ALL-PASS**：syntax 0.4s(7 JS) / engine 4.6s(90) / build 0.1s / selftest 26.3s(42 断言) / e2e 26.7s(四模式) / offline 5.7s(file:// 完整对局)；总 1.1 min，EXIT=0
- 真 390 布局修复验证（iframe 探针）：手牌 11 张 sw 514/cw 382 行内滚动 + fadeR 亮 + 顶栏三钮回屏；help 关闭钮 651-694 常驻可见（修前 1024-1067 折叠线下）；满战场 7+7 单位换行 382/382 无页面横滚
