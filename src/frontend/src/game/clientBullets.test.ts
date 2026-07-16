import { describe, expect, it } from 'vitest'
import {
  BULLET_RADIUS,
  createClientBullet,
  createClientExplosion,
  EXPLOSION_LIFETIME_SECONDS,
  stepClientBullets,
  stepClientExplosions,
} from './clientBullets'

describe('stepClientBullets', () => {
  it('spawns an impact when a bullet collides with an obstacle', () => {
    const bullet = createClientBullet('b-1', { x: 70, y: 100 }, 0)

    const stepped = stepClientBullets(
      [bullet],
      0.1,
      [{ id: 'obs', x: 120, y: 80, size: 40 }],
      600,
    )

    expect(stepped.bullets).toHaveLength(0)
    expect(stepped.impacts).toHaveLength(1)
    expect(stepped.impacts[0]?.x).toBeGreaterThanOrEqual(BULLET_RADIUS)
    expect(stepped.impacts[0]?.y).toBeGreaterThanOrEqual(BULLET_RADIUS)
  })

  it('does not spawn an impact when a bullet expires by lifetime', () => {
    const bullet = {
      ...createClientBullet('b-2', { x: 200, y: 200 }, 0),
      velocityX: 0,
      velocityY: 0,
      age: 1.99,
    }

    const stepped = stepClientBullets([bullet], 0.02, [], 600)

    expect(stepped.bullets).toHaveLength(0)
    expect(stepped.impacts).toHaveLength(0)
  })
})

describe('stepClientExplosions', () => {
  it('removes explosion after its max age', () => {
    const explosion = createClientExplosion('exp-1', { x: 210, y: 210 })

    const active = stepClientExplosions([explosion], EXPLOSION_LIFETIME_SECONDS / 2)
    expect(active).toHaveLength(1)

    const expired = stepClientExplosions(active, EXPLOSION_LIFETIME_SECONDS)
    expect(expired).toHaveLength(0)
  })
})