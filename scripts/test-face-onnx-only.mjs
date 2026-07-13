import { chromium } from 'playwright';

const url = 'https://thebodybuildingdoctor.test/face-test/index.html';
const timeoutMs = Number(process.env.FACE_TEST_TIMEOUT_MS ?? 300_000);

const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext({ ignoreHTTPSErrors: true })).newPage();

page.on('console', (m) => console.log(`[browser] ${m.text()}`));
page.on('pageerror', (e) => console.error(`[pageerror] ${e.message}`));

console.log('Opening', url);
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.click('#step1');

const started = Date.now();
while (Date.now() - started < timeoutMs) {
    const text = await page.locator('#log').innerText();
    const status = await page.locator('#status').innerText();
    console.log(`[${Math.round((Date.now() - started) / 1000)}s] ${status}`);
    if (text.includes('PASS: ONNX')) {
        console.log('PASS: standalone ONNX works');
        await browser.close();
        process.exit(0);
    }
    if (text.includes('FAIL:')) {
        console.error(text);
        await browser.close();
        process.exit(1);
    }
    await page.waitForTimeout(5000);
}

console.error('Timed out');
await browser.close();
process.exit(1);
