/* =====================================================
   DATA KOMPONEN

   ID MARKER ARUCO:

   0  = Processor
   1  = RAM
   2  = Motherboard
   3  = SSD / Hard Disk
   4  = Power Supply
===================================================== */

let sourceX = 0;
let sourceY = 0;

let sourceWidth = 0;
let sourceHeight = 0;

const components = {

    0: {

        name: "Processor",

        image: "images/cpu.png",

        description:
            "Processor merupakan pusat pemrosesan data pada komputer. Processor bertugas menjalankan instruksi, mengolah data, serta mengatur berbagai proses yang terjadi pada sistem komputer."

    },


    1: {

        name: "RAM",

        image: "images/ram.png",

        description:
            "RAM atau Random Access Memory berfungsi untuk menyimpan data sementara yang sedang digunakan oleh komputer. Semakin besar kapasitas RAM, semakin banyak data yang dapat diproses secara bersamaan."

    },


    2: {

        name: "Motherboard",

        image: "images/motherboard.png",

        description:
            "Motherboard merupakan papan utama komputer yang berfungsi menghubungkan berbagai komponen seperti processor, RAM, penyimpanan, dan komponen lainnya."

    },


    3: {

        name: "SSD / Hard Disk",

        image: "images/ssd.png",

        description:
            "SSD atau Hard Disk digunakan untuk menyimpan data secara permanen, termasuk sistem operasi, aplikasi, dokumen, foto, video, dan berbagai file lainnya."

    },


    4: {

        name: "Power Supply",

        image: "images/psu.png",

        description:
            "Power Supply Unit atau PSU berfungsi mengubah dan menyalurkan energi listrik ke berbagai komponen komputer agar dapat bekerja dengan baik."

    }

};


/* =====================================================
   ELEMENT
===================================================== */

const video =
    document.getElementById(
        "cameraVideo"
    );


const canvas =
    document.getElementById(
        "cameraCanvas"
    );


const ctx =
    canvas.getContext(
        "2d",
        {
            willReadFrequently: true
        }
    );


const cameraPlaceholder =
    document.getElementById(
        "cameraPlaceholder"
    );


const cameraStatus =
    document.getElementById(
        "cameraStatus"
    );


const startButton =
    document.getElementById(
        "startCameraButton"
    );


const stopButton =
    document.getElementById(
        "stopCameraButton"
    );


/* =====================================================
   VARIABLE
===================================================== */

let cameraStream =
    null;


let detectionAnimation =
    null;


let cameraIsRunning =
    false;


let currentComponent =
    null;


let markerAlreadyDetected =
    false;


/* =====================================================
   ARUCO DETECTOR
===================================================== */

let detector =
    null;


/* =====================================================
   SAAT HALAMAN SELESAI DIMUAT
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        /*
         * Pastikan kamera benar-benar mati
         * ketika halaman pertama dibuka.
         */

        stopCamera();


    }
);


/* =====================================================
   PINDAH SCREEN
===================================================== */

function showScreen(
    screenId
) {


    /*
     * Jika pindah dari scan,
     * kamera langsung dimatikan.
     */

    if (
        screenId !== "scan"
    ) {

        stopCamera();

    }


    const screens =
        document.querySelectorAll(
            ".screen"
        );


    screens.forEach(
        function (
            screen
        ) {

            screen.classList.remove(
                "active"
            );

        }
    );


    const target =
        document.getElementById(
            screenId
        );


    if (
        target
    ) {

        target.classList.add(
            "active"
        );

    }

}


/* =====================================================
   AKTIFKAN KAMERA
===================================================== */

async function startCamera() {


    /*
     * Jika kamera sudah aktif,
     * jangan membuat stream baru.
     */

    if (
        cameraIsRunning
    ) {

        return;

    }


    try {


        cameraStatus.textContent =
            "Meminta akses kamera...";


        /*
         * Minta kamera belakang
         * jika tersedia.

         */

        cameraStream =
            await navigator.mediaDevices.getUserMedia(

                {

                    video: {

                        facingMode: {

                            ideal: "environment"

                        },

                        width: {

                            ideal: 1280

                        },

                        height: {

                            ideal: 720

                        }

                    },

                    audio: false

                }

            );


        /*
         * Masukkan stream ke
         * elemen video kita sendiri.

         */

        video.srcObject =
            cameraStream;


        await video.play();


        /*
         * Ukuran canvas mengikuti
         * ukuran video asli.

         */

const videoWidth = video.videoWidth;
const videoHeight = video.videoHeight;

const videoRatio =
    videoWidth / videoHeight;

const boxWidth =
    cameraBox.clientWidth;

const boxHeight =
    cameraBox.clientHeight;

const boxRatio =
    boxWidth / boxHeight;

let sourceX = 0;
let sourceY = 0;
let sourceWidth = videoWidth;
let sourceHeight = videoHeight;

if (videoRatio > boxRatio) {

    sourceWidth =
        videoHeight * boxRatio;

    sourceX =
        (videoWidth - sourceWidth) / 2;

} else {

    sourceHeight =
        videoWidth / boxRatio;

    sourceY =
        (videoHeight - sourceHeight) / 2;

}

canvas.width =
    sourceWidth;

canvas.height =
    sourceHeight;


        /*
         * Tampilkan video.

         */

        video.style.display =
            "block";


        canvas.style.display =
            "block";


        cameraPlaceholder.style.display =
            "none";


        startButton.style.display =
            "none";


        stopButton.style.display =
            "flex";


        cameraIsRunning =
            true;


        markerAlreadyDetected =
            false;


        cameraStatus.textContent =
            "Kamera aktif - arahkan ke marker";


        detector = new AR.Detector({
            dictionaryName: "ARUCO"
        });

        detectMarkers();


    }


    catch (
        error
    ) {


        console.error(
            error
        );


        cameraStatus.textContent =
            "Kamera tidak dapat diakses";


        cameraPlaceholder.style.display =
            "flex";


        video.style.display =
            "none";


        canvas.style.display =
            "none";


        startButton.style.display =
            "flex";


        stopButton.style.display =
            "none";


        alert(
            "Kamera tidak dapat diakses. Pastikan izin kamera telah diberikan dan jalankan website melalui localhost atau HTTPS."
        );

    }

}


