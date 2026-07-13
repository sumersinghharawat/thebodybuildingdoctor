/**
 * Diagnostic browser test for Faceplugin init.
 */

import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';

const enrollUrl = process.argv[2];
const faceImageBase64 = readFileSync('/tmp/face-test-lena.jpg').toString('base64');

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ ignoreHTTPSErrors: true, permissions: ['camera'] });

await context.addInitScript((dataUrl) => {
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
        const ctx = canvas.getContext('2d');
        const draw = () => {
            ctx.drawImage(image, 0, 0, 640, 480);
            requestAnimationFrame(draw);
        };
        draw();
        return canvas.captureStream(30);
    };
}, `data:image/jpeg;base64,${faceImageBase64}`);

const page = await context.newPage();
const logs = [];

page.on('console', (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
page.on('pageerror', (err) => logs.push(`[pageerror] ${err.message}`));
page.on('requestfailed', (req) => logs.push(`[requestfailed] ${req.url()} ${req.failure()?.errorText}`));

await page.goto(enrollUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });

for (let i = 0; i < 36; i += 1) {
    const state = await page.evaluate(() => ({
        ready: window.FacePluginAuth?.ready ?? false,
        status: document.getElementById('face-status')?.textContent?.trim() ?? '',
        error: document.getElementById('face-error')?.textContent?.trim() ?? '',
        hasCv: Boolean(window.cv?.Mat),
        videoReady: document.getElementById('face-video')?.readyState ?? -1,
        buttonDisabled: document.getElementById('face-enroll-btn')?.disabled ?? true,
    }));

    console.log(`[${i * 5}s]`, JSON.stringify(state));

    if (state.ready || state.error) {
        break;
    }

    await page.waitForTimeout(5000);
}

console.log('--- console ---');
logs.slice(-30).forEach((line) => console.log(line));

await page.screenshot({ path: '/tmp/face-enroll-debug.png', fullPage: true });
console.log('Screenshot: /tmp/face-enroll-debug.png');

await browser.close();
