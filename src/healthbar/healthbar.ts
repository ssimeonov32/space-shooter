import { Assets, Container, Graphics, Sprite } from "pixi.js";
import { ConfigManager } from "../config/config-manager";
import { GameConfigEnum } from "../constants";
import { HealthBarConfig } from "../types/health-bar/health-bar";

export class HealthBar extends Container {
  private configManager!: ConfigManager;

  private healthBarDamage!: Graphics;

  private HEALTH_BAR_WIDTH: number = 128;

  constructor(configManger: ConfigManager) {
    super();
    this.configManager = configManger;
    this.createHealthBarContainer();
  }

  private createHealthBarContainer(): void {
    const healthBarConfig = this.configManager.getConfig<HealthBarConfig>(
      GameConfigEnum.HEALTH_BAR
    );
    const healthBarSprite = new Sprite(
      Assets.get(healthBarConfig.sprite.alias)
    );
    healthBarSprite.scale.set(1.75);

    healthBarSprite.anchor.set(0.5);
    
    
    this.addChild(healthBarSprite);
    
    const width = 0
    const rectangleX = 68 - (width - 2);
    const healthBarDamage = new Graphics();
    healthBarDamage.rect(
      rectangleX,
      -9,
      width,
      10
    )
    this.healthBarDamage = healthBarDamage;
    healthBarDamage.fill(0x00000);
    this.addChild(healthBarDamage);
    this.scale.x = -1;
  }

  public updateHealthBarDamage(healthPointsLostPercentage: number): void {
    if (healthPointsLostPercentage <= 0 || healthPointsLostPercentage > 100) {
      return;
    }

    console.log(healthPointsLostPercentage);
    const width = this.HEALTH_BAR_WIDTH * (healthPointsLostPercentage / 100);
    const rectangleX = 68 - (width - 2);
    this.healthBarDamage.rect(
      rectangleX,
      -9,
      width,
      10
    )
    this.healthBarDamage.fill(0x00000);
  }

  public resetHealthBar(): void {
    this.healthBarDamage.clear();
  }
}