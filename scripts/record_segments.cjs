const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
}

async function smartClick(page, x, y, description) {
    console.log(`Attempting to click "${description}" at (${x}, ${y})...`);
    await page.mouse.move(x, y);
    await sleep(200);
    await page.mouse.down();
    await sleep(150);
    await page.mouse.up();
    await sleep(2000);
    console.log(`Clicked "${description}"`);
}

async function performSwipe(page, rect, startOffsetX, startOffsetY, endOffsetX, endOffsetY, durationMs = 300) {
    const sx = Math.floor(rect.left + rect.width / 2 + startOffsetX);
    const sy = Math.floor(rect.top + rect.height / 2 + startOffsetY);
    const ex = Math.floor(rect.left + rect.width / 2 + endOffsetX);
    const ey = Math.floor(rect.top + rect.height / 2 + endOffsetY);

    console.log(`Swiping from (${sx},${sy}) to (${ex},${ey})`);
    await page.mouse.move(sx, sy);
    await page.mouse.down();
    await sleep(100);
    await page.mouse.move(ex, ey, { steps: 25 });
    await sleep(durationMs);
    await page.mouse.up();
}

async function saveVideo(frames, outputPath) {
    if (frames.length === 0) return;
    console.log(`Saving ${frames.length} frames to ${outputPath}...`);

    const tempDir = path.join(path.dirname(outputPath), 'temp_frames_' + Date.now());
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    for (let i = 0; i < frames.length; i++) {
        fs.writeFileSync(path.join(tempDir, `frame_${String(i).padStart(5, '0')}.png`), Buffer.from(frames[i], 'base64'));
    }

    try {
        execSync(`ffmpeg -y -framerate 30 -i "${tempDir}/frame_%05d.png" -c:v libx264 -pix_fmt yuv420p "${outputPath}"`, { stdio: 'ignore' });
        console.log(`Saved: ${outputPath}`);
    } catch (e) {
        console.error(`Failed to save ${outputPath}:`, e.message);
    }

    // Cleanup
    fs.rmSync(tempDir, { recursive: true, force: true });
}

(async () => {
    const outDir = path.resolve(__dirname, '..', 'screenshots');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--use-gl=egl',
            '--ignore-gpu-blocklist',
            '--enable-webgl',
            '--window-size=1920,1080',
        ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    const client = await page.target().createCDPSession();

    // Navigate
    const url = 'http://127.0.0.1:3001'; // Try 3001 as previously used
    console.log('Navigating...');
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
    await sleep(5000);

    // Get canvas
    const rect = await page.evaluate(() => {
        const c = document.querySelector('canvas');
        if (!c) return null;
        const r = c.getBoundingClientRect();
        return { left: r.left, top: r.top, width: r.width, height: r.height };
    });

    if (!rect) {
        console.error('Canvas not found!');
        await browser.close();
        return;
    }

    // Go to Level Select
    await smartClick(page, 960, 590, 'PLAY Button');
    await sleep(3000);

    // Levels to record
    // Level 1: (280, 220)
    // Level 2: (620, 220)
    // Level 3: (960, 220)

    const levels = [
        { id: 1, x: 280, y: 220, duration: 60000 }, // 1 min per level approx to get total > 3min
        { id: 2, x: 620, y: 220, duration: 60000 },
        { id: 3, x: 960, y: 220, duration: 60000 }
    ];

    for (const level of levels) {
        console.log(`--- Recording Level ${level.id} ---`);
        const frames = [];

        // Start Screencast
        await client.send('Page.startScreencast', {
            format: 'png',
            quality: 100,
            maxWidth: 1920,
            maxHeight: 1080,
            everyNthFrame: 1,
        });

        // Listener
        const listener = async ({ data, sessionId }) => {
            frames.push(data);
            try { await client.send('Page.screencastFrameAck', { sessionId }); } catch (e) { }
        };
        client.on('Page.screencastFrame', listener);

        // Play Level
        await smartClick(page, level.x, level.y, `Level ${level.id}`);
        await sleep(4000);

        // Action loop for duration
        const startTime = Date.now();
        while (Date.now() - startTime < level.duration - 8000) { // Leave time for exit
            // Random swipe
            const dir = Math.random() > 0.5 ? 1 : -1;
            await performSwipe(page, rect, -200 * dir, 0, -400 * dir, 0);
            await sleep(4000);
        }

        // Return to Level Select
        // Uses Fixed Back Button coordinates
        await smartClick(page, 1700, 40, 'Back to Levels');
        await sleep(3000);

        // Stop Record
        client.off('Page.screencastFrame', listener);
        await client.send('Page.stopScreencast');

        // Save Segment
        await saveVideo(frames, path.join(outDir, `level${level.id}.mp4`));

        // Clear frames
        frames.length = 0;
        await sleep(2000);
    }

    await browser.close();

    // Concatenate
    console.log('Concatenating videos...');
    const listPath = path.join(outDir, 'filelist.txt');
    let listContent = '';
    for (const level of levels) {
        listContent += `file 'level${level.id}.mp4'\n`;
    }
    fs.writeFileSync(listPath, listContent);

    try {
        execSync(`ffmpeg -f concat -safe 0 -i "${listPath}" -c copy "${path.join(outDir, 'gameplay-demo.mp4')}"`, { stdio: 'inherit' });
        console.log('Final video created!');
    } catch (e) {
        console.error('Concat failed:', e.message);
    }

    // Cleanup segements if successful? User might want them. Keeping them for now.
})();
