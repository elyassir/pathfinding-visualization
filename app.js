// ============================================================================
// CONSTANTS
// ============================================================================

const CANVAS_CONFIG = {
  width: 800,
  height: 400,
  rectSize: 40,
  lineWidth: 5
};

const COLORS = {
  background: '#fff',
  rect: '#00f',
  wall: '#000000ff',
  start: '#013601ff',
  end: '#ff0000ff',
  current: '#00ff00',
  visited: '#ffff00',
  path: '#525291ff'
};

const DIRECTIONS = [
  { dx: 1, dy: 0 },   // right
  { dx: 0, dy: -1 },   // up
  { dx: -1, dy: 0 },  // left
  { dx: 0, dy: 1 },   // down
];

const state = {
  graph: [],
  cols: 0,
  rows: 0,
  isRunning: false,
  isMouseDown: false,
  fillColor: COLORS.wall,
  startPos: { x: 4, y: 4 },
  endPos: { x: 16, y: 4 },
  queue: [],
  current: null,
  neighborIndex: 0,
  cameFrom: new Map(),
  intervalId: null,
  currentTheme: 'light'
};

// ============================================================================
// THEME MANAGEMENT
// ============================================================================

const ThemeManager = {
  init() {
    const toggleBtn = document.getElementById('theme-toggle');

    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.setTheme('dark');
    }

    toggleBtn.addEventListener('click', () => this.toggle());
  },

  toggle() {
    const newTheme = state.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  },

  setTheme(theme) {
    state.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    const toggleBtn = document.getElementById('theme-toggle');
    toggleBtn.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
  }
};

// ============================================================================
// UI CONTROLS
// ============================================================================

const UIControls = {
  startBtn: null,

  init() {
    this.startBtn = document.getElementById('start-btn');
    this.startBtn.addEventListener('click', () => this.handleStart());
  },

  handleStart() {
    console.log('Start button clicked');
    this.startBtn.disabled = true;
    state.isRunning = true;
    GridManager.reset();
    // PathfindingAlgorithms.BFS();
    AStarAlgorithm.init();
    AStarAlgorithm.loop();

  }
};


// ============================================================================
// CANVAS MANAGEMENT
// ============================================================================

const CanvasManagement = {
  canvas: null,
  ctx: null,

  init() {
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = CANVAS_CONFIG.width - CANVAS_CONFIG.lineWidth;
    this.canvas.height = CANVAS_CONFIG.height - CANVAS_CONFIG.lineWidth;
    this.initGraph();
    this.clearCanvas();
  },

  initGraph() {
    const cols = Math.floor(CANVAS_CONFIG.width / CANVAS_CONFIG.rectSize);
    const rows = Math.floor(CANVAS_CONFIG.height / CANVAS_CONFIG.rectSize);

    state.cols = cols;
    state.rows = rows;
    state.graph = [];

    for (let j = 0; j < rows; j++) {
      const row = [];
      for (let i = 0; i < cols; i++) {
        row.push({ visited: false, wall: false });
      }
      state.graph.push(row);
    }

    state.graph[state.startPos.y][state.startPos.x].isStart = true;
    state.graph[state.endPos.y][state.endPos.x].isEnd = true;
  },

  clearCanvas() {
    this.ctx.fillStyle = COLORS.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  },

  drawGrid(x, y, color = COLORS.rect, skipStartEnd = false) {
    if (!skipStartEnd) {
      if (x === state.startPos.x && y === state.startPos.y) {
        return; // Start position is drawn last
      } else if (x === state.endPos.x && y === state.endPos.y) {
        return; // End position is drawn last
      }
    }
    this.ctx.beginPath();
    this.ctx.rect(
      CANVAS_CONFIG.rectSize * x,
      CANVAS_CONFIG.rectSize * y,
      CANVAS_CONFIG.rectSize - CANVAS_CONFIG.lineWidth,
      CANVAS_CONFIG.rectSize - CANVAS_CONFIG.lineWidth
    );
    this.ctx.fillStyle = color;
    this.ctx.fill();
  },

  drawStartAndEnd() {
    this.drawGrid(state.startPos.x, state.startPos.y, COLORS.start, true);
    this.drawGrid(state.endPos.x, state.endPos.y, COLORS.end, true);
  },

  getGridCoordinates(clickX, clickY) {
    return {
      x: Math.floor(clickX / CANVAS_CONFIG.rectSize),
      y: Math.floor(clickY / CANVAS_CONFIG.rectSize)
    };
  },

  getPixelColor(x, y) {
    const pixelData = this.ctx.getImageData(x, y, 1, 1).data;
    return `rgba(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]}, ${pixelData[3] / 255})`;
  },

  isOnGridLine(clickX, clickY) {
    return (
      clickX % CANVAS_CONFIG.rectSize > CANVAS_CONFIG.rectSize - CANVAS_CONFIG.lineWidth ||
      clickY % CANVAS_CONFIG.rectSize > CANVAS_CONFIG.rectSize - CANVAS_CONFIG.lineWidth
    );
  }
};

