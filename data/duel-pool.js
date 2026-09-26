// data/duel-pool.js — round6 R6-C 自动转译卡池（勿手改；重生成=node scripts/convert-pool.mjs）
// 源=data/cards.json（OPTCG 861 卡）；技能映射/数值锚点真值源=scripts/convert-pool.mjs
// 许可随源库（角色形象版权见 docs/legacy-baseline.md 版权窗口期说明）
const POOL = {
 "version": "r6c",
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
  }
 ]
};
export default POOL;
