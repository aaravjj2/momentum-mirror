import Phaser from 'phaser';
import { SCENES, RENDER, SKILL_RATINGS } from '../config';
import { MetricsSnapshot } from '../types';
import { getLevelById, LEVELS } from '../levels/LevelData';
import { getBestScore } from '../utils/Storage';

export class ResultsScene extends Phaser.Scene {
  private metrics!: MetricsSnapshot;
  private levelId!: number;

  constructor() {
    super({ key: SCENES.RESULTS });
  }

  init(data: { levelId: number; metrics: MetricsSnapshot }): void {
    this.levelId = data.levelId;
    this.metrics = data.metrics;
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x0a0a1a);
    const cx = RENDER.WIDTH / 2;
    const level = getLevelById(this.levelId);

    // ─── Header ─────────────────────────────────────────
    this.add.text(cx, 40, 'LEVEL COMPLETE!', {
      fontFamily: '"Segoe UI", Arial, sans-serif',
      fontSize: '42px',
      color: '#f1c40f',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    if (level) {
      this.add.text(cx, 90, `${level.id}. ${level.name}`, {
        fontFamily: '"Segoe UI", Arial, sans-serif',
        fontSize: '22px',
        color: '#00ffff',
      }).setOrigin(0.5);
    }

    // ─── Composite Score ────────────────────────────────
    const scoreColor = this.getScoreColor(this.metrics.compositeScore);

    const scoreCircle = this.add.graphics();
    scoreCircle.lineStyle(6, scoreColor, 1);
    scoreCircle.strokeCircle(cx, 220, 80);
    scoreCircle.fillStyle(scoreColor, 0.1);
    scoreCircle.fillCircle(cx, 220, 80);

    // Animated score counter
    const scoreText = this.add.text(cx, 210, '0', {
      fontFamily: '"Segoe UI", Arial, sans-serif',
      fontSize: '56px',
      color: '#' + scoreColor.toString(16).padStart(6, '0'),
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(cx, 260, this.metrics.skillRating, {
      fontFamily: '"Segoe UI", Arial, sans-serif',
      fontSize: '18px',
      color: '#' + scoreColor.toString(16).padStart(6, '0'),
    }).setOrigin(0.5);

    // Animate score counting up
    this.tweens.addCounter({
      from: 0,
      to: this.metrics.compositeScore,
      duration: 1200,
      ease: 'Cubic.easeOut',
      onUpdate: (tween) => {
        scoreText.setText(Math.floor(tween.getValue() ?? 0).toString());
      },
    });

    // ─── Metric Bars ────────────────────────────────────
    const metricsStartY = 340;
    const barWidth = 400;
    const barHeight = 28;
    const gap = 55;

    const metricData = [
      {
        label: 'Momentum Efficiency',
        value: this.metrics.efficiency,
        max: 1,
        color: 0x2ecc71,
        detail: `${(this.metrics.efficiency * 100).toFixed(1)}%`,
      },
      {
        label: 'Energy Conservation',
        value: this.metrics.conservation,
        max: 1,
        color: 0x3498db,
        detail: `${(this.metrics.conservation * 100).toFixed(1)}%`,
      },
      {
        label: 'Rhythmic Consistency',
        value: Math.max(0, 1 - this.metrics.rhythmEntropy),
        max: 1,
        color: 0x9b59b6,
        detail: `Entropy: ${this.metrics.rhythmEntropy.toFixed(2)}`,
      },
      {
        label: 'Input Economy',
        value: Math.min(1, 1 / Math.max(1, this.metrics.inputDensity)),
        max: 1,
        color: 0xf39c12,
        detail: `${this.metrics.inputDensity.toFixed(1)}x optimal`,
      },
    ];

    const barStartX = cx - barWidth / 2;

    metricData.forEach((metric, i) => {
      const y = metricsStartY + i * gap;

      // Label
      this.add.text(barStartX, y - 20, metric.label, {
        fontFamily: '"Segoe UI", Arial, sans-serif',
        fontSize: '16px',
        color: '#aaaaaa',
      });

      // Value
      this.add.text(barStartX + barWidth, y - 20, metric.detail, {
        fontFamily: '"Segoe UI", Arial, sans-serif',
        fontSize: '16px',
        color: '#' + metric.color.toString(16).padStart(6, '0'),
      }).setOrigin(1, 0);

      // Bar background
      const barBg = this.add.graphics();
      barBg.fillStyle(0x1a1a3a, 1);
      barBg.fillRoundedRect(barStartX, y, barWidth, barHeight, 6);

      // Bar fill — animated
      const barFill = this.add.graphics();
      const fillWidth = barWidth * Math.min(metric.value / metric.max, 1);

      this.tweens.addCounter({
        from: 0,
        to: fillWidth,
        duration: 800,
        delay: 300 + i * 150,
        ease: 'Cubic.easeOut',
        onUpdate: (tween) => {
          barFill.clear();
          barFill.fillStyle(metric.color, 0.8);
          barFill.fillRoundedRect(barStartX, y, tween.getValue() ?? 0, barHeight, 6);
        },
      });
    });

    // ─── Stats ──────────────────────────────────────────
    const statsY = metricsStartY + metricData.length * gap + 30;
    const stats = [
      `Time: ${this.metrics.completionTime}s`,
      `Swipes: ${this.metrics.totalSwipes}`,
      `Bounces: ${this.metrics.totalBounces}`,
      `Distance: ${this.metrics.distanceTraveled}px`,
    ];

    this.add.text(cx, statsY, stats.join('   •   '), {
      fontFamily: '"Segoe UI", Arial, sans-serif',
      fontSize: '16px',
      color: '#6a7a8a',
    }).setOrigin(0.5);

    // ─── Best Score Comparison ──────────────────────────
    const best = getBestScore(this.levelId);
    if (best && best.compositeScore !== this.metrics.compositeScore) {
      const comparison = this.metrics.compositeScore >= best.compositeScore
        ? `🏆 New Best! (previous: ${best.compositeScore})`
        : `Best: ${best.compositeScore}`;
      this.add.text(cx, statsY + 35, comparison, {
        fontFamily: '"Segoe UI", Arial, sans-serif',
        fontSize: '18px',
        color: this.metrics.compositeScore >= best.compositeScore ? '#f1c40f' : '#6a7a8a',
      }).setOrigin(0.5);
    }

    // ─── Buttons ────────────────────────────────────────
    const btnY = RENDER.HEIGHT - 80;

    // Retry
    this.createButton(cx - 250, btnY, '↻  RETRY', 0xff6b6b, () => {
      this.scene.start(SCENES.GAME, { levelId: this.levelId, isRetry: true });
    });

    // Next Level
    const nextLevel = getLevelById(this.levelId + 1);
    if (nextLevel) {
      this.createButton(cx, btnY, '▶  NEXT LEVEL', 0x00ffff, () => {
        this.scene.start(SCENES.GAME, { levelId: this.levelId + 1, isRetry: false });
      });
    }

    // Level Select
    this.createButton(cx + 250, btnY, '☰  LEVELS', 0x4a90d9, () => {
      this.scene.start(SCENES.LEVEL_SELECT);
    });
  }

  private getScoreColor(score: number): number {
    for (const rating of SKILL_RATINGS) {
      if (score >= rating.min && score <= rating.max) {
        return rating.color;
      }
    }
    return 0x95a5a6;
  }

  private createButton(x: number, y: number, text: string, color: number, onClick: () => void): void {
    const colorStr = '#' + color.toString(16).padStart(6, '0');

    const bg = this.add.graphics();
    bg.fillStyle(color, 0.1);
    bg.fillRoundedRect(x - 100, y - 22, 200, 44, 10);
    bg.lineStyle(2, color, 0.6);
    bg.strokeRoundedRect(x - 100, y - 22, 200, 44, 10);

    const label = this.add.text(x, y, text, {
      fontFamily: '"Segoe UI", Arial, sans-serif',
      fontSize: '20px',
      color: colorStr,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const hitArea = this.add.rectangle(x, y, 200, 44, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    hitArea.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(color, 0.3);
      bg.fillRoundedRect(x - 100, y - 22, 200, 44, 10);
      bg.lineStyle(2, color, 1);
      bg.strokeRoundedRect(x - 100, y - 22, 200, 44, 10);
      label.setColor('#ffffff');
    });

    hitArea.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(color, 0.1);
      bg.fillRoundedRect(x - 100, y - 22, 200, 44, 10);
      bg.lineStyle(2, color, 0.6);
      bg.strokeRoundedRect(x - 100, y - 22, 200, 44, 10);
      label.setColor(colorStr);
    });

    hitArea.on('pointerdown', onClick);
  }
}
