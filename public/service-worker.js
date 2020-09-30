const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/index.js",
  "/styles.css",
  "/favicon.ico",
  "/assets/images/icons/icon-72x72.png",
  "/assets/images/icons/icon-96x96.png",
  "/assets/images/icons/icon-128x128.png",
  "/assets/images/icons/icon-144x144.png",
  "/assets/images/icons/icon-152x152.png",
  "/assets/images/icons/icon-192x192.png",
  "/assets/images/icons/icon-384x384.png",
  "/assets/images/icons/icon-512x512.png",
];

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

// install
self.addEventListener("install", (e)=> {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Your files were pre-cached successfully!");
      return cache.addAll(FILES_TO_CACHE);
    })
    .then(() => self.skipWaiting())
  );

  self.skipWaiting();
});


self.addEventListener("activate", (e) => {  //remove unwanted caches.
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME && cache !== DATA_CACHE_NAME) {
            console.log("Removing old cache data", key);
            return caches.delete(cache);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// fetch
self.addEventListener("fetch", (e) => {
  if (e.request.url.includes("/api/")) {
    e.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(e.request)
          .then(response => {
            // If the response was good, clone it and store it in the cache.
            if (response.status === 200) {
              cache.put(e.request.url, response.clone());
            }

            return response;
          })
          .catch(err => {
            // Network request failed, try to get it from the cache.
            return cache.match(e.request);
          });
      }).catch(err => console.log(err))
    );

    return;

  }
  // respond from static cache, request is not for /api/*
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request).then((response) => {
        if (response) {
          return response;
        }
        else if (e.request.headers.get("accept").includes("text/html")) {
          return caches.match("/");
        }
      });
    })
  )
});



