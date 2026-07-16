import type { Bullet, Obstacle } from './types'

export const BULLET_RADIUS = 4
export const BULLET_SPEED = 550

const BULLET_LIFETIME_SECONDS = 2
const MUZZLE_DISTANCE = 26

export type ClientBullet = Bullet & {
  previousX: number
  previousY: number
  velocityX: number
  velocityY: number
  age: number
}

type Position = {
  x: number
  y: number
}

export function createClientBullet(
  id: string,
  origin: Position,
  heading: number,
): ClientBullet {
  const directionX = Math.cos(heading)
  const directionY = Math.sin(heading)
  const x = origin.x + directionX * MUZZLE_DISTANCE
  const y = origin.y + directionY * MUZZLE_DISTANCE

  return {
    id,
    x,
    y,
    previousX: x,
    previousY: y,
    velocityX: directionX * BULLET_SPEED,
    velocityY: directionY * BULLET_SPEED,
    age: 0,
  }
}

function segmentIntersectsObstacle(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  obstacle: Obstacle,
) {
  const minX = obstacle.x - BULLET_RADIUS
  const maxX = obstacle.x + obstacle.size + BULLET_RADIUS
  const minY = obstacle.y - BULLET_RADIUS
  const maxY = obstacle.y + obstacle.size + BULLET_RADIUS
  const deltaX = endX - startX
  const deltaY = endY - startY
  let entry = 0
  let exit = 1

  for (const [start, delta, min, max] of [
    [startX, deltaX, minX, maxX],
    [startY, deltaY, minY, maxY],
  ]) {
    if (delta === 0) {
      if (start < min || start > max) return false
      continue
    }

    const first = (min - start) / delta
    const second = (max - start) / delta
    entry = Math.max(entry, Math.min(first, second))
    exit = Math.min(exit, Math.max(first, second))
    if (entry > exit) return false
  }

  return true
}

export function stepClientBullets(
  bullets: ClientBullet[],
  deltaSeconds: number,
  obstacles: Obstacle[],
  arenaSize: number,
): ClientBullet[] {
  if (!Number.isFinite(deltaSeconds) || deltaSeconds <= 0) return bullets

  return bullets.flatMap((bullet) => {
    const x = bullet.x + bullet.velocityX * deltaSeconds
    const y = bullet.y + bullet.velocityY * deltaSeconds
    const age = bullet.age + deltaSeconds
    const isOutsideArena =
      x < BULLET_RADIUS ||
      y < BULLET_RADIUS ||
      x > arenaSize - BULLET_RADIUS ||
      y > arenaSize - BULLET_RADIUS
    const hitObstacle = obstacles.some((obstacle) =>
      segmentIntersectsObstacle(bullet.x, bullet.y, x, y, obstacle),
    )

    if (age >= BULLET_LIFETIME_SECONDS || isOutsideArena || hitObstacle) return []

    return [{
      ...bullet,
      previousX: bullet.x,
      previousY: bullet.y,
      x,
      y,
      age,
    }]
  })
}

export function interpolateClientBullets(
  bullets: ClientBullet[],
  alpha: number,
): Bullet[] {
  const safeAlpha = Math.min(1, Math.max(0, alpha))

  return bullets.map((bullet) => ({
    id: bullet.id,
    x: bullet.previousX + (bullet.x - bullet.previousX) * safeAlpha,
    y: bullet.previousY + (bullet.y - bullet.previousY) * safeAlpha,
  }))
}