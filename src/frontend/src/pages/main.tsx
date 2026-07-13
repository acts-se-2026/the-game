

import { useEffect, useState } from 'react'
import ArenaCanvas from '../components/ArenaCanvas'
import { demoArena } from '../game/demoArena'
import { ARENA_SIZE, type ArenaState } from '../game/types'
import { useKeyboardMovement } from '../game/useKeyboardMovement'

const PLAYER_RADIUS = 18
const PREVIEW_SPEED = 200

function updateLocalPlayer(
  state: ArenaState,
  update: (player: ArenaState['players'][number]) => ArenaState['players'][number],
) {
  return {
    ...state,
    players: state.players.map((player) => (player.isLocal ? update(player) : player)),
  }
}

const MainPage = () => {
  const [arena, setArena] = useState(demoArena)
  const [shotsRequested, setShotsRequested] = useState(0)
  const movement = useKeyboardMovement()

  useEffect(() => {
    if (movement.x === 0 && movement.y === 0) return

    let previousFrame = performance.now()
    let frameId = 0
    const movePlayer = (now: number) => {
      const distance = (now - previousFrame) / 1000 * PREVIEW_SPEED
      previousFrame = now
      setArena((state) => updateLocalPlayer(state, (player) => ({
        ...player,
        x: Math.max(PLAYER_RADIUS, Math.min(ARENA_SIZE - PLAYER_RADIUS, player.x + movement.x * distance)),
        y: Math.max(PLAYER_RADIUS, Math.min(ARENA_SIZE - PLAYER_RADIUS, player.y + movement.y * distance)),
      })))
      frameId = requestAnimationFrame(movePlayer)
    }
    frameId = requestAnimationFrame(movePlayer)
    return () => cancelAnimationFrame(frameId)
  }, [movement])

  const handleAim = ({ x, y }: { x: number; y: number }) => {
    setArena((state) => updateLocalPlayer(state, (player) => ({
      ...player,
      heading: Math.atan2(y - player.y, x - player.x),
    })))
  }

  const handleShoot = () => {
    setShotsRequested((shots) => shots + 1)
    // Later, send a shoot event through the WebSocket here.
  }

  return (
    <main className="game-page">
      <section className="game-header" aria-labelledby="page-title">
        <div>
          <p className="eyebrow">Top-down shooter</p>
          <h1 id="page-title">Arena</h1>
        </div>
        <div className="connection-status">
          <span className="status-dot" />
          Controls ready
        </div>
      </section>

      <section className="game-layout" aria-label="Game preview">
        <ArenaCanvas state={arena} onAim={handleAim} onShoot={handleShoot} />
        <aside className="arena-info">
          <h2>Match preview</h2>
          <p>Use WASD or the arrow keys to move. Aim with the mouse and click to shoot.</p>
          <div className="legend" aria-label="Player colour legend">
            <span><i className="legend-dot you" />You</span>
            <span><i className="legend-dot enemy" />Opponent</span>
            <span><i className="legend-block" />Obstacle</span>
          </div>
          <p className="tip">Shots requested: {shotsRequested}. The arrow shows your current aim.</p>
        </aside>
      </section>
    </main>
  )
}

export default MainPage
