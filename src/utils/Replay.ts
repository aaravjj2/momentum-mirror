import { ReplayData, ReplayFrame, MetricsSnapshot, Vec2 } from '../types';

export class ReplayRecorder {
  private frames: ReplayFrame[] = [];
  private levelId: number;
  private seed: number;
  private startTime: number = 0;

  constructor(levelId: number, seed: number = Date.now()) {
    this.levelId = levelId;
    this.seed = seed;
  }

  start(): void {
    this.frames = [];
    this.startTime = performance.now();
  }

  recordFrame(playerPos: Vec2, playerVel: Vec2): void {
    this.frames.push({
      timestamp: performance.now() - this.startTime,
      playerPos: { ...playerPos },
      playerVel: { ...playerVel },
    });
  }

  finish(metrics: MetricsSnapshot): ReplayData {
    return {
      levelId: this.levelId,
      seed: this.seed,
      frames: this.frames,
      metrics,
      date: Date.now(),
    };
  }

  getFrameCount(): number {
    return this.frames.length;
  }
}

const REPLAY_KEY = 'momentum-mirror-replays';

export function saveReplay(replay: ReplayData): void {
  try {
    const existing = loadReplays();
    existing.push(replay);
    // Keep only last 20 replays
    if (existing.length > 20) {
      existing.splice(0, existing.length - 20);
    }
    localStorage.setItem(REPLAY_KEY, JSON.stringify(existing));
  } catch {
    console.warn('Failed to save replay');
  }
}

export function loadReplays(): ReplayData[] {
  try {
    const data = localStorage.getItem(REPLAY_KEY);
    if (data) return JSON.parse(data);
  } catch {
    // ignore
  }
  return [];
}
