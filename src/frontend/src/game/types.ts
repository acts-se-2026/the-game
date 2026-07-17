export const ARENA_SIZE = 600

export type Obstacle = {
  x: number
  y: number
  size:  {
    x: number
    y: number
  }
}

export type Player = {
  id: string
  username: string
  x: number
  y: number
  /** Direction the player faces, measured in radians. Zero points right. */
  heading: number
  color: string
  isLocal?: boolean
}

export type Bullet = {
  x: number
  y: number
  heading: number
}

export type ArenaState = {
  obstacles: Obstacle[]
  players: Player[]
  bullets: Bullet[]
}
