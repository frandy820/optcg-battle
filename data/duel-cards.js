// 海贼王：伟大航路决斗 — 首批卡池（Phase 2 垂直切片）
// 规则真值源: docs/duel-rules.md（数值带=附 B；越界须先改规则文档）
// art 直接引用旧 DEMO 现有人物卡图（web/art/<art>.webp），零新增素材。
// ability(人物效果) Phase 3/4 落地；本批以数值结构与 role 字段先行体现人物定位。
export const DUEL_CARDS_DATA = (() => {
  const C = (id, name, sub, faction, level, atk, def, art, role, desc, keywords) =>
    ({ id, name, sub, type: 'char', faction, level, atk, def, art, role, ability: null, keywords: keywords || [], desc });
  // 招式：type 'move'，moveKind 'normal'（用后进墓）| 'equip'（留场装备）
  // effect.need: 目标约束；effect.ops: 算子（engine.applyOps）
  const M = (id, name, sub, moveKind, art, effect, desc) =>
    ({ id, name, sub, type: 'move', moveKind, art, effect, desc });
  // 伏笔：type 'trap'，triggers 命中窗口（onAttacked/onDirectAttack/onOppMove）
  // category 'negate' 计入构筑限制「无效化伏笔每副 ≤2」（规则 附 B）
  const T = (id, name, sub, art, triggers, effect, desc, category) =>
    ({ id, name, sub, type: 'trap', art, triggers, effect, desc, category: category || null });

  return {
    version: 'phase3-1',
    cards: [
      // ===== 玩家侧 · 草帽团与东海伙伴 =====
      C('DUE-001', '蒙奇·D·路飞', '我要成为海贼王', 'strawhat', 4, 1900, 1500, 'GREEN-106',
        '进攻核心·中坚', '均衡型主力。Phase 4：与草帽团伙伴协同增益。'),
      C('DUE-002', '罗罗诺亚·索隆', '海贼猎人', 'strawhat', 4, 2000, 1200, 'GREEN-117',
        '单体突破·高攻脆守', '攻击时换血、被攻时脆弱——高风险高回报。'),
      C('DUE-003', '娜美', '小贼猫', 'strawhat', 2, 900, 1400, 'GREEN-126',
        '守备·辅助', 'Phase 4：信息/检索/调整战斗结果。'),
      C('DUE-004', '乌索普', '狙击之王', 'strawhat', 2, 1100, 1300, 'RED-01',
        '伏笔联动（Phase 3）', '配合伏笔卡干扰、以弱胜强。'),
      C('DUE-005', '山治', '黑足', 'strawhat', 3, 1500, 1300, 'YELLOW-24',
        '保护·反击（Phase 3）', '保护伙伴、反击连携。'),
      C('DUE-006', '克比', '海军见习', 'navy', 1, 600, 1000, 'RED-02',
        '润滑·解放素材', 'Phase 4：成长型，后期效果变强。'),
      C('DUE-007', '路飞·二档', '橡胶橡胶·JET枪', 'strawhat', 6, 2400, 2000, 'GREEN-106',
        '解放召唤·终结力', '解放 1 名伙伴登场；速攻：登场回合即可攻击。', ['rush']),
      C('DUE-008', '索隆·三刀流', '鬼气·三刀流', 'strawhat', 6, 2500, 2000, 'GREEN-117',
        '解放召唤·最高攻', '解放 1 名伙伴登场；全场最高单点攻击。'),
      C('DUE-009', '贝鲁梅伯', '海军上尉之子', 'navy', 1, 700, 900, 'GREEN-134',
        '低费垫场·解放素材', '与克比并肩的低费卡。'),
      C('DUE-010', '诺琪高', '可可亚村的风', 'coco', 2, 1000, 1200, 'GREEN-140',
        '守备·支援', '可可亚村篇支援；守备向。'),

      // ===== 敌方 · 东海野心家 =====
      C('DUE-101', '亚尔丽塔', '铁棒', 'alvida', 3, 1400, 1600, 'RED-12',
        '敌方·首关教学 Boss', '第 1 教学关对手原型。'),
      C('DUE-102', '斧手蒙卡', '谢尔兹镇上校', 'navy', 4, 1800, 1400, 'BLACK-61',
        '敌方·中坚', '标准中期战力。'),
      C('DUE-103', '小丑巴基', '巴基海贼团船长', 'buggy', 4, 1700, 1500, 'RED-11',
        '敌方·均衡', 'Phase 4：四分五裂——被破坏时不离场（复活类）。'),
      C('DUE-104', '阿金', '克利克舰队总队长', 'krieg', 2, 1100, 1200, 'BLUE-49',
        '敌方·铺场先锋', '低等级快速铺场。'),
      C('DUE-105', '顿·克利克', '东海最强', 'krieg', 5, 2200, 2000, 'RED-81',
        '敌方·重装（需 1 解放）', '敌方牌组上限战力。'),
      C('DUE-106', '克洛', '百计船长', 'kuro', 5, 2100, 1900, 'RED-13',
        '敌方·控制反击原型', '第 5 关对手原型；守备向。'),
      C('DUE-107', '赞高', '前黑猫船长', 'kuro', 2, 1000, 1300, 'BLUE-23',
        '敌方·低费', '黑猫海贼团旧主。'),
      C('DUE-108', '小八', '六刀流章鱼鱼人', 'arlong', 4, 1600, 1700, 'BLACK-77',
        '敌方·守备墙', '守备向。'),
      C('DUE-109', '阿龙', '鱼人海贼团船长', 'arlong', 7, 2800, 2400, 'GREEN-107',
        '敌方·篇章 Boss（Phase 4 启用）', '需解放 2 名；不进入 Phase 2 牌组。'),
      C('DUE-110', '达斯琪', '海军本部上士', 'navy', 3, 1300, 1600, 'BLUE-02',
        '敌方·守备', '罗格镇篇；守备向。'),
      C('DUE-111', '斯摩格', '捕猎人上校', 'navy', 5, 2300, 2100, 'BLUE-152',
        '敌方·压制（需 1 解放）', '罗格镇篇收官对手原型。'),

      // ===== 招式（Phase 3）=====
      M('DUE-201', '三刀流·鬼斩', '通常招式', 'normal', 'RED-G1',
        { need: 'ownUnit', ops: [{ op: 'atkDelta', target: 'chosen', amount: 800, until: 'turn' }] },
        '选自己 1 名人物：本回合 ATK+800。战斗阶段前铺开，或战斗阶段后补刀。'),
      M('DUE-202', '雷光·天候', '通常招式', 'normal', 'YELLOW-G7',
        { ops: [{ op: 'damage', amount: 700, side: 'opponent' }] },
        '对对方造成 700 点伤害。不留场面、直接削 LP。'),
      M('DUE-203', '铅星·精准射击', '通常招式', 'normal', 'BLACK-G1',
        { need: 'foeUnitMax1200', ops: [{ op: 'destroy', target: 'chosen' }] },
        '破坏对方 1 名 ATK1200 以下的人物。低费小怪的噩梦。'),
      M('DUE-204', '海军的包围网', '通常招式', 'normal', 'BLUE-G5',
        { need: 'foeUnitAtkPos', ops: [{ op: 'setPosDef', target: 'chosen' }] },
        '选对方 1 名攻击表示人物，改为守备表示。拔掉攻势、迫其换防。'),
      M('DUE-205', '和道一文字', '装备招式', 'equip', 'RED-G3',
        { need: 'ownUnit', ops: [{ op: 'equip', stat: 'atk', amount: 300, target: 'chosen' }] },
        '装备自己 1 名人物：ATK+300。装备留在场上，装备者离场时随之进墓。'),
      M('DUE-206', '武装色·硬化', '装备招式', 'equip', 'RED-G2',
        { need: 'ownUnit', ops: [{ op: 'equip', stat: 'atk', amount: 400, target: 'chosen' }] },
        '装备自己 1 名人物：ATK+400。橡胶枪打不透的硬度。'),

      // ===== 伏笔（Phase 3；盖伏后下一回合起在响应窗口发动）=====
      T('DUE-301', '必杀·狼蛛星', '伏笔·乌索普', 'RED-01', ['onAttacked', 'onDirectAttack'],
        { ops: [{ op: 'atkDelta', target: 'attacker', amount: -800, until: 'battle' }] },
        '对方攻击宣言时：该攻击人物 ATK-800 直至战斗阶段结束。以弱胜强的陷阱。'),
      T('DUE-302', '宴席脚', '伏笔·山治', 'YELLOW-24', ['onDirectAttack'],
        { ops: [{ op: 'negateAttack' }, { op: 'damage', amount: 500, side: 'opponent' }] },
        '对方直接攻击宣言时：无效该攻击，并给对方 500 点伤害。空场硬闯的代价。', 'negate'),
      T('DUE-303', '烟雾体', '伏笔·斯摩格', 'BLUE-152', ['onAttacked', 'onDirectAttack'],
        { ops: [{ op: 'negateAttack' }] },
        '对方攻击宣言时：无效该攻击。（无效化类，每副牌组最多 2 张——规则 附 B）', 'negate'),
      T('DUE-304', '催眠曲·赞高', '伏笔·黑猫', 'BLUE-23', ['onOppMove'],
        { ops: [{ op: 'negateMove' }] },
        '对方发动招式时：无效该招式。让对手的关键一击落空。（无效化类，每副 ≤2）', 'negate'),
      T('DUE-305', '诺琪高的守护', '伏笔·可可亚村', 'GREEN-140', ['onAttacked'],
        { ops: [{ op: 'defDelta', target: 'defender', amount: 800, until: 'battle' }] },
        '自己人物被攻击时：该人物 DEF+800 直至战斗阶段结束。守备翻盘的反噬。', null),
    ],

    // 预组牌组：20 张整 / 同名 ≤2 / 无效化伏笔每副 ≤2（规则 §八 + 附 B）
    // 构成带（§八.3）：人物 12-14 + 招式/伏笔 6-8
    decks: {
      strawhat_default: {
        name: '草帽团·起航', leader: '蒙奇·D·路飞', theme: '玩家默认（一键恢复）· 全面均衡',
        cards: ['DUE-001','DUE-002','DUE-003','DUE-004','DUE-005','DUE-006',
                'DUE-001','DUE-002','DUE-003','DUE-004','DUE-005','DUE-006',
                'DUE-201','DUE-202','DUE-204','DUE-205','DUE-206',
                'DUE-301','DUE-303','DUE-305'],
      },
      eastblue_aggro: {
        name: '东海野心家', leader: '亚尔丽塔', theme: 'AI·激进铺场原型',
        cards: ['DUE-101','DUE-102','DUE-103','DUE-104','DUE-105','DUE-106',
                'DUE-101','DUE-102','DUE-103','DUE-104','DUE-105','DUE-106',
                'DUE-201','DUE-201','DUE-202','DUE-202','DUE-204','DUE-204',
                'DUE-302','DUE-302'],
      },
    },
  };
})();
export default DUEL_CARDS_DATA;
