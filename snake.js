const ROWS = 20;
const COLS = 20;
const CELL = 20; 
let cells = [];
let snake;          // array of {x, y} objects
let food;           // single {x, y} object
let direction;      // current movement direction {x, y}
let dirQueue;       // array of queued direction inputs
let score;          // number
let level;          // number
let pendingGrowth;  // number
let gameLoop;       // will hold the setInterval reference
let running;        // boolean - is the game currently running
let paused = false;
function  makeBoard() {
//style the board element to show as a grid
    const board = document.getElementById('board');
    board.style.display = 'grid';
    board.style.gridTemplateColumns = `repeat(${COLS}, ${CELL}px)`;
    board.style.gridTemplateRows = `repeat(${ROWS}, ${CELL}px)`;

//Create each cell, add it to the board, and store it
    for (let r = 0; r < ROWS; r++) {
        cells[r] = [];
        for (let c = 0; c < COLS; c++) {
            const div = document.createElement('div');
            div.style.background = '#1a1a1a';
            div.style.border = '1px solid #222';
            board.appendChild(div);
            cells[r][c] = div;
        }
    }
}
//The starting values
function startGame() {
    snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }];
    direction = { x: 1, y: 0 };
    dirQueue = [];
    score = 0;
    level = 1;
    pendingGrowth = 0;
    running = true;
    spawnFood()
    restartLoop()
    updateHub();
    document.getElementById('btn-pause').textContent = 'Pause';
    paused = false;
}

function isSnake(x, y) {
    return snake.some(seg => seg.x === x && seg.y === y);
}

function spawnFood() {
    let pos;
    do {
        pos = {
            x: Math.floor(Math.random() * COLS),
            y: Math.floor(Math.random() * ROWS)
        };
    } while (isSnake(pos.x, pos.y));
    food = pos;
}

function draw(){
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            cells[r][c].style.background = '#1a1a1a';
        }
    }

    snake.forEach((seg, index) => {
        cells[seg.y][seg.x].style.background = index === 0 ? '#a8ff78' : '#5ac485';
    });

    cells[food.y][food.x].style.background = '#e05050';
}

function tick() {
    // 1. consume direction from queue
    if (dirQueue.length > 0) {
        direction = dirQueue.shift();
    }

    // 2. calculate new head
    const newHead = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };

    //COLLISIONS
    // 3. wall collision
    if (newHead.x < 0 || newHead.x >= COLS || newHead.y < 0 || newHead.y >= ROWS) {
        endGame();
        return;
    }

    // 4. self collision
    if (snake.slice(1).some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
        endGame();
        return;
    }

    // 5. add new head
    snake.unshift(newHead);

    // 6. check food
    if (newHead.x === food.x && newHead.y === food.y) {
        pendingGrowth++;
        score++;
        spawnFood();
        if (score % 5 === 0) {
            level++;
            restartLoop();
        }
    }

    // 7. grow or pop
    if (pendingGrowth > 0) {
        pendingGrowth--;
    } else {
        snake.pop();
    }

    // 8. draw
    draw();

}

function restartLoop() {
    clearInterval(gameLoop);
    gameLoop = setInterval(tick, Math.max(60, 150 - (level - 1) * 15));
}

function endGame() {
    clearInterval(gameLoop);
    running = false;
    alert('Game Over! Score: ' + score);
}

document.addEventListener('keydown', e => {
    if (!running) return;

    let newDir;

    if (e.key === 'ArrowUp')    newDir = { x: 0, y: -1 };
    if (e.key === 'ArrowDown')  newDir = { x: 0, y: 1 }
    if (e.key === 'ArrowLeft')  newDir = { x: -1, y: 0 }
    if (e.key === 'ArrowRight') newDir = { x: 1, y: 0 }

    if (!newDir) return;

    if (newDir.x === -direction.x && newDir.y === -direction.y) return;

    dirQueue.push(newDir);

});

function updateHub(){
    document.getElementById("score-display").innerHTML = score;
    document.getElementById('level-display').innerHTML = level;
}

makeBoard();
startGame()

document.getElementById('btn-restart').addEventListener('click', () => {
    startGame();
});
document.getElementById('btn-pause').addEventListener('click', () => {
    if (!running) return;
    paused = !paused;
    if (paused) {
        clearInterval(gameLoop);
        document.getElementById('btn-pause').textContent = 'Resume';
    } else {
        restartLoop();
        document.getElementById('btn-pause').textContent = 'Pause';
    }
});