// this is when we dont know what type of packet we are receiving and dont know how data looks yet
export interface WsUnknownPacket {
    type: string;
    data?: unknown;
}

// Known Packets (for now this is example packet)
export interface MessagePacket {
    type: "message";
    data: {
        content: string;
    };
}
