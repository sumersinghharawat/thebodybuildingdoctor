const DB_NAME = 'faceauth-models';
const STORE_NAME = 'buffers';
const CACHE_VERSION = 3;

const MIN_MODEL_BYTES = {
    'fr_detect.onnx': 1_000_000,
    'fr_landmark.onnx': 1_000_000,
    'fr_liveness.onnx': 1_500_000,
    'fr_feature.onnx': 4_000_000,
};

function cacheKey(url) {
    return `${CACHE_VERSION}:${url}`;
}

function expectedMinBytes(url) {
    const filename = url.split('/').pop() ?? '';

    return MIN_MODEL_BYTES[filename] ?? 100_000;
}

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, CACHE_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;

            if (db.objectStoreNames.contains(STORE_NAME)) {
                db.deleteObjectStore(STORE_NAME);
            }

            db.createObjectStore(STORE_NAME);
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function readCachedBuffer(url) {
    try {
        const db = await openDatabase();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const request = transaction.objectStore(STORE_NAME).get(cacheKey(url));

            request.onsuccess = () => resolve(request.result ?? null);
            request.onerror = () => reject(request.error);
        });
    } catch {
        return null;
    }
}

async function writeCachedBuffer(url, buffer) {
    try {
        const db = await openDatabase();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            transaction.objectStore(STORE_NAME).put(buffer, cacheKey(url));
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    } catch {
        // Ignore cache write failures (private mode, quota, etc.).
    }
}

function downloadWithProgress(url, onProgress) {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.timeout = 120_000;

        request.onprogress = (event) => {
            if (!onProgress || !event.lengthComputable) {
                return;
            }

            onProgress(Math.round((event.loaded / event.total) * 100));
        };

        request.ontimeout = () => reject(new Error(`Timed out downloading ${url}`));
        request.onload = () => {
            if (request.status >= 200 && request.status < 300) {
                resolve(request.response);
                return;
            }

            reject(new Error(`Failed to download ${url} (HTTP ${request.status})`));
        };
        request.onerror = () => reject(new Error(`Failed to download ${url}`));
        request.send();
    });
}

function isValidBuffer(url, buffer) {
    return buffer instanceof ArrayBuffer && buffer.byteLength >= expectedMinBytes(url);
}

export async function clearModelCache() {
    await new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(DB_NAME);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
        request.onblocked = () => resolve();
    });
}

export async function fetchModelBuffer(url, onProgress) {
    const cached = await readCachedBuffer(url);

    if (isValidBuffer(url, cached)) {
        onProgress?.(100, true);
        return cached;
    }

    const buffer = await downloadWithProgress(url, (percent) => onProgress?.(percent, false));

    if (!isValidBuffer(url, buffer)) {
        throw new Error(`Downloaded model looks incomplete: ${url}`);
    }

    await writeCachedBuffer(url, buffer);

    return buffer;
}
