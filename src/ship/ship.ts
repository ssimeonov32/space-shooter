import { Sprite, AnimatedSprite, Container, Texture, Rectangle, Assets, Graphics } from "pixi.js";
import { Direction, SoundEffect } from "../constants";
import { ShipConfig, ShipWeaponPort } from "../types/ship";
import { SpriteSheet } from "../types/sprite";
import { AudioManager } from "../audio/audio";
import { generateRectangleGraphic } from "../helpers/graphics";
import { HealthBar } from "../healthbar/healthbar";

export class Ship extends Container {
  private shipEngineAnimatedSprite!: AnimatedSprite

  private shipFireAnimatedSprite!: AnimatedSprite;

  private shipShieldAnimatedSprite!: AnimatedSprite;

  private shipDestructionAnimatedSprite!: AnimatedSprite;

  private baseShipSprite!: Sprite;

  private shipConfig!: ShipConfig;

  private shootingInProgress: boolean = false;

  private hitBox!: Graphics;

  private audioManager!: AudioManager;

  private isDestroyed: boolean = false;

  private currentHealthPoints: number = 0;

  private createBulletCallback: (weaponPortPosition: ShipWeaponPort, shipContainer: Container) => void;

  private updatePlayerHasDied: (bool: boolean) => void;

  private healthBar!: HealthBar;
  
