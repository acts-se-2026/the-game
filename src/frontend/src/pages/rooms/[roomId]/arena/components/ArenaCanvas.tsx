import { useEffect, useRef, useState, type RefObject } from "react";
import { Application } from "pixi.js";
import { ARENA_SIZE, type ArenaState } from "../../../../../game/types";
import { ArenaRenderer } from "../lib/ArenaRenderer";

type ArenaCanvasProps = {
    stateRef: RefObject<ArenaState>;
    onAim?: (position: { x: number; y: number }) => void;
    onShoot?: () => void;
};

export default function ArenaCanvas({ stateRef, onAim, onShoot }: ArenaCanvasProps) {
    const hostRef = useRef<HTMLDivElement>(null);
    const [pixi, setPixi] = useState<{
        app: Application;
        renderer: ArenaRenderer;
    } | null>(null);

    // We use refs for callbacks so we don't have to restart Pixi when they change
    const onAimRef = useRef(onAim);
    const onShootRef = useRef(onShoot);

    useEffect(() => {
        onAimRef.current = onAim;
        onShootRef.current = onShoot;
    }, [onAim, onShoot]);

    useEffect(() => {
        if (!pixi) return;

        let frame: number;
        const tick = () => {
            pixi.renderer.syncState(stateRef.current);
            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [stateRef, pixi]);

    // This effect runs once when the component is first loaded
    useEffect(() => {
        let application: Application | null = null;
        let isMounted = true;

        const startPixi = async () => {
            const app = new Application();
            
            try {
                // Initialize Pixi with the fixed Arena Size (e.g. 600x600)
                await app.init({
                    width: ARENA_SIZE,
                    height: ARENA_SIZE,
                    backgroundAlpha: 0,
                    antialias: true,
                });

                if (!isMounted || !hostRef.current) {
                    app.destroy(true, { children: true, texture: true });
                    return;
                }

                application = app;

                const renderer = new ArenaRenderer(app);

                // Save references for the update effect above
                setPixi({
                    app: app,
                    renderer,
                });

                // Set up mouse/touch events
                app.stage.eventMode = "static";
                app.stage.hitArea = app.screen;
                app.stage.on("pointermove", (event) => onAimRef.current?.(event.global));
                app.stage.on("pointertap", () => onShootRef.current?.());

                // Add the canvas to our HTML div
                hostRef.current.appendChild(app.canvas);
            } catch (err) {
                console.error("PixiJS initialization failed:", err);
            }
        };

        void startPixi();

        return () => {
            isMounted = false;
            if (application) {
                application.destroy(true, { children: true, texture: true });
                application = null;
            }
            setPixi(null);
        };
    }, []);

    return (
        <div
            ref={hostRef}
            className="aspect-square w-full max-w-[600px] overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/30 [&_canvas]:block [&_canvas]:size-full [&_canvas]:cursor-crosshair [&_canvas]:touch-none"
            role="application"
            aria-label="Game arena"
        />
    );
}
