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


const cameraBox =
    document.getElementById(
        "cameraBox"
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


let detector =
    null;


let sourceX =
    0;


let sourceY =
    0;


let sourceWidth =
    0;


let sourceHeight =
    0;


document.addEventListener(
    "DOMContentLoaded",
    function () {

        stopCamera();

    }
);


function showScreen(
    screenId
) {


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


async function startCamera() {


    if (
        cameraIsRunning
    ) {

        return;

    }


    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        cameraStatus.textContent =
            "Browser tidak mendukung kamera";


        return;

    }


    try {


        cameraStatus.textContent =
            "Meminta akses kamera...";


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


        video.srcObject =
            cameraStream;


        await video.play();


        await new Promise(
            function (
                resolve
            ) {

                if (
                    video.videoWidth > 0 &&
                    video.videoHeight > 0
                ) {

                    resolve();

                    return;

                }


                video.onloadedmetadata =
                    function () {

                        resolve();

                    };

            }
        );


        calculateCrop();


        canvas.width =
            sourceWidth;


        canvas.height =
            sourceHeight;


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
            new AR.Detector(
                {
                    dictionaryName:
                        "ARUCO"
                }
            );


        detectMarkers();


    }


    catch (
        error
    ) {


        console.error(
            "Kamera gagal diakses:",
            error
        );


        stopCamera();


        cameraStatus.textContent =
            "Kamera tidak dapat diakses";


        alert(
            "Kamera tidak dapat diakses. Pastikan izin kamera telah diberikan dan website dijalankan melalui HTTPS atau localhost."
        );

    }

}


function calculateCrop() {


    const videoWidth =
        video.videoWidth;


    const videoHeight =
        video.videoHeight;


    const videoRatio =
        videoWidth /
        videoHeight;


    const boxWidth =
        cameraBox.clientWidth;


    const boxHeight =
        cameraBox.clientHeight;


    const boxRatio =
        boxWidth /
        boxHeight;


    sourceX =
        0;


    sourceY =
        0;


    sourceWidth =
        videoWidth;


    sourceHeight =
        videoHeight;


    if (
        videoRatio >
        boxRatio
    ) {


        sourceWidth =
            videoHeight *
            boxRatio;


        sourceX =
            (
                videoWidth -
                sourceWidth
            ) /
            2;

    }


    else {


        sourceHeight =
            videoWidth /
            boxRatio;


        sourceY =
            (
                videoHeight -
                sourceHeight
            ) /
            2;

    }

}


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


        calculateCrop();


        canvas.width =
            sourceWidth;


        canvas.height =
            sourceHeight;


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


        try {


            const imageData =
                ctx.getImageData(

                    0,

                    0,

                    canvas.width,

                    canvas.height

                );


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


function showInfoDetail(
    componentId
) {


    const component =
        components[
            componentId
        ];


    if (
        !component
    ) {

        return;

    }


    currentComponent =
        component;


    document.getElementById(
        "detailImage"
    ).src =
        component.image;


    document.getElementById(
        "detailImage"
    ).alt =
        component.name;


    document.getElementById(
        "detailName"
    ).textContent =
        component.name;


    document.getElementById(
        "detailDescription"
    ).textContent =
        component.description;


    document.getElementById(
        "detailModal"
    ).classList.add(
        "show"
    );

}


function closeDetectedModal() {


    document.getElementById(
        "detectedModal"
    ).classList.remove(
        "show"
    );


    markerAlreadyDetected =
        false;

}


function closeDetailModal() {


    document.getElementById(
        "detailModal"
    ).classList.remove(
        "show"
    );


    markerAlreadyDetected =
        false;

}


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
                function (
                    track
                ) {

                    track.stop();

                }
            );


        cameraStream =
            null;

    }


    video.pause();


    video.srcObject =
        null;


    video.style.display =
        "none";


    canvas.style.display =
        "none";


    detector =
        null;


    cameraIsRunning =
        false;


    markerAlreadyDetected =
        false;


    currentComponent =
        null;


    cameraPlaceholder.style.display =
        "flex";


    startButton.style.display =
        "flex";


    stopButton.style.display =
        "none";


    cameraStatus.textContent =
        "Aktifkan kamera untuk memindai";

}


function closeCameraAndGoHome() {


    stopCamera();


    showScreen(
        "home"
    );

}


window.addEventListener(
    "pagehide",
    function () {

        stopCamera();

    }
);