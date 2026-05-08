/**
 * 彩蛋系统
 * 隐藏关卡/神秘宠物/节日惊喜等
 */

(function() {
  'use strict';
  
  // 彩蛋类型
  const easterEggTypes = {
    // 神秘关卡
    mysteryLevel: {
      id: 'mystery_level',
      name: '神秘关卡',
      description: '元素全部变成金色！',
      trigger: (gameState) => {
        // 每10关后随机出现
        if (gameState.level % 10 === 0 && Math.random() < 0.3) {
          return true;
        }
        return false;
      },
      effect: (gameState) => {
        gameState.goldenMode = true;
        gameState.bonusMultiplier = 2;
        return {
          message: '神秘关卡出现！所有元素变成金色！',
          bonus: '双倍积分'
        };
      }
    },
    
    // 幸运转盘
    luckyWheel: {
      id: 'lucky_wheel',
      name: '幸运转盘',
      description: '每天首次登录弹出转盘',
      trigger: (gameState) => {
        const today = new Date().toDateString();
        return gameState.lastWheelSpin !== today;
      },
      effect: (gameState) => {
        const rewards = [
          { type: 'points', value: 50, name: '50积分' },
          { type: 'points', value: 100, name: '100积分' },
          { type: 'points', value: 200, name: '200积分' },
          { type: 'item', id: 'hammer', count: 1, name: '锤子x1' },
          { type: 'item', id: 'bomb', count: 1, name: '炸弹x1' },
          { type: 'item', id: 'rainbow_candy', count: 1, name: '彩虹糖x1' }
        ];
        
        const reward = rewards[Math.floor(Math.random() * rewards.length)];
        
        // 发放奖励
        if (reward.type === 'points') {
          if (window.Shop) {
            window.Shop.addPoints(reward.value, '幸运转盘');
          }
        } else if (reward.type === 'item') {
          if (window.Shop) {
            const item = window.Shop.getShopData().items.find(i => i.id === reward.id);
            if (item) {
              window.Shop.purchaseItem('items', reward.id, 0); // 免费获得
              // 直接增加数量
              const shopData = window.Shop.getShopData();
              const targetItem = shopData.items.find(i => i.id === reward.id);
              if (targetItem) {
                targetItem.count += reward.count;
              }
            }
          }
        }
        
        gameState.lastWheelSpin = new Date().toDateString();
        
        return {
          message: '恭喜获得奖励！',
          reward: reward
        };
      }
    },
    
    // 连续登录奖励
    loginStreak: {
      id: 'login_streak',
      name: '连续登录奖励',
      description: '连续登录获得特殊奖励',
      trigger: (gameState) => {
        return true; // 在Shop系统中处理
      },
      effect: (gameState) => {
        return null;
      }
    },
    
    // 隐藏宠物：彩虹龙
    hiddenPet: {
      id: 'hidden_pet',
      name: '彩虹龙',
      description: '第50关后随机出现稀有宠物',
      trigger: (gameState) => {
        if (gameState.level >= 50 && !gameState.rainbowDragonFound && Math.random() < 0.05) {
          return true;
        }
        return false;
      },
      effect: (gameState) => {
        gameState.rainbowDragonFound = true;
        
        // 解锁彩虹龙
        if (window.Shop) {
          const shopData = window.Shop.getShopData();
          const pet = shopData.pets.find(p => p.id === 'rainbow_dragon');
          if (pet && !pet.owned) {
            pet.owned = true;
            window.Shop.saveData();
          }
        }
        
        return {
          message: '发现稀有宠物：彩虹龙！',
          pet: 'rainbow_dragon'
        };
      }
    },
    
    // 幸运时刻
    luckyMoment: {
      id: 'lucky_moment',
      name: '幸运时刻',
      description: '连续5关无失败触发双倍积分',
      trigger: (gameState) => {
        return gameState.consecutiveWins >= 5;
      },
      effect: (gameState) => {
        gameState.luckyMomentActive = true;
        gameState.consecutiveWins = 0;
        
        return {
          message: '幸运时刻！接下来30秒双倍积分！',
          duration: 30000
        };
      }
    },
    
    // 开发者彩蛋
    developerEgg: {
      id: 'developer_egg',
      name: '开发者彩蛋',
      description: '点击标题5次触发',
      trigger: (gameState) => {
        return gameState.titleClickCount >= 5;
      },
      effect: (gameState) => {
        gameState.titleClickCount = 0;
        gameState.developerMode = true;
        
        // 奖励
        if (window.Shop) {
          window.Shop.addPoints(500, '发现开发者彩蛋');
        }
        
        return {
          message: '你发现了开发者彩蛋！获得500积分！',
          bonus: 500
        };
      }
    },
    
    // 完美通关奖励
    perfectClear: {
      id: 'perfect_clear',
      name: '完美通关大师',
      description: '完美通关累计10次解锁金色皮肤',
      trigger: (gameState) => {
        return gameState.perfectClearCount >= 10 && !gameState.goldenSkinUnlocked;
      },
      effect: (gameState) => {
        gameState.goldenSkinUnlocked = true;
        
        if (window.Shop) {
          const shopData = window.Shop.getShopData();
          const skin = shopData.skins.find(s => s.id === 'golden_candy');
          if (skin && !skin.owned) {
            skin.owned = true;
            window.Shop.saveData();
          }
        }
        
        return {
          message: '完美通关大师！解锁金色皮肤！',
          skin: 'golden_candy'
        };
      }
    },
    
    // 节日彩蛋
    holidayEgg: {
      id: 'holiday_egg',
      name: '节日惊喜',
      description: '节假日特殊UI和奖励',
      trigger: (gameState) => {
        return isHoliday();
      },
      effect: (gameState) => {
        const holiday = getCurrentHoliday();
        
        if (window.Shop) {
          window.Shop.addPoints(holiday.bonus, `${holiday.name}节日奖励`);
        }
        
        return {
          message: `${holiday.name}快乐！获得${holiday.bonus}积分！`,
          holiday: holiday
        };
      }
    }
  };
  
  // 节日检测
  function isHoliday() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    
    // 定义节日
    const holidays = [
      { month: 1, day: 1 },    // 元旦
      { month: 2, day: 14 },   // 情人节
      { month: 4, day: 1 },    // 愚人节
      { month: 5, day: 1 },    // 劳动节
      { month: 10, day: 1 },   // 国庆节
      { month: 12, day: 25 },  // 圣诞节
      { month: 12, day: 31 }   // 跨年夜
    ];
    
    return holidays.some(h => h.month === month && h.day === day);
  }
  
  // 获取当前节日
  function getCurrentHoliday() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    
    const holidayMap = {
      '1-1': { name: '元旦', bonus: 100, theme: 'newyear' },
      '2-14': { name: '情人节', bonus: 150, theme: 'valentine' },
      '4-1': { name: '愚人节', bonus: 50, theme: 'aprilfool' },
      '5-1': { name: '劳动节', bonus: 100, theme: 'labor' },
      '10-1': { name: '国庆节', bonus: 200, theme: 'national' },
      '12-25': { name: '圣诞节', bonus: 150, theme: 'christmas' },
      '12-31': { name: '跨年夜', bonus: 200, theme: 'newyear' }
    };
    
    const key = `${month}-${day}`;
    return holidayMap[key] || { name: '普通日', bonus: 0, theme: 'normal' };
  }
  
  // 游戏状态
  let gameState = {
    level: 1,
    lastWheelSpin: '',
    titleClickCount: 0,
    consecutiveWins: 0,
    perfectClearCount: 0,
    rainbowDragonFound: false,
    goldenSkinUnlocked: false,
    luckyMomentActive: false,
    developerMode: false,
    goldenMode: false,
    bonusMultiplier: 1
  };
  
  // 加载游戏状态
  function loadGameState() {
    if (!window.WX || !window.WX.storage) return;
    
    const saved = window.WX.storage.getItem('easterEggState');
    if (saved) {
      gameState = { ...gameState, ...saved };
    }
  }
  
  // 保存游戏状态
  function saveGameState() {
    if (!window.WX || !window.WX.storage) return;
    
    window.WX.storage.setItem('easterEggState', gameState);
  }
  
  // 检查并触发彩蛋
  function checkEasterEggs(context = {}) {
    const triggeredEggs = [];
    
    Object.values(easterEggTypes).forEach(egg => {
      // 更新游戏状态
      if (context.level !== undefined) gameState.level = context.level;
      
      // 检查触发条件
      if (egg.trigger(gameState)) {
        const result = egg.effect(gameState);
        if (result) {
          triggeredEggs.push({
            type: egg.id,
            name: egg.name,
            ...result
          });
          
          // 播放彩蛋音效
          if (window.Sound) {
            window.Sound.playSound('easterEgg');
          }
          
          // 创建彩蛋粒子效果
          if (window.Particles && context.centerX !== undefined) {
            window.Particles.createEasterEggEffect(context.centerX, context.centerY);
          }
        }
      }
    });
    
    saveGameState();
    
    return triggeredEggs;
  }
  
  // 更新游戏状态
  function updateGameState(updates) {
    gameState = { ...gameState, ...updates };
    saveGameState();
  }
  
  // 标题点击
  function onTitleClick() {
    gameState.titleClickCount++;
    
    if (gameState.titleClickCount >= 5) {
      const eggs = checkEasterEggs();
      return eggs.find(e => e.type === 'developer_egg') || null;
    }
    
    return null;
  }
  
  // 关卡胜利
  function onLevelWin(isPerfect) {
    gameState.consecutiveWins++;
    
    if (isPerfect) {
      gameState.perfectClearCount++;
    }
    
    return checkEasterEggs();
  }
  
  // 关卡失败
  function onLevelFail() {
    gameState.consecutiveWins = 0;
  }
  
  // 获取幸运转盘奖励
  function spinLuckyWheel() {
    gameState.lastWheelSpin = new Date().toDateString();
    saveGameState();
    
    return easterEggTypes.luckyWheel.effect(gameState);
  }
  
  // 检查是否是金色模式
  function isGoldenMode() {
    return gameState.goldenMode;
  }
  
  // 设置金色模式
  function setGoldenMode(enabled) {
    gameState.goldenMode = enabled;
    saveGameState();
  }
  
  // 获取奖励倍数
  function getBonusMultiplier() {
    return gameState.bonusMultiplier;
  }
  
  // 重置奖励倍数
  function resetBonusMultiplier() {
    gameState.bonusMultiplier = 1;
    saveGameState();
  }
  
  // 获取当前节日主题
  function getHolidayTheme() {
    if (isHoliday()) {
      return getCurrentHoliday().theme;
    }
    return null;
  }
  
  // 获取游戏状态
  function getGameState() {
    return { ...gameState };
  }
  
  // 初始化
  loadGameState();
  
  // 导出全局API
  window.Eggs = {
    checkEasterEggs,
    updateGameState,
    onTitleClick,
    onLevelWin,
    onLevelFail,
    spinLuckyWheel,
    isGoldenMode,
    setGoldenMode,
    getBonusMultiplier,
    resetBonusMultiplier,
    getHolidayTheme,
    getGameState,
    isHoliday,
    getCurrentHoliday
  };
  
})();
