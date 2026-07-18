import type { ArenaState } from "../game/types";
import { createLobbyArenaState } from "../pages/lobby/lobbyArenaState";

type ArenaStateFactory = () => ArenaState;

export function createArenaBackdropCache(createState: ArenaStateFactory = createLobbyArenaState) {
    let state: ArenaState | undefined;

    return {
        get(): ArenaState {
            state ??= createState();
            return state;
        },
    };
}

const arenaBackdropCache = createArenaBackdropCache();

export function getArenaBackdropState(): ArenaState {
    return arenaBackdropCache.get();
}