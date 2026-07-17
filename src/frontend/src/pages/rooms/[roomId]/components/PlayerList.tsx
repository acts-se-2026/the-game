export type RoomPlayer = {
  userId: string
  username: string
}

type PlayerListProps = {
  players: RoomPlayer[]
}

export default function PlayerList({ players }: PlayerListProps) {
  return (
    <ul className="divide-y divide-slate-800" aria-label="Players in room">
      {players.map((player) => (
        <li key={player.userId} className="flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-slate-800 font-black text-blue-300">
              {player.username.charAt(0).toUpperCase()}
            </span>
            <span className="font-bold text-white">{player.username}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}