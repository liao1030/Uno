/**
 * 遊戲類
 */
class Game {
    /**
     * 創建一個遊戲
     * @param {Array<string>} playerNames - 玩家名稱列表
     * @param {string} difficulty - AI難度
     * @param {boolean} soundEnabled - 是否啟用音效
     */
    constructor(playerNames, difficulty = 'medium', soundEnabled = true) {
        this.deck = new Deck();
        this.players = [];
        this.currentPlayerIdx = 0;
        this.direction = 1; // 1表示順時針，-1表示逆時針
        this.winner = null;
        this.gameOver = false;
        this.targetScore = 500; // 遊戲結束的目標分數
        this.soundEnabled = soundEnabled;
        
        // 創建玩家
        this.players.push(new Player(playerNames[0], false)); // 第一個玩家是人類
        for (let i = 1; i < playerNames.length; i++) {
            this.players.push(new Player(playerNames[i], true, difficulty));
        }
    }

    /**
     * 設置遊戲，發牌並翻開第一張牌
     */
    setupGame() {
        const hands = this.deck.dealInitialCards(this.players.length);
        for (let playerIdx = 0; playerIdx < hands.length; playerIdx++) {
            for (const card of hands[playerIdx]) {
                this.players[playerIdx].addCard(card);
            }
        }
        
        // 隨機選擇第一個玩家
        this.currentPlayerIdx = Math.floor(Math.random() * this.players.length);
        
        // 處理第一張牌的效果
        const topCard = this.deck.getTopDiscard();
        if (topCard) {
            this.applyCardEffect(topCard, true);
        }
    }

    /**
     * 移動到下一個玩家
     */
    nextPlayer() {
        this.currentPlayerIdx = (this.currentPlayerIdx + this.direction + this.players.length) % this.players.length;
    }

    /**
     * 應用卡牌效果
     * @param {Card} card - 要應用效果的卡牌
     * @param {boolean} isFirstCard - 是否為第一張牌
     */
    applyCardEffect(card, isFirstCard = false) {
        if (card.type === CardType.SKIP) {
            if (!isFirstCard) {
                this.nextPlayer(); // 跳過下一個玩家
            }
        } else if (card.type === CardType.REVERSE) {
            this.direction *= -1; // 反轉方向
            if (this.players.length === 2 && !isFirstCard) {
                this.nextPlayer(); // 在兩人遊戲中，反轉相當於跳過
            }
        } else if (card.type === CardType.DRAW_TWO) {
            if (!isFirstCard) {
                const nextPlayerIdx = (this.currentPlayerIdx + this.direction + this.players.length) % this.players.length;
                for (let i = 0; i < 2; i++) {
                    const drawnCard = this.deck.drawCard();
                    if (drawnCard) {
                        this.players[nextPlayerIdx].addCard(drawnCard);
                    }
                }
                this.nextPlayer(); // 跳過下一個玩家
            }
        } else if (card.type === CardType.WILD_DRAW_FOUR) {
            if (!isFirstCard) {
                const nextPlayerIdx = (this.currentPlayerIdx + this.direction + this.players.length) % this.players.length;
                for (let i = 0; i < 4; i++) {
                    const drawnCard = this.deck.drawCard();
                    if (drawnCard) {
                        this.players[nextPlayerIdx].addCard(drawnCard);
                    }
                }
                this.nextPlayer(); // 跳過下一個玩家
            }
        }
    }

