import { useCallback, useEffect, useRef, useState } from "react";
import { type ArenaState, ARENA_WIDTH, ARENA_HEIGHT } from "./types";
import { useKeyboardMovement } from "./useKeyboardMovement";
import { useWsConnection } from "../context/WsContext/useWsConnection";
import { useUser } from "../context/UserContext/useUser";
import type { GameStartPacket, WsUnknownPacket } from "../context/WsContext/types";
import { useLocation } from "react-router";
import { processNewState } from "./processNewState";
import { determineMatchResult, findKillerName, type MatchResult } from "./matchResult";
import { playSfx, preloadSfx } from "./sfx";
import { didLocalPlayerTakeDamage, getResultSfx } from "./sfxTriggers";

const EMPTY_ARENA: ArenaState = {
    obstacles: [],
    players: [],
    bullets: [],
    chests: [],
    explosion_positions: []
};

<<<<<<< HEAD
export function useGameState() {
    const location = useLocation();
    const { socket, sendMessage } = useWsConnection();
    const { user } = useUser();
    const arena = useRef<ArenaState>(
        location.state?.arenaState
            ? processNewState(location.state.arenaState, EMPTY_ARENA, user?.session_id)
            : EMPTY_ARENA
    );
    const [matchResult, setMatchResult] = useState<MatchResult>(null);
    const [killedBy, setKilledBy] = useState<string | null>(null);
    const [health, setHealth] = useState(100);
    const movement = useKeyboardMovement();
=======
interface Particle {
    graphics: Graphics;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
}

export class ArenaRenderer {
    private app: Application;
    private world: Container;
    private players: Map<string, Container> = new Map();
    private obstacles: Map<string, Graphics> = new Map();
    private bullets: Map<string, Graphics> = new Map();
    private chests: Map<string, Graphics> = new Map();
    private particles: Particle[] = [];
    private lastState: ArenaState | null = null;
>>>>>>> 37e430d29116eeca0b742ee104e24e8fc3eea926

    const lastAimSentAt = useRef(0);
    const lastAimPos = useRef<{ x: number; y: number } | null>(null);
    const lastSentHeading = useRef<number | null>(null);

<<<<<<< HEAD
    useEffect(() => {
        preloadSfx();
    }, []);

    useEffect(() => {
        const currentSocket = socket.current;
        if (!currentSocket) return;
=======

    private initBackground() {
        const grid = new Graphics();
        grid.zIndex = 0;
        grid.rect(0, 0, ARENA_WIDTH, ARENA_HEIGHT).fill({ color: 0x122032 });
        for (let x = 0; x <= ARENA_WIDTH; x += GRID_SIZE) {
            grid.moveTo(x, 0).lineTo(x, ARENA_HEIGHT);
        }
        for (let y = 0; y <= ARENA_HEIGHT; y += GRID_SIZE) {
            grid.moveTo(0, y).lineTo(ARENA_WIDTH, y);
        }
        grid.stroke({ color: 0x94a3b8, alpha: 0.12, width: 1 });
        this.world.addChild(grid);
    }

    public syncState(state: ArenaState, self_id?: string) {
        if (state !== this.lastState) {
            this.syncObstacles(state.obstacles);
            this.syncPlayers(state.players);
            this.syncBullets(state.bullets, state.players);
            this.syncChests(state.chests);
            if (self_id) {
                this.syncCamera(state.players, self_id);
            }

            if (state.explosion_positions && state.explosion_positions.length > 0) {
                state.explosion_positions.forEach(pos => this.spawnExplosion(pos.x, pos.y, pos.color));
            }
            this.lastState = state;
        }
        this.updateParticles(this.app.ticker.deltaTime);
    }

    private spawnExplosion(x: number, y: number, colorStr: string) {
        const particleCount = 20;
        const color = Number(colorStr.replace("#", "0x"));
        for (let i = 0; i < particleCount; i++) {
            const graphics = new Graphics();
            graphics.zIndex = 40;
            
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            const life = 30 + Math.random() * 30;
            
            graphics.circle(0, 0, 3 + Math.random() * 3)
                .fill({ color, alpha: 0.8 });
            
            graphics.x = x;
            graphics.y = y;
            
            this.world.addChild(graphics);
            this.particles.push({
                graphics,
                vx,
                vy,
                life,
                maxLife: life
            });
        }
    }

    private updateParticles(dt: number) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= dt;
            
            if (p.life <= 0) {
                p.graphics.destroy(true);
                this.particles.splice(i, 1);
                continue;
            }
            
            p.graphics.x += p.vx * dt;
            p.graphics.y += p.vy * dt;
            p.graphics.alpha = p.life / p.maxLife;
            p.graphics.scale.set(p.life / p.maxLife);
        }
    }

    private syncCamera(players: Player[], self_id: string) {
        const self_player = players.find(p => p.id === self_id)
        if (!self_player) {
            return;
        }
        this.world.x = -self_player.x + this.app.screen.width / 2
        this.world.y = -self_player.y + this.app.screen.height / 2
    }
>>>>>>> 37e430d29116eeca0b742ee104e24e8fc3eea926

        const handleIncomingPacket = (event: MessageEvent) => {
            const packet = JSON.parse(event.data) as WsUnknownPacket;

            switch (packet.type) {
                case "state_diff": {
                    const arenaState = packet.data as GameStartPacket["data"];
                    const previousPlayers = arena.current.players;
                    arena.current = processNewState(arenaState, arena.current, user?.session_id);
                  
                    const localPlayerTookDamage = didLocalPlayerTakeDamage(
                        previousPlayers,
                        arenaState.players,
                        user?.session_id
                    );

                    if (localPlayerTookDamage) {
                        playSfx("bullethit");
                    }

                    setKilledBy((currentKiller) =>
                        currentKiller ?? findKillerName(arenaState.deaths ?? [], previousPlayers, user?.session_id)
                    );
                    setMatchResult((currentResult) =>
                        currentResult ?? determineMatchResult(arena.current.players, user?.session_id)
                    );

                    const newHealth = arena.current.players.find(p => p.id === user?.session_id)?.hp ?? 100;
                    setHealth(newHealth);
                    break;
                }
                default:
                    console.warn("Unknown packet type:", packet.type);
            }
        };

        const handleSocketClose = () => {
            console.log("WebSocket Disconnected");
        }

        // We add a listener
        currentSocket.addEventListener("message", handleIncomingPacket);
        currentSocket.addEventListener("close", handleSocketClose);

        // Cleanup when the component unmounts or when the socket changes
        return () => {
            currentSocket.removeEventListener("message", handleIncomingPacket);
            currentSocket.removeEventListener("close", handleSocketClose);
        };
    }, [socket, user?.session_id]);

    useEffect(() => {
        sendMessage("player_move", { x: movement.x, y: movement.y });
    }, [movement, sendMessage]);

    useEffect(() => {
        const resultSfx = getResultSfx(matchResult);
        if (!resultSfx) {
            return;
        }

<<<<<<< HEAD
        playSfx(resultSfx);
    }, [matchResult]);

    const sendAim = useCallback(() => {
        const pos = lastAimPos.current;
        const localPlayer = arena.current.players.find(p => p.isLocal);
        const playerPos = localPlayer ? { x: localPlayer.x, y: localPlayer.y } : null;
        if (!pos || !playerPos) return;

        // Always aim towards the mouse cursor
        const heading = Math.atan2(pos.y - ARENA_HEIGHT / 2, pos.x - ARENA_WIDTH / 2);

        // Don't send if the aim direction did not change
        if (lastSentHeading.current === heading) return;

        const now = Date.now();
        if (now - lastAimSentAt.current < 50) return;

        sendMessage("player_aim", { heading });
        lastSentHeading.current = heading;
        lastAimSentAt.current = now;
    }, [sendMessage]);

    const handleAim = useCallback((pos: { x: number; y: number }) => {
        lastAimPos.current = { x: pos.x, y: pos.y };
        sendAim();
    }, [sendAim]);

    // Continuously re-evaluate the aim so the player always faces the mouse
    useEffect(() => {
        let frame: number;
        const tick = () => {
            sendAim();
            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [sendAim]);

    const handleShoot = useCallback(() => {
        playSfx("gunshot");
        sendMessage("player_shoot");
    }, [sendMessage]);

    return { arena, health, matchResult, killedBy, handleAim, handleShoot };
}
=======
    public destroy() {
        this.players.clear();
        this.obstacles.clear();
        this.particles.forEach(p => p.graphics.destroy(true));
        this.particles = [];
    }
}
>>>>>>> 37e430d29116eeca0b742ee104e24e8fc3eea926
