import { createContext, type RefObject } from "react";

export interface WsConnectionContextType {
    socket: RefObject<WebSocket | null>;
    sendMessage: (type: string, data?: unknown) => void;
    connectWs: (path: string) => void;
    isConnected: boolean;
    disconnectWs: () => void;
}

export const WsConnectionContext = createContext<WsConnectionContextType | null>(null);
