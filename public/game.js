/**
 * Tag Royale - Client
 * 
 * Handles rendering, input, and communication with the game server.
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
    PLAYER_SIZE: 40,
    MOVE_SPEED: 300,      // Pixels per second (frame-rate independent)
    WORLD_WIDTH: 2000,
    WORLD_HEIGHT: 1500,
    MAX_DELTA_TIME: 0.1,  // Skip updates if frame took too long (e.g., tab inactive)
};

const COLORS = {
    BACKGROUND: '#1a1a1a',
    GRID: '#333',
    BORDER: '#ff0000',
    PLAYER_SAFE: '#22c55e',
    PLAYER_IT: '#ef4444',
    PLAYER_GLOW_SAFE: 'rgba(34, 197, 94, 0.4)',
    PLAYER_GLOW_IT: 'rgba(239, 68, 68, 0.6)',
    TEXT: '#fff',
};

// =============================================================================
// GAME STATE
// =============================================================================

const socket = io();

let gameState = {
    status: 'waiting',
    players: {},
    roundEnd: 0,
    currentIt: null,
};

let myId = null;
let myName = 'Player';
let lastFrameTime = 0;

// Input tracking
const keys = {
    w: false, a: false, s: false, d: false,
    ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false,
};

// Canvas and camera
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let camera = { x: 0, y: 0 };

// =============================================================================
// SOCKET EVENT HANDLERS
// =============================================================================

socket.on('connect', () => {
    myId = socket.id;
    console.log('[Connected] Socket ID:', myId);
});

socket.on('gameState', (state) => {
    gameState = state;
    updateLobbyUI();
    updateHUD();
});

socket.on('gameEvent', (event) => {
    showToast(event.message);
});

// =============================================================================
// GAME ACTIONS
// =============================================================================

/**
 * Joins the game with the entered name and room
 */
function joinGame() {
    const nameInput = document.getElementById('player-name');
    const roomInput = document.getElementById('room-name');
    const name = nameInput.value.trim();
    const roomId = roomInput.value.trim();

    if (!name || !roomId) {
        alert('Please enter your name and a room name!');
        return;
    }

    myName = name;

    document.getElementById('login-form').style.display = 'none';
    document.getElementById('waiting-room').classList.remove('hidden');
    document.getElementById('lobby-room-name').innerText = roomId;

    socket.emit('joinGame', { name, roomId });
}

/**
 * Requests the server to start the game
 */
function startGame() {
    socket.emit('startGame');
}

// =============================================================================
// UI UPDATES
// =============================================================================

/**
 * Updates the lobby/waiting room UI
 */
function updateLobbyUI() {
    const playerListEl = document.getElementById('player-list-display');
    const players = Object.values(gameState.players);

    // Render player list
    playerListEl.innerHTML = players.map(player => `
        <div class="player-item">
            <span>${player.name}${player.id === myId ? ' (You)' : ''}</span>
            <span class="${player.alive ? 'player-status-ready' : 'player-status-eliminated'}">
                ${player.alive ? 'Ready' : 'Eliminated'}
            </span>
        </div>
    `).join('');

    document.getElementById('player-count').innerText = `${players.length} player${players.length !== 1 ? 's' : ''} connected`;
    document.getElementById('start-btn').disabled = players.length < 2;

    if (gameState.status === 'playing') {
        document.getElementById('lobby').style.display = 'none';
    } else if (gameState.status === 'ended') {
        setTimeout(() => {
            document.getElementById('lobby').style.display = 'flex';
            document.getElementById('waiting-room').classList.remove('hidden');
        }, 3000);
    }
}

/**
 * Updates the in-game HUD elements
 */
