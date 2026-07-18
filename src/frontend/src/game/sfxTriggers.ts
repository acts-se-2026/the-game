import type { MatchResult } from "./matchResult";
import type { SfxName } from "./sfx";

type PlayerHpSnapshot = {
    id: string;
    hp: number;
};

export function didLocalPlayerTakeDamage(
    previousPlayers: PlayerHpSnapshot[],
    nextPlayers: PlayerHpSnapshot[],
    localPlayerId: string | undefined
): boolean {
    if (!localPlayerId) {
        return false;
    }

    const previousLocalPlayer = previousPlayers.find((player) => player.id === localPlayerId);
    const nextLocalPlayer = nextPlayers.find((player) => player.id === localPlayerId);

    if (!previousLocalPlayer || !nextLocalPlayer) {
        return false;
    }

    return nextLocalPlayer.hp < previousLocalPlayer.hp;
}

export function getResultSfx(result: MatchResult): SfxName | null {
    switch (result) {
        case "win":
            return "win";
        case "lose":
            return "death";
        default:
            return null;
    }
}
