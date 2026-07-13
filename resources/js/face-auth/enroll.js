import { init, captureFaceSample, stopCamera } from '../faceplugin/faceplugin-auth.js';
import { clearModelCache } from '../faceplugin/model-cache.js';
import { bindFaceLoadingUi } from './loading-ui.js';

const page = window.FaceAuthPage;
const button = document.getElementById('face-enroll-btn');
const retryButton = document.getElementById('face-retry-btn');
const statusEl = document.getElementById('face-status');
const errorEl = document.getElementById('face-error');
const successEl = document.getElementById('face-success');
const progress = document.getElementById('enroll-progress');
const sampleCount = page.config.enrollmentSamples || 5;
const loadingUi = bindFaceLoadingUi({ setStatus });
let attempts = 0;

function setStatus(message) {
    statusEl.textContent = message;
}

function showError(message, showRetry = false) {
    errorEl.textContent = message;
    errorEl.classList.remove('d-none');
    successEl?.classList.add('d-none');
    retryButton?.classList.toggle('d-none', !showRetry);
}

function showSuccess(message) {
    if (!successEl) {
        return;
    }

    successEl.textContent = message;
    successEl.classList.remove('d-none');
    errorEl.classList.add('d-none');
    retryButton?.classList.add('d-none');
}

function updateProgress(current) {
    const percent = Math.round((current / sampleCount) * 100);
    progress.style.width = `${percent}%`;
    progress.textContent = `${percent}%`;
}

async function submitEnrollment(samples, livenessScore) {
    const response = await fetch(page.endpoints.submit, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-CSRF-TOKEN': page.csrfToken,
        },
        credentials: 'same-origin',
        body: JSON.stringify({
            samples,
            liveness_score: livenessScore,
        }),
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok || !body.success) {
        throw new Error(body.message || 'Enrollment failed.');
    }

    return body;
}

async function captureSamples() {
    const samples = [];
    let livenessScore = 0;

    for (let index = 0; index < sampleCount; index += 1) {
        setStatus(`Capturing sample ${index + 1} of ${sampleCount}…`);
        updateProgress(index);

        const sample = await captureFaceSample();
        samples.push(sample.descriptor);
        livenessScore = Math.max(livenessScore, sample.livenessScore);

        await new Promise((resolve) => setTimeout(resolve, 400));
    }

    updateProgress(sampleCount);

    return submitEnrollment(samples, livenessScore);
}

async function handleEnroll() {
    errorEl.classList.add('d-none');
    retryButton?.classList.add('d-none');
    button.disabled = true;
    updateProgress(0);

    try {
        const result = await captureSamples();

        showSuccess(result.message || 'Enrollment complete. Redirecting…');
        setStatus('Face enrolled successfully.');
        stopCamera();

        window.setTimeout(() => {
            window.location.href = result.redirect || '/dashboard';
        }, 900);
    } catch (error) {
        showError(error.message || 'Enrollment failed.');
        setStatus('Enrollment failed. Try again with better lighting.');
        button.disabled = false;
        updateProgress(0);
    }
}

async function bootstrap() {
    try {
        loadingUi.showLoading('Loading face recognition…');
        await init(page.config, { onProgress: loadingUi.onProgress });
        loadingUi.hideLoading();
        button.disabled = false;
        button.addEventListener('click', handleEnroll);
        setStatus('Camera ready. Click to start enrollment.');
    } catch (error) {
        loadingUi.hideLoading();
        showError(error.message || 'Unable to initialize Faceplugin.', true);
        setStatus('Initialization failed.');
        button.disabled = true;
    }
}

retryButton?.addEventListener('click', async () => {
    retryButton.disabled = true;
    setStatus('Clearing cached models and retrying…');

    try {
        await clearModelCache();
    } catch {
        // Continue even if cache deletion fails.
    }

    window.location.reload();
});

bootstrap();
