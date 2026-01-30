/**
 * Room Management
 */

const CONFIG = require('./config');

// Active rooms storage
const rooms = {};

/**
 * Creates a new room with default state
 * @param {string} gameMode - Game mode identifier
 * @returns {Object} New room object
 */
function createRoom(gameMode = CONFIG.DEFAULT_GAME_MODE) {
    return {
        status: 'waiting',       // 'waiting' | 'playing' | 'ended'
        gameMode: gameMode,
        players: {},
        currentIt: null,
        roundEnd: 0,
        roundNumber: 0,
        immuneUntil: 0,
        modeData: {},
    };
}

/**
 * Gets a room by ID
 * @param {string} roomId - Room identifier
 * @returns {Object|null} Room object or null
 */
function getRoom(roomId) {
    return rooms[roomId] || null;
}

/**
 * Gets or creates a room
 * @param {string} roomId - Room identifier
 * @param {string} gameMode - Game mode for new room
 * @returns {Object} Room object
 */
function getOrCreateRoom(roomId, gameMode) {
    if (!rooms[roomId]) {
        rooms[roomId] = createRoom(gameMode);
    }
    return rooms[roomId];
}

/**
 * Deletes a room
 * @param {string} roomId - Room identifier
 */
function deleteRoom(roomId) {
    delete rooms[roomId];
}

/**
 * Gets all active rooms
 * @returns {Object} All rooms
 */
function getAllRooms() {
    return rooms;
}

/**
 * Gets player count in a room
 * @param {string} roomId - Room identifier
 * @returns {number} Player count
 */
function getPlayerCount(roomId) {
    const room = rooms[roomId];
    return room ? Object.keys(room.players).length : 0;
}

/**
 * Checks if a room is empty
 * @param {string} roomId - Room identifier
 * @returns {boolean} True if empty or doesn't exist
 */
function isRoomEmpty(roomId) {
    return getPlayerCount(roomId) === 0;
}

module.exports = {
    createRoom,
    getRoom,
    getOrCreateRoom,
    deleteRoom,
    getAllRooms,
    getPlayerCount,
    isRoomEmpty,
};
