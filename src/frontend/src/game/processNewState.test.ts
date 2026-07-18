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

const makePacketData = (): GameStartPacket["data"] => ({
    obstacles: [],
    players: [
        { id: "p1", x: 100, y: 200, heading: 1.5, hp: 100 },
        { id: "p2", x: 300, y: 400, heading: 0, hp: 100 },
    ],
    bullets: [{ x: 10, y: 20, heading: 0.5, ownerId: 'p1' }],
    chests: [],
});

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
});
