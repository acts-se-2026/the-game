import { useCallback, useEffect, useRef, useState } from "react";
import { type ArenaState } from "./types";
import { useKeyboardMovement } from "./useKeyboardMovement";
import { useWsConnection } from "../context/WsContext";
import { useUser } from "../context/UserContext";
import type { GameStartPacket, WsUnknownPacket } from "../context/WsContext/types";
import { useLocation } from "react-router";
import { processNewState } from "./processNewState";

const ENEMY_COLORS = ["#fb7185", "#fbbf24", "#34d399", "#a78bfa", "#f472b6"];

function buildArenaState(data: GameStartPacket["data"] | undefined, localId: string | undefined): ArenaState | null {
    if (!data || !Array.isArray(data.players)) return null;

    let enemyIndex = 0;
    return {
        obstacles: (data.obstacles ?? []).map((obs) => ({
            x: obs.x,
            y: obs.y,
            size: obs.size,
        })),
        players: data.players.map((player) => {
            const isLocal = localId != null && player.id === localId;
            return {
                id: player.id,
                x: player.x,
                y: player.y,
                heading: player.heading,
                isLocal,
                color: isLocal ? "#60a5fa" : ENEMY_COLORS[enemyIndex++ % ENEMY_COLORS.length],
            };
        }),
    };
}

export function useGameState() {
    const location = useLocation();
    const { socket, sendMessage } = useWsConnection();
    const { user } = useUser();
    const [arena, setArena] = useState<ArenaState>(
        () => buildArenaState(location.state?.arenaState, user?.session_id) ?? { obstacles: [], players: [] }
    );
    const [shotsFired, setShotsFired] = useState(0);
    const movement = useKeyboardMovement();

    const lastAimSentAt = useRef(0);

    const tmpSendMessage = useCallback((msg: any) => console.log("Sending:", msg), []);

    useEffect(() => {
        const currentSocket = socket.current;
        if (!currentSocket) return;

        const handleIncomingPacket = (event: MessageEvent) => {
            const packet = JSON.parse(event.data) as WsUnknownPacket;

            switch (packet.type) {
                case "state_diff":
                    const arenaState = packet.data as GameStartPacket["data"];
                    const newArenaState = processNewState(arenaState, arena);
                    setArena(newArenaState);
                    break;
                default:
                    console.warn("Unknown packet type:", packet.type);
            }
        };

        const handleSocketClose = () => {
            console.log("WebSocket Disconnected");
        }

        // We add a listener
        currentSocket.addEventListener("message", handleIncomingPacket);
        currentSocket.addEventListener("close", handleSocketClose);

        // Cleanup when the component unmounts or when the socket changes
        return () => {
            currentSocket.removeEventListener("message", handleIncomingPacket);
            currentSocket.removeEventListener("close", handleSocketClose);
        };
    }, [socket]);

    useEffect(() => {
        sendMessage("player_move", { x: movement.x, y: movement.y });
    }, [movement, sendMessage]);

    const handleAim = useCallback((pos: { x: number; y: number }) => {
        const now = Date.now();
        if (now - lastAimSentAt.current < 50) return;

        const localPlayer = arena.players.find(p => p.isLocal);
        if (localPlayer) {
            const heading = Math.atan2(pos.y - localPlayer.y, pos.x - localPlayer.x);
            sendMessage("player_aim", { heading });
            lastAimSentAt.current = now;
        }
    }, [sendMessage, arena.players]);

    const handleShoot = useCallback(() => {
        setShotsFired((s) => s + 1);
        tmpSendMessage({ type: "PLAYER_SHOOT", payload: {} });
    }, [tmpSendMessage]);

    return { arena, shotsFired, handleAim, handleShoot };
}
