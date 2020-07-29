//WARNING: in production, replace /docs/ by /Covid-Dashboard/
const staticCacheName = 'site-static-v2'; //Don't forget to change version when modifying one of the assets
const dynamicCacheName = 'site-dynamic-v2';
const assets = [
    '/Covid-Dashboard/',
    '/Covid-Dashboard/index.html',
    '/Covid-Dashboard/app.js',
    '/Covid-Dashboard/static-dashboard.js',
    '/Covid-Dashboard/site.webmanifest',
    '/Covid-Dashboard/favicon/android-chrome-192x192.png',
    '/Covid-Dashboard/favicon/favicon-32x32.png',
    'https://cdn.plot.ly/plotly-latest.min.js',
    'https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css',
    'https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js',
    'https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/js/bootstrap.min.js'
];

var lastUpdate = 0;
const interTime = 3600000;

//Cache size limit function
const limitCacheSize = (name, size) => {
    caches.open(name).then(cache => {
        cache.keys().then(keys => {
            if (keys.length > size){
                cache.delete(keys[0]).then(limitCacheSize(name, size));
            }
        })
    })
};

//INSTALL SERVICE WORKER
self.addEventListener('install', evt => {
    console.log('service worker has been installed');
    evt.waitUntil(
        caches.open(staticCacheName).then(cache => {
            cache.addAll(assets)
        })
    );
});

//ACTIVATE EVENT
self.addEventListener('activate', evt => {
    console.log('service worker has been activated');
    evt.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== staticCacheName && key !== dynamicCacheName)
                .map(key => caches.delete(key))
            )
        })
    );
});

//FETCH EVENTS
self.addEventListener('fetch', evt => {
    var now = Date.now();
    if (now - lastUpdate > interTime){
         caches.open(dynamicCacheName).then(cache => {
             cache.keys().then(keys => {
                 keys.forEach(request => cache.delete(request));
             })
         })      
    }
    evt.respondWith(
        caches.match(evt.request).then(cacheRes => {
            return cacheRes || fetch(evt.request).then(fetchRes => {
                return caches.open(dynamicCacheName).then(cache => {
                    cache.put(evt.request.url, fetchRes.clone());
                    limitCacheSize(dynamicCacheName, 4);
                    lastUpdate = Date.now();
                    return fetchRes;
                })
            });
        })//.catch(() => caches.match()) to return an offline fallback page
    );
});



