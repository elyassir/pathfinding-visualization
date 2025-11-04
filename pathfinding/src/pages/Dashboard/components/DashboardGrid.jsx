import React, { useContext, useEffect, useRef, useState } from "react";
import { ThemeProvider, useTheme } from "../../../themes/ThemeContext";

const exampleCells = [
    { type: 'start', col: 5, row: 13 },
    { type: 'end', col: 45, row: 13 },
    ...Array.from({ length: 19 }, (_, i) => ({ type: 'path', col: i + 9, row: 5 })),
    ...Array.from({ length: 15 }, (_, i) => ({ type: 'wall', col: 10, row: i + 5 })),
    ...Array.from({ length: 15 }, (_, i) => ({ type: 'wall', col: 25, row: i + 5 })),
    ...Array.from({ length: 15 }, (_, i) => ({ type: 'wall', col: i + 10, row: 19 })),
    // ...Array.from({ length: 8 }, (_, i) => ({ type: 'visited', col: 11 + i, row: 13 })),
    // ...Array.from({ length: 8 }, (_, i) => ({ type: 'visited', col: 11, row: 13 - i })),
    // ...Array.from({ length: 13 }, (_, i) => ({ type: 'visited', col: 11 + i, row: 6 })),
    // ...Array.from({ length: 13 }, (_, i) => ({ type: 'visited', col: 24 - i, row: 18 })),
    // ...Array.from({ length: 13 }, (_, i) => ({ type: 'visited', col: 24, row: 18 - i })),
    ...Array.from({ length: 4 }, (_, i) => ({ type: 'path', col: 5 + i, row: 13 })),
    ...Array.from({ length: 8 }, (_, i) => ({ type: 'path', col: 9, row: 13 - i })),
    // ...Array.from({ length: 18 }, (_, i) => ({ type: 'path', col: 9 + i, row: 6 })),
    ...Array.from({ length: 8 }, (_, i) => ({ type: 'path', col: 27, row: 6 + i })),
    ...Array.from({ length: 18 }, (_, i) => ({ type: 'path', col: 27 + i, row: 13 })),
    // ...Array.from({ length: 6 }, (_, i) => ({ type: 'path', col: 45, row: 19 - i })),
];

const CANVAS_CONFIG = {
    rectSize: 30,
    cols: 50,
    rows: 28,
};

const COLORS = {
    light: {
        empty: '#fafafa',
        gridLine: '#e5e7eb',
        start: '#22c55e',      // bright green
        end: '#dc2626',        // deep red
        wall: '#374151',       // charcoal
        visited: '#1d4ed8',    // sky blue
        path: '#facc15'        // yellow
    },
    dark: {
        empty: '#111113',      // almost black
        gridLine: '#27272a',
        start: '#4ade80',      // neon green
        end: '#ff6b6b',        // coral red
        wall: '#a1a1aa',       // zinc gray
        visited: '#1d4ed8',    // royal blue
        path: '#fde047'        // bright yellow
    }
};

const getCellColorBasedOnType = (type, theme) => {
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
            return theme.empty;
    }
}

const DashboardGrid = ({ selectedTool }) => {
    const canvasRef = useRef(null);
    const { theme, toggleTheme } = useTheme();
    const [isDark, setIsDark] = useState(false);
    const [showStroke, setShowStroke] = useState(true);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [ctx, setCtx] = useState(null);

    const drawGrid = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = CANVAS_CONFIG.rectSize * CANVAS_CONFIG.cols;
        canvas.height = CANVAS_CONFIG.rectSize * CANVAS_CONFIG.rows;

        const ctx = canvas.getContext('2d');
        const theme = isDark ? COLORS.dark : COLORS.light;

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw grid cells
        for (let row = 0; row < CANVAS_CONFIG.rows; row++) {
            for (let col = 0; col < CANVAS_CONFIG.cols; col++) {
                const cell = exampleCells.find(c => c.row === row && c.col === col);

                // Determine cell color based on type
                let fillColor = getCellColorBasedOnType(cell ? cell.type : 'empty', theme);

                // Draw cell
                drawOneCellOnContext(col, row, fillColor);
            }
        }
    };

    const handleMouseDown = (e) => {
        if (isRunning) return;
        setIsMouseDown(true);
        handleClick(e, true);
    };

    const handleMouseUp = (e) => {
        if (isRunning) return;
        setIsMouseDown(false);
    };

    const handleMouseMove = (e) => {
        if (!isMouseDown || isRunning) return;
        handleClick(e, false);
    };

    const drawOneCell = (col, row) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const theme = isDark ? COLORS.dark : COLORS.light;

        const color = getCellColorBasedOnType(selectedTool, theme);
        drawOneCellOnContext(col, row, color);
    };

    const drawOneCellOnContext = (col, row, color) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = color;
        ctx.fillRect(
            col * CANVAS_CONFIG.rectSize,
            row * CANVAS_CONFIG.rectSize,
            CANVAS_CONFIG.rectSize,
            CANVAS_CONFIG.rectSize
        );

        if (showStroke) {
            const theme = isDark ? COLORS.dark : COLORS.light;
            ctx.strokeStyle = theme.gridLine;
            ctx.lineWidth = 0.5;
            ctx.strokeRect(
                col * CANVAS_CONFIG.rectSize,
                row * CANVAS_CONFIG.rectSize,
                CANVAS_CONFIG.rectSize,
                CANVAS_CONFIG.rectSize
            );
        }
    }

    const handleClick = (e, isInitialClick) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const col = Math.floor(x / CANVAS_CONFIG.rectSize);
        const row = Math.floor(y / CANVAS_CONFIG.rectSize);

        console.log(`Clicked on cell: (${col}, ${row}), initialClick: ${isInitialClick}`);
        // Here you can add logic to modify the exampleCells or handle interactions
        drawOneCell(col, row);
    }

    // Detect theme changes
    useEffect(() => {
        setIsDark(theme === 'dark');
    }, [theme]);

    // Redraw when theme changes
    useEffect(() => {
        drawGrid();
    }, [isDark]);

    useEffect(() => {
        // const handleResize = () => {
        drawGrid();
        // };
        // window.addEventListener('resize', handleResize);
        return () => {
            // window.removeEventListener('resize', handleResize);
        };
    }, [exampleCells]);

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background-light dark:bg-background-dark overflow-auto">

            <canvas
                className={showStroke ? 'border-0 border-gray-400 dark:border-gray-600' : ''}
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