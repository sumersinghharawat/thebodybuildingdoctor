export function bindFaceLoadingUi({ setStatus }) {
    const loadingEl = document.getElementById('face-loading');
    const loadingTextEl = loadingEl?.querySelector('[data-face-loading-text]');

    function setLoading(active, message) {
        if (loadingEl) {
            loadingEl.classList.toggle('d-none', !active);
        }

        if (message && loadingTextEl) {
            loadingTextEl.textContent = message;
        }
    }

    return {
        onProgress(message) {
            setStatus(message);
            setLoading(true, message);
        },
        showLoading(message = 'Loading…') {
            setLoading(true, message);
        },
        hideLoading() {
            setLoading(false);
        },
    };
}
