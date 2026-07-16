import { useCallback, useEffect, useRef, useState } from 'react'
import { useWsConnection } from '../components/WsContext'
import type { WsUnknownPacket } from '../components/WsContext/types'
import { demoArena } from './demoArena'
import {
  createClientBullet,
  interpolateClientBullets,
  stepClientBullets,
  type ClientBullet,
} from './clientBullets'
import { ARENA_SIZE, type ArenaState, type Bullet } from './types'
import { useKeyboardMovement } from './useKeyboardMovement'

const SNAPSHOT_MS = 80
const FIXED_STEP_SECONDS = 1 / 120
const MAX_FRAME_SECONDS = 0.1
const FIRE_COOLDOWN_MS = 100

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function lerp(start: number, end: number, alpha: number) {
  return start + (end - start) * alpha
}

function normalizeArenaState(payload: unknown): ArenaState | null {
  if (!payload || typeof payload !== 'object') return null

  const value = payload as Partial<ArenaState>
  if (!Array.isArray(value.obstacles) || !Array.isArray(value.players)) return null

  return {
    obstacles: value.obstacles,
    players: value.players,
    bullets: Array.isArray(value.bullets) ? value.bullets : [],
  }
}

function interpolateBullets(previous: Bullet[], next: Bullet[], alpha: number): Bullet[] {
  const previousById = new Map(previous.map((bullet) => [bullet.id, bullet]))
  return next.map((bullet) => {
    const previousBullet = previousById.get(bullet.id)
    if (!previousBullet) return bullet

    return {
      ...bullet,
      x: lerp(previousBullet.x, bullet.x, alpha),
      y: lerp(previousBullet.y, bullet.y, alpha),
    }
  })
}

export function useGameState() {
  const [arena, setArena] = useState<ArenaState>(demoArena)
  const [shotsFired, setShotsFired] = useState(0)
  const movement = useKeyboardMovement()
  const { socket, sendMessage, connectWs } = useWsConnection()

  const lastAimSentAt = useRef(0)
  const lastShotAt = useRef(Number.NEGATIVE_INFINITY)
  const nextBulletId = useRef(0)
  const clientBulletsRef = useRef<ClientBullet[]>([])
  const localHeadingRef = useRef<number | null>(null)
  const latestArenaRef = useRef<ArenaState>(demoArena)
  const previousSnapshotRef = useRef<ArenaState>(demoArena)
  const nextSnapshotRef = useRef<ArenaState>(demoArena)
  const snapshotReceivedAtRef = useRef(0)

  useEffect(() => {
    const wsPath = import.meta.env.VITE_WS_PATH || '/api/ws/'
    connectWs(wsPath)
  }, [connectWs])

  useEffect(() => {
    const currentSocket = socket.current
    if (!currentSocket) return

    const handleIncomingPacket = (event: MessageEvent) => {
      const packet = JSON.parse(event.data) as WsUnknownPacket & {
        payload?: unknown
      }

      if (packet.type !== 'arena_state') return

      const normalizedState = normalizeArenaState(packet.data ?? packet.payload)
      if (!normalizedState) return

      previousSnapshotRef.current = nextSnapshotRef.current
      nextSnapshotRef.current = normalizedState
      snapshotReceivedAtRef.current = performance.now()
    }

    currentSocket.addEventListener('message', handleIncomingPacket)
    return () => {
      currentSocket.removeEventListener('message', handleIncomingPacket)
    }
  }, [socket])

  useEffect(() => {
    let frameId = 0
    let previousFrameAt = performance.now()
    let accumulator = 0

    const animate = (now: number) => {
      const frameSeconds = Math.min((now - previousFrameAt) / 1000, MAX_FRAME_SECONDS)
      previousFrameAt = now
      accumulator += Math.max(0, frameSeconds)

      const previousSnapshot = previousSnapshotRef.current
      const nextSnapshot = nextSnapshotRef.current
      const obstacles = nextSnapshot.obstacles

      while (accumulator >= FIXED_STEP_SECONDS) {
        clientBulletsRef.current = stepClientBullets(
          clientBulletsRef.current,
          FIXED_STEP_SECONDS,
          obstacles,
          ARENA_SIZE,
        )
        accumulator -= FIXED_STEP_SECONDS
      }

      const snapshotAlpha = previousSnapshot === nextSnapshot
        ? 1
        : clamp((now - snapshotReceivedAtRef.current) / SNAPSHOT_MS, 0, 1)
      const serverBullets = interpolateBullets(
        previousSnapshot.bullets,
        nextSnapshot.bullets,
        snapshotAlpha,
      )
      const localHeading = localHeadingRef.current
      const players = localHeading === null
        ? nextSnapshot.players
        : nextSnapshot.players.map((player) => player.isLocal
          ? { ...player, heading: localHeading }
          : player)
      const renderedArena = {
        ...nextSnapshot,
        players,
        bullets: [
          ...serverBullets,
          ...interpolateClientBullets(clientBulletsRef.current, accumulator / FIXED_STEP_SECONDS),
        ],
      }

      latestArenaRef.current = renderedArena
      setArena(renderedArena)

      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [])

  useEffect(() => {
    sendMessage('PLAYER_MOVE', movement)
  }, [movement, sendMessage])

  const handleAim = useCallback(
    (pos: { x: number; y: number }) => {
      const localPlayer = latestArenaRef.current.players.find((player) => player.isLocal)
      if (!localPlayer) return

      const heading = Math.atan2(pos.y - localPlayer.y, pos.x - localPlayer.x)
      localHeadingRef.current = heading
      const now = Date.now()
      if (now - lastAimSentAt.current < 200) return

      sendMessage('PLAYER_AIM', { heading })
      lastAimSentAt.current = now
    },
    [sendMessage],
  )

  const handleShoot = useCallback(() => {
    const now = performance.now()
    if (now - lastShotAt.current < FIRE_COOLDOWN_MS) return

    const localPlayer = latestArenaRef.current.players.find((player) => player.isLocal)
    if (!localPlayer) return

    const heading = localHeadingRef.current ?? localPlayer.heading
    nextBulletId.current += 1
    clientBulletsRef.current.push(createClientBullet(
      `client-${nextBulletId.current}`,
      localPlayer,
      heading,
    ))
    lastShotAt.current = now
    setShotsFired((shots) => shots + 1)
    sendMessage('PLAYER_SHOOT')
  }, [sendMessage])

  return { arena, shotsFired, handleAim, handleShoot }
}
