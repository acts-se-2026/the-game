import { useEffect, useState } from "react";

export type MovementInput = {
    x: number;
    y: number;
};

const movementKeys: Record<string, MovementInput> = {
    w: { x: 0, y: -1 },
    arrowup: { x: 0, y: -1 },
    s: { x: 0, y: 1 },
    arrowdown: { x: 0, y: 1 },
    a: { x: -1, y: 0 },
    arrowleft: { x: -1, y: 0 },
    d: { x: 1, y: 0 },
    arrowright: { x: 1, y: 0 },
};

function getMovement(pressedKeys: Set<string>): MovementInput {
    let x = 0;
    let y = 0;

    pressedKeys.forEach((key) => {
        const direction = movementKeys[key];
        if (direction) {
            x += direction.x;
            y += direction.y;
        }
    });

    if (x === 0 && y === 0) return { x: 0, y: 0 };
    const length = Math.hypot(x, y);
    return { x: x / length, y: y / length };
}

/** Tracks WASD and arrow keys */
export function useKeyboardMovement(): MovementInput {
    const [movement, setMovement] = useState<MovementInput>({ x: 0, y: 0 });

    useEffect(() => {
        const pressedKeys = new Set<string>();

        const updateMovement = () => setMovement(getMovement(pressedKeys));
        const handleKeyDown = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();
            if (!movementKeys[key]) return;
            event.preventDefault();
            if (pressedKeys.has(key)) return;
            pressedKeys.add(key);
            updateMovement();
        };
        const handleKeyUp = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();
            if (!movementKeys[key]) return;
            if (!pressedKeys.has(key)) return;
            pressedKeys.delete(key);
            updateMovement();
        };
        const clearMovement = () => {
            pressedKeys.clear();
            updateMovement();
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        window.addEventListener("blur", clearMovement);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("blur", clearMovement);
        };
    }, []);

    return movement;
}
