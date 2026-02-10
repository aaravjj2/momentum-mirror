import { MetricsSnapshot } from '../types';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  category: 'progress' | 'mastery' | 'skill' | 'challenge' | 'special';
  requirement: number;
  unlocked: boolean;
  unlockedAt?: number;
  progress: number;
}

export interface AchievementProgress {
  [achievementId: string]: {
    unlocked: boolean;
    unlockedAt?: number;
    progress: number;
  };
}

interface GlobalStats {
  totalSwipes: number;
  totalBounces: number;
  totalDistance: number;
  totalPlayTime: number;
  levelsCompleted: number;
  perfectScores: number;
  masterScores: number;
  expertScores: number;
  totalGoals: number;
  fastestCompletion: number;
  highestCombo: number;
  totalRetries: number;
}

export class AchievementsManager {
  private static instance: AchievementsManager;
  private achievements: Map<string, Achievement>;
  private progress!: AchievementProgress;
  private globalStats!: GlobalStats;
  private listeners: ((achievement: Achievement) => void)[] = [];

  private constructor() {
    this.achievements = new Map();
    this.initializeAchievements();
    this.loadProgress();
    this.loadGlobalStats();
  }

  static getInstance(): AchievementsManager {
    if (!AchievementsManager.instance) {
      AchievementsManager.instance = new AchievementsManager();
    }
    return AchievementsManager.instance;
  }

