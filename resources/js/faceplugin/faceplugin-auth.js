import { fetchModelBuffer } from './model-cache.js';
import { loadFacepluginOpenCv } from './load-opencv.js';

const MODEL_FILES = {
    detect: 'fr_detect.onnx',
    landmark: 'fr_landmark.onnx',
    liveness: 'fr_liveness.onnx',
    feature: 'fr_feature.onnx',
};

const MODEL_LABELS = {
    detect: 'face detection',
    landmark: 'landmarks',
    liveness: 'liveness',
    feature: 'recognition',
};

const state = {
    config: null,
    sessions: null,
    stream: null,
    video: null,
    canvas: null,
    ready: false,
    faceApi: null,
};

let InferenceSession = null;

function reportProgress(onProgress, message, percent) {
    onProgress?.(message, percent);
}

function sleep(ms) {
    return new Promise((resolve) => {
        window.setTimeout(resolve, ms);
    });
}

function withTimeout(promise, ms, message) {
    return new Promise((resolve, reject) => {
        const timer = window.setTimeout(() => reject(new Error(message)), ms);

        promise
            .then((value) => {
                window.clearTimeout(timer);
                resolve(value);
            })
            .catch((error) => {
                window.clearTimeout(timer);
                reject(error);
            });
    });
}

function startHeartbeat(onProgress, message, percent) {
    const started = Date.now();

    const timer = window.setInterval(() => {
        const seconds = Math.round((Date.now() - started) / 1000);
        onProgress?.(`${message} (${seconds}s)`, percent);
    }, 5000);

    return () => window.clearInterval(timer);
}

async function ensureOnnxRuntime() {
    if (InferenceSession) {
        return InferenceSession;
    }

    await import('./onnx-runtime.js');
    const ort = await import('onnxruntime-web');
    InferenceSession = ort.InferenceSession;

    return InferenceSession;
}

async function ensureFaceApi() {
    if (state.faceApi) {
        return state.faceApi;
    }

    const [detect, landmark, liveness, feature] = await Promise.all([
        import('faceplugin-face-recognition-js/lib/fr_detect.js'),
        import('faceplugin-face-recognition-js/lib/fr_landmark.js'),
        import('faceplugin-face-recognition-js/lib/fr_liveness.js'),
        import('faceplugin-face-recognition-js/lib/fr_feature.js'),
    ]);

    state.faceApi = {
        detectFace: detect.detectFace,
        predictLandmark: landmark.predictLandmark,
        predictLiveness: liveness.predictLiveness,
        extractFeature: feature.extractFeature,
    };

    return state.faceApi;
}

function cloneBuffer(buffer) {
    return buffer.slice(0);
}

async function downloadModelBuffers(modelBase, onProgress) {
    const entries = Object.entries(MODEL_FILES);
    const buffers = [];

    for (let index = 0; index < entries.length; index += 1) {
        const [key, filename] = entries[index];
        const url = `${modelBase}/${filename}`;
        const step = index + 1;
        const total = entries.length;

        const buffer = await fetchModelBuffer(url, (percent, fromCache) => {
            const prefix = fromCache ? 'Using cached' : 'Downloading';
            reportProgress(
                onProgress,
                `${prefix} ${MODEL_LABELS[key]} model (${step}/${total})… ${percent}%`,
                20 + Math.round(((index + percent / 100) / total) * 25),
            );
        });

        buffers.push(cloneBuffer(buffer));
        await sleep(25);
    }

    return { entries, buffers };
}

async function createSessionsSequentially(entries, buffers, onProgress) {
    const Session = await ensureOnnxRuntime();
    const sessions = {};

    for (let index = 0; index < entries.length; index += 1) {
        const [key] = entries[index];
        const step = index + 1;
        const total = entries.length;
        const label = `Preparing ${MODEL_LABELS[key]} model (${step}/${total})`;
        const percent = 50 + Math.round((step / total) * 35);

        reportProgress(onProgress, `${label}…`, percent);
        const stopHeartbeat = startHeartbeat(onProgress, label, percent);

        try {
            sessions[key] = await withTimeout(
                Session.create(buffers[index], { executionProviders: ['wasm'] }),
                180_000,
                `Timed out while preparing the ${MODEL_LABELS[key]} model. Click "Clear cache & retry".`,
            );
        } finally {
            stopHeartbeat();
        }

        await sleep(150);
    }

    return sessions;
}

