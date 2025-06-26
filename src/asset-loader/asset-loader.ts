import { Assets } from "pixi.js";
import { sound } from "@pixi/sound";
import { AsteroidConfig } from "../types/asteroid";
import { ProjectileConfig } from "../types/projectile";
import { ShipConfig } from "../types/ship";
import { SpriteSrc } from "../types/sprite";
import { HealthBarConfig, HealthPointConfig } from "../types/health-bar/health-bar";

export default class AssetLoader {

  public async loadHealthBarAssets(): Promise<{ healthBarConfig: HealthBarConfig, healthPointConfig: HealthPointConfig } | void> {
    const healthBarAssetsPath = `${import.meta.env.BASE_URL}/assets/health-bar/`;
    const healthBarConfigPath = `${healthBarAssetsPath}health-bar-config.json`;
  
    const healthPointConfigPath = `${healthBarAssetsPath}health-point-config.json`;
    try {
      const healthBarResponse = await fetch(healthBarConfigPath);
      const healthPointResponse = await fetch(healthPointConfigPath);

      const healthBarConfigData = await healthBarResponse.json();
      const healthPointConfigData = await healthPointResponse.json();

      await Assets.load([
        { alias: healthBarConfigData.sprite.alias, src: `${healthBarAssetsPath}${healthBarConfigData.sprite.src}` },
        { alias: healthPointConfigData.sprite.alias, src: `${healthBarAssetsPath}${healthPointConfigData.sprite.src}` }
      ])

      return {
        healthBarConfig: healthBarConfigData,
        healthPointConfig: healthPointConfigData
      };
    } catch (error) {
      console.error(`Error loading health bar assets configuration from ${healthBarConfigPath}`, error);
    }
  } 

  public async loadAudioAssets(): Promise<void> {
    const audioAssetsPath = `${import.meta.env.BASE_URL}/assets/sounds/`;
    const audioConfigPath = `${audioAssetsPath}audio.json`;
    try {
      const audioConfigResponse = await fetch(audioConfigPath);
      const audioConfigData = await audioConfigResponse.json() as SpriteSrc[]; 
      for (const audioAsset of audioConfigData) {
        const assetPath = `${audioAssetsPath}${audioAsset.src}`;
        sound.add(audioAsset.alias, assetPath);
      }
    } catch (error) {
      console.error(`Error loading audio assets configuration from ${audioConfigPath}`, error);
      return;
    }
  }

  public async loadAsteroidAssets(): Promise<AsteroidConfig | void> {
    const folderPath = `${import.meta.env.BASE_URL}/assets/asteroid/`
    const shipConfigPath = `${folderPath}/asteroid.json`;
    try {
      const asteroidConfigResponse = await fetch(shipConfigPath);
      const asteroidConfigData = await asteroidConfigResponse.json() as AsteroidConfig;

      const asteroidSpriteAssets: SpriteSrc[] = [
        { alias: asteroidConfigData.asteroidDestructionSheetMetadata.alias, src: `${folderPath}/${asteroidConfigData.asteroidDestructionSheetMetadata.src}` }
      ]
      
      asteroidSpriteAssets.push(...asteroidConfigData.sprites.map((sprite: SpriteSrc) => {
        return { alias: sprite.alias, src: `${folderPath}/${sprite.src}` };
      }))

      await Assets.load(asteroidSpriteAssets);
      return asteroidConfigData;
    } catch (error) {
      console.error(`Error loading assets for asteroid`, error);
    }
  }
  
  public async loadProjectile(projectileName: string): Promise<ProjectileConfig | void> {
    const folderPath = `${import.meta.env.BASE_URL}/assets/projectiles/${projectileName}`;
    const projectileConfigPath = `${folderPath}/${projectileName}.json`;
    try {
      const projectileConfigResponse = await fetch(projectileConfigPath);
      const projectileConfigData = await projectileConfigResponse.json() as ProjectileConfig;
      const projectileAssets = [
         { 
          alias: projectileConfigData.projectileSheetMetadata.alias, 
          src: `${folderPath}/${projectileConfigData.projectileSheetMetadata.src}`
         }
      ]
      await Assets.load(projectileAssets);
      return projectileConfigData;
    } catch (error) {
      console.error(`Error loading projectile assets for ${projectileName}:`, error);
    }
  }

  public async loadShip(shipName: string): Promise<ShipConfig | void> {
    const folderPath = `${import.meta.env.BASE_URL}/assets/ships/${shipName}`
    const shipConfigPath = `${folderPath}/${shipName}.json`;
    try {
      const shipConfigResponse = await fetch(shipConfigPath);
      const shipConfigData = await shipConfigResponse.json() as ShipConfig;

      const shipSpriteAssets = this.getShipSpriteAssets(shipConfigData, folderPath);
      await Assets.load(shipSpriteAssets);
      return shipConfigData;
    } catch (error) {
      console.error(`Error loading ship assets for ${shipName}:`, error);
    }
  }

  private getShipSpriteAssets(shipConfig: ShipConfig, folderPath: string): SpriteSrc[] {
    const spriteAssets: SpriteSrc[] = [];
    
    spriteAssets.push(...shipConfig.sprites.map((sprite: SpriteSrc) => {
      return { alias: sprite.alias, src: `${folderPath}/${sprite.src}` };
    }))
    spriteAssets.push({ alias: shipConfig.shipFiringSheetMetadata.alias, src: `${folderPath}/${shipConfig.shipFiringSheetMetadata.src}` });
    spriteAssets.push({alias: shipConfig.shipEngineSheetMetadata.alias, src: `${folderPath}/${shipConfig.shipEngineSheetMetadata.src}`});
    spriteAssets.push({ alias: shipConfig.shipShieldSheetMetadata.alias, src: `${folderPath}/${shipConfig.shipShieldSheetMetadata.src}` });
    spriteAssets.push({ alias: shipConfig.shipDestructionSheetMetadata.alias, src: `${folderPath}/${shipConfig.shipDestructionSheetMetadata.src}` });
    return spriteAssets;
  }

  public async loadPlanetAssets(): Promise<any> {
    const folderPath = `${import.meta.env.BASE_URL}/assets/planet/`;
    const planetConfigPath = `${folderPath}/config.json`;
    try {
      const planetConfigResponse = await fetch(planetConfigPath);
      const planetConfigData = await planetConfigResponse.json();
      await Assets.load({ alias: planetConfigData.planetSpriteSheet.alias, src: `${folderPath}/${planetConfigData.planetSpriteSheet.src}` });
      return planetConfigData;
    } catch (error) {
      console.error(`Error loading planet assets`, error);
    }
  }
}