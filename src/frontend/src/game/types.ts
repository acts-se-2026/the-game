export const ARENA_SIZE = 600

export type Obstacle = {
  id: string
  x: number
  y: number
  size: number
}

export type Player = {
  id: string
  x: number
  y: number
  /** Direction the player faces, measured in radians. Zero points right. */
  heading: number
  color: string
  isLocal?: boolean
}

export type Bullet = {
  id: string
  x: number
  y: number
}

export type Explosion = {
  id: string
  x: number
  y: number
  age: number
  maxAge: number
}

export type ArenaState = {
  obstacles: Obstacle[]
  players: Player[]
  bullets: Bullet[]
  explosions: Explosion[]
}
