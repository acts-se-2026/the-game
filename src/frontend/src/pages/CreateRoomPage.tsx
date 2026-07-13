import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import PageShell from '../components/PageShell'
import PlayerList, { type RoomPlayer } from '../components/rooms/PlayerList'

const ROOM_ID = 'HOST-42'

export default function CreateRoomPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const username = (location.state as { username?: string } | null)?.username ?? 'Player'
  const navigationState = { username }
  const [players, setPlayers] = useState<RoomPlayer[]>([
    { id: 'host', name: username, isHost: true },
    { id: 'guest-1', name: 'Morgan' },
    { id: 'guest-2', name: 'Sam' },
  ])

  return (
    <PageShell eyebrow="Host room" title="Create a room" description="Manage your players and launch the match when the squad is ready.">
      <section className="max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/85 p-6">
        <div className="flex flex-col gap-3 border-b border-slate-800 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-black text-white">Room ID: <span className="text-blue-300">{ROOM_ID}</span></p>
          <span className="text-sm font-bold text-slate-400">{players.length} players connected</span>
        </div>
        <PlayerList players={players} onKick={(playerId) => setPlayers((current) => current.filter((player) => player.id !== playerId))} />
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={() => navigate(`/rooms/${ROOM_ID}/arena`, { state: navigationState })} className="rounded-xl bg-blue-500 px-5 py-2.5 font-black text-white transition hover:bg-blue-400">
            Start match
          </button>
          <button type="button" onClick={() => navigate('/', { state: navigationState })} className="rounded-xl border border-slate-700 px-5 py-2.5 font-bold text-slate-200 transition hover:bg-slate-800">
            Leave room
          </button>
        </div>
      </section>
    </PageShell>
  )
}