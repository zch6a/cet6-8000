// 六级 8000 词 · 离线缓存：第二次打开直接从本机读；装好之后断网（地铁、飞机）也能打开、背诵、自测
// 词表数据（data/core.js / extra.js?v=版本号）版本一变就是新文件，所以可以放心长期缓存；
// 页面本身先走网络拿最新版，断网时才用缓存。
const CACHE = 'cet6-88c6e9e04e8a5fff';
const PAGE = './';
const DATA = ['data/core.js?v=88c6e9e0', 'data/extra.js?v=4e8a5fff', 'data/scenes.js?v=47b5ff36'];
// 安装时就把页面和两份词表数据一次存好：哪怕第一次打开没等 extra.js 下载完就关掉，之后断网也是完整的
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => Promise.all([PAGE, ...DATA].map(u => c.add(u).catch(() => {})))));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('cet6-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  // 词表数据：先查缓存，没有再下载并存起来
  if (/\/data\/(core|extra|scenes)\.js$/.test(url.pathname) && url.searchParams.has('v')) {
    e.respondWith(caches.open(CACHE).then(c => c.match(req).then(hit => hit || fetch(req).then(res => { if (res.ok) c.put(req, res.clone()); return res; }))));
    return;
  }
  // 页面：先走网络（保证拿到最新版），成功就同时存成「首页」；断网时用缓存（不管地址后面带了什么参数）
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(PAGE, copy)); }
      return res;
    }).catch(() => caches.open(CACHE).then(c => c.match(req, {ignoreSearch: true}).then(hit => hit || c.match(PAGE)))));
  }
});
