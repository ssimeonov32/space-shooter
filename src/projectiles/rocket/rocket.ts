import { AnimatedSprite, Assets, Container, Rectangle, Texture } from "pixi.js";
import { ProjectileInterface, ProjectileConfig } from "../../types/projectile";
import { ShipWeaponPort } from "../../types/ship";

export class Rocket {
  private textures: Texture[] = [];

  private projectileConfig: ProjectileConfig;

  private updateRockets: (rockets: ProjectileInterface[]) => void;

  constructor(
    projectileConfig: ProjectileConfig,
    updateRocketsCallback: (rockets: ProjectileInterface[]) => void
  ) {
    this.projectileConfig = projectileConfig;
    this.updateRockets = updateRocketsCallback;
    this.createTextures();
  }

  private createTextures(): void {
    const textures: Texture[] = [];

    for (let i = 0; i < this.projectileConfig.projectileSheetMetadata.framesCount; i++) {
      const frame = new Rectangle(i * this.projectileConfig.projectileSheetMetadata.width, 0, this.projectileConfig.projectileSheetMetadata.width, this.projectileConfig.projectileSheetMetadata.height);
      const texture = new Texture({ source: Assets.get( this.projectileConfig.projectileSheetMetadata.alias), frame });
      textures.push(texture);
    }
    this.textures = textures;
  }

  public createProjectile(weaponPortPosition: ShipWeaponPort, shipContainer: Container): void {
    const dx = weaponPortPosition.xOffset;
    const dy = weaponPortPosition.yOffset;
    const angle = shipContainer.rotation - Math.PI / 2;
    const offsetX = dx * Math.cos(angle) - dy * Math.sin(angle);
    const offsetY = dx * Math.sin(angle) + dy * Math.cos(angle);

    const projectileX = shipContainer.x + offsetX;
    const projectileY = shipContainer.y + offsetY;

    const projectile = new AnimatedSprite(this.textures);
    projectile.anchor.set(0.5);
    projectile.animationSpeed = this.projectileConfig.projectileSheetMetadata.animationSpeed;
    projectile.x = projectileX;
    projectile.y = projectileY;
    projectile.play();

    this.updateRockets([{ sprite: projectile, rendered: false, uid: projectile.uid }]);
  }
}