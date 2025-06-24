import { HitBoxType } from "../../constants";
import { SpriteSrc, SpriteSheet } from "../sprite";

export interface ShipWeaponPort {
  xOffset: number;
  yOffset: number;
  fireFrame: number;
}

export interface ShipConfig {
  name: string;
  sprites: SpriteSrc[];
  shipFiringSheetMetadata: SpriteSheet;
  shipEngineSheetMetadata: SpriteSheet;
  shipShieldSheetMetadata: SpriteSheet,
  shipDestructionSheetMetadata: SpriteSheet;
  weaponPorts: ShipWeaponPort[];
  shipAcceleration: number;
  shipFireRate: number;
  shipHealthPoints: number;
  hitBoxType: HitBoxType;
  hitBoxXOffset: number;
  hitBoxYOffset: number;
  hitBoxWidth: number;
  hitBoxHeight: number;
  hitBoxRadius: number;
}