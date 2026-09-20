# -*- coding: utf-8 -*-
"""fetch-art-spot.py — 点名三卡程序化图换 wiki 真图（用户反馈：雷迎/空岛/电击毛皮太简单）

文件名已经 allimages/search 验证存在：
  GREEN-E3 雷迎     <- File:Enel using Raigo to destroy Angel Island.png
  GREEN-S2 空岛     <- File:Skypiea_Infobox.png
  GREEN-G2 电击毛皮 <- File:Electro_Infobox.png
下载 600px 缩略图 -> PIL 转 webp -> 覆盖 web/art/<ID>.webp（程序化图原样被替换，
git 可回滚）。用法: python -X utf8 scripts/fetch-art-spot.py [--dry]
"""
import json
import sys
import urllib.parse
import urllib.request
from io import BytesIO

from PIL import Image

PROXY = 'http://127.0.0.1:10809'
API = 'https://onepiece.fandom.com/api.php'
OUT = 'web/art'
TASKS = {
    'GREEN-E3': 'File:Enel using Raigo to destroy Angel Island.png',
    'GREEN-S2': 'File:Skypiea_Infobox.png',
    'GREEN-G2': 'File:Electro_Infobox.png',
}


def opener():
    ph = urllib.request.ProxyHandler({'http': PROXY, 'https': PROXY})
    ctx = None
    try:
        import ssl
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE  # 走代理时 Windows schannel 吊销检查离线，curl 同款 --ssl-no-revoke
    except Exception:
        ctx = None
    return urllib.request.build_opener(ph, urllib.request.HTTPSHandler(context=ctx))


def fetch_json(op, titles):
    q = urllib.parse.urlencode({
        'action': 'query', 'titles': '|'.join(titles), 'prop': 'imageinfo',
        'iiprop': 'url', 'iiurlwidth': '600', 'format': 'json', 'redirects': '1',
    })
    req = urllib.request.Request(f'{API}?{q}', headers={'User-Agent': 'optcg-art/1.0'})
    with op.open(req, timeout=40) as r:
        return json.load(r)


def main():
    dry = '--dry' in sys.argv
    op = opener()
    data = fetch_json(op, TASKS.values())
    url_by_title = {}
    for p in (data.get('query', {}).get('pages', {}) or {}).values():
        t = p.get('title')
        ii = (p.get('imageinfo') or [{}])[0]
        u = ii.get('thumburl') or ii.get('url')
        if t and u:
            url_by_title[t] = u
            url_by_title[t.replace(' ', '_')] = u  # MediaWiki title 空格/下划线等价：两种键都可命中
    ok, miss = [], []
    for cid, title in TASKS.items():
        u = url_by_title.get(title)
        if not u:
            miss.append(f'{cid}:{title} NO-THUMB')
            continue
        if dry:
            ok.append(f'{cid} -> {u}')
            continue
        try:
            req = urllib.request.Request(u, headers={'User-Agent': 'optcg-art/1.0'})
            with op.open(req, timeout=60) as r:
                raw = r.read()
            img = Image.open(BytesIO(raw)).convert('RGB')
            path = f'{OUT}/{cid}.webp'
            img.save(path, 'WEBP', quality=86)
            ok.append(f'{cid} <- {title} ({img.width}x{img.height})')
        except Exception as e:
            miss.append(f'{cid}:{type(e).__name__} {e}')
    for line in ok:
        print('OK', line)
    for line in miss:
        print('MISS', line)
    sys.exit(1 if miss else 0)


if __name__ == '__main__':
    main()
