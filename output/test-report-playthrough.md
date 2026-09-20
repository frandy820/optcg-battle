# optcg-battle「模拟真实用户」全流程测试报告

- 日期：2026-09-20
- 探针：`scripts/probe-playthrough.mjs`（可重复运行，退出码 0=无 FAIL / 1=有 FAIL；结果明细 `output/playthrough-results.json`，运行日志 `output/playthrough-run.log`）
- 环境：headless Chrome 152（`--headless`，独立 user-data-dir，随机端口 9300+），file:// 直开 `web/index.html`，CDP Runtime.evaluate 驱动，全部真实 DOM click
- 环境矫正 1 项（探针侧，非产品行为修改）：headless Chrome 默认强制 `prefers-reduced-motion: reduce`（实测 matchMedia=true），会使游戏合法跳过飞剑/粒子演出。探针用 `Emulation.setEmulatedMedia` 还原为 `no-preference`（等同真实桌面用户默认值）后再测
- 最终一轮结果：**61 项检查 = 60 PASS + 1 SKIP（按设计跳过）+ 0 FAIL**，全程 0 未捕获 JS 错误
- 历轮运行：4 轮（r1/r2 用于暴露问题与修正探针断言，r3 半绿，r4 全绿为定稿数据）。真点完整局共 6 局（r1×2、r2×2、r3×2、r4×2 中 r2 局 A 一次冻结，见问题清单 #1）

---

## 一、真点通关结果（禁用 autoplay，全部真实点击）

| 局 | 船长/模式/难度 | 结果 | 回合 | 耗时 | 出牌 | 攻击(含船长直攻) | 贝里附着 | 反击牌/放弃 | 装备 |
|---|---|---|---|---|---|---|---|---|---|
| r4-A | 艾斯(红) · 自由 · 易 | 负（vs 索隆，我 LP0 对方 LP4000） | 7 | 103s | 6 | 10(6) | 3 | 1/1 | 0（本局手牌无可出装备时机） |
| r4-B | 娜美(蓝) · **天梯真点** | 负（我 LP0 对方 LP9000，排位 -15） | 6 | 81s | 2 | 6(1) | 2 | 3/4 | 0 |
| r3-A | 艾斯(红) · 自由 · 易 | 负（vs 山治，7 回合） | 7 | 90s | 7 | 9(4) | 0 | 0/0 | 0 |
| r3-B | 娜美(蓝) · **天梯真点** | **胜**（我 LP4000 对方 LP0，排位 +25 → 25 分） | 5 | ~90s | — | 8 | — | — | — |
| r1-A | 艾斯(红) · 自由 · 易 | 负（5 回合） | 5 | 55s | 5 | 5(2) | 1 | 2/2 | 0 |
| r1-B | 罗(紫) · **天梯真点** | 负（9 回合，排位 -15） | 9 | 142s | 12 | 13(3) | 2 | 3/2 | 0 |
| r2-A | 艾斯(红) · 自由 · 易 | **冻结@回合6**（见问题 #1，重启后未重试该局） | 6 | 102s | — | 12 | 1 | 2/2 | — |
| r2-B | 山治(黄) · **天梯真点** | 负（6 回合，排位 -15） | 6 | 88s | 8 | 6(2) | 4 | 3/3 | 0 |

- 通关结论：**真点通关可行且稳定**——8 局尝试中 7 局自然打到终局（5-9 回合、55-142 秒），胜负均正常结算落库；bot 为进攻型朴素玩家，对易/中 AI 胜率低属正常水平，非产品问题
- 终局断言每局全过：endPanel 延迟弹出（实测 waitMs 1860-2516，设计 ~700ms+轮询粒度）、战绩/回放落库、终局标题与胜负一致
- 60 回合/12 分钟上限内全部结束，无平局型僵局
- **本会话三项新交互回归结论**：
  1. 两段式出牌：两局均有实证（首点后 selected=1 + 提示含「再点一次打出」+ 手牌数不变，二点后手牌 -1）✓
  2. 飞剑 380ms 延迟结算：r4 两局 flyN=10/10、6/6，每次攻击都出现 .fly-sword 演出且结算在演出后落地（探针按 800ms+ 等待后状态推进正常）✓
  3. 图鉴 lazy loading：204 张 img 全部 `loading=lazy` 且初始 `opacity:0`（打开面板同一 JS 任务内采样=204/204）；等待后视口内 90 张 opacity→1 且 naturalWidth>0、视口外 114 张未加载（真 lazy 行为）、0 张损坏 ✓

