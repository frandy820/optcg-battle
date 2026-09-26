// data/duel-pool.js — round6 R6-C 自动转译卡池（勿手改；重生成=node scripts/convert-pool.mjs）
// 源=data/cards.json（OPTCG 861 卡）；技能映射/数值锚点真值源=scripts/convert-pool.mjs
// 许可随源库（角色形象版权见 docs/legacy-baseline.md 版权窗口期说明）
const POOL = {
 "version": "r8",
 "cards": [
  {
   "id": "GLD-C0001",
   "name": "马歇尔·D·蒂奇",
   "sub": "黑暗果实·吸收",
   "role": "百兽海贼团",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 2150,
   "art": "BLACK-26",
   "faction": "beast",
   "formation": null,
   "fruit": "logia",
   "rarity": "B",
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "self",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "攻击宣言时：自身 ATK+100（至战斗结束）"
  },
  {
   "id": "GLD-C0002",
   "name": "耶稣布",
   "sub": "神射手",
   "role": "四皇",
   "type": "char",
   "level": 5,
   "atk": 2150,
   "def": 1850,
   "art": "BLACK-33",
   "faction": "yonko",
   "formation": null,
   "fruit": null,
   "rarity": "B",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "damage",
       "amount": 100,
       "why": "「耶稣布」效果"
      }
     ]
    }
   },
   "desc": "登场时：给予对方 LP 100 伤害"
  },
  {
   "id": "GLD-C0003",
   "name": "泽法",
   "sub": "黑腕·海楼石",
   "role": "海军",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 2150,
   "art": "BLACK-47",
   "faction": "navy",
   "formation": null,
   "fruit": null,
   "rarity": "B",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": -100,
       "target": "foeAll",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "登场时：对方全体 ATK-100（至战斗结束）"
  },
  {
   "id": "GLD-C0004",
   "name": "贝洛·贝蒂·革命军",
   "sub": "革命军干部",
   "role": "革命军",
   "type": "char",
   "level": 7,
   "atk": 3150,
   "def": 3350,
   "art": "BLACK-65",
   "faction": "revolutionary",
   "formation": "bulwark",
   "fruit": "paramecia",
   "rarity": "SS",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0005",
   "name": "波尔萨利诺·大将",
   "sub": "巡逻舰队",
   "role": "海军",
   "type": "char",
   "level": 6,
   "atk": 2550,
   "def": 2250,
   "art": "BLACK-69",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "damage",
       "amount": 200,
       "why": "「波尔萨利诺·大将」效果"
      }
     ]
    }
   },
   "desc": "登场时：给予对方 LP 200 伤害"
  },
  {
   "id": "GLD-C0006",
   "name": "佐佐木",
   "sub": "大看板",
   "role": "百兽海贼团",
   "type": "char",
   "level": 4,
   "atk": 1700,
   "def": 1700,
   "art": "BLACK-72",
   "faction": "beast",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "damage",
       "amount": 100,
       "why": "「佐佐木」效果"
      }
     ]
    }
   },
   "desc": "登场时：给予对方 LP 100 伤害"
  },
  {
   "id": "GLD-C0007",
   "name": "萨奇",
   "sub": "家族之绊",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 6,
   "atk": 2550,
   "def": 2750,
   "art": "BLACK-73",
   "faction": "whitebeard",
   "formation": "bulwark",
   "fruit": "paramecia",
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "damage",
       "amount": 100,
       "why": "「萨奇」效果"
      }
     ]
    }
   },
   "desc": "登场时：给予对方 LP 100 伤害"
  },
  {
   "id": "GLD-C0008",
   "name": "哈库·革命军",
   "sub": "隐密行动",
   "role": "革命军",
   "type": "char",
   "level": 5,
   "atk": 2200,
   "def": 2400,
   "art": "BLACK-78",
   "faction": "revolutionary",
   "formation": "bulwark",
   "fruit": "paramecia",
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 200,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "登场时：我方全体 ATK+200（至回合结束）"
  },
  {
   "id": "GLD-C0009",
   "name": "莫莉·革命军",
   "sub": "起义者",
   "role": "革命军",
   "type": "char",
   "level": 5,
   "atk": 2200,
   "def": 1950,
   "art": "BLACK-86",
   "faction": "revolutionary",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "destroy",
       "target": "foeWeakest"
      }
     ]
    }
   },
   "desc": "登场时：破坏对方最弱的人物"
  },
  {
   "id": "GLD-C0010",
   "name": "蒙奇·D·龙",
   "sub": "革命军干部",
   "role": "革命军",
   "type": "char",
   "level": 4,
   "atk": 1700,
   "def": 1900,
   "art": "BLACK-88",
   "faction": "revolutionary",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "登场时：我方全体 ATK+100（至回合结束）"
  },
  {
   "id": "GLD-C0011",
   "name": "阿拉马基",
   "sub": "巡逻舰队",
   "role": "海军",
   "type": "char",
   "level": 2,
   "atk": 950,
   "def": 950,
   "art": "BLACK-90",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onDestroyed": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "被破坏时：抽 1 张牌"
  },
  {
   "id": "GLD-C0012",
   "name": "林德伯格·革命军",
   "sub": "革命军干部",
   "role": "革命军",
   "type": "char",
   "level": 7,
   "atk": 2900,
   "def": 2750,
   "art": "BLACK-93",
   "faction": "revolutionary",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "SS",
   "keywords": [
    "rush"
   ],
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0013",
   "name": "提娜",
   "sub": "缉捕令",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 3200,
   "def": 3400,
   "art": "BLACK-100",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "SSS",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "登场时：抽 1 张牌"
  },
  {
   "id": "GLD-C0014",
   "name": "安布里奥·伊万科夫",
   "sub": "隐密行动",
   "role": "革命军",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2700,
   "art": "BLACK-104",
   "faction": "revolutionary",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "攻击宣言时：我方全体 ATK+100（至回合结束）"
  },
  {
   "id": "GLD-C0015",
   "name": "摩兹",
   "sub": "解放战线",
   "role": "革命军",
   "type": "char",
   "level": 3,
   "atk": 1350,
   "def": 1350,
   "art": "BLACK-110",
   "faction": "revolutionary",
   "formation": null,
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "攻击宣言时：我方全体 ATK+100（至回合结束）"
  },
  {
   "id": "GLD-C0016",
   "name": "赞高",
   "sub": "海军将校",
   "role": "海军",
   "type": "char",
   "level": 2,
   "atk": 950,
   "def": 850,
   "art": "BLACK-113",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": "logia",
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "登场时：我方全体 ATK+100（至回合结束）"
  },
  {
   "id": "GLD-C0017",
   "name": "猫蝮蛇",
   "sub": "家族之绊",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2500,
   "art": "BLACK-114",
   "faction": "whitebeard",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 2
      }
     ]
    }
   },
   "desc": "登场时：抽 2 张牌"
  },
  {
   "id": "GLD-C0018",
   "name": "豹藏",
   "sub": "鬼岛之主",
   "role": "百兽海贼团",
   "type": "char",
   "level": 4,
   "atk": 1700,
   "def": 1350,
   "art": "BLACK-116",
   "faction": "beast",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "登场时：抽 1 张牌"
  },
  {
   "id": "GLD-C0019",
   "name": "拉库约",
   "sub": "残火",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 4,
   "atk": 1700,
   "def": 1500,
   "art": "BLACK-118",
   "faction": "whitebeard",
   "formation": "skirmish",
   "fruit": "paramecia",
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 2
      }
     ]
    }
   },
   "desc": "登场时：抽 2 张牌"
  },
  {
   "id": "GLD-C0020",
   "name": "克比",
   "sub": "缉捕令",
   "role": "海军",
   "type": "char",
   "level": 6,
   "atk": 2550,
   "def": 2250,
   "art": "BLACK-120",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "登场时：抽 1 张牌"
  },
  {
   "id": "GLD-C0021",
   "name": "维尔戈",
   "sub": "海军将校",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 2900,
   "def": 3100,
   "art": "BLACK-128",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "SS",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "deckSearch",
       "filter": {
        "faction": "navy"
       }
      }
     ]
    }
   },
   "desc": "登场时：从牌组检索 1 张同阵营伙伴加入手牌"
  },
  {
   "id": "GLD-C0022",
   "name": "战国·大将",
   "sub": "缉捕令",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 3200,
   "def": 3400,
   "art": "BLACK-129",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "SSS",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 200,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "登场时：我方全体 ATK+200（至回合结束）"
  },
  {
   "id": "GLD-C0023",
   "name": "凯多·百兽海贼团",
   "sub": "鬼岛之主",
   "role": "百兽海贼团",
   "type": "char",
   "level": 6,
   "atk": 2550,
   "def": 2150,
   "art": "BLACK-133",
   "faction": "beast",
   "formation": null,
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": -200,
       "target": "foeAll",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "登场时：对方全体 ATK-200（至战斗结束）"
  },
  {
   "id": "GLD-C0024",
   "name": "缇娜",
   "sub": "正义之师",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 3200,
   "def": 2700,
   "art": "BLACK-134",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": "paramecia",
   "rarity": "SSS",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "deckSearch",
       "filter": {
        "faction": "navy"
       }
      }
     ]
    }
   },
   "desc": "登场时：从牌组检索 1 张同阵营伙伴加入手牌"
  },
  {
   "id": "GLD-C0025",
   "name": "萨博·革命军",
   "sub": "风之军",
   "role": "革命军",
   "type": "char",
   "level": 3,
   "atk": 1350,
   "def": 1350,
   "art": "BLACK-139",
   "faction": "revolutionary",
   "formation": "bulwark",
   "fruit": "paramecia",
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 2
      }
     ]
    }
   },
   "desc": "登场时：抽 2 张牌"
  },
  {
   "id": "GLD-C0026",
   "name": "战国",
   "sub": "铁律",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 3200,
   "def": 3000,
   "art": "BLACK-149",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "SSS",
   "ability": {
    "onDestroyed": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "被破坏时：我方全体 ATK+100（至回合结束）"
  },
  {
   "id": "GLD-C0027",
   "name": "酒天丸",
   "sub": "家族之绊",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 5,
   "atk": 2250,
   "def": 2200,
   "art": "BLACK-151",
   "faction": "whitebeard",
   "formation": "skirmish",
   "fruit": "paramecia",
   "rarity": "SS",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onDestroyed": {
     "ops": [
      {
       "op": "deckSearch",
       "filter": {
        "faction": "whitebeard"
       }
      }
     ]
    }
   },
   "desc": "被破坏时：从牌组检索 1 张同阵营伙伴加入手牌"
  },
  {
   "id": "GLD-C0028",
   "name": "耕四郎",
   "sub": "残火",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 5,
   "atk": 2200,
   "def": 2150,
   "art": "BLACK-161",
   "faction": "whitebeard",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 200,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "登场时：我方全体 ATK+200（至回合结束）"
  },
  {
   "id": "GLD-C0029",
   "name": "马尔科",
   "sub": "真打",
   "role": "百兽海贼团",
   "type": "char",
   "level": 3,
   "atk": 1350,
   "def": 1550,
   "art": "BLACK-187",
   "faction": "beast",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 2
      }
     ]
    }
   },
   "desc": "登场时：抽 2 张牌"
  },
  {
   "id": "GLD-C0030",
   "name": "戴夫戈",
   "sub": "百兽军团",
   "role": "百兽海贼团",
   "type": "char",
   "level": 4,
   "atk": 1700,
   "def": 1650,
   "art": "BLACK-189",
   "faction": "beast",
   "formation": null,
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onDestroyed": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 200,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "被破坏时：我方全体 ATK+200（至回合结束）"
  },
  {
   "id": "GLD-C0031",
   "name": "克尔拉·革命军",
   "sub": "风之军",
   "role": "革命军",
   "type": "char",
   "level": 3,
   "atk": 1350,
   "def": 1400,
   "art": "BLACK-190",
   "faction": "revolutionary",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "登场时：抽 1 张牌"
  },
  {
   "id": "GLD-C0032",
   "name": "罗宾",
   "sub": "恶魔之子",
   "role": "草帽一伙",
   "type": "char",
   "level": 2,
   "atk": 1300,
   "def": 1100,
   "art": "BLUE-04",
   "faction": "strawhat",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "B",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "登场时：抽 1 张牌"
  },
  {
   "id": "GLD-C0033",
   "name": "弗兰奇",
   "sub": "铁人",
   "role": "草帽一伙",
   "type": "char",
   "level": 5,
   "atk": 2500,
   "def": 2150,
   "art": "BLUE-08",
   "faction": "strawhat",
   "formation": null,
   "fruit": null,
   "rarity": "B",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "登场时：我方全体 ATK+100（至回合结束）"
  },
  {
   "id": "GLD-C0034",
   "name": "青雉",
   "sub": "库赞",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 3100,
   "def": 2650,
   "art": "BLUE-10",
   "faction": "navy",
   "formation": null,
   "fruit": "logia",
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "setPosDef",
       "target": "foeStrongestAtkPos"
      }
     ]
    }
   },
   "desc": "登场时：将对方攻击表示的最强人物转为守备"
  },
  {
   "id": "GLD-C0035",
   "name": "娜美",
   "sub": "天候棒·雷云",
   "role": "草帽一伙",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1100,
   "art": "BLUE-25",
   "faction": "strawhat",
   "formation": null,
   "fruit": null,
   "rarity": "B",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "登场时：抽 1 张牌"
  },
  {
   "id": "GLD-C0036",
   "name": "波尔萨利诺",
   "sub": "天丛云剑",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2400,
   "art": "BLUE-30",
   "faction": "navy",
   "formation": null,
   "fruit": "logia",
   "rarity": "S",
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "self",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "攻击宣言时：自身 ATK+100（至战斗结束）"
  },
  {
   "id": "GLD-C0037",
   "name": "斯摩格",
   "sub": "海军G-5支部",
   "role": "海军",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1400,
   "art": "BLUE-34",
   "faction": "navy",
   "formation": null,
   "fruit": "logia",
   "rarity": "B",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "登场时：抽 1 张牌"
  },
  {
   "id": "GLD-C0038",
   "name": "战国",
   "sub": "佛之推波",
   "role": "海军",
   "type": "char",
   "level": 5,
   "atk": 2150,
   "def": 1850,
   "art": "BLUE-36",
   "faction": "navy",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "B",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "登场时：我方全体 ATK+100（至回合结束）"
  },
  {
   "id": "GLD-C0039",
   "name": "克比",
   "sub": "海军大佐",
   "role": "海军",
   "type": "char",
   "level": 2,
   "atk": 1300,
   "def": 1100,
   "art": "BLUE-41",
   "faction": "navy",
   "formation": null,
   "fruit": null,
   "rarity": "B",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "登场时：抽 1 张牌"
  },
  {
   "id": "GLD-C0040",
   "name": "乙姬",
   "sub": "王妃的祈愿",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1100,
   "art": "BLUE-46",
   "faction": "navy",
   "formation": null,
   "fruit": null,
   "rarity": "B",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "healLP",
       "amount": 100,
       "why": "「乙姬」效果"
      }
     ]
    }
   },
   "desc": "登场时：回复自身 LP 100"
  },
  {
   "id": "GLD-C0041",
   "name": "妮可·罗宾",
   "sub": "万紫千红",
   "role": "草帽一伙",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1400,
   "art": "BLUE-50",
   "faction": "strawhat",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "B",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "setPosDef",
       "target": "foeStrongestAtkPos"
      }
     ]
    }
   },
   "desc": "登场时：将对方攻击表示的最强人物转为守备"
  },
  {
   "id": "GLD-C0042",
   "name": "马尔科",
   "sub": "再生之炎",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 5,
   "atk": 2550,
   "def": 2750,
   "art": "BLUE-59",
   "faction": "whitebeard",
   "formation": "bulwark",
   "fruit": "paramecia",
   "rarity": "S",
   "ability": {
    "onDestroyed": {
     "ops": [
      {
       "op": "healLP",
       "amount": 100,
       "why": "「马尔科」效果"
      }
     ]
    }
   },
   "desc": "被破坏时：回复自身 LP 100"
  },
  {
   "id": "GLD-C0043",
   "name": "布鲁克",
   "sub": "灵魂之王",
   "role": "草帽一伙",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1100,
   "art": "BLUE-63",
   "faction": "strawhat",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "B",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "登场时：抽 1 张牌"
  },
  {
   "id": "GLD-C0044",
   "name": "Mr.3",
   "sub": "处刑人",
   "role": "王下七武海",
   "type": "char",
   "level": 2,
   "atk": 950,
   "def": 800,
   "art": "BLUE-65",
   "faction": "warlord",
   "formation": null,
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "damage",
       "amount": 100,
       "why": "「Mr.3」效果"
      }
     ]
    }
   },
   "desc": "登场时：给予对方 LP 100 伤害"
  },
  {
   "id": "GLD-C0045",
   "name": "乔拉可尔·米霍克",
   "sub": "王下七武海",
   "role": "王下七武海",
   "type": "char",
   "level": 3,
   "atk": 1350,
   "def": 1200,
   "art": "BLUE-67",
   "faction": "warlord",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "damage",
       "amount": 100,
       "why": "「乔拉可尔·米霍克」效果"
      }
     ]
    }
   },
   "desc": "登场时：给予对方 LP 100 伤害"
  },
  {
   "id": "GLD-C0046",
   "name": "波雅·汉库珂",
   "sub": "夜行",
   "role": "王下七武海",
   "type": "char",
   "level": 4,
   "atk": 1750,
   "def": 1550,
   "art": "BLUE-68",
   "faction": "warlord",
   "formation": "vanguard",
   "fruit": "paramecia",
   "rarity": "SS",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0047",
   "name": "哈雷达斯",
   "sub": "解放战线",
   "role": "革命军",
   "type": "char",
   "level": 3,
   "atk": 1350,
   "def": 1400,
   "art": "BLUE-69",
   "faction": "revolutionary",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "damage",
       "amount": 100,
       "why": "「哈雷达斯」效果"
      }
     ]
    }
   },
   "desc": "攻击宣言时：给予对方 LP 100 伤害"
  },
  {
   "id": "GLD-C0048",
   "name": "莫莉",
   "sub": "起义者",
   "role": "革命军",
   "type": "char",
   "level": 6,
   "atk": 2600,
   "def": 2500,
   "art": "BLUE-70",
   "faction": "revolutionary",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "SS",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "damage",
       "amount": 100,
       "why": "「莫莉」效果"
      }
     ]
    }
   },
   "desc": "登场时：给予对方 LP 100 伤害"
  },
  {
   "id": "GLD-C0049",
   "name": "基德娜",
   "sub": "解放战线",
   "role": "革命军",
   "type": "char",
   "level": 4,
   "atk": 1700,
   "def": 1500,
   "art": "BLUE-71",
   "faction": "revolutionary",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "setPosDef",
       "target": "foeStrongestAtkPos"
      }
     ]
    }
   },
   "desc": "登场时：将对方攻击表示的最强人物转为守备"
  },
  {
   "id": "GLD-C0050",
   "name": "皮卡",
   "sub": "处刑人",
   "role": "王下七武海",
   "type": "char",
   "level": 5,
   "atk": 2200,
   "def": 2050,
   "art": "BLUE-73",
   "faction": "warlord",
   "formation": null,
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 200,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "攻击宣言时：我方全体 ATK+200（至回合结束）"
  },
  {
   "id": "GLD-C0051",
   "name": "夏姆洛克",
   "sub": "起义者",
   "role": "革命军",
   "type": "char",
   "level": 5,
   "atk": 2200,
   "def": 1850,
   "art": "BLUE-74",
   "faction": "revolutionary",
   "formation": null,
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "setPosDef",
       "target": "foeStrongestAtkPos"
      }
     ]
    }
   },
   "desc": "攻击宣言时：将对方攻击表示的最强人物转为守备"
  },
  {
   "id": "GLD-C0052",
   "name": "维奥莱特",
   "sub": "暗流涌动",
   "role": "王下七武海",
   "type": "char",
   "level": 6,
   "atk": 2550,
   "def": 2550,
   "art": "BLUE-79",
   "faction": "warlord",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "damage",
       "amount": 100,
       "why": "「维奥莱特」效果"
      }
     ]
    }
   },
   "desc": "登场时：给予对方 LP 100 伤害"
  },
  {
   "id": "GLD-C0053",
   "name": "一笑",
   "sub": "海军将校",
   "role": "海军",
   "type": "char",
   "level": 4,
   "atk": 1700,
   "def": 1900,
   "art": "BLUE-80",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": "paramecia",
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "登场时：抽 1 张牌"
  },
  {
   "id": "GLD-C0054",
   "name": "小八",
   "sub": "隐密行动",
   "role": "革命军",
   "type": "char",
   "level": 5,
   "atk": 2200,
   "def": 1950,
   "art": "BLUE-82",
   "faction": "revolutionary",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 200,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "登场时：我方全体 ATK+200（至回合结束）"
  },
  {
   "id": "GLD-C0055",
   "name": "Miss圣诞快乐",
   "sub": "王下七武海",
   "role": "王下七武海",
   "type": "char",
   "level": 4,
   "atk": 1700,
   "def": 1500,
   "art": "BLUE-90",
   "faction": "warlord",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": -200,
       "target": "foeAll",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "登场时：对方全体 ATK-200（至战斗结束）"
  },
  {
   "id": "GLD-C0056",
   "name": "鹤·大将",
   "sub": "正义之师",
   "role": "海军",
   "type": "char",
   "level": 4,
   "atk": 1700,
   "def": 1700,
   "art": "BLUE-91",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "setPosDef",
       "target": "foeStrongestAtkPos"
      }
     ]
    }
   },
   "desc": "登场时：将对方攻击表示的最强人物转为守备"
  },
  {
   "id": "GLD-C0057",
   "name": "玛丽哥德",
   "sub": "暗流涌动",
   "role": "王下七武海",
   "type": "char",
   "level": 5,
   "atk": 2200,
   "def": 1950,
   "art": "BLUE-93",
   "faction": "warlord",
   "formation": "skirmish",
   "fruit": "paramecia",
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 200,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "登场时：我方全体 ATK+200（至回合结束）"
  },
  {
   "id": "GLD-C0058",
   "name": "闪电·革命军",
   "sub": "革命军干部",
   "role": "革命军",
   "type": "char",
   "level": 6,
   "atk": 2550,
   "def": 2250,
   "art": "BLUE-97",
   "faction": "revolutionary",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "setPosDef",
       "target": "foeStrongestAtkPos"
      }
     ]
    }
   },
   "desc": "登场时：将对方攻击表示的最强人物转为守备"
  },
  {
   "id": "GLD-C0059",
   "name": "波尔萨利诺·大将",
   "sub": "铁律",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2850,
   "art": "BLUE-99",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": "paramecia",
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "登场时：我方全体 ATK+100（至回合结束）"
  },
  {
   "id": "GLD-C0060",
   "name": "莫莉·革命军",
   "sub": "起义者",
   "role": "革命军",
   "type": "char",
   "level": 3,
   "atk": 1350,
   "def": 1200,
   "art": "BLUE-102",
   "faction": "revolutionary",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "登场时：抽 1 张牌"
  },
  {
   "id": "GLD-C0061",
   "name": "Miss黄金周",
   "sub": "夜行",
   "role": "王下七武海",
   "type": "char",
   "level": 5,
   "atk": 2200,
   "def": 2400,
   "art": "BLUE-104",
   "faction": "warlord",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "healLP",
       "amount": 200,
       "why": "「Miss黄金周」效果"
      }
     ]
    }
   },
   "desc": "登场时：回复自身 LP 200"
  },
  {
   "id": "GLD-C0062",
   "name": "库赞",
   "sub": "正义之师",
   "role": "海军",
   "type": "char",
   "level": 6,
   "atk": 2550,
   "def": 2250,
   "art": "BLUE-106",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": "logia",
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": -200,
       "target": "foeAll",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "登场时：对方全体 ATK-200（至战斗结束）"
  },
  {
   "id": "GLD-C0063",
   "name": "强纳森",
   "sub": "铁律",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 3200,
   "def": 3000,
   "art": "BLUE-109",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "SSS",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "setPosDef",
       "target": "foeStrongestAtkPos"
      }
     ]
    }
   },
   "desc": "登场时：将对方攻击表示的最强人物转为守备"
  },
  {
   "id": "GLD-C0064",
   "name": "孔美奥",
   "sub": "执法者",
   "role": "海军",
   "type": "char",
   "level": 5,
   "atk": 2200,
   "def": 2150,
   "art": "BLUE-111",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "登场时：抽 1 张牌"
  },
  {
   "id": "GLD-C0065",
   "name": "克尔拉",
   "sub": "革命军干部",
   "role": "革命军",
   "type": "char",
   "level": 3,
   "atk": 1350,
   "def": 1150,
   "art": "BLUE-113",
   "faction": "revolutionary",
   "formation": null,
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "healLP",
       "amount": 200,
       "why": "「克尔拉」效果"
      }
     ]
    }
   },
   "desc": "攻击宣言时：回复自身 LP 200"
  },
  {
   "id": "GLD-C0066",
   "name": "迪亚玛蒂",
   "sub": "王下七武海",
   "role": "王下七武海",
   "type": "char",
   "level": 5,
   "atk": 2200,
   "def": 2200,
   "art": "BLUE-114",
   "faction": "warlord",
   "formation": "bulwark",
   "fruit": "zoan",
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "self",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "攻击宣言时：自身 ATK+100（至战斗结束）"
  },
  {
   "id": "GLD-C0067",
   "name": "贝鲁梅特尔",
   "sub": "执法者",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1350,
   "def": 1200,
   "art": "BLUE-118",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onDestroyed": {
     "ops": [
      {
       "op": "damage",
       "amount": 100,
       "why": "「贝鲁梅特尔」效果"
      }
     ]
    }
   },
   "desc": "被破坏时：给予对方 LP 100 伤害"
  },
  {
   "id": "GLD-C0068",
   "name": "蒙奇·D·龙",
   "sub": "隐密行动",
   "role": "革命军",
   "type": "char",
   "level": 6,
   "atk": 2550,
   "def": 2450,
   "art": "BLUE-119",
   "faction": "revolutionary",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 2
      }
     ]
    }
   },
   "desc": "登场时：抽 2 张牌"
  },
  {
   "id": "GLD-C0069",
   "name": "林德伯格",
   "sub": "解放战线",
   "role": "革命军",
   "type": "char",
   "level": 7,
   "atk": 3450,
   "def": 2950,
   "art": "BLUE-120",
   "faction": "revolutionary",
   "formation": null,
   "fruit": null,
   "rarity": "SSS",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0070",
   "name": "林德伯格·革命军",
   "sub": "疾风",
   "role": "革命军",
   "type": "char",
   "level": 7,
   "atk": 3200,
   "def": 2700,
   "art": "BLUE-127",
   "faction": "revolutionary",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "SSS",
   "ability": {
    "onDestroyed": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "被破坏时：我方全体 ATK+100（至回合结束）"
  },
  {
   "id": "GLD-C0071",
   "name": "阿布萨罗姆",
   "sub": "傀儡师",
   "role": "王下七武海",
   "type": "char",
   "level": 4,
   "atk": 1700,
   "def": 1350,
   "art": "BLUE-138",
   "faction": "warlord",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": -200,
       "target": "foeAll",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "登场时：对方全体 ATK-200（至战斗结束）"
  },
  {
   "id": "GLD-C0072",
   "name": "克尔拉·革命军",
   "sub": "隐密行动",
   "role": "革命军",
   "type": "char",
   "level": 3,
   "atk": 1350,
   "def": 1200,
   "art": "BLUE-139",
   "faction": "revolutionary",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "setPosDef",
       "target": "foeStrongestAtkPos"
      }
     ]
    }
   },
   "desc": "攻击宣言时：将对方攻击表示的最强人物转为守备"
  },
  {
   "id": "GLD-C0073",
   "name": "库赞·大将",
   "sub": "缉捕令",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1350,
   "def": 1200,
   "art": "BLUE-140",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": "paramecia",
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onDestroyed": {
     "ops": [
      {
       "op": "healLP",
       "amount": 100,
       "why": "「库赞·大将」效果"
      }
     ]
    }
   },
   "desc": "被破坏时：回复自身 LP 100"
  },
  {
   "id": "GLD-C0074",
   "name": "安布里奥·伊万科夫·革命军",
   "sub": "隐密行动",
   "role": "革命军",
   "type": "char",
   "level": 6,
   "atk": 2600,
   "def": 2400,
   "art": "BLUE-142",
   "faction": "revolutionary",
   "formation": null,
   "fruit": null,
   "rarity": "SS",
   "keywords": [
    "rush"
   ],
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0075",
   "name": "维尔戈",
   "sub": "铁律",
   "role": "海军",
   "type": "char",
   "level": 5,
   "atk": 2250,
   "def": 2000,
   "art": "BLUE-146",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "SS",
   "keywords": [
    "rush",
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0076",
   "name": "特雷波尔",
   "sub": "暗流涌动",
   "role": "王下七武海",
   "type": "char",
   "level": 3,
   "atk": 1350,
   "def": 1400,
   "art": "BLUE-148",
   "faction": "warlord",
   "formation": "skirmish",
   "fruit": "paramecia",
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "登场时：我方全体 ATK+100（至回合结束）"
  },
  {
   "id": "GLD-C0077",
   "name": "阿拉马基",
   "sub": "铁律",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 3450,
   "def": 2950,
   "art": "BLUE-150",
   "faction": "navy",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "SSS",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0078",
   "name": "格拉迪乌斯",
   "sub": "暗流涌动",
   "role": "王下七武海",
   "type": "char",
   "level": 6,
   "atk": 2550,
   "def": 2450,
   "art": "BLUE-158",
   "faction": "warlord",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 200,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "登场时：我方全体 ATK+200（至回合结束）"
  },
  {
   "id": "GLD-C0079",
   "name": "鹤",
   "sub": "缉捕令",
   "role": "海军",
   "type": "char",
   "level": 2,
   "atk": 950,
   "def": 1100,
   "art": "BLUE-159",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "setPosDef",
       "target": "foeStrongestAtkPos"
      }
     ]
    }
   },
   "desc": "登场时：将对方攻击表示的最强人物转为守备"
  },
  {
   "id": "GLD-C0080",
   "name": "提娜",
   "sub": "正义之师",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 3200,
   "def": 3200,
   "art": "BLUE-163",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "SSS",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 300,
       "target": "self",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "登场时：自身 ATK+300（至战斗结束）"
  },
  {
   "id": "GLD-C0081",
   "name": "蒙奇·D·卡普",
   "sub": "巡逻舰队",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2700,
   "art": "BLUE-167",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "draw",
       "amount": 2
      }
     ]
    }
   },
   "desc": "攻击宣言时：抽 2 张牌"
  },
  {
   "id": "GLD-C0082",
   "name": "战国·大将",
   "sub": "正义之师",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2850,
   "art": "BLUE-168",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onDestroyed": {
     "ops": [
      {
       "op": "healLP",
       "amount": 200,
       "why": "「战国·大将」效果"
      }
     ]
    }
   },
   "desc": "被破坏时：回复自身 LP 200"
  },
  {
   "id": "GLD-C0083",
   "name": "达斯琪·大将",
   "sub": "巡逻舰队",
   "role": "海军",
   "type": "char",
   "level": 6,
   "atk": 2600,
   "def": 2500,
   "art": "BLUE-171",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": "paramecia",
   "rarity": "SS",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0084",
   "name": "霍格巴克",
   "sub": "孤高之刃",
   "role": "王下七武海",
   "type": "char",
   "level": 5,
   "atk": 2200,
   "def": 1950,
   "art": "BLUE-174",
   "faction": "warlord",
   "formation": "skirmish",
   "fruit": "paramecia",
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "登场时：我方全体 ATK+100（至回合结束）"
  },
  {
   "id": "GLD-C0085",
   "name": "黑团双巨头 蒂奇&希留",
   "sub": "融合",
   "role": "百兽海贼团",
   "type": "char",
   "level": 7,
   "atk": 3200,
   "def": 2500,
   "art": "BLACK-26",
   "faction": "beast",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "SSS",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0086",
   "name": "海底监狱的铁壁 麦哲伦&汉尼拔",
   "sub": "融合",
   "role": "百兽海贼团",
   "type": "char",
   "level": 7,
   "atk": 3200,
   "def": 3400,
   "art": "BLACK-31",
   "faction": "beast",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "SSS",
   "keywords": [
    "rush"
   ],
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0087",
   "name": "海军的魂 战国&卡普",
   "sub": "融合",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 3200,
   "def": 3400,
   "art": "BLUE-11",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "SSS",
   "keywords": [
    "rush"
   ],
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0088",
   "name": "阳光号的伙伴 娜美&弗兰奇",
   "sub": "融合",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 3200,
   "def": 2500,
   "art": "BLUE-25",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "SSS",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "登场时：我方全体 ATK+100（至回合结束）"
  },
  {
   "id": "GLD-C0089",
   "name": "鬼岛决战 凯多&大和",
   "sub": "融合",
   "role": "草帽一伙",
   "type": "char",
   "level": 7,
   "atk": 3200,
   "def": 2500,
   "art": "GREEN-12",
   "faction": "strawhat",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "SSS",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0090",
   "name": "斩铁之魂 索隆&龙马",
   "sub": "融合",
   "role": "草帽一伙",
   "type": "char",
   "level": 7,
   "atk": 3200,
   "def": 2500,
   "art": "GREEN-25",
   "faction": "strawhat",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "SSS",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "self",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "攻击宣言时：自身 ATK+100（至战斗结束）"
  },
  {
   "id": "GLD-C0091",
   "name": "最恶世代 罗与基德",
   "sub": "融合",
   "role": "王下七武海",
   "type": "char",
   "level": 7,
   "atk": 3200,
   "def": 2500,
   "art": "PURPLE-24",
   "faction": "warlord",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "SSS",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "登场时：抽 1 张牌"
  },
  {
   "id": "GLD-C0092",
   "name": "剑士的顶点 米霍克&雷利",
   "sub": "融合",
   "role": "王下七武海",
   "type": "char",
   "level": 7,
   "atk": 3200,
   "def": 2500,
   "art": "PURPLE-10",
   "faction": "warlord",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "SSS",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0093",
   "name": "火之意志 艾斯&萨博",
   "sub": "融合",
   "role": "草帽一伙",
   "type": "char",
   "level": 7,
   "atk": 3200,
   "def": 2500,
   "art": "RED-08",
   "faction": "strawhat",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "SSS",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0094",
   "name": "传承之火 路飞&罗杰",
   "sub": "融合",
   "role": "草帽一伙",
   "type": "char",
   "level": 7,
   "atk": 3200,
   "def": 2500,
   "art": "RED-27",
   "faction": "strawhat",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "SSS",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "self",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "攻击宣言时：自身 ATK+100（至战斗结束）"
  },
  {
   "id": "GLD-C0095",
   "name": "九蛇岛的守护 汉库珂&玛格丽特",
   "sub": "融合",
   "role": "王下七武海",
   "type": "char",
   "level": 7,
   "atk": 3200,
   "def": 2500,
   "art": "YELLOW-29",
   "faction": "warlord",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "SSS",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "setPosDef",
       "target": "foeStrongestAtkPos"
      }
     ]
    }
   },
   "desc": "登场时：将对方攻击表示的最强人物转为守备"
  },
  {
   "id": "GLD-C0096",
   "name": "万国的威压 玲玲&斯慕吉",
   "sub": "融合",
   "role": "王下七武海",
   "type": "char",
   "level": 7,
   "atk": 3200,
   "def": 2500,
   "art": "YELLOW-20",
   "faction": "warlord",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "SSS",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "damage",
       "amount": 100,
       "why": "「万国的威压 玲玲&斯慕吉」效果"
      }
     ]
    }
   },
   "desc": "登场时：给予对方 LP 100 伤害"
  },
  {
   "id": "GLD-C0097",
   "name": "白胡子",
   "sub": "爱德华·纽盖特",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 7,
   "atk": 3150,
   "def": 2700,
   "art": "GREEN-10",
   "faction": "whitebeard",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "SS",
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "self",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "攻击宣言时：自身 ATK+100（至战斗结束）"
  },
  {
   "id": "GLD-C0098",
   "name": "凯多",
   "sub": "鱼鱼果实·青龙",
   "role": "百兽海贼团",
   "type": "char",
   "level": 7,
   "atk": 3150,
   "def": 2700,
   "art": "GREEN-12",
   "faction": "beast",
   "formation": null,
   "fruit": "zoan",
   "rarity": "SS",
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "self",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "攻击宣言时：自身 ATK+100（至战斗结束）"
  },
  {
   "id": "GLD-C0099",
   "name": "罗罗诺亚·索隆",
   "sub": "三刀流·鬼气",
   "role": "草帽一伙",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1400,
   "art": "GREEN-25",
   "faction": "strawhat",
   "formation": null,
   "fruit": null,
   "rarity": "B",
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "self",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "攻击宣言时：自身 ATK+100（至战斗结束）"
  },
  {
   "id": "GLD-C0100",
   "name": "蒙奇·D·龙",
   "sub": "革命军领袖",
   "role": "革命军",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2400,
   "art": "GREEN-33",
   "faction": "revolutionary",
   "formation": null,
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "setPosDef",
       "target": "foeStrongestAtkPos"
      }
     ]
    }
   },
   "desc": "登场时：将对方攻击表示的最强人物转为守备"
  },
  {
   "id": "GLD-C0101",
   "name": "象主",
   "sub": "千年巨象",
   "role": "草帽一伙",
   "type": "char",
   "level": 7,
   "atk": 3450,
   "def": 2950,
   "art": "GREEN-46",
   "faction": "strawhat",
   "formation": null,
   "fruit": null,
   "rarity": "SSS",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0102",
   "name": "绿牛",
   "sub": "荆棘林",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2400,
   "art": "GREEN-53",
   "faction": "navy",
   "formation": null,
   "fruit": "logia",
   "rarity": "S",
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "self",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "攻击宣言时：自身 ATK+100（至战斗结束）"
  },
  {
   "id": "GLD-C0103",
   "name": "卡莉法",
   "sub": "缉捕令",
   "role": "海军",
   "type": "char",
   "level": 6,
   "atk": 2550,
   "def": 2250,
   "art": "GREEN-66",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": "paramecia",
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "damage",
       "amount": 200,
       "why": "「卡莉法」效果"
      }
     ]
    }
   },
   "desc": "攻击宣言时：给予对方 LP 200 伤害"
  },
  {
   "id": "GLD-C0104",
   "name": "贝加庞克",
   "sub": "结盟",
   "role": "极恶世代",
   "type": "char",
   "level": 2,
   "atk": 950,
   "def": 800,
   "art": "GREEN-68",
   "faction": "supernova",
   "formation": null,
   "fruit": "zoan",
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onDestroyed": {
     "ops": [
      {
       "op": "damage",
       "amount": 100,
       "why": "「贝加庞克」效果"
      }
     ]
    }
   },
   "desc": "被破坏时：给予对方 LP 100 伤害"
  },
  {
   "id": "GLD-C0105",
   "name": "赞高",
   "sub": "正义之师",
   "role": "海军",
   "type": "char",
   "level": 6,
   "atk": 2600,
   "def": 2500,
   "art": "GREEN-70",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "SS",
   "ability": {
    "onDestroyed": {
     "ops": [
      {
       "op": "damage",
       "amount": 100,
       "why": "「赞高」效果"
      }
     ]
    }
   },
   "desc": "被破坏时：给予对方 LP 100 伤害"
  },
  {
   "id": "GLD-C0106",
   "name": "艾恩",
   "sub": "乱世枭雄",
   "role": "极恶世代",
   "type": "char",
   "level": 4,
   "atk": 1700,
   "def": 1500,
   "art": "GREEN-72",
   "faction": "supernova",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "damage",
       "amount": 200,
       "why": "「艾恩」效果"
      }
     ]
    }
   },
   "desc": "登场时：给予对方 LP 200 伤害"
  },
  {
   "id": "GLD-C0107",
   "name": "库赞·大将",
   "sub": "执法者",
   "role": "海军",
   "type": "char",
   "level": 2,
   "atk": 950,
   "def": 750,
   "art": "GREEN-75",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "healLP",
       "amount": 100,
       "why": "「库赞·大将」效果"
      }
     ]
    }
   },
   "desc": "登场时：回复自身 LP 100"
  },
  {
   "id": "GLD-C0108",
   "name": "拉库约",
   "sub": "残火",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 6,
   "atk": 2550,
   "def": 2000,
   "art": "GREEN-76",
   "faction": "whitebeard",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "登场时：我方全体 ATK+100（至回合结束）"
  },
  {
   "id": "GLD-C0109",
   "name": "强纳森",
   "sub": "正义之师",
   "role": "海军",
   "type": "char",
   "level": 5,
   "atk": 2200,
   "def": 1700,
   "art": "GREEN-77",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "攻击宣言时：抽 1 张牌"
  },
  {
   "id": "GLD-C0110",
   "name": "维尔戈",
   "sub": "正义之师",
   "role": "海军",
   "type": "char",
   "level": 4,
   "atk": 1700,
   "def": 1550,
   "art": "GREEN-80",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "healLP",
       "amount": 100,
       "why": "「维尔戈」效果"
      }
     ]
    }
   },
   "desc": "攻击宣言时：回复自身 LP 100"
  },
  {
   "id": "GLD-C0111",
   "name": "贝波",
   "sub": "新星",
   "role": "极恶世代",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2700,
   "art": "GREEN-81",
   "faction": "supernova",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "damage",
       "amount": 100,
       "why": "「贝波」效果"
      }
     ]
    }
   },
   "desc": "登场时：给予对方 LP 100 伤害"
  },
  {
   "id": "GLD-C0112",
   "name": "哈库",
   "sub": "出头天",
   "role": "极恶世代",
   "type": "char",
   "level": 4,
   "atk": 1700,
   "def": 1500,
   "art": "GREEN-83",
   "faction": "supernova",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "damage",
       "amount": 100,
       "why": "「哈库」效果"
      }
     ]
    }
   },
   "desc": "攻击宣言时：给予对方 LP 100 伤害"
  },
  {
   "id": "GLD-C0113",
   "name": "布鲁诺",
   "sub": "执法者",
   "role": "海军",
   "type": "char",
   "level": 6,
   "atk": 2550,
   "def": 2550,
   "art": "GREEN-84",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "登场时：我方全体 ATK+100（至回合结束）"
  },
  {
   "id": "GLD-C0114",
   "name": "火烧山",
   "sub": "执法者",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 3200,
   "def": 3400,
   "art": "GREEN-86",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": "logia",
   "rarity": "SSS",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "deckSearch",
       "filter": {
        "faction": "navy"
       }
      }
     ]
    }
   },
   "desc": "登场时：从牌组检索 1 张同阵营伙伴加入手牌"
  },
  {
   "id": "GLD-C0115",
   "name": "布罗吉",
   "sub": "冒险王",
   "role": "草帽一伙",
   "type": "char",
   "level": 5,
   "atk": 2200,
   "def": 2150,
   "art": "GREEN-88",
   "faction": "strawhat",
   "formation": "skirmish",
   "fruit": "paramecia",
   "rarity": "S",
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "攻击宣言时：我方全体 ATK+100（至回合结束）"
  },
  {
   "id": "GLD-C0116",
   "name": "亚尔丽塔",
   "sub": "野心家",
   "role": "极恶世代",
   "type": "char",
   "level": 3,
   "atk": 1350,
   "def": 1250,
   "art": "GREEN-89",
   "faction": "supernova",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "damage",
       "amount": 200,
       "why": "「亚尔丽塔」效果"
      }
     ]
    }
   },
   "desc": "登场时：给予对方 LP 200 伤害"
  },
  {
   "id": "GLD-C0117",
   "name": "瓦尔波",
   "sub": "乱世枭雄",
   "role": "极恶世代",
   "type": "char",
   "level": 3,
   "atk": 1350,
   "def": 1550,
   "art": "GREEN-90",
   "faction": "supernova",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "healLP",
       "amount": 200,
       "why": "「瓦尔波」效果"
      }
     ]
    }
   },
   "desc": "登场时：回复自身 LP 200"
  },
  {
   "id": "GLD-C0118",
   "name": "卡拉斯",
   "sub": "乱世枭雄",
   "role": "极恶世代",
   "type": "char",
   "level": 6,
   "atk": 2600,
   "def": 2800,
   "art": "GREEN-94",
   "faction": "supernova",
   "formation": "bulwark",
   "fruit": "zoan",
   "rarity": "SS",
   "keywords": [
    "rush"
   ],
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0119",
   "name": "库洛卡斯",
   "sub": "自由之海",
   "role": "草帽一伙",
   "type": "char",
   "level": 4,
   "atk": 1700,
   "def": 1700,
   "art": "GREEN-96",
   "faction": "strawhat",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "healLP",
       "amount": 100,
       "why": "「库洛卡斯」效果"
      }
     ]
    }
   },
   "desc": "登场时：回复自身 LP 100"
  },
  {
   "id": "GLD-C0120",
   "name": "波尔萨利诺",
   "sub": "海军将校",
   "role": "海军",
   "type": "char",
   "level": 6,
   "atk": 2550,
   "def": 2250,
   "art": "GREEN-99",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "登场时：抽 1 张牌"
  },
  {
   "id": "GLD-C0121",
   "name": "娜美·新世界",
   "sub": "冒险者",
   "role": "草帽一伙",
   "type": "char",
   "level": 4,
   "atk": 1700,
   "def": 1350,
   "art": "GREEN-100",
   "faction": "strawhat",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "登场时：我方全体 ATK+100（至回合结束）"
  },
  {
   "id": "GLD-C0122",
   "name": "山治·新世界",
   "sub": "伙伴之力",
   "role": "草帽一伙",
   "type": "char",
   "level": 6,
   "atk": 2550,
   "def": 2250,
   "art": "GREEN-102",
   "faction": "strawhat",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "登场时：抽 1 张牌"
  },
  {
   "id": "GLD-C0123",
   "name": "X·德雷克",
   "sub": "野心家",
   "role": "极恶世代",
   "type": "char",
   "level": 4,
   "atk": 1700,
   "def": 1700,
   "art": "GREEN-105",
   "faction": "supernova",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "setPosDef",
       "target": "foeStrongestAtkPos"
      }
     ]
    }
   },
   "desc": "登场时：将对方攻击表示的最强人物转为守备"
  },
  {
   "id": "GLD-C0124",
   "name": "阿龙",
   "sub": "最恶世代",
   "role": "极恶世代",
   "type": "char",
   "level": 3,
   "atk": 1350,
   "def": 1400,
   "art": "GREEN-107",
   "faction": "supernova",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 2
      }
     ]
    }
   },
   "desc": "登场时：抽 2 张牌"
  },
  {
   "id": "GLD-C0125",
   "name": "斯摩格",
   "sub": "海军将校",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1350,
   "def": 1200,
   "art": "GREEN-110",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": "paramecia",
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "setPosDef",
       "target": "foeStrongestAtkPos"
      }
     ]
    }
   },
   "desc": "登场时：将对方攻击表示的最强人物转为守备"
  },
  {
   "id": "GLD-C0126",
   "name": "乔艾莉·波妮",
   "sub": "结盟",
   "role": "极恶世代",
   "type": "char",
   "level": 5,
   "atk": 2200,
   "def": 2200,
   "art": "GREEN-111",
   "faction": "supernova",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 300,
       "target": "self",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "登场时：自身 ATK+300（至战斗结束）"
  },
  {
   "id": "GLD-C0127",
   "name": "冰山",
   "sub": "自由之海",
   "role": "草帽一伙",
   "type": "char",
   "level": 6,
   "atk": 2550,
   "def": 2550,
   "art": "GREEN-115",
   "faction": "strawhat",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "healLP",
       "amount": 200,
       "why": "「冰山」效果"
      }
     ]
    }
   },
   "desc": "登场时：回复自身 LP 200"
  },
  {
   "id": "GLD-C0128",
   "name": "罗罗诺亚·索隆·新世界",
   "sub": "扬帆起航",
   "role": "草帽一伙",
   "type": "char",
   "level": 3,
   "atk": 1350,
   "def": 1200,
   "art": "GREEN-117",
   "faction": "strawhat",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 200,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "登场时：我方全体 ATK+200（至回合结束）"
  },
  {
   "id": "GLD-C0129",
   "name": "蒙奇·D·卡普",
   "sub": "缉捕令",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1350,
   "def": 1250,
   "art": "GREEN-118",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onDestroyed": {
     "ops": [
      {
       "op": "healLP",
       "amount": 100,
       "why": "「蒙奇·D·卡普」效果"
      }
     ]
    }
   },
   "desc": "被破坏时：回复自身 LP 100"
  },
  {
   "id": "GLD-C0130",
   "name": "克洛",
   "sub": "最恶世代",
   "role": "极恶世代",
   "type": "char",
   "level": 7,
   "atk": 2900,
   "def": 2550,
   "art": "GREEN-119",
   "faction": "supernova",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "SS",
   "ability": {
    "onDestroyed": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "被破坏时：抽 1 张牌"
  },
  {
   "id": "GLD-C0131",
   "name": "萨奇",
   "sub": "遗志",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 2,
   "atk": 950,
   "def": 850,
   "art": "GREEN-123",
   "faction": "whitebeard",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onDestroyed": {
     "ops": [
      {
       "op": "setPosDef",
       "target": "foeStrongestAtkPos"
      }
     ]
    }
   },
   "desc": "被破坏时：将对方攻击表示的最强人物转为守备"
  },
  {
   "id": "GLD-C0132",
   "name": "鹤",
   "sub": "巡逻舰队",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 3200,
   "def": 2800,
   "art": "GREEN-130",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "SSS",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "deckSearch",
       "filter": {
        "faction": "navy"
       }
      }
     ]
    }
   },
   "desc": "登场时：从牌组检索 1 张同阵营伙伴加入手牌"
  },
  {
   "id": "GLD-C0133",
   "name": "提娜",
   "sub": "海军将校",
   "role": "海军",
   "type": "char",
   "level": 4,
   "atk": 1750,
   "def": 1950,
   "art": "GREEN-137",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": "paramecia",
   "rarity": "SS",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0134",
   "name": "蒙奇·D·路飞",
   "sub": "草帽一伙",
   "role": "草帽一伙",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2850,
   "art": "GREEN-143",
   "faction": "strawhat",
   "formation": "bulwark",
   "fruit": "logia",
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "deckSearch",
       "filter": {
        "faction": "strawhat"
       }
      }
     ]
    }
   },
   "desc": "登场时：从牌组检索 1 张同阵营伙伴加入手牌"
  },
  {
   "id": "GLD-C0135",
   "name": "萨卡斯基·大将",
   "sub": "缉捕令",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 3150,
   "def": 2950,
   "art": "GREEN-144",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "SS",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0136",
   "name": "巴斯提雍",
   "sub": "海军将校",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 2900,
   "def": 3100,
   "art": "GREEN-145",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "SS",
   "keywords": [
    "rush"
   ],
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0137",
   "name": "缇娜",
   "sub": "正义之师",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1350,
   "def": 1050,
   "art": "GREEN-146",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": -200,
       "target": "foeAll",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "登场时：对方全体 ATK-200（至战斗结束）"
  },
  {
   "id": "GLD-C0138",
   "name": "加布拉",
   "sub": "巡逻舰队",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 3150,
   "def": 3150,
   "art": "GREEN-151",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": "logia",
   "rarity": "SS",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0139",
   "name": "阿拉马基",
   "sub": "巡逻舰队",
   "role": "海军",
   "type": "char",
   "level": 4,
   "atk": 1700,
   "def": 1500,
   "art": "GREEN-153",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 300,
       "target": "self",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "登场时：自身 ATK+300（至战斗结束）"
  },
  {
   "id": "GLD-C0140",
   "name": "布拉曼克",
   "sub": "白胡子一族",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2700,
   "art": "GREEN-155",
   "faction": "whitebeard",
   "formation": "skirmish",
   "fruit": "zoan",
   "rarity": "S",
   "ability": {
    "onDestroyed": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 200,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "被破坏时：我方全体 ATK+200（至回合结束）"
  },
  {
   "id": "GLD-C0141",
   "name": "乔兹",
   "sub": "白胡子一族",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 7,
   "atk": 3200,
   "def": 3200,
   "art": "GREEN-161",
   "faction": "whitebeard",
   "formation": "bulwark",
   "fruit": "paramecia",
   "rarity": "SSS",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 2
      }
     ]
    }
   },
   "desc": "登场时：抽 2 张牌"
  },
  {
   "id": "GLD-C0142",
   "name": "拉布",
   "sub": "扬帆起航",
   "role": "草帽一伙",
   "type": "char",
   "level": 5,
   "atk": 2200,
   "def": 2400,
   "art": "GREEN-163",
   "faction": "strawhat",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "登场时：抽 1 张牌"
  },
  {
   "id": "GLD-C0143",
   "name": "布鲁克",
   "sub": "草帽一伙",
   "role": "草帽一伙",
   "type": "char",
   "level": 2,
   "atk": 950,
   "def": 1050,
   "art": "GREEN-164",
   "faction": "strawhat",
   "formation": "skirmish",
   "fruit": "zoan",
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "setPosDef",
       "target": "foeStrongestAtkPos"
      }
     ]
    }
   },
   "desc": "登场时：将对方攻击表示的最强人物转为守备"
  },
  {
   "id": "GLD-C0144",
   "name": "乙姬",
   "sub": "冒险者",
   "role": "草帽一伙",
   "type": "char",
   "level": 3,
   "atk": 1350,
   "def": 1550,
   "art": "GREEN-167",
   "faction": "strawhat",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onDestroyed": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "被破坏时：抽 1 张牌"
  },
  {
   "id": "GLD-C0145",
   "name": "克比",
   "sub": "海军将校",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 3050,
   "art": "GREEN-173",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "登场时：抽 1 张牌"
  },
  {
   "id": "GLD-C0146",
   "name": "凯撒·克朗",
   "sub": "毒气",
   "role": "极恶世代",
   "type": "char",
   "level": 4,
   "atk": 2150,
   "def": 1850,
   "art": "PURPLE-07",
   "faction": "supernova",
   "formation": null,
   "fruit": "logia",
   "rarity": "B",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "setPosDef",
       "target": "foeStrongestAtkPos"
      }
     ]
    }
   },
   "desc": "登场时：将对方攻击表示的最强人物转为守备"
  },
  {
   "id": "GLD-C0147",
   "name": "让·巴特",
   "sub": "心脏海贼团",
   "role": "王下七武海",
   "type": "char",
   "level": 7,
   "atk": 3450,
   "def": 2950,
   "art": "PURPLE-18",
   "faction": "warlord",
   "formation": null,
   "fruit": null,
   "rarity": "SSS",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0148",
   "name": "唐吉诃德·多弗朗明戈",
   "sub": "寄生线",
   "role": "王下七武海",
   "type": "char",
   "level": 5,
   "atk": 2500,
   "def": 2150,
   "art": "PURPLE-30",
   "faction": "warlord",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "B",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "setPosDef",
       "target": "foeStrongestAtkPos"
      }
     ]
    }
   },
   "desc": "登场时：将对方攻击表示的最强人物转为守备"
  },
  {
   "id": "GLD-C0149",
   "name": "尤斯塔斯·基德",
   "sub": "磁力·斥力",
   "role": "极恶世代",
   "type": "char",
   "level": 5,
   "atk": 2150,
   "def": 1850,
   "art": "PURPLE-36",
   "faction": "supernova",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "B",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "setPosDef",
       "target": "foeStrongestAtkPos"
      }
     ]
    }
   },
   "desc": "登场时：将对方攻击表示的最强人物转为守备"
  },
  {
   "id": "GLD-C0150",
   "name": "乔艾莉·波妮",
   "sub": "年龄操控",
   "role": "极恶世代",
   "type": "char",
   "level": 5,
   "atk": 2150,
   "def": 1850,
   "art": "PURPLE-41",
   "faction": "supernova",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "B",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "setPosDef",
       "target": "foeStrongestAtkPos"
      }
     ]
    }
   },
   "desc": "登场时：将对方攻击表示的最强人物转为守备"
  },
  {
   "id": "GLD-C0151",
   "name": "贝加庞克",
   "sub": "军事科学家",
   "role": "极恶世代",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1100,
   "art": "PURPLE-51",
   "faction": "supernova",
   "formation": null,
   "fruit": null,
   "rarity": "B",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "登场时：抽 1 张牌"
  },
  {
   "id": "GLD-C0152",
   "name": "席尔巴斯·雷利",
   "sub": "冥王·三色霸气",
   "role": "四皇",
   "type": "char",
   "level": 7,
   "atk": 3150,
   "def": 2700,
   "art": "PURPLE-54",
   "faction": "yonko",
   "formation": null,
   "fruit": null,
   "rarity": "SS",
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 200,
       "target": "self",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "攻击宣言时：自身 ATK+200（至战斗结束）"
  },
  {
   "id": "GLD-C0153",
   "name": "唐吉诃德·罗西南迪",
   "sub": "白衣的守护",
   "role": "海军",
   "type": "char",
   "level": 5,
   "atk": 2150,
   "def": 1850,
   "art": "PURPLE-57",
   "faction": "navy",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "B",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "healLP",
       "amount": 100,
       "why": "「唐吉诃德·罗西南迪」效果"
      }
     ]
    }
   },
   "desc": "登场时：回复自身 LP 100"
  },
  {
   "id": "GLD-C0154",
   "name": "维奥莱特",
   "sub": "千里眼",
   "role": "王下七武海",
   "type": "char",
   "level": 4,
   "atk": 2150,
   "def": 1850,
   "art": "PURPLE-59",
   "faction": "warlord",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "B",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "登场时：抽 1 张牌"
  },
  {
   "id": "GLD-C0155",
   "name": "霍尔德姆",
   "sub": "百兽军团",
   "role": "百兽海贼团",
   "type": "char",
   "level": 7,
   "atk": 3200,
   "def": 3000,
   "art": "PURPLE-67",
   "faction": "beast",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "SSS",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "damage",
       "amount": 200,
       "why": "「霍尔德姆」效果"
      }
     ]
    }
   },
   "desc": "登场时：给予对方 LP 200 伤害"
  },
  {
   "id": "GLD-C0156",
   "name": "多古拉",
   "sub": "狩猎者",
   "role": "百兽海贼团",
   "type": "char",
   "level": 6,
   "atk": 2550,
   "def": 2200,
   "art": "PURPLE-69",
   "faction": "beast",
   "formation": "vanguard",
   "fruit": "paramecia",
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "damage",
       "amount": 200,
       "why": "「多古拉」效果"
      }
     ]
    }
   },
   "desc": "登场时：给予对方 LP 200 伤害"
  },
  {
   "id": "GLD-C0157",
   "name": "佩罗娜·王下",
   "sub": "孤高之刃",
   "role": "王下七武海",
   "type": "char",
   "level": 2,
   "atk": 950,
   "def": 850,
   "art": "PURPLE-70",
   "faction": "warlord",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "damage",
       "amount": 100,
       "why": "「佩罗娜·王下」效果"
      }
     ]
    }
   },
   "desc": "攻击宣言时：给予对方 LP 100 伤害"
  },
  {
   "id": "GLD-C0158",
   "name": "多彭",
   "sub": "狩猎者",
   "role": "百兽海贼团",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2200,
   "art": "PURPLE-71",
   "faction": "beast",
   "formation": "vanguard",
   "fruit": "paramecia",
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 2
      }
     ]
    }
   },
   "desc": "登场时：抽 2 张牌"
  },
  {
   "id": "GLD-C0159",
   "name": "克比",
   "sub": "海军将校",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 2900,
   "def": 2450,
   "art": "PURPLE-72",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": "zoan",
   "rarity": "SS",
   "keywords": [
    "rush"
   ],
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0160",
   "name": "乔拉可尔·米霍克·王下",
   "sub": "孤高之刃",
   "role": "王下七武海",
   "type": "char",
   "level": 7,
   "atk": 2900,
   "def": 3100,
   "art": "PURPLE-74",
   "faction": "warlord",
   "formation": "bulwark",
   "fruit": "paramecia",
   "rarity": "SS",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 2
      }
     ]
    }
   },
   "desc": "登场时：抽 2 张牌"
  },
  {
   "id": "GLD-C0161",
   "name": "斯摩格",
   "sub": "执法者",
   "role": "海军",
   "type": "char",
   "level": 2,
   "atk": 950,
   "def": 850,
   "art": "PURPLE-76",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "damage",
       "amount": 100,
       "why": "「斯摩格」效果"
      }
     ]
    }
   },
   "desc": "登场时：给予对方 LP 100 伤害"
  },
  {
   "id": "GLD-C0162",
   "name": "波雅·汉库珂",
   "sub": "处刑人",
   "role": "王下七武海",
   "type": "char",
   "level": 2,
   "atk": 950,
   "def": 950,
   "art": "PURPLE-79",
   "faction": "warlord",
   "formation": "vanguard",
   "fruit": "paramecia",
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "登场时：抽 1 张牌"
  },
  {
   "id": "GLD-C0163",
   "name": "蒙奇·D·卡普",
   "sub": "执法者",
   "role": "海军",
   "type": "char",
   "level": 6,
   "atk": 2550,
   "def": 2450,
   "art": "PURPLE-80",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 200,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "登场时：我方全体 ATK+200（至回合结束）"
  },
  {
   "id": "GLD-C0164",
   "name": "克隆",
   "sub": "SMILE能力者",
   "role": "百兽海贼团",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2500,
   "art": "PURPLE-83",
   "faction": "beast",
   "formation": "skirmish",
   "fruit": "paramecia",
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "登场时：抽 1 张牌"
  },
  {
   "id": "GLD-C0165",
   "name": "腕龙",
   "sub": "百兽军团",
   "role": "百兽海贼团",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2400,
   "art": "PURPLE-85",
   "faction": "beast",
   "formation": null,
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "登场时：抽 1 张牌"
  },
  {
   "id": "GLD-C0166",
   "name": "大和",
   "sub": "鬼岛之主",
   "role": "百兽海贼团",
   "type": "char",
   "level": 6,
   "atk": 2550,
   "def": 2000,
   "art": "PURPLE-94",
   "faction": "beast",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "攻击宣言时：抽 1 张牌"
  },
  {
   "id": "GLD-C0167",
   "name": "鼯鼠",
   "sub": "正义之师",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1350,
   "def": 1150,
   "art": "PURPLE-100",
   "faction": "navy",
   "formation": null,
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "登场时：我方全体 ATK+100（至回合结束）"
  },
  {
   "id": "GLD-C0168",
   "name": "奎因",
   "sub": "狩猎者",
   "role": "百兽海贼团",
   "type": "char",
   "level": 4,
   "atk": 1700,
   "def": 1500,
   "art": "PURPLE-108",
   "faction": "beast",
   "formation": "skirmish",
   "fruit": "zoan",
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "damage",
       "amount": 200,
       "why": "「奎因」效果"
      }
     ]
    }
   },
   "desc": "登场时：给予对方 LP 200 伤害"
  },
  {
   "id": "GLD-C0169",
   "name": "沙尔·克洛克达尔·王下",
   "sub": "暗流涌动",
   "role": "王下七武海",
   "type": "char",
   "level": 5,
   "atk": 2200,
   "def": 1900,
   "art": "PURPLE-111",
   "faction": "warlord",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "登场时：抽 1 张牌"
  },
  {
   "id": "GLD-C0170",
   "name": "范·奥卡",
   "sub": "SMILE能力者",
   "role": "百兽海贼团",
   "type": "char",
   "level": 6,
   "atk": 2550,
   "def": 2550,
   "art": "PURPLE-112",
   "faction": "beast",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "登场时：抽 1 张牌"
  },
  {
   "id": "GLD-C0171",
   "name": "福兹弗",
   "sub": "大看板",
   "role": "百兽海贼团",
   "type": "char",
   "level": 7,
   "atk": 3150,
   "def": 2450,
   "art": "PURPLE-117",
   "faction": "beast",
   "formation": "vanguard",
   "fruit": "logia",
   "rarity": "SS",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0172",
   "name": "阿布萨罗姆",
   "sub": "夜行",
   "role": "王下七武海",
   "type": "char",
   "level": 4,
   "atk": 1700,
   "def": 1700,
   "art": "PURPLE-118",
   "faction": "warlord",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 2
      }
     ]
    }
   },
   "desc": "登场时：抽 2 张牌"
  },
  {
   "id": "GLD-C0173",
   "name": "玛丽哥德",
   "sub": "王下七武海",
   "role": "王下七武海",
   "type": "char",
   "level": 5,
   "atk": 2200,
   "def": 2150,
   "art": "PURPLE-124",
   "faction": "warlord",
   "formation": "skirmish",
   "fruit": "paramecia",
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 200,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "登场时：我方全体 ATK+200（至回合结束）"
  },
  {
   "id": "GLD-C0174",
   "name": "月光·莫利亚·王下",
   "sub": "孤高之刃",
   "role": "王下七武海",
   "type": "char",
   "level": 5,
   "atk": 2200,
   "def": 2050,
   "art": "PURPLE-126",
   "faction": "warlord",
   "formation": null,
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "登场时：我方全体 ATK+100（至回合结束）"
  },
  {
   "id": "GLD-C0175",
   "name": "达鲁马",
   "sub": "狩猎者",
   "role": "百兽海贼团",
   "type": "char",
   "level": 5,
   "atk": 2250,
   "def": 2200,
   "art": "PURPLE-130",
   "faction": "beast",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "SS",
   "keywords": [
    "rush"
   ],
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0176",
   "name": "黑炭大蛇",
   "sub": "大看板",
   "role": "百兽海贼团",
   "type": "char",
   "level": 5,
   "atk": 2200,
   "def": 1950,
   "art": "PURPLE-138",
   "faction": "beast",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "攻击宣言时：我方全体 ATK+100（至回合结束）"
  },
  {
   "id": "GLD-C0177",
   "name": "塞尼奥尔·皮克",
   "sub": "傀儡师",
   "role": "王下七武海",
   "type": "char",
   "level": 6,
   "atk": 2550,
   "def": 2250,
   "art": "PURPLE-139",
   "faction": "warlord",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "登场时：抽 1 张牌"
  },
  {
   "id": "GLD-C0178",
   "name": "圣胡安·恶狼",
   "sub": "SMILE能力者",
   "role": "百兽海贼团",
   "type": "char",
   "level": 4,
   "atk": 1700,
   "def": 1700,
   "art": "PURPLE-140",
   "faction": "beast",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "登场时：抽 1 张牌"
  },
  {
   "id": "GLD-C0179",
   "name": "月光·莫利亚",
   "sub": "处刑人",
   "role": "王下七武海",
   "type": "char",
   "level": 7,
   "atk": 3200,
   "def": 2700,
   "art": "PURPLE-145",
   "faction": "warlord",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "SSS",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 200,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "登场时：我方全体 ATK+200（至回合结束）"
  },
  {
   "id": "GLD-C0180",
   "name": "斯皮德",
   "sub": "百兽军团",
   "role": "百兽海贼团",
   "type": "char",
   "level": 4,
   "atk": 1700,
   "def": 1500,
   "art": "PURPLE-147",
   "faction": "beast",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "登场时：抽 1 张牌"
  },
  {
   "id": "GLD-C0181",
   "name": "毒Q",
   "sub": "大看板",
   "role": "百兽海贼团",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2500,
   "art": "PURPLE-152",
   "faction": "beast",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "draw",
       "amount": 2
      }
     ]
    }
   },
   "desc": "攻击宣言时：抽 2 张牌"
  },
  {
   "id": "GLD-C0182",
   "name": "唐吉诃德·多弗朗明戈·王下",
   "sub": "傀儡师",
   "role": "王下七武海",
   "type": "char",
   "level": 2,
   "atk": 950,
   "def": 1100,
   "art": "PURPLE-160",
   "faction": "warlord",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": -200,
       "target": "foeAll",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "攻击宣言时：对方全体 ATK-200（至战斗结束）"
  },
  {
   "id": "GLD-C0183",
   "name": "凯多",
   "sub": "鬼岛之主",
   "role": "百兽海贼团",
   "type": "char",
   "level": 6,
   "atk": 2550,
   "def": 2200,
   "art": "PURPLE-161",
   "faction": "beast",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onDestroyed": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": -200,
       "target": "foeAll",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "被破坏时：对方全体 ATK-200（至战斗结束）"
  },
  {
   "id": "GLD-C0184",
   "name": "玛格丽特",
   "sub": "孤高之刃",
   "role": "王下七武海",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2400,
   "art": "PURPLE-164",
   "faction": "warlord",
   "formation": null,
   "fruit": "zoan",
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "登场时：抽 1 张牌"
  },
  {
   "id": "GLD-C0185",
   "name": "拉菲特",
   "sub": "狩猎者",
   "role": "百兽海贼团",
   "type": "char",
   "level": 7,
   "atk": 2900,
   "def": 2650,
   "art": "PURPLE-165",
   "faction": "beast",
   "formation": null,
   "fruit": null,
   "rarity": "SS",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": -200,
       "target": "foeAll",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "登场时：对方全体 ATK-200（至战斗结束）"
  },
  {
   "id": "GLD-C0186",
   "name": "皮卡",
   "sub": "暗流涌动",
   "role": "王下七武海",
   "type": "char",
   "level": 7,
   "atk": 3200,
   "def": 2500,
   "art": "PURPLE-177",
   "faction": "warlord",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "SSS",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onDestroyed": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "被破坏时：抽 1 张牌"
  },
  {
   "id": "GLD-C0187",
   "name": "斯潘达姆",
   "sub": "正义之师",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2700,
   "art": "PURPLE-181",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "draw",
       "amount": 2
      }
     ]
    }
   },
   "desc": "攻击宣言时：抽 2 张牌"
  },
  {
   "id": "GLD-C0188",
   "name": "艾斯",
   "sub": "火拳",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1400,
   "art": "RED-08",
   "faction": "whitebeard",
   "formation": null,
   "fruit": "logia",
   "rarity": "B",
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "self",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "攻击宣言时：自身 ATK+100（至战斗结束）"
  },
  {
   "id": "GLD-C0189",
   "name": "青椒",
   "sub": "锥龙钉钉头",
   "role": "草帽一伙",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2400,
   "art": "RED-10",
   "faction": "strawhat",
   "formation": null,
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "self",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "攻击宣言时：自身 ATK+100（至战斗结束）"
  },
  {
   "id": "GLD-C0190",
   "name": "萨卡斯基",
   "sub": "岩浆果实",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 3150,
   "def": 2700,
   "art": "RED-19",
   "faction": "navy",
   "formation": null,
   "fruit": "logia",
   "rarity": "SS",
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "self",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "攻击宣言时：自身 ATK+100（至战斗结束）"
  },
  {
   "id": "GLD-C0191",
   "name": "蒙奇·D·路飞",
   "sub": "五档·尼卡",
   "role": "草帽一伙",
   "type": "char",
   "level": 7,
   "atk": 3150,
   "def": 2700,
   "art": "RED-27",
   "faction": "strawhat",
   "formation": null,
   "fruit": "zoan",
   "rarity": "SS",
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 200,
       "target": "self",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "攻击宣言时：自身 ATK+200（至战斗结束）"
  },
  {
   "id": "GLD-C0192",
   "name": "波特卡斯·D·艾斯",
   "sub": "炎帝",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2400,
   "art": "RED-29",
   "faction": "whitebeard",
   "formation": null,
   "fruit": "logia",
   "rarity": "S",
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "self",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "攻击宣言时：自身 ATK+100（至战斗结束）"
  },
  {
   "id": "GLD-C0193",
   "name": "萨波",
   "sub": "烧烧果实继承者",
   "role": "革命军",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 2150,
   "art": "RED-33",
   "faction": "revolutionary",
   "formation": null,
   "fruit": "logia",
   "rarity": "B",
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "self",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "攻击宣言时：自身 ATK+100（至战斗结束）"
  },
  {
   "id": "GLD-C0194",
   "name": "香克斯",
   "sub": "霸王色的威压",
   "role": "四皇",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 2150,
   "art": "RED-35",
   "faction": "yonko",
   "formation": null,
   "fruit": null,
   "rarity": "B",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": -100,
       "target": "foeAll",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "登场时：对方全体 ATK-100（至战斗结束）"
  },
  {
   "id": "GLD-C0195",
   "name": "哥尔·D·罗杰",
   "sub": "海贼王",
   "role": "四皇",
   "type": "char",
   "level": 7,
   "atk": 3150,
   "def": 2450,
   "art": "RED-37",
   "faction": "yonko",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "SS",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0196",
   "name": "金狮子史基",
   "sub": "飘飘果实",
   "role": "四皇",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2400,
   "art": "RED-50",
   "faction": "yonko",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "setPosDef",
       "target": "foeStrongestAtkPos"
      }
     ]
    }
   },
   "desc": "登场时：将对方攻击表示的最强人物转为守备"
  },
  {
   "id": "GLD-C0197",
   "name": "爱德华·纽盖特",
   "sub": "震震果实",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2400,
   "art": "RED-52",
   "faction": "whitebeard",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "setPosDef",
       "target": "foeStrongestAtkPos"
      }
     ]
    }
   },
   "desc": "登场时：将对方攻击表示的最强人物转为守备"
  },
  {
   "id": "GLD-C0198",
   "name": "贝洛·贝蒂",
   "sub": "激励果实",
   "role": "草帽一伙",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1100,
   "art": "RED-58",
   "faction": "strawhat",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "B",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "登场时：我方全体 ATK+100（至回合结束）"
  },
  {
   "id": "GLD-C0199",
   "name": "卡塔库栗",
   "sub": "见闻色·未来视",
   "role": "四皇",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 2150,
   "art": "RED-63",
   "faction": "yonko",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "B",
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "self",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "攻击宣言时：自身 ATK+100（至战斗结束）"
  },
  {
   "id": "GLD-C0200",
   "name": "布拉曼克",
   "sub": "一番队长",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 3,
   "atk": 1350,
   "def": 1250,
   "art": "RED-66",
   "faction": "whitebeard",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "damage",
       "amount": 100,
       "why": "「布拉曼克」效果"
      }
     ]
    }
   },
   "desc": "登场时：给予对方 LP 100 伤害"
  },
  {
   "id": "GLD-C0201",
   "name": "泽法",
   "sub": "最恶世代",
   "role": "极恶世代",
   "type": "char",
   "level": 3,
   "atk": 1350,
   "def": 1400,
   "art": "RED-75",
   "faction": "supernova",
   "formation": "skirmish",
   "fruit": "zoan",
   "rarity": "S",
   "ability": {
    "onDestroyed": {
     "ops": [
      {
       "op": "damage",
       "amount": 200,
       "why": "「泽法」效果"
      }
     ]
    }
   },
   "desc": "被破坏时：给予对方 LP 200 伤害"
  },
  {
   "id": "GLD-C0202",
   "name": "犬岚公爵",
   "sub": "一番队长",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 4,
   "atk": 1700,
   "def": 1700,
   "art": "RED-76",
   "faction": "whitebeard",
   "formation": "skirmish",
   "fruit": "zoan",
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "damage",
       "amount": 100,
       "why": "「犬岚公爵」效果"
      }
     ]
    }
   },
   "desc": "登场时：给予对方 LP 100 伤害"
  },
  {
   "id": "GLD-C0203",
   "name": "阿健",
   "sub": "伙伴之力",
   "role": "草帽一伙",
   "type": "char",
   "level": 1,
   "atk": 600,
   "def": 700,
   "art": "RED-77",
   "faction": "strawhat",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "damage",
       "amount": 200,
       "why": "「阿健」效果"
      }
     ]
    }
   },
   "desc": "登场时：给予对方 LP 200 伤害"
  },
  {
   "id": "GLD-C0204",
   "name": "居鲁士",
   "sub": "结盟",
   "role": "极恶世代",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2400,
   "art": "RED-79",
   "faction": "supernova",
   "formation": null,
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "setPosDef",
       "target": "foeStrongestAtkPos"
      }
     ]
    }
   },
   "desc": "登场时：将对方攻击表示的最强人物转为守备"
  },
  {
   "id": "GLD-C0205",
   "name": "罗罗诺亚·索隆",
   "sub": "伙伴之力",
   "role": "草帽一伙",
   "type": "char",
   "level": 4,
   "atk": 1700,
   "def": 1550,
   "art": "RED-82",
   "faction": "strawhat",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": -200,
       "target": "foeAll",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "登场时：对方全体 ATK-200（至战斗结束）"
  },
  {
   "id": "GLD-C0206",
   "name": "帕帕古",
   "sub": "扬帆起航",
   "role": "草帽一伙",
   "type": "char",
   "level": 4,
   "atk": 1700,
   "def": 1500,
   "art": "RED-84",
   "faction": "strawhat",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "setPosDef",
       "target": "foeStrongestAtkPos"
      }
     ]
    }
   },
   "desc": "登场时：将对方攻击表示的最强人物转为守备"
  },
  {
   "id": "GLD-C0207",
   "name": "黑色玛利亚",
   "sub": "遗志",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 6,
   "atk": 2550,
   "def": 2550,
   "art": "RED-88",
   "faction": "whitebeard",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 2
      }
     ]
    }
   },
   "desc": "登场时：抽 2 张牌"
  },
  {
   "id": "GLD-C0208",
   "name": "忍",
   "sub": "赤鞘武士",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 5,
   "atk": 2200,
   "def": 2150,
   "art": "RED-94",
   "faction": "whitebeard",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onDestroyed": {
     "ops": [
      {
       "op": "damage",
       "amount": 100,
       "why": "「忍」效果"
      }
     ]
    }
   },
   "desc": "被破坏时：给予对方 LP 100 伤害"
  },
  {
   "id": "GLD-C0209",
   "name": "阿拉马基",
   "sub": "正义之师",
   "role": "海军",
   "type": "char",
   "level": 6,
   "atk": 2600,
   "def": 2500,
   "art": "RED-97",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "SS",
   "keywords": [
    "rush"
   ],
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0210",
   "name": "小玉",
   "sub": "残火",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 7,
   "atk": 3200,
   "def": 2500,
   "art": "RED-101",
   "faction": "whitebeard",
   "formation": "vanguard",
   "fruit": "zoan",
   "rarity": "SSS",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "登场时：我方全体 ATK+100（至回合结束）"
  },
  {
   "id": "GLD-C0211",
   "name": "斯库亚德",
   "sub": "残火",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 5,
   "atk": 2200,
   "def": 2150,
   "art": "RED-104",
   "faction": "whitebeard",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 200,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "登场时：我方全体 ATK+200（至回合结束）"
  },
  {
   "id": "GLD-C0212",
   "name": "尤斯塔斯·基德",
   "sub": "结盟",
   "role": "极恶世代",
   "type": "char",
   "level": 2,
   "atk": 1000,
   "def": 1000,
   "art": "RED-106",
   "faction": "supernova",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "SS",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 200,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "登场时：我方全体 ATK+200（至回合结束）"
  },
  {
   "id": "GLD-C0213",
   "name": "雷藏",
   "sub": "赤鞘武士",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 5,
   "atk": 2200,
   "def": 1900,
   "art": "RED-107",
   "faction": "whitebeard",
   "formation": "vanguard",
   "fruit": "paramecia",
   "rarity": "S",
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "draw",
       "amount": 2
      }
     ]
    }
   },
   "desc": "攻击宣言时：抽 2 张牌"
  },
  {
   "id": "GLD-C0214",
   "name": "福萨·一番队",
   "sub": "赤鞘武士",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 3,
   "atk": 1350,
   "def": 1050,
   "art": "RED-112",
   "faction": "whitebeard",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "攻击宣言时：抽 1 张牌"
  },
  {
   "id": "GLD-C0215",
   "name": "菊之丞",
   "sub": "遗志",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 5,
   "atk": 2200,
   "def": 2150,
   "art": "RED-114",
   "faction": "whitebeard",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": -200,
       "target": "foeAll",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "登场时：对方全体 ATK-200（至战斗结束）"
  },
  {
   "id": "GLD-C0216",
   "name": "缇娜",
   "sub": "执法者",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1350,
   "def": 1050,
   "art": "RED-119",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "healLP",
       "amount": 200,
       "why": "「缇娜」效果"
      }
     ]
    }
   },
   "desc": "登场时：回复自身 LP 200"
  },
  {
   "id": "GLD-C0217",
   "name": "宾兹",
   "sub": "乱世枭雄",
   "role": "极恶世代",
   "type": "char",
   "level": 1,
   "atk": 600,
   "def": 700,
   "art": "RED-126",
   "faction": "supernova",
   "formation": null,
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "damage",
       "amount": 200,
       "why": "「宾兹」效果"
      }
     ]
    }
   },
   "desc": "登场时：给予对方 LP 200 伤害"
  },
  {
   "id": "GLD-C0218",
   "name": "大和",
   "sub": "一番队长",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 7,
   "atk": 2900,
   "def": 2550,
   "art": "RED-127",
   "faction": "whitebeard",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "SS",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0219",
   "name": "尼普顿",
   "sub": "冒险王",
   "role": "草帽一伙",
   "type": "char",
   "level": 6,
   "atk": 2550,
   "def": 2450,
   "art": "RED-129",
   "faction": "strawhat",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "登场时：我方全体 ATK+100（至回合结束）"
  },
  {
   "id": "GLD-C0220",
   "name": "飞六胞",
   "sub": "家族之绊",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 7,
   "atk": 3200,
   "def": 2700,
   "art": "RED-136",
   "faction": "whitebeard",
   "formation": null,
   "fruit": null,
   "rarity": "SSS",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "deckSearch",
       "filter": {
        "faction": "whitebeard"
       }
      }
     ]
    }
   },
   "desc": "登场时：从牌组检索 1 张同阵营伙伴加入手牌"
  },
  {
   "id": "GLD-C0221",
   "name": "爱德华·纽盖特·一番队",
   "sub": "一番队长",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 7,
   "atk": 3200,
   "def": 2500,
   "art": "RED-137",
   "faction": "whitebeard",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "SSS",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "deckSearch",
       "filter": {
        "faction": "whitebeard"
       }
      }
     ]
    }
   },
   "desc": "登场时：从牌组检索 1 张同阵营伙伴加入手牌"
  },
  {
   "id": "GLD-C0222",
   "name": "布鲁克·新世界",
   "sub": "伙伴之力",
   "role": "草帽一伙",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2500,
   "art": "RED-138",
   "faction": "strawhat",
   "formation": "skirmish",
   "fruit": "zoan",
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 200,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "攻击宣言时：我方全体 ATK+200（至回合结束）"
  },
  {
   "id": "GLD-C0223",
   "name": "萨奇·一番队",
   "sub": "家族之绊",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 2,
   "atk": 950,
   "def": 1050,
   "art": "RED-144",
   "faction": "whitebeard",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onDestroyed": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "self",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "被破坏时：自身 ATK+100（至战斗结束）"
  },
  {
   "id": "GLD-C0224",
   "name": "X·德雷克·最恶世代",
   "sub": "新星",
   "role": "极恶世代",
   "type": "char",
   "level": 5,
   "atk": 2250,
   "def": 2200,
   "art": "RED-147",
   "faction": "supernova",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "SS",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0225",
   "name": "日和",
   "sub": "遗志",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 4,
   "atk": 1700,
   "def": 1700,
   "art": "RED-148",
   "faction": "whitebeard",
   "formation": "bulwark",
   "fruit": "zoan",
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onDestroyed": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "被破坏时：抽 1 张牌"
  },
  {
   "id": "GLD-C0226",
   "name": "卡库",
   "sub": "正义之师",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1350,
   "def": 1400,
   "art": "RED-149",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": "paramecia",
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 200,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "登场时：我方全体 ATK+200（至回合结束）"
  },
  {
   "id": "GLD-C0227",
   "name": "林德伯格",
   "sub": "结盟",
   "role": "极恶世代",
   "type": "char",
   "level": 7,
   "atk": 3150,
   "def": 2700,
   "art": "RED-150",
   "faction": "supernova",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "SS",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0228",
   "name": "天羽羽斩",
   "sub": "遗志",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 7,
   "atk": 3200,
   "def": 3000,
   "art": "RED-152",
   "faction": "whitebeard",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "SSS",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "登场时：抽 1 张牌"
  },
  {
   "id": "GLD-C0229",
   "name": "佩金",
   "sub": "乱世枭雄",
   "role": "极恶世代",
   "type": "char",
   "level": 5,
   "atk": 2200,
   "def": 2050,
   "art": "RED-154",
   "faction": "supernova",
   "formation": null,
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 200,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "攻击宣言时：我方全体 ATK+200（至回合结束）"
  },
  {
   "id": "GLD-C0230",
   "name": "古伊娜",
   "sub": "赤鞘武士",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 4,
   "atk": 1700,
   "def": 1900,
   "art": "RED-157",
   "faction": "whitebeard",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "healLP",
       "amount": 200,
       "why": "「古伊娜」效果"
      }
     ]
    }
   },
   "desc": "登场时：回复自身 LP 200"
  },
  {
   "id": "GLD-C0231",
   "name": "甚平",
   "sub": "草帽一伙",
   "role": "草帽一伙",
   "type": "char",
   "level": 4,
   "atk": 1700,
   "def": 1550,
   "art": "RED-160",
   "faction": "strawhat",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "healLP",
       "amount": 100,
       "why": "「甚平」效果"
      }
     ]
    }
   },
   "desc": "登场时：回复自身 LP 100"
  },
  {
   "id": "GLD-C0232",
   "name": "火烧山",
   "sub": "缉捕令",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1350,
   "def": 1250,
   "art": "RED-161",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "setPosDef",
       "target": "foeStrongestAtkPos"
      }
     ]
    }
   },
   "desc": "登场时：将对方攻击表示的最强人物转为守备"
  },
  {
   "id": "GLD-C0233",
   "name": "乌索普·新世界",
   "sub": "自由之海",
   "role": "草帽一伙",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 3050,
   "art": "RED-162",
   "faction": "strawhat",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "登场时：抽 1 张牌"
  },
  {
   "id": "GLD-C0234",
   "name": "杀手",
   "sub": "结盟",
   "role": "极恶世代",
   "type": "char",
   "level": 4,
   "atk": 1700,
   "def": 1350,
   "art": "RED-166",
   "faction": "supernova",
   "formation": "vanguard",
   "fruit": "paramecia",
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 2
      }
     ]
    }
   },
   "desc": "登场时：抽 2 张牌"
  },
  {
   "id": "GLD-C0235",
   "name": "佐佐木",
   "sub": "白胡子一族",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 3,
   "atk": 1350,
   "def": 1200,
   "art": "RED-167",
   "faction": "whitebeard",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "setPosDef",
       "target": "foeStrongestAtkPos"
      }
     ]
    }
   },
   "desc": "登场时：将对方攻击表示的最强人物转为守备"
  },
  {
   "id": "GLD-C0236",
   "name": "托尼托尼·乔巴",
   "sub": "伙伴之力",
   "role": "草帽一伙",
   "type": "char",
   "level": 5,
   "atk": 2200,
   "def": 1950,
   "art": "RED-169",
   "faction": "strawhat",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "healLP",
       "amount": 200,
       "why": "「托尼托尼·乔巴」效果"
      }
     ]
    }
   },
   "desc": "登场时：回复自身 LP 200"
  },
  {
   "id": "GLD-C0237",
   "name": "娜美",
   "sub": "冒险者",
   "role": "草帽一伙",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2500,
   "art": "RED-172",
   "faction": "strawhat",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": -100,
       "target": "foeAll",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "登场时：对方全体 ATK-100（至战斗结束）"
  },
  {
   "id": "GLD-C0238",
   "name": "阿托摩斯",
   "sub": "白胡子一族",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 5,
   "atk": 2200,
   "def": 2400,
   "art": "RED-173",
   "faction": "whitebeard",
   "formation": "bulwark",
   "fruit": "paramecia",
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": -100,
       "target": "foeAll",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "登场时：对方全体 ATK-100（至战斗结束）"
  },
  {
   "id": "GLD-C0239",
   "name": "乔兹",
   "sub": "一番队长",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 5,
   "atk": 2200,
   "def": 2150,
   "art": "RED-174",
   "faction": "whitebeard",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "setPosDef",
       "target": "foeStrongestAtkPos"
      }
     ]
    }
   },
   "desc": "攻击宣言时：将对方攻击表示的最强人物转为守备"
  },
  {
   "id": "GLD-C0240",
   "name": "卡鲁",
   "sub": "扬帆起航",
   "role": "草帽一伙",
   "type": "char",
   "level": 2,
   "atk": 950,
   "def": 1100,
   "art": "RED-175",
   "faction": "strawhat",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "登场时：抽 1 张牌"
  },
  {
   "id": "GLD-C0241",
   "name": "乙姬",
   "sub": "冒险王",
   "role": "草帽一伙",
   "type": "char",
   "level": 4,
   "atk": 1700,
   "def": 1700,
   "art": "RED-180",
   "faction": "strawhat",
   "formation": "skirmish",
   "fruit": "paramecia",
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "setPosDef",
       "target": "foeStrongestAtkPos"
      }
     ]
    }
   },
   "desc": "登场时：将对方攻击表示的最强人物转为守备"
  },
  {
   "id": "GLD-C0242",
   "name": "多弗朗明戈",
   "sub": "天夜叉",
   "role": "王下七武海",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 2150,
   "art": "YELLOW-09",
   "faction": "warlord",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "B",
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "self",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "攻击宣言时：自身 ATK+100（至战斗结束）"
  },
  {
   "id": "GLD-C0243",
   "name": "波雅·汉库珂",
   "sub": "甜甜甘风",
   "role": "王下七武海",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1400,
   "art": "YELLOW-29",
   "faction": "warlord",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "B",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "setPosDef",
       "target": "foeStrongestAtkPos"
      }
     ]
    }
   },
   "desc": "登场时：将对方攻击表示的最强人物转为守备"
  },
  {
   "id": "GLD-C0244",
   "name": "克洛克达尔",
   "sub": "沙暴",
   "role": "王下七武海",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 2150,
   "art": "YELLOW-38",
   "faction": "warlord",
   "formation": null,
   "fruit": "logia",
   "rarity": "B",
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "self",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "攻击宣言时：自身 ATK+100（至战斗结束）"
  },
  {
   "id": "GLD-C0245",
   "name": "夏洛特·玲玲",
   "sub": "魂魂果实",
   "role": "四皇",
   "type": "char",
   "level": 7,
   "atk": 3150,
   "def": 3350,
   "art": "YELLOW-41",
   "faction": "yonko",
   "formation": "bulwark",
   "fruit": "paramecia",
   "rarity": "SS",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0246",
   "name": "西尔尔克",
   "sub": "樱花庸医",
   "role": "王下七武海",
   "type": "char",
   "level": 1,
   "atk": 550,
   "def": 450,
   "art": "YELLOW-47",
   "faction": "warlord",
   "formation": null,
   "fruit": null,
   "rarity": "B",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "healLP",
       "amount": 100,
       "why": "「西尔尔克」效果"
      }
     ]
    }
   },
   "desc": "登场时：回复自身 LP 100"
  },
  {
   "id": "GLD-C0247",
   "name": "巴索罗缪·熊",
   "sub": "拍飞",
   "role": "王下七武海",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2400,
   "art": "YELLOW-49",
   "faction": "warlord",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "setPosDef",
       "target": "foeStrongestAtkPos"
      }
     ]
    }
   },
   "desc": "登场时：将对方攻击表示的最强人物转为守备"
  },
  {
   "id": "GLD-C0248",
   "name": "卡库",
   "sub": "铁律",
   "role": "海军",
   "type": "char",
   "level": 5,
   "atk": 2200,
   "def": 1850,
   "art": "YELLOW-58",
   "faction": "navy",
   "formation": null,
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onDestroyed": {
     "ops": [
      {
       "op": "damage",
       "amount": 200,
       "why": "「卡库」效果"
      }
     ]
    }
   },
   "desc": "被破坏时：给予对方 LP 200 伤害"
  },
  {
   "id": "GLD-C0249",
   "name": "哥尔·D·罗杰·四皇",
   "sub": "四皇麾下",
   "role": "四皇",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2400,
   "art": "YELLOW-59",
   "faction": "yonko",
   "formation": null,
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "damage",
       "amount": 100,
       "why": "「哥尔·D·罗杰·四皇」效果"
      }
     ]
    }
   },
   "desc": "登场时：给予对方 LP 100 伤害"
  },
  {
   "id": "GLD-C0250",
   "name": "提娜",
   "sub": "铁律",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 3150,
   "def": 2450,
   "art": "YELLOW-61",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "SS",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0251",
   "name": "Mr.2",
   "sub": "傀儡师",
   "role": "王下七武海",
   "type": "char",
   "level": 4,
   "atk": 1750,
   "def": 1550,
   "art": "YELLOW-62",
   "faction": "warlord",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "SS",
   "ability": {
    "onDestroyed": {
     "ops": [
      {
       "op": "damage",
       "amount": 200,
       "why": "「Mr.2」效果"
      }
     ]
    }
   },
   "desc": "被破坏时：给予对方 LP 200 伤害"
  },
  {
   "id": "GLD-C0252",
   "name": "达斯琪",
   "sub": "正义之师",
   "role": "海军",
   "type": "char",
   "level": 4,
   "atk": 1700,
   "def": 1550,
   "art": "YELLOW-67",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "damage",
       "amount": 200,
       "why": "「达斯琪」效果"
      }
     ]
    }
   },
   "desc": "登场时：给予对方 LP 200 伤害"
  },
  {
   "id": "GLD-C0253",
   "name": "巴基·王下",
   "sub": "孤高之刃",
   "role": "王下七武海",
   "type": "char",
   "level": 4,
   "atk": 1700,
   "def": 1700,
   "art": "YELLOW-68",
   "faction": "warlord",
   "formation": "skirmish",
   "fruit": "logia",
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": -200,
       "target": "foeAll",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "登场时：对方全体 ATK-200（至战斗结束）"
  },
  {
   "id": "GLD-C0254",
   "name": "洛克之星",
   "sub": "四皇麾下",
   "role": "四皇",
   "type": "char",
   "level": 1,
   "atk": 600,
   "def": 700,
   "art": "YELLOW-70",
   "faction": "yonko",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "healLP",
       "amount": 100,
       "why": "「洛克之星」效果"
      }
     ]
    }
   },
   "desc": "登场时：回复自身 LP 100"
  },
  {
   "id": "GLD-C0255",
   "name": "洛克之星·四皇",
   "sub": "亲卫队长",
   "role": "四皇",
   "type": "char",
   "level": 4,
   "atk": 1700,
   "def": 1700,
   "art": "YELLOW-71",
   "faction": "yonko",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "setPosDef",
       "target": "foeStrongestAtkPos"
      }
     ]
    }
   },
   "desc": "登场时：将对方攻击表示的最强人物转为守备"
  },
  {
   "id": "GLD-C0256",
   "name": "战国",
   "sub": "执法者",
   "role": "海军",
   "type": "char",
   "level": 5,
   "atk": 2200,
   "def": 2150,
   "art": "YELLOW-72",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "登场时：我方全体 ATK+100（至回合结束）"
  },
  {
   "id": "GLD-C0257",
   "name": "扎拉逢",
   "sub": "四皇麾下",
   "role": "四皇",
   "type": "char",
   "level": 3,
   "atk": 1350,
   "def": 1400,
   "art": "YELLOW-74",
   "faction": "yonko",
   "formation": "skirmish",
   "fruit": "zoan",
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "登场时：抽 1 张牌"
  },
  {
   "id": "GLD-C0258",
   "name": "洛克斯·D·吉贝克",
   "sub": "蛋糕城",
   "role": "四皇",
   "type": "char",
   "level": 7,
   "atk": 3200,
   "def": 3000,
   "art": "YELLOW-75",
   "faction": "yonko",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "SSS",
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "攻击宣言时：我方全体 ATK+100（至回合结束）"
  },
  {
   "id": "GLD-C0259",
   "name": "本·贝克曼·四皇",
   "sub": "皇族血脉",
   "role": "四皇",
   "type": "char",
   "level": 7,
   "atk": 3200,
   "def": 2800,
   "art": "YELLOW-76",
   "faction": "yonko",
   "formation": "skirmish",
   "fruit": "paramecia",
   "rarity": "SSS",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "登场时：我方全体 ATK+100（至回合结束）"
  },
  {
   "id": "GLD-C0260",
   "name": "巴雷特",
   "sub": "大海之主",
   "role": "四皇",
   "type": "char",
   "level": 5,
   "atk": 2200,
   "def": 2150,
   "art": "YELLOW-77",
   "faction": "yonko",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "healLP",
       "amount": 100,
       "why": "「巴雷特」效果"
      }
     ]
    }
   },
   "desc": "登场时：回复自身 LP 100"
  },
  {
   "id": "GLD-C0261",
   "name": "海楼石",
   "sub": "皇族血脉",
   "role": "四皇",
   "type": "char",
   "level": 2,
   "atk": 950,
   "def": 800,
   "art": "YELLOW-78",
   "faction": "yonko",
   "formation": null,
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "攻击宣言时：抽 1 张牌"
  },
  {
   "id": "GLD-C0262",
   "name": "阿拉马基·大将",
   "sub": "铁律",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 3200,
   "def": 2700,
   "art": "YELLOW-79",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "SSS",
   "ability": {
    "onDestroyed": {
     "ops": [
      {
       "op": "draw",
       "amount": 2
      }
     ]
    }
   },
   "desc": "被破坏时：抽 2 张牌"
  },
  {
   "id": "GLD-C0263",
   "name": "爱德华·威布尔·王下",
   "sub": "夜行",
   "role": "王下七武海",
   "type": "char",
   "level": 5,
   "atk": 2250,
   "def": 1950,
   "art": "YELLOW-86",
   "faction": "warlord",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "SS",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 2
      }
     ]
    }
   },
   "desc": "登场时：抽 2 张牌"
  },
  {
   "id": "GLD-C0264",
   "name": "爱德华·威布尔",
   "sub": "夜行",
   "role": "王下七武海",
   "type": "char",
   "level": 1,
   "atk": 600,
   "def": 700,
   "art": "YELLOW-87",
   "faction": "warlord",
   "formation": "bulwark",
   "fruit": "zoan",
   "rarity": "S",
   "ability": {
    "onDestroyed": {
     "ops": [
      {
       "op": "damage",
       "amount": 200,
       "why": "「爱德华·威布尔」效果"
      }
     ]
    }
   },
   "desc": "被破坏时：给予对方 LP 200 伤害"
  },
  {
   "id": "GLD-C0265",
   "name": "强纳森",
   "sub": "正义之师",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1350,
   "def": 1050,
   "art": "YELLOW-89",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "登场时：抽 1 张牌"
  },
  {
   "id": "GLD-C0266",
   "name": "库赞·大将",
   "sub": "海军将校",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1350,
   "def": 1400,
   "art": "YELLOW-91",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "healLP",
       "amount": 200,
       "why": "「库赞·大将」效果"
      }
     ]
    }
   },
   "desc": "攻击宣言时：回复自身 LP 200"
  },
  {
   "id": "GLD-C0267",
   "name": "斯摩格·大将",
   "sub": "执法者",
   "role": "海军",
   "type": "char",
   "level": 2,
   "atk": 950,
   "def": 750,
   "art": "YELLOW-94",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 200,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "登场时：我方全体 ATK+200（至回合结束）"
  },
  {
   "id": "GLD-C0268",
   "name": "库赞",
   "sub": "执法者",
   "role": "海军",
   "type": "char",
   "level": 6,
   "atk": 2550,
   "def": 2000,
   "art": "YELLOW-111",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 200,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "登场时：我方全体 ATK+200（至回合结束）"
  },
  {
   "id": "GLD-C0269",
   "name": "波尔萨利诺",
   "sub": "海军将校",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1350,
   "def": 1250,
   "art": "YELLOW-113",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "damage",
       "amount": 200,
       "why": "「波尔萨利诺」效果"
      }
     ]
    }
   },
   "desc": "登场时：给予对方 LP 200 伤害"
  },
  {
   "id": "GLD-C0270",
   "name": "波雅·汉库珂·王下",
   "sub": "处刑人",
   "role": "王下七武海",
   "type": "char",
   "level": 6,
   "atk": 2550,
   "def": 2250,
   "art": "YELLOW-115",
   "faction": "warlord",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "登场时：我方全体 ATK+100（至回合结束）"
  },
  {
   "id": "GLD-C0271",
   "name": "夏奇",
   "sub": "大海之主",
   "role": "四皇",
   "type": "char",
   "level": 4,
   "atk": 1700,
   "def": 1550,
   "art": "YELLOW-117",
   "faction": "yonko",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 2
      }
     ]
    }
   },
   "desc": "登场时：抽 2 张牌"
  },
  {
   "id": "GLD-C0272",
   "name": "香克斯",
   "sub": "四皇麾下",
   "role": "四皇",
   "type": "char",
   "level": 6,
   "atk": 2550,
   "def": 2000,
   "art": "YELLOW-120",
   "faction": "yonko",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "登场时：抽 1 张牌"
  },
  {
   "id": "GLD-C0273",
   "name": "本·贝克曼",
   "sub": "蛋糕城",
   "role": "四皇",
   "type": "char",
   "level": 4,
   "atk": 1700,
   "def": 1700,
   "art": "YELLOW-122",
   "faction": "yonko",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onDestroyed": {
     "ops": [
      {
       "op": "healLP",
       "amount": 200,
       "why": "「本·贝克曼」效果"
      }
     ]
    }
   },
   "desc": "被破坏时：回复自身 LP 200"
  },
  {
   "id": "GLD-C0274",
   "name": "布鲁诺",
   "sub": "正义之师",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 3200,
   "def": 2500,
   "art": "YELLOW-123",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": "paramecia",
   "rarity": "SSS",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "攻击宣言时：我方全体 ATK+100（至回合结束）"
  },
  {
   "id": "GLD-C0275",
   "name": "乔拉可尔·米霍克·王下",
   "sub": "王下七武海",
   "role": "王下七武海",
   "type": "char",
   "level": 7,
   "atk": 3200,
   "def": 2800,
   "art": "YELLOW-125",
   "faction": "warlord",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "SSS",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "登场时：抽 1 张牌"
  },
  {
   "id": "GLD-C0276",
   "name": "Miss黄金周",
   "sub": "王下七武海",
   "role": "王下七武海",
   "type": "char",
   "level": 2,
   "atk": 950,
   "def": 1000,
   "art": "YELLOW-128",
   "faction": "warlord",
   "formation": null,
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "damage",
       "amount": 100,
       "why": "「Miss黄金周」效果"
      }
     ]
    }
   },
   "desc": "攻击宣言时：给予对方 LP 100 伤害"
  },
  {
   "id": "GLD-C0277",
   "name": "拉基·路",
   "sub": "蛋糕城",
   "role": "四皇",
   "type": "char",
   "level": 6,
   "atk": 2600,
   "def": 2300,
   "art": "YELLOW-131",
   "faction": "yonko",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "SS",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "deckSearch",
       "filter": {
        "faction": "yonko"
       }
      }
     ]
    }
   },
   "desc": "登场时：从牌组检索 1 张同阵营伙伴加入手牌"
  },
  {
   "id": "GLD-C0278",
   "name": "鬼蜘蛛",
   "sub": "铁律",
   "role": "海军",
   "type": "char",
   "level": 6,
   "atk": 2550,
   "def": 2000,
   "art": "YELLOW-134",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": "paramecia",
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "setPosDef",
       "target": "foeStrongestAtkPos"
      }
     ]
    }
   },
   "desc": "攻击宣言时：将对方攻击表示的最强人物转为守备"
  },
  {
   "id": "GLD-C0279",
   "name": "贝鲁梅特尔",
   "sub": "巡逻舰队",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 3200,
   "def": 2800,
   "art": "YELLOW-135",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": "logia",
   "rarity": "SSS",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "setPosDef",
       "target": "foeStrongestAtkPos"
      }
     ]
    }
   },
   "desc": "登场时：将对方攻击表示的最强人物转为守备"
  },
  {
   "id": "GLD-C0280",
   "name": "Mr.1",
   "sub": "孤高之刃",
   "role": "王下七武海",
   "type": "char",
   "level": 6,
   "atk": 2550,
   "def": 2550,
   "art": "YELLOW-138",
   "faction": "warlord",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "攻击宣言时：抽 1 张牌"
  },
  {
   "id": "GLD-C0281",
   "name": "拉基·路·四皇",
   "sub": "皇族血脉",
   "role": "四皇",
   "type": "char",
   "level": 7,
   "atk": 2900,
   "def": 2900,
   "art": "YELLOW-141",
   "faction": "yonko",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "SS",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": -100,
       "target": "foeAll",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "攻击宣言时：对方全体 ATK-100（至战斗结束）"
  },
  {
   "id": "GLD-C0282",
   "name": "塔马戈",
   "sub": "蛋糕城",
   "role": "四皇",
   "type": "char",
   "level": 7,
   "atk": 3200,
   "def": 2800,
   "art": "YELLOW-144",
   "faction": "yonko",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "SSS",
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "deckSearch",
       "filter": {
        "faction": "yonko"
       }
      }
     ]
    }
   },
   "desc": "攻击宣言时：从牌组检索 1 张同阵营伙伴加入手牌"
  },
  {
   "id": "GLD-C0283",
   "name": "Miss双手指",
   "sub": "处刑人",
   "role": "王下七武海",
   "type": "char",
   "level": 5,
   "atk": 2200,
   "def": 1950,
   "art": "YELLOW-147",
   "faction": "warlord",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "deckSearch",
       "filter": {
        "faction": "warlord"
       }
      }
     ]
    }
   },
   "desc": "登场时：从牌组检索 1 张同阵营伙伴加入手牌"
  },
  {
   "id": "GLD-C0284",
   "name": "孔美奥",
   "sub": "铁律",
   "role": "海军",
   "type": "char",
   "level": 5,
   "atk": 2200,
   "def": 2050,
   "art": "YELLOW-149",
   "faction": "navy",
   "formation": null,
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "setPosDef",
       "target": "foeStrongestAtkPos"
      }
     ]
    }
   },
   "desc": "登场时：将对方攻击表示的最强人物转为守备"
  },
  {
   "id": "GLD-C0285",
   "name": "卡塔库栗",
   "sub": "皇族血脉",
   "role": "四皇",
   "type": "char",
   "level": 2,
   "atk": 950,
   "def": 950,
   "art": "YELLOW-155",
   "faction": "yonko",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onDestroyed": {
     "ops": [
      {
       "op": "healLP",
       "amount": 200,
       "why": "「卡塔库栗」效果"
      }
     ]
    }
   },
   "desc": "被破坏时：回复自身 LP 200"
  },
  {
   "id": "GLD-C0286",
   "name": "缇娜",
   "sub": "缉捕令",
   "role": "海军",
   "type": "char",
   "level": 2,
   "atk": 950,
   "def": 850,
   "art": "YELLOW-156",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "healLP",
       "amount": 200,
       "why": "「缇娜」效果"
      }
     ]
    }
   },
   "desc": "登场时：回复自身 LP 200"
  },
  {
   "id": "GLD-C0287",
   "name": "佩罗斯佩罗",
   "sub": "破竹之势",
   "role": "四皇",
   "type": "char",
   "level": 3,
   "atk": 1350,
   "def": 1050,
   "art": "YELLOW-157",
   "faction": "yonko",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "攻击宣言时：抽 1 张牌"
  },
  {
   "id": "GLD-C0288",
   "name": "萨卡斯基·大将",
   "sub": "正义之师",
   "role": "海军",
   "type": "char",
   "level": 4,
   "atk": 1700,
   "def": 1700,
   "art": "YELLOW-158",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": 100,
       "target": "allyAll",
       "until": "turn"
      }
     ]
    }
   },
   "desc": "登场时：我方全体 ATK+100（至回合结束）"
  },
  {
   "id": "GLD-C0289",
   "name": "文斯莫克·伽治",
   "sub": "四皇麾下",
   "role": "四皇",
   "type": "char",
   "level": 7,
   "atk": 3200,
   "def": 2800,
   "art": "YELLOW-163",
   "faction": "yonko",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "SSS",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "draw",
       "amount": 1
      }
     ]
    }
   },
   "desc": "登场时：抽 1 张牌"
  },
  {
   "id": "GLD-C0290",
   "name": "Mr.5",
   "sub": "处刑人",
   "role": "王下七武海",
   "type": "char",
   "level": 7,
   "atk": 3200,
   "def": 2500,
   "art": "YELLOW-165",
   "faction": "warlord",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "SSS",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "setPosDef",
       "target": "foeStrongestAtkPos"
      }
     ]
    }
   },
   "desc": "登场时：将对方攻击表示的最强人物转为守备"
  },
  {
   "id": "GLD-C0291",
   "name": "阿拉马基",
   "sub": "正义之师",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1350,
   "def": 1200,
   "art": "YELLOW-168",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "draw",
       "amount": 2
      }
     ]
    }
   },
   "desc": "攻击宣言时：抽 2 张牌"
  },
  {
   "id": "GLD-C0292",
   "name": "哥尔·D·罗杰",
   "sub": "亲卫队长",
   "role": "四皇",
   "type": "char",
   "level": 5,
   "atk": 2200,
   "def": 2150,
   "art": "YELLOW-173",
   "faction": "yonko",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "atkDelta",
       "amount": -100,
       "target": "foeAll",
       "until": "battle"
      }
     ]
    }
   },
   "desc": "登场时：对方全体 ATK-100（至战斗结束）"
  },
  {
   "id": "GLD-C0293",
   "name": "道格拉斯",
   "sub": "破竹之势",
   "role": "四皇",
   "type": "char",
   "level": 3,
   "atk": 1350,
   "def": 1200,
   "art": "YELLOW-175",
   "faction": "yonko",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "ability": {
    "onSummon": {
     "ops": [
      {
       "op": "healLP",
       "amount": 100,
       "why": "「道格拉斯」效果"
      }
     ]
    }
   },
   "desc": "登场时：回复自身 LP 100"
  },
  {
   "id": "GLD-C0294",
   "name": "耶稣布",
   "sub": "四皇麾下",
   "role": "四皇",
   "type": "char",
   "level": 3,
   "atk": 1350,
   "def": 1250,
   "art": "YELLOW-177",
   "faction": "yonko",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "S",
   "ability": {
    "onAttackDecl": {
     "ops": [
      {
       "op": "healLP",
       "amount": 100,
       "why": "「耶稣布」效果"
      }
     ]
    }
   },
   "desc": "攻击宣言时：回复自身 LP 100"
  },
  {
   "id": "GLD-C0295",
   "name": "毒Q",
   "sub": "死神",
   "role": "百兽海贼团",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 700,
   "art": "BLACK-01",
   "faction": "beast",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0296",
   "name": "拉菲特",
   "sub": "五号船船长",
   "role": "百兽海贼团",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1050,
   "art": "BLACK-02",
   "faction": "beast",
   "formation": null,
   "fruit": "zoan",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0297",
   "name": "卡特琳娜·蝶美",
   "sub": "月牙猎人",
   "role": "百兽海贼团",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 2700,
   "art": "BLACK-07",
   "faction": "beast",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0298",
   "name": "雨之希留",
   "sub": "雨",
   "role": "百兽海贼团",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 1950,
   "art": "BLACK-08",
   "faction": "beast",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0299",
   "name": "汉尼拔",
   "sub": "因佩尔副署长",
   "role": "海军",
   "type": "char",
   "level": 5,
   "atk": 2150,
   "def": 2350,
   "art": "BLACK-12",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0300",
   "name": "小萨蒂",
   "sub": "地狱看守长",
   "role": "海军",
   "type": "char",
   "level": 4,
   "atk": 2100,
   "def": 1800,
   "art": "BLACK-15",
   "faction": "navy",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0301",
   "name": "本·贝克曼",
   "sub": "红发副船长",
   "role": "四皇",
   "type": "char",
   "level": 5,
   "atk": 2450,
   "def": 2100,
   "art": "BLACK-16",
   "faction": "yonko",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0302",
   "name": "拉基·路",
   "sub": "红发干部",
   "role": "四皇",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1050,
   "art": "BLACK-18",
   "faction": "yonko",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0303",
   "name": "钢骨·空",
   "sub": "海军元帅",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 3100,
   "def": 2650,
   "art": "BLACK-19",
   "faction": "navy",
   "formation": null,
   "fruit": null,
   "rarity": "S",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0304",
   "name": "鬼蜘蛛",
   "sub": "海军中将",
   "role": "海军",
   "type": "char",
   "level": 5,
   "atk": 2450,
   "def": 2100,
   "art": "BLACK-20",
   "faction": "navy",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0305",
   "name": "鼯鼠",
   "sub": "海军中将",
   "role": "海军",
   "type": "char",
   "level": 4,
   "atk": 2100,
   "def": 1800,
   "art": "BLACK-21",
   "faction": "navy",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0306",
   "name": "火烧山",
   "sub": "海军中将",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1350,
   "art": "BLACK-22",
   "faction": "navy",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0307",
   "name": "范德戴肯",
   "sub": "靶靶果实",
   "role": "百兽海贼团",
   "type": "char",
   "level": 5,
   "atk": 2450,
   "def": 2100,
   "art": "BLACK-23",
   "faction": "beast",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0308",
   "name": "麦哲伦",
   "sub": "毒龙·地狱审判",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2200,
   "art": "BLACK-31",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": "paramecia",
   "rarity": "S",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0309",
   "name": "范·奥卡",
   "sub": "音速弹",
   "role": "百兽海贼团",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1050,
   "art": "BLACK-36",
   "faction": "beast",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0310",
   "name": "巴加斯",
   "sub": "格斗冠军",
   "role": "百兽海贼团",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1050,
   "art": "BLACK-40",
   "faction": "beast",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0311",
   "name": "阿巴罗·比萨罗",
   "sub": "晴岚之王",
   "role": "百兽海贼团",
   "type": "char",
   "level": 4,
   "atk": 2100,
   "def": 1800,
   "art": "BLACK-41",
   "faction": "beast",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0312",
   "name": "圣胡安·恶狼",
   "sub": "黑团巨舰",
   "role": "百兽海贼团",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 2700,
   "art": "BLACK-45",
   "faction": "beast",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0313",
   "name": "布鲁诺",
   "sub": "空气门",
   "role": "海军",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1850,
   "art": "BLACK-50",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": "paramecia",
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0314",
   "name": "达兹·波涅斯",
   "sub": "刀刃人",
   "role": "王下七武海",
   "type": "char",
   "level": 5,
   "atk": 2450,
   "def": 2100,
   "art": "BLACK-51",
   "faction": "warlord",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0315",
   "name": "贝比5",
   "sub": "武器果实",
   "role": "王下七武海",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1350,
   "art": "BLACK-52",
   "faction": "warlord",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0316",
   "name": "黑炭大蛇",
   "sub": "八岐大蛇",
   "role": "百兽海贼团",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 2700,
   "art": "BLACK-54",
   "faction": "beast",
   "formation": "bulwark",
   "fruit": "zoan",
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0317",
   "name": "洛克斯·D·吉贝克",
   "sub": "神之谷对决",
   "role": "四皇",
   "type": "char",
   "level": 6,
   "atk": 2750,
   "def": 2350,
   "art": "BLACK-57",
   "faction": "yonko",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0318",
   "name": "多米诺",
   "sub": "监视之眼",
   "role": "海军",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 700,
   "art": "BLACK-60",
   "faction": "navy",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0319",
   "name": "斧手蒙卡",
   "sub": "东海上校",
   "role": "海军",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 700,
   "art": "BLACK-61",
   "faction": "navy",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0320",
   "name": "Mr.4",
   "sub": "四号特工",
   "role": "王下七武海",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1350,
   "art": "BLACK-62",
   "faction": "warlord",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0321",
   "name": "Miss圣诞快乐",
   "sub": "巴洛克工作社",
   "role": "王下七武海",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1050,
   "art": "BLACK-63",
   "faction": "warlord",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0322",
   "name": "Miss双手指",
   "sub": "荆棘果实",
   "role": "王下七武海",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1350,
   "art": "BLACK-64",
   "faction": "warlord",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0323",
   "name": "达斯琪",
   "sub": "执法者",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1350,
   "art": "BLACK-67",
   "faction": "navy",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0324",
   "name": "强纳森",
   "sub": "正义之师",
   "role": "海军",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1100,
   "art": "BLACK-70",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0325",
   "name": "斯潘达姆",
   "sub": "缉捕令",
   "role": "海军",
   "type": "char",
   "level": 1,
   "atk": 550,
   "def": 650,
   "art": "BLACK-71",
   "faction": "navy",
   "formation": null,
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0326",
   "name": "哈雷达斯",
   "sub": "疾风",
   "role": "革命军",
   "type": "char",
   "level": 5,
   "atk": 2150,
   "def": 2050,
   "art": "BLACK-74",
   "faction": "revolutionary",
   "formation": null,
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0327",
   "name": "小八",
   "sub": "革命军干部",
   "role": "革命军",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1600,
   "art": "BLACK-77",
   "faction": "revolutionary",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0328",
   "name": "阿托摩斯",
   "sub": "家族之绊",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1300,
   "art": "BLACK-81",
   "faction": "whitebeard",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0329",
   "name": "贝鲁梅伯",
   "sub": "铁律",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1250,
   "art": "BLACK-83",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0330",
   "name": "布拉曼克",
   "sub": "遗志",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1600,
   "art": "BLACK-85",
   "faction": "whitebeard",
   "formation": null,
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0331",
   "name": "蒙奇·D·卡普·大将",
   "sub": "铁律",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1600,
   "art": "BLACK-87",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": "logia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0332",
   "name": "卡莉法",
   "sub": "执法者",
   "role": "海军",
   "type": "char",
   "level": 5,
   "atk": 2450,
   "def": 2450,
   "art": "BLACK-89",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0333",
   "name": "卡库",
   "sub": "海军将校",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1150,
   "art": "BLACK-91",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0334",
   "name": "萨卡斯基",
   "sub": "巡逻舰队",
   "role": "海军",
   "type": "char",
   "level": 4,
   "atk": 2100,
   "def": 2100,
   "art": "BLACK-95",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0335",
   "name": "菊之丞",
   "sub": "残火",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 5,
   "atk": 2450,
   "def": 2450,
   "art": "BLACK-96",
   "faction": "whitebeard",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0336",
   "name": "纳尔逊",
   "sub": "海军将校",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1600,
   "art": "BLACK-97",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0337",
   "name": "库赞·大将",
   "sub": "缉捕令",
   "role": "海军",
   "type": "char",
   "level": 1,
   "atk": 550,
   "def": 500,
   "art": "BLACK-98",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0338",
   "name": "路奇",
   "sub": "正义之师",
   "role": "海军",
   "type": "char",
   "level": 5,
   "atk": 2150,
   "def": 2350,
   "art": "BLACK-99",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0339",
   "name": "贝鲁梅特尔",
   "sub": "巡逻舰队",
   "role": "海军",
   "type": "char",
   "level": 1,
   "atk": 550,
   "def": 650,
   "art": "BLACK-103",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0340",
   "name": "安布里奥·伊万科夫·革命军",
   "sub": "疾风",
   "role": "革命军",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 2500,
   "art": "BLACK-108",
   "faction": "revolutionary",
   "formation": "bulwark",
   "fruit": "paramecia",
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0341",
   "name": "波特卡斯·D·艾斯",
   "sub": "残火",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 5,
   "atk": 2150,
   "def": 2150,
   "art": "BLACK-109",
   "faction": "whitebeard",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0342",
   "name": "天羽羽斩",
   "sub": "赤鞘武士",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1150,
   "art": "BLACK-111",
   "faction": "whitebeard",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0343",
   "name": "霜月康家",
   "sub": "白胡子一族",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1000,
   "art": "BLACK-112",
   "faction": "whitebeard",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0344",
   "name": "小玉",
   "sub": "家族之绊",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1150,
   "art": "BLACK-117",
   "faction": "whitebeard",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0345",
   "name": "一笑·大将",
   "sub": "执法者",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 3100,
   "def": 3100,
   "art": "BLACK-119",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "S",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0346",
   "name": "奎因",
   "sub": "狩猎者",
   "role": "百兽海贼团",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1500,
   "art": "BLACK-121",
   "faction": "beast",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0347",
   "name": "萨博",
   "sub": "解放战线",
   "role": "革命军",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 2200,
   "art": "BLACK-123",
   "faction": "revolutionary",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0348",
   "name": "金",
   "sub": "SMILE能力者",
   "role": "百兽海贼团",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 2500,
   "art": "BLACK-124",
   "faction": "beast",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0349",
   "name": "加布拉",
   "sub": "执法者",
   "role": "海军",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1250,
   "art": "BLACK-126",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": "zoan",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0350",
   "name": "一笑",
   "sub": "缉捕令",
   "role": "海军",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1650,
   "art": "BLACK-127",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0351",
   "name": "杰克",
   "sub": "遗志",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1850,
   "art": "BLACK-130",
   "faction": "whitebeard",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0352",
   "name": "闪电·革命军",
   "sub": "革命军干部",
   "role": "革命军",
   "type": "char",
   "level": 5,
   "atk": 2150,
   "def": 1900,
   "art": "BLACK-131",
   "faction": "revolutionary",
   "formation": "skirmish",
   "fruit": "paramecia",
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0353",
   "name": "克尔拉",
   "sub": "风之军",
   "role": "革命军",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1850,
   "art": "BLACK-137",
   "faction": "revolutionary",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0354",
   "name": "乔兹",
   "sub": "赤鞘武士",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1650,
   "art": "BLACK-138",
   "faction": "whitebeard",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0355",
   "name": "斯库亚德",
   "sub": "家族之绊",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 2,
   "atk": 900,
   "def": 800,
   "art": "BLACK-140",
   "faction": "whitebeard",
   "formation": "skirmish",
   "fruit": "logia",
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0356",
   "name": "卡拉斯",
   "sub": "解放战线",
   "role": "革命军",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 2200,
   "art": "BLACK-141",
   "faction": "revolutionary",
   "formation": "skirmish",
   "fruit": "logia",
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0357",
   "name": "阿拉马基·大将",
   "sub": "铁律",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2500,
   "art": "BLACK-142",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0358",
   "name": "佩吉万",
   "sub": "百兽军团",
   "role": "百兽海贼团",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1350,
   "art": "BLACK-143",
   "faction": "beast",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0359",
   "name": "霍迪·琼斯",
   "sub": "百兽军团",
   "role": "百兽海贼团",
   "type": "char",
   "level": 5,
   "atk": 2450,
   "def": 2450,
   "art": "BLACK-144",
   "faction": "beast",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0360",
   "name": "夏姆洛克",
   "sub": "疾风",
   "role": "革命军",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 2200,
   "art": "BLACK-145",
   "faction": "revolutionary",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0361",
   "name": "猛犸",
   "sub": "狩猎者",
   "role": "百兽海贼团",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 3050,
   "art": "BLACK-147",
   "faction": "beast",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "S",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0362",
   "name": "莫莉",
   "sub": "解放战线",
   "role": "革命军",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1300,
   "art": "BLACK-150",
   "faction": "revolutionary",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0363",
   "name": "达鲁马",
   "sub": "鬼岛之主",
   "role": "百兽海贼团",
   "type": "char",
   "level": 1,
   "atk": 550,
   "def": 450,
   "art": "BLACK-153",
   "faction": "beast",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0364",
   "name": "犬岚公爵",
   "sub": "赤鞘武士",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1500,
   "art": "BLACK-155",
   "faction": "whitebeard",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0365",
   "name": "卡拉斯·革命军",
   "sub": "革命军干部",
   "role": "革命军",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1650,
   "art": "BLACK-159",
   "faction": "revolutionary",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0366",
   "name": "鹤·大将",
   "sub": "执法者",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 3100,
   "def": 2750,
   "art": "BLACK-160",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0367",
   "name": "库赞",
   "sub": "缉捕令",
   "role": "海军",
   "type": "char",
   "level": 5,
   "atk": 2150,
   "def": 2100,
   "art": "BLACK-162",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0368",
   "name": "爱德华·纽盖特",
   "sub": "遗志",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2400,
   "art": "BLACK-163",
   "faction": "whitebeard",
   "formation": null,
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0369",
   "name": "巴斯提雍",
   "sub": "海军将校",
   "role": "海军",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1650,
   "art": "BLACK-164",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": "logia",
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0370",
   "name": "林德伯格",
   "sub": "疾风",
   "role": "革命军",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1350,
   "art": "BLACK-165",
   "faction": "revolutionary",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0371",
   "name": "达斯琪·大将",
   "sub": "缉捕令",
   "role": "海军",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 2700,
   "art": "BLACK-166",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0372",
   "name": "蒙奇·D·卡普",
   "sub": "执法者",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1300,
   "art": "BLACK-167",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0373",
   "name": "闪电",
   "sub": "疾风",
   "role": "革命军",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1400,
   "art": "BLACK-170",
   "faction": "revolutionary",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0374",
   "name": "萨卡斯基·大将",
   "sub": "缉捕令",
   "role": "海军",
   "type": "char",
   "level": 4,
   "atk": 2100,
   "def": 1850,
   "art": "BLACK-171",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0375",
   "name": "哈库",
   "sub": "革命军干部",
   "role": "革命军",
   "type": "char",
   "level": 2,
   "atk": 900,
   "def": 800,
   "art": "BLACK-172",
   "faction": "revolutionary",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0376",
   "name": "传次郎",
   "sub": "遗志",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 1,
   "atk": 550,
   "def": 650,
   "art": "BLACK-174",
   "faction": "whitebeard",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0377",
   "name": "腕龙",
   "sub": "大看板",
   "role": "百兽海贼团",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1200,
   "art": "BLACK-176",
   "faction": "beast",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0378",
   "name": "蒙奇·D·龙·革命军",
   "sub": "隐密行动",
   "role": "革命军",
   "type": "char",
   "level": 1,
   "atk": 550,
   "def": 650,
   "art": "BLACK-177",
   "faction": "revolutionary",
   "formation": null,
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0379",
   "name": "克隆",
   "sub": "鬼岛之主",
   "role": "百兽海贼团",
   "type": "char",
   "level": 2,
   "atk": 900,
   "def": 800,
   "art": "BLACK-178",
   "faction": "beast",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0380",
   "name": "波尔萨利诺",
   "sub": "正义之师",
   "role": "海军",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1050,
   "art": "BLACK-179",
   "faction": "navy",
   "formation": null,
   "fruit": "logia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0381",
   "name": "孔美奥",
   "sub": "执法者",
   "role": "海军",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 650,
   "art": "BLACK-182",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0382",
   "name": "巴巴努基",
   "sub": "真打",
   "role": "百兽海贼团",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1600,
   "art": "BLACK-183",
   "faction": "beast",
   "formation": "bulwark",
   "fruit": "zoan",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0383",
   "name": "东塔克斯三世",
   "sub": "疾风",
   "role": "革命军",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1050,
   "art": "BLACK-191",
   "faction": "revolutionary",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0384",
   "name": "鹤",
   "sub": "缉捕令",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 3100,
   "def": 2650,
   "art": "BLACK-192",
   "faction": "navy",
   "formation": null,
   "fruit": null,
   "rarity": "S",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0385",
   "name": "斯摩格·大将",
   "sub": "海军将校",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1600,
   "art": "BLACK-193",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": "zoan",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0386",
   "name": "哈库",
   "sub": "鱼人空手道",
   "role": "草帽一伙",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 700,
   "art": "BLUE-01",
   "faction": "strawhat",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0387",
   "name": "达斯琪",
   "sub": "海军上校",
   "role": "海军",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 700,
   "art": "BLUE-02",
   "faction": "navy",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0388",
   "name": "佩德罗",
   "sub": "骑士团团长",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1050,
   "art": "BLUE-03",
   "faction": "whitebeard",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0389",
   "name": "猫蝮蛇",
   "sub": "摩科莫公国",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1350,
   "art": "BLUE-05",
   "faction": "whitebeard",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0390",
   "name": "犬岚公爵",
   "sub": "摩科莫公国",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1350,
   "art": "BLUE-06",
   "faction": "whitebeard",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0391",
   "name": "甚平",
   "sub": "海侠",
   "role": "草帽一伙",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 2700,
   "art": "BLUE-09",
   "faction": "strawhat",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0392",
   "name": "卡普",
   "sub": "海军英雄",
   "role": "海军",
   "type": "char",
   "level": 5,
   "atk": 2450,
   "def": 2100,
   "art": "BLUE-11",
   "faction": "navy",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0393",
   "name": "白星",
   "sub": "鱼人岛公主",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1350,
   "art": "BLUE-13",
   "faction": "navy",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0394",
   "name": "尼普顿",
   "sub": "龙宫王",
   "role": "海军",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 2700,
   "art": "BLUE-14",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0395",
   "name": "巴利",
   "sub": "卡雷拉一号船坞",
   "role": "海军",
   "type": "char",
   "level": 4,
   "atk": 2100,
   "def": 1800,
   "art": "BLUE-15",
   "faction": "navy",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0396",
   "name": "斯潘达姆",
   "sub": "CP9 长官",
   "role": "海军",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 700,
   "art": "BLUE-16",
   "faction": "navy",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0397",
   "name": "加布拉",
   "sub": "狗狗果实·狼",
   "role": "海军",
   "type": "char",
   "level": 5,
   "atk": 2450,
   "def": 2100,
   "art": "BLUE-17",
   "faction": "navy",
   "formation": null,
   "fruit": "zoan",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0398",
   "name": "卡库",
   "sub": "牛牛果实·长颈鹿",
   "role": "海军",
   "type": "char",
   "level": 6,
   "atk": 2750,
   "def": 2350,
   "art": "BLUE-18",
   "faction": "navy",
   "formation": null,
   "fruit": "zoan",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0399",
   "name": "卡莉法",
   "sub": "CP9 唯一女性",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1350,
   "art": "BLUE-21",
   "faction": "navy",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0400",
   "name": "赫尔梅普",
   "sub": "海军上校之子",
   "role": "海军",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1050,
   "art": "BLUE-22",
   "faction": "navy",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0401",
   "name": "赞高",
   "sub": "催眠果实",
   "role": "海军",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 700,
   "art": "BLUE-23",
   "faction": "navy",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0402",
   "name": "冰山",
   "sub": "水之都市长",
   "role": "海军",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1050,
   "art": "BLUE-47",
   "faction": "navy",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0403",
   "name": "顿·克利克",
   "sub": "无敌舰队",
   "role": "海军",
   "type": "char",
   "level": 4,
   "atk": 2100,
   "def": 1800,
   "art": "BLUE-48",
   "faction": "navy",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0404",
   "name": "阿金",
   "sub": "鬼人",
   "role": "海军",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1050,
   "art": "BLUE-49",
   "faction": "navy",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0405",
   "name": "寇布拉",
   "sub": "阿拉巴斯坦国王",
   "role": "海军",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1050,
   "art": "BLUE-61",
   "faction": "navy",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0406",
   "name": "伊卡莱姆",
   "sub": "侍卫队长",
   "role": "海军",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 700,
   "art": "BLUE-62",
   "faction": "navy",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0407",
   "name": "砂糖",
   "sub": "王下七武海",
   "role": "王下七武海",
   "type": "char",
   "level": 5,
   "atk": 2150,
   "def": 2350,
   "art": "BLUE-66",
   "faction": "warlord",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0408",
   "name": "卡拉斯·革命军",
   "sub": "疾风",
   "role": "革命军",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 2150,
   "art": "BLUE-72",
   "faction": "revolutionary",
   "formation": "vanguard",
   "fruit": "paramecia",
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0409",
   "name": "莫奈",
   "sub": "孤高之刃",
   "role": "王下七武海",
   "type": "char",
   "level": 7,
   "atk": 3100,
   "def": 2750,
   "art": "BLUE-77",
   "faction": "warlord",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0410",
   "name": "东塔克斯三世",
   "sub": "风之军",
   "role": "革命军",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1600,
   "art": "BLUE-78",
   "faction": "revolutionary",
   "formation": "bulwark",
   "fruit": "logia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0411",
   "name": "贝比5",
   "sub": "孤高之刃",
   "role": "王下七武海",
   "type": "char",
   "level": 4,
   "atk": 2100,
   "def": 1800,
   "art": "BLUE-81",
   "faction": "warlord",
   "formation": null,
   "fruit": "zoan",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0412",
   "name": "安布里奥·伊万科夫",
   "sub": "风之军",
   "role": "革命军",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1500,
   "art": "BLUE-85",
   "faction": "revolutionary",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0413",
   "name": "萨博·革命军",
   "sub": "起义者",
   "role": "革命军",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1400,
   "art": "BLUE-86",
   "faction": "revolutionary",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0414",
   "name": "贝洛·贝蒂·革命军",
   "sub": "疾风",
   "role": "革命军",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1300,
   "art": "BLUE-87",
   "faction": "revolutionary",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0415",
   "name": "卡拉斯",
   "sub": "疾风",
   "role": "革命军",
   "type": "char",
   "level": 5,
   "atk": 2450,
   "def": 1900,
   "art": "BLUE-88",
   "faction": "revolutionary",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0416",
   "name": "Mr.1",
   "sub": "孤高之刃",
   "role": "王下七武海",
   "type": "char",
   "level": 2,
   "atk": 900,
   "def": 900,
   "art": "BLUE-92",
   "faction": "warlord",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0417",
   "name": "爱德华·威布尔",
   "sub": "王下七武海",
   "role": "王下七武海",
   "type": "char",
   "level": 2,
   "atk": 900,
   "def": 800,
   "art": "BLUE-94",
   "faction": "warlord",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0418",
   "name": "巴索罗缪·熊",
   "sub": "孤高之刃",
   "role": "王下七武海",
   "type": "char",
   "level": 5,
   "atk": 2450,
   "def": 2100,
   "art": "BLUE-96",
   "faction": "warlord",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0419",
   "name": "佩罗娜",
   "sub": "王下七武海",
   "role": "王下七武海",
   "type": "char",
   "level": 2,
   "atk": 900,
   "def": 1000,
   "art": "BLUE-98",
   "faction": "warlord",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0420",
   "name": "T·彭",
   "sub": "执法者",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1300,
   "art": "BLUE-103",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0421",
   "name": "鼯鼠",
   "sub": "巡逻舰队",
   "role": "海军",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 750,
   "art": "BLUE-105",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0422",
   "name": "缇娜",
   "sub": "正义之师",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1400,
   "art": "BLUE-107",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0423",
   "name": "阿拉马基·大将",
   "sub": "巡逻舰队",
   "role": "海军",
   "type": "char",
   "level": 2,
   "atk": 900,
   "def": 900,
   "art": "BLUE-108",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0424",
   "name": "萨博",
   "sub": "革命军干部",
   "role": "革命军",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1250,
   "art": "BLUE-116",
   "faction": "revolutionary",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0425",
   "name": "桑达索尼亚",
   "sub": "暗流涌动",
   "role": "王下七武海",
   "type": "char",
   "level": 2,
   "atk": 900,
   "def": 800,
   "art": "BLUE-117",
   "faction": "warlord",
   "formation": "skirmish",
   "fruit": "paramecia",
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0426",
   "name": "纳尔逊",
   "sub": "海军将校",
   "role": "海军",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 750,
   "art": "BLUE-129",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0427",
   "name": "一笑·大将",
   "sub": "铁律",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1350,
   "art": "BLUE-130",
   "faction": "navy",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0428",
   "name": "萨卡斯基·大将",
   "sub": "执法者",
   "role": "海军",
   "type": "char",
   "level": 5,
   "atk": 2450,
   "def": 2450,
   "art": "BLUE-131",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": "zoan",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0429",
   "name": "火烧山",
   "sub": "巡逻舰队",
   "role": "海军",
   "type": "char",
   "level": 4,
   "atk": 2100,
   "def": 1850,
   "art": "BLUE-135",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0430",
   "name": "路奇",
   "sub": "海军将校",
   "role": "海军",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 850,
   "art": "BLUE-136",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0431",
   "name": "布鲁诺",
   "sub": "执法者",
   "role": "海军",
   "type": "char",
   "level": 4,
   "atk": 2100,
   "def": 2100,
   "art": "BLUE-137",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0432",
   "name": "月光·莫利亚",
   "sub": "暗流涌动",
   "role": "王下七武海",
   "type": "char",
   "level": 4,
   "atk": 2100,
   "def": 1850,
   "art": "BLUE-141",
   "faction": "warlord",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0433",
   "name": "蒙奇·D·龙·革命军",
   "sub": "隐密行动",
   "role": "革命军",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1300,
   "art": "BLUE-144",
   "faction": "revolutionary",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0434",
   "name": "摩兹",
   "sub": "解放战线",
   "role": "革命军",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1500,
   "art": "BLUE-145",
   "faction": "revolutionary",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0435",
   "name": "闪电",
   "sub": "解放战线",
   "role": "革命军",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1600,
   "art": "BLUE-149",
   "faction": "revolutionary",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0436",
   "name": "诺兰",
   "sub": "起义者",
   "role": "革命军",
   "type": "char",
   "level": 5,
   "atk": 2450,
   "def": 1900,
   "art": "BLUE-151",
   "faction": "revolutionary",
   "formation": "vanguard",
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0437",
   "name": "斯摩格·大将",
   "sub": "正义之师",
   "role": "海军",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 850,
   "art": "BLUE-152",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0438",
   "name": "蒙奇·D·卡普·大将",
   "sub": "正义之师",
   "role": "海军",
   "type": "char",
   "level": 1,
   "atk": 550,
   "def": 500,
   "art": "BLUE-154",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": "paramecia",
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0439",
   "name": "哈库·革命军",
   "sub": "疾风",
   "role": "革命军",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 700,
   "art": "BLUE-155",
   "faction": "revolutionary",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0440",
   "name": "鬼蜘蛛",
   "sub": "执法者",
   "role": "海军",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 650,
   "art": "BLUE-157",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0441",
   "name": "贝洛·贝蒂",
   "sub": "疾风",
   "role": "革命军",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2850,
   "art": "BLUE-160",
   "faction": "revolutionary",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "S",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0442",
   "name": "巴斯提雍",
   "sub": "执法者",
   "role": "海军",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1650,
   "art": "BLUE-164",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0443",
   "name": "萨卡斯基",
   "sub": "缉捕令",
   "role": "海军",
   "type": "char",
   "level": 1,
   "atk": 550,
   "def": 650,
   "art": "BLUE-169",
   "faction": "navy",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0444",
   "name": "贝鲁梅伯",
   "sub": "执法者",
   "role": "海军",
   "type": "char",
   "level": 4,
   "atk": 2100,
   "def": 2100,
   "art": "BLUE-173",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0445",
   "name": "乔拉",
   "sub": "傀儡师",
   "role": "王下七武海",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 850,
   "art": "BLUE-175",
   "faction": "warlord",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0446",
   "name": "托雷波尔",
   "sub": "处刑人",
   "role": "王下七武海",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 2150,
   "art": "BLUE-176",
   "faction": "warlord",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0447",
   "name": "乔巴",
   "sub": "妹尾的驯鹿",
   "role": "草帽一伙",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 700,
   "art": "GREEN-01",
   "faction": "strawhat",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0448",
   "name": "雷藏",
   "sub": "忍者",
   "role": "草帽一伙",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1050,
   "art": "GREEN-02",
   "faction": "strawhat",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0449",
   "name": "以藏",
   "sub": "白胡子海贼团",
   "role": "草帽一伙",
   "type": "char",
   "level": 3,
   "atk": 1250,
   "def": 1050,
   "art": "GREEN-03",
   "faction": "strawhat",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0450",
   "name": "传次郎",
   "sub": "赤鞘九侠",
   "role": "草帽一伙",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1300,
   "art": "GREEN-04",
   "faction": "strawhat",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0451",
   "name": "杰克",
   "sub": "猛火",
   "role": "百兽海贼团",
   "type": "char",
   "level": 5,
   "atk": 2100,
   "def": 1800,
   "art": "GREEN-05",
   "faction": "beast",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0452",
   "name": "马尔科",
   "sub": "不死鸟",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 5,
   "atk": 2150,
   "def": 2350,
   "art": "GREEN-06",
   "faction": "whitebeard",
   "formation": "bulwark",
   "fruit": "paramecia",
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0453",
   "name": "金",
   "sub": "灾火",
   "role": "百兽海贼团",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2200,
   "art": "GREEN-08",
   "faction": "beast",
   "formation": "vanguard",
   "fruit": "zoan",
   "rarity": "S",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0454",
   "name": "瓦伊帕",
   "sub": "香狄亚战士",
   "role": "草帽一伙",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1350,
   "art": "GREEN-11",
   "faction": "strawhat",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0455",
   "name": "锦卫门",
   "sub": "狐火流",
   "role": "草帽一伙",
   "type": "char",
   "level": 4,
   "atk": 1600,
   "def": 1350,
   "art": "GREEN-13",
   "faction": "strawhat",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0456",
   "name": "河松",
   "sub": "川流",
   "role": "草帽一伙",
   "type": "char",
   "level": 5,
   "atk": 2150,
   "def": 2350,
   "art": "GREEN-14",
   "faction": "strawhat",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0457",
   "name": "藤虎",
   "sub": "重力果实",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 3100,
   "def": 2650,
   "art": "GREEN-15",
   "faction": "navy",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "S",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0458",
   "name": "蕾贝卡",
   "sub": "不败之女",
   "role": "草帽一伙",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1050,
   "art": "GREEN-16",
   "faction": "strawhat",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0459",
   "name": "佩罗斯佩罗",
   "sub": "糖糖果实",
   "role": "四皇",
   "type": "char",
   "level": 6,
   "atk": 2750,
   "def": 2350,
   "art": "GREEN-17",
   "faction": "yonko",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0460",
   "name": "酒天丸",
   "sub": "阿修罗童子党",
   "role": "百兽海贼团",
   "type": "char",
   "level": 5,
   "atk": 2100,
   "def": 1800,
   "art": "GREEN-18",
   "faction": "beast",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0461",
   "name": "霜月康家",
   "sub": "和之国大名",
   "role": "草帽一伙",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1050,
   "art": "GREEN-19",
   "faction": "strawhat",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0462",
   "name": "居鲁士",
   "sub": "竞技场英雄",
   "role": "草帽一伙",
   "type": "char",
   "level": 4,
   "atk": 1600,
   "def": 1350,
   "art": "GREEN-20",
   "faction": "strawhat",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0463",
   "name": "菊之丞",
   "sub": "花之 Soldiers",
   "role": "草帽一伙",
   "type": "char",
   "level": 3,
   "atk": 1250,
   "def": 1050,
   "art": "GREEN-22",
   "faction": "strawhat",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0464",
   "name": "忍",
   "sub": "御庭番众女忍",
   "role": "草帽一伙",
   "type": "char",
   "level": 3,
   "atk": 1250,
   "def": 1050,
   "art": "GREEN-23",
   "faction": "strawhat",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0465",
   "name": "乌索普",
   "sub": "狙击之王",
   "role": "草帽一伙",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1300,
   "art": "GREEN-28",
   "faction": "strawhat",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0466",
   "name": "托尼托尼·乔巴",
   "sub": "暴走魔兽",
   "role": "草帽一伙",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 1950,
   "art": "GREEN-32",
   "faction": "strawhat",
   "formation": "vanguard",
   "fruit": "paramecia",
   "rarity": "B",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0467",
   "name": "大和",
   "sub": "大口真神",
   "role": "百兽海贼团",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 3050,
   "art": "GREEN-37",
   "faction": "beast",
   "formation": "bulwark",
   "fruit": "zoan",
   "rarity": "S",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0468",
   "name": "奎因",
   "sub": "疫灾·腕龙",
   "role": "百兽海贼团",
   "type": "char",
   "level": 5,
   "atk": 2450,
   "def": 2100,
   "art": "GREEN-38",
   "faction": "beast",
   "formation": null,
   "fruit": "zoan",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0469",
   "name": "佐佐木",
   "sub": "三角龙",
   "role": "百兽海贼团",
   "type": "char",
   "level": 5,
   "atk": 2450,
   "def": 2100,
   "art": "GREEN-41",
   "faction": "beast",
   "formation": null,
   "fruit": "zoan",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0470",
   "name": "黑色玛利亚",
   "sub": "古代蛛",
   "role": "百兽海贼团",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 2700,
   "art": "GREEN-42",
   "faction": "beast",
   "formation": "bulwark",
   "fruit": "zoan",
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0471",
   "name": "乌尔蒂",
   "sub": "肿头龙",
   "role": "百兽海贼团",
   "type": "char",
   "level": 4,
   "atk": 1600,
   "def": 1350,
   "art": "GREEN-43",
   "faction": "beast",
   "formation": null,
   "fruit": "zoan",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0472",
   "name": "润媞",
   "sub": "飞六胞",
   "role": "百兽海贼团",
   "type": "char",
   "level": 4,
   "atk": 1600,
   "def": 1350,
   "art": "GREEN-44",
   "faction": "beast",
   "formation": null,
   "fruit": "zoan",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0473",
   "name": "福斯弗",
   "sub": "剑齿虎",
   "role": "百兽海贼团",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1300,
   "art": "GREEN-45",
   "faction": "beast",
   "formation": "vanguard",
   "fruit": "zoan",
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0474",
   "name": "爱德华·纽盖特",
   "sub": "丛云刀",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 7,
   "atk": 3100,
   "def": 2650,
   "art": "GREEN-47",
   "faction": "whitebeard",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "S",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0475",
   "name": "堪十郎",
   "sub": "绘画果实",
   "role": "草帽一伙",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1350,
   "art": "GREEN-49",
   "faction": "strawhat",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0476",
   "name": "奥兹",
   "sub": "传说中的魔人",
   "role": "草帽一伙",
   "type": "char",
   "level": 7,
   "atk": 3100,
   "def": 2650,
   "art": "GREEN-54",
   "faction": "strawhat",
   "formation": null,
   "fruit": null,
   "rarity": "S",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0477",
   "name": "斯库亚德",
   "sub": "大漩涡蜘蛛",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 4,
   "atk": 1600,
   "def": 1350,
   "art": "GREEN-55",
   "faction": "whitebeard",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0478",
   "name": "龙马",
   "sub": "恐怖三桅帆船",
   "role": "草帽一伙",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 1950,
   "art": "GREEN-58",
   "faction": "strawhat",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0479",
   "name": "霍格巴克",
   "sub": "僵尸医生",
   "role": "草帽一伙",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1350,
   "art": "GREEN-59",
   "faction": "strawhat",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0480",
   "name": "日和",
   "sub": "和之国公主",
   "role": "草帽一伙",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 700,
   "art": "GREEN-60",
   "faction": "strawhat",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0481",
   "name": "耕四郎",
   "sub": "一心流道场",
   "role": "草帽一伙",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1050,
   "art": "GREEN-61",
   "faction": "strawhat",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0482",
   "name": "古伊娜",
   "sub": "一心流少女",
   "role": "草帽一伙",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 700,
   "art": "GREEN-62",
   "faction": "strawhat",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0483",
   "name": "小玉",
   "sub": "驯服猛兽",
   "role": "草帽一伙",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 700,
   "art": "GREEN-64",
   "faction": "strawhat",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0484",
   "name": "闪电",
   "sub": "最恶世代",
   "role": "极恶世代",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1100,
   "art": "GREEN-65",
   "faction": "supernova",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0485",
   "name": "贝拉米",
   "sub": "冒险王",
   "role": "草帽一伙",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2850,
   "art": "GREEN-67",
   "faction": "strawhat",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0486",
   "name": "库赞",
   "sub": "执法者",
   "role": "海军",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1650,
   "art": "GREEN-69",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0487",
   "name": "飞六胞",
   "sub": "遗志",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 1,
   "atk": 550,
   "def": 450,
   "art": "GREEN-71",
   "faction": "whitebeard",
   "formation": null,
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0488",
   "name": "纳尔逊",
   "sub": "巡逻舰队",
   "role": "海军",
   "type": "char",
   "level": 4,
   "atk": 2100,
   "def": 2100,
   "art": "GREEN-74",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0489",
   "name": "卡库",
   "sub": "海军将校",
   "role": "海军",
   "type": "char",
   "level": 5,
   "atk": 2450,
   "def": 2150,
   "art": "GREEN-78",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0490",
   "name": "鼯鼠",
   "sub": "巡逻舰队",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1500,
   "art": "GREEN-79",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0491",
   "name": "蒙奇·D·卡普·大将",
   "sub": "执法者",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1600,
   "art": "GREEN-82",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0492",
   "name": "一笑",
   "sub": "巡逻舰队",
   "role": "海军",
   "type": "char",
   "level": 2,
   "atk": 900,
   "def": 800,
   "art": "GREEN-85",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0493",
   "name": "达斯琪",
   "sub": "缉捕令",
   "role": "海军",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 750,
   "art": "GREEN-91",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0494",
   "name": "妮可·罗宾",
   "sub": "伙伴之力",
   "role": "草帽一伙",
   "type": "char",
   "level": 5,
   "atk": 2450,
   "def": 2450,
   "art": "GREEN-92",
   "faction": "strawhat",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0495",
   "name": "尤斯塔斯·基德",
   "sub": "乱世枭雄",
   "role": "极恶世代",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2500,
   "art": "GREEN-93",
   "faction": "supernova",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0496",
   "name": "斯莱曼",
   "sub": "结盟",
   "role": "极恶世代",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 850,
   "art": "GREEN-95",
   "faction": "supernova",
   "formation": "bulwark",
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0497",
   "name": "路奇",
   "sub": "缉捕令",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1600,
   "art": "GREEN-97",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": "logia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0498",
   "name": "萨波",
   "sub": "结盟",
   "role": "极恶世代",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 750,
   "art": "GREEN-98",
   "faction": "supernova",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0499",
   "name": "东利",
   "sub": "扬帆起航",
   "role": "草帽一伙",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1100,
   "art": "GREEN-103",
   "faction": "strawhat",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0500",
   "name": "尼普顿",
   "sub": "冒险者",
   "role": "草帽一伙",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1850,
   "art": "GREEN-104",
   "faction": "strawhat",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0501",
   "name": "蒙奇·D·路飞·新世界",
   "sub": "自由之海",
   "role": "草帽一伙",
   "type": "char",
   "level": 1,
   "atk": 550,
   "def": 650,
   "art": "GREEN-106",
   "faction": "strawhat",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0502",
   "name": "阿托摩斯",
   "sub": "遗志",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1650,
   "art": "GREEN-108",
   "faction": "whitebeard",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0503",
   "name": "T·彭",
   "sub": "巡逻舰队",
   "role": "海军",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1250,
   "art": "GREEN-109",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0504",
   "name": "鬼蜘蛛",
   "sub": "正义之师",
   "role": "海军",
   "type": "char",
   "level": 2,
   "atk": 900,
   "def": 1050,
   "art": "GREEN-112",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": "logia",
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0505",
   "name": "林德伯格",
   "sub": "新星",
   "role": "极恶世代",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1600,
   "art": "GREEN-113",
   "faction": "supernova",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0506",
   "name": "弗兰奇",
   "sub": "扬帆起航",
   "role": "草帽一伙",
   "type": "char",
   "level": 2,
   "atk": 900,
   "def": 750,
   "art": "GREEN-114",
   "faction": "strawhat",
   "formation": null,
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0507",
   "name": "贝鲁梅特尔",
   "sub": "海军将校",
   "role": "海军",
   "type": "char",
   "level": 4,
   "atk": 2100,
   "def": 1850,
   "art": "GREEN-116",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0508",
   "name": "夏莉",
   "sub": "自由之海",
   "role": "草帽一伙",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 2200,
   "art": "GREEN-121",
   "faction": "strawhat",
   "formation": "skirmish",
   "fruit": "paramecia",
   "rarity": "B",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0509",
   "name": "白星",
   "sub": "冒险王",
   "role": "草帽一伙",
   "type": "char",
   "level": 1,
   "atk": 550,
   "def": 650,
   "art": "GREEN-122",
   "faction": "strawhat",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0510",
   "name": "娜美",
   "sub": "草帽一伙",
   "role": "草帽一伙",
   "type": "char",
   "level": 2,
   "atk": 900,
   "def": 800,
   "art": "GREEN-126",
   "faction": "strawhat",
   "formation": "skirmish",
   "fruit": "paramecia",
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0511",
   "name": "甚平",
   "sub": "草帽一伙",
   "role": "草帽一伙",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1850,
   "art": "GREEN-128",
   "faction": "strawhat",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0512",
   "name": "可可罗",
   "sub": "伙伴之力",
   "role": "草帽一伙",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1600,
   "art": "GREEN-129",
   "faction": "strawhat",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0513",
   "name": "弗兰奇·新世界",
   "sub": "伙伴之力",
   "role": "草帽一伙",
   "type": "char",
   "level": 4,
   "atk": 2100,
   "def": 1800,
   "art": "GREEN-132",
   "faction": "strawhat",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0514",
   "name": "一笑·大将",
   "sub": "正义之师",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1300,
   "art": "GREEN-133",
   "faction": "navy",
   "formation": null,
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0515",
   "name": "贝鲁梅伯",
   "sub": "海军将校",
   "role": "海军",
   "type": "char",
   "level": 2,
   "atk": 900,
   "def": 800,
   "art": "GREEN-134",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0516",
   "name": "孔美奥",
   "sub": "巡逻舰队",
   "role": "海军",
   "type": "char",
   "level": 5,
   "atk": 2150,
   "def": 2150,
   "art": "GREEN-139",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0517",
   "name": "诺琪高",
   "sub": "草帽一伙",
   "role": "草帽一伙",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2500,
   "art": "GREEN-140",
   "faction": "strawhat",
   "formation": "skirmish",
   "fruit": "zoan",
   "rarity": "S",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0518",
   "name": "凯撒·克朗",
   "sub": "最恶世代",
   "role": "极恶世代",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1600,
   "art": "GREEN-141",
   "faction": "supernova",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0519",
   "name": "犬岚公爵",
   "sub": "家族之绊",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 5,
   "atk": 2150,
   "def": 1900,
   "art": "GREEN-142",
   "faction": "whitebeard",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0520",
   "name": "阿拉马基·大将",
   "sub": "海军将校",
   "role": "海军",
   "type": "char",
   "level": 2,
   "atk": 900,
   "def": 700,
   "art": "GREEN-148",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0521",
   "name": "波尔萨利诺·大将",
   "sub": "执法者",
   "role": "海军",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 700,
   "art": "GREEN-149",
   "faction": "navy",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0522",
   "name": "和道一文字",
   "sub": "草帽一伙",
   "role": "草帽一伙",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1300,
   "art": "GREEN-150",
   "faction": "strawhat",
   "formation": "bulwark",
   "fruit": "paramecia",
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0523",
   "name": "基拉",
   "sub": "出头天",
   "role": "极恶世代",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1300,
   "art": "GREEN-152",
   "faction": "supernova",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0524",
   "name": "托尼托尼·乔巴·新世界",
   "sub": "草帽一伙",
   "role": "草帽一伙",
   "type": "char",
   "level": 6,
   "atk": 2750,
   "def": 2750,
   "art": "GREEN-154",
   "faction": "strawhat",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0525",
   "name": "妮可·罗宾·新世界",
   "sub": "冒险者",
   "role": "草帽一伙",
   "type": "char",
   "level": 4,
   "atk": 2100,
   "def": 2100,
   "art": "GREEN-156",
   "faction": "strawhat",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0526",
   "name": "薇薇",
   "sub": "自由之海",
   "role": "草帽一伙",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1100,
   "art": "GREEN-157",
   "faction": "strawhat",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0527",
   "name": "阿健",
   "sub": "草帽一伙",
   "role": "草帽一伙",
   "type": "char",
   "level": 4,
   "atk": 2100,
   "def": 1850,
   "art": "GREEN-159",
   "faction": "strawhat",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0528",
   "name": "卡鲁",
   "sub": "自由之海",
   "role": "草帽一伙",
   "type": "char",
   "level": 7,
   "atk": 3100,
   "def": 3100,
   "art": "GREEN-162",
   "faction": "strawhat",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "S",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0529",
   "name": "顿·克利克",
   "sub": "结盟",
   "role": "极恶世代",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1650,
   "art": "GREEN-165",
   "faction": "supernova",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0530",
   "name": "布鲁克·新世界",
   "sub": "草帽一伙",
   "role": "草帽一伙",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1050,
   "art": "GREEN-166",
   "faction": "strawhat",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0531",
   "name": "山治",
   "sub": "冒险王",
   "role": "草帽一伙",
   "type": "char",
   "level": 2,
   "atk": 900,
   "def": 900,
   "art": "GREEN-168",
   "faction": "strawhat",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0532",
   "name": "帕帕古",
   "sub": "草帽一伙",
   "role": "草帽一伙",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1000,
   "art": "GREEN-170",
   "faction": "strawhat",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0533",
   "name": "斯潘达姆",
   "sub": "正义之师",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1350,
   "art": "GREEN-171",
   "faction": "navy",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0534",
   "name": "波特卡斯·D·艾斯",
   "sub": "遗志",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2700,
   "art": "GREEN-172",
   "faction": "whitebeard",
   "formation": "skirmish",
   "fruit": "paramecia",
   "rarity": "S",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0535",
   "name": "萨卡斯基",
   "sub": "正义之师",
   "role": "海军",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 750,
   "art": "GREEN-174",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0536",
   "name": "战国",
   "sub": "缉捕令",
   "role": "海军",
   "type": "char",
   "level": 5,
   "atk": 2150,
   "def": 2100,
   "art": "GREEN-175",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0537",
   "name": "奇蒙尼",
   "sub": "草帽一伙",
   "role": "草帽一伙",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1400,
   "art": "GREEN-177",
   "faction": "strawhat",
   "formation": null,
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0538",
   "name": "贝波",
   "sub": "北极熊",
   "role": "王下七武海",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 700,
   "art": "PURPLE-01",
   "faction": "warlord",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0539",
   "name": "夏奇",
   "sub": "流氓店店主",
   "role": "四皇",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1050,
   "art": "PURPLE-02",
   "faction": "yonko",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0540",
   "name": "佩金",
   "sub": "企鹅帽",
   "role": "王下七武海",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1050,
   "art": "PURPLE-03",
   "faction": "warlord",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0541",
   "name": "基拉",
   "sub": "杀戮武人",
   "role": "极恶世代",
   "type": "char",
   "level": 4,
   "atk": 2150,
   "def": 1700,
   "art": "PURPLE-06",
   "faction": "supernova",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0542",
   "name": "乔拉可尔·米霍克",
   "sub": "鹰眼",
   "role": "王下七武海",
   "type": "char",
   "level": 7,
   "atk": 3100,
   "def": 2650,
   "art": "PURPLE-10",
   "faction": "warlord",
   "formation": null,
   "fruit": null,
   "rarity": "S",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0543",
   "name": "卡彭·贝基",
   "sub": "坚城果实",
   "role": "极恶世代",
   "type": "char",
   "level": 4,
   "atk": 2150,
   "def": 2350,
   "art": "PURPLE-12",
   "faction": "supernova",
   "formation": "bulwark",
   "fruit": "logia",
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0544",
   "name": "佩吉万",
   "sub": "龙龙果实·棘背龙",
   "role": "百兽海贼团",
   "type": "char",
   "level": 6,
   "atk": 2750,
   "def": 2350,
   "art": "PURPLE-14",
   "faction": "beast",
   "formation": null,
   "fruit": "zoan",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0545",
   "name": "卡里布",
   "sub": "沼沼果实",
   "role": "王下七武海",
   "type": "char",
   "level": 4,
   "atk": 2100,
   "def": 1800,
   "art": "PURPLE-15",
   "faction": "warlord",
   "formation": null,
   "fruit": "logia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0546",
   "name": "柯拉松",
   "sub": "唐吉诃德·罗西南迪",
   "role": "海军",
   "type": "char",
   "level": 4,
   "atk": 2100,
   "def": 1800,
   "art": "PURPLE-16",
   "faction": "navy",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0547",
   "name": "鹤",
   "sub": "海军参谋",
   "role": "海军",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1050,
   "art": "PURPLE-17",
   "faction": "navy",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0548",
   "name": "雷利",
   "sub": "冥王",
   "role": "四皇",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2200,
   "art": "PURPLE-19",
   "faction": "yonko",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0549",
   "name": "夏洛特·布蕾",
   "sub": "镜镜果实",
   "role": "四皇",
   "type": "char",
   "level": 4,
   "atk": 2100,
   "def": 1800,
   "art": "PURPLE-21",
   "faction": "yonko",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0550",
   "name": "甘福尔",
   "sub": "空岛神代",
   "role": "四皇",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1350,
   "art": "PURPLE-22",
   "faction": "yonko",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0551",
   "name": "特拉法尔加·罗",
   "sub": "北海医生",
   "role": "王下七武海",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 700,
   "art": "PURPLE-24",
   "faction": "warlord",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0552",
   "name": "霍金斯",
   "sub": "占卜",
   "role": "极恶世代",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 700,
   "art": "PURPLE-32",
   "faction": "supernova",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0553",
   "name": "阿普",
   "sub": "长手族DJ",
   "role": "极恶世代",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1050,
   "art": "PURPLE-43",
   "faction": "supernova",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0554",
   "name": "乌尔基",
   "sub": "因果报应",
   "role": "极恶世代",
   "type": "char",
   "level": 4,
   "atk": 2100,
   "def": 1800,
   "art": "PURPLE-45",
   "faction": "supernova",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0555",
   "name": "X·德雷克",
   "sub": "异特龙",
   "role": "极恶世代",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1350,
   "art": "PURPLE-46",
   "faction": "supernova",
   "formation": null,
   "fruit": "zoan",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0556",
   "name": "乔拉",
   "sub": "艺术果实",
   "role": "王下七武海",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1350,
   "art": "PURPLE-62",
   "faction": "warlord",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0557",
   "name": "Mr.3",
   "sub": "蜡烛果实",
   "role": "王下七武海",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1500,
   "art": "PURPLE-63",
   "faction": "warlord",
   "formation": "bulwark",
   "fruit": "paramecia",
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0558",
   "name": "Miss黄金周",
   "sub": "自由画家",
   "role": "王下七武海",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 700,
   "art": "PURPLE-64",
   "faction": "warlord",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0559",
   "name": "乌尔蒂",
   "sub": "大看板",
   "role": "百兽海贼团",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1400,
   "art": "PURPLE-65",
   "faction": "beast",
   "formation": "skirmish",
   "fruit": "zoan",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0560",
   "name": "提娜",
   "sub": "海军将校",
   "role": "海军",
   "type": "char",
   "level": 1,
   "atk": 550,
   "def": 450,
   "art": "PURPLE-66",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0561",
   "name": "奎因·百兽海贼团",
   "sub": "百兽军团",
   "role": "百兽海贼团",
   "type": "char",
   "level": 4,
   "atk": 2100,
   "def": 1800,
   "art": "PURPLE-73",
   "faction": "beast",
   "formation": null,
   "fruit": "logia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0562",
   "name": "库赞",
   "sub": "缉捕令",
   "role": "海军",
   "type": "char",
   "level": 4,
   "atk": 2100,
   "def": 1650,
   "art": "PURPLE-77",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0563",
   "name": "Mr.1",
   "sub": "处刑人",
   "role": "王下七武海",
   "type": "char",
   "level": 5,
   "atk": 2450,
   "def": 1900,
   "art": "PURPLE-81",
   "faction": "warlord",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0564",
   "name": "火烧山",
   "sub": "执法者",
   "role": "海军",
   "type": "char",
   "level": 2,
   "atk": 900,
   "def": 700,
   "art": "PURPLE-88",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0565",
   "name": "特雷波尔",
   "sub": "夜行",
   "role": "王下七武海",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1150,
   "art": "PURPLE-90",
   "faction": "warlord",
   "formation": "skirmish",
   "fruit": "zoan",
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0566",
   "name": "猛犸",
   "sub": "SMILE能力者",
   "role": "百兽海贼团",
   "type": "char",
   "level": 7,
   "atk": 3100,
   "def": 2400,
   "art": "PURPLE-91",
   "faction": "beast",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "S",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0567",
   "name": "巴索罗缪·熊",
   "sub": "夜行",
   "role": "王下七武海",
   "type": "char",
   "level": 5,
   "atk": 2450,
   "def": 1900,
   "art": "PURPLE-92",
   "faction": "warlord",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0568",
   "name": "范德戴肯",
   "sub": "百兽军团",
   "role": "百兽海贼团",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1300,
   "art": "PURPLE-95",
   "faction": "beast",
   "formation": null,
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0569",
   "name": "凯多·百兽海贼团",
   "sub": "狩猎者",
   "role": "百兽海贼团",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1000,
   "art": "PURPLE-97",
   "faction": "beast",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0570",
   "name": "波雅·汉库珂·王下",
   "sub": "夜行",
   "role": "王下七武海",
   "type": "char",
   "level": 4,
   "atk": 2100,
   "def": 1650,
   "art": "PURPLE-98",
   "faction": "warlord",
   "formation": "vanguard",
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0571",
   "name": "波尔萨利诺",
   "sub": "缉捕令",
   "role": "海军",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1000,
   "art": "PURPLE-99",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0572",
   "name": "润媞",
   "sub": "真打",
   "role": "百兽海贼团",
   "type": "char",
   "level": 4,
   "atk": 2100,
   "def": 1650,
   "art": "PURPLE-101",
   "faction": "beast",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0573",
   "name": "夏洛特·布琳",
   "sub": "夜行",
   "role": "王下七武海",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1000,
   "art": "PURPLE-102",
   "faction": "warlord",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0574",
   "name": "巴基",
   "sub": "夜行",
   "role": "王下七武海",
   "type": "char",
   "level": 6,
   "atk": 2750,
   "def": 2400,
   "art": "PURPLE-103",
   "faction": "warlord",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0575",
   "name": "迪亚玛蒂",
   "sub": "处刑人",
   "role": "王下七武海",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1600,
   "art": "PURPLE-107",
   "faction": "warlord",
   "formation": "bulwark",
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0576",
   "name": "卡特琳娜·蝶美",
   "sub": "真打",
   "role": "百兽海贼团",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1300,
   "art": "PURPLE-109",
   "faction": "beast",
   "formation": "bulwark",
   "fruit": "paramecia",
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0577",
   "name": "马尔科",
   "sub": "真打",
   "role": "百兽海贼团",
   "type": "char",
   "level": 1,
   "atk": 550,
   "def": 500,
   "art": "PURPLE-114",
   "faction": "beast",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0578",
   "name": "布鲁诺",
   "sub": "缉捕令",
   "role": "海军",
   "type": "char",
   "level": 4,
   "atk": 2100,
   "def": 1650,
   "art": "PURPLE-115",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0579",
   "name": "金·百兽海贼团",
   "sub": "鬼岛之主",
   "role": "百兽海贼团",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1450,
   "art": "PURPLE-116",
   "faction": "beast",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0580",
   "name": "贝鲁梅特尔",
   "sub": "执法者",
   "role": "海军",
   "type": "char",
   "level": 1,
   "atk": 550,
   "def": 650,
   "art": "PURPLE-119",
   "faction": "navy",
   "formation": null,
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0581",
   "name": "巴基·王下",
   "sub": "暗流涌动",
   "role": "王下七武海",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1650,
   "art": "PURPLE-120",
   "faction": "warlord",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0582",
   "name": "强纳森",
   "sub": "正义之师",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 3100,
   "def": 2750,
   "art": "PURPLE-122",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0583",
   "name": "霍格巴克",
   "sub": "处刑人",
   "role": "王下七武海",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1100,
   "art": "PURPLE-123",
   "faction": "warlord",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0584",
   "name": "戴夫戈",
   "sub": "真打",
   "role": "百兽海贼团",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1400,
   "art": "PURPLE-125",
   "faction": "beast",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0585",
   "name": "霍迪·琼斯",
   "sub": "鬼岛之主",
   "role": "百兽海贼团",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1650,
   "art": "PURPLE-127",
   "faction": "beast",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0586",
   "name": "金",
   "sub": "狩猎者",
   "role": "百兽海贼团",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 2150,
   "art": "PURPLE-128",
   "faction": "beast",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0587",
   "name": "赞高",
   "sub": "巡逻舰队",
   "role": "海军",
   "type": "char",
   "level": 4,
   "atk": 2100,
   "def": 1850,
   "art": "PURPLE-129",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0588",
   "name": "Mr.5",
   "sub": "王下七武海",
   "role": "王下七武海",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1500,
   "art": "PURPLE-131",
   "faction": "warlord",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0589",
   "name": "德林杰",
   "sub": "傀儡师",
   "role": "王下七武海",
   "type": "char",
   "level": 2,
   "atk": 900,
   "def": 1000,
   "art": "PURPLE-132",
   "faction": "warlord",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0590",
   "name": "路奇",
   "sub": "海军将校",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1000,
   "art": "PURPLE-133",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0591",
   "name": "巴加斯",
   "sub": "百兽军团",
   "role": "百兽海贼团",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1650,
   "art": "PURPLE-134",
   "faction": "beast",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0592",
   "name": "佩罗娜",
   "sub": "处刑人",
   "role": "王下七武海",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 2150,
   "art": "PURPLE-135",
   "faction": "warlord",
   "formation": null,
   "fruit": "zoan",
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0593",
   "name": "豹藏",
   "sub": "鬼岛之主",
   "role": "百兽海贼团",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1400,
   "art": "PURPLE-141",
   "faction": "beast",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0594",
   "name": "伊卡洛斯",
   "sub": "SMILE能力者",
   "role": "百兽海贼团",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1100,
   "art": "PURPLE-142",
   "faction": "beast",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0595",
   "name": "阿拉马基",
   "sub": "执法者",
   "role": "海军",
   "type": "char",
   "level": 5,
   "atk": 2150,
   "def": 1700,
   "art": "PURPLE-143",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0596",
   "name": "卡莉法",
   "sub": "正义之师",
   "role": "海军",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1650,
   "art": "PURPLE-144",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": "zoan",
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0597",
   "name": "格拉迪乌斯",
   "sub": "处刑人",
   "role": "王下七武海",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1000,
   "art": "PURPLE-146",
   "faction": "warlord",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0598",
   "name": "阿巴罗·比萨罗",
   "sub": "真打",
   "role": "百兽海贼团",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1100,
   "art": "PURPLE-148",
   "faction": "beast",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0599",
   "name": "Mr.4",
   "sub": "处刑人",
   "role": "王下七武海",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1000,
   "art": "PURPLE-150",
   "faction": "warlord",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0600",
   "name": "鬼蜘蛛",
   "sub": "正义之师",
   "role": "海军",
   "type": "char",
   "level": 5,
   "atk": 2150,
   "def": 1900,
   "art": "PURPLE-151",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0601",
   "name": "贝鲁梅伯",
   "sub": "铁律",
   "role": "海军",
   "type": "char",
   "level": 2,
   "atk": 900,
   "def": 900,
   "art": "PURPLE-153",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0602",
   "name": "爱德华·威布尔",
   "sub": "王下七武海",
   "role": "王下七武海",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1600,
   "art": "PURPLE-154",
   "faction": "warlord",
   "formation": "bulwark",
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0603",
   "name": "Miss圣诞快乐",
   "sub": "孤高之刃",
   "role": "王下七武海",
   "type": "char",
   "level": 5,
   "atk": 2150,
   "def": 1700,
   "art": "PURPLE-156",
   "faction": "warlord",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0604",
   "name": "桑达索尼亚",
   "sub": "王下七武海",
   "role": "王下七武海",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1050,
   "art": "PURPLE-157",
   "faction": "warlord",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0605",
   "name": "沙尔·克洛克达尔",
   "sub": "王下七武海",
   "role": "王下七武海",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1600,
   "art": "PURPLE-158",
   "faction": "warlord",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0606",
   "name": "巴索罗缪·熊·王下",
   "sub": "傀儡师",
   "role": "王下七武海",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1000,
   "art": "PURPLE-159",
   "faction": "warlord",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0607",
   "name": "卡库",
   "sub": "缉捕令",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2700,
   "art": "PURPLE-162",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": "zoan",
   "rarity": "S",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0608",
   "name": "贝比5",
   "sub": "夜行",
   "role": "王下七武海",
   "type": "char",
   "level": 2,
   "atk": 900,
   "def": 700,
   "art": "PURPLE-163",
   "faction": "warlord",
   "formation": "vanguard",
   "fruit": "paramecia",
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0609",
   "name": "巴巴努基",
   "sub": "大看板",
   "role": "百兽海贼团",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1250,
   "art": "PURPLE-166",
   "faction": "beast",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0610",
   "name": "雨之希留",
   "sub": "SMILE能力者",
   "role": "百兽海贼团",
   "type": "char",
   "level": 7,
   "atk": 3100,
   "def": 2750,
   "art": "PURPLE-167",
   "faction": "beast",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0611",
   "name": "Mr.2",
   "sub": "孤高之刃",
   "role": "王下七武海",
   "type": "char",
   "level": 7,
   "atk": 3100,
   "def": 2750,
   "art": "PURPLE-168",
   "faction": "warlord",
   "formation": "skirmish",
   "fruit": "paramecia",
   "rarity": "S",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0612",
   "name": "拉奥G",
   "sub": "孤高之刃",
   "role": "王下七武海",
   "type": "char",
   "level": 2,
   "atk": 900,
   "def": 700,
   "art": "PURPLE-169",
   "faction": "warlord",
   "formation": "vanguard",
   "fruit": "paramecia",
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0613",
   "name": "爱德华·威布尔·王下",
   "sub": "王下七武海",
   "role": "王下七武海",
   "type": "char",
   "level": 5,
   "atk": 2150,
   "def": 2050,
   "art": "PURPLE-170",
   "faction": "warlord",
   "formation": null,
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0614",
   "name": "特拉法尔加·罗·王下",
   "sub": "傀儡师",
   "role": "王下七武海",
   "type": "char",
   "level": 2,
   "atk": 900,
   "def": 1000,
   "art": "PURPLE-171",
   "faction": "warlord",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0615",
   "name": "莫奈",
   "sub": "处刑人",
   "role": "王下七武海",
   "type": "char",
   "level": 1,
   "atk": 550,
   "def": 650,
   "art": "PURPLE-172",
   "faction": "warlord",
   "formation": "skirmish",
   "fruit": "zoan",
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0616",
   "name": "佐佐木",
   "sub": "SMILE能力者",
   "role": "百兽海贼团",
   "type": "char",
   "level": 2,
   "atk": 900,
   "def": 1000,
   "art": "PURPLE-173",
   "faction": "beast",
   "formation": "skirmish",
   "fruit": "zoan",
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0617",
   "name": "托雷波尔",
   "sub": "傀儡师",
   "role": "王下七武海",
   "type": "char",
   "level": 5,
   "atk": 2150,
   "def": 2100,
   "art": "PURPLE-174",
   "faction": "warlord",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0618",
   "name": "砂糖",
   "sub": "王下七武海",
   "role": "王下七武海",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 1950,
   "art": "PURPLE-175",
   "faction": "warlord",
   "formation": "vanguard",
   "fruit": "paramecia",
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0619",
   "name": "维尔戈",
   "sub": "处刑人",
   "role": "王下七武海",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1500,
   "art": "PURPLE-176",
   "faction": "warlord",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0620",
   "name": "Miss双手指",
   "sub": "孤高之刃",
   "role": "王下七武海",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1600,
   "art": "PURPLE-178",
   "faction": "warlord",
   "formation": "bulwark",
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0621",
   "name": "战国",
   "sub": "缉捕令",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1100,
   "art": "PURPLE-179",
   "faction": "navy",
   "formation": null,
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0622",
   "name": "达斯琪",
   "sub": "缉捕令",
   "role": "海军",
   "type": "char",
   "level": 1,
   "atk": 550,
   "def": 650,
   "art": "PURPLE-180",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0623",
   "name": "T·彭",
   "sub": "缉捕令",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1250,
   "art": "PURPLE-182",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0624",
   "name": "孔美奥",
   "sub": "海军将校",
   "role": "海军",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 2150,
   "art": "PURPLE-183",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0625",
   "name": "乌索普",
   "sub": "狙击之王",
   "role": "草帽一伙",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 700,
   "art": "RED-01",
   "faction": "strawhat",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0626",
   "name": "克比",
   "sub": "海军本部少将",
   "role": "海军",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 700,
   "art": "RED-02",
   "faction": "navy",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0627",
   "name": "山治",
   "sub": "黑脚",
   "role": "草帽一伙",
   "type": "char",
   "level": 2,
   "atk": 900,
   "def": 700,
   "art": "RED-03",
   "faction": "strawhat",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0628",
   "name": "贝拉米",
   "sub": "鬣狗",
   "role": "草帽一伙",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1050,
   "art": "RED-04",
   "faction": "strawhat",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0629",
   "name": "冯克雷",
   "sub": "Mr.2 人妖之王",
   "role": "王下七武海",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1500,
   "art": "RED-05",
   "faction": "warlord",
   "formation": "bulwark",
   "fruit": "paramecia",
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0630",
   "name": "萨博",
   "sub": "革命军参谋总长",
   "role": "革命军",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1300,
   "art": "RED-06",
   "faction": "revolutionary",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0631",
   "name": "巴基",
   "sub": "四分五裂",
   "role": "王下七武海",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1050,
   "art": "RED-11",
   "faction": "warlord",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0632",
   "name": "亚尔丽塔",
   "sub": "滑滑果实",
   "role": "草帽一伙",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 700,
   "art": "RED-12",
   "faction": "strawhat",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0633",
   "name": "克洛",
   "sub": "百计",
   "role": "草帽一伙",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1350,
   "art": "RED-13",
   "faction": "strawhat",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0634",
   "name": "阿龙",
   "sub": "锯齿鲨鱼人",
   "role": "草帽一伙",
   "type": "char",
   "level": 5,
   "atk": 2450,
   "def": 2100,
   "art": "RED-14",
   "faction": "strawhat",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0635",
   "name": "薇薇",
   "sub": "阿拉巴斯坦公主",
   "role": "草帽一伙",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 700,
   "art": "RED-15",
   "faction": "strawhat",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0636",
   "name": "达兹·波涅斯",
   "sub": "快斩果实",
   "role": "王下七武海",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 1950,
   "art": "RED-16",
   "faction": "warlord",
   "formation": "vanguard",
   "fruit": "paramecia",
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0637",
   "name": "伊万科夫",
   "sub": "荷尔蒙果实",
   "role": "革命军",
   "type": "char",
   "level": 6,
   "atk": 2750,
   "def": 2350,
   "art": "RED-20",
   "faction": "revolutionary",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0638",
   "name": "克尔拉",
   "sub": "革命军参谋",
   "role": "草帽一伙",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1350,
   "art": "RED-21",
   "faction": "strawhat",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0639",
   "name": "萨奇",
   "sub": "白团四番队长",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 4,
   "atk": 2100,
   "def": 1800,
   "art": "RED-22",
   "faction": "whitebeard",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0640",
   "name": "战桃丸",
   "sub": "海军科学班",
   "role": "海军",
   "type": "char",
   "level": 5,
   "atk": 2150,
   "def": 2350,
   "art": "RED-23",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0641",
   "name": "光月御田",
   "sub": "天羽羽斩·双刀流",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 7,
   "atk": 3100,
   "def": 2400,
   "art": "RED-39",
   "faction": "whitebeard",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "S",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0642",
   "name": "光月桃之助",
   "sub": "人造青龙果实",
   "role": "草帽一伙",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 700,
   "art": "RED-41",
   "faction": "strawhat",
   "formation": null,
   "fruit": "zoan",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0643",
   "name": "锦卫门",
   "sub": "赤鞘九侠",
   "role": "草帽一伙",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 2700,
   "art": "RED-44",
   "faction": "strawhat",
   "formation": "bulwark",
   "fruit": "paramecia",
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0644",
   "name": "狂死郎",
   "sub": "九霞流",
   "role": "草帽一伙",
   "type": "char",
   "level": 7,
   "atk": 3100,
   "def": 2650,
   "art": "RED-45",
   "faction": "strawhat",
   "formation": null,
   "fruit": null,
   "rarity": "S",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0645",
   "name": "卡文迪许",
   "sub": "隆美尔的镰鼬",
   "role": "极恶世代",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1300,
   "art": "RED-47",
   "faction": "supernova",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0646",
   "name": "威布尔",
   "sub": "白胡子二世",
   "role": "王下七武海",
   "type": "char",
   "level": 6,
   "atk": 2750,
   "def": 2350,
   "art": "RED-48",
   "faction": "warlord",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0647",
   "name": "巴托洛米奥",
   "sub": "屏障·冲撞",
   "role": "极恶世代",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1500,
   "art": "RED-53",
   "faction": "supernova",
   "formation": "bulwark",
   "fruit": "paramecia",
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0648",
   "name": "瓦尔波",
   "sub": "吞吞果实",
   "role": "草帽一伙",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1050,
   "art": "RED-55",
   "faction": "strawhat",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0649",
   "name": "Mr.5",
   "sub": "炸弹果实",
   "role": "王下七武海",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 700,
   "art": "RED-56",
   "faction": "warlord",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0650",
   "name": "洛克斯达",
   "sub": "红发的使者",
   "role": "四皇",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 700,
   "art": "RED-57",
   "faction": "yonko",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0651",
   "name": "东利",
   "sub": "青鬼",
   "role": "草帽一伙",
   "type": "char",
   "level": 5,
   "atk": 2450,
   "def": 2100,
   "art": "RED-60",
   "faction": "strawhat",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0652",
   "name": "布罗吉",
   "sub": "红鬼",
   "role": "草帽一伙",
   "type": "char",
   "level": 5,
   "atk": 2450,
   "def": 2100,
   "art": "RED-61",
   "faction": "strawhat",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0653",
   "name": "罗布·路奇",
   "sub": "六王枪",
   "role": "海军",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 1950,
   "art": "RED-62",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": "zoan",
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0654",
   "name": "巴法罗",
   "sub": "转转果实",
   "role": "草帽一伙",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1350,
   "art": "RED-64",
   "faction": "strawhat",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0655",
   "name": "蕾贝卡",
   "sub": "新星",
   "role": "极恶世代",
   "type": "char",
   "level": 2,
   "atk": 900,
   "def": 800,
   "art": "RED-65",
   "faction": "supernova",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0656",
   "name": "莫莉",
   "sub": "最恶世代",
   "role": "极恶世代",
   "type": "char",
   "level": 5,
   "atk": 2150,
   "def": 2100,
   "art": "RED-67",
   "faction": "supernova",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0657",
   "name": "以藏",
   "sub": "残火",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 650,
   "art": "RED-69",
   "faction": "whitebeard",
   "formation": "vanguard",
   "fruit": "zoan",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0658",
   "name": "基拉",
   "sub": "出头天",
   "role": "极恶世代",
   "type": "char",
   "level": 1,
   "atk": 550,
   "def": 450,
   "art": "RED-70",
   "faction": "supernova",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0659",
   "name": "河松",
   "sub": "赤鞘武士",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 4,
   "atk": 2100,
   "def": 1850,
   "art": "RED-71",
   "faction": "whitebeard",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0660",
   "name": "波特卡斯·D·艾斯·一番队",
   "sub": "残火",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 750,
   "art": "RED-72",
   "faction": "whitebeard",
   "formation": "skirmish",
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0661",
   "name": "龙马",
   "sub": "赤鞘武士",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 750,
   "art": "RED-74",
   "faction": "whitebeard",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0662",
   "name": "可可罗",
   "sub": "冒险者",
   "role": "草帽一伙",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1400,
   "art": "RED-78",
   "faction": "strawhat",
   "formation": "skirmish",
   "fruit": "zoan",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0663",
   "name": "鬼蜘蛛",
   "sub": "铁律",
   "role": "海军",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1100,
   "art": "RED-80",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0664",
   "name": "顿·克利克",
   "sub": "结盟",
   "role": "极恶世代",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1300,
   "art": "RED-81",
   "faction": "supernova",
   "formation": null,
   "fruit": "zoan",
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0665",
   "name": "鼯鼠",
   "sub": "执法者",
   "role": "海军",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1400,
   "art": "RED-83",
   "faction": "navy",
   "formation": null,
   "fruit": "zoan",
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0666",
   "name": "福萨",
   "sub": "白胡子一族",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1400,
   "art": "RED-85",
   "faction": "whitebeard",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0667",
   "name": "一笑",
   "sub": "执法者",
   "role": "海军",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 850,
   "art": "RED-86",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": "zoan",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0668",
   "name": "乌尔基",
   "sub": "野心家",
   "role": "极恶世代",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 1950,
   "art": "RED-87",
   "faction": "supernova",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0669",
   "name": "提娜",
   "sub": "海军将校",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2200,
   "art": "RED-89",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0670",
   "name": "斯摩格",
   "sub": "铁律",
   "role": "海军",
   "type": "char",
   "level": 4,
   "atk": 2100,
   "def": 1650,
   "art": "RED-91",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0671",
   "name": "巴兹尔·霍金斯·最恶世代",
   "sub": "乱世枭雄",
   "role": "极恶世代",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1250,
   "art": "RED-92",
   "faction": "supernova",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0672",
   "name": "乔兹·一番队",
   "sub": "遗志",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1150,
   "art": "RED-93",
   "faction": "whitebeard",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0673",
   "name": "凯撒·克朗",
   "sub": "出头天",
   "role": "极恶世代",
   "type": "char",
   "level": 4,
   "atk": 2100,
   "def": 1650,
   "art": "RED-95",
   "faction": "supernova",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0674",
   "name": "猫蝮蛇",
   "sub": "家族之绊",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 1,
   "atk": 550,
   "def": 450,
   "art": "RED-96",
   "faction": "whitebeard",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0675",
   "name": "哈库",
   "sub": "最恶世代",
   "role": "极恶世代",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1400,
   "art": "RED-98",
   "faction": "supernova",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0676",
   "name": "娜美·新世界",
   "sub": "冒险王",
   "role": "草帽一伙",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1300,
   "art": "RED-99",
   "faction": "strawhat",
   "formation": "vanguard",
   "fruit": "zoan",
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0677",
   "name": "酒天丸",
   "sub": "家族之绊",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 1,
   "atk": 550,
   "def": 650,
   "art": "RED-100",
   "faction": "whitebeard",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0678",
   "name": "邦尼",
   "sub": "乱世枭雄",
   "role": "极恶世代",
   "type": "char",
   "level": 4,
   "atk": 2100,
   "def": 1800,
   "art": "RED-102",
   "faction": "supernova",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0679",
   "name": "瓦伊帕",
   "sub": "冒险王",
   "role": "草帽一伙",
   "type": "char",
   "level": 4,
   "atk": 2100,
   "def": 1650,
   "art": "RED-103",
   "faction": "strawhat",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0680",
   "name": "贝鲁梅特尔",
   "sub": "铁律",
   "role": "海军",
   "type": "char",
   "level": 6,
   "atk": 2750,
   "def": 2400,
   "art": "RED-105",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0681",
   "name": "拉库约",
   "sub": "白胡子一族",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 2,
   "atk": 900,
   "def": 700,
   "art": "RED-108",
   "faction": "whitebeard",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0682",
   "name": "托尼托尼·乔巴·新世界",
   "sub": "扬帆起航",
   "role": "草帽一伙",
   "type": "char",
   "level": 5,
   "atk": 2150,
   "def": 1700,
   "art": "RED-109",
   "faction": "strawhat",
   "formation": "vanguard",
   "fruit": "logia",
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0683",
   "name": "贝鲁梅伯",
   "sub": "执法者",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1350,
   "art": "RED-110",
   "faction": "navy",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0684",
   "name": "X·德雷克",
   "sub": "结盟",
   "role": "极恶世代",
   "type": "char",
   "level": 2,
   "atk": 900,
   "def": 900,
   "art": "RED-111",
   "faction": "supernova",
   "formation": "vanguard",
   "fruit": "logia",
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0685",
   "name": "卡拉斯",
   "sub": "出头天",
   "role": "极恶世代",
   "type": "char",
   "level": 5,
   "atk": 2150,
   "def": 2100,
   "art": "RED-113",
   "faction": "supernova",
   "formation": "skirmish",
   "fruit": "paramecia",
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0686",
   "name": "耕四郎",
   "sub": "一番队长",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 5,
   "atk": 2150,
   "def": 1850,
   "art": "RED-115",
   "faction": "whitebeard",
   "formation": null,
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0687",
   "name": "比斯塔",
   "sub": "一番队长",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1650,
   "art": "RED-116",
   "faction": "whitebeard",
   "formation": "skirmish",
   "fruit": "zoan",
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0688",
   "name": "堪十郎",
   "sub": "遗志",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1000,
   "art": "RED-117",
   "faction": "whitebeard",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0689",
   "name": "蒙奇·D·路飞·新世界",
   "sub": "自由之海",
   "role": "草帽一伙",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2850,
   "art": "RED-118",
   "faction": "strawhat",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0690",
   "name": "拉布",
   "sub": "伙伴之力",
   "role": "草帽一伙",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2700,
   "art": "RED-120",
   "faction": "strawhat",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0691",
   "name": "乌尔基·最恶世代",
   "sub": "野心家",
   "role": "极恶世代",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1050,
   "art": "RED-121",
   "faction": "supernova",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0692",
   "name": "杰克",
   "sub": "赤鞘武士",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1000,
   "art": "RED-123",
   "faction": "whitebeard",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0693",
   "name": "贝波",
   "sub": "新星",
   "role": "极恶世代",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 2400,
   "art": "RED-124",
   "faction": "supernova",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0694",
   "name": "战国",
   "sub": "正义之师",
   "role": "海军",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1100,
   "art": "RED-125",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0695",
   "name": "T·彭",
   "sub": "缉捕令",
   "role": "海军",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 2400,
   "art": "RED-128",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0696",
   "name": "赞高",
   "sub": "缉捕令",
   "role": "海军",
   "type": "char",
   "level": 5,
   "atk": 2150,
   "def": 1700,
   "art": "RED-130",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0697",
   "name": "弗兰奇·新世界",
   "sub": "冒险王",
   "role": "草帽一伙",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1450,
   "art": "RED-131",
   "faction": "strawhat",
   "formation": "skirmish",
   "fruit": "paramecia",
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0698",
   "name": "巴兹尔·霍金斯",
   "sub": "最恶世代",
   "role": "极恶世代",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 850,
   "art": "RED-132",
   "faction": "supernova",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0699",
   "name": "妮可·罗宾·新世界",
   "sub": "冒险王",
   "role": "草帽一伙",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1500,
   "art": "RED-133",
   "faction": "strawhat",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0700",
   "name": "贝加庞克",
   "sub": "出头天",
   "role": "极恶世代",
   "type": "char",
   "level": 1,
   "atk": 550,
   "def": 450,
   "art": "RED-135",
   "faction": "supernova",
   "formation": null,
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0701",
   "name": "修佐",
   "sub": "出头天",
   "role": "极恶世代",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1000,
   "art": "RED-139",
   "faction": "supernova",
   "formation": "vanguard",
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0702",
   "name": "乔艾莉·波妮",
   "sub": "野心家",
   "role": "极恶世代",
   "type": "char",
   "level": 1,
   "atk": 550,
   "def": 550,
   "art": "RED-140",
   "faction": "supernova",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0703",
   "name": "阿金",
   "sub": "出头天",
   "role": "极恶世代",
   "type": "char",
   "level": 5,
   "atk": 2450,
   "def": 2150,
   "art": "RED-141",
   "faction": "supernova",
   "formation": "skirmish",
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0704",
   "name": "以藏·一番队",
   "sub": "家族之绊",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 2,
   "atk": 900,
   "def": 800,
   "art": "RED-142",
   "faction": "whitebeard",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0705",
   "name": "维尔戈",
   "sub": "巡逻舰队",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1400,
   "art": "RED-143",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0706",
   "name": "布鲁克",
   "sub": "伙伴之力",
   "role": "草帽一伙",
   "type": "char",
   "level": 1,
   "atk": 550,
   "def": 650,
   "art": "RED-145",
   "faction": "strawhat",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0707",
   "name": "冰山",
   "sub": "扬帆起航",
   "role": "草帽一伙",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1000,
   "art": "RED-151",
   "faction": "strawhat",
   "formation": "vanguard",
   "fruit": "zoan",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0708",
   "name": "马尔科·一番队",
   "sub": "白胡子一族",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2500,
   "art": "RED-155",
   "faction": "whitebeard",
   "formation": "skirmish",
   "fruit": "zoan",
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0709",
   "name": "比斯塔·一番队",
   "sub": "家族之绊",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 2,
   "atk": 900,
   "def": 1000,
   "art": "RED-156",
   "faction": "whitebeard",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0710",
   "name": "传次郎",
   "sub": "残火",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1650,
   "art": "RED-158",
   "faction": "whitebeard",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0711",
   "name": "拳骨",
   "sub": "新星",
   "role": "极恶世代",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1350,
   "art": "RED-163",
   "faction": "supernova",
   "formation": "skirmish",
   "fruit": "paramecia",
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0712",
   "name": "尤斯塔斯·基德·最恶世代",
   "sub": "结盟",
   "role": "极恶世代",
   "type": "char",
   "level": 5,
   "atk": 2150,
   "def": 1700,
   "art": "RED-164",
   "faction": "supernova",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0713",
   "name": "路奇",
   "sub": "巡逻舰队",
   "role": "海军",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1050,
   "art": "RED-168",
   "faction": "navy",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0714",
   "name": "孔美奥",
   "sub": "巡逻舰队",
   "role": "海军",
   "type": "char",
   "level": 7,
   "atk": 3100,
   "def": 2400,
   "art": "RED-171",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": "zoan",
   "rarity": "S",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0715",
   "name": "弗兰奇",
   "sub": "冒险王",
   "role": "草帽一伙",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 650,
   "art": "RED-176",
   "faction": "strawhat",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0716",
   "name": "斯莱曼",
   "sub": "乱世枭雄",
   "role": "极恶世代",
   "type": "char",
   "level": 5,
   "atk": 2150,
   "def": 1900,
   "art": "RED-177",
   "faction": "supernova",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0717",
   "name": "罗罗诺亚·索隆·新世界",
   "sub": "自由之海",
   "role": "草帽一伙",
   "type": "char",
   "level": 5,
   "atk": 2150,
   "def": 2050,
   "art": "RED-178",
   "faction": "strawhat",
   "formation": null,
   "fruit": "zoan",
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0718",
   "name": "莱德菲尔德",
   "sub": "野心家",
   "role": "极恶世代",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1850,
   "art": "RED-181",
   "faction": "supernova",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0719",
   "name": "佩罗娜",
   "sub": "幽灵公主",
   "role": "王下七武海",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 700,
   "art": "YELLOW-01",
   "faction": "warlord",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0720",
   "name": "桑达索尼亚",
   "sub": "蛇蛇果实",
   "role": "王下七武海",
   "type": "char",
   "level": 2,
   "atk": 900,
   "def": 1050,
   "art": "YELLOW-02",
   "faction": "warlord",
   "formation": "bulwark",
   "fruit": "zoan",
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0721",
   "name": "玛丽哥德",
   "sub": "蛇蛇果实",
   "role": "王下七武海",
   "type": "char",
   "level": 2,
   "atk": 900,
   "def": 1050,
   "art": "YELLOW-03",
   "faction": "warlord",
   "formation": "bulwark",
   "fruit": "zoan",
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0722",
   "name": "莫利亚",
   "sub": "影子大王",
   "role": "王下七武海",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1350,
   "art": "YELLOW-04",
   "faction": "warlord",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0723",
   "name": "比斯塔",
   "sub": "花剑",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 4,
   "atk": 1600,
   "def": 1350,
   "art": "YELLOW-05",
   "faction": "whitebeard",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0724",
   "name": "乔兹",
   "sub": "钻石",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1850,
   "art": "YELLOW-06",
   "faction": "whitebeard",
   "formation": "bulwark",
   "fruit": "paramecia",
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0725",
   "name": "塞尼奥尔·皮克",
   "sub": "游游果实",
   "role": "王下七武海",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1850,
   "art": "YELLOW-13",
   "faction": "warlord",
   "formation": "bulwark",
   "fruit": "paramecia",
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0726",
   "name": "迪亚曼蒂",
   "sub": "飘飘果实",
   "role": "王下七武海",
   "type": "char",
   "level": 5,
   "atk": 2100,
   "def": 1800,
   "art": "YELLOW-14",
   "faction": "warlord",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0727",
   "name": "皮卡",
   "sub": "石石果实",
   "role": "王下七武海",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 3050,
   "art": "YELLOW-15",
   "faction": "warlord",
   "formation": "bulwark",
   "fruit": "paramecia",
   "rarity": "S",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0728",
   "name": "特雷波尔",
   "sub": "粘粘果实",
   "role": "王下七武海",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1350,
   "art": "YELLOW-16",
   "faction": "warlord",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0729",
   "name": "维尔戈",
   "sub": "鬼竹",
   "role": "王下七武海",
   "type": "char",
   "level": 5,
   "atk": 2150,
   "def": 2350,
   "art": "YELLOW-17",
   "faction": "warlord",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0730",
   "name": "莫奈",
   "sub": "鸟鸟果实·夜枭",
   "role": "王下七武海",
   "type": "char",
   "level": 4,
   "atk": 1600,
   "def": 1350,
   "art": "YELLOW-18",
   "faction": "warlord",
   "formation": null,
   "fruit": "zoan",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0731",
   "name": "阿布萨罗姆",
   "sub": "透明果实",
   "role": "王下七武海",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1000,
   "art": "YELLOW-19",
   "faction": "warlord",
   "formation": "vanguard",
   "fruit": "paramecia",
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0732",
   "name": "斯慕吉",
   "sub": "榨榨果实",
   "role": "四皇",
   "type": "char",
   "level": 4,
   "atk": 1600,
   "def": 1350,
   "art": "YELLOW-20",
   "faction": "yonko",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0733",
   "name": "布琳",
   "sub": "记忆果实",
   "role": "四皇",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1350,
   "art": "YELLOW-21",
   "faction": "yonko",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0734",
   "name": "欧文",
   "sub": "热热果实",
   "role": "四皇",
   "type": "char",
   "level": 4,
   "atk": 1600,
   "def": 1350,
   "art": "YELLOW-22",
   "faction": "yonko",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0735",
   "name": "砂糖",
   "sub": "玩具果实",
   "role": "王下七武海",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1050,
   "art": "YELLOW-23",
   "faction": "warlord",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0736",
   "name": "山治",
   "sub": "见习厨师",
   "role": "草帽一伙",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 700,
   "art": "YELLOW-24",
   "faction": "strawhat",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0737",
   "name": "艾涅尔",
   "sub": "放电",
   "role": "四皇",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 700,
   "art": "YELLOW-36",
   "faction": "yonko",
   "formation": null,
   "fruit": "logia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0738",
   "name": "犬岚公爵",
   "sub": "月狮",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 1950,
   "art": "YELLOW-39",
   "faction": "whitebeard",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0739",
   "name": "猫蝮蛇",
   "sub": "月狮",
   "role": "白胡子海贼团",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 1950,
   "art": "YELLOW-40",
   "faction": "whitebeard",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0740",
   "name": "克力架",
   "sub": "饼干士兵",
   "role": "四皇",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1500,
   "art": "YELLOW-44",
   "faction": "yonko",
   "formation": "bulwark",
   "fruit": "paramecia",
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0741",
   "name": "玛格丽特",
   "sub": "蛇岛弓手",
   "role": "王下七武海",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1350,
   "art": "YELLOW-46",
   "faction": "warlord",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0742",
   "name": "库蕾哈",
   "sub": "医婆",
   "role": "王下七武海",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1050,
   "art": "YELLOW-48",
   "faction": "warlord",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0743",
   "name": "月光·莫利亚",
   "sub": "影子军团",
   "role": "王下七武海",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 2700,
   "art": "YELLOW-50",
   "faction": "warlord",
   "formation": "bulwark",
   "fruit": "paramecia",
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0744",
   "name": "格拉迪乌斯",
   "sub": "泡泡果实",
   "role": "王下七武海",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1350,
   "art": "YELLOW-51",
   "faction": "warlord",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0745",
   "name": "德林杰",
   "sub": "人鱼斗士",
   "role": "王下七武海",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1050,
   "art": "YELLOW-52",
   "faction": "warlord",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0746",
   "name": "拉奥G",
   "sub": "格斗拳",
   "role": "王下七武海",
   "type": "char",
   "level": 4,
   "atk": 2100,
   "def": 1800,
   "art": "YELLOW-53",
   "faction": "warlord",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0747",
   "name": "蕾贝卡",
   "sub": "圆顶斗技场",
   "role": "王下七武海",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1350,
   "art": "YELLOW-54",
   "faction": "warlord",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0748",
   "name": "夏洛特·欧文",
   "sub": "热热果实",
   "role": "四皇",
   "type": "char",
   "level": 5,
   "atk": 2450,
   "def": 2100,
   "art": "YELLOW-55",
   "faction": "yonko",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0749",
   "name": "夏洛特·布琳",
   "sub": "三眼族",
   "role": "四皇",
   "type": "char",
   "level": 4,
   "atk": 2100,
   "def": 1800,
   "art": "YELLOW-56",
   "faction": "yonko",
   "formation": null,
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0750",
   "name": "斯莱曼",
   "sub": "剑斗士",
   "role": "王下七武海",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1350,
   "art": "YELLOW-57",
   "faction": "warlord",
   "formation": null,
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0751",
   "name": "阿曼德",
   "sub": "四皇麾下",
   "role": "四皇",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1100,
   "art": "YELLOW-60",
   "faction": "yonko",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0752",
   "name": "月光·莫利亚·王下",
   "sub": "处刑人",
   "role": "王下七武海",
   "type": "char",
   "level": 2,
   "atk": 900,
   "def": 800,
   "art": "YELLOW-63",
   "faction": "warlord",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0753",
   "name": "巴索罗缪·熊·王下",
   "sub": "孤高之刃",
   "role": "王下七武海",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1650,
   "art": "YELLOW-64",
   "faction": "warlord",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0754",
   "name": "加列特",
   "sub": "皇族血脉",
   "role": "四皇",
   "type": "char",
   "level": 6,
   "atk": 2750,
   "def": 2400,
   "art": "YELLOW-65",
   "faction": "yonko",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0755",
   "name": "坎迪",
   "sub": "四皇麾下",
   "role": "四皇",
   "type": "char",
   "level": 7,
   "atk": 3100,
   "def": 2750,
   "art": "YELLOW-66",
   "faction": "yonko",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0756",
   "name": "蒙奇·D·卡普·大将",
   "sub": "缉捕令",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1350,
   "art": "YELLOW-69",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": "paramecia",
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0757",
   "name": "Mr.3",
   "sub": "夜行",
   "role": "王下七武海",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1650,
   "art": "YELLOW-73",
   "faction": "warlord",
   "formation": "skirmish",
   "fruit": "paramecia",
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0758",
   "name": "斯潘达姆",
   "sub": "执法者",
   "role": "海军",
   "type": "char",
   "level": 6,
   "atk": 2750,
   "def": 2150,
   "art": "YELLOW-80",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0759",
   "name": "波尔萨利诺·大将",
   "sub": "铁律",
   "role": "海军",
   "type": "char",
   "level": 6,
   "atk": 2750,
   "def": 2400,
   "art": "YELLOW-81",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0760",
   "name": "万国",
   "sub": "破竹之势",
   "role": "四皇",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 750,
   "art": "YELLOW-82",
   "faction": "yonko",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0761",
   "name": "蒙奇·D·卡普",
   "sub": "正义之师",
   "role": "海军",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 650,
   "art": "YELLOW-84",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0762",
   "name": "维奥莱特",
   "sub": "处刑人",
   "role": "王下七武海",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1100,
   "art": "YELLOW-85",
   "faction": "warlord",
   "formation": null,
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0763",
   "name": "唐吉诃德·多弗朗明戈",
   "sub": "孤高之刃",
   "role": "王下七武海",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1500,
   "art": "YELLOW-92",
   "faction": "warlord",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0764",
   "name": "赞高",
   "sub": "缉捕令",
   "role": "海军",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 650,
   "art": "YELLOW-93",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0765",
   "name": "鼯鼠",
   "sub": "执法者",
   "role": "海军",
   "type": "char",
   "level": 6,
   "atk": 2750,
   "def": 2150,
   "art": "YELLOW-95",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0766",
   "name": "克比",
   "sub": "正义之师",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1150,
   "art": "YELLOW-96",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0767",
   "name": "沙尔·克洛克达尔·王下",
   "sub": "孤高之刃",
   "role": "王下七武海",
   "type": "char",
   "level": 5,
   "atk": 2150,
   "def": 2100,
   "art": "YELLOW-97",
   "faction": "warlord",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0768",
   "name": "乔拉",
   "sub": "夜行",
   "role": "王下七武海",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 2700,
   "art": "YELLOW-98",
   "faction": "warlord",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0769",
   "name": "鹤·大将",
   "sub": "正义之师",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1600,
   "art": "YELLOW-99",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0770",
   "name": "巴基",
   "sub": "夜行",
   "role": "王下七武海",
   "type": "char",
   "level": 4,
   "atk": 2100,
   "def": 1850,
   "art": "YELLOW-100",
   "faction": "warlord",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0771",
   "name": "席尔巴斯·雷利",
   "sub": "亲卫队长",
   "role": "四皇",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1650,
   "art": "YELLOW-101",
   "faction": "yonko",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0772",
   "name": "斯纳克",
   "sub": "亲卫队长",
   "role": "四皇",
   "type": "char",
   "level": 2,
   "atk": 900,
   "def": 700,
   "art": "YELLOW-102",
   "faction": "yonko",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0773",
   "name": "卡莉法",
   "sub": "巡逻舰队",
   "role": "海军",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 2150,
   "art": "YELLOW-103",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0774",
   "name": "夏奇·四皇",
   "sub": "亲卫队长",
   "role": "四皇",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 2400,
   "art": "YELLOW-104",
   "faction": "yonko",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0775",
   "name": "萨卡斯基",
   "sub": "执法者",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1350,
   "art": "YELLOW-105",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0776",
   "name": "文斯莫克·勇治",
   "sub": "四皇麾下",
   "role": "四皇",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 750,
   "art": "YELLOW-106",
   "faction": "yonko",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0777",
   "name": "一笑·大将",
   "sub": "正义之师",
   "role": "海军",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 2400,
   "art": "YELLOW-107",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0778",
   "name": "路奇",
   "sub": "巡逻舰队",
   "role": "海军",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1400,
   "art": "YELLOW-108",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0779",
   "name": "纳尔逊",
   "sub": "铁律",
   "role": "海军",
   "type": "char",
   "level": 2,
   "atk": 900,
   "def": 700,
   "art": "YELLOW-109",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0780",
   "name": "火烧山",
   "sub": "铁律",
   "role": "海军",
   "type": "char",
   "level": 1,
   "atk": 550,
   "def": 550,
   "art": "YELLOW-110",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": "zoan",
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0781",
   "name": "沙尔·克洛克达尔",
   "sub": "夜行",
   "role": "王下七武海",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1400,
   "art": "YELLOW-112",
   "faction": "warlord",
   "formation": "skirmish",
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0782",
   "name": "歌姬",
   "sub": "破竹之势",
   "role": "四皇",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1100,
   "art": "YELLOW-114",
   "faction": "yonko",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0783",
   "name": "Miss圣诞快乐",
   "sub": "孤高之刃",
   "role": "王下七武海",
   "type": "char",
   "level": 1,
   "atk": 850,
   "def": 650,
   "art": "YELLOW-116",
   "faction": "warlord",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0784",
   "name": "霍格巴克",
   "sub": "夜行",
   "role": "王下七武海",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 1950,
   "art": "YELLOW-118",
   "faction": "warlord",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0785",
   "name": "一笑",
   "sub": "正义之师",
   "role": "海军",
   "type": "char",
   "level": 5,
   "atk": 2150,
   "def": 2100,
   "art": "YELLOW-119",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0786",
   "name": "康佩什",
   "sub": "破竹之势",
   "role": "四皇",
   "type": "char",
   "level": 7,
   "atk": 3100,
   "def": 3100,
   "art": "YELLOW-121",
   "faction": "yonko",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "S",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0787",
   "name": "特拉法尔加·罗",
   "sub": "孤高之刃",
   "role": "王下七武海",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1000,
   "art": "YELLOW-124",
   "faction": "warlord",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0788",
   "name": "席尔巴斯·雷利·四皇",
   "sub": "四皇麾下",
   "role": "四皇",
   "type": "char",
   "level": 2,
   "atk": 900,
   "def": 700,
   "art": "YELLOW-126",
   "faction": "yonko",
   "formation": "vanguard",
   "fruit": "paramecia",
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0789",
   "name": "迪亚玛蒂",
   "sub": "暗流涌动",
   "role": "王下七武海",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1100,
   "art": "YELLOW-127",
   "faction": "warlord",
   "formation": null,
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0790",
   "name": "托雷波尔",
   "sub": "暗流涌动",
   "role": "王下七武海",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1400,
   "art": "YELLOW-130",
   "faction": "warlord",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0791",
   "name": "T·彭",
   "sub": "缉捕令",
   "role": "海军",
   "type": "char",
   "level": 5,
   "atk": 2150,
   "def": 1900,
   "art": "YELLOW-132",
   "faction": "navy",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0792",
   "name": "耶稣布·四皇",
   "sub": "破竹之势",
   "role": "四皇",
   "type": "char",
   "level": 2,
   "atk": 1250,
   "def": 1100,
   "art": "YELLOW-133",
   "faction": "yonko",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0793",
   "name": "唐吉诃德·多弗朗明戈·王下",
   "sub": "孤高之刃",
   "role": "王下七武海",
   "type": "char",
   "level": 7,
   "atk": 3100,
   "def": 2750,
   "art": "YELLOW-137",
   "faction": "warlord",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "S",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0794",
   "name": "巴斯提雍",
   "sub": "缉捕令",
   "role": "海军",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1300,
   "art": "YELLOW-139",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0795",
   "name": "加布拉",
   "sub": "铁律",
   "role": "海军",
   "type": "char",
   "level": 4,
   "atk": 2100,
   "def": 1650,
   "art": "YELLOW-142",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0796",
   "name": "鹤",
   "sub": "执法者",
   "role": "海军",
   "type": "char",
   "level": 1,
   "atk": 550,
   "def": 450,
   "art": "YELLOW-143",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0797",
   "name": "贝鲁梅伯",
   "sub": "巡逻舰队",
   "role": "海军",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 2150,
   "art": "YELLOW-145",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0798",
   "name": "战国·大将",
   "sub": "铁律",
   "role": "海军",
   "type": "char",
   "level": 2,
   "atk": 900,
   "def": 700,
   "art": "YELLOW-150",
   "faction": "navy",
   "formation": "vanguard",
   "fruit": "zoan",
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0799",
   "name": "金狮子史基",
   "sub": "大海之主",
   "role": "四皇",
   "type": "char",
   "level": 4,
   "atk": 2100,
   "def": 1650,
   "art": "YELLOW-151",
   "faction": "yonko",
   "formation": "vanguard",
   "fruit": "paramecia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0800",
   "name": "文斯莫克·伊治",
   "sub": "四皇麾下",
   "role": "四皇",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1200,
   "art": "YELLOW-152",
   "faction": "yonko",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0801",
   "name": "香克斯·四皇",
   "sub": "破竹之势",
   "role": "四皇",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1600,
   "art": "YELLOW-154",
   "faction": "yonko",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0802",
   "name": "乔拉可尔·米霍克",
   "sub": "傀儡师",
   "role": "王下七武海",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1450,
   "art": "YELLOW-159",
   "faction": "warlord",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0803",
   "name": "庞蒂",
   "sub": "皇族血脉",
   "role": "四皇",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2850,
   "art": "YELLOW-160",
   "faction": "yonko",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0804",
   "name": "Mr.4",
   "sub": "王下七武海",
   "role": "王下七武海",
   "type": "char",
   "level": 4,
   "atk": 2100,
   "def": 1800,
   "art": "YELLOW-161",
   "faction": "warlord",
   "formation": null,
   "fruit": "zoan",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0805",
   "name": "蒙多尔",
   "sub": "大海之主",
   "role": "四皇",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1350,
   "art": "YELLOW-162",
   "faction": "yonko",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0806",
   "name": "夏洛特·布蕾",
   "sub": "皇族血脉",
   "role": "四皇",
   "type": "char",
   "level": 3,
   "atk": 1300,
   "def": 1150,
   "art": "YELLOW-164",
   "faction": "yonko",
   "formation": "skirmish",
   "fruit": null,
   "rarity": "B",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0807",
   "name": "文斯莫克·蕾玖",
   "sub": "皇族血脉",
   "role": "四皇",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2700,
   "art": "YELLOW-166",
   "faction": "yonko",
   "formation": "skirmish",
   "fruit": "paramecia",
   "rarity": "S",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0808",
   "name": "文斯莫克·尼治",
   "sub": "破竹之势",
   "role": "四皇",
   "type": "char",
   "level": 7,
   "atk": 2850,
   "def": 2850,
   "art": "YELLOW-167",
   "faction": "yonko",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "S",
   "keywords": [
    "rush"
   ],
   "desc": "速攻：登场回合即可攻击"
  },
  {
   "id": "GLD-C0809",
   "name": "斯摩格",
   "sub": "正义之师",
   "role": "海军",
   "type": "char",
   "level": 6,
   "atk": 2500,
   "def": 2700,
   "art": "YELLOW-170",
   "faction": "navy",
   "formation": "bulwark",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0810",
   "name": "卡彭·贝基",
   "sub": "皇族血脉",
   "role": "四皇",
   "type": "char",
   "level": 3,
   "atk": 1600,
   "def": 1600,
   "art": "YELLOW-171",
   "faction": "yonko",
   "formation": "bulwark",
   "fruit": "logia",
   "rarity": "A",
   "desc": "无技能"
  },
  {
   "id": "GLD-C0811",
   "name": "波宾",
   "sub": "破竹之势",
   "role": "四皇",
   "type": "char",
   "level": 4,
   "atk": 1650,
   "def": 1650,
   "art": "YELLOW-176",
   "faction": "yonko",
   "formation": "skirmish",
   "fruit": "paramecia",
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-C0812",
   "name": "贝比5",
   "sub": "孤高之刃",
   "role": "王下七武海",
   "type": "char",
   "level": 2,
   "atk": 900,
   "def": 900,
   "art": "YELLOW-178",
   "faction": "warlord",
   "formation": "vanguard",
   "fruit": null,
   "rarity": "B",
   "desc": "守备型人物（守备力偏高）"
  },
  {
   "id": "GLD-G0001",
   "name": "狙击镜",
   "sub": "红发狙击手",
   "type": "move",
   "moveKind": "equip",
   "art": "BLACK-G1",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 100,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+100。装备留在场上，装备者离场时随之进墓。",
   "faction": "beast",
   "rarity": "A"
  },
  {
   "id": "GLD-G0002",
   "name": "黑刀·初代鬼彻",
   "sub": "妖刀一文字",
   "type": "move",
   "moveKind": "equip",
   "art": "BLACK-G2",
   "level": 3,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "def",
      "amount": 200,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：DEF+200。装备留在场上，装备者离场时随之进墓。",
   "faction": "beast",
   "rarity": "B"
  },
  {
   "id": "GLD-G0003",
   "name": "雷雨",
   "sub": "希留爱用的妖刀",
   "type": "move",
   "moveKind": "equip",
   "art": "BLACK-G3",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 200,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+200。装备留在场上，装备者离场时随之进墓。",
   "faction": "beast",
   "rarity": "B"
  },
  {
   "id": "GLD-G0004",
   "name": "蒙卡的大斧",
   "sub": "斧手蒙卡爱斧",
   "type": "move",
   "moveKind": "equip",
   "art": "BLACK-G6",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 200,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+200。装备留在场上，装备者离场时随之进墓。",
   "faction": "beast",
   "rarity": "B"
  },
  {
   "id": "GLD-G0005",
   "name": "黑翼斩舰刀",
   "sub": "真打",
   "type": "move",
   "moveKind": "equip",
   "art": "BLACK-G7",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 100,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+100。装备留在场上，装备者离场时随之进墓。",
   "faction": "beast",
   "rarity": "A"
  },
  {
   "id": "GLD-G0006",
   "name": "铁狱锁链",
   "sub": "大看板",
   "type": "move",
   "moveKind": "equip",
   "art": "BLACK-G8",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 200,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+200。装备留在场上，装备者离场时随之进墓。",
   "faction": "beast",
   "rarity": "B"
  },
  {
   "id": "GLD-G0007",
   "name": "夜枭钩爪",
   "sub": "SMILE能力者",
   "type": "move",
   "moveKind": "equip",
   "art": "BLACK-G9",
   "level": 3,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 300,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+300。装备留在场上，装备者离场时随之进墓。",
   "faction": "beast",
   "rarity": "S"
  },
  {
   "id": "GLD-G0008",
   "name": "时雨",
   "sub": "良业物",
   "type": "move",
   "moveKind": "equip",
   "art": "BLUE-G1",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 200,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+200。装备留在场上，装备者离场时随之进墓。",
   "faction": "navy",
   "rarity": "B"
  },
  {
   "id": "GLD-G0009",
   "name": "六式·铁块",
   "sub": "钢铁之躯",
   "type": "move",
   "moveKind": "equip",
   "art": "BLUE-G2",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "def",
      "amount": 100,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：DEF+100。装备留在场上，装备者离场时随之进墓。",
   "faction": "navy",
   "rarity": "A"
  },
  {
   "id": "GLD-G0010",
   "name": "花州",
   "sub": "达斯琪的名刀",
   "type": "move",
   "moveKind": "equip",
   "art": "BLUE-G3",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 200,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+200。装备留在场上，装备者离场时随之进墓。",
   "faction": "navy",
   "rarity": "B"
  },
  {
   "id": "GLD-G0011",
   "name": "冰军刀",
   "sub": "青雉的冰刃",
   "type": "move",
   "moveKind": "equip",
   "art": "BLUE-G4",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 200,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+200。装备留在场上，装备者离场时随之进墓。",
   "faction": "navy",
   "rarity": "B"
  },
  {
   "id": "GLD-G0012",
   "name": "海军披风",
   "sub": "正义之袍",
   "type": "move",
   "moveKind": "equip",
   "art": "BLUE-G5",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 100,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+100。装备留在场上，装备者离场时随之进墓。",
   "faction": "navy",
   "rarity": "A"
  },
  {
   "id": "GLD-G0013",
   "name": "苍波刃",
   "sub": "缉捕令",
   "type": "move",
   "moveKind": "equip",
   "art": "BLUE-G6",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 100,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+100。装备留在场上，装备者离场时随之进墓。",
   "faction": "navy",
   "rarity": "A"
  },
  {
   "id": "GLD-G0014",
   "name": "海军制式铳",
   "sub": "正义之师",
   "type": "move",
   "moveKind": "equip",
   "art": "BLUE-G7",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 200,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+200。装备留在场上，装备者离场时随之进墓。",
   "faction": "navy",
   "rarity": "B"
  },
  {
   "id": "GLD-G0015",
   "name": "冰河佩剑",
   "sub": "缉捕令",
   "type": "move",
   "moveKind": "equip",
   "art": "BLUE-G8",
   "level": 3,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 300,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+300。装备留在场上，装备者离场时随之进墓。",
   "faction": "navy",
   "rarity": "S"
  },
  {
   "id": "GLD-G0016",
   "name": "天羽羽斩",
   "sub": "和之国黑刀",
   "type": "move",
   "moveKind": "equip",
   "art": "GREEN-G1",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 200,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+200。装备留在场上，装备者离场时随之进墓。",
   "faction": "strawhat",
   "rarity": "B"
  },
  {
   "id": "GLD-G0017",
   "name": "电击毛皮",
   "sub": "毛皮族静电",
   "type": "move",
   "moveKind": "equip",
   "art": "GREEN-G2",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "def",
      "amount": 100,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：DEF+100。装备留在场上，装备者离场时随之进墓。",
   "faction": "strawhat",
   "rarity": "A"
  },
  {
   "id": "GLD-G0018",
   "name": "丛云刀",
   "sub": "无上大快刀",
   "type": "move",
   "moveKind": "equip",
   "art": "GREEN-G3",
   "level": 3,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 300,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+300。装备留在场上，装备者离场时随之进墓。",
   "faction": "strawhat",
   "rarity": "S"
  },
  {
   "id": "GLD-G0019",
   "name": "秋水",
   "sub": "龙马的遗刀",
   "type": "move",
   "moveKind": "equip",
   "art": "GREEN-G4",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 200,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+200。装备留在场上，装备者离场时随之进墓。",
   "faction": "strawhat",
   "rarity": "B"
  },
  {
   "id": "GLD-G0020",
   "name": "八卦金棒",
   "sub": "凯多的刺棒",
   "type": "move",
   "moveKind": "equip",
   "art": "GREEN-G5",
   "level": 3,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 200,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+200。装备留在场上，装备者离场时随之进墓。",
   "faction": "strawhat",
   "rarity": "B"
  },
  {
   "id": "GLD-G0021",
   "name": "黑兜",
   "sub": "乌索普的弹弓",
   "type": "move",
   "moveKind": "equip",
   "art": "GREEN-G6",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 100,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+100。装备留在场上，装备者离场时随之进墓。",
   "faction": "strawhat",
   "rarity": "A"
  },
  {
   "id": "GLD-G0022",
   "name": "翠林弓",
   "sub": "草帽一伙",
   "type": "move",
   "moveKind": "equip",
   "art": "GREEN-G7",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 100,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+100。装备留在场上，装备者离场时随之进墓。",
   "faction": "strawhat",
   "rarity": "A"
  },
  {
   "id": "GLD-G0023",
   "name": "兽王爪",
   "sub": "自由之海",
   "type": "move",
   "moveKind": "equip",
   "art": "GREEN-G8",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 200,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+200。装备留在场上，装备者离场时随之进墓。",
   "faction": "strawhat",
   "rarity": "B"
  },
  {
   "id": "GLD-G0024",
   "name": "巨树大盾",
   "sub": "冒险者",
   "type": "move",
   "moveKind": "equip",
   "art": "GREEN-G9",
   "level": 3,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 300,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+300。装备留在场上，装备者离场时随之进墓。",
   "faction": "strawhat",
   "rarity": "S"
  },
  {
   "id": "GLD-G0025",
   "name": "鬼哭",
   "sub": "诅咒之刀",
   "type": "move",
   "moveKind": "equip",
   "art": "PURPLE-G1",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 200,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+200。装备留在场上，装备者离场时随之进墓。",
   "faction": "warlord",
   "rarity": "B"
  },
  {
   "id": "GLD-G0026",
   "name": "天夜叉的墨镜",
   "sub": "多弗朗明戈",
   "type": "move",
   "moveKind": "equip",
   "art": "PURPLE-G4",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 100,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+100。装备留在场上，装备者离场时随之进墓。",
   "faction": "warlord",
   "rarity": "A"
  },
  {
   "id": "GLD-G0027",
   "name": "诅咒稻草人",
   "sub": "霍金斯的诅咒",
   "type": "move",
   "moveKind": "equip",
   "art": "PURPLE-G5",
   "level": 3,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 100,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+100。装备留在场上，装备者离场时随之进墓。",
   "faction": "warlord",
   "rarity": "A"
  },
  {
   "id": "GLD-G0028",
   "name": "紫电细剑",
   "sub": "暗流涌动",
   "type": "move",
   "moveKind": "equip",
   "art": "PURPLE-G6",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 100,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+100。装备留在场上，装备者离场时随之进墓。",
   "faction": "warlord",
   "rarity": "A"
  },
  {
   "id": "GLD-G0029",
   "name": "傀儡丝线",
   "sub": "王下七武海",
   "type": "move",
   "moveKind": "equip",
   "art": "PURPLE-G7",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 200,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+200。装备留在场上，装备者离场时随之进墓。",
   "faction": "warlord",
   "rarity": "B"
  },
  {
   "id": "GLD-G0030",
   "name": "暗影匕首",
   "sub": "王下七武海",
   "type": "move",
   "moveKind": "equip",
   "art": "PURPLE-G8",
   "level": 3,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 300,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+300。装备留在场上，装备者离场时随之进墓。",
   "faction": "warlord",
   "rarity": "S"
  },
  {
   "id": "GLD-G0031",
   "name": "三代鬼彻",
   "sub": "和之国妖刀",
   "type": "move",
   "moveKind": "equip",
   "art": "RED-G1",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 200,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+200。装备留在场上，装备者离场时随之进墓。",
   "faction": "strawhat",
   "rarity": "B"
  },
  {
   "id": "GLD-G0032",
   "name": "武装色·硬化",
   "sub": "全身武装",
   "type": "move",
   "moveKind": "equip",
   "art": "RED-G2",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "def",
      "amount": 100,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：DEF+100。装备留在场上，装备者离场时随之进墓。",
   "faction": "strawhat",
   "rarity": "A"
  },
  {
   "id": "GLD-G0033",
   "name": "和道一文字",
   "sub": "大快刀二十一工",
   "type": "move",
   "moveKind": "equip",
   "art": "RED-G3",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 200,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+200。装备留在场上，装备者离场时随之进墓。",
   "faction": "strawhat",
   "rarity": "B"
  },
  {
   "id": "GLD-G0034",
   "name": "阎魔",
   "sub": "御田的爱刀",
   "type": "move",
   "moveKind": "equip",
   "art": "RED-G4",
   "level": 3,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 300,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+300。装备留在场上，装备者离场时随之进墓。",
   "faction": "strawhat",
   "rarity": "S"
  },
  {
   "id": "GLD-G0035",
   "name": "雪走",
   "sub": "良业物·快刀",
   "type": "move",
   "moveKind": "equip",
   "art": "RED-G5",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 200,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+200。装备留在场上，装备者离场时随之进墓。",
   "faction": "strawhat",
   "rarity": "B"
  },
  {
   "id": "GLD-G0036",
   "name": "海楼石手铐",
   "sub": "果实封锁",
   "type": "move",
   "moveKind": "equip",
   "art": "RED-G6",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 100,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+100。装备留在场上，装备者离场时随之进墓。",
   "faction": "strawhat",
   "rarity": "A"
  },
  {
   "id": "GLD-G0037",
   "name": "烈焰短刀",
   "sub": "结盟",
   "type": "move",
   "moveKind": "equip",
   "art": "RED-G7",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 100,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+100。装备留在场上，装备者离场时随之进墓。",
   "faction": "supernova",
   "rarity": "A"
  },
  {
   "id": "GLD-G0038",
   "name": "赤犬军刀",
   "sub": "结盟",
   "type": "move",
   "moveKind": "equip",
   "art": "RED-G8",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 200,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+200。装备留在场上，装备者离场时随之进墓。",
   "faction": "supernova",
   "rarity": "B"
  },
  {
   "id": "GLD-G0039",
   "name": "革命火铳",
   "sub": "新星",
   "type": "move",
   "moveKind": "equip",
   "art": "RED-G9",
   "level": 3,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 300,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+300。装备留在场上，装备者离场时随之进墓。",
   "faction": "supernova",
   "rarity": "S"
  },
  {
   "id": "GLD-G0040",
   "name": "黑刀·夜",
   "sub": "世界最强黑刀",
   "type": "move",
   "moveKind": "equip",
   "art": "YELLOW-G1",
   "level": 3,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 300,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+300。装备留在场上，装备者离场时随之进墓。",
   "faction": "warlord",
   "rarity": "S"
  },
  {
   "id": "GLD-G0041",
   "name": "九蛇弓",
   "sub": "女帝护卫弓",
   "type": "move",
   "moveKind": "equip",
   "art": "YELLOW-G4",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 100,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+100。装备留在场上，装备者离场时随之进墓。",
   "faction": "warlord",
   "rarity": "A"
  },
  {
   "id": "GLD-G0042",
   "name": "威布尔巨斧",
   "sub": "白胡子二世战斧",
   "type": "move",
   "moveKind": "equip",
   "art": "YELLOW-G6",
   "level": 3,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 200,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+200。装备留在场上，装备者离场时随之进墓。",
   "faction": "yonko",
   "rarity": "B"
  },
  {
   "id": "GLD-G0043",
   "name": "雷光三节棍",
   "sub": "四皇麾下",
   "type": "move",
   "moveKind": "equip",
   "art": "YELLOW-G7",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 100,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+100。装备留在场上，装备者离场时随之进墓。",
   "faction": "yonko",
   "rarity": "A"
  },
  {
   "id": "GLD-G0044",
   "name": "天候棒·改",
   "sub": "四皇麾下",
   "type": "move",
   "moveKind": "equip",
   "art": "YELLOW-G8",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 200,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+200。装备留在场上，装备者离场时随之进墓。",
   "faction": "yonko",
   "rarity": "B"
  },
  {
   "id": "GLD-G0045",
   "name": "琥珀长弓",
   "sub": "亲卫队长",
   "type": "move",
   "moveKind": "equip",
   "art": "YELLOW-G9",
   "level": 3,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "equip",
      "stat": "atk",
      "amount": 300,
      "target": "chosen"
     }
    ]
   },
   "desc": "装备自己 1 名人物：ATK+300。装备留在场上，装备者离场时随之进墓。",
   "faction": "yonko",
   "rarity": "S"
  },
  {
   "id": "GLD-M0001",
   "name": "橡胶机关枪",
   "sub": "招式·蒙奇·D·路飞",
   "type": "move",
   "moveKind": "normal",
   "art": "RED-27",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 500
     }
    ]
   },
   "desc": "对对方 LP 造成 500 伤害。（路飞东海至伟大航路前期的常用连打招式，双手高速交替连击敌人）",
   "faction": "strawhat",
   "rarity": "S"
  },
  {
   "id": "GLD-M0002",
   "name": "火拳枪",
   "sub": "招式·蒙奇·D·路飞",
   "type": "move",
   "moveKind": "normal",
   "art": "RED-27",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 800
     }
    ]
   },
   "desc": "对对方 LP 造成 800 伤害。（路飞二档状态下继承艾斯之火的火拳枪（红狗），鱼人岛一击贯穿霍迪·琼斯）",
   "faction": "strawhat",
   "rarity": "SS"
  },
  {
   "id": "GLD-M0003",
   "name": "橡胶象枪",
   "sub": "招式·蒙奇·D·路飞·新世界",
   "type": "move",
   "moveKind": "normal",
   "art": "RED-118",
   "level": 3,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "atkDelta",
      "target": "chosen",
      "amount": 800,
      "until": "turn"
     }
    ]
   },
   "desc": "选自己 1 名人物：本回合 ATK+800。（路飞三档巨大化手臂的象枪，鱼人岛之战轰碎诺亚船体）",
   "faction": "strawhat",
   "rarity": "SS"
  },
  {
   "id": "GLD-M0004",
   "name": "三刀流奥义·三千世界",
   "sub": "招式·罗罗诺亚·索隆",
   "type": "move",
   "moveKind": "normal",
   "art": "RED-82",
   "level": 3,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "atkDelta",
      "target": "chosen",
      "amount": 800,
      "until": "turn"
     }
    ]
   },
   "desc": "选自己 1 名人物：本回合 ATK+800。（索隆三刀流居合奥义，阿拉巴斯坦对Mr.1斩铁之战的决胜一击）",
   "faction": "strawhat",
   "rarity": "SS"
  },
  {
   "id": "GLD-M0005",
   "name": "三刀流·鬼斩",
   "sub": "招式·罗罗诺亚·索隆",
   "type": "move",
   "moveKind": "normal",
   "art": "RED-82",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "atkDelta",
      "target": "chosen",
      "amount": 600,
      "until": "turn"
     }
    ]
   },
   "desc": "选自己 1 名人物：本回合 ATK+600。（索隆最常用的三刀流交叉斩击，东海时期起频繁使用）",
   "faction": "strawhat",
   "rarity": "S"
  },
  {
   "id": "GLD-M0006",
   "name": "恶魔风脚·画龙点睛 shoot",
   "sub": "招式·山治",
   "type": "move",
   "moveKind": "normal",
   "art": "GREEN-168",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 800
     }
    ]
   },
   "desc": "对对方 LP 造成 800 伤害。（山治恶魔风脚奥义，恐怖三桅帆船对奥兹的必杀踢击）",
   "faction": "strawhat",
   "rarity": "SS"
  },
  {
   "id": "GLD-M0007",
   "name": "雷霆时速",
   "sub": "招式·娜美",
   "type": "move",
   "moveKind": "normal",
   "art": "RED-172",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 500
     }
    ]
   },
   "desc": "对对方 LP 造成 500 伤害。（娜美天候棒经典组合，黑云与雷云相接落雷直击敌人（Thunderbolt Tempo））",
   "faction": "strawhat",
   "rarity": "S"
  },
  {
   "id": "GLD-M0008",
   "name": "旋风天候",
   "sub": "招式·娜美·新世界",
   "type": "move",
   "moveKind": "normal",
   "art": "GREEN-100",
   "level": 2,
   "effect": {
    "need": "foeUnitAtkPos",
    "ops": [
     {
      "op": "setPosDef",
      "target": "chosen"
     }
    ]
   },
   "desc": "将对方 1 名攻击表示的人物转为守备表示。（娜美天候棒Tempo系招式，旋风将敌人吹飞卷走（Cyclone Tempo））",
   "faction": "strawhat",
   "rarity": "S"
  },
  {
   "id": "GLD-M0009",
   "name": "必杀·火鸟星",
   "sub": "招式·乌索普",
   "type": "move",
   "moveKind": "normal",
   "art": "GREEN-28",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 500
     }
    ]
   },
   "desc": "对对方 LP 造成 500 伤害。（乌索普标志性火鸟形火药弹，多场战斗中的远程狙杀王牌）",
   "faction": "strawhat",
   "rarity": "S"
  },
  {
   "id": "GLD-M0010",
   "name": "百花缭乱",
   "sub": "招式·妮可·罗宾",
   "type": "move",
   "moveKind": "normal",
   "art": "GREEN-92",
   "level": 2,
   "effect": {
    "need": "foeUnitAtkPos",
    "ops": [
     {
      "op": "setPosDef",
      "target": "chosen"
     }
    ]
   },
   "desc": "将对方 1 名攻击表示的人物转为守备表示。（罗宾花花果实千手招式，多条手臂在敌人身上绽出将其缠住压制）",
   "faction": "strawhat",
   "rarity": "S"
  },
  {
   "id": "GLD-M0011",
   "name": "百花缭乱·大飞燕草",
   "sub": "招式·妮可·罗宾·新世界",
   "type": "move",
   "moveKind": "normal",
   "art": "GREEN-156",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 500
     }
    ]
   },
   "desc": "对对方 LP 造成 500 伤害。（罗宾对奥兹使用的千手合掌重击（Delphinium 大飞燕草））",
   "faction": "strawhat",
   "rarity": "S"
  },
  {
   "id": "GLD-M0012",
   "name": "风来炮",
   "sub": "招式·弗兰奇",
   "type": "move",
   "moveKind": "normal",
   "art": "BLUE-08",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 500
     }
    ]
   },
   "desc": "对对方 LP 造成 500 伤害。（弗兰奇将军鼻部发射的激光炮（Franky Radical Beam），鱼人岛一击贯穿对手）",
   "faction": "strawhat",
   "rarity": "S"
  },
  {
   "id": "GLD-M0013",
   "name": "鱼人空手道·枪波",
   "sub": "招式·甚平",
   "type": "move",
   "moveKind": "normal",
   "art": "BLUE-09",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 500
     }
    ]
   },
   "desc": "对对方 LP 造成 500 伤害。（甚平鱼人空手道远程水弹掌击，鱼人岛对霍迪·琼斯部下使用）",
   "faction": "strawhat",
   "rarity": "S"
  },
  {
   "id": "GLD-M0014",
   "name": "鱼人空手道·五千瓦正拳",
   "sub": "招式·甚平",
   "type": "move",
   "moveKind": "normal",
   "art": "BLUE-09",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "atkDelta",
      "target": "chosen",
      "amount": 600,
      "until": "turn"
     }
    ]
   },
   "desc": "选自己 1 名人物：本回合 ATK+600。（甚平五千枚瓦正拳，鱼人岛正面击破霍迪·琼斯的重拳）",
   "faction": "strawhat",
   "rarity": "S"
  },
  {
   "id": "GLD-M0015",
   "name": "鼻歌三丁·燕尾斩",
   "sub": "招式·布鲁克",
   "type": "move",
   "moveKind": "normal",
   "art": "BLUE-63",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "atkDelta",
      "target": "chosen",
      "amount": 600,
      "until": "turn"
     }
    ]
   },
   "desc": "选自己 1 名人物：本回合 ATK+600。（布鲁克居合斩成名技，恐怖三桅帆船与龙马对刀时使用）",
   "faction": "strawhat",
   "rarity": "S"
  },
  {
   "id": "GLD-M0016",
   "name": "狐火流·火焰斩",
   "sub": "招式·锦卫门",
   "type": "move",
   "moveKind": "normal",
   "art": "RED-44",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 500
     }
    ]
   },
   "desc": "对对方 LP 造成 500 伤害。（锦卫门狐火流剑技，火焰缠绕刀身斩烧敌人，和之国多次使用）",
   "faction": "strawhat",
   "rarity": "S"
  },
  {
   "id": "GLD-M0017",
   "name": "鸟笼",
   "sub": "招式·唐吉诃德·多弗朗明戈",
   "type": "move",
   "moveKind": "normal",
   "art": "PURPLE-30",
   "level": 2,
   "effect": {
    "need": "foeUnitAtkPos",
    "ops": [
     {
      "op": "setPosDef",
      "target": "chosen"
     }
    ]
   },
   "desc": "将对方 1 名攻击表示的人物转为守备表示。（明哥线线果实终极手段，无形线织成不断收缩的巨笼碾压德雷斯罗萨全岛）",
   "faction": "warlord",
   "rarity": "SS"
  },
  {
   "id": "GLD-M0018",
   "name": "手术ROOM·伽马刀",
   "sub": "招式·特拉法尔加·罗",
   "type": "move",
   "moveKind": "normal",
   "art": "YELLOW-124",
   "level": 3,
   "effect": {
    "need": "foeUnitAtkPos",
    "ops": [
     {
      "op": "destroy",
      "target": "chosen"
     }
    ]
   },
   "desc": "破坏对方 1 名攻击表示的人物。（罗在ROOM内凝聚的伽马能量刀，德雷斯罗萨一战刺穿明哥脏腑（Gamma Knife））",
   "faction": "warlord",
   "rarity": "SS"
  },
  {
   "id": "GLD-M0019",
   "name": "ROOM·交涉",
   "sub": "招式·特拉法尔加·罗",
   "type": "move",
   "moveKind": "normal",
   "art": "YELLOW-124",
   "level": 1,
   "effect": {
    "ops": [
     {
      "op": "deckSearch",
      "filter": {
       "faction": "warlord"
      }
     }
    ]
   },
   "desc": "从牌组检索 1 张同阵营卡加入手牌。（罗手术果实Shambles（交涉），ROOM内随意调换物体与人的位置，庞克哈萨特反复使用）",
   "faction": "warlord",
   "rarity": "S"
  },
  {
   "id": "GLD-M0020",
   "name": "ROOM·扫描",
   "sub": "招式·特拉法尔加·罗·王下",
   "type": "move",
   "moveKind": "normal",
   "art": "PURPLE-171",
   "level": 2,
   "effect": {
    "ops": [
     {
      "op": "draw",
      "amount": 1
     }
    ]
   },
   "desc": "抽 1 张牌。（罗手术果实Scan（扫描），不接触即可取走ROOM内目标物，曾用来交换斯摩格心脏）",
   "faction": "warlord",
   "rarity": "A"
  },
  {
   "id": "GLD-M0021",
   "name": "沙漠宝刀",
   "sub": "招式·沙尔·克洛克达尔",
   "type": "move",
   "moveKind": "normal",
   "art": "PURPLE-158",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 500
     }
    ]
   },
   "desc": "对对方 LP 造成 500 伤害。（克洛克达尔沙沙果实剑状沙漠波浪，阿拉巴斯坦连斩路飞（Desert Spada））",
   "faction": "warlord",
   "rarity": "S"
  },
  {
   "id": "GLD-M0022",
   "name": "沙漠向日葵",
   "sub": "招式·克洛克达尔",
   "type": "move",
   "moveKind": "normal",
   "art": "YELLOW-38",
   "level": 3,
   "effect": {
    "need": "foeUnitMax1200",
    "ops": [
     {
      "op": "destroy",
      "target": "chosen"
     }
    ]
   },
   "desc": "破坏对方 1 名 ATK1200 以下的人物。（克洛克达尔令大地旋出巨型流沙坑的招式，将路飞埋入地底（Desert Girasole））",
   "faction": "warlord",
   "rarity": "S"
  },
  {
   "id": "GLD-M0023",
   "name": "俘虏之箭",
   "sub": "招式·波雅·汉库珂",
   "type": "move",
   "moveKind": "normal",
   "art": "BLUE-68",
   "level": 2,
   "effect": {
    "need": "foeUnitAtkPos",
    "ops": [
     {
      "op": "setPosDef",
      "target": "chosen"
     }
    ]
   },
   "desc": "将对方 1 名攻击表示的人物转为守备表示。（汉库珂甜甜果实的石化之箭，被射中者化为石头，顶上战争对海军使用（Slave Arrow））",
   "faction": "warlord",
   "rarity": "S"
  },
  {
   "id": "GLD-M0024",
   "name": "熊掌冲击",
   "sub": "招式·巴索罗缪·熊",
   "type": "move",
   "moveKind": "normal",
   "art": "YELLOW-49",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 500
     }
    ]
   },
   "desc": "对对方 LP 造成 500 伤害。（熊肉球果实压缩空气释放的巨大冲击波，恐怖三桅帆船重创草帽团全员（Ursus Shock））",
   "faction": "warlord",
   "rarity": "S"
  },
  {
   "id": "GLD-M0025",
   "name": "拍飞",
   "sub": "招式·巴索罗缪·熊·王下",
   "type": "move",
   "moveKind": "normal",
   "art": "YELLOW-64",
   "level": 2,
   "effect": {
    "need": "foeUnitAtkPos",
    "ops": [
     {
      "op": "setPosDef",
      "target": "chosen"
     }
    ]
   },
   "desc": "将对方 1 名攻击表示的人物转为守备表示。（熊以肉球弹力将目标拍飞三天三夜，恐怖三桅帆船把草帽团全员弹散至世界各地）",
   "faction": "warlord",
   "rarity": "A"
  },
  {
   "id": "GLD-M0026",
   "name": "影之集合地",
   "sub": "招式·月光·莫利亚",
   "type": "move",
   "moveKind": "normal",
   "art": "PURPLE-145",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "atkDelta",
      "target": "chosen",
      "amount": 600,
      "until": "turn"
     }
    ]
   },
   "desc": "选自己 1 名人物：本回合 ATK+600。（莫利亚吞噬千影化为影魔人的强化形态，恐怖三桅帆船对路飞使用（Shadows Asgard））",
   "faction": "warlord",
   "rarity": "S"
  },
  {
   "id": "GLD-M0027",
   "name": "巴基玉",
   "sub": "招式·巴基",
   "type": "move",
   "moveKind": "normal",
   "art": "PURPLE-103",
   "level": 2,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 300
     }
    ]
   },
   "desc": "对对方 LP 造成 300 伤害。（巴基的特制巨型炮弹巴基玉，罗格镇轰击处刑台救下路飞）",
   "faction": "warlord",
   "rarity": "A"
  },
  {
   "id": "GLD-M0028",
   "name": "武器变身·镰女",
   "sub": "招式·贝比5",
   "type": "move",
   "moveKind": "normal",
   "art": "BLUE-81",
   "level": 2,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 300
     }
    ]
   },
   "desc": "对对方 LP 造成 300 伤害。（贝比5武器果实变化为镰刀形态作战（镰女 Sickle Girl），德雷斯罗萨登场）",
   "faction": "warlord",
   "rarity": "A"
  },
  {
   "id": "GLD-M0029",
   "name": "枪吻",
   "sub": "招式·九蛇岛的守护 汉库珂&玛格丽特",
   "type": "move",
   "moveKind": "normal",
   "art": "YELLOW-29",
   "level": 2,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 300
     }
    ]
   },
   "desc": "对对方 LP 造成 300 伤害。（汉库珂甜甜果实的手指气弹之吻，亚马逊百合对路飞使用（Pistol Kiss））",
   "faction": "warlord",
   "rarity": "A"
  },
  {
   "id": "GLD-M0030",
   "name": "覇海",
   "sub": "招式·万国的威压 玲玲&斯慕吉",
   "type": "move",
   "moveKind": "normal",
   "art": "YELLOW-20",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 800
     }
    ]
   },
   "desc": "对对方 LP 造成 800 伤害。（BIG MOM普罗米修斯与宙斯合体的魂之奔流，鬼岛决战重创基德与罗）",
   "faction": "warlord",
   "rarity": "SS"
  },
  {
   "id": "GLD-M0031",
   "name": "天丛云剑",
   "sub": "招式·波尔萨利诺",
   "type": "move",
   "moveKind": "normal",
   "art": "BLUE-30",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "atkDelta",
      "target": "chosen",
      "amount": 600,
      "until": "turn"
     }
    ]
   },
   "desc": "选自己 1 名人物：本回合 ATK+600。（黄猿光光果实凝成的光之太刀，顶上战争与雷利对斩（天之丛云））",
   "faction": "navy",
   "rarity": "S"
  },
  {
   "id": "GLD-M0032",
   "name": "八尺琼勾玉",
   "sub": "招式·波尔萨利诺·大将",
   "type": "move",
   "moveKind": "normal",
   "art": "BLUE-99",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 500
     }
    ]
   },
   "desc": "对对方 LP 造成 500 伤害。（黄猿的光弹连射，顶上战争对白胡子海贼团倾泻而下的弹幕（Yasakani no Magatama））",
   "faction": "navy",
   "rarity": "S"
  },
  {
   "id": "GLD-M0033",
   "name": "流星火山",
   "sub": "招式·萨卡斯基",
   "type": "move",
   "moveKind": "normal",
   "art": "RED-19",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 800
     }
    ]
   },
   "desc": "对对方 LP 造成 800 伤害。（赤犬岩浆果实双拳化作陨石雨轰落，顶上战争大范围碾压白胡子海贼团（Meigo 流星火山））",
   "faction": "navy",
   "rarity": "SS"
  },
  {
   "id": "GLD-M0034",
   "name": "大喷火",
   "sub": "招式·萨卡斯基·大将",
   "type": "move",
   "moveKind": "normal",
   "art": "GREEN-144",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 500
     }
    ]
   },
   "desc": "对对方 LP 造成 500 伤害。（赤犬喷出的巨型岩浆火拳，顶上战争与白胡子正面互轰（大成火））",
   "faction": "navy",
   "rarity": "S"
  },
  {
   "id": "GLD-M0035",
   "name": "冰河时代",
   "sub": "招式·库赞",
   "type": "move",
   "moveKind": "normal",
   "art": "BLUE-106",
   "level": 2,
   "effect": {
    "need": "foeUnitAtkPos",
    "ops": [
     {
      "op": "setPosDef",
      "target": "chosen"
     }
    ]
   },
   "desc": "将对方 1 名攻击表示的人物转为守备表示。（青雉冻结整片海域的大招，奥哈拉与长环岛两次封锁海洋（Ice Age））",
   "faction": "navy",
   "rarity": "S"
  },
  {
   "id": "GLD-M0036",
   "name": "猛虎",
   "sub": "招式·一笑",
   "type": "move",
   "moveKind": "normal",
   "art": "YELLOW-119",
   "level": 2,
   "effect": {
    "need": "foeUnitAtkPos",
    "ops": [
     {
      "op": "setPosDef",
      "target": "chosen"
     }
    ]
   },
   "desc": "将对方 1 名攻击表示的人物转为守备表示。（藤虎重重果实的猛虎重力压制，德雷斯罗萨对路飞施放压场）",
   "faction": "navy",
   "rarity": "S"
  },
  {
   "id": "GLD-M0037",
   "name": "陨石召唤",
   "sub": "招式·一笑·大将",
   "type": "move",
   "moveKind": "normal",
   "art": "BLACK-119",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 800
     }
    ]
   },
   "desc": "对对方 LP 造成 800 伤害。（藤虎以引力从天外拉落陨石，德雷斯罗萨召落庞克哈萨特的名场面）",
   "faction": "navy",
   "rarity": "SS"
  },
  {
   "id": "GLD-M0038",
   "name": "拳骨陨石",
   "sub": "招式·蒙奇·D·卡普",
   "type": "move",
   "moveKind": "normal",
   "art": "BLUE-167",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 500
     }
    ]
   },
   "desc": "对对方 LP 造成 500 伤害。（卡普手掷巨大铁球的轰击，顶上战争对白胡子海贼团投掷（拳骨系必杀））",
   "faction": "navy",
   "rarity": "S"
  },
  {
   "id": "GLD-M0039",
   "name": "冲击波",
   "sub": "招式·战国",
   "type": "move",
   "moveKind": "normal",
   "art": "BLACK-149",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 500
     }
    ]
   },
   "desc": "对对方 LP 造成 500 伤害。（佛之战国金身形态放出的冲击波，顶上战争一击轰飞黑胡子海贼团）",
   "faction": "navy",
   "rarity": "S"
  },
  {
   "id": "GLD-M0040",
   "name": "白蛇",
   "sub": "招式·斯摩格",
   "type": "move",
   "moveKind": "normal",
   "art": "YELLOW-170",
   "level": 2,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 300
     }
    ]
   },
   "desc": "对对方 LP 造成 300 伤害。（斯摩格烟烟果实化作白蛇状的缠绕冲击，罗格镇与顶上战争对路飞使用）",
   "faction": "navy",
   "rarity": "A"
  },
  {
   "id": "GLD-M0041",
   "name": "剃",
   "sub": "招式·克比",
   "type": "move",
   "moveKind": "normal",
   "art": "PURPLE-72",
   "level": 2,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 300
     }
    ]
   },
   "desc": "对对方 LP 造成 300 伤害。（海军六式之剃，高速瞬步突进，克比两年修行中习得并在顶上战争使用）",
   "faction": "navy",
   "rarity": "A"
  },
  {
   "id": "GLD-M0042",
   "name": "毒龙",
   "sub": "招式·麦哲伦",
   "type": "move",
   "moveKind": "normal",
   "art": "BLACK-31",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 500
     }
    ]
   },
   "desc": "对对方 LP 造成 500 伤害。（麦哲伦毒毒果实的三头毒龙，推进城追击路飞越狱一行（Hydra））",
   "faction": "navy",
   "rarity": "S"
  },
  {
   "id": "GLD-M0043",
   "name": "雷鸣八卦",
   "sub": "招式·凯多",
   "type": "move",
   "moveKind": "normal",
   "art": "GREEN-12",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 800
     }
    ]
   },
   "desc": "对对方 LP 造成 800 伤害。（凯多狼牙棒一击携雷的招牌技，和之国一棒击溃路飞（923话））",
   "faction": "beast",
   "rarity": "SS"
  },
  {
   "id": "GLD-M0044",
   "name": "热息",
   "sub": "招式·凯多",
   "type": "move",
   "moveKind": "normal",
   "art": "GREEN-12",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 500
     }
    ]
   },
   "desc": "对对方 LP 造成 500 伤害。（凯多青龙形态口中喷出的火球轰炸，鬼岛对锦卫门等赤鞘武士使用（Bolo Breath））",
   "faction": "beast",
   "rarity": "S"
  },
  {
   "id": "GLD-M0045",
   "name": "降三世引奈落",
   "sub": "招式·凯多·百兽海贼团",
   "type": "move",
   "moveKind": "normal",
   "art": "BLACK-133",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 800
     }
    ]
   },
   "desc": "对对方 LP 造成 800 伤害。（凯多龙形态的雷云大招，鬼岛决战轰向大和的巨大雷束）",
   "faction": "beast",
   "rarity": "SS"
  },
  {
   "id": "GLD-M0046",
   "name": "黑穴",
   "sub": "招式·马歇尔·D·蒂奇",
   "type": "move",
   "moveKind": "normal",
   "art": "BLACK-26",
   "level": 3,
   "effect": {
    "need": "foeUnitAtkPos",
    "ops": [
     {
      "op": "destroy",
      "target": "chosen"
     }
    ]
   },
   "desc": "破坏对方 1 名攻击表示的人物。（黑胡子黑暗果实吞噬一切的黑洞，巴纳罗岛吸碎艾斯的火焰（Black Hole））",
   "faction": "beast",
   "rarity": "SS"
  },
  {
   "id": "GLD-M0047",
   "name": "暗水",
   "sub": "招式·马歇尔·D·蒂奇",
   "type": "move",
   "moveKind": "normal",
   "art": "BLACK-26",
   "level": 2,
   "effect": {
    "need": "foeUnitAtkPos",
    "ops": [
     {
      "op": "setPosDef",
      "target": "chosen"
     }
    ]
   },
   "desc": "将对方 1 名攻击表示的人物转为守备表示。（黑胡子的黑暗引力将敌人强行拉近身侧，巴纳罗岛把艾斯拉到近身（Kurouzu））",
   "faction": "beast",
   "rarity": "A"
  },
  {
   "id": "GLD-M0048",
   "name": "解放",
   "sub": "招式·黑团双巨头 蒂奇&希留",
   "type": "move",
   "moveKind": "normal",
   "art": "BLACK-26",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 500
     }
    ]
   },
   "desc": "对对方 LP 造成 500 伤害。（黑胡子将黑穴吞噬之物反向喷出的破坏洪流，巴纳罗岛对艾斯释放）",
   "faction": "beast",
   "rarity": "S"
  },
  {
   "id": "GLD-M0049",
   "name": "炎皇",
   "sub": "招式·金",
   "type": "move",
   "moveKind": "normal",
   "art": "GREEN-08",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 500
     }
    ]
   },
   "desc": "对对方 LP 造成 500 伤害。（KING月月族火焰操纵的火焰拳，鬼岛对索隆使用（Andon 炎皇））",
   "faction": "beast",
   "rarity": "S"
  },
  {
   "id": "GLD-M0050",
   "name": "火龙皇",
   "sub": "招式·金·百兽海贼团",
   "type": "move",
   "moveKind": "normal",
   "art": "PURPLE-116",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 800
     }
    ]
   },
   "desc": "对对方 LP 造成 800 伤害。（KING翼龙形态喷出烈焰龙卷的必杀，鬼岛对索隆决胜（Karyudon 火龙皇））",
   "faction": "beast",
   "rarity": "SS"
  },
  {
   "id": "GLD-M0051",
   "name": "冰鬼",
   "sub": "招式·奎因",
   "type": "move",
   "moveKind": "normal",
   "art": "GREEN-38",
   "level": 2,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 300
     }
    ]
   },
   "desc": "对对方 LP 造成 300 伤害。（奎因发射的瘟祸弹奇病冰鬼，鬼岛宴会让感染者全身冰冻失控（Ice Oni））",
   "faction": "beast",
   "rarity": "A"
  },
  {
   "id": "GLD-M0052",
   "name": "地狱审判",
   "sub": "招式·海底监狱的铁壁 麦哲伦&汉尼拔",
   "type": "move",
   "moveKind": "normal",
   "art": "BLACK-31",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 800
     }
    ]
   },
   "desc": "对对方 LP 造成 800 伤害。（麦哲伦奥义毒之巨兵，推进城LEVEL4对黑胡子海贼团轰杀（地狱之审判））",
   "faction": "beast",
   "rarity": "SS"
  },
  {
   "id": "GLD-M0053",
   "name": "海震",
   "sub": "招式·白胡子",
   "type": "move",
   "moveKind": "normal",
   "art": "GREEN-10",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 800
     }
    ]
   },
   "desc": "对对方 LP 造成 800 伤害。（白胡子震震果实掀翻海洋的大招，顶上战争开场两击掀起巨型海啸）",
   "faction": "whitebeard",
   "rarity": "SS"
  },
  {
   "id": "GLD-M0054",
   "name": "火拳",
   "sub": "招式·艾斯",
   "type": "move",
   "moveKind": "normal",
   "art": "RED-08",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 800
     }
    ]
   },
   "desc": "对对方 LP 造成 800 伤害。（艾斯烧烧果实成名技巨型火焰拳，阿拉巴斯坦与顶上战争的标志性大招）",
   "faction": "whitebeard",
   "rarity": "SS"
  },
  {
   "id": "GLD-M0055",
   "name": "十字火",
   "sub": "招式·波特卡斯·D·艾斯",
   "type": "move",
   "moveKind": "normal",
   "art": "RED-29",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 500
     }
    ]
   },
   "desc": "对对方 LP 造成 500 伤害。（艾斯十字交汇的火焰弹，巴纳罗岛对黑胡子使用（十字火））",
   "faction": "whitebeard",
   "rarity": "S"
  },
  {
   "id": "GLD-M0056",
   "name": "大炎戒·炎帝",
   "sub": "招式·波特卡斯·D·艾斯·一番队",
   "type": "move",
   "moveKind": "normal",
   "art": "RED-72",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 800
     }
    ]
   },
   "desc": "对对方 LP 造成 800 伤害。（艾斯最强奥义旋涡状巨大日轮，对黑胡子之战的全力一击（大炎戒 炎帝））",
   "faction": "whitebeard",
   "rarity": "SS"
  },
  {
   "id": "GLD-M0057",
   "name": "桃源白泷",
   "sub": "招式·光月御田",
   "type": "move",
   "moveKind": "normal",
   "art": "RED-39",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "atkDelta",
      "target": "chosen",
      "amount": 600,
      "until": "turn"
     }
    ]
   },
   "desc": "选自己 1 名人物：本回合 ATK+600。（御田缠绕武装色的双刀斩击，曾将巨大山神一刀两断（桃源白泷））",
   "faction": "whitebeard",
   "rarity": "S"
  },
  {
   "id": "GLD-M0058",
   "name": "桃源十拳",
   "sub": "招式·光月御田",
   "type": "move",
   "moveKind": "normal",
   "art": "RED-39",
   "level": 3,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "atkDelta",
      "target": "chosen",
      "amount": 800,
      "until": "turn"
     }
    ]
   },
   "desc": "选自己 1 名人物：本回合 ATK+800。（御田双刀流奥义，在四皇凯多身上划出十字伤疤的传说一刀（桃源十拳））",
   "faction": "whitebeard",
   "rarity": "SS"
  },
  {
   "id": "GLD-M0059",
   "name": "凤凰印",
   "sub": "招式·马尔科",
   "type": "move",
   "moveKind": "normal",
   "art": "BLUE-59",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 500
     }
    ]
   },
   "desc": "对对方 LP 造成 500 伤害。（马尔科不死鸟蓝炎的爪踢，顶上战争踹飞青雉（凤凰印））",
   "faction": "whitebeard",
   "rarity": "S"
  },
  {
   "id": "GLD-M0060",
   "name": "青炎雁",
   "sub": "招式·马尔科·一番队",
   "type": "move",
   "moveKind": "normal",
   "art": "RED-155",
   "level": 2,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 300
     }
    ]
   },
   "desc": "对对方 LP 造成 300 伤害。（马尔科蓝色火焰的连续踢击招式（Blue Bird 青炎雁））",
   "faction": "whitebeard",
   "rarity": "A"
  },
  {
   "id": "GLD-M0061",
   "name": "闪亮冲击",
   "sub": "招式·乔兹",
   "type": "move",
   "moveKind": "normal",
   "art": "GREEN-161",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 500
     }
    ]
   },
   "desc": "对对方 LP 造成 500 伤害。（乔兹闪耀果实全身钻石化的冲撞，顶上战争撞伤克洛克达尔（闪亮冲击））",
   "faction": "whitebeard",
   "rarity": "S"
  },
  {
   "id": "GLD-M0062",
   "name": "电磁炮",
   "sub": "招式·尤斯塔斯·基德",
   "type": "move",
   "moveKind": "normal",
   "art": "GREEN-93",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 800
     }
    ]
   },
   "desc": "对对方 LP 造成 800 伤害。（基德以磁气组成巨型磁轨炮轰出炮弹，鬼岛决战重创BIG MOM（Damned Punk））",
   "faction": "supernova",
   "rarity": "SS"
  },
  {
   "id": "GLD-M0063",
   "name": "磁气大魔牛",
   "sub": "招式·尤斯塔斯·基德",
   "type": "move",
   "moveKind": "normal",
   "art": "GREEN-93",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 500
     }
    ]
   },
   "desc": "对对方 LP 造成 500 伤害。（基德用磁气吸铁组成巨型金属牛冲撞，鬼岛对BIG MOM使用（Punk Corna Dio））",
   "faction": "supernova",
   "rarity": "S"
  },
  {
   "id": "GLD-M0064",
   "name": "磁气魔人",
   "sub": "招式·尤斯塔斯·基德·最恶世代",
   "type": "move",
   "moveKind": "normal",
   "art": "RED-164",
   "level": 3,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "atkDelta",
      "target": "chosen",
      "amount": 800,
      "until": "turn"
     }
    ]
   },
   "desc": "选自己 1 名人物：本回合 ATK+800。（基德吸附铁器组成恶魔外型巨大魔人并肩作战，鬼岛决战BIG MOM（Punk Rotten））",
   "faction": "supernova",
   "rarity": "SS"
  },
  {
   "id": "GLD-M0065",
   "name": "斩首爪",
   "sub": "招式·基拉",
   "type": "move",
   "moveKind": "normal",
   "art": "PURPLE-06",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "atkDelta",
      "target": "chosen",
      "amount": 600,
      "until": "turn"
     }
    ]
   },
   "desc": "选自己 1 名人物：本回合 ATK+600。（基拉双镰刀的斩首爪连击，鬼岛决战配合基德作战）",
   "faction": "supernova",
   "rarity": "S"
  },
  {
   "id": "GLD-M0066",
   "name": "X·猛击",
   "sub": "招式·X·德雷克",
   "type": "move",
   "moveKind": "normal",
   "art": "GREEN-105",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 500
     }
    ]
   },
   "desc": "对对方 LP 造成 500 伤害。（德雷克异特龙形态以尾锤猛击对手（X Caliber））",
   "faction": "supernova",
   "rarity": "S"
  },
  {
   "id": "GLD-M0067",
   "name": "降魔之相",
   "sub": "招式·霍金斯",
   "type": "move",
   "moveKind": "normal",
   "art": "PURPLE-32",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "atkDelta",
      "target": "chosen",
      "amount": 600,
      "until": "turn"
     }
    ]
   },
   "desc": "选自己 1 名人物：本回合 ATK+600。（霍金斯以稻草化身巨大稻草魔人的形态，对索隆与基德使用（降魔之相））",
   "faction": "supernova",
   "rarity": "S"
  },
  {
   "id": "GLD-M0068",
   "name": "因果展现",
   "sub": "招式·乌尔基",
   "type": "move",
   "moveKind": "normal",
   "art": "RED-87",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "atkDelta",
      "target": "chosen",
      "amount": 600,
      "until": "turn"
     }
    ]
   },
   "desc": "选自己 1 名人物：本回合 ATK+600。（乌尔基将承受的伤害转化为力量巨大化反击，香波地对和平主义者使用（因果晒））",
   "faction": "supernova",
   "rarity": "S"
  },
  {
   "id": "GLD-M0069",
   "name": "龙爪拳",
   "sub": "招式·萨波",
   "type": "move",
   "moveKind": "normal",
   "art": "GREEN-98",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "atkDelta",
      "target": "chosen",
      "amount": 600,
      "until": "turn"
     }
    ]
   },
   "desc": "选自己 1 名人物：本回合 ATK+600。（萨博龙爪拳基本技，三根龙爪手势捏碎刀剑与钢铁，德雷斯罗萨展示）",
   "faction": "supernova",
   "rarity": "S"
  },
  {
   "id": "GLD-M0070",
   "name": "燃烧的龙爪拳·火焰龙王",
   "sub": "招式·萨波",
   "type": "move",
   "moveKind": "normal",
   "art": "GREEN-98",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 800
     }
    ]
   },
   "desc": "对对方 LP 造成 800 伤害。（萨博继承艾斯烧烧果实后的火焰龙爪复合技，德岛决战对藤虎使用）",
   "faction": "supernova",
   "rarity": "SS"
  },
  {
   "id": "GLD-M0071",
   "name": "神避",
   "sub": "招式·哥尔·D·罗杰",
   "type": "move",
   "moveKind": "normal",
   "art": "RED-37",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 800
     }
    ]
   },
   "desc": "对对方 LP 造成 800 伤害。（罗杰以无上大快刀艾斯挥出的一击将光月御田打飞，966话霸王色对撞名场面（神避））",
   "faction": "yonko",
   "rarity": "SS"
  },
  {
   "id": "GLD-M0072",
   "name": "威国",
   "sub": "招式·夏洛特·玲玲",
   "type": "move",
   "moveKind": "normal",
   "art": "YELLOW-41",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 800
     }
    ]
   },
   "desc": "对对方 LP 造成 800 伤害。（BIG MOM骑乘雷云宙斯放出的雷霆轰击，鬼岛对基德使用（威国））",
   "faction": "yonko",
   "rarity": "SS"
  },
  {
   "id": "GLD-M0073",
   "name": "力饼",
   "sub": "招式·卡塔库栗",
   "type": "move",
   "moveKind": "normal",
   "art": "RED-63",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "atkDelta",
      "target": "chosen",
      "amount": 600,
      "until": "turn"
     }
    ]
   },
   "desc": "选自己 1 名人物：本回合 ATK+600。（卡塔库栗年糕果实硬化巨锤拳，万国镜界对路飞连击（力饼））",
   "faction": "yonko",
   "rarity": "S"
  },
  {
   "id": "GLD-M0074",
   "name": "无双甜甜圈",
   "sub": "招式·卡塔库栗",
   "type": "move",
   "moveKind": "normal",
   "art": "RED-63",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 500
     }
    ]
   },
   "desc": "对对方 LP 造成 500 伤害。（卡塔库栗年糕多臂连环拳，万国篇对路飞的压制连击（无双甜甜圈））",
   "faction": "yonko",
   "rarity": "S"
  },
  {
   "id": "GLD-M0075",
   "name": "雷迎",
   "sub": "招式·艾涅尔",
   "type": "move",
   "moveKind": "normal",
   "art": "YELLOW-36",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 800
     }
    ]
   },
   "desc": "对对方 LP 造成 800 伤害。（艾涅尔轰落的巨大雷球毁灭一切，空岛对路飞的终极一击（El Thor 雷迎））",
   "faction": "yonko",
   "rarity": "SS"
  },
  {
   "id": "GLD-M0076",
   "name": "万雷",
   "sub": "招式·艾涅尔",
   "type": "move",
   "moveKind": "normal",
   "art": "YELLOW-36",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 500
     }
    ]
   },
   "desc": "对对方 LP 造成 500 伤害。（艾涅尔借方舟箴言的雷云放出超广范围落雷轰击（Mamaragan 万雷））",
   "faction": "yonko",
   "rarity": "S"
  },
  {
   "id": "GLD-M0077",
   "name": "死亡眨眼",
   "sub": "招式·安布里奥·伊万科夫",
   "type": "move",
   "moveKind": "normal",
   "art": "BLACK-104",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 500
     }
    ]
   },
   "desc": "对对方 LP 造成 500 伤害。（伊万科夫荷尔蒙果实的眨眼冲击爆风，推进城对狱卒兽使用（DEATH WINK））",
   "faction": "revolutionary",
   "rarity": "S"
  },
  {
   "id": "GLD-M0078",
   "name": "地狱眨眼",
   "sub": "招式·安布里奥·伊万科夫·革命军",
   "type": "move",
   "moveKind": "normal",
   "art": "BLUE-142",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 800
     }
    ]
   },
   "desc": "对对方 LP 造成 800 伤害。（伊万科夫颜面成长荷尔蒙强化后的地狱级眨眼冲击波，顶上战争对赤犬（HELL WINK））",
   "faction": "revolutionary",
   "rarity": "SS"
  },
  {
   "id": "GLD-M0079",
   "name": "银河眨眼",
   "sub": "招式·伊万科夫",
   "type": "move",
   "moveKind": "normal",
   "art": "RED-20",
   "level": 3,
   "effect": {
    "ops": [
     {
      "op": "damage",
      "amount": 800
     }
    ]
   },
   "desc": "对对方 LP 造成 800 伤害。（伊万科夫GANMEN残像状态下无数分身同时眨眼的终极连击，推进城使用（银河WINK））",
   "faction": "revolutionary",
   "rarity": "SS"
  },
  {
   "id": "GLD-M0080",
   "name": "龙之钩爪",
   "sub": "招式·萨博·革命军",
   "type": "move",
   "moveKind": "normal",
   "art": "BLUE-86",
   "level": 2,
   "effect": {
    "need": "ownUnit",
    "ops": [
     {
      "op": "atkDelta",
      "target": "chosen",
      "amount": 600,
      "until": "turn"
     }
    ]
   },
   "desc": "选自己 1 名人物：本回合 ATK+600。（萨博武装色缠绕高速冲刺的龙爪重击，德雷斯罗萨对藤虎使用（龙之钩爪））",
   "faction": "revolutionary",
   "rarity": "S"
  },
  {
   "id": "GLD-T0001",
   "name": "橡胶气球",
   "sub": "伏笔·蒙奇·D·路飞",
   "type": "trap",
   "art": "RED-27",
   "triggers": [
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "negateAttack"
     },
     {
      "op": "damage",
      "amount": 300
     }
    ]
   },
   "desc": "对方直接攻击时：无效该攻击，并给予对方 LP 300 伤害。（路飞鼓起肚子弹开攻击的防御招式，东海起多次硬接炮弹与拳击并反弹）",
   "faction": "strawhat",
   "rarity": "A"
  },
  {
   "id": "GLD-T0002",
   "name": "烦恼风",
   "sub": "伏笔·罗罗诺亚·索隆",
   "type": "trap",
   "art": "RED-82",
   "triggers": [
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "negateAttack"
     },
     {
      "op": "damage",
      "amount": 300
     }
    ]
   },
   "desc": "对方直接攻击时：无效该攻击，并给予对方 LP 300 伤害。（索隆挥刀射出的飞行斩击波，可远程迎击来敌（烦恼风））",
   "faction": "strawhat",
   "rarity": "A"
  },
  {
   "id": "GLD-T0003",
   "name": "黑云天候",
   "sub": "伏笔·娜美",
   "type": "trap",
   "art": "RED-172",
   "triggers": [
    "onAttacked",
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "atkDelta",
      "target": "attacker",
      "amount": -600,
      "until": "battle"
     }
    ]
   },
   "desc": "对方攻击宣言时：该攻击人物 ATK-600 直至战斗阶段结束。（娜美天候棒制造黑云与雷云的组合云层，伏击接近之敌并接雷霆时速）",
   "faction": "strawhat",
   "rarity": "S"
  },
  {
   "id": "GLD-T0004",
   "name": "雾天候",
   "sub": "伏笔·娜美·新世界",
   "type": "trap",
   "art": "GREEN-100",
   "triggers": [
    "onAttacked",
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "atkDelta",
      "target": "attacker",
      "amount": -400,
      "until": "battle"
     }
    ]
   },
   "desc": "对方攻击宣言时：该攻击人物 ATK-400 直至战斗阶段结束。（娜美天候棒制造的浓雾迷惑敌人视线，恐怖三桅帆船与空岛多次脱身使用（Fog Tempo））",
   "faction": "strawhat",
   "rarity": "A"
  },
  {
   "id": "GLD-T0005",
   "name": "绿星·恶魔",
   "sub": "伏笔·乌索普",
   "type": "trap",
   "art": "GREEN-28",
   "triggers": [
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "negateAttack"
     },
     {
      "op": "damage",
      "amount": 300
     }
    ]
   },
   "desc": "对方直接攻击时：无效该攻击，并给予对方 LP 300 伤害。（乌索普波普格林的食人植物恶魔，pop green种子瞬间长成咬噬敌人的食人草）",
   "faction": "strawhat",
   "rarity": "A"
  },
  {
   "id": "GLD-T0006",
   "name": "绿星·拉夫雷西亚",
   "sub": "伏笔·乌索普",
   "type": "trap",
   "art": "GREEN-28",
   "triggers": [
    "onAttacked",
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "atkDelta",
      "target": "attacker",
      "amount": -400,
      "until": "battle"
     }
    ]
   },
   "desc": "对方攻击宣言时：该攻击人物 ATK-400 直至战斗阶段结束。（乌索普波普格林的巨大腐臭花拉夫雷西亚，臭气削弱周围敌人）",
   "faction": "strawhat",
   "rarity": "A"
  },
  {
   "id": "GLD-T0007",
   "name": "三十轮花·绞首",
   "sub": "伏笔·妮可·罗宾",
   "type": "trap",
   "art": "GREEN-92",
   "triggers": [
    "onAttacked",
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "atkDelta",
      "target": "attacker",
      "amount": -400,
      "until": "battle"
     }
    ]
   },
   "desc": "对方攻击宣言时：该攻击人物 ATK-400 直至战斗阶段结束。（罗宾在敌人身上绽出三十条手臂绞住颈部的束缚技，司法岛对卡莉法使用）",
   "faction": "strawhat",
   "rarity": "A"
  },
  {
   "id": "GLD-T0008",
   "name": "黄泉的寒气",
   "sub": "伏笔·布鲁克",
   "type": "trap",
   "art": "BLUE-63",
   "triggers": [
    "onAttacked",
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "atkDelta",
      "target": "attacker",
      "amount": -600,
      "until": "battle"
     }
    ]
   },
   "desc": "对方攻击宣言时：该攻击人物 ATK-600 直至战斗阶段结束。（布鲁克黄泉果实散发的冥界寒气，鬼岛冻结霍米兹与幽灵系敌人）",
   "faction": "strawhat",
   "rarity": "S"
  },
  {
   "id": "GLD-T0009",
   "name": "催眠歌·FLANCY",
   "sub": "伏笔·布鲁克·新世界",
   "type": "trap",
   "art": "RED-138",
   "triggers": [
    "onAttacked",
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "atkDelta",
      "target": "attacker",
      "amount": -400,
      "until": "battle"
     }
    ]
   },
   "desc": "对方攻击宣言时：该攻击人物 ATK-400 直至战斗阶段结束。（布鲁克的催眠演奏曲，恐怖三桅帆船令龙马与僵尸军团昏睡（眠り歌FLANCY））",
   "faction": "strawhat",
   "rarity": "A"
  },
  {
   "id": "GLD-T0010",
   "name": "毛皮强化",
   "sub": "伏笔·托尼托尼·乔巴",
   "type": "trap",
   "art": "GREEN-32",
   "triggers": [
    "onAttacked"
   ],
   "effect": {
    "ops": [
     {
      "op": "defDelta",
      "target": "defender",
      "amount": 500,
      "until": "battle"
     }
    ]
   },
   "desc": "自己人物被攻击时：该人物 DEF+500 直至战斗阶段结束。（乔巴人兽形的皮毛强化形态，蓬起毛发缓冲抵御冲击）",
   "faction": "strawhat",
   "rarity": "A"
  },
  {
   "id": "GLD-T0011",
   "name": "咆雷八卦",
   "sub": "伏笔·鬼岛决战 凯多&大和",
   "type": "trap",
   "art": "GREEN-12",
   "triggers": [
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "negateAttack"
     },
     {
      "op": "damage",
      "amount": 500
     }
    ]
   },
   "desc": "对方直接攻击时：无效该攻击，并给予对方 LP 500 伤害。（凯多雷鸣八卦的升级版，鬼岛决战再度一击击溃路飞（咆雷八卦））",
   "faction": "strawhat",
   "rarity": "S"
  },
  {
   "id": "GLD-T0012",
   "name": "寄生线",
   "sub": "伏笔·唐吉诃德·多弗朗明戈",
   "type": "trap",
   "art": "PURPLE-30",
   "triggers": [
    "onAttacked",
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "atkDelta",
      "target": "attacker",
      "amount": -600,
      "until": "battle"
     }
    ]
   },
   "desc": "对方攻击宣言时：该攻击人物 ATK-600 直至战斗阶段结束。（明哥线线果实操纵他人身体的寄生线，德雷斯罗萨操纵居鲁士与雷贝卡相斗（Parasite））",
   "faction": "warlord",
   "rarity": "S"
  },
  {
   "id": "GLD-T0013",
   "name": "蛛网",
   "sub": "伏笔·多弗朗明戈",
   "type": "trap",
   "art": "YELLOW-09",
   "triggers": [
    "onAttacked"
   ],
   "effect": {
    "ops": [
     {
      "op": "defDelta",
      "target": "defender",
      "amount": 700,
      "until": "battle"
     }
    ]
   },
   "desc": "自己人物被攻击时：该人物 DEF+700 直至战斗阶段结束。（明哥以线织成的巨网防御并困住对手，德雷斯罗萨对路飞的竞技场大战使用（Spider's Web 蛛网））",
   "faction": "warlord",
   "rarity": "S"
  },
  {
   "id": "GLD-T0014",
   "name": "侵蚀轮回",
   "sub": "伏笔·沙尔·克洛克达尔",
   "type": "trap",
   "art": "PURPLE-158",
   "triggers": [
    "onAttacked",
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "atkDelta",
      "target": "attacker",
      "amount": -600,
      "until": "battle"
     }
    ]
   },
   "desc": "对方攻击宣言时：该攻击人物 ATK-600 直至战斗阶段结束。（克洛克达尔吸干接触物水分的右手之触，阿拉巴斯坦把路飞吸成干尸（Ground Death 侵蚀轮回））",
   "faction": "warlord",
   "rarity": "S"
  },
  {
   "id": "GLD-T0015",
   "name": "甜甜甘风",
   "sub": "伏笔·波雅·汉库珂",
   "type": "trap",
   "art": "BLUE-68",
   "triggers": [
    "onAttacked",
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "atkDelta",
      "target": "attacker",
      "amount": -600,
      "until": "battle"
     }
    ]
   },
   "desc": "对方攻击宣言时：该攻击人物 ATK-600 直至战斗阶段结束。（汉库珂甜甜果实的爱心光波，心存邪念者触之即石化，亚马逊百合对路飞使用（Slave Arrow 前置技））",
   "faction": "warlord",
   "rarity": "S"
  },
  {
   "id": "GLD-T0016",
   "name": "影箱",
   "sub": "伏笔·月光·莫利亚",
   "type": "trap",
   "art": "PURPLE-145",
   "triggers": [
    "onAttacked"
   ],
   "effect": {
    "ops": [
     {
      "op": "defDelta",
      "target": "defender",
      "amount": 500,
      "until": "battle"
     }
    ]
   },
   "desc": "自己人物被攻击时：该人物 DEF+500 直至战斗阶段结束。（莫利亚以影子构筑的防护箱，抵挡敌人攻击的影子屏障（影箱））",
   "faction": "warlord",
   "rarity": "A"
  },
  {
   "id": "GLD-T0017",
   "name": "消极幽灵",
   "sub": "伏笔·佩罗娜",
   "type": "trap",
   "art": "PURPLE-135",
   "triggers": [
    "onAttacked",
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "atkDelta",
      "target": "attacker",
      "amount": -600,
      "until": "battle"
     }
    ]
   },
   "desc": "对方攻击宣言时：该攻击人物 ATK-600 直至战斗阶段结束。（佩罗娜幽灵果实的消极幽灵，穿过身体者陷入极度消极瘫软，恐怖三桅帆船团灭草帽团男性战力）",
   "faction": "warlord",
   "rarity": "S"
  },
  {
   "id": "GLD-T0018",
   "name": "蜡烛墙",
   "sub": "伏笔·Mr.3",
   "type": "trap",
   "art": "YELLOW-73",
   "triggers": [
    "onAttacked"
   ],
   "effect": {
    "ops": [
     {
      "op": "defDelta",
      "target": "defender",
      "amount": 500,
      "until": "battle"
     }
    ]
   },
   "desc": "自己人物被攻击时：该人物 DEF+500 直至战斗阶段结束。（Mr.3蜡蜡果实的蜡烛之墙，小花园与推进城多次硬化成防御壁垒（Candle Wall））",
   "faction": "warlord",
   "rarity": "A"
  },
  {
   "id": "GLD-T0019",
   "name": "八咫镜",
   "sub": "伏笔·波尔萨利诺",
   "type": "trap",
   "art": "BLUE-30",
   "triggers": [
    "onAttacked",
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "negateAttack"
     }
    ]
   },
   "desc": "对方攻击宣言时：无效该次攻击。（黄猿光光果实的光路瞬移，本体沿反射光瞬间转移避开攻击（八咫镜））",
   "faction": "navy",
   "rarity": "S"
  },
  {
   "id": "GLD-T0020",
   "name": "爱的铁拳",
   "sub": "伏笔·蒙奇·D·卡普",
   "type": "trap",
   "art": "BLUE-167",
   "triggers": [
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "negateAttack"
     },
     {
      "op": "damage",
      "amount": 300
     }
    ]
   },
   "desc": "对方直接攻击时：无效该攻击，并给予对方 LP 300 伤害。（卡普的铁拳制裁，风车镇把路飞艾斯打得满头包的爱的铁拳）",
   "faction": "navy",
   "rarity": "A"
  },
  {
   "id": "GLD-T0021",
   "name": "纸绘",
   "sub": "伏笔·路奇",
   "type": "trap",
   "art": "BLACK-99",
   "triggers": [
    "onAttacked",
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "negateAttack"
     }
    ]
   },
   "desc": "对方攻击宣言时：无效该次攻击。（海军六式之纸绘，卸力飘动使攻击落空，路奇与CP9的看家回避技）",
   "faction": "navy",
   "rarity": "S"
  },
  {
   "id": "GLD-T0022",
   "name": "铁块·钢",
   "sub": "伏笔·加布拉",
   "type": "trap",
   "art": "GREEN-151",
   "triggers": [
    "onAttacked"
   ],
   "effect": {
    "ops": [
     {
      "op": "defDelta",
      "target": "defender",
      "amount": 700,
      "until": "battle"
     }
    ]
   },
   "desc": "自己人物被攻击时：该人物 DEF+700 直至战斗阶段结束。（六式铁块的强化版钢，加布拉人狼形硬质化身体正面承受斩击（铁块钢））",
   "faction": "navy",
   "rarity": "S"
  },
  {
   "id": "GLD-T0023",
   "name": "空气门",
   "sub": "伏笔·布鲁诺",
   "type": "trap",
   "art": "YELLOW-123",
   "triggers": [
    "onAttacked",
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "negateAttack"
     }
    ]
   },
   "desc": "对方攻击宣言时：无效该次攻击。（布鲁诺门门果实的空气门，开门遁入异空间完全回避攻击（空气门））",
   "faction": "navy",
   "rarity": "A"
  },
  {
   "id": "GLD-T0024",
   "name": "冰冻时刻",
   "sub": "伏笔·库赞",
   "type": "trap",
   "art": "BLUE-106",
   "triggers": [
    "onAttacked",
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "atkDelta",
      "target": "attacker",
      "amount": -600,
      "until": "battle"
     }
    ]
   },
   "desc": "对方攻击宣言时：该攻击人物 ATK-600 直至战斗阶段结束。（青雉贴身接触将对手整体冻结的招式，长环岛一触冻住路飞与罗宾（Ice Time））",
   "faction": "navy",
   "rarity": "S"
  },
  {
   "id": "GLD-T0025",
   "name": "黑槛",
   "sub": "伏笔·缇娜",
   "type": "trap",
   "art": "BLACK-134",
   "triggers": [
    "onAttacked",
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "atkDelta",
      "target": "attacker",
      "amount": -400,
      "until": "battle"
     }
    ]
   },
   "desc": "对方攻击宣言时：该攻击人物 ATK-400 直至战斗阶段结束。（缇娜黑槛果实的手铐束缚，罗格镇逮捕路飞未遂、顶上战争束缚海贼（黑槛））",
   "faction": "navy",
   "rarity": "A"
  },
  {
   "id": "GLD-T0026",
   "name": "催眠术",
   "sub": "伏笔·赞高",
   "type": "trap",
   "art": "GREEN-70",
   "triggers": [
    "onAttacked",
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "atkDelta",
      "target": "attacker",
      "amount": -400,
      "until": "battle"
     }
    ]
   },
   "desc": "对方攻击宣言时：该攻击人物 ATK-400 直至战斗阶段结束。（赞高以一月二月赞高咒语发动的催眠术，东海篇连自己舰队一起催眠的名场面）",
   "faction": "navy",
   "rarity": "A"
  },
  {
   "id": "GLD-T0027",
   "name": "冰球",
   "sub": "伏笔·青雉",
   "type": "trap",
   "art": "BLUE-10",
   "triggers": [
    "onAttacked",
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "atkDelta",
      "target": "attacker",
      "amount": -600,
      "until": "battle"
     }
    ]
   },
   "desc": "对方攻击宣言时：该攻击人物 ATK-600 直至战斗阶段结束。（青雉瞬间冻住对手的大冰球，顶上战争开局冻住白胡子遏制其猛攻（Ice Ball 冰球））",
   "faction": "navy",
   "rarity": "S"
  },
  {
   "id": "GLD-T0028",
   "name": "奇病·木乃伊",
   "sub": "伏笔·奎因",
   "type": "trap",
   "art": "GREEN-38",
   "triggers": [
    "onAttacked",
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "atkDelta",
      "target": "attacker",
      "amount": -600,
      "until": "battle"
     }
    ]
   },
   "desc": "对方攻击宣言时：该攻击人物 ATK-600 直至战斗阶段结束。（奎因的瘟祸弹奇病木乃伊，接触感染全身干枯石化失去战力（Mummy））",
   "faction": "beast",
   "rarity": "S"
  },
  {
   "id": "GLD-T0029",
   "name": "漆黑隐伏",
   "sub": "伏笔·奎因",
   "type": "trap",
   "art": "GREEN-38",
   "triggers": [
    "onAttacked",
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "negateAttack"
     }
    ]
   },
   "desc": "对方攻击宣言时：无效该次攻击。（奎因腕龙形态的变色龙隐身能力，鬼岛对山治隐匿行踪（Stealth Black 漆黑隐伏））",
   "faction": "beast",
   "rarity": "A"
  },
  {
   "id": "GLD-T0030",
   "name": "刃里双皇",
   "sub": "伏笔·金",
   "type": "trap",
   "art": "GREEN-08",
   "triggers": [
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "negateAttack"
     },
     {
      "op": "damage",
      "amount": 300
     }
    ]
   },
   "desc": "对方直接攻击时：无效该攻击，并给予对方 LP 300 伤害。（KING人兽型快速摆动双翼射出多发风刃，鬼岛对索隆使用（刃里双皇））",
   "faction": "beast",
   "rarity": "A"
  },
  {
   "id": "GLD-T0031",
   "name": "铁块·牙闪",
   "sub": "伏笔·福兹弗",
   "type": "trap",
   "art": "PURPLE-117",
   "triggers": [
    "onAttacked"
   ],
   "effect": {
    "ops": [
     {
      "op": "defDelta",
      "target": "defender",
      "amount": 700,
      "until": "battle"
     }
    ]
   },
   "desc": "自己人物被攻击时：该人物 DEF+700 直至战斗阶段结束。（原CP9福兹弗的六式铁块强化版，剑齿虎形态硬质化防御（铁块牙闪））",
   "faction": "beast",
   "rarity": "S"
  },
  {
   "id": "GLD-T0032",
   "name": "玛丽亚之网",
   "sub": "伏笔·黑色玛利亚",
   "type": "trap",
   "art": "GREEN-42",
   "triggers": [
    "onAttacked",
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "atkDelta",
      "target": "attacker",
      "amount": -600,
      "until": "battle"
     }
    ]
   },
   "desc": "对方攻击宣言时：该攻击人物 ATK-600 直至战斗阶段结束。（黑色玛利亚蜘蛛丝织成的大网，鬼岛困住山治逼其唤罗宾前来（Marionette 玛丽亚之网））",
   "faction": "beast",
   "rarity": "S"
  },
  {
   "id": "GLD-T0033",
   "name": "此路不通亚",
   "sub": "伏笔·黑色玛利亚",
   "type": "trap",
   "art": "GREEN-42",
   "triggers": [
    "onAttacked"
   ],
   "effect": {
    "ops": [
     {
      "op": "defDelta",
      "target": "defender",
      "amount": 500,
      "until": "battle"
     }
    ]
   },
   "desc": "自己人物被攻击时：该人物 DEF+500 直至战斗阶段结束。（黑色玛利亚封锁敌人退路的防守反击姿态，鬼岛宅邸战的游廓女主人做派（此路不通亚））",
   "faction": "beast",
   "rarity": "A"
  },
  {
   "id": "GLD-T0034",
   "name": "乌尔头枪",
   "sub": "伏笔·润媞",
   "type": "trap",
   "art": "PURPLE-101",
   "triggers": [
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "negateAttack"
     },
     {
      "op": "damage",
      "amount": 300
     }
    ]
   },
   "desc": "对方直接攻击时：无效该攻击，并给予对方 LP 300 伤害。（乌尔蒂威力媲美大炮的头槌，鬼岛一头撞穿地板吹飞周围敌人（乌尔头枪））",
   "faction": "beast",
   "rarity": "A"
  },
  {
   "id": "GLD-T0035",
   "name": "毒云",
   "sub": "伏笔·海底监狱的铁壁 麦哲伦&汉尼拔",
   "type": "trap",
   "art": "BLACK-31",
   "triggers": [
    "onAttacked",
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "atkDelta",
      "target": "attacker",
      "amount": -400,
      "until": "battle"
     }
    ]
   },
   "desc": "对方攻击宣言时：该攻击人物 ATK-400 直至战斗阶段结束。（麦哲伦身旁弥漫的毒之云雾，LEVEL4毒之河周边触之即中毒（毒云））",
   "faction": "beast",
   "rarity": "A"
  },
  {
   "id": "GLD-T0036",
   "name": "镜火炎",
   "sub": "伏笔·艾斯",
   "type": "trap",
   "art": "RED-08",
   "triggers": [
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "negateAttack"
     },
     {
      "op": "damage",
      "amount": 500
     }
    ]
   },
   "desc": "对方直接攻击时：无效该攻击，并给予对方 LP 500 伤害。（艾斯制造的反射火焰壁，弹开对手的火焰攻击，对黑胡子团使用（镜火炎））",
   "faction": "whitebeard",
   "rarity": "S"
  },
  {
   "id": "GLD-T0037",
   "name": "炎上网",
   "sub": "伏笔·波特卡斯·D·艾斯",
   "type": "trap",
   "art": "RED-29",
   "triggers": [
    "onAttacked"
   ],
   "effect": {
    "ops": [
     {
      "op": "defDelta",
      "target": "defender",
      "amount": 700,
      "until": "battle"
     }
    ]
   },
   "desc": "自己人物被攻击时：该人物 DEF+700 直至战斗阶段结束。（艾斯织出的火焰之网，阻挡与灼烧来犯之敌（炎上网））",
   "faction": "whitebeard",
   "rarity": "S"
  },
  {
   "id": "GLD-T0038",
   "name": "阳炎",
   "sub": "伏笔·波特卡斯·D·艾斯·一番队",
   "type": "trap",
   "art": "RED-72",
   "triggers": [
    "onAttacked",
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "negateAttack"
     }
    ]
   },
   "desc": "对方攻击宣言时：无效该次攻击。（艾斯的火焰残像幻影，实体化作阳炎晃动令攻击落空（阳炎））",
   "faction": "whitebeard",
   "rarity": "A"
  },
  {
   "id": "GLD-T0039",
   "name": "火枪",
   "sub": "伏笔·波特卡斯·D·艾斯·一番队",
   "type": "trap",
   "art": "RED-72",
   "triggers": [
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "negateAttack"
     },
     {
      "op": "damage",
      "amount": 300
     }
    ]
   },
   "desc": "对方直接攻击时：无效该攻击，并给予对方 LP 300 伤害。（艾斯手指连发火弹的火枪，指先火弹如机关枪连射迎击（火铳））",
   "faction": "whitebeard",
   "rarity": "A"
  },
  {
   "id": "GLD-T0040",
   "name": "不死蓟",
   "sub": "伏笔·马尔科·一番队",
   "type": "trap",
   "art": "RED-155",
   "triggers": [
    "onAttacked"
   ],
   "effect": {
    "ops": [
     {
      "op": "defDelta",
      "target": "defender",
      "amount": 700,
      "until": "battle"
     }
    ]
   },
   "desc": "自己人物被攻击时：该人物 DEF+700 直至战斗阶段结束。（马尔科不死鸟蓝炎的再生之蓟，顶上战争中弹与被斩后蓝焰重组伤口（不死蓟））",
   "faction": "whitebeard",
   "rarity": "S"
  },
  {
   "id": "GLD-T0041",
   "name": "鹤爪",
   "sub": "伏笔·马尔科",
   "type": "trap",
   "art": "BLUE-59",
   "triggers": [
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "negateAttack"
     },
     {
      "op": "damage",
      "amount": 300
     }
    ]
   },
   "desc": "对方直接攻击时：无效该攻击，并给予对方 LP 300 伤害。（马尔科鹤形爪击的回旋踢，顶上战争与鬼岛对KING、奎因缠斗使用（鹤爪））",
   "faction": "whitebeard",
   "rarity": "A"
  },
  {
   "id": "GLD-T0042",
   "name": "神火·不知火",
   "sub": "伏笔·艾斯",
   "type": "trap",
   "art": "RED-08",
   "triggers": [
    "onAttacked",
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "atkDelta",
      "target": "attacker",
      "amount": -600,
      "until": "battle"
     }
    ]
   },
   "desc": "对方攻击宣言时：该攻击人物 ATK-600 直至战斗阶段结束。（艾斯凝聚火焰镰刀的远距斩击，巴纳罗岛对黑胡子海贼团使用（神火 不知火））",
   "faction": "whitebeard",
   "rarity": "S"
  },
  {
   "id": "GLD-T0043",
   "name": "炎戒·火柱",
   "sub": "伏笔·波特卡斯·D·艾斯",
   "type": "trap",
   "art": "RED-29",
   "triggers": [
    "onAttacked",
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "atkDelta",
      "target": "attacker",
      "amount": -600,
      "until": "battle"
     }
    ]
   },
   "desc": "对方攻击宣言时：该攻击人物 ATK-600 直至战斗阶段结束。（艾斯全身缠绕上升的螺旋火柱，对黑胡子团烧尽四周（炎戒 火柱））",
   "faction": "whitebeard",
   "rarity": "S"
  },
  {
   "id": "GLD-T0044",
   "name": "磁力·反斥",
   "sub": "伏笔·尤斯塔斯·基德",
   "type": "trap",
   "art": "GREEN-93",
   "triggers": [
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "negateAttack"
     },
     {
      "op": "damage",
      "amount": 500
     }
    ]
   },
   "desc": "对方直接攻击时：无效该攻击，并给予对方 LP 500 伤害。（基德以磁气反弹飞来炮弹与子弹的招式，香波地对海军、鬼岛对大妈团使用（Repel 反发））",
   "faction": "supernova",
   "rarity": "S"
  },
  {
   "id": "GLD-T0045",
   "name": "稻草人",
   "sub": "伏笔·巴兹尔·霍金斯",
   "type": "trap",
   "art": "RED-132",
   "triggers": [
    "onAttacked"
   ],
   "effect": {
    "ops": [
     {
      "op": "defDelta",
      "target": "defender",
      "amount": 700,
      "until": "battle"
     }
    ]
   },
   "desc": "自己人物被攻击时：该人物 DEF+700 直至战斗阶段结束。（霍金斯以稻草人偶承接伤害的诅咒转嫁，被击中时伤害由人偶代替（Strawman 稻草人））",
   "faction": "supernova",
   "rarity": "S"
  },
  {
   "id": "GLD-T0046",
   "name": "稻草人卡片",
   "sub": "伏笔·巴兹尔·霍金斯·最恶世代",
   "type": "trap",
   "art": "RED-92",
   "triggers": [
    "onAttacked",
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "atkDelta",
      "target": "attacker",
      "amount": -400,
      "until": "battle"
     }
    ]
   },
   "desc": "对方攻击宣言时：该攻击人物 ATK-400 直至战斗阶段结束。（霍金斯抽卡占卜定夺命运的诅咒之卡，香波地以此预判战局伤人（稻草人卡片））",
   "faction": "supernova",
   "rarity": "A"
  },
  {
   "id": "GLD-T0047",
   "name": "老化冲击",
   "sub": "伏笔·乔艾莉·波妮",
   "type": "trap",
   "art": "GREEN-111",
   "triggers": [
    "onAttacked",
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "atkDelta",
      "target": "attacker",
      "amount": -600,
      "until": "battle"
     }
    ]
   },
   "desc": "对方攻击宣言时：该攻击人物 ATK-600 直至战斗阶段结束。（波妮年龄果实的老化之力，将被触碰者急速衰老削弱（老化冲击））",
   "faction": "supernova",
   "rarity": "S"
  },
  {
   "id": "GLD-T0048",
   "name": "屏障",
   "sub": "伏笔·巴托洛米奥",
   "type": "trap",
   "art": "RED-53",
   "triggers": [
    "onAttacked"
   ],
   "effect": {
    "ops": [
     {
      "op": "defDelta",
      "target": "defender",
      "amount": 700,
      "until": "battle"
     }
    ]
   },
   "desc": "自己人物被攻击时：该人物 DEF+700 直至战斗阶段结束。（巴托洛米奥屏障果实的透明屏障，德雷斯罗萨正面挡下王者之拳（屏障））",
   "faction": "supernova",
   "rarity": "S"
  },
  {
   "id": "GLD-T0049",
   "name": "战斗音乐",
   "sub": "伏笔·阿普",
   "type": "trap",
   "art": "PURPLE-43",
   "triggers": [
    "onAttacked",
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "atkDelta",
      "target": "attacker",
      "amount": -400,
      "until": "battle"
     }
    ]
   },
   "desc": "对方攻击宣言时：该攻击人物 ATK-400 直至战斗阶段结束。（阿普身体乐器的音波攻击，鬼岛以突袭音波重创基德与索隆（战斗音乐））",
   "faction": "supernova",
   "rarity": "A"
  },
  {
   "id": "GLD-T0050",
   "name": "心网",
   "sub": "伏笔·艾涅尔",
   "type": "trap",
   "art": "YELLOW-36",
   "triggers": [
    "onAttacked",
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "negateAttack"
     }
    ]
   },
   "desc": "对方攻击宣言时：无效该次攻击。（艾涅尔覆盖全空岛的见闻色心网，预知一切攻击动向令其落空（心网））",
   "faction": "yonko",
   "rarity": "A"
  },
  {
   "id": "GLD-T0051",
   "name": "镜世界",
   "sub": "伏笔·夏洛特·布蕾",
   "type": "trap",
   "art": "PURPLE-21",
   "triggers": [
    "onAttacked",
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "negateAttack"
     }
    ]
   },
   "desc": "对方攻击宣言时：无效该次攻击。（布蕾镜镜果实的镜中世界，万国篇将草帽团引入镜世界搅乱追击战（镜世界））",
   "faction": "yonko",
   "rarity": "A"
  },
  {
   "id": "GLD-T0052",
   "name": "冲击贝",
   "sub": "伏笔·甘福尔",
   "type": "trap",
   "art": "PURPLE-22",
   "triggers": [
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "negateAttack"
     },
     {
      "op": "damage",
      "amount": 500
     }
    ]
   },
   "desc": "对方直接攻击时：无效该攻击，并给予对方 LP 500 伤害。（甘福尔的空岛贝武器冲击贝，贮存冲击后反向释放，神之岛决战对艾涅尔使用（Impact Dial））",
   "faction": "yonko",
   "rarity": "S"
  },
  {
   "id": "GLD-T0053",
   "name": "见闻色·未来预知",
   "sub": "伏笔·卡塔库栗",
   "type": "trap",
   "art": "RED-63",
   "triggers": [
    "onAttacked",
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "negateAttack"
     }
    ]
   },
   "desc": "对方攻击宣言时：无效该次攻击。（卡塔库栗将见闻色练至预见未来的境界，万国镜界完全回避路飞一切攻击）",
   "faction": "yonko",
   "rarity": "S"
  },
  {
   "id": "GLD-T0054",
   "name": "霸王色的威压",
   "sub": "伏笔·香克斯",
   "type": "trap",
   "art": "YELLOW-120",
   "triggers": [
    "onAttacked",
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "atkDelta",
      "target": "attacker",
      "amount": -600,
      "until": "battle"
     }
    ]
   },
   "desc": "对方攻击宣言时：该攻击人物 ATK-600 直至战斗阶段结束。（香克斯的顶级霸王色霸气威压，和之国近海隔空逼退海军大将绿牛）",
   "faction": "yonko",
   "rarity": "S"
  },
  {
   "id": "GLD-T0055",
   "name": "饼干士兵",
   "sub": "伏笔·克力架",
   "type": "trap",
   "art": "YELLOW-44",
   "triggers": [
    "onAttacked"
   ],
   "effect": {
    "ops": [
     {
      "op": "defDelta",
      "target": "defender",
      "amount": 700,
      "until": "battle"
     }
    ]
   },
   "desc": "自己人物被攻击时：该人物 DEF+700 直至战斗阶段结束。（克力架饼干果实无限再造的饼干士兵，万国篇以假身硬盾耗战路飞十一小时）",
   "faction": "yonko",
   "rarity": "S"
  },
  {
   "id": "GLD-T0056",
   "name": "雷云·宙斯",
   "sub": "伏笔·夏洛特·玲玲",
   "type": "trap",
   "art": "YELLOW-41",
   "triggers": [
    "onAttacked",
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "atkDelta",
      "target": "attacker",
      "amount": -400,
      "until": "battle"
     }
    ]
   },
   "desc": "对方攻击宣言时：该攻击人物 ATK-400 直至战斗阶段结束。（BIG MOM头顶盘旋的雷云霍米兹宙斯，万国追击娜美乌索普时随时落雷伏击）",
   "faction": "yonko",
   "rarity": "A"
  },
  {
   "id": "GLD-T0057",
   "name": "乌鸦煤",
   "sub": "伏笔·卡拉斯",
   "type": "trap",
   "art": "BLACK-141",
   "triggers": [
    "onAttacked",
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "atkDelta",
      "target": "attacker",
      "amount": -400,
      "until": "battle"
     }
    ]
   },
   "desc": "对方攻击宣言时：该攻击人物 ATK-400 直至战斗阶段结束。（革命军西军军队长卡拉斯化身乌鸦群的袭击，世界会议篇对桃胡子海贼团使用（乌鸦煤））",
   "faction": "revolutionary",
   "rarity": "A"
  },
  {
   "id": "GLD-T0058",
   "name": "方尖煤",
   "sub": "伏笔·卡拉斯·革命军",
   "type": "trap",
   "art": "BLUE-72",
   "triggers": [
    "onAttacked",
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "atkDelta",
      "target": "attacker",
      "amount": -600,
      "until": "battle"
     }
    ]
   },
   "desc": "对方攻击宣言时：该攻击人物 ATK-600 直至战斗阶段结束。（卡拉斯乌鸦群聚成方尖碑状冲撞的强化技，鲁鲁西亚王国保卫战使用（方尖煤））",
   "faction": "revolutionary",
   "rarity": "S"
  },
  {
   "id": "GLD-T0059",
   "name": "乌鸦连魂",
   "sub": "伏笔·卡拉斯",
   "type": "trap",
   "art": "BLACK-141",
   "triggers": [
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "negateAttack"
     },
     {
      "op": "damage",
      "amount": 300
     }
    ]
   },
   "desc": "对方直接攻击时：无效该攻击，并给予对方 LP 300 伤害。（卡拉斯乌鸦群的连续俯冲反击，玛丽乔亚潜入战的名技（乌鸦连魂））",
   "faction": "revolutionary",
   "rarity": "A"
  },
  {
   "id": "GLD-T0060",
   "name": "冰冷射击",
   "sub": "伏笔·林德伯格",
   "type": "trap",
   "art": "BLUE-120",
   "triggers": [
    "onAttacked",
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "atkDelta",
      "target": "attacker",
      "amount": -400,
      "until": "battle"
     }
    ]
   },
   "desc": "对方攻击宣言时：该攻击人物 ATK-400 直至战斗阶段结束。（革命军南军军队长林德伯格的冷冻武器射击，冻结敌人行动（冰冷射击））",
   "faction": "revolutionary",
   "rarity": "A"
  },
  {
   "id": "GLD-T0061",
   "name": "光束射击",
   "sub": "伏笔·林德伯格·革命军",
   "type": "trap",
   "art": "BLUE-127",
   "triggers": [
    "onAttacked",
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "negateAttack"
     }
    ]
   },
   "desc": "对方攻击宣言时：无效该次攻击。（林德伯格的科学家制武装光束射击，玛丽乔亚潜入战封住敌人行动（Beam Freeze Shot））",
   "faction": "revolutionary",
   "rarity": "S"
  },
  {
   "id": "GLD-T0062",
   "name": "罗格镇的风暴",
   "sub": "伏笔·蒙奇·D·龙",
   "type": "trap",
   "art": "GREEN-33",
   "triggers": [
    "onAttacked",
    "onDirectAttack"
   ],
   "effect": {
    "ops": [
     {
      "op": "negateAttack"
     }
    ]
   },
   "desc": "对方攻击宣言时：无效该次攻击。（罗格镇处刑时刻骤起的风暴与雷击劈碎处刑台掩护路飞脱身，多拉格操控天象的名场面）",
   "faction": "revolutionary",
   "rarity": "S"
  },
  {
   "id": "GLD-T0063",
   "name": "鼓舞",
   "sub": "伏笔·贝洛·贝蒂",
   "type": "trap",
   "art": "BLUE-160",
   "triggers": [
    "onAttacked"
   ],
   "effect": {
    "ops": [
     {
      "op": "defDelta",
      "target": "defender",
      "amount": 500,
      "until": "battle"
     }
    ]
   },
   "desc": "自己人物被攻击时：该人物 DEF+500 直至战斗阶段结束。（革命军东军军队长贝洛·贝蒂的鼓舞果实，挥旗唤起民众勇气奋起反抗，鲁鲁西亚对桃胡子海贼团）",
   "faction": "revolutionary",
   "rarity": "A"
  }
 ]
};
export default POOL;
