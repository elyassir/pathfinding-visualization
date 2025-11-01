// TODO : Adjust the speed of BFS traversal using animation frame rate
// TODO : Draw the shortest path after BFS is complete
// TODO : Add DFS algorithm option using stack !
// TODO : Add A* algorithm option with heuristic 


/** * Light / Dark Theme Toggle
 */


const toggleBtn = document.getElementById("theme-toggle");
const currentTheme = localStorage.getItem("theme");

// Load saved theme if any
if (currentTheme) {
    document.documentElement.setAttribute("data-theme", currentTheme);
    toggleBtn.textContent = currentTheme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
}

// Toggle on click
toggleBtn.addEventListener("click", () => {
    const theme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    toggleBtn.textContent = theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
});

if (!currentTheme) {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.setAttribute("data-theme", "dark");
        toggleBtn.textContent = "☀️ Light Mode";
    }
}

/** * Canvas Setup
 */

var graph = [];
var isRunning = false;

const canvas = document.getElementById("canvas");
const startBtn = document.getElementById("start-btn");
const ctx = canvas.getContext("2d");
const RECT_SIZE = 40; // Size of each rectangle
const LINE_WIDTH = 5; // Line that separates rectangles
canvas.width = 800 - LINE_WIDTH;
canvas.height = 400 - LINE_WIDTH;
var startPos = { x: 0, y: 0 };
var endPos = { x: 12, y: 6 };

ctx.fillStyle = "#fff";
ctx.fillRect(0, 0, canvas.width, canvas.height);
const RECT_COLOR = "#00f";
const WALL_COLOR = "#000000ff";


function drawGrid(x, y, color = RECT_COLOR) {
    ctx.beginPath();
    ctx.rect(RECT_SIZE * x, RECT_SIZE * y, RECT_SIZE - LINE_WIDTH, RECT_SIZE - LINE_WIDTH);
    ctx.fillStyle = color;
    ctx.fill();
}

for (var j = 0; j < canvas.height / RECT_SIZE; j++) {
    var row = [];
    for (var i = 0; i < canvas.width / RECT_SIZE; i++) {
        drawGrid(i, j, RECT_COLOR);
        row.push({ visited: false, wall: false });
    }
    graph.push(row);
}

var isMouseDown = false;
var fillColor = "#000000ff";

window.onmousedown = (e) => {
    if (isRunning) return;
    isMouseDown = true;
    handleClick(e, true);
}
window.onmouseup = (e) => {
    if (isRunning) return;
    isMouseDown = false;
}

window.onmousemove = (e) => {
    if (!isMouseDown || isRunning) return;
    handleClick(e, false);
}

const handleClick = (e, isInitialClick) => {
    const rect = canvas.getBoundingClientRect();
    const rectX = rect.left + window.scrollX; // Add horizontal scroll
    const rectY = rect.top + window.scrollY;  // Add vertical scroll
    // console.log("Canvas position with scroll - X: " + rectX + ", Y: " + rectY);
    const clickX = e.clientX + window.scrollX - rectX;
    const clickY = e.clientY + window.scrollY - rectY;
    // console.log("Click position with scroll - X: " + clickX + ", Y: " + clickY);
    if (clickX >= 0 && clickX <= canvas.width && clickY >= 0 && clickY <= canvas.height) {
        console.log("Clicked inside the canvas");
        // var rectX = (e.x - canvas.offsetLeft);
        // var rectY = (e.y - canvas.offsetTop);
        if (clickX % RECT_SIZE > RECT_SIZE - LINE_WIDTH || clickY % RECT_SIZE > RECT_SIZE - LINE_WIDTH) {
            console.log("Clicked on a line, ignoring.");
            return;
        }
        if (isInitialClick) {
            const pixelData = ctx.getImageData(clickX, clickY, 1, 1).data;
            const pixelColor = `rgba(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]}, ${pixelData[3] / 255})`;
            fillColor = pixelColor != "rgba(0, 0, 0, 1)" ? WALL_COLOR : RECT_COLOR;
            console.log("Selected Fill Color: " + pixelColor);
            // return;
        }
        console.log("Relative Click Position - X: " + clickX + ", Y: " + clickY);
        const gridX = Math.floor(clickX / RECT_SIZE);
        const gridY = Math.floor(clickY / RECT_SIZE);
        console.log("Grid Position - X: " + gridX + ", Y: " + gridY);
        drawGrid(gridX, gridY, fillColor);
        if (fillColor === WALL_COLOR) {
            graph[gridY][gridX].wall = true;
        } else {
            graph[gridY][gridX].wall = false;
        }
    } else {
        console.log("Clicked outside the canvas");
    }
};

drawGrid(startPos.x, startPos.y, "#013601ff");
drawGrid(endPos.x, endPos.y, "#ff0000ff");

let queue = [];
let current = null;
let neighborIndex = 0;
let cameFrom = new Map();

