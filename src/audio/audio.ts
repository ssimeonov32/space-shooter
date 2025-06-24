import { sound, PlayOptions } from '@pixi/sound';

export class AudioManager {
  private globalVolume: number = 0.30;

  public play(alias: string, options?: PlayOptions): void {
    sound.play(alias, {...options, volume: options?.volume ? options.volume : this.globalVolume});
  }

  public stop(alias: string): void {
    sound.stop(alias);
  }
}