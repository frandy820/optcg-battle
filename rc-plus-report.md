# RC+ 专项报告 — optcg-battle

> 生成：2026-09-16 · 分支 `feature/rc-plus-polish` · 基线 commit `e68b1ec`（RC 交付后）
> 范围红线：不加新模式/卡池/商城/联网/剧情/音效/多人；不覆盖可运行版本；不部署不发布；不让测试通过而关闭规则。

## 0. Git 基线与最终状态

| 项 | 值 |
|---|---|
| 基线 | `e68b1ec`（master，RC 交付态；30 个 JS / 89 测试 / bundle 10 项全过） |
| 分支 | `feature/rc-plus-polish` |
| 最终 commit | `fcb0f1f`（feature/rc-plus-polish；未合 master、未部署未发布） |
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

## 10. 合并前最终验收（2026-09-16 晚，用户人工试玩准备轮）

### 一致性审计
分支 `feature/rc-plus-polish`，工作区干净；HEAD 链 = `e68b1ec`（基线）→ `fcb0f1f`（RC+ 收口）→ `6c5c31c`（报告回填哈希，纯文档）→ `7e1f1c2`（本轮审计修复）。报告所列 12 项测试资产全部在库；`web/index.html` 与 `app.bundle.js` 零测试引用；临时探针（`__shot_*`/`__probe_*`/`__r5h`/截图/dump/profile）已全部清除；79 张卡图+字体全本地、零 CDN/远程字体/外链；唯一网络点 `modes.js` `/api` 云探测（超时+catch，失败静默离线）。

**审计发现并修复（P1，commit `7e1f1c2`）**：`game.js` 尾部遗留 `?autostart/?open=help/?level/?autoplay` URL 调试参数钩子（截图/回归期残留，正式页可被 URL 直接自动开局）。全仓零使用方（E2E 走真实点击流、selftest 走 API），移除。修复后 `npm run verify` 六阶段全绿复核。
另：用户指令提及的 `playability-report.md` 在全仓与 git 历史中均不存在（RC 可玩性专项结论已并入本报告 §1 与 backlog），如实记录。

