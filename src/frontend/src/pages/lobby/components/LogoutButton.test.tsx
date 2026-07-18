import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";

const navigate = vi.fn();
const logout = vi.fn().mockResolvedValue(undefined);

vi.mock("react-router", () => ({
    useNavigate: () => navigate,
}));

vi.mock("../../../context/UserContext", () => ({
    useUser: () => ({ logout }),
}));

import LogoutButton from "./LogoutButton";

afterEach(cleanup);
beforeEach(() => {
    navigate.mockClear();
    logout.mockClear();
});

describe("LogoutButton", () => {
    it("renders a logout button", () => {
        render(<LogoutButton />);

        expect(screen.getByRole("button", { name: "Logout" })).toBeTruthy();
    });

    it("logs out and then navigates to the login page", async () => {
        render(<LogoutButton />);

        fireEvent.click(screen.getByRole("button", { name: "Logout" }));

        await waitFor(() => expect(navigate).toHaveBeenCalledWith("/login"));
        expect(logout).toHaveBeenCalledTimes(1);
    });
});
