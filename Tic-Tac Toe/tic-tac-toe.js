// Get canvas and context
const canvas = document.getElementById('tic-tac-toe');
const ctx = canvas.getContext('2d');

// Set up variables
let currentPlayer = 'X';
let board = [
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
];
let gameActive = true;

// Draw the initial game board
function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 5;
    ctx.beginPath();
    // Vertical lines
    ctx.moveTo(canvas.width / 3, 0);
    ctx.lineTo(canvas.width / 3, canvas.height);
    ctx.moveTo((canvas.width / 3) * 2, 0);
    ctx.lineTo((canvas.width / 3) * 2, canvas.height);
    
    // Horizontal lines
    ctx.moveTo(0, canvas.height / 3);
    ctx.lineTo(canvas.width, canvas.height / 3);
    ctx.moveTo(0, (canvas.height / 3) * 2);
    ctx.lineTo(canvas.width, (canvas.height / 3) * 2);
    ctx.stroke();
}

// Draw X and O with specific colors
function drawSymbol(x, y, player) {
    const cellWidth = canvas.width / 3;
    const cellHeight = canvas.height / 3;
    
    const centerX = x * cellWidth + cellWidth / 2;
    const centerY = y * cellHeight + cellHeight / 2;
    
    ctx.font = '80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Set colors for X and O
    if (player === 'X') {
        ctx.fillStyle = '#F00';  // Red color for X
    } else {
        ctx.fillStyle = '#00F';  // Blue color for O
    }
    
    ctx.fillText(player, centerX, centerY);
}

// Handle player move
function handleClick(event) {
    if (!gameActive) return;

    const cellWidth = canvas.width / 3;
    const cellHeight = canvas.height / 3;

    const x = Math.floor(event.offsetX / cellWidth);
    const y = Math.floor(event.offsetY / cellHeight);

    // Check if cell is already occupied
    if (board[y][x] !== '') return;

    // Place symbol
    board[y][x] = currentPlayer;
    drawSymbol(x, y, currentPlayer);

    // Check for win or draw
    if (checkWin()) {
        gameActive = false;
        alert(`${currentPlayer} wins!`);
    } else if (isBoardFull()) {
        gameActive = false;
        alert("It's a draw!");
    } else {
        // Switch player
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    }
}

// Check if the current player has won
function checkWin() {
    const winConditions = [
        [[0, 0], [0, 1], [0, 2]],
        [[1, 0], [1, 1], [1, 2]],
        [[2, 0], [2, 1], [2, 2]],
        [[0, 0], [1, 0], [2, 0]],
        [[0, 1], [1, 1], [2, 1]],
        [[0, 2], [1, 2], [2, 2]],
        [[0, 0], [1, 1], [2, 2]],
        [[0, 2], [1, 1], [2, 0]],
    ];

    for (const condition of winConditions) {
        const [a, b, c] = condition;
        if (board[a[0]][a[1]] !== '' && board[a[0]][a[1]] === board[b[0]][b[1]] && board[a[0]][a[1]] === board[c[0]][c[1]]) {
            return true;
        }
    }
    return false;
}

// Check if the board is full
function isBoardFull() {
    for (let row of board) {
        if (row.includes('')) return false;
    }
    return true;
}

// Reset the game board and state
function resetGame() {
    board = [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
    ];
    currentPlayer = 'X';
    gameActive = true;
    drawBoard();
}

// Set up the game
drawBoard();

// Event listeners
canvas.addEventListener('click', handleClick);
document.getElementById('resetButton').addEventListener('click', resetGame);
