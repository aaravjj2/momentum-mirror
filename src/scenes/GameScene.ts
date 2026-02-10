import Phaser from 'phaser';
import {
  PHYSICS, RENDER, EVENTS, SCENES,
  SurfaceType, SURFACE_RESTITUTION, SURFACE_COLORS,
  CURVED_ANGULAR_FACTOR,
} from '../config';
import { SwipeHandler } from '../input/SwipeHandler';
import { MetricsEngine } from '../metrics/MetricsEngine';
import { ReplayRecorder } from '../utils/Replay';
import { updateBestScore, getBestScore } from '../utils/Storage';
import { getLevelById } from '../levels/LevelData';
import { getAudioManager } from '../audio/AudioManager';
import { AchievementsManager } from '../achievements/AchievementsManager';
import { AchievementNotification } from '../ui/AchievementNotification';
import {
  SwipeData, CollisionData, LevelDefinition, PhaseWallDefinition, Vec2,
} from '../types';
import { length, normalize, sub, dot, scale, reflect, rotate } from '../utils/Vector';

interface WallBody {
  body: MatterJS.BodyType;
  graphics: Phaser.GameObjects.Graphics;
  surfaceType: SurfaceType;
  def: PhaseWallDefinition | null;
}

export class GameScene extends Phaser.Scene {
  // ─── Core systems ──────────────────────────────────────
  private swipeHandler!: SwipeHandler;
  private metricsEngine!: MetricsEngine;
  private replayRecorder!: ReplayRecorder;
  private achievementsManager!: AchievementsManager;
  private achievementNotification!: AchievementNotification;

  // ─── Game objects ──────────────────────────────────────
  private player!: Phaser.GameObjects.Arc;
  private playerBody!: MatterJS.BodyType;
  private goal!: Phaser.GameObjects.Arc;
  private goalGlow!: Phaser.GameObjects.Arc;
  private wallBodies: WallBody[] = [];
  private trailPoints: Vec2[] = [];
  private trailGraphics!: Phaser.GameObjects.Graphics;
  private particleGraphics!: Phaser.GameObjects.Graphics;

  // ─── State ─────────────────────────────────────────────
  private currentLevel: LevelDefinition | null = null;
  private levelStartTime: number = 0;
  private isLevelComplete: boolean = false;
  private retryCount: number = 0;
  private particles: Array<{
    x: number; y: number; vx: number; vy: number;
    life: number; maxLife: number; color: number; size: number;
  }> = [];

