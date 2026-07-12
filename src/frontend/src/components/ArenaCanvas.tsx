import { useEffect, useRef } from 'react'
import { ARENA_SIZE, type ArenaState, type Obstacle, type Player } from '../game/types'

type ArenaCanvasProps = {
  state: ArenaState
  onAim?: (position: { x: number; y: number }) => void
  onShoot?: () => void
}

const PLAYER_RADIUS = 18
const GRID_SIZE = 30

function drawGrid(context: CanvasRenderingContext2D) {
  context.fillStyle = '#122032'
  context.fillRect(0, 0, ARENA_SIZE, ARENA_SIZE)

  context.beginPath()
  for (let position = 0; position <= ARENA_SIZE; position += GRID_SIZE) {
    context.moveTo(position, 0)
    context.lineTo(position, ARENA_SIZE)
    context.moveTo(0, position)
    context.lineTo(ARENA_SIZE, position)
  }
  context.strokeStyle = 'rgba(148, 163, 184, 0.12)'
  context.lineWidth = 1
  context.stroke()
}

function drawObstacle(context: CanvasRenderingContext2D, obstacle: Obstacle) {
  const { x, y, size } = obstacle
  context.fillStyle = '#334155'
  context.fillRect(x, y, size, size)
  context.strokeStyle = '#64748b'
  context.lineWidth = 3
  context.strokeRect(x + 1.5, y + 1.5, size - 3, size - 3)

  context.fillStyle = 'rgba(255, 255, 255, 0.06)'
  context.fillRect(x + 5, y + 5, size - 10, 6)
}

function drawPlayer(context: CanvasRenderingContext2D, player: Player) {
  const { x, y, heading, color, isLocal } = player
  const arrowLength = PLAYER_RADIUS + 16

  context.beginPath()
  context.arc(x, y, PLAYER_RADIUS + (isLocal ? 5 : 3), 0, Math.PI * 2)
  context.fillStyle = isLocal ? 'rgba(96, 165, 250, 0.22)' : 'rgba(255, 255, 255, 0.1)'
  context.fill()

  context.beginPath()
  context.arc(x, y, PLAYER_RADIUS, 0, Math.PI * 2)
  context.fillStyle = color
  context.fill()
  context.strokeStyle = '#f8fafc'
  context.lineWidth = 2
  context.stroke()

  context.save()
  context.translate(x, y)
  context.rotate(heading)
  context.strokeStyle = '#0f172a'
  context.fillStyle = '#0f172a'
  context.lineWidth = 5
  context.lineCap = 'round'
  context.beginPath()
  context.moveTo(0, 0)
  context.lineTo(arrowLength, 0)
  context.stroke()
  context.beginPath()
  context.moveTo(arrowLength, 0)
  context.lineTo(arrowLength - 10, -7)
  context.lineTo(arrowLength - 10, 7)
  context.closePath()
  context.fill()
  context.restore()
}

function drawArena(context: CanvasRenderingContext2D, state: ArenaState) {
  drawGrid(context)
  state.obstacles.forEach((obstacle) => drawObstacle(context, obstacle))
  state.players.forEach((player) => drawPlayer(context, player))
}

export default function ArenaCanvas({ state, onAim, onShoot }: ArenaCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (context) drawArena(context, state)
  }, [state])

  const getArenaPosition = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    return {
      x: (event.clientX - bounds.left) * (ARENA_SIZE / bounds.width),
      y: (event.clientY - bounds.top) * (ARENA_SIZE / bounds.height),
    }
  }

  return (
    <canvas
      ref={canvasRef}
      className="arena-canvas"
      width={ARENA_SIZE}
      height={ARENA_SIZE}
      aria-label="Game arena"
      onMouseMove={(event) => onAim?.(getArenaPosition(event))}
      onClick={onShoot}
    />
  )
}
