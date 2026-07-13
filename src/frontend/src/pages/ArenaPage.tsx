import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
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

export default function ArenaPage() {
  const navigate = useNavigate()
  const { roomId = 'PREVIEW' } = useParams()
  const [arena, setArena] = useState(demoArena)
  const [shotsRequested, setShotsRequested] = useState(0)
  const movement = useKeyboardMovement()

  useEffect(() => {
    if (movement.x === 0 && movement.y === 0) return

    let previousFrame = performance.now()
    let frameId = 0
    const movePlayer = (now: number) => {
      const distance = ((now - previousFrame) / 1000) * PREVIEW_SPEED
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

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-200 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-blue-400">Room {roomId}</p>
            <h1 className="text-4xl font-black text-white sm:text-6xl">Game arena</h1>
          </div>
          <button type="button" onClick={() => navigate('/')} className="w-fit rounded-xl border border-slate-700 px-4 py-2.5 font-bold hover:bg-slate-800">
            Leave match
          </button>
        </header>

        <div className="flex flex-col items-start gap-6 lg:flex-row">
          <ArenaCanvas state={arena} onAim={handleAim} onShoot={() => setShotsRequested((shots) => shots + 1)} />
          <aside className="w-full rounded-2xl border border-slate-800 bg-slate-900/85 p-5 lg:w-64">
            <div className="mb-5 flex items-center gap-2 font-bold text-emerald-300">
              <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_0.6rem_#4ade80]" />
              Controls ready
            </div>
            <h2 className="font-black text-white">In-game controls</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Use WASD or arrow keys to move. Aim with the mouse and click to shoot.</p>
            <dl className="mt-5 grid grid-cols-2 gap-3 border-y border-slate-800 py-5 text-sm">
              <div><dt className="text-slate-500">Health</dt><dd className="mt-1 font-black text-emerald-300">100 HP</dd></div>
              <div><dt className="text-slate-500">Shots</dt><dd className="mt-1 font-black text-white">{shotsRequested}</dd></div>
            </dl>
            <button type="button" className="mt-5 w-full rounded-xl bg-slate-800 px-4 py-2.5 font-bold text-slate-200 hover:bg-slate-700">Settings</button>
          </aside>
        </div>
      </div>
    </main>
  )
}