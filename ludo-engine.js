/**
 * Comprehensive Ludo Game Engine
 * Implements core game state management with mathematical path system
 */

// Game Constants
const GAME_CONSTANTS = {
    COLORS: ['red', 'blue', 'green', 'yellow'],
    MAIN_TRACK_SIZE: 52,
    HOME_COLUMN_SIZE: 6,
    TOTAL_PATH_LENGTH: 57, // 52 main + 5 home squares (0-56)
    TOKENS_PER_PLAYER: 4,
    DICE_FACES: 6,
    SAFE_SQUARES: [0, 8, 13, 21, 26, 34, 39, 47], // Safe positions on main track
    START_POSITIONS: {
        red: 0,
        blue: 13,
        green: 26,
        yellow: 39
    }
};

/**
 * Core Game State Management Class
 * Tracks all game data and provides state manipulation methods
 */
class LudoGameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.diceValue = null;
        this.diceRolled = false;
        this.gamePhase = 'setup'; // setup, active, finished
        this.winner = null;
        this.finishOrder = [];
        this.extraTurn = false;
        this.moveHistory = [];
        this.sixRollCount = 0; // Track consecutive 6s
        this.lastMove = null;
    }

    /**
     * Initialize players for the game
     * @param {number} playerCount - Number of players (2-4)
     * @param {Array} playerTypes - Array of player types ['human', 'computer']
     */
    initializePlayers(playerCount, playerTypes = []) {
        this.players = [];
        
        for (let i = 0; i < playerCount; i++) {
            const color = GAME_CONSTANTS.COLORS[i];
            const player = {
                id: i,
                color: color,
                type: playerTypes[i] || 'human',
                tokens: this.createTokens(color),
                isFinished: false,
                finishPosition: null
            };
            this.players.push(player);
        }
        
        this.currentPlayerIndex = 0;
        this.gamePhase = 'active';
    }

    /**
     * Create initial token positions for a player
     * @param {string} color - Player color
     * @returns {Array} Array of token objects
     */
    createTokens(color) {
        const tokens = [];
        for (let i = 0; i < GAME_CONSTANTS.TOKENS_PER_PLAYER; i++) {
            tokens.push({
                id: i,
                position: -1, // -1 means in starting area
                isInHome: false,
                isFinished: false,
                color: color
            });
        }
        return tokens;
    }

    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    /**
     * Advance to next player's turn
     */
    nextTurn() {
        if (this.extraTurn) {
            this.extraTurn = false;
            return;
        }

        // Skip finished players
        do {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        } while (this.players[this.currentPlayerIndex].isFinished);

        this.diceRolled = false;
        this.diceValue = null;
        this.sixRollCount = 0;
    }

    /**
     * Check if game is finished
     * @returns {boolean} True if game is over
     */
    isGameFinished() {
        const finishedPlayers = this.players.filter(p => p.isFinished);
        return finishedPlayers.length >= this.players.length - 1;
    }

    /**
     * Mark a player as finished and update finish order
     * @param {number} playerId - Player ID
     */
    finishPlayer(playerId) {
        const player = this.players[playerId];
        if (!player.isFinished) {
            player.isFinished = true;
            player.finishPosition = this.finishOrder.length + 1;
            this.finishOrder.push(playerId);
            
            if (this.isGameFinished()) {
                this.gamePhase = 'finished';
                this.winner = this.finishOrder[0];
            }
        }
    }
}

/**
 * Board Logic and Path Calculation System
 */
class LudoBoard {
    constructor() {
        this.mainTrack = this.generateMainTrack();
        this.validateMainTrack(this.mainTrack);
        this.homeColumns = this.generateHomeColumns();
        this.safeSquares = new Set(GAME_CONSTANTS.SAFE_SQUARES);
    }

    validateMainTrack(track) {
        const coordKeys = track.map(p => `${p.x},${p.y}`);
        const unique = new Set(coordKeys);

        if (track.length !== GAME_CONSTANTS.MAIN_TRACK_SIZE || unique.size !== track.length) {
            console.error('Invalid main track generated', {
                expectedLength: GAME_CONSTANTS.MAIN_TRACK_SIZE,
                actualLength: track.length,
                uniqueSquares: unique.size
            });
        }
    }

