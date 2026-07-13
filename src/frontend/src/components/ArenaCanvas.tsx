import { useEffect, useRef } from 'react'
import { Application, Container, Graphics } from 'pixi.js'
import { ARENA_SIZE, type ArenaState, type Obstacle, type Player } from '../game/types'

type ArenaCanvasProps = {
  state: ArenaState
  onAim?: (position: { x: number; y: number }) => void
  onShoot?: () => void
}

const PLAYER_RADIUS = 18
const GRID_SIZE = 30

function drawGrid(world: Container) {
  const grid = new Graphics()
  grid.rect(0, 0, ARENA_SIZE, ARENA_SIZE).fill({ color: 0x122032 })

  for (let position = 0; position <= ARENA_SIZE; position += GRID_SIZE) {
    grid.moveTo(position, 0).lineTo(position, ARENA_SIZE)
    grid.moveTo(0, position).lineTo(ARENA_SIZE, position)
  }
  grid.stroke({ color: 0x94a3b8, alpha: 0.12, width: 1 })
  world.addChild(grid)
}

function drawObstacle(world: Container, obstacle: Obstacle) {
  const { x, y, size } = obstacle
  const graphic = new Graphics()
  graphic.rect(x, y, size, size).fill({ color: 0x334155 })
  graphic.rect(x + 1.5, y + 1.5, size - 3, size - 3).stroke({ color: 0x64748b, width: 3 })
  graphic.rect(x + 5, y + 5, size - 10, 6).fill({ color: 0xffffff, alpha: 0.06 })
  world.addChild(graphic)
}

function drawPlayer(world: Container, player: Player) {
  const playerContainer = new Container({ x: player.x, y: player.y, rotation: player.heading })
  const body = new Graphics()
  body.circle(0, 0, PLAYER_RADIUS + (player.isLocal ? 5 : 3))
    .fill({ color: player.isLocal ? 0x60a5fa : 0xffffff, alpha: player.isLocal ? 0.22 : 0.1 })
  body.circle(0, 0, PLAYER_RADIUS).fill({ color: player.color }).stroke({ color: 0xf8fafc, width: 2 })

  const arrowLength = PLAYER_RADIUS + 16
  const arrow = new Graphics()
  arrow.moveTo(0, 0).lineTo(arrowLength, 0).stroke({ color: 0x0f172a, width: 5, cap: 'round' })
  arrow.moveTo(arrowLength, 0)
    .lineTo(arrowLength - 10, -7)
    .lineTo(arrowLength - 10, 7)
    .closePath()
    .fill({ color: 0x0f172a })

  playerContainer.addChild(body, arrow)
  world.addChild(playerContainer)
}

function drawArena(world: Container, state: ArenaState) {
  world.removeChildren().forEach((child) => child.destroy())
  drawGrid(world)
  state.obstacles.forEach((obstacle) => drawObstacle(world, obstacle))
  state.players.forEach((player) => drawPlayer(world, player))
}

/** PixiJS renderer for the arena. It draws state only; game rules stay on the server. */
export default function ArenaCanvas({ state, onAim, onShoot }: ArenaCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<Application | null>(null)
  const worldRef = useRef<Container | null>(null)
  const stateRef = useRef(state)
  const onAimRef = useRef(onAim)
  const onShootRef = useRef(onShoot)

  useEffect(() => {
    onAimRef.current = onAim
    onShootRef.current = onShoot
  }, [onAim, onShoot])

  useEffect(() => {
    stateRef.current = state
    if (worldRef.current) {
      drawArena(worldRef.current, state)
      appRef.current?.render()
    }
  }, [state])

  useEffect(() => {
    const application = new Application()
    let isMounted = true

    const startPixi = async () => {
      await application.init({
        width: ARENA_SIZE,
        height: ARENA_SIZE,
        backgroundAlpha: 0,
        antialias: true,
      })
      if (!isMounted || !hostRef.current) {
        application.destroy(true)
        return
      }

      const world = new Container()
      appRef.current = application
      worldRef.current = world
      application.stage.addChild(world)
      application.stage.eventMode = 'static'
      application.stage.hitArea = application.screen
      application.stage.on('pointermove', (event) => onAimRef.current?.(event.global))
      application.stage.on('pointertap', () => onShootRef.current?.())
      hostRef.current.appendChild(application.canvas)
      drawArena(world, stateRef.current)
      application.render()
    }

    void startPixi()
    return () => {
      isMounted = false
      if (appRef.current === application) {
        appRef.current = null
        worldRef.current = null
        application.destroy(true)
      }
    }
  }, [])

  return (
    <div
      ref={hostRef}
      className="aspect-square w-full max-w-[600px] overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/30 [&_canvas]:block [&_canvas]:size-full [&_canvas]:cursor-crosshair [&_canvas]:touch-none"
      role="application"
      aria-label="Game arena"
    />
  )
}
