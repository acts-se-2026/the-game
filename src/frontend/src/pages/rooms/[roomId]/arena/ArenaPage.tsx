import { useLocation, useNavigate, useParams } from "react-router";
import { useGameState } from "../../../../game/useGameState";
import ArenaCanvas from "./components/ArenaCanvas";
import { useWsConnection } from "../../../../context/WsContext/useWsConnection";
import { useEffect, useRef, useState } from "react";
import MatchResultOverlay from "./components/MatchResultOverlay";

export default function ArenaPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { roomId = "PREVIEW" } = useParams();
    const { arena, health, matchResult, killedBy, handleAim, handleShoot } = useGameState();
    const { isConnected, disconnectWs } = useWsConnection();
    const hasRedirectedRef = useRef(false);
    const [isLossOverlayDismissed, setIsLossOverlayDismissed] = useState(false);

    const hasArenaState = Boolean(location.state?.arenaState);
    const isSpectating = matchResult === "lose" && isLossOverlayDismissed;

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
        <main className="flex h-screen flex-col overflow-hidden bg-slate-950 px-4 py-6 text-slate-200 sm:px-6 sm:py-10">
            <div className="mx-auto flex min-h-0 w-full max-w-350 flex-1 flex-col">
                <header className="mb-6 flex items-center justify-between gap-4">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">Room {roomId}</p>

                    <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/85 px-4 py-2.5">
                        <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-500">Health</span>
                        <span className="font-black text-emerald-300">{health} HP</span>
                    </div>

                    <button
                        type="button"
                        onClick={handleLeaveMatch}
                        className="w-fit rounded-xl border border-slate-700 px-4 py-2.5 font-bold hover:bg-slate-800"
                    >
                        Leave match
                    </button>
                </header>

                <div className="relative flex min-h-0 flex-1 items-center justify-center">
                    <ArenaCanvas stateRef={arena} onAim={handleAim} onShoot={isSpectating ? undefined : handleShoot} />
                    <MatchResultOverlay
                        result={matchResult === "lose" && isLossOverlayDismissed ? null : matchResult}
                        killedBy={killedBy}
                        onSpectate={() => setIsLossOverlayDismissed(true)}
                    />
                </div>
            </div>
        </main>
    );
}
