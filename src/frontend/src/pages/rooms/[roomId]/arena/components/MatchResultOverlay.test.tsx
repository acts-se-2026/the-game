// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import MatchResultOverlay from "./MatchResultOverlay";

afterEach(cleanup);

describe("MatchResultOverlay", () => {
    it("shows the win screen without loss details or a spectate action", () => {
        render(<MatchResultOverlay result="win" killedBy={null} onSpectate={() => undefined} />);

        expect(screen.getByRole("heading", { name: "YOU WIN!" })).toBeTruthy();
        expect(screen.queryByText(/YOU WERE KILLED BY:/)).toBeNull();
        expect(screen.queryByRole("button", { name: "Spectate lobby" })).toBeNull();
    });

    it("shows who killed the player and lets them spectate", () => {
        const onSpectate = vi.fn();
        render(<MatchResultOverlay result="lose" killedBy="Bob" onSpectate={onSpectate} />);

        expect(screen.getByRole("heading", { name: "YOU LOSE!" })).toBeTruthy();
        expect(screen.getByText("YOU WERE KILLED BY: Bob")).toBeTruthy();
        fireEvent.click(screen.getByRole("button", { name: "Spectate lobby" }));
        expect(onSpectate).toHaveBeenCalledOnce();
    });

    it("uses a fallback when the killer is unknown", () => {
        render(<MatchResultOverlay result="lose" killedBy={null} onSpectate={() => undefined} />);

        expect(screen.getByText("YOU WERE KILLED BY: Unknown player")).toBeTruthy();
    });

    it("renders nothing while the match is still active", () => {
        const { container } = render(
            <MatchResultOverlay result={null} killedBy={null} onSpectate={() => undefined} />
        );

        expect(container.childElementCount).toBe(0);
    });
});