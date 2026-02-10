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
  // GameScene back button is at approx (1700, 40)
  await smartClick(page, 1700, 40, 'Back to Levels');
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
  // Inject localStorage to unlock levels 1-5 and set some dummy progress
  await page.evaluateOnNewDocument(() => {
    localStorage.clear();
    localStorage.setItem('mm_unlocked_levels', JSON.stringify([1, 2, 3, 4, 5]));
    const bestScores = {};
    for (let i = 1; i <= 5; i++) {
      bestScores[i] = {
        compositeScore: 950,
        efficiencyScore: 100,
        conservationScore: 100,
        rhythmScore: 100,
        timestamp: Date.now(),
        skillRating: 'S'
      };
    }
    localStorage.setItem('mm_best_scores', JSON.stringify(bestScores));
  });

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

  // --- RECORDING SEQUENCE ---

  // 1. MENU (3s)
  await sleep(3000);

  // 2. CLICK PLAY
  await smartClick(page, 960, 590, 'PLAY Button');
  await sleep(4000); // 4s transition

  // 3. LEVEL LOOP
  // Play Levels 1 & 2 ONLY
  const row1Y = 220;
  const row1X = [280, 620, 960, 1300, 1640];

  const levels = [
    { id: 1, x: row1X[0], y: row1Y },
    { id: 2, x: row1X[1], y: row1Y },
  ];

  for (const level of levels) {
    await playLevel(page, level.id, level.x, level.y, rect);
  }

  // Scroll Level Select to show all levels (including Master at bottom)
  console.log('Scrolling Level Select to show Master levels...');
  // Move mouse to center
  await page.mouse.move(960, 800);
  // Scroll down a lot to reach bottom (Level 40)
  // Total heigh estim: ~4000px?
  for (let i = 0; i < 5; i++) {
    await page.mouse.wheel({ deltaY: 800 });
    await sleep(1000);
  }
  await sleep(2000); // Pause at bottom

  // Scroll back up slightly?
  // await page.mouse.wheel({ deltaY: -1000 });
  // await sleep(1000);

  // Back to Menu
  console.log('Returning to Main Menu...');
  await smartClick(page, 80, 80, 'Back to Menu'); // Assuming generic back button or just reload?
  // Actually the level select scene might not have a "Back to Menu" button easily accessible or logic is different.
  // The script previously just went to URL.
  await page.goto(url, { waitUntil: 'networkidle0' });
  await sleep(3000);

  // 4. LEADERBOARD (5s)
  await smartClick(page, 960, 670, 'Leaderboard Button');
  await sleep(5000);

  // Back to Menu
  await page.goto(url, { waitUntil: 'networkidle0' });
  await sleep(3000);

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
      // file operations...
      const framePath = path.join(framesDir, `frame_${String(i).padStart(5, '0')}.png`);
      fs.writeFileSync(framePath, Buffer.from(frames[i], 'base64'));
    }

    // Convert
    console.log('Converting to MP4 with 1.5x speedup...');
    const ffmpegPath = path.join(outDir, 'gameplay-demo.mp4');
    const { execSync } = require('child_process');
    try {
      // vf "setpts=PTS/1.5" speeds up video (drops frames / adjusts timestamps)
      // To keep audio synced (if there was audio) we'd need atempo. Here just video.
      execSync(`ffmpeg -y -framerate 30 -i "${framesDir}/frame_%05d.png" -vf "setpts=PTS/1.5" -c:v libx264 -pix_fmt yuv420p "${ffmpegPath}"`, { stdio: 'inherit' });
      console.log(`Video saved to ${ffmpegPath}`);
    } catch (e) {
      console.error('FFmpeg conversion failed:', e.message);
    }
  }
})();