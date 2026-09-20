# POOL-3 扩卡规格（192 → 500）

> 输入：`data/cards.json`（现有 192 卡）+ `F:/claudecode/output/optcg-battle/research/playability-research.md` §4 素材库
> 输出：`data/cards-pool3.json`（**仅新卡数组**，308 张，不合入主文件）
> 门禁：`node scripts/check-pool3.js` 必须 0 错误

## 1. 数量与编号（总数必须精确）

| 类型 | 新增 | 每色 | 编号规则（续现有最大号） |
|---|---|---|---|
| char 角色 | 244 | 40 或 41（六色合计 244） | `{COLOR}-24` … 连续续号 |
| event 事件 | 38 | 6 或 7（合计 38） | `{COLOR}-E6` … |
| stage 舞台 | 4 | 0 或 1（合计 4） | `{COLOR}-S3`（仅有新舞台的颜色用） |
| gear 装备 | 22 | 3 或 4（合计 22） | `{COLOR}-G3` … |

COLOR ∈ red/blue/green/yellow/purple/black（小写）。编号连续不跳号；id 全库唯一（不得与现有 192 卡冲突）。

## 2. 卡牌 schema（与现库完全一致）

```json
{ "id":"RED-24", "name":"波特卡斯·D·艾斯", "sub":" 火拳 ", "type":"char", "color":"red",
  "cost":3, "power":5000, "counter":1000, "keywords":[], "effect":null,
  "art":"RED-24", "fruit":null }
```

- `sub`：称号，**前后各留一个半角空格**（现库惯例，如 `" 火拳 "`）
- event/stage：`power:null, counter:null`
- gear：无 effect 时 `"gear":{"atk":2000}`，`effect:null`；有效果时也可 `gear.atk` + effect 并存（现库无先例，允许但少量）
- `art` 恒等于 `id`
- `fruit`：角色按原作——`"paramecia"`(超人系) / `"logia"`(自然系) / `"zoan"`(动物系)；无果实或非能力者 = `null`。event/stage/gear 一律 `null`

## 3. 数值曲线（对照现库实测，硬约束）

**char（cost 1-8）**：基准 power = cost×1000+1000。
- 允许窗口：`cost×1000 ≤ power ≤ cost×1000+2000`；green 高费巨兽（cost≥6）可到 +3000
- 带 keyword（rush/blocker）或有效果 effect：power 取窗口中位或下限
- 白板（无 keyword 无 effect）：可取上限；cost8 白板 power=9000（现库锚点）
- cost 分布（244 张）：1 费 8%、2 费 15%、3 费 20%、4 费 20%、5 费 16%、6 费 10%、7 费 7%、8 费 4%（green 偏高费、red 偏低费）
- counter：cost≤3 → 1000 或 2000（约 60/40）；cost≥5 → null 为主（约 70%，现库惯例无反击值=null）；cost4 混合
- keywords 池（静态词条）：`rush`（登场回合可攻击）/ `blocker`（可挡刀）/ `doubleAttack`（直攻 LP×2，全库≤8 张，cost≥6）/ `banish`（直攻额外+2000，全库≤5 张，cost≥5）
- fruit 分布（能力者角色中）：paramecia 55% / logia 25% / zoan 20%

**event**：cost 1-4（1-2 费 60%、3 费 30%、4 费 10%）；效果强度随 cost 递增。

**stage**：cost 2-3。

**gear**：cost 2-3，`gear.atk` 1000/2000/3000（3000 仅 cost3 且全库≤4 把）。

## 4. 效果动词白名单（卡牌只允许以下，越界=门禁 FAIL）

**hook（卡牌仅 4 种）**：
- `onPlay` 登场/打出时
- `whenAttacking` 攻击宣告时（op 直到 battle 结束）
- `onKO` 被击倒进垃圾场时
- `trigger` 作为 Life 被翻出时

**op（11 种，k 精确匹配）**：
| k | 参数 | 语义 |
|---|---|---|
| `draw` | `n`(1-2，3 费+可 3), `minCost`?(仅对自身 cost≥minCost 生效) | 抽牌 |
| `powerSelf` | `x`(1000-3000,1000 步进), `until`("turn"\|"battle"), `minCost`? | 自身战力+x |
| `powerLeader` | `x`(1000-2000), `until` | 船长战力+x |
| `gainDon` | `n`(1-2) | 费用区+DON |
| `koWeakest` | 无 | 击倒敌方战力最低角色（仅 black，全库≤10 张，cost≥4） |
| `restEnemy` | `target`?: "last"\|"strongest"\|"weakest"（默认 last） | 横置敌方一个角色 |
| `healLP` | `x`(1000-2000) | 回 LP |
| `damageLP` | `x`(1000-2000；2000 仅 cost≥3 event) | 对方 LP 直伤 |
| `buffAll` | `x`(1000-2000), `until`("turn"\|"battle") | 我方全体角色+x |
| `debuffFoeAll` | `x`(1000), `until`("battle") | 对方全体角色-x |
| `discard` | `n`(1-2) | 弃自己手牌（仅作复合 op 的代价段，不单独出现） |

**复合 op**：`op` 可为数组按序执行（如艾斯火拳 `[{k:"discard","n":1},{k:"powerSelf","x":2000,"until":"battle"}]`）；`discard` 不可付时整条不执行。数组长度≤2。

**频率红线**（防崩坏）：
- `draw` 全库 ≤60 张；`gainDon` ≤25 张；`healLP` ≤20 张；`damageLP` ≤30 张；`koWeakest` ≤10 张（且仅 black）；`restEnemy` ≤30 张；`buffAll` ≤20 张；`debuffFoeAll` ≤12 张
- 同 cost 的 effect 强度不得超过现库同 cost 最强卡（现库锚：1 费=draw1 或 powerSelf+1000；3 费=koWeakest(RED-E1)；4 费=healLP+抽 2 级别禁用）

## 5. 内容红线（用户明确要求）

- **只用具体元素**：具名角色、具体武器（黑刀夜/和道一文字/天候棒…）、具体招式（火拳/雷迎/恶魔风脚…）、具体恶魔果实能力。素材优先级 = 调研报告 §4.1-§4.11 全表（90 具名角色 ◆ 优先 30+）。
- **禁抽象概念卡**：「和之国的黎明」「新时代」「羁绊之力」「梦想」这类篇章主题/抽象名词一律不许出。
- 名字用通行中文译名（蒙奇·D·路飞/罗罗诺亚·索隆/特拉法尔加·罗…）；同一角色可出多版本（基础版/霸气版/两年后版），sub 区分。
- **颜色主题**（meta.colors，新卡机制须贴色）：
  - red 速攻连打：rush 多、powerSelf/damageLP 攻击增益直伤
  - blue 资源循环：draw/counter 高/gainDon/healLP
  - green 巨兽大怪：高费高战力/gainDon/blocker 大怪
  - yellow 壁垒生存：blocker 密集/powerLeader/healLP/buffAll
  - purple 节奏掌控：restEnemy/gainDon/debuffFoeAll 横置干扰
  - black 暗黑去除：koWeakest/banish/damageLP/discard 代价爆发
- 每色 40+ 张 char 须覆盖 ≥18 个不同具名角色（多版本可复用角色）。

## 6. 门禁

生成后跑 `node scripts/check-pool3.js`，0 错误才算完成。脚本校验：schema/编号连续唯一/数值窗口/动词白名单/频率红线/每色数量/角色覆盖数。
