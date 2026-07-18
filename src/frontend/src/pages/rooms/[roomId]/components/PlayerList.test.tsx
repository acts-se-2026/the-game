import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import PlayerList, { type RoomPlayer } from "./PlayerList";

afterEach(cleanup);

const players: RoomPlayer[] = [
    { userId: "u1", username: "alice" },
    { userId: "u2", username: "bob" },
];

describe("PlayerList", () => {
    it("shows each player's username", () => {
        render(<PlayerList players={players} />);

        expect(screen.getByText("alice")).toBeTruthy();
        expect(screen.getByText("bob")).toBeTruthy();
    });

    it("shows the uppercased first letter as an avatar", () => {
        render(<PlayerList players={[{ userId: "u1", username: "alice" }]} />);

        expect(screen.getByText("A")).toBeTruthy();
    });
});