function updateHUD() {
    const aliveCount = Object.values(gameState.players).filter(p => p.alive).length;
    document.getElementById('alive-count').innerText = `Alive: ${aliveCount}`;

    const statusEl = document.getElementById('status-text');
    const timerEl = document.getElementById('timer-display');

    if (gameState.status === 'playing') {
        const timeLeft = Math.max(0, Math.ceil((gameState.roundEnd - Date.now()) / 1000));
        timerEl.innerText = timeLeft;

        // Add critical styling when time is low
        if (timeLeft <= 5) {
            timerEl.classList.add('timer-critical');
        } else {
            timerEl.classList.remove('timer-critical');
        }

        statusEl.innerText = 'ROUND IN PROGRESS';
    } else if (gameState.status === 'ended') {
        statusEl.innerText = 'GAME OVER';
    } else {
        statusEl.innerText = 'WAITING';
    }
}

// =============================================================================
// GAME LOOP
// =============================================================================

/**
 * Main game loop - called every frame via requestAnimationFrame
 */
function gameLoop(currentTime) {
    // Calculate delta time in seconds for frame-rate independent movement
    const deltaTime = lastFrameTime ? (currentTime - lastFrameTime) / 1000 : 0;
    lastFrameTime = currentTime;

    updateMovement(deltaTime);
    render();

    requestAnimationFrame(gameLoop);
}

/**
 * Handles local player movement and sends updates to server
 */
function updateMovement(deltaTime) {
    const myPlayer = gameState.players[myId];

    // Skip if player doesn't exist, is dead, or game isn't active
    if (!myPlayer || !myPlayer.alive) return;
    if (gameState.status !== 'playing') return;

    // Skip if delta time is invalid (first frame or tab was inactive)
    if (deltaTime <= 0 || deltaTime > CONFIG.MAX_DELTA_TIME) return;

    // Calculate movement direction from input
    let dx = 0;
    let dy = 0;

    if (keys.w || keys.ArrowUp) dy -= 1;
    if (keys.s || keys.ArrowDown) dy += 1;
    if (keys.a || keys.ArrowLeft) dx -= 1;
    if (keys.d || keys.ArrowRight) dx += 1;

    // Apply movement if there's input
    if (dx !== 0 || dy !== 0) {
        // Normalize diagonal movement
        const length = Math.sqrt(dx * dx + dy * dy);
        dx = (dx / length) * CONFIG.MOVE_SPEED * deltaTime;
        dy = (dy / length) * CONFIG.MOVE_SPEED * deltaTime;

        // Calculate new position with bounds clamping
        const newX = Math.max(0, Math.min(CONFIG.WORLD_WIDTH - CONFIG.PLAYER_SIZE, myPlayer.x + dx));
        const newY = Math.max(0, Math.min(CONFIG.WORLD_HEIGHT - CONFIG.PLAYER_SIZE, myPlayer.y + dy));

        // Check for collisions with other players
        let hasCollision = false;

        for (const other of Object.values(gameState.players)) {
            if (other.id === myId || !other.alive) continue;

            if (isColliding(newX, newY, other.x, other.y)) {
                hasCollision = true;
                break;
            }
        }

        // Always send position to server (for tag detection)
        socket.emit('playerMove', { x: newX, y: newY });

        // Only update local position if no collision
        if (!hasCollision) {
            myPlayer.x = newX;
            myPlayer.y = newY;
        }
    }

    // Update camera to follow player
    updateCamera(myPlayer);
}

/**
 * Checks if two players are colliding (AABB collision)
 */
function isColliding(x1, y1, x2, y2) {
    return (
        x1 < x2 + CONFIG.PLAYER_SIZE &&
        x1 + CONFIG.PLAYER_SIZE > x2 &&
        y1 < y2 + CONFIG.PLAYER_SIZE &&
        y1 + CONFIG.PLAYER_SIZE > y2
    );
}

/**
 * Updates camera position to follow the player
 */
function updateCamera(player) {
    camera.x = Math.max(0, Math.min(CONFIG.WORLD_WIDTH - canvas.width, player.x - canvas.width / 2));
    camera.y = Math.max(0, Math.min(CONFIG.WORLD_HEIGHT - canvas.height, player.y - canvas.height / 2));
}

// =============================================================================
// RENDERING
// =============================================================================

/**
 * Main render function - draws the entire game
 */