/* =====================================================
   DETEKSI MARKER
===================================================== */

function detectMarkers() {


    /*
     * Hentikan jika kamera sudah mati.

     */

    if (
        !cameraIsRunning
    ) {

        return;

    }


    /*
     * Pastikan video sudah memiliki
     * ukuran yang valid.

     */

    if (
        video.readyState >= 2 &&
        video.videoWidth > 0
    ) {


        /*
         * Gambar frame kamera ke canvas.

         */

ctx.drawImage(

    video,

    sourceX,
    sourceY,

    sourceWidth,
    sourceHeight,

    0,
    0,

    canvas.width,
    canvas.height

);


        /*
         * Ambil data gambar.

         */

        const imageData =
            ctx.getImageData(

                0,

                0,

                canvas.width,

                canvas.height

            );


        try {


            /*
             * Deteksi marker ArUco.

             */

            const markers =
                detector.detect(
                    imageData
                );


            /*
             * Jika ada marker.

             */

            if (
                markers.length > 0
            ) {


                const marker =
                    markers[0];


                const markerId =
                    marker.id;


                const component =
                    components[
                        markerId
                    ];


                /*
                 * Hanya proses marker
                 * yang terdaftar.

                 */

                if (
                    component
                ) {


                    detectComponent(

                        markerId

                    );

                }


            }


        }


        catch (
            error
        ) {


            console.error(
                "Gagal mendeteksi marker:",
                error
            );

        }

    }


    /*
     * Jalankan deteksi frame berikutnya.

     */

    detectionAnimation =
        requestAnimationFrame(
            detectMarkers
        );

}


/* =====================================================
   MARKER TERDETEKSI
===================================================== */

function detectComponent(
    markerId
) {


    currentComponent =
        components[
            markerId
        ];


    if (
        !currentComponent
    ) {

        return;

    }


    cameraStatus.textContent =
        "Marker terdeteksi";


    /*
     * Jangan tampilkan popup
     * berulang-ulang setiap frame.

     */

    if (
        markerAlreadyDetected
    ) {

        return;

    }


    markerAlreadyDetected =
        true;


    document.getElementById(
        "detectedComponentName"
    ).textContent =
        currentComponent.name;


    document.getElementById(
        "detectedModal"
    ).classList.add(
        "show"
    );

}


/* =====================================================
   DETAIL KOMPONEN
===================================================== */

function showComponentDetail() {


    if (
        !currentComponent
    ) {

        return;

    }


    document.getElementById(
        "detailImage"
    ).src =
        currentComponent.image;


    document.getElementById(
        "detailImage"
    ).alt =
        currentComponent.name;


    document.getElementById(
        "detailName"
    ).textContent =
        currentComponent.name;


    document.getElementById(
        "detailDescription"
    ).textContent =
        currentComponent.description;


    closeDetectedModal();


    document.getElementById(
        "detailModal"
    ).classList.add(
        "show"
    );

}


/* =====================================================
   TUTUP POPUP DETEKSI
===================================================== */

function closeDetectedModal() {


    document.getElementById(
        "detectedModal"
    ).classList.remove(
        "show"
    );


    /*
     * Boleh mendeteksi kembali
     * setelah popup ditutup.

     */

    markerAlreadyDetected =
        false;

}


/* =====================================================
   TUTUP DETAIL
===================================================== */

function closeDetailModal() {


    document.getElementById(
        "detailModal"
    ).classList.remove(
        "show"
    );


    markerAlreadyDetected =
        false;

}


/* =====================================================
   MATIKAN KAMERA
===================================================== */

function stopCamera() {


    /*
     * Hentikan loop deteksi.

     */

    if (
        detectionAnimation
    ) {


        cancelAnimationFrame(
            detectionAnimation
        );


        detectionAnimation =
            null;

    }


    /*
     * Hentikan semua track kamera.

     */

    if (
        cameraStream
    ) {


        cameraStream
            .getTracks()
            .forEach(
                function (
                    track
                ) {


                    track.stop();

                }
            );


        cameraStream =
            null;

    }


    /*
     * Putuskan video dari stream.

     */

    video.pause();


    video.srcObject =
        null;


    /*
     * Sembunyikan video dan canvas.

     */

    video.style.display =
        "none";


    canvas.style.display =
        "none";


    /*
     * Reset detector.

     */

    detector =
        null;


    cameraIsRunning =
        false;


    markerAlreadyDetected =
        false;


    /*
     * Tampilkan placeholder.

     */

    cameraPlaceholder.style.display =
        "flex";


    startButton.style.display =
        "flex";


    stopButton.style.display =
        "flex";


    cameraStatus.textContent =
        "Kamera belum aktif";


    cameraStatus.style.color =
        "#cbd5e1";

}


/* =====================================================
   KEMBALI KE HOME
===================================================== */

function closeCameraAndGoHome() {


    stopCamera();


    showScreen(
        "home"
    );

}


/* =====================================================
   MATIKAN KAMERA SAAT TAB DITUTUP
===================================================== */

window.addEventListener(
    "pagehide",
    function () {

        stopCamera();

    }
);