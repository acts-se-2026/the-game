import type { GameStartPacket } from "../context/WsContext/types";
import type { ArenaState } from "./types";

export const processNewState = (newState: GameStartPacket["data"], currentState: ArenaState): ArenaState => {
    const updatedPlayers = newState.players.map((newPlayer) => {
        const existingPlayer = currentState.players.find((p) => p.id === newPlayer.id);
        return {
            id: newPlayer.id,
            username: newPlayer.username || existingPlayer?.username || newPlayer.id,
            x: newPlayer.x,
            y: newPlayer.y,
            heading: newPlayer.heading,
            hp: newPlayer.hp,
            color: existingPlayer?.color || "#60a5fa", // Keep existing color or default to blue
            isLocal: existingPlayer?.isLocal || false,
        };
    });

    const updatedObstacles = currentState.obstacles;
    const updatedBullets = newState.bullets;
    const updatedChests = newState.chests ?? [];
    const updatedExplosions = (newState.explosion_positions ?? []).map(pos => {
        const player = currentState.players.find(p => p.id === pos.player_id);
        return {
            x: pos.x,
            y: pos.y,
            color: player?.color || "#ffffff" // Fallback to white if player not found
        };
    });

    return {
        players: updatedPlayers,
        obstacles: updatedObstacles,
        bullets: updatedBullets,
        chests: updatedChests,
        explosion_positions: updatedExplosions
    };
}