// ============================================================================
// GRID MANAGEMENT
// ============================================================================

const GridManager = {
  init() {
    this.drawBoard();
  },

  drawBoard() {
    for (let j = 0; j < state.rows; j++) {
      for (let i = 0; i < state.cols; i++) {
        let color = GridManager.getColorAt(i, j);
        CanvasManagement.drawGrid(i, j, color);
      }
    }
    CanvasManagement.drawStartAndEnd();
  },

  reset() {
    state.graph.forEach(row => {
      row.forEach(cell => {
        cell.visited = false;
      });
    });

    state.queue = [];
    state.current = null;
    state.neighborIndex = 0;
    state.cameFrom.clear();

    if (state.intervalId) {
      clearInterval(state.intervalId);
      state.intervalId = null;
    }

    CanvasManagement.clearCanvas();
    this.drawBoard();
  },

  toggleWall(gridX, gridY, isWall) {
    // Don't allow walls on start or end positions
    if ((gridX === state.startPos.x && gridY === state.startPos.y) ||
      (gridX === state.endPos.x && gridY === state.endPos.y)) {
      return;
    }

    state.graph[gridY][gridX].wall = isWall;
    CanvasManagement.drawGrid(gridX, gridY, isWall ? COLORS.wall : COLORS.rect);
  },

  getColorAt(gridX, gridY) {
    let color;
    const i = gridX;
    const j = gridY;
    switch (true) {
      case (i === state.startPos.x && j === state.startPos.y):
        color = COLORS.start;
        break;
      case (i === state.endPos.x && j === state.endPos.y):
        color = COLORS.end;
        break;
      case (state.graph[j][i].wall):
        color = COLORS.wall;
        break;
      default:
        color = COLORS.rect;
    }
    return color;
  }
};

// ============================================================================
// MOUSE INTERACTION
// ============================================================================

const MouseHandler = {
  init() {
    window.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    window.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
  },

  handleMouseDown(e) {
    if (state.isRunning) return;
    state.isMouseDown = true;
    this.handleClick(e, true);
  },

  handleMouseUp(e) {
    if (state.isRunning) return;
    state.isMouseDown = false;
  },

  handleMouseMove(e) {
    if (!state.isMouseDown || state.isRunning) return;
    this.handleClick(e, false);
  },

  handleClick(e, isInitialClick) {
    const rect = CanvasManagement.canvas.getBoundingClientRect();
    const clickX = e.clientX + window.scrollX - (rect.left + window.scrollX);
    const clickY = e.clientY + window.scrollY - (rect.top + window.scrollY);

    // Check if click is within canvas bounds
    if (clickX < 0 || clickX > CANVAS_CONFIG.width ||
      clickY < 0 || clickY > CANVAS_CONFIG.height) {
      return;
    }

    // Check if click is on a grid line
    if (CanvasManagement.isOnGridLine(clickX, clickY)) {
      return;
    }

    // Determine fill color on initial click
    if (isInitialClick) {
      const pixelColor = CanvasManagement.getPixelColor(clickX, clickY);
      state.fillColor = pixelColor !== 'rgba(0, 0, 0, 1)' ? COLORS.wall : COLORS.rect;
    }

    // Get grid coordinates and toggle wall
    const { x: gridX, y: gridY } = CanvasManagement.getGridCoordinates(clickX, clickY);
    GridManager.toggleWall(gridX, gridY, state.fillColor === COLORS.wall);
  }
};

// ============================================================================
// PATHFINDING ALGORITHMS
// ============================================================================

// ============================================================================
// DEPTH-FIRST SEARCH ALGORITHM
// ============================================================================

