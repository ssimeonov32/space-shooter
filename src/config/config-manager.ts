export class ConfigManager {
  private configs: Record<string, any> = {};

  public setConfig(key: string, config: any): void {
    this.configs[key] = config;
  }

  public getConfig<T>(key: string): T | undefined {
    return this.configs[key] as T | undefined;
  }
}