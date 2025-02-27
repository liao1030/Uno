/**
 * 玩家類
 */
class Player {
    /**
     * 創建一個玩家
     * @param {string} name - 玩家名稱
     * @param {boolean} isAI - 是否為AI玩家
     * @param {string} difficulty - AI難度（'easy', 'medium', 'hard'）
     */
    constructor(name, isAI = false, difficulty = 'medium') {
        this.name = name;
        this.hand = [];
        this.score = 0;
        this.hasCalledUno = false;
        this.isAI = isAI;
        this.difficulty = difficulty;
    }

    /**
     * 向玩家手牌中添加一張牌
     * @param {Card} card - 要添加的牌
     */
    addCard(card) {
        this.hand.push(card);
        // 當玩家有超過一張牌時，重置UNO喊叫狀態
        if (this.hand.length > 1) {
            this.hasCalledUno = false;
        }
    }

    /**
     * 從玩家手牌中移除一張牌
     * @param {number} cardIndex - 要移除的牌的索引
     * @returns {Card|null} 移除的牌，如果索引無效則返回null
     */
    removeCard(cardIndex) {
        if (cardIndex >= 0 && cardIndex < this.hand.length) {
            const card = this.hand.splice(cardIndex, 1)[0];
            return card;
        }
        return null;
    }

    /**
     * 獲取可以打出的牌的索引列表
     * @param {Card} topCard - 棄牌堆頂部的牌
     * @returns {Array<number>} 可以打出的牌的索引列表
     */
    getPlayableCards(topCard) {
        const playableIndices = [];
        for (let i = 0; i < this.hand.length; i++) {
            if (this.hand[i].canPlayOn(topCard)) {
                playableIndices.push(i);
            }
        }
        return playableIndices;
    }

    /**
     * 玩家喊UNO
     * @returns {boolean} 是否成功喊UNO
     */
    callUno() {
        if (this.hand.length === 1) {
            this.hasCalledUno = true;
            return true;
        }
        return false;
    }

    /**
     * 增加玩家的分數
     * @param {number} points - 要增加的分數
     */
    addScore(points) {
        this.score += points;
    }

    /**
     * 計算玩家手牌的總分值
     * @returns {number} 手牌總分值
     */
    getHandValue() {
        return this.hand.reduce((total, card) => total + card.getScore(), 0);
    }

    /**
     * 獲取玩家的描述
     * @returns {string} 玩家描述
     */
    toString() {
        return `${this.name} (分數: ${this.score})`;
    }

    /**
     * AI玩家選擇要打出的牌
     * @param {Card} topCard - 棄牌堆頂部的牌
     * @returns {Object|null} 包含cardIndex和color的對象，如果沒有可以打出的牌則返回null
     */
    aiSelectCard(topCard) {
        const playableIndices = this.getPlayableCards(topCard);
        if (playableIndices.length === 0) {
            return null;
        }
        
        // 根據難度選擇不同的策略
        switch (this.difficulty) {
            case 'easy':
                // 簡單難度：隨機選擇一張可以打出的牌
                return {
                    cardIndex: playableIndices[Math.floor(Math.random() * playableIndices.length)],
                    color: this.selectColorForWildCard()
                };
                
            case 'medium':
                // 中等難度：優先打出功能牌，其次是數字牌
                // 先檢查是否有功能牌
                const functionCardIndices = playableIndices.filter(index => 
                    this.hand[index].type !== CardType.NUMBER
                );
                
                if (functionCardIndices.length > 0) {
                    const selectedIndex = functionCardIndices[Math.floor(Math.random() * functionCardIndices.length)];
                    return {
                        cardIndex: selectedIndex,
                        color: this.selectColorForWildCard()
                    };
                }
                
                // 如果沒有功能牌，則隨機選擇一張數字牌
                return {
                    cardIndex: playableIndices[Math.floor(Math.random() * playableIndices.length)],
                    color: this.selectColorForWildCard()
                };
                
            case 'hard':
                // 困難難度：優先打出+4和+2牌，其次是功能牌，最後是數字牌
                // 同時會選擇手中最多的顏色作為換色牌的顏色
                
                // 檢查是否有+4牌
                const wildDrawFourIndices = playableIndices.filter(index => 
                    this.hand[index].type === CardType.WILD_DRAW_FOUR
                );
                
                if (wildDrawFourIndices.length > 0) {
                    return {
                        cardIndex: wildDrawFourIndices[0],
                        color: this.getMostFrequentColor()
                    };
                }
                
                // 檢查是否有+2牌
                const drawTwoIndices = playableIndices.filter(index => 
                    this.hand[index].type === CardType.DRAW_TWO
                );
                
                if (drawTwoIndices.length > 0) {
                    return {
                        cardIndex: drawTwoIndices[0],
                        color: null
                    };
                }
                
                // 檢查是否有其他功能牌
                const otherFunctionCardIndices = playableIndices.filter(index => 
                    this.hand[index].type !== CardType.NUMBER && 
                    this.hand[index].type !== CardType.WILD_DRAW_FOUR && 
                    this.hand[index].type !== CardType.DRAW_TWO
                );
                
                if (otherFunctionCardIndices.length > 0) {
                    const selectedIndex = otherFunctionCardIndices[0];
                    return {
                        cardIndex: selectedIndex,
                        color: this.hand[selectedIndex].type === CardType.WILD ? this.getMostFrequentColor() : null
                    };
                }
                
                // 如果沒有功能牌，則選擇一張數字牌
                return {
                    cardIndex: playableIndices[0],
                    color: null
                };
                
            default:
                // 默認使用中等難度
                return this.aiSelectCard(topCard, 'medium');
        }
    }

