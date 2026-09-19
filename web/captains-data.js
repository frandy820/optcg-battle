// captains-data.js — 船长大厅展示层配置（数据 + 图标库）
// 依赖：无（先于 game.js/modes.js 加载）；引擎数据仍以 app.bundle.js 的 OPTCG.POOL 为真值源，
// 本文件只做大厅/卡面展示配置，不改任何对局逻辑。
// 字段口径：id/name/title/image/imagePosition/rarity/faction/factionColor/accentColor/hp/
//          abilityName/abilityDescription/flavorText/cardNumber/isUnlocked 均为展示字段；
//          color 链接引擎 leaders[].color，hp=leader.power，life=leader.life。
/* global */
(function () {
  'use strict';

  // ===== lucide 线性图标库（24x24 viewBox，stroke 继承 currentColor）=====
  const PATHS = {
    anchor: '<circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/>',
    compass: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    waves: '<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    wind: '<path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>',
    zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
    swords: '<polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 10"/><line x1="5" y1="14" x2="9" y2="18"/><line x1="7" y1="17" x2="4" y2="20"/><line x1="3" y1="19" x2="5" y2="21"/>',
    hammer: '<path d="m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9"/><path d="m18 15 4-4"/><path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5"/>',
    gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
    layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
    scrollText: '<path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/>',
    rotateCcw: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    undo2: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/>',
    skull: '<circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M8 20v2h8v-2"/><path d="m12.5 17-.5-1-.5 1h1z"/><path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    save: '<path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/>',
    trash2: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',
    sparkles: '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    crown: '<path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.735H5.81a1 1 0 0 1-.957-.735L2.02 6.02a.5.5 0 0 1 .798-.52l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    map: '<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>',
    play: '<polygon points="6 3 20 12 6 21 6 3"/>',
    chevDown: '<path d="m6 9 6 6 6-6"/>',
    chevRight: '<path d="m9 18 6-6-6-6"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    medal: '<path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"/><path d="M11 12 5.12 2.2"/><path d="m13 12 5.88-9.8"/><path d="M8 7h8"/><circle cx="12" cy="17" r="5"/><path d="M12 18v-2h-.01"/>',
  };

  // icon(name, cls) -> 内联 SVG 字符串；name 不存在时回退 compass
  function icon(name, cls) {
    const body = PATHS[name] || PATHS.compass;
    return '<svg class="icn' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true">' + body + '</svg>';
  }

  // ===== 阵营（六色 → 元素/色板；与 style.css --c-* 引擎色并行，仅用于大厅展示）=====
  const FACTION = {
    red:    { name: '烈焰之志', emblem: 'flame', color: '#e8563f', accent: '#ff9d6b' },
    blue:   { name: '潮汐雷舵', emblem: 'waves', color: '#4fb6e8', accent: '#9adcff' },
    green:  { name: '翡翠剑心', emblem: 'leaf',  color: '#3fae7a', accent: '#8fe3b8' },
    yellow: { name: '疾风炽焰', emblem: 'wind',  color: '#f0a92e', accent: '#ffd47e' },
    purple: { name: '落雷手术', emblem: 'zap',   color: '#a585ff', accent: '#d3c2ff' },
    black:  { name: '月蚀霸涛', emblem: 'moon',  color: '#b8a7e8', accent: '#dcd2f5' },
  };

  // 兜底航海纹章（图片缺失时用）：阵营色罗盘盾徽 data-URI
  function fallbackArt(color) {
    const f = FACTION[color] || FACTION.red;
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#101d33"/><stop offset="1" stop-color="#060c18"/></linearGradient></defs>' +
      '<rect width="512" height="512" fill="url(#g)"/>' +
      '<path d="M256 40 448 120v150c0 120-84 180-192 212C148 450 64 390 64 270V120Z" fill="none" stroke="' + f.color + '" stroke-width="14" opacity="0.9"/>' +
      '<circle cx="256" cy="236" r="104" fill="none" stroke="' + f.accent + '" stroke-width="10" opacity="0.75"/>' +
      '<polygon points="316,156 276,268 196,308 236,196" fill="' + f.color + '" opacity="0.92"/>' +
      '<circle cx="256" cy="236" r="14" fill="#f6d26b"/>' +
      '<path d="M120 392c40 34 88 52 136 64 48-12 96-30 136-64" fill="none" stroke="' + f.accent + '" stroke-width="8" opacity="0.5"/>' +
      '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  // ===== 六船长配置（展示字段；数值描述取自真实卡池统计，非虚构战斗效果）=====
  const LIST = [
    {
      id: 'luffy', color: 'red', leaderId: 'LEADER-RED', rarity: 'legendary',
      name: '蒙奇·D·路飞', title: '草帽盟主',
      image: 'art/captains/luffy.webp', imagePosition: 'center 4%',
      faction: FACTION.red.name, factionColor: FACTION.red.color, accentColor: FACTION.red.accent,
      hp: 5000, life: 5,
      abilityName: '烈焰冲锋',
      abilityDescription: '攻势港群：麾下 19 员战将均费 4.0、最高战力 9000，突袭×4 全场最多抢血，反击牌×9 张网。',
      flavorText: '风暴越大，船头指向越不变。',
      cardNumber: 'OP-01 LDR/001', isUnlocked: true,
    },
    {
      id: 'zoro', color: 'green', leaderId: 'LEADER-GREEN', rarity: 'epic',
      name: '罗罗诺亚·索隆', title: '海贼猎人',
      image: 'art/captains/zoro.webp', imagePosition: 'center 6%',
      faction: FACTION.green.name, factionColor: FACTION.green.color, accentColor: FACTION.green.accent,
      hp: 4500, life: 5,
      abilityName: '剑冢坚壁',
      abilityDescription: '重装港群：均费 4.8 全场最重、厚积薄发，高费角色登场永久 +1K，突袭×2 一击定胜负。',
      flavorText: '败北二字，不在他的刀谱里。',
      cardNumber: 'OP-01 LDR/002', isUnlocked: true,
    },
    {
      id: 'nami', color: 'blue', leaderId: 'LEADER-BLUE', rarity: 'rare',
      name: '娜美', title: '天候航海士',
      image: 'art/captains/nami.webp', imagePosition: 'center 20%',
      faction: FACTION.blue.name, factionColor: FACTION.blue.color, accentColor: FACTION.blue.accent,
      hp: 5500, life: 5,
      abilityName: '雷舵千帆',
      abilityDescription: '防守反击：反击牌×11 全场最多，均费 4.2 轻灵机动，以逸待劳耗沉对手。',
      flavorText: '她画的航图，比罗盘更早预知风雨。',
      cardNumber: 'OP-01 LDR/003', isUnlocked: true,
    },
    {
      id: 'sanji', color: 'yellow', leaderId: 'LEADER-YELLOW', rarity: 'rare',
      name: '山治', title: '黑足主厨',
      image: 'art/captains/sanji.webp', imagePosition: 'center 11%',
      faction: FACTION.yellow.name, factionColor: FACTION.yellow.color, accentColor: FACTION.yellow.accent,
      hp: 5000, life: 5,
      abilityName: '疾风铁壁',
      abilityDescription: '铁壁港群：格挡×7 全场最多，均费 4.1 进退有度，密不透风的机动防线。',
      flavorText: '火候与拳速，出自同一种温柔。',
      cardNumber: 'OP-01 LDR/004', isUnlocked: true,
    },
    {
      id: 'law', color: 'purple', leaderId: 'LEADER-PURPLE', rarity: 'epic',
      name: '特拉法尔加·罗', title: '死亡外科医生',
      image: 'art/captains/law.webp', imagePosition: 'center 9%',
      faction: FACTION.purple.name, factionColor: FACTION.purple.color, accentColor: FACTION.purple.accent,
      hp: 6000, life: 5,
      abilityName: '雷刃手术',
      abilityDescription: '控制港群：均费 4.2、反击牌×7，击沉抽牌精准拆解对手节奏，落刀之前局已布完。',
      flavorText: '手术刀落下之前，局已布完。',
      cardNumber: 'OP-01 LDR/005', isUnlocked: true,
    },
    {
      id: 'shanks', color: 'black', leaderId: 'LEADER-BLACK', rarity: 'legendary',
      name: '香克斯', title: '红发船长',
      image: 'art/captains/shanks.webp', imagePosition: 'center 12%',
      faction: FACTION.black.name, factionColor: FACTION.black.color, accentColor: FACTION.black.accent,
      hp: 5000, life: 5,
      abilityName: '霸王月涛',
      abilityDescription: '霸主港群：麾下最高 8000，均费 4.3 高压强攻，猛击直取要害，格挡×3 攻守兼备。',
      flavorText: '他抬眼的一瞬，海面先安静了。',
      cardNumber: 'OP-01 LDR/006', isUnlocked: true,
    },
  ];

  const RARITY = {
    common:    { name: '普通', color: '#7d8ba3' },
    rare:      { name: '稀有', color: '#7ec8f0' },
    epic:      { name: '史诗', color: '#b48df2' },
    legendary: { name: '传说', color: '#e9b64d' },
  };

  const byColor = (color) => LIST.find((c) => c.color === color) || null;

  window.OPTCG_CAPTAINS = { icon, PATHS, FACTION, LIST, RARITY, byColor, fallbackArt };
})();
