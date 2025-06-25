import { GameConfigEnum } from "../constants";
import { GameConfig } from "../types/game-config";

export class ConfigManager {
  private configs: Record<string, GameConfig> = {};

  public setConfig(key: GameConfigEnum, config: GameConfig): void {
    this.configs[key] = config;
  }

  public getConfig<T>(key: GameConfigEnum): T {
    return this.configs[key] as T;
  }
}