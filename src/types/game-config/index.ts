import { AsteroidConfig } from "../asteroid";
import { LevelConfig } from "../level";
import { ProjectileConfig } from "../projectile";
import { ShipConfig } from "../ship";

export type GameConfig = AsteroidConfig | ShipConfig | ProjectileConfig | LevelConfig;