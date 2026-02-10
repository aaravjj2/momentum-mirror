const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

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
  await sleep(2000); // Wait for reaction
  console.log(`Clicked "${description}"`);
}

async function performSwipe(page, rect, startOffsetX, startOffsetY, endOffsetX, endOffsetY, durationMs = 200) {
  const sx = Math.floor(rect.left + rect.width / 2 + startOffsetX);
  const sy = Math.floor(rect.top + rect.height / 2 + startOffsetY);
  const ex = Math.floor(rect.left + rect.width / 2 + endOffsetX);
  const ey = Math.floor(rect.top + rect.height / 2 + endOffsetY);

  console.log(`Swiping from (${sx},${sy}) to (${ex},${ey})`);
  await page.mouse.move(sx, sy);
  await page.mouse.down();
  await sleep(100);
  await page.mouse.move(ex, ey, { steps: 20 });
  await sleep(durationMs);
  await page.mouse.up();
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
  await page.setViewport({ width: 1920, height: 1080 }); // 1080p for video

  // Navigate
  const url = 'http://127.0.0.1:3001';
  console.log('Navigating and waiting for load...');
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

  // Wait ample time for Phaser to boot
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
  console.log('Canvas found:', rect);

  // START VIDEO RECORDING
  const videoPath = path.join(outDir, 'gameplay-demo.webm');
  const client = await page.target().createCDPSession();
  await client.send('Page.startScreencast', {
    format: 'png',
    quality: 100,
    maxWidth: 1920,
    maxHeight: 1080,
    everyNthFrame: 1,
  });

  const frames = [];
  client.on('Page.screencastFrame', async ({ data, sessionId }) => {
    frames.push(data);
    try {
      await client.send('Page.screencastFrameAck', { sessionId });
    } catch (e) { }
  });
  console.log('Started video recording...');

  // --- RECORDING SEQUENCE ---

  // 1. MENU (Wait 2s)
  await sleep(2000);

  // 2. CLICK PLAY
  // MenuScene.ts: Play button at (960, 590)
  await smartClick(page, 960, 590, 'PLAY Button');

  // 3. LEVEL SELECT (Wait 2s)
  await sleep(2000);

  // 4. GAMEPLAY (Level 1)
  // Level 1: (280, 220)
  await smartClick(page, 280, 220, 'Level 1');
  await sleep(3000); // Wait for transition

  // Interact: Swipe Left (Push ball right)
  // Center (960, 540). Swipe from (400, 540) to (200, 540).
  // Offsets: -560 to -760
  await performSwipe(page, rect, -560, 0, -760, 0, 300);
  await sleep(4000); // Watch result

  // Return to Level Select (Assume Escape)
  await page.keyboard.press('Escape');
  await sleep(2000);

  // 5. Select Level 4 (Springs)
  // Level 4: (1300, 220)
  await smartClick(page, 1300, 220, 'Level 4');
  await sleep(3000);

  // Interact: Swipe Right (Push ball left)
  // Level 4 start (200, 540). Need swap LEFT to go RIGHT.
  // Wait, description: "Green springs amplify... Hit goal across gap".
  // Player start (200, 540). Goal (1720, 540).
  // Yes, swipe LEFT to apply force RIGHT.
  // Same swipe as Level 1 roughly.
  await performSwipe(page, rect, -560, 0, -760, 0, 400);
  await sleep(4000);

  // Return
  await page.keyboard.press('Escape');
  await sleep(2000);

  // Go back to Menu
  await page.goto(url, { waitUntil: 'networkidle0' });
  await sleep(3000);

  // 6. LEADERBOARD
  // MenuScene.ts: Leaderboard button at (960, 670)
  await smartClick(page, 960, 670, 'Leaderboard Button');
  await sleep(4000);

  // Back to Menu
  await page.goto(url, { waitUntil: 'networkidle0' });
  await sleep(3000);

  // 7. HOW TO PLAY
  // MenuScene.ts: How to Play button at (960, 750)
  await smartClick(page, 960, 750, 'How to Play Button');
  await sleep(5000); // Read time

  // STOP RECORDING
  console.log('Stopping video recording...');
  await client.send('Page.stopScreencast');

  await browser.close();

  // COMPILE VIDEO
  if (frames.length > 0) {
    console.log(`Captured ${frames.length} frames.`);
    const framesDir = path.join(outDir, 'video_frames');
    if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir, { recursive: true });

    // Save frames
    console.log('Saving frames to disk...');
    for (let i = 0; i < frames.length; i++) {
      const framePath = path.join(framesDir, `frame_${String(i).padStart(5, '0')}.png`);
      fs.writeFileSync(framePath, Buffer.from(frames[i], 'base64'));
    }

    // Convert
    console.log('Converting to MP4...');
    const ffmpegPath = path.join(outDir, 'gameplay-demo.mp4');
    const { execSync } = require('child_process');
    try {
      execSync(`ffmpeg -y -framerate 30 -i "${framesDir}/frame_%05d.png" -c:v libx264 -pix_fmt yuv420p "${ffmpegPath}"`, { stdio: 'inherit' });
      console.log(`Video saved to ${ffmpegPath}`);
    } catch (e) {
      console.error('FFmpeg conversion failed:', e.message);
    }
  }
})();