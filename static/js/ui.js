/**
 * UI類，處理用戶界面交互
 */
class UI {
    /**
     * 創建UI
     */
    constructor() {
        this.game = null;
        this.gameRunning = false;
        this.selectedColor = null;
        
        // 初始化設置
        this.playerCount = 4;
        this.difficulty = 'medium';
        this.soundEnabled = true;
        
        // 綁定事件處理程序
        this.bindEventHandlers();
    }

    /**
     * 綁定事件處理程序
     */
    bindEventHandlers() {
        // 開始遊戲按鈕
        const startGameButton = document.getElementById('start-game');
        if (startGameButton) {
            startGameButton.addEventListener('click', () => this.startGame());
        }
        
        // 規則按鈕
        const rulesButton = document.getElementById('rules');
        if (rulesButton) {
            rulesButton.addEventListener('click', () => this.showRules());
        }
        
        // 設定按鈕
        const settingsButton = document.getElementById('settings');
        if (settingsButton) {
            settingsButton.addEventListener('click', () => this.showSettings());
        }
        
        // 關閉規則按鈕
        const closeRulesButton = document.getElementById('close-rules');
        if (closeRulesButton) {
            closeRulesButton.addEventListener('click', () => this.hideRules());
        }
        
        // 關閉設定按鈕
        const closeSettingsButton = document.getElementById('close-settings');
        if (closeSettingsButton) {
            closeSettingsButton.addEventListener('click', () => this.hideSettings());
        }
        
        // 保存設定按鈕
        const saveSettingsButton = document.getElementById('save-settings');
        if (saveSettingsButton) {
            saveSettingsButton.addEventListener('click', () => this.saveSettings());
        }
        
        // 牌組點擊事件
        const deckElement = document.getElementById('deck');
        if (deckElement) {
            deckElement.addEventListener('click', () => this.drawCard());
        }
        
        // UNO按鈕
        const unoButton = document.getElementById('uno-button');
        if (unoButton) {
            unoButton.addEventListener('click', () => this.callUno());
        }
        
        // 顏色選擇器
        const colorOptions = document.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.selectedColor = option.dataset.color;
                this.hideColorPicker();
                this.playSelectedCard();
            });
        });
        
        // 再玩一次按鈕
        const playAgainButton = document.getElementById('play-again');
        if (playAgainButton) {
            playAgainButton.addEventListener('click', () => this.playAgain());
        }
        
        // 返回主選單按鈕
        const backToMenuButton = document.getElementById('back-to-menu');
        if (backToMenuButton) {
            backToMenuButton.addEventListener('click', () => this.backToMenu());
        }
    }

    /**
     * 開始遊戲
     */
    startGame() {
        // 隱藏選單，顯示遊戲板
        document.getElementById('game-menu').style.display = 'none';
        document.getElementById('game-board').style.display = 'flex';
        
        // 創建玩家名稱
        const playerNames = ['玩家'];
        for (let i = 1; i < this.playerCount; i++) {
            playerNames.push(`電腦${i}`);
        }
        
        // 創建遊戲
        this.game = new Game(playerNames, this.difficulty, this.soundEnabled);
        this.game.setupGame();
        
        // 創建對手區域
        this.createOpponentsArea();
        
        // 渲染遊戲
        this.game.render(cardIndex => this.onCardClick(cardIndex));
        
        this.gameRunning = true;
        
        // 如果第一個玩家是AI，則執行AI回合
        this.checkAndPlayAITurn();
    }

    /**
     * 創建對手區域
     */
    createOpponentsArea() {
        const opponentsArea = document.getElementById('opponents-area');
        if (opponentsArea) {
            opponentsArea.innerHTML = '';
            
            // 從索引1開始，因為索引0是人類玩家
            for (let i = 1; i < this.game.players.length; i++) {
                const player = this.game.players[i];
                const opponentElement = document.createElement('div');
                opponentElement.className = 'opponent';
                opponentElement.id = `opponent-${player.name}`;
                
                const opponentName = document.createElement('div');
                opponentName.className = 'opponent-name';
                opponentName.textContent = `${player.name} (分數: ${player.score})`;
                
                const opponentCards = document.createElement('div');
                opponentCards.className = 'opponent-cards';
                
                opponentElement.appendChild(opponentName);
                opponentElement.appendChild(opponentCards);
                opponentsArea.appendChild(opponentElement);
            }
        }
    }

    /**
     * 卡牌點擊事件處理程序
     * @param {number} cardIndex - 卡牌索引
     */
    onCardClick(cardIndex) {
        if (!this.gameRunning || this.game.currentPlayerIdx !== 0) {
            return; // 不是人類玩家的回合
        }
        
        const card = this.game.players[0].hand[cardIndex];
        const topCard = this.game.deck.getTopDiscard();
        
        if (card.canPlayOn(topCard)) {
            // 如果是換色牌或+4換色牌，顯示顏色選擇器
            if (card.type === CardType.WILD || card.type === CardType.WILD_DRAW_FOUR) {
                this.selectedCardIndex = cardIndex;
                this.showColorPicker();
            } else {
                // 直接打出牌
                const callUno = this.game.players[0].hand.length === 2;
                this.game.playTurn(cardIndex, callUno);
                this.game.render(cardIndex => this.onCardClick(cardIndex));
                
                // 檢查遊戲是否結束
                if (this.game.gameOver) {
                    this.showGameOver();
                    return;
                }
                
                // 執行AI回合
                this.checkAndPlayAITurn();
            }
        }
    }

    /**
     * 抽牌
     */
    drawCard() {
        if (!this.gameRunning || this.game.currentPlayerIdx !== 0) {
            return; // 不是人類玩家的回合
        }
        
        this.game.playTurn(null, false);
        this.game.render(cardIndex => this.onCardClick(cardIndex));
        
        // 檢查遊戲是否結束
        if (this.game.gameOver) {
            this.showGameOver();
            return;
        }
        
        // 執行AI回合
        this.checkAndPlayAITurn();
    }

    /**
     * 喊UNO
     */
    callUno() {
        if (!this.gameRunning) {
            return;
        }
        
        if (this.game.players[0].hand.length === 1) {
            this.game.players[0].hasCalledUno = true;
            this.game.playSound('uno-call');
            document.getElementById('uno-button').style.display = 'none';
        }
    }

    /**
     * 顯示顏色選擇器
     */
    showColorPicker() {
        document.getElementById('color-picker-modal').style.display = 'flex';
    }

    /**
     * 隱藏顏色選擇器
     */
    hideColorPicker() {
        document.getElementById('color-picker-modal').style.display = 'none';
    }

    /**
     * 打出選擇的牌
     */
    playSelectedCard() {
        if (this.selectedCardIndex !== undefined && this.selectedColor) {
            const callUno = this.game.players[0].hand.length === 2;
            this.game.playTurn(this.selectedCardIndex, callUno, this.selectedColor);
            this.game.render(cardIndex => this.onCardClick(cardIndex));
            
            // 重置選擇
            this.selectedCardIndex = undefined;
            this.selectedColor = null;
            
            // 檢查遊戲是否結束
            if (this.game.gameOver) {
                this.showGameOver();
                return;
            }
            
            // 執行AI回合
            this.checkAndPlayAITurn();
        }
    }

    /**
     * 檢查並執行AI回合
     */
    async checkAndPlayAITurn() {
        while (this.gameRunning && !this.game.gameOver && this.game.players[this.game.currentPlayerIdx].isAI) {
            await this.game.playAITurn();
            this.game.render(cardIndex => this.onCardClick(cardIndex));
            
            // 檢查遊戲是否結束
            if (this.game.gameOver) {
                this.showGameOver();
                return;
            }
        }
    }

    /**
     * 顯示遊戲結束
     */
    showGameOver() {
        const gameOverModal = document.getElementById('game-over-modal');
        const winnerMessage = document.getElementById('winner-message');
        
        if (gameOverModal && winnerMessage) {
            winnerMessage.textContent = `${this.game.winner.name} 贏得了遊戲！`;
            gameOverModal.style.display = 'flex';
        }
    }

    /**
     * 再玩一次
     */
    playAgain() {
        document.getElementById('game-over-modal').style.display = 'none';
        
        // 重置遊戲
        this.game.resetRound();
        this.game.render(cardIndex => this.onCardClick(cardIndex));
        
        this.gameRunning = true;
        
        // 如果第一個玩家是AI，則執行AI回合
        this.checkAndPlayAITurn();
    }

    /**
     * 返回主選單
     */
    backToMenu() {
        document.getElementById('game-over-modal').style.display = 'none';
        document.getElementById('game-board').style.display = 'none';
        document.getElementById('game-menu').style.display = 'block';
        
        this.gameRunning = false;
        this.game = null;
    }

    /**
     * 顯示規則
     */
    showRules() {
        document.getElementById('rules-modal').style.display = 'flex';
    }

    /**
     * 隱藏規則
     */
    hideRules() {
        document.getElementById('rules-modal').style.display = 'none';
    }

    /**
     * 顯示設定
     */
    showSettings() {
        // 更新設定界面
        document.getElementById('player-count').value = this.playerCount;
        document.getElementById('sound-toggle').checked = this.soundEnabled;
        document.getElementById('difficulty').value = this.difficulty;
        
        document.getElementById('settings-modal').style.display = 'flex';
    }

    /**
     * 隱藏設定
     */
    hideSettings() {
        document.getElementById('settings-modal').style.display = 'none';
    }

    /**
     * 保存設定
     */
    saveSettings() {
        this.playerCount = parseInt(document.getElementById('player-count').value);
        this.soundEnabled = document.getElementById('sound-toggle').checked;
        this.difficulty = document.getElementById('difficulty').value;
        
        this.hideSettings();
    }
} 