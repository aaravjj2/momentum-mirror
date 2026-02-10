import Phaser from 'phaser';
import { SwipeData, Vec2 } from '../types';
import { INPUT, PHYSICS, RENDER, EVENTS } from '../config';
import { distance, normalize, sub, length } from '../utils/Vector';

export class SwipeHandler {
  private scene: Phaser.Scene;
  private isDown: boolean = false;
  private startPos: Vec2 = { x: 0, y: 0 };
  private startTime: number = 0;
  private lastSwipeTime: number = 0;
  private swipeLine: Phaser.GameObjects.Graphics | null = null;
  private trajectoryPreview: Phaser.GameObjects.Graphics | null = null;
  private enabled: boolean = true;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.swipeLine = scene.add.graphics();
    this.swipeLine.setDepth(100);
    this.trajectoryPreview = scene.add.graphics();
    this.trajectoryPreview.setDepth(99);
    this.setupInput();
  }

  private setupInput(): void {
    this.scene.input.on('pointerdown', this.onPointerDown, this);
    this.scene.input.on('pointermove', this.onPointerMove, this);
    this.scene.input.on('pointerup', this.onPointerUp, this);
  }

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    if (!this.enabled) return;

    const now = performance.now();
    if (now - this.lastSwipeTime < INPUT.INPUT_BUFFER_MS) return;

    this.isDown = true;
    this.startPos = { x: pointer.x, y: pointer.y };
    this.startTime = now;

    this.scene.events.emit(EVENTS.SWIPE_START, this.startPos);
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.isDown || !this.enabled) return;

    this.swipeLine!.clear();
    this.trajectoryPreview!.clear();

    const currentPos: Vec2 = { x: pointer.x, y: pointer.y };
    const dist = distance(this.startPos, currentPos);

    if (dist > 5) {
      // Draw swipe direction indicator
      this.swipeLine!.lineStyle(3, 0xffffff, 0.6);
      this.swipeLine!.beginPath();
      this.swipeLine!.moveTo(this.startPos.x, this.startPos.y);
      this.swipeLine!.lineTo(currentPos.x, currentPos.y);
      this.swipeLine!.strokePath();

      // Draw a small circle at start
      this.swipeLine!.fillStyle(0xffffff, 0.4);
      this.swipeLine!.fillCircle(this.startPos.x, this.startPos.y, 6);

      // Draw trajectory preview (dotted line in opposite direction)
      const dir = normalize(sub(this.startPos, currentPos));
      const elapsed = performance.now() - this.startTime;
      const duration = Math.min(elapsed, INPUT.SWIPE_DURATION_MAX);
      const velocity = dist / Math.max(duration, 1);
      const strength = duration * velocity * PHYSICS.BASE_IMPULSE_MULTIPLIER * 0.001;

      this.trajectoryPreview!.lineStyle(2, 0x00ffff, 0.3);
      const previewLength = Math.min(strength * 2, 300);
      const segments = 20;
      for (let i = 0; i < segments; i += 2) {
        const t1 = i / segments;
        const t2 = (i + 1) / segments;
        const x1 = this.startPos.x + dir.x * previewLength * t1;
        const y1 = this.startPos.y + dir.y * previewLength * t1;
        const x2 = this.startPos.x + dir.x * previewLength * t2;
        const y2 = this.startPos.y + dir.y * previewLength * t2;
        this.trajectoryPreview!.beginPath();
        this.trajectoryPreview!.moveTo(x1, y1);
        this.trajectoryPreview!.lineTo(x2, y2);
        this.trajectoryPreview!.strokePath();
      }

      // Arrow head
      const arrowTip = {
        x: this.startPos.x + dir.x * previewLength,
        y: this.startPos.y + dir.y * previewLength,
      };
      this.swipeLine!.fillStyle(0x00ffff, 0.4);
      this.swipeLine!.fillTriangle(
        arrowTip.x,
        arrowTip.y,
        arrowTip.x - dir.y * 8 - dir.x * 12,
        arrowTip.y + dir.x * 8 - dir.y * 12,
        arrowTip.x + dir.y * 8 - dir.x * 12,
        arrowTip.y - dir.x * 8 - dir.y * 12
      );
    }
  }

  private onPointerUp(pointer: Phaser.Input.Pointer): void {
    if (!this.isDown || !this.enabled) return;
    this.isDown = false;

    this.swipeLine!.clear();
    this.trajectoryPreview!.clear();

    const endPos: Vec2 = { x: pointer.x, y: pointer.y };
    const endTime = performance.now();
    const duration = Math.max(
      INPUT.SWIPE_DURATION_MIN,
      Math.min(endTime - this.startTime, INPUT.SWIPE_DURATION_MAX)
    );

    const diff = sub(endPos, this.startPos);
    const dist = length(diff);

    if (dist < 10) return; // too short, ignore

    const velocity = dist / duration; // pixels per ms
    const direction = normalize(sub(this.startPos, endPos)); // opposite direction (flick)

    const swipe: SwipeData = {
      startPos: { ...this.startPos },
      endPos: { ...endPos },
      startTime: this.startTime,
      endTime,
      duration,
      velocity,
      direction,
    };

    this.lastSwipeTime = endTime;
    this.scene.events.emit(EVENTS.SWIPE_END, swipe);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.isDown = false;
      this.swipeLine?.clear();
      this.trajectoryPreview?.clear();
    }
  }

  destroy(): void {
    this.scene.input.off('pointerdown', this.onPointerDown, this);
    this.scene.input.off('pointermove', this.onPointerMove, this);
    this.scene.input.off('pointerup', this.onPointerUp, this);
    this.swipeLine?.destroy();
    this.trajectoryPreview?.destroy();
  }
}
