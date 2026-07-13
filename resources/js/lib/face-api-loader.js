import * as faceapi from 'face-api.js';

let modelsPromise = null;

export function getFaceApi() {
    return faceapi;
}

export function loadFaceModels(modelsPath = '/models') {
    if (modelsPromise) {
        return modelsPromise;
    }

    const base = modelsPath.replace(/\/$/, '');

    modelsPromise = Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(base),
        faceapi.nets.faceLandmark68Net.loadFromUri(base),
        faceapi.nets.faceRecognitionNet.loadFromUri(base),
    ]).then(() => faceapi);

    return modelsPromise;
}

export function detectorOptions() {
    return new faceapi.TinyFaceDetectorOptions({
        // Larger input + lower threshold = more reliable webcam detection.
        inputSize: 416,
        scoreThreshold: 0.35,
    });
}

/**
 * Draw the current video frame onto a canvas. face-api.js is more reliable on
 * canvases than on live <video> elements (especially with CSS object-fit).
 */
export function videoFrameToCanvas(video) {
    if (!video) {
        throw new Error('Camera is not ready.');
    }

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        throw new Error('Camera preview is still starting. Wait a moment and try again.');
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(video, 0, 0, width, height);

    return canvas;
}

/**
 * Detect faces with landmarks + descriptor from a video/canvas/image element.
 */
export async function detectFaces(input) {
    await loadFaceModels();

    const source = input instanceof HTMLVideoElement ? videoFrameToCanvas(input) : input;

    return faceapi
        .detectAllFaces(source, detectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();
}

export async function detectSingleFace(input, { retries = 4, delayMs = 350 } = {}) {
    let lastError = 'no_face';

    for (let attempt = 0; attempt < retries; attempt += 1) {
        try {
            const detections = await detectFaces(input);

            if (detections.length === 1) {
                return {
                    error: null,
                    detection: detections[0],
                    descriptor: Array.from(detections[0].descriptor),
                    landmarks: detections[0].landmarks,
                };
            }

            if (detections.length > 1) {
                return { error: 'multiple_faces', detections };
            }

            lastError = 'no_face';
        } catch (error) {
            lastError = error.message || 'no_face';
        }

        if (attempt < retries - 1) {
            await new Promise((resolve) => window.setTimeout(resolve, delayMs));
        }
    }

    return { error: lastError === 'multiple_faces' ? 'multiple_faces' : 'no_face', detections: [] };
}

function eyeAspectRatio(eyePoints) {
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const vertical1 = dist(eyePoints[1], eyePoints[5]);
    const vertical2 = dist(eyePoints[2], eyePoints[4]);
    const horizontal = dist(eyePoints[0], eyePoints[3]);

    if (horizontal === 0) {
        return 0;
    }

    return (vertical1 + vertical2) / (2 * horizontal);
}

/**
 * Estimate yaw from 68 landmarks: negative = left, positive = right.
 */
export function estimateHeadYaw(landmarks) {
    const nose = landmarks.getNose()[3];
    const jaw = landmarks.getJawOutline();
    const leftJaw = jaw[0];
    const rightJaw = jaw[16];
    const midX = (leftJaw.x + rightJaw.x) / 2;
    const faceWidth = Math.max(1, rightJaw.x - leftJaw.x);

    return (nose.x - midX) / faceWidth;
}

export function getEyeAspectRatio(landmarks) {
    const left = eyeAspectRatio(landmarks.getLeftEye());
    const right = eyeAspectRatio(landmarks.getRightEye());

    return (left + right) / 2;
}

export const LIVENESS_LABELS = {
    front: 'Look straight at the camera',
    left: 'Turn your head left',
    right: 'Turn your head right',
};

export const ENROLLMENT_POSES = ['front', 'left', 'right'];

/**
 * Check if the current head pose matches the required challenge.
 *
 * Selfie (user-facing) camera: when the user turns their head left, the nose
 * moves toward the right side of the raw (unmirrored) video frame.
 */
export function poseMatches(action, yaw) {
    if (action === 'front') {
        return Math.abs(yaw) <= 0.1;
    }

    // User "left" => positive yaw on front-facing camera.
    if (action === 'left') {
        return yaw >= 0.12;
    }

    // User "right" => negative yaw on front-facing camera.
    if (action === 'right') {
        return yaw <= -0.12;
    }

    return false;
}
