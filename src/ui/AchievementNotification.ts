import Phaser from 'phaser';
import { Achievement } from '../achievements/AchievementsManager';

export class AchievementNotification {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container | null = null;
  private queue: Achievement[] = [];
  private isShowing: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  show(achievement: Achievement): void {
    this.queue.push(achievement);
    if (!this.isShowing) {
      this.showNext();
    }
  }

  private showNext(): void {
    if (this.queue.length === 0) {
      this.isShowing = false;
      return;
    }

    this.isShowing = true;
    const achievement = this.queue.shift()!;
    this.displayNotification(achievement);
  }

  private displayNotification(achievement: Achievement): void {
    const { width, height } = this.scene.cameras.main;

    this.container = this.scene.add.container(width / 2, -150);
    this.container.setDepth(10000); // Very high depth to appear above everything

    // Background
    const bgWidth = 500;
    const bgHeight = 120;
    const bg = this.scene.add.rectangle(0, 0, bgWidth, bgHeight, 0x1a2a3a, 0.95);
    bg.setStrokeStyle(3, 0xffd700);
    this.container.add(bg);

    // Glow effect
    const glow = this.scene.add.rectangle(0, 0, bgWidth + 10, bgHeight + 10, 0xffd700, 0.2);
    this.container.add(glow);
    this.container.sendToBack(glow);

    // Achievement unlocked text
    const title = this.scene.add.text(0, -35, '🏆 ACHIEVEMENT UNLOCKED!', {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffd700',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(title);

    // Icon
    const icon = this.scene.add.text(-200, 15, achievement.icon, {
      fontSize: '48px',
    }).setOrigin(0.5);
    this.container.add(icon);

    // Achievement name
    const name = this.scene.add.text(-140, 0, achievement.name, {
      fontSize: '22px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);
    this.container.add(name);

    // Achievement description
    const desc = this.scene.add.text(-140, 25, achievement.description, {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#9fb2c9',
    }).setOrigin(0, 0.5);
    this.container.add(desc);

    // Animations
    // Slide in from top
    this.scene.tweens.add({
      targets: this.container,
      y: 150,
      duration: 500,
      ease: 'Back.easeOut',
    });

    // Pulse glow
    this.scene.tweens.add({
      targets: glow,
      alpha: 0.4,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Slide out and destroy after delay
    this.scene.time.delayedCall(4000, () => {
      if (this.container) {
        this.scene.tweens.add({
          targets: this.container,
          y: -150,
          alpha: 0,
          duration: 400,
          ease: 'Back.easeIn',
          onComplete: () => {
            if (this.container) {
              this.container.destroy();
              this.container = null;
            }
            this.showNext();
          },
        });
      }
    });

    // Play sound (if audio manager exists)
    try {
      const audioManager = (this.scene.game.registry.get('audioManager') as any);
      if (audioManager && audioManager.playGoal) {
        audioManager.playGoal();
      }
    } catch (e) {
      // Audio manager not available, that's okay
    }
  }

  destroy(): void {
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
    this.queue = [];
    this.isShowing = false;
  }
}
