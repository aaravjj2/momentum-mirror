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
  await page.mouse.move(ex, ey, { steps: 30 }); // Slower swipe for visibility
  await sleep(durationMs);
  await page.mouse.up();
}

async function playLevel(page, levelNum, x, y, rect) {
  console.log(`--- Playing Level ${levelNum} ---`);
  await smartClick(page, x, y, `Level ${levelNum}`);
  await sleep(4000); // 4s to admire level

  // Simulate thinking/planning
  await sleep(2000);

  // ACTION: Swipe
  // Default swipe: Center-Right to Center-Left (Push Right)
  // Most levels (1, 2, 4, 6, 8) benefit from this or similar.
  // We'll vary it slightly to look "human".

  // Randomize slightly
  const variation = (Math.random() * 40) - 20;

  // Swipe Left (Push Right)
  // Start: (400, 540) -> End: (200, 540)
  // Offsets from center (960, 540):
  // StartX: -560. EndX: -760.

  // For level 3 (Bounce), maybe swipe UP?
  // Lvl 3 Start: (200, 200). Goal: (200, H-200). Downward.
  // To go DOWN, Swipe UP.

  let sx = -560;
  let sy = 0;
  let ex = -760;
  let ey = 0;

  if (levelNum === 3) {
    // Swipe UP to go DOWN
    // Center (960, 540). 
    // Start near bottom, swipe up. 
    sx = -600; // Left side
    sy = 200;  // Below center
    ex = -600;
    ey = -200; // Above center
  } else if (levelNum === 5) {
    // Curved path. Start (200, H-200). Goal (W-200, 200).
    // Needs diagonal Up-Right.
    // Swipe Down-Left.
    sx = -600;
    sy = -200;
    ex = -700;
    ey = 0;
  }

  await performSwipe(page, rect, sx + variation, sy, ex + variation, ey, 500);

  // Watch physics
  await sleep(6000);

  // Return to Level Select
  console.log('Returning to Level Select');
  await page.keyboard.press('Escape');
  await sleep(3000);
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

  // Navigate
  const url = 'http://127.0.0.1:3001';
  console.log('Navigating and waiting for load...');
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

  // START VIDEO RECORDING
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

  // --- RECORDING SEQUENCE (Target > 180s) ---

  // 1. MENU (5s)
  await sleep(5000);

  // 2. CLICK PLAY
  await smartClick(page, 960, 590, 'PLAY Button');
  await sleep(4000); // 4s transition

  // 3. LEVEL LOOP
  // Levels 1-5 (Row 1, Y=220)
  // X coords: 280, 620, 960, 1300, 1640
  const row1Y = 220;
  const row1X = [280, 620, 960, 1300, 1640];

  // Levels 6-10 (Row 2, Y=420)
  // X coords: same
  const row2Y = 420;

  // Play Levels 1-8
  const levels = [
    { id: 1, x: row1X[0], y: row1Y },
    { id: 2, x: row1X[1], y: row1Y },
    { id: 3, x: row1X[2], y: row1Y },
    { id: 4, x: row1X[3], y: row1Y },
    { id: 5, x: row1X[4], y: row1Y },
    { id: 6, x: row1X[0], y: row2Y },
    { id: 7, x: row1X[1], y: row2Y },
    { id: 8, x: row1X[2], y: row2Y },
  ];

  for (const level of levels) {
    await playLevel(page, level.id, level.x, level.y, rect);
    // Each level takes ~15-20s. 8 levels * 17s = ~136s.
    // + 9s setup = 145s.
  }

  // Scroll Level Select to show more levels?
  console.log('Scrolling Level Select...');
  await page.mouse.move(960, 800);
  await page.mouse.wheel({ deltaY: 500 });
  await sleep(3000);
  await page.mouse.wheel({ deltaY: 500 });
  await sleep(3000);

  // Back to Menu
  await page.goto(url, { waitUntil: 'networkidle0' });
  await sleep(4000);

  // 4. LEADERBOARD (10s)
  await smartClick(page, 960, 670, 'Leaderboard Button');
  await sleep(10000); // Read time

  // Back to Menu
  await page.goto(url, { waitUntil: 'networkidle0' });
  await sleep(3000);

  // 5. HOW TO PLAY (10s)
  await smartClick(page, 960, 750, 'How to Play Button');
  await sleep(10000); // Read time

  // Total est: 145 + 6 + 4 + 10 + 3 + 10 = ~178s.
  // Add padding
  await sleep(5000);

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