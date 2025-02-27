// 創建音效文件佔位符
const fs = require('fs');
const path = require('path');

// 音效文件列表
const soundFiles = [
  'card-play.mp3',
  'card-draw.mp3',
  'uno-call.mp3',
  'game-win.mp3',
  'turn-change.mp3',
  'shuffle.mp3'
];

// 確保目錄存在
const soundsDir = path.join(__dirname, '../sounds');
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

// 創建每個音效文件的佔位符
soundFiles.forEach(soundFile => {
  const filePath = path.join(soundsDir, soundFile);
  
  // 創建一個簡單的文本文件作為佔位符
  // 在實際應用中，這裡應該是真實的音效文件
  fs.writeFileSync(filePath, `這是 ${soundFile} 的佔位符。在實際應用中，這應該是一個真實的音效文件。`);
  
  console.log(`已創建佔位符: ${filePath}`);
});

console.log('所有音效文件佔位符已創建完成。'); 