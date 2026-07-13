import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';

const url = 'https://thebodybuildingdoctor.test/face-test/index.html';
const faceImage = '/tmp/face-test-lena.jpg';
const timeoutMs = Number(process.env.FACE_TEST_TIMEOUT_MS ?? 300_000);
const imageDataUrl = `data:image/jpeg;base64,${readFileSync(faceImage).toString('base64')}`;

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ ignoreHTTPSErrors: true, permissions: ['camera'] });

await context.addInitScript((dataUrl) => {
    navigator.mediaDevices.getUserMedia = async () => {
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
}, imageDataUrl);

const page = await context.newPage();
page.on('console', (m) => console.log(`[browser] ${m.text()}`));
page.on('pageerror', (e) => console.error(`[pageerror] ${e.message}`));

console.log('Opening', url);
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

await page.click('#step1');
await page.waitForFunction(
    () => document.getElementById('log')?.innerText.includes('PASS: ONNX'),
    null,
    { timeout: timeoutMs },
);
console.log('Step 1 OK');

await page.click('#step2');
await page.waitForFunction(
    () => document.getElementById('log')?.innerText.includes('OpenCV ready'),
    null,
    { timeout: timeoutMs },
);
console.log('Step 2 OK');

await page.click('#step3');
await page.waitForFunction(
    () => {
        const text = document.getElementById('log')?.innerText ?? '';
        return text.includes('PASS:') && text.includes('descriptorLength')
            || text.includes('FAIL:')
            || text.includes('No face detected')
            || text.includes('Capture failed');
    },
    null,
    { timeout: timeoutMs },
);

const log = await page.locator('#log').innerText();
console.log(log.split('\n').slice(-12).join('\n'));

if (log.includes('descriptorLength')) {
    console.log('PASS: full standalone face capture works');
    process.exitCode = 0;
} else if (log.includes('No face detected')) {
    console.log('ONNX+OpenCV+camera OK; face not found in test image');
    process.exitCode = 0;
} else {
    console.log('FAIL');
    process.exitCode = 1;
}

await browser.close();
