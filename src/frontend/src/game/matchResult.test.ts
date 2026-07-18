import { describe, expect, it } from "vitest";
import { determineMatchResult, findKillerName } from "./matchResult";

describe("determineMatchResult", () => {
    it("returns win when the local player is the sole survivor", () => {
        expect(determineMatchResult([{ id: "local" }], "local")).toBe("win");
    });

    it("returns lose when the local player has been eliminated", () => {
        expect(determineMatchResult([{ id: "opponent" }], "local")).toBe("lose");
    });

    it("keeps the match in progress while multiple players remain", () => {
        expect(determineMatchResult([{ id: "local" }, { id: "opponent" }], "local")).toBeNull();
    });

    it("does not infer a result before the local player is known", () => {
        expect(determineMatchResult([{ id: "opponent" }], undefined)).toBeNull();
    });
});

describe("findKillerName", () => {
    const players = [
        { id: "local", username: "Alice" },
        { id: "opponent", username: "Bob" },
    ];

    it("returns the killer username for the local player's death", () => {
        expect(findKillerName(
            [{ player_id: "local", killer_id: "opponent" }],
            players,
            "local"
        )).toBe("Bob");
    });

    it("returns null when there is no attributed local-player death", () => {
        expect(findKillerName([], players, "local")).toBeNull();
        expect(findKillerName(
            [{ player_id: "someone-else", killer_id: "opponent" }],
            players,
            "local"
        )).toBeNull();
    });
});