import { useNavigate, useParams } from "react-router";
import PageTitleTemplate from "../../../components/PageTitleTemplate";
import PlayerList from "./components/PlayerList";
import { useUser } from "../../../context/UserContext";

export default function WaitingRoomPage() {
    const navigate = useNavigate();
    const { roomId = "UNKNOWN" } = useParams();
    const { username } = useUser();
    const players = [
        { id: "p1", name: "Riley" },
        { id: "you", name: username },
        { id: "p2", name: "Morgan" },
    ];

    return (
        <div className="flex flex-col items-start min-h-screen px-6 py-12">
            <div className="w-full max-w-4xl mx-auto">
                <PageTitleTemplate
                    eyebrow="Game room"
                    title="Waiting for players"
                    description="The match can start when everyone is ready."
                />
                <section className="max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/85 p-6">
                    <div className="flex flex-col gap-3 border-b border-slate-800 pb-5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="font-black text-white">
                            Room ID: <span className="text-blue-300">{roomId}</span>
                        </p>
                        <span className="w-fit rounded-full bg-emerald-400/10 px-3 py-1.5 text-sm font-bold text-emerald-200">Ready to start</span>
                    </div>
                    <PlayerList players={players} />
                    <div className="mt-5 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(`/rooms/${roomId}/arena`)}
                            className="rounded-xl bg-blue-500 px-5 py-2.5 font-black text-white transition hover:bg-blue-400"
                        >
                            Start match
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="rounded-xl border border-slate-700 px-4 py-2.5 font-bold text-slate-200 hover:bg-slate-800"
                        >
                            Leave room
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}
