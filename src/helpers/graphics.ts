import { Graphics } from "pixi.js";

export const generateRectangleGraphic = (x: number, y: number, width: number, height: number, color?: number): Graphics => {
  const graphic = new Graphics();
  graphic.rect(x, y, width, height);
  graphic.fill(color);
  return graphic;
}

export const generateCircleGraphic = (x: number, y: number, radius: number, color?: number): Graphics => {
  const graphic = new Graphics();
  graphic.circle(x, y, radius);
  graphic.fill(color);
  return graphic;
}