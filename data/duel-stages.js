// 海贼王：伟大航路决斗 — 东海篇闯关数据（Phase 4）
// 每关牌组均守规则 §八/附B：20 张整 / 同名≤2 / 无效化伏笔≤2 / 人物 12-14 + 招伏 6-8。
// aiProfile: 'aggro'（激进铺场）| 'control'（控制反击）| 'boss'（篇章 Boss）
// unlock: 通关后该敌方人物卡进入玩家牌组编辑器可用池。
export const DUEL_STAGES = [
  {
    id: 1, name: '铁棒的追击', place: '东海 · 小船', foeId: 'DUE-101',
    foeName: '亚尔丽塔', foeTitle: '亚尔丽塔海贼团船长', aiProfile: 'aggro',
    intro: '出海第一天，铁棒亚尔丽塔拦住了去路。熟悉战斗：登场、攻击、解放召唤。',
    deck: ['DUE-101','DUE-101','DUE-102','DUE-102','DUE-104','DUE-104','DUE-108','DUE-108',
           'DUE-110','DUE-110','DUE-006','DUE-009',
           'DUE-201','DUE-201','DUE-202','DUE-202','DUE-204','DUE-204','DUE-205','DUE-206'],
    unlock: null,
  },
  {
    id: 2, name: '斧手之名', place: '谢尔兹镇 · 海军基地', foeId: 'DUE-102',
    foeName: '斧手蒙卡', foeTitle: '第 153 分部上校', aiProfile: 'aggro',
    intro: '海军基地的腐败上校。他的登场会挥斧猛击——注意 LP，也小心他盖下的第一张伏笔。',
    deck: ['DUE-102','DUE-102','DUE-101','DUE-101','DUE-104','DUE-104','DUE-107','DUE-107',
           'DUE-006','DUE-006','DUE-009','DUE-108',
           'DUE-204','DUE-204','DUE-202','DUE-202','DUE-201','DUE-201','DUE-203','DUE-303'],
    unlock: null,
  },
  {
    id: 3, name: '四分五裂的小丑', place: '橘子镇', foeId: 'DUE-103',
    foeName: '小丑巴基', foeTitle: '巴基海贼团船长', aiProfile: 'aggro',
    intro: '被破坏也不会消失的男人——巴基被破坏时回到他的手牌。别指望一波打穿，准备好持久战。',
    deck: ['DUE-103','DUE-103','DUE-101','DUE-101','DUE-104','DUE-104','DUE-107','DUE-107',
           'DUE-108','DUE-006','DUE-009','DUE-102',
           'DUE-202','DUE-202','DUE-201','DUE-201','DUE-203','DUE-203','DUE-301','DUE-301'],
    unlock: 'DUE-103',
  },
  {
    id: 4, name: '百计的船长', place: '西罗布村 · 嘉雅宅邸', foeId: 'DUE-106',
    foeName: '克洛', foeTitle: '黑猫海贼团船长', aiProfile: 'control',
    intro: '控场反击型对手：克洛以守备蓄势、囤伏笔，只在稳赢时出手。强攻他的防线前，先想清楚他的伏笔。',
    deck: ['DUE-106','DUE-106','DUE-107','DUE-107','DUE-104','DUE-104','DUE-101','DUE-101',
           'DUE-110','DUE-110','DUE-006','DUE-009',
           'DUE-304','DUE-304','DUE-301','DUE-301','DUE-202','DUE-202','DUE-204','DUE-204'],
    unlock: 'DUE-106',
  },
  {
    id: 5, name: '东海最强之铠', place: '海上餐厅巴拉蒂', foeId: 'DUE-105',
    foeName: '顿·克利克', foeTitle: '克利克舰队提督', aiProfile: 'aggro',
    intro: '重装大军压境：克利克登场即投掷大马士革钢爆弹。他的总队长阿金与主力同场时会爆发忠诚之力。',
    deck: ['DUE-105','DUE-105','DUE-104','DUE-104','DUE-102','DUE-102','DUE-108','DUE-108',
           'DUE-101','DUE-101','DUE-006','DUE-009',
           'DUE-202','DUE-202','DUE-201','DUE-201','DUE-203','DUE-203','DUE-206','DUE-206'],
    unlock: 'DUE-105',
  },
  {
    id: 6, name: '可可亚村的仇', place: '可可亚村 · 阿龙公园', foeId: 'DUE-109',
    foeName: '阿龙', foeTitle: '鱼人海贼团船长', aiProfile: 'boss',
    intro: '篇章 Boss：阿龙需要解放 2 名部下才能登场，登场即挥动鲨齿锯处决我方最强战力。攒好解放素材与反制手段。',
    deck: ['DUE-109','DUE-109','DUE-108','DUE-108','DUE-101','DUE-101','DUE-104','DUE-104',
           'DUE-107','DUE-107','DUE-006','DUE-009',
           'DUE-202','DUE-202','DUE-204','DUE-204','DUE-206','DUE-206','DUE-302','DUE-302'],
    unlock: 'DUE-109',
  },
  {
    id: 7, name: '六刀与快刀', place: '罗格镇 · 街道', foeId: 'DUE-110',
    foeName: '达斯琪', foeTitle: '海军本部上士', aiProfile: 'control',
    intro: '守备成长型对手：达斯琪的防御每回合稳步提升，小八的六刀铁壁更是难啃。带上贯通伤害或削防手段。',
    deck: ['DUE-110','DUE-110','DUE-108','DUE-108','DUE-107','DUE-107','DUE-104','DUE-104',
           'DUE-102','DUE-102','DUE-006','DUE-009',
           'DUE-204','DUE-204','DUE-301','DUE-301','DUE-303','DUE-303','DUE-201','DUE-201'],
    unlock: 'DUE-110',
  },
  {
    id: 8, name: '捕猎上校', place: '罗格镇 · 处刑台', foeId: 'DUE-111',
    foeName: '斯摩格', foeTitle: '海军本部上校', aiProfile: 'control',
    intro: '东海篇收官战：白蛇捕缚会把最强的攻击手拖入守备，烟雾体随时无效你的攻击。用连锁反制撕开烟雾。',
    deck: ['DUE-111','DUE-111','DUE-110','DUE-110','DUE-102','DUE-102','DUE-104','DUE-104',
           'DUE-107','DUE-107','DUE-108','DUE-108',
           'DUE-204','DUE-204','DUE-303','DUE-303','DUE-301','DUE-301','DUE-201','DUE-201'],
    unlock: 'DUE-111',
  },
];
export default DUEL_STAGES;
