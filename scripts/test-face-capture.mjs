/**
 * Browser integration test: init Faceplugin SDK and capture a face sample.
 *
 * Usage:
 *   node scripts/test-face-capture.mjs [enroll-url]
 *
 * Mocks getUserMedia with a looping face image so no real camera is required.
 */

import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';

const baseUrl = process.env.FACE_TEST_URL ?? 'https://thebodybuildingdoctor.test';
const enrollUrl = process.argv[2] ?? `${baseUrl}/face/login`;
const faceImagePath = process.env.FACE_TEST_IMAGE ?? '/tmp/face-test-lena.jpg';
const timeoutMs = Number(process.env.FACE_TEST_TIMEOUT_MS ?? 180_000);

const faceImageBase64 = readFileSync(faceImagePath).toString('base64');
const faceImageDataUrl = `data:image/jpeg;base64,${faceImageBase64}`;

console.log(`Testing face capture at: ${enrollUrl}`);
console.log(`Using test image: ${faceImagePath}`);

const browser = await chromium.launch({
    headless: true,
    args: [
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
    ],
});

const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    permissions: ['camera'],
});

await context.addInitScript((dataUrl) => {
    const originalGetUserMedia = navigator.mediaDevices?.getUserMedia?.bind(navigator.mediaDevices);

    if (!originalGetUserMedia) {
        return;
    }

    navigator.mediaDevices.getUserMedia = async function mockGetUserMedia() {
        const image = new Image();
        image.src = dataUrl;

        await new Promise((resolve, reject) => {
            image.onload = resolve;
            image.onerror = reject;
        });

        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;

        const context2d = canvas.getContext('2d');

        const draw = () => {
            context2d.drawImage(image, 0, 0, canvas.width, canvas.height);
            window.requestAnimationFrame(draw);
        };

        draw();

        return canvas.captureStream(30);
    };
}, faceImageDataUrl);

const page = await context.newPage();

page.on('console', (message) => {
    const type = message.type();
    if (type === 'error' || type === 'warning') {
        console.log(`[browser ${type}]`, message.text());
    }
});

page.on('pageerror', (error) => {
    console.error('[browser pageerror]', error.message);
});

try {
    console.log('Navigating…');
    await page.goto(enrollUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    console.log('Page loaded.');

    const pollInterval = 10_000;
    const started = Date.now();

    while (Date.now() - started < timeoutMs) {
        const state = await page.evaluate(() => ({
            ready: window.FacePluginAuth?.ready === true,
            status: document.getElementById('face-status')?.textContent?.trim() ?? '',
            error: document.getElementById('face-error')?.textContent?.trim() ?? '',
            hasCv: Boolean(window.cv?.Mat),
        }));

        console.log(`[${Math.round((Date.now() - started) / 1000)}s]`, JSON.stringify(state));

        if (state.ready) {
            break;
        }

        if (state.error) {
            throw new Error(`Init failed: ${state.error}`);
        }

        await page.waitForTimeout(pollInterval);
    }

    if (!(await page.evaluate(() => window.FacePluginAuth?.ready === true))) {
        throw new Error(`Initialization did not finish within ${timeoutMs / 1000}s`);
    }

    console.log('SDK ready. Capturing face sample…');

    const sample = await page.evaluate(async () => {
        const result = await window.FacePluginAuth.captureFaceSample();

        return {
            descriptorLength: result.descriptor.length,
            livenessScore: result.livenessScore,
            faceCount: result.faceCount,
            descriptorPreview: result.descriptor.slice(0, 5),
        };
    });

    if (sample.descriptorLength !== 512) {
        throw new Error(`Expected 512-d descriptor, got ${sample.descriptorLength}`);
    }

    if (sample.faceCount !== 1) {
        throw new Error(`Expected exactly 1 face, got ${sample.faceCount}`);
    }

    if (sample.livenessScore < 0.5) {
        throw new Error(`Liveness score too low: ${sample.livenessScore}`);
    }

    console.log('PASS: Face capture succeeded');
    console.log(JSON.stringify(sample, null, 2));
    process.exitCode = 0;
} catch (error) {
    const status = await page.locator('#face-status').textContent().catch(() => null);
    const faceError = await page.locator('#face-error').textContent().catch(() => null);

    console.error('FAIL:', error.message);
    if (status) {
        console.error('Status:', status.trim());
    }
    if (faceError && faceError.trim()) {
        console.error('Error UI:', faceError.trim());
    }

    process.exitCode = 1;
} finally {
    await browser.close();
}
