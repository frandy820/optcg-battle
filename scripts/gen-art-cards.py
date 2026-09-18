# -*- coding: utf-8 -*-
"""gen-art-cards.py — 事件/舞台/装备卡程序化卡面生成 → web/art/{id}.webp

fetch-art.py 角色立绘不覆盖这三类（无对应动画实体图），此脚本补齐 30 张缺图：
统一「深海夜航 × 烫金」设计语言，六色主题，三类模板：
  event = 中央放射光焰 + 大字卡名
  stage = 海平线层浪 + 场景名
  gear  = 器物剪影（刀/准星/盾按卡名关键词）+ 器名
用法：python -X utf8 scripts/gen-art-cards.py [--dry]
"""
import json
import math
import os
import sys

from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 600, 480  # 卡面 art 区 ~1.26:1（cover 裁切安全：主体居中）
FONT = 'C:/Windows/Fonts/msyh.ttc'
FONT_B = 'C:/Windows/Fonts/msyhbd.ttc'

# 六色主题（亮=纹样主色，深=底色）
THEME = {
    'red':    {'hi': (229, 72, 77), 'lo': (46, 12, 16), 'glow': (255, 120, 110)},
    'blue':   {'hi': (61, 139, 253), 'lo': (10, 20, 42), 'glow': (120, 180, 255)},
    'green':  {'hi': (47, 191, 113), 'lo': (8, 26, 20), 'glow': (110, 240, 160)},
    'yellow': {'hi': (242, 201, 76), 'lo': (38, 30, 8), 'glow': (255, 220, 130)},
    'purple': {'hi': (160, 108, 213), 'lo': (24, 14, 38), 'glow': (200, 160, 255)},
    'black':  {'hi': (154, 165, 184), 'lo': (14, 16, 22), 'glow': (200, 210, 230)},
}
GOLD = (212, 175, 55)
GOLD_BRIGHT = (245, 215, 110)
CREAM = (244, 236, 216)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def base_canvas(color):
    th = THEME[color]
    img = Image.new('RGB', (W, H))
    dr = ImageDraw.Draw(img)
    # 纵向渐变深底：主题深色 ×2 → 近黑
    for y in range(H):
        t = y / H
        c = lerp(th['lo'], (4, 8, 18), t * .85)
        dr.line([(0, y), (W, y)], fill=c)
    # 顶部主题光晕（radial 近似：大椭圆模糊）
    glow = Image.new('RGB', (W, H), (0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([W * .1, -H * .25, W * .9, H * .45], fill=th['glow'])
    glow = glow.filter(ImageFilter.GaussianBlur(90))
    img = Image.blend(img, Image.blend(img, glow, 0.30), 0.55)
    # 星点
    import random
    rnd = random.Random(42)
    dr = ImageDraw.Draw(img)
    for _ in range(26):
        x, y = rnd.randint(0, W), rnd.randint(0, H)
        r = rnd.choice([1, 1, 2])
        a = rnd.randint(60, 160)
        dr.ellipse([x - r, y - r, x + r, y + r], fill=(a, a, min(255, a + 30)))
    return img


def gold_frame(dr):
    dr.rectangle([10, 10, W - 10, H - 10], outline=GOLD, width=2)
    dr.rectangle([16, 16, W - 16, H - 16], outline=(138, 109, 31), width=1)


def rays(img, color, cx=W // 2, cy=H // 2, n=14, long=300, short=120):
    """放射光焰（event 模板）：中心向外的长三角条，主题色→透明渐层靠分层叠加"""
    th = THEME[color]
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    dr = ImageDraw.Draw(layer)
    for i in range(n):
        ang = i * (2 * math.pi / n) + 0.12
        L = long if i % 2 == 0 else short
        wdt = 10 if i % 2 == 0 else 5
        x2, y2 = cx + math.cos(ang) * L, cy + math.sin(ang) * L
        x1a = cx + math.cos(ang + math.pi / 2) * wdt, cy + math.sin(ang + math.pi / 2) * wdt
        x1b = cx + math.cos(ang - math.pi / 2) * wdt, cy + math.sin(ang - math.pi / 2) * wdt
        c = th['hi'] if i % 2 == 0 else th['glow']
        dr.polygon([x1a, x1b, (x2, y2)], fill=c + (110 if i % 2 == 0 else 70,))
    layer = layer.filter(ImageFilter.GaussianBlur(3))
    img.paste(layer, (0, 0), layer)
    # 中心亮核
    core = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    cd = ImageDraw.Draw(core)
    cd.ellipse([cx - 46, cy - 46, cx + 46, cy + 46], fill=th['glow'] + (170,))
    core = core.filter(ImageFilter.GaussianBlur(40))
    img.paste(core, (0, 0), core)


def waves(img, color, horizon=H * .62):
    """海平线层浪（stage 模板）：3 层波浪剪影由远及近渐深"""
    th = THEME[color]
    dr = ImageDraw.Draw(img, 'RGBA')
    # 地平线光带
    dr.line([(0, horizon), (W, horizon)], fill=th['glow'] + (150,), width=2)
    import random
    for li, depth in enumerate([0.55, 0.75, 1.0]):
        top = horizon + 14 + li * 34
        c = lerp(th['hi'], th['lo'], 0.35 + li * 0.18)
        rnd = random.Random(7 + li)
        pts = [(0, H), (0, top)]
        x = 0
        while x < W:
            nx = x + rnd.randint(60, 110)
            amp = rnd.randint(6, 14)
            pts += [(x + (nx - x) / 2, top - amp), (nx, top)]
            x = nx
        pts += [(W, H)]
        dr.polygon(pts, fill=c + (200 - li * 30,))


def katana(dr, cx, cy, size=1.0):
    """武士刀剪影：斜置刀身 + 护手 + 柄"""
    L, ang = 150 * size, -0.62  # 右上→左下斜置
    dx, dy = math.cos(ang), math.sin(ang)
    px, py = -dy, dx
    # 刀身（细长四边形，尖端收窄）
    body = [
        (cx - dx * L * .05 + px * 7, cy - dy * L * .05 + py * 7),
        (cx + dx * L * .92 + px * 5, cy + dy * L * .92 + py * 5),
        (cx + dx * L, cy + dy * L),
        (cx + dx * L * .92 - px * 3, cy + dy * L * .92 - py * 3),
        (cx - dx * L * .05 - px * 7, cy - dy * L * .05 - py * 7),
    ]
    dr.polygon(body, fill=(28, 30, 40))
    dr.line(body[:1] + body[1:4] + body[:1], fill=GOLD, width=2)
    # 高光线
    hi_s = (cx + dx * L * .05 + px * 3.5, cy + dy * L * .05 + py * 3.5)
    hi_e = (cx + dx * L * .88 + px * 2.5, cy + dy * L * .88 + py * 2.5)
    dr.line([hi_s, hi_e], fill=(225, 230, 245), width=2)
    # 护手（刀根处的短横条）
    gx, gy = cx - dx * L * .08, cy - dy * L * .08
    dr.line([(gx + px * 14, gy + py * 14), (gx - px * 14, gy - py * 14)], fill=GOLD_BRIGHT, width=6)
    # 柄
    hx, hy = cx - dx * L * .30, cy - dy * L * .30
    dr.line([(gx, gy), (hx, hy)], fill=(60, 40, 20), width=9)
    for t in (.3, .55, .8):
        wx = gx + (hx - gx) * t
        wy = gy + (hy - gy) * t
        dr.line([(wx + px * 5, wy + py * 5), (wx - px * 5, wy - py * 5)], fill=GOLD, width=2)


def scope(dr, cx, cy, r=86):
    """狙击准镜：双圆环 + 十字线 + 光点"""
    dr.ellipse([cx - r, cy - r, cx + r, cy + r], outline=GOLD_BRIGHT, width=5)
    dr.ellipse([cx - r * .55, cy - r * .55, cx + r * .55, cy + r * .55], outline=GOLD, width=3)
    dr.line([(cx - r - 16, cy), (cx - r * .35, cy)], fill=GOLD, width=3)
    dr.line([(cx + r * .35, cy), (cx + r + 16, cy)], fill=GOLD, width=3)
    dr.line([(cx, cy - r - 16), (cx, cy - r * .35)], fill=GOLD, width=3)
    dr.line([(cx, cy + r * .35), (cx, cy + r + 16)], fill=GOLD, width=3)
    dr.ellipse([cx - 6, cy - 6, cx + 6, cy + 6], fill=(255, 90, 80))


def shield(dr, cx, cy, s=1.0, color='black'):
    th = THEME[color]
    r = 80 * s
    # 盾形：上平下尖
    pts = [
        (cx - r * .78, cy - r * .82), (cx + r * .78, cy - r * .82),
        (cx + r * .78, cy + r * .12), (cx, cy + r), (cx - r * .78, cy + r * .12),
    ]
    dr.polygon(pts, fill=lerp(th['hi'], (10, 12, 18), .68))
    dr.line(pts + [pts[0]], fill=GOLD, width=3)
    # 盾面纹：中央 V 亮纹 + 铆钉
    dr.line([(cx - r * .5, cy - r * .6), (cx, cy + r * .5), (cx + r * .5, cy - r * .6)], fill=th['glow'], width=5)
    for sx, sy in [(-.6, -.6), (.6, -.6), (-.6, .05), (.6, .05)]:
        dr.ellipse([cx + r * sx - 3, cy + r * sy - 3, cx + r * sx + 3, cy + r * sy + 3], fill=GOLD_BRIGHT)


def text_block(dr, name, sub, y_top, color_hi=True, size=54):
    """卡名大字（亮金/主题描边）+ 副标题小字"""
    f1 = ImageFont.truetype(FONT_B, size)
    f2 = ImageFont.truetype(FONT, 22)
    # 名字：黑底衬托带
    bb = dr.textbbox((0, 0), name, font=f1)
    tw = bb[2] - bb[0]
    x = (W - tw) / 2 - bb[0]
    pad = 14
    dr.rounded_rectangle([x - pad - bb[0], y_top - 8, x - bb[0] + tw + pad, y_top + bb[3] + 12],
                         radius=10, fill=(4, 8, 18, 235))
    dr.text((x, y_top), name, font=f1, fill=GOLD_BRIGHT, stroke_width=2, stroke_fill=(60, 40, 8))
    if sub:
        bb2 = dr.textbbox((0, 0), sub, font=f2)
        x2 = (W - (bb2[2] - bb2[0])) / 2 - bb2[0]
        dr.text((x2, y_top + bb[3] + 22), sub, font=f2, fill=CREAM)
    return y_top + bb[3]


def make(card):
    color = card['color']
    img = base_canvas(color)
    name, sub, typ = card['name'], card.get('sub', ''), card['type']

    if typ == 'event':
        rays(img, color, cy=H * .44)
        dr = ImageDraw.Draw(img)
        gold_frame(dr)
        text_block(dr, name, sub, H * .50)
    elif typ == 'stage':
        waves(img, color)
        dr = ImageDraw.Draw(img, 'RGBA')
        gold_frame(dr)
        text_block(dr, name, sub, H * .30)
    else:  # gear
        dr = ImageDraw.Draw(img, 'RGBA')
        if any(k in name for k in ('鬼彻', '时雨', '羽羽斩', '黑刀', '鬼哭')):
            katana(dr, W // 2, H * .40)
        elif '镜' in name:
            scope(dr, W // 2, H * .40)
        else:
            shield(dr, W // 2, H * .40, color=color)
        gold_frame(dr)
        text_block(dr, name, sub, H * .62, size=48)

    # 类型角标（左上小徽记）
    f3 = ImageFont.truetype(FONT_B, 20)
    label = {'event': '事 件', 'stage': '舞 台', 'gear': '装 备'}[typ]
    dr.rounded_rectangle([26, 26, 26 + 20 + len(label) * 22, 62], radius=6, fill=(4, 8, 18))
    dr.rectangle([26, 26, 32, 62], fill=GOLD)
    dr.text((44, 30), label, font=f3, fill=GOLD_BRIGHT)
    return img


def main():
    dry = '--dry' in sys.argv
    cards = json.load(open('data/cards.json', encoding='utf-8'))
    cards = cards['cards'] if isinstance(cards, dict) else cards
    targets = [c for c in cards
               if c['type'] in ('event', 'stage', 'gear')
               and not os.path.exists(f"web/art/{c.get('art', c['id'])}.webp")]
    print(f'targets: {len(targets)}')
    ok = 0
    for c in targets:
        img = make(c)
        out = f"web/art/{c.get('art', c['id'])}.webp"
        if not dry:
            img.save(out, 'WEBP', quality=88)
        ok += 1
        print('OK', out)
    print(f'done {ok}/{len(targets)}' + (' (dry)' if dry else ''))


if __name__ == '__main__':
    main()
