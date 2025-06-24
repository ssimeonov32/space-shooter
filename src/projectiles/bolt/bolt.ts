import { AnimatedSprite, Assets, Container, Rectangle, Texture } from "pixi.js";
import { ProjectileInterface, ProjectileConfig } from "../../types/projectile";
import { ShipWeaponPort } from "../../types/ship";

export class Bolt {
  private boltTextures: Texture[] = [];

  private projectileConfig: ProjectileConfig;

  private addBoltEntityCB: (bolt: ProjectileInterface) => void;

  constructor(
    projectileConfig: ProjectileConfig,
    addBoltEntityCB: (bolt: ProjectileInterface) => void
  ) {
    this.projectileConfig = projectileConfig;
    this.addBoltEntityCB = addBoltEntityCB;
    this.createBoltTextures();
  }

  private createBoltTextures(): void {
    const bulletTextures: Texture[] = [];

    for (let i = 0; i < this.projectileConfig.projectileSheetMetadata.framesCount; i++) {
      const frame = new Rectangle(i * this.projectileConfig.projectileSheetMetadata.width, 0, this.projectileConfig.projectileSheetMetadata.width, this.projectileConfig.projectileSheetMetadata.height);
      const texture = new Texture({ source: Assets.get(this.projectileConfig.projectileSheetMetadata.alias), frame });
      bulletTextures.push(texture);
    }
    this.boltTextures = bulletTextures;
  }

  public createBolt(weaponPortPosition: ShipWeaponPort, shipContainer: Container): void {
    const dx = weaponPortPosition.xOffset;
    const dy = weaponPortPosition.yOffset;
    const angle = shipContainer.rotation - Math.PI / 2;
    const offsetX = dx * Math.cos(angle) - dy * Math.sin(angle);
    const offsetY = dx * Math.sin(angle) + dy * Math.cos(angle);

    const bulletX = shipContainer.x + offsetX;
    const bulletY = shipContainer.y + offsetY;

    const bolt = new AnimatedSprite(this.boltTextures);
    bolt.anchor.set(0.5);
    bolt.animationSpeed = this.projectileConfig.projectileSheetMetadata.animationSpeed;
    bolt.x = bulletX;
    bolt.y = bulletY;
    bolt.play();

    this.addBoltEntityCB({ sprite: bolt, rendered: false, uid: bolt.uid });
  }
}