    /**
     * 玩家進行一回合
     * @param {number|null} cardIndex - 要打出的牌的索引，如果為null則抽一張牌
     * @param {boolean} callUno - 是否喊UNO
     * @param {string|null} chooseColor - 為換色牌選擇的顏色
     * @returns {boolean} 是否成功完成回合
     */
    playTurn(cardIndex = null, callUno = false, chooseColor = null) {
        const currentPlayer = this.players[this.currentPlayerIdx];
        const topCard = this.deck.getTopDiscard();
        
        // 檢查是否有玩家忘記喊UNO
        if (currentPlayer.hand.length === 1 && !currentPlayer.hasCalledUno && callUno) {
            currentPlayer.hasCalledUno = true;
            this.playSound('uno-call');
            console.log(`${currentPlayer.name} 喊了UNO!`);
        }
        
        // 如果沒有指定卡牌索引，則抽一張牌
        if (cardIndex === null) {
            const drawnCard = this.deck.drawCard();
            if (drawnCard) {
                this.playSound('card-draw');
                console.log(`${currentPlayer.name} 抽了一張牌: ${drawnCard}`);
                currentPlayer.addCard(drawnCard);
                
                // 檢查抽到的牌是否可以打出
                if (drawnCard.canPlayOn(topCard)) {
                    console.log(`${currentPlayer.name} 打出了抽到的牌: ${drawnCard}`);
                    currentPlayer.removeCard(currentPlayer.hand.length - 1);
                    
                    // 處理換色牌和+4換色牌
                    if (drawnCard.type === CardType.WILD || drawnCard.type === CardType.WILD_DRAW_FOUR) {
                        if (chooseColor) {
                            drawnCard.setActiveColor(chooseColor);
                        }
                    }
                    
                    this.deck.addToDiscard(drawnCard);
                    this.playSound('card-play');
                    this.applyCardEffect(drawnCard);
                    
                    // 檢查是否獲勝
                    if (currentPlayer.hand.length === 0) {
                        this.winner = currentPlayer;
                        this.gameOver = true;
                        this.playSound('game-win');
                        return true;
                    }
                } else {
                    console.log(`${currentPlayer.name} 不能打出抽到的牌`);
                }
            } else {
                console.log("牌組已空，無法抽牌");
            }
        } else {
            // 打出指定的牌
            if (cardIndex >= 0 && cardIndex < currentPlayer.hand.length) {
                const card = currentPlayer.hand[cardIndex];
                
                if (card.canPlayOn(topCard)) {
                    console.log(`${currentPlayer.name} 打出了: ${card}`);
                    currentPlayer.removeCard(cardIndex);
                    
                    // 處理換色牌和+4換色牌
                    if (card.type === CardType.WILD || card.type === CardType.WILD_DRAW_FOUR) {
                        if (chooseColor) {
                            card.setActiveColor(chooseColor);
                        }
                    }
                    
                    this.deck.addToDiscard(card);
                    this.playSound('card-play');
                    this.applyCardEffect(card);
                    
                    // 檢查是否獲勝
                    if (currentPlayer.hand.length === 0) {
                        this.winner = currentPlayer;
                        this.gameOver = true;
                        this.playSound('game-win');
                        return true;
                    }
                } else {
                    console.log(`無法打出這張牌，它與頂部牌不匹配`);
                    return false;
                }
            } else {
                console.log("無效的卡牌索引");
                return false;
            }
        }
        
        // 移動到下一個玩家
        this.nextPlayer();
        this.playSound('turn-change');
        return true;
    }

    /**
     * 檢查玩家是否忘記喊UNO，如果忘記則罰抽兩張牌
     * @param {number} playerIdx - 玩家索引
     * @returns {boolean} 是否罰抽了牌
     */
    checkUnoCall(playerIdx) {
        const player = this.players[playerIdx];
        if (player.hand.length === 1 && !player.hasCalledUno) {
            console.log(`${player.name} 忘記喊UNO! 罰抽兩張牌`);
            for (let i = 0; i < 2; i++) {
                const card = this.deck.drawCard();
                if (card) {
                    player.addCard(card);
                }
            }
            return true;
        }
        return false;
    }