    /**
     * 為換色牌選擇顏色
     * @returns {string} 選擇的顏色
     */
    selectColorForWildCard() {
        // 如果是AI玩家，選擇手中最多的顏色
        if (this.isAI) {
            return this.getMostFrequentColor();
        }
        
        // 對於人類玩家，返回null，由UI處理顏色選擇
        return null;
    }

    /**
     * 獲取手牌中出現最多的顏色
     * @returns {string} 出現最多的顏色
     */
    getMostFrequentColor() {
        const colorCounts = {};
        const colors = [CardColor.RED, CardColor.YELLOW, CardColor.GREEN, CardColor.BLUE];
        
        // 初始化顏色計數
        for (const color of colors) {
            colorCounts[color] = 0;
        }
        
        // 統計每種顏色的數量
        for (const card of this.hand) {
            if (colors.includes(card.color)) {
                colorCounts[card.color]++;
            }
        }
        
        // 找出出現最多的顏色
        let mostFrequentColor = CardColor.RED;
        let maxCount = 0;
        
        for (const color of colors) {
            if (colorCounts[color] > maxCount) {
                maxCount = colorCounts[color];
                mostFrequentColor = color;
            }
        }
        
        return mostFrequentColor;
    }

    /**
     * 渲染玩家的手牌
     * @param {boolean} isCurrentPlayer - 是否為當前玩家
     * @param {function} onCardClick - 點擊卡牌時的回調函數
     */
    renderHand(isCurrentPlayer, onCardClick = null) {
        if (isCurrentPlayer) {
            // 渲染當前玩家的手牌
            const playerHandElement = document.getElementById('player-hand');
            if (playerHandElement) {
                playerHandElement.innerHTML = '';
                
                for (let i = 0; i < this.hand.length; i++) {
                    const card = this.hand[i];
                    const cardElement = card.createCardElement();
                    
                    if (onCardClick) {
                        cardElement.addEventListener('click', () => onCardClick(i));
                    }
                    
                    playerHandElement.appendChild(cardElement);
                }
            }
            
            // 更新玩家名稱
            const playerNameElement = document.getElementById('player-name');
            if (playerNameElement) {
                playerNameElement.textContent = `${this.name} (分數: ${this.score})`;
            }
        } else {
            // 渲染對手的手牌（背面朝上）
            const opponentElement = document.getElementById(`opponent-${this.name}`);
            if (opponentElement) {
                const opponentCardsElement = opponentElement.querySelector('.opponent-cards');
                if (opponentCardsElement) {
                    opponentCardsElement.innerHTML = '';
                    
                    for (let i = 0; i < this.hand.length; i++) {
                        const cardElement = document.createElement('div');
                        cardElement.className = 'opponent-card';
                        // 確保卡片背面樣式正確應用
                        cardElement.style.backgroundImage = "url('../images/card_back.png')";
                        cardElement.style.backgroundSize = "cover";
                        cardElement.style.backgroundColor = "#000000";
                        opponentCardsElement.appendChild(cardElement);
                    }
                }
                
                // 更新對手名稱和分數
                const opponentNameElement = opponentElement.querySelector('.opponent-name');
                if (opponentNameElement) {
                    opponentNameElement.textContent = `${this.name} (分數: ${this.score})`;
                }
            }
        }
    }
} 