/**
 * Socket Communication
 */

import { state, updateGameState } from './state.js';
import { updateLobbyUI, updateHUD, showToast } from './ui.js';

// Socket.IO connection
export const socket = io();

/**
 * Initializes socket event handlers
 */
export function initSocket() {
    socket.on('connect', () => {
        state.myId = socket.id;
        console.log('[Connected] Socket ID:', state.myId);
    });

    socket.on('gameState', (newState) => {
        updateGameState(newState);
        updateLobbyUI();
        updateHUD();
    });

    socket.on('gameEvent', (event) => {
        showToast(event.message);
        
        switch (event.type) {
            case 'tag':
                break;
            case 'elimination':
                break;
            case 'winner':
                break;
        }
    });

    socket.on('disconnect', () => {
        console.log('[Disconnected]');
        showToast('Disconnected from server');
    });
}

/**
 * Sends a join game request
 * @param {string} name - Player name
 * @param {string} roomId - Room to join
 * @param {string} gameMode - Game mode (optional)
 */
export function emitJoinGame(name, roomId, gameMode = 'tagRoyale') {
    socket.emit('joinGame', { name, roomId, gameMode });
}

/**
 * Sends a start game request
 */
export function emitStartGame() {
    socket.emit('startGame');
}

/**
 * Sends player movement to server
 * @param {number} x - New X position
 * @param {number} y - New Y position
 */
export function emitMove(x, y) {
    socket.emit('playerMove', { x, y });
}
