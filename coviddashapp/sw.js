const dynamicCacheName = 'site-dynamic';
const assets = [
    '/Covid-Dashboard/',
    '/Covid-Dashboard/index.html',
    '/Covid-Dashboard/app.js',
    '/Covid-Dashboard/static-dashboard.js',
    '/Covid-Dashboard/site.webmanifest',
    '/Covid-Dashboard/add_style.css',
    '/Covid-Dashboard/favicon/android-chrome-192x192.png',
    '/Covid-Dashboard/favicon/favicon-32x32.png',
    'https://cdn.plot.ly/plotly-latest.min.js',
    'https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css',
    'https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js',
    'https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/js/bootstrap.min.js'
];

var version;
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
    version = fetch('https://krusty.westeurope.cloudapp.azure.com/api/v1/updates')
        .then(response => response.json())
        .then(data => {
            let v = data["latest_version"];
            return v
        })
    console.log(version);
    evt.waitUntil(
        version.then(v => {
            caches.open('site-static-v' + v).then(cache => {
                cache.addAll(assets)
            })
        })
    );
});

//ACTIVATE EVENT
self.addEventListener('activate', evt => {
    console.log('service worker has been activated');
    //Check for update
    evt.waitUntil(
        version.then(v => {
            caches.keys().then(keys => {
                return Promise.all(keys
                    .filter(key => key !== ("site-static-v" + v))
                    .map(key => caches.delete(key))
                )
            })
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
        version = fetch('https://krusty.westeurope.cloudapp.azure.com/api/v1/updates')
        .then(response => response.json())
        .then(data => {
            let v = data["latest_version"];
            return v
        })
        .then(v => {
            caches.keys().then(keys => {
                return Promise.all(keys
                    .filter(key => key !== ("site-static-v" + v))
                    .map(key => caches.delete(key))
                )
            })
            caches.open('site-static-v' + v).then(cache => {
                cache.addAll(assets)
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