function drawShortestPath(endNode) {
    console.log("Drawing shortest path");
    console.log(endNode);
    console.log(cameFrom);
    const entries = [...cameFrom].reverse();
    for (const [key, value] of entries) {
        const [newX, newY] = key.split(',').map(Number);
        console.log("Looking at node: ", newX, newY);
        console.log("Looking for end node at: ", endNode.x, endNode.y);
        if (endNode.x == newX && newY == endNode.y) {
            console.log("-------------------");
            console.log("Found path node: ", newX, newY);
            const [currentX, currentY] = value.split(',').map(Number);
            endNode = { x: currentX, y: currentY };
            if (currentX === startPos.x && currentY === startPos.y) {
                console.log("Reached start node, stopping path drawing.");
                break;
            }
            drawGrid(currentX, currentY, "#525291ff");
            console.log("Drawing path at: ", currentX, currentY);
            console.log(newX, newY);
            console.log(currentX, currentY);
        }
        console.log("-------------------");
    }
    // while (endNode) {

    // }
}

function BFS() {
    console.log("BFS started");
    queue.push({ x: startPos.x, y: startPos.y });
    graph[startPos.y][startPos.x].visited = true;
    graph[startPos.y][startPos.x].isStart = true;
    graph[endPos.y][endPos.x].isEnd = true;
    cameFrom.set(`${startPos.x},${startPos.y}`, null);

    const directions = [
        { dx: 1, dy: 0 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 0, dy: -1 }
    ];

    function BFSStep() {
        if (!current) {
            current = queue.shift();
            neighborIndex = 0;
            if (!current) {
                clearInterval(intervalId);
                console.log("BFS finished");
                isRunning = false;
                startBtn.disabled = false;
                return;
            }
            if (graph[current.y][current.x].isEnd) {
                clearInterval(intervalId);
                console.log("BFS reached the end position!");
                isRunning = false;
                startBtn.disabled = false;
                drawShortestPath(current);
                return;
            } else {
                if (!graph[current.y][current.x].isStart)
                    drawGrid(current.x, current.y, "#00ff00"); // Green for current node
            }
        }

        if (neighborIndex < directions.length) {
            const dir = directions[neighborIndex++];
            const newX = current.x + dir.dx;
            const newY = current.y + dir.dy;

            if (newX >= 0 && newX < canvas.width / RECT_SIZE &&
                newY >= 0 && newY < canvas.height / RECT_SIZE &&
                !graph[newY][newX].visited &&
                !graph[newY][newX].wall) {

                graph[newY][newX].visited = true;
                queue.push({ x: newX, y: newY });
                if (cameFrom.has(`${newX},${newY}`) === false) {
                    cameFrom.set(`${newX},${newY}`, `${current.x},${current.y}`);
                }
                if (!graph[newY][newX].isEnd)
                    drawGrid(newX, newY, "#ffff00"); // yellow for visited
            }
        } else {
            // finished all neighbors of current node
            current = null;
        }
    }


    const intervalId = setInterval(() => {
        BFSStep()
    }, 10);
}

startBtn.onclick = () => {
    console.log("Start button clicked");
    startBtn.disabled = true;
    isRunning = true;
    BFS();
    console.log(graph);
};
// Implement start functionality here

// function drawPlayerO(x, y) {
//     ctx.beginPath();
//     ctx.arc(x * RECT_SIZE + RECT_SIZE / 2 + 3, y * RECT_SIZE + RECT_SIZE / 2 + 3, 15, 0, Math.PI * 2);
//     ctx.strokeStyle = "#ff0000ff";
//     ctx.lineWidth = 3;
//     ctx.stroke();
// }

// function drawDestination(x, y) {
//     ctx.beginPath();
//     ctx.arc(x, y, 10, 0, Math.PI * 2);
//     ctx.fillStyle = "#00ff00";
//     ctx.fill();
// }

// function drawPlayerX(x, y) {
//     ctx.beginPath();
//     ctx.moveTo(x * RECT_SIZE + 5, y * RECT_SIZE + 5);
//     ctx.lineTo(x * RECT_SIZE + RECT_SIZE, y * RECT_SIZE + RECT_SIZE);
//     ctx.moveTo(x * RECT_SIZE + RECT_SIZE, y * RECT_SIZE + 5);
//     ctx.lineTo(x * RECT_SIZE + 5, y * RECT_SIZE + RECT_SIZE);
//     ctx.strokeStyle = "#ff0000";
//     ctx.lineWidth = 5;
//     ctx.stroke();
// }

// drawPlayerX(2, 5);
// drawPlayerO(5, 5);



// // Draw player X
// ctx.beginPath();
// ctx.moveTo(45, 45);
// ctx.lineTo(80, 80);
// ctx.moveTo(80, 45);
// ctx.lineTo(45, 80);
// ctx.strokeStyle = "#ff0000";
// ctx.lineWidth = 5;
// ctx.stroke();

// drawPlayerO(120, 65);