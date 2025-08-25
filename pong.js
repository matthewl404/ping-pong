const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game variables
const paddleWidth = 12;
const paddleHeight = 90;
const ballRadius = 10;
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// Player paddle
const player = {
    x: 0,
    y: canvasHeight / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: "#4CAF50"
};

// AI paddle
const ai = {
    x: canvasWidth - paddleWidth,
    y: canvasHeight / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: "#E91E63"
};

// Ball
const ball = {
    x: canvasWidth / 2,
    y: canvasHeight / 2,
    radius: ballRadius,
    speed: 6,
    velocityX: 6,
    velocityY: 6,
    color: "#fff"
};

// Speed up variables
let speedIncreaseInterval = 3000; // ms
let speedIncreaseAmount = 0.5;
let maxSpeed = 20;
let lastSpeedIncrease = Date.now();

// Draw rectangle (paddles)
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

// Draw circle (ball)
function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

// Draw net
function drawNet() {
    ctx.fillStyle = "#fff";
    const netWidth = 4;
    const netHeight = 20;
    for (let i = 0; i <= canvasHeight; i += 30) {
        ctx.fillRect(canvasWidth / 2 - netWidth / 2, i, netWidth, netHeight);
    }
}

// Draw everything
function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawNet();
    drawRect(player.x, player.y, player.width, player.height, player.color);
    drawRect(ai.x, ai.y, ai.width, ai.height, ai.color);
    drawCircle(ball.x, ball.y, ball.radius, ball.color);
}

// Control player paddle with mouse
canvas.addEventListener('mousemove', evt => {
    let rect = canvas.getBoundingClientRect();
    let mouseY = evt.clientY - rect.top;
    player.y = mouseY - player.height / 2;

    // Clamp paddle within canvas
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvasHeight) player.y = canvasHeight - player.height;
});

// Simple AI to follow the ball
function moveAI() {
    // Center of paddle
    let aiCenter = ai.y + ai.height / 2;
    if (ball.y < aiCenter - 20) {
        ai.y -= 6;
    } else if (ball.y > aiCenter + 20) {
        ai.y += 6;
    }
    // Clamp paddle within canvas
    if (ai.y < 0) ai.y = 0;
    if (ai.y + ai.height > canvasHeight) ai.y = canvasHeight - ai.height;
}

// Collision detection
function collision(paddle, ball) {
    return (
        ball.x - ball.radius < paddle.x + paddle.width &&
        ball.x + ball.radius > paddle.x &&
        ball.y - ball.radius < paddle.y + paddle.height &&
        ball.y + ball.radius > paddle.y
    );
}

// Reset ball position and speed
function resetBall() {
    ball.x = canvasWidth / 2;
    ball.y = canvasHeight / 2;
    ball.speed = 6; // Reset speed
    ball.velocityX = (ball.velocityX > 0 ? 1 : -1) * ball.speed;
    ball.velocityY = 6 * (Math.random() > 0.5 ? 1 : -1);
    lastSpeedIncrease = Date.now();
}

// Update game state
function update() {
    // Speed up ball over time
    if (Date.now() - lastSpeedIncrease > speedIncreaseInterval) {
        if (Math.abs(ball.velocityX) < maxSpeed && Math.abs(ball.velocityY) < maxSpeed) {
            // Scale velocity
            let velocityAngle = Math.atan2(ball.velocityY, ball.velocityX);
            ball.speed += speedIncreaseAmount;
            ball.velocityX = Math.cos(velocityAngle) * (ball.velocityX > 0 ? 1 : -1) * ball.speed;
            ball.velocityY = Math.sin(velocityAngle) * (ball.velocityY > 0 ? 1 : -1) * ball.speed;
        }
        lastSpeedIncrease = Date.now();
    }

    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Top and bottom wall bounce
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvasHeight) {
        ball.velocityY = -ball.velocityY;
    }

    // Player paddle collision
    if (collision(player, ball)) {
        ball.x = player.x + player.width + ball.radius; // Position ball outside paddle
        // Calculate angle
        let collidePoint = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        let angleRad = collidePoint * (Math.PI / 4); // Max 45 degrees
        let direction = 1;
        ball.speed = Math.min(ball.speed, maxSpeed);
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);
    }

    // AI paddle collision
    if (collision(ai, ball)) {
        ball.x = ai.x - ball.radius; // Position ball outside paddle
        let collidePoint = (ball.y - (ai.y + ai.height / 2)) / (ai.height / 2);
        let angleRad = collidePoint * (Math.PI / 4);
        let direction = -1;
        ball.speed = Math.min(ball.speed, maxSpeed);
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);
    }

    // Left or right wall (reset ball)
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvasWidth) {
        resetBall();
    }

    moveAI();
}

// Game loop
function game() {
    update();
    render();
    requestAnimationFrame(game);
}

// Start the game
game();
