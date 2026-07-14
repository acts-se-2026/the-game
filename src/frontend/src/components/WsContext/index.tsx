import React, { createContext, useContext, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import type { WsUnknownPacket } from "./types";

interface WsConnectionContextType {
    socket: React.RefObject<WebSocket | null>;
    sendMessage: (type: string, data?: unknown) => void;
    connectWs: (path: string) => void;
    isConnected: boolean;
}

const WsConnectionContext = createContext<WsConnectionContextType | null>(null);

interface ProviderProps {
    children: ReactNode;
}

export function WebSocketProvider({ children }: ProviderProps) {
    const socketRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = React.useState(false);

    const connectWs = (path: string) => {
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
            socketRef.current = null;
            setIsConnected(false);
        };

        ws.onerror = (error) => {
            console.error("WebSocket Error:", error);
        };

        socketRef.current = ws;
    };

    useEffect(() => {
        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, []);

    const sendMessage = (type: string, data?: unknown) => {
        const ws = socketRef.current;

        if (ws && ws.readyState === WebSocket.OPEN) {
            const packet: WsUnknownPacket = { type, data };
            ws.send(JSON.stringify(packet));
        } else {
            console.warn("Connection is not open");
        }
    };

    return (
        <WsConnectionContext.Provider value={{ socket: socketRef, sendMessage, connectWs, isConnected }}>
            {children}
        </WsConnectionContext.Provider>
    );
}

export function useWsConnection(): WsConnectionContextType {
    const context = useContext(WsConnectionContext);
    if (!context) {
        throw new Error("useWsConnection must be used within a WebSocketProvider");
    }
    return context;
}
