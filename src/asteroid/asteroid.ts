import { Graphics, Sprite, Container, AnimatedSprite, Assets, Rectangle, Texture } from "pixi.js";
import { AsteroidConfig } from "../types/asteroid";
import { SpriteSheet } from "../types/sprite";
import { AudioManager } from "../audio/audio";
import { EntityManager } from "../entity-manager/entity-manager";
import { generateCircleGraphic } from "../helpers/graphics";
import { SoundEffects } from "../constants";

export class Asteroid extends Container {
  private asteroidConfig!: AsteroidConfig;

  private sprite!: Sprite;

  private asteroidDestructionAnimatedSprite!: AnimatedSprite;

  private hitBox!: Graphics;

  private vx: number = 0;
  private vy: number = 0;

  private audioManager!: AudioManager;

  private entityManager!: EntityManager;

  private isDestroyed: boolean = false;

  private hasEnteredView: boolean = false;

  constructor(
    asteroidConfig: AsteroidConfig,
    audioManager: AudioManager,
    entityManager: EntityManager
  ) {
    super();
    this.asteroidConfig = asteroidConfig;
    this.audioManager = audioManager;
    this.entityManager = entityManager;
    this.createAsteroidContainer();
  }

  private createAnimatedSpriteFromSpriteSheet(spriteSheet: SpriteSheet): AnimatedSprite {
    const textures: Texture[] = [];
    for (let i = 0; i < spriteSheet.framesCount; i++) {
      const frame = new Rectangle(i * spriteSheet.width, 0, spriteSheet.width, spriteSheet.height);
      const texture = new Texture({ source: Assets.get(spriteSheet.alias), frame });
      textures.push(texture);
    }

    const animatedSprite = new AnimatedSprite(textures);
    animatedSprite.anchor.set(0.5);
    animatedSprite.animationSpeed = spriteSheet.animationSpeed;
    animatedSprite.visible = false;
    return animatedSprite;
  }

  private createAsteroidContainer(): void {
    this.sprite = Sprite.from("asteroidBaseSprite");
    this.sprite.anchor.set(0.5);

    this.asteroidDestructionAnimatedSprite = this.createAnimatedSpriteFromSpriteSheet(this.asteroidConfig.asteroidDestructionSheetMetadata);

    this.addChild(this.sprite);
    this.addChild(this.asteroidDestructionAnimatedSprite);

    const asteroidHitBox = generateCircleGraphic(this.asteroidConfig.hitBoxXOffset, this.asteroidConfig.hitBoxYOffset, this.asteroidConfig.hitBoxRadius);
    asteroidHitBox.visible = false;
    this.hitBox = asteroidHitBox;
    this.addChild(this.hitBox);
  }

  public getHitBox(): Graphics {
    return this.hitBox;
  }

  public getHealthPoints(): number {
    return this.asteroidConfig.healthPoints;
  }

  public destroyAsteroid(stage: Container): void {
    if (!this.hasEnteredView) return;
    if (this.isDestroyed) return;
    
    this.isDestroyed = true;

    this.audioManager.play(SoundEffects.ASTEROID_DESTRUCTION, { volume: 2});
    this.asteroidDestructionAnimatedSprite.gotoAndPlay(0);
    this.asteroidDestructionAnimatedSprite.loop = false;
    this.removeChild(this.sprite);
    this.asteroidDestructionAnimatedSprite.visible = true;
    this.asteroidDestructionAnimatedSprite.play();

    this.asteroidDestructionAnimatedSprite.onComplete = () => {
      this.entityManager.removeAsteroidEntity(this.uid);
      stage.removeChild(this);
    };
  }

  public updateHealthPoints(update: number): void {
    this.asteroidConfig.healthPoints += update;
    if (this.asteroidConfig.healthPoints <= 0 && !this.isDestroyed) {
      this.destroyAsteroid(this.parent);
    }
  }

  public moveAsteroid(deltaTime: number): void {
  this.x += this.vx * deltaTime;
  this.y += this.vy * deltaTime;
}

  public rotateAsteroid(deltaTime: number, rotationSpeed: number): void {
    this.rotation += rotationSpeed * deltaTime;
  }

  public setDirectionToward(targetX: number, targetY: number, speed: number): void {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    this.vx = (dx / length) * speed;
    this.vy = (dy / length) * speed;

    this.rotation = Math.atan2(dy, dx);
  }

  public updateVisibility(): void {
    if (this.hasEnteredView) return;
    this.hasEnteredView = true
  }

  public getHasEnteredView(): boolean {
    return this.hasEnteredView;
  }

  public getIsDestroyed(): boolean {
    return this.isDestroyed;
  }

  public getDamage(): number {
    return this.asteroidConfig.damage;
  }
}