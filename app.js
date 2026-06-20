import { Application } from '@splinetool/runtime';

const video = document.getElementById('webcam');
const statusText = document.getElementById('statusText');
const faceText = document.getElementById('faceText');
const loadingScreen = document.getElementById('loadingScreen');
const canvas = document.getElementById('canvas3d');

let splineApp = null;
let modelsLoaded = false;

// 1. Load Spline 3D Scene
async function initSpline() {
    splineApp = new Application(canvas);
    // NexBot Robot link jo aapne diya tha
    await splineApp.load('https://prod.spline.design/EDGOdUsn2APKBgAW2R0Q4pdv/scene.splinecode');
    checkLoadingStatus();
}

// 2. Load Face-API.js Models & Start Camera
async function initTracking() {
    statusText.innerText = "Loading AI Models...";
    const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
    
    await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
    ]);

    statusText.innerText = "Starting Camera...";
    
    navigator.mediaDevices.getUserMedia({ video: {} })
        .then(stream => {
            video.srcObject = stream;
            modelsLoaded = true;
            statusText.innerText = "🟢 Tracking Active";
            statusText.style.color = "#22c55e";
            checkLoadingStatus();
        })
        .catch(err => {
            statusText.innerText = "❌ Camera Access Denied";
            statusText.style.color = "#ef4444";
            console.error(err);
        });
}

function checkLoadingStatus() {
    if (splineApp && modelsLoaded) {
        loadingScreen.style.opacity = 0;
        setTimeout(() => loadingScreen.remove(), 500);
        startTrackingLoop();
    }
}

// 3. Tracking Loop
async function startTrackingLoop() {
    setInterval(async () => {
        if (!video.paused && !video.ended && modelsLoaded) {
            const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions());

            if (detection && splineApp) {
                faceText.innerText = "👋 YES";
                faceText.style.color = "#22c55e";

                const { x, y, width, height } = detection.box;
                const videoWidth = video.videoWidth || 640;
                const videoHeight = video.videoHeight || 480;

                // Center points mapping
                const faceCenterX = x + width / 2;
                const faceCenterY = y + height / 2;

                // Normalized coordinates (-1 to 1)
                const targetX = ((faceCenterX / videoWidth) - 0.5) * 2;
                const targetY = -((faceCenterY / videoHeight) - 0.5) * 2;

                // NexBot ki bone/group rotation update karna
                // Note: Spline runtime API name filters use karti hai
                const robot = splineApp.findObjectByName('Robot') || splineApp.findObjectByName('Group');
                if (robot) {
                    robot.rotation.y = targetX * 0.5; // Controls horizontal look
                    robot.rotation.x = targetY * 0.3; // Controls vertical look
                }
            } else {
                faceText.innerText = "❌ NO";
                faceText.style.color = "#ef4444";
            }
        }
    }, 100); // Har 100ms ke baad camera read karega
}

// Run everything
initSpline();
initTracking();