# -*- coding: utf-8 -*-
"""fetch-art.py — 从 onepiece.fandom.com 批量抓取角色动画立绘 → web/art/{id}.webp

用法：python -X utf8 scripts/fetch-art.py
网络路径：本机代理 127.0.0.1:10809（fandom 直连超时，实测 2026-09-17）
- MediaWiki API action=query&prop=pageimages 批量取 480px 缩略图 URL（50 title/批，redirects=1）
- 下载后 PIL 统一转 webp（前端 art 路径写死 .webp，转格式=零前端改动）
- 单张失败不炸整批；结尾汇总 OK/MISS/FAIL 清单（MISS=title 映射错页，FAIL=下载/转换失败）
事件/舞台/装备卡不在映射内：无对应动画实体图，保留程序化兜底。
"""
import json
import sys
import urllib.parse
import urllib.request
from io import BytesIO

from PIL import Image

API = 'https://onepiece.fandom.com/api.php'
PROXY = {'http': 'http://127.0.0.1:10809', 'https': 'http://127.0.0.1:10809'}
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) optcg-art-fetch/1.0'}
OUT_DIR = 'web/art'

# 卡 id → fandom 页名（英文名/罗马音正名；redirects=1 兜别名差异）
MAP = {
    # leaders
    'LEADER-RED': 'Monkey D. Luffy', 'LEADER-BLUE': 'Nami', 'LEADER-GREEN': 'Roronoa Zoro',
    'LEADER-YELLOW': 'Sanji', 'LEADER-PURPLE': 'Trafalgar Law', 'LEADER-BLACK': 'Shanks',
    # red
    'RED-01': 'Usopp', 'RED-02': 'Koby', 'RED-03': 'Sanji', 'RED-04': 'Bellamy',
    'RED-05': 'Bentham', 'RED-06': 'Sabo', 'RED-07': 'Bartolomeo', 'RED-08': 'Portgas D. Ace',
    'RED-09': 'Cavendish', 'RED-10': 'Chinjao', 'RED-11': 'Buggy', 'RED-12': 'Alvida',
    'RED-13': 'Kuro', 'RED-14': 'Arlong', 'RED-15': 'Nefertari Vivi', 'RED-16': 'Daz Bonez',
    'RED-17': 'Rob Lucci', 'RED-18': 'Charlotte Katakuri', 'RED-19': 'Sakazuki',
    # blue
    'BLUE-01': 'Hatchan', 'BLUE-02': 'Tashigi', 'BLUE-03': 'Pedro', 'BLUE-04': 'Nico Robin',
    'BLUE-05': 'Nekomamushi', 'BLUE-06': 'Inuarashi', 'BLUE-07': 'Smoker', 'BLUE-08': 'Franky',
    'BLUE-09': 'Jinbe', 'BLUE-10': 'Kuzan', 'BLUE-11': 'Monkey D. Garp', 'BLUE-12': 'Borsalino',
    'BLUE-13': 'Shirahoshi', 'BLUE-14': 'Neptune', 'BLUE-15': 'Paulie', 'BLUE-16': 'Spandam',
    'BLUE-17': 'Jabra', 'BLUE-18': 'Kaku', 'BLUE-19': 'Sengoku',
    # green
    'GREEN-01': 'Tony Tony Chopper', 'GREEN-02': 'Raizo', 'GREEN-03': 'Izou', 'GREEN-04': 'Denjiro',
    'GREEN-05': 'Jack', 'GREEN-06': 'Marco', 'GREEN-07': 'Queen', 'GREEN-08': 'King',
    'GREEN-09': 'Yamato', 'GREEN-10': 'Edward Newgate', 'GREEN-11': 'Wiper', 'GREEN-12': 'Kaidou',
    'GREEN-13': "Kin'emon", 'GREEN-14': 'Kawamatsu', 'GREEN-15': 'Issho', 'GREEN-16': 'Rebecca',
    'GREEN-17': 'Charlotte Perospero', 'GREEN-18': 'Ashura Doji', 'GREEN-19': 'Shimotsuki Yasuie',
    # yellow
    'YELLOW-01': 'Perona', 'YELLOW-02': 'Boa Sandersonia', 'YELLOW-03': 'Boa Marigold',
    'YELLOW-04': 'Gecko Moria', 'YELLOW-05': 'Vista', 'YELLOW-06': 'Jozu',
    'YELLOW-07': 'Crocodile', 'YELLOW-08': 'Bartholomew Kuma', 'YELLOW-09': 'Donquixote Doflamingo',
    'YELLOW-10': 'Enel', 'YELLOW-11': 'Boa Hancock', 'YELLOW-12': 'Margaret',
    'YELLOW-13': 'Senor Pink', 'YELLOW-14': 'Diamante', 'YELLOW-15': 'Pica', 'YELLOW-16': 'Trebol',
    'YELLOW-17': 'Vergo', 'YELLOW-18': 'Monet', 'YELLOW-19': 'Absalom',
    # purple
    'PURPLE-01': 'Bepo', 'PURPLE-02': 'Shakuyaku', 'PURPLE-03': 'Penguin',
    'PURPLE-04': 'Basil Hawkins', 'PURPLE-05': 'Scratchmen Apoo', 'PURPLE-06': 'Killer',
    'PURPLE-07': 'Caesar Clown', 'PURPLE-08': 'X Drake', 'PURPLE-09': 'Eustass Kid',
    'PURPLE-10': 'Dracule Mihawk', 'PURPLE-11': 'Jewelry Bonney', 'PURPLE-12': 'Capone Bege',
    'PURPLE-13': 'Urouge', 'PURPLE-14': 'Page One', 'PURPLE-15': 'Caribou',
    'PURPLE-16': 'Donquixote Rosinante', 'PURPLE-17': 'Tsuru', 'PURPLE-18': 'Jean Bart',
    'PURPLE-19': 'Silvers Rayleigh',
    # black
    'BLACK-01': 'Doc Q', 'BLACK-02': 'Lafitte', 'BLACK-03': 'Van Augur', 'BLACK-04': 'Jesus Burgess',
    'BLACK-05': 'Vasco Shot', 'BLACK-06': 'Avalo Pizarro', 'BLACK-07': 'Catarina Devon',
    'BLACK-08': 'Shiryu', 'BLACK-09': 'Sanjuan Wolf', 'BLACK-10': 'Magellan',
    'BLACK-11': 'Marshall D. Teach', 'BLACK-12': 'Hannyabal', 'BLACK-13': 'Blueno',
    'BLACK-14': 'Domino', 'BLACK-15': 'Sadie', 'BLACK-16': 'Benn Beckman', 'BLACK-17': 'Yasopp',
    'BLACK-18': 'Lucky Roux', 'BLACK-19': 'Kong',
}


