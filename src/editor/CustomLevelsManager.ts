import { LevelDefinition } from '../types';

export interface CustomLevel {
  id: string;
  name: string;
  author: string;
  description: string;
  category: 'custom';
  createdAt: number;
  updatedAt: number;
  plays: number;
  definition: LevelDefinition;
}

export class CustomLevelsManager {
  private static instance: CustomLevelsManager;
  private customLevels: Map<string, CustomLevel> = new Map();
  private readonly STORAGE_KEY = 'momentum_custom_levels';

  private constructor() {
    this.loadLevels();
  }

  static getInstance(): CustomLevelsManager {
    if (!CustomLevelsManager.instance) {
      CustomLevelsManager.instance = new CustomLevelsManager();
    }
    return CustomLevelsManager.instance;
  }

  private loadLevels(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const levels: CustomLevel[] = JSON.parse(saved);
        levels.forEach((level) => {
          this.customLevels.set(level.id, level);
        });
      } catch (e) {
        console.error('Failed to load custom levels:', e);
      }
    }
  }

  private saveLevels(): void {
    const levels = Array.from(this.customLevels.values());
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(levels));
  }

  createLevel(name: string, author: string, description: string, definition: LevelDefinition): string {
    const id = this.generateId();
    const level: CustomLevel = {
      id,
      name,
      author,
      description,
      category: 'custom',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      plays: 0,
      definition: {
        ...definition,
        id: 1000 + this.customLevels.size, // Custom levels start at ID 1000
        category: 'custom',
      },
    };

    this.customLevels.set(id, level);
    this.saveLevels();
    return id;
  }

  updateLevel(id: string, updates: Partial<Omit<CustomLevel, 'id' | 'createdAt'>>): boolean {
    const level = this.customLevels.get(id);
    if (!level) return false;

    Object.assign(level, {
      ...updates,
      updatedAt: Date.now(),
    });

    this.saveLevels();
    return true;
  }

  deleteLevel(id: string): boolean {
    const existed = this.customLevels.delete(id);
    if (existed) {
      this.saveLevels();
    }
    return existed;
  }

  getLevel(id: string): CustomLevel | undefined {
    return this.customLevels.get(id);
  }

  getAllLevels(): CustomLevel[] {
    return Array.from(this.customLevels.values()).sort(
      (a, b) => b.updatedAt - a.updatedAt
    );
  }

  incrementPlays(id: string): void {
    const level = this.customLevels.get(id);
    if (level) {
      level.plays++;
      this.saveLevels();
    }
  }

  validateLevel(definition: LevelDefinition): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!definition.name || definition.name.trim() === '') {
      errors.push('Level name is required');
    }

    if (!definition.playerStart) {
      errors.push('Player start position is required');
    }

    if (!definition.goalPosition) {
      errors.push('Goal position is required');
    }

    // Check walls exist
    if (!definition.walls || definition.walls.length === 0) {
      errors.push('Level must have at least one wall');
    }

    // Check positions are within bounds
    if (definition.playerStart) {
      if (definition.playerStart.x < 0 || definition.playerStart.x > 1920) {
        errors.push('Player start X position out of bounds');
      }
      if (definition.playerStart.y < 0 || definition.playerStart.y > 1080) {
        errors.push('Player start Y position out of bounds');
      }
    }

    if (definition.goalPosition) {
      if (definition.goalPosition.x < 0 || definition.goalPosition.x > 1920) {
        errors.push('Goal X position out of bounds');
      }
      if (definition.goalPosition.y < 0 || definition.goalPosition.y > 1080) {
        errors.push('Goal Y position out of bounds');
      }
    }

    // Check walls are valid
    if (definition.walls) {
      definition.walls.forEach((wall, index) => {
        if (!wall.x || !wall.y) {
          errors.push(`Wall ${index + 1}: Position is required`);
        }
        if (!wall.width || wall.width <= 0) {
          errors.push(`Wall ${index + 1}: Width must be positive`);
        }
        if (!wall.height || wall.height <= 0) {
          errors.push(`Wall ${index + 1}: Height must be positive`);
        }
        if (!wall.surfaceType) {
          errors.push(`Wall ${index + 1}: Surface type is required`);
        }
      });
    }

    // Check phase walls if present
    if (definition.phaseWalls) {
      definition.phaseWalls.forEach((wall, index) => {
        if (!wall.x || !wall.y) {
          errors.push(`Phase wall ${index + 1}: Position is required`);
        }
        if (!wall.width || wall.width <= 0) {
          errors.push(`Phase wall ${index + 1}: Width must be positive`);
        }
        if (!wall.height || wall.height <= 0) {
          errors.push(`Phase wall ${index + 1}: Height must be positive`);
        }
        if (!wall.period || wall.period <= 0) {
          errors.push(`Phase wall ${index + 1}: Period must be positive`);
        }
        if (wall.onDuration === undefined || wall.onDuration < 0) {
          errors.push(`Phase wall ${index + 1}: On duration must be non-negative`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  exportLevel(id: string): string | null {
    const level = this.customLevels.get(id);
    if (!level) return null;

    return JSON.stringify(level, null, 2);
  }

  importLevel(json: string): { success: boolean; id?: string; error?: string } {
    try {
      const level: CustomLevel = JSON.parse(json);

      // Validate structure
      if (!level.name || !level.definition) {
        return { success: false, error: 'Invalid level format' };
      }

      // Validate level
      const validation = this.validateLevel(level.definition);
      if (!validation.valid) {
        return {
          success: false,
          error: `Level validation failed: ${validation.errors.join(', ')}`,
        };
      }

      // Generate new ID
      const newId = this.generateId();
      const newLevel: CustomLevel = {
        ...level,
        id: newId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        plays: 0,
      };

      this.customLevels.set(newId, newLevel);
      this.saveLevels();

      return { success: true, id: newId };
    } catch (e) {
      return { success: false, error: 'Failed to parse JSON' };
    }
  }

  private generateId(): string {
    return `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getCount(): number {
    return this.customLevels.size;
  }

  clear(): void {
    this.customLevels.clear();
    this.saveLevels();
  }
}
