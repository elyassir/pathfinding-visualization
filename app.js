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

drawGrid(0, 0, "#ff0000");
drawGrid(12, 0, "#00ff00");

let queue = [];
let current = null;
let neighborIndex = 0;

function BFS() {
    console.log("BFS started");
    queue.push({ x: 0, y: 0 });
    graph[0][0].visited = true;

    const directions = [
        { dx: 1, dy: 0 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 0, dy: -1 }
    ];

    function BFSStep(initial) {
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
            if (!initial) {
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
                drawGrid(newX, newY, "#ffff00"); // yellow for visited
            }
        } else {
            // finished all neighbors of current node
            current = null;
        }
    }

    BFSStep(true);

    const intervalId = setInterval(() => {
        BFSStep(false);
    }, 100);
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