    /**
     * Generate the main track coordinates (52 squares around perimeter)
     * @returns {Array} Array of position objects with x,y coordinates
     */
    generateMainTrack() {
        const track = [];
        const boardSize = 15;
        
        // Right side going up (red start)
        for (let y = 1; y <= 5; y++) track.push({x: 6, y: y});
        
        // Top side going left
        for (let x = 5; x >= 0; x--) track.push({x: x, y: 6});
        
        // Left side going down
        for (let y = 7; y <= 8; y++) track.push({x: 0, y: y});
        
        // Continue left side
        for (let y = 8; y >= 6; y--) track.push({x: 1, y: y});
        for (let x = 2; x <= 6; x++) track.push({x: x, y: 8});
        
        // Bottom section
        for (let y = 9; y <= 14; y++) track.push({x: 6, y: y});
        for (let x = 7; x <= 8; x++) track.push({x: x, y: 14});
        
        // Right side going up
        for (let y = 13; y >= 9; y--) track.push({x: 8, y: y});
        for (let x = 9; x <= 14; x++) track.push({x: x, y: 8});
        
        // Top section
        for (let y = 7; y >= 6; y--) track.push({x: 14, y: y});
        for (let x = 13; x >= 9; x--) track.push({x: x, y: 6});
        
        // Final section
        for (let y = 5; y >= 0; y--) track.push({x: 8, y: y});
        for (let x = 7; x >= 6; x--) track.push({x: x, y: 0});
        
        return track;
    }

    /**
     * Generate home column paths for each color
     * @returns {Object} Home paths for each color
     */
    generateHomeColumns() {
        return {
            red: [
                {x: 7, y: 1}, {x: 7, y: 2}, {x: 7, y: 3},
                {x: 7, y: 4}, {x: 7, y: 5}, {x: 7, y: 6}
            ],
            blue: [
                {x: 1, y: 7}, {x: 2, y: 7}, {x: 3, y: 7},
                {x: 4, y: 7}, {x: 5, y: 7}, {x: 6, y: 7}
            ],
            green: [
                {x: 7, y: 13}, {x: 7, y: 12}, {x: 7, y: 11},
                {x: 7, y: 10}, {x: 7, y: 9}, {x: 7, y: 8}
            ],
            yellow: [
                {x: 13, y: 7}, {x: 12, y: 7}, {x: 11, y: 7},
                {x: 10, y: 7}, {x: 9, y: 7}, {x: 8, y: 7}
            ]
        };
    }

    /**
     * Calculate board position for a token
     * @param {number} position - Token position (0-56)
     * @param {string} color - Player color
     * @returns {Object} Board coordinates {x, y}
     */
    getTokenBoardPosition(position, color) {
        if (position === -1) {
            // Token is in starting area
            return this.getBasePosition(color, 0); // Default to first base position
        }

        if (position < GAME_CONSTANTS.MAIN_TRACK_SIZE) {
            // Token is on main track
            const startPos = GAME_CONSTANTS.START_POSITIONS[color];
            const actualPosition = (startPos + position) % GAME_CONSTANTS.MAIN_TRACK_SIZE;
            return this.mainTrack[actualPosition];
        } else {
            // Token is in home column
            const homeIndex = position - GAME_CONSTANTS.MAIN_TRACK_SIZE;
            return this.homeColumns[color][homeIndex];
        }
    }

