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

async function captureLevel(page, levelNum, x, y, outDir, captureAction = false, rect) {
  // Click Level
  await smartClick(page, x, y, `Level ${levelNum}`);
  await sleep(3000); // Wait for transition

  // Screenshot Initial
  console.log(`Taking Level ${levelNum} initial screenshot...`);
  await page.screenshot({ path: path.join(outDir, `0${2 + levelNum}-level${levelNum}.png`) });

  if (captureAction && rect) {
    // Specific Swipe for Level 1 (Right push)
    // From (400, 540) to (200, 540) relative to center?
    // Wait, swiping LEFT creates a rightward impulse if dragging the "puck" or sling?
    // Description: "Swipe in the opposite direction".
    // To go Right, Swipe Left.
    await performSwipe(page, rect, -560, 0, -760, 0, 300);
    await sleep(500);
    console.log(`Taking Level ${levelNum} action screenshot...`);
    await page.screenshot({ path: path.join(outDir, `0${2 + levelNum}-level${levelNum}-action.png`) });
  }

  // Return to Level Select
  await page.keyboard.press('Escape');
  await sleep(2000);
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
  // MenuScene.ts: Play button at (960, 590)
  await smartClick(page, 960, 590, 'PLAY Button');

  // 3. LEVEL SELECT
  console.log('Taking Level Select screenshot...');
  // Note: Filename 02 is Level Select. Level 1 starts at 03.
  await page.screenshot({ path: path.join(outDir, '02-level-select.png') });

  // 4. LEVEL CAPTURES
  // Note: Level 1 and 5 are preserved/skipped as per user request.
  // Level 1 was likely correct. Level 5 is a "completion report" to be kept.

  // Back button coordinates in GameScene: (1920 - 250) + offset approx (1700, 40)
  const backBtnX = 1700;
  const backBtnY = 40;

  async function captureSpecificLevel(lvlNum, x, y) {
    await smartClick(page, x, y, `Level ${lvlNum}`);
    await sleep(3000);
    console.log(`Taking Level ${lvlNum} screenshot...`);
    await page.screenshot({ path: path.join(outDir, `0${2 + lvlNum}-level${lvlNum}.png`) });

    // Return to Level Select via UI Button
    await smartClick(page, backBtnX, backBtnY, 'Back to Levels');
    await sleep(3000);
  }

  // Level 2
  await captureSpecificLevel(2, 620, 220);

  // Level 3
  await captureSpecificLevel(3, 960, 220);

  // Level 4
  await captureSpecificLevel(4, 1300, 220);

  // Return to Menu from Level Select
  // Back button on Level Select is at top left (50, 40)
  await smartClick(page, 80, 50, 'Back to Menu');
  await sleep(3000);

  // 5. LEADERBOARD
  // MenuScene.ts: Leaderboard button at (960, 670)
  await smartClick(page, 960, 670, 'Leaderboard Button');
  await sleep(3000);
  console.log('Taking Leaderboard screenshot...');
  // Previous keys: 05 was leaderboard. Now it needs to be 08.
  await page.screenshot({ path: path.join(outDir, '08-leaderboard.png') });

  // Back to menu
  await page.goto(url, { waitUntil: 'networkidle0' });
  await sleep(3000);

  // 6. HOW TO PLAY
  // MenuScene.ts: How to Play button at (960, 750)
  await smartClick(page, 960, 750, 'How to Play Button');

  await sleep(2000);
  console.log('Taking How to Play screenshot...');
  // Previous keys: 06 was how-to-play. Now 09.
  await page.screenshot({ path: path.join(outDir, '09-how-to-play.png') });

  await browser.close();
})();