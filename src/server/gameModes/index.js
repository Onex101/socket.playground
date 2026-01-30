/**
 * Game Mode Registry
 * 
 * Add new game modes by:
 * 1. Creating a new file in this folder (e.g., freezeTag.js)
 * 2. Importing and registering it here
 */

const tagRoyale = require('./tagRoyale');

// Registry of all available game modes
const gameModes = {
    tagRoyale,
    // Add more game modes here:
    // freezeTag: require('./freezeTag'),
    // infection: require('./infection'),
};

/**
 * Gets a game mode by name
 * @param {string} modeName - Game mode identifier
 * @returns {Object|null} Game mode object or null
 */
function getGameMode(modeName) {
    return gameModes[modeName] || null;
}

/**
 * Gets all available game mode names
 * @returns {string[]} Array of game mode names
 */
function getAvailableModes() {
    return Object.keys(gameModes);
}

/**
 * Registers a new game mode
 * @param {string} name - Game mode identifier
 * @param {Object} mode - Game mode implementation
 */
function registerMode(name, mode) {
    gameModes[name] = mode;
}

module.exports = {
    getGameMode,
    getAvailableModes,
    registerMode,
    tagRoyale,
};
