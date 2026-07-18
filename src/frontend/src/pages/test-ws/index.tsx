import { useEffect, useState } from "react";
import { useWsConnection } from "../../context/WsContext/useWsConnection";
import type { WsUnknownPacket } from "../../context/WsContext/types";

const TestWSPage = () => {
    const { socket, sendMessage, connectWs, isConnected } = useWsConnection();
    const [messages, setMessages] = useState<string[]>([]);
    const [inputContent, setInputContent] = useState<string>("");

    const wsPath = import.meta.env.VITE_WS_PATH || "/api/ws";

    useEffect(() => {
        const currentSocket = socket.current;
        if (!currentSocket) return;

        const handleIncomingPacket = (event: MessageEvent) => {
            const packet = JSON.parse(event.data) as WsUnknownPacket;

            setMessages((prev) => [...prev, `[${packet.type}] ${JSON.stringify(packet)}`]);
        };

        // We add a listener
        currentSocket.addEventListener("message", handleIncomingPacket);

        // Cleanup when the component unmounts or when the socket changes
        return () => {
            currentSocket.removeEventListener("message", handleIncomingPacket);
        };
    }, [socket]);

    const handleTriggerMessage = () => {
        if (!inputContent.trim()) return;

        sendMessage("message", {
            content: inputContent,
        });

        setInputContent("");
    };

    return (
        <div className="p-5 font-sans">
            <h1 className="text-2xl font-semibold">WebSocket Test Page</h1>

            <div className="mb-4 p-3 bg-slate-100 rounded border border-slate-200 flex items-center justify-between">
                <div>
                    <span className="text-sm font-medium mr-2 text-slate-600">Connection Status:</span>
                    {isConnected ? (
                        <span className="text-sm text-green-600 font-bold">Connected</span>
                    ) : (
                        <span className="text-sm text-red-500 font-bold">Disconnected</span>
                    )}
                </div>
                <button
                    onClick={() => connectWs(wsPath)}
                    className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-800 text-white rounded font-medium cursor-pointer"
                >
                    Connect to WebSocket
                </button>
            </div>

            <div className="mb-5 flex gap-2 items-center">
                <input
                    type="text"
                    value={inputContent}
                    onChange={(e) => setInputContent(e.target.value)}
                    placeholder="Type a message..."
                    className="p-2 text-base w-72 border rounded"
                    onKeyDown={(e) => e.key === "Enter" && handleTriggerMessage()}
                />
                <button
                    onClick={handleTriggerMessage}
                    className="px-4 py-2 text-base bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    disabled={!socket.current || socket.current.readyState !== WebSocket.OPEN}
                >
                    Send
                </button>
            </div>

            <h3 className="mt-8 text-lg">Logs:</h3>
            <div className="bg-gray-100 p-4 rounded min-h-25">
                {messages.length === 0 ? (
                    <p className="text-gray-500">No packets logged yet. Check browser console or send a message.</p>
                ) : (
                    <ul className="m-0 pl-5">
                        {messages.map((msg, index) => (
                            <li key={index} className="mb-1 font-mono text-gray-800">
                                {msg}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default TestWSPage;
