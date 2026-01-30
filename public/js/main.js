/**
 * Tag Royale - Client Entry Point
 * 
 * Initializes all modules and starts the game loop.
 */

import { state } from './state.js';
import { initSocket } from './socket.js';
import { initInput } from './input.js';
import { initUI } from './ui.js';
import { updateMovement } from './movement.js';
import { render, resizeCanvas } from './render.js';

// =============================================================================
// GAME LOOP
// =============================================================================

/**
 * Main game loop - called every frame via requestAnimationFrame
 * @param {number} currentTime - Current timestamp from requestAnimationFrame
 */
function gameLoop(currentTime) {
    // Calculate delta time in seconds for frame-rate independent movement
    const deltaTime = state.lastFrameTime ? (currentTime - state.lastFrameTime) / 1000 : 0;
    state.lastFrameTime = currentTime;

    // Update
    updateMovement(deltaTime);

    // Render
    render();

    // Continue loop
    requestAnimationFrame(gameLoop);
}

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Initializes the game
 */
function init() {
    console.log('[Game] Initializing...');

    // Initialize modules
    initSocket();
    initInput();
    initUI();

    // Setup window resize handler
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Start game loop
    requestAnimationFrame(gameLoop);

    console.log('[Game] Ready!');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
