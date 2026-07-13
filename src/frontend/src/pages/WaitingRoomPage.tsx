import { useLocation, useNavigate, useParams } from 'react-router'
import PageShell from '../components/PageShell'
import PlayerList from '../components/rooms/PlayerList'

export default function WaitingRoomPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { roomId = 'UNKNOWN' } = useParams()
  const username = (location.state as { username?: string } | null)?.username ?? 'Player'
  const navigationState = { username }
  const players = [
    { id: 'host', name: 'Riley', isHost: true },
    { id: 'you', name: username },
    { id: 'guest', name: 'Morgan' },
  ]

  return (
    <PageShell eyebrow="Guest room" title="Waiting for match" description="The host will start the match when everyone is ready.">
      <section className="max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/85 p-6">
        <div className="flex flex-col gap-3 border-b border-slate-800 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-black text-white">Room ID: <span className="text-blue-300">{roomId}</span></p>
          <span className="w-fit rounded-full bg-amber-400/10 px-3 py-1.5 text-sm font-bold text-amber-200">Waiting for host</span>
        </div>
        <PlayerList players={players} />
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={() => navigate('/', { state: navigationState })} className="rounded-xl border border-slate-700 px-4 py-2.5 font-bold text-slate-200 hover:bg-slate-800">
            Leave room
          </button>
          <button type="button" onClick={() => navigate(`/rooms/${roomId}/arena`, { state: navigationState })} className="rounded-xl bg-slate-800 px-4 py-2.5 font-bold text-slate-300 hover:bg-slate-700">
            Preview arena
          </button>
        </div>
      </section>
    </PageShell>
  )
}