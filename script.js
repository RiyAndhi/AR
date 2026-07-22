/* =========================
   DATA KOMPONEN
========================= */

const components = {

    markerCPU: {

        name: "Processor",

        description:
            "Processor merupakan pusat pemrosesan komputer yang bertugas menjalankan instruksi dan mengolah data."

    },


    markerRAM: {

        name: "RAM",

        description:
            "RAM berfungsi menyimpan data sementara yang sedang digunakan oleh processor agar dapat diakses dengan cepat."

    },


    markerMotherboard: {

        name: "Motherboard",

        description:
            "Motherboard merupakan papan utama yang menghubungkan berbagai komponen komputer agar dapat bekerja bersama."

    },


    markerSSD: {

        name: "SSD / Hard Disk",

        description:
            "SSD atau Hard Disk digunakan untuk menyimpan sistem operasi, aplikasi, dan berbagai data pengguna."

    },


    markerPSU: {

        name: "Power Supply",

        description:
            "Power Supply berfungsi mengubah dan menyuplai daya listrik yang dibutuhkan oleh berbagai komponen komputer."

    }

};


/* =========================
   PINDAH SCREEN
========================= */

function showScreen(screenId) {

    const screens =
        document.querySelectorAll(
            ".screen"
        );


    screens.forEach(
        (screen) => {

            screen.classList.remove(
                "active"
            );

        }
    );


    const selectedScreen =
        document.getElementById(
            screenId
        );


    if (!selectedScreen) {

        return;

    }


    selectedScreen.classList.add(
        "active"
    );


    /*
     * Jika masuk ke halaman AR,
     * aktifkan sistem AR.
     */

    if (
        screenId === "scan"
    ) {

        startAR();

    }

}


/* =========================
   MULAI AR
========================= */

function startAR() {

    const arScene =
        document.getElementById(
            "arScene"
        );


    /*
     * Memastikan scene AR aktif.
     */

    if (
        arScene
    ) {

        arScene.style.display =
            "block";

    }

}


/* =========================
   TUTUP AR
========================= */

function closeAR() {

    const arScene =
        document.getElementById(
            "arScene"
        );


    /*
     * Menonaktifkan kamera AR
     * sebelum kembali ke home.
     */

    const video =
        document.querySelector(
            "#arScene video"
        );


    if (
        video &&
        video.srcObject
    ) {

        const tracks =
            video.srcObject.getTracks();


        tracks.forEach(
            (track) => {

                track.stop();

            }
        );


        video.srcObject =
            null;

    }


    if (
        arScene
    ) {

        arScene.style.display =
            "none";

    }


    showScreen(
        "home"
    );

}


/* =========================
   EVENT MARKER
========================= */

function setupMarkerEvents() {


    Object.keys(
        components
    ).forEach(

        (markerId) => {


            const marker =
                document.getElementById(
                    markerId
                );


            if (
                !marker
            ) {

                return;

            }


            /*
             * Ketika marker terlihat.
             */

            marker.addEventListener(
                "markerFound",

                () => {

                    const component =
                        components[
                            markerId
                        ];


                    showComponentInfo(
                        component
                    );

                }

            );


            /*
             * Ketika marker tidak terlihat.
             */

            marker.addEventListener(
                "markerLost",

                () => {

                    resetComponentInfo();

                }

            );

        }

    );

}


/* =========================
   TAMPILKAN INFO
========================= */

function showComponentInfo(
    component
) {

    const name =
        document.getElementById(
            "arComponentName"
        );


    const description =
        document.getElementById(
            "arComponentDescription"
        );


    if (
        name
    ) {

        name.textContent =
            component.name;

    }


    if (
        description
    ) {

        description.textContent =
            component.description;

    }

}


/* =========================
   RESET INFO
========================= */

function resetComponentInfo() {

    const name =
        document.getElementById(
            "arComponentName"
        );


    const description =
        document.getElementById(
            "arComponentDescription"
        );


    if (
        name
    ) {

        name.textContent =
            "Belum ada marker";

    }


    if (
        description
    ) {

        description.textContent =
            "Arahkan kamera ke marker komponen komputer.";

    }

}


/* =========================
   PWA
========================= */

if (
    "serviceWorker"
    in navigator
) {

    window.addEventListener(
        "load",

        () => {

            navigator.serviceWorker
                .register(
                    "sw.js"
                )

                .then(
                    () => {

                        console.log(
                            "Service Worker aktif"
                        );

                    }
                )

                .catch(
                    (error) => {

                        console.error(
                            "Service Worker gagal:",
                            error
                        );

                    }
                );

        }

    );

}


/* =========================
   INISIALISASI
========================= */

document.addEventListener(
    "DOMContentLoaded",

    () => {

        setupMarkerEvents();

    }

);