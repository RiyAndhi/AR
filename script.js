/* =========================
   GLOBAL CAMERA VARIABLE
========================= */

let cameraStream = null;


/* =========================
   PINDAH SCREEN
========================= */

function showScreen(screenId) {

    const screens = document.querySelectorAll(".screen");

    screens.forEach((screen) => {
        screen.classList.remove("active");
    });


    const selectedScreen = document.getElementById(screenId);

    if (selectedScreen) {
        selectedScreen.classList.add("active");
    }


    /*
     * Jika keluar dari halaman Scan Marker,
     * kamera otomatis dimatikan.
     */

    if (screenId !== "scan") {
        stopCamera();
    }

}


/* =========================
   AKTIFKAN KAMERA
========================= */

async function startCamera() {

    const video = document.getElementById("camera");

    const placeholder = document.getElementById(
        "cameraPlaceholder"
    );

    const status = document.getElementById(
        "cameraStatus"
    );

    const startButton = document.getElementById(
        "startCameraButton"
    );

    const stopButton = document.getElementById(
        "stopCameraButton"
    );


    /*
     * Jika kamera sudah aktif,
     * tidak perlu mengaktifkannya lagi.
     */

    if (cameraStream) {
        return;
    }


    try {

        /*
         * Meminta akses kamera belakang.
         */

        cameraStream =
            await navigator.mediaDevices.getUserMedia({

                video: {
                    facingMode: {
                        ideal: "environment"
                    }
                },

                audio: false

            });


        /*
         * Menghubungkan kamera
         * ke elemen video.
         */

        video.srcObject = cameraStream;


        /*
         * Menampilkan video kamera.
         */

        video.style.display = "block";

        placeholder.style.display = "none";


        /*
         * Mengubah status.
         */

        status.textContent =
            "Kamera aktif - arahkan ke marker";


        status.style.color =
            "#38bdf8";


        /*
         * Mengatur tombol.

         */

        startButton.style.display =
            "none";

        stopButton.style.display =
            "flex";


    } catch (error) {

        console.error(
            "Gagal mengakses kamera:",
            error
        );


        status.textContent =
            "Kamera tidak dapat diakses";


        status.style.color =
            "#f87171";


        alert(
            "Kamera tidak dapat diakses. " +
            "Pastikan izin kamera sudah diberikan."
        );

    }

}


/* =========================
   MATIKAN KAMERA
========================= */

function stopCamera() {

    const video = document.getElementById(
        "camera"
    );

    const placeholder = document.getElementById(
        "cameraPlaceholder"
    );

    const status = document.getElementById(
        "cameraStatus"
    );

    const startButton = document.getElementById(
        "startCameraButton"
    );

    const stopButton = document.getElementById(
        "stopCameraButton"
    );


    /*
     * Mematikan seluruh track kamera.
     */

    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach((track) => {
                track.stop();
            });

        cameraStream = null;

    }


    /*
     * Menghapus sumber video.
     */

    video.srcObject = null;

    video.style.display = "none";


    /*
     * Menampilkan placeholder lagi.
     */

    placeholder.style.display =
        "flex";


    /*
     * Mengubah status kamera.
     */

    status.textContent =
        "Kamera belum aktif";


    status.style.color =
        "#cbd5e1";


    /*
     * Mengatur tombol.

     */

    startButton.style.display =
        "flex";

    stopButton.style.display =
        "flex";

}


/* =========================
   KEMBALI KE HOME
========================= */

function closeCameraAndGoHome() {

    stopCamera();

    showScreen("home");

}