def opener():
    return urllib.request.build_opener(urllib.request.ProxyHandler(PROXY))


def fetch(url, binary=False, retry=1):
    for attempt in range(retry + 1):
        try:
            req = urllib.request.Request(url, headers=UA)
            with opener().open(req, timeout=25) as r:
                data = r.read()
            return data if binary else json.loads(data.decode('utf-8'))
        except Exception:
            if attempt == retry:
                raise


def query_thumbs(titles):
    """一批 ≤50 title → {请求title: 缩略图URL or None}（含 redirect/normalize 归并）"""
    q = urllib.parse.urlencode({
        'action': 'query', 'prop': 'pageimages', 'piprop': 'thumbnail',
        'pithumbsize': 480, 'redirects': '1', 'format': 'json',
        'titles': '|'.join(titles),
    })
    data = fetch(f'{API}?{q}')
    query = data.get('query', {})
    redir = {r['from']: r['to'] for r in query.get('redirects', [])}
    norm = {n['from']: n['to'] for n in query.get('normalized', [])}
    pages = {p['title']: p.get('thumbnail', {}).get('source')
             for p in query.get('pages', {}).values()}
    out = {}
    for t in titles:
        resolved = redir.get(norm.get(t, t), norm.get(t, t))
        resolved = redir.get(resolved, resolved)
        out[t] = pages.get(resolved)
    return out


def main():
    # POOL-3 扩展映射合并（data/art-map-pool3.json，gen-art-map-pool3.py 生成）
    try:
        import os
        ext_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'art-map-pool3.json')
        MAP.update(json.load(open(ext_path, encoding='utf8')))
    except Exception as e:
        print(f'WARN 扩展映射未加载: {e}', file=sys.stderr)

    import os
    todo = {cid: t for cid, t in MAP.items()
            if not os.path.exists(f'{OUT_DIR}/{cid}.webp')}  # 断点重跑：已有图跳过
    print(f'total {len(MAP)}，待抓 {len(todo)}（已存在跳过）', file=sys.stderr)

    title_to_ids = {}
    for cid, title in todo.items():
        title_to_ids.setdefault(title, []).append(cid)

    all_titles = sorted(title_to_ids)
    thumb_of = {}
    for i in range(0, len(all_titles), 50):
        batch = all_titles[i:i + 50]
        thumb_of.update(query_thumbs(batch))
        print(f'query {i + len(batch)}/{len(all_titles)}', file=sys.stderr)

    ok, miss, fail = [], [], []
    for cid, title in todo.items():
        url = thumb_of.get(title)
        if not url:
            miss.append((cid, title))
            continue
        try:
            raw = fetch(url, binary=True, retry=2)
            img = Image.open(BytesIO(raw))
            img = img.convert('RGB') if img.mode != 'RGB' else img
            img.save(f'{OUT_DIR}/{cid}.webp', 'WEBP', quality=85)
            ok.append(cid)
        except Exception as e:
            fail.append((cid, f'{type(e).__name__}: {str(e)[:60]}'))

    print(f'OK {len(ok)} / MISS {len(miss)} / FAIL {len(fail)}')
    for cid, t in miss:
        print(f'MISS {cid} {t}')
    for cid, why in fail:
        print(f'FAIL {cid} {why}')
    return 0 if not miss and not fail else 1


if __name__ == '__main__':
    sys.exit(main())
