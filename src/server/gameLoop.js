/**
 * Game Loop
 * Runs at configured tick rate to update game state
 */

const CONFIG = require('./config');
const rooms = require('./rooms');
const broadcast = require('./broadcast');
const gameModes = require('./gameModes');

let loopInterval = null;

/**
 * Starts the game loop
 */
function start() {
    if (loopInterval) {
        console.warn('[GameLoop] Already running');
        return;
    }

    loopInterval = setInterval(tick, 1000 / CONFIG.TICK_RATE);
    console.log(`[GameLoop] Started at ${CONFIG.TICK_RATE} ticks/second`);
}

/**
 * Stops the game loop
 */
function stop() {
    if (loopInterval) {
        clearInterval(loopInterval);
        loopInterval = null;
        console.log('[GameLoop] Stopped');
    }
}

/**
 * Single game loop tick
 */
function tick() {
    const now = Date.now();
    const allRooms = rooms.getAllRooms();

    Object.entries(allRooms).forEach(([roomId, room]) => {
        if (room.status !== 'playing') return;

        // Run game mode tick
        const mode = gameModes.getGameMode(room.gameMode);
        if (mode && mode.tick) {
            mode.tick(room, roomId, now);
        }

        // Broadcast current state to all clients
        broadcast.sendState(roomId, room);
    });
}

module.exports = {
    start,
    stop,
    tick,
};
