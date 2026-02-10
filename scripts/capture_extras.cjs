const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        defaultViewport: { width: 1920, height: 1080 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Ensure screenshots directory exists
    const screenshotDir = path.join(__dirname, '../screenshots');
    if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir);
    }

    try {
        console.log('Navigating to game...');

        // Inject data BEFORE navigation (or use evaluateOnNewDocument)
        await page.evaluateOnNewDocument(() => {
            // Fake Global Stats
            const fakeStats = {
                totalSwipes: 432,
                totalBounces: 1567,
                totalDistance: 54321,
                totalPlayTime: 7543000, // ~2h 5m
                levelsCompleted: 18,
                perfectScores: 4,
                masterScores: 8,
                expertScores: 12,
                totalGoals: 18,
                fastestCompletion: 3200,
                highestCombo: 5,
                totalRetries: 42,
            };

            // Fake Achievements
            // 'first_win', 'tutorial_complete', 'speed_demon' unlocked
            const fakeAchievements = {
                'first_win': { unlocked: true, unlockedAt: Date.now() - 10000000, progress: 1 },
                'tutorial_complete': { unlocked: true, unlockedAt: Date.now() - 5000000, progress: 5 },
                'speed_demon': { unlocked: true, unlockedAt: Date.now() - 2000000, progress: 1 },
                'bouncy_castle': { unlocked: false, progress: 850 }, // 850/1000
                'marathon_runner': { unlocked: true, unlockedAt: Date.now() - 100000, progress: 54321 },
            };

            // Fake Level Progress (for Personal Records in Stats)
            const fakeProgress = {};
            for (let i = 1; i <= 18; i++) {
                fakeProgress[i] = { completed: true, bestScore: i % 5 === 0 ? 100 : 85 + (i % 10) };
            }

            localStorage.setItem('momentum_global_stats', JSON.stringify(fakeStats));
            localStorage.setItem('momentum_achievements', JSON.stringify(fakeAchievements));
            localStorage.setItem('momentum_progress', JSON.stringify(fakeProgress));

            // Also unlock levels to ensure we aren't locked out of anything (though likely not needed for these screens)
            localStorage.setItem('mm_unlocked_levels', JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]));
        });

        console.log('Navigating to http://127.0.0.1:3005...');
        try {
            await page.goto('http://127.0.0.1:3005', { waitUntil: 'domcontentloaded', timeout: 30000 });
            console.log('Navigation complete.');
        } catch (e) {
            console.error('Navigation failed:', e);
            throw e;
        }

        // Wait for canvas to appear
        console.log('Waiting for canvas...');
        await page.waitForSelector('canvas', { timeout: 10000 });
        console.log('Canvas found.');

        // Wait for Menu to load
        await new Promise(r => setTimeout(r, 2000)); // Wait for bounce intro

        // --- Capture Statistics ---
        console.log('Navigating to Statistics...');
        // Click Statistics button (1180, 750)
        await page.mouse.click(1180, 750);
        await new Promise(r => setTimeout(r, 1000)); // Wait for transition

        console.log('Capturing Statistics...');
        await page.screenshot({ path: path.join(screenshotDir, '10-statistics.png') });

        // Click Back button (960, 1020)
        await page.mouse.click(960, 1020);
        await new Promise(r => setTimeout(r, 1000)); // Wait for return to menu

        // --- Capture Achievements ---
        console.log('Navigating to Achievements...');
        // Click Achievements button (740, 750)
        await page.mouse.click(740, 750);
        await new Promise(r => setTimeout(r, 1000)); // Wait for transition

        console.log('Capturing Achievements...');
        await page.screenshot({ path: path.join(screenshotDir, '11-achievements.png') });

        console.log('Done!');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
})();
