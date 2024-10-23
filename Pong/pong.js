const canvas = document.getElementById('pong')
const ctx = canvas.getContext('2d')

// Audio elements
let hit = new Audio()
let wall = new Audio()
let userScore = new Audio()
let comScore = new Audio()

hit.src = 'sounds/hit.mp3'
wall.src = 'sounds/wall.mp3'
comScore.src = 'sounds/comScore.mp3'
userScore.src = 'sounds/userScore.mp3' // Fixed assignment

// Ball object
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    velocityX: 5,
    velocityY: 5,
    speed: 7,
    color: 'ORANGE'
}

// User paddle object
const user = {
    x: 0,
    y: (canvas.height - 100) / 2,
    width: 10,
    height: 100,
    score: 0,
    color: 'BLUE'
}

// Computer paddle object
const com = {
    x: canvas.width - 10,
    y: (canvas.height - 100) / 2,
    width: 10,
    height: 100,
    score: 0,
    color: 'RED'
}

// Net object
const net = {
    x: (canvas.width - 2) / 2,
    y: 0,
    height: 10,
    width: 2,
    color: 'WHITE'
}

// Function to draw a rectangle
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color
    ctx.fillRect(x, y, w, h)
}

// Function to draw a circle (arc)
function drawArc(x, y, r, color) {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.fill()
}

// Get mouse position for user paddle control
canvas.addEventListener('mousemove', getMousePos)

function getMousePos(evt) {
    let rect = canvas.getBoundingClientRect()
    user.y = evt.clientY - rect.top - user.height / 2
}

// Reset the ball to center
function resetBall() {
    ball.x = canvas.width / 2
    ball.y = canvas.height / 2
    ball.velocityX = -ball.velocityX
    ball.speed = 7
}

// Draw the net
function drawNet() {
    for (let i = 0; i <= canvas.height; i += 15) { // Fixed canvas height
        drawRect(net.x, net.y + i, net.width, net.height, net.color)
    }
}

// Draw text for scores
function drawText(text, x, y) {
    ctx.fillStyle = '#FFF'
    ctx.font = '75px fantasy'
    ctx.fillText(text, x, y)
}

// Check for collisions
function collision(b, p) {
    p.top = p.y
    p.bottom = p.y + p.height
    p.left = p.x
    p.right = p.x + p.width

    b.top = b.y - b.radius
    b.bottom = b.y + b.radius
    b.left = b.x - b.radius
    b.right = b.x + b.radius

    return b.right > p.left && b.bottom > p.top && b.left < p.right && b.top < p.bottom
}

// Update game elements
function update() {
    // Check if ball hits left or right walls (scores)
    if (ball.x - ball.radius < 0) {
        com.score++
        comScore.play()
        resetBall()
    } else if (ball.x + ball.radius > canvas.width) {
        user.score++
        userScore.play()
        resetBall()
    }

    // Move the ball
    ball.x += ball.velocityX
    ball.y += ball.velocityY

    // Computer AI to follow the ball
    com.y += ((ball.y - (com.y + com.height / 2))) * 0.1

    // Ball hits top or bottom wall
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.velocityY = -ball.velocityY
        wall.play()
    }

    // Determine which player to check for collision (user or computer)
    let player = (ball.x + ball.radius < canvas.width / 2) ? user : com

    // If ball hits the paddle
    if (collision(ball, player)) {
        hit.play()

        // Calculate the angle where the ball hits the paddle
        let collidePoint = ball.y - (player.y + player.height / 2)

        // Normalize collision point to get a value between -1 and 1
        collidePoint = collidePoint / (player.height / 2)

        // Calculate the angle in radians
        let angleRad = (Math.PI / 4) * collidePoint

        // Set ball direction based on which paddle hit the ball
        let direction = (ball.x + ball.radius < canvas.width / 2) ? 1 : -1
        ball.velocityX = direction * ball.speed * Math.cos(angleRad)
        ball.velocityY = ball.speed * Math.sin(angleRad)

        // Speed up the ball
        ball.speed += 0.1
    }
}

// Render the game (draw everything)
function render() {
    // Clear the canvas
    drawRect(0, 0, canvas.width, canvas.height, '#000')

    // Draw the scores
    drawText(user.score, canvas.width / 4, canvas.height / 5)
    drawText(com.score, 3 * canvas.width / 4, canvas.height / 5)

    // Draw the net
    drawNet()

    // Draw paddles
    drawRect(user.x, user.y, user.width, user.height, user.color)
    drawRect(com.x, com.y, com.width, com.height, com.color)

    // Draw the ball
    drawArc(ball.x, ball.y, ball.radius, ball.color)
}

// Main game function
function game() {
    update()
    render()
}

// Loop the game at 50 frames per second
let framePerSecond = 50
let loop = setInterval(game, 1000 / framePerSecond)
