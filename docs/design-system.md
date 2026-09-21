# 卡牌设计系统规范 v1（design-system.md）

> P0 交付物。1000 卡扩池、分类分级、阵型、平衡调整的唯一设计真值源。
> 实证基础：2026-09-20 对现役 257 卡回归分析（见 §1 注）。

## 1. 战力基准曲线（D1）

### 1.1 白板基准
```
白板 power = (cost + 1) × 1000
```
实证：现役 257 卡白板中位完全吻合（费1→2K … 费8→9K）。

### 1.2 词条费率表（挂词条时战力下调）
| 词条 | 费率（战力折价） | 强度级 | 备注 |
|------|----------------|--------|------|
| blocker | −1K | T1 防御 | 现役实证一致 |
| rush | −1K | T1 进攻 | 现役实证一致 |
| banish | −1.5K | T2 强 | 现役与 blocker 同折价=分级漏洞，本次修正 |
| doubleAttack | −1.5K | T2 强 | 同上 |
| vigilant 警戒（新） | −1K | T1 | 对「休息中单位被攻击」可反击 |
| guardian 护卫（新） | −1K | T1 | 相邻友军受击时可代受（标签阵型铁壁核心） |
| piercing 贯穿（新） | −1.5K | T2 | 击破单位时对船长造成 1K 溢出 |
| executor 处刑（新） | −2K | T3 超强 | 攻击已横置/被控单位 +2K |

### 1.3 效果原语费率表（效果折价，可与词条叠加但总折价 ≤2.5K）
| op | 费率 | 档 |
|----|------|-----|
| healLP(1K) / damageLP(1K) | −1K | 弱 |
| buffAll(+1K,battle) / restEnemy(1体) / gainDon | −1.5K | 中 |
| draw(1) / debuffFoeAll(−1K) | −2K | 强 |
| koWeakest / search(阵营,1) | −2.5K | 超强 |
| revive(≤3费) / search(任意,1) | −3K（仅 SS+） | 传说 |

### 1.4 稀有度浮动带（D4，同费用内）
| 稀有度 | 配额(1000) | 允许偏离基准 | 定位 |
|--------|-----------|-------------|------|
| A | 40% (400) | ±0 | 基础完赛：白板或单 T1 词条 |
| B | 30% (300) | +0.5K 或 T1 词条+弱效果 | 进阶：词条+简单效果 |
| S | 20% (200) | +1K 或 T2 词条+中效果 | 核心组件：构筑中坚 |
| SS | 7% (70) | +1.5K 或 T3/双效果 | 传说组件：archetype 引擎 |
| SSS | 3% (30) | +2K 且必带强协同 | 锚点：改变战局，故事模式大奖 |

**违例门禁**：check-pool3 增加逐卡校验——`power + 折价总和 ≤ (cost+1)K + 稀有度浮动上限`，违例卡拒入库。

## 2. 阵营体系（D2）

### 2.1 八大阵营（faction 字段，单选）
| faction | 中文 | 机制身份 | 代表角色池 |
|---------|------|---------|-----------|
| strawhat | 草帽一伙 | 协同成长：同阵营互相 buff/抽牌 | 路飞团全员 |
| navy | 海军 | 防御控制：blocker 链/AoE debuff/回血 | 赤犬青雉黄猿卡普战桃丸 |
| warlord | 七武海 | 单体爆发：高 power/单点 ko/吸血 | 鹰眼女帝明哥熊克罗克达尔 |
| yonko | 四皇 | 传说压制：全场效果/耐久 | 白胡子香克斯凯多大妈 |
| supernova | 超新星 | 速攻 rush：低费快打 | 罗基德 Bonney Killer |
| revolutionary | 革命军 | 干扰反制：rest 敌军/封贝里/偷看 | 龙萨博伊万科夫 |
| whitebeard | 白胡子团 | 守护家族：护卫/buffAll/亡语 | 艾斯马尔科乔兹比斯塔 |
| beast | 百兽团 | 巨体：高费大身材+banish/贯穿 | 凯多三灾飞六胞 |

### 2.2 篇章副标签（arc 字段，可选）
east_blue / alabasta / enies_lobby / marineford / dressrosa / whole_cake / wano——
用于故事模式发卡分组与图鉴筛选，不参与战斗判定（保持引擎简洁）。

### 2.3 阵营协同规则（引擎 E3）
- 协同条件统一走「场上/手牌/墓场计数 ≥N」三档：N=2 微效果（+1K）、N=3 中效果（buffAll/抽1）、N=4 强效果（SSS 专属）
- **每色阵营分布配额**：每色内 8 阵营至少 2 archetype 主阵营，避免单色单一阵营

