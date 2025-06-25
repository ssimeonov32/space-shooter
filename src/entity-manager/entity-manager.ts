import { Asteroid } from "../asteroid/asteroid";
import { Ship } from "../ship/ship";
import { ProjectileInterface } from "../types/projectile";

export class EntityManager {
  private boltEntities: Record<number, ProjectileInterface> = {};

  private asteroidEntities: Record<number, Asteroid> = {};

  private playerShipEntity: Ship | undefined = undefined; 

  public setPlayerShipEntity(playerShipEntity: Ship): void {
    this.playerShipEntity = playerShipEntity;
  }

  public getPlayerShipEntity(): Ship | undefined {
    return this.playerShipEntity;
  }

  public addBoltEntity(boltEntity: ProjectileInterface): void {
    if (this.boltEntities[boltEntity.uid]) return;
    this.boltEntities[boltEntity.uid] = boltEntity;
  }

  public removeBoltEntity(uid: number): void {
    if (!this.boltEntities[uid]) return;
    delete this.boltEntities[uid];
  }

  public getBoltEntities(): Record<number, ProjectileInterface> {
    return { ...this.boltEntities };
  }

  public addAsteroidEntity(asteroidEntity: Asteroid): void {
    if (this.asteroidEntities[asteroidEntity.uid]) return;
    this.asteroidEntities[asteroidEntity.uid] = asteroidEntity;
  }

  public removeAsteroidEntity(uid: number): void {
    if (!this.asteroidEntities[uid]) return;
    delete this.asteroidEntities[uid];
  }

  public removeAllAsteroidEntities(): void {
    this.asteroidEntities = {};
  }

  public getAsteroidEntities(): Record<number, Asteroid> {
    return { ...this.asteroidEntities };
  }
}