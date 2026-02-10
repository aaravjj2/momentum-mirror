const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

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

async function performSwipe(page, rect, startOffsetX, startOffsetY, endOffsetX, endOffsetY, durationMs = 200) {
  const sx = Math.floor(rect.left + rect.width / 2 + startOffsetX);
  const sy = Math.floor(rect.top + rect.height / 2 + startOffsetY);
  const ex = Math.floor(rect.left + rect.width / 2 + endOffsetX);
  const ey = Math.floor(rect.top + rect.height / 2 + endOffsetY);

  await page.mouse.move(sx, sy);
  await page.mouse.down();
  await sleep(50);
  await page.mouse.move(ex, ey, { steps: 10 });
  await sleep(durationMs - 50);
  await page.mouse.up();
  console.log(`Swiped from (${sx},${sy}) to (${ex},${ey})`);
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
      '--window-size=1280,720',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
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
    console.warn('Navigation attempt failed, retrying with relaxed options:', e.message);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 });
    } catch (err) {
      console.error('Relaxed navigation also failed:', err.message);
    }
  }

  const canvasReady = await ensureCanvasReady(page, 45000);
  if (!canvasReady) {
    console.warn('Canvas not found within timeout; proceeding anyway');
  }

  await sleep(1500);

  // Start video recording
  const videoPath = path.join(outDir, 'gameplay-demo.webm');
  const client = await page.target().createCDPSession();
  await client.send('Page.startScreencast', {
    format: 'png',
    quality: 90,
    maxWidth: 1280,
    maxHeight: 720,
    everyNthFrame: 1,
  });

  const frames = [];
  client.on('Page.screencastFrame', async ({ data }) => {
    frames.push(data);
  });

  console.log('Started video recording...');

  // Get canvas rect once
  const rect = await page.evaluate(() => {
    const c = document.querySelector('canvas');
    if (!c) return null;
    const r = c.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  });

  // Menu screenshot
  await page.screenshot({ path: path.join(outDir, '01-menu.png') });
  console.log('Saved 01-menu.png');
  await sleep(800);

  // Click PLAY
  if (rect) {
    const cx = Math.floor(rect.left + rect.width / 2);
    const cy = Math.floor(rect.top + rect.height / 2 - 80);
    await page.mouse.click(cx, cy);
    console.log('Clicked PLAY');
  }
  await sleep(1500);

  // Level Select
  await page.screenshot({ path: path.join(outDir, '02-level-select.png') });
  console.log('Saved 02-level-select.png');
  await sleep(800);

  // Click first level (Tutorial)
  await page.mouse.click(420, 320);
  await sleep(1200);

  // LEVEL 1 GAMEPLAY - Initial state with trajectory preview
  await page.screenshot({ path: path.join(outDir, '03-level1-initial.png') });
  console.log('Saved 03-level1-initial.png');

  // Perform swipe and capture mid-flight
  await performSwipe(page, rect, 50, 0, -100, 0, 300);
  await sleep(200); // Capture during movement
  await page.screenshot({ path: path.join(outDir, '04-level1-ball-moving.png') });
  console.log('Saved 04-level1-ball-moving.png');

  await sleep(800); // Let it reach goal
  await page.screenshot({ path: path.join(outDir, '05-level1-goal-reached.png') });
  console.log('Saved 05-level1-goal-reached.png');

  await sleep(1200); // Wait for results screen
  await page.screenshot({ path: path.join(outDir, '06-results-screen.png') });
  console.log('Saved 06-results-screen.png');

  await sleep(1000);
  // Click Next Level or back to select
  await page.keyboard.press('Escape');
  await sleep(800);

  // Try Level 4 (Spring & Cushion surfaces)
  await page.mouse.click(520, 320); // Approximate Level 4 position
  await sleep(1200);
  await page.screenshot({ path: path.join(outDir, '07-level4-surfaces.png') });
  console.log('Saved 07-level4-surfaces.png');

  // Perform swipe showing surface interaction
  await performSwipe(page, rect, -80, 0, 120, 0, 400);
  await sleep(400);
  await page.screenshot({ path: path.join(outDir, '08-level4-collision.png') });
  console.log('Saved 08-level4-collision.png');

  await sleep(1200);
  await page.keyboard.press('Escape');
  await sleep(800);

  // Try a Rhythm level with phase walls (Level 12 area)
  await page.mouse.click(420, 470); // Approximate rhythm section
  await sleep(1200);
  await page.screenshot({ path: path.join(outDir, '09-phase-walls-on.png') });
  console.log('Saved 09-phase-walls-on.png');

  await sleep(1500); // Wait for phase toggle
  await page.screenshot({ path: path.join(outDir, '10-phase-walls-off.png') });
  console.log('Saved 10-phase-walls-off.png');

  // Perform swipe through phase walls
  await performSwipe(page, rect, -100, 0, 100, 0, 500);
  await sleep(600);
  await page.screenshot({ path: path.join(outDir, '11-phase-wall-passing.png') });
  console.log('Saved 11-phase-wall-passing.png');

  await sleep(1500);
  await page.keyboard.press('Escape');
  await sleep(800);

  // Try a Precision level
  await page.mouse.click(620, 470); // Approximate precision section
  await sleep(1200);
  await page.screenshot({ path: path.join(outDir, '12-precision-level.png') });
  console.log('Saved 12-precision-level.png');

  // Perform precise swipe
  await performSwipe(page, rect, -60, 0, 90, 0, 250);
  await sleep(500);
  await page.screenshot({ path: path.join(outDir, '13-precision-navigation.png') });
  console.log('Saved 13-precision-navigation.png');

  await sleep(2000); // Let level play out
  await page.keyboard.press('Escape');
  await sleep(800);

  // Check leaderboard
  await page.keyboard.press('Escape'); // Back to menu
  await sleep(1000);

  const menuRect = await page.evaluate(() => {
    const c = document.querySelector('canvas');
    if (!c) return null;
    const r = c.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  });

  if (menuRect) {
    // Click leaderboard button (approximate)
    const lbx = Math.floor(menuRect.left + menuRect.width / 2);
    const lby = Math.floor(menuRect.top + menuRect.height / 2 + 0);
    await page.mouse.click(lbx, lby);
    await sleep(1200);
    await page.screenshot({ path: path.join(outDir, '14-leaderboard.png') });
    console.log('Saved 14-leaderboard.png');
  }

  await sleep(2000);

  // Stop video recording
  await client.send('Page.stopScreencast');
  console.log('Stopped video recording');

  // Save frames as video using ffmpeg if available (fallback: save frames)
  if (frames.length > 0) {
    console.log(`Captured ${frames.length} video frames`);

    // Save individual frames to temp directory for ffmpeg processing
    const framesDir = path.join(outDir, 'frames');
    if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir, { recursive: true });

    let frameCount = 0;
    for (const frameData of frames) {
      const framePath = path.join(framesDir, `frame_${String(frameCount).padStart(5, '0')}.png`);
      fs.writeFileSync(framePath, Buffer.from(frameData, 'base64'));
      frameCount++;
      if (frameCount % 100 === 0) {
        console.log(`Saved ${frameCount} frames...`);
      }
    }

    console.log(`Saved ${frameCount} total frames to ${framesDir}`);
    console.log('To create video, run:');
    console.log(`  ffmpeg -framerate 30 -i "${framesDir}/frame_%05d.png" -c:v libvpx-vp9 -pix_fmt yuva420p "${videoPath}"`);
    console.log('Or for MP4:');
    console.log(`  ffmpeg -framerate 30 -i "${framesDir}/frame_%05d.png" -c:v libx264 -pix_fmt yuv420p -crf 23 "${path.join(outDir, 'gameplay-demo.mp4')}"`);
  }

  await browser.close();
  console.log('\nDone! Screenshots saved to:', outDir);
  console.log('Review the images before committing.');
})();