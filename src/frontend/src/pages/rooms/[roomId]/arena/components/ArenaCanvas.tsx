import { useEffect, useRef, useState, type RefObject } from "react";
import { Application } from "pixi.js";
import { ARENA_WIDTH, ARENA_HEIGHT, type ArenaState } from "../../../../../game/types";
import { ArenaRenderer } from "../lib/ArenaRenderer";
import { useUser } from "../../../../../context/UserContext/useUser"

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

    const wrapperRef = useRef<HTMLDivElement>(null);
    const localAimHeadingRef = useRef<number | undefined>(undefined);

    // We use refs for callbacks so we don't have to restart Pixi when they change
    const onAimRef = useRef(onAim);
    const onShootRef = useRef(onShoot);

    const user = useUser().user;

    // Resize the Pixi canvas to fit the wrapper while maintaining aspect ratio
    useEffect(() => {
        const wrapper = wrapperRef.current;
        const host = hostRef.current;
        if (!wrapper || !host) return;

        const resize = () => {
            const { width, height } = wrapper.getBoundingClientRect();
            if (width <= 0 || height <= 0) return;
            const scale = Math.min(width / ARENA_WIDTH, height / ARENA_HEIGHT);
            host.style.width = `${ARENA_WIDTH * scale}px`;
            host.style.height = `${ARENA_HEIGHT * scale}px`;
        };

        resize();
        const observer = new ResizeObserver(resize);
        observer.observe(wrapper);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        onAimRef.current = onAim;
        onShootRef.current = onShoot;
    }, [onAim, onShoot]);

    useEffect(() => {
        if (!pixi) return;

        const tick = () => {
            pixi.renderer.syncState(stateRef.current, user?.session_id, localAimHeadingRef.current);
        };
        pixi.app.ticker.add(tick);
        return () => {
            pixi.app.ticker.remove(tick);
        };
    }, [stateRef, pixi, user?.session_id]);

    // This effect runs once when the component is first loaded
    useEffect(() => {
        let application: Application | null = null;
        let isMounted = true;

        const startPixi = async () => {
            const app = new Application();
            
            try {
                // Initialize Pixi with the fixed Arena Size
                await app.init({
                    width: ARENA_WIDTH,
                    height: ARENA_HEIGHT,
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
                app.stage.on("pointermove", (event) => {
                    const pos = event.global;
                    onAimRef.current?.(pos);
                    localAimHeadingRef.current = Math.atan2(pos.y - ARENA_HEIGHT / 2, pos.x - ARENA_WIDTH / 2);
                });
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
        <div ref={wrapperRef} className="flex h-full w-full items-center justify-center">
            <div
                ref={hostRef}
                className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/30 [&_canvas]:block [&_canvas]:size-full [&_canvas]:cursor-crosshair [&_canvas]:touch-none"
                role="application"
                aria-label="Game arena"
            />
        </div>
    );
}
