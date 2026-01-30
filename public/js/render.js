/**
 * Rendering
 */

import { CONFIG, COLORS } from './config.js';
import { state } from './state.js';

// Canvas setup
export const canvas = document.getElementById('gameCanvas');
export const ctx = canvas.getContext('2d');

/**
 * Main render function - draws the entire game
 */
export function render() {
    // Clear canvas
    ctx.fillStyle = COLORS.BACKGROUND;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(-state.camera.x, -state.camera.y);

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

    for (let x = 0; x <= CONFIG.WORLD_WIDTH; x += 100) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CONFIG.WORLD_HEIGHT);
    }

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
    for (const player of Object.values(state.game.players)) {
        if (!player.alive) continue;
        renderPlayer(player);
    }
}

/**
 * Renders a single player
 * @param {Object} player - Player to render
 */
// Cache for loaded images
const playerImageCache = {};

function renderPlayer(player) {
    const isIt = state.game.status === 'playing' && state.game.currentIt === player.id;
    const isMe = player.id === state.myId;

    let color = player.color || COLORS.TEXT;
    let glowColor = 'transparent';

    if (state.game.status === 'playing') {
        color = isIt ? COLORS.PLAYER_IT : COLORS.PLAYER_SAFE;
        glowColor = isIt ? COLORS.PLAYER_GLOW_IT : COLORS.PLAYER_GLOW_SAFE;
    }

    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 20;

    const imageName = player.name?.toLowerCase() + '.png';
    const imagePath = imageName ? `/images/${imageName}` : null;
    let drewImage = false;
    if (player.name && imageName && !playerImageCache[imageName]) {
        const img = new window.Image();
        img.src = imagePath;
        img.onload = () => {
            playerImageCache[imageName] = img;
        };
    }
    const img = playerImageCache[imageName];
    if (img) {
        ctx.drawImage(img, player.x, player.y, CONFIG.PLAYER_SIZE, CONFIG.PLAYER_SIZE);
        drewImage = true;
    }
    if (!drewImage) {
        ctx.fillStyle = color;
        ctx.fillRect(player.x, player.y, CONFIG.PLAYER_SIZE, CONFIG.PLAYER_SIZE);
    }
    ctx.shadowBlur = 0;

    if (isMe) {
        ctx.strokeStyle = COLORS.TEXT;
        ctx.lineWidth = 3;
        ctx.strokeRect(player.x, player.y, CONFIG.PLAYER_SIZE, CONFIG.PLAYER_SIZE);

        ctx.fillStyle = COLORS.TEXT;
        ctx.beginPath();
        ctx.moveTo(player.x + CONFIG.PLAYER_SIZE / 2, player.y - 15);
        ctx.lineTo(player.x + CONFIG.PLAYER_SIZE / 2 - 5, player.y - 25);
        ctx.lineTo(player.x + CONFIG.PLAYER_SIZE / 2 + 5, player.y - 25);
        ctx.closePath();
        ctx.fill();
    }

    ctx.fillStyle = COLORS.TEXT;
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(player.name, player.x + CONFIG.PLAYER_SIZE / 2, player.y - 5);

    if (isIt) {
        ctx.fillStyle = '#ffaaaa';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('IT!', player.x + CONFIG.PLAYER_SIZE / 2, player.y - 35);
    }
}

/**
 * Resizes the canvas to fill the window
 */
export function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
