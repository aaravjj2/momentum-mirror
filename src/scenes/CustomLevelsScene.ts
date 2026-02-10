import Phaser from 'phaser';
import { SCENES, RENDER } from '../config';
import { CustomLevelsManager, CustomLevel } from '../editor/CustomLevelsManager';

export class CustomLevelsScene extends Phaser.Scene {
  private customLevelsManager!: CustomLevelsManager;
  private customLevels: CustomLevel[] = [];
  private scrollY: number = 0;
  private maxScroll: number = 0;
  private cardHeight: number = 140;
  private cardSpacing: number = 20;
  private contentContainer!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: SCENES.CUSTOM_LEVELS });
  }

  create(): void {
    this.customLevelsManager = CustomLevelsManager.getInstance();
    this.customLevels = this.customLevelsManager.getAllLevels();

    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(0, 0, width, height, 0x0a0a1a, 1).setOrigin(0);

    // Grid background
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x1a1a2e, 0.3);
    for (let x = 0; x < width; x += 100) {
      grid.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 100) {
      grid.lineBetween(0, y, width, y);
    }

    // Title bar
    const titleBg = this.add.rectangle(0, 0, width, 100, 0x1a1a2e, 0.9).setOrigin(0);

    this.add
      .text(width / 2, 50, '📁 CUSTOM LEVELS', {
        fontSize: '36px',
        fontFamily: 'Arial, sans-serif',
        color: '#00ffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Level count
    this.add
      .text(width / 2, 85, `${this.customLevels.length} custom levels`, {
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
        color: '#6a7a8a',
      })
      .setOrigin(0.5);

    // Content container
    this.contentContainer = this.add.container(0, 120);

    // Render levels
    this.renderLevels();

    // Action buttons
    this.createActionButtons();

    // Scroll handling
    this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number) => {
      this.scrollY += deltaY * 0.5;
      this.scrollY = Phaser.Math.Clamp(this.scrollY, 0, this.maxScroll);
      this.contentContainer.y = 120 - this.scrollY;
    });

    // Back button
    this.createBackButton();
  }

  private renderLevels(): void {
    if (this.customLevels.length === 0) {
      // Empty state
      const emptyText = this.add
        .text(RENDER.WIDTH / 2, 300, '📦 No custom levels yet\n\nCreate your first level in the Level Editor!', {
          fontSize: '24px',
          fontFamily: 'Arial, sans-serif',
          color: '#6a7a8a',
          align: 'center',
        })
        .setOrigin(0.5);
      this.contentContainer.add(emptyText);
      return;
    }

    const startY = 20;
    const cardWidth = RENDER.WIDTH - 200;
    const startX = (RENDER.WIDTH - cardWidth) / 2;

    this.customLevels.forEach((level, index) => {
      const y = startY + index * (this.cardHeight + this.cardSpacing);
      const card = this.createLevelCard(startX, y, cardWidth, level);
      this.contentContainer.add(card);
    });

    // Calculate max scroll
    const totalHeight = this.customLevels.length * (this.cardHeight + this.cardSpacing);
    this.maxScroll = Math.max(0, totalHeight - (RENDER.HEIGHT - 220));
  }

  private createLevelCard(x: number, y: number, width: number, level: CustomLevel): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // Background
    const bg = this.add.rectangle(0, 0, width, this.cardHeight, 0x1a1a2e, 0.8).setOrigin(0);
    bg.setStrokeStyle(2, 0x2a3a4e, 0.8);
    container.add(bg);

    // Title
    const title = this.add
      .text(20, 15, level.name, {
        fontSize: '22px',
        fontFamily: 'Arial, sans-serif',
        color: '#00ffff',
        fontStyle: 'bold',
      })
      .setOrigin(0);
    container.add(title);

    // Author
    const author = this.add
      .text(20, 45, `by ${level.author}`, {
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
        color: '#9fb2c9',
      })
      .setOrigin(0);
    container.add(author);

    // Description
    if (level.description) {
      const desc = this.add
        .text(20, 68, level.description.substring(0, 80) + (level.description.length > 80 ? '...' : ''), {
          fontSize: '12px',
          fontFamily: 'Arial, sans-serif',
          color: '#6a7a8a',
        })
        .setOrigin(0);
      container.add(desc);
    }

    // Stats
    const stats = this.add
      .text(20, this.cardHeight - 20, `📊 Plays: ${level.plays} • 📅 ${this.formatDate(level.updatedAt)}`, {
        fontSize: '12px',
        fontFamily: 'Arial, sans-serif',
        color: '#6a7a8a',
      })
      .setOrigin(0, 0.5);
    container.add(stats);

    // Level info
    const wallCount = level.definition.walls.length + (level.definition.phaseWalls?.length || 0);
    const info = this.add
      .text(width - 360, 20, `🧱 ${wallCount} walls`, {
        fontSize: '12px',
        fontFamily: 'Arial, sans-serif',
        color: '#9fb2c9',
      })
      .setOrigin(0);
    container.add(info);

    // Buttons
    const playBtn = this.createCardButton(width - 280, this.cardHeight / 2, 'PLAY ▶', 0x2ecc71, () => {
      this.playLevel(level);
    });
    container.add(playBtn);

    const editBtn = this.createCardButton(width - 170, this.cardHeight / 2, 'EDIT ✏', 0xf39c12, () => {
      this.editLevel(level);
    });
    container.add(editBtn);

    const exportBtn = this.createCardButton(width - 20, this.cardHeight / 2 - 35, 'EXPORT', 0x3498db, () => {
      this.exportLevel(level);
    });
    container.add(exportBtn);

    const deleteBtn = this.createCardButton(width - 20, this.cardHeight / 2 + 35, 'DELETE', 0xe74c3c, () => {
      this.deleteLevel(level);
    });
    container.add(deleteBtn);

    return container;
  }

  private createCardButton(
    x: number,
    y: number,
    text: string,
    color: number,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const buttonWidth = text === 'EXPORT' || text === 'DELETE' ? 60 : 90;
    const buttonHeight = text === 'EXPORT' || text === 'DELETE' ? 28 : 36;

    const bg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, color, 0.2).setOrigin(1, 0.5);
    bg.setStrokeStyle(2, color, 0.8);
    bg.setInteractive({ useHandCursor: true });
    container.add(bg);

    const label = this.add
      .text(0, 0, text, {
        fontSize: text === 'EXPORT' || text === 'DELETE' ? '10px' : '14px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(1, 0.5);
    container.add(label);

    bg.on('pointerdown', onClick);

    bg.on('pointerover', () => {
      bg.setFillStyle(color, 0.4);
    });

    bg.on('pointerout', () => {
      bg.setFillStyle(color, 0.2);
    });

    return container;
  }

  private createActionButtons(): void {
    const { width, height } = this.cameras.main;
    const buttonY = height - 50;

    // Import button
    this.createButton(width / 2 - 150, buttonY, 'IMPORT LEVEL', 0x9b59b6, () => {
      this.importLevel();
    });

    // New level button
    this.createButton(width / 2 + 150, buttonY, 'NEW LEVEL', 0x2ecc71, () => {
      this.scene.start(SCENES.LEVEL_EDITOR);
    });
  }

  private createButton(x: number, y: number, text: string, color: number, onClick: () => void): void {
    const width = 180;
    const height = 45;

    const bg = this.add.rectangle(x, y, width, height, color, 0.2);
    bg.setStrokeStyle(3, color, 0.8);
    bg.setInteractive({ useHandCursor: true });

    const label = this.add
      .text(x, y, text, {
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    bg.on('pointerdown', onClick);

    bg.on('pointerover', () => {
      bg.setFillStyle(color, 0.4);
    });

    bg.on('pointerout', () => {
      bg.setFillStyle(color, 0.2);
    });
  }

  private createBackButton(): void {
    const backButton = this.add.rectangle(60, 50, 100, 40, 0x2a3a4e, 0.8);
    backButton.setStrokeStyle(2, 0x4a5a6e, 0.8);
    backButton.setInteractive({ useHandCursor: true });

    const backText = this.add
      .text(60, 50, '← BACK', {
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        color: '#9fb2c9',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    backButton.on('pointerdown', () => {
      this.scene.start(SCENES.MENU);
    });

    backButton.on('pointerover', () => {
      backButton.setFillStyle(0x3a4a5e, 0.9);
      backText.setColor('#ffffff');
    });

    backButton.on('pointerout', () => {
      backButton.setFillStyle(0x2a3a4e, 0.8);
      backText.setColor('#9fb2c9');
    });
  }

  private playLevel(level: CustomLevel): void {
    // Increment play count
    this.customLevelsManager.incrementPlays(level.id);

    // Store level for gameplay
    this.registry.set('customLevelToPlay', level);
    this.scene.start(SCENES.GAME, { levelId: level.definition.id, isCustomLevel: true });
  }

  private editLevel(level: CustomLevel): void {
    // Store level for editing
    this.registry.set('levelToEdit', level);
    this.scene.start(SCENES.LEVEL_EDITOR);
  }

  private exportLevel(level: CustomLevel): void {
    const json = this.customLevelsManager.exportLevel(level.id);

    if (!json) {
      alert('Failed to export level: Level not found');
      return;
    }

    // Try to copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(json)
        .then(() => {
          alert('Level exported to clipboard!\n\nShare this JSON with others so they can import your level.');
        })
        .catch(() => {
          // Fallback: show in prompt
          this.showExportFallback(json);
        });
    } else {
      this.showExportFallback(json);
    }
  }

  private showExportFallback(json: string): void {
    const truncated = json.substring(0, 500) + (json.length > 500 ? '...' : '');
    alert(
      `Level JSON (copy this):\n\n${truncated}\n\nNote: Full JSON is too long for this dialog. ` +
        `Please open browser console and copy the full JSON from there.`
    );
    console.log('=== LEVEL EXPORT ===');
    console.log(json);
    console.log('===================');
  }

  private deleteLevel(level: CustomLevel): void {
    const confirmed = confirm(`Delete level "${level.name}"?\n\nThis action cannot be undone.`);

    if (confirmed) {
      this.customLevelsManager.deleteLevel(level.id);

      // Refresh scene
      this.scene.restart();
    }
  }

  private importLevel(): void {
    const json = prompt('Paste the level JSON here:');

    if (!json) return;

    try {
      const id = this.customLevelsManager.importLevel(json);
      alert(`Level imported successfully!\nID: ${id}`);

      // Refresh scene
      this.scene.restart();
    } catch (error) {
      alert(`Failed to import level:\n\n${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
  }
}
