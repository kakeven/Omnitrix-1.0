const CACHE_NAME = "omnitrix-v3";

const urlsToCache = [
  "/Omnitrix-1.0/",
  "/Omnitrix-1.0/index.html",
  "/Omnitrix-1.0/style.css",
  "/Omnitrix-1.0/script.js",
  "/Omnitrix-1.0/manifest.json",

  // Imagens Omnitrix
  "./images/omnitrix_transformado_semBorda.png",
  "./images/simbolo_supremo_semBorda.png",
  "./images/omnitrix_de_frente.png",

  // Aliens 
  "/Omnitrix-1.0/images/aliens/alien_0.png",
  "/Omnitrix-1.0/images/aliens/alien_1.png",
  "/Omnitrix-1.0/images/aliens/alien_2.png",
  "/Omnitrix-1.0/images/aliens/alien_3.png",
  "/Omnitrix-1.0/images/aliens/alien_4.png",
  "/Omnitrix-1.0/images/aliens/alien_5.png",
  "/Omnitrix-1.0/images/aliens/alien_6.png",
  "/Omnitrix-1.0/images/aliens/alien_7.png",
  "/Omnitrix-1.0/images/aliens/alien_8.png",
  "/Omnitrix-1.0/images/aliens/alien_9.png",
  "/Omnitrix-1.0/images/aliens/alien_10.png",
  "/Omnitrix-1.0/images/aliens/alien_11.png",
  

    //====SONS=====
  "/Omnitrix-1.0/sounds/destranformar.mp3",
  "/Omnitrix-1.0/sounds/transformar.mp3",
  "/Omnitrix-1.0/sounds/escolha.mp3",
  "/Omnitrix-1.0/sounds/selecionado.mp3",
  "/Omnitrix-1.0/sounds/voltar.mp3",
  "/Omnitrix-1.0/sounds/voltar_tempo.mp3",
  "/Omnitrix-1.0/sounds/sem_carga.mp3",
  "/Omnitrix-1.0/sounds/supremo.mp3",
  "/Omnitrix-1.0/sounds/novaCena.mp3",
  
];
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});