function waitForVideoFrame(video) {
    return new Promise((resolve, reject) => {
        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            resolve();
            return;
        }

        const timeout = window.setTimeout(() => {
            reject(new Error('Camera preview did not start.'));
        }, 20_000);

        video.addEventListener(
            'loadeddata',
            () => {
                window.clearTimeout(timeout);
                resolve();
            },
            { once: true },
        );
    });
}

async function startCamera(video) {
    if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access is not supported in this browser.');
    }

    const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            facingMode: 'user',
            width: { ideal: 640, max: 1280 },
            height: { ideal: 480, max: 720 },
        },
    });

    video.srcObject = stream;
    await video.play();
    await waitForVideoFrame(video);

    return stream;
}

function drawVideoToCanvas() {
    const context = state.canvas.getContext('2d');
    context.drawImage(state.video, 0, 0, state.canvas.width, state.canvas.height);
}

function featureVector(featureOutput) {
    return Array.from(featureOutput.output.data);
}

async function captureFaceSample() {
    const { detectFace, predictLandmark, predictLiveness, extractFeature } = await ensureFaceApi();

    await waitForVideoFrame(state.video);
    drawVideoToCanvas();

    const detection = await detectFace(state.sessions.detect, state.canvas.id);

    if (!detection?.size || detection.size < 1) {
        throw new Error('No face detected. Center your face in the frame.');
    }

    if (detection.size > 1) {
        throw new Error('Multiple faces detected. Only one person can be in frame.');
    }

    const landmarks = await predictLandmark(state.sessions.landmark, state.canvas.id, detection.bbox);
    const liveness = await predictLiveness(state.sessions.liveness, state.canvas.id, detection.bbox);
    const livenessScore = liveness[0]?.[4] ?? 0;

    if (livenessScore < state.config.livenessThreshold) {
        throw new Error('Liveness check failed. Please use your live face, not a photo or screen.');
    }

    const features = await extractFeature(state.sessions.feature, state.canvas.id, landmarks);
    const descriptor = featureVector(features[0]);

    if (descriptor.length !== state.config.descriptorLength) {
        throw new Error('Unexpected face descriptor length from Faceplugin.');
    }

    return {
        descriptor,
        livenessScore,
        faceCount: detection.size,
    };
}

async function init(config, options = {}) {
    const onProgress = options.onProgress;

    state.config = config;
    state.video = document.getElementById('face-video');
    state.canvas = document.getElementById('face-canvas');

    if (!state.video || !state.canvas) {
        throw new Error('Camera elements are missing from the page.');
    }

    const modelBase = config.modelsPath.replace(/\/$/, '');

    reportProgress(onProgress, 'Loading face models…', 10);
    const { entries, buffers } = await downloadModelBuffers(modelBase, onProgress);

    reportProgress(onProgress, 'Starting recognition engine…', 40);
    state.sessions = await createSessionsSequentially(entries, buffers, onProgress);

    reportProgress(onProgress, 'Loading vision runtime…', 80);
    const stopOpenCvHeartbeat = startHeartbeat(onProgress, 'Loading vision runtime', 80);

    try {
        await loadFacepluginOpenCv(config.opencvPath);
    } finally {
        stopOpenCvHeartbeat();
    }

    reportProgress(onProgress, 'Opening camera…', 92);
    state.stream = await withTimeout(
        startCamera(state.video),
        45_000,
        'Camera access timed out. Allow camera permission and refresh the page.',
    );

    state.canvas.width = state.video.videoWidth || 640;
    state.canvas.height = state.video.videoHeight || 480;
    state.ready = true;

    reportProgress(onProgress, 'Ready', 100);
}

function stopCamera() {
    if (state.stream) {
        state.stream.getTracks().forEach((track) => track.stop());
        state.stream = null;
    }
}

export { init, captureFaceSample, stopCamera };

window.FacePluginAuth = {
    init,
    captureFaceSample,
    stopCamera,
    get ready() {
        return state.ready;
    },
};
