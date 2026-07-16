import { describe, expect, it } from 'vitest'
import {
  BULLET_RADIUS,
  BULLET_SPEED,
  createClientBullet,
  interpolateClientBullets,
  stepClientBullets,
} from './clientBullets'

describe('client bullets', () => {
  it('spawns at the muzzle and travels in the aimed direction', () => {
    const bullet = createClientBullet('shot-1', { x: 100, y: 120 }, Math.PI / 2)

    expect(bullet.x).toBeCloseTo(100)
    expect(bullet.y).toBeGreaterThan(120)
    expect(bullet.velocityX).toBeCloseTo(0)
    expect(bullet.velocityY).toBeCloseTo(BULLET_SPEED)
  })

  it('uses delta time so travel is independent of the update rate', () => {
    const bullet = createClientBullet('shot-1', { x: 100, y: 100 }, 0)
    const oneStep = stepClientBullets([bullet], 0.1, [], 600)
    const twoSteps = stepClientBullets(
      stepClientBullets([bullet], 0.04, [], 600),
      0.06,
      [],
      600,
    )

    expect(oneStep[0].x).toBeCloseTo(twoSteps[0].x)
    expect(oneStep[0].y).toBeCloseTo(twoSteps[0].y)
  })

  it('ignores invalid delta times', () => {
    const bullet = createClientBullet('shot-1', { x: 100, y: 100 }, 0)

    expect(stepClientBullets([bullet], Number.NaN, [], 600)).toEqual([bullet])
    expect(stepClientBullets([bullet], -1, [], 600)).toEqual([bullet])
  })

  it('interpolates between the previous and current simulation positions', () => {
    const bullet = createClientBullet('shot-1', { x: 100, y: 100 }, 0)
    const [advanced] = stepClientBullets([bullet], 0.1, [], 600)

    const [rendered] = interpolateClientBullets([advanced], 0.25)

    expect(rendered.x).toBeCloseTo(advanced.previousX + (advanced.x - advanced.previousX) * 0.25)
    expect(rendered.y).toBeCloseTo(advanced.previousY)
  })

  it('removes bullets that cross an obstacle even during a long frame', () => {
    const bullet = createClientBullet('shot-1', { x: 50, y: 150 }, 0)
    const obstacles = [{ id: 'wall', x: 100, y: 100, size: 100 }]

    expect(stepClientBullets([bullet], 0.5, obstacles, 600)).toEqual([])
  })

  it('removes expired and out-of-bounds bullets', () => {
    const expired = { ...createClientBullet('old', { x: 300, y: 300 }, 0), age: 2 }
    const leaving = createClientBullet('leaving', { x: 600 - BULLET_RADIUS - 1, y: 300 }, 0)

    expect(stepClientBullets([expired], 0.01, [], 600)).toEqual([])
    expect(stepClientBullets([leaving], 0.1, [], 600)).toEqual([])
  })
})