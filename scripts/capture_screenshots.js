const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const outDir = path.resolve(__dirname, '..', 'screenshots');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  const url = 'https://momentum-mirror.vercel.app';
  console.log('Navigating to', url);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForTimeout(1000);

  // Menu
  await page.screenshot({ path: path.join(outDir, '01-menu.png') });
  console.log('Saved 01-menu.png');

  // Click PLAY (approx center)
  await page.mouse.click(640, 380); // may need tuning
  await page.waitForTimeout(1200);

  // Level Select
  await page.screenshot({ path: path.join(outDir, '02-level-select.png') });
  console.log('Saved 02-level-select.png');

  // Attempt to click first available level tile - approximate
  await page.mouse.click(420, 320);
  await page.waitForTimeout(1200);

  // In-game screenshot (HUD visible)
  await page.screenshot({ path: path.join(outDir, '03-level-gameplay.png') });
  console.log('Saved 03-level-gameplay.png');

  // Wait a bit to capture phase walls animation in level with phase walls (try level 12 by clicking its approximate area)
  // Navigate back to level select
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, '04-back-level-select.png') });

  // Try selecting a rhythm level tile position (approx)
  await page.mouse.click(520, 420); // guessed slot
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(outDir, '05-phase-level.png') });
  console.log('Saved 05-phase-level.png');

  await browser.close();
  console.log('Done capturing screenshots');
})();