const DepthFirstSearchAlgorithm = {
  // Implementation would go here
};

// ============================================================================
// BREADTH-FIRST SEARCH ALGORITHM
// ============================================================================

const PathfindingAlgorithms = {
  drawShortestPath(endNode) {
    const entries = [...state.cameFrom].reverse();
    let currentNode = endNode;

    for (const [key, value] of entries) {
      const [nodeX, nodeY] = key.split(',').map(Number);

      if (currentNode.x === nodeX && currentNode.y === nodeY) {
        if (!value) break; // Reached start node

        const [prevX, prevY] = value.split(',').map(Number);
        currentNode = { x: prevX, y: prevY };

        if (prevX === state.startPos.x && prevY === state.startPos.y) break;

        CanvasManagement.drawGrid(prevX, prevY, COLORS.path);
      }
    }
  },

  BFS() {
    console.log('BFS started');

    state.queue.push({ x: state.startPos.x, y: state.startPos.y });
    state.graph[state.startPos.y][state.startPos.x].visited = true;
    state.graph[state.startPos.y][state.startPos.x].isStart = true;
    state.graph[state.endPos.y][state.endPos.x].isEnd = true;
    state.cameFrom.set(`${state.startPos.x},${state.startPos.y}`, null);

    const BFSStep = () => {
      if (!state.current) {
        state.current = state.queue.shift();
        state.neighborIndex = 0;

        if (!state.current) {
          this.finish('BFS finished');
          return;
        }

        if (state.graph[state.current.y][state.current.x].isEnd) {
          this.finish('BFS reached the end position!');
          this.drawShortestPath(state.current);
          return;
        }

        if (!state.graph[state.current.y][state.current.x].isStart) {
          CanvasManagement.drawGrid(state.current.x, state.current.y, COLORS.current);
        }
      }

      if (state.neighborIndex < DIRECTIONS.length) {
        const dir = DIRECTIONS[state.neighborIndex++];
        const newX = state.current.x + dir.dx;
        const newY = state.current.y + dir.dy;
        const cols = Math.floor(CANVAS_CONFIG.width / CANVAS_CONFIG.rectSize);
        const rows = Math.floor(CANVAS_CONFIG.height / CANVAS_CONFIG.rectSize);

        if (newX >= 0 && newX < cols &&
          newY >= 0 && newY < rows &&
          !state.graph[newY][newX].visited &&
          !state.graph[newY][newX].wall) {

          state.graph[newY][newX].visited = true;
          state.queue.push({ x: newX, y: newY });

          if (!state.cameFrom.has(`${newX},${newY}`)) {
            state.cameFrom.set(`${newX},${newY}`, `${state.current.x},${state.current.y}`);
          }

          if (!state.graph[newY][newX].isEnd) {
            CanvasManagement.drawGrid(newX, newY, COLORS.visited);
          }
        }
      } else {
        state.current = null;
      }
    };

    state.intervalId = setInterval(BFSStep, 10);
  },

  finish(message) {
    console.log(message);
    clearInterval(state.intervalId);
    state.intervalId = null;
    state.isRunning = false;
    UIControls.startBtn.disabled = false;
  }
};

// ============================================================================
// Greedy Best-First Search ALGORITHM
// ============================================================================

const GreedyBestFirstAlgorithm = {
  // Implementation would go here
};


