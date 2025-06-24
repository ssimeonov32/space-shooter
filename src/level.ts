import { AnimatedSprite, Assets, Rectangle, Sprite, Texture } from "pixi.js";
import { LevelConfig } from "./types/level";

export default class Level {
  private levelConfig!: LevelConfig;

  constructor(levelConfig: LevelConfig) {
    this.levelConfig = levelConfig;
  }

  public generateLevel(): Sprite {
    const textures: Texture[] = [];
    for (let i = 0; i < this.levelConfig.planetSpriteSheet.framesCount; i++) {
      const frame = new Rectangle(i * this.levelConfig.planetSpriteSheet.width, 0, this.levelConfig.planetSpriteSheet.width, this.levelConfig.planetSpriteSheet.height);
      const texture = new Texture({ source: Assets.get(this.levelConfig.planetSpriteSheet.alias), frame });
      textures.push(texture);
    }

    const animatedSprite = new AnimatedSprite(textures);
    animatedSprite.anchor.set(0.5);
    animatedSprite.animationSpeed = this.levelConfig.planetSpriteSheet.animationSpeed;
    animatedSprite.visible = true;
    animatedSprite.play();
    return animatedSprite
  }
}