  private initializeAchievements(): void {
    const achievements: Achievement[] = [
      // PROGRESS ACHIEVEMENTS
      {
        id: 'first_win',
        name: 'First Victory',
        description: 'Complete your first level',
        icon: '🎯',
        category: 'progress',
        requirement: 1,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'tutorial_complete',
        name: 'Graduate',
        description: 'Complete all tutorial levels (1-5)',
        icon: '🎓',
        category: 'progress',
        requirement: 5,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'halfway_there',
        name: 'Halfway There',
        description: 'Complete 20 levels',
        icon: '🌗',
        category: 'progress',
        requirement: 20,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'completionist',
        name: 'Completionist',
        description: 'Complete all 40 levels',
        icon: '👑',
        category: 'progress',
        requirement: 40,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'master_unlocked',
        name: 'Enter the Master League',
        description: 'Unlock the Master category',
        icon: '⚔️',
        category: 'progress',
        requirement: 30,
        unlocked: false,
        progress: 0,
      },

      // MASTERY ACHIEVEMENTS
      {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Achieve a perfect 100 score',
        icon: '💯',
        category: 'mastery',
        requirement: 1,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'five_stars',
        name: 'Five Star General',
        description: 'Get 5 perfect scores',
        icon: '⭐',
        category: 'mastery',
        requirement: 5,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'master_player',
        name: 'Master Player',
        description: 'Achieve Master rating 10 times',
        icon: '🏆',
        category: 'mastery',
        requirement: 10,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'expert_level',
        name: 'Expert Level',
        description: 'Achieve Expert or higher rating 25 times',
        icon: '🎖️',
        category: 'mastery',
        requirement: 25,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'efficiency_king',
        name: 'Efficiency King',
        description: 'Achieve 95%+ efficiency twice',
        icon: '📐',
        category: 'mastery',
        requirement: 2,
        unlocked: false,
        progress: 0,
      },

      // SKILL ACHIEVEMENTS
      {
        id: 'one_swipe_wonder',
        name: 'One Swipe Wonder',
        description: 'Complete a level with a single swipe',
        icon: '☝️',
        category: 'skill',
        requirement: 1,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'minimalist',
        name: 'Minimalist',
        description: 'Complete 5 levels with optimal swipe count',
        icon: '✨',
        category: 'skill',
        requirement: 5,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'bouncy_castle',
        name: 'Bouncy Castle',
        description: 'Accumulate 1000 total bounces',
        icon: '🏀',
        category: 'skill',
        requirement: 1000,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'marathon_runner',
        name: 'Marathon Runner',
        description: 'Travel 50,000 pixels in total',
        icon: '🏃',
        category: 'skill',
        requirement: 50000,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'swipe_master',
        name: 'Swipe Master',
        description: 'Perform 500 total swipes',
        icon: '👆',
        category: 'skill',
        requirement: 500,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Complete a level in under 5 seconds',
        icon: '⚡',
        category: 'skill',
        requirement: 1,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'rhythm_master',
        name: 'Rhythm Master',
        description: 'Achieve 95%+ rhythmic consistency',
        icon: '🎵',
        category: 'skill',
        requirement: 1,
        unlocked: false,
        progress: 0,
      },

      // CHALLENGE ACHIEVEMENTS
      {
        id: 'persistent',
        name: 'Persistent',
        description: 'Retry a level 20 times',
        icon: '🔄',
        category: 'challenge',
        requirement: 20,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'phase_shifter',
        name: 'Phase Shifter',
        description: 'Complete all rhythm category levels',
        icon: '🌀',
        category: 'challenge',
        requirement: 5,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'precision_artist',
        name: 'Precision Artist',
        description: 'Complete all precision category levels',
        icon: '🎯',
        category: 'challenge',
        requirement: 5,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'efficiency_expert',
        name: 'Efficiency Expert',
        description: 'Complete all efficiency category levels',
        icon: '⚙️',
        category: 'challenge',
        requirement: 5,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'hybrid_hero',
        name: 'Hybrid Hero',
        description: 'Complete all hybrid category levels',
        icon: '🌟',
        category: 'challenge',
        requirement: 10,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'master_champion',
        name: 'Master Champion',
        description: 'Complete all master category levels',
        icon: '👑',
        category: 'challenge',
        requirement: 10,
        unlocked: false,
        progress: 0,
      },

      // SPECIAL ACHIEVEMENTS
      {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Complete a level before 6 AM',
        icon: '🌅',
        category: 'special',
        requirement: 1,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Complete a level after midnight',
        icon: '🦉',
        category: 'special',
        requirement: 1,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'dedicated',
        name: 'Dedicated Player',
        description: 'Play for 60 minutes total',
        icon: '⏱️',
        category: 'special',
        requirement: 3600,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'comeback',
        name: 'Comeback',
        description: 'Improve your score by 30+ points',
        icon: '📈',
        category: 'special',
        requirement: 1,
        unlocked: false,
        progress: 0,
      },
      {
        id: 'conservation_champion',
        name: 'Conservation Champion',
        description: 'Achieve 90%+ energy conservation',
        icon: '⚡',
        category: 'special',
        requirement: 1,
        unlocked: false,
        progress: 0,
      },
    ];

    achievements.forEach((achievement) => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  private loadProgress(): void {
    const saved = localStorage.getItem('momentum_achievements');
    if (saved) {
      this.progress = JSON.parse(saved);
      // Update achievements with saved progress
      this.achievements.forEach((achievement, id) => {
        if (this.progress[id]) {
          achievement.unlocked = this.progress[id].unlocked;
          achievement.unlockedAt = this.progress[id].unlockedAt;
          achievement.progress = this.progress[id].progress;
        }
      });
    } else {
      this.progress = {};
    }
  }

  private loadGlobalStats(): void {
    const saved = localStorage.getItem('momentum_global_stats');
    if (saved) {
      this.globalStats = JSON.parse(saved);
    } else {
      this.globalStats = {
        totalSwipes: 0,
        totalBounces: 0,
        totalDistance: 0,
        totalPlayTime: 0,
        levelsCompleted: 0,
        perfectScores: 0,
        masterScores: 0,
        expertScores: 0,
        totalGoals: 0,
        fastestCompletion: Infinity,
        highestCombo: 0,
        totalRetries: 0,
      };
    }
  }

  private saveProgress(): void {
    localStorage.setItem('momentum_achievements', JSON.stringify(this.progress));
  }

  private saveGlobalStats(): void {
    localStorage.setItem('momentum_global_stats', JSON.stringify(this.globalStats));
  }

  registerListener(callback: (achievement: Achievement) => void): void {
    this.listeners.push(callback);
  }

  private notifyUnlock(achievement: Achievement): void {
    this.listeners.forEach((callback) => callback(achievement));
  }

  private unlockAchievement(id: string): void {
    const achievement = this.achievements.get(id);
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true;
      achievement.unlockedAt = Date.now();
      this.progress[id] = {
        unlocked: true,
        unlockedAt: achievement.unlockedAt,
        progress: achievement.progress,
      };
      this.saveProgress();
      this.notifyUnlock(achievement);
    }
  }

  private updateProgress(id: string, progress: number): void {
    const achievement = this.achievements.get(id);
    if (achievement && !achievement.unlocked) {
      achievement.progress = progress;
      if (!this.progress[id]) {
        this.progress[id] = { unlocked: false, progress: 0 };
      }
      this.progress[id].progress = progress;
      
      if (progress >= achievement.requirement) {
        this.unlockAchievement(id);
      } else {
        this.saveProgress();
      }
    }
  }

  // Called when a level is completed
  onLevelComplete(
    levelId: number,
    metrics: MetricsSnapshot,
    timeMs: number,
    swipes: number,
    bounces: number,
    distance: number,
    wasRetry: boolean
  ): void {
    // Update global stats
    this.globalStats.totalSwipes += swipes;
    this.globalStats.totalBounces += bounces;
    this.globalStats.totalDistance += distance;
    this.globalStats.totalPlayTime += timeMs;
    this.globalStats.levelsCompleted++;
    if (timeMs < this.globalStats.fastestCompletion) {
      this.globalStats.fastestCompletion = timeMs;
    }
    if (wasRetry) {
      this.globalStats.totalRetries++;
    }
    this.globalStats.totalGoals++;

    const score = metrics.compositeScore;
    const rating = this.getSkillRating(score);

    if (score === 100) this.globalStats.perfectScores++;
    if (rating === 'Master') this.globalStats.masterScores++;
    if (rating === 'Expert' || rating === 'Master') this.globalStats.expertScores++;

    this.saveGlobalStats();

    // Check achievements
    this.updateProgress('first_win', this.globalStats.levelsCompleted);
    this.updateProgress('tutorial_complete', Math.min(levelId, 5));
    this.updateProgress('halfway_there', this.globalStats.levelsCompleted);
    this.updateProgress('completionist', this.globalStats.levelsCompleted);
    this.updateProgress('master_unlocked', this.globalStats.levelsCompleted);
    
    if (score === 100) {
      this.updateProgress('perfectionist', this.globalStats.perfectScores);
      this.updateProgress('five_stars', this.globalStats.perfectScores);
    }

    if (rating === 'Master') {
      this.updateProgress('master_player', this.globalStats.masterScores);
    }

    if (rating === 'Expert' || rating === 'Master') {
      this.updateProgress('expert_level', this.globalStats.expertScores);
    }

    if (metrics.efficiency >= 0.95) {
      this.updateProgress('efficiency_king', (this.progress['efficiency_king']?.progress || 0) + 1);
    }

    if (swipes === 1) {
      this.unlockAchievement('one_swipe_wonder');
    }

    const levelData = this.getLevelData(levelId);
    if (levelData && swipes === levelData.optimalSwipes) {
      this.updateProgress('minimalist', (this.progress['minimalist']?.progress || 0) + 1);
    }

    this.updateProgress('bouncy_castle', this.globalStats.totalBounces);
    this.updateProgress('marathon_runner', this.globalStats.totalDistance);
    this.updateProgress('swipe_master', this.globalStats.totalSwipes);

    if (timeMs < 5000) {
      this.unlockAchievement('speed_demon');
    }

    // Rhythmic consistency is inverse of entropy (lower entropy = better consistency)
    const rhythmicConsistency = Math.max(0, 1 - metrics.rhythmEntropy);
    if (rhythmicConsistency >= 0.95) {
      this.unlockAchievement('rhythm_master');
    }

    if (metrics.conservation >= 0.9) {
      this.unlockAchievement('conservation_champion');
    }

    this.updateProgress('dedicated', this.globalStats.totalPlayTime / 1000);

    const hour = new Date().getHours();
    if (hour >= 0 && hour < 6) {
      this.unlockAchievement('early_bird');
    }
    if (hour >= 0 && hour < 3) {
      this.unlockAchievement('night_owl');
    }

    // Category completion checks
    this.checkCategoryCompletion();
  }

  onLevelRetry(retryCount: number): void {
    if (retryCount >= 20) {
      this.unlockAchievement('persistent');
    }
  }

  onScoreImprovement(oldScore: number, newScore: number): void {
    if (newScore - oldScore >= 30) {
      this.unlockAchievement('comeback');
    }
  }

  private checkCategoryCompletion(): void {
    const progress = this.getLevelProgress();
    
    // Rhythm (11-15)
    const rhythmComplete = [11, 12, 13, 14, 15].every(id => progress[id]?.completed);
    if (rhythmComplete) {
      this.unlockAchievement('phase_shifter');
    }

    // Precision (16-20)
    const precisionComplete = [16, 17, 18, 19, 20].every(id => progress[id]?.completed);
    if (precisionComplete) {
      this.unlockAchievement('precision_artist');
    }

    // Efficiency (6-10)
    const efficiencyComplete = [6, 7, 8, 9, 10].every(id => progress[id]?.completed);
    if (efficiencyComplete) {
      this.unlockAchievement('efficiency_expert');
    }

    // Hybrid (21-30)
    const hybridComplete = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30].every(id => progress[id]?.completed);
    if (hybridComplete) {
      this.unlockAchievement('hybrid_hero');
    }

    // Master (31-40)
    const masterComplete = [31, 32, 33, 34, 35, 36, 37, 38, 39, 40].every(id => progress[id]?.completed);
    if (masterComplete) {
      this.unlockAchievement('master_champion');
    }
  }

