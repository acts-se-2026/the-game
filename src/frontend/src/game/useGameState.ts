import { useCallback, useEffect, useRef, useState } from "react";
import { type ArenaState } from "./types";
import { demoArena } from "./demoArena";
import { useKeyboardMovement } from "./useKeyboardMovement";

export function useGameState() {
    const [arena, setArena] = useState<ArenaState>(demoArena);
    const [shotsFired, setShotsFired] = useState(0);
    const movement = useKeyboardMovement();

    const lastAimSentAt = useRef(0);

    const sendMessage = useCallback((msg: any) => console.log("Sending:", msg), []);
    const lastMessage = null as any;

    useEffect(() => {
        if (lastMessage?.type === "arena_state") {
            setArena(lastMessage.payload);
        }
    }, [lastMessage]);

    useEffect(() => {
        sendMessage({ type: "PLAYER_MOVE", payload: movement });
    }, [movement, sendMessage]);

    const handleAim = useCallback((pos: { x: number; y: number }) => {
        const now = Date.now();
        if (now - lastAimSentAt.current < 200) return;

        const localPlayer = arena.players.find(p => p.isLocal);
        if (localPlayer) {
            const heading = Math.atan2(pos.y - localPlayer.y, pos.x - localPlayer.x);
            sendMessage({ type: "PLAYER_AIM", payload: { heading } });
            lastAimSentAt.current = now;
        }
    }, [sendMessage, arena.players]);

    const handleShoot = useCallback(() => {
        setShotsFired((s) => s + 1);
        sendMessage({ type: "PLAYER_SHOOT", payload: {} });
    }, [sendMessage]);

    return { arena, shotsFired, handleAim, handleShoot };
}
