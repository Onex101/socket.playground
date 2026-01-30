/**
 * Player Movement
 */

import { CONFIG } from './config.js';
import { state, getMyPlayer, isPlaying } from './state.js';
import { getMovementDirection, isMoving } from './input.js';
import { clampToWorld, wouldCollideWithPlayers } from './collision.js';
import { emitMove } from './socket.js';
import { canvas } from './render.js';

/**
 * Updates player movement based on input
 * @param {number} deltaTime - Time since last frame in seconds
 */
export function updateMovement(deltaTime) {
    const myPlayer = getMyPlayer();

    // Skip if player doesn't exist, is dead, or game isn't active
    if (!myPlayer || !myPlayer.alive) return;
    if (!isPlaying()) return;

    // Skip if delta time is invalid (first frame or tab was inactive)
    if (deltaTime <= 0 || deltaTime > CONFIG.MAX_DELTA_TIME) return;

    // Check if moving
    if (!isMoving()) return;

    // Get movement direction
    const { dx, dy } = getMovementDirection();
    if (dx === 0 && dy === 0) return;

    // Calculate movement
    const moveX = dx * CONFIG.MOVE_SPEED * deltaTime;
    const moveY = dy * CONFIG.MOVE_SPEED * deltaTime;

    // Calculate new position with bounds clamping
    const { x: newX, y: newY } = clampToWorld(
        myPlayer.x + moveX,
        myPlayer.y + moveY
    );

    // Check for collisions with other players
    const hasCollision = wouldCollideWithPlayers(
        newX, newY,
        state.game.players,
        state.myId
    );

    // Always send position to server (for tag detection)
    emitMove(newX, newY);

    // Only update local position if no collision
    if (!hasCollision) {
        myPlayer.x = newX;
        myPlayer.y = newY;
    }

    // Update camera to follow player
    updateCamera(myPlayer);
}

/**
 * Updates camera position to follow a player
 * @param {Object} player - Player to follow
 */
export function updateCamera(player) {
    state.camera.x = Math.max(0, Math.min(
        CONFIG.WORLD_WIDTH - canvas.width,
        player.x - canvas.width / 2
    ));
    state.camera.y = Math.max(0, Math.min(
        CONFIG.WORLD_HEIGHT - canvas.height,
        player.y - canvas.height / 2
    ));
}
