/**
 * 合成进化系统
 * 特殊糖果合成升级，毁灭之光全屏消除
 */

(function() {
  'use strict';
  
  // 进化类型
  const evolutionTypes = {
    // 基础进化
    striped_h: {
      id: 'striped_h',
      name: '水平条纹',
      description: '消除整行',
      recipe: { match4: true },
      effect: 'clearRow'
    },
    striped_v: {
      id: 'striped_v',
      name: '垂直条纹',
      description: '消除整列',
      recipe: { match4: true },
      effect: 'clearCol'
    },
    wrapped: {
      id: 'wrapped',
      name: '包装糖果',
      description: '消除周围3x3',
      recipe: { matchLorT: true },
      effect: 'clear3x3'
    },
    
    // 高级进化
    color_bomb: {
      id: 'color_bomb',
      name: '彩色炸弹',
      description: '消除所有同色',
      recipe: { match5: true },
      effect: 'clearColor'
    },
    
    // 终极进化
    destruction_light: {
      id: 'destruction_light',
      name: '毁灭之光',
      description: '全屏消除',
      recipe: { special: 'bomb+bomb' },
      effect: 'clearAll'
    },
    rainbow_wave: {
      id: 'rainbow_wave',
      name: '彩虹波',
      description: '消除所有元素',
      recipe: { special: 'bomb+striped' },
      effect: 'clearAllColor'
    },
    supernova: {
      id: 'supernova',
      name: '超新星',
      description: '大范围爆炸',
      recipe: { special: 'bomb+wrapped' },
      effect: 'clear5x5'
    }
  };
  
  // 合成配方
  const synthesisRecipes = [
    {
      ingredients: ['striped_h', 'striped_v'],
      result: 'wrapped',
      name: '十字合成'
    },
    {
      ingredients: ['striped_h', 'wrapped'],
      result: 'color_bomb',
      name: '条纹包装合成'
    },
    {
      ingredients: ['striped_v', 'wrapped'],
      result: 'color_bomb',
      name: '条纹包装合成'
    },
    {
      ingredients: ['color_bomb', 'color_bomb'],
      result: 'destruction_light',
      name: '毁灭之光'
    },
    {
      ingredients: ['color_bomb', 'striped_h'],
      result: 'rainbow_wave',
      name: '彩虹波'
    },
    {
      ingredients: ['color_bomb', 'striped_v'],
      result: 'rainbow_wave',
      name: '彩虹波'
    },
    {
      ingredients: ['color_bomb', 'wrapped'],
      result: 'supernova',
      name: '超新星'
    }
  ];
  
  // 进化等级
  const evolutionLevels = [
    { level: 1, name: '初级', bonus: 1.0 },
    { level: 2, name: '中级', bonus: 1.2 },
    { level: 3, name: '高级', bonus: 1.5 },
    { level: 4, name: '大师', bonus: 2.0 },
    { level: 5, name: '传奇', bonus: 3.0 }
  ];
  
  // 进化经验
  let evolutionExp = {};
  let evolutionLevel = {};
  
  // 初始化
  function init() {
    evolutionExp = {};
    evolutionLevel = {};
    
    Object.keys(evolutionTypes).forEach(type => {
      evolutionExp[type] = 0;
      evolutionLevel[type] = 1;
    });
    
    loadEvolutionData();
  }
  
  // 加载数据
  function loadEvolutionData() {
    if (!window.WX || !window.WX.storage) return;
    
    const saved = window.WX.storage.getItem('evolutionData');
    if (saved) {
      evolutionExp = saved.exp || evolutionExp;
      evolutionLevel = saved.level || evolutionLevel;
    }
  }
  
  // 保存数据
  function saveEvolutionData() {
    if (!window.WX || !window.WX.storage) return;
    
    window.WX.storage.setItem('evolutionData', {
      exp: evolutionExp,
      level: evolutionLevel
    });
  }
  
  // 检查合成
  function checkSynthesis(special1, special2) {
    if (!special1 || !special2) return null;
    
    for (const recipe of synthesisRecipes) {
      if ((recipe.ingredients.includes(special1) && recipe.ingredients.includes(special2)) &&
          (special1 !== special2 || recipe.ingredients.filter(i => i === special1).length === 2)) {
        return {
          success: true,
          result: evolutionTypes[recipe.result],
          recipe: recipe
        };
      }
    }
    
    return null;
  }
  
  // 执行进化效果
  function executeEvolution(type, boardState, centerRow, centerCol) {
    const evolution = evolutionTypes[type];
    if (!evolution) return null;
    
    const level = evolutionLevel[type] || 1;
    const levelBonus = evolutionLevels.find(l => l.level === level)?.bonus || 1;
    
    let affectedCells = [];
    let score = 0;
    
    switch (evolution.effect) {
      case 'clearRow':
        // 清除整行
        for (let col = 0; col < boardState.cols; col++) {
          affectedCells.push({ row: centerRow, col });
        }
        score = affectedCells.length * 10 * levelBonus;
        break;
        
      case 'clearCol':
        // 清除整列
        for (let row = 0; row < boardState.rows; row++) {
          affectedCells.push({ row, col: centerCol });
        }
        score = affectedCells.length * 10 * levelBonus;
        break;
        
      case 'clear3x3':
        // 清除3x3范围
        for (let row = centerRow - 1; row <= centerRow + 1; row++) {
          for (let col = centerCol - 1; col <= centerCol + 1; col++) {
            if (row >= 0 && row < boardState.rows && col >= 0 && col < boardState.cols) {
              affectedCells.push({ row, col });
            }
          }
        }
        score = affectedCells.length * 15 * levelBonus;
        break;
        
      case 'clearColor':
        // 清除所有同色
        const targetType = boardState.board[centerRow]?.[centerCol]?.type;
        if (targetType) {
          for (let row = 0; row < boardState.rows; row++) {
            for (let col = 0; col < boardState.cols; col++) {
              if (boardState.board[row]?.[col]?.type === targetType) {
                affectedCells.push({ row, col });
              }
            }
          }
        }
        score = affectedCells.length * 20 * levelBonus;
        break;
        
      case 'clearAll':
        // 毁灭之光：全屏消除
        for (let row = 0; row < boardState.rows; row++) {
          for (let col = 0; col < boardState.cols; col++) {
            affectedCells.push({ row, col });
          }
        }
        score = affectedCells.length * 50 * levelBonus;
        
        // 特效
        if (window.Particles) {
          window.Particles.createVictoryEffect(
            boardState.cellSize * boardState.cols / 2,
            boardState.cellSize * boardState.rows / 2
          );
        }
        break;
        
      case 'clearAllColor':
        // 彩虹波：消除所有元素
        for (let row = 0; row < boardState.rows; row++) {
          for (let col = 0; col < boardState.cols; col++) {
            affectedCells.push({ row, col });
          }
        }
        score = affectedCells.length * 40 * levelBonus;
        break;
        
      case 'clear5x5':
        // 超新星：5x5范围
        for (let row = centerRow - 2; row <= centerRow + 2; row++) {
          for (let col = centerCol - 2; col <= centerCol + 2; col++) {
            if (row >= 0 && row < boardState.rows && col >= 0 && col < boardState.cols) {
              affectedCells.push({ row, col });
            }
          }
        }
        score = affectedCells.length * 25 * levelBonus;
        break;
    }
    
    // 增加进化经验
    addEvolutionExp(type, affectedCells.length);
    
    // 播放特效音效
    if (window.Sound) {
      window.Sound.playSound('special');
    }
    
    return {
      type,
      evolution,
      affectedCells,
      score: Math.floor(score),
      level,
      levelBonus
    };
  }
  
  // 增加进化经验
  function addEvolutionExp(type, amount) {
    if (!evolutionExp[type]) {
      evolutionExp[type] = 0;
      evolutionLevel[type] = 1;
    }
    
    evolutionExp[type] += amount;
    
    // 检查升级
    const currentLevel = evolutionLevel[type];
    const expNeeded = currentLevel * 100;
    
    while (evolutionExp[type] >= expNeeded) {
      evolutionExp[type] -= expNeeded;
      evolutionLevel[type]++;
    }
    
    saveEvolutionData();
  }
  
  // 获取进化等级
  function getEvolutionLevel(type) {
    return {
      level: evolutionLevel[type] || 1,
      exp: evolutionExp[type] || 0,
      expNeeded: (evolutionLevel[type] || 1) * 100
    };
  }
  
  // 获取所有进化等级
  function getAllEvolutionLevels() {
    const result = {};
    Object.keys(evolutionTypes).forEach(type => {
      result[type] = getEvolutionLevel(type);
    });
    return result;
  }
  
  // 绘制进化效果
  function drawEvolutionEffect(ctx, x, y, size, type, progress = 0) {
    const evolution = evolutionTypes[type];
    if (!evolution) return;
    
    ctx.save();
    
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    
    // 光环效果
    const glowSize = size * (1 + Math.sin(progress * Math.PI * 2) * 0.1);
    
    const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowSize);
    glow.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    glow.addColorStop(0.5, 'rgba(255, 215, 0, 0.4)');
    glow.addColorStop(1, 'rgba(255, 215, 0, 0)');
    
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(centerX, centerY, glowSize, 0, Math.PI * 2);
    ctx.fill();
    
    // 根据类型绘制不同效果
    switch (type) {
      case 'destruction_light':
        drawDestructionLight(ctx, centerX, centerY, size, progress);
        break;
      case 'rainbow_wave':
        drawRainbowWave(ctx, centerX, centerY, size, progress);
        break;
      case 'supernova':
        drawSupernova(ctx, centerX, centerY, size, progress);
        break;
      default:
        drawBasicEffect(ctx, centerX, centerY, size, type);
    }
    
    ctx.restore();
  }
  
  // 绘制毁灭之光
  function drawDestructionLight(ctx, cx, cy, size, progress) {
    // 光束
    const beamCount = 8;
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    
    for (let i = 0; i < beamCount; i++) {
      const angle = (i / beamCount) * Math.PI * 2 + progress * Math.PI;
      const length = size * (0.8 + Math.sin(progress * Math.PI * 4) * 0.2);
      
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(
        cx + Math.cos(angle) * length,
        cy + Math.sin(angle) * length
      );
      ctx.stroke();
    }
    
    // 中心光球
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.3);
    gradient.addColorStop(0, '#FFFFFF');
    gradient.addColorStop(0.5, '#FFD700');
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // 绘制彩虹波
  function drawRainbowWave(ctx, cx, cy, size, progress) {
    const colors = ['#FF4757', '#FF9F43', '#FFD32A', '#26DE81', '#45AAF2', '#A55EEA'];
    const waveRadius = size * (0.3 + progress * 0.7);
    
    colors.forEach((color, i) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 1 - progress * 0.5;
      
      ctx.beginPath();
      ctx.arc(cx, cy, waveRadius * (1 - i * 0.1), 0, Math.PI * 2);
      ctx.stroke();
    });
    
    ctx.globalAlpha = 1;
  }
  
  // 绘制超新星
  function drawSupernova(ctx, cx, cy, size, progress) {
    // 爆炸效果
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const dist = size * 0.3 * progress;
      
      ctx.fillStyle = `hsl(${(i / particleCount) * 360}, 100%, 50%)`;
      ctx.beginPath();
      ctx.arc(
        cx + Math.cos(angle) * dist,
        cy + Math.sin(angle) * dist,
        size * 0.05 * (1 - progress * 0.5),
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    
    // 中心闪光
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.15 * (1 - progress), 0, Math.PI * 2);
    ctx.fill();
  }
  
  // 绘制基础效果
  function drawBasicEffect(ctx, cx, cy, size, type) {
    let color = '#FFD700';
    
    switch (type) {
      case 'striped_h':
      case 'striped_v':
        color = '#00CED1';
        break;
      case 'wrapped':
        color = '#FF69B4';
        break;
      case 'color_bomb':
        color = '#9370DB';
        break;
    }
    
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.4);
    gradient.addColorStop(0, '#FFFFFF');
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // 获取进化类型配置
  function getEvolutionType(type) {
    return evolutionTypes[type] || null;
  }
  
  // 获取所有进化类型
  function getAllEvolutionTypes() {
    return { ...evolutionTypes };
  }
  
  // 获取合成配方
  function getSynthesisRecipes() {
    return [...synthesisRecipes];
  }
  
  // 初始化
  init();
  
  // 导出全局API
  window.Evolve = {
    init,
    checkSynthesis,
    executeEvolution,
    getEvolutionLevel,
    getAllEvolutionLevels,
    drawEvolutionEffect,
    getEvolutionType,
    getAllEvolutionTypes,
    getSynthesisRecipes,
    evolutionTypes,
    evolutionLevels
  };
  
})();
