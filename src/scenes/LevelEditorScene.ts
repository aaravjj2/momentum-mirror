import Phaser from 'phaser';
import { SCENES, RENDER, SurfaceType, SURFACE_COLORS } from '../config';
import { CustomLevelsManager } from '../editor/CustomLevelsManager';
import { LevelDefinition, WallDefinition, PhaseWallDefinition, Vec2 } from '../types';

type Tool = 'player' | 'goal' | 'wall' | 'phase' | 'select' | 'delete';

export class LevelEditorScene extends Phaser.Scene {
  private customLevelsManager!: CustomLevelsManager;
  private currentTool: Tool = 'player';
  private currentSurfaceType: SurfaceType = SurfaceType.STANDARD;
  
  // Level data
  private playerStart: Vec2 | null = null;
  private goalPosition: Vec2 | null = null;
  private walls: WallDefinition[] = [];
  private phaseWalls: PhaseWallDefinition[] = [];
  
  // Drawing state
  private isDrawing: boolean = false;
  private drawStartPos: Vec2 | null = null;
  private previewGraphics!: Phaser.GameObjects.Graphics;
  
  // UI elements
  private toolButtons: Map<Tool, Phaser.GameObjects.Container> = new Map();
  private surfaceButtons: Map<SurfaceType, Phaser.GameObjects.Container> = new Map();
  
  // Selected object
  private selectedWallIndex: number = -1;
  
  // Level info
  private levelName: string = 'Untitled Level';
  private levelDescription: string = '';
  private author: string = 'Anonymous';

  constructor() {
    super({ key: SCENES.LEVEL_EDITOR });
  }

  create(): void {
    this.customLevelsManager = CustomLevelsManager.getInstance();

    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(0, 0, width, height, 0x0a0a1a, 1).setOrigin(0);

    // Grid
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x1a1a2e, 0.3);
    for (let x = 0; x < width; x += 100) {
      grid.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 100) {
      grid.lineBetween(0, y, width, y);
    }

