import { ARENA_HEIGHT, ARENA_WIDTH, type ArenaState } from "../../game/types";

const GRID_COLUMNS = 16;
const GRID_ROWS = 9;
const CELL_WIDTH = ARENA_WIDTH / GRID_COLUMNS;
const CELL_HEIGHT = ARENA_HEIGHT / GRID_ROWS;
const MIN_OBSTACLES = 20;
const MAX_OBSTACLES = 45;
const MAX_GENERATION_ATTEMPTS = 100;

type GridCell = [column: number, row: number];

function shuffledGrid(random: () => number): GridCell[] {
    const cells = Array.from({ length: GRID_COLUMNS * GRID_ROWS }, (_, index): GridCell => [
        index % GRID_COLUMNS,
        Math.floor(index / GRID_COLUMNS),
    ]);

    for (let index = cells.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(random() * (index + 1));
        [cells[index], cells[swapIndex]] = [cells[swapIndex], cells[index]];
    }

    return cells;
}

function hasConnectedOpenArea(obstacleCells: GridCell[]): boolean {
    const obstacles = new Set(obstacleCells.map(([column, row]) => `${column},${row}`));
    const start = findOpenCell(obstacles);
    if (!start) return false;

    const visited = new Set([`${start[0]},${start[1]}`]);
    const queue = [start];

    for (let index = 0; index < queue.length; index += 1) {
        const [column, row] = queue[index];
        const neighbours: GridCell[] = [
            [column + 1, row],
            [column - 1, row],
            [column, row + 1],
            [column, row - 1],
        ];

        for (const [nextColumn, nextRow] of neighbours) {
            const key = `${nextColumn},${nextRow}`;
            const isInside = nextColumn >= 0 && nextColumn < GRID_COLUMNS && nextRow >= 0 && nextRow < GRID_ROWS;
            if (isInside && !obstacles.has(key) && !visited.has(key)) {
                visited.add(key);
                queue.push([nextColumn, nextRow]);
            }
        }
    }

    return visited.size === GRID_COLUMNS * GRID_ROWS - obstacleCells.length;
}

function findOpenCell(obstacles: Set<string>): GridCell | undefined {
    for (let row = 0; row < GRID_ROWS; row += 1) {
        for (let column = 0; column < GRID_COLUMNS; column += 1) {
            if (!obstacles.has(`${column},${row}`)) return [column, row];
        }
    }
}

function fallbackConnectedMap(obstacleCount: number, random: () => number): GridCell[] {
    const obstaclesPerRow = new Map<number, number>();

    return shuffledGrid(random).filter(([, row]) => {
        if (row % 2 === 0 || (obstaclesPerRow.get(row) ?? 0) >= GRID_COLUMNS - 1) return false;
        obstaclesPerRow.set(row, (obstaclesPerRow.get(row) ?? 0) + 1);
        return true;
    }).slice(0, obstacleCount);
}

function generateObstacleCells(obstacleCount: number, random: () => number): GridCell[] {
    for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
        const cells = shuffledGrid(random).slice(0, obstacleCount);
        if (hasConnectedOpenArea(cells)) return cells;
    }

    return fallbackConnectedMap(obstacleCount, random);
}

export function createLobbyArenaState(random: () => number = Math.random): ArenaState {
    const obstacleCount = MIN_OBSTACLES + Math.floor(random() * (MAX_OBSTACLES - MIN_OBSTACLES + 1));
    const obstacleCells = generateObstacleCells(obstacleCount, random);

    return {
        obstacles: obstacleCells.map(([column, row]) => ({
            x: column * CELL_WIDTH,
            y: row * CELL_HEIGHT,
            size: {
                x: CELL_WIDTH,
                y: CELL_HEIGHT,
            },
        })),
        players: [],
        bullets: [],
        chests: [],
    };
}