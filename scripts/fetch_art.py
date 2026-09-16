# -*- coding: utf-8 -*-
# 卡图抓取 v2：wiki 文件名 -> md5 路径 -> CDN 下载 -> webp 本地化
# 输出：78 张对局卡 -> web/art/<ID>.webp；6 船长 -> web/art/captains/<name>.webp（语义化命名，cards.json art 字段引用同路径）
# 依据：MediaWiki 图片路径 = md5(文件名)[0]/[0:2]/文件名（Sanji 样例已验证）；static.wikia.nocookie.net 本机直连可达
# 用法: python scripts/fetch_art.py
import hashlib, subprocess, sys, time, os
from urllib.parse import quote

CDN = 'https://static.wikia.nocookie.net/onepiece/images/{a}/{ab}/{name}/revision/latest'
TMP = os.path.join(os.path.dirname(__file__), '_art_tmp')
ROOT = os.path.join(os.path.dirname(__file__), '..')
OUT_CARD = os.path.join(ROOT, 'web', 'art')          # <ID>.webp
OUT_CAP = os.path.join(OUT_CARD, 'captains')          # <name>.webp

def P(base):  # 角色立绘四种常见命名模式（按优先级）
    return [f'{base}_Anime_Post_Timeskip_Infobox.png', f'{base}_Anime_Infobox.png',
            f'{base}_Anime_Pre_Timeskip_Infobox.png', f'{base}_Manga_Infobox.png']

# (输出名, 候选文件名列表, 目录)；输出名不带扩展名
TASKS = [
  # ===== 6 船长（语义化命名；cards.json leaders[].art = captains/<name>）=====
  ('captains/luffy',  ['Monkey_D._Luffy_Anime_Post_Timeskip_Infobox.png']),
  ('captains/zoro',   P('Roronoa_Zoro')),
  ('captains/nami',   ['Nami_Anime_Post_Timeskip_Infobox.png']),
  ('captains/sanji',  ['Sanji_Anime_Post_Timeskip_Infobox.png']),
  ('captains/law',    ['Trafalgar_D._Water_Law_Anime_Post_Timeskip_Infobox.png']),
  ('captains/shanks', P('Shanks')),
  # ===== 60 角色卡 =====
  ('RED-01', P('Usopp')), ('RED-02', P('Koby')), ('RED-03', P('Sanji')), ('RED-04', P('Bellamy')),
  ('RED-05', P('Bentham')), ('RED-06', P('Sabo')), ('RED-07', P('Bartolomeo')),
  ('RED-08', P('Portgas_D._Ace')), ('RED-09', P('Cavendish')), ('RED-10', P('Chinjao')),
  ('BLUE-01', P('Hack')), ('BLUE-02', P('Tashigi')), ('BLUE-03', P('Pedro')), ('BLUE-04', P('Nico_Robin')),
  ('BLUE-05', P('Nekomamushi')), ('BLUE-06', P('Inuarashi')), ('BLUE-07', P('Smoker')),
  ('BLUE-08', P('Franky')), ('BLUE-09', P('Jinbe')), ('BLUE-10', P('Kuzan')),
  ('GREEN-01', P('Tony_Tony_Chopper')), ('GREEN-02', P('Raizo')), ('GREEN-03', P('Izou')),
  ('GREEN-04', P('Denjiro')), ('GREEN-05', P('Jack')),
  ('GREEN-06', ['Marco_Anime_Post_Timeskip_Infobox.png']),          # og:image 实锤（探测 miss=网络抖动）
  ('GREEN-07', P('Queen')), ('GREEN-08', P('King')), ('GREEN-09', P('Yamato')), ('GREEN-10', P('Edward_Newgate')),
  ('YELLOW-01', P('Perona')), ('YELLOW-02', P('Boa_Sandersonia')), ('YELLOW-03', P('Boa_Marigold')),
  ('YELLOW-04', P('Gecko_Moria')), ('YELLOW-05', P('Vista')), ('YELLOW-06', P('Jozu')),
  ('YELLOW-07', P('Crocodile')), ('YELLOW-08', P('Bartholomew_Kuma')),
  ('YELLOW-09', P('Donquixote_Doflamingo')), ('YELLOW-10', P('Enel')),
  ('PURPLE-01', P('Bepo')), ('PURPLE-02', P('Shakuyaku') + P('Shakky')), ('PURPLE-03', P('Pekoms')),
  ('PURPLE-04', P('Basil_Hawkins')), ('PURPLE-05', P('Scratchmen_Apoo')), ('PURPLE-06', P('Killer')),
  ('PURPLE-07', P('Caesar_Clown')), ('PURPLE-08', P('X_Drake')), ('PURPLE-09', P('Eustass_Kid')),
  ('PURPLE-10', P('Dracule_Mihawk')),
  ('BLACK-01', P('Doc_Q')), ('BLACK-02', P('Laffitte')),
  ('BLACK-03', ['Van_Augur_Anime_Post_Timeskip_Infobox.png']),       # og:image 实锤
  ('BLACK-04', P('Jesus_Burgess')), ('BLACK-05', P('Vasco_Shot')), ('BLACK-06', P('Avalo_Pizarro')),
  ('BLACK-07', P('Catarina_Devon')), ('BLACK-08', P('Shiryu')), ('BLACK-09', P('Sanjuan_Wolf')),
  ('BLACK-10', P('Magellan')),
  # ===== 12 事件卡（关联角色/专属页；与 leader 同角色者优先不同造型避免撞图）=====
  ('RED-E1',  ['Portgas_D._Ace_Manga_Infobox.png'] + P('Portgas_D._Ace')),
  ('RED-E2',  ['Monkey_D._Luffy_Anime_Pre_Timeskip_Infobox.png']),
  ('BLUE-E1', ['Nami_Anime_Pre_Timeskip_Infobox.png']),
  ('BLUE-E2', ['Zeus_Anime_Infobox.png', 'Zeus_Infobox.png', 'Zeus.png'] + P('Nami')),
  ('GREEN-E1',['Kaidou_Manga_Infobox.png'] + P('Kaidou')),
  ('GREEN-E2',["Beasts_Pirates'_Jolly_Roger.png", 'Beasts_Pirates_Infobox.png', 'Beasts_Pirates_Flag.png', 'Beasts_Pirates.png']),
  ('YELLOW-E1',['Boa_Hancock_Manga_Infobox.png'] + P('Boa_Hancock')),
  ('YELLOW-E2',['Boa_Hancock_Anime_Pre_Timeskip_Infobox.png'] + P('Boa_Hancock')),
  ('PURPLE-E1',['Trafalgar_D._Water_Law_Manga_Infobox.png'] + P('Trafalgar_D._Water_Law')),
  ('PURPLE-E2',['Trafalgar_D._Water_Law_Anime_Pre_Timeskip_Infobox.png'] + P('Trafalgar_D._Water_Law')),
  ('BLACK-E1',['Yami_Yami_no_Mi_Infobox.png', 'Yami_Yami_no_Mi.png'] + P('Marshall_D._Teach')),
  ('BLACK-E2',['Marshall_D._Teach_Anime_Pre_Timeskip_Infobox.png'] + P('Marshall_D._Teach')),
  # ===== 6 舞台卡（场景页 infobox）=====
  ('RED-S1',    ['Going_Merry_Infobox.png', 'Going_Merry_Anime_Infobox.png', 'Going_Merry.png']),
  ('BLUE-S1',   ['Cocoyasi_Village_Infobox.png', 'Cocoyasi_Village.png']),
  ('GREEN-S1',  ['Onigashima_Infobox.png', 'Onigashima.png']),
  ('YELLOW-S1', ['Amazon_Lily_Infobox.png', 'Amazon_Lily.png']),
  ('PURPLE-S1', ['Polar_Tang_Infobox.png', 'Polar_Tang.png']),
  ('BLACK-S1',  ['Impel_Down_Infobox.png', 'Impel_Down.png']),
]

