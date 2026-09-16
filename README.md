# OP-TCG Battle

OP-TCG 规则风格的卡牌对战游戏：同构 JS 引擎（纯数据状态机、动作驱动、确定性回放）+ 三档启发式 AI + 原生 DOM 前端 + node 后端。零依赖，无构建时编译步骤。

> 卡池为自创：仅借 OP-TCG 规则机制，数值与卡面全部自设计；角色命名仅内网自玩用途。

## 目录结构

```
engine/   状态机引擎（纯数据无方法，动作驱动，seed 确定性）
ai/       合法动作枚举器 + 三档启发式 AI（easy/normal/hard）
data/     cards.json 卡池（6 领袖 × 6 色，每色 13 卡）
web/      原生 DOM 前端；app.bundle.js 为打包产物（自动生成勿手改）
server/   node:http 后端（静态托管 + 卡组/对局记录 API）
scripts/  bundle 打包 / balance-sim 平衡模拟 / sim_play 通关模拟 / check 语法门禁
tests/    node:test 测试（89 项）
docs/     平衡模拟报告
```

## 本地运行

```bash
# 方式一：起后端（静态页 + 存档 API），浏览器开 http://localhost:8180
node server/server.js            # 端口可用 --port 覆盖，默认 8180

# 方式二：免 server 离线玩——直接用浏览器打开 web/index.html（file:// 协议）
# 前端引擎走 web/app.bundle.js，与 server 路径同构
```

## 常用命令

```bash
npm test          # = node --test（注意：node v24/Windows 下不能带 tests/ 目录参数，会 MODULE_NOT_FOUND）
npm run check     # 全部源码 js 过 node --check 语法门禁
npm run bundle    # = node scripts/bundle.js，把 engine+ai+data 打成 web/app.bundle.js
npm run balance   # = node scripts/balance-sim.js，平衡模拟矩阵（见下）
```

**改了 engine/、ai/、data/ 之后必须**：`node scripts/bundle.js` 重新打包 + `node --test` 全量回归。

## 平衡模拟工具（dev-only，不暴露给玩家）

```bash
node scripts/balance-sim.js                                    # 21 组（15 非镜像+6 镜像）×30 局 normal + ×8 局 hard
node scripts/balance-sim.js --games 60                         # 加大样本复验
node scripts/balance-sim.js --baseline docs/balance-report.before.json  # 与某次历史数据对比
```

- 固定 seed（FNV-1a 按 matchup 散列 + makeRng 注入），同参数完全可复现
- 输出 `docs/balance-report.md` + `docs/balance-report.json`：胜率矩阵、平均/最长回合、动作数 p50/p90/max、终局方式（击破/牌库空）、卡死与异常计数
- 卡死检测：单局动作数 > 500 判 stall（驱动层 guard，AI 本身不改）
- 目标门禁：全部非镜像 matchup 胜率落在 30%-70%；工具末行给出判定结果

## 存档说明（localStorage）

浏览器本地存档全部挂在 `optcg_` 前缀下：

| 键 | 内容 |
|---|---|
| `optcg_match_v2` | 进行中对局快照（断线续玩） |
| `optcg_decks` / `optcg_deck_sel` | 自建卡组列表 / 当前选中卡组 |
| `optcg_uid` | 匿名玩家 id |
| `optcg_ladder` / `optcg_survival` | 天梯积分 / 无尽连胜进度 |

前端设置面板提供导出（全量 JSON）与清空；后端模式下卡组/对局记录另存服务端 `data/store.json`（每日快照在 `data/backup/`）。

## 卡池数值（v0.2，2026-09-15 平衡调池）

初始卡池黑/绿两色压制全场（实测黑对五色 63-87% 胜率）。经 8 轮模拟迭代微调（只动数值，不动机制）：

| 变更 | 内容 |
|---|---|
| 领袖 | 绿：6000/4 → 5000/5；黑：6000/4 → 5000/4 |
| 红 | RED-E1 火拳 2→3 费；RED-06 萨博 3→4 费 |
| 绿 | GREEN-01/02/03 前期墙 +1000；GREEN-09 大和 9000→8000；GREEN-S1 鬼岛 3→4 费 |
| 黄 | YELLOW-02/03 双挡 3000→4000 |
| 紫 | PURPLE-E2 / PURPLE-S1 两张 1 费 gainDon → 2 费 |
| 黑 | BLACK-E1 黑洞 4→5 费 |

调后 30 局/matchup 门禁与 60 局复验均全 30-70% 区间，六色平均胜率 43-58%。数据见 `docs/balance-report.md`。

## 测试

89 项 node:test：引擎规则（阶段流转/DON/出牌/附着/战斗五步/全词条/胜负/合法性/确定性回放）、counter 多张与日志契约、卡池 schema 与数值区间、AI 大批量对局与难度分层、模糊测试、bundle 冒烟、后端 API。

## 203 部署

内网 192.168.14.203:8180，systemd 服务 `optcg`，数据落 `/data/optcg/`——部署/回滚步骤见 `deploy/README.md`。
