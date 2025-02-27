/**
 * 當DOM加載完成後初始化遊戲
 */
document.addEventListener('DOMContentLoaded', () => {
    // 創建UI實例
    const ui = new UI();
    
    // 預加載音效
    preloadSounds();
    
    // 預加載卡牌背面圖像
    preloadCardBack();
    
    console.log('UNO卡牌遊戲已初始化');
});

/**
 * 預加載音效
 */
function preloadSounds() {
    const sounds = [
        'card-play',
        'card-draw',
        'uno-call',
        'game-win',
        'turn-change',
        'shuffle'
    ];
    
    sounds.forEach(sound => {
        const audio = new Audio(`static/sounds/${sound}.mp3`);
        audio.preload = 'auto';
    });
}

/**
 * 預加載卡牌背面圖像
 */
function preloadCardBack() {
    const img = new Image();
    img.src = 'static/images/card_back.png';
} 