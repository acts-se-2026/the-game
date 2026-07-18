import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import PageTitleTemplate from "../../components/PageTitleTemplate";
import ArenaBackdropLayout from "../../components/ArenaBackdropLayout";
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

    useEffect(() => {
        backendApi.get<FetchRoomsResponse>("/api/rooms").then((response) => {
            if (!Array.isArray(response.data.rooms)) {
                setRooms([]);
                return;
            }

            setRooms(response.data.rooms.map((room) => ({
                ...room,
                players: Array.isArray(room.players) ? room.players : [],
            })));
        }).catch((error) => {
            console.error("Failed to fetch rooms:", error);
        });
    }, []);

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
        <ArenaBackdropLayout>
            <PageTitleTemplate eyebrow="Lobby" title="Public rooms" description="Join an open match or create a room for your squad." />

            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-bold text-slate-300">Playing as {user?.username}</p>
                <div className="flex flex-wrap gap-3">
                    <LogoutButton />

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
                <ul className="grid w-full gap-4">
                    {rooms.map((room) => (
                        <RoomCard key={room.room_id} room={room} onJoin={handleJoinRoom} />
                    ))}
                </ul>
            )}
        </ArenaBackdropLayout>
    );
}
