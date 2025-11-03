document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        console.log('Game fix script loaded');
        
        const playerCountButtons = document.querySelectorAll('.player-count-btn');
        const startGameBtn = document.getElementById('start-game-btn');
        
        console.log('Found player count buttons:', playerCountButtons.length);
        console.log('Found start game button:', !!startGameBtn);
        
        playerCountButtons.forEach((btn, index) => {
            console.log(`Button ${index}:`, btn.textContent, 'clickable:', !btn.disabled);
            
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Player count button clicked:', this.textContent);
                
                playerCountButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const count = parseInt(this.getAttribute('data-count') || this.textContent);
                console.log('Selected player count:', count);
                
                if (typeof game !== 'undefined' && game.setupPlayers) {
                    game.setupPlayers(count);
                }
            });
        });
        
        if (startGameBtn) {
            startGameBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Start game button clicked');
                
                if (typeof game !== 'undefined' && game.startGame) {
                    game.startGame();
                } else {
                    console.error('Game object or startGame method not found');
                }
            });
        }
        
        const newGameBtn = document.getElementById('new-game-btn');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('New game button clicked');
                
                if (typeof game !== 'undefined' && game.showSetup) {
                    game.showSetup();
                } else {
                    console.error('Game object or showSetup method not found');
                }
            });
        }
        
        const rollDiceBtn = document.getElementById('roll-dice-btn');
        if (rollDiceBtn) {
            rollDiceBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Roll dice button clicked');
                
                if (typeof game !== 'undefined' && game.rollDice) {
                    const currentPlayer = game.state.getCurrentPlayer();
                    if (currentPlayer && currentPlayer.type === 'human' && !game.state.diceRolled) {
                        game.rollDice();
                    } else if (currentPlayer && currentPlayer.type === 'human' && game.state.diceRolled) {
                        console.log('Dice already rolled, waiting for pawn selection');
                    }
                } else {
                    console.error('Game object or rollDice method not found');
                }
            });
            
            setInterval(() => {
                if (typeof game !== 'undefined' && game.state) {
                    const currentPlayer = game.state.getCurrentPlayer();
                    const isHumanTurn = currentPlayer && currentPlayer.type === 'human';
                    const canRoll = !game.state.diceRolled;
                    
                    rollDiceBtn.disabled = !(isHumanTurn && canRoll);
                    rollDiceBtn.style.opacity = (isHumanTurn && canRoll) ? '1' : '0.5';
                    rollDiceBtn.style.cursor = (isHumanTurn && canRoll) ? 'pointer' : 'not-allowed';
                }
            }, 100);
        }
        
        document.addEventListener('keydown', function(e) {
            if (e.code === 'Space' || e.code === 'Enter') {
                const activeScreen = document.querySelector('.screen.active');
                if (activeScreen && activeScreen.id === 'game-screen') {
                    e.preventDefault();
                    if (typeof game !== 'undefined' && game.rollDice) {
                        game.rollDice();
                    }
                }
            }
        });
        
        setupPawnSelection();
        setupDiceRollHandler();
        
    }, 500);
});

function setupDiceRollHandler() {
    if (typeof game === 'undefined') return;
    
    const originalRollDice = game.rollDice;
    game.rollDice = function() {
        const result = originalRollDice.call(this);
        
        setTimeout(() => {
            const currentPlayer = this.state.getCurrentPlayer();
            if (currentPlayer && currentPlayer.type === 'human' && this.state.diceValue === 6) {
                console.log('Player rolled 6, highlighting selectable pawns');
                highlightSelectableTokens(currentPlayer.id);
                
                showPawnSelectionMessage(currentPlayer.color);
            } else if (currentPlayer && currentPlayer.type === 'human') {
                highlightSelectableTokens(currentPlayer.id);
            }
        }, 1000);
        
        return result;
    };
}

