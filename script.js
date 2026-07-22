/* =====================================================
   DATA KOMPONEN

   ID MARKER ARUCO:

   0 = Processor
   1 = RAM
   2 = Motherboard
   3 = SSD / Hard Disk
   4 = Power Supply
===================================================== */

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
    document.getElementById("cameraVideo");

const canvas =
    document.getElementById("cameraCanvas");

const ctx =
    canvas.getContext("2d", {
        willReadFrequently: true
    });

const cameraBox =
    document.querySelector(".camera-box");

const cameraPlaceholder =
    document.getElementById("cameraPlaceholder");

const cameraStatus =
    document.getElementById("cameraStatus");

const startButton =
    document.getElementById("startCameraButton");

const stopButton =
    document.getElementById("stopCameraButton");


/* =====================================================
   VARIABLE
===================================================== */

let cameraStream = null;

let detectionAnimation = null;

let cameraIsRunning = false;

let currentComponent = null;

let markerAlreadyDetected = false;

let detector = null;


/*
 * Variabel crop kamera.
 */

let sourceX = 0;

let sourceY = 0;

let sourceWidth = 0;

let sourceHeight = 0;


/* =====================================================
   SAAT HALAMAN SELESAI DIMUAT
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        stopCamera();

    }
);


/* =====================================================
   PINDAH SCREEN
===================================================== */

function showScreen(screenId) {

    if (screenId !== "scan") {

        stopCamera();

    }


    const screens =
        document.querySelectorAll(".screen");


    screens.forEach(
        function (screen) {

            screen.classList.remove("active");

        }
    );


    const target =
        document.getElementById(screenId);


    if (target) {

        target.classList.add("active");

    }

}


/* =====================================================
   AKTIFKAN KAMERA
===================================================== */

async function startCamera() {

    if (cameraIsRunning) {

        return;

    }


    try {

        cameraStatus.textContent =
            "Meminta akses kamera...";


        cameraStream =
            await navigator.mediaDevices.getUserMedia({

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

            });


        video.srcObject =
            cameraStream;


        await video.play();


        const videoWidth =
            video.videoWidth;

        const videoHeight =
            video.videoHeight;


        if (
            videoWidth === 0 ||
            videoHeight === 0
        ) {

            throw new Error(
                "Ukuran video tidak valid"
            );

        }


        const videoRatio =
            videoWidth / videoHeight;


        const boxWidth =
            cameraBox.clientWidth;

        const boxHeight =
            cameraBox.clientHeight;


        const boxRatio =
            boxWidth / boxHeight;


        sourceX = 0;

        sourceY = 0;

        sourceWidth =
            videoWidth;

        sourceHeight =
            videoHeight;


        /*
         * Crop tanpa menggepengkan video.
         */

        if (
            videoRatio > boxRatio
        ) {

            sourceWidth =
                videoHeight *
                boxRatio;


            sourceX =
                (
                    videoWidth -
                    sourceWidth
                ) / 2;

        }

        else if (
            videoRatio < boxRatio
        ) {

            sourceHeight =
                videoWidth /
                boxRatio;


            sourceY =
                (
                    videoHeight -
                    sourceHeight
                ) / 2;

        }


        canvas.width =
            Math.floor(
                sourceWidth
            );

        canvas.height =
            Math.floor(
                sourceHeight
            );


        video.style.display =
            "block";


        canvas.style.display =
            "none";


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


        detector =
            new AR.Detector({

                dictionaryName:
                    "ARUCO"

            });


        detectMarkers();

    }


    catch (
        error
    ) {

        console.error(
            "Kamera gagal diakses:",
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
            "Kamera tidak dapat diakses. Pastikan izin kamera telah diberikan dan website menggunakan HTTPS."
        );

    }

}


/* =====================================================
   DETEKSI MARKER
===================================================== */

function detectMarkers() {

    if (
        !cameraIsRunning
    ) {

        return;

    }


    if (

        video.readyState >= 2 &&

        video.videoWidth > 0 &&

        video.videoHeight > 0

    ) {


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


        const imageData =
            ctx.getImageData(

                0,

                0,

                canvas.width,

                canvas.height

            );


        try {


            const markers =
                detector.detect(
                    imageData
                );


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


    detectionAnimation =
        requestAnimationFrame(
            detectMarkers
        );

}


/* =====================================================
   MARKER TERDETEKSI
===================================================== */

function detectComponent(markerId) {


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


    if (
        markerAlreadyDetected
    ) {

        return;

    }


    markerAlreadyDetected =
        true;


    const detectedName =
        document.getElementById(
            "detectedComponentName"
        );


    const detectedModal =
        document.getElementById(
            "detectedModal"
        );


    if (
        detectedName
    ) {

        detectedName.textContent =
            currentComponent.name;

    }


    if (
        detectedModal
    ) {

        detectedModal.classList.add(
            "show"
        );

    }

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


    const detailImage =
        document.getElementById(
            "detailImage"
        );


    const detailName =
        document.getElementById(
            "detailName"
        );


    const detailDescription =
        document.getElementById(
            "detailDescription"
        );


    if (
        detailImage
    ) {

        detailImage.src =
            currentComponent.image;


        detailImage.alt =
            currentComponent.name;

    }


    if (
        detailName
    ) {

        detailName.textContent =
            currentComponent.name;

    }


    if (
        detailDescription
    ) {

        detailDescription.textContent =
            currentComponent.description;

    }


    closeDetectedModal();


    const detailModal =
        document.getElementById(
            "detailModal"
        );


    if (
        detailModal
    ) {

        detailModal.classList.add(
            "show"
        );

    }

}


/* =====================================================
   TUTUP POPUP MARKER
===================================================== */

function closeDetectedModal() {


    const detectedModal =
        document.getElementById(
            "detectedModal"
        );


    if (
        detectedModal
    ) {

        detectedModal.classList.remove(
            "show"
        );

    }


    markerAlreadyDetected =
        false;

}


/* =====================================================
   TUTUP DETAIL
===================================================== */

function closeDetailModal() {


    const detailModal =
        document.getElementById(
            "detailModal"
        );


    if (
        detailModal
    ) {

        detailModal.classList.remove(
            "show"
        );

    }


    markerAlreadyDetected =
        false;

}


/* =====================================================
   MATIKAN KAMERA
===================================================== */

function stopCamera() {


    if (
        detectionAnimation
    ) {

        cancelAnimationFrame(
            detectionAnimation
        );


        detectionAnimation =
            null;

    }


    if (
        cameraStream
    ) {


        cameraStream
            .getTracks()
            .forEach(
                function (track) {

                    track.stop();

                }
            );


        cameraStream =
            null;

    }


    if (
        video
    ) {

        video.pause();


        video.srcObject =
            null;


        video.style.display =
            "none";

    }


    if (
        canvas
    ) {

        canvas.style.display =
            "none";

    }


    detector =
        null;


    cameraIsRunning =
        false;


    markerAlreadyDetected =
        false;


    currentComponent =
        null;


    if (
        cameraPlaceholder
    ) {

        cameraPlaceholder.style.display =
            "flex";

    }


    if (
        startButton
    ) {

        startButton.style.display =
            "flex";

    }


    if (
        stopButton
    ) {

        stopButton.style.display =
            "none";

    }


    if (
        cameraStatus
    ) {

        cameraStatus.textContent =
            "Kamera belum aktif";


        cameraStatus.style.color =
            "#cbd5e1";

    }

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