/**
 * Socket Event Handlers
 */

const CONFIG = require('./config');
const rooms = require('./rooms');
const players = require('./players');
const collision = require('./collision');
const broadcast = require('./broadcast');
const gameModes = require('./gameModes');

/**
 * Sets up all socket event handlers
 * @param {Object} io - Socket.IO server instance
 */
function setup(io) {
    io.on('connection', (socket) => {
        console.log(`[Connect] Player connected: ${socket.id}`);
        let currentRoomId = null;

        // ---------------------------------------------------------------------
        // JOIN GAME
        // ---------------------------------------------------------------------
        socket.on('joinGame', ({ name, roomId, gameMode }) => {
            roomId = roomId.toLowerCase().trim();
            gameMode = gameMode || CONFIG.DEFAULT_GAME_MODE;
            currentRoomId = roomId;
            socket.join(roomId);

            // Get or create room
            const room = rooms.getOrCreateRoom(roomId, gameMode);
            
            if (!rooms.getRoom(roomId)) {
                console.log(`[Room] Created new room: ${roomId} (mode: ${gameMode})`);
            }

            // Add player to room
            room.players[socket.id] = players.createPlayer(socket.id, name);
            console.log(`[Join] ${name} joined room: ${roomId}`);

            broadcast.sendState(roomId, room);
        });

        // ---------------------------------------------------------------------
        // PLAYER MOVEMENT
        // ---------------------------------------------------------------------
        socket.on('playerMove', (input) => {
            const room = rooms.getRoom(currentRoomId);
            if (!room || !room.players[socket.id]) return;

            const player = room.players[socket.id];
            if (!player.alive) return;

            // Validate and clamp position
            const { x: newX, y: newY } = collision.clampToWorld(input.x, input.y);
            const now = Date.now();

            // Check collisions with other players
            let hasCollision = false;
            let tagResult = null;

            for (const other of players.getOtherAlivePlayers(room, socket.id)) {
                if (collision.checkAABB(newX, newY, other.x, other.y)) {
                    hasCollision = true;

                    // Handle tagging if game is active
                    if (room.status === 'playing') {
                        const mode = gameModes.getGameMode(room.gameMode);
                        
                        if (mode && now >= room.immuneUntil) {
                            if (room.currentIt === socket.id) {
                                // This player is "it" and tagged someone
                                if (mode.handleTag(room, socket.id, other.id, currentRoomId)) {
                                    tagResult = true;
                                }
                            } else if (room.currentIt === other.id) {
                                // This player was tagged by "it"
                                if (mode.handleTag(room, other.id, socket.id, currentRoomId)) {
                                    tagResult = true;
                                }
                            }
                        }
                    }
                    break;
                }
            }

            // Broadcast state if tag occurred
            if (tagResult) {
                broadcast.sendState(currentRoomId, room);
            }

            // Update position only if no collision
            if (!hasCollision) {
                player.x = newX;
                player.y = newY;
            }
        });

        // ---------------------------------------------------------------------
        // START GAME
        // ---------------------------------------------------------------------
        socket.on('startGame', () => {
            const room = rooms.getRoom(currentRoomId);
            if (!room) return;

            const playerIds = Object.keys(room.players);

            // Require minimum players
            if (playerIds.length < CONFIG.MIN_PLAYERS) {
                console.log(`[Start] Not enough players in ${currentRoomId}`);
                return;
            }

            // Revive all players
            players.reviveAllPlayers(room);

            // Initialize game mode
            const mode = gameModes.getGameMode(room.gameMode);
            if (mode) {
                const itPlayer = mode.initialize(room, playerIds);
                console.log(`[Start] Game started in ${currentRoomId}. "${room.players[itPlayer].name}" is IT`);
            }

            broadcast.sendState(currentRoomId, room);
        });

        // ---------------------------------------------------------------------
        // DISCONNECT
        // ---------------------------------------------------------------------
        socket.on('disconnect', () => {
            console.log(`[Disconnect] Player left: ${socket.id}`);

            const room = rooms.getRoom(currentRoomId);
            if (!room) return;

            delete room.players[socket.id];

            // Clean up empty rooms
            if (rooms.isRoomEmpty(currentRoomId)) {
                rooms.deleteRoom(currentRoomId);
                console.log(`[Room] Deleted empty room: ${currentRoomId}`);
            } else {
                broadcast.sendState(currentRoomId, room);
            }
        });
    });
}

module.exports = { setup };
