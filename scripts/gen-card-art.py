#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""P2 卡图批量生成：S/SS/SSS 缺图卡 → 豆包客户端(CDP 9225)串行单发 → fiber 取 image_ori_raw(无水印) → 竖裁 3:4 → webp

用法（系统 python，依赖 playwright + Pillow）：
  python scripts/gen-card-art.py --limit 1            # 首件门禁：只做 1 张
  python scripts/gen-card-art.py --rarity SSS,SS      # 指定档位
  python scripts/gen-card-art.py                      # 按 data/art-todo.json 全量（SSS→SS→S 序）
断点续跑：web/art/{id}.webp 已存在即跳过。
熔断：连续 3 张失败（超时/无新图/下载失败）→ 停 + 汇总（external-service 熔断三件套）。
间隔：单发 --gap 秒（默认 20，风控谨慎节奏）。
"""
import argparse, io, json, re, sys, time, urllib.request
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

from playwright.sync_api import sync_playwright
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
CDP = "http://127.0.0.1:9225"
ART = ROOT / "web" / "art"
TMP = ROOT / "data" / "art-raw"
ART.mkdir(exist_ok=True)
TMP.mkdir(exist_ok=True)

FACTION_CN = {
    "strawhat": "草帽海贼团", "navy": "海军", "warlord": "王下七武海", "yonko": "四皇海贼团",
    "supernova": "最恶世代超新星", "revolutionary": "革命军", "whitebeard": "白胡子海贼团", "beast": "百兽海贼团",
}
ARC_CN = {
    "east_blue": "东海小镇与海岸", "alabasta": "沙漠王国", "skypiea": "空中岛屿", "enies_lobby": "司法岛",
    "marineford": "海军本部决战战场", "dressrosa": "斗技场与玩具之国", "whole_cake": "点心城堡",
    "wano": "和之国日式城下町",
}
RARITY_MOOD = {
    "A": "平实", "B": "明快", "S": "英气勃发", "SS": "气势磅礴的传说强者", "SSS": "神话级传说决战，史诗气场全开",
}

# fiber 取图（与 planet-v2 fetch_original.py 同构：props.imageContent 四档签名 URL，原样直下）
JS_EXTRACT = r"""
() => {
  const imgs = [...document.querySelectorAll('img')].filter(i => (i.src||'').includes('rc_gen_image'));
  const out = [];
  for (const el of imgs) {
    const fk = Object.keys(el).find(k => k.startsWith('__reactFiber$'));
    if (!fk) continue;
    let f = el[fk], ic = null, depth = 0;
    while (f && depth < 40) {
      const p = f.memoizedProps;
      if (p && p.imageContent) { ic = p.imageContent; break; }
      f = f.return; depth++;
    }
    if (ic && ic.key) out.push({
      key: ic.key,
      raw: ic.image_ori_raw && ic.image_ori_raw.url || null,
      ori: ic.image_ori && ic.image_ori.url || null,
    });
  }
  const seen = new Set();
  return out.filter(o => !seen.has(o.key) && seen.add(o.key));
}
"""


def build_prompt(c):
    fac = FACTION_CN.get(c.get("faction"), "海贼")
    arc = ARC_CN.get(c.get("arc"), "广阔大海")
    mood = RARITY_MOOD.get(c.get("rarity"), "英气")
    return (
        f"集换式卡牌游戏的角色卡面插画，竖幅单人构图：动漫《海贼王》世界观中的角色「{c['name']}」，"
        f"所属阵营「{fac}」，场景意象：{arc}。人物气质：{mood}。"
        f"动态站姿或战斗姿势，戏剧化光影，服饰与配饰细节丰富，日系动画剧场版画风的精细插画。"
        f"画面要求：纯插画无任何文字、无水印、无卡框、无 UI 边框、无签名。"
    )


def download(url, path):
    req = urllib.request.Request(url, headers={
        "Referer": "https://www.doubao.com/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                      "(KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
    })
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    with opener.open(req, timeout=120) as r, open(path, "wb") as f:
        f.write(r.read())


def to_portrait_webp(raw_png, out_webp, width=480):
    """2880x1440 横图 → 居中裁 3:4 竖幅 → 缩到 width 宽 → webp q90"""
    im = Image.open(raw_png).convert("RGB")
    w, h = im.size
    th = h
    tw = int(h * 3 / 4)
    if tw > w:  # 竖图兜底：按宽裁
        tw, th = w, int(w * 4 / 3)
    x0 = (w - tw) // 2
    im = im.crop((x0, 0, x0 + tw, th))
    if im.width > width:
        im = im.resize((width, int(width * im.height / im.width)), Image.LANCZOS)
    im.save(out_webp, "WEBP", quality=90)
    return im.size


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--rarity", default="SSS,SS,S")
    ap.add_argument("--gap", type=int, default=20)
    ap.add_argument("--timeout", type=int, default=150)
    args = ap.parse_args()

    todo = json.loads((ROOT / "data" / "art-todo.json").read_text(encoding="utf-8"))
    order = [r.strip() for r in args.rarity.split(",") if r.strip()]
    jobs = []
    for r in order:
        for cid in todo.get(r, []):
            if not (ART / f"{cid}.webp").exists():
                jobs.append(cid)
    if args.limit:
        jobs = jobs[:args.limit]
    if not jobs:
        print("无待办（全部已生成或清单为空）")
        return
    print(f"待生成 {len(jobs)} 张：{jobs[:5]}{'...' if len(jobs) > 5 else ''}")

    cards = {c["id"]: c for c in json.loads((ROOT / "data" / "cards.json").read_text(encoding="utf-8"))["cards"]}
    ok, fail = [], []
    with sync_playwright() as pw:
        browser = pw.chromium.connect_over_cdp(CDP)
        page = None
        for ctx in browser.contexts:
            for p in ctx.pages:
                if "doubao" in (p.url or "") and "chat" in (p.url or ""):
                    page = p
                    break
            if page:
                break
        if not page:
            print("FAIL 未找到豆包聊天页（确认客户端已开且带 9225）")
            sys.exit(1)

        for i, cid in enumerate(jobs):
            card = cards.get(cid)
            if not card:
                fail.append((cid, "卡数据缺失"))
                continue
            prompt = build_prompt(card)
            try:
                editor = page.query_selector('[contenteditable="true"]')
                if not editor:
                    raise RuntimeError("找不到输入框")
                keys0 = set(x["key"] for x in page.evaluate(JS_EXTRACT))  # 发送前已渲染图的 fiber key 集
                editor.click()
                page.keyboard.type(prompt, delay=20)
                time.sleep(1.5)
                page.keyboard.press("Enter")

                # 轮询新图：fiber key 不在 keys0 里（虚拟列表只挂载近期卡，keys0 已含历史可见卡）
                deadline = time.time() + args.timeout
                info = None
                while time.time() < deadline:
                    cards_now = page.evaluate(JS_EXTRACT)
                    fresh = [x for x in cards_now if x["key"] not in keys0 and (x["raw"] or x["ori"])]
                    if fresh:
                        info = fresh[-1]
                        break
                    time.sleep(3)
                if not info:
                    raise RuntimeError("超时未出新图")
                url = info["raw"] or info["ori"]
                raw_png = TMP / f"{cid}.png"
                download(url, raw_png)
                size = to_portrait_webp(raw_png, ART / f"{cid}.webp")
                ok.append(cid)
                print(f"[{i+1}/{len(jobs)}] {cid} {card['name']} OK {size[0]}x{size[1]}")
                raw_png.unlink(missing_ok=True)
            except Exception as e:
                fail.append((cid, str(e)[:120]))
                print(f"[{i+1}/{len(jobs)}] {cid} FAIL {str(e)[:120]}")
                # 输入框残留清理：全选删除，防 prompt 叠加
                try:
                    editor = page.query_selector('[contenteditable="true"]')
                    if editor:
                        editor.click()
                        page.keyboard.press("Control+a")
                        page.keyboard.press("Delete")
                except Exception:
                    pass
            # 熔断：连续 3 失败
            if len(fail) >= 3 and len(ok) == 0:
                print("CIRCUIT-BREAK：连续失败且零成功，停（检查豆包登录态/风控提示）")
                break
            if i < len(jobs) - 1:
                time.sleep(args.gap)

    print(f"===== 完成：成功 {len(ok)} 失败 {len(fail)} =====")
    for cid, why in fail:
        print(f"  FAIL {cid}: {why}")
    if fail:
        sys.exit(1)


if __name__ == "__main__":
    main()
