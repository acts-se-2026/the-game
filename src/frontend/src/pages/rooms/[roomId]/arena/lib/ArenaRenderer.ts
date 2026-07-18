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

export class ArenaRenderer {
    private world: Container;
    private players: Map<string, PlayerView> = new Map();
    private obstacleLayer: Graphics;
    private chestLayer: Graphics;
    private bulletLayer: Graphics;
    private lastState: ArenaState | null = null;
    private lastObstacles: Obstacle[] | null = null;
    private lastChests: Chest[] | null = null;
    private lastLocalPlayerId: string | undefined;

    constructor(app: Application) {
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

    public syncState(state: ArenaState, localPlayerId?: string) {
        if (state === this.lastState && localPlayerId === this.lastLocalPlayerId) return;

        if (state.obstacles !== this.lastObstacles) {
            this.syncObstacles(state.obstacles);
            this.lastObstacles = state.obstacles;
        }
        this.syncPlayers(state.players, localPlayerId);
        this.syncBullets(state.bullets, state.players);
        if (state.chests !== this.lastChests && !this.sameChests(state.chests, this.lastChests)) {
            this.syncChests(state.chests);
        }
        this.lastChests = state.chests;
        this.lastState = state;
        this.lastLocalPlayerId = localPlayerId;
    }

    private syncBullets(bullets: Bullet[], players: Player[]) {
        const playerColors = new Map(players.map((player) => [player.id, player.color]));
        this.bulletLayer.clear();

        for (const bullet of bullets) {
            this.bulletLayer
                .circle(bullet.x, bullet.y, 5)
                .fill({ color: playerColors.get(bullet.ownerId) ?? 0xff0000 });
        }
    }

    private syncChests(data: Chest[]) {
        this.chestLayer.clear();
        for (const chest of data) {
            this.chestLayer
                .rect(chest.x, chest.y, chest.size.x, chest.size.y)
                .fill({ color: 0x19bf45 });
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

    private syncPlayers(data: Player[], localPlayerId?: string) {
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

            const isLocal = localPlayerId === undefined ? player.isLocal === true : player.id === localPlayerId;
            const appearanceKey = `${player.color}:${isLocal}`;
            if (view.appearanceKey !== appearanceKey) {
                view.body.clear()
                    .circle(0, 0, PLAYER_RADIUS + (isLocal ? 5 : 3)).fill({
                        color: isLocal ? 0x60a5fa : 0xffffff,
                        alpha: isLocal ? 0.22 : 0.1,
                    })
                    .circle(0, 0, PLAYER_RADIUS).fill({ color: player.color }).stroke({ color: 0xf8fafc, width: 2 });
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
                && chest.size.y === oldChest.size.y;
        });
    }

    public destroy() {
        this.players.clear();
        this.lastState = null;
        this.lastObstacles = null;
        this.lastChests = null;
        this.lastLocalPlayerId = undefined;
    }
}