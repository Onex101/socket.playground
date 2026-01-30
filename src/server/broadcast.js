/**
 * Broadcasting Utilities
 * Handles sending messages to clients
 */

let io = null;

/**
 * Initializes the broadcast module with Socket.IO instance
 * @param {Object} socketIo - Socket.IO server instance
 */
function init(socketIo) {
    io = socketIo;
}

/**
 * Broadcasts game state to all clients in a room
 * @param {string} roomId - Room identifier
 * @param {Object} room - Room state object
 */
function sendState(roomId, room) {
    if (io && room) {
        io.to(roomId).emit('gameState', room);
    }
}

/**
 * Sends a game event to all clients in a room
 * @param {string} roomId - Room identifier
 * @param {string} type - Event type
 * @param {string} message - Event message
 * @param {Object} data - Additional event data
 */
function sendEvent(roomId, type, message, data = {}) {
    if (io) {
        io.to(roomId).emit('gameEvent', { type, message, ...data });
    }
}

/**
 * Sends a message to a specific socket
 * @param {string} socketId - Target socket ID
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
function sendToSocket(socketId, event, data) {
    if (io) {
        io.to(socketId).emit(event, data);
    }
}

module.exports = {
    init,
    sendState,
    sendEvent,
    sendToSocket,
};