    /**
     * 結束一輪遊戲，計算分數
     * @returns {boolean} 遊戲是否結束
     */
    endRound() {
        if (this.winner) {
            const roundPoints = this.players.reduce((total, player) => {
                if (player !== this.winner) {
                    return total + player.getHandValue();
                }
                return total;
            }, 0);
            
            this.winner.addScore(roundPoints);
            console.log(`${this.winner.name} 贏得了這一輪! 獲得 ${roundPoints} 分`);
            
            // 檢查是否有玩家達到目標分數
            for (const player of this.players) {
                if (player.score >= this.targetScore) {
                    return true; // 遊戲結束
                }
            }
        }
        
        return false; // 繼續下一輪
    }

    /**
     * 重置遊戲狀態，準備下一輪
     */
    resetRound() {
        this.deck = new Deck();
        for (const player of this.players) {
            player.hand = [];
        }
        this.currentPlayerIdx = 0;
        this.direction = 1;
        this.winner = null;
        this.gameOver = false;
        this.setupGame();
    }

    /**
     * 播放音效
     * @param {string} soundId - 音效ID
     */
    playSound(soundId) {
        if (this.soundEnabled) {
            const sound = document.getElementById(`${soundId}-sound`);
            if (sound) {
                sound.currentTime = 0;
                sound.play().catch(e => console.log(`無法播放音效 ${soundId}:`, e));
            }
        }
    }

    /**
     * 獲取當前遊戲狀態
     * @returns {Object} 遊戲狀態
     */
    getGameState() {
        return {
            currentPlayerIdx: this.currentPlayerIdx,
            direction: this.direction,
            topCard: this.deck.getTopDiscard(),
            players: this.players.map(player => ({
                name: player.name,
                handSize: player.hand.length,
                score: player.score,
                isAI: player.isAI
            })),
            gameOver: this.gameOver,
            winner: this.winner ? this.winner.name : null
        };
    }

    /**
     * 執行AI玩家的回合
     * @returns {Promise<boolean>} 是否成功完成回合
     */
    async playAITurn() {
        const currentPlayer = this.players[this.currentPlayerIdx];
        if (!currentPlayer.isAI) {
            return false;
        }
        
        // 添加延遲，使AI思考看起來更自然
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const topCard = this.deck.getTopDiscard();
        const aiDecision = currentPlayer.aiSelectCard(topCard);
        
        // 如果AI有可以打出的牌
        if (aiDecision) {
            // 如果只剩一張牌，AI會自動喊UNO
            const callUno = currentPlayer.hand.length === 2;
            
            // 打出選擇的牌
            return this.playTurn(aiDecision.cardIndex, callUno, aiDecision.color);
        } else {
            // 如果沒有可以打出的牌，則抽一張牌
            return this.playTurn(null, false, null);
        }
    }

