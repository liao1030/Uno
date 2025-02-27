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
        // 檢測是否為移動設備
        this.isMobileDevice = window.matchMedia("(max-width: 768px)").matches;
        
        // 主選單按鈕
        document.getElementById('start-game').addEventListener('click', () => this.startGame());
        document.getElementById('rules-tutorial').addEventListener('click', () => this.showTutorial());
        document.getElementById('settings').addEventListener('click', () => this.showSettings());
        
        // 關閉按鈕
        document.getElementById('close-tutorial').addEventListener('click', () => this.hideTutorial());
        document.getElementById('close-settings').addEventListener('click', () => this.hideSettings());
        
        // 教學導航按鈕
        document.getElementById('prev-slide').addEventListener('click', () => this.prevSlide());
        document.getElementById('next-slide').addEventListener('click', () => this.nextSlide());
        
        // 遊戲內按鈕
        document.getElementById('deck').addEventListener('click', () => this.drawCard());
        document.getElementById('uno-button').addEventListener('click', () => this.callUno());
        
        // 確保重新開始按鈕事件監聽器正確綁定
        const restartButton = document.getElementById('restart-game');
        if (restartButton) {
            restartButton.addEventListener('click', () => this.restartGame());
            console.log('重新開始按鈕事件監聽器已綁定');
        } else {
            console.error('找不到重新開始按鈕元素');
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
        
        // 遊戲結束按鈕
        document.getElementById('play-again').addEventListener('click', () => this.playAgain());
        document.getElementById('back-to-menu').addEventListener('click', () => this.backToMenu());
        
        // 設定按鈕
        document.getElementById('save-settings').addEventListener('click', () => this.saveSettings());
        
        // 添加觸摸事件處理
        this.setupTouchEvents();
        
        // 添加屏幕方向變化監聽
        this.setupOrientationChange();
    }

    /**
     * 設置觸摸事件處理
     */
    setupTouchEvents() {
        if (!this.isMobileDevice) return;
        
        // 防止雙擊縮放
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            const DOUBLE_TAP_DELAY = 300;
            
            if (this.lastTap && (now - this.lastTap) < DOUBLE_TAP_DELAY) {
                e.preventDefault();
            }
            
            this.lastTap = now;
        }, false);
        
        // 改進卡牌觸摸體驗
        document.addEventListener('touchstart', (e) => {
            if (e.target.closest('.card')) {
                // 觸摸卡牌時添加活躍狀態
                e.target.closest('.card').classList.add('touch-active');
            }
        }, false);
        
        document.addEventListener('touchend', (e) => {
            // 移除所有卡牌的活躍狀態
            document.querySelectorAll('.card.touch-active').forEach(card => {
                card.classList.remove('touch-active');
            });
        }, false);
    }
    
    /**
     * 設置屏幕方向變化監聽
     */
    setupOrientationChange() {
        window.addEventListener('orientationchange', () => {
            // 延遲執行以確保DOM已更新
            setTimeout(() => {
                if (this.game) {
                    this.game.render(cardIndex => this.onCardClick(cardIndex));
                }
            }, 300);
        });
    }

    /**
     * 開始遊戲
     */
    startGame() {
        // 獲取玩家名稱
        let playerName = document.getElementById('player-name-field').value.trim();
        
        // 如果玩家沒有選擇名稱，使用預設名稱
        if (!playerName) {
            playerName = "小蜜桃";
        }
        
        console.log('選擇的玩家名稱:', playerName);
        
        // 隱藏選單，顯示遊戲板
        document.getElementById('game-menu').style.display = 'none';
        document.getElementById('game-board').style.display = 'flex';
        
        // 更新玩家名稱顯示
        const playerNameElement = document.getElementById('player-name');
        if (playerNameElement) {
            playerNameElement.textContent = playerName;
            console.log('已更新玩家名稱顯示為:', playerName);
        } else {
            console.error('找不到player-name元素');
        }
        
        // 創建玩家名稱
        const playerNames = [playerName];
        for (let i = 1; i < this.playerCount; i++) {
            playerNames.push(`虛擬AI對手${i}`);
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
     * 重新開始遊戲（回到首頁）
     */
    restartGame() {
        console.log('重新開始按鈕被點擊');
        if (confirm('確定要返回首頁嗎？當前進度將會丟失。')) {
            console.log('用戶確認返回首頁');
            // 先重置遊戲狀態
            this.resetGame();
            
            // 確保遊戲板隱藏
            const gameBoard = document.getElementById('game-board');
            if (gameBoard) {
                gameBoard.style.display = 'none';
                console.log('遊戲板已隱藏');
            } else {
                console.error('找不到遊戲板元素');
            }
            
            // 確保遊戲選單顯示
            const gameMenu = document.getElementById('game-menu');
            if (gameMenu) {
                gameMenu.style.display = 'block';
                console.log('遊戲選單已顯示');
            } else {
                console.error('找不到遊戲選單元素');
            }
            
            console.log('已返回首頁');
        } else {
            console.log('用戶取消返回首頁');
        }
    }

    /**
     * 重置遊戲狀態
     */
    resetGame() {
        console.log('開始重置遊戲狀態');
        
        try {
            // 清除遊戲相關元素
            const elementsToEmpty = [
                'opponents-area',
                'player-hand',
                'discard-pile',
                'current-color',
                'direction',
                'current-player'
            ];
            
            elementsToEmpty.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.innerHTML = '';
                    console.log(`已清空 ${id} 元素`);
                } else {
                    console.warn(`找不到 ${id} 元素`);
                }
            });
            
            // 重置遊戲狀態
            this.game = null;
            this.gameRunning = false;
            this.selectedColor = null;
            this.selectedCardIndex = undefined;
            
            console.log('遊戲狀態已完全重置');
        } catch (error) {
            console.error('重置遊戲時發生錯誤:', error);
        }
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