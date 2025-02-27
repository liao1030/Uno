/**
 * 牌組類
 */
class Deck {
    /**
     * 創建一個牌組
     */
    constructor() {
        this.cards = [];
        this.discardPile = [];
        this.initializeDeck();
        this.shuffle();
    }

    /**
     * 初始化一副完整的UNO牌組
     */
    initializeDeck() {
        // 添加數字牌
        const colors = [CardColor.RED, CardColor.YELLOW, CardColor.GREEN, CardColor.BLUE];
        
        // 每種顏色各有一張0
        for (const color of colors) {
            this.cards.push(new Card(color, CardType.NUMBER, 0));
        }
        
        // 每種顏色各有兩張1-9
        for (const color of colors) {
            for (let value = 1; value <= 9; value++) {
                this.cards.push(new Card(color, CardType.NUMBER, value));
                this.cards.push(new Card(color, CardType.NUMBER, value));
            }
        }
        
        // 添加功能牌（每種顏色各有2張）
        for (const color of colors) {
            for (let i = 0; i < 2; i++) {
                this.cards.push(new Card(color, CardType.SKIP));
                this.cards.push(new Card(color, CardType.REVERSE));
                this.cards.push(new Card(color, CardType.DRAW_TWO));
            }
        }
        
        // 添加特殊牌
        for (let i = 0; i < 4; i++) {
            this.cards.push(new Card(CardColor.WILD, CardType.WILD));
            this.cards.push(new Card(CardColor.WILD, CardType.WILD_DRAW_FOUR));
        }
    }

    /**
     * 洗牌
     */
    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    /**
     * 從牌組中抽一張牌
     * @returns {Card|null} 抽到的牌，如果牌組為空則返回null
     */
    drawCard() {
        if (this.cards.length === 0) {
            // 如果牌組空了，將棄牌堆（除了最上面的一張）重新洗牌
            if (this.discardPile.length <= 1) {
                return null; // 如果棄牌堆也沒有足夠的牌，返回null
            }
            
            const topCard = this.discardPile.pop();
            this.cards = this.discardPile;
            this.discardPile = [topCard];
            this.shuffle();
            
            // 播放洗牌音效
            this.playShuffleSound();
        }
        
        return this.cards.pop();
    }

    /**
     * 將牌添加到棄牌堆
     * @param {Card} card - 要添加的牌
     */
    addToDiscard(card) {
        this.discardPile.push(card);
    }

    /**
     * 獲取棄牌堆最上面的牌
     * @returns {Card|null} 棄牌堆最上面的牌，如果棄牌堆為空則返回null
     */
    getTopDiscard() {
        if (this.discardPile.length === 0) {
            return null;
        }
        return this.discardPile[this.discardPile.length - 1];
    }

    /**
     * 為每位玩家發初始手牌
     * @param {number} numPlayers - 玩家數量
     * @param {number} cardsPerPlayer - 每位玩家的初始手牌數量
     * @returns {Array<Array<Card>>} 每位玩家的手牌
     */
    dealInitialCards(numPlayers, cardsPerPlayer = 7) {
        const hands = Array(numPlayers).fill().map(() => []);
        
        for (let i = 0; i < cardsPerPlayer; i++) {
            for (let playerIdx = 0; playerIdx < numPlayers; playerIdx++) {
                const card = this.drawCard();
                if (card) {
                    hands[playerIdx].push(card);
                }
            }
        }
        
        // 翻開第一張牌
        let firstCard = this.drawCard();
        
        // 確保第一張牌不是特殊牌
        while (firstCard && (firstCard.type === CardType.WILD || firstCard.type === CardType.WILD_DRAW_FOUR)) {
            this.cards.push(firstCard);
            this.shuffle();
            firstCard = this.drawCard();
        }
        
        if (firstCard) {
            this.addToDiscard(firstCard);
        }
        
        return hands;
    }

    /**
     * 播放洗牌音效
     */
    playShuffleSound() {
        // 檢查是否啟用了音效
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle && soundToggle.checked) {
            const shuffleSound = new Audio('static/sounds/shuffle.mp3');
            shuffleSound.play().catch(e => console.log('無法播放洗牌音效:', e));
        }
    }

    /**
     * 渲染牌組和棄牌堆
     */
    render() {
        // 渲染牌組
        const deckElement = document.getElementById('deck');
        if (deckElement) {
            deckElement.innerHTML = '';
            if (this.cards.length > 0) {
                const cardBackElement = document.createElement('div');
                cardBackElement.className = 'card-back';
                deckElement.appendChild(cardBackElement);
            }
        }
        
        // 渲染棄牌堆
        const discardPileElement = document.getElementById('discard-pile');
        if (discardPileElement) {
            discardPileElement.innerHTML = '';
            const topCard = this.getTopDiscard();
            if (topCard) {
                discardPileElement.appendChild(topCard.createCardElement());
            }
        }
    }
} 