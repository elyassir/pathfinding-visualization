import React, { use, useContext, useEffect, useRef, useState } from "react";
import { ThemeProvider, useTheme } from "../../../themes/ThemeContext";

// const exampleCells = [
//     { type: 'start', col: 5, row: 13 },
//     { type: 'end', col: 45, row: 13 },
//     ...Array.from({ length: 15 }, (_, i) => ({ type: 'wall', col: 10, row: i + 5 })),
//     ...Array.from({ length: 15 }, (_, i) => ({ type: 'wall', col: 25, row: i + 5 })),
// ];

// const CANVAS_CONFIG = {
//     rectSize: 30,
//     width: 1500,
//     height: 800,
//     cols: Math.floor(1500 / 30),
//     rows: Math.floor(800 / 30),
// };

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

// const COLORS = {
//   background: '#fff',
//   rect: '#00f',
//   wall: '#000000ff',
//   start: '#013601ff',
//   end: '#ff0000ff',
//   current: '#00ff00',
//   visited: '#ffff00',
//   path: '#525291ff'
// };

const DIRECTIONS = [
    { dx: 1, dy: 0 },
    { dx: 0, dy: -1 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 1 },
];




const getCellColorBasedOnType = (type, theme) => {
    console.log('Getting color for type:', type);
    switch (type) {
        case 'start':

            return theme.start;
        case 'end':
            return theme.end;
        case 'wall':
            return theme.wall;
        case 'visited':
            return theme.visited;
        case 'path':
            return theme.path;
        case 'empty':
        default:
            console.log('Returning empty color for type:', type);
            return theme.empty;
    }

}

