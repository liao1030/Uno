/**
 * 卡牌顏色枚舉
 */
const CardColor = {
    RED: 'red',
    YELLOW: 'yellow',
    GREEN: 'green',
    BLUE: 'blue',
    WILD: 'wild'
};

/**
 * 卡牌類型枚舉
 */
const CardType = {
    NUMBER: 'number',
    SKIP: 'skip',
    REVERSE: 'reverse',
    DRAW_TWO: 'draw_two',
    WILD: 'wild',
    WILD_DRAW_FOUR: 'wild_draw_four'
};

/**
 * 卡牌類
 */
class Card {
    /**
     * 創建一張卡牌
     * @param {string} color - 卡牌顏色
     * @param {string} type - 卡牌類型
     * @param {number|null} value - 數字牌的數值
     */
    constructor(color, type, value = null) {
        this.color = color;
        this.type = type;
        this.value = value;
        this.activeColor = color; // 用於換色牌和+4換色牌
        this.id = this.generateId();
    }

    /**
     * 生成卡牌的唯一ID
     * @returns {string} 卡牌ID
     */
    generateId() {
        return `${this.color}-${this.type}${this.value !== null ? '-' + this.value : ''}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 檢查此牌是否可以在另一張牌上打出
     * @param {Card} otherCard - 另一張牌
     * @returns {boolean} 是否可以打出
     */
    canPlayOn(otherCard) {
        // 換色牌和+4換色牌可以在任何牌上打出
        if (this.type === CardType.WILD || this.type === CardType.WILD_DRAW_FOUR) {
            return true;
        }
        
        // 顏色相同可以打出
        if (this.color === otherCard.activeColor) {
            return true;
        }
        
        // 類型相同可以打出（例如兩張跳過牌）
        if (this.type === otherCard.type && this.type !== CardType.NUMBER) {
            return true;
        }
        
        // 數字相同可以打出
        if (this.type === CardType.NUMBER && 
            otherCard.type === CardType.NUMBER && 
            this.value === otherCard.value) {
            return true;
        }
        
        return false;
    }

    /**
     * 設置換色牌和+4換色牌的活動顏色
     * @param {string} color - 新的顏色
     * @returns {boolean} 是否成功設置
     */
    setActiveColor(color) {
        if (this.type === CardType.WILD || this.type === CardType.WILD_DRAW_FOUR) {
            this.activeColor = color;
            return true;
        }
        return false;
    }

    /**
     * 獲取卡牌的分數
     * @returns {number} 分數
     */
    getScore() {
        if (this.type === CardType.NUMBER) {
            return this.value;
        } else if (this.type === CardType.SKIP || this.type === CardType.REVERSE || this.type === CardType.DRAW_TWO) {
            return 20;
        } else { // WILD 和 WILD_DRAW_FOUR
            return 50;
        }
    }

    /**
     * 渲染卡牌
     * @returns {HTMLElement} 卡牌元素
     */
    render() {
        return this.createCardElement();
    }

    /**
     * 創建卡牌的HTML元素
     * @param {boolean} faceDown - 是否面朝下
     * @returns {HTMLElement} 卡牌元素
     */
    createCardElement(faceDown = false) {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${this.color}`;
        cardElement.dataset.id = this.id;
        
        if (faceDown) {
            cardElement.classList.add('face-down');
            return cardElement;
        }
        
        const cardContent = document.createElement('div');
        cardContent.className = 'card-content';
        
        if (this.type === CardType.NUMBER) {
            cardContent.innerHTML = `<span class="card-number">${this.value}</span>`;
        } else {
            let symbol = '';
            switch (this.type) {
                case CardType.SKIP:
                    symbol = '⊘';
                    break;
                case CardType.REVERSE:
                    symbol = '⟲';
                    break;
                case CardType.DRAW_TWO:
                    symbol = '+2';
                    break;
                case CardType.WILD:
                    symbol = '🌈';
                    break;
                case CardType.WILD_DRAW_FOUR:
                    symbol = '+4';
                    break;
            }
            cardContent.innerHTML = `<span class="card-symbol">${symbol}</span>`;
        }
        
        cardElement.appendChild(cardContent);
        return cardElement;
    }

    /**
     * 獲取卡牌的描述
     * @returns {string} 卡牌描述
     */
    toString() {
        const colorNames = {
            [CardColor.RED]: '紅色',
            [CardColor.YELLOW]: '黃色',
            [CardColor.GREEN]: '綠色',
            [CardColor.BLUE]: '藍色',
            [CardColor.WILD]: '彩色'
        };
        
        const typeNames = {
            [CardType.NUMBER]: '數字',
            [CardType.SKIP]: '跳過',
            [CardType.REVERSE]: '反轉',
            [CardType.DRAW_TWO]: '+2',
            [CardType.WILD]: '換色',
            [CardType.WILD_DRAW_FOUR]: '+4換色'
        };
        
        if (this.type === CardType.NUMBER) {
            return `${colorNames[this.color]} ${this.value}`;
        } else {
            return `${colorNames[this.color]} ${typeNames[this.type]}`;
        }
    }
} 