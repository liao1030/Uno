from enum import Enum, auto
from colorama import Fore, Style

class CardColor(Enum):
    RED = auto()
    YELLOW = auto()
    GREEN = auto()
    BLUE = auto()
    WILD = auto()  # 用於換色牌和+4換色牌

    def __str__(self):
        if self == CardColor.RED:
            return f"{Fore.RED}紅色{Style.RESET_ALL}"
        elif self == CardColor.YELLOW:
            return f"{Fore.YELLOW}黃色{Style.RESET_ALL}"
        elif self == CardColor.GREEN:
            return f"{Fore.GREEN}綠色{Style.RESET_ALL}"
        elif self == CardColor.BLUE:
            return f"{Fore.BLUE}藍色{Style.RESET_ALL}"
        else:
            return "彩色"

class CardType(Enum):
    NUMBER = auto()  # 數字牌
    SKIP = auto()    # 跳過
    REVERSE = auto() # 反轉
    DRAW_TWO = auto() # +2
    WILD = auto()     # 換色
    WILD_DRAW_FOUR = auto() # +4換色

    def __str__(self):
        if self == CardType.NUMBER:
            return "數字"
        elif self == CardType.SKIP:
            return "跳過"
        elif self == CardType.REVERSE:
            return "反轉"
        elif self == CardType.DRAW_TWO:
            return "+2"
        elif self == CardType.WILD:
            return "換色"
        elif self == CardType.WILD_DRAW_FOUR:
            return "+4換色"

class Card:
    def __init__(self, color, card_type, value=None):
        self.color = color
        self.card_type = card_type
        self.value = value  # 只有數字牌有數值
        self.active_color = color  # 用於換色牌和+4換色牌

    def __str__(self):
        if self.card_type == CardType.NUMBER:
            return f"{self.color} {self.value}"
        else:
            return f"{self.color} {self.card_type}"

    def can_play_on(self, other_card):
        """檢查此牌是否可以在另一張牌上打出"""
        # 換色牌和+4換色牌可以在任何牌上打出
        if self.card_type in [CardType.WILD, CardType.WILD_DRAW_FOUR]:
            return True
        
        # 顏色相同可以打出
        if self.color == other_card.active_color:
            return True
        
        # 類型相同可以打出（例如兩張跳過牌）
        if self.card_type == other_card.card_type and self.card_type != CardType.NUMBER:
            return True
        
        # 數字相同可以打出
        if (self.card_type == CardType.NUMBER and 
            other_card.card_type == CardType.NUMBER and 
            self.value == other_card.value):
            return True
        
        return False

    def set_active_color(self, color):
        """設置換色牌和+4換色牌的活動顏色"""
        if self.card_type in [CardType.WILD, CardType.WILD_DRAW_FOUR]:
            self.active_color = color
            return True
        return False

    def get_score(self):
        """獲取卡牌的分數"""
        if self.card_type == CardType.NUMBER:
            return self.value
        elif self.card_type in [CardType.SKIP, CardType.REVERSE, CardType.DRAW_TWO]:
            return 20
        else:  # WILD 和 WILD_DRAW_FOUR
            return 50 