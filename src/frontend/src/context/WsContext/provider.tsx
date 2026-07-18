import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { WsUnknownPacket } from "./types";
import { WsConnectionContext } from "./context";

interface ProviderProps {
    children: ReactNode;
}

export function WsConnectionProvider({ children }: ProviderProps) {
    const socketRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

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
