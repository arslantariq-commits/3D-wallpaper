import { Application } from '@splinetool/runtime';

const video = document.getElementById('webcam');
const statusText = document.getElementById('statusText');
const loadingScreen = document.getElementById('loadingScreen');
const canvas = document.getElementById('canvas3d');

let splineApp = null;

// 1. Initialize Spline Application
async function initSpline() {
    try {
        statusText.innerText = "Connecting to Spline...";
        splineApp = new Application(canvas);
        
        // Direct stream setup
        await splineApp.load('https://prod.spline.design/EDGOdUsn2APKBgAW2R0Q4pdv/scene.splinecode');
        
        // Remove loading overlay
        loadingScreen.style.opacity = 0;
        setTimeout(() => loadingScreen.remove(), 500);
        
        statusText.innerText = "🟢 System Active";
        statusText.style.color = "#22c55e";
        
        startInteractiveFallback();
        startCamera();
    } catch (error) {
        statusText.innerText = "❌ Load Error";
        statusText.style.color = "#ef4444";
        console.error("Spline custom load error:", error);
    }
}

// 2. Fallback camera display activation
function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => {
            console.log("Webcam target frame container idle or hidden.");
        });
}

// 3. Precise Tracking Logic via Pointer Events mapping to Object Bones
function startInteractiveFallback() {
    window.addEventListener('pointermove', (e) => {
        if (!splineApp) return;

        // Normalize mouse coordinates to -1 and 1 range
        const targetX = (e.clientX / window.innerWidth - 0.5) * 2;
        const targetY = -(e.clientY / window.innerHeight - 0.5) * 2;

        // Querying the internal scene nodes of NexBot character
        const robotNode = splineApp.findObjectByName('Robot') || 
                          splineApp.findObjectByName('Group') || 
                          splineApp.findObjectByName('Character');
                          
        if (robotNode) {
            // Apply real-time rotations on custom axes safely
            robotNode.rotation.y = targetX * 0.4; 
            robotNode.rotation.x = targetY * 0.2;
        }
    });
}

// Execute core thread
initSpline();
