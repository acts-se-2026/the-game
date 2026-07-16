import type { ArenaState } from './types'

// Temporary visual data. Replace this with the state received from the server.
export const demoArena: ArenaState = {
  obstacles: [
    { id: 'obstacle-1', x: 82, y: 78, size: 90 },
    { id: 'obstacle-2', x: 399, y: 72, size: 68 },
    { id: 'obstacle-3', x: 245, y: 230, size: 110 },
    { id: 'obstacle-4', x: 86, y: 435, size: 75 },
    { id: 'obstacle-5', x: 420, y: 415, size: 94 },
  ],
  players: [
    { id: 'you', x: 160, y: 310, heading: 0, color: '#60a5fa', isLocal: true },
    { id: 'enemy-1', x: 505, y: 205, heading: Math.PI * 0.72, color: '#fb7185' },
    { id: 'enemy-2', x: 327, y: 505, heading: -Math.PI / 2, color: '#fbbf24' },
  ],
  bullets: [],
  explosions: [],
}
