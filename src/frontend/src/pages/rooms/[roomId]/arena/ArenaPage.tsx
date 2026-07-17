import { useLocation, useNavigate, useParams } from "react-router";
import { useGameState } from "../../../../game/useGameState";
import ArenaCanvas from "./components/ArenaCanvas";
import { useWsConnection } from "../../../../context/WsContext";
import { useEffect, useRef } from "react";

export default function ArenaPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { roomId = "PREVIEW" } = useParams();
    const { arena, shotsFired, handleAim, handleShoot } = useGameState();
    const { isConnected, disconnectWs } = useWsConnection();
    const hasRedirectedRef = useRef(false);

    const hasArenaState = Boolean(location.state?.arenaState);

    useEffect(() => {
        if ((!hasArenaState || !isConnected) && !hasRedirectedRef.current) {
            hasRedirectedRef.current = true;
            navigate("/lobby");
        }
    }, [hasArenaState, isConnected, navigate]);

    if (!hasArenaState) {
        return null;
    }

    const handleLeaveMatch = () => {
        disconnectWs();
        navigate("/lobby");
    };

    return (
        <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-200 sm:px-6 sm:py-10">
            <div className="mx-auto max-w-6xl">
                <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-blue-400">Room {roomId}</p>
                        <h1 className="text-4xl font-black text-white sm:text-6xl">Game arena</h1>
                    </div>
                    <button
                        type="button"
                        onClick={handleLeaveMatch}
                        className="w-fit rounded-xl border border-slate-700 px-4 py-2.5 font-bold hover:bg-slate-800"
                    >
                        Leave match
                    </button>
                </header>

                <div className="flex flex-col items-start gap-6 lg:flex-row">
                    <ArenaCanvas stateRef={arena} onAim={handleAim} onShoot={handleShoot} />
                    <aside className="w-full rounded-2xl border border-slate-800 bg-slate-900/85 p-5 lg:w-64">
                        <div className="mb-5 flex items-center gap-2 font-bold text-emerald-300">
                            <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_0.6rem_#4ade80]" />
                            Controls ready
                        </div>
                        <h2 className="font-black text-white">In-game controls</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                            Use WASD or arrow keys to move. Aim with the mouse and click to shoot.
                        </p>
                        <dl className="mt-5 grid grid-cols-2 gap-3 border-y border-slate-800 py-5 text-sm">
                            <div>
                                <dt className="text-slate-500">Health</dt>
                                <dd className="mt-1 font-black text-emerald-300">100 HP</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Shots</dt>
                                <dd className="mt-1 font-black text-white">{shotsFired}</dd>
                            </div>
                        </dl>
                        <button type="button" className="mt-5 w-full rounded-xl bg-slate-800 px-4 py-2.5 font-bold text-slate-200 hover:bg-slate-700">
                            Settings
                        </button>
                    </aside>
                </div>
            </div>
        </main>
    );
}
