import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { WsUnknownPacket } from "./types";
import { WsConnectionContext } from "./context";

interface ProviderProps {
    children: ReactNode;
}

/**
 * Provides a shared WebSocket connection and helper methods to the app.
 *
 * Typical usage:
 * ```tsx
 * <WsConnectionProvider>
 *   <App />
 * </WsConnectionProvider>
 * ```
 * Consume with `useWsConnection()` to connect, send messages, and observe state.
 */
export function WsConnectionProvider({ children }: ProviderProps) {
    const socketRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    /** Open a WebSocket at `VITE_WS_BASE_URL + path`. */
    const connectWs = useCallback((path: string) => {
        if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
            console.warn("WebSocket is already active or connecting.");
            return;
        }

        const baseUrl = import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8000";
        const wsUrl = `${baseUrl}${path}`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log("WebSocket Connected");
            setIsConnected(true);
        };

        ws.onclose = () => {
            console.log("WebSocket Disconnected");
            if (socketRef.current === ws) {
                socketRef.current = null;
            }
            setIsConnected(false);
        };

        ws.onerror = (error) => {
            console.error("WebSocket Error:", error);
        };

        socketRef.current = ws;
    }, []);

    /** Close the socket and reset flags. Safe to call when already closed. */
    const disconnectWs = useCallback(() => {
        const currentSocket = socketRef.current;

        if (currentSocket) {
            socketRef.current = null;
            setIsConnected(false);
            currentSocket.close();
        }
    }, []);

    useEffect(() => {
        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, []);

    /** Send a JSON packet `{ type, data? }` to the server if the socket is open. */
    const sendMessage = useCallback((type: string, data?: unknown) => {
        const ws = socketRef.current;

        if (ws && ws.readyState === WebSocket.OPEN) {
            const packet: WsUnknownPacket = { type, data };
            ws.send(JSON.stringify(packet));
        } else {
            console.warn("Connection is not open");
        }
    }, []);

    return (
        <WsConnectionContext.Provider value={{ socket: socketRef, sendMessage, connectWs, isConnected, disconnectWs }}>
            {children}
        </WsConnectionContext.Provider>
    );
}

// Add message listener using `useEffect` + currentSocket.addEventListener("message", handleIncomingPacket); 
// look at src/frontend/src/game/useGameState.ts for example of how to do this.