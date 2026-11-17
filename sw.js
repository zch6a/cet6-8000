// 六级 8000 词 · 离线缓存：第二次打开直接从本机读，不用再等下载
// 词表数据（data/all.js?v=版本号）版本一变就是新文件，所以可以放心长期缓存；
// 页面本身先走网络拿最新版，断网时才用缓存。
const CACHE = 'cet6-34e24d4b26371b8f';
self.addEventListener('install', e => { self.skipWaiting(); });
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
  if (/\/data\/(core|extra)\.js$/.test(url.pathname) && url.searchParams.has('v')) {
    e.respondWith(caches.open(CACHE).then(c => c.match(req).then(hit => hit || fetch(req).then(res => { if (res.ok) c.put(req, res.clone()); return res; }))));
    return;
  }
  // 页面：先走网络（保证拿到最新版），失败时用缓存
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; })
      .catch(() => caches.match(req).then(hit => hit || caches.match('./'))));
  }
});
