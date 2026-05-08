/**
 * UI系统
 * 处理所有界面渲染和交互
 */

(function() {
  'use strict';
  
  // UI状态
  let currentScreen = 'menu'; // menu, levelSelect, game, shop, pause, result
  let selectedLevel = 1;
  let hoveredButton = null;
  
  // 游戏状态
  let gameState = {
    score: 0,
    moves: 0,
    combo: 0,
    level: 1,
    stars: 0,
    paused: false
  };
  
  // 屏幕尺寸
  let screenWidth = 375;
  let screenHeight = 667;
  
  // 按钮配置
  const buttons = {
    menu: [
      { id: 'play', text: '开始游戏', x: 0, y: 0, width: 200, height: 50 },
      { id: 'shop', text: '商城', x: 0, y: 0, width: 200, height: 50 },
      { id: 'settings', text: '设置', x: 0, y: 0, width: 200, height: 50 }
    ],
    game: [
      { id: 'pause', text: '⏸', x: 0, y: 0, width: 40, height: 40 },
      { id: 'item_hammer', text: '🔨', x: 0, y: 0, width: 50, height: 50 },
      { id: 'item_bomb', text: '💣', x: 0, y: 0, width: 50, height: 50 },
      { id: 'item_refresh', text: '🔄', x: 0, y: 0, width: 50, height: 50 }
    ],
    pause: [
      { id: 'resume', text: '继续游戏', x: 0, y: 0, width: 180, height: 45 },
      { id: 'settings', text: '游戏设置', x: 0, y: 0, width: 180, height: 45 },
      { id: 'quit', text: '退出游戏', x: 0, y: 0, width: 180, height: 45 }
    ],
    result: [
      { id: 'retry', text: '重试', x: 0, y: 0, width: 120, height: 45 },
      { id: 'next', text: '下一关', x: 0, y: 0, width: 120, height: 45 },
      { id: 'menu', text: '主菜单', x: 0, y: 0, width: 120, height: 45 }
    ],
    shop: [
      { id: 'back', text: '返回', x: 0, y: 0, width: 80, height: 40 }
    ]
  };
  
  // 初始化UI
  function init(width, height) {
    screenWidth = width;
    screenHeight = height;
    updateButtonPositions();
  }
  
  // 更新按钮位置
  function updateButtonPositions() {
    const centerX = screenWidth / 2;
    
    // 主菜单按钮
    buttons.menu.forEach((btn, i) => {
      btn.x = centerX - btn.width / 2;
      btn.y = screenHeight * 0.5 + i * 70;
    });
    
    // 游戏界面按钮
    buttons.game.forEach((btn, i) => {
      if (btn.id === 'pause') {
        btn.x = screenWidth - 50;
        btn.y = 10;
      } else {
        btn.x = 10 + i * 60;
        btn.y = screenHeight - 70;
      }
    });
    
    // 暂停菜单按钮
    buttons.pause.forEach((btn, i) => {
      btn.x = centerX - btn.width / 2;
      btn.y = screenHeight * 0.35 + i * 60;
    });
    
    // 结果界面按钮
    buttons.result[0].x = centerX - 130;
    buttons.result[0].y = screenHeight * 0.7;
    buttons.result[1].x = centerX + 10;
    buttons.result[1].y = screenHeight * 0.7;
    buttons.result[2].x = centerX - 60;
    buttons.result[2].y = screenHeight * 0.7 + 60;
    
    // 商城按钮
    buttons.shop[0].x = 10;
    buttons.shop[0].y = 10;
  }
  
  // 设置当前屏幕
  function setScreen(screen) {
    currentScreen = screen;
    updateButtonPositions();
  }
  
  // 获取当前屏幕
  function getScreen() {
    return currentScreen;
  }
  
  // 更新游戏状态
  function updateGameState(state) {
    gameState = { ...gameState, ...state };
  }
  
  // 处理点击
  function handleClick(x, y) {
    const currentButtons = buttons[currentScreen] || [];
    
    for (const btn of currentButtons) {
      if (x >= btn.x && x <= btn.x + btn.width &&
          y >= btn.y && y <= btn.y + btn.height) {
        return btn.id;
      }
    }
    
    return null;
  }
  
  // 处理悬停
  function handleHover(x, y) {
    const currentButtons = buttons[currentScreen] || [];
    hoveredButton = null;
    
    for (const btn of currentButtons) {
      if (x >= btn.x && x <= btn.x + btn.width &&
          y >= btn.y && y <= btn.y + btn.height) {
        hoveredButton = btn.id;
        break;
      }
    }
    
    return hoveredButton;
  }
  
  // 绘制主菜单
  function drawMenu(ctx) {
    const centerX = screenWidth / 2;
    
    // 背景
    const bgGradient = ctx.createLinearGradient(0, 0, 0, screenHeight);
    bgGradient.addColorStop(0, '#FF6B9D');
    bgGradient.addColorStop(0.5, '#C44569');
    bgGradient.addColorStop(1, '#6B2D5C');
    
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, screenWidth, screenHeight);
    
    // 装饰元素
    drawMenuDecorations(ctx);
    
    // 标题
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 标题阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillText('三消奇缘', centerX + 2, screenHeight * 0.2 + 2);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('三消奇缘', centerX, screenHeight * 0.2);
    
    // 英文副标题
    ctx.font = '18px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText('Triple Match Saga', centerX, screenHeight * 0.28);
    
    // 积分显示
    const points = window.Shop ? window.Shop.getPoints() : 0;
    ctx.font = '16px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`积分: ${points}`, centerX, screenHeight * 0.38);
    
    // 按钮
    buttons.menu.forEach(btn => {
      drawButton(ctx, btn);
    });
    
    // 版本信息
    ctx.font = '12px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillText('v1.0.0', centerX, screenHeight - 20);
  }
  
  // 绘制菜单装饰
  function drawMenuDecorations(ctx) {
    // 糖果装饰
    const candyColors = ['#FF4757', '#FF9F43', '#FFD32A', '#26DE81', '#45AAF2', '#A55EEA'];
    
    for (let i = 0; i < 10; i++) {
      const x = (i * 47 + 20) % screenWidth;
      const y = (i * 31 + 50) % screenHeight;
      const size = 15 + (i % 3) * 5;
      
      ctx.fillStyle = candyColors[i % candyColors.length];
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.globalAlpha = 1;
  }
  
  // 绘制关卡选择
  function drawLevelSelect(ctx) {
    // 背景
    const bgGradient = ctx.createLinearGradient(0, 0, 0, screenHeight);
    bgGradient.addColorStop(0, '#4ECDC4');
    bgGradient.addColorStop(1, '#2C3E50');
    
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, screenWidth, screenHeight);
    
    // 标题
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('选择关卡', screenWidth / 2, 40);
    
    // 关卡网格
    const cols = 5;
    const cellSize = 55;
    const padding = 15;
    const startX = (screenWidth - cols * (cellSize + padding)) / 2;
    const startY = 80;
    
    for (let i = 0; i < 80; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = startX + col * (cellSize + padding);
      const y = startY + row * (cellSize + padding);
      
      const level = i + 1;
      const theme = window.Themes ? window.Themes.getThemeByLevel(level) : 'candy';
      const themeConfig = window.Themes ? window.Themes.getThemeConfig(theme) : null;
      
      // 背景
      const isUnlocked = level <= (gameState.maxUnlockedLevel || 1);
      const isSelected = level === selectedLevel;
      
      if (isSelected) {
        ctx.fillStyle = '#FFD700';
      } else if (isUnlocked) {
        ctx.fillStyle = themeConfig ? themeConfig.colors.primary : '#FFFFFF';
      } else {
        ctx.fillStyle = '#666666';
      }
      
      ctx.beginPath();
      ctx.roundRect(x, y, cellSize, cellSize, 8);
      ctx.fill();
      
      // 关卡号
      ctx.fillStyle = isUnlocked ? '#FFFFFF' : '#999999';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(level.toString(), x + cellSize / 2, y + cellSize / 2);
      
      // 主题图标
      if (isUnlocked && themeConfig) {
        ctx.font = '12px Arial';
        ctx.fillText(themeConfig.name.charAt(0), x + cellSize / 2, y + cellSize - 10);
      }
    }
    
    // 返回按钮
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('← 返回', 20, screenHeight - 30);
  }
  
  // 绘制游戏界面
  function drawGame(ctx, boardState) {
    const theme = window.Themes ? window.Themes.getThemeByLevel(gameState.level) : 'candy';
    
    // 背景
    if (window.Themes) {
      window.Themes.drawBackground(ctx, theme, screenWidth, screenHeight);
    }
    
    // HUD
    drawHUD(ctx);
    
    // 棋盘
    if (boardState) {
      drawBoard(ctx, boardState, theme);
    }
    
    // 宠物
    drawPetUI(ctx);
    
    // 道具栏
    drawItemBar(ctx);
    
    // 暂停按钮
    const pauseBtn = buttons.game.find(b => b.id === 'pause');
    if (pauseBtn) {
      drawButton(ctx, pauseBtn);
    }
  }
  
  // 绘制HUD
  function drawHUD(ctx) {
    // 顶部栏背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, screenWidth, 60);
    
    // 关卡
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`关卡 ${gameState.level}`, 15, 25);
    
    // 分数
    ctx.font = '16px Arial';
    ctx.fillText(`分数: ${gameState.score}`, 15, 48);
    
    // 步数
    ctx.textAlign = 'right';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`${gameState.moves}`, screenWidth - 15, 35);
    ctx.font = '12px Arial';
    ctx.fillText('步数', screenWidth - 15, 52);
    
    // 连击显示
    if (gameState.combo > 1) {
      ctx.textAlign = 'center';
      ctx.font = 'bold 28px Arial';
      ctx.fillStyle = '#FFD700';
      ctx.fillText(`${gameState.combo}连击!`, screenWidth / 2, 35);
    }
  }
  
  // 绘制棋盘
  function drawBoard(ctx, boardState, theme) {
    const { board, rows, cols, cellSize, padding } = boardState;
    
    // 棋盘背景
    const boardWidth = cols * cellSize + padding * 2;
    const boardHeight = rows * cellSize + padding * 2;
    const boardX = (screenWidth - boardWidth) / 2;
    const boardY = 70;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.roundRect(boardX, boardY, boardWidth, boardHeight, 10);
    ctx.fill();
    
    // 绘制元素
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = board[row][col];
        if (!cell || !cell.type) continue;
        
        const x = boardX + cell.x;
        const y = boardY + cell.y;
        
        // 检查是否是金色模式
        const isGolden = window.Eggs && window.Eggs.isGoldenMode();
        
        if (isGolden) {
          if (window.Themes) {
            window.Themes.drawGoldenElement(ctx, x, y, cellSize, theme, cell.type, {
              scale: cell.scale,
              alpha: cell.alpha
            });
          }
        } else {
          if (window.Themes) {
            window.Themes.drawElement(ctx, x, y, cellSize, theme, cell.type, {
              scale: cell.scale,
              alpha: cell.alpha
            });
          }
        }
        
        // 选中效果
        if (cell.selected) {
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.roundRect(x + 2, y + 2, cellSize - 4, cellSize - 4, 5);
          ctx.stroke();
        }
      }
    }
  }
  
  // 绘制宠物UI
  function drawPetUI(ctx) {
    const petX = screenWidth - 80;
    const petY = screenHeight - 150;
    const petSize = 60;
    
    // 宠物背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(petX + petSize / 2, petY + petSize / 2, petSize / 2 + 5, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制宠物
    if (window.Pet) {
      window.Pet.drawPet(ctx, petX, petY, petSize, { showGlow: true });
      
      // 能量条
      window.Pet.drawEnergyBar(ctx, petX - 10, petY + petSize + 10, petSize + 20, 15);
    }
  }
  
  // 绘制道具栏
  function drawItemBar(ctx) {
    const barY = screenHeight - 60;
    const itemSize = 45;
    const padding = 10;
    
    // 背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, barY - 10, screenWidth, 70);
    
    // 道具
    const items = [
      { id: 'hammer', icon: '🔨', name: '锤子' },
      { id: 'bomb', icon: '💣', name: '炸弹' },
      { id: 'refresh', icon: '🔄', name: '刷新' },
      { id: 'extra_moves', icon: '+5', name: '+5步' }
    ];
    
    items.forEach((item, i) => {
      const x = padding + i * (itemSize + padding);
      const y = barY;
      
      // 获取道具数量
      const count = window.Shop ? window.Shop.getItemCount(item.id) : 0;
      
      // 背景
      ctx.fillStyle = count > 0 ? 'rgba(255, 255, 255, 0.3)' : 'rgba(100, 100, 100, 0.3)';
      ctx.beginPath();
      ctx.roundRect(x, y, itemSize, itemSize, 8);
      ctx.fill();
      
      // 图标
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.icon, x + itemSize / 2, y + itemSize / 2);
      
      // 数量
      ctx.font = '12px Arial';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(count.toString(), x + itemSize - 8, y + itemSize - 8);
    });
  }
  
  // 绘制暂停菜单
  function drawPauseMenu(ctx) {
    // 半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, screenWidth, screenHeight);
    
    // 菜单框
    const menuWidth = 250;
    const menuHeight = 300;
    const menuX = (screenWidth - menuWidth) / 2;
    const menuY = (screenHeight - menuHeight) / 2;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(menuX, menuY, menuWidth, menuHeight, 15);
    ctx.fill();
    
    // 标题
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏暂停', screenWidth / 2, menuY + 40);
    
    // 当前状态
    ctx.font = '16px Arial';
    ctx.fillText(`当前得分: ${gameState.score}`, screenWidth / 2, menuY + 80);
    ctx.fillText(`剩余步数: ${gameState.moves}`, screenWidth / 2, menuY + 110);
    
    // 按钮
    buttons.pause.forEach(btn => {
      drawButton(ctx, btn);
    });
  }
  
  // 绘制结果界面
  function drawResult(ctx) {
    // 背景
    const bgGradient = ctx.createLinearGradient(0, 0, 0, screenHeight);
    bgGradient.addColorStop(0, '#2C3E50');
    bgGradient.addColorStop(1, '#1A252F');
    
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, screenWidth, screenHeight);
    
    const centerX = screenWidth / 2;
    
    // 结果标题
    const isSuccess = gameState.stars > 0;
    ctx.fillStyle = isSuccess ? '#FFD700' : '#FF4500';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(isSuccess ? '关卡完成!' : '关卡失败', centerX, screenHeight * 0.15);
    
    // 星星
    if (isSuccess) {
      const starY = screenHeight * 0.28;
      for (let i = 0; i < 3; i++) {
        const starX = centerX + (i - 1) * 60;
        ctx.fillStyle = i < gameState.stars ? '#FFD700' : '#666666';
        ctx.font = '40px Arial';
        ctx.fillText('★', starX, starY);
      }
    }
    
    // 分数
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.fillText(`得分: ${gameState.score}`, centerX, screenHeight * 0.45);
    
    // 目标分数
    const levelConfig = window.Themes ? window.Themes.getLevelConfig(gameState.level) : null;
    if (levelConfig) {
      ctx.font = '14px Arial';
      ctx.fillStyle = '#AAAAAA';
      ctx.fillText(`目标: ${levelConfig.starScores[0]}`, centerX, screenHeight * 0.52);
    }
    
    // 按钮
    buttons.result.forEach(btn => {
      drawButton(ctx, btn);
    });
  }
  
  // 绘制商城界面
  function drawShop(ctx) {
    // 背景
    const bgGradient = ctx.createLinearGradient(0, 0, 0, screenHeight);
    bgGradient.addColorStop(0, '#667eea');
    bgGradient.addColorStop(1, '#764ba2');
    
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, screenWidth, screenHeight);
    
    const centerX = screenWidth / 2;
    
    // 标题
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('商城', centerX, 50);
    
    // 积分
    const points = window.Shop ? window.Shop.getPoints() : 0;
    ctx.font = '18px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`积分: ${points}`, centerX, 85);
    
    // 标签页
    const tabs = ['皮肤', '道具', '宠物'];
    const tabWidth = screenWidth / 3;
    
    tabs.forEach((tab, i) => {
      const x = i * tabWidth;
      ctx.fillStyle = i === 0 ? 'rgba(255, 255, 255, 0.3)' : 'transparent';
      ctx.fillRect(x, 100, tabWidth, 40);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '16px Arial';
      ctx.fillText(tab, x + tabWidth / 2, 125);
    });
    
    // 物品列表
    const shopData = window.Shop ? window.Shop.getShopData() : null;
    if (shopData) {
      const startY = 160;
      const itemHeight = 70;
      
      shopData.skins.slice(0, 4).forEach((item, i) => {
        const y = startY + i * itemHeight;
        
        // 物品背景
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.roundRect(20, y, screenWidth - 40, itemHeight - 10, 10);
        ctx.fill();
        
        // 物品名称
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(item.name, 80, y + 25);
        
        // 描述
        ctx.font = '12px Arial';
        ctx.fillStyle = '#AAAAAA';
        ctx.fillText(item.description, 80, y + 45);
        
        // 价格/状态
        ctx.textAlign = 'right';
        if (item.owned) {
          ctx.fillStyle = '#32CD32';
          ctx.fillText('已拥有', screenWidth - 30, y + 35);
        } else {
          ctx.fillStyle = '#FFD700';
          ctx.fillText(`${item.price} 积分`, screenWidth - 30, y + 35);
        }
      });
    }
    
    // 返回按钮
    const backBtn = buttons.shop[0];
    if (backBtn) {
      drawButton(ctx, backBtn);
    }
  }
  
  // 绘制按钮
  function drawButton(ctx, btn) {
    const isHovered = hoveredButton === btn.id;
    
    // 按钮背景
    ctx.fillStyle = isHovered ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.roundRect(btn.x, btn.y, btn.width, btn.height, 10);
    ctx.fill();
    
    // 边框
    ctx.strokeStyle = isHovered ? '#FFD700' : 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 文字
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${btn.height * 0.4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(btn.text, btn.x + btn.width / 2, btn.y + btn.height / 2);
  }
  
  // 绘制设置界面
  function drawSettings(ctx) {
    // 半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, screenWidth, screenHeight);
    
    const centerX = screenWidth / 2;
    
    // 标题
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('设置', centerX, 80);
    
    // 音效开关
    const isMuted = window.Sound ? window.Sound.isMuted() : false;
    
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('音效', 50, 150);
    
    ctx.fillStyle = isMuted ? '#FF4500' : '#32CD32';
    ctx.beginPath();
    ctx.roundRect(screenWidth - 120, 130, 70, 30, 15);
    ctx.fill();
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(isMuted ? '关闭' : '开启', screenWidth - 85, 150);
    
    // 音量滑块
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('音乐音量', 50, 210);
    
    const musicVolume = window.Sound ? window.Sound.getMusicVolume() : 0.5;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.roundRect(50, 230, screenWidth - 100, 10, 5);
    ctx.fill();
    
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.roundRect(50, 230, (screenWidth - 100) * musicVolume, 10, 5);
    ctx.fill();
    
    // 返回按钮
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.roundRect(centerX - 60, screenHeight - 100, 120, 45, 10);
    ctx.fill();
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('返回', centerX, screenHeight - 75);
  }
  
  // 渲染UI
  function render(ctx, boardState = null) {
    switch (currentScreen) {
      case 'menu':
        drawMenu(ctx);
        break;
      case 'levelSelect':
        drawLevelSelect(ctx);
        break;
      case 'game':
        drawGame(ctx, boardState);
        break;
      case 'pause':
        drawGame(ctx, boardState);
        drawPauseMenu(ctx);
        break;
      case 'result':
        drawResult(ctx);
        break;
      case 'shop':
        drawShop(ctx);
        break;
      case 'settings':
        drawSettings(ctx);
        break;
    }
    
    // 绘制粒子
    if (window.Particles) {
      window.Particles.render(ctx);
    }
  }
  
  // 导出全局API
  window.UI = {
    init,
    setScreen,
    getScreen,
    updateGameState,
    handleClick,
    handleHover,
    render,
    buttons,
    getSelectedLevel: () => selectedLevel,
    setSelectedLevel: (level) => { selectedLevel = level; }
  };
  
})();