    /**
     * 渲染遊戲
     * @param {Function} onCardClick - 卡牌點擊事件處理程序
     */
    render(onCardClick) {
        // 渲染玩家手牌
        const playerHand = document.getElementById('player-hand');
        if (playerHand) {
            playerHand.innerHTML = '';
            
            this.players[0].hand.forEach((card, index) => {
                const cardElement = card.render();
                cardElement.addEventListener('click', () => onCardClick(index));
                playerHand.appendChild(cardElement);
            });
        }
        
        // 渲染對手
        for (let i = 1; i < this.players.length; i++) {
            const player = this.players[i];
            const opponentElement = document.getElementById(`opponent-${player.name}`);
            
            if (opponentElement) {
                // 更新對手名稱和分數
                const opponentName = opponentElement.querySelector('.opponent-name');
                if (opponentName) {
                    opponentName.textContent = `${player.name} (分數: ${player.score})`;
                }
                
                // 更新對手卡牌
                const opponentCards = opponentElement.querySelector('.opponent-cards');
                if (opponentCards) {
                    opponentCards.innerHTML = '';
                    
                    for (let j = 0; j < player.hand.length; j++) {
                        const cardBack = document.createElement('div');
                        cardBack.className = 'opponent-card';
                        opponentCards.appendChild(cardBack);
                    }
                }
                
                // 高亮當前玩家
                if (i === this.currentPlayerIdx) {
                    opponentElement.classList.add('current');
                } else {
                    opponentElement.classList.remove('current');
                }
            }
        }
        
        // 渲染牌組
        const deck = document.getElementById('deck');
        if (deck) {
            deck.innerHTML = '';
            
            if (this.deck.cards.length > 0) {
                const cardBack = document.createElement('div');
                cardBack.className = 'card card-back';
                deck.appendChild(cardBack);
            }
        }
        
        // 渲染棄牌堆
        const discardPile = document.getElementById('discard-pile');
        if (discardPile) {
            discardPile.innerHTML = '';
            
            const topCard = this.deck.getTopDiscard();
            if (topCard) {
                discardPile.appendChild(topCard.render());
            }
        }
        
        // 渲染當前顏色
        const currentColor = document.getElementById('current-color');
        if (currentColor) {
            const topCard = this.deck.getTopDiscard();
            if (topCard) {
                currentColor.textContent = `當前顏色: ${this.getColorName(topCard.color)}`;
                currentColor.className = `current-color ${topCard.color}`;
            }
        }
        
        // 渲染方向
        const direction = document.getElementById('direction');
        if (direction) {
            direction.textContent = `方向: ${this.direction === 1 ? '順時針 ⟳' : '逆時針 ⟲'}`;
        }
        
        // 渲染當前玩家
        const currentPlayer = document.getElementById('current-player');
        if (currentPlayer) {
            currentPlayer.textContent = `當前玩家: ${this.players[this.currentPlayerIdx].name}`;
            
            // 添加視覺提示
            if (this.currentPlayerIdx === 0) {
                currentPlayer.classList.add('your-turn');
                // 振動提示（如果是移動設備）
                if (navigator.vibrate && !this.lastTurnVibration) {
                    navigator.vibrate([50, 100, 50]);
                    this.lastTurnVibration = true;
                }
            } else {
                currentPlayer.classList.remove('your-turn');
                this.lastTurnVibration = false;
            }
        }
        
        // 更新UNO按鈕顯示
        const unoButton = document.getElementById('uno-button');
        if (unoButton) {
            if (this.players[0].hand.length === 1 && !this.players[0].hasCalledUno) {
                unoButton.style.display = 'block';
                // 添加動畫效果提醒玩家
                unoButton.classList.add('pulse-animation');
            } else {
                unoButton.style.display = 'none';
                unoButton.classList.remove('pulse-animation');
            }
        }
        
        // 優化移動設備體驗
        this.optimizeMobileExperience();
    }
    
    /**
     * 優化移動設備體驗
     */
    optimizeMobileExperience() {
        // 檢測是否為移動設備
        const isMobileDevice = window.matchMedia("(max-width: 768px)").matches;
        if (!isMobileDevice) return;
        
        // 調整卡牌間距，根據手牌數量
        const playerHand = document.getElementById('player-hand');
        if (playerHand) {
            const cardCount = this.players[0].hand.length;
            const cards = playerHand.querySelectorAll('.card');
            
            // 根據卡牌數量調整邊距
            if (cardCount > 7) {
                cards.forEach(card => {
                    card.style.margin = '0 -15px'; // 更多重疊
                });
            } else if (cardCount > 4) {
                cards.forEach(card => {
                    card.style.margin = '0 -10px'; // 標準重疊
                });
            } else {
                cards.forEach(card => {
                    card.style.margin = '0 5px'; // 較少重疊
                });
            }
        }
    }

    /**
     * 獲取顏色名稱
     * @param {string} color - 顏色代碼
     * @returns {string} 顏色名稱
     */
    getColorName(color) {
        const colorNames = {
            'red': '紅色',
            'yellow': '黃色',
            'green': '綠色',
            'blue': '藍色',
            'wild': '彩色'
        };
        return colorNames[color] || color;
    }
} 