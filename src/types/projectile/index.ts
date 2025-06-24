import { AnimatedSprite } from "pixi.js";
import { SpriteSheet } from "../sprite";

export interface ProjectileConfig {
  name: string;
  projectileSheetMetadata: SpriteSheet;
  speed: number;
  damage: number;
}

export interface ProjectileInterface {
  sprite: AnimatedSprite;
  rendered: boolean;
  uid: number;
}