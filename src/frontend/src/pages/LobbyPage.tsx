import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import PageShell from '../components/PageShell'
import RoomCard, { type PublicRoom } from '../components/rooms/RoomCard'

const initialRooms: PublicRoom[] = [
  { id: 'NOVA-21', name: 'Nova Station', players: 3, capacity: 6 },
  { id: 'DUST-08', name: 'Dust Bowl', players: 2, capacity: 4 },
  { id: 'CORE-77', name: 'Core Breach', players: 5, capacity: 8 },
]

type NavigationState = { username?: string } | null

export default function LobbyPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const username = (location.state as NavigationState)?.username ?? 'Player'
  const [rooms] = useState(initialRooms)
  const [lastRefresh, setLastRefresh] = useState('Ready')
  const navigationState = { username }

  return (
    <PageShell eyebrow="Lobby" title="Public rooms" description="Join an open match or create a room for your squad.">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-bold text-slate-300">Playing as {username}</p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setLastRefresh('Updated just now')}
            className="rounded-xl border border-slate-700 px-4 py-2.5 font-bold text-slate-200 transition hover:bg-slate-800"
          >
            Refresh rooms
          </button>
          <button
            type="button"
            onClick={() => navigate('/rooms/new', { state: navigationState })}
            className="rounded-xl bg-blue-500 px-4 py-2.5 font-black text-white transition hover:bg-blue-400"
          >
            Create room
          </button>
        </div>
      </div>
      <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500" aria-live="polite">{lastRefresh}</p>
      <ul className="grid gap-4">
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            onJoin={(roomId) => navigate(`/rooms/${roomId}`, { state: navigationState })}
          />
        ))}
      </ul>
    </PageShell>
  )
}