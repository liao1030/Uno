from card import CardColor, CardType

class Player:
    def __init__(self, name):
        self.name = name
        self.hand = []
        self.score = 0
        self.has_called_uno = False

    def add_card(self, card):
        """向玩家手牌中添加一張牌"""
        self.hand.append(card)
        # 當玩家有超過一張牌時，重置UNO喊叫狀態
        if len(self.hand) > 1:
            self.has_called_uno = False

    def remove_card(self, card_index):
        """從玩家手牌中移除一張牌"""
        if 0 <= card_index < len(self.hand):
            card = self.hand.pop(card_index)
            # 檢查是否只剩一張牌
            if len(self.hand) == 1 and not self.has_called_uno:
                # 玩家沒有喊UNO，但這裡不處理懲罰，由遊戲邏輯處理
                pass
            return card
        return None

    def get_playable_cards(self, top_card):
        """獲取可以打出的牌的索引列表"""
        playable_indices = []
        for i, card in enumerate(self.hand):
            if card.can_play_on(top_card):
                playable_indices.append(i)
        return playable_indices

    def call_uno(self):
        """玩家喊UNO"""
        if len(self.hand) == 1:
            self.has_called_uno = True
            return True
        return False

    def add_score(self, points):
        """增加玩家的分數"""
        self.score += points

    def get_hand_value(self):
        """計算玩家手牌的總分值"""
        return sum(card.get_score() for card in self.hand)

    def __str__(self):
        return f"{self.name} (分數: {self.score})"

    def display_hand(self):
        """顯示玩家的手牌"""
        hand_str = f"{self.name}的手牌:\n"
        for i, card in enumerate(self.hand):
            hand_str += f"{i+1}. {card}\n"
        return hand_str 