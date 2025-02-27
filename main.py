from game import Game
import os
import platform

def clear_screen():
    """清除控制台屏幕"""
    if platform.system() == "Windows":
        os.system('cls')
    else:
        os.system('clear')

def get_player_names():
    """獲取玩家姓名"""
    while True:
        try:
            num_players = int(input("請輸入玩家數量 (2-10): "))
            if 2 <= num_players <= 10:
                break
            else:
                print("玩家數量必須在2到10之間")
        except ValueError:
            print("請輸入有效的數字")
    
    player_names = []
    for i in range(num_players):
        name = input(f"請輸入玩家 {i+1} 的名字: ")
        player_names.append(name)
    
    return player_names

def main():
    """主函數"""
    clear_screen()
    print("="*50)
    print("歡迎來到UNO卡牌遊戲!")
    print("="*50)
    print("\n遊戲規則:")
    print("1. 每位玩家初始獲得7張牌")
    print("2. 玩家需出與棄牌堆頂部卡牌顏色或數字/符號相同的卡牌")
    print("3. 若無法出牌，必須從抽牌堆抽一張牌")
    print("4. 當玩家只剩一張牌時，必須喊'UNO!'，否則罰抽2張牌")
    print("5. 最先出完手中所有卡牌的玩家獲勝")
    print("\n特殊牌效果:")
    print("- 跳過: 下一位玩家喪失本回合出牌機會")
    print("- 反轉: 遊戲進行方向反轉")
    print("- +2: 下一位玩家必須抽2張牌並喪失本回合出牌機會")
    print("- 換色: 出牌者可以選擇下一張牌的顏色")
    print("- +4換色: 下一位玩家必須抽4張牌，並由出牌者選擇下一張牌的顏色")
    print("\n")
    
    player_names = get_player_names()
    game = Game(player_names)
    
    try:
        game.run_game()
    except KeyboardInterrupt:
        print("\n遊戲已被中斷。感謝遊玩!")
    except Exception as e:
        print(f"\n遊戲發生錯誤: {e}")
    
    print("\n感謝遊玩UNO卡牌遊戲!")

if __name__ == "__main__":
    main() 