  constructor(
    shipConfig: ShipConfig,
    audioManager: AudioManager,
    healthBar: HealthBar,
    createBulletCallback: (weaponPortPosition: ShipWeaponPort, shipContainer: Container) => void,
    updatePlayerHasDied: (bool: boolean) => void,
  ) {
    super();
    this.shipConfig = shipConfig;
    this.audioManager = audioManager;
    this.healthBar = healthBar;
    this.createBulletCallback = createBulletCallback;
    this.updatePlayerHasDied = updatePlayerHasDied;
    this.currentHealthPoints = shipConfig.shipHealthPoints;
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

  public createShipContainer(): Container {
    this.baseShipSprite = Sprite.from(`${this.shipConfig.name}BaseSprite`);
    this.baseShipSprite.anchor.set(0.5);

    this.shipFireAnimatedSprite = this.createAnimatedSpriteFromSpriteSheet(this.shipConfig.shipFiringSheetMetadata);
    this.shipEngineAnimatedSprite = this.createAnimatedSpriteFromSpriteSheet(this.shipConfig.shipEngineSheetMetadata);
    this.shipShieldAnimatedSprite = this.createAnimatedSpriteFromSpriteSheet(this.shipConfig.shipShieldSheetMetadata);
    this.shipDestructionAnimatedSprite = this.createAnimatedSpriteFromSpriteSheet(this.shipConfig.shipDestructionSheetMetadata);


    this.addChild(this.shipEngineAnimatedSprite);
    this.addChild(this.baseShipSprite);
    this.addChild(this.shipShieldAnimatedSprite)
    this.addChild(this.shipDestructionAnimatedSprite);
    this.addChild(this.shipFireAnimatedSprite);
    const shipHitBox = generateRectangleGraphic(this.shipConfig.hitBoxXOffset, this.shipConfig.hitBoxYOffset, this.shipConfig.hitBoxWidth, this.shipConfig.hitBoxHeight);
    shipHitBox.visible = false;
    this.hitBox = shipHitBox;
    this.addChild(shipHitBox);
    return this;
  }

  public toggleShipEngines(state: boolean): void {
    if (!this.shipEngineAnimatedSprite) return;
    this.shipEngineAnimatedSprite.visible = state;
    state ? this.shipEngineAnimatedSprite.play() : this.shipEngineAnimatedSprite.stop();
  }

  public toggleShipFiring(state: boolean): void {
    if (!this.shipFireAnimatedSprite) return;
    state ? this.shipFireAnimatedSprite.play() : this.shipFireAnimatedSprite.stop();
  }

  public toggleShipShield(state: boolean): void {
    if (!this.shipShieldAnimatedSprite) return;
    this.shipShieldAnimatedSprite.visible = state;
    state ? this.shipShieldAnimatedSprite.play() : this.shipShieldAnimatedSprite.stop();
  }

  public toggleShipDestruction(state: boolean): void {
    if (!this.shipDestructionAnimatedSprite) return;
    this.baseShipSprite.visible = !state;
    this.shipDestructionAnimatedSprite.visible = state;
    state ? this.shipDestructionAnimatedSprite.play() : this.shipDestructionAnimatedSprite.stop();
  }

  public followPoint(pointX: number, pointY: number): void {
    if (this.isDestroyed) return;
    const dx = pointX - this.x;
    const dy = pointY - this.y;
    const angle = Math.atan2(dy, dx);
    this.rotation = angle + Math.PI / 2;
  }

  public moveShip(
    appWidth: number,
    appHeight: number,
    direction: Direction,
    delta: number
  ): void {
    if (this.isDestroyed) return;
    const speed = this.shipConfig.shipAcceleration * delta;
    const angle = this.rotation - Math.PI / 2;
    this.toggleShipEngines(true);

    if (direction === Direction.UP) {
      this.x += Math.cos(angle) * speed;
      this.y += Math.sin(angle) * speed;
    }

    if (direction === Direction.DOWN) {
      this.x -= Math.cos(angle) * speed;
      this.y -= Math.sin(angle) * speed;
    }

    if (direction === Direction.LEFT) {
      this.x += Math.sin(angle) * speed;
      this.y -= Math.cos(angle) * speed;
    }

    if (direction === Direction.RIGHT) {
      this.x -= Math.sin(angle) * speed;
      this.y += Math.cos(angle) * speed;
    }

    this.x = Math.max(0, Math.min(appWidth, this.x));
    this.y = Math.max(0, Math.min(appHeight, this.y));
  }

  public shoot(): void {
    if (this.isDestroyed) return;
    if (this.shootingInProgress) return;

    this.shootingInProgress = true;
    this.shipFireAnimatedSprite.visible = true;
    this.shipFireAnimatedSprite.gotoAndPlay(0);

    this.shipFireAnimatedSprite.onFrameChange = (frame: number) => {
      this.shipConfig.weaponPorts.forEach((weaponPortPosition) => {
        if (frame === weaponPortPosition.fireFrame) {
          this.createBulletCallback(weaponPortPosition, this);
        }
      })
      if (frame === this.shipFireAnimatedSprite.textures.length - 1) {
        this.shipFireAnimatedSprite.visible = false;
        this.shipFireAnimatedSprite.stop();
        this.shootingInProgress = false;
      }
    }
  }

  public getHitBox(): Graphics {
    return this.hitBox;
  }

  public updateHealthPoints(update: number): void {
    this.currentHealthPoints += update;
    
    this.healthBar.updateHealthBarDamage(-(this.currentHealthPoints / this.shipConfig.shipHealthPoints * 100 - this.shipConfig.shipHealthPoints))
    
    if (this.currentHealthPoints <= 0) {
      this.destroyShip(this.parent as Container);
    }
  }

  public getHealthPoints(): number {
    return this.currentHealthPoints;
  }

  public destroyShip(stage: Container): void {
    if (this.isDestroyed) return;

    this.isDestroyed = true;

    this.removeChild(this.baseShipSprite);
    this.removeChild(this.shipFireAnimatedSprite);
    this.removeChild(this.shipShieldAnimatedSprite);
    this.removeChild(this.shipEngineAnimatedSprite);
    this.removeChild(this.hitBox);
    
    this.shipDestructionAnimatedSprite.visible = true;
    
    this.audioManager.play(SoundEffect.SHIP_ASTEROID_COLLISION, {
      speed: Math.random() * 0.2 + 0.9,
    })

    this.shipDestructionAnimatedSprite.gotoAndPlay(0);
    this.shipDestructionAnimatedSprite.loop = false;
    this.shipDestructionAnimatedSprite.play();

    this.shipDestructionAnimatedSprite.onComplete = () => {
      this.removeChild(this);
      stage.removeChild(this);
      this.updatePlayerHasDied(true);
    };
  }
}


