import Phaser from 'phaser';
import { SCENES, RENDER } from '../config';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.BOOT });
  }

  create(): void {
    // No external assets needed — everything is drawn procedurally
    // Show a brief loading animation then proceed to menu

    const cx = RENDER.WIDTH / 2;
    const cy = RENDER.HEIGHT / 2;

    // Logo text
    const title = this.add.text(cx, cy - 40, 'MOMENTUM MIRROR', {
      fontFamily: '"Segoe UI", Arial, sans-serif',
      fontSize: '48px',
      color: '#00ffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0);

    const sub = this.add.text(cx, cy + 20, 'Loading...', {
      fontFamily: '"Segoe UI", Arial, sans-serif',
      fontSize: '20px',
      color: '#4a90d9',
    }).setOrigin(0.5).setAlpha(0);

    // Animated loading bar
    const barBg = this.add.graphics();
    barBg.fillStyle(0x1a1a3a, 1);
    barBg.fillRoundedRect(cx - 150, cy + 60, 300, 8, 4);

    const bar = this.add.graphics();
    let progress = 0;

    this.tweens.add({
      targets: title,
      alpha: 1,
      y: cy - 50,
      duration: 600,
      ease: 'Back.easeOut',
    });

    this.tweens.add({
      targets: sub,
      alpha: 1,
      duration: 400,
      delay: 300,
    });

    // Animate loading bar
    this.time.addEvent({
      delay: 20,
      repeat: 50,
      callback: () => {
        progress += 2;
        bar.clear();
        bar.fillStyle(0x00ffff, 1);
        bar.fillRoundedRect(cx - 150, cy + 60, progress * 3, 8, 4);
      },
    });

    // Transition to menu
    this.time.delayedCall(1500, () => {
      this.tweens.add({
        targets: [title, sub, bar, barBg],
        alpha: 0,
        duration: 400,
        onComplete: () => {
          this.scene.start(SCENES.MENU);
        },
      });
    });
  }
}
