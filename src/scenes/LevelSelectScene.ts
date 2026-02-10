import Phaser from 'phaser';
import { SCENES, RENDER, SURFACE_COLORS, SurfaceType } from '../config';
import { LEVELS } from '../levels/LevelData';
import { isLevelUnlocked, getBestScore, getCompletedLevels } from '../utils/Storage';
import { LevelCategory } from '../types';

const CATEGORY_COLORS: Record<LevelCategory, number> = {
  tutorial: 0x3498db,
  efficiency: 0x2ecc71,
  rhythm: 0x9b59b6,
  precision: 0xe74c3c,
  hybrid: 0xf39c12, master: 0xf1c40f,
};

const CATEGORY_LABELS: Record<LevelCategory, string> = {
  tutorial: 'Tutorial',
  efficiency: 'Efficiency',
  rhythm: 'Rhythm',
  precision: 'Precision',
  hybrid: 'Hybrid',
  master: 'Master',
};

export class LevelSelectScene extends Phaser.Scene {
  private scrollY: number = 0;
  private maxScrollY: number = 0;
  private container!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: SCENES.LEVEL_SELECT });
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x0a0a1a);
    this.scrollY = 0;

    const cx = RENDER.WIDTH / 2;

    // Title
    this.add.text(cx, 40, 'SELECT LEVEL', {
      fontFamily: '"Segoe UI", Arial, sans-serif',
      fontSize: '36px',
      color: '#00ffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(100);

    // Progress
    const completed = getCompletedLevels();
    this.add.text(cx, 80, `${completed.length} / ${LEVELS.length} completed`, {
      fontFamily: '"Segoe UI", Arial, sans-serif',
      fontSize: '16px',
      color: '#6a7a8a',
    }).setOrigin(0.5).setDepth(100);

    // Back button
    const backBtn = this.add.text(50, 40, '← Menu', {
      fontFamily: '"Segoe UI", Arial, sans-serif',
      fontSize: '22px',
      color: '#4a90d9',
    }).setDepth(100).setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => this.scene.start(SCENES.MENU));
    backBtn.on('pointerover', () => backBtn.setColor('#7ab8f5'));
    backBtn.on('pointerout', () => backBtn.setColor('#4a90d9'));

    // Scrollable container
    this.container = this.add.container(0, 0);

    // Group levels by category
    const categories: LevelCategory[] = ['tutorial', 'efficiency', 'rhythm', 'precision', 'hybrid', 'master'];
    let yOffset = 120;

    for (const category of categories) {
      const catLevels = LEVELS.filter((l) => l.category === category);
      if (catLevels.length === 0) continue;

      const color = CATEGORY_COLORS[category];
      const colorStr = '#' + color.toString(16).padStart(6, '0');

      // Category header
      const catHeader = this.add.text(60, yOffset, CATEGORY_LABELS[category].toUpperCase(), {
        fontFamily: '"Segoe UI", Arial, sans-serif',
        fontSize: '20px',
        color: colorStr,
        fontStyle: 'bold',
      });
      this.container.add(catHeader);

      // Decorative line
      const line = this.add.graphics();
      line.lineStyle(1, color, 0.3);
      line.beginPath();
      line.moveTo(60, yOffset + 30);
      line.lineTo(RENDER.WIDTH - 60, yOffset + 30);
      line.strokePath();
      this.container.add(line);

      yOffset += 50;

      // Level cards — grid layout
      const cardsPerRow = 5;
      const cardWidth = 320;
      const cardHeight = 100;
      const gap = 20;
      const startX = (RENDER.WIDTH - (cardsPerRow * cardWidth + (cardsPerRow - 1) * gap)) / 2;

      for (let i = 0; i < catLevels.length; i++) {
        const level = catLevels[i];
        const col = i % cardsPerRow;
        const row = Math.floor(i / cardsPerRow);
        const x = startX + col * (cardWidth + gap);
        const y = yOffset + row * (cardHeight + gap);

        this.createLevelCard(x, y, cardWidth, cardHeight, level, color);
      }

      const rows = Math.ceil(catLevels.length / cardsPerRow);
      yOffset += rows * (cardHeight + gap) + 30;
    }

    this.maxScrollY = Math.max(0, yOffset - RENDER.HEIGHT + 100);

    // Scroll handling
    this.input.on('wheel', (_pointer: any, _gameObjects: any, _dx: number, dy: number) => {
      this.scrollY = Phaser.Math.Clamp(this.scrollY + dy * 0.5, 0, this.maxScrollY);
    });

    // Touch drag scrolling
    let dragStartY = 0;
    let dragStartScroll = 0;
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      dragStartY = pointer.y;
      dragStartScroll = this.scrollY;
    });
  }

  private createLevelCard(
    x: number, y: number, w: number, h: number,
    level: typeof LEVELS[0], categoryColor: number
  ): void {
    const unlocked = isLevelUnlocked(level.id);
    const best = getBestScore(level.id);
    const isCompleted = best !== null;

    const gfx = this.add.graphics();
    const alpha = unlocked ? 0.8 : 0.3;

    // Card background
    gfx.fillStyle(unlocked ? 0x1a1a3a : 0x0d0d1d, alpha);
    gfx.fillRoundedRect(x, y, w, h, 10);
    gfx.lineStyle(2, unlocked ? categoryColor : 0x333355, alpha);
    gfx.strokeRoundedRect(x, y, w, h, 10);

    // Completion indicator
    if (isCompleted) {
      gfx.fillStyle(0x2ecc71, 0.3);
      gfx.fillRoundedRect(x, y, w, h, 10);
    }

    this.container.add(gfx);

    // Level number
    const numText = this.add.text(x + 15, y + 10, `#${level.id}`, {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: unlocked ? '#' + categoryColor.toString(16).padStart(6, '0') : '#444466',
    });
    this.container.add(numText);

    // Level name
    const nameText = this.add.text(x + 15, y + 32, level.name, {
      fontFamily: '"Segoe UI", Arial, sans-serif',
      fontSize: '18px',
      color: unlocked ? '#ffffff' : '#555577',
      fontStyle: 'bold',
    });
    this.container.add(nameText);

    // Category badge
    const badgeText = this.add.text(x + 15, y + 58, level.category.toUpperCase(), {
      fontFamily: '"Segoe UI", Arial, sans-serif',
      fontSize: '11px',
      color: '#' + categoryColor.toString(16).padStart(6, '0'),
      backgroundColor: 'rgba(0,0,0,0.3)',
      padding: { x: 6, y: 2 },
    });
    this.container.add(badgeText);

    // Score display
    if (isCompleted && best) {
      const scoreText = this.add.text(x + w - 15, y + 15, `${best.compositeScore}`, {
        fontFamily: '"Segoe UI", Arial, sans-serif',
        fontSize: '28px',
        color: '#f1c40f',
        fontStyle: 'bold',
      }).setOrigin(1, 0);
      this.container.add(scoreText);

      const ratingText = this.add.text(x + w - 15, y + 48, best.skillRating, {
        fontFamily: '"Segoe UI", Arial, sans-serif',
        fontSize: '13px',
        color: '#aaaaaa',
      }).setOrigin(1, 0);
      this.container.add(ratingText);
    } else if (!unlocked) {
      const lockText = this.add.text(x + w - 15, y + h / 2, '🔒', {
        fontSize: '28px',
      }).setOrigin(1, 0.5);
      this.container.add(lockText);
    }

    // Interactive
    if (unlocked) {
      const hitArea = this.add.rectangle(x + w / 2, y + h / 2, w, h, 0x000000, 0)
        .setInteractive({ useHandCursor: true });
      this.container.add(hitArea);

      hitArea.on('pointerover', () => {
        gfx.clear();
        gfx.fillStyle(0x2a2a4a, 1);
        gfx.fillRoundedRect(x, y, w, h, 10);
        gfx.lineStyle(3, categoryColor, 1);
        gfx.strokeRoundedRect(x, y, w, h, 10);
        if (isCompleted) {
          gfx.fillStyle(0x2ecc71, 0.2);
          gfx.fillRoundedRect(x, y, w, h, 10);
        }
      });

      hitArea.on('pointerout', () => {
        gfx.clear();
        gfx.fillStyle(0x1a1a3a, 0.8);
        gfx.fillRoundedRect(x, y, w, h, 10);
        gfx.lineStyle(2, categoryColor, 0.8);
        gfx.strokeRoundedRect(x, y, w, h, 10);
        if (isCompleted) {
          gfx.fillStyle(0x2ecc71, 0.3);
          gfx.fillRoundedRect(x, y, w, h, 10);
        }
      });

      hitArea.on('pointerdown', () => {
        this.scene.start(SCENES.GAME, { levelId: level.id });
      });
    }
  }

  update(): void {
    if (this.container) {
      this.container.setY(-this.scrollY);
    }
  }
}
