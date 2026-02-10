import Phaser from 'phaser';
import { SCENES, RENDER } from '../config';
import { loadProgress } from '../utils/Storage';
import { LEVELS } from '../levels/LevelData';
import { getAudioManager } from '../audio/AudioManager';

interface LeaderboardEntry {
  levelId: number;
  levelName: string;
  score: number;
  efficiency: number;
  conservation: number;
  rhythm: number;
  inputDensity: number;
  timestamp: number;
}

export class LeaderboardScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.LEADERBOARD });
  }

  create(): void {
    const cx = RENDER.WIDTH / 2;
    const cy = RENDER.HEIGHT / 2;

    this.cameras.main.setBackgroundColor(0x0a0a1a);

    // Background grid
    const bg = this.add.graphics().setDepth(0);
    bg.lineStyle(1, 0x1a1a3a, 0.3);
    for (let x = 0; x < RENDER.WIDTH; x += 60) {
      bg.beginPath();
      bg.moveTo(x, 0);
      bg.lineTo(x, RENDER.HEIGHT);
      bg.strokePath();
    }
    for (let y = 0; y < RENDER.HEIGHT; y += 60) {
      bg.beginPath();
      bg.moveTo(0, y);
      bg.lineTo(RENDER.WIDTH, y);
      bg.strokePath();
    }

    // Title
    this.add.text(cx, 80, '🏆 LEADERBOARD', {
      fontFamily: '"Segoe UI", Arial, sans-serif',
      fontSize: '48px',
      color: '#f1c40f',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(10);

    this.add.text(cx, 140, 'Your Personal Best Scores', {
      fontFamily: '"Segoe UI", Arial, sans-serif',
      fontSize: '20px',
      color: '#6a7a8a',
    }).setOrigin(0.5).setDepth(10);

    // Get player progress and create leaderboard
    const progress = loadProgress();
    const entries: LeaderboardEntry[] = [];

    for (const levelId in progress.bestScores) {
      const id = parseInt(levelId);
      const score = progress.bestScores[id];
      const level = LEVELS.find(l => l.id === id);
      
      if (level && score) {
        entries.push({
          levelId: id,
          levelName: level.name,
          score: score.compositeScore,
          efficiency: score.efficiency,
          conservation: score.conservation,
          rhythm: score.rhythmEntropy,
          inputDensity: score.inputDensity,
          timestamp: score.timestamp || 0,
        });
      }
    }

    // Sort by score descending
    entries.sort((a, b) => b.score - a.score);

    // Display top 15 entries
    const topEntries = entries.slice(0, 15);
    
    if (topEntries.length === 0) {
      this.add.text(cx, cy, 'No records yet!\nComplete some levels to see your best scores here.', {
        fontFamily: '"Segoe UI", Arial, sans-serif',
        fontSize: '24px',
        color: '#6a7a8a',
        align: 'center',
      }).setOrigin(0.5).setDepth(10);
    } else {
      // Header
      const headerY = 200;
      const colRank = 200;
      const colLevel = 340;
      const colScore = 900;
      const colEfficiency = 1100;
      const colConservation = 1300;
      const colRhythm = 1500;

      this.add.text(colRank, headerY, 'RANK', {
        fontFamily: '"Segoe UI", Arial, sans-serif',
        fontSize: '16px',
        color: '#00ffff',
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(10);

      this.add.text(colLevel, headerY, 'LEVEL', {
        fontFamily: '"Segoe UI", Arial, sans-serif',
        fontSize: '16px',
        color: '#00ffff',
        fontStyle: 'bold',
      }).setOrigin(0, 0.5).setDepth(10);

      this.add.text(colScore, headerY, 'SCORE', {
        fontFamily: '"Segoe UI", Arial, sans-serif',
        fontSize: '16px',
        color: '#00ffff',
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(10);

      this.add.text(colEfficiency, headerY, 'EFF', {
        fontFamily: '"Segoe UI", Arial, sans-serif',
        fontSize: '16px',
        color: '#00ffff',
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(10);

      this.add.text(colConservation, headerY, 'CON', {
        fontFamily: '"Segoe UI", Arial, sans-serif',
        fontSize: '16px',
        color: '#00ffff',
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(10);

      this.add.text(colRhythm, headerY, 'RHY', {
        fontFamily: '"Segoe UI", Arial, sans-serif',
        fontSize: '16px',
        color: '#00ffff',
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(10);

      // Entries
      topEntries.forEach((entry, index) => {
        const y = headerY + 50 + index * 45;
        const rank = index + 1;
        
        // Medal for top 3
        let rankText = `${rank}`;
        let rankColor = '#ffffff';
        if (rank === 1) {
          rankText = '🥇';
        } else if (rank === 2) {
          rankText = '🥈';
        } else if (rank === 3) {
          rankText = '🥉';
        }

        // Alternating row background
        if (index % 2 === 0) {
          const rowBg = this.add.graphics();
          rowBg.fillStyle(0x1a1a3a, 0.3);
          rowBg.fillRect(180, y - 18, 1340, 36);
        }

        // Rank
        this.add.text(colRank, y, rankText, {
          fontFamily: '"Segoe UI", Arial, sans-serif',
          fontSize: '20px',
          color: rankColor,
        }).setOrigin(0.5).setDepth(10);

        // Level name and number
        this.add.text(colLevel, y, `Level ${entry.levelId}: ${entry.levelName}`, {
          fontFamily: '"Segoe UI", Arial, sans-serif',
          fontSize: '18px',
          color: '#ffffff',
        }).setOrigin(0, 0.5).setDepth(10);

        // Score
        const scoreColor = entry.score >= 90 ? '#2ecc71' : entry.score >= 70 ? '#f1c40f' : '#ffffff';
        this.add.text(colScore, y, entry.score.toFixed(1), {
          fontFamily: '"Segoe UI", Arial, sans-serif',
          fontSize: '20px',
          color: scoreColor,
          fontStyle: 'bold',
        }).setOrigin(0.5).setDepth(10);

        // Efficiency
        this.add.text(colEfficiency, y, entry.efficiency.toFixed(2), {
          fontFamily: '"Segoe UI", Arial, sans-serif',
          fontSize: '16px',
          color: '#6a7a8a',
        }).setOrigin(0.5).setDepth(10);

        // Conservation
        this.add.text(colConservation, y, entry.conservation.toFixed(2), {
          fontFamily: '"Segoe UI", Arial, sans-serif',
          fontSize: '16px',
          color: '#6a7a8a',
        }).setOrigin(0.5).setDepth(10);

        // Rhythm
        this.add.text(colRhythm, y, entry.rhythm.toFixed(2), {
          fontFamily: '"Segoe UI", Arial, sans-serif',
          fontSize: '16px',
          color: '#6a7a8a',
        }).setOrigin(0.5).setDepth(10);
      });

      // Stats summary
      const avgScore = topEntries.reduce((sum, e) => sum + e.score, 0) / topEntries.length;
      const bestScore = topEntries[0].score;
      const completedLevels = entries.length;

      this.add.text(cx, RENDER.HEIGHT - 120, 
        `📊 Stats: ${completedLevels} Levels Completed  •  Best: ${bestScore.toFixed(1)}  •  Average: ${avgScore.toFixed(1)}`, {
        fontFamily: '"Segoe UI", Arial, sans-serif',
        fontSize: '18px',
        color: '#6a7a8a',
      }).setOrigin(0.5).setDepth(10);
    }

    // Back button
    this.createButton(cx, RENDER.HEIGHT - 60, '←  BACK TO MENU', 0x4a90d9, () => {
      getAudioManager().playClick();
      this.scene.start(SCENES.MENU);
    });
  }

  private createButton(
    x: number, y: number, text: string, color: number, onClick: () => void
  ): Phaser.GameObjects.Container {
    const colorStr = '#' + color.toString(16).padStart(6, '0');

    const bg = this.add.graphics();
    bg.fillStyle(color, 0.1);
    bg.fillRoundedRect(-160, -25, 320, 50, 12);
    bg.lineStyle(2, color, 0.6);
    bg.strokeRoundedRect(-160, -25, 320, 50, 12);

    const label = this.add.text(0, 0, text, {
      fontFamily: '"Segoe UI", Arial, sans-serif',
      fontSize: '24px',
      color: colorStr,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const container = this.add.container(x, y, [bg, label]).setDepth(10);
    container.setSize(320, 50);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      getAudioManager().playHover();
      bg.clear();
      bg.fillStyle(color, 0.25);
      bg.fillRoundedRect(-160, -25, 320, 50, 12);
      bg.lineStyle(2, color, 1);
      bg.strokeRoundedRect(-160, -25, 320, 50, 12);
      label.setColor('#ffffff');
    });

    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(color, 0.1);
      bg.fillRoundedRect(-160, -25, 320, 50, 12);
      bg.lineStyle(2, color, 0.6);
      bg.strokeRoundedRect(-160, -25, 320, 50, 12);
      label.setColor(colorStr);
    });

    container.on('pointerdown', onClick);

    return container;
  }
}
