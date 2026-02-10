import { LevelDefinition } from '../types';
import { SurfaceType } from '../config';

// Game world dimensions (logical coordinates)
const W = 1920;
const H = 1080;

// Wall thickness
const T = 20;

// Helper to create boundary walls
function boundaries(): LevelDefinition['walls'] {
  return [
    { x: W / 2, y: T / 2, width: W, height: T, surfaceType: SurfaceType.STANDARD },          // top
    { x: W / 2, y: H - T / 2, width: W, height: T, surfaceType: SurfaceType.STANDARD },      // bottom
    { x: T / 2, y: H / 2, width: T, height: H, surfaceType: SurfaceType.STANDARD },           // left
    { x: W - T / 2, y: H / 2, width: T, height: H, surfaceType: SurfaceType.STANDARD },      // right
  ];
}

export const LEVELS: LevelDefinition[] = [
  // ═══════════════════════════════════════════════════════════
  // TUTORIAL LEVELS (1-5)
  // ═══════════════════════════════════════════════════════════
  {
    id: 1,
    name: 'First Push',
    category: 'tutorial',
    description: 'Swipe to push the ball toward the goal. Swipe in the opposite direction of where you want to go.',
    playerStart: { x: 300, y: H / 2 },
    goalPosition: { x: W - 300, y: H / 2 },
    walls: [...boundaries()],
    optimalSwipes: 1,
    par: { efficiency: 0.85, conservation: 0.9, rhythm: 0.3, inputDensity: 1.2 },
  },
  {
    id: 2,
    name: 'Power Control',
    category: 'tutorial',
    description: 'Control your impulse strength. A longer swipe gives more power. Hit the goal across the gap!',
    playerStart: { x: 200, y: H / 2 },
    goalPosition: { x: W - 200, y: H / 2 },
    walls: [
      ...boundaries(),
      // Middle barriers with gap
      { x: W / 2, y: 200, width: T, height: 300, surfaceType: SurfaceType.STANDARD },
      { x: W / 2, y: H - 200, width: T, height: 300, surfaceType: SurfaceType.STANDARD },
    ],
    optimalSwipes: 1,
    par: { efficiency: 0.80, conservation: 0.85, rhythm: 0.3, inputDensity: 1.5 },
  },
  {
    id: 3,
    name: 'The Bounce',
    category: 'tutorial',
    description: 'Use wall bounces to reach the goal around the corner. The ball ricochets!',
    playerStart: { x: 200, y: 200 },
    goalPosition: { x: 200, y: H - 200 },
    walls: [
      ...boundaries(),
      // Horizontal barrier
      { x: W / 2 - 200, y: H / 2, width: W - 400, height: T, surfaceType: SurfaceType.STANDARD },
    ],
    optimalSwipes: 1,
    par: { efficiency: 0.70, conservation: 0.80, rhythm: 0.4, inputDensity: 1.5 },
  },
  {
    id: 4,
    name: 'Spring & Cushion',
    category: 'tutorial',
    description: 'Green springs amplify momentum. Red cushions absorb it. Use them strategically!',
    playerStart: { x: 200, y: H / 2 },
    goalPosition: { x: W - 200, y: H / 2 },
    walls: [
      ...boundaries(),
      // Spring wall on the right
      { x: W - T / 2, y: H / 2, width: T, height: 400, surfaceType: SurfaceType.SPRING },
      // Cushion barrier in the middle
      { x: W / 2, y: 300, width: T, height: 250, surfaceType: SurfaceType.CUSHION },
      { x: W / 2, y: H - 300, width: T, height: 250, surfaceType: SurfaceType.CUSHION },
      // Standard walls creating a channel
      { x: W * 0.3, y: 350, width: 300, height: T, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.3, y: H - 350, width: 300, height: T, surfaceType: SurfaceType.STANDARD },
    ],
    optimalSwipes: 2,
    par: { efficiency: 0.70, conservation: 0.75, rhythm: 0.4, inputDensity: 1.8 },
  },
  {
    id: 5,
    name: 'Curved Path',
    category: 'tutorial',
    description: 'Master angled walls. Use curved surfaces to guide your momentum around corners!',
    playerStart: { x: 200, y: H - 200 },
    goalPosition: { x: W - 200, y: 200 },
    walls: [
      ...boundaries(),
      // Diagonal angled walls creating a curved path
      { x: W * 0.25, y: H * 0.65, width: 250, height: T, angle: -0.4, surfaceType: SurfaceType.CURVED },
      { x: W * 0.4, y: H * 0.5, width: 250, height: T, angle: -0.6, surfaceType: SurfaceType.CURVED },
      { x: W * 0.55, y: H * 0.35, width: 250, height: T, angle: -0.5, surfaceType: SurfaceType.CURVED },
      { x: W * 0.7, y: H * 0.25, width: 250, height: T, angle: -0.3, surfaceType: SurfaceType.CURVED },
      // Some standard walls for contrast
      { x: W * 0.35, y: H * 0.85, width: 300, height: T, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.8, y: H * 0.45, width: T, height: 300, surfaceType: SurfaceType.STANDARD },
    ],
    optimalSwipes: 1,
    par: { efficiency: 0.75, conservation: 0.80, rhythm: 0.35, inputDensity: 1.5 },
  },

  // ═══════════════════════════════════════════════════════════
  // EFFICIENCY FOCUSED (6-10)
  // ═══════════════════════════════════════════════════════════
  {
    id: 6,
    name: 'Direct Route',
    category: 'efficiency',
    description: 'Find the most efficient path. Less impulse = higher score.',
    playerStart: { x: 150, y: 150 },
    goalPosition: { x: W - 150, y: H - 150 },
    walls: [
      ...boundaries(),
      { x: W * 0.35, y: H * 0.4, width: 400, height: T, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.65, y: H * 0.6, width: 400, height: T, surfaceType: SurfaceType.STANDARD },
    ],
    optimalSwipes: 1,
    par: { efficiency: 0.85, conservation: 0.85, rhythm: 0.3, inputDensity: 1.2 },
  },
  {
    id: 7,
    name: 'Ricochet Express',
    category: 'efficiency',
    description: 'Chain bounces to reach the goal with a single impulse.',
    playerStart: { x: 150, y: H - 150 },
    goalPosition: { x: W - 150, y: 150 },
    walls: [
      ...boundaries(),
      { x: W * 0.3, y: H * 0.3, width: 250, height: T, angle: 0.3, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.6, y: H * 0.7, width: 250, height: T, angle: -0.3, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.5, y: H * 0.5, width: 200, height: T, surfaceType: SurfaceType.SPRING },
    ],
    optimalSwipes: 1,
    par: { efficiency: 0.80, conservation: 0.80, rhythm: 0.35, inputDensity: 1.3 },
  },
  {
    id: 8,
    name: 'Spring Chain',
    category: 'efficiency',
    description: 'Use spring walls to amplify momentum. One well-aimed shot can do it all!',
    playerStart: { x: 150, y: H / 2 },
    goalPosition: { x: W - 150, y: H / 2 },
    walls: [
      ...boundaries(),
      { x: W * 0.3, y: 250, width: 300, height: T, surfaceType: SurfaceType.SPRING },
      { x: W * 0.7, y: H - 250, width: 300, height: T, surfaceType: SurfaceType.SPRING },
      { x: W * 0.5, y: H / 2, width: T, height: 300, surfaceType: SurfaceType.CUSHION },
    ],
    optimalSwipes: 1,
    par: { efficiency: 0.80, conservation: 0.75, rhythm: 0.35, inputDensity: 1.5 },
  },
  {
    id: 9,
    name: 'Minimal Force',
    category: 'efficiency',
    description: 'The goal is close but walls block a direct path. Use the least force possible.',
    playerStart: { x: 300, y: H / 2 - 200 },
    goalPosition: { x: 300, y: H / 2 + 200 },
    walls: [
      ...boundaries(),
      { x: 300, y: H / 2, width: 500, height: T, surfaceType: SurfaceType.STANDARD },
      { x: 550, y: H / 2 - 100, width: T, height: 200, surfaceType: SurfaceType.STANDARD },
      { x: 550, y: H / 2 + 100, width: T, height: 200, surfaceType: SurfaceType.STANDARD },
    ],
    optimalSwipes: 1,
    par: { efficiency: 0.80, conservation: 0.85, rhythm: 0.3, inputDensity: 1.3 },
  },
  {
    id: 10,
    name: 'Economy of Motion',
    category: 'efficiency',
    description: 'Navigate the maze with maximum efficiency. Every swipe counts!',
    playerStart: { x: 100, y: 100 },
    goalPosition: { x: W - 100, y: H - 100 },
    walls: [
      ...boundaries(),
      { x: W * 0.25, y: H * 0.3, width: T, height: H * 0.6, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.25, y: H * 0.3, width: 200, height: T, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.5, y: H * 0.7, width: T, height: H * 0.6, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.5, y: H * 0.7, width: 200, height: T, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.75, y: H * 0.3, width: T, height: H * 0.6, surfaceType: SurfaceType.STANDARD },
    ],
    optimalSwipes: 2,
    par: { efficiency: 0.75, conservation: 0.80, rhythm: 0.35, inputDensity: 1.5 },
  },

  // ═══════════════════════════════════════════════════════════
  // RHYTHM FOCUSED (11-15)
  // ═══════════════════════════════════════════════════════════
  {
    id: 11,
    name: 'Steady Beat',
    category: 'rhythm',
    description: 'Develop a consistent rhythm. Time your swipes evenly for the best score.',
    playerStart: { x: 150, y: H / 2 },
    goalPosition: { x: W - 150, y: H / 2 },
    walls: [
      ...boundaries(),
      { x: W * 0.25, y: H * 0.35, width: T, height: H * 0.3, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.5, y: H * 0.65, width: T, height: H * 0.3, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.75, y: H * 0.35, width: T, height: H * 0.3, surfaceType: SurfaceType.STANDARD },
    ],
    optimalSwipes: 3,
    par: { efficiency: 0.70, conservation: 0.80, rhythm: 0.25, inputDensity: 1.5 },
  },
  {
    id: 12,
    name: 'Phase Gates',
    category: 'rhythm',
    description: 'Purple phase walls appear and disappear. Time your movement to pass through!',
    playerStart: { x: 150, y: H / 2 },
    goalPosition: { x: W - 150, y: H / 2 },
    walls: [
      ...boundaries(),
      // Phase walls across the path
      { x: W * 0.35, y: H * 0.35, width: T, height: H * 0.3, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.65, y: H * 0.65, width: T, height: H * 0.3, surfaceType: SurfaceType.STANDARD },
    ],
    phaseWalls: [
      {
        x: W * 0.35, y: H / 2 + 100, width: T, height: 200,
        surfaceType: SurfaceType.PHASE, period: 3.0, phaseOffset: 0, onDuration: 1.5,
      },
      {
        x: W * 0.65, y: H / 2 - 100, width: T, height: 200,
        surfaceType: SurfaceType.PHASE, period: 3.0, phaseOffset: 1.5, onDuration: 1.5,
      },
    ],
    optimalSwipes: 2,
    par: { efficiency: 0.70, conservation: 0.80, rhythm: 0.25, inputDensity: 1.5 },
  },
  {
    id: 13,
    name: 'Metronome',
    category: 'rhythm',
    description: 'Multiple phase walls with different timings. Find the rhythm that gets you through.',
    playerStart: { x: 100, y: H / 2 },
    goalPosition: { x: W - 100, y: H / 2 },
    walls: [...boundaries()],
    phaseWalls: [
      {
        x: W * 0.25, y: H / 2, width: T, height: 400,
        surfaceType: SurfaceType.PHASE, period: 2.0, phaseOffset: 0, onDuration: 1.0,
      },
      {
        x: W * 0.5, y: H / 2, width: T, height: 400,
        surfaceType: SurfaceType.PHASE, period: 3.0, phaseOffset: 0.5, onDuration: 1.5,
      },
      {
        x: W * 0.75, y: H / 2, width: T, height: 400,
        surfaceType: SurfaceType.PHASE, period: 2.5, phaseOffset: 1.0, onDuration: 1.25,
      },
    ],
    optimalSwipes: 3,
    par: { efficiency: 0.65, conservation: 0.75, rhythm: 0.20, inputDensity: 1.5 },
  },
  {
    id: 14,
    name: 'Pulse Corridor',
    category: 'rhythm',
    description: 'A narrow corridor with pulsing phase walls. Stay in rhythm or get bounced back!',
    playerStart: { x: 100, y: H / 2 },
    goalPosition: { x: W - 100, y: H / 2 },
    walls: [
      ...boundaries(),
      { x: W / 2, y: H / 2 - 120, width: W - 200, height: T, surfaceType: SurfaceType.STANDARD },
      { x: W / 2, y: H / 2 + 120, width: W - 200, height: T, surfaceType: SurfaceType.STANDARD },
    ],
    phaseWalls: [
      { x: W * 0.3, y: H / 2, width: T, height: 220, surfaceType: SurfaceType.PHASE, period: 2.0, phaseOffset: 0, onDuration: 1.0 },
      { x: W * 0.5, y: H / 2, width: T, height: 220, surfaceType: SurfaceType.PHASE, period: 2.0, phaseOffset: 0.7, onDuration: 1.0 },
      { x: W * 0.7, y: H / 2, width: T, height: 220, surfaceType: SurfaceType.PHASE, period: 2.0, phaseOffset: 1.4, onDuration: 1.0 },
    ],
    optimalSwipes: 3,
    par: { efficiency: 0.60, conservation: 0.75, rhythm: 0.20, inputDensity: 1.8 },
  },
  {
    id: 15,
    name: 'Syncopation',
    category: 'rhythm',
    description: 'Phase walls with overlapping patterns. Master the off-beats!',
    playerStart: { x: 150, y: 150 },
    goalPosition: { x: W - 150, y: H - 150 },
    walls: [
      ...boundaries(),
      { x: W * 0.4, y: H * 0.3, width: 300, height: T, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.6, y: H * 0.7, width: 300, height: T, surfaceType: SurfaceType.STANDARD },
    ],
    phaseWalls: [
      { x: W * 0.3, y: H * 0.5, width: T, height: 300, surfaceType: SurfaceType.PHASE, period: 2.5, phaseOffset: 0, onDuration: 1.2 },
      { x: W * 0.5, y: H * 0.4, width: T, height: 300, surfaceType: SurfaceType.PHASE, period: 3.0, phaseOffset: 0.8, onDuration: 1.5 },
      { x: W * 0.7, y: H * 0.6, width: T, height: 300, surfaceType: SurfaceType.PHASE, period: 2.0, phaseOffset: 0.3, onDuration: 1.0 },
    ],
    optimalSwipes: 3,
    par: { efficiency: 0.60, conservation: 0.70, rhythm: 0.22, inputDensity: 1.8 },
  },

  // ═══════════════════════════════════════════════════════════
  // PRECISION FOCUSED (16-20)
  // ═══════════════════════════════════════════════════════════
  {
    id: 16,
    name: 'Razor Edge',
    category: 'precision',
    description: 'Thread the ball through narrow gaps. Precision is everything.',
    playerStart: { x: 150, y: H / 2 },
    goalPosition: { x: W - 150, y: H / 2 },
    walls: [
      ...boundaries(),
      // Narrow vertical slits
      { x: W * 0.3, y: H / 2 - 80, width: T, height: H - 260, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.3, y: H / 2 + 80, width: T, height: H - 260, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.5, y: H / 2 - 60, width: T, height: H - 220, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.5, y: H / 2 + 60, width: T, height: H - 220, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.7, y: H / 2 - 50, width: T, height: H - 200, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.7, y: H / 2 + 50, width: T, height: H - 200, surfaceType: SurfaceType.STANDARD },
    ],
    optimalSwipes: 1,
    par: { efficiency: 0.80, conservation: 0.85, rhythm: 0.30, inputDensity: 1.3 },
  },
  {
    id: 17,
    name: 'Pinball Wizard',
    category: 'precision',
    description: 'Bounce through a field of obstacles. Every angle must be perfect.',
    playerStart: { x: 100, y: H / 2 },
    goalPosition: { x: W - 100, y: H / 2 },
    walls: [
      ...boundaries(),
      // Obstacle field
      { x: W * 0.25, y: H * 0.3, width: 80, height: 80, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.35, y: H * 0.6, width: 80, height: 80, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.45, y: H * 0.35, width: 80, height: 80, surfaceType: SurfaceType.SPRING },
      { x: W * 0.55, y: H * 0.65, width: 80, height: 80, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.65, y: H * 0.4, width: 80, height: 80, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.75, y: H * 0.7, width: 80, height: 80, surfaceType: SurfaceType.SPRING },
    ],
    optimalSwipes: 2,
    par: { efficiency: 0.70, conservation: 0.75, rhythm: 0.30, inputDensity: 1.5 },
  },
  {
    id: 18,
    name: 'Spiral Path',
    category: 'precision',
    description: 'Navigate through a spiral of walls. Curved surfaces deflect your path.',
    playerStart: { x: W / 2, y: 100 },
    goalPosition: { x: W / 2, y: H / 2 },
    walls: [
      ...boundaries(),
      // Spiral walls
      { x: W / 2 + 200, y: H * 0.3, width: 400, height: T, surfaceType: SurfaceType.CURVED },
      { x: W / 2 + 200, y: H * 0.3, width: T, height: 250, surfaceType: SurfaceType.STANDARD },
      { x: W / 2 - 150, y: H * 0.5, width: 350, height: T, surfaceType: SurfaceType.CURVED },
      { x: W / 2 - 150, y: H * 0.5, width: T, height: 200, surfaceType: SurfaceType.STANDARD },
      { x: W / 2 + 100, y: H * 0.65, width: 250, height: T, surfaceType: SurfaceType.STANDARD },
    ],
    optimalSwipes: 2,
    par: { efficiency: 0.65, conservation: 0.70, rhythm: 0.30, inputDensity: 1.8 },
  },
  {
    id: 19,
    name: 'Sniper Shot',
    category: 'precision',
    description: 'One shot, one goal. The gap is tiny and the distance is long.',
    playerStart: { x: 100, y: H / 2 },
    goalPosition: { x: W - 100, y: H / 2 },
    walls: [
      ...boundaries(),
      // Long barrier with tiny gap
      { x: W * 0.6, y: H / 2 - 40, width: T, height: H - 180, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.6, y: H / 2 + 40, width: T, height: H - 180, surfaceType: SurfaceType.STANDARD },
    ],
    optimalSwipes: 1,
    par: { efficiency: 0.85, conservation: 0.90, rhythm: 0.30, inputDensity: 1.2 },
  },
  {
    id: 20,
    name: 'Diamond Cutter',
    category: 'precision',
    description: 'Navigate a diamond-shaped maze with cushion walls. Precision prevents energy loss.',
    playerStart: { x: W / 2, y: 100 },
    goalPosition: { x: W / 2, y: H - 100 },
    walls: [
      ...boundaries(),
      // Diamond shape
      { x: W / 2, y: H / 2 - 200, width: 400, height: T, angle: 0.5, surfaceType: SurfaceType.CUSHION },
      { x: W / 2, y: H / 2 - 200, width: 400, height: T, angle: -0.5, surfaceType: SurfaceType.CUSHION },
      { x: W / 2, y: H / 2 + 200, width: 400, height: T, angle: -0.5, surfaceType: SurfaceType.CUSHION },
      { x: W / 2, y: H / 2 + 200, width: 400, height: T, angle: 0.5, surfaceType: SurfaceType.CUSHION },
      // Gap in center
      { x: W / 2 - 180, y: H / 2, width: T, height: 100, surfaceType: SurfaceType.STANDARD },
      { x: W / 2 + 180, y: H / 2, width: T, height: 100, surfaceType: SurfaceType.STANDARD },
    ],
    optimalSwipes: 2,
    par: { efficiency: 0.70, conservation: 0.65, rhythm: 0.30, inputDensity: 1.5 },
  },

  // ═══════════════════════════════════════════════════════════
  // HYBRID (21-25)
  // ═══════════════════════════════════════════════════════════
  {
    id: 21,
    name: 'Full Spectrum',
    category: 'hybrid',
    description: 'All surface types. All skills required. Show your mastery!',
    playerStart: { x: 100, y: 100 },
    goalPosition: { x: W - 100, y: H - 100 },
    walls: [
      ...boundaries(),
      // Mixed surface maze
      { x: W * 0.3, y: H * 0.35, width: 350, height: T, surfaceType: SurfaceType.SPRING },
      { x: W * 0.5, y: H * 0.5, width: T, height: 300, surfaceType: SurfaceType.CUSHION },
      { x: W * 0.7, y: H * 0.65, width: 350, height: T, surfaceType: SurfaceType.CURVED },
      { x: W * 0.4, y: H * 0.7, width: 200, height: T, surfaceType: SurfaceType.STANDARD },
    ],
    phaseWalls: [
      { x: W * 0.6, y: H * 0.3, width: T, height: 200, surfaceType: SurfaceType.PHASE, period: 2.5, phaseOffset: 0, onDuration: 1.2 },
    ],
    optimalSwipes: 3,
    par: { efficiency: 0.65, conservation: 0.70, rhythm: 0.25, inputDensity: 1.5 },
  },
  {
    id: 22,
    name: 'Gauntlet',
    category: 'hybrid',
    description: 'A challenging run that tests efficiency, rhythm, and precision all at once.',
    playerStart: { x: 100, y: H / 2 },
    goalPosition: { x: W - 100, y: H / 2 },
    walls: [
      ...boundaries(),
      // Gauntlet obstacles
      { x: W * 0.2, y: H * 0.3, width: 150, height: T, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.2, y: H * 0.7, width: 150, height: T, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.4, y: H * 0.25, width: T, height: 200, surfaceType: SurfaceType.SPRING },
      { x: W * 0.4, y: H * 0.75, width: T, height: 200, surfaceType: SurfaceType.SPRING },
      { x: W * 0.6, y: H * 0.4, width: 100, height: 100, surfaceType: SurfaceType.CUSHION },
      { x: W * 0.8, y: H * 0.3, width: 200, height: T, surfaceType: SurfaceType.CURVED },
      { x: W * 0.8, y: H * 0.7, width: 200, height: T, surfaceType: SurfaceType.CURVED },
    ],
    phaseWalls: [
      { x: W * 0.55, y: H / 2, width: T, height: 250, surfaceType: SurfaceType.PHASE, period: 3.0, phaseOffset: 0, onDuration: 1.5 },
    ],
    optimalSwipes: 3,
    par: { efficiency: 0.60, conservation: 0.65, rhythm: 0.22, inputDensity: 1.8 },
  },
  {
    id: 23,
    name: 'Mirror Match',
    category: 'hybrid',
    description: 'A symmetrical arena. The optimal path mirrors itself.',
    playerStart: { x: W / 2, y: 100 },
    goalPosition: { x: W / 2, y: H - 100 },
    walls: [
      ...boundaries(),
      // Symmetrical obstacles
      { x: W / 2 - 200, y: H * 0.35, width: T, height: 250, surfaceType: SurfaceType.STANDARD },
      { x: W / 2 + 200, y: H * 0.35, width: T, height: 250, surfaceType: SurfaceType.STANDARD },
      { x: W / 2 - 150, y: H * 0.65, width: T, height: 250, surfaceType: SurfaceType.SPRING },
      { x: W / 2 + 150, y: H * 0.65, width: T, height: 250, surfaceType: SurfaceType.SPRING },
      { x: W / 2, y: H / 2, width: 200, height: T, surfaceType: SurfaceType.CUSHION },
    ],
    optimalSwipes: 2,
    par: { efficiency: 0.70, conservation: 0.70, rhythm: 0.25, inputDensity: 1.5 },
  },
  {
    id: 24,
    name: 'Cascade',
    category: 'hybrid',
    description: 'Chain bounces across multiple surfaces. Each hit sets up the next.',
    playerStart: { x: 100, y: 100 },
    goalPosition: { x: W - 100, y: H - 100 },
    walls: [
      ...boundaries(),
      { x: W * 0.2, y: H * 0.4, width: 200, height: T, angle: 0.4, surfaceType: SurfaceType.SPRING },
      { x: W * 0.4, y: H * 0.3, width: 200, height: T, angle: -0.2, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.5, y: H * 0.6, width: 200, height: T, angle: 0.3, surfaceType: SurfaceType.CURVED },
      { x: W * 0.7, y: H * 0.5, width: 200, height: T, angle: -0.4, surfaceType: SurfaceType.SPRING },
      { x: W * 0.8, y: H * 0.8, width: 200, height: T, angle: 0.1, surfaceType: SurfaceType.STANDARD },
    ],
    optimalSwipes: 1,
    par: { efficiency: 0.75, conservation: 0.70, rhythm: 0.30, inputDensity: 1.3 },
  },
  {
    id: 25,
    name: 'Momentum Master',
    category: 'hybrid',
    description: 'The ultimate test. Every skill matters. Can you master momentum?',
    playerStart: { x: 100, y: H / 2 },
    goalPosition: { x: W - 100, y: H / 2 },
    walls: [
      ...boundaries(),
      // Complex hybrid level
      { x: W * 0.2, y: H * 0.25, width: 300, height: T, surfaceType: SurfaceType.SPRING },
      { x: W * 0.2, y: H * 0.75, width: 300, height: T, surfaceType: SurfaceType.SPRING },
      { x: W * 0.4, y: H / 2, width: T, height: 300, surfaceType: SurfaceType.CUSHION },
      { x: W * 0.6, y: H * 0.3, width: 200, height: T, angle: 0.3, surfaceType: SurfaceType.CURVED },
      { x: W * 0.6, y: H * 0.7, width: 200, height: T, angle: -0.3, surfaceType: SurfaceType.CURVED },
      { x: W * 0.8, y: H * 0.4, width: T, height: 150, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.8, y: H * 0.6, width: T, height: 150, surfaceType: SurfaceType.STANDARD },
    ],
    phaseWalls: [
      { x: W * 0.5, y: H * 0.5, width: T, height: 200, surfaceType: SurfaceType.PHASE, period: 2.5, phaseOffset: 0, onDuration: 1.2 },
      { x: W * 0.7, y: H * 0.5, width: T, height: 200, surfaceType: SurfaceType.PHASE, period: 3.0, phaseOffset: 1.0, onDuration: 1.5 },
    ],
    optimalSwipes: 3,
    par: { efficiency: 0.60, conservation: 0.65, rhythm: 0.20, inputDensity: 1.8 },
  },

  // ═══════════════════════════════════════════════════════════
  // ADVANCED (26-30)
  // ═══════════════════════════════════════════════════════════
  {
    id: 26,
    name: 'Labyrinth',
    category: 'precision',
    description: 'A complex maze that demands perfect control.',
    playerStart: { x: 100, y: 100 },
    goalPosition: { x: W - 100, y: H - 100 },
    walls: [
      ...boundaries(),
      // Maze walls
      { x: W * 0.15, y: H * 0.4, width: W * 0.2, height: T, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.25, y: H * 0.4, width: T, height: H * 0.35, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.35, y: H * 0.2, width: T, height: H * 0.4, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.35, y: H * 0.6, width: W * 0.15, height: T, surfaceType: SurfaceType.SPRING },
      { x: W * 0.50, y: H * 0.35, width: T, height: H * 0.5, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.50, y: H * 0.8, width: W * 0.15, height: T, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.65, y: H * 0.5, width: T, height: H * 0.4, surfaceType: SurfaceType.CUSHION },
      { x: W * 0.75, y: H * 0.3, width: W * 0.15, height: T, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.80, y: H * 0.55, width: T, height: H * 0.3, surfaceType: SurfaceType.STANDARD },
    ],
    optimalSwipes: 4,
    par: { efficiency: 0.55, conservation: 0.65, rhythm: 0.25, inputDensity: 2.0 },
  },
  {
    id: 27,
    name: 'Quantum Tunnel',
    category: 'rhythm',
    description: 'Dense phase walls create a timing puzzle. Find the rhythm of the universe.',
    playerStart: { x: 100, y: H / 2 },
    goalPosition: { x: W - 100, y: H / 2 },
    walls: [...boundaries()],
    phaseWalls: [
      { x: W * 0.2, y: H / 2, width: T, height: 500, surfaceType: SurfaceType.PHASE, period: 2.0, phaseOffset: 0.0, onDuration: 0.8 },
      { x: W * 0.3, y: H / 2, width: T, height: 500, surfaceType: SurfaceType.PHASE, period: 2.5, phaseOffset: 0.5, onDuration: 1.0 },
      { x: W * 0.4, y: H / 2, width: T, height: 500, surfaceType: SurfaceType.PHASE, period: 1.5, phaseOffset: 0.3, onDuration: 0.6 },
      { x: W * 0.5, y: H / 2, width: T, height: 500, surfaceType: SurfaceType.PHASE, period: 3.0, phaseOffset: 1.0, onDuration: 1.2 },
      { x: W * 0.6, y: H / 2, width: T, height: 500, surfaceType: SurfaceType.PHASE, period: 2.0, phaseOffset: 0.7, onDuration: 0.8 },
      { x: W * 0.7, y: H / 2, width: T, height: 500, surfaceType: SurfaceType.PHASE, period: 2.5, phaseOffset: 1.5, onDuration: 1.0 },
      { x: W * 0.8, y: H / 2, width: T, height: 500, surfaceType: SurfaceType.PHASE, period: 1.8, phaseOffset: 0.2, onDuration: 0.7 },
    ],
    optimalSwipes: 4,
    par: { efficiency: 0.55, conservation: 0.70, rhythm: 0.18, inputDensity: 2.0 },
  },
  {
    id: 28,
    name: 'Speed Demon',
    category: 'efficiency',
    description: 'Spring chains everywhere. Maximum velocity, maximum risk.',
    playerStart: { x: 100, y: H / 2 },
    goalPosition: { x: W - 100, y: H / 2 },
    walls: [
      ...boundaries(),
      { x: W * 0.2, y: 200, width: 300, height: T, surfaceType: SurfaceType.SPRING },
      { x: W * 0.4, y: H - 200, width: 300, height: T, surfaceType: SurfaceType.SPRING },
      { x: W * 0.6, y: 250, width: 300, height: T, surfaceType: SurfaceType.SPRING },
      { x: W * 0.8, y: H - 250, width: 300, height: T, surfaceType: SurfaceType.SPRING },
      // Cushion traps
      { x: W * 0.3, y: H / 2, width: 100, height: 100, surfaceType: SurfaceType.CUSHION },
      { x: W * 0.7, y: H / 2, width: 100, height: 100, surfaceType: SurfaceType.CUSHION },
    ],
    optimalSwipes: 1,
    par: { efficiency: 0.75, conservation: 0.65, rhythm: 0.30, inputDensity: 1.3 },
  },
  {
    id: 29,
    name: 'Zen Garden',
    category: 'hybrid',
    description: 'Balance is key. Use cushions for control and springs for speed.',
    playerStart: { x: W / 2, y: 100 },
    goalPosition: { x: W / 2, y: H - 100 },
    walls: [
      ...boundaries(),
      // Arranged in concentric pattern
      { x: W / 2 - 300, y: H * 0.3, width: T, height: 200, surfaceType: SurfaceType.CUSHION },
      { x: W / 2 + 300, y: H * 0.3, width: T, height: 200, surfaceType: SurfaceType.CUSHION },
      { x: W / 2, y: H * 0.4, width: 400, height: T, surfaceType: SurfaceType.SPRING },
      { x: W / 2 - 200, y: H * 0.6, width: T, height: 200, surfaceType: SurfaceType.STANDARD },
      { x: W / 2 + 200, y: H * 0.6, width: T, height: 200, surfaceType: SurfaceType.STANDARD },
      { x: W / 2, y: H * 0.75, width: 250, height: T, surfaceType: SurfaceType.CURVED },
    ],
    phaseWalls: [
      { x: W / 2, y: H * 0.5, width: T, height: 150, surfaceType: SurfaceType.PHASE, period: 3.0, phaseOffset: 0, onDuration: 1.5 },
    ],
    optimalSwipes: 3,
    par: { efficiency: 0.60, conservation: 0.65, rhythm: 0.22, inputDensity: 1.8 },
  },
  {
    id: 30,
    name: 'Final Exam',
    category: 'hybrid',
    description: 'Everything you\'ve learned converges here. Prove your mastery of momentum.',
    playerStart: { x: 100, y: 100 },
    goalPosition: { x: W - 100, y: H - 100 },
    walls: [
      ...boundaries(),
      // Complex multi-surface layout
      { x: W * 0.15, y: H * 0.3, width: 250, height: T, surfaceType: SurfaceType.SPRING },
      { x: W * 0.25, y: H * 0.5, width: T, height: 300, surfaceType: SurfaceType.CUSHION },
      { x: W * 0.35, y: H * 0.7, width: 250, height: T, angle: 0.2, surfaceType: SurfaceType.CURVED },
      { x: W * 0.45, y: H * 0.35, width: T, height: 250, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.55, y: H * 0.6, width: 200, height: T, surfaceType: SurfaceType.SPRING },
      { x: W * 0.65, y: H * 0.4, width: T, height: 200, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.75, y: H * 0.7, width: 250, height: T, angle: -0.2, surfaceType: SurfaceType.CURVED },
      { x: W * 0.85, y: H * 0.5, width: T, height: 200, surfaceType: SurfaceType.CUSHION },
    ],
    phaseWalls: [
      { x: W * 0.4, y: H * 0.55, width: T, height: 200, surfaceType: SurfaceType.PHASE, period: 2.5, phaseOffset: 0, onDuration: 1.0 },
      { x: W * 0.6, y: H * 0.55, width: T, height: 200, surfaceType: SurfaceType.PHASE, period: 3.0, phaseOffset: 1.0, onDuration: 1.2 },
      { x: W * 0.8, y: H * 0.35, width: T, height: 200, surfaceType: SurfaceType.PHASE, period: 2.0, phaseOffset: 0.5, onDuration: 0.8 },
    ],
    optimalSwipes: 4,
    par: { efficiency: 0.55, conservation: 0.60, rhythm: 0.20, inputDensity: 2.0 },
  },

  // ═══════════════════════════════════════════════════════════
  // MASTER CHALLENGES (31-40)
  // ═══════════════════════════════════════════════════════════
  {
    id: 31,
    name: 'The Gauntlet',
    category: 'master',
    description: 'Five phase walls in sequence. Timing perfection required.',
    playerStart: { x: 150, y: H / 2 },
    goalPosition: { x: W - 150, y: H / 2 },
    walls: [
      ...boundaries(),
      { x: W / 2, y: H / 2 - 100, width: W - 300, height: T, surfaceType: SurfaceType.STANDARD },
      { x: W / 2, y: H / 2 + 100, width: W - 300, height: T, surfaceType: SurfaceType.STANDARD },
    ],
    phaseWalls: [
      { x: W * 0.2, y: H / 2, width: T, height: 200, surfaceType: SurfaceType.PHASE, period: 2.0, phaseOffset: 0, onDuration: 0.8 },
      { x: W * 0.35, y: H / 2, width: T, height: 200, surfaceType: SurfaceType.PHASE, period: 2.0, phaseOffset: 0.5, onDuration: 0.8 },
      { x: W * 0.5, y: H / 2, width: T, height: 200, surfaceType: SurfaceType.PHASE, period: 2.0, phaseOffset: 1.0, onDuration: 0.8 },
      { x: W * 0.65, y: H / 2, width: T, height: 200, surfaceType: SurfaceType.PHASE, period: 2.0, phaseOffset: 1.5, onDuration: 0.8 },
      { x: W * 0.8, y: H / 2, width: T, height: 200, surfaceType: SurfaceType.PHASE, period: 2.0, phaseOffset: 0.25, onDuration: 0.8 },
    ],
    optimalSwipes: 5,
    par: { efficiency: 0.50, conservation: 0.70, rhythm: 0.15, inputDensity: 2.2 },
  },
  {
    id: 32,
    name: 'Spring Symphony',
    category: 'master',
    description: 'Chain spring bounces to maintain speed. One shot, perfect execution.',
    playerStart: { x: 200, y: H - 200 },
    goalPosition: { x: W - 200, y: 200 },
    walls: [
      ...boundaries(),
      { x: W * 0.2, y: H * 0.7, width: 150, height: T, angle: -0.5, surfaceType: SurfaceType.SPRING },
      { x: W * 0.35, y: H * 0.5, width: 150, height: T, angle: -0.4, surfaceType: SurfaceType.SPRING },
      { x: W * 0.5, y: H * 0.35, width: 150, height: T, angle: -0.3, surfaceType: SurfaceType.SPRING },
      { x: W * 0.65, y: H * 0.25, width: 150, height: T, angle: -0.3, surfaceType: SurfaceType.SPRING },
      { x: W * 0.8, y: H * 0.2, width: 150, height: T, angle: -0.2, surfaceType: SurfaceType.SPRING },
    ],
    optimalSwipes: 1,
    par: { efficiency: 0.85, conservation: 0.80, rhythm: 0.25, inputDensity: 1.1 },
  },
  {
    id: 33,
    name: 'Cushion Labyrinth',
    category: 'master',
    description: 'Navigate a maze of dampening walls. Precise force control essential.',
    playerStart: { x: 100, y: 100 },
    goalPosition: { x: W - 100, y: H - 100 },
    walls: [
      ...boundaries(),
      // Maze pattern with cushions
      { x: W * 0.2, y: H * 0.4, width: T, height: 400, surfaceType: SurfaceType.CUSHION },
      { x: W * 0.35, y: H * 0.6, width: 300, height: T, surfaceType: SurfaceType.CUSHION },
      { x: W * 0.5, y: H * 0.3, width: T, height: 300, surfaceType: SurfaceType.CUSHION },
      { x: W * 0.65, y: H * 0.5, width: 300, height: T, surfaceType: SurfaceType.CUSHION },
      { x: W * 0.8, y: H * 0.6, width: T, height: 400, surfaceType: SurfaceType.CUSHION },
    ],
    optimalSwipes: 6,
    par: { efficiency: 0.55, conservation: 0.55, rhythm: 0.25, inputDensity: 2.5 },
  },
  {
    id: 34,
    name: 'Curve Master',
    category: 'master',
    description: 'Curved walls everywhere. Let the deflections guide you.',
    playerStart: { x: W / 2, y: 150 },
    goalPosition: { x: W / 2, y: H - 150 },
    walls: [
      ...boundaries(),
      { x: W * 0.3, y: H * 0.25, width: 200, height: T, angle: 0.6, surfaceType: SurfaceType.CURVED },
      { x: W * 0.7, y: H * 0.25, width: 200, height: T, angle: -0.6, surfaceType: SurfaceType.CURVED },
      { x: W * 0.25, y: H * 0.45, width: 200, height: T, angle: -0.5, surfaceType: SurfaceType.CURVED },
      { x: W * 0.75, y: H * 0.45, width: 200, height: T, angle: 0.5, surfaceType: SurfaceType.CURVED },
      { x: W * 0.3, y: H * 0.65, width: 200, height: T, angle: 0.4, surfaceType: SurfaceType.CURVED },
      { x: W * 0.7, y: H * 0.65, width: 200, height: T, angle: -0.4, surfaceType: SurfaceType.CURVED },
      { x: W * 0.4, y: H * 0.8, width: 200, height: T, angle: -0.3, surfaceType: SurfaceType.CURVED },
      { x: W * 0.6, y: H * 0.8, width: 200, height: T, angle: 0.3, surfaceType: SurfaceType.CURVED },
    ],
    optimalSwipes: 2,
    par: { efficiency: 0.70, conservation: 0.75, rhythm: 0.25, inputDensity: 1.5 },
  },
  {
    id: 35,
    name: 'Phase Weave',
    category: 'master',
    description: 'Intricate phase patterns create narrow windows. Dance through the gaps.',
    playerStart: { x: 100, y: H / 2 },
    goalPosition: { x: W - 100, y: H / 2 },
    walls: [
      ...boundaries(),
      { x: W / 2, y: H * 0.25, width: W - 200, height: T, surfaceType: SurfaceType.STANDARD },
      { x: W / 2, y: H * 0.75, width: W - 200, height: T, surfaceType: SurfaceType.STANDARD },
    ],
    phaseWalls: [
      { x: W * 0.25, y: H * 0.4, width: T, height: 150, surfaceType: SurfaceType.PHASE, period: 3.0, phaseOffset: 0, onDuration: 1.2 },
      { x: W * 0.25, y: H * 0.6, width: T, height: 150, surfaceType: SurfaceType.PHASE, period: 3.0, phaseOffset: 1.5, onDuration: 1.2 },
      { x: W * 0.5, y: H * 0.4, width: T, height: 150, surfaceType: SurfaceType.PHASE, period: 2.5, phaseOffset: 0.5, onDuration: 1.0 },
      { x: W * 0.5, y: H * 0.6, width: T, height: 150, surfaceType: SurfaceType.PHASE, period: 2.5, phaseOffset: 2.0, onDuration: 1.0 },
      { x: W * 0.75, y: H * 0.4, width: T, height: 150, surfaceType: SurfaceType.PHASE, period: 3.5, phaseOffset: 1.0, onDuration: 1.5 },
      { x: W * 0.75, y: H * 0.6, width: T, height: 150, surfaceType: SurfaceType.PHASE, period: 3.5, phaseOffset: 2.5, onDuration: 1.5 },
    ],
    optimalSwipes: 4,
    par: { efficiency: 0.50, conservation: 0.65, rhythm: 0.18, inputDensity: 2.0 },
  },
  {
    id: 36,
    name: 'Momentum Cascade',
    category: 'master',
    description: 'Spring chain with phase interruptions. Build and maintain velocity.',
    playerStart: { x: 150, y: H / 2 },
    goalPosition: { x: W - 150, y: H / 2 },
    walls: [
      ...boundaries(),
      { x: W * 0.25, y: H * 0.3, width: 200, height: T, surfaceType: SurfaceType.SPRING },
      { x: W * 0.45, y: H * 0.7, width: 200, height: T, surfaceType: SurfaceType.SPRING },
      { x: W * 0.65, y: H * 0.35, width: 200, height: T, surfaceType: SurfaceType.SPRING },
      { x: W * 0.85, y: H * 0.65, width: 200, height: T, surfaceType: SurfaceType.SPRING },
    ],
    phaseWalls: [
      { x: W * 0.35, y: H / 2, width: T, height: 200, surfaceType: SurfaceType.PHASE, period: 2.5, phaseOffset: 0, onDuration: 1.0 },
      { x: W * 0.55, y: H / 2, width: T, height: 200, surfaceType: SurfaceType.PHASE, period: 2.5, phaseOffset: 0.8, onDuration: 1.0 },
      { x: W * 0.75, y: H / 2, width: T, height: 200, surfaceType: SurfaceType.PHASE, period: 2.5, phaseOffset: 1.6, onDuration: 1.0 },
    ],
    optimalSwipes: 2,
    par: { efficiency: 0.75, conservation: 0.75, rhythm: 0.20, inputDensity: 1.3 },
  },
  {
    id: 37,
    name: 'Precision Hell',
    category: 'master',
    description: 'Microscopic gaps between obstacles. Zero margin for error.',
    playerStart: { x: 150, y: H / 2 },
    goalPosition: { x: W - 150, y: H / 2 },
    walls: [
      ...boundaries(),
      // Ultra-narrow passages
      { x: W * 0.25, y: H / 2 - 45, width: T, height: H - 200, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.25, y: H / 2 + 45, width: T, height: H - 200, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.4, y: H / 2 - 40, width: T, height: H - 180, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.4, y: H / 2 + 40, width: T, height: H - 180, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.55, y: H / 2 - 35, width: T, height: H - 160, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.55, y: H / 2 + 35, width: T, height: H - 160, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.7, y: H / 2 - 30, width: T, height: H - 140, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.7, y: H / 2 + 30, width: T, height: H - 140, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.85, y: H / 2 - 25, width: T, height: H - 120, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.85, y: H / 2 + 25, width: T, height: H - 120, surfaceType: SurfaceType.STANDARD },
    ],
    optimalSwipes: 1,
    par: { efficiency: 0.80, conservation: 0.85, rhythm: 0.30, inputDensity: 1.2 },
  },
  {
    id: 38,
    name: 'Chaos Theory',
    category: 'master',
    description: 'Every surface type, random arrangement. Adapt on the fly.',
    playerStart: { x: 150, y: 150 },
    goalPosition: { x: W - 150, y: H - 150 },
    walls: [
      ...boundaries(),
      { x: W * 0.2, y: H * 0.3, width: 100, height: 100, surfaceType: SurfaceType.SPRING },
      { x: W * 0.35, y: H * 0.5, width: 100, height: 100, surfaceType: SurfaceType.CUSHION },
      { x: W * 0.5, y: H * 0.25, width: 120, height: 80, surfaceType: SurfaceType.CURVED },
      { x: W * 0.65, y: H * 0.45, width: 80, height: 120, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.3, y: H * 0.75, width: 90, height: 90, surfaceType: SurfaceType.SPRING },
      { x: W * 0.55, y: H * 0.7, width: 100, height: 100, surfaceType: SurfaceType.CUSHION },
      { x: W * 0.75, y: H * 0.6, width: 110, height: 90, surfaceType: SurfaceType.CURVED },
      { x: W * 0.82, y: H * 0.35, width: 90, height: 110, surfaceType: SurfaceType.STANDARD },
    ],
    phaseWalls: [
      { x: W * 0.4, y: H * 0.4, width: T, height: 150, surfaceType: SurfaceType.PHASE, period: 3.0, phaseOffset: 0, onDuration: 1.2 },
      { x: W * 0.7, y: H * 0.55, width: T, height: 180, surfaceType: SurfaceType.PHASE, period: 2.5, phaseOffset: 1.0, onDuration: 1.0 },
    ],
    optimalSwipes: 5,
    par: { efficiency: 0.50, conservation: 0.55, rhythm: 0.25, inputDensity: 2.5 },
  },
  {
    id: 39,
    name: 'Time Pressure',
    category: 'master',
    description: 'Fast phase cycles, long distances. Speed AND timing required.',
    playerStart: { x: 100, y: H / 2 },
    goalPosition: { x: W - 100, y: H / 2 },
    walls: [
      ...boundaries(),
      { x: W / 2, y: H / 2 - 80, width: W - 300, height: T, surfaceType: SurfaceType.SPRING },
      { x: W / 2, y: H / 2 + 80, width: W - 300, height: T, surfaceType: SurfaceType.SPRING },
    ],
    phaseWalls: [
      { x: W * 0.2, y: H / 2, width: T, height: 160, surfaceType: SurfaceType.PHASE, period: 1.5, phaseOffset: 0, onDuration: 0.6 },
      { x: W * 0.35, y: H / 2, width: T, height: 160, surfaceType: SurfaceType.PHASE, period: 1.5, phaseOffset: 0.4, onDuration: 0.6 },
      { x: W * 0.5, y: H / 2, width: T, height: 160, surfaceType: SurfaceType.PHASE, period: 1.5, phaseOffset: 0.8, onDuration: 0.6 },
      { x: W * 0.65, y: H / 2, width: T, height: 160, surfaceType: SurfaceType.PHASE, period: 1.5, phaseOffset: 0.2, onDuration: 0.6 },
      { x: W * 0.8, y: H / 2, width: T, height: 160, surfaceType: SurfaceType.PHASE, period: 1.5, phaseOffset: 0.6, onDuration: 0.6 },
    ],
    optimalSwipes: 2,
    par: { efficiency: 0.65, conservation: 0.70, rhythm: 0.15, inputDensity: 1.5 },
  },
  {
    id: 40,
    name: 'Omega',
    category: 'master',
    description: 'The ultimate test. All mechanics at maximum difficulty. Only masters survive.',
    playerStart: { x: 100, y: 100 },
    goalPosition: { x: W - 100, y: H - 100 },
    walls: [
      ...boundaries(),
      // Dense obstacle field
      { x: W * 0.15, y: H * 0.2, width: 120, height: T, angle: 0.3, surfaceType: SurfaceType.CURVED },
      { x: W * 0.25, y: H * 0.35, width: T, height: 150, surfaceType: SurfaceType.CUSHION },
      { x: W * 0.35, y: H * 0.25, width: 100, height: T, surfaceType: SurfaceType.SPRING },
      { x: W * 0.45, y: H * 0.4, width: T, height: 180, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.55, y: H * 0.3, width: 130, height: T, angle: -0.4, surfaceType: SurfaceType.CURVED },
      { x: W * 0.2, y: H * 0.6, width: T, height: 200, surfaceType: SurfaceType.SPRING },
      { x: W * 0.35, y: H * 0.7, width: 150, height: T, surfaceType: SurfaceType.CUSHION },
      { x: W * 0.5, y: H * 0.65, width: T, height: 150, surfaceType: SurfaceType.STANDARD },
      { x: W * 0.65, y: H * 0.5, width: 120, height: T, angle: 0.5, surfaceType: SurfaceType.CURVED },
      { x: W * 0.75, y: H * 0.6, width: T, height: 200, surfaceType: SurfaceType.SPRING },
      { x: W * 0.85, y: H * 0.4, width: T, height: 180, surfaceType: SurfaceType.CUSHION },
      { x: W * 0.7, y: H * 0.75, width: 140, height: T, angle: -0.3, surfaceType: SurfaceType.CURVED },
    ],
    phaseWalls: [
      { x: W * 0.3, y: H * 0.5, width: T, height: 200, surfaceType: SurfaceType.PHASE, period: 2.0, phaseOffset: 0, onDuration: 0.8 },
      { x: W * 0.5, y: H * 0.5, width: T, height: 180, surfaceType: SurfaceType.PHASE, period: 2.5, phaseOffset: 0.7, onDuration: 1.0 },
      { x: W * 0.7, y: H * 0.55, width: T, height: 220, surfaceType: SurfaceType.PHASE, period: 3.0, phaseOffset: 1.5, onDuration: 1.2 },
      { x: W * 0.6, y: H * 0.35, width: T, height: 150, surfaceType: SurfaceType.PHASE, period: 1.8, phaseOffset: 0.5, onDuration: 0.7 },
    ],
    optimalSwipes: 6,
    par: { efficiency: 0.45, conservation: 0.50, rhythm: 0.18, inputDensity: 3.0 },
  },
];

export function getLevelById(id: number): LevelDefinition | undefined {
  return LEVELS.find((l) => l.id === id);
}

export function getLevelsByCategory(category: string): LevelDefinition[] {
  return LEVELS.filter((l) => l.category === category);
}

export function getTotalLevels(): number {
  return LEVELS.length;
}
