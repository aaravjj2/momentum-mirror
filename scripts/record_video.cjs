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
  // MenuScene.ts: Play button is at (cx, cy + 50)
  const cx = Math.floor(rect.left + rect.width / 2);
  const cy = Math.floor(rect.top + rect.height / 2 + 50);
  await smartClick(page, cx, cy, 'PLAY Button');

  // 3. LEVEL SELECT (Wait 2s)
  await sleep(2000);

  // 4. GAMEPLAY (Level 1)
  await smartClick(page, 420, 320, 'Level 1');
  await sleep(3000); // Wait for transition

  // Interact: Swipe 1
  await performSwipe(page, rect, 50, 0, -100, 0, 300);
  await sleep(4000); // Watch result

  // Return to Level Select (Assume Escape)
  await page.keyboard.press('Escape');
  await sleep(2000);

  // 5. Select Level 4 (Springs)
  // Assuming Level 4 is at (520, 320) per previous script
  await smartClick(page, 520, 320, 'Level 4');
  await sleep(3000);

  // Interact: Swipe 2
  await performSwipe(page, rect, -80, 0, 120, 0, 400);
  await sleep(4000);

  // Return
  await page.keyboard.press('Escape');
  await sleep(2000);

  // Go back to Menu
  await page.keyboard.press('Escape'); // Again to menu? Or use direct Nav?
  // Let's use robust navigation for video cleanliness
  await page.goto(url, { waitUntil: 'networkidle0' });
  await sleep(3000);

  // 6. LEADERBOARD
  // MenuScene.ts: Leaderboard button is at (cx, cy + 130)
  const cyLb = Math.floor(rect.top + rect.height / 2 + 130);
  await smartClick(page, cx, cyLb, 'Leaderboard Button');
  await sleep(4000);

  // Back to Menu
  await page.goto(url, { waitUntil: 'networkidle0' });
  await sleep(3000);

  // 7. HOW TO PLAY
  // MenuScene.ts: How to Play button is at (cx, cy + 210)
  const cyHow = Math.floor(rect.top + rect.height / 2 + 210);
  await smartClick(page, cx, cyHow, 'How to Play Button');
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
    // Using simple exec for now, could use fluent-ffmpeg if installed
    const { execSync } = require('child_process');
    try {
      execSync(`ffmpeg -y -framerate 30 -i "${framesDir}/frame_%05d.png" -c:v libx264 -pix_fmt yuv420p "${ffmpegPath}"`, { stdio: 'inherit' });
      console.log(`Video saved to ${ffmpegPath}`);

      // Cleanup frames
      // fs.rmSync(framesDir, { recursive: true, force: true });
    } catch (e) {
      console.error('FFmpeg conversion failed:', e.message);
    }
  }
})();