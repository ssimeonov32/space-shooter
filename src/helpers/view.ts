export const isInGameViewport = (targetX: number, targetY: number, viewWidth: number, viewHeight: number): boolean => {
  return targetX >= 0 && targetX <= viewWidth && targetY >= 0 && targetY <= viewHeight;
}

export const isOutsideGameViewport = (targetX: number, targetY: number, viewWidth: number, viewHeight: number): boolean => {
  return targetX < 0 || targetX > viewWidth || targetY < 0 || targetY > viewHeight;
}