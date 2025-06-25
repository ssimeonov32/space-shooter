export enum Direction {
  UP = "up",
  DOWN = "down",
  LEFT = "left",
  RIGHT = "right",
  LEFT_MOUSE_DOWN = "leftMouseDown",
  RIGHT_MOUSE_DOWN = "rightMouseDown",
}

export enum KeyboardKey {
  W = "KeyW",
  A = "KeyA",
  S = "KeyS",
  D = "KeyD",
}

export enum MouseButton {
  LEFT = "LeftMouseDown",
  RIGHT = "RightMouseDown",
}

export enum HitBoxType {
  RECTANGLE = "rectangle",
  CIRCLE = "circle",
  POLYGON = "polygon",
}

export enum SoundEffect {
  LASER = "laser",
  SHIELD = "shield",
  ROCKET = "rocket",
  ASTEROID_HIT = "asteroidHit",
  ASTEROID_HIT_TWO = "asteroidHitTwo",
  ASTEROID_DESTRUCTION = "asteroidDestruction",
  SHIP_ASTEROID_COLLISION = "shipAsteroidCollision",
}

export enum GameConfigEnum {
  BATTLE_CRUISER = "battleCruiser",
  ASTEROID = "asteroid",
  BOLT = "bolt",
  PLANET = "planet",
}