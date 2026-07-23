import { Application, Container, Graphics, Text } from "pixi.js";
import { ARENA_WIDTH, ARENA_HEIGHT, type ArenaState, type Bullet, type Obstacle, type Player, type Chest } from "../../../../../game/types";

const PLAYER_RADIUS = 18;
const GRID_SIZE = 30;

type PlayerView = {
    container: Container;
    body: Graphics;
    arrow: Graphics;
    username: Text;
    appearanceKey: string;
};

interface Particle {
    graphics: Graphics;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
}

/**
 * Immediate-mode renderer for the arena using Pixi.js.
 *
 * Call `syncState` on each tick with the latest authoritative state; the
 * renderer will diff and redraw layers as needed.
 */
export class ArenaRenderer {
    private world: Container;
    private players: Map<string, PlayerView> = new Map();
    private obstacleLayer: Graphics;
    private chestLayer: Graphics;
    private bulletLayer: Graphics;
    private lastState: ArenaState | null = null;
    private lastObstacles: Obstacle[] | null = null;
    private lastChests: Chest[] | null = null;
    private particles: Particle[] = [];
    private targetHeadings: Map<string, number> = new Map();
    private selfId: string | null = null;
    private app: Application;

    constructor(app: Application) {
        this.app = app;
        this.world = new Container();
        this.world.sortableChildren = true;
        app.stage.addChild(this.world);
        this.initBackground();

        this.obstacleLayer = new Graphics();
        this.obstacleLayer.zIndex = 10;
        this.chestLayer = new Graphics();
        this.chestLayer.zIndex = 15;
        this.bulletLayer = new Graphics();
        this.bulletLayer.zIndex = 30;
        this.world.addChild(this.obstacleLayer, this.chestLayer, this.bulletLayer);
    }


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

    /**
     * Update the scene to reflect the latest authoritative state.
     * @param state Latest state snapshot
     * @param self_id Current player's id for camera/appearance
     * @param localAimHeading Optional local aim for smooth rotation
     */
    public syncState(state: ArenaState, self_id?: string, localAimHeading?: number) {
        this.selfId = self_id || null;
        if (state !== this.lastState) {
            if (state.obstacles !== this.lastObstacles) {
                this.syncObstacles(state.obstacles);
                this.lastObstacles = state.obstacles;
            }
            this.syncPlayers(state.players);
            this.syncBullets(state.bullets, state.players);
            if (state.chests !== this.lastChests && !this.sameChests(state.chests, this.lastChests)) {
                this.syncChests(state.chests);
            }
            this.lastChests = state.chests;
            if (self_id) {
                this.syncCamera(state.players, self_id);
            }

            if (state.explosion_positions && state.explosion_positions.length > 0) {
                state.explosion_positions.forEach(pos => this.spawnExplosion(pos.x, pos.y, pos.color));
            }
            this.lastState = state;
        }

        if (self_id && localAimHeading !== undefined) {
            this.targetHeadings.set(self_id, localAimHeading);
        }

        this.updateRotations(this.app.ticker.deltaTime);
        this.updateParticles(this.app.ticker.deltaTime);
    }

    private lerpAngle(start: number, end: number, amount: number) {
        let difference = end - start;
        
        // Make sure we take the shortest path around the circle
        while (difference < -Math.PI) difference += Math.PI * 2;
        while (difference > Math.PI) difference -= Math.PI * 2;

        return start + difference * amount;
    }

