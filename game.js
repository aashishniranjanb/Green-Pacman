document.addEventListener('DOMContentLoaded', () => {
    // --- Basic Setup ---
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const scoreEl = document.getElementById("score");
    const highScoreEl = document.getElementById("highScore");
    const overlay = document.getElementById('game-overlay');
    const overlayTitle = document.getElementById('overlay-title');
    const overlayMessage = document.getElementById('overlay-message');
    const startButton = document.getElementById('start-button');

    const gridSize = 20; // 20x20 grid
    let tileSize; // To be calculated based on canvas size

    // --- Game State ---
    let score = 0;
    let highScore = localStorage.getItem('ecoGridHighScore') || 0;
    let gameRunning = false;
    let powerUpActive = false;
    let powerUpTimer = 0;

    // --- Maze Layout (1 = Wall, 0 = Path, 2 = Power-up, 3 = Enemy Start) ---
    const maze = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 2, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 2, 1],
        [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
        [1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1],
        [1, 1, 1, 0, 1, 1, 0, 1, 1, 3, 3, 1, 1, 0, 1, 1, 0, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1],
        [1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1],
        [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 2, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 2, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];

    // --- Asset Loading ---
    const images = {
        player: new Image(),
        dot: new Image(),
        power: new Image(),
        smog: new Image(),
        oil: new Image(),
        plastic: new Image(),
        stump: new Image()
    };
    images.player.src = 'assets/player.png';
    images.dot.src = 'assets/dot.png';
    images.power.src = 'assets/power.png';
    images.smog.src = 'assets/smog.png';
    images.oil.src = 'assets/oil.png';
    images.plastic.src = 'assets/plastic.png';
    images.stump.src = 'assets/stump.png';

    // --- Game Entities ---
    let player;
    let polluters = [];
    let dots = [];

    class Player {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.dir = 'right';
            this.nextDir = 'right';
        }
        draw() {
            ctx.drawImage(images.player, this.x * tileSize, this.y * tileSize, tileSize, tileSize);
        }
    }

    class Polluter {
        constructor(x, y, type) {
            this.x = x;
            this.y = y;
            this.startX = x;
            this.startY = y;
            this.type = type;
            this.isVulnerable = false;
        }
        draw() {
            if (this.isVulnerable) {
                ctx.globalAlpha = 0.6; // Make them look faded when vulnerable
            }
            ctx.drawImage(images[this.type], this.x * tileSize, this.y * tileSize, tileSize, tileSize);
            ctx.globalAlpha = 1.0;
        }
        reset() {
            this.x = this.startX;
            this.y = this.startY;
            this.isVulnerable = false;
        }
    }

    // --- Game Logic Functions ---
    function setupLevel() {
        dots = [];
        polluters = [];
        maze.forEach((row, y) => {
            row.forEach((tile, x) => {
                if (tile === 0 || tile === 2) { // Add dots to paths and power-up spots
                    dots.push({ x, y, type: (tile === 2) ? 'power' : 'dot' });
                }
            });
        });

        player = new Player(1, 9); // Player start position
        polluters.push(new Polluter(9, 9, 'smog'));
        polluters.push(new Polluter(10, 9, 'oil'));
        polluters.push(new Polluter(9, 8, 'plastic'));
        polluters.push(new Polluter(10, 8, 'stump'));
    }

    function resetGame() {
        score = 0;
        updateScore();
        setupLevel();
        gameRunning = true;
        overlay.style.display = 'none';
        lastTime = 0; // Reset animation timer
        requestAnimationFrame(gameLoop);
    }
    
    function moveEntity(entity, dir) {
        let newX = entity.x;
        let newY = entity.y;

        if (dir === "up") newY--;
        if (dir === "down") newY++;
        if (dir === "left") newX--;
        if (dir === "right") newX++;
        
        // Handle screen wrapping
        if (newX < 0) newX = gridSize - 1;
        if (newX >= gridSize) newX = 0;
        if (newY < 0) newY = gridSize - 1;
        if (newY >= gridSize) newY = 0;

        // Wall collision
        if (maze[newY][newX] !== 1) {
            entity.x = newX;
            entity.y = newY;
            return true; // Move was successful
        }
        return false; // Move was blocked
    }
    
    function updatePlayer() {
        // Try to move in the next intended direction
        if (moveEntity(player, player.nextDir)) {
            player.dir = player.nextDir;
        } else {
            // If blocked, try to continue in the current direction
            moveEntity(player, player.dir);
        }
    }

    function updatePolluters() {
        polluters.forEach(p => {
            const directions = ["up", "down", "left", "right"];
            const randomDir = directions[Math.floor(Math.random() * directions.length)];
            moveEntity(p, randomDir);
        });
    }

    function checkCollisions() {
        // Player vs Dots/Power-ups
        dots = dots.filter(dot => {
            if (dot.x === player.x && dot.y === player.y) {
                if (dot.type === 'dot') {
                    score += 10;
                } else { // It's a power-up
                    score += 50;
                    powerUpActive = true;
                    powerUpTimer = 300; // 5 seconds at 60fps
                    polluters.forEach(p => p.isVulnerable = true);
                }
                updateScore();
                return false; // Remove dot
            }
            return true;
        });

        // Player vs Polluters
        polluters.forEach(p => {
            if (p.x === player.x && p.y === player.y) {
                if (p.isVulnerable) {
                    score += 200;
                    updateScore();
                    p.reset(); // Send back to start
                } else {
                    gameOver("The Polluters got you!");
                }
            }
        });
    }

    function updateScore() {
        scoreEl.textContent = score;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('ecoGridHighScore', highScore);
            highScoreEl.textContent = highScore;
        }
    }
    
    function gameOver(message) {
        gameRunning = false;
        overlayTitle.textContent = "Game Over";
        overlayMessage.textContent = message + ` Final Score: ${score}`;
        startButton.textContent = "Restart";
        overlay.style.display = 'flex';
    }
    
    function checkWinCondition() {
        const remainingDots = dots.some(d => d.type === 'dot');
        if (!remainingDots) {
            gameRunning = false;
            overlayTitle.textContent = "You Win!";
            overlayMessage.textContent = `You've cleaned the grid! Final Score: ${score}`;
            startButton.textContent = "Play Again";
            overlay.style.display = 'flex';
        }
    }

    // --- Drawing Functions ---
    function drawMaze() {
        ctx.strokeStyle = `rgba(0, 255, 174, 0.2)`;
        ctx.lineWidth = 1;
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (maze[i][j] === 1) {
                    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--wall-color') || '#00ffaa';
                    ctx.fillRect(j * tileSize, i * tileSize, tileSize, tileSize);
                } else {
                    // Draw grid lines for paths
                    ctx.beginPath();
                    ctx.rect(j * tileSize, i * tileSize, tileSize, tileSize);
                    ctx.stroke();
                }
            }
        }
    }

    function drawDots() {
        dots.forEach(dot => {
            const img = dot.type === 'power' ? images.power : images.dot;
            ctx.drawImage(img, dot.x * tileSize, dot.y * tileSize, tileSize, tileSize);
        });
    }
    
    // --- Main Game Loop ---
    let lastTime = 0;
    let moveCounter = 0;
    const moveInterval = 10; // Lower is faster

    function gameLoop(timestamp) {
        if (!gameRunning) return;

        let deltaTime = timestamp - lastTime;
        lastTime = timestamp;
        
        moveCounter++;
        if (moveCounter >= moveInterval) {
            moveCounter = 0;
            // Update game state
            updatePlayer();
            updatePolluters();
            checkCollisions();
            checkWinCondition();
            
            if (powerUpActive) {
                powerUpTimer--;
                if (powerUpTimer <= 0) {
                    powerUpActive = false;
                    polluters.forEach(p => p.isVulnerable = false);
                }
            }
        }

        // Draw everything
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawMaze();
        drawDots();
        player.draw();
        polluters.forEach(p => p.draw());

        requestAnimationFrame(gameLoop);
    }
    
    // --- Event Listeners and Initialization ---
    function handleResize() {
        const size = Math.min(window.innerWidth, window.innerHeight * 0.7);
        canvas.width = size;
        canvas.height = size;
        tileSize = canvas.width / gridSize;
    }
    
    window.addEventListener('resize', handleResize);
    
    // Keyboard Controls
    document.addEventListener("keydown", e => {
        if (e.key === "ArrowUp") player.nextDir = "up";
        if (e.key === "ArrowDown") player.nextDir = "down";
        if (e.key === "ArrowLeft") player.nextDir = "left";
        if (e.key === "ArrowRight") player.nextDir = "right";
    });

    // On-screen Button Controls
    document.querySelectorAll(".ctrl").forEach(btn => {
        btn.addEventListener("click", () => { player.nextDir = btn.dataset.dir; });
    });

    // Swipe Controls
    let touchStartX = 0;
    let touchStartY = 0;
    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, false);

    canvas.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;
        handleSwipe(touchEndX - touchStartX, touchEndY - touchStartY);
    }, false);

    function handleSwipe(diffX, diffY) {
        if (Math.abs(diffX) > Math.abs(diffY)) { // Horizontal swipe
            player.nextDir = (diffX > 0) ? 'right' : 'left';
        } else { // Vertical swipe
            player.nextDir = (diffY > 0) ? 'down' : 'up';
        }
    }
    
    // --- Start Game ---
    startButton.addEventListener('click', resetGame);
    
    highScoreEl.textContent = highScore;
    handleResize(); // Initial size setup
    setupLevel(); // Prepare level data
});