// ─── Physics Constants ───────────────────────────────────────
export const PHYSICS = {
  BASE_IMPULSE_MULTIPLIER: 1.5,
  GRAVITY: 0,
  FRICTION_COEFFICIENT: 0.02,
  FIXED_TIMESTEP: 1000 / 60, // 16.67ms
  PHASE_WALL_PERIOD: 3.0,
} as const;

// ─── Surface Restitution Values ──────────────────────────────
export enum SurfaceType {
  STANDARD = 'standard',
  SPRING = 'spring',
  CUSHION = 'cushion',
  CURVED = 'curved',
  PHASE = 'phase',
}

export const SURFACE_RESTITUTION: Record<SurfaceType, number> = {
  [SurfaceType.STANDARD]: 0.85,
  [SurfaceType.SPRING]: 1.3,
  [SurfaceType.CUSHION]: 0.4,
  [SurfaceType.CURVED]: 0.9,
  [SurfaceType.PHASE]: 0.85,
};

export const CURVED_ANGULAR_FACTOR = 0.15;

// ─── Surface Colors ──────────────────────────────────────────
export const SURFACE_COLORS: Record<SurfaceType, number> = {
  [SurfaceType.STANDARD]: 0x4a90d9,
  [SurfaceType.SPRING]: 0x2ecc71,
  [SurfaceType.CUSHION]: 0xe74c3c,
  [SurfaceType.CURVED]: 0xf39c12,
  [SurfaceType.PHASE]: 0x9b59b6,
};

// ─── Input Constants ─────────────────────────────────────────
export const INPUT = {
  SWIPE_DURATION_MIN: 50,
  SWIPE_DURATION_MAX: 1000,
  INPUT_BUFFER_MS: 100,
  TRAJECTORY_PREVIEW_TIME: 0.3,
} as const;

// ─── Rendering Constants ─────────────────────────────────────
export const RENDER = {
  WIDTH: 1920,
  HEIGHT: 1080,
  PLAYER_RADIUS: 16,
  GOAL_RADIUS: 24,
  FPS: 60,
  TRAIL_LENGTH: 30,
  PARTICLE_COUNT: 12,
} as const;

// ─── Metric Weights (for composite score) ────────────────────
export const METRIC_WEIGHTS = {
  EFFICIENCY: 0.4,
  RHYTHM: 0.3,
  CONSERVATION: 0.2,
  INPUT_ECONOMY: 0.1,
} as const;

// ─── Skill Ratings ───────────────────────────────────────────
export const SKILL_RATINGS = [
  { min: 0, max: 20, label: 'Novice', color: 0x95a5a6 },
  { min: 21, max: 40, label: 'Beginner', color: 0x3498db },
  { min: 41, max: 60, label: 'Intermediate', color: 0x2ecc71 },
  { min: 61, max: 80, label: 'Advanced', color: 0xf39c12 },
  { min: 81, max: 95, label: 'Expert', color: 0xe74c3c },
  { min: 96, max: 100, label: 'Master', color: 0x9b59b6 },
] as const;

// ─── Scene Keys ──────────────────────────────────────────────
export const SCENES = {
  BOOT: 'BootScene',
  MENU: 'MenuScene',
  LEVEL_SELECT: 'LevelSelectScene',
  LEADERBOARD: 'LeaderboardScene',
  GAME: 'GameScene',
  RESULTS: 'ResultsScene',
} as const;

// ─── Game Events ─────────────────────────────────────────────
export const EVENTS = {
  SWIPE_START: 'swipe-start',
  SWIPE_END: 'swipe-end',
  COLLISION: 'collision',
  GOAL_REACHED: 'goal-reached',
  LEVEL_COMPLETE: 'level-complete',
  METRICS_UPDATE: 'metrics-update',
  LEVEL_RESTART: 'level-restart',
} as const;
