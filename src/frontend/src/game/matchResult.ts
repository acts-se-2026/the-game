import type { DeathRecord } from "../context/WsContext/types";

export type MatchResult = "win" | "lose" | null;

export function determineMatchResult(players: { id: string }[], localPlayerId: string | undefined): MatchResult {
    if (!localPlayerId) return null;

    const isLocalPlayerAlive = players.some((player) => player.id === localPlayerId);
    if (!isLocalPlayerAlive) return "lose";
    if (players.length === 1) return "win";

    return null;
}

export function findKillerName(
    deaths: DeathRecord[],
    players: { id: string; username: string }[],
    localPlayerId: string | undefined
): string | null {
    if (!localPlayerId) return null;

    const localPlayerDeath = deaths.find((death) => death.player_id === localPlayerId);
    if (!localPlayerDeath?.killer_id) return null;

    return players.find((player) => player.id === localPlayerDeath.killer_id)?.username ?? null;
}