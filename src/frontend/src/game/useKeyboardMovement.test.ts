import { describe, it, expect, afterEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";
import { useKeyboardMovement } from "./useKeyboardMovement";

afterEach(cleanup);

const keyDown = (key: string) =>
    act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key }));
    });

const keyUp = (key: string) =>
    act(() => {
        window.dispatchEvent(new KeyboardEvent("keyup", { key }));
    });

describe("useKeyboardMovement", () => {
    it("returns zero movement initially", () => {
        const { result } = renderHook(() => useKeyboardMovement());

        expect(result.current).toEqual({ x: 0, y: 0 });
    });

    it("moves up when pressing w", () => {
        const { result } = renderHook(() => useKeyboardMovement());

        keyDown("w");

        expect(result.current).toEqual({ x: 0, y: -1 });
    });

    it("supports arrow keys the same as wasd", () => {
        const { result } = renderHook(() => useKeyboardMovement());

        keyDown("ArrowRight");

        expect(result.current).toEqual({ x: 1, y: 0 });
    });

    it("cancels opposing directions", () => {
        const { result } = renderHook(() => useKeyboardMovement());

        keyDown("a");
        keyDown("d");

        expect(result.current).toEqual({ x: 0, y: 0 });
    });

    it("stops moving after the key is released", () => {
        const { result } = renderHook(() => useKeyboardMovement());

        keyDown("s");
        expect(result.current).toEqual({ x: 0, y: 1 });

        keyUp("s");
        expect(result.current).toEqual({ x: 0, y: 0 });
    });

    it("ignores keys that are not movement keys", () => {
        const { result } = renderHook(() => useKeyboardMovement());

        keyDown("q");

        expect(result.current).toEqual({ x: 0, y: 0 });
    });
});
