const board = document.getElementById("gameBoard");

const cols = 60;
const rows = 40;

let snake = [
    {x: 5, y: 5}, //head
    {x: 4, y: 5},
    {x: 3, y: 5},
    {x: 2, y: 5},
    {x: 1, y: 5},
];
let direction = {x: 1, y: 0};
let lastDirection = {x: 1, y: 0};

let score = 0;
let highScore = localStorage.getItem("highScore") || 0;

let isPaused = false;
let level = 1;
let speed = 250;



document.getElementById("highScore").innerText = highScore;


document.addEventListener("keydown", e => {

   const key = e.key;
    let newDir = direction; 
    
  if (key === "ArrowUp")    direction = { x: 0, y: -1 };
  if (key === "ArrowDown")  direction = { x: 0, y: 1 };
  if (key === "ArrowLeft")  direction = { x: -1, y: 0 };
  if (key === "ArrowRight") direction = { x: 1, y: 0 };

  if (newDir.x !== -lastDirection.x || newDir.y !== -lastDirection.y) return;
        
  direction = newDir;
    
});

let gameInterval = null;

function drawSnake() {

    board.innerHTML = "";

    snake.forEach((segment, index) => {
        const segmentDiv = document.createElement("div");
        if (index === 0) {
            segmentDiv.classList.add("snake-head");

            let angle = 0;
            if (direction.x === 1) angle = 0;        // right
            if (direction.x === -1) angle = 180;     // left
            if (direction.y === -1) angle = -90;     // up
            if (direction.y === 1) angle = 90;       // down

            segmentDiv.style.transform = `rotate(${angle}deg)`;

            // Add eyes
            const leftEye = document.createElement("div");
            leftEye.classList.add("eye", "left");

            const rightEye = document.createElement("div");
            rightEye.classList.add("eye", "right");

            segmentDiv.appendChild(leftEye);
            segmentDiv.appendChild(rightEye);
        } else {
            segmentDiv.classList.add("snake");
        }
        segmentDiv.style.gridColumnStart = segment.x;
        segmentDiv.style.gridRowStart = segment.y;
        board.appendChild(segmentDiv);
    });
};


function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * cols) + 1,
            y: Math.floor(Math.random() * rows) + 1
        };
    } while (snake.some(seg => seg.x === newFood.x && seg.y === newFood.y));

    return newFood;
}

let food = generateFood();

function drawFood() {
    const foodDiv = document.createElement("div");
    foodDiv.classList.add("food");

    if (food.justAte) {
        foodDiv.classList.add("flash");
        setTimeout(() => {
            food.justAte = false;
        }, 300);
    }

    foodDiv.style.gridColumnStart = food.x;
    foodDiv.style.gridRowStart = food.y;
    board.appendChild(foodDiv);
};

const gameOverScreen = document.getElementById("gameOverScreen");
const restartBtn = document.getElementById("restartBtn");

function gameOver() {
    clearInterval(gameInterval);
    gameInterval = null;
    // score = 0;
    gameOverScreen.style.display = "flex";
}
function gameloop() {

    if (isPaused) return;

    board.innerHTML = "";
    drawSnake();
    moveSnake();
    drawFood();
};


function moveSnake() {
    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };
    if (snake.length > 1) {
        let second = snake[1]; 
        if (head.x === second.x && head.y === second.y) {
            // invalid reverse move → ignore this direction
            direction = lastDirection;
            return;
        }
    }
    lastDirection = direction;

    if (head.x < 1) head.x = cols;
    if (head.x > cols) head.x = 1;
    if (head.y < 1) head.y = rows;
    if (head.y > rows) head.y = 1;

    
    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            // resetGame();
            return;
        }
    }

    snake.unshift(head);

// Check collision with food
    if (head.x === food.x && head.y === food.y) {

    food = generateFood();
    food.justAte = true;

    score++;

        

    document.getElementById("score").innerText = score;

    // update high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
        document.getElementById("highScore").innerText = highScore;
    }

    if(score % 5 === 0) {
            level++;
            document.getElementById("level").innerText = level;
            speed = Math.max(50, speed - 20);
            clearInterval(gameInterval);
            gameInterval = setInterval(gameloop, speed);
    }
        
    } else {
        snake.pop();
    }
};


const startButtonDiv = document.getElementById("startButtonDiv");
const startButton = document.getElementById("startButton");

const gameStart = () => {
    startButtonDiv.style.display = "none";
    if(gameInterval) return;
    speed = 250;
    gameInterval = setInterval(gameloop, speed);
    
    // console.log();
};
startButton.addEventListener('click', gameStart);

const gameRestart = () => {
    
    snake = [
    {x: 5, y: 5}, //head
    {x: 4, y: 5},
    {x: 3, y: 5},
    {x: 2, y: 5},
    {x: 1, y: 5},
];
    direction = {x: 1, y: 0};
    lastDirection = {x: 1, y: 0};
    score = 0;
    document.getElementById("score").innerText = score;
    // console.log(score);
    
    
    gameOverScreen.style.display = "none";
    gameStart();

};
restartBtn.addEventListener('click', gameRestart);


document.addEventListener("keydown", e => {

    // PAUSE / RESUME on Space
    if (e.code === "Space" && gameInterval) {
        isPaused = !isPaused; // toggle pause state
        // console.log(isPaused);
        
        document.getElementById("pauseScreen").style.display =
        isPaused ? "block" : "none";
        return;
    }
    // Movement keys...
});

document.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

        // If start screen is visible → start game
        if (!gameInterval && startButtonDiv.style.display !== "none") {
            startButton.click();
        }

        // If game over screen visible → restart
        if (gameOverScreen.style.display !== "none") {
            restartBtn.click();
        }
    }

});