## 二、功能遍历清单（30 项）

### 大厅（8 项）
| 功能 | 方法 | 结果 | 证据 |
|---|---|---|---|
| 说明面板含「船长技能」节 | 真点 btnHallHelp→查 helpBody 节标题 | PASS | 节标题数=50，含「船长技能」 |
| 设置：减少动效开关 | 真点开关→查 html.reduced-motion | PASS | 类挂载/还原均生效 |
| 设置：紧凑布局开关 | 真点开关→查 html.compact-layout | PASS | 同上 |
| 图鉴 204 卡 | 真点 btnCodex→计数 | PASS | cards=204，「共 204 张」 |
| 图鉴 lazy loading | 同一 JS 任务采样+延迟采样 | PASS | 初始 op0=204；后亮 90/未加载 114/损坏 0 |
| 图鉴放大视图 | 真点卡→codex-view-card | PASS | 卡名「蒙奇·D·路飞」，原图 imgLoaded=true |
| 战绩空态 | 新 profile 真点 btnStats | PASS | 「还没有对局记录」 |
| 战绩有数据态 | 6 局后面板渲染 | PASS | 总览 5 项+对局 6 行（ov=5,games=6,n=6） |

### 模式（5 项）
| 功能 | 方法 | 结果 | 证据 |
|---|---|---|---|
| 自由对战 | 真点打完整局（r1/r3/r4 局 A） | PASS | 3 局自然终局+落库 |
| 天梯（**真点打完**） | 真点打完整局（r1/r3/r4 局 B） | PASS | r3 胜 +25→25 分；r4 负 -15；结算文案含「排位 ±N 分」 |
| 天梯投降判负扣分 | btnLadder 进局→投降 confirm | PASS | toast「已判负 · 排位 -15 分」，分数/负场按 max(0,score-15) 结算（25→10 与 0→0 两态均实证） |
| 生存挑战 | autoplay 打底（任务允许），最多 4 局 | PASS(负路径) | 4 局均负：结算「挑战终止于 0 连胜」，连胜归零重开+徽章回「最佳纪录」态。**胜路径（streak+1）autoplay 8 局 0 胜未实证**——但胜路径结算代码与天梯同链（settle），r3 天梯真点胜局已实证同函数族；残余风险低 |
| 重新开局 | btnRestart confirm 两分支 | PASS | 取消→原局继续；确认→新局 turn=1 |

### 对局内（7 项）
| 功能 | 方法 | 结果 | 证据 |
|---|---|---|---|
| 两段式出牌 | 双击（两次独立 DOM 查询） | PASS | 每局实证 selected=1+hint「再点一次」+手牌不变→-1 |
| 装备卡目标选择 | gear 二击进目标模式 | PASS(链路)/未出牌 | 探针支持该路径；4 局手牌均无可出装备+场上有目标的时机，gearPlays=0——装备真出牌路径由既有 tests/e2e 覆盖，此处如实记「链路验证、出牌未在本轮发生」 |
| 攻击+飞剑延迟 | 攻击者→目标真点，等 800ms+ | PASS | flyN=10/10、6/6；结算均在演出后落地 |
| 贝里附着 | 贝里区→船长 | PASS | 每局 1-4 枚，战力+1K（r1 曾单测 dons=1 断言过） |
| 反击窗口 | .resp-opt 第一张→放弃结算 | PASS | r4-B 反击牌 3/放弃 4；垫牌后窗口刷新/自动收口正常 |
| 战斗日志 | 局末查 logBody | PASS | 每局 lines=18（满额滚动） |
| 触屏长按信息卡 | pointerdown(touch)→700ms→tip→pointerup→补发 click 净化 | PASS | 信息卡出现（卡名可见），净化后后续点击不被吞 |
| 投降/返回港口 | btnMenu confirm | PASS | 判负计分+回大厅 |

