import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import PageTitleTemplate from "../../components/PageTitleTemplate";
import RoomCard, { type PublicRoom } from "./components/RoomCard";
import { useUser } from "../../context/UserContext/useUser";
import { backendApi } from "../../api/backend";
import LogoutButton from "./components/LogoutButton";

type FetchRoomsResponse = {
    rooms: PublicRoom[];
};

type CreateRoomResponse = {
    room_id: string;
};

export default function LobbyPage() {
    const navigate = useNavigate();
    const { user } = useUser();
    const [rooms, setRooms] = useState<PublicRoom[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchRooms = useCallback((silent = false) => {
        if (!silent) setIsRefreshing(true);
        const startTime = Date.now();

        backendApi.get<FetchRoomsResponse>("/api/rooms").then((response) => {
            const fetchedRooms = response.data.rooms || [];
            setRooms(fetchedRooms.map((room) => ({ ...room })));
        }).catch((error) => {
            console.error("Failed to fetch rooms:", error);
        }).finally(() => {
            if (silent) return;
            
            const elapsed = Date.now() - startTime;
            const minDelay = 500;
            const remaining = minDelay - elapsed;
            
            // Make sure the refresh indicator is visible for at least 500ms to avoid flickering
            if (remaining > 0) {
                setTimeout(() => setIsRefreshing(false), remaining);
            } else {
                setIsRefreshing(false);
            }
        });
    }, []);

    useEffect(() => {
        fetchRooms();
        const interval = setInterval(() => fetchRooms(true), 4000);
        return () => clearInterval(interval);
    }, [fetchRooms]);

    const handleJoinRoom = (roomId: string) => {
        navigate(`/rooms/${roomId}`);
    }

    const handleCreateRoom = () => {
        backendApi.post<CreateRoomResponse>("/api/rooms/create").then((response) => {
            navigate(`/rooms/${response.data.room_id}`);
        }).catch((error) => {
            console.error("Failed to create room:", error);
        });
    }

    return (
        <div className="flex flex-col items-start min-h-screen px-6 py-12">
            <div className="w-full max-w-4xl mx-auto">
                <PageTitleTemplate eyebrow="Lobby" title="Public rooms" description="Join an open match or create a room for your squad." />

                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-bold text-slate-300">Playing as {user?.username}</p>
                    <div className="flex flex-wrap gap-3">
                        <LogoutButton />
                        
                        <button
                            type="button"
                            onClick={() => fetchRooms()}
                            disabled={isRefreshing}
                            className="rounded-xl bg-slate-700 px-4 py-2.5 font-black text-white transition hover:bg-slate-600 disabled:opacity-50"
                        >
                            {isRefreshing ? "Refreshing..." : "Refresh"}
                        </button>

                        <button
                            type="button"
                            onClick={handleCreateRoom}
                            className="rounded-xl bg-blue-500 px-4 py-2.5 font-black text-white transition hover:bg-blue-400"
                        >
                            Create room
                        </button>
                    </div>
                </div>
                {rooms.length === 0 ? (
                    <p className="text-slate-400">No rooms available</p>
                ) : (
                    <ul className="grid gap-4 w-full">
                        {rooms.map((room) => (
                            <RoomCard key={room.room_id} room={room} onJoin={handleJoinRoom} />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
