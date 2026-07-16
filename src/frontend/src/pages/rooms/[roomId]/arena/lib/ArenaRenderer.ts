import { Application, Container, Graphics } from "pixi.js";
import { ARENA_SIZE, type ArenaState, type Bullet, type Explosion, type Obstacle, type Player } from "../../../../../game/types";

const PLAYER_RADIUS = 18;
const BULLET_RADIUS_X = 7;
const BULLET_RADIUS_Y = 4;
const GRID_SIZE = 30;

export class ArenaRenderer {
    private app: Application;
    private world: Container;
    private players: Map<string, Container> = new Map();
    private obstacles: Map<string, Graphics> = new Map();
    private bullets: Map<string, Graphics> = new Map();
    private explosions: Map<string, Graphics> = new Map();
    private previousBulletPositions: Map<string, { x: number; y: number }> = new Map();

    constructor(app: Application) {
        this.app = app;
        this.world = new Container();
        this.app.stage.addChild(this.world);
        this.initBackground();
    }

    private initBackground() {
        const grid = new Graphics();
        grid.rect(0, 0, ARENA_SIZE, ARENA_SIZE).fill({ color: 0x122032 });
        for (let pos = 0; pos <= ARENA_SIZE; pos += GRID_SIZE) {
            grid.moveTo(pos, 0).lineTo(pos, ARENA_SIZE);
            grid.moveTo(0, pos).lineTo(ARENA_SIZE, pos);
        }
        grid.stroke({ color: 0x94a3b8, alpha: 0.12, width: 1 });
        this.world.addChild(grid);
    }

    public syncState(state: ArenaState) {
        this.syncObstacles(state.obstacles);
        this.syncPlayers(state.players);
        this.syncBullets(state.bullets);
        this.syncExplosions(state.explosions);
    }

    private syncExplosions(data: Explosion[]) {
        const currentIds = new Set(data.map((explosion) => explosion.id));

        for (const [id, graphics] of this.explosions.entries()) {
            if (!currentIds.has(id)) {
                graphics.destroy(true);
                this.explosions.delete(id);
            }
        }

        for (const explosion of data) {
            let graphics = this.explosions.get(explosion.id);
            if (!graphics) {
                graphics = new Graphics();
                this.world.addChild(graphics);
                this.explosions.set(explosion.id, graphics);
            }

            const progress = Math.min(1, Math.max(0, explosion.age / explosion.maxAge));
            const alpha = 1 - progress;
            const outerRadius = 8 + progress * 22;
            const middleRadius = Math.max(4, outerRadius * 0.64);
            const coreRadius = Math.max(2, 8 * (1 - progress));

            graphics.clear()
                .circle(0, 0, outerRadius)
                .stroke({ color: 0xfb923c, width: 2, alpha: alpha * 0.9 })
                .circle(0, 0, middleRadius)
                .stroke({ color: 0xfacc15, width: 2, alpha: alpha * 0.75 })
                .circle(0, 0, coreRadius)
                .fill({ color: 0xfef08a, alpha: alpha * 0.7 });

            graphics.x = explosion.x;
            graphics.y = explosion.y;
        }
    }

    private syncBullets(data: Bullet[]) {
        const currentIds = new Set(data.map((bullet) => bullet.id));

        for (const [id, graphics] of this.bullets.entries()) {
            if (!currentIds.has(id)) {
                graphics.destroy(true);
                this.bullets.delete(id);
                this.previousBulletPositions.delete(id);
            }
        }

        for (const bullet of data) {
            let graphics = this.bullets.get(bullet.id);
            if (!graphics) {
                graphics = new Graphics();
                this.world.addChild(graphics);
                this.bullets.set(bullet.id, graphics);
            }

            const previousPosition = this.previousBulletPositions.get(bullet.id);
            const deltaX = previousPosition ? bullet.x - previousPosition.x : 0;
            const deltaY = previousPosition ? bullet.y - previousPosition.y : 0;
            const isMoving = deltaX !== 0 || deltaY !== 0;
            const rotation = isMoving ? Math.atan2(deltaY, deltaX) : graphics.rotation;

            graphics.clear()
                .ellipse(0, 0, BULLET_RADIUS_X + 2, BULLET_RADIUS_Y + 2)
                .fill({ color: 0xf59e0b, alpha: 0.2 })
                .ellipse(0, 0, BULLET_RADIUS_X, BULLET_RADIUS_Y)
                .fill({ color: 0xf8fafc })
                .ellipse(0, 0, BULLET_RADIUS_X - 2, BULLET_RADIUS_Y - 1)
                .fill({ color: 0xf59e0b });
            graphics.x = bullet.x;
            graphics.y = bullet.y;
            graphics.rotation = rotation;

            this.previousBulletPositions.set(bullet.id, { x: bullet.x, y: bullet.y });
        }
    }

    private syncObstacles(data: Obstacle[]) {
        const currentIds = new Set(data.map(o => o.id));
        
        for (const [id, graphics] of this.obstacles.entries()) {
            if (!currentIds.has(id)) {
                graphics.destroy(true);
                this.obstacles.delete(id);
            }
        }

        for (const obstacle of data) {
            let graphics = this.obstacles.get(obstacle.id);
            if (!graphics) {
                graphics = new Graphics();
                this.world.addChild(graphics);
                this.obstacles.set(obstacle.id, graphics);
            }

            graphics.clear()
                .rect(obstacle.x, obstacle.y, obstacle.size, obstacle.size).fill({ color: 0x334155 })
                .rect(obstacle.x + 1.5, obstacle.y + 1.5, obstacle.size - 3, obstacle.size - 3).stroke({ color: 0x64748b, width: 3 })
                .rect(obstacle.x + 5, obstacle.y + 5, obstacle.size - 10, 6).fill({ color: 0xffffff, alpha: 0.06 });
        }
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
                const body = new Graphics();
                body.name = "body";
                
                const arrow = new Graphics();
                arrow.name = "arrow";

                container.addChild(body, arrow);
                this.world.addChild(container);
                this.players.set(player.id, container);
            }
            
            container.x = player.x;
            container.y = player.y;
            container.rotation = player.heading;

            const body = container.getChildByName("body") as Graphics;
            const arrow = container.getChildByName("arrow") as Graphics;
            const auraRadius = PLAYER_RADIUS + (player.isLocal ? 5 : 3);

            body.clear()
                .circle(0, 0, auraRadius).fill({
                    color: player.isLocal ? 0x60a5fa : 0xffffff,
                    alpha: player.isLocal ? 0.22 : 0.1,
                })
                .circle(0, 0, PLAYER_RADIUS).fill({ color: player.color }).stroke({ color: 0xf8fafc, width: 2 });

            arrow.clear()
                .moveTo(0, 0)
                .lineTo(PLAYER_RADIUS + 16, 0)
                .stroke({ color: 0x0f172a, width: 5, cap: "round" })
                .moveTo(PLAYER_RADIUS + 16, 0)
                .lineTo(PLAYER_RADIUS + 6, -7)
                .lineTo(PLAYER_RADIUS + 6, 7)
                .closePath()
                .fill({ color: 0x0f172a });
        }
    }

    public destroy() {
        this.players.clear();
        this.obstacles.clear();
        this.bullets.clear();
        this.explosions.clear();
        this.previousBulletPositions.clear();
    }
}
