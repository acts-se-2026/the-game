import { Application, Container, Graphics, Text } from "pixi.js";
import { ARENA_WIDTH, ARENA_HEIGHT, type ArenaState, type Bullet, type Obstacle, type Player, type Chest } from "../../../../../game/types";

const PLAYER_RADIUS = 18;
const GRID_SIZE = 30;

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

    constructor(app: Application) {
        this.app = app;
        this.world = new Container();
        this.world.sortableChildren = true;
        this.app.stage.addChild(this.world);
        this.initBackground();
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

    public syncState(state: ArenaState) {
        if (state !== this.lastState) {
            this.syncObstacles(state.obstacles);
            this.syncPlayers(state.players);
            this.syncBullets(state.bullets, state.players);
            this.syncChests(state.chests);

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

    private syncBullets(bullets: Bullet[], players: Player[]) {
        for (const graphics of this.bullets.values()) {
            graphics.destroy(true);
        }
        this.bullets.clear();


        bullets.forEach((bullet, idx) => {
            const key = String(idx);
            const graphics = new Graphics();
            graphics.zIndex = 30;
            this.world.addChild(graphics);
            this.bullets.set(key, graphics);

            const owner = players.find(
                player => player.id === bullet.ownerId
            );
            
            graphics.clear()
                .circle(bullet.x, bullet.y, 5).fill({
                    color: owner ? Number(owner.color.replace("#", "0x")) : 0xff0000
                });
        });
    }

    private syncChests(data : Chest[]) {
        for (const graphics of this.chests.values()) {
            graphics.destroy(true);
        }
        this.chests.clear();

        data.forEach((chest, idx) => {
            const key = String(idx);
            const graphics = new Graphics();
            this.world.addChild(graphics);
            this.chests.set(key, graphics);

            graphics.clear()
                .rect(chest.x, chest.y, chest.size.x, chest.size.y)
                .fill({ color: 0x19bf45 })
        });


    }

    private syncObstacles(data: Obstacle[]) {
        for (const graphics of this.obstacles.values()) {
            graphics.destroy(true);
        }
        this.obstacles.clear();

        data.forEach((obstacle, idx) => {
            const key = String(idx);
            const graphics = new Graphics();
            graphics.zIndex = 10;
            this.world.addChild(graphics);
            this.obstacles.set(key, graphics);

            graphics.clear()
                .rect(obstacle.x, obstacle.y, obstacle.size.x, obstacle.size.y).fill({ color: 0x334155 })
                .rect(obstacle.x + 1.5, obstacle.y + 1.5, obstacle.size.x - 3, obstacle.size.y - 3).stroke({ color: 0x64748b, width: 3 })
                .rect(obstacle.x + 5, obstacle.y + 5, obstacle.size.x - 10, 6).fill({ color: 0xffffff, alpha: 0.06 });
        });
    }

    private syncPlayers(data: Player[]) {
        const currentIds = new Set(data.map(p => p.id));
        
        for (const [id, container] of this.players.entries()) {
            if (!currentIds.has(id)) {
                container.destroy(true);
                this.players.delete(id);
            }
        }

        for (const player of data) {
            let container = this.players.get(player.id);
            if (!container) {
                container = new Container();
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
                this.players.set(player.id, container);
            }
            
            container.x = player.x;
            container.y = player.y;

            const body = container.getChildByName("body") as Graphics;
            body.clear()
                .circle(0, 0, PLAYER_RADIUS + (player.isLocal ? 5 : 3)).fill({
                    color: player.isLocal ? 0x60a5fa : 0xffffff,
                    alpha: player.isLocal ? 0.22 : 0.1,
                })
                .circle(0, 0, PLAYER_RADIUS).fill({ color: player.color }).stroke({ color: 0xf8fafc, width: 2 });


            const username = container.getChildByName("username") as Text;
            username.text = player.username;

            const arrow = container.getChildByName("arrow") as Graphics;
            arrow.rotation = player.heading;
        }
    }

    public destroy() {
        this.players.clear();
        this.obstacles.clear();
        this.particles.forEach(p => p.graphics.destroy(true));
        this.particles = [];
    }
}
