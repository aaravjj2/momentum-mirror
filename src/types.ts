// ─── Type Definitions for Momentum Mirror ───────────────────

import { SurfaceType } from './config';

export interface Vec2 {
  x: number;
  y: number;
}

export interface SwipeData {
  startPos: Vec2;
  endPos: Vec2;
  startTime: number;
  endTime: number;
  duration: number;
  velocity: number;
  direction: Vec2;
}

export interface ImpulseData {
  direction: Vec2;
  magnitude: number;
  timestamp: number;
}

export interface CollisionData {
  point: Vec2;
  normal: Vec2;
  momentumBefore: number;
  momentumAfter: number;
  surfaceType: SurfaceType;
  angle: number;
  timestamp: number;
}

export interface WallDefinition {
  x: number;
  y: number;
  width: number;
  height: number;
  angle?: number;
  surfaceType: SurfaceType;
  curveRadius?: number;
}

export interface LevelDefinition {
  id: number;
  name: string;
  category: LevelCategory;
  description: string;
  playerStart: Vec2;
  goalPosition: Vec2;
  walls: WallDefinition[];
  optimalSwipes: number;
  phaseWalls?: PhaseWallDefinition[];
  par: {
    efficiency: number;
    conservation: number;
    rhythm: number;
    inputDensity: number;
  };
}

export type LevelCategory =
  | 'tutorial'
  | 'efficiency'
  | 'rhythm'
  | 'precision'
  | 'hybrid'
  | 'master';

export interface PhaseWallDefinition extends WallDefinition {
  period: number;
  phaseOffset: number;
  onDuration: number;
}

export interface MetricsSnapshot {
  efficiency: number;
  conservation: number;
  rhythmEntropy: number;
  inputDensity: number;
  compositeScore: number;
  skillRating: string;
  totalSwipes: number;
  totalBounces: number;
  completionTime: number;
  distanceTraveled: number;
  timestamp?: number;
}

export interface ReplayFrame {
  timestamp: number;
  playerPos: Vec2;
  playerVel: Vec2;
  input?: SwipeData;
}

export interface ReplayData {
  levelId: number;
  seed: number;
  frames: ReplayFrame[];
  metrics: MetricsSnapshot;
  date: number;
}

export interface PlayerProgress {
  levelsCompleted: number[];
  bestScores: Record<number, MetricsSnapshot>;
  totalPlayTime: number;
  achievements: string[];
}
