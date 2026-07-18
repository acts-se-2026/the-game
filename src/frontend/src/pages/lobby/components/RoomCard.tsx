export type PublicRoom = {
  room_id: string
  player_count: number
  max_players: number
  players: string[]
}

type RoomCardProps = {
  room: PublicRoom
  onJoin: (roomId: string) => void
}

export default function RoomCard({ room, onJoin }: RoomCardProps) {
  return (
    <li className="w-full flex flex-col justify-between gap-5 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-black/10 sm:flex-row sm:items-center">
      <div>
        <h2 className="text-xl font-black text-white">{room.room_id}</h2>
      </div>
      <div className="flex w-full flex-col gap-3 sm:w-auto">
        <div className="flex items-center justify-between gap-5 sm:justify-end">
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-300">
              <span className="inline-block w-[1ch] tabular-nums">{room.player_count}</span>
              {` of ${room.max_players} players`}
            </p>

            {room.players.length > 0 ? (
              <ol aria-label="Players in room" className="mt-2 space-y-1 text-sm text-slate-300">
                {room.players.map((username, index) => (
                  <li key={`${username}-${index}`} className="flex min-w-0 items-start gap-2">
                    <span className="inline-block w-4 tabular-nums text-slate-400">{index + 1}.</span>
                    <span className="min-w-0 break-words">{username}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-2 pl-6 text-sm text-slate-400">No players yet</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => onJoin(room.room_id)}
            className="rounded-xl bg-blue-500 px-5 py-3 font-black text-white transition hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
            aria-label="Join room"
          >
            Join
          </button>
        </div>
      </div>
    </li>
  )
}