// ============================================================================
// A* ALGORITHM 
// ============================================================================
const AStarAlgorithm = {
  openList: new Array(),
  closedList: new Set(),
  cameFrom: new Map(),
  gScore: new Map(),
  fScore: new Map(),

  init() {
    this.gScore.set(`${state.startPos.x},${state.startPos.y}`, 0);
    this.fScore.set(`${state.startPos.x},${state.startPos.y}`, 0 + this.heuristic(state.startPos, state.endPos)); // f(x) = g(x) + h(x)
    this.openList.push({ x: state.startPos.x, y: state.startPos.y, f: this.fScore.get(`${state.startPos.x},${state.startPos.y}`) });
  },

  logic() {
    var current = this.getLowestFScoreNode();

    if (!current) {
      console.error('No path found');
      console.error('Error AS13')
      clearInterval(state.intervalId);
      return;
    }

    this.closedList.add(`${current.x},${current.y}`);
    CanvasManagement.drawGrid(current.x, current.y, COLORS.current);

    if (current.x === state.endPos.x && current.y === state.endPos.y) {
      console.log('Path found!');
      this.finish();
      return;
    }

    for (const dir of DIRECTIONS) {
      const neighborX = current.x + dir.dx;
      const neighborY = current.y + dir.dy;

      if (neighborX < 0 || neighborX >= state.cols || neighborY < 0 || neighborY >= state.rows) {
        continue;
      }

      if (state.graph[neighborY][neighborX].wall || this.closedList.has(`${neighborX},${neighborY}`)) {
        continue;
      }

      var gScore = this.gScore.get(`${neighborX},${neighborY}`) ?? Infinity;

      const currentG = this.gScore.get(`${current.x},${current.y}`) ?? Infinity;
      const tentativeGScore = currentG + this.cost();

      if (tentativeGScore < gScore) {
        this.cameFrom.set(`${neighborX},${neighborY}`, `${current.x},${current.y}`);
        this.gScore.set(`${neighborX},${neighborY}`, tentativeGScore);
        this.fScore.set(`${neighborX},${neighborY}`, tentativeGScore + this.heuristic({ x: neighborX, y: neighborY }, state.endPos));

        const existingNode = this.openList.find(n => n.x === neighborX && n.y === neighborY);
        if (existingNode) {
          existingNode.f = this.fScore.get(`${neighborX},${neighborY}`);
        } else {
          this.openList.push({ x: neighborX, y: neighborY, f: this.fScore.get(`${neighborX},${neighborY}`) });
        }

        // if (!this.openList.find(node => node.x === neighborX && node.y === neighborY)) {
        // this.openList.push({ x: neighborX, y: neighborY, f: this.fScore.get(`${neighborX},${neighborY}`) });
        CanvasManagement.drawGrid(neighborX, neighborY, COLORS.visited);
        // }
      }
    }
  },

  loop() {
    state.intervalId = setInterval(() => {
      this.logic();
    }, 100);
  },

  heuristic(a, b) {
    console.log('Heuristic between', a, b);
    console.log(Math.abs(a.x - b.x) + Math.abs(a.y - b.y));
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  },

  getLowestFScoreNode() {
    console.log('=== Getting node with lowest fScore ===');
    let lowestNode = { x: -1, y: -1, f: Infinity };

    for (var j = this.openList.length - 1; j >= 0; j--) {
      const node = this.openList[j];
      console.log('Evaluating node:', node);
      if (node.f < lowestNode.f) {
        lowestNode = node;
      }
    }

    this.openList = this.openList.filter(node => !(node.x === lowestNode.x && node.y === lowestNode.y));
    if (lowestNode.f === Infinity) {
      return null; // No valid node found
    }
    return lowestNode;
  },

  cost() {
    return 1; // Uniform cost for grid movement
  },

  drawShortestPath(endNode) {
    let current = `${endNode.x},${endNode.y}`;
    const path = [];

    while (this.cameFrom.has(current)) {
      const [x, y] = current.split(',').map(Number);
      path.push({ x, y });
      current = this.cameFrom.get(current);
    }

    path.reverse();

    for (const node of path) {
      CanvasManagement.drawGrid(node.x, node.y, COLORS.path);
    }
  },

  finish() {
    console.log('A* finished');
    this.drawShortestPath({ x: state.endPos.x, y: state.endPos.y });
    state.isRunning = false;
    UIControls.startBtn.disabled = false;
    clearInterval(state.intervalId);
    state.intervalId = null;
    this.openList = [];
    this.closedList.clear();
    this.cameFrom.clear();
    this.gScore.clear();
    this.fScore.clear();
  }
};



// ============================================================================
// INITIALIZATION
// ============================================================================
function init() {
  ThemeManager.init();
  CanvasManagement.init();
  GridManager.init();
  MouseHandler.init();
  UIControls.init();
  console.log('Application initialized');
}

window.onload = init;

// ============================================================================
// TODO LIST
// ============================================================================

// TODO: Adjust the speed of BFS traversal using animation frame rate
// TODO: Add DFS algorithm option using stack
// TODO: Add A* algorithm option with heuristic
// TODO: Add reset button to clear walls and restart
// TODO: Add ability to move start/end positions by dragging
// TODO: Add algorithm selector dropdown