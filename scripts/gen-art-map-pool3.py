# -*- coding: utf-8 -*-
"""gen-art-map-pool3.py — 生成 244 张 POOL-3 新 char 的 id→fandom 页名映射 → data/art-map-pool3.json

映射来源两级：
1. 旧卡复用：同角色多版本卡共用旧 fetch-art.py MAP 的页名（中文名归并后缀匹配）
2. 补充表：71 个新登场角色手写英文页名（fandom redirects=1 兜别名）
生成后供 fetch-art.py merge 使用；重跑幂等。
"""
import ast
import json
import re

pool = json.load(open('data/cards.json', encoding='utf8'))
p3 = json.load(open('data/cards-pool3.json', encoding='utf8'))
src = open('scripts/fetch-art.py', encoding='utf8').read()
map_body = src[src.index('MAP = {'):]
map_body = map_body[map_body.index('{'):map_body.index('}') + 1]
MAP = ast.literal_eval(map_body)

id2name = {c['id']: c['name'] for c in pool['cards'] + pool['leaders']}
name2page = {}
for cid, page in MAP.items():
    nm = id2name.get(cid)
    if nm and nm not in name2page:
        name2page[nm] = page

# 新登场角色补充页名（中文名 → onepiece.fandom 页名；redirects=1 兜别名差异）
EXTRA = {
    'Miss双手指': 'Miss Doublefinger', 'Miss圣诞快乐': 'Miss Merry Christmas', 'Miss黄金周': 'Miss Golden Week',
    'Mr.3': 'Galdino', 'Mr.4': 'Mr. 4', 'Mr.5': 'Mr. 5',
    '东利': 'Dorry', '布罗吉': 'Brogy', '乌尔蒂': 'Ulti', '润媞': 'Ulti', '乔拉': 'Giolla',
    '乙姬': 'Otohime', '伊卡莱姆': 'Igaram', '佐佐木': 'Sasaki', '光月御田': 'Kozuki Oden',
    '光月桃之助': 'Kozuki Momonosuke', '克力架': 'Charlotte Cracker', '冰山': 'Iceburg', '古伊娜': 'Kuina',
    '哥尔·D·罗杰': 'Gol D. Roger', '堪十郎': 'Kanjuro', '夏洛特·布琳': 'Charlotte Pudding',
    '夏洛特·布蕾': 'Charlotte Brulee', '夏洛特·欧文': 'Charlotte Oven', '夏洛特·玲玲': 'Charlotte Linlin',
    '奥兹': 'Oars', '威布尔': 'Edward Weevil', '寇布拉': 'Nefertari Cobra', '小玉': 'Tama',
    '巴法罗': 'Buffalo', '库蕾哈': 'Kureha', '德林杰': 'Dellinger', '拉奥G': 'Lao G',
    '斧手蒙卡': 'Morgan', '斯库亚德': 'Squard', '斯莱曼': 'Slayman', '日和': 'Hiyori',
    '格拉迪乌斯': 'Gladius', '泽法': 'Zephyr', '洛克斯·D·吉贝克': 'Rocks D. Xebec', '洛克斯达': 'Rockstar',
    '狂死郎': 'Kyoshiro', '瓦尔波': 'Wapol', '甘福尔': 'Gan Fall', '福斯弗': "Who's Who",
    '维奥莱特': 'Viola', '绿牛': 'Aramaki', '耕四郎': 'Koushirou', '西尔尔克': 'Hiluluk',
    '象主': 'Zunesha', '贝加庞克': 'Vegapunk', '贝比5': 'Baby 5', '贝洛·贝蒂': 'Bello Betty',
    '金狮子史基': 'Shiki', '阿金': 'Gin', '霍格巴克': 'Hogback', '顿·克利克': 'Krieg',
    '黑炭大蛇': 'Kurozumi Orochi', '黑色玛利亚': 'Black Maria', '龙马': 'Shimotsuki Ryuma',
    # 同角色全名/译名变体（旧卡用短名，POOL-3 用全名）
    '波特卡斯·D·艾斯': 'Portgas D. Ace', '萨波': 'Sabo', '爱德华·纽盖特': 'Edward Newgate',
    '妮可·罗宾': 'Nico Robin', '布鲁克': 'Brook', '托尼托尼·乔巴': 'Tony Tony Chopper',
    '蒙奇·D·龙': 'Monkey D. Dragon', '月光·莫利亚': 'Gecko Moria',
    '唐吉诃德·多弗朗明戈': 'Donquixote Doflamingo', '席尔巴斯·雷利': 'Silvers Rayleigh',
    '唐吉诃德·罗西南迪': 'Donquixote Rosinante',
}
name2page.update(EXTRA)

strip = lambda n: re.sub(r'(两年后|霸气|觉醒|五档|月狮|恶灵|鬼气|尼卡)+$', '', n)
out, miss = {}, []
for c in p3:
    if c['type'] != 'char':
        continue
    page = name2page.get(c['name']) or name2page.get(strip(c['name']))
    if page:
        out[c['id']] = page
    else:
        miss.append(c['id'] + ' ' + c['name'])

json.dump(out, open('data/art-map-pool3.json', 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print(f'生成 {len(out)} 条映射 → data/art-map-pool3.json；缺 {len(miss)}')
for m in miss:
    print('MISS', m)
