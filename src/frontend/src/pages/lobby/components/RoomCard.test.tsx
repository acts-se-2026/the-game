import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import RoomCard, { type PublicRoom } from "./RoomCard";

afterEach(cleanup);

const room: PublicRoom = {
    room_id: "room-1234",
    player_count: 2,
    max_players: 8,
    players: ["A", "B"]
};

describe("RoomCard", () => {
    it("shows the room id and player count", () => {
        render(<RoomCard room={room} onJoin={() => {}} />);

        expect(screen.getByText("room-1234")).toBeTruthy();
        expect(
            screen.getByText((_, element) => element?.textContent?.replace(/\s+/g, " ").trim() === "2 of 8 players")
        ).toBeTruthy();
        });

    it("calls onJoin with the room id when the join button is clicked", () => {
        const onJoin = vi.fn();
        render(<RoomCard room={room} onJoin={onJoin} />);

        fireEvent.click(screen.getByRole("button", { name: "Join room" }));

        expect(onJoin).toHaveBeenCalledTimes(1);
        expect(onJoin).toHaveBeenCalledWith("room-1234");
    });
});