    /**
     * Get base position for a color and token index
     * @param {string} color - Player color
     * @param {number} tokenIndex - Token index (0-3)
     * @returns {Object} Base position coordinates
     */
    getBasePosition(color, tokenIndex) {
        const basePositions = {
            red: [{x: 1.5, y: 1.5}, {x: 4.5, y: 1.5}, {x: 1.5, y: 4.5}, {x: 4.5, y: 4.5}],
            blue: [{x: 1.5, y: 10.5}, {x: 4.5, y: 10.5}, {x: 1.5, y: 13.5}, {x: 4.5, y: 13.5}],
            green: [{x: 10.5, y: 10.5}, {x: 13.5, y: 10.5}, {x: 10.5, y: 13.5}, {x: 13.5, y: 13.5}],
            yellow: [{x: 10.5, y: 1.5}, {x: 13.5, y: 1.5}, {x: 10.5, y: 4.5}, {x: 13.5, y: 4.5}]
        };
        return basePositions[color][tokenIndex];
    }

    /**
     * Check if a position is a safe square
     * @param {number} position - Position to check
     * @param {string} color - Player color
     * @returns {boolean} True if position is safe
     */
    isSafeSquare(position, color) {
        if (position < 0 || position >= GAME_CONSTANTS.MAIN_TRACK_SIZE) {
            return true; // Home columns and starting areas are safe
        }
        
        const startPos = GAME_CONSTANTS.START_POSITIONS[color];
        const actualPosition = (startPos + position) % GAME_CONSTANTS.MAIN_TRACK_SIZE;
        return this.safeSquares.has(actualPosition);
    }
}

/**
 * Turn Processing Engine
 * Handles dice rolls, move validation, and move execution
 */
class TurnProcessor {
    constructor(gameState, board) {
        this.gameState = gameState;
        this.board = board;
    }

    getAbsoluteMainTrackIndex(playerColor, relativePosition) {
        if (relativePosition < 0 || relativePosition >= GAME_CONSTANTS.MAIN_TRACK_SIZE) {
            return null;
        }

        const startPos = GAME_CONSTANTS.START_POSITIONS[playerColor];
        return (startPos + relativePosition) % GAME_CONSTANTS.MAIN_TRACK_SIZE;
    }

    /**
     * Generate dice roll
     * @returns {number} Dice value (1-6)
     */
    rollDice() {
        if (this.gameState.diceRolled) {
            return this.gameState.diceValue;
        }

        const diceValue = Math.floor(Math.random() * GAME_CONSTANTS.DICE_FACES) + 1;
        this.gameState.diceValue = diceValue;
        this.gameState.diceRolled = true;

        // Handle consecutive 6s
        if (diceValue === 6) {
            this.gameState.sixRollCount++;
            if (this.gameState.sixRollCount >= 3) {
                // Three 6s penalty - end turn
                this.gameState.sixRollCount = 0;
                this.gameState.diceRolled = false;
                this.gameState.nextTurn();
                return diceValue;
            }
            this.gameState.extraTurn = true;
        } else {
            this.gameState.sixRollCount = 0;
        }

        return diceValue;
    }

    /**
     * Get all valid moves for current player
     * @returns {Array} Array of valid move objects
     */
    getValidMoves() {
        const currentPlayer = this.gameState.getCurrentPlayer();
        const diceValue = this.gameState.diceValue;
        const validMoves = [];

        if (!currentPlayer || !diceValue) {
            return validMoves;
        }

        currentPlayer.tokens.forEach((token, index) => {
            const move = this.validateMove(currentPlayer, index, diceValue);
            if (move.isValid) {
                validMoves.push({
                    tokenIndex: index,
                    fromPosition: token.position,
                    toPosition: move.newPosition,
                    canCapture: move.canCapture,
                    willFinish: move.willFinish
                });
            }
        });

        return validMoves;
    }

