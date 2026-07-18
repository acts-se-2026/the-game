import { useCallback, useEffect, useRef, useState } from "react";
import { type ArenaState } from "./types";
import { useKeyboardMovement } from "./useKeyboardMovement";
import { useWsConnection } from "../context/WsContext/useWsConnection";
import { useUser } from "../context/UserContext/useUser";
import type { GameStartPacket, WsUnknownPacket } from "../context/WsContext/types";
import { useLocation } from "react-router";
import { processNewState } from "./processNewState";
import { determineMatchResult, findKillerName, type MatchResult } from "./matchResult";

const EMPTY_ARENA: ArenaState = {
    obstacles: [],
    players: [],
    bullets: [],
    chests: [],
    explosion_positions: []
};

export function useGameState() {
    const location = useLocation();
    const { socket, sendMessage } = useWsConnection();
    const { user } = useUser();
    const arena = useRef<ArenaState>(
        location.state?.arenaState
            ? processNewState(location.state.arenaState, EMPTY_ARENA, user?.session_id)
            : EMPTY_ARENA
    );
    const [matchResult, setMatchResult] = useState<MatchResult>(null);
    const [killedBy, setKilledBy] = useState<string | null>(null);
    const [health, setHealth] = useState(100);
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
                    arena.current = processNewState(arenaState, arena.current, user?.session_id);
                    setKilledBy((currentKiller) =>
                        currentKiller ?? findKillerName(arenaState.deaths ?? [], previousPlayers, user?.session_id)
                    );
                    setMatchResult((currentResult) =>
                        currentResult ?? determineMatchResult(arena.current.players, user?.session_id)
                    );

                    const newHealth = arena.current.players.find(p => p.id === user?.session_id)?.hp ?? 100;
                    setHealth(newHealth);
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
        sendMessage("player_shoot");
    }, [sendMessage]);

    return { arena, health, matchResult, killedBy, handleAim, handleShoot };
}