def url_of(name):
    h = hashlib.md5(name.encode()).hexdigest()
    return CDN.format(a=h[0], ab=h[:2], name=quote(name))

def probe(url):
    r = subprocess.run(['curl', '-s', '-o', '/dev/null', '-w', '%{http_code}',
                        '--max-time', '25', url], capture_output=True, text=True)
    return r.stdout.strip()

def main():
    os.makedirs(TMP, exist_ok=True)
    os.makedirs(OUT_CARD, exist_ok=True)
    os.makedirs(OUT_CAP, exist_ok=True)
    ok, miss = [], []
    for out, cands in TASKS:
        hit = None
        for name in cands:
            u = url_of(name)
            if probe(u) == '200':
                hit = (name, u); break
            time.sleep(0.12)
        if not hit:
            miss.append(out); print(f'MISS {out}', flush=True); continue
        name, u = hit
        png = os.path.join(TMP, out.replace('/', '_') + '.png')
        subprocess.run(['curl', '-s', '--max-time', '40', '-o', png, u], check=True)
        webp = os.path.join(OUT_CARD, out + '.webp')
        r = subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', png,
                            '-vf', 'scale=512:512:force_original_aspect_ratio=decrease',
                            '-q:v', '80', webp], capture_output=True, text=True)
        size = os.path.getsize(webp) if os.path.exists(webp) else 0
        if r.returncode != 0 or size < 2000:
            miss.append(out); print(f'FAIL {out} rc={r.returncode} size={size}', flush=True); continue
        ok.append(out); print(f'DONE {out} <- {name} ({size//1024}KB)', flush=True)
        time.sleep(0.15)
    print(f'\n== {len(ok)} ok, {len(miss)} miss ==', flush=True)
    if miss:
        print('miss: ' + ' '.join(miss), flush=True)
        sys.exit(1)

if __name__ == '__main__':
    main()
