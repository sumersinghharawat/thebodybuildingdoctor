import { detectFace } from 'faceplugin-face-recognition-js/lib/fr_detect.js';
import { predictLandmark } from 'faceplugin-face-recognition-js/lib/fr_landmark.js';
import { predictLiveness } from 'faceplugin-face-recognition-js/lib/fr_liveness.js';
import { extractFeature } from 'faceplugin-face-recognition-js/lib/fr_feature.js';
import * as openCvBridge from '../faceplugin/load-opencv.js';

const MODELS = '/faceplugin/model';

function log(message, kind = 'info') {
    const el = document.getElementById('log');
    const line = document.createElement('div');
    line.className = kind;
    line.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    el.appendChild(line);
    el.scrollTop = el.scrollHeight;
    document.getElementById('status').textContent = message;
    console.log(message);
}

async function loadModel(name) {
    log(`Fetching ${name}…`);
    const response = await fetch(`${MODELS}/${name}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${name}: ${response.status}`);
    }
    return response.arrayBuffer();
}

async function createSession(name, buffer) {
    log(`Creating session ${name}…`);
    const started = performance.now();
    const session = await ort.InferenceSession.create(buffer, { executionProviders: ['wasm'] });
    log(`${name} ready in ${Math.round(performance.now() - started)}ms`, 'ok');
    return session;
}

/**
 * Assumes OpenCV is already on window.cv and sessions.detect exists.
 */
export async function runCaptureOnly(sessions) {
    log('Capture module loaded');

    if (!window.cv?.Mat) {
        throw new Error('OpenCV is not ready. Run step 2 first.');
    }

    openCvBridge.bindWindowCv();
    log('Faceplugin cv bridge ready', 'ok');

    for (const name of ['fr_landmark.onnx', 'fr_liveness.onnx', 'fr_feature.onnx']) {
        const key = name.replace('fr_', '').replace('.onnx', '');
        if (!sessions[key]) {
            sessions[key] = await createSession(name, await loadModel(name));
        }
    }

    log('Opening camera…');
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
    });
    video.srcObject = stream;
    await video.play();
    await new Promise((resolve, reject) => {
        const t = setTimeout(() => reject(new Error('Camera timeout')), 15000);
        if (video.readyState >= 2) {
            clearTimeout(t);
            resolve();
            return;
        }
        video.addEventListener('loadeddata', () => {
            clearTimeout(t);
            resolve();
        }, { once: true });
    });
    log('Camera ready — capturing…', 'ok');

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const detection = await detectFace(sessions.detect, canvas.id);
    if (!detection?.size) {
        throw new Error('No face detected');
    }

    const landmarks = await predictLandmark(sessions.landmark, canvas.id, detection.bbox);
    const liveness = await predictLiveness(sessions.liveness, canvas.id, detection.bbox);
    const livenessScore = liveness[0]?.[4] ?? 0;
    const features = await extractFeature(sessions.feature, canvas.id, landmarks);
    const descriptor = Array.from(features[0].output.data);

    const result = {
        faces: detection.size,
        livenessScore,
        descriptorLength: descriptor.length,
        descriptorPreview: descriptor.slice(0, 5).map((n) => Number(n.toFixed(4))),
    };
    log(`PASS: ${JSON.stringify(result)}`, 'ok');
    return result;
}
