/**
 * Player Management
 */

const CONFIG = require('./config');

/**
 * Creates a new player at a random position
 * @param {string} socketId - Player's socket ID
 * @param {string} name - Player's display name
 * @returns {Object} Player object
 */
function createPlayer(socketId, name) {
    const padding = 50;
    return {
        id: socketId,
        name: name.substring(0, CONFIG.MAX_NAME_LENGTH),
        x: Math.random() * (CONFIG.WORLD_WIDTH - padding * 2) + padding,
        y: Math.random() * (CONFIG.WORLD_HEIGHT - padding * 2) + padding,
        color: CONFIG.DEFAULT_COLOR,
        alive: true,
        
        speedMultiplier: 1,
    };
}

/**
 * Gets all alive players in a room
 * @param {Object} room - Room object
 * @returns {Array} Array of alive players
 */
function getAlivePlayers(room) {
    return Object.values(room.players).filter(p => p.alive);
}

/**
 * Gets all alive players except one
 * @param {Object} room - Room object
 * @param {string} excludeId - Player ID to exclude
 * @returns {Array} Array of alive players
 */
function getOtherAlivePlayers(room, excludeId) {
    return Object.values(room.players).filter(p => p.id !== excludeId && p.alive);
}

/**
 * Revives all players in a room
 * @param {Object} room - Room object
 */
function reviveAllPlayers(room) {
    Object.values(room.players).forEach(player => {
        player.alive = true;
        player.speedMultiplier = 1;
    });
}

/**
 * Eliminates a player
 * @param {Object} player - Player to eliminate
 */
function eliminatePlayer(player) {
    if (player) {
        player.alive = false;
    }
}

module.exports = {
    createPlayer,
    getAlivePlayers,
    getOtherAlivePlayers,
    reviveAllPlayers,
    eliminatePlayer,
};
