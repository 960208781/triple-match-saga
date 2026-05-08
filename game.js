/**
 * 三消奇缘 - Triple Match Saga
 * 微信小游戏入口文件
 */

// 导入所有模块
import './js/wechat.js';
import './js/sound.js';
import './js/particles.js';
import './js/candy.js';
import './js/animals.js';
import './js/desserts.js';
import './js/fruits.js';
import './js/themes.js';
import './js/board.js';
import './js/pet.js';
import './js/roguelike.js';
import './js/evolve.js';
import './js/shop.js';
import './js/eggs.js';
import './js/ui.js';
import './js/main.js';

// 获取画布和上下文
const canvas = wx.createCanvas();
const ctx = canvas.getContext('2d');

// 设置全局画布
window.canvas = canvas;
window.ctx = ctx;
window.innerWidth = canvas.width;
window.innerHeight = canvas.height;

// 初始化游戏
wx.onShow(() => {
  if (window.gameInit) {
    window.gameInit();
  }
});

// 处理触摸事件
wx.onTouchStart((e) => {
  if (window.handleTouchStart) {
    window.handleTouchStart(e.touches[0]);
  }
});

wx.onTouchMove((e) => {
  if (window.handleTouchMove) {
    window.handleTouchMove(e.touches[0]);
  }
});

wx.onTouchEnd((e) => {
  if (window.handleTouchEnd) {
    window.handleTouchEnd(e.changedTouches[0]);
  }
});

// 处理音频
wx.onAudioInterruptionBegin(() => {
  if (window.pauseAllSounds) {
    window.pauseAllSounds();
  }
});

wx.onAudioInterruptionEnd(() => {
  if (window.resumeAllSounds) {
    window.resumeAllSounds();
  }
});

// 游戏循环
let lastTime = 0;
function gameLoop(timestamp) {
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  
  if (window.update && window.render) {
    window.update(deltaTime);
    window.render();
  }
  
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

console.log('三消奇缘 - Triple Match Saga 已启动');
