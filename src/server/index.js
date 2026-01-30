/**
 * Tag Royale - Server Entry Point
 * 
 * A multiplayer tag game where players try to avoid being "it" when the timer runs out.
 * The player who is "it" at the end of each round is eliminated.
 * Last player standing wins!
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Import modules
const CONFIG = require('./config');
const broadcast = require('./broadcast');
const socketHandlers = require('./socketHandlers');
const gameLoop = require('./gameLoop');

// =============================================================================
// SERVER SETUP
// =============================================================================

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files
app.use(express.static(path.join(__dirname, '../../public')));

// Initialize broadcast module with Socket.IO
broadcast.init(io);

// Setup socket event handlers
socketHandlers.setup(io);

// Start game loop
gameLoop.start();

// =============================================================================
// START SERVER
// =============================================================================

server.listen(CONFIG.PORT, () => {
    console.log('');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                    TAG ROYALE SERVER                      ║');
    console.log('╠═══════════════════════════════════════════════════════════╣');
    console.log(`║  Status:    Running                                       ║`);
    console.log(`║  Port:      ${CONFIG.PORT}                                          ║`);
    console.log(`║  URL:       http://localhost:${CONFIG.PORT}                         ║`);
    console.log(`║  Tick Rate: ${CONFIG.TICK_RATE}/sec                                        ║`);
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n[Server] Shutting down...');
    gameLoop.stop();
    // Close Socket.IO server
    io.close(() => {
        // Then close HTTP server
        server.close(() => {
            console.log('[Server] Closed');
            process.exit(0);
        });
    });
});
