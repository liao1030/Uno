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
        this.playerCount = 4;
        this.difficulty = 'medium';
        this.soundEnabled = true;
        this.currentSlide = 1;
        this.totalSlides = 5;
        
        // 綁定事件處理程序
        this.bindEventHandlers();
    }

    /**
     * 綁定事件處理程序
     */
    bindEventHandlers() {
        // 主菜單按鈕
        document.getElementById('start-game').addEventListener('click', () => this.startGame());
        document.getElementById('rules').addEventListener('click', () => this.showRules());
        document.getElementById('rules-tutorial').addEventListener('click', () => this.showTutorial());
        document.getElementById('settings').addEventListener('click', () => this.showSettings());
        
        // 遊戲內按鈕
        document.getElementById('deck').addEventListener('click', () => this.drawCard());
        document.getElementById('uno-button').addEventListener('click', () => this.callUno());
        document.getElementById('restart-game').addEventListener('click', () => this.restartGame());
        document.getElementById('in-game-rules').addEventListener('click', () => this.showRules());
        
        // 規則模態框
        document.getElementById('close-rules').addEventListener('click', () => this.hideRules());
        
        // 規則解說模態框
        document.getElementById('close-tutorial').addEventListener('click', () => this.hideTutorial());
        document.getElementById('prev-slide').addEventListener('click', () => this.prevSlide());
        document.getElementById('next-slide').addEventListener('click', () => this.nextSlide());
        
        // 設置模態框
        document.getElementById('close-settings').addEventListener('click', () => this.hideSettings());
        document.getElementById('save-settings').addEventListener('click', () => this.saveSettings());
        
        // 顏色選擇器
        const colorOptions = document.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectedColor = e.target.dataset.color;
                this.hideColorPicker();
                this.playSelectedCard();
            });
        });
        
        // 遊戲結束模態框
        document.getElementById('play-again').addEventListener('click', () => this.playAgain());
        document.getElementById('back-to-menu').addEventListener('click', () => this.backToMenu());
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

    /**
     * 顯示規則解說模態框
     */
    showTutorial() {
        document.getElementById('tutorial-modal').style.display = 'block';
        this.currentSlide = 1;
        this.updateSlideDisplay();
    }

    /**
     * 隱藏規則解說模態框
     */
    hideTutorial() {
        document.getElementById('tutorial-modal').style.display = 'none';
    }

    /**
     * 顯示上一張幻燈片
     */
    prevSlide() {
        if (this.currentSlide > 1) {
            document.getElementById(`slide-${this.currentSlide}`).style.display = 'none';
            this.currentSlide--;
            document.getElementById(`slide-${this.currentSlide}`).style.display = 'block';
            this.updateSlideDisplay();
        }
    }

    /**
     * 顯示下一張幻燈片
     */
    nextSlide() {
        if (this.currentSlide < this.totalSlides) {
            document.getElementById(`slide-${this.currentSlide}`).style.display = 'none';
            this.currentSlide++;
            document.getElementById(`slide-${this.currentSlide}`).style.display = 'block';
            this.updateSlideDisplay();
        }
    }

    /**
     * 更新幻燈片顯示
     */
    updateSlideDisplay() {
        document.getElementById('slide-counter').textContent = `${this.currentSlide}/${this.totalSlides}`;
        
        // 更新按鈕狀態
        document.getElementById('prev-slide').disabled = (this.currentSlide === 1);
        document.getElementById('next-slide').disabled = (this.currentSlide === this.totalSlides);
    }

    /**
     * 重新開始遊戲
     */
    restartGame() {
        if (confirm('確定要重新開始遊戲嗎？當前進度將會丟失。')) {
            this.resetGame();
            this.startGame();
        }
    }

    /**
     * 重置遊戲狀態
     */
    resetGame() {
        // 清除遊戲相關元素
        document.getElementById('opponents-area').innerHTML = '';
        document.getElementById('player-hand').innerHTML = '';
        document.getElementById('discard-pile').innerHTML = '';
        document.getElementById('current-color').innerHTML = '';
        document.getElementById('direction').innerHTML = '';
        document.getElementById('current-player').innerHTML = '';
        
        // 重置遊戲狀態
        this.game = null;
        this.gameRunning = false;
        this.selectedColor = null;
    }
} 