const canvas = document.getElementById("asteroids");
const ctx = canvas.getContext("2d");

let ship;
let bullets = [];
let asteroids = [];
let gameInterval;
let score = 0;
let gameOver = false;
let keyState = {};

// Ship object
class Ship {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.angle = 0;
        this.speed = 0;
        this.width = 30;
        this.height = 40; // Adjusted for ship shape
        this.maxSpeed = 5;
        this.friction = 0.98;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Draw the main body of the spaceship
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2); // Nose of the ship
        ctx.lineTo(-this.width / 2, this.height / 2); // Left wing
        ctx.lineTo(0, this.height / 4); // Bottom center
        ctx.lineTo(this.width / 2, this.height / 2); // Right wing
        ctx.closePath();
        ctx.fill();

        // Draw cockpit
        ctx.fillStyle = "cyan";
        ctx.beginPath();
        ctx.arc(0, -this.height / 3, 5, 0, Math.PI * 2); // Circular cockpit
        ctx.fill();

        ctx.restore();
    }

    update() {
        if (keyState["ArrowUp"]) {
            this.thrust();
        }
        if (keyState["ArrowLeft"]) {
            this.rotate(-1);
        }
        if (keyState["ArrowRight"]) {
            this.rotate(1);
        }

        // Apply friction
        this.speed *= this.friction;

        // Update position
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        // Wrap around the screen
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
    }

    thrust() {
        this.speed += 0.1;
        if (this.speed > this.maxSpeed) this.speed = this.maxSpeed; // Max speed
    }

    rotate(direction) {
        this.angle += direction * 0.1;
    }
}

// Bullet object
class Bullet {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = 8;
        this.radius = 3;
        this.lifeTime = 100;
        this.age = 0;
    }

    draw() {
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.age++;

        // Remove bullet if it goes off-screen or exceeds lifetime
        return (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height || this.age > this.lifeTime);
    }
}

// Asteroid object
class Asteroid {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 30 + 20;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
        this.vertices = Math.floor(Math.random() * 5 + 5);
        this.offsets = Array.from({ length: this.vertices }, () => Math.random() * this.size * 0.4 - this.size * 0.2);
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = "gray";

        // Draw asteroid with irregular vertices
        ctx.beginPath();
        for (let i = 0; i < this.vertices; i++) {
            const angle = (Math.PI * 2 / this.vertices) * i;
            const x = Math.cos(angle) * (this.size + this.offsets[i]);
            const y = Math.sin(angle) * (this.size + this.offsets[i]);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around the screen
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
    }
}

// Initialize game
function init() {
    ship = new Ship();
    bullets = [];
    asteroids = [];
    score = 0;
    gameOver = false;

    for (let i = 0; i < 5; i++) {
        asteroids.push(new Asteroid(Math.random() * canvas.width, Math.random() * canvas.height));
    }

    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(updateGame, 1000 / 60);
    updateScore();
}

// Draw everything on the canvas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ship.draw();
    bullets.forEach(bullet => bullet.draw());
    asteroids.forEach(asteroid => asteroid.draw());
}

// Update game state
function updateGame() {
    if (gameOver) {
        clearInterval(gameInterval);
        document.getElementById("gameOver").style.display = "block";
        return;
    }

    ship.update();

    // Update bullets and remove off-screen bullets
    bullets = bullets.filter(bullet => !bullet.update());

    // Update asteroids
    asteroids.forEach(asteroid => asteroid.update());

    // Check for collisions between bullets and asteroids
    bullets.forEach((bullet, bulletIndex) => {
        asteroids.forEach((asteroid, asteroidIndex) => {
            const dx = bullet.x - asteroid.x;
            const dy = bullet.y - asteroid.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < bullet.radius + asteroid.size) {
                bullets.splice(bulletIndex, 1); // Remove bullet
                asteroids.splice(asteroidIndex, 1); // Remove asteroid
                score += 10;
                asteroids.push(new Asteroid(Math.random() * canvas.width, Math.random() * canvas.height));
            }
        });
    });

    // Check for collisions between the ship and asteroids
    asteroids.forEach(asteroid => {
        const dx = ship.x - asteroid.x;
        const dy = ship.y - asteroid.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < ship.width / 2 + asteroid.size) {
            gameOver = true; // End the game
        }
    });

    draw();
    updateScore();
}

// Update score display
function updateScore() {
    document.getElementById("score").innerText = `Score: ${score}`;
}

// Player controls
document.addEventListener("keydown", (event) => {
    keyState[event.code] = true;
    if (event.code === "Space") {
        bullets.push(new Bullet(ship.x, ship.y, ship.angle)); // Shoot bullet
    }
});

document.addEventListener("keyup", (event) => {
    keyState[event.code] = false;
});

// Reset game button
document.getElementById("resetButton").addEventListener("click", () => {
    document.getElementById("gameOver").style.display = "none";
    init();
});

// Start the game
init();
