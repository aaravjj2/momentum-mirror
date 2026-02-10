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
      '--window-size=1280,720',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

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

  // 1. MENU
  console.log('Taking Menu screenshot...');
  await page.screenshot({ path: path.join(outDir, '01-menu.png') });

  // 2. CLICK PLAY
  // MenuScene.ts: Play button is at (cx, cy + 50)
  const cx = Math.floor(rect.left + rect.width / 2);
  const cy = Math.floor(rect.top + rect.height / 2 + 50);
  await smartClick(page, cx, cy, 'PLAY Button');

  // 3. LEVEL SELECT (Now all unlocked)
  console.log('Taking Level Select screenshot...');
  await page.screenshot({ path: path.join(outDir, '02-level-select.png') });

  // 4. GAMEPLAY (Level 1)
  await smartClick(page, 420, 320, 'Level 1');
  await sleep(3000); // Wait for transition
  console.log('Taking Level 1 initial screenshot...');
  await page.screenshot({ path: path.join(outDir, '03-level1-gameplay.png') });

  // Interact
  await performSwipe(page, rect, 50, 0, -100, 0, 300);
  await sleep(500);
  console.log('Taking Level 1 action screenshot...');
  await page.screenshot({ path: path.join(outDir, '04-level1-action.png') });

  await sleep(2000);
  await page.keyboard.press('Escape'); // Pause? Or Back? Assuming Escape goes back or pauses
  await sleep(1000);
  console.log('Pressing Escape to return...');

  // Return to Level Select (may need multiple Escapes or clicks depending on game logic)
  // Let's assume clicking specific coordinates for "Menu" button if visible, or Escape
  // Based on code, Escape might just pause. LevelSelectScene had a back button at (50, 40)

  // Let's try navigating back to Menu via URL reload for simplicity and robustness for Leaderboard/HowToPlay
  await page.goto(url, { waitUntil: 'networkidle0' });
  await sleep(3000);

  // 5. LEADERBOARD
  // MenuScene.ts: Leaderboard button is at (cx, cy + 130)
  const cyLb = Math.floor(rect.top + rect.height / 2 + 130);
  await smartClick(page, cx, cyLb, 'Leaderboard Button'); // cx is already defined above
  await sleep(3000);
  console.log('Taking Leaderboard screenshot...');
  await page.screenshot({ path: path.join(outDir, '05-leaderboard.png') });

  // Back to menu
  await page.goto(url, { waitUntil: 'networkidle0' });
  await sleep(3000);

  // 6. HOW TO PLAY
  // MenuScene.ts: How to Play button is at (cx, cy + 210)
  const cyHow = Math.floor(rect.top + rect.height / 2 + 210);
  await smartClick(page, cx, cyHow, 'How to Play Button');

  await sleep(2000);
  console.log('Taking How to Play screenshot...');
  await page.screenshot({ path: path.join(outDir, '06-how-to-play.png') });

  await browser.close();
})();