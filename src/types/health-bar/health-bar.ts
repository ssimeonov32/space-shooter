export interface HealthBarConfig {
  name: string;
  sprite: {
    alias: string;
    src: string;
    width: number;
    height: number;
  },
  numberOfHealthPoints: number;
}

export interface HealthPointConfig {
  name: string;
  sprite: {
    alias: string;
    src: string;
    width: number;
    height: number;
  }
}