    // Title
    this.add
      .text(width / 2, 30, '🛠️ LEVEL EDITOR', {
        fontSize: '36px',
        fontFamily: 'Arial, sans-serif',
        color: '#00ffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Preview graphics
    this.previewGraphics = this.add.graphics();

    // Create toolbar
    this.createToolbar();

    // Create surface type selector
    this.createSurfaceSelector();

    // Create action buttons
    this.createActionButtons();

    // Handle mouse input
    this.input.on('pointerdown', this.onPointerDown, this);
    this.input.on('pointermove', this.onPointerMove, this);
    this.input.on('pointerup', this.onPointerUp, this);

    // Instructions
    this.add
      .text(width / 2, height - 20, 'Click to place objects • Drag to create walls • Right-click on objects to delete', {
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
        color: '#6a7a8a',
      })
      .setOrigin(0.5);
  }

  private createToolbar(): void {
    const tools: Array<{ tool: Tool; icon: string; label: string; color: number }> = [
      { tool: 'player', icon: '⚪', label: 'Player', color: 0x00ffff },
      { tool: 'goal', icon: '⭐', label: 'Goal', color: 0xffd700 },
      { tool: 'wall', icon: '▬', label: 'Wall', color: 0x4a90d9 },
      { tool: 'phase', icon: '◈', label: 'Phase', color: 0x9b59b6 },
      { tool: 'select', icon: '☝', label: 'Select', color: 0x2ecc71 },
      { tool: 'delete', icon: '🗑', label: 'Delete', color: 0xe74c3c },
    ];

    const startX = 20;
    const startY = 80;
    const buttonSize = 80;
    const spacing = 10;

    tools.forEach((toolData, index) => {
      const y = startY + index * (buttonSize + spacing);
      const container = this.createToolButton(startX, y, buttonSize, toolData);
      this.toolButtons.set(toolData.tool, container);
    });
  }

  private createToolButton(
    x: number,
    y: number,
    size: number,
    toolData: { tool: Tool; icon: string; label: string; color: number }
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const isSelected = this.currentTool === toolData.tool;
    const bg = this.add.rectangle(0, 0, size, size, isSelected ? toolData.color : 0x1a1a2e, 1);
    bg.setStrokeStyle(2, isSelected ? 0xffffff : toolData.color, isSelected ? 1 : 0.6);
    container.add(bg);

    const icon = this.add
      .text(0, -10, toolData.icon, {
        fontSize: '32px',
      })
      .setOrigin(0.5);
    container.add(icon);

    const label = this.add
      .text(0, 20, toolData.label, {
        fontSize: '12px',
        fontFamily: 'Arial, sans-serif',
        color: isSelected ? '#ffffff' : '#9fb2c9',
      })
      .setOrigin(0.5);
    container.add(label);

    // Interactive
    const hitArea = this.add
      .rectangle(0, 0, size, size, 0x000000, 0)
      .setInteractive({ useHandCursor: true });
    container.add(hitArea);

    hitArea.on('pointerdown', () => {
      this.currentTool = toolData.tool;
      this.refreshToolbar();
    });

    return container;
  }

  private refreshToolbar(): void {
    this.toolButtons.forEach((container, tool) => {
      const isSelected = this.currentTool === tool;
      const bg = container.getAt(0) as Phaser.GameObjects.Rectangle;
      const label = container.getAt(2) as Phaser.GameObjects.Text;

      const toolData = Array.from(this.toolButtons.entries()).find(([t]) => t === tool);
      if (toolData) {
        const color = [
          { tool: 'player' as Tool, color: 0x00ffff },
          { tool: 'goal' as Tool, color: 0xffd700 },
          { tool: 'wall' as Tool, color: 0x4a90d9 },
          { tool: 'phase' as Tool, color: 0x9b59b6 },
          { tool: 'select' as Tool, color: 0x2ecc71 },
          { tool: 'delete' as Tool, color: 0xe74c3c },
        ].find((t) => t.tool === tool)?.color || 0x1a1a2e;

        bg.setFillStyle(isSelected ? color : 0x1a1a2e);
        bg.setStrokeStyle(2, isSelected ? 0xffffff : color, isSelected ? 1 : 0.6);
        label.setColor(isSelected ? '#ffffff' : '#9fb2c9');
      }
    });
  }

  private createSurfaceSelector(): void {
    const surfaces: SurfaceType[] = [
      SurfaceType.STANDARD,
      SurfaceType.SPRING,
      SurfaceType.CUSHION,
      SurfaceType.CURVED,
    ];

    const startX = RENDER.WIDTH - 20;
    const startY = 80;
    const buttonSize = 70;
    const spacing = 10;

    const title = this.add
      .text(startX, startY - 30, 'Surface Type', {
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
        color: '#9fb2c9',
      })
      .setOrigin(1, 0.5);

    surfaces.forEach((surface, index) => {
      const y = startY + index * (buttonSize + spacing);
      const container = this.createSurfaceButton(startX, y, buttonSize, surface);
      this.surfaceButtons.set(surface, container);
    });
  }

  private createSurfaceButton(
    x: number,
    y: number,
    size: number,
    surface: SurfaceType
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const isSelected = this.currentSurfaceType === surface;
    const color = SURFACE_COLORS[surface];

    const bg = this.add.rectangle(0, 0, size, size, isSelected ? color : 0x1a1a2e, 1).setOrigin(1, 0.5);
    bg.setStrokeStyle(2, color, isSelected ? 1 : 0.6);
    container.add(bg);

    const label = this.add
      .text(-size / 2, 0, surface.toUpperCase(), {
        fontSize: '11px',
        fontFamily: 'Arial, sans-serif',
        color: isSelected ? '#000000' : '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    container.add(label);

    const hitArea = this.add
      .rectangle(0, 0, size, size, 0x000000, 0)
      .setOrigin(1, 0.5)
      .setInteractive({ useHandCursor: true });
    container.add(hitArea);

    hitArea.on('pointerdown', () => {
      this.currentSurfaceType = surface;
      this.refreshSurfaceSelector();
    });

    return container;
  }

  private refreshSurfaceSelector(): void {
    this.surfaceButtons.forEach((container, surface) => {
      const isSelected = this.currentSurfaceType === surface;
      const color = SURFACE_COLORS[surface];

      const bg = container.getAt(0) as Phaser.GameObjects.Rectangle;
      const label = container.getAt(1) as Phaser.GameObjects.Text;

      bg.setFillStyle(isSelected ? color : 0x1a1a2e);
      bg.setStrokeStyle(2, color, isSelected ? 1 : 0.6);
      label.setColor(isSelected ? '#000000' : '#ffffff');
    });
  }

  private createActionButtons(): void {
    const { width, height } = this.cameras.main;
    const buttonY = height - 70;

    // Clear
    this.createButton(width / 2 - 280, buttonY, 'CLEAR', 0xe74c3c, () => {
      this.clearLevel();
    });

    // Test
    this.createButton(width / 2 - 140, buttonY, 'TEST', 0xf39c12, () => {
      this.testLevel();
    });

    // Save
    this.createButton(width / 2, buttonY, 'SAVE', 0x2ecc71, () => {
      this.saveLevel();
    });

    // Load
    this.createButton(width / 2 + 140, buttonY, 'LOAD', 0x3498db, () => {
      this.scene.start(SCENES.CUSTOM_LEVELS);
    });

    // Back
    this.createButton(width / 2 + 280, buttonY, 'BACK', 0x95a5a6, () => {
      this.scene.start(SCENES.MENU);
    });
  }

  private createButton(x: number, y: number, text: string, color: number, onClick: () => void): void {
    const width = 120;
    const height = 40;

    const bg = this.add.rectangle(x, y, width, height, color, 0.2);
    bg.setStrokeStyle(2, color, 0.8);
    bg.setInteractive({ useHandCursor: true });

    const label = this.add
      .text(x, y, text, {
        fontSize: '16px',
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

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    // Ignore if clicking on UI
    if (pointer.x < 120 || pointer.x > RENDER.WIDTH - 120 || pointer.y < 70 || pointer.y > RENDER.HEIGHT - 100) {
      return;
    }

    const pos = { x: pointer.x, y: pointer.y };

    switch (this.currentTool) {
      case 'player':
        this.playerStart = { ...pos };
        this.render();
        break;

      case 'goal':
        this.goalPosition = { ...pos };
        this.render();
        break;

      case 'wall':
      case 'phase':
        this.isDrawing = true;
        this.drawStartPos = { ...pos };
        break;

      case 'delete':
        this.deleteAt(pos);
        break;

      case 'select':
        this.selectAt(pos);
        break;
    }
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.isDrawing || !this.drawStartPos) return;

    // Show preview
    this.previewGraphics.clear();
    const width = pointer.x - this.drawStartPos.x;
    const height = pointer.y - this.drawStartPos.y;
    const color = this.currentTool === 'phase' ? 0x9b59b6 : SURFACE_COLORS[this.currentSurfaceType];

    this.previewGraphics.lineStyle(2, color, 0.8);
    this.previewGraphics.strokeRect(this.drawStartPos.x, this.drawStartPos.y, width, height);
    this.previewGraphics.fillStyle(color, 0.2);
    this.previewGraphics.fillRect(this.drawStartPos.x, this.drawStartPos.y, width, height);
  }

  private onPointerUp(pointer: Phaser.Input.Pointer): void {
    if (!this.isDrawing || !this.drawStartPos) return;

    const width = Math.abs(pointer.x - this.drawStartPos.x);
    const height = Math.abs(pointer.y - this.drawStartPos.y);

    if (width > 10 && height > 10) {
      const x = Math.min(this.drawStartPos.x, pointer.x) + width / 2;
      const y = Math.min(this.drawStartPos.y, pointer.y) + height / 2;

      if (this.currentTool === 'wall') {
        this.walls.push({
          x,
          y,
          width,
          height,
          angle: 0,
          surfaceType: this.currentSurfaceType,
        });
      } else if (this.currentTool === 'phase') {
        this.phaseWalls.push({
          x,
          y,
          width,
          height,
          angle: 0,
          period: 3.0,
          phaseOffset: 0,
          onDuration: 1.5,
          surfaceType: SurfaceType.PHASE,
        });
      }

      this.render();
    }

    this.isDrawing = false;
    this.drawStartPos = null;
    this.previewGraphics.clear();
  }

  private deleteAt(pos: Vec2): void {
    // Check walls
    for (let i = this.walls.length - 1; i >= 0; i--) {
      const wall = this.walls[i];
      if (
        pos.x >= wall.x - wall.width / 2 &&
        pos.x <= wall.x + wall.width / 2 &&
        pos.y >= wall.y - wall.height / 2 &&
        pos.y <= wall.y + wall.height / 2
      ) {
        this.walls.splice(i, 1);
        this.render();
        return;
      }
    }

    // Check phase walls
    for (let i = this.phaseWalls.length - 1; i >= 0; i--) {
      const wall = this.phaseWalls[i];
      if (
        pos.x >= wall.x - wall.width / 2 &&
        pos.x <= wall.x + wall.width / 2 &&
        pos.y >= wall.y - wall.height / 2 &&
        pos.y <= wall.y + wall.height / 2
      ) {
        this.phaseWalls.splice(i, 1);
        this.render();
        return;
      }
    }

    // Check player
    if (this.playerStart && Math.hypot(pos.x - this.playerStart.x, pos.y - this.playerStart.y) < 30) {
      this.playerStart = null;
      this.render();
      return;
    }

    // Check goal
    if (this.goalPosition && Math.hypot(pos.x - this.goalPosition.x, pos.y - this.goalPosition.y) < 30) {
      this.goalPosition = null;
      this.render();
    }
  }

  private selectAt(pos: Vec2): void {
    // For now, just highlight selection
    // Can be extended to show properties panel
    this.selectedWallIndex = -1;

    for (let i = 0; i < this.walls.length; i++) {
      const wall = this.walls[i];
      if (
        pos.x >= wall.x - wall.width / 2 &&
        pos.x <= wall.x + wall.width / 2 &&
        pos.y >= wall.y - wall.height / 2 &&
        pos.y <= wall.y + wall.height / 2
      ) {
        this.selectedWallIndex = i;
        this.render();
        return;
      }
    }

    this.render();
  }

  private render(): void {
    // Clear existing graphics
    this.children.each((child) => {
      if (child.getData('editorObject')) {
        child.destroy();
      }
    });

    // Render walls
    this.walls.forEach((wall, index) => {
      const color = SURFACE_COLORS[wall.surfaceType];
      const isSelected = index === this.selectedWallIndex;

      const graphics = this.add.graphics();
      graphics.setData('editorObject', true);

      graphics.fillStyle(color, 0.3);
      graphics.fillRect(wall.x - wall.width / 2, wall.y - wall.height / 2, wall.width, wall.height);

      graphics.lineStyle(isSelected ? 3 : 2, isSelected ? 0xffffff : color, isSelected ? 1 : 0.8);
      graphics.strokeRect(wall.x - wall.width / 2, wall.y - wall.height / 2, wall.width, wall.height);
    });

    // Render phase walls
    this.phaseWalls.forEach((wall) => {
      const graphics = this.add.graphics();
      graphics.setData('editorObject', true);

      graphics.fillStyle(0x9b59b6, 0.3);
      graphics.fillRect(wall.x - wall.width / 2, wall.y - wall.height / 2, wall.width, wall.height);

      graphics.lineStyle(2, 0x9b59b6, 0.8);
      graphics.strokeRect(wall.x - wall.width / 2, wall.y - wall.height / 2, wall.width, wall.height);

      // Draw period indicator
      const label = this.add
        .text(wall.x, wall.y, `P:${wall.period}s`, {
          fontSize: '12px',
          fontFamily: 'Arial, sans-serif',
          color: '#ffffff',
        })
        .setOrigin(0.5);
      label.setData('editorObject', true);
    });

    // Render player start
    if (this.playerStart) {
      const circle = this.add.circle(this.playerStart.x, this.playerStart.y, 16, 0x00ffff, 0.5);
      circle.setStrokeStyle(2, 0x00ffff);
      circle.setData('editorObject', true);

      const label = this.add
        .text(this.playerStart.x, this.playerStart.y - 30, 'PLAYER', {
          fontSize: '12px',
          fontFamily: 'Arial, sans-serif',
          color: '#00ffff',
        })
        .setOrigin(0.5);
      label.setData('editorObject', true);
    }

    // Render goal
    if (this.goalPosition) {
      const circle = this.add.circle(this.goalPosition.x, this.goalPosition.y, 24, 0xffd700, 0.5);
      circle.setStrokeStyle(2, 0xffd700);
      circle.setData('editorObject', true);

      const label = this.add
        .text(this.goalPosition.x, this.goalPosition.y - 40, 'GOAL', {
          fontSize: '12px',
          fontFamily: 'Arial, sans-serif',
          color: '#ffd700',
        })
        .setOrigin(0.5);
      label.setData('editorObject', true);
    }
  }

  private clearLevel(): void {
    this.playerStart = null;
    this.goalPosition = null;
    this.walls = [];
    this.phaseWalls = [];
    this.selectedWallIndex = -1;
    this.render();
  }

  private testLevel(): void {
    const levelDef = this.buildLevelDefinition();
    const validation = this.customLevelsManager.validateLevel(levelDef);

    if (!validation.valid) {
      alert(`Cannot test level:\n${validation.errors.join('\n')}`);
      return;
    }

    // Store level for testing
    this.registry.set('editorTestLevel', levelDef);
    this.scene.start(SCENES.GAME, { levelId: -1, isTestLevel: true });
  }

  private saveLevel(): void {
    const levelDef = this.buildLevelDefinition();
    const validation = this.customLevelsManager.validateLevel(levelDef);

    if (!validation.valid) {
      alert(`Cannot save level:\n${validation.errors.join('\n')}`);
      return;
    }

    // Prompt for level info
    const name = prompt('Level Name:', this.levelName) || this.levelName;
    const description = prompt('Level Description:', this.levelDescription) || this.levelDescription;
    const author = prompt('Author Name:', this.author) || this.author;

    const id = this.customLevelsManager.createLevel(name, author, description, levelDef);

    alert(`Level saved successfully!\nID: ${id}`);
  }

  private buildLevelDefinition(): LevelDefinition {
    return {
      id: -1, // Temporary
      name: this.levelName,
      category: 'custom',
      description: this.levelDescription,
      playerStart: this.playerStart || { x: 100, y: 100 },
      goalPosition: this.goalPosition || { x: 1800, y: 500 },
      walls: this.walls,
      phaseWalls: this.phaseWalls.length > 0 ? this.phaseWalls : undefined,
      optimalSwipes: 3,
      par: {
        efficiency: 0.7,
        conservation: 0.7,
        rhythm: 0.7,
        inputDensity: 0.7,
      },
    };
  }

  update(): void {
    // Render continuously to show preview
  }
}
