/**
 * Tag Royale Game Mode
 * 
 * Rules:
 * - One player is "it" at all times
 * - "It" player tries to tag others
 * - When timer runs out, whoever is "it" gets eliminated
 * - Last player standing wins
 */

const CONFIG = require('../config');
const { getOtherAlivePlayers, eliminatePlayer } = require('../players');
const broadcast = require('../broadcast');

const MODE_INFO = {
    name: 'Tag Royale',
    description: 'Avoid being "it" when the timer runs out or get eliminated!',
    minPlayers: 2,
    maxPlayers: 20,
};

/**
 * Initializes the game mode for a room
 * @param {Object} room - Room object
 * @param {string[]} playerIds - Array of player IDs
 */
function initialize(room, playerIds) {
    // Select random player to be "it"
    const randomItId = playerIds[Math.floor(Math.random() * playerIds.length)];

    room.status = 'playing';
    room.currentIt = randomItId;
    room.roundEnd = Date.now() + (CONFIG.ROUND_DURATION * 1000);
    room.roundNumber = 1;
    room.immuneUntil = 0;

    return randomItId;
}

/**
 * Handles a tag between two players
 * @param {Object} room - Room object
 * @param {string} taggerId - ID of the player doing the tagging
 * @param {string} taggedId - ID of the player being tagged
 * @param {string} roomId - Room identifier (for broadcasting)
 * @returns {boolean} True if tag was successful
 */
function handleTag(room, taggerId, taggedId, roomId) {
    const now = Date.now();

    // Check immunity
    if (now < room.immuneUntil) {
        return false;
    }

    // Verify tagger is "it"
    if (room.currentIt !== taggerId) {
        return false;
    }

    const tagger = room.players[taggerId];
    const tagged = room.players[taggedId];

    if (!tagger || !tagged) {
        return false;
    }

    // Transfer "it" status
    room.currentIt = taggedId;
    room.immuneUntil = now + CONFIG.TAG_IMMUNITY_DURATION;

    // Broadcast tag event
    broadcast.sendEvent(roomId, 'tag', `${tagger.name} tagged ${tagged.name}!`);

    console.log(`[Tag] ${tagger.name} → ${tagged.name}`);
    return true;
}

/**
 * Handles the end of a round
 * @param {Object} room - Room object
 * @param {string} roomId - Room identifier
 * @param {number} now - Current timestamp
 */
function handleRoundEnd(room, roomId, now) {
    const eliminatedId = room.currentIt;
    const eliminatedPlayer = room.players[eliminatedId];
    const survivors = getOtherAlivePlayers(room, eliminatedId);

    // Eliminate the player who was "it"
    if (eliminatedPlayer) {
        eliminatePlayer(eliminatedPlayer);
        broadcast.sendEvent(roomId, 'elimination', `${eliminatedPlayer.name} was eliminated!`);
        console.log(`[Eliminate] ${eliminatedPlayer.name} in ${roomId}`);
    }

    // Check if game should end
    if (survivors.length <= 1) {
        room.status = 'ended';

        if (survivors.length === 1) {
            const winner = survivors[0];
            broadcast.sendEvent(roomId, 'winner', `${winner.name} wins!`);
            console.log(`[Winner] ${winner.name} in ${roomId}`);
        }
    } else {
        // Start next round with random "it"
        const nextIt = survivors[Math.floor(Math.random() * survivors.length)];
        room.currentIt = nextIt.id;
        room.roundEnd = now + (CONFIG.ROUND_DURATION * 1000);
        room.roundNumber++;
        room.immuneUntil = 0;

        broadcast.sendEvent(roomId, 'newRound', `Round ${room.roundNumber}! ${nextIt.name} is IT!`);
        console.log(`[Round ${room.roundNumber}] ${roomId} - "${nextIt.name}" is IT`);
    }
}

/**
 * Game loop tick for this mode
 * @param {Object} room - Room object
 * @param {string} roomId - Room identifier
 * @param {number} now - Current timestamp
 */
function tick(room, roomId, now) {
    // Check for round timeout
    if (now >= room.roundEnd) {
        handleRoundEnd(room, roomId, now);
    }
}

module.exports = {
    MODE_INFO,
    initialize,
    handleTag,
    handleRoundEnd,
    tick,
};
