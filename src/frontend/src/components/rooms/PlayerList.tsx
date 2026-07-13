export type RoomPlayer = {
  id: string
  name: string
  isHost?: boolean
}

type PlayerListProps = {
  players: RoomPlayer[]
  onKick?: (playerId: string) => void
}

export default function PlayerList({ players, onKick }: PlayerListProps) {
  return (
    <ul className="divide-y divide-slate-800" aria-label="Players in room">
      {players.map((player) => (
        <li key={player.id} className="flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-slate-800 font-black text-blue-300">
              {player.name.charAt(0).toUpperCase()}
            </span>
            <span className="font-bold text-white">{player.name}</span>
            {player.isHost && (
              <span className="rounded-full bg-blue-500/15 px-2 py-1 text-xs font-bold text-blue-300">Host</span>
            )}
          </div>
          {onKick && !player.isHost && (
            <button
              type="button"
              className="rounded-lg border border-rose-400/30 px-3 py-2 text-sm font-bold text-rose-300 transition hover:bg-rose-400/10"
              onClick={() => onKick(player.id)}
              aria-label={`Kick ${player.name}`}
            >
              Kick
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}