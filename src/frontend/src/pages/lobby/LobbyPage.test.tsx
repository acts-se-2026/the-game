import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import LobbyPage from "./LobbyPage";
import { backendApi } from "../../api/backend";
import { useUser } from "../../context/UserContext/useUser";

vi.mock("../../api/backend", () => ({
    backendApi: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

vi.mock("../../context/UserContext/useUser", () => ({
    useUser: vi.fn(),
}));

vi.mock("react-router", () => ({
    useNavigate: vi.fn(),
}));

describe("LobbyPage", () => {
    beforeEach(() => {
        (useUser as any).mockReturnValue({ user: { username: "testuser" } });
        (backendApi.get as any).mockResolvedValue({ data: { rooms: [] } });
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it("renders and fetches rooms on mount", async () => {
        render(<LobbyPage />);
        expect(backendApi.get).toHaveBeenCalledWith("/api/rooms");
        expect(screen.getByText("Playing as testuser")).toBeTruthy();
    });

    it("refreshes rooms every 4 seconds", async () => {
        vi.useFakeTimers();
        render(<LobbyPage />);
        expect(backendApi.get).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(4000);
        expect(backendApi.get).toHaveBeenCalledTimes(2);

        vi.advanceTimersByTime(4000);
        expect(backendApi.get).toHaveBeenCalledTimes(3);
        vi.useRealTimers();
    });

    it("refreshes rooms when clicking the Refresh button", async () => {
        render(<LobbyPage />);
        expect(backendApi.get).toHaveBeenCalledTimes(1);

        // Wait for initial fetch to finish
        await waitFor(() => expect(screen.queryByText("Refreshing...")).toBeNull());

        const refreshButton = screen.getByRole("button", { name: "Refresh" });
        fireEvent.click(refreshButton);

        expect(backendApi.get).toHaveBeenCalledTimes(2);
    });
});
