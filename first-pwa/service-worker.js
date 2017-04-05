/**
 * Created by ZFVZ7267 on 09/03/2017.
 */
var cacheName = 'weatherPWA-step-6-2';
var dataCacheName = 'weatherData-v1';
var filesToCache = [
    '/PWA-prototype-version1/first-pwa/',
    '/PWA-prototype-version1/first-pwa/index.html',
    '/PWA-prototype-version1/first-pwa/scripts/app.js',
    '/PWA-prototype-version1/first-pwa/styles/inline.css',
    '/PWA-prototype-version1/first-pwa/images/clear.png',
    '/PWA-prototype-version1/first-pwa/images/cloudy-scattered-showers.png',
    '/PWA-prototype-version1/first-pwa/images/cloudy.png',
    '/PWA-prototype-version1/first-pwa/images/fog.png',
    '/PWA-prototype-version1/first-pwa/images/ic_add_white_24px.svg',
    '/PWA-prototype-version1/first-pwa/images/ic_refresh_white_24px.svg',
    '/PWA-prototype-version1/first-pwa/images/partly-cloudy.png',
    '/PWA-prototype-version1/first-pwa/images/rain.png',
    '/PWA-prototype-version1/first-pwa/images/scattered-showers.png',
    '/PWA-prototype-version1/first-pwa/images/sleet.png',
    '/PWA-prototype-version1/first-pwa/images/snow.png',
    '/PWA-prototype-version1/first-pwa/images/thunderstorm.png',
    '/PWA-prototype-version1/first-pwa/images/wind.png'
];

self.addEventListener('install', function(e) {
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('activate', function(e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function(keyList) {
            return Promise.all(keyList.map(function(key) {
                if (key !== cacheName && key !== dataCacheName) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
    console.log('[ServiceWorker] Fetch', e.request.url);
    var dataUrl = 'https://query.yahooapis.com/v1/public/yql';

    if (e.request.url.indexOf(dataUrl) > -1) {
        /*
         * When the request URL contains dataUrl, the app is asking for fresh
         * weather data. In this case, the service worker always goes to the
         * network and then caches the response. This is called the "Cache then
         * network" strategy:
         * https://jakearchibald.com/2014/offline-cookbook/#cache-then-network
         */
        e.respondWith(
            caches.open(dataCacheName).then(function(cache) {
                return fetch(e.request).then(function(response){
                    cache.put(e.request.url, response.clone());
                    return response;
                });
            })
        );
    } else {
        /*
         * The app is asking for app shell files. In this scenario the app uses the
         * "Cache, falling back to the network" offline strategy:
         * https://jakearchibald.com/2014/offline-cookbook/#cache-falling-back-to-network
         */
        e.respondWith(
            caches.match(e.request).then(function(response) {
                return response || fetch(e.request);
            })
        );
    }
});

self.addEventListener('push', function(event) {
    console.log('[Service Worker] Push Received.');
    console.log('[Service Worker] Push had this data: "${event.data.text()}"');

    const title = 'Weather PWA';
    const options = {
        body: 'Hello What a nice day!',
        icon: '/PWA-prototype-version1/first-pwa/images/icon_notif_message.png',
        badge: '/PWA-prototype-version1/first-pwa/images/badge_notif.png'
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
    console.log('[Service Worker] Notification click Received.');

    event.notification.close();

    event.waitUntil(
        clients.openWindow('https://www.118712.fr/')
    );
});
