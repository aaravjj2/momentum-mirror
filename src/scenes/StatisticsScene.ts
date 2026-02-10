import Phaser from 'phaser';
import { AchievementsManager } from '../achievements/AchievementsManager';
import { SCENES } from '../config';

export class StatisticsScene extends Phaser.Scene {
  private achievementsManager!: AchievementsManager;

  constructor() {
    super({ key: SCENES.STATISTICS });
  }

  create(): void {
    this.achievementsManager = AchievementsManager.getInstance();
    const stats = this.achievementsManager.getGlobalStats();

    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(0, 0, width, height, 0x0a0a1a, 1).setOrigin(0);

    // Grid pattern background
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x1a1a2e, 0.3);
    for (let x = 0; x < width; x += 50) {
      graphics.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 50) {
      graphics.lineBetween(0, y, width, y);
    }

    // Title
    this.add
      .text(width / 2, 60, '📊 STATISTICS', {
        fontSize: '56px',
        fontFamily: 'Arial, sans-serif',
        color: '#4a9eff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Create stat cards
    this.createStatSection('⏱️ TIME', [
      { label: 'Total Play Time', value: this.formatTime(stats.totalPlayTime), color: '#4a9eff' },
      { label: 'Fastest Completion', value: this.formatTime(stats.fastestCompletion === Infinity ? 0 : stats.fastestCompletion), color: '#2ecc71' },
      { label: 'Average Level Time', value: stats.levelsCompleted > 0 ? this.formatTime(stats.totalPlayTime / stats.levelsCompleted) : '0s', color: '#f39c12' },
    ], 150, 200, width / 2 - 250);

    this.createStatSection('🎯 GAMEPLAY', [
      { label: 'Levels Completed', value: stats.levelsCompleted.toString(), color: '#ffd700' },
      { label: 'Total Goals', value: stats.totalGoals.toString(), color: '#2ecc71' },
      { label: 'Total Retries', value: stats.totalRetries.toString(), color: '#e74c3c' },
      { label: 'Success Rate', value: stats.totalGoals > 0 ? `${Math.round((stats.totalGoals / (stats.totalGoals + stats.totalRetries)) * 100)}%` : '0%', color: '#9b59b6' },
    ], 150, 200, width / 2 + 50);

    this .createStatSection('✋ INPUTS', [
      { label: 'Total Swipes', value: stats.totalSwipes.toLocaleString(), color: '#4a9eff' },
      { label: 'Total Bounces', value: stats.totalBounces.toLocaleString(), color: '#e67e22' },
      { label: 'Avg Swipes/Level', value: stats.levelsCompleted > 0 ? (stats.totalSwipes / stats.levelsCompleted).toFixed(1) : '0', color: '#3498db' },
      { label: 'Avg Bounces/Level', value: stats.levelsCompleted > 0 ? (stats.totalBounces / stats.levelsCompleted).toFixed(1) : '0', color: '#e74c3c' },
    ], 400, 200, width / 2 - 250);

    this.createStatSection('📏 DISTANCE', [
      { label: 'Total Distance', value: `${Math.round(stats.totalDistance).toLocaleString()} px`, color: '#2ecc71' },
      { label: 'Avg Distance/Level', value: stats.levelsCompleted > 0 ? `${Math.round(stats.totalDistance / stats.levelsCompleted).toLocaleString()} px` : '0 px', color: '#f39c12' },
      { label: 'Efficiency', value: stats.totalDistance > 0 && stats.totalSwipes > 0 ? `${Math.round(stats.totalDistance / stats.totalSwipes)} px/swipe` : '0 px/swipe', color: '#1abc9c' },
    ], 400, 350, width / 2 + 50);

    this.createStatSection('🏆 MASTERY', [
      { label: 'Perfect Scores', value: stats.perfectScores.toString(), color: '#ffd700' },
      { label: 'Master Ratings', value: stats.masterScores.toString(), color: '#9b59b6' },
      { label: 'Expert+ Ratings', value: stats.expertScores.toString(), color: '#3498db' },
      { label: 'Achievement Progress', value: `${this.achievementsManager.getUnlockedCount()}/${this.achievementsManager.getTotalCount()}`, color: '#e74c3c' },
    ], 650, 200, width / 2 - 250);

    // Personal records
    this.createPersonalRecords(650, width / 2 + 50);

    // Back button
    const backButton = this.add
      .rectangle(width / 2, height - 60, 200, 50, 0x1a1a2e, 1)
      .setStrokeStyle(2, 0x3a3a4e);
    backButton.setInteractive({ useHandCursor: true });

    const backText = this.add
      .text(width / 2, height - 60, '◀ BACK', {
        fontSize: '24px',
        fontFamily: 'Arial, sans-serif',
        color: '#9fb2c9',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    backButton.on('pointerdown', () => {
      this.scene.start('MENU');
    });

    backButton.on('pointerover', () => {
      backButton.setFillStyle(0x2a2a3e);
      backText.setColor('#ffffff');
    });

    backButton.on('pointerout', () => {
      backButton.setFillStyle(0x1a1a2e);
      backText.setColor('#9fb2c9');
    });
  }

  private createStatSection(
    title: string,
    stats: { label: string; value: string; color: string }[],
    y: number,
    cardWidth: number,
    x: number
  ): void {
    const cardHeight = 40 + stats.length * 45;

    // Panel background
    const bg = this.add.rectangle(x, y, cardWidth, cardHeight, 0x1a1a2e, 1).setOrigin(0);
    bg.setStrokeStyle(2, 0x3a3a4e);

    // Title
    this.add
      .text(x + cardWidth / 2, y + 25, title, {
        fontSize: '24px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Stats
    stats.forEach((stat, index) => {
      const statY = y + 60 + index * 45;

      this.add
        .text(x + 15, statY, stat.label, {
          fontSize: '16px',
          fontFamily: 'Arial, sans-serif',
          color: '#9fb2c9',
        })
        .setOrigin(0);

      this.add
        .text(x + cardWidth - 15, statY, stat.value, {
          fontSize: '20px',
          fontFamily: 'Arial, sans-serif',
          color: stat.color,
          fontStyle: 'bold',
        })
        .setOrigin(1, 0);
    });
  }

  private createPersonalRecords(y: number, x: number): void {
    const width = 480;
    const height = 220;

    const bg = this.add.rectangle(x, y, width, height, 0x1a1a2e, 1).setOrigin(0);
    bg.setStrokeStyle(2, 0x3a3a4e);

    this.add
      .text(x + width / 2, y + 25, '🎖️ PERSONAL RECORDS', {
        fontSize: '24px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Get best scores from LocalStorage
    const progress = this.getLevelProgress();
    const scores = Object.values(progress).map((p: any) => p.bestScore || 0);
    const bestScore = Math.max(...scores, 0);
    const avgScore = scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0;
    const perfectCount = scores.filter(s => s === 100).length;

    const records = [
      { label: 'Highest Score', value: bestScore.toFixed(0), color: '#ffd700' },
      { label: 'Average Score', value: avgScore.toFixed(1), color: '#4a9eff' },
      { label: 'Perfect Levels', value: perfectCount.toString(), color: '#2ecc71' },
      { label: 'Completion Rate', value: `${Math.round((Object.keys(progress).length / 40) * 100)}%`, color: '#9b59b6' },
    ];

    records.forEach((record, index) => {
      const recordY = y + 70 + index * 35;

      this.add
        .text(x + 15, recordY, record.label, {
          fontSize: '16px',
          fontFamily: 'Arial, sans-serif',
          color: '#9fb2c9',
        })
        .setOrigin(0);

      this.add
        .text(x + width - 15, recordY, record.value, {
          fontSize: '20px',
          fontFamily: 'Arial, sans-serif',
          color: record.color,
          fontStyle: 'bold',
        })
        .setOrigin(1, 0);
    });
  }

  private formatTime(ms: number): string {
    if (ms === 0) return '0s';
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  private getLevelProgress(): { [key: number]: { completed: boolean; bestScore?: number } } {
    const saved = localStorage.getItem('momentum_progress');
    return saved ? JSON.parse(saved) : {};
  }
}
