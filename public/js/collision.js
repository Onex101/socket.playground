/**
 * Collision Detection (Client-side)
 */

import { CONFIG } from './config.js';

/**
 * Checks if two axis-aligned bounding boxes are colliding
 * @param {number} x1 - First box X position
 * @param {number} y1 - First box Y position
 * @param {number} x2 - Second box X position
 * @param {number} y2 - Second box Y position
 * @returns {boolean} True if colliding
 */
export function checkAABB(x1, y1, x2, y2) {
    return (
        x1 < x2 + CONFIG.PLAYER_SIZE &&
        x1 + CONFIG.PLAYER_SIZE > x2 &&
        y1 < y2 + CONFIG.PLAYER_SIZE &&
        y1 + CONFIG.PLAYER_SIZE > y2
    );
}

/**
 * Clamps a position within world bounds
 * @param {number} x - X position
 * @param {number} y - Y position
 * @returns {{ x: number, y: number }} Clamped position
 */
export function clampToWorld(x, y) {
    return {
        x: Math.max(0, Math.min(CONFIG.WORLD_WIDTH - CONFIG.PLAYER_SIZE, x)),
        y: Math.max(0, Math.min(CONFIG.WORLD_HEIGHT - CONFIG.PLAYER_SIZE, y)),
    };
}

/**
 * Checks if a player would collide with any other players
 * @param {number} x - X position to check
 * @param {number} y - Y position to check
 * @param {Object} players - All players
 * @param {string} excludeId - Player ID to exclude
 * @returns {boolean} True if collision would occur
 */
export function wouldCollideWithPlayers(x, y, players, excludeId) {
    for (const other of Object.values(players)) {
        if (other.id === excludeId || !other.alive) continue;

        if (checkAABB(x, y, other.x, other.y)) {
            return true;
        }
    }
    return false;
}
