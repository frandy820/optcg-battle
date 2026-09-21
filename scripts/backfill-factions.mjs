// P1a 旧卡阵营/阵型/篇章回填（一次性，257 卡 → faction/formation/arc 三字段）
// 规则（docs/design-system.md §2/§4）：
//   faction 八阵营：明确名字映射优先，映射不到按色主阵营兜底
//     （red:strawhat blue:navy green:strawhat yellow:warlord purple:warlord black:beast）
//   formation：blocker→bulwark / rush|doubleAttack|banish→vanguard / 其余→null
//   arc 篇章副标签：按剧情归属粗分（不参与战斗判定，图鉴/故事发卡分组用）
// 三处同步：data/cards.json + data/cards-pool3.json + data/pool3/{color}.json（check-pool3 校验一致性）
// 幂等：重跑只补缺失字段，不覆盖已有。
import { readFileSync, writeFileSync } from 'node:fs';

// ===== 明确阵营映射（全色通用名字表；融合卡按首名匹配） =====
const FACTION = {
  strawhat: ['蒙奇·D·路飞', '罗罗诺亚·索隆', '乌索普', '托尼托尼·乔巴', '乔巴', '娜美', '妮可·罗宾', '罗宾',
    '弗兰奇', '布鲁克', '山治', '甚平', '薇薇', '阳光号的伙伴', '贝洛·贝蒂', '克尔拉', '哈库'],
  navy: ['克比', '达斯琪', '斯摩格', '青雉', '波尔萨利诺', '萨卡斯基', '卡普', '战国', '战桃丸', '赫尔梅普',
    '藤虎', '绿牛', '鹤', '麦哲伦', '汉尼拔', '小萨蒂', '泽法', '布鲁诺', '多米诺', '鬼蜘蛛', '鼯鼠', '火烧山',
    '钢骨·空', '斧手蒙卡', '柯拉松', '唐吉诃德·罗西南迪', '罗布·路奇', '卡莉法', '卡库', '加布拉', '斯潘达姆',
    '海军披风', '海军的魂', '海底监狱的铁壁', '六式·铁块'],
  warlord: ['乔拉可尔·米霍克', '波雅·汉库珂', '唐吉诃德·多弗朗明戈', '多弗朗明戈', '克洛克达尔', '月光·莫利亚',
    '莫利亚', '巴索罗缪·熊', '威布尔', '特拉法尔加·罗', '达兹·波涅斯', 'Mr.3', 'Mr.4', 'Mr.5',
    'Miss圣诞快乐', 'Miss双手指', 'Miss黄金周', '维奥莱特', '乔拉', '塞尼奥尔·皮克', '迪亚玛蒂', '皮卡',
    '特雷波尔', '维尔戈', '莫奈', '阿布萨罗姆', '佩罗娜', '砂糖', '德林杰', '拉奥G', '格拉迪乌斯', '贝比5',
    '冯克雷', '巴基', '玛格丽特', '桑达索尼亚', '玛丽哥德', '九蛇弓', '九蛇岛的守护', '斯莱曼', '贝波', '佩金'],
  yonko: ['香克斯', '夏洛特·玲玲', '卡塔库栗', '斯慕吉', '克力架', '欧文', '布琳', '夏洛特·布琳', '夏洛特·欧文',
    '夏洛特·布蕾', '佩罗斯佩罗', '金狮子史基', '洛克斯·D·吉贝克', '本·贝克曼', '耶稣布', '拉基·路', '洛克斯达',
    '席尔巴斯·雷利', '雷利', '夏奇', '哥尔·D·罗杰', '甘福尔', '艾涅尔', '万国的威压', '威布尔巨斧'],
  supernova: ['尤斯塔斯·基德', '基拉', '霍金斯', '阿普', '乌尔基', 'X·德雷克', '乔艾莉·波妮', '卡彭·贝基',
    '卡文迪许', '巴托洛米奥', '最恶世代', '凯撒·克朗', '贝加庞克'],
  revolutionary: ['蒙奇·D·龙', '萨博', '萨波', '伊万科夫', '火之意志'],
  whitebeard: ['爱德华·纽盖特', '白胡子', '波特卡斯·D·艾斯', '艾斯', '马尔科', '乔兹', '比斯塔', '萨奇', '斯库亚德',
    '光月御田', '猫蝮蛇', '犬岚公爵', '佩德罗', '传承之火'],
  beast: ['凯多', '大和', '奎因', '金', '杰克', '佐佐木', '黑色玛利亚', '乌尔蒂', '润媞', '福斯弗', '佩吉万',
    '酒天丸', '黑炭大蛇', '鬼岛决战', '马歇尔·D·蒂奇', '雨之希留', '毒Q', '拉菲特', '范·奥卡', '巴加斯',
    '阿巴罗·比萨罗', '圣胡安·恶狼', '瓦斯卡多', '卡特琳娜·蝶美', '黑团双巨头', '范德戴肯'],
};
// 名字 → faction 索引
const NAME2F = {};
for (const [f, names] of Object.entries(FACTION)) for (const n of names) NAME2F[n] = f;
const FALLBACK = { red: 'strawhat', blue: 'navy', green: 'strawhat', yellow: 'warlord', purple: 'warlord', black: 'beast' };

