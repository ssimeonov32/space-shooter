import { Container, Sprite } from "pixi.js";

export const isPointInCircle = (pointX: number, pointY: number, circleX: number, circleY: number, radius: number): boolean => {
  const dx = pointX - circleX;
  const dy = pointY - circleY;
  return dx * dx + dy * dy <= radius * radius;
}

export const rectangleCollision = (object1: Sprite | Container, object2: Sprite | Container): boolean => {
  const bounds1 = object1.getBounds();
  const bounds2 = object2.getBounds();
  return (
    bounds1.x < bounds2.x + bounds2.width
    && bounds1.x + bounds1.width > bounds2.x
    && bounds1.y < bounds2.y + bounds2.height
    && bounds1.y + bounds1.height > bounds2.y
  );
}

export function rotatedRectCircleCollision(
  cx: number, cy: number, cr: number,
  rx: number, ry: number, rw: number, rh: number,
  rotation: number
): boolean {
  const dx = cx - rx;
  const dy = cy - ry;

  const cos = Math.cos(-rotation);
  const sin = Math.sin(-rotation);
  const localX = dx * cos - dy * sin;
  const localY = dx * sin + dy * cos;

  const closestX = Math.max(-rw / 2, Math.min(localX, rw / 2));
  const closestY = Math.max(-rh / 2, Math.min(localY, rh / 2));

  const distX = localX - closestX;
  const distY = localY - closestY;

  return (distX * distX + distY * distY) <= cr * cr;
}