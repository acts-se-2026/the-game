import { createContext, type RefObject } from "react";

/**
 * Public API exposed by the WebSocket connection context.
 * Use via the `useWsConnection()` hook.
 */
export interface WsConnectionContextType {
    /** A ref to the underlying `WebSocket` instance (or `null` when disconnected). */
    socket: RefObject<WebSocket | null>;
    /** Send a JSON packet to the server of shape `{ type, data? }`. */
    sendMessage: (type: string, data?: unknown) => void;
    /** Open a WebSocket to the given `path` appended to `VITE_WS_BASE_URL`. */
    connectWs: (path: string) => void;
    /** True when the socket is open. */
    isConnected: boolean;
    /** Close the current WebSocket if open. */
    disconnectWs: () => void;
}

/**
 * React Context that holds the WebSocket connection controls/state.
 */
export const WsConnectionContext = createContext<WsConnectionContextType | null>(null);
