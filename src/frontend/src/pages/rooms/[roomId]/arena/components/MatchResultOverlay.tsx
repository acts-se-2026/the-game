import type { MatchResult } from "../../../../../game/matchResult";

type MatchResultOverlayProps = {
    result: MatchResult;
    killedBy: string | null;
    onSpectate: () => void;
};

export default function MatchResultOverlay({ result, killedBy, onSpectate }: MatchResultOverlayProps) {
    if (!result) return null;

    const isWin = result === "win";

    return (
        <div
            className={`absolute inset-0 z-10 flex flex-col items-center justify-center gap-8 rounded-2xl backdrop-blur-[2px] ${
                isWin ? "bg-emerald-500/45" : "bg-red-950/75"
            }`}
            aria-live="assertive"
        >
            <h2 className={`text-center text-6xl font-black tracking-tight sm:text-8xl ${isWin ? "text-white" : "text-red-500"}`}>
                {isWin ? "YOU WIN!" : "YOU LOSE!"}
            </h2>
            {!isWin && (
                <>
                    <p className="text-center text-xl font-black text-red-200 sm:text-2xl">
                        YOU WERE KILLED BY: {killedBy ?? "Unknown player"}
                    </p>
                    <button
                        type="button"
                        onClick={onSpectate}
                        className="rounded-xl border border-red-300 bg-slate-950/90 px-6 py-3 text-lg font-black text-white shadow-xl hover:bg-slate-900"
                    >
                        Spectate lobby
                    </button>
                </>
            )}
        </div>
    );
}