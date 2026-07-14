export type PublicRoom = {
  id: string
  name: string
  players: number
  capacity: number
}

type RoomCardProps = {
  room: PublicRoom
  onJoin: (roomId: string) => void
}

export default function RoomCard({ room, onJoin }: RoomCardProps) {
  return (
    <li className="w-full flex flex-col justify-between gap-5 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-black/10 sm:flex-row sm:items-center">
      <div>
        <h2 className="text-xl font-black text-white">{room.name}</h2>
        <p className="mt-1 text-sm text-slate-400">Room ID: {room.id}</p>
      </div>
      <div className="flex items-center justify-between gap-5 sm:justify-end">
        <span className="text-sm font-bold text-slate-300">{room.players}/{room.capacity} players</span>
        <button
          type="button"
          onClick={() => onJoin(room.id)}
          className="rounded-xl bg-blue-500 px-5 py-3 font-black text-white transition hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
          aria-label="Join room"
        >
          Join
        </button>
      </div>
    </li>
  )
}