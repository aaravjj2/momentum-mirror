import Phaser from 'phaser';
import { SCENES, RENDER } from '../config';
import { getAudioManager } from '../audio/AudioManager';

export class MenuScene extends Phaser.Scene {
  private floatingBalls: Array<{
    gfx: Phaser.GameObjects.Arc;
    vx: number;
    vy: number;
  }> = [];

  constructor() {
    super({ key: SCENES.MENU });
  }

  create(): void {
    this.floatingBalls = [];
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

    // Floating background balls
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * RENDER.WIDTH;
      const y = Math.random() * RENDER.HEIGHT;
      const r = 5 + Math.random() * 15;
      const colors = [0x00ffff, 0x4a90d9, 0x2ecc71, 0xf1c40f, 0x9b59b6];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const ball = this.add.circle(x, y, r, color, 0.15).setDepth(1);
      this.floatingBalls.push({
        gfx: ball,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
      });
    }

    // Title
    const title = this.add.text(cx, cy - 180, 'MOMENTUM', {
      fontFamily: '"Segoe UI", Arial, sans-serif',
      fontSize: '72px',
      color: '#00ffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(10);

    const subtitle = this.add.text(cx, cy - 110, 'MIRROR', {
      fontFamily: '"Segoe UI", Arial, sans-serif',
      fontSize: '64px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(10);

    // Tagline
    this.add.text(cx, cy - 50, 'Physics-Based Ricochet  •  Measurable Mastery', {
      fontFamily: '"Segoe UI", Arial, sans-serif',
      fontSize: '18px',
      color: '#6a7a8a',
    }).setOrigin(0.5).setDepth(10);

    // Decorative line
    const line = this.add.graphics().setDepth(10);
    line.lineStyle(2, 0x00ffff, 0.4);
    line.beginPath();
    line.moveTo(cx - 200, cy - 30);
    line.lineTo(cx + 200, cy - 30);
    line.strokePath();

    // Play button
    const playBtn = this.createButton(cx, cy + 50, '▶  PLAY', 0x00ffff, () => {
      getAudioManager().playClick();
      this.scene.start(SCENES.LEVEL_SELECT);
    });

    // Leaderboard button
    const leaderboardBtn = this.createButton(cx, cy + 130, '🏆  LEADERBOARD', 0xf1c40f, () => {
      getAudioManager().playClick();
      this.scene.start(SCENES.LEADERBOARD);
    });

    // Achievements button
    const achievementsBtn = this.createButton(cx - 220, cy + 210, '🏅  ACHIEVEMENTS', 0xe67e22, () => {
      getAudioManager().playClick();
      this.scene.start(SCENES.ACHIEVEMENTS);
    });

    // Statistics button
    const statisticsBtn = this.createButton(cx + 220, cy + 210, '📊  STATISTICS', 0x3498db, () => {
      getAudioManager().playClick();
      this.scene.start(SCENES.STATISTICS);
    });

    // Level Editor button
    const editorBtn = this.createButton(cx - 220, cy + 290, '✏️  LEVEL EDITOR', 0x9b59b6, () => {
      getAudioManager().playClick();
      this.scene.start(SCENES.LEVEL_EDITOR);
    });

    // Custom Levels button
    const customBtn = this.createButton(cx + 220, cy + 290, '📁  CUSTOM LEVELS', 0xe67e22, () => {
      getAudioManager().playClick();
      this.scene.start(SCENES.CUSTOM_LEVELS);
    });

    // How to play
    const howBtn = this.createButton(cx, cy + 370, '?  HOW TO PLAY', 0x4a90d9, () => {
      this.showHowToPlay();
    });

    // Audio controls
    const audioManager = getAudioManager();
    
    // Start background music
    audioManager.resume().then(() => {
      audioManager.startMusic();
    });

    // Music toggle button
    const musicIcon = () => audioManager.isMusicMuted() ? '🔇' : '🎵';
    const musicBtn = this.createButton(RENDER.WIDTH - 190, RENDER.HEIGHT - 70, `${musicIcon()}  MUSIC`, 0x9b59b6, () => {
      audioManager.toggleMusic();
      const newIcon = musicIcon();
      const label = musicBtn.getAt(1) as Phaser.GameObjects.Text;
      label.setText(`${newIcon}  MUSIC`);
      audioManager.playClick();
    });

    // SFX toggle button
    const sfxIcon = () => audioManager.isMuted() ? '🔈' : '🔊';
    const sfxBtn = this.createButton(RENDER.WIDTH - 190, RENDER.HEIGHT - 140, `${sfxIcon()}  SOUNDS`, 0x2ecc71, () => {
      audioManager.toggleMute();
      const newIcon = sfxIcon();
      const label = sfxBtn.getAt(1) as Phaser.GameObjects.Text;
      label.setText(`${newIcon}  SOUNDS`);
      audioManager.playClick();
    });

    // Entrance animations
    title.setAlpha(0).setY(cy - 200);
    subtitle.setAlpha(0).setY(cy - 130);

    this.tweens.add({
      targets: title,
      alpha: 1,
      y: cy - 180,
      duration: 800,
      ease: 'Back.easeOut',
    });

    this.tweens.add({
      targets: subtitle,
      alpha: 1,
      y: cy - 110,
      duration: 800,
      delay: 200,
      ease: 'Back.easeOut',
    });

    // Title glow pulse
    this.tweens.add({
      targets: title,
      alpha: 0.8,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Version
    this.add.text(RENDER.WIDTH - 20, RENDER.HEIGHT - 20, 'v1.0', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#333355',
    }).setOrigin(1, 1).setDepth(10);
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

  private showHowToPlay(): void {
    const overlay = this.add.graphics().setDepth(100);
    overlay.fillStyle(0x000000, 0.8);
    overlay.fillRect(0, 0, RENDER.WIDTH, RENDER.HEIGHT);

    const cx = RENDER.WIDTH / 2;
    const cy = RENDER.HEIGHT / 2;

    // Panel
    const panel = this.add.graphics().setDepth(101);
    panel.fillStyle(0x0a0a2a, 1);
    panel.fillRoundedRect(cx - 350, cy - 280, 700, 560, 20);
    panel.lineStyle(2, 0x00ffff, 0.5);
    panel.strokeRoundedRect(cx - 350, cy - 280, 700, 560, 20);

    const title = this.add.text(cx, cy - 240, 'HOW TO PLAY', {
      fontFamily: '"Segoe UI", Arial, sans-serif',
      fontSize: '32px',
      color: '#00ffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(102);

    const instructions = [
      '🎯  Swipe (or click+drag) to launch the ball',
      '      The ball moves OPPOSITE to your swipe direction',
      '',
      '⏱️  Longer swipes = more power',
      '      Control your impulse strength carefully',
      '',
      '🟢  Green walls (Spring) amplify your momentum',
      '🔴  Red walls (Cushion) absorb momentum',
      '🟡  Orange walls (Curved) deflect your angle',
      '🟣  Purple walls (Phase) appear and disappear',
      '',
      '📊  Four skills are measured:',
      '      Efficiency • Conservation • Rhythm • Economy',
      '',
      '⭐  Get the ball to the golden goal!',
    ];

    const instText = this.add.text(cx, cy - 180, instructions.join('\n'), {
      fontFamily: '"Segoe UI", Arial, sans-serif',
      fontSize: '18px',
      color: '#cccccc',
      lineSpacing: 4,
    }).setOrigin(0.5, 0).setDepth(102);

    const closeBtn = this.add.text(cx, cy + 230, '✕  CLOSE', {
      fontFamily: '"Segoe UI", Arial, sans-serif',
      fontSize: '22px',
      color: '#ff6b6b',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(102).setInteractive({ useHandCursor: true });

    const allElements = [overlay, panel, title, instText, closeBtn];

    closeBtn.on('pointerdown', () => {
      allElements.forEach((el) => el.destroy());
    });

    closeBtn.on('pointerover', () => closeBtn.setColor('#ff9999'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#ff6b6b'));
  }

  update(): void {
    for (const ball of this.floatingBalls) {
      ball.gfx.x += ball.vx;
      ball.gfx.y += ball.vy;

      if (ball.gfx.x < 0 || ball.gfx.x > RENDER.WIDTH) ball.vx *= -1;
      if (ball.gfx.y < 0 || ball.gfx.y > RENDER.HEIGHT) ball.vy *= -1;
    }
  }
}
