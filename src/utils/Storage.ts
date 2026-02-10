import { PlayerProgress, MetricsSnapshot } from '../types';

const STORAGE_KEY = 'momentum-mirror-progress';

export function loadProgress(): PlayerProgress {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data) as PlayerProgress;
    }
  } catch {
    // corrupted data, start fresh
  }
  return {
    levelsCompleted: [],
    bestScores: {},
    totalPlayTime: 0,
    achievements: [],
  };
}

export function saveProgress(progress: PlayerProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    console.warn('Failed to save progress');
  }
}

export function updateBestScore(
  levelId: number,
  metrics: MetricsSnapshot
): void {
  const progress = loadProgress();
  const existing = progress.bestScores[levelId];

  if (!existing || metrics.compositeScore > existing.compositeScore) {
    progress.bestScores[levelId] = metrics;
  }

  if (!progress.levelsCompleted.includes(levelId)) {
    progress.levelsCompleted.push(levelId);
  }

  saveProgress(progress);
}

export function isLevelUnlocked(levelId: number): boolean {
  if (levelId <= 1) return true;
  const progress = loadProgress();
  return progress.levelsCompleted.includes(levelId - 1);
}

export function getCompletedLevels(): number[] {
  return loadProgress().levelsCompleted;
}

export function getBestScore(levelId: number): MetricsSnapshot | null {
  return loadProgress().bestScores[levelId] ?? null;
}