const DashboardGrid = ({ selectedTool, selectedAlgorithm, isRunning, setIsRunning }) => {
    // const canvasRef = useRef(null);
    // const { theme } = useTheme();
    // const [isDark, setIsDark] = useState(false);
    // const [showStroke, setShowStroke] = useState(true);
    // const [isMouseDown, setIsMouseDown] = useState(false);
    // const [isRunning, setIsRunning] = useState(false);
    // const [ctx, setCtx] = useState(null);
    // const [selectedAlgorithm, setSelectedAlgorithm] = useState('bfs');
    // const [graph, setGraph] = useState(() => {
    //     const initial = [];
    //     for (let j = 0; j < CANVAS_CONFIG.rows; j++) {
    //         const row = [];
    //         for (let i = 0; i < CANVAS_CONFIG.cols; i++) {
    //             row.push({ visited: false, wall: false });
    //         }
    //         initial.push(row);
    //     }
    //     return initial;
    // });
    // const intervalRef = useRef(null);
    // const algoStateRef = useRef({});

    // // Initialize canvas
    // useEffect(() => {
    //     const canvas = canvasRef.current;
    //     if (!canvas) return;

    //     const ctx = canvas.getContext('2d');
    //     canvas.width = CANVAS_CONFIG.width - CANVAS_CONFIG.lineWidth;
    //     canvas.height = CANVAS_CONFIG.height - CANVAS_CONFIG.lineWidth;

    //     drawBoard(ctx);
    // }, [graph]);

    // const drawGrid = (ctx, x, y, color, skipStartEnd = false) => {
    //     if (!skipStartEnd) {
    //         if (x === startPos.x && y === startPos.y) return;
    //         if (x === endPos.x && y === endPos.y) return;
    //     }

    //     ctx.beginPath();
    //     ctx.rect(
    //         CANVAS_CONFIG.rectSize * x,
    //         CANVAS_CONFIG.rectSize * y,
    //         CANVAS_CONFIG.rectSize - CANVAS_CONFIG.lineWidth,
    //         CANVAS_CONFIG.rectSize - CANVAS_CONFIG.lineWidth
    //     );
    //     ctx.fillStyle = color;
    //     ctx.fill();
    // };

    // const [startPos] = useState({ x: 4, y: 4 });
    // const [endPos] = useState({ x: 16, y: 4 });
    // const drawBoard = (ctx) => {
    //     ctx.fillStyle = COLORS.background;
    //     ctx.fillRect(0, 0, CANVAS_CONFIG.width, CANVAS_CONFIG.height);

    //     for (let j = 0; j < CANVAS_CONFIG.rows; j++) {
    //         for (let i = 0; i < CANVAS_CONFIG.cols; i++) {
    //             let color = getColorAt(i, j);
    //             drawGrid(ctx, i, j, color);
    //         }
    //     }

    //     drawGrid(ctx, startPos.x, startPos.y, COLORS.start, true);
    //     drawGrid(ctx, endPos.x, endPos.y, COLORS.end, true);
    // };

    // const getColorAt = (x, y) => {
    //     if (x === startPos.x && y === startPos.y) return COLORS.start;
    //     if (x === endPos.x && y === endPos.y) return COLORS.end;
    //     if (graph[y][x].wall) return COLORS.wall;
    //     return COLORS.rect;
    // };

    // const handleMouseDown = (e) => {
    //     if (isRunning) return;
    //     setIsMouseDown(true);
    //     handleClick(e, true);
    // };

    // const handleMouseUp = () => {
    //     if (isRunning) return;
    //     setIsMouseDown(false);
    // };

    // const handleMouseMove = (e) => {
    //     if (!isMouseDown || isRunning) return;
    //     handleClick(e, false);
    // };

    // const drawOneCell = (col, row) => {
    //     const canvas = canvasRef.current;
    //     if (!canvas) return;

    //     const theme = isDark ? COLORS.dark : COLORS.light;

    //     const color = getCellColorBasedOnType(selectedTool, theme);
    //     drawOneCellOnContext(col, row, color);
    // };

    // const drawOneCellOnContext = (col, row, color) => {
    //     const canvas = canvasRef.current;
    //     if (!canvas) return;
    //     const ctx = canvas.getContext('2d');

    //     ctx.fillStyle = color;
    //     ctx.fillRect(
    //         col * CANVAS_CONFIG.rectSize,
    //         row * CANVAS_CONFIG.rectSize,
    //         CANVAS_CONFIG.rectSize,
    //         CANVAS_CONFIG.rectSize
    //     );

    //     if (showStroke) {
    //         const theme = isDark ? COLORS.dark : COLORS.light;
    //         ctx.strokeStyle = theme.gridLine;
    //         ctx.lineWidth = 0.5;
    //         ctx.strokeRect(
    //             col * CANVAS_CONFIG.rectSize,
    //             row * CANVAS_CONFIG.rectSize,
    //             CANVAS_CONFIG.rectSize,
    //             CANVAS_CONFIG.rectSize
    //         );
    //     }
    // }

    // const handleClick = (e, isInitialClick) => {
    //     const canvas = canvasRef.current;
    //     if (!canvas) return;

    //     const rect = canvas.getBoundingClientRect();
    //     const x = e.clientX - rect.left;
    //     const y = e.clientY - rect.top;

    //     const col = Math.floor(x / CANVAS_CONFIG.rectSize);
    //     const row = Math.floor(y / CANVAS_CONFIG.rectSize);

    //     console.log(`Clicked on cell: (${col}, ${row}), initialClick: ${isInitialClick}`);
    //     // Here you can add logic to modify the exampleCells or handle interactions
    //     drawOneCell(col, row);
    // }

    // // Detect theme changes
    // useEffect(() => {
    //     setIsDark(theme === 'dark');
    // }, [theme]);

    // // Redraw when theme changes
    // useEffect(() => {
    //     drawGrid();
    // }, [isDark]);

    // useEffect(() => {
    //     // const handleResize = () => {
    //     drawGrid();
    //     // };
    //     // window.addEventListener('resize', handleResize);
    //     return () => {
    //         // window.removeEventListener('resize', handleResize);
    //     };
    // }, [exampleCells]);

    const canvasRef = useRef(null);
    const { theme } = useTheme();
    const COLORS = theme === 'dark' ? COLORS_SET.dark : COLORS_SET.light;
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [fillColor, setFillColor] = useState(COLORS.wall);

    const cols = Math.floor(CANVAS_CONFIG.width / CANVAS_CONFIG.rectSize);
    const rows = Math.floor(CANVAS_CONFIG.height / CANVAS_CONFIG.rectSize);

    useEffect(() => {
        setFillColor(getCellColorBasedOnType(selectedTool, COLORS));
    }, [selectedTool]);

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
        // if (!skipStartEnd) {
        //     if (x === startPos.x && y === startPos.y) return;
        //     if (x === endPos.x && y === endPos.y) return;
        // }

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

        drawGrid(ctx, startPos.x, startPos.y, COLORS.start, true);
        drawGrid(ctx, endPos.x, endPos.y, COLORS.end, true);
    };

    const getColorAt = (x, y) => {
        if (x === startPos.x && y === startPos.y) return COLORS.start;
        if (x === endPos.x && y === endPos.y) return COLORS.end;
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

    // const resetGrid = () => {
    //     if (intervalRef.current) {
    //         clearInterval(intervalRef.current);
    //         intervalRef.current = null;
    //     }

    //     setGraph(prev => prev.map(row => row.map(cell => ({ ...cell, visited: false }))));
    //     setIsRunning(false);
    //     algoStateRef.current = {};
    // };

    const startAlgorithm = () => {
        // resetGrid();
        // setIsRunning(true);

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
    const runBFS = (ctx) => {
        const queue = [{ x: startPos.x, y: startPos.y }];
        const cameFrom = new Map();
        const visited = new Set();

        visited.add(`${startPos.x},${startPos.y}`);
        cameFrom.set(`${startPos.x},${startPos.y}`, null);

        intervalRef.current = setInterval(() => {
            if (queue.length === 0) {
                finishAlgorithm(ctx, cameFrom, null);
                return;
            }

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
        }, 50);
    };

    // DFS Implementation
    const runDFS = (ctx) => {
        const stack = [{ x: startPos.x, y: startPos.y }];
        const cameFrom = new Map();
        const visited = new Set();

        visited.add(`${startPos.x},${startPos.y}`);
        cameFrom.set(`${startPos.x},${startPos.y}`, null);

        intervalRef.current = setInterval(() => {
            if (stack.length === 0) {
                finishAlgorithm(ctx, cameFrom, null);
                return;
            }

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
        }, 50);
    };

    // A* Implementation
    const runAStar = (ctx) => {
        const openList = [{ x: startPos.x, y: startPos.y, f: 0 }];
        const closedSet = new Set();
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();

        const heuristic = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

        gScore.set(`${startPos.x},${startPos.y}`, 0);
        fScore.set(`${startPos.x},${startPos.y}`, heuristic(startPos, endPos));

        intervalRef.current = setInterval(() => {
            if (openList.length === 0) {
                finishAlgorithm(ctx, cameFrom, null);
                return;
            }

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
        }, 50);
    };

    // Greedy Best-First Search Implementation
    const runGreedy = (ctx) => {
        const openList = [{ x: startPos.x, y: startPos.y, h: 0 }];
        const closedSet = new Set();
        const cameFrom = new Map();

        const heuristic = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

        intervalRef.current = setInterval(() => {
            if (openList.length === 0) {
                finishAlgorithm(ctx, cameFrom, null);
                return;
            }

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
        }, 50);
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