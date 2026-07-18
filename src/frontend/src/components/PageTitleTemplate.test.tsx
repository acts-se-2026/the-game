import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import PageTitleTemplate from "./PageTitleTemplate";

afterEach(cleanup);

describe("PageTitleTemplate", () => {
    it("renders the eyebrow, title and description", () => {
        render(
            <PageTitleTemplate
                eyebrow="Welcome"
                title="The Game"
                description="A multiplayer arena shooter."
            />,
        );

        expect(screen.getByText("Welcome")).toBeTruthy();
        expect(screen.getByText("The Game")).toBeTruthy();
        expect(screen.getByText("A multiplayer arena shooter.")).toBeTruthy();
    });
});
