// 創建UNO卡牌背面圖像
const fs = require('fs');
const { createCanvas } = require('canvas');

// 創建畫布
const canvas = createCanvas(200, 300);
const ctx = canvas.getContext('2d');

// 繪製卡牌背景（黑色）
ctx.fillStyle = '#000000';
ctx.fillRect(0, 0, 200, 300);

// 繪製卡牌邊框
ctx.strokeStyle = '#333333';
ctx.lineWidth = 5;
ctx.strokeRect(5, 5, 190, 290);

// 繪製UNO標誌橢圓
ctx.fillStyle = '#222222';
ctx.beginPath();
ctx.ellipse(100, 150, 70, 100, Math.PI / 4, 0, 2 * Math.PI);
ctx.fill();

// 繪製UNO文字
ctx.fillStyle = '#FFFF00';
ctx.font = 'bold 60px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('UNO', 100, 150);

// 將畫布轉換為PNG並保存
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('./static/images/card_back.png', buffer);

console.log('卡牌背面圖像已創建並保存到 static/images/card_back.png'); 