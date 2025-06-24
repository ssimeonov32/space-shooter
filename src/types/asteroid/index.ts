
import { HitBoxType } from "../../constants";
import { SpriteSrc, SpriteSheet } from "../sprite";

export interface AsteroidConfig {
  name: string;
  sprites: SpriteSrc[];
  asteroidDestructionSheetMetadata: SpriteSheet;
  healthPoints: number;
  damage: number;
  hitBoxType: HitBoxType;
  hitBoxXOffset: number;
  hitBoxYOffset: number;
  hitBoxWidth: number;
  hitBoxHeight: number;
  hitBoxRadius: number;
}