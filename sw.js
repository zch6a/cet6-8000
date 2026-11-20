// 六级 8000 词 · 离线缓存：第二次打开直接从本机读；装好之后断网（地铁、飞机）也能打开、背诵、自测
// 词表数据（data/core.js / extra.js / scenes.js?v=内容指纹）内容一变地址就变，所以可以放心长期缓存。
// 数据放在一个不随版本改名的缓存里：网站更新后只重新下载真正变了的文件（没变的 extra.js 不用再下一遍）。
// 页面本身先走网络拿最新版，断网时才用缓存。
const VERSION = '14a69b19ff57d6cd';
const PAGE_CACHE = 'cet6-page', DATA_CACHE = 'cet6-data';
const PAGE = './';
const DATA = ['data/core.js?v=14a69b19', 'data/extra.js?v=ff57d6cd', 'data/scenes.js?v=78e6b624', "data/psg-basic.js?v=ae0d24dc", "data/psg-cet4.js?v=312d078e", "data/psg-cet6.js?v=80790aae", "data/psg-ext.js?v=554d342a", "data/psg-freq.basic.js?v=2176d149", "data/psg-freq.cet4.js?v=7cae48b2", "data/psg-freq.cet6.js?v=6d8fdbf0", "data/psg-freq.ext.js?v=c49b7e68", "data/psg-write.basic.js?v=07870748", "data/psg-write.cet4.js?v=8418a5a9"];
const abs = u => new URL(u, self.registration.scope).href;
// 页面重试时会在地址后加 &r=1、&r=2：存缓存时去掉它，当成同一个文件
const dataKey = url => { const k = new URL(url); k.searchParams.delete('r'); return k.href; };
// 安装时先把词表的两份小数据存好（页面刚下载过，一般直接从浏览器缓存拿，不走网络）；
// 大的场景文件等页面自己来要时再存，免得第一次打开时同一个文件下两遍
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(DATA_CACHE).then(c => Promise.all(DATA.slice(0, 2).map(u => c.match(abs(u)).then(hit => hit || c.add(abs(u))).catch(() => {}))))
    .then(() => caches.open(PAGE_CACHE)).then(c => c.add(PAGE).catch(() => {})));
});
self.addEventListener('activate', e => {
  const keep = new Set(DATA.map(abs));
  e.waitUntil((async () => {
    const data = await caches.open(DATA_CACHE);
    // 旧版本按版本号命名的缓存：把还用得上的数据挪过来，然后删掉
    for (const k of await caches.keys()) {
      if (!k.startsWith('cet6-') || k === PAGE_CACHE || k === DATA_CACHE) continue;
      const old = await caches.open(k);
      for (const u of keep) if (!(await data.match(u))) { const hit = await old.match(u); if (hit) await data.put(u, hit); }
      await caches.delete(k);
    }
    // 只留当前版本的数据文件
    for (const req of await data.keys()) if (!keep.has(req.url)) await data.delete(req);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  // 词表数据：先查缓存，没有再下载并存起来
  if (/\/data\/(core|extra|scenes|psg-[\w.]+)\.js$/.test(url.pathname) && url.searchParams.has('v')) {
    const key = dataKey(req.url);
    e.respondWith(caches.open(DATA_CACHE).then(c => c.match(key).then(hit => hit || fetch(req).then(res => { if (res.ok) c.put(key, res.clone()); return res; }))));
    return;
  }
  // 页面：先走网络（保证拿到最新版），成功就同时存成「首页」；断网时用缓存（不管地址后面带了什么参数）
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(PAGE_CACHE).then(c => c.put(PAGE, copy)); }
      return res;
    }).catch(() => caches.open(PAGE_CACHE).then(c => c.match(PAGE))));
  }
});
