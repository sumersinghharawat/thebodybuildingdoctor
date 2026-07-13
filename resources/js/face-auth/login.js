import { init, captureFaceSample, stopCamera } from '../faceplugin/faceplugin-auth.js';
import { clearModelCache } from '../faceplugin/model-cache.js';
import { bindFaceLoadingUi } from './loading-ui.js';

const page = window.FaceAuthPage;
const button = document.getElementById('face-login-btn');
const retryButton = document.getElementById('face-retry-btn');
const statusEl = document.getElementById('face-status');
const errorEl = document.getElementById('face-error');
const successEl = document.getElementById('face-success');
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

async function submitLogin(sample) {
    const response = await fetch(page.endpoints.submit, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-CSRF-TOKEN': page.csrfToken,
        },
        credentials: 'same-origin',
        body: JSON.stringify({
            descriptor: sample.descriptor,
            liveness_score: sample.livenessScore,
            face_count: sample.faceCount,
        }),
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok || !body.success) {
        throw new Error(body.message || 'Face not recognized.');
    }

    return body;
}

async function handleLogin() {
    errorEl.classList.add('d-none');
    retryButton?.classList.add('d-none');
    button.disabled = true;

    try {
        setStatus('Scanning face with Faceplugin…');
        const sample = await captureFaceSample();
        setStatus('Verifying with server…');

        const result = await submitLogin(sample);

        showSuccess(result.message || 'Login successful. Redirecting…');
        setStatus('Welcome back!');
        stopCamera();

        window.setTimeout(() => {
            window.location.href = result.redirect || '/dashboard';
        }, 900);
    } catch (error) {
        attempts += 1;
        showError(error.message || 'Login failed.');
        setStatus('Login failed. Adjust lighting and try again.');

        if (attempts < page.config.maxRetries) {
            button.disabled = false;
        } else {
            setStatus('Maximum retries reached. Refresh the page to try again.');
        }
    }
}

async function bootstrap() {
    try {
        loadingUi.showLoading('Loading face recognition…');
        await init(page.config, { onProgress: loadingUi.onProgress });
        loadingUi.hideLoading();
        button.disabled = false;
        button.addEventListener('click', handleLogin);
        setStatus('Camera ready. Click to scan your face.');
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
