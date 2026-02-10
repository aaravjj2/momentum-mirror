import { Vec2, ImpulseData, CollisionData, MetricsSnapshot } from '../types';
import { METRIC_WEIGHTS, SKILL_RATINGS } from '../config';
import {
  normalize, sub, dot, length, mean, standardDeviation, clamp,
} from '../utils/Vector';

export class MetricsEngine {
  // ─── Efficiency tracking ─────────────────────────────────
  private cumulativeTowardGoal: number = 0;
  private cumulativeImpulse: number = 0;

  // ─── Energy conservation tracking ────────────────────────
  private collisions: CollisionData[] = [];
  private initialMomentum: number = 0;
  private hasInitialMomentum: boolean = false;

  // ─── Rhythm tracking ─────────────────────────────────────
  private swipeTimestamps: number[] = [];

  // ─── Input economy tracking ──────────────────────────────
  private swipeCount: number = 0;
  private optimalSwipes: number = 1;

  // ─── General tracking ────────────────────────────────────
  private startTime: number = 0;
  private totalDistance: number = 0;
  private lastPosition: Vec2 | null = null;
  private goalPosition: Vec2 = { x: 0, y: 0 };
  private bounceCount: number = 0;

  reset(goalPosition: Vec2, optimalSwipes: number): void {
    this.cumulativeTowardGoal = 0;
    this.cumulativeImpulse = 0;
    this.collisions = [];
    this.initialMomentum = 0;
    this.hasInitialMomentum = false;
    this.swipeTimestamps = [];
    this.swipeCount = 0;
    this.optimalSwipes = Math.max(1, optimalSwipes);
    this.startTime = performance.now();
    this.totalDistance = 0;
    this.lastPosition = null;
    this.goalPosition = { ...goalPosition };
    this.bounceCount = 0;
  }

  // ─── Called every frame to track movement ────────────────
  trackPosition(position: Vec2): void {
    if (this.lastPosition) {
      const movement = sub(position, this.lastPosition);
      const moveDist = length(movement);
      this.totalDistance += moveDist;

      // Calculate movement toward goal
      const goalDir = normalize(sub(this.goalPosition, this.lastPosition));
      const towardGoal = dot(movement, goalDir);
      if (towardGoal > 0) {
        this.cumulativeTowardGoal += towardGoal;
      }
    }
    this.lastPosition = { ...position };
  }

  // ─── Called when player swipes ───────────────────────────
  recordSwipe(impulse: ImpulseData): void {
    this.swipeCount++;
    this.cumulativeImpulse += impulse.magnitude;
    this.swipeTimestamps.push(impulse.timestamp);

    if (!this.hasInitialMomentum) {
      this.initialMomentum = impulse.magnitude;
      this.hasInitialMomentum = true;
    }
  }

  // ─── Called on collision ─────────────────────────────────
  recordCollision(collision: CollisionData): void {
    this.collisions.push(collision);
    this.bounceCount++;
  }

  // ─── Metric Calculations ────────────────────────────────

  /** Momentum Efficiency: progress toward goal / total impulse */
  getEfficiency(): number {
    if (this.cumulativeImpulse === 0) return 0;
    return clamp(this.cumulativeTowardGoal / this.cumulativeImpulse, 0, 1);
  }

  /** Energy Conservation: momentum preserved through collisions */
  getConservation(): number {
    if (this.collisions.length === 0) return 1;

    let totalLoss = 0;
    let totalInitial = 0;
    for (const c of this.collisions) {
      const loss = Math.max(0, c.momentumBefore - c.momentumAfter);
      totalLoss += loss;
      totalInitial += c.momentumBefore;
    }

    if (totalInitial === 0) return 1;

    const baseCons = 1 - totalLoss / totalInitial;

    // Complexity factor: reward efficient bouncing
    const optimalBounces = Math.max(1, this.optimalSwipes);
    const complexityFactor = clamp(
      optimalBounces / Math.max(1, this.bounceCount),
      0.5,
      1.5
    );

    return clamp(baseCons * complexityFactor, 0, 1);
  }

  /** Rhythmic Consistency: coefficient of variation of inter-swipe intervals */
  getRhythmEntropy(): number {
    if (this.swipeTimestamps.length < 3) return 1;

    const intervals: number[] = [];
    for (let i = 1; i < this.swipeTimestamps.length; i++) {
      intervals.push(this.swipeTimestamps[i] - this.swipeTimestamps[i - 1]);
    }

    const mu = mean(intervals);
    if (mu === 0) return 1;
    const sigma = standardDeviation(intervals);

    return clamp(sigma / mu, 0, 2);
  }

  /** Input Economy: actual swipes / optimal swipes */
  getInputDensity(): number {
    if (this.optimalSwipes === 0) return this.swipeCount;
    return this.swipeCount / this.optimalSwipes;
  }

  /** Composite skill score (0-100) */
  getCompositeScore(): number {
    const eff = this.getEfficiency();
    const rhythm = 1 - clamp(this.getRhythmEntropy(), 0, 1);
    const cons = this.getConservation();
    const economy = clamp(1 / Math.max(1, this.getInputDensity()), 0, 1);

    const raw =
      eff * METRIC_WEIGHTS.EFFICIENCY +
      rhythm * METRIC_WEIGHTS.RHYTHM +
      cons * METRIC_WEIGHTS.CONSERVATION +
      economy * METRIC_WEIGHTS.INPUT_ECONOMY;

    return clamp(Math.round(raw * 100), 0, 100);
  }

  /** Get skill rating label */
  getSkillRating(): string {
    const score = this.getCompositeScore();
    for (const rating of SKILL_RATINGS) {
      if (score >= rating.min && score <= rating.max) {
        return rating.label;
      }
    }
    return 'Novice';
  }

  /** Get full metrics snapshot */
  getSnapshot(): MetricsSnapshot {
    return {
      efficiency: Math.round(this.getEfficiency() * 100) / 100,
      conservation: Math.round(this.getConservation() * 100) / 100,
      rhythmEntropy: Math.round(this.getRhythmEntropy() * 100) / 100,
      inputDensity: Math.round(this.getInputDensity() * 100) / 100,
      compositeScore: this.getCompositeScore(),
      skillRating: this.getSkillRating(),
      totalSwipes: this.swipeCount,
      totalBounces: this.bounceCount,
      completionTime: Math.round((performance.now() - this.startTime) / 10) / 100,
      distanceTraveled: Math.round(this.totalDistance),
    };
  }
}
