const CACHE_NAME = 'jidori-camera-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './js/main.js',
  './js/camera.js',
  './js/faceDetector.js',
  './js/smileAnalyzer.js',
  './js/autoShutter.js',
  './js/meshRenderer.js',
  './js/ui.js',
  './js/gallery.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm/face_landmarker_solution_simd_wasm_bin.js',
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm/face_landmarker_solution_simd_wasm_bin.wasm',
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('Service Worker: Caching assets...');
      const promises = ASSETS.map(async (url) => {
        try {
          const response = await fetch(url, { mode: 'cors' });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          await cache.put(url, response);
          return;
        } catch (error) {
          console.error(`Service Worker: Failed to cache asset: ${url}`, error);
        }
      });
      return Promise.all(promises);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});