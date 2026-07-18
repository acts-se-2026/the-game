export const ARENA_WIDTH = 1280
export const ARENA_HEIGHT = 720

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
  hp: number
  /** Direction the player faces, measured in radians. Zero points right. */
  heading: number
  color: string
  isLocal?: boolean
}

export type Bullet = {
  x: number
  y: number
  heading: number
  ownerId: string
  damage: number
}

export type Chest = {
  x: number
  y: number
  size: {
    x: number
    y: number
  }
  effect: string
}

export type ArenaState = {
  obstacles: Obstacle[]
  players: Player[]
  bullets: Bullet[]
  chests: Chest[]
}
