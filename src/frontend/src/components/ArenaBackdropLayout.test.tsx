import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ArenaBackdropLayout from "./ArenaBackdropLayout";

vi.mock("./backgroundPhotos", () => ({
    getRandomBackgroundPhoto: () => "/arena-photo.jpg",
}));

afterEach(cleanup);

describe("ArenaBackdropLayout", () => {
    it("shows a selected arena photo behind its content", () => {
        render(<ArenaBackdropLayout>Content</ArenaBackdropLayout>);

        expect(screen.getByRole("img", { name: "Arena background" }).getAttribute("src")).toBe("/arena-photo.jpg");
        expect(screen.getByText("Content")).toBeTruthy();
    });
});