function showPawnSelectionMessage(playerColor) {
    const messageDiv = document.createElement('div');
    messageDiv.id = 'pawn-selection-message';
    messageDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 20px;
        border-radius: 10px;
        font-size: 18px;
        font-weight: bold;
        z-index: 10000;
        text-align: center;
        border: 2px solid #ff6b35;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    `;
    messageDiv.innerHTML = `
        <div>🎲 You rolled a 6! 🎲</div>
        <div style="margin-top: 10px; color: #ff6b35;">Click on a pawn to move it!</div>
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        if (document.getElementById('pawn-selection-message')) {
            document.body.removeChild(messageDiv);
        }
    }, 3000);
}

function setupPawnSelection() {
    const gameBoard = document.getElementById('game-board');
    if (!gameBoard) return;
    
    gameBoard.addEventListener('click', function(e) {
        const rect = gameBoard.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const cellSize = gameBoard.width / 15;
        const boardX = Math.floor(x / cellSize);
        const boardY = Math.floor(y / cellSize);
        
        console.log('Board clicked at:', boardX, boardY);
        
        if (typeof game !== 'undefined' && game.handleBoardClick) {
            game.handleBoardClick(boardX, boardY);
        } else if (typeof game !== 'undefined') {
            handleTokenSelection(boardX, boardY);
        }
    });
}

function handleTokenSelection(x, y) {
    if (typeof game === 'undefined' || !game.state) return;
    
    const currentPlayer = game.state.getCurrentPlayer();
    if (!currentPlayer || currentPlayer.type !== 'human' || !game.state.diceRolled) return;
    
    console.log(`Handling token selection at ${x}, ${y} for player ${currentPlayer.color}`);
    
    const basePositions = {
        red: [{x: 1.5, y: 1.5}, {x: 4.5, y: 1.5}, {x: 1.5, y: 4.5}, {x: 4.5, y: 4.5}],
        blue: [{x: 1.5, y: 10.5}, {x: 4.5, y: 10.5}, {x: 1.5, y: 13.5}, {x: 4.5, y: 13.5}],
        green: [{x: 10.5, y: 10.5}, {x: 13.5, y: 10.5}, {x: 10.5, y: 13.5}, {x: 13.5, y: 13.5}],
        yellow: [{x: 10.5, y: 1.5}, {x: 13.5, y: 1.5}, {x: 10.5, y: 4.5}, {x: 13.5, y: 4.5}]
    };
    
    const playerBasePositions = basePositions[currentPlayer.color];
    if (!playerBasePositions) return;
    
    let tokenSelected = false;
    
    for (let i = 0; i < playerBasePositions.length; i++) {
        const basePos = playerBasePositions[i];
        const distance = Math.sqrt(Math.pow(x - basePos.x, 2) + Math.pow(y - basePos.y, 2));
        
        if (distance < 1.5) {
            console.log(`Token ${i} clicked for player ${currentPlayer.color}`);
            
            if (game.state.diceValue === 6 && currentPlayer.tokens[i].position === -1) {
                console.log('Moving token from base with roll of 6');
                if (game.moveToken && game.moveToken(currentPlayer.id, i, 1)) {
                    tokenSelected = true;
                    clearTokenHighlights();
                    game.state.diceRolled = false;
                    
                    if (game.state.diceValue !== 6) {
                        setTimeout(() => {
                            game.state.nextTurn();
                            game.updateDisplay();
                        }, 500);
                    }
                }
            } else if (currentPlayer.tokens[i].position !== -1 && canMoveToken(currentPlayer, i)) {
                console.log('Moving token on board');
                if (game.moveToken && game.moveToken(currentPlayer.id, i, game.state.diceValue)) {
                    tokenSelected = true;
                    clearTokenHighlights();
                    game.state.diceRolled = false;
                    
                    if (game.state.diceValue !== 6) {
                        setTimeout(() => {
                            game.state.nextTurn();
                            game.updateDisplay();
                        }, 500);
                    }
                }
            }
            break;
        }
    }
    
    if (!tokenSelected) {
        checkBoardTokenSelection(x, y, currentPlayer);
    }
}

function checkBoardTokenSelection(x, y, currentPlayer) {
    if (!currentPlayer.tokens) return;
    
    for (let i = 0; i < currentPlayer.tokens.length; i++) {
        const token = currentPlayer.tokens[i];
        if (token.position === -1) continue;
        
        const tokenPos = getBoardPosition(token.position, currentPlayer.color);
        if (!tokenPos) continue;
        
        const distance = Math.sqrt(Math.pow(x - tokenPos.x, 2) + Math.pow(y - tokenPos.y, 2));
        
        if (distance < 1) {
            console.log(`Board token ${i} clicked for player ${currentPlayer.color}`);
            
            if (canMoveToken(currentPlayer, i)) {
                if (game.moveToken && game.moveToken(currentPlayer.id, i, game.state.diceValue)) {
                    clearTokenHighlights();
                    game.state.diceRolled = false;
                    
                    if (game.state.diceValue !== 6) {
                        setTimeout(() => {
                            game.state.nextTurn();
                            game.updateDisplay();
                        }, 500);
                    }
                }
            }
            break;
        }
    }
}

function canMoveToken(player, tokenIndex) {
    const token = player.tokens[tokenIndex];
    if (!token) return false;
    
    if (token.position === -1) {
        return game.state.diceValue === 6;
    }
    
    const newPosition = token.position + game.state.diceValue;
    return newPosition <= 56;
}

function getBoardPosition(position, color) {
    if (typeof game === 'undefined' || !game.BOARD_PATH) return null;
    
    const startPos = game.START_POSITIONS[color];
    const actualPosition = (startPos + position) % 52;
    
    if (actualPosition < game.BOARD_PATH.length) {
        return game.BOARD_PATH[actualPosition];
    }
    
    return null;
}

function highlightSelectableTokens(playerId) {
    if (typeof game === 'undefined') return;
    
    const player = game.state.players[playerId];
    if (!player) return;
    
    clearTokenHighlights();
    
    player.tokens.forEach((token, index) => {
        let canMove = false;
        
        if (game.state.diceValue === 6 && token.position === -1) {
            canMove = true;
        } else if (token.position !== -1) {
            canMove = true;
        }
        
        if (canMove) {
            const tokenElement = document.querySelector(`[data-player="${playerId}"][data-token="${index}"]`);
            if (tokenElement) {
                tokenElement.classList.add('token-selectable');
            }
        }
    });
}

function clearTokenHighlights() {
    document.querySelectorAll('.token-selectable').forEach(el => {
        el.classList.remove('token-selectable');
    });
}

function createSmartAI() {
    return {
        makeMove: function(player, diceValue) {
            console.log(`AI making move for ${player.color} with dice value ${diceValue}`);
            
            const movableTokens = this.getMovableTokens(player, diceValue);
            if (movableTokens.length === 0) {
                console.log('No movable tokens for AI');
                return null;
            }
            
            const bestMove = this.chooseBestMove(player, movableTokens, diceValue);
            console.log(`AI chose to move token ${bestMove.tokenIndex}`);
            
            return bestMove;
        },
        
        getMovableTokens: function(player, diceValue) {
            const movable = [];
            
            for (let i = 0; i < player.tokens.length; i++) {
                const token = player.tokens[i];
                
                if (token.position === -1 && diceValue === 6) {
                    movable.push({tokenIndex: i, priority: 10, reason: 'move_from_base'});
                } else if (token.position !== -1) {
                    const newPos = token.position + diceValue;
                    if (newPos <= 56) {
                        let priority = 5;
                        let reason = 'normal_move';
                        
                        if (this.canCaptureOpponent(player, i, diceValue)) {
                            priority = 15;
                            reason = 'capture_opponent';
                        } else if (this.reachesHome(token, diceValue)) {
                            priority = 12;
                            reason = 'reach_home';
                        } else if (this.avoidCapture(player, i, diceValue)) {
                            priority = 11;
                            reason = 'avoid_capture';
                        } else if (this.moveToSafety(player, i, diceValue)) {
                            priority = 8;
                            reason = 'move_to_safety';
                        } else if (this.blockOpponent(player, i, diceValue)) {
                            priority = 7;
                            reason = 'block_opponent';
                        }
                        
                        movable.push({tokenIndex: i, priority, reason});
                    }
                }
            }
            
            return movable;
        },
        
        chooseBestMove: function(player, movableTokens, diceValue) {
            movableTokens.sort((a, b) => b.priority - a.priority);
            
            const highestPriority = movableTokens[0].priority;
            const bestMoves = movableTokens.filter(move => move.priority === highestPriority);
            
            if (bestMoves.length === 1) {
                return bestMoves[0];
            }
            
            return bestMoves[Math.floor(Math.random() * bestMoves.length)];
        },
        
        canCaptureOpponent: function(player, tokenIndex, diceValue) {
            if (typeof game === 'undefined') return false;
            
            const token = player.tokens[tokenIndex];
            const newPosition = token.position + diceValue;
            
            for (let otherPlayer of game.state.players) {
                if (otherPlayer.id === player.id) continue;
                
                for (let otherToken of otherPlayer.tokens) {
                    if (otherToken.position === newPosition && otherToken.position !== -1) {
                        return true;
                    }
                }
            }
            
            return false;
        },
        
        reachesHome: function(token, diceValue) {
            const newPosition = token.position + diceValue;
            return newPosition >= 50 && newPosition <= 56;
        },
        
        moveToSafety: function(player, tokenIndex, diceValue) {
            if (typeof game === 'undefined') return false;
            
            const token = player.tokens[tokenIndex];
            const newPosition = token.position + diceValue;
            const safeSquares = [0, 8, 13, 21, 26, 34, 39, 47];
            
            return safeSquares.includes(newPosition % 52);
        },
        
        avoidCapture: function(player, tokenIndex, diceValue) {
            if (typeof game === 'undefined') return false;
            
            const token = player.tokens[tokenIndex];
            const currentPosition = token.position;
            
            for (let otherPlayer of game.state.players) {
                if (otherPlayer.id === player.id) continue;
                
                for (let otherToken of otherPlayer.tokens) {
                    if (otherToken.position === -1) continue;
                    
                    for (let roll = 1; roll <= 6; roll++) {
                        if (otherToken.position + roll === currentPosition) {
                            return true;
                        }
                    }
                }
            }
            
            return false;
        },
        
        blockOpponent: function(player, tokenIndex, diceValue) {
            if (typeof game === 'undefined') return false;
            
            const token = player.tokens[tokenIndex];
            const newPosition = token.position + diceValue;
            
            for (let otherPlayer of game.state.players) {
                if (otherPlayer.id === player.id) continue;
                
                for (let otherToken of otherPlayer.tokens) {
                    if (otherToken.position === -1) continue;
                    
                    const distanceToHome = 56 - otherToken.position;
                    if (distanceToHome <= 6 && Math.abs(otherToken.position - newPosition) <= 3) {
                        return true;
                    }
                }
            }
            
            return false;
        }
    };
}

function enhanceGameWithAI() {
    if (typeof game === 'undefined') return;
    
    const smartAI = createSmartAI();
    
    const originalNextTurn = game.state.nextTurn;
    game.state.nextTurn = function() {
        originalNextTurn.call(this);
        
        setTimeout(() => {
            const currentPlayer = this.getCurrentPlayer();
            if (currentPlayer && currentPlayer.type === 'computer') {
                console.log(`AI turn for ${currentPlayer.color}`);
                
                setTimeout(() => {
                    if (!this.diceRolled) {
                        game.rollDice();
                        
                        setTimeout(() => {
                            const aiMove = smartAI.makeMove(currentPlayer, this.diceValue);
                            if (aiMove) {
                                game.moveToken(currentPlayer.id, aiMove.tokenIndex, this.diceValue);
                            }
                            
                            if (this.diceValue !== 6) {
                                setTimeout(() => {
                                    this.nextTurn();
                                }, 1000);
                            }
                        }, 1500);
                    }
                }, 500);
            }
        }, 100);
    };
}

function replaceTokensWithChessPawns() {
    if (typeof game === 'undefined' || !game.drawToken) return;
    
    const originalDrawToken = game.drawToken;
    game.drawToken = function(ctx, x, y, color, isSelected = false) {
        const centerX = x * this.cellSize + this.cellSize / 2;
        const centerY = y * this.cellSize + this.cellSize / 2;
        const radius = this.tokenRadius;
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        
        if (isSelected) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        
        ctx.fillStyle = '#ffffff';
        ctx.font = `${radius * 1.2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('♟', centerX, centerY);
        
        if (isSelected) {
            ctx.shadowColor = color;
            ctx.shadowBlur = 10;
            ctx.fillText('♟', centerX, centerY);
            ctx.shadowBlur = 0;
        }
    };
}

setTimeout(() => {
    enhanceGameWithAI();
    replaceTokensWithChessPawns();
}, 1000);

if (typeof window !== 'undefined') {
    window.highlightSelectableTokens = highlightSelectableTokens;
    window.clearTokenHighlights = clearTokenHighlights;
    window.createSmartAI = createSmartAI;
    window.enhanceGameWithAI = enhanceGameWithAI;
}
