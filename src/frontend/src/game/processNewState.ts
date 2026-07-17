import type { GameStartPacket } from "../context/WsContext/types";
import type { ArenaState } from "./types";

const ENEMY_COLORS = ["#fb7185", "#fbbf24", "#34d399", "#a78bfa", "#f472b6"];

export const processNewState = (newState: GameStartPacket["data"], currentState: ArenaState): ArenaState => {
    const updatedPlayers = newState.players.map((newPlayer) => {
        const existingPlayer = currentState.players.find((p) => p.id === newPlayer.id);
        return {
            id: newPlayer.id,
            x: newPlayer.x,
            y: newPlayer.y,
            heading: newPlayer.heading,
            color: existingPlayer?.color || "#60a5fa", // Keep existing color or default to blue
            isLocal: existingPlayer?.isLocal || false,
        };
    });

    const updatedObstacles = currentState.obstacles;
    const updatedBullets = newState.bullets;

    return {
        players: updatedPlayers,
        obstacles: updatedObstacles,
        bullets: updatedBullets,
    };
}
