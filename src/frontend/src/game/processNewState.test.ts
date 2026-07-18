import { describe, it, expect } from "vitest";
import { processNewState } from "./processNewState";
import type { ArenaState } from "./types";
import type { GameStartPacket } from "../context/WsContext/types";

const makeCurrentState = (): ArenaState => ({
    players: [
        { id: "p1", x: 0, y: 0, heading: 0, color: "#ff0000", isLocal: true, username: "User", hp: 100 },
    ],
    obstacles: [{ x: 5, y: 5, size: { x: 10, y: 10 } }],
    bullets: [],
    chests: [],
});

const makePacketData = (overrides: Partial<GameStartPacket["data"]> = {}): GameStartPacket["data"] => ({
    players: [
        { id: "p1", x: 100, y: 200, heading: 1.5, hp: 100 },
        { id: "p2", x: 300, y: 400, heading: 0, hp: 100 },
    ],
    bullets: [{ x: 10, y: 20, heading: 0.5, ownerId: 'p1' }],
    chests: [],
    ...overrides
} as GameStartPacket["data"]);

describe("processNewState", () => {
    it("updates positions from the new packet", () => {
        const result = processNewState(makePacketData(), makeCurrentState());

        expect(result.players[0]).toMatchObject({ id: "p1", x: 100, y: 200, heading: 1.5, hp: 100 });
    });

    it("keeps the existing color and isLocal flag for known players", () => {
        const result = processNewState(makePacketData(), makeCurrentState());

        expect(result.players[0].color).toBe("#ff0000");
        expect(result.players[0].isLocal).toBe(true);
    });

    it("preserves the existing obstacles", () => {
        const current = makeCurrentState();
        const result = processNewState(makePacketData(), current);

        expect(result.obstacles).toBe(current.obstacles);
    });

    it("replaces the bullets with those from the packet", () => {
        const result = processNewState(makePacketData(), makeCurrentState());

        expect(result.bullets).toEqual([{ x: 10, y: 20, heading: 0.5, ownerId: "p1" }]);
    });

    it("assigns colors to new players", () => {
        const result = processNewState(makePacketData(), makeCurrentState());

        // p1 is existing and keeps its color #ff0000
        expect(result.players[0].id).toBe("p1");
        expect(result.players[0].color).toBe("#ff0000");

        // p2 is new and gets a color from the palette
        expect(result.players[1].id).toBe("p2");
        expect(result.players[1].color).toBeDefined();
        expect(result.players[1].color).not.toBe("#ff0000");
    });

    it("maps explosion positions to player colors", () => {
        const packetData = makePacketData({
            explosion_positions: [{ x: 50, y: 50, player_id: "p1" }]
        });
        const result = processNewState(packetData, makeCurrentState());

        expect(result.explosion_positions).toEqual([
            { x: 50, y: 50, color: "#ff0000" }
        ]);
    });

    it("detects local player using localId parameter", () => {
        const packetData = makePacketData({
            players: [{ id: "new_local", x: 0, y: 0, heading: 0, hp: 100 }]
        });
        const result = processNewState(packetData, makeCurrentState(), "new_local");

        expect(result.players.find(p => p.id === "new_local")?.isLocal).toBe(true);
        expect(result.players.find(p => p.id === "new_local")?.color).toBe("#60a5fa");
    });
});
