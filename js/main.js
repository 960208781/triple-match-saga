/**
 * 主入口文件
 * 游戏主循环和状态管理
 */

(function() {
  'use strict';
  
  // 游戏状态
  const game = {
    canvas: null,
    ctx: null,
    width: 375,
    height: 667,
    dpr: 2,
    
    // 游戏状态
    state: 'menu', // menu, levelSelect, game, pause, result, shop, settings
    currentLevel: 1,
    maxUnlockedLevel: 1,
    score: 0,
    moves: 0,
    combo: 0,
    stars: 0,
    
    // 棋盘状态
    boardState: null,
    
    // 时间相关
    lastTime: 0,
    deltaTime: 0,
    gameTime: 0,
    
    // 触摸状态
    touchStart: null,
    isDragging: false,
    selectedItem: null,
    
    // 设置
    settings: {
      musicVolume: 0.5,
      sfxVolume: 0.7,
      isMuted: false
    }
  };
  
  // 初始化游戏
  function init() {
    // 获取画布
    if (typeof wx !== 'undefined') {
      game.canvas = window.canvas || wx.createCanvas();
      game.ctx = window.ctx || game.canvas.getContext('2d');
    } else {
      game.canvas = document.getElementById('gameCanvas');
      if (!game.canvas) {
        console.error('Canvas not found');
        return;
      }
      game.ctx = game.canvas.getContext('2d');
    }
    
    // 设置画布尺寸
    setupCanvas();
    
    // 初始化各模块
    initModules();
    
    // 加载游戏数据
    loadGameData();
    
    // 设置事件监听
    setupEventListeners();
    
    // 开始游戏循环
    requestAnimationFrame(gameLoop);
    
    console.log('三消奇缘 - Triple Match Saga 初始化完成');
  }
  
  // 设置画布
  function setupCanvas() {
    const systemInfo = window.WX ? window.WX.getSystemInfo() : {
      windowWidth: window.innerWidth || 375,
      windowHeight: window.innerHeight || 667,
      pixelRatio: window.devicePixelRatio || 2
    };
    
    game.width = systemInfo.windowWidth;
    game.height = systemInfo.windowHeight;
    game.dpr = systemInfo.pixelRatio || 2;
    
    game.canvas.width = game.width * game.dpr;
    game.canvas.height = game.height * game.dpr;
    game.canvas.style.width = game.width + 'px';
    game.canvas.style.height = game.height + 'px';
    
    game.ctx.scale(game.dpr, game.dpr);
    
    // 初始化UI
    if (window.UI) {
      window.UI.init(game.width, game.height);
    }
  }
  
  // 初始化模块
  function initModules() {
    // 初始化音效
    if (window.Sound) {
      window.Sound.init();
    }
    
    // 初始化商城
    if (window.Shop) {
      // 商城已在加载时初始化
    }
    
    // 初始化宠物
    if (window.Pet) {
      window.Pet.init('fire_dragon');
    }
    
    // 预渲染精灵
    if (window.Candy) {
      window.Candy.prerender(48);
    }
    if (window.Animals) {
      window.Animals.prerender(48);
    }
    if (window.Desserts) {
      window.Desserts.prerender(48);
    }
    if (window.Fruits) {
      window.Fruits.prerender(48);
    }
  }
  
  // 加载游戏数据
  function loadGameData() {
    if (!window.WX || !window.WX.storage) return;
    
    const saved = window.WX.storage.getItem('gameData');
    if (saved) {
      game.currentLevel = saved.currentLevel || 1;
      game.maxUnlockedLevel = saved.maxUnlockedLevel || 1;
      game.settings = { ...game.settings, ...saved.settings };
    }
  }
  
  // 保存游戏数据
  function saveGameData() {
    if (!window.WX || !window.WX.storage) return;
    
    window.WX.storage.setItem('gameData', {
      currentLevel: game.currentLevel,
      maxUnlockedLevel: game.maxUnlockedLevel,
      settings: game.settings
    });
  }
  
  // 设置事件监听
  function setupEventListeners() {
    if (typeof wx !== 'undefined') {
      // 微信小游戏事件
      wx.onTouchStart(handleTouchStart);
      wx.onTouchMove(handleTouchMove);
      wx.onTouchEnd(handleTouchEnd);
    } else {
      // Web事件
      game.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleTouchStart(e.touches[0]);
      });
      game.canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        handleTouchMove(e.touches[0]);
      });
      game.canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        handleTouchEnd(e.changedTouches[0]);
      });
      
      // 鼠标事件（用于PC测试）
      game.canvas.addEventListener('mousedown', (e) => {
        handleTouchStart({ clientX: e.clientX, clientY: e.clientY });
      });
      game.canvas.addEventListener('mousemove', (e) => {
        handleTouchMove({ clientX: e.clientX, clientY: e.clientY });
      });
      game.canvas.addEventListener('mouseup', (e) => {
        handleTouchEnd({ clientX: e.clientX, clientY: e.clientY });
      });
    }
  }
  
  // 处理触摸开始
  function handleTouchStart(touch) {
    const x = touch.clientX || touch.pageX || 0;
    const y = touch.clientY || touch.pageY || 0;
    
    game.touchStart = { x, y };
    game.isDragging = true;
    
    // 处理UI点击
    if (window.UI) {
      const buttonId = window.UI.handleClick(x, y);
      if (buttonId) {
        handleButtonClick(buttonId);
        return;
      }
    }
    
    // 游戏中的触摸处理
    if (game.state === 'game' && window.Board) {
      const result = window.Board.handleClick(x, y);
      if (result) {
        handleBoardClick(result);
      }
    }
  }
  
  // 处理触摸移动
  function handleTouchMove(touch) {
    if (!game.isDragging || !game.touchStart) return;
    
    const x = touch.clientX || touch.pageX || 0;
    const y = touch.clientY || touch.pageY || 0;
    
    // 更新UI悬停状态
    if (window.UI) {
      window.UI.handleHover(x, y);
    }
  }
  
  // 处理触摸结束
  function handleTouchEnd(touch) {
    game.isDragging = false;
    game.touchStart = null;
  }
  
  // 处理按钮点击
  function handleButtonClick(buttonId) {
    // 播放点击音效
    if (window.Sound) {
      window.Sound.playSound('click');
    }
    
    // 震动反馈
    if (window.WX && window.WX.vibrate) {
      window.WX.vibrate.short();
    }
    
    switch (buttonId) {
      // 主菜单按钮
      case 'play':
        game.state = 'levelSelect';
        if (window.UI) window.UI.setScreen('levelSelect');
        break;
      case 'shop':
        game.state = 'shop';
        if (window.UI) window.UI.setScreen('shop');
        break;
      case 'settings':
        game.state = 'settings';
        if (window.UI) window.UI.setScreen('settings');
        break;
        
      // 游戏按钮
      case 'pause':
        game.state = 'pause';
        if (window.UI) window.UI.setScreen('pause');
        break;
        
      // 道具按钮
      case 'item_hammer':
      case 'item_bomb':
      case 'item_refresh':
        const itemId = buttonId.replace('item_', '');
        game.selectedItem = itemId;
        break;
        
      // 暂停菜单按钮
      case 'resume':
        game.state = 'game';
        if (window.UI) window.UI.setScreen('game');
        break;
      case 'quit':
        game.state = 'menu';
        if (window.UI) window.UI.setScreen('menu');
        break;
        
      // 结果界面按钮
      case 'retry':
        startLevel(game.currentLevel);
        break;
      case 'next':
        startLevel(game.currentLevel + 1);
        break;
      case 'menu':
        game.state = 'menu';
        if (window.UI) window.UI.setScreen('menu');
        break;
        
      // 商城按钮
      case 'back':
        game.state = 'menu';
        if (window.UI) window.UI.setScreen('menu');
        break;
    }
  }
  
  // 处理棋盘点击
  function handleBoardClick(result) {
    if (result.type === 'select') {
      // 选择元素
    } else if (result.type === 'match') {
      // 匹配成功
      game.score += result.score;
      game.combo = result.combo;
      
      // 更新UI状态
      if (window.UI) {
        window.UI.updateGameState({
          score: game.score,
          combo: game.combo
        });
      }
      
      // 增加宠物能量
      if (window.Pet) {
        window.Pet.addEnergy(result.matches[0].cells.length * 5);
      }
      
      // 更新任务进度
      if (window.Shop) {
        window.Shop.updateTaskProgress('combo_master', result.combo >= 5 ? 1 : 0);
      }
    } else if (result.type === 'invalid') {
      // 无效移动
    }
  }
  
  // 开始关卡
  function startLevel(level) {
    if (level < 1 || level > 80) return;
    
    game.currentLevel = level;
    game.state = 'game';
    game.score = 0;
    game.combo = 0;
    game.stars = 0;
    
    // 获取主题
    const theme = window.Themes ? window.Themes.getThemeByLevel(level) : 'candy';
    
    // 初始化棋盘
    if (window.Board) {
      game.boardState = window.Board.init(level, theme);
      game.moves = game.boardState.moves;
      
      // 设置回调
      window.Board.setCallbacks({
        onScoreChange: (score) => {
          game.score = score;
          if (window.UI) {
            window.UI.updateGameState({ score });
          }
        },
        onMovesChange: (moves) => {
          game.moves = moves;
          if (window.UI) {
            window.UI.updateGameState({ moves });
          }
        },
        onCombo: (combo) => {
          game.combo = combo;
          if (window.UI) {
            window.UI.updateGameState({ combo });
          }
        },
        onLevelComplete: (stars, score) => {
          onLevelComplete(stars, score);
        },
        onLevelFail: (score) => {
          onLevelFail(score);
        }
      });
    }
    
    // 初始化宠物
    if (window.Pet) {
      window.Pet.init('fire_dragon');
    }
    
    // 生成Roguelike修饰符
    if (window.Roguelike) {
      window.Roguelike.generateModifiers(level);
    }
    
    // 更新UI
    if (window.UI) {
      window.UI.setScreen('game');
      window.UI.updateGameState({
        level,
        score: game.score,
        moves: game.moves,
        combo: game.combo
      });
    }
    
    // 播放背景音乐
    if (window.Sound) {
      window.Sound.playMusic('game');
    }
  }
  
  // 关卡完成
  function onLevelComplete(stars, score) {
    game.stars = stars;
    game.state = 'result';
    
    // 更新最大解锁关卡
    if (game.currentLevel >= game.maxUnlockedLevel) {
      game.maxUnlockedLevel = Math.min(80, game.currentLevel + 1);
    }
    
    // 添加积分
    if (window.Shop) {
      window.Shop.addPoints(score, `关卡 ${game.currentLevel} 完成`);
      
      // 更新任务进度
      window.Shop.updateTaskProgress('complete_levels', 1);
      if (stars === 3) {
        window.Shop.updateTaskProgress('perfect_clear', 1);
      }
    }
    
    // 检查彩蛋
    if (window.Eggs) {
      const eggs = window.Eggs.onLevelWin(stars === 3);
      // 处理彩蛋...
    }
    
    // 播放胜利音效
    if (window.Sound) {
      window.Sound.playSound('levelComplete');
    }
    
    // 创建胜利粒子效果
    if (window.Particles) {
      window.Particles.createVictoryEffect(game.width / 2, game.height / 2);
    }
    
    // 保存数据
    saveGameData();
    
    // 更新UI
    if (window.UI) {
      window.UI.setScreen('result');
      window.UI.updateGameState({
        stars,
        score
      });
    }
  }
  
  // 关卡失败
  function onLevelFail(score) {
    game.stars = 0;
    game.state = 'result';
    
    // 检查彩蛋
    if (window.Eggs) {
      window.Eggs.onLevelFail();
    }
    
    // 播放失败音效
    if (window.Sound) {
      window.Sound.playSound('levelFail');
    }
    
    // 创建失败粒子效果
    if (window.Particles) {
      window.Particles.createFailEffect(game.width / 2, game.height / 2);
    }
    
    // 更新UI
    if (window.UI) {
      window.UI.setScreen('result');
      window.UI.updateGameState({
        stars: 0,
        score
      });
    }
  }
  
  // 游戏循环
  function gameLoop(timestamp) {
    // 计算帧时间
    game.deltaTime = timestamp - game.lastTime;
    game.lastTime = timestamp;
    game.gameTime += game.deltaTime;
    
    // 更新
    update(game.deltaTime);
    
    // 渲染
    render();
    
    // 继续循环
    requestAnimationFrame(gameLoop);
  }
  
  // 更新
  function update(deltaTime) {
    // 更新粒子
    if (window.Particles) {
      window.Particles.update(deltaTime);
    }
    
    // 更新棋盘状态
    if (game.state === 'game' && window.Board) {
      game.boardState = window.Board.getBoardState();
    }
  }
  
  // 渲染
  function render() {
    // 清空画布
    if (!game.ctx || !game.canvas) return;
    game.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
    
    // 渲染UI
    if (window.UI) {
      window.UI.render(game.ctx, game.boardState);
    }
  }
  
  // 导出全局函数
  window.gameInit = init;
  window.update = update;
  window.render = render;
  window.handleTouchStart = handleTouchStart;
  window.handleTouchMove = handleTouchMove;
  window.handleTouchEnd = handleTouchEnd;
  
  // 游戏控制函数
  window.Game = {
    init,
    startLevel,
    getState: () => game.state,
    getCurrentLevel: () => game.currentLevel,
    getMaxUnlockedLevel: () => game.maxUnlockedLevel,
    getScore: () => game.score,
    getMoves: () => game.moves
  };
  
  // 自动初始化（Web环境）
  if (typeof wx === 'undefined') {
    if (document.readyState === 'complete') {
      init();
    } else {
      window.addEventListener('load', init);
    }
  }
  
})();
