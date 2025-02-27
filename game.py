from deck import Deck
from player import Player
from card import CardColor, CardType
import random
import time

class Game:
    def __init__(self, player_names):
        self.deck = Deck()
        self.players = [Player(name) for name in player_names]
        self.current_player_idx = 0
        self.direction = 1  # 1表示順時針，-1表示逆時針
        self.winner = None
        self.game_over = False
        self.target_score = 500  # 遊戲結束的目標分數

    def setup_game(self):
        """設置遊戲，發牌並翻開第一張牌"""
        hands = self.deck.deal_initial_cards(len(self.players))
        for player_idx, hand in enumerate(hands):
            for card in hand:
                self.players[player_idx].add_card(card)
        
        # 隨機選擇第一個玩家
        self.current_player_idx = random.randint(0, len(self.players) - 1)
        
        # 處理第一張牌的效果
        top_card = self.deck.get_top_discard()
        if top_card:
            self.apply_card_effect(top_card, is_first_card=True)

    def next_player(self):
        """移動到下一個玩家"""
        self.current_player_idx = (self.current_player_idx + self.direction) % len(self.players)

    def apply_card_effect(self, card, is_first_card=False):
        """應用卡牌效果"""
        if card.card_type == CardType.SKIP:
            if not is_first_card:
                self.next_player()  # 跳過下一個玩家
        
        elif card.card_type == CardType.REVERSE:
            self.direction *= -1  # 反轉方向
            if len(self.players) == 2 and not is_first_card:
                self.next_player()  # 在兩人遊戲中，反轉相當於跳過
        
        elif card.card_type == CardType.DRAW_TWO:
            if not is_first_card:
                next_player_idx = (self.current_player_idx + self.direction) % len(self.players)
                for _ in range(2):
                    card = self.deck.draw_card()
                    if card:
                        self.players[next_player_idx].add_card(card)
                self.next_player()  # 跳過下一個玩家
        
        elif card.card_type == CardType.WILD_DRAW_FOUR:
            if not is_first_card:
                next_player_idx = (self.current_player_idx + self.direction) % len(self.players)
                for _ in range(4):
                    card = self.deck.draw_card()
                    if card:
                        self.players[next_player_idx].add_card(card)
                self.next_player()  # 跳過下一個玩家

    def play_turn(self, card_index=None, call_uno=False, choose_color=None):
        """玩家進行一回合"""
        current_player = self.players[self.current_player_idx]
        top_card = self.deck.get_top_discard()
        
        # 檢查是否有玩家忘記喊UNO
        if len(current_player.hand) == 1 and not current_player.has_called_uno and call_uno:
            current_player.has_called_uno = True
            print(f"{current_player.name} 喊了UNO!")
        
        # 如果沒有指定卡牌索引，則抽一張牌
        if card_index is None:
            drawn_card = self.deck.draw_card()
            if drawn_card:
                print(f"{current_player.name} 抽了一張牌: {drawn_card}")
                current_player.add_card(drawn_card)
                
                # 檢查抽到的牌是否可以打出
                if drawn_card.can_play_on(top_card):
                    print(f"{current_player.name} 打出了抽到的牌: {drawn_card}")
                    current_player.remove_card(len(current_player.hand) - 1)
                    
                    # 處理換色牌和+4換色牌
                    if drawn_card.card_type in [CardType.WILD, CardType.WILD_DRAW_FOUR]:
                        if choose_color:
                            drawn_card.set_active_color(choose_color)
                    
                    self.deck.add_to_discard(drawn_card)
                    self.apply_card_effect(drawn_card)
                    
                    # 檢查是否獲勝
                    if len(current_player.hand) == 0:
                        self.winner = current_player
                        self.game_over = True
                        return
                else:
                    print(f"{current_player.name} 不能打出抽到的牌")
            else:
                print("牌組已空，無法抽牌")
        else:
            # 打出指定的牌
            if 0 <= card_index < len(current_player.hand):
                card = current_player.hand[card_index]
                
                if card.can_play_on(top_card):
                    print(f"{current_player.name} 打出了: {card}")
                    current_player.remove_card(card_index)
                    
                    # 處理換色牌和+4換色牌
                    if card.card_type in [CardType.WILD, CardType.WILD_DRAW_FOUR]:
                        if choose_color:
                            card.set_active_color(choose_color)
                    
                    self.deck.add_to_discard(card)
                    self.apply_card_effect(card)
                    
                    # 檢查是否獲勝
                    if len(current_player.hand) == 0:
                        self.winner = current_player
                        self.game_over = True
                        return
                else:
                    print(f"無法打出這張牌，它與頂部牌不匹配")
                    return False
            else:
                print("無效的卡牌索引")
                return False
        
        # 移動到下一個玩家
        self.next_player()
        return True

    def check_uno_call(self, player_idx):
        """檢查玩家是否忘記喊UNO，如果忘記則罰抽兩張牌"""
        player = self.players[player_idx]
        if len(player.hand) == 1 and not player.has_called_uno:
            print(f"{player.name} 忘記喊UNO! 罰抽兩張牌")
            for _ in range(2):
                card = self.deck.draw_card()
                if card:
                    player.add_card(card)
            return True
        return False

    def end_round(self):
        """結束一輪遊戲，計算分數"""
        if self.winner:
            round_points = sum(player.get_hand_value() for player in self.players if player != self.winner)
            self.winner.add_score(round_points)
            print(f"{self.winner.name} 贏得了這一輪! 獲得 {round_points} 分")
            
            # 檢查是否有玩家達到目標分數
            for player in self.players:
                if player.score >= self.target_score:
                    return True  # 遊戲結束
        
        return False  # 繼續下一輪

    def reset_round(self):
        """重置遊戲狀態，準備下一輪"""
        self.deck = Deck()
        for player in self.players:
            player.hand = []
        self.current_player_idx = 0
        self.direction = 1
        self.winner = None
        self.game_over = False
        self.setup_game()

    def display_game_state(self):
        """顯示當前遊戲狀態"""
        print("\n" + "="*50)
        print(f"當前玩家: {self.players[self.current_player_idx].name}")
        print(f"遊戲方向: {'順時針' if self.direction == 1 else '逆時針'}")
        
        top_card = self.deck.get_top_discard()
        print(f"頂部牌: {top_card}")
        
        print("\n玩家分數:")
        for player in self.players:
            print(f"{player.name}: {player.score}")
        
        current_player = self.players[self.current_player_idx]
        print("\n" + current_player.display_hand())
        
        playable_indices = current_player.get_playable_cards(top_card)
        if playable_indices:
            print("可以打出的牌: " + ", ".join(str(i+1) for i in playable_indices))
        else:
            print("沒有可以打出的牌，需要抽牌")
        
        print("="*50 + "\n")

    def get_player_input(self):
        """獲取玩家輸入"""
        current_player = self.players[self.current_player_idx]
        top_card = self.deck.get_top_discard()
        playable_indices = current_player.get_playable_cards(top_card)
        
        if not playable_indices:
            input(f"{current_player.name} 沒有可以打出的牌，按Enter抽牌...")
            return None, False, None
        
        while True:
            try:
                action = input(f"{current_player.name} 請選擇操作 (1-{len(current_player.hand)} 打出牌, d 抽牌, u 喊UNO): ").strip().lower()
                
                if action == 'd':
                    return None, False, None
                
                if action == 'u':
                    if len(current_player.hand) == 1:
                        return None, True, None
                    else:
                        print("只有當你只剩一張牌時才能喊UNO")
                        continue
                
                card_idx = int(action) - 1
                if 0 <= card_idx < len(current_player.hand):
                    card = current_player.hand[card_idx]
                    
                    if card.can_play_on(top_card):
                        # 如果是換色牌或+4換色牌，需要選擇顏色
                        if card.card_type in [CardType.WILD, CardType.WILD_DRAW_FOUR]:
                            color_choice = input("請選擇顏色 (r 紅色, y 黃色, g 綠色, b 藍色): ").strip().lower()
                            color_map = {
                                'r': CardColor.RED,
                                'y': CardColor.YELLOW,
                                'g': CardColor.GREEN,
                                'b': CardColor.BLUE
                            }
                            if color_choice in color_map:
                                return card_idx, False, color_map[color_choice]
                            else:
                                print("無效的顏色選擇")
                                continue
                        
                        # 如果只剩一張牌，詢問是否喊UNO
                        if len(current_player.hand) == 2:
                            uno_call = input("你即將只剩一張牌，是否喊UNO? (y/n): ").strip().lower()
                            if uno_call == 'y':
                                return card_idx, True, None
                        
                        return card_idx, False, None
                    else:
                        print("這張牌不能打出，請重新選擇")
                else:
                    print("無效的卡牌索引，請重新選擇")
            except ValueError:
                print("請輸入有效的選項")

    def run_game(self):
        """運行遊戲"""
        print("歡迎來到UNO卡牌遊戲!")
        self.setup_game()
        
        while not self.game_over:
            self.display_game_state()
            card_idx, call_uno, choose_color = self.get_player_input()
            self.play_turn(card_idx, call_uno, choose_color)
            time.sleep(1)  # 稍微暫停，讓玩家有時間閱讀
        
        # 結束輪次，計算分數
        game_end = self.end_round()
        
        if game_end:
            # 找出分數最高的玩家
            winner = max(self.players, key=lambda p: p.score)
            print(f"\n遊戲結束! {winner.name} 贏得了遊戲，最終分數: {winner.score}")
        else:
            # 準備下一輪
            print("\n準備開始新的一輪...")
            self.reset_round()
            self.run_game()  # 遞歸調用，開始新的一輪 