    private updateRotations(dt: number) {
        for (const [id, view] of this.players.entries()) {
            const target = this.targetHeadings.get(id);
            if (target === undefined) continue;

            const isLocal = id === this.selfId;
            const alpha = isLocal ? 0.92 * dt : 0.6 * dt; // Make local player rotation faster for responsiveness
            view.arrow.rotation = this.lerpAngle(view.arrow.rotation, target, Math.min(1, alpha)); // We limit alpha to 1 to avoid overshooting
        }
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

    private syncBullets(bullets: Bullet[], players: Player[]) {
        const playerColors = new Map(players.map((player) => [player.id, player.color]));
        this.bulletLayer.clear();

        for (const bullet of bullets) {
            const radius = Math.floor(Math.sqrt(bullet.damage * 3) + 1);
            this.bulletLayer
                .circle(bullet.x, bullet.y, radius)
                .fill({ color: playerColors.get(bullet.ownerId) ?? 0xff0000 });
        }
    }

    private syncChests(data: Chest[]) {
        this.chestLayer.clear();
        for (const chest of data) {
            let chestColor = 0x3fed13;
            if (chest.effect === "speed") {
                chestColor = 0xede213;
            } else if (chest.effect === "strength") {
                chestColor = 0xeb220c;
            }

            this.chestLayer
                .rect(chest.x, chest.y, chest.size.x, chest.size.y)
                .fill({ color: chestColor });
        }
    }

    private syncObstacles(data: Obstacle[]) {
        this.obstacleLayer.clear();
        for (const obstacle of data) {
            this.obstacleLayer
                .rect(obstacle.x, obstacle.y, obstacle.size.x, obstacle.size.y).fill({ color: 0x334155 })
                .rect(obstacle.x + 1.5, obstacle.y + 1.5, obstacle.size.x - 3, obstacle.size.y - 3).stroke({ color: 0x64748b, width: 3 })
                .rect(obstacle.x + 5, obstacle.y + 5, obstacle.size.x - 10, 6).fill({ color: 0xffffff, alpha: 0.06 });
        }
    }

    private syncPlayers(data: Player[]) {
        const currentIds = new Set(data.map(p => p.id));

        for (const [id, view] of this.players.entries()) {
            if (!currentIds.has(id)) {
                view.container.destroy(true);
                this.players.delete(id);
            }
        }

        for (const player of data) {
              let view = this.players.get(player.id);
                   if (!view) {
                       const container = new Container();
                container.zIndex = 20;
                const body = new Graphics();
                body.name = "body";

                const arrow = new Graphics();
                arrow.name = "arrow";
                const arrowLength = PLAYER_RADIUS + 16;
                arrow.moveTo(0, 0).lineTo(arrowLength, 0).stroke({ color: 0x0f172a, width: 5, cap: "round" })
                     .moveTo(arrowLength, 0).lineTo(arrowLength - 10, -7).lineTo(arrowLength - 10, 7).closePath().fill({ color: 0x0f172a });

                const username = new Text({
                    text: player.username,
                    style: {
                        fill: 0xf8fafc,
                        fontFamily: "Arial, sans-serif",
                        fontSize: 13,
                        fontWeight: "bold",
                        stroke: { color: 0x0f172a, width: 3 },
                    },
                });
                username.name = "username";
                username.anchor.set(0.5, 1);
                username.y = -(PLAYER_RADIUS + 8);

                container.addChild(body, arrow, username);
                this.world.addChild(container);
                view = { container, body, arrow, username, appearanceKey: "" };
                this.players.set(player.id, view);
            }

                if (view.container.x !== player.x) view.container.x = player.x;
                     if (view.container.y !== player.y) view.container.y = player.y;
                     if (view.arrow.rotation !== player.heading) view.arrow.rotation = player.heading;
                     if (view.username.text !== player.username) view.username.text = player.username;
                     const appearanceKey = `${player.color}:${player.isLocal === true}`;
                     if (view.appearanceKey !== appearanceKey) {
                         view.body
                             .clear()
                             .circle(0, 0, PLAYER_RADIUS + (player.isLocal ? 5 : 3))
                             .fill({
                                 color: player.isLocal ? 0x60a5fa : 0xffffff,
                                 alpha: player.isLocal ? 0.22 : 0.1,
                             })
                             .circle(0, 0, PLAYER_RADIUS)
                             .fill({ color: player.color })
                             .stroke({ color: 0xf8fafc, width: 2 });
                         view.appearanceKey = appearanceKey;
               }
        }
    }

    private sameChests(chests: Chest[], previous: Chest[] | null): boolean {
        if (!previous || chests.length !== previous.length) return false;
        return chests.every((chest, index) => {
            const oldChest = previous[index];
            return chest.x === oldChest.x
                && chest.y === oldChest.y
                && chest.size.x === oldChest.size.x
                && chest.size.y === oldChest.size.y
                && chest.effect === oldChest.effect;
        });
    }

    public destroy() {
        this.players.clear();
        this.targetHeadings.clear();
        this.selfId = null;
        this.lastState = null;
        this.lastObstacles = null;
        this.lastChests = null;
        this.particles.forEach(p => p.graphics.destroy(true));
        this.particles = [];
    }
}