  // ─── HUD ───────────────────────────────────────────────
  private hudText!: Phaser.GameObjects.Text;
  private levelNameText!: Phaser.GameObjects.Text;
  private descText!: Phaser.GameObjects.Text;
  private restartBtn!: Phaser.GameObjects.Text;
  private backBtn!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: SCENES.GAME });
  }

  init(data: { levelId: number; isRetry?: boolean; isTestLevel?: boolean; isCustomLevel?: boolean }): void {
    // Handle test level from editor
    if (data.isTestLevel) {
      this.currentLevel = this.registry.get('editorTestLevel') || null;
    }
    // Handle custom level playback
    else if (data.isCustomLevel) {
      const customLevel = this.registry.get('customLevelToPlay');
      if (customLevel) {
        this.currentLevel = customLevel.definition;
      } else {
        this.currentLevel = null;
      }
    }
    // Handle regular level
    else {
      this.currentLevel = getLevelById(data.levelId) || null;
    }
    
    this.isLevelComplete = false;
    this.particles = [];
    this.trailPoints = [];
    this.wallBodies = [];
    
    if (data.isRetry) {
      this.retryCount++;
    } else {
      this.retryCount = 0;
    }
  }

  create(): void {
    if (!this.currentLevel) {
      this.scene.start(SCENES.LEVEL_SELECT);
      return;
    }

    // Setup Matter physics
    this.matter.world.setBounds(0, 0, RENDER.WIDTH, RENDER.HEIGHT);
    this.matter.world.setGravity(0, PHYSICS.GRAVITY);

    // Background
    this.createBackground();

    // Graphics layers
    this.trailGraphics = this.add.graphics().setDepth(5);
    this.particleGraphics = this.add.graphics().setDepth(50);

    // Build level
    this.buildLevel(this.currentLevel);

    // Create player
    this.createPlayer(this.currentLevel.playerStart);

    // Create goal
    this.createGoal(this.currentLevel.goalPosition);

    // Initialize systems
    this.metricsEngine = new MetricsEngine();
    this.metricsEngine.reset(
      this.currentLevel.goalPosition,
      this.currentLevel.optimalSwipes
    );

    this.replayRecorder = new ReplayRecorder(this.currentLevel.id);
    this.replayRecorder.start();

    this.swipeHandler = new SwipeHandler(this);

    // Initialize achievements
    this.achievementsManager = AchievementsManager.getInstance();
    this.achievementNotification = new AchievementNotification(this);
    this.achievementsManager.registerListener((achievement) => {
      this.achievementNotification.show(achievement);
    });

    // Track retries
    if (this.retryCount > 0) {
      this.achievementsManager.onLevelRetry(this.retryCount);
    }

    // Listen for swipe events
    this.events.on(EVENTS.SWIPE_END, this.onSwipe, this);

    // Setup collision detection
    this.matter.world.on('collisionstart', this.onCollision, this);

    // Create HUD
    this.createHUD();

    this.levelStartTime = performance.now();

    // Camera
    this.cameras.main.setBackgroundColor(0x0a0a1a);
  }

  private createBackground(): void {
    const bg = this.add.graphics().setDepth(0);

    // Grid pattern
    bg.lineStyle(1, 0x1a1a3a, 0.3);
    for (let x = 0; x < RENDER.WIDTH; x += 60) {
      bg.beginPath();
      bg.moveTo(x, 0);
      bg.lineTo(x, RENDER.HEIGHT);
      bg.strokePath();
    }
    for (let y = 0; y < RENDER.HEIGHT; y += 60) {
      bg.beginPath();
      bg.moveTo(0, y);
      bg.lineTo(RENDER.WIDTH, y);
      bg.strokePath();
    }
  }

  private buildLevel(level: LevelDefinition): void {
    // Static walls
    for (const wallDef of level.walls) {
      this.createWall(wallDef, false);
    }

    // Phase walls
    if (level.phaseWalls) {
      for (const pw of level.phaseWalls) {
        this.createWall(pw, true);
      }
    }
  }

  private createWall(
    wallDef: LevelDefinition['walls'][0] | PhaseWallDefinition,
    isPhase: boolean
  ): void {
    const color = SURFACE_COLORS[wallDef.surfaceType];
    const restitution = SURFACE_RESTITUTION[wallDef.surfaceType];

    const body = this.matter.add.rectangle(
      wallDef.x, wallDef.y,
      wallDef.width, wallDef.height,
      {
        isStatic: true,
        restitution,
        friction: 0,
        angle: wallDef.angle || 0,
        label: `wall_${wallDef.surfaceType}`,
      }
    );

    const gfx = this.add.graphics().setDepth(10);
    gfx.fillStyle(color, 0.8);
    gfx.lineStyle(2, color, 1);

    // Draw the wall
    const hw = wallDef.width / 2;
    const hh = wallDef.height / 2;

    if (wallDef.angle) {
      gfx.save();
      gfx.setPosition(wallDef.x, wallDef.y);
      gfx.setRotation(wallDef.angle);
      gfx.fillRect(-hw, -hh, wallDef.width, wallDef.height);
      gfx.strokeRect(-hw, -hh, wallDef.width, wallDef.height);
      gfx.restore();
    } else {
      gfx.fillRect(wallDef.x - hw, wallDef.y - hh, wallDef.width, wallDef.height);
      gfx.strokeRect(wallDef.x - hw, wallDef.y - hh, wallDef.width, wallDef.height);
    }

    // Special visual for spring walls
    if (wallDef.surfaceType === SurfaceType.SPRING) {
      gfx.lineStyle(2, 0xffffff, 0.3);
      const isHorizontal = wallDef.width > wallDef.height;
      if (isHorizontal) {
        for (let i = 0; i < wallDef.width; i += 20) {
          const sx = wallDef.x - hw + i;
          gfx.beginPath();
          gfx.moveTo(sx, wallDef.y - 3);
          gfx.lineTo(sx + 10, wallDef.y + 3);
          gfx.strokePath();
        }
      }
    }

    const phaseDef = isPhase ? (wallDef as PhaseWallDefinition) : null;
    this.wallBodies.push({ body, graphics: gfx, surfaceType: wallDef.surfaceType, def: phaseDef });
  }

  private createPlayer(pos: Vec2): void {
    // Glow effect
    const glow = this.add.circle(pos.x, pos.y, RENDER.PLAYER_RADIUS * 2, 0x00ffff, 0.15);
    glow.setDepth(14);

    // Player circle
    this.player = this.add.circle(pos.x, pos.y, RENDER.PLAYER_RADIUS, 0x00ffff, 1);
    this.player.setDepth(15);
    this.player.setStrokeStyle(2, 0xffffff, 0.8);

    // Inner highlight
    const inner = this.add.circle(pos.x, pos.y, RENDER.PLAYER_RADIUS * 0.5, 0xffffff, 0.3);
    inner.setDepth(16);

    // Physics body
    this.playerBody = this.matter.add.circle(pos.x, pos.y, RENDER.PLAYER_RADIUS, {
      restitution: 1,
      friction: 0,
      frictionAir: PHYSICS.FRICTION_COEFFICIENT / 60,
      density: 0.001,
      label: 'player',
    });

    // Store references for inner/glow
    this.player.setData('glow', glow);
    this.player.setData('inner', inner);
  }

  private createGoal(pos: Vec2): void {
    // Outer glow
    this.goalGlow = this.add.circle(pos.x, pos.y, RENDER.GOAL_RADIUS * 2.5, 0xf1c40f, 0.1);
    this.goalGlow.setDepth(8);

    // Pulsing ring
    const ring = this.add.circle(pos.x, pos.y, RENDER.GOAL_RADIUS * 1.5, 0xf1c40f, 0);
    ring.setStrokeStyle(2, 0xf1c40f, 0.4);
    ring.setDepth(8);

    // Goal
    this.goal = this.add.circle(pos.x, pos.y, RENDER.GOAL_RADIUS, 0xf1c40f, 0.6);
    this.goal.setStrokeStyle(3, 0xffffff, 0.8);
    this.goal.setDepth(9);

    // Star inside
    const star = this.add.star(pos.x, pos.y, 5, RENDER.GOAL_RADIUS * 0.3, RENDER.GOAL_RADIUS * 0.6, 0xffffff, 0.5);
    star.setDepth(10);

    // Pulse animation
    this.tweens.add({
      targets: ring,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0,
      duration: 1500,
      repeat: -1,
      ease: 'Cubic.easeOut',
    });

    this.tweens.add({
      targets: this.goalGlow,
      scaleX: 1.1,
      scaleY: 1.1,
      alpha: 0.2,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.tweens.add({
      targets: star,
      angle: 360,
      duration: 8000,
      repeat: -1,
    });
  }

  private createHUD(): void {
    const style = {
      fontFamily: '"Segoe UI", Arial, sans-serif',
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    };

    this.levelNameText = this.add.text(RENDER.WIDTH / 2, 30, '', {
      ...style,
      fontSize: '28px',
      color: '#00ffff',
    }).setOrigin(0.5).setDepth(200);

    this.descText = this.add.text(RENDER.WIDTH / 2, 65, '', {
      ...style,
      fontSize: '16px',
      color: '#aaaaaa',
      wordWrap: { width: 600 },
    }).setOrigin(0.5, 0).setDepth(200);

    this.hudText = this.add.text(20, 20, '', style).setDepth(200);

    // Update level info
    if (this.currentLevel) {
      this.levelNameText.setText(`${this.currentLevel.id}. ${this.currentLevel.name}`);
      this.descText.setText(this.currentLevel.description);

      // Fade out description after 4 seconds  
      this.time.delayedCall(4000, () => {
        this.tweens.add({
          targets: this.descText,
          alpha: 0,
          duration: 1000,
        });
      });
    }

    // Restart button
    this.restartBtn = this.add.text(RENDER.WIDTH - 120, 25, '↻ Restart', {
      ...style,
      fontSize: '20px',
      color: '#ff6b6b',
      backgroundColor: '#1a1a3a',
      padding: { x: 12, y: 6 },
    }).setDepth(200).setInteractive({ useHandCursor: true });
    this.restartBtn.on('pointerdown', () => this.restartLevel());
    this.restartBtn.on('pointerover', () => this.restartBtn.setColor('#ff9999'));
    this.restartBtn.on('pointerout', () => this.restartBtn.setColor('#ff6b6b'));

    // Back button
    this.backBtn = this.add.text(RENDER.WIDTH - 250, 25, '← Levels', {
      ...style,
      fontSize: '20px',
      color: '#4a90d9',
      backgroundColor: '#1a1a3a',
      padding: { x: 12, y: 6 },
    }).setDepth(200).setInteractive({ useHandCursor: true });
    this.backBtn.on('pointerdown', () => {
      this.cleanup();
      this.scene.start(SCENES.LEVEL_SELECT);
    });
    this.backBtn.on('pointerover', () => this.backBtn.setColor('#7ab8f5'));
    this.backBtn.on('pointerout', () => this.backBtn.setColor('#4a90d9'));
  }

  // ─── Input Handling ────────────────────────────────────

  private onSwipe(swipe: SwipeData): void {
    if (this.isLevelComplete) return;

    const impulseStrength =
      swipe.duration * swipe.velocity * PHYSICS.BASE_IMPULSE_MULTIPLIER * 0.001;

    const impulseX = swipe.direction.x * impulseStrength;
    const impulseY = swipe.direction.y * impulseStrength;

    // Apply impulse to player body
    this.matter.body.applyForce(this.playerBody, this.playerBody.position, {
      x: impulseX * 0.01,
      y: impulseY * 0.01,
    });

    // Play swipe sound
    const power = Math.min(1, impulseStrength / 100);
    getAudioManager().playSwipe(power);

    // Record for metrics
    this.metricsEngine.recordSwipe({
      direction: swipe.direction,
      magnitude: impulseStrength,
      timestamp: performance.now(),
    });

    // Swipe particles
    this.spawnParticles(
      this.playerBody.position.x,
      this.playerBody.position.y,
      0x00ffff,
      8,
      3
    );
  }

  // ─── Collision Handling ────────────────────────────────

  private onCollision(event: Phaser.Physics.Matter.Events.CollisionStartEvent): void {
    for (const pair of event.pairs) {
      const bodyA = pair.bodyA;
      const bodyB = pair.bodyB;

      let wallBody: MatterJS.BodyType | null = null;
      let playerBody: MatterJS.BodyType | null = null;

      if (bodyA.label === 'player') {
        playerBody = bodyA;
        wallBody = bodyB;
      } else if (bodyB.label === 'player') {
        playerBody = bodyB;
        wallBody = bodyA;
      }

      if (!playerBody || !wallBody) continue;

      // Find the wall info
      const wallInfo = this.wallBodies.find((w) => w.body === wallBody || w.body.id === wallBody!.id);
      const surfaceType = wallInfo?.surfaceType || SurfaceType.STANDARD;

      // Calculate collision data
      const vel = playerBody.velocity;
      const momentumBefore = length({ x: vel.x, y: vel.y }) * (playerBody.mass || 1);

      // Get collision normal from contact
      const normal = pair.collision.normal;

      // Apply surface-specific effects
      if (surfaceType === SurfaceType.CURVED) {
        // Angular deflection
        const currentVel = { x: vel.x, y: vel.y };
        const rotated = rotate(currentVel, CURVED_ANGULAR_FACTOR);
        this.matter.body.setVelocity(playerBody, rotated);
      }

      const velAfter = playerBody.velocity;
      const momentumAfter = length({ x: velAfter.x, y: velAfter.y }) * (playerBody.mass || 1);

      const collision: CollisionData = {
        point: { x: pair.collision.supports[0]?.x || playerBody.position.x, y: pair.collision.supports[0]?.y || playerBody.position.y },
        normal: { x: normal.x, y: normal.y },
        momentumBefore,
        momentumAfter,
        surfaceType,
        angle: Math.atan2(normal.y, normal.x),
        timestamp: performance.now(),
      };

      this.metricsEngine.recordCollision(collision);

      // Play collision sound
      const velocity = length({ x: velAfter.x, y: velAfter.y });
      getAudioManager().playCollision(velocity, surfaceType);

      // Spawn collision particles
      const color = SURFACE_COLORS[surfaceType] || 0xffffff;
      this.spawnParticles(
        collision.point.x,
        collision.point.y,
        color,
        RENDER.PARTICLE_COUNT,
        surfaceType === SurfaceType.SPRING ? 5 : 3
      );
    }
  }

  // ─── Particle System ──────────────────────────────────

  private spawnParticles(
    x: number, y: number, color: number, count: number, speed: number
  ): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const spd = speed * (0.5 + Math.random());
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 1,
        maxLife: 0.5 + Math.random() * 0.3,
        color,
        size: 2 + Math.random() * 3,
      });
    }
  }

  private updateParticles(delta: number): void {
    this.particleGraphics.clear();

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= delta / (p.maxLife * 1000);
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96;
      p.vy *= 0.96;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      const alpha = p.life;
      const size = p.size * p.life;
      this.particleGraphics.fillStyle(p.color, alpha);
      this.particleGraphics.fillCircle(p.x, p.y, size);
    }
  }

  // ─── Phase Walls ───────────────────────────────────────

  private updatePhaseWalls(time: number): void {
    for (const wb of this.wallBodies) {
      if (wb.def && wb.surfaceType === SurfaceType.PHASE) {
        const elapsed = (time / 1000) % wb.def.period;
        const adjustedTime = (elapsed + wb.def.phaseOffset) % wb.def.period;
        const isActive = adjustedTime < wb.def.onDuration;

        // Toggle collision
        if (isActive) {
          wb.body.collisionFilter.mask = 0xFFFFFFFF;
          wb.graphics.setAlpha(0.8);
        } else {
          wb.body.collisionFilter.mask = 0;
          wb.graphics.setAlpha(0.15);
        }
      }
    }
  }

  // ─── Trail Rendering ──────────────────────────────────

  private updateTrail(): void {
    const pos = this.playerBody.position;
    this.trailPoints.push({ x: pos.x, y: pos.y });

    if (this.trailPoints.length > RENDER.TRAIL_LENGTH) {
      this.trailPoints.shift();
    }

    this.trailGraphics.clear();

    if (this.trailPoints.length < 2) return;

    for (let i = 1; i < this.trailPoints.length; i++) {
      const alpha = (i / this.trailPoints.length) * 0.4;
      const width = (i / this.trailPoints.length) * RENDER.PLAYER_RADIUS * 0.8;

      this.trailGraphics.lineStyle(width, 0x00ffff, alpha);
      this.trailGraphics.beginPath();
      this.trailGraphics.moveTo(this.trailPoints[i - 1].x, this.trailPoints[i - 1].y);
      this.trailGraphics.lineTo(this.trailPoints[i].x, this.trailPoints[i].y);
      this.trailGraphics.strokePath();
    }
  }

  // ─── Goal Detection ───────────────────────────────────

  private checkGoalReached(): void {
    if (this.isLevelComplete || !this.currentLevel) return;

    const playerPos = this.playerBody.position;
    const goalPos = this.currentLevel.goalPosition;
    const dist = length(sub(
      { x: playerPos.x, y: playerPos.y },
      goalPos
    ));

    if (dist < RENDER.GOAL_RADIUS + RENDER.PLAYER_RADIUS) {
      this.onLevelComplete();
    }
  }

  private onLevelComplete(): void {
    this.isLevelComplete = true;
    this.swipeHandler.setEnabled(false);

    // Play goal sound
    getAudioManager().playGoal();

    // Celebration particles
    const pos = this.playerBody.position;
    for (let i = 0; i < 5; i++) {
      this.time.delayedCall(i * 100, () => {
        this.spawnParticles(pos.x, pos.y, 0xf1c40f, 20, 6);
        this.spawnParticles(pos.x, pos.y, 0x00ffff, 15, 4);
      });
    }

    // Flash effect
    this.cameras.main.flash(300, 255, 255, 255, false, (_cam: Phaser.Cameras.Scene2D.Camera, progress: number) => {
      if (progress === 1) {
        // Get final metrics
        const metrics = this.metricsEngine.getSnapshot();
        const completionTime = performance.now() - this.levelStartTime;

        // Track achievements
        if (this.currentLevel) {
          // Check for score improvement
          const oldBest = getBestScore(this.currentLevel.id);
          if (oldBest && oldBest.compositeScore) {
            this.achievementsManager.onScoreImprovement(
              oldBest.compositeScore,
              metrics.compositeScore
            );
          }

          // Track level completion
          this.achievementsManager.onLevelComplete(
            this.currentLevel.id,
            metrics,
            completionTime,
            metrics.totalSwipes,
            metrics.totalBounces,
            metrics.distanceTraveled,
            this.retryCount > 0
          );
        }

        // Save score
        if (this.currentLevel) {
          updateBestScore(this.currentLevel.id, metrics);
        }

        // Transition to results
        this.time.delayedCall(800, () => {
          this.cleanup();
          this.scene.start(SCENES.RESULTS, {
            levelId: this.currentLevel!.id,
            metrics,
            retryCount: this.retryCount,
          });
        });
      }
    });
  }

  // ─── Update Loop ───────────────────────────────────────

  update(time: number, delta: number): void {
    if (!this.currentLevel || !this.playerBody) return;

    // Update player visual position
    const pos = this.playerBody.position;
    this.player.setPosition(pos.x, pos.y);

    const glow = this.player.getData('glow') as Phaser.GameObjects.Arc;
    const inner = this.player.getData('inner') as Phaser.GameObjects.Arc;
    if (glow) glow.setPosition(pos.x, pos.y);
    if (inner) inner.setPosition(pos.x, pos.y);

    // Track metrics
    this.metricsEngine.trackPosition({ x: pos.x, y: pos.y });

    // Record replay frame
    this.replayRecorder.recordFrame(
      { x: pos.x, y: pos.y },
      { x: this.playerBody.velocity.x, y: this.playerBody.velocity.y }
    );

    // Update trail
    this.updateTrail();

    // Update particles
    this.updateParticles(delta);

    // Update phase walls
    this.updatePhaseWalls(time);

    // Check goal
    this.checkGoalReached();

    // Update HUD
    this.updateHUD(time);

    // Speed glow effect
    const speed = length({
      x: this.playerBody.velocity.x,
      y: this.playerBody.velocity.y,
    });
    if (glow) {
      const glowScale = 1 + Math.min(speed * 0.1, 1);
      glow.setScale(glowScale);
      glow.setAlpha(Math.min(0.15 + speed * 0.02, 0.5));
    }
  }

  private updateHUD(time: number): void {
    if (this.isLevelComplete) return;

    const elapsed = ((performance.now() - this.levelStartTime) / 1000).toFixed(1);
    const eff = (this.metricsEngine.getEfficiency() * 100).toFixed(0);
    const swipes = this.metricsEngine.getSnapshot().totalSwipes;
    const speed = length({
      x: this.playerBody.velocity.x,
      y: this.playerBody.velocity.y,
    }).toFixed(1);

    this.hudText.setText(
      `Time: ${elapsed}s  |  Swipes: ${swipes}  |  Efficiency: ${eff}%  |  Speed: ${speed}`
    );
  }

  // ─── Level Control ─────────────────────────────────────

  private restartLevel(): void {
    if (!this.currentLevel) return;
    this.cleanup();
    this.scene.restart({ levelId: this.currentLevel.id });
  }

  private cleanup(): void {
    this.events.off(EVENTS.SWIPE_END, this.onSwipe, this);
    this.matter.world.off('collisionstart', this.onCollision, this);
    this.swipeHandler?.destroy();
    this.matter.world.resetCollisionIDs();
  }
}
