// this is when we dont know what type of packet we are receiving and dont know how data looks yet
export interface WsUnknownPacket {
    type: string;
    data?: unknown;
}

// Known Packets (for now this is example packet)
export interface PlayerListUpdatePacket {
    type: "user_list";
    data: {
        players: {
            userId: string;
            username: string;
        }[];
    }
}

export interface GameStartPacket {
    type: "game_start";
    data: {
        obstacles: {
            x: number;
            y: number;
            size: {
                x: number;
                y: number;
            };
        }[];
        players: {
            id: string;
            username?: string;
            x: number;
            y: number;
            heading: number;
            hp: number;
        }[];
        bullets: {
            x: number;
            y: number;
            heading: number;
            ownerId : string;
        }[];
        chests?: {
            x: number;
            y: number;
            size: {
                x: number;
                y: number;
            };
        }[];
        explosion_positions?: { x: number; y: number; player_id: string }[];
        deaths?: DeathRecord[];
    }
}

export interface DeathRecord {
    player_id: string;
    killer_id: string | null;
}