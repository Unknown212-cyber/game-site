const canvas = document.getElementById("space-invader");
const ctx = canvas.getContext("2d");

let player, bullets, aliens, gameInterval;
const alienRows = 5;
const alienColumns = 10;
const bulletSpeed = 5;
let alienSpeed = 1;
let score = 0;
let lives = 3;
let gameOver = false;
let alienDirection = 1; // 1 for right, -1 for left

// Player object
class Player {
    constructor() {
        this.width = 50;
        this.height = 30;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 10;
    }

    draw() {
        ctx.fillStyle = "blue"; // Player color
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    move(direction) {
        this.x += direction * 10;
        // Prevent the player from moving off-screen
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
    }
}

// Bullet object
class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 5;
        this.height = 15;
    }

    draw() {
        ctx.fillStyle = "red"; // Bullet color
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.y -= bulletSpeed;
    }
}

// Alien object
class Alien {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 30;
    }

    draw() {
        ctx.fillStyle = "green"; // Alien color
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// Initialize game objects
function init() {
    player = new Player();
    bullets = [];
    aliens = [];
    score = 0;
    lives = 3;
    gameOver = false;
    alienSpeed = 1;

    // Generate the first set of aliens
    generateAliens();

    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(updateGame, 1000 / 60);
    updateScoreAndLives();
}

// Generate a new set of aliens
function generateAliens() {
    for (let row = 0; row < alienRows; row++) {
        for (let col = 0; col < alienColumns; col++) {
            aliens.push(new Alien(col * (40 + 10) + 30, row * (30 + 10) + 30));
        }
    }
}

// Draw everything on the canvas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.draw();
    bullets.forEach(bullet => bullet.draw());
    aliens.forEach(alien => alien.draw());
    updateScoreAndLives();
}

// Update the game state
function updateGame() {
    if (gameOver) {
        clearInterval(gameInterval);
        document.getElementById("gameOver").style.display = "block";
        return;
    }

    draw();

    // Update bullets
    bullets.forEach((bullet, bulletIndex) => {
        bullet.update();
        if (bullet.y < 0) {
            bullets.splice(bulletIndex, 1); // Remove bullet if it goes off-screen
        }
    });

    // Check for bullet collisions with aliens
    bullets.forEach((bullet, bulletIndex) => {
        aliens.forEach((alien, alienIndex) => {
            if (bullet.x > alien.x && bullet.x < alien.x + alien.width && bullet.y > alien.y && bullet.y < alien.y + alien.height) {
                bullets.splice(bulletIndex, 1); // Remove bullet
                aliens.splice(alienIndex, 1); // Remove alien
                score++;
                // Create explosion effect
                drawExplosion(alien.x, alien.y);
                // Increase difficulty every 5 points
                if (score % 5 === 0) {
                    alienSpeed += 0.5;
                }
                // Generate new aliens if all are destroyed
                if (aliens.length === 0) {
                    generateAliens();
                }
            }
        });
    });

    // Move aliens horizontally across the screen
    if (aliens.length > 0) {
        // Check if aliens reach the edges
        const firstAlien = aliens[0];
        const lastAlien = aliens[aliens.length - 1];

        if (firstAlien.x <= 0 || lastAlien.x + lastAlien.width >= canvas.width) {
            alienDirection *= -1; // Reverse direction
            aliens.forEach(alien => alien.y += 10); // Move down a level
        }

        aliens.forEach(alien => {
            alien.x += alienSpeed * alienDirection; // Move aliens horizontally
        });
    }
}

// Draw explosion effect
function drawExplosion(x, y) {
    ctx.fillStyle = "orange"; // Explosion color
    ctx.beginPath();
    ctx.arc(x + 20, y + 15, 15, 0, Math.PI * 2); // Explosion circle
    ctx.fill();
}

// Update score and lives display
function updateScoreAndLives() {
    document.getElementById("score").innerText = `Score: ${score}`;
    document.getElementById("lives").innerText = `Lives: ${lives}`;
}

// Player controls
document.addEventListener("keydown", (event) => {
    if (event.code === "ArrowLeft") {
        player.move(-1);
    } else if (event.code === "ArrowRight") {
        player.move(1);
    } else if (event.code === "Space") {
        bullets.push(new Bullet(player.x + player.width / 2 - 2.5, player.y)); // Center bullet
    }
});

// Reset game button
document.getElementById("resetButton").addEventListener("click", () => {
    document.getElementById("gameOver").style.display = "none";
    init();
});

// Start the game
init();
