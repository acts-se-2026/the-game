/** Generic interface when the packet `type` is unknown at compile time. */
export interface WsUnknownPacket {
    type: string;
    data?: unknown;
}

/** Packet sent by server to update the current list of players in a room. */
export interface PlayerListUpdatePacket {
    type: "user_list";
    data: {
        players: {
            userId: string;
            username: string;
        }[];
    }
}

/** Packet sent by server to update the current state of the arena. */
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
            damage: number;
        }[];
        chests?: {
            x: number;
            y: number;
            size: {
                x: number;
                y: number;
            };
            effect: string;
        }[];
        explosion_positions?: { x: number; y: number; player_id: string }[];
        deaths?: DeathRecord[];
    }
}

export interface DeathRecord {
    player_id: string;
    killer_id: string | null;
}