// ===== 篇章 arc（粗分，图鉴分组用） =====
function arcOf(name) {
  if (/亚尔丽塔|克洛|顿·克利克|阿金|阿龙|斧手蒙卡|巴基|瓦尔波/.test(name)) return 'east_blue';
  if (/薇薇|寇布拉|伊卡莱姆|瓦伊帕|克洛克达尔|达兹|Mr\.|Miss|冯克雷/.test(name)) return 'alabasta';
  if (/甘福尔|艾涅尔/.test(name)) return 'skypiea';
  if (/罗宾|弗兰奇|路奇|卡莉法|卡库|加布拉|斯潘达姆|布鲁诺|冰山/.test(name)) return 'enies_lobby';
  if (/白胡子|纽盖特|艾斯|马尔科|乔兹|比斯塔|萨奇|斯库亚德|战国|卡普|赤犬|萨卡斯基|青雉|波尔萨利诺|汉尼拔|麦哲伦|小萨蒂|多米诺|毒Q|拉菲特|蒂奇|希留/.test(name)) return 'marineford';
  if (/多弗朗明戈|维尔戈|莫奈|维奥莱特|砂糖|皮克|迪亚玛蒂|皮卡|特雷波尔|德林杰|拉奥G|格拉迪乌斯|贝比5|乔拉|居鲁士|蕾贝卡|斯莱曼|塞尼奥尔/.test(name)) return 'dressrosa';
  if (/玲玲|卡塔库栗|斯慕吉|克力架|欧文|布琳|布蕾|佩罗斯佩罗/.test(name)) return 'whole_cake';
  if (/凯多|大和|锦卫门|传次郎|以藏|菊之丞|忍|堪十郎|河松|日和|小玉|霜月康家|耕四郎|古伊娜|龙马|狂死郎|光月|御田|桃之助|雷藏|杰克|奎因|佐佐木|黑色玛利亚|乌尔蒂|润媞|福斯弗|佩吉万|酒天丸|黑炭大蛇|象主|鬼岛/.test(name)) return 'wano';
  return null;
}

function fieldsOf(c) {
  // 融合卡「A&B」取首名匹配
  const first = c.name.split('&')[0].trim();
  const faction = NAME2F[c.name] || NAME2F[first] || FALLBACK[c.color];
  let formation = null;
  const kws = (c.keywords || []).map((k) => (typeof k === 'string' ? k : k.name));
  if (kws.includes('blocker')) formation = 'bulwark';
  else if (kws.some((k) => ['rush', 'doubleAttack', 'banish'].includes(k))) formation = 'vanguard';
  return { faction, formation, arc: arcOf(c.name) };
}

// ===== 三处同步回填（幂等） =====
const paths = ['./data/cards.json', './data/cards-pool3.json', './data/pool3/black.json', './data/pool3/blue.json',
  './data/pool3/green.json', './data/pool3/purple.json', './data/pool3/red.json', './data/pool3/yellow.json'];
let touched = 0, stat = {};
for (const p of paths) {
  const j = JSON.parse(readFileSync(p, 'utf8'));
  const arr = Array.isArray(j) ? j : j.cards;
  for (const c of arr) {
    if (c.faction && c.formation !== undefined) continue; // 幂等
    const f = fieldsOf(c);
    c.faction = f.faction; c.formation = f.formation; c.arc = f.arc;
    stat[f.faction] = (stat[f.faction] || 0) + 1;
    touched++;
  }
  writeFileSync(p, JSON.stringify(j, null, Array.isArray(j) ? 2 : 2) + '\n', 'utf8');
}
console.log('回填', touched, '条（含三源重复计数）；cards.json 阵营分布:');
const cards = JSON.parse(readFileSync('./data/cards.json', 'utf8')).cards;
const fs2 = {};
cards.forEach((c) => { fs2[c.faction] = (fs2[c.faction] || 0) + 1; });
console.log(JSON.stringify(fs2));
const fmt = {};
cards.forEach((c) => { const k = c.formation || 'null'; fmt[k] = (fmt[k] || 0) + 1; });
console.log('阵型分布:', JSON.stringify(fmt));
