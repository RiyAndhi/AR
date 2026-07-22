const CACHE_NAME =
    "komponen-komputer-v2";


const FILES_TO_CACHE = [

    "./",

    "./index.html",

    "./style.css",

    "./script.js",

    "./manifest.json",

    "./images/cpu.png",

    "./images/ram.png",

    "./images/motherboard.png",

    "./images/ssd.png",

    "./images/psu.png",

    "./images/icon.png",

    "./images/icon.png"

];


self.addEventListener(
    "install",
    function (
        event
    ) {

        event.waitUntil(

            caches.open(
                CACHE_NAME
            ).then(

                function (
                    cache
                ) {

                    return cache.addAll(
                        FILES_TO_CACHE
                    );

                }

            )

        );


        self.skipWaiting();

    }
);


self.addEventListener(
    "activate",
    function (
        event
    ) {

        event.waitUntil(

            caches.keys().then(

                function (
                    cacheNames
                ) {

                    return Promise.all(

                        cacheNames.map(

                            function (
                                cacheName
                            ) {


                                if (

                                    cacheName !==
                                    CACHE_NAME

                                ) {


                                    return caches.delete(
                                        cacheName
                                    );


                                }


                            }

                        )

                    );

                }

            )

        );


        self.clients.claim();

    }
);


self.addEventListener(
    "fetch",
    function (
        event
    ) {

        event.respondWith(

            caches.match(
                event.request
            ).then(

                function (
                    cachedResponse
                ) {


                    if (
                        cachedResponse
                    ) {

                        return cachedResponse;

                    }


                    return fetch(
                        event.request
                    );

                }

            )

        );

    }
);