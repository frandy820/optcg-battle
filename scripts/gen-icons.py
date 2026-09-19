# -*- coding: utf-8 -*-
"""gen-icons.py — PWA 应用图标生成 → web/icon-192.png / web/icon-512.png
深海夜航 × 烫金罗盘（与游戏 captains fallbackArt 纹章同一设计语言）
用法：python -X utf8 scripts/gen-icons.py
"""
import math
import os

from PIL import Image, ImageDraw, ImageFilter, ImageFont

GOLD = (212, 175, 55)
GOLD_BRIGHT = (245, 215, 110)
CREAM = (244, 236, 216)
FONT_B = 'C:/Windows/Fonts/msyhbd.ttc'


def make(size):
    img = Image.new('RGB', (size, size))
    dr = ImageDraw.Draw(img)
    # 纵向深海渐变
    for y in range(size):
        t = y / size
        c = tuple(int(a + (b - a) * t) for a, b in zip((16, 29, 56), (4, 8, 18)))
        dr.line([(0, y), (size, y)], fill=c)
    # 顶部光晕
    glow = Image.new('RGB', (size, size), (0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([size * .1, -size * .3, size * .9, size * .4], fill=(80, 120, 190))
    glow = glow.filter(ImageFilter.GaussianBlur(size * .18))
    img = Image.blend(img, Image.blend(img, glow, 0.5), 0.35)
    dr = ImageDraw.Draw(img)
    # 星点
    import random
    rnd = random.Random(7)
    for _ in range(int(size / 16)):
        x, y = rnd.randint(0, size), rnd.randint(0, size)
        r = rnd.choice([1, 1, 2])
        a = rnd.randint(50, 140)
        dr.ellipse([x - r, y - r, x + r, y + r], fill=(a, a, min(255, a + 30)))
    cx, cy = size * .5, size * .46
    # 罗盘外环（双金环 + 刻度）
    r1 = size * .36
    dr.ellipse([cx - r1, cy - r1, cx + r1, cy + r1], outline=GOLD, width=max(2, size // 128))
    r2 = size * .30
    dr.ellipse([cx - r2, cy - r2, cx + r2, cy + r2], outline=GOLD_BRIGHT, width=max(1, size // 192))
    for i in range(16):
        ang = i * math.pi / 8
        rr = r1 - size * .02
        dr.line([(cx + math.cos(ang) * rr, cy + math.sin(ang) * rr),
                 (cx + math.cos(ang) * r1, cy + math.sin(ang) * r1)], fill=GOLD_BRIGHT,
                width=max(1, size // 256))
    # 指北菱形指针（双色四芒）
    pts = [(cx, cy - r2 * .92), (cx + r2 * .38, cy), (cx, cy + r2 * .92), (cx - r2 * .38, cy)]
    dr.polygon([pts[0], pts[1], (cx, cy)], fill=(232, 86, 63))
    dr.polygon([pts[2], pts[3], (cx, cy)], fill=(79, 182, 232))
    dr.polygon([pts[1], pts[2], (cx, cy)], fill=(60, 76, 110))
    dr.polygon([pts[3], pts[0], (cx, cy)], fill=(60, 76, 110))
    dr.polygon([pts[0], pts[1], pts[2], pts[3]], outline=GOLD_BRIGHT, width=max(1, size // 256))
    dr.ellipse([cx - size * .03, cy - size * .03, cx + size * .03, cy + size * .03], fill=GOLD_BRIGHT)
    # 底部字标
    f = ImageFont.truetype(FONT_B, int(size * .11))
    label = '航海王卡牌对战'
    bb = dr.textbbox((0, 0), label, font=f)
    x = (size - (bb[2] - bb[0])) / 2 - bb[0]
    dr.text((x, size * .80 - bb[1]), label, font=f, fill=CREAM)
    return img


def main():
    here = os.path.join(os.path.dirname(__file__), '..')
    for n in (192, 512):
        p = os.path.join(here, 'web', f'icon-{n}.png')
        make(n).save(p, 'PNG', optimize=True)
        print('OK', p, os.path.getsize(p) // 1024, 'KB')


if __name__ == '__main__':
    main()
