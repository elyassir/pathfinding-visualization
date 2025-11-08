import React, { use, useContext, useEffect, useRef, useState } from "react";
import { ThemeProvider, useTheme } from "../../../themes/ThemeContext";

const COLORS_SET = {
    light: {
        background: '#fafafa',
        rect: '#e5e7eb',
        start: '#22c55e',      // bright green
        end: '#dc2626',        // deep red
        wall: '#374151',       // charcoal
        visited: '#1d4ed8',    // sky blue
        path: '#facc15'        // yellow
    },
    dark: {
        background: '#111113',      // almost black
        rect: '#27272a',
        start: '#4ade80',      // neon green
        end: '#ff6b6b',        // coral red
        wall: '#a1a1aa',       // zinc gray
        visited: '#1d4ed8',    // royal blue
        path: '#fde047'        // bright yellow
    }
};

const CANVAS_CONFIG = {
    width: 1500,
    height: 800,
    rectSize: 30,
    lineWidth: 5
};

const DIRECTIONS = [
    { dx: 1, dy: 0 },
    { dx: 0, dy: -1 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 1 },
];

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

const DashboardGrid = ({ speed, selectedTool, setSelectedTool, selectedAlgorithm, isRunning, setIsRunning }) => {
    const canvasRef = useRef(null);
    const { theme } = useTheme();
    const COLORS = theme === 'dark' ? COLORS_SET.dark : COLORS_SET.light;
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [selectedToolLocal, setSelectedToolLocal] = useState('wall');

    const cols = Math.floor(CANVAS_CONFIG.width / CANVAS_CONFIG.rectSize);
    const rows = Math.floor(CANVAS_CONFIG.height / CANVAS_CONFIG.rectSize);

    const [graph, setGraph] = useState(() => {
        const initial = [];
        for (let j = 0; j < rows; j++) {
            const row = [];
            for (let i = 0; i < cols; i++) {
                row.push({ visited: false, wall: false });
            }
            initial.push(row);
        }
        return initial;
    });

    const [startPos, setStartPos] = useState({ x: 4, y: 4 });
    const [endPos, setEndPos] = useState({ x: 16, y: 4 });

    const intervalRef = useRef(null);
    const algoStateRef = useRef({});

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = CANVAS_CONFIG.width - CANVAS_CONFIG.lineWidth;
        canvas.height = CANVAS_CONFIG.height - CANVAS_CONFIG.lineWidth;

        drawBoard(ctx);
    }, [graph, theme, startPos, endPos]);

    const drawGrid = (ctx, x, y, color, skipStartEnd = false) => {
        ctx.beginPath();
        ctx.rect(
            CANVAS_CONFIG.rectSize * x,
            CANVAS_CONFIG.rectSize * y,
            CANVAS_CONFIG.rectSize - CANVAS_CONFIG.lineWidth,
            CANVAS_CONFIG.rectSize - CANVAS_CONFIG.lineWidth
        );
        ctx.fillStyle = color;
        ctx.fill();
    };

    const drawBoard = (ctx) => {
        ctx.fillStyle = COLORS.background;
        ctx.fillRect(0, 0, CANVAS_CONFIG.width, CANVAS_CONFIG.height);

        for (let j = 0; j < rows; j++) {
            for (let i = 0; i < cols; i++) {
                let color = getColorAt(i, j);
                drawGrid(ctx, i, j, color);
            }
        }
    };

    const getColorAt = (x, y) => {
        if (x === startPos.x && y === startPos.y) return COLORS.start;
        if (x === endPos.x && y === endPos.y) return COLORS.end;
        if (graph[y][x].visited) return COLORS.visited;
        if (graph[y][x].wall) return COLORS.wall;
        return COLORS.rect;
    };

    const handleMouseDown = (e) => {
        if (isRunning) return;
        setIsMouseDown(true);
        handleClick(e, true);
    };

    const handleMouseUp = () => {
        if (isRunning) return;
        setIsMouseDown(false);
        setSelectedToolLocal('wall');
    };

    const handleMouseMove = (e) => {
        if (!isMouseDown || isRunning) return;
        handleClick(e, false);
    };

    const handleClick = (e, initialClick) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        if (clickX < 0 || clickX > CANVAS_CONFIG.width || clickY < 0 || clickY > CANVAS_CONFIG.height) return;

        const gridX = Math.floor(clickX / CANVAS_CONFIG.rectSize);
        const gridY = Math.floor(clickY / CANVAS_CONFIG.rectSize);

        if (gridX < 0 || gridX >= cols || gridY < 0 || gridY >= rows) return;

        if (initialClick) {
            if (gridX === startPos.x && gridY === startPos.y) {
                setStartPos({ x: gridX, y: gridY });
                setSelectedToolLocal('start');
                return;
            }

            if (gridX === endPos.x && gridY === endPos.y) {
                setEndPos({ x: gridX, y: gridY });
                setSelectedToolLocal('end');
                return;
            }

            const cell = graph[gridY][gridX];

            if (cell.wall) {
                setSelectedToolLocal('empty');
            } else {
                setSelectedToolLocal('wall');
            }
        }

        if (selectedTool === 'auto') {
            toggleWallLocal(gridX, gridY);
            return;
        }
        toggleWall(gridX, gridY);
    };

    const toggleWall = (x, y) => {
        // if ((x === startPos.x && y === startPos.y) || (x === endPos.x && y === endPos.y)) return;

        if (selectedTool === 'start') {
            setStartPos({ x, y });
        }

        if (selectedTool === 'end') {
            setEndPos({ x, y });
        }

        if (selectedTool === 'wall' || selectedTool === 'empty') {
            setGraph(prev => {
                const newGraph = prev.map(row => row.map(cell => ({ ...cell })));
                newGraph[y][x].wall = selectedTool === 'wall'
                return newGraph;
            });
        }
    };
    const toggleWallLocal = (x, y) => {
        // if ((x === startPos.x && y === startPos.y) || (x === endPos.x && y === endPos.y)) return;

        if (selectedToolLocal === 'start') {
            setStartPos({ x, y });
        }

        if (selectedToolLocal === 'end') {
            setEndPos({ x, y });
        }

        if (selectedToolLocal === 'wall' || selectedToolLocal === 'empty') {
            setGraph(prev => {
                const newGraph = prev.map(row => row.map(cell => ({ ...cell })));
                newGraph[y][x].wall = selectedToolLocal === 'wall'
                return newGraph;
            });
        }
    };

    const resetGrid = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        // setGraph(prev => prev.map(row => row.map(cell => ({ ...cell, visited: false }))));
        algoStateRef.current = {};
        drawBoard(canvasRef.current.getContext('2d'));
    };

    const startAlgorithm = () => {
        resetGrid();

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        console.log('Starting algorithm:', selectedAlgorithm);

        switch (selectedAlgorithm) {
            case 'bfs':
                runBFS(ctx);
                break;
            case 'dfs':
                runDFS(ctx);
                break;
            case 'astar':
                runAStar(ctx);
                break;
            case 'greedy':
                runGreedy(ctx);
                break;
            default:
                runBFS(ctx);
        }
    };

    useEffect(() => {
        if (isRunning) {
            startAlgorithm();
        }
    }, [isRunning]);

    // BFS Implementation
    const runBFS = async (ctx) => {
        const queue = [{ x: startPos.x, y: startPos.y }];
        const cameFrom = new Map();
        const visited = new Set();

        visited.add(`${startPos.x},${startPos.y}`);
        cameFrom.set(`${startPos.x},${startPos.y}`, null);

        while (queue.length > 0) {
            const current = queue.shift();

            if (current.x === endPos.x && current.y === endPos.y) {
                finishAlgorithm(ctx, cameFrom, current);
                return;
            }

            if (!(current.x === startPos.x && current.y === startPos.y)) {
                drawGrid(ctx, current.x, current.y, COLORS.current);
            }

            for (const dir of DIRECTIONS) {
                const newX = current.x + dir.dx;
                const newY = current.y + dir.dy;
                const key = `${newX},${newY}`;

                if (newX >= 0 && newX < cols && newY >= 0 && newY < rows &&
                    !visited.has(key) && !graph[newY][newX].wall) {

                    visited.add(key);
                    queue.push({ x: newX, y: newY });
                    cameFrom.set(key, `${current.x},${current.y}`);

                    if (!(newX === endPos.x && newY === endPos.y)) {
                        drawGrid(ctx, newX, newY, COLORS.visited);
                    }
                }
            }
            await sleep(speed);
        }
    };

    // DFS Implementation
    const runDFS = async (ctx) => {
        const stack = [{ x: startPos.x, y: startPos.y }];
        const cameFrom = new Map();
        const visited = new Set();

        visited.add(`${startPos.x},${startPos.y}`);
        cameFrom.set(`${startPos.x},${startPos.y}`, null);

        while (stack.length > 0) {

            const current = stack.pop();

            if (current.x === endPos.x && current.y === endPos.y) {
                finishAlgorithm(ctx, cameFrom, current);
                return;
            }

            if (!(current.x === startPos.x && current.y === startPos.y)) {
                drawGrid(ctx, current.x, current.y, COLORS.current);
            }

            for (const dir of DIRECTIONS) {
                const newX = current.x + dir.dx;
                const newY = current.y + dir.dy;
                const key = `${newX},${newY}`;

                if (newX >= 0 && newX < cols && newY >= 0 && newY < rows &&
                    !visited.has(key) && !graph[newY][newX].wall) {

                    visited.add(key);
                    stack.push({ x: newX, y: newY });
                    cameFrom.set(key, `${current.x},${current.y}`);

                    if (!(newX === endPos.x && newY === endPos.y)) {
                        drawGrid(ctx, newX, newY, COLORS.visited);
                    }
                }
            }
            await sleep(speed);
        }
    };

    // A* Implementation
    const runAStar = async (ctx) => {
        const openList = [{ x: startPos.x, y: startPos.y, f: 0 }];
        const closedSet = new Set();
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();

        const heuristic = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

        gScore.set(`${startPos.x},${startPos.y}`, 0);
        fScore.set(`${startPos.x},${startPos.y}`, heuristic(startPos, endPos));

        while (openList.length > 0) {


            openList.sort((a, b) => a.f - b.f);
            const current = openList.shift();
            const currentKey = `${current.x},${current.y}`;

            if (current.x === endPos.x && current.y === endPos.y) {
                finishAlgorithm(ctx, cameFrom, current);
                return;
            }

            closedSet.add(currentKey);

            if (!(current.x === startPos.x && current.y === startPos.y)) {
                drawGrid(ctx, current.x, current.y, COLORS.current);
            }

            for (const dir of DIRECTIONS) {
                const newX = current.x + dir.dx;
                const newY = current.y + dir.dy;
                const neighborKey = `${newX},${newY}`;

                if (newX < 0 || newX >= cols || newY < 0 || newY >= rows) continue;
                if (graph[newY][newX].wall || closedSet.has(neighborKey)) continue;

                const tentativeG = (gScore.get(currentKey) ?? Infinity) + 1;

                if (tentativeG < (gScore.get(neighborKey) ?? Infinity)) {
                    cameFrom.set(neighborKey, currentKey);
                    gScore.set(neighborKey, tentativeG);
                    const f = tentativeG + heuristic({ x: newX, y: newY }, endPos);
                    fScore.set(neighborKey, f);

                    const existing = openList.find(n => n.x === newX && n.y === newY);
                    if (existing) {
                        existing.f = f;
                    } else {
                        openList.push({ x: newX, y: newY, f });
                        if (!(newX === endPos.x && newY === endPos.y)) {
                            drawGrid(ctx, newX, newY, COLORS.visited);
                        }
                    }
                }
            }
            await sleep(speed);
        }
    };

    // Greedy Best-First Search Implementation
    const runGreedy = async (ctx) => {
        const openList = [{ x: startPos.x, y: startPos.y, h: 0 }];
        const closedSet = new Set();
        const cameFrom = new Map();

        const heuristic = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
        while (openList.length > 0) {

            openList.sort((a, b) => a.h - b.h);
            const current = openList.shift();
            const currentKey = `${current.x},${current.y}`;

            if (current.x === endPos.x && current.y === endPos.y) {
                finishAlgorithm(ctx, cameFrom, current);
                return;
            }

            closedSet.add(currentKey);

            if (!(current.x === startPos.x && current.y === startPos.y)) {
                drawGrid(ctx, current.x, current.y, COLORS.current);
            }

            for (const dir of DIRECTIONS) {
                const newX = current.x + dir.dx;
                const newY = current.y + dir.dy;
                const neighborKey = `${newX},${newY}`;

                if (newX < 0 || newX >= cols || newY < 0 || newY >= rows) continue;
                if (graph[newY][newX].wall || closedSet.has(neighborKey)) continue;

                if (!openList.find(n => n.x === newX && n.y === newY)) {
                    cameFrom.set(neighborKey, currentKey);
                    const h = heuristic({ x: newX, y: newY }, endPos);
                    openList.push({ x: newX, y: newY, h });

                    if (!(newX === endPos.x && newY === endPos.y)) {
                        drawGrid(ctx, newX, newY, COLORS.visited);
                    }
                }
            }
            await sleep(speed);
        }
    };

    const finishAlgorithm = (ctx, cameFrom, endNode) => {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsRunning(false);

        if (endNode) {
            drawShortestPath(ctx, cameFrom, endNode);
        }
    };

    const drawShortestPath = (ctx, cameFrom, endNode) => {
        let current = `${endNode.x},${endNode.y}`;
        const path = [];

        while (cameFrom.has(current) && cameFrom.get(current) !== null) {
            const [x, y] = current.split(',').map(Number);
            if (!(x === startPos.x && y === startPos.y) && !(x === endPos.x && y === endPos.y)) {
                path.push({ x, y });
            }
            current = cameFrom.get(current);
        }

        for (const node of path) {
            drawGrid(ctx, node.x, node.y, COLORS.path);
        }
    };
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background-light dark:bg-background-dark overflow-auto">
            <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
            >
                Your browser does not support the HTML5 canvas tag.
            </canvas>

        </div>
    );
};

export default DashboardGrid;