    /**
     * Validate if a token can be moved
     * @param {Object} player - Player object
     * @param {number} tokenIndex - Token index
     * @param {number} diceValue - Dice roll value
     * @returns {Object} Validation result
     */
    validateMove(player, tokenIndex, diceValue) {
        const token = player.tokens[tokenIndex];
        
        // Token already finished
        if (token.isFinished) {
            return { isValid: false, reason: 'Token already finished' };
        }

        // Token in starting area
        if (token.position === -1) {
            if (diceValue === 6) {
                return {
                    isValid: true,
                    newPosition: 0,
                    canCapture: this.checkCapture(player, 0),
                    willFinish: false
                };
            } else {
                return { isValid: false, reason: 'Need 6 to enter' };
            }
        }

        const newPosition = token.position + diceValue;

        // Check if move overshoots finish
        if (newPosition > GAME_CONSTANTS.TOTAL_PATH_LENGTH - 1) {
            return { isValid: false, reason: 'Cannot overshoot finish' };
        }

        // Check for same-team collision
        const collision = this.checkSameTeamCollision(player, newPosition);
        if (collision) {
            return { isValid: false, reason: 'Cannot pass own token' };
        }

        return {
            isValid: true,
            newPosition: newPosition,
            canCapture: this.checkCapture(player, newPosition),
            willFinish: newPosition === GAME_CONSTANTS.TOTAL_PATH_LENGTH - 1
        };
    }

    /**
     * Check if moving to a position would capture an opponent
     * @param {Object} player - Moving player
     * @param {number} position - Target position
     * @returns {Object|null} Captured token info or null
     */
    checkCapture(player, position) {
        if (this.board.isSafeSquare(position, player.color)) {
            return null; // Cannot capture on safe squares
        }

        const targetAbs = this.getAbsoluteMainTrackIndex(player.color, position);
        if (targetAbs === null) {
            return null;
        }

        for (let otherPlayer of this.gameState.players) {
            if (otherPlayer.id === player.id) continue;

            for (let i = 0; i < otherPlayer.tokens.length; i++) {
                const otherToken = otherPlayer.tokens[i];
                if (otherToken.isFinished) continue;

                const otherAbs = this.getAbsoluteMainTrackIndex(otherPlayer.color, otherToken.position);
                if (otherAbs !== null && otherAbs === targetAbs) {
                    return {
                        playerId: otherPlayer.id,
                        tokenIndex: i,
                        token: otherToken
                    };
                }
            }
        }

        return null;
    }

    /**
     * Check if moving to a position would collide with same team
     * @param {Object} player - Moving player
     * @param {number} position - Target position
     * @returns {boolean} True if collision detected
     */
    checkSameTeamCollision(player, position) {
        for (let token of player.tokens) {
            if (token.position === position && !token.isFinished) {
                return true;
            }
        }
        return false;
    }

    /**
     * Execute a move
     * @param {number} playerId - Player ID
     * @param {number} tokenIndex - Token index
     * @param {number} diceValue - Dice value
     * @returns {Object} Move result
     */
    executeMove(playerId, tokenIndex, diceValue) {
        const player = this.gameState.players[playerId];
        const token = player.tokens[tokenIndex];
        
        const validation = this.validateMove(player, tokenIndex, diceValue);
        if (!validation.isValid) {
            return { success: false, reason: validation.reason };
        }

        const oldPosition = token.position;
        const newPosition = validation.newPosition;

        // Handle capture
        let capturedToken = null;
        if (validation.canCapture) {
            capturedToken = this.executeCapture(player, newPosition);
            this.gameState.extraTurn = true; // Extra turn for capture
        }

        // Move token
        token.position = newPosition;
        
        // Check if token reached home column
        if (newPosition >= GAME_CONSTANTS.MAIN_TRACK_SIZE) {
            token.isInHome = true;
        }

        // Check if token finished
        if (newPosition === GAME_CONSTANTS.TOTAL_PATH_LENGTH - 1) {
            token.isFinished = true;
            
            // Check if player finished all tokens
            const allFinished = player.tokens.every(t => t.isFinished);
            if (allFinished) {
                this.gameState.finishPlayer(playerId);
            }
        }

        // Record move in history
        const moveRecord = {
            playerId: playerId,
            tokenIndex: tokenIndex,
            fromPosition: oldPosition,
            toPosition: newPosition,
            diceValue: diceValue,
            captured: capturedToken,
            timestamp: Date.now()
        };
        this.gameState.moveHistory.push(moveRecord);
        this.gameState.lastMove = moveRecord;

        return {
            success: true,
            move: moveRecord,
            captured: capturedToken,
            finished: token.isFinished,
            playerFinished: player.isFinished
        };
    }

