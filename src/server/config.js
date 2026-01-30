/**
 * Server Configuration
 * Central place for all game settings - easy to tweak and extend
 */

module.exports = {
    // Server
    PORT: 3000,
    TICK_RATE: 30,                    // Server updates per second

    // Game Rules
    ROUND_DURATION: 30,               // Seconds per round
    TAG_IMMUNITY_DURATION: 5000,      // Milliseconds of immunity after being tagged
    MIN_PLAYERS: 2,                   // Minimum players to start

    // Player
    MAX_NAME_LENGTH: 12,
    PLAYER_SIZE: 40,
    DEFAULT_COLOR: '#22c55e',

    // World
    WORLD_WIDTH: 2000,
    WORLD_HEIGHT: 1500,

    // Game Modes
    DEFAULT_GAME_MODE: 'tagRoyale',
};
