export const getRandomPosition = (width: number, height: number): { x: number; y: number } => {
  const x = Math.random() * width;
  const y = Math.random() * height;
  return { x, y };
}

export const getOffscreenSpawnPosition = (viewWidth: number, viewHeight: number): { x: number; y: number } => {
  const buffer = 50;
  const edge = Math.floor(Math.random() * 4);

  switch (edge) {
    case 0:
      return { x: Math.random() * viewWidth, y: -buffer };
    case 1:
      return { x: viewWidth + buffer, y: Math.random() * viewHeight };
    case 2:
      return { x: Math.random() * viewWidth, y: viewHeight + buffer };
    case 3:
    default:
      return { x: -buffer, y: Math.random() * viewHeight };
  }
}

export const isWithinBuffer = (posA: { x: number; y: number }, posB: { x: number; y: number }, buffer: number): boolean => {
  return (Math.abs(posA.x - posB.x) <= buffer && Math.abs(posA.y - posB.y) <= buffer);
}