function render() {
    // Clear canvas
    ctx.fillStyle = COLORS.BACKGROUND;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply camera transform
    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    renderGrid();
    renderBorder();
    renderPlayers();

    ctx.restore();
}

/**
 * Renders the background grid
 */
function renderGrid() {
    ctx.strokeStyle = COLORS.GRID;
    ctx.lineWidth = 2;
    ctx.beginPath();

    // Vertical lines
    for (let x = 0; x <= CONFIG.WORLD_WIDTH; x += 100) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CONFIG.WORLD_HEIGHT);
    }

    // Horizontal lines
    for (let y = 0; y <= CONFIG.WORLD_HEIGHT; y += 100) {
        ctx.moveTo(0, y);
        ctx.lineTo(CONFIG.WORLD_WIDTH, y);
    }

    ctx.stroke();
}

/**
 * Renders the world border
 */
function renderBorder() {
    ctx.strokeStyle = COLORS.BORDER;
    ctx.lineWidth = 5;
    ctx.strokeRect(0, 0, CONFIG.WORLD_WIDTH, CONFIG.WORLD_HEIGHT);
}

/**
 * Renders all players
 */
function renderPlayers() {
    for (const player of Object.values(gameState.players)) {
        if (!player.alive) continue;
        renderPlayer(player);
    }
}

/**
 * Renders a single player
 */
function renderPlayer(player) {
    const isIt = gameState.status === 'playing' && gameState.currentIt === player.id;
    const isMe = player.id === myId;

    // Determine colors based on state
    let color = player.color || COLORS.TEXT;
    let glowColor = 'transparent';

    if (gameState.status === 'playing') {
        color = isIt ? COLORS.PLAYER_IT : COLORS.PLAYER_SAFE;
        glowColor = isIt ? COLORS.PLAYER_GLOW_IT : COLORS.PLAYER_GLOW_SAFE;
    }

    // Draw player with glow
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 20;
    ctx.fillStyle = color;
    ctx.fillRect(player.x, player.y, CONFIG.PLAYER_SIZE, CONFIG.PLAYER_SIZE);
    ctx.shadowBlur = 0;

    // Draw outline and indicator for local player
    if (isMe) {
        ctx.strokeStyle = COLORS.TEXT;
        ctx.lineWidth = 3;
        ctx.strokeRect(player.x, player.y, CONFIG.PLAYER_SIZE, CONFIG.PLAYER_SIZE);

        // Draw pointer triangle above player
        ctx.fillStyle = COLORS.TEXT;
        ctx.beginPath();
        ctx.moveTo(player.x + CONFIG.PLAYER_SIZE / 2, player.y - 15);
        ctx.lineTo(player.x + CONFIG.PLAYER_SIZE / 2 - 5, player.y - 25);
        ctx.lineTo(player.x + CONFIG.PLAYER_SIZE / 2 + 5, player.y - 25);
        ctx.closePath();
        ctx.fill();
    }

    // Draw player name
    ctx.fillStyle = COLORS.TEXT;
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(player.name, player.x + CONFIG.PLAYER_SIZE / 2, player.y - 5);

    // Draw "IT!" label
    if (isIt) {
        ctx.fillStyle = '#ffaaaa';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('IT!', player.x + CONFIG.PLAYER_SIZE / 2, player.y - 35);
    }
}

// =============================================================================
// UTILITIES
// =============================================================================

/**
 * Resizes the canvas to fill the window
 */
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

/**
 * Shows a toast notification
 */
function showToast(message) {
    const toastEl = document.getElementById('game-message');
    toastEl.innerText = message;
    toastEl.classList.add('show-toast');

    setTimeout(() => {
        toastEl.classList.remove('show-toast');
    }, 2000);
}

// =============================================================================
// INITIALIZATION
// =============================================================================

// Input listeners
window.addEventListener('keydown', (e) => {
    if (e.key in keys) {
        keys[e.key] = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key in keys) {
        keys[e.key] = false;
    }
});

// Window resize handler
window.addEventListener('resize', resizeCanvas);

// Initial setup
resizeCanvas();
requestAnimationFrame(gameLoop);