  private getLevelData(levelId: number): { optimalSwipes: number } | null {
    // This would need to be imported from LevelData
    // For now, return null
    return null;
  }

  private getLevelProgress(): { [key: number]: { completed: boolean } } {
    const saved = localStorage.getItem('momentum_progress');
    return saved ? JSON.parse(saved) : {};
  }

  private getSkillRating(score: number): string {
    if (score >= 96) return 'Master';
    if (score >= 81) return 'Expert';
    if (score >= 61) return 'Advanced';
    if (score >= 41) return 'Intermediate';
    if (score >= 21) return 'Beginner';
    return 'Novice';
  }

  getAllAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  getAchievementsByCategory(category: Achievement['category']): Achievement[] {
    return this.getAllAchievements().filter((a) => a.category === category);
  }

  getUnlockedCount(): number {
    return this.getAllAchievements().filter((a) => a.unlocked).length;
  }

  getTotalCount(): number {
    return this.achievements.size;
  }

  getCompletionPercentage(): number {
    return Math.round((this.getUnlockedCount() / this.getTotalCount()) * 100);
  }

  getGlobalStats(): GlobalStats {
    return { ...this.globalStats };
  }

  getRecentlyUnlocked(limit: number = 5): Achievement[] {
    return this.getAllAchievements()
      .filter((a) => a.unlocked && a.unlockedAt)
      .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))
      .slice(0, limit);
  }
}
