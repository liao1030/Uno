import random
from card import Card, CardColor, CardType

class Deck:
    def __init__(self):
        self.cards = []
        self.discard_pile = []
        self.initialize_deck()
        self.shuffle()

    def initialize_deck(self):
        """初始化一副完整的UNO牌組"""
        # 添加數字牌
        colors = [CardColor.RED, CardColor.YELLOW, CardColor.GREEN, CardColor.BLUE]
        
        # 每種顏色各有一張0
        for color in colors:
            self.cards.append(Card(color, CardType.NUMBER, 0))
        
        # 每種顏色各有兩張1-9
        for color in colors:
            for value in range(1, 10):
                self.cards.append(Card(color, CardType.NUMBER, value))
                self.cards.append(Card(color, CardType.NUMBER, value))
        
        # 添加功能牌（每種顏色各有2張）
        for color in colors:
            for _ in range(2):
                self.cards.append(Card(color, CardType.SKIP))
                self.cards.append(Card(color, CardType.REVERSE))
                self.cards.append(Card(color, CardType.DRAW_TWO))
        
        # 添加特殊牌
        for _ in range(4):
            self.cards.append(Card(CardColor.WILD, CardType.WILD))
            self.cards.append(Card(CardColor.WILD, CardType.WILD_DRAW_FOUR))

    def shuffle(self):
        """洗牌"""
        random.shuffle(self.cards)

    def draw_card(self):
        """從牌組中抽一張牌"""
        if not self.cards:
            # 如果牌組空了，將棄牌堆（除了最上面的一張）重新洗牌
            if len(self.discard_pile) <= 1:
                return None  # 如果棄牌堆也沒有足夠的牌，返回None
            
            top_card = self.discard_pile.pop()
            self.cards = self.discard_pile
            self.discard_pile = [top_card]
            self.shuffle()
        
        return self.cards.pop()

    def add_to_discard(self, card):
        """將牌添加到棄牌堆"""
        self.discard_pile.append(card)

    def get_top_discard(self):
        """獲取棄牌堆最上面的牌"""
        if not self.discard_pile:
            return None
        return self.discard_pile[-1]

    def deal_initial_cards(self, num_players, cards_per_player=7):
        """為每位玩家發初始手牌"""
        hands = [[] for _ in range(num_players)]
        
        for _ in range(cards_per_player):
            for player_idx in range(num_players):
                card = self.draw_card()
                if card:
                    hands[player_idx].append(card)
        
        # 翻開第一張牌
        first_card = self.draw_card()
        
        # 確保第一張牌不是特殊牌
        while first_card and first_card.card_type in [CardType.WILD, CardType.WILD_DRAW_FOUR]:
            self.cards.append(first_card)
            self.shuffle()
            first_card = self.draw_card()
        
        if first_card:
            self.add_to_discard(first_card)
        
        return hands 