    /**
     * Execute capture of opponent token
     * @param {Object} player - Capturing player
     * @param {number} position - Capture position
     * @returns {Object|null} Captured token info
     */
    executeCapture(player, position) {
        const captureInfo = this.checkCapture(player, position);
        if (captureInfo) {
            const capturedToken = captureInfo.token;
            capturedToken.position = -1; // Send back to starting area
            capturedToken.isInHome = false;
            return captureInfo;
        }
        return null;
    }
}

/**
 * Main Ludo Game Engine
 * Orchestrates all game components
 */
class LudoGameEngine {
    constructor() {
        this.gameState = new LudoGameState();
        this.board = new LudoBoard();
        this.turnProcessor = new TurnProcessor(this.gameState, this.board);
        this.eventCallbacks = {};
    }

    /**
     * Initialize a new game
     * @param {number} playerCount - Number of players
     * @param {Array} playerTypes - Player types
     */
    initializeGame(playerCount = 4, playerTypes = ['human', 'human', 'computer', 'computer']) {
        this.gameState.reset();
        this.gameState.initializePlayers(playerCount, playerTypes);
        this.emit('gameInitialized', { players: this.gameState.players });
    }

    /**
     * Roll dice for current player
     * @returns {number} Dice value
     */
    rollDice() {
        const diceValue = this.turnProcessor.rollDice();
        this.emit('diceRolled', { 
            player: this.gameState.getCurrentPlayer(), 
            diceValue: diceValue,
            validMoves: this.turnProcessor.getValidMoves()
        });
        return diceValue;
    }

    /**
     * Move a token
     * @param {number} playerId - Player ID
     * @param {number} tokenIndex - Token index
     * @returns {Object} Move result
     */
    moveToken(playerId, tokenIndex) {
        const result = this.turnProcessor.executeMove(
            playerId, 
            tokenIndex, 
            this.gameState.diceValue
        );

        if (result.success) {
            this.emit('tokenMoved', result);
            
            // Check for game end
            if (this.gameState.isGameFinished()) {
                this.emit('gameFinished', {
                    winner: this.gameState.winner,
                    finishOrder: this.gameState.finishOrder
                });
            } else if (!this.gameState.extraTurn) {
                this.gameState.nextTurn();
                this.emit('turnChanged', { 
                    currentPlayer: this.gameState.getCurrentPlayer() 
                });
            }
        }

        return result;
    }

    /**
     * Get current game state
     * @returns {Object} Current state
     */
    getGameState() {
        return {
            players: this.gameState.players,
            currentPlayer: this.gameState.getCurrentPlayer(),
            diceValue: this.gameState.diceValue,
            diceRolled: this.gameState.diceRolled,
            gamePhase: this.gameState.gamePhase,
            validMoves: this.turnProcessor.getValidMoves(),
            isFinished: this.gameState.isGameFinished()
        };
    }

    /**
     * Register event callback
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (!this.eventCallbacks[event]) {
            this.eventCallbacks[event] = [];
        }
        this.eventCallbacks[event].push(callback);
    }

    /**
     * Emit event to callbacks
     * @param {string} event - Event name
     * @param {Object} data - Event data
     */
    emit(event, data) {
        if (this.eventCallbacks[event]) {
            this.eventCallbacks[event].forEach(callback => callback(data));
        }
    }

    /**
     * Get board position for a token
     * @param {Object} token - Token object
     * @param {string} color - Player color
     * @returns {Object} Board position
     */
    getTokenPosition(token, color) {
        return this.board.getTokenBoardPosition(token.position, color);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        LudoGameEngine,
        LudoGameState,
        LudoBoard,
        TurnProcessor,
        GAME_CONSTANTS
    };
}

// Global access for browser
if (typeof window !== 'undefined') {
    window.LudoGameEngine = LudoGameEngine;
    window.GAME_CONSTANTS = GAME_CONSTANTS;
}
