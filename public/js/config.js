/**
 * Client Configuration
 * Central place for all client-side settings
 */

export const CONFIG = {
    PLAYER_SIZE: 40,
    MOVE_SPEED: 300,        // Pixels per second (frame-rate independent)
    WORLD_WIDTH: 2000,
    WORLD_HEIGHT: 1500,
    MAX_DELTA_TIME: 0.1,    // Skip updates if frame took too long
};

export const COLORS = {
    BACKGROUND: '#1a1a1a',
    GRID: '#333',
    BORDER: '#ff0000',
    PLAYER_SAFE: '#22c55e',
    PLAYER_IT: '#ef4444',
    PLAYER_GLOW_SAFE: 'rgba(34, 197, 94, 0.4)',
    PLAYER_GLOW_IT: 'rgba(239, 68, 68, 0.6)',
    TEXT: '#fff',
};
