const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function ensureCanvasReady(page, timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const hasCanvas = await page.evaluate(() => !!document.querySelector('canvas'));
    if (hasCanvas) return true;
    await sleep(500);
  }
  return false;
}

async function performSwipe(page, rect, startOffsetX, startOffsetY, endOffsetX, endOffsetY, durationMs = 300) {
  const sx = Math.floor(rect.left + rect.width / 2 + startOffsetX);
  const sy = Math.floor(rect.top + rect.height / 2 + startOffsetY);
  const ex = Math.floor(rect.left + rect.width / 2 + endOffsetX);
  const ey = Math.floor(rect.top + rect.height / 2 + endOffsetY);

  await page.mouse.move(sx, sy);
  await page.mouse.down();
  await sleep(50);
  const steps = Math.floor(durationMs / 20);
  await page.mouse.move(ex, ey, { steps: steps });
  await sleep(Math.max(50, durationMs - 50));
  await page.mouse.up();
  console.log(`Swiped from (${sx},${sy}) to (${ex},${ey})`);
}

(async () => {
  const outDir = path.resolve(__dirname, '..', 'screenshots');
  const framesDir = path.join(outDir, 'video_frames');
  if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--window-size=1920,1080',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
  );
  page.setDefaultNavigationTimeout(0);
  page.setDefaultTimeout(0);

  const url = 'http://127.0.0.1:3001';
  console.log('Navigating to', url);
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 120000 });
  } catch (e) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 });
    } catch (err) {
      console.error('Failed to load page');
    }
  }

  await ensureCanvasReady(page, 45000);
  await sleep(2000);

  console.log('\\n🎬 Starting 3-minute gameplay recording...');
  console.log('Capturing at 20 FPS (1 frame every 50ms)\\n');

  const startTime = Date.now();
  const targetDuration = 180000; // 3 minutes
  const frameInterval = 50; // 50ms = 20 FPS
  let frameCount = 0;

  // Start frame capture loop
  const captureFrames = async () => {
    while (Date.now() - startTime < targetDuration) {
      const screenshot = await page.screenshot({ encoding: 'binary' });
      const framePath = path.join(framesDir, `frame_${String(frameCount).padStart(6, '0')}.png`);
      fs.writeFileSync(framePath, screenshot);
      frameCount++;

      if (frameCount % 100 === 0) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`Captured ${frameCount} frames (${elapsed}s elapsed)`);
      }

      await sleep(frameInterval);
    }
  };

  // Start gameplay sequence (runs in parallel with frame capture)
  const playGameplay = async () => {
    const rect = await page.evaluate(() => {
      const c = document.querySelector('canvas');
      if (!c) return null;
      const r = c.getBoundingClientRect();
      return { left: r.left, top: r.top, width: r.width, height: r.height };
    });

    if (!rect) {
      console.error('Cannot find canvas');
      return;
    }

    // Menu (hold for 3 seconds)
    await sleep(3000);

    // Click PLAY
    const cx = Math.floor(rect.left + rect.width / 2);
    const playY = Math.floor(rect.top + rect.height / 2 - 80);
    await page.mouse.click(cx, playY);
    console.log('▶️  Clicked PLAY');
    await sleep(2000);

    // Level Select (hold for 2 seconds)
    await sleep(2000);

    // === LEVEL 1: Tutorial ===
    console.log('\\n🎮 Playing Level 1 (Tutorial)');
    await page.mouse.click(420, 380);
    await sleep(1500);
    await performSwipe(page, rect, 100, 0, -150, 0, 400);
    await sleep(3000); // Let level complete
    await sleep(2000); // Results screen
    await page.mouse.click(cx, rect.top + rect.height - 100); // Next/Menu
    await sleep(1500);

    // === LEVEL 2: Power Control ===
    console.log('🎮 Playing Level 2 (Power Control)');
    await page.mouse.click(520, 380);
    await sleep(1500);
    await performSwipe(page, rect, 80, 0, -160, 0, 500);
    await sleep(3500);
    await sleep(2000);
    await page.keyboard.press('Escape');
    await sleep(1200);

    // === LEVEL 3: Bounce ===
    console.log('🎮 Playing Level 3 (Bounce)');
    await page.mouse.click(620, 380);
    await sleep(1500);
    await performSwipe(page, rect, 0, 80, 0, -140, 400);
    await sleep(4000);
    await page.keyboard.press('Escape');
    await sleep(1500);

    // === LEVEL 4: Spring & Cushion ===
    console.log('🎮 Playing Level 4 (Spring & Cushion)');
    await page.mouse.click(720, 380);
    await sleep(1500);
    await performSwipe(page, rect, -100, 0, 140, 0, 450);
    await sleep(2000);
    await performSwipe(page, rect, 60, -40, -80, 40, 350);
    await sleep(4000);
    await page.keyboard.press('Escape');
    await sleep(1500);

    // === LEVEL 5: Curved Path ===
    console.log('🎮 Playing Level 5 (Curved Path)');
    await page.mouse.click(820, 380);
    await sleep(1500);
    await performSwipe(page, rect, 0, 100, 0, -160, 500);
    await sleep(5000);
    await page.keyboard.press('Escape');
    await sleep(1500);

    // Scroll down to see more levels
    console.log('📜 Scrolling to see more levels');
    await page.mouse.wheel({ deltaY: 300 });
    await sleep(2000);

    // === LEVEL 12: Phase Walls (Rhythm) ===
    console.log('🎮 Playing Level 12 (Phase Walls)');
    await page.mouse.click(520, 450);
    await sleep(2000);
    // Wait for phase wall timing
    await sleep(1500);
    await performSwipe(page, rect, -120, 0, 140, 0, 600);
    await sleep(2000);
    await performSwipe(page, rect, 80, 0, -100, 0, 400);
    await sleep(4000);
    await page.keyboard.press('Escape');
    await sleep(1500);

    // === LEVEL 16: Precision ===
    console.log('🎮 Playing Level 16 (Precision)');
    await page.mouse.click(420, 550);
    await sleep(1500);
    await performSwipe(page, rect, 90, 0, -140, 0, 450);
    await sleep(5000);
    await page.keyboard.press('Escape');
    await sleep(1500);

    // Back to main menu
    console.log('🏠 Returning to menu');
    await page.keyboard.press('Escape');
    await sleep(1500);

    // Show leaderboard
    console.log('🏆 Opening Leaderboard');
    const lbY = Math.floor(rect.top + rect.height / 2 + 0);
    await page.mouse.click(cx, lbY);
    await sleep(3000);

    // Back to menu
    await page.keyboard.press('Escape');
    await sleep(2000);

    // Show How to Play
    console.log('❓ Opening How to Play');
    const htpY = Math.floor(rect.top + rect.height / 2 + 80);
    await page.mouse.click(cx, htpY);
    await sleep(3000);

    // Close
    await page.keyboard.press('Escape');
    await sleep(2000);

    console.log('✅ Gameplay sequence complete');
  };

  // Run both in parallel
  await Promise.all([
    captureFrames(),
    playGameplay(),
  ]);

  const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\\n✅ Recording complete! Captured ${frameCount} frames in ${elapsedSec}s`);

  await browser.close();

  // Check for ffmpeg
  console.log('\\n🎬 Creating video from frames...');
  try {
    execSync('which ffmpeg', { stdio: 'ignore' });
  } catch (e) {
    console.log('⚠️  ffmpeg not found. Install it to create video:');
    console.log('   Ubuntu/Debian: sudo apt install ffmpeg');
    console.log('   Mac: brew install ffmpeg');
    console.log('\\nTo create video manually, run:');
    console.log(`   ffmpeg -framerate 20 -i "${framesDir}/frame_%06d.png" -c:v libx264 -pix_fmt yuv420p -crf 23 -preset medium "${path.join(outDir, 'gameplay-demo.mp4')}"`);
    console.log('\\nFrames saved to:', framesDir);
    return;
  }

  // Create MP4 video
  const videoPath = path.join(outDir, 'gameplay-demo.mp4');
  console.log('Creating MP4 video...');
  try {
    execSync(
      `ffmpeg -y -framerate 20 -i "${framesDir}/frame_%06d.png" -c:v libx264 -pix_fmt yuv420p -crf 23 -preset medium "${videoPath}"`,
      { stdio: 'inherit' }
    );
    console.log(`\\n✅ Video created: ${videoPath}`);

    const stats = fs.statSync(videoPath);
    console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Duration: ~${(frameCount / 20).toFixed(1)}s at 20 FPS`);
  } catch (err) {
    console.error('Error creating video:', err.message);
  }

  console.log('\\n📁 Files saved to:');
  console.log(`   Screenshots: ${outDir}`);
  console.log(`   Video frames: ${framesDir}`);
  console.log(`   Video: ${videoPath}`);
  console.log('\\n⚠️  Remember: Do NOT commit until you review!');
})();