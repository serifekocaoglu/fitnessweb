'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "c5f6edb68022d89f25d718b87845ce1a",
"assets/assets/fonts/JosefinSans-Bold.ttf": "9880fc0845d0f3950e490e4f3b05c08c",
"assets/assets/fonts/JosefinSans-Light.ttf": "f0cc419ee290311a49733e728d598f8e",
"assets/assets/fonts/JosefinSans-Regular.ttf": "aff001b45565556d667c11fe85cada0d",
"assets/assets/fonts/Oswald-Bold.ttf": "ad9c6c18ebcfb969eb7f9a868e1c389f",
"assets/assets/fonts/Oswald-Light.ttf": "d10552fddd612faf2c293a091ec51866",
"assets/assets/fonts/Oswald-Regular.ttf": "68a85f5cf2497486387d6c9f253bde62",
"assets/assets/images/add.png": "03af75e00cc903d2ae65ed996fa50954",
"assets/assets/images/calories.jpg": "ae7d72057c6c0be7c41ae9c859505c3c",
"assets/assets/images/dumbbell.png": "34e90c7c58b4cf87e1d99fe9981daed3",
"assets/assets/images/fire.png": "33fea02d0bac0634b2a61b662d90cca1",
"assets/assets/images/first-aid.png": "9949c28a9ad831965bc093507462dea6",
"assets/assets/images/four-squares.png": "571a2e6a6433de31eb2034a9d45d54aa",
"assets/assets/images/heart.png": "f9335b1b0d63347fccef3b10e1db8091",
"assets/assets/images/heart_rate.png": "becd9c80b90fe336443f2f2afba62282",
"assets/assets/images/meals.jpg": "1506fd4a5517992c33188267308ebb1e",
"assets/assets/images/moon.png": "e7b071cd8cea203e3c8e1aaa36fcc950",
"assets/assets/images/scr1.jpg": "3e4c602f440ead9e6bef09ea90b044ee",
"assets/assets/images/scr2.jpg": "fc0236ff98be50ba152ac1d890cc2499",
"assets/assets/images/serife.jpg": "ed4af1434f94510f9914c3fbe43de0a1",
"assets/assets/images/tray.png": "c88ab63ada9178373c0736e6e4018530",
"assets/assets/images/user.png": "534d00f5ff7d7e58d5f9385ce732f594",
"assets/assets/images/water.png": "5f1e53736c27a218a01bc07412f1abdc",
"assets/FontManifest.json": "1b0d5274cfd550586972faf2acf756b9",
"assets/fonts/MaterialIcons-Regular.otf": "4e6447691c9509f7acdbf8a931a85ca1",
"assets/NOTICES": "a343d01e8cc8e460d0526fb92f70b5f9",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"index.html": "3aef4e3203ff2f80d576057ccdc44793",
"/": "3aef4e3203ff2f80d576057ccdc44793",
"main.dart.js": "90949369e17f22de9620f2ad13476bfb",
"manifest.json": "a4caef30aeac446842140d525e10c566",
"version.json": "04d68b0967c3ac7762e9b30cfd96b6c4"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
