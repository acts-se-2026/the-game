import { describe, expect, it } from 'vitest'
import { demoArena } from './demoArena'

describe('demoArena', () => {
  it('includes the required arena collections', () => {
    expect(Array.isArray(demoArena.obstacles)).toBe(true)
    expect(Array.isArray(demoArena.players)).toBe(true)
    expect(Array.isArray(demoArena.bullets)).toBe(true)
  })
})
