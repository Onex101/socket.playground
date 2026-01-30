/**
 * Input Handling
 */

// Keyboard state
export const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    ArrowUp: false,
    ArrowLeft: false,
    ArrowDown: false,
    ArrowRight: false,
};

/**
 * Initializes input event listeners
 */
export function initInput() {
    window.addEventListener('keydown', (e) => {
        if (e.key in keys) {
            keys[e.key] = true;
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.key in keys) {
            keys[e.key] = false;
        }
    });

    // Prevent arrow keys from scrolling
    window.addEventListener('keydown', (e) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }
    });
}

/**
 * Gets the current movement direction
 * @returns {{ dx: number, dy: number }} Normalized direction
 */
export function getMovementDirection() {
    let dx = 0;
    let dy = 0;

    if (keys.w || keys.ArrowUp) dy -= 1;
    if (keys.s || keys.ArrowDown) dy += 1;
    if (keys.a || keys.ArrowLeft) dx -= 1;
    if (keys.d || keys.ArrowRight) dx += 1;

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
        const length = Math.sqrt(dx * dx + dy * dy);
        dx /= length;
        dy /= length;
    }

    return { dx, dy };
}

/**
 * Checks if any movement key is pressed
 * @returns {boolean}
 */
export function isMoving() {
    return keys.w || keys.a || keys.s || keys.d ||
           keys.ArrowUp || keys.ArrowLeft || keys.ArrowDown || keys.ArrowRight;
}
