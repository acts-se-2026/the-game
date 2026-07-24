import { useContext } from "react";
import { WsConnectionContext, type WsConnectionContextType } from "./context";

/**
 * Hook to access the WebSocket connection context.
 */
export function useWsConnection(): WsConnectionContextType {
    const context = useContext(WsConnectionContext);
    if (!context) {
        throw new Error("useWsConnection must be used within a WsConnectionProvider");
    }
    return context;
}
