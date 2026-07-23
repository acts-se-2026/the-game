import type { GameStartPacket } from "../context/WsContext/types";
import type { ArenaState } from "./types";

const ENEMY_COLORS = ["#fb7185", "#fbbf24", "#34d399", "#a78bfa", "#f472b6"];

/**
 * Merge an incoming authoritative game state into the current client state.
 * - Preserves player colors and local-player highlighting
 * - Maps explosion positions to player colors for particles
 */
export const processNewState = (newState: GameStartPacket["data"], currentState: ArenaState, localId?: string): ArenaState => {
    const usedColors = new Set(currentState.players.map(p => p.color));

    const updatedPlayers = newState.players.map((newPlayer) => {
        const existingPlayer = currentState.players.find((p) => p.id === newPlayer.id);
        const isLocal = existingPlayer?.isLocal || (localId != null && newPlayer.id === localId);
        
        let color = existingPlayer?.color;
        if (!color) {
            if (isLocal) {
                color = "#60a5fa";
            } else {
                // Find next available color that isn't currently used
                color = ENEMY_COLORS.find(c => !usedColors.has(c)) || ENEMY_COLORS[0];
            }
        }
        usedColors.add(color);

        return {
            id: newPlayer.id,
            username: newPlayer.username || existingPlayer?.username || newPlayer.id,
            x: newPlayer.x,
            y: newPlayer.y,
            heading: newPlayer.heading,
            hp: newPlayer.hp,
            color,
            isLocal,
        };
    });

    const updatedObstacles = newState.obstacles ?? currentState.obstacles;
    const updatedBullets = newState.bullets ?? currentState.bullets;
    const updatedChests = newState.chests ?? currentState.chests;

    const updatedExplosions = (newState.explosion_positions ?? []).map(pos => {
        const player = updatedPlayers.find(p => p.id === pos.player_id) || currentState.players.find(p => p.id === pos.player_id);
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
