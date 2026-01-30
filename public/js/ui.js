/**
 * UI Management
 */

import { state } from './state.js';
import { emitJoinGame, emitStartGame } from './socket.js';

/**
 * Initializes UI event handlers
 */
export function initUI() {
    const joinBtn = document.getElementById('join-btn');
    if (joinBtn) {
        joinBtn.addEventListener('click', joinGame);
    }

    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', startGame);
    }

    const nameInput = document.getElementById('player-name');
    const roomInput = document.getElementById('room-name');

    [nameInput, roomInput].forEach(input => {
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') joinGame();
            });
        }
    });
}

/**
 * Joins the game with the entered name and room
 */
export function joinGame() {
    const nameInput = document.getElementById('player-name');
    const roomInput = document.getElementById('room-name');
    const name = nameInput?.value.trim();
    const roomId = roomInput?.value.trim();

    if (!name || !roomId) {
        alert('Please enter your name and a room name!');
        return;
    }

    state.myName = name;

    document.getElementById('login-form').style.display = 'none';
    document.getElementById('waiting-room').classList.remove('hidden');
    document.getElementById('lobby-room-name').innerText = roomId;

    emitJoinGame(name, roomId);
}

/**
 * Requests the server to start the game
 */
export function startGame() {
    emitStartGame();
}

/**
 * Updates the lobby/waiting room UI
 */
export function updateLobbyUI() {
    const playerListEl = document.getElementById('player-list-display');
    const players = Object.values(state.game.players);

    if (playerListEl) {
        playerListEl.innerHTML = players.map(player => `
            <div class="player-item">
                <span>${escapeHtml(player.name)}${player.id === state.myId ? ' (You)' : ''}</span>
                <span class="${player.alive ? 'player-status-ready' : 'player-status-eliminated'}">
                    ${player.alive ? 'Ready' : 'Eliminated'}
                </span>
            </div>
        `).join('');
    }

    const playerCountEl = document.getElementById('player-count');
    if (playerCountEl) {
        playerCountEl.innerText = `${players.length} player${players.length !== 1 ? 's' : ''} connected`;
    }

    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.disabled = players.length < 2;
    }

    const lobbyEl = document.getElementById('lobby');
    if (lobbyEl) {
        if (state.game.status === 'playing') {
            lobbyEl.style.display = 'none';
        } else if (state.game.status === 'ended') {
            setTimeout(() => {
                lobbyEl.style.display = 'flex';
                document.getElementById('waiting-room')?.classList.remove('hidden');
            }, 3000);
        }
    }
}

/**
 * Updates the in-game HUD elements
 */
export function updateHUD() {
    const aliveCount = Object.values(state.game.players).filter(p => p.alive).length;
    
    const aliveEl = document.getElementById('alive-count');
    if (aliveEl) {
        aliveEl.innerText = `Alive: ${aliveCount}`;
    }

    const statusEl = document.getElementById('status-text');
    const timerEl = document.getElementById('timer-display');

    if (state.game.status === 'playing') {
        const timeLeft = Math.max(0, Math.ceil((state.game.roundEnd - Date.now()) / 1000));
        
        if (timerEl) {
            timerEl.innerText = timeLeft;
            
            if (timeLeft <= 5) {
                timerEl.classList.add('timer-critical');
            } else {
                timerEl.classList.remove('timer-critical');
            }
        }

        if (statusEl) {
            statusEl.innerText = 'ROUND IN PROGRESS';
        }
    } else if (state.game.status === 'ended') {
        if (statusEl) {
            statusEl.innerText = 'GAME OVER';
        }
    } else {
        if (statusEl) {
            statusEl.innerText = 'WAITING';
        }
    }
}

/**
 * Shows a toast notification
 * @param {string} message - Message to display
 */
export function showToast(message) {
    const toastEl = document.getElementById('game-message');
    if (!toastEl) return;

    toastEl.innerText = message;
    toastEl.classList.add('show-toast');

    setTimeout(() => {
        toastEl.classList.remove('show-toast');
    }, 2000);
}

/**
 * Escapes HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