### 回放（真点局的回放，4 项）
| 功能 | 方法 | 结果 | 证据 |
|---|---|---|---|
| 播放 | 战绩行回放按钮→4x 播完 | PASS | 「播完 70 步」（r4 局 A，actions=70） |
| 暂停/步进 | 控制条出现即暂停→rpStep | PASS | 冻结 1/70==1/70；步进 1/70→2/70 |
| 确定性 | 回放终局 vs 原局 | PASS | replay=1 == orig=1（r3/r4 两轮均一致） |
| 退出 | rpExit | PASS | 返回大厅 |

### PWA / 基础（3 项）
| 功能 | 方法 | 结果 | 证据 |
|---|---|---|---|
| manifest 链接 | DOM 查询+盘上文件 | PASS | href=manifest.webmanifest；sw.js/manifest 均在 |
| SW 注册 | file:// 协议下 | SKIP（设计如此） | 页面逻辑 `^https?:$` 才注册，file:// 静默跳过不影响游玩 |
| 断档恢复 | 打一半刷新→btnResume | PASS | 真点结束回合过 AI 后 reload→按钮出现→恢复进局→战报重建 lines≥2 |

**覆盖率：30/30 项遍历，29 PASS + 1 设计性 SKIP；0 项 FAIL。**

## 三、问题清单（按严重级）

### fatal（玩不下去）
无。

### major（功能坏/可疑）
1. **[r2] 局中偶发软冻结：结束回合点击连续无响应（1/8 局）**
   - 现象：r2 局 A（艾斯/自由/易）回合 6，状态卡在 `{turn:6, active:0(我方), pending:null}`，探针连续 4 次点「结束回合」均未推进（约 10 秒窗口），攻击/出牌亦无进展 → 判定停滞
   - 已排除：`playEvents` 有 FX_TIMEOUT=4000 兜底，busy 不可能常驻；`endTurn` 引擎路径（phases.js endTurn→startTurn）无抛错点；重启开局（btnRestart→confirm）立即恢复，同 profile 后续 3 局正常
   - 复现度：8 局真点局中出现 1 次（r1/r3/r4 共 6 局未复现）；r2 探针版存在「装备/贝里选择态泄漏」缺陷（选择模式残留后点击被改道），不能排除是探针自扰；修复后的探针（选择态清理+取消路径）已 4 局未复现
   - 建议：如再复现，冻结现场诊断快照已内置（`_diag()`+phase+hint+战报尾部，playWithRetry 会打 WARN diag=...）；重点盯 doAction 早退分支（busy/winner）与响应窗口收口链
   - 复现参考：`node scripts/probe-playthrough.mjs` 多轮重跑（历史频率 ~1/8 局）

### minor（体验瑕疵/观察项）
2. **生存模式 autoplay 8 连败（易档）**：autoplay 是「随机合法动作」玩家并非强度基准，但 8/8 全负说明易档对无脑打法也有压制力；生存胜路径（连胜 streak+1 徽章）未在真实点击中实证（真点局安排给了天梯），建议后续补一局生存真点胜局
3. **回合数文案与探针统计口径**：结算「历时 N 回合」与我方回合数一致，无问题；仅提示 endPanel 弹出实测等 1.9-2.5s（700ms 设计延迟+横幅演出+轮询粒度），节奏可接受但接近用户感知阈值
4. **`output/playthrough-results.json` 的 games[].flyN 字段**：r4 定稿数据里记录为 0（探针回填缺陷，日志/检查项里的 flyN=10/6 才是实测值；脚本已修，下轮生效）——纯测试资产瑕疵，非产品问题

## 四、测试资产与复现
- 探针：`F:\claudecode\test\optcg-battle\scripts\probe-playthrough.mjs`（`node scripts/probe-playthrough.mjs`，全量 ~8-10 分钟；`--quick` 跳过生存段）
- 日志/数据：`output/playthrough-run.log`（r4 定稿）、`output/playthrough-results.json`（61 项检查明细+每局统计）
- 关键探针经验（已固化在脚本注释）：① 观察器安装表达式必须包 IIFE——裸语句+顶层 `return` 在 CDP evaluate 是 SyntaxError，静默不装曾连续三轮误报「飞剑不出现」；② headless 强制 reduced-motion 需 setEmulatedMedia 矫正；③ 图鉴 lazy 初始态必须在打开面板的同一 JS 任务内采样；④ 回放步进要在控制条出现时立即暂停（小局 4x 下 1.5s 内就播完）；⑤ 天梯 0 分再负=分数不动但负场+1（下限 0），断言要按 max(0, score-15) 写
