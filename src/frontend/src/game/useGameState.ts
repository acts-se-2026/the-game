import { useCallback, useEffect, useRef, useState } from "react";
import { type ArenaState } from "./types";
import { useKeyboardMovement } from "./useKeyboardMovement";
import { useWsConnection } from "../context/WsContext";
import { useUser } from "../context/UserContext";
import type { GameStartPacket, WsUnknownPacket } from "../context/WsContext/types";
import { useLocation } from "react-router";
import { processNewState } from "./processNewState";
import { determineMatchResult, findKillerName, type MatchResult } from "./matchResult";

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
                username: player.username || player.id,
                x: player.x,
                y: player.y,
                heading: player.heading,
                isLocal,
                color: isLocal ? "#60a5fa" : ENEMY_COLORS[enemyIndex++ % ENEMY_COLORS.length],
            };
        }),
        bullets: (data.bullets ?? []).map((bullet) => ({
            x: bullet.x,
            y: bullet.y,
            heading: bullet.heading,
        })),
    };
}

export function useGameState() {
    const location = useLocation();
    const { socket, sendMessage } = useWsConnection();
    const { user } = useUser();
    const arena = useRef<ArenaState>(
        buildArenaState(location.state?.arenaState, user?.session_id) ?? { obstacles: [], players: [], bullets: [] }
    );
    const [shotsFired, setShotsFired] = useState(0);
    const [matchResult, setMatchResult] = useState<MatchResult>(null);
    const [killedBy, setKilledBy] = useState<string | null>(null);
    const movement = useKeyboardMovement();

    const lastAimSentAt = useRef(0);
    const lastAimPos = useRef<{ x: number; y: number } | null>(null);
    const lastSentHeading = useRef<number | null>(null);

    useEffect(() => {
        const currentSocket = socket.current;
        if (!currentSocket) return;

        const handleIncomingPacket = (event: MessageEvent) => {
            const packet = JSON.parse(event.data) as WsUnknownPacket;

            switch (packet.type) {
                case "state_diff": {
                    const arenaState = packet.data as GameStartPacket["data"];
                    const previousPlayers = arena.current.players;
                    arena.current = processNewState(arenaState, arena.current);
                    setKilledBy((currentKiller) =>
                        currentKiller ?? findKillerName(arenaState.deaths ?? [], previousPlayers, user?.session_id)
                    );
                    setMatchResult((currentResult) =>
                        currentResult ?? determineMatchResult(arena.current.players, user?.session_id)
                    );
                    break;
                }
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
    }, [socket, user?.session_id]);

    useEffect(() => {
        sendMessage("player_move", { x: movement.x, y: movement.y });
    }, [movement, sendMessage]);

    const sendAim = useCallback(() => {
        const pos = lastAimPos.current;
        const localPlayer = arena.current.players.find(p => p.isLocal);
        const playerPos = localPlayer ? { x: localPlayer.x, y: localPlayer.y } : null;
        if (!pos || !playerPos) return;

        // Always aim towards the mouse cursor
        const heading = Math.atan2(pos.y - playerPos.y, pos.x - playerPos.x);

        // Don't send if the aim direction did not change
        if (lastSentHeading.current === heading) return;

        const now = Date.now();
        if (now - lastAimSentAt.current < 50) return;

        sendMessage("player_aim", { heading });
        lastSentHeading.current = heading;
        lastAimSentAt.current = now;
    }, [sendMessage]);

    const handleAim = useCallback((pos: { x: number; y: number }) => {
        lastAimPos.current = { x: pos.x, y: pos.y };
        sendAim();
    }, [sendAim]);

    // Continuously re-evaluate the aim so the player always faces the mouse
    useEffect(() => {
        let frame: number;
        const tick = () => {
            sendAim();
            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [sendAim]);

    const handleShoot = useCallback(() => {
        setShotsFired((s) => s + 1);
        sendMessage("player_shoot");
    }, [sendMessage]);

    return { arena, shotsFired, matchResult, killedBy, handleAim, handleShoot };
}
