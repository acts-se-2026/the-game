import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ArenaBackdropLayout from "./ArenaBackdropLayout";

vi.mock("./arenaBackdropCache", () => ({
    getArenaBackdropState: () => ({
        obstacles: [{ x: 0, y: 0, size: { x: 10, y: 10 } }],
        players: [{ id: "player", username: "Player", x: 0, y: 0, hp: 100, heading: 0, color: "#fff" }],
        bullets: [{ x: 0, y: 0, heading: 0, ownerId: "player" }],
        chests: [{ x: 0, y: 0, size: { x: 10, y: 10 } }],
    }),
}));

vi.mock("../pages/rooms/[roomId]/arena/components/ArenaCanvas", () => ({
    default: ({ stateRef }: { stateRef: { current: { obstacles: unknown[]; players: unknown[]; bullets: unknown[]; chests: unknown[] } } }) => (
        <div data-testid="arena-state">
            {stateRef.current.obstacles.length},
            {stateRef.current.players.length},
            {stateRef.current.bullets.length},
            {stateRef.current.chests.length}
        </div>
    ),
}));

afterEach(cleanup);

describe("ArenaBackdropLayout", () => {
    it("shows the cached arena entities by default", () => {
        render(<ArenaBackdropLayout>Content</ArenaBackdropLayout>);

        expect(screen.getByTestId("arena-state").textContent?.replace(/\s/g, "")).toBe("1,1,1,1");
    });

    it("shows only the arena and obstacles in scenery-only mode", () => {
        render(<ArenaBackdropLayout sceneryOnly>Content</ArenaBackdropLayout>);

        expect(screen.getByTestId("arena-state").textContent?.replace(/\s/g, "")).toBe("1,0,0,0");
        expect(screen.queryByText("Content")).toBeNull();
    });
});