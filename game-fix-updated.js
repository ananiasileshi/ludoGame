/**
 * Updated Game Fix - Resolves dice, board, and lag issues
 * Fixes: Board display, dice clicking, 6-roll lag, token movement
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Updated game fix script loading...');
    
    // Wait for all scripts to load
    setTimeout(() => {
        initializeGameFix();
    }, 1000);
});

function initializeGameFix() {
    console.log('Initializing game fix...');
    
    // Check if we have both old and new game systems
    const hasOldGame = typeof game !== 'undefined';
    const hasNewEngine = typeof LudoGameEngine !== 'undefined';
    
    console.log('Old game system:', hasOldGame);
    console.log('New engine system:', hasNewEngine);
    
    if (hasNewEngine) {
        // Use new engine system
        setupNewGameSystem();
    } else if (hasOldGame) {
        // Fix old game system
        setupOldGameFixes();
    } else {
        console.error('No game system found');
    }
}

function setupNewGameSystem() {
    console.log('Setting up new game system...');
    
    // Initialize the new game engine
    window.gameEngine = new LudoGameEngine();
    window.aiManager = new AIPlayerManager(window.gameEngine);
    
    // Setup canvas
    const canvas = document.getElementById('game-board');
    if (!canvas) {
        console.error('Game board canvas not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Set proper canvas size
    const container = canvas.parentElement;
    const size = Math.min(container.clientWidth, container.clientHeight, 600);
    canvas.width = size;
    canvas.height = size;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    
    const cellSize = size / 15;
    const tokenRadius = cellSize * 0.3;
    
    console.log('Canvas setup:', { size, cellSize, tokenRadius });
    
    // Game state
    let currentGame = {
        isActive: false,
        players: [],
        currentPlayerIndex: 0,
        diceRolled: false,
        diceValue: null
    };
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup game engine events
    setupGameEngineEvents();
    
    // Initial board draw
    drawBoard();
    
    function setupEventListeners() {
        // Global event delegation to avoid losing listeners if DOM nodes are replaced
        document.addEventListener('click', function(e) {
            const target = e.target;
            if (!target) return;

            const btn = target.closest ? target.closest('button') : null;
            if (!btn || !btn.id) return;

            if (btn.id === 'new-game-btn') {
                e.preventDefault();
                showSetup();
            }

            if (btn.id === 'back-to-menu') {
                e.preventDefault();
                // Back from setup to main menu
                hideAllScreens();
                const menu = document.getElementById('main-menu');
                if (menu) menu.classList.add('active');
            }
        }, true);

        // Player count selection
        const playerCountButtons = document.querySelectorAll('.player-count-btn');
        playerCountButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Player count selected:', this.textContent);
                
                // Update UI
                playerCountButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const count = parseInt(this.getAttribute('data-count') || this.textContent);
                window.selectedPlayerCount = count;
            });
        });
        
        // Start game button
        const startGameBtn = document.getElementById('start-game-btn');
        if (startGameBtn) {
            startGameBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Start game clicked');
                startNewGame();
            });
        }
        
        // Roll dice button - FIXED VERSION
        const rollDiceBtn = document.getElementById('roll-dice-btn');
        if (rollDiceBtn) {
            // Remove any existing listeners
            rollDiceBtn.replaceWith(rollDiceBtn.cloneNode(true));
            const newRollDiceBtn = document.getElementById('roll-dice-btn');
            
            newRollDiceBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Roll dice clicked');
                
                if (!currentGame.isActive) {
                    console.log('No active game');
                    return;
                }
                
                if (currentGame.diceRolled) {
                    console.log('Dice already rolled');
                    return;
                }
                
                rollDice();
            });
            
            // Update button state periodically
            setInterval(() => {
                if (currentGame.isActive) {
                    const canRoll = !currentGame.diceRolled;
                    newRollDiceBtn.disabled = !canRoll;
                    newRollDiceBtn.style.opacity = canRoll ? '1' : '0.5';
                    newRollDiceBtn.style.cursor = canRoll ? 'pointer' : 'not-allowed';
                }
            }, 200);
        }
        
        // Canvas click for token selection
        canvas.addEventListener('click', function(e) {
            if (!currentGame.isActive || !currentGame.diceRolled) return;
            
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const boardX = Math.floor(x / cellSize);
            const boardY = Math.floor(y / cellSize);
            
            console.log('Board clicked:', boardX, boardY);
            handleTokenClick(boardX, boardY);
        });
        
        // New game button
        const newGameBtn = document.getElementById('new-game-btn');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', function(e) {
                e.preventDefault();
                showSetup();
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if (e.code === 'Space' && currentGame.isActive && !currentGame.diceRolled) {
                e.preventDefault();
                rollDice();
            }
        });
    }
    
    function setupGameEngineEvents() {
        window.gameEngine.on('gameInitialized', (data) => {
            console.log('Game initialized:', data.players.length, 'players');
            currentGame.isActive = true;
            currentGame.players = data.players;
            updateDisplay();
        });
        
        window.gameEngine.on('diceRolled', (data) => {
            console.log('Dice rolled:', data.diceValue);
            currentGame.diceRolled = true;
            currentGame.diceValue = data.diceValue;
            
            updateDiceDisplay(data.diceValue);
            highlightValidMoves(data.validMoves);
            updateDisplay();
            
            // Handle AI turn without lag
            if (data.player.type === 'computer') {
                setTimeout(() => {
                    processAITurn(data.player);
                }, 800);
            }
        });
        
        window.gameEngine.on('tokenMoved', (data) => {
            console.log('Token moved:', data.move);
            currentGame.diceRolled = false;
            currentGame.diceValue = null;
            
            clearHighlights();
            updateDisplay();
            
            // Show capture message
            if (data.captured) {
                showMessage(`Captured ${data.captured.token.color} token!`);
            }
        });
        
        window.gameEngine.on('turnChanged', (data) => {
            console.log('Turn changed to:', data.currentPlayer.color);
            currentGame.currentPlayerIndex = data.currentPlayer.id;
            updateCurrentPlayerDisplay(data.currentPlayer);
            
            // Handle AI turn
            if (data.currentPlayer.type === 'computer') {
                setTimeout(() => {
                    processAITurn(data.currentPlayer);
                }, 1000);
            }
        });
        
        window.gameEngine.on('gameFinished', (data) => {
            console.log('Game finished! Winner:', data.winner);
            const winner = currentGame.players[data.winner];
            showMessage(`🎉 ${winner.color.toUpperCase()} WINS! 🎉`);
            currentGame.isActive = false;
        });
    }
    
    function startNewGame() {
        const playerCount = window.selectedPlayerCount || 4;
        console.log('Starting new game with', playerCount, 'players');
        
        // Setup player types (first player human, rest AI)
        const playerTypes = [];
        for (let i = 0; i < playerCount; i++) {
            playerTypes.push(i === 0 ? 'human' : 'computer');
        }
        
        // Initialize game
        window.gameEngine.initializeGame(playerCount, playerTypes);
        
        // Setup AI players
        for (let i = 1; i < playerCount; i++) {
            const difficulty = ['EASY', 'MEDIUM', 'HARD'][i % 3];
            window.aiManager.registerAI(i, difficulty);
        }
        
        // Show game screen
        showGameScreen();
        
        // Reset state
        currentGame.diceRolled = false;
        currentGame.diceValue = null;
    }
    
    function rollDice() {
        if (!currentGame.isActive || currentGame.diceRolled) {
            console.log('Cannot roll dice now');
            return;
        }
        
        console.log('Rolling dice...');
        
        // Add visual feedback
        const rollBtn = document.getElementById('roll-dice-btn');
        if (rollBtn) {
            rollBtn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                rollBtn.style.transform = 'scale(1)';
            }, 150);
        }
        
        // Roll dice with engine
        window.gameEngine.rollDice();
    }
    
    function handleTokenClick(boardX, boardY) {
        const gameState = window.gameEngine.getGameState();
        const currentPlayer = gameState.currentPlayer;
        
        if (!currentPlayer || currentPlayer.type !== 'human') return;
        
        console.log('Handling token click for', currentPlayer.color);
        
        // Find clicked token
        const tokenIndex = findTokenAtPosition(boardX, boardY, currentPlayer);
        if (tokenIndex !== null) {
            console.log('Clicked token', tokenIndex);
            
            // Try to move token
            const result = window.gameEngine.moveToken(currentPlayer.id, tokenIndex);
            if (!result.success) {
                console.log('Invalid move:', result.reason);
                showMessage('Invalid move: ' + result.reason);
            }
        }
    }
    
    function findTokenAtPosition(boardX, boardY, player) {
        for (let i = 0; i < player.tokens.length; i++) {
            const token = player.tokens[i];
            let tokenPos;
            
            if (token.position === -1) {
                // Token in base
                tokenPos = getBasePosition(player.color, i);
            } else {
                // Token on board
                tokenPos = window.gameEngine.getTokenPosition(token, player.color);
            }
            
            if (tokenPos) {
                const distance = Math.sqrt(
                    Math.pow(boardX - tokenPos.x, 2) + 
                    Math.pow(boardY - tokenPos.y, 2)
                );
                
                if (distance < 1.5) {
                    return i;
                }
            }
        }
        return null;
    }
    
    function getBasePosition(color, tokenIndex) {
        const basePositions = {
            red: [{x: 1.5, y: 1.5}, {x: 4.5, y: 1.5}, {x: 1.5, y: 4.5}, {x: 4.5, y: 4.5}],
            blue: [{x: 1.5, y: 10.5}, {x: 4.5, y: 10.5}, {x: 1.5, y: 13.5}, {x: 4.5, y: 13.5}],
            green: [{x: 10.5, y: 10.5}, {x: 13.5, y: 10.5}, {x: 10.5, y: 13.5}, {x: 13.5, y: 13.5}],
            yellow: [{x: 10.5, y: 1.5}, {x: 13.5, y: 1.5}, {x: 10.5, y: 4.5}, {x: 13.5, y: 4.5}]
        };
        return basePositions[color][tokenIndex];
    }
    
    async function processAITurn(player) {
        if (window.aiManager && window.aiManager.isAIPlayer(player.id)) {
            await window.aiManager.processAITurn(player);
        }
    }
    
    function drawBoard() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Outer border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(2, cellSize * 0.08);
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        drawGrid();

        // Draw bases + home lanes + center
        drawClassicBases();
        drawHomeLanes();
        drawCenterHome();

        // Draw safe squares and tokens
        drawSafeSquares();

        if (currentGame.isActive) {
            drawTokens();
        }
    }

    function drawGrid() {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(1, cellSize * 0.03);

        for (let i = 0; i <= 15; i++) {
            const pos = i * cellSize;

            ctx.beginPath();
            ctx.moveTo(pos, 0);
            ctx.lineTo(pos, canvas.height);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, pos);
            ctx.lineTo(canvas.width, pos);
            ctx.stroke();
        }
    }

    function drawClassicBases() {
        const baseFill = {
            red: '#dc2626',
            blue: '#1d4ed8',
            green: '#16a34a',
            yellow: '#facc15'
        };

        const bases = [
            { color: 'red', x: 0, y: 0 },
            { color: 'green', x: 9, y: 0 },
            { color: 'blue', x: 0, y: 9 },
            { color: 'yellow', x: 9, y: 9 }
        ];

        bases.forEach(b => {
            // Colored 6x6 corner
            ctx.fillStyle = baseFill[b.color];
            ctx.fillRect(b.x * cellSize, b.y * cellSize, 6 * cellSize, 6 * cellSize);

            // Inner white square (4x4) centered, with border
            const innerX = (b.x + 1) * cellSize;
            const innerY = (b.y + 1) * cellSize;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(innerX, innerY, 4 * cellSize, 4 * cellSize);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = Math.max(2, cellSize * 0.06);
            ctx.strokeRect(innerX, innerY, 4 * cellSize, 4 * cellSize);

            // 4 token circles (2x2 layout)
            const r = cellSize * 0.55;
            const centers = [
                { cx: innerX + 1.3 * cellSize, cy: innerY + 1.3 * cellSize },
                { cx: innerX + 2.7 * cellSize, cy: innerY + 1.3 * cellSize },
                { cx: innerX + 1.3 * cellSize, cy: innerY + 2.7 * cellSize },
                { cx: innerX + 2.7 * cellSize, cy: innerY + 2.7 * cellSize }
            ];

            centers.forEach(p => {
                ctx.fillStyle = baseFill[b.color];
                ctx.beginPath();
                ctx.arc(p.cx, p.cy, r * 0.45, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = '#000000';
                ctx.lineWidth = Math.max(2, cellSize * 0.05);
                ctx.stroke();
            });
        });
    }

    function drawHomeLanes() {
        const laneFill = {
            red: '#dc2626',
            blue: '#1d4ed8',
            green: '#16a34a',
            yellow: '#facc15'
        };

        // Red lane: row 7, cols 1..5
        for (let x = 1; x <= 5; x++) fillCell(x, 7, laneFill.red);
        // Green lane: col 7, rows 1..5
        for (let y = 1; y <= 5; y++) fillCell(7, y, laneFill.green);
        // Blue lane: col 7, rows 9..13
        for (let y = 9; y <= 13; y++) fillCell(7, y, laneFill.blue);
        // Yellow lane: row 7, cols 9..13
        for (let x = 9; x <= 13; x++) fillCell(x, 7, laneFill.yellow);
    }

    function drawCenterHome() {
        const centerX = 6 * cellSize;
        const centerY = 6 * cellSize;

        // White center square background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(centerX, centerY, 3 * cellSize, 3 * cellSize);

        // 4 triangles
        const cx = centerX + 1.5 * cellSize;
        const cy = centerY + 1.5 * cellSize;

        // Top (green)
        drawTriangle({ x: centerX, y: centerY }, { x: centerX + 3 * cellSize, y: centerY }, { x: cx, y: cy }, '#16a34a');
        // Right (yellow)
        drawTriangle({ x: centerX + 3 * cellSize, y: centerY }, { x: centerX + 3 * cellSize, y: centerY + 3 * cellSize }, { x: cx, y: cy }, '#facc15');
        // Bottom (blue)
        drawTriangle({ x: centerX + 3 * cellSize, y: centerY + 3 * cellSize }, { x: centerX, y: centerY + 3 * cellSize }, { x: cx, y: cy }, '#1d4ed8');
        // Left (red)
        drawTriangle({ x: centerX, y: centerY + 3 * cellSize }, { x: centerX, y: centerY }, { x: cx, y: cy }, '#dc2626');

        // Center border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(2, cellSize * 0.06);
        ctx.strokeRect(centerX, centerY, 3 * cellSize, 3 * cellSize);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + 3 * cellSize, centerY + 3 * cellSize);
        ctx.moveTo(centerX + 3 * cellSize, centerY);
        ctx.lineTo(centerX, centerY + 3 * cellSize);
        ctx.stroke();
    }

    function drawTriangle(p1, p2, p3, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(1, cellSize * 0.03);
        ctx.stroke();
    }

    function fillCell(x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(1, cellSize * 0.03);
        ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
    
    function drawSafeSquares() {
        ctx.fillStyle = '#ffd700';
        const safeSquares = [0, 8, 13, 21, 26, 34, 39, 47];
        
        if (window.gameEngine && window.gameEngine.board) {
            const mainTrack = window.gameEngine.board.mainTrack;
            safeSquares.forEach(safeIndex => {
                if (safeIndex < mainTrack.length) {
                    const pos = mainTrack[safeIndex];
                    const centerX = pos.x * cellSize + cellSize / 2;
                    const centerY = pos.y * cellSize + cellSize / 2;
                    
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, cellSize * 0.1, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        }
    }
    
    function drawTokens() {
        if (!currentGame.isActive) return;
        
        currentGame.players.forEach(player => {
            player.tokens.forEach((token, index) => {
                drawToken(token, player.color, index);
            });
        });
    }
    
    function drawToken(token, color, index) {
        let position;
        
        if (token.position === -1) {
            position = getBasePosition(color, index);
        } else {
            position = window.gameEngine.getTokenPosition(token, color);
        }
        
        if (!position) return;
        
        const centerX = position.x * cellSize + cellSize / 2;
        const centerY = position.y * cellSize + cellSize / 2;
        
        // Draw token circle
        ctx.fillStyle = getColorHex(color);
        ctx.beginPath();
        ctx.arc(centerX, centerY, tokenRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw border
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw token number
        ctx.fillStyle = '#fff';
        ctx.font = `${tokenRadius * 0.8}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((index + 1).toString(), centerX, centerY);
    }
    
    function getColorHex(colorName) {
        const colors = {
            red: '#ef4444',
            blue: '#3b82f6',
            green: '#10b981',
            yellow: '#f59e0b'
        };
        return colors[colorName] || '#000';
    }
    
    function updateDisplay() {
        drawBoard();
    }
    
    function updateDiceDisplay(value) {
        const diceElement = document.getElementById('dice-value');
        if (diceElement) {
            diceElement.textContent = value;
        }
        
        // Visual feedback
        const diceContainer = document.querySelector('.dice-container');
        if (diceContainer) {
            diceContainer.style.transform = 'scale(1.1)';
            setTimeout(() => {
                diceContainer.style.transform = 'scale(1)';
            }, 300);
        }
    }
    
    function updateCurrentPlayerDisplay(player) {
        const playerInfo = document.getElementById('current-player');
        if (playerInfo) {
            playerInfo.textContent = `${player.color.toUpperCase()}'s Turn`;
            playerInfo.style.color = getColorHex(player.color);
        }
    }
    
    function highlightValidMoves(validMoves) {
        // Add visual indicators for valid moves
        console.log('Valid moves:', validMoves.length);
    }
    
    function clearHighlights() {
        // Clear any visual highlights
        updateDisplay();
    }
    
    function showMessage(message) {
        console.log('Message:', message);
        
        // Create toast notification
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #333;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            z-index: 10000;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    function showSetup() {
        hideAllScreens();
        const setupScreen = document.getElementById('setup-screen');
        if (setupScreen) {
            setupScreen.classList.add('active');
        }
    }
    
    function showGameScreen() {
        hideAllScreens();
        const gameScreen = document.getElementById('game-screen');
        if (gameScreen) {
            gameScreen.classList.add('active');
        }
    }
    
    function hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
    }

    // Expose minimal navigation helpers globally (used by navigation.js)
    window.showSetup = showSetup;
    window.showGameScreen = showGameScreen;
    window.hideAllScreens = hideAllScreens;
    
    console.log('New game system setup complete');
}

function setupOldGameFixes() {
    console.log('Setting up fixes for old game system...');
    
    // Fix dice button
    const rollDiceBtn = document.getElementById('roll-dice-btn');
    if (rollDiceBtn && typeof game !== 'undefined') {
        // Remove existing listeners
        rollDiceBtn.replaceWith(rollDiceBtn.cloneNode(true));
        const newRollDiceBtn = document.getElementById('roll-dice-btn');
        
        newRollDiceBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (game && game.rollDice) {
                const currentPlayer = game.state.getCurrentPlayer();
                if (currentPlayer && currentPlayer.type === 'human' && !game.state.diceRolled) {
                    console.log('Rolling dice (old system)');
                    game.rollDice();
                }
            }
        });
    }
    
    // Fix board rendering
    if (typeof game !== 'undefined' && game.canvas) {
        // Ensure canvas is visible
        game.canvas.style.display = 'block';
        game.canvas.style.background = 'transparent';
        
        // Force redraw
        if (game.drawBoard) {
            setTimeout(() => {
                game.drawBoard();
            }, 500);
        }
    }
    
    console.log('Old game system fixes applied');
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    #game-board {
        border: 2px solid #333;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    .dice-container {
        transition: transform 0.3s ease;
    }
    
    #roll-dice-btn {
        transition: all 0.2s ease;
    }
    
    #roll-dice-btn:active {
        transform: scale(0.95);
    }
`;
document.head.appendChild(style);

console.log('Game fix script loaded successfully');
