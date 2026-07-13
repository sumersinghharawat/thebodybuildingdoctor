let cv = null;
let openCvPromise = null;

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

function isOpenCvReady() {
    return Boolean(window.cv?.Mat);
}

export function bindWindowCv() {
    if (!window.cv?.Mat) {
        throw new Error('OpenCV is not initialized on window.cv');
    }

    cv = window.cv;
    openCvPromise = Promise.resolve(cv);

    return cv;
}

export async function loadFacepluginOpenCv(opencvPath) {
    if (cv?.Mat || isOpenCvReady()) {
        return bindWindowCv();
    }

    if (openCvPromise) {
        return openCvPromise;
    }

    const basePath = opencvPath.replace(/\/$/, '');

    openCvPromise = withTimeout(
        new Promise((resolve, reject) => {
            let settled = false;

            const finish = (source) => {
                if (settled) {
                    return;
                }

                if (!isOpenCvReady()) {
                    return;
                }

                settled = true;
                cv = window.cv;
                window.clearInterval(poll);
                console.log(`OpenCV ready via ${source}`);
                resolve(cv);
            };

            window.Module = {
                locateFile(path) {
                    if (path.endsWith('.wasm')) {
                        return `${basePath}/opencv_js.wasm`;
                    }

                    return path.startsWith('http') ? path : `${basePath}/${path}`;
                },
                // Faceplugin OpenCV uses older Emscripten callbacks.
                _main() {
                    finish('_main');
                },
                onRuntimeInitialized() {
                    finish('onRuntimeInitialized');
                },
            };

            const poll = window.setInterval(() => finish('poll'), 250);

            const existing = document.querySelector('script[data-face-opencv="1"]');

            if (existing) {
                if (isOpenCvReady()) {
                    finish('existing');
                }

                existing.addEventListener('error', () => {
                    openCvPromise = null;
                    reject(new Error('Failed to load OpenCV runtime.'));
                }, { once: true });

                return;
            }

            const script = document.createElement('script');
            script.src = `${basePath}/opencv.js`;
            script.async = true;
            script.dataset.faceOpencv = '1';
            script.onerror = () => {
                openCvPromise = null;
                window.clearInterval(poll);
                reject(new Error(`Failed to load OpenCV from ${script.src}`));
            };
            document.head.appendChild(script);
        }),
        60_000,
        'Timed out while loading the vision runtime. Refresh and try again.',
    ).catch((error) => {
        openCvPromise = null;
        throw error;
    });

    return openCvPromise;
}

export { cv };
