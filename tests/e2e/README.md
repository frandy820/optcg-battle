# E2E 真实点击流测试（RC+ 正式资产）

## 文件
- `player-flow.js` — 测试脚本本体（被 `web/e2e.html` 挂载；**不挂正式 index.html、不被 app.bundle.js 加载、无玩家可见入口**）
- `web/e2e.html` — 测试入口页（与 selftest.html 同构的独立测试页；部署在线上但无任何入口链接，等价 selftest 的定位）
- `layout.html` — 小屏布局回归宿主页：固定 390×748 iframe 精确视口（headless `--window-size` 不落到布局视口，实测 390 物理 → innerWidth 504）
- `run.mjs` — 无头 Chrome 驱动器（file:// 直开，无 HTTP server；跑 main/rounds/edge/layout 并解析结果）

## 跑法
```bash
node tests/e2e/run.mjs                    # 全量：main + rounds(连续3局) + edge(两段) + layout(390小屏)
node tests/e2e/run.mjs --only main        # 单跑某模式
node tests/e2e/run.mjs --only rounds
node tests/e2e/run.mjs --only edge
node tests/e2e/run.mjs --only layout      # Chrome 需 --allow-file-access-from-files（runner 已带）
```

## 模式
- `main`：默认新玩家一局完整流（引导→跳过→未选船长出航→默认船长→出牌/攻击/结束回合→AI→终局→结算→返回→再开局）；34 断言
- `rounds`：连续 3 局（局1 结算后再战；局2 返回大厅换船长出航；局3 顶栏重新开局），监测局间状态残留/AI 节奏漂移/奖励重复/存档污染
- `edge`：破坏性边界两段式（连点/图挂/Escape/坏档），8 断言
- `layout`：390×748 真布局回归（大厅滚底模式卡/sticky CTA 同屏、help 关闭钮钉底、10+ 手牌横滚收敛进行内+渐隐提示），12 断言；锁 R5 两处修复

## 原则
- elementFromPoint 中心命中校验（防遮挡/假按钮）；alert/confirm/prompt 全记为问题
- 等待一律轮询条件本身（waitFor），禁用大固定 sleep；每步时间戳入 timeline 供节奏审计

## 超时与负载（2026-09-16 实测）

- Chrome 虚拟时间预算在 CPU 拥塞期（多会话并行）真实执行远慢于虚拟刻度：300s 真实上限不够 → main/rounds ETIMEDOUT。
- `run.mjs --timeout 600` 放宽单模式真实上限（默认 300）；一键全量含断网走 `npm run verify`（scripts/verify-all.mjs，六阶段）。