## 3. Archetype 套牌原型（D3，每色 3 个 = 18 个）

| 色 | 原型 | 引擎（找牌/攒资源） | 爆发点 | 核心阵营 |
|----|------|---------------------|--------|---------|
| red | 超新星闪电战 | 低费 rush 铺场 | 3 回合内打脸斩杀 | supernova |
| red | 草帽冒险团 | 登场抽牌滚雪球 | 中期连环 buff | strawhat |
| red | 白胡子冲锋 | 高费大身材+护卫 | 7 费后一波碾压 | whitebeard |
| blue | 海军封锁线 | blocker 链+debuffFoeAll | 磨到后期资源差 | navy |
| blue | 革命军暗流 | rest 敌军锁行动 | 对面永远横着打 | revolutionary |
| blue | 冰河时代 | 控贝里+控手牌 | 资源窒息 | navy |
| green | 生命绿洲 | healLP+buffAll 续航 | 血量差碾压 | strawhat |
| green | 阿拉巴斯坦王国 | 中费均衡+护卫 | 场面交换赚差价 | navy(副) |
| green | 萌宠军团 | 低费海召唤 | 数量铺满 buff | strawhat |
| yellow | 天罚审判 | damageLP 直伤积累 | 不靠战场直接烧 | yonko( Eneru 线) |
| yellow | 正义之师 | 攻防一体词条卡 | 均衡压制 | navy |
| yellow | 命运转轮 | 弃牌/摸牌赌博引擎 | 抽一打一 | warlord |
| purple | 七武海狩猎 | 单点 ko 秒杀 | 逐个清除场面 | warlord |
| purple | 黑暗吞噬 | banish 永久移除 | 墓场资源差 | beast(黑胡子线) |
| purple | 傀儡线控 | restEnemy+费率锁 | 掌控节奏 | warlord |
| black | 百兽军团 | 费 7+ 巨体 | 后期不可阻挡 | beast |
| black | 铁壁要塞 | guardian+blocker 双防 | 消耗战 | navy |
| black | 猎人游戏 | 贯穿+处刑收割 | 收残血人头 | revolutionary |

**产出配额**：743 新卡按 18 原型均分基线（~41/原型），再做色间微调治绿霸权（green 新卡词条向防御倾斜、purple 向进攻倾斜）。

## 4. 阵型系统（D5，方案 C 标签制——已定「先 C 后 A」）

### 4.1 三大阵型（formation 字段，单选；船长也带）
| formation | 中文 | 协同（场上同阵型 ≥2 触发，静态光环） |
|-----------|------|-------------------------------------|
| vanguard | 突击 | 我方攻击时，每多 1 名突击单位，攻击 +0.5K |
| bulwark | 铁壁 | 我方守备时，每多 1 名铁壁单位，全体守备 +0.5K |
| skirmish | 游击 | 每当第 3 名游击单位登场时，抽 1 张牌 |

### 4.2 引擎实现（E3 范围，最小改动）
- `card.formation: 'vanguard'|'bulwark'|'skirmisk'|null`（旧卡回填：blocker→bulwark、rush→vanguard、其余→null）
- 计数走现有 onBoardCount 逻辑扩展；光环结算挂在 powerOfUnit/leaderPower 计算链上（不改回合结构）
- **迁移路径（→方案 A 位置阵型）**：formation 值即未来位置约束（vanguard→前排、bulwark→前排、skirmish→中排），本批标签数据无需返工

### 4.3 AI 感知（E4 范围）
评估函数加两项：己方阵型聚合度（+价值）、敌方阵型威胁（−价值），权重 0.3×单位效用。

## 5. 产卡门禁（P2 流水线引用）
1. 逐卡过 §1.4 违例门禁（数值）
2. 三维度防撞：卡名+效果文本+拼音（game-ports 既有教训）
3. 批批过 check-pool3（新增 faction/formation/稀有度浮动校验）+ balance-sim（固定 AI rng、跨 seed 三样本）
4. 首件门禁：首批 10 张走全链路（数据→图鉴→对局→平衡）验证后放量

## 6. 回测记录
- 2026-09-20 v1：白板基准 (cost+1)K 与现役 257 卡中位 100% 吻合；blocker/rush 折价 −1K 与现役吻合；banish/doubleAttack 现役未分级（同 −1K）→ v1 起修为 −1.5K（新卡执行，旧卡 257 张在 P2 首批一并重标）。
