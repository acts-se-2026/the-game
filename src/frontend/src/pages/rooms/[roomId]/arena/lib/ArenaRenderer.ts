import { Application, Container, Graphics, Text } from "pixi.js";
import { ARENA_SIZE, type ArenaState, type Bullet, type Obstacle, type Player } from "../../../../../game/types";

const PLAYER_RADIUS = 18;
const GRID_SIZE = 30;

export class ArenaRenderer {
    private app: Application;
    private world: Container;
    private players: Map<string, Container> = new Map();
    private obstacles: Map<string, Graphics> = new Map();
    private bullets: Map<string, Graphics> = new Map();

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
    }

    private syncBullets(data: Bullet[]) {
        for (const graphics of this.bullets.values()) {
            graphics.destroy(true);
        }
        this.bullets.clear();

        data.forEach((bullet, idx) => {
            const key = String(idx);
            const graphics = new Graphics();
            this.world.addChild(graphics);
            this.bullets.set(key, graphics);

            graphics.clear()
                .circle(bullet.x, bullet.y, 5).fill({ color: 0xff0000 });
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
    }
}