### 质量门禁（本轮实际运行）
`npm run verify` 首跑 selftest 阶段一次偶发「无结果」（虚拟时钟早耗尽、页面静默；同命令手动复跑 SELFTEST-PASS-42），完整重跑：**VERIFY-ALL-PASS**——syntax 0.5s(7 JS) / engine 5.2s(90 pass) / build 重打包+新鲜度 / selftest 8.2s(42 断言) / e2e 17.6s(四模式 37+28+9+13) / offline 6.6s(file:// 完整对局)，EXIT=0。

### 真人路径两局模拟（CDP 真实点击流，正式 index.html 零测试参数）
**RCP-PASS-52/52**，P0/P1 = 0：
- 局1（默认新玩家）：引导出现→跳过→大厅→不选船长直接出航（默认船长兜底）→出牌生效→费用不足有原因提示（「费用不足：还需 3 颗 DON!!」）→攻击者选择/目标高亮/再点取消/重选/点击敌方领袖攻击并结算→终局（胜利，turn 6，出牌 13/攻击 13）→再战直接开新局
- 局2（连续状态）：帮助开/关双路径（按钮+Escape，关闭钮 698-741 常驻可见）→AI 回合点无效区 errors=0→「结束回合」快速连点×5 无异常且对局可继续→刷新页面→断档续战入口出现（hasUnfinished=true）→续战恢复 turn=3（非新局）→打完（turn 6）→返回港口→换第二位船长（.pick 选中态）→出航开局成功
- 全程原生弹窗 0、JS 错误 0

### 视口与断网抽验
- 390×748（固化方法 `tests/e2e/layout.html`）：**LAYOUT-PASS-13**（含 14 张手牌行内横滚+渐隐、满战场 7+7 换行、页面零横滚）
- 430×748（iframe 真视口探针）：**VP-PASS-11**（15 张手牌 sw726/cw422 收敛进行内、顶栏 3/3、满战场 422/422、页面 0 横滚）
- 桌面 1200×800：**VP-PASS-10**（12 张手牌未溢出、满战场 1080/1080、0 横滚）
- 断网：verify offline 阶段 file:// 完整对局 PASS（6.6s）+ 本轮两局 CDP 模拟亦全程 file://（云探测走 catch、存档图片本地）= 双证据

### 本轮新增 commit 与文件
- `7e1f1c2`：`web/game.js` 移除 URL 调试参数（-10/+2）
- 随后文档 commit：`docs/player-acceptance.md`（新增，面向试玩者：启动方式/10 分钟任务清单/12 观察点/反馈模板/已知限制）+ 本节增补

### 结论
**可以进入用户人工试玩验收，暂不建议合并 master**（候选代码 commit `7e1f1c2`）。

## 11. 试玩反馈第一轮：卡片悬停信息卡（2026-09-16）

用户试玩反馈：「每张卡片要加使用说明，鼠标放到卡片上的时候要出现卡片的所有信息；玩起来一头雾水——船长卡片竖着和横着放有什么不同，卡片竖着和横着又有什么区别」。

### 实现（commit `f8cb817`，文件 `web/game.js` + `web/style.css` + `tests/e2e/player-flow.js`）
- **触发**：桌面鼠标悬停任意卡片（mouseover/mousemove 委托，`.card` 排除 `.card-back`）；触屏长按 550ms（振动 15ms 反馈，移动 >10px 取消，长按后的一次 click 捕获吞掉防误出牌）；Escape/滚动捕获/窗口失焦隐藏；`renderAll` 重渲染先收起（悬停中的卡元素已被替换，鼠标微动即按新场面重出）。
- **内容**（`#cardTip`，role=tooltip）：卡名+副标题 / 类型·颜色·生命 / 费用·战力·反击 / 关键词逐条人话解释（`KW_TIP` 四条）/ 效果人话（`effectText` 覆盖全部 6 种 hook:op 组合，白板角色给定位说明）/ **状态行**——在手牌（点击打出+反击提示）、舞台（持续在场）、竖放=就绪（还能攻击/阻挡）、横放=已休息（本回合已行动、不能攻击不能阻挡、拥有者回合开始转回竖放）、已附着 N 颗 DON!!（+NK、回合开始脱落）。
- **配套**：帮助面板新增「竖放与横放」一节（含「对方卡片全横着时就是安全进攻窗口」策略提示）；don/leader 渲染补 `dataset.dons`；移除 `cardEl` 原生 title 防双弹；小屏（≤640）改固定底部条不遮手牌滑动。
- **测试**：e2e main 模式新增 3 断言（悬停弹出且 >20 字 / 含数值与竖横状态语义 / Esc 关闭），非 hover 设备跳过并注明触屏走长按人工验收。

### 验证
`npm run verify` 六阶段全绿（e2e 四模式含新 3 断言）；CDP 正式页截图两场景（手牌卡/船长卡）结构目检 + 金边像素定位裁片放大 2× 文字级目检：各行完整可读、无重叠/无裁切/无过早断行、六区分层清晰。竖/横语义在信息卡与帮助面板双通道可发现。

### 验证限制
- 触屏长按路径为人工验收项（E2E 环境非 touch 指针），390 底部条样式未做 iframe 实拍；不影响桌面主路径。
- 效果人话映射按当前卡池 6 种组合穷举——未来扩卡池新 hook:op 会落到「白板」兜底文案（可发现但不误导），扩池时需同步 `effectText`。

## 12. 试玩反馈第二轮：游戏王式积分制改造（2026-09-17）

用户反馈：「应该是通过卡片之间对战、扣积分定胜负的吧，看看游戏王的规则」+「阻挡/反击弹窗烦」+「英文横幅看不懂」+「规则不清楚（上场当回合能否攻击、对方竖卡能否被打）」。经确认改为游戏王式积分制。

### 规则改造（引擎）
- **LP 积分制**：`lp = 船长 life × 2000`；LP ≤ 0 判负（winReason='lp'）。生命卡机制整体删除（deck=50-5-1 全在牌库，攻击不再翻卡/补牌/触发 trigger）。
- **目标规则**：对方场上有角色（横竖均可）→ 必须指定角色；场空 → 只能直攻船长。
- **互斗（竖=攻击表示）**：比较战力，攻高→守方 KO+守方扣差额 LP；守高→攻方 KO（船长不沉）+攻方扣差额；相等同归于尽无伤害。
- **守备（横）**：攻 > 守才击沉、无差额伤害；攻 ≤ 守无战果。
- **直攻**：伤害 = max(0, 攻−船长战力−counter)；doubleAttack→差额×2，banish→+2000。
- **blocker 重定义为「坚壁」**：顶包挡刀机制删除（respondBlock/passBlock/block 樗窗全移除），blocker=被攻击时防御+1000（横竖皆生效）。counter 保留（互斗垫守方战力/直攻减伤）。
- 修复 fuzz 抓出的 KO 索引位移 bug（board splice 后 attached.idx 未修正 → takeDon 报引擎不一致）。

### 平衡调整
- 蓝黑船长 life 4→统一 5（LP 制下少 20% 血无补偿，是蓝黑全 matchup 垫底的系统性根因）；YELLOW-03 4K→3K；BLUE-02/03/04/07 四张补强；GREEN-05~10 削 1K；AI 坚壁预估 2000→1000 与引擎同步。
- 结果：normal 矩阵 15 个非镜像 matchup **全部落在 30%-70% 带内**（蓝v黄 25%→36.7%），平均 6-8 回合，balance.test 回归绿。

### UI/文案
- LP 徽章+血条替换生命卡渲染（低血变红）；攻击 'lp' 事件伤害数字演出；横幅全中文化（决斗！/反击！）。
- 目标高亮按新规则（有角色高亮全部角色/场空高亮船长）；点击船长在对方有角色时前置拦截并提示。
- **响应面板降噪**：无反击牌自动结算不弹窗；新增「本局不再询问」勾选（随新局重置）。响应面板仅剩反击窗。
- 帮助面板 10 节全文案重写；悬停信息卡状态行改为「竖放=攻击表示（互斗）/横放=守备表示（不损 LP）」语义；blocker→坚壁、banish→猛击文案随新语义更新；船长卡/图鉴显示 LP 10000。

### 测试
- engine.test/rc.test ~20 项重写为 LP/互斗/守备/坚壁断言；cards.test 数值区间带更新（LP 互斗时代同费带 (cost+1)~(cost+3)K）；e2e 攻击断言改 LP 制（优先打角色/舞台维度/自动结算兼容）；rounds 循环目标选择适配。
- 修复两处存量 e2e flaky：①手牌攻击循环从不点场上角色（新规则下船长不可选→全场 0 攻击）；②bgDrift 动画 transform 偶发撑出 390 文档 3-6px 假横滚（改 background-position + html/body overflow:clip 根治）。
- **修复 Chrome 弹窗事故**：Chrome 152 已弃用 `--headless=new`，e2e/verify 的 Chrome 以可见窗口启动（用户连续三轮投诉）。两处 runner 改 `--headless`，事件级监视器实证零新增可见窗口。

### 验证
`npm run verify` 六阶段全绿（93 单测 + selftest 42 + e2e 四模式 + offline）；e2e 连跑 10+ 轮观察 flaky 收敛（出牌假阴性=舞台卡三断言全漏，已补舞台维度）。

### 验证限制
- 触屏长按/移动端实拍仍为人工项；「本局不再询问」在 e2e 未单独走查（勾选交互简单，逻辑与自动结算共用路径）。
- 平衡矩阵为 AI 同档对垒口径（normal×60/matchup），人类玩家实战 meta 可能偏移。
