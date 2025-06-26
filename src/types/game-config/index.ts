import { AsteroidConfig } from "../asteroid";
import { HealthBarConfig, HealthPointConfig } from "../health-bar/health-bar";
import { LevelConfig } from "../level";
import { ProjectileConfig } from "../projectile";
import { ShipConfig } from "../ship";

export type GameConfig = AsteroidConfig | ShipConfig | ProjectileConfig | LevelConfig | HealthBarConfig | HealthPointConfig;