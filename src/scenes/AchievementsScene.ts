import Phaser from 'phaser';
import { AchievementsManager, Achievement } from '../achievements/AchievementsManager';
import { SCENES } from '../config';

export class AchievementsScene extends Phaser.Scene {
  private achievementsManager!: AchievementsManager;
  private scrollY: number = 0;
  private maxScrollY: number = 0;
  private scrollContainer!: Phaser.GameObjects.Container;
  private selectedCategory: Achievement['category'] | 'all' = 'all';

  constructor() {
    super({ key: SCENES.ACHIEVEMENTS });
  }

  create(): void {
    this.achievementsManager = AchievementsManager.getInstance();

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
      .text(width / 2, 60, '🏆 ACHIEVEMENTS', {
        fontSize: '56px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffd700',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Stats bar
    const unlockedCount = this.achievementsManager.getUnlockedCount();
    const totalCount = this.achievementsManager.getTotalCount();
    const percentage = this.achievementsManager.getCompletionPercentage();

    this.add
      .text(width / 2, 120, `${unlockedCount} / ${totalCount} Unlocked (${percentage}%)`, {
        fontSize: '24px',
        fontFamily: 'Arial, sans-serif',
        color: '#9fb2c9',
      })
      .setOrigin(0.5);

    // Progress bar
    const barWidth = 600;
    const barHeight = 30;
    const barX = (width - barWidth) / 2;
    const barY = 150;

    this.add.rectangle(barX, barY, barWidth, barHeight, 0x1a1a2e, 1).setOrigin(0);
    this.add.rectangle(barX, barY, barWidth * (percentage / 100), barHeight, 0xffd700, 1).setOrigin(0);
    this.add.rectangle(barX, barY, barWidth, barHeight, 0xffffff, 0).setOrigin(0).setStrokeStyle(2, 0x3a3a4e);

    // Category filters
    const categories: (Achievement['category'] | 'all')[] = ['all', 'progress', 'mastery', 'skill', 'challenge', 'special'];
    const categoryLabels = {
      all: '📋 All',
      progress: '🎯 Progress',
      mastery: '👑 Mastery',
      skill: '⚡ Skill',
      challenge: '🔥 Challenge',
      special: '✨ Special',
    };

    const buttonWidth = 150;
    const buttonSpacing = 10;
    const totalButtonWidth = categories.length * buttonWidth + (categories.length - 1) * buttonSpacing;
    const startX = (width - totalButtonWidth) / 2;

    categories.forEach((category, index) => {
      const x = startX + index * (buttonWidth + buttonSpacing);
      const y = 210;
      const isSelected = this.selectedCategory === category;

      const button = this.add
        .rectangle(x, y, buttonWidth, 40, isSelected ? 0x3a7ca5 : 0x1a1a2e, 1)
        .setOrigin(0);
      
      button.setStrokeStyle(2, isSelected ? 0x5aa5d6 : 0x2a2a3e);
      button.setInteractive({ useHandCursor: true });

      const text = this.add
        .text(x + buttonWidth / 2, y + 20, categoryLabels[category], {
          fontSize: '18px',
          fontFamily: 'Arial, sans-serif',
          color: isSelected ? '#ffffff' : '#9fb2c9',
        })
        .setOrigin(0.5);

      button.on('pointerdown', () => {
        this.selectedCategory = category;
        this.scene.restart();
      });

      button.on('pointerover', () => {
        if (!isSelected) {
          button.setFillStyle(0x2a2a3e);
          text.setColor('#ffffff');
        }
      });

      button.on('pointerout', () => {
        if (!isSelected) {
          button.setFillStyle(0x1a1a2e);
          text.setColor('#9fb2c9');
        }
      });
    });

    // Scroll container
    this.scrollContainer = this.add.container(0, 270);

    // Achievement cards
    this.renderAchievements();

    // Scroll wheel support
    this.input.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: any[], deltaX: number, deltaY: number) => {
      this.scrollY += deltaY * 0.3;
      this.scrollY = Phaser.Math.Clamp(this.scrollY, 0, this.maxScrollY);
      this.scrollContainer.y = 270 - this.scrollY;
    });

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

  private renderAchievements(): void {
    const { width } = this.cameras.main;
    const achievements =
      this.selectedCategory === 'all'
        ? this.achievementsManager.getAllAchievements()
        : this.achievementsManager.getAchievementsByCategory(this.selectedCategory);

    // Sort: unlocked first
    achievements.sort((a, b) => {
      if (a.unlocked && !b.unlocked) return -1;
      if (!a.unlocked && b.unlocked) return 1;
      return 0;
    });

    const cardWidth = 850;
    const cardHeight = 100;
    const cardSpacing = 15;
    const startX = (width - cardWidth) / 2;

    achievements.forEach((achievement, index) => {
      const y = index * (cardHeight + cardSpacing);
      this.createAchievementCard(achievement, startX, y, cardWidth, cardHeight);
    });

    this.maxScrollY = Math.max(0, achievements.length * (cardHeight + cardSpacing) - 600);
  }

  private createAchievementCard(
    achievement: Achievement,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const container = this.add.container(x, y);
    this.scrollContainer.add(container);

    const isUnlocked = achievement.unlocked;
    const alpha = isUnlocked ? 1 : 0.5;

    // Background
    const bg = this.add.rectangle(0, 0, width, height, isUnlocked ? 0x1a2a3a : 0x1a1a2e, 1).setOrigin(0);
    bg.setStrokeStyle(2, isUnlocked ? 0x3a5a7a : 0x2a2a3e);
    container.add(bg);

    // Icon
    const icon = this.add
      .text(50, height / 2, achievement.icon, {
        fontSize: '54px',
      })
      .setOrigin(0.5)
      .setAlpha(alpha);
    container.add(icon);

    // Name
    const name = this.add
      .text(110, 25, achievement.name, {
        fontSize: '22px',
        fontFamily: 'Arial, sans-serif',
        color: isUnlocked ? '#ffd700' : '#666677',
        fontStyle: 'bold',
      })
      .setOrigin(0);
    container.add(name);

    // Description
    const desc = this.add
      .text(110, 52, achievement.description, {
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        color: isUnlocked ? '#9fb2c9' : '#555566',
      })
      .setOrigin(0);
    container.add(desc);

    // Progress bar for incomplete achievements
    if (!isUnlocked && achievement.progress > 0) {
      const progressBarWidth = 200;
      const progressBarHeight = 12;
      const progressX = width - progressBarWidth - 20;
      const progressY = height - 25;

      const progressBg = this.add
        .rectangle(progressX, progressY, progressBarWidth, progressBarHeight, 0x2a2a3e, 1)
        .setOrigin(0);
      container.add(progressBg);

      const progressPercent = Math.min(achievement.progress / achievement.requirement, 1);
      const progressFill = this.add
        .rectangle(progressX, progressY, progressBarWidth * progressPercent, progressBarHeight, 0x4a7ca5, 1)
        .setOrigin(0);
      container.add(progressFill);

      const progressText = this.add
        .text(progressX + progressBarWidth / 2, progressY + progressBarHeight / 2, `${achievement.progress} / ${achievement.requirement}`, {
          fontSize: '11px',
          fontFamily: 'Arial, sans-serif',
          color: '#ffffff',
        })
        .setOrigin(0.5);
      container.add(progressText);
    }

    // Unlock date for unlocked achievements
    if (isUnlocked && achievement.unlockedAt) {
      const date = new Date(achievement.unlockedAt);
      const dateStr = date.toLocaleDateString();
      const dateText = this.add
        .text(width - 20, height / 2, `Unlocked: ${dateStr}`, {
          fontSize: '14px',
          fontFamily: 'Arial, sans-serif',
          color: '#7a9ab9',
        })
        .setOrigin(1, 0.5);
      container.add(dateText);
    }

    // Lock icon for locked achievements
    if (!isUnlocked) {
      const lock = this.add
        .text(width - 30, height / 2, '🔒', {
          fontSize: '32px',
        })
        .setOrigin(0.5);
      container.add(lock);
    }
  }
}
