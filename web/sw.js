// sw.js — PWA 离线缓存（深海航海日志）
// 策略：
//   app shell（页面/js/css/manifest/图标）：network-first —— 线上拿最新（发布即生效），
//     断网回退缓存（离线可玩）；拿到新版本顺手后台刷新缓存。
//   卡图 art/**：cache-first —— 图不变，命中即返，未命中去网络并落缓存。
//   其他同源 GET：透传（不打扰）。
// 版本清理：CACHE 内嵌构建标记（手动 bump，或发布时 deploy 脚本替换）；activate 时清非当前版本。
const VERSION = 'optcg-v0.3.0-op02';
const CACHE = 'optcg-battle-' + VERSION;
const SHELL = [
  './', './index.html', './style.css',
  './app.bundle.js', './captains-data.js', './save.js', './audio.js',
  './game.js', './gallery.js', './modes.js', './onboarding.js',
  './manifest.webmanifest', './icon-192.png', './icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(SHELL).catch(() => {}); // 单文件失败不阻塞安装（network-first 会自愈）
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // 只管同源（wiki 图标等外域透传）

  const isArt = url.pathname.includes('/art/');
  const isShell = !isArt;

  if (isArt) {
    // cache-first：卡图不可变
    e.respondWith((async () => {
      const hit = await caches.match(req);
      if (hit) return hit;
      try {
        const r = await fetch(req);
        if (r.ok) { const c = await caches.open(CACHE); c.put(req, r.clone()); }
        return r;
      } catch (err) {
        return hit || Response.error();
      }
    })());
    return;
  }

  if (isShell) {
    // network-first：线上优先保更新，断网回缓存
    e.respondWith((async () => {
      const c = await caches.open(CACHE);
      try {
        const r = await fetch(req);
        if (r.ok) c.put(req, r.clone());
        return r;
      } catch (err) {
        const hit = await c.match(req, { ignoreSearch: url.pathname.endsWith('/index.html') || url.pathname.endsWith('/') });
        if (hit) return hit;
        throw err;
      }
    })());
  }
});
