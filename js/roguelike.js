/**
 * Roguelike系统
 * 每关随机修饰符，增加游戏变化性
 */

(function() {
  'use strict';
  
  // 修饰符类型
  const modifiers = {
    // 正面修饰符
    lucky_star: {
      id: 'lucky_star',
      name: '幸运星',
      description: '本关得分+50%',
      type: 'positive',
      effect: { scoreMultiplier: 1.5 },
      icon: 'star'
    },
    extra_moves: {
      id: 'extra_moves',
      name: '额外步数',
      description: '本关+5步',
      type: 'positive',
      effect: { extraMoves: 5 },
      icon: 'moves'
    },
    double_energy: {
      id: 'double_energy',
      name: '能量激增',
      description: '宠物能量获取翻倍',
      type: 'positive',
      effect: { energyMultiplier: 2 },
      icon: 'energy'
    },
    starting_bomb: {
      id: 'starting_bomb',
      name: '起始炸弹',
      description: '开局获得1个炸弹',
      type: 'positive',
      effect: { startItems: [{ id: 'bomb', count: 1 }] },
      icon: 'bomb'
    },
    
    // 负面修饰符
    gravity_reverse: {
      id: 'gravity_reverse',
      name: '重力反转',
      description: '元素向上掉落',
      type: 'negative',
      effect: { gravityDirection: 'up' },
      icon: 'gravity'
    },
    poison_fog: {
      id: 'poison_fog',
      name: '毒雾',
      description: '每步-10分',
      type: 'negative',
      effect: { scorePerMove: -10 },
      icon: 'poison'
    },
    time_pressure: {
      id: 'time_pressure',
      name: '时间压力',
      description: '限时30秒',
      type: 'negative',
      effect: { timeLimit: 30 },
      icon: 'time'
    },
    blind_mode: {
      id: 'blind_mode',
      name: '盲眼模式',
      description: '元素类型隐藏',
      type: 'negative',
      effect: { hideTypes: true },
      icon: 'blind'
    },
    
    // 特殊修饰符
    mystery_box: {
      id: 'mystery_box',
      name: '神秘盒子',
      description: '随机效果',
      type: 'special',
      effect: { randomEffect: true },
      icon: 'mystery'
    },
    chain_reaction: {
      id: 'chain_reaction',
      name: '连锁反应',
      description: '消除后自动触发相邻消除',
      type: 'special',
      effect: { chainReaction: true },
      icon: 'chain'
    },
    color_blind: {
      id: 'color_blind',
      name: '色盲模式',
      description: '所有元素变成灰色',
      type: 'special',
      effect: { grayscale: true },
      icon: 'color'
    }
  };
  
  // 当前关卡修饰符
  let currentModifiers = [];
  let activeEffects = {};
  
  // Roguelike状态
  let roguelikeState = {
    currentStage: 1,
    maxStage: 5,
    health: 100,
    maxHealth: 100,
    gold: 0,
    artifacts: [],
    visitedRooms: []
  };
  
  // 初始化Roguelike模式
  function initRoguelike() {
    roguelikeState = {
      currentStage: 1,
      maxStage: 5,
      health: 100,
      maxHealth: 100,
      gold: 0,
      artifacts: [],
      visitedRooms: []
    };
    
    loadRoguelikeData();
    return roguelikeState;
  }
  
  // 加载数据
  function loadRoguelikeData() {
    if (!window.WX || !window.WX.storage) return;
    
    const saved = window.WX.storage.getItem('roguelikeData');
    if (saved) {
      roguelikeState = { ...roguelikeState, ...saved };
    }
  }
  
  // 保存数据
  function saveRoguelikeData() {
    if (!window.WX || !window.WX.storage) return;
    
    window.WX.storage.setItem('roguelikeData', roguelikeState);
  }
  
  // 为关卡生成随机修饰符
  function generateModifiers(level, difficulty = 'normal') {
    currentModifiers = [];
    activeEffects = {};
    
    const positiveCount = difficulty === 'easy' ? 2 : 1;
    const negativeCount = difficulty === 'hard' ? 2 : 1;
    const specialChance = 0.3;
    
    // 添加正面修饰符
    const positiveModifiers = Object.values(modifiers).filter(m => m.type === 'positive');
    for (let i = 0; i < positiveCount; i++) {
      const randomIndex = Math.floor(Math.random() * positiveModifiers.length);
      const modifier = positiveModifiers.splice(randomIndex, 1)[0];
      if (modifier) {
        currentModifiers.push(modifier);
        applyModifierEffects(modifier);
      }
    }
    
    // 添加负面修饰符
    const negativeModifiers = Object.values(modifiers).filter(m => m.type === 'negative');
    for (let i = 0; i < negativeCount; i++) {
      const randomIndex = Math.floor(Math.random() * negativeModifiers.length);
      const modifier = negativeModifiers.splice(randomIndex, 1)[0];
      if (modifier) {
        currentModifiers.push(modifier);
        applyModifierEffects(modifier);
      }
    }
    
    // 随机添加特殊修饰符
    if (Math.random() < specialChance) {
      const specialModifiers = Object.values(modifiers).filter(m => m.type === 'special');
      const randomIndex = Math.floor(Math.random() * specialModifiers.length);
      const modifier = specialModifiers[randomIndex];
      if (modifier) {
        currentModifiers.push(modifier);
        applyModifierEffects(modifier);
      }
    }
    
    return currentModifiers;
  }
  
  // 应用修饰符效果
  function applyModifierEffects(modifier) {
    Object.keys(modifier.effect).forEach(key => {
      activeEffects[key] = modifier.effect[key];
    });
  }
  
  // 获取当前修饰符
  function getCurrentModifiers() {
    return currentModifiers;
  }
  
  // 获取活动效果
  function getActiveEffects() {
    return { ...activeEffects };
  }
  
  // 检查是否有特定效果
  function hasEffect(effectName) {
    return activeEffects[effectName] !== undefined;
  }
  
  // 获取效果值
  function getEffectValue(effectName, defaultValue = null) {
    return activeEffects[effectName] !== undefined ? activeEffects[effectName] : defaultValue;
  }
  
  // 计算得分倍数
  function calculateScoreMultiplier() {
    let multiplier = 1;
    
    if (activeEffects.scoreMultiplier) {
      multiplier *= activeEffects.scoreMultiplier;
    }
    
    // 检查彩蛋加成
    if (window.Eggs) {
      const bonusMultiplier = window.Eggs.getBonusMultiplier();
      multiplier *= bonusMultiplier;
    }
    
    return multiplier;
  }
  
  // 处理移动效果
  function processMoveEffects() {
    const effects = [];
    
    if (activeEffects.scorePerMove) {
      effects.push({
        type: 'score',
        value: activeEffects.scorePerMove,
        message: activeEffects.scorePerMove > 0 ? 
          `获得 ${activeEffects.scorePerMove} 分` : 
          `失去 ${Math.abs(activeEffects.scorePerMove)} 分`
      });
    }
    
    return effects;
  }
  
  // 获取时间限制
  function getTimeLimit() {
    return activeEffects.timeLimit || null;
  }
  
  // 检查重力方向
  function isGravityReversed() {
    return activeEffects.gravityDirection === 'up';
  }
  
  // 检查是否隐藏类型
  function shouldHideTypes() {
    return activeEffects.hideTypes === true;
  }
  
  // 检查是否灰度模式
  function isGrayscale() {
    return activeEffects.grayscale === true;
  }
  
  // 检查连锁反应
  function hasChainReaction() {
    return activeEffects.chainReaction === true;
  }
  
  // 处理神秘盒子
  function processMysteryBox() {
    if (!activeEffects.randomEffect) return null;
    
    const effects = [
      { type: 'bonus', value: 100, message: '获得100分！' },
      { type: 'penalty', value: -50, message: '失去50分...' },
      { type: 'item', id: 'hammer', count: 1, message: '获得锤子x1！' },
      { type: 'energy', value: 30, message: '宠物能量+30！' },
      { type: 'moves', value: 3, message: '获得3步！' }
    ];
    
    return effects[Math.floor(Math.random() * effects.length)];
  }
  
  // Roguelike房间类型
  const roomTypes = {
    battle: {
      name: '战斗',
      description: '完成三消关卡',
      icon: 'sword'
    },
    shop: {
      name: '商店',
      description: '购买道具和升级',
      icon: 'shop'
    },
    treasure: {
      name: '宝箱',
      description: '获得随机奖励',
      icon: 'chest'
    },
    event: {
      name: '事件',
      description: '随机事件',
      icon: 'event'
    },
    boss: {
      name: 'BOSS',
      description: '挑战BOSS',
      icon: 'boss'
    },
    rest: {
      name: '休息',
      description: '恢复生命值',
      icon: 'rest'
    }
  };
  
  // 生成地图
  function generateMap(stage) {
    const rooms = [];
    const roomCount = 4 + stage;
    
    for (let i = 0; i < roomCount; i++) {
      const roomType = getRandomRoomType(i, roomCount, stage);
      rooms.push({
        id: i,
        type: roomType,
        visited: false,
        cleared: false,
        modifiers: roomType === 'battle' ? generateModifiers(stage, stage > 3 ? 'hard' : 'normal') : []
      });
    }
    
    // 最后一个房间是BOSS
    rooms[rooms.length - 1].type = 'boss';
    
    return rooms;
  }
  
  // 获取随机房间类型
  function getRandomRoomType(index, total, stage) {
    if (index === 0) return 'battle';
    if (index === total - 1) return 'boss';
    
    const weights = {
      battle: 40,
      shop: 15,
      treasure: 15,
      event: 20,
      rest: 10
    };
    
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (const [type, weight] of Object.entries(weights)) {
      random -= weight;
      if (random <= 0) return type;
    }
    
    return 'battle';
  }
  
  // 进入房间
  function enterRoom(roomId) {
    const room = roguelikeState.rooms ? roguelikeState.rooms[roomId] : null;
    if (!room) return null;
    
    room.visited = true;
    roguelikeState.currentRoom = roomId;
    
    saveRoguelikeData();
    
    return room;
  }
  
  // 清理房间
  function clearRoom(roomId, success = true) {
    const room = roguelikeState.rooms ? roguelikeState.rooms[roomId] : null;
    if (!room) return;
    
    room.cleared = success;
    
    if (success) {
      // 奖励
      roguelikeState.gold += 10 + Math.floor(Math.random() * 20);
      
      if (room.type === 'boss') {
        roguelikeState.currentStage++;
      }
    }
    
    saveRoguelikeData();
  }
  
  // 受到伤害
  function takeDamage(amount) {
    roguelikeState.health -= amount;
    
    if (roguelikeState.health <= 0) {
      roguelikeState.health = 0;
      // 游戏结束
      return { gameOver: true };
    }
    
    saveRoguelikeData();
    return { health: roguelikeState.health };
  }
  
  // 恢复生命
  function heal(amount) {
    roguelikeState.health = Math.min(roguelikeState.maxHealth, roguelikeState.health + amount);
    saveRoguelikeData();
    return roguelikeState.health;
  }
  
  // 获取Roguelike状态
  function getRoguelikeState() {
    return { ...roguelikeState };
  }
  
  // 添加神器
  function addArtifact(artifact) {
    roguelikeState.artifacts.push(artifact);
    saveRoguelikeData();
  }
  
  // 绘制修饰符图标
  function drawModifierIcon(ctx, x, y, size, modifier) {
    ctx.save();
    
    // 背景
    const bgColor = modifier.type === 'positive' ? '#32CD32' : 
                    modifier.type === 'negative' ? '#FF4500' : '#9370DB';
    
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // 图标
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${size * 0.5}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const icons = {
      star: '★',
      moves: '↻',
      energy: '⚡',
      bomb: '●',
      gravity: '↑',
      poison: '☠',
      time: '⏱',
      blind: '?',
      mystery: '?',
      chain: '∞',
      color: '◐'
    };
    
    ctx.fillText(icons[modifier.icon] || '?', x + size / 2, y + size / 2);
    
    ctx.restore();
  }
  
  // 导出全局API
  window.Roguelike = {
    init: initRoguelike,
    generateModifiers,
    getCurrentModifiers,
    getActiveEffects,
    hasEffect,
    getEffectValue,
    calculateScoreMultiplier,
    processMoveEffects,
    getTimeLimit,
    isGravityReversed,
    shouldHideTypes,
    isGrayscale,
    hasChainReaction,
    processMysteryBox,
    generateMap,
    enterRoom,
    clearRoom,
    takeDamage,
    heal,
    getRoguelikeState,
    addArtifact,
    drawModifierIcon,
    modifiers,
    roomTypes
  };
  
})();
