/**
 * Game State Management
 */

export const state = {
    myId: null,
    myName: 'Player',
    
    game: {
        status: 'waiting',
        players: {},
        roundEnd: 0,
        currentIt: null,
        gameMode: 'tagRoyale',
    },
    
    lastFrameTime: 0,

    camera: { x: 0, y: 0 },
};

/**
 * Updates game state from server
 * @param {Object} newState - State from server
 */
import { updateCamera } from './movement.js';

export function updateGameState(newState) {
    state.game = newState;
    // Center camera on player after state update
    const myPlayer = getMyPlayer();
    if (myPlayer && myPlayer.alive) {
        updateCamera(myPlayer);
    }
}

/**
 * Gets the local player
 * @returns {Object|null} Local player or null
 */
export function getMyPlayer() {
    return state.game.players[state.myId] || null;
}

/**
 * Checks if the local player is "it"
 * @returns {boolean}
 */
export function amIIt() {
    return state.game.currentIt === state.myId;
}

/**
 * Checks if the game is currently playing
 * @returns {boolean}
 */
export function isPlaying() {
